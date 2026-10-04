package learning

import (
	"context"
	"strings"
	"testing"
	"time"
)

// agentDrillWords is a miniature library: one phrase that is easily confused
// with its neighbours plus enough words to fill four options.
func agentDrillWords() []Word {
	return []Word{
		{ID: "a cold", Word: "a cold", Meaning: "感冒", Pos: "phrase", Level: "primary", Topic: "生活", Status: "published"},
		{ID: "a bit", Word: "a bit", Meaning: "一点儿", Pos: "phrase", Level: "primary", Topic: "生活", Status: "published"},
		{ID: "a few", Word: "a few", Meaning: "几个", Pos: "phrase", Level: "primary", Topic: "生活", Status: "published"},
		{ID: "warm", Word: "warm", Meaning: "温暖的", Pos: "adjective", Level: "primary", Topic: "生活", Status: "published"},
		{ID: "mist", Word: "mist", Meaning: "薄雾", Pos: "noun", Level: "primary", Topic: "天气", Status: "published"},
		{ID: "cold", Word: "cold", Meaning: "寒冷的", Pos: "adjective", Level: "primary", Topic: "天气", Status: "published"},
	}
}

// withTestLibrary swaps in a small deterministic word library for one test.
func withTestLibrary(t *testing.T, words []Word) *Store {
	t.Helper()
	store := &Store{}
	database := openTestDB(t)
	t.Cleanup(func() { _ = database.Close() })
	store.db = database
	store.datasets = map[string][]Word{"primary": words, "middle": {}}
	store.wordIndex = map[string]Word{}
	for _, word := range words {
		store.wordIndex[progressKey(word.Level, word.ID)] = word
	}
	return store
}

func agentTestNow() time.Time {
	return time.Date(2026, 10, 4, 9, 0, 0, 0, time.Local)
}

// The browser only reports which word is on screen; the snapshot must re-read
// the spelling, meaning and answer key from the library so a doctored page
// context cannot change what the assistant believes.
func TestAgentSnapshotTrustsLibraryOverPageContext(t *testing.T) {
	store := &Store{}
	store = withTestLibrary(t, agentDrillWords())
	now := agentTestNow()
	if _, err := store.UpdateProgress(progressKey("primary", "a cold"), Progress{Seen: 5, Correct: 1, Wrong: 4}, now.Add(-24*time.Hour), "student-1"); err != nil {
		t.Fatal(err)
	}
	snapshot := store.buildAgentSnapshot(User{ID: "student-1"}, AgentChatRequest{
		Mode: "meaning",
		Context: map[string]any{
			"scene": "meaning", "level": "primary", "wordId": "a cold", "quizType": "en-zh",
			"spelling": "fake", "meaning": "伪造释义",
			"options":        []any{"感冒", "毛衣", "不但……而且……", "几乎，接近"},
			"selectedAnswer": "毛衣", "correct": false, "wrongTimes": 2,
			"position": 8, "answered": 7, "sessionCorrect": 6, "total": 4614, "page": 1, "pages": 385, "pageSize": 12,
			"scope": "全部范围", "topic": "生活",
		},
	}, now)

	if snapshot.Scene != "meaning" || snapshot.QuizType != "en-zh" {
		t.Fatalf("scene/type not carried: %+v", snapshot)
	}
	item := snapshot.Current
	if item == nil {
		t.Fatal("current item was not resolved")
	}
	if item.Spelling != "a cold" || item.Meaning != "感冒" {
		t.Fatalf("page context overrode the library: %+v", item)
	}
	if item.CorrectAnswer != "感冒" || item.SelectedAnswer != "毛衣" || item.IsCorrect {
		t.Fatalf("unexpected answer state: %+v", item)
	}
	if item.History == nil || item.History.Wrong != 4 || item.History.Correct != 1 {
		t.Fatalf("learner history was not attached: %+v", item.History)
	}
	if snapshot.Session == nil || snapshot.Session.Position != 8 || snapshot.Session.Pages != 385 {
		t.Fatalf("practice progress was not attached: %+v", snapshot.Session)
	}
	if snapshot.Student == nil || snapshot.Student.Practiced != 1 {
		t.Fatalf("student summary was not attached: %+v", snapshot.Student)
	}
	if len(snapshot.Weak) != 1 || snapshot.Weak[0].Spelling != "a cold" {
		t.Fatalf("weak words were not attached: %+v", snapshot.Weak)
	}
}

