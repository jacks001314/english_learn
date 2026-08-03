package learning

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/kataras/iris/v12"
)

type Controller struct {
	service *Service
	root    string
}

func (c *Controller) scoped(ctx iris.Context) *Service {
	if user, ok := currentUser(ctx); ok {
		return NewService(user.ID)
	}
	return c.service
}

func NewController(service *Service, roots ...string) *Controller {
	root := ""
	if len(roots) > 0 {
		root = roots[0]
	}
	return &Controller{service: service, root: root}
}

func (c *Controller) Health(ctx iris.Context) { _ = ctx.JSON(iris.Map{"status": "ok"}) }

func (c *Controller) Register(ctx iris.Context) {
	var req AuthRequest
	if ctx.ReadJSON(&req) != nil {
		writeError(ctx, 400, "注册信息格式错误")
		return
	}
	u, err := createUser(req)
	if err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	c.startSession(ctx, u)
}
func (c *Controller) Login(ctx iris.Context) {
	var req AuthRequest
	if ctx.ReadJSON(&req) != nil {
		writeError(ctx, 400, "登录信息格式错误")
		return
	}
	u, err := authenticate(req.Username, req.Password)
	if err != nil {
		writeError(ctx, 401, err.Error())
		return
	}
	c.startSession(ctx, u)
}
func (c *Controller) startSession(ctx iris.Context, u User) {
	token, err := newSession(u.ID)
	if err != nil {
		writeError(ctx, 500, "创建登录会话失败")
		return
	}
	ctx.SetCookieKV(sessionCookie, token, iris.CookieHTTPOnly(true), iris.CookieSameSite(iris.SameSiteLaxMode), iris.CookieExpires(30*24*time.Hour))
	_ = ctx.JSON(AuthResponse{User: u})
}
func (c *Controller) Logout(ctx iris.Context) {
	token := ctx.GetCookie(sessionCookie)
	if token != "" {
		_ = deleteSession(token)
	}
	ctx.RemoveCookie(sessionCookie)
	_ = ctx.JSON(iris.Map{"ok": true})
}
func (c *Controller) Me(ctx iris.Context) {
	u, ok := currentUser(ctx)
	if !ok {
		writeError(ctx, 401, "未登录")
		return
	}
	_ = ctx.JSON(AuthResponse{User: u})
}
func (c *Controller) ChangePassword(ctx iris.Context) {
	u, ok := currentUser(ctx)
	if !ok {
		writeError(ctx, 401, "请先登录")
		return
	}
	var in PasswordChange
	if ctx.ReadJSON(&in) != nil {
		writeError(ctx, 400, "密码格式错误")
		return
	}
	if err := changePassword(u, in); err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	_ = writeAudit(u, "change_password", "")
	_ = ctx.JSON(iris.Map{"ok": true})
}
func (c *Controller) ArticleProgress(ctx iris.Context) {
	u, _ := currentUser(ctx)
	items, err := readArticleProgress(u.ID)
	if err != nil {
		writeError(ctx, 500, "读取文章进度失败")
		return
	}
	_ = ctx.JSON(items)
}
func (c *Controller) SaveArticleProgress(ctx iris.Context) {
	u, _ := currentUser(ctx)
	var in ArticleProgress
	if ctx.ReadJSON(&in) != nil {
		writeError(ctx, 400, "进度格式错误")
		return
	}
	saved, err := saveArticleProgress(u.ID, in)
	if err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	_ = ctx.JSON(saved)
}
func (c *Controller) AdminOverview(ctx iris.Context) {
	stats, err := platformStats()
	if err != nil {
		writeError(ctx, 500, "读取平台统计失败")
		return
	}
	logs, _ := recentAudits()
	_ = ctx.JSON(iris.Map{"stats": stats, "audits": logs})
}

