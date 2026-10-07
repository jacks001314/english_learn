# 智能助教 UX 改造 · 实施契约（冻结版）

> 状态：**冻结**（前后端并行开发以此为准，改契约需先改本文件）
> 日期：2026-10-06
> 上游方案：`docs/agent-ux-optimization.md`
> 决策：默认**浮动**面板（停靠可选）、讲解**全程 JSON 结构化**、覆盖 P0/P1/P2 全部条目

---

## 0. 全局约定

| 约定 | 值 |
|---|---|
| 前端缓存版本串 | `?v=20261006-agent-ux-r1`（所有 import 一律用它，禁止裸路径或其它版本） |
| 新增前端模块 | `web/js/agentSpeech.js`、`web/js/components/AgentTeachingCard.js` |
| 新增后端文件 | `internal/learning/agent_card.go`（卡片协议与解析） |
| 面板默认形态 | `float`（浮动，宽度 420px）；`dock` 为可选，存 `localStorage.lingoBloomAgentPlacement` |
| 语种/文案 | 面向中国中小学生，中文讲解；代码注释用中文，与仓库现有风格一致 |
| 校验 | 任何改动的 `.js` 必须通过 `node --check`；Go 必须过 `gofmt -l` 与 `go vet` |

## 1. 后端响应契约（`internal/learning/agent.go` → `AgentChatResponse`）

请求体新增字段（`AgentChatRequest`）：

```jsonc
{
  "message": "为什么我选错了？",
  "threadId": "",
  "mode": "meaning",
  "quickAction": "explain-wrong",
  "format": "card",            // 新增：card | text；缺省时「有 context 就是 card，没有就是 text」
  "wantDrill": false,          // 保留（drill 走 quickAction）
  "context": {                 // 由 learningContext.contextForRequest() 产生
    "view": "meaning-en-zh", "scene": "meaning", "level": "all",
    "wordId": "a kind of", "spelling": "a kind of", "phonetic": "/ə kaɪnd əv/",
    "options": ["一种，一类", "邀请；招待", "因为", "有相同特征"],
    "correctAnswer": "一种，一类", "selectedAnswer": "有相同特征", "correct": false,
    "position": "第 13 / 4590 题", "page": 2, "pages": 383, "pageSize": 12,
    "answered": 7, "sessionCorrect": 6, "scope": "全部范围（小学 + 初中）",
    "pageMap": [ { "wordId": "a bit", "spelling": "a bit", "correct": false } ]   // 新增，≤20 条
  }
}
```

响应体新增字段（全部 `omitempty`，旧前端不解析也不报错）：

```jsonc
{
  "message": "……",            // 原始文本（流式内容与此一致），永远存在
  "threadId": "…", "model": "…", "engine": "…", "durationMs": 1830,
  "card": { …见 §2… },          // 结构化教学卡片；解析失败时为 null
  "receipt": { …见 §3… },       // 「助教已读」回执
  "snapshotText": "【学生档案】…",// 实际注入给模型的快照原文（用于回执展开）
  "actions": [ … ],             // 既有：add-review 等
  "drill": { … }                // 既有
}
```

SSE（`/api/agent/chat/stream`）帧格式**不变**：`{"type":"delta","text":"…"}` / `{"type":"done","response":{…完整响应…}}` / `{"type":"error","message":"…"}`。
`format=card` 时 delta 里是 JSON 片段，前端**不得**把它当散文渲染（渲染骨架 + 计时，`done` 后换卡片）。

## 2. 教学卡片 `card`

