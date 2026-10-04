# 部署、升级与回滚

对应 plan.md「P2：工程质量与交付」里的部署说明与版本升级/回滚步骤。

## 1. 线上拓扑

| 项 | 值 |
| --- | --- |
| 域名 | `www.gbw3bao.com`（公网 80 端口） |
| 服务 | systemd 单元 `english-learn`，工作目录 `/opt/english-learn`，监听 `:8081` |
| 反向代理 | nginx 只监听 80；https 由服务器外的 frp 转发 |
| 数据库 | `/opt/english-learn/english_learn.db`（BoltDB，**原地保留**，部署不覆盖） |
| 数据备份 | `/opt/english-learn/backups/english_learn-<version>.db`（每次部署前自动 `cp -a`，不删旧备份） |
| 发布包归档 | `/opt/english-learn/releases/english-learn-<version>.tar.gz`（每次部署自动留档，只保留最近 5 个） |
| 版本标记 | `/opt/english-learn/VERSION`（`yyyyMMdd-HHmmss`） |

## 2. 一键部署

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\deploy.ps1                  # 完整部署
powershell -ExecutionPolicy Bypass -File .\scripts\deploy.ps1 -SkipAudioSync   # 跳过音频打包（只改前后端时更快）
```

常用参数：

| 参数 | 说明 |
| --- | --- |
| `-HostName` / `-UserName` / `-Password` / `-HostKeyFingerprint` | SSH 目标与主机指纹（默认已指向线上） |
| `-RemoteRoot` | 远端根目录，默认 `/opt/english-learn` |
| `-ServiceName` | systemd 服务名，默认 `english-learn` |
| `-ListenAddress` | 服务监听地址，默认 `:8081` |
| `-InstallNginxProxy` | 顺带安装/刷新 nginx 代理配置并 `nginx -t && reload` |
| `-SkipBuild` / `-SkipAudioSync` / `-SkipDeploy` / `-SkipRestart` | 分步调试用 |

部署脚本按顺序做这些事：

1. `go build`（linux/amd64 交叉编译）并打包教材音频；
2. 把 `english-learn`、`learnctl`（备份/校验/恢复工具）、`web/`、`backend/`、`chuzhong/`、`README.md`、`VERSION`（若存在还会带上 `config.json`）打成 `english-learn-linux-amd64.tar.gz`；
3. 远端 `mkdir -p /opt/english-learn/{backups,releases}`，并把当前数据库 `cp -a` 成 `backups/english_learn-<新版本>.db`；
4. 上传压缩包与 systemd 单元；
5. `systemctl stop` → 删除远端旧 `web/backend/chuzhong` 与旧二进制 → 解包 → 把压缩包归档到 `releases/` → 清理超过 5 个的旧发布包；
6. `systemctl daemon-reload && enable && restart`，然后自检 `curl /api/health` 与教材音频（期望 `audio http 200`）。

> ⚠️ 前端是静态资源，部署脚本会先删掉远端 `web/` 再解包，所以**不要**在服务器上直接改 `web/` 下的文件，改动请回到仓库再部署。

## 3. 部署后验收清单

1. `curl -fsS http://127.0.0.1:8081/api/health` 或公网 `GET /api/health` → `{"status":"ok"}`；`systemctl is-active english-learn` → `active`。
2. `cat /opt/english-learn/VERSION` 与本次部署输出一致。
3. 首页 `index.html` 引用的 `?v=` 版本号是新版本（前端没有构建链，靠它破缓存）。
4. 抽查关键页面：首页、看词选义、今日复习、错题本、智能学习台。
5. 数据没丢：登录一个已有账号，进度与错题还在。
6. 更严格时对着线上跑一次端到端：`node scripts/e2e-practice-flow.mjs --base http://www.gbw3bao.com`（会注册一个一次性账号）。

## 4. 版本升级

- **升级 = 再跑一次 `deploy.ps1`**：版本号按部署时间自动生成，不需要手工改号。
- 数据迁移由服务启动时的 `openStore` → `initDB` → `migrateLegacyProgress` → `importContentLibrary` 幂等完成；这些迁移只做「补桶 / 补键 / 加前缀」，不删数据，所以旧二进制也能读新库。
- Windows 本地升级：`powershell -ExecutionPolicy Bypass -File .\scripts\upgrade-current.ps1`（先把现有 `english_learn.db` 备份到 `.tmp/upgrade-current.db`，构建成功后才替换）。

## 5. 回滚

### 5.1 只回滚数据库（最常见：误操作或数据异常）

```bash
systemctl stop english-learn
cp -a /opt/english-learn/english_learn.db /opt/english-learn/english_learn.db.bad
cp /opt/english-learn/backups/english_learn-20261004-201343.db /opt/english-learn/english_learn.db
systemctl start english-learn
curl -fsS http://127.0.0.1:8081/api/health
```

