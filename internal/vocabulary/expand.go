// Package vocabulary 提供词库内容扩充工具：把候选词条幂等合并进词库 JSON。
//
// 与 internal/enrichment 的分工：enrichment 只「补字段」，词条必须已存在；
// 本包负责「加词条」，即把新词追加到词库末尾，并按 ID 与英文词形双重去重。
// 输出格式与 enrichment 一致（Go 的 json.MarshalIndent：两空格缩进、
// 非 ASCII 原样输出、& < > 转义为 \u0026 等），因此不会造成文件格式漂移。
package vocabulary

import (
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strings"
	"unicode/utf8"

	"english_learn/internal/enrichment"
)

// Result 是一次扩充的结果。
type Result struct {
	Added   int      // 实际追加的词条数
	Skipped []string // 因已存在（ID 或词形命中）而跳过的词条
	Total   int      // 写入后词库总条数
}

// Expand 把 additionsPath 里的候选词条合并进 datasetPath。
//
// 规则：
//   - 候选项必须字段完整（ID/词形/释义/音标/字母分类），否则直接报错，不写入任何内容；
//   - 候选项之间不允许 ID 或词形重复；
//   - 与词库中已有词条 ID 或英文词形（忽略大小写与首尾空白）重复时跳过，不算错误；
//   - dryRun 为真时只计算不落盘。
//
// 幂等：对同一份输入重复执行，第二次 Added=0 且文件内容保持不变。
func Expand(datasetPath, additionsPath string, dryRun bool) (Result, error) {
	result := Result{Skipped: []string{}}
	words, err := readWords(datasetPath)
	if err != nil {
		return result, err
	}
	additions, err := readWords(additionsPath)
	if err != nil {
		return result, err
	}

	byID := make(map[string]bool, len(words))
	byWord := make(map[string]bool, len(words))
	for _, word := range words {
		byID[normalize(word.ID)] = true
		byWord[normalize(word.Word)] = true
	}

	seenID := map[string]bool{}
	seenWord := map[string]bool{}
	merged := append([]enrichment.Word{}, words...)
	for index, addition := range additions {
		if err := validate(addition); err != nil {
			return result, fmt.Errorf("additions[%d]: %w", index, err)
		}
		id, word := normalize(addition.ID), normalize(addition.Word)
		if seenID[id] || seenWord[word] {
			return result, fmt.Errorf("additions[%d]: 候选词条自身重复（%s / %s）", index, addition.ID, addition.Word)
		}
		seenID[id], seenWord[word] = true, true
		if byID[id] || byWord[word] {
			result.Skipped = append(result.Skipped, addition.ID)
			continue
		}
		byID[id], byWord[word] = true, true
		merged = append(merged, addition)
		result.Added++
	}
	sort.Strings(result.Skipped)
	result.Total = len(merged)
	if dryRun || result.Added == 0 {
		return result, nil
	}
	raw, err := json.MarshalIndent(merged, "", "  ")
	if err != nil {
		return result, err
	}
	raw = append(raw, '\n')
	if err := os.WriteFile(datasetPath, raw, 0o644); err != nil {
		return result, err
	}
	return result, nil
}

func validate(word enrichment.Word) error {
	if strings.TrimSpace(word.ID) == "" {
		return fmt.Errorf("缺少 ID")
	}
	if strings.TrimSpace(word.Word) == "" {
		return fmt.Errorf("%s 缺少英文词形", word.ID)
	}
	if strings.TrimSpace(word.Meaning) == "" {
		return fmt.Errorf("%s 缺少中文释义", word.ID)
	}
	phonetic := strings.TrimSpace(word.Phonetic)
	if phonetic == "" {
		return fmt.Errorf("%s 缺少音标", word.ID)
	}
	if strings.Count(phonetic, "/")%2 != 0 || strings.Count(phonetic, "[") != strings.Count(phonetic, "]") {
		return fmt.Errorf("%s 音标分隔符不成对：%s", word.ID, phonetic)
	}
	if utf8.RuneCountInString(strings.TrimSpace(word.Letter)) != 1 {
		return fmt.Errorf("%s 字母分类应为单个字符，实际 %q", word.ID, word.Letter)
	}
	if strings.TrimSpace(word.Example) == "" {
		return fmt.Errorf("%s 缺少例句", word.ID)
	}
	return nil
}

func normalize(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func readWords(path string) ([]enrichment.Word, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var words []enrichment.Word
	if err := json.Unmarshal(raw, &words); err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}
	return words, nil
}
