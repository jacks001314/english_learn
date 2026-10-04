# primary（小学词库）修正条目独立复核报告

- 复核人：`swarm-verify-primary`（独立验证 Agent，未参与审核与修正）
- 任务：`task-swarm-word-audit`
- 复核对象：`backend/primary_school.json`（1331 条）相关的 102 条修正
  - `reports/word-audit/primary-a-l.json`（60 条，letter #、A–L）
  - `reports/word-audit/primary-m-z.json`（29 条，letter M–Z）
  - `backend/enrichment/primary_audit_truncated_fix.json`（13 条，主控裁决的行内拆行条目）
- 只读复核：本报告是唯一写入产物，未改动 `backend/`、`reports/word-audit/` 下他人文件、`chuzhong/`。

## 0. 结论摘要

| 项目 | 结果 |
|---|---|
| 逐条复核 | 102 / 102（89 条补丁条目 + 13 条主控裁决条目） |
| agree | 89 |
| disagree | **13**（全部集中在 13 个「行内拆行」id，见 §2） |
| `old` 与源数据逐字一致 | 89 / 89 ✅ |
| 抽样找遗漏 | seed=20260930 从 1242 条未修正条目抽 150 条：**18 条仍有可改进项**，其中 12 条属实质性（word 字段污染 9、音标噪声 2、释义缺中心义 1），6 条属标点风格 |
| 最高风险 | ① 13 个 id 存在**两个批次互相冲突**的 meaning 修正（批次顺序决定最终数据）② word 字段污染族 52 条未修 ③ id 污染 12 条（禁令限制，需主控裁决） |

## 1. 方法与可复现命令

```bash
# 取回输入
# project_fetch: reports/word-audit/primary-a-l.json, reports/word-audit/primary-m-z.json,
#                backend/enrichment/primary_audit_truncated_fix.json, backend/primary_school.json

# ① 逐条对齐 old（89 条）——输出 mismatch: [] 表示 old 与源数据逐字一致
python -c "import json;src=json.load(open('backend/primary_school.json',encoding='utf-8'));idx={str(e['id']):e for e in src};bad=[(i['id'],i['field']) for f in ['reports/word-audit/primary-a-l.json','reports/word-audit/primary-m-z.json'] for i in json.load(open(f,encoding='utf-8')) if idx[str(i['id'])].get(i['field'])!=i['old']];print('mismatch:',bad)"

# ② 两批修正互相冲突检测（见 §2）
python -c "import json;al={i['id']:i['new'] for i in json.load(open('reports/word-audit/primary-a-l.json',encoding='utf-8'))};mz={i['id']:i['new'] for i in json.load(open('reports/word-audit/primary-m-z.json',encoding='utf-8'))};tf={i['id']:i.get('meaning') for i in json.load(open('backend/enrichment/primary_audit_truncated_fix.json',encoding='utf-8'))};print([(k,al.get(k) or mz.get(k),tf[k]) for k in tf if (al.get(k) or mz.get(k)) and (al.get(k) or mz.get(k))!=tf[k]])"

# ③ word 字段含破折号变形对（见 §4.2）
python -c "import json;src=json.load(open('backend/primary_school.json',encoding='utf-8'));print(len([1 for e in src if '—' in e.get('word','')]),[e['word'] for e in src if '—' in e.get('word','')][:5])"
```

## 2. disagree：13 个 id 存在批次冲突（最高风险）

`primary-a-l.json` / `primary-m-z.json` 与 `primary_audit_truncated_fix.json` **对同一 `id` 的同一字段 `meaning` 给出不同值**，最终数据取决于 `cmd/synccontent/main.go` 的 `batches` 顺序（后写者胜）。

| # | id | 源 meaning | a-l / m-z 的新值 | truncated_fix 的新值 | 复核裁定 |
|---|---|---|---|---|---|
| 1 | `a`(7) | `few 一些` | `一些` | `一（用于单数可数名词前）` | **disagree with a-l**：`a` ≠「一些」；「一些」是 `a few`（该条目就在 i=9，已存在）。a-l 的新值语义错误 |
| 2 | `art`(50) | `room 美术教室` | `美术教室` | `美术；艺术` | disagree with a-l：见下方统一理由 |
| 3 | `be`(76) | `careful 小心` | `小心` | `是；成为` | 同上 |
| 4 | `dining`(250) | `hall 饭厅` | `饭厅` | `用餐；进餐` | 同上 |
| 5 | `doing`(267) | `morning exercises 正在晨练` | `正在晨练` | `做；干` | 同上 |
| 6 | `easter`(296) | `party 复活节派对` | `复活节派对` | `复活节` | 同上 |
| 7 | `eating`(301) | `breakfast 正在吃早饭` | `正在吃早饭` | `吃` | 同上 |
| 8 | `had`(473) | `a cold 感冒` | `感冒` | `have 的过去式；有` | 同上 |
| 9 | `keep`(583) | `your desk clean 保持你的桌面整洁` | `保持你的桌面整洁` | `保持；保有` | 同上 |
| 10 | `labour`(600) | `Day 劳动节` | `劳动节` | `劳动；劳工`（另把 word 规范为 `labour`） | 同上 |
| 11 | `listening`(626) | `to music 正在听音乐` | `正在听音乐` | `听；倾听` | 同上 |
| 12 | `living`(631) | `room 客厅；起居室` | `客厅；起居室` | `生活；居住` | 同上 |
| 13 | `reading`(885) | `a book 正在看书` | `正在看书`（m-z 第 10 条） | `阅读；读书` | 同上 |