func (c *Controller) AdminWords(ctx iris.Context) {
	level := ctx.URLParamDefault("level", "middle")
	q := strings.ToLower(strings.TrimSpace(ctx.URLParam("q")))
	items := []Word{}
	statusCounts := map[string]int{"published": 0, "draft": 0, "archived": 0}
	status := ctx.URLParam("status")
	for _, w := range wordsByLevel(level) {
		effectiveStatus := w.Status
		if effectiveStatus == "" {
			effectiveStatus = "published"
		}
		if status != "" && effectiveStatus != status {
			continue
		}
		if q == "" || strings.Contains(strings.ToLower(w.Word+" "+w.Meaning), q) {
			items = append(items, w)
			statusCounts[effectiveStatus]++
		}
	}
	page, size := adminPage(ctx, len(items))
	start := (page - 1) * size
	end := start + size
	if end > len(items) {
		end = len(items)
	}
	if start > len(items) {
		start = len(items)
	}
	_ = ctx.JSON(WordPage{Items: items[start:end], Total: len(items), Page: page, Size: size, StatusCounts: statusCounts})
}
func adminPage(ctx iris.Context, total int) (int, int) {
	page, _ := strconv.Atoi(ctx.URLParamDefault("page", "1"))
	size, _ := strconv.Atoi(ctx.URLParamDefault("size", "30"))
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 30
	}
	return page, size
}
func (c *Controller) AdminSaveWord(ctx iris.Context) {
	level := ctx.URLParamDefault("level", "middle")
	var item Word
	if ctx.ReadJSON(&item) != nil {
		writeError(ctx, 400, "单词数据格式错误")
		return
	}
	if item.Status == "" {
		item.Status = "draft"
	}
	if item.Status == "published" && (strings.TrimSpace(item.Meaning) == "" || strings.TrimSpace(item.Example) == "") {
		writeError(ctx, 400, "发布单词前必须填写释义和例句")
		return
	}
	u, _ := currentUser(ctx)
	action := "save"
	if item.Status == "published" {
		action = "publish"
	}
	saved, err := saveManagedWordVersioned(level, item, u.Username, action)
	if err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	_ = writeAudit(u, action+"_word", level+":"+saved.Word)
	_ = ctx.JSON(iris.Map{"saved": 1, "item": saved})
}
func (c *Controller) AdminDeleteWord(ctx iris.Context) {
	level := ctx.URLParamDefault("level", "middle")
	id := ctx.Params().Get("id")
	if err := deleteManagedWord(level, id); err != nil {
		writeError(ctx, 500, "删除单词失败")
		return
	}
	if u, ok := currentUser(ctx); ok {
		_ = writeAudit(u, "delete_word", level+":"+id)
	}
	_ = ctx.JSON(iris.Map{"ok": true})
}
func (c *Controller) AdminArticles(ctx iris.Context) {
	items, err := readAllArticles()
	if err != nil {
		writeError(ctx, 500, "读取文章失败")
		return
	}
	q := strings.ToLower(strings.TrimSpace(ctx.URLParam("q")))
	status := ctx.URLParam("status")
	if status != "" {
		out := items[:0]
		for _, a := range items {
			effectiveStatus := a.Status
			if effectiveStatus == "" {
				effectiveStatus = "published"
			}
			if effectiveStatus == status {
				out = append(out, a)
			}
		}
		items = out
	}
	if q != "" {
		out := items[:0]
		for _, a := range items {
			if strings.Contains(strings.ToLower(a.Title+" "+a.ChineseTitle+" "+a.Topic), q) {
				out = append(out, a)
			}
		}
		items = out
	}
	statusCounts := map[string]int{"published": 0, "draft": 0, "archived": 0}
	for _, item := range items {
		statusCounts[firstNonEmpty(item.Status, "published")]++
	}
	page, size := adminPage(ctx, len(items))
	start := (page - 1) * size
	end := start + size
	if end > len(items) {
		end = len(items)
	}
	if start > len(items) {
		start = len(items)
	}
	_ = ctx.JSON(AdminContentPage{Items: items[start:end], Total: len(items), Page: page, Size: size, StatusCounts: statusCounts})
}
func (c *Controller) AdminSaveArticle(ctx iris.Context) {
	var item Article
	if ctx.ReadJSON(&item) != nil {
		writeError(ctx, 400, "文章数据格式错误")
		return
	}
	if item.Status == "" {
		item.Status = "draft"
	}
	if item.Status == "published" && (strings.TrimSpace(item.Title) == "" || strings.TrimSpace(item.ChineseTitle) == "" || len(item.Paragraphs) == 0) {
		writeError(ctx, 400, "发布文章前必须填写双语标题和正文段落")
		return
	}
	if item.Status == "published" {
		for index, paragraph := range item.Paragraphs {
			if strings.TrimSpace(paragraph.English) == "" || strings.TrimSpace(paragraph.Chinese) == "" {
				writeError(ctx, 400, fmt.Sprintf("发布文章前请补全第 %d 段的双语正文", index+1))
				return
			}
		}
	}
	u, _ := currentUser(ctx)
	action := "save"
	if item.Status == "published" {
		action = "publish"
	}
	saved, err := saveArticleVersioned(item, u.Username, action)
	if err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	_ = writeAudit(u, action+"_article", saved.Title)
	_ = ctx.JSON(saved)
}
func (c *Controller) AdminDeleteArticle(ctx iris.Context) {
	id := ctx.Params().Get("id")
	if err := deleteArticle(id); err != nil {
		writeError(ctx, 500, "删除文章失败")
		return
	}
	if u, ok := currentUser(ctx); ok {
		_ = writeAudit(u, "delete_article", id)
	}
	_ = ctx.JSON(iris.Map{"ok": true})
}

