package learning

import (
	"bytes"
	"encoding/json"
	"strings"
	"testing"
)

func TestParseLogLevel(t *testing.T) {
	cases := map[string]string{
		"debug":    "DEBUG",
		"INFO":     "INFO",
		"warn":     "WARN",
		"warning":  "WARN",
		"error":    "ERROR",
		"":         "INFO",
		"nonsense": "INFO",
	}
	for input, want := range cases {
		if got := ParseLogLevel(input).String(); got != want {
			t.Fatalf("ParseLogLevel(%q) = %s, want %s", input, got, want)
		}
	}
}

func TestNewAppLoggerWritesJSONAndHonoursLevel(t *testing.T) {
	var buffer bytes.Buffer
	cfg := DefaultConfig(t.TempDir())
	cfg.LogFormat = "json"
	cfg.LogLevel = "warn"
	logger := NewAppLogger(cfg, &buffer)

	logger.Info("should be filtered out")
	logger.Warn("kept", "key", "value")

	lines := strings.Split(strings.TrimSpace(buffer.String()), "\n")
	if len(lines) != 1 {
		t.Fatalf("expected one log line, got %d: %q", len(lines), buffer.String())
	}
	var payload map[string]any
	if err := json.Unmarshal([]byte(lines[0]), &payload); err != nil {
		t.Fatalf("log line is not JSON: %v (%q)", err, lines[0])
	}
	if payload["level"] != "WARN" || payload["msg"] != "kept" || payload["key"] != "value" {
		t.Fatalf("unexpected payload: %+v", payload)
	}
}

func TestNewAppLoggerTextFormat(t *testing.T) {
	var buffer bytes.Buffer
	cfg := DefaultConfig(t.TempDir())
	logger := NewAppLogger(cfg, &buffer)
	logger.Info("hello", "n", 1)
	line := strings.TrimSpace(buffer.String())
	if !strings.Contains(line, "msg=hello") || !strings.Contains(line, "n=1") {
		t.Fatalf("unexpected text log line: %q", line)
	}
	if strings.HasPrefix(line, "{") {
		t.Fatalf("text format should not be JSON: %q", line)
	}
}
