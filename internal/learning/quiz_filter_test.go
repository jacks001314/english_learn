package learning

import (
	"path/filepath"
	"testing"
	"time"

	bolt "go.etcd.io/bbolt"
)

func quizDatasets() map[string][]Word {
	return map[string][]Word{
		"primary": {
			{ID: "apple", Word: "apple", Meaning: "苹果", Pos: "n.", Topic: "食物", Grade: "三年级", Letter: "a", Level: "primary"},
			{ID: "book", Word: "book", Meaning: "书", Pos: "n.", Topic: "学习用品", Grade: "三年级", Letter: "b", Level: "primary"},
			{ID: "run", Word: "run", Meaning: "跑", Pos: "v.", Topic: "运动", Grade: "四年级", Letter: "r", Level: "primary"},
			{ID: "jump", Word: "jump", Meaning: "跳跃", Pos: "v.", Topic: "运动", Grade: "四年级", Letter: "j", Level: "primary"},
		},
		"middle": {
			{ID: "improve", Word: "improve", Meaning: "改善", Pos: "v.", Topic: "成长", Letter: "i", Level: "middle"},
			{ID: "knowledge", Word: "knowledge", Meaning: "知识", Pos: "n.", Topic: "学习用品", Letter: "k", Level: "middle"},
			{ID: "honest", Word: "honest", Meaning: "诚实的", Pos: "adj.", Topic: "品格", Letter: "h", Level: "middle"},
			{ID: "quickly", Word: "quickly", Meaning: "快速地", Pos: "adv.", Topic: "运动", Letter: "q", Level: "middle"},
		},
	}
}

// The 词义练习 pages narrow the question pool by grade, topic and part of
// speech, so a 名词 drill must only offer 名词 and 主题筛选 must stay inside the
// chosen topic.
func TestFilteredQuizHonoursMetadataFilters(t *testing.T) {
	oldDatasets := datasets
	t.Cleanup(func() { datasets = oldDatasets })
	datasets = quizDatasets()
	service := NewService()
	for _, filter := range []QuizFilter{
		{Level: "primary", Type: "en-zh", Topic: "运动"},
		{Level: "primary", Type: "zh-en", PartOfSpeech: "noun"},
		{Level: "primary", Type: "en-zh", Grade: "三年级", PartOfSpeech: "noun"},
	} {
		for attempt := 0; attempt < 20; attempt++ {
			quiz, err := service.FilteredQuiz(filter)
			if err != nil {
				t.Fatalf("filter %+v: %v", filter, err)
			}
			if !matchWordMetadata(quiz.Word, filter) {
				t.Fatalf("question left the filtered pool: %+v", quiz.Word)
			}
			if len(quiz.Options) != 4 || !containsFold(quiz.Options, quiz.Answer) {
				t.Fatalf("unexpected options: %+v", quiz)
			}
			if filter.Type == "en-zh" && quiz.Answer != quiz.Word.Meaning {
				t.Fatalf("英译中 must answer with the Chinese meaning: %+v", quiz)
			}
			if filter.Type == "zh-en" && quiz.Answer != quiz.Word.Word {
				t.Fatalf("中译英 must answer with the English word: %+v", quiz)
			}
		}
	}
}

func TestFilteredQuizScopeAllSpansBothStages(t *testing.T) {
	oldDatasets := datasets
	t.Cleanup(func() { datasets = oldDatasets })
	datasets = quizDatasets()
	service := NewService()
	seen := map[string]bool{}
	for attempt := 0; attempt < 60; attempt++ {
		quiz, err := service.FilteredQuiz(QuizFilter{Level: "all", Type: "en-zh"})
		if err != nil {
			t.Fatal(err)
		}
		seen[quiz.Word.Level] = true
	}
	if !seen["primary"] || !seen["middle"] {
		t.Fatalf("scope all stayed inside one stage: %+v", seen)
	}
}

