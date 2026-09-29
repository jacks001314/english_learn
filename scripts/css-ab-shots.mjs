// scripts/css-ab-shots.mjs —— 同一环境下用两份样式表分别截图，供 css-pixel-diff.mjs 做像素级 A/B
// ---------------------------------------------------------------------------
// 用途：删/改 CSS 后证明"外观没变"（或量出变了多少）。刻意在同一台机器、同一轮里
//       交替用新旧两份 CSS 截图，避免"环境漂移"（窗口宽度变化、字体缓存不同）被误判成样式改动。
// 用法：
//   node scripts/css-ab-shots.mjs                                     # 默认 g-overview，1440/520
//   node scripts/css-ab-shots.mjs --old tmp/grammar.css.pre-prune.bak --new web/grammar.css \
//                                --topics g-nouns,g-prepositions --widths 1440,520 --height 1600
// 输出：tmp/css-ab/<topic>-<width>-{old,new}.png，并打印字节数；随后自行跑：
//   node scripts/css-pixel-diff.mjs tmp/css-ab/g-overview-1440-old.png tmp/css-ab/g-overview-1440-new.png
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const argOf = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const OLD = path.join(ROOT, argOf("old", "tmp/grammar.css.pre-prune.bak"));
const NEW = path.join(ROOT, argOf("new", "web/grammar.css"));
const TOPICS = argOf("topics", "g-overview").split(",");
const WIDTHS = argOf("widths", "1440,520").split(",").map(Number);
const HEIGHT = Number(argOf("height", "1600"));
const WORK = path.join(ROOT, "tmp", "css-ab");
const SITE = path.join(WORK, "site");

const CHROME = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find((p) => p && fs.existsSync(p));
if (!CHROME) { console.error("找不到 Chrome/Edge"); process.exit(2); }
for (const f of [OLD, NEW]) if (!fs.existsSync(f)) { console.error("找不到样式表：" + f); process.exit(2); }

// ---- 镜像 web/（去掉 import 上的 ?v=），并生成只挂 GrammarView 的预览页 ----
const CSS = ["style.css", "responsive.css", "platform-v2.css", "redesign.css", "smart-learning.css", "course.css", "adaptive-desktop.css", "grammar.css"];
const SKIP_DIRS = new Set(["audio"]);
const SKIP_EXT = new Set([".mp3", ".wav", ".m4a", ".jpg", ".jpeg", ".png", ".webp", ".mp4"]);
fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(SITE, { recursive: true });
(function mirror(dir, out) {
  fs.mkdirSync(out, { recursive: true });
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const from = path.join(dir, e.name);
    const to = path.join(out, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) mirror(from, to); continue; }
    if (SKIP_EXT.has(path.extname(e.name).toLowerCase())) continue;
    if (e.name.endsWith(".js")) fs.writeFileSync(to, fs.readFileSync(from, "utf8").replace(/(from\s*")(\.\.?\/[^"?]+)(?:\?[^"]*)?"/g, '$1$2"'));
    else fs.copyFileSync(from, to);
  }
}(path.join(ROOT, "web"), SITE));

fs.writeFileSync(path.join(SITE, "_ab.html"), `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>css ab</title>
${CSS.map((f) => `<link rel="stylesheet" href="/${f}">`).join("\n")}
</head><body><div id="app"></div>
<script src="/vendor/vue.global.prod.js"></script>
<script type="module">
import GrammarView from "/js/components/GrammarView.js";
const p = new URLSearchParams(location.search);
Vue.createApp({ components: { GrammarView }, data: () => ({ topic: p.get("topic") || "", user: "preview" }), template: '<grammar-view ref="gv" :user-id="user" :target-topic-id="topic" />' }).mount("#app");
</script></body></html>`);

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
  const f = path.join(SITE, u === "/" ? "/index.html" : u);
  if (!f.startsWith(SITE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end("nf"); return; }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  res.end(fs.readFileSync(f));
});
const port = await new Promise((r) => server.listen(0, "127.0.0.1", () => r(server.address().port)));

const run = (url, out, w) => new Promise((res) => {
  const c = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--user-data-dir=" + path.join(WORK, "profile"), "--virtual-time-budget=8000", "--window-size=" + w + "," + HEIGHT, "--screenshot=" + out, url], { stdio: ["ignore", "pipe", "ignore"] });
  c.on("close", () => res());
});

const cssPath = path.join(SITE, "grammar.css");
const newCss = fs.readFileSync(NEW, "utf8");
const oldCss = fs.readFileSync(OLD, "utf8");
for (const topic of TOPICS) {
  for (const w of WIDTHS) {
    const url = `http://127.0.0.1:${port}/_ab.html?topic=${encodeURIComponent(topic)}`;
    fs.writeFileSync(cssPath, newCss);
    await run(url, path.join(WORK, `${topic}-${w}-new.png`), w);
    fs.writeFileSync(cssPath, oldCss);
    await run(url, path.join(WORK, `${topic}-${w}-old.png`), w);
  }
}
fs.writeFileSync(cssPath, newCss);
server.close();
console.log(`对比图目录：${path.relative(ROOT, WORK)}`);
for (const topic of TOPICS) {
  for (const w of WIDTHS) {
    const a = path.join(WORK, `${topic}-${w}-old.png`);
    const b = path.join(WORK, `${topic}-${w}-new.png`);
    const sa = fs.statSync(a).size; const sb = fs.statSync(b).size;
    console.log(`  ${topic} @${w}px  old=${sa} B  new=${sb} B  ${sa === sb ? "（字节一致，仍建议跑像素对比）" : ""}`);
  }
}
console.log("下一步：node scripts/css-pixel-diff.mjs tmp/css-ab/<topic>-<w>-old.png tmp/css-ab/<topic>-<w>-new.png");