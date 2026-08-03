package main

import (
	"flag"
	"fmt"
	"os"

	"english_learn/internal/enrichment"
)

func main() {
	dataset := flag.String("dataset", "backend/primary_school.json", "word dataset to update")
	patches := flag.String("patches", "backend/enrichment/primary_core.json", "metadata patch file")
	flag.Parse()
	count, err := enrichment.Apply(*dataset, *patches)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	fmt.Printf("enriched %d words in %s\n", count, *dataset)
}
