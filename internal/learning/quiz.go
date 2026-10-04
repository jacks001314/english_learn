package learning

import (
	"fmt"
	"math/rand"
	"strings"
	"time"
)

// This file holds the vocabulary practice engine behind /api/quiz and
// /api/meaning-quiz. Question-pool selection (school stage, grade, topic,
// unit, first letter and part of speech) lives here so both the classic quiz
// page and the 词义练习 pages share one implementation.

// Practice scopes. A quiz always targets one school stage, and the meaning
// pages additionally accept "all" so a learner can drill the whole library.
const quizScopeAll = "all"

// 练习来源：默认（空）只按单词元数据筛选，其余取值再按学习记录收窄。
const (
	quizSourceAll        = ""
	quizSourceMistakes   = "mistakes"
	quizSourceUnmastered = "unmastered"
)

// normalizeQuizSource folds the spellings the pages may send onto the two
// supported sources; anything unrecognised means "no source filter".
func normalizeQuizSource(source string) string {
	switch strings.ToLower(strings.TrimSpace(source)) {
	case quizSourceMistakes, "mistake", "wrong":
		return quizSourceMistakes
	case quizSourceUnmastered, "unmastered-words", "unmastered_words":
		return quizSourceUnmastered
	default:
		return quizSourceAll
	}
}

// filterWordsBySource keeps only the words that match the learner's own record.
// progress is keyed by progressKey(level, word); a word the learner has never
// touched matches neither source.
func filterWordsBySource(items []Word, source string, progress map[string]Progress) []Word {
	source = normalizeQuizSource(source)
	if source == quizSourceAll {
		return items
	}
	matched := make([]Word, 0, len(items))
	for _, item := range items {
		record, seen := progress[progressKey(item.Level, item.ID)]
		if !seen {
			continue
		}
		switch source {
		case quizSourceMistakes:
			if record.Wrong <= 0 || record.Resolved {
				continue
			}
		case quizSourceUnmastered:
			// “学过但没掌握”：只要留下过学习记录且还没掌握就算。
			// 一个词没有记录时连 seen=false，上一步已经排除了。
			if record.Mastered {
				continue
			}
		default:
			continue
		}
		matched = append(matched, item)
	}
	return matched
}

// sourceEmptyError explains an empty pool instead of showing every source the
// same "not enough words". All variants keep the "not enough words" prefix so
// the practice page still turns them into its "放宽筛选条件" hint (HTTP 422).
func sourceEmptyError(source string) error {
	switch normalizeQuizSource(source) {
	case quizSourceMistakes:
		return fmt.Errorf("not enough words：错题本里暂时没有可练的单词")
	case quizSourceUnmastered:
		return fmt.Errorf("not enough words：还没有学过但未掌握的词")
	}
	return fmt.Errorf("not enough words")
}

// applySource narrows an already metadata-filtered pool by learning record. The
// record is only read when a source is actually requested, so the classic
// practice keeps its previous behaviour and its tests.
func (s *Service) applySource(source string, items []Word) []Word {
	if normalizeQuizSource(source) == quizSourceAll {
		return items
	}
	return filterWordsBySource(items, source, s.learnedProgress())
}

// Question modes. "en-zh" and "listen-zh" ask for the Chinese meaning, the
// other modes ask for the English word.
const (
	quizTypeEnZh     = "en-zh"
	quizTypeZhEn     = "zh-en"
	quizTypeListen   = "listen"
	quizTypeListenZh = "listen-zh"
	quizTypeSpelling = "spelling"
	quizTypeCloze    = "cloze"
)

// Paging of the 词义练习 pages. Unlike the classic quiz (one random question at
// a time) the meaning pages walk through every word that matches the filter,
// so the page size stays small enough for one sitting.
const (
	quizPageSizeDefault = 12
	quizPageSizeMax     = 60
)

// QuizFilter describes the pool a question is drawn from. Level accepts
// "primary", "middle" or "all"; the remaining fields narrow the pool to a
// single grade, topic, unit, first letter or part of speech.
type QuizFilter struct {
	Level        string
	WordID       string
	Type         string
	Topic        string
	Grade        string
	Unit         string
	Letter       string
	PartOfSpeech string
	// Source narrows the pool to the words this learner actually needs to work
	// on, using their own record instead of word metadata: "mistakes" = 错题，
	// "unmastered" = 学过但未掌握。空值（或 "all"）保持原来的纯元数据筛选。
	Source string
}

// QuizSet is one page of 词义练习 questions. Every word matching the filter is
// part of the set exactly once, ordered by QuizSet.Sort, so a learner can work
// through a whole grade, topic or word class instead of a random sample.
type QuizSet struct {
	Level string `json:"level"`
	Type  string `json:"type"`
	Sort  string `json:"sort"`
	Page  int    `json:"page"`
	Size  int    `json:"size"`
	Total int    `json:"total"`
	Pages int    `json:"pages"`
	Items []Quiz `json:"items"`
}

// Quiz keeps the single-stage signature used by the classic quiz page, which
// only picks a stage and a mode.
func (s *Service) Quiz(level, requested, quizType string) (Quiz, error) {
	return s.FilteredQuiz(QuizFilter{Level: level, WordID: requested, Type: quizType})
}

