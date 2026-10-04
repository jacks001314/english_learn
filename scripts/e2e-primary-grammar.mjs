// scripts/e2e-primary-grammar.mjs —— 小学基础语法知识卡端到端验证
// ---------------------------------------------------------------------------
// 用途：在真实 Go 服务 + 真实登录态下，用 headless Chrome 验证 grammar/primary.js
//       的知识卡确实进了导航、渲染正确，并且没有盖住同名的初中专题：
//         S1 登录
//         S2 深链 #grammar/p-be-verb：导航出现「小学基础」组（15 张卡）、状态为知识卡、
//            速查/要点/易错/记忆卡四块渲染，讲义与专项练习两块隐藏、无「开始练习」按钮
//         S3 点导航切卡：切到「现在进行时」知识卡（p-present-continuous），
//            面包屑分组为「小学基础」且正文是小学卡内容（be + ing）
//         S4 同名不串台：#grammar/g-there-be 仍是初中专题（句法组、有真题），
//            #grammar/p-there-be 是知识卡
//         S5 导航分组顺序：小学基础排在最前
//         S6 全流程无 JS 异常
// 用法：node scripts/e2e-primary-grammar.mjs --base http://127.0.0.1:8098
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const argOf = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const BASE = argOf("base", "http://127.0.0.1:8099").replace(/\/$/, "");
const USER = argOf("user", "p6check");
const PASS = argOf("password", "P6check!2026");
const SHOTS_ARG = argOf("shots", "tmp/e2e-primary-grammar");
// --shots 既接受相对路径（相对仓库根）也接受绝对路径，避免 CI 传绝对路径时被重复拼接。
const SHOTS = path.isAbsolute(SHOTS_ARG) ? SHOTS_ARG : path.join(ROOT, SHOTS_ARG);
const PROFILE = path.join(ROOT, "tmp", "e2e-primary-grammar-profile");
const OUT = path.join(ROOT, argOf("out", "reports/e2e-primary-grammar.json"));

const CHROME = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find((p) => p && fs.existsSync(p));
if (!CHROME) { console.error("找不到 Chrome/Edge"); process.exit(2); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function http(pathname, opts = {}) {
  const res = await fetch(BASE + pathname, opts);
  let body = null;
  try { body = await res.json(); } catch (_) {}
  return { status: res.status, body };
}
const jsonPost = (p, data) => http(p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });

let account = "复用账号";
const reg = await jsonPost("/api/auth/register", { username: USER, password: PASS, displayName: "知识卡端到端校验" });
if (reg.status === 200 || reg.status === 201) account = `注册 ${USER}`;
else {
  const login = await jsonPost("/api/auth/login", { username: USER, password: PASS });
  if (login.status !== 200) { console.error(`账号不可用：注册 ${reg.status}；登录 ${login.status}`); process.exit(1); }
}

fs.mkdirSync(SHOTS, { recursive: true });
fs.rmSync(PROFILE, { recursive: true, force: true });
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
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok, detail }); console.log(`${ok ? "✓" : "✗"} ${name}：${detail}`); };

await goto("", "document.querySelector('#app')", "应用外壳");
const loginStatus = await evaluate(`fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:${JSON.stringify(USER)},password:${JSON.stringify(PASS)}})}).then(r=>r.status)`, true);
check("S1 登录成功", loginStatus === 200, `POST /api/auth/login → ${loginStatus}（${account}）`);

// ---------- S2 知识卡深链 ----------
await goto("#grammar/p-be-verb", `document.querySelector(".gr2-title-row h1")`, "be 动词知识卡");
const groups = await evaluate(`[...document.querySelectorAll(".gr2-group > header span")].map(s=>s.textContent.trim())`);
const primaryCount = await evaluate(`(() => { const h=[...document.querySelectorAll(".gr2-group > header")].find(x=>x.textContent.includes("小学基础")); return h ? Number((h.querySelector("em")||{}).textContent) : -1; })()`);
check("S2 导航出现「小学基础」分组", groups.includes("小学基础"), `导航分组=${JSON.stringify(groups)}`);
check("S2 知识卡数量为 15", primaryCount === 15, `小学基础组条目数=${primaryCount}`);
check("S2 分组顺序：小学基础在最前", groups[0] === "小学基础", `第一个分组=${groups[0]}`);

