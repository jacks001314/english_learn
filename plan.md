# 英语学习乐园后续开发计划

## 项目现状

项目已形成“词汇浏览 → 练习 → 进度记录 → 错题/报告”的基础闭环，Go/Iris/BoltDB 后端与 Vue 3 前端均可运行，现有测试和 `go vet` 通过。当前主要短板是复习入口缺失、学习内容维度较少、数据质量缺乏自动检查，以及单用户数据模型尚不适合真实家庭或班级使用。

## 开发原则

- 优先完成可持续学习闭环，再扩充内容形态。
- 学习记录按“用户 + 学段 + 词汇”隔离，避免数据串联。
- 所有复习算法、统计口径和数据迁移都配套测试。
- 儿童界面保持少步骤、强反馈、移动端可用和无障碍友好。
- 内容采用资源库设计：词库、读音库、例句库、文章库独立存储，通过稳定 ID 关联。

## 里程碑

### P0：补齐复习闭环（本轮已开始）

- [x] 增加“今日复习”页面，展示到期词汇。
- [x] 支持按小学/初中学段筛选到期复习。
- [x] 复习时记录“记得/忘了”，并自动生成下一次复习时间。
- [x] 为到期判断和学段隔离增加后端测试。
- [x] 增加复习完成进度和当日复习目标。
- [x] 将简单固定间隔升级为按连续答对次数递增的间隔重复算法。
- [x] 增加连续学习天数和可配置的每日目标。

验收标准：用户可以从首页进入今日复习，完成到期词汇后列表即时更新，错题与统计同步变化。

### P1：数据质量与学习内容

- [x] 编写词库校验工具，检查重复 ID/词形、空释义、异常音标、乱码和字段污染。
- [x] 输出可重复生成的词库质量报告和人工复核清单。
- [x] 支持 CI 按错误或警告级别阻断质量检查。
- [x] 为词汇模型增加例句、例句翻译、主题、年级和教材单元字段。
- [x] 增加按年级、主题、教材单元筛选。
- [x] 增加独立分类词库页面，支持按年级、首字母和词性浏览。
- [x] 补齐词性分类：扩展冠词、数词、感叹词、助动词、情态动词、缩略词等类别，并为全部词条补充词性标注。
- [x] 扩充完整国家名称词汇，并归入“国家”主题。
- [x] 建立可重复运行的词汇教学内容合并工具。
- [x] 为首批小学高频核心词补充双语例句和教学标签。
- [x] 补充第二批小学高频词的音标、双语例句和教学标签。
- [x] 继续扩充高频核心词，并增加基础语法知识卡。（**词库**：新增 30 条小学高频缺口词（六年级交通 / 职业 / 爱好 / 过去式短语、五年级比较级与文具等），数据在 `backend/enrichment/primary_grade6_words.json`，由新工具 `cmd/expandvocab` + `internal/vocabulary` 幂等合并——按 ID 与英文词形双重去重、字段不全整批拒绝、格式与既有词库逐字节一致（Go `json.MarshalIndent`+`\u0026` 转义）；primary 1331 → 1361 条（后经去重为 1344 条，见「启用严格发布门禁」条），重复执行第二次 `added 0`，`cmd/contentaudit` 缺音标 / 缺例句 / 分义缺例句全部为 0；单测 `internal/vocabulary/expand_test.go` 7 例。**语法**：新增小学基础知识卡 `web/js/grammar/primary.js`（15 张：be 动词、人称/物主代词、单复数、冠词、指示代词、一般现在时、现在进行时、There be、can、一般过去时初步、比较级初步、方位介词、疑问词、祈使句、名词所有格），`ia.js` 新增「小学基础」分组并排在导航首位；`GrammarView` 对 `kind: card` 只渲染速查 / 用法要点 / 易错 / 记忆卡，隐藏讲义精讲、专项练习、题目来源与 TOC「专项练习」项，指标区改为要点/例句/易错/记忆卡；标题映射改为「非知识卡优先」，`#grammar/现在进行时`、`#grammar/g-there-be` 仍指向初中专题，同名不串台。`scripts/check-grammar-ia.mjs` 46 专题 / 6 分组 / 课程语法名未命中 0；端到端 `scripts/e2e-primary-grammar.mjs` 17 项全过，`scripts/e2e-grammar-entry.mjs` 7/7 无回归；`scripts/ci.ps1 -E2EBase` 12 步全过（前端语法检查已覆盖 `web/js/grammar`）。）

### P1：多用户与学习目标

