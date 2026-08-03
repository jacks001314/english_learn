package learning

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
	"time"

	bolt "go.etcd.io/bbolt"
)

func TestCalculateNextReview(t *testing.T) {
	now := time.Date(2026, 7, 19, 10, 0, 0, 0, time.UTC)
	if got := CalculateNextReview(Progress{}, Progress{Wrong: 1}, now); !got.Equal(now.Add(24 * time.Hour)) {
		t.Fatalf("wrong answer review = %v, want tomorrow", got)
	}
	if got := CalculateNextReview(Progress{}, Progress{Mastered: true}, now); !got.Equal(now.Add(7 * 24 * time.Hour)) {
		t.Fatalf("mastered review = %v, want 7 days", got)
	}
	for streak, days := range []int{1, 3, 7, 14, 30, 60, 60} {
		got := CalculateNextReview(Progress{ReviewStreak: streak + 1}, Progress{Review: true, Correct: 1}, now)
		if want := now.Add(time.Duration(days) * 24 * time.Hour); !got.Equal(want) {
			t.Fatalf("review streak %d = %v, want %v", streak+1, got, want)
		}
	}
}

func TestSummarize(t *testing.T) {
	seen, mastered, correct, wrong, mistakes := summarize(map[string]Progress{
		"primary:a": {Mastered: true, Correct: 3},
		"middle:b":  {Wrong: 2},
		"middle:c":  {Wrong: 1, Resolved: true},
	})
	if seen != 3 || mastered != 1 || correct != 3 || wrong != 3 || mistakes != 1 {
		t.Fatalf("unexpected summary: %d %d %d %d %d", seen, mastered, correct, wrong, mistakes)
	}
}

func TestLearningStreakCountsConsecutiveDays(t *testing.T) {
	now := time.Date(2026, 7, 19, 10, 0, 0, 0, time.UTC)
	progress := map[string]Progress{
		"primary:a": {LastSeen: "2026-07-19T09:00:00Z"},
		"primary:b": {LastSeen: "2026-07-18T09:00:00Z"},
		"primary:c": {LastSeen: "2026-07-17T09:00:00Z"},
		"primary:d": {LastSeen: "2026-07-15T09:00:00Z"},
	}
	if got := learningStreak(progress, now); got != 3 {
		t.Fatalf("streak = %d, want 3", got)
	}
}

func TestProgressKeySeparatesLevels(t *testing.T) {
	if progressKey("primary", "Apple") == progressKey("middle", "Apple") {
		t.Fatal("primary and middle progress keys must differ")
	}
	if got := progressKey("unknown", " Apple "); got != "primary:apple" {
		t.Fatalf("unexpected normalized key: %s", got)
	}
}

func TestWordsFiltersContentMetadataAndSearch(t *testing.T) {
	oldDatasets := datasets
	t.Cleanup(func() { datasets = oldDatasets })
	datasets = map[string][]Word{"primary": {
		{ID: "apple", Word: "apple", Meaning: "苹果", Example: "I eat an apple.", Topic: "食物", Grade: "三年级", Unit: "Unit 1"},
		{ID: "book", Word: "book", Meaning: "书", Topic: "学习用品", Grade: "三年级", Unit: "Unit 2"},
		{ID: "cat", Word: "cat", Meaning: "猫", Topic: "动物", Grade: "四年级", Unit: "Unit 1"},
	}}
	service := NewService()
	page := service.Words(WordFilter{Level: "primary", Topic: "食物", Grade: "三年级", Page: 1})
	if page.Total != 1 || page.Items[0].ID != "apple" {
		t.Fatalf("unexpected metadata filter: %+v", page)
	}
	page = service.Words(WordFilter{Level: "primary", Query: "eat", Page: 1})
	if page.Total != 1 || page.Items[0].ID != "apple" {
		t.Fatalf("example search failed: %+v", page)
	}
	facets := service.WordFacets("primary")
	if len(facets.Topics) != 3 || len(facets.Grades) != 2 || len(facets.Units) != 2 {
		t.Fatalf("unexpected facets: %+v", facets)
	}
}

