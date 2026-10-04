# 独立复核：`go run .\cmd\server\main.go` 看不到本次修正（C1–C4）

> 复核者：`swarm-verify-sync`（独立于主控 swarm），任务 `task-swarm-word-audit / 追加复核`
> 日期：2026-09-30｜节点：Linux (go1.26.3 linux/amd64, Python 3.13.12)
> 方法：全部结论来自本节点真实执行的命令与输出；数据集/enrichment/源码**只读**，
> 复现只在临时副本 `.tmp-verify-server/` 内进行（任务结束已删除，保留 0 个临时文件）。

---

## 0. 结论速览（裁决）

| 结论 | 裁决 | 关键依据 |
|---|---|---|
| C1 server 只读两个数据集、不读 enrichment | **confirmed** | 代码路径 + 全仓 import grep（§1） |
| C2 DB 中 `managed_words`/`deleted_words` 为空，不覆盖数据集 | **confirmed** | bbolt 只读统计 = 0/0（§2） |
| C3 `go run ./cmd/synccontent` 是唯一必要生效动作，值级 105/317 | **confirmed**（口径澄清：105/317 = **字段级**变更，受影响**条目**为 104/313） | 副本内真跑 Go + 自写逐字段比对（§3） |
| C4 `dist/english-learn*/` 是独立发行目录，源码更新不影响它 | **confirmed**（表述需修正：**18/18 有自带 `backend/`，但只有 3/18 自带 `english_learn.db`**） | 18 个目录清单（§4） |
| 第 5 类缓存/旁路层 | **发现 1 条主控未列出的真实旁路**：前端静态同步词表 `web/js/tongbu/sets/*.js`（§5.1）；其余 4 类已排查为空（§5.2–5.5） | 见 §5 |

**agree / disagree**：C1、C2 完全同意；C3 数值同意，仅口径需澄清；C4 方向同意、细节表述需修正；
另新增 1 条主控未覆盖的旁路（§5.1）。

> ⚠️ **复核期间观察（非本次复核所为）**：复核进行中，项目根目录
> `backend/{primary,middle}_school.json` 已从「同步前」变为「同步后」版本（证据见 §3.7）。
> 该写入**不是**本次复核产生的（本次复核的所有写操作只在 `.tmp-verify-server/` 副本与
> 本报告文件内）。C1/C2/C4 的结论基于代码与 `english_learn.db`，不受此影响。

---

## 1. C1 复核 —— 服务器读词库的确切路径

### 1.1 命令与输出

```console
$ grep -rn "internal/enrichment" --include="*.go" . | sort
./cmd/enrichwords/main.go:8:	"english_learn/internal/enrichment"
./cmd/synccontent/main.go:5:	"english_learn/internal/enrichment"
```

即：**全仓只有 `cmd/synccontent` 与 `cmd/enrichwords` 两个命令** import 了补丁引擎；
`internal/learning`（server 的全部逻辑）**没有任何** `internal/enrichment` 依赖。

```console
$ grep -rn "primary_school.json\|middle_school.json\|enrichment" --include="*.go" cmd/ internal/ | grep -v "_test.go" | sort
cmd/server/main.go:33:		if fileExists(filepath.Join(current, "backend", "primary_school.json")) && fileExists(filepath.Join(current, "web", "index.html")) {
cmd/synccontent/main.go:42:			patch := filepath.Join(*root, "backend", "enrichment", name)
cmd/synccontent/main.go:53:			patch := filepath.Join(*root, "backend", "enrichment", name)
cmd/synccontent/main.go:54:			count, err := enrichment.Apply(dataset, patch)
internal/learning/repository.go:62:	if err := loadDataset(filepath.Join(root, "backend", "primary_school.json"), "primary"); err != nil {
internal/learning/repository.go:65:	if err := loadDataset(filepath.Join(root, "backend", "middle_school.json"), "middle"); err != nil {
```

`cmd/server` 内出现 `primary_school.json` 的那一处只是 `findProjectRoot()` 的**根目录探针**
（`cmd/server/main.go:33`），不读内容。

### 1.2 精确代码路径（server 启动 → 内存词表）