```jsonc
{
  "kind": "explain",                    // explain | mistake | compare | reading | general
  "headline": "a kind of = 一种、一类（强调“种类归属”）",   // ≤60 字，必填，为空视为解析失败
  "verdict": "你选了「有相同特征」，正确答案是「一种,一类」",  // 服务端用 snapshot 覆写，模型填的会被忽略
  "points": [ { "label": "记忆线索", "text": "…" }, { "label": "易混对比", "text": "…" } ], // ≤4 条，text ≤120 字
  "example": { "en": "A panda is a kind of bear.", "zh": "熊猫是一种熊。" },
  "check":   { "prompt": "试着造一句：A cheetah is a kind of ___.", "answer": "cat" },
  "words":   [ { "word": "cheetah", "meaning": "猎豹", "level": "middle", "id": "cheetah" } ], // ≤4 条
  "action":  { "label": "30 秒小动作", "text": "把例句读两遍，再自己造一句", "kind": "read" }   // kind: read|drill|review
}
```

规则：

1. **注入方式**：`format=card` 时在 system prompt 后追加卡片 JSON 指令；模型只输出一个 JSON 对象（禁止 Markdown 围栏与解释文字），服务端用已有的 `extractJSONObject` 解析。
2. **`verdict` 由服务端生成**（依据 `snapshot.Current` 的 `Answered/SelectedAnswer/CorrectAnswer`），不采信模型输出。
3. **解析失败**：`card = null`、`message` 保留模型原文，前端回落到现有 Markdown 渲染（**不允许白屏**）。
4. **一致性兜底**：若 `check.answer` 与词库答案冲突，以词库为准重写；`words` 只保留能在快照或当前题选项里找到依据的词。
5. 长度：`format=card` 时不适用 350 字限制，改为「headline ≤60、每个 point ≤120、points ≤4」。

## 3. 已读回执 `receipt`

```jsonc
{
  "items": [
    { "key": "current", "label": "本题",       "ok": true },
    { "key": "history", "label": "该词历史",   "ok": true },
    { "key": "session", "label": "本页进度",   "ok": true },
    { "key": "weak",    "label": "薄弱词",     "ok": true },
    { "key": "review",  "label": "今日到期",   "ok": false }
  ],
  "stale": false,
  "text": "【当前题目】a kind of …"        // = snapshotText，点击展开时展示
}
```

## 4. 前端模块契约

### 4.1 `web/js/agentSpeech.js`（新增）

```js
export function speechSupported()            // boolean
export function speak(text, opts = {})       // opts:{lang='en-US', rate=0.9, onend}
export function stopSpeaking()
```
内部用 `window.speechSynthesis`；不可用时静默返回 `false`，不许抛错。

### 4.2 `web/js/learningContext.js`（改造，导出保持不变并新增）

```js
export async function askInline(payload)     // 新增：页内就地提问，不经过右侧面板
// payload: { quickAction?: string, message?: string, label?: string, format?: 'card' }
// 返回: { card, message, receipt, error } —— 失败时 card=null 且 error 为中文提示
// 内部：POST /api/agent/chat，body.context = contextForRequest()，body.format 缺省 'card'
```

- `contextForRequest()`：`updatedAt` 超过 5 分钟（`CONTEXT_TTL_MS = 5*60*1000`）时返回 `{}`，避免把旧题当当前题。
- `publishContext(patch)` 合并语义不变。
- 统一 `?v=20261006-agent-ux-r1`。

### 4.3 `web/js/components/AgentTeachingCard.js`（新增，Vue 组件）

```js
props: { card: Object (required), compact: Boolean (default false) }
emits: ['add-review', 'speak', 'ask']
```
渲染顺序：`headline` → `verdict` → `points`（带色条）→ `example`（英文带 🔊 朗读按钮）→ `check`（默认折叠答案，点“看答案”展开）→ `words`（chip，“+ 加入今日复习”触发 `add-review`）→ `action`（`compact=false` 时底部固定行动条，`compact=true` 时行内展示）。
英文词/短语渲染成 `<button class="agent-word">` 点击朗读；`card` 为空时渲染空态文案，不报错。

### 4.4 `web/js/components/AgentAssistant.js`（改造）

