# 智能助教 × 页面深度融合方案

> 状态：**已被取代并落地** —— 本文件是 2026-10-04 的初版诊断，作为背景资料保留；
> 实际实施方案见 `docs/agent-ux-optimization.md`，冻结契约见 `docs/agent-ux-implementation-contract.md`，
> 验收证据见 `docs/agent-ux-verification.md`。
> 日期：2026-10-04（2026-10-06 标注状态）
> 关联代码：`web/js/components/AgentAssistant.js`、`web/js/main.js`、`internal/learning/agent.go`、`internal/learning/agent_controller.go`、`internal/learning/content_factory.go`

---

## 0. 结论摘要

现在的"智能英语助教"本质上是一个**通用聊天框**：它不知道你在做哪道题，也查不到你的历史数据，
更不能在页面上做任何事。要"充分结合"，核心不是把提示词写得更长，而是补三件事：

1. **让它看得见**——把当前题目 + 该学生的历史掌握度，以结构化"学习快照"注入（前端只传 id，服务端富化）。
2. **让它做得到**——给助教挂只读数据工具 + 结构化输出（`actions`），让回答能变成页面上的动作（出变式题、存生词、跳题、加复习）。
3. **让它主动开口**——在答错、连错、到期末复习等事件上主动介入，并把结论沉淀回 `LearningEvent` / `KnowledgeMastery`，反哺智能学习计划。

推荐先做 **P0（约 1 天）**：真上下文 + 页内"讲讲这道题" + 错题自动归因。性价比最高，风险最低。

---

## 1. 现状诊断

### 1.1 现有链路（代码事实）

| 环节 | 现状 | 位置 |
|---|---|---|
| 前端面板 | 右下角悬浮球 + 一个聊天面板；纯"文本进 / 文本出"，Markdown 渲染 | `web/js/components/AgentAssistant.js` |
| 传给后端的上下文 | 只有 4 个字段：`{view, level, query, topic}` | `web/js/main.js:526` |
| 请求体 | `{message, threadId, mode, context}` | `AgentAssistant.js` → `api.js` |
| 提示词拼装 | 把 context 直接 `json.Marshal` 成一行塞进字符串 | `agent.go:buildLearningPrompt` |
| 智能体能力 | `core.ToolOptions{Preset: core.ToolsNone}` —— **没有任何工具** | `agent.go:runCodexAgent` |
| 返回 | 单个字符串 `Message`，页面无法据其行动 | `AgentChatResponse` |
| 并发/延迟 | 全局 `agentMu` 串行 + 默认 60s 超时 + 一次性全文返回 | `agent_controller.go`、`agent.go` |

也就是说：**学生问"a cold 为什么不是 '毛衣'"，助教唯一的依据是"当前视图叫 meaning、级别是 xxx"**，
它既看不到 `a cold` 这道题，也看不到你在这道词上错过几次。

### 1.2 三个根因

1. **看不见**（上下文太薄）
   不知道当前题目、选项、你选的答案、正确答案、本题已错次数、本页进度；
   更不知道这道词你 3 天前错过、历史正确率 1/5、今天到复习期。→ 只能给"教科书式"的泛泛讲解。
2. **做不到**（无工具 + 无结构化输出）
   `ToolsNone` 意味着它不能查你的错题本、掌握度、复习队列，也不能查词库；
   返回纯文本意味着它**不能在页面上做事**——不能生成变式题、不能存生词、不能改学习计划。
3. **不主动**（纯 pull 模式）
   必须用户自己打开面板、自己组织语言提问。真正有价值的教育时刻（答错、连错、考试后）都被放过了。

### 1.3 已经存在、但助教没用上的资产

