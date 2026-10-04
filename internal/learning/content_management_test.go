package learning

import (
	"path/filepath"
	"testing"

	bolt "go.etcd.io/bbolt"
)

func TestAdminContentCRUDAndSoftDeletion(t *testing.T) {
	store := &Store{}
	oldDB, oldData, oldIndex := store.db, store.datasets, store.wordIndex
	t.Cleanup(func() { store.db, store.datasets, store.wordIndex = oldDB, oldData, oldIndex })
	database, err := bolt.Open(filepath.Join(t.TempDir(), "crud.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	store.db = database
	store.datasets = map[string][]Word{"primary": {}, "middle": {}}
	store.wordIndex = map[string]Word{}
	if _, err := store.upsertManagedWords("middle", []Word{{ID: "create", Word: "create", Meaning: "创造"}}); err != nil {
		t.Fatal(err)
	}
	if w, ok := store.findWord("middle", "create"); !ok || w.Meaning != "创造" {
		t.Fatal("word not created")
	}
	if _, err := store.upsertManagedWords("middle", []Word{{ID: "create", Word: "create", Meaning: "创建"}}); err != nil {
		t.Fatal(err)
	}
	if w, _ := store.findWord("middle", "create"); w.Meaning != "创建" {
		t.Fatal("word not updated")
	}
	if err := store.deleteManagedWord("middle", "create"); err != nil {
		t.Fatal(err)
	}
	if _, ok := store.findWord("middle", "create"); ok {
		t.Fatal("word not deleted")
	}
	seed := Article{ID: "seed-story", Title: "Seed Story"}
	if err := store.upsertSeedArticles([]Article{seed}); err != nil {
		t.Fatal(err)
	}
	if err := store.deleteArticle(seed.ID); err != nil {
		t.Fatal(err)
	}
	if err := store.upsertSeedArticles([]Article{seed}); err != nil {
		t.Fatal(err)
	}
	if _, ok, err := store.readArticle(seed.ID); err != nil || ok {
		t.Fatal("deleted seed article returned")
	}
	seed.Title = "Editor Story"
	if err := store.upsertArticles([]Article{seed}); err != nil {
		t.Fatal(err)
	}
	if a, ok, _ := store.readArticle(seed.ID); !ok || a.Title != "Editor Story" {
		t.Fatal("article not restored by editor")
	}
}
