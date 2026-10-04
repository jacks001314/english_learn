# 已落地的单词修正 · 全量清单

> 任务：`task-swarm-word-audit`（追加子任务 `task-swarm-abbrev-fill`）｜汇编者：swarm-report-changes｜生成日期：2026-09-30
> 数据来源：`reports/word-audit/*.json` 补丁清单 + `backend/enrichment/primary_audit_truncated_fix.json`（enrichment 批次，只有 `id` + 被改字段）。
> 列口径：`修正前` 取自补丁清单的 `old`（已与 `backend/*_school.json` 源数据逐条比对，结果见「自检统计」）；`修正后` 照抄 `new`；**逐字照录，含中文标点与全角/半角**。
> 去重口径：同一 `id` + 字段被多批次修改时只列**最终生效值**（生效顺序：切片审计 → 主控裁决/补漏 → 简写补全），被取代的取值在「说明」列注明。
> 生效通道：`backend/*_school.json` 是构建期产物，由 `go run ./cmd/synccontent` 按 `cmd/synccontent/main.go` 的批次表合并 `backend/enrichment/*.json` 后生效；`chuzhong/vocab/*.json` 已整文件写回，运行期直接生效。
> 「说明」列格式：`E 类别 / 置信度：理由`。

## 1. 总览（数据集 x 字段）

| 数据集 | word | meaning | pos | phonetic | 合计 |
|---|---:|---:|---:|---:|---:|
| `backend/primary_school.json` | 11 | 94 | 0 | 0 | **105** |
| `backend/middle_school.json` | 3 | 306 | 8 | 0 | **317** |
| `chuzhong/vocab/*.json`（5 个文件） | 2 | 6 | 0 | 9 | **17** |
| **合计** | **16** | **406** | **8** | **9** | **439** |

## 2 primary_school.json 全量清单（最终 105 处）

| 补丁文件 | 清单条数 | 最终生效 |
|---|---:|---:|
| `reports/word-audit/primary-a-l.json` | 60 | 48 |
| `reports/word-audit/primary-m-z.json` | 29 | 28 |
| `reports/word-audit/primary-leftover.json` | 15 | 15 |
| `backend/enrichment/primary_audit_truncated_fix.json` | 14 | 14 |
| **合计（去重后）** | 118 | **105** |

### 2.1 `reports/word-audit/primary-a-l.json`（最终生效 48 处）

