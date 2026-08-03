package learning

import (
	"path/filepath"
	"testing"

	bolt "go.etcd.io/bbolt"
)

func TestDraftContentIsHiddenFromStudents(t *testing.T) {
	oldDB, oldData := db, datasets
	t.Cleanup(func() { db, datasets = oldDB, oldData })
	database, err := bolt.Open(filepath.Join(t.TempDir(), "publish.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	db = database
	if err := upsertArticles([]Article{{ID: "draft", Title: "Draft", Status: "draft"}, {ID: "live", Title: "Live", Status: "published"}}); err != nil {
		t.Fatal(err)
	}
	public, _ := readArticles()
	all, _ := readAllArticles()
	if len(public) != 1 || public[0].ID != "live" || len(all) != 2 {
		t.Fatalf("unexpected visibility public=%+v all=%+v", public, all)
	}
	datasets = map[string][]Word{"primary": {{ID: "draft", Word: "draft", Status: "draft"}, {ID: "live", Word: "live", Status: "published"}}, "middle": {}}
	page := NewService().Words(WordFilter{Level: "primary", Page: 1})
	if page.Total != 1 || page.Items[0].ID != "live" {
		t.Fatalf("draft word visible: %+v", page)
	}
	service := NewService()
	if _, ok := service.Word("primary", "draft"); ok {
		t.Fatal("draft word was available through detail endpoint")
	}
	if facets := service.WordFacets("primary"); len(facets.Topics) != 0 {
		t.Fatalf("draft word leaked into facets: %+v", facets)
	}
	if _, err := service.Quiz("primary", "draft", "en-zh"); err == nil || err.Error() != "word not found" {
		t.Fatalf("draft word was accepted by quiz: %v", err)
	}
}

func TestCannotDisableLastAdmin(t *testing.T) {
	old := db
	t.Cleanup(func() { db = old })
	database, err := bolt.Open(filepath.Join(t.TempDir(), "admins.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	db = database
	if err := seedAdmin(); err != nil {
		t.Fatal(err)
	}
	users, _ := allUsers()
	off := false
	if _, err := updateUser(users[0].ID, UserUpdate{Active: &off}); err == nil {
		t.Fatal("last admin was disabled")
	}
	if _, err := updateUser(users[0].ID, UserUpdate{Role: "student"}); err == nil {
		t.Fatal("last admin was demoted")
	}
}
