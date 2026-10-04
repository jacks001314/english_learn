# 词库审核记录：primary-m-z

- 切片：`letter` = M–Z
- 源文件：`backend/primary_school.json`（全库 1331 条；本切片 **677** 条）
- 审核方式：逐条人工核读切片全文（含 `senses=` 义项），不以 `flags=` 为限
- 审核条目数：**677**
- 提出修正：**29** 条（字段全部为 `meaning`）
- 校验：`python scripts/word-audit/checkpatch.py --source backend/primary_school.json --patch reports/word-audit/primary-m-z.json` → **OK（29 条全部通过）**

## 1. E 编号分布

| 编号 | 条数 | 说明 | id |
|---|---|---|---|
| E2（混入相邻词条/音标文本） | 5 | 释义串入相邻条目的英文残片 | magazine, make, maths, put on, reading |
| E3（残留词性标记、编号、重复噪声） | 8 | `a.` 前缀、编号、重复字串 | own, salty, third, straight, name, super, wash the clothes, zoo |
| E4（释义无中文，只有变形/音标说明） | 4 | 补出中文，变形说明保留在括号内 | mice, sing, swim, take |
| E7（词义错位 / 中文错别字） | 3 | 释义与词形不对应 | pay, twenty, uncle |
| E9（释义含排版转义残留 `\\(...\\)`） | 9 | 去掉转义，保留真实释义 | pack, seventh, sixth, tenth, there, thirtieth, twenty-first, twenty-second, twenty-third |
| E1 / E5 / E6 / E8 | 0 | 本切片无该类判定成立项 | — |
| **合计** | **29** | | |

### 修正明细（id | index | old → new | E）