| 序号 | id | 字段 | 修正前 | 修正后 | 说明（E 类别 / 置信度） |
|---:|---|---|---|---|---|
| 1 | `at` | meaning | \(后面接邮件地址\) | 在（后面接邮件地址） | E9 / high：释义含转义残留 \( \)（E9），且缺真实义项，补「在」 |
| 2 | `before` | meaning | 在\.\.\. 之前 | 在……之前 | E9 / high：释义含转义残留 \.\.\.（E9） |
| 3 | `children` | meaning | 儿童 \(child 的复数） | 儿童（child 的复数） | E9 / high：释义含转义残留 \(（E9） |
| 4 | `cousin` | meaning | 同辈表亲 \(堂亲\) | 同辈表亲（堂亲） | E9 / high：释义含转义残留 \( \)（E9） |
| 5 | `dollar` | meaning | 元 \(美元等） | 元（美元等） | E9 / high：释义含转义残留 \(（E9） |
| 6 | `eleventh` | meaning | \(11th\) 第十一 | 第十一 | E9 / high：释义含转义残留 \(11th\)（E9） |
| 7 | `grandmother` | meaning | \(外\) 祖母 | （外）祖母 | E9 / high：释义含转义残留 \( \)（E9） |
| 8 | `him` | meaning | 他（宾语或表语\) | 他（宾语或表语） | E9 / high：释义含转义残留 \)（E9） |
| 9 | `kung` | meaning | fu 功夫；武术 | 功夫；武术 | E2 / high：释义混入相邻词条 kung fu 的 fu（E2） |
| 10 | `lots` | meaning | of 大量；许多 | 大量；许多 | E2 / high：释义混入相邻词条 lots of 的 of（E2） |
| 11 | `i would like to` | meaning | 想要. 例：我现在想看书 I want to read now.=I would like to read now | 想要 | E2 / high：释义混入例句文本（E2） |
| 12 | `afternoon` | meaning | 下午午后 | 下午；午后 | E3 / medium：释义缺分隔符（E3） |
| 13 | `chinese` | meaning | 中文，汉语；中国人adj. 中国的，中国人的；中国话的 | 中文，汉语；中国人；中国的，中国人的；中国话的 | E3 / medium：释义残留词性标记 adj.（E3） |
| 14 | `clean` | meaning | 清洁的，干净的；vi.打扫，清扫 | 清洁的，干净的；打扫，清扫 | E3 / high：释义残留词性标记 vi.（E3） |
| 15 | `do` | meaning | （过去式did [did]）vt. 做；完成；进行. | （过去式did [did]）做；完成；进行 | E3 / high：释义残留词性标记 vt. 与句点（E3） |
| 16 | `end` | meaning | 1.最后部分, 末尾 2.端, 尽头, 梢 3.终止, 结局 | 最后部分，末尾；端，尽头，梢；终止，结局 | E3 / high：释义残留编号噪声 1. 2. 3.（E3） |
| 17 | `english` | meaning | a.英国的；英国人的；英语的n.英语；英国人 | 英国的；英国人的；英语的；英语；英国人 | E3 / high：释义残留词性标记 a. / n.（E3） |
| 18 | `excited` | meaning | 兴奋的激动的 | 兴奋的；激动的 | E3 / medium：释义缺分隔符（E3） |
| 19 | `favourite` | meaning | a.特别喜爱的;最喜爱的 | 特别喜爱的;最喜爱的 | E3 / high：释义残留词性标记 a.（E3） |
| 20 | `good` | meaning | 好的好的的 | 好的 | E3 / high：释义重复叠字噪声「好的好的的」（E3） |
| 21 | `healthy` | meaning | a.健康的;有益健康的 | 健康的;有益健康的 | E3 / high：释义残留词性标记 a.（E3） |
| 22 | `helpful` | meaning | a. 有帮助的,有益的 | 有帮助的,有益的 | E3 / high：释义残留词性标记 a.（E3） |
| 23 | `how many` | meaning | 多少后接可数名词复数形式 | 多少；后接可数名词复数形式 | E3 / medium：释义缺分隔符（E3） |
| 24 | `however` | meaning | 1、但是;2 无论如何,不管怎样 | 但是；无论如何，不管怎样 | E3 / high：释义残留编号噪声 1、2（E3） |
| 25 | `ill` | meaning | a.坏的,有病的 | 坏的,有病的 | E3 / high：释义残留词性标记 a.（E3） |
| 26 | `lady` | meaning | 女士;小姐’夫人 | 女士;小姐;夫人 | E3 / medium：释义残留错乱标点 ’（E3） |
| 27 | `laugh at` | meaning | 因…而发笑. . . | 因…而发笑 | E3 / medium：释义残留标点噪声 . . .（E3） |
| 28 | `a little` | meaning | 有些. | 有些 | E3 / medium：释义残留句点（E3） |
| 29 | `another` | meaning | 另一个. | 另一个 | E3 / medium：释义残留句点（E3） |
| 30 | `baby` | meaning | 婴儿. | 婴儿 | E3 / medium：释义残留句点（E3） |
| 31 | `big` | meaning | 大的 . | 大的 | E3 / medium：释义残留句点（E3） |
| 32 | `breakfast` | meaning | 早餐. | 早餐 | E3 / medium：释义残留句点（E3） |
| 33 | `eleven` | meaning | 十一 . | 十一 | E3 / medium：释义残留句点（E3） |
| 34 | `fish` | meaning | 鱼 . | 鱼 | E3 / medium：释义残留句点（E3） |
| 35 | `from` | meaning | 从;来自. | 从;来自 | E3 / medium：释义残留句点（E3） |
| 36 | `goal` | meaning | 得分数. | 得分数 | E3 / medium：释义残留句点（E3） |
| 37 | `have a headache` | meaning | 头疼. | 头疼 | E3 / medium：释义残留句点（E3） |
| 38 | `lock` | meaning | 锁 . | 锁 | E3 / medium：释义残留句点（E3） |
| 39 | `leave` | meaning | (过去式left[left]) | （过去式left[left]）离开 | E4 / high：释义只有变形说明、无中文义项（E4） |
| 40 | `go tothe cinema` | word | Go tothe cinema | go to the cinema | E5 / high：词形残留截断/拼合 tothe（E5） |
| 41 | `look .out` | word | look .out | look out | E5 / high：词形混入句点残片（E5） |
| 42 | `good bay` | word | Good bay | Good bye | E6 / high：词形拼写错误 bay→bye（E6） |
| 43 | `china` | word | china | China | E6 / medium：专有名词首字母未大写（E6） |
| 44 | `cool` | meaning | 订好的；酷的 | 凉爽的；酷的 | E7 / high：释义与词形/义项不符，订好的→凉爽的（E7） |
| 45 | `hair` | meaning | 长头发 | 头发 | E7 / medium：释义与词形不符，长头发→头发（E7） |
| 46 | `light` | meaning | 灯；管灯 | 光；灯 | E7 / medium：释义与义项不符，管灯→光；灯（E7） |
| 47 | `come` | meaning | 快；加油 | 来；来到 | E7 / medium：释义与词形不符，快；加油→来；来到（E7） |
| 48 | `english songs` | meaning | 唱英文歌曲 | 英文歌曲 | E8 / medium：pos=n. phr. 与释义「唱英文歌曲」动词短语矛盾（E8） |

### 2.2 `reports/word-audit/primary-m-z.json`（最终生效 28 处）

| 序号 | id | 字段 | 修正前 | 修正后 | 说明（E 类别 / 置信度） |
|---:|---|---|---|---|---|
| 49 | `magazine` | meaning | 报纸 阅读杂志 | 杂志 | E2 / high：释义残留相邻词条 newspaper/read a magazine 的内容（报纸 阅读），与词形不符（E2） |
| 50 | `make` | meaning | a snowman 堆雪人 | 做；制作 | E2 / medium：释义混入相邻词条 make a snowman 的英文残片 a snowman，中文亦错位（E2/E7） |
| 51 | `maths` | meaning | test 数学测试 | 数学 | E2 / high：释义混入相邻词条 test 的英文残片（E2） |
| 52 | `mice` | meaning | （mouse的复数） | 老鼠（mouse的复数） | E4 / medium：释义只有变形说明、没有中文释义（E4） |
| 53 | `name` | meaning | 名字名字 | 名字 | E3 / high：释义重复残留“名字名字”（E3） |
| 54 | `own` | meaning | a. 自己的 | 自己的 | E3 / high：释义残留词性标记 a. （E3） |
| 55 | `pack` | meaning | 收拾 \(行李） | 收拾（行李） | E9 / high：释义含排版转义残留 \( 与不闭合括号（E9） |
| 56 | `pay` | meaning | 注意 | 付钱；支付 | E7 / medium：词义错位，把短语 pay attention to 的释义“注意”串入 pay（E7） |
| 57 | `put on` | meaning | 穿上. put on 动词,表示穿上衣服的动词,强调动作 | 穿上 | E2 / high：释义混入词性/讲解说明文字（E2） |
| 58 | `salty` | meaning | a. 咸的 | 咸的 | E3 / high：释义残留词性标记 a. （E3） |
| 59 | `seventh` | meaning | \(7th\) 第七 | 第七 | E9 / high：释义含排版转义残留 \(7th\)（E9） |
| 60 | `sing` | meaning | （过去式sang[sæŋ ]） | 唱歌（过去式sang[sæŋ]） | E4 / medium：释义只有变形/音标说明、没有中文释义（E4） |
| 61 | `sixth` | meaning | \(6th\) 第六 | 第六 | E9 / high：释义含排版转义残留 \(6th\)（E9） |
| 62 | `straight` | meaning | 1. 笔直的;挺直的2、成直线地 | 笔直的;挺直的;成直线地 | E3 / medium：释义残留编号噪声 1. 与 2、（E3） |
| 63 | `super` | meaning | 太棒了太 | 太棒了 | E3 / high：释义尾部重复残留“太”（E3） |
| 64 | `swim` | meaning | （过去式swam[ swæm]） | 游泳（过去式swam[swæm]） | E4 / medium：释义只有变形/音标说明、没有中文释义（E4） |
| 65 | `take` | meaning | （过去式took[tʊk]） | 拿；取（过去式took[tʊk]） | E4 / medium：释义只有变形/音标说明、没有中文释义（E4） |
| 66 | `tenth` | meaning | \(10th\) 第十 | 第十 | E9 / high：释义含排版转义残留 \(10th\)（E9） |
| 67 | `there` | meaning | \(表示存在或发生\) | （表示存在或发生） | E9 / high：释义含排版转义残留 \(...\)（E9） |
| 68 | `third` | meaning | a. 第三的 | 第三的 | E3 / high：释义残留词性标记 a. （E3） |
| 69 | `thirtieth` | meaning | \(30th\) 第三十 | 第三十 | E9 / high：释义含排版转义残留 \(30th\)（E9） |
| 70 | `twenty` | meaning | 二十一 | 二十 | E7 / high：词义错位：twenty 应为“二十”而非“二十一”（E7） |
| 71 | `twenty-first` | meaning | \(21st\) 第二十一 | 第二十一 | E9 / high：释义含排版转义残留 \(21st\)（E9） |
| 72 | `twenty-second` | meaning | \(22nd\) 第二十二 | 第二十二 | E9 / high：释义含排版转义残留 \(22nd\)（E9） |
| 73 | `twenty-third` | meaning | \(23rd\) 第二十三 | 第二十三 | E9 / high：释义含排版转义残留 \(23rd\)（E9） |
| 74 | `uncle` | meaning | 叔叔，舅舅，婕夫 | 叔叔；舅舅；姨夫 | E7 / high：中文错别字“婕夫”应为“姨夫”（E7） |
| 75 | `wash the clothes` | meaning | 洗衣服. .洗衣服 | 洗衣服 | E3 / high：释义重复残留“洗衣服. .洗衣服”（E3） |
| 76 | `zoo` | meaning | 动物园动物园 | 动物园 | E3 / high：释义重复残留“动物园动物园”（E3） |

### 2.3 `reports/word-audit/primary-leftover.json`（最终生效 15 处）

| 序号 | id | 字段 | 修正前 | 修正后 | 说明（E 类别 / 置信度） |
|---:|---|---|---|---|---|
| 77 | `(fri.)` | word | (Fri.) | Fri. | E5 / medium：词形被圆括号包裹的星期缩写噪声（E5），去括号保留缩写点 |
| 78 | `(mon.)` | word | (Mon.) | Mon. | E5 / medium：词形被圆括号包裹的星期缩写噪声（E5），去括号保留缩写点 |
| 79 | `(sat.)` | word | (Sat.) | Sat. | E5 / medium：词形被圆括号包裹的星期缩写噪声（E5），去括号保留缩写点 |
| 80 | `(sun.)` | word | (Sun.) | Sun. | E5 / medium：词形被圆括号包裹的星期缩写噪声（E5），去括号保留缩写点 |
| 81 | `(thu.)` | word | (Thu.) | Thu. | E5 / medium：词形被圆括号包裹的星期缩写噪声（E5），去括号保留缩写点 |
| 82 | `(tue.)` | word | (Tue.) | Tue. | E5 / medium：词形被圆括号包裹的星期缩写噪声（E5），去括号保留缩写点 |
| 83 | `miss` | meaning | 小姐. | 小姐 | E5 / high：释义尾部残留 ASCII 句点/空格噪声（E5），仅删除尾部句点与首尾空格 |
| 84 | `mr` | meaning | 先生. | 先生 | E5 / high：释义尾部残留 ASCII 句点/空格噪声（E5），仅删除尾部句点与首尾空格 |
| 85 | `north` | meaning | 北方；向北方. | 北方；向北方 | E5 / high：释义尾部残留 ASCII 句点/空格噪声（E5），仅删除尾部句点与首尾空格 |
| 86 | `off` | meaning | 距；离；离开. | 距；离；离开 | E5 / high：释义尾部残留 ASCII 句点/空格噪声（E5），仅删除尾部句点与首尾空格 |
| 87 | `put away the clothes` | meaning | 收拾衣服. | 收拾衣服 | E5 / high：释义尾部残留 ASCII 句点/空格噪声（E5），仅删除尾部句点与首尾空格 |
| 88 | `shelf` | meaning | 书架. | 书架 | E5 / high：释义尾部残留 ASCII 句点/空格噪声（E5），仅删除尾部句点与首尾空格 |
| 89 | `sweater` | meaning | 毛衣 . | 毛衣 | E5 / high：释义尾部残留 ASCII 句点/空格噪声（E5），仅删除尾部句点与首尾空格 |
| 90 | `these` | meaning | 这些. | 这些 | E5 / high：释义尾部残留 ASCII 句点/空格噪声（E5），仅删除尾部句点与首尾空格 |
| 91 | `those` | meaning | 那些. | 那些 | E5 / high：释义尾部残留 ASCII 句点/空格噪声（E5），仅删除尾部句点与首尾空格 |

### 2.4 `backend/enrichment/primary_audit_truncated_fix.json`（最终生效 14 处）

| 序号 | id | 字段 | 修正前 | 修正后 | 说明（E 类别 / 置信度） |
|---:|---|---|---|---|---|
| 92 | `a` | meaning | few 一些 | 一（用于单数可数名词前） | - / high：主控裁决：行内拆行条目恢复词头本义 / 短语词形（切片取值与 word 不对应）；〔此前切片取值「一些」已被本裁决取代〕 |
| 93 | `art` | meaning | room 美术教室 | 美术；艺术 | - / high：主控裁决：行内拆行条目恢复词头本义 / 短语词形（切片取值与 word 不对应）；〔此前切片取值「美术教室」已被本裁决取代〕 |
| 94 | `be` | meaning | careful 小心 | 是；成为 | - / high：主控裁决：行内拆行条目恢复词头本义 / 短语词形（切片取值与 word 不对应）；〔此前切片取值「小心」已被本裁决取代〕 |
| 95 | `dining` | meaning | hall 饭厅 | 用餐；进餐 | - / high：主控裁决：行内拆行条目恢复词头本义 / 短语词形（切片取值与 word 不对应）；〔此前切片取值「饭厅」已被本裁决取代〕 |
| 96 | `doing` | meaning | morning exercises 正在晨练 | 做；干 | - / high：主控裁决：行内拆行条目恢复词头本义 / 短语词形（切片取值与 word 不对应）；〔此前切片取值「正在晨练」已被本裁决取代〕 |
| 97 | `easter` | meaning | party 复活节派对 | 复活节 | - / high：主控裁决：行内拆行条目恢复词头本义 / 短语词形（切片取值与 word 不对应）；〔此前切片取值「复活节派对」已被本裁决取代〕 |
| 98 | `eating` | meaning | breakfast 正在吃早饭 | 吃 | - / high：主控裁决：行内拆行条目恢复词头本义 / 短语词形（切片取值与 word 不对应）；〔此前切片取值「正在吃早饭」已被本裁决取代〕 |
| 99 | `had` | meaning | a cold 感冒 | have 的过去式；有 | - / high：主控裁决：行内拆行条目恢复词头本义 / 短语词形（切片取值与 word 不对应）；〔此前切片取值「感冒」已被本裁决取代〕 |
| 100 | `keep` | meaning | your desk clean 保持你的桌面整洁 | 保持；保有 | - / high：主控裁决：行内拆行条目恢复词头本义 / 短语词形（切片取值与 word 不对应）；〔此前切片取值「保持你的桌面整洁」已被本裁决取代〕 |
| 101 | `labour` | meaning | Day 劳动节 | 劳动；劳工 | - / high：主控裁决：行内拆行条目恢复词头本义 / 短语词形（切片取值与 word 不对应）；〔此前切片取值「劳动节」已被本裁决取代〕 |
| 102 | `listening` | meaning | to music 正在听音乐 | 听；倾听 | - / high：主控裁决：行内拆行条目恢复词头本义 / 短语词形（切片取值与 word 不对应）；〔此前切片取值「正在听音乐」已被本裁决取代〕 |
| 103 | `living` | meaning | room 客厅；起居室 | 生活；居住 | - / high：主控裁决：行内拆行条目恢复词头本义 / 短语词形（切片取值与 word 不对应）；〔此前切片取值「客厅；起居室」已被本裁决取代〕 |
| 104 | `reading` | meaning | a book 正在看书 | 阅读；读书 | - / high：主控裁决：行内拆行条目恢复词头本义 / 短语词形（切片取值与 word 不对应）；〔此前切片取值「正在看书」已被本裁决取代〕 |
| 105 | `labour` | word | Labour | labour | - / high：主控裁决：行内拆行条目恢复词头本义 / 短语词形（切片取值与 word 不对应） |

## 3. middle_school.json 全量清单（最终 317 处）

| 补丁文件 | 清单条数 | 最终生效 |
|---|---:|---:|
| `reports/word-audit/middle-a-c.json` | 67 | 66 |
| `reports/word-audit/middle-d-i.json` | 80 | 80 |
| `reports/word-audit/middle-j-p.json` | 68 | 68 |
| `reports/word-audit/middle-q-z.json` | 84 | 84 |
| `reports/word-audit/middle-final.json` | 9 | 8 |
| `reports/word-audit/middle-abbrev.json` | 11 | 11 |
| **合计（去重后）** | 319 | **317** |

### 3.1 `reports/word-audit/middle-a-c.json`（最终生效 66 处）

| 序号 | id | 字段 | 修正前 | 修正后 | 说明（E 类别 / 置信度） |
|---:|---|---|---|---|---|
| 1 | `ability` | meaning | 能力；才能 p.6 | 能力；才能 | E1 / high：释义残留教材页码（E1） |
| 2 | `active` | meaning | 活跃的；积极的 p.6 | 活跃的；积极的 | E1 / high：释义残留教材页码（E1） |
| 3 | `admire` | meaning | 欣赏；仰慕 p.11 | 欣赏；仰慕 | E1 / high：释义残留教材页码（E1） |
| 4 | `alfred` | meaning | 艾尔弗雷德（男名） p.26 | 艾尔弗雷德（男名） | E1 / high：释义残留教材页码（E1） |
| 5 | `alien` | meaning | 外星人 p.61 | 外星人 | E1 / high：释义残留教材页码（E1） |
| 6 | `all of a sudden` | meaning | 突然; 猛地p.44 | 突然; 猛地 | E1 / high：释义残留教材页码（E1） |
| 7 | `aloud` | meaning | 大声地；出声地 p.2 | 大声地；出声地 | E1 / high：释义残留教材页码（E1） |
| 8 | `ancestor` | meaning | 祖宗；祖先 p.62 | 祖宗；祖先 | E1 / high：释义残留教材页码（E1） |
| 9 | `annie` | meaning | 安妮（女名）p.2 | 安妮（女名） | E1 / high：释义残留教材页码（E1） |
| 10 | `attend` | meaning | 出席；参加 p.58 | 出席；参加 | E1 / high：释义残留教材页码（E1） |
| 11 | `attention` | meaning | 注意；关注 p.6 | 注意；关注 | E1 / high：释义残留教材页码（E1） |
| 12 | `avoid` | meaning | 避免；回避 p.35 | 避免；回避 | E1 / high：释义残留教材页码（E1） |
| 13 | `billy` | meaning | 比利（男名）p.26 | 比利（男名） | E1 / high：释义残留教材页码（E1） |
| 14 | `biscuit` | meaning | 饼干 p.44 | 饼干 | E1 / high：释义残留教材页码（E1） |
| 15 | `blouse` | meaning | （女士）短上衣；衬衫p.33 | （女士）短上衣；衬衫 | E1 / high：释义残留教材页码（E1） |
| 16 | `brain` | meaning | 大脑 p.6 | 大脑 | E1 / high：释义残留教材页码（E1） |
| 17 | `brand` | meaning | 品牌；牌子 p.35 | 品牌；牌子 | E1 / high：释义残留教材页码（E1） |
| 18 | `britain` | meaning | (= Great Britain) 大不列颠p.62 | (= Great Britain) 大不列颠 | E1 / high：释义残留教材页码（E1） |
| 19 | `burial` | meaning | 埋葬；安葬 p.62 | 埋葬；安葬 | E1 / high：释义残留教材页码（E1） |
| 20 | `business` | meaning | 生意；商业 p.14 | 生意；商业 | E1 / high：释义残留教材页码（E1） |
| 21 | `by mistake` | meaning | 错误地；无意中p.45 | 错误地；无意中 | E1 / high：释义残留教材页码（E1） |
| 22 | `candy` | meaning | 坎迪（女名） p.27 | 坎迪（女名） | E1 / high：释义残留教材页码（E1） |
| 23 | `cap` | meaning | （尤指有帽舌的）帽p.36 | （尤指有帽舌的）帽 | E1 / high：释义残留教材页码（E1） |
| 24 | `carla` | meaning | 卡拉（女名） p.57 | 卡拉（女名） | E1 / high：释义残留教材页码（E1） |
| 25 | `chemistry` | meaning | 化学 p.4 | 化学 | E1 / high：释义残留教材页码（E1） |
| 26 | `choice` | meaning | 选择；挑选 p.22 | 选择；挑选 | E1 / high：释义残留教材页码（E1） |
| 27 | `coat` | meaning | 外套；外衣 p.60 | 外套；外衣 | E1 / high：释义残留教材页码（E1） |
| 28 | `coin` | meaning | 硬币 p.33 | 硬币 | E1 / high：释义残留教材页码（E1） |
| 29 | `connect … with` | meaning | 把⋯⋯和⋯⋯连接或联系起来 p.6 | 把⋯⋯和⋯⋯连接或联系起来 | E1 / high：释义残留教材页码（E1） |
| 30 | `conversation` | meaning | 交谈；谈话 p.2 | 交谈；谈话 | E1 / high：释义残留教材页码（E1） |
| 31 | `cookie` | meaning | 曲奇饼干 p.44 | 曲奇饼干 | E1 / high：释义残留教材页码（E1） |
| 32 | `corner` | meaning | 拐角；角落 p.21 | 拐角；角落 | E1 / high：释义残留教材页码（E1） |
| 33 | `cotton` | meaning | 棉；棉花p.33 | 棉；棉花 | E1 / high：释义残留教材页码（E1） |
| 34 | `crispy` | meaning | 脆的；酥脆的 p.45 | 脆的；酥脆的 | E1 / high：释义残留教材页码（E1） |
| 35 | `address` | meaning | / ædres/ n. 地址；通讯处p.22 | 地址；通讯处 | E1 / high：释义混入音标 / ædres/ 与词性 n.，并残留页码 p.22（E1、E2、E3） |
| 36 | `circle` | meaning | 圆圈 v. 圈出 p.62 | 圆圈；圈出 | E1 / high：释义残留词性标记 v. 与页码 p.62（E1、E3） |
| 37 | `clara` | meaning | /klerə/ 克拉拉（女名）p.10 | 克拉拉（女名） | E1 / high：释义混入音标 /klerə/ 并残留页码 p.10（E1、E2） |
| 38 | `convenient` | meaning | a. 便利的；方便的 p.21 | 便利的；方便的 | E1 / high：释义残留词性标记 a. 与页码 p.21（E1、E3） |
| 39 | `canadian` | meaning | a. /n .加拿大/人的 p.46 | 加拿大的；加拿大人的 | E1 / medium：释义残留词性标记 a. /n . 并残留页码 p.46（E1、E3） |
| 40 | `burn` | meaning | (burnt /bə:(r)nt/, burned /;burnt, burned) 着火；燃烧 | 着火；燃烧 | E2 / medium：释义混入音标与残缺变形说明（残留 /;）（E2、E4） |
| 41 | `apple` | meaning | 苹果then /ðen/ adv. 那么 | 苹果 | E2 / high：释义串入相邻词条 then /ðen/ adv. 那么（E2） |
| 42 | `chiang mai` | meaning | /dʒa:nmaI/ 清迈（泰城市） | 清迈（泰城市） | E2 / medium：释义混入音标文本 /dʒa:nmaI/（E2） |
| 43 | `around` | meaning | the world世界各地 | 世界各地 | E2 / low：释义混入相邻词条英文残片 the world（E2） |
| 44 | `bring good luck` | meaning | to…给……带来好运 | 给……带来好运 | E2 / high：释义混入残片 to…，无中文前置（E2、E3） |
| 45 | `also` | meaning | ad. v.也；而且 | 也；而且 | E3 / high：释义残留词性标记 ad. v.（E3） |
| 46 | `amazing` | meaning | a. 令人惊奇/喜的 | 令人惊奇的 | E3 / high：释义残留词性标记 a. 及残缺分隔 /喜的（E3） |
| 47 | `appear` | meaning | i.出现；出版；显得 | 出现；出版；显得 | E3 / high：释义残留词性残片 i.（E3） |
| 48 | `anywhere` | meaning | 任何地方 n.任何(一个)地方 | 任何地方 | E3 / medium：释义中混入词性标记 n.（E3） |
| 49 | `australian` | meaning | a. 澳大利亚/人的 | 澳大利亚的；澳大利亚人的 | E3 / medium：释义残留词性标记 a.，斜杠分隔残缺（E3） |
| 50 | `before` | meaning | conj在…以前ad v.以前 | 在…以前；以前 | E3 / high：释义混入词性标记 conj / ad v.（E3） |
| 51 | `below` | meaning | 低于；在...下面adv.在下面 | 低于；在...下面；在下面 | E3 / high：释义混入词性标记 adv.（E3） |
| 52 | `best` | meaning | & ad. v.(good, well的比较级)最好的(地) | 最好的；最好地 | E3 / medium：释义混入词性标记 & ad. v.（E3） |
| 53 | `can` | meaning | aux 能,可以,会 | 能,可以,会 | E3 / high：释义残留词性标记 aux（E3） |
| 54 | `centre` | meaning | (center ['sentə]) n 中心 | 中心 | E2 / high：释义混入音标与词性标记 (center ['sentə]) n（E2、E3） |
| 55 | `chinese` | meaning | 中国的,中国人的；n中国人,汉语 | 中国的,中国人的；中国人,汉语 | E3 / medium：释义中间混入词性标记 n（E3） |
| 56 | `colour` | meaning | 颜色；v 给...着色 | 颜色；给...着色 | E3 / medium：释义混入词性标记 v（E3） |
| 57 | `could` | meaning | aux (口语,表示许可或请求)可以,行 | (口语,表示许可或请求)可以,行 | E3 / high：释义残留词性标记 aux（E3） |
| 58 | `amaze` | meaning | 使…大为惊讶，使惊 | 使…大为惊讶，使惊奇 | E7 / medium：释义截断不全（'使惊'非完整词）（E7） |
| 59 | `america` | meaning | 美国人(的) | 美国；美洲 | E7 / medium：释义与词形不对应（'美国人(的)' 属于 American）（E7） |
| 60 | `basketball` | meaning | 蓝球 | 篮球 | E7 / high：释义中文错别字'蓝球'（E7） |
| 61 | `chips` | meaning | (口语)炸士豆儿条 | (口语)炸土豆条 | E7 / high：释义中文错别字'炸士豆儿条'（E7） |
| 62 | `criminal` | meaning | 犯罪 | 罪犯 | E7 / medium：释义与词性/词形不对应（criminal n. 应为'罪犯'）（E7） |
| 63 | `better` | meaning | (goo或well的比较级)更好的 | (good或well的比较级)更好的 | E7 / high：释义英文错别字'goo'应为 good（E7） |
| 64 | `at the beginning of phr. …` | word | at the beginning of phr. … | at the beginning of | E5 / high：词形混入词性标记 phr. 与省略号残片（E5） |
| 65 | `america` | pos | n & adj | n. | E8 / medium：America 为名词，与词义'美国；美洲'矛盾（E8） |
| 66 | `another` | pos | adj&conj | adj & pron | E8 / medium：another 为形容词/代词，标成 conj 明显矛盾（E8） |

### 3.2 `reports/word-audit/middle-d-i.json`（最终生效 80 处）

| 序号 | id | 字段 | 修正前 | 修正后 | 说明（E 类别 / 置信度） |
|---:|---|---|---|---|---|
| 67 | `dead` | meaning | 死的；失去生命的 p.14 | 死的；失去生命的 | E1 / high：释义残留教材页码 p.14（E1） |
| 68 | `deal with` | meaning | 对 付; 应付 | 对付; 应付 | E3 / medium：释义中文部分含空白噪声「对 付」，去除空格（E3） |
| 69 | `deer` | meaning | (pl.deer) n 鹿 | (pl.deer) 鹿 | E3 / high：释义残留词性标记 n（E3） |
| 70 | `degree` | meaning | （.大学）学位 | （大学）学位 | E3 / high：释义含残留标点「.」（E3/E9） |
| 71 | `delicious` | meaning | 可口的.美味 的 | 可口的；美味的 | E3 / high：释义含残留标点「.」与多余空格（E3） |
| 72 | `direct` | meaning | 直接的；直率的p.22 | 直接的；直率的 | E1 / high：释义残留教材页码 p.22（E1） |
| 73 | `discover` | meaning | 发现；发觉 p.3 | 发现；发觉 | E1 / high：释义残留教材页码 p.3（E1） |
| 74 | `dish` | meaning | 碟；盘dishes | 碟；盘 | E2 / high：释义末尾串入相邻词条 dishes（E2） |
| 75 | `dislike` | meaning | 不喜欢；厌恶 n.不喜爱；厌恶；反感 | 不喜欢；厌恶 | E3 / high：释义残留词性标记 n.（E3） |
| 76 | `divide ... into` | meaning | 把⋯⋯分开 p.46 | 把⋯⋯分开 | E1 / high：释义残留教材页码 p.46（E1） |
| 77 | `do` | meaning | v. &v. 用于否定句疑问句；做；干 | 用于否定句疑问句；做；干 | E3 / high：释义残留词性标记 v. &v.（E3） |
| 78 | `doubt` | meaning | 疑惑；疑问 v. 怀疑 | 疑惑；疑问；怀疑 | E3 / high：释义残留词性标记 v.（E3） |
| 79 | `down` | meaning | ad. v.（坐躺倒）下 | （坐躺倒）下 | E3 / high：释义残留词性标记 ad. v.（E3） |
| 80 | `drum` | meaning | 喇叭 | 鼓 | E7 / high：释义与词形不对应：drum 意为「鼓」而非「喇叭」（E7） |
| 81 | `early` | meaning | 早的(地)初期 | 早的(地)；初期的 | E3 / medium：释义义项粘连、缺少分隔（E3） |
| 82 | `earthquake` | meaning | 地震 p.44 | 地震 | E1 / high：释义残留教材页码 p.44（E1） |
| 83 | `east` | meaning | 东方的adv. 向东； n.东方 p.20 | 东方的；向东；东方 | E1 / high：释义残留词性标记与页码 p.20（E1/E3） |
| 84 | `eight` | meaning | um. 八 | 八 | E3 / high：释义残留词性标记 um.（E3） |
| 85 | `eighteen` | meaning | um. 十八 | 十八 | E3 / high：释义残留词性标记 um.（E3） |
| 86 | `eighteenth` | meaning | um 第十八 | 第十八 | E3 / high：释义残留词性标记 um（E3） |
| 87 | `eighth` | meaning | um. 第八 | 第八 | E3 / high：释义残留词性标记 um.（E3） |
| 88 | `elder` | meaning | 年级较长的 | 年纪较长的 | E7 / medium：释义错别字：年级→年纪（E7） |
| 89 | `electronic` | meaning | a. 电子(设备)的 | 电子(设备)的 | E3 / high：释义残留词性标记 a.（E3） |
| 90 | `eleven` | meaning | um. 十一 | 十一 | E3 / high：释义残留词性标记 um.（E3） |
| 91 | `embarrassing` | meaning | a. 使人害羞的 | 使人害羞的 | E3 / high：释义残留词性标记 a.（E3） |
| 92 | `emily` | meaning | 埃米莉（女名） p.28 | 埃米莉（女名） | E1 / high：释义残留教材页码 p.28（E1） |
| 93 | `enemy` | meaning | 敌人；仇人 p.62 | 敌人；仇人 | E1 / high：释义残留教材页码 p.62（E1） |
| 94 | `energy` | meaning | 精力；力量 p.62 | 精力；力量 | E1 / high：释义残留教材页码 p.62（E1） |
| 95 | `english` | meaning | 英语adj. 英格兰的；英语的 | 英语；英格兰的；英语的 | E3 / high：释义残留词性标记 adj.（E3） |
| 96 | `enough` | meaning | 足够的adv.足够地；充分地 | 足够的；足够地；充分地 | E3 / high：释义残留词性标记 adv.（E3） |
| 97 | `even though` | meaning | 虽然；即使 p.35 | 虽然；即使 | E1 / high：释义残留教材页码 p.35（E1） |
| 98 | `examine` | meaning | （.仔细地）检查；检验 | （仔细地）检查；检验 | E3 / high：释义含残留标点「.」（E3/E9） |
| 99 | `except` | meaning | 除……之外 conj. 除了；只是 | 除……之外；除了；只是 | E3 / high：释义残留词性标记 conj.（E3） |
| 100 | `experience` | meaning | 信任；经历 | 经验；经历 | E7 / high：释义与词形不对应：experience 意为「经验」而非「信任」（E7） |
| 101 | `express` | meaning | 表示；表达 p.62 | 表示；表达 | E1 / high：释义残留教材页码 p.62（E1） |
| 102 | `expression` | meaning | 表达（方式）；表示 p.3 | 表达（方式）；表示 | E1 / high：释义残留教材页码 p.3（E1） |
| 103 | `faithfully` | meaning | 忠实地；忠诚地p.24 | 忠实地；忠诚地 | E1 / high：释义残留教材页码 p.24（E1） |
| 104 | `fall in love with` | meaning | 爱上；与⋯⋯相爱 p.3 | 爱上；与⋯⋯相爱 | E1 / high：释义残留教材页码 p.3（E1） |
| 105 | `fascinating` | meaning | a.迷人的；有吸引力的p.21 | 迷人的；有吸引力的 | E1 / high：释义残留词性标记 a. 与页码 p.21（E1/E3） |
| 106 | `few` | meaning | 很少的；n.少量 | 很少的；少量 | E3 / high：释义残留词性标记 n.（E3） |
| 107 | `fifteen` | meaning | um. 十五 | 十五 | E3 / high：释义残留词性标记 um.（E3） |
| 108 | `fifth` | meaning | um & adj 第五(的) | 第五(的) | E3 / high：释义残留词性标记 um & adj（E3） |
| 109 | `fifty` | meaning | um 五十 | 五十 | E3 / high：释义残留词性标记 um（E3） |
| 110 | `fin` | meaning | （.鱼）鳍 | （鱼）鳍 | E3 / high：释义含残留标点「.」（E3/E9） |
| 111 | `first` | meaning | um & adv 第一,首先,最初 | 第一,首先,最初 | E3 / high：释义残留词性标记 um & adv（E3） |
| 112 | `five` | meaning | um 五 | 五 | E3 / high：释义残留词性标记 um（E3） |
| 113 | `fool` | meaning | 蠢人；傻瓜 v. 愚弄adj. 愚蠢的 | 蠢人；傻瓜；愚弄；愚蠢的 | E3 / high：释义残留词性标记 v./adj.（E3） |
| 114 | `fork` | meaning | 餐叉，叉子p.33 | 餐叉，叉子 | E1 / high：释义残留教材页码 p.33（E1） |
| 115 | `forty` | meaning | um四十 | 四十 | E3 / high：释义残留词性标记 um（E3） |
| 116 | `four` | meaning | um. 四 | 四 | E3 / high：释义残留词性标记 um.（E3） |
| 117 | `fourteen` | meaning | um 十四 | 十四 | E3 / high：释义残留词性标记 um（E3） |
| 118 | `france` | meaning | /fr{ns/ 法国 p.35 | 法国 | E2 / high：释义混入音标文本 /fr{ns/ 与页码 p.35（E2/E1） |
| 119 | `fridge` | meaning | 冰箱 p.44 | 冰箱 | E1 / high：释义残留教材页码 p.44（E1） |
| 120 | `fun` | meaning | 有趣的；使人快乐的n.乐趣；快乐 | 有趣的；使人快乐的；乐趣；快乐 | E3 / high：释义残留词性标记 n.（E3） |
| 121 | `garden` | meaning | 花园；园子 p.11 | 花园；园子 | E1 / high：释义残留教材页码 p.11（E1） |
| 122 | `general` | meaning | a. 普遍的；常规的；总的；将军 | 普遍的；常规的；总的；将军 | E3 / high：释义残留词性标记 a.（E3） |
| 123 | `germany` | meaning | 德国 p.36 | 德国 | E1 / high：释义残留教材页码 p.36（E1） |
| 124 | `get...back` | meaning | 退还；送 回去；取 回 | 退还；送回去；取回 | E3 / medium：释义中文部分含空白噪声「送 回去」「取 回」（E3） |
| 125 | `glass` | meaning | 玻璃 p.33 | 玻璃 | E1 / high：释义残留教材页码 p.33（E1） |
| 126 | `grammar` | meaning | 语法 p.3 | 语法 | E1 / high：释义残留教材页码 p.3（E1） |
| 127 | `grandmother` | meaning | （外）祖母；奶奶grandfather /'grænfa:ðə/ n. (外)祖父；爷爷 | （外）祖母；奶奶 | E2 / high：释义串入相邻词条 grandfather 的音标与释义（E2） |
| 128 | `grandpa` | meaning | （外）祖父；爷爷；外公mom /mɔm/, /ma:m/ n. (=mum)妈妈 | （外）祖父；爷爷；外公 | E2 / high：释义串入相邻词条 mom 的音标与释义（E2） |
| 129 | `grass` | meaning | 草；草地 P.34 | 草；草地 | E1 / high：释义残留教材页码 P.34（E1） |
| 130 | `grey` | meaning | a. 阴沉的；昏暗的；灰色的 | 阴沉的；昏暗的；灰色的 | E3 / high：释义残留词性标记 a.（E3） |
| 131 | `guard` | meaning | 警卫；看守v. 守卫；保卫 | 警卫；看守；守卫；保卫 | E3 / high：释义残留词性标记 v.（E3） |
| 132 | `halfway` | meaning | 中途的adv.半路地 | 中途的；半路地 | E3 / high：释义残留词性标记 adv.（E3） |
| 133 | `halloween` | meaning | 万圣节前夕 p.13 | 万圣节前夕 | E1 / high：释义残留教材页码 p.13（E1） |
| 134 | `handbag` | meaning | 小手提包p.35 | 小手提包 | E1 / high：释义残留教材页码 p.35（E1） |
| 135 | `happen` | meaning | i.发生；碰巧；出现；偶遇 | 发生；碰巧；出现；偶遇 | E3 / high：释义残留词性标记 i.（E3） |
| 136 | `haunted` | meaning | a. 有鬼魂出没的 | 有鬼魂出没的 | E3 / high：释义残留词性标记 a.（E3） |
| 137 | `have a try` | meaning | 尝试；努力；射击 | 尝试；试一试 | E7 / medium：释义含无关义项「射击」，与 have a try 不对应（E7） |
| 138 | `hey` | meaning | 嘿;喂(唤起注意.表示惊讶或询问) | 嘿;喂(唤起注意，表示惊讶或询问) | E3 / medium：释义中文夹用英文句点作停顿（E3） |
| 139 | `honor` | meaning | (= honour) 尊重；表示敬意 n. 荣幸 | (= honour) 尊重；表示敬意；荣幸 | E3 / high：释义残留词性标记 v./n.（E3） |
| 140 | `hope` | meaning | 希望；期望；盼望n.希望 | 希望；期望；盼望 | E3 / high：释义末尾残留词性标记 n.（E3） |
| 141 | `hundred` | meaning | um 百 | 百 | E3 / high：释义残留词性标记 um（E3） |
| 142 | `hundreds of` | meaning | 许多 ；大量； 成百上千 | 许多；大量；成百上千 | E3 / medium：释义中文分号前后含多余空格（E3） |
| 143 | `increase` | meaning | 增加；增长 p.5 | 增加；增长 | E1 / high：释义残留教材页码 p.5（E1） |
| 144 | `intelligent` | meaning | a. 有才智的；聪明的 | 有才智的；聪明的 | E3 / high：释义残留词性标记 a.（E3） |
| 145 | `introduction` | meaning | 介绍 p.32 | 介绍 | E1 / high：释义残留教材页码 p.32（E1） |
| 146 | `italian` | meaning | a. 意大利\人的；n. 意大利人\语 | 意大利的；意大利人；意大利语 | E9 / medium：释义含排版转义残留「\」与词性标记 a./n.（E9/E3） |

### 3.3 `reports/word-audit/middle-j-p.json`（最终生效 68 处）

| 序号 | id | 字段 | 修正前 | 修正后 | 说明（E 类别 / 置信度） |
|---:|---|---|---|---|---|
| 147 | `jean` | meaning | 琼（女名） p.60 | 琼（女名） | E1 / high：E1 释义残留教材页码 |
| 148 | `jerry` | meaning | 杰里（男名）；杰丽（女名）p.28 | 杰里（男名）；杰丽（女名） | E1 / high：E1 释义残留教材页码 |
| 149 | `knowledge` | meaning | 知识；学问p.6 | 知识；学问 | E1 / high：E1 释义残留教材页码 |
| 150 | `lantern` | meaning | 灯笼 p.9 | 灯笼 | E1 / high：E1 释义残留教材页码 |
| 151 | `leader` | meaning | 领导；领袖 p.62 | 领导；领袖 | E1 / high：E1 释义残留教材页码 |
| 152 | `local` | meaning | 当地的；本地的 p.35 | 当地的；本地的 | E1 / high：E1 释义残留教材页码 |
| 153 | `lock` | meaning | /la:k/ v. 锁上；锁住p.44 | 锁上；锁住 | E2 / high：E2 释义混入相邻词条/音标文本 |
| 154 | `look up to` | meaning | 钦佩； p.46 | 钦佩 | E1 / high：E1 释义残留教材页码 |
| 155 | `mail` | meaning | 邮寄；发电子邮件n. 邮件p.20 | 邮寄；发电子邮件；邮件 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 156 | `mall` | meaning | 商场；购物中心 p.21 | 商场；购物中心 | E1 / high：E1 释义残留教材页码 |
| 157 | `material` | meaning | 材料；原料 p.33 | 材料；原料 | E1 / high：E1 释义残留教材页码 |
| 158 | `mystery` | meaning | 奥秘；神秘事物 p.64 | 奥秘；神秘事物 | E1 / high：E1 释义残留教材页码 |
| 159 | `no matter` | meaning | 不论;无论 p.35 | 不论；无论 | E1 / high：E1 释义残留教材页码 |
| 160 | `noise` | meaning | 声音；噪音 p.59 | 声音；噪音 | E1 / high：E1 释义残留教材页码 |
| 161 | `not only … but also` | meaning | 不但……，而且 p.62 | 不但……，而且 | E1 / high：E1 释义残留教材页码 |
| 162 | `note` | meaning | 笔记；记录 v. 注意；指出p.4 | 笔记；记录；注意；指出 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 163 | `overnight` | meaning | 一夜之间；在夜间 p.6 | 一夜之间；在夜间 | E1 / high：E1 释义残留教材页码 |
| 164 | `pal` | meaning | 朋友；伙伴p.4 | 朋友；伙伴 | E1 / high：E1 释义残留教材页码 |
| 165 | `pardon` | meaning | 请再说一遍；p.18 | 请再说一遍 | E1 / high：E1 释义残留教材页码 |
| 166 | `partner` | meaning | 搭档；同伴 p.5 | 搭档；同伴 | E1 / high：E1 释义残留教材页码 |
| 167 | `patient` | meaning | 有耐心的 n. 病人p.2 | 有耐心的；病人 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 168 | `pattern` | meaning | /pætən/ n. 模式；方式p.4 | 模式；方式 | E2 / high：E2 释义混入相邻词条/音标文本 |
| 169 | `paula` | meaning | 葆拉 （女名） p.26 | 葆拉（女名） | E1 / high：E1 释义残留教材页码 |
| 170 | `pay attention to` | meaning | 注意；关注 p.6 | 注意；关注 | E1 / high：E1 释义残留教材页码 |
| 171 | `period` | meaning | 一段时间；时期 p.62 | 一段时间；时期 | E1 / high：E1 释义残留教材页码 |
| 172 | `physics` | meaning | 物理；物理学 p.4 | 物理；物理学 | E1 / high：E1 释义残留教材页码 |
| 173 | `picnic` | meaning | 野餐 p.58 | 野餐 | E1 / high：E1 释义残留教材页码 |
| 174 | `policeman` | meaning | 男警察 p.59 | 男警察 | E1 / high：E1 释义残留教材页码 |
| 175 | `position` | meaning | 位置；地方 p.62 | 位置；地方 | E1 / high：E1 释义残留教材页码 |
| 176 | `prevent` | meaning | 阻止；阻挠 p.62 | 阻止；阻挠 | E1 / high：E1 释义残留教材页码 |
| 177 | `product` | meaning | 产品；制品p.35 | 产品；制品 | E1 / high：E1 释义残留教材页码 |
| 178 | `pronounce` | meaning | 发音 p.5 | 发音 | E1 / high：E1 释义残留教材页码 |
| 179 | `punish` | meaning | 处罚；惩罚 p.14 | 处罚；惩罚 | E1 / high：E1 释义残留教材页码 |
| 180 | `purpose` | meaning | 目的；目标 p.46 | 目的；目标 | E1 / high：E1 释义残留教材页码 |
| 181 | `lab` | meaning | (=laboratory[lə'bɔrətəri])n实验室 | 实验室 | E2 / medium：E2 释义混入相邻词条/音标文本 |
| 182 | `novel` | meaning | /na:vl/ n. （长篇）小说 | （长篇）小说 | E2 / high：E2 释义混入相邻词条/音标文本 |
| 183 | `pear` | meaning | 梨milk /milk/ n. 牛奶 | 梨 | E2 / high：E2 释义混入相邻词条/音标文本 |
| 184 | `price` | meaning | 价格boy /bɔi/ n. 男孩 | 价格 | E2 / high：E2 释义混入相邻词条/音标文本 |
| 185 | `japanese` | meaning | 日本的,日本人的；n日本人，日语 | 日本的,日本人的；日本人，日语 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 186 | `joke` | meaning | 笑话；玩笑v.说笑话；开玩笑 | 笑话；玩笑；说笑话；开玩笑 | E3 / medium：E3 释义残留词性标记/编号噪声 |
| 187 | `laugh` | meaning | 发笑；笑；嘲笑 n.笑声；笑；笑料 | 发笑；笑；嘲笑；笑声；笑料 | E3 / medium：E3 释义残留词性标记/编号噪声 |
| 188 | `litter` | meaning | 乱扔 n. 垃圾；废弃物 | 乱扔；垃圾；废弃物 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 189 | `lively` | meaning | a. 生气勃勃的;（色彩）鲜艳的 | 生气勃勃的；（色彩）鲜艳的 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 190 | `loud` | meaning | 大声的；adv.大声地；响亮地 | 大声的；大声地；响亮地 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 191 | `low` | meaning | a 减少的；低的；矮的 | 减少的；低的；矮的 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 192 | `master` | meaning | 能手；主人 v. 掌握 | 能手；主人；掌握 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 193 | `may` | meaning | aux 可以;可能;也许 | 可以;可能;也许 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 194 | `must` | meaning | aux 必须,应当 | 必须,应当 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 195 | `neither` | meaning | adv. 二者都不；也不 | 二者都不；也不 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 196 | `nine` | meaning | um. 九 | 九 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 197 | `ninth` | meaning | um &adj 第九(的) | 第九(的) | E3 / high：E3 释义残留词性标记/编号噪声 |
| 198 | `off` | meaning | prep. 离开（某处）；从…去掉 | 离开（某处）；从…去掉 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 199 | `online` | meaning | 在线的adv.在线地 | 在线的；在线地 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 200 | `outside` | meaning | ad. v.在外面adj.外面的 | 在外面；外面的 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 201 | `over` | meaning | 超过；多于在… 上方 | 超过；多于；在…上方 | E3 / medium：E3 释义残留词性标记/编号噪声 |
| 202 | `peel` | meaning | t.剥落；削皮 | 剥落；削皮 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 203 | `pink` | meaning | 粉红色的n. 粉红色 | 粉红色的；粉红色 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 204 | `plan` | meaning | 计划；方法v.打算；计划 | 计划；方法；打算；计划 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 205 | `plastic` | meaning | 塑料的n. 塑料；塑胶 | 塑料的；塑料；塑胶 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 206 | `pool` | meaning | （复数pools） 游 泳池 | 游泳池 | E3 / medium：E3 释义残留词性标记/编号噪声 |
| 207 | `potato` | meaning | pl.potatoes 马铃薯;土豆 | 马铃薯;土豆 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 208 | `pretty` | meaning | 相当地adj.漂亮的 | 相当地；漂亮的 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 209 | `professional` | meaning | a. 职业的；专业的 | 职业的；专业的 | E3 / high：E3 释义残留词性标记/编号噪声 |
| 210 | `let's` | meaning | let us 的缩写形式 | 让我们……（let us 的缩写形式） | E4 / high：E4 释义无中文（仅变形说明） |
| 211 | `no` | meaning | number 的缩写形式 | 数字；号码（number 的缩写形式） | E4 / medium：E4 释义无中文（仅变形说明） |
| 212 | `overcome` | meaning | (overcame , overcome) | 克服；战胜（过去式 overcame，过去分词 overcome） | E4 / high：E4 释义无中文（仅变形说明） |
| 213 | `leave` | meaning | 离开；left （lea ve的过去式） | 离开；（过去式 left） | E5 / medium：E5 释义内混入断裂词形残片 |
| 214 | `moving` | meaning | 活动的；移动的；动的人 | 活动的；移动的；动人的 | E7 / medium：E7 词义破损/与词形不对应 |

### 3.4 `reports/word-audit/middle-q-z.json`（最终生效 84 处）

| 序号 | id | 字段 | 修正前 | 修正后 | 说明（E 类别 / 置信度） |
|---:|---|---|---|---|---|
| 215 | `quick` | meaning | 快的；迅速的 p.18 | 快的；迅速的 | E1 / high：释义残留教材页码 p.18（E1） |
| 216 | `quickly` | meaning | ad.v.很快的 | 很快地 | E3 / medium：释义残留词性标记 ad.v.，并订正副词用法「的」→「地」（E3） |
| 217 | `read` | pos | n | v. | E8 / medium：pos 与词义「读,阅读」矛盾，该义为动词（E8） |
| 218 | `receive` | meaning | 接受；收到 p.62 | 接受；收到 | E1 / high：释义残留教材页码 p.62（E1） |
| 219 | `repeat` | meaning | 重复；重做 p.4 | 重复；重做 | E1 / high：释义残留教材页码 p.4（E1） |
| 220 | `request` | meaning | 要求；请求 p.22 | 要求；请求 | E1 / high：释义残留教材页码 p.22（E1） |
| 221 | `restroom` | meaning | （美）洗手间；公共厕所p.17 | （美）洗手间；公共厕所 | E1 / high：释义残留教材页码 p.17（E1） |
| 222 | `review` | meaning | 回顾；复习 p.6 | 回顾；复习 | E1 / high：释义残留教材页码 p.6（E1） |
| 223 | `rush` | meaning | 仓促；急促 p.18 | 仓促；急促 | E1 / high：释义残留教材页码 p.18（E1） |
| 224 | `second` | meaning | um &adj 第二(的) | 第二(的) | E3 / high：释义残留编号/词性噪声 um &adj（E3） |
| 225 | `secret` | meaning | 秘密；adj. 秘密的； p.3 | 秘密；秘密的 | E1 / high：释义残留词性标记 adj. 与页码 p.3（E1/E3） |
| 226 | `seem` | meaning | i.似乎；好像 | 似乎；好像 | E3 / high：释义残留词性残片 i.（E3） |
| 227 | `senior` | meaning | a. 级别（或地位）高的 | 级别（或地位）高的 | E3 / high：释义残留词性标记 a.（E3） |
| 228 | `sense` | meaning | 感觉到；意识到n. 感觉；意识 | 感觉到；意识到；感觉；意识 | E3 / high：释义中部残留词性标记 n.（E3） |
| 229 | `sentence` | meaning | 句子 p.2 | 句子 | E1 / high：释义残留教材页码 p.2（E1） |
| 230 | `seven` | meaning | um. 七 | 七 | E3 / high：释义残留编号噪声 um.（E3） |
| 231 | `several` | pos | prep. | adj. | E8 / medium：pos 与词形/词义矛盾，several 非介词（E8） |
| 232 | `share` | meaning | t.分享，共享；分配；共有 | 分享，共享；分配；共有 | E3 / high：释义残留词性残片 t.（E3） |
| 233 | `shelf` | meaning | (pl | 架子；搁板 | E4 / high：释义被截断为「(pl」且无中文（E4） |
| 234 | `should` | meaning | aux (shall的过去式)将,会,应该 | (shall的过去式)将,会,应该 | E3 / high：释义残留词性标记 aux（E3） |
| 235 | `show` | meaning | 演出,展览 给...看,出示 | 演出,展览；给...看,出示 | E2 / medium：两个义项之间缺分隔符，连成一句（E2） |
| 236 | `shower` | meaning | v.淋浴;淋浴器（间） | 淋浴;淋浴器（间） | E3 / high：释义残留词性标记 v.（E3） |
| 237 | `six` | meaning | um. 六 | 六 | E3 / high：释义残留编号噪声 um.（E3） |
| 238 | `sleepy` | meaning | 困倦的；瞌睡的 p.60 | 困倦的；瞌睡的 | E1 / high：释义残留教材页码 p.60（E1） |
| 239 | `snow` | meaning | 下雪；雪Snow | 下雪；雪 | E2 / high：释义尾部串入相邻词条 Snow（E2） |
| 240 | `something` | meaning | pro某事(物)某东西 | 某事(物)；某东西 | E3 / high：释义残留词性残片 pro 且义项间缺分隔（E3） |
| 241 | `sour` | meaning | 酸的；有酸味的 p.45 | 酸的；有酸味的 | E1 / high：释义残留教材页码 p.45（E1） |
| 242 | `south` | pos | n & v | n & adj | E8 / medium：pos 含 v 与词形/词义矛盾，south 无动词用法（E8） |
| 243 | `speed` | meaning | 速度 v.加速 p.5 | 速度；加速 | E1 / high：释义残留词性标记 v. 与页码 p.5（E1/E3） |
| 244 | `spider` | meaning | 蜘蛛 p.13 | 蜘蛛 | E1 / high：释义残留教材页码 p.13（E1） |
| 245 | `state` | meaning | 洲 | 州 | E7 / high：词义用字错误：state 名词义为「州」，非「洲」（E7） |
| 246 | `still` | meaning | ad. v. 还.仍然 | 还；仍然 | E3 / high：释义残留词性标记 ad. v. 及错误分隔点（E3） |
| 247 | `stranger` | meaning | 陌生人p.10 | 陌生人 | E1 / high：释义残留教材页码 p.10（E1） |
| 248 | `study` | meaning | n.学习；研究 | 学习；研究 | E3 / high：释义残留词性标记 n.（E3） |
| 249 | `sure` | meaning | 的确,一定 确信的,肯定的 | 的确，一定；确信的,肯定的 | E2 / medium：两个义项之间缺分隔符，连成一句（E2） |
| 250 | `swing` | meaning | 摇摆；秋千v.摇摆；旋转 | 摇摆；秋千；摇摆；旋转 | E3 / high：释义中部残留词性标记 v.（E3） |
| 251 | `t-shirt` | meaning | 短袖无领汗杉,T恤(杉) | 短袖无领汗衫,T恤(衫) | E7 / high：中文错别字「汗杉/杉」应为「汗衫/衫」（E7） |
| 252 | `talk` | meaning | n.说话；谈话 | 说话；谈话 | E3 / high：释义残留词性标记 n.（E3） |
| 253 | `taste` | meaning | 有…的味道；品尝n..味道 | 有…的味道；品尝；味道 | E3 / high：释义尾部残留词性标记 n..（E3） |
| 254 | `tell` | meaning | 告述,讲述,吩咐 | 告诉,讲述,吩咐 | E7 / high：中文错别字「告述」应为「告诉」（E7） |
| 255 | `ten` | meaning | um 十 | 十 | E3 / high：释义残留编号噪声 um（E3） |
| 256 | `think` | pos | n. | v. | E8 / medium：pos 与词义「认为；想；思考」矛盾，该义为动词（E8） |
| 257 | `third` | meaning | um &adj 第三的 | 第三的 | E3 / high：释义残留编号/词性噪声 um &adj（E3） |
| 258 | `thirsty` | meaning | a. 口渴的； 渴望的 | 口渴的；渴望的 | E3 / high：释义残留词性标记 a.（E3） |
| 259 | `thirteen` | meaning | um. 十三 | 十三 | E3 / high：释义残留编号噪声 um.（E3） |
| 260 | `thirty` | meaning | um. 三十 | 三十 | E3 / high：释义残留编号噪声 um.（E3） |
| 261 | `thousand` | meaning | um. 一千 | 一千 | E3 / high：释义残留编号噪声 um.（E3） |
| 262 | `three` | meaning | um 三 | 三 | E3 / high：释义残留编号噪声 um（E3） |
| 263 | `tie` | meaning | 领带 v. 捆；束 | 领带；捆；束 | E3 / high：释义中部残留词性标记 v.（E3） |
| 264 | `to` | meaning | (表示方向)到,向 动词不定式符号 | (表示方向)到,向；动词不定式符号 | E2 / medium：两个义项之间缺分隔符，连成一句（E2） |
| 265 | `today` | meaning | ad. v.在今天 | 在今天 | E3 / high：释义残留词性标记 ad. v.（E3） |
| 266 | `tomorrow` | meaning | ad. v.在明天 | 在明天 | E3 / high：释义残留词性标记 ad. v.（E3） |
| 267 | `total` | meaning | 总数；合计a. 总的；全体的 | 总数；合计；总的；全体的 | E3 / high：释义中部残留词性标记 a.（E3） |
| 268 | `touch` | meaning | t.触摸；感动 | 触摸；感动 | E3 / high：释义残留词性残片 t.（E3） |
| 269 | `train` | meaning | 火车 2. bus 公交车 | 火车 | E2 / high：释义串入相邻词条「2. bus 公交车」（E2） |
| 270 | `trip` | meaning | over phr. (被...)绊倒 | 旅行；旅程；绊倒 | E7 / medium：释义错位：混入相邻词条 trip over 的释义（E7） |
| 271 | `twelfth` | meaning | um &adj 第十二(的) | 第十二(的) | E3 / high：释义残留编号/词性噪声 um &adj（E3） |
| 272 | `twelve` | meaning | um. 十二 | 十二 | E3 / high：释义残留编号噪声 um.（E3） |
| 273 | `twentieth` | meaning | um. 第二十 | 第二十 | E3 / high：释义残留编号噪声 um.（E3） |
| 274 | `twenty` | meaning | um. 二十 | 二十 | E3 / high：释义残留编号噪声 um.（E3） |
| 275 | `twenty-first` | meaning | um 第二十一 | 第二十一 | E3 / high：释义残留编号噪声 um（E3） |
| 276 | `two` | meaning | um. 二 | 二 | E3 / high：释义残留编号噪声 um.（E3） |
| 277 | `uncle` | meaning | 舅父；叔父；伯父；姑父；舅父 | 舅父；叔父；伯父；姑父；姨父 | E7 / high：义项重复「舅父」两次，末项应为「姨父」（E7） |
| 278 | `usa n` | word | USA n | USA | E5 / high：词形混入词性标记 n（E5） |
| 279 | `usually` | meaning | ad. v.通常 | 通常 | E3 / high：释义残留词性标记 ad. v.（E3） |
| 280 | `valuable` | meaning | a. 很有用的；宝贵的 | 很有用的；宝贵的 | E3 / high：释义残留词性标记 a.（E3） |
| 281 | `value` | meaning | 重视；珍视n. 价值 | 重视；珍视；价值 | E3 / high：释义中部残留词性标记 n.（E3） |
| 282 | `victor` | meaning | 维克托（男名） p.59 | 维克托（男名） | E1 / high：释义残留教材页码 p.59（E1） |
| 283 | `victory` | meaning | 胜利；成功 p.62 | 胜利；成功 | E1 / high：释义残留教材页码 p.62（E1） |
| 284 | `warn` | meaning | 警告；告诫 p.14 | 警告；告诫 | E1 / high：释义残留教材页码 p.14（E1） |
| 285 | `was` | meaning | be(am,is,are)的过去式 | 是（be(am,is,are)的过去式） | E4 / medium：释义只有变形说明、无中文释义（E4） |
| 286 | `washroom` | meaning | 洗手间；厕所p.18 | 洗手间；厕所 | E1 / high：释义残留教材页码 p.18（E1） |
| 287 | `went` | meaning | 动词go的过去式 | 去（动词go的过去式） | E4 / medium：释义只有变形说明、无中文释义（E4） |
| 288 | `were` | meaning | 动词be(are)的过去式 | 是（be(are)的过去式） | E4 / medium：释义只有变形说明、无中文释义（E4） |
| 289 | `west` | meaning | 向西；朝西adj. 向西的；西部的 n. 西；西方 | 向西；朝西；向西的；西部的；西；西方 | E3 / high：释义残留词性标记 adj./n.（E3） |
| 290 | `will` | meaning | aux 将,会,要 | 将,会,要 | E3 / high：释义残留词性标记 aux（E3） |
| 291 | `win` | meaning | 赢；赢得；获胜；获得n.胜利 | 赢；赢得；获胜；获得；胜利 | E3 / high：释义尾部残留词性标记 n.（E3） |
| 292 | `wisely` | meaning | 明智地；聪明地 p.6 | 明智地；聪明地 | E1 / high：释义残留教材页码 p.6（E1） |
| 293 | `without doubt` | meaning | 毫无疑问；的确 p.43 | 毫无疑问；的确 | E1 / high：释义残留教材页码 p.43（E1） |
| 294 | `wolf` | meaning | 狼 p.59 | 狼 | E1 / high：释义残留教材页码 p.59（E1） |
| 295 | `women` | meaning | woman的复数形式 | 妇女（woman的复数形式） | E4 / high：释义只有变形说明、无中文释义（E4） |
| 296 | `wood` | meaning | 树木，木材，树木 | 树木，木材 | E7 / medium：义项重复「树木」两次（E7） |
| 297 | `yes` | meaning | (用于疑问,征询等)什么,是吗 | (用于肯定回答)是,是的 | E7 / medium：词义错位：为 yes 的释义混入「什么」（E7） |
| 298 | `zero` | meaning | um & n 零 | 零 | E3 / high：释义残留编号/词性噪声 um & n（E3） |

### 3.5 `reports/word-audit/middle-final.json`（最终生效 8 处）

| 序号 | id | 字段 | 修正前 | 修正后 | 说明（E 类别 / 置信度） |
|---:|---|---|---|---|---|
| 299 | `crow` | meaning | 拥挤 | 乌鸦；（公鸡）打鸣；啼叫 | E7 / high：E7 源释义「拥挤」属 crowded；本词条例句为「一只乌鸦落在旧墙上」，需补回中心义「乌鸦」；〔此前切片取值「(公鸡)打鸣；啼叫」已被本裁决取代〕 |
| 300 | `around` | word | around | around the world | E2 / medium：E2 释义串入 around the world 的释义；全库无该短语条目，恢复短语词形（id 不变） |
| 301 | `crow` | pos | v | n. & v. | - / high：与释义配套：乌鸦（n.）+ 打鸣；啼叫（v.） |
| 302 | `broke` | meaning | (动词break[breik]的过去时)折断;打破 | (动词 break 的过去时)折断；打破 | E3 / high：E3/E5 释义内残留音标碎片 [breik] 与英文拼写 break |
| 303 | `cross` | meaning | 十字形(物),十字记号 v穿过,越过 | 十字形（物）；十字记号；穿过，越过 | E3 / high：E3 释义内残留词性片段「v」 |
| 304 | `differently` | meaning | 不同的 | 不同地 | E7 / high：E7 「的/地」误用：differently 是副词，应为「不同地」 |
| 305 | `eighteenth` | pos | n | num | E8 / high：E8 词性不一致：同库其它序数词（eighth/fifth/ninth/second/third/twelfth/twentieth）均为 num |
| 306 | `scrooge` | meaning | 斯克鲁奇n.（非正式）吝啬鬼 | 斯克鲁奇；（非正式）吝啬鬼 | E3 / high：E3 释义中残留词性片段「n.」 |

### 3.6 `reports/word-audit/middle-abbrev.json`（最终生效 11 处）

| 序号 | id | 字段 | 修正前 | 修正后 | 说明（E 类别 / 置信度） |
|---:|---|---|---|---|---|
| 307 | `aren't` | meaning | are not 的缩写形式 | 不是（are not 的缩写形式） | E9 / high：补全缩写词条的中文词义（E9） |
| 308 | `can't` | meaning | can not 的缩写形式 | 不能；不会（can not 的缩写形式） | E9 / high：补全缩写词条的中文词义（E9） |
| 309 | `children` | meaning | child的复数形式 | 孩子们（child 的复数形式） | E9 / high：补全变形词条的中文词义（E9） |
| 310 | `don't` | meaning | do not 的缩写形式 | 不；不要（do not 的缩写形式） | E9 / high：补全缩写词条的中文词义（E9） |
| 311 | `goes` | meaning | go的单数第三人称现在时 | 去；走（go 的第三人称单数现在时） | E9 / high：补全变形词条的中文词义（E9） |
| 312 | `i'll` | meaning | I will 的缩写形式 | 我将；我会（I will 的缩写形式） | E9 / high：补全缩写词条的中文词义（E9） |
| 313 | `i'm i am` | meaning | I am的缩写 | 我是（I am 的缩写形式） | E9 / high：补全缩写词条的中文词义（E9） |
| 314 | `isn't` | meaning | is not 的缩写形式 | 不是（is not 的缩写形式） | E9 / high：补全缩写词条的中文词义（E9） |
| 315 | `it's` | meaning | it is 的缩写形式 | 它是；这是（it is 的缩写形式） | E9 / high：补全缩写词条的中文词义（E9） |
| 316 | `there's` | meaning | there is 的缩写形式 | 有（there is 的缩写形式） | E9 / high：补全缩写词条的中文词义（E9） |
| 317 | `what's` | meaning | what is 的缩写形式 | 是什么（what is 的缩写形式） | E9 / high：补全缩写词条的中文词义（E9） |

## 4. chuzhong/vocab 全量清单（17 处）

| 文件 | 修正处数 |
|---|---:|
| `chuzhong/vocab/七年级上册.json` | 9 |
| `chuzhong/vocab/七年级下册.json` | 1 |
| `chuzhong/vocab/八年级上册.json` | 2 |
| `chuzhong/vocab/九年级上册.json` | 4 |
| `chuzhong/vocab/九年级下册.json` | 1 |
| **合计** | **17** |

### 4.1 `chuzhong/vocab/七年级上册.json`（9 处）

| 序号 | 章节 #序号 | word | 字段 | 修正前 | 修正后 | 说明（E 类别 / 置信度） |
|---:|---|---|---|---|---|---|
| 1 | Unit 5 #14 | product | meaning | 产品；制品；成果；n.(自然过程或化学反应的生成物 | 产品；制品；成果 | E3 / medium：释义尾部残留未闭合词性片段「n.(自然过程或化学反应的生成物」，括号不配对、义项残缺（E3/E5） |
| 2 | Unit 2 #6 | different | phonetic | ˈdɪfrənt] | ˈdɪfrənt | E5 / high：音标残留方括号噪声（E5） |
| 3 | Unit 2 #8 | hit | phonetic | / hɪt / | hɪt | E5 / high：音标被斜杠包裹（E5） |
| 4 | Unit 3 #27 | pick up | phonetic | / pɪk ʌp / | pɪk ʌp | E5 / high：音标被斜杠包裹（E5） |
| 5 | Unit 3 #31 | serious | phonetic | / ˈsɪəriəs / | ˈsɪəriəs | E5 / high：音标被斜杠包裹（E5） |
| 6 | Unit 3 #33 | stay | phonetic | steɪ] | steɪ | E5 / high：音标残留方括号噪声（E5） |
| 7 | Unit 6 #1 | pigeon | phonetic | [ ˈpɪdʒɪn | ˈpɪdʒɪn | E5 / high：音标残留方括号噪声（E5） |
| 8 | Unit 6 #5 | boring | phonetic | [ ˈbɔːrɪŋ | ˈbɔːrɪŋ | E5 / high：音标残留方括号噪声（E5） |
| 9 | Unit 5 #15 | oxygen | phonetic | ˈɒksɪdʒə(r)n | ˈɒksɪdʒən | E5 / medium：音标符号错位 (r)n；同项目 chuzhong/真实教材/七年级上册/vocab.json 同词作 ˈɒksɪdʒən（E5） |

### 4.2 `chuzhong/vocab/七年级下册.json`（1 处）

| 序号 | 章节 #序号 | word | 字段 | 修正前 | 修正后 | 说明（E 类别 / 置信度） |
|---:|---|---|---|---|---|---|
| 10 | Unit 2 #49 | surferboard | word | surferboard | surfboard | E6 / high：词形拼写错误：英文无 surferboard，音标 ˈsɜːfbɔːd 与释义「冲浪板」均对应 surfboard（E6） |

### 4.3 `chuzhong/vocab/八年级上册.json`（2 处）

| 序号 | 章节 #序号 | word | 字段 | 修正前 | 修正后 | 说明（E 类别 / 置信度） |
|---:|---|---|---|---|---|---|
| 11 | Module 7 #5 | ssh | word | ssh | sh | E6 / medium：词形拼写错误：音标 /ʃ/ 与释义「嘘（示意某人不要说话）」对应感叹词 sh，ssh 系多余字母重复（E6） |
| 12 | Module 8 #20 | worse | meaning | 更坏，更差，更糟；更糟的是（bad和badlly的比较级） | 更坏，更差，更糟；更糟的是（bad和badly的比较级） | E6 / high：释义内英文拼写错误 badlly→badly（E6） |

### 4.4 `chuzhong/vocab/九年级上册.json`（4 处）

| 序号 | 章节 #序号 | word | 字段 | 修正前 | 修正后 | 说明（E 类别 / 置信度） |
|---:|---|---|---|---|---|---|
| 13 | Module 1 #2 | natural | meaning | 大自然 | 自然的；天然的 | E7 / high：释义与词形不对应：natural 是形容词，「大自然」是名词 nature 的释义（E7） |
| 14 | Module 2 #33 | parade | meaning | （庆祝）旅行 | （庆祝）游行 | E7 / high：释义与词形不对应：parade 意为（庆祝）游行，原释义混入 travel「旅行」（E7） |
| 15 | Module 8 #23 | sportsperson | meaning | 亚洲的；亚洲人的 | 运动员 | E2 / high：释义与词形不对应：sportsperson 意为运动员，原释义是相邻词条 Asian 的释义（E2/E7） |
| 16 | Module 12 #6 | crop | phonetic | ˈenəmi | krɒp | E2 / high：音标与词不符：ˈenəmi 是相邻前一条 enemy 的音标，串行污染（E2） |

### 4.5 `chuzhong/vocab/九年级下册.json`（1 处）

| 序号 | 章节 #序号 | word | 字段 | 修正前 | 修正后 | 说明（E 类别 / 置信度） |
|---:|---|---|---|---|---|---|
| 17 | Module 6 #13 | west | meaning | （尤指西欧和北美） | 西方（尤指西欧和北美） | E7 / medium：释义缺失中心义「西方」，只剩限定语片段（E7） |

## 5. 附：未改动的残留问题（转述 `reports/word-audit/summary.md` §8）

> 以下为 `summary.md` §8 原文的转述，未做新分析、未做新判定。

> 1. **重复条目 54 处**（wordcheck `duplicate_word`；middle 35 组 / primary 16 组，如 `dance`/`dan.ce`、`clean`/`clean.`）：
> 修词形会与既有条目重复，超出「不增删/不合并」授权。
> 2. **词形家族**：`big—bigger` 等含破折号 36 条、`fifth (5th)` 等序号词形 10 条、`story -book`、`the Great Wall`（id 污染）。
> 3. **id 字段 OCR 残片**（middle 104 条、primary 12 条，如 `rurn right`、`tomoto`、`feel free （`）：禁令不改 id，但影响 enrichment 匹配。
> 4. **音标**：八上/八下/九下部分条目用简化转写（`main=men`、`paint=pent`）且同文件内并存标准 IPA；含 `;` 的分读标注 42 条。
> 5. **6 条星期缩写**（`Fri.`/`Mon.`/`Sat.`/`Sun.`/`Thu.`/`Tue.`）的 `letter` 仍为 `#`：`enrichment.Patch` 结构体无 `letter` 字段，需直接改数据集或扩展结构体。
> 6. **chuzhong 行尾由 CRLF 归一为 LF**（`project_write` 通道无法写入 CR）；JSON 数据与「原文件+17 处修正」深层相等。

## 6. 自检统计

| 数据集 | 本文档统计 | 目标 / `summary.md` §4 | 是否一致 |
|---|---:|---:|---|
| `backend/primary_school.json` | 105 | 105 | 一致 ✓ |
| `backend/middle_school.json` | 317 | 317 | 一致 ✓ |
| `chuzhong/vocab/*.json` | 17 | 17 | 一致 ✓ |
| **合计** | **439** | **439** | 一致 ✓ |

字段分布（本文档 x `summary.md` §4）：

| 数据集 | word | meaning | pos | phonetic |
|---|---:|---:|---:|---:|
| `backend/primary_school.json` | 11（11） | 94（94） | 0（0） | 0（0） |
| `backend/middle_school.json` | 3（3） | 306（306） | 8（8） | 0（0） |
| `chuzhong/vocab` | 2（2） | 6（6） | 0（0） | 9（9） |
| **合计** | **16（16）** | **406（406）** | **8（8）** | **9（9）** |

括号内为 `summary.md` §4 的目标值；字段分布全部一致 ✓。

### 校验明细

- 补丁 `old` 与源数据逐字比对：共 423 条，不一致 **0** 条（全部一致 ✓）。
- `primary_audit_truncated_fix.json`（enrichment 格式，无 `old`）：14 个词条、**15 处字段变化**（`labour` 同时改 `word` 与 `meaning`）；其中 **14 处为最终生效值**（13 处裁决取代切片取值 + 1 处 `labour` 词形），另 1 处 `kung` 取值与切片相同、已计入 `primary-a-l`。`修正前` 取自 `backend/primary_school.json` 对应 `id` 的当前值。被取代者：`a/art/be/dining/doing/easter/eating/had/keep/labour/listening/living`（a-l 12 条）+ `reading`（m-z 1 条）。
- `middle-final.json` 中 `around`(meaning) 与 `crow`(meaning) 覆盖 `middle-a-c.json` 的同字段取值（2 处），表格按最终生效值列出。
- 去重后 primary 唯一（id,字段）键：105 个 / 118 行；middle 唯一键：317 个 / 319 行。
- 自检命令（本次生成脚本，临时文件 `.tmp/gen_changes_applied.py`，按边界要求用后清理）：`python .tmp/gen_changes_applied.py` → 输出 `primary 105 middle 317 chuzhong 17 total 439`、`fields {meaning:406, word:16, pos:8, phonetic:9}`、`mismatch 0`。
