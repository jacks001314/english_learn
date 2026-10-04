package learning

// 本文件是 HTTP 接口层的集成测试（plan.md「P2：工程质量与交付」第 1 项）。
//
// 与既有的单元测试不同，这里会真的搭起 Iris 路由、临时 BoltDB 和登录会话，
// 用 Cookie 走完整的鉴权链路去打接口，覆盖：
//   - 注册 / 登录 / 会话 / 管理员权限守卫
//   - 词义练习的练习来源筛选（source=mistakes|unmastered）与跨用户隔离
//   - 判分接口写学习记录、错题本与订正
//   - 词库分页与单词详情
// 所有数据都写在 t.TempDir() 的临时库里，不碰项目的 english_learn.db。

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/kataras/iris/v12"
	bolt "go.etcd.io/bbolt"
)

type httpEnv struct {
	t     *testing.T
	app   *iris.Application
	store *Store
	user  User
	token string
}

// newHTTPEnv 准备一个可用的接口测试环境：确定性词库 + 临时 BoltDB + 已登录学生。
func newHTTPEnv(t *testing.T) *httpEnv {
	store := &Store{}
	t.Helper()
	oldDB, oldDatasets, oldIndex := store.db, store.datasets, store.wordIndex
	t.Cleanup(func() { store.db, store.datasets, store.wordIndex = oldDB, oldDatasets, oldIndex })

	database, err := bolt.Open(filepath.Join(t.TempDir(), "http.db"), 0600, nil)
	if err != nil {
		t.Fatalf("open bolt: %v", err)
	}
	t.Cleanup(func() { database.Close() })
	store.db = database
	if err := initDB(store.db); err != nil {
		t.Fatalf("initDB: %v", err)
	}

	store.datasets = map[string][]Word{
		"primary": {
			{ID: "apple", Word: "apple", Meaning: "苹果", Phonetic: "/ˈæpl/", Pos: "n."},
			{ID: "book", Word: "book", Meaning: "书", Phonetic: "/bʊk/", Pos: "n."},
			{ID: "cat", Word: "cat", Meaning: "猫", Phonetic: "/kæt/", Pos: "n."},
			{ID: "dog", Word: "dog", Meaning: "狗", Phonetic: "/dɒɡ/", Pos: "n."},
		},
		"middle": {
			{ID: "improve", Word: "improve", Meaning: "改善", Phonetic: "/ɪmˈpruːv/", Pos: "v."},
			{ID: "knowledge", Word: "knowledge", Meaning: "知识", Phonetic: "/ˈnɒlɪdʒ/", Pos: "n."},
			{ID: "honest", Word: "honest", Meaning: "诚实的", Phonetic: "/ˈɒnɪst/", Pos: "adj."},
			{ID: "quickly", Word: "quickly", Meaning: "快速地", Phonetic: "/ˈkwɪkli/", Pos: "adv."},
		},
	}
	store.wordIndex = map[string]Word{}
	for level, list := range store.datasets {
		for _, w := range list {
			w.Level = level
			store.wordIndex[progressKey(level, w.ID)] = w
		}
	}

	user, err := store.createUser(AuthRequest{Username: "httpstudent", Password: "password123", DisplayName: "接口测试学生"})
	if err != nil {
		t.Fatalf("createUser: %v", err)
	}
	token, err := store.newSession(user.ID)
	if err != nil {
		t.Fatalf("newSession: %v", err)
	}

	root := t.TempDir()
	if err := os.MkdirAll(filepath.Join(root, "web"), 0700); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(root, "web", "index.html"), []byte("<html></html>"), 0600); err != nil {
		t.Fatal(err)
	}

	app := newApp(store, root)
	if err := app.Build(); err != nil {
		t.Fatalf("build app: %v", err)
	}
	return &httpEnv{t: t, app: app, store: store, user: user, token: token}
}

func (e *httpEnv) call(method, target, body, cookie string) *httptest.ResponseRecorder {
	var reader io.Reader
	if body != "" {
		reader = strings.NewReader(body)
	}
	req := httptest.NewRequest(method, target, reader)
	if body != "" {
		req.Header.Set("Content-Type", "application/json")
	}
	if cookie != "" {
		req.AddCookie(&http.Cookie{Name: sessionCookie, Value: cookie})
	}
	rec := httptest.NewRecorder()
	e.app.ServeHTTP(rec, req)
	return rec
}

