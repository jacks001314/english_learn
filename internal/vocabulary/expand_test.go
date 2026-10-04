package vocabulary

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

const datasetJSON = `[
  {
    "id": "apple",
    "word": "apple",
    "phonetic": "/ˈæpl/",
    "pos": "n",
    "meaning": "苹果",
    "letter": "A",
    "example": "I eat an apple.",
    "exampleTranslation": "我吃一个苹果。",
    "topic": "食物",
    "grade": "三年级",
    "unit": "核心词汇"
  }
]
`

func fixture(t *testing.T, dataset, additions string) (string, string) {
	t.Helper()
	dir := t.TempDir()
	datasetPath := filepath.Join(dir, "words.json")
	additionsPath := filepath.Join(dir, "additions.json")
	if err := os.WriteFile(datasetPath, []byte(dataset), 0o600); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(additionsPath, []byte(additions), 0o600); err != nil {
		t.Fatal(err)
	}
	return datasetPath, additionsPath
}

func readRaw(t *testing.T, path string) string {
	t.Helper()
	raw, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	return string(raw)
}

func TestExpandAppendsNewWords(t *testing.T) {
	datasetPath, additionsPath := fixture(t, datasetJSON, `[
	  {"id":"banana","word":"banana","phonetic":"/bəˈnɑːnə/","pos":"n","meaning":"香蕉","letter":"B","example":"A banana is yellow.","exampleTranslation":"香蕉是黄色的。"}
	]`)
	result, err := Expand(datasetPath, additionsPath, false)
	if err != nil {
		t.Fatalf("Expand: %v", err)
	}
	if result.Added != 1 || result.Total != 2 {
		t.Fatalf("unexpected result: %+v", result)
	}
	words, err := readWords(datasetPath)
	if err != nil {
		t.Fatal(err)
	}
	if len(words) != 2 || words[1].Word != "banana" {
		t.Fatalf("unexpected dataset: %+v", words)
	}
	if words[0].Meaning != "苹果" {
		t.Fatalf("existing entry was modified: %+v", words[0])
	}
	// 与 enrichment 相同：非 ASCII 原样、& 转义，末尾换行。
	raw := readRaw(t, datasetPath)
	if !strings.Contains(raw, "苹果") || !strings.HasSuffix(raw, "]\n") {
		t.Fatalf("unexpected output format: %q", raw[len(raw)-40:])
	}
}

func TestExpandEscapesAmpersandLikeGoEncoder(t *testing.T) {
	datasetPath, additionsPath := fixture(t, datasetJSON, `[
	  {"id":"shake hands","word":"shake hands","phonetic":"/ʃeɪk hændz/","pos":"v & n phr.","meaning":"握手","letter":"S","example":"They shake hands.","exampleTranslation":"他们握手。"}
	]`)
	if _, err := Expand(datasetPath, additionsPath, false); err != nil {
		t.Fatalf("Expand: %v", err)
	}
	raw := readRaw(t, datasetPath)
	if !strings.Contains(raw, `\u0026`) {
		t.Fatalf("& should be escaped, got: %s", raw)
	}
}

func TestExpandSkipsExistingByIDOrWord(t *testing.T) {
	datasetPath, additionsPath := fixture(t, datasetJSON, `[
	  {"id":"Apple","word":"pear","phonetic":"/peə(r)/","pos":"n","meaning":"梨","letter":"P","example":"A pear.","exampleTranslation":"一个梨。"},
	  {"id":"grape","word":" APPLE ","phonetic":"/ɡreɪp/","pos":"n","meaning":"葡萄","letter":"G","example":"A grape.","exampleTranslation":"一颗葡萄。"},
	  {"id":"lemon","word":"lemon","phonetic":"/ˈlemən/","pos":"n","meaning":"柠檬","letter":"L","example":"A lemon.","exampleTranslation":"一个柠檬。"}
	]`)
	result, err := Expand(datasetPath, additionsPath, false)
	if err != nil {
		t.Fatalf("Expand: %v", err)
	}
	if result.Added != 1 || result.Total != 2 {
		t.Fatalf("unexpected result: %+v", result)
	}
	if len(result.Skipped) != 2 || result.Skipped[0] != "Apple" || result.Skipped[1] != "grape" {
		t.Fatalf("unexpected skipped list: %+v", result.Skipped)
	}
	words, _ := readWords(datasetPath)
	if words[len(words)-1].ID != "lemon" {
		t.Fatalf("wrong trailing word: %+v", words[len(words)-1])
	}
}

func TestExpandRejectsIncompleteCandidateWithoutWriting(t *testing.T) {
	datasetPath, additionsPath := fixture(t, datasetJSON, `[
	  {"id":"banana","word":"banana","phonetic":"/bəˈnɑːnə/","pos":"n","meaning":"","letter":"B"}
	]`)
	before := readRaw(t, datasetPath)
	if _, err := Expand(datasetPath, additionsPath, false); err == nil {
		t.Fatal("expected validation error")
	}
	if after := readRaw(t, datasetPath); after != before {
		t.Fatal("dataset must not change when a candidate is invalid")
	}
}

func TestExpandRejectsDuplicateCandidates(t *testing.T) {
	datasetPath, additionsPath := fixture(t, datasetJSON, `[
	  {"id":"pear","word":"pear","phonetic":"/peə(r)/","pos":"n","meaning":"梨","letter":"P","example":"A pear.","exampleTranslation":"一个梨。"},
	  {"id":"pear","word":"pear2","phonetic":"/peə(r)/","pos":"n","meaning":"梨","letter":"P","example":"A pear.","exampleTranslation":"一个梨。"}
	]`)
	if _, err := Expand(datasetPath, additionsPath, false); err == nil {
		t.Fatal("expected duplicate candidate error")
	}
}

func TestExpandIsIdempotent(t *testing.T) {
	datasetPath, additionsPath := fixture(t, datasetJSON, `[
	  {"id":"banana","word":"banana","phonetic":"/bəˈnɑːnə/","pos":"n","meaning":"香蕉","letter":"B","example":"A banana.","exampleTranslation":"一根香蕉。"}
	]`)
	first, err := Expand(datasetPath, additionsPath, false)
	if err != nil || first.Added != 1 {
		t.Fatalf("first run: %+v, %v", first, err)
	}
	afterFirst := readRaw(t, datasetPath)
	second, err := Expand(datasetPath, additionsPath, false)
	if err != nil {
		t.Fatalf("second run: %v", err)
	}
	if second.Added != 0 || len(second.Skipped) != 1 {
		t.Fatalf("second run should be a no-op: %+v", second)
	}
	if afterSecond := readRaw(t, datasetPath); afterSecond != afterFirst {
		t.Fatal("second run must not rewrite the file")
	}
}

func TestExpandDryRunDoesNotWrite(t *testing.T) {
	datasetPath, additionsPath := fixture(t, datasetJSON, `[
	  {"id":"banana","word":"banana","phonetic":"/bəˈnɑːnə/","pos":"n","meaning":"香蕉","letter":"B","example":"A banana.","exampleTranslation":"一根香蕉。"}
	]`)
	before := readRaw(t, datasetPath)
	result, err := Expand(datasetPath, additionsPath, true)
	if err != nil || result.Added != 1 {
		t.Fatalf("dry run: %+v, %v", result, err)
	}
	if after := readRaw(t, datasetPath); after != before {
		t.Fatal("dry run must not write")
	}
}
