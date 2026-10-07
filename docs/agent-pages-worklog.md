# 智能助教 UX 改造 — 页面接入 worklog

负责人：`agent-pages`（页面接入）
分支范围：只写 `web/js/**` 中列明的 12 个文件 + 本文件；`internal/**`、`AgentAssistant.js`、`AgentTeachingCard.js`、`agentSpeech.js`、`web/agent.css`、`scripts/**` 未改动。
依据：`docs/agent-ux-implementation-contract.md`（§0 §4.1 §4.2 §4.4 §4.5 §5 §6）与 `docs/agent-ux-optimization.md`（V5 / V6）。

---

## 1. 改动文件清单

| # | 文件 | 一句话 |
|---|---|---|
| 1 | `web/js/learningContext.js` | 新增 `askInline`、上下文 5 分钟 TTL、助教形态 store 与可用性探测；保留 `globalThis` 单例与全部导出 |
| 2 | `web/js/main.js` | 根容器按形态挂 `agent-dock`、`@focus-item` 接线、12 处 import 统一版本串 |
| 3 | `web/js/components/MeaningPracticeView.js` | 答错后就地讲解卡 + `pageMap` 本页全景 + 定位高亮 |
| 4 | `web/js/components/QuizView.js` | 答错后就地讲解卡 + 定位高亮 |
| 5 | `web/js/components/ReadingView.js` | 选词浮条（朗读 / 讲解 / 入册）+ 讲解就地展开 |
| 6 | `web/js/components/MistakesView.js` | 仅统一 import 版本串 |
| 7 | `web/js/components/TongbuView.js` | 补 `publishContext`：`setId/setTitle/unitIndex` |
| 8 | `web/js/components/HomeworkView.js` | 补 `publishContext`：`homeworkId/homeworkTitle/questionIndex/questionType` |
| 9 | `web/js/components/CourseView.js` | 补 `publishContext`：`courseUnit/courseSection` |
| 10 | `web/js/components/DrillView.js` | 补 `publishContext`：`drillFocus/drillCount` + 定位高亮 |
| 11 | `web/js/components/ExamView.js` | 补 `publishContext`：`examTitle/questionNo/subject` |
| 12 | `web/js/components/GrammarView.js` | 补 `publishContext`：`grammarTopic` |
| 13 | `docs/agent-pages-worklog.md` | 本文件 |

---

## 2. 每个文件做了什么

### 2.1 `web/js/learningContext.js`（契约 §4.1 §4.2）

- **新增 `export async function askInline(payload = {})`**，参数 `{ quickAction, message, label, format, contextPatch }`：
  - `context = { ...contextForRequest(), ...(contextPatch || {}) }`，`contextPatch` 覆盖总线同名字段（阅读选句讲解时句子不属于“当前题目”）；
  - `POST /api/agent/chat`，请求体 `{ message, threadId: '', mode: context.scene || 'general', quickAction, format, context }`，`format` 缺省 `'card'`；
  - 返回 `{ card, message, receipt, actions, error }`；HTTP 非 2xx / 网络异常 / JSON 解析失败一律收敛为 `card: null` + 中文 `error`，**不抛异常**；
  - `quickAction` 与 `message` 都为空时直接返回中文提示且**不发网络请求**（避免空请求打到后端）。
- **`contextForRequest()` 加 TTL**：`export const CONTEXT_TTL_MS = 5 * 60 * 1000`；`updatedAt` 存在且早于 TTL 时返回 `{}`（过期上下文不上报），新鲜时仍剥离 `updatedAt` 后返回。
- **新增形态与可用性**：`setAgentPlacement('float'|'dock')` / `agentPlacement()` / store 上的 `placement` 字段（持久化键 `lingoBloomAgentPlacement`，缺省 `float`）；`agentEnabled()` 探测 `/api/agent/status` 并把 Promise 缓存在 `globalThis.__lingoBloomAgentStatus`（多模块实例只请求一次）。
- **保持不变**：`globalThis.__lingoBloomLearningStore` 单例机制、`publishContext`、`clearContextForView`、`askAssistant`、`setDrill`、`noteAnswer`、`noteReviewEntered`、`noteExamSubmitted`、`showMilestone`、`dismissMilestone`、`resetNudges`、default store 全部保留（冒烟用例逐条断言）。
- 单例兼容：若 `globalThis` 上的旧 store 缺 `placement`，模块加载时补默认值，避免旧面板与新页面互不可见。

