package learning

// /api/dashboard 的 JSON 契约：空数据时 recent / weakest 必须是 []，不能是 null。
// 背景（2026-10-07 公网全站回归抓到的真缺陷）：新用户打开「学习报告」整页渲染抛
// TypeError: Cannot read properties of null (reading 'length')，根因是 Go 的 nil slice
// 被序列化成 null，前端 report.weakest.length 直接炸。这里把它钉成回归测试。

import (
	"net/http"
	"testing"
)

func TestHTTPIntegrationDashboardEmptyArraysAreNotNull(t *testing.T) {
	env := newHTTPEnv(t)

	status, payload := env.callJSON(http.MethodGet, "/api/dashboard", "", env.token)
	if status != http.StatusOK {
		t.Fatalf("空数据读取 dashboard 应 200，实际 %d：%v", status, payload)
	}
	for _, key := range []string{"recent", "weakest"} {
		value, ok := payload[key]
		if !ok {
			t.Fatalf("dashboard 缺少字段 %s：%v", key, payload)
		}
		list, isArray := value.([]any)
		if !isArray {
			t.Fatalf("dashboard.%s 空数据时必须是数组（不能是 null），实际 %T = %v", key, value, value)
		}
		if len(list) != 0 {
			t.Fatalf("空数据时 dashboard.%s 应为空数组，实际 %v", key, list)
		}
	}
}
