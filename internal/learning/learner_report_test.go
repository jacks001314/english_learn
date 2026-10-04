package learning

// 本文件覆盖 plan.md「P1：多用户与学习目标」第 47、48 项：
// 学习日历的按日归并、连续天数，以及家长/教师只读报告的聚合口径。

import (
	"testing"
	"time"
)

// reportFixture 装好确定性词库 + 临时 BoltDB。
func reportFixture(t *testing.T) *Store {
	t.Helper()
	store := &Store{}
	database := openTestDB(t)
	t.Cleanup(func() { _ = database.Close() })
	store.db = database
	words := []Word{
		{ID: "apple", Word: "apple", Meaning: "苹果", Level: "primary", Topic: "食物", Status: "published"},
		{ID: "book", Word: "book", Meaning: "书", Level: "primary", Topic: "学习", Status: "published"},
		{ID: "cat", Word: "cat", Meaning: "猫", Level: "primary", Topic: "动物", Status: "published"},
		{ID: "improve", Word: "improve", Meaning: "改善", Level: "middle", Topic: "成长", Status: "published"},
	}
	store.datasets = map[string][]Word{"primary": words[:3], "middle": words[3:]}
	store.wordIndex = map[string]Word{}
	for _, word := range words {
		store.wordIndex[progressKey(word.Level, word.ID)] = word
	}
	return store
}

// seedReportProgress 铺开跨 4 天的学习记录，覆盖学习、复习、答错三种事件。
func seedReportProgress(t *testing.T, store *Store, userID string, now time.Time) {
	t.Helper()
	steps := []struct {
		word     string
		at       time.Time
		progress Progress
	}{
		{"cat", now.AddDate(0, 0, -3), Progress{Seen: 1, Wrong: 1}},
		{"apple", now.AddDate(0, 0, -2), Progress{Seen: 1, Wrong: 2}},
		{"book", now.AddDate(0, 0, -1), Progress{Seen: 1, Correct: 3}},
		{"apple", now, Progress{Review: true, Correct: 1}},
		{"book", now, Progress{Wrong: 1}},
	}
	for _, step := range steps {
		if _, err := store.UpdateProgress(progressKey("primary", step.word), step.progress, step.at, userID); err != nil {
			t.Fatalf("store.UpdateProgress(%s): %v", step.word, err)
		}
	}
}

func calendarCell(t *testing.T, calendar LearningCalendar, date string) ActivityDay {
	t.Helper()
	for _, day := range calendar.Days {
		if day.Date == date {
			return day
		}
	}
	t.Fatalf("日历缺少 %s：%+v", date, calendar.Days)
	return ActivityDay{}
}

func TestLearningCalendarMergesProgressAndEvents(t *testing.T) {
	store := &Store{}
	store = reportFixture(t)
	now := time.Date(2026, 10, 4, 21, 0, 0, 0, time.Local)
	seedReportProgress(t, store, "learner-1", now)

	calendar, err := NewService(store, "learner-1").LearningCalendar(now, 7)
	if err != nil {
		t.Fatal(err)
	}
	if len(calendar.Days) != 7 || calendar.From != "2026-09-28" || calendar.To != "2026-10-04" {
		t.Fatalf("日历窗口不正确：%+v", calendar)
	}

	// 10-01 只有 cat 答错一次。
	if cell := calendarCell(t, calendar, "2026-10-01"); cell.Learned != 1 || cell.Practices != 1 || cell.Wrong != 1 || !cell.Active {
		t.Fatalf("10-01 归并不正确：%+v", cell)
	}
	// 10-02 apple 连错两次，历史日期靠事件补齐（progress 的 LastSeen 已被后面的写入覆盖）。
	if cell := calendarCell(t, calendar, "2026-10-02"); cell.Learned != 1 || cell.Practices != 2 || cell.Wrong != 2 || !cell.Active {
		t.Fatalf("10-02 归并不正确：%+v", cell)
	}
	// 10-03 book 连对三次。
	if cell := calendarCell(t, calendar, "2026-10-03"); cell.Learned != 1 || cell.Practices != 3 || cell.Correct != 3 || !cell.Active {
		t.Fatalf("10-03 归并不正确：%+v", cell)
	}
	// 10-04 复习 apple + book 答错一次：两词、两题、一复习、一对一转。
	if cell := calendarCell(t, calendar, "2026-10-04"); cell.Learned != 2 || cell.Reviewed != 1 || cell.Practices != 2 || cell.Correct != 1 || cell.Wrong != 1 || !cell.Active {
		t.Fatalf("10-04 归并不正确：%+v", cell)
	}
	// 窗口内更早的空白日不活跃。
	if cell := calendarCell(t, calendar, "2026-09-28"); cell.Active {
		t.Fatalf("空白日不应活跃：%+v", cell)
	}

	if calendar.ActiveDays != 4 || calendar.CurrentStreak != 4 || calendar.LongestStreak != 4 || calendar.TotalPractices != 8 {
		t.Fatalf("日历汇总不正确：%+v", calendar)
	}

	// 窗口外的事件不参与统计：只看最近 3 天时 10-01 的 cat 已被裁掉。
	short, err := NewService(store, "learner-1").LearningCalendar(now, 3)
	if err != nil {
		t.Fatal(err)
	}
	if len(short.Days) != 3 || short.From != "2026-10-02" || short.TotalPractices != 7 || short.ActiveDays != 3 {
		t.Fatalf("缩短窗口后统计不正确：%+v", short)
	}
}