func TestAgentSnapshotWithoutContextStaysEmpty(t *testing.T) {
	store := &Store{}
	store = withTestLibrary(t, agentDrillWords())
	snapshot := store.buildAgentSnapshot(User{ID: "student-1"}, AgentChatRequest{Mode: "homework"}, agentTestNow())
	if snapshot.Current != nil || snapshot.Session != nil {
		t.Fatalf("empty context should not invent a question: %+v", snapshot)
	}
}

func TestAgentPromptCarriesLearnerHistory(t *testing.T) {
	store := &Store{}
	store = withTestLibrary(t, agentDrillWords())
	now := agentTestNow()
	if _, err := store.UpdateProgress(progressKey("primary", "a cold"), Progress{Seen: 5, Correct: 1, Wrong: 4, QuizResults: map[string]QuizResult{"en-zh": {Correct: 1, Wrong: 3}}}, now.Add(-24*time.Hour), "student-1"); err != nil {
		t.Fatal(err)
	}
	snapshot := store.buildAgentSnapshot(User{ID: "student-1"}, AgentChatRequest{
		Mode: "meaning",
		Context: map[string]any{
			"scene": "meaning", "level": "primary", "wordId": "a cold", "quizType": "en-zh",
			"options": []any{"感冒", "毛衣"}, "selectedAnswer": "毛衣", "correct": false,
		},
	}, now)

	rendered := renderAgentSnapshot(snapshot)
	for _, want := range []string{"a cold", "感冒", "毛衣", "答错", "该词历史", "答错 4 次", "英译中"} {
		if !strings.Contains(rendered, want) {
			t.Fatalf("snapshot text is missing %q:\n%s", want, rendered)
		}
	}
	prompt := buildLearningPrompt("为什么不是毛衣？", "meaning", rendered)
	for _, want := range []string{"学习场景：词义练习", "学习记录", "学生问题：为什么不是毛衣？"} {
		if !strings.Contains(prompt, want) {
			t.Fatalf("prompt is missing %q:\n%s", want, prompt)
		}
	}
}

func TestAgentDefaultMessageQuotesWrongChoice(t *testing.T) {
	snapshot := AgentSnapshot{Current: &AgentCurrentItem{
		Spelling: "a cold", CorrectAnswer: "感冒", SelectedAnswer: "毛衣", Answered: true,
	}}
	message := agentDefaultMessage(agentQuickExplainWrong, snapshot)
	if !strings.Contains(message, "毛衣") || !strings.Contains(message, "感冒") {
		t.Fatalf("wrong-choice question did not quote both answers: %s", message)
	}
}

// QueueReview is the "put this word into today's review" button: the word has
// to appear in 今日复习 right away, without pretending it was practised.
func TestQueueReviewMakesWordDueToday(t *testing.T) {
	store := &Store{}
	store = withTestLibrary(t, agentDrillWords())
	now := agentTestNow()
	service := NewService(store, "student-1")
	saved, err := service.QueueReview("primary", "a cold", now)
	if err != nil {
		t.Fatal(err)
	}
	if saved.NextReview != now.Format(time.RFC3339) {
		t.Fatalf("next review was not set to now: %+v", saved)
	}
	queue, err := service.TodayReview("primary", now)
	if err != nil {
		t.Fatal(err)
	}
	if queue.Total != 1 || queue.Items[0].Word.ID != "a cold" {
		t.Fatalf("queued word is not due today: %+v", queue)
	}
	if queue.Completed != 0 {
		t.Fatalf("queuing a word must not count as a completed review: %+v", queue)
	}
	progress, err := service.Progress()
	if err != nil {
		t.Fatal(err)
	}
	entry := progress[progressKey("primary", "a cold")]
	if entry.Seen != 0 || entry.Correct != 0 || entry.Wrong != 0 || entry.Mastered {
		t.Fatalf("queuing a word must not change its record: %+v", entry)
	}
}

func TestQueueReviewRejectsUnknownWord(t *testing.T) {
	store := &Store{}
	store = withTestLibrary(t, agentDrillWords())
	if _, err := NewService(store, "student-1").QueueReview("primary", "not-a-word", agentTestNow()); err == nil {
		t.Fatal("unknown words must not be queued")
	}
}

