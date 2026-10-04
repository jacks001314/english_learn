# 词库拼写 / 词义审核规范（v1）

适用范围：`backend/primary_school.json`、`backend/middle_school.json`、`chuzhong/vocab/*.json`、
`chuzhong/真实教材/七年级上册/vocab.json`。

审核对象是**单词表条目**的 `word`（拼写）、`meaning`（词义）、`pos`（词性）。
例句、例句翻译、课文正文的润色**不在本次范围**内（发现目标词拼写错误时只上报，不改）。

---

## 1. 判定为「必须修」（error）的情形

| 编号 | 情形 | 真实样例（来自本仓库） | 修法 |
|---|---|---|---|
| E1 | 释义残留教材页码 | `ability` → `能力；才能 p.6` | `能力；才能` |
| E2 | 释义混入相邻词条 / 音标文本 | `apple` → `苹果then /ðen/ adv. 那么` | `苹果` |
| E3 | 释义残留词性标记、编号噪声 | `amazing` → `a. 令人惊奇/喜的`；`fifty` → `um 五十` | `令人惊奇的`；`五十` |
| E4 | 释义没有中文（只有变形/音标说明） | `overcome` → `(overcame , overcome)`；`take` → `（过去式took[tʊk]）` | 补出真实中文释义，变形说明可保留在括号里 |
| E5 | 词形混入词性/标点/残片 | `blow(blew`、`clean.`、`as soon as conj`、`Go tothe cinema` | 清理为规范词形 |
| E6 | 词形拼写错误 | `tomoto`（应为 `tomato`，历史批次已修）、`surferboard`（应为 `surfboard`） | 改正拼写 |
| E7 | 词义与词形不对应（词义错位） | `truck` → `象鼻`（历史批次已修） | 改为正确释义 |
| E8 | `pos` 与词形/词义明显矛盾 | 名词短语标成 `v.` | 改为正确词性 |
| E9 | 释义含排版转义残留 | `\\(11th\\) 第十一` | `第十一` |

判断依据以**中国中小学英语教材/词典的通行释义**为准；拿不准就不改，写进 `uncertain`。

## 2. 判定为「不修」（保持原样）

- 标点/分隔风格差异：`；` 与 `,`、全角与半角括号、`……` 与 `...`。
- `pos` 写法差异：`n.` / `n` / `n. phr.` / `phr.`。
- 释义详略差异（只列一个义项 vs 列多个义项）——除非现有释义是错的或串了别的词。
- 例句、例句翻译（除非其中目标词拼写与 `word` 冲突，写进 `uncertain`）。
- 音标：本次不重做；只有明显污染（混入页码、混入别的词条、完全不成对）才写进 `uncertain`。

## 3. 硬性禁令

1. **禁止修改 `id` 字段**：`backend/enrichment/*.json` 补丁按 `id` 匹配，改 id 会让构建失败。
2. **禁止新增、删除、合并条目**：重复条目（`duplicate_word`）只写进 `uncertain`，由主控裁决。
3. **禁止直接改写 `backend/primary_school.json` / `backend/middle_school.json`**：
   这两个文件由主控通过 enrichment 补丁通道落地，其他人只产出补丁清单。
4. **禁止自行派生下级 Agent**。
5. 只写自己负责的产物路径，不要写别人的文件。

## 4. 交付物：补丁清单 JSON

路径：`reports/word-audit/<你的切片名>.json`，UTF-8，JSON 数组：

```json
[
  {
    "id": "ability",
    "index": 23,
    "field": "meaning",
    "old": "能力；才能 p.6",
    "new": "能力；才能",
    "reason": "释义残留教材页码 p.6（E1）",
    "confidence": "high"
  }
]
```

字段说明：
- `id`：条目 `id`（chuzhong 各册为 `book` + `section` + `word` 三元组，见对应派工单）。
- `index`：该文件中的 1-based 序号（与 `go run ./cmd/wordcheck` 报告一致）。
- `field`：`word` / `meaning` / `pos` / `phonetic` 之一；多字段要拆成多条记录。
- `old`：**当前文件里的精确原文**（程序会逐字比对，不一致会被打回）。
- `new`：修正后的值。
- `reason`：一句话说明，含判定编号（E1–E9）。
- `confidence`：`high` / `medium` / `low`。

同时在同一目录写 `<你的切片名>.md`：
- 本次审核条目数、发现并修正的条目数、按 E 编号分类的统计；
- `uncertain` 清单（拿不准、需要主控裁决的点），每条给出 `id`、观察到的问题、建议处理方式。

## 5. 自查（提交前必须做）

对每个 `backend` 切片：

```powershell
python scripts/word-audit/checkpatch.py --source backend/middle_school.json --patch reports/word-audit/middle-a-c.json
```

输出必须为 `OK`（0 错误）。`old` 不匹配、`id` 不存在、字段非法都会报错，必须修正后重跑。

## 6. 常见污染模式（供定位，不要只查这些）

- 释义尾部 `p.6` / `p.35` / `P.12`；
- 释义里出现 `/.../` 音标或 `adv.` `n.` 等词性；
- 释义结尾突然接另一个英文单词（相邻条目串行）；
- 词形里的 `(` `)` 不闭合、结尾多 `.` `：`；
- 释义以 `um ` / `then ` / `a. ` 开头；
- 中文错别字（如 `象鼻` 对应 truck）。
