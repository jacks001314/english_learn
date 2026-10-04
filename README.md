# 英语学习乐园

面向小学和初中学生的英语词汇学习网站，后端使用 Go、Iris、BoltDB，前端使用 Vue 3 组件化实现。

## 已实现功能

- 多用户注册、登录与安全会话，密码使用 bcrypt 哈希保存
- 学习者与管理员角色，支持账号启用、停用及角色调整
- 管理后台支持批量导入单词和文章 JSON 数据
- 首次运行管理员账号为 `admin`，初始密码为 `Admin123!`；首次登录后必须立即修改

- 小学、初中词汇分页浏览和中英文搜索
- 支持例句、年级、主题、教材单元等扩展词汇信息及筛选（词库补充后自动生效）
- 分类词库支持按年级、A–Z 首字母、词性和主题浏览，并可正序或倒序排列
- 词性分类覆盖名词、动词、形容词、副词、代词、数词、冠词、介词、连词、感叹词、助动词、情态动词、缩略词和短语，全部词条均带词性标注
- 词汇列表支持多种排序：字母正序/倒序、按单元、按年级、按主题、按词长、智能推荐（未掌握优先）、最近更新与随机打乱
- 内置完整国家名称词汇，支持中英文搜索和“国家”主题筛选
- 浏览器语音合成英语朗读，无需维护独立音频文件
- 英译中、中译英、听音选词、拼写和例句完形练习
- 词义专项练习三页：看词选义（英→中）、看义选词（中→英）、听音选义，覆盖全部/小学/初中范围，并可按年级、主题、词性筛选
- 词义练习覆盖当前筛选命中的全部单词（不再随机抽十题）：按页出题，默认每页 12 题，支持首页/上一页/下一页/末页与跳页，题目顺序可选字母正序、字母倒序或随机（随机顺序带固定种子，翻页不重不漏）
- 页内题号圆点显示对错，翻页保留已作答记录，侧栏常驻错词清单并可回看单词详情（音标、释义、例句）
- 练完筛选范围内全部单词后给出正确率结算与针对性学习建议
- 词义练习与单词测验支持“答对自动下一题”：答对后约 0.75 秒自动进入下一题（页末自动翻到下一页），答错时停留原题看完讲解再手动继续；练习卡与测验页都有开关，设置按浏览器本地保存
- 练习来源筛选：词义练习可按“我的错题 / 学过但没掌握”收窄题目，题目严格取当前登录用户自己的学习记录（错题 = 答错过且尚未订正，未掌握 = 有记录但未标记掌握），未知取值等价于不过滤；可与年级、主题、单元、词性筛选叠加
- 智能英语助教（右下角 “AI 助学”）：打开练习页时自动带上当前题目与学习记录，可直接讲题、对比易混词、按错题出同类题，并把单词加入今日复习
- 助教上下文由服务端富化：页面只上报题号与单词 ID，释义、正确答案和历史答对/答错次数一律来自数据库，前端改动不了判分结论
- 助教返回结构化动作：快捷按钮可以真的在页面上做事（生成变式练习、加入今日复习），执行结果在对话里回执并给出跳转入口
- 变式练习页：助教按错题生成同类题，题目与答案都取自词库，判分沿用与正式练习相同的接口，答对自动进入下一题
- 错题本每条错题带 “AI 归因”，阅读页每段带 “逐句解析”
- 单词掌握、答题正确与错误记录
- 错题本、到期复习和学习报告
- 今日复习页面，支持按学段完成“记得/忘了”反馈
- 根据连续复习表现动态安排 1～60 天复习间隔
- BoltDB 持久化学习进度
- 小学与初中同名单词的学习记录相互隔离
- 桌面端和移动端响应式页面
- 中学生英文美文阅读馆，提供七至九年级分层原创素材
- 支持主题筛选、双语精读、全文/逐段朗读、重点词句和背诵自测
- 阅读与背诵完成状态保存在浏览器本地
- 新增热门问答主题原创合集，内容不复制第三方用户文章
- 文章首次打开时幂等导入 BoltDB，后续通过文章 API 从数据库读取
- 初中英语同步训练模块：按“作业”切分《基础同步达标手册 七年级上》Starter 与 Unit 1–3 共 20 份练习，覆盖单词、词组、语法、选择、语法填空、翻译和阅读加油站等题型
- 同步训练支持逐题判定对错、查看答案与讲解、按套查看词汇/词组/句型/语法/考点，并在浏览器本地记录“一次答对 / 需要复习”的练习进度
- 课程学习模块按教材单元呈现文章、词汇、词组、句型、语法、知识点与听力七类内容，词句可点读
- 七年级上册课程内容取自教材扫描件（OCR + 人工逐字校对），词汇按教材 Words and expressions 词表录入 298 条，听力保留原稿并接入教材配套录音
- 教材配套录音放在 `web/audio/7/`，词汇页、文章页与听力页均内嵌播放器（听力 1/2/3、Phonetics in use、附录发音指南与专有名词）
- 语法专题新增「小学基础」分组：15 张基础知识卡（be 动词、代词、单复数、冠词、时态入门、There be、比较级、方位介词等），
  只讲速查公式、用法要点、易错提醒与记忆卡，不含真题；与初中同名专题分列两组、互不覆盖