// A topic with fewer than four words must still produce a four-option question
// instead of failing, and the answer must come from the filtered pool.
func TestFilteredQuizWidensDistractorsForNarrowFilters(t *testing.T) {
	oldDatasets := datasets
	t.Cleanup(func() { datasets = oldDatasets })
	datasets = quizDatasets()
	quiz, err := NewService().FilteredQuiz(QuizFilter{Level: "primary", Type: "en-zh", Topic: "学习用品"})
	if err != nil {
		t.Fatal(err)
	}
	if quiz.Word.ID != "book" {
		t.Fatalf("narrow filter picked the wrong word: %+v", quiz.Word)
	}
	if len(quiz.Options) != 4 {
		t.Fatalf("narrow filter must still offer four options: %+v", quiz.Options)
	}
}

func TestFilteredQuizRejectsPoolsBelowFourWords(t *testing.T) {
	oldDatasets := datasets
	t.Cleanup(func() { datasets = oldDatasets })
	datasets = map[string][]Word{"primary": {{ID: "apple", Word: "apple", Meaning: "苹果"}}}
	if _, err := NewService().FilteredQuiz(QuizFilter{Level: "primary", Type: "en-zh"}); err == nil {
		t.Fatal("a pool of one word must not produce a question")
	}
}

func TestWordFacetsMergesEveryStage(t *testing.T) {
	oldDatasets := datasets
	t.Cleanup(func() { datasets = oldDatasets })
	datasets = quizDatasets()
	primary := NewService().WordFacets("primary")
	middle := NewService().WordFacets("middle")
	merged := NewService().WordFacets("all")
	if len(merged.Topics) != 5 || len(merged.Grades) != 2 {
		t.Fatalf("unexpected merged facets: %+v", merged)
	}
	if len(primary.Topics) != 3 || len(middle.Topics) != 4 {
		t.Fatalf("per-stage facets changed: primary=%v middle=%v", primary.Topics, middle.Topics)
	}
	total := 0
	for _, letter := range merged.Letters {
		total += letter.Count
	}
	if total != len(datasets["primary"])+len(datasets["middle"]) {
		t.Fatalf("letter counts do not cover both stages: %+v", merged.Letters)
	}
	if len(merged.PartsOfSpeech) < 4 {
		t.Fatalf("merged parts of speech are incomplete: %+v", merged.PartsOfSpeech)
	}
}

// 看词选义 grades against the Chinese meaning, 看义选词 against the English
// word; both write the answer into the shared quiz progress of their type.
func TestAnswerQuizGradesEachDirection(t *testing.T) {
	oldDB, oldIndex := db, wordIndex
	t.Cleanup(func() { db, wordIndex = oldDB, oldIndex })
	database, err := bolt.Open(filepath.Join(t.TempDir(), "quiz.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer database.Close()
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	db = database
	wordIndex = map[string]Word{"primary:apple": {ID: "apple", Word: "apple", Meaning: "苹果", Level: "primary", Status: "published"}}
	now := time.Date(2026, 9, 30, 10, 0, 0, 0, time.Local)
	service := NewService()

	feedback, err := service.AnswerQuiz(QuizAnswer{Level: "primary", WordID: "apple", Type: "en-zh", Answer: "苹果"}, now)
	if err != nil || !feedback.Correct || feedback.Answer != "苹果" {
		t.Fatalf("英译中 feedback = %+v (%v)", feedback, err)
	}
	feedback, err = service.AnswerQuiz(QuizAnswer{Level: "primary", WordID: "apple", Type: "zh-en", Answer: "apple"}, now)
	if err != nil || !feedback.Correct {
		t.Fatalf("中译英 feedback = %+v (%v)", feedback, err)
	}
	feedback, err = service.AnswerQuiz(QuizAnswer{Level: "primary", WordID: "apple", Type: "en-zh", Answer: "apple"}, now)
	if err != nil || feedback.Correct || feedback.Answer != "苹果" {
		t.Fatalf("wrong 英译中 answer was accepted: %+v (%v)", feedback, err)
	}
	progress, err := service.Progress()
	if err != nil {
		t.Fatal(err)
	}
	saved := progress["primary:apple"]
	if saved.QuizResults["en-zh"].Correct != 1 || saved.QuizResults["en-zh"].Wrong != 1 || saved.QuizResults["zh-en"].Correct != 1 {
		t.Fatalf("unexpected per-mode progress: %+v", saved.QuizResults)
	}
}
