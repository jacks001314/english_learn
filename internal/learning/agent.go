package learning

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"codex_core/core"
	"github.com/google/uuid"
	claudeagent "github.com/roasbeef/claude-agent-sdk-go"
	bolt "go.etcd.io/bbolt"
)

const agentConfigKey = "default"

type AgentConfig struct {
	Engine         string `json:"engine"`
	Enabled        bool   `json:"enabled"`
	ProviderID     string `json:"providerId"`
	Model          string `json:"model"`
	BaseURL        string `json:"baseUrl,omitempty"`
	APIKey         string `json:"apiKey,omitempty"`
	SystemPrompt   string `json:"systemPrompt"`
	TimeoutSeconds int    `json:"timeoutSeconds"`
	// MaxConcurrentRuns caps how many model calls may run at the same time.
	// Deterministic actions (加入今日复习、词库兜底出题) never wait on it.
	MaxConcurrentRuns    int    `json:"maxConcurrentRuns,omitempty"`
	MaxPromptChars       int    `json:"maxPromptChars"`
	UpdatedAt            string `json:"updatedAt,omitempty"`
	UpdatedBy            string `json:"updatedBy,omitempty"`
	APIKeyConfigured     bool   `json:"apiKeyConfigured"`
	ClaudeModel          string `json:"claudeModel,omitempty"`
	ClaudeBaseURL        string `json:"claudeBaseUrl,omitempty"`
	ClaudeCLIPath        string `json:"claudeCliPath,omitempty"`
	ClaudeAuthToken      string `json:"claudeAuthToken,omitempty"`
	ClaudeAuthConfigured bool   `json:"claudeAuthConfigured"`
}

type AgentChatRequest struct {
	Message     string         `json:"message"`
	ThreadID    string         `json:"threadId,omitempty"`
	Mode        string         `json:"mode,omitempty"`
	QuickAction string         `json:"quickAction,omitempty"`
	Context     map[string]any `json:"context,omitempty"`
}

type AgentChatResponse struct {
	Message      string         `json:"message"`
	ThreadID     string         `json:"threadId"`
	Model        string         `json:"model,omitempty"`
	ProviderID   string         `json:"providerId,omitempty"`
	Engine       string         `json:"engine,omitempty"`
	InputTokens  int64          `json:"inputTokens,omitempty"`
	OutputTokens int64          `json:"outputTokens,omitempty"`
	DurationMS   int64          `json:"durationMs"`
	Actions      []AgentAction  `json:"actions,omitempty"`
	Drill        *AgentDrill    `json:"drill,omitempty"`
	Snapshot     *AgentSnapshot `json:"snapshot,omitempty"`
}

// AgentAction reports what the assistant did on the page (for example queuing
// the current word for review). The front end shows the result next to the
// question; nothing is applied silently.
type AgentAction struct {
	Type    string         `json:"type"`
	Status  string         `json:"status"`
	Message string         `json:"message,omitempty"`
	Payload map[string]any `json:"payload,omitempty"`
}

type AgentAudit struct {
	ID          string `json:"id"`
	UserID      string `json:"userId"`
	Username    string `json:"username"`
	Mode        string `json:"mode"`
	Engine      string `json:"engine"`
	ThreadID    string `json:"threadId"`
	PromptChars int    `json:"promptChars"`
	Model       string `json:"model"`
	Success     bool   `json:"success"`
	Error       string `json:"error,omitempty"`
	DurationMS  int64  `json:"durationMs"`
	CreatedAt   string `json:"createdAt"`
}

// 模型调用的并发闸门。
//
// 早期实现用一个全局互斥锁把整个 /api/agent/chat 串起来：一个学生等模型回话时，
// 另一个学生点“加入今日复习”这种纯本地动作也要排队。现在只有真正调用模型的那段
// 代码受闸门限制，容量由后台配置（MaxConcurrentRuns，默认 2）控制。
const (
	agentDefaultConcurrency = 2
	agentMaxConcurrency     = 8
)

