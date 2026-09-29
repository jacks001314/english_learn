# yufan 讲义按需加载（懒加载）改造报告

- 执行者：syntropy（主控，agent-759db7e9d9d51c42aa267b3f）/ Windows 节点
- 时间：2026-09-27
- 触发：用户反馈「讲义 JS 约 873KB 全量加载太大，改按需加载」
- 版本号：`20260927-yufan-r2`（原 r1）

## 1. 问题定位（先量化再动手）

25 个讲义模块 + `index.js` = 871,897 B（≈872 KB）经静态 `import` 全部进入首屏。
按字段统计 JSON 内容占比：

| 字段 | 占比 |
| --- | ---: |
| sections（讲义正文） | **79.9%** |
| extras（对既有专题的增量） | 11.1% |
| points / forms / pitfalls / notes / intro / summary / examTips / memoryCard / contrasts | 合计 ≈7.7% |
| topicId / title / category / difficulty / sourceDirs / imagesRead | 1.3% |

⇒ 只把 sections 挪出首屏即可拿到约 5× 收益，且**不影响搜索与侧栏**（两者依赖 points/forms/extras）。

## 2. 方案：元数据前置 + sections 按需

| 层 | 文件 | 何时加载 |
| --- | --- | --- |
| 元数据 | `web/js/grammar/yufan/manifest.js`（**脚本生成**） | 首屏 |
| 聚合入口 | `web/js/grammar/yufan/index.js`（手写，含 `loadLecture`） | 首屏 |
| 讲义正文 | `web/js/grammar/yufan/<slug>.js`（作者交付物，含 sections） | 选中该专题时 `import()` |

- `manifest.js` 由 `scripts/build-yufan-lectures.mjs` 生成：逐模块剥离 `sections` 并记 `sectionCount`，导出 `YUFAN_EAGER_V` / `YUFAN_MODULES` / `YUFAN_ITEMS`。
- `index.js` 用与改造前**完全相同**的聚合逻辑（`keyOf`/`mergeArray`/`attachYufan` 未改），只把 `sections` 换成 `sectionsTotal`，并新增 `loadLecture(topicId)`（带并发去重 + 失败清缓存以便重试）。
- 多文件专题（`g-adj-adv` = adjectives + adverbs）按模块名序依次加载并拼接，顺序与改造前一致。

## 3. 改动清单

| 文件 | 改动 |
| --- | --- |
| `web/js/grammar/yufan/manifest.js` | **新增**（脚本生成，145,612 B） |
| `web/js/grammar/yufan/index.js` | 重写：元数据聚合 + `loadLecture` / `isLectureLoaded` / `hasLecture` / `lectureFiles` |
| `web/js/grammar/index.js` | 透出 `loadLecture` / `isLectureLoaded`；`?v=` → r2 |
| `web/js/components/GrammarView.js` | 选中/深链/聚焦时按需加载；加载中与失败（含重试）占位；悬停 160ms 预取；`beforeUnmount` 清定时器；`?v=` → r2 |
| `web/grammar.css` | 新增 `.gd-lecture-loading` / `.gd-lecture-error` / `.gd-lecture-retry` |
| `scripts/build-yufan-lectures.mjs` | 第 4 节改为生成 manifest.js + 版本号一致性校验 + 首屏体积核算；`manifest.js` 加入 `RESERVED`；报告增加首屏/全量体积两行 |
| `web/js/grammar/yufan/README.md` | 新增 §8「前端集成与按需加载」 |
| `scripts/english-learn.nginx.conf` | 新增 gzip 文本压缩（见 §6 风险 3） |
| `web/index.html`、`web/js/main.js`、`web/js/components/SmartLearningView.js` | `?v=` → r2 |

**25 个讲义数据文件（`<slug>.js`）一字未改。**

## 4. 体积实测

| 项 | 改造前 | 改造后 |
| --- | ---: | ---: |
| 首屏加载的讲义 JS | 871,897 B（865,364 + index 6,533） | **153,944 B**（manifest 145,612 + index 8,332） |
| 压缩比 | — | **5.66×**（−82.3%） |
| 单个专题 chunk | 首屏已含全部 | 20,674～54,931 B，选中时才拉 |

