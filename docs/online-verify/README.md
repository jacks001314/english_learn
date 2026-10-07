# 线上实测记录：智能助教与页面融合（P0+P1）

- 线上实例：https://www.gbw3bao.com （nginx → systemd `english-learn` → `/opt/english-learn`，`:8081`）
- 部署版本：`20261004-193446`（部署前 `20261004-185827`）
- 部署方式：`scripts/deploy.ps1 -SkipAudioSync`（本地 sqlite/bolt 库不打包，线上 `english_learn.db` 原地保留并自动备份为 `backups/english_learn-20261004-193446.db`）
- 测试时间：2026-10-04 19:34–19:45 (CST)
- 测试账号：`autoquiz-live`（线上既有测试学生账号）

## 1. 部署一致性

本地与线上 10 个改动文件 SHA1 完全一致：

| 文件 | SHA1（本地 = 线上） |
| --- | --- |
| web/index.html | e2d533d2b3693c891ad2ead4726b4d919afb310f |
| web/agent.css | 11d64b12ea551fa6dc06c030fa194a4196c5b732 |
| web/js/main.js | 194d092b5dca4429c9e1d58822a89f925cb5a8ed |
| web/js/learningContext.js | 958f5e18aabe977d18682ee7d22d8c032ea1504e |
| web/js/components/AgentAssistant.js | 0e2398d8748d704975cca0aa8e4d725014ee99ce |
| web/js/components/DrillView.js | 8e81b1b867f6c20b6d6d5d662fc18b49d57228c9 |
| web/js/components/MeaningPracticeView.js | 34cbda65fcc2b738aea0b14f6e59d09b74d231f3 |
| web/js/components/QuizView.js | c073d00decab0a42c14b3fa7f76ab69594a7c648 |
| web/js/components/MistakesView.js | 94782aefec10bee54279fcb4134fe2f414684212 |
| web/js/components/ReadingView.js | 3f4f073a66f82a5705326b4dcabbccadf024ce46 |

服务状态：`systemctl is-active english-learn` = active；`GET /api/health` = `{"status":"ok"}`；教材音频 `GET /audio/7/unit1/vocab.mp3` = 200（381166 bytes）。

## 2. 线上 API 实测

| 用例 | 结果 |
| --- | --- |
| `POST /api/agent/chat` `quickAction=add-review`，context 只传 `wordId` | 200；message「已把「a cold」加入今日复习…」；`snapshot.current` 由服务端富化出 `phonetic=/ə kəuld/`、`meaning=感冒`（前端伪造/缺失的释义不生效） |
| `GET /api/review/today` | total 0 → 1，`nextReview=2026-10-04T19:38:43+08:00` |
| `POST /api/agent/chat` `quickAction=drill` | 200；真实模型调用 5.8s；`drill.source=agent`，3 道题（have a cold / had a cold / flu，均取自词库），选项含正确答案 |
| `POST /api/agent/chat` `quickAction=add-review`，`wordId` 不存在 | **HTTP 400**（不是 502），error「页面没有提供要加入复习的单词」 |
| `GET /api/agent/status` | `{"enabled":true,"engine":"codex-core","model":"deepseek-flash","providerId":"openai"}` |

## 3. 线上 UI 端到端（Chrome，经 SSH 隧道访问线上 8081）

| 场景 | 结果 |
| --- | --- |
| 看词选义答错 | 停留原题，反馈条出现「再巩固一下 / 正确答案是：X」+「不懂，讲讲」「出同类题」；错词进入错词卡 |
| 看词选义答对（开启自动下一题） | 400ms 出现「正在进入下一题…」，约 750ms 后自动跳到下一题（第 3 题 → 第 4 题，统计 已练 3 / 答对 2） |
| 打开 AI 助学 | 上下文卡显示「正在练习 · 词义练习 第 6 / 4614 题」、单词与音标、4 个选项（标记 正确 / 你的答案）、「你选了「树袋熊」，正确答案是「少量(的),一点」」、5 个快捷动作 |
| 点「出 3 道同类题」 | 真实模型生成归因说明 + 变式练习卡（3 题）+「开始练习这 3 道题」 |
| 进入变式练习 `#drill` | 「变式练习 · a bit / 助教针对你的错题生成」，3 题进度条；答对 750ms 自动跳题（已做 1/3 答对 1 → 第 2 题） |
| 做完 3 题 | 「100% 答对 3 / 3 题，全部答对！」+「再做一遍」「去错题本」 |
| 错题本「AI 归因」 | 上下文卡「错题本 · 归因分析」+ 词条；模型返回错因归类（词义不熟 / 搭配混淆）与 30 秒自测动作 |
| 阅读页「逐句解析」 | 上下文卡「正在阅读 / The Light in the Library / 第 1 段」，仅 1 个动作按钮；模型返回句子主干、语法点、生词点 |

### 截图证据

![阅读逐句解析](01-reading-parse.jpg)

![题目上下文卡 + 快捷动作 + 变式练习卡](02-question-context.jpg)

![变式练习答题页](03-drill-question.jpg)

![变式练习答对后提示自动进入下一题](04-drill-autonext.jpg)

## 4. 本次记录中的已知小问题（均已在第二轮修复）

1. 变式练习的干扰项由模型挑选，偶尔会出现语义相近的干扰项（例如把「感冒」与「感冒;伤风」同时作为选项），建议后续增加「干扰项互斥」校验。
2. 模型生成一道变式题约需 6–30 秒（deepseek-flash），前端目前只有「正在思考…」文案，无流式输出（P2）。
3. `agentMu` 仍为全局串行，多人同时提问会排队（P2）。

---

# 第二轮：流式输出、讲解记忆、主动轻提示（P1 收尾）

- 部署版本：`20261004-200612`（本轮迭代共部署 4 次：195113 / 195324 / 200250 / 200612，中间版本用于定位缺陷）
- 测试时间：2026-10-04 19:51–20:12 (CST)
- 测试账号：`autoquiz-live`（线上既有测试学生账号）

## 1. 本轮交付

| 交付 | 实现位置 |
| --- | --- |
| 流式输出（SSE） | `internal/learning/agent_stream.go`、`router.go` 的 `POST /api/agent/chat/stream`；前端 `AgentAssistant.streamChat()` |
| 并发放开 | `agent.go` 并发闸门（`MaxConcurrentRuns`，默认 2、上限 8），替换原全局 `agentMu` 串行 |
| 讲解记忆沉淀 | `internal/learning/tutor_memory.go`（`tutor_notes` 桶）；快照渲染「上次助教讲解（累计 N 次）」，并进入学习画像与计划理由 |
| 主动轻提示 | `learningContext.js` 的 `noteAnswer / noteReviewEntered / noteExamSubmitted` + `AgentAssistant` 的 `.agent-nudge` 卡片 |
| 变式题干扰项互斥 | `agent_context.go` 的 `addDistinct / drillOptionOverlap`，保证 4 个选项互不重叠 |

部署一致性（本地 = 线上，SHA1 逐字节一致）：

| 文件 | SHA1 |
| --- | --- |
| web/index.html | 17b6d444a1fc0e6bb9d6fe2f0bd4616eacc2001d |
| web/agent.css | d92dde06df1f269750caeab80a28c40488f5be2c |
| web/js/main.js | da1643b52547c7c4867c56db1dbdde057c3f81d6 |
| web/js/learningContext.js | 423455b21dcf58474f8e4c9602eee9d54e3360ac |
| web/js/components/AgentAssistant.js | 5bf26ab04e69007adac01b9dd1ed35032195ed0c |
| web/js/components/DrillView.js | 26743a1311d9b4ddcc45231d6f6f1ec8ffb4a8a7 |
| web/js/components/ExamView.js | 5c3a8478b2109ad4b50f29da3a91856093f8ac4f |
| web/js/components/MeaningPracticeView.js | b3fe596ecc6515b5ef4976f327dcfa198cceca53 |
| web/js/components/MistakesView.js | 1db37e478cd9020250b53b244b56aab4abe3fb78 |
| web/js/components/QuizView.js | c67e17ba554d839821a6072911ea03575b139b39 |
| web/js/components/ReadingView.js | 03af7864f618ef83c0e5a9315835ec8ec92ceea4 |

## 2. 线上 API 实测

| 用例 | 结果 |
| --- | --- |
| `POST /api/agent/chat/stream`（未登录） | HTTP 401 |
| `POST /api/agent/chat/stream`（已登录） | HTTP 200，`Content-Type: text/event-stream` |
| 帧统计（直连 `127.0.0.1:8081`） | `delta` 68 帧 + `done` 1 帧，`error` 0 帧 |
| 经 nginx（`Host: www.gbw3bao.com`，端口 80） | `delta` 45 帧 + `done` 1 帧；增量到达时间戳（1 / 空格 / 2 / 空格 / 3）各差约 30–40ms，`X-Accel-Buffering: no` 生效，未被代理缓冲 |
| 经公网 `http://www.gbw3bao.com/api/agent/chat/stream` | `delta` 96 帧 + `done` 1 帧 |

## 3. 线上 UI 端到端（Chrome）

