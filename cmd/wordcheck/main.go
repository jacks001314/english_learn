package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"english_learn/internal/wordcheck"
)

func main() {
	output := flag.String("output", "", "write report to this file; defaults to stdout")
	format := flag.String("format", "markdown", "report format: markdown or json")
	failOn := flag.String("fail-on", "error", "exit non-zero when findings reach this level: error or warning")
	flag.Parse()
	paths := flag.Args()
	if len(paths) == 0 {
		paths = []string{"backend/primary_school.json", "backend/middle_school.json"}
	}
	report := wordcheck.CheckFiles(paths)
	var content []byte
	var err error
	if *format == "json" {
		content, err = json.MarshalIndent(report, "", "  ")
	} else {
		content = []byte(markdown(report))
	}
	if err != nil {
		fatal(err)
	}
	if *output == "" {
		fmt.Println(string(content))
	} else {
		if err := os.MkdirAll(filepath.Dir(*output), 0755); err != nil {
			fatal(err)
		}
		if err := os.WriteFile(*output, content, 0644); err != nil {
			fatal(err)
		}
		fmt.Printf("word quality report written to %s\n", *output)
	}
	if shouldFail(report, *failOn) {
		os.Exit(2)
	}
}

func shouldFail(report wordcheck.Report, threshold string) bool {
	if threshold == "warning" {
		return len(report.Issues) > 0
	}
	for _, item := range report.Issues {
		if item.Severity == "error" {
			return true
		}
	}
	return false
}

func markdown(report wordcheck.Report) string {
	var out strings.Builder
	out.WriteString("# 词库质量报告\n\n")
	out.WriteString("本报告由 `go run ./cmd/wordcheck` 自动生成。错误应优先修复，警告需要人工复核。\n\n")
	out.WriteString("## 汇总\n\n| 文件 | 词条数 | 错误 | 警告 |\n| --- | ---: | ---: | ---: |\n")
	for _, file := range report.Files {
		fmt.Fprintf(&out, "| `%s` | %d | %d | %d |\n", file.Path, file.Words, file.Errors, file.Warns)
	}
	out.WriteString("\n## 问题明细\n\n")
	if len(report.IssueCounts) > 0 {
		out.WriteString("## 问题类型汇总\n\n| 类型 | 数量 |\n| --- | ---: |\n")
		keys := make([]string, 0, len(report.IssueCounts))
		for key := range report.IssueCounts {
			keys = append(keys, key)
		}
		sort.Strings(keys)
		for _, key := range keys {
			fmt.Fprintf(&out, "| `%s` | %d |\n", key, report.IssueCounts[key])
		}
		out.WriteString("\n")
	}
	if len(report.Issues) == 0 {
		out.WriteString("未发现问题。\n")
		return out.String()
	}
	for _, item := range report.Issues {
		icon := "⚠️"
		if item.Severity == "error" {
			icon = "❌"
		}
		fmt.Fprintf(&out, "- %s `%s` 第 %d 条 `%s`：%s（`%s`）\n", icon, item.File, item.Index, item.ID, item.Message, item.Code)
	}
	return out.String()
}

func fatal(err error) {
	fmt.Fprintln(os.Stderr, err)
	os.Exit(1)
}