var (
	agentGateMu    sync.Mutex
	agentGateSlots = make(chan struct{}, agentDefaultConcurrency)
)

// agentConcurrencyLimit resolves the configured model-call capacity.
func agentConcurrencyLimit(cfg AgentConfig) int {
	limit := cfg.MaxConcurrentRuns
	if limit <= 0 {
		limit = agentDefaultConcurrency
	}
	if limit > agentMaxConcurrency {
		limit = agentMaxConcurrency
	}
	return limit
}

// acquireAgentSlot waits for a free model slot, or gives up when the request is
// cancelled. The returned function must be called exactly once.
func acquireAgentSlot(ctx context.Context, limit int) (func(), error) {
	agentGateMu.Lock()
	if cap(agentGateSlots) != limit {
		agentGateSlots = make(chan struct{}, limit)
	}
	slots := agentGateSlots
	agentGateMu.Unlock()
	select {
	case slots <- struct{}{}:
		return func() { <-slots }, nil
	case <-ctx.Done():
		return nil, ctx.Err()
	}
}

func defaultAgentConfig() AgentConfig {
	return AgentConfig{
		Enabled: false, Engine: "codex-core", ProviderID: "openai", Model: "gpt-5.6-terra", ClaudeModel: "claude-sonnet-4-5-20250929",
		SystemPrompt:   "你是面向中国中学生的英语学习助手。用清晰、鼓励、准确的中文讲解英语；根据学生水平控制难度；不要直接替学生完成考试中的作答，而应通过提示、拆解和反馈帮助其掌握知识。",
		TimeoutSeconds: 60, MaxPromptChars: 12000,
	}
}

func (s *Store) loadAgentConfig(revealSecret bool) (AgentConfig, error) {
	cfg := defaultAgentConfig()
	err := s.db.View(func(tx *bolt.Tx) error {
		raw := tx.Bucket([]byte(agentConfigBucket)).Get([]byte(agentConfigKey))
		if raw == nil {
			return nil
		}
		return json.Unmarshal(raw, &cfg)
	})
	if err != nil {
		return cfg, err
	}
	cfg.APIKeyConfigured = strings.TrimSpace(cfg.APIKey) != ""
	cfg.ClaudeAuthConfigured = strings.TrimSpace(cfg.ClaudeAuthToken) != ""
	if cfg.Engine == "" {
		cfg.Engine = "codex-core"
	}
	if !revealSecret {
		cfg.APIKey = ""
		cfg.ClaudeAuthToken = ""
	}
	return cfg, nil
}

func (s *Store) saveAgentConfig(in AgentConfig, editor User) (AgentConfig, error) {
	current, err := s.loadAgentConfig(true)
	if err != nil {
		return in, err
	}
	if strings.TrimSpace(in.APIKey) == "" {
		in.APIKey = current.APIKey
	}
	if strings.TrimSpace(in.ClaudeAuthToken) == "" {
		in.ClaudeAuthToken = current.ClaudeAuthToken
	}
	if in.Engine == "" {
		in.Engine = "codex-core"
	}
	if in.Engine != "codex-core" && in.Engine != "claude-code" {
		return in, errors.New("不支持的智能体引擎")
	}
	if in.TimeoutSeconds < 5 {
		in.TimeoutSeconds = 5
	}
	if in.TimeoutSeconds > 300 {
		in.TimeoutSeconds = 300
	}
	if in.MaxPromptChars < 1000 {
		in.MaxPromptChars = 1000
	}
	if in.MaxPromptChars > 50000 {
		in.MaxPromptChars = 50000
	}
	if strings.TrimSpace(in.ProviderID) == "" {
		in.ProviderID = "openai"
	}
	if in.Engine == "codex-core" && strings.TrimSpace(in.Model) == "" {
		return in, errors.New("模型不能为空")
	}
	if in.Engine == "claude-code" && strings.TrimSpace(in.ClaudeModel) == "" {
		return in, errors.New("Claude 模型不能为空")
	}
	if strings.TrimSpace(in.SystemPrompt) == "" {
		return in, errors.New("系统提示词不能为空")
	}
	in.UpdatedAt = time.Now().Format(time.RFC3339)
	in.UpdatedBy = editor.Username
	in.APIKeyConfigured = strings.TrimSpace(in.APIKey) != ""
	in.ClaudeAuthConfigured = strings.TrimSpace(in.ClaudeAuthToken) != ""
	err = s.db.Update(func(tx *bolt.Tx) error { return putJSON(tx.Bucket([]byte(agentConfigBucket)), agentConfigKey, in) })
	if err != nil {
		return in, err
	}
	out := in
	out.APIKey = ""
	out.ClaudeAuthToken = ""
	return out, nil
}