| 场景 | 结果 |
| --- | --- |
| 助教回答流式渲染 | 用 `MutationObserver` 记录回答气泡文本长度：**35 次递增更新**，21 → 449 字符，中间状态逐块可见 |
| 连错 2 题轻提示 | 第 1 题答错不提示；第 2 题答错后右下角出现「连错两题了」卡片（「讲讲我错在哪」「去错题本」「知道了」），点「知道了」立即消失 |
| 连对 5 题轻提示 | 第 5 题答对后出现「连对五题，状态不错」（「出 3 道同类题」「看学习报告」「知道了」） |
| 同类提示冷却 | 冷却期内再次触发不重复出现（`noteAnswer` 返回 `null`） |
| 「出 3 道同类题」 | 200，3 道题，每题 4 个选项**互不重复**且包含正确答案；`focus` 引用了学生的实际混淆点，说明页面上下文已正确传到服务端 |

## 4. 本轮修掉三个真实缺陷

1. **流式接口只返回 `done`、没有任何增量**：codex-core 必须在构造客户端时设置 `Stream: true`，否则供应商适配器根本不请求 SSE，只在结束时回调最终结果。已抽出 `codexConfigOptions(root, cfg, stream)`，仅在 SSE 端点开启（JSON 端点保持非流式），并新增单测 `TestCodexConfigOptionsEnableStreamingOnlyWhenEmitting`。
2. **前端流式文字不逐块显示**：`send()` 把普通对象 push 进响应式数组后继续改这个局部变量，改的是原始对象，不触发 Vue 渲染（表现就是文字在结束时一次性出现）。改为通过 `this.messages[bubbleIndex]` 写入。
3. **学习上下文总线被拆成两个模块实例**：`main.js` 用 `?v=` 引入，各组件用裸路径引入，浏览器视为两个模块，导致「切页清理上下文」「交卷/复习后的提示」写进了另一份状态；裸路径还可能命中部署前的旧缓存。已把 8 处引用统一到同一版本 URL，并在 `learningContext.js` 用 `globalThis` 做真正的单例。

## 5. 截图证据

![连错两题的轻提示卡片](05-nudge-card.jpg)

![助教流式回答](06-agent-stream.jpg)


# 第三轮：练习来源筛选（错题 / 未掌握词 / 指定单元）

## 1. 本轮交付

- 后端 `QuizFilter` 新增 `Source` 字段；`internal/learning/quiz.go` 增加 `quizSourceAll/Mistakes/Unmastered`、`normalizeQuizSource()`、`filterWordsBySource()`、`sourceEmptyError()`。
  - `mistakes` = 当前用户有学习记录、答错过且尚未订正的词；
  - `unmastered` = 当前用户有学习记录且未标记掌握的词；
  - 没有学习记录的词两个来源都不算；未知取值等价于不过滤（老路径行为不变，老的单测原样通过）。
  - 来源筛空时返回 422 与 `not enough words：…` 提示，页面据此显示“放宽筛选条件”的建议。
- `GET /api/meaning-quiz` 支持 `source=mistakes|unmastered`（`internal/learning/meaning_quiz_controller.go`）；`FilteredQuiz`（单题）与 `FilteredQuizSet`（分页）两条路径都生效，且与 `level/grade/topic/unit/letter/pos` 叠加。
  - “指定单元”复用既有 `unit` 参数，无需新增实现。
- 前端 `web/js/components/MeaningPracticeView.js`：筛选工具栏最前面新增“练习来源”下拉（全部单词 / 我的错题 / 学过但没掌握）；`fetchSet` 带上 `source`，会话快照与恢复也带 `source`，点“清除筛选”会复位。
- 新增单元测试 `internal/learning/quiz_source_test.go`（3 个用例），页面资源版本号统一升到 `20261004-practice-source-r1`。

## 2. 线上 API 实测（浏览器内同源 fetch，真实登录态）

| 用例 | 结果 |
| --- | --- |
| `?level=all&page=1&size=12`（基线） | HTTP 200，`total=4614` |
| `+ source=mistakes` | HTTP 200，`total=2`，单词 = `a bit`、`a bit (of)` |
| `+ source=unmastered` | HTTP 200，`total=2`，单词 = `a bit`、`a bit (of)` |
| `+ source=mistakes&grade=七年级` | HTTP 200，`total=2`（叠加元数据筛选仍成立） |
| `+ source=bogus` | HTTP 200，`total=4614`（未知取值等价于不过滤） |
| `?level=primary&source=mistakes` | HTTP 422，`not enough words：错题本里暂时没有可练的单词`（提示正确；`level` 默认是 primary，错词都在 middle） |
| 对照 `GET /api/mistakes` | HTTP 200，2 条，单词 = `a bit`、`a bit (of)` —— 与 `source=mistakes` **集合完全一致** |

## 3. 线上 UI 端到端（Chrome，公网 http://www.gbw3bao.com）

| 场景 | 结果 |
| --- | --- |
| 下拉框与选项 | `select[aria-label="练习来源"]`，选项 = 全部单词 / 我的错题 / 学过但没掌握 |
| 选“我的错题” | 顶部计数由 `可练习 4614 / 4614 个单词` 变为 `可练习 3 / 4614 个单词`，当前范围显示“命中 3 个单词” |
| 出的题目 | 就是错题本里的词（`-sist-` → `a bit`） |
| **答对自动下一题** | 点对正确答案后**没有点“下一题 →”**，面板自动从“第 1 / 3 题”跳到“第 2 / 3 题”，页脚变为“已练 1 / 3 词 · 答对 1 题” |
| 选“学过但没掌握” | `可练习 2 / 4614`（比首次少 1：刚才答对的 `-sist-` 已记为掌握，说明筛选读的是实时学习记录） |
| 点“清除筛选” | 回到 `可练习 4614 / 4614`，下反复位为“全部单词” |
| 刷新页面 | 会话恢复：`source=mistakes`、`可练习 2 / 4614`、续答到“第 2 / 2 题”（`localStorage` 快照；必须已有作答记录才会恢复，这是既有设计） |

## 4. 截图证据

![练习来源筛选：我的错题](07-practice-source.jpg)

---

# 第五轮：学习日历与家长/教师只读报告（2026-10-04）

- 计划项：plan.md「P1：多用户与学习目标」第 47 项（学习日历）、第 48 项（家长/教师只读报告）
- 部署版本：`20261004-203942`（部署前 `20261004-193446`）
- 部署方式：`scripts/deploy.ps1 -SkipAudioSync`（线上 `english_learn.db` 原地保留，自动备份为 `backups/english_learn-20261004-203942.db`）
- 测试时间：2026-10-04 20:35–20:45 (CST)
- 测试账号：`e2e-report-mutt6tcy`（本次线上端到端新建的临时学生，待清理）

## 1. 部署一致性（公网拉取）

| 资源 | 结果 |
| --- | --- |
| `GET /api/health` | 200 `{"status":"ok"}` |
| `GET /learner-report.css?v=20261004-calendar-r1` | 200，包含 `.calendar-cell` 规则 |
| `GET /js/components/LearnerReportView.js` | 200，包含只读报告页代码 |
| `GET /js/components/ReportView.js` | 200，包含「学习日历」区块 |
| `GET /index.html` | 200，已引用 `learner-report.css` |
| 教材音频 `GET /audio/7/unit1/vocab.mp3` | 200（381166 bytes，部署脚本内置检查） |

## 2. 权限守卫（公网匿名/学生）

| 用例 | 结果 |
| --- | --- |
| `GET /api/admin/learners/{id}/report`（匿名） | **401** |
| `GET /api/learning/calendar`（匿名） | **401** |
| `GET /api/admin/learners/{self}/report`（学生会话） | **403** |
| `GET /api/admin/learners/{unknown}/report`（管理员，本地实测） | **404** |

## 3. 学生学习报告端到端（headless Chrome + CDP，公网 `http://www.gbw3bao.com`）

`node scripts/e2e-report-flow.mjs --base http://www.gbw3bao.com --shots docs/online-verify/e2e-report`

| 场景 | 结果 |
| --- | --- |
| 注册并登录学生、制造一题答对 + 一题答错 | 200 / 200，两条作答记录落库 |
| 打开 `#report`「我的学习报告」 | 出现 **42 格**学习日历，当天格子高亮为活跃 |
| 正确率 / 复习完成率 | 顶部指标显示 `50%`（对 1 · 错 1）与复习完成率占位（当天无到期复习显示 `--`） |
| 页面 JS 报错 | 0 |

结果：**6 项断言全部通过**，家长/教师页（需要管理员密码）在线上跳过。

## 4. 家长/教师只读报告（本地同构建实测，13/13）

`node scripts/e2e-report-flow.mjs --base http://127.0.0.1:8099 --require-admin`

| 场景 | 结果 |
| --- | --- |
| 选中目标学习者 | 下拉可选中（列表含全部账号并标注角色） |
| 指标 | 学过 2 词 · 已掌握 1 · 累计练习 2 · **正确率 50%** · 复习完成率 `--` · 连续学习 1 天 · 今日学习 2 词 / 练习 2 题 |
| 学习日历 | 42 格，按星期对齐，当天高亮 |
| 薄弱词表 | 列出答错的 `a cold`（0 对 / 1 错，下次复习 2026-10-05） |
| 接口口径 | `GET /api/admin/learners/{id}/report?days=42` → `correct=1 wrong=1 accuracy=50 days=42 weakest=1` |
| 页面 JS 报错 | 0 |

截图：`e2e-report/s3-student-report.png` 为公网实测（学生报告页）；`e2e-report/s6-guardian-report.png` 为本地同构建实测（家长/教师报告页，线上因缺少管理员密码而跳过）。

