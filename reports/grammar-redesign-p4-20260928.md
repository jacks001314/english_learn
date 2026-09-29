# 语法模块重设计 · P4 交付报告（2026-09-28）

方案与总状态：`docs/grammar-redesign-plan.md`（§12 = P1、§13 = P2、§14 = 本轮 P4 实施记录）。

## 1. 本轮目标（P4：视觉回归与清理）

1. 清掉语法模块里没人用的旧样式（`.gd-*` / `.gnav-*` / `.grammar-headline*` 等死代码）；
2. 把 30 专题的视觉基线固化下来（可复跑的截图 + 探针报告）；
3. 在真实服务 + 真实登录态下，把「进入语法专题」的三条入口点一遍。

## 2. 交付物

| 文件 | 作用 |
| --- | --- |
| `web/grammar.css` | 死代码清理：1518 → 700 行（-806 行 / -53%），字节 38,240 → 23,783（-38%）；文件头改成"现只保留三部分"的说明 |
| `scripts/check-css-usage.mjs` | 死代码体检（切规则块 → 抽 class → 在 `web` 下 js/html 里整词搜索；状态词不单独作证据），只报告不改文件 |
| `scripts/prune-css-dead.mjs` | 删死规则（默认干跑，`--apply` 写文件并留 `.pre-prune` 备份）；三重自检：引用类零误删 + 注释闭合 + 花括号配平/选择器形态 |
| `scripts/css-ab-shots.mjs` | 同一环境里用新旧两份 CSS 交替截图（专治"环境漂移被误判成样式改动"） |
| `scripts/css-pixel-diff.mjs` | 两张 PNG 的像素级差异报告（零依赖，自己解 PNG） |
| `scripts/e2e-grammar-entry.mjs` | 登录态端到端：登录 → 课程页入口 → 智能学习台入口 → 深链刷新 |
| `scripts/grammar-preview.mjs` | 预览探针新增 `tocOn=` / `nearBand=` / `active=`（页内目录高亮与判定带），便于深链回归 |
| `web/js/components/GrammarView.js` | 修复页内目录高亮取错锚点（详见 §5） |
| `web/index.html`、`web/js/**` | 版本号语法族 `20260928-grammar-ia-r2` → `20260928-grammar-p4-r3`（10 处同步） |
| `reports/grammar-preview-20260928-p4.txt` | 30 专题 × {1440px, 520px} + 375px(iframe) 探针原始输出（LF / UTF-8） |
| `reports/screenshots/20260928/*.png` | 视觉基线：30 专题 × 2 宽度 = 60 张 |
| `reports/screenshots/20260928-e2e/*.png` | 端到端过程截图（课程页语法页签、跳转后、智能学习台、深链刷新） |
| `reports/e2e-grammar-entry-20260928.json` | 端到端逐项结果（机器可读） |

## 3. 死代码是怎么判、怎么删的

1. **判定**：按花括号配对切出规则块（含 `@media` 内层），抽块内全部 `.class`，在 `web` 下的 `js/mjs/html` 源码里做整词搜索；**块内所有 class 都搜不到**才列为候选。
2. **状态词不算证据**：`active / ok / right / wrong / exam / corrected / muted / adapted / authored …` 在大量无关组件里出现，只凭它们命中的复合选择器（如 `.gd-option.correct`）一律按死代码处理。
3. **删除前**：备份 `web/grammar.css.pre-prune`（工作区无 git，必须留退路）；删除时断言"仍被引用的类一个都没消失"，失败即中止不写文件。
4. **删除后**：结构自检（注释闭合 / 花括号配平 / 选择器形态）+ 真实渲染验证（见 §4）。
5. 结果：`check-css-usage.mjs` 从"112 块 / 843 行候选"变为 **0 候选**；文件里只剩三类内容——跨页面复用的 `.grammar-page` / `.grammar-jump` / `.smart-grammar*`、新布局 `.gr2-*`、以及与 `course.css` / `tongbu.css` 同名的 4 条历史覆盖规则（见 §6）。

## 4. 关键验收：删除后外观零变化（像素级）

同一台机器、同一轮 Chrome 里**交替**用旧/新 CSS 截图（避免环境漂移），再逐像素比对：

| 专题 | 1440px | 520px |
| --- | --- | --- |
| g-overview | 0 差异像素 | 0 差异像素 |
| g-nouns | 0 | 0 |
| g-prepositions | 0 | 0（首次 269 px 抖动，重跑归零 → 渲染抖动，非样式差异） |
| g-if-clause | 0 | 0 |

30 专题全量回归（`reports/grammar-preview-20260928-p4.txt`）：

- 截图 60/60 成功；横向溢出 **0**；运行时错误 **0**；
- 375px（iframe 模拟）× 30 专题无横向滚动；
- 6 个专题没有讲义（`g-past-continuous` / `g-there-be` / `g-imperatives` / `g-object-clause` / `g-adverbial-clause` / `g-if-clause`）与 P2 时一致，非本轮回归。

## 5. 本轮修的一个真实缺陷：页内目录永远高亮不到具体某一节

