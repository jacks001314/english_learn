package learning

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"sort"
	"strconv"
	"strings"
	"time"
)

// The assistant is only useful when it knows what the learner is looking at.
// This file turns the thin page context posted by the front end into a
// structured learning snapshot, enriched with the learner's own history, and
// renders it into the prompt handed to the model. Every number comes from the
// same stores the practice pages use, so the assistant and the pages can never
// disagree about what happened.
//
// The drill generator follows one rule: the learner's history decides *what* to
// practise, the word library decides *what is correct*. Every generated
// question is assembled from real library entries and graded by the same
// /api/quiz/answer endpoint as the rest of the platform, so an AI-written
// question can never contradict the answer key.

const (
	// Prompt budget for the rendered snapshot. The page context is written by
	// the browser, so it is capped and re-derived from the library before use.
	agentSnapshotTextBudget   = 4000
	agentSnapshotMaxOptions   = 6
	agentSnapshotMaxWeakItems = 3
	agentOptionMaxRunes       = 40
	agentExampleMaxRunes      = 160

	// Drill sizing.
	agentDrillCountDefault   = 3
	agentDrillCountMax       = 5
	agentDrillCandidateLimit = 40
)

// Quick actions the practice pages can trigger without the learner typing
// anything: "why was I wrong", "compare these words", "give me similar
// questions" and "put this word into today's review".
const (
	agentQuickExplain         = "explain"
	agentQuickExplainWrong    = "explain-wrong"
	agentQuickCompare         = "compare"
	agentQuickExplainSentence = "explain-sentence"
	agentQuickDrill           = "drill"
	agentQuickAddReview       = "add-review"
)

// errAgentRequest marks a failure caused by the request itself (a word that is
// not in the library, no context to act on). The controller answers 400 for it
// instead of blaming the model with a 502.
var errAgentRequest = errors.New("agent request")

func agentRequestError(format string, args ...any) error {
	return fmt.Errorf("%w: %s", errAgentRequest, fmt.Sprintf(format, args...))
}

// AgentWordHistory is one word's record for the learner asking the question.
type AgentWordHistory struct {
	Seen         int            `json:"seen"`
	Correct      int            `json:"correct"`
	Wrong        int            `json:"wrong"`
	ReviewStreak int            `json:"reviewStreak"`
	ReviewCount  int            `json:"reviewCount"`
	Mastered     bool           `json:"mastered"`
	Resolved     bool           `json:"resolved"`
	NextReview   string         `json:"nextReview,omitempty"`
	Due          bool           `json:"due"`
	MasteryScore int            `json:"masteryScore"`
	Reason       string         `json:"reason,omitempty"`
	QuizWrong    map[string]int `json:"quizWrong,omitempty"`
}

// AgentCurrentItem is the question on screen, taken from the library rather
// than from the browser: the spelling, meaning and correct answer always come
// from wordIndex.
type AgentCurrentItem struct {
	Level              string            `json:"level,omitempty"`
	WordID             string            `json:"wordId,omitempty"`
	Spelling           string            `json:"spelling,omitempty"`
	Phonetic           string            `json:"phonetic,omitempty"`
	Pos                string            `json:"pos,omitempty"`
	Meaning            string            `json:"meaning,omitempty"`
	Topic              string            `json:"topic,omitempty"`
	Grade              string            `json:"grade,omitempty"`
	Example            string            `json:"example,omitempty"`
	ExampleTranslation string            `json:"exampleTranslation,omitempty"`
	Prompt             string            `json:"prompt,omitempty"`
	Options            []string          `json:"options,omitempty"`
	CorrectAnswer      string            `json:"correctAnswer,omitempty"`
	SelectedAnswer     string            `json:"selectedAnswer,omitempty"`
	IsCorrect          bool              `json:"isCorrect"`
	Answered           bool              `json:"answered"`
	WrongTimes         int               `json:"wrongTimes,omitempty"`
	History            *AgentWordHistory `json:"history,omitempty"`
	TutorNote          *AgentTutorNote   `json:"tutorNote,omitempty"`
}

// AgentTutorNote is the distilled conclusion of the last explanation the
// assistant gave about this word, so the next explanation continues the story
// instead of restarting it.
type AgentTutorNote struct {
	At        string `json:"at,omitempty"`
	Exchanges int    `json:"exchanges,omitempty"`
	Summary   string `json:"summary"`
}

// AgentWeakItem is one recent mistake, used to explain the learner's profile.
type AgentWeakItem struct {
	Spelling string `json:"spelling"`
	Meaning  string `json:"meaning,omitempty"`
	Wrong    int    `json:"wrong"`
	Reason   string `json:"reason,omitempty"`
}

// AgentSessionInfo is the progress shown on the practice page.
type AgentSessionInfo struct {
	Answered int `json:"answered,omitempty"`
	Correct  int `json:"correct,omitempty"`
	Total    int `json:"total,omitempty"`
	Position int `json:"position,omitempty"`
	PageSize int `json:"pageSize,omitempty"`
	Page     int `json:"page,omitempty"`
	Pages    int `json:"pages,omitempty"`
}

// AgentReadingInfo carries the reading page position.
type AgentReadingInfo struct {
	ArticleID    string `json:"articleId,omitempty"`
	ArticleTitle string `json:"articleTitle,omitempty"`
	Paragraph    int    `json:"paragraph,omitempty"`
	Paragraphs   int    `json:"paragraphs,omitempty"`
	Sentence     string `json:"sentence,omitempty"`
}

