package learning

import (
	"archive/zip"
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"encoding/xml"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"codex_core/core"
	"github.com/google/uuid"
	bolt "go.etcd.io/bbolt"
)

type FactoryFile struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	MIMEType      string `json:"mimeType"`
	SHA256        string `json:"sha256"`
	StoragePath   string `json:"storagePath,omitempty"`
	Size          int64  `json:"size"`
	PageCount     int    `json:"pageCount,omitempty"`
	SourceURL     string `json:"sourceUrl,omitempty"`
	Kind          string `json:"kind,omitempty"`
	ExtractedPath string `json:"extractedPath,omitempty"`
	ThumbnailPath string `json:"thumbnailPath,omitempty"`
}
type ValidationIssue struct {
	Level   string `json:"level"`
	Code    string `json:"code"`
	Message string `json:"message"`
}
type FactoryTask struct {
	ID              string            `json:"id"`
	Type            string            `json:"type"`
	Status          string            `json:"status"`
	Engine          string            `json:"engine"`
	Model           string            `json:"model"`
	Title           string            `json:"title"`
	SourceURLs      []string          `json:"sourceUrls"`
	Files           []FactoryFile     `json:"files"`
	Progress        int               `json:"progress"`
	CurrentStep     string            `json:"currentStep"`
	DraftID         string            `json:"draftId,omitempty"`
	Warnings        []ValidationIssue `json:"warnings"`
	Events          []FactoryEvent    `json:"events,omitempty"`
	CancelRequested bool              `json:"cancelRequested,omitempty"`
	Attempts        int               `json:"attempts"`
	Error           string            `json:"error,omitempty"`
	ScheduledAt     string            `json:"scheduledAt,omitempty"`
	CompletedAt     string            `json:"completedAt,omitempty"`
	CreatedBy       string            `json:"createdBy"`
	CreatedAt       string            `json:"createdAt"`
	UpdatedAt       string            `json:"updatedAt"`
}
type FactoryDraft struct {
	ID            string             `json:"id"`
	TaskID        string             `json:"taskId"`
	ContentType   string             `json:"contentType"`
	RawJSON       json.RawMessage    `json:"rawJson"`
	ExtractedText string             `json:"extractedText"`
	ReviewStatus  string             `json:"reviewStatus"`
	Validation    []ValidationIssue  `json:"validation"`
	Version       int                `json:"version"`
	ReviewedBy    string             `json:"reviewedBy,omitempty"`
	UpdatedAt     string             `json:"updatedAt"`
	Confidence    float64            `json:"confidence"`
	SourceRefs    []FactorySourceRef `json:"sourceRefs,omitempty"`
	AgentNotes    string             `json:"agentNotes,omitempty"`
}
type FactorySourceRef struct {
	AssetID string `json:"assetId"`
	Page    int    `json:"page,omitempty"`
	URL     string `json:"url,omitempty"`
	SHA256  string `json:"sha256,omitempty"`
}
type FactoryEvent struct {
	ID        string `json:"id"`
	TaskID    string `json:"taskId"`
	Level     string `json:"level"`
	Step      string `json:"step"`
	Message   string `json:"message"`
	Progress  int    `json:"progress"`
	CreatedAt string `json:"createdAt"`
}
type FactoryBatch struct {
	ID           string          `json:"id"`
	DraftID      string          `json:"draftId"`
	ContentType  string          `json:"contentType"`
	ContentID    string          `json:"contentId"`
	Snapshot     json.RawMessage `json:"snapshot"`
	PublishedBy  string          `json:"publishedBy"`
	PublishedAt  string          `json:"publishedAt"`
	RolledBackAt string          `json:"rolledBackAt,omitempty"`
	RolledBackBy string          `json:"rolledBackBy,omitempty"`
}
type FactorySchedule struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	Type          string   `json:"type"`
	SourceURLs    []string `json:"sourceUrls"`
	Engine        string   `json:"engine"`
	IntervalHours int      `json:"intervalHours"`
	Enabled       bool     `json:"enabled"`
	LastRunAt     string   `json:"lastRunAt,omitempty"`
	NextRunAt     string   `json:"nextRunAt,omitempty"`
	CreatedBy     string   `json:"createdBy"`
}
type FactoryCapabilities struct {
	PDFText       bool `json:"pdfText"`
	PDFRender     bool `json:"pdfRender"`
	OCR           bool `json:"ocr"`
	MediaProbe    bool `json:"mediaProbe"`
	Transcription bool `json:"transcription"`
	CodexVision   bool `json:"codexVision"`
	ClaudeCLI     bool `json:"claudeCli"`
}
type FactoryTaskInput struct {
	Type        string   `json:"type"`
	Title       string   `json:"title"`
	SourceURLs  []string `json:"sourceUrls"`
	Engine      string   `json:"engine"`
	AutoPublish bool     `json:"autoPublish"`
}

var factoryRunner = struct {
	sync.Mutex
	root    string
	queue   chan string
	started bool
}{}

