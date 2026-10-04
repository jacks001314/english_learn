# 词库拼写/词义逐条审核与修正 — 收敛报告

任务引用：`task-swarm-word-audit`（owner: swarm）、追加子任务 `task-swarm-abbrev-fill`。
本报告由主控（swarm）汇总，数字均由主控在项目副本上**复跑项目自带管线**后得出，不采信成员自述。

## 1. 目标与范围
- 目标：审核并修正全部单词表数据的 `word` 拼写 / `meaning` 词义 / `pos` 词性错误。
- 范围：`backend/primary_school.json`(1331)、`backend/middle_school.json`(2895)、
  `chuzhong/vocab/*.json`(6 册 1728)、`chuzhong/真实教材/七年级上册/vocab.json`(298)。
- 非目标：例句/课文润色、音标系统性重做（仅处理明显污染）、增删/合并条目、改 `id`。

## 2. 交付通道
- `backend/*_school.json` 是**构建期产物**：`scripts/build.ps1` 会执行 `go run ./cmd/synccontent`，
  按 `cmd/synccontent/main.go` 的 `batches` 顺序把 `backend/enrichment/*.json` 合并进数据集。
  因此修正以「enrichment 批次 + 批次表」交付，下次构建/部署生效。
- `chuzhong/vocab/*.json` 是运行期直接读取的静态数据（`internal/learning/course.go`），整文件写回即生效。

## 3. 编队与执行
| 成员 | 节点 | 承担 |
|---|---|---|
| swarm-audit-primary-a / primary-b | 本地 | primary `#、A–L`(60) / `M–Z`(29) |
| swarm-audit-middle-a / middle-b | 本地 | middle `A–C`(66) / `D–I`(80) |
| swarm-audit-middle-c-n2 / middle-d-n2 | kalinux | middle `J–P`(68) / `Q–Z`(84) |
| swarm-audit-course-7-n2 / course-89-n2 | kalinux | 七上/七下/真实教材七上(2) / 八上·八下·九上·九下(6) |
| swarm-verify-primary / verify-middle | 本地 / kalinux | 独立复核（只读，不写数据） |
| swarm-patch-course-a / course-b | 本地 / kalinux | chuzhong 5 个文件写回（17 处） |
| swarm-fix-primary-clean | 本地 | primary 残留句点/词形噪声（15 处） |
| 主控（swarm） | 本地 | 批次集成、3 项裁决、管线复跑与验收 |

节点分布：本地 `23461ed8…` 与 `kalinux db7baf78…` 两个节点，未集中在一个节点。

## 4. 落地结果（由副本管线实测）
| 数据集 | 条目 | 应用字段变化 | 拆分 |
|---|---:|---:|---|
| primary_school.json | 1331 | **105** | word 11 / meaning 94 |
| middle_school.json | 2895 | **317** | meaning 306 / pos 8 / word 3 |
| chuzhong/vocab（5 文件） | — | **17** | meaning 6 / word 2 / phonetic 9 |
| 合计 | | **439** | |

E 类分布（成员自报，主控抽验）：primary `E2 20 / E3 35 / E4 5 / E5 2 / E6 2 / E7 7 / E8 1 / E9 17`；
middle `E1 116 / E2 23 / E3 137 / E4 9 / E5 3 / E7 19 / E8 6 / E9 4`（E1=页码残留，E9=形式说明类）。
典型修复：`ability 能力；才能 p.6`→`能力；才能`、`pear 梨milk /milk/ n. 牛奶`→`梨`、`drum 喇叭`→`鼓`、
`experience 信任；经历`→`经验；经历`、`america`(pos)、`at the beginning of phr. …`(word)、
`surferboard`→`surfboard`、`natural 大自然`→`自然的；天然的`、`sportsperson 亚洲的`→`运动员`、`crop` 音标串行。

## 5. 主控裁决（3 项）
1. **行内拆行条目（primary 13 个 id：a/art/be/dining/doing/easter/eating/had/keep/labour/listening/living/reading）**：
   切片取值只去掉短语首词，仍与 `word` 不对应（如 `art`+「美术教室」）→ 裁决取词头本义
   （`art`→`美术；艺术`、`a`→`一（用于单数可数名词前）`…），落在 `primary_audit_truncated_fix.json`，
   并置于批次表**最后**（同库既有批次与审计批次唯一字段冲突是 `experience`，审计批次必须最后生效）。
   独立复核者独立复现同一冲突并推荐同一方向。
2. **middle `around`**：释义是 `around the world` 的译文且全库无该短语条目 → 恢复短语词形
   `word="around the world"`（id 不变）。
3. **middle `crow`**：源释义「拥挤」属 `crowded`，本条例句为「一只乌鸦落在旧墙上」→ 补回 `乌鸦；（公鸡）打鸣；啼叫`
   并配套 `pos="n. & v."`。

