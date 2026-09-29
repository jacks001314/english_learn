# 服务器部署报告 · English Learn（Lingo Bloom）

- 部署日期：2026-09-28
- 目标主机：`root@www.gbw3bao.com`
- 部署目录：`/opt/english-learn`
- 服务：`english-learn.service`（systemd，监听 `:8081`）
- 反向代理：nginx 1.28.3，`/etc/nginx/conf.d/english-learn.conf`
- 部署版本（VERSION）：`20260928-105051`
- 前端资源版本：语法族 `20260928-grammar-p3-r4`；yufan 族 `20260928-yufan-r5`
- 部署脚本：`scripts/deploy.ps1`（默认参数即本服务器）

## 1. 结论

部署成功。服务 `active` + `enabled`，健康检查通过，nginx 反代已更新并生效，线上数据库未丢失。

## 2. 部署内容

| 项 | 说明 |
| --- | --- |
| english-learn | Linux amd64 二进制（38,453,410 B） |
| web/ | 前端（含语法模块重设计 P1–P4，新增「定语从句」专题，专题总数 31） |
| backend/ | 词库 / 文章 / 试卷 JSON |
| chuzhong/ | 教材数据 |
| VERSION / README.md | 版本标记与说明 |
| 归档 | `english-learn-linux-amd64.tar.gz`（32,917,933 B） |

## 3. 部署前状态（侦察）

- Ubuntu 26.04 LTS / x86_64；nginx 1.28.3 运行中
- 旧版：VERSION `20260925-102618`；`/etc/nginx/conf.d/english-learn.conf` md5 `b3d83e3d0fcd561a8f6be6ae8c96698d`（无 gzip）
- 磁盘 `/` 40G，部署前剩余 6.3G；内存 1.6G

## 4. 执行过程

执行命令：

```
powershell -ExecutionPolicy Bypass -File .\scripts\deploy.ps1 `
  -HostName www.gbw3bao.com -UserName root -Password *** `
  -RemoteRoot /opt/english-learn -ServiceName english-learn `
  -ListenAddress ':8081' -SkipAudioSync -InstallNginxProxy