func (s *Store) runAgent(ctx context.Context, root string, user User, in AgentChatRequest) (AgentChatResponse, error) {
	return s.runAgentWith(ctx, root, user, in, nil)
}

// runAgentWith is the single implementation behind both the JSON endpoint and
// the SSE endpoint. When emit is non-nil the reply is streamed token by token;
// emit may return an error (a disconnected client) which aborts the run.
func (s *Store) runAgentWith(ctx context.Context, root string, user User, in AgentChatRequest, emit agentEmitter) (AgentChatResponse, error) {
	cfg, err := s.loadAgentConfig(true)
	if err != nil {
		return AgentChatResponse{}, err
	}
	quick := agentQuickActionName(in.QuickAction)
	message := strings.TrimSpace(in.Message)
	if message == "" && quick == "" {
		return AgentChatResponse{}, agentRequestError("请输入问题")
	}
	if len([]rune(message)) > cfg.MaxPromptChars {
		return AgentChatResponse{}, agentRequestError("问题过长，最多允许 %d 个字符", cfg.MaxPromptChars)
	}

	started := time.Now()
	// The snapshot is only built when the page actually sent context. The
	// homework grader and the admin connection test call runAgent without any
	// page state and must keep their original, minimal prompt.
	var snapshot AgentSnapshot
	hasSnapshot := len(in.Context) > 0
	if hasSnapshot {
		snapshot = s.buildAgentSnapshot(user, in, started)
	}

	switch quick {
	case agentQuickAddReview:
		action, err := s.agentQueueReviewAction(user, snapshot, started)
		if err != nil {
			return AgentChatResponse{}, err
		}
		return AgentChatResponse{
			Message: action.Message, ThreadID: in.ThreadID, Engine: "local-action",
			DurationMS: time.Since(started).Milliseconds(),
			Actions:    []AgentAction{action}, Snapshot: agentSnapshotPtr(snapshot, hasSnapshot),
		}, nil
	case agentQuickDrill:
		if !cfg.Enabled {
			return AgentChatResponse{}, errors.New("智能学习助手尚未启用")
		}
		drill, err := s.buildAgentDrill(ctx, root, cfg, user, in, started)
		if err != nil {
			return AgentChatResponse{}, err
		}
		note := drill.Note
		if drill.Focus != "" {
			note = drill.Focus + "\n\n" + note
		}
		return AgentChatResponse{
			Message: note, ThreadID: in.ThreadID, Engine: cfg.Engine, Model: cfg.Model,
			DurationMS: time.Since(started).Milliseconds(), Drill: drill,
			Snapshot: agentSnapshotPtr(snapshot, hasSnapshot),
		}, nil
	}

	if !cfg.Enabled {
		return AgentChatResponse{}, errors.New("智能学习助手尚未启用")
	}
	if message == "" {
		message = agentDefaultMessage(quick, snapshot)
	}
	if message == "" {
		return AgentChatResponse{}, agentRequestError("请输入问题")
	}
	snapshotText := ""
	if hasSnapshot {
		snapshotText = renderAgentSnapshot(snapshot)
	}
	prompt := buildLearningPrompt(message, in.Mode, snapshotText)
	// A scene-aware brief is only appended when we know the scene; the homework
	// grader keeps the administrator's plain system prompt. cfg is a value copy,
	// so this cannot leak back into the stored configuration.
	if hasSnapshot {
		cfg.SystemPrompt = agentInstructions(cfg, snapshot.Scene)
	}
	timeoutCtx, cancel := context.WithTimeout(ctx, time.Duration(cfg.TimeoutSeconds)*time.Second)
	defer cancel()
	var out AgentChatResponse
	if cfg.Engine == "claude-code" {
		// Claude 引擎没有暴露增量的回调，命中片段一次性返回。
		out, err = runClaudeAgent(timeoutCtx, root, cfg, prompt, in.ThreadID)
		if err == nil && emit != nil && strings.TrimSpace(out.Message) != "" {
			err = emit(out.Message)
		}
	} else {
		out, err = runCodexAgent(timeoutCtx, root, cfg, prompt, in.ThreadID, emit)
	}
	if err != nil {
		return AgentChatResponse{}, err
	}
	out.Snapshot = agentSnapshotPtr(snapshot, hasSnapshot)
	if hasSnapshot && strings.TrimSpace(out.Message) != "" {
		// 记忆沉淀：把这次讲解压缩成一条助教笔记，下次遇到同一个词可以直接接着讲。
		// 失败不影响回答本身，所以只记日志意义的错误。
		if _, noteErr := s.recordTutorNote(user.ID, snapshot, message, out.Message, started); noteErr != nil {
			_ = noteErr
		}
	}
	return out, nil
}

