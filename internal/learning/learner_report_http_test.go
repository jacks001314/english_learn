package learning

// 家长/教师只读报告与学习日历的 HTTP 集成测试：
// 打真实路由，验证权限守卫（学生 403、管理员 200）、报告聚合口径与日历窗口。

import (
	"net/http"
	"testing"
)

func TestHTTPIntegrationLearnerReportAndCalendar(t *testing.T) {
	env := newHTTPEnv(t)

	// 学生自己的学习日历：窗口长度跟随 days 参数。
	status, payload := env.callJSON(http.MethodGet, "/api/learning/calendar?days=7", "", env.token)
	if status != http.StatusOK {
		t.Fatalf("学生读取学习日历应 200，实际 %d：%v", status, payload)
	}
	days, _ := payload["days"].([]any)
	if len(days) != 7 {
		t.Fatalf("日历应返回 7 天，实际 %v", payload["days"])
	}
	if jsonInt(t, payload, "activeDays") != 0 {
		t.Fatalf("尚无学习记录时活跃天数应为 0：%v", payload)
	}

	// 学生不能看家长/教师报告。
	if status, _ := env.callJSON(http.MethodGet, "/api/admin/learners/"+env.user.ID+"/report", "", env.token); status != http.StatusForbidden {
		t.Fatalf("学生访问家长/教师报告应 403，实际 %d", status)
	}

	// 家长/教师使用管理员角色访问；这里把接口测试学生升级为管理员。
	if _, err := env.store.updateUser(env.user.ID, UserUpdate{Role: "admin"}); err != nil {
		t.Fatalf("升级为管理员失败：%v", err)
	}
	if status, payload := env.callJSON(http.MethodPost, "/api/quiz/answer", `{"level":"primary","wordId":"apple","type":"en-zh","answer":"不知道"}`, env.token); status != http.StatusOK {
		t.Fatalf("提交答案应 200，实际 %d：%v", status, payload)
	}

	status, payload = env.callJSON(http.MethodGet, "/api/admin/learners/"+env.user.ID+"/report?days=7", "", env.token)
	if status != http.StatusOK {
		t.Fatalf("管理员读取学习者报告应 200，实际 %d：%v", status, payload)
	}
	if jsonInt(t, payload, "wrong") != 1 || jsonInt(t, payload, "correct") != 0 || jsonInt(t, payload, "practices") != 1 || jsonInt(t, payload, "accuracy") != 0 {
		t.Fatalf("报告作答口径不正确：%v", payload)
	}
	if jsonString(t, payload, "displayName") != "接口测试学生" {
		t.Fatalf("报告学习者信息不正确：%v", payload)
	}
	weakest, _ := payload["weakest"].([]any)
	if len(weakest) != 1 {
		t.Fatalf("薄弱词应命中 1 个，实际 %v", payload["weakest"])
	}
	first, _ := weakest[0].(map[string]any)
	word, _ := first["word"].(map[string]any)
	if word["id"] != "apple" {
		t.Fatalf("薄弱词应为 apple：%v", weakest[0])
	}
	calendar, _ := payload["calendar"].(map[string]any)
	if calendar == nil {
		t.Fatalf("报告应内嵌日历：%v", payload)
	}
	calDays, _ := calendar["days"].([]any)
	if len(calDays) != 7 {
		t.Fatalf("内嵌日历应有 7 天：%v", calendar)
	}
	last, _ := calDays[len(calDays)-1].(map[string]any)
	if last["practices"] != float64(1) || last["wrong"] != float64(1) || last["active"] != true {
		t.Fatalf("今天的日历格不正确：%v", last)
	}

	// 不存在的学习者 → 404。
	if status, _ := env.callJSON(http.MethodGet, "/api/admin/learners/nobody/report", "", env.token); status != http.StatusNotFound {
		t.Fatalf("不存在的学习者应 404，实际 %d", status)
	}
}
