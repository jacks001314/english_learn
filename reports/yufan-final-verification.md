# yufan 语法讲义 · 最终验收报告

日期：2026-09-27 ｜ 主控：syntropy (agent-759db7e9d9d51c42aa267b3f) ｜ 项目：project-6df884qienz5

## 一、结论
**任务完成并通过端到端验收。** 依据 `yufan/` 下 25 个主题目录的 **417 张教材扫描图**，
产出 **25 个讲义数据文件**，覆盖 **24 个语法专题**（其中 **9 个为本次新建专题**），
合并后语法页 **0 校验错误 / 0 覆盖率缺口**，浏览器端到端 **0 运行错误**。

## 二、交付物（主控 project home）
- `web/js/grammar/yufan/*.js`：25 个数据文件（873,397 B 合计）+ `index.js`（脚本重建的 MODULES 聚合）
- `web/js/grammar/yufan/README.md`（契约，含 §7 图片读取规范 / §7.1 双条件 / §7.2 yufan-ds 约定）
- 前端改造：`web/js/components/GrammarView.js`（新增「讲义精讲」渲染 6 种 block + 空数组守卫）、
  `web/js/grammar/index.js`（`attachYufan()` 注入讲义/extras/新专题）、`web/grammar.css`（讲义样式）
- 工具：`scripts/build-yufan-lectures.mjs`（校验+覆盖率+重建聚合+报告）、`scripts/yufan-prepare-images.py`（读图镜像）
- 缓存版本号：`v=20260927-yufan-r1`（index.html / main.js / GrammarView / grammar/index.js）

## 三、9 个新建专题
| topicId | 标题 | category | difficulty |
| --- | --- | --- | --- |
| g-overview | 总论 | 词法 | 1 |
| g-inversion | 倒装句 | 句法 | 4 |
| g-future-tense | 动词的将来时 | 动词 | 3 |
| g-verbs-overview | 动词概说 | 动词 | 2 |
| g-nonfinite-verbs | 非谓语动词 | 动词 | 4 |
| g-agreement | 主谓一致 | 句法 | 4 |
| g-sentence-members | 句子的成分和基本句型 | 句法 | 3 |
| g-sentence-types | 句子的种类 | 句法 | 3 |
| g-sentence-structure | 句子的结构 | 句法 | 5 |
（均含 category/difficulty/forms/points/pitfalls/examTips/memoryCard 七项附加字段）

## 四、验收证据（可复现）
1. **结构与覆盖率**：`node scripts/build-yufan-lectures.mjs`
   → 磁盘图片 **417** / 讲义文件 **25** / 覆盖专题 **24** / 声明已读 **417** / **错误 0 / 警告 0**。
   逐目录核对 25/25 目录张数全部一致（含 25 张表、210 节、全部 `table.rows` 与 `head` 对齐、
   `examples` 均含 en+zh）。
2. **模块与聚合**：`node` 直接 `import('./web/js/grammar/index.js')`
   → `grammarTopics=29`（20 旧 + 9 新）、`sortedTopics=29`、**`grammarExercises=137`（与改造前基线一致，无回归）**、
   `lectureByTopic=24`、无重复 topicId。
3. **浏览器端到端**（Chrome headless @ `go run ./cmd/server --addr :8099`，4 个探针）：
   | 探针 | 结果 |
   | --- | --- |
   | 默认页 | `topics=29 navItems=29 lectures=24 hasLectureHeading=true lectureSections=13 lectureTables=12 lectureExamples=63 errs=[]` |
   | `?t=g-verbs-overview` | `detailTitle=动词概说 lectureSections=8 lectureTables=11 lectureExamples=30 errs=[]` |
   | `?t=g-nouns` | `detailTitle=名词与主谓一致 lectureSections=11 lectureTables=9 lectureExamples=22 errs=[]` |
   | `?t=g-overview` | `detailTitle=总论 lectureSections=13 lectureTables=7 lectureExamples=29 errs=[]` |
4. **多文件拼接正确**：`g-adj-adv` 由 `adjectives.js`(8 节) + `adverbs.js`(7 节) 拼接，实测合并后 **15 节**，未被覆盖。
5. **内容与图片一致性**（人工反向读图抽样，共 10 张）：句法 3 张（介词 p.124 / 句子成分 p.327 / 句子结构 p.382 倒置页）、
   词法 2 张（名词 `_255_` / 代词）、动词 5 张（含 b2 旋转 90 度 P278、b4 助动词 P186、情态动词 P193）——
   逐条与原图一致，未发现编造。
6. **越界检查**：3 个 worker 工作区的 `topics.js`/`index.js` 与快照逐字节一致；worker 新增文件 = 各自交付文件。

## 五、过程中发生并已修复的事故
**413 Payload Too Large 批量打死 worker**（b3 零产出、a1/a2 各缺 1 件）。
根因：`view_image` 的 base64 图片常驻会话历史、每次请求全量重发，网关请求体上限实测 ≈48MiB。
修复：读图镜像（quality=60，≈5.87x）+ 单会话 ≤40 张双条件；受影响件由新建 a4/b4 补齐。
完整记录见 `reports/yufan-413-root-cause.md`。

