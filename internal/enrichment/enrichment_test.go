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

// A retired id is skipped instead of failing, so a batch list that still carries
// the legacy patch entries of a deduped row can be applied again after the row
// is gone.
func TestApplyRetiringSkipsRetiredPatches(t *testing.T) {
	dir := t.TempDir()
	dataset := filepath.Join(dir, "words.json")
	patches := filepath.Join(dir, "patches.json")
	if err := os.WriteFile(dataset, []byte(`[{"id":"work","word":"work","meaning":"工作"},{"id":"work.","word":"work","meaning":"工作；劳动"}]`), 0600); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(patches, []byte(`[{"id":"work.","example":"I work here."},{"id":"work","meaning":"工作；劳动"}]`), 0600); err != nil {
		t.Fatal(err)
	}
	retired := Retirements{"work.": {ID: "work.", ReplacedBy: "work", Reason: "id 尾部混入句点"}}
	count, err := ApplyRetiring(dataset, patches, retired)
	if err != nil || count != 1 {
		t.Fatalf("applyRetiring = %d, %v", count, err)
	}
	words, err := read[Word](dataset)
	if err != nil {
		t.Fatal(err)
	}
	if len(words) != 2 || words[0].Meaning != "工作；劳动" || words[1].Example != "" {
		t.Fatalf("retired patch was applied or survivor missed: %+v", words)
	}
}

// Without a retirement the strict "word not found" guard must stay in place, so
// a typo in a hand-written patch is still caught.
func TestApplyRejectsUnknownIDWithoutRetirement(t *testing.T) {
	dir := t.TempDir()
	dataset := filepath.Join(dir, "words.json")
	patches := filepath.Join(dir, "patches.json")
	if err := os.WriteFile(dataset, []byte(`[{"id":"work","word":"work","meaning":"工作"}]`), 0600); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(patches, []byte(`[{"id":"work.","example":"I work here."}]`), 0600); err != nil {
		t.Fatal(err)
	}
	if _, err := ApplyRetiring(dataset, patches, nil); err == nil {
		t.Fatal("expected an error for a patch id missing from the dataset")
	}
}

func TestApplyRetirementsRemovesAndIsIdempotent(t *testing.T) {
	dir := t.TempDir()
	dataset := filepath.Join(dir, "words.json")
	retire := filepath.Join(dir, "retire.json")
	if err := os.WriteFile(dataset, []byte(`[{"id":"subway","word":"subway","meaning":"地铁"},{"id":"subway：","word":"subway","meaning":"地铁"},{"id":"train","word":"train","meaning":"火车"}]`), 0600); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(retire, []byte(`[{"id":"subway：","replacedBy":"subway","reason":"id 尾部混入全角冒号"}]`), 0600); err != nil {
		t.Fatal(err)
	}
	first, err := ApplyRetirements(dataset, retire)
	if err != nil || first.Removed != 1 || first.Absent != 0 {
		t.Fatalf("first run = %+v, %v", first, err)
	}
	words, err := read[Word](dataset)
	if err != nil || len(words) != 2 {
		t.Fatalf("unexpected dataset: %+v, %v", words, err)
	}
	second, err := ApplyRetirements(dataset, retire)
	if err != nil || second.Removed != 0 || second.Absent != 1 {
		t.Fatalf("second run is not idempotent: %+v, %v", second, err)
	}
	after, err := read[Word](dataset)
	if err != nil || len(after) != 2 || after[0].ID != "subway" {
		t.Fatalf("second run changed the dataset: %+v, %v", after, err)
	}
}

func TestReadRetirementsRejectsDuplicates(t *testing.T) {
	dir := t.TempDir()
	retire := filepath.Join(dir, "retire.json")
	if err := os.WriteFile(retire, []byte(`[{"id":"work."},{"id":"WORK."}]`), 0600); err != nil {
		t.Fatal(err)
	}
	if _, err := ReadRetirements(retire); err == nil {
		t.Fatal("expected an error for a duplicated retirement id")
	}
}
