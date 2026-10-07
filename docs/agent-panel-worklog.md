# 智能助教面板改造 · 工作日志（agent-panel / 前端面板负责人）

> 日期：2026-10-06（第一轮交付；第二轮/第三轮验收台回归见 §7）
> 需求与契约：`docs/agent-ux-implementation-contract.md`（§0 全局约定、§2 教学卡片、§3 已读回执、§4.3–4.5 前端模块）
> 上游方案：`docs/agent-ux-optimization.md`（P0/P1/P2、验收 V1–V7）
> 写入范围：`web/js/agentSpeech.js`、`web/js/components/AgentTeachingCard.js`、`web/js/components/AgentAssistant.js`、`web/agent.css`、本文件
> 未触碰：`internal/**`、`web/js/main.js`、`web/js/learningContext.js`、其它页面组件、`scripts/**`

---

## 1. 改动文件清单

| # | 文件 | 类型 | 一句话 |
|---|---|---|---|
| 1 | `web/js/agentSpeech.js` | 新建 | 朗读封装：`speechSupported()` / `speak(text,opts)` / `stopSpeaking()`，不支持时静默返回 `false`，不抛错 |
| 2 | `web/js/components/AgentTeachingCard.js` | 新建 | 教学卡片组件，按契约字段顺序渲染 + 英文点读 + 生词入册 + 折叠自测 + 底部行动条 |
| 3 | `web/js/components/AgentAssistant.js` | 改造 | float/dock 形态、状态胶囊、已读回执、card 优先渲染、骨架计时、钉顶、停止/重试/复制/朗读 |
| 4 | `web/agent.css` | 改造 | 浮动 420px 可拖宽、`.agent-dock` 让位、卡片/回执/骨架/行动条/`.agent-word`/小屏抽屉 |
| 5 | `docs/agent-panel-worklog.md` | 新建 | 本文件 |

写入方式：4 个代码文件按 UTF-8（无 BOM）**字节原样同步**到 Master（`project_file_sync`，`base_etag` 取自 Master 最新版本；组件与 CSS 文件较大，逐字节同步可避免转写误差），本文件用 `project_write` 写入。

---

## 2. 每个文件做了什么

### 2.1 `web/js/agentSpeech.js`（新建，3991 字节）

- 导出面严格按契约 §4.1：`speechSupported()`、`speak(text, opts = {})`、`stopSpeaking()`。
- `opts`：`{ lang = 'en-US', rate = 0.9, onend }`；`onend` 在 `onend` / `onerror` 任一触发时只调用一次。
- 不支持语音合成（`window.speechSynthesis` 或 `SpeechSynthesisUtterance` 缺失、`window` 不存在）时：`speechSupported()` 返回 `false`，`speak()` 返回 `false`，`stopSpeaking()` 返回 `false`，**全程 try/catch，绝不抛错**。
- 细节：每次朗读前 `cancel()`（新朗读打断旧的）；模块内 `speakToken` 让"尚未开始"的旧朗读失效（避免 `stopSpeaking` 之后又被补读一遍）；语音列表为空时等 `voiceschanged` 或 300ms 超时后再读（Safari / 旧 Edge 首次调用会丢 utterance）；用 `addEventListener('voiceschanged')` 而不是 `onvoiceschanged =`，不覆盖既有 `web/js/speech.js` 的处理函数。

### 2.2 `web/js/components/AgentTeachingCard.js`（新建，10511 字节）

- `props: { card, compact }`、`emits: ['add-review', 'speak', 'ask']`、`name: 'AgentTeachingCard'`。
- 渲染顺序与服务端字段一一对应：`headline` → `verdict` → `points[]`（`.agent-card-label` 左侧色条 + `text`）→ `example{en,zh}`（英文段落 + 「🔊 朗读例句」）→ `check{prompt,answer}`（默认折叠，「看答案 / 收起答案」切换）→ `words[]`（chip：`.agent-word` 点读 + 释义 + 「+ 加入今日复习」→ `add-review`）→ `action{label,text}`（`compact=false` 时 `.agent-card-action` 底部 sticky 行动条，`compact=true` 时 `.is-inline` 行内展示）。
- 英文词/短语渲染为 `<button class="agent-word">`：`renderRich()` 先按卡片生词里的多词短语（如 `a kind of`，大小写不敏感）整体匹配，再回落单个人工切分的英文词；文本先 `escapeHTML` 再拼 HTML（`v-html` 内容全部转义，模型输出无法注入）。
- 交互：
  - `agent-word` 点击 → `$emit('speak', 词)`（事件委托，不给每个词挂监听）。
  - 生词 chip → `$emit('add-review', { id, word, meaning, level })`。
  - 行动条按钮：`action.kind === 'drill'` → `$emit('ask', { quickAction: 'drill' })`；`'review'` → `$emit('ask', { quickAction: 'add-review' })`；`'read'` / 缺省且卡片有 `check` → 本地展开自测答案并滚到该段（不打扰服务端）；否则 `$emit('ask', { kind, label, text })`。
