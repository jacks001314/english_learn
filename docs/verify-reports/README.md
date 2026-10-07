# docs/verify-reports —— 「严格线上测试」的机器可读原始报告

这些 JSON 是各套件跑完后自己落盘的报告（脚本原文在 `scripts/`），
每条 check 都带 `id / label / ok / detail`，可以直接复核，不需要相信任何人的转述。
验收矩阵与解读见 `docs/agent-ux-verification.md`（§6 线上测试、§9 服务端六场景、§10 UI 层六场景、§11 线上测试抓到的两个真缺陷、§14 浮动形态跨视口、§15 停靠形态跨视口、§18 P0-3 / P1-1 的线上证据、§19 计划条目逐条对照、§20 长回答折叠）。

| 文件 | 产生命令 | 结果 |
| --- | --- | --- |
| `report-live.json` | `node scripts/online-agent-e2e.mjs`（真服务端 + 真模型 deepseek-flash，含六场景 V5 回执行） | **32 通过 / 0 失败** |
| `report-mock.json` | `node scripts/online-agent-e2e.mjs --mock`（桩模型，秒级回归） | **33 通过 / 0 失败** |
| `report-ui-live.json` | `node scripts/online-agent-ui-e2e.mjs`（真 Chrome + 真站点 + 真模型，含 U31–U33 流式停止 / 钉顶 + U34–U36 阅读选词浮条 / 就地卡片 / 回执展开） | **34 通过 / 0 失败** |
| `report-ui-mock.json` | `node scripts/online-agent-ui-e2e.mjs --mock` | **32 通过 / 0 失败**（U34–U36 同样跑） |
| `report-agent-ux-verify.json` | `node scripts/agent-ux-verify.mjs`（本地验证台，逐场景断言） | **8 场景 / 51 断言全绿**（含 P2「长回答折叠」） |
| `report-ui-live-w1120.json` | `node scripts/online-agent-ui-e2e.mjs --window 1120,900 --tag -w1120`（真 Chrome + 真站点 + 真模型，浮动栏下沿 1104px 视口） | **31 通过 / 0 失败** |
| `report-ui-live-w1024.json` | `node scripts/online-agent-ui-e2e.mjs --window 1024,900 --tag -w1024`（真 Chrome + 真站点 + 真模型，窄屏抽屉形态） | **31 通过 / 0 失败** |
| `report-ui-live-w1200.json` | `node scripts/online-agent-ui-e2e.mjs --window 1200,900 --tag -w1200`（真 Chrome + 真站点 + 真模型，浮动栏 + 纵向叠放） | **31 通过 / 0 失败** |
| `report-ui-live-dock1024.json` | `node scripts/online-agent-ui-e2e.mjs --placement dock --window 1024,900 --tag -dock1024`（真 Chrome + 真站点 + 真模型，**停靠**形态 · ≤1100px 抽屉） | **39 通过 / 0 失败** |
| `report-ui-live-dock1120.json` | `node scripts/online-agent-ui-e2e.mjs --placement dock --window 1120,900 --tag -dock1120`（真 Chrome + 真站点 + 真模型，**停靠**形态 · 栏宽 440px） | **39 通过 / 0 失败** |
| `report-ui-live-dock1440.json` | `node scripts/online-agent-ui-e2e.mjs --placement dock --window 1440,960 --tag -dock1440`（真 Chrome + 真站点 + 真模型，**停靠**形态 · 两栏段） | **39 通过 / 0 失败** |

> 计数说明：UI 套件在 2026-10-06 深夜加了 U31–U33（流式可停止 / 停止后有可见结果 / 新回答钉顶）后，
> float 报 34、dock 报 39、mock 报 32（U34–U36 是阅读选词浮条 / 就地卡片 / 回执展开，见 §18）；
> 验证台报 8 场景 / 51 断言（新增 P2「长回答折叠」场景，见 §20）；上表里 w1024/w1120/w1200 的 31 是各自那版脚本的断言数，几何断言本身没变（详见 `docs/agent-ux-verification.md` §17）。

补充门禁：`powershell -File ./scripts/ci.ps1` → 10 步通过 / 0 步失败；
`go build ./...` / `go vet ./...` / `go test ./... -count=1` 全部 exit=0。

> 报告里不会出现密钥：`report-live.json` 记录的是 `/api/admin/agent/config` 的**脱敏**回执
> （已用 `grep sk-` 逐个核对，0 命中）。
>
> 复跑注意：`1440,960`（视口 1424x865）是 UI 断言里「题目列 ≥300px」这条阈值的基准（§10.2）。
> 换窗口尺寸请用 `--window WxH --tag -w<W>`：加上 `--window` 时会额外跑 U27（无横向溢出）与 U28（主内容列 ≥300px），
> 并按形态分支断言（≤1040px 全屏抽屉 / 1041–1399px 浮动栏+叠放 / ≥1400px 浮动栏+两栏），详见 `docs/agent-ux-verification.md` §14。
> 测**停靠**形态加 `--placement dock`（会先点面板头部的「停靠到右侧」开关，再断言 U29 开关存在 / U30 栏宽 440px + 页面让出 ≥400px；
> ≤1100px 按抽屉断言），浮动 10 档 + 停靠 9 档的实测表见 §14 / §15。
