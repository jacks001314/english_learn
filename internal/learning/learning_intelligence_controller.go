package learning

import (
	"net/http"
	"strconv"
	"time"

	"github.com/kataras/iris/v12"
)

func (c *Controller) LearningProfile(ctx iris.Context) {
	profile, err := c.scoped(ctx).LearningProfile(ctx.URLParamDefault("level", "primary"), time.Now())
	if err != nil {
		writeError(ctx, http.StatusInternalServerError, "读取学习画像失败")
		return
	}
	_ = ctx.JSON(profile)
}

func learningPlanMinutes(ctx iris.Context) int {
	minutes, _ := strconv.Atoi(ctx.URLParamDefault("minutes", "30"))
	return minutes
}

func (c *Controller) SmartLearningPlan(ctx iris.Context) {
	plan, err := c.scoped(ctx).SmartLearningPlan(ctx.URLParamDefault("level", "primary"), learningPlanMinutes(ctx), time.Now(), false)
	if err != nil {
		writeError(ctx, http.StatusInternalServerError, "生成今日学习计划失败")
		return
	}
	_ = ctx.JSON(plan)
}

func (c *Controller) RegenerateSmartLearningPlan(ctx iris.Context) {
	plan, err := c.scoped(ctx).SmartLearningPlan(ctx.URLParamDefault("level", "primary"), learningPlanMinutes(ctx), time.Now(), true)
	if err != nil {
		writeError(ctx, http.StatusInternalServerError, "重新生成学习计划失败")
		return
	}
	_ = ctx.JSON(plan)
}

func (c *Controller) CompleteSmartLearningTask(ctx iris.Context) {
	plan, err := c.scoped(ctx).CompleteSmartPlanTask(ctx.URLParamDefault("level", "primary"), ctx.Params().Get("id"), time.Now())
	if err != nil {
		writeError(ctx, http.StatusBadRequest, err.Error())
		return
	}
	_ = ctx.JSON(plan)
}

func (c *Controller) LearningEvents(ctx iris.Context) {
	limit, _ := strconv.Atoi(ctx.URLParamDefault("limit", "20"))
	service := c.scoped(ctx)
	items, err := recentLearningEvents(service.userID, limit)
	if err != nil {
		writeError(ctx, http.StatusInternalServerError, "读取学习活动失败")
		return
	}
	_ = ctx.JSON(iris.Map{"items": items, "total": len(items)})
}