- 健壮性：`card` 为空 / 全字段为空 → 渲染 `.agent-card-empty` 空态文案，不报错（`empty` computed）；`points` / `words` 上限 8 条、`words` 按英文去重；字段类型不对（非数组 / 非对象）一律当空处理。

### 2.3 `web/js/components/AgentAssistant.js`（改造，41089 字节；含第二轮 + 第三轮验收台相关修复）

- **形态（§4.4 第 1 条）**：`placement` = `'float'`（默认）| `'dock'`，读写 `localStorage.lingoBloomAgentPlacement`；模板根节点 class 为 `agent-float` / `agent-dock`；头部新增「停靠 / 浮动」切换按钮（V1 的切换入口放在面板内，因为 `main.js` 不在我的写入范围）。面板宽度另存 `lingoBloomAgentPanelWidth`。
- **状态胶囊**：删除了原 `contextCard`（题干 / 音标 / 选项 / 判语复述），改为一行 `agent-statechip`：`场景 · 第 N 题 · 你在该词错过 M 次`，数据全部来自 `assistant.context`（`scene` / `position` / `wrongTimes`，阅读场景用 `paragraph`）；右侧「定位题目」按钮 → `this.$emit('focus-item', { wordId, level })`。`position` 是数字或字符串都能显示（`13` → `第 13 题`；`'13 / 4590'` → `第 13 / 4590 题`）。场景名扩到 13 类（含同步训练 / 作业 / 课程 / 变式练习 / 考试 / 语法），配合 V5。
- **已读回执（§3 / V4）**：`out.receipt.items` 渲染成 chips，「助教已读 + chips + 查看读了什么」整体是一个按钮，点击展开 `receipt.text || out.snapshotText`（`<pre>`，可滚动）；`ok: false` 的 chip 置灰（`.is-miss`）；`receipt.stale` 时不展示快照原文，改显示「页面上下文已过期（超过 5 分钟）…」。
- **渲染优先级**：`out.card` 存在 → `<agent-teaching-card :card="out.card" />`；否则 `renderMarkdown(out.message)`（**不允许白屏**）；两者都没有时显示「这次没有得到回答内容，可以点重试」。
- **流式（§4.4 第 5、6 条 / V2）**：
  - 发送体带 `format`：讲解类动作（空 / `explain` / `explain-wrong` / `compare` / `explain-sentence`）→ `'card'`；确定性的 `drill` / `add-review` → `'text'`（它们返回 `drill` / `actions` 而不是卡片，加卡片 JSON 指令反而会污染输出）。
  - card 模式：delta 只累积到气泡的 `raw`，**不逐字渲染**；界面是 `.agent-skeleton` 骨架 + 「已用 N 秒」（250ms 计时器）；`done` 后换成卡片。
  - 兜底：card 模式收到的第一段 delta 若不是 JSON（旧后端 / 兜底散文），自动切回文本模式逐字渲染，避免骨架一直转。
  - 文本模式保留逐字追加。
  - 钉顶：新回答开始（气泡创建时）`scrollTop = 该 article.offsetTop - 8`；delta 期间只在用户本来贴着底部（距底 < 80px）才跟随，不再每帧 `scrollHeight`。
- **停止 / 重试 / 复制 / 朗读**：`AbortController` + `reader.cancel()` 的「停止生成」（流式条与错误区都可达）；停止后不弹红条、保留已得内容并标记「已停止」；每条回答下方有「重试 / 复制 / 朗读整段」与 `durationMs`；「重试」会先撤掉失败问答再发同一 payload（`retryPayload` 随气泡保存），错误区也有「重试」入口。
- **错误提示**：`describeError()` 把 401/403、429、408/504、5xx、网络失败、Abort 翻成中文提示（复用既有 `error` 状态），另有 4 秒自动消失的 `hint` 轻提示（不支持朗读、动作不可用等）。
- 保留：`agent-fab` / `agent-nudge` / `agent-quick` / `agent-markdown` / `agent-drill` / `agent-inline-link` 的行为与类名不变；快捷动作、变式练习下发（`setDrill`）、`open-drill` / `navigate` 事件不变；新增 `focus-item`。

### 2.4 `web/agent.css`（改造，31006 字节；含第二轮浮动让位 + 第三轮跨样式表防御）