// codexConfigOptions builds the codex-core client configuration. Streaming has to
// be requested when the client is created: codex-core only asks the provider for
// SSE chunks when the agent runner's Stream flag is set, so a client built
// without it reports just the final event and the SSE endpoint would have
// nothing to forward.
func codexConfigOptions(root string, cfg AgentConfig, stream bool) *core.ConfigOptions {
	return &core.ConfigOptions{
		CodexHome: filepath.Join(root, ".agent"), CWD: root, APIKey: cfg.APIKey,
		ProviderID: cfg.ProviderID, Model: cfg.Model, BaseURL: cfg.BaseURL,
		Stream:  stream,
		Persist: true, SessionRoot: filepath.Join(root, ".agent", "sessions"),
		Tools: &core.ToolOptions{Preset: core.ToolsNone},
	}
}

func runCodexAgent(ctx context.Context, root string, cfg AgentConfig, prompt, threadID string, emit agentEmitter) (AgentChatResponse, error) {
	client, err := core.NewFromConfig(ctx, codexConfigOptions(root, cfg, emit != nil))
	if err != nil {
		return AgentChatResponse{}, err
	}
	defer client.Close()
	req := &core.Request{Prompt: prompt, Instructions: cfg.SystemPrompt, ThreadID: threadID}
	// Only the model call itself takes a slot; everything else in the request
	// (page context, review queueing, library fallback) runs unthrottled.
	release, err := acquireAgentSlot(ctx, agentConcurrencyLimit(cfg))
	if err != nil {
		return AgentChatResponse{}, err
	}
	defer release()
	if emit != nil {
		return streamCodexRun(ctx, client, req, emit)
	}
	var result *core.Result
	if strings.TrimSpace(threadID) == "" {
		result, err = client.Run(ctx, req)
	} else {
		result, err = client.ResumeThread(ctx, threadID, req)
	}
	if err != nil {
		return AgentChatResponse{}, err
	}
	return AgentChatResponse{Message: result.Response.Message, ThreadID: result.ThreadID, Model: result.Response.Model, ProviderID: result.Response.ProviderID, Engine: "codex-core", InputTokens: result.Usage.InputTokens, OutputTokens: result.Usage.OutputTokens, DurationMS: result.Duration.Milliseconds()}, nil
}

