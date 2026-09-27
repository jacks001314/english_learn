package learning

import (
	"math/rand"
	"sort"
	"strings"
	"unicode/utf8"
)

// Word list sorting keeps every learner-facing ordering in one place so the
// API and the study view stay in sync.
//
// Supported keys:
//   - "" / "word-asc"  A → Z (default)
//   - "word-desc"      Z → A
//   - "unit"           grade → unit → word
//   - "grade"          grade → word
//   - "topic"          topic → word
//   - "length-asc"     short words first
//   - "length-desc"    long words first
//   - "recent"         recently updated content first
//   - "smart"          unlearned / unmastered words first
//   - "random"         shuffled with the caller-provided seed so paging is stable
const (
	sortWordAsc    = "word-asc"
	sortWordDesc   = "word-desc"
	sortUnit       = "unit"
	sortGrade      = "grade"
	sortTopic      = "topic"
	sortLengthAsc  = "length-asc"
	sortLengthDesc = "length-desc"
	sortRecent     = "recent"
	sortSmart      = "smart"
	sortRandom     = "random"
)

// gradeRanks orders the Chinese grade names along the school ladder instead of
// relying on raw string comparison (which would place 七 after 三).
var gradeRanks = map[string]int{
	"一年级": 1, "二年级": 2, "三年级": 3, "四年级": 4, "五年级": 5, "六年级": 6,
	"七年级": 7, "八年级": 8, "九年级": 9,
}

// unitRanks keeps the curated vocabulary buckets in a meaningful order.
var unitRanks = map[string]int{
	"核心词汇": 1, "扩展词汇": 2, "词形变化": 3, "词汇复习": 4, "词条清洗": 5, "自动补充": 6,
}

const (
	unrankedGrade = 900
	unrankedUnit  = 900
	missingLast   = 999
)

func sortWords(items []Word, sortKey string, seed int, progress map[string]Progress) {
	if len(items) < 2 {
		return
	}
	switch sortKey {
	case sortWordDesc:
		sort.SliceStable(items, func(i, j int) bool { return wordKey(items[i]) > wordKey(items[j]) })
	case sortLengthAsc:
		sort.SliceStable(items, func(i, j int) bool {
			left, right := wordLength(items[i]), wordLength(items[j])
			if left != right {
				return left < right
			}
			return wordKey(items[i]) < wordKey(items[j])
		})
	case sortLengthDesc:
		sort.SliceStable(items, func(i, j int) bool {
			left, right := wordLength(items[i]), wordLength(items[j])
			if left != right {
				return left > right
			}
			return wordKey(items[i]) < wordKey(items[j])
		})
	case sortUnit:
		sort.SliceStable(items, func(i, j int) bool { return unitLess(items[i], items[j]) })
	case sortGrade:
		sort.SliceStable(items, func(i, j int) bool { return gradeLess(items[i], items[j]) })
	case sortTopic:
		sort.SliceStable(items, func(i, j int) bool { return topicLess(items[i], items[j]) })
	case sortRecent:
		sort.SliceStable(items, func(i, j int) bool {
			if items[i].UpdatedAt != items[j].UpdatedAt {
				return items[i].UpdatedAt > items[j].UpdatedAt
			}
			return wordKey(items[i]) < wordKey(items[j])
		})
	case sortSmart:
		sort.SliceStable(items, func(i, j int) bool { return smartLess(items[i], items[j], progress) })
	case sortRandom:
		rng := rand.New(rand.NewSource(int64(seed)))
		rng.Shuffle(len(items), func(i, j int) { items[i], items[j] = items[j], items[i] })
	default: // sortWordAsc
		sort.SliceStable(items, func(i, j int) bool { return wordKey(items[i]) < wordKey(items[j]) })
	}
}

func wordKey(item Word) string { return strings.ToLower(strings.TrimSpace(item.Word)) }

func wordLength(item Word) int { return utf8.RuneCountInString(strings.TrimSpace(item.Word)) }

func gradeRank(grade string) int {
	value := strings.TrimSpace(grade)
	if value == "" {
		return missingLast
	}
	if rank, ok := gradeRanks[value]; ok {
		return rank
	}
	return unrankedGrade
}

func unitRank(unit string) int {
	value := strings.TrimSpace(unit)
	if value == "" {
		return missingLast
	}
	if rank, ok := unitRanks[value]; ok {
		return rank
	}
	return unrankedUnit
}

func unitLess(a, b Word) bool {
	if left, right := gradeRank(a.Grade), gradeRank(b.Grade); left != right {
		return left < right
	}
	if left, right := unitRank(a.Unit), unitRank(b.Unit); left != right {
		return left < right
	}
	return wordKey(a) < wordKey(b)
}

func gradeLess(a, b Word) bool {
	if left, right := gradeRank(a.Grade), gradeRank(b.Grade); left != right {
		return left < right
	}
	return wordKey(a) < wordKey(b)
}

func topicLess(a, b Word) bool {
	if left, right := topicKey(a.Topic), topicKey(b.Topic); left != right {
		return left < right
	}
	return wordKey(a) < wordKey(b)
}

// topicKey parks words without a topic at the end of the list.
func topicKey(topic string) string {
	value := strings.TrimSpace(topic)
	if value == "" {
		return "\uffff"
	}
	return value
}

// smartLess builds a simple recommendation order: words the learner has never
// touched come first, then unmastered words with the most mistakes.
func smartLess(a, b Word, progress map[string]Progress) bool {
	leftProgress, leftSeen := progress[progressKey(a.Level, a.ID)]
	rightProgress, rightSeen := progress[progressKey(b.Level, b.ID)]
	if leftSeen != rightSeen {
		return !leftSeen
	}
	if leftSeen {
		if leftProgress.Mastered != rightProgress.Mastered {
			return !leftProgress.Mastered
		}
		if leftProgress.Wrong != rightProgress.Wrong {
			return leftProgress.Wrong > rightProgress.Wrong
		}
	}
	return wordKey(a) < wordKey(b)
}