### 2.2 `web/js/main.js`（契约 §4.5）

- **根节点形态 class**：`.app-shell` 增加 `:class="{ ..., “agent-dock”: agentDock }"`（实现里是单引号键）。
  - 事实源说明（**与任务书措辞的一处偏离，见 §4.3**）：形态的唯一事实源在面板侧 —— `AgentAssistant.js` 自己把 `agent-dock` 镜像到 `<body>`，且只在「停靠 + 面板打开 + 助教启用」时才加（`syncPlacementClass()`）；它并不写 `learningContext` 的 store。因此 `main.js` 用 `MutationObserver` 盯 `<body>` 的 class，把同一结论镜像到 `.app-shell`，并把 store 里的 `placement` 补成 `dock`（与契约 §4.4 的持久化字段保持一致）。若只看 store，页面会为一个没打开的栏白白让位。
  - 挂载时 `startAgentDockMirror()`，卸载时 `stopAgentDockMirror()`；没有 `MutationObserver` 时退化为读一次，不抛错。
- **`@focus-item` 接线**：`<agent-assistant ... @focus-item="focusAgentItem" @open-drill="startDrill" @navigate="handleNavigate">`。
  - `focusAgentItem({ wordId, itemId, level })`：先把当前 view 切到 `assistant.context.view`（在 `knownViews` 内才切），再 `focusToken += 1` 并下发 `focusTarget = { wordId, level, token }`；练习类页面（meaning / quiz / drill）由组件自行跳题并高亮 2 秒；其它页面退化为滚动到题目卡 + 内联 `box-shadow` 高亮 2 秒 + 一条轻提示。
  - 拿不到 `wordId` 时只给一条中文轻提示，不抛错、不打断答题。
  - `showNotice()` 复用既有错误条样式，**不新增 CSS 依赖**（避免和 `web/agent.css` 抢命名）。
  - 监听 `storage` 事件同步形态，多标签页一致。
- **import 版本串**：12 处统一为 `?v=20261006-agent-ux-r1`（`AgentAssistant.js`、`learningContext.js`、Meaning/Quiz/Mistakes/Reading/Exam/Drill/Homework/Course/Grammar/Tongbu）；脚本扫描确认 `main.js` 内**没有裸相对路径 import**。
- 页面组件透传 `:focus-target="focusTarget"`：meaning（3 个模式）、quiz、drill。

### 2.3 就地讲解卡 P0-2（V6）— `MeaningPracticeView.js` / `QuizView.js`

- 答错后的「不懂，讲讲」不再调用 `askAssistant`（不再把人拽到右下角面板），改为 `inlineTeach(quickAction)`：
  - 先 `cancelAutoNext()`（否则答对后的自动前进会把讲解切走），再 `askInline({ quickAction, contextPatch })`；
  - 结果渲染 `<agent-teaching-card :card="inlineCard" compact />`，**展开在题目卡下方**（DOM 上位于选项区之后），不遮挡选项区；
  - 加载中显示骨架；失败显示中文提示 + 重试按钮（重试复用同一 quickAction 与同一题上下文）；
  - 「加入今日复习」走 `askInline({ quickAction: 'add-review', contextPatch: { wordId, level, spelling } })`，回执就地显示；
  - 「出同类题」沿用原有 `$emit('navigate', { view: 'drill' })` 流程，未改后端契约；
  - 换题时以 `currentKey` 校验，迟到的讲解结果直接丢弃，不串题；卡可收起。