func TestWordsFiltersLetterAndPartOfSpeech(t *testing.T) {
	oldDatasets := datasets
	t.Cleanup(func() { datasets = oldDatasets })
	datasets = map[string][]Word{"primary": {
		{ID: "apple", Word: "apple", Pos: "n.", Letter: "A"},
		{ID: "ask", Word: "ask", Pos: "v.", Letter: "A"},
		{ID: "book", Word: "book", Pos: "n.", Letter: "B"},
	}}
	service := NewService()
	page := service.Words(WordFilter{Level: "primary", Letter: "A", PartOfSpeech: "verb", Page: 1})
	if page.Total != 1 || page.Items[0].ID != "ask" {
		t.Fatalf("unexpected category filter: %+v", page)
	}
	facets := service.WordFacets("primary")
	if len(facets.Letters) != 2 || len(facets.PartsOfSpeech) != 2 {
		t.Fatalf("unexpected category facets: %+v", facets)
	}
}

func TestWordsSortsAlphabetically(t *testing.T) {
	oldDatasets := datasets
	t.Cleanup(func() { datasets = oldDatasets })
	datasets = map[string][]Word{"primary": {{ID: "cat", Word: "cat"}, {ID: "apple", Word: "Apple"}, {ID: "book", Word: "book"}}}
	asc := NewService().Words(WordFilter{Level: "primary", Sort: "word-asc", Page: 1})
	desc := NewService().Words(WordFilter{Level: "primary", Sort: "word-desc", Page: 1})
	if asc.Items[0].ID != "apple" || desc.Items[0].ID != "cat" {
		t.Fatalf("unexpected sorting: asc=%+v desc=%+v", asc.Items, desc.Items)
	}
}

func TestPartOfSpeechRecognition(t *testing.T) {
	cases := map[string][]string{"n.": {"noun"}, "v & n": {"noun", "verb"}, "adj & adv": {"adjective", "adverb"}, "pron.": {"pronoun"}, "phr.": {"phrase"}}
	for input, want := range cases {
		got := wordPartsOfSpeech(input)
		for _, part := range want {
			if !contains(got, part) {
				t.Fatalf("%q = %v, missing %s", input, got, part)
			}
		}
	}
}

func TestLoadCountriesAddsBothLevels(t *testing.T) {
	oldDatasets, oldIndex := datasets, wordIndex
	t.Cleanup(func() { datasets, wordIndex = oldDatasets, oldIndex })
	root := t.TempDir()
	if err := os.MkdirAll(filepath.Join(root, "backend"), 0700); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(root, "backend", "countries.txt"), []byte("中国|China\n日本|Japan\n"), 0600); err != nil {
		t.Fatal(err)
	}
	datasets = map[string][]Word{"primary": {}, "middle": {}}
	wordIndex = map[string]Word{}
	if err := loadCountries(root); err != nil {
		t.Fatal(err)
	}
	if len(datasets["primary"]) != 2 || len(datasets["middle"]) != 2 {
		t.Fatalf("unexpected country counts: %+v", datasets)
	}
	if word, ok := findWord("primary", "country-china"); !ok || word.Topic != "国家" || word.Meaning != "中国" {
		t.Fatalf("unexpected country word: %+v %v", word, ok)
	}
}

func TestQuizSupportsChineseToEnglish(t *testing.T) {
	oldDatasets, oldIndex := datasets, wordIndex
	t.Cleanup(func() { datasets, wordIndex = oldDatasets, oldIndex })
	datasets = map[string][]Word{"primary": {
		{ID: "apple", Word: "apple", Meaning: "苹果"}, {ID: "book", Word: "book", Meaning: "书"},
		{ID: "cat", Word: "cat", Meaning: "猫"}, {ID: "dog", Word: "dog", Meaning: "狗"},
	}}
	wordIndex = map[string]Word{"primary:apple": datasets["primary"][0]}
	quiz, err := NewService().Quiz("primary", "apple", "zh-en")
	if err != nil {
		t.Fatal(err)
	}
	if quiz.Type != "zh-en" || quiz.Prompt != "苹果" || quiz.Answer != "apple" || !contains(quiz.Options, "apple") {
		t.Fatalf("unexpected quiz: %+v", quiz)
	}
}

