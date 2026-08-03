package main

import (
	"encoding/json"
	"english_learn/internal/contentaudit"
	"flag"
	"fmt"
	"os"
	"path/filepath"
)

func main() {
	output := flag.String("output", "reports/content-completeness.json", "report output")
	strict := flag.Bool("strict", false, "fail if incomplete")
	maxMissingPhonetic := flag.Int("max-missing-phonetic", -1, "fail if total missing phonetics exceeds this value")
	maxMissingExamples := flag.Int("max-missing-examples", -1, "fail if total missing examples exceeds this value")
	flag.Parse()
	paths := flag.Args()
	if len(paths) == 0 {
		paths = []string{"backend/primary_school.json", "backend/middle_school.json"}
	}
	r, e := contentaudit.AuditFiles(paths)
	if e != nil {
		panic(e)
	}
	raw, _ := json.MarshalIndent(r, "", "  ")
	_ = os.MkdirAll(filepath.Dir(*output), 0755)
	if e = os.WriteFile(*output, raw, 0644); e != nil {
		panic(e)
	}
	totalMissingPhonetic, totalMissingExamples := 0, 0
	for _, s := range r.Files {
		fmt.Printf("%s: words=%d missing_phonetic=%d missing_audio=%d missing_examples=%d multi_sense=%d senses_without_examples=%d template_examples=%d\n", s.File, s.Words, s.MissingPhonetic, s.MissingAudio, s.MissingExamples, s.MultipleSenses, s.SensesWithoutExamples, s.TemplateExamples)
		totalMissingPhonetic += s.MissingPhonetic
		totalMissingExamples += s.MissingExamples
	}
	if *strict && !r.Complete {
		os.Exit(2)
	}
	if (*maxMissingPhonetic >= 0 && totalMissingPhonetic > *maxMissingPhonetic) || (*maxMissingExamples >= 0 && totalMissingExamples > *maxMissingExamples) {
		fmt.Fprintf(os.Stderr, "content completeness regression: missing phonetics=%d (max %d), missing examples=%d (max %d)\n", totalMissingPhonetic, *maxMissingPhonetic, totalMissingExamples, *maxMissingExamples)
		os.Exit(2)
	}
}
