package wordcheck

import (
	"os"
	"path/filepath"
	"testing"
)

func TestCheckFileFindsStructuralProblems(t *testing.T) {
	path := filepath.Join(t.TempDir(), "words.json")
	raw := `[
  {"id":"apple","word":"apple","meaning":"苹果","phonetic":"/apple/","letter":"A"},
  {"id":"APPLE","word":"","meaning":"","phonetic":"/broken","letter":"AA"},
  {"id":"brush","word":"writing brush n","meaning":"毛笔 p.12","letter":"W"},
  {"id":"apple2","word":"Apple","meaning":"苹果","letter":"A"}
]`
	if err := os.WriteFile(path, []byte(raw), 0600); err != nil {
		t.Fatal(err)
	}
	report, issues := CheckFile(path)
	if report.Words != 4 || report.Errors != 3 || report.Warns != 5 {
		t.Fatalf("unexpected summary: %+v issues=%+v", report, issues)
	}
	want := map[string]bool{"duplicate_id": false, "empty_word": false, "empty_meaning": false, "phonetic_delimiter": false, "invalid_letter": false, "word_contains_pos": false, "meaning_page_reference": false, "duplicate_word": false}
	for _, item := range issues {
		if _, ok := want[item.Code]; ok {
			want[item.Code] = true
		}
	}
	for code, found := range want {
		if !found {
			t.Fatalf("missing issue %s: %+v", code, issues)
		}
	}
}

func TestCheckFileRejectsInvalidJSON(t *testing.T) {
	path := filepath.Join(t.TempDir(), "words.json")
	if err := os.WriteFile(path, []byte(`[{`), 0600); err != nil {
		t.Fatal(err)
	}
	report, issues := CheckFile(path)
	if report.Errors != 0 || len(issues) != 1 || issues[0].Code != "invalid_json" {
		t.Fatalf("unexpected invalid JSON result: %+v %+v", report, issues)
	}
}
