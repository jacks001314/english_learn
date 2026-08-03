package learning

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	bolt "go.etcd.io/bbolt"
)

func TestFactoryDraftRequiresExplicitPublish(t *testing.T) {
	oldDB := db
	t.Cleanup(func() { db = oldDB })
	database, err := bolt.Open(filepath.Join(t.TempDir(), "factory.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	db = database
	article := Article{ID: "factory-article", Title: "Reviewed Article", Status: "draft", Paragraphs: []ArticleParagraph{{English: "A useful learning article."}}}
	raw, _ := json.Marshal(article)
	draft := FactoryDraft{ID: "draft-1", TaskID: "task-1", ContentType: "article", RawJSON: raw, ExtractedText: "A useful learning article.", ReviewStatus: "pending", Version: 1}
	if err := db.Update(func(tx *bolt.Tx) error {
		return putJSON(tx.Bucket([]byte(contentFactoryDraftsBucket)), draft.ID, draft)
	}); err != nil {
		t.Fatal(err)
	}
	items, _ := readArticles()
	if len(items) != 0 {
		t.Fatalf("unpublished factory draft leaked: %+v", items)
	}
	if err := publishFactoryDraft(draft.ID, User{Username: "admin"}); err != nil {
		t.Fatal(err)
	}
	items, _ = readArticles()
	if len(items) != 1 || items[0].ID != article.ID {
		t.Fatalf("published article missing: %+v", items)
	}
}

func TestFactoryPublishUpdatesTaskAndDraftStatus(t *testing.T) {
	oldDB := db
	t.Cleanup(func() { db = oldDB })
	database, err := bolt.Open(filepath.Join(t.TempDir(), "factory-status.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	db = database
	raw, _ := json.Marshal(Article{ID: "status-article", Title: "Status", Status: "draft"})
	task := FactoryTask{ID: "task-status", Status: "review", CurrentStep: "等待审核"}
	draft := FactoryDraft{ID: "draft-status", TaskID: task.ID, ContentType: "article", RawJSON: raw, ReviewStatus: "pending"}
	if err := db.Update(func(tx *bolt.Tx) error {
		if err := putJSON(tx.Bucket([]byte(contentFactoryTasksBucket)), task.ID, task); err != nil {
			return err
		}
		return putJSON(tx.Bucket([]byte(contentFactoryDraftsBucket)), draft.ID, draft)
	}); err != nil {
		t.Fatal(err)
	}
	if err := publishFactoryDraft(draft.ID, User{Username: "admin"}); err != nil {
		t.Fatal(err)
	}
	gotTask, _, _ := getFactoryTask(task.ID)
	gotDraft, _, _ := getFactoryDraft(draft.ID)
	if gotTask.Status != "published" || gotDraft.ReviewStatus != "published" {
		t.Fatalf("status not updated task=%+v draft=%+v", gotTask, gotDraft)
	}
}

func TestFactoryExamValidationWarnsWhenNoQuestions(t *testing.T) {
	raw, _ := json.Marshal(ExamPaper{ID: "paper", Title: "Paper", Status: "draft"})
	issues := validateFactoryDraft(FactoryDraft{ContentType: "exam", RawJSON: raw, ExtractedText: "exam text"})
	if len(issues) == 0 || issues[0].Code != "no_questions" {
		t.Fatalf("unexpected validation: %+v", issues)
	}
}

func TestFactoryExamValidationRejectsScoreMismatchAndDuplicateIDs(t *testing.T) {
	raw, _ := json.Marshal(ExamPaper{ID: "paper", Title: "Paper", TotalScore: 10, Sections: []ExamSection{{Questions: []ExamQuestion{{ID: "q1", Type: "choice", Prompt: "One", Options: []string{"a", "b"}, Answer: "A", Score: 2}, {ID: "q1", Type: "choice", Prompt: "Two", Options: []string{"a", "b"}, Answer: "B", Score: 2}}}}})
	issues := validateFactoryDraft(FactoryDraft{ContentType: "exam", RawJSON: raw, ExtractedText: "text"})
	codes := map[string]bool{}
	for _, x := range issues {
		codes[x.Code] = true
	}
	if !codes["duplicate_question_id"] || !codes["score_mismatch"] {
		t.Fatalf("missing validation issues: %+v", issues)
	}
}

func TestExtractJSONObjectRejectsNonJSONAndAcceptsFence(t *testing.T) {
	if _, err := extractJSONObject("not json"); err == nil {
		t.Fatal("expected error")
	}
	raw, err := extractJSONObject("```json\n{\"ok\":true}\n```")
	if err != nil || !bytes.Contains(raw, []byte(`"ok":true`)) {
		t.Fatalf("unexpected: %s %v", raw, err)
	}
}

func TestExtractDOCXAsset(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "sample.docx")
	file, err := os.Create(path)
	if err != nil {
		t.Fatal(err)
	}
	zw := zip.NewWriter(file)
	w, _ := zw.Create("word/document.xml")
	_, _ = w.Write([]byte(`<w:document xmlns:w="w"><w:body><w:p><w:r><w:t>Hello world.</w:t></w:r></w:p></w:body></w:document>`))
	_ = zw.Close()
	_ = file.Close()
	text, issues := extractDOCXAsset(&FactoryFile{StoragePath: path})
	if text != "Hello world.\n" || len(issues) > 0 {
		t.Fatalf("text=%q issues=%+v", text, issues)
	}
}

func TestDownloadFactoryURLBlocksLocalhost(t *testing.T) {
	if _, err := downloadFactoryURL(t.TempDir(), "http://127.0.0.1/private"); err == nil {
		t.Fatal("localhost must be blocked")
	}
}