func saveFactoryUpload(root string, header *multipart.FileHeader) (FactoryFile, error) {
	if header.Size <= 0 || header.Size > 30<<20 {
		return FactoryFile{}, errors.New("文件大小必须在 30MB 以内")
	}
	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowed := map[string]bool{".pdf": true, ".png": true, ".jpg": true, ".jpeg": true, ".webp": true, ".txt": true, ".md": true, ".docx": true, ".mp3": true, ".wav": true, ".m4a": true, ".mp4": true, ".mov": true, ".webm": true}
	if !allowed[ext] {
		return FactoryFile{}, errors.New("仅支持 PDF、Word、图片、文本、音频和视频素材")
	}
	src, err := header.Open()
	if err != nil {
		return FactoryFile{}, err
	}
	defer src.Close()
	id := uuid.NewString()
	dir := filepath.Join(root, ".agent", "factory", "uploads", id)
	if err := os.MkdirAll(dir, 0700); err != nil {
		return FactoryFile{}, err
	}
	path := filepath.Join(dir, "source"+ext)
	dst, err := os.OpenFile(path, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0600)
	if err != nil {
		return FactoryFile{}, err
	}
	defer dst.Close()
	h := sha256.New()
	n, err := io.Copy(io.MultiWriter(dst, h), io.LimitReader(src, 30<<20+1))
	if err != nil {
		return FactoryFile{}, err
	}
	if n > 30<<20 {
		return FactoryFile{}, errors.New("文件超过 30MB")
	}
	sha := strings.ToUpper(hex.EncodeToString(h.Sum(nil)))
	if duplicate, _ := factoryAssetBySHA(sha); duplicate.ID != "" {
		_ = os.Remove(path)
		return duplicate, nil
	}
	asset := FactoryFile{ID: id, Name: filepath.Base(header.Filename), MIMEType: header.Header.Get("Content-Type"), Size: n, SHA256: sha, StoragePath: path, Kind: "upload"}
	_ = db.Update(func(tx *bolt.Tx) error {
		return putJSON(tx.Bucket([]byte(contentFactoryAssetsBucket)), asset.ID, asset)
	})
	return asset, nil
}
func factoryAssetBySHA(sha string) (FactoryFile, error) {
	var found FactoryFile
	err := db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(contentFactoryAssetsBucket)).ForEach(func(_, v []byte) error {
			var x FactoryFile
			if err := json.Unmarshal(v, &x); err != nil {
				return err
			}
			if x.SHA256 == sha {
				found = x
			}
			return nil
		})
	})
	return found, err
}

func createFactoryTask(in FactoryTaskInput, files []FactoryFile, user User) (FactoryTask, error) {
	if in.Type != "article" && in.Type != "exam" {
		return FactoryTask{}, errors.New("任务类型必须是 article 或 exam")
	}
	if len(files) == 0 && len(in.SourceURLs) == 0 {
		return FactoryTask{}, errors.New("请上传文件或提供来源 URL")
	}
	cfg, _ := loadAgentConfig(false)
	engine := in.Engine
	if engine == "" {
		engine = cfg.Engine
	}
	model := cfg.Model
	if engine == "claude-code" {
		model = cfg.ClaudeModel
	}
	now := time.Now().Format(time.RFC3339)
	task := FactoryTask{ID: uuid.NewString(), Type: in.Type, Title: in.Title, Status: "queued", Engine: engine, Model: model, SourceURLs: in.SourceURLs, Files: files, Progress: 0, CurrentStep: "等待处理", Warnings: []ValidationIssue{}, CreatedBy: user.Username, CreatedAt: now, UpdatedAt: now}
	err := db.Update(func(tx *bolt.Tx) error { return putJSON(tx.Bucket([]byte(contentFactoryTasksBucket)), task.ID, task) })
	if err == nil {
		appendFactoryEvent(task.ID, "info", "queued", "任务已进入处理队列", 0)
		enqueueFactoryTask(task.ID)
	}
	return task, err
}

func startFactoryRunner(root string) {
	factoryRunner.Lock()
	defer factoryRunner.Unlock()
	if factoryRunner.started {
		return
	}
	factoryRunner.root, factoryRunner.queue, factoryRunner.started = root, make(chan string, 64), true
	go func() {
		for id := range factoryRunner.queue {
			if err := processFactoryTask(factoryRunner.root, id); err != nil {
				markFactoryTaskFailed(id, err)
			}
		}
	}()
	go factoryScheduleLoop(root)
	if tasks, err := listFactoryTasks(); err == nil {
		for _, t := range tasks {
			if t.Status == "queued" || t.Status == "processing" {
				factoryRunner.queue <- t.ID
			}
		}
	}
}
func enqueueFactoryTask(id string) {
	factoryRunner.Lock()
	q, started := factoryRunner.queue, factoryRunner.started
	factoryRunner.Unlock()
	if started {
		select {
		case q <- id:
		default:
			go func() { q <- id }()
		}
	}
}
func appendFactoryEvent(taskID, level, step, message string, progress int) {
	e := FactoryEvent{ID: uuid.NewString(), TaskID: taskID, Level: level, Step: step, Message: message, Progress: progress, CreatedAt: time.Now().Format(time.RFC3339)}
	_ = db.Update(func(tx *bolt.Tx) error { return putJSON(tx.Bucket([]byte(contentFactoryEventsBucket)), e.ID, e) })
}
func listFactoryEvents(taskID string) ([]FactoryEvent, error) {
	out := []FactoryEvent{}
	err := db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(contentFactoryEventsBucket)).ForEach(func(_, v []byte) error {
			var e FactoryEvent
			if err := json.Unmarshal(v, &e); err != nil {
				return err
			}
			if e.TaskID == taskID {
				out = append(out, e)
			}
			return nil
		})
	})
	sort.Slice(out, func(i, j int) bool { return out[i].CreatedAt < out[j].CreatedAt })
	return out, err
}
func updateFactoryTask(task FactoryTask) error {
	task.UpdatedAt = time.Now().Format(time.RFC3339)
	return db.Update(func(tx *bolt.Tx) error { return putJSON(tx.Bucket([]byte(contentFactoryTasksBucket)), task.ID, task) })
}
func markFactoryTaskFailed(id string, runErr error) {
	task, ok, _ := getFactoryTask(id)
	if !ok {
		return
	}
	task.Status = "failed"
	task.Error = runErr.Error()
	task.CurrentStep = "处理失败"
	_ = updateFactoryTask(task)
	appendFactoryEvent(id, "error", "failed", runErr.Error(), task.Progress)
}
func listFactoryTasks() ([]FactoryTask, error) {
	items := []FactoryTask{}
	err := db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(contentFactoryTasksBucket)).ForEach(func(_, v []byte) error {
			var x FactoryTask
			if err := json.Unmarshal(v, &x); err != nil {
				return err
			}
			items = append(items, x)
			return nil
		})
	})
	sort.Slice(items, func(i, j int) bool { return items[i].CreatedAt > items[j].CreatedAt })
	return items, err
}
func getFactoryTask(id string) (FactoryTask, bool, error) {
	var x FactoryTask
	ok := false
	err := db.View(func(tx *bolt.Tx) error {
		v := tx.Bucket([]byte(contentFactoryTasksBucket)).Get([]byte(id))
		if v == nil {
			return nil
		}
		ok = true
		return json.Unmarshal(v, &x)
	})
	return x, ok, err
}
func getFactoryDraft(id string) (FactoryDraft, bool, error) {
	var x FactoryDraft
	ok := false
	err := db.View(func(tx *bolt.Tx) error {
		v := tx.Bucket([]byte(contentFactoryDraftsBucket)).Get([]byte(id))
		if v == nil {
			return nil
		}
		ok = true
		return json.Unmarshal(v, &x)
	})
	return x, ok, err
}