// AgentStudentInfo is the cross-session part of the profile.
type AgentStudentInfo struct {
	Level        string   `json:"level,omitempty"`
	Practiced    int      `json:"practiced"`
	OverallScore int      `json:"overallScore"`
	StreakDays   int      `json:"streakDays"`
	DueCount     int      `json:"dueCount"`
	Weakest      []string `json:"weakest,omitempty"`
}

// AgentSnapshot is everything the assistant is told about the learner.
type AgentSnapshot struct {
	Scene    string            `json:"scene,omitempty"`
	Mode     string            `json:"mode,omitempty"`
	QuizType string            `json:"quizType,omitempty"`
	Filters  map[string]string `json:"filters,omitempty"`
	Session  *AgentSessionInfo `json:"session,omitempty"`
	Current  *AgentCurrentItem `json:"current,omitempty"`
	Reading  *AgentReadingInfo `json:"reading,omitempty"`
	Weak     []AgentWeakItem   `json:"weak,omitempty"`
	Student  *AgentStudentInfo `json:"student,omitempty"`
}

// ---------------------------------------------------------------------------
// Context extraction
// ---------------------------------------------------------------------------

func agentContextString(values map[string]any, key string) string {
	if values == nil {
		return ""
	}
	switch value := values[key].(type) {
	case string:
		return strings.TrimSpace(value)
	case json.Number:
		return value.String()
	case float64:
		return strconv.FormatFloat(value, 'f', -1, 64)
	case float32:
		return strconv.FormatFloat(float64(value), 'f', -1, 32)
	case int:
		return strconv.Itoa(value)
	case int64:
		return strconv.FormatInt(value, 10)
	case int32:
		return strconv.FormatInt(int64(value), 10)
	case bool:
		if value {
			return "true"
		}
		return "false"
	}
	return ""
}

func agentContextInt(values map[string]any, key string) int {
	text := agentContextString(values, key)
	if text == "" {
		return 0
	}
	if parsed, err := strconv.Atoi(text); err == nil {
		return parsed
	}
	if parsed, err := strconv.ParseFloat(text, 64); err == nil {
		return int(parsed)
	}
	return 0
}

func agentContextBool(values map[string]any, key string) (bool, bool) {
	if values == nil {
		return false, false
	}
	switch value := values[key].(type) {
	case bool:
		return value, true
	case string:
		switch strings.ToLower(strings.TrimSpace(value)) {
		case "true", "1", "yes":
			return true, true
		case "false", "0", "no":
			return false, true
		}
	case float64:
		return value != 0, true
	}
	return false, false
}

func agentContextStrings(values map[string]any, key string) []string {
	if values == nil {
		return nil
	}
	items, ok := values[key].([]any)
	if !ok {
		if typed, ok := values[key].([]string); ok {
			return append([]string(nil), typed...)
		}
		return nil
	}
	out := make([]string, 0, len(items))
	for _, item := range items {
		text := ""
		switch value := item.(type) {
		case string:
			text = strings.TrimSpace(value)
		case float64:
			text = strconv.FormatFloat(value, 'f', -1, 64)
		case int:
			text = strconv.Itoa(value)
		case int64:
			text = strconv.FormatInt(value, 10)
		}
		if text != "" {
			out = append(out, text)
		}
	}
	return out
}

// agentSceneFromMode maps the practice mode onto one of the scene guides.
func agentSceneFromMode(mode string) string {
	switch strings.ToLower(strings.TrimSpace(mode)) {
	case "meaning", "word":
		return "meaning"
	case "quiz", "spelling":
		return "quiz"
	case "reading":
		return "reading"
	case "mistake", "mistakes":
		return "mistake"
	case "exam", "homework":
		return "exam"
	}
	return "general"
}

// agentQuickActionName keeps only the actions this build understands, so an
// unknown value behaves like a normal chat question instead of failing.
func agentQuickActionName(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case agentQuickExplain, agentQuickExplainWrong, agentQuickCompare, agentQuickExplainSentence, agentQuickDrill, agentQuickAddReview:
		return strings.ToLower(strings.TrimSpace(value))
	}
	return ""
}

// ---------------------------------------------------------------------------
// Snapshot building
// ---------------------------------------------------------------------------

