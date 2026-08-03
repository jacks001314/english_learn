package contentaudit

import (
	"encoding/json"
	"os"
	"regexp"
	"strings"
)

// Chinese commas commonly join synonyms ("父母，双亲") rather than separate
// senses. Semicolons, slashes and numbered definitions are stronger evidence
// of independent meanings that each require their own example.
var senseSeparator = regexp.MustCompile(`[；;/]+|(?:^|\s)\d+[、.]`)

type Pronunciation struct {
	Phonetic string `json:"phonetic"`
	AudioURL string `json:"audioUrl"`
	Source   string `json:"source"`
}
type Example struct {
	Text        string `json:"text"`
	Translation string `json:"translation"`
}
type Sense struct {
	ID                 string    `json:"id"`
	Meaning            string    `json:"meaning"`
	Examples           []Example `json:"examples"`
	Example            string    `json:"example"`
	ExampleTranslation string    `json:"exampleTranslation"`
}
type Word struct {
	ID                 string          `json:"id"`
	Phonetic           string          `json:"phonetic"`
	Meaning            string          `json:"meaning"`
	Example            string          `json:"example"`
	ExampleTranslation string          `json:"exampleTranslation"`
	Pronunciations     []Pronunciation `json:"pronunciations"`
	Senses             []Sense         `json:"senses"`
}
type FileSummary struct {
	File                  string `json:"file"`
	Words                 int    `json:"words"`
	MissingPhonetic       int    `json:"missingPhonetic"`
	MissingAudio          int    `json:"missingAudio"`
	MissingAudioSource    int    `json:"missingAudioSource"`
	MissingExamples       int    `json:"missingExamples"`
	MultipleSenses        int    `json:"multipleSenses"`
	SensesWithoutExamples int    `json:"sensesWithoutExamples"`
	TemplateExamples      int    `json:"templateExamples"`
}
type Report struct {
	Files    []FileSummary `json:"files"`
	Complete bool          `json:"complete"`
}

func AuditFiles(paths []string) (Report, error) {
	r := Report{Complete: true}
	for _, p := range paths {
		s, e := AuditFile(p)
		if e != nil {
			return Report{}, e
		}
		r.Files = append(r.Files, s)
		if s.MissingPhonetic+s.MissingExamples+s.SensesWithoutExamples+s.TemplateExamples > 0 {
			r.Complete = false
		}
	}
	return r, nil
}
func AuditFile(path string) (FileSummary, error) {
	raw, e := os.ReadFile(path)
	if e != nil {
		return FileSummary{}, e
	}
	var words []Word
	if e = json.Unmarshal(raw, &words); e != nil {
		return FileSummary{}, e
	}
	s := FileSummary{File: path, Words: len(words)}
	for _, w := range words {
		if strings.TrimSpace(w.Phonetic) == "" && !hasPhonetic(w.Pronunciations) {
			s.MissingPhonetic++
		}
		if !hasAudio(w.Pronunciations) {
			s.MissingAudio++
		}
		if hasAudio(w.Pronunciations) && !hasSource(w.Pronunciations) {
			s.MissingAudioSource++
		}
		if len(w.Senses) > 0 {
			if len(w.Senses) > 1 {
				s.MultipleSenses++
			}
			for _, x := range w.Senses {
				if isTemplateExample(x.Example, x.ExampleTranslation) {
					s.TemplateExamples++
				}
				if len(x.Examples) == 0 && (strings.TrimSpace(x.Example) == "" || strings.TrimSpace(x.ExampleTranslation) == "" || isTemplateExample(x.Example, x.ExampleTranslation)) {
					s.SensesWithoutExamples++
				}
			}
			continue
		}
		parts := splitSenses(w.Meaning)
		if isTemplateExample(w.Example, w.ExampleTranslation) {
			s.TemplateExamples++
		}
		if strings.TrimSpace(w.Example) == "" || strings.TrimSpace(w.ExampleTranslation) == "" || isTemplateExample(w.Example, w.ExampleTranslation) {
			s.MissingExamples++
			s.SensesWithoutExamples += len(parts)
		}
	}
	return s, nil
}

func isTemplateExample(example, translation string) bool {
	example = strings.ToLower(strings.TrimSpace(example))
	translation = strings.TrimSpace(translation)
	return strings.HasPrefix(example, "in this lesson,") || strings.HasPrefix(translation, "在本课中，")
}
func splitSenses(v string) []string {
	raw := senseSeparator.Split(v, -1)
	out := []string{}
	for _, p := range raw {
		if strings.TrimSpace(p) != "" {
			out = append(out, strings.TrimSpace(p))
		}
	}
	if len(out) == 0 {
		out = []string{v}
	}
	return out
}
func hasPhonetic(v []Pronunciation) bool {
	for _, x := range v {
		if strings.TrimSpace(x.Phonetic) != "" {
			return true
		}
	}
	return false
}
func hasAudio(v []Pronunciation) bool {
	for _, x := range v {
		if strings.TrimSpace(x.AudioURL) != "" {
			return true
		}
	}
	return false
}
func hasSource(v []Pronunciation) bool {
	for _, x := range v {
		if strings.TrimSpace(x.AudioURL) != "" && strings.TrimSpace(x.Source) != "" {
			return true
		}
	}
	return false
}