## 6. 用户追加要求：简写/缩写词条补全（`task-swarm-abbrev-fill`）
- 定位：全库扫描「meaning 只写形式说明（…的缩写形式/复数形式/过去式…）而无中文词义」的条目。
  primary 0 条；middle 原有 17 条，其中 `No`/`was`/`went`/`were`/`women`/`let's` 6 条已由切片审计补全，
  剩余 **11 条**：`aren't / can't / don't / I'll / I'm / isn't / it's / there's / what's / children / goes`。
- 处理：`reports/word-audit/middle-abbrev.json` + `backend/enrichment/middle_audit_abbrev.json`（11 条，仅改 `meaning`），
  格式与已落地条目一致：`中文词义（英文全称 的缩写形式）`，例：`can't` → `不能；不会（can not 的缩写形式）`、
  `children` → `孩子们（child 的复数形式）`、`goes` → `去；走（go 的第三人称单数现在时）`。
- 闭环验证：管线跑完后，「只写形式说明、无中文词义」的条目在两个库中均为 **0**；
  middle 差异 306 → 317，全部可解释，未解释 0；wordcheck 警告仍为 54（全部既有 `duplicate_word`，无新增）。

## 7. 验证证据（可复现）
```
python scripts/word-audit/checkpatch.py --source backend/middle_school.json --patch reports/word-audit/<slice>.json   # 全部 OK
Copy-Item -Recurse backend .tmp/verify6/backend && go run ./cmd/synccontent -root .tmp/verify6
#  → primary 105 处、middle 317 处；未解释差异 0、未生效 0；条目数与 id 顺序不变；连续两次运行字节相同（幂等）
.tmp/audit/wordcheck.exe -format json -output ...   # 警告 176 → 54；resolved 122；新增 0
```
- 独立复核：`verify-primary` 102 条 → agree 89 / disagree 13（=§5.1 冲突，按裁决落地）+ 抽样 150 条；
  `verify-middle` 299 行 → agree 297 / disagree 2（=§5.2/5.3，已修）+ 抽样命中遗漏 1（已修）。
- `go vet ./...` 通过；`go test ./...` 仅 `TestCourseLoadsTextbookContent` 失败，原因是本地镜像未取回
  `chuzhong/原创课文`（该测试读课文目录），与本次改动无关。
- 分级：`confirmed` 439 处修正（逐条比对 + 管线复跑 + 零新增警告）；`probable` chuzhong 中
  `ssh→sh`、`west` 释义补全等 3 处（依教材/词典惯例，无外部权威源）。

## 8. 残余问题与未决项（需用户裁决，本次未改）
1. **重复条目 54 处**（wordcheck `duplicate_word`；middle 35 组 / primary 16 组，如 `dance`/`dan.ce`、`clean`/`clean.`）：
   修词形会与既有条目重复，超出「不增删/不合并」授权。
2. **词形家族**：`big—bigger` 等含破折号 36 条、`fifth (5th)` 等序号词形 10 条、`story -book`、`the Great Wall`（id 污染）。
3. **id 字段 OCR 残片**（middle 104 条、primary 12 条，如 `rurn right`、`tomoto`、`feel free （`）：禁令不改 id，但影响 enrichment 匹配。
4. **音标**：八上/八下/九下部分条目用简化转写（`main=men`、`paint=pent`）且同文件内并存标准 IPA；含 `;` 的分读标注 42 条。
5. **6 条星期缩写**（`Fri.`/`Mon.`/`Sat.`/`Sun.`/`Thu.`/`Tue.`）的 `letter` 仍为 `#`：`enrichment.Patch` 结构体无 `letter` 字段，需直接改数据集或扩展结构体。
6. **chuzhong 行尾由 CRLF 归一为 LF**（`project_write` 通道无法写入 CR）；JSON 数据与「原文件+17 处修正」深层相等。

## 9. 复现步骤与产物
```
go run ./cmd/synccontent -root .   # 生成修正后的 backend 数据集（构建脚本已内置）
go run ./cmd/wordcheck -output reports/word-quality.md
python scripts/word-audit/checkpatch.py --source <dataset> --patch reports/word-audit/<slice>.json [--course]
```
产物：`reports/word-audit/{AUDIT-SPEC.md, primary-a-l.*, primary-m-z.*, primary-leftover.*, middle-a-c.*, middle-d-i.*,
middle-j-p.*, middle-q-z.*, middle-final.*, middle-abbrev.*, course-7.*, course-89.*, course-fixes.json,
verify-primary.md, verify-middle.md, course-patch-a.md, course-patch-b.md, summary.md}`、
`backend/enrichment/{primary_audit_*.json, middle_audit_*.json}`、`cmd/synccontent/main.go`、
`chuzhong/vocab/{七年级上册,七年级下册,八年级上册,九年级上册,九年级下册}.json`。