// The drill must be answerable and gradable with the existing engine: every
// option comes from the library and the answer key is the library's own
// meaning, so the questions can be graded by /api/quiz/answer.
func TestBuildAgentDrillFallsBackToLibraryQuestions(t *testing.T) {
	store := &Store{}
	words := agentDrillWords()
	store = withTestLibrary(t, words)
	now := agentTestNow()
	in := AgentChatRequest{
		Mode: "meaning", QuickAction: agentQuickDrill,
		Context: map[string]any{"scene": "meaning", "level": "primary", "wordId": "a cold", "quizType": "en-zh"},
	}
	// Enabled=false keeps the drill on the deterministic library path, which is
	// exactly what a model outage or a bad JSON answer falls back to.
	cfg := defaultAgentConfig()
	drill, err := store.buildAgentDrill(context.Background(), t.TempDir(), cfg, User{ID: "student-1"}, in, now)
	if err != nil {
		t.Fatal(err)
	}
	if drill.Source != "library" {
		t.Fatalf("expected the library fallback, got %q", drill.Source)
	}
	if len(drill.Items) != agentDrillCountDefault {
		t.Fatalf("unexpected item count: %d", len(drill.Items))
	}
	knownMeanings := map[string]bool{}
	for _, word := range words {
		knownMeanings[word.Meaning] = true
	}
	for _, item := range drill.Items {
		base, ok := store.wordIndex[progressKey(item.Word.Level, item.Word.ID)]
		if !ok {
			t.Fatalf("drill question uses a word outside the library: %+v", item.Word)
		}
		if item.Answer != base.Meaning {
			t.Fatalf("answer %q contradicts the library (%q)", item.Answer, base.Meaning)
		}
		if len(item.Options) != 4 || !containsFold(item.Options, item.Answer) {
			t.Fatalf("question options are not gradable: %+v", item.Options)
		}
		for _, option := range item.Options {
			if !knownMeanings[option] {
				t.Fatalf("option %q is not a library meaning", option)
			}
		}
		if item.Word.ID != "a cold" && !containsFold(item.Options, "感冒") {
			t.Fatalf("the confused word should stay among the options: %+v", item.Options)
		}
	}

	again, err := store.buildAgentDrill(context.Background(), t.TempDir(), cfg, User{ID: "student-1"}, in, now)
	if err != nil {
		t.Fatal(err)
	}
	for index := range drill.Items {
		if strings.Join(drill.Items[index].Options, "|") != strings.Join(again.Items[index].Options, "|") {
			t.Fatalf("drill options are not deterministic: %v vs %v", drill.Items[index].Options, again.Items[index].Options)
		}
	}
}

func TestBuildAgentDrillRejectsUnknownWord(t *testing.T) {
	store := &Store{}
	store = withTestLibrary(t, agentDrillWords())
	in := AgentChatRequest{QuickAction: agentQuickDrill, Context: map[string]any{"level": "primary", "wordId": "missing"}}
	if _, err := store.buildAgentDrill(context.Background(), t.TempDir(), defaultAgentConfig(), User{ID: "student-1"}, in, agentTestNow()); err == nil {
		t.Fatal("a drill without a real word must fail")
	}
}

