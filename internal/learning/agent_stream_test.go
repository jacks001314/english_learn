package learning

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"codex_core/core"
	"codex_core/model"
)

// stubStreamAgent mimics a provider that streams text deltas and then returns
// the aggregated message.
type stubStreamAgent struct {
	chunks []string
	fail   bool
}

func (s stubStreamAgent) Run(_ context.Context, request *model.AgentRequest) (*model.AgentResponse, error) {
	if request.StreamHandler != nil {
		for _, chunk := range s.chunks {
			request.StreamHandler(&model.ResponsesStreamEvent{Kind: model.ResponsesStreamEventOutputText, Delta: chunk})
		}
	}
	if s.fail {
		return nil, errors.New("模型挂了")
	}
	return &model.AgentResponse{Message: strings.Join(s.chunks, ""), Model: "stub-model", ProviderID: "stub-provider"}, nil
}

func newStubClient(t *testing.T, agent stubStreamAgent) *core.Client {
	t.Helper()
	client, err := core.New(&core.Options{Agent: agent})
	if err != nil {
		t.Fatal(err)
	}
	return client
}

// 流式输出必须把模型的增量原样转发，并且最终仍然给出完整的回答。
func TestStreamCodexRunForwardsDeltas(t *testing.T) {
	client := newStubClient(t, stubStreamAgent{chunks: []string{"你", "好", "，同学"}})
	var got []string
	out, err := streamCodexRun(context.Background(), client, &core.Request{Prompt: "你好"}, func(delta string) error {
		got = append(got, delta)
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if strings.Join(got, "") != "你好，同学" {
		t.Fatalf("deltas were not forwarded: %v", got)
	}
	if out.Message != "你好，同学" || out.Model != "stub-model" || out.ProviderID != "stub-provider" || out.Engine != "codex-core" {
		t.Fatalf("unexpected final response: %+v", out)
	}
}

// 学生关掉页面就该停止生成，而不是继续把结果写进已断开的连接。
func TestStreamCodexRunStopsWhenEmitterFails(t *testing.T) {
	client := newStubClient(t, stubStreamAgent{chunks: []string{"一", "二", "三"}})
	calls := 0
	_, err := streamCodexRun(context.Background(), client, &core.Request{Prompt: "x"}, func(string) error {
		calls++
		return errors.New("客户端已断开")
	})
	if err == nil {
		t.Fatal("a failed emitter must abort the run")
	}
	if calls != 1 {
		t.Fatalf("emitter kept receiving chunks after failure: %d", calls)
	}
}

// 模型报错必须冒泡，前端才能显示原因并回退到非流式接口。
func TestStreamCodexRunSurfacesModelErrors(t *testing.T) {
	client := newStubClient(t, stubStreamAgent{chunks: []string{"半"}, fail: true})
	if _, err := streamCodexRun(context.Background(), client, &core.Request{Prompt: "x"}, func(string) error { return nil }); err == nil {
		t.Fatal("model failures must not be swallowed")
	}
}

// 并发闸门：容量满了就等待，且不会超发。
func TestAgentSlotGateLimitsConcurrency(t *testing.T) {
	release, err := acquireAgentSlot(context.Background(), 1)
	if err != nil {
		t.Fatal(err)
	}
	waitCtx, cancel := context.WithTimeout(context.Background(), 60*time.Millisecond)
	defer cancel()
	if _, err := acquireAgentSlot(waitCtx, 1); err == nil {
		t.Fatal("the gate admitted more runs than its limit")
	}
	release()
	next, err := acquireAgentSlot(context.Background(), 1)
	if err != nil {
		t.Fatal(err)
	}
	next()
}

func TestAgentConcurrencyLimitDefaultsAndClamps(t *testing.T) {
	if got := agentConcurrencyLimit(AgentConfig{}); got != agentDefaultConcurrency {
		t.Fatalf("empty config should fall back to the default, got %d", got)
	}
	if got := agentConcurrencyLimit(AgentConfig{MaxConcurrentRuns: 99}); got != agentMaxConcurrency {
		t.Fatalf("limit must be clamped, got %d", got)
	}
	if got := agentConcurrencyLimit(AgentConfig{MaxConcurrentRuns: 3}); got != 3 {
		t.Fatalf("configured limit ignored, got %d", got)
	}
}

// 流式端点必须在构造客户端时就打开流式：codex-core 只有 Stream 置位才会
// 向供应商请求 SSE 增量，否则只回调最终结果（线上实测正是这个问题）。
func TestCodexConfigOptionsEnableStreamingOnlyWhenEmitting(t *testing.T) {
	streaming := codexConfigOptions("root", AgentConfig{APIKey: "k", Model: "m"}, true)
	if !streaming.Stream {
		t.Fatal("the SSE path must build a streaming client")
	}
	if streaming.Model != "m" || streaming.APIKey != "k" || !streaming.Persist || streaming.CWD != "root" {
		t.Fatalf("config fields were dropped: %+v", streaming)
	}
	if plain := codexConfigOptions("root", AgentConfig{}, false); plain.Stream {
		t.Fatal("the JSON endpoint must keep the non-streaming client")
	}
}