- `agentReady` 门控：仅当 `agentEnabled()` 为真才渲染讲解入口，助教未启用时页面无空按钮、无报错（契约工程约束）。
- **卡片事件按真实 payload 路由**：`AgentTeachingCard` 实际会发三类事件 —— `add-review {id, word, meaning, level}`（生词 chip）、`ask {quickAction, label}`（底部行动条：`drill` / `add-review`）、`ask {kind, label, text}`（其它小动作）。页面按此接线：
  - `add-review`（含行动条 kind=review）→ 直接 `askInline({quickAction:“add-review”, contextPatch:{wordId, level, spelling}})`，**不再去要一张讲解卡**（否则会误显示「讲解失败」）；
  - `quickAction=drill` → 沿用既有 `ask(“drill”)`（写 `store.pending` 让面板生成变式题 → `open-drill` → `main.js` 进 drill 页）；
  - `{kind:“read”, text}` → 就地一行提示（`inlineNote`），不留空点击；
  - 这三个方法都 `return` 对应 Promise，便于测试与调用方串接。

- `focusTarget` watch → `locateFocus({ wordId, token })`：命中则跳题并高亮 2 秒；未命中不动当前题，交给 `main.js` 兜底。

### 2.4 阅读页选词浮条 P0-3 — `ReadingView.js`

- `captureSelection()`：在正文里松开鼠标 / 抬手时读一次选区，只处理落在 `[data-paragraph-index]` 段落内的选区（工具栏、侧栏的选中不弹条）；浮条 `fixed` 内联定位到选区上方居中，**贴近视口顶部（< 80px）时改到选区下方**，避开顶栏。
- 三个按钮：`朗读`（`speak`，来自 `web/js/agentSpeech.js`，不可用时按 `speechSupported()` 隐藏，不出现空按钮）、`讲解`、`入册`。
- `讲解` → `askInline({ quickAction: 'explain-sentence', contextPatch })`，`contextPatch` 只带段落级定位（`view/scene/level/articleId/articleTitle/paragraph/paragraphs/sentence`），**不整篇上传**；段落下标会收敛到当前文章范围内；结果在段落下就地展开 compact 卡片，失败给中文提示 + 重试。
- `入册` → `add-review`，结果用页面既有 toast 就地回执。
- 收起时机：`selectionchange` 清空选区、换文章、页面滚动、点击别处。

### 2.5 页面覆盖 P1-2（V5）— 6 个页面的 `publishContext`

字段名严格取自契约 §5 表格；调用时机覆盖“进入 / 换题 / 换单元”：

| 文件 | 上报字段 | 触发时机 |
|---|---|---|
| `TongbuView.js` | `setId` `setTitle` `unitIndex` | `created`；watch `selectedId` / `unit` |
| `HomeworkView.js` | `homeworkId` `homeworkTitle` `questionIndex` `questionType` | watch `selected` / `answers`；`select()` |
| `CourseView.js` | `courseUnit` `courseSection` | 加载完成、`selectBook()`、`selectSection()` |
| `DrillView.js` | `drillFocus` `drillCount`（另带当前题定位字段） | `mounted`、`reset()`、watch `index` / `answers` |
| `ExamView.js` | `examTitle` `questionNo` `subject` | 开考、切题（`publishContext(questionId)`） |
| `GrammarView.js` | `grammarTopic` | 换专题、`created` |

离开页面不做事：`main.js` 的 `clearContextForView` 负责清理（harness 有用例覆盖）。

### 2.6 本页全景 P1-3 — `MeaningPracticeView.pageMap`

- `pageMap` computed：当前页每题 `{ wordId, spelling, correct }`，`correct` 未作答时为 `null`，最多 20 条；已并入 `publishContext()` 的 `pageMap` 字段。

---

## 3. 自检结果（真实输出）

### 3.1 `node --check`（工作目录 = 项目根）

```
OK   node --check web/js/learningContext.js  (exit=0, no output)
OK   node --check web/js/main.js  (exit=0, no output)
OK   node --check web/js/components/MeaningPracticeView.js  (exit=0, no output)
OK   node --check web/js/components/QuizView.js  (exit=0, no output)
OK   node --check web/js/components/ReadingView.js  (exit=0, no output)
OK   node --check web/js/components/MistakesView.js  (exit=0, no output)
OK   node --check web/js/components/TongbuView.js  (exit=0, no output)
OK   node --check web/js/components/HomeworkView.js  (exit=0, no output)
OK   node --check web/js/components/CourseView.js  (exit=0, no output)
OK   node --check web/js/components/DrillView.js  (exit=0, no output)
OK   node --check web/js/components/ExamView.js  (exit=0, no output)
OK   node --check web/js/components/GrammarView.js  (exit=0, no output)
```

