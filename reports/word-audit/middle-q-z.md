# 词库审核记录：middle-q-z（letter Q–Z）

- 切片名：`middle-q-z`
- 源文件：`backend/middle_school.json`（文件共 2895 条）
- 切片范围：`letter` ∈ Q,R,S,T,U,V,W,X,Y,Z
- 审核条目数：**858 / 858**（逐条、含 `senses` 一起看过，未漏条）
- 提出修正：**84 条**（84 个条目，每条目 1 条记录；字段分布：`meaning` 80、`pos` 4、`word` 1）
- 未发现问题的条目：774 条
- 校验命令：`python3 scripts/word-audit/checkpatch.py --source backend/middle_school.json --patch reports/word-audit/middle-q-z.json`
- 校验结果：**OK: 84 条修正全部通过校验**

## 一、E 编号分布

| 编号 | 情形 | 条数 |
|---|---|---|
| E1 | 释义残留教材页码（`p.18`、`p.62`、`厕所p.18` 等） | 21 |
| E2 | 释义串入相邻词条 / 义项间缺分隔连成一句 | 5 |
| E3 | 释义残留词性标记与编号噪声（`um`/`a.`/`t.`/`pro`/`ad. v.`/`aux`/`n.` 等） | 43 |
| E4 | 释义无中文（只有变形说明）或释义被截断 | 5 |
| E5 | 词形混入词性/残片 | 1 |
| E6 | 词形拼写错误 | 0 |
| E7 | 词义错位 / 中文错别字 / 义项重复 | 7 |
| E8 | `pos` 与词形、词义明显矛盾 | 4 |
| E9 | 释义含排版转义残留 | 0 |
| 合计 | （`secret`、`speed` 两条同时涉及 E1+E3，故分类计数之和为 86） | **84 条记录** |

置信度分布：`high` 70、`medium` 14、`low` 0。

## 二、典型修正（节选）

- E1：`quick` `快的；迅速的 p.18` → `快的；迅速的`；`restroom` `（美）洗手间；公共厕所p.17` → `（美）洗手间；公共厕所`（页码与中文之间无空格，属同一类残留）。
- E2：`snow` `下雪；雪Snow` → `下雪；雪`；`train` `火车 2. bus 公交车` → `火车`（明显是相邻词条串行）。
- E3：`seven` `um. 七` → `七`；`senior` `a. 级别（或地位）高的` → `级别（或地位）高的`；`west` `向西；朝西adj. 向西的；西部的 n. 西；西方` → `向西；朝西；向西的；西部的；西；西方`。
- E4：`shelf` `(pl` → `架子；搁板`；`women` `woman的复数形式` → `妇女（woman的复数形式）`；`was`/`were`/`went` 补出「是/去」。
- E5：`id=usa n` 的 `word` `USA n` → `USA`。
- E7：`state` `洲` → `州`；`tell` `告述` → `告诉`；`t-shirt` `汗杉,T恤(杉)` → `汗衫,T恤(衫)`；`uncle` 末项重复「舅父」→ `姨父`；`wood` `树木，木材，树木` → `树木，木材`；`trip` `over phr. (被...)绊倒` → `旅行；旅程；绊倒`；`yes` `(用于疑问,征询等)什么,是吗` → `(用于肯定回答)是,是的`。
- E8：`read` pos `n` → `v.`；`think` pos `n.` → `v.`；`several` pos `prep.` → `adj.`；`south` pos `n & v` → `n & adj`。

## 三、uncertain 清单（未改，交主控裁决）

