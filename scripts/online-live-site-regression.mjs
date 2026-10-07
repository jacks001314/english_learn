#!/usr/bin/env node
// 线上（公网）全站回归：SPA 全部路由渲染 + 0 条 JS 报错 + 无横向溢出 + 静态资源完整性
// ---------------------------------------------------------------------------
// 与 scripts/online-live-agent-acceptance.mjs 的分工：
//   那个只打「助教」相关断言（L*），覆盖的是本轮改造涉及的面；
//   这个扫**全站路由**（含与助教无关的页面），回答「部署是整树替换，其它页面有没有被打回归」。
// 用法：
//   node scripts/online-live-site-regression.mjs
//   node scripts/online-live-site-regression.mjs --base http://www.gbw3bao.com --headed
// 退出码：0 全绿 / 1 有失败 / 2 线上不可达
// 报告：docs/verify-reports/report-live-site-regression.json
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const BASE = opt("--base", "http://www.gbw3bao.com").replace(/\/$/, "");
const CDP_PORT = Number(opt("--cdp-port", 9455));
const HEADED = flag("--headed");
const OUT_DIR = path.join(ROOT, ".tmp", "site-regression");
const SHOT_DIR = path.join(ROOT, "docs", "images");
const REPORT = path.join(ROOT, "docs", "verify-reports", "report-live-site-regression.json");

// marker = 「这个视图真的渲染出来了」的最短证据（取自各组件模板根节点类名）
const ROUTES = [
  { view: "home", label: "学习首页", marker: ".desktop-home" },
  { view: "smart", label: "智能学习台", marker: ".smart-studio" },
  { view: "learn", label: "单词学习", marker: ".learn-view" },
  { view: "meaning-en-zh", label: "看词选义", marker: ".meaning-view" },
  { view: "meaning-zh-en", label: "看义选词", marker: ".meaning-view" },
  { view: "meaning-listen", label: "听音选义", marker: ".meaning-view" },
  { view: "categories", label: "分类词库", marker: ".view" },
  { view: "course", label: "课程学习", marker: ".course-page" },
  { view: "grammar", label: "语法专题", marker: ".grammar-page" },
  { view: "phonetics", label: "国际音标", marker: ".phon-page" },
  { view: "reading", label: "英语阅读", marker: ".reading-view" },
  { view: "exams", label: "考试练习", marker: ".exam-view" },
  { view: "tongbu", label: "同步训练", marker: ".tongbu-page" },
  { view: "quiz", label: "单词测验", marker: ".quiz-view" },
  { view: "review", label: "今日复习", marker: ".view" },
  { view: "homework", label: "我的作业", marker: ".homework-page" },
  { view: "report", label: "学习报告", marker: ".report-view" },
  { view: "mistakes", label: "错题本", marker: ".mistakes-view" },
  { view: "settings", label: "学习设置", marker: ".view" },
  { view: "security", label: "账号安全", marker: ".view" },
  { view: "drill", label: "变式练习", marker: ".drill-view" },
];
// 管理端路由：普通学习者访问时应被 main.js 优雅重定向到 home（不是报错、不是白屏）
const ADMIN_ROUTES = ["content", "admin", "workbench", "exam-workbench", "agent-admin", "factory", "homework-admin", "reports"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha1 = (buf) => crypto.createHash("sha1").update(buf).digest("hex");
const checks = [];
const check = (id, ok, detail = "") => {
  checks.push({ id, ok: Boolean(ok), detail: String(detail) });
  console.log(`  [${ok ? "PASS" : "FAIL"}] ${id}${detail ? " — " + detail : ""}`);
};

function findChrome() {
  const cands = [process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome", "/usr/bin/chromium"].filter(Boolean);
  for (const c of cands) if (existsSync(c)) return c;
  throw new Error("找不到 Chrome，设置 CHROME_PATH 可指定");
}

const children = [];
function launch(cmd, args, opts = {}) {
  const child = spawn(cmd, args, { cwd: ROOT, ...opts });
  children.push(child);
  return child;
}
process.on("exit", () => { for (const c of children) { try { c.kill(); } catch {} } });

class CDP {
  constructor(ws) {
    this.ws = ws; this.nextId = 0; this.pending = new Map(); this.listeners = [];
    ws.addEventListener("message", (e) => {
      let m; try { m = JSON.parse(e.data); } catch { return; }
      if (m.id && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id); this.pending.delete(m.id);
        if (m.error) reject(new Error(m.method + ": " + JSON.stringify(m.error))); else resolve(m.result);
        return;
      }
      for (const l of this.listeners) l(m);
    });
  }
  onMessage(l) { this.listeners.push(l); }
  send(method, params = {}, sessionId) {
    const id = ++this.nextId; const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(new Error("CDP timeout: " + method)); } }, 120000);
    });
  }
}

