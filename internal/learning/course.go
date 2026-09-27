package learning

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/kataras/iris/v12"
)

type courseGrammarPoint struct {
	Title    string   `json:"title"`
	Detail   string   `json:"detail"`
	Examples []string `json:"examples"`
}

type courseGrammar struct {
	Topic    string               `json:"topic"`
	Summary  string               `json:"summary"`
	Points   []courseGrammarPoint `json:"points"`
	Examples []string             `json:"examples"`
}

type courseDialogue struct {
	Speaker string `json:"speaker"`
	Text    string `json:"text"`
}

type courseText struct {
	Title      string   `json:"title"`
	Kind       string   `json:"kind"`
	Source     string   `json:"source"`
	Audio      string   `json:"audio,omitempty"`
	Paragraphs []string `json:"paragraphs"`
}

type courseArticle struct {
	Dialogues []courseDialogue `json:"dialogues"`
	Reading   courseText       `json:"reading"`
	Extra     []courseText     `json:"extra"`
}

type courseListening struct {
	Title     string           `json:"title"`
	Tracks    []courseAudio    `json:"tracks,omitempty"`
	Phonetics *courseAudio     `json:"phonetics,omitempty"`
	Tasks     []string         `json:"tasks"`
	Script    []courseDialogue `json:"script"`
}

// courseAudio is one playable recording: a label plus a site-relative URL.
type courseAudio struct {
	Title string `json:"title"`
	URL   string `json:"url"`
}

type courseWord struct {
	Word     string `json:"word"`
	Phonetic string `json:"phonetic"`
	Pos      string `json:"pos"`
	Meaning  string `json:"meaning"`
	Page     int    `json:"page"`
}

type coursePhrase struct {
	Phrase  string `json:"phrase"`
	Meaning string `json:"meaning"`
}

type coursePattern struct {
	Pattern  string   `json:"pattern"`
	Meaning  string   `json:"meaning"`
	Examples []string `json:"examples"`
}

type courseNote struct {
	Title string `json:"title"`
	Body  string `json:"body"`
}

type courseSection struct {
	Section    string          `json:"section"`
	Kind       string          `json:"kind"`
	Title      string          `json:"title"`
	TitleZh    string          `json:"titleZh"`
	Topic      string          `json:"topic"`
	Goals      []string        `json:"goals"`
	Grammar    courseGrammar   `json:"grammar"`
	Article    courseArticle   `json:"article"`
	Listening  courseListening `json:"listening"`
	WordsAudio string          `json:"wordsAudio,omitempty"`
	Speaking   *courseAudio    `json:"speaking,omitempty"`
	Words      []courseWord    `json:"words"`
	Phrases    []coursePhrase  `json:"phrases"`
	Patterns   []coursePattern `json:"patterns"`
	Notes      []courseNote    `json:"notes"`
}

type courseBook struct {
	Book           string          `json:"book"`
	Grade          string          `json:"grade"`
	Semester       string          `json:"semester"`
	Edition        string          `json:"edition"`
	Source         string          `json:"source"`
	AppendixAudios []courseAudio   `json:"appendixAudios,omitempty"`
	Sections       []courseSection `json:"sections"`
}

type courseResponse struct {
	Grades []string     `json:"grades"`
	Books  []courseBook `json:"books"`
}

// ---------- raw file structs ----------

type structuredItem struct {
	Section  string           `json:"section"`
	Heading  string           `json:"heading"`
	Title    string           `json:"title"`
	Topic    string           `json:"topic"`
	Dialogue []courseDialogue `json:"dialogue"`
	Reading  struct {
		Title      string   `json:"title"`
		Paragraphs []string `json:"paragraphs"`
	} `json:"reading"`
}

type structuredBook struct {
	Book  string           `json:"book"`
	Items []structuredItem `json:"items"`
}

type vocabWord struct {
	Word     string `json:"word"`
	Phonetic string `json:"phonetic"`
	Pos      string `json:"pos"`
	Meaning  string `json:"meaning"`
}

type vocabSection struct {
	Section string      `json:"section"`
	Title   string      `json:"title"`
	Words   []vocabWord `json:"words"`
}

type vocabBook struct {
	Book     string         `json:"book"`
	Sections []vocabSection `json:"sections"`
}

// textbookUnitsFile mirrors one per-unit file produced by the textbook content pipeline.
type textbookUnitsFile struct {
	Book    string        `json:"book"`
	Section courseSection `json:"section"`
}

// textbookBookFile mirrors the optional book-level metadata file (appendix audio, ...).
type textbookBookFile struct {
	Book           string        `json:"book"`
	AppendixAudios []courseAudio `json:"appendixAudios"`
}

func readJSONFile[T any](path string, target *T) error {
	raw, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	return json.Unmarshal(raw, target)
}

var courseGrades = []string{"七年级", "八年级", "九年级"}
var courseSemesters = []string{"上册", "下册"}

func courseEdition(grade string) string {
	if grade == "七年级" {
		return "外研版（2024）"
	}
	return "外研2011课标版"
}

