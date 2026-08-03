package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

type Sense struct{ ID, Meaning, Example, ExampleTranslation string }
type Word struct {
	ID                 string  `json:"id"`
	Word               string  `json:"word"`
	Example            string  `json:"example"`
	ExampleTranslation string  `json:"exampleTranslation"`
	Senses             []Sense `json:"senses"`
}
type content struct {
	Example, Translation string
	Senses               []Sense
}

func main() {
	paths := []string{"backend/primary_school.json", "backend/middle_school.json"}
	index := map[string]content{}
	for _, path := range paths {
		for _, w := range read(path) {
			if valid(w.Example, w.ExampleTranslation) {
				index[key(w.Word)] = content{w.Example, w.ExampleTranslation, w.Senses}
			}
		}
	}
	for _, path := range paths {
		records := readRaw(path)
		changed := 0
		for _, record := range records {
			var w Word
			raw, _ := json.Marshal(record)
			_ = json.Unmarshal(raw, &w)
			c, ok := index[key(w.Word)]
			if !ok || valid(w.Example, w.ExampleTranslation) {
				continue
			}
			set(record, "example", c.Example)
			set(record, "exampleTranslation", c.Translation)
			changed++
		}
		write(path, records)
		fmt.Printf("%s: reused %d reviewed examples\n", path, changed)
	}
}
func valid(a, b string) bool {
	return strings.TrimSpace(a) != "" && strings.TrimSpace(b) != "" && !strings.HasPrefix(strings.ToLower(a), "in this lesson,")
}
func key(v string) string { return strings.ToLower(strings.TrimSpace(v)) }
func read(path string) []Word {
	var v []Word
	raw, e := os.ReadFile(path)
	if e != nil {
		panic(e)
	}
	if json.Unmarshal(raw, &v) != nil {
		panic("invalid json")
	}
	return v
}
func readRaw(path string) []map[string]json.RawMessage {
	var v []map[string]json.RawMessage
	raw, e := os.ReadFile(path)
	if e != nil {
		panic(e)
	}
	if json.Unmarshal(raw, &v) != nil {
		panic("invalid json")
	}
	return v
}
func set(r map[string]json.RawMessage, k, v string) { r[k], _ = json.Marshal(v) }
func write(path string, v any) {
	raw, e := json.MarshalIndent(v, "", "  ")
	if e != nil {
		panic(e)
	}
	if os.WriteFile(path, append(raw, '\n'), 0644) != nil {
		panic("write failed")
	}
}
