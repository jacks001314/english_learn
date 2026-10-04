package learning

import (
	"encoding/json"
	"fmt"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	bolt "go.etcd.io/bbolt"
)

var recommendedWordPattern = regexp.MustCompile(`^[A-Za-z][A-Za-z '\-]{1,30}$`)

func clampScore(value int) int {
	if value < 0 {
		return 0
	}
	if value > 100 {
		return 100
	}
	return value
}

func (s *Store) wordMastery(key string, progress Progress, now time.Time) (KnowledgeMastery, bool) {
	word, ok := s.wordIndex[key]
	if !ok || !publicContentStatus(word.Status) {
		return KnowledgeMastery{}, false
	}
	attempts := progress.Correct + progress.Wrong
	score := 10
	if attempts > 0 {
		score = 20 + progress.Correct*55/attempts + min(attempts, 5)*3 + min(progress.ReviewStreak, 4)*3
	}
	if progress.Mastered && score < 85 {
		score = 85
	}
	if progress.Wrong > 0 && !progress.Resolved {
		score -= 15
	}
	due := false
	if next, err := time.Parse(time.RFC3339, progress.NextReview); err == nil && !next.After(now) {
		due = true
		score -= 5
	}
	confidence := min(100, progress.Seen*6+attempts*12+progress.ReviewCount*8)
	tags := []string{}
	if progress.Wrong > 0 && !progress.Resolved {
		tags = append(tags, "待纠正")
	}
	if due {
		tags = append(tags, "到期复习")
	}
	for quizType, result := range progress.QuizResults {
		if result.Wrong > result.Correct {
			tags = append(tags, quizTypeLabel(quizType)+"薄弱")
		}
	}
	reason := masteryReason(progress, due, confidence)
	copy := word
	return KnowledgeMastery{
		ID: "word:" + key, Label: word.Word, Kind: "word", Level: word.Level, Topic: word.Topic,
		Score: clampScore(score), Confidence: confidence, Correct: progress.Correct, Wrong: progress.Wrong,
		ReviewStreak: progress.ReviewStreak, Reason: reason, Tags: tags, LastActivity: progress.LastSeen,
		NextReview: progress.NextReview, Word: &copy,
	}, true
}

func masteryReason(progress Progress, due bool, confidence int) string {
	switch {
	case progress.Wrong > 0 && !progress.Resolved:
		return fmt.Sprintf("仍有 %d 次错误未完成巩固", progress.Wrong)
	case due:
		return "已经到达下一次最佳复习时间"
	case confidence < 35:
		return "练习证据较少，需要继续确认掌握程度"
	case progress.ReviewStreak >= 3:
		return fmt.Sprintf("已连续复习答对 %d 次", progress.ReviewStreak)
	case progress.Correct > progress.Wrong:
		return "近期正确次数较多，掌握正在稳定"
	default:
		return "需要通过更多练习建立稳定记忆"
	}
}

func quizTypeLabel(value string) string {
	labels := map[string]string{"en-zh": "英译中", "zh-en": "中译英", "listen": "听音辨词", "spelling": "拼写", "cloze": "例句完形"}
	if label := labels[value]; label != "" {
		return label
	}
	return value
}

