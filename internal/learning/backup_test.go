package learning

import (
	"bytes"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"

	bolt "go.etcd.io/bbolt"
)

func seedTestDB(t *testing.T, path, value string) {
	t.Helper()
	handle, err := bolt.Open(path, 0o600, nil)
	if err != nil {
		t.Fatalf("open %s: %v", path, err)
	}
	defer handle.Close()
	if err := handle.Update(func(tx *bolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists([]byte(settingsBucket))
		if err != nil {
			return err
		}
		return bucket.Put([]byte(dailyGoalKey), []byte(value))
	}); err != nil {
		t.Fatalf("seed %s: %v", path, err)
	}
}

func readTestDB(t *testing.T, path string) string {
	t.Helper()
	handle, err := OpenDatabaseReadOnly(path)
	if err != nil {
		t.Fatalf("open %s: %v", path, err)
	}
	defer handle.Close()
	var value string
	if err := handle.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(settingsBucket))
		if bucket == nil {
			return nil
		}
		value = string(bucket.Get([]byte(dailyGoalKey)))
		return nil
	}); err != nil {
		t.Fatalf("read %s: %v", path, err)
	}
	return value
}

func TestOfflineBackupAndRestoreRoundTrip(t *testing.T) {
	dir := t.TempDir()
	dbPath := filepath.Join(dir, "english_learn.db")
	seedTestDB(t, dbPath, "first")

	backups := filepath.Join(dir, "backups")
	snapshot, err := CreateBackupFromFile(dbPath, backups)
	if err != nil {
		t.Fatalf("CreateBackupFromFile: %v", err)
	}
	if !strings.HasPrefix(filepath.Base(snapshot), backupFilePrefix) {
		t.Fatalf("unexpected snapshot name %q", snapshot)
	}
	if err := VerifyDatabase(snapshot); err != nil {
		t.Fatalf("VerifyDatabase: %v", err)
	}
	if got := readTestDB(t, snapshot); got != "first" {
		t.Fatalf("snapshot content = %q, want first", got)
	}

	// 备份之后把源库改成新值，再恢复回去，确认恢复覆盖生效。
	seedTestDB(t, dbPath, "second")
	saved, err := RestoreDatabase(DefaultConfig(dir), snapshot)
	if err != nil {
		t.Fatalf("RestoreDatabase: %v", err)
	}
	if got := readTestDB(t, dbPath); got != "first" {
		t.Fatalf("restored value = %q, want first", got)
	}
	if saved == "" {
		t.Fatal("expected the previous database to be preserved")
	}
	if got := readTestDB(t, saved); got != "second" {
		t.Fatalf("preserved database value = %q, want second", got)
	}

	items, err := ListBackups(backups)
	if err != nil {
		t.Fatalf("ListBackups: %v", err)
	}
	if len(items) != 1 || items[0].Path != snapshot {
		t.Fatalf("ListBackups = %+v", items)
	}
	if items[0].SizeBytes == 0 {
		t.Fatal("backup size should be reported")
	}
}

func TestOnlineBackupSnapshotsOpenDatabase(t *testing.T) {
	store := &Store{}
	previous := store.db
	t.Cleanup(func() { store.db = previous })

	dir := t.TempDir()
	handle, err := bolt.Open(filepath.Join(dir, "live.db"), 0o600, nil)
	if err != nil {
		t.Fatalf("open live store.db: %v", err)
	}
	store.db = handle
	t.Cleanup(func() { handle.Close() })
	if err := initDB(handle); err != nil {
		t.Fatalf("initDB: %v", err)
	}
	if err := handle.Update(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(settingsBucket)).Put([]byte(dailyGoalKey), []byte("live"))
	}); err != nil {
		t.Fatalf("write live value: %v", err)
	}

	snapshot, err := store.CreateBackup(filepath.Join(dir, "backups"))
	if err != nil {
		t.Fatalf("CreateBackup: %v", err)
	}
	if err := VerifyDatabase(snapshot); err != nil {
		t.Fatalf("VerifyDatabase: %v", err)
	}
	if got := readTestDB(t, snapshot); got != "live" {
		t.Fatalf("snapshot content = %q, want live", got)
	}
}

func TestOnlineBackupRequiresOpenDatabase(t *testing.T) {
	store := &Store{}
	previous := store.db
	t.Cleanup(func() { store.db = previous })
	store.db = nil
	if _, err := store.CreateBackup(filepath.Join(t.TempDir(), "backups")); err == nil {
		t.Fatal("expected an error when no database is open")
	}
}

func TestOpenDatabaseReadOnlyReportsLockedFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "locked.db")
	seedTestDB(t, path, "held")
	holder, err := bolt.Open(path, 0o600, nil)
	if err != nil {
		t.Fatalf("hold lock: %v", err)
	}
	defer holder.Close()
	if _, err := OpenDatabaseReadOnly(path); !errors.Is(err, ErrDatabaseLocked) {
		t.Fatalf("want ErrDatabaseLocked, got %v", err)
	}
}

func TestRestoreRejectsLockedTarget(t *testing.T) {
	dir := t.TempDir()
	dbPath := filepath.Join(dir, "english_learn.db")
	seedTestDB(t, dbPath, "current")
	snapshot, err := CreateBackupFromFile(dbPath, filepath.Join(dir, "backups"))
	if err != nil {
		t.Fatalf("CreateBackupFromFile: %v", err)
	}
	before, err := os.ReadFile(dbPath)
	if err != nil {
		t.Fatalf("read target: %v", err)
	}
	holder, err := bolt.Open(dbPath, 0o600, nil)
	if err != nil {
		t.Fatalf("hold lock: %v", err)
	}
	defer holder.Close()
	if _, err := RestoreDatabase(DefaultConfig(dir), snapshot); !errors.Is(err, ErrDatabaseLocked) {
		t.Fatalf("want ErrDatabaseLocked, got %v", err)
	}
	// 目标库仍被占用，恢复必须完全不动它：直接比对文件字节。
	after, err := os.ReadFile(dbPath)
	if err != nil {
		t.Fatalf("read target: %v", err)
	}
	if !bytes.Equal(after, before) {
		t.Fatal("locked target database must not be modified")
	}
}