12/12 通过（`node --check` 成功时无输出，上面逐条按 exit code 汇总）。

### 3.2 `learningContext.js` 冒烟（桩 `fetch` / `localStorage` / `Vue`）

**37 项全绿，0 FAIL**，覆盖：导出面完整性（16 个导出）、`globalThis` 单例、`CONTEXT_TTL_MS = 300000`、新鲜上下文剥离 `updatedAt`、过期上下文返回 `{}`、`placement` 缺省与持久化、`agentEnabled` 只请求一次并走缓存、`askInline` 成功路径 / `format` 缺省 `card` / `contextPatch` 覆盖 / 非 2xx 中文 error / 网络异常中文 error / add-review 形状 / 空请求不发网络调用。

### 3.3 页面 harness（桩 Vue / fetch / localStorage / `document`；导入 `web/js` 的真实组件，只去掉 `?v=`）

`全部通过（31 项）`：

```
ok   learningContext 导出完好
ok   CONTEXT_TTL_MS = 5 分钟
ok   新鲜上下文剥离 updatedAt
ok   过期上下文返回 {}
ok   askInline 成功路径 + format 缺省 card
ok   askInline 失败不抛异常且给中文 error
ok   pageMap 随 publishContext 上报
ok   pageMap ≤20 且带 spelling
ok   卡片行动条 add-review 直接入册（不请求讲解卡）
ok   入册回执就地显示且无错误态
ok   卡片行动条 drill 沿用现有助教出题流程
ok   卡片小动作文本就地提示，不留空点击
ok   答错后就地展开讲解卡（含页面上下文）
ok   讲解失败给中文提示（可重试）
ok   QuizView.publishContext
ok   Quiz 卡片行动条 add-review 直接入册
ok   测验页答错后就地展开讲解卡
ok   阅读卡片行动条 add-review 用选区文本入册（带阅读段落上下文）
ok   阅读入册用 toast 就地回执
ok   阅读页无段落上下文时把卡片小动作提示出来
ok   阅读「讲解」就地展开 + explain-sentence
ok   TongbuView.js publishContext 覆盖 setId/setTitle/unitIndex
ok   HomeworkView.js publishContext 覆盖 homeworkId/homeworkTitle/questionIndex/questionType
ok   CourseView.js publishContext 覆盖 courseUnit/courseSection
ok   DrillView.js publishContext 覆盖 drillFocus/drillCount/wordId
ok   ExamView.js publishContext 覆盖 examTitle/questionNo/subject
ok   GrammarView.js publishContext 覆盖 grammarTopic
ok   main.js 以面板在 body 上的 agent-dock 为准镜像到根容器
ok   main.js 挂载时开启镜像、卸载时断开
ok   根容器 class 绑定 agentDock
全部通过（31 项）
```

> 说明 1：更早一版 harness（38 项，含 DOM 选区浮条定位、换题丢弃迟到结果、`clearContextForView` 等）在清理临时目录前也是全绿；本轮把重点收在本次改动的代码路径上重跑。
> 说明 2：`main.js` 那三条是**源码形态断言**（`MutationObserver` + `body.classList.contains` + 挂载/卸载成对），因为 `main.js` 需要真实 Vue 运行时才能实例化；其行为要在 V1/V6 的浏览器验证台里复核。
> 说明 3：harness 曾把阅读选区的段落 stub 写成 `data-paragraph-index="2"`（1 基）而误报 1 项；真实模板是 `:data-paragraph-index="index"`（0 基），改成 `"1"` 后一致。

### 3.4 契约守门（真实脚本，不再是模拟）

`scripts/check-agent-context-contract.mjs` 已由队长合入并进 CI，本轮直接跑真实脚本：

