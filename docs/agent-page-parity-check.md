# 智能助教页面接入 · 端到端可达性核对（只读）

> 任务：V5/V6 验收补全 · 任务 3
> 日期：2026-10-06
> 范围：**只读核对**。本轮只改 `docs/agent-ux-e2e-harness.html`、`scripts/agent-ux-verify.mjs`，本文件为新建；`web/js/**`、`internal/**`、`web/*.css` 一律未改。
> 修订 1（2026-10-06 第二轮）：按队长要求**强制重新取回** `internal/learning` 三个文件后复核；
> 当时 Master 上的实现确实还是旧版（编译不过、六场景字段 0 读取点），据此新增 §6 记录。
> 修订 2（2026-10-06 第三轮，作者）：队长查明根因是**服务端改造只写在本地工作副本、漏了 `project_file_sync`**，
> 已把 4 个文件真正写回 Master。本人**再次强制重取**（删掉本地副本 + 清 `project-binding.json` 里的 etag 记录后
> `project_fetch`）并用新字节独立复核，**§0–§5 已按新 etag 统一改写**：
> §3.1（编译失败）/ §3.2（字段表不存在）/ §3.3（`agentSceneLabel` 不存在）/ §3.4（指南只 6 键）/
> §3.5（字段 0 读取点）/ §3.6（文案漂移）/ §3.10（标签表缺 4 场景）**全部作废**，改判「已修复」。
> §6 原样保留、只作历史记录（当时的判定在当时成立，见 §6 顶部说明）；§7 是队长的更正原文，与本轮复核一致。
> 第三轮仍成立的余量只有两条：§3.8（六类 view 不发 `position`/`wrongTimes`，不阻塞）、§3.11（`homeworkId` 无读取点，不阻塞）。
> 核对对象：`tongbu / homework / course / drill / exam / grammar` 六个场景。

## 0. 核对方法与证据

| 步骤 | 命令 / 依据 | 真实结果 |
|---|---|---|
| 前端发布端 | 扫描 `web/js/components/*.js` 里 `publishContext({…})` 的顶层键 | 见 §2（六个 view 各自只调用一次对象字面量形式） |
| 后端映射端 | 读 `internal/learning/agent_context.go`（Master etag `fb33b5a21ebe660b`，49119 B） | 见 §2 / §3 |
| 后端卡片端 | 读 `internal/learning/agent_card.go`（Master etag `492ba456fd10a773`，12747 B） | 见 §3.1 |
| 后端可编译性 | `go build ./...`、`go vet ./...`、`go test ./... -count=1`（go1.26.5 windows/amd64） | **三条全部 exit=0**（§3.1） |
| 契约守门 | `node scripts/check-agent-context-contract.mjs` | exit=0：43/43 字段已登记、10 处 `publishContext` 全绿 |
| 验证台 | `node scripts/agent-ux-verify.mjs` | **7 场景 7 通过 / 0 失败**（43 条断言），见 §4 |

> ⚠️ 口径：验证台把**模型传输层**换成桩（`window.fetch` 被替换，不经过 Go 服务），所以 §4 只覆盖
> 「页面上下文 → 场景胶囊 → 就地讲解卡片」这条**前端**链路，**不能**用来证明服务端可用；
> 服务端可用性由 §3.1 的真编译 / 真测试与 §7 引用的线上测试证据负责。

**第三轮复核口径（为免再出现"拿本地镜像下结论"）**：先删掉本地这 4 个文件的副本，
再从 `.syntropy/state/project-binding.json` 的 `etags` 表删掉对应记录（否则客户端认为已同步、`project_fetch` 会拒收），
然后 `project_fetch` 重新取回 —— 确保编译/核对的是 **Master 的字节**。

## 1. 结论速览

| 场景 | (a) 发布端 | (b) `agentSceneFromMode(mode)` | (c) §5 字段差集 | (d) 端到端可达？ |
|---|---|---|---|---|
| tongbu 同步训练 | ✅ `TongbuView.js:109`（`scene:"tongbu"`） | ✅ 命中 → `tongbu`（`agent_context.go:301-302`） | ✅ 无（`setId/setTitle/unitIndex` 全部发布） | ✅ **可达**：场景值 → 指南（§3.4）→【同步训练】行标题（§3.5）；仅缺胶囊第 2/3 段（§3.8） |
| homework 作业 | ✅ `HomeworkView.js:44`（`scene:"homework"`） | ✅ 命中 → `homework`（`:299-300`，**不再映成 `exam`**） | ✅ 无（4 个键全部发布）；`homeworkId` 无读取点（§3.11，不阻塞） | ✅ **可达**：【作业讲解】 |
| course 课程 | ✅ `CourseView.js:76`（`scene:"course"`） | ✅ 命中 → `course`（`:303-304`） | ✅ 无（`courseUnit/courseSection`） | ✅ **可达**：【课程学习】 |
| drill 变式练习 | ✅ `DrillView.js:107`（`scene:"drill"`） | ✅ 命中 → `drill`（`:305-306`） | ✅ 无（`drillFocus/drillCount`） | ✅ **可达**：【变式练习】；六类里唯一发 `position`，胶囊能显示「第 N 题」 |
| exam 考试 | ✅ `ExamView.js:71`（`scene:"exam"`，注意 `view:"exams"`） | ✅ 命中 → `exam`（`:297-298`） | ✅ 无（`examTitle/questionNo/subject`） | ✅ **可达**：【考试讲解】 |
| grammar 语法 | ✅ `GrammarView.js:230`（`scene:"grammar"`） | ✅ 命中 → `grammar`（`:307-308`） | ✅ 无（`grammarTopic`） | ✅ **可达**：【语法专题】 |

