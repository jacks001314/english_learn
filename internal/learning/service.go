package learning

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"sort"
	"strings"
	"time"

	bolt "go.etcd.io/bbolt"
)

type Service struct{ userID string }

func NewService(userIDs ...string) *Service {
	s := &Service{}
	if len(userIDs) > 0 {
		s.userID = userIDs[0]
	}
	return s
}

func (s *Service) Words(filter WordFilter) WordPage {
	if filter.Page < 1 {
		filter.Page = 1
	}
	const size = 12
	query := strings.ToLower(strings.TrimSpace(filter.Query))
	matched := make([]Word, 0)
	for _, item := range wordsByLevel(filter.Level) {
		if item.Status == "draft" || item.Status == "archived" {
			continue
		}
		if query != "" && !strings.Contains(strings.ToLower(item.Word+" "+item.Meaning+" "+item.Example+" "+item.ExampleTranslation), query) {
			continue
		}
		if filter.Topic != "" && item.Topic != filter.Topic {
			continue
		}
		if filter.Grade != "" && item.Grade != filter.Grade {
			continue
		}
		if filter.Unit != "" && item.Unit != filter.Unit {
			continue
		}
		if filter.Letter != "" && !strings.EqualFold(item.Letter, filter.Letter) {
			continue
		}
		if filter.PartOfSpeech != "" && !matchesPartOfSpeech(item.Pos, filter.PartOfSpeech) {
			continue
		}
		matched = append(matched, item)
	}
	if filter.Sort == "word-desc" {
		sort.SliceStable(matched, func(i, j int) bool { return strings.ToLower(matched[i].Word) > strings.ToLower(matched[j].Word) })
	} else if filter.Sort == "word-asc" {
		sort.SliceStable(matched, func(i, j int) bool { return strings.ToLower(matched[i].Word) < strings.ToLower(matched[j].Word) })
	}
	start := (filter.Page - 1) * size
	if start > len(matched) {
		start = len(matched)
	}
	end := start + size
	if end > len(matched) {
		end = len(matched)
	}
	return WordPage{Items: matched[start:end], Total: len(matched), Page: filter.Page, Size: size}
}

func (s *Service) WordFacets(level string) WordFacets {
	topics, grades, units := map[string]bool{}, map[string]bool{}, map[string]bool{}
	letters, parts := map[string]int{}, map[string]int{}
	for _, item := range wordsByLevel(level) {
		if !publicContentStatus(item.Status) {
			continue
		}
		if item.Topic != "" {
			topics[item.Topic] = true
		}
		if item.Grade != "" {
			grades[item.Grade] = true
		}
		if item.Unit != "" {
			units[item.Unit] = true
		}
		if item.Letter != "" {
			letters[strings.ToUpper(item.Letter)]++
		}
		for _, part := range wordPartsOfSpeech(item.Pos) {
			parts[part]++
		}
	}
	return WordFacets{Topics: sortedKeys(topics), Grades: sortedKeys(grades), Units: sortedKeys(units), Letters: categoryCounts(letters, nil), PartsOfSpeech: categoryCounts(parts, map[string]string{"noun": "名词", "verb": "动词", "adjective": "形容词", "adverb": "副词", "pronoun": "代词", "preposition": "介词", "conjunction": "连词", "phrase": "短语", "other": "其他"})}
}

func wordPartsOfSpeech(pos string) []string {
	value := strings.ToLower(strings.TrimSpace(pos))
	result := []string{}
	checks := []struct {
		key     string
		markers []string
	}{{"noun", []string{"n.", " n", "n &", "n&"}}, {"verb", []string{"v.", " v", "v &", "v&"}}, {"adjective", []string{"adj", "a."}}, {"adverb", []string{"adv"}}, {"pronoun", []string{"pron"}}, {"preposition", []string{"prep"}}, {"conjunction", []string{"conj"}}, {"phrase", []string{"phr"}}}
	for _, check := range checks {
		for _, marker := range check.markers {
			if strings.Contains(" "+value, marker) {
				result = append(result, check.key)
				break
			}
		}
	}
	if len(result) == 0 {
		result = append(result, "other")
	}
	return result
}