```
> node scripts/check-agent-context-contract.mjs --verbose
· web/js/components/CourseView.js:76 → view, scene, level, courseUnit, courseSection
· web/js/components/DrillView.js:107 → view, scene, level, wordId, spelling, prompt, options, correctAnswer, selectedAnswer, correct, position, total, answered, sessionCorrect, drillFocus, drillCount
· web/js/components/ExamView.js:71 → view, scene, level, examTitle, questionNo, subject
· web/js/components/GrammarView.js:230 → view, scene, level, grammarTopic
· web/js/components/HomeworkView.js:44 → view, scene, level, homeworkId, homeworkTitle, questionIndex, questionType
· web/js/components/MeaningPracticeView.js:266 → view, scene, quizType, level, wordId, spelling, phonetic, options, prompt, correctAnswer, selectedAnswer, correct, wrongTimes, position, total, page, pages, pageSize, answered, sessionCorrect, scope, topic, pageMap
· web/js/components/MistakesView.js:88 → view, scene, quizType, level, wordId, spelling, phonetic, prompt
· web/js/components/QuizView.js:112 → view, scene, quizType, level, wordId, spelling, phonetic, options, prompt, correctAnswer, selectedAnswer, correct, wrongTimes, position, total, answered, sessionCorrect
· web/js/components/ReadingView.js:181 → view, scene, articleId, articleTitle, paragraph, paragraphs, sentence
· web/js/components/TongbuView.js:109 → view, scene, level, setId, setTitle, unitIndex

==> 助教页面上下文契约守门（docs/agent-ux-implementation-contract.md §5）
    契约登记字段 43 个｜扫描 publishContext({...}) 调用 10 处｜覆盖 43 个字段

✅ 所有 publishContext 字段都已在契约 §5 登记。
guard exit=0
```

> 首次跑是**红的**：`web/js/components/CourseView.js:73 使用未登记字段：book, section`。原因不是字段写错，而是守门脚本的 `collectKeys` 不跟踪 `[` / `]` —— 我在 `courseUnit` 的值里写了数组字面量 `[book.grade, book.semester, section.section].filter(Boolean).join(" · ")`，数组元素间的逗号被它当成顶层键分隔符，于是把数组元素读成了字段名。已按「删掉这些字段」处理：把拼接提到对象字面量之外先用 `const unit = ...` 算好，字面量里只留 `courseUnit: unit`。**守门脚本本身我没有改（不在我的写入范围）**，但这处解析盲区值得队长决定是否加固（其它页面以后在 `publishContext({...})` 的值里写数组/逗号表达式都会再次误报）。

## 4. 与契约的偏离 / 遗留问题

1. **V5 六类页面状态胶囊目前点不亮，且 `internal/learning` 当前编译不过（后端侧，非本页可解决）**。队长 2026-10-06 同步「后端契约已完工」，我按 Master 现状逐条核对（`project_list` 的 etag/大小与本地一致，说明本地即 Master 现状），结论如下：
   - **编译失败**：`go build ./internal/learning/` 退出码 1，报告
     `agent_card.go:326:43: snapshot.PageMap undefined (type AgentSnapshot has no field or method PageMap)`；
     `agent_card.go:332:14: snapshot.Page undefined`；`agent_card.go:333:21: undefined: agentSceneLabel`；`agent_card.go:333:46: snapshot.Page undefined`。
     即 `buildAgentReceipt` 读了 `AgentSnapshot` 上不存在的字段，而 `AgentSnapshot`（`agent_context.go:153-163`）只有 `Scene/Mode/QuizType/Filters/Session/Current/Reading/Weak/Student`。`go vet ./internal/learning/` 同样在第一条类型错误处中止。
   - **`PageMap` / `Page` 无人赋值**：非测试代码里 `AgentSnapshot.PageMap`、`snapshot.Page` 只被**读取**（`agent_card.go:326/332/333`），没有任何赋值点；唯一赋值出现在 `agent_card_test.go:197`（`snapshot.PageMap = ...`）与 `:247`（断言 `snapshot.Page.Kind == "tongbu"`）。也就是说：测试能过是因为它手工塞了值，**真实请求链路上【本页全景】与六类场景胶囊恒为空**。
   - **§5 新字段仍无读取点**：`agent_context.go` 解析 context 的地方（`agentContextString/Int/Bool/Strings`）覆盖的键是 `scene/quizType|type/level/wordId|itemId/prompt/options/selectedAnswer/correctAnswer/correct/wrongTimes/answered/sessionCorrect/total/position/pageSize/page/pages/articleId/articleTitle/paragraph/paragraphs/sentence/drillCount`（+`drillFocus` 走 `agentDrillPlan`）。`pageMap` / `homeworkId` / `homeworkTitle` / `questionIndex` / `questionType` / `setId` / `setTitle` / `unitIndex` / `courseUnit` / `courseSection` / `examTitle` / `questionNo` / `subject` / `grammarTopic` 在非测试代码里 **0 次出现**；`AgentPageMapItem` 这个类型全仓库也没有定义（只在 `agent_card_test.go` 被引用）。
   - **我这边不需要再改**：前端已按契约 §5 字段名把上下文全部上报（守门脚本 43/43 通过），后端把 `PageMap`/`Page`/`agentSceneLabel` 和这些键的读取补上后，V5 会自动生效。

