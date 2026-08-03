package enrichment

import (
	"os"
	"path/filepath"
	"testing"
)

func TestApplyAddsMetadata(t *testing.T) {
	dir := t.TempDir()
	dataset := filepath.Join(dir, "words.json")
	patches := filepath.Join(dir, "patches.json")
	if err := os.WriteFile(dataset, []byte(`[{"id":"apple","word":"apple","meaning":"苹果"}]`), 0600); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(patches, []byte(`[{"id":"apple","example":"An apple.","topic":"食物","grade":"三年级","unit":"Unit 1"}]`), 0600); err != nil {
		t.Fatal(err)
	}
	count, err := Apply(dataset, patches)
	if err != nil || count != 1 {
		t.Fatalf("apply = %d, %v", count, err)
	}
	words, err := read[Word](dataset)
	if err != nil || words[0].Example != "An apple." || words[0].Topic != "食物" {
		t.Fatalf("unexpected words: %+v, %v", words, err)
	}
}

func TestApplyDoesNotClearFieldsAbsentFromPatch(t *testing.T) {
	dir := t.TempDir()
	dataset := filepath.Join(dir, "words.json")
	patches := filepath.Join(dir, "patches.json")
	if err := os.WriteFile(dataset, []byte(`[{"id":"bank","word":"bank","meaning":"银行；河岸","example":"I went to the bank.","exampleTranslation":"我去了银行。"}]`), 0600); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(patches, []byte(`[{"id":"bank","senses":[{"id":"bank-finance","meaning":"银行","example":"The bank opens at nine.","exampleTranslation":"银行九点开门。"}]}]`), 0600); err != nil {
		t.Fatal(err)
	}
	if _, err := Apply(dataset, patches); err != nil {
		t.Fatal(err)
	}
	words, err := read[Word](dataset)
	if err != nil {
		t.Fatal(err)
	}
	if words[0].Example != "I went to the bank." || len(words[0].Senses) != 1 {
		t.Fatalf("patch removed existing content: %+v", words[0])
	}
}
