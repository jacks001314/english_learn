// scripts/grammar-preview.mjs —— 语法模块本地预览 / 截图回归工具
// ---------------------------------------------------------------------------
// 用途：在不启动 Go 服务、不登录的情况下，用真实前端数据挂载 GrammarView 并截图。
// 做法：
//   1) 把 web/ 镜像到 tmp/grammar-preview/site，并去掉 import 上的 ?v= 查询串
//      （浏览器对 file:// / 静态服务上的查询串处理不一致，去掉只影响缓存，不影响逻辑）；
//   2) 生成 _preview.html：只挂载 GrammarView（props: userId/targetTopicId）；
//   3) 起一个本地静态服务，用 headless Chrome 截图 / dump-dom。
// 用法：
//   node scripts/grammar-preview.mjs                                  # 默认几个专题 × 1440/520
//   node scripts/grammar-preview.mjs --topics g-pronouns,g-nouns
//   node scripts/grammar-preview.mjs --widths 1440
//   node scripts/grammar-preview.mjs --net                                    # 打印首屏请求体积
//   node scripts/grammar-preview.mjs --frame 375                                 # 375px 窄屏（iframe 模拟）探针
//   node scripts/grammar-preview.mjs --topics g-pronouns --hash grammar/g-pronouns/lecture-3   # 深链
//   node scripts/grammar-preview.mjs --probe                          # 额外输出 clientWidth/溢出/错误（每个宽度各跑一次）
// 说明：Windows 版 Chrome 无头窗口宽度下限约 485px，移动端请用 --widths 520。
// ---------------------------------------------------------------------------
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORK = path.join(ROOT, "tmp", "grammar-preview");
const SITE = path.join(WORK, "site");
const SHOTS = path.join(WORK, "shots");

const args = process.argv.slice(2);
const argOf = (name, dflt) => {
  const i = args.indexOf("--" + name);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : dflt;
};
const has = (name) => args.includes("--" + name);

const TOPICS = argOf("topics", "g-pronouns,g-overview,g-there-be,g-reported-speech,g-adj-adv").split(",").map(s => s.trim()).filter(Boolean);
const WIDTHS = argOf("widths", "1440,520").split(",").map(s => Number(s.trim())).filter(Boolean);
const HEIGHT = Number(argOf("height", 2600));
const PROBE = has("probe");
const HASH = argOf("hash", "");
// --pop：预览时自动展开标题旁的说明弹层（spreadNote tooltip）
const POP = has("pop");
// --frame 375：用 375px 宽的 iframe 模拟真实手机视口（Windows 下无头 Chrome 窗口最小约 485px）
const FRAME = Number(argOf("frame", 0));
// --net：打印预览页真实请求的文件与字节数（用于首屏体积回归）
const NET = has("net");
const netLog = new Map(); // 可选：向预览页追加 hash（如 grammar/g-pronouns/lecture-3，验证深链）

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Google/Chrome/Application/chrome.exe"),
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];
const chrome = CHROME_CANDIDATES.find((p) => p && fs.existsSync(p));
if (!chrome) {
  console.error("找不到 Chrome/Edge，可用 CHROME_PATH 环境变量指定。");
  process.exit(2);
}

// ---------- 1) 镜像 ----------
const CSS = [
  "style.css", "responsive.css", "platform-v2.css", "redesign.css",
  "smart-learning.css", "course.css", "adaptive-desktop.css", "grammar.css",
];
const SKIP_DIRS = new Set(["audio"]);
const SKIP_EXT = new Set([".mp3", ".wav", ".m4a", ".jpg", ".jpeg", ".png", ".webp", ".mp4"]);

function stripQuery(src) {
  return src.replace(/(from\s*")(\.\.?\/[^"?]+)(?:\?[^"]*)?"/g, '$1$2"');
}

function mirror(dir, out) {
  fs.mkdirSync(out, { recursive: true });
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const from = path.join(dir, entry.name);
    const to = path.join(out, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      mirror(from, to);
      continue;
    }
    if (SKIP_EXT.has(path.extname(entry.name).toLowerCase())) continue;
    if (entry.name.endsWith(".js")) fs.writeFileSync(to, stripQuery(fs.readFileSync(from, "utf8")));
    else fs.copyFileSync(from, to);
  }
}

fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(SHOTS, { recursive: true });
mirror(path.join(ROOT, "web"), SITE);

