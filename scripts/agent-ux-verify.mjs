// scripts/agent-ux-verify.mjs —— 智能助教 UX 改造的前端验收（V1–V6）
// ---------------------------------------------------------------------------
// 做什么：起一个静态服务，用无头 Chrome 打开 docs/agent-ux-e2e-harness.html，
//         逐个场景跑「遮挡审计 + 渲染断言」，输出 PNG 截图与机器可读结论。
// 为什么：V1 的判据是"可点区域不再被遮挡"，V3 是"讲解渲染成卡片"——这些必须是
//         可复跑的检查，而不是"我截图看了一眼"。无第三方依赖，只用 node + Chrome。
//
// 用法：node scripts/agent-ux-verify.mjs
//       node scripts/agent-ux-verify.mjs --keep     # 保留临时截图目录路径打印
//       CHROME_PATH="C:\...\chrome.exe" node scripts/agent-ux-verify.mjs
//
// 退出码：任一断言失败返回 1。
//
// 注意：模型传输层是桩（契约 §1–§3 的样例响应）。真实服务端由
// `go test ./internal/learning -run TestHTTPAgentChat -count=1` 覆盖。
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HARNESS = "/docs/agent-ux-e2e-harness.html";
const SHOT_DIR = path.join(ROOT, ".tmp", "agent-ux-verify");
const PORT = Number(process.env.PORT || 8137);

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".woff2": "font/woff2",
};

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error("找不到 Chrome/Chromium，请设置 CHROME_PATH 环境变量");
}

function serve() {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent((req.url || "/").split("?")[0]);
    const target = path.join(ROOT, url);
    if (!target.startsWith(ROOT) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("not found: " + url);
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(target).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(target).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, "127.0.0.1", () => resolve(server)));
}

function chrome(chromePath, args) {
  return new Promise((resolve) => {
    const child = spawn(chromePath, args, { stdio: ["ignore", "pipe", "ignore"] });
    let out = "";
    child.stdout.on("data", (chunk) => { out += chunk.toString("utf8"); });
    child.on("close", () => resolve(out));
  });
}

function baseArgs(profileDir, extra) {
  return [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
    "--no-default-browser-check", "--disable-extensions", "--mute-audio",
    `--user-data-dir=${profileDir}`, "--virtual-time-budget=20000", ...extra,
  ];
}

function unescapeHtml(text) {
  return text.replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

// 从 dump-dom 里取出 <pre id="harness-report"> 的 JSON。
function extractReport(dom) {
  const marker = dom.lastIndexOf('id="harness-report"');
  if (marker < 0) return null;
  const open = dom.indexOf(">", marker);
  const close = dom.indexOf("</pre>", open);
  if (open < 0 || close < 0) return null;
  try {
    return JSON.parse(unescapeHtml(dom.slice(open + 1, close)));
  } catch (error) {
    return { parseError: String(error) };
  }
}

const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok: !!ok, detail: detail === undefined ? "" : String(detail) });
}

function coveredTotal(report) {
  return (report && report.occlusion && report.occlusion.targets || [])
    .reduce((sum, target) => sum + target.covered, 0);
}

const SCENARIOS = [
  { id: "float-card", mode: "float", state: "card", auto: true, expectCard: true },
  { id: "dock-card", mode: "dock", state: "card", auto: true, expectCard: true },
  { id: "float-streaming", mode: "float", state: "streaming", auto: true, expectCard: false },
  { id: "float-text", mode: "float", state: "text", auto: true, expectCard: false },
  // 面板收起时不该白占右栏，但悬浮球也不能压住页面可点区域（错词栏底部最容易中招）。
  { id: "float-closed", mode: "float", state: "card", auto: false, expectCard: false, expectClosed: true },
  // V5：六类新场景（同步训练 / 作业 / 课程 / 变式练习 / 考试 / 语法）任取一类做端到端断言。
  // 这里选 exam：后端场景名与前端 SCENE_LABELS.exam 都是「考试讲解」，断言文案唯一。
  // homework 两侧文案不一致（前端 SCENE_LABELS.homework =「作业练习」），拿它做断言会把
  // 「前端自己的文案」误判成「后端契约」，详见 docs/agent-page-parity-check.md。
  { id: "float-scene-capsule", mode: "float", state: "card", auto: true, scene: "exam", expectCard: true,
    expectCapsule: "考试讲解" },
  // V6：答错后就地讲解（askInline → #inlineHost），并断言答错动作区（.meaning-ask）零覆盖点。
  { id: "float-inline-ask", mode: "float", state: "card", auto: true, inline: true, expectCard: true,
    expectInline: true },
  // P2「长回答折叠」：长散文回答默认折叠，点「展开全文」后完整展开，且折叠时不遮挡页面。
  // 桩（fold=1）给的是一条 1300 字的纯文本回答——卡片不参与折叠，所以必须用散文这条路径来验。
  { id: "float-long-fold", mode: "float", state: "text", auto: true, fold: true,
    expectCard: false, expectFold: true },
];