| 资产 | 说明 | 位置 |
|---|---|---|
| 学习画像 | `LearningProfile`：`overallScore`、`strongest/weakest`、`KnowledgeMastery{score, confidence, reviewStreak, reason, nextReview}` | `model.go`、`learning_intelligence.go` |
| 错题本 / 进度 | `/api/mistakes`、`/api/progress`、`/api/review/today`、`/api/learning/events` | `router.go` |
| 智能学习计划 | `SmartLearningPlan` + `SmartPlanTask{type, reason, minutes, action}` | `learning_intelligence.go` |
| **结构化生成管道** | 内容工厂：给模型 JSON schema → `structureFactoryContent` → `extractJSONObject` → `validateFactoryDraft` → 草稿 → 发布 | `content_factory.go:857`+ |
| 复用先例 | 作业 AI 批改已经直接 `runAgent(...)` 复用同一个模型入口 | `homework.go:294` |

> 关键判断：**"让 AI 生成符合本站数据结构的练习题并直接进练习流"这件事，技术上已经跑通了**（内容工厂），
> 只需要把同一条管道暴露给助教即可，不需要新造轮子。

---

## 2. 目标形态

**助教不再是"边上的聊天框"，而是"题目旁边的教练"：**
它看着你正在做的这道题，知道你在它身上栽过跟头，能当场给你拆解、出同考点变式题、
把生词和笔记直接写进你的复习队列，并且在你连错两次时主动开口。

---

## 3. 四层设计

### L1 上下文层（眼）—— "它知道你在干什么"

**前端只传 id，服务端负责富化。**理由：省流量、防篡改、能拿到前端没有的跨会话数据。

前端新增轻量上下文总线（`web/js/learningContext.js`，Vue reactive 单例），各页面在关键事件上发布：

```js
// 例题：看词选义
publishContext({
  scene: 'meaning',                 // meaning | quiz | reading | mistakes | review | exam | grammar | homework
  itemId: 'a cold',                 // 当前题目 / 词条 id
  item: { spelling: 'a cold', phonetic: '/ə kəʊld/', options: [...], answer: '感冒' },
  attempt: { selected: '不但……而且……', correct: false, wrongTimes: 2 },
  paging: { position: 8, total: 4614, page: 1, pages: 385 },
  filters: { scope: '全部范围', grade: '全部年级', topic: '全部主题' },
  session: { answered: 7, correct: 6 }
});
```

服务端 `/api/agent/chat` 收到后**富化**为"学习快照"（带 token 预算裁剪，超限按重要性降级）：

```json
{
  "student": {"level": "初中", "overallScore": 62, "streakDays": 5},
  "currentItem": {
    "spelling": "a cold", "phonetic": "/ə kəʊld/", "pos": "n.",
    "sense": "感冒", "confusables": ["a bit", "a few"],
    "myStats": {"seen": 5, "correct": 1, "wrong": 4, "reviewStreak": 0, "nextReview": "2026-10-04"}
  },
  "recentWeak": [{"id": "a bit", "reason": "与 a cold 混淆"}, ...],
  "dueToday": 12
}
```

提示词按 `mode` 分层（现在 `buildLearningPrompt` 只给一个"场景标签"）：

- `mistake`（错题）：先定位错因（词义 / 搭配 / 词形 / 语法 / 粗心），再给对比，再给一条自测题；
- `word`（词义）：词根词缀 → 搭配 → 易混词 → 一个可迁移例句；
- `reading`：逐句成分拆解 + 指代关系，不整段翻译；
- `exam`：只讲思路和排除法，**不给答案**（现有 SystemPrompt 已有此约束，应细化为可执行规则）；
- 讲解与"标准答案"分离：**答案一律以题库为准，模型只负责解释**（防编造）。

同时做成"可控"：管理员后台已有的 SystemPrompt 字段可拆成"全局人设 + 各场景模板"两段，便于调优。

### L2 能力层（手）—— "它能查、能生成、能做事"

**（a）工具白名单**（当前 `ToolsNone` → 改为只读 + 生成，绝不放任执行任意命令）：

| 工具 | 作用 |
|---|---|
| `student.profile` | 掌握度、薄弱点、连续天数 |
| `student.mistakes(limit)` | 错题本（含 reason/次数） |
| `student.mastery(topicOrWord)` | 单个词的掌握详情 |
| `student.reviewDue()` | 今日到期复习 |
| `library.word(id\|spelling)` | 词条详情：音标、释义、例句、易混 |
| `library.searchWords(query, filters)` | 按主题/年级/词性找同族词 |
| `exercise.generate(spec)` | **复用内容工厂管道**产出同考点变式题（JSON → 校验 → 草稿 → 直接可练） |
| `plan.today()` / `plan.suggest()` | 今日计划 / 针对薄弱点的计划建议 |