- 改动既有规则（只动两处）：`.agent-panel` 宽度 `min(410px,…)` → `--agent-panel-width:420px;width:min(var(--agent-panel-width),calc(100vw - 24px))`；`.agent-panel>main` 加 `position:relative`（让 `offsetTop` 相对滚动容器，钉顶才准）。
- 新增（追加在文件末尾，不改既有选择器语义）：
  - 状态胶囊：`.agent-context.is-capsule`、`.agent-statechip*`。
  - 教学卡片：`.agent-card / -head / -kind / -headline / -verdict / -section / -label（含色条 ::before）/ -text / -example .en/.zh / -speak / -toggle / -answer / -words / -empty`、`.agent-word-chip`、`.agent-word-meaning`、`.agent-chip-add`、`.agent-word`（点读）、`.agent-card-action`（`position:sticky;bottom:0`，`.is-inline` 行内）、`.agent-panel article.has-card{max-width:100%}`。
  - 已读回执：`.agent-receipt*`（chips、`.is-miss` 置灰、`-text` 等宽可滚、`.is-stale`）。
  - 骨架：`.agent-skeleton*` + `@keyframes agent-shimmer / agent-pulse`。
  - 消息操作条与流式条：`.agent-msg-actions`、`.agent-stopped`、`.agent-copy-hint`、`.agent-empty-answer`、`.agent-streambar`、`.agent-error-retry`、`.agent-error.is-hint`。
  - 拖拽把手：`.agent-resize`（面板左缘，12px 命中区 + 视觉 grip）、`body.agent-resizing`。
  - 停靠形态（`@media(min-width:901px)`）：`.agent-dock{--agent-rail:440px}`、`.agent-dock .app-content>main{margin-right:calc(var(--agent-rail) + var(--page-gutter))}`（另加 `width` 收窄，见 §4）、`.agent-dock .agent-panel` 贴右缘整高、`.agent-nudge` / `.agent-fab` 左移到栏外。
  - 小屏（`@media(max-width:900px)`）：float / dock 都变成全屏抽屉（`inset:0;height:100dvh;border-radius:0`），并还原让位规则避免留下空栏；`@media(prefers-reduced-motion:reduce)` 关掉骨架与轻提示动画。
- **第二轮补的浮动让位（V1）**：`body.agent-float{--agent-rail:calc(var(--agent-panel-width,420px) + 44px)}` + `body.agent-float .app-content>main{...}`，栏宽跟着拖拽宽度走；小屏抽屉形态还原该规则。
- **验证台内容容器让位**：`body.agent-float .harness-shell, body.agent-dock .harness-shell{margin-right:var(--agent-rail)}`（验收台 `docs/agent-ux-e2e-harness.html` 的页面骨架不是产品页面、没有 `.app-content`，这条让 `window.__audit.occlusion()` 量的是面板本身而不是宿主页面）。
- 自检：括号配平 306/306，逐块声明解析 0 处异常；两条新规则的实际生效值由无头 Chrome 读回（`appContentMain.marginRight = 500px`（float，464+36）/ `476px`（dock，440+36）），见 §7。

---

## 3. 自检结果（真实输出）

环境：`node --version` → `v24.15.0`；工作目录 = 项目根。

```
$ node --check web/js/agentSpeech.js
(无输出)
exit=0

$ node --check web/js/components/AgentTeachingCard.js
(无输出)
exit=0

$ node --check web/js/components/AgentAssistant.js
(无输出)
exit=0
```

补充自检（本次额外做的，不属于交付物）：

1. **模板标签配平**（正则扫描两个组件的 `template` 字符串，剔除 `{{ }}` 后配对）：`AgentAssistant.js -> template tags balanced`、`AgentTeachingCard.js -> template tags balanced`。
2. **CSS 结构**：`open=303 close=303`，逐块声明解析 `issues=0`。
3. **模块可加载 + 方法行为**（把相关模块复制到系统临时目录、去掉 import 上的 `?v=` 查询串后用 `Vue` / `window` 桩加载；临时目录在 `%TEMP%\agent-verify-*`，未写入仓库）：
   - `card props: card,compact | card emits: add-review,speak,ask`；`panel emits: open-drill,navigate,focus-item | registered: AgentTeachingCard`
   - `renderRich('A kind of bear <b>x</b> & "y" don\'t')` → 短语 `a kind of` 整体成一个按钮，其余单词各自一个按钮，`<` / `&` / `"` / `'` 全部转义
   - `capsule(meaning) → 词义练习 · 第 13 题 · 你在该词错过 2 次`；`capsule(reading) → 阅读理解 · 第 3 段`；`capsule(none) → 还没打开练习页，也可以直接问我问题`
   - `progressText({position:3}) → 第 3 题`；`progressText({position:'13 / 4590'}) → 第 13 / 4590 题`
   - `describeError`：500 → 「助教服务暂时不可用（500），稍后点「重试」再来一次。」；网络失败 → 「网络好像断了…」；AbortError → 「已停止生成。」；401 → 「登录状态已过期…」
   - `formatDuration(1830) → 1.8 秒`；`panelStyle(float) → {"--agent-panel-width":"480px"}`；`nudgeWidth(+500/-500) → 560 / 360`（上下限生效）；`setPlacement('dock')` 写入 `lingoBloomAgentPlacement`
4. **浏览器侧验证另见 §7**：第一轮只做静态自检；第二轮起队长提供了无头 Chrome 验收台，我在**验收台 + 契约样例桩**上做了遮挡审计与渲染断言（V1–V4），仍未起 Go 服务、未做真实后端联调（见 §6.5）。

---

## 4. 与契约的偏离 / 需要队友知晓的接口点

