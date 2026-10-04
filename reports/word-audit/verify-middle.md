# middle 词库独立复核报告

- 复核者：`swarm-verify-middle`（独立节点，只读源数据，只写本文件）
- 复核对象：`reports/word-audit/middle-a-c.json`、`middle-d-i.json`、`middle-j-p.json`、`middle-q-z.json`
- 基线数据：`backend/middle_school.json`（2895 条，只读）
- 判定口径：`reports/word-audit/AUDIT-SPEC.md`（E1–E9 + 禁令）
- 时间：2026-09-30

**一分钟结论**：298 个被改条目的 `old` 与源数据**逐字一致（0 处不符）**，抽查 200 条未修正条目只命中 1 处遗留错误——清单本身是干净的、机械的、可安全落地的；真正的风险不在"改错"，而在**该改没改**：同一错误类别只改了一半（E4 类 11 条、E3 类 2 条），以及 2 条改法自相矛盾的条目（`crow`、`around`）。

---

## 1. 逐条复核（299/299 行，100% 覆盖）

| 文件 | 条数 | 字段分布 | confidence |
|---|---|---|---|
| middle-a-c.json | 67 | meaning 64 / pos 2 / word 1 | high 52, medium 14, low 1 |
| middle-d-i.json | 80 | meaning 80 | high 72, medium 8 |
| middle-j-p.json | 68 | meaning 68 | high 60, medium 8 |
| middle-q-z.json | 84 | meaning 79 / pos 4 / word 1 | high 70, medium 14 |
| **合计** | **299 行 / 298 个唯一 id**（`america` 有 meaning+pos 两行） | meaning 291 / pos 6 / word 2 | high 254, medium 44, low 1 |

覆盖情况：**四份清单全部逐条复核**（不止"d-i 至少 50%"的下限）。复核方式：按 `id` 在 `backend/middle_school.json` 定位（顺带校验 1-based `index`），逐字比对 `old`，再按 E1–E9 与禁令判断 `new` 是否正确、是否删掉必要义项、是否改坏教材特有意义。

### 1.1 机械校验（可复现）

```
$ python3 -c "import json,glob;src=json.load(open('backend/middle_school.json'));byid={e['id']:e for e in src};... "
patch rows = 299 | unique ids = 298
old/index 逐字比对不符 = 0 []
```

- `id` 全部存在于源数据，**0 个找不到**；
- `index` 与源数据 1-based 序号**全部一致**；
- `old` 与当前文件中的对应字段**逐字一致（0 处不符）**——清单可直接喂给 enrichment 补丁通道，不会被打回；
- 不存在同一 `id` 同一 `field` 的重复行。

### 1.2 裁定结果：agree 297 / disagree 2

**disagree #1 — `crow`（`reports/word-audit/middle-a-c.json`，index 612，字段 meaning，confidence medium）**

- 源数据：【F:backend/middle_school.json†L7872-L7880】`{"example": "A crow landed on the old wall.", "exampleTranslation": "一只乌鸦落在旧墙上。", ..., "meaning": "拥挤", "pos": "v", "topic": "动物", "word": "crow"}`
- 补丁：`拥挤` → `(公鸡)打鸣；啼叫`
- 问题：源 `拥挤` 确实错（属 `crowd`，E7 成立），但 `new` 只取动词义 `(公鸡)打鸣；啼叫`，与该词条**自带的例句/译文（一只乌鸦）与 `topic=动物` 直接冲突**；`crow` 在初中教材中最常见的义项是名词 `乌鸦`，且补丁没有同步修 `pos`（仍为 `v`）。
- 建议：`new` → `乌鸦；(公鸡)打鸣；啼叫`，`pos` → `n. & v.`（若保守，至少保留 `乌鸦`）。

**disagree #2 — `around`（`reports/word-audit/middle-a-c.json`，index 141，字段 meaning，confidence low）**

- 源数据：【F:backend/middle_school.json†L1796-L1804】`{"example": "People around the world use the internet.", "exampleTranslation": "世界各地的人们使用互联网。", "id": "around", "meaning": "the world世界各地", "pos": "adv", "word": "around"}`
- 补丁：`the world世界各地` → `世界各地`
- 问题：清理英文残片的方向对（E2 成立，作者自己标了 `low`），但结果是 `word="around"` + `meaning="世界各地"`——`世界各地` 是**短语 around the world** 的释义（正与例句一致），不是 headword `around`（= 在周围/附近/到处）的释义，条目落到"词形与词义不对应"（E7）状态；全库不存在 `around the world` 条目（已核）。
- 建议：`field=word`，`new` → `around the world`（`id` 按禁令 1 保持 `around` 不动）；若不想动 `word`，则 `meaning` 应为 `在周围；在附近；到处`。