// The add-review quick action is deterministic, so it works even when the
// assistant itself is disabled: the learner gets the word in today's review.
func TestRunAgentAddReviewWorksWithoutModel(t *testing.T) {
	store := &Store{}
	store = withTestLibrary(t, agentDrillWords())
	out, err := store.runAgent(context.Background(), t.TempDir(), User{ID: "student-1", Username: "student"}, AgentChatRequest{
		QuickAction: agentQuickAddReview,
		Mode:        "meaning",
		Context:     map[string]any{"scene": "meaning", "level": "primary", "wordId": "a cold"},
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(out.Actions) != 1 || out.Actions[0].Type != "add-review" || out.Actions[0].Status != "ok" {
		t.Fatalf("unexpected action result: %+v", out.Actions)
	}
	if !strings.Contains(out.Message, "a cold") {
		t.Fatalf("action message does not name the word: %s", out.Message)
	}
	if out.Snapshot == nil || out.Snapshot.Current == nil || out.Snapshot.Current.Spelling != "a cold" {
		t.Fatalf("snapshot was not returned: %+v", out.Snapshot)
	}
	queue, err := NewService(store, "student-1").TodayReview("primary", time.Now())
	if err != nil {
		t.Fatal(err)
	}
	if queue.Total != 1 || queue.Items[0].Word.ID != "a cold" {
		t.Fatalf("word did not reach today's review: %+v", queue)
	}
}

func TestRunAgentRejectsEmptyQuestion(t *testing.T) {
	store := &Store{}
	store = withTestLibrary(t, agentDrillWords())
	if _, err := store.runAgent(context.Background(), t.TempDir(), User{ID: "student-1"}, AgentChatRequest{}); err == nil {
		t.Fatal("an empty question must be rejected")
	}
}

func TestAgentQuickActionNameFiltersUnknownActions(t *testing.T) {
	if agentQuickActionName("nonsense") != "" || agentQuickActionName(agentQuickExplainWrong) != agentQuickExplainWrong {
		t.Fatal("quick action filtering is wrong")
	}
}

// A multiple-choice question is only useful when the options are actually
// different from each other and from the answer key.
func TestDrillOptionOverlapRules(t *testing.T) {
	cases := []struct {
		a, b string
		want bool
	}{
		{"感冒", "感冒;伤风", true},
		{"感冒", "流感", false},
		{"一点儿", "一点儿", true},
		{"一（用于单数可数名词前）", "一(人、事、物)", true},
		{"一点儿", "一点", true},
		{"少量(的),一点", "一点儿", false},
		{"at all", "not...at all", true},
		{"a cold", "cold", true},
		{"walk", "wall", false},
	}
	for _, c := range cases {
		if got := drillOptionOverlap(c.a, c.b, "en-zh"); got != c.want {
			t.Fatalf("drillOptionOverlap(%q, %q) = %v, want %v", c.a, c.b, got, c.want)
		}
	}
	if drillOptionKey("一（用于单数可数名词前）") != drillOptionKey("一 (人、事、物)") {
		t.Fatalf("bracketed glosses must not change the sense: %q vs %q",
			drillOptionKey("一（用于单数可数名词前）"), drillOptionKey("一 (人、事、物)"))
	}
}

// The confusion pair is what the drill is about, but when the focus word means
// the same thing as the answer it cannot also appear as an option.
func TestBuildDrillQuestionDropsOverlappingOptions(t *testing.T) {
	store := &Store{}
	store = withTestLibrary(t, agentDrillWords())
	base := Word{ID: "a cold", Word: "a cold", Meaning: "感冒", Level: "primary", Status: "published"}
	focus := Word{ID: "have a cold", Word: "have a cold", Meaning: "感冒;伤风", Level: "primary", Status: "published"}
	candidates := []Word{
		focus,
		{ID: "flu", Word: "flu", Meaning: "流感", Level: "primary", Status: "published"},
		{ID: "headache", Word: "headache", Meaning: "头痛", Level: "primary", Status: "published"},
		{ID: "cough", Word: "cough", Meaning: "咳嗽", Level: "primary", Status: "published"},
		{ID: "cold", Word: "cold", Meaning: "寒冷的", Level: "primary", Status: "published"},
	}
	question := store.buildDrillQuestion(base, "en-zh", focus, candidates)
	if question.Answer != "感冒" {
		t.Fatalf("answer must stay the library meaning: %q", question.Answer)
	}
	if len(question.Options) != 4 {
		t.Fatalf("expected four options, got %v", question.Options)
	}
	if !containsFold(question.Options, "感冒") {
		t.Fatalf("the answer key must be selectable: %v", question.Options)
	}
	if containsFold(question.Options, "感冒;伤风") {
		t.Fatalf("an option that shares a sense with the answer must be dropped: %v", question.Options)
	}
	for i := range question.Options {
		for j := i + 1; j < len(question.Options); j++ {
			if drillOptionOverlap(question.Options[i], question.Options[j], question.Answer) {
				t.Fatalf("options %q and %q overlap: %v", question.Options[i], question.Options[j], question.Options)
			}
		}
	}
}

// A tiny library must still produce a gradable four-option question: the
// overlap filter relaxes rather than returning a half-built question.
func TestBuildDrillQuestionAlwaysFillsFourOptions(t *testing.T) {
	store := &Store{}
	store = withTestLibrary(t, []Word{
		{ID: "a", Word: "a", Meaning: "一", Level: "primary", Status: "published"},
		{ID: "a bit", Word: "a bit", Meaning: "一点儿", Level: "primary", Status: "published"},
		{ID: "a few", Word: "a few", Meaning: "几个", Level: "primary", Status: "published"},
		{ID: "a cold", Word: "a cold", Meaning: "感冒", Level: "primary", Status: "published"},
	})
	base := store.wordIndex[progressKey("primary", "a")]
	question := store.buildDrillQuestion(base, "en-zh", base, nil)
	if len(question.Options) != 4 {
		t.Fatalf("expected four options from a minimal library, got %v", question.Options)
	}
	if !containsFold(question.Options, "一") {
		t.Fatalf("answer missing from options: %v", question.Options)
	}
}