**一句话结论（第三轮）**：六类场景**端到端全部可达** ——
页面 `publishContext({scene:"…"})` → `agentSceneFromMode` 命中同名场景（11 个 mode）→
`agentSceneGuides`（`agent_context.go:896-908`）有对应指南、`agentPageFields`（`:499-511`）把 §5 字段翻成
【作业讲解】/【同步训练】/【课程学习】/【变式练习】/【考试讲解】/【语法专题】行标题、
`agentSceneLabel`（`:534+`）给出与前端一致的中文胶囊名；`internal/learning` 的 build / vet / test 三绿（§3.1）。

仍成立的两条余量（都不阻塞 V5/V6）：
1. 六类 view 只发场景字段、不发 `position`/`wrongTimes`，所以那六页胶囊只有「场景名」（§3.8）；
2. `homeworkId` 两端都登记/发布了，但服务端没有读取点（§3.11）。

## 2. 逐场景明细

字段名与行号均取自**当前 Master 版本**（`agent_context.go` 49119 B / `fb33b5a21ebe660b`）；
`publishContext` 调用点行号指 `publishContext({` 这一行。

### 2.1 tongbu（同步训练）

- **(a) 发布端**：`web/js/components/TongbuView.js:109`，实际发布
  `{ view:"tongbu", scene:"tongbu", level:"middle", setId, setTitle, unitIndex }`
  （`view`/`scene`/`level` 为共享字段，其余三个是本场景字段）。
  调用时机：`TongbuView.js:92/95/101`（进入套题 / 换单元 / 换题）。
- **(b) 映射端**：`agentSceneFromMode("tongbu")`（`internal/learning/agent_context.go:287-311`）
  命中 `:301-302` → `"tongbu"`；`agentSceneGuides["tongbu"]` 存在于 `:903`。
- **(c) 字段端**：§5 登记 `setId` / `setTitle` / `unitIndex`，实际发布三者，**差集 ∅**。
  缺口：未发布 `position` / `wrongTimes`（§3.8，不阻塞）。
- **(d) 结论**：**可达**。`snapshot.Scene="tongbu"` → 指南「教材同步训练」→
  `agentPageFields["tongbu"]`（`:505`）产出「套题 / 进度 / 编号」→ 胶囊名
  `agentSceneLabel("tongbu")` =「同步训练」（`:546` 起）。

### 2.2 homework（作业讲解）

- **(a) 发布端**：`web/js/components/HomeworkView.js:44` →
  `{ view:"homework", scene:"homework", level:"middle", homeworkId, homeworkTitle, questionIndex, questionType }`。
  调用时机：`HomeworkView.js:21/26/63`。
- **(b) 映射端**：`agentSceneFromMode("homework")` 命中 `:299-300` → `"homework"`
  （旧版的 `case "exam", "homework": return "exam"` 已被删除，`homework` **不再被映成 `exam`**）。
- **(c) 字段端**：§5 登记 4 个键，实际发布 4 个，**差集 ∅**；但 `homeworkId` 服务端无读取点（§3.11）。
- **(d) 结论**：**可达**。指南 `:904`「作业讲解」；`agentPageFields["homework"]`（`:506`）产出
  「作业 / 第 N 题 / 题型」；胶囊名「作业讲解」。

### 2.3 course（课程学习）

- **(a)** `web/js/components/CourseView.js:76` →
  `{ view:"course", scene:"course", level:"middle", courseUnit, courseSection }`；调用点 `:94/105/110`。
- **(b)** `"course"` 命中 `:303-304` → `course`；指南 `:905`。
- **(c)** §5 登记 `courseUnit` / `courseSection`，实际发布二者，**差集 ∅**。
- **(d)** **可达**：指南「教材课程学习」＋ `agentPageFields["course"]`（`:507`）「单元 / 板块」＋ 胶囊「课程学习」。

### 2.4 drill（变式练习）

- **(a)** `web/js/components/DrillView.js:107` →
  `{ view:"drill", scene:"drill", level, wordId, spelling, prompt, options, correctAnswer, selectedAnswer,
  correct, position, total, answered, sessionCorrect, drillFocus, drillCount }`；调用点 `:84/87/94/132/214`。
- **(b)** `"drill"` 命中 `:305-306` → `drill`；指南 `:906`。
- **(c)** §5 登记 `drillFocus` / `drillCount`，实际发布二者，**差集 ∅**。
  另：`drillCount` 在 `agent_context.go:1004`（`agentDrillPlan`，助教**出题**方向）也被读，那是另一条链路，
  与页面上下文读取（`:508`）互不冲突。
- **(d)** **可达**（【变式练习】）；六类里唯一发布了 `position`，所以胶囊能显示「变式练习 · 第 N 题」。

### 2.5 exam（考试讲解）