// FilteredQuiz builds one multiple-choice question from the filtered pool.
func (s *Service) FilteredQuiz(filter QuizFilter) (Quiz, error) {
	quizType := normalizeQuizType(filter.Type)
	// An explicitly requested word is resolved first so a caller always gets
	// "word not found" for a word that is missing or still a draft, even when
	// the surrounding pool would have been too small to practise on.
	var base Word
	hasBase := false
	if requested := normalizeID(filter.WordID); requested != "" {
		item, ok := s.store.findWordInScope(filter.Level, requested)
		if !ok || !publicContentStatus(item.Status) {
			return Quiz{}, fmt.Errorf("word not found")
		}
		base, hasBase = item, true
	}

	scoped := make([]Word, 0)
	for _, item := range s.store.wordsForScope(filter.Level) {
		if publicContentStatus(item.Status) {
			scoped = append(scoped, item)
		}
	}
	if len(scoped) < 4 {
		return Quiz{}, fmt.Errorf("not enough words")
	}
	pool := make([]Word, 0, len(scoped))
	for _, item := range scoped {
		if matchWordMetadata(item, filter) {
			pool = append(pool, item)
		}
	}
	pool = s.applySource(filter.Source, pool)
	// Distractors prefer the filtered pool so a 词性 or 主题 drill stays inside
	// the same word class, but a narrow filter must never break the practice:
	// fall back to the whole scope when fewer than four words match.
	distractors := pool
	if len(distractors) < 4 {
		distractors = scoped
	}

	if quizType == quizTypeCloze {
		if hasBase && !hasUsableExample(base) {
			return Quiz{}, fmt.Errorf("word has no example sentence")
		}
		eligible := clozeEligible(distractors)
		if len(eligible) < 4 {
			eligible = clozeEligible(scoped)
		}
		if len(eligible) < 4 {
			return Quiz{}, fmt.Errorf("not enough words with examples")
		}
		distractors = eligible
	}
	if !hasBase {
		candidates := pool
		if quizType == quizTypeCloze {
			candidates = distractors
		}
		if len(candidates) == 0 {
			return Quiz{}, sourceEmptyError(filter.Source)
		}
		base = candidates[rand.Intn(len(candidates))]
	}

	return buildQuizQuestion(base, quizType, distractors), nil
}

// FilteredQuizSet builds one page of questions covering the words that match
// the filter. The order is stable (same filter + sort + seed always yields the
// same sequence) so pages never overlap and re-opening a page shows the same
// questions. The last page may hold fewer than size items.
func (s *Service) FilteredQuizSet(filter QuizFilter, page, size int, sortKey string, seed int) (QuizSet, error) {
	quizType := normalizeQuizType(filter.Type)
	if size <= 0 {
		size = quizPageSizeDefault
	}
	if size > quizPageSizeMax {
		size = quizPageSizeMax
	}

	scoped := make([]Word, 0)
	for _, item := range s.store.wordsForScope(filter.Level) {
		if publicContentStatus(item.Status) {
			scoped = append(scoped, item)
		}
	}
	if len(scoped) < 4 {
		return QuizSet{}, fmt.Errorf("not enough words")
	}
	pool := make([]Word, 0, len(scoped))
	for _, item := range scoped {
		if matchWordMetadata(item, filter) {
			pool = append(pool, item)
		}
	}
	pool = s.applySource(filter.Source, pool)
	distractors := pool
	if len(distractors) < 4 {
		distractors = scoped
	}
	if quizType == quizTypeCloze {
		pool = clozeEligible(pool)
		eligible := clozeEligible(distractors)
		if len(eligible) < 4 {
			eligible = clozeEligible(scoped)
		}
		if len(eligible) < 4 {
			return QuizSet{}, fmt.Errorf("not enough words with examples")
		}
		distractors = eligible
	}
	if len(pool) == 0 {
		// A filter combination without a single word: the page turns this into
		// a "放宽筛选条件" hint instead of an error screen.
		return QuizSet{}, sourceEmptyError(filter.Source)
	}

	var progress map[string]Progress
	if sortKey == sortSmart {
		progress = s.learnedProgress()
	}
	if sortKey == "" {
		sortKey = sortWordAsc
	}
	sortWords(pool, sortKey, seed, progress)

	total := len(pool)
	pages := (total + size - 1) / size
	if page < 1 {
		page = 1
	}
	if page > pages {
		page = pages
	}
	start := (page - 1) * size
	end := start + size
	if end > total {
		end = total
	}
	items := make([]Quiz, 0, end-start)
	for _, base := range pool[start:end] {
		items = append(items, buildQuizQuestion(base, quizType, distractors))
	}
	level := filter.Level
	if level == "" {
		level = "primary"
	}
	return QuizSet{
		Level: level,
		Type:  quizType,
		Sort:  sortKey,
		Page:  page,
		Size:  size,
		Total: total,
		Pages: pages,
		Items: items,
	}, nil
}

