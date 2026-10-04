package learning

import (
	"strings"
	"testing"
)

// quizKey identifies a question by its word so the paging tests can assert that
// every matched word appears exactly once.
func quizKey(item Quiz) string { return item.Word.Level + ":" + item.Word.ID }

func quizKeys(items []Quiz) string {
	keys := make([]string, 0, len(items))
	for _, item := range items {
		keys = append(keys, quizKey(item))
	}
	return strings.Join(keys, ",")
}

// 词义练习页要覆盖筛选命中的全部单词，所以分页必须无重复、无遗漏，并且同一
// 请求重复调用得到同一顺序（翻页不能换题）。
func TestFilteredQuizSetCoversEveryMatchedWord(t *testing.T) {
	store := &Store{}
	oldDatasets := store.datasets
	t.Cleanup(func() { store.datasets = oldDatasets })
	store.datasets = quizDatasets()
	service := NewService(store)

	first, err := service.FilteredQuizSet(QuizFilter{Level: "all", Type: "en-zh"}, 1, 3, "", 0)
	if err != nil {
		t.Fatal(err)
	}
	if first.Total != 8 || first.Pages != 3 || first.Size != 3 || first.Page != 1 {
		t.Fatalf("unexpected set header: %+v", first)
	}
	if len(first.Items) != 3 {
		t.Fatalf("first page size = %d, want 3", len(first.Items))
	}
	// 默认按字母顺序，第一页应当是 apple / book / honest。
	for index, want := range []string{"apple", "book", "honest"} {
		if got := first.Items[index].Word.Word; got != want {
			t.Fatalf("page 1 order = %v, item %d = %s, want %s", first.Items, index, got, want)
		}
	}

	seen := make([]string, 0, 8)
	for page := 1; page <= first.Pages; page++ {
		set, err := service.FilteredQuizSet(QuizFilter{Level: "all", Type: "en-zh"}, page, 3, "", 0)
		if err != nil {
			t.Fatalf("page %d: %v", page, err)
		}
		if set.Page != page || set.Total != 8 || set.Pages != 3 {
			t.Fatalf("page %d header: %+v", page, set)
		}
		for _, item := range set.Items {
			seen = append(seen, quizKey(item))
			if item.Type != "en-zh" || item.Answer != item.Word.Meaning || len(item.Options) != 4 || !containsFold(item.Options, item.Answer) {
				t.Fatalf("page %d item is not a 看词选义 question: %+v", page, item)
			}
		}
	}
	if len(seen) != 8 {
		t.Fatalf("paging dropped words: %v", seen)
	}
	unique := map[string]bool{}
	for _, key := range seen {
		if unique[key] {
			t.Fatalf("paging repeated a word: %v", seen)
		}
		unique[key] = true
	}
	// 翻页稳定：再次请求第 2 页必须和第 1 轮一致。
	again, err := service.FilteredQuizSet(QuizFilter{Level: "all", Type: "en-zh"}, 2, 3, "", 0)
	if err != nil {
		t.Fatal(err)
	}
	for index, item := range again.Items {
		if quizKey(item) != seen[3+index] {
			t.Fatalf("page 2 is not stable: %v vs %v", again.Items, seen)
		}
	}
}