1. **`AgentTeachingCard.props.card` 不是 `required`**（契约 §4.3 写的是 required）。改为 `{ type: Object, default: null }`：让「解析失败 / 请求失败」的调用方直接传 `null` 也能走空态、不产生 Vue 警告；渲染行为与契约一致。`compact` 与 `emits` 完全按契约。
2. **停靠让位规则多加了一条 `width`**：契约只写了 `margin-right:calc(var(--agent-rail) + var(--page-gutter))`，但 `redesign.css` 里 `.app-content>main` 是 `width:calc(100% - var(--page-gutter)*2)` 的块级元素，只加 `margin-right` 会让 main 溢出到栏下面。实际实现为：
   `.agent-dock .app-content>main, .agent-dock .app-content>.hero{margin-right:calc(var(--agent-rail) + var(--page-gutter));width:calc(100% - var(--agent-rail) - var(--page-gutter)*2)}`
   （顺带覆盖 `.hero`，否则首页 hero 仍会被栏压住。）
3. **`.agent-dock` 会在「停靠 + 面板打开 + 助教启用」时镜像到 `document.body`**：契约的 `.agent-dock .app-content>main{…}` 要求 `.agent-dock` 是 `main` 的祖先，而 `<agent-assistant>`（`main.js` 第 573 行）是 `main` 的兄弟节点，仅靠模板根节点上的 class 无法让页面让位。根节点仍按契约带 `agent-float` / `agent-dock`；body 上的镜像只用于驱动让位，面板收起时移除（否则会留一条空栏）。
4. **停靠形态仍是 `position:fixed`**（贴右缘、整高 440px），靠 main 的 `margin`/`width` 让位实现「不遮挡」。原因：`.app-content` 是块级流，改成 `static`/`sticky` 会把面板排到页面内容下方。视觉结果 = 右侧栏，V1 的「零遮挡」成立；若希望它随页面滚动，需要 `main.js` 侧把 `.app-content` 改成 flex/grid —— 超出我的写入范围。
5. **卡片生词的「+ 加入今日复习」**：服务端 `add-review` 是确定性动作，按 `snapshot.Current`（= 请求 `context.wordId` / `level`，服务端再回词库校验）入队。因此：卡片词 == 当前题词 → 直接发 `quickAction: 'add-review'`；卡片词 != 当前题词 → 只把 `context` 的 `wordId` / `level` 临时对齐到这个词（不带当前题的选项 / 答案），仍走确定性动作、不调模型。目的是让「生词入册」真的把卡片里的词入册，而不是误把当前题入册。若后端后续新增「按 wordId 入册」的字段，这段可以简化。
6. **新增的小东西（契约未列，属于落地必需）**：面板头部的「停靠 / 浮动」切换按钮；面板宽度持久化键 `lingoBloomAgentPanelWidth`；`durationMs`、「已停止」等界面文案；`focus-item` 事件（契约 §4.4 要求，但目前没有接收方 —— `main.js` 归队友，面板只上报，不做 DOM 滚动，避免两边抢滚动条）。
7. **`format` 只在讲解类动作上带 `'card'`**（契约说「发送时带 `format: 'card'`」）。`drill` / `add-review` 走 `'text'`，其余请求一律 `'card'`。
8. **朗读语种**：卡片里的英文词 / 例句 🔊 用 `en-US`；「朗读整段」是中文讲解为主，用 `zh-CN`。
9. **未改动的契约项**（属队友范围，前端已按契约准备好接收）：页面侧 `publishContext` 的新字段（`pageMap`、`homeworkId`…）、`learningContext.askInline`、后端 `format`/`card`/`receipt`/`snapshotText`、`scripts/check-agent-context-contract.mjs`。后端这些字段还没上线时，面板表现为：无 `card` → Markdown 回落（不白屏）；无 `receipt` → 不渲染回执行。
10. **浮动形态也让位（V1）**：契约 §4.5 只写了 `.agent-dock` 的让位规则，但契约 §6 V1 要求「浮动面板不再遮挡右侧答题区/错词栏的可点区域」。现在 float 形态下 `main`（及 `.hero`）同样按 `--agent-rail = 面板宽度 + 44px` 让位；浮动面板仍是 `position:fixed` 的圆角浮卡，区别只剩视觉与栏宽语义。
11. **`.harness-shell` 让位兜底（验收台相关，见 §7.3）**：`web/agent.css` 末尾多了一条
    `body.agent-open.agent-float .harness-shell, body.agent-open.agent-dock .harness-shell{margin-right:calc(var(--agent-live-rail,420px) + 44px)}`（只在 `min-width:901px`）。验收台不是产品页面（没有 `.app-content`），它自带的让位 shim 又是死选择器，这条兜底让 `window.__audit.occlusion()` 量的是面板本身（面板宽度由组件写到 body 的 `--agent-live-rail`，拖宽跟着走）。生产页面没有 `.harness-shell`，规则惰性；若队长把 harness 的 shim 修好，这条可以删。

---