// buildAgentSnapshot enriches the page context with the learner's own history.
// The browser only tells us *which* word is on screen; spelling, meaning and
// the correct answer are re-read from the library.
func (s *Store) buildAgentSnapshot(user User, in AgentChatRequest, now time.Time) AgentSnapshot {
	values := in.Context
	snapshot := AgentSnapshot{
		Scene:    agentContextString(values, "scene"),
		Mode:     strings.TrimSpace(in.Mode),
		QuizType: agentContextString(values, "quizType"),
	}
	if snapshot.Scene == "" {
		snapshot.Scene = agentSceneFromMode(in.Mode)
	}
	if snapshot.QuizType == "" {
		snapshot.QuizType = agentContextString(values, "type")
	}
	if filters := agentContextFilters(values); len(filters) > 0 {
		snapshot.Filters = filters
	}
	if session := agentContextSession(values); session != nil {
		snapshot.Session = session
	}
	if reading := agentContextReading(values); reading != nil {
		snapshot.Reading = reading
	}

	progress, _ := s.readProgress(user.ID)
	level := agentContextString(values, "level")

	wordID := agentContextString(values, "wordId")
	if wordID == "" {
		wordID = agentContextString(values, "itemId")
	}
	if wordID != "" {
		word, ok := s.findWordInScope(level, wordID)
		if !ok {
			// The page may report a stage that differs from the library entry
			// (for example "all" on the 全部范围 practice); fall back to a
			// library-wide lookup before giving up.
			word, ok = s.findWordInScope(quizScopeAll, wordID)
		}
		if ok {
			item := &AgentCurrentItem{
				Level:              word.Level,
				WordID:             word.ID,
				Spelling:           word.Word,
				Phonetic:           word.Phonetic,
				Pos:                word.Pos,
				Meaning:            word.Meaning,
				Topic:              word.Topic,
				Grade:              word.Grade,
				Example:            truncateRunes(word.Example, agentExampleMaxRunes),
				ExampleTranslation: truncateRunes(word.ExampleTranslation, agentExampleMaxRunes),
				Prompt:             truncateRunes(agentContextString(values, "prompt"), agentExampleMaxRunes),
			}
			for _, option := range agentContextStrings(values, "options") {
				if len(item.Options) >= agentSnapshotMaxOptions {
					break
				}
				item.Options = append(item.Options, truncateRunes(option, agentOptionMaxRunes))
			}
			item.SelectedAnswer = truncateRunes(agentContextString(values, "selectedAnswer"), agentOptionMaxRunes)
			item.CorrectAnswer = truncateRunes(agentContextString(values, "correctAnswer"), agentOptionMaxRunes)
			if item.CorrectAnswer == "" {
				item.CorrectAnswer = agentQuizOptionValue(word, snapshot.QuizType)
			}
			item.Answered = item.SelectedAnswer != ""
			if correct, ok := agentContextBool(values, "correct"); ok {
				item.IsCorrect = correct
			} else if item.Answered {
				item.IsCorrect = strings.EqualFold(item.SelectedAnswer, item.CorrectAnswer)
			}
			item.WrongTimes = agentContextInt(values, "wrongTimes")
			item.History = s.agentWordHistory(progress, word.Level, word.ID, now)
			// The assistant's own earlier conclusion is part of the learner's
			// history too: the prompt says what was already explained.
			if note, err := s.tutorNoteFor(user.ID, word.Level, word.ID); err == nil && note != nil {
				item.TutorNote = &AgentTutorNote{At: note.UpdatedAt, Exchanges: note.Exchanges, Summary: note.Summary}
			}
			snapshot.Current = item
		}
	}

	snapshot.Weak = s.agentWeakItems(progress, level, wordID, now)
	snapshot.Student = s.agentStudentSummary(progress, level, now)
	return snapshot
}

func agentContextFilters(values map[string]any) map[string]string {
	out := map[string]string{}
	for _, key := range []string{"scope", "grade", "topic", "pos", "sort"} {
		label := agentContextString(values, key)
		if label == "" {
			continue
		}
		out[key] = truncateRunes(label, agentOptionMaxRunes)
	}
	return out
}

func agentContextSession(values map[string]any) *AgentSessionInfo {
	session := &AgentSessionInfo{
		Answered: agentContextInt(values, "answered"),
		Correct:  agentContextInt(values, "sessionCorrect"),
		Total:    agentContextInt(values, "total"),
		Position: agentContextInt(values, "position"),
		PageSize: agentContextInt(values, "pageSize"),
		Page:     agentContextInt(values, "page"),
		Pages:    agentContextInt(values, "pages"),
	}
	if *session == (AgentSessionInfo{}) {
		return nil
	}
	return session
}

func agentContextReading(values map[string]any) *AgentReadingInfo {
	reading := &AgentReadingInfo{
		ArticleID:    agentContextString(values, "articleId"),
		ArticleTitle: truncateRunes(agentContextString(values, "articleTitle"), agentOptionMaxRunes),
		Paragraph:    agentContextInt(values, "paragraph"),
		Paragraphs:   agentContextInt(values, "paragraphs"),
		Sentence:     truncateRunes(agentContextString(values, "sentence"), agentExampleMaxRunes),
	}
	if *reading == (AgentReadingInfo{}) {
		return nil
	}
	return reading
}

// agentWordHistory reads what the learner has already done with this word.
func (s *Store) agentWordHistory(progress map[string]Progress, level, id string, now time.Time) *AgentWordHistory {
	key := progressKey(level, id)
	saved, ok := progress[key]
	if !ok {
		return nil
	}
	history := &AgentWordHistory{
		Seen: saved.Seen, Correct: saved.Correct, Wrong: saved.Wrong,
		ReviewStreak: saved.ReviewStreak, ReviewCount: saved.ReviewCount,
		Mastered: saved.Mastered, Resolved: saved.Resolved, NextReview: saved.NextReview,
	}
	if next, err := time.Parse(time.RFC3339, saved.NextReview); err == nil {
		history.Due = !next.After(now)
	}
	if mastery, ok := s.wordMastery(key, saved, now); ok {
		history.MasteryScore = mastery.Score
		history.Reason = mastery.Reason
	}
	wrong := map[string]int{}
	for quizType, result := range saved.QuizResults {
		if result.Wrong > 0 {
			wrong[quizType] = result.Wrong
		}
	}
	if len(wrong) > 0 {
		history.QuizWrong = wrong
	}
	return history
}