func TestQuizSupportsListeningAndSpelling(t *testing.T) {
	oldDatasets, oldIndex := datasets, wordIndex
	t.Cleanup(func() { datasets, wordIndex = oldDatasets, oldIndex })
	datasets = map[string][]Word{"primary": {{ID: "apple", Word: "apple", Meaning: "苹果"}, {ID: "book", Word: "book", Meaning: "书"}, {ID: "cat", Word: "cat", Meaning: "猫"}, {ID: "dog", Word: "dog", Meaning: "狗"}}}
	wordIndex = map[string]Word{"primary:apple": datasets["primary"][0]}
	listen, err := NewService().Quiz("primary", "apple", "listen")
	if err != nil || listen.Answer != "apple" || len(listen.Options) != 4 {
		t.Fatalf("unexpected listening quiz: %+v %v", listen, err)
	}
	spelling, err := NewService().Quiz("primary", "apple", "spelling")
	if err != nil || spelling.Prompt != "苹果" || spelling.Answer != "apple" || len(spelling.Options) != 0 {
		t.Fatalf("unexpected spelling quiz: %+v %v", spelling, err)
	}
}

func TestQuizSupportsExampleCloze(t *testing.T) {
	oldDatasets, oldIndex := datasets, wordIndex
	t.Cleanup(func() { datasets, wordIndex = oldDatasets, oldIndex })
	datasets = map[string][]Word{"primary": {
		{ID: "apple", Word: "apple", Meaning: "苹果", Example: "I eat an Apple every day."},
		{ID: "book", Word: "book", Meaning: "书", Example: "This book is new."},
		{ID: "cat", Word: "cat", Meaning: "猫", Example: "The cat is small."},
		{ID: "dog", Word: "dog", Meaning: "狗", Example: "The dog can run."},
	}}
	wordIndex = map[string]Word{"primary:apple": datasets["primary"][0]}
	quiz, err := NewService().Quiz("primary", "apple", "cloze")
	if err != nil {
		t.Fatal(err)
	}
	if quiz.Prompt != "I eat an ____ every day." || quiz.Answer != "apple" || !contains(quiz.Options, "apple") {
		t.Fatalf("unexpected cloze quiz: %+v", quiz)
	}
}

