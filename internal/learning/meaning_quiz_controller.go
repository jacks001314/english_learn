package learning

import (
	"net/http"
	"strings"

	"github.com/kataras/iris/v12"
)

// MeaningQuiz serves the 词义练习 pages. It runs the same question engine as
// /api/quiz, but the pool can be narrowed by grade, topic, unit, first letter
// and part of speech, and level=all drills the whole library.
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
	quiz, err := c.scoped(ctx).FilteredQuiz(filter)
	if err != nil {
		status := http.StatusInternalServerError
		switch {
		case strings.Contains(err.Error(), "not found"):
			status = http.StatusNotFound
		case strings.Contains(err.Error(), "not enough"):
			// The filter combination matches fewer than four words; the
			// practice page turns 422 into a "放宽筛选条件" hint.
			status = http.StatusUnprocessableEntity
		}
		writeError(ctx, status, err.Error())
		return
	}
	_ = ctx.JSON(quiz)
}