`node scripts/build-yufan-lectures.mjs` 报告行：
`- 首屏讲义元数据：153944 B（manifest.js 145612 B + index.js）；全量讲义数据：865364 B；首屏/全量 5.62×`

## 5. headless Chrome 端到端实测（真实挂载 GrammarView，非仅数据层）

探针：`web/__probe-yufan.html`（临时，跑完已删）+ 本地静态服务（跑完已停）。
用 `performance.getEntriesByType('resource')` **断言网络请求**，用 DOM 断言渲染结果。

| 场景 | 挂载同步帧 | 加载后 | 切换后 | JS 错误 |
| --- | --- | --- | --- | ---: |
| 深链 `?t=g-verbs-overview` | heading=true, **sections=0**, loading=true, **chunks=[]** | 动词概说 8 节 / 11 表 / 30 例句，chunks=[verbs-overview.js] | — | 0 |
| 同上 → `g-nouns` | 同上 | 同上 | 名词与主谓一致 11 节 / 22 例句，chunks=[verbs-overview.js, nouns.js] | 0 |
| `?t=g-adj-adv` → `g-overview` | 同上 | 形容词与副词 15 节 / 13 表 / 179 例句，chunks=[adjectives.js, adverbs.js] | 总论 13 节 / 29 例句 | 0 |

**关键断言**：挂载瞬间 `.gd-lec-section = 0`、模块 chunk 请求数为 **0**，且讲义标题与来源目录已可见（元数据前置生效）；选中专题后才请求该专题的 chunk。

**渲染无回归**：与改造前同一探针的数值逐项一致 ——
`g-verbs-overview` 8/11/30、`g-nouns` 11 节/9 表/22 例句、`g-overview` 13/7/29、`g-sentence-structure` 8/16/121、`g-agreement` 8/1/106。

**失败路径（注入 404）**：让服务器对 `verbs-overview.js` 返回 404 → 页面显示
「讲义正文加载失败（Failed to fetch dynamically imported module: …/verbs-overview.js?v=20260927-yufan-r2）。**重试**」，
loading 占位消失、无未捕获异常 → 符合「失败必须可见、不得静默降级」。

## 6. 一致性、幂等与风险

1. **数据等价**：`loadLecture(id)` 的结果与「直接 import 每个模块再自行拼接」**逐字节一致 24/24**（JSON.stringify 比对）。
2. **计数不变**：`grammarTopics=29`、`sortedTopics=29`、`grammarExercises=137`、`lectureByTopic=24`、
   `yufanStats={topics:24,newTopics:9,imagesRead:417,sections:210,files:25}` —— 与改造前完全相同。
3. **构建幂等**：连跑两次，`manifest.js` sha256[0:16]=`0323895dc2eb35e8`、`index.js`=`1807ff0197e75609` 均不变；
   `--check` 退出码 0（error 0 / warning 0）。
4. **风险 1（低）**：首次选中某专题需等一次网络请求（本地 <50ms，外网取决于 RTT）。缓解：加载占位 + 悬停 160ms 预取 + 失败重试。
5. **风险 2（低）**：`manifest.js` 仍含 142 KB 元数据（extras 50 KB、points 13.7 KB 等）。
   进一步压缩会让「搜索命中原有专题的 yufan 增量要点」失效，属功能取舍，**本次未做**，需要时可再评估。
6. **风险 3（需知悉）**：已在 `scripts/english-learn.nginx.conf` 增加 gzip（`text/javascript`/`application/json` 等），
   预计把 142 KB 的 manifest 压到约 30 KB；但**本地没有 nginx 可跑 `nginx -t`**，且只有在
   执行 `scripts/deploy.ps1 -InstallNginxProxy` 重新安装代理配置后才生效。未做此改动前，服务端不压缩。
7. **配套修复**：`web/index.html` 里 `grammar.css` 的缓存版本号上一轮还是旧值（`20260918-grammar-r7`），
   本轮一并提升到 r2，避免讲义样式命中旧缓存。

## 7. 复现命令

```
node scripts/build-yufan-lectures.mjs          # 校验 + 重建 manifest.js（幂等）
node scripts/build-yufan-lectures.mjs --check   # 只校验，退出码 0 = 讲义与 manifest 同步
node -e "import('./web/js/grammar/index.js').then(m=>console.log(m.grammarTopics.length, m.yufanStats, Object.keys(m.lectureByTopic).length))"
```