func TestBuildLearnerReportSummarizesForGuardians(t *testing.T) {
	store := &Store{}
	store = reportFixture(t)
	now := time.Date(2026, 10, 4, 21, 0, 0, 0, time.Local)
	user, err := store.createUser(AuthRequest{Username: "reportlearner", Password: "password123", DisplayName: "报告学生"})
	if err != nil {
		t.Fatal(err)
	}
	seedReportProgress(t, store, user.ID, now)

	report, err := store.BuildLearnerReport(user.ID, "", 7, now)
	if err != nil {
		t.Fatal(err)
	}
	if report.DisplayName != "报告学生" || report.Username != "reportlearner" || report.Role != "student" {
		t.Fatalf("学习者信息不正确：%+v", report)
	}
	if report.Seen != 3 || report.Mastered != 0 {
		t.Fatalf("学习量口径不正确：%+v", report)
	}
	if report.Correct != 4 || report.Wrong != 4 || report.Practices != 8 || report.Accuracy != 50 {
		t.Fatalf("正确率口径不正确：%+v", report)
	}
	if report.TodayLearned != 2 || report.TodayPractices != 2 {
		t.Fatalf("今日口径不正确：%+v", report)
	}
	if !report.ReviewHasData || report.ReviewCompletedToday != 1 || report.ReviewDue != 1 || report.ReviewCompletionRate != 50 || report.ReviewGoal != 10 {
		t.Fatalf("复习完成率口径不正确：%+v", report)
	}
	if report.StreakDays != 4 || report.ActiveDays != 4 {
		t.Fatalf("连续天数口径不正确：%+v", report)
	}
	if len(report.Weakest) != 3 || report.Weakest[0].Word.ID != "apple" || report.Weakest[1].Word.ID != "cat" || report.Weakest[2].Word.ID != "book" {
		t.Fatalf("薄弱词排序不正确：%+v", report.Weakest)
	}
	if len(report.Calendar.Days) != 7 {
		t.Fatalf("报告应内嵌同一段日历：%+v", report.Calendar)
	}

	// 学段过滤：只看初中时没有任何记录，计数归零、薄弱词为空。
	middle, err := store.BuildLearnerReport(user.ID, "middle", 7, now)
	if err != nil {
		t.Fatal(err)
	}
	if middle.Seen != 0 || middle.Practices != 0 || len(middle.Weakest) != 0 || middle.ActiveDays != 0 {
		t.Fatalf("学段过滤不正确：%+v", middle)
	}
	if middle.Level != "middle" {
		t.Fatalf("学段筛选未回显：%+v", middle)
	}

	if _, err := store.BuildLearnerReport("not-a-real-user", "", 7, now); err == nil {
		t.Fatal("不存在的学习者应返回错误")
	}
}
