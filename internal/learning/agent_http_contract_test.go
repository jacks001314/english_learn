package learning

// 本文件是「智能助教 × 页面」契约的 HTTP 端到端测试（对应
// docs/agent-ux-implementation-contract.md §1–§4 与 docs/agent-ux-optimization.md V3/V4/V7）。
//
// agent_card_test.go 只验证解析函数；这里真的搭起 Iris 路由、临时 BoltDB 与登录会话，
// 用确定性的假模型替换 codex-core，把整条链路跑通：
//
//	请求（页面上下文 + format=card）→ 学习快照 → 系统提示（场景要点 + 卡片指令）
//	→ 模型输出 → 卡片解析 / 一致性兜底 / 回执 → HTTP 响应 JSON
//
// 这样前后端并行开发时契约不会悄悄走形，也证明「模型不返回 JSON 时绝不白屏」。

import (
	"context"
	"encoding/json"
	"strings"
	"testing"
)

// stubAgentReply 用一段固定的模型输出替换真实模型调用，并把这次调用的
// 系统提示与用户提示记录下来，供断言「页面上下文真的注入了」。
type stubAgentReply struct {
	reply      string
	systemPmt  string
	userPrompt string
	calls      int
}

func stubAgent(t *testing.T, s *stubAgentReply) {
	t.Helper()
	old := runCodexAgentFn
	runCodexAgentFn = func(_ context.Context, _ string, cfg AgentConfig, prompt, threadID string, _ agentEmitter) (AgentChatResponse, error) {
		s.calls++
		s.systemPmt = cfg.SystemPrompt
		s.userPrompt = prompt
		return AgentChatResponse{
			Message: s.reply, ThreadID: threadID, Model: "stub-model",
			ProviderID: "stub-provider", Engine: "codex-core",
		}, nil
	}
	t.Cleanup(func() { runCodexAgentFn = old })
}

// enableAgent 打开智能体开关；默认配置是 Enabled=false，不打开就只能拿到 502。
func enableAgent(t *testing.T, env *httpEnv) {
	t.Helper()
	_, err := env.store.saveAgentConfig(AgentConfig{
		Enabled: true, Engine: "codex-core", ProviderID: "openai", Model: "stub-model",
		SystemPrompt: "你是面向中国中学生的英语学习助手。", TimeoutSeconds: 30, MaxPromptChars: 12000,
	}, env.user)
	if err != nil {
		t.Fatalf("saveAgentConfig: %v", err)
	}
}

// meaningContext 是「看词选义」页真实会发的上下文（对照契约 §5 的字段表）。
func meaningContext() map[string]any {
	return map[string]any{
		"view": "meaning-en-zh", "scene": "meaning", "level": "primary",
		"wordId": "apple", "spelling": "apple", "phonetic": "/ˈæpl/",
		"options":        []any{"苹果", "书", "猫", "狗"},
		"correctAnswer":  "苹果",
		"selectedAnswer": "书",
		"correct":        false,
		"position":       "第 1 / 4 题",
		"page":           1, "pages": 1, "pageSize": 12,
		"answered": 7, "sessionCorrect": 6, "scope": "小学",
		"pageMap": []any{
			map[string]any{"wordId": "apple", "spelling": "apple", "correct": false},
			map[string]any{"wordId": "cat", "spelling": "cat", "correct": true},
		},
	}
}

const cardReply = `{
  "kind": "explain",
  "headline": "apple 是「苹果」，注意和 pear（梨）区分",
  "verdict": "模型自己瞎写的判定，必须被服务端覆盖",
  "points": [
    {"label": "记忆线索", "text": "apple 读音开头像「阿婆」，阿婆在卖苹果。"},
    {"label": "易混对比", "text": "apple 苹果、pear 梨，都是水果但要分清。"}
  ],
  "example": {"en": "I eat an apple every day.", "zh": "我每天吃一个苹果。"},
  "check": {"prompt": "试着翻译：猫和狗都是动物。", "answer": "Cats and dogs are animals."},
  "words": [{"word": "Cat"}, {"word": "zzzznotaword"}],
  "action": {"label": "30 秒小动作", "text": "把例句读两遍。", "kind": "read"}
}`