// agentWeakItems lists the most recent unresolved mistakes, optionally
// preferring words from the same topic as the current question.
func (s *Store) agentWeakItems(progress map[string]Progress, level, currentID string, now time.Time) []AgentWeakItem {
	if len(progress) == 0 {
		return nil
	}
	type scored struct {
		item      AgentWeakItem
		sameTopic bool
	}
	items := make([]scored, 0, 8)
	currentTopic := ""
	if word, ok := s.findWordInScope(level, currentID); ok && currentID != "" {
		currentTopic = word.Topic
	}
	for key, saved := range progress {
		if saved.Wrong == 0 || saved.Resolved {
			continue
		}
		if level != "" && !isQuizScopeAll(level) && !strings.HasPrefix(key, normalizeLevel(level)+":") {
			continue
		}
		word, ok := s.wordIndex[key]
		if !ok || !publicContentStatus(word.Status) {
			continue
		}
		item := AgentWeakItem{Spelling: word.Word, Meaning: word.Meaning, Wrong: saved.Wrong}
		if mastery, ok := s.wordMastery(key, saved, now); ok {
			item.Reason = mastery.Reason
		}
		items = append(items, scored{item: item, sameTopic: currentTopic != "" && word.Topic == currentTopic})
	}
	sort.Slice(items, func(i, j int) bool {
		if items[i].sameTopic != items[j].sameTopic {
			return items[i].sameTopic
		}
		if items[i].item.Wrong == items[j].item.Wrong {
			return items[i].item.Spelling < items[j].item.Spelling
		}
		return items[i].item.Wrong > items[j].item.Wrong
	})
	if len(items) > agentSnapshotMaxWeakItems {
		items = items[:agentSnapshotMaxWeakItems]
	}
	out := make([]AgentWeakItem, 0, len(items))
	for _, entry := range items {
		out = append(out, entry.item)
	}
	return out
}

// agentStudentSummary is the cross-session part: how strong the learner is,
// how many words are due today and which words keep coming back.
func (s *Store) agentStudentSummary(progress map[string]Progress, level string, now time.Time) *AgentStudentInfo {
	if len(progress) == 0 {
		return &AgentStudentInfo{Level: level}
	}
	summary := &AgentStudentInfo{Level: level, StreakDays: learningStreak(progress, now)}
	weak := make([]AgentWeakItem, 0, 4)
	for key, saved := range progress {
		if level != "" && !isQuizScopeAll(level) && !strings.HasPrefix(key, normalizeLevel(level)+":") {
			continue
		}
		mastery, ok := s.wordMastery(key, saved, now)
		if !ok {
			continue
		}
		summary.Practiced++
		summary.OverallScore += mastery.Score
		if contains(mastery.Tags, "到期复习") {
			summary.DueCount++
		}
		if saved.Wrong > 0 && !saved.Resolved {
			weak = append(weak, AgentWeakItem{Spelling: mastery.Label, Wrong: saved.Wrong, Reason: mastery.Reason})
		}
	}
	if summary.Practiced > 0 {
		summary.OverallScore /= summary.Practiced
	}
	sort.Slice(weak, func(i, j int) bool {
		if weak[i].Wrong == weak[j].Wrong {
			return weak[i].Spelling < weak[j].Spelling
		}
		return weak[i].Wrong > weak[j].Wrong
	})
	if len(weak) > agentSnapshotMaxWeakItems {
		weak = weak[:agentSnapshotMaxWeakItems]
	}
	for _, item := range weak {
		summary.Weakest = append(summary.Weakest, fmt.Sprintf("%s（错 %d 次）", item.Spelling, item.Wrong))
	}
	return summary
}

// ---------------------------------------------------------------------------
// Prompt rendering
// ---------------------------------------------------------------------------