func TestUpdateProgressAccumulatesAndSchedulesReview(t *testing.T) {
	oldDB := db
	t.Cleanup(func() { db = oldDB })
	var err error
	db, err = bolt.Open(filepath.Join(t.TempDir(), "test.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	if err := initDB(db); err != nil {
		t.Fatal(err)
	}

	now := time.Date(2026, 7, 19, 10, 0, 0, 0, time.UTC)
	key := progressKey("primary", "apple")
	first, err := UpdateProgress(key, Progress{Seen: 1, Wrong: 1}, now)
	if err != nil {
		t.Fatal(err)
	}
	if first.Wrong != 1 || first.Resolved {
		t.Fatalf("unexpected first progress: %+v", first)
	}
	second, err := UpdateProgress(key, Progress{Seen: 1, Correct: 1, Mastered: true}, now.Add(time.Hour))
	if err != nil {
		t.Fatal(err)
	}
	if second.Seen != 2 || second.Correct != 1 || second.Wrong != 1 || !second.Resolved || !second.Mastered {
		t.Fatalf("unexpected accumulated progress: %+v", second)
	}
	due, err := time.Parse(time.RFC3339, second.NextReview)
	if err != nil {
		t.Fatal(err)
	}
	if !due.Equal(now.Add(time.Hour).Add(7 * 24 * time.Hour)) {
		t.Fatalf("unexpected review date: %v", due)
	}
}

func TestReviewProgressGrowsAndResetsInterval(t *testing.T) {
	oldDB := db
	t.Cleanup(func() { db = oldDB })
	var err error
	db, err = bolt.Open(filepath.Join(t.TempDir(), "test.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	if err := initDB(db); err != nil {
		t.Fatal(err)
	}

	now := time.Date(2026, 7, 19, 10, 0, 0, 0, time.UTC)
	key := progressKey("primary", "apple")
	first, err := UpdateProgress(key, Progress{Seen: 1, Correct: 1, Mastered: true, Review: true}, now)
	if err != nil {
		t.Fatal(err)
	}
	if first.ReviewCount != 1 || first.ReviewStreak != 1 || first.IntervalDays != 1 {
		t.Fatalf("unexpected first review: %+v", first)
	}
	second, err := UpdateProgress(key, Progress{Seen: 1, Correct: 1, Mastered: true, Review: true}, now.Add(24*time.Hour))
	if err != nil {
		t.Fatal(err)
	}
	if second.ReviewCount != 2 || second.ReviewStreak != 2 || second.IntervalDays != 3 {
		t.Fatalf("unexpected second review: %+v", second)
	}
	failed, err := UpdateProgress(key, Progress{Seen: 1, Wrong: 1, Review: true}, now.Add(48*time.Hour))
	if err != nil {
		t.Fatal(err)
	}
	if failed.ReviewCount != 3 || failed.ReviewStreak != 0 || failed.IntervalDays != 1 || failed.Resolved || failed.Mastered {
		t.Fatalf("unexpected failed review: %+v", failed)
	}
}

func TestUpdateProgressAccumulatesQuizResults(t *testing.T) {
	oldDB := db
	t.Cleanup(func() { db = oldDB })
	var err error
	db, err = bolt.Open(filepath.Join(t.TempDir(), "test.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	if err := initDB(db); err != nil {
		t.Fatal(err)
	}
	key := "primary:apple"
	now := time.Date(2026, 7, 19, 10, 0, 0, 0, time.UTC)
	_, err = UpdateProgress(key, Progress{Correct: 1, QuizResults: map[string]QuizResult{"en-zh": {Correct: 1}}}, now)
	if err != nil {
		t.Fatal(err)
	}
	saved, err := UpdateProgress(key, Progress{Wrong: 1, QuizResults: map[string]QuizResult{"en-zh": {Wrong: 1}, "zh-en": {Wrong: 1}}}, now.Add(time.Hour))
	if err != nil {
		t.Fatal(err)
	}
	if saved.QuizResults["en-zh"].Correct != 1 || saved.QuizResults["en-zh"].Wrong != 1 || saved.QuizResults["zh-en"].Wrong != 1 {
		t.Fatalf("unexpected quiz results: %+v", saved.QuizResults)
	}
}

func TestMigrateLegacyProgress(t *testing.T) {
	oldIndex := wordIndex
	t.Cleanup(func() { wordIndex = oldIndex })
	wordIndex = map[string]Word{progressKey("primary", "apple"): {ID: "apple", Level: "primary"}}
	database, err := bolt.Open(filepath.Join(t.TempDir(), "test.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	if err := database.Update(func(tx *bolt.Tx) error {
		raw, _ := json.Marshal(Progress{Seen: 1})
		return tx.Bucket([]byte(progressBucket)).Put([]byte("apple"), raw)
	}); err != nil {
		t.Fatal(err)
	}
	if err := migrateLegacyProgress(database); err != nil {
		t.Fatal(err)
	}
	if err := database.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(progressBucket))
		if bucket.Get([]byte("apple")) != nil {
			t.Fatal("legacy key was not removed")
		}
		if bucket.Get([]byte("primary:apple")) == nil {
			t.Fatal("new level-aware key missing")
		}
		return nil
	}); err != nil {
		t.Fatal(err)
	}
}

func TestInitDBCreatesContentLibraryBuckets(t *testing.T) {
	database, err := bolt.Open(filepath.Join(t.TempDir(), "test.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	if err := database.View(func(tx *bolt.Tx) error {
		for _, name := range []string{progressBucket, settingsBucket, contentMetaBucket, wordsBucket, pronunciationsBucket, examplesBucket, articlesBucket, articleWordsBucket} {
			if tx.Bucket([]byte(name)) == nil {
				t.Fatalf("missing bucket %s", name)
			}
		}
		raw := tx.Bucket([]byte(contentMetaBucket)).Get([]byte(contentSchemaKey))
		var version int
		if err := json.Unmarshal(raw, &version); err != nil {
			return err
		}
		if version != contentSchemaVersion {
			t.Fatalf("schema version = %d", version)
		}
		return nil
	}); err != nil {
		t.Fatal(err)
	}
}

