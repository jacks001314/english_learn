package learning

import "github.com/kataras/iris/v12"

func (c *Controller) FactoryTasks(ctx iris.Context) {
	items, err := listFactoryTasks()
	if err != nil {
		writeError(ctx, 500, "读取任务失败")
		return
	}
	_ = ctx.JSON(iris.Map{"items": items, "total": len(items)})
}
func (c *Controller) FactoryOverview(ctx iris.Context) {
	stats, err := factoryStats()
	if err != nil {
		writeError(ctx, 500, "读取统计失败")
		return
	}
	batches, _ := listFactoryBatches()
	schedules, _ := listFactorySchedules()
	_ = ctx.JSON(iris.Map{"stats": stats, "batches": batches, "schedules": schedules, "capabilities": factoryCapabilities()})
}
func (c *Controller) FactorySchedules(ctx iris.Context) {
	items, err := listFactorySchedules()
	if err != nil {
		writeError(ctx, 500, "读取计划失败")
		return
	}
	_ = ctx.JSON(iris.Map{"items": items})
}
func (c *Controller) FactorySaveSchedule(ctx iris.Context) {
	u, _ := currentUser(ctx)
	var s FactorySchedule
	if ctx.ReadJSON(&s) != nil {
		writeError(ctx, 400, "计划格式错误")
		return
	}
	out, err := saveFactorySchedule(s, u)
	if err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	_ = ctx.JSON(out)
}
func (c *Controller) FactoryCreateTask(ctx iris.Context) {
	u, _ := currentUser(ctx)
	if err := ctx.Request().ParseMultipartForm(32 << 20); err != nil {
		writeError(ctx, 400, "上传表单无效")
		return
	}
	in := FactoryTaskInput{Type: ctx.FormValue("type"), Title: ctx.FormValue("title"), Engine: ctx.FormValue("engine")}
	in.SourceURLs = ctx.FormValues()["sourceUrl"]
	files := []FactoryFile{}
	if form := ctx.Request().MultipartForm; form != nil {
		for _, headers := range form.File["files"] {
			f, err := saveFactoryUpload(c.root, headers)
			if err != nil {
				writeError(ctx, 400, err.Error())
				return
			}
			files = append(files, f)
		}
	}
	task, err := createFactoryTask(in, files, u)
	if err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	_ = writeAudit(u, "factory_create", task.ID)
	_ = ctx.JSON(task)
}
func (c *Controller) FactoryProcessTask(ctx iris.Context) {
	id := ctx.Params().Get("id")
	if err := retryFactoryTask(id); err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	task, _, _ := getFactoryTask(id)
	_ = ctx.JSON(task)
}
func (c *Controller) FactoryTaskEvents(ctx iris.Context) {
	items, err := listFactoryEvents(ctx.Params().Get("id"))
	if err != nil {
		writeError(ctx, 500, "读取任务日志失败")
		return
	}
	_ = ctx.JSON(iris.Map{"items": items})
}
func (c *Controller) FactoryRetryTask(ctx iris.Context) {
	if err := retryFactoryTask(ctx.Params().Get("id")); err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	_ = ctx.JSON(iris.Map{"ok": true, "message": "审核发布成功，内容已写入正式数据库"})
}
func (c *Controller) FactoryDraft(ctx iris.Context) {
	d, ok, err := getFactoryDraft(ctx.Params().Get("id"))
	if err != nil || !ok {
		writeError(ctx, 404, "草稿不存在")
		return
	}
	_ = ctx.JSON(d)
}
func (c *Controller) FactorySaveDraft(ctx iris.Context) {
	u, _ := currentUser(ctx)
	var d FactoryDraft
	if ctx.ReadJSON(&d) != nil {
		writeError(ctx, 400, "草稿格式错误")
		return
	}
	d.ID = ctx.Params().Get("id")
	out, err := updateFactoryDraft(d, u)
	if err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	_ = ctx.JSON(out)
}
func (c *Controller) FactoryPublishDraft(ctx iris.Context) {
	u, _ := currentUser(ctx)
	id := ctx.Params().Get("id")
	if err := publishFactoryDraft(id, u); err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	_ = writeAudit(u, "factory_publish", id)
	_ = ctx.JSON(iris.Map{"ok": true})
}
func (c *Controller) FactoryBatches(ctx iris.Context) {
	items, err := listFactoryBatches()
	if err != nil {
		writeError(ctx, 500, "读取导入记录失败")
		return
	}
	_ = ctx.JSON(iris.Map{"items": items})
}
func (c *Controller) FactoryRollbackBatch(ctx iris.Context) {
	u, _ := currentUser(ctx)
	id := ctx.Params().Get("id")
	if err := rollbackFactoryBatch(id, u); err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	_ = writeAudit(u, "factory_rollback", id)
	_ = ctx.JSON(iris.Map{"ok": true})
}
