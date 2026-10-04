package learning

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func clearConfigEnv(t *testing.T) {
	t.Helper()
	for _, key := range []string{
		"ENGLISH_LEARN_ROOT",
		"ENGLISH_LEARN_CONFIG",
		"ENGLISH_LEARN_ADDR",
		"ENGLISH_LEARN_DB",
		"ENGLISH_LEARN_BACKUPS_DIR",
		"ENGLISH_LEARN_LOG_LEVEL",
		"ENGLISH_LEARN_LOG_FORMAT",
	} {
		t.Setenv(key, "")
	}
}

func TestDefaultConfigKeepsHistoricalDefaults(t *testing.T) {
	root := t.TempDir()
	cfg := DefaultConfig(root)
	if cfg.Address != ":8080" {
		t.Fatalf("addr = %q, want :8080", cfg.Address)
	}
	if cfg.DatabasePath != filepath.Join(root, "english_learn.db") {
		t.Fatalf("dbPath = %q", cfg.DatabasePath)
	}
	if cfg.BackupsDir != filepath.Join(root, "backups") {
		t.Fatalf("backupsDir = %q", cfg.BackupsDir)
	}
	if cfg.LogLevel != "info" || cfg.LogFormat != "text" {
		t.Fatalf("log defaults = %q/%q", cfg.LogLevel, cfg.LogFormat)
	}
	if err := cfg.Validate(); err != nil {
		t.Fatalf("default config should be valid: %v", err)
	}
}

func TestLoadConfigLayersFileThenEnvironment(t *testing.T) {
	clearConfigEnv(t)
	root := t.TempDir()
	file := `{"addr":":9000","dbPath":"data/learn.db","backupsDir":"snapshots","logLevel":"warn","logFormat":"json"}`
	if err := os.WriteFile(filepath.Join(root, "config.json"), []byte(file), 0o600); err != nil {
		t.Fatal(err)
	}
	t.Setenv("ENGLISH_LEARN_ADDR", ":9500")
	t.Setenv("ENGLISH_LEARN_LOG_LEVEL", "debug")

	cfg, err := LoadConfig(root)
	if err != nil {
		t.Fatalf("LoadConfig: %v", err)
	}
	if cfg.Address != ":9500" {
		t.Fatalf("env should override file addr, got %q", cfg.Address)
	}
	if cfg.DatabasePath != filepath.Join(root, "data", "learn.db") {
		t.Fatalf("relative dbPath should resolve against root, got %q", cfg.DatabasePath)
	}
	if cfg.BackupsDir != filepath.Join(root, "snapshots") {
		t.Fatalf("backupsDir = %q", cfg.BackupsDir)
	}
	if cfg.LogLevel != "debug" {
		t.Fatalf("env should override logLevel, got %q", cfg.LogLevel)
	}
	if cfg.LogFormat != "json" {
		t.Fatalf("logFormat should come from file, got %q", cfg.LogFormat)
	}
}

func TestLoadConfigWithoutFileFallsBackToDefaults(t *testing.T) {
	clearConfigEnv(t)
	root := t.TempDir()
	cfg, err := LoadConfig(root)
	if err != nil {
		t.Fatalf("LoadConfig: %v", err)
	}
	if cfg.Address != ":8080" || cfg.DatabasePath != filepath.Join(root, "english_learn.db") {
		t.Fatalf("unexpected defaults: %+v", cfg)
	}
}

func TestLoadConfigRejectsInvalidLogSettings(t *testing.T) {
	clearConfigEnv(t)
	root := t.TempDir()
	if err := os.WriteFile(filepath.Join(root, "config.json"), []byte(`{"logLevel":"loud"}`), 0o600); err != nil {
		t.Fatal(err)
	}
	if _, err := LoadConfig(root); err == nil || !strings.Contains(err.Error(), "logLevel") {
		t.Fatalf("want logLevel validation error, got %v", err)
	}

	if err := os.WriteFile(filepath.Join(root, "config.json"), []byte(`{"logFormat":"xml"}`), 0o600); err != nil {
		t.Fatal(err)
	}
	if _, err := LoadConfig(root); err == nil || !strings.Contains(err.Error(), "logFormat") {
		t.Fatalf("want logFormat validation error, got %v", err)
	}
}

func TestLoadConfigRejectsBrokenJSON(t *testing.T) {
	clearConfigEnv(t)
	root := t.TempDir()
	if err := os.WriteFile(filepath.Join(root, "config.json"), []byte(`{"addr":`), 0o600); err != nil {
		t.Fatal(err)
	}
	if _, err := LoadConfig(root); err == nil || !strings.Contains(err.Error(), "parse config") {
		t.Fatalf("want parse error, got %v", err)
	}
}

func TestFindProjectRootWalksUpFromSubdirectory(t *testing.T) {
	clearConfigEnv(t)
	root := t.TempDir()
	if err := os.MkdirAll(filepath.Join(root, "backend"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(filepath.Join(root, "web"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(root, "backend", "primary_school.json"), []byte("[]"), 0o600); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(root, "web", "index.html"), []byte("<html></html>"), 0o600); err != nil {
		t.Fatal(err)
	}
	nested := filepath.Join(root, "a", "b")
	if err := os.MkdirAll(nested, 0o755); err != nil {
		t.Fatal(err)
	}
	got, err := FindProjectRoot(nested)
	if err != nil {
		t.Fatalf("FindProjectRoot: %v", err)
	}
	if got != root {
		t.Fatalf("root = %q, want %q", got, root)
	}
}

func TestFindProjectRootHonoursEnvironmentOverride(t *testing.T) {
	clearConfigEnv(t)
	root := t.TempDir()
	t.Setenv("ENGLISH_LEARN_ROOT", root)
	got, err := FindProjectRoot("")
	if err != nil {
		t.Fatalf("FindProjectRoot: %v", err)
	}
	if got != root {
		t.Fatalf("root = %q, want %q", got, root)
	}
}