func (s *Service) LearningProfile(level string, now time.Time) (LearningProfile, error) {
	level = normalizeLevel(level)
	progress, err := s.store.readProgress(s.userID)
	if err != nil {
		return LearningProfile{}, err
	}
	notes, err := s.store.tutorNotesForUser(s.userID)
	if err != nil {
		return LearningProfile{}, err
	}
	profile := LearningProfile{Level: level, Strongest: []KnowledgeMastery{}, Weakest: []KnowledgeMastery{}, Dimensions: []MasteryDimension{}, UpdatedAt: now.Format(time.RFC3339)}
	items := make([]KnowledgeMastery, 0)
	type topicAggregate struct{ score, confidence, practiced, weak int }
	topics := map[string]*topicAggregate{}
	coverage := map[string]int{}
	for _, word := range s.store.wordsByLevel(level) {
		if publicContentStatus(word.Status) && strings.TrimSpace(word.Topic) != "" {
			coverage[word.Topic]++
		}
	}
	for key, value := range progress {
		if !strings.HasPrefix(key, level+":") {
			continue
		}
		item, ok := s.store.wordMastery(key, value, now)
		if !ok {
			continue
		}
		if note, hasNote := notes[key]; hasNote && strings.TrimSpace(note.Summary) != "" {
			item.TutorNote = note.Summary
			item.TutorNoteAt = note.UpdatedAt
			if !contains(item.Tags, "助教已讲解") {
				item.Tags = append(item.Tags, "助教已讲解")
			}
		}
		items = append(items, item)
		profile.Practiced++
		profile.OverallScore += item.Score
		profile.Confidence += item.Confidence
		switch {
		case item.Score >= 85:
			profile.Mastered++
		case item.Score >= 40:
			profile.Developing++
		default:
			profile.Weak++
		}
		if contains(item.Tags, "到期复习") {
			profile.Due++
		}
		if item.Topic != "" {
			aggregate := topics[item.Topic]
			if aggregate == nil {
				aggregate = &topicAggregate{}
				topics[item.Topic] = aggregate
			}
			aggregate.score += item.Score
			aggregate.confidence += item.Confidence
			aggregate.practiced++
			if item.Score < 40 || contains(item.Tags, "待纠正") {
				aggregate.weak++
			}
		}
	}
	if profile.Practiced > 0 {
		profile.OverallScore /= profile.Practiced
		profile.Confidence /= profile.Practiced
	}
	strong := append([]KnowledgeMastery(nil), items...)
	sort.Slice(strong, func(i, j int) bool {
		if strong[i].Score == strong[j].Score {
			return strong[i].Confidence > strong[j].Confidence
		}
		return strong[i].Score > strong[j].Score
	})
	profile.Strongest = takeMastery(strong, 6)
	weak := append([]KnowledgeMastery(nil), items...)
	sort.Slice(weak, func(i, j int) bool {
		leftUnresolved := contains(weak[i].Tags, "待纠正")
		rightUnresolved := contains(weak[j].Tags, "待纠正")
		if leftUnresolved != rightUnresolved {
			return leftUnresolved
		}
		if weak[i].Score == weak[j].Score {
			return weak[i].Wrong > weak[j].Wrong
		}
		return weak[i].Score < weak[j].Score
	})
	profile.Weakest = takeMastery(weak, 8)
	for topic, aggregate := range topics {
		profile.Dimensions = append(profile.Dimensions, MasteryDimension{
			ID: "topic:" + topic, Label: topic, Score: aggregate.score / max(1, aggregate.practiced),
			Coverage: coverage[topic], Practiced: aggregate.practiced, Weak: aggregate.weak,
		})
	}
	sort.Slice(profile.Dimensions, func(i, j int) bool {
		if profile.Dimensions[i].Weak == profile.Dimensions[j].Weak {
			return profile.Dimensions[i].Score < profile.Dimensions[j].Score
		}
		return profile.Dimensions[i].Weak > profile.Dimensions[j].Weak
	})
	profile.RecentEvents, _ = s.store.recentLearningEvents(s.userID, 10)
	return profile, nil
}

func takeMastery(items []KnowledgeMastery, count int) []KnowledgeMastery {
	if len(items) < count {
		count = len(items)
	}
	return items[:count]
}

func recordLearningEventTx(tx *bolt.Tx, event LearningEvent) error {
	if strings.TrimSpace(event.UserID) == "" {
		return nil
	}
	if event.ID == "" {
		event.ID = uuid.NewString()
	}
	if event.CreatedAt == "" {
		event.CreatedAt = time.Now().Format(time.RFC3339Nano)
	}
	key := event.UserID + "|" + event.CreatedAt + "|" + event.ID
	return putJSON(tx.Bucket([]byte(learningEventsBucket)), key, event)
}