### 1.3 判定为 agree、但补丁有"信息丢失/推测值"的条目（不影响 agree，供主控取舍）

| id | index | 补丁 | 备注 |
|---|---|---|---|
| burn | 370 | `(burnt /bə:(r)nt/, burned /;burnt, burned) 着火；燃烧` → `着火；燃烧` | 清掉污染音标是对的，但把不规则变形说明 `(burnt, burned)` 一并删掉；E4 明确允许"变形说明保留在括号里"，建议 `着火；燃烧（过去式 burnt/burned）` |
| pool | 1957 | `（复数pools） 游 泳池` → `游泳池` | 一并删掉复数标记 `（复数pools）` |
| potato | 1973 | `pl.potatoes 马铃薯;土豆` → `马铃薯;土豆` | 一并删掉 `pl.potatoes` |
| criminal | 607 | `犯罪` → `罪犯` | 与例句（警察抓住了罪犯）一致、pos=n 也对；但原 `犯罪` 疑为 `犯罪的` 截断，形容词义 `犯罪的` 未保留 |
| uncle | 2701 | `舅父；叔父；伯父；姑父；舅父` → `…；姑父；姨父` | 用推测值 `姨父` 替换重复的 `舅父`（原义项重复是事实），属合理但非源文可证的改写 |
| trip | 2665 | `over phr. (被...)绊倒` → `旅行；旅程；绊倒` | `旅行；旅程` 为按词形/例句补出的合成值；方向正确（E7），但需主控确认 |
| plan / english / fun | 1925 / 802 / 1001 | 合并后出现重复义项（如 `计划；方法；打算；计划`、`英语；英格兰的；英语的`） | 仅风格问题，可顺手去重 |

---

## 2. 抽样找遗漏（seed=20260930，200 条未修正条目）

**抽样方法（固定、可复现）**：先取"未被任何补丁触及"的条目池（`id` 不在四份清单中），共 **2597 条**；再 `random.seed(20260930)`、`random.sample(pool, 200)`，最后按源文件顺序排序输出，逐条人读。

```
$ python3 -c "
import json,glob,random
src=json.load(open('backend/middle_school.json'))
patched={p['id'] for f in glob.glob('reports/word-audit/middle-*.json') for p in json.load(open(f))}
un=[(i,e) for i,e in enumerate(src,1) if e['id'] not in patched]
random.seed(20260930); samp=sorted(random.sample(un,200),key=lambda t:t[0])
for i,e in samp: print(i, e['id'], '|', e['word'], '|', e['meaning'], '|', e['pos'])"
pool = 2597 | sampled = 200
```

**逐条人读结果：命中 1 条明显错误**

| id | index | 字段 | 现文 | 建议 | 类别 |
|---|---|---|---|---|---|
| cross | 610 | meaning | `十字形(物),十字记号 v穿过,越过` | `十字形(物)；十字记号；穿过；越过`（并建议 `pos` → `n. & v.`） | E3 释义内残留词性残片 `v` |

抽样池整体质量良好：200 条中 199 条 `word`/`meaning`/`pos` 无拼写或词义错误，未发现相邻条目串入、`p.xx` 页码残留、词性残片（除上述 `cross`）或错别字；高频"疑似"项（如 `Englishman`、`pl.feet`、`(they的宾格)`、`比较级/最高级` 说明）经人工确认均属规范写法，不是错误。

---

## 3. 全库同类错误扫描（不只抽样：2895 条全覆盖的交叉验证）

为避免"抽样撞不上"的偶然性，我对全库逐条跑了与 E1–E9 对应的检测式（只读、可复现），**命中即遗漏**：

| 类别 | 全库命中 | 已被清单覆盖 | **未修正（遗漏）** |
|---|---|---|---|
| E1 释义残留页码（`p.6`/`P.34`/`p.22`…） | 121 | **121（100%）** | **0** ✅ |
| E9 释义排版转义 `\` | 1 | 1（`italian`） | **0** ✅ |
| E5 真词形残片（`word` 内 `phr.`/前括号/尾部点/数字） | 2（`at the beginning of phr. …`、`USA n`） | **2（100%）** | **0** ✅ |
| E5 风格类（`word` 里 `…` vs `...`、`Mr.`/`P.E.` 的点、`ask... for...` 省略号） | 41 | 0（按 spec §2 不该改） | 不算遗漏 |
| E3 释义内词性/编号残片（`um`、`aux`、`n.`、`v.`…） | 70 | 68 | **2**（`cross`、`scrooge`） |
| E2 释义混入音标 | 15 | 14 | **1**（`broke`，含 `[breik]`；其余 14 条已在清单里） |
| E4 释义只有变形/缩写说明 | 11 | 0（同类已修 8 条） | **11** |
| E8 `pos` 与词形/词义矛盾 | 7 | 6 | **1**（`eighteenth`，`pos=n`，同类序数词均为 `num`） |

补充核验：121 条页码残留条目**全部**有对应的 `meaning` 补丁，且补丁 `new` 值中**不再含页码残片**（0 例外）——E1 这一路是真清零。

### 3.1 E4 类遗漏（11 条，与已修的 `let's`/`no`/`was`/`were`/`went`/`women`/`overcome`/`shelf` 同类）

