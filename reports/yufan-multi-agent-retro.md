# 多 Agent 协作复盘：yufan 语法讲义任务（2026-09-27）

- 编制：主控 1（syntropy）+ 队长 3（词法/动词/句法）+ worker 10（a1-a4 / b1-b4 / c1-c3），横跨 Windows 与 Linux 两个节点
- 交付：25 个讲义模块 / 24 个专题 / 417 张图 100% 覆盖，`error 0 / warning 0`
- 本文只记录**可复用的经验与待改的平台问题**，不复述交付内容

---

## 一、问题清单（按严重度）

### P0-1 413 Payload Too Large —— 单会话读图超网关请求体上限

| 项 | 事实 |
| --- | --- |
| 现象 | `unexpected status 413 Payload Too Large: <html>...openresty...</html>, url: https://api.deepseek.com/responses` |
| 根因 | **不是上下文超限，是 HTTP body 字节超限**。`view_image` 把扫描图以 base64 常驻会话历史，每轮请求全量重发；单会话累计 45+ 张原图（≈49MB）即触线 |
| 阈值实测 | 对 `api.deepseek.com/responses` 做 body 二分：45/46/47MB → 200 OK；48/49/50/51/52MB → 413（openresty + EdgeOne）。**上限 ≈48MiB，工程安全线 45MB** |
| 图片规格 | 1080×1920 / 1920×1080，单张 640–850KB，base64 ×1.37 |
| 实际损失 | b3 会话 49.69MB（53 张）→ 重试 5 次、历时 867,974ms（14.5 分钟）后 Turn error，**零产出**；a1（46.29MB）缺 nouns.js；a2（45.89MB）缺 reported-speech.js；c1/c2/c3（41.4/45.6/45.3MB）属**侥幸通过**（离红线仅 1–5MB） |
| 修法 | **两条必须同时成立**：① 读图前生成压缩镜像（保持原分辨率 + JPEG quality=60 + optimize + progressive，696KB→110KB）；② **单会话 ≤40 张**。只做①不够：全量镜像 base64 仍 ≈59MB |
| 不可逆性 | **超限会话无法救回**（历史永远超标）→ 只能换新 worker，禁止在原会话重试或续派任务 |
| 闭环验证 | 新建 a4 / b4 后补齐 5 件，全程 **0 次 413**；最终 417/417 |

**建议**
1. 平台层：会话历史中的图片应自动摘要化/降采样，或按轮裁剪，从根上消除"重放放大"。
2. 平台层：开工前给出**会话体积预估/预算**（"再读 N 张就会撞 48MiB"）。
3. 协作层：任何"读大量图片"的任务，**压缩镜像 + ≤40 张/会话**写进契约（本次已写入 `README.md` §7/§7.1，属项目级硬约束，不是特例）。

### P1-1 跨节点/跨工作区「文件到手」不可靠（三个独立实例）

| 实例 | 表现 |
| --- | --- |
| 工作区同步竞态 | Linux 队长与 worker 在工作区同步完成前就启动，快照里**没有** `web/js/grammar/yufan/README.md` + `_template.js`；verb 与 syntax 都为此发 request 索要契约，syntax 甚至**暂停派发**等契约 |
| 内联 base64 下发脚本 | `echo <b64> \| base64 -d > <path>` 经 PowerShell 包 `bash -c '...'` 后，重定向/引号被吃，**文件只落 9 字节 `pushed -`**（xxd `7075 7368 6564 202d 0a`），且"本地写入成功"的回显仍在 → **假成功** |
| 文件根本不存在 | `scripts/yufan-prepare-images.py` 在 syntax 工作区连占位都没有 |

**建议**
1. 派发任务时**内联全文**（契约、脚本、规则），不要只给路径 —— 本次改为内联后，两组立刻恢复。
2. 跨节点传文件用 `scp`（已验证）或 `ssh host "…| base64 -d | bash"`；**下发后必须回读远端 sha1 + 字节数 + 语法检查**，不能只看本地写入成功。
3. 平台层：A2A 消息支持 attachments / 显式文件分发原语，替掉内联 base64 与手工 scp。

### P1-2 控制面能力与文档不一致（两处）

| 项 | 实测 |
| --- | --- |
| `agent_admin_remove` | 对**任何非 master 层级**一律 `PermissionDenied: agent is outside the project`；主控对 a1/a2/a3/b3、队长对自己的 a1/a2/a3，带 `delete_descendants` / `force` / `agent_id` 各种组合**全部失败**。而 `list_a2a_agents` 里它们 ProjectID/Phase 都正常 |
| `maxDerivedAgentWidth: 3` | 与实测不符：lexis 在**未删除任何旧 agent**的情况下成功创建第 4 个存活子 agent；verb-b4 同样 RUNNING |

**后果**：报废的 b3 无法回收，永久占一个派生位；也差点让两个队长为了"腾宽度"去删可用 agent（幸好先实测才避免误操作）。

**建议**
1. 要么允许队长回收自己的后代（或给 master 提供批量回收接口），要么在技能文档里明确写"不可删、就地保留"。
2. 宽度上限给出准确语义（按层？按总数？是否含已完成会话？），并在状态接口暴露"当前计数 / 上限"。

### P2-1 口径漂移与人为错误（三起，均由当事人主动纠正）