func (e *httpEnv) callAsStudent(method, target, body string) *httptest.ResponseRecorder {
	return e.call(method, target, body, e.token)
}

// callJSON 断言响应是 JSON 对象并返回解码结果。
func (e *httpEnv) callJSON(method, target, body, cookie string) (int, map[string]any) {
	rec := e.call(method, target, body, cookie)
	var payload map[string]any
	if rec.Body.Len() > 0 {
		if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
			e.t.Fatalf("%s %s: 响应不是 JSON 对象（HTTP %d）：%s", method, target, rec.Code, rec.Body.String())
		}
	}
	return rec.Code, payload
}

func jsonInt(t *testing.T, payload map[string]any, key string) int {
	t.Helper()
	value, ok := payload[key].(float64)
	if !ok {
		t.Fatalf("字段 %q 不存在或不是数字：%v", key, payload)
	}
	return int(value)
}

func jsonString(t *testing.T, payload map[string]any, key string) string {
	t.Helper()
	value, _ := payload[key].(string)
	return value
}

// quizWordIDs 从分页练习响应里取出题目顺序上的单词 ID。
func quizWordIDs(t *testing.T, payload map[string]any) []string {
	t.Helper()
	items, _ := payload["items"].([]any)
	ids := make([]string, 0, len(items))
	for _, raw := range items {
		item, _ := raw.(map[string]any)
		word, _ := item["word"].(map[string]any)
		id, _ := word["id"].(string)
		ids = append(ids, id)
	}
	return ids
}

// TestHTTPIntegrationAuthAndGuards 覆盖注册 / 登录 / 会话 / 权限守卫。
func TestHTTPIntegrationAuthAndGuards(t *testing.T) {
	env := newHTTPEnv(t)

	if status, _ := env.callJSON(http.MethodGet, "/api/auth/me", "", ""); status != http.StatusUnauthorized {
		t.Fatalf("未登录访问 /api/auth/me 应 401，实际 %d", status)
	}
	if status, _ := env.callJSON(http.MethodGet, "/api/meaning-quiz?level=all", "", ""); status != http.StatusUnauthorized {
		t.Fatalf("未登录访问 /api/meaning-quiz 应 401，实际 %d", status)
	}

	status, payload := env.callJSON(http.MethodGet, "/api/auth/me", "", env.token)
	if status != http.StatusOK {
		t.Fatalf("已登录访问 /api/auth/me 应 200，实际 %d", status)
	}
	user, _ := payload["user"].(map[string]any)
	if user == nil || user["username"] != "httpstudent" || user["role"] != "student" {
		t.Fatalf("会话用户不正确：%v", payload)
	}

	// 学生不能访问管理员接口。
	if status, _ := env.callJSON(http.MethodGet, "/api/admin/users", "", env.token); status != http.StatusForbidden {
		t.Fatalf("学生访问管理员接口应 403，实际 %d", status)
	}

	// 登录：密码错误 401，密码正确 200 并下发会话 Cookie。
	if status, _ := env.callJSON(http.MethodPost, "/api/auth/login", `{"username":"httpstudent","password":"wrongpassword"}`, ""); status != http.StatusUnauthorized {
		t.Fatalf("密码错误应 401，实际 %d", status)
	}
	rec := env.call(http.MethodPost, "/api/auth/login", `{"username":"httpstudent","password":"password123"}`, "")
	if rec.Code != http.StatusOK {
		t.Fatalf("密码正确应 200，实际 %d：%s", rec.Code, rec.Body.String())
	}
	cookies := rec.Result().Cookies()
	if len(cookies) == 0 || cookies[0].Name != sessionCookie || cookies[0].Value == "" {
		t.Fatalf("登录响应没有下发会话 Cookie：%v", cookies)
	}
	if status, _ := env.callJSON(http.MethodGet, "/api/auth/me", "", cookies[0].Value); status != http.StatusOK {
		t.Fatalf("用登录返回的 Cookie 访问 /api/auth/me 应 200，实际 %d", status)
	}

	// 注册：新用户可登录，重名 400。
	rec = env.call(http.MethodPost, "/api/auth/register", `{"username":"httpstudent2","password":"password123","displayName":"第二个学生"}`, "")
	if rec.Code != http.StatusOK {
		t.Fatalf("注册应 200，实际 %d：%s", rec.Code, rec.Body.String())
	}
	if status, _ := env.callJSON(http.MethodPost, "/api/auth/register", `{"username":"httpstudent2","password":"password123"}`, ""); status != http.StatusBadRequest {
		t.Fatalf("重复注册应 400，实际 %d", status)
	}
}