2. **场景口径回落（已核验）**：`agentSceneGuides`（`agent_context.go:726`）当前仍只有 `meaning / quiz / mistake / reading / exam / general` 六个键，队长同步的「六类场景 prompt 要点已加好」在 Master 现状里还看不到；本页新上报的 `tongbu / homework / course / drill / grammar` 会回落到 `general` 口径。同理 `normalizeAgentCardKind` 对 `course / grammar` 返回 `general`。不影响字段上报与 V5 胶囊，只是讲解语气未细分；后端补齐后前端无需改动。
3. **`agent-dock` 的事实源在面板侧，不是 `learningContext` 的 store（与任务书措辞的偏离）**。任务书写的是「形态值从 `learningContext` 的 store 读」，但面板（`web/js/components/AgentAssistant.js`，禁止本页修改）自持 `placement`、直接写 `localStorage.lingoBloomAgentPlacement`，并只在「停靠 + 面板打开 + 助教启用」时把 `agent-dock` 加到 `<body>`，从未写 store。若页面只读 store，`agent-dock` 永远不会出现（停靠后页面不会 reflow）；而若「只看 localStorage 偏好」，又会在面板收起时让页面白让位。因此 `main.js` 改为 `MutationObserver` 盯 `<body>` 上的 `agent-dock` 并镜像到 `.app-shell`，同时把 store 的 `placement` 补成 `dock`。`learningContext` 仍导出 `setAgentPlacement/agentPlacement`（契约 §4.4 的持久化字段），面板日后若改为调用它，`main.js` 可以把镜像简化成纯 computed。
4. **`askInline` 额外接受 `contextPatch`（超出契约 §4.2 的 payload 签名）**：契约只写了 `{ quickAction?, message?, label?, format? }`，本次按任务书要求多收 `contextPatch`，用于把「阅读里选中的句子」这类不属于当前题目的上下文并进请求（`context = { ...contextForRequest(), ...contextPatch }`）。这是**超集、向后兼容**：不传时行为与契约完全一致；`label` 只作为调用方按钮文案，不进请求体。若要严格按 §4.2 收口，需要契约补登记 `contextPatch`。
5. **新增 `agentEnabled()` 导出 + 页面 `agentReady` 门控**（契约只要求「助教未启用时页面照常可用」，未规定实现）：`enabled:false` 时讲解入口直接不渲染，不留空按钮。副作用是首帧一次 `/api/agent/status` 探测（跨模块只发一次，缓存在 `globalThis.__lingoBloomAgentStatus`）。
6. **卡片事件按真实 payload 路由**（不是偏离，是集成细节）：`AgentTeachingCard` 发 `add-review {id,word,meaning,level}` 与 `ask {quickAction|kind,label,text}`；行动条 `kind=review` 若不特判就会去要一张讲解卡并显示「讲解失败」，所以三个页面都把 `add-review` 直接路由到入册。
7. **阅读页选词浮条不含 `drill`**：阅读上下文没有 `wordId`，服务端生成变式题会因缺少定位字段被拒，所以浮条保留 `朗读 / 讲解 / 入册` 三个（与任务书一致）。
8. **阅读「入册」会先把阅读段落上下文 `publishContext` 再发请求**：`publishContext` 是合并语义，不先放上下文的话请求可能还挂着上一页的题目字段（服务端会按那道题解释）。页面切换时的清理仍由 `main.js` 的 `clearContextForView` 负责。
9. **就地卡片与浮条的样式兜底**：为保证「不遮挡选项」和 `agent.css` 未加载时也不塌，组件带了最小内联样式兜底，类名用 `agent-inline-teach` / `agent-inline-skeleton` / `agent-inline-error` / `reading-select-bar` 等前缀；最终配色与间距以队友的 `web/agent.css` 为准（本页未改 `agent.css`，未新开全局类名）。
10. **「定位题目」的高亮用内联 `box-shadow` 实现 2 秒**（同时挂 `is-agent-focus` 类供 CSS 覆盖），不依赖 `agent.css` 是否已有对应类。
11. **`web/js/agentSpeech.js` 已确认在 Master 上**（3991 字节，导出 `speechSupported` / `stopSpeaking` / `speak`，与契约 §4.1 一致）；`ReadingView` 用 `speak` + `speechSupported`，「朗读」按钮在语音不可用时隐藏，不出现空按钮。
12. **上线时的版本串提醒（不在本页写入范围）**：`web/index.html` 目前仍写 `agent.css?v=20261004-practice-source-r1` 与 `js/main.js?v=20261006-accessibility-r1`。若上线时不把这些入口版本串（尤其 `agent.css`）bump 到 `20261006-agent-ux-r1`，浏览器会继续用旧缓存的 CSS，V1 的停靠 reflow 与 V6 的就地卡片样式都会看不到效果。

