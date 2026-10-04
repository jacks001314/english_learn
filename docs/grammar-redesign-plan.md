# 语法模块 导航与页面内容 重设计方案

- 版本：v1 → **已评审并进入实施**（P1 已完成，实测状态见 §12）
- 日期：2026-09-27
- 范围：`web/js/components/GrammarView.js`、`web/js/grammar/**`、`web/grammar.css`、以及进入语法模块的交叉入口
- 依据：代码与数据实测（附录 A/B）+ 用户截图标注（左侧专题导航 ①、右侧内容区 ②）

---

## 0. 结论摘要（TL;DR）

现状不是"样式不好看"，而是**信息架构（IA）缺失**：

1. **两套内容源并联**：`topics.js` 手写讲解（结构公式/用法要点/对比/易错/记忆卡）与 `yufan/` 教材图片讲义（最多 15 节）在同一个页面**顺序堆叠**，同一知识点讲两遍，页面变成"长滚动文档"。
2. **分类体系不自洽**：现有 4 组 `["词法","句法","动词","复合句"]` 混用了两个分类维度（词类 vs 句法层级），"动词"夹在"词法/句法"之间；`总论`、`动词概说` 这类总览内容被塞进"词法/动词"里。
3. **导航只承担"列表"职责**：既不表达"从这里开始学"，也不表达"我学到哪了"。29 个专题里 **9 个 0 题、5 个 0 讲义**，侧栏却统一显示"0 题"和一条 0% 进度条（见截图 ①）。
4. **内容发现性缺口**：`yufan/直接引语与间接引语`（15 张图）被挂到 `g-object-clause（宾语从句）` 上，导航里**找不到"直接引语与间接引语"**；`yufan/主谓一致` 与专题「名词与主谓一致」并存，主谓一致出现两次。
5. **入口深链失效**：`CourseView` 的"前往语法专题"按钮只发 `open-grammar`、不带专题 id 【F:web/js/components/CourseView.js†L348】，而 `main.js` 用 `target?.contentId` 赋值 `grammarTargetId` 【F:web/js/main.js†L133】，因此从课程页跳转**永远落在默认专题**；只有智能学习台传了 id。

> **后续变更（2026-10-04）**：新增第六个导航分组「小学基础」（`primary`），承载 `web/js/grammar/primary.js` 的
> 15 张小学基础知识卡（`kind: "card"`，无真题与讲义）。该组排在导航首位；知识卡只渲染速查 / 用法要点 / 易错 / 记忆卡。
> 标题解析改为「非知识卡优先」，避免与初中同名专题（如「现在进行时」「There be 句型」）串台。
> 因此下文出现的「五组分类」在导航层已是六组，四类旧 `category` 映射规则与 yufan 契约不变。

**方案一句话**：把语法模块从"两套内容 + 长滚动页面 + 平铺列表"，改造为**「五组分类的一棵树 + 三层次导航（站点 / 专题树 / 页内 TOC）+ 分区卡片式专题页（速查 → 精讲 → 用法 → 易错 → 练习）」**，并对内容做一次去重与元数据补齐。

---

## 1. 目标、范围、成功标准、非目标

### 1.1 目标
1. 打开语法模块 **10 秒内**能回答三个问题：从哪开始学、这个专题讲什么、我还差多少没掌握。
2. 任一知识点从进入语法模块起 **≤3 次点击**可达（含跨模块深链）。
3. 单个专题页从"无层次长文"变为**有固定阅读顺序的分区页面**，单屏信息密度可控、可折叠。

### 1.2 范围
- 在：语法模块的导航结构、页面布局与呈现、分类元数据、交叉入口深链、空状态与进度口径。
- 不在（本期）：讲义内容本身的重新编写（字体/图片/题目原文）、后端 API 化（进度仍走 localStorage）、其他模块（阅读/听力/同步训练）的视觉改版。

### 1.3 成功标准（可验收）
| 编号 | 标准 | 验收方式 |
| --- | --- | --- |
| S1 | 29 个专题全部落到 5 个分组，无"孤儿"内容（`直接引语与间接引语` 可被导航直达） | 脚本校验分组映射覆盖率 = 100% |
| S2 | 每个专题页有 页内 TOC，且 TOC 项与页面锚点一一对应（scroll-spy 高亮正确） | 手测 29 个专题 + 截图抽查 |
| S3 | 从课程页/智能学习台跳转能定位到指定专题 | 手测两个入口 |
| S4 | 无题专题不再显示 0% 进度条与"0 题"噪声，改为明确空状态 | 视觉检查 |
| S5 | 首屏（进入语法模块）请求体积不高于现状（≤ 现有 manifest+index ≈154 KB） | DevTools Network 对比 |
| S6 | `node scripts/build-yufan-lectures.mjs --check` 与 `go test ./...` 通过；`?v=` 版本号同步 | CI |
| S7 | 移动端（≤620/≤900px）无横向滚动、TOC 退化为下拉 | 手测 375/768/1280/1440 |

### 1.4 非目标
- 不改动题目数据与答案（`exercises.js`）。
- 不引入新的 UI 框架/构建链（继续 Vue 3 全局组件 + 原生 CSS）。
- 不做账号级云端进度同步（仅保持 localStorage 兼容）。

---

## 2. 现状诊断（证据优先）

### 2.1 数据层：两套内容源并联

- `web/js/grammar/topics.js`：手写专题（`forms / points / contrasts / pitfalls / examTips / memoryCard / textbookLinks`）。
- `web/js/grammar/yufan/manifest.js` + `yufan/*.js`：教材图片整理讲义（`sections`，25 个模块共 210 节，417 张图）。
- 两者在 `yufan/index.js` 里通过 `mergeArray` 合并（按 title/desc 去重）【F:web/js/grammar/yufan/index.js†L20-L36】，然后**在同一页面顺序渲染**：

```
专题头 → 讲义精讲（最多 15 节，长滚动） → 结构公式 → 用法要点 → 对比辨析
     → 易错点/中考提示 → 记忆卡 → 教材例句 → 专项练习
```
模板顺序见 【F:web/js/components/GrammarView.js†L282-L404】。

**后果**：以 `g-pronouns` 为例，页面同时给出"讲义·人称代词变化表"和"结构公式·人称代词主格/宾格"、"对比辨析·形容词性 vs 名词性物主代词"，同一知识重复出现；用户截图标注的右侧内容区正是这一段。

### 2.2 分类体系不自洽

- 分组：`["词法","句法","动词","复合句"]` 【F:web/js/grammar/topics.js†L1007】。
- 排序：先按分组下标、再按 `difficulty` 数字 【F:web/js/grammar/index.js†L18-L22】。
- 问题：
  1. "词法 / 句法"是一个维度，"动词 / 复合句"是另一个维度，四组不同层级并列；
  2. 组内按难度排序，`总论`（应为入口）落在"词法"组中部，用户不知道该从哪开始；
  3. `名词与主谓一致`(g-nouns) 与 `主谓一致`(g-agreement) 两个专题语义重叠，讲义目录分别为 `yufan/名词`、`yufan/主谓一致`。

### 2.3 导航层问题（截图 ① 对应）

- 侧栏每项固定渲染"N 题 + 进度条"，**9 个专题为 0 题**（`g-overview`、`g-sentence-members`、`g-sentence-types`、`g-agreement`、`g-inversion`、`g-sentence-structure`、`g-verbs-overview`、`g-future-tense`、`g-nonfinite-verbs`），视觉上等于"坏掉的条目"。
- **5 个专题没有讲义**（`There be 句型`、`祈使句与感叹句`、`过去进行时`、`if 条件状语从句`、`状语从句`），但导航不区分，点进去才发现内容形态不同。
- 侧栏不做筛选、不分组折叠、不显示"未掌握/已掌握"，也没有"上次学到哪"。
- 组标题与专题 chip 重复表达同一信息（分组名出现两次）。

### 2.4 内容层问题

- 头部"题库说明"是一段 4 行纯文本数字墙（60/42/18/17 道）【F:web/js/components/GrammarView.js†L233】，占据首屏注意力，且与"学语法"这个任务无关。
- 讲义 15 节全部展开渲染，无目录、无折叠、无阅读进度。
- 专题头信息（分类 chip、难度星、摘要、对应教材、spreadNote）与正文区块视觉权重接近，缺少主次。

### 2.5 交叉入口与深链缺陷

