package learning

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	bolt "go.etcd.io/bbolt"
)

func openTestDB(t *testing.T) *bolt.DB {
	t.Helper()
	database, err := bolt.Open(filepath.Join(t.TempDir(), "upgrade.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	if err := initDB(database); err != nil {
		database.Close()
		t.Fatal(err)
	}
	return database
}

func TestExamPublishingScoringAndUserIsolation(t *testing.T) {
	store := &Store{}
	old := store.db
	t.Cleanup(func() { store.db = old })
	database, err := bolt.Open(filepath.Join(t.TempDir(), "exam.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	store.db = database
	draft := ExamPaper{ID: "draft", Title: "Draft", Status: "draft"}
	if _, err := store.saveExamPaper(draft, "admin"); err != nil {
		t.Fatal(err)
	}
	paper := ExamPaper{ID: "paper", Title: "Test Paper", Status: "published", DurationMinutes: 30, TotalScore: 10, Sections: []ExamSection{{Title: "Questions", Questions: []ExamQuestion{{ID: "q1", Type: "choice", Prompt: "Choose B", Options: []string{"A", "B"}, Answer: "B", Score: 4}, {ID: "q2", Type: "fill", Prompt: "Complete", Answer: "better", Score: 3}, {ID: "q3", Type: "writing", Prompt: "Write", Answer: "rubric", Score: 3}}}}}
	if _, err := store.saveExamPaper(paper, "admin"); err != nil {
		t.Fatal(err)
	}
	public, _ := store.examPapers(false)
	all, _ := store.examPapers(true)
	if len(public) != 1 || len(all) != 2 {
		t.Fatalf("visibility public=%d all=%d", len(public), len(all))
	}
	user := User{ID: "student"}
	attempt, err := store.submitExam(user, ExamSubmission{PaperID: "paper", StartedAt: time.Now().Add(-time.Minute).Format(time.RFC3339), Answers: map[string]any{"q1": "B", "q2": "wrong", "q3": "essay text"}})
	if err != nil {
		t.Fatal(err)
	}
	if attempt.Score != 4 || attempt.TotalScore != 10 || attempt.Accuracy != 50 {
		t.Fatalf("unexpected score: %+v", attempt)
	}
	mine, _ := store.userExamAttempts("student")
	other, _ := store.userExamAttempts("other")
	if len(mine) != 1 || len(other) != 0 {
		t.Fatal("exam attempts leaked between users")
	}
}

func TestImportExamFileIsIdempotent(t *testing.T) {
	store := &Store{}
	old := store.db
	t.Cleanup(func() { store.db = old })
	database, err := bolt.Open(filepath.Join(t.TempDir(), "seed.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	store.db = database
	path := filepath.Join("..", "..", "backend", "exams.json")
	if err := store.importExamFile(database, path); err != nil {
		t.Fatal(err)
	}
	if err := store.importExamFile(database, path); err != nil {
		t.Fatal(err)
	}
	items, err := store.examPapers(true)
	if err != nil || len(items) < 1 {
		t.Fatalf("unexpected seeded exams: %d %v", len(items), err)
	}
}

func TestSeedUpgradesVerifiedSourceShell(t *testing.T) {
	store := &Store{}
	database := openTestDB(t)
	defer database.Close()
	store.db = database
	shell := ExamPaper{ID: "upgrade-paper", Title: "Source shell", Status: "published", AttachmentURL: "https://example.test/paper.pdf"}
	if _, err := store.saveExamPaper(shell, "seed"); err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(t.TempDir(), "paper.json")
	raw := `[{"id":"upgrade-paper","title":"Structured","status":"published","durationMinutes":30,"totalScore":1,"sections":[{"id":"s","title":"Questions","questions":[{"id":"q","type":"choice","prompt":"Choose A","options":["A","B"],"answer":"A","score":1}]}]}]`
	if err := os.WriteFile(path, []byte(raw), 0600); err != nil {
		t.Fatal(err)
	}
	if err := store.importExamFile(database, path); err != nil {
		t.Fatal(err)
	}
	got, ok, err := store.examPaper("upgrade-paper")
	if err != nil || !ok || len(got.Sections) != 1 || got.Title != "Structured" {
		t.Fatalf("shell was not upgraded: %#v %v", got, err)
	}
}

func TestPublishedExamValidationAndCalculatedScore(t *testing.T) {
	store := &Store{}
	old := store.db
	t.Cleanup(func() { store.db = old })
	database := openTestDB(t)
	defer database.Close()
	store.db = database

	invalid := ExamPaper{
		ID: "invalid-paper", Title: "Invalid", Status: "published", DurationMinutes: 30,
		Sections: []ExamSection{{Title: "Choice", Questions: []ExamQuestion{{
			ID: "q1", Type: "choice", Prompt: "Choose", Options: []string{"only one"}, Answer: "B", Score: 2,
		}}}},
	}
	if _, err := store.saveExamPaper(invalid, "admin"); err == nil {
		t.Fatal("expected invalid published choice question to be rejected")
	}

	valid := invalid
	valid.ID = "valid-paper"
	valid.Sections[0].Questions[0].Options = []string{"first", "second"}
	valid.Sections[0].Questions[0].Answer = "B"
	valid.Sections[0].Questions = append(valid.Sections[0].Questions, ExamQuestion{
		ID: "q2", Type: "fill", Prompt: "Complete", Answer: "answer", Score: 3,
	})
	saved, err := store.saveExamPaper(valid, "admin")
	if err != nil {
		t.Fatal(err)
	}
	if saved.TotalScore != 5 {
		t.Fatalf("expected calculated total score 5, got %.1f", saved.TotalScore)
	}

	valid.ID = "duplicate-paper"
	valid.Sections[0].Questions[1].ID = "q1"
	if _, err := store.saveExamPaper(valid, "admin"); err == nil {
		t.Fatal("expected duplicate question IDs to be rejected")
	}
}