func runClaudeAgent(ctx context.Context, root string, cfg AgentConfig, prompt, threadID string) (AgentChatResponse, error) {
	release, err := acquireAgentSlot(ctx, agentConcurrencyLimit(cfg))
	if err != nil {
		return AgentChatResponse{}, err
	}
	defer release()
	options := []claudeagent.Option{
		claudeagent.WithSystemPrompt(cfg.SystemPrompt), claudeagent.WithModel(cfg.ClaudeModel),
		claudeagent.WithMaxTurns(1), claudeagent.WithPermissionMode(claudeagent.PermissionModePlan),
		claudeagent.WithDisallowedTools([]string{"Bash", "Read", "Write", "Edit", "Glob", "Grep", "WebFetch", "WebSearch", "Task", "NotebookEdit"}),
	}
	if cfg.ClaudeCLIPath != "" {
		options = append(options, claudeagent.WithCLIPath(cfg.ClaudeCLIPath))
	}
	if cfg.ClaudeAuthToken != "" {
		// The admin field accepts either an Anthropic API key or a Claude Code
		// OAuth token. OAuth tokens must use their dedicated environment name.
		env := map[string]string{}
		token := strings.TrimSpace(cfg.ClaudeAuthToken)
		if strings.HasPrefix(token, "sk-ant-oat") || strings.HasPrefix(token, "oauth") {
			env["CLAUDE_CODE_OAUTH_TOKEN"] = token
		} else {
			env["ANTHROPIC_API_KEY"] = token
		}
		if strings.TrimSpace(cfg.ClaudeBaseURL) != "" {
			env["ANTHROPIC_BASE_URL"] = strings.TrimSpace(cfg.ClaudeBaseURL)
		}
		options = append(options, claudeagent.WithEnv(env))
	} else if strings.TrimSpace(cfg.ClaudeBaseURL) != "" {
		options = append(options, claudeagent.WithEnv(map[string]string{"ANTHROPIC_BASE_URL": strings.TrimSpace(cfg.ClaudeBaseURL)}))
	}
	if threadID != "" {
		options = append(options, claudeagent.WithResume(threadID))
	}
	client, err := claudeagent.NewClient(options...)
	if err != nil {
		return AgentChatResponse{}, err
	}
	defer client.Close()
	started := time.Now()
	var answer, sessionID string
	var resultErr error
	for msg := range client.Query(ctx, prompt) {
		switch item := msg.(type) {
		case claudeagent.AssistantMessage:
			if item.Error != "" {
				resultErr = fmt.Errorf("Claude Code assistant error: %s", item.Error)
			}
			if text := strings.TrimSpace(item.ContentText()); text != "" {
				answer = text
			}
			if item.SessionID != "" {
				sessionID = item.SessionID
			}
		case claudeagent.ResultMessage:
			if item.SessionID != "" {
				sessionID = item.SessionID
			}
			if item.IsError || strings.HasPrefix(item.Subtype, "error") {
				resultErr = fmt.Errorf("Claude Code: %s", strings.Join(item.Errors, "; "))
			}
			if answer == "" && item.Result != "" {
				answer = item.Result
			}
		}
	}
	if resultErr != nil {
		return AgentChatResponse{}, resultErr
	}
	if answer == "" {
		return AgentChatResponse{}, errors.New("Claude Code 未返回文本回复，请检查 Base URL、模型、Token 类型和 CLI 路径")
	}
	return AgentChatResponse{Message: answer, ThreadID: sessionID, Model: cfg.ClaudeModel, ProviderID: "anthropic", Engine: "claude-code", DurationMS: time.Since(started).Milliseconds()}, nil
}