1. 【cmd/server/main.go†L19】 `learning.Run(root, *address)`
2. 【internal/learning/run.go†L6】 `openStore(root)` —— **每个进程只调用一次**，即词表在**启动时载入一次**，进程存活期间不再重读；这解释了「必须重启 server」。（另可 `ENGLISH_LEARN_ROOT` 覆盖根目录，见 【cmd/server/main.go†L25】）
3. 【internal/learning/repository.go†L62】 `loadDataset(root/backend/primary_school.json, "primary")`
4. 【internal/learning/repository.go†L65】 `loadDataset(root/backend/middle_school.json, "middle")`
5. 【internal/learning/repository.go†L230-L246】 `loadDataset` 把 JSON 直接 `json.Unmarshal` 进 `datasets[level]` 与 `wordIndex`
6. 【internal/learning/repository.go†L68】 `loadCountries(root)` 追加 `backend/countries.txt`（见 §2.3）
7. 对外词表接口读的就是这份内存数据：【internal/learning/router.go†L76】 `api.Get("/words", controller.Words)` → 【internal/learning/service.go†L24-L31】 `for _, item := range wordsByLevel(filter.Level)` → 【internal/learning/repository.go†L264】 `wordsByLevel` 直接返回 `datasets[...]`

**结论**：server 的词义 100% 来自 `backend/{primary,middle}_school.json`（+`countries.txt`），
`backend/enrichment/*.json` 只被 `cmd/synccontent` 消费。**C1 confirmed。**

### 1.3 未能在本节点做的验证（明确标注）

试图真跑 server 做端到端 HTTP 验证，被环境阻断（**不是**代码问题）：

```console
$ ENGLISH_LEARN_ROOT=$PWD/.tmp-verify-server/root2 go run ./cmd/server -addr 127.0.0.1:18099
go: downloading github.com/roasbeef/claude-agent-sdk-go v1.1.0
go: downloading golang.org/x/text v0.41.0
internal/learning/agent.go:14:2: codex_core@v0.0.0-00010101000000-000000000000:
  replacement directory D:/qax/reagent/dev/codex_core does not exist
```

原因：`go.mod:102 replace codex_core => D:/qax/reagent/dev/codex_core` 是 Windows 本机路径，
本 Linux 节点不存在该目录，`./cmd/server`（及其依赖 `internal/learning/agent.go`）无法编译。
→ **§1 的结论是代码级证据（含 `wordsByLevel` 直达路径），未做 HTTP 级端到端验证**；
`./cmd/synccontent` 不依赖 `codex_core`（见 §3 实跑成功），故 C3 可真跑验证。

---

## 2. C2 复核 —— 自己打开 `english_learn.db` 统计

### 2.1 工具与命令

自写只读 bbolt 统计器（放在临时目录，未进仓库）：

```console
$ go run .tmp-verify-server/dbstat/main.go english_learn.db
db=english_learn.db buckets=32
agent_audit                      0
agent_config                     0
article_progress                 0
article_words                    0
articles                         40
audit_logs                       0
content_factory_assets           0
content_factory_batches          0
content_factory_drafts           0
content_factory_events           0
content_factory_schedules        0
content_factory_tasks            0
content_factory_versions         0
content_meta                     1
content_versions                 0
deleted_articles                 0
deleted_exams                    0
deleted_words                    0
exam_attempts                    0
exam_papers                      9
examples                         4340
homework_submissions             0
homeworks                        0
learning_events                  23
learning_plans                   2
managed_words                    0
progress                         23
pronunciations                   4226
sessions                         5
settings                         0
users                            3
words                            4614
```

**与词义相关的 bucket**：`managed_words` = **0**、`deleted_words` = **0**、`words` = **4614**、
`pronunciations` = **4226**、`examples` = **4340**。

### 2.2 覆盖机制核查（为什么 0/0 就足够）

DB 能反向覆盖数据集的**仅有两个**入口，两者都由上述两个 bucket 驱动：

- 【internal/learning/repository.go†L84】 `loadManagedWords(db)` → 【internal/learning/repository.go†L342-L353】 读出后 `mergeWord(item)`（会**覆盖同 id 的内存词条**）；
- 【internal/learning/repository.go†L88】 `loadDeletedWords(db)` → 【internal/learning/repository.go†L318-L328】 `removeWord(...)`（会**删除内存词条**）。

两者 bucket 均为 0 → 启动时不会有任何 DB 旧值覆盖/删除数据集词条。**C2 confirmed。**

### 2.3 派生 bucket 是否真的「由数据集重建」——精确化

自写 dump 脚本把 bucket 内容逐条与数据集比对：

```console
$ python3 - <<'PY'
（读取 .tmp-verify-server/dbdump.json 与 backend/*_school.json 比对）
PY
managed_words count= 0 sample= []
deleted_words count= 0 sample= []
words count= 4614
pronunciations count= 4226
examples count= 4340
dataset keys: 4226
stale word keys (in db, not in dataset): 388
missing (in dataset, not in db): 0
stale sample: ['middle:country-afghanistan', 'middle:country-albania', ...]
db words rows whose meaning != dataset meaning: 0 []
```