func processFactoryTask(root, id string) error {
	task, ok, err := getFactoryTask(id)
	if err != nil || !ok {
		return errors.New("任务不存在")
	}
	if task.Status == "review" || task.Status == "completed" || task.Status == "cancelled" {
		return nil
	}
	task.Status, task.Progress, task.CurrentStep, task.Attempts = "processing", 5, "准备素材", task.Attempts+1
	_ = updateFactoryTask(task)
	appendFactoryEvent(task.ID, "info", "prepare", "开始处理素材", 5)
	for _, sourceURL := range task.SourceURLs {
		asset, e := downloadFactoryURL(root, sourceURL)
		if e != nil {
			task.Warnings = append(task.Warnings, ValidationIssue{Level: "warning", Code: "download_failed", Message: sourceURL + ": " + e.Error()})
			appendFactoryEvent(task.ID, "warning", "download", e.Error(), 10)
			continue
		}
		task.Files = append(task.Files, asset)
	}
	if len(task.Files) == 0 {
		task.Status = "failed"
		task.Error = "没有可处理的素材"
		_ = updateFactoryTask(task)
		return errors.New(task.Error)
	}
	task.Progress, task.CurrentStep = 20, "提取文档与媒体内容"
	_ = updateFactoryTask(task)
	appendFactoryEvent(task.ID, "info", "extract", "正在提取文本和页面", 20)
	var texts []string
	for i := range task.Files {
		text, warnings := extractFactoryAsset(root, &task.Files[i])
		texts = append(texts, text)
		task.Warnings = append(task.Warnings, warnings...)
	}
	extracted := strings.TrimSpace(strings.Join(texts, "\n\n"))
	needsVision := false
	for _, w := range task.Warnings {
		if w.Code == "vision_required" || w.Code == "scanned_pdf" {
			needsVision = true
		}
	}
	if needsVision {
		appendFactoryEvent(task.ID, "info", "vision", "正在进行多模态页面识别", 45)
		if visual, e := visionExtractFactoryAssets(root, task); e == nil && strings.TrimSpace(visual) != "" {
			if extracted != "" {
				extracted += "\n\n"
			}
			extracted += visual
			task.Warnings = append(task.Warnings, ValidationIssue{Level: "info", Code: "vision_completed", Message: "已完成视觉页面识别"})
		} else if e != nil {
			task.Warnings = append(task.Warnings, ValidationIssue{Level: "warning", Code: "vision_failed", Message: e.Error()})
		}
	}
	task.Progress, task.CurrentStep = 60, "智能体结构化"
	_ = updateFactoryTask(task)
	appendFactoryEvent(task.ID, "info", "structure", "智能体正在生成严格 JSON 草稿", 60)
	raw, notes, confidence, agentErr := structureFactoryContent(root, task, extracted)
	if agentErr != nil {
		task.Warnings = append(task.Warnings, ValidationIssue{Level: "warning", Code: "agent_failed", Message: agentErr.Error()})
		raw = fallbackFactoryDraft(task, extracted)
		notes = "智能体失败，已生成基础草稿：" + agentErr.Error()
		confidence = .25
	}
	refs := make([]FactorySourceRef, 0, len(task.Files))
	for _, f := range task.Files {
		refs = append(refs, FactorySourceRef{AssetID: f.ID, URL: f.SourceURL, SHA256: f.SHA256})
	}
	draft := FactoryDraft{ID: uuid.NewString(), TaskID: task.ID, ContentType: task.Type, RawJSON: raw, ExtractedText: extracted, ReviewStatus: "pending", Version: 1, UpdatedAt: time.Now().Format(time.RFC3339), Confidence: confidence, SourceRefs: refs, AgentNotes: notes}
	draft.Validation = validateFactoryDraft(draft)
	task.DraftID = draft.ID
	task.Progress = 100
	task.Status = "review"
	task.CurrentStep = "等待管理员审核"
	task.CompletedAt = time.Now().Format(time.RFC3339)
	task.UpdatedAt = time.Now().Format(time.RFC3339)
	err = db.Update(func(tx *bolt.Tx) error {
		if err := putJSON(tx.Bucket([]byte(contentFactoryDraftsBucket)), draft.ID, draft); err != nil {
			return err
		}
		return putJSON(tx.Bucket([]byte(contentFactoryTasksBucket)), task.ID, task)
	})
	appendFactoryEvent(task.ID, "info", "review", "草稿已生成，等待审核", 100)
	return err
}
func validateFactoryDraft(d FactoryDraft) []ValidationIssue {
	issues := []ValidationIssue{}
	if strings.TrimSpace(d.ExtractedText) == "" {
		issues = append(issues, ValidationIssue{Level: "warning", Code: "empty_text", Message: "未提取到文本，需要 OCR 或人工录入"})
	}
	if d.ContentType == "exam" {
		var x ExamPaper
		if json.Unmarshal(d.RawJSON, &x) != nil || x.Title == "" {
			issues = append(issues, ValidationIssue{Level: "error", Code: "invalid_exam", Message: "试卷结构无效"})
		}
		if len(x.Sections) == 0 {
			issues = append(issues, ValidationIssue{Level: "warning", Code: "no_questions", Message: "尚未识别出结构化题目"})
		}
		ids := map[string]bool{}
		score := 0.0
		for _, s := range x.Sections {
			for _, q := range s.Questions {
				if strings.TrimSpace(q.ID) == "" {
					issues = append(issues, ValidationIssue{Level: "error", Code: "missing_question_id", Message: "存在缺少题号的题目"})
				} else if ids[q.ID] {
					issues = append(issues, ValidationIssue{Level: "error", Code: "duplicate_question_id", Message: "重复题号: " + q.ID})
				}
				ids[q.ID] = true
				if strings.TrimSpace(q.Prompt) == "" {
					issues = append(issues, ValidationIssue{Level: "error", Code: "missing_prompt", Message: "题目 " + q.ID + " 缺少题干"})
				}
				if (q.Type == "choice" || q.Type == "single") && len(q.Options) < 2 {
					issues = append(issues, ValidationIssue{Level: "error", Code: "missing_options", Message: "选择题 " + q.ID + " 选项不足"})
				}
				if q.Type != "writing" && q.Type != "subjective" && strings.TrimSpace(fmt.Sprint(q.Answer)) == "" {
					issues = append(issues, ValidationIssue{Level: "warning", Code: "missing_answer", Message: "题目 " + q.ID + " 缺少答案"})
				}
				score += q.Score
			}
		}
		if x.TotalScore > 0 && score > 0 && score != x.TotalScore {
			issues = append(issues, ValidationIssue{Level: "error", Code: "score_mismatch", Message: fmt.Sprintf("题目分值合计 %.1f，与总分 %.1f 不一致", score, x.TotalScore)})
		}
	} else if d.ContentType == "article" {
		var x Article
		if json.Unmarshal(d.RawJSON, &x) != nil || strings.TrimSpace(x.Title) == "" {
			issues = append(issues, ValidationIssue{Level: "error", Code: "invalid_article", Message: "文章标题或结构无效"})
		}
		if len(x.Paragraphs) == 0 && strings.TrimSpace(x.Content) == "" {
			issues = append(issues, ValidationIssue{Level: "error", Code: "empty_article", Message: "文章正文为空"})
		}
		for i, p := range x.Paragraphs {
			if strings.TrimSpace(p.English) == "" {
				issues = append(issues, ValidationIssue{Level: "warning", Code: "empty_paragraph", Message: fmt.Sprintf("第 %d 段英文为空", i+1)})
			}
		}
	}
	return issues
}