// TestHTTPIntegrationMeaningQuizSourceFilter 覆盖练习来源筛选与跨用户隔离。
func TestHTTPIntegrationMeaningQuizSourceFilter(t *testing.T) {
	env := newHTTPEnv(t)
	const setPath = "/api/meaning-quiz?level=all&page=1&size=12"

	status, payload := env.callJSON(http.MethodGet, setPath, "", env.token)
	if status != http.StatusOK {
		t.Fatalf("基线练习集应 200，实际 %d：%v", status, payload)
	}
	baseline := jsonInt(t, payload, "total")
	if baseline != 8 {
		t.Fatalf("基线应覆盖 8 个词，实际 %d", baseline)
	}

	// 还没有任何学习记录时，两个来源都是空池，并给出可读错误。
	status, payload = env.callJSON(http.MethodGet, setPath+"&source=mistakes", "", env.token)
	if status != http.StatusUnprocessableEntity {
		t.Fatalf("空错题本应 422，实际 %d", status)
	}
	if msg := jsonString(t, payload, "error"); !strings.Contains(msg, "not enough words") {
		t.Fatalf("空池错误应保留 not enough words 前缀，实际 %q", msg)
	}

	// 通过 HTTP 判分记录一道错题。
	status, payload = env.callJSON(http.MethodPost, "/api/quiz/answer", `{"level":"primary","wordId":"apple","type":"en-zh","answer":"不知道"}`, env.token)
	if status != http.StatusOK {
		t.Fatalf("提交答案应 200，实际 %d", status)
	}
	if correct, _ := payload["correct"].(bool); correct {
		t.Fatalf("错误答案不应判定为正确：%v", payload)
	}

	status, payload = env.callJSON(http.MethodGet, setPath+"&source=mistakes", "", env.token)
	if status != http.StatusOK || jsonInt(t, payload, "total") != 1 {
		t.Fatalf("错题来源应只命中 1 个词，实际 %d %v", status, payload)
	}
	if ids := quizWordIDs(t, payload); len(ids) != 1 || ids[0] != "apple" {
		t.Fatalf("错题来源命中集合应为 [apple]，实际 %v", ids)
	}
	status, payload = env.callJSON(http.MethodGet, setPath+"&source=unmastered", "", env.token)
	if status != http.StatusOK || jsonInt(t, payload, "total") != 1 {
		t.Fatalf("未掌握来源应只命中 1 个词，实际 %d %v", status, payload)
	}

	// 未知来源等价于不过滤，老客户端不受影响。
	status, payload = env.callJSON(http.MethodGet, setPath+"&source=bogus", "", env.token)
	if status != http.StatusOK || jsonInt(t, payload, "total") != baseline {
		t.Fatalf("未知来源应等价于不过滤，实际 %d %v", status, payload)
	}

	// 叠加元数据筛选：apple 是 primary，用 middle 过滤后应为空池。
	status, payload = env.callJSON(http.MethodGet, "/api/meaning-quiz?level=middle&page=1&size=12&source=mistakes", "", env.token)
	if status != http.StatusUnprocessableEntity {
		t.Fatalf("错题来源叠加 middle 学段应 422，实际 %d %v", status, payload)
	}

	// 跨用户隔离：另一个学生看不到 httpstudent 的错题。
	rec := env.call(http.MethodPost, "/api/auth/register", `{"username":"otherstudent","password":"password123"}`, "")
	if rec.Code != http.StatusOK {
		t.Fatalf("注册第二个学生应 200，实际 %d", rec.Code)
	}
	other := rec.Result().Cookies()[0].Value
	status, payload = env.callJSON(http.MethodGet, setPath+"&source=mistakes", "", other)
	if status != http.StatusUnprocessableEntity {
		t.Fatalf("其他学生的错题本应为空（422），实际 %d %v", status, payload)
	}

	// 订正后错题移出：答对同一题会标记掌握/已订正。
	status, payload = env.callJSON(http.MethodPost, "/api/quiz/answer", `{"level":"primary","wordId":"apple","type":"en-zh","answer":"苹果"}`, env.token)
	if status != http.StatusOK {
		t.Fatalf("提交正确答案应 200，实际 %d", status)
	}
	if correct, _ := payload["correct"].(bool); !correct {
		t.Fatalf("正确答案应判定为正确：%v", payload)
	}
	status, payload = env.callJSON(http.MethodGet, setPath+"&source=mistakes", "", env.token)
	if status != http.StatusUnprocessableEntity {
		t.Fatalf("订正后错题本应为空（422），实际 %d %v", status, payload)
	}
}

