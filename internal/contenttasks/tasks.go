package contenttasks

import (
	"encoding/json"
	"os"
	"regexp"
	"sort"
	"strings"
)

var separators = regexp.MustCompile(`[；;/]+|(?:^|\s)\d+[、.]`)

type Word struct {
	ID                 string  `json:"id"`
	Word               string  `json:"word"`
	Meaning            string  `json:"meaning"`
	Phonetic           string  `json:"phonetic"`
	Example            string  `json:"example"`
	ExampleTranslation string  `json:"exampleTranslation"`
	Senses             []Sense `json:"senses"`
}
type Sense struct {
	ID                 string `json:"id"`
	Meaning            string `json:"meaning"`
	Example            string `json:"example"`
	ExampleTranslation string `json:"exampleTranslation"`
}
type Task struct {
	ID       string   `json:"id"`
	Word     string   `json:"word"`
	Meaning  string   `json:"meaning"`
	Missing  []string `json:"missing"`
	Senses   []string `json:"senses,omitempty"`
	Priority int      `json:"priority"`
}
type Report struct {
	File   string         `json:"file"`
	Tasks  []Task         `json:"tasks"`
	Counts map[string]int `json:"counts"`
}

func Build(path string) (Report, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return Report{}, err
	}
	var words []Word
	if err = json.Unmarshal(raw, &words); err != nil {
		return Report{}, err
	}
	r := Report{File: path, Counts: map[string]int{}}
	for _, w := range words {
		missing := []string{}
		if strings.TrimSpace(w.Phonetic) == "" {
			missing = append(missing, "phonetic")
		}
		completeSenses := len(w.Senses) > 0
		for _, sense := range w.Senses {
			if strings.TrimSpace(sense.Example) == "" || strings.TrimSpace(sense.ExampleTranslation) == "" {
				completeSenses = false
				break
			}
		}
		parts := split(w.Meaning)
		exampleMissing := false
		switch {
		case len(w.Senses) > 0:
			exampleMissing = !completeSenses
		default:
			exampleMissing = strings.TrimSpace(w.Example) == "" || strings.TrimSpace(w.ExampleTranslation) == ""
		}
		if exampleMissing {
			missing = append(missing, "example")
		}
		if len(missing) == 0 {
			continue
		}
		senses := parts
		if len(w.Senses) > 0 {
			senses = []string{}
			for _, sense := range w.Senses {
				senses = append(senses, sense.Meaning)
			}
		}
		priority := len(missing) * 10
		if len(w.Senses) > 1 {
			priority += 20
		}
		for _, m := range missing {
			r.Counts[m]++
		}
		if len(w.Senses) > 1 {
			r.Counts["multi_sense"]++
		}
		r.Tasks = append(r.Tasks, Task{ID: w.ID, Word: w.Word, Meaning: w.Meaning, Missing: missing, Senses: senses, Priority: priority})
	}
	sort.SliceStable(r.Tasks, func(i, j int) bool { return r.Tasks[i].Priority > r.Tasks[j].Priority })
	return r, nil
}
func split(v string) []string {
	parts := separators.Split(v, -1)
	out := []string{}
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	if len(out) == 0 {
		out = []string{v}
	}
	return out
}
