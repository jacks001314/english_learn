package learning

import (
	"encoding/json"
	"path/filepath"
	"strings"
	"testing"

	bolt "go.etcd.io/bbolt"
)

// sourceWords 是一小组测试词：四个已练习过的词 + 一个从没碰过的词。
func sourceWords() []Word {
	return []Word{
		{ID: "apple", Word: "apple", Meaning: "苹果", Level: "primary", Letter: "a", Topic: "食物", Grade: "三年级"},
		{ID: "book", Word: "book", Meaning: "书", Level: "primary", Letter: "b", Topic: "学习用品", Grade: "三年级"},
		{ID: "run", Word: "run", Meaning: "跑", Level: "primary", Letter: "r", Topic: "运动", Grade: "四年级"},
		{ID: "jump", Word: "jump", Meaning: "跳跃", Level: "primary", Letter: "j", Topic: "运动", Grade: "四年级"},
		{ID: "zoo", Word: "zoo", Meaning: "动物园", Level: "primary", Letter: "z", Topic: "动物", Grade: "三年级"},
	}
}

func sourceIDs(items []Word) string {
	ids := make([]string, 0, len(items))
	for _, item := range items {
		ids = append(ids, item.ID)
	}
	return strings.Join(ids, ",")
}

// 来源筛选只认学习记录：错题=错且未订正，未掌握=学过但没掌握；
// 没学过的词两边都不算，已掌握/已订正的词也要排除。
func TestFilterWordsBySourceUsesLearnerRecord(t *testing.T) {
	words := sourceWords()
	progress := map[string]Progress{
		"primary:apple": {Seen: 3, Wrong: 2},                 // 错题，未订正
		"primary:book":  {Seen: 2, Wrong: 1, Resolved: true}, // 已订正
		"primary:run":   {Seen: 4, Correct: 4},               // 学过但未掌握
		"primary:jump":  {Seen: 5, Correct: 5, Mastered: true},
		// primary:zoo 完全没有记录
	}

	if got := sourceIDs(filterWordsBySource(words, "mistakes", progress)); got != "apple" {
		t.Fatalf("mistakes = %q, want apple", got)
	}
	if got := sourceIDs(filterWordsBySource(words, "unmastered", progress)); got != "apple,book,run" {
		t.Fatalf("unmastered = %q, want apple,book,run", got)
	}

	// 两个来源都不该把「没学过」或「已掌握」的词放进来。
	for _, source := range []string{"mistakes", "unmastered"} {
		got := filterWordsBySource(words, source, progress)
		if strings.Contains(sourceIDs(got), "zoo") || strings.Contains(sourceIDs(got), "jump") {
			t.Fatalf("%s leaked an untouched or mastered word: %v", source, sourceIDs(got))
		}
	}
}

// 空来源（或无法识别的取值）保持原样，老页面与老测试不受影响。
func TestFilterWordsBySourceDefaultsToNoFilter(t *testing.T) {
	words := sourceWords()
	progress := map[string]Progress{"primary:apple": {Wrong: 1}}
	all := sourceIDs(words)
	for _, source := range []string{"", "all", "whatever", "not-a-source"} {
		if got := sourceIDs(filterWordsBySource(words, source, progress)); got != all {
			t.Fatalf("source %q changed the pool: %s", source, got)
		}
	}
	// 别名要收敛到同一个来源。
	if got := sourceIDs(filterWordsBySource(words, "  MISTAKES ", progress)); got != "apple" {
		t.Fatalf("uppercase mistakes = %q, want apple", got)
	}
	if got := sourceIDs(filterWordsBySource(words, "unmastered_words", progress)); got != "apple" {
		t.Fatalf("unmastered alias = %q, want apple", got)
	}
	if got := filterWordsBySource(words, "mistakes", nil); len(got) != 0 {
		t.Fatalf("without a learner record nothing can match: %v", sourceIDs(got))
	}
}

// 服务层要把来源接到「当前用户」的学习记录上，并且不同用户之间不能串数据。
func TestFilteredQuizSetHonoursSourceFilter(t *testing.T) {
	store := &Store{}
	oldDB, oldData := store.db, store.datasets
	t.Cleanup(func() { store.db, store.datasets = oldDB, oldData })

	database, err := bolt.Open(filepath.Join(t.TempDir(), "source.db"), 0600, nil)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = database.Close() })
	if err := initDB(database); err != nil {
		t.Fatal(err)
	}
	store.db = database
	store.datasets = quizDatasets()

	if err := database.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(progressBucket))
		records := map[string]Progress{
			"primary:apple":  {Seen: 3, Wrong: 2},
			"primary:book":   {Seen: 2, Wrong: 1, Resolved: true},
			"primary:run":    {Seen: 4, Correct: 4},
			"middle:improve": {Seen: 6, Correct: 6, Mastered: true},
		}
		for key, value := range records {
			raw, err := json.Marshal(value)
			if err != nil {
				return err
			}
			if err := bucket.Put([]byte("u1|"+key), raw); err != nil {
				return err
			}
		}
		return nil
	}); err != nil {
		t.Fatal(err)
	}

	service := NewService(store, "u1")
	mistakes, err := service.FilteredQuizSet(QuizFilter{Level: "all", Type: "en-zh", Source: "mistakes"}, 1, 10, "", 0)
	if err != nil {
		t.Fatalf("mistakes set: %v", err)
	}
	if mistakes.Total != 1 || mistakes.Items[0].Word.ID != "apple" {
		t.Fatalf("mistakes set = %+v", mistakes.Items)
	}
	// 干扰项仍然来自真实词库，所以窄池也能出完整选择题。
	if len(mistakes.Items[0].Options) != 4 || !containsFold(mistakes.Items[0].Options, mistakes.Items[0].Answer) {
		t.Fatalf("options must stay complete: %+v", mistakes.Items[0])
	}

	unmastered, err := service.FilteredQuizSet(QuizFilter{Level: "all", Type: "en-zh", Source: "unmastered"}, 1, 10, "", 0)
	if err != nil {
		t.Fatalf("unmastered set: %v", err)
	}
	got := make([]string, 0, len(unmastered.Items))
	for _, item := range unmastered.Items {
		got = append(got, item.Word.ID)
	}
	if strings.Join(got, ",") != "apple,book,run" {
		t.Fatalf("unmastered set = %v", got)
	}

	// 来源可以和元数据筛选叠加：小学 + 错题只剩 apple。
	narrowed, err := service.FilteredQuizSet(QuizFilter{Level: "primary", Type: "en-zh", Topic: "食物", Source: "mistakes"}, 1, 10, "", 0)
	if err != nil {
		t.Fatalf("narrowed set: %v", err)
	}
	if narrowed.Total != 1 || narrowed.Items[0].Word.ID != "apple" {
		t.Fatalf("source must combine with metadata filters: %+v", narrowed.Items)
	}

	// 别人的错题不会串进我的练习；空池给出可读原因。
	other := NewService(store, "u2")
	if _, err := other.FilteredQuizSet(QuizFilter{Level: "all", Type: "en-zh", Source: "mistakes"}, 1, 10, "", 0); err == nil {
		t.Fatal("another user's mistakes leaked into the pool")
	} else if !strings.Contains(err.Error(), "not enough words") || !strings.Contains(err.Error(), "错题本") {
		t.Fatalf("empty source pool needs a readable reason: %v", err)
	}
}
