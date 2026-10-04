# 词库拼写 / 词义审核记录 · course-7（七年级切片）

审核人：swarm-audit-course-7-n2（kalinux 节点）
判定依据：`reports/word-audit/AUDIT-SPEC.md`（E1–E9）
产物：`reports/word-audit/course-7.json`（修正清单）、本文件

## 1. 覆盖范围与条数

| # | 文件 | 结构 | 条目数 | 审核条数 |
|---|---|---|---|---|
| 1 | `chuzhong/vocab/七年级上册.json` | sections=6（Unit 1–6） | 256 | 256 |
| 2 | `chuzhong/vocab/七年级下册.json` | sections=6（Unit 1–6） | 376 | 376 |
| 3 | `chuzhong/真实教材/七年级上册/vocab.json` | sections=7（Starter + Unit 1–6） | 298 | 298 |
| | 合计 | | **930** | **930** |

逐条方式是：先用 `scripts/word-audit/slice.py --course` 生成切片（
`.tmp/audit/course-7a.txt` / `course-7b.txt` / `course-7c.txt`），再用 `sed -n 'a,bp'` 分段把
三个文件的**每一条**（word / phonetic / pos / meaning）都读完，不做抽样。

第 3 个文件额外带 `page`（教材页码）、`pos`、`unit` 字段，均为合法字段，不计为污染；
`page` 与 `unit` 和 section 一一对应，已抽查核对，无错位。

## 2. 修正清单（2 条）

| source | 位置 | word | field | old → new | 判定 | 置信度 |
|---|---|---|---|---|---|---|
| `chuzhong/vocab/七年级下册.json` | Unit 2/49 | surferboard | word | `surferboard` → `surfboard` | E6 | high |
| `chuzhong/vocab/七年级上册.json` | Unit 5/14 | product | meaning | `产品；制品；成果；n.(自然过程或化学反应的生成物` → `产品；制品；成果` | E3/E5 | medium |

分类统计：E6（词形拼写错误）1 条；E3/E5（释义残留词性片段 + 括号不配对）1 条；
E1 / E2 / E4 / E7 / E8 / E9 均为 0 条。

### 2.1 必答结论：`surferboard` 应为什么词

**应为 `surfboard`（冲浪板），置信度 high。**

依据：
1. 英语中不存在 *surferboard* 一词；`surfer`（冲浪者）+ `board` 的合成词只有 **surfboard**。
2. 该条音标 `ˈsɜːfbɔːd`（/ˈsɜːfbɔːd/）与 `surfboard` 完全吻合（surfer 读 /ˈsɜːfə/，若真为
   surfer+board 读音会是 /ˈsɜːfəbɔːd/），说明音标本来就是按 `surfboard` 录的。
3. 释义「n. 冲浪板」正是 `surfboard`，与词形不符（`surfer`=冲浪者、`surf`=冲浪）。
4. 同单元 Unit 2/41 `surfer`、Unit 2/46 `surf` 拼写均正确，仅此条多出 `er`，属典型拼写错误（E6）。

## 3. 不修（判定为正常写法，避免误报）

- **释义内 `n.` / `adj.` / `v.` 前缀**：本目录**没有独立 `pos` 字段**，词性写在释义里是既有写法，
  不算 E3。因此 `slice.py` 报出的 123 个 `meaning_has_latin`（七下）+ 若干同类标记**全部为误报**，
  未做任何修改。例如：`sail`「n. 帆 v. 驾驶帆船；乘船航行」、`patient`「n. 病人；患者 adj. 有耐心的」、
  `power`「电；电力；力量；v.给(车辆或机器)提供动力」、`leaf`「树叶，叶子(复数leaves)」。
- **音标风格差异**：`(r)` 尾缀（`ˈneɪtʃə(r)`）、`ɔː/ɒ`、`iː/i`、`tæsk/tɑːsk`、`ʃɑːkt/ʃɒkt`、
  `læf/lɑːf`、`ˈɜ:rθkweɪk` 等，经与 `chuzhong/真实教材` 及八/九年级词表交叉比对，属英/美式或
  标注风格差异，不是「音标属于另一个词」，不修。
- **分隔符/标点风格**：`；` 与 `,`、全角/半角括号、`……` 与 `...`（如 `laugh`「笑，大笑 ;发笑；笑声」），不修。
- **释义详略差异**：七上（外研2024）与真实教材（七上）是不同版本教材，同一词的义项数量不同，
  已逐词比对，未发现语义冲突。