// renderAgentSnapshot turns the snapshot into the short, human-readable brief
// that precedes the learner's question. The budget keeps a long practice page
// (hundreds of options) from flooding the prompt.
func renderAgentSnapshot(snapshot AgentSnapshot) string {
	lines := make([]string, 0, 16)
	if student := snapshot.Student; student != nil {
		parts := []string{}
		if student.Level != "" {
			parts = append(parts, "学段："+agentLevelLabel(student.Level))
		}
		if student.Practiced > 0 {
			parts = append(parts, fmt.Sprintf("平均掌握度 %d/100", student.OverallScore))
		}
		if student.StreakDays > 0 {
			parts = append(parts, fmt.Sprintf("连续学习 %d 天", student.StreakDays))
		}
		if student.DueCount > 0 {
			parts = append(parts, fmt.Sprintf("今日到期复习 %d 个", student.DueCount))
		}
		if len(student.Weakest) > 0 {
			parts = append(parts, "最薄弱："+strings.Join(student.Weakest, "、"))
		}
		if len(parts) > 0 {
			lines = append(lines, "【学生档案】"+strings.Join(parts, " · "))
		}
	}
	if session := snapshot.Session; session != nil {
		parts := []string{}
		if session.Position > 0 {
			parts = append(parts, fmt.Sprintf("第 %d 题", session.Position))
		}
		if session.Answered > 0 {
			answered := fmt.Sprintf("本次已答 %d 题，答对 %d 题", session.Answered, session.Correct)
			if session.Total > 0 {
				answered += fmt.Sprintf("（题库共 %d 题）", session.Total)
			}
			parts = append(parts, answered)
		}
		if session.Pages > 1 {
			parts = append(parts, fmt.Sprintf("第 %d/%d 页，每页 %d 题", session.Page, session.Pages, session.PageSize))
		}
		if len(parts) > 0 {
			lines = append(lines, "【练习进度】"+strings.Join(parts, " · "))
		}
	}
	if len(snapshot.Filters) > 0 {
		order := []string{"scope", "grade", "topic", "pos"}
		labels := map[string]string{"scope": "范围", "grade": "年级", "topic": "主题", "pos": "词性"}
		parts := make([]string, 0, len(order))
		for _, key := range order {
			if value := snapshot.Filters[key]; value != "" {
				parts = append(parts, labels[key]+"="+value)
			}
		}
		if len(parts) > 0 {
			lines = append(lines, "【当前筛选】"+strings.Join(parts, " · "))
		}
	}
	if item := snapshot.Current; item != nil {
		head := "【当前题目】" + item.Spelling
		if item.Phonetic != "" {
			head += " " + item.Phonetic
		}
		if item.Pos != "" {
			head += "（" + item.Pos + "）"
		}
		if item.Meaning != "" {
			head += " 释义：" + item.Meaning
		}
		lines = append(lines, head)
		if len(item.Options) > 0 {
			options := make([]string, 0, len(item.Options))
			for index, option := range item.Options {
				options = append(options, fmt.Sprintf("%d.%s", index+1, option))
			}
			lines = append(lines, "  选项："+strings.Join(options, " | "))
		}
		if item.TutorNote != nil && item.TutorNote.Summary != "" {
			lines = append(lines, "  上次助教讲解（累计 "+strconv.Itoa(item.TutorNote.Exchanges)+" 次）："+item.TutorNote.Summary)
		}
		if item.Answered {
			verdict := "答对"
			if !item.IsCorrect {
				verdict = "答错"
			}
			lines = append(lines, fmt.Sprintf("  学生选择：%s；正确答案：%s（%s）", item.SelectedAnswer, item.CorrectAnswer, verdict))
			if item.WrongTimes > 0 {
				lines = append(lines, fmt.Sprintf("  这道题目前累计答错 %d 次。", item.WrongTimes))
			}
		}
		if item.Example != "" {
			example := "  例句：" + item.Example
			if item.ExampleTranslation != "" {
				example += "（" + item.ExampleTranslation + "）"
			}
			lines = append(lines, example)
		}
		if history := item.History; history != nil {
			detail := fmt.Sprintf("  该词历史：出现 %d 次、答对 %d 次、答错 %d 次、复习连续答对 %d 次", history.Seen, history.Correct, history.Wrong, history.ReviewStreak)
			if history.MasteryScore > 0 {
				detail += fmt.Sprintf("，掌握度 %d/100", history.MasteryScore)
			}
			if history.Reason != "" {
				detail += "（" + history.Reason + "）"
			}
			lines = append(lines, detail)
			if len(history.QuizWrong) > 0 {
				types := make([]string, 0, len(history.QuizWrong))
				for quizType, count := range history.QuizWrong {
					types = append(types, fmt.Sprintf("%s 错 %d 次", quizTypeLabel(quizType), count))
				}
				sort.Strings(types)
				lines = append(lines, "  题型错误分布："+strings.Join(types, "、"))
			}
			if history.NextReview != "" {
				due := ""
				if history.Due {
					due = "，已到期"
				}
				lines = append(lines, "  下次复习："+history.NextReview+due)
			}
		} else {
			lines = append(lines, "  该词历史：学生还没有练习记录。")
		}
	} else if snapshot.Mode != "" && snapshot.Scene != "general" {
		lines = append(lines, "【当前题目】页面没有提供具体题目（学生可能停在列表或结算页）。")
	}
	if reading := snapshot.Reading; reading != nil {
		parts := []string{}
		if reading.ArticleTitle != "" {
			parts = append(parts, "文章："+reading.ArticleTitle)
		}
		if reading.Paragraph > 0 {
			parts = append(parts, fmt.Sprintf("第 %d 段", reading.Paragraph))
		}
		if reading.Sentence != "" {
			parts = append(parts, "学生选中："+reading.Sentence)
		}
		if len(parts) > 0 {
			lines = append(lines, "【阅读上下文】"+strings.Join(parts, " · "))
		}
	}
	if len(snapshot.Weak) > 0 {
		items := make([]string, 0, len(snapshot.Weak))
		for _, item := range snapshot.Weak {
			label := fmt.Sprintf("%s（错 %d 次", item.Spelling, item.Wrong)
			if item.Meaning != "" {
				label += "，" + item.Meaning
			}
			if item.Reason != "" {
				label += "，" + item.Reason
			}
			items = append(items, label+"）")
		}
		lines = append(lines, "【近期错题】"+strings.Join(items, "；"))
	}
	return truncateRunes(strings.Join(lines, "\n"), agentSnapshotTextBudget)
}

func agentLevelLabel(level string) string {
	switch normalizeLevel(level) {
	case "middle":
		return "初中英语"
	}
	if isQuizScopeAll(level) {
		return "全部范围（小学 + 初中）"
	}
	return "小学英语"
}

// agentSceneGuides are the per-scene teaching instructions appended to the
// administrator's system prompt. Keeping them in code (instead of asking the
// administrator to maintain them) means every scene is pedagogically sane by
// default, while the admin prompt still defines the persona.
var agentSceneGuides = map[string]string{
	"meaning": "当前场景：词义练习（看词选义 / 看义选词 / 听音选义）。讲解顺序：词性与核心义项 → 词根词缀或记忆线索 → 常见搭配 → 与易混词的区别 → 一个可迁移的例句。",
	"quiz":    "当前场景：单词测验。先点出这道题考查的知识点，再逐个说明选项为什么对或错，最后给一条下次遇到同类题的判断依据。",
	"mistake": "当前场景：错题归因。先判断错因类别（词义不熟 / 形近或音近混淆 / 搭配不熟 / 词性误判 / 粗心），再对比错误选项与正确选项，最后给一个 30 秒内能完成的自测动作。",
	"reading": "当前场景：文章阅读。逐句拆解句子成分与指代关系，解释生词在此处的具体义项；不要整段翻译。",
	"exam":    "当前场景：考试 / 作业讲解。只讲思路与排除法，不要直接给出答案，用提问引导学生自己得出结论。",
	"general": "当前场景：综合学习问答。优先结合学习记录回答，给出可执行的下一步动作。",
}

const agentCommonRules = `通用规则：
1. 正确答案以题库和词库为准，只解释为什么；如果你认为题目本身有误，请指出并说明理由，不要直接改成另一个答案。
2. 不要编造词库中不存在的单词、释义或例句；不确定时直接说明不确定。
3. 中文讲解为主，英文例句保持简短；除非学生要求展开，回答控制在 350 字以内。
4. 结尾给一个 30 秒内能完成的小动作（例如再读一遍例句、点“出同类题”巩固）。`

