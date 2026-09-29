# 语法模块重设计 · P1 交付报告（2026-09-27/28）

- 目标：把语法模块从"两套内容 + 长滚动页面 + 平铺列表"改为「五组分类一棵树 + 三层导航 + 分区专题页」。
- 方案：`docs/grammar-redesign-plan.md`（v1，§12 为本次实施状态与验收实测）。
- 本轮结论：**P1（IA 与导航）已实施并通过自检**；P2/P3/P4 见 §12.6。

## 1. 交付物

| 文件 | 作用 |
| --- | --- |
| `docs/grammar-redesign-plan.md` | 方案正文 + §12 实施状态与验收实测 |
| `docs/grammar-redesign-wireframe.html` / `.png` / `_wf-mobile.png` | 桌面/移动线框 |
| `web/js/grammar/ia.js` | IA 单一事实源（五组 / 子组 / 专题登记 / 别名规则 / 解析） |
| `web/js/grammar/index.js` | 聚合入口（排序、状态、进度、最近专题、去重计数） |
| `web/js/components/GrammarView.js` | 专题树导航 + A–G 分区页面 + 页内 TOC + 深链锚点 |
| `web/grammar.css` | `gr2-*` 新命名空间样式（旧类保留未删） |
| `web/js/main.js` | `#<view>/<arg…>` 深链解析、`openGrammar`、课程页/智能学习台入口 |
| `scripts/check-grammar-ia.mjs` | IA 自检（分组完整性 / 死配置 / 别名命中 / 形态清单） |
| `scripts/check-nav-hash.mjs` | 主侧栏 hash 解析自检（切片跑 main.js 真实代码） |
| `scripts/grammar-preview.mjs` | 无头预览：截图 / 探针 / 375px iframe / 首屏体积 |
| `reports/grammar-preview-20260927.txt` | 30 专题 × {1440px, 375px} 探针原始输出 |

## 2. 验证结果（一句话/条）

1. `node scripts/check-grammar-ia.mjs` → 通过（30 专题 / 5 组，课程语法名 54 命中 52，`loadLecture(g-reported-speech)` 9 节）。
2. `node scripts/check-nav-hash.mjs` → 10 个用例全过（含"已在该模块时保留专题上下文"）。
3. `node scripts/build-yufan-lectures.mjs --check` → 错误 0 / 警告 0。
4. `go vet ./...` → 通过；`go test ./...` → 仅 `internal/learning` 的既有失败（缺 `web/audio/7/appendix/pronunciation-guide.mp3`，与本改动无关）。
5. 预览回归 30 专题：横向溢出 0、运行时错误 0；375px（iframe）与 520/620/1440px 均无横向滚动。
6. 首屏体积：语法元数据层 150.3 KB ≤ 154 KB 基线；新增 IA 层 8.1 KB。
7. 版本号：语法族 `20260928-grammar-ia-r2`（10 处引用同步，无残留）；yufan 族 `20260927-yufan-r3`（P2 去重后升为 `20260928-yufan-r4`，见 `reports/grammar-redesign-p2-20260928.md`）。

## 3. 本轮修复的缺陷

- D1 专题页顶部泄漏整段讲义 JSON（data/computed 同名 `lectureSections`）。
- D2 `if 条件状语从句` 被解析成「状语从句」、`直接引语与间接引语` 解析不到。
- D3 刷新 `#grammar/<id>/lecture-N` 不回位、专题内跳转丢锚点。

## 4. 未完成

- P2：内容去重脚本 + `forms/points` 与讲义重复项清理、`spreadNote` 改 tooltip。
- P3：定语从句等"课程有、专题无"的内容缺口。
- P4：截图基线固化、旧 CSS 死代码清理、登录态端到端点击验证。
