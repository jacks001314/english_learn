# 语法模块重设计 · P2 交付报告（2026-09-28）

方案与总状态：`docs/grammar-redesign-plan.md`（§12 = P1 实施与验收，§13 = P2 实施记录）。

## 1. 本轮目标（P2：内容呈现与数据治理）

把「速查卡」与「讲义正文」重复的内容清掉，并收掉专题页上仅剩的两处噪声：
`spreadNote` 长句、智能学习台里与页面不一致的旧四分类标签。

## 2. 交付物

| 文件 | 作用 |
| --- | --- |
| `scripts/check-grammar-duplication.mjs` | 重复内容体检（速查卡 vs 讲义表格/文字/例句，归一化 + 相似度 ≥0.8），只报告不改文件，`--strict` 供 CI |
| `web/js/grammar/yufan/{nouns,prepositions,conjunctions,past-simple}.js` | 删除 5 张「整卡被讲义覆盖」的速查卡 |
| `web/js/grammar/yufan/manifest.js` | 由构建脚本重建（`ASSET_V=20260928-yufan-r4`） |
| `web/js/components/GrammarView.js` / `web/grammar.css` | `spreadNote` → 标题旁 ⓘ 按钮 + 弹层（`.gr2-info` / `.gr2-pop`） |
| `web/js/components/SmartLearningView.js` | 语法专项列表改用 IA 分组名 `groupLabel(topic.group)` |
| `reports/grammar-duplication-20260927.txt` | 体检输出（候选清单 + 按卡聚合 + 判定口径） |

## 3. 判定口径

1. 速查卡来源有两处：`topics.js` 与 `yufan/<slug>.js` 自带；同一张表在两个分区各出现一次即为重复。
2. **整卡被讲义覆盖才删**（删重复侧、保留讲义正文）；**部分覆盖保留**；**`forms` 公式卡保留**。
3. 已清理 5 张：`名词作定语 vs 形容词作定语`、`有无定冠词 the 的词组辨义`、
   `not only...but also / as well as / both...and`、`一般现在时 vs 一般过去时（以 go 为例）`、
   `be 动词过去时句型（以 he 为主语）`。

## 4. 实测

| 项 | 结果 |
| --- | --- |
| `node scripts/check-grammar-duplication.mjs` | 344 条速查卡比对，**无「整卡覆盖」项**；剩 11 条 `forms` 单卡 + 9 条部分覆盖（按口径保留） |
| `node scripts/build-yufan-lectures.mjs --check` | 错误 0 / 警告 0（25 个讲义文件、417 张图、覆盖 24 个专题） |
| 首屏讲义元数据 | 151,926 B（manifest 140.2 KB + 聚合入口 8.1 KB）≤ 154 KB 基线，比 P1 时再小约 2 KB |
| `node scripts/check-grammar-ia.mjs` / `check-nav-hash.mjs` | 通过 |
| 预览探针（含 `--pop`） | `.gr2-info` 按钮 1 个，弹层文案 37 / 28 / 69 字；375 / 520 / 1440px 无横向溢出 |
| `go vet ./...` | 通过 |

## 5. 未完成（P3/P4）

- P4：旧 CSS 死代码（`.gd-*` / `.gnav-*`）清理、30 专题截图基线固化、登录态端到端点击验证。
- P3：定语从句等「课程有、专题无」的内容缺口。
