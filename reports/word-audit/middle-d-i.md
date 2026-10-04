# 词库审核记录：切片 middle-d-i

- 切片范围：`backend/middle_school.json` 中 `letter` 为 **D–I** 的条目
- 审核条目数：**715 条**（逐条全量审核，含 `senses` 字段与 `flags=` 未命中的条目）
- 提出修正：**80 条**（均为 `field=meaning`，无 `word` / `pos` / `phonetic` 改动）
- 产物：`reports/word-audit/middle-d-i.json`（补丁清单）、本文件
- 校验：`python scripts/word-audit/checkpatch.py --source backend/middle_school.json --patch reports/word-audit/middle-d-i.json` → **OK: 80 条修正全部通过校验**

## 1. E 编号分布

按「判定编号是否涉及该条」统计（同一条可涉及多个编号）：

| 编号 | 情形 | 涉及条数 |
|---|---|---|
| E1 | 释义残留教材页码（`p.14` / `p.3` / `P.34` …） | 27 |
| E2 | 释义混入相邻词条 / 音标文本 | 4 |
| E3 | 释义残留词性标记、编号噪声（`um.` `a.` `adv.` `n.` `v.` `i.` 及空白/标点噪声） | 48 |
| E7 | 词义与词形不对应（词义错位/错别字/无关义项） | 4 |
| E9 | 释义含排版转义残留（`\`、`.`) | 4 |
| 合计（修正记录） | | **80** |

置信度：`high` 72 条，`medium` 8 条（643 / 760 / 784 / 1033 / 1161 / 1196 / 1255 / 1338），无 `low`。

E1 明细（27 条）：640 dead、684 direct、695 discover、707 divide ... into、763 earthquake、765 east、792 emily、798 enemy、799 energy、819 even though、855 express、856 expression、865 faithfully、871 fall in love with、890 fascinating、967 fork、977 france、984 fridge、1005 garden、1013 germany、1048 glass、1087 grammar、1096 grass、1121 halloween、1127 handbag、1302 increase、1327 introduction。

E2 明细（4 条）：700 dish（尾部串入 `dishes`）、977 france（释义前混入音标 `/fr{ns/`）、1091 grandmother（串入 `grandfather /'grænfa:ðə/ n. (外)祖父；爷爷`）、1092 grandpa（串入 `mom /mɔm/, /ma:m/ n. (=mum)妈妈`）。

E7 明细（4 条）：745 drum `喇叭`→`鼓`、784 elder `年级较长`→`年纪较长`、850 experience `信任；经历`→`经验；经历`、1161 have a try `尝试；努力；射击`→`尝试；试一试`。

E9 明细（4 条，均与 E3 并存）：653 degree `（.大学）`、835 examine `（.仔细地）`、919 fin `（.鱼）`、1338 italian `意大利\人的；n. 意大利人\语`。

## 2. 未改动（符合 AUDIT-SPEC 第 2 节「不修」）

- 标点/分隔风格差异：`；`/`,`、`……`/`...`、全角/半角括号（如 782 `或者...或者`、993 `从......到`）。
- 括号内变形/用法说明：648 `decide to do sth.`、669 `keep a diary`、955 `(pl.feet)`、1143 `(动词have的单数第三人称)`、1178 等，保留。
- 释义详略差异与词性写法差异（`n` / `n.` / `phr.` / `v. phr.`）不在判定范围内。
- 音标本次不重做；本切片未发现音标页码/串条污染，故无音标类修正。

## 3. uncertain 清单（需主控裁决）

### 3.1 重复条目（`duplicate_word`，按规范只上报、不增删合并）

| 词形 | 涉及 index / id | 说明 |
|---|---|---|
| dance | 630 `dan.ce`、631 `dance` | 同词形同释义（`跳舞`/`跳舞；舞蹈`），建议保留一条 |
| drink | 737 `drin.k`、738 `drink` | 同上（`喝；饮料` / `饮料 喝`） |
| even though | 819 `even though`、820 `even though conj`、821 `even though（=even if）` | 三条同词形，释义均为「即使；虽然」 |
| halfway | 1118 `half-way adv`、1119 `halfway` | 同词形，建议合并 |
| hard-working | 1136、1137 `hard-working adj` | 释义「勤勉的；努力工作的」/「勤奋的；用功的」 |
| have a cold | 1149、1150 `have a cold phr. (` | 完全同词形同释义 |
| have a good time | 1154、1156 `have a good time=enjoy oneself=have fun(doing sth.)` | 同词形 |
| hear | 1176 `hear`、1178 `hear(heard）` | 同词形 |
| high school | 1201、1202 `high school n` | 同词形同释义 |
| how are you? | 1240 `how are you?`、1241 `how are you？` | 仅问号全半角不同 |
| from... to... | 993 `from... to...`、994 `from…to… phr. …` | 近似重复（省略号写法不同） |
| ice cream / ice-cream | 1265 `ice cream n`、1266 `ice-cream` | 变体，非严格重复 |
| favorite / favourite | 895、896 | 英美变体，非严格重复 |

### 3.2 `id` 字段残留 OCR 碎片（硬性禁令：不得改 id，仅上报）

本切片共 **45 条** 的 `id` 含词性后缀、未闭合括号、`.` 断字或全角符号，例如
`dvd n`(753)、`feel free （`(904)、`go off （`(1058)、`go shopping phr. (`(1064)、`have a cold phr. (`(1150)、
`have a good time=enjoy oneself=have fun(doing sth.)`(1156)、`hear(heard）`(1178)、`half-way adv`(1118)、
`dan.ce`(630)、`drin.k`(737)、`humorou`(1253)、`get a surpris`(1015)、`i'm i am`(1263)、`how old...? ....`(1247)、
`from…to… phr. …`(994) 等。均**未改动**，建议主控统一核对 id 生成规则（`id` 与 `word` 不一致会影响 enrichment 补丁匹配）。

### 3.3 疑似错义但把握不足（未改，建议复核）

| index / id | 观察 | 建议 |
|---|---|---|
| 679 `digital` | 释义「数字似的」，通行释义为「数字的；数码的」 | 建议改为「数字的；数码的（E7）」 |
| 997 `frustrate` | 释义「使沮丧，使失败」，通行释义为「使沮丧；挫败」 | 建议「使失败」→「挫败」 |
| 1067 `go wrong` | 释义「走错路」，通行释义为「出毛病；（事情）变糟」 | 保留原样待确认（教材释义可能是「走错路」） |
| 1119 `halfway` | 释义「中途的；半路地」（已按 E3 去除 `adv.`），形容词/副词表述混杂 | 建议统一为「半路地；中途」 |
| 778 `eighteenth` | `pos=n`，而同组 776/777/779 均为 `num` | 建议 `pos` 统一为 `num`（E8，把握不足未改） |
| 1178 `hear(heard）` | 释义「听到；听见」正常，但 `word` 为 `hear`、`id` 含变形残片 | 同 3.2，随 id 一并核对 |

### 3.4 音标（未达「明显污染」门槛，仅记录）

1286 `in front of` 音标仅 `/ɪn/`、1054 `go boating` 仅 `/gəʊ/`、1029 `get to` 为 `/gettu:/`（缺空格）——均未混入页码或他条内容，按规范不改。

## 4. 复核命令

```powershell
python scripts/word-audit/slice.py --source backend/middle_school.json --letters "D-I" --out .tmp/audit/middle-d-i.txt
python scripts/word-audit/checkpatch.py --source backend/middle_school.json --patch reports/word-audit/middle-d-i.json
# → OK: 80 条修正全部通过校验（source=backend/middle_school.json）
```