## 5. 与验收（V1–V7）的对应关系（本文件职责范围内）

| 编号 | 本文件提供的实现 | 仍需别人 / 环境的部分 |
|---|---|---|
| V1 | `.agent-dock` 让位规则、面板整高贴右缘、轻提示与悬浮球左移、小屏抽屉；面板内可切换 float/dock | 浏览器实测（起服务 + 截图） |
| V2 | 新回答钉顶（`offsetTop`）、delta 期间不拉到底、`AbortController` + `reader.cancel()` 停止生成、骨架 + 秒数 | 浏览器实测 |
| V3 | `AgentTeachingCard` 全字段渲染：结论 / 要点（色条）/ 例句（🔊）/ 30 秒自测（折叠）/ 生词入册 / sticky 行动条 | 后端 `card` 字段（队友）+ 实测 |
| V4 | 回执 chips（`ok:false` 置灰）+ 点击展开 `receipt.text` / `snapshotText`，`stale` 不展示过期题目 | 后端 `receipt` / `snapshotText`（队友） |
| V5 | 状态胶囊已支持 13 个 scene 短名（含同步训练 / 作业 / 课程 / 变式练习 / 考试 / 语法），字段缺省时优雅降级 | 页面侧 `publishContext`（队友） |
| V6 | 卡片式讲解就地渲染、生词入册、`ask` 可转「出同类题」 | 页面侧就地展开（队友） |
| V7 | 3 个 `.js` 全部 `node --check` 退出码 0（见 §3） | Go 侧 `gofmt` / `go vet` / 契约守门（队友） |

---

## 6. 遗留问题

1. `focus-item` 目前没有接收方（`main.js` 归队友）：点击「定位题目」只发出事件，页面不会滚动 / 高亮题目卡。
2. 停靠让位依赖 `.agent-dock` 在 body 上（见 §4.3）；如果队友在 `main.js` 里也加了让位逻辑，请二选一，避免重复扣减宽度（我的规则只在 `min-width:901px` 生效，小屏已还原）。
3. 生词入册走「临时对齐 `context.wordId`」（§4.5）——后端若对 `add-review` 增加额外上下文校验，需要同步调整。
4. 卡片解析失败的兜底是 `renderMarkdown(out.message)`（契约要求）：此时界面上会看到模型原始 JSON 文本，不白屏但不好看；若要更好，可在后端加「解析失败改回散文」。
5. 未做**真实后端**实测（本机没有起 Go 服务；验收台用的是契约样例桩）。浏览器侧已经在无头 Chrome 里跑通，见 §7。
6. 验收台两处需要队长修：harness 没有 `#harness-report` 产出（导致 `node scripts/agent-ux-verify.mjs` 4/4 FAIL）、`--dump-dom` 那次没给 `--window-size`（默认 764×485 → 全屏抽屉 → V1 必然报遮挡）；另有一条死选择器（可修可不修，我已兜底）。详见 §7.3。
7. 队长脚本会把截图与 Chrome profile 写到 `.tmp/agent-ux-verify/`（本地未入库），确认不影响仓库整洁。

---

## 7. 第二轮起：跑验收台（2026-10-06，队长通报「验收台已就绪」后）

### 7.1 命令与真实输出（队长修正后复跑，当前落盘版本）

`node scripts/agent-ux-verify.mjs`（Chrome：`C:\Program Files\Google\Chrome\Application\chrome.exe`）