```console
$ python3 - <<'PY'
（进一步核对 388 条的来源 / 音标与例句的派生关系）
PY
stale words keys: 388 | non-country stale: []
ds entries with phonetic: 4226
pronunciation rows whose word id is unknown: 0 []
examples rows: 4340
```

- **4614 = 4226（数据集）+ 388（国家词）**，388 = 194 行 `backend/countries.txt` × 2 个 level，
  且 **非 `country-*` 的残留 key 为 0**（来源见 【internal/learning/countries.go†L11-L40】，
  在 【internal/learning/repository.go†L68】 启动时注入）。
- 同 id 的 `words` 行 **meaning 与数据集 100% 一致（0 处不符）**，无缺失 key（0 条）。

**口径澄清（对主控 C2 表述的精确化，非反证）**：`importContentLibrary`
（【internal/learning/content_import.go†L10-L55】）是按 id **upsert**，**不含 `ForEach` 清理**，
所以严格说是「每次启动按 id 覆写」，而非「清空重建」。当前库中不存在任何真·陈旧行
（唯一「多出来」的 388 条是每次启动都会重新注入的国家词），因此结论不受影响。
另外：`words` bucket **只被写、不被读**（`grep wordsBucket` 仅命中 `content_import.go:12/80` 的写入与计数），
`/api/words` 走内存数据集，故即便有陈旧行也不会显示到界面。

---

## 3. C3 复核 —— 副本内真跑 `cmd/synccontent` + 自写逐字段比对

### 3.1 副本与基线

```console
$ mkdir -p .tmp-verify-server/root/backend .tmp-verify-server/before
$ cp -a backend/enrichment .tmp-verify-server/root/backend/enrichment
$ cp -a backend/primary_school.json backend/middle_school.json .tmp-verify-server/root/backend/
$ cp -a backend/primary_school.json backend/middle_school.json .tmp-verify-server/before/
$ ls .tmp-verify-server/root/backend/enrichment | wc -l
61
$ md5sum .tmp-verify-server/before/*.json .tmp-verify-server/root/backend/*.json
ca69110683e1820285952a68ba348e99  .tmp-verify-server/before/middle_school.json
29be5298d253858d76cbc9aa53ef6d25  .tmp-verify-server/before/primary_school.json
ca69110683e1820285952a68ba348e99  .tmp-verify-server/root/backend/middle_school.json
29be5298d253858d76cbc9aa53ef6d25  .tmp-verify-server/root/backend/primary_school.json
```

### 3.2 真跑 Go（本节点有 Go 工具链，非 Python 等价复现）

```console
$ go run ./cmd/synccontent -root .tmp-verify-server/root
synced middle_ce.json           75 records
...（略）
synced primary_audit_truncated_fix.json 14 records
synced primary_audit_leftover.json 15 records
EXIT=0
```

（60 个补丁批次全部 `exit=0`，无 `invalid patch` / `not found` 报错。）

### 3.3 自写逐字段比对（`.tmp-verify-server/compare.py`，非复用主控脚本）

```console
$ python3 .tmp-verify-server/compare.py
primary: count_before=1331 count_after=1331 ids_before=1331 ids_after=1331
         ids_only_before=[] ids_only_after=[] dup_ids_after=0
         changed_entries=104
         field_counts={"word": 11, "meaning": 94}          # 合计 105 处
middle:  count_before=2895 count_after=2895 ids_before=2895 ids_after=2895
         ids_only_before=[] ids_only_after=[] dup_ids_after=0
         changed_entries=313
         field_counts={"meaning": 306, "pos": 8, "word": 3}  # 合计 317 处
```

```console
$ python3 - <<'PY'
（id 顺序 / 单条多字段明细）
PY
primary id order identical: True | ids: 1331 1331
   entries: 104 field-changes: 105 entries with >1 field: {'labour': ['word', 'meaning']}
middle id order identical: True | ids: 2895 2895
   entries: 313 field-changes: 317 entries with >1 field:
     {'america': ['pos','meaning'], 'around': ['word','meaning'], 'crow': ['pos','meaning'], 'eighteenth': ['pos','meaning']}
```

`key_sets_before == key_sets_after`（每个条目存在的字段集合完全一致，无字段增删），
且**没有任何 `phonetic` 变更**（`phonetic` 计 0；本次值级变更只落在 `word` / `meaning` / `pos`）。

