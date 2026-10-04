package learning

import (
	"testing"
	"time"

	bolt "go.etcd.io/bbolt"
)

func TestLearningProfileAndSmartPlanCloseTheLoop(t *testing.T) {
	store := &Store{}
	oldDB, oldData, oldIndex := store.db, store.datasets, store.wordIndex
	t.Cleanup(func() { store.db, store.datasets, store.wordIndex = oldDB, oldData, oldIndex })
	database := openTestDB(t)
	defer database.Close()
	store.db = database
	words := []Word{
		{ID: "apple", Word: "apple", Meaning: "苹果", Level: "primary", Topic: "食物", Status: "published"},
		{ID: "book", Word: "book", Meaning: "书", Level: "primary", Topic: "学习", Status: "published"},
		{ID: "cloud", Word: "cloud", Meaning: "云", Level: "primary", Topic: "自然", Status: "published"},
		{ID: "dream", Word: "dream", Meaning: "梦想", Level: "primary", Topic: "成长", Status: "published"},
	}
	store.datasets = map[string][]Word{"primary": words, "middle": {}}
	store.wordIndex = map[string]Word{}
	for _, word := range words {
		store.wordIndex[progressKey(word.Level, word.ID)] = word
	}
	if err := store.upsertArticles([]Article{{ID: "daily-reading", Title: "A Short Reading", Status: "published", Minutes: 6, Paragraphs: []ArticleParagraph{{English: "Read every day.", Chinese: "每天阅读。"}}}}); err != nil {
		t.Fatal(err)
	}

	now := time.Date(2026, 7, 27, 9, 0, 0, 0, time.Local)
	if _, err := store.UpdateProgress(progressKey("primary", "apple"), Progress{Seen: 1, Wrong: 2}, now.Add(-48*time.Hour), "student-1"); err != nil {
		t.Fatal(err)
	}
	if _, err := store.UpdateProgress(progressKey("primary", "book"), Progress{Seen: 1, Correct: 4, Mastered: true}, now.Add(-24*time.Hour), "student-1"); err != nil {
		t.Fatal(err)
	}

	service := NewService(store, "student-1")
	profile, err := service.LearningProfile("primary", now)
	if err != nil {
		t.Fatal(err)
	}
	if profile.Practiced != 2 || profile.Weak == 0 || profile.Due == 0 {
		t.Fatalf("unexpected profile summary: %+v", profile)
	}
	if len(profile.Weakest) == 0 || profile.Weakest[0].Word == nil || profile.Weakest[0].Word.ID != "apple" {
		t.Fatalf("weak word was not prioritized: %+v", profile.Weakest)
	}
	if len(profile.Dimensions) < 2 || len(profile.RecentEvents) != 2 {
		t.Fatalf("missing dimensions or event evidence: %+v", profile)
	}

	plan, err := service.SmartLearningPlan("primary", 30, now, false)
	if err != nil {
		t.Fatal(err)
	}
	if len(plan.Tasks) < 3 || plan.EstimatedMinutes > plan.TargetMinutes || plan.Summary == "" {
		t.Fatalf("invalid smart plan: %+v", plan)
	}
	if !hasPlanTask(plan, "review") || !hasPlanTask(plan, "mistakes") || !hasPlanTask(plan, "quiz") {
		t.Fatalf("priority tasks missing: %+v", plan.Tasks)
	}
	persisted, err := service.SmartLearningPlan("primary", 60, now, false)
	if err != nil || persisted.ID != plan.ID || persisted.TargetMinutes != 30 {
		t.Fatalf("daily plan was not stable: %+v %v", persisted, err)
	}

	quizTask := planTask(plan, "quiz")
	if _, err := store.UpdateProgress(progressKey("primary", "apple"), Progress{Correct: 1, QuizResults: map[string]QuizResult{"en-zh": {Correct: 1}}}, now.Add(time.Minute), "student-1"); err != nil {
		t.Fatal(err)
	}
	afterQuiz, err := service.SmartLearningPlan("primary", 30, now.Add(time.Minute), false)
	if err != nil {
		t.Fatal(err)
	}
	if !planTask(afterQuiz, "quiz").Completed || afterQuiz.CompletedTasks != 1 || quizTask.ID != planTask(afterQuiz, "quiz").ID {
		t.Fatalf("quiz did not automatically complete its plan task: %+v", afterQuiz)
	}

	mistakeTask := planTask(afterQuiz, "mistakes")
	completed, err := service.CompleteSmartPlanTask("primary", mistakeTask.ID, now.Add(2*time.Minute))
	if err != nil || !planTask(completed, "mistakes").Completed || completed.CompletedTasks != 2 {
		t.Fatalf("manual task completion failed: %+v %v", completed, err)
	}
	events, err := store.recentLearningEvents("student-1", 20)
	if err != nil || len(events) < 4 || events[0].Type != "plan_task_completed" {
		t.Fatalf("completion event missing: %+v %v", events, err)
	}
}

func hasPlanTask(plan SmartLearningPlan, taskType string) bool {
	for _, task := range plan.Tasks {
		if task.Type == taskType {
			return true
		}
	}
	return false
}

func planTask(plan SmartLearningPlan, taskType string) SmartPlanTask {
	for _, task := range plan.Tasks {
		if task.Type == taskType {
			return task
		}
	}
	return SmartPlanTask{}
}

func TestLearningEventsAreUserIsolated(t *testing.T) {
	store := &Store{}
	oldDB := store.db
	t.Cleanup(func() { store.db = oldDB })
	database := openTestDB(t)
	defer database.Close()
	store.db = database
	now := time.Date(2026, 7, 27, 10, 0, 0, 0, time.Local)
	err := store.db.Update(func(tx *bolt.Tx) error {
		if err := recordLearningEventTx(tx, LearningEvent{UserID: "a", Type: "quiz_answer", CreatedAt: now.Format(time.RFC3339Nano)}); err != nil {
			return err
		}
		return recordLearningEventTx(tx, LearningEvent{UserID: "b", Type: "word_review", CreatedAt: now.Format(time.RFC3339Nano)})
	})
	if err != nil {
		t.Fatal(err)
	}
	items, err := store.recentLearningEvents("a", 10)
	if err != nil || len(items) != 1 || items[0].UserID != "a" {
		t.Fatalf("event isolation failed: %+v %v", items, err)
	}
}

func TestRecommendedWordCandidateRejectsIncompleteAndNoisyContent(t *testing.T) {
	valid := Word{Word: "a cold", Meaning: "感冒", Example: "I caught a cold."}
	if !recommendedWordCandidate(valid) {
		t.Fatal("complete learning phrase should be eligible")
	}
	for _, item := range []Word{
		{Word: "(fri.)", Meaning: "星期五", Example: "It is Friday."},
		{Word: "apple", Meaning: "苹果"},
		{Word: "book", Example: "This is a book."},
		{Word: "cloud", Meaning: "云", Example: "A cloud moved.", Status: "draft"},
	} {
		if recommendedWordCandidate(item) {
			t.Fatalf("noisy or incomplete word was recommended: %+v", item)
		}
	}
}

func TestArticleMatchingRespectsLearningLevel(t *testing.T) {
	primary := Article{Grade: "五年级"}
	middle := Article{Grade: "八年级"}
	if !articleMatchesLevel(primary, "primary") || articleMatchesLevel(primary, "middle") {
		t.Fatal("primary article level classification failed")
	}
	if !articleMatchesLevel(middle, "middle") || articleMatchesLevel(middle, "primary") {
		t.Fatal("middle article level classification failed")
	}
}