- [x] 增加学生档案，学习进度键升级为“用户 + 学段 + 词汇”。（`users` 桶保存账号/角色，`scopedKey(userID,key)` 把学习记录写成 `u1|primary:apple`，`readProgress` 按 `userID|` 前缀过滤，跨用户不会串数据；测试见 `internal/learning/auth_test.go` 的 `TestLearningDataIsIsolatedByUser` 与 `http_integration_test.go` 的跨用户用例。）
- [x] 增加每日目标、连续学习天数和学习日历。（每日目标由 `readDailyReviewGoal` 与学习设置页维护，连续天数由 `learningStreak` 统计；学习日历由 `internal/learning/learner_report.go` 的 `buildLearningCalendar` 生成：合并 progress 的最近学习/复习日期与 `learning_events` 的逐日作答量，`GET /api/dashboard` 内嵌、`GET /api/learning/calendar?days=42` 单独取用，格子按星期对齐；单测 `TestLearningCalendarMergesProgressAndEvents`，端到端 `scripts/e2e-report-flow.mjs` S3。）
- [x] 提供家长/教师只读报告：学习量、正确率、薄弱词和复习完成率。（`GET /api/admin/learners/{id}/report?days=42&level=`（管理员守卫，学生访问为 403）+ 前端「学习报告」页 `web/js/components/LearnerReportView.js`：学过/已掌握词数、累计练习、正确率、按错题优先级排序的薄弱词表、复习完成率（今日已复习 ÷（已复习 + 仍到期））与内嵌学习日历，整页只读；单测 `learner_report_test.go`、接口测试 `learner_report_http_test.go`，端到端 `scripts/e2e-report-flow.mjs` S4/S6。）
- [x] 设计旧数据到默认学生档案的迁移方案。（`migrateLegacyProgress` 在 `openStore` 时把没有学段前缀的历史进度键补成 `学段:词` 并保留原值，重复执行幂等；测试 `TestMigrateLegacyProgress`。）

### P2：练习体系升级

- [x] 增加中译英选择题，并保留英译中模式。
- [x] 增加听音选词和拼写填空。
- [x] 增加例句完形。
- [x] 支持按错题、未掌握词、指定单元生成练习。（`GET /api/meaning-quiz?source=mistakes|unmastered` 已在词义练习生效，与年级、主题、单元、词性筛选可叠加；「指定单元」复用既有 `unit` 参数，无需新增实现。单元测试见 `internal/learning/quiz_source_test.go`，线上实测见 `docs/online-verify/README.md` 第三轮。）
- [x] 记录题型维度表现，为多题型掌握度统计打基础。
- [x] 增加词义专项练习页（看词选义 / 看义选词 / 听音选义），支持全部/小学/初中范围与年级、主题、词性筛选。
- [x] 词义练习改为分页覆盖筛选命中的全部单词（默认每页 12 题，支持翻页/跳页、字母正序/倒序/随机排序），不再随机抽十题。
- [x] 增加分页练习的后端测试（全量覆盖、翻页不重不漏、页码/页长越界收敛、随机种子稳定、空命中报错），并保留练完后的结算页与针对性复习建议。
- [x] 词义练习与单词测验答对后自动进入下一题（页末自动翻页），答错停留原题；开关默认开启并可本地记忆。

### P1：智能助教与页面结合（本轮已开始）

- [x] 前端学习上下文总线：练习页上报页面/题目 ID/作答状态与进度，切页自动清理旧上下文
- [x] 服务端把页面上下文富化为学习快照（词库释义、正确答案、历史答对答错、掌握度、近期错题），并做长度预算
- [x] 场景化教学提示词：管理员系统提示词定义人设，词义练习/测验/错题归因/阅读/考试各场景追加内置教学要求
- [x] 词义练习与单词测验反馈条增加“不懂，讲讲 / 出同类题”入口，页内提问会先取消自动跳题
- [x] 错题本每条错题增加“AI 归因”，阅读页每段增加“逐句解析”
- [x] 助教返回结构化动作：`actions`（加入今日复习）+ `drill`（变式练习题）
- [x] “加入今日复习”为确定性动作，不依赖模型：单词到期时间置为当前，立即出现在今日复习且不计为已完成
- [x] 变式练习页：按错题生成同类题，题目/选项/答案全部取自词库，判分复用 `/api/quiz/answer`，答对自动下一题
- [x] 模型不可用时自动退回词库同类词出题，功能不中断
- [x] 后端单元测试覆盖快照可信度（篡改前端上下文无效）、提示词内容、入队复习、变式题选项与答案一致性、错误码
- [x] 流式输出与并发放开：当前模型调用仍是全局串行 + 一次性返回，多学生同时提问需要排队
- [x] 讲解记忆沉淀：把归因结论写入学习画像（`LearningEvent` / `KnowledgeMastery.reason`）并供智能学习计划消费
- [x] 主动触发：连错 2 次、连对 5 题、进入复习与交卷后的轻提示（右下角轻提示卡片，5 分钟冷却、12 秒自动消失，不弹窗、不打断作答）

