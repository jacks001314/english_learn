package learning

// 本文件实现 plan.md「P1：多用户与学习目标」剩下的两项：
//   - 第 47 项：每日目标、连续学习天数之外的「学习日历」；
//   - 第 48 项：家长/教师只读报告（学习量、正确率、薄弱词、复习完成率）。
//
// 数据来源刻意合并两种记录形态：按词保存的 progress（带最后一次学习/复习日期）
// 和 append-only 的 learning_events（带每次作答的对错数）。progress 保证老数据也能
// 点亮日历，事件保证历史每一天的作答量不会因为「最后一次」语义而丢失。

import (
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/kataras/iris/v12"
	bolt "go.etcd.io/bbolt"
)

const (
	defaultCalendarDays = 42
	maxCalendarDays     = 180
	reportWeakWordLimit = 8
)

// ActivityDay 是学习日历的一格：一个自然日加上学习者当天的活动量。
type ActivityDay struct {
	Date      string `json:"date"`
	Weekday   int    `json:"weekday"`
	Learned   int    `json:"learned"`
	Reviewed  int    `json:"reviewed"`
	Practices int    `json:"practices"`
	Correct   int    `json:"correct"`
	Wrong     int    `json:"wrong"`
	Active    bool   `json:"active"`
}

// LearningCalendar 是截止报告日、按时间升序连续排列的日历。
type LearningCalendar struct {
	Days           []ActivityDay `json:"days"`
	From           string        `json:"from"`
	To             string        `json:"to"`
	ActiveDays     int           `json:"activeDays"`
	CurrentStreak  int           `json:"currentStreak"`
	LongestStreak  int           `json:"longestStreak"`
	TotalPractices int           `json:"totalPractices"`
}

// LearnerReport 是家长/教师查看的只读报告。
type LearnerReport struct {
	UserID      string `json:"userId"`
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
	Role        string `json:"role"`
	Level       string `json:"level"`
	GeneratedAt string `json:"generatedAt"`

	Seen      int `json:"seen"`
	Mastered  int `json:"mastered"`
	Practices int `json:"practices"`
	Correct   int `json:"correct"`
	Wrong     int `json:"wrong"`
	Accuracy  int `json:"accuracy"`

	TodayLearned   int `json:"todayLearned"`
	TodayPractices int `json:"todayPractices"`
	StreakDays     int `json:"streakDays"`
	ActiveDays     int `json:"activeDays"`

	ReviewDue            int  `json:"reviewDue"`
	ReviewCompletedToday int  `json:"reviewCompletedToday"`
	ReviewGoal           int  `json:"reviewGoal"`
	ReviewCompletionRate int  `json:"reviewCompletionRate"`
	ReviewHasData        bool `json:"reviewHasData"`

	Calendar LearningCalendar `json:"calendar"`
	Weakest  []LearningItem   `json:"weakest"`
}

func normalizeCalendarDays(days int) int {
	if days < 1 {
		return defaultCalendarDays
	}
	if days > maxCalendarDays {
		return maxCalendarDays
	}
	return days
}

// dayStamp 从 RFC3339 时间戳里取出自然日，无法解析时返回空串。
func dayStamp(stamp string) string {
	if len(stamp) < 10 {
		return ""
	}
	return stamp[:10]
}

// completionPercent 返回四舍五入的百分比（分母为 0 时返回 0）。
func completionPercent(part, total int) int {
	if total <= 0 {
		return 0
	}
	if part < 0 {
		part = 0
	}
	return (part*100 + total/2) / total
}

// reportLevel 归一化报告筛选：空字符串表示不过滤学段。
func reportLevel(level string) string {
	level = strings.ToLower(strings.TrimSpace(level))
	if level == "primary" || level == "middle" {
		return level
	}
	return ""
}