// agentInstructions composes the administrator's persona with the scene guide.
func agentInstructions(cfg AgentConfig, scene string) string {
	guide := agentSceneGuides[scene]
	if guide == "" {
		guide = agentSceneGuides["general"]
	}
	persona := strings.TrimSpace(cfg.SystemPrompt)
	if persona == "" {
		persona = defaultAgentConfig().SystemPrompt
	}
	return persona + "\n\n" + guide + "\n" + agentCommonRules
}

// agentDefaultMessage turns a button click into a question the model can
// answer, so the learner never has to retype what is already on screen.
func agentDefaultMessage(quick string, snapshot AgentSnapshot) string {
	item := snapshot.Current
	switch quick {
	case agentQuickExplain:
		if item != nil && snapshot.Scene == "mistake" {
			return fmt.Sprintf("我在“%s”上反复出错，帮我分析错因，并给一个马上能做的巩固动作。", item.Spelling)
		}
		if item != nil {
			return fmt.Sprintf("讲讲“%s”这个词：它在这个句子里是什么意思，应该怎么记？", item.Spelling)
		}
		return "讲讲这道题考查的知识点。"
	case agentQuickExplainWrong:
		if item != nil && item.Answered {
			return fmt.Sprintf("我选了“%s”，为什么不对？正确答案“%s”为什么对？", item.SelectedAnswer, item.CorrectAnswer)
		}
		return "这道题我为什么做错了？"
	case agentQuickCompare:
		if item != nil {
			return fmt.Sprintf("“%s”和这些选项里的其他词有什么区别，怎么区分？", item.Spelling)
		}
		return "这些选项之间有什么区别，怎么区分？"
	case agentQuickExplainSentence:
		if reading := snapshot.Reading; reading != nil && reading.Sentence != "" {
			return "解释这句话的句子成分和其中的生词。"
		}
		return "解释这段话的句子成分和生词。"
	}
	return ""
}

// ---------------------------------------------------------------------------
// Drill generation
// ---------------------------------------------------------------------------

// AgentDrill is a set of practice questions built for one learner, in the same
// JSON shape as /api/meaning-quiz items, so the practice UI can render and
// grade them without any special casing.
type AgentDrill struct {
	Title    string `json:"title"`
	Focus    string `json:"focus,omitempty"`
	Note     string `json:"note,omitempty"`
	Level    string `json:"level"`
	Type     string `json:"type"`
	Source   string `json:"source"`
	WordID   string `json:"wordId,omitempty"`
	Spelling string `json:"spelling,omitempty"`
	Items    []Quiz `json:"items"`
}

// buildAgentDrill asks the model which words are worth drilling next, validates
// every pick against the word library, and then builds the questions from real
// entries. If the model is unavailable or returns nonsense the drill falls back
// to the library's own neighbourhood of the word, so the learner still gets
// something to practise.
func (s *Store) buildAgentDrill(ctx context.Context, root string, cfg AgentConfig, user User, in AgentChatRequest, now time.Time) (*AgentDrill, error) {
	values := in.Context
	level := agentContextString(values, "level")
	wordID := agentContextString(values, "wordId")
	if wordID == "" {
		wordID = agentContextString(values, "itemId")
	}
	focus, ok := s.findWordInScope(level, wordID)
	if !ok {
		focus, ok = s.findWordInScope(quizScopeAll, wordID)
	}
	if !ok {
		return nil, agentRequestError("没有找到要巩固的单词，请先打开具体题目再让助教出题")
	}
	quizType := normalizeQuizType(agentContextString(values, "quizType"))
	if quizType == quizTypeSpelling || quizType == quizTypeCloze {
		// 变式题用选择题呈现，拼写/完形题干无法直接复用。
		quizType = quizTypeEnZh
	}
	count := agentContextInt(values, "drillCount")
	if count <= 0 {
		count = agentDrillCountDefault
	}
	if count > agentDrillCountMax {
		count = agentDrillCountMax
	}
	candidates := s.agentDrillCandidates(focus, level)
	if len(candidates) < 3 {
		return nil, agentRequestError("词库里和“%s”同范围的单词太少，暂时无法生成同类题", focus.Word)
	}

	picks, note, drillFocus, source := agentDrillPlan(ctx, root, cfg, focus, candidates, count)
	items := make([]Quiz, 0, len(picks))
	for _, pick := range picks {
		items = append(items, s.buildDrillQuestion(pick, quizType, focus, candidates))
	}
	if len(items) == 0 {
		return nil, agentRequestError("暂时无法生成同类题，请稍后再试")
	}
	if strings.TrimSpace(note) == "" {
		note = fmt.Sprintf("围绕“%s”准备了 %d 道同类题，做的时候注意和易混词区分。", focus.Word, len(items))
	}
	drill := &AgentDrill{
		Title:    "变式练习 · " + focus.Word,
		Focus:    drillFocus,
		Note:     note,
		Level:    normalizeLevel(focus.Level),
		Type:     quizType,
		Source:   source,
		WordID:   focus.ID,
		Spelling: focus.Word,
		Items:    items,
	}
	return drill, nil
}

