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

func Apply(datasetPath, patchPath string) (int, error) {
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
		index[strings.ToLower(strings.TrimSpace(word.ID))] = i
	}
	updated := 0
	seen := map[string]bool{}
	for _, patch := range patches {
		id := strings.ToLower(strings.TrimSpace(patch.ID))
		if id == "" || seen[id] {
			return 0, fmt.Errorf("invalid or duplicate patch id %q", patch.ID)
		}
		seen[id] = true
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
	raw, err := json.MarshalIndent(words, "", "  ")
	if err != nil {
		return 0, err
	}
	raw = append(raw, '\n')
	if err := os.WriteFile(datasetPath, raw, 0644); err != nil {
		return 0, err
	}
	return updated, nil
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