func recordProgressLearningEvent(tx *bolt.Tx, userID, key string, incoming Progress, now time.Time) error {
	parts := strings.SplitN(key, ":", 2)
	if len(parts) != 2 {
		return nil
	}
	eventType, source := "word_progress", "word"
	switch {
	case incoming.Review:
		eventType, source = "word_review", "review"
	case len(incoming.QuizResults) > 0:
		eventType, source = "quiz_answer", "quiz"
	case incoming.SetMastered != nil || incoming.Mastered:
		eventType, source = "word_mastery", "learn"
	}
	details := map[string]any{}
	if len(incoming.QuizResults) > 0 {
		for quizType := range incoming.QuizResults {
			details["quizType"] = quizType
			break
		}
	}
	return recordLearningEventTx(tx, LearningEvent{UserID: userID, Type: eventType, ContentType: "word", ContentID: parts[1], Level: parts[0], Correct: incoming.Correct, Wrong: incoming.Wrong, Source: source, Details: details, CreatedAt: now.Format(time.RFC3339Nano)})
}

func (s *Store) recentLearningEvents(userID string, limit int) ([]LearningEvent, error) {
	if limit < 1 || limit > 100 {
		limit = 20
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
			items = append(items, event)
			return nil
		})
	})
	sort.Slice(items, func(i, j int) bool { return items[i].CreatedAt > items[j].CreatedAt })
	if len(items) > limit {
		items = items[:limit]
	}
	return items, err
}

func smartPlanKey(userID, level string, now time.Time) string {
	return strings.Join([]string{userID, now.Format("2006-01-02"), normalizeLevel(level)}, "|")
}

func (s *Service) SmartLearningPlan(level string, targetMinutes int, now time.Time, regenerate bool) (SmartLearningPlan, error) {
	level = normalizeLevel(level)
	if targetMinutes < 10 {
		targetMinutes = 30
	}
	if targetMinutes > 90 {
		targetMinutes = 90
	}
	key := smartPlanKey(s.userID, level, now)
	if !regenerate {
		var existing SmartLearningPlan
		found := false
		err := s.store.db.View(func(tx *bolt.Tx) error {
			raw := tx.Bucket([]byte(learningPlansBucket)).Get([]byte(key))
			if raw == nil {
				return nil
			}
			found = true
			return json.Unmarshal(raw, &existing)
		})
		if err != nil || found {
			return existing, err
		}
	}
	profile, err := s.LearningProfile(level, now)
	if err != nil {
		return SmartLearningPlan{}, err
	}
	progress, err := s.store.readProgress(s.userID)
	if err != nil {
		return SmartLearningPlan{}, err
	}
	plan := s.store.buildSmartLearningPlan(s.userID, level, targetMinutes, profile, progress, now)
	err = s.store.db.Update(func(tx *bolt.Tx) error { return putJSON(tx.Bucket([]byte(learningPlansBucket)), key, plan) })
	return plan, err
}

