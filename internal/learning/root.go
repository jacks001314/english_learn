package learning

import (
	"fmt"
	"os"
	"path/filepath"
)

// FindProjectRoot 从 start（为空时取当前工作目录）开始向上查找项目根目录。
// 判定标准是同时存在 backend/primary_school.json 与 web/index.html。
// 也可以用 ENGLISH_LEARN_ROOT 直接指定根目录。
func FindProjectRoot(start string) (string, error) {
	if configured := os.Getenv("ENGLISH_LEARN_ROOT"); configured != "" {
		absolute, err := filepath.Abs(configured)
		if err != nil {
			return "", err
		}
		return absolute, nil
	}
	current := start
	if current == "" {
		working, err := os.Getwd()
		if err != nil {
			return "", err
		}
		current = working
	}
	current, err := filepath.Abs(current)
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