// TestHTTPIntegrationProgressAndMistakes 覆盖判分写记录、错题本与订正接口。
func TestHTTPIntegrationProgressAndMistakes(t *testing.T) {
	env := newHTTPEnv(t)

	status, payload := env.callJSON(http.MethodPost, "/api/quiz/answer", `{"level":"primary","wordId":"book","type":"en-zh","answer":"书"}`, env.token)
	if status != http.StatusOK || jsonString(t, payload, "message") != "回答正确" {
		t.Fatalf("答对应返回正确提示，实际 %d %v", status, payload)
	}
	if answer := jsonString(t, payload, "answer"); answer != "书" {
		t.Fatalf("判分应回传词库里的正确答案，实际 %q", answer)
	}

	status, payload = env.callJSON(http.MethodGet, "/api/progress", "", env.token)
	if status != http.StatusOK {
		t.Fatalf("读取进度应 200，实际 %d", status)
	}
	if _, ok := payload["primary:book"]; !ok {
		t.Fatalf("进度应记录 primary:book，实际 %v", payload)
	}

	// 提交一个不存在的词应 400，不写脏数据。
	if status, _ := env.callJSON(http.MethodPost, "/api/quiz/answer", `{"level":"primary","wordId":"not-a-word","type":"en-zh","answer":"x"}`, env.token); status != http.StatusBadRequest {
		t.Fatalf("不存在的单词应 400，实际 %d", status)
	}

	// 答错 → 进错题本 → 订正接口把它移出。
	if status, _ := env.callJSON(http.MethodPost, "/api/quiz/answer", `{"level":"primary","wordId":"dog","type":"en-zh","answer":"猫"}`, env.token); status != http.StatusOK {
		t.Fatalf("提交错误答案应 200，实际 %d", status)
	}
	readMistakes := func() (int, []map[string]any) {
		rec := env.callAsStudent(http.MethodGet, "/api/mistakes?level=all", "")
		if rec.Code != http.StatusOK {
			t.Fatalf("读取错题本应 200，实际 %d", rec.Code)
		}
		var page struct {
			Items []map[string]any `json:"items"`
			Total int              `json:"total"`
		}
		if err := json.Unmarshal(rec.Body.Bytes(), &page); err != nil {
			t.Fatalf("错题本响应不是 JSON 对象：%s", rec.Body.String())
		}
		return page.Total, page.Items
	}
	if total, items := readMistakes(); total != 1 || len(items) != 1 {
		t.Fatalf("错题本应有 1 条，实际 total=%d items=%v", total, items)
	}
	if status, _ := env.callJSON(http.MethodPost, "/api/mistakes/dog/resolve?level=primary", "", env.token); status != http.StatusOK {
		t.Fatalf("订正错题应 200，实际 %d", status)
	}
	if total, items := readMistakes(); total != 0 || len(items) != 0 {
		t.Fatalf("订正后错题本应为空，实际 total=%d items=%v", total, items)
	}
}

// TestHTTPIntegrationWordLibrary 覆盖词库分页与单词详情。
func TestHTTPIntegrationWordLibrary(t *testing.T) {
	env := newHTTPEnv(t)

	status, payload := env.callJSON(http.MethodGet, "/api/words?level=primary&page=1", "", env.token)
	if status != http.StatusOK || jsonInt(t, payload, "total") != 4 {
		t.Fatalf("小学词库应有 4 个词，实际 %d %v", status, payload)
	}

	status, payload = env.callJSON(http.MethodGet, "/api/words/apple?level=primary", "", env.token)
	if status != http.StatusOK || jsonString(t, payload, "id") != "apple" {
		t.Fatalf("单词详情应返回 apple，实际 %d %v", status, payload)
	}

	if status, _ := env.callJSON(http.MethodGet, "/api/words/no-such-word?level=primary", "", env.token); status != http.StatusNotFound {
		t.Fatalf("不存在的单词应 404，实际 %d", status)
	}
}