func (s *Store) buildSmartLearningPlan(userID, level string, targetMinutes int, profile LearningProfile, progress map[string]Progress, now time.Time) SmartLearningPlan {
	plan := SmartLearningPlan{ID: uuid.NewString(), UserID: userID, Date: now.Format("2006-01-02"), Level: level, TargetMinutes: targetMinutes, Focus: []string{}, Tasks: []SmartPlanTask{}, GeneratedAt: now.Format(time.RFC3339), UpdatedAt: now.Format(time.RFC3339)}
	type candidate struct{ task SmartPlanTask }
	candidates := []candidate{}
	add := func(taskType, title, description, reason string, minutes, count int, action LearningPlanAction) {
		candidates = append(candidates, candidate{SmartPlanTask{ID: uuid.NewString(), Type: taskType, Title: title, Description: description, Reason: reason, Minutes: minutes, Count: count, Priority: len(candidates) + 1, Action: action}})
	}
	if profile.Due > 0 {
		count := min(profile.Due, 10)
		add("review", "完成到期词汇复习", fmt.Sprintf("优先处理 %d 个到期词汇，巩固长期记忆。", count), fmt.Sprintf("当前共有 %d 个词已到最佳复习时间", profile.Due), min(10, 4+count/2), count, LearningPlanAction{View: "review", Level: level})
	}
	if profile.Weak > 0 {
		word := firstMasteryWord(profile.Weakest)
		add("mistakes", "修复薄弱词汇", "先查看错误原因，再完成一轮针对性练习。", fmt.Sprintf("画像识别出 %d 个不稳定知识点", profile.Weak), 6, min(profile.Weak, 6), LearningPlanAction{View: "mistakes", Level: level, Word: word})
	}
	var unseen *Word
	for _, word := range s.wordsByLevel(level) {
		if !recommendedWordCandidate(word) {
			continue
		}
		if _, exists := progress[progressKey(level, word.ID)]; !exists {
			copy := word
			unseen = &copy
			break
		}
	}
	if unseen != nil {
		add("learn", "学习一组新词", "从词义、例句和发音开始建立第一层记忆。", "在复习之外补充少量新内容，保持学习节奏", 7, 5, LearningPlanAction{View: "learn", Level: level, Word: unseen})
	}
	quizWord := firstMasteryWord(profile.Weakest)
	if quizWord == nil {
		quizWord = unseen
	}
	add("quiz", "完成针对性小测", "用一组短测验证今天的掌握情况。", quizReason(profile, quizWord), 8, 10, LearningPlanAction{View: "quiz", Level: level, Word: quizWord})
	if targetMinutes >= 25 {
		if article, ok := s.planArticleForLevel(level); ok {
			add("reading", "完成一篇分级阅读", article.Title, "在词汇练习后加入语境输入，提升迁移能力", max(6, article.Minutes), 1, LearningPlanAction{View: "reading", Level: level, ContentID: article.ID})
		}
	}
	if len(candidates) < 3 {
		add("explore", "浏览主题词库", "选择一个感兴趣的主题，建立词汇之间的联系。", "当前学习证据较少，先扩大有效练习样本", 6, 1, LearningPlanAction{View: "categories", Level: level})
	}
	minutes := 0
	for _, item := range candidates {
		if len(plan.Tasks) >= 3 && minutes+item.task.Minutes > targetMinutes {
			continue
		}
		plan.Tasks = append(plan.Tasks, item.task)
		minutes += item.task.Minutes
	}
	plan.EstimatedMinutes = minutes
	for _, item := range profile.Weakest {
		if item.Topic != "" && !contains(plan.Focus, item.Topic) {
			plan.Focus = append(plan.Focus, item.Topic)
			if len(plan.Focus) == 3 {
				break
			}
		}
	}
	if profile.Practiced == 0 {
		if planHasTaskType(plan, "reading") {
			plan.Summary = "今天先建立学习基线：少量新词、即时小测和一篇阅读。"
		} else {
			plan.Summary = "今天先建立学习基线：少量新词、即时小测和主题探索。"
		}
	} else if profile.Due > 0 || profile.Weak > 0 {
		plan.Summary = fmt.Sprintf("优先处理 %d 个到期点和 %d 个薄弱点，再补充新输入。", profile.Due, profile.Weak)
	} else {
		plan.Summary = "当前基础稳定，今天以新内容和迁移练习为主。"
	}
	return plan
}

func (s *Store) planArticleForLevel(level string) (Article, bool) {
	articles, err := s.readArticles()
	if err != nil {
		return Article{}, false
	}
	for _, article := range articles {
		if articleMatchesLevel(article, level) {
			return article, true
		}
	}
	return Article{}, false
}

func articleMatchesLevel(article Article, level string) bool {
	grade := strings.TrimSpace(article.Grade)
	if normalizeLevel(level) == "middle" {
		return strings.Contains(grade, "七") || strings.Contains(grade, "八") || strings.Contains(grade, "九") || strings.Contains(strings.ToLower(grade), "middle")
	}
	return strings.Contains(grade, "一年级") || strings.Contains(grade, "二年级") || strings.Contains(grade, "三年级") || strings.Contains(grade, "四年级") || strings.Contains(grade, "五年级") || strings.Contains(grade, "六年级") || strings.Contains(strings.ToLower(grade), "primary")
}

func planHasTaskType(plan SmartLearningPlan, taskType string) bool {
	for _, task := range plan.Tasks {
		if task.Type == taskType {
			return true
		}
	}
	return false
}

