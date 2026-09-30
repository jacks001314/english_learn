package learning

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/kataras/iris/v12"
)

// MeaningQuiz serves the 词义练习 pages. It runs the same question engine as
// /api/quiz, but the pool can be narrowed by grade, topic, unit, first letter
// and part of speech, and level=all drills the whole library.
//
// Without page/size it returns one random question (the classic behaviour).
// With paging it returns one page of questions covering every word that
// matches the filter, so the practice is not limited to a sample of ten words:
//
//	GET /api/meaning-quiz?level=all&type=en-zh&page=2&size=12&sort=word-asc
func (c *Controller) MeaningQuiz(ctx iris.Context) {
	filter := QuizFilter{
		Level:        ctx.URLParamDefault("level", "primary"),
		WordID:       ctx.URLParam("wordId"),
		Type:         ctx.URLParam("type"),
		Topic:        ctx.URLParam("topic"),
		Grade:        ctx.URLParam("grade"),
		Unit:         ctx.URLParam("unit"),
		Letter:       ctx.URLParam("letter"),
		PartOfSpeech: ctx.URLParam("pos"),
	}
	service := c.scoped(ctx)

	page, size := queryInt(ctx, "page", 0), queryInt(ctx, "size", 0)
	if page > 0 || size > 0 {
		set, err := service.FilteredQuizSet(filter, page, size, ctx.URLParam("sort"), queryInt(ctx, "seed", 0))
		if err != nil {
			writeQuizError(ctx, err)
			return
		}
		_ = ctx.JSON(set)
		return
	}

	quiz, err := service.FilteredQuiz(filter)
	if err != nil {
		writeQuizError(ctx, err)
		return
	}
	_ = ctx.JSON(quiz)
}

// writeQuizError maps practice engine errors onto HTTP status codes: the page
// turns 422 into a "放宽筛选条件" hint and 404 into a missing-word notice.
func writeQuizError(ctx iris.Context, err error) {
	status := http.StatusInternalServerError
	switch {
	case strings.Contains(err.Error(), "not found"):
		status = http.StatusNotFound
	case strings.Contains(err.Error(), "not enough"):
		// The filter combination matches no word at all; the practice page
		// turns 422 into a "relax the filters" hint.
		status = http.StatusUnprocessableEntity
	}
	writeError(ctx, status, err.Error())
}

// queryInt reads a numeric query parameter and falls back to the default when
// it is missing or malformed.
func queryInt(ctx iris.Context, key string, fallback int) int {
	value := strings.TrimSpace(ctx.URLParam(key))
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}