| 入口 | 现状 | 问题 |
| --- | --- | --- |
| 站点主侧栏「语法专题」(GR) | 定位到默认专题 【F:web/js/main.js†L439】 | 不记忆上次专题 |
| 智能学习台 语法卡片 | 传 `contentId` 【F:web/js/components/SmartLearningView.js†L223】 | 正常 |
| 课程学习"前往语法专题" | 只发 `open-grammar` 【F:web/js/components/CourseView.js†L348】 | **丢失专题上下文**，落默认专题 |

### 2.6 进度口径

- 进度=该专题"答对过的题数 / 题数"，仅存 localStorage 【F:web/js/grammar/index.js†L45-L60】；0 题专题分母为 0，界面无兜底文案。
- 掌握度与"是否做过讲义"完全无关，导航无法表达"讲完了但没练"这种真实学习状态。

### 2.7 问题 → 方案映射

| 编号 | 问题 | 影响 | 对应方案 |
| --- | --- | --- | --- |
| P1 | 两套内容源堆叠、重复 | 页面混乱、阅读疲劳 | §6.3 去重规则 + §6.2 分区 |
| P2 | 分类维度混用 | 找不到、不知道怎么学 | §4.1 新 IA |
| P3 | 组内按难度排序 | 无学习路径 | §4.1 `order` 字段 + §5.4 路径视图 |
| P4 | 0 题/0 讲义无区分 | 条目像坏了 | §4.3 状态模型 |
| P5 | 无页内 TOC、长滚动 | 找不到知识点 | §5.3 |
| P6 | 深链丢失 | 跳转无意义 | §5.5 |
| P7 | 题库说明数字墙 | 首屏噪声 | §6.5 |
| P8 | 内容不可发现（直接引语/间接引语被折叠） | 功能缺失感 | §4.2 迁移表 |

---

## 3. 设计原则

1. **一屏一任务**：专题头只负责"这是什么/学到哪/下一步做什么"三件事。
2. **速查优先于长文**：多数用户是"查"不是"读"，所以速查卡（结构公式/对比表）提到精讲之前。
3. **导航要表达状态，不只是目录**：未开始 / 学习中 / 已掌握 / 只有讲义 / 待补题。
4. **同一知识只讲一次**：讲义负责解释，卡片负责速查，二者互斥不重复。
5. **不新增依赖、不改数据契约**：`build-yufan-lectures.mjs` 的 `?v=` 约定继续生效。

---

## 4. 新信息架构（IA）

### 4.1 五组分类 + 元数据契约

```
入门总览   —— 先看这 4 篇，建立全局框架
词法       —— 名词/代词/冠词/数词/形容词与副词/介词/连词
动词       —— 时态（6）· 语态 · 情态 · 非谓语
句法       —— 句子成分/句型/种类 · There be · 疑问句 · 祈使感叹 · 主谓一致 · 倒装
复合句     —— 宾语从句 · 状语从句 · 条件句 · （待补：定语从句、直接引语与间接引语）
```

每个专题新增/规范元数据（只加字段，不改旧字段语义）：

| 字段 | 说明 | 取值 |
| --- | --- | --- |
| `group` | 五组之一 | `start` / `morph` / `verb` / `syntax` / `clause` |
| `order` | 组内学习顺序 | 整数 |
| `subGroup` | 组内小节（动词：时态/语态/情态/非谓语） | 可选 |
| `hasLecture` / `hasExercises` | 内容形态（可由数据自动推导，不进手工数据） | 布尔 |
| `examWeight` | 近 5 年北京卷考查次数（**自动统计** `points.js` / `exercises.js`，不手写） | 整数 |
| `prerequisite` | 前置专题 id | 可选，用于路径视图 |

> 元数据落在 `topics.js` 的专题对象上；`yufan` 侧不改契约（`newTopic` 仍需在 manifest 中声明 `category` → 映射到新 `group`）。

### 4.2 专题迁移表（29 → 5 组，验收标准 S1）

| 新分组 | 专题（id / 标题） | 变更说明 |
| --- | --- | --- |
| 入门总览 | g-overview 总论 · g-sentence-members 句子的成分和基本句型 · g-sentence-types 句子的种类 · g-verbs-overview 动词概说 | 从 词法/句法/动词 抽出，明确"入口"；`order` 1-4 |
| 词法 | g-nouns 名词 · g-pronouns 代词 · g-articles 冠词 · g-numerals 数词 · g-adj-adv 形容词与副词 · g-prepositions 介词 · g-conjunctions 连词 | `g-nouns` 改名「名词」（主谓一致归入句法），消除与 `g-agreement` 的重叠 |
| 动词 | g-present-simple · g-present-continuous · g-past-simple · g-past-continuous · g-future-tense · g-present-perfect（时态）· g-passive-voice（语态）· g-modal-verbs（情态）· g-nonfinite-verbs（非谓语） | 组内按 subGroup 分小节；顺序=时态→语态→情态→非谓语 |
| 句法 | g-there-be · g-questions · g-imperatives · g-sentence-structure · g-agreement · g-inversion | `g-agreement` 承接原 `g-nouns` 的主谓一致讲义 |
| 复合句 | g-object-clause · g-adverbial-clause · g-if-clause | **新增**：直接引语与间接引语拆分（见下） |

**关键迁移动作（P8）**：`yufan/直接引语与间接引语`（15 张图）当前挂 `g-object-clause`。方案：
- 方案 A（推荐）：新增专题 `g-reported-speech`「直接引语与间接引语」，`group=clause`，manifest 的 `topicId` 改指新 id（需重跑 `build-yufan-lectures.mjs`）。
- 方案 B（低成本）：保留挂载，但在宾语从句页以"相关讲义"卡片显式列出并可直接跳转锚点。
- 决策点留给评审：A 更干净但会改 manifest 契约；B 不动数据但保留轻微耦合。

### 4.3 专题状态模型（P4）

| 状态 | 判定 | 导航表现 |
| --- | --- | --- |
| 未开始 | 无作答、无讲义阅读 | 灰色圆点 |
| 学习中 | 有作答但未掌握（<80%） | 蓝色半环 + 百分比 |
| 已掌握 | 该专题全部题目首次作答正确（沿用现有 `done=1` 口径） | 绿色勾 |
| 仅讲义 | `hasExercises=false` | 「讲义」标签，**不显示进度条** |
| 待补题 | `hasLecture=false` | 「真题」标签 + 页内提示"讲义整理中" |

---

## 5. 导航重设计

导航分三层，各司其职：**主侧栏=去哪**、**专题树=学什么**、**页内 TOC=看到哪**。

### 5.1 站点主侧栏
- 位置不变（学习与练习 → 语法专题）【F:web/js/main.js†L439】。
- 增强：显示"继续上次：现在完成时"副标题（读取 `english-learn-grammar-v1:*` 的最后一次 `selectedId`，新增 `lastTopicId` 字段）。
- 侧栏图标/文案维持现状，避免牵连其他模块。

### 5.2 二级导航（专题树，替换现 `grammar-nav` ①）

```
┌ 语法专题 ─────────────────────────────────────┐
│ [全部] [入门总览] [词法] [动词] [句法] [复合句] │  ← 分类 chips（含计数）
│ 🔍 搜索专题/知识点…            [筛选 ▾]        │  ← 筛选项：全部 / 有真题 / 有讲义 / 未掌握
│ ─────────────────────────────────────────────  │
│ 入门总览                                       │  ← 组头可折叠，默认展开当前组；显示 x/4 已学
│  ✓ 总论                    讲义4节 · 已掌握    │
│  ○ 句子的成分和基本句型      讲义9节 · 仅讲义   │
│ ...                                            │
│ 动词           时态                            │  ← subGroup 小节头（可折叠）
│  ◐ 一般现在时              3题 · 2/3           │
│                                                │
│ ┌ 继续上次 ─────────────────────────┐          │  ← 底部固定
│ │ 现在完成时  5题 · 3/5  [继续 →]   │          │
│ └───────────────────────────────────┘          │
└────────────────────────────────────────────────┘
```
要点：
1. **一屏内完成筛选与定位**，分类 chips 带计数（如 `词法 7`）。
2. 条目右侧 meta 由"0 题"改为状态化文本：`3题 · 2/3`、`讲义9节 · 仅讲义`、`真题5道 · 待补讲义`。
3. 当前项：左侧 3px 强调色竖条 + 加粗 + 自动 `scrollIntoView`（进入页面时定位）。
4. 键盘可达：`↑/↓` 在专题间移动，`Enter` 选中，`/` 聚焦搜索（保持现有 `button` 语义，补 `aria-current="true"`）。
5. 折叠状态存 localStorage（`grammar-nav-collapsed`），尊重用户习惯。