func (c *Controller) AdminContentVersions(ctx iris.Context) {
	contentType := strings.ToLower(ctx.Params().Get("contentType"))
	if contentType != "article" && contentType != "word" {
		writeError(ctx, 400, "不支持的内容类型")
		return
	}
	items, err := listContentVersions(contentType, ctx.URLParam("level"), ctx.Params().Get("id"))
	if err != nil {
		writeError(ctx, 500, "读取版本历史失败")
		return
	}
	_ = ctx.JSON(iris.Map{"items": items, "total": len(items)})
}

func (c *Controller) AdminRestoreContentVersion(ctx iris.Context) {
	contentType := strings.ToLower(ctx.Params().Get("contentType"))
	version, err := strconv.Atoi(ctx.Params().Get("version"))
	if err != nil || version < 1 {
		writeError(ctx, 400, "版本号无效")
		return
	}
	u, _ := currentUser(ctx)
	item, err := restoreContentVersion(contentType, ctx.URLParam("level"), ctx.Params().Get("id"), version, u.Username)
	if err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	_ = writeAudit(u, "restore_"+contentType, fmt.Sprintf("%s to v%d", ctx.Params().Get("id"), version))
	_ = ctx.JSON(iris.Map{"item": item})
}

func (c *Controller) Exams(ctx iris.Context) {
	items, err := examPapers(false)
	if err != nil {
		writeError(ctx, 500, "读取试卷失败")
		return
	}
	_ = ctx.JSON(ExamPaperPage{Items: items, Total: len(items)})
}
func (c *Controller) Exam(ctx iris.Context) {
	item, ok, err := examPaper(ctx.Params().Get("id"))
	if err != nil {
		writeError(ctx, 500, "读取试卷失败")
		return
	}
	if !ok || item.Status != "published" {
		writeError(ctx, 404, "试卷不存在")
		return
	}
	_ = ctx.JSON(item)
}
func (c *Controller) SubmitExam(ctx iris.Context) {
	u, _ := currentUser(ctx)
	var in ExamSubmission
	if ctx.ReadJSON(&in) != nil {
		writeError(ctx, 400, "答卷格式错误")
		return
	}
	attempt, err := submitExam(u, in)
	if err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	_ = ctx.JSON(attempt)
}
func (c *Controller) ExamAttempts(ctx iris.Context) {
	u, _ := currentUser(ctx)
	items, err := userExamAttempts(u.ID)
	if err != nil {
		writeError(ctx, 500, "读取考试记录失败")
		return
	}
	_ = ctx.JSON(iris.Map{"items": items, "total": len(items)})
}
func (c *Controller) AdminExams(ctx iris.Context) {
	items, err := examPapers(true)
	if err != nil {
		writeError(ctx, 500, "读取试卷失败")
		return
	}
	_ = ctx.JSON(ExamPaperPage{Items: items, Total: len(items)})
}
func (c *Controller) AdminSaveExam(ctx iris.Context) {
	u, _ := currentUser(ctx)
	var item ExamPaper
	if ctx.ReadJSON(&item) != nil {
		writeError(ctx, 400, "试卷格式错误")
		return
	}
	saved, err := saveExamPaper(item, u.Username)
	if err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	_ = writeAudit(u, "save_exam", saved.Title)
	_ = ctx.JSON(saved)
}
func (c *Controller) AdminDeleteExam(ctx iris.Context) {
	u, _ := currentUser(ctx)
	id := ctx.Params().Get("id")
	if err := deleteExamPaper(id); err != nil {
		writeError(ctx, 500, "删除试卷失败")
		return
	}
	_ = writeAudit(u, "delete_exam", id)
	_ = ctx.JSON(iris.Map{"ok": true})
}
func (c *Controller) AdminImportExams(ctx iris.Context) {
	u, _ := currentUser(ctx)
	var payload struct {
		Items []ExamPaper `json:"items"`
	}
	if ctx.ReadJSON(&payload) != nil || len(payload.Items) == 0 {
		writeError(ctx, 400, "试卷导入格式错误")
		return
	}
	type importResult struct {
		ID      string `json:"id"`
		Title   string `json:"title"`
		Success bool   `json:"success"`
		Error   string `json:"error,omitempty"`
	}
	count := 0
	results := make([]importResult, 0, len(payload.Items))
	for _, item := range payload.Items {
		saved, err := saveExamPaper(item, u.Username)
		if err != nil {
			results = append(results, importResult{ID: item.ID, Title: item.Title, Error: err.Error()})
			continue
		}
		count++
		results = append(results, importResult{ID: saved.ID, Title: saved.Title, Success: true})
	}
	_ = writeAudit(u, "import_exams", fmt.Sprintf("count: %d", count))
	_ = ctx.JSON(iris.Map{"imported": count, "failed": len(payload.Items) - count, "results": results})
}
func (c *Controller) AdminUsers(ctx iris.Context) {
	items, err := allUsers()
	if err != nil {
		writeError(ctx, 500, "读取用户失败")
		return
	}
	_ = ctx.JSON(UserPage{Items: items, Total: len(items)})
}
func (c *Controller) AdminUpdateUser(ctx iris.Context) {
	var in UserUpdate
	if ctx.ReadJSON(&in) != nil {
		writeError(ctx, 400, "用户信息格式错误")
		return
	}
	u, err := updateUser(ctx.Params().Get("id"), in)
	if err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	if admin, ok := currentUser(ctx); ok {
		_ = writeAudit(admin, "update_user", u.Username+" role="+u.Role)
	}
	_ = ctx.JSON(u)
}
func (c *Controller) AdminResetPassword(ctx iris.Context) {
	var in AdminPasswordReset
	if ctx.ReadJSON(&in) != nil {
		writeError(ctx, 400, "密码格式错误")
		return
	}
	id := ctx.Params().Get("id")
	if err := adminResetPassword(id, in.NewPassword); err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	if u, ok := currentUser(ctx); ok {
		_ = writeAudit(u, "reset_password", id)
	}
	_ = ctx.JSON(iris.Map{"ok": true})
}

