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
	// Part-of-speech batches are applied after the curated core/sense/example
	// imports so the tagged classes win over any earlier import that left
	// Word.Pos empty.
	//
	// The word-audit batches come last, ordered as: per-slice audit patches
	// (primary-a-l, primary-m-z, middle-a-c, middle-d-i, middle-j-p, middle-q-z),
	// then the orchestrator decisions (primary_audit_truncated_fix.json,
	// primary_audit_leftover.json, middle_audit_final.json,
	// middle_audit_abbrev.json — the latter completes the meanings of the
	// contraction/short-form entries). They are applied after everything else
	// because they were derived from the fully synchronized datasets and correct
	// meaning/word/pos/phonetic fields that earlier batches still carry in their
	// pre-audit form (for example middle_examples_batch5.json stores
	// experience="信任；经历" while the audit settled on "经验；经历"), and because
	// the slice auditors themselves flagged the in-row split entries (word='art',
	// meaning='room 美术教室') for the orchestrator to settle;
	// primary_audit_truncated_fix.json holds that ruling and must therefore win
	// over the slice proposals for the same ids.
	//
	// The *_dedup_merges.json batches are the very last step: they fold the extra
	// meaning of an entry that another word form duplicated into the surviving
	// entry, so they must win over every earlier meaning patch for that id.
	"primary": {"primary_core.json", "primary_remaining.json", "primary_final_clean.json", "primary_senses.json", "primary_senses_batch2.json", "primary_examples_batch1.json", "primary_examples_batch2.json", "primary_examples_batch3.json", "primary_examples_batch4.json", "primary_examples_batch5.json", "primary_examples_batch6.json", "primary_examples_batch7.json", "primary_cleanup.json", "primary_sentence_cleanup.json", "primary_pos.json", "primary_pos_phrase.json", "primary_audit_primary-a-l.json", "primary_audit_primary-m-z.json", "primary_audit_truncated_fix.json", "primary_audit_leftover.json", "primary_dedup_merges.json"},
	"middle":  {"middle_core.json", "middle_ce.json", "middle_fh.json", "middle_il.json", "middle_mp.json", "middle_qz.json", "middle_general1.json", "middle_general2.json", "middle_general3.json", "middle_general4.json", "middle_examples_batch1.json", "middle_examples_batch2.json", "middle_examples_batch3.json", "middle_examples_batch4.json", "middle_examples_batch5.json", "middle_examples_batch6.json", "middle_examples_batch7.json", "middle_examples_batch8.json", "middle_examples_batch9.json", "middle_examples_batch10.json", "middle_examples_batch11.json", "middle_examples_batch12.json", "middle_examples_batch13.json", "middle_examples_batch14.json", "middle_examples_batch15.json", "middle_examples_batch16.json", "middle_examples_batch17.json", "middle_examples_batch18.json", "middle_examples_batch19.json", "middle_examples_batch20.json", "explicit_senses_batch1.json", "explicit_senses_batch2.json", "explicit_senses_batch3.json", "middle_pos.json", "middle_pos_phrase.json", "middle_audit_middle-a-c.json", "middle_audit_middle-d-i.json", "middle_audit_middle-j-p.json", "middle_audit_middle-q-z.json", "middle_audit_final.json", "middle_audit_abbrev.json", "middle_dedup_merges.json"},
}

// retirements lists the dedup deny-lists applied after each batch list. Every id
// in these files is deleted from the dataset, which is how the duplicate word
// forms (junk ids such as "subway：" or "tomoto") stop tripping the wordcheck
// warning gate while keeping every meaning, because the merge batches above fold
// the extra meaning into the surviving entry first. The batch list stays
// re-runnable after the deletion because ApplyRetiring skips the legacy patch
// entries that address a retired id.
var retirements = map[string][]string{
	"primary": {"primary_dedup_retire.json"},
	"middle":  {"middle_dedup_retire.json"},
}

func main() {
	root := flag.String("root", ".", "project root")
	flag.Parse()
	// Validate every patch before mutating either dataset, so a malformed late
	// batch cannot leave the source word lists only partly synchronized.
	for _, groups := range []map[string][]string{batches, retirements} {
		for _, names := range groups {
			for _, name := range names {
				patch := filepath.Join(*root, "backend", "enrichment", name)
				raw, err := os.ReadFile(patch)
				if err != nil || !json.Valid(raw) {
					fmt.Fprintf(os.Stderr, "invalid patch %s: %v\n", name, err)
					os.Exit(1)
				}
			}
		}
	}
	for level, names := range batches {
		dataset := filepath.Join(*root, "backend", level+"_school.json")
		retired := enrichment.Retirements{}
		for _, name := range retirements[level] {
			loaded, err := enrichment.ReadRetirements(filepath.Join(*root, "backend", "enrichment", name))
			if err != nil {
				fmt.Fprintf(os.Stderr, "read retirements %s: %v\n", name, err)
				os.Exit(1)
			}
			for id, item := range loaded {
				retired[id] = item
			}
		}
		for _, name := range names {
			patch := filepath.Join(*root, "backend", "enrichment", name)
			count, err := enrichment.ApplyRetiring(dataset, patch, retired)
			if err != nil {
				fmt.Fprintf(os.Stderr, "sync %s: %v\n", name, err)
				os.Exit(1)
			}
			fmt.Printf("synced %-24s %d records\n", name, count)
		}
		for _, name := range retirements[level] {
			patch := filepath.Join(*root, "backend", "enrichment", name)
			result, err := enrichment.ApplyRetirements(dataset, patch)
			if err != nil {
				fmt.Fprintf(os.Stderr, "retire %s: %v\n", name, err)
				os.Exit(1)
			}
			fmt.Printf("retired %-22s %d records (%d already absent)\n", name, result.Removed, result.Absent)
		}
	}
}