### 5.3 页内导航（TOC + scroll-spy）

- 桌面 ≥1280px：右侧 sticky 窄栏（宽 200–220px），列出：
  `速查 · 结构公式` / `速查 · 对比辨析` / `讲义精讲`（+ 二级：各 section 标题）/ `用法要点` / `易错与考法` / `记忆卡` / `教材例句` / `专项练习`。
- 滚动联动：`IntersectionObserver` 高亮当前节；点击平滑滚动并更新 `location.hash`（形如 `#/grammar/g-pronouns/lecture-3`），刷新可复原。
- 1080px 以下：TOC 收进吸顶条"本节目录 ▾"下拉。
- 移动端：TOC 与练习区"上一题/下一题"合并为底部工具条。

### 5.4 学习路径视图（阶段 2，可延后）
- 侧栏顶部切换 `[列表 | 路径]`；路径视图按 `prerequisite` 画分组泳道，节点显示状态色。
- 价值：把"29 个平铺专题"变成"4 条主线 + 1 个入口"。

### 5.5 交叉入口与深链（P6）
1. `CourseView` 发事件时带上当前模块的语法专题 id：`$emit('open-grammar', topicId)` 【F:web/js/components/CourseView.js†L348】，由 `main.js` 接收写入 `grammarTargetId`。
2. 课程数据需要提供 `grammar.topicId` 映射（现有 `chuzhong/*/section.grammar.topic` 是中文名）→ 增加一张 `topicTitle -> topicId` 映射表（放在 `grammar/index.js` 导出 `topicIdByTitle`）。
3. 智能学习台保持现状，并支持 `#/grammar/<topicId>` 形式的路由 hash（可选，便于分享/回退）。

---

## 6. 页面内容重设计

### 6.1 布局骨架

```
┌ A 专题头（吸顶，48-64px 高）────────────────────────────────┐
│ 语法专题 / 词法 / 代词      [难度 ★☆☆☆☆]   [开始练习 ▸]     │
│ 代词  用代词代替名词，避免重复…                             │
│ 讲义 13 节 · 真题 5 道 · 掌握 2/5 · 近5年考 5 次            │
└─────────────────────────────────────────────────────────────┘
┌ 二级导航（左 260px） ┐ ┌ B 速查区 ────────────────────────┐ ┌ TOC 200px ┐
│ 分类 chips          │ │ ① 结构公式卡 ② 对比表卡           │ │ 速查      │
│ 搜索 / 筛选         │ └──────────────────────────────────┘ │ 讲义精讲  │
│ 专题树（分组/子节） │ ┌ C 讲义精讲（分节 accordion）─────┐ │  ˪ 1 …N   │
│                     │ │ ▸ 一、代词概说与分类              │ │ 用法要点  │
│                     │ │ ▾ 二、人称代词：变化表与基本用法  │ │ 易错与考法│
│                     │ │    （正文/表格/例句/提示/易错）   │ │ 记忆卡    │
│                     │ └──────────────────────────────────┘ │ 教材例句  │
│                     │ ┌ D 用法要点（good/bad 例句）─────┐ │ 专项练习  │
│                     │ ┌ E 易错与考法（红/黄卡）─────────┐ │           │
│                     │ ┌ F 记忆卡 + 教材例句（折叠）─────┐ │           │
│                     │ ┌ G 专项练习（题组 + 交卷小结）───┐ │           │
└ 继续上次卡片（吸底） ┘ └──────────────────────────────────┘ └───────────┘
```

### 6.2 区块规格

| 区 | 内容 | 默认状态 | 交互 |
| --- | --- | --- | --- |
| A 专题头 | 面包屑、标题、难度、一句话 summary、指标条（讲义节数/题量/掌握/近年考查次数）、主 CTA | 常显 | 吸顶；`开始练习` 滚动到 G 并聚焦第一题 |
| B 速查区 | `forms` 卡片网格 + `contrasts` 表格（横向可滚） | 展开 | 卡片点击复制公式；表格支持横向滚动 |
| C 讲义精讲 | `lecture.sections`（标题 + 正文/列表/表格/例句/提示/易错） | **分节折叠**，展开首节 + 记住展开状态 | 节标题即锚点；"展开全部/收起全部" |
| D 用法要点 | `points`（title/desc/good/bad） | 展开 | 例句点击朗读（沿用 `speak`） |
| E 易错与考法 | `pitfalls` + `examTips` 合并为双列卡 | 展开 | 易错=琥珀，考法=蓝；`examTips` 为空则整块隐藏 |
| F 记忆卡 / 教材例句 | `memoryCard` chips、`textbookExamples` 列表 | **折叠** | 记忆卡用于考前速记，默认收起降噪 |
| G 专项练习 | 现有题目组件（保留 badge/来源/解析） | 展开 | 见 §6.4 |
| 页脚 | 上一专题 / 下一专题 / 相关专题（同 subGroup 或高相关） | — | 键盘 `[` `]` 跳转 |

### 6.3 内容去重与合并规则（P1）

1. **职责切分（写进 `yufan/README.md` 契约）**：
   - `yufan/*.js` 的 `sections` = 唯一"讲解正文"来源（解释性文字、教材原题例句）。
   - `topics.js` 的 `forms` / `contrasts` = 唯一"速查卡"来源（结构化公式与对照表）。
   - `points` / `pitfalls` / `examTips` / `memoryCard` = 保留在 `topics.js`（考点归纳，教材图片里没有）。
2. **去重检查**：新增脚本 `scripts/check-grammar-duplication.mjs`，对同一专题做归一化比对（去空格/标点/全角半角），若 `forms.pattern` 与任一 `lecture` 表格行重复 ≥80%，输出 warning 并列出位置 → 由人工决定删哪一边（默认删 `topics.js` 侧重复项，因为讲义保留了教材语境）。
3. **已知重复样本（本次先清理）**：`g-pronouns` 的人称代词表、`g-prepositions` 的 at/on/in 速查、`g-adj-adv` 的比较级构成。
4. **空形态兜底**：
   - `hasExercises=false`：G 区显示"该专题真题整理中，先看讲义"；导航不显示进度条（S4）。
   - `hasLecture=false`：C 区显示"讲义整理中（教材图片未覆盖，可先看速查与真题）"，不留空白。

### 6.4 练习区改造

- 题组化：按来源分组展示（北京真题 / 外地真题 / 改编 / 自编），每组带小标题与计数，替代现在"混在一起 + 每题一个 badge"。
- 交卷小结：完成全部题目后显示"首次正确率 / 错题清单 / 加入错题本"，与现有 `mistakes` 模块打通（后续阶段）。
- 保留现有即时判题与解析（含 `source.answerSource` / `source.original` 展示）【F:web/js/components/GrammarView.js†L430-L450】。

### 6.5 长文本收纳（P7）
- 头部题库说明改为：`题目来源与说明 ⓘ`（button → 抽屉/弹层），内容保留现有统计文案 【F:web/js/components/GrammarView.js†L233-L239】。
- 专题头 `spreadNote`（如介词"教材未设单一模块"）改为标题旁小图标 tooltip，不进正文。

---

## 7. 视觉与设计 token

| 项 | 规则 |
| --- | --- |
| 栅格 | 页面 max-width 1240px（沿用）；间距梯度 4/8/12/16/24/32 |
| 卡片 | 圆角 12/16px；border 1px `--line`；无重投影；区块内不留虚线分隔 |
| 标题阶梯 | h1 28 / 区块 h3 15（dot+标题+右侧 meta+折叠箭头）/ 节 h4 14 |
| 语义色 | 绿=已掌握/结构、蓝=讲义、琥珀=易错、红=错题、灰=未开始 |
| 代码/公式 | 统一 `.pattern` 样式（等宽 + 浅底 + 可复制） |
| 表格 | 表头吸顶、横向滚动、首列加粗；数字右对齐 |
| 空状态 | 统一"图标 + 一句话 + 一个动作"，禁止出现裸的 `0` |

---

## 8. 数据与内容治理任务清单