- `真实教材/vocab.json` 中 `yourself` 的释义 `(pl. yourselves) 你自己` 是词形变化说明，合法，不修。

## 4. uncertain 清单（拿不准，交主控裁决）

| # | 文件 / 位置 | 词条 | 观察到的问题 | 建议处理 |
|---|---|---|---|---|
| 1 | 七上 Unit 5/15 | oxygen | 音标 `ˈɒksɪdʒə(r)n` 多出一个 `n`（正为 `/ˈɒksɪdʒən/`），`(r)` 位置被写坏；不匹配别的词，只是本条标注畸形 | 低风险清理为 `ˈɒksɪdʒən`（本次未列入修正清单，按 SPEC「音标本次不重做」） |
| 2 | 七上 Unit 2/6 | different | 音标 `ˈdɪfrənt]` 末尾多一个 `]`（方括号不配对） | 同上，可清理为 `ˈdɪfrənt` |
| 3 | 七上 Unit 3/33 / Unit 6/1 / Unit 6/5 | stay / pigeon / boring | 音标分别为 `steɪ]`、`[ ˈpɪdʒɪn`、`[ ˈbɔːrɪŋ`，首尾多出 `[` `]` | 同上，清理掉游离方括号 |
| 4 | 七上 Unit 2/8、3/27、3/31 | hit / pick up / serious | 音标用 `/ hɪt /`、`/ pɪk ʌp /`、`/ ˈsɪəriəs /` 斜杠包裹，与其余条目风格不一致 | 风格差异，建议保留或统一去斜杠（非错误） |
| 5 | 七下 Unit 2/50 | ride | 释义「v. 漂浮」；`ride` 常见义为「骑；乘」，此义项疑似课文语境下的特定义项 | 建议对照七下 Unit 2 教材原文确认；未改 |
| 6 | 七下 Unit 2/40 | as | 释义「prep. 在某一年阶段」语义残缺、疑似漏字（原文可能为「在……阶段」之类） | 建议核对教材词表后补全；未改 |
| 7 | 七下 Unit 1/24 | expression | 释义「n. 词组」；`expression` 常见义为「表达；表情」，此处疑为课文语境义 | 建议核对；未改 |
| 8 | 七上 Unit 4/13、七下多处 | against the law / last but not least / sink or swim / pay attention 等 | 短语条目 `phonetic` 为空字符串 | 短语不标音标可接受，建议保持现状（不计为污染） |

（第 1–3 项若主控希望一并清理，按 `field="phonetic"` 追加 5 条记录即可，`old` 均已在切片中逐字核对。）

## 5. 自查（checkpatch）

已按 `source` 拆出临时补丁（`.tmp/audit/course-7a.patch.json`、`course-7b.patch.json`、
`course-7c.patch.json`；主产物仍是合并的 `course-7.json`）后逐文件校验，`old` 与源文件逐字一致：

```
python3 scripts/word-audit/checkpatch.py --source "chuzhong/vocab/七年级上册.json"  --patch .tmp/audit/course-7a.patch.json --course
  -> OK: 1 条修正全部通过校验  (exit=0)
python3 scripts/word-audit/checkpatch.py --source "chuzhong/vocab/七年级下册.json"  --patch .tmp/audit/course-7b.patch.json --course
  -> OK: 1 条修正全部通过校验  (exit=0)
python3 scripts/word-audit/checkpatch.py --source "chuzhong/真实教材/七年级上册/vocab.json" --patch .tmp/audit/course-7c.patch.json --course
  -> OK: 0 条修正全部通过校验  (exit=0)
```

辅助校验：对 930 个 `word` 跑 `aspell --lang=en list`，仅 `surferboard`（真错）与 `rainforest`
（合法复合词）被列出，佐证本次切片无其它拼写错误；三个文件内 `word` 无重复条目。

## 6. 边界遵守情况

- 未修改 `chuzhong/` 下任何文件（只读）；
- 未改动其它 agent 的产物（`middle-*.json`、`primary-*.json` 等仅读取参考）；
- 只写入 `reports/word-audit/course-7.json` 与 `reports/word-audit/course-7.md`；
- 临时文件均在 `.tmp/audit/`；未派生下级 Agent。