**统一裁定理由（confirmed）**
1. 这 13 条都是「行内拆行」条目：`word` 是短语首词片段（`dining`、`be`、`reading`…），`meaning` 是短语余部 + 释义。**紧邻的下一行就是完整短语条目**，逐条可验：`a`(7)/`a few`(9)、`art`(50)/`art room`(51)、`be`(76)/`be careful`(77)、`dining`(250)/`dining hall`(251)、`doing`(267)/`doing morning exercises`(268)、`had`(473)/`had a cold`(474)、`keep`(583)/`keep your desk clean`(585)、`labour`(600)/`labour day`(601)、`listening`(626)/`listening to music`(627)、`living`(631)/`living room`(632)、`reading`(885)/`reading a book`(886)。
2. a-l/m-z 采用「去掉英文残片、保留短语中文义」的写法，结果是 **word 与 meaning 仍然不匹配**，且与紧邻的完整条目**重复**（未去重，禁令要求只上报）。
3. `truncated_fix` 的写法给的是**词头本身的正确义项**（`dining`=用餐；进餐、`reading`=阅读；读书…），行内自洽、与邻行不再重复，是更好的终态。
4. `easter party`、`eating breakfast` 在库中**没有**完整条目（其余 11 条有），仍以词头义（`复活节`、`吃`）为准。

**行动建议（主控）**：把 `primary_audit_primary-a-l.json`、`primary_audit_primary-m-z.json` 排在 `primary_audit_truncated_fix.json` **之前**；或直接把 a-l/m-z 中这 13 条删除。

**同类但未修（残留）**：`kung`(598)（`fu 功夫；武术`→a-l 改为「功夫；武术」，但 `kung fu`(599) 已存在；`kung` 非独立英文词，建议并入同一裁决）。

## 3. 逐条复核：agree 89 条

- 89 条 `old` 与源数据逐字一致（命令 ①，输出 `mismatch: []`），**无一处对不上源数据**。
- 人工复核 89 条 `new` 值，未发现改错方向的条目，典型正确项：
  - 转义残留：`at`(`\(后面接邮件地址\)`→`在（后面接邮件地址）`)、`seventh`/`sixth`/`tenth`/`thirtieth`/`twenty-first…third`（`\(Nth\) ` 前缀清理）。
  - 英文残片/相邻串入：`magazine`(`报纸 阅读杂志`→`杂志`)、`maths`(`test 数学测试`→`数学`)、`make`(`a snowman 堆雪人`→`做；制作`)。
  - 词义错位：`twenty`(`二十一`→`二十`)、`uncle`(`婕夫`→`姨夫`)、`cool`(`订好的；酷的`→`凉爽的；酷的`)、`come`(`快；加油`→`来；来到`，`come on` 在 i=205 独立存在，删得对)、`pay`(`注意`→`付钱；支付`，`pay attention to` 在 i=802 独立存在)。
  - word 修正 4 条：`go tothe cinema`→`go to the cinema`、`look .out`→`look out`、`Good bay`→`Good bye`、`china`→`China`。
- 复核中确认为**合理删除**（非遗漏）：`light` 的「管灯」、`hair` 的「长」、`english songs` 的「唱」——均属残片/词性噪音。

## 4. 抽样找遗漏（seed=20260930，150/1242）

### 4.1 命中统计

| 类别 | 抽样命中（150 条内） | 实质/风格 |
|---|---|---|
| word 字段含 `—` 变形对（`big—bigger`、`can—could`…） | 6（#94,142,383,497,621,768） | 实质 |
| word 字段含 `(Nth)` 数字残片（`fifth (5th)`、`thirtieth (30th)`） | 2（#368,1146） | 实质 |
| word 字段残片（`story -book` #1054） | 1 | 实质 |
| 音标含 `;` 噪声（#584 `ki:p tu: ði; ðə`、#1124 `ði; ðə`） | 2 | 实质 |
| 释义仅用法说明、缺中心义（`shall`(953)「表示征求意见」） | 1 | 实质 |
| 释义尾部 `./空格` 残留（#763,#1079） | 2 | 风格 |
| 释义内 `、`/`,` 混用（#901,#911,#1128,#1225） | 4 | 风格 |

