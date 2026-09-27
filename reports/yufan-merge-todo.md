# yufan 语法讲义合并 · 收尾清单（主控）

## 已完成（本地，已验证）
- [x] 契约冻结：`web/js/grammar/yufan/README.md` + `_template.js`
- [x] 渲染层：`GrammarView.js` 新增「讲义精讲」区块（text/list/table/examples/tip/pitfall 六种 block）+ 空数组守卫
- [x] 注入层：`grammar/index.js` 用 `attachYufan()` 把讲义/extras/新专题并入 `grammarTopics`
- [x] 聚合层：`yufan/index.js`（MODULES 由脚本重建）+ `scripts/build-yufan-lectures.mjs`（校验、覆盖率、报告）
- [x] 样式：`grammar.css` 讲义样式
- [x] 缓存版本号：`v=20260927-yufan-r1`（index.html / main.js / GrammarView / SmartLearningView / grammar/index.js）
- [x] 修复既有缺陷：`applyTarget` 误写在 `computed` 中导致深链跳转失效 + 每次挂载抛 `this.applyTarget is not a function`
- [x] 端到端基线验证（Chrome headless，:8099）：topics=20、navItems=20、详情页正常、`errs: []`

## 待办
- [ ] 收齐 9 个 worker 的 25 个 `<slug>.js`（Windows 节点直接读；Linux 节点用 `ssh jacks@192.168.1.99` scp 取回）
- [ ] `node scripts/build-yufan-lectures.mjs`：0 错误、覆盖率无遗漏（417 张图全部被引用）
- [ ] 端到端复验（Chrome headless）：`hasLectureHeading=true`、lectureSections > 0、新专题进入导航、`errs: []`
- [ ] 抽查若干专题的讲义内容与原图片一致（人工比对）
- [ ] 清理脚手架：删除 `web/__yufan-check.html`；停掉 :8099 调试服务
- [ ] 更新 `reports/yufan-lectures-report.md` 并汇报

## 纪律
- agent 只新增 `web/js/grammar/yufan/*.js`；合并、注入、渲染、样式全部由主控负责。
- 不编造图片内容：worker 必须报告 `imagesRead` 与存疑图片。
## 收尾完成（2026-09-27 21:2x，主控）
- [x] 收齐 25 个 `<slug>.js`（Windows 直读 + Linux `scp jacks@192.168.1.99` 逐个取件）
- [x] `node scripts/build-yufan-lectures.mjs` → **磁盘 417 张 / 讲义 25 件 / 专题 24 / 声明已读 417 / error 0 / warning 0**
- [x] 端到端复验（Chrome headless @ :8099，4 个探针：默认页 + g-verbs-overview + g-nouns + g-overview）
      全部 `topics=29 / navItems=29 / lectures=24 / hasLectureHeading=true / errs=[]`
- [x] 内容与图片一致性：由三位队长各自抽样反向读图（句法 3 张、词法 2 张、动词 5 张，共 10 张）逐条比对一致
- [x] 清理：`web/__yufan-check.html` 已删；:8099 调试服务已停；`yufan-ds/` 与 `_probe/` 已删（可再生）
- [x] `reports/yufan-lectures-report.md/json` 已由脚本重新生成；最终报告见 `reports/yufan-final-verification.md`

## 新增记录
- 413 事故与修复：`reports/yufan-413-root-cause.md`（根因/阈值/两条件铁律/勘误）
- 契约新增 §7 读图规范、§7.1 双条件、§7.2 yufan-ds 约定