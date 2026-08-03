package learning

import (
	"path/filepath"
	"testing"

	bolt "go.etcd.io/bbolt"
)

func TestAdminContentCRUDAndSoftDeletion(t *testing.T) {
	oldDB, oldData, oldIndex := db, datasets, wordIndex
	t.Cleanup(func() { db, datasets, wordIndex = oldDB, oldData, oldIndex })
	database, err := bolt.Open(filepath.Join(t.TempDir(), "crud.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	db = database
	datasets = map[string][]Word{"primary": {}, "middle": {}}
	wordIndex = map[string]Word{}
	if _, err := upsertManagedWords("middle", []Word{{ID: "create", Word: "create", Meaning: "创造"}}); err != nil {
		t.Fatal(err)
	}
	if w, ok := findWord("middle", "create"); !ok || w.Meaning != "创造" {
		t.Fatal("word not created")
	}
	if _, err := upsertManagedWords("middle", []Word{{ID: "create", Word: "create", Meaning: "创建"}}); err != nil {
		t.Fatal(err)
	}
	if w, _ := findWord("middle", "create"); w.Meaning != "创建" {
		t.Fatal("word not updated")
	}
	if err := deleteManagedWord("middle", "create"); err != nil {
		t.Fatal(err)
	}
	if _, ok := findWord("middle", "create"); ok {
		t.Fatal("word not deleted")
	}
	seed := Article{ID: "seed-story", Title: "Seed Story"}
	if err := upsertSeedArticles([]Article{seed}); err != nil {
		t.Fatal(err)
	}
	if err := deleteArticle(seed.ID); err != nil {
		t.Fatal(err)
	}
	if err := upsertSeedArticles([]Article{seed}); err != nil {
		t.Fatal(err)
	}
	if _, ok, err := readArticle(seed.ID); err != nil || ok {
		t.Fatal("deleted seed article returned")
	}
	seed.Title = "Editor Story"
	if err := upsertArticles([]Article{seed}); err != nil {
		t.Fatal(err)
	}
	if a, ok, _ := readArticle(seed.ID); !ok || a.Title != "Editor Story" {
		t.Fatal("article not restored by editor")
	}
}