- **(a)** `web/js/components/ExamView.js:71` →
  `{ view:"exams", scene:"exam", level:"middle", examTitle, questionNo, subject }`；调用点 `:172/216`。
  ⚠️ `view` 是 `"exams"`（复数，与 `main.js` 的 `activeView === "exams"` 对齐），`scene` 是 `"exam"`——
  两者不相等，别把 `view` 当场景用。
- **(b)** `agentSceneFromMode("exam")` → `exam`（`:297-298`）**命中**；指南 `:901`。
- **(c)** §5 登记 `examTitle` / `questionNo` / `subject`，实际发布三者，**差集 ∅**。
- **(d)** **可达**（【考试讲解】）；验证台据此选 `exam` 做 V5 的状态胶囊断言（见 §4）。

### 2.6 grammar（语法专题）

- **(a)** `web/js/components/GrammarView.js:230` →
  `{ view:"grammar", scene:"grammar", level:"middle", grammarTopic }`；调用点 `:222/550`。
- **(b)** `"grammar"` 命中 `:307-308` → `grammar`；指南 `:907`。
- **(c)** §5 登记 `grammarTopic`，实际发布，**差集 ∅**。
- **(d)** **可达**（【语法专题】）。

## 3. 逐项核对结果（第三轮：按新 Master 统一改写）

> 本节第三轮以前，标题是「阻断项与不一致」。修复后**已无阻断项**，保留下的是两条余量（§3.8 / §3.11）。
> 每条都给出「第三轮复核依据 + 旧判定（已作废）」两段，方便对账。

### 3.1 `internal/learning` 编译 / vet / 测试全绿（已修复）

第三轮强制重取后的**真实实测**（工作目录 = 项目根，go1.26.5 windows/amd64）：

```
$ go build ./...
GO_BUILD_EXIT=0

$ go vet ./...
GO_VET_EXIT=0

$ go test ./... -count=1
ok  	english_learn/internal/learning	6.874s
GO_TEST_EXIT=0        （复跑一次 7.345s，同样 ok）

$ node scripts/check-agent-context-contract.mjs
==> 助教页面上下文契约守门（docs/agent-ux-implementation-contract.md §5）
    契约登记字段 43 个｜扫描 publishContext({...}) 调用 10 处｜覆盖 43 个字段
✅ 所有 publishContext 字段都已在契约 §5 登记。
CONTRACT_EXIT=0
```

- `AgentSnapshot`（`agent_context.go:175-187`）现在含 `Page *AgentPageInfo`（`:183`）与
  `PageMap []AgentPageMapItem`（`:184`）；`agent_card.go` 里 `snapshot.PageMap` / `snapshot.Page` /
  `agentSceneLabel` 的调用点因此都有定义。
- **旧判定（作废）**：第二轮时 `go build ./internal/learning/`、`go build ./...`、`go vet ./internal/learning/`
  三条 exit=1，报 `snapshot.PageMap undefined` / `snapshot.Page undefined` / `undefined: agentSceneLabel` 4 条错误
  （原文见 §6.2）。原因是当时 Master 上还是旧版。
- ⚠️ 复现提示：`go test ./...` 首跑若报 `TestCourseLoadsTextbookContent` / `TestImportExamFileIsIdempotent` 失败，
  先确认本地镜像是否缺数据文件（`chuzhong/**`、`web/audio/**`）。我用 `project_fetch` 补齐后才全绿——
  这是**镜像数据缺口**，不是代码回归。

### 3.2 `agentPageFields` 存在：`agent_context.go:499`（已修复）

`var agentPageFields = map[string][]struct{ Key, Label, Prefix, Suffix string }`
（注释 `:497-498`、声明 `:499-511`、消费点 `agentContextPage` `:513-530`）。六个场景行：

| 场景 | 行号 | 读取的键 |
|---|---|---|
| tongbu | `:505` | `setTitle` / `unitIndex` / `setId` |
| homework | `:506` | `homeworkTitle` / `questionIndex` / `questionType`（**无 `homeworkId`**，见 §3.11） |
| course | `:507` | `courseUnit` / `courseSection` |
| drill | `:508` | `drillFocus` / `drillCount` |
| exam | `:509` | `examTitle` / `questionNo` / `subject` |
| grammar | `:510` | `grammarTopic` |

- **旧判定（作废）**：第二轮扫全仓库（`*.go`/`*.js`/`*.mjs`/`*.md`）找不到 `agentSceneFields` 也不到 `agentPageFields`，
  据此写「字段表在 Master 上不存在」。那基于旧 Master（42765 B / `e6c03897b526a19d`），已作废。

### 3.3 `agentSceneLabel` 存在：`agent_context.go:534`（已修复）

`:534` 起的 `switch` 覆盖 10 个场景（meaning/quiz/mistake/reading/exam/tongbu/homework/course/drill/grammar），
`agentSceneLabel("homework")` = 「作业讲解」，与前端 `SCENE_LABELS` 逐项一致（§3.6）。
`agent_card.go` 的调用点不再 undefined。
- **旧判定（作废）**：第二轮「该函数全仓库无定义」。

### 3.4 `agentSceneGuides` 已覆盖 11 个键：`agent_context.go:896-908`（已修复）

