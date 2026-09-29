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
		item, ok := findWordInScope(filter.Level, requested)
		if !ok || !publicContentStatus(item.Status) {
			return Quiz{}, fmt.Errorf("word not found")
		}
		base, hasBase = item, true
	}

	scoped := make([]Word, 0)
	for _, item := range wordsForScope(filter.Level) {
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
			return Quiz{}, fmt.Errorf("not enough words")
		}
		base = candidates[rand.Intn(len(candidates))]
	}

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
		return Quiz{Word: base, Type: quizType, Prompt: base.Meaning, Answer: base.Word, Options: []string{}}, nil
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
	return Quiz{Word: base, Options: options, Type: quizType, Prompt: prompt, Answer: answer}, nil
}

// AnswerQuiz grades one answer and stores it as learning progress. The
// expected answer is the Chinese meaning for "en-zh"/"listen-zh" and the
// English word for every other mode.
func (s *Service) AnswerQuiz(answer QuizAnswer, now time.Time) (QuizFeedback, error) {
	word, ok := findWord(answer.Level, answer.WordID)
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
func wordsForScope(level string) []Word {
	if !isQuizScopeAll(level) {
		return datasets[normalizeLevel(level)]
	}
	merged := make([]Word, 0, len(datasets["primary"])+len(datasets["middle"]))
	merged = append(merged, datasets["primary"]...)
	return append(merged, datasets["middle"]...)
}

// findWordInScope looks a word up across every stage of the practice scope.
func findWordInScope(level, id string) (Word, bool) {
	if !isQuizScopeAll(level) {
		return findWord(level, id)
	}
	for _, candidate := range []string{"primary", "middle"} {
		if item, ok := findWord(candidate, id); ok {
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