func matchesPartOfSpeech(pos, target string) bool {
	for _, part := range wordPartsOfSpeech(pos) {
		if part == target {
			return true
		}
	}
	return false
}

func categoryCounts(values map[string]int, labels map[string]string) []CategoryCount {
	keys := make([]string, 0, len(values))
	for key := range values {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	result := make([]CategoryCount, 0, len(keys))
	for _, key := range keys {
		label := key
		if labels[key] != "" {
			label = labels[key]
		}
		result = append(result, CategoryCount{Value: key, Label: label, Count: values[key]})
	}
	return result
}

func sortedKeys(values map[string]bool) []string {
	result := make([]string, 0, len(values))
	for value := range values {
		result = append(result, value)
	}
	sort.Strings(result)
	return result
}

func (s *Service) Word(level, id string) (Word, bool) {
	item, ok := findWord(level, id)
	return item, ok && publicContentStatus(item.Status)
}

func (s *Service) Quiz(level, requested, quizType string) (Quiz, error) {
	all := make([]Word, 0)
	for _, item := range wordsByLevel(level) {
		if publicContentStatus(item.Status) {
			all = append(all, item)
		}
	}
	var base Word
	if requested = normalizeID(requested); requested != "" {
		var ok bool
		base, ok = findWord(level, requested)
		if !ok || !publicContentStatus(base.Status) {
			return Quiz{}, fmt.Errorf("word not found")
		}
	}
	if len(all) < 4 {
		return Quiz{}, fmt.Errorf("not enough words")
	}
	if requested == "" {
		base = all[rand.Intn(len(all))]
	}
	if quizType != "zh-en" && quizType != "listen" && quizType != "spelling" && quizType != "cloze" {
		quizType = "en-zh"
	}
	if quizType == "cloze" && requested == "" {
		eligible := make([]Word, 0)
		for _, item := range all {
			if item.Example != "" && containsWord(item.Example, item.Word) {
				eligible = append(eligible, item)
			}
		}
		if len(eligible) < 4 {
			return Quiz{}, fmt.Errorf("not enough words with examples")
		}
		all = eligible
		base = all[rand.Intn(len(all))]
	}
	answer := base.Meaning
	prompt := base.Word
	if quizType == "zh-en" || quizType == "listen" || quizType == "spelling" || quizType == "cloze" {
		answer, prompt = base.Word, base.Meaning
	}
	if quizType == "listen" {
		prompt = "听发音，选择正确单词"
	}
	if quizType == "spelling" {
		return Quiz{Word: base, Type: quizType, Prompt: base.Meaning, Answer: base.Word, Options: []string{}}, nil
	}
	if quizType == "cloze" {
		prompt = replaceWord(base.Example, base.Word, "____")
	}
	options := []string{answer}
	for len(options) < 4 {
		candidateWord := all[rand.Intn(len(all))]
		candidate := candidateWord.Meaning
		if quizType == "zh-en" || quizType == "listen" || quizType == "cloze" {
			candidate = candidateWord.Word
		}
		if candidate != "" && !contains(options, candidate) {
			options = append(options, candidate)
		}
	}
	rand.Shuffle(len(options), func(i, j int) { options[i], options[j] = options[j], options[i] })
	return Quiz{Word: base, Options: options, Type: quizType, Prompt: prompt, Answer: answer}, nil
}

func containsWord(sentence, word string) bool {
	return strings.Contains(strings.ToLower(sentence), strings.ToLower(word))
}

func replaceWord(sentence, word, replacement string) string {
	index := strings.Index(strings.ToLower(sentence), strings.ToLower(word))
	if index < 0 {
		return sentence
	}
	return sentence[:index] + replacement + sentence[index+len(word):]
}

func (s *Service) AnswerQuiz(answer QuizAnswer, now time.Time) (QuizFeedback, error) {
	word, ok := findWord(answer.Level, answer.WordID)
	if !ok || !publicContentStatus(word.Status) {
		return QuizFeedback{}, fmt.Errorf("word not found")
	}
	expected := word.Meaning
	if answer.Type == "zh-en" || answer.Type == "listen" || answer.Type == "spelling" || answer.Type == "cloze" {
		expected = word.Word
	}
	correct := strings.EqualFold(strings.TrimSpace(answer.Answer), strings.TrimSpace(expected))
	result := QuizResult{}
	progress := Progress{Seen: 1, QuizResults: map[string]QuizResult{answer.Type: result}}
	if correct {
		progress.Correct, progress.Mastered, result.Correct = 1, true, 1
	} else {
		progress.Wrong, result.Wrong = 1, 1
	}
	progress.QuizResults[answer.Type] = result
	saved, err := s.SaveProgress(answer.Level, answer.WordID, progress, now)
	if err != nil {
		return QuizFeedback{}, err
	}
	message := "回答正确"
	if !correct {
		message = "正确答案是：" + expected
	}
	return QuizFeedback{Correct: correct, Answer: expected, Message: message, Progress: saved}, nil
}

func contains(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}

func (s *Service) SaveProgress(level, id string, incoming Progress, now time.Time) (Progress, error) {
	key := progressKey(level, id)
	word, ok := wordIndex[key]
	if !ok || !publicContentStatus(word.Status) {
		return Progress{}, fmt.Errorf("word not found")
	}
	return UpdateProgress(key, incoming, now, s.userID)
}

func UpdateProgress(id string, incoming Progress, now time.Time, userIDs ...string) (Progress, error) {
	storageID := scopedKey(firstString(userIDs), id)
	var saved Progress
	err := db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(progressBucket))
		if raw := bucket.Get([]byte(storageID)); raw != nil {
			if err := json.Unmarshal(raw, &saved); err != nil {
				return err
			}
		}
		saved.Seen += incoming.Seen
		saved.Correct += incoming.Correct
		saved.Wrong += incoming.Wrong
		if incoming.QuizResults != nil {
			if saved.QuizResults == nil {
				saved.QuizResults = map[string]QuizResult{}
			}
			for quizType, result := range incoming.QuizResults {
				current := saved.QuizResults[quizType]
				current.Correct += result.Correct
				current.Wrong += result.Wrong
				saved.QuizResults[quizType] = current
			}
		}
		if incoming.Review {
			saved.ReviewCount++
			saved.LastReviewed = now.Format(time.RFC3339)
			if incoming.Wrong > 0 {
				saved.ReviewStreak = 0
			} else if incoming.Correct > 0 {
				saved.ReviewStreak++
			}
		}
		if incoming.Wrong > 0 {
			saved.Resolved = false
			saved.Mastered = false
		}
		if incoming.SetMastered != nil {
			saved.Mastered = *incoming.SetMastered
			saved.Resolved = *incoming.SetMastered
		}
		if incoming.Mastered {
			saved.Mastered = true
			saved.Resolved = true
		}
		saved.LastSeen = now.Format(time.RFC3339)
		nextReview := CalculateNextReview(saved, incoming, now)
		saved.IntervalDays = intervalDays(now, nextReview)
		saved.NextReview = nextReview.Format(time.RFC3339)
		raw, err := json.Marshal(saved)
		if err != nil {
			return err
		}
		if err := bucket.Put([]byte(storageID), raw); err != nil {
			return err
		}
		if err := recordProgressLearningEvent(tx, firstString(userIDs), id, incoming, now); err != nil {
			return err
		}
		planTaskType := ""
		switch {
		case incoming.Review:
			planTaskType = "review"
		case len(incoming.QuizResults) > 0:
			planTaskType = "quiz"
		case incoming.Seen > 0 || incoming.SetMastered != nil || incoming.Mastered:
			planTaskType = "learn"
		}
		level := strings.SplitN(id, ":", 2)[0]
		return completeMatchingPlanTaskTx(tx, firstString(userIDs), level, planTaskType, now)
	})
	return saved, err
}