键：`meaning / quiz / mistake / reading / exam / general / tongbu / homework / course / drill / grammar`（`:897-907` 一行一条）。
六类新场景各有独立指南，例如 `:903` tongbu「教材同步训练」、`:904` homework「作业讲解」、
`:905` course「教材课程学习」、`:907` grammar「语法专题」；`agentInstructions` 只在未知场景才回落 `general`。
- **旧判定（作废）**：第二轮只有 6 个键，五类新场景静默回落 `general`。

### 3.5 §5 新增字段在服务端**都有读取点**（已修复）

| 字段（§5 登记） | prod 读取点 | 说明 |
|---|---|---|
| `pageMap` | `agent_context.go:466` | 逐题读 `[]any`，落地【本页全景】 |
| `homeworkTitle` / `questionIndex` / `questionType` | `agent_context.go:506` | `agentPageFields["homework"]` →【作业讲解】行 |
| `setId` / `setTitle` / `unitIndex` | `agent_context.go:505` | →【同步训练】行 |
| `courseUnit` / `courseSection` | `agent_context.go:507` | →【课程学习】行 |
| `drillFocus` / `drillCount` | `agent_context.go:508`（另 `:1004` 属出题方向 `agentDrillPlan`） | →【变式练习】行 |
| `examTitle` / `questionNo` / `subject` | `agent_context.go:509` | →【考试讲解】行 |
| `grammarTopic` | `agent_context.go:510` | →【语法专题】行 |
| `homeworkId` | **无**（见 §3.11） | 已登记、已发布，但没人读 |

- **旧判定（作废）**：第二轮该表整列 prod 命中为 0，并据此写「服务端一个都没读、场景行在链路上不存在」。

### 3.6 场景中文名三处漂移：已修复（第三轮复核）

前端 `AgentAssistant.js:24-38` 的 `SCENE_LABELS`、后端 `agentSceneLabel`（`agent_context.go:534+`）、
`buildLearningPrompt` 的 `labels`（`agent.go:484-489`）现在**三处一致**：
`mistake` = 错题分析、`reading` = 文章阅读、`homework` = 作业讲解（`tongbu/course/drill/grammar` 也全部对齐）。
漂移是在**当前 Master 的 `AgentAssistant.js`（41089 B / `891ca5e77d821e8c`）**里修掉的——
旧副本（37124 B / `ee06a7b2ef93d11e`）里是「错题归因 / 阅读理解 / 作业练习」。
- **旧判定（作废）**：第二轮记录的 3 处漂移（含 `homework` 三处三种写法）已不存在。
- 验证台仍用 `scene=exam` 做 V5 断言：理由从「避免 homework 文案漂移导致误判」变成「保持既有断言稳定」，结论不变。

### 3.7 契约里没有 `publishContext({ mode: "…" })` 这种写法

六个 view 的 `publishContext({…})` **都没有 `mode` 键**，场景是靠 **`scene`** 上报的。
`mode` 是**请求体**字段，由两处填入：

- 面板：`AgentAssistant.js:496`（另一处请求路径 `:790`）`mode: this.mode`，而 `this.mode` 来自
  `main.js:103` 的 `assistantMode()` —— 它优先返回 `assistant.context?.scene`，
  所以实际值就是页面发布的 `scene`（`tongbu` / `homework` / `exam` …）。
- 页内就地提问：`learningContext.js:125` `mode: context.scene || 'general'`。

因此核对 (b) 列时应以 **`in.Mode = context.scene`** 这个值代入 `agentSceneFromMode`。

### 3.8 状态胶囊的第 2 / 3 段在真实页面拿不到值（**已知余量，不阻塞**）

`AgentAssistant.js:117` 的 `stateCapsule` = `场景名 · 第 N 题 · 你在该词错过 M 次`，
其中「第 N 题」读 `context.position`（`:220`）、「错过 M 次」读 `context.wrongTimes`（`:227`）。第三轮实测：

| 场景 | 发布 `position` | 发布 `wrongTimes` | 真实胶囊 |
|---|---|---|---|
| tongbu | ❌ | ❌ | `同步训练` |
| homework | ❌ | ❌ | `作业讲解` |
| course | ❌ | ❌ | `课程学习` |
| drill | ✅（`DrillView.js:118`） | ❌ | `变式练习 · 第 N 题` |
| exam | ❌ | ❌ | `考试讲解` |
| grammar | ❌ | ❌ | `语法专题` |

即 V5 名义上要的「场景名 · 第 N 题 · 错过 M 次」三要素，**真实页面里只有 drill 页能凑出两段**。
**这是已知余量、不阻塞验收**：契约 §6 的 V5 只要求「六类页面打开助教都有对应状态胶囊」，
胶囊成立即可；补齐 `position` / `wrongTimes` 需要改 `web/js/**`，另行排期。
（只有 `MeaningPracticeView.js:279-280`、`QuizView.js:125-126`、`DrillView.js:118` 三处发布这两个字段。）
（验证台为了让胶囊可断言，在 `scene=` 的各场景上下文里补齐了 `position` / `wrongTimes`；
那是**验证台自己的**上下文，不代表页面会发。）

