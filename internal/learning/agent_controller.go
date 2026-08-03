package learning

import (
	"strings"
	"time"

	"github.com/kataras/iris/v12"
)

func (c *Controller) AgentStatus(ctx iris.Context) {
	cfg, err := loadAgentConfig(false)
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
	user, _ := currentUser(ctx)
	var in AgentChatRequest
	if ctx.ReadJSON(&in) != nil {
		writeError(ctx, 400, "请求格式错误")
		return
	}
	started := time.Now()
	agentMu.Lock()
	out, err := runAgent(ctx.Request().Context(), c.root, user, in)
	agentMu.Unlock()
	writeAgentAudit(user, in, out, err, started)
	if err != nil {
		writeError(ctx, 502, "智能助手调用失败："+err.Error())
		return
	}
	_ = ctx.JSON(out)
}

func (c *Controller) AdminAgentConfig(ctx iris.Context) {
	cfg, err := loadAgentConfig(false)
	if err != nil {
		writeError(ctx, 500, "读取智能体配置失败")
		return
	}
	_ = ctx.JSON(cfg)
}

func (c *Controller) AdminSaveAgentConfig(ctx iris.Context) {
	user, _ := currentUser(ctx)
	var in AgentConfig
	if ctx.ReadJSON(&in) != nil {
		writeError(ctx, 400, "配置格式错误")
		return
	}
	if strings.TrimSpace(in.APIKey) == "********" {
		in.APIKey = ""
	}
	out, err := saveAgentConfig(in, user)
	if err != nil {
		writeError(ctx, 400, err.Error())
		return
	}
	_ = writeAudit(user, "save_agent_config", "model="+out.Model+", provider="+out.ProviderID)
	_ = ctx.JSON(out)
}

func (c *Controller) AdminTestAgent(ctx iris.Context) {
	user, _ := currentUser(ctx)
	in := AgentChatRequest{Message: "请只回复：智能体连接正常。", Mode: "general"}
	started := time.Now()
	agentMu.Lock()
	out, err := runAgent(ctx.Request().Context(), c.root, user, in)
	agentMu.Unlock()
	writeAgentAudit(user, in, out, err, started)
	if err != nil {
		writeError(ctx, 502, err.Error())
		return
	}
	_ = ctx.JSON(out)
}
