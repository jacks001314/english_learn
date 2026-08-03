package contentaudit

import (
	"os"
	"path/filepath"
	"testing"
)

func TestAuditCountsPerSenseExamplesAndAudio(t *testing.T) {
	p := filepath.Join(t.TempDir(), "words.json")
	raw := `[{"id":"run","phonetic":"/rʌn/","meaning":"跑；经营","example":"I run.","exampleTranslation":"我跑步。"},{"id":"book","meaning":"书"}]`
	if e := os.WriteFile(p, []byte(raw), 0600); e != nil {
		t.Fatal(e)
	}
	s, e := AuditFile(p)
	if e != nil {
		t.Fatal(e)
	}
	if s.MissingPhonetic != 1 || s.MissingAudio != 2 || s.MissingExamples != 1 || s.MultipleSenses != 0 || s.SensesWithoutExamples != 1 {
		t.Fatalf("unexpected audit: %+v", s)
	}
}