func CalculateNextReview(saved, incoming Progress, now time.Time) time.Time {
	switch {
	case incoming.Wrong > 0:
		return now.Add(24 * time.Hour)
	case incoming.Review && incoming.Correct > 0:
		return now.Add(time.Duration(reviewInterval(saved.ReviewStreak)) * 24 * time.Hour)
	case incoming.Mastered:
		return now.Add(7 * 24 * time.Hour)
	case incoming.Correct > 0 && saved.Correct >= 3:
		return now.Add(5 * 24 * time.Hour)
	case incoming.Correct > 0:
		return now.Add(3 * 24 * time.Hour)
	default:
		return now.Add(24 * time.Hour)
	}
}

func reviewInterval(streak int) int {
	intervals := [...]int{1, 3, 7, 14, 30, 60}
	if streak < 1 {
		return intervals[0]
	}
	if streak > len(intervals) {
		return intervals[len(intervals)-1]
	}
	return intervals[streak-1]
}

func intervalDays(now, next time.Time) int {
	days := int(next.Sub(now).Hours() / 24)
	if days < 1 {
		return 1
	}
	return days
}

func (s *Service) Progress() (map[string]Progress, error) { return readProgress(s.userID) }

func (s *Service) Stats() (Stats, error) {
	progress, err := readProgress(s.userID)
	if err != nil {
		return Stats{}, err
	}
	seen, mastered, correct, wrong, mistakes := summarize(progress)
	accuracy := 0
	if correct+wrong > 0 {
		accuracy = correct * 100 / (correct + wrong)
	}
	return Stats{Total: len(datasets["primary"]) + len(datasets["middle"]), Seen: seen, Mastered: mastered, Accuracy: accuracy, Mistakes: mistakes}, nil
}

