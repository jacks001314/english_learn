package main

import (
	"encoding/json"
	"english_learn/internal/contenttasks"
	"flag"
	"fmt"
	"os"
	"path/filepath"
)

func main() {
	output := flag.String("output", "reports/content-tasks.json", "task report")
	flag.Parse()
	paths := flag.Args()
	if len(paths) == 0 {
		paths = []string{"backend/primary_school.json", "backend/middle_school.json"}
	}
	all := []contenttasks.Report{}
	for _, p := range paths {
		r, e := contenttasks.Build(p)
		if e != nil {
			panic(e)
		}
		all = append(all, r)
		fmt.Printf("%s: tasks=%d phonetic=%d example=%d multi_sense=%d\n", p, len(r.Tasks), r.Counts["phonetic"], r.Counts["example"], r.Counts["multi_sense"])
	}
	raw, _ := json.MarshalIndent(all, "", "  ")
	_ = os.MkdirAll(filepath.Dir(*output), 0755)
	if e := os.WriteFile(*output, raw, 0644); e != nil {
		panic(e)
	}
}