**（b）结构化输出 `actions`**（当前只有纯文本，这是"结合"的枢纽）：

```json
{
  "message": "a cold 是名词短语，意思是感冒……你选的 3 是连词搭配，所以不对。",
  "actions": [
    {"type": "note",    "payload": {"itemId": "a cold", "note": "名词短语；易混 a bit/a few"}},
    {"type": "review",  "payload": {"itemId": "a cold", "addToQueue": true}},
    {"type": "drill",   "payload": {"spec": {"type": "meaning-quiz", "focus": "cold 的搭配", "count": 3}}},
    {"type": "goto",    "payload": {"scene": "mistakes", "itemId": "a bit"}}
  ]
}
```

前端渲染后**由用户确认再执行**（避免 AI 自动改动学习数据）；执行结果回填为 `LearningEvent`。

### L3 交互层（口）—— "用起来顺手"

**面板改造**：顶部固定显示"正在讲"的题目卡（单词、音标、你的答案、正确答案），
下方是针对当前题目的快捷指令按钮，而不是让用户自己组织语言：

`讲讲这个词` · `为什么我选的错了` · `和 a bit 有什么区别` · `出 3 道同类题` · `加入生词本`

**页内入口**（不再只有一个角落的悬浮球）：

| 页面 | 入口 | 行为 |
|---|---|---|
| 看词选义 / 看义选词 / 听音选义 | 答题反馈条上的"不懂，讲讲" | 携带本题快照直接提问 |
| 单词测验 | 每题下方"拆解这道题" | 同上，mode=quiz |
| 阅读 | 段落右侧"逐句解析" / 选中生词"一键入册" | 传段落 index / 选中词 |
| 错题本 | 每条错词右侧"AI 归因" | 批量归因 → 分类展示（词义/搭配/粗心） |
| 今日复习 | 顶部"生成今日 10 分钟计划" | 调 `plan.suggest` |
| 考试/作业 | 交卷后"错因报告" | 汇总错因 + 3 个下一步动作 |

**回写闭环**：助教产出的解析/笔记能写进单词卡 note、写进错题 reason、写进复习队列；
生成的变式题直接进练习流（不是让用户复制粘贴）。

### L4 闭环层（脑）—— "它驱动学习节奏"

**主动触发（事件驱动，轻提示不打扰）**：

- 同一道题错 2 次 → 轻提示"要不要我拆解一下这道题？"（不自动长篇输出，避免卡顿）；
- 连续答对 5 题 → 提示升级难度 / 换题型；
- 进入"今日复习" → 预生成今日最小计划（复用 `SmartLearningPlan`）；
- 交作业 / 考完试 → 自动生成归因报告。

**记忆沉淀**：每次讲解把"学生卡在哪"写进 `LearningEvent` 和 `KnowledgeMastery.reason`，
让 `/api/learning/profile` 与智能计划真正用上——**助教不只是聊天，而是给智能计划供料**。

**性能与成本**（否则"融合"会变成"卡顿"）：

- 全局 `agentMu` 串行 + 一次性全文返回 → 改为 **SSE 流式输出**、按用户/线程并发；
- 任务分流：归因/分类/小结走便宜小模型，深度讲解走强模型；
- 缓存：同一词条 + 同一水平的讲解命中缓存直接返回；
- 超时与降级：前端 3s 内先出"正在分析这道题…"，失败给可重试的兜底文案。

---

## 4. 接口改造（契约草案）

```http
POST /api/agent/chat
{
  "message": "为什么不是 毛衣？",
  "threadId": "...",
  "mode": "meaning",
  "context": {
    "scene": "meaning", "itemId": "a cold",
    "attempt": {"selected": "毛衣", "correct": false, "wrongTimes": 2},
    "quickAction": "explain-wrong"      // explain | explain-wrong | compare | drill | save-word
  }
}
```