func downloadFactoryURL(root, rawURL string) (FactoryFile, error) {
	u, err := url.Parse(strings.TrimSpace(rawURL))
	if err != nil || !(u.Scheme == "http" || u.Scheme == "https") {
		return FactoryFile{}, errors.New("仅支持 HTTP/HTTPS 地址")
	}
	host := strings.ToLower(u.Hostname())
	if blockedFactoryHost(host) {
		return FactoryFile{}, errors.New("不允许访问本地地址")
	}
	client := &http.Client{Timeout: 30 * time.Second, CheckRedirect: func(req *http.Request, via []*http.Request) error {
		if len(via) > 5 {
			return errors.New("重定向过多")
		}
		h := strings.ToLower(req.URL.Hostname())
		if blockedFactoryHost(h) {
			return errors.New("不允许重定向到本地地址")
		}
		return nil
	}}
	req, _ := http.NewRequest(http.MethodGet, u.String(), nil)
	req.Header.Set("User-Agent", "EnglishLearnContentFactory/1.0")
	resp, err := client.Do(req)
	if err != nil {
		return FactoryFile{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return FactoryFile{}, fmt.Errorf("HTTP %d", resp.StatusCode)
	}
	id := uuid.NewString()
	dir := filepath.Join(root, ".agent", "factory", "downloads", id)
	if err := os.MkdirAll(dir, 0700); err != nil {
		return FactoryFile{}, err
	}
	name := filepath.Base(u.Path)
	if name == "" || name == "/" {
		name = "page.html"
	}
	ext := strings.ToLower(filepath.Ext(name))
	ct := resp.Header.Get("Content-Type")
	if ext == "" {
		if strings.Contains(ct, "pdf") {
			ext = ".pdf"
		} else {
			ext = ".html"
		}
		name = "source" + ext
	}
	path := filepath.Join(dir, "source"+ext)
	file, err := os.OpenFile(path, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0600)
	if err != nil {
		return FactoryFile{}, err
	}
	defer file.Close()
	h := sha256.New()
	n, err := io.Copy(io.MultiWriter(file, h), io.LimitReader(resp.Body, 30<<20+1))
	if err != nil {
		return FactoryFile{}, err
	}
	if n > 30<<20 {
		return FactoryFile{}, errors.New("下载文件超过 30MB")
	}
	asset := FactoryFile{ID: id, Name: name, MIMEType: ct, Size: n, SHA256: strings.ToUpper(hex.EncodeToString(h.Sum(nil))), StoragePath: path, SourceURL: u.String(), Kind: "download"}
	_ = db.Update(func(tx *bolt.Tx) error {
		return putJSON(tx.Bucket([]byte(contentFactoryAssetsBucket)), asset.ID, asset)
	})
	return asset, nil
}

func blockedFactoryHost(host string) bool {
	if host == "localhost" || strings.HasSuffix(host, ".local") {
		return true
	}
	ips, err := net.LookupIP(host)
	if err != nil || len(ips) == 0 {
		return true
	}
	for _, ip := range ips {
		if ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() || ip.IsUnspecified() {
			return true
		}
	}
	return false
}

func extractFactoryAsset(root string, f *FactoryFile) (string, []ValidationIssue) {
	ext := strings.ToLower(filepath.Ext(f.StoragePath))
	warnings := []ValidationIssue{}
	var text string
	switch ext {
	case ".txt", ".md":
		raw, e := os.ReadFile(f.StoragePath)
		if e == nil {
			text = string(raw)
		} else {
			warnings = append(warnings, ValidationIssue{Level: "error", Code: "read_failed", Message: e.Error()})
		}
	case ".html", ".htm":
		raw, e := os.ReadFile(f.StoragePath)
		if e == nil {
			text = extractHTMLText(string(raw))
		}
	case ".pdf":
		text, warnings = extractPDFAsset(f)
	case ".docx":
		text, warnings = extractDOCXAsset(f)
	case ".png", ".jpg", ".jpeg", ".webp":
		text, warnings = extractImageAsset(f)
	case ".mp3", ".wav", ".m4a", ".mp4", ".mov", ".webm":
		text, warnings = extractMediaAsset(f)
	default:
		warnings = append(warnings, ValidationIssue{Level: "warning", Code: "unsupported_extract", Message: "暂不支持提取 " + ext})
	}
	out := filepath.Join(filepath.Dir(f.StoragePath), "extracted.txt")
	if strings.TrimSpace(text) != "" {
		_ = os.WriteFile(out, []byte(text), 0600)
		f.ExtractedPath = out
	}
	return strings.TrimSpace(text), warnings
}
func extractHTMLText(raw string) string {
	raw = strings.ReplaceAll(raw, "</p>", "\n")
	raw = strings.ReplaceAll(raw, "<br>", "\n")
	var out strings.Builder
	inside := false
	for _, r := range raw {
		if r == '<' {
			inside = true
			continue
		}
		if r == '>' {
			inside = false
			continue
		}
		if !inside {
			out.WriteRune(r)
		}
	}
	s := out.String()
	for _, p := range []struct{ a, b string }{{"&nbsp;", " "}, {"&amp;", "&"}, {"&lt;", "<"}, {"&gt;", ">"}, {"&#39;", "'"}, {"&quot;", "\""}} {
		s = strings.ReplaceAll(s, p.a, p.b)
	}
	return strings.TrimSpace(s)
}
func extractPDFAsset(f *FactoryFile) (string, []ValidationIssue) {
	warnings := []ValidationIssue{}
	out := filepath.Join(filepath.Dir(f.StoragePath), "pdftotext.txt")
	cmd := exec.Command("pdftotext", "-enc", "UTF-8", f.StoragePath, out)
	if err := cmd.Run(); err != nil {
		return "", []ValidationIssue{{Level: "error", Code: "pdf_extract_failed", Message: err.Error()}}
	}
	raw, _ := os.ReadFile(out)
	text := string(raw)
	pages := strings.Count(text, "\f") + 1
	f.PageCount = pages
	if len(strings.TrimSpace(text)) < 200 {
		warnings = append(warnings, ValidationIssue{Level: "warning", Code: "scanned_pdf", Message: "PDF 可能是扫描件，需要视觉模型或 OCR 复核"})
	}
	return text, warnings
}
func extractDOCXAsset(f *FactoryFile) (string, []ValidationIssue) {
	z, err := zip.OpenReader(f.StoragePath)
	if err != nil {
		return "", []ValidationIssue{{Level: "error", Code: "docx_open_failed", Message: err.Error()}}
	}
	defer z.Close()
	var data []byte
	for _, x := range z.File {
		if x.Name == "word/document.xml" {
			r, _ := x.Open()
			data, _ = io.ReadAll(io.LimitReader(r, 20<<20))
			r.Close()
			break
		}
	}
	if len(data) == 0 {
		return "", []ValidationIssue{{Level: "error", Code: "docx_document_missing", Message: "DOCX 主文档缺失"}}
	}
	dec := xml.NewDecoder(bytes.NewReader(data))
	var out strings.Builder
	for {
		tok, e := dec.Token()
		if e == io.EOF {
			break
		}
		if e != nil {
			return "", []ValidationIssue{{Level: "error", Code: "docx_xml", Message: e.Error()}}
		}
		switch v := tok.(type) {
		case xml.CharData:
			out.Write([]byte(v))
		case xml.EndElement:
			if v.Name.Local == "p" || v.Name.Local == "tr" {
				out.WriteByte('\n')
			} else if v.Name.Local == "tc" {
				out.WriteByte('\t')
			}
		}
	}
	return out.String(), nil
}
func extractImageAsset(f *FactoryFile) (string, []ValidationIssue) {
	if path, err := exec.LookPath("tesseract"); err == nil {
		base := filepath.Join(filepath.Dir(f.StoragePath), "ocr")
		cmd := exec.Command(path, f.StoragePath, base, "-l", "eng+chi_sim")
		if e := cmd.Run(); e == nil {
			raw, _ := os.ReadFile(base + ".txt")
			return string(raw), nil
		}
	}
	return "", []ValidationIssue{{Level: "warning", Code: "vision_required", Message: "本机未安装 Tesseract，将由支持视觉的智能体识别图片"}}
}

func visionExtractFactoryAssets(root string, task FactoryTask) (string, error) {
	cfg, err := loadAgentConfig(true)
	if err != nil || !cfg.Enabled {
		return "", errors.New("视觉识别需要启用 Codex Core 智能体")
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(cfg.TimeoutSeconds)*time.Second)
	defer cancel()
	items := []any{}
	count := 0
	for _, f := range task.Files {
		ext := strings.ToLower(filepath.Ext(f.StoragePath))
		paths := []string{}
		if ext == ".pdf" {
			dir := filepath.Join(filepath.Dir(f.StoragePath), "pages")
			_ = os.MkdirAll(dir, 0700)
			prefix := filepath.Join(dir, "page")
			if err := exec.Command("pdftoppm", "-f", "1", "-l", "20", "-jpeg", "-r", "130", f.StoragePath, prefix).Run(); err == nil {
				matches, _ := filepath.Glob(prefix + "-*.jpg")
				paths = append(paths, matches...)
			}
		}
		if ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == ".webp" {
			paths = []string{f.StoragePath}
		}
		for _, p := range paths {
			if count >= 20 {
				break
			}
			raw, e := os.ReadFile(p)
			if e != nil || len(raw) > 8<<20 {
				continue
			}
			mime := "image/jpeg"
			if strings.HasSuffix(strings.ToLower(p), ".png") {
				mime = "image/png"
			}
			items = append(items, map[string]any{"type": "message", "role": "user", "content": []any{map[string]any{"type": "input_image", "image_url": "data:" + mime + ";base64," + base64.StdEncoding.EncodeToString(raw), "detail": "high"}}})
			count++
		}
	}
	if count == 0 {
		return "", errors.New("没有可供视觉识别的页面")
	}
	client, err := core.NewFromConfig(ctx, &core.ConfigOptions{CodexHome: filepath.Join(root, ".agent"), CWD: root, APIKey: cfg.APIKey, ProviderID: cfg.ProviderID, Model: cfg.Model, BaseURL: cfg.BaseURL, Tools: &core.ToolOptions{Preset: core.ToolsNone}})
	if err != nil {
		return "", err
	}
	defer client.Close()
	result, err := client.Run(ctx, &core.Request{Prompt: "按页面顺序准确转写这些英语学习资料。保留标题、题号、题干、选项、答案、段落和表格；不要总结，不要添加原图没有的内容。输出纯文本。", Instructions: "你是严谨的文档 OCR 校对员。", InputItems: items})
	if err != nil {
		return "", err
	}
	return result.Response.Message, nil
}
func extractMediaAsset(f *FactoryFile) (string, []ValidationIssue) {
	probe, err := exec.LookPath("ffprobe")
	if err != nil {
		return "", []ValidationIssue{{Level: "warning", Code: "ffprobe_missing", Message: "未安装 ffprobe"}}
	}
	out, err := exec.Command(probe, "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", f.StoragePath).Output()
	if err != nil {
		return "", []ValidationIssue{{Level: "warning", Code: "media_probe_failed", Message: err.Error()}}
	}
	seconds, _ := strconv.ParseFloat(strings.TrimSpace(string(out)), 64)
	for _, name := range []string{"whisper", "whisper-cli"} {
		if path, e := exec.LookPath(name); e == nil {
			dir := filepath.Dir(f.StoragePath)
			cmd := exec.Command(path, f.StoragePath, "--output_dir", dir, "--output_format", "txt")
			if runErr := cmd.Run(); runErr == nil {
				matches, _ := filepath.Glob(filepath.Join(dir, "*.txt"))
				for _, p := range matches {
					if p == f.ExtractedPath {
						continue
					}
					raw, _ := os.ReadFile(p)
					if strings.TrimSpace(string(raw)) != "" {
						return string(raw), nil
					}
				}
			}
		}
	}
	return fmt.Sprintf("[媒体素材：%s，时长 %.1f 秒。需要配置语音转写服务生成全文。]", f.Name, seconds), []ValidationIssue{{Level: "warning", Code: "transcription_required", Message: "媒体已读取；安装 whisper 或 whisper-cli 后可自动转写"}}
}

func factoryCapabilities() FactoryCapabilities {
	_, pdfTextErr := exec.LookPath("pdftotext")
	_, pdfRenderErr := exec.LookPath("pdftoppm")
	_, ocrErr := exec.LookPath("tesseract")
	_, probeErr := exec.LookPath("ffprobe")
	_, whisperErr := exec.LookPath("whisper")
	if whisperErr != nil {
		_, whisperErr = exec.LookPath("whisper-cli")
	}
	_, claudeErr := exec.LookPath("claude")
	cfg, _ := loadAgentConfig(false)
	return FactoryCapabilities{PDFText: pdfTextErr == nil, PDFRender: pdfRenderErr == nil, OCR: ocrErr == nil, MediaProbe: probeErr == nil, Transcription: whisperErr == nil, CodexVision: cfg.Enabled && cfg.APIKeyConfigured, ClaudeCLI: claudeErr == nil}
}

func saveFactorySchedule(s FactorySchedule, user User) (FactorySchedule, error) {
	if s.ID == "" {
		s.ID = uuid.NewString()
	}
	if s.IntervalHours < 1 {
		s.IntervalHours = 24
	}
	if s.Type != "article" && s.Type != "exam" {
		return s, errors.New("计划类型无效")
	}
	if len(s.SourceURLs) == 0 {
		return s, errors.New("至少需要一个来源网址")
	}
	s.CreatedBy = user.Username
	s.NextRunAt = time.Now().Add(time.Duration(s.IntervalHours) * time.Hour).Format(time.RFC3339)
	err := db.Update(func(tx *bolt.Tx) error { return putJSON(tx.Bucket([]byte(contentFactorySchedulesBucket)), s.ID, s) })
	return s, err
}
func listFactorySchedules() ([]FactorySchedule, error) {
	out := []FactorySchedule{}
	err := db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(contentFactorySchedulesBucket)).ForEach(func(_, v []byte) error {
			var s FactorySchedule
			if err := json.Unmarshal(v, &s); err != nil {
				return err
			}
			out = append(out, s)
			return nil
		})
	})
	return out, err
}
func factoryScheduleLoop(root string) {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		items, _ := listFactorySchedules()
		now := time.Now()
		for _, s := range items {
			next, _ := time.Parse(time.RFC3339, s.NextRunAt)
			if !s.Enabled || now.Before(next) {
				continue
			}
			task, err := createFactoryTask(FactoryTaskInput{Type: s.Type, Title: s.Name + " " + now.Format("2006-01-02"), SourceURLs: s.SourceURLs, Engine: s.Engine}, nil, User{Username: s.CreatedBy})
			if err == nil {
				_ = task
				s.LastRunAt = now.Format(time.RFC3339)
				s.NextRunAt = now.Add(time.Duration(s.IntervalHours) * time.Hour).Format(time.RFC3339)
				_ = db.Update(func(tx *bolt.Tx) error { return putJSON(tx.Bucket([]byte(contentFactorySchedulesBucket)), s.ID, s) })
			}
		}
	}
}

