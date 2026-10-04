// scripts/e2e-grammar-entry.mjs —— 登录态下的「进入语法专题」端到端验证
// ---------------------------------------------------------------------------
// 用途：在真实 Go 服务 + 真实登录 Cookie 下，用 headless Chrome 走三条入口，
//       验证 P1 的导航改造在真实应用里成立（而不只是预览页里成立）：
//         S1 登录              POST /api/auth/login → /api/auth/me 200
//         S2 课程页入口        课程学习 → 有语法的模块 → 「语法」页签 → 「前往语法专题」
//         S3 智能学习台入口     智能学习台 → 语法专项推荐列表 → 进入语法专题
//         S4 深链刷新           #grammar/<topicId>/lecture-3 刷新后回到同一节并展开
// 用法：
//   node scripts/e2e-grammar-entry.mjs --base http://127.0.0.1:8099
//   node scripts/e2e-grammar-entry.mjs --user p4check --password P4check!2026 --shots tmp/e2e-shots
// 前置：先用 `go run ./cmd/server -addr 127.0.0.1:8099` 起服务（脚本不负责起服务）。
// 说明：默认账号不存在时自动注册；截图写入 --shots 目录。
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const argOf = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const BASE = argOf("base", "http://127.0.0.1:8099").replace(/\/$/, "");
const USER = argOf("user", "p4check");
const PASS = argOf("password", "P4check!2026");
const SHOTS_ARG = argOf("shots", "tmp/e2e-shots");
// --shots 既接受相对路径（相对仓库根）也接受绝对路径，避免 CI 传绝对路径时被重复拼接。
const SHOTS = path.isAbsolute(SHOTS_ARG) ? SHOTS_ARG : path.join(ROOT, SHOTS_ARG);
const SCAN_MAX = Number(argOf("scan", "96"));
const OUT = path.join(ROOT, argOf("out", "reports/e2e-grammar-entry-20260928.json"));
const PROFILE = path.join(ROOT, "tmp", "e2e-profile");
const WIDTH = Number(argOf("width", 1440));
const HEIGHT = Number(argOf("height", 1000));

const CHROME = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find((p) => p && fs.existsSync(p));
if (!CHROME) { console.error("找不到 Chrome/Edge"); process.exit(2); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- 1) 准备账号（注册或登录） ----------
async function http(pathname, opts = {}) {
  const res = await fetch(BASE + pathname, opts);
  let body = null;
  try { body = await res.json(); } catch (_) {}
  return { status: res.status, body };
}
const jsonPost = (p, data) => http(p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });

let account = "";
const reg = await jsonPost("/api/auth/register", { username: USER, password: PASS, displayName: "P4 端到端校验" });
if (reg.status === 200 || reg.status === 201) account = `注册 ${USER}`;
else {
  const login = await jsonPost("/api/auth/login", { username: USER, password: PASS });
  if (login.status !== 200) { console.error(`账号不可用：注册 ${reg.status} ${JSON.stringify(reg.body)}；登录 ${login.status} ${JSON.stringify(login.body)}`); process.exit(1); }
  account = `复用已有账号 ${USER}`;
}

// ---------- 2) 启 Chrome + CDP ----------
fs.mkdirSync(SHOTS, { recursive: true });
fs.rmSync(PROFILE, { recursive: true, force: true });   // 清掉上次的 profile，避免读到过期的 DevToolsActivePort
const child = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--remote-debugging-port=0", "--user-data-dir=" + PROFILE, "about:blank"], { stdio: ["ignore", "pipe", "ignore"] });
const portFile = path.join(PROFILE, "DevToolsActivePort");
for (let i = 0; i < 150 && !fs.existsSync(portFile); i += 1) await sleep(100);
if (!fs.existsSync(portFile)) { console.error("Chrome 未就绪"); child.kill(); process.exit(2); }
const cdpPort = Number(fs.readFileSync(portFile, "utf8").split("\n")[0]);