func (c *Controller) importWordsLegacyRemoved(ctx iris.Context) {
	var payload struct {
		Level string `json:"level"`
		Items []Word `json:"items"`
	}
	if ctx.ReadJSON(&payload) != nil || len(payload.Items) == 0 {
		writeError(ctx, 400, "无效的单词导入数据")
		return
	}
	level := normalizeLevel(payload.Level)
	if added, err := upsertManagedWords(level, payload.Items); err != nil {
		writeError(ctx, 400, err.Error())
		return
	} else {
		if admin, ok := currentUser(ctx); ok {
			_ = writeAudit(admin, "import_words", fmt.Sprintf("%s: %d", level, added))
		}
		_ = ctx.JSON(iris.Map{"imported": added, "level": level})
	}
	added := 0
	for i := range payload.Items {
		item := payload.Items[i]
		if strings.TrimSpace(item.ID) == "" {
			item.ID = normalizeID(item.Word)
		}
		item.Level = level
		key := progressKey(level, item.ID)
		wordIndex[key] = item
		found := false
		for j := range datasets[level] {
			if datasets[level][j].ID == item.ID {
				datasets[level][j] = item
				found = true
				break
			}
		}
		if !found {
			datasets[level] = append(datasets[level], item)
		}
		added++
	}
	if err := importContentLibrary(db); err != nil {
		writeError(ctx, 500, "写入单词内容库失败")
		return
	}
	_ = ctx.JSON(iris.Map{"imported": added, "level": level})
}