| # | 任务 | 输入 | 输出 | 验收 |
| --- | --- | --- | --- | --- |
| T1 | 专题元数据补齐（group/order/subGroup/prerequisite） | `topics.js` + §4.2 迁移表 | 更新后的 `topics.js` | 29 条目全部有 group/order |
| T2 | `topicIdByTitle` 映射表 | `topics.js` 标题 + 课程 `grammar.topic` | `grammar/index.js` 导出 | 课程页可定位 |
| T3 | 直接引语与间接引语归属决策与实施 | manifest + `reported-speech.js` | 新专题或相关讲义卡片 | 导航可达 |
| T4 | 去重检查脚本 + 重复项清理 | `topics.js`/`yufan/*.js` | `scripts/check-grammar-duplication.mjs` + 清理结果 | 脚本 0 warning |
| T5 | 近年考查次数自动统计 | `points.js` + `exercises.js` | 构建期输出的 `examWeight` | 29 项数值正确 |
| T6 | 空形态文案与状态推导 | 数据推导 | 组件内 `topicState()` | 无 0% 裸进度条 |
| T7 | 版本号同步（`?v=`） | README 契约 | 相关文件更新 | `--check` 通过 |

---

## 9. 实施路线

| 阶段 | 内容 | 产出 | 依赖 | 预估 |
| --- | --- | --- | --- | --- |
| P0 | 方案评审（本文件 + 线框） | 评审结论、A/B 决策（T3） | — | 0.5 天 |
| P1 | IA 与导航（不改内容） | T1、T2、T6 + §5.2/5.3/5.5 组件改造 | P0 | 2 天 |
| P2 | 内容呈现重构 | §6.1/6.2/6.4/6.5（分区容器、折叠、TOC、练习分组、抽屉） | P1 | 2–3 天 |
| P3 | 数据治理 | T3、T4、T5 | P1 | 1–2 天（T3 若选方案 A 需重跑 manifest） |
| P4 | 视觉打磨 + 响应式 + 无障碍 + 回归 | 29 专题截图基线、a11y 检查、`?v=` 同步（T7） | P2、P3 | 1.5 天 |

可并行拆分（若启用 A2A 协作）：
- **A 线（数据）**：T1/T2/T5 + 去重脚本（写 `scripts/`、`grammar/` 数据文件）。
- **B 线（组件）**：`GrammarView.js` 布局与 TOC（写 `components/`、`grammar.css`）。
- **C 线（验证）**：截图基线 + 响应式 + 数据一致性校验（只读 + 报告）。
> A/B 写集不重叠；C 独立。三方交汇点在 `web/js/grammar/index.js` 的导出契约，需先冻结接口（`topicState`、`topicIdByTitle`、`examWeight`）。

---

## 10. 验收清单

1. S1–S7（§1.3）逐条通过。
2. `node scripts/build-yufan-lectures.mjs --check`、`go test ./...`、`go vet ./...` 通过。
3. 手测路径：
   - 首页 → 语法专题 → 入门总览 → 总论 → 讲义第 3 节锚点（≤3 次点击）；
   - 课程学习 → 某模块"语法"页 → 前往语法专题 → 落在对应专题（验证 T2）；
   - 刷新带 hash 的 URL 仍定位到同一节；
   - 移动端 375px：无横向滚动、TOC 下拉可用、练习可作答。
4. 视觉回归：29 个专题 × {桌面 1440、移动 375} 截图，与基线对比仅预期变化。

---

## 11. 风险与未决问题

| 风险 | 等级 | 说明 | 缓解 |
| --- | --- | --- | --- |
| 改 markup 影响其他模块引用 | 中 | `grammar.css` 同时含 `.smart-grammar*`、`.grammar-jump` 等被别处使用的类 | 只新增 `gd2-*`/`gnav2-*` 命名空间，不动被复用类 |
| manifest 契约变更（T3 方案 A） | 中 | `build-yufan-lectures.mjs --check` 与 `?v=` 需同步 | 按 README §8.4 流程：改 `ASSET_V` → 重跑 → 同步 4 处 `?v=` |
| 内容去重误删 | 中 | 自动比对可能误判 | 只输出 warning + 人工确认，不自动改文件 |
| 进度口径变更导致历史数据不一致 | 低 | localStorage 旧 schema | 新增字段（`lastTopicId`）向后兼容，不迁移既有记录 |
| 首屏体积上升 | 低 | 新增 TOC/状态计算均为本地计算 | 保持 `loadLecture` 懒加载策略不变（实测 5.66× 收益）【F:web/js/grammar/yufan/README.md†L174-L188】 |

**未决问题（需评审拍板）**
1. T3 选方案 A（新增专题 `g-reported-speech`）还是 B（相关讲义卡片）？
2. 「入门总览」是否允许出现"仅讲义、无真题"的条目（会影响首屏观感）？
3. 学习路径视图（§5.4）是否纳入本期，还是延后？
4. 二级导航是否需要"最近学习"历史（不只是"继续上次"）？

---

## 附录 A：现状数据清单（实测）

分类：`["词法","句法","动词","复合句"]`；专题 29 个；练习 137 题（北京 60 · 外地 42 · 改编 18 · 自编 17）；讲义 24 个 topicId（25 个模块 / 210 节 / 417 张图）。

| id | 分类(现) | 难度 | 标题 | 题量 | 讲义节 | 状态问题 |
| --- | --- | --- | --- | --- | --- | --- |
| g-pronouns | 词法 | 1 | 代词 | 5 | 13 | 内容重复(人称代词表) |
| g-overview | 词法 | 1 | 总论 | 0 | 13 | 无题 |
| g-prepositions | 词法 | 2 | 介词（时间与地点） | 5 | 7 | 重复(at/on/in 速查) |
| g-conjunctions | 词法 | 2 | 连词 | 5 | 8 | — |
| g-articles | 词法 | 2 | 冠词 | 13 | 11 | — |
| g-adj-adv | 词法 | 3 | 形容词与副词（比较级、最高级） | 5 | 15 | 两个讲义模块合并 |
| g-nouns | 词法 | 3 | 名词与主谓一致 | 15 | 11 | 与 g-agreement 重叠 |
| g-numerals | 词法 | 3 | 数词 | 15 | 12 | — |
| g-there-be | 句法 | 1 | There be 句型 | 6 | 0 | 无讲义 |
| g-questions | 句法 | 2 | 疑问句与疑问词 | 5 | 8 | — |
| g-imperatives | 句法 | 2 | 祈使句与感叹句 | 14 | 0 | 无讲义 |
| g-sentence-members | 句法 | 3 | 句子的成分和基本句型 | 0 | 9 | 无题 |
| g-sentence-types | 句法 | 3 | 句子的种类 | 0 | 6 | 无题 |
| g-agreement | 句法 | 4 | 主谓一致 | 0 | 8 | 无题 + 与 g-nouns 重叠 |
| g-inversion | 句法 | 4 | 倒装句 | 0 | 6 | 无题 |
| g-sentence-structure | 句法 | 5 | 句子的结构 | 0 | 8 | 无题 |
| g-present-simple | 动词 | 1 | 一般现在时 | 3 | 7 | — |
| g-present-continuous | 动词 | 2 | 现在进行时 | 3 | 8 | — |
| g-past-simple | 动词 | 2 | 一般过去时 | 4 | 7 | — |
| g-verbs-overview | 动词 | 2 | 动词概说 | 0 | 8 | 无题 |
| g-modal-verbs | 动词 | 3 | 情态动词 | 5 | 8 | — |
| g-past-continuous | 动词 | 3 | 过去进行时 | 3 | 0 | 无讲义 |
| g-future-tense | 动词 | 3 | 动词的将来时 | 0 | 6 | 无题 |
| g-present-perfect | 动词 | 4 | 现在完成时 | 5 | 7 | — |
| g-passive-voice | 动词 | 4 | 被动语态 | 5 | 7 | — |
| g-nonfinite-verbs | 动词 | 4 | 非谓语动词 | 0 | 8 | 无题 |
| g-if-clause | 复合句 | 3 | if 条件状语从句 | 2 | 0 | 无讲义 |
| g-object-clause | 复合句 | 4 | 宾语从句 | 5 | 9 | 内含"直接引语与间接引语"讲义 |
| g-adverbial-clause | 复合句 | 4 | 状语从句 | 14 | 0 | 无讲义 |

## 附录 B：代码索引（改动点）