## 项目结构

```text
cmd/server/                         服务启动入口
internal/learning/model.go          数据模型
internal/learning/repository.go     数据集和 BoltDB 数据访问
internal/learning/service.go        学习业务逻辑
internal/learning/quiz.go           出题与判分引擎（词义练习筛选、分页与判分）
internal/learning/controller.go     HTTP 控制器
internal/learning/router.go         Iris 路由注册
internal/learning/run.go            应用生命周期
backend/*.json                      小学、初中词汇数据
chuzhong/真实教材/七年级上册/        教材扫描件整理的课程内容（词汇/词组/句型/语法/知识点/文章/听力）
web/audio/7/                        七年级上册教材配套录音（词汇/课文/听力/语音/附录）
web/js/components/                  Vue 页面与业务组件
web/js/tongbu/                      初中同步训练题库与练习进度工具
web/js/api.js                       前端接口模块
web/js/speech.js                    语音模块
web/meaning.css                     词义练习页样式
web/agent.css                       智能助教面板样式
web/js/learningContext.js           学习上下文总线（练习页 → 助教的页面状态）
web/js/components/DrillView.js      变式练习页（助教生成的同类题）
internal/learning/agent_context.go  助教学习快照、场景提示词与变式题生成
docs/agent-page-integration.md      智能助教与页面深度融合方案
web/vendor/                         本地 Vue 运行时
docs/database-design.md             内容资源库与 BoltDB 设计
```

内容库设计（词条、读音、例句、文章及其关系）见 [数据库设计](docs/database-design.md)。

## 智能英语助教

助教不是独立聊天框，而是“题目旁边的教练”。它读到的信息分三层：

1. **页面定位**：练习页通过 `web/js/learningContext.js` 上报页面、题目 ID、选中的答案与进度；
2. **服务端富化**：`internal/learning/agent_context.go` 用这些 ID 去查词库与学习记录，补上音标、释义、
   正确答案、该词的历史答对/答错次数、掌握度和近期错题，再渲染成提示词；
3. **结构化动作**：`/api/agent/chat` 除文本外还会返回 `actions`（如加入今日复习）与 `drill`
   （变式练习题），由页面确认后执行。

设计原则：**学生记录决定练什么，词库决定什么是对的**。变式题永远由真实词条拼装，判分走
`/api/quiz/answer`，所以模型不会改答案；模型不可用时自动退回词库生成的同类题，功能不中断。

管理员在“智能体管理”里配置引擎、模型与系统提示词；系统提示词是全局人设，各场景（词义练习、
测验、错题归因、阅读、考试）的教学要求由代码内置追加。