func buildLearningPrompt(message, mode, snapshotText string) string {
	labels := map[string]string{
		"general": "综合学习", "word": "单词学习", "meaning": "词义练习", "quiz": "单词测验",
		"spelling": "拼写练习", "reading": "文章阅读", "exam": "考试讲解", "writing": "作文辅导",
		"mistake": "错题分析", "homework": "作业批改",
	}
	label := labels[mode]
	if label == "" {
		label = labels["general"]
	}
	var b strings.Builder
	b.WriteString("学习场景：" + label + "\n")
	if strings.TrimSpace(snapshotText) == "" {
		b.WriteString("页面上下文：学生当前没有打开具体练习页面。\n")
	} else {
		// 学习记录来自平台数据库，页面自报的字段只用来定位，数值以服务端为准。
		b.WriteString("学习记录（来自平台数据库，请以此为准）：\n" + snapshotText + "\n")
	}
	b.WriteString("学生问题：" + message)
	return b.String()
}

// agentSnapshotPtr returns nil when the page sent no context, so the response
// never claims to have read a snapshot that was not built.
func agentSnapshotPtr(snapshot AgentSnapshot, ok bool) *AgentSnapshot {
	if !ok {
		return nil
	}
	return &snapshot
}

// agentQueueReviewAction puts the word on screen into today's review queue.
// It is deterministic on purpose: the learner asked for it explicitly, so no
// model call is involved and the answer is immediate.
func (s *Store) agentQueueReviewAction(user User, snapshot AgentSnapshot, now time.Time) (AgentAction, error) {
	item := snapshot.Current
	if item == nil || item.Spelling == "" {
		return AgentAction{}, agentRequestError("页面没有提供要加入复习的单词")
	}
	saved, err := NewService(s, user.ID).QueueReview(item.Level, item.WordID, now)
	if err != nil {
		return AgentAction{}, agentRequestError("加入复习失败：%s", err.Error())
	}
	message := fmt.Sprintf("已把「%s」加入今日复习，打开「今日复习」就能看到它。", item.Spelling)
	if saved.ReviewCount > 0 {
		message = fmt.Sprintf("已把「%s」加入今日复习（累计复习 %d 次），打开「今日复习」就能看到它。", item.Spelling, saved.ReviewCount)
	}
	return AgentAction{
		Type: "add-review", Status: "ok", Message: message,
		Payload: map[string]any{"level": item.Level, "wordId": item.WordID, "spelling": item.Spelling, "nextReview": saved.NextReview},
	}, nil
}

// runTextAgent runs one prompt through the configured engine and returns the
// raw text. It backs the structured helpers (drill planning) that need a JSON
// answer instead of a chat turn; the caller supplies the instructions.
func runTextAgent(ctx context.Context, root string, cfg AgentConfig, prompt, instructions string) (string, error) {
	// cfg is a value copy, so overriding the system prompt here cannot leak
	// into the administrator's stored configuration.
	cfg.SystemPrompt = instructions
	if cfg.Engine == "claude-code" {
		out, err := runClaudeAgent(ctx, root, cfg, prompt, "")
		if err != nil {
			return "", err
		}
		return out.Message, nil
	}
	out, err := runCodexAgent(ctx, root, cfg, prompt, "", nil)
	if err != nil {
		return "", err
	}
	return out.Message, nil
}

func (s *Store) writeAgentAudit(user User, in AgentChatRequest, out AgentChatResponse, runErr error, started time.Time) {
	item := AgentAudit{ID: uuid.NewString(), UserID: user.ID, Username: user.Username, Mode: in.Mode, Engine: out.Engine, ThreadID: out.ThreadID, PromptChars: len([]rune(in.Message)), Model: out.Model, Success: runErr == nil, DurationMS: time.Since(started).Milliseconds(), CreatedAt: time.Now().Format(time.RFC3339)}
	if runErr != nil {
		item.Error = runErr.Error()
	}
	_ = s.db.Update(func(tx *bolt.Tx) error { return putJSON(tx.Bucket([]byte(agentAuditBucket)), item.ID, item) })
}

func initAgentDirectories(root string) error {
	return os.MkdirAll(filepath.Join(root, ".agent", "sessions"), 0700)
}