// calendarBucket 累积某一天的活动，最后再折算成 ActivityDay。
type calendarBucket struct {
	words   map[string]bool
	reviews map[string]bool
	correct int
	wrong   int
	// touched 记录当天是否存在任何学习事件（读文章、交卷也算「来过」）。
	touched bool
}

func (b *calendarBucket) practice() int { return b.correct + b.wrong }

// isWordEvent 判断学习事件是否表示「这一天碰了某个单词」。
func isWordEvent(eventType string) bool {
	switch eventType {
	case "word_progress", "word_mastery", "quiz_answer", "word_review":
		return true
	}
	return false
}

// buildLearningCalendar 把 progress 与学习事件合并成一段连续日历。
// 可选的 level 用于学段过滤（家长报告只看初中时，日历也要跟着收敛）。
func (s *Store) buildLearningCalendar(progress map[string]Progress, userID string, now time.Time, days int, level ...string) (LearningCalendar, error) {
	levelFilter := ""
	if len(level) > 0 {
		levelFilter = reportLevel(level[0])
	}
	days = normalizeCalendarDays(days)
	local := now.In(time.Local)
	today := time.Date(local.Year(), local.Month(), local.Day(), 0, 0, 0, 0, time.Local)
	from := today.AddDate(0, 0, -(days - 1))

	buckets := map[string]*calendarBucket{}
	fromStamp, toStamp := from.Format("2006-01-02"), today.Format("2006-01-02")
	bucketFor := func(day string) *calendarBucket {
		if day == "" || day < fromStamp || day > toStamp {
			return nil
		}
		bucket := buckets[day]
		if bucket == nil {
			bucket = &calendarBucket{words: map[string]bool{}, reviews: map[string]bool{}}
			buckets[day] = bucket
		}
		return bucket
	}

	for id, item := range progress {
		if bucket := bucketFor(dayStamp(item.LastSeen)); bucket != nil {
			bucket.words[id] = true
		}
		if bucket := bucketFor(dayStamp(item.LastReviewed)); bucket != nil {
			bucket.reviews[id] = true
		}
	}

	// 只有当前用户、且落在窗口内的事件参与统计。
	events, err := s.learningEventsSince(userID, from.Format(time.RFC3339))
	if err != nil {
		return LearningCalendar{}, err
	}
	for _, event := range events {
		if levelFilter != "" && normalizeLevel(event.Level) != levelFilter {
			continue
		}
		bucket := bucketFor(dayStamp(event.CreatedAt))
		if bucket == nil {
			continue
		}
		bucket.touched = true
		bucket.correct += event.Correct
		bucket.wrong += event.Wrong
		if !isWordEvent(event.Type) {
			continue
		}
		key := eventWordKey(event)
		if key == "" {
			continue
		}
		bucket.words[key] = true
		if event.Type == "word_review" {
			bucket.reviews[key] = true
		}
	}

	calendar := LearningCalendar{From: fromStamp, To: toStamp}
	calendar.Days = make([]ActivityDay, 0, days)
	run, longest := 0, 0
	for day := from; !day.After(today); day = day.AddDate(0, 0, 1) {
		stamp := day.Format("2006-01-02")
		cell := ActivityDay{Date: stamp, Weekday: int(day.Weekday())}
		touched := false
		if bucket := buckets[stamp]; bucket != nil {
			cell.Learned = len(bucket.words)
			cell.Reviewed = len(bucket.reviews)
			cell.Correct = bucket.correct
			cell.Wrong = bucket.wrong
			cell.Practices = bucket.practice()
			touched = bucket.touched
		}
		cell.Active = touched || cell.Learned > 0 || cell.Reviewed > 0 || cell.Practices > 0
		if cell.Active {
			calendar.ActiveDays++
			calendar.TotalPractices += cell.Practices
			run++
			if run > longest {
				longest = run
			}
		} else {
			run = 0
		}
		calendar.Days = append(calendar.Days, cell)
	}
	calendar.LongestStreak = longest
	for i := len(calendar.Days) - 1; i >= 0; i-- {
		if calendar.Days[i].Active {
			calendar.CurrentStreak++
			continue
		}
		break
	}
	return calendar, nil
}

