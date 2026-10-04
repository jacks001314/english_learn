// cmd/expandvocab —— 词库内容扩充工具（把候选词条幂等合并进词库 JSON）。
//
// 用法：
//
//	go run ./cmd/expandvocab -additions backend/enrichment/primary_grade6_words.json
//	go run ./cmd/expandvocab -additions ... -dataset backend/primary_school.json -dry-run
//
// 与 cmd/synccontent 的分工：synccontent 用 enrichment 补已有词条的字段，
// 本工具负责追加新词条（按 ID 与英文词形双重去重，可重复执行）。
package main

import (
	"flag"
	"fmt"
	"os"

	"english_learn/internal/vocabulary"
)

func main() {
	additions := flag.String("additions", "", "候选词条 JSON 文件（必填）")
	dataset := flag.String("dataset", "backend/primary_school.json", "目标词库 JSON")
	dryRun := flag.Bool("dry-run", false, "只预览将新增/跳过的词条，不写文件")
	flag.Parse()

	if *additions == "" {
		fmt.Fprintln(os.Stderr, "usage: expandvocab -additions <candidates.json> [-dataset backend/primary_school.json] [-dry-run]")
		os.Exit(2)
	}

	result, err := vocabulary.Expand(*dataset, *additions, *dryRun)
	if err != nil {
		fmt.Fprintf(os.Stderr, "expand %s: %v\n", *additions, err)
		os.Exit(1)
	}
	verb := "added"
	if *dryRun {
		verb = "would add"
	}
	fmt.Printf("%s %d records to %s (total %d)\n", verb, result.Added, *dataset, result.Total)
	if len(result.Skipped) > 0 {
		fmt.Printf("skipped %d existing: %v\n", len(result.Skipped), result.Skipped)
	}
}
