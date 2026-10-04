package learning

import (
	"errors"
	"strings"
	"time"

	"github.com/kataras/iris/v12"
)

func (c *Controller) AgentStatus(ctx iris.Context) {
	cfg, err := c.store.loadAgentConfig(false)
	if err != nil {
		writeError(ctx, 500, "读取智能体状态失败")
		return
	}
	model := cfg.Model
	if cfg.Engine == "claude-code" {
		model = cfg.ClaudeModel
	}
	_ = ctx.JSON(iris.Map{"enabled": cfg.Enabled, "engine": cfg.Engine, "model": model, "providerId": cfg.ProviderID})
}

func (c *Controller) AgentChat(ctx iris.Context) {
	user, _ := c.store.currentUser(ctx)
	var in AgentChatRequest
	if ctx.ReadJSON(&in) != nil {
		writeError(ctx, 400, "请求格式错误")
		return
	}
	started := time.Now()
	// Model calls are limited by the concurrency gate inside runAgent; the
	// request itself is never serialised.
	out, err := c.store.runAgent(ctx.Request().Context(), c.root, user, in)
	c.store.writeAgentAudit(user, in, out, err, started)
	if err != nil {
		// A missing word or a missing page context is the caller's problem, not
		// a model outage; the practice page shows the reason verbatim.
		if errors.Is(err, errAgentRequest) {
			writeError(ctx, 400, strings.TrimPrefix(err.Error(), errAgentRequest.Error()+": "))
			return
		}
		writeError(ctx, 502, "智能助手调用失败："+err.Error())
		return
	}
	_ = ctx.JSON(out)
}

func (c *Controller) AdminAgentConfig(ctx iris.Context) {
	cfg, err := c.store.loadAgentConfig(false)
	if err != nil {
		writeError(ctx, 500, "读取智能体配置失败")
		return
	}
	_ = ctx.JSON(cfg)
}

func (c *Controller) AdminSaveAgentConfig(ctx iris.Context) {
	user, _ := c.store.currentUser(ctx)
	var in AgentConfig
	if ctx.ReadJSON(&in) != nil {
		writeError(ctx, 400, "配置格式错误")
		return
	}
	if strings.TrimSpace(in.APIKey) == "********" {
		in.APIKey = ""
	}
	out, err := c.store.saveAgentConfig(in, user)
	if err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	_ = c.store.writeAudit(user, "save_agent_config", "model="+out.Model+", provider="+out.ProviderID)
	_ = ctx.JSON(out)
}

func (c *Controller) AdminTestAgent(ctx iris.Context) {
	user, _ := c.store.currentUser(ctx)
	in := AgentChatRequest{Message: "请只回复：智能体连接正常。", Mode: "general"}
	started := time.Now()
	out, err := c.store.runAgent(ctx.Request().Context(), c.root, user, in)
	c.store.writeAgentAudit(user, in, out, err, started)
	if err != nil {
		writeError(ctx, 502, err.Error())
		return
	}
	_ = ctx.JSON(out)
}