## 5. 交接状态

- 12 个 `.js` 已用 `project_file_sync` 同步到 Master（逐一返回 `synced: true`，无冲突、无 pending-write）。
- 依赖的队友模块已在 Master 上核实存在：`web/js/agentSpeech.js`（3991B）、`web/js/components/AgentTeachingCard.js`（10511B）、`web/js/components/AgentAssistant.js`（37893B）；本页对它们的 import 全部带 `?v=20261006-agent-ux-r1`。
- 无外部依赖、无 npm 包、无构建链改动；未触碰 `internal/**`、`AgentAssistant.js`、`AgentTeachingCard.js`、`agentSpeech.js`、`web/agent.css`、`scripts/**`。
- 自检：12 个文件 `node --check` 全绿；`learningContext` 冒烟 37 项全绿；页面 harness 31 项全绿；真实契约守门 `node scripts/check-agent-context-contract.mjs` 退出码 0（43/43 字段登记，10 处调用）。
- 待办（不在本页范围）：
  1. 后端补 `AgentSnapshot.PageMap` / `Page` / `agentSceneLabel` 与 §5 新字段的读取（详见 §4.1）——**当前 `go build ./internal/learning/` 是失败的**，这会连带 V7 的 `go vet` / `go test` 变红；
  2. 入口 `web/index.html` 的 `agent.css` / `main.js` 版本串 bump（见 §4.12）；
  3. `web/agent.css` 落地就地讲解卡与选词浮条的最终样式；
  4. `scripts/check-agent-context-contract.mjs` 本轮已在本地取回并真跑（43/43 通过）；脚本的 `collectKeys` 不跟踪 `[`/`]`，在 `publishContext({...})` 的值里写数组会把数组元素误判成字段（见 §3.4 的首次红报），建议加固。
- 复现方式：本轮自检脚本（`learningContext` 冒烟、页面 harness、契约键差集、`node --check`）为临时文件，已在提交前清理；本地镜像 `project_status` 报 `本地镜像与 Master 一致`（untracked 0）。


---

## 6. 队长补记：§4/§5 遗留项的现状（2026-10-06 22:2x）

本节只做事实更新，不改动上文任何内容。