const targets = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json();
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0;
const pending = new Map();
const events = [];
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); return; }
  events.push(msg);
};
const send = (method, params = {}) => new Promise((res) => { seq += 1; pending.set(seq, res); ws.send(JSON.stringify({ id: seq, method, params })); });
const evaluate = async (expression, awaitPromise = false) => {
  const r = await send("Runtime.evaluate", { expression, awaitPromise, returnByValue: true, userGesture: true });
  if (r.result?.exceptionDetails) throw new Error("JS 异常: " + JSON.stringify(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails));
  return r.result?.result?.value;
};
const waitFor = async (expr, label, timeoutMs = 20000) => {
  const t0 = Date.now();
  for (;;) {
    if (await evaluate(`(() => { try { return !!(${expr}); } catch (e) { return false; } })()`)) return true;
    if (Date.now() - t0 > timeoutMs) throw new Error(`超时等待：${label}（${expr}）`);
    await sleep(250);
  }
};
const shot = async (name) => {
  const r = await send("Page.captureScreenshot", { format: "png" });
  if (r.result?.data) fs.writeFileSync(path.join(SHOTS, name + ".png"), Buffer.from(r.result.data, "base64"));
};
const goto = async (hash, waitExpr, label, timeoutMs = 20000) => {
  await send("Page.navigate", { url: BASE + "/index.html" + hash });
  if (waitExpr) await waitFor(waitExpr, label, timeoutMs);
};
const consoleErrors = () => events.filter((e) => e.method === "Runtime.exceptionThrown" || (e.method === "Runtime.consoleAPICalled" && e.params.type === "error")).length;

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok, detail }); console.log(`${ok ? "✓" : "✗"} ${name}：${detail}`); };
// ---------- S1 登录 ----------
await goto("", "window.location.hash || document.querySelector('#app')", "应用外壳");
const loginStatus = await evaluate(
  `fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:${JSON.stringify(USER)},password:${JSON.stringify(PASS)}})}).then(r=>r.status)`,
  true,
);
const me = await evaluate(`fetch('/api/auth/me').then(r=>r.status+':'+r.text()).then(t=>t)`, true);
check("S1 登录成功", loginStatus === 200, `POST /api/auth/login → ${loginStatus}；GET /api/auth/me → ${String(me).slice(0, 60)}`);