- **现象**：右侧"本节目录"在滚动到讲义任何一节时都高亮「讲义精讲 · 13 节」，永远指不到"三、实词、虚词与小品词"这种具体条目；深链 `#grammar/<id>/lecture-N` 刷新后同样。
- **根因**：`GrammarView.setupSpy()` 用 IntersectionObserver 观察 `.gr2-detail [data-anchor]`，但 `#lecture`（讲义精讲**整块**）**包含** 13 个 `#lecture-N` 分节。两层同时落在判定带里时，原实现按 `top` 最小取锚点 → 永远取到外层容器 `#lecture`。
- **修复**：维护"判定带内锚点集合"，先取**最内层**（不含其它命中项者），再按 `top` 取最靠上者。
- **实测**（预览探针新增 `tocOn=`）：

| 深链 | 修复前 | 修复后 |
| --- | --- | --- |
| `#grammar/g-pronouns/lecture-3` | `tocOn=lecture` | `tocOn=lecture-3` |
| `#grammar/g-nouns/lecture-1` | — | `tocOn=lecture-1` |
| `#grammar/g-nouns/lecture-8` | — | `tocOn=lecture-8` |
| `#grammar/g-adj-adv/lecture-12` | — | `tocOn=lecture-12` |

## 6. 登录态端到端（6/6 通过）

`node scripts/e2e-grammar-entry.mjs --base http://127.0.0.1:8099`（真实 Go 服务 + 真实会话 Cookie + headless Chrome/CDP）：

| 项 | 结果 |
| --- | --- |
| S1 登录 | `POST /api/auth/login → 200`，`GET /api/auth/me → 200` |
| S2 课程页入口 | 课程学习 · 七年级上册 Starter「语法」页签 →「前往语法专题」→ `#grammar/g-future-tense`，专题标题「一般将来时」（课程侧原文是"可数名词与冠词；基数词；be 动词；一般将来时（be going to）"，走 IA 别名映射命中） |
| S2b 课程页语法区渲染取样 | `.grammar-detail` 计算样式 = `padding 26px / 1px 描边 / 18px 圆角 / #fff / 阴影`（来自 grammar.css 的历史覆盖规则）；`.ex-ico` = 16×16、`border-radius:50%`、`display:flex` |
| S3 智能学习台入口 | 语法专项推荐「名词词法 · 0/15 题」→ `#grammar/g-nouns`，标题「名词」 |
| S4 深链刷新 | `#grammar/g-pronouns/lecture-3` 刷新后：分节展开 ✅、`tocOn=lecture-3` ✅、锚点落在视口内（14/1000） ✅ |
| S5 运行时 | 全流程 `Runtime.exceptionThrown` / `console.error` = 0 |

## 7. 其它自检

| 命令 | 结果 |
| --- | --- |
| `node scripts/check-grammar-ia.mjs` | ✅ 30 专题 / 5 组 / 课程语法名 54 命中 52（缺口仍是定语从句 2 条） |
| `node scripts/check-nav-hash.mjs` | ✅ 10 个用例全过 |
| `node scripts/build-yufan-lectures.mjs --check` | ✅ 错误 0 / 警告 0 |
| `node scripts/check-css-usage.mjs` | ✅ 0 个可删候选 |
| `go vet ./...` | ✅ 通过 |
| `go test ./...` | ⚠️ 仅 1 个既有失败：`TestCourseLoadsTextbookContent` 缺 `web/audio/7/appendix/pronunciation-guide.mp3`（与本轮改动无关；本轮未改任何 `.go` 文件） |

## 8. 一个值得记住的坑（已固化成工具自检）

给 `grammar.css` 写新头部注释时写了 `web/**/*.{js,html}`——其中的 `*/` **把注释提前结束**，后面的 `*.{js,html} …` 被当成选择器，把紧随其后的 `.grammar-page { max-width:1240px; … }` 整条吞掉：

- 现象：页面失去 1240px 居中约束、左右满宽；1440px 下 `#lecture-3` 位置整体上移 153px；
- 发现方式：**新旧 CSS 像素 A/B**（52% 像素不同）+ 计算样式探针（`maxW: none`）；
- 处置：修注释；`prune-css-dead.mjs` 增加"剥注释后检查选择器形态"的结构自检，并把该反例固化为自测样本（`node scripts/prune-css-dead.mjs --css tmp/broken.css` 直接报错退出）。

**教训：样式改动不能只看"类还在不在"，必须看真实渲染的几何与像素。**

## 9. 未决 / 待你拍板

1. **4 条同名历史覆盖规则**（`.grammar-detail` / `.sec-dot` / `.ex-ico` / `.tb-zh`）：它们是旧版语法详情页留下的，但因同名且 `grammar.css` 排在 `course.css` 之后、`tongbu.css` 之前，会覆盖那两个模块对同名类的设计（详见 §14.4）。现状外观（卡片 + 圆形"例"标）不算坏，**本轮保留未删**；要恢复 course.css / tongbu.css 的"纯文字"口径就说一声，我用像素 A/B 验证影响面后再改。
2. **音频缺口**：`web/audio/7/appendix/pronunciation-guide.mp3` 被 `chuzhong/真实教材/七年级上册/book.json` 引用但无实体文件（`go test` 唯一失败项）。是补文件还是改数据引用？
3. **页内锚点刷新定位（小问题）**：手写 URL `#grammar/<id>/points|practice|…` 刷新会落错位置（这些锚点在懒加载讲义块之后，`revealAnchor()` 不重试）。正常点击不受影响。
4. **P3 遗留**：定语从句 2 条「课程有、专题无」（九年级上册 Module 10/11）。