| 位置 | 作用 | 本次动作 |
| --- | --- | --- |
| 【F:web/js/components/GrammarView.js†L209-L241】 | 页面头 + 工具栏 + 题库说明 | 重构为 §6.1 区域 A；说明收进抽屉 |
| 【F:web/js/components/GrammarView.js†L241-L262】 | 二级导航（截图 ①） | 重写为 §5.2 |
| 【F:web/js/components/GrammarView.js†L265-L404】 | 专题详情各区块 | 重排为 B–F 区 + 折叠 + 锚点 |
| 【F:web/js/components/GrammarView.js†L405-L450】 | 练习区 | 题组化（§6.4） |
| 【F:web/grammar.css†L1-L982】 | 样式 | 新增分区/TOC/状态类，复用 `.smart-grammar*` 等既有类不动 |
| 【F:web/js/grammar/topics.js†L1007】 | 分类常量 | 替换为五组 `grammarGroups`（保留旧常量做兼容导出） |
| 【F:web/js/grammar/index.js†L18-L22】 | 排序 | 改为 `group 顺序 → subGroup → order` |
| 【F:web/js/grammar/yufan/index.js†L20-L36】 | 讲义合并 | 不改契约；新增状态推导辅助 |
| 【F:web/js/components/CourseView.js†L348】 | 跨模块入口 | 带上 topicId（§5.5） |
| 【F:web/js/main.js†L133】 | 深链接收 | 兼容 `#/grammar/<topicId>` |

## 附录 C：线框示意

- 静态线框（可直接用浏览器打开，含真实 29 条数据与状态、可用的筛选/折叠/TOC 联动）：`docs/grammar-redesign-wireframe.html`
- 线框预览图：`docs/grammar-redesign-wireframe.png`（1680px 桌面）、`docs/_wf-mobile.png`（520px 移动）
- 自检钩子：打开 `...wireframe.html?probe=1`，页面底部会写入 `clientWidth / scrollWidth / 溢出元素清单`。
  实测 485 / 569 / 737 / 1409 四档宽度下 `scrollWidth == clientWidth`，即**无横向溢出**（对应验收 S7）。
  > 注：Windows 版 Chrome 无头模式的窗口宽度下限约 485px，故移动端截图以 520px 窗口（clientWidth≈485）为准。
- 线框仅为信息架构评审用，**不是最终视觉稿**；颜色/间距以第 7 节 token 为准。

---

## 12. 实施状态（P1 已实施）

- 状态更新：2026-09-28
- 本轮范围：P1（IA 与导航，不改内容主体）+ 实施过程中实测发现的 3 个缺陷（§12.3）
- 版本号：语法模块族统一为 `20260928-grammar-ia-r2`；yufan 讲义族当时为 `20260927-yufan-r3`（P2 去重后已升为 `20260928-yufan-r4`，见 §13）

### 12.1 评审决策回填（对应 §11 未决问题）

| # | 未决问题 | 结论 | 落地位置 |
| --- | --- | --- | --- |
| 1 | T3 直接引语与间接引语：方案 A（新专题）/ B（讲义卡片） | **选 A**：新增专题 `g-reported-speech`，`yufan/直接引语与间接引语` 讲义改挂到该专题 | `web/js/grammar/topics.js`、`web/js/grammar/yufan/reported-speech.js`、`scripts/build-yufan-lectures.mjs` |
| 2 | 「入门总览」是否允许"仅讲义、无真题"条目 | **允许**，但条目必须显式标注形态（`仅讲义` / `待补讲义` / `待补知识`），不再出现 0% 裸进度条 | `GrammarView.js` 导航徽标 + `topicState()` |
| 3 | 学习路径视图（§5.4） | **延后**，不进本期 | — |
| 4 | 二级导航「最近学习」历史 | **不做列表**，只保留底部「继续上次」 | `index.js` 的 `loadLastTopicId / saveLastTopicId` |

### 12.2 任务清单完成度（对照 §8）

| # | 任务 | 状态 | 说明 |
| --- | --- | --- | --- |
| T1 | 专题元数据补齐（group/order/subGroup） | 完成（口径调整） | 不写回 `topics.js`，集中到 `web/js/grammar/ia.js` 的 `topicIA` 作为单一事实源，`index.js` 加载时合并；避免 30 个条目分散维护 |
| T2 | `topicIdByTitle` 映射 | 完成 | `resolveTopicId()` 命中顺序：已知 id → 标题精确 → 别名关键词 → 标题包含关系 |
| T3 | 直接引语与间接引语归属 | 完成（方案 A） | 新专题「直接引语与间接引语」，讲义 9 节，导航可达 |
| T4 | 去重检查脚本 + 重复项清理 | 未做 | P2 遗留 |
| T5 | 近年考查次数统计 | 完成 | `examWeightByTopic`（按专题统计北京卷真题量），专题头显示「近 5 年考查 N 次」 |
| T6 | 空形态文案与状态推导 | 完成 | `topicState()` → `new / learning / done / lecture-only / ex-only / empty` |
| T7 | `?v=` 版本号同步 | 完成 | `20260928-grammar-ia-r2`，10 处引用同步，全仓无旧版本号残留 |

### 12.3 本轮修复的缺陷（实测发现）

| # | 现象 | 根因 | 修复 |
| --- | --- | --- | --- |
| D1 | 专题页顶部渲染出一大段 JSON（`{"g-pronouns":[{"heading":...}]}`），把页面撑成数屏长文 | `GrammarView` 中 data 与 computed **同名** `lectureSections`；Vue 3 里 data 优先，模板 `{{ lectureSections }}`（本意「节数」）渲染成整个讲义对象 | data 侧改名 `lectureCache`，`lectureSections` 只保留为节数 computed |
| D2 | 课程页跳「if 条件状语从句」落到「状语从句」；`#grammar/直接引语与间接引语` 解析不到 | 别名规则按数组顺序命中，「状语从句」排在「if 条件」之前；且此前没有标题匹配通道 | `topicAliasRules` 调整顺序并新增直接引语规则；`matchTopicId()` 增加标题精确/包含匹配 |
| D3 | 刷新 `#grammar/g-pronouns/lecture-3` 回到页顶；专题内跳转会把 `/lecture-3` 从地址栏抹掉 | 组件不消费 hash 锚点；`syncHash()` 无 anchor 时直接重写 `#grammar/<id>` | 新增 `revealAnchor()`（讲义加载完成后展开并**瞬间**定位，绕开 `html{scroll-behavior:smooth}`）与 `hashSuffix()`（保留同专题锚点） |

### 12.4 验收实测（对应 §1.3）

| 编号 | 标准 | 实测结果 | 证据 |
| --- | --- | --- | --- |
| S1 | 专题全部落到 5 组、无孤儿 | ✅ 30 专题 / 5 组；`g-reported-speech` 出现在「复合句」 | `node scripts/check-grammar-ia.mjs` → 通过 |
| S2 | 页内 TOC 与锚点一一对应 | ✅ 30 专题探针：`tocLinks` 5–19、区块 6 个、scroll-spy 无异常 | `reports/grammar-preview-20260927.txt` |
| S3 | 课程页 / 智能学习台跳转定位 | ✅ 静态+逻辑用例通过：54 个课程语法名命中 52（缺口：定语从句）、hash 解析 10 例全过；⚠️ 登录态端到端点击未做 | `scripts/check-nav-hash.mjs`、`check-grammar-ia.mjs` |
| S4 | 无题专题不再显示 0% 噪声 | ✅ 导航条目改显形态徽标（仅讲义 / 待补讲义 / 待补知识） | `tmp/grammar-preview/shots/*.png` |
| S5 | 首屏体积不高于现状 | ✅ 元数据层 150.3 KB（manifest 142.2 + yufan 聚合入口 8.1）≤ 154 KB 基线；新增 IA 层 `ia.js` 8.1 KB | `node scripts/grammar-preview.mjs --net` |
| S6 | `--check` / `go test` 通过；`?v=` 同步 | ⚠️ 见 §12.5：`--check` ✅、`go vet` ✅、`go test` 仅 1 个**既有**失败（缺音频文件，与本改动无关） | 同上 |
| S7 | 移动端无横向滚动 | ✅ 375px（iframe 模拟）× 30 专题 + 520/620/1440px 抽查，`overflow=[]` | `reports/grammar-preview-20260927.txt` |

### 12.5 可复现命令

```bash
node scripts/check-grammar-ia.mjs                 # IA 自检：分组 / 死配置 / 别名命中 / 形态清单
node scripts/check-nav-hash.mjs                   # 主侧栏 hash 解析（切片跑 main.js 真实代码）
node scripts/build-yufan-lectures.mjs --check      # 讲义 manifest 契约校验（错误 0 / 警告 0）
node scripts/grammar-preview.mjs --topics g-pronouns --widths 1440,520 --probe --frame 375
node scripts/grammar-preview.mjs --topics g-pronouns --widths 1440 --net --height 400   # 首屏体积
node scripts/grammar-preview.mjs --topics g-pronouns --hash grammar/g-pronouns/lecture-3 --probe  # 深链
go vet ./... && go test ./...
```