func summarize(items map[string]Progress) (seen, mastered, correct, wrong, mistakes int) {
	for _, item := range items {
		seen++
		if item.Mastered {
			mastered++
		}
		correct += item.Correct
		wrong += item.Wrong
		if item.Wrong > 0 && !item.Resolved {
			mistakes++
		}
	}
	return
}

func (s *Service) Mistakes() ([]LearningItem, error) {
	progress, err := readProgress(s.userID)
	if err != nil {
		return nil, err
	}
	items := make([]LearningItem, 0)
	for id, p := range progress {
		if p.Wrong == 0 || p.Resolved {
			continue
		}
		if item, ok := wordIndex[id]; ok {
			items = append(items, LearningItem{Word: item, Progress: p})
		}
	}
	sort.Slice(items, func(i, j int) bool {
		if items[i].Progress.Wrong == items[j].Progress.Wrong {
			return items[i].Progress.LastSeen > items[j].Progress.LastSeen
		}
		return items[i].Progress.Wrong > items[j].Progress.Wrong
	})
	return items, nil
}

func (s *Service) ResolveMistake(level, id string, now time.Time) (Progress, error) {
	key := progressKey(level, id)
	if _, ok := wordIndex[key]; !ok {
		return Progress{}, fmt.Errorf("word not found")
	}
	var saved Progress
	err := db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(progressBucket))
		storageKey := scopedKey(s.userID, key)
		raw := bucket.Get([]byte(storageKey))
		if raw == nil {
			return fmt.Errorf("progress not found")
		}
		if err := json.Unmarshal(raw, &saved); err != nil {
			return err
		}
		saved.Resolved = true
		saved.Mastered = true
		saved.NextReview = now.Add(7 * 24 * time.Hour).Format(time.RFC3339)
		encoded, err := json.Marshal(saved)
		if err != nil {
			return err
		}
		if err := bucket.Put([]byte(storageKey), encoded); err != nil {
			return err
		}
		if err := recordLearningEventTx(tx, LearningEvent{UserID: s.userID, Type: "mistake_resolved", ContentType: "word", ContentID: normalizeID(id), Level: normalizeLevel(level), Source: "mistakes", CreatedAt: now.Format(time.RFC3339Nano)}); err != nil {
			return err
		}
		return completeMatchingPlanTaskTx(tx, s.userID, level, "mistakes", now)
	})
	return saved, err
}

