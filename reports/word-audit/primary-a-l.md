# primary-a-l 切片审核记录

- 源文件：`backend/primary_school.json`（共 1331 条）
- 切片：`letter` ∈ {`#`, `A`–`L`}，共 **654 条**（`python scripts/word-audit/slice.py --source backend/primary_school.json --letters "#,A-L" --out .tmp/audit/primary-a-l.txt`）
- 逐条审核：**654 / 654**；除 `word/pos/meaning` 外，同时查看了 71 条 `senses` 义项、649 条 `example` / `exampleTranslation`（例句不改，仅用于判断词义）。
- 提出修正：**60 条**（`meaning` 56 条、`word` 4 条），覆盖 60 个条目，未改 `id`，未新增/删除/合并条目。
- 自查：`python scripts/word-audit/checkpatch.py --source backend/primary_school.json --patch reports/word-audit/primary-a-l.json` → **OK: 60 条修正全部通过校验**。

## 1. E 编号分布

| E 编号 | 条数 | 说明 | 代表 id |
|---|---|---|---|
| E1 释义残留教材页码 | 0 | 本切片无命中 | — |
| E2 释义混入相邻词条/音标/例句文本 | 15 | 14 条为「短语被截断」留下的英文残片 + 1 条例句文本 | `a`、`art`、`be`、`kung`、`lots`、`i would like to` |
| E3 释义残留词性标记/编号/标点/重复噪声 | 27 | `a.` `vi.` `vt.` `adj.` 前缀 8 条、编号噪声 2 条、尾部句点 13 条、分隔符缺失 3 条、叠字 1 条 | `english`、`end`、`however`、`fish`、`good` |
| E4 释义无中文（仅变形说明） | 1 | `leave` → `(过去式left[left])` | `leave` |
| E5 词形混入标点/残片 | 2 | | `go tothe cinema`、`look .out` |
| E6 词形拼写错误 | 2 | | `good bay`(bay→bye)、`china`(→China) |
| E7 词义与词形不对应 | 4 | | `cool`、`hair`、`light`、`come` |
| E8 `pos` 与词义矛盾 | 1 | `n. phr.` 配动词短语释义 | `english songs` |
| E9 释义含转义残留 | 8 | `\(`、`\)`、`\.\.\.` | `at`、`before`、`children`、`cousin`、`dollar`、`eleventh`、`grandmother`、`him` |
| **合计** | **60** | high 34 / medium 26 | |

按置信度：`high` 34 条，`medium` 26 条（medium 集中在「释义尾部句点」「缺分隔符」「词义边界判断」等风格/语义边界项）。

## 2. uncertain 清单（需主控裁决，本次未改或仅作最小改动）

### 2.1 词形被截断的重复行（14 条，最重要）
观察：这些行的 `word` 是多词短语的**首词/片段**，`meaning` = 「短语剩余部分 + 该短语的中文释义」，且切片内存在同短语的完整条目（或疑似缺失完整条目）。判定为 E2 并只清除了混入的英文残片，**未改 `word`**，因为恢复词形会与相邻完整条目产生 `duplicate_word`（禁令：重复条目只上报、不合并）。

| id | index | word | 原文 meaning | 孪生完整条目 |
|---|---|---|---|---|
| `a` | 7 | a | `few 一些` | `a few` (9) |
| `art` | 50 | art | `room 美术教室` | `art room` (51) |
| `be` | 76 | be | `careful 小心` | `be careful` (77) |
| `dining` | 250 | dining | `hall 饭厅` | `dining hall` (251) |
| `doing` | 267 | doing | `morning exercises 正在晨练` | `doing morning exercises` (268) |
| `easter` | 296 | Easter | `party 复活节派对` | 无（疑似应为 `Easter party`） |
| `eating` | 301 | eating | `breakfast 正在吃早饭` | 无（疑似应为 `eating breakfast`） |
| `had` | 473 | had | `a cold 感冒` | `had a cold` (474) |
| `keep` | 583 | keep | `your desk clean 保持你的桌面整洁` | `keep your desk clean` (585) |
| `kung` | 598 | kung | `fu 功夫；武术` | `kung fu` (599) |
| `labour` | 600 | Labour | `Day 劳动节` | `Labour Day` (601) |
| `listening` | 626 | listening | `to music 正在听音乐` | `listening to music` (627) |
| `living` | 631 | living | `room 客厅；起居室` | `living room` (632) |
| `lots` | 647 | lots | `of 大量；许多` | `lots of` (648) |

