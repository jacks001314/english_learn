# 词库审核记录：middle-a-c（letter A–C）

- 源数据：`backend/middle_school.json`（共 2895 条）
- 切片：`letter ∈ {A,B,C}`，共 **627 条**（源文件 index 1–627，连续）
- 审核方式：逐条审核（`word` / `pos` / `meaning` / `phonetic` / `senses` 全字段），非只查 `flags=`
- 提出修正：**67 条补丁，涉及 66 个条目**（`america` 同时修 `meaning` 与 `pos`；`at the beginning of phr. …` 修 `word`）
- confidence 分布：high 52 / medium 14 / low 1
- 校验：`python scripts/word-audit/checkpatch.py --source backend/middle_school.json --patch reports/word-audit/middle-a-c.json` → **OK: 67 条修正全部通过校验**
- 边界遵守：未改 `id`，未新增/删除/合并条目，未改例句与例句翻译，未写 `backend/` 任何文件

## E 编号分布（一条补丁可含多个编号，按出现次数统计）

| 编号 | 次数 | 本切片典型样例 |
|---|---|---|
| E1 | 39 | `ability` `能力；才能 p.6`、`burial` `埋葬；安葬 p.62`、`crispy` `脆的；酥脆的 p.45` |
| E2 | 8 | `apple` `苹果then /ðen/ adv. 那么`、`clara` `/klerə/ 克拉拉（女名）p.10`、`around` `the world世界各地`、`bring good luck` `to…给……带来好运` |
| E3 | 18 | `also` `ad. v.也；而且`、`can` `aux 能,可以,会`、`before` `conj在…以前ad v.以前`、`centre` `(center ['sentə]) n 中心` |
| E4 | 1 | `burn` `(burnt /bə:(r)nt/, burned /;burnt, burned) 着火；燃烧` → `着火；燃烧` |
| E5 | 1 | `at the beginning of phr. …`（word 字段）→ `at the beginning of` |
| E6 | 0 | 本切片 word 字段未发现拼写错误（`cen.ter`、`blow(blew` 等噪声只在 `id`，见 uncertain） |
| E7 | 7 | `basketball` `蓝球`、`chips` `炸士豆儿条`、`america` `美国人(的)`、`crow` `拥挤`、`better` `(goo或well的比较级)`、`criminal` `犯罪`、`amaze` 释义截断 |
| E8 | 2 | `america` `n & adj` → `n.`；`another` `adj&conj` → `adj & pron` |
| E9 | 0 | 本切片释义中无 `\(`/`\)` 类转义残留（全文扫描 0 命中） |

补充：`phonetic` 字段 627 条全部已填、无页码/他词混入等明显污染，未改动。

## 修正清单摘要（按字段）

- `meaning`：65 条（主体是 E1 页码剥离，以及 E2/E3 的英文/词性/音标残片清理）
- `word`：1 条（`at the beginning of phr. …`，仅清词形噪声，id 不变）
- `pos`：2 条（`america`、`another`）

## uncertain 清单（需主控裁决）

| # | id (index) | 观察到的问题 | 建议处理 |
|---|---|---|---|
| 1 | `as soon as` (152) / `as soon as conj` (153) | word 与 pos 完全相同，重复条目；后者 id 尾部残留 ` conj` | 保留一条、删除一条；id 噪声统一清理 |
| 2 | `blow` (312) / `blow(blew` (314) | 重复条目；i=314 的 id 残留未闭合括号，word 字段已为 `blow` | 合并为一条，id 需主控修正 |
| 3 | `clean` (495) / `clean.` (497) | 重复条目；i=497 的 id 残留句点 | 合并为一条，id 需主控修正 |
| 4 | `correct` (582) | `pos=adj` 与 `meaning=改正` 互相矛盾，必有一处错；无法判断以哪一侧为准 | 二选一：meaning 改 `正确的` 或 pos 改 `v.` |
| 5 | `around` (141) | 释义 `the world世界各地` 把 `around the world` 的释义并入 `around`；本次已按 E2 剥离残片得 `世界各地`（low），但 `around` 单条更通行释义为 `在周围；大约` | 确认该条应保留的词义（是否另有 `around the world` 条目） |
| 6 | `chiang mai` (470) | 中文 `清迈（泰城市）` 中 `泰城市` 疑为 `泰国城市` 截断；本次只剥离音标（E2） | 是否补齐中文 |
| 7 | `amaze` (101) | 释义 `使惊` 截断不成词，已按 `使惊奇` 补全（medium） | 复核原始来源表述 |
| 8 | `children` (474) / `aren't` (136) / `can't` (404) | 释义为变形/缩写说明（`child的复数形式`、`are not 的缩写形式`），无独立中文释义，形式上落入 E4 | 教材词表通行做法，本次未改，请示是否统一补中文 |
| 9 | id 噪声（word 字段正常，禁止改 id） | `cen.ter`(440)、`american adj`(104)、`as...as conj`(157)、`at the beginning of phr. …`(179)、`best-seller n`(287)、`both…and… phr. ...`(335)、`bus station n`(372)、`blow(blew`(314，见 #2)、`coral reef n`(579)、`credit card n`(605)、`come along come along`(531)、`base on`(220, word=`be based on`)、`charles`(456, word=`Charles Dickens`)、`chelsea`(467, word=`Chelsea Lanmon`)、`boarding`(318, word=`boarding school`)、`congratulation`(565, word=`congratulations`) | 建议主控在 enrichment 通道统一规范 id（本切片不动 id） |
| 10 | `crow` (612) / `criminal` (607) | 已按 E7 分别改为 `(公鸡)打鸣；啼叫` / `罪犯`（medium），另一可能是原条目其实想收 `crowd` / `criminal adj.` | 复核词表来源 |

## 未修（保持原样）的判定说明

- 标点/分隔风格差异（`；` vs `,`、全半角括号、`……` vs `...`）——按 AUDIT-SPEC 第 2 节不修；
- `pos` 写法差异（`n.` / `n` / `phr.` / `n. phr.` / `modal v.`）——不修；
- 释义详略差异——如 `bridge` 只收 `桥牌`、`country` 只收 `乡村,郊外`、`composition` `作文作品`、`boot` `长统鞋`，均非错误，未改。