// buildQuizQuestion renders one multiple-choice question for a fixed word.
// Distractors are drawn from the given pool, so callers decide whether wrong
// options stay inside the filter or fall back to the whole school stage.
func buildQuizQuestion(base Word, quizType string, distractors []Word) Quiz {
	answer, prompt := base.Meaning, base.Word
	if answersWithWord(quizType) {
		answer, prompt = base.Word, base.Meaning
	}
	switch quizType {
	case quizTypeListen:
		prompt = "听发音，选择正确单词"
	case quizTypeListenZh:
		prompt = "听发音，选择汉语意思"
	case quizTypeSpelling:
		return Quiz{Word: base, Type: quizType, Prompt: base.Meaning, Answer: base.Word, Options: []string{}}
	case quizTypeCloze:
		prompt = replaceWord(base.Example, base.Word, "____")
	}

	options := []string{answer}
	// The attempt guard keeps a degenerate pool (fewer than four distinct
	// meanings or spellings) from looping forever; the caller renders whatever
	// number of options it receives.
	for attempts := 0; len(options) < 4 && attempts < 200; attempts++ {
		candidate := distractors[rand.Intn(len(distractors))]
		value := candidate.Meaning
		if answersWithWord(quizType) {
			value = candidate.Word
		}
		if value != "" && !containsFold(options, value) {
			options = append(options, value)
		}
	}
	rand.Shuffle(len(options), func(i, j int) { options[i], options[j] = options[j], options[i] })
	return Quiz{Word: base, Options: options, Type: quizType, Prompt: prompt, Answer: answer}
}

// AnswerQuiz grades one answer and stores it as learning progress. The
// expected answer is the Chinese meaning for "en-zh"/"listen-zh" and the
// English word for every other mode.
func (s *Service) AnswerQuiz(answer QuizAnswer, now time.Time) (QuizFeedback, error) {
	word, ok := s.store.findWord(answer.Level, answer.WordID)
	if !ok || !publicContentStatus(word.Status) {
		return QuizFeedback{}, fmt.Errorf("word not found")
	}
	expected := word.Meaning
	if answersWithWord(answer.Type) {
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

// answersWithWord reports whether a mode asks the learner to pick the English
// word; every other mode asks for the Chinese meaning.
func answersWithWord(quizType string) bool {
	switch quizType {
	case quizTypeZhEn, quizTypeListen, quizTypeSpelling, quizTypeCloze:
		return true
	}
	return false
}

func normalizeQuizType(quizType string) string {
	switch quizType {
	case quizTypeZhEn, quizTypeListen, quizTypeListenZh, quizTypeSpelling, quizTypeCloze:
		return quizType
	}
	return quizTypeEnZh
}

// isQuizScopeAll reports whether the practice covers every school stage.
func isQuizScopeAll(level string) bool {
	switch strings.ToLower(strings.TrimSpace(level)) {
	case quizScopeAll, "both":
		return true
	}
	return false
}

// wordsForScope returns the words of one school stage, or of the whole library
// when the scope is "all". The facets endpoint reuses it so the practice
// filters of 全部范围 stay in sync with the question pool.
func (s *Store) wordsForScope(level string) []Word {
	if !isQuizScopeAll(level) {
		return s.datasets[normalizeLevel(level)]
	}
	merged := make([]Word, 0, len(s.datasets["primary"])+len(s.datasets["middle"]))
	merged = append(merged, s.datasets["primary"]...)
	return append(merged, s.datasets["middle"]...)
}

// findWordInScope looks a word up across every stage of the practice scope.
func (s *Store) findWordInScope(level, id string) (Word, bool) {
	if !isQuizScopeAll(level) {
		return s.findWord(level, id)
	}
	for _, candidate := range []string{"primary", "middle"} {
		if item, ok := s.findWord(candidate, id); ok {
			return item, true
		}
	}
	return Word{}, false
}

// matchWordMetadata applies the optional pool filters of a quiz request.
func matchWordMetadata(item Word, filter QuizFilter) bool {
	if filter.Topic != "" && item.Topic != filter.Topic {
		return false
	}
	if filter.Grade != "" && item.Grade != filter.Grade {
		return false
	}
	if filter.Unit != "" && item.Unit != filter.Unit {
		return false
	}
	if filter.Letter != "" && !strings.EqualFold(item.Letter, filter.Letter) {
		return false
	}
	if filter.PartOfSpeech != "" && !matchesPartOfSpeech(item.Pos, item.Word, filter.PartOfSpeech) {
		return false
	}
	return true
}

func clozeEligible(items []Word) []Word {
	eligible := make([]Word, 0, len(items))
	for _, item := range items {
		if hasUsableExample(item) {
			eligible = append(eligible, item)
		}
	}
	return eligible
}

func hasUsableExample(item Word) bool {
	return item.Example != "" && containsWord(item.Example, item.Word)
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

// containsFold compares options case-insensitively so "Apple" and "apple" are
// never offered as two different answers.
func containsFold(values []string, target string) bool {
	for _, value := range values {
		if strings.EqualFold(strings.TrimSpace(value), strings.TrimSpace(target)) {
			return true
		}
	}
	return false
}
