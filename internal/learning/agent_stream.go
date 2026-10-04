package learning

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"codex_core/core"
	"codex_core/model"
	"github.com/kataras/iris/v12"
)

// 流式输出。
//
// 模型回答一个问题通常要 6–30 秒，一次性返回时页面只能干等。这里把 codex-core
// 的增量事件转发成 SSE（Server-Sent Events），学生在“正在思考…”的位置就能看到
// 文字一块块出现；最终仍以同样的 AgentChatResponse 收尾，所以前端两条路径共用
// 同一套渲染与动作处理。

// agentEmitter forwards one incremental chunk. Returning an error aborts the run
// (used when the browser has gone away).
type agentEmitter func(string) error

// streamCodexRun runs one codex-core turn in streaming mode. It returns the same
// shape as the non-streaming path so callers do not branch on the transport.
func streamCodexRun(ctx context.Context, client *core.Client, req *core.Request, emit agentEmitter) (AgentChatResponse, error) {
	// A private cancel keeps the producer goroutine from leaking when the
	// consumer stops early (client disconnected).
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	started := time.Now()
	events, err := client.Stream(ctx, req)
	if err != nil {
		return AgentChatResponse{}, err
	}
	var (
		text                                 strings.Builder
		message, modelID, provider, threadID string
		inputTokens, outputTokens            int64
		runErr                               error
		completed                            bool
	)
	threadID = req.ThreadID
	for event := range events {
		switch event.Type {
		case core.EventModel:
			if event.ModelEvent == nil || event.ModelEvent.Kind != model.ResponsesStreamEventOutputText {
				continue
			}
			if event.ModelEvent.Delta == "" {
				continue
			}
			text.WriteString(event.ModelEvent.Delta)
			if emitErr := emit(event.ModelEvent.Delta); emitErr != nil {
				cancel()
				return AgentChatResponse{}, emitErr
			}
		case core.EventCompleted:
			completed = true
			if event.ThreadID != "" {
				threadID = event.ThreadID
			}
			if event.Response != nil {
				message, modelID, provider = event.Response.Message, event.Response.Model, event.Response.ProviderID
			}
			if event.Usage != nil {
				inputTokens, outputTokens = event.Usage.InputTokens, event.Usage.OutputTokens
			}
		case core.EventFailed:
			runErr = event.Error
		}
	}
	if runErr != nil {
		return AgentChatResponse{}, runErr
	}
	if !completed {
		return AgentChatResponse{}, errors.New("流式输出中断，请重试")
	}
	if strings.TrimSpace(message) == "" {
		// Some providers stream text without a final aggregated message; the
		// deltas we already forwarded are the answer.
		message = text.String()
	}
	return AgentChatResponse{
		Message: message, ThreadID: threadID, Model: modelID, ProviderID: provider,
		Engine: "codex-core", InputTokens: inputTokens, OutputTokens: outputTokens,
		DurationMS: time.Since(started).Milliseconds(),
	}, nil
}

// writeAgentSSE sends one event. The frontend reads `data: {json}` lines, and
// X-Accel-Buffering keeps nginx from holding the stream back.
func writeAgentSSE(ctx iris.Context, payload any) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	if _, err := ctx.Write([]byte("data: " + string(data) + "\n\n")); err != nil {
		return err
	}
	ctx.ResponseWriter().Flush()
	return nil
}

// AgentChatStream is the SSE twin of AgentChat. Text answers stream token by
// token; deterministic actions (加入今日复习) and drills arrive in one final
// event because there is nothing to stream.
func (c *Controller) AgentChatStream(ctx iris.Context) {
	user, _ := c.store.currentUser(ctx)
	var in AgentChatRequest
	if ctx.ReadJSON(&in) != nil {
		writeError(ctx, 400, "请求格式错误")
		return
	}
	started := time.Now()
	ctx.ContentType("text/event-stream")
	ctx.Header("Cache-Control", "no-cache")
	ctx.Header("Connection", "keep-alive")
	ctx.Header("X-Accel-Buffering", "no")
	ctx.ResponseWriter().Flush()

	disconnected := false
	emit := func(delta string) error {
		if disconnected {
			return errors.New("客户端已断开")
		}
		if err := writeAgentSSE(ctx, iris.Map{"type": "delta", "text": delta}); err != nil {
			disconnected = true
			return err
		}
		return nil
	}
	out, err := c.store.runAgentWith(ctx.Request().Context(), c.root, user, in, emit)
	c.store.writeAgentAudit(user, in, out, err, started)
	if err != nil {
		message := "智能助手调用失败：" + err.Error()
		if errors.Is(err, errAgentRequest) {
			message = strings.TrimPrefix(err.Error(), errAgentRequest.Error()+": ")
		}
		_ = writeAgentSSE(ctx, iris.Map{"type": "error", "message": message})
		return
	}
	_ = writeAgentSSE(ctx, iris.Map{"type": "done", "response": out})
}
