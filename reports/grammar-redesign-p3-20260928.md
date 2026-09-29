# 语法模块重设计 · P3 交付报告（2026-09-28）

方案与总状态：`docs/grammar-redesign-plan.md`（§12 = P1、§13 = P2、§14 = P4、§15 = 本轮 P3 实施记录）。

## 1. 本轮目标（P3：数据治理的内容缺口）

1. 补上「课程有、专题无」的 2 条语法点：九年级上册 Module 10 `定语从句(that/which)`、Module 11 `定语从句(who/which)`；
2. 让新专题有可用内容，而不是只有一个空壳（速查卡 + 要点 + 易错 + 教材例句 + 讲义 + 练习）；
3. 把「课程语法名必须全部命中专题」这条验收固化成自检硬门槛，避免以后教材加语法点时再悄悄出现缺口。

## 2. 交付物

| 文件 | 作用 |
| --- | --- |
| `web/js/grammar/topics.js` | 新增专题 `g-attributive-clause`（定语从句）：summary / 4 张速查卡 / 4 条要点（含正误例）/ 1 张对照表 / 4 条易错 / 2 条考法 / 3 张记忆卡 / 教材链接 2 处 / 教材例句 4 句 |
| `web/js/grammar/ia.js` | 导航注册 `{ group: "clause", order: 5 }` + 别名规则 `定语从句 → g-attributive-clause` |
| `web/js/grammar/authored.js` | 4 道专项练习（自编）：关系代词指物 / 指人 / 只能用 that / 从句主谓一致 |
| `web/js/grammar/yufan/attributive-clause.js`（新增） | 自撰讲义 7 节（10.9 KB，走懒加载） |
| `scripts/build-yufan-lectures.mjs` | 新增 `authored: true` 讲义类型 + 校验；`ASSET_V` r4 → r5 |
| `web/js/grammar/yufan/index.js` | 透出 `sourceNote`；manifest `?v=` → r5 |
| `web/js/components/GrammarView.js` | 讲义头 `lectureSourceLabel`（扫描件 / 自撰两种口径）；版本号 → `20260928-grammar-p3-r4` |
| `scripts/check-grammar-ia.mjs` | 可达性断言覆盖新专题；**课程语法名未命中改为 error** |
| `scripts/e2e-grammar-entry.mjs` | 课程页扫描扩到全模块（`--scan`）；新增 S2c 定语从句 → 新专题；新增 `--out` |
| `web/js/grammar/yufan/README.md` | 新增 §11「自撰讲义（authored）」契约说明；§8 版本号 → r5 |
| `reports/screenshots/20260928-p3/` | 新专题 1440 / 520 截图 + 扫描件讲义头回归截图 |
| `reports/screenshots/20260928-p3-e2e/` | 登录态端到端过程图 6 张 |
| `reports/e2e-grammar-entry-20260928-p3.json` | 端到端逐项结果（机器可读；P4 的旧记录保持不动） |

## 3. 内容依据（没有编造）

- 教材语法聚焦：外研版九年级上册 Module 10 Australia（that/which 指物）、Module 11 Photos（who/which 指人），见 `chuzhong/九年级.md`、`chuzhong/grammar.json`、`chuzhong/catalog.json`。
- 教材例句 4 句直接来自上述数据：`I have some photos that I took in Australia last year.` / `The game that they like most is Australian football.` / `He's the boy who won the photo competition last year!` / `The photo which we liked best was taken by Zhao Min.`
- 讲义另用 2 句本仓原创课文例句（`chuzhong/原创课文/九年级上册/Module10_Australia.md`、`Module11_Photos.md`）。
- 北京卷单项填空不直接考查定语从句 → 练习按现有 `authored.js` 口径自编，界面标注「专项练习」。

## 4. 关键决策

| 决策 | 选择 | 理由 |
| --- | --- | --- |
| 专题放哪个组、第几位 | 复合句组第 5 位（宾语从句 → 直接引语 → 状语从句 → if 条件句 → 定语从句） | 定语从句是外研版九上（初中最后阶段）的语法点，排最后符合组内"学习顺序"语义（order 不是难度） |
| 新专题内容放 `topics.js` 还是 `yufan/*.js` | `topics.js`（速查卡/要点等）+ `yufan/attributive-clause.js`（仅讲义正文） | `web/js/grammar/index.js` 的契约写明 `topics.js` 是"专题正文"来源、`yufan/*` 是"讲义正文"来源；且复合句组的其它专题都在 `topics.js` |
| 没有扫描图，讲义怎么办 | 新增 `authored: true` 讲义类型（`sourceDirs` 空、`imagesRead` 0、必须写 `sourceNote`） | 直接空着会让新专题退化成"待建设"；塞进 `topics.js` 又会把 sections 带上首屏（违背懒加载设计） |
| 练习怎么来 | 自编 4 题（`authored`） | 与 There be / 祈使句 / 状语从句等"无真题语法点"的既有做法一致 |
## 5. 验收结果（对照 §15.1 / §15.4）