func (c *Controller) ImportWords(ctx iris.Context) {
	var payload struct {
		Level string `json:"level"`
		Items []Word `json:"items"`
	}
	if err := ctx.ReadJSON(&payload); err != nil || len(payload.Items) == 0 {
		writeError(ctx, 400, "无效的单词导入数据")
		return
	}
	level := normalizeLevel(payload.Level)
	added, err := upsertManagedWords(level, payload.Items)
	if err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	if admin, ok := currentUser(ctx); ok {
		_ = writeAudit(admin, "import_words", fmt.Sprintf("%s: %d", level, added))
	}
	_ = ctx.JSON(iris.Map{"imported": added, "level": level})
}

func (c *Controller) Articles(ctx iris.Context) {
	items, err := readArticles()
	if err != nil {
		writeError(ctx, http.StatusInternalServerError, "read articles failed")
		return
	}
	_ = ctx.JSON(ArticlePage{Items: items, Total: len(items)})
}

func (c *Controller) Article(ctx iris.Context) {
	item, ok, err := readArticle(ctx.Params().Get("id"))
	if err != nil {
		writeError(ctx, http.StatusInternalServerError, "read article failed")
		return
	}
	if !ok || !publicContentStatus(item.Status) {
		writeError(ctx, http.StatusNotFound, "article not found")
		return
	}
	_ = ctx.JSON(item)
}

func (c *Controller) ImportArticles(ctx iris.Context) {
	var payload struct {
		Items []Article `json:"items"`
	}
	if err := ctx.ReadJSON(&payload); err != nil || len(payload.Items) == 0 {
		writeError(ctx, http.StatusBadRequest, "invalid articles payload")
		return
	}
	if err := upsertArticles(payload.Items); err != nil {
		writeError(ctx, http.StatusBadRequest, err.Error())
		return
	}
	if admin, ok := currentUser(ctx); ok {
		_ = writeAudit(admin, "import_articles", fmt.Sprintf("count: %d", len(payload.Items)))
	}
	_ = ctx.JSON(iris.Map{"imported": len(payload.Items)})
}

func (c *Controller) Words(ctx iris.Context) {
	page, _ := strconv.Atoi(ctx.URLParamDefault("page", "1"))
	_ = ctx.JSON(c.scoped(ctx).Words(WordFilter{Level: ctx.URLParamDefault("level", "primary"), Query: ctx.URLParam("q"), Topic: ctx.URLParam("topic"), Grade: ctx.URLParam("grade"), Unit: ctx.URLParam("unit"), Letter: ctx.URLParam("letter"), PartOfSpeech: ctx.URLParam("pos"), Sort: ctx.URLParam("sort"), Page: page}))
}

func (c *Controller) WordFacets(ctx iris.Context) {
	_ = ctx.JSON(c.scoped(ctx).WordFacets(ctx.URLParamDefault("level", "primary")))
}

func (c *Controller) Word(ctx iris.Context) {
	item, ok := c.scoped(ctx).Word(ctx.URLParamDefault("level", "primary"), ctx.Params().Get("id"))
	if !ok {
		writeError(ctx, http.StatusNotFound, "word not found")
		return
	}
	_ = ctx.JSON(item)
}

func (c *Controller) Quiz(ctx iris.Context) {
	quiz, err := c.scoped(ctx).Quiz(ctx.URLParamDefault("level", "primary"), ctx.URLParam("wordId"), ctx.URLParam("type"))
	if err != nil {
		status := http.StatusInternalServerError
		if strings.Contains(err.Error(), "not found") {
			status = http.StatusNotFound
		}
		writeError(ctx, status, err.Error())
		return
	}
	_ = ctx.JSON(quiz)
}

func (c *Controller) AnswerQuiz(ctx iris.Context) {
	var answer QuizAnswer
	if err := ctx.ReadJSON(&answer); err != nil {
		writeError(ctx, http.StatusBadRequest, "invalid quiz answer")
		return
	}
	feedback, err := c.scoped(ctx).AnswerQuiz(answer, time.Now())
	if err != nil {
		writeError(ctx, http.StatusBadRequest, err.Error())
		return
	}
	_ = ctx.JSON(feedback)
}