// ---------- 2) 预览页 ----------
const previewHtml = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GrammarView preview</title>
${CSS.map((f) => `<link rel="stylesheet" href="/${f}">`).join("\n")}
</head><body>
<div id="app"></div>
<div id="probe" style="position:fixed;left:0;bottom:0;z-index:99;background:#111;color:#0f0;font:11px/1.4 monospace;padding:3px 6px;max-width:100vw"></div>
<script>window.__errors=[];
window.addEventListener("error",(e)=>window.__errors.push(String(e.message)+" @"+(e.filename||"")+":"+(e.lineno||"")));
window.addEventListener("unhandledrejection",(e)=>window.__errors.push("reject: "+String(e.reason&&e.reason.message||e.reason)));
</script>
<script src="/vendor/vue.global.prod.js"></script>
<script type="module">
import GrammarView from "/js/components/GrammarView.js";
const p = new URLSearchParams(location.search);
const app = Vue.createApp({
  components: { GrammarView },
  data: () => ({ topic: p.get("topic") || "", user: p.get("user") || "preview" }),
  template: '<grammar-view ref="gv" :user-id="user" :target-topic-id="topic" />',
});
app.config.errorHandler = (err) => window.__errors.push("vue: " + (err && err.message || err));
const vm = app.mount("#app");
setTimeout(() => {
  const g = vm.$refs.gv;
  if (p.get("pop") && g) g.spreadOpen = true;
}, 900);
setTimeout(() => {
  const w = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  const wide = [...document.querySelectorAll("body *")]
    .filter((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
    .slice(0, 6).map((el) => el.tagName + "." + (el.className || "")).join(" , ");
  const gv = vm.$refs.gv;
  const lec = gv && gv.selected && gv.selected.lecture;
  const lecInfo = " lec=" + JSON.stringify({
    loaded: !!(lec && lec.sectionsLoaded),
    total: lec ? lec.sectionsTotal : -1,
    secLen: lec && lec.sections ? lec.sections.length : -1,
    listLen: gv ? gv.lectureSectionsList.length : -1,
    status: gv ? gv.lectureStatus(gv.selectedId) : "",
    state: gv ? (gv.lectureState[gv.selectedId] || null) : null,
  });
  const probeText = "PROBE clientWidth=" + document.documentElement.clientWidth
    + " scrollWidth=" + w + " docs=" + document.querySelectorAll(".gr2-block").length
    + " blocks=" + document.querySelectorAll(".gr2-block").length + " lecSections=" + document.querySelectorAll(".gr2-lec").length + " options=" + document.querySelectorAll(".gr2-option").length + " navItems=" + document.querySelectorAll("[data-topic-id]").length
    + " tocLinks=" + document.querySelectorAll("[data-toc]").length
    + " openLec=" + [...document.querySelectorAll(".gr2-lec.open")].map((a) => a.id).join("|")
    + " tocOn=" + ([...document.querySelectorAll(".gr2-toc a.on")].map((a) => a.getAttribute("data-toc")).join("|") || "-")
    + " anchorIds=" + [...document.querySelectorAll("[data-anchor]")].map((n) => n.id).join("|")
    + " nearBand=" + [...document.querySelectorAll("[data-anchor]")].map((n) => [n.id, Math.round(n.getBoundingClientRect().top)]).filter((p) => p[1] > -300 && p[1] < 500).map((p) => p[0] + "@" + p[1]).join(",")
    + " active=" + (gv ? String(gv.activeAnchor) : "-")
    + " spreadBtn=" + document.querySelectorAll(".gr2-info").length
    + " popLen=" + ((document.querySelector(".gr2-pop") || {}).textContent || "").length
    + " scrollY=" + Math.round(window.scrollY)
    + " hash=" + location.hash
    + " anchor3=" + JSON.stringify((() => { const e = document.getElementById("lecture-3"); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), sc: Math.round(document.scrollingElement.scrollTop) }; })())
    + lecInfo + " errors=" + JSON.stringify(window.__errors).slice(0, 300)
    + (wide ? " overflow=[" + wide + "]" : " overflow=[]");
  document.getElementById("probe").textContent = probeText;
  document.title = probeText;
}, 2000);
</script>
</body></html>`;
fs.writeFileSync(path.join(SITE, "_preview.html"), previewHtml);

// 用 iframe 摘出窄屏模拟：iframe 内部就是真实的 375px 视口，父页同源直接读子页探针结果。
const frameHtml = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>frame</title>
<style>html,body{margin:0}iframe{border:0;display:block}</style></head><body>
<div id="probe" style="position:fixed;left:0;bottom:0;z-index:99;background:#111;color:#0f0;font:11px/1.4 monospace;max-width:100vw"></div>
<script>
const q = new URLSearchParams(location.search);
const w = Number(q.get("w") || 375);
const f = document.createElement("iframe");
f.style.width = w + "px";
f.style.height = "1400px";
f.src = "/_preview.html?topic=" + encodeURIComponent(q.get("topic") || "") + (q.get("pop") ? "&pop=1" : "") + (q.get("hash") ? "#" + q.get("hash") : "");
document.body.appendChild(f);
setTimeout(() => {
  const d = f.contentDocument;
  if (!d) { document.title = "PROBE frame: 子页未加载"; return; }
  const iw = d.documentElement.clientWidth;
  const sw = Math.max(d.documentElement.scrollWidth, d.body.scrollWidth);
  const wide = [...d.querySelectorAll("body *")]
    .filter((el) => el.getBoundingClientRect().right > iw + 1)
    .slice(0, 6).map((el) => el.tagName + "." + (el.className || "")).join(" , ");
  document.title = "PROBE frame=" + iw + " scrollWidth=" + sw + (wide ? " overflow=[" + wide + "]" : " overflow=[]") + " | " + d.title;
  document.getElementById("probe").textContent = document.title;
}, 3200);
<\/script>
</body></html>`;
fs.writeFileSync(path.join(SITE, "_frame.html"), frameHtml);

