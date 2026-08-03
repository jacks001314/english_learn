package autofill

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func TestApplyUsesOnlySafeRulesAndPreservesFields(t *testing.T) {
	p := filepath.Join(t.TempDir(), "w.json")
	input := `[{"id":"lucy","word":"Lucy","meaning":"露西（女名）","phonetic":"/luːsi/","pos":"n.","letter":"L","senses":[{"id":"one","meaning":"露西"}]},{"id":"run","word":"run","meaning":"跑","phonetic":"/rʌn/"},{"id":"japan","word":"Japan","meaning":"日本","phonetic":"/dʒəˈpæn/"}]`
	if err := os.WriteFile(p, []byte(input), 0600); err != nil {
		t.Fatal(err)
	}
	r, err := Apply(p, "七年级")
	if err != nil {
		t.Fatal(err)
	}
	if r.Updated != 2 || r.ByRule["person-name"] != 1 || r.ByRule["country"] != 1 {
		t.Fatalf("unexpected result: %+v", r)
	}
	var got []map[string]json.RawMessage
	raw, _ := os.ReadFile(p)
	if err := json.Unmarshal(raw, &got); err != nil {
		t.Fatal(err)
	}
	for _, key := range []string{"phonetic", "pos", "letter", "senses"} {
		if _, ok := got[0][key]; !ok {
			t.Fatalf("field %q was lost", key)
		}
	}
	if string(got[1]["phonetic"]) != `"/rʌn/"` {
		t.Fatal("untouched record changed")
	}
}
