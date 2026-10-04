package learning

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	bolt "go.etcd.io/bbolt"
)

func TestArticlesAreStoredAndReadFromDatabase(t *testing.T) {
	store := &Store{}
	oldDB := store.db
	t.Cleanup(func() { store.db = oldDB })
	database, err := bolt.Open(filepath.Join(t.TempDir(), "articles.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { database.Close() })
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	store.db = database

	items := []Article{{
		ID: "ai-teacher", Title: "Can AI Be a Good Teacher?", ChineseTitle: "人工智能能成为好老师吗？",
		Grade: "八年级", Topic: "人工智能", Paragraphs: []ArticleParagraph{{English: "AI can help.", Chinese: "人工智能可以提供帮助。"}},
	}}
	if err := store.upsertArticles(items); err != nil {
		t.Fatal(err)
	}
	if err := store.upsertArticles(items); err != nil {
		t.Fatal(err)
	}

	all, err := store.readArticles()
	if err != nil {
		t.Fatal(err)
	}
	if len(all) != 1 || all[0].Topic != "人工智能" || len(all[0].Paragraphs) != 1 {
		t.Fatalf("unexpected articles: %+v", all)
	}
	item, ok, err := store.readArticle("AI-TEACHER")
	if err != nil || !ok || item.ChineseTitle == "" {
		t.Fatalf("unexpected article: %+v, ok=%v, err=%v", item, ok, err)
	}
	stats, err := contentLibraryStats(database)
	if err != nil || stats.Articles != 1 {
		t.Fatalf("unexpected stats: %+v, err=%v", stats, err)
	}
}

func TestImportArticleFileSeedsDatabase(t *testing.T) {
	store := &Store{}
	oldDB := store.db
	t.Cleanup(func() { store.db = oldDB })
	database, err := bolt.Open(filepath.Join(t.TempDir(), "seed.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(t.TempDir(), "articles.json")
	raw, _ := json.Marshal([]Article{{ID: "seed", Title: "Seed Article", Grade: "七年级"}})
	if err := os.WriteFile(path, raw, 0600); err != nil {
		t.Fatal(err)
	}
	store.db = database
	if err := store.importArticleFile(path); err != nil {
		t.Fatal(err)
	}
	stats, err := contentLibraryStats(database)
	if err != nil || stats.Articles != 1 {
		t.Fatalf("unexpected stats: %+v, err=%v", stats, err)
	}
}

func TestUpsertArticlesValidatesRequiredFields(t *testing.T) {
	store := &Store{}
	oldDB := store.db
	t.Cleanup(func() { store.db = oldDB })
	database, err := bolt.Open(filepath.Join(t.TempDir(), "invalid.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	store.db = database
	if err := store.upsertArticles([]Article{{ID: "missing-title"}}); err == nil {
		t.Fatal("expected validation error")
	}
}
