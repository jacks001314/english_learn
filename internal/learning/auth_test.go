package learning

import (
	"path/filepath"
	"testing"
	"time"

	bolt "go.etcd.io/bbolt"
)

func TestUserRegistrationHashesPasswordAndCreatesSession(t *testing.T) {
	old := db
	t.Cleanup(func() { db = old })
	database, err := bolt.Open(filepath.Join(t.TempDir(), "auth.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	db = database
	u, err := createUser(AuthRequest{Username: "Student01", Password: "password123", DisplayName: "Student"})
	if err != nil {
		t.Fatal(err)
	}
	if u.PasswordHash == "password123" || u.Role != "student" {
		t.Fatalf("unsafe user: %+v", u)
	}
	if _, err := createUser(AuthRequest{Username: "student01", Password: "another123"}); err == nil {
		t.Fatal("duplicate username accepted")
	}
	logged, err := authenticate("STUDENT01", "password123")
	if err != nil || logged.ID != u.ID {
		t.Fatalf("login failed: %+v %v", logged, err)
	}
	token, err := newSession(u.ID)
	if err != nil {
		t.Fatal(err)
	}
	sessionUser, ok := userFromToken(token)
	if !ok || sessionUser.ID != u.ID {
		t.Fatal("session lookup failed")
	}
}

func TestSeedAdminIsIdempotent(t *testing.T) {
	old := db
	t.Cleanup(func() { db = old })
	database, err := bolt.Open(filepath.Join(t.TempDir(), "admin.db"), 0600, nil)
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
	if err := seedAdmin(); err != nil {
		t.Fatal(err)
	}
	users, err := allUsers()
	if err != nil || len(users) != 1 || users[0].Role != "admin" || !users[0].MustChangePassword {
		t.Fatalf("unexpected admins: %+v %v", users, err)
	}
	admin, err := authenticate("admin", initialAdminPassword)
	if err != nil || !admin.MustChangePassword {
		t.Fatalf("initial admin must change password: %+v %v", admin, err)
	}
	if err := changePassword(admin, PasswordChange{CurrentPassword: initialAdminPassword, NewPassword: "Changed123!"}); err != nil {
		t.Fatal(err)
	}
	admin, err = authenticate("admin", "Changed123!")
	if err != nil || admin.MustChangePassword {
		t.Fatalf("password change requirement was not cleared: %+v %v", admin, err)
	}
}

func TestLearningDataIsIsolatedByUser(t *testing.T) {
	oldDB, oldIndex := db, wordIndex
	t.Cleanup(func() { db, wordIndex = oldDB, oldIndex })
	database, err := bolt.Open(filepath.Join(t.TempDir(), "isolated.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	db = database
	wordIndex = map[string]Word{"primary:apple": {ID: "apple", Word: "apple", Level: "primary"}}
	a, b := NewService("user-a"), NewService("user-b")
	if _, err := a.SaveProgress("primary", "apple", Progress{Seen: 1, Correct: 1}, time.Now()); err != nil {
		t.Fatal(err)
	}
	on, off := true, false
	if _, err := a.SaveProgress("primary", "apple", Progress{Mastered: true, SetMastered: &on}, time.Now()); err != nil {
		t.Fatal(err)
	}
	updated, err := a.SaveProgress("primary", "apple", Progress{SetMastered: &off}, time.Now())
	if err != nil || updated.Mastered {
		t.Fatalf("mastered state did not toggle off: %+v %v", updated, err)
	}
	pa, _ := a.Progress()
	pb, _ := b.Progress()
	if len(pa) != 1 || len(pb) != 0 {
		t.Fatalf("progress leaked: a=%v b=%v", pa, pb)
	}
	if _, err := a.SaveSettings(LearningSettings{DailyReviewGoal: 25}); err != nil {
		t.Fatal(err)
	}
	sa, _ := a.Settings()
	sb, _ := b.Settings()
	if sa.DailyReviewGoal != 25 || sb.DailyReviewGoal != 10 {
		t.Fatalf("settings leaked: a=%+v b=%+v", sa, sb)
	}
}

func TestArticleProgressIsIsolatedAndManagedWordsReload(t *testing.T) {
	oldDB, oldData, oldIndex := db, datasets, wordIndex
	t.Cleanup(func() { db, datasets, wordIndex = oldDB, oldData, oldIndex })
	database, err := bolt.Open(filepath.Join(t.TempDir(), "content.db"), 0600, nil)
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
	if _, err := saveArticleProgress("a", ArticleProgress{ArticleID: "story", Completed: true}); err != nil {
		t.Fatal(err)
	}
	a, _ := readArticleProgress("a")
	b, _ := readArticleProgress("b")
	if !a["story"].Completed || len(b) != 0 {
		t.Fatal("article progress leaked")
	}
	if n, err := upsertManagedWords("middle", []Word{{ID: "platform", Word: "platform", Meaning: "平台"}}); err != nil || n != 1 {
		t.Fatalf("import failed: %d %v", n, err)
	}
	datasets = map[string][]Word{"primary": {}, "middle": {}}
	wordIndex = map[string]Word{}
	if err := loadManagedWords(database); err != nil {
		t.Fatal(err)
	}
	if len(datasets["middle"]) != 1 || datasets["middle"][0].Word != "platform" {
		t.Fatalf("managed word did not reload: %+v", datasets)
	}
}
