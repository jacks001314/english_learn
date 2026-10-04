# course 七上/七下 词库修正执行记录（swarm-patch-course-a）

任务：`task-swarm-word-audit` / 派工范围：把 `reports/word-audit/course-fixes.json` 中属于
**七年级上册、七年级下册** 的修正落到数据文件。
执行者：`swarm-patch-course-a`（父 Agent：swarm 主控）。

## 1. 输入与结论

| 文件 | 清单条数 | 实际修改处 | 修改前 | 修改后 | Master etag | synced |
|---|---:|---:|---:|---:|---|---|
| `chuzhong/vocab/七年级上册.json` | 9 | 9 | 36266 字节 | 34875 字节 | `cd10ae7b6a387cb0` | true |
| `chuzhong/vocab/七年级下册.json` | 1 | 1 | 51600 字节 | 49673 字节 | `b52026a633adc61e` | true |

（字节差 = 9/1 处修正本身 + 行尾由 CRLF 归一为 LF，见第 4 节。）

## 2. 具体修正（逐条）

七年级上册：
1. Unit 5 `product` meaning：`产品；制品；成果；n.(自然过程或化学反应的生成物` → `产品；制品；成果`
2. Unit 2 `different` phonetic：`ˈdɪfrənt]` → `ˈdɪfrənt`
3. Unit 2 `hit` phonetic：`/ hɪt /` → `hɪt`
4. Unit 3 `pick up` phonetic：`/ pɪk ʌp /` → `pɪk ʌp`
5. Unit 3 `serious` phonetic：`/ ˈsɪəriəs /` → `ˈsɪəriəs`
6. Unit 3 `stay` phonetic：`steɪ]` → `steɪ`
7. Unit 6 `pigeon` phonetic：`[ ˈpɪdʒɪn` → `ˈpɪdʒɪn`
8. Unit 6 `boring` phonetic：`[ ˈbɔːrɪŋ` → `ˈbɔːrɪŋ`
9. Unit 5 `oxygen` phonetic：`ˈɒksɪdʒə(r)n` → `ˈɒksɪdʒən`

七年级下册：
10. Unit 2 `surferboard` word：`surferboard` → `surfboard`（音标 `ˈsɜːfbɔːd`、释义「n.冲浪板」保持不变，词形与音标/释义一致）

## 3. 自检证据（命令与输出）

在本地副本上先做「格式幂等」验证，再用 Python 严格按 `sections[i-1].words[j-1]` 定位并
逐字比对 `old` 后才写入 `new`：

```
$ python .tmp/apply.py
FILE chuzhong/vocab/七年级上册.json
  idempotent_format: True | sections: 6 -> 6 | words: 256 -> 256
  counts_identical: True | planned: 9 | applied: 9
  bytes: 36266 -> 36200
  sha256_new: 151e91e850c78b31211b0f5962a15a3d178bbce4ff97711cd4fc621f56c68351
  changed_lines: 9
FILE chuzhong/vocab/七年级下册.json
  idempotent_format: True | sections: 6 -> 6 | words: 376 -> 376
  counts_identical: True | planned: 1 | applied: 1
  changed_lines: 1    (L627 "word": "surferboard", => "word": "surfboard",)
```

- `idempotent_format: True`：用同一序列化方式（`ensure_ascii=False, indent=2` + CRLF）重放原始对象，
  与原始文件**逐字节相同**，说明除清单条目外没有任何格式漂移。
- `changed_lines`：七上 9 行、七下 1 行，与清单条数一致，且行数（1327 / 1927）未变。

写回 Master 后的复核（重新加载 + 与写前生成的期望版本做深度比较）：

```
$ python -c "..."
七上: bytes 34875  deep equal to expected: True  sections 6 [35,45,40,45,46,45]
      fixed: (5,14) product 'ˈprɒdʌkt' '产品；制品；成果'
             (2,6) different 'ˈdɪfrənt'  (2,8) hit 'hɪt' (3,27) pick up 'pɪk ʌp'
             (3,31) serious 'ˈsɪəriəs'  (3,33) stay 'steɪ' (6,1) pigeon 'ˈpɪdʒɪn'
             (6,5) boring 'ˈbɔːrɪŋ'     (5,15) oxygen 'ˈɒksɪdʒən'
七下: bytes 49673  deep equal to expected: True  sections 6 [74,79,85,47,43,48]
      (1,48) surfboard 'ˈsɜːfbɔːd' 'n.冲浪板'   残留 surferboard 计数 = 0
```

Master 端抽读（`project_read` 直读 Master，不经本地文件）：

- `chuzhong/vocab/七年级上册.json` offset 24550：`netic": "ˈɒksɪdʒən",`（etag `cd10ae7b6a387cb0`, size 34875）
- `chuzhong/vocab/七年级下册.json` offset 16025：`"word": "surfboard",`（etag `b52026a633adc61e`, size 49673）

写前校验（apply 之前，`old` 仍与源一致时运行）：

```
$ python scripts/word-audit/checkpatch.py --source chuzhong/vocab/七年级上册.json --patch .tmp/audit/fix-七年级上册.json --course
OK: 9 条修正全部通过校验（source=chuzhong/vocab/七年级上册.json）
$ python scripts/word-audit/checkpatch.py --source chuzhong/vocab/七年级下册.json --patch .tmp/audit/fix-七年级下册.json --course
OK: 1 条修正全部通过校验（source=chuzhong/vocab/七年级下册.json）
```

> 注：修正在数据里落地之后，再拿同一份清单跑 `checkpatch.py` 会因为 `old` 已被替换而报
> 「old 与源文件不一致」（本次复跑为 FAIL 9 / FAIL 1），这是**预期行为**，不是数据问题；
> 该脚本是「落地前」的校验器。

## 4. 唯一偏差：行尾 CRLF → LF（必须由主控知悉）

- 原文件行尾为 `CRLF`（七上 1326 个 CR、七下 1926 个 CR）；`project_write` 只能携带我发出的
  文本内容，而该通道**不解释转义序列**：实测写入 `A\r\nB\r\n` 得到的是字面量
  `A\r\nB\r\n`（10 字节，反斜杠原样保留），真实换行一律落为 `LF`。
- 因此两个文件落盘为 `LF` 行尾。**JSON 数据本身与「原文 + 10 处修正」深度相等**，
  仅行尾风格变化（等价于一次 `git` 全文件行尾重写）。
- 若主控要求严格保持 CRLF，需要由具备 CR 写入能力的通道重放（本次 Agent 侧无该能力），
  或接受本次的 LF 归一。

## 5. 边界遵守

- 只写入了：`chuzhong/vocab/七年级上册.json`、`chuzhong/vocab/七年级下册.json`、本记录文件。
- 未改 `backend/`、其他 chuzhong 文件、他人 reports；未改 `id`；未增删/合并条目；未派生下级 Agent。
- 临时文件（`.tmp/` 下的切片、期望版本、验证用 patch）已在结束前删除。