> **第四轮更新（2026-10-07，队长）**：本节其余余量**已修** —— `web/js/components/AgentAssistant.js` 新增
> `sceneScope()`（tongbu→`setTitle`（缺省 `Unit N`）、course→`courseUnit · courseSection`、homework→`homeworkTitle`、
> exam→`examTitle`、grammar→`grammarTopic`）与 `progressSource()`（题号优先 `position`，回退 `questionNo`/`questionIndex`），
> 并把题号统一渲染成「第 N / M 题」（M = `context.total`）。上面表格的「真实胶囊」一列据此**作废**，
> 公网实测见 `docs/agent-ux-verification.md` §23.8 与 `docs/verify-reports/report-live-agent-acceptance.json` 的 `capsule`/`sceneCapsules`。
> **仍未变的**：六个 view 依旧不发 `wrongTimes`，所以「错过 M 次」段只在 meaning / quiz / mistake 这类发过 `wrongTimes` 的页面出现。
> **第五轮订正（2026-10-07，队长；本条余量已收口）。** 上面这张表和「仍未变」那句**只对第三轮的字节成立**，现已作废：
>
> - `TongbuView.js` 新增 computed `currentQuestionNo`（跨 section 计数，口径与 `setTotal` 一致；空态 = 1、全判完 = total），
>   `publishContext` 补发 `questionNo` / `total`；`AgentAssistant.js` 的 `progressSource()` 本来就回退读 `questionNo`，
>   所以同步训练页胶囊现在真的显示「第 N / M 题」。**公网实测**（`docs/agent-ux-verification.md` §30）：
>   `同步训练 · Homework 1: Get ready · 第 1 / 47 题`。
> - `DrillView.js` 的 `publishContext` 补发 `wrongTimes: entry && !entry.correct ? 1 : 0`，变式练习页胶囊补上第三段。**公网实测**：
>   `变式练习 · 第 1 / 1 题 · 你在该词错过 1 次`。
> - `homework` / `exam` 本就发 `questionIndex` / `questionNo`（`progressSource()` 会读到）；仍未发题号的只剩 `grammar`（语法专题没有「题号」这个概念，属设计取舍，不再算余量）。
> - 本轮同时纠正一处**测试侧**误解：词义页发布的 `level` 是**筛选范围**（`all`），不是那道题的真实学段；
>   `/api/quiz/answer` 按 `(level, wordId)` 精确查词，所以任何「拿 context.level 去判分」的探针都必须先取真实一对
>   （`/api/agent/chat` 那条路有 `all` 兜底，不受影响）。详见 §30.1 的实测 400 回包与修法。
> - 回写状态：这 4 个文件（`TongbuView.js` / `DrillView.js` / `main.js` / `index.html`）本已按本地字节回写 Master，
>   旧 etag 作废；`docs/agent-ux-verification.md` §30.1 有新旧字节对照表。

### 3.9 `unitIndex` 的语义不一致（类型本身不是缺陷）

**订正（第二轮）**：`agentContextString`（`agent_context.go:193` 起）显式处理
`json.Number / float64 / float32 / int / int64 / int32 / bool / string`，
所以 `TongbuView.js:115` 发**数字**不会解析失败，后端会把它转成 `"3"`——**类型这一层没有问题**。
残留的是**语义**差异：`agent_card_test.go` 传的是 `"unitIndex": "4/20"`，渲染成「进度：4/20」；
前端只发页内序号，渲染出来只会是「进度：3」。两边对「unitIndex 是第几单元，还是 3/20 这种进度串」
理解不同，落地时要么统一命名要么拆成两个字段（**待队长定，不阻塞**）。

### 3.10 后端 `labels` 表已补齐四个新场景（已修复）

`buildLearningPrompt` 的 `labels`（`agent.go:484-489`）现在含
`tongbu` 同步训练 / `course` 课程学习 / `drill` 变式练习 / `grammar` 语法专题，且 `homework` = 作业讲解；
`label` 为空时才回落「综合学习」（`:490-493`）。
- **旧判定（作废）**：第二轮该表缺这 4 个场景、`homework` 写的是「作业批改」，同步训练页的提示词头部只会是「综合学习」。

### 3.11 `homeworkId` 已登记、已发布，但服务端没有读取点（**真余量，不阻塞**）

- 发布端：`HomeworkView.js:48` 发 `homeworkId`；契约 §5（`docs/agent-ux-implementation-contract.md:161`）也登记了它。
- 读取端：`agentPageFields["homework"]`（`agent_context.go:506`）只读 `homeworkTitle/questionIndex/questionType`；
  全 `internal/**`（排除 `*_test.go`）对 `"homeworkId"` 的唯一命中是 `homework.go:60` 的内容域结构体 tag，
  与助教上下文读取无关。
- 影响：**不影响场景识别、行标题与胶囊**（它们只用上面三个键），所以不阻塞 V5/V6。
  要不要把 `homeworkId` 并进【作业讲解】行，由队长定（需要改 `internal/**`，不在我的写入范围）。

## 4. 验证台结果（真实输出）

### 4.1 第三轮复跑（本次；前端已是新 Master 版 `AgentAssistant.js`）

命令：`$env:PORT="8145"; node scripts/agent-ux-verify.mjs`（工作目录 = 项目根，Chrome 自动发现）
（默认端口 8137 被同机另一个进程占用，本机复跑改用 8145；只影响静态服务端口，不影响断言内容。）

