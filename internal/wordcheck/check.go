package wordcheck

import (
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"sort"
	"strings"
	"unicode/utf8"
)

var (
	pageReferencePattern = regexp.MustCompile(`(?i)(^|[^a-z])p\.?\s*\d+`)
	wordPOSPattern       = regexp.MustCompile(`(?i)\s+(n|v|adj|adv|prep|pron|conj|phr)\.?\s*$`)
)

type Word struct {
	ID       string `json:"id"`
	Word     string `json:"word"`
	Phonetic string `json:"phonetic"`
	Pos      string `json:"pos"`
	Meaning  string `json:"meaning"`
	Letter   string `json:"letter"`
}

type Issue struct {
	Severity string `json:"severity"`
	Code     string `json:"code"`
	File     string `json:"file"`
	Index    int    `json:"index"`
	ID       string `json:"id,omitempty"`
	Message  string `json:"message"`
}

type FileReport struct {
	Path   string `json:"path"`
	Words  int    `json:"words"`
	Errors int    `json:"errors"`
	Warns  int    `json:"warnings"`
}

type Report struct {
	Files       []FileReport   `json:"files"`
	Issues      []Issue        `json:"issues"`
	IssueCounts map[string]int `json:"issueCounts"`
}

func CheckFiles(paths []string) Report {
	report := Report{Files: make([]FileReport, 0, len(paths)), Issues: []Issue{}, IssueCounts: map[string]int{}}
	for _, path := range paths {
		fileReport, issues := CheckFile(path)
		report.Files = append(report.Files, fileReport)
		report.Issues = append(report.Issues, issues...)
	}
	sort.Slice(report.Issues, func(i, j int) bool {
		if report.Issues[i].File != report.Issues[j].File {
			return report.Issues[i].File < report.Issues[j].File
		}
		if report.Issues[i].Index != report.Issues[j].Index {
			return report.Issues[i].Index < report.Issues[j].Index
		}
		return report.Issues[i].Code < report.Issues[j].Code
	})
	for _, item := range report.Issues {
		report.IssueCounts[item.Code]++
	}
	return report
}

func CheckFile(path string) (FileReport, []Issue) {
	summary := FileReport{Path: path}
	raw, err := os.ReadFile(path)
	if err != nil {
		return summary, []Issue{issue("error", "read_failed", path, 0, "", err.Error())}
	}
	if !utf8.Valid(raw) {
		return summary, []Issue{issue("error", "invalid_utf8", path, 0, "", "文件不是有效 UTF-8")}
	}
	var words []Word
	if err := json.Unmarshal(raw, &words); err != nil {
		return summary, []Issue{issue("error", "invalid_json", path, 0, "", err.Error())}
	}
	summary.Words = len(words)
	seen := map[string]int{}
	seenWords := map[string]int{}
	issues := make([]Issue, 0)
	for i, word := range words {
		index := i + 1
		id := strings.TrimSpace(word.ID)
		if id == "" {
			issues = append(issues, issue("error", "empty_id", path, index, id, "缺少词条 ID"))
		} else if first, ok := seen[strings.ToLower(id)]; ok {
			issues = append(issues, issue("error", "duplicate_id", path, index, id, fmt.Sprintf("与第 %d 条 ID 重复", first)))
		} else {
			seen[strings.ToLower(id)] = index
		}
		if strings.TrimSpace(word.Word) == "" {
			issues = append(issues, issue("error", "empty_word", path, index, id, "缺少英文词汇"))
		} else {
			normalizedWord := strings.ToLower(strings.TrimSpace(word.Word))
			if first, ok := seenWords[normalizedWord]; ok {
				issues = append(issues, issue("warning", "duplicate_word", path, index, id, fmt.Sprintf("与第 %d 条英文词形重复", first)))
			} else {
				seenWords[normalizedWord] = index
			}
			if wordPOSPattern.MatchString(word.Word) {
				issues = append(issues, issue("warning", "word_contains_pos", path, index, id, "英文词汇末尾疑似混入词性标记"))
			}
		}
		if strings.TrimSpace(word.Meaning) == "" {
			issues = append(issues, issue("error", "empty_meaning", path, index, id, "缺少中文释义"))
		} else if pageReferencePattern.MatchString(word.Meaning) {
			issues = append(issues, issue("warning", "meaning_page_reference", path, index, id, "中文释义疑似残留教材页码"))
		}
		if strings.ContainsRune(word.Word+word.Phonetic+word.Pos+word.Meaning, utf8.RuneError) {
			issues = append(issues, issue("error", "replacement_character", path, index, id, "字段包含 Unicode 替换字符，可能发生编码损坏"))
		}
		if containsMojibake(word.Word + word.Phonetic + word.Pos + word.Meaning) {
			issues = append(issues, issue("warning", "suspected_mojibake", path, index, id, "字段包含常见乱码片段，请人工检查"))
		}
		phonetic := strings.TrimSpace(word.Phonetic)
		if phonetic != "" && (strings.Count(phonetic, "/")%2 != 0 || strings.Count(phonetic, "[") != strings.Count(phonetic, "]")) {
			issues = append(issues, issue("warning", "phonetic_delimiter", path, index, id, "音标分隔符不成对"))
		}
		letter := strings.TrimSpace(word.Letter)
		if letter == "" {
			issues = append(issues, issue("warning", "empty_letter", path, index, id, "缺少字母分类"))
		} else if len([]rune(letter)) != 1 {
			issues = append(issues, issue("warning", "invalid_letter", path, index, id, "字母分类应为单个字母或 #"))
		}
	}
	for _, item := range issues {
		if item.Severity == "error" {
			summary.Errors++
		} else {
			summary.Warns++
		}
	}
	return summary, issues
}

func containsMojibake(value string) bool {
	for _, marker := range []string{"锛", "銆", "鈥", "鐨", "鏄", "涓€", "闂", "瀛"} {
		if strings.Contains(value, marker) {
			return true
		}
	}
	return false
}

func issue(severity, code, file string, index int, id, message string) Issue {
	return Issue{Severity: severity, Code: code, File: file, Index: index, ID: id, Message: message}
}
