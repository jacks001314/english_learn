# 课程词表审核记录 · course-89（八上/八下/九上/九下）

切片：`course-89`　节点：kalinux（bash / python3）
审核规范：`reports/word-audit/AUDIT-SPEC.md`（E1–E9）
产物：`reports/word-audit/course-89.json`（修正清单）、本文件（审核记录）

## 1. 覆盖情况（逐条审核，无抽样）

| 文件 | 条目数 | 已审核 | slice 自动 flags | 提出修正 |
|---|---|---|---|---|
| chuzhong/vocab/八年级上册.json | 322 | 322 | 7 | 2 |
| chuzhong/vocab/八年级下册.json | 266 | 266 | 7 | 0 |
| chuzhong/vocab/九年级上册.json | 380 | 380 | 10 | 4 |
| chuzhong/vocab/九年级下册.json | 128 | 128 | 1 | 0 |
| **合计** | **1096** | **1096** | 25 | **6** |

切片命令（各执行一次）：
`python3 scripts/word-audit/slice.py --source chuzhong/vocab/<册>.json --course --out .tmp/audit/course-{8a,8b,9a,9b}.txt`

结构说明：四个文件的条目只有 `word` / `phonetic` / `meaning` 三个字段（**无 `pos`**），
因此 E3 的「词性前缀噪声」与 E8（pos 矛盾）在本切片不适用；释义中的 `n.` / `adj.` 前缀按规范视为正常。

## 2. 修正分类统计（6 条）

| 编号 | 情形 | 条数 | 条目 |
|---|---|---|---|
| E6 | 词形/释义内拼写错误 | 2 | 八上 M7 `ssh`→`sh`；八上 M8 `worse` 释义 `badlly`→`badly` |
| E7 | 词义与词形不对应（含串行） | 3 | 九上 M1 `natural`、M2 `parade`、M8 `sportsperson` |
| E2 | 音标串行（音标实为邻条单词） | 1 | 九上 M12 `crop` 音标 `ˈenəmi`（= 前一条 `enemy`） |

未发现 E1（页码残留）、E9（转义残留）、E4（无中文释义）、E5（词形残片）的实例。

## 3. `ssh` 结论（必须项）

`chuzhong/vocab/八年级上册.json` **Module 7 / 第 5 条 `ssh`（音标 `ʃ`，释义「嘘（示意某人不要说话）」）应改为 `sh`。**

依据：
1. 该条音标 `/ʃ/` 对应的是字母组合 **sh**，释义「嘘（示意某人不要说话）」对应英语感叹词 `sh`（int.）；
2. 外研版八年级上册 Module 7（Alice 故事单元）单词表及牛津/朗文等通行词典收录的词形是 `sh`；
3. `ssh` 仅在少数词典中作为 `sh`/`shh` 的变体列出，且在现代语境中 `ssh` 几乎专指 Secure Shell，
   作为中学教材词条会产生歧义 —— 判为 **E6 多余字母重复的拼写错误**；
4. 因个别词典确实收 `ssh` 为变体，confidence 记 `medium`（若主控要求严格对齐教材则按 high 处理）。

## 4. uncertain / 待主控裁决清单

| # | 位置 | 观察到的问题 | 建议处理 |
|---|---|---|---|
| U1 | 全四册音标 | 音标中存在系统性的 `/e/` 代 `/eɪ/`、省略长音符 `/ː/`：八上 `main`=`men`、`train`=`tren`；八下 `way`=`we`、`waste`=`west`、`fair`=`fer`、`ancient`=`ˈenʃənt`、`make up`=`mek ʌp`、`explain`=`ɪkˈsplen`、`square`=`skwer`、`sailing`=`ˈselɪŋ`、`patient`=`ˈpeʃənt`；九下 `paint`=`pent`、`heat`=`hit`、`beat`=`bit`、`fairly`=`ˈferli` | 属"词表转写风格"还是"音标与单词不匹配"取决于判定口径；本目录 `backend/middle_school.json` 同词作 `/meɪn/ /treɪn/ /weɪ/ /weɪst/`，倾向为转写/OCR 风格而非词条污染。**未列入补丁**，建议主控决定是否统一重做音标 |
| U2 | 八上 M6/4 `danger` | 音标 `ˈdeɪndʒə(r)(r)` 尾部多一个 `(r)` | 轻微冗余，主控可随音标批次一并清理 |
| U3 | 八下 M9/13 `silence` | 释义残留半角冒号：`…沉默，默不作声:；保持沉默…` | 标点噪声，若允许标点级清理可删去 `:`；同类还有八上 M4/8 `close` 尾部 `；`、八上 M10/5 `cloudy` 用 `：`、八上 M11/12 `difference` 用 `：` |
| U4 | 九上 M2/9 `season` | 释义 `度假旺季；节假` 后半疑似截断（"节假日/季节/旺季"?) | 无通行依据，**未改**，请主控对照教材原文 |
| U5 | 九下 M6/13 `west` | 释义仅 `（尤指西欧和北美）`，缺中心义"西方/西部" | 疑似截断；补全需教材原文，**未改** |
| U6 | 大小写/标点风格 | 八上 `Vocabulary`、八下 `Have a try` / `Pie` / `sb. can’t wait` / `can’t help doing sth.`（用 U+2019）、九上 `UK` / `X-ray` | 属风格差异（规范第 2 节），**不改** |
| U7 | 八上 M1/23 `pronounce` / 九上 M7/4 `review` 等 | 释义含名词义项（`发音；读音`、`评价；评论（文章）`）与动词词性不严格对应 | 教材式详略差异，**不改** |
| U8 | 八下 `smell(smelled,smelt)`、九上 `keep(kept/kept)`、`lend(lent,lent)`、`spread(spread, spread)` 等 | 词形内带变形说明（E5 关注的是残片，如 `blow(blew` 不闭合） | 括号闭合、格式规范，**不改** |
| U9 | 跨册重复词（`natural`/`pretty`/`miss`/`grow`/`sky` 等） | 同词在不同册不同义项重复出现 | 属正常编册，非 duplicate 错误，**不改** |

## 5. 自查（checkpatch，按 source 拆分的临时补丁）

```
python3 scripts/word-audit/checkpatch.py --source chuzhong/vocab/八年级上册.json --patch .tmp/audit/course-89-8a.json --course
python3 scripts/word-audit/checkpatch.py --source chuzhong/vocab/八年级下册.json --patch .tmp/audit/course-89-8b.json --course
python3 scripts/word-audit/checkpatch.py --source chuzhong/vocab/九年级上册.json --patch .tmp/audit/course-89-9a.json --course
python3 scripts/word-audit/checkpatch.py --source chuzhong/vocab/九年级下册.json --patch .tmp/audit/course-89-9b.json --course
```

结果（`old` 逐字一致、定位键与 field 合法、无重复）：

```
OK: 2 条修正全部通过校验（source=chuzhong/vocab/八年级上册.json）
OK: 0 条修正全部通过校验（source=chuzhong/vocab/八年级下册.json）
OK: 4 条修正全部通过校验（source=chuzhong/vocab/九年级上册.json）
OK: 0 条修正全部通过校验（source=chuzhong/vocab/九年级下册.json）
```

边界遵守：未修改 `chuzhong/` 下任何文件，未改他人产物，未派生下级 Agent；临时文件仅置于 `.tmp/audit/`。