# 第六轮：运行配置、结构化日志、数据库备份与恢复（2026-10-04）

部署版本：`20261004-205155`（`scripts/deploy.ps1 -SkipAudioSync`，首次随包发布 `config.json` 与 `learnctl`）。

## 1. 本轮交付

| 能力 | 实现 | 线上验证方式 |
| --- | --- | --- |
| 运行配置 | `internal/learning/config.go`：默认值 → `config.json` → 环境变量 → 命令行参数；非法取值直接启动失败 | 服务器 `/opt/english-learn/config.json` 生效（`learnctl config` 回显 `logFormat=json`） |
| 结构化日志 | `internal/learning/logging.go`：`log/slog`，text/json 可选；Iris 框架日志与启动横幅统一转成同格式 | `journalctl -u english-learn -n 10` 每行都是 JSON |
| 在线备份 | `POST /api/admin/backup`（bbolt 只读事务快照）、`GET /api/admin/backups`（仅管理员） | 匿名/学生 401/403（公网实测 401）；正向流程由本地实例 + HTTP 集成测试覆盖 |
| 离线备份 / 校验 / 恢复 | `cmd/learnctl`（随部署包发布到 `/opt/english-learn/learnctl`），恢复前自动校验 + 旧库另存 `.pre-restore-*` + 原子替换 | 服务器上对最新备份 `verify` 通过；服务运行中 `backup` 明确报错退出 |

## 2. 公网/服务器实测

| 用例 | 结果 |
| --- | --- |
| `GET /api/health`（公网与 127.0.0.1:8081） | **200** `{"status":"ok"}` |
| `GET /`、`GET /js/main.js` | 200 / 200 |
| `GET /api/admin/backups`（公网匿名） | **401** |
| `GET /api/auth/me`（公网匿名） | **401** |
| `./learnctl verify --file backups/english_learn-20261004-205155.db` | `ok: ... is a consistent BoltDB file` |
| `./learnctl backup`（服务运行中） | `error: database file is locked by a running server; ...` 退出码 1 |
| `./learnctl backup --online --base http://127.0.0.1:8081 --username admin --password nope` | `error: login failed: HTTP 401`（在线通道打通） |

## 3. 本地同构建验证

- `go test ./... -count=1`：6 个包全过，新增 16 个用例（config / logging / backup / backup HTTP）。
- `scripts/ci.ps1 -E2EBase http://127.0.0.1:8098`：**10 步全过**。
- `node scripts/e2e-report-flow.mjs --base http://127.0.0.1:8098 --require-admin`：**13/13**（第五轮功能回归）。
- `learnctl backup / verify / list / restore --yes` 全链路本地实测通过（详见 `goal-evidence/round6-cli.txt`）。

> 生产管理员口令仍未知（线上 `POST /api/auth/login` 对默认口令返回 401），因此线上在线备份只验证了鉴权守卫；
> 待用户确认后可随时用 `learnctl backup --online` 做一次真实线上快照。

# 第七轮：小学高频词扩充 + 小学基础语法知识卡（2026-10-04）

部署版本：`20261004-210501`（`scripts/deploy.ps1 -SkipAudioSync`）。

## 1. 本轮交付

| 能力 | 实现 | 线上验证方式 |
| --- | --- | --- |
| 词库扩充（30 条小学高频缺口词） | `backend/enrichment/primary_grade6_words.json` + 新工具 `cmd/expandvocab` / `internal/vocabulary`（按 ID 与英文词形双重去重、字段不全整批拒绝、可重复执行） | 服务器 `backend/primary_school.json` = **1361** 条；启动日志 `words=1361`；登录态 `GET /api/words?q=...` 能查到新词 |
| 小学基础知识卡（15 张） | `web/js/grammar/primary.js` + `ia.js` 新增「小学基础」分组（导航首位）+ `GrammarView` 对 `kind: card` 只渲染速查/要点/易错/记忆卡 | 公网 headless Chrome 实测 17/17（分组、状态、四块渲染、隐藏讲义与练习、同名专题不串台） |
| 门禁覆盖 | `scripts/ci.ps1` 前端语法检查纳入 `web/js/grammar`（51 个文件），`-E2EBase` 增跑 `e2e-primary-grammar.mjs` 与 `e2e-grammar-entry.mjs` | 本地 `scripts/ci.ps1 -E2EBase` **12 步全过** |

## 2. 部署一致性（本地 SHA1 = 线上 SHA1）

| 文件 | SHA1（本地 = 线上） | 结果 |
| --- | --- | --- |
| web/index.html | `bfd527470704ad7b80548cdf32937d844dea12c3` | ✅ 一致 |
| web/js/main.js | `248e978eacd1b18062a516e87cb0f4f11b4ebaf7` | ✅ 一致 |
| web/js/grammar/primary.js | `282839a99bd6c92a9232bdecb92dd6f60433aad9` | ✅ 一致 |
| web/js/grammar/index.js | `37324f19be32302957257a6dd0a4b50cd83b6adf` | ✅ 一致 |
| web/js/grammar/ia.js | `4bdf642d4db7da63cf316cced7e59474c32d41ed` | ✅ 一致 |
| web/js/components/GrammarView.js | `77e8e983269f1b05d7412e03d379b93c30396ea4` | ✅ 一致 |
| web/js/components/SmartLearningView.js | `300c6d1de2118a24ddbfe53b09c2541e47f8acda` | ✅ 一致 |
| web/grammar.css | `38268a591741593ccce15ed310533df4f1d8c821` | ✅ 一致 |
| backend/primary_school.json | `7807b37b6ccc883c506346362cfcd5b345128a57` | ✅ 一致 |
| backend/enrichment/primary_grade6_words.json | `c77b5305e83c1de80f66234a17e221702f762471` | ✅ 一致 |
| scripts/ci.ps1 | `d5c0fffacd2fcfb84f75b65b02b662bc3cf264b5` | — (不在部署包内) |
| scripts/e2e-primary-grammar.mjs | `c81bd8a1db6fcf00e34371da8bd55b2bc66d1c32` | — (不在部署包内) |
| scripts/e2e-grammar-entry.mjs | `38b29bde28f105432ddf70b0eb61ea4dea600fb4` | — (不在部署包内) |
| plan.md | `5ba1393934e3c8effd38b871e51af9b50e785fb4` | — (不在部署包内) |
| README.md | `0bebff792255a3aa8d25ffe896b2e21a397ad20f` | ✅ 一致 |

不在部署包内的文件（`scripts/*`、`plan.md`）按仓库与服务器分工属正常：服务器只接收二进制、`web/`、`backend/`、`config.json`、`README.md`。

## 3. 公网实测

| 用例 | 结果 |
| --- | --- |
| `GET /api/health` | **200** `{"status":"ok"}` |
| `GET /index.html` | 200，含 `main.js?v=20261004-primary-grammar-r1` 与 `grammar.css?v=20261004-primary-grammar-r1` |
| `GET /js/grammar/primary.js` | 200，31583 字节，含全部知识卡 id |
| `GET /grammar.css` / `GET /js/components/GrammarView.js` | 200，含 `.gr2-item.st-card` / `isCardTopic` |
| `GET /api/admin/backups`、`GET /api/words`（公网匿名） | **401** |
| `GET /api/words?level=primary&q=by subway`（登录态） | 200，`total 1`，`乘地铁 / 六年级 / 交通` |
| `GET /api/words?level=primary&q=bought gifts`（登录态） | 200，`total 1`，`买礼物 / 六年级 / 购物` |
| `GET /api/words/science museum?level=primary`（登录态） | 200，含音标、词性、释义、主题、年级、单元与双语例句 |
| `journalctl -u english-learn`（21:05:31 重启） | JSON 行：`loaded word dataset dataset=primary words=1361` |
| `scripts/e2e-primary-grammar.mjs --base http://www.gbw3bao.com` | **17/17**，0 个 JS 异常（截图 `tmp/online-primary-grammar/`） |

> 说明：本轮为验证线上渲染，注册了临时学生账号 `verify-r7`（公网 `POST /api/auth/register`），
> 与既有测试账号一起列入待清理清单。

## 4. 本地同构建验证

- `go test ./... -count=1`：7 个包全过（新增 `internal/vocabulary` 7 例）。
- `scripts/ci.ps1 -E2EBase http://127.0.0.1:8099`：**12 步全过**。
- `node scripts/e2e-primary-grammar.mjs`：**17/17**；`e2e-practice-flow.mjs`：10/10；`e2e-report-flow.mjs --require-admin`：13/13；`e2e-grammar-entry.mjs`：7/7。
- 词库门禁：`cmd/wordcheck` 0 错误 / 54 警告（历史 `duplicate_word`，未新增）；`cmd/contentaudit` 缺音标 / 缺例句 / 分义缺例句全部为 0。

# 第八轮：词库去重 + 开启严格发布门禁（2026-10-04）

部署版本：`20261004-212330`（`scripts/deploy.ps1 -SkipAudioSync`）。

## 1. 本轮交付