```json
{
  "message": "...",
  "threadId": "...",
  "model": "gpt-5.6-terra",
  "actions": [ {"type": "drill", "payload": {...}} ],
  "snapshotUsed": {"myStats": {"correct": 1, "wrong": 4}},
  "durationMs": 1830
}
```

兼容性：`context` 与 `actions` 均为可选，旧前端不传也不报错；`mode` 保留现有 7 个取值并新增 `meaning`/`quiz`。

---

## 5. 分期实施与验收标准

### P0 · 上下文 + 页内提问 + 错题归因（建议先做）
- [ ] 前端上下文总线，`meaning`/`quiz` 两页接入（题目、选项、我的答案、已错次数、页内进度）
- [ ] `/api/agent/chat` 服务端富化：读取该词 progress / 掌握度，注入快照（超限裁剪）
- [ ] 后台 SystemPrompt 支持"全局人设 + 场景模板"
- [ ] 反馈条"不懂，讲讲"按钮 + 面板顶部题目卡
- [ ] 错题本"AI 归因"（单条）
- **验收**：在"看词选义"答错后点"不懂，讲讲"，助教回复中**明确引用本题的选项、我的错误答案，以及我在这道词上的历史错误次数**；不传上下文时行为与现在一致。
- **成本**：约 1 天；风险低（不改数据模型）。

### P1 · 结构化动作 + 变式题 + 回写闭环
- [ ] `actions` 输出 + 前端"确认后执行"
- [ ] 快捷指令按钮（讲讲 / 为什么错 / 对比 / 出题 / 入册）
- [ ] `exercise.generate` 复用内容工厂管道，生成同考点变式题直接进练习
- [ ] 生词一键入册 / 解析写入单词卡 note / 写进复习队列
- [ ] 阅读页"逐句解析 + 生词入册"
- **验收**：从错题点"出 3 道同类题"，能在练习页直接做这 3 道题并通过校验（结构合法、答案与词库一致）；"加入生词本"后 `/api/progress` 与"今日复习"可见。
- **成本**：2–3 天。

### P2 · 主动 + 记忆 + 性能
- [ ] 事件触发（连错 2 次、连对 5 题、进入复习、交卷）
- [ ] 归因结论沉淀进 `LearningEvent` / `KnowledgeMastery.reason`，并被 `/api/learning/profile`、`SmartLearningPlan` 消费
- [ ] SSE 流式输出、并发放开、小模型分流、常见讲解缓存
- **验收**：连错 2 次出现轻提示且不阻塞作答；流式首字延迟 < 1.5s；归因数据在"学习画像"里可查。
- **成本**：3–5 天。

---

## 6. 风险与对策

| 风险 | 对策 |
|---|---|
| 模型编造答案 | 答案以题库/词库为准，模型只解释；讲解中不得出现与原答案冲突的结论（可在返回后做一致性校验） |
| 延迟影响答题节奏 | 流式输出 + 预生成 + 缓存 + 3s 轻提示；主动触发只出"要不要讲"的按钮，不自动展开长文 |
| 上下文隐私 / 越权 | 前端只传 id，服务端按当前登录用户校验归属；工具仅只读 + 生成白名单 |
| 工具被滥用 | 沿用 `ToolsNone` 的思路做**白名单**，不开放任意命令/文件访问 |
| 自动改动学习数据 | `actions` 一律"用户确认后执行"，执行结果留痕 |
| 成本失控 | 分模型分级 + 缓存 + `MaxPromptChars` 对**上下文**也做限制（现在只限制问题长度） |

---

## 7. 待确认

1. 是否按 P0 → P1 → P2 推进？还是先做某一块（例如"出同考点变式题"）？
2. 助教产出的题目进练习流前，是否需要教师/管理员审核？（内容工厂是"草稿 → 发布"，助教这边建议"学生本人即时可用 + 标记 AI 生成"）
3. 是否允许助教主动弹提示（可能打断答题节奏）？还是只做"页面上的常驻入口"？
4. 模型与成本：深度讲解用哪个模型、归因用哪个模型？