### 交互与可靠性

- **流式回答**：`POST /api/agent/chat/stream` 以 SSE 逐块返回文本（`delta` / `done` / `error`），
  面板里的答案边生成边显示；结构化动作（出同类题、加入今日复习）仍走非流式 `/api/agent/chat`，
  因为它们没有可流式的内容。注意 codex-core 必须在**构造客户端**时传 `Stream: true`，否则供应商
  适配器不会请求 SSE，只能拿到最终结果（见 `agent.go` 的 `codexConfigOptions`）。
- **并发放开**：模型调用由一个并发闸门限流（`MaxConcurrentRuns`，默认 2、上限 8），不再全局串行，
  多个学生同时提问不会互相排队；页面上下文组装、复习入队等非模型工作不受限。
- **讲解记忆沉淀**：每次讲解压缩成一条助教笔记（`internal/learning/tutor_memory.go`，`tutor_notes` 桶），
  同一个词再问时快照会带上「上次助教讲解（累计 N 次）」，学习画像与计划理由也会引用它。
- **主动轻提示**：连错 2 题、连对 5 题、进入今日复习、交卷后会在右下角弹出轻提示卡片，
  同类提示 5 分钟冷却、12 秒自动消失，不弹窗、不打断作答。
- **上下文总线是单例**：`learningContext.js` 的 store 挂在 `globalThis` 上，避免同一个模块被
  带版本号与不带版本号两种写法各加载一次、状态互相看不见。

## 启动

```powershell
go run ./cmd/server
```

访问 <http://localhost:8080>。

默认监听 `:8080`，需要换端口时用 `-addr` 指定（也可用 `--addr=:9000`）：

```powershell
go run ./cmd/server -addr :9000
```

## 编译与安装（Windows）

完整构建会执行测试、静态检查、词库质量检查、内容完整性审计，并生成独立运行目录：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build.ps1
```

线上部署、升级与回滚见 [`docs/deploy.md`](docs/deploy.md)。

如果旧版本正在运行，可构建到新的版本目录：

```powershell
.\scripts\build.ps1 -OutputDirectory "dist\english-learn-next"
```

### 教材音频

构建（以及部署）会先把项目根目录 `audio_7/` 里的教材录音同步到 `web/audio/7/`
（文件名规范化为 ASCII，`wav` 自动转 `mp3`），再打进发布目录与部署包；
`audio_7/` 不存在时自动跳过。手动刷新或新增音频后重新同步：

```powershell
.\scripts\import-audio.ps1
```

跳过同步：`build.ps1` / `deploy.ps1` 加 `-SkipAudioSync`。
`web/audio/7/` 完全由 `audio_7/` 生成，不要手工往里放文件（多余的会被清理）；
其他册可用 `.\scripts\import-audio.ps1 -SourceDirectory <原始目录> -DestinationDirectory <目标目录>`。
同步后 `go test ./internal/learning` 会逐条校验课程 JSON 引用的音频文件是否存在。

产物位于 `dist\english-learn`。安装到当前用户目录：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
```

默认安装到 `%LOCALAPPDATA%\EnglishLearn`，升级安装会保留 `english_learn.db`。自定义安装目录：

```powershell
.\scripts\install.ps1 -InstallDirectory "D:\EnglishLearn"
```

卸载并保留学习数据：

```powershell
.\scripts\uninstall.ps1 -KeepData
```

如果从项目目录之外运行，可指定项目根目录：