建议处理方式（任选其一，需主控定夺）：① 恢复 `word` 为完整短语并删除孪生行（合并类操作，超出本切片权限）；② 保留本行，把 `meaning` 改为该首词自身的独立释义（如 `a`→`一（个）`、`be`→`是`、`come`…）；③ 由主控删除这些碎片行。当前补丁只做了「去掉混入的英文残片」，`a`/`be`/`easter`/`eating` 因此置信度记为 medium。
同一模式在**其他切片**也存在（全表扫描发现）：`make`(`a snowman 堆雪人`, 656)、`maths`(`test 数学测试`, 669)、`own`(`a. 自己的`, 783)、`reading`(`a book 正在看书`, 885)、`salty`(`a. 咸的`, 916)、`third`(`a. 第三的`, 1141)——其中 783/916/1141 属 E3 词性前缀，其余属同一「截断」模式，提请 M–Z 审核员与主控注意。

### 2.2 `id` 字段污染（严禁改 id，仅上报）
| index | id | word | 问题 |
|---|---|---|---|
| 420 | `fɑ:ðə ] (` | grandfather | id 为乱码残片；且与 index 461（id=`grandfather`）词形重复 |
| 522 | `his friend is a tall, slim girl with a straight nose` | tall and slim | id 是整句课文残片 |
| 523 | `his friend is a tall, slim girl with a straight nose.` | straight nose | 同上，且尾部多 `.` |
| 541 | `however hot it is, he will not take off his coat` | however hot it is | id 是整句课文残片 |
| 542 | `however hot it is, he will not take off his coat.` | take off one's coat | 同上；`word/meaning/pos` 本身正常，未改动 |

### 2.3 音标明显污染（本次不重做音标，仅上报）
- `clean the room` (174) `/kli:nrum'mju:zik/` —— 混入 `music`（别的词条）。
- `do an experiment` (258) `/æniks'periməntli:vz/`、`collect leaves` (197) `/kə'lektli:vz/` —— 混入 `leaves`。
- `grass` (467) `/ grAs/` —— 非音标字符（ASCII `As`）＋前导空格。
- `air` (26) `/єə/`、`air-conditioner` (27) `/ɛə/` —— 异常字符，且 air-conditioner 只录了首词。
- 多词条只录了首词音标（如 40 `answer the phone`、63 `baby brother`、161 `Chinese book`、322 `English book`、395 `football player`、407 `French fries`、475 `hair`），属系统性省略，建议主控统一批次处理。

### 2.4 判定为「不修」的风格项（保持原样）
- 19 条 `X—Y` 变形对照条（`big—bigger`、`buy—bought`、`eat—ate`…）与 `aren't = are not`：全表一致的词形风格，非污染。
- `chopstick(s)`、`leaf (leaves)`、`fifth (5th)`、`first (1st)`、`fourth (4th)`、`cm(centimeter)`、`kg(kilogram)`、6 条括号星期缩写 `(Fri.)`…`(Tue.)`：变体/缩写写法。
- `（过去式X）` / `(X的过去式)` 类变形说明（56、111、129、179、214、219、234、298、361、362、388、423、425、436、486、609、611、613、620、630、652）：E4 允许保留变形说明，且均已有中文义项。
- `go shopping`(445) `购物 买东西`（空格分隔）、`come from`(203) `来自…….;从………来`（标点混杂）、`above`/`behind`/`between`/`in` 的 `在…… 上面`（省略号后空格）等：按规范第 2 节「标点/分隔风格差异」保持原样。

### 2.5 已修正但属语义边界的项（若主控认为属「释义详略差异」可回退）
`hair`(475) `长头发`→`头发`；`light`(622) `灯；管灯`→`光；灯`（`senses` 为「光；灯」）；`come`(202) `快；加油`→`来；来到`；`china`(159) `china`→`China`；`english songs`(324) `唱英文歌曲`→`英文歌曲`；13 条释义尾部句点清理（`a little`、`another`、`baby`、`big`、`breakfast`、`eleven`、`fish`、`from`、`goal`、`have a headache`、`lock` 及 `do`、`laugh at` 中的句点串）。

## 3. 方法与自查
- 逐条人工通读全部 654 条（`.tmp/audit/primary-a-l.txt`，另用脚本展开 `senses` 逐行审阅），不限于 `flags=` 命中的 78 条；`come`、`cool`、`hair`、`light`、`english songs` 等属未命中 flags 但人工发现的语义错误。
- 交叉校验：把 `meaning` 的分项与 `senses` 义项比对，发现并修正 `cool`、`light` 两处义项矛盾。
- `old` 值全部由脚本按 `id` 从源文件回填，保证逐字一致；`field=word` 的旧值取 `word` 字段原文。