| 事件 | 说明 |
| --- | --- |
| 消息误投 | 主控把**给词法组**的验收结论（"取件 nouns.js/reported-speech.js、剩余仅 b4 3 件"）发到了**动词组**队长；对方按"无需回执"处理并如实指出，未据此改任何东西 |
| 归因错误 | 同一份报告把**动词组**的字节数/压缩比/幂等复跑记到了**词法组**名下；lexis 主动发勘误表逐条订正（"不是我做的"） |
| 自检工具不可靠 | `node --check` 对 ES Module **exit=0 不报错**（实测 `export default [\n{a:1},\nextras:{},\n];` 竟然通过），而 `import()` 正确报 `Unexpected token ':'`。c2 正是踩此坑才发现一处漏括号 |

**建议**
1. 报告里每个数字都标"谁测的 / 怎么测的"；跨组数字**只允许产出组自报**，主控只做复算与会签。
2. 发送前复核收件人（A2A 没有"发错可撤回"）。
3. 统一自检口径并写进契约：**ESM 一律 `import()`，禁用 `node --check`**。

### P2-2 本次流程自身暴露的两个缺陷（我这边）

| 缺陷 | 细节 | 修法 |
| --- | --- | --- |
| 生成物被当成数据 | 新生成的 `manifest.js` 被合并脚本自己的 `readdirSync(...endsWith('.js'))` 扫描当成讲义模块 → `--check` 报 error 1（"default export 必须是非空数组"），若不发现会把它写进模块清单 | 加入 `RESERVED` 排除名单；更好的做法是生成物走独立目录/后缀 |
| 缓存版本号手工维护易漏 | `grammar.css` 内容改了但 `index.html` 里 `?v=` 还是旧值 → 老浏览器命中旧 CSS；这已是同一坑的第二次 | 让脚本**强校验**版本号一致性（`ASSET_V` 与 `manifest.js` / `index.js` 不一致直接报 error），其余 `?v=` 建议构建期自动改写 |

---

## 二、有效的做法（值得固化）

1. **三级编制 + 无重叠切分**：主控 → 3 队长（词法/动词/句法）→ 3–4 worker/队长，单 worker ≤48 张图；417 张图无重复、无遗漏，账目逐目录可核。
2. **契约先行，且契约内联**：`README.md` 定义字段与 6 种 block 类型；派发时把契约全文贴进消息，并附"自检命令"。
3. **队长不采信 worker 自述**：`import()` + 结构校验（字段/block 类型/table 行列对齐/examples 双语）+ **越界 diff**（`topics.js`/`index.js` 逐字节未变）+ 抽样回看原图。
4. **交付清单化**：路径 + 字节 + sha256 + imagesRead + 覆盖目录，缺一不验收；取件链路用 sha256 交叉验证（证明 scp 无截断）。
5. **主控二次独立复算**：本次两轮复算各抓到真缺陷（`manifest.js` 被当模块、CSS 缓存版本号、`g-past-continuous`/`g-imperatives` 的"越权写入"误判被证伪）。
6. **失败可见、不编造**：worker 如实标注"原图无答案/页边裁切/旋转 90°/整页倒置"，练习页只留题干；主控与用户对不上时以原图为准。
7. **先量化再动手**：改造前先算字段占比如（sections 79.9%），才决定"只拆 sections"这一性价比最高的方案。

---

## 三、给平台/团队的可操作建议（汇总）

**平台层**
1. 会话历史图片自动压缩/裁剪，或提供"图片不重放"的引用式渲染。
2. 开工前给出会话体积预算与风险提示。
3. A2A 支持附件与文件分发原语。
4. 修正 `agent_admin_remove` 权限语义（或文档化"不可删"），并让 `maxDerivedAgentWidth` 行为与文档一致、暴露真实计数。
5. A2A 收件箱在 request 被 response 关闭后应标记完成（本次有 3 条已回执的 request 长期显示 pending，`remaining_count=3` 清不掉）。
6. 长会话不可恢复的问题应在 UI 明确告警（"本会话图片已 41MB，禁止再读图"）。

**协作规范层（建议进项目 AGENTS.md / 任务模板）**

| # | 规则 |
| --- | --- |
| 1 | 派发即内联：契约、脚本、规则一律内联全文，不指路径 |
| 2 | 读图铁律：先压缩镜像 + 单会话 ≤40 张，两条同时成立；超限换 worker，不重试 |
| 3 | 自检口径：ESM 一律 `import()`，禁 `node --check` |
| 4 | 交付清单化：路径 + 字节 + sha256 + imagesRead + 覆盖目录 |
| 5 | 数字归因：标注测量者与测量方式；发布前由产出组自校 |
| 6 | 生成物隔离：脚本生成文件不与手写数据混放，且必须进扫描排除名单 |
| 7 | 跨节点文件：只用 scp / stdin 管道，下发后回读 sha1 与字节数 |
| 8 | 平台限制先实测再依赖：权限、宽度上限、快照内容都要先验证再用 |

**执行习惯层**
- 写文件统一走 node 脚本（本机 PowerShell 5.1 会引入 BOM/CRLF，`node -e` 引号会被吃，`Remove-Item` 被策略拒）；写完校验 BOM/换行。
- 失败必须可见：加载失败给错误 + 重试，不静默降级。
- 独立复算是高回报动作：本次两次复算各抓到真缺陷。

---

## 四、证据索引

- `reports/yufan-413-root-cause.md`（413 根因/阈值/勘误）
- `reports/yufan-final-verification.md`（交付验收 + §9 复验 + §10 按需加载）
- `reports/yufan-lazy-loading.md`（按需加载改造）
- `reports/yufan-lectures-report.md/json`（覆盖率与契约校验）
- 黑板：`findings/deepseek-413-body-limit`、`findings/cross-node-file-push-lesson`、`findings/derived-width-and-remove-permissions`、`findings/yufan-sync-race`、`plan/yufan-grammar-lectures`、`yufan-grammar/*`