| id | index | old | new | E | conf |
|---|---|---|---|---|---|
| magazine | 655 | 报纸 阅读杂志 | 杂志 | E2 | high |
| make | 656 | a snowman 堆雪人 | 做；制作 | E2/E7 | medium |
| maths | 669 | test 数学测试 | 数学 | E2 | high |
| mice | 680 | （mouse的复数） | 老鼠（mouse的复数） | E4 | medium |
| name | 721 | 名字名字 | 名字 | E3 | high |
| own | 783 | a. 自己的 | 自己的 | E3 | high |
| pack | 787 | 收拾 \\(行李） | 收拾（行李） | E9 | high |
| pay | 801 | 注意 | 付钱；支付 | E7 | medium |
| put on | 871 | 穿上. put on 动词,表示穿上衣服的动词,强调动作 | 穿上 | E2 | high |
| reading | 885 | a book 正在看书 | 正在看书 | E2 | high |
| salty | 916 | a. 咸的 | 咸的 | E3 | high |
| seventh | 949 | \\(7th\\) 第七 | 第七 | E9 | high |
| sing | 978 | （过去式sang[sæŋ ]） | 唱歌（过去式sang[sæŋ]） | E4 | medium |
| sixth | 987 | \\(6th\\) 第六 | 第六 | E9 | high |
| straight | 1056 | 1. 笔直的;挺直的2、成直线地 | 笔直的;挺直的;成直线地 | E3 | medium |
| super | 1075 | 太棒了太 | 太棒了 | E3 | high |
| swim | 1082 | （过去式swam[ swæm]） | 游泳（过去式swam[swæm]） | E4 | medium |
| take | 1089 | （过去式took[tʊk]） | 拿；取（过去式took[tʊk]） | E4 | medium |
| tenth | 1117 | \\(10th\\) 第十 | 第十 | E9 | high |
| there | 1132 | \\(表示存在或发生\\) | （表示存在或发生） | E9 | high |
| third | 1141 | a. 第三的 | 第三的 | E3 | high |
| thirtieth | 1145 | \\(30th\\) 第三十 | 第三十 | E9 | high |
| twenty | 1205 | 二十一 | 二十 | E7 | high |
| twenty-first | 1206 | \\(21st\\) 第二十一 | 第二十一 | E9 | high |
| twenty-second | 1208 | \\(22nd\\) 第二十二 | 第二十二 | E9 | high |
| twenty-third | 1209 | \\(23rd\\) 第二十三 | 第二十三 | E9 | high |
| uncle | 1216 | 叔叔，舅舅，婕夫 | 叔叔；舅舅；姨夫 | E7 | high |
| wash the clothes | 1248 | 洗衣服. .洗衣服 | 洗衣服 | E3 | high |
| zoo | 1331 | 动物园动物园 | 动物园 | E3 | high |

## 2. 明确判定为「不修」的项（保持原样）

- `p.m.`（i=786）：`word_trailing_punct` 命中，但为正常缩写，不修。
- `noodle(s)`、`o'clock`、`T-shirt`、`ping-pong`、`yo-yo`、`P.E.`、`RSVP`、`PRC`、`UK`、`USA`、`TV` 等：词形正常。
- 释义中含变形说明但**已带中文**的条目：`play`（过去式played）玩、`row`（过去式rowed）划（船）、`see`、`study`、`studies`、`rode`、`thought`、`took`、`visit`、`wash`、`watch`、`went`、`win`、`woke` —— 按 AUDIT-SPEC 第 2 节「变形说明可保留在括号里」处理，不修。
- 释义详略差异（如 `pot` 锅；碗；瓢；盆、`social studies` 社会课、`sight` 类）未列 uncertain 的，视为释义详略差异，不修。
- 序数词短语条目 `second (2nd)` / `third (3rd)` / `twelfth (12th)` / `twentieth (20th)` / `thirtieth (30th)` / `twenty-first (21st)` / `twenty-second (22nd)` / `twenty-third (23rd)`：词形中的序数缩写属既有条目设计（`num. phr.`），不修（其纯数字条目 `seventh`/`sixth`/… 的 meaning 已按 E9 修正）。

## 3. uncertain 清单（拿不准 / 需主控裁决，本切片未出补丁）

| # | id（index） | 观察到的问题 | 建议处理 |
|---|---|---|---|
| U1 | miss(688) 小姐. / mr(706) 先生. / north(749) 北方；向北方. / off(763) 距；离；离开. / put away the clothes(870) 收拾衣服. / shelf(959) 书架. / short(968) 短的.；矮的 / sweater(1079) 毛衣 . / these(1133) 这些. / those(1154) 那些. | 释义尾部（或中部）残留 ASCII 句点，疑似源词典排版残留；E1–E9 无直接对应（E3 只规定词性标记/编号噪声） | 建议主控统一清理为无句点形式（如 `小姐`、`书架`、`短的；矮的`）；若按「标点风格差异不修」处理则维持原样 |
| U2 | old—older(768) / read—read(889) / ride—rode(899) / see—saw(943) / short—shorter(972) / sleep—slept(996) / small—smaller(1003) / stay—stayed(1051) / strong—stronger(1063) / take—took(1095) / tall—taller(1100) / think—thought(1138) / thin—thinner(1140) / wake—woke(1240) / wash—washed(1252) / watch—watched(1258) / well—better(1276) / young—younger(1326)；另 smart-smarter(1005) | `word` 字段用 em dash/连字符连接两个词形（原形—变形），与同名简单条目（older、saw、rode、slept、smaller…）语义重复；改 `word` 会与既有条目产生重复，且 `id` 同样含该符号（硬性禁令禁止改 id） | 建议主控裁决：或清理为规范词形并去重（需同步改 id 通道处理），或整体删除重复条目；本轮不动 |
| U3 | we'll = we will(1266) `we'll = we will`、story -book(1054) `story -book`、Wednesday(Wed.)(1271) | `word` 字段含说明/缩写残片，形如 E5；但清理后分别与既有条目 `we'll`(1265)、`storybook`(1055)、`Wednesday`(1270) 完全重复 | 建议按重复条目由主控去重（保留干净词形的条目） |
| U4 | no problem(743/744)、ship(961/962)、subway(1068/1069)、T-shirt(1085/1086)、teacher's desk(1107/1108/1110)、teacher's office(1109/1111)、teachers' office(1112/1113)、the Great Wall(1124/1125)、then(1130/1131)、tired(1161/1188)、tomato(1166/1168)、traffic(1178/1182)、train(1183/1184)、turn(1194/1195)、work(1304/1305) | `word` 相同、`id` 不同（多为一侧 id 带 `.`/`：`/`(2nd)` 等记号）的重复条目；另有 id `tomoto`(1168) 拼写错误而 `word` 正确、id `teacher,s desk`(1110/1111) 用逗号代替撇号 | 属 `duplicate_word`/id 层面问题，按硬性禁令第 1、2 条禁止改 id、禁止合并条目，交主控裁决 |
| U5 | make a Snowman(657)、Mid-autumn(681)、Post card(852)、Sing(978)、Plant(827)、Soil(1018)、Sprout(1044)、Write(1312)、Writer(1316)、This afternoon(1150)、This evening(1151) | `word` 首字母/词中大写不规范（普通名词、动词被大写；`make a Snowman` 词中大写） | E1–E9 未覆盖大小写，建议主控统一小写化 |
| U6 | together(1165) pos=adv / 释义「一起的」；really(890) pos=adv / 释义「真正的；确实」 | `pos` 与释义词性不合（的/地误用），近 E8/E7 但未达「明显矛盾」 | 建议改为「一起」「真正地；确实」；本轮因判定不确定未出补丁 |
| U7 | tonight(1171) 释义「在晚上」（通行释义为「今晚」）；pot(856)「锅；碗；瓢；盆」义项过宽 | 释义疑似偏差/过宽 | 建议主控复核是否收紧 |
| U8 | 全切片音标 | 逐条检查 677 条 `phonetic`：无页码混入、无中文、无不成对、无多斜杠 | 无需处理（本次不重做音标） |

## 4. 说明

- 本轮补丁 `old` 均取自源文件精确原文，`id`/`index` 未做任何改动，未新增/删除/合并条目。
- 切片内 62 条被 `flags=` 命中的条目已全部逐一判定：其中 `word_non_ascii,word_odd_char`（em dash 变形对）按 U2 处理为 uncertain；`word_has_digit`（序数缩写词形）按既有设计不修；`meaning_has_escape`/`meaning_noise_prefix`/`meaning_has_latin` 中构成 E2/E3/E4/E9 的已出补丁。
- 另发现若干 `flags=` 未命中的错误（`magazine`、`name`、`zoo`、`super`、`wash the clothes`、`pay`、`twenty`、`uncle`、`reading` 等），已按 E2/E3/E7 出补丁。