async function main() {
  const chromePath = findChrome();
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const profileDir = path.join(SHOT_DIR, "profile");
  fs.mkdirSync(profileDir, { recursive: true });
  const server = await serve();
  console.log(`==> 智能助教前端验收台（${chromePath}）`);
  console.log(`    静态服务 http://127.0.0.1:${PORT}  截图目录 .tmp/agent-ux-verify/`);

  const reports = {};
  try {
    for (const scenario of SCENARIOS) {
      const extraQuery = [];
      if (scenario.scene) extraQuery.push("scene=" + scenario.scene);
      if (scenario.inline) extraQuery.push("inline=1");
      if (scenario.fold) extraQuery.push("fold=1");
      const baseQuery = "?auto=" + (scenario.auto ? 1 : 0) + "&mode=" + scenario.mode + "&state=" + scenario.state +
        (extraQuery.length ? "&" + extraQuery.join("&") : "");
      const query = baseQuery + "&report=1";
      const url = "http://127.0.0.1:" + PORT + HARNESS + query;
      // 注意：dump-dom 这一趟也必须带 --window-size。否则无头 Chrome 用默认视口（约 800x600），
      // 命中 @media(max-width:900px) 把面板变成全屏抽屉，而遮挡采样点落在视口之外，
      // elementFromPoint 返回 null 会被记成「未遮挡」——V1 变成永远通过的空断言。
      // （实测：干净 profile 下不带该参数，float-card 的 panel = {left:0,top:0,width:764,height:485}；
      //   带上后 = {left:1002,top:312,width:420,height:620}，才是桌面浮动形态。）
      const dom = await chrome(chromePath, baseArgs(profileDir, ["--window-size=1440,960", "--dump-dom", url]));
      const report = extractReport(dom);
      reports[scenario.id] = report;

      const shotUrl = "http://127.0.0.1:" + PORT + HARNESS + baseQuery;
      const shot = path.join(SHOT_DIR, `${scenario.id}.png`);
      await chrome(chromePath, baseArgs(profileDir, ["--window-size=1440,960", `--screenshot=${shot}`, shotUrl]));

      if (!report || report.parseError) {
        check(`${scenario.id} 报告可读`, false, report && report.parseError ? report.parseError : "页面里没有 harness-report");
        continue;
      }
      const label = `${scenario.id}`;
      // V1 的遮挡审计只在桌面视口下有意义。视口一旦窄到抽屉断点，采样点落到视口外、
      // elementFromPoint 返回 null，会被记成「未遮挡」——断言会静默通过。所以先断言前提。
      const viewport = report.occlusion && report.occlusion.viewport;
      check(`${label} 遮挡审计跑在桌面视口（V1 前提）`,
        Array.isArray(viewport) && viewport[0] >= 1024 && viewport[1] >= 700,
        "viewport=" + JSON.stringify(viewport));
      check(`${label} 前端模块全部加载`, report.problems.length === 0, report.problems.join(" | "));
      check(`${label} 无遮挡（V1）`, coveredTotal(report) === 0,
        "被面板盖住的可点区域 " + coveredTotal(report) + " 处/" +
        (report.occlusion.targets || []).map((t) => `${t.name}:${t.covered}/${t.sampled}`).join(" "));
      if (scenario.expectClosed) {
        check(`${label} 面板保持收起`, report.panelOpen === false);
        check(`${label} 收起时页面不被压住（V1）`, coveredTotal(report) === 0,
          "被助教 UI 盖住的可点区域 " + coveredTotal(report) + " 处/" +
          (report.occlusion.targets || []).map((t) => `${t.name}:${t.covered}/${t.sampled}`).join(" "));
      } else {
        check(`${label} 面板已展开`, report.panelOpen === true);
      }
      check(`${label} 无错误提示`, !report.error, report.error);
      if (scenario.expectCard) {
        check(`${label} 渲染出教学卡片（V3）`, report.cardNodes > 0, "cardNodes=" + report.cardNodes);
        check(`${label} 渲染出已读回执（V4）`, report.receiptNodes > 0, "receiptNodes=" + report.receiptNodes);
      }
      if (scenario.state === "streaming") {
        check(`${label} 流式期间保持忙碌（V2）`, report.busy === true);
        check(`${label} 有停止生成入口（V2）`, report.stopButton === true);
      }
      if (scenario.state === "text") {
        check(`${label} 卡片缺失时回落为文本（V3 兜底）`,
          report.cardNodes === 0 && report.messages.some((m) => m.role === "assistant" && m.length > 20),
          JSON.stringify(report.messages));
      }
      // V5：状态胶囊（[class*="agent-statechip"], [class*="agent-context-pill"]）存在，
      // 且文案里含该场景的中文名。
      if (scenario.expectCapsule) {
        const capsule = String(report.statusCapsuleText || "");
        check(`${label} 场景状态胶囊（V5 · scene=${scenario.scene} →「${scenario.expectCapsule}」）`,
          report.statusCapsule === true && capsule.indexOf(scenario.expectCapsule) >= 0,
          "statusCapsule=" + report.statusCapsule + " 胶囊文案=" + JSON.stringify(capsule));
      }
      // V6：askInline 真的走通并把卡片回填进页内宿主（#inlineHost / .harness-inline），
      // 同时答错动作区（.meaning-ask）零覆盖点——就地讲解不能反过来挡住原地操作。
      if (scenario.expectInline) {
        const host = String(report.inlineHostText || "");
        const filled = host.indexOf("[inline card]") === 0 || host.indexOf("[inline] ") === 0;
        check(`${label} 页内就地讲解回填（V6）`, filled,
          (report.inlineHostSelector || "#inlineHost / .harness-inline") + " = " + JSON.stringify(host));
        const ask = ((report.occlusion && report.occlusion.targets) || [])
          .find((target) => target.name === "答错动作区");
        check(`${label} 答错动作区零遮挡（V6）`, !!ask && ask.covered === 0,
          ask ? ask.name + ":" + ask.covered + "/" + ask.sampled : "报告里没有「答错动作区」采样点");
      }
      // P2「长回答折叠」：折叠态的高度、按钮文案与展开后的高度都由验证台的折叠探针自动采集，
      // 这里只负责断言——否则这条验收又要变成「我点了一下看着没问题」。
      if (scenario.expectFold) {
        const fold = report.fold || {};
        check(`${label} 长回答默认折叠（P2）`,
          fold.box === true && fold.collapsed === true && fold.buttonText === "展开全文" && fold.textLength > 450,
          JSON.stringify(fold));
        check(`${label} 折叠态正文被裁剪到视口内（P2）`,
          fold.clampHeight > 0 && fold.clampHeight <= 300,
          "clampHeight=" + fold.clampHeight + " 全文长度=" + fold.textLength);
        check(`${label} 点「展开全文」后完整展开（P2）`,
          fold.expanded === false && fold.buttonAfter === "收起" && fold.fullHeight > fold.clampHeight,
          "expanded=" + fold.expanded + " buttonAfter=" + JSON.stringify(fold.buttonAfter) +
          " fullHeight=" + fold.fullHeight + " clampHeight=" + fold.clampHeight);
      }
    }
  } finally {
    server.close();
  }

  fs.writeFileSync(path.join(SHOT_DIR, "report.json"), JSON.stringify(reports, null, 2), "utf8");

  console.log("");
  let failed = 0;
  for (const item of checks) {
    if (!item.ok) failed += 1;
    console.log(`[${item.ok ? "PASS" : "FAIL"}] ${item.name}${item.detail ? " : " + item.detail : ""}`);
  }
  console.log("");
  const scenarioIds = [...new Set(checks.map((item) => item.name.split(" ")[0]))];
  const badScenarios = scenarioIds.filter((id) => checks.some((item) => item.name.split(" ")[0] === id && !item.ok));
  console.log(`==> 场景 ${scenarioIds.length - badScenarios.length} 通过 / ${badScenarios.length} 失败（共 ${SCENARIOS.length} 场景，断言 ${checks.length} 条）`);
  console.log(`==> 断言 ${checks.length - failed} 通过 / ${failed} 失败；机器可读结论：.tmp/agent-ux-verify/report.json`);
  if (failed > 0) {
    console.log("提示：前端改造未合入时，本脚本会如实报错（教学卡片/停靠形态尚未实现）。");
    process.exit(1);
  }
  console.log("前端验收全部通过。");
}

main().catch((error) => {
  console.error("验收失败：", error && error.message ? error.message : error);
  process.exit(1);
});