- 命中合计：**18 条**（自动检测器命中 17 条 + 人工复核补 1 条 `shall`(953)），其中实质 **12 条**、风格 **6 条**。
- 全库外推（12/150 × 1242 ≈ 99 条），属 weak-signal，仅作规模参考。

### 4.2 同族未修项的全库规模（confirmed，命令 ③）

| 族 | 全库条数 | 已修 | 未修样例 |
|---|---|---|---|
| `word` 含 `—`（变形对，如 `big—bigger`） | 36 | 0 | 94,130,142,177,285,303,342,350… |
| `word` 含 `(Nth)` 数字残片 | 10 | 0 | 368(`fifth (5th)`),377,404,935,1142,1146,1201,1204,1207,1210 |
| `word` 残片标点/空格 | 6 | 1 | 1054(`story -book`) 等 |
| 音标含 `;` | 3 | 0 | 584,1124,1310 |
| 释义尾点/空格未清 | 9 | 13 已清 | 688,706,749,763,870,959,1079,1133,1154 |
| `meaning` 转义残留 `\(` | 16 | **16** ✅ | —（该类已全覆盖） |
| `id` 与 `word` 规范化后不一致 | 12 | 0（禁令不改 id） | 420(`fɑ:ðə ] (`)、522/523/541/542(整句课文残片)、1086(`t-shirt t`)、1107/1112/1113(teacher's 族)、1124(`the` vs `the Great Wall`)、**1168(`tomoto`)**、1188(id `tried` / word `tired`) |
| `meaning` 含教材页码 `p.xx` | 0 | — | 小学库**无**页码残留（与初中库不同） |

**注意**：`word` 含 `—` 的 36 条与 `(Nth)` 的 10 条若直接改词形会与既有条目重复（如 `bigger`(93) 已存在），属「重复条目只上报」的禁令范围，需主控统一裁决（改词形 or 删行）。多词条音标「只覆盖首词」在抽样中出现（`no problem`→`/nəʊ/`、`play the pipa`→`/pleɪ/`、`traffic light`→`/lait/`），全库同族未逐一计数。

## 5. 最高风险 3 项（含可复现证据）

1. **13 个 id 的批次冲突（§2）** —— 若 `main.go` 批次顺序把 a-l/m-z 排在 `truncated_fix` 之后，最终数据会把 `a` 写成「一些」、`be` 写成「小心」等 13 处词义错配。复现：§1 命令 ②。
2. **word 字段污染族 52 条未修（36 破折号 + 10 数字残片 + 6 残片标点）** —— 复现：§1 命令 ③（36 条）与 §4.2 表。
3. **id 污染 12 条（禁令不改 id）** —— 其中 `tomoto`(1168)、`tried`(1188) 是明确的拼写错误 id；420/522/523/541/542 是整句课文残片 id。复现：`python -c "import json,re;src=json.load(open('backend/primary_school.json',encoding='utf-8'));n=lambda s:re.sub(r'[^a-z0-9]+','',str(s).lower());print([(i,e['id'],e['word']) for i,e in enumerate(src,1) if n(e['id'])!=n(e['word'])])"`。

## 6. 结论分级

- **confirmed**：89 条 `old` 与源数据逐字一致；转义残留类 16/16 已修；§2 的 13 条批次冲突与 §4.2 的族计数均可复现。
- **probable**：§2 应采用 `truncated_fix` 的取值（依据：行内拆行同族 + 紧邻完整条目存在 + 词头义自洽）。
- **weak-signal**：抽样外推的全库遗漏规模（约 99 条），受抽样 150 条限制，仅作参考。

## 7. 未覆盖范围与残余不确定性

1. 1242 条未修正条目仅抽样 150 条（12%），未逐条复核；§4.2 仅覆盖可正则化的缺陷族，语义类遗漏（如 `shall`）无法穷举。
2. 未审 `phonetic` 的系统性质量（除 `;` 噪声与「仅覆盖首词」两类），亦未审 `example` / `exampleTranslation` / `pos`（`pos` 结尾带 `.` 属风格差异，319 条，未判为错误）。
3. 未验证 enrichment 批次的**实际应用顺序**（属主控集成步骤）；本报告只证明冲突存在。
4. `id` 字段一律未改（禁令），故 `tomoto` 等 12 条保持原样，属已知残留。
5. 行内拆行族在库中实为「片段行 + 完整行」成对重复（11 组），本轮均未去重。