func recommendedWordCandidate(word Word) bool {
	return publicContentStatus(word.Status) &&
		recommendedWordPattern.MatchString(strings.TrimSpace(word.Word)) &&
		strings.TrimSpace(word.Meaning) != "" && strings.TrimSpace(word.Example) != ""
}

func firstMasteryWord(items []KnowledgeMastery) *Word {
	for _, item := range items {
		if item.Word != nil {
			copy := *item.Word
			return &copy
		}
	}
	return nil
}

func quizReason(profile LearningProfile, word *Word) string {
	if word != nil {
		if note := masteryTutorNote(profile, word); note != "" {
			return "助教上次讲过 “" + word.Word + "”： " + truncateRunes(note, 60) + " —— 用小测验证是否真的记住"
		}
	}
	if word != nil && profile.Practiced > 0 {
		return "根据薄弱词汇 “" + word.Word + "” 优先生成练习"
	}
	return "用短测建立第一份真实能力证据"
}

// masteryTutorNote finds the assistant note the profile kept for one word.
func masteryTutorNote(profile LearningProfile, word *Word) string {
	if word == nil {
		return ""
	}
	for _, item := range profile.Weakest {
		if item.Word != nil && item.Word.ID == word.ID && item.Word.Level == word.Level {
			return item.TutorNote
		}
	}
	for _, item := range profile.Strongest {
		if item.Word != nil && item.Word.ID == word.ID && item.Word.Level == word.Level {
			return item.TutorNote
		}
	}
	return ""
}

func refreshPlanTotals(plan *SmartLearningPlan) {
	plan.CompletedMinutes = 0
	plan.CompletedTasks = 0
	for _, task := range plan.Tasks {
		if task.Completed {
			plan.CompletedTasks++
			plan.CompletedMinutes += task.Minutes
		}
	}
}

func completePlanTaskTx(tx *bolt.Tx, userID, level, taskID, taskType string, now time.Time) (SmartLearningPlan, bool, error) {
	key := smartPlanKey(userID, level, now)
	raw := tx.Bucket([]byte(learningPlansBucket)).Get([]byte(key))
	if raw == nil {
		return SmartLearningPlan{}, false, nil
	}
	var plan SmartLearningPlan
	if err := json.Unmarshal(raw, &plan); err != nil {
		return plan, false, err
	}
	changed := false
	for index := range plan.Tasks {
		matches := taskID != "" && plan.Tasks[index].ID == taskID
		if taskID == "" && taskType != "" && plan.Tasks[index].Type == taskType {
			matches = true
		}
		if matches && !plan.Tasks[index].Completed {
			plan.Tasks[index].Completed = true
			plan.Tasks[index].CompletedAt = now.Format(time.RFC3339)
			changed = true
			break
		}
	}
	if !changed {
		return plan, false, nil
	}
	refreshPlanTotals(&plan)
	plan.UpdatedAt = now.Format(time.RFC3339)
	if err := putJSON(tx.Bucket([]byte(learningPlansBucket)), key, plan); err != nil {
		return plan, false, err
	}
	return plan, true, nil
}

func (s *Service) CompleteSmartPlanTask(level, taskID string, now time.Time) (SmartLearningPlan, error) {
	var plan SmartLearningPlan
	err := s.store.db.Update(func(tx *bolt.Tx) error {
		var changed bool
		var err error
		plan, changed, err = completePlanTaskTx(tx, s.userID, level, taskID, "", now)
		if err != nil {
			return err
		}
		if plan.ID == "" {
			return fmt.Errorf("今日计划不存在")
		}
		if !changed {
			return nil
		}
		return recordLearningEventTx(tx, LearningEvent{UserID: s.userID, Type: "plan_task_completed", ContentType: "plan", ContentID: taskID, Level: normalizeLevel(level), Source: "smart_plan", CreatedAt: now.Format(time.RFC3339Nano)})
	})
	return plan, err
}

func completeMatchingPlanTaskTx(tx *bolt.Tx, userID, level, taskType string, now time.Time) error {
	if userID == "" || taskType == "" {
		return nil
	}
	_, _, err := completePlanTaskTx(tx, userID, level, "", taskType, now)
	return err
}
