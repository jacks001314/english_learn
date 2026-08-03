package contenttasks

import (
	"os"
	"path/filepath"
	"testing"
)

func TestBuildCreatesPrioritizedTasks(t *testing.T) {
	p := filepath.Join(t.TempDir(), "w.json")
	_ = os.WriteFile(p, []byte(`[{"id":"run","word":"run","meaning":"跑；经营"},{"id":"cat","word":"cat","meaning":"猫","phonetic":"/kæt/","example":"A cat.","exampleTranslation":"一只猫。"}]`), 0600)
	r, e := Build(p)
	if e != nil {
		t.Fatal(e)
	}
	if len(r.Tasks) != 1 || r.Counts["audio"] != 0 || r.Counts["multi_sense"] != 0 || r.Tasks[0].ID != "run" {
		t.Fatalf("unexpected report: %+v", r)
	}
}

func TestBuildDoesNotGuessSensesFromPunctuation(t *testing.T) {
	p := filepath.Join(t.TempDir(), "words.json")
	raw := `[{"id":"bank","word":"bank","meaning":"银行；河岸","phonetic":"/bæŋk/","example":"I went to the bank.","exampleTranslation":"我去了银行。"}]`
	if err := os.WriteFile(p, []byte(raw), 0600); err != nil {
		t.Fatal(err)
	}
	r, err := Build(p)
	if err != nil {
		t.Fatal(err)
	}
	if len(r.Tasks) != 0 || r.Counts["multi_sense"] != 0 {
		t.Fatalf("unexpected report: %+v", r)
	}
}

func TestBuildTreatsCompletedSensesAsExamples(t *testing.T) {
	p := filepath.Join(t.TempDir(), "w.json")
	_ = os.WriteFile(p, []byte(`[{"id":"bank","word":"bank","meaning":"银行；河岸","phonetic":"/bæŋk/","senses":[{"id":"a","meaning":"银行","example":"I went to the bank.","exampleTranslation":"我去了银行。"},{"id":"b","meaning":"河岸","example":"We sat on the bank.","exampleTranslation":"我们坐在河岸上。"}]}]`), 0600)
	r, e := Build(p)
	if e != nil {
		t.Fatal(e)
	}
	if len(r.Tasks) != 0 {
		t.Fatalf("unexpected tasks: %+v", r.Tasks)
	}
}