func (c *Controller) SaveProgress(ctx iris.Context) {
	var incoming Progress
	if err := ctx.ReadJSON(&incoming); err != nil {
		writeError(ctx, http.StatusBadRequest, "invalid progress payload")
		return
	}
	saved, err := c.scoped(ctx).SaveProgress(ctx.URLParamDefault("level", "primary"), ctx.Params().Get("id"), incoming, time.Now())
	if err != nil {
		status := http.StatusInternalServerError
		if strings.Contains(err.Error(), "not found") {
			status = http.StatusNotFound
		}
		writeError(ctx, status, err.Error())
		return
	}
	_ = ctx.JSON(saved)
}

func (c *Controller) Progress(ctx iris.Context) {
	items, err := c.scoped(ctx).Progress()
	if err != nil {
		writeError(ctx, http.StatusInternalServerError, "read progress failed")
		return
	}
	_ = ctx.JSON(items)
}

func (c *Controller) Stats(ctx iris.Context) {
	stats, err := c.scoped(ctx).Stats()
	if err != nil {
		writeError(ctx, http.StatusInternalServerError, "read stats failed")
		return
	}
	_ = ctx.JSON(stats)
}

func (c *Controller) Mistakes(ctx iris.Context) {
	items, err := c.scoped(ctx).Mistakes()
	if err != nil {
		writeError(ctx, http.StatusInternalServerError, "read mistakes failed")
		return
	}
	_ = ctx.JSON(iris.Map{"items": items, "total": len(items)})
}

func (c *Controller) ResolveMistake(ctx iris.Context) {
	saved, err := c.scoped(ctx).ResolveMistake(ctx.URLParamDefault("level", "primary"), ctx.Params().Get("id"), time.Now())
	if err != nil {
		writeError(ctx, http.StatusNotFound, err.Error())
		return
	}
	_ = ctx.JSON(saved)
}

func (c *Controller) TodayReview(ctx iris.Context) {
	queue, err := c.scoped(ctx).TodayReview(ctx.URLParam("level"), time.Now())
	if err != nil {
		writeError(ctx, http.StatusInternalServerError, "read review failed")
		return
	}
	_ = ctx.JSON(queue)
}

func (c *Controller) Dashboard(ctx iris.Context) {
	report, err := c.scoped(ctx).Dashboard(time.Now())
	if err != nil {
		writeError(ctx, http.StatusInternalServerError, "read dashboard failed")
		return
	}
	_ = ctx.JSON(report)
}

func (c *Controller) Settings(ctx iris.Context) {
	settings, err := c.scoped(ctx).Settings()
	if err != nil {
		writeError(ctx, http.StatusInternalServerError, "read settings failed")
		return
	}
	_ = ctx.JSON(settings)
}

func (c *Controller) SaveSettings(ctx iris.Context) {
	var settings LearningSettings
	if err := ctx.ReadJSON(&settings); err != nil {
		writeError(ctx, http.StatusBadRequest, "invalid settings payload")
		return
	}
	saved, err := c.scoped(ctx).SaveSettings(settings)
	if err != nil {
		writeError(ctx, http.StatusBadRequest, err.Error())
		return
	}
	_ = ctx.JSON(saved)
}

func (c *Controller) ContentStatus(ctx iris.Context) {
	raw, err := os.ReadFile(filepath.Join(c.root, "reports", "content-completeness.json"))
	if err != nil {
		writeError(ctx, http.StatusNotFound, "content report not found")
		return
	}
	var report struct {
		Files    []ContentStatus `json:"files"`
		Complete bool            `json:"complete"`
	}
	if err := json.Unmarshal(raw, &report); err != nil {
		writeError(ctx, http.StatusInternalServerError, "invalid content report")
		return
	}
	stats, _ := contentLibraryStats(db)
	_ = ctx.JSON(iris.Map{"files": report.Files, "complete": report.Complete, "library": stats})
}

func writeError(ctx iris.Context, status int, message string) {
	ctx.StatusCode(status)
	_ = ctx.JSON(iris.Map{"error": message})
}
