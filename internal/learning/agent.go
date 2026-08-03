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
	Engine               string `json:"engine"`
	Enabled              bool   `json:"enabled"`
	ProviderID           string `json:"providerId"`
	Model                string `json:"model"`
	BaseURL              string `json:"baseUrl,omitempty"`
	APIKey               string `json:"apiKey,omitempty"`
	SystemPrompt         string `json:"systemPrompt"`
	TimeoutSeconds       int    `json:"timeoutSeconds"`
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
	Message  string         `json:"message"`
	ThreadID string         `json:"threadId,omitempty"`
	Mode     string         `json:"mode,omitempty"`
	Context  map[string]any `json:"context,omitempty"`
}

type AgentChatResponse struct {
	Message      string `json:"message"`
	ThreadID     string `json:"threadId"`
	Model        string `json:"model,omitempty"`
	ProviderID   string `json:"providerId,omitempty"`
	Engine       string `json:"engine,omitempty"`
	InputTokens  int64  `json:"inputTokens,omitempty"`
	OutputTokens int64  `json:"outputTokens,omitempty"`
	DurationMS   int64  `json:"durationMs"`
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

var agentMu sync.Mutex

func defaultAgentConfig() AgentConfig {
	return AgentConfig{
		Enabled: false, Engine: "codex-core", ProviderID: "openai", Model: "gpt-5.6-terra", ClaudeModel: "claude-sonnet-4-5-20250929",
		SystemPrompt:   "你是面向中国中学生的英语学习助手。用清晰、鼓励、准确的中文讲解英语；根据学生水平控制难度；不要直接替学生完成考试中的作答，而应通过提示、拆解和反馈帮助其掌握知识。",
		TimeoutSeconds: 60, MaxPromptChars: 12000,
	}
}

func loadAgentConfig(revealSecret bool) (AgentConfig, error) {
	cfg := defaultAgentConfig()
	err := db.View(func(tx *bolt.Tx) error {
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

func saveAgentConfig(in AgentConfig, editor User) (AgentConfig, error) {
	current, err := loadAgentConfig(true)
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
	err = db.Update(func(tx *bolt.Tx) error { return putJSON(tx.Bucket([]byte(agentConfigBucket)), agentConfigKey, in) })
	if err != nil {
		return in, err
	}
	out := in
	out.APIKey = ""
	out.ClaudeAuthToken = ""
	return out, nil
}

func runAgent(ctx context.Context, root string, user User, in AgentChatRequest) (AgentChatResponse, error) {
	cfg, err := loadAgentConfig(true)
	if err != nil {
		return AgentChatResponse{}, err
	}
	if !cfg.Enabled {
		return AgentChatResponse{}, errors.New("智能学习助手尚未启用")
	}
	message := strings.TrimSpace(in.Message)
	if message == "" {
		return AgentChatResponse{}, errors.New("请输入问题")
	}
	if len([]rune(message)) > cfg.MaxPromptChars {
		return AgentChatResponse{}, fmt.Errorf("问题过长，最多允许 %d 个字符", cfg.MaxPromptChars)
	}
	prompt := buildLearningPrompt(message, in.Mode, in.Context)
	timeoutCtx, cancel := context.WithTimeout(ctx, time.Duration(cfg.TimeoutSeconds)*time.Second)
	defer cancel()
	if cfg.Engine == "claude-code" {
		return runClaudeAgent(timeoutCtx, root, cfg, prompt, in.ThreadID)
	}
	return runCodexAgent(timeoutCtx, root, cfg, prompt, in.ThreadID)
}

func runCodexAgent(ctx context.Context, root string, cfg AgentConfig, prompt, threadID string) (AgentChatResponse, error) {
	client, err := core.NewFromConfig(ctx, &core.ConfigOptions{
		CodexHome: filepath.Join(root, ".agent"), CWD: root, APIKey: cfg.APIKey,
		ProviderID: cfg.ProviderID, Model: cfg.Model, BaseURL: cfg.BaseURL,
		Persist: true, SessionRoot: filepath.Join(root, ".agent", "sessions"),
		Tools: &core.ToolOptions{Preset: core.ToolsNone},
	})
	if err != nil {
		return AgentChatResponse{}, err
	}
	defer client.Close()
	req := &core.Request{Prompt: prompt, Instructions: cfg.SystemPrompt}
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

func buildLearningPrompt(message, mode string, values map[string]any) string {
	labels := map[string]string{"general": "综合学习", "word": "单词学习", "reading": "文章阅读", "exam": "考试讲解", "writing": "作文辅导", "mistake": "错题分析"}
	label := labels[mode]
	if label == "" {
		label = labels["general"]
	}
	var contextText string
	if len(values) > 0 {
		if raw, err := json.Marshal(values); err == nil {
			contextText = string(raw)
		}
	}
	return fmt.Sprintf("学习场景：%s\n页面上下文：%s\n学生问题：%s", label, contextText, message)
}

func writeAgentAudit(user User, in AgentChatRequest, out AgentChatResponse, runErr error, started time.Time) {
	item := AgentAudit{ID: uuid.NewString(), UserID: user.ID, Username: user.Username, Mode: in.Mode, Engine: out.Engine, ThreadID: out.ThreadID, PromptChars: len([]rune(in.Message)), Model: out.Model, Success: runErr == nil, DurationMS: time.Since(started).Milliseconds(), CreatedAt: time.Now().Format(time.RFC3339)}
	if runErr != nil {
		item.Error = runErr.Error()
	}
	_ = db.Update(func(tx *bolt.Tx) error { return putJSON(tx.Bucket([]byte(agentAuditBucket)), item.ID, item) })
}

func initAgentDirectories(root string) error {
	return os.MkdirAll(filepath.Join(root, ".agent", "sessions"), 0700)
}
