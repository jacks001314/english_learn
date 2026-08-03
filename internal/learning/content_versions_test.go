package learning

import (
	"encoding/json"
	"testing"
)

func TestWordContentVersionsAndRollback(t *testing.T) {
	oldDB, oldData, oldIndex := db, datasets, wordIndex
	t.Cleanup(func() { db, datasets, wordIndex = oldDB, oldData, oldIndex })
	database := openTestDB(t)
	defer database.Close()
	db = database
	seed := Word{ID: "versioned", Word: "versioned", Meaning: "旧释义", Example: "Old example.", Level: "middle", Status: "published"}
	datasets = map[string][]Word{"primary": {}, "middle": {seed}}
	wordIndex = map[string]Word{progressKey("middle", seed.ID): seed}

	draft := seed
	draft.Meaning = "草稿释义"
	draft.Status = "draft"
	if _, err := saveManagedWordVersioned("middle", draft, "editor", "save"); err != nil {
		t.Fatal(err)
	}
	versions, err := listContentVersions("word", "middle", seed.ID)
	if err != nil || len(versions) != 2 || versions[0].Action != "save" || versions[1].Action != "baseline" {
		t.Fatalf("unexpected first versions: %+v %v", versions, err)
	}

	draft.Status = "published"
	draft.Meaning = "正式释义"
	if _, err := saveManagedWordVersioned("middle", draft, "editor", "publish"); err != nil {
		t.Fatal(err)
	}
	if _, err := restoreContentVersion("word", "middle", seed.ID, 2, "reviewer"); err != nil {
		t.Fatal(err)
	}
	current, ok := findWord("middle", seed.ID)
	if !ok || current.Status != "draft" || current.Meaning != "草稿释义" {
		t.Fatalf("word rollback failed: %+v", current)
	}
	versions, _ = listContentVersions("word", "middle", seed.ID)
	if len(versions) != 4 || versions[0].Action != "rollback" || versions[0].CreatedBy != "reviewer" {
		t.Fatalf("rollback version not appended: %+v", versions)
	}
}

func TestArticleContentVersionsPreserveBaseline(t *testing.T) {
	oldDB := db
	t.Cleanup(func() { db = oldDB })
	database := openTestDB(t)
	defer database.Close()
	db = database
	seed := Article{ID: "story", Title: "Original", ChineseTitle: "原文", Paragraphs: []ArticleParagraph{{English: "Old.", Chinese: "旧。"}}}
	if err := upsertArticles([]Article{seed}); err != nil {
		t.Fatal(err)
	}

	draft := seed
	draft.Title = "Edited"
	draft.Status = "draft"
	if _, err := saveArticleVersioned(draft, "editor", "save"); err != nil {
		t.Fatal(err)
	}
	versions, err := listContentVersions("article", "", seed.ID)
	if err != nil || len(versions) != 2 {
		t.Fatalf("unexpected article versions: %+v %v", versions, err)
	}
	var baseline Article
	if err := json.Unmarshal(versions[1].Snapshot, &baseline); err != nil || baseline.Title != "Original" {
		t.Fatalf("baseline not preserved: %+v %v", baseline, err)
	}
	if _, err := restoreContentVersion("article", "", seed.ID, 1, "reviewer"); err != nil {
		t.Fatal(err)
	}
	current, ok, err := readArticle(seed.ID)
	if err != nil || !ok || current.Title != "Original" || current.Status != "published" {
		t.Fatalf("article rollback failed: %+v %v", current, err)
	}
}

func TestLegacyWordBaselineRollbackNormalizesStatus(t *testing.T) {
	oldDB, oldData, oldIndex := db, datasets, wordIndex
	t.Cleanup(func() { db, datasets, wordIndex = oldDB, oldData, oldIndex })
	database := openTestDB(t)
	defer database.Close()
	db = database
	seed := Word{ID: "legacy", Word: "legacy", Meaning: "旧内容", Example: "Legacy content.", Level: "middle"}
	datasets = map[string][]Word{"primary": {}, "middle": {seed}}
	wordIndex = map[string]Word{progressKey("middle", seed.ID): seed}

	draft := seed
	draft.Status = "draft"
	draft.Meaning = "新草稿"
	if _, err := saveManagedWordVersioned("middle", draft, "editor", "save"); err != nil {
		t.Fatal(err)
	}
	if _, err := restoreContentVersion("word", "middle", seed.ID, 1, "reviewer"); err != nil {
		t.Fatal(err)
	}
	current, ok := findWord("middle", seed.ID)
	if !ok || current.Status != "published" || current.Meaning != "旧内容" {
		t.Fatalf("legacy word rollback failed: %+v", current)
	}
}