// V3：请求带页面上下文 + format=card 时，响应必须是可渲染的教学卡片，
// 判定由服务端覆写，生词经过词库核对，回执说明读了哪些数据。
func TestHTTPAgentChatReturnsTeachingCard(t *testing.T) {
	env := newHTTPEnv(t)
	enableAgent(t, env)
	stub := &stubAgentReply{reply: cardReply}
	stubAgent(t, stub)

	body, err := json.Marshal(AgentChatRequest{
		Message: "为什么我选错了？", Mode: "meaning", QuickAction: "explain-wrong",
		Format: "card", Context: meaningContext(),
	})
	if err != nil {
		t.Fatal(err)
	}
	code, payload := env.callJSON("POST", "/api/agent/chat", string(body), env.token)
	if code != 200 {
		t.Fatalf("HTTP %d，响应：%v", code, payload)
	}
	if stub.calls != 1 {
		t.Fatalf("模型调用次数 = %d，想要 1", stub.calls)
	}

	card, ok := payload["card"].(map[string]any)
	if !ok {
		t.Fatalf("响应里没有 card 对象：%v", payload["card"])
	}
	if card["kind"] != "explain" {
		t.Fatalf("card.kind = %v，想要 explain", card["kind"])
	}
	if card["headline"] != "apple 是「苹果」，注意和 pear（梨）区分" {
		t.Fatalf("card.headline 被改动了：%v", card["headline"])
	}
	// 服务端覆写：模型写的判定不许出现在响应里。
	verdict, _ := card["verdict"].(string)
	if strings.Contains(verdict, "模型自己瞎写") {
		t.Fatalf("模型写的 verdict 泄漏到了响应：%q", verdict)
	}
	if !strings.Contains(verdict, "书") || !strings.Contains(verdict, "苹果") {
		t.Fatalf("verdict 应来自学习记录（选了「书」、正确「苹果」），实际：%q", verdict)
	}
	points, _ := card["points"].([]any)
	if len(points) != 2 {
		t.Fatalf("card.points 数量 = %d，想要 2", len(points))
	}
	if example, _ := card["example"].(map[string]any); example == nil || example["en"] == "" {
		t.Fatalf("card.example 缺失：%v", card["example"])
	}
	// 生词：词库能查到的补全 level/id/meaning，查不到又没出现在正文里的被丢掉。
	words, _ := card["words"].([]any)
	if len(words) != 1 {
		t.Fatalf("card.words 应只保留可核对的词，实际 %v", words)
	}
	word, _ := words[0].(map[string]any)
	if word["word"] != "cat" || word["meaning"] != "猫" || word["level"] != "primary" || word["id"] != "cat" {
		t.Fatalf("生词没有被词库补全：%v", word)
	}

	// V4：回执必须说明这次读了什么。
	receipt, ok := payload["receipt"].(map[string]any)
	if !ok {
		t.Fatalf("响应里没有 receipt：%v", payload["receipt"])
	}
	items, _ := receipt["items"].([]any)
	if len(items) == 0 {
		t.Fatal("receipt.items 为空")
	}
	seen := map[string]bool{}
	for _, raw := range items {
		item, _ := raw.(map[string]any)
		key, _ := item["key"].(string)
		seen[key] = true
		if item["ok"] == nil || item["label"] == "" {
			t.Fatalf("回执条目缺字段：%v", item)
		}
	}
	for _, key := range []string{"current", "history", "session", "page"} {
		if !seen[key] {
			t.Fatalf("回执缺少 %q 维度：%v", key, items)
		}
	}
	if receipt["stale"] == true {
		t.Fatal("刚发来的上下文不该被标记为过期")
	}

	// 快照原文：学生点开「助教已读」时看到的就是它。
	snapshotText, _ := payload["snapshotText"].(string)
	for _, want := range []string{"【当前题目】apple", "【本页全景】"} {
		if !strings.Contains(snapshotText, want) {
			t.Fatalf("snapshotText 缺少 %q：\n%s", want, snapshotText)
		}
	}
	if !strings.Contains(receipt["text"].(string), "【当前题目】") {
		t.Fatalf("receipt.text 应是快照原文：%v", receipt["text"])
	}

	// 注入给模型的提示：页面上下文 + 场景要点 + 卡片 JSON 指令。
	for _, want := range []string{"【当前题目】apple", "【本页全景】", "苹果"} {
		if !strings.Contains(stub.userPrompt, want) {
			t.Fatalf("用户提示里缺少 %q：\n%s", want, stub.userPrompt)
		}
	}
	for _, want := range []string{"教学卡片", "headline", "verdict"} {
		if !strings.Contains(stub.systemPmt, want) {
			t.Fatalf("系统提示里缺少卡片指令 %q：\n%s", want, stub.systemPmt)
		}
	}

	// 原始文本始终存在，前端在卡片解析失败时可以回落。
	if msg, _ := payload["message"].(string); !strings.Contains(msg, "apple 是「苹果」") {
		t.Fatalf("message 应保留模型原文：%v", payload["message"])
	}
}

// V3 的兜底：模型不听话、返回散文时，card 必须为 nil/缺失，message 保留原文，
// 前端回落到 Markdown 渲染——绝不允许白屏。
func TestHTTPAgentChatFallsBackToTextWhenCardUnparsable(t *testing.T) {
	env := newHTTPEnv(t)
	enableAgent(t, env)
	stub := &stubAgentReply{reply: "apple 的意思是苹果，可以记成「阿婆在卖苹果」。"}
	stubAgent(t, stub)

	body, _ := json.Marshal(AgentChatRequest{Message: "讲讲 apple", Mode: "meaning", Format: "card", Context: meaningContext()})
	code, payload := env.callJSON("POST", "/api/agent/chat", string(body), env.token)
	if code != 200 {
		t.Fatalf("HTTP %d，响应：%v", code, payload)
	}
	card, present := payload["card"]
	if present && card != nil {
		t.Fatalf("散文回复不该被解析成卡片：%v", card)
	}
	if payload["message"] != stub.reply {
		t.Fatalf("message 被改动了：%v", payload["message"])
	}
	if payload["receipt"] == nil {
		t.Fatal("即使卡片解析失败，回执也应保留（它证明助教确实读了页面）")
	}
}

