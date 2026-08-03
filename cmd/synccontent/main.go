package main

import (
	"encoding/json"
	"english_learn/internal/enrichment"
	"flag"
	"fmt"
	"os"
	"path/filepath"
)

var batches = map[string][]string{
	"primary": {"primary_core.json", "primary_remaining.json", "primary_final_clean.json", "primary_senses.json", "primary_senses_batch2.json", "primary_examples_batch1.json", "primary_examples_batch2.json", "primary_examples_batch3.json", "primary_examples_batch4.json", "primary_examples_batch5.json", "primary_examples_batch6.json", "primary_examples_batch7.json", "primary_cleanup.json", "primary_sentence_cleanup.json"},
	"middle":  {"middle_core.json", "middle_ce.json", "middle_fh.json", "middle_il.json", "middle_mp.json", "middle_qz.json", "middle_general1.json", "middle_general2.json", "middle_general3.json", "middle_general4.json", "middle_examples_batch1.json", "middle_examples_batch2.json", "middle_examples_batch3.json", "middle_examples_batch4.json", "middle_examples_batch5.json", "middle_examples_batch6.json", "middle_examples_batch7.json", "middle_examples_batch8.json", "middle_examples_batch9.json", "middle_examples_batch10.json", "middle_examples_batch11.json", "middle_examples_batch12.json", "middle_examples_batch13.json", "middle_examples_batch14.json", "middle_examples_batch15.json", "middle_examples_batch16.json", "middle_examples_batch17.json", "middle_examples_batch18.json", "middle_examples_batch19.json", "middle_examples_batch20.json", "explicit_senses_batch1.json", "explicit_senses_batch2.json", "explicit_senses_batch3.json"},
}

func main() {
	root := flag.String("root", ".", "project root")
	flag.Parse()
	// Validate every patch before mutating either dataset, so a malformed late
	// batch cannot leave the source word lists only partly synchronized.
	for _, names := range batches {
		for _, name := range names {
			patch := filepath.Join(*root, "backend", "enrichment", name)
			raw, err := os.ReadFile(patch)
			if err != nil || !json.Valid(raw) {
				fmt.Fprintf(os.Stderr, "invalid patch %s: %v\n", name, err)
				os.Exit(1)
			}
		}
	}
	for level, names := range batches {
		dataset := filepath.Join(*root, "backend", level+"_school.json")
		for _, name := range names {
			patch := filepath.Join(*root, "backend", "enrichment", name)
			count, err := enrichment.Apply(dataset, patch)
			if err != nil {
				fmt.Fprintf(os.Stderr, "sync %s: %v\n", name, err)
				os.Exit(1)
			}
			fmt.Printf("synced %-24s %d records\n", name, count)
		}
	}
}
