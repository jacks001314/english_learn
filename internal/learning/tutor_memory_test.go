package learning

import (
	"strings"
	"testing"
	"time"
)

// 一次讲解应当沉淀成可复用的笔记：第二次讲解是“接着说”，而不是从头再来。
func TestTutorNoteIsStoredReusedAndRendered(t *testing.T) {
	store := &Store{}
	store = withTestLibrary(t, agentDrillWords())
	now := agentTestNow()
	user := User{ID: "student-1", Username: "student"}
	in := AgentChatRequest{Mode: "meaning", Context: map[string]any{
		"scene": "meaning", "level": "primary", "wordId": "a cold", "quizType": "en-zh",
		"selectedAnswer": "毛衣", "correct": false,
	}}
	snapshot := store.buildAgentSnapshot(user, in, now)
	if snapshot.Current == nil {
		t.Fatal("snapshot did not resolve the current word")
	}
	note, err := store.recordTutorNote(user.ID, snapshot, "为什么我选错了", "## 错因\n你把 a cold 和毛衣混在一起了。\n\n- 记住：感冒", now)
	if err != nil {
		t.Fatal(err)
	}
	if note == nil || note.WordID != "a cold" || note.Word != "a cold" || note.Exchanges != 1 {
		t.Fatalf("unexpected note: %+v", note)
	}
	if strings.Contains(note.Summary, "#") || strings.Contains(note.Summary, "\n") {
		t.Fatalf("summary must be plain one-paragraph text: %q", note.Summary)
	}
	if !strings.Contains(note.Summary, "感冒") {
		t.Fatalf("summary lost the content: %q", note.Summary)
	}

	later := now.Add(time.Hour)
	again, err := store.recordTutorNote(user.ID, snapshot, "再讲一次", "再强调一遍：感冒是名词短语。", later)
	if err != nil {
		t.Fatal(err)
	}
	if again == nil || again.Exchanges != 2 || again.ID != note.ID || again.CreatedAt != note.CreatedAt {
		t.Fatalf("repeat explanations must merge into one note: %+v", again)
	}
	if !strings.Contains(again.Summary, "再强调一遍") {
		t.Fatalf("the newest explanation must win: %q", again.Summary)
	}

	fresh := store.buildAgentSnapshot(user, in, later)
	if fresh.Current == nil || fresh.Current.TutorNote == nil || fresh.Current.TutorNote.Exchanges != 2 {
		t.Fatalf("the snapshot must carry the note back to the page: %+v", fresh.Current)
	}
	text := renderAgentSnapshot(fresh)
	if !strings.Contains(text, "上次助教讲解") || !strings.Contains(text, "再强调一遍") {
		t.Fatalf("the prompt must quote the earlier explanation:\n%s", text)
	}

	events, err := store.recentLearningEvents(user.ID, 10)
	if err != nil {
		t.Fatal(err)
	}
	found := false
	for _, event := range events {
		if event.Type == "agent_tutor" && event.ContentID == "a cold" && event.Source == "agent" {
			found = true
		}
	}
	if !found {
		t.Fatalf("the explanation must leave a learning event: %+v", events)
	}
}

// 没有当前题目时不产生笔记，空回答也不产生笔记。
func TestTutorNoteIgnoresEmptyInputs(t *testing.T) {
	store := &Store{}
	store = withTestLibrary(t, agentDrillWords())
	user := User{ID: "student-1"}
	if note, err := store.recordTutorNote(user.ID, AgentSnapshot{}, "问题", "回答", agentTestNow()); err != nil || note != nil {
		t.Fatalf("a note without a current word must be skipped: %+v %v", note, err)
	}
	snapshot := store.buildAgentSnapshot(user, AgentChatRequest{Mode: "meaning", Context: map[string]any{"level": "primary", "wordId": "a cold"}}, agentTestNow())
	if note, err := store.recordTutorNote(user.ID, snapshot, "问题", "   \n  ", agentTestNow()); err != nil || note != nil {
		t.Fatalf("an empty answer must be skipped: %+v %v", note, err)
	}
}

// 笔记要被学习画像和学习计划消费，否则只是躺在数据库里。
func TestTutorNoteFeedsLearningProfileAndPlan(t *testing.T) {
	store := &Store{}
	store = withTestLibrary(t, agentDrillWords())
	now := agentTestNow()
	user := User{ID: "student-1", Username: "student"}
	if _, err := store.UpdateProgress(progressKey("primary", "a cold"), Progress{Seen: 2, Wrong: 2}, now, user.ID); err != nil {
		t.Fatal(err)
	}
	in := AgentChatRequest{Mode: "meaning", Context: map[string]any{"scene": "meaning", "level": "primary", "wordId": "a cold"}}
	snapshot := store.buildAgentSnapshot(user, in, now)
	if _, err := store.recordTutorNote(user.ID, snapshot, "讲讲这道题", "a cold 是名词短语，意思是感冒。", now); err != nil {
		t.Fatal(err)
	}
	profile, err := NewService(store, user.ID).LearningProfile("primary", now)
	if err != nil {
		t.Fatal(err)
	}
	var weak *KnowledgeMastery
	for index := range profile.Weakest {
		if profile.Weakest[index].Word != nil && profile.Weakest[index].Word.ID == "a cold" {
			weak = &profile.Weakest[index]
		}
	}
	if weak == nil {
		t.Fatalf("the word should be part of the weak set: %+v", profile.Weakest)
	}
	if weak.TutorNote == "" || weak.TutorNoteAt == "" {
		t.Fatalf("the note must reach the learning profile: %+v", weak)
	}
	if !contains(weak.Tags, "助教已讲解") {
		t.Fatalf("the profile should tag explained words: %+v", weak.Tags)
	}
	progress, err := store.readProgress(user.ID)
	if err != nil {
		t.Fatal(err)
	}
	plan := store.buildSmartLearningPlan(user.ID, "primary", 25, profile, progress, now)
	reason := ""
	for _, task := range plan.Tasks {
		if task.Type == "quiz" {
			reason = task.Reason
		}
	}
	if !strings.Contains(reason, "助教上次讲过") || !strings.Contains(reason, "感冒") {
		t.Fatalf("the plan must reuse the explanation, got %q", reason)
	}
}
