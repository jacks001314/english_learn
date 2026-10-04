package learning

import (
	"encoding/json"
	"github.com/kataras/iris/v12"
	"mime/multipart"
	"time"
)

func (c *Controller) AdminHomeworks(ctx iris.Context) {
	items, summary, err := c.store.adminHomeworkOverview(time.Now())
	if err != nil {
		writeError(ctx, 500, "读取作业失败")
		return
	}
	_ = ctx.JSON(iris.Map{"items": items, "summary": summary})
}
func (c *Controller) AdminSaveHomework(ctx iris.Context) {
	u, _ := c.store.currentUser(ctx)
	var h Homework
	if ctx.ReadJSON(&h) != nil {
		writeError(ctx, 400, "作业格式错误")
		return
	}
	out, err := c.store.saveHomework(h, u)
	if err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	_ = c.store.writeAudit(u, "save_homework", out.ID)
	_ = ctx.JSON(out)
}
func (c *Controller) AdminHomeworkSubmissions(ctx iris.Context) {
	items, err := c.store.listHomeworkSubmissions(ctx.Params().Get("id"))
	if err != nil {
		writeError(ctx, 500, "读取提交失败")
		return
	}
	_ = ctx.JSON(iris.Map{"items": items})
}
func (c *Controller) AdminAIGradeHomework(ctx iris.Context) {
	h, ok, _ := c.store.homeworkByID(ctx.Params().Get("id"))
	if !ok {
		writeError(ctx, 404, "作业不存在")
		return
	}
	s, ok, _ := c.store.submissionFor(h.ID, ctx.Params().Get("userId"))
	if !ok {
		writeError(ctx, 404, "提交不存在")
		return
	}
	out, err := c.store.gradeHomeworkWithAgent(ctx.Request().Context(), c.root, h, s)
	if err != nil {
		writeError(ctx, 502, err.Error())
		return
	}
	_ = ctx.JSON(out)
}
func (c *Controller) AdminConfirmHomeworkGrade(ctx iris.Context) {
	u, _ := c.store.currentUser(ctx)
	var s HomeworkSubmission
	if ctx.ReadJSON(&s) != nil {
		writeError(ctx, 400, "批改格式错误")
		return
	}
	s.HomeworkID = ctx.Params().Get("id")
	s.UserID = ctx.Params().Get("userId")
	out, err := c.store.confirmHomeworkGrade(s, u)
	if err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	_ = ctx.JSON(out)
}
func (c *Controller) MyHomeworks(ctx iris.Context) {
	u, _ := c.store.currentUser(ctx)
	items, err := c.store.assignedHomeworks(u.ID)
	if err != nil {
		writeError(ctx, 500, "读取作业失败")
		return
	}
	type row struct {
		Homework
		Submission *HomeworkSubmission `json:"submission,omitempty"`
	}
	rows := []row{}
	for _, h := range items {
		s, ok, _ := c.store.submissionFor(h.ID, u.ID)
		var p *HomeworkSubmission
		if ok {
			p = &s
		}
		rows = append(rows, row{Homework: h, Submission: p})
	}
	_ = ctx.JSON(iris.Map{"items": rows})
}
func (c *Controller) SubmitHomework(ctx iris.Context) {
	u, _ := c.store.currentUser(ctx)
	if err := ctx.Request().ParseMultipartForm(32 << 20); err != nil {
		writeError(ctx, 400, "提交格式错误")
		return
	}
	answers := map[string]any{}
	if raw := ctx.FormValue("answers"); raw != "" {
		if json.Unmarshal([]byte(raw), &answers) != nil {
			writeError(ctx, 400, "答案格式错误")
			return
		}
	}
	var files []*multipart.FileHeader
	if ctx.Request().MultipartForm != nil {
		files = ctx.Request().MultipartForm.File["files"]
	}
	out, err := c.store.submitHomework(c.root, u, ctx.Params().Get("id"), answers, ctx.FormValue("notes"), files)
	if err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	_ = ctx.JSON(out)
}