验收标准：学生在“看词选义”答错后点“不懂，讲讲”，助教回答必须引用本题选项、自己的错误答案和该词的历史错误次数；
点“出同类题”生成的题目可以直接在变式练习页作答，答案与词库一致；点“加入今日复习”后该词立刻出现在今日复习队列。

### P2：工程质量与交付

- [x] 增加 HTTP 接口集成测试和前端核心流程测试。（另有 `internal/learning/learner_report_http_test.go` 覆盖学习日历与家长报告接口及权限守卫，`scripts/e2e-report-flow.mjs` 跑「学习报告 → 403 守卫 → 家长/教师只读报告」13 项断言。接口集成测试 `internal/learning/http_integration_test.go`：真实 Iris 路由 + 临时 BoltDB + 登录 Cookie，覆盖注册/登录/会话、管理员守卫、练习来源筛选与跨用户隔离、判分写记录、错题订正、词库分页与详情；前端核心流程端到端 `scripts/e2e-practice-flow.mjs`：headless Chrome + CDP，跑「来源下拉 → 我的错题 → 答对自动下一题 → 订正清空」共 10 项断言。）
- [x] 消除包级可变数据库状态，改为 Repository 实例注入，提升并发安全与可测试性。（**已完成**：`internal/learning` 的 `db` / `datasets` / `wordIndex` 三个包级变量已删除，改为新增的 `internal/learning/store.go` 里的 `Store` 实例持有；`run.go` 用 `openStore(cfg) (*Store, error)` 建唯一实例、`defer store.Close()` 收尾，`newAppWithConfig(cfg, store, logger)` → `NewController(store, ...)` / `NewService(store, ...)` / `RegisterRoutes(store, ...)` 逐层注入，`Controller` 与 `Service` 各持 `store *Store`，请求级 `scoped()` 复用同一个实例；词库读取（`wordsByLevel` / `wordsForScope` / `findWord` / `wordIndex`）、Bolt 读写（`readProgress` / `saveDailyReviewGoal` / `upsertArticles` …）、内容工厂后台队列（`startFactoryRunner` / `processFactoryTask`）全部从 `*Store` 出发，包内只剩结构体字段定义与注释（`grep` 已核对）。规模：**118 个自由函数改为 `*Store` 方法**，**64 个 `*Controller` 方法 + 21 个 `*Service` 方法**改为经 `c.store` / `s.store` 访问，共 47 个文件（+1213 / -1158 行，含 20 个测试文件，diffstat 见 `goal-evidence/round9-store-refactor.txt`）；测试侧不再靠包级变量注入，改为各自构造 `Store`（`openTestDB` 返回的临时库 + 用例内 `store := &Store{}` / `newHTTPEnv` 暴露 `store`）。验证：`gofmt -l internal cmd` 为空、`go build ./...`、`go vet ./...` 通过；`go test ./... -count=1` **7 包全过**；`go test -race ./internal/learning -count=1` **通过**（59.5s，重构前无法在并行测试下安全共享该状态）；`scripts/ci.ps1 -E2EBase http://127.0.0.1:8099` **12 步全过**；`e2e-practice-flow` **10/10**（含 S4 答对自动下一题）；`e2e-report-flow --require-admin` **13/13 连跑 3 次稳定**（顺带修掉了 S6 学习者下拉框异步加载导致的 `no-option` 偶发抖动）；A/B 对照证明该抖动与本次重构无关。
- [x] 增加配置文件、结构化日志、数据库备份与恢复。（`internal/learning/config.go`：内置默认值 → `config.json` → 环境变量 → 命令行参数四级覆盖 + 取值校验；`logging.go`：`log/slog` 结构化日志（text/json、级别可配），Iris 框架日志与启动横幅统一转成同格式，`ENGLISH_LEARN_LOG_FORMAT=json` 时每行都是可解析 JSON；`backup.go` + `cmd/learnctl` + `backup_controller.go`：在线一致性快照（bbolt `Tx.WriteTo`，`POST /api/admin/backup` / `GET /api/admin/backups`，仅管理员）、离线备份/校验/恢复（旧库另存 `.pre-restore-*` 后原子替换，库被占用时明确报错而不写半截数据）；`config.json` 与 `config.example.json` 随 `deploy.ps1` 发布，`docs/deploy.md` 新增第 6/7 节；测试 `config_test.go` / `backup_test.go` / `backup_http_test.go` / `logging_test.go`。）
- [x] 增加 CI：格式检查、测试、静态检查、词库校验。（`scripts/ci.ps1` 一条命令跑 gofmt / go vet / go test / `cmd/wordcheck` 词库校验 / `cmd/contentaudit` 完整性审计 / 51 个前端文件语法检查（含 `web/js/grammar`）/ 3 个 node 自检，`-E2EBase` 可加练习、小学知识卡、语法入口三个端到端脚本，`cmd/wordcheck` 默认按 warning 级阻断（`-LooseWords` 可放宽到 error）、`-StrictGrammar` 可把语法重复体检收紧成硬门禁；另有 `.github/workflows/ci.yml` 供推送到 GitHub 后直接生效。）
- [x] 补充部署说明和版本升级/回滚步骤。（`docs/deploy.md`：拓扑、参数表、部署六步、部署后验收清单、升级方式、数据库/代码两条回滚路径；`deploy.ps1` 新增 `releases/` 发布包归档（保留最近 5 个），使代码回滚真正可执行。）
- [x] 增加 Windows 编译、安装、启动和卸载脚本，升级时保留学习数据。
- [x] 建立内容资源数据库设计和版本化 BoltDB 分桶。
- [x] 将现有 JSON 词条、音标和例句幂等导入独立内容库。
- [x] 增加音标、读音来源和“每个释义至少一个例句”的完整性审计。
- [x] 补齐所有词条的缺失音标和分义例句后，启用严格发布门禁；朗读使用浏览器语音合成。（**门禁已开启**：`cmd/contentaudit` 两个词库 `missing_phonetic=0`、`missing_examples=0`、`senses_without_examples=0`；`cmd/wordcheck` **0 错误 / 0 警告**；`scripts/ci.ps1` 现在默认按 warning 级阻断（`go run ./cmd/wordcheck -fail-on=warning`，`-LooseWords` 可临时放宽），`.github/workflows/ci.yml` 走同一条命令。**去重**：54 条 `duplicate_word` 全部是真实词形重复（17 primary + 37 middle，多为 `subway：` / `tomoto` / `work.` 这类被教材页眉或音标污染的 id），新增 dedup 批次 `backend/enrichment/{primary,middle}_dedup_retire.json` 在同步末尾按 `replacedBy` / `reason` 删除重复条目，`{primary,middle}_dedup_merges.json`（primary 9 条、middle 24 条）先把被删条目的释义并入保留条目；对齐前后逐字段比对：**除 `meaning` 外无任何字段漂移、无新增条目**，被删条目均无 `senses`，保留条目音标与例句齐全。`internal/enrichment` 新增 `ApplyRetiring` / `ApplyRetirements` / `ReadRetirements`，让 `cmd/synccontent` 在去重后仍可重复执行——连跑两次数据集逐字节一致。词库：primary 1361 → 1344、middle 2895 → 2858。朗读已用浏览器语音合成。）
- [x] 生成按优先级排序的缺音标、缺例句、缺音频及多义词任务清单。
- [x] 增加安全规则批量补充器，用于人名、国家、城市、月份、星期和数字词汇。
- [x] 增加文章库导入、查询和阅读页面。（`backend/articles.json` 由 `importArticleFile` 幂等导入 `articles` 桶；接口 `GET /api/articles`（分页）与 `GET /api/articles/{id}`；前端 `web/js/components/ReadingView.js` 提供阅读馆、逐段中文对照与逐句解析。测试 `articles_test.go`（导入幂等、必填校验、库读写），本机实测 40 篇文章可查可读。）

## 建议实施顺序

1. 完成 P0 复习体验与算法。
2. 先建立词库校验，再批量扩充例句和语法内容。
3. 实施多用户模型与数据库迁移。
4. 扩展题型与教师/家长报告。
5. 完善自动化测试、CI、备份和部署。

## 当前风险

- 原始词库存在疑似编码、音标和字段错位问题，批量扩充前必须先校验和清洗。
- 当前 BoltDB 与词库索引使用包级变量，不利于并行测试和未来多实例部署。
- “掌握”目前主要由一次正确或手动点击触发，统计结果可能高估真实掌握程度。