### 3.4 抽样核对（与 `changes-applied.md` 的字段分布完全一致）

```console
$ python3 -c "...打印同步前后签名值..."
after middle:crow = crow 乌鸦；（公鸡）打鸣；啼叫
after middle:experience = 经验；经历
after primary:a little = 有些 | primary:art = 美术；艺术
```

与 【reports/word-audit/changes-applied.md†L17】 的总览表逐格一致：
`primary word 11 / meaning 94 / pos 0 / phonetic 0 = 105`，
`middle word 3 / meaning 306 / pos 8 / phonetic 0 = 317`（439 = 422 + chuzhong 17）。

### 3.5 幂等性（第二次执行字节相同）

```console
$ md5sum .tmp-verify-server/root/backend/*.json        # 第一次同步后
250cc9e48ba37cb92d034581d7d3cfb7  .tmp-verify-server/root/backend/middle_school.json
d77136360b2cd68a37c887588eaa275a  .tmp-verify-server/root/backend/primary_school.json
$ go run ./cmd/synccontent -root .tmp-verify-server/root && md5sum ...
exit=0
250cc9e48ba37cb92d034581d7d3cfb7  .tmp-verify-server/root/backend/middle_school.json
d77136360b2cd68a37c887588eaa275a  .tmp-verify-server/root/backend/primary_school.json
```

### 3.6 文件格式副作用（git diff 噪声来源，已实测）

```console
$ head -c 300 .tmp-verify-server/before/middle_school.json
[ { "example": ..., "id": "a", "letter": "A", "meaning": ..., "phonetic": ..., "pos": ..., "word": "a" } ]  # 键名升序
$ head -c 300 .tmp-verify-server/root/backend/middle_school.json
[ { "id": "a", "word": "a", "phonetic": ..., "pos": ..., "meaning": ..., "letter": "A", "example": ... } ]  # Go 结构体字段序
$ wc -l .tmp-verify-server/before/middle_school.json .tmp-verify-server/root/backend/middle_school.json
  35966 .../before/middle_school.json
  35966 .../root/backend/middle_school.json
$ wc -c .tmp-verify-server/before/middle_school.json .tmp-verify-server/root/backend/middle_school.json
  983753 .../before/middle_school.json
  982672 .../root/backend/middle_school.json
```

写回时键序变为 Go 结构体顺序（`Apply` 用 `json.MarshalIndent`，见 【internal/enrichment/enrichment.go†L103-L110】），
行数不变、字节数略减 → **git diff 会出现大量行位移，但语义变更只有 §3.3 的 105/317 处**（与主控提示一致）。

**C3 confirmed**（数值一致；口径应为「105/317 = 字段级变更数，受影响条目 104/313」）。

### 3.7 复核期间的真实落地（附加观察，非本次复核所为）

本次复核进行中，项目根目录的数据集本身发生了变化（我用 `project_list` 于复核早期
看到的是同步前 etag，复核末期再次枚举时 etag 已变）：

```console
# 复核早期
backend/middle_school.json   size 983753   etag 0c324a4f67e5a855
backend/primary_school.json  size 478880   etag edcac806cbc78460

# 复核末期（同一路径再次 project_list）
backend/middle_school.json   size 982672   etag 878a3737204a04e6
backend/primary_school.json  size 478481   etag 9130a69f05f036be
```

把当前 Master 版本取回后与其内容核对：

```console
$ md5sum backend/middle_school.json backend/primary_school.json
250cc9e48ba37cb92d034581d7d3cfb7  backend/middle_school.json
d77136360b2cd68a37c887588eaa275a  backend/primary_school.json
$ python3 -c "...打印签名值..."
middle crow: crow | 乌鸦；（公鸡）打鸣；啼叫
middle experience: 经验；经历
primary a little: 有些 | primary art: 美术；艺术
counts: 1331 2895
```

**关键点**：这两个 md5 与我在 §3.5 中**独立复现**得到的产物 md5 **逐字节完全相同**
（middle `250cc9e4…`、primary `d7713636…`）。这是一条极强的一致性证据：
别人把同步落到项目根目录的结果，与我独立跑出的结果完全一致，佐证 C3 无随机性/无遗漏；
且条目数仍为 1331 / 2895。该写入并非本次复核所为（本次复核的写操作仅限
`.tmp-verify-server/` 副本与本报告文件，详见 §7）。

---

## 4. C4 复核 —— `dist/` 是否为独立发行目录