// ---------- S2 课程页 → 语法专题 ----------
await goto("#course", `document.querySelector(".module-item")`, "课程页模块列表");
const moduleCount = await evaluate(`document.querySelectorAll(".module-item").length`);
let courseEntry = null;
// 扫描所有模块（P3 起不再只扫前 24 个）：为了控制耗时，只对「命中定语从句的模块」与
// 第一个能对上的模块真正点「前往语法专题」并记录落点，其余模块只记录课程语法名。
const mappings = [];
for (let i = 0; i < moduleCount && i < SCAN_MAX; i += 1) {
  await evaluate(`document.querySelectorAll(".module-item")[${i}].click()`);
  await sleep(200);
  const hasTab = await evaluate(`[...document.querySelectorAll(".course-tabs button")].some(b=>b.textContent.trim()==="语法")`);
  if (!hasTab) continue;
  await evaluate(`[...document.querySelectorAll(".course-tabs button")].find(b=>b.textContent.trim()==="语法").click()`);
  await sleep(200);
  const jump = await evaluate(`!!document.querySelector(".grammar-jump")`);
  if (!jump) continue;
  const courseTopic = await evaluate(`((document.querySelector(".grammar-block h3")||{}).textContent||"").trim()`);
  if (i === 0) await shot("s2-course-grammar-tab");
  const mustJump = courseTopic.includes("定语从句") || !courseEntry;
  if (!mustJump) { mappings.push({ i, courseTopic, hash: "", h1: "", jumped: false }); continue; }
  await evaluate(`document.querySelector(".grammar-jump").click()`);
  await waitFor(`location.hash.indexOf("#grammar/")===0 && document.querySelector(".gr2-title-row h1")`, "跳转语法专题", 15000);
  const hash = await evaluate(`location.hash`);
  const h1 = await evaluate(`document.querySelector(".gr2-title-row h1").textContent.trim()`);
  const id = hash.replace("#grammar/", "");
  mappings.push({ i, courseTopic, hash, h1, jumped: true });
  if (/^g-[a-z0-9-]+$/.test(id) && h1 && !courseEntry) courseEntry = { i, courseTopic, hash, h1 };
  await goto("#course", `document.querySelector(".module-item")`, "回课程页");
}
if (!courseEntry && mappings.some((m) => m.jumped)) {
  const m = mappings.find((x) => x.jumped);
  courseEntry = { i: m.i, courseTopic: m.courseTopic, hash: m.hash, h1: m.h1 };
}
if (courseEntry) {
  const ok = /^#grammar\/g-[a-z0-9-]+$/.test(courseEntry.hash) && courseEntry.h1.length > 0;
  check("S2 课程页入口进入对应语法专题", ok, `课程语法「${courseEntry.courseTopic}」→ ${courseEntry.hash}，专题标题「${courseEntry.h1}」（IA 别名映射）`);
} else {
  check("S2 课程页入口命中同一专题", false, `扫描 ${Math.min(moduleCount, SCAN_MAX)} 个模块内未找到能对上的组合`);
}
// S2c：P3 验收——课程语法名「定语从句(that/which)」「定语从句(who/which)」必须落在新专题 g-attributive-clause。
// 说明：课程页只渲染仓库里真实存在的教材（当前工作区 chuzhong/真实教材 只有七年级上册，7 个版块），
//       九上 Module 10/11 不在课程页里，因此没有命中时改用页面内真实前端模块的 resolveTopicId 做数据层校验
//       —— 「前往语法专题」按钮走的就是这个函数。
const attrMappings = mappings.filter((m) => m.courseTopic.includes("定语从句"));
let attrOk = false;
let attrDetail = "";
if (attrMappings.length) {
  attrOk = attrMappings.every((m) => m.jumped && m.hash === "#grammar/g-attributive-clause" && m.h1 === "定语从句");
  attrDetail = attrMappings.map((m) => `课程语法「${m.courseTopic}」→ ${m.hash || "（未跳转）"}「${m.h1}」`).join("；");
} else {
  const resolved = await evaluate(
    `import('/js/grammar/index.js').then((m) => [m.resolveTopicId('定语从句(that/which)'), m.resolveTopicId('定语从句(who/which)')].join(','))`,
    true,
  );
  attrOk = resolved === "g-attributive-clause,g-attributive-clause";
  attrDetail = `课程页只有 ${mappings.length} 个版块（工作区真实教材仅七年级上册），改用页面内 resolveTopicId 校验：「定语从句(that/which)」「定语从句(who/which)」→ ${resolved}`;
}
check("S2c 定语从句课程语法名 → 新专题 g-attributive-clause", attrOk, attrDetail);
console.log(`   · 课程页扫描：模块总数 ${moduleCount}，有语法入口 ${mappings.length} 个，其中实际跳转校验 ${mappings.filter((m) => m.jumped).length} 个`);
if (courseEntry && courseEntry.hash) await goto(courseEntry.hash, `document.querySelector(".gr2-title-row h1")`, "回到首个命中专题");
await shot("s2-grammar-after-jump");

// ---------- S2b 课程页语法区：同名历史覆盖规则体检（只报告，不改文件） ----------
await goto("#course", `document.querySelector(".module-item")`, "课程页模块列表");
let leak = null;
for (let i = 0; i < 24 && !leak; i += 1) {
  await evaluate(`document.querySelectorAll(".module-item")[${i}].click()`);
  await sleep(200);
  const hasTab = await evaluate(`[...document.querySelectorAll(".course-tabs button")].some(b=>b.textContent.trim()==="语法")`);
  if (!hasTab) continue;
  await evaluate(`[...document.querySelectorAll(".course-tabs button")].find(b=>b.textContent.trim()==="语法").click()`);
  await sleep(250);
  const hasDetail = await evaluate(`!!document.querySelector(".grammar-detail")`);
  if (!hasDetail) continue;
  leak = await evaluate(`(() => {
    const cs = (el) => { if (!el) return null; const c = getComputedStyle(el); const r = el.getBoundingClientRect(); return { box: [Math.round(r.width), Math.round(r.height)], padding: c.padding, border: c.borderTopWidth + " " + c.borderTopStyle, radius: c.borderRadius, background: c.backgroundColor, shadow: c.boxShadow, display: c.display, fontSize: c.fontSize, color: c.color }; };
    return { detail: cs(document.querySelector(".grammar-detail")), ico: cs(document.querySelector(".ex-ico")), label: cs(document.querySelector(".grammar-label")), secDot: cs(document.querySelector(".sec-dot")) };
  })()`);
  await shot("s2b-course-grammar-pane");
}
check("S2b 课程页语法区渲染取样", !!leak, leak ? JSON.stringify(leak) : "未取到样本");