`go test ./...` 当前唯一失败：`internal/learning` 的 `TestCourseLoadsTextbookContent` 报
`web/audio/7/appendix/pronunciation-guide.mp3` 缺失 —— 该音频在 `chuzhong/真实教材/七年级上册/book.json`
里被引用但工作区没有实体文件，属**既有数据缺口**，与本轮前端改动无关。

### 12.6 未完成 / 下一步（2026-09-28 更新：第 1 条见 §13，第 3 条见 §15）

1. ✅ **P2 内容呈现**：见 §13（去重体检脚本 + 5 张重复速查卡清理 + `spreadNote` tooltip + 智能学习台分组名统一）。
2. ✅ **P4 视觉与回归**：见 §14（旧 CSS 死代码清理 1518→700 行、30 专题截图基线固化到 `reports/screenshots/20260928/`、登录态端到端 6/6 通过、页内目录高亮缺陷修复）。
3. ✅ **P3 数据治理**：见 §15（新增专题 `g-attributive-clause` 定语从句，课程语法名命中 52/54 → **54/54**；新增 `authored` 自撰讲义类型；课程页入口 e2e 扫描扩到全模块）。
4. ⏳ **§5.4 学习路径视图**：已确认延后，需要时再排期。

---

## 13. P2 实施记录（内容呈现与数据治理，2026-09-28）

### 13.1 本轮改动

| # | 项 | 内容 |
| --- | --- | --- |
| 1 | 新增体检脚本 | `scripts/check-grammar-duplication.mjs`：把「速查卡（`forms` / `contrasts`）」与「讲义表格 / 文字 / 例句」做归一化比对（去空格与标点、全半角统一、字面包含），相似度 ≥0.8 记一处；只报告不改文件，`--strict` 供 CI 用 |
| 2 | 清理整卡重复 | 删除 5 张「整卡被讲义表格覆盖」的速查卡：`yufan/nouns.js`（名词作定语 vs 形容词作定语）、`yufan/prepositions.js`（有无定冠词 the 的词组辨义）、`yufan/conjunctions.js`（not only...but also / as well as / both...and）、`yufan/past-simple.js`（一般现在时 vs 一般过去时、be 动词过去时句型） |
| 3 | 讲义版本号 | `ASSET_V` → `20260928-yufan-r4`，重跑 `scripts/build-yufan-lectures.mjs` 重建 manifest（错误 0 / 警告 0） |
| 4 | `spreadNote` 收纳 | 原「教材未设单一模块」等长句改为专题标题旁 ⓘ 按钮：hover 显示原生提示、点击展开弹层（`.gr2-pop`，挂在标题行上定位，窄屏不溢出），不再占正文 |
| 5 | 分类口径统一 | `SmartLearningView` 的语法专项列表由旧四分类 `topic.category` 改为 IA 分组名 `groupLabel(topic.group)`（入门总览 / 词法 / 动词 / 句法 / 复合句） |

### 13.2 去重判定口径（重要）

1. 速查卡有两个来源：`topics.js` 与 `yufan/<slug>.js`（讲义文件自带）；同一张表若在「速用速查」与「讲义精讲」各出现一次，就是本轮要清的对象。
2. **整卡被讲义覆盖才删**（删重复侧、保留讲义正文）；**部分覆盖的卡保留**（它们把多节内容合成一张对照表，速查价值仍在）；**`forms` 公式卡保留**（契约中 `forms` 是速查的唯一来源，讲义散文提到公式不算重复）。
3. 体检脚本每次运行都会重新列出全部候选，便于后续批次 review。

### 13.3 实测

- `node scripts/check-grammar-duplication.mjs`：比对 344 条速查卡，**已无「整卡覆盖」项**（剩余 11 条 `forms` 单卡 + 9 条部分覆盖，按口径保留）。
- `node scripts/build-yufan-lectures.mjs --check`：错误 0 / 警告 0；首屏讲义元数据 151,926 B（manifest 140.2 KB + 聚合入口 8.1 KB）≤ 154 KB 基线（清理后又小约 2 KB）。
- 预览探针（g-prepositions / g-questions / g-reported-speech，含 `--pop`）：`.gr2-info` 按钮 1 个、弹层文案 37 / 28 / 69 字；375 / 520 / 1440px **无横向溢出**。

### 13.4 剩余

- P4：旧 CSS 死代码（`.gd-*` / `.gnav-*`）清理、30 专题截图基线固化、登录态端到端点击验证。
- P3：定语从句等「课程有、专题无」的内容缺口。
---

## 14. P4 实施记录（视觉回归与清理，2026-09-28）

### 14.1 本轮改动

| # | 项 | 内容 |
| --- | --- | --- |
| 1 | 新增体检脚本 | `scripts/check-css-usage.mjs`：按花括号配对切规则块 → 抽 `.class` → 在 `web` 下的 js/html 源码里整词搜索 → 块内所有 class 都搜不到即列为可删候选；`active / ok / right / exam / …` 这类状态词不单独作为"在用"证据，只输出候选不删文件 |
| 2 | 新增清理脚本 | `scripts/prune-css-dead.mjs`：按第 1 条口径删死规则，默认干跑，`--apply` 才写文件并留 `.pre-prune` 备份；内置三重自检（仍被引用的类不能消失 / 注释闭合 / 花括号配平 + 选择器形态） |
| 3 | 清理旧 CSS | `web/grammar.css`：1518 行 → 700 行（-806 行，-53%），字节 38,240 → 23,783（-38%）。删除 `.grammar-headline/eyebrow/sub/progress/toolbar/cats/search/source-note/layout/nav`、`.gnav-*`、`.gd-*`、`.gd-lecture*`、`.gd-lec-*`、`.grammar-empty`、`.tb-en`、`.tb-src` 等旧版语法页样式，以及 `@media (max-width:900px)` 整块（其内 5 条规则全部属于死代码）；保留 `.grammar-page`、`.grammar-jump`、`.smart-grammar*`（跨页面复用）、`.gr2-*`（新布局）与 4 条同名历史覆盖规则（见 14.4） |
| 4 | 缺陷修复（E2E 实测发现） | `GrammarView.setupSpy()` 的页内目录高亮：原实现取"判定带内 top 最小"的锚点，而 `#lecture`（讲义精讲整块）**包含** 13 个 `#lecture-N` 分节，两层同时命中时永远取到外层容器 → 页内目录在任何滚动位置都高亮"讲义精讲"，深链刷新后也指不到具体某一节。改为维护"判定带内锚点集合"、先取**最内层**（不含其它命中项者）再按 top 取最靠上者 |
| 5 | 版本号 | 语法族 `20260928-grammar-ia-r2` → `20260928-grammar-p4-r3`（10 处引用同步，见 14.6） |
| 6 | 截图基线固化 | 30 专题 × {1440px, 520px} 共 60 张 → `reports/screenshots/20260928/`（临时目录 `tmp/grammar-preview/shots/` 不能当基线） |
| 7 | 新增验证工具 | `scripts/e2e-grammar-entry.mjs`（真实服务 + 登录 Cookie 下走三条入口）、`scripts/css-ab-shots.mjs` + `scripts/css-pixel-diff.mjs`（改样式前后的像素级 A/B） |

### 14.2 验收实测