### 4.1 目录清单证据

```console
$ ls -d dist/*/
dist/english-learn                  dist/english-learn-40-articles      dist/english-learn-adaptive
dist/english-learn-article-db       dist/english-learn-complete         dist/english-learn-content-studio
dist/english-learn-data-safe        dist/english-learn-equal-columns    dist/english-learn-fixed
dist/english-learn-hot-reading      dist/english-learn-large-screen     dist/english-learn-operations
dist/english-learn-operations-fixed dist/english-learn-platform         dist/english-learn-platform-v2
dist/english-learn-reading          dist/english-learn-reading-layout   dist/english-learn-responsive
```

逐目录枚举（`project_list` 全量读取，18 个目录）：

| dist 目录 | 自带 `backend/` | 自带 `english_learn.db` | 自带 `english-learn.exe` |
|---|---|---|---|
| english-learn | ✓ | ✓ (16 MiB, etag 76fb1290b3d8dfe6) | ✓ |
| english-learn-adaptive | ✓ | ✓ (16 MiB) | ✓ |
| english-learn-data-safe | ✓ | ✓ (8 MiB) | ✓ |
| 其余 15 个 | ✓ | ✗ | ✓ |

例：

```console
$ project_list dist/english-learn
dist/english-learn/README.md, VERSION, backend/, english-learn.exe (40,178,688 B),
  english_learn.db (16,777,216 B), start.ps1, web/
$ project_list dist/english-learn/backend
backend/{articles.json, countries.txt, enrichment/, exam_sources.json, exams/, exams.json,
         exams_2024.json, exams_2025.json, middle_school.json (983,753 B), primary_school.json (478,880 B)}
```

### 4.2 发行版数据与源码数据的实际关系（强证据）

```console
# 复核开始时
$ project_list backend
backend/middle_school.json   size 983753   etag 0c324a4f67e5a855
backend/primary_school.json  size 478880   etag edcac806cbc78460
$ project_list dist/english-learn/backend
dist/english-learn/backend/middle_school.json   size 983753   etag 0c324a4f67e5a855
dist/english-learn/backend/primary_school.json  size 478880   etag edcac806cbc78460
```

**复核开始时**发行版数据集与源码目录数据集字节完全相同（etag 一致，均为同步前版本）；
复核进行中源码侧已变为同步后版本（§3.7），而 **`dist/` 侧仍是 983753 / 478880 的旧值（未变）**。
两边是**两份独立文件**：`scripts/build.ps1` 第 84 行 `Copy-Item backend → $outputPath` 才做拷贝
（另见 【scripts/build.ps1†L45】 构建第 4 步 `go run ./cmd/synccontent -root $projectRoot`，
【scripts/build.ps1†L83-L91】 打包 exe/backend/web 并写入合并库）。
所以：**在源码目录跑 `synccontent` 不会影响任何 `dist/` 目录，必须重新构建发行版**——
这一点在本次复核期间被真实数据印证（源码侧已更新，dist 侧未动）。

**C4 confirmed**，但主控「每个都带一份自己的 backend/ 与 english_learn.db」需修正为：
**18/18 自带 `backend/`，仅 3/18（english-learn、-adaptive、-data-safe）自带 `english_learn.db`**；
无自带 DB 的发行目录运行时会在自身目录新建库（`bolt.Open`，【internal/learning/repository.go†L72】）。

---

## 5. 第 5 类：缓存 / 旁路层排查

### 5.1 ⚠️ 发现 1 条主控未列出的真实旁路：前端静态「同步」词表

`web/js/tongbu/sets/*.js` 里**硬编码了带释义的单词表**（20 个文件，经 `web/js/tongbu/index.js`
静态 import，`TongbuView` 直接渲染，见 【web/js/components/TongbuView.js†L1-L30】），
**不经过 `/api/words`、不受 `synccontent` 影响、重新 build 也不会自动更新**。

```console
$ python3 - <<'PY'
（提取 sets/*.js 的 word 字段，与本次变更 id 集合求交集）
PY
changed ids: 401
frontend tongbu vocab words: 237
overlap with changed ids: ['appear','cousin','excited','fun','grammar','grey','hope','however','lab',
 'leave','plan','pool','position','rush','sentence','share','shelf','something','state','t-shirt']

$ python3 - <<'PY'   # 逐条对照静态值 vs 同步后数据集值
PY
position  static='职位，职务'   after=[('middle','位置；地方')]
state     static='陈述，说明'   after=[('middle','州')]
rush      static='冲，奔'      after=[('middle','仓促；急促')]
pool      static='水塘，水洼；游泳池' after=[('middle','游泳池')]
appear    static='（尤指突然）出现，呈现' after=[('middle','出现；出版；显得')]
...（共 20 条命中）
```

