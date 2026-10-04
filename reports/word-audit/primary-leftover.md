# primary 残留噪声清理记录（swarm-fix-primary-clean）

- 任务：`task-swarm-word-audit` / 小学词库 primary 残留噪声清理
- 源数据（只读）：`backend/primary_school.json`，1331 条
- 范围：A 类 = `meaning` 尾部 ASCII 句点/首尾空格；B 类 = 星期缩写的圆括号词形
- 产物：`reports/word-audit/primary-leftover.json`（15 条）、`backend/enrichment/primary_audit_leftover.json`（15 词条）

## 1. 执行命令与结果

```
python scripts/word-audit/checkpatch.py --source backend/primary_school.json --patch .tmp/primary-leftover.json
→ OK: 15 条修正全部通过校验（source=backend/primary_school.json）

python scripts/word-audit/build_enrichment.py --source backend/primary_school.json --patch .tmp/primary-leftover.json --out .tmp/primary_audit_leftover.json
→ wrote 15 个词条, 字段分布 {'word': 6, 'meaning': 9}
```

enrichment 自检：字段集合 `['id','meaning','word']`（无 old/new/reason/confidence），id 唯一，条数 15。

## 2. A 类（9 条，field=meaning，confidence=high）

| index | id | before | after |
|---|---|---|---|
| 688 | miss | `小姐.` | `小姐` |
| 706 | mr | `先生.` | `先生` |
| 749 | north | `北方；向北方.` | `北方；向北方` |
| 763 | off | `距；离；离开.` | `距；离；离开` |
| 870 | put away the clothes | `收拾衣服.` | `收拾衣服` |
| 959 | shelf | `书架.` | `书架` |
| 1079 | sweater | `毛衣 .` | `毛衣` |
| 1133 | these | `这些.` | `这些` |
| 1154 | those | `那些.` | `那些` |

只删除尾部句点与首尾空格，未改动其它任何字符。

### 与被既有批次覆盖部分的关系（重要）
全库扫描共 22 条尾部噪声，其中 13 条已由 `reports/word-audit/primary-a-l.json` 修掉，且其取值与本类清洗结果一致或更彻底：

`a little`(有些) / `another`(另一个) / `baby`(婴儿) / `big`(大的) / `breakfast`(早餐) / `do`(（过去式did [did]）做；完成；进行) / `eleven`(十一) / `fish`(鱼) / `from`(从;来自) / `goal`(得分数) / `have a headache`(头疼) / `laugh at`(因…而发笑) / `lock`(锁)

因此本批次**不包含**这 13 条，避免用二次清洗值覆盖 a-l 的更干净取值。模拟应用后（Python 等价复现 enrichment 语义）余下 13 条尾部噪声恰好全部属于上述已被 a-l 覆盖的集合。

## 3. B 类（6 条，field=word，confidence=medium）

| index | id | before | after | 同形冲撞检查 |
|---|---|---|---|---|
| 1 | (fri.) | `(Fri.)` | `Fri.` | 全库无 `Fri.`，安全 |
| 2 | (mon.) | `(Mon.)` | `Mon.` | 全库无 `Mon.`，安全 |
| 3 | (sat.) | `(Sat.)` | `Sat.` | 全库无 `Sat.`，安全 |
| 4 | (sun.) | `(Sun.)` | `Sun.` | 全库无 `Sun.`，安全 |
| 5 | (thu.) | `(Thu.)` | `Thu.` | 全库无 `Thu.`，安全 |
| 6 | (tue.) | `(Tue.)` | `Tue.` | 全库无 `Tue.`，安全 |

未改 `id`（仍为 `(fri.)` 等）。**提示**：这 6 条的 `letter` 字段仍为 `#`（因其词形原以 `(` 开头被归入非字母分组）；若希望按字母归组，建议主控授权把 `letter` 改为 F/M/S/T（本次未获授权，故未改）。

## 4. 未改动 / 需主控裁决（C 类，逐条给出理由）

| # | 类别 | 条数 | 位置样例 | 不修改理由 |
|---|---|---|---|---|
| 1 | em dash 词形族 | 36 | i=94 `big—bigger`、i=130 `buy—bought` | 词形含 `—`（合并了原形/变形），去掉后与既有 `bigger`/`big` 等条目构成 duplicate_word，属需去重裁决 |
| 2 | 序号词形族 | 10 | i=368 `fifth (5th)`、i=1146 `thirtieth (30th)` | `fifth`/`thirtieth` 等已作为独立条目存在，改词形会重复 |
| 3 | 词形残片 | 1 | i=1054 `story -book` | 规范词形 `storybook` 已存在，改词形会重复 |
| 4 | id 污染 | 1 | i=1124 id=`the`、word=`the Great Wall` | 禁改 id；word 改为 `the` 会与既有条目语义冲突，且 `the great wall` 已存在 |
| 5 | 音标含 `;` | 3 | i=584 `/ki:p tu: ði; ðə rait/`、i=1124、i=1310 | `;` 用于并列两种读音，属转写风格，删除会丢失信息，需人工定性 |
| 6 | 同类括号词形 | 1 | i=1271 `Wednesday(Wed.)`（id=`wednesday(wed.)`） | 不在 A/B 定义内（非 `(Xxx.)` 整体包裹式），未获授权 |
| 7 | 已由他批次修复 | 1 | i=641 `look .out` | `reports/word-audit/primary-a-l.json` 已修为 `look out`，本批次不重复 |

## 5. 自检与边界

- checkpatch：15/15 OK（0 错误）；同一 id 同一字段无重复；field 均在 `{word, meaning, pos, phonetic}` 内。
- 模拟应用（Python 等价复现 enrichment 按 id 覆盖语义）：相对源数据**恰好 15 处字段变化**，无附带改动；条目总数、sections/字段结构不变。
- 未改动：`backend/primary_school.json`、`cmd/synccontent/main.go`、`chuzhong/`、他人 reports；未改 id、未增删或合并条目；未派生下级 Agent；临时文件在 `.tmp/`。
- enrichment 批次名 `primary_audit_leftover.json` 需由主控加入 `cmd/synccontent/main.go` 的 `batches["primary"]`，并置于既有审计批次之后（本批次对 13 条与 a-l 重叠以外的条目无冲突）。

## 6. 残余不确定性

- 仅覆盖 A/B 两类；C 类 6 个族群共 52 条仍未处理（需用户/主控裁决去重策略）。
- B 类改的是 `word`：前端按 `word` 展示与检索，`id` 保持原值，未实测前端分组/检索行为。
- 全库扫描口径为正则匹配（尾部 ASCII 句点/首尾空白、`^\([A-Za-z]{2,4}\.\)$`），全角句号等变体扫描结果为 0 条。