| 项 | 结果 | 证据 |
| --- | --- | --- |
| 死代码体检 | `check-css-usage.mjs` 清理后 **0 个候选**（清理前 112 块 / 843 行） | `node scripts/check-css-usage.mjs` |
| 清理安全性 | 结构自检通过（注释闭合、花括号 221 对配平、选择器形态正常）；"仍被引用的类"零误删 | `node scripts/prune-css-dead.mjs --strict` |
| **外观零变化** | 4 个专题（g-overview / g-nouns / g-prepositions / g-if-clause）× {1440px, 520px}，新旧 CSS 同环境交替截图：**8/8 逐像素一致（0 差异像素）**；一次 `g-prepositions@520` 抖动 269 px，重跑归零，判定为渲染抖动 | `scripts/css-ab-shots.mjs` + `scripts/css-pixel-diff.mjs` |
| 30 专题回归 | 60/60 截图成功；横向溢出 0；运行时错误 0；375px（iframe）无横向滚动 | `reports/grammar-preview-20260928-p4.txt` |
| 登录态端到端 | **6/6 通过**：登录 → 课程页「语法」页签 →「前往语法专题」→ 命中 `#grammar/g-future-tense`；智能学习台语法专项 → `#grammar/g-nouns`；`#grammar/g-pronouns/lecture-3` 刷新后展开并 `tocOn=lecture-3`；全程 0 JS 异常 | `scripts/e2e-grammar-entry.mjs`、`reports/e2e-grammar-entry-20260928.json` |
| 其它自检 | `check-grammar-ia.mjs`（30 专题 / 5 组 / 课程语法名 54 命中 52）、`check-nav-hash.mjs`（10 例）、`build-yufan-lectures.mjs --check`（错误 0 / 警告 0）、`go vet ./...` 全部通过 | 见 14.7 命令 |
| `go test ./...` | 仅 1 个**既有**失败：`internal/learning.TestCourseLoadsTextbookContent` 缺 `web/audio/7/appendix/pronunciation-guide.mp3`（见 §12.5）；本轮未改任何 `.go` 文件 | `go test ./...` |

### 14.3 死代码判定口径与踩坑记录

1. 判定：规则块内**所有** class 在 `web` 下 js/html 源码里都搜不到引用；带状态词的复合选择器（如 `.gd-option.correct`）只因状态词命中而"存活"的情况，用"状态词不单独作证据"排除。
2. 反向校验：删除前断言"仍被引用的类一个都不能消失"，并把该断言写成脚本内置检查（失败即退出，不写文件）。
3. **踩坑（已修，并固化成自检）**：给 `grammar.css` 写新头部注释时写了 `web/**/*.{js,html}`，其中的 `*/` 会把注释提前结束，后面的 `*.{js,html} …` 被当成选择器，把 `.grammar-page` 整条规则吞掉 → 页宽失去 `max-width:1240px` 约束、左右满宽，1440px 下 `#lecture-3` 上移 153px。
   `prune-css-dead.mjs` 因此增加了"剥注释后检查选择器形态"的结构自检，并把该反例保留为自测样本（`node scripts/prune-css-dead.mjs --css tmp/broken.css` 会报错退出）。
   **教训：删样式这类改动不能只看"类还在不在"，必须看一眼真实渲染的几何/像素。**

### 14.4 与 course.css / tongbu.css 同名的 4 条历史覆盖规则（保留，待拍板）

`grammar.css` 里这 4 条是旧版语法详情页留下的，与其它模块样式表同名，且在 `index.html` 里 grammar.css 排在 course.css 之后、tongbu.css 之前，因此会覆盖它们对同名类的设计：

| 规则 | 实际影响（登录态实测计算样式） | 影响面 |
| --- | --- | --- |
| `.grammar-detail` | 课程页语法点说明 `<p>` 被加 26px 内边距 + 1px 描边 + 18px 圆角 + 白底 + 阴影（文字部分仍是 course.css 的样式） | 课程学习页 · 语法页签 |
| `.sec-dot` | 覆盖 course.css 的 8px 点为 7px（少了 `display:inline-block`，靠 course.css 兜底） | 课程学习页 |
| `.ex-ico` / `.ex-ico.ok` / `.ex-ico.no` | 覆盖 course.css 的纯文字"例"为 16×16 圆形徽标（flex 居中） | 课程学习页 · 语法页签 |
| `.tb-zh` | 覆盖 tongbu.css 的正文色 `#22332d` 为 `#5c6b64`、字号 12.5px | 同步训练 |

现状外观见 `reports/screenshots/20260928-e2e/s2b-course-grammar-pane.png`（课程页语法页签）——是"卡片 + 圆形例标"的样式，**不算坏**，所以本轮**保留未删**。要改成 course.css / tongbu.css 的"纯文字"口径，只需把这 4 条从 `grammar.css` 移除（可用 `css-ab-shots` 做像素级影响面验证），请拍板。

### 14.5 已知小问题（未修，影响面有限）

手写/外部 URL 里的页内锚点 `#grammar/<id>/points|pitfalls|memory|practice|quick` 刷新会落到错误位置：这些锚点位于懒加载的讲义块之后，`revealAnchor()` 在讲义展开前就滚了一次且不再重试（`lecture-N` 有 `pendingAnchor` 重试，其它锚点没有）。
页内目录点击走 `jumpTo()`，不受影响；`syncHash()` 也只写回 `lecture-N`，正常操作不会产生这类 URL。修法：`revealAnchor()` 对非讲义锚点在讲义未加载时返回 `false`（保留 `pendingAnchor`），加载完成后重试。

### 14.6 版本号同步（r2 → r3）

`web/index.html`（2 处：`grammar.css?v=`、`main.js?v=`）、`web/js/main.js`（3 处 import）、`web/js/components/GrammarView.js`（1）、`web/js/components/SmartLearningView.js`（1）、`web/js/grammar/index.js`（3）= 10 处；全仓已无 `grammar-ia-r2` 残留（仅 §12.5、`reports/grammar-redesign-p1-20260927.md` 中的历史加注保留旧字样）。

### 14.7 可复现命令

```bash
node scripts/check-css-usage.mjs                       # 死代码体检（只报告，清理后应为 0 候选）
node scripts/prune-css-dead.mjs --strict                # 删除计划（干跑）
node scripts/prune-css-dead.mjs --strict --apply        # 真正删除（自动留 .pre-prune 备份 + 三重自检）
node scripts/css-ab-shots.mjs --topics g-overview,g-nouns --widths 1440,520
node scripts/css-pixel-diff.mjs tmp/css-ab/g-nouns-1440-old.png tmp/css-ab/g-nouns-1440-new.png
node scripts/grammar-preview.mjs --topics <30 个专题> --widths 1440,520 --probe --pop --frame 375 --height 1600
go run ./cmd/server -addr 127.0.0.1:8099               # 另开一个终端
node scripts/e2e-grammar-entry.mjs --base http://127.0.0.1:8099
```

### 14.8 剩余

1. ✅ **P3 数据治理**：已在 §15 完成（定语从句专题补齐，课程语法名 54/54；新增 `authored` 讲义类型）。
2. 待拍板：§14.4 的 4 条同名覆盖规则是否移除；音频缺口 `web/audio/7/appendix/pronunciation-guide.mp3` 是补文件还是改数据引用。
3. §14.5 的页内锚点刷新定位（可选修复）。
4. §5.4 学习路径视图（已确认延后）。
---

## 15. P3 实施记录（定语从句内容缺口补齐，2026-09-28）

- 本轮范围：P3「数据治理」的遗留项 —— 定语从句 2 条「课程有、专题无」缺口（九年级上册 Module 10/11）；顺带把该验收指标固化成自检硬门槛。
- 版本号：语法族 `20260928-grammar-p3-r4`；yufan 讲义族 `20260928-yufan-r5`。

### 15.1 结论

| 指标 | 改动前 | 改动后 |
| --- | --- | --- |
| 课程模块语法名命中 | 52 / 54（缺定语从句 2 条） | **54 / 54**（`node scripts/check-grammar-ia.mjs`） |
| 专题总数 | 30 | **31** |
| 复合句组条目 | 4 | **5**（新增「定语从句」） |
| 新专题内容形态 | — | 速查卡 4 张 · 要点 4 条 · 对照表 1 张 · 易错 4 条 · 考法 2 条 · 记忆卡 3 条 · 教材例句 4 句 · 讲义 7 节 · 专项练习 4 题 |

新专题：`g-attributive-clause`（定语从句），导航位置=复合句组第 5 位（外研版九上 Module 10/11 的语法聚焦，是初中教材里最后出现的从句，排在宾语从句 / 直接引语 / 状语从句 / if 条件句之后）。

### 15.2 改动清单