// 页码越界收敛到有效页，每页题数按默认值与上限收敛。
func TestFilteredQuizSetClampsPageAndSize(t *testing.T) {
	store := &Store{}
	oldDatasets := store.datasets
	t.Cleanup(func() { store.datasets = oldDatasets })
	store.datasets = quizDatasets()
	service := NewService(store)

	last, err := service.FilteredQuizSet(QuizFilter{Level: "all", Type: "zh-en"}, 99, 3, "", 0)
	if err != nil {
		t.Fatal(err)
	}
	if last.Page != 3 || len(last.Items) != 2 {
		t.Fatalf("page 99 must clamp to the last page with the remainder: %+v", last)
	}
	for _, item := range last.Items {
		if item.Type != "zh-en" || item.Answer != item.Word.Word || !containsFold(item.Options, item.Answer) {
			t.Fatalf("中译英 must answer with the English word: %+v", item)
		}
	}

	if zero, err := service.FilteredQuizSet(QuizFilter{Level: "all", Type: "en-zh"}, 1, 0, "", 0); err != nil {
		t.Fatal(err)
	} else if zero.Size != quizPageSizeDefault {
		t.Fatalf("size 0 must fall back to the default page size: %+v", zero)
	}
	if big, err := service.FilteredQuizSet(QuizFilter{Level: "all", Type: "en-zh"}, 1, 999, "", 0); err != nil {
		t.Fatal(err)
	} else if big.Size != quizPageSizeMax || big.Pages != 1 {
		t.Fatalf("huge page size must be capped: %+v", big)
	}
}

// 年级筛选后页内单词都来自该年级；命中词不足四个时干扰项回退到整个学段，
// 保证仍然给出四选一。
func TestFilteredQuizSetKeepsFilterAndWidensOptions(t *testing.T) {
	store := &Store{}
	oldDatasets := store.datasets
	t.Cleanup(func() { store.datasets = oldDatasets })
	store.datasets = quizDatasets()
	filter := QuizFilter{Level: "primary", Type: "en-zh", Grade: "三年级"}
	set, err := NewService(store).FilteredQuizSet(filter, 1, 12, "", 0)
	if err != nil {
		t.Fatal(err)
	}
	if set.Total != 2 || len(set.Items) != 2 {
		t.Fatalf("grade filter must keep both matching words: %+v", set)
	}
	for _, item := range set.Items {
		if !matchWordMetadata(item.Word, filter) {
			t.Fatalf("question left the filtered pool: %+v", item.Word)
		}
		if len(item.Options) != 4 {
			t.Fatalf("narrow filter must still offer four options: %+v", item.Options)
		}
	}
}

// random 排序由 seed 决定：同一 seed 翻页稳定，换 seed 会换一批题。
func TestFilteredQuizSetRandomOrderUsesSeed(t *testing.T) {
	store := &Store{}
	oldDatasets := store.datasets
	t.Cleanup(func() { store.datasets = oldDatasets })
	store.datasets = quizDatasets()
	service := NewService(store)
	filter := QuizFilter{Level: "all", Type: "en-zh"}

	first, err := service.FilteredQuizSet(filter, 1, 8, sortRandom, 7)
	if err != nil {
		t.Fatal(err)
	}
	second, err := service.FilteredQuizSet(filter, 1, 8, sortRandom, 7)
	if err != nil {
		t.Fatal(err)
	}
	if quizKeys(first.Items) != quizKeys(second.Items) {
		t.Fatalf("the same seed must keep the order stable: %v vs %v", quizKeys(first.Items), quizKeys(second.Items))
	}
	if first.Sort != sortRandom {
		t.Fatalf("set must report the requested sort: %+v", first.Sort)
	}
	other, err := service.FilteredQuizSet(filter, 1, 8, sortRandom, 99)
	if err != nil {
		t.Fatal(err)
	}
	if quizKeys(other.Items) == quizKeys(first.Items) {
		t.Fatalf("a different seed should reshuffle the set: %v", quizKeys(other.Items))
	}
}

// 筛选组合命中 0 词时返回错误，页面据此提示放宽筛选条件。
func TestFilteredQuizSetReportsEmptyPool(t *testing.T) {
	store := &Store{}
	oldDatasets := store.datasets
	t.Cleanup(func() { store.datasets = oldDatasets })
	store.datasets = quizDatasets()
	if _, err := NewService(store).FilteredQuizSet(QuizFilter{Level: "primary", Type: "en-zh", Topic: "不存在的主题"}, 1, 12, "", 0); err == nil {
		t.Fatal("a filter without matches must not produce a question")
	}
}