func structureFactoryContent(root string, task FactoryTask, extracted string) (json.RawMessage, string, float64, error) {
	if strings.TrimSpace(extracted) == "" {
		return fallbackFactoryDraft(task, extracted), "没有可供结构化的文本", .2, nil
	}
	cfg, err := loadAgentConfig(true)
	if err != nil {
		return nil, "", 0, err
	}
	if !cfg.Enabled {
		return nil, "", 0, errors.New("智能体未启用")
	}
	engine := task.Engine
	if engine == "" {
		engine = cfg.Engine
	}
	schema := ""
	if task.Type == "article" {
		schema = `{"id":"string","title":"English title","chineseTitle":"中文标题","level":"middle","difficulty":"A2/B1/B2","topic":"主题","collection":"AI 内容工厂","intro":"中文导读","minutes":5,"paragraphs":[{"en":"English paragraph","zh":"中文翻译"}],"words":[["word","中文释义"]],"quote":"English quote","quoteZh":"中文翻译","status":"draft"}`
	} else {
		schema = `{"id":"string","title":"试卷标题","year":2025,"region":"北京市","subject":"英语","durationMinutes":90,"totalScore":60,"status":"draft","sourceType":"agent-draft","instructions":"说明","sections":[{"id":"section-id","title":"大题标题","type":"choice/reading/fill/writing","instructions":"说明","questions":[{"id":"q1","type":"choice/fill/subjective/writing","prompt":"题干","passage":"阅读材料","options":["选项文本"],"answer":"A或答案文本","explanation":"解析","score":1,"tags":["标签"]}]}]}`
	}
	prompt := fmt.Sprintf("你是英语教育内容结构化专家。只输出一个合法 JSON 对象，禁止 Markdown 代码围栏和解释文字。根据来源文本生成%s草稿。不得编造来源中不存在的试题或答案；无法确认的答案留空，并在 explanation 标注待人工核验。保持原文完整，修复明显断行和 OCR 空格。目标结构：%s\n\n来源文本：\n%s", map[string]string{"article": "文章", "exam": "试卷"}[task.Type], schema, truncateFactoryText(extracted, 45000))
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(cfg.TimeoutSeconds)*time.Second)
	defer cancel()
	var result AgentChatResponse
	if engine == "claude-code" {
		result, err = runClaudeAgent(ctx, root, cfg, prompt, "")
	} else {
		result, err = runCodexAgent(ctx, root, cfg, prompt, "")
	}
	if err != nil {
		return nil, "", 0, err
	}
	raw, err := extractJSONObject(result.Message)
	if err != nil {
		return nil, result.Message, 0, err
	}
	return raw, "由 " + engine + " / " + result.Model + " 生成", .82, nil
}
func truncateFactoryText(s string, max int) string {
	r := []rune(s)
	if len(r) <= max {
		return s
	}
	return string(r[:max]) + "\n[内容过长，已截断]"
}
func extractJSONObject(s string) (json.RawMessage, error) {
	s = strings.TrimSpace(s)
	s = strings.TrimPrefix(s, "```json")
	s = strings.TrimPrefix(s, "```")
	s = strings.TrimSuffix(s, "```")
	start, end := strings.Index(s, "{"), strings.LastIndex(s, "}")
	if start < 0 || end <= start {
		return nil, errors.New("智能体未返回 JSON")
	}
	raw := json.RawMessage(s[start : end+1])
	var v any
	if err := json.Unmarshal(raw, &v); err != nil {
		return nil, fmt.Errorf("智能体 JSON 无效: %w", err)
	}
	return raw, nil
}
func fallbackFactoryDraft(task FactoryTask, extracted string) json.RawMessage {
	if task.Type == "article" {
		x := Article{ID: "factory-" + task.ID, Title: task.Title, Status: "draft", Collection: "AI 内容工厂", Paragraphs: []ArticleParagraph{{English: extracted}}}
		raw, _ := json.Marshal(x)
		return raw
	}
	x := ExamPaper{ID: "factory-" + task.ID, Title: task.Title, Region: "北京市", Subject: "英语", Status: "draft", SourceType: "agent-draft", Sections: []ExamSection{}}
	raw, _ := json.Marshal(x)
	return raw
}
func updateFactoryDraft(d FactoryDraft, user User) (FactoryDraft, error) {
	old, ok, err := getFactoryDraft(d.ID)
	if err != nil || !ok {
		return d, errors.New("草稿不存在")
	}
	d.TaskID = old.TaskID
	d.ContentType = old.ContentType
	d.Version = old.Version + 1
	d.UpdatedAt = time.Now().Format(time.RFC3339)
	d.Validation = validateFactoryDraft(d)
	err = db.Update(func(tx *bolt.Tx) error {
		if err := putJSON(tx.Bucket([]byte(contentFactoryVersionsBucket)), fmt.Sprintf("%s|%06d", old.ID, old.Version), old); err != nil {
			return err
		}
		return putJSON(tx.Bucket([]byte(contentFactoryDraftsBucket)), d.ID, d)
	})
	return d, err
}
func publishFactoryDraft(id string, user User) error {
	d, ok, err := getFactoryDraft(id)
	if err != nil || !ok {
		return errors.New("草稿不存在")
	}
	for _, v := range d.Validation {
		if v.Level == "error" {
			return errors.New("草稿仍有阻止发布的校验错误")
		}
	}
	batch := FactoryBatch{ID: uuid.NewString(), DraftID: d.ID, ContentType: d.ContentType, PublishedBy: user.Username, PublishedAt: time.Now().Format(time.RFC3339)}
	if d.ContentType == "article" {
		var x Article
		if err := json.Unmarshal(d.RawJSON, &x); err != nil {
			return err
		}
		x.Status = "published"
		batch.ContentID = x.ID
		if old, ok, _ := readArticle(x.ID); ok {
			batch.Snapshot, _ = json.Marshal(old)
		}
		if _, err := saveArticleVersioned(x, user.Username, "publish"); err != nil {
			return err
		}
	} else {
		var x ExamPaper
		if err := json.Unmarshal(d.RawJSON, &x); err != nil {
			return err
		}
		x.Status = "published"
		batch.ContentID = x.ID
		if old, ok, _ := examPaper(x.ID); ok {
			batch.Snapshot, _ = json.Marshal(old)
		}
		if _, err := saveExamPaper(x, user.Username); err != nil {
			return err
		}
	}
	d.ReviewStatus = "published"
	d.ReviewedBy = user.Username
	d.UpdatedAt = time.Now().Format(time.RFC3339)
	task, taskOK, _ := getFactoryTask(d.TaskID)
	if taskOK {
		task.Status = "published"
		task.Progress = 100
		task.CurrentStep = "已审核发布"
		task.UpdatedAt = d.UpdatedAt
	}
	return db.Update(func(tx *bolt.Tx) error {
		if err := putJSON(tx.Bucket([]byte(contentFactoryBatchesBucket)), batch.ID, batch); err != nil {
			return err
		}
		if err := putJSON(tx.Bucket([]byte(contentFactoryDraftsBucket)), d.ID, d); err != nil {
			return err
		}
		if taskOK {
			return putJSON(tx.Bucket([]byte(contentFactoryTasksBucket)), task.ID, task)
		}
		return nil
	})
}