| # | 文件 | 改动 |
| --- | --- | --- |
| 1 | `web/js/grammar/topics.js` | 新增专题对象 `g-attributive-clause`（插在 `g-adverbial-clause` 之后，含 summary / forms / points / contrasts / pitfalls / examTips / memoryCard / textbookLinks / textbookExamples） |
| 2 | `web/js/grammar/ia.js` | ① `topicIA` 注册 `{ group: "clause", order: 5 }`；② 别名规则新增 `定语从句 → g-attributive-clause`（写在「状语从句」规则之前，避免关键词抢匹配） |
| 3 | `web/js/grammar/authored.js` | 新增 4 道专项练习：`auth-attr-which`（指物）· `auth-attr-who`（指人）· `auth-attr-only-that`（只能用 that）· `auth-attr-agreement`（从句主谓一致） |
| 4 | `web/js/grammar/yufan/attributive-clause.js`（新增） | 自撰讲义 7 节：先行词与关系词 → that/which 指物（M10）→ who/that 指人（M11）→ 作宾语可省略 → 只能用 that → 从句主谓一致 → 易错清单与辨析 |
| 5 | `scripts/build-yufan-lectures.mjs` | 新增 `authored: true` 讲义类型（非扫描件：`sourceDirs` 必须为空数组、`imagesRead` 必须为 0、必须写 `sourceNote` 内容依据）；`ASSET_V` r4 → r5 |
| 6 | `web/js/grammar/yufan/index.js` | 聚合并透出 `sourceNote` 到 `lecture` 元数据；manifest `?v=` 升 r5 |
| 7 | `web/js/components/GrammarView.js` | 讲义头文案抽出 `lectureSourceLabel`：扫描件仍显示「教材图片整理 · <目录>」，自撰讲义显示 `sourceNote`；模块 `?v=` 升 `20260928-grammar-p3-r4` |
| 8 | `scripts/check-grammar-ia.mjs` | ① 可达性断言覆盖 `g-attributive-clause`；② **课程语法名未命中由「备注」改为硬失败**，把 54/54 这条验收固化进自检 |
| 9 | `scripts/e2e-grammar-entry.mjs` | ① 课程页扫描范围由「前 24 个模块」改为全模块（`--scan`，默认 96）；② 新增 S2c 断言：定语从句课程语法名必须落到 `g-attributive-clause`；③ 新增 `--out` 指定报告路径，避免覆盖 P4 的 e2e 记录 |
| 10 | 版本号 | 语法族 `20260928-grammar-p4-r3` → `20260928-grammar-p3-r4`（10 处引用同步）；yufan 族 `20260928-yufan-r4` → `20260928-yufan-r5`（manifest + 聚合入口 + README §8） |
### 15.3 内容依据（不编造）

1. 教材语法聚焦：外研版九年级上册 Module 10 Australia（that/which 指物）、Module 11 Photos（who/which 指人）。来源：`chuzhong/九年级.md` Module 10/11、`chuzhong/grammar.json`（`定语从句(that/which)` / `定语从句(who/which)`）、`chuzhong/catalog.json`。
2. 教材例句 4 句直接取自上述教材数据：`I have some photos that I took in Australia last year.` / `The game that they like most is Australian football.` / `He's the boy who won the photo competition last year!` / `The photo which we liked best was taken by Zhao Min.`
3. 讲义里另有 2 句取自本仓原创课文：`chuzhong/原创课文/九年级上册/Module10_Australia.md`（green hills and mountains that reach a great height）、`Module11_Photos.md` 与 Module 10 的 people who lived there。
4. 北京卷单项填空不直接考查定语从句，故练习按现有 `authored.js` 口径自编，界面标注「专项练习」（与 `adapted.js` 的「真题改编」、真题的「北京中考真题」区分）。

### 15.4 实测证据

| 检查 | 命令 | 结果 |
| --- | --- | --- |
| 信息架构 | `node scripts/check-grammar-ia.mjs` | 31 专题 / 5 组；**课程语法名 54，未命中 0**；`定语从句｜未开始｜讲义 7 节｜题 4` |
| 讲义契约 | `node scripts/build-yufan-lectures.mjs --check` | 错误 0 / 警告 0；讲义文件 25 → 26，覆盖专题 24 → 25；首屏元数据 152,782 B（＋856 B，仍 ≤154 KB 基线），全量讲义 873,760 B，懒加载收益 5.72× |
| 内容去重 | `node scripts/check-grammar-duplication.mjs` | 新专题 **0 命中**（剩余 27 处均为 P2 已判定「单卡 / 部分覆盖，保留」的既有项） |
| 深链解析 | `node scripts/check-nav-hash.mjs` | 10 / 10 通过 |
| 渲染回归 | `node scripts/grammar-preview.mjs --topics g-attributive-clause,g-if-clause,g-object-clause,g-adverbial-clause --widths 1440,520 --probe --frame 375 --height 1600` | 4 专题 × 2 宽度：横向溢出 0 / 运行时错误 0；375px iframe `scrollWidth=375=clientWidth`；新专题 `lec.loaded=true secLen=7 status=ready` |
| 深链刷新 | `--hash grammar/g-attributive-clause/lecture-3 --probe` | `tocOn=lecture-3`、`openLec=lecture-0|lecture-3`、`active=lecture-3`、`scrollY=1333`、错误 0 |
| 讲义头文案回归 | `--topics g-nouns --widths 1440` + 截图目视 | 扫描件讲义仍是「教材图片整理 · yufan/名词 · 共 11 节」（`reports/screenshots/20260928-p3-e2e` 之外的新截图见 §15.5 说明） |
| 登录态端到端 | `node scripts/e2e-grammar-entry.mjs --base … --scan 96 --out reports/e2e-grammar-entry-20260928-p3.json` | **7 / 7 通过**（S1 登录 200；S2 课程页「前往语法专题」→ `#grammar/g-future-tense`；S2b 语法区计算样式取样；S2c 定语从句 → `g-attributive-clause`；S3 智能学习台 → `#grammar/g-nouns`；S4 深链刷新 `tocOn=lecture-3`；S5 JS 异常 0） |
| Go 静态检查 | `go vet ./...` | 通过（本轮无 `.go` 改动） |

### 15.5 未覆盖 / 风险与置信度

1. **点击级课程入口无法在本工作区验证到九上 Module 10/11**（置信度：映射正确=高，点击级=未验证）：`chuzhong/真实教材` 目前只有七年级上册，课程页只有 7 个版块，九上模块不在其中。替代验证：① `check-grammar-ia` 对全部 54 条课程语法名做解析（含定语从句 2 条）；② E2E 在页面内调用**真实前端模块**的 `resolveTopicId`（「前往语法专题」按钮用的同一函数）确认两条语法名 → `g-attributive-clause`。九上教材数据接入后，S2c 会自动走点击级校验。
2. **讲义是自撰而非扫描件**（置信度：中）：口径与外研版教材语法聚焦一致、例句有仓内来源，但没有逐句对应扫描图。若后续拿到九上扫描件，应按 `authored: false` + `sourceDirs` 重建该讲义。
3. **`authored` 是流水线新契约**（置信度：高）：`scripts/build-yufan-lectures.mjs` 只对声明 `authored: true` 的条目不要求图片；扫描件讲义（其余 25 个文件）校验口径未变，`--check` 错误 0 / 警告 0。
4. **首屏体积**：+856 B（新增专题的速查卡与元数据），仍 ≤154 KB 基线；讲义 10.9 KB 走懒加载。

### 15.6 可复现命令

```bash
node scripts/build-yufan-lectures.mjs --check          # 讲义契约（错误 0 / 警告 0）
node scripts/check-grammar-ia.mjs                      # 31 专题 / 54 语法名 / 未命中 0
node scripts/check-grammar-duplication.mjs             # 新专题 0 命中
node scripts/check-nav-hash.mjs                        # 深链解析 10 例
node scripts/grammar-preview.mjs --topics g-attributive-clause,g-if-clause,g-object-clause,g-adverbial-clause --widths 1440,520 --probe --frame 375 --height 1600
node scripts/grammar-preview.mjs --topics g-attributive-clause --widths 1440 --hash grammar/g-attributive-clause/lecture-3 --probe
go run ./cmd/server -addr 127.0.0.1:8099               # 另开一个终端
node scripts/e2e-grammar-entry.mjs --base http://127.0.0.1:8099 --scan 96 --shots reports/screenshots/20260928-p3-e2e --out reports/e2e-grammar-entry-20260928-p3.json
```

### 15.7 剩余

1. 待拍板：§14.4 的 4 条与 course.css / tongbu.css 同名的历史覆盖规则是否移除；音频缺口 `web/audio/7/appendix/pronunciation-guide.mp3` 是补文件还是改数据引用。
2. §14.5 的页内锚点刷新定位（`points|pitfalls|memory|practice` 等非讲义锚点，可选修复）。
3. §5.4 学习路径视图（已确认延后）。
4. 内容建设：仍有 6 个专题「待补讲义」（过去进行时 / There be / 祈使句与感叹句 / 宾语从句 / 状语从句 / if 条件状语从句）。