func loadCourse(root string) (*courseResponse, error) {
	chuzhong := filepath.Join(root, "chuzhong")
	vocabDir := filepath.Join(chuzhong, "vocab")
	structuredDir := filepath.Join(chuzhong, "原创课文", "structured")
	textbookDir := filepath.Join(chuzhong, "真实教材")

	var grammar map[string]map[string]courseGrammar
	if err := readJSONFile(filepath.Join(chuzhong, "grammar.json"), &grammar); err != nil {
		grammar = map[string]map[string]courseGrammar{}
	}

	result := &courseResponse{Grades: courseGrades}
	for _, grade := range courseGrades {
		for _, semester := range courseSemesters {
			bookName := grade + semester
			// Textbooks with extracted, unit-by-unit content take precedence.
			if book, err := loadTextbookBook(textbookDir, bookName, grade, semester); err == nil {
				result.Books = append(result.Books, *book)
				continue
			}
			book, err := loadCourseBook(bookName, grade, semester, vocabDir, structuredDir, grammar)
			if err != nil {
				// skip if no course content for this book
				continue
			}
			result.Books = append(result.Books, *book)
		}
	}
	if len(result.Books) == 0 {
		return nil, fmt.Errorf("no course content found")
	}
	return result, nil
}

// loadTextbookBook loads real textbook content from chuzhong/真实教材/<book>/units/*.json.
func loadTextbookBook(textbookDir, bookName, grade, semester string) (*courseBook, error) {
	unitsDir := filepath.Join(textbookDir, bookName, "units")
	entries, err := os.ReadDir(unitsDir)
	if err != nil {
		return nil, err
	}
	names := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".json") {
			continue
		}
		names = append(names, entry.Name())
	}
	sort.Strings(names)
	if len(names) == 0 {
		return nil, fmt.Errorf("no textbook units in %s", unitsDir)
	}

	book := &courseBook{
		Book:     bookName,
		Grade:    strings.TrimSpace(grade),
		Semester: strings.TrimSpace(semester),
		Edition:  courseEdition(grade),
		Source:   "教材原文（扫描件 OCR + 人工校对）",
	}
	var bookFile textbookBookFile
	if err := readJSONFile(filepath.Join(textbookDir, bookName, "book.json"), &bookFile); err == nil {
		book.AppendixAudios = bookFile.AppendixAudios
	}
	for _, name := range names {
		var file textbookUnitsFile
		if err := readJSONFile(filepath.Join(unitsDir, name), &file); err != nil {
			continue
		}
		if file.Section.Section == "" {
			continue
		}
		book.Sections = append(book.Sections, file.Section)
	}
	if len(book.Sections) == 0 {
		return nil, fmt.Errorf("no textbook sections in %s", unitsDir)
	}
	return book, nil
}

func loadCourseBook(bookName, grade, semester, vocabDir, structuredDir string, grammar map[string]map[string]courseGrammar) (*courseBook, error) {
	var sb structuredBook
	structuredPath := filepath.Join(structuredDir, bookName+".json")
	if err := readJSONFile(structuredPath, &sb); err != nil {
		return nil, err
	}

	wordsBySection := map[string][]courseWord{}
	var vb vocabBook
	if err := readJSONFile(filepath.Join(vocabDir, bookName+".json"), &vb); err == nil {
		for _, sec := range vb.Sections {
			var words []courseWord
			for _, w := range sec.Words {
				words = append(words, courseWord{Word: w.Word, Phonetic: w.Phonetic, Pos: w.Pos, Meaning: w.Meaning})
			}
			wordsBySection[sec.Section] = words
		}
	}

	var sections []courseSection
	for _, item := range sb.Items {
		title := strings.TrimSpace(item.Title)
		if title == "" {
			title = strings.TrimSpace(item.Heading)
		}
		sec := courseSection{
			Section: item.Section,
			Kind:    "Unit",
			Title:   title,
			Topic:   item.Topic,
			Article: courseArticle{
				Dialogues: item.Dialogue,
				Reading:   courseText{Title: item.Reading.Title, Paragraphs: item.Reading.Paragraphs},
			},
			Words: wordsBySection[item.Section],
		}
		if g, ok := grammar[bookName][item.Section]; ok {
			sec.Grammar.Topic = g.Topic
			sec.Grammar.Summary = g.Summary
			sec.Grammar.Examples = g.Examples
		}
		sections = append(sections, sec)
	}

	if len(sections) == 0 {
		return nil, fmt.Errorf("no sections")
	}
	return &courseBook{
		Book:     bookName,
		Grade:    strings.TrimSpace(grade),
		Semester: strings.TrimSpace(semester),
		Edition:  courseEdition(grade),
		Sections: sections,
	}, nil
}

// Course exposes the consolidated course-learning payload (articles + vocabulary + grammar).
func (c *Controller) Course(ctx iris.Context) {
	data, err := loadCourse(c.root)
	if err != nil {
		writeError(ctx, 500, "课程数据加载失败")
		return
	}
	_ = ctx.JSON(data)
}
