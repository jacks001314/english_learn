# 为什么 `go run .\cmd\server\main.go` 看不到本次修正

**结论**：不是 server 的问题，也不需要改 `cmd/server/main.go`。
本次 439 处修正最初只写进了 `backend/enrichment/*.json`（补丁），而服务器读的是
`backend/primary_school.json` / `backend/middle_school.json`（数据集）。
**在项目根目录跑一次 `go run ./cmd/synccontent` 即可生效，然后重启 server（DB 不用清）。**

> 更新（2026-09-30 复核后）：**数据集现在已经是同步后的状态**（见 §5），
> 因此只要**重启 server** 就能看到新释义，不需要再执行一次同步（再跑一次也是幂等的空操作）。

## 1. 证据（可复现）

### 1.1 服务器的数据来源就是数据集文件，不读补丁
- `cmd/server/main.go:15` `findProjectRoot()` → `cmd/server/main.go:19` `learning.Run(root, *address)`，
  全文件没有加载补丁的逻辑。
- `internal/learning/repository.go:55` `openStore()` 里：
  `repository.go:62` 读 `backend/primary_school.json`，`repository.go:65` 读 `backend/middle_school.json`
  （经 `loadDataset`，`repository.go:230`）；`internal/learning/run.go:6` 调用 `openStore`。
- 全仓只有两个命令 import 了补丁引擎：`cmd/synccontent/main.go:5`、`cmd/enrichwords/main.go:8`；
  `internal/learning` 没有 `internal/enrichment` 依赖。

### 1.2 数据库不是原因
- 用 bbolt 只读打开 `english_learn.db`（16 MiB）统计：`managed_words` = **0** 条、
  `deleted_words` = **0** 条，所以启动时不会有 DB 旧值覆盖数据集
  （覆盖入口是 `repository.go:344 loadManagedWords` → `mergeWord`，前提是那里有数据）。
- `words`（4614 条）/`pronunciations`（4226 条）/`examples`（4340 条）每次启动都由
  `internal/learning/content_import.go:10 importContentLibrary()` 从数据集重写，是派生产物。

## 2. 生效命令

```powershell
# 项目根目录（有 backend/ 和 go.mod 的目录）
go run ./cmd/synccontent
# 然后重启
go run .\cmd\server\main.go
```

`cmd/synccontent` 按 `cmd/synccontent/main.go` 的 `batches` 表顺序把
`backend/enrichment/*.json` 合并进两个数据集；README.md:195 记的也是这条
（「按固定顺序自动合并全部人工补丁（构建时也会自动执行）」）。
`scripts/build.ps1` 的第 4 步同样是 `go run ./cmd/synccontent -root $projectRoot`。

## 3. 已预演（值级变更 = 补丁清单全量）

在副本目录里跑 `go run ./cmd/synccontent -root <副本>`：**值级变更 primary 105 处 / middle 317 处**，
条目总数不变（1331 / 2895），id 集合与顺序不变，除 meaning/word/pos/phonetic 外零改动。
注意：该工具用 Go 结构体字段顺序重写整个文件，所以 git diff 会看到大量行位移，
**真正的值变化只有上面 105 + 317 处**。

## 4. 端到端验证（重启后的真实表现）

做法：把 `backend/` 与 `web/index.html` 复制到隔离目录 `.verify-e2e/root`（用同步后的数据集，
库为全新建），以 `ENGLISH_LEARN_ROOT` 指向它启动真实 server（`go build ./cmd/server` + `:18099`），
用 `admin` 登录后调用接口：

```
GET /api/words?level=middle&q=crow
 → {"id":"crow","word":"crow","pos":"n. & v.","meaning":"乌鸦；（公鸡）打鸣；啼叫", ...}
GET /api/words?level=primary&q=afternoon
 → {"id":"afternoon","word":"afternoon","meaning":"下午；午后", ...}
```

即：**数据集同步 + 重启 server 之后，接口返回的就是审核后的新释义**（DB 不会覆盖）。
验证用的隔离目录与临时二进制已删除。

## 5. 数据集当前状态（复核期间已同步）

| 文件 | 同步前 | 同步后（当前 Master） |
|---|---|---|
| `backend/primary_school.json` | 478880 B / etag `0c324a4f…` | **478481 B / etag `9130a69f05f036be` / md5 `D7713636…`** |
| `backend/middle_school.json` | 983753 B / etag `edcac806…` | **982672 B / etag `878a3737204a04e6` / md5 `250CC9E4…`** |

两份文件的 md5 与「独立复现同步」的产物**逐字节相同**；用脚本按 `batches` 顺序把 61 个补丁
再应用一遍，**结果与磁盘内容完全一致（零额外变更）** → 数据集已完全同步、重复执行是空操作。
（该写入不是本次复核/汇编成员所为，推测是使用者本人执行了 `go run ./cmd/synccontent`。）

## 6. 已知旁路（不影响主站，但值得知道）

`web/js/tongbu/sets/*.js`（20 个文件、约 250 个词条）是**初中同步训练模块**的静态词表，
由 JS 直接 import 渲染，**不读取 `/api/words`**，所以本次审核的修正到不了「同步」页。
逐条比对后有 22 条与本次修正重叠，其中多数只是粒度/标点差异（如 `share`「分享」vs「分享，共享；分配；共有」）；
语义明显不同的 6 条经核对，**在各自单元语境下是正确的**（每条自带 `use` 短语）：

| 词 | 静态词表 | 数据集（审核后） | 判定 |
|---|---|---|---|
| `state` (u1-3) | v. 陈述，说明（`state our problem`） | n. 州 | 义项不同，各自成立 |
| `rush` (u2-1) | v. 冲，奔（`rush into his room`） | v. 仓促；急促 | 义项不同，各自成立 |
| `position` (u3-1) | n. 职位，职务（`take over his father's position`） | n. 位置；地方 | 义项不同，各自成立 |
| `pool` (u1-4) | 水塘，水洼；游泳池 | 游泳池 | 静态更全，无需改 |
| `shelf` (u2-4) | 搁板，架子 | 书架 / 架子；搁板 | 同义表述 |
| `hope` (u1-4) | 希望，期望，指望 | 希望；期望；盼望 | 同义表述 |

结论：这是**第三份独立内容源**（按教材单元手工维护），不在本次审核范围内；
若要与数据集统一口径，需要在同步训练模块单独做一轮校对（尚未授权，未改动）。

## 7. 环境提示（非本次范围）

`go.mod:6` 依赖 `codex_core`，`go.mod:102` 用 `replace codex_core => D:/qax/reagent/dev/codex_core`
指向本机路径；`internal/learning/agent.go:14`、`content_factory.go:28` 会 import 它。
因此在没有 `D:\qax\reagent\dev\codex_core` 的机器（例如 Linux 构建节点）上 `go build ./cmd/server`
会失败——这是仓库既有状态，如需 CI/跨平台构建需要另行处理。