// agentDrillCandidates collects the words that are genuinely confusable with
// the focus word: same topic first, then same part of speech, then the rest of
// the scope. The list is deterministic so the fallback drill is reproducible.
func (s *Store) agentDrillCandidates(focus Word, level string) []Word {
	scope := level
	if scope == "" {
		scope = focus.Level
	}
	type scored struct {
		word Word
		rank int
	}
	pool := make([]scored, 0, 64)
	for _, candidate := range s.wordsForScope(scope) {
		if !publicContentStatus(candidate.Status) {
			continue
		}
		if progressKey(candidate.Level, candidate.ID) == progressKey(focus.Level, focus.ID) {
			continue
		}
		if strings.TrimSpace(candidate.Word) == "" || strings.TrimSpace(candidate.Meaning) == "" {
			continue
		}
		rank := 3
		switch {
		case focus.Topic != "" && candidate.Topic == focus.Topic && focus.Pos != "" && candidate.Pos == focus.Pos:
			rank = 0
		case focus.Topic != "" && candidate.Topic == focus.Topic:
			rank = 1
		case focus.Pos != "" && candidate.Pos == focus.Pos:
			rank = 2
		}
		pool = append(pool, scored{word: candidate, rank: rank})
	}
	sort.Slice(pool, func(i, j int) bool {
		if pool[i].rank == pool[j].rank {
			return pool[i].word.Word < pool[j].word.Word
		}
		return pool[i].rank < pool[j].rank
	})
	if len(pool) > agentDrillCandidateLimit {
		pool = pool[:agentDrillCandidateLimit]
	}
	out := make([]Word, 0, len(pool))
	for _, entry := range pool {
		out = append(out, entry.word)
	}
	return out
}

type agentDrillPick struct {
	Level  string `json:"level"`
	WordID string `json:"wordId"`
	Word   string `json:"word"`
	ID     string `json:"id"`
	Reason string `json:"reason"`
}

type agentDrillPlanPayload struct {
	Focus string           `json:"focus"`
	Note  string           `json:"note"`
	Picks []agentDrillPick `json:"picks"`
}

// agentDrillPlan asks the model to choose the next words to drill. The model
// only ranks and explains; the picks are validated against the candidate list
// and the library, and missing picks are topped up from the candidates.
func agentDrillPlan(ctx context.Context, root string, cfg AgentConfig, focus Word, candidates []Word, count int) ([]Word, string, string, string) {
	fallback := func() ([]Word, string, string, string) {
		picks := make([]Word, 0, count)
		for _, candidate := range candidates {
			if len(picks) >= count {
				break
			}
			picks = append(picks, candidate)
		}
		return picks, "", "", "library"
	}
	if !cfg.Enabled {
		return fallback()
	}

	lines := make([]string, 0, len(candidates))
	for _, candidate := range candidates {
		lines = append(lines, fmt.Sprintf("- %s|%s|%s|%s|%s", candidate.Level, candidate.ID, candidate.Word, candidate.Meaning, candidate.Topic))
	}
	const schema = `{"focus":"一句话说明学生在这道题上的混淆点","note":"2-3 句面向学生的讲解，指出易混点","picks":[{"level":"primary","wordId":"候选词表里的 ID","reason":"为什么练这个词"}]}`
	prompt := fmt.Sprintf(`你是英语词汇教研老师。学生刚做错了下面这个单词，请从候选词表里挑 %d 个最容易和他混淆、最值得马上练的词。
只输出一个合法 JSON 对象，禁止 Markdown 代码围栏和解释文字，结构：%s
要求：picks 必须来自候选词表，数量正好 %d 个，不能重复，不要选目标词本身。

目标词：%s 释义：%s 词性：%s 主题：%s
候选词表（学段|ID|单词|释义|主题）：
%s`, count, schema, count, focus.Word, focus.Meaning, focus.Pos, focus.Topic, strings.Join(lines, "\n"))

	runCtx, cancel := context.WithTimeout(ctx, time.Duration(cfg.TimeoutSeconds)*time.Second)
	defer cancel()
	result, err := runTextAgent(runCtx, root, cfg, prompt, agentInstructions(cfg, "quiz"))
	if err != nil {
		return fallback()
	}
	raw, err := extractJSONObject(result)
	if err != nil {
		return fallback()
	}
	var payload agentDrillPlanPayload
	if err := json.Unmarshal(raw, &payload); err != nil {
		return fallback()
	}
	byKey := map[string]Word{}
	for _, candidate := range candidates {
		byKey[progressKey(candidate.Level, candidate.ID)] = candidate
	}
	picks := make([]Word, 0, count)
	seen := map[string]bool{}
	for _, pick := range payload.Picks {
		id := firstNonEmpty(pick.WordID, pick.Word, pick.ID)
		if id == "" {
			continue
		}
		level := pick.Level
		if level == "" {
			level = focus.Level
		}
		word, ok := byKey[progressKey(level, id)]
		if !ok {
			// Be forgiving about a stage mismatch coming from the model.
			for _, candidate := range candidates {
				if strings.EqualFold(candidate.ID, id) {
					word, ok = candidate, true
					break
				}
			}
		}
		if !ok {
			continue
		}
		key := progressKey(word.Level, word.ID)
		if seen[key] {
			continue
		}
		seen[key] = true
		picks = append(picks, word)
		if len(picks) >= count {
			break
		}
	}
	for _, candidate := range candidates {
		if len(picks) >= count {
			break
		}
		key := progressKey(candidate.Level, candidate.ID)
		if seen[key] {
			continue
		}
		seen[key] = true
		picks = append(picks, candidate)
	}
	source := "agent"
	if len(picks) == 0 {
		return fallback()
	}
	return picks, truncateRunes(payload.Note, 600), truncateRunes(payload.Focus, 200), source
}