- `placement`：`'float'`（默认）| `'dock'`，持久化到 `localStorage.lingoBloomAgentPlacement`。
- 顶部：**不再复述题干与选项**，改为一行状态胶囊（`场景 · 第 N 题 · 你在该词错过 M 次`）+ 「定位题目」按钮（`$emit('focus-item', {wordId, level})`）。
- 回执：渲染 `out.receipt.items` 为 chips，点击展开 `receipt.text`。
- 渲染：`out.card` 存在 → `<agent-teaching-card>`；否则回落 `renderMarkdown(m.message)`。
- 流式：`format=card` 时显示骨架 + 已用秒数（不逐字渲染 JSON）；文本模式保留逐字。
- 长回答新消息**钉住顶部**（新回答开始时 `scrollTop = 卡片 offsetTop`）。
- 新增「停止生成」（`AbortController`，`reader.cancel()`）、完成后「重试 / 复制 / 朗读整段」。
- 发送时带 `format: 'card'`。

### 4.5 `web/agent.css`（改造）

- `.agent-panel` 浮动宽度 410 → **420px**，可拖拽调宽（最小 360 / 最大 560）。
- 新增 `.agent-dock` 形态：`--agent-rail:440px`，`.agent-dock .app-content>main{margin-right:calc(var(--agent-rail) + var(--page-gutter))}`，面板改为栏内定位（不再 `fixed` 覆盖内容）。
- 新增教学卡片、回执 chips、骨架、sticky 行动条、`.agent-word`、小屏（`max-width:900px`）全屏抽屉样式。
- 保留既有类名与选择器语义（`agent-fab` / `agent-nudge` / `agent-quick` / `agent-markdown` 等仍被引用）。

## 5. 页面接入契约（`publishContext` 字段 → 服务端读取）

| 字段 | 类型 | 读取方 |
|---|---|---|
| `view` `scene` `level` `wordId` `spelling` `phonetic` `options` `prompt` `correctAnswer` `selectedAnswer` `correct` | 既有 | `agent_context.go` |
| `position` `page` `pages` `pageSize` `answered` `sessionCorrect` `scope` `topic` | 既有 | 同上 |
| `quizType` `wrongTimes` `total` | 既有（服务端已在读，补登记） | 同上 |
| `pageMap` | 新增，`[{wordId, spelling, correct}]` ≤20 | `【本页进度】` |
| `articleId` `articleTitle` `paragraph` `paragraphs` `sentence` | 既有（阅读） | `【阅读段落】` |
| `homeworkId` `homeworkTitle` `questionIndex` `questionType` | **新增**（作业页） | `【作业讲解】` |
| `setId` `setTitle` `unitIndex` | **新增**（同步训练） | `【同步训练】` |
| `courseUnit` `courseSection` | **新增**（课程页） | `【课程学习】` |
| `drillFocus` `drillCount` | **新增**（变式练习页） | `【变式练习】` |
| `examTitle` `questionNo` `subject` | **新增**（考试页） | `【考试讲解】` |
| `grammarTopic` | **新增**（语法专题） | `【语法专题】` |

守门脚本 `scripts/check-agent-context-contract.mjs`：扫描所有 `publishContext({…})` 的键与服务端读取的键做差集，出现未登记键即失败（允许的键集合写在本节的表里）。

## 6. 验收（对应 `docs/agent-ux-optimization.md` §3）

| 编号 | 验收 |
|---|---|
| V1 | 浮动面板不再遮挡右侧答题区/错词栏的可点区域；切到「停靠」时页面 reflow 且零遮挡 |
| V2 | 长问题流式：从第一屏就能读到开头（不被强行拉到文末）；可中途停止 |
| V3 | 讲解结果渲染为教学卡片：结论 / 要点 / 例句（可朗读）/ 30 秒自测 / 生词入册 |
| V4 | 面板可展开「助教已读」回执；`stale` 时不展示过期题目信息 |
| V5 | 同步训练 / 作业 / 课程 / 变式练习 / 考试 / 语法 六类页面打开助教都有对应状态胶囊 |
| V6 | 答错后就地展开讲解，不遮挡选项，可原地「加入复习 / 出同类题」 |
| V7 | `node --check` 全绿、`go vet`/`go test` 全绿、契约守门通过 |