async function main() {
  await fs.promises.mkdir(OUT_DIR, { recursive: true });
  await fs.promises.mkdir(SHOT_DIR, { recursive: true });
  const report = { startedAt: new Date().toISOString(), base: BASE, checks, routes: [], adminRoutes: [], staticAssets: [], consoleErrors: [], shots: {} };

  console.log(`==> 公网全站回归 · ${BASE}\n--- A. 静态资源完整性（HTTP 层）---`);
  let indexHtml = "";
  try {
    const r = await fetch(BASE + "/", { redirect: "follow" });
    indexHtml = await r.text();
    check("S1 线上可达 + 应用外壳", r.ok && /id="app"/.test(indexHtml) && /js\/main\.js/.test(indexHtml),
      `HTTP ${r.status} / ${Buffer.byteLength(indexHtml)} 字节`);
    const h = await fetch(BASE + "/api/health");
    check("S2 /api/health", h.ok && (await h.json().catch(() => ({}))).status === "ok", `HTTP ${h.status}`);
  } catch (e) {
    console.log("线上不可达：" + e.message);
    return 2;
  }

  // index.html 里引用的本地 CSS / JS 全部要 200 且非空（整树部署最容易漏样式表）
  const refs = [];
  for (const m of indexHtml.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)) refs.push(m[1]);
  for (const m of indexHtml.matchAll(/<script[^>]+src="([^"]+)"/g)) refs.push(m[1]);
  const uniq = [...new Set(refs.filter((u) => u.startsWith("/")))];
  let badAssets = 0;
  for (const u of uniq) {
    let ok = false, size = 0, status = 0;
    try {
      const r = await fetch(BASE + u, { cache: "no-store" });
      status = r.status; const buf = Buffer.from(await r.arrayBuffer()); size = buf.length; ok = r.ok && size > 0;
    } catch (e) { status = "ERR " + e.message; }
    if (!ok) badAssets += 1;
    report.staticAssets.push({ url: u, status, size, ok });
  }
  check("S3 index.html 引用的本地 CSS/JS 全部可用", badAssets === 0,
    badAssets ? `${badAssets}/${uniq.length} 不可用：` + report.staticAssets.filter((a) => !a.ok).map((a) => a.url).join(", ") : `${uniq.length}/${uniq.length} 全部 200 且非空`);

  // 兜底闸门是否真的上线（内容级确认，独立于 SHA1 比对）
  let guardOnline = false, guardSize = 0;
  try {
    const r = await fetch(BASE + "/js/learningContext.js", { cache: "no-store" });
    const body = await r.text(); guardSize = Buffer.byteLength(body);
    guardOnline = /looksLikeCardJson/.test(body) && /没把讲解整理好/.test(body);
  } catch {}
  check("S4 线上 learningContext.js 含「漏 card 兜底」闸门", guardOnline, `looksLikeCardJson 命中=${guardOnline} / ${guardSize} 字节`);

  // 学习报告页「空数据整页崩」的修复是否真的上线（内容级确认，独立于 SHA1 比对）
  let rvFixed = false, rvSize = 0, rvStatus = 0;
  try {
    const r = await fetch(BASE + "/js/components/ReportView.js", { cache: "no-store" });
    rvStatus = r.status; const body = await r.text(); rvSize = Buffer.byteLength(body);
    rvFixed = /weakItems/.test(body) && /Array\.isArray\(this\.report && this\.report\.weakest\)/.test(body);
  } catch {}
  check("S4b 线上 ReportView.js 含「空数组兜底」修复", rvFixed, `HTTP ${rvStatus} / ${rvSize} 字节 / 命中=${rvFixed}`);

  console.log("--- B. 全站路由渲染（headless Chrome + CDP）---");
  const profile = path.join(OUT_DIR, "profile");
  await fs.promises.rm(profile, { recursive: true, force: true });
  await fs.promises.mkdir(profile, { recursive: true });
  const args = [`--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profile}`, "--no-first-run",
    "--no-default-browser-check", "--disable-extensions", "--mute-audio", "--window-size=1440,960", "about:blank"];
  if (!HEADED) args.unshift("--headless=new", "--disable-gpu", "--hide-scrollbars");
  launch(findChrome(), args, { stdio: ["ignore", "ignore", "ignore"] });

  let ws = null;
  for (let i = 0; i < 100 && !ws; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (res.ok) { const info = await res.json(); ws = new WebSocket(info.webSocketDebuggerUrl); await new Promise((ok, no) => { ws.addEventListener("open", ok, { once: true }); ws.addEventListener("error", no, { once: true }); }); }
    } catch { await sleep(300); }
  }
  if (!ws) { check("S5 Chrome 调试端口", false, "连不上 CDP"); return finish(report, 1); }
  const cdp = new CDP(ws);
  cdp.onMessage((m) => {
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") report.consoleErrors.push({ type: "console", text: (m.params.args || []).map((a) => a.value || a.description || "").join(" ").slice(0, 300) });
    if (m.method === "Runtime.exceptionThrown") report.consoleErrors.push({ type: "exception", text: String(m.params.exceptionDetails?.exception?.description || "").slice(0, 300) });
  });
  const t = await cdp.send("Target.createTarget", { url: "about:blank" });
  const sid = (await cdp.send("Target.attachToTarget", { targetId: t.targetId, flatten: true })).sessionId;
  await cdp.send("Page.enable", {}, sid);
  await cdp.send("Runtime.enable", {}, sid);
  const ev = async (expr, awaitPromise = false) => {
    const r = await cdp.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise }, sid);
    if (r.exceptionDetails) throw new Error("evaluate: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    return r.result.value;
  };
  const evJSON = (body) => ev(`JSON.stringify((() => { ${body} })())`).then((v) => (v ? JSON.parse(v) : null));
  const waitFor = async (expr, label, timeoutMs = 30000) => {
    const end = Date.now() + timeoutMs;
    while (Date.now() < end) { try { if (await ev(expr)) return true; } catch {} await sleep(250); }
    throw new Error("等待超时：" + label);
  };
  const shot = async (name) => {
    const r = await cdp.send("Page.captureScreenshot", { format: "png" }, sid);
    await fs.promises.writeFile(path.join(SHOT_DIR, name), Buffer.from(r.data, "base64"));
    report.shots[name] = "docs/images/" + name;
    console.log("    截图：docs/images/" + name);
  };
  // 只改 hash 不会重载 SPA（router 监听 popstate），所以每次加一个变化的时间戳查询串强制整页重载
  const gotoView = async (view) => {
    await cdp.send("Page.navigate", { url: `${BASE}/?r=${Date.now()}#${view}` }, sid);
  };

  try {
    await cdp.send("Page.navigate", { url: BASE + "/" }, sid);
    await waitFor("!!document.querySelector('#app')", "#app 应用外壳");
    const user = "site-" + Date.now().toString(36);
    const reg = await ev(`(async () => {
      const post = (p, d) => fetch(p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
      const r = await post("/api/auth/register", { username: ${JSON.stringify(user)}, password: "SiteCheck123!", displayName: "全站回归" });
      if (r.status === 200) return "register:200";
      const l = await post("/api/auth/login", { username: ${JSON.stringify(user)}, password: "SiteCheck123!" });
      return "login:" + l.status;
    })()`, true);
    report.account = user;
    check("S5 线上注册/登录可用", String(reg).endsWith(":200"), user + " → " + reg);

    for (const r of ROUTES) {
      const before = report.consoleErrors.length;
      const t0 = Date.now();
      await gotoView(r.view);
      let rendered = true;
      try { await waitFor("!!document.querySelector('#app') && document.querySelector('#app').children.length > 0", "app 渲染 " + r.view); }
      catch { rendered = false; }
      await sleep(900);
      let info = null;
      try {
        info = await evJSON(`
          const app = document.querySelector('#app');
          const boot = document.getElementById('boot-error');
          const bootShown = !!boot && getComputedStyle(boot).display !== 'none';
          const marker = !!document.querySelector(${JSON.stringify(r.marker)});
          const visible = Array.from(app.querySelectorAll('*')).filter((e) => e.getBoundingClientRect().height > 8).length;
          const de = document.documentElement;
          return { bootShown, marker, visible, overflowX: de.scrollWidth - de.clientWidth > 2,
            scrollW: de.scrollWidth, clientW: de.clientWidth,
            text: (app.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 120),
            view: (location.hash || '').replace(/^#\\/?/, '').split('/')[0] };`);
      } catch (e) { info = { error: e.message }; }
      const errs = report.consoleErrors.length - before;
      const row = { route: r.view, label: r.label, rendered, errs, ms: Date.now() - t0, ...info };
      report.routes.push(row);
      const pass = rendered && info && !info.error && !info.bootShown && info.marker === true
        && info.visible > 3 && (info.text || "").length > 8 && errs === 0 && !info.overflowX;
      check(`R ${r.view}（${r.label}）`, pass,
        JSON.stringify({ rendered, errs, marker: info?.marker, visible: info?.visible, overflowX: info?.overflowX, hashView: info?.view, text: (info?.text || "").slice(0, 40) }));
      if (["home", "mistakes", "tongbu"].includes(r.view)) await shot(`site-regression-${r.view}.png`);
    }

    console.log("--- C. 管理端路由的优雅回落（学习者身份）---");
    for (const view of ADMIN_ROUTES) {
      const before = report.consoleErrors.length;
      await gotoView(view);
      let rendered = true;
      try { await waitFor("!!document.querySelector('#app') && document.querySelector('#app').children.length > 0", "app 渲染 " + view); }
      catch { rendered = false; }
      await sleep(700);
      let info = null;
      try {
        info = await evJSON(`
          const app = document.querySelector('#app');
          const boot = document.getElementById('boot-error');
          return { bootShown: !!boot && getComputedStyle(boot).display !== 'none',
            landed: !!document.querySelector('.desktop-home'), visible: Array.from(app.querySelectorAll('*')).filter((e) => e.getBoundingClientRect().height > 8).length };`);
      } catch (e) { info = { error: e.message }; }
      const errs = report.consoleErrors.length - before;
      const row = { route: view, rendered, errs, ...info };
      report.adminRoutes.push(row);
      check(`R ${view}（管理端 · 应回落首页）`, rendered && info && !info.error && !info.bootShown && info.landed === true && errs === 0,
        JSON.stringify({ rendered, errs, landed: info?.landed, bootShown: info?.bootShown }));
    }

    check("S6 全站回归全程 0 条 JS 报错", report.consoleErrors.length === 0,
      report.consoleErrors.length ? report.consoleErrors.slice(0, 3).map((e) => e.text).join(" | ") : "0 条");

    report.finishedAt = new Date().toISOString();
    report.passed = checks.filter((c) => c.ok).length;
    report.failed = checks.filter((c) => !c.ok).length;
    return finish(report, report.failed ? 1 : 0);
  } catch (e) {
    report.error = String(e && e.stack || e);
    check("S-异常", false, String(e && e.message || e));
    report.finishedAt = new Date().toISOString();
    report.passed = checks.filter((c) => c.ok).length;
    report.failed = checks.filter((c) => !c.ok).length;
    return finish(report, 1);
  }
}

async function finish(report, code) {
  if (report.passed === undefined) { report.passed = checks.filter((c) => c.ok).length; report.failed = checks.filter((c) => !c.ok).length; }
  await fs.promises.writeFile(REPORT, JSON.stringify(report, null, 2), "utf8");
  console.log(`\n==> 全站回归：${report.passed} 通过 / ${report.failed} 失败`);
  console.log("报告：" + path.relative(ROOT, REPORT));
  return code;
}

const exitCode = await main();
for (const c of children) { try { c.kill(); } catch {} }
process.exit(exitCode);