# 切片审核记录：middle-j-p（letter J–P）

- 源数据：`backend/middle_school.json`（共 2895 条）
- 切片范围：`letter ∈ {J,K,L,M,N,O,P}`，**695 条**（i=1343–2037）
- 切片文本：`.tmp/audit/middle-j-p.txt`（`flags=` 命中 79 条）
- 审核方式：逐条阅读全部 695 条的 `word` / `pos` / `meaning`（含 `senses`），不只看 flags
- 提出修正：**68 条**（`reports/word-audit/middle-j-p.json`）
- checkpatch：`python3 scripts/word-audit/checkpatch.py --source backend/middle_school.json --patch reports/word-audit/middle-j-p.json` → **OK: 68 条修正全部通过校验**

## E 编号分布

| 编号 | 含义 | 条数 |
|---|---|---|
| E1 | 释义残留教材页码 `p.xx` | 29 |
| E2 | 释义混入相邻词条 / 音标文本 | 6 |
| E3 | 释义残留词性标记、编号/变形说明噪声 | 28 |
| E4 | 释义无中文（仅变形/缩写说明） | 3 |
| E5 | 释义内混入断裂词形残片 | 1 |
| E7 | 词义破损 / 与词形不对应 | 1 |
| E6 / E8 / E9 | 无命中 | 0 |

页面残留（E1/E2）共覆盖 **34 条**（其中 5 条同时含词性或音标污染，按主污染归入 E2/E3）：
jean, jerry, knowledge, lantern, leader, local, lock, look up to, mail, mall, material, mystery, no matter,
noise, not only … but also, note, overnight, pal, pardon, partner, patient, pattern, paula, pay attention to,
period, physics, picnic, policeman, position, prevent, product, pronounce, punish, purpose。

典型修正：
- 串入相邻词条：`pear` `梨milk /milk/ n. 牛奶` ⇒ `梨`；`price` `价格boy /bɔi/ n. 男孩` ⇒ `价格`
- 音标+页码混合：`lock` `/la:k/ v. 锁上；锁住p.44` ⇒ `锁上；锁住`；`pattern`、`novel` 同类
- 词性标记残留：`lively` `a. 生气勃勃的;…`、`low` `a 减少的…`、`may` `aux 可以;…`、`nine` `um. 九`、`peel` `t.剥落…`
- 缺中文释义：`overcome` `(overcame , overcome)` ⇒ `克服；战胜（过去式 overcame，过去分词 overcome）`

## uncertain 清单（拿不准 / 需主控裁决，均未改）

1. **重复条目（14 组，禁止合并，需主控裁决）**：join(1362/1363)、lend(1453/1454)、let's(1460/1461)、
   living room(1488/1489/1490)、middle school(1614/1615)、nothing(1749/1750)、o'clock(1759/1760)、
   OK(1775/1776)、on(1779/**1984**，1984 的 id 为 `prep.`，word=`on`、`在……上面`，与 1779 重复)、
   paint(1838/1840)、pay(1874/1875)、pencil box(1887/1888)、post office(1968/1969)、put on(2035/2036)。
2. **`id` 命名含残片（禁止改 id）**：`join.`、`lend(lent`、`pay (paid`、`look over phr. (`、
   `neck and neck phr. (`、`metre race phr. 100`、`multiply…by… phr. …`、`kind-hearted adj`、
   `long jump n`、`living room n`、`living-room n`、`mid-autumn n`、`mooncake n`、`prep.` 等。
   对应条目的 `word` 字段本身干净，未改；请主控决定是否另行清理 id。
3. `jumper`(i=1372) 释义 `跳跃者`：词义本身成立，但初中教材常考义为“针织套衫/毛衣”，疑 E7，证据不足未改。
4. `loudly`(i=1514) 释义含 `花俏地`（疑为“花哨地”错别字，E7）；因无法确证教材原义，未改。
5. `list`(i=1480) `pos='v.'` 而释义为 `列表；清单`（含名词义），疑 E8；`north`(i=1736) `pos='n & v'`
   （north 无动词义，疑应为 `n & adj`），均属 pos 字段疑点，未改。
6. `lift`(i=1475) 释义 `(云,雾等)消散,(雨)停止`：为词典义项而非错义，但教材常用义“举起/抬起”缺失，
   属释义详略问题，按规范不修。
7. `kilogram`(i=1396) `公斤（kilo+gram克→一千克，公斤）`、`knife`(i=1408) `(pl.knives) 小刀`、
   `lyrics`(i=1525) `(pl.) 歌词`、`less`(i=1455)、`most`(i=1656)：括号内为构词/变形说明，中文义齐备，
   按规范「变形说明可保留在括号里」不修。
8. `p.m.`(i=1834) 释义 `(=p.m.) 下午；午后` 自带同形括注，中文义齐备，未改。
9. 音标：`phonetic` 字段整体未见污染；`lock`/`novel`/`pattern`/`pear`/`price` 混入 `meaning` 的音标文本
   已随释义清理移除。