func listFactoryBatches() ([]FactoryBatch, error) {
	out := []FactoryBatch{}
	err := db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(contentFactoryBatchesBucket)).ForEach(func(_, v []byte) error {
			var x FactoryBatch
			if err := json.Unmarshal(v, &x); err != nil {
				return err
			}
			out = append(out, x)
			return nil
		})
	})
	sort.Slice(out, func(i, j int) bool { return out[i].PublishedAt > out[j].PublishedAt })
	return out, err
}
func rollbackFactoryBatch(id string, user User) error {
	var b FactoryBatch
	err := db.View(func(tx *bolt.Tx) error {
		v := tx.Bucket([]byte(contentFactoryBatchesBucket)).Get([]byte(id))
		if v == nil {
			return errors.New("导入批次不存在")
		}
		return json.Unmarshal(v, &b)
	})
	if err != nil {
		return err
	}
	if b.RolledBackAt != "" {
		return errors.New("该批次已经回滚")
	}
	if len(b.Snapshot) == 0 {
		return errors.New("首次导入没有旧版本快照，不能自动删除，请在内容工作台下架")
	}
	if b.ContentType == "article" {
		var x Article
		if err := json.Unmarshal(b.Snapshot, &x); err != nil {
			return err
		}
		if err := upsertArticles([]Article{x}); err != nil {
			return err
		}
	} else {
		var x ExamPaper
		if err := json.Unmarshal(b.Snapshot, &x); err != nil {
			return err
		}
		if _, err := saveExamPaper(x, user.Username); err != nil {
			return err
		}
	}
	b.RolledBackAt = time.Now().Format(time.RFC3339)
	b.RolledBackBy = user.Username
	return db.Update(func(tx *bolt.Tx) error { return putJSON(tx.Bucket([]byte(contentFactoryBatchesBucket)), b.ID, b) })
}
func factoryStats() (map[string]int, error) {
	stats := map[string]int{"tasks": 0, "queued": 0, "processing": 0, "review": 0, "failed": 0, "published": 0}
	tasks, err := listFactoryTasks()
	if err != nil {
		return stats, err
	}
	stats["tasks"] = len(tasks)
	for _, t := range tasks {
		stats[t.Status]++
	}
	batches, _ := listFactoryBatches()
	stats["published"] = len(batches)
	return stats, nil
}
func retryFactoryTask(id string) error {
	t, ok, err := getFactoryTask(id)
	if err != nil || !ok {
		return errors.New("任务不存在")
	}
	if t.Status == "processing" {
		return errors.New("任务正在运行")
	}
	t.Status = "queued"
	t.Progress = 0
	t.Error = ""
	t.CurrentStep = "等待重试"
	if err := updateFactoryTask(t); err != nil {
		return err
	}
	appendFactoryEvent(id, "info", "retry", "管理员重新提交任务", 0)
	enqueueFactoryTask(id)
	return nil
}

var _ = fmt.Sprintf