```
==> 智能助教前端验收台（C:\Program Files\Google\Chrome\Application\chrome.exe）
    静态服务 http://127.0.0.1:8145  截图目录 .tmp/agent-ux-verify/

[PASS] float-card 前端模块全部加载
[PASS] float-card 无遮挡（V1） : 被面板盖住的可点区域 0 处/错词栏:0/7 题目选项:0/4 答错动作区:0/2
[PASS] float-card 面板已展开
[PASS] float-card 无错误提示
[PASS] float-card 渲染出教学卡片（V3） : cardNodes=22
[PASS] float-card 渲染出已读回执（V4） : receiptNodes=13
[PASS] dock-card 前端模块全部加载
[PASS] dock-card 无遮挡（V1） : 被面板盖住的可点区域 0 处/错词栏:0/7 题目选项:0/4 答错动作区:0/2
[PASS] dock-card 面板已展开
[PASS] dock-card 无错误提示
[PASS] dock-card 渲染出教学卡片（V3） : cardNodes=22
[PASS] dock-card 渲染出已读回执（V4） : receiptNodes=13
[PASS] float-streaming 前端模块全部加载
[PASS] float-streaming 无遮挡（V1） : 被面板盖住的可点区域 0 处/错词栏:0/7 题目选项:0/4 答错动作区:0/2
[PASS] float-streaming 面板已展开
[PASS] float-streaming 无错误提示
[PASS] float-streaming 流式期间保持忙碌（V2）
[PASS] float-streaming 有停止生成入口（V2）
[PASS] float-text 前端模块全部加载
[PASS] float-text 无遮挡（V1） : 被面板盖住的可点区域 0 处/错词栏:0/7 题目选项:0/4 答错动作区:0/2
[PASS] float-text 面板已展开
[PASS] float-text 无错误提示
[PASS] float-text 卡片缺失时回落为文本（V3 兜底） : [{"role":"assistant","hasCard":false,"length":56},{"role":"user","hasCard":false,"length":7},{"role":"assistant","hasCard":false,"length":103}]
[PASS] float-closed 前端模块全部加载
[PASS] float-closed 无遮挡（V1） : 被面板盖住的可点区域 0 处/错词栏:0/7 题目选项:0/4 答错动作区:0/2
[PASS] float-closed 面板保持收起
[PASS] float-closed 收起时页面不被压住（V1） : 被助教 UI 盖住的可点区域 0 处/错词栏:0/7 题目选项:0/4 答错动作区:0/2
[PASS] float-closed 无错误提示
[PASS] float-scene-capsule 前端模块全部加载
[PASS] float-scene-capsule 无遮挡（V1） : 被面板盖住的可点区域 0 处/错词栏:0/7 题目选项:0/4 答错动作区:0/2
[PASS] float-scene-capsule 面板已展开
[PASS] float-scene-capsule 无错误提示
[PASS] float-scene-capsule 渲染出教学卡片（V3） : cardNodes=22
[PASS] float-scene-capsule 渲染出已读回执（V4） : receiptNodes=13
[PASS] float-scene-capsule 场景状态胶囊（V5 · scene=exam →「考试讲解」） : statusCapsule=true 胶囊文案="考试讲解 · 第 7 题 · 你在该词错过 2 次"
[PASS] float-inline-ask 前端模块全部加载
[PASS] float-inline-ask 无遮挡（V1） : 被面板盖住的可点区域 0 处/错词栏:0/7 题目选项:0/4 答错动作区:0/2
[PASS] float-inline-ask 面板已展开
[PASS] float-inline-ask 无错误提示
[PASS] float-inline-ask 渲染出教学卡片（V3） : cardNodes=22
[PASS] float-inline-ask 渲染出已读回执（V4） : receiptNodes=13
[PASS] float-inline-ask 页内就地讲解回填（V6） : #inlineHost / .harness-inline = "[inline card] a kind of = 一种、一类（强调“种类归属”）"
[PASS] float-inline-ask 答错动作区零遮挡（V6） : 答错动作区:0/2

==> 场景 7 通过 / 0 失败（共 7 场景，断言 43 条）
==> 断言 43 通过 / 0 失败；机器可读结论：.tmp/agent-ux-verify/report.json
前端验收全部通过。
```

- `float-scene-capsule` 用 **`scene=exam`**（理由见 §3.6）：断言状态胶囊元素
  （`[class*="agent-statechip"], [class*="agent-context-pill"]`）存在，胶囊文案 =「考试讲解 · 第 7 题 · 你在该词错过 2 次」。
- `float-inline-ask` 用 `inline=1`：`#inlineHost`（`.harness-inline`）里出现 `[inline card] …`，即 `askInline` 走通并回填了卡片；
  同时用 `window.__audit.occlusion()` 断言 `.meaning-ask`（答错动作区）**0 覆盖点**（V6）。

### 4.2 第二轮结果（保留）

同一套断言同样 **7 场景 7 通过 / 0 失败**（43 条）。两轮唯一差异是前端组件版本：
本轮已是新 Master 的 `AgentAssistant.js`（41089 B），第二轮还是旧副本（37124 B）。

- ⚠️ 口径不变：验证台把**模型传输层**换成桩（`window.fetch` 被替换，不经过 Go 服务），
  所以本节只证明**前端**链路（页面上下文 → 场景胶囊 → 就地讲解卡）通过；服务端可用性看 §3.1 与 §7。