| 能力 | 实现 | 线上验证方式 |
| --- | --- | --- |
| 消除 54 条重复词形 | 新增 dedup 批次 `backend/enrichment/{primary,middle}_dedup_retire.json`（`id` / `replacedBy` / `reason`，兼作复核清单）在同步末尾删除；`{primary,middle}_dedup_merges.json` 先把被删条目的释义并入保留条目 | 服务器 `backend/primary_school.json` = **1344**、`middle` = **2858**；抽样的 10 个被删 id 均 `404`；保留条目释义为合并结果（`on = 在……上面`、`take off = 脱下（衣、帽、鞋等）；（飞机等）起飞；匆忙离开`） |
| 同步管道可重复执行 | `internal/enrichment` 新增 `ApplyRetiring` / `ApplyRetirements` / `ReadRetirements`：已退休 id 的旧批次条目会被跳过，删除本身幂等 | 临时副本连跑两次 `cmd/synccontent`，两个数据集 **sha1 逐字节一致**；新增 `internal/wordcheck/dataset_test.go` 卡回归 |
| 严格发布门禁已开启 | `scripts/ci.ps1` 默认按 warning 级阻断（`go run ./cmd/wordcheck -fail-on=warning`，`-LooseWords` 可临时放宽），`.github/workflows/ci.yml` 走同一条命令 | 本地 `scripts/ci.ps1 -E2EBase http://127.0.0.1:8099` **12 步全过**，`cmd/wordcheck` **0 错误 / 0 警告** |

## 2. 部署一致性（本地 SHA1 = 线上 SHA1）