清单里已经把 `let's`（`let us 的缩写形式` → `让我们……（let us 的缩写形式）`）、`no`、`women`、`was`、`were`、`went`、`overcome`、`shelf` 当作 E4 修了，但**同类的缩写/变形条目一条没动**：

| id | index | 字段 | 现文 | 建议 |
|---|---|---|---|---|
| aren't | 136 | meaning | `are not 的缩写形式` | `不是（are not 的缩写形式）` |
| can't | 404 | meaning | `can not 的缩写形式` | `不能；不可以（cannot 的缩写形式）` |
| children | 474 | meaning | `child的复数形式` | `孩子们（child 的复数形式）` |
| don't | 722 | meaning | `do not 的缩写形式` | `不（do not 的缩写形式）` |
| goes | 1072 | meaning | `go的单数第三人称现在时` | `去（go 的单数第三人称现在时）` |
| I'll | 1262 | meaning | `I will 的缩写形式` | `我将……（I will 的缩写形式）` |
| I'm | 1263 | meaning | `I am的缩写` | `我是（I am 的缩写）` |
| isn't | 1335 | meaning | `is not 的缩写形式` | `不是（is not 的缩写形式）` |
| it's | 1337 | meaning | `it is 的缩写形式` | `它是（it is 的缩写形式）` |
| there's | 2581 | meaning | `there is 的缩写形式` | `有（there is 的缩写形式）` |
| what's | 2806 | meaning | `what is 的缩写形式` | `是什么（what is 的缩写形式）` |

> 注：`let's`(1460)、`no`(1723)、`women`(2846) 在同一批被修，其余 11 条未修——这是"标准不一致"，不是口径差异。若主控认定 E4 不涵盖此类（严格读法：这些释义里含中文"的缩写形式"），则应把 `let's`/`no` 等 8 条补丁一并撤下；两者只能取一。

### 3.2 其余遗漏明细（含建议）