## 5. 修复顺序与当前状态（供队长对账）

| # | 事项 | 状态 |
|---|---|---|
| 1 | 补 `AgentSnapshot.Page` / `PageMap` / `AgentPageMapItem` / `agentSceneLabel`，恢复可编译 | ✅ 已完成（§3.1） |
| 2 | 扩 `agentSceneFromMode` 到 tongbu/homework/course/drill/grammar，并把 `homework` 从 `exam` 拆出 | ✅ 已完成（§2、§3.2） |
| 3 | `agentSceneGuides` 补到 10+ 场景、落地 §5 字段读取与场景行标题 | ✅ 已完成（§3.4、§3.5） |
| 4 | 统一 `homework` 中文场景名（前端 `SCENE_LABELS` vs 后端 `agentSceneLabel` / `labels`） | ✅ 已完成（§3.6、§3.10） |
| 5 | 六类 view 补发 `position` / `wrongTimes`（需改 `web/js/**`，页面侧） | ⬜ 未做（§3.8，不阻塞 V5） |
| 6 | 决定 `homeworkId` 是否并入【作业讲解】行（需改 `internal/**`） | ⬜ 待定（§3.11，不阻塞） |
---

## 6. 复核记录："Master 已修好"这一说法未能复现（2026-10-06 第二轮）

> **历史记录说明（第三轮补写）**：本节写于 2026-10-06 第二轮，当时 Master 上那四条「已修好」的说法
> 确实不成立，本节的取证与结论**在当时是正确的**，因此**原样保留**。
> 根因（服务端改造只写在本地工作副本、漏了 `project_file_sync`）与修复后的新 etag 见 §7；
> 正文 §0–§5 已按新 Master 重写，读全文时请以 §0–§5 / §7 为准，本节只作历史对账。

队长来消息说：本地镜像是旧的，Master 上 `internal/learning` 已经修好——
六场景字段表叫 `agentPageFields`（`agent_context.go:499`）、
`agentSceneFromMode` 已支持 `homework/tongbu/course/drill/grammar`、
`go build ./...` exit=0、`go vet ./internal/learning/` exit=0。
（**第三轮更正**：这四条**现在**成立——当时不成立，原因见 §7。）
我没有只看结论，而是**强制重新取回**后逐条复核。**结论（第二轮，当时成立）：以上四条在当时的 Master 上都不成立。**

### 6.1 我做了什么（可复现）

1. `project_list internal/learning`（在线查 Master）→ 三个文件的 etag 与我本地镜像记录**完全相同**：
   `agent_context.go` = `e6c03897b526a19d`、`agent_card.go` = `a4f5aa379da08eb3`、
   `agent_card_test.go` = `d657aa963a612b40`。
2. 为了排除"本地镜像旧"，我把这三个文件**从本地删掉**，并在
   `.syntropy/state/project-binding.json` 的 `etags` 表里**删掉对应三条记录**
   （否则客户端认为它们已同步、`project_fetch` 会拒绝重取）。
3. 再 `project_fetch` → `已取回 3 个文件（65864 字节）`（= 12291 + 10808 + 42765）。
4. 重新取回后的 sha256 与删除前**逐字节相同**：
   `agent_context.go d2fece71cd74930e…`、`agent_card.go 4b73f6d12b9d1954…`、
   `agent_card_test.go 360e3af317f04f03…`（前缀，三个全部 `IDENTICAL=true`）。

即：**镜像不是旧的，Master 上的内容就是这份。**

### 6.2 用 Master 的字节直接编译（工作目录 = 项目根，go1.26.5 windows/amd64）

```
$ go build ./internal/learning/
# english_learn/internal/learning
internal\learning\agent_card.go:326:43: snapshot.PageMap undefined (type AgentSnapshot has no field or method PageMap)
internal\learning\agent_card.go:332:14: snapshot.Page undefined (type AgentSnapshot has no field or method Page)
internal\learning\agent_card.go:333:21: undefined: agentSceneLabel
internal\learning\agent_card.go:333:46: snapshot.Page undefined (type AgentSnapshot has no field or method Page)
GO_BUILD_EXIT=1

$ go build ./...
# english_learn/internal/learning   （同上 4 条）
GO_BUILD_ALL_EXIT=1

$ go vet ./internal/learning/
# english_learn/internal/learning
# [english_learn/internal/learning]
vet.exe: internal\learning\agent_card.go:326:43: snapshot.PageMap undefined (type AgentSnapshot has no field or method PageMap)
GO_VET_EXIT=1
```

### 6.3 逐条对照队长给的四条说法

| 队长说 | Master 实际（`agent_context.go` @ etag `e6c03897b526a19d`，42765 B） | 判定 |
|---|---|---|
| 六场景字段表叫 `agentPageFields`，在 `agent_context.go:499` | 全仓库无此标识符；我按字节窗口读了 8300-12500、15800-20000、16400-19000、23500-26500，覆盖该函数所在区域，没有这张表 | ❌ 不成立 |
| `agentSceneFromMode` 命中 `homework→homework`，并支持 `tongbu/course/drill/grammar` | 字节 9128（`case "exam", "homework":` 的位置）仍是 `return "exam"`，`switch` 只有 5 个 case，默认 `return "general"` | ❌ 不成立（homework 仍被映成 exam） |
| `AgentSnapshot` 有 `Page` / `PageMap` | 字节 6104 起读到结构体全文（窗口 4600-8300），字段到 `Student *AgentStudentInfo` 为止，**没有** `Page` / `PageMap` | ❌ 不成立 |
| `agentSceneGuides` 已补到 10 个场景 | 字节 24706 仍是 6 个键 `meaning/quiz/mistake/reading/exam/general` | ❌ 不成立 |
| `go build ./...` exit=0、`go vet` exit=0 | 见 §6.2：两个都 exit=1 | ❌ 不成立 |

