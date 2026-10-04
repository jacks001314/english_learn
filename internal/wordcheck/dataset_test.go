package wordcheck

import (
	"path/filepath"
	"testing"
)

// The shipped datasets must stay free of duplicate word forms. The strict CI gate
// (scripts/ci.ps1 runs cmd/wordcheck with -fail-on=warning) reads the same two
// files, so this test fails fast in `go test ./...` as well and points at the
// dedup batches under backend/enrichment/*_dedup_retire.json when a regression
// creeps back in.
func TestShippedDatasetsHaveNoDuplicateWords(t *testing.T) {
	paths := []string{
		filepath.Join("..", "..", "backend", "primary_school.json"),
		filepath.Join("..", "..", "backend", "middle_school.json"),
	}
	report := CheckFiles(paths)
	for _, file := range report.Files {
		if file.Words == 0 {
			t.Fatalf("%s: no words loaded, check the dataset path", file.Path)
		}
		if file.Errors != 0 || file.Warns != 0 {
			t.Fatalf("%s: %d errors, %d warnings", file.Path, file.Errors, file.Warns)
		}
	}
	if len(report.Issues) != 0 {
		t.Fatalf("dataset issues: %+v", report.Issues)
	}
}