1. **重复条目 8 组**（禁令：不得新增/删除/合并条目）：
   - `shoot`：i=2249 `id=shoot` `v. 投篮，射击，发射` / i=2250 `id=shoot(shot` `v 射击；投篮`
   - `sing`：i=2279 `id=sin.g` `v. 唱；唱歌` / i=2281 `id=sing` `v 唱,唱歌`
   - `speak`：i=2362 `id=speak` `v 讲,说` / i=2364 `id=speak spiːk]` `v. 说；说话`
   - `sunshine`：i=2445 `id=sun shine` `n 阳光` / i=2450 `id=sunshine` `n 日光,阳光`
   - `take off`：i=2488 `id=take off` `phr. 脱下(衣,帽,鞋等)` / i=2489 `id=take off （` `v. phr. （飞机等）起飞；匆忙离开`
   - `telephone`：i=2533 `id=telephone` `v 打电话给(某人)` / i=2534 `id=telephone(phone` `n 电话；电话机`
   - `weekend`：i=2790 `id=weekend` / i=2791 `id=weekend.`（释义完全相同）
   - `What about...?`：i=2804 `id=what about...? phr. (` / i=2805 `id=what about...?(`（释义完全相同）
   - 建议：由主控决定是否合并或删除冗余条目；本次一律未动。
2. **`id` 字段被污染（共 30 余处，按禁令不得修改 `id`，仅上报）**，典型：
   `rurn right`(2154, word=`turn right`)、`sliver`(2303, word=`silver`)、`sin.g`(2279)、`sist= stand,`(2286)、`speak spiːk]`(2364)、`shoot(shot`(2250)、`spill(spilt`(2373)、`spit(spat`(2375)、`steal(stole`(2397)、`telephone(phone`(2534)、`weekend.`(2791)、`rode.`(2136)、`take off （`(2489)、`take after （`(2481)、`the uk（`(2571)、`take breaks (take a break）`(2483，全角右括号)、`quite a lot(of…)`(2052)、`teresa`(2541, word=`Teresa Lopez`)、`thomas`(2597)、`st.`(2382)、`starting`(2391, word=`starting line`)、若干 ` xxx n` 形式（`queue jumper n`、`reading room n`、`so that conj`、`south africa n`、`spring festival n`、`table tennis n`、`two-story n`、`waiting room n`、`writing brush n`、`young pioneer n`、`the great wall n` 等，词形本身正确）。
   建议：主控在 enrichment 通道统一清理 `id`（不影响本补丁：补丁按现有 `id` 定位）。
3. `-sist-`（i=2286，`id=sist= stand,`）条目释义为「词根：站立」、`pos='n'`，属词根条目混入单词表；不建议由本人删除，请主控裁决。
4. `rock`（i=2134）释义 `摇动,摇滚乐`、`pos='n'`：`摇动` 为动词义，与 `n.` 混类；未改，建议确认是否拆条或改为 `岩石；摇滚乐`。
5. `smell`（i=2309）`pos='n.'` 但释义含动词义「闻起来；闻到」：同类 pos/义项混类，未改。
6. `there's`（i=2581）、`what's`（i=2806）释义仅「there is / what is 的缩写形式」，无中文义项（E4 同类）；因缩写词的中文义（有/存在、什么是）歧义较大，未改，建议主控确认。
7. `why`（i=2824）释义 `(表示惊讶,不耐烦,恼怒等) 嗨`，通行释义为「哎呀；哟」，「嗨」可疑，未改。
8. `tomato`（i=2630）释义中「蕃茄」为异体写法（通行「番茄」），未改。
9. `shelf`（i=2241）原值被截断为 `(pl`，已按 E4 补为 `架子；搁板`，但原始教材释义可能还有义项，建议复核。
10. `scissors`/`shorts`/`trousers` 释义带 `(pl.)` 数标记、`shut` 带 `(shut, shut)`、`tomato` 带 `(pl.tomatoes)`：按规范「变形说明可保留在括号里」未动。

## 四、其他说明

- 音标字段：切片内未发现污染（无页码、无中文、无不成对音标），故无音标类补丁、无 E9。
- 例句与例句翻译：按要求未改动；切片内未发现目标词拼写与 `word` 冲突的例句。
- 补丁文件为紧凑 JSON（每条记录一行），字段与 AUDIT-SPEC 第 4 节一致；`old` 均为源文件精确原文，已由 `checkpatch.py` 逐字校验通过。