| 文件 | SHA1（本地 = 线上） | 结果 |
| --- | --- | --- |
| backend/primary_school.json | `11afe05882f4278dd2ef3e941e1ed84c3e5e57fb` | ✅ 一致 |
| backend/middle_school.json | `ec91e0a562b66be25122396dce43b1f33ba84dcd` | ✅ 一致 |
| backend/enrichment/primary_dedup_merges.json | `ab6307cd583d129ffd2aaded48b75ac38d6d9f26` | ✅ 一致 |
| backend/enrichment/primary_dedup_retire.json | `1146d5d882b855514eeb8503066fadb048c9cd53` | ✅ 一致 |
| backend/enrichment/middle_dedup_merges.json | `25799e39ac044c7824a212041ac9d76ff08cbb78` | ✅ 一致 |
| backend/enrichment/middle_dedup_retire.json | `caf63453279206acee62d48a582bc7051dd63e89` | ✅ 一致 |
| README.md | `33865d6a5aa572cc63089931641dda09c989dd7d` | ✅ 一致 |
| scripts/ci.ps1、plan.md、internal/**、cmd/**、reports/** | — | 不在部署包内（服务器只接收二进制、`web/`、`backend/`、`config.json`、`README.md`） |

## 3. 公网实测

| 用例 | 结果 |
| --- | --- |
| `GET /api/health` | **200** `{"status":"ok"}` |
| `GET /index.html` / `/js/main.js` / `/grammar.css` / `/js/components/GrammarView.js` | 200 |
| `GET /api/words`（公网匿名） | **401** |
| `GET /api/words/{work.、tried、subway：、prep.、no. problem}`（登录态） | **404**（重复条目已下线） |
| `GET /api/words?level=primary&q=subway`（登录态） | 200，`total 2` = `by subway` + `subway`（不含 `subway：`） |
| `GET /api/words/tomato`（登录态） | 200，词条 id 只有 `tomato`（不含 `tomoto`） |
| `GET /api/words/on?level=middle`（登录态） | 200，`meaning = 在……上面`（合并后） |
| `journalctl -u english-learn`（21:24 重启） | JSON 行：`loaded word dataset dataset=middle words=2858`（primary=1344） |
| `scripts/e2e-primary-grammar.mjs --base http://www.gbw3bao.com` | **17/17**，0 个 JS 异常（截图 `tmp/online-r8-primary-grammar/`） |
| `scripts/e2e-practice-flow.mjs --base http://www.gbw3bao.com` | **10/10**，含 S4「答对自动下一题（没点下一题按钮）」（截图 `tmp/online-r8-practice/`） |

> 说明：本轮为验证线上登录态，注册了临时学生账号 `verify-r8`；练习流程脚本自身注册的 `e2e-practice-*` 也计入待清理清单。

## 4. 本地同构建验证

- `go test ./... -count=1`：7 个包全过（新增 `internal/enrichment` 4 例去重/幂等用例、`internal/wordcheck` 1 例数据集回归用例）。
- `scripts/ci.ps1 -E2EBase http://127.0.0.1:8099`：**12 步全过**（词库已是 warning 级阻断）。
- `cmd/wordcheck`：**0 错误 / 0 警告**（primary 1344、middle 2858）；`cmd/contentaudit`：`missing_phonetic=0`、`missing_examples=0`、`senses_without_examples=0`。
- 对齐前后逐字段比对：除 `meaning` 外**无任何字段漂移**、**无新增条目**；被删条目均无 `senses`，保留条目音标与例句齐全。
- `e2e-report-flow.mjs --require-admin`：**13/13**（首次在复用测试库上出现过 S6 学习者可选项抖动，清库重跑即 13/13，属测试库累积状态，与词库改动无关）。

# 第九轮：消除包级可变数据库状态（Store 实例注入）（2026-10-04）

部署版本：`20261004-214555`（`scripts/deploy.ps1 -SkipAudioSync`）。

## 1. 本轮交付

| 能力 | 实现 | 验证方式 |
| --- | --- | --- |
| 包内不再有可变数据库状态 | 删除 `internal/learning` 的 `db` / `datasets` / `wordIndex` 三个包级变量；新增 `internal/learning/store.go`，由 `Store`（`db *bolt.DB` + `datasets` + `wordIndex` + `Close()` / `DB()`）持有 | 全包 grep：只剩 `Store` 结构体的字段定义与注释，没有其它裸引用 |
| 依赖注入链 | `run.go` 用 `openStore(cfg) (*Store, error)` 建唯一实例、`defer store.Close()`；`newAppWithConfig(cfg, store, logger)` → `NewController(store, ...)` / `NewService(store, ...)` / `RegisterRoutes(store, ...)`；`Controller` 与 `Service` 各持 `store *Store`，请求级 `scoped()` 复用同一实例 | 本地与线上服务启动、鉴权、练习、报告接口都走新路径（见下） |
| 机械重构范围 | **118 个自由函数改为 `*Store` 方法**；**64 个 `*Controller` 方法 + 21 个 `*Service` 方法**改为经 `c.store` / `s.store` 访问；共 47 个文件 +1213 / -1158 行 | `goal-evidence/round9-store-refactor.txt` 的逐文件 diffstat |
| 测试不再依赖包级状态 | 8 个测试文件删掉 `old := db; t.Cleanup(...)` 之类的全局替换，改为各自构造 `Store`：`openTestDB(t)` 提供临时库、用例内 `store := &Store{}`，`newHTTPEnv(t)` 直接把 `store` 暴露给用例 | `go test ./... -count=1` 7 包全过；`go test -race ./internal/learning -count=1` 通过 |
| 修掉 e2e 偶发抖动 | `scripts/e2e-report-flow.mjs` 在读取学习者下拉框前 `waitFor` 目标学生出现（此前选项异步加载未完成就取值，会偶发 `no-option`） | 同库连跑 3 次 **13/13**；A/B 对照证明该抖动与本次重构无关（重构前后各出现过一次同样的 `no-option`，也各出现过 13/13） |

## 2. 部署一致性

| 项 | 值 |
| --- | --- |
| 线上 `VERSION` | `20261004-214555` |
| 线上二进制 sha256 | `f4a45b9cf776ef393d9dcad01c92098453e37417c577a580f1a2d9b7524b3d80` |
| systemd 状态 | `active`，`ActiveEnterTimestamp = Sun 2026-10-04 21:46:26 CST` |
| 启动日志 | `loaded word dataset dataset=primary words=1344` / `dataset=middle words=2858` |
| 异常检查 | 今日日志无 panic / SIGSEGV / goroutine (唯一 `panic` 行是 9 月 5 日的旧记录) |

## 3. 公网实测

| 用例 | 结果 |
| --- | --- |
| `GET /api/health` | **200** `{"status":"ok"}` |
| `GET /index.html` | 200（`main.js?v=20261004-primary-grammar-r1`） |
| `GET /api/words`（公网匿名） | **401** `{"error":"请先登录"}` |
| `GET /api/words?level=primary&q=subway`（登录态） | 200，命中 `by subway`（`乘地铁`，含音标 / 词性 / 双语例句） |
| `GET /api/words/on?level=middle`（登录态） | 200，`meaning = 在……上面`（去重合并后的释义仍在） |
| `GET /api/meaning-quiz?level=primary&page=1&size=12`（登录态） | 200，`total 1538` / `pages 129`，分页练习正常 |
| `GET /api/admin/users`（学生态） | **403** `{"error":"需要管理员权限"}`（守卫有效） |
| `scripts/e2e-practice-flow.mjs --base http://www.gbw3bao.com` | **10/10**，含 S4「答对自动下一题（没点下一题按钮）」（截图 `tmp/online-r9-practice/`） |
| `scripts/e2e-primary-grammar.mjs --base http://www.gbw3bao.com` | **17/17**（截图 `tmp/online-r9-primary-grammar/`） |
| `scripts/e2e-grammar-entry.mjs --base http://www.gbw3bao.com` | **7/7**（截图 `tmp/online-r9-grammar/`） |

> 说明：本轮为验证线上登录态，注册了临时学生账号 `verify-r9-*`；两个 e2e 脚本自身注册的 `e2e-practice-*` 也计入待清理清单。

## 4. 本地同构建验证

- `gofmt -l internal cmd` 为空；`go build ./...`、`go vet ./...` 通过。
- `go test ./... -count=1`：**7 个包全过**；`go test -race ./internal/learning -count=1`：**通过**（59.5s）。
- `scripts/ci.ps1 -E2EBase http://127.0.0.1:8099`：**12 步全过**（含词库 warning 级阻断、51 个前端文件语法检查）。
- `e2e-practice-flow.mjs`：10/10；`e2e-primary-grammar.mjs`：17/17；`e2e-grammar-entry.mjs`：7/7；`e2e-report-flow.mjs --require-admin`：13/13（连跑 3 次稳定）。
# 第十轮：智能助教「浮动面板 + 教学卡片」全计划上线（2026-10-07）

## 1. 本轮交付

把智能助教这一整条改造（浮动形态、全程 JSON 教学卡片、状态胶囊、已读回执、就地讲解、
长回答折叠、缓存版本串守门）**首次真正部署到公网** `http://www.gbw3bao.com` 并在公网上做严格验收。
之前 20 多节的「线上」都是本机真栈（真 Go + 真 deepseek-flash + 真 Chrome，base=127.0.0.1）；
本轮起，公网站点也跑的是本轮的代码。

## 2. 部署

```
powershell -NoProfile -File ./scripts/deploy.ps1 -SkipAudioSync
```

- **部署版本**：`20261007-002149`（与远端 `VERSION` 一致）
- **部署方式**：`scripts/deploy.ps1`（plink/pscp），远端 DB 先备份、发布包留档（保留 5 份）、`systemctl restart english-learn`
- **部署后自检**：`audio http 200, 381166 bytes`；`/api/health = {"status":"ok"}`
- **打包完整性审计（只读）**：本地目录 vs 发布 tar.gz 成员清单 —— `web/ 249=249`、`backend/ 98=98`、`chuzhong/ 89=89`，逐文件 MATCH（用 Python `tarfile`；Windows `tar` 的 UTF-16 输出是显示假象）

## 3. 部署一致性（本地 SHA1 = 线上 SHA1）

`scripts/online-live-agent-acceptance.mjs` 的 L1：公网抓取 21 个助教相关文件（`index.html`、`agent.css`、
`main.js`、`learningContext.js`、`agentSpeech.js`、`components/*` 等）与本地 Master 计算 SHA1 对比。

| | 部署前 | 部署后 |
| --- | --- | --- |
| L1 部署一致性 | **19/21 不一致** | **21/21 全部一致** |

部署状态只读探针 `scripts/check-prod-deploy-state.mjs`：部署前 **一致 3 / 漂移 4** → 部署后 **一致 7 / 漂移 0**（exit=0）。

## 4. 公网实测（部署前 / 部署后）

同一套 15 条公网断言（真站点、真 deepseek-flash、真 Chrome headless + CDP）：

| 断言 | 部署前 | 部署后 |
| --- | --- | --- |
| L3 浮动形态 | `static / 410 / right:0` FAIL | `fixed / 420 / right:18 / agent-float` PASS |
| L4 面板让位 | `body.agent-open=false` FAIL | PASS |
| L6 状态胶囊 | 空串 FAIL | `词义练习 · 第 1 题` PASS |
| L7 教学卡片 | `cards:0` FAIL | `cards:1 / words:27 / chips:5` PASS |
| L8 可点读 | `agent-word=0` FAIL | `agent-word=27` PASS |
| L10 回执 chips | `chips:0` FAIL | `chips:5` PASS |
| L11 阅读浮条 | `{}` FAIL | `选中="Every" 按钮=[朗读/讲解/入册]` PASS |
| **合计** | **6 通过 / 8 失败** | **15 通过 / 0 失败** |

整条质量门禁打到线上：

| 命令 | 结果 |
| --- | --- |
| `node scripts/online-live-agent-acceptance.mjs` | 15 通过 / 0 失败（exit=0） |
| `powershell -NoProfile -File ./scripts/ci.ps1 -E2EBase http://www.gbw3bao.com` | 14 步通过 / 0 步失败 |
| `go build ./... / go vet ./... / go test ./... -count=1` | 0 / 0 / 0 |

> 本轮为线上验收注册了临时账号 `accept-*`；脚本自身注册的 `probe-*` / `statusprobe-*` 等效一次性账号也一并计入待清理清单（与 `docs/deploy.md` §3.6 原做法一致）。

## 5. 截图证据

- `docs/images/agent-live-acceptance-panel.png` —— 公网浮动面板 + 教学卡片（胶囊「词义练习 · 第 1 题」、生词可点读）
- `docs/images/agent-live-acceptance-reading.png` —— 公网阅读页选词浮条（朗读 / 讲解 / 入册）

## 6. 本轮新增工具

- `scripts/online-live-agent-acceptance.mjs`（新建）：不碰服务端，直接打公网，15 条断言，退出码 0/1。
- `scripts/check-prod-deploy-state.mjs`（修）：修正「在错误的文件里找标记」的缺陷，现 `一致 7 / 漂移 0`。

## 7. 补记：同一轮内的第二次上线 —— 场景胶囊「场景 · 定位」

第一版上线后，面板胶囊对非词条页只显示场景名（如 `同步训练`）。同一轮内又做了一版前端改动并重新上线：

- **改动**：`AgentAssistant.js` 新增 `sceneScope()` / `progressSource()`，题号统一成「第 N / M 题」；
  版本串 bump 到 `20261007-agent-capsule-scope-r1`。
- **部署**：`Deployed version: 20261007-003128`（同 `deploy.ps1 -SkipAudioSync`）。
- **公网验收**：`node scripts/online-live-agent-acceptance.mjs` → **16 通过 / 0 失败**（新增 L13 非词条页胶囊）。
- **公网实测胶囊**：`词义练习 · 第 1 / 4590 题`、`同步训练 · Homework 1: Get ready`、
  `语法专题 · be 动词（am / is / are）`、`课程学习 · 七年级 · 上册 · Starter · Welcome to junior high!`、
  `单词测验 · 第 1 / 10 题`。
- **说明**：`exams` / `homework` / `mistakes` 页在新账号下无历史数据、页面不发布上下文，胶囊显示空态——既有约定，非缺陷（有数据的账号会显示 `考试讲解 · <卷名> · 第 N 题`）。
## 8. 验收脚本扩容：L13 场景胶囊 / L14 停靠形态（仅脚本与报告，无需重新部署）

站点代码未变（仍是 `20261007-003128`），本轮只把公网验收脚本做强：

- **L13 非词条页场景胶囊**：进 `#tongbu` / `#grammar` / `#course` / `#quiz` 读状态胶囊，断言包含对应场景名。
  实测：`同步训练 · Homework 1: Get ready`、`语法专题 · be 动词（am / is / are）`、
  `课程学习 · 七年级 · 上册 · Starter · Welcome to junior high!`、`单词测验 · 第 1 / 10 题`。
- **L14 / L14b 停靠形态**：点面板头部「停靠」→ 断言 `body.agent-dock`、栏宽 440、页面真的让位
  （实测 `mainRight=964 ≤ panelLeft=984`）；再点「浮动」→ 断言页面恢复。
- 同时修掉 **L6 的竞态**：新账号首次进词义页要异步拉约 4590 条题目，原先会在上下文发布前读胶囊、读到空态；
  现在先等 `scene=meaning` 的上下文发布再读，并把 L6 断言从「非空」升级成「含场景名 + 含『第 N / M 题』」。

- **L15 定位题目**（公网）：点胶囊上的「定位题目」→ 当前 `.meaning-card` 拿到 `.is-agent-focus` + 内联
  `box-shadow: rgba(247, 181, 0, 0.85) 0 0 0 3px` 且 `inViewport=true`（2 秒后自动撤）。
- **L16 助教已读回执展开**（公网）：点回执头 → `aria-expanded=false→true`，露出 `.agent-receipt-text` 快照原文
  （实测片段「【学生档案】…【当前题目】-sist- … 选项：…」）。

**复跑**：`node scripts/online-live-agent-acceptance.mjs` → **20 通过 / 0 失败**（exit=0）。

# 第十一轮：把计划里最后两条（主动轻提示 / 归因 reason）搬上公网验收（2026-10-07）

## 1. 本轮交付

只改**验收脚本 + 文档 + 报告**，**站点代码未变**（线上仍 `20261007-003128`），所以**没有重新部署**。

- `scripts/online-live-agent-acceptance.mjs`：新增 `L17` / `L17b`（主动轻提示）与 `L18`（归因 reason）。
- `docs/images/agent-live-acceptance-nudge.png`：轻提示的线上截图（新增）。

## 2. 新增断言

- **L17 连错两题触发主动轻提示**：先 `about:blank` 清页（清掉连击/冷却），再进 `#meaning-en-zh`，
  循环「点选项 → 读 `.meaning-feedback.is-wrong` → 找 `.agent-nudge` → 点下一题」，最多 14 轮。
  实测：`.agent-nudge` 是 `ASIDE` / `role=status` / `position=fixed` / `right=22` / `bottom=82`，
  文案「连错两题了停下来一分钟，让助教把这两个词的差别讲清楚，再继续练。」，主动作「讲讲我错在哪」。
- **L17b**：页面无 `[role="dialog"] / dialog[open]` —— 不弹窗、不打断作答。
- **L18 归因结论写入 `KnowledgeMastery.reason`**：用同一个真账号 `fetch('/api/learning/profile?level=middle|primary')`，
  断言 `strongest` / `weakest` 里有非空 `reason`。实测 **8 条**，示例 `middle/a 分 8 → 仍有 1 次错误未完成巩固`、
  `middle/100-metre race 分 85 → 练习证据较少，需要继续确认掌握程度`。

## 3. 公网实测

`node scripts/online-live-agent-acceptance.mjs`（`http://www.gbw3bao.com`）→ **23 通过 / 0 失败，exit=0**
（报告：`docs/verify-reports/report-live-agent-acceptance.json`）。部署一致性 `L1` 仍 21/21 全一致，全程 0 条 JS 报错。

## 4. 本地同构建验证

- `node --check scripts/online-live-agent-acceptance.mjs` → exit=0。
- 本轮未改 `web/**`、`internal/**`、`backend/**`，故未重跑 `go build/vet/test`、契约守门与 `ci.ps1`（第十轮结果仍适用）。

## 5. 追加：L19 小屏抽屉 / L20 长问题不撑爆面板（同轮第二次复跑，2026-10-07）

同轮内又补两条公网断言（仍只改脚本 + 文档 + 报告，站点代码未变）：

- **L19 / L19b 小屏全屏抽屉**：`Emulation.setDeviceMetricsOverride(1024×768)` → 断言面板 `fixed / inset 0 / 1024×768 / z-index 70`、
  拖拽条 `display:none`、主内容列 775px、无横向溢出；还原视口后断言回到 420px 浮动。
  截图 `docs/images/agent-live-acceptance-drawer-1024.png`。
- **L20 长问题不撑爆面板**：发一个「要求写 1000 字」的问题 → 断言回答仍以卡片返回、面板无横向溢出、
  消息列可滚动、输入区仍在视口内。截图 `docs/images/agent-live-acceptance-long-answer.png`。
  附本轮实测结论：面板对自由提问也带 `format:'card'`（`CARD_ACTIONS` 含空串），模型一律回卡片，
  故「Markdown 回落 → 折叠」是兜底路径、线上不可确定性触发；其节点级验证仍见 `docs/agent-ux-verification.md` §20。

**复跑**：`node scripts/online-live-agent-acceptance.mjs` → **26 通过 / 0 失败**（exit=0）。

## 6. 本轮小结（第十一轮）

- 站点未变（线上仍 `20261007-003128`），本轮把公网验收脚本从 23 条扩到 26 条并复跑全绿。
- 顺带修正一处**证据标注**：`docs/verify-reports/report-ui-live-*.json` 的 `server=127.0.0.1:8100` 属本机真栈，
  此前把它当「线上」引用不准确；现已用公网 L19 覆盖 P2-5（小屏抽屉）。

## 7. 追加：L21 页内就地回答卡 / L22 流式可停止（同轮第三次复跑，2026-10-07）

同轮再补两条 P0/P2 的公网断言（站点代码未变）：

- **L21 页内就地回答卡**：答题 → 点「不懂，讲讲」→ 断言 `.agent-inline-teach` 里渲染出教学卡片
  （30 个 `.agent-word`）、位于选项区之后（`belowOptions=true`）、骨架屏已撤、无 JSON 泄漏。
  截图 `docs/images/agent-live-acceptance-inline-teach.png`。
- **L22 流式可中途停止**：发长问题 → 断言 `.agent-streambar` 里的「停止生成」可见 → 点它 →
  断言流式条消失、界面提示「已停止生成，这次没有内容。」。截图 `docs/images/agent-live-acceptance-stream-stop.png`。

**复跑**：`node scripts/online-live-agent-acceptance.mjs` → **28 通过 / 0 失败**（exit=0）。

附同轮发现的**证据口径**问题：`scripts/online-agent-ui-e2e.mjs` 会自起本地服务端
（`const BASE = "http://127.0.0.1:" + PORT`），所以它产出的 `report-ui-live.json` 与全部 `U*` 断言都是**本机真栈**，
不是公网；`docs/agent-ux-verification.md` §19 里凡引 `U*` 的行，公网证据以本轮新增的 L1–L22 为准。

# 第十二轮：公网验收补 4 条断言 + 修掉线上抓到的「漏 card 时铺原始 JSON」并重新部署（2026-10-07）

## 1. 本轮交付

- 验收脚本 `scripts/online-live-agent-acceptance.mjs` 新增 4 条**公网**断言：
  - **L11b** 阅读页选词浮条「入册」→ 加入今日复习并弹出提示；
  - **L11c** 阅读页选词浮条「讲解」→ 该段落**下方**就地展开讲解卡（左侧正文区，不是右下角面板）；
  - **L23** 浮动面板左缘**拖拽调宽**：变宽夹在 560、变窄夹在 360，并落盘 `localStorage['lingoBloomAgentPanelWidth']`；
  - **L24** 故障注入：服务端「只给 `message` 不给 `card`」时，页面必须给中文兜底提示，**不许**把原始 JSON 当正文。
- 前端修一个真缺陷：`web/js/learningContext.js` 的 `askInline` 增加「像卡片 JSON 的文本不当纯文本回落」闸门（详见 §5）。
- 因该文件字节变化，按引用图级联 bump 缓存版本串：**13 个引用文件 + `web/index.html`，共 24 处 `?v=` → `20261007-agent-leakfix-r1`**，
  `node scripts/check-agent-asset-version.mjs` exit=0（`--update` 刷新 `docs/agent-asset-versions.json`）。

## 2. 部署

```
powershell -NoProfile -File ./scripts/deploy.ps1 -SkipAudioSync
==> 部署版本 20261007-012501
{"status":"ok"}
audio http 200, 381166 bytes
```

部署前核对本地镜像与线上文件数一致，确认「整树替换」不会删掉线上文件：
线上 `web=249 / web/audio=117 / web/audio/7 mp3=54 / chuzhong=89 / backend=98`，本地逐项相同。

## 3. 部署一致性（本地 SHA1 = 线上 SHA1）

L1：**21/21 全部一致**（含本轮改过的 `web/index.html`、`web/js/main.js`、`web/js/learningContext.js` 与 12 个视图）。

## 4. 公网实测

`node scripts/online-live-agent-acceptance.mjs` → **32 通过 / 0 失败 / 32 条断言，exit=0**。

新增 4 条的原文 JSON：

- L11b：`{"clicked":true,"toast":"已把「every」加入今日复习，打开「今日复习」就能看到它。"}`
- L11c：`{"hasSection":true,"hasCard":true,"words":25,"headline":"Every 不能单独作成分，要和后面的单数名词一起看","belowParagraph":true,"jsonLeak":false,"secViewport":[362,580,591,852],"secDoc":[362,783,591,852],"cardDoc":[362,865,591,770],"pageScrollY":203,"innerH":865,"bodyScrollTop":0,"picked":"Every","clicked":true}`
- L23：`{"before":420,"handleDisplay":"block","wide":560,"narrow":360,"min":360,"persisted":"360"}`
- L24：`{"hasError":true,"errorText":"助教这次没把讲解整理好，请点「重试」。","hasCard":false,"sentinelOnPage":false,"rawJsonOnPage":false,"reAsked":true}`

L23 走真实输入通路：先用探针确认 CDP 的 `Input.dispatchMouseEvent` 确实生成 pointer 事件
（`pointerdown=3 / pointermove=18 / pointerup=3`），再按 `mousePressed → 6×mouseMoved → mouseReleased` 拖 `.agent-resize`。

## 5. 本轮修掉的真缺陷：漏 card 时把原始 JSON 铺给学生

第一次复跑时 **L21 失败**（`jsonLeak:true`）。量化：对公网 `/api/agent/chat` 连发 14 次 `explain-wrong` →
**13 次带 card / 1 次不带**；14 次的 `message` 一律是模型原始 JSON 文本，所以漏 card 的那次学生就会看到 `{"headline":...}`。
根因是模型偶尔漏必填字段、服务端结构化解析不过，只回原文 `message`；前端「纯文本回落」把它当正文铺开了。

修法：`askInline` 里若 `!card && 文本像卡片 JSON`，返回 `{card:null, message:'', error:'助教这次没把讲解整理好，请点「重试」。'}`，
meaning / quiz / reading 三处就地讲解一次性覆盖。L24 用故障注入确定性地验证了这条兜底（截图 `agent-live-acceptance-json-fallback.png`）。
**服务端「漏 card」未修**（属 `internal/**`，本轮不动）：学生不会再看到 JSON，但那次讲解是缺的，只有重试入口。

## 6. 截图证据

`agent-live-acceptance-reading-review.png`（L11b）、`agent-live-acceptance-reading-inline.png`（L11c）、
`agent-live-acceptance-resize-360.png`（L23）、`agent-live-acceptance-json-fallback.png`（L24）；
同批还刷新了 panel / reading / nudge / drawer-1024 / long-answer / inline-teach / stream-stop 7 张。

## 7. 诚实标注

- L11c 的**整页**截图只能拍到卡片的一段：阅读正文自身是滚动容器（`redesign.css:375 .reading-paper{overflow-y:auto}`，
  实测 `clientHeight` 653），本轮卡片实测高 770–852px，比容器还高。断言与 `secDoc/cardDoc` 数值才是完整证据。
- 曾试 `captureBeyondViewport + clip` 单独拍卡片本体，但卡片在内层滚动容器里、clip 的文档坐标算不准（拍到空白），已放弃并删除该临时图。
- 本轮**改了 `web/**` 并重新部署**；上一轮「不改站点代码」的约束只适用于上一轮。

# 第十三轮：修复后公网复跑 + 交付面核查（不改站点代码，2026-10-07）

## 1. 本轮做了什么

- 站点代码零改动（`web/**`、`internal/**` 与线上 `20261007-012501` 同版本），本轮只做**复跑取证 + 交付面核查**。
- 重跑 `node scripts/online-live-agent-acceptance.mjs`（公网 `http://www.gbw3bao.com`）。

## 2. 公网实测结果

```
==> 公网助教验收 · http://www.gbw3bao.com
--- A. 部署一致性 ---
  [PASS] L0 线上可达 — HTTP 200 / 3239 字节
  [PASS] L0 /api/health — HTTP 200
  [PASS] L1 部署一致性（本地 SHA1 = 线上 SHA1） — 21/21 全部一致
--- B. 真站 UI 断言（headless Chrome + CDP）---
  ... L2 – L24 全 PASS ...
==> 公网验收：32 通过 / 0 失败
```

- **32 通过 / 0 失败 / 32 条断言，exit=0**。
- 报告 `docs/verify-reports/report-live-agent-acceptance.json` 刷新到
  `startedAt=2026-10-06T17:29:16Z / finishedAt=2026-10-06T17:30:20Z`。
- 第十一轮偶发失败的 **L21**（页内就地回答卡）本轮 **PASS**；**L24**（漏 card 兜底）仍 **PASS**；
  **L12** 全程 0 条 JS 报错。11 张公网截图随本轮重跑刷新。

## 3. 交付面核查（本轮新增，回答「改过的文件是否都回写了 Master」）

- `node delivcheck.cjs` → `checked files in delivery scopes = 415`，`UNREGISTERED = 0`
  （范围：`scripts` / `docs` / `web/js` / `internal` / `backend` + `web/` 根静态资源；全部已在 Master 登记）。
- 守门三连（本轮复跑）：`node --check scripts/online-live-agent-acceptance.mjs` = 0；
  `scripts/check-agent-asset-version.mjs` = 0（扫 104 个源文件 / 56 个 `?v=` 资源）；
  `scripts/check-agent-context-contract.mjs` = 0（43 字段 / 10 处调用 / 覆盖 43）。

## 4. 本轮回写 Master 的文件

无站点代码；回写的是刷新后的报告 JSON、11 张公网截图，以及本文件与 `docs/agent-ux-verification.md` §28.7。

## 5. 诚实标注

- 卡片正文由真模型逐次生成，同一断言的 `headline` 文案逐轮不同（本轮 L11c 与上一轮措辞不同），
  属模型非确定性；断言只校验结构（有卡片 / 无 JSON 泄漏 / 位置正确）。
- 本轮**没有**做全站回归（验收覆盖 meaning / quiz / reading / tongbu / grammar / course / drill 等主路径），
  也未重新部署（站点未变，无需部署）。

# 第十四轮：新增「公网全站回归」门禁，并修掉它抓到的真缺陷（空数据时「我的学习报告」整页崩）（2026-10-07）

## 1. 本轮补的是哪块空白

第十二 / 十三轮之后，线上断言全部落在**助教链路**上，`README.md` 第十三轮 §5 与
`docs/agent-ux-verification.md` §28.6 都标注过同一条余量：**「整树部署后其它页面有没有回归」没验过**。
本轮补上这块，并把它变成可复跑的门禁。

## 2. 新工具与结果

- 新脚本：`scripts/online-live-site-regression.mjs`（A 静态资源完整性 / B 21 个学习者路由渲染 / C 8 个管理端路由优雅回落）。
- 首跑 **33 通过 / 2 失败**，抓到真缺陷（见 §3）。
- 修好并**重新部署**（`20261007-013823`）后复跑：

```
==> 全站回归：36 通过 / 0 失败     exit=0
（R report 由 FAIL 转 PASS：marker:true / visible:242 / errs:0；S6 全程 0 条 JS 报错）
==> 公网助教验收：32 通过 / 0 失败   exit=0（L1 部署一致性 21/21）
```

报告：`docs/verify-reports/report-live-site-regression.json`、`docs/verify-reports/report-live-agent-acceptance.json`。

## 3. 抓到的真缺陷：空数据时「我的学习报告」整页崩

- 现象：新注册账号打 `#report` → `TypeError: Cannot read properties of null (reading 'length')`，视图整块不渲染。
- 线上数据侧确认：`GET /api/dashboard` 对空数据账号返回 `recent: []` 但 **`weakest: null`**。
- 根因：`internal/learning/service.go` 的 `filtered := weak[:0]`（`weak` 在无错词时是 nil）→ Go 序列化成 `null`。
- 修法：① 根因改成 `make([]LearningItem, 0, len(weak))`（回 `[]`）；② `ReportView.js` 用 `Array.isArray(...) ? ... : []`
  兜底（以后服务端再回 null 也不崩）。
- 回归测试：新增 `internal/learning/dashboard_http_test.go`；把修复临时改回去 → 测试 **FAIL**，改回 → **PASS**（先红后绿）。
- 缓存失效：`ReportView.js` 原本没有 `?v=`，已在 `main.js` 的 import 上加 `?v=20261007-reportview-nullfix-r1`，
  并 bump `web/index.html` 的 `main.js` 版本串；`check-agent-asset-version.mjs --update` 后守门 exit=0。

## 4. 本地验证

`go build ./...` = 0；`go vet ./...` = 0；`go test ./... -count=1` = 0（全包 ok）。

## 5. 诚实标注

- 该缺陷**不是助教改造引入的**（`ReportView.js` / `service.go` 都不在改造改动集里），是**早就在线上**的问题；
  它到现在才暴露，正是因为此前所有公网断言只覆盖助教链路。
- 本轮仍**没有**做「全站回归 + 助教验收之外」的其它验证（例如移动端真机、并发压测）；公网断言只覆盖
  「路由能渲染 / 无 JS 报错 / 无横向溢出 / 关键 marker 存在」这一层。

# 第十五轮：把「上一轮改了却没回写 Master」这件事查出来并收口（2026-10-07）

## 1. 起因

第十四轮的助教验收是 32 条；上一轮（第二十轮）给脚本加了 `L25`/`L26`，验证「同步训练 / 变式练习」两页
状态胶囊里的题号与「错过 M 次」。上一轮复跑时 `L26` 报 `ERR ev(...).trim is not a function`，
被当成「脚本小笔误」记下，但**没查到底**。本轮把它查到底，顺带发现一件更要紧的事。

## 2. 两个发现

### 2.1 上一轮的页面改动没进 Master（真问题）

`project_read` 直读 Master 对账，Master 上：

- `web/js/components/DrillView.js` = 11465 B，`publishContext` 里没有 `wrongTimes`（本地/线上 = 11518 B，有）；
- `web/js/components/TongbuView.js` = 25813 B（本地/线上 = 26745 B，含 `currentQuestionNo`）；
- `web/js/main.js` = 44720 B，Tongbu / Drill 的 import 仍是 `?v=20261007-agent-leakfix-r1`（本地 = 44726 B / `?v=20261007-capsule-progress-r1`）；
- `web/index.html` = 3244 B，`main.js?v=20261007-reportview-nullfix-r1`（本地 = 3242 B / `?v=20261007-capsule-progress-r1`）。

原因是上一轮**从本地工作副本部署**，没做回写。后果不是「线上坏了」，而是「仓库会回退」：
谁从 Master 部署一次，`tongbu` 的题号与 `drill` 的「错过 M 次」就没了。本轮已用 `project_file_sync` 按本地字节回写 4 个文件，
守门（`check-agent-asset-version.mjs` 57 个资源 / `check-agent-context-contract.mjs` 43 字段）均 exit=0。

### 2.2 `L26` 失败是探针自己的 fixture 不合法（不是产品缺陷）

旧探针拿 `context.level` 造变式题——但词义页发布的 `level` 是**筛选范围**（`all`），不是那道题的真实学段；
`/api/quiz/answer` 按 `(level, wordId)` **精确**查词，于是 400 `word not found`，前端抛错、`wrongTimes` 恒 0。
修法：先让页面自己真答一题，从它发出的请求体里取一对真实可判分的 `(level, wordId)`（实测 `middle` / `sist= stand,`），再用它造题。
（`/api/agent/chat` 这条链路对 level 有 `all` 兜底，所以讲解、入册、场景识别都不受影响——只有判分接口要求精确 level。）

## 3. 公网实测结果

```
==> 公网助教验收 · http://www.gbw3bao.com
  [PASS] L1 部署一致性（本地 SHA1 = 线上 SHA1） — 21/21 全部一致
  [PASS] L25 同步训练胶囊含「第 N / M 题」 — {"capsule":"同步训练 · Homework 1: Get ready · 第 1 / 47 题","matched":true}
  [PASS] L26 变式练习胶囊含「第 N 题 · 你在该词错过 M 次」 — {"realPair":{"level":"middle","wordId":"sist= stand,","type":"en-zh"},"answeredReal":true,"injected":true,"answered":true,"capsule":"变式练习 · 第 1 / 1 题 · 你在该词错过 1 次"}
==> 公网验收：34 通过 / 0 失败        exit=0

==> 公网全站回归 · http://www.gbw3bao.com
==> 全站回归：36 通过 / 0 失败        exit=0
```

报告：`docs/verify-reports/report-live-agent-acceptance.json`（22477 B）、`docs/verify-reports/report-live-site-regression.json`（25161 B）。

## 4. 诚实标注

- 本轮**产品侧零改动**（`web/js/**`、`internal/**` 都没动）；改的是验收脚本 + 回写 + 文档。
- `L11c`（阅读浮条讲解）偶发失败是**真模型**非确定性（本轮 PASS），不是前端回归；确定性兜底由 `L24` 断言。
- 仍未验证的层次照旧：移动端真机、并发压测、可访问性审计都不在公网断言覆盖内。

# 第十六轮：把「空断言」审计推到公网门禁上，并重跑两条公网套件（2026-10-07）

## 1. 起因

第十五轮已证明**验收台**（`scripts/agent-ux-verify.mjs`）里存在「量不到也 PASS」的空断言（见 `docs/agent-ux-verification.md` §31）。
本轮把同一类审计推向两条**公网**套件（站点 `www.gbw3bao.com`）。

## 2. 审计结果

| 套件 | 结论 |
| --- | --- |
| `scripts/online-live-site-regression.mjs` | **健康**：每条路由断言 = `rendered && errs === 0 && marker === true && visible > 3`，不存在「元素没渲染也通过」的形态 |
| `scripts/online-live-agent-acceptance.mjs` | **找到 2 条**「缺失型」空断言，已修 |

| id | 原风险 | 修法 |
| --- | --- | --- |
| `L9 没有 JSON 泄漏到界面` | 助教一条都没回答时 `jsonLeak` 天然 `false`，「无泄漏」是废话 | 加前提 `answered === true && (cards > 0 || text.length > 0)`；detail 带 `answered=/cards=/text=` |
| `L17b 轻提示不阻断作答（无 blocking dialog）` | 轻提示根本没出现时「没有弹窗」是废话 | 加前提 `!!nudgeProbe`；detail 带 `nudgeShown=` |

另把 **3 处** `jsonLeak` 探针从只找 `"headline"` 扩到卡片主键 `["headline","verdict","points","kind"]`（否则只漏出半截 JSON 抓不到）。

## 3. 顺手修掉一个真 flake：面板打开竞态

复跑时出现过一次 `[FAIL] L99 流程异常 — 等待超时：面板打开(L20)`。
根因：`AgentAssistant.js` 的 `mounted()` 要先 `await /api/agent/status` 才决定自己出不出现，而原脚本是「fab 单次点击 + 单次等待」。
修法：新增可重试辅助 `openPanel()`（先判 `.agent-panel` 已开 → 再判 `.agent-fab` 存在且非 `display:none` → 再点 → 400ms 重试），替换 **6 处**调用点。

## 4. 公网实测结果（本轮新跑）

```
==> 公网助教验收 · http://www.gbw3bao.com
  [PASS] L0 线上可达 — HTTP 200 / 3242 字节
  [PASS] L1 部署一致性（本地 SHA1 = 线上 SHA1） — 21/21 全部一致
  [PASS] L3 面板为浮动形态（fixed / ≈420px / 贴右缘） — {"cls":"agent-assistant agent-float","floatClass":true,"position":"fixed","width":420,"right":18,"bodyOpen":true}
  [PASS] L5 浮动面板零遮挡（且真的量到了元素） — .meaning-options:0/9 .meaning-prompt:0/9 .meaning-heading:0/9 total=0/27
  [PASS] L6 状态胶囊显示场景/进度 — 胶囊文案="词义练习 · 第 1 / 4590 题"
  [PASS] L9 没有 JSON 泄漏到界面 — answered=true cards=1 text=56 jsonLeak=false
  [PASS] L17b 轻提示不阻断作答（无 blocking dialog） — nudgeShown=true dialogFree=true
  [PASS] L22 流式回答可中途停止（公网） — stopClicked=true stoppedHint=已停止生成，这次没有内容。
  [PASS] L23 浮动面板左缘拖拽调宽：变宽夹在 560、变窄夹在 360（公网） — {"before":420,"wide":560,"narrow":360,"min":360,"persisted":"360"}
==> 公网验收：34 通过 / 0 失败        exit=0

==> 公网全站回归 · http://www.gbw3bao.com
  [PASS] S1 线上可达 + 应用外壳 — HTTP 200 / 3242 字节
  [PASS] S3 index.html 引用的本地 CSS/JS 全部可用 — 27/27 全部 200 且非空
  [PASS] R×22（首页/词义×3/课程/语法/音标/阅读/考试/同步训练/测验/复习/作业/报告/错题本/设置/账号安全/变式练习 …） — 全部 rendered=true / errs=0 / marker=true
  [PASS] S6 全站回归全程 0 条 JS 报错 — 0 条
==> 全站回归：36 通过 / 0 失败        exit=0
```

报告：`docs/verify-reports/report-live-agent-acceptance.json`（21847 B，`passed:34 / failed:0`）、
`docs/verify-reports/report-live-site-regression.json`（25167 B，36/0）。
截图：`docs/images/agent-live-acceptance-*.png`（11 张）、`docs/images/site-regression-*.png`（3 张），均已回写 Master。

## 5. 诚实标注

- 两条空断言是**审计发现**的，改前也是绿的，所以**不宣称先红后绿**；可复现证据是修后 detail 里出现了 `answered= / cards= / nudgeShown=` 这些**前提字段**（改前没有）。
- `openPanel` 修好后已**连续两次**独立跑都是 34/0（上一轮 1 次 + 本轮 1 次），本轮未复现任何 flake。
- 本轮**产品侧零改动**（`web/js/**`、`internal/**` 都没动），只改验收脚本 + 证据副本 + 文档；部署一致性 `L1` 仍为 21/21。
- 仍未覆盖的层次照旧：移动端真机、并发压测、可访问性审计。

# 第十七轮：公网覆盖补到「手机宽度」，并修掉 L26 的「两段式胶囊」竞态（2026-10-07）

## 1. 新覆盖：390×844 手机宽度

`L19`（1024px）之外，公网此前**没有真手机宽度的证据**；而 `web/agent.css:151-153` 的抽屉规则是
`@media(max-width:1100px)`，390px 还会命中更早那条低优先级 `@media(max-width:620px){.agent-panel{right:12px;bottom:68px}}`。
新增 `L19c`（390×844，`mobile:true`：全屏抽屉 geometry + 无横向滚动 + 拖拽把手隐藏）与
`L19d`（抽屉内输入区在视口内、textarea 可聚焦、发送按钮有可访问名）。

实测：`{"innerWidth":390,"innerHeight":844,"position":"fixed","left":0,"top":0,"width":390,"height":844,"bottomGap":0,"zIndex":"70","resizeDisplay":"none","panelHScroll":0,"pageHScroll":0,"footTop":773,"footBottom":844,"footInViewport":true,"textareaFocusable":true,"sendLabel":"发送"}`

## 2. L26 的真 flake：drill 胶囊是「两段式」发布

加完新断言首次全量复跑 `35 通过 / 1 失败`，L26 读到的是上一场景的胶囊（`词义练习 · 第 2 / 4590 题`）。
一次性探针（每 250ms 采样 `store.context.scene` + 胶囊文案）给出根因：

- `DrillView` **不是挂载时** publishContext —— drill 卡渲染后连续 13s，`scene` 仍是 `meaning`；
- 点完选项、判分回来后 `scene` 才变 `drill`，且**先给「变式练习 · 第 1 / 1 题」，再过一拍才补「· 你在该词错过 M 次」**。

修法：`sleep(2600)+读一次` → **等条件**（≤25s、300ms 轮询），且等的是**被断言的完整文案**；
第一版只等 `scene === 'drill'` 会 `waitMs=1` 就 break（仍失败），改成等完整正则后一次通过（`waitMs=316`）。
断言未放松，只是不再赌固定时长。

## 3. 本轮公网结果

```
==> 公网助教验收 · http://www.gbw3bao.com
  [PASS] L19c 手机宽度（390×844）面板变全屏抽屉（公网） — 390×844 / z-index 70 / panelHScroll 0
  [PASS] L19d 手机抽屉里输入区仍在视口内且可聚焦（公网） — footInViewport=true focusable=true sendLabel="发送"
  [PASS] L26 变式练习胶囊含「第 N 题 · 你在该词错过 M 次」 — capsule="变式练习 · 第 1 / 1 题 · 你在该词错过 1 次" waitMs=316
==> 公网验收：36 通过 / 0 失败        exit=0

==> 全站回归：36 通过 / 0 失败        exit=0
```

## 4. 诚实标注

- `L19c/L19d` 在修 L26 之前就已经是绿的 —— 本条是**新覆盖**，不是新修复。
- 探针脚本是临时目录里的一次性脚本，已删除；可复现证据是 L26 detail 的 `scene`/`waitMs` 与三轮实跑记录。
- 本轮**产品侧零改动**（`web/**`、`internal/**` 未动），只改验收脚本与证据副本；`L1` 部署一致性仍 21/21。