const state = await evaluate(`(document.querySelector(".gr2-chip.is-state")||{}).textContent||""`);
check("S2 状态标记为知识卡", state.trim() === "知识卡", `状态=${state.trim()}`);
const metrics = await evaluate(`[...document.querySelectorAll(".gr2-metrics > div")].map(d=>d.querySelector("span").textContent.trim()+":"+d.querySelector("b").textContent.trim())`);
check("S2 指标区改为知识卡口径", metrics.join("|").includes("用法要点") && metrics.join("|").includes("记忆卡"), `指标=${JSON.stringify(metrics)}`);
const blocks = await evaluate(`["quick","points","pitfalls","memory","lecture","practice"].map(id=>id+":"+(document.getElementById(id)?1:0))`);
const blockMap = Object.fromEntries(blocks.map((b) => b.split(":")));
check("S2 速查/要点/易错/记忆卡四块渲染", blockMap.quick === "1" && blockMap.points === "1" && blockMap.pitfalls === "1" && blockMap.memory === "1", `块=${JSON.stringify(blockMap)}`);
check("S2 讲义与专项练习隐藏", blockMap.lecture === "0" && blockMap.practice === "0", `lecture=${blockMap.lecture} practice=${blockMap.practice}`);
const hasStartBtn = await evaluate(`[...document.querySelectorAll(".gr2-head-actions button")].some(b=>b.textContent.includes("开始练习"))`);
check("S2 无「开始练习」按钮", !hasStartBtn, `按钮存在=${hasStartBtn}`);
const forms = await evaluate(`[...document.querySelectorAll("#quick .gr2-form code")].map(c=>c.textContent.trim())`);
const goodBad = await evaluate(`({good:document.querySelectorAll("#points .good").length,bad:document.querySelectorAll("#points .bad").length})`);
const memory = await evaluate(`[...document.querySelectorAll("#memory .gr2-memory span")].map(s=>s.textContent.trim())`);
check("S2 速查卡与正误例句有内容", forms.length >= 3 && goodBad.good >= 3 && goodBad.bad >= 2, `公式=${forms.length} 好例=${goodBad.good} 错例=${goodBad.bad}`);
check("S2 记忆卡有内容", memory.length >= 1, `记忆卡=${JSON.stringify(memory)}`);
const toc = await evaluate(`[...document.querySelectorAll(".gr2-toc a")].map(a=>a.textContent.trim())`);
check("S2 目录不含讲义/专项练习", toc.length >= 3 && !toc.join("|").includes("专项练习") && !toc.join("|").includes("讲义"), `目录=${JSON.stringify(toc)}`);
await shot("s2-p-be-verb");

// ---------- S3 导航切卡 ----------
await evaluate(`[...document.querySelectorAll(".gr2-item")].find(b=>b.dataset.topicId==="p-present-continuous").click()`);
await waitFor(`location.hash === "#grammar/p-present-continuous" && document.querySelector(".gr2-title-row h1").textContent.trim()==="现在进行时"`, "切到现在进行时知识卡");
const card3 = await evaluate(`({h1:document.querySelector(".gr2-title-row h1").textContent.trim(),group:(document.querySelector(".gr2-crumb b")||{}).textContent||"",meta:(document.querySelector(".gr2-item.on .gr2-item-meta")||{}).textContent||"",body:document.querySelector(".gr2-detail").textContent})`);
check("S3 切卡后是小学知识卡", card3.h1 === "现在进行时" && card3.group === "小学基础", `标题=${card3.h1} 分组=${card3.group}`);
check("S3 卡片正文是小学内容（be + ing）", card3.body.includes("be + 动词 ing") || card3.body.includes("am / is / are + 动词 ing"), `nav 计数=${card3.meta.trim()}`);
await shot("s3-p-present-continuous");

// ---------- S4 同名不串台 ----------
await goto("#grammar/g-there-be", `document.querySelector(".gr2-title-row h1")`, "初中 There be 专题");
const middle = await evaluate(`({h1:document.querySelector(".gr2-title-row h1").textContent.trim(),group:(document.querySelector(".gr2-crumb b")||{}).textContent||"",hasPractice:!!document.getElementById("practice"),practice:(document.getElementById("practice")||{textContent:""}).textContent.trim().slice(0,40),state:(document.querySelector(".gr2-chip.is-state")||{}).textContent||""})`);
check("S4 g-there-be 仍是初中专题", middle.h1 === "There be 句型" && middle.group === "句法" && middle.hasPractice, `分组=${middle.group} 状态=${middle.state.trim()} 练习=${middle.practice}`);
await goto("#grammar/p-there-be", `document.querySelector(".gr2-title-row h1")`, "小学 There be 知识卡");
const card4 = await evaluate(`({group:(document.querySelector(".gr2-crumb b")||{}).textContent||"",hasPractice:!!document.getElementById("practice"),state:(document.querySelector(".gr2-chip.is-state")||{}).textContent||""})`);
check("S4 p-there-be 是小学知识卡", card4.group === "小学基础" && !card4.hasPractice && card4.state.trim() === "知识卡", `分组=${card4.group} 状态=${card4.state.trim()}`);

const errors = consoleErrors();
check("S5 全流程无 JS 异常", errors === 0, `exceptionThrown/console.error 计数 = ${errors}`);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ base: BASE, account, results, shots: SHOTS }, null, 2));
const passed = results.filter((r) => r.ok).length;
console.log(`\n结果：${passed}/${results.length} 通过`);
console.log(`截图目录：${SHOTS}`);
ws.close();
child.kill();
process.exit(passed === results.length ? 0 : 1);