| 检查 | 命令 | 结果 |
| --- | --- | --- |
| 课程语法名命中 | `node scripts/check-grammar-ia.mjs` | 改动前 52 / 54 → **54 / 54**；专题 30 → 31；`定语从句｜未开始｜讲义 7 节｜题 4` |
| 讲义契约 | `node scripts/build-yufan-lectures.mjs --check` | 错误 0 / 警告 0；讲义 25 → 26 个文件、覆盖 24 → 25 个专题 |
| 首屏体积 | 同上 | 152,782 B（+856 B），仍 ≤ 154 KB 基线；全量讲义 873,760 B，懒加载收益 5.72× |
| 内容去重 | `node scripts/check-grammar-duplication.mjs` | 新专题 0 命中（剩余 27 处全是 P2 已判定保留的既有项） |
| 深链解析 | `node scripts/check-nav-hash.mjs` | 10 / 10 通过 |
| 渲染回归 | `node scripts/grammar-preview.mjs --topics g-attributive-clause,g-if-clause,g-object-clause,g-adverbial-clause --widths 1440,520 --probe --frame 375` | 4 专题 × 2 宽度：横向溢出 0、运行时错误 0；375px iframe `scrollWidth == clientWidth == 375`；新专题讲义 `loaded=true secLen=7 status=ready` |
| 深链刷新 | `--hash grammar/g-attributive-clause/lecture-3 --probe` | `tocOn=lecture-3`、`active=lecture-3`、`openLec=lecture-0\|lecture-3`、`scrollY=1333`、错误 0 |
| 讲义头回归 | `--topics g-nouns --widths 1440` | 扫描件讲义仍显示「教材图片整理 · yufan/名词 · 共 11 节」（`reports/screenshots/20260928-p3/regression-g-nouns-1440.png`） |
| 登录态端到端 | `node scripts/e2e-grammar-entry.mjs --base http://127.0.0.1:8099 --scan 96 --out reports/e2e-grammar-entry-20260928-p3.json` | **7 / 7 通过**（见下） |
| Go 静态检查 | `go vet ./...` | 通过（本轮零 `.go` 改动） |

端到端逐项：

- S1 登录：`POST /api/auth/login → 200`，`GET /api/auth/me → 200`；
- S2 课程页「前往语法专题」：课程语法「可数名词与冠词；基数词；be 动词；一般将来时（be going to）」→ `#grammar/g-future-tense`，专题标题「一般将来时」；
- S2b 课程页语法区渲染取样：`.grammar-detail` 26px padding / 18px 圆角 / 白底阴影，`.ex-ico` 16×16 圆形徽标（即 §14.4 那 4 条同覆盖规则仍在生效，按待拍板处理）；
- S2c 定语从句：见 §6「未覆盖」；
- S3 智能学习台语法专项 → `#grammar/g-nouns`；
- S4 深链刷新 `#grammar/g-pronouns/lecture-3`：展开 + TOC 高亮 `lecture-3`；
- S5 全流程 JS 异常 0。

## 6. 未覆盖 / 风险（重要）

1. **课程页点击级入口无法在本工作区验证到九上 Module 10/11**（置信度：映射正确=高，点击级=未验证）。
   `chuzhong/真实教材` 目前只有七年级上册，课程页只有 7 个版块，九上模块不在其中。替代验证两条：
   ① `check-grammar-ia` 对全部 54 条课程语法名做解析（含定语从句 2 条）；
   ② E2E 在页面内调用**真实前端模块**的 `resolveTopicId`（「前往语法专题」按钮用的同一函数）确认两条语法名 → `g-attributive-clause`。
   九上教材数据接入后，S2c 会自动改走点击级校验，无需改脚本。
2. **讲义是自撰而非扫描件**（置信度：中）：内容口径与外研版教材语法聚焦一致、例句有仓内来源，但没有逐句对应扫描图。拿到九上扫描件后应按 `authored: false` + `sourceDirs` 重建该讲义。
3. **`authored` 是讲义流水线的新契约**（置信度：高）：只对声明 `authored: true` 的条目不要求图片，其余 25 个扫描件讲义的校验口径未变（`--check` 错误 0 / 警告 0）。
4. **`check-grammar-duplication --strict` 仍会退出 1**：这是 P2 就定下的口径（有 warning 不等于要删，只有「整卡覆盖」才删）。本次未改变该口径，新专题在报告里 0 命中。

## 7. 下一步

1. 待用户拍板：§14.4 的 4 条同名历史覆盖规则（`.grammar-detail` / `.sec-dot` / `.ex-ico` / `.tb-zh`）是否移除；缺失音频 `web/audio/7/appendix/pronunciation-guide.mp3` 是补文件还是改数据引用；
2. 可选修复：§14.5 页内锚点刷新定位（`points|pitfalls|memory|practice`）；
3. 内容建设：仍有 6 个专题「待补讲义」（过去进行时 / There be / 祈使句与感叹句 / 宾语从句 / 状语从句 / if 条件状语从句）；
4. §5.4 学习路径视图（已确认延后）。

## 8. 回滚方式（无 git，按文件还原）

本轮所有改动都留了改动前备份，位于 `reports/archive/*.pre-p3-20260928.bak`：
`topics.js` / `ia.js` / `authored.js` / `GrammarView.js` / `yufan/index.js` / `yufan/README.md` / `build-yufan-lectures.mjs` / `check-grammar-ia.mjs` / `e2e-grammar-entry.mjs` / `grammar/index.js` / `web/index.html` / `main.js` / `SmartLearningView.js` / `grammar-redesign-plan.md`。
新增文件（删除即可回滚）：`web/js/grammar/yufan/attributive-clause.js`。
回滚后需同步把版本号改回 `20260928-grammar-p4-r3` / `20260928-yufan-r4`，并重跑 `node scripts/build-yufan-lectures.mjs`。