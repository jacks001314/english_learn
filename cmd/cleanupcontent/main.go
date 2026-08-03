package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strings"
)

func main() {
	write := flag.Bool("write", false, "write cleaned records")
	flag.Parse()
	paths := flag.Args()
	if len(paths) == 0 {
		paths = []string{"backend/primary_school.json", "backend/middle_school.json"}
	}
	for _, path := range paths {
		removed, err := clean(path, *write)
		if err != nil {
			panic(err)
		}
		fmt.Printf("%s: removed %d generated examples/senses\n", path, removed)
	}
}

func clean(path string, write bool) (int, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return 0, err
	}
	var records []map[string]json.RawMessage
	if err = json.Unmarshal(raw, &records); err != nil {
		return 0, err
	}
	removed := 0
	for _, record := range records {
		if template(record["example"]) || template(record["exampleTranslation"]) {
			delete(record, "example")
			delete(record, "exampleTranslation")
			removed++
		}
		var senses []map[string]json.RawMessage
		if json.Unmarshal(record["senses"], &senses) != nil {
			continue
		}
		kept := senses[:0]
		for _, sense := range senses {
			var id string
			_ = json.Unmarshal(sense["id"], &id)
			if strings.Contains(id, "-sense-") || template(sense["example"]) || template(sense["exampleTranslation"]) {
				removed++
				continue
			}
			kept = append(kept, sense)
		}
		if len(kept) == 0 {
			delete(record, "senses")
		} else {
			record["senses"], _ = json.Marshal(kept)
		}
	}
	if !write {
		return removed, nil
	}
	encoded, err := json.MarshalIndent(records, "", "  ")
	if err != nil {
		return 0, err
	}
	return removed, os.WriteFile(path, append(encoded, '\n'), 0644)
}

func template(value json.RawMessage) bool {
	var text string
	_ = json.Unmarshal(value, &text)
	return strings.HasPrefix(strings.ToLower(strings.TrimSpace(text)), "in this lesson,") || strings.HasPrefix(strings.TrimSpace(text), "在本课中，")
}