### 5.2 回滚代码（新版本代码有问题）

```bash
ls -1t /opt/english-learn/releases
systemctl stop english-learn
cd /opt/english-learn && rm -rf web backend chuzhong english-learn
tar -xzf /opt/english-learn/releases/english-learn-20261004-201343.tar.gz -C /opt/english-learn
chmod +x /opt/english-learn/english-learn
echo 20261004-201343 > /opt/english-learn/VERSION
systemctl start english-learn
curl -fsS http://127.0.0.1:8081/api/health
```

注意：

- 回滚代码**不会**自动回滚数据库；新版本写过的数据仍在，老代码按幂等迁移读取即可。
- 若两者都要回滚，先按 5.1 恢复数据库，再按 5.2 回滚代码。
- 每次回滚完都要走一遍第 3 节的验收清单。

## 6. 运行配置与结构化日志

服务启动时按 **内置默认值 → `config.json` → 环境变量 → 命令行参数** 的顺序解析配置
（实现见 `internal/learning/config.go`，示例见仓库根目录 `config.example.json`）。

| 配置项 | `config.json` 字段 | 环境变量 | 默认值 |
| --- | --- | --- | --- |
| 监听地址 | `addr` | `ENGLISH_LEARN_ADDR` | `:8080`（部署脚本显式传 `-addr :8081`） |
| 数据库文件 | `dbPath` | `ENGLISH_LEARN_DB` | `<root>/english_learn.db` |
| 备份目录 | `backupsDir` | `ENGLISH_LEARN_BACKUPS_DIR` | `<root>/backups` |
| 日志级别 | `logLevel` | `ENGLISH_LEARN_LOG_LEVEL` | `info`（debug / info / warn / error） |
| 日志格式 | `logFormat` | `ENGLISH_LEARN_LOG_FORMAT` | `text`（text / json） |

- 相对路径按项目根目录解析；根目录由 `ENGLISH_LEARN_ROOT` 指定（systemd 单元里已设置）。
- 配置文件名默认是 `<root>/config.json`，可用 `ENGLISH_LEARN_CONFIG` 指向其它路径；
  文件不存在时全部走默认值，配置项非法（如 `logLevel: loud`）会直接启动失败而不是静默降级。
- 仓库根目录的 `config.json` 会随 `deploy.ps1` 一起打包发布；改日志格式只改这个文件再部署即可。
- 日志统一走 Go 标准库 `log/slog`：应用日志与 Iris 框架日志同格式，
  `logFormat=json` 时 `journalctl -u english-learn -n 50` 的每一行都是可解析的 JSON：
  `{"time":"...","level":"INFO","msg":"english-learn listening","addr":":8081","db":"..."}`。

## 7. 数据库备份与恢复

三种方式互为补充：

1. **部署时自动备份**：`deploy.ps1` 每次发布前把线上库 `cp -a` 成 `backups/english_learn-<版本>.db`（保留全部历史备份）。
2. **在线备份（服务不用停）**：管理员接口 `POST /api/admin/backup` 用 bbolt 只读事务做一致性快照写入备份目录，
   `GET /api/admin/backups` 列出备份；命令行也可以直接触发：

   ```bash
   ./learnctl backup --online --base http://127.0.0.1:8081 --username admin --password '***'
   ```

3. **离线备份 / 校验 / 恢复**（要求先 `systemctl stop english-learn`）：

   ```bash
   ./learnctl backup                      # 备份到 <root>/backups/
   ./learnctl list                        # 列出备份（按时间倒序）
   ./learnctl verify --file backups/english_learn-20261004-204724.db
   ./learnctl restore --from backups/english_learn-20261004-204724.db --yes
   ./learnctl config                      # 打印当前生效配置（JSON）
   ```

- `restore` 先校验备份文件，再把现有库另存为 `<db>.pre-restore-<时间戳>`，最后用临时文件 + rename 原子替换，失败不会留下半截数据库。
- 服务还在运行（数据库被进程独占）时，`learnctl backup/restore` 会直接报错退出并提示改用在线接口，绝不会读到不一致的快照。
- 本地 Windows 用法相同：`go run ./cmd/learnctl ...`，或先 `go build -o .tmp/learnctl.exe ./cmd/learnctl`。

## 8. 已验证的部署记录

| 版本 | 结果 |
| --- | --- |
| `20261004-201343` | 练习来源筛选上线；本地与线上 `sha256` 一致 |
| `20261004-202509` | 首次带 `releases/` 归档步骤；清理旧包的命令有引号缺陷导致中断，已恢复服务并修复脚本 |
| `20261004-202557` | 修复后完整跑通：`health ok`、`audio http 200`、发布包归档成功 |

部署脚本这次的缺陷与恢复过程记录在 `goal-evidence/round4-deploy.txt`。
