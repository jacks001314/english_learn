package learning

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func (s *Store) loadCountries(root string) error {
	file, err := os.Open(filepath.Join(root, "backend", "countries.txt"))
	if err != nil {
		return err
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		parts := strings.SplitN(scanner.Text(), "|", 2)
		if len(parts) != 2 {
			continue
		}
		meaning, word := strings.TrimSpace(parts[0]), strings.TrimSpace(parts[1])
		if word == "" || meaning == "" {
			continue
		}
		for _, level := range []string{"primary", "middle"} {
			id := "country-" + normalizeID(word)
			if _, exists := s.wordIndex[progressKey(level, id)]; exists {
				continue
			}
			item := Word{ID: id, Word: word, Meaning: meaning, Level: level, Pos: "n.", Letter: string([]rune(strings.ToUpper(word))[0]), Topic: "国家", Grade: "", Unit: "国家名称"}
			s.datasets[level] = append(s.datasets[level], item)
			s.wordIndex[progressKey(level, id)] = item
		}
	}
	if err := scanner.Err(); err != nil {
		return fmt.Errorf("load countries: %w", err)
	}
	return nil
}
