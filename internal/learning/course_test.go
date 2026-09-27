package learning

import (
	"fmt"
	"os"
	"path/filepath"
	"testing"
)

// TestCourseLoadsTextbookContent guards the Grade 7 Book 1 content extracted
// from the textbook scans: every section must expose vocabulary, phrases,
// sentence patterns, grammar, knowledge notes, article text and a listening script.
func TestCourseLoadsTextbookContent(t *testing.T) {
	data, err := loadCourse(filepath.Join("..", ".."))
	if err != nil {
		t.Fatalf("loadCourse: %v", err)
	}
	webRoot := filepath.Join("..", "..", "web")
	assertAudio := func(label, url string) {
		t.Helper()
		if url == "" {
			t.Fatalf("%s: audio url is empty", label)
		}
		if _, err := os.Stat(filepath.Join(webRoot, filepath.FromSlash(url))); err != nil {
			t.Fatalf("%s: audio file missing for %s: %v", label, url, err)
		}
	}

	var book *courseBook
	for i := range data.Books {
		if data.Books[i].Book == "七年级上册" {
			book = &data.Books[i]
		}
	}
	if book == nil {
		t.Fatal("七年级上册 course book missing")
	}
	if len(book.Sections) != 7 {
		t.Fatalf("七年级上册 sections = %d, want 7 (Starter + Unit 1-6)", len(book.Sections))
	}

	wantTitles := []string{
		"Welcome to junior high!",
		"A new start",
		"More than fun",
		"Family ties",
		"Time to celebrate",
		"The power of plants",
		"Fantastic friends",
	}
	totalWords := 0
	for i, section := range book.Sections {
		if section.Title != wantTitles[i] {
			t.Fatalf("section %d title = %q, want %q", i, section.Title, wantTitles[i])
		}
		if len(section.Words) == 0 {
			t.Fatalf("%s: no words", section.Section)
		}
		if len(section.Phrases) == 0 {
			t.Fatalf("%s: no phrases", section.Section)
		}
		if len(section.Patterns) == 0 {
			t.Fatalf("%s: no sentence patterns", section.Section)
		}
		if section.Grammar.Topic == "" {
			t.Fatalf("%s: no grammar topic", section.Section)
		}
		if len(section.Notes) == 0 {
			t.Fatalf("%s: no knowledge notes", section.Section)
		}
		if section.Article.Reading.Title == "" || len(section.Article.Reading.Paragraphs) == 0 {
			t.Fatalf("%s: no reading passage", section.Section)
		}
		if len(section.Listening.Script) == 0 {
			t.Fatalf("%s: no listening script", section.Section)
		}
		assertAudio(section.Section+" words", section.WordsAudio)
		assertAudio(section.Section+" reading", section.Article.Reading.Audio)
		if section.Section != "Starter" {
			extras := section.Article.Extra
			if len(extras) == 0 || extras[len(extras)-1].Audio == "" {
				t.Fatalf("%s: missing Reading for writing audio", section.Section)
			}
			assertAudio(section.Section+" writing", extras[len(extras)-1].Audio)
		}
		if len(section.Listening.Tracks) < 3 {
			t.Fatalf("%s: listening tracks = %d, want at least 3", section.Section, len(section.Listening.Tracks))
		}
		for i, track := range section.Listening.Tracks {
			assertAudio(fmt.Sprintf("%s listening track %d", section.Section, i+1), track.URL)
		}
		totalWords += len(section.Words)
	}
	if totalWords < 290 {
		t.Fatalf("七年级上册 vocabulary = %d words, want the full textbook list", totalWords)
	}

	// Unit 1-6 each carry the Reading for writing recording and a phonetics drill;
	// the whole book also ships appendix recordings.
	for _, section := range book.Sections {
		if section.Section == "Starter" {
			continue
		}
		if section.Listening.Phonetics == nil {
			t.Fatalf("%s: missing phonetics audio", section.Section)
		}
		assertAudio(section.Section+" phonetics", section.Listening.Phonetics.URL)
	}
	if len(book.AppendixAudios) == 0 {
		t.Fatal("七年级上册: missing appendix audio")
	}
	for i, audio := range book.AppendixAudios {
		assertAudio(fmt.Sprintf("appendix %d", i+1), audio.URL)
	}
}