// learningEventsSince 读取某个用户、指定时间之后的学习事件。
// 事件 key 为 userID|createdAt|id，因此按前缀扫描即可限定用户。
func (s *Store) learningEventsSince(userID, since string) ([]LearningEvent, error) {
	if s.db == nil || strings.TrimSpace(userID) == "" {
		return nil, nil
	}
	items := []LearningEvent{}
	prefix := userID + "|"
	err := s.db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(learningEventsBucket)).ForEach(func(key, value []byte) error {
			if !strings.HasPrefix(string(key), prefix) {
				return nil
			}
			var event LearningEvent
			if err := json.Unmarshal(value, &event); err != nil {
				return err
			}
			if event.CreatedAt >= since {
				items = append(items, event)
			}
			return nil
		})
	})
	return items, err
}

// eventWordKey 把学习事件里的单词还原成与 progress 相同的「学段:词」键。
// progress 的键是 level:id，事件只存 level 与 id 两个字段，必须拼回去，
// 否则同一天同一个词会被算成「学了两个词」。
func eventWordKey(event LearningEvent) string {
	id := normalizeID(event.ContentID)
	if id == "" {
		return ""
	}
	if strings.TrimSpace(event.Level) == "" {
		return id
	}
	return progressKey(event.Level, id)
}

// activityDays 汇总此人所有「来过」的自然日：progress 的最近学习/复习时间
// 加上全部学习事件。日历只看窗口内，连续学习天数需要不设上限的历史。
func (s *Store) activityDays(progress map[string]Progress, userID string) (map[string]bool, error) {
	days := map[string]bool{}
	for _, item := range progress {
		for _, stamp := range []string{item.LastSeen, item.LastReviewed} {
			if day := dayStamp(stamp); day != "" {
				days[day] = true
			}
		}
	}
	if s.db == nil || strings.TrimSpace(userID) == "" {
		return days, nil
	}
	events, err := s.learningEventsSince(userID, "")
	if err != nil {
		return nil, err
	}
	for _, event := range events {
		if day := dayStamp(event.CreatedAt); day != "" {
			days[day] = true
		}
	}
	return days, nil
}

// streakFromDays 从今天往回数连续活跃的自然日。
func streakFromDays(days map[string]bool, now time.Time) int {
	streak := 0
	for day := now; days[day.Format("2006-01-02")]; day = day.AddDate(0, 0, -1) {
		streak++
	}
	return streak
}

// LearningCalendar 返回当前登录用户的学习日历。
func (s *Service) LearningCalendar(now time.Time, days int) (LearningCalendar, error) {
	progress, err := s.store.readProgress(s.userID)
	if err != nil {
		return LearningCalendar{}, err
	}
	return s.store.buildLearningCalendar(progress, s.userID, now, days)
}

// weakestItems 按「错多对少」排序取出需要加强的词。
func (s *Store) weakestItems(progress map[string]Progress, limit int) []LearningItem {
	items := make([]LearningItem, 0)
	for id, value := range progress {
		if value.Wrong <= 0 {
			continue
		}
		word, ok := s.wordIndex[id]
		if !ok {
			continue
		}
		items = append(items, LearningItem{Word: word, Progress: value})
	}
	sort.Slice(items, func(i, j int) bool {
		left := items[i].Progress.Wrong - items[i].Progress.Correct
		right := items[j].Progress.Wrong - items[j].Progress.Correct
		if left == right {
			return items[i].Progress.Wrong > items[j].Progress.Wrong
		}
		return left > right
	})
	if len(items) > limit {
		items = items[:limit]
	}
	return items
}

