package learning

// 数据库备份相关接口的 HTTP 集成测试：
// 匿名 401、学生 403、管理员 200，并验证备份文件真实落盘且通过 bbolt 一致性检查。

import (
	"net/http"
	"os"
	"testing"
)

func TestHTTPIntegrationAdminBackupEndpoints(t *testing.T) {
	env := newHTTPEnv(t)

	if status, _ := env.callJSON(http.MethodGet, "/api/admin/backups", "", ""); status != http.StatusUnauthorized {
		t.Fatalf("匿名读取备份列表应 401，实际 %d", status)
	}
	if status, _ := env.callJSON(http.MethodPost, "/api/admin/backup", "", ""); status != http.StatusUnauthorized {
		t.Fatalf("匿名触发备份应 401，实际 %d", status)
	}
	if status, _ := env.callJSON(http.MethodPost, "/api/admin/backup", "", env.token); status != http.StatusForbidden {
		t.Fatalf("学生触发备份应 403，实际 %d", status)
	}

	if _, err := env.store.updateUser(env.user.ID, UserUpdate{Role: "admin"}); err != nil {
		t.Fatalf("升级为管理员失败：%v", err)
	}

	status, payload := env.callJSON(http.MethodPost, "/api/admin/backup", "", env.token)
	if status != http.StatusOK {
		t.Fatalf("管理员触发备份应 200，实际 %d：%v", status, payload)
	}
	path := jsonString(t, payload, "path")
	if path == "" {
		t.Fatalf("备份响应缺少 path：%v", payload)
	}
	if _, err := os.Stat(path); err != nil {
		t.Fatalf("备份文件未落盘：%v", err)
	}
	if err := VerifyDatabase(path); err != nil {
		t.Fatalf("备份文件未通过一致性检查：%v", err)
	}

	status, payload = env.callJSON(http.MethodGet, "/api/admin/backups", "", env.token)
	if status != http.StatusOK {
		t.Fatalf("管理员读取备份列表应 200，实际 %d", status)
	}
	items, _ := payload["backups"].([]any)
	if len(items) != 1 {
		t.Fatalf("备份列表应含 1 条，实际 %v", payload["backups"])
	}
	first, _ := items[0].(map[string]any)
	if first["path"] != path {
		t.Fatalf("备份列表未包含刚生成的备份：%v", first)
	}
}