// ---------- 3) 静态服务 ----------
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  let file = path.join(SITE, url === "/" ? "_preview.html" : url);
  if (!file.startsWith(SITE)) { res.writeHead(403).end(); return; }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404).end("not found"); return; }
  if (NET) {
    netLog.set(url, Math.max(netLog.get(url) || 0, fs.statSync(file).size));
  }
  res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
const port = await new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));
const base = `http://127.0.0.1:${port}/_preview.html`;
const urlFor = (topic) => `${base}?topic=${encodeURIComponent(topic)}${POP ? "&pop=1" : ""}${HASH ? "#" + HASH : ""}`;

// ---------- 4) 截图 ----------
const PROFILE = path.join(WORK, "profile");
// 必须用异步 spawn：spawnSync 会阻塞事件循环，导致本进程内的静态服务无法响应请求而卡死。
function runChrome(extra, url) {
  return new Promise((resolve) => {
    const child = spawn(chrome, [
      "--headless=new", "--disable-gpu", "--hide-scrollbars",
      "--no-first-run", "--no-default-browser-check", "--disable-extensions",
      "--disable-background-networking", "--disable-sync", "--disable-features=Translate",
      "--user-data-dir=" + PROFILE,
      "--virtual-time-budget=8000",
      ...extra, url,
    ], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", () => {});
    const timer = setTimeout(() => { try { child.kill("SIGKILL"); } catch (_) {} }, 90000);
    child.on("close", () => { clearTimeout(timer); resolve(out); });
  });
}

const results = [];
for (const topic of TOPICS) {
  for (const w of WIDTHS) {
    const out = path.join(SHOTS, `${topic}-${w}.png`);
    if (fs.existsSync(out)) fs.rmSync(out);
    await runChrome([`--window-size=${w},${HEIGHT}`, `--screenshot=${out}`], urlFor(topic));
    const ok = fs.existsSync(out);
    results.push({ topic, width: w, shot: ok ? path.relative(ROOT, out) : "FAILED", size: ok ? fs.statSync(out).size : 0 });
  }
}
if (PROBE && FRAME) {
  // 窄屏模拟：在宽窗口里用 ${FRAME}px 的 iframe 跑探针
  for (const topic of TOPICS) {
    const url = `${base.replace("_preview.html", "_frame.html")}?topic=${encodeURIComponent(topic)}&w=${FRAME}${POP ? "&pop=1" : ""}${HASH ? "&hash=" + encodeURIComponent(HASH) : ""}`;
    const dom = await runChrome(["--window-size=1440,1400", "--dump-dom"], url);
    const m = dom.match(/<title>PROBE [^<]*<\/title>/) || dom.match(/id="probe">PROBE [^<]*/);
    console.log(`frame[${topic}@${FRAME}]: ${m ? m[0].replace(/<\/?title>|id="probe">/g, "").trim() : "无输出"}`);
  }
}
if (PROBE) {
  // 探针宽度取所有截图宽度去重（含最小宽度，最容易暴露横向溢出）
  const probeWidths = [...new Set(WIDTHS)].sort((a, b) => a - b);
  for (const topic of TOPICS) {
    for (const w of probeWidths) {
      const dom = await runChrome([`--window-size=${w},900`, "--dump-dom"], urlFor(topic));
      const m = dom.match(/<title>PROBE [^<]*<\/title>/) || dom.match(/id="probe">PROBE [^<]*/);
      console.log(`probe[${topic}@${w}]: ${m ? m[0].replace(/<\/?title>|id="probe">/g, "").trim() : "无输出"}`);
    }
  }
}
console.log(`chrome: ${chrome}`);
for (const r of results) console.log(`${r.shot === "FAILED" ? "✗" : "✓"} ${r.topic} @${r.width}px -> ${r.shot} (${r.size} B)`);
console.log(`输出目录：${path.relative(ROOT, SHOTS)}`);
if (NET) {
  const rows = [...netLog.entries()].filter(([u]) => /\.js$|\.css$/.test(u)).sort((a, b) => b[1] - a[1]);
  const total = rows.reduce((n, [, size]) => n + size, 0);
  const grammar = rows.filter(([u]) => u.startsWith("/js/grammar/")).reduce((n, [, size]) => n + size, 0);
  console.log("\n请求体积（首屏实际抓取）：");
  for (const [u, size] of rows) console.log("  " + String(size).padStart(7) + " B  " + (size / 1024).toFixed(1).padStart(7) + " KB  " + u);
  console.log("  合计 " + total + " B / " + (total / 1024).toFixed(1) + " KB；其中 /js/grammar/ " + grammar + " B / " + (grammar / 1024).toFixed(1) + " KB");
}
server.close();