| 类别 | id | index | 字段 | 现文 | 建议 |
|---|---|---|---|---|---|
| E3 | cross | 610 | meaning | `十字形(物),十字记号 v穿过,越过` | `十字形(物)；十字记号；穿过；越过`；`pos` → `n. & v.` |
| E3 | scrooge | 2195 | meaning | `斯克鲁奇n.（非正式）吝啬鬼` | `斯克鲁奇（非正式）吝啬鬼`（`pos` 建议 `n.`） |
| E2 | broke | 360 | meaning | `(动词break[breik]的过去时)折断;打破` | `（动词 break 的过去时）折断；打破`（去掉 `[breik]`） |
| E8 | eighteenth | 778 | pos | `n`（该条目 meaning 已在清单里修过） | `num`（同批 `eighth`/`seventh` 均为 `num`） |
| 音标（spec §2 → uncertain） | america | 103 | phonetic | `/ə'merikən/`（属 American） | 词条为 `America`，建议改 `/ə'merɪkə/` 或记入 uncertain |
| id/word 语义错位 | steal(stole | 2397 | word | `stole`，meaning=`steal 的过去式；偷窃了` | id 含 `steal`、word=`stole`，请主控确认该条应保留 `steal` 还是 `stole` |
| 的/地 | differently | 675 | meaning | `不同的`（`pos=adv`） | `不同地`（与已修的 `quickly` 同类） |
| 的/地 | alone | 93 | meaning | `独自的,单独的`（`pos=adv`） | `独自地；单独地`（weak） |

### 3.3 重复词条（35 组 / 37 行多余）——spec 要求走 `uncertain`，补丁清单里 0 条

`as soon as`(152,153)、`blow`(312,314)、`clean`(495,497)、`dance`(630,631)、`drink`(737,738)、`even though`(819,820,821)、`halfway`(1118,1119)、`hard-working`(1136,1137)、`have a cold`(1149,1150)、`have a good time`(1154,1156)、`hear`(1176,1178)、`high school`(1201,1202)、`how are you?`(1240,1241)、`join`(1362,1363)、`lend`(1453,1454)、`let's`(1460,1461)、`living room`(1488,1489,1490)、`middle school`(1614,1615)、`nothing`(1749,1750)、`o'clock`(1759,1760)、`ok`(1775,1776)、`on`(1779,1984)、`paint`(1838,1840)、`pay`(1874,1875)、`pencil box`(1887,1888)、`post office`(1968,1969)、`put on`(2035,2036)、`shoot`(2249,2250)、`sing`(2279,2281)、`speak`(2362,2364)、`sunshine`(2445,2450)、`take off`(2488,2489)、`telephone`(2533,2534)、`weekend`(2790,2791)、`what about...?`(2804,2805)。

其中最典型的是"**同一单词的正常条目 + 一个 `id` 被污染的历史副本**"（如 `dance`/`dan.ce`、`drink`/`drin.k`、`paint`/`pain.t`、`sing`/`sin.g`、`clean`/`clean.`、`weekend`/`weekend.`）——这些 `word` 字段本身是正确的，脏东西在 `id` 字段（禁令 1 不可改），因此**不能在本次修**，但按 spec 必须进 `uncertain` 交主控裁决，而四份补丁清单里没有任何一条相关记录。

附带发现：全库 **104 条** 的 `id` 字段含 `phr.`/`…`/前括号/尾点/内嵌点等残片，**117 条** 的 `id` 规范化后与 `word` 不一致（如 `blow(blew`、`o'clock (=of the clock) ad. v`、`speak spiːk]`、`the uk（`）。这不影响学生看到的内容，但请主控注意 enrichment 是按 `id` 匹配的（`id` 一旦被后续清洗，补丁会失配）。

### 3.4 弱信号（spec §2 明确"释义详略差异不修"，仅供主控参考，不计入遗漏）

- `story`(2415) `（房屋的）层`：缺初中核心义"故事"；`why`(2824) `pos=int`、释义只有"嗨"：缺 adv. "为什么"；`like`(1477) 只有 prep. "像"：缺 v. "喜欢"；`one`(1792) `pos="num & pron"` 但释义只写代词用法；`by`(381) 只写"乘车(船等)"。以上按 §2 属"详略差异"，本次不算错，但作为面向初中生的词表建议补全。
- `broke`(360)、`born`(330)、`has`(1143)、`lost`(1510)、`most`(1656) 等把语法说明写在释义里（含 `(动词bear的过去分词)` 之类），风格不统一但不算错。

---

## 4. 三条最高风险项：可复现命令与输出

**① `crow` 改法自相矛盾（disagree，最高优先）**

```
$ python3 -c "
import json; s=json.load(open('backend/middle_school.json'))
e=[x for x in s if x['id']=='crow'][0]; print(json.dumps(e,ensure_ascii=False))
p=[x for x in json.load(open('reports/word-audit/middle-a-c.json')) if x['id']=='crow'][0]; print('PATCH:',json.dumps(p,ensure_ascii=False))"
{"example": "A crow landed on the old wall.", "exampleTranslation": "一只乌鸦落在旧墙上。", "grade": "七年级", "id": "crow", "letter": "C", "meaning": "拥挤", "phonetic": "/krəu/", "pos": "v", "topic": "动物", "unit": "扩展词汇", "word": "crow"}
PATCH: {"id": "crow", "index": 612, "field": "meaning", "old": "拥挤", "new": "(公鸡)打鸣；啼叫", "reason": "释义与词形不对应（'拥挤' 属于 crowd）（E7）", "confidence": "medium"}
```

**② `around` 清理后词形与词义仍不对应（disagree）**

```
$ python3 -c "
import json; s=json.load(open('backend/middle_school.json'))
i=[n for n,x in enumerate(s,1) if x['id']=='around'][0]; print(i, json.dumps(s[i-1],ensure_ascii=False)); print(i+1, json.dumps(s[i],ensure_ascii=False))
p=[x for x in json.load(open('reports/word-audit/middle-a-c.json')) if x['id']=='around'][0]; print('PATCH:',json.dumps(p,ensure_ascii=False))"
141 {"example": "People around the world use the internet.", "exampleTranslation": "世界各地的人们使用互联网。", ..., "id": "around", "meaning": "the world世界各地", "pos": "adv", "word": "around"}
142 {"example": "Please arrive at the station ten minutes early.", ..., "id": "arrive", ...}      # 下一行是 arrive，全库无 "around the world" 条目（见 §3.3 id 与 word 不一致核查）
PATCH: {"id": "around", "index": 141, "field": "meaning", "old": "the world世界各地", "new": "世界各地", "reason": "释义混入相邻词条英文残片 the world（E2）", "confidence": "low"}
```

**③ E4 类"只改一半"（遗漏，最大批量风险）**

```
$ python3 -c "
import json,re; s=json.load(open('backend/middle_school.json'))
for x in s:
  if re.search(r'缩写|复数形式|单数第三人称现在时',x['meaning']) and not re.search(r'[\u4e00-\u9fff]', re.sub(r'(缩写形式?|复数形式|单数第三人称现在时|的|动词)','',x['meaning'])):
    print(x['id'],'|',x['meaning'])"
aren't | are not 的缩写形式
can't | can not 的缩写形式
children | child的复数形式
don't | do not 的缩写形式
goes | go的单数第三人称现在时
i'll | I will 的缩写形式
isn't | is not 的缩写形式
it's | it is 的缩写形式
let's | let us 的缩写形式        <-- 已修（本批补丁）
no | number 的缩写形式            <-- 已修（本批补丁）
there's | there is 的缩写形式
what's | what is 的缩写形式
women | woman的复数形式           <-- 已修（本批补丁）
```
（外加该检测式未覆盖的 `I'm`(1263) `I am的缩写`，人工确认后共 11 条遗漏。）

---

## 5. 结论分级

| 分级 | 结论 |
|---|---|
| **confirmed**（证据充分、可复现） | ① 299 行 `old`/`index` 与源数据**逐字一致，0 处不符**，清单可直接落地；② E1 页码残留 **121 处全库清零**（补丁 `new` 中 0 残留）、E9 清零、E5 真词形残片（`word` 字段）清零；③ `crow`、`around` 两条修改后条目**自相矛盾**（例句/词形与释义打架）；④ `cross`、`scrooge` 的 E3 词性残片仍在；⑤ E4 类 11 条与已修 8 条同类却未修。 |
| **probable** | ① 35 组重复词条未按 spec 写入 `uncertain`（补丁清单里 0 条记录）；② `eighteenth` 的 `pos=n` 应为 `num`，与同批 `eighth`/`seventh` 不一致；③ `broke` 释义残留音标 `[breik]`；④ `differently` 的"的/地"与已修 `quickly` 同类未修。 |
| **weak-signal** | ① `story`/`why`/`like`/`one`/`by` 义项不全（spec §2 保护，不建议本次强改）；② `burn`/`pool`/`potato` 清噪声时连带删掉变形/复数说明；③ `uncle` 的 `姨父`、`trip` 的"旅行；旅程"属推测/合成值；④ `america` 音标仍为 American 的 `/ə'merikən/`；⑤ `steal(stole` 词条 id/word 语义错位。 |

---

## 6. 未覆盖范围与残余不确定性

- **未覆盖**：其他 Agent 的 `middle-*.md`（spec 要求同目录产出的 `uncertain` 记录）不在项目里，我无法核对"重复词条/音标/存疑点"是否已在 `uncertain` 通道上报——本报告中同类结论仅基于四份 JSON 补丁清单，故"遗漏"指的是**补丁清单未覆盖**，不排除作者已写进 `uncertain`。
- **不在本次范围**：`chuzhong/*`、`backend/primary_school.json`、例句/例句翻译/课文正文的润色；音标仅检查"明显污染"，`america` 音标问题按 spec §2 归入 uncertain 而非错误。
- **`id` 字段污染（104 条 / 117 条 id≠word）按禁令 1 不判为错误**，未计入遗漏；但这会削弱后续 enrichment 按 `id` 匹配的稳定性，建议主控单独立项。
- **抽样不确定性**：200/2597（7.7%）抽样只命中 1 处错误，但 §3 的全库扫描把同类漏检概率压到接近 0（E1/E5/E9 已全量核对）；非模式化错误（中文错别字、义项缺失）仍可能存在于未抽中的 2397 条中——我另用 `aspell` 对全部 2858 个 `word` 做了拼写核验，除专名（`Chiang`/`Ellsworth`/`Sato`…）、合成词（`mooncake`/`ropeway`/`kind-hearted`）、词根条目（`prehend`/`-sist-`）、英式拼写（`programme`）与已修的 `phr` 外无真拼写错误。
- **复核者边界**：本报告只写 `reports/word-audit/verify-middle.md`，未修改任何数据文件或他人产物；分析脚本与中间文件均在 `.tmp/`，收尾已删除（正文内联了全部可复现命令）。