| §5 交接项 | 现状 |
| --- | --- |
| 「V5 六类胶囊仍缺后端读取点」/「§5 六场景字段在服务端 0 读取点」 | ✅ **已修**：服务端新增 `agentPageFields`（6 场景行，`agent_context.go:499`）、`AgentSnapshot.Page` / `PageMap`、`agentSceneGuides` 11 键（含 tongbu/homework/course/drill/grammar）、`agentSceneFromMode` 11 个 mode（`homework` → `homework`，不再映成 `exam`）、`agentSceneLabel`，并已写回 Master：`agent_context.go` 49119 B / `fb33b5a21ebe660b`、`agent_card.go` 12747 B / `492ba456fd10a773`、`agent.go` 22372 B / `3ed40c16bdd68706` |
| 「`web/index.html` 的 `agent.css` / `main.js` 版本串仍是旧值」 | ✅ **已修**：统一 bump 到 `?v=20261006-agent-ux-r2`（`web/index.html` 3219 B / `27be6093c1997d3e`；`web/js/main.js` 44627 B / `b9b01f1f6ec79305`，含 4 个被改写的 view + `AgentAssistant`） |
| 「`scripts/check-agent-context-contract.mjs` 的 `collectKeys` 不跟踪 `[`/`]`，值里写数组会误报」 | ✅ **已加固**：脚本 9080 B / `0552c6ad6f2c454c`，解析器现在跟踪 `brackets`/`parens`，`CourseView` 里为绕开误报做的 `unit` 提取可保留也可回退；实跑 43/43、`exit=0` |
| 「`web/agent.css` 的就地卡片样式归队友」 | ✅ **已并入**：`web/agent.css` 31006 B / `40142654c0d0c93a`，并修掉两条真 bug（全局 `header{display:flex}` 接管 `.agent-card-head`；`.agent-panel article{max-width:88%}` 连吃嵌套卡片） |
| 六类胶囊仍只有场景名（`position` / `wrongTimes` 未发布） | ⏳ **仍是已知余量**：契约 V5 只要求「有对应状态胶囊」，不阻塞 |

复核方式（队长侧，工作目录 = 项目根）：把这 4 个文件**删掉本地副本 + 清 etag 记录后从 Master 重取**，
sha256 与删除前**逐字节相同**；用这份纯 Master 字节跑 `go build ./...` exit=0、`go vet ./...` exit=0、
`go test ./... -count=1` 全 ok（`internal/learning` 6.8s）、守门脚本 43/43。
线上证据：真服务端 + 真 `deepseek-flash` + 真 Chrome，四套共 98 条断言全绿，见 `docs/agent-ux-verification.md` §8。

---

## §订正与现状注记（队长补记，2026-10-07）

> 本节由队长（syntropy）**追加**，不覆盖上文任何原始记录；只处理 §5 交接项里那句
> 「✅ 已修：统一 bump 到 `?v=20261006-agent-ux-r2`」的**歧义**，并给出**当前权威版本串状态**。

**1) 那行说的是「入口」，不是「全部 import」**

- "统一 bump 到 r2" 当时指的是 `web/index.html` 里 `agent.css` / `main.js` 两个**入口**的版本串被提到 r2；
  `main.js` 内部**并非**「12 处 import 全提到 r2」—— 那一轮只改了 4 个 view + `AgentAssistant` 的内容，其余仍是 r1。
  同文件上文「12 处统一为 `?v=20261006-agent-ux-r1`」描述的是**第 1 轮**的状态，两句不冲突，只是容易误读。

**2) 当前（部署版本 `20261007-013823`）线上真实版本串**

| 位置 | 版本串 |
| --- | --- |
| `web/index.html` 入口 | `agent.css?v=20261007-agent-fold-r1`；`js/main.js?v=20261007-reportview-nullfix-r1` |
| `main.js` 的 **12 个助教相关 import** | `?v=20261007-agent-leakfix-r1`（MeaningPractice / Quiz / Mistakes / Reading / Exam / Drill / Homework / Course / Grammar / Tongbu / `AgentAssistant` / `learningContext`） |
| `main.js` 引 `ReportView.js` | `?v=20261007-reportview-nullfix-r1`（修「空数据整页崩」时**新增**；该文件此前没有 `?v=`，不改就等于老用户继续吃旧组件） |
| `AgentAssistant.js` 自持的 4 个 import | `markdown.js` / `agentSpeech.js` / `AgentTeachingCard.js` = `?v=20261006-agent-ux-r1`（字节此后未再变）；`learningContext.js` = `?v=20261007-agent-leakfix-r1` |

**3) 权威来源不是本文档，而是守门脚本**

「字节变了必须 bump」这条规则由 `scripts/check-agent-asset-version.mjs` 强制
（基线 `docs/agent-asset-versions.json`，当前 57 个资源，exit=0）。本文档只作解释性注记；
以后要核对版本串，请以脚本输出 + 基线文件为准，不要以本页的历史句子为准。