func TestImportContentLibraryIsIdempotent(t *testing.T) {
	oldDatasets := datasets
	t.Cleanup(func() { datasets = oldDatasets })
	datasets = map[string][]Word{"primary": {{ID: "apple", Word: "apple", Meaning: "苹果", Phonetic: "/æpl/", Example: "I eat an apple.", ExampleTranslation: "我吃一个苹果。"}}}
	database, err := bolt.Open(filepath.Join(t.TempDir(), "content.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	if err := importContentLibrary(database); err != nil {
		t.Fatal(err)
	}
	if err := importContentLibrary(database); err != nil {
		t.Fatal(err)
	}
	stats, err := contentLibraryStats(database)
	if err != nil {
		t.Fatal(err)
	}
	if stats.Words != 1 || stats.Pronunciations != 1 || stats.Examples != 1 {
		t.Fatalf("unexpected stats: %+v", stats)
	}
}

func TestImportContentLibraryImportsSenseExamples(t *testing.T) {
	old := datasets
	t.Cleanup(func() { datasets = old })
	datasets = map[string][]Word{"primary": {{
		ID: "light", Word: "light", Meaning: "光；轻的",
		Senses: []WordSenseContent{
			{ID: "noun", Meaning: "光", Example: "Turn on the light.", ExampleTranslation: "打开灯。"},
			{ID: "adj", Meaning: "轻的", Example: "The bag is light.", ExampleTranslation: "包很轻。"},
		},
	}}}
	database, err := bolt.Open(filepath.Join(t.TempDir(), "sense.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	if err := importContentLibrary(database); err != nil {
		t.Fatal(err)
	}
	stats, err := contentLibraryStats(database)
	if err != nil {
		t.Fatal(err)
	}
	if stats.Words != 1 || stats.Examples != 2 {
		t.Fatalf("unexpected stats: %+v", stats)
	}
}

func TestTodayReviewFiltersLevelAndDueDate(t *testing.T) {
	oldDB, oldIndex := db, wordIndex
	t.Cleanup(func() { db, wordIndex = oldDB, oldIndex })
	var err error
	db, err = bolt.Open(filepath.Join(t.TempDir(), "test.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	if err := initDB(db); err != nil {
		t.Fatal(err)
	}
	wordIndex = map[string]Word{
		"primary:apple": {ID: "apple", Word: "apple", Level: "primary"},
		"middle:apple":  {ID: "apple", Word: "apple", Level: "middle"},
		"primary:book":  {ID: "book", Word: "book", Level: "primary"},
	}
	now := time.Date(2026, 7, 19, 10, 0, 0, 0, time.UTC)
	if err := db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(progressBucket))
		for key, progress := range map[string]Progress{
			"primary:apple": {NextReview: now.Add(-time.Hour).Format(time.RFC3339)},
			"middle:apple":  {NextReview: now.Add(-time.Hour).Format(time.RFC3339)},
			"primary:book":  {LastReviewed: now.Add(-time.Hour).Format(time.RFC3339), NextReview: now.Add(time.Hour).Format(time.RFC3339)},
		} {
			raw, _ := json.Marshal(progress)
			if err := bucket.Put([]byte(key), raw); err != nil {
				return err
			}
		}
		return nil
	}); err != nil {
		t.Fatal(err)
	}

	queue, err := NewService().TodayReview("primary", now)
	if err != nil {
		t.Fatal(err)
	}
	if len(queue.Items) != 1 || queue.Items[0].Word.Level != "primary" || queue.Items[0].Word.ID != "apple" {
		t.Fatalf("unexpected primary reviews: %+v", queue)
	}
	if queue.Completed != 1 || queue.Total != 1 || queue.Goal != 10 {
		t.Fatalf("unexpected review summary: %+v", queue)
	}
	all, err := NewService().TodayReview("", now)
	if err != nil || len(all.Items) != 2 {
		t.Fatalf("unexpected all reviews: %+v, err=%v", all, err)
	}
}