// BuildLearnerReport 汇总一个学习者的只读学习报告，供家长/教师查看。
// level 为空表示不按学段过滤（家长通常关心全部记录）。
func (s *Store) BuildLearnerReport(userID, level string, days int, now time.Time) (LearnerReport, error) {
	user, ok, err := s.userByID(userID)
	if err != nil {
		return LearnerReport{}, err
	}
	if !ok {
		return LearnerReport{}, fmt.Errorf("学习者不存在")
	}
	progress, err := s.readProgress(user.ID)
	if err != nil {
		return LearnerReport{}, err
	}
	goal, err := s.readDailyReviewGoal(user.ID)
	if err != nil {
		return LearnerReport{}, err
	}

	level = reportLevel(level)
	report := LearnerReport{
		UserID: user.ID, Username: user.Username, DisplayName: user.DisplayName, Role: user.Role,
		Level: level, GeneratedAt: now.Format(time.RFC3339), ReviewGoal: goal,
		Weakest: []LearningItem{}, Calendar: LearningCalendar{Days: []ActivityDay{}},
	}

	today := now.Format("2006-01-02")
	scoped := make(map[string]Progress, len(progress))
	for id, value := range progress {
		if level != "" && !strings.HasPrefix(id, level+":") {
			continue
		}
		scoped[id] = value
		report.Practices += value.Correct + value.Wrong
		report.Correct += value.Correct
		report.Wrong += value.Wrong
		if value.Seen > 0 {
			report.Seen++
		}
		if value.Mastered {
			report.Mastered++
		}
		if strings.HasPrefix(value.LastSeen, today) {
			report.TodayLearned++
		}
		if strings.HasPrefix(value.LastReviewed, today) {
			report.ReviewCompletedToday++
		}
		if due, err := time.Parse(time.RFC3339, value.NextReview); err == nil && !due.After(now) {
			report.ReviewDue++
		}
	}
	report.Accuracy = completionPercent(report.Correct, report.Correct+report.Wrong)
	if denom := report.ReviewCompletedToday + report.ReviewDue; denom > 0 {
		report.ReviewHasData = true
		report.ReviewCompletionRate = completionPercent(report.ReviewCompletedToday, denom)
	}
	if days, err := s.activityDays(scoped, user.ID); err == nil {
		report.StreakDays = streakFromDays(days, now)
	} else {
		report.StreakDays = learningStreak(scoped, now)
	}
	report.Weakest = s.weakestItems(scoped, reportWeakWordLimit)

	calendar, err := s.buildLearningCalendar(scoped, user.ID, now, days, level)
	if err != nil {
		return LearnerReport{}, err
	}
	report.Calendar = calendar
	report.ActiveDays = calendar.ActiveDays
	if len(calendar.Days) > 0 {
		report.TodayPractices = calendar.Days[len(calendar.Days)-1].Practices
	}
	return report, nil
}

// LearningCalendar 返回当前登录用户自己的学习日历。
func (c *Controller) LearningCalendar(ctx iris.Context) {
	days, _ := strconv.Atoi(ctx.URLParamDefault("days", "42"))
	calendar, err := c.scoped(ctx).LearningCalendar(time.Now(), days)
	if err != nil {
		writeError(ctx, 500, "读取学习日历失败")
		return
	}
	_ = ctx.JSON(calendar)
}

// AdminLearnerReport 让管理员（家长/教师使用的角色）只读查看某个学习者的报告。
func (c *Controller) AdminLearnerReport(ctx iris.Context) {
	days, _ := strconv.Atoi(ctx.URLParamDefault("days", "42"))
	report, err := c.store.BuildLearnerReport(ctx.Params().Get("id"), ctx.URLParam("level"), days, time.Now())
	if err != nil {
		writeError(ctx, 404, err.Error())
		return
	}
	if user, ok := c.store.currentUser(ctx); ok {
		_ = c.store.writeAudit(user, "view_learner_report", report.Username)
	}
	_ = ctx.JSON(report)
}