// format=text 时必须保持纯文本模式：带上下文也不注入卡片指令。
func TestHTTPAgentChatTextFormatSkipsCard(t *testing.T) {
	env := newHTTPEnv(t)
	enableAgent(t, env)
	stub := &stubAgentReply{reply: "苹果，名词。"}
	stubAgent(t, stub)

	body, _ := json.Marshal(AgentChatRequest{Message: "讲讲 apple", Mode: "meaning", Format: "text", Context: meaningContext()})
	code, payload := env.callJSON("POST", "/api/agent/chat", string(body), env.token)
	if code != 200 {
		t.Fatalf("HTTP %d，响应：%v", code, payload)
	}
	if payload["card"] != nil {
		t.Fatalf("format=text 不该返回卡片：%v", payload["card"])
	}
	if strings.Contains(stub.systemPmt, "教学卡片") {
		t.Fatalf("format=text 不该注入卡片指令：\n%s", stub.systemPmt)
	}
	// 但页面上下文仍然要注入：文本模式也要看得见页面。
	if !strings.Contains(stub.userPrompt, "【当前题目】apple") {
		t.Fatalf("format=text 也要带上页面快照：\n%s", stub.userPrompt)
	}
}

// 没有页面上下文时不能假装读过快照：snapshot / receipt / snapshotText 都必须缺席。
func TestHTTPAgentChatWithoutContextHasNoReceipt(t *testing.T) {
	env := newHTTPEnv(t)
	enableAgent(t, env)
	stub := &stubAgentReply{reply: "你好，我是助教。"}
	stubAgent(t, stub)

	body, _ := json.Marshal(AgentChatRequest{Message: "你好", Mode: "general"})
	code, payload := env.callJSON("POST", "/api/agent/chat", string(body), env.token)
	if code != 200 {
		t.Fatalf("HTTP %d，响应：%v", code, payload)
	}
	for _, key := range []string{"card", "receipt", "snapshot", "snapshotText"} {
		if value, ok := payload[key]; ok && value != nil {
			t.Fatalf("无上下文时不该出现 %q：%v", key, value)
		}
	}
	if payload["message"] != stub.reply {
		t.Fatalf("message 被改动了：%v", payload["message"])
	}
}

// 六类新页面的状态胶囊依赖 snapshotText 里的场景信息（V5）：这里抽查
// 作业页与同步训练页，确认页面字段真的进了快照。
func TestHTTPAgentChatRendersPageScenes(t *testing.T) {
	cases := []struct {
		name    string
		context map[string]any
		want    string
	}{
		{
			name: "homework",
			context: map[string]any{
				"view": "homework", "scene": "homework",
				"homeworkId": "hw-1", "homeworkTitle": "第三单元作业",
				"questionIndex": 2, "questionType": "choice",
			},
			want: "【作业讲解】",
		},
		{
			name: "tongbu",
			context: map[string]any{
				"view": "tongbu", "scene": "tongbu",
				"setId": "set-9", "setTitle": "Unit 5 同步训练", "unitIndex": 3,
			},
			want: "【同步训练】",
		},
	}
	for _, item := range cases {
		t.Run(item.name, func(t *testing.T) {
			env := newHTTPEnv(t)
			enableAgent(t, env)
			stub := &stubAgentReply{reply: "看这道题：先找主语。"}
			stubAgent(t, stub)

			body, _ := json.Marshal(AgentChatRequest{Message: "这题怎么做", Mode: item.name, Context: item.context})
			code, payload := env.callJSON("POST", "/api/agent/chat", string(body), env.token)
			if code != 200 {
				t.Fatalf("HTTP %d，响应：%v", code, payload)
			}
			snapshotText, _ := payload["snapshotText"].(string)
			if !strings.Contains(snapshotText, item.want) {
				t.Fatalf("快照里缺少 %q：\n%s", item.want, snapshotText)
			}
			if !strings.Contains(stub.userPrompt, item.want) {
				t.Fatalf("注入模型的提示里缺少 %q：\n%s", item.want, stub.userPrompt)
			}
		})
	}
}

// 未启用的智能体必须给出可读的中文错误，而不是 500/空响应（前端据此显示提示）。
func TestHTTPAgentChatDisabledReturnsReadableError(t *testing.T) {
	env := newHTTPEnv(t)
	stub := &stubAgentReply{reply: "不该被调用"}
	stubAgent(t, stub)

	body, _ := json.Marshal(AgentChatRequest{Message: "你好", Mode: "general"})
	code, payload := env.callJSON("POST", "/api/agent/chat", string(body), env.token)
	if code == 200 {
		t.Fatalf("智能体未启用却返回 200：%v", payload)
	}
	if stub.calls != 0 {
		t.Fatalf("未启用时不该调用模型，实际调用 %d 次", stub.calls)
	}
	message, _ := payload["error"].(string)
	if !strings.Contains(message, "尚未启用") {
		t.Fatalf("错误信息不可读：%v", payload)
	}
}