```
==> 智能助教前端验收台（C:\Program Files\Google\Chrome\Application\chrome.exe）
    静态服务 http://127.0.0.1:8137  截图目录 .tmp/agent-ux-verify/

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

**更正（重要）**：本节早先记录的「4 场景 / 4 FAIL，卡在 `页面里没有 harness-report`」是**我读到了 22:16 之前的旧副本**（当时本地 `docs/agent-ux-e2e-harness.html` 是 18032 字节、全文 0 次 `harness-report`，我在本地确实复现了那个 FAIL）。该结论已失效：harness 现在是 **31887 字节 / etag `9e04c1d0c4d5acfc`**（`harness-report` 2 次，`statusCapsuleText` / `inlineHostText` / `occlusion` / `cardNodes` / `receiptNodes` / `panelOpen` / `stopButton` 齐备），脚本扩到 **7 场景 / 43 断言**，并在 dump-dom 前加了 `--virtual-time-budget=20000`。我 22:33 在**当前落盘版本**上重跑：**43/43 PASS，退出码 0**。上面那段代码块就是这次的真实输出。

### 7.2 用同一台验收台做等价断言（我自己的探针，写在系统临时目录，未入库）

方式：同样的静态服务 + 无头 Chrome，改用 CDP `Runtime.evaluate` 直接读 `window.__harness.problems`、`window.__audit.occlusion()`、`.agent-card` / `.agent-receipt-chip` / `.agent-stop` / `.agent-skeleton` 节点数；视口 1440×960。

| 场景 | 模块问题 | V1 遮挡（错词栏 / 题目选项） | V3/V4/V2 断言 | 备注 |
|---|---|---|---|---|
| float-card | 0 | **0/9 · 0/4（ok:true）** | card=1、receipt chips=6、`.agent-word`=27 | 面板 left=998 / 宽 420，`shellMarginRight=464px` |
| dock-card | 0 | **0/9 · 0/4（ok:true）** | card=1、receipt chips=6 | 面板 left=1000，内容右缘 1000 |
| float-streaming | 0 | **0/9 · 0/4（ok:true）** | busy=true、`.agent-stop`=1、骨架「助教正在整理这道题的讲解 · 已用 2 秒」 | 流式桩故意不关流 |
| float-text（card 缺失回落） | 0 | **0/9 · 0/4（ok:true）** | card=0、`.agent-markdown` 渲染出 143 字文本 | 不白屏 |
| float-card @764×485（反向对照） | 0 | **6/9 · 4/4（ok:false，符合小屏抽屉预期）** | card=1 | 见下方说明 |

- 队长给的改造前基线（错词栏 7/9 被盖住、cardNodes=0、receiptNodes=0）在这三个维度已经全部消掉。
- 页面控制台：4 个场景 0 个 JS 异常、0 个 warning（只有一次 favicon 404，来自我的静态服务）。
- 截图：`.tmp/agent-ux-verify/*.png`（队长脚本生成，1440×960，跑的是我的代码）与 `%TEMP%\agent-panel-probe2\*.png`（我的探针）。
- 上面这张表是**最终落盘版本**（`AgentAssistant.js` etag `891ca5e77d821e8c` + `agent.css` etag `40142654c0d0c93a`）的复测结果；同一批数字在第二轮（仅 CSS 兜底、未加跨样式表防御时）与第三轮完全一致，说明 §7.4 的卡片修复没有动到遮挡几何。
- 反向对照（同时解释了 §7.3 第 2 条）：把视口还原成无头 Chrome 的默认 `764×485` 再跑同一个 float-card，面板按契约 `@media(max-width:900px)` 变成**全屏抽屉**（`panel = {left:0,top:0,width:764,height:485}`），遮挡审计立刻变成「错词栏 6/9、题目选项 4/4 被盖住」——这正是 `--dump-dom` 那次没有 `--window-size` 时会量的东西。

### 7.3 验收台三处问题（**现已全部修复/确认，本节保留作历史记录**）

1. ~~补报告产出~~ → **队长已修**：harness 现在发布 `<pre id="harness-report">`（31887 B / etag `9e04c1d0c4d5acfc`），43 条断言因此得以全部执行（原字段清单：`problems` / `occlusion.targets[].{covered,sampled}` / `panelOpen` / `error` / `cardNodes` / `receiptNodes` / `busy` / `stopButton` / `messages[].{role,length}`）。
2. ~~dump-dom 缺 `--window-size`~~ → **结论要分两层说（我 22:40 做了对照实验）**：
   - 队长的线上 UI 测试走 CDP `Emulation.setDeviceMetricsOverride(1440×960)`，实测浮动面板 `width=420 right=18`、遮挡 `0/9 · 0/9 · 0/0 · 0/9` —— 那一层没问题；我复跑 `node scripts/agent-ux-verify.mjs` 也是 43/43 PASS（§7.1）。
   - 但脚本里 `--dump-dom` 那一趟**仍然不带窗口尺寸**：实验 A（全新 profile，只跑 dump-dom）实测视口 764×485、面板是 `{0,0,764,485}` 的全屏抽屉（`@media(max-width:900px)` 生效），此时三个目标的采样点中心 y = 882…1903，**大半在 485px 视口之外**，`elementFromPoint` 返回 `null` → 记为「未遮挡」，于是 V1 报 `0/7 · 0/4 · 0/2`。也就是说这一趟的 V1 在干净 profile 下是**空断言**（量的不是桌面布局）。
   - 实验 B（同一 profile 先跑一次带 `--window-size=1440,960` 的截图，再 dump-dom，即脚本现在的顺序）与实验 C（复用脚本的 `.tmp/agent-ux-verify/profile`）都实测面板 `{1002,312,420,620}`、目标点全在视口内且命中页面元素本身（`SMALL/B/PRE/BUTTON`，没有一个是面板）→ 这一趟的 V1 才是真的。
   - 一句话：脚本能否量到桌面布局，取决于 profile 里是否残留着截图那趟写进去的 1440×960 窗口尺寸。**建议给 dump-dom 也加 `--window-size=1440,960`（一行），让断言与 profile 状态无关**；不改也不影响上述 43/43，因为它现在确实量到了（B/C 路径）。
3. ~~harness 的让位 shim 是死选择器~~ → 已由 `web/agent.css` 兜底接管（`body.agent-open.agent-float|agent-dock .harness-shell`，实测 `shellMarginRight=464px`）；队长侧不再依赖那条死选择器，我这两条兜底在生产页面惰性、可随时删。

### 7.4 本轮前端侧修的三个真问题（本轮改动）

1. **浮动形态也要让页面让位**（契约 §6 V1）。原实现只有 `.agent-dock` 让位，浮动形态仍是覆盖式浮层（验收台 float 场景实测 8/9 被盖住）。现在 float 也按 `--agent-rail = 面板宽度 + 44px` 让位，拖宽后依然零遮挡；body 上的 `agent-float` / `agent-dock` 只在「面板开着且助教可用」时加，关掉面板不会白留空栏。
2. **钉顶 + 卡片 sticky 行动条两个真 bug**：
   - 原来在「DOM 里还没有这条气泡」时会退化成分支 `scrollTop = scrollHeight`（滚到文末），于是卡片的 sticky 行动条落到滚动区外、被输入框压住（探针实测行动条 top 746 / bottom 853，滚动区 bottom 802 → 被裁）。现在只在气泡真的渲染出来后钉；钉不上就等下一次 DOM 更新（`updated()`），绝不滚到文末；回答落定后再校准一次，且用户自己滚过就不打扰。
   - 流式期间 delta 的「贴底跟随」会把刚钉好的开头又拽回文末：现在本轮钉过顶部就整轮不再跟随（`pinGuard`）。实测整卡回答 `scrollTop = 卡片 offsetTop - 8`（1424 = 1432 - 8）；骨架期只能滚到 118（内容高度不够、没有更多可滚空间，属正常）。
3. **教学卡片被全局元素选择器压扁（跨样式表，产品页同样会中）**：`web/style.css` 有一条全局 `header{display:flex;align-items:baseline;gap:16px;box-shadow:0 2px 12px #dce5f2}`，而卡片用的是 `<header class="agent-card-head">`。`.agent-card-head` 没声明 `display`，于是被元素选择器接管：实测 computed `display:flex`，`headline` 被压到 **98px 宽**（一行 1–2 个字）、`verdict` 92px，两者并排（截图见 `%TEMP%\agent-panel-probe10\zoom.png`）。已在 `web/agent.css` 里显式还原：`.agent-card-head{display:block;align-items:normal;gap:0;box-shadow:none}`（顺带给 `.agent-panel>header` 也补 `box-shadow:none`，避免同一元素规则漏进来）。修完实测 `headline`/`verdict` = 288px 满宽。
4. **卡片被 88% 限宽吃了两次**：`.agent-panel article{max-width:88%}`（气泡不该顶满）也会命中嵌套的 `<article class="agent-card">`，420px 面板里卡片只剩 280px。现在补 `.agent-panel article.agent-card{max-width:100%}`，卡片用满消息列（318px，实测）。

### 7.5 本轮自检（真实输出）

```
$ node --check web/js/agentSpeech.js
(无输出) exit=0
$ node --check web/js/components/AgentTeachingCard.js
(无输出) exit=0
$ node --check web/js/components/AgentAssistant.js
(无输出) exit=0
$ node scripts/agent-ux-verify.mjs
（见 §7.1：4 个场景都停在 harness-report 缺失，前端侧无异常）
```

合入 `web/agent.css` 的兜底与卡片修复后重跑一遍，输出逐字一致（仍是 4 个 `报告可读 : 页面里没有 harness-report`，`0 通过 / 4 失败`，退出码 1）；三个 `.js` 的 `node --check` 仍是「无输出 / exit=0」。

### 7.6 第三轮：与队长版本的合并记录（写入前先取最新 etag）

回写时被乐观并发挡了两次，说明队长也在改同一批文件。处理方式：**不覆盖**，先 `project_fetch` 取 Master 最新版本，逐行 diff 出队长的改动，再把它合进我的版本后带 `base_etag` 重发。

| 文件 | 我取到的 Master 版本 | 队长的改动 | 合并结果 |
|---|---|---|---|
| `web/js/components/AgentAssistant.js` | 38564 字节 / etag `360a3b5cfe67a38d` | `syncPlacementClass()` 改用 `body.agent-open` + `--agent-live-rail` 驱动浮动让位；`beforeUnmount` 清理 `--agent-live-rail`；场景短名标签 `错题分析` / `文章阅读` / `作业讲解` | 保留队长的形态驱动与标签，把「钉顶 + 用户滚过不打扰」的补丁（`pinTarget` / `pinGuard` / `pinAnchor` / `applyPin` / `settlePin` / `updated()`）重新贴回；**不带** `--agent-panel-width` 的 body 级清理（队长已删）→ 落盘 **41089 字节 / etag `891ca5e77d821e8c`** |
| `web/agent.css` | 28854 字节 / etag `88fcca861a0f0ac3` | `body.agent-open .agent-fab{display:none}`、`body.agent-open.agent-float .app-content>main{--agent-rail:var(--agent-live-rail,420px);…}`、删掉我的 `.harness-shell` 兜底与 `.agent-dock .agent-nudge` 左移 | 保留队长写法，补回「`.harness-shell` 兜底（改用 `--agent-live-rail`）+ `.agent-dock .agent-nudge` 左移」+ 第三轮的跨样式表防御 → 落盘 **31006 字节 / etag `40142654c0d0c93a`** |

`AgentAssistant.js` 与队长版本的最终 diff 只有 20 处 hunk，全部是我这一侧的钉顶/让位新增（无一行是删除队长内容）；`AgentTeachingCard.js`（etag `a7bb39fa93aad562`）与 `agentSpeech.js` 本轮未改。

### 7.7 缓存串一致性审计（队长把 r1 → r2 之后，2026-10-06）

队长把 `web/index.html` 的 `agent.css` 与 `web/js/main.js` 的 4 个页面组件 import 统一 bump 到 `?v=20261006-agent-ux-r2`，并明确「缓存串我统一 bump 了，你不用再动」。为了确认没出现**同一个模块被两种查询串加载两次**（那会让 ESM 变成两个模块实例：learningContext 的上下文总线 / AgentTeachingCard 注册都对不上），我把 Master 上整个 `web/js/**` + `web/*.html` 重取到本地做了一次全树扫描（`from "…?v=…"` 与 `href="…agent.css…"`）：

| 模块 | 查询串 | 加载方 |
|---|---|---|
| `components/AgentAssistant.js` | `-r2` | `main.js:22`（全树只此一处，单实例） |
| `learningContext.js` | `-r1` | 我 + `main.js:25` + 11 个页面组件，**全部 r1** |
| `components/AgentTeachingCard.js` | `-r1` | 我 + MeaningPracticeView / QuizView / ReadingView，**全部 r1** |
| `agentSpeech.js` | `-r1` | 我 + ReadingView，**全部 r1** |
| `markdown.js` | `-r1` | 只有我 |
| `agent.css` | `-r2` | `web/index.html:22`（验收台测试页仍用 r1，无所谓） |

结论：图是自洽的——被改过的文件（`agent.css`、`AgentAssistant.js`、4 个页面组件）都用 r2 破缓存，没改过的共享模块统一停在 r1，且**同一个模块全树只有一个查询串**，不存在双实例。

> ⚠️ 后来者注意：**不要把 `AgentAssistant.js` 里那 4 条内部 import（`markdown.js` / `learningContext.js` / `agentSpeech.js` / `AgentTeachingCard.js`）单独改成 r2**。页面组件与 `main.js` 仍按 r1 加载 `learningContext.js` / `AgentTeachingCard.js` / `agentSpeech.js`，一旦我这里用 r2，同一个模块就会以两个 URL 各实例化一次（上下文总线/组件注册会分裂）。要 bump 就四处一起 bump。

### 7.8 与队长线上验收的对齐（2026-10-06 22:23–22:35，最后一次同步）

- 队长在**最终落盘版本**（`AgentAssistant.js` 41089 B / `891ca5e77d821e8c` + `agent.css` 31006 B / `40142654c0d0c93a`）上做真 Chrome + 真 deepseek-flash 的线上验收：UI 层 22 条断言全绿（`agent-float`、`position=fixed width=420 right=18`、遮挡 `选项 0/9 · 答错动作区 0/9 · 就地讲解卡 0/0 · 错词栏 0/9`、胶囊「词义练习 · 第 1 题 · 你在该词错过 1 次」、0 条 JS 报错），截图 `docs/images/agent-live-*.png` 已用最终态重生成。
- 我 22:33 独立复跑 `node scripts/agent-ux-verify.mjs`：**7 场景 / 43 断言 / 0 失败，退出码 0**（真实输出见 §7.1）。
- 我修的两条跨样式表规则（`.agent-card-head` 还原 `display`、`.agent-panel article.agent-card{max-width:100%}`）就在被线上验证过的 31006 B `agent.css` 里，不会被回退。
- `SCENE_LABELS.homework` =「作业讲解」，与后端 `agentSceneLabel` 一致；`scripts/agent-ux-verify.mjs` 里「前端 homework = 作业练习」那句注释是 22:16 的旧文案，已不成立。
- 冲突状态说明（精确版）：队长侧已把 22:15 的 `main.js` 冲突副本归档；**我这边 `.syntropy/conflicts/web/js/components/AgentAssistant.js`（40958 B / 22:13，expected `3a8e9b85c0ca8e8c`）仍留在原处**——它是我第二轮被挡下时的旧副本，内容已归档到 `%TEMP%\agent-panel-round3\conflicts-archive\`，Master 上的同路径文件是后续带 `base_etag` 成功写入的合并结果（`891ca5e77d821e8c`）。所以 `project_status` 仍会列一条 `conflicts: web/js/components/AgentAssistant.js`，那是**历史记录，不是未解决的冲突**（尝试删除时被本机策略拒绝，故保留并在此说明）。
- 缓存串：队长统一 bump 到 `?v=20261006-agent-ux-r2`（`index.html` 的 `agent.css`、`main.js` 里 4 个 view + `AgentAssistant`）；我内部 4 条 import 保持 r1 是正确的（见 §7.7 的双实例警示），**不要再动**。