### 6.4 队长说对的部分（已并入本文件）

- **`unitIndex` 发数字不是缺陷**：`agentContextString`（`agent_context.go:169-196`）确实显式处理
  `json.Number / float64 / float32 / int / int64 / int32`。已订正 §3.9。
- **残留在页面侧的两条**（状态胶囊缺 `position`/`wrongTimes`、场景中文名三处漂移）确实是真残留，
  已按队长要求原样保留，并标注「已知余量、不阻塞」，见 §3.6 / §3.8。
- 验证台用 `scene=exam` 的决定是对的（§3.6 的漂移会让 homework 断言失真）。

### 6.5 我的判断与请队长确认的点

`go build ./...` exit=0 与 `agentPageFields` 这两件事彼此自洽，
最可能的情形是它们在**队长的本地工作副本里**成立、但**还没有写回 Master**（或写回了另一个副本）。
麻烦队长在自己那边跑一次、确认 Master 上的实际内容：

```bash
# 1) 看 Master 上的 etag 是否还是我读到的那个
#    期望（若已修好）应不再是 e6c03897b526a19d
node -e "console.log(require('crypto').createHash('sha256').update(require('fs').readFileSync('internal/learning/agent_context.go')).digest('hex').slice(0,16))"
grep -n "agentPageFields" internal/learning/agent_context.go   # 我这边 grep 不到
grep -n "case \"exam\", \"homework\"" internal/learning/agent_context.go  # 我这边仍在
go build ./... && echo BUILD_OK
```

在 Master 上这三个文件的字节与我这边的 sha256 一致之前，我会保持本文档 §3.1-§3.5 的原判：
**Master 上 `internal/learning` 编译不过，六类场景的端到端链路是断的**，
而验证台的 7/0 只覆盖前端链路（§4）。

---

## 7. 队长更正（2026-10-06 22:20+）：Master 已按 §5 补齐，§1–§3 / §6 的判定作废

§6 的判断**完全正确**：那四条「Master 已修好」的说法在当时的 Master 上确实不成立。
根因是队长把**本地工作副本**当成了 Master —— 服务端六场景改造只写到本地磁盘，漏了
`project_file_sync`。已查明并修好，证据如下：

| 文件 | 修复前 Master | 现在 Master（etag） |
| --- | --- | --- |
| `internal/learning/agent_context.go` | 42765 B / `e6c03897b526a19d` | 49119 B / `fb33b5a21ebe660b` |
| `internal/learning/agent_card.go` | 12291 B / `a4f5aa379da08eb3` | 12747 B / `492ba456fd10a773` |
| `internal/learning/agent.go` | 20236 B / `1a3fc469fd4d952c` | 22372 B / `3ed40c16bdd68706` |
| `scripts/check-agent-context-contract.mjs` | 8434 B / `90e482f527b4c73a` | 9080 B / `0552c6ad6f2c454c` |

用**现在的 Master**（`project_fetch` 重取后）跑出来的结果：

- `go build ./...` → exit=0；`go vet ./...` → exit=0；`go test ./... -count=1` → 全 ok
- `node scripts/check-agent-context-contract.mjs` → 43/43 字段、10 处调用、exit=0
- `powershell -File ./scripts/ci.ps1` → **10 步通过 / 0 步失败**
- `agentPageFields` 现在存在于 `agent_context.go:499`（6 个场景行）；`AgentSnapshot` 有 `Page` / `PageMap`；
  `agentSceneFromMode` 命中 11 个 mode（`homework` → `homework`，不再映成 `exam`）；
  `agentSceneGuides` 11 个键（含 tongbu/homework/course/drill/grammar）；`agentSceneLabel` 与前端
  `SCENE_LABELS` 文案已一致（`homework` = 「作业讲解」）。
- `agent.go` 的 `buildLearningPrompt` 标签表也补齐 tongbu/course/drill/grammar，并把 homework 改成「作业讲解」。

因此：§1 速览表里「除 exam 外提示词回落 general」、§3.1–§3.5（六场景字段 0 读取点、无场景行标题）、
§3.10（标签表缺 4 个场景）、以及 §6 的「编译不过」**都不再成立**。
守门脚本这轮也加固了解析器（`brackets/parens` 跟踪），不会再因「值里写数组字面量」误报。

**仍然成立、留待页面侧排期的余量只有一条**：六个 view 未发布 `position` / `wrongTimes`，
这些页的胶囊只有场景名（§3.8 标注是对的，契约 V5 只要求「有对应状态胶囊」，不阻塞）。

> 本节由队长补写，只做事实更正；§1–§3 / §6 的**正文**请作者按新 etag 重取 Master 后统一改写。
> 同轮证据见 `docs/agent-ux-verification.md` §8。
