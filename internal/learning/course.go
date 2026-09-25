package learning

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/kataras/iris/v12"
)

type courseGrammar struct {
	Topic    string   `json:"topic"`
	Summary  string   `json:"summary"`
	Examples []string `json:"examples"`
}

type courseDialogue struct {
	Speaker string `json:"speaker"`
	Text    string `json:"text"`
}

type courseReading struct {
	Title      string   `json:"title"`
	Paragraphs []string `json:"paragraphs"`
}

type courseArticle struct {
	Dialogues []courseDialogue `json:"dialogues"`
	Reading   courseReading    `json:"reading"`
}

type courseWord struct {
	Word     string `json:"word"`
	Phonetic string `json:"phonetic"`
	Meaning  string `json:"meaning"`
}

type courseSection struct {
	Section string        `json:"section"`
	Title   string        `json:"title"`
	Topic   string        `json:"topic"`
	Grammar courseGrammar `json:"grammar"`
	Article courseArticle `json:"article"`
	Words   []courseWord  `json:"words"`
}

type courseBook struct {
	Book     string          `json:"book"`
	Grade    string          `json:"grade"`
	Semester string          `json:"semester"`
	Edition  string          `json:"edition"`
	Sections []courseSection `json:"sections"`
}

type courseResponse struct {
	Grades []string     `json:"grades"`
	Books  []courseBook `json:"books"`
}

// ---------- raw file structs ----------

type structuredItem struct {
	Section  string           `json:"section"`
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

type vocabSection struct {
	Section string `json:"section"`
	Title   string `json:"title"`
	Words   []struct {
		Word     string `json:"word"`
		Phonetic string `json:"phonetic"`
		Meaning  string `json:"meaning"`
	} `json:"words"`
}

type vocabBook struct {
	Book     string         `json:"book"`
	Sections []vocabSection `json:"sections"`
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

	var grammar map[string]map[string]courseGrammar
	if err := readJSONFile(filepath.Join(chuzhong, "grammar.json"), &grammar); err != nil {
		return nil, fmt.Errorf("grammar: %w", err)
	}

	result := &courseResponse{Grades: courseGrades}
	for _, grade := range courseGrades {
		for _, semester := range courseSemesters {
			bookName := grade + semester
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
				words = append(words, courseWord{Word: w.Word, Phonetic: w.Phonetic, Meaning: w.Meaning})
			}
			wordsBySection[sec.Section] = words
		}
	}

	var sections []courseSection
	for _, item := range sb.Items {
		sec := courseSection{
			Section: item.Section,
			Title:   item.Title,
			Topic:   item.Topic,
			Article: courseArticle{
				Dialogues: item.Dialogue,
				Reading:   courseReading{Title: item.Reading.Title, Paragraphs: item.Reading.Paragraphs},
			},
			Words: wordsBySection[item.Section],
		}
		if g, ok := grammar[bookName][item.Section]; ok {
			sec.Grammar = g
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
