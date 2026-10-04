package learning

import "testing"

func TestWordsAppliesExtendedSorts(t *testing.T) {
	store := &Store{}
	oldDatasets, oldIndex := store.datasets, store.wordIndex
	t.Cleanup(func() { store.datasets, store.wordIndex = oldDatasets, oldIndex })
	store.datasets = map[string][]Word{"primary": {
		{ID: "zoo", Word: "zoo", Level: "primary", Grade: "五年级", Unit: "扩展词汇"},
		{ID: "cat", Word: "cat", Level: "primary", Grade: "三年级", Unit: "核心词汇"},
		{ID: "ox", Word: "ox", Level: "primary", Grade: "三年级", Unit: "核心词汇"},
	}}

	byUnit := NewService(store).Words(WordFilter{Level: "primary", Sort: sortUnit, Page: 1})
	if got := wordIDs(byUnit.Items); got[0] != "cat" || got[1] != "ox" || got[2] != "zoo" {
		t.Fatalf("unit sort through Words = %v", got)
	}

	byLength := NewService(store).Words(WordFilter{Level: "primary", Sort: sortLengthAsc, Page: 1})
	if got := wordIDs(byLength.Items); got[0] != "ox" || got[2] != "zoo" {
		t.Fatalf("length sort through Words = %v", got)
	}

	shuffled := NewService(store).Words(WordFilter{Level: "primary", Sort: sortRandom, Seed: 7, Page: 1})
	again := NewService(store).Words(WordFilter{Level: "primary", Sort: sortRandom, Seed: 7, Page: 1})
	if byUnit.Total != 3 || len(shuffled.Items) != 3 {
		t.Fatalf("unexpected page: total=%d items=%d", byUnit.Total, len(shuffled.Items))
	}
	for i := range shuffled.Items {
		if shuffled.Items[i].ID != again.Items[i].ID {
			t.Fatalf("random sort is not stable for one seed: %v vs %v", wordIDs(shuffled.Items), wordIDs(again.Items))
		}
	}
}

func wordIDs(items []Word) []string {
	ids := make([]string, 0, len(items))
	for _, item := range items {
		ids = append(ids, item.ID)
	}
	return ids
}

func TestSortWordsByUnitThenWord(t *testing.T) {
	items := []Word{
		{ID: "c", Word: "cat", Grade: "四年级", Unit: "扩展词汇"},
		{ID: "a", Word: "apple", Grade: "三年级", Unit: "扩展词汇"},
		{ID: "b", Word: "book", Grade: "三年级", Unit: "核心词汇"},
	}
	sortWords(items, sortUnit, 0, nil)
	want := []string{"b", "a", "c"}
	got := wordIDs(items)
	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("unit sort = %v, want %v", got, want)
		}
	}
}

func TestSortWordsByGradeUsesSchoolLadder(t *testing.T) {
	items := []Word{
		{ID: "seven", Word: "seven", Grade: "七年级"},
		{ID: "three", Word: "three", Grade: "三年级"},
		{ID: "uncategorized", Word: "uncategorized"},
	}
	sortWords(items, sortGrade, 0, nil)
	got := wordIDs(items)
	if got[0] != "three" || got[1] != "seven" || got[2] != "uncategorized" {
		t.Fatalf("grade sort = %v", got)
	}
}

func TestSortWordsByLength(t *testing.T) {
	items := []Word{{ID: "banana", Word: "banana"}, {ID: "cat", Word: "cat"}, {ID: "ox", Word: "ox"}}
	sortWords(items, sortLengthAsc, 0, nil)
	if got := wordIDs(items); got[0] != "ox" || got[2] != "banana" {
		t.Fatalf("length asc = %v", got)
	}
	sortWords(items, sortLengthDesc, 0, nil)
	if got := wordIDs(items); got[0] != "banana" || got[2] != "ox" {
		t.Fatalf("length desc = %v", got)
	}
}

func TestSortWordsSmartPrefersUnlearned(t *testing.T) {
	items := []Word{
		{ID: "mastered", Word: "mastered", Level: "primary"},
		{ID: "wrong", Word: "wrong", Level: "primary"},
		{ID: "fresh", Word: "fresh", Level: "primary"},
	}
	progress := map[string]Progress{
		"primary:mastered": {Mastered: true, Correct: 4},
		"primary:wrong":    {Wrong: 3, Correct: 1},
	}
	sortWords(items, sortSmart, 0, progress)
	got := wordIDs(items)
	if got[0] != "fresh" || got[1] != "wrong" || got[2] != "mastered" {
		t.Fatalf("smart sort = %v", got)
	}
}

func TestSortWordsRandomIsStablePerSeed(t *testing.T) {
	build := func() []Word {
		return []Word{{ID: "a"}, {ID: "b"}, {ID: "c"}, {ID: "d"}, {ID: "e"}, {ID: "f"}, {ID: "g"}, {ID: "h"}}
	}
	first := build()
	second := build()
	sortWords(first, sortRandom, 42, nil)
	sortWords(second, sortRandom, 42, nil)
	for i := range first {
		if first[i].ID != second[i].ID {
			t.Fatalf("seed 42 produced different orders: %v vs %v", wordIDs(first), wordIDs(second))
		}
	}
}
