package autofill

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"strings"
)

type Result struct {
	Updated int
	ByRule  map[string]int
}

type wordFields struct {
	Word    string `json:"word"`
	Meaning string `json:"meaning"`
	Example string `json:"example"`
}

var cleanEnglish = regexp.MustCompile(`^[A-Za-z][A-Za-z .'-]*$`)

// Apply adds examples using low-ambiguity rules. Records are kept as raw JSON
// objects so fields owned by other importers (phonetic, senses, pos, etc.) can
// never be discarded by this batch operation.
func Apply(path, grade string) (Result, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return Result{}, err
	}
	var words []map[string]json.RawMessage
	if err = json.Unmarshal(raw, &words); err != nil {
		return Result{}, err
	}
	result := Result{ByRule: map[string]int{}}
	for _, record := range words {
		var fields wordFields
		encoded, err := json.Marshal(record)
		if err != nil || json.Unmarshal(encoded, &fields) != nil {
			continue
		}
		if strings.TrimSpace(fields.Example) != "" || !cleanEnglish.MatchString(fields.Word) {
			continue
		}
		example, translation, topic, rule := generate(fields.Word, fields.Meaning)
		if rule == "" {
			continue
		}
		setString(record, "example", example)
		setString(record, "exampleTranslation", translation)
		setStringIfEmpty(record, "topic", topic)
		setStringIfEmpty(record, "grade", grade)
		setStringIfEmpty(record, "unit", "自动补充")
		result.Updated++
		result.ByRule[rule]++
	}
	encoded, err := json.MarshalIndent(words, "", "  ")
	if err != nil {
		return Result{}, err
	}
	encoded = append(encoded, '\n')
	if bytes.Equal(raw, encoded) {
		return result, nil
	}
	return result, os.WriteFile(path, encoded, 0644)
}

func setString(record map[string]json.RawMessage, key, value string) {
	record[key], _ = json.Marshal(value)
}

func setStringIfEmpty(record map[string]json.RawMessage, key, value string) {
	var current string
	_ = json.Unmarshal(record[key], &current)
	if strings.TrimSpace(current) == "" {
		setString(record, key, value)
	}
}

func generate(word, rawMeaning string) (string, string, string, string) {
	meaning := cleanMeaning(rawMeaning)
	word = strings.TrimSpace(word)
	switch {
	case strings.Contains(rawMeaning, "男名") || strings.Contains(rawMeaning, "女名") || strings.Contains(rawMeaning, "人名") || strings.Contains(rawMeaning, "（姓）"):
		return fmt.Sprintf("%s is a student in our school.", word), fmt.Sprintf("%s是我们学校的一名学生。", word), "人物", "person-name"
	case strings.Contains(rawMeaning, "首都"):
		return fmt.Sprintf("%s is an important capital city.", word), fmt.Sprintf("%s是一座重要的首都城市。", word), "城市", "capital"
	case strings.Contains(rawMeaning, "城市") || strings.Contains(rawMeaning, "首府"):
		return fmt.Sprintf("%s is a well-known city.", word), fmt.Sprintf("%s是一座知名城市。", word), "城市", "city"
	case isCountryMeaning(meaning):
		return fmt.Sprintf("%s is a country on the world map.", word), fmt.Sprintf("%s是世界地图上的一个国家。", meaning), "国家", "country"
	case isMonth(word):
		return fmt.Sprintf("Our class has a special activity in %s.", word), fmt.Sprintf("我们班在%s有一项特别活动。", meaning), "月份", "month"
	case isWeekday(word):
		return fmt.Sprintf("We have a reading class on %s.", word), fmt.Sprintf("我们%s有阅读课。", meaning), "星期", "weekday"
	case isNumberWord(strings.ToLower(word)) && meaning != "":
		return fmt.Sprintf("There are %s books on the shelf.", strings.ToLower(word)), fmt.Sprintf("书架上有%s本书。", meaning), "数字", "number"
	}
	return "", "", "", ""
}

func cleanMeaning(v string) string {
	v = regexp.MustCompile(`(?i)\s*p\.?\d+.*$`).ReplaceAllString(v, "")
	return strings.TrimSpace(v)
}

func isCountryMeaning(v string) bool {
	return strings.HasSuffix(v, "国") || v == "英国" || v == "美国" || v == "中国" || v == "日本" || v == "印度" || v == "巴西"
}

func isMonth(v string) bool {
	months := map[string]bool{"january": true, "february": true, "march": true, "april": true, "may": true, "june": true, "july": true, "august": true, "september": true, "october": true, "november": true, "december": true}
	return months[strings.ToLower(v)]
}

func isWeekday(v string) bool {
	days := map[string]bool{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": true, "sunday": true}
	return days[strings.ToLower(v)]
}

func isNumberWord(v string) bool {
	numbers := map[string]bool{"zero": true, "one": true, "two": true, "three": true, "four": true, "five": true, "six": true, "seven": true, "eight": true, "nine": true, "ten": true, "eleven": true, "twelve": true, "thirteen": true, "fourteen": true, "fifteen": true, "sixteen": true, "seventeen": true, "eighteen": true, "nineteen": true, "twenty": true, "thirty": true, "forty": true, "fifty": true, "sixty": true, "seventy": true, "eighty": true, "ninety": true, "hundred": true, "thousand": true, "million": true, "billion": true}
	return numbers[v]
}