## 六、残留风险与未做项（透明声明）
1. **9 个新专题暂无配套练习题**（页面显示"暂无真题"）——素材中无对应练习，需你确认是否另建题库。
2. **讲义 JS 体积 873KB**（25 个数据模块，进入语法页即全量加载）。可用按需加载优化，但需你定阈值再做。
3. **4 个既有专题无素材**：`if 条件句 / there be / 祈使句 / 状语从句` 在 `yufan/` 下没有对应目录，本次未补。
4. **无答案的原题只保留题干**：教材原图未印答案的练习页（Final Check / 实力测验等）按契约未编造答案。
5. **图片判读不确定性**：旋转 90 度、整页倒置、页边裁切等页已在各文件 `notes` 中显式标注；
   内容一致性为**抽样**（10/417 张反向复核），非逐张人工复核。
6. **413 后遗留的 b3/a1/a2**：控制面拒绝删除（`agent is outside the project`），就地保留为 idle，
   不影响交付；其会话已废，禁止再派读图任务。

## 七、团队与节点
| 角色 | agent | 节点 | 产出 |
| --- | --- | --- | --- |
| 主控 | syntropy `agent-759db7e9…` | Windows | 契约/前端/聚合/校验/合并/验收 |
| 词法队长 | yufan-lexis `agent-630ded92…` | Windows | 9 件 / 8 专题 / 135 张 |
| 动词队长 | yufan-verb `agent-dba20470…` | Linux .99 | 9 件 / 9 专题 / 145 张 |
| 句法队长 | yufan-syntax `agent-691556c0…` | Linux .99 | 7 件 / 7 专题 / 137 张 |
| 补件 worker | yufan-lexis-a4 / yufan-verb-b4 | Win/Linux | 2 件 / 3 件（413 后重建） |
7. **动词组 9 件字节级交叉校对（队长提供 字节+sha256 清单，主控逐件比对）**：**9/9 MATCH（size 与 sha256 前 16 位全等）**。

   | 文件 | 字节 | sha256[0:16] |
   | --- | ---: | --- |
   | present-simple.js | 26,557 | `2A5DD3CEEAFC8C95` |
   | present-continuous.js | 30,744 | `CA7C70CB898BA234` |
   | past-simple.js | 30,576 | `C8AD25348A3EF997` |
   | future-tense.js | 22,776 | `EA9085C49AEF1B0B` |
   | perfect-tense.js | 34,396 | `FE8D605EABD69C00` |
   | passive-voice.js | 32,385 | `EF6FF70009C237FD` |
   | verbs-overview.js | 47,736 | `F25DB13C2901538A` |
   | modal-verbs.js | 44,973 | `31A00FDB4A17BAAF` |
   | nonfinite-verbs.js | 38,618 | `5AE50049221127A6` |

   推论：主控 scp 取件链路**无字节级损伤/截断**（此前 413 事故的取件方式已被字节级证明无损）；
   词法组 2 件同样经 sha256 记录（nouns `604BFF6D684D2417…`、reported-speech `965A92D68051BEDC…`）。
---

## 9. 合并后复验（第二次，主控本机实跑，2026-09-27 22:3x）

### 9.1 数据层（`import()`）
- `node scripts/build-yufan-lectures.mjs` → 磁盘图片 417 / 讲义文件 25 / 覆盖专题 24 / 声明已读 417 / **error 0 / warning 0**（25 个目录逐目录 ✅）。
- `import('./web/js/grammar/index.js')` → `grammarTopics=29`、`sortedTopics=29`、`grammarExercises=137`、`lectureByTopic=24`、`yufanStats={topics:24,newTopics:9,imagesRead:417,sections:210,files:25}`、**重复 topicId = 0**。
- 9 个新专题 `category/difficulty/forms/points/pitfalls/examTips/memoryCard` 七项字段 **missing=[] 全齐**，`lecture=true` 全为真。

### 9.2 渲染层（headless Chrome 真实挂载 GrammarView，非仅数据校验）
| 探针 topic | lecture 节点 | 节数 | 表格 | 例句 | 标题「讲义精讲」 | JS 错误 |
| --- | ---: | ---: | ---: | ---: | :---: | ---: |
| g-verbs-overview | 1 | 8 | 11 | 30 | ✅ | 0 |
| g-nouns | 1 | 11 | 9 | 22 | ✅ | 0 |
| g-overview | 1 | 13 | 7 | 29 | ✅ | 0 |
| g-sentence-structure | 1 | 8 | 16 | 121 | ✅ | 0 |
| g-agreement | 1 | 8 | 1 | 106 | ✅ | 0 |

导航专题项 = 29（与数据层一致），来源标注（`教材图片整理 · yufan/...`）正确渲染，`app.config.errorHandler` + `window.onerror` 均无捕获。探针页与临时静态服务已删除，工作区无残留。

### 9.3 本次复验新发现并已修复的缺陷（1 处，前端缓存）
- `web/grammar.css` 于 20:18:54 新增「讲义精讲」样式，但 `web/index.html` 仍以 **旧版本号** `grammar.css?v=20260918-grammar-r7` 引用 → 老用户浏览器会命中旧 CSS，讲义区块样式会失效。
- 修复：`web/index.html:32` 改为 `grammar.css?v=20260927-yufan-r1`（与 `main.js` 同步）。修复后 5/5 渲染探针通过。

### 9.4 异常澄清：`g-past-continuous` / `g-imperatives` 不是新增专题
早前用「排除已知旧 topicId」枚举新专题时多出这两个 id，疑为越权写入。经查**证伪**：二者是**任务开始前就存在**的旧专题，位于 `web/js/grammar/topics.js`（第 399 行 `g-past-continuous`、第 895 行 `g-imperatives`），并同时出现在 `adapted.js / authored.js / exams-other.js / exercises.js`；`topics.js` 修改时间 20:08:42 = 基线快照时间，**本次未改动**。属枚举脚本口径问题，交付无异常。
