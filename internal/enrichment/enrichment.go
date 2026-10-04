package enrichment

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

type Word struct {
	ID                 string  `json:"id"`
	Word               string  `json:"word"`
	Phonetic           string  `json:"phonetic"`
	Pos                string  `json:"pos"`
	Meaning            string  `json:"meaning"`
	Letter             string  `json:"letter"`
	Example            string  `json:"example,omitempty"`
	ExampleTranslation string  `json:"exampleTranslation,omitempty"`
	Topic              string  `json:"topic,omitempty"`
	Grade              string  `json:"grade,omitempty"`
	Unit               string  `json:"unit,omitempty"`
	Senses             []Sense `json:"senses,omitempty"`
}

type Sense struct {
	ID                 string `json:"id"`
	Meaning            string `json:"meaning"`
	Example            string `json:"example"`
	ExampleTranslation string `json:"exampleTranslation"`
}

type Patch struct {
	ID                 string  `json:"id"`
	Word               string  `json:"word,omitempty"`
	Meaning            string  `json:"meaning,omitempty"`
	Pos                string  `json:"pos,omitempty"`
	Phonetic           string  `json:"phonetic,omitempty"`
	Example            string  `json:"example"`
	ExampleTranslation string  `json:"exampleTranslation"`
	Topic              string  `json:"topic"`
	Grade              string  `json:"grade"`
	Unit               string  `json:"unit"`
	Senses             []Sense `json:"senses,omitempty"`
}

// Retirement marks a dataset entry that a dedup pass removes. The file holding
// these records is both the deny-list the synchronizer applies at the end of a
// run and the review trail for every removal: ReplacedBy names the surviving
// entry that kept the meanings, Reason explains why the row was a duplicate.
type Retirement struct {
	ID         string `json:"id"`
	ReplacedBy string `json:"replacedBy,omitempty"`
	Reason     string `json:"reason,omitempty"`
}

// Retirements is a loaded retirement patch indexed by normalized id.
type Retirements map[string]Retirement

func normalizeID(id string) string {
	return strings.ToLower(strings.TrimSpace(id))
}

// Apply applies every patch in patchPath to datasetPath.
func Apply(datasetPath, patchPath string) (int, error) {
	return ApplyRetiring(datasetPath, patchPath, nil)
}

// ApplyRetiring behaves like Apply, except that patches addressing a retired id
// are skipped instead of failing. Retired entries are dropped from the dataset by
// ApplyRetirements, so the legacy patch entries that used to enrich them would
// otherwise make a second synchronization run fail with "word not found".
// Skipping them keeps the pipeline idempotent: running the batch list again after
// a dedup pass is a no-op rather than an error.
func ApplyRetiring(datasetPath, patchPath string, retired Retirements) (int, error) {
	words, err := read[Word](datasetPath)
	if err != nil {
		return 0, err
	}
	patches, err := read[Patch](patchPath)
	if err != nil {
		return 0, err
	}
	index := map[string]int{}
	for i, word := range words {
		index[normalizeID(word.ID)] = i
	}
	updated := 0
	seen := map[string]bool{}
	for _, patch := range patches {
		id := normalizeID(patch.ID)
		if id == "" || seen[id] {
			return 0, fmt.Errorf("invalid or duplicate patch id %q", patch.ID)
		}
		seen[id] = true
		if _, gone := retired[id]; gone {
			continue
		}
		i, ok := index[id]
		if !ok {
			return 0, fmt.Errorf("word %q not found in %s", patch.ID, datasetPath)
		}
		if patch.Example != "" {
			words[i].Example = patch.Example
		}
		if patch.Word != "" {
			words[i].Word = patch.Word
		}
		if patch.Meaning != "" {
			words[i].Meaning = patch.Meaning
		}
		if patch.Pos != "" {
			words[i].Pos = patch.Pos
		}
		if patch.Phonetic != "" {
			words[i].Phonetic = patch.Phonetic
		}
		if patch.ExampleTranslation != "" {
			words[i].ExampleTranslation = patch.ExampleTranslation
		}
		if patch.Topic != "" {
			words[i].Topic = patch.Topic
		}
		if patch.Grade != "" {
			words[i].Grade = patch.Grade
		}
		if patch.Unit != "" {
			words[i].Unit = patch.Unit
		}
		if len(patch.Senses) > 0 {
			words[i].Senses = patch.Senses
		}
		updated++
	}
	return updated, write[Word](datasetPath, words)
}

// RetirementsResult reports how an ApplyRetirements run went.
type RetirementsResult struct {
	Removed int `json:"removed"`
	Absent  int `json:"absent"`
}

// ReadRetirements loads a retirement patch and indexes it by normalized id.
func ReadRetirements(path string) (Retirements, error) {
	items, err := read[Retirement](path)
	if err != nil {
		return nil, err
	}
	retired := Retirements{}
	for _, item := range items {
		id := normalizeID(item.ID)
		if id == "" {
			return nil, fmt.Errorf("retirement in %s is missing its id", path)
		}
		if _, exists := retired[id]; exists {
			return nil, fmt.Errorf("duplicate retirement id %q in %s", item.ID, path)
		}
		retired[id] = item
	}
	return retired, nil
}

// ApplyRetirements drops every dataset entry whose id is listed in patchPath and
// writes the dataset back. It is idempotent: ids that are already gone are
// counted in Absent instead of turning into an error, so re-running the
// synchronization pipeline is always safe.
func ApplyRetirements(datasetPath, patchPath string) (RetirementsResult, error) {
	words, err := read[Word](datasetPath)
	if err != nil {
		return RetirementsResult{}, err
	}
	retired, err := ReadRetirements(patchPath)
	if err != nil {
		return RetirementsResult{}, err
	}
	kept := make([]Word, 0, len(words))
	seen := map[string]bool{}
	result := RetirementsResult{}
	for _, word := range words {
		id := normalizeID(word.ID)
		if _, gone := retired[id]; gone {
			if !seen[id] {
				seen[id] = true
				result.Removed++
			}
			continue
		}
		kept = append(kept, word)
	}
	result.Absent = len(retired) - result.Removed
	if err := write[Word](datasetPath, kept); err != nil {
		return RetirementsResult{}, err
	}
	return result, nil
}

func write[T any](path string, items []T) error {
	raw, err := json.MarshalIndent(items, "", "  ")
	if err != nil {
		return err
	}
	raw = append(raw, '\n')
	return os.WriteFile(path, raw, 0644)
}

func read[T any](path string) ([]T, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var items []T
	if err := json.Unmarshal(raw, &items); err != nil {
		return nil, err
	}
	return items, nil
}
