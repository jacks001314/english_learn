package main

import (
	"english_learn/internal/autofill"
	"flag"
	"fmt"
)

func main() {
	dataset := flag.String("dataset", "backend/middle_school.json", "dataset")
	grade := flag.String("grade", "七年级", "default grade")
	flag.Parse()
	result, err := autofill.Apply(*dataset, *grade)
	if err != nil {
		panic(err)
	}
	fmt.Printf("autofilled %d words: %v\n", result.Updated, result.ByRule)
}