```powershell
$env:ENGLISH_LEARN_ROOT="D:\qax\reagent\dev\english_learn"
go run ./cmd/server
```

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/admin/users`（管理员）
- `PUT /api/admin/users/{id}`（管理员）
- `POST /api/admin/import/words`（管理员）
- `POST /api/admin/import/articles`（管理员）

- `GET /api/health`
- `GET /api/stats`
- `GET /api/dashboard`
- `GET /api/words?level=primary&page=1&q=apple`
- `GET /api/word-facets?level=primary`
- `GET /api/words/{id}?level=primary`
- `GET /api/quiz?level=primary`
- `GET /api/meaning-quiz?level=all&type=en-zh&grade=三年级&topic=交通&pos=noun`（词义练习；type 为 en-zh / zh-en / listen-zh，level=all 覆盖小学+初中。不带 page/size 时返回单道题，保持旧行为）
- `GET /api/meaning-quiz?level=all&type=en-zh&page=2&size=12&sort=word-asc&seed=42`（分页练习：带 page 或 size 时返回 `{level,type,sort,page,size,total,pages,items}`，items 分页覆盖筛选命中的全部单词，翻页不重不漏；size 默认 12、上限 60，page 越界自动收敛到末页；sort 支持 word-asc / word-desc / random，random 配合固定 seed 可稳定翻页；筛选命中 0 词返回 422）
- `GET /api/meaning-quiz?level=all&source=mistakes&page=1&size=12`（练习来源：`source=mistakes` 只练错题本里尚未订正的词，`source=unmastered` 只练学过但没掌握的词；按当前登录用户的学习记录判定，未知取值等价于不过滤。注意 `level` 默认是 `primary`，练全库要显式传 `level=all`）
- `POST /api/quiz/answer`（提交答案，返回 answer / correct / message）
- `GET /api/progress`
- `POST /api/progress/{id}?level=primary`
- `GET /api/mistakes?level=primary`
- `POST /api/mistakes/{id}/resolve?level=primary`
- `GET /api/review/today?level=primary`
- `GET /api/articles`
- `GET /api/articles/{id}`
- `POST /api/articles/import`

学习数据保存在项目根目录的 `english_learn.db`。

## 检查

一条命令跑完全部门禁（格式、静态检查、测试、词库校验、前端自检）：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ci.ps1
```

带上端到端（需要先起服务）：

```powershell
go run ./cmd/server -addr 127.0.0.1:8099
node scripts/e2e-practice-flow.mjs --base http://127.0.0.1:8099
powershell -ExecutionPolicy Bypass -File .\scripts\ci.ps1 -E2EBase http://127.0.0.1:8099
```

也可以只跑单项：

```powershell
go test ./...
go vet ./...
gofmt -l internal cmd
```

接口层集成测试在 `internal/learning/http_integration_test.go`（注册/登录/会话、权限守卫、练习来源筛选与跨用户隔离、判分写记录、错题订正、词库查询）；前端核心流程端到端在 `scripts/e2e-practice-flow.mjs`。

生成词库质量报告：

```powershell
go run ./cmd/wordcheck -output reports/word-quality.md
```

审计音标、读音来源和每个释义对应的例句：

```powershell
go run ./cmd/contentaudit -output reports/content-completeness.json
```

将独立维护的教学内容补丁合并进词库：

```powershell
go run ./cmd/enrichwords
```

按固定顺序自动合并全部人工补丁（构建时也会自动执行）：

```powershell
go run ./cmd/synccontent
```

批次列表末尾还有两组 **dedup 批次**（`*_dedup_merges.json` + `*_dedup_retire.json`）：前者把重复词形的释义并入保留条目，后者按 `replacedBy` / `reason` 记录并删除重复条目（如 `subway：`、`tomoto`、`work.`）。整条同步是幂等的，去重后再跑一遍结果逐字节一致。

向词库追加**新词条**（按 ID 与英文词形双重去重，可重复执行；候选文件字段不全时整批拒绝，不写半截数据）：

```powershell
go run ./cmd/expandvocab -additions backend/enrichment/primary_grade6_words.json -dry-run
go run ./cmd/expandvocab -additions backend/enrichment/primary_grade6_words.json
```

`scripts/ci.ps1` 默认让词库警告也阻断构建（`go run ./cmd/wordcheck -fail-on=warning`），只看报告不阻断时：

```powershell
go run ./cmd/wordcheck -format=json -output reports/word-quality.json
```
