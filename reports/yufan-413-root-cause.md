# 413 Payload Too Large 根因与修复（DeepSeek / yufan 讲义任务）

日期：2026-09-27 ｜ 主控：syntropy (agent-759db7e9d9d51c42aa267b3f)

## 1. 结论（一句话）
`unexpected status 413 Payload Too Large ... url: https://api.deepseek.com/responses`
**不是模型上下文超限，而是 HTTP 请求体字节数超过网关上限**：`view_image` 读入的扫描图会以
base64 永久常驻会话历史、每次请求全量重发；单个会话累计读满 45+ 张原始图（≈49MB）后，
**该会话此后任何请求都会被拒**，客户端连续重试约 14 分钟后该轮彻底失败。

## 2. 实测阈值（直接对网关做 body 尺寸二分）
请求：POST https://api.deepseek.com/responses ，Content-Type: application/json ，
Accept: text/event-stream ，合法 JSON body。

| body 大小 | 响应 |
| --- | --- |
| 45 MB | 200 OK |
| 46 MB | 200 OK |
| 47 MB | 200 OK |
| 48 MB | **413 Request Entity Too Large** |
| 49 / 50 / 51 / 52 MB | **413** |

=> 上限约 **48 MiB（≈50MB 十进制）**；工程安全线取 **45MB**。
413 由 openresty/EdgeOne 返回（响应头含 EO-LOG-UUID / EO-Cache-Status）。

## 3. 现场证据
| agent | 会话 rollout | 其中图片字节 | 结果 |
| --- | --- | --- | --- |
| yufan-verb-b1 | 44.14 MB | 43.40 MB | 交付 3 文件 |
| yufan-verb-b2 | 45.96 MB | 45.27 MB | 交付 3 文件 |
| yufan-verb-b3 | 49.97 MB | **49.69 MB** | **413，重试 5 次 + 额外重试，20:37:28 Turn error，零产出** |
| yufan-syntax-c1/c2/c3 | 42.2 / 46.5 / 46.2 MB | 41.4 / 45.6 / 45.3 MB | 侥幸过关（7 文件交付） |
| yufan-lexis-a1 | 46.84 MB | 46.29 MB | 413 一次，缺 nouns.js |
| yufan-lexis-a2 | 46.46 MB | 45.89 MB | 413 一次，缺 reported-speech.js |
| yufan-lexis-a3 | 42.42 MB | 41.72 MB | 交付 3 文件 |

b3 重试日志（logs_2.sqlite / codex_core::responses_retry）：
20:33:26 (1/5) -> 20:34:22 (2/5，首次 413) -> 20:34:43 -> 20:35:00 -> 20:35:29 -> 20:37:04，
duration_ms=867974（约 14.5 分钟）后 Turn error: 413。

原始图片规格：1080x1920 / 1920x1080，单张 640-850KB（JPEG 高画质），base64 后 x1.37。

## 4. 修复方案（三层）
1. **读图前压缩镜像（主手段）**：保持原分辨率、JPEG quality=60 + optimize + progressive。
   实测 696KB -> 110KB（约 6 倍）；53 张原始 49.7MB -> 压缩后约 9.5MB，远低于 48MB 上限。
   工具：scripts/yufan-prepare-images.py（--dirs 可限定目录）。
   证据图：reports/yufan-413/orig-637KB.jpg vs reports/yufan-413/compressed-q60-110KB.jpg
   （肉眼逐条比对，中文小字可读性无损）。