**影响界定（不夸大）**：这 20 条是「同步训练手册」的独立内容面，
其释义并非本次审计的裁决对象（手册与词库词义本可不同）；
**只有当用户是在「同步/Tongbu」页看词时**，这些静态值才是「看不到修正」的第二来源。
→ 建议：若需一致，须手工同步 `web/js/tongbu/sets/*.js` 这 20 条（或明确声明两处口径不同）。

### 5.2 前端缓存 / Service Worker —— 已排查：无

```console
$ grep -rn "serviceWorker\|caches.open\|Cache-Control\|CacheStorage" web/ --include="*.js" --include="*.html"
（无输出）
$ find web -iname "sw*.js" -o -iname "*service*worker*"
（无输出）
$ grep -rn "Cache-Control\|CacheControl\|cache" --include="*.go" internal/learning/*.go cmd/server/main.go | grep -v _test
（无输出）
```

无 Service Worker、无 `caches.open`、无服务端 `Cache-Control` 注入 → 不存在浏览器侧离线缓存旁路。
（`web/js` 的 `?v=...` 查询串只用于 JS 资源版本化，词义数据全部走 API。）

### 5.3 内存词表缓存 —— 存在但为预期行为（需重启，主控已覆盖）

【internal/learning/run.go†L6】 中 `openStore` 只在进程启动时调用一次 →
进程内 `datasets`/`wordIndex` 不会热更新。即「改完数据集必须重启 server」，
与主控「再重启 server」一致，**不构成额外缺陷**。

### 5.4 其他数据面 —— 已排查：无（且比主控描述更干净）

- `chuzhong/vocab/*.json` 由 course 接口**每次请求重读磁盘**（【internal/learning/course.go†L321-L327】 → `loadCourse`），
  无缓存层；本次 17 处 chuzhong 修正是整文件写回，故无需重启即生效。
- DB 侧无陈旧覆盖（§2），根目录只有一份 `english_learn.db`（无第二个库文件参与运行）。
- `.gocache/`、`.tmp/` 是构建缓存，`go run` 每次从源码编译，与词义无关。

### 5.5 发行版副本 —— 见 C4（属独立数据面，非缓存）

**第 5 类总结：发现 1 条（§5.1 前端静态同步词表）；§5.2–5.5 已排查：无。**

---

## 6. 复现命令汇总

```bash
# C1
grep -rn "internal/enrichment" --include="*.go" . | sort
sed -n '55,100p' internal/learning/repository.go ; sed -n '24,32p' internal/learning/service.go

# C2（自写只读工具，置于临时目录）
go run .tmp-verify-server/dbstat/main.go english_learn.db
go run .tmp-verify-server/dbdump/main.go english_learn.db > .tmp-verify-server/dbdump.json

# C3
cp -a backend/enrichment .tmp-verify-server/root/backend/enrichment
cp -a backend/{primary,middle}_school.json .tmp-verify-server/before/
cp -a backend/{primary,middle}_school.json .tmp-verify-server/root/backend/
go run ./cmd/synccontent -root .tmp-verify-server/root
python3 .tmp-verify-server/compare.py

# C4
ls -d dist/*/    # + 逐目录 project_list 枚举

# 生效动作（用户在 Windows 项目根目录）
go run ./cmd/synccontent
go run .\cmd\server\main.go
```

## 7. 边界说明

- 仅新增本文件；`backend/`（数据集 + enrichment）、`chuzhong/`、`cmd/`、`internal/`、
  `reports/word-audit/` 下既有文件**均未由本次复核修改**（所有写入都在 `.tmp-verify-server/` 副本内）。
- **§3.7 记录的 `backend/{primary,middle}_school.json` 变更不是本次复核所做的**：
  本次复核唯一的项目写入是本报告文件；复核期间该数据集被外部（主控/其他流程）更新。
- 未改任何 `id`、未增删条目、未合并重复条目（§3.3：id 集合与顺序完全不变）。
- 所有临时副本已删除，保留 0 个临时文件。
- 未派生任何下级 Agent。
- 已知未覆盖项：Linux 节点无法编译 `./cmd/server`（`go.mod:102` 的 Windows 本机 replace），
  故未做 server 端 HTTP 级端到端验证（§1.3）。