func (s *Service) TodayReview(level string, now time.Time) (ReviewQueue, error) {
	progress, err := readProgress(s.userID)
	if err != nil {
		return ReviewQueue{}, err
	}
	items := make([]LearningItem, 0)
	completed := 0
	today := now.Format("2006-01-02")
	for id, p := range progress {
		if level != "" && !strings.HasPrefix(id, normalizeLevel(level)+":") {
			continue
		}
		if strings.HasPrefix(p.LastReviewed, today) {
			completed++
		}
		due, err := time.Parse(time.RFC3339, p.NextReview)
		if err != nil || due.After(now) {
			continue
		}
		if item, ok := wordIndex[id]; ok {
			items = append(items, LearningItem{Word: item, Progress: p})
		}
	}
	sort.Slice(items, func(i, j int) bool { return items[i].Progress.NextReview < items[j].Progress.NextReview })
	goal, err := readDailyReviewGoal(s.userID)
	if err != nil {
		return ReviewQueue{}, err
	}
	return ReviewQueue{Items: items, Total: len(items), Completed: completed, Goal: goal}, nil
}

func (s *Service) Settings() (LearningSettings, error) {
	goal, err := readDailyReviewGoal(s.userID)
	return LearningSettings{DailyReviewGoal: goal}, err
}

func (s *Service) SaveSettings(settings LearningSettings) (LearningSettings, error) {
	if settings.DailyReviewGoal < 1 || settings.DailyReviewGoal > 100 {
		return LearningSettings{}, fmt.Errorf("daily review goal must be between 1 and 100")
	}
	if err := saveDailyReviewGoal(settings.DailyReviewGoal, s.userID); err != nil {
		return LearningSettings{}, err
	}
	return settings, nil
}

func (s *Service) Dashboard(now time.Time) (Dashboard, error) {
	progress, err := readProgress(s.userID)
	if err != nil {
		return Dashboard{}, err
	}
	goal, err := readDailyReviewGoal(s.userID)
	if err != nil {
		return Dashboard{}, err
	}
	return buildDashboard(progress, now, goal), nil
}

func buildDashboard(progress map[string]Progress, now time.Time, goal int) Dashboard {
	report := Dashboard{TodayGoal: goal, Recent: []LearningItem{}, Weakest: []LearningItem{}}
	today := now.Format("2006-01-02")
	all := make([]LearningItem, 0, len(progress))
	for id, p := range progress {
		item, ok := wordIndex[id]
		if !ok {
			continue
		}
		learning := LearningItem{Word: item, Progress: p}
		all = append(all, learning)
		if strings.HasPrefix(p.LastSeen, today) {
			report.TodayLearned++
			report.TodayPractices += p.Correct + p.Wrong
		}
		if p.Wrong > 0 && !p.Resolved {
			report.Mistakes++
		}
		if due, err := time.Parse(time.RFC3339, p.NextReview); err == nil && !due.After(now) {
			report.ReviewDue++
		}
	}
	sort.Slice(all, func(i, j int) bool { return all[i].Progress.LastSeen > all[j].Progress.LastSeen })
	report.Recent = takeItems(all, 6)
	weak := append([]LearningItem(nil), all...)
	sort.Slice(weak, func(i, j int) bool {
		left := weak[i].Progress.Wrong - weak[i].Progress.Correct
		right := weak[j].Progress.Wrong - weak[j].Progress.Correct
		if left == right {
			return weak[i].Progress.Wrong > weak[j].Progress.Wrong
		}
		return left > right
	})
	filtered := weak[:0]
	for _, item := range weak {
		if item.Progress.Wrong > 0 {
			filtered = append(filtered, item)
		}
	}
	report.Weakest = takeItems(filtered, 6)
	report.StreakDays = learningStreak(progress, now)
	return report
}

func learningStreak(progress map[string]Progress, now time.Time) int {
	days := map[string]bool{}
	for _, item := range progress {
		if len(item.LastSeen) >= 10 {
			days[item.LastSeen[:10]] = true
		}
	}
	streak := 0
	for day := now; days[day.Format("2006-01-02")]; day = day.AddDate(0, 0, -1) {
		streak++
	}
	return streak
}

func takeItems(items []LearningItem, limit int) []LearningItem {
	if len(items) < limit {
		limit = len(items)
	}
	return items[:limit]
}
