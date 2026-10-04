# course 修正执行记录（B 组：八年级上册 / 九年级上册 / 九年级下册）

- 任务：`task-swarm-word-audit`（词库拼写/词义逐条审核与修正）
- 执行 Agent：`swarm-patch-course-b`
- 唯一事实源清单：`reports/word-audit/course-fixes.json`
- 写入范围：本文件 + `chuzhong/vocab/八年级上册.json`、`chuzhong/vocab/九年级上册.json`、`chuzhong/vocab/九年级下册.json`
- 执行方式：`project_fetch` 取回 → 本地 Python 逐字比对/打补丁 → `project_write` 写回 Master

## 1. 执行命令

```bash
# 取回输入
project_fetch: chuzhong/vocab/{八年级上册,九年级上册,九年级下册}.json, reports/word-audit/course-fixes.json

# 打补丁 + 幂等自检（.tmp/patch_course_b.py）
python3 .tmp/patch_course_b.py

# 写回
project_write: chuzhong/vocab/八年级上册.json   # synced=true
project_write: chuzhong/vocab/九年级上册.json   # synced=true
project_write: chuzhong/vocab/九年级下册.json   # synced=true

# 写回后复核（重跑全部不变量）
python3 .tmp/final_check.py
```

补丁定位规则：`sections[section_index-1].words[index_in_section-1][field]`，先与清单 `old` 做**逐字**比较，一致才写入 `new`；不一致则中止（本次 7/7 全部命中，未出现不一致）。

## 2. 结果总览

| 文件 | 修改前字节(CRLF) | Master 现状字节 | sections | 条目数 | 实际修改 | 结果 |
|---|---|---|---|---|---|---|
| chuzhong/vocab/八年级上册.json | 46415 | 44715 | 12 | 322（不变） | 2 / 2 | ✅ |
| chuzhong/vocab/九年级上册.json | 54797 | 52803 | 12 | 380（不变） | 4 / 4 | ✅ |
| chuzhong/vocab/九年级下册.json | 18564 | 17870 | 8 | 128（不变） | 1 / 1 | ✅ |

合计 7 处字段修改，与清单条目数完全一致。

Master 端复核（`project_read` 直读 Master）：size/etag 与 `project_write` 返回值一致
- 八年级上册：44715 B，etag `90c5908b961dcb32`
- 九年级上册：52803 B，etag `a3b029793d50d702`
- 九年级下册：17870 B，etag `66927d67221fba95`

## 3. 逐条 before → after

### 八年级上册（2 条）
| 位置 | 词 | 字段 | before | after |
|---|---|---|---|---|
| Module 7 #5 | ssh | word | `ssh` | `sh` |
| Module 8 #20 | worse | meaning | 更坏，更差，更糟；更糟的是（bad和**badlly**的比较级） | 更坏，更差，更糟；更糟的是（bad和**badly**的比较级） |

### 九年级上册（4 条）
| 位置 | 词 | 字段 | before | after |
|---|---|---|---|---|
| Module 1 #2 | natural | meaning | `大自然` | `自然的；天然的` |
| Module 2 #33 | parade | meaning | `（庆祝）旅行` | `（庆祝）游行` |
| Module 8 #23 | sportsperson | meaning | `亚洲的；亚洲人的` | `运动员` |
| Module 12 #6 | crop | phonetic | `ˈenəmi` | `krɒp` |

### 九年级下册（1 条）
| 位置 | 词 | 字段 | before | after |
|---|---|---|---|---|
| Module 6 #13 | west | meaning | `（尤指西欧和北美）` | `西方（尤指西欧和北美）` |

未改动 `id`、未增删/合并条目、未改动任何例句或其它字段。

## 4. 自检输出摘要

打补丁阶段（`.tmp/patch_course_b.py`）：

```
[OK]   八年级上册: 幂等 dump 与原始字节完全一致 (46415 bytes)   sections=12 total 322->322 changed=2/2 bytes 46415->46413
[OK]   九年级上册: 幂等 dump 与原始字节完全一致 (54797 bytes)   sections=12 total 380->380 changed=4/4 bytes 54797->54791
[OK]   九年级下册: 幂等 dump 与原始字节完全一致 (18564 bytes)   sections=8  total 128->128 changed=1/1 bytes 18564->18570
ALL_OK
```
- 幂等性：用 `json.dumps(obj, ensure_ascii=False, indent=2).replace("\n","\r\n")` 对**未修改**的原始对象 dump，结果与原文件字节**完全一致** → 「两空格缩进 + CRLF + 无末尾换行」的格式假设成立，补丁只改目标字段。
- 差异范围：把打补丁后的对象按清单逐条回滚为 `old` 再 dump，与原始字节**逐字节相等** → 除清单 7 处外其余内容零改动。

写回后复核（`.tmp/final_check.py`，对 Master 持久化内容重跑）：

```
== chuzhong/vocab/八年级上册.json   json_parseable=True sections_same=True per_section_counts_same=True
   total_words_same=True only_listed_fields_differ_from_pre_patch=True master_equals_golden_modulo_eol=True
   changed_count=True  sections=12 total=322 changed=2/2 bytes=44715 sha256=659a09958ccffbb2
== chuzhong/vocab/九年级上册.json   同上全部 True  sections=12 total=380 changed=4/4 bytes=52803 sha256=d3d1520ed275a46d
== chuzhong/vocab/九年级下册.json   同上全部 True  sections=8  total=128 changed=1/1 bytes=17870 sha256=2858c317ba174b1b
FINAL: ALL_CHECKS_PASS
```

不变量：JSON 可解析；`sections` 数与各 section 条目数不变；总条目数不变（322 / 380 / 128）；除清单条目的 7 处字段外其余内容一致；实际修改数 2 / 4 / 1。

## 5. synced 状态

三个 `project_write` 调用均返回 **`synced: true`**；随后 `project_read`（直读 Master，非本地缓存）返回的 size/etag 与写入结果一致，确认 Master 已持久化。

## 6. 已知偏差与不确定项（重要）

- **行尾：CRLF → LF（唯一偏差，非内容性）**
  本节点 `project_write` 的 `content` 只能传输文本：实测真实换行按 LF 落盘，而 `\r` / `\u000d` 等转义会被**原样**存成字面字符（用本报告文件做过 3 次探针写入 + `od -c` 验证）。因此本节点**无法**向 Master 写出 CR 字节。
  结果：三个文件的内容与「清单修正后的目标内容」在 LF 归一化意义下**逐字节一致**，仅整体行尾由 CRLF 变为 LF；末尾无多余换行（与原文件的「无末尾换行」保持一致）。经 `master_equals_golden_modulo_eol=True` 确认：两侧行尾归一化后 Master 内容与目标产物**完全相等**，7 处修正之外零差异。
  → 如需严格恢复 CRLF：把每个文件的 LF 换回 CRLF 即可（纯机械转换，不影响 JSON 语义）；建议由具备 CR 写入能力的通道执行。
- 其它：无。清单 7 条定位与 `old` 值逐字比对全部命中；未触碰 `backend/`、七年级文件或他人的 reports 产物。

## 7. 边界遵守

- 仅写入允许的 4 个路径（3 个词汇 JSON + 本报告）。
- 未修改 `id`、未增删/合并条目、未改动例句。
- 未派生下级 Agent（本节点仅使用主 Agent 会话）。
- 临时文件均在 `.tmp/`，任务结束前已清理。