// ---------- S3 智能学习台 → 语法专题 ----------
await goto("#smart", `document.querySelector(".smart-grammar-list button")`, "智能学习台语法推荐", 25000);
const smartItemText = await evaluate(`document.querySelector(".smart-grammar-list button").textContent.replace(/\\s+/g," ").trim()`);
await shot("s3-smart-grammar-list");
await evaluate(`document.querySelector(".smart-grammar-list button").click()`);
let smartOk = false; let smartDetail = "";
try {
  await waitFor(`location.hash.indexOf("#grammar/")===0 && document.querySelector(".gr2-title-row h1")`, "智能学习台跳转语法", 15000);
  const hash = await evaluate(`location.hash`);
  const h1 = await evaluate(`document.querySelector(".gr2-title-row h1").textContent.trim()`);
  smartOk = hash.startsWith("#grammar/g-");
  smartDetail = `推荐项「${smartItemText.slice(0, 30)}」→ ${hash}，页面标题「${h1}」`;
} catch (e) { smartDetail = String(e.message); }
check("S3 智能学习台入口进入语法专题", smartOk, smartDetail);
await shot("s3-grammar-after-jump");

// ---------- S4 深链刷新回到同一节 ----------
await goto("#grammar/g-pronouns/lecture-3", `document.getElementById("lecture-3")`, "深链首屏");
await send("Page.reload", { ignoreCache: false });
await waitFor(`document.getElementById("lecture-3")`, "刷新后锚点仍在", 25000);
await sleep(1200);
const deep = await evaluate(`(() => {
  const el = document.getElementById("lecture-3");
  const lec = el && el.closest(".gr2-lec");
  const toc = document.querySelector(".gr2-toc a.on");
  return {
    hash: location.hash,
    exists: !!el,
    open: !!(lec && lec.classList.contains("open")),
    tocOn: toc ? toc.getAttribute("data-toc") : "",
    scrollTop: Math.round(document.scrollingElement.scrollTop),
    visible: el ? Math.round(el.getBoundingClientRect().top) : null,
    clientHeight: document.documentElement.clientHeight,
  };
})()`);
check(
  "S4 深链刷新回到同一节",
  deep.exists && deep.open && deep.tocOn === "lecture-3" && deep.visible !== null && deep.visible < deep.clientHeight,
  `hash=${deep.hash} 展开=${deep.open} TOC高亮=${deep.tocOn} scrollTop=${deep.scrollTop} 锚点视口位置=${deep.visible}/${deep.clientHeight}`,
);
await shot("s4-deeplink-lecture-3-refresh");

// ---------- 汇总 ----------
const jsErrors = consoleErrors();
check("S5 全流程无 JS 异常", jsErrors === 0, `Runtime.exceptionThrown/console.error 计数 = ${jsErrors}`);
const passed = results.filter((r) => r.ok).length;
console.log(`\n账号：${account}；服务：${BASE}；截图目录：${path.relative(ROOT, SHOTS)}`);
console.log(`结果：${passed}/${results.length} 通过`);
fs.mkdirSync(path.join(ROOT, "reports"), { recursive: true });
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ base: BASE, user: USER, account, width: WIDTH, modules: mappings.length, results }, null, 2));
ws.close();
child.kill();
process.exit(passed === results.length ? 0 : 1);