2. **读图纪律**：只读 yufan-ds/** 镜像、禁止直接读 yufan/** 原图；单会话不超过 40 张，超出分段。
   已写入契约 web/js/grammar/yufan/README.md 第 7 节。
3. **超限即换人**：超过阈值的会话无法救回（历史永远超标），必须换新 worker，不要在旧会话上重试。

## 5. 受影响的返工处置
- 已取回成品（防丢，均在主控 web/js/grammar/yufan/）：b1/b2 六件、a1 三件、a2 一件、a3 三件、c1-c3 七件。
- 待补 5 件：nouns.js(名词15)、reported-speech.js(间接引语15)、verbs-overview.js(动词概说15)、
  modal-verbs.js(助动词和情态动词21)、nonfinite-verbs.js(非谓语动词17)。
- 已向 yufan-lexis / yufan-verb 发出修复 request（因派生宽度上限 3，旧 worker 必须由各自队长 remove 后重建）：
  新建 yufan-lexis-a4（名词+间接引语）与 yufan-verb-b4（动词概说+情态+非谓语），按压缩读图协议派发。
## 4.1 压缩实测数据（yufan-verb 队长在 Linux 节点独立复现，参数与铁律脚本一致）
| 范围 | 原图 | 压缩镜像 yufan-ds | 比例 |
| --- | --- | --- | --- |
| 全量 yufan/（417 张） | 319,265,250 B（306M） | 54,419,510 B（53M） | **5.87x** |
| 动词子树（145 张） | 109,945,267 B（106M） | 18,667,250 B（19M） | 5.89x |
| 单张实例 微信图片_20260927100137_389_66.jpg | 714,813 B | 120,364 B | 5.94x |

推算单会话读图体积：36 张约 5.9MB（base64 后）、53 张约 9.5MB，均远低于 48MiB 上限。

## 6. 存量产出的交叉验证
- yufan-verb 队长独立复核 b1/b2 六件：import() 成功、block 类型仅六种、table.rows 与 head 全对齐、
  examples 均含 en+zh、无越界写入（对比快照仅新增各自交付文件），并用 view_image 反向抽查 5 张图
  （含 b2 那张旋转 90 度的 P278）逐句对得上。
- yufan-lexis 队长独立复核 a1/a2 存量 4 件（articles/numerals/overview/pronouns）：validate.mjs 4 件 0 error 0 warning。
- 主控侧：node scripts/build-yufan-lectures.mjs 对已合并 20 件给出 error 0 / warning 5（warning 恰为待补 5 目录）。
## 7. 勘误与修复：主控跨节点推送脚本的缺陷（2026-09-27 20:59 由 yufan-verb 队长发现）

- **事实**：我此前声称"脚本已推送到 4 个工作区（实测落盘成功）"，其中 **Linux 两份是假的**——
  我只落了 9 字节占位符 `pushed -\n`（`7075 7368 6564 202d 0a`）。Windows 两份则是正确的 3213B。
- **根因**：我用"内联 base64 + shell 重定向"通过 PowerShell → `bash -c '...'` 双层引号下发文件，
  重定向与引号在传递中被吃掉，`echo "pushed -> ..."` 的剩余部分反而成了写入内容。
  ⇒ **教训：跨节点下发文件不要拼 shell 字符串，用 scp（已验证）或 `echo <b64> | base64 -d | bash`。**
- **队长侧处置（已确认）**：yufan-verb 按规格重建了等效脚本并覆盖占位符
  （verb 工作区 2569B、b4 工作区 2873B），并以**幂等运行实测复现**了我给出的体积数据
  （`encoded=0 skipped=417 total=417`、`319,265,250B -> 54,419,510B (5.87x)`）——交叉验证通过。
- **最终统一（20:59 完成）**：主控脚本升级为幂等版（新增 skip-if-newer / `--force` / 按路径段匹配的 `--dirs`），
  `scripts/yufan-prepare-images.py` = **3719 B，sha1 `4EA2E3CC539AB97309BA077AF3CCA36B8CB142B9`**，
  已用 scp 下发到 `yufan-verb-1e66ca11` 与 `yufan-verb-b4-27c1def2`，
  并直写到 `yufan-lexis-327f4244` 与 `yufan-lexis-a4-6c43d647`；
  四份实测 **字节数一致 + sha1 一致 + `ast.parse` 通过**。
- 主控侧自测：`--dirs 非谓语动词` 首次 `encoded=17`、二次 `skipped=17`（幂等生效），
  体积 `12,458,725B -> 2,086,494B (5.97x)`。
## 8. 词法组交付合并（2026-09-27 21:0x，yufan-lexis 组长交）
- 补件 2 件已合并：`nouns.js`（g-nouns, imagesRead 15, 11 节/49 blocks, 30,182B）、
  `reported-speech.js`（g-object-clause, imagesRead 15, 9 节/63 blocks, 31,993B）；
  取件后 `import()` 实测 entries=1 / imagesRead=15 各一份。
- 词法组总账 9 件 / 8 专题 / 135 张，组内无重复覆盖；`g-adj-adv` 由 `adjectives.js`(8 节) + `adverbs.js`(7 节) **拼接**，
  实测合并后 15 节，未被覆盖。
- 合并后主控校验：**讲义文件 22 / 覆盖专题 21 / 声明已读 364 张 / error 0 / warning 3**
  （3 条 warning 恰为动词组待补的 3 个目录：动词概说 15 + 助动词和情态动词 21 + 非谓语动词 17 = 53 张；364+53=417）。
- 词法组自己的压缩实测（dry-run 无副作用）：全量原图 319,265,250 B（304.5MB，25 目录/417 张）；
  本次两目录 22,447.4KB -> 3,845.4KB（5.84x）。

### 8.1 归因勘误（我方错误，已订正）
我在群发给两位队长的消息里，把**动词组的工作错记到词法组名下**（9 字节占位符的发现、
脚本重建、`encoded=0 skipped=417 total=417` 幂等复跑、5.87x/5.89x/5.72x/5.94x 一组数据）。
实际归属：**上述全部属于 yufan-verb 队长（Linux 节点）**；yufan-lexis 可采信的只有
① 全量原图 319,265,250B 的 dry-run 实测；② 本次两目录 5.84x；③ 词法组 9 件的校验结果与 imagesRead。
最终报告与黑板均已按此订正。

### 8.2 新增硬约束（lexis 队长的量化告警）
压缩镜像是**必要不充分**条件：全量镜像 base64 ≈59–72MB，**仍超 48MiB**。
⇒ **"只读镜像" + "单会话 ≤40 张"两条必须同时成立**（已写入 README §7.1）。