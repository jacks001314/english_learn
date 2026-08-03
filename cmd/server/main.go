package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"

	"english_learn/internal/learning"
)

func main() {
	address := flag.String("addr", ":8080", "HTTP listen address")
	flag.Parse()
	root, err := findProjectRoot()
	if err != nil {
		panic(err)
	}
	if err := learning.Run(root, *address); err != nil {
		panic(err)
	}
}

func findProjectRoot() (string, error) {
	if configured := os.Getenv("ENGLISH_LEARN_ROOT"); configured != "" {
		return filepath.Abs(configured)
	}
	current, err := os.Getwd()
	if err != nil {
		return "", err
	}
	for {
		if fileExists(filepath.Join(current, "backend", "primary_school.json")) && fileExists(filepath.Join(current, "web", "index.html")) {
			return current, nil
		}
		parent := filepath.Dir(current)
		if parent == current {
			return "", fmt.Errorf("project root not found; set ENGLISH_LEARN_ROOT")
		}
		current = parent
	}
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	return err == nil && !info.IsDir()
}