```

脚本主要步骤：构建 → 打 tar.gz → plink 连接测试 → `mkdir -p backups` → `cp -a` 备份线上 db → 上传归档与 unit → `systemctl stop` → 解包覆盖 `{english-learn,web,backend,chuzhong,README.md,VERSION}` → `daemon-reload`/`enable` → `systemctl restart` → 健康检查 → 安装 nginx 配置并 `reload`。

### 4.1 过程偏差：音频同步被跳过（-SkipAudioSync）

`scripts/import-audio.ps1` 在复制以下文件时报 "Cannot find path"：

```
audio_7\Unit 3\Developing ideas\Reading for writing\2 Look at the title and the pictures. What is the story about？Now read the story and check your answer..mp3
```

根因：源文件全路径 **265 字符 > Windows MAX_PATH 260**（`Get-ChildItem` 可枚举，`Copy-Item` 失败）。
已核验 `audio_7` 与 `web/audio/7` 均为 53 个文件、体积多重集逐项完全一致，同步在本机为幂等空操作，故使用 `-SkipAudioSync` 继续，未产生损坏。**该脚本缺陷需修复（见第 7 节）。**

## 5. 验证证据（全部通过）

| 项 | 命令 / 方式 | 结果 |
| --- | --- | --- |
| 服务状态 | `systemctl is-active/is-enabled english-learn` | `active` / `enabled` |
| 版本 | `cat /opt/english-learn/VERSION` | `20260928-105051` |
| 启动日志 | `journalctl -u english-learn -n 25` | `loaded primary: 1331 words`；`loaded middle: 2895 words`；Iris 12.2.11 正常启动；**无错误** |
| 前端资源一致性 | 41 个文件（`web/js/grammar/**`、`grammar.css`、`index.html`、`js/main.js`）本地 vs 线上 MD5 | **41/41 完全一致** |
| 语法版本标记 | `grep -o 'grammar-p[0-9]*-r[0-9]*' web/index.html` | `grammar-p3-r4` |
| yufan 版本标记 | `grep -o 'yufan-r[0-9]*' web/js/grammar/index.js` | `yufan-r5` |
| nginx 配置 | `md5sum /etc/nginx/conf.d/english-learn.conf` | `5ff0510a9b479033bb50254f0af0567f`（新版，含 gzip） |
| nginx 语法 | `nginx -t` | syntax is ok / test is successful |
| 首页（80） | `curl -H 'Host: www.gbw3bao.com' /` | `200` |
| 样式（80） | `GET /grammar.css?v=20260928-grammar-p3-r4` | `200` |
| gzip（80 与 8081） | `GET /js/main.js` + `Accept-Encoding: gzip` | `Content-Encoding: gzip` |
| 健康检查 | `GET :8081/api/health` | `{"status":"ok"}` |
| 音频 | `GET /audio/7/unit1/vocab.mp3` | `200`，381,166 B |

## 6. 数据完整性专项（english_learn.db）

**结论：线上数据未丢失，用户数据完整保留。**

证据链：

1. 部署包解包清单不含 `english_learn.db`（见 `scripts/deploy.ps1` 第 224 行的打包清单），解包过程不会触碰该文件。
2. 部署前脚本执行 `cp -a /opt/english-learn/english_learn.db backups/english_learn-20260928-105051.db`，备份文件保留原 mtime `2026-09-25 10:26`。
3. db 文件大小部署前后均为 16,777,216 B（空库仅约 32 KB，若被替换会立刻可见）。
4. db mtime 由 `2026-09-25 10:26` 变为 `2026-09-28 10:51`，原因是服务启动时 `openStore()` 调用 `bolt.Open()` 以**读写**方式打开数据库（`internal/learning/repository.go`），属正常行为，不代表数据被替换。
5. 用本地 Go + bbolt 对「部署前备份」与「当前 db」做**逐 key 值哈希比对**，结果如下：

| bucket | 部署前 keys | 部署后 keys | key 缺失 | key 新增 | value 变化 |
| --- | --- | --- | --- | --- | --- |
| words | 4614 | 4614 | 0 | 0 | 2321 |
| examples | 4340 | 4340 | 0 | 0 | 0 |
| pronunciations | 4226 | 4226 | 0 | 0 | 0 |
| articles | 40 | 40 | 0 | 0 | 0 |
| sessions | 15 | 15 | 0 | 0 | 0 |
| exam_papers | 9 | 9 | 0 | 0 | 0 |
| learning_plans | 7 | 7 | 0 | 0 | 0 |
| users | 5 | 5 | 0 | 0 | 0 |
| learning_events | 4 | 4 | 0 | 0 | 0 |
| progress | 2 | 2 | 0 | 0 | 0 |
| content_meta | 1 | 1 | 0 | 0 | 0 |
| 其余 21 个 bucket | 0 | 0 | 0 | 0 | 0 |
| **合计** | **13263** | **13263** | **0** | **0** | 2321 |

只有 `words` 桶内 2321 条记录的 value 被刷新，键集合无增无减。原因是服务启动时 `importContentLibrary(db)` 会把 `backend/` 下的教材 JSON 重新导入数据库（启动期 upsert），本次部署同时更新了 `backend/` 教材数据，因此词条字段被同步——这是**预期行为**，非数据损坏。

用户侧数据（users / sessions / progress / learning_plans / exam_papers / articles）全部完整保留。

## 7. 遗留问题与风险

| # | 问题 | 影响 | 建议 |
| --- | --- | --- | --- |
| 1 | `scripts/import-audio.ps1` 在 Windows 上无法处理 >260 字符路径 | 部署脚本第一步会失败，需人工跳过 | 改用 `\\?\` 长路径前缀或 .NET `File.Copy` |
| 2 | 音频缺口 `web/audio/7/appendix/pronunciation-guide.mp3` | 语法专题附录发音指引无音频 | 补文件或改数据引用（待拍板） |
| 3 | 4 条同名历史覆盖规则（`.grammar-detail` / `.sec-dot` / `.ex-ico` / `.tb-zh`）是否移除 | 样式表冗余 | 待拍板 |
| 4 | 本地 `english_learn.db` 处理方式 | 工作区整洁 | 待拍板 |
| 5 | **回滚风险**：本次部署未单独保留上一版二进制 | 服务若异常，无法二进制级回滚，只能重新编译 | 建议在 `deploy.ps1` 覆盖前增加 `cp english-learn backups/english-learn-<version>` |

## 8. 回滚方案（当前可用）

- 数据库：从 `/opt/english-learn/backups/english_learn-20260928-105051.db` 恢复（保持服务停止状态执行）。
- 代码：无二进制回滚包，需用旧代码重新构建后重新部署。

## 9. 建议的后续动作

1. 修复 `scripts/import-audio.ps1` 长路径缺陷，并给 `deploy.ps1` 增加旧二进制备份。
2. 在浏览器访问 `http://www.gbw3bao.com` 做一次人工验收（语法模块 31 个专题、含「定语从句」）。
3. 清理本地 `.tmp/` 临时目录（putty、staging、db 副本）。