// buildDrillQuestion renders one drill question from a real library word. The
// focus word is always among the options so the question actually tests the
// confusion, and the remaining options come from the candidate list.
//
// Options are filtered for meaning overlap: showing 「感冒」 next to
// 「感冒;伤风」 makes a question unanswerable, so a candidate whose option text
// shares a sense with the answer (or with an option already on screen) is
// skipped. When the pool is too small to fill four clean options the filter is
// relaxed, because a four-option question beats a perfect-but-empty one; the
// answer itself is never duplicated either way.
func (s *Store) buildDrillQuestion(base Word, quizType string, focus Word, candidates []Word) Quiz {
	answer, prompt := agentQuizOptionValue(base, quizType), base.Word
	if answersWithWord(quizType) {
		prompt = base.Meaning
	}
	options := []string{}
	add := func(value string) bool {
		if value == "" || len(options) >= 4 {
			return false
		}
		if containsFold(options, value) {
			return false
		}
		options = append(options, value)
		return true
	}
	// addDistinct only accepts an option that is still distinguishable from the
	// answer key and from everything already on screen.
	addDistinct := func(value string) bool {
		if value == "" || len(options) >= 4 {
			return false
		}
		if drillOptionOverlap(answer, value, quizType) {
			return false
		}
		for _, existing := range options {
			if drillOptionOverlap(existing, value, quizType) {
				return false
			}
		}
		return add(value)
	}
	add(answer)
	addDistinct(agentQuizOptionValue(focus, quizType))
	pool := make([]string, 0, len(candidates))
	for _, candidate := range candidates {
		pool = append(pool, agentQuizOptionValue(candidate, quizType))
	}
	for _, value := range pool {
		if len(options) >= 4 {
			break
		}
		addDistinct(value)
	}
	if len(options) < 4 {
		// Degenerate pool (very small stage): top up from the whole scope.
		for _, candidate := range s.wordsForScope(quizScopeAll) {
			if len(options) >= 4 {
				break
			}
			if !publicContentStatus(candidate.Status) {
				continue
			}
			addDistinct(agentQuizOptionValue(candidate, quizType))
		}
	}
	if len(options) < 4 {
		// Last resort: the whole library cannot supply four non-overlapping
		// options, so relax the overlap rule. Duplicates are still impossible.
		for _, value := range pool {
			if len(options) >= 4 {
				break
			}
			add(value)
		}
		for _, candidate := range s.wordsForScope(quizScopeAll) {
			if len(options) >= 4 {
				break
			}
			if !publicContentStatus(candidate.Status) {
				continue
			}
			add(agentQuizOptionValue(candidate, quizType))
		}
	}
	seed := int64(0)
	for _, r := range base.Level + "|" + base.ID + "|" + quizType {
		seed = seed*31 + int64(r)
	}
	rng := rand.New(rand.NewSource(seed))
	rng.Shuffle(len(options), func(i, j int) { options[i], options[j] = options[j], options[i] })
	return Quiz{Word: base, Options: options, Type: quizType, Prompt: prompt, Answer: answer}
}

// drillOptionOverlap reports whether two option texts are too close to sit in
// the same multiple-choice question, for example 「感冒」 and 「感冒;伤风」, or
// the words "at all" and "not...at all".
func drillOptionOverlap(a, b, quizType string) bool {
	na, nb := drillOptionKey(a), drillOptionKey(b)
	if na == "" || nb == "" {
		return na == nb
	}
	if na == nb {
		return true
	}
	ta, tb := drillOptionTokens(na), drillOptionTokens(nb)
	for _, x := range ta {
		for _, y := range tb {
			if x == y {
				return true
			}
		}
	}
	// 「有点儿」/「一点儿」 style glosses and plural or phrase variants share the
	// same core text even when the token sets differ.
	ja, jb := strings.Join(ta, ""), strings.Join(tb, "")
	if ja == "" || jb == "" {
		return false
	}
	return strings.Contains(ja, jb) || strings.Contains(jb, ja)
}

// drillOptionKey normalises one option for comparison: case, spacing and
// parenthetical glosses are dropped so 「一（用于单数可数名词前）」 and
// 「一(人、事、物)」 compare as the same sense.
func drillOptionKey(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	value = drillStripGlosses(value)
	return strings.Join(strings.Fields(value), "")
}

// drillStripGlosses removes bracketed glosses from an option.
func drillStripGlosses(value string) string {
	var out strings.Builder
	depth := 0
	for _, r := range value {
		switch r {
		case '(', '（', '[', '【', '{':
			depth++
			continue
		case ')', '）', ']', '】', '}':
			if depth > 0 {
				depth--
			}
			continue
		}
		if depth == 0 {
			out.WriteRune(r)
		}
	}
	return out.String()
}

// drillOptionTokens splits an option into comparable units. Meanings are
// separated by ; , / and friends, words by spaces and dots ("not...at all").
func drillOptionTokens(key string) []string {
	fields := strings.FieldsFunc(key, func(r rune) bool {
		switch r {
		case ';', '；', ',', '，', '、', '/', '|', '·', '.', '。', ' ', '\t':
			return true
		}
		return false
	})
	out := make([]string, 0, len(fields))
	for _, field := range fields {
		if field = strings.TrimSpace(field); field != "" {
			out = append(out, field)
		}
	}
	return out
}

// agentQuizOptionValue is the option text a question shows for one word.
func agentQuizOptionValue(word Word, quizType string) string {
	if answersWithWord(quizType) {
		return word.Word
	}
	return word.Meaning
}

// truncateRunes caps a string at max runes, keeping the prompt budget honest.
func truncateRunes(value string, max int) string {
	value = strings.TrimSpace(value)
	if max <= 0 {
		return value
	}
	runes := []rune(value)
	if len(runes) <= max {
		return value
	}
	return string(runes[:max]) + "…"
}
