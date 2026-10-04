// scripts/e2e-report-flow.mjs —— 「学习日历 + 家长/教师只读报告」前端端到端测试
// ---------------------------------------------------------------------------
// 对应 plan.md「P1：多用户与学习目标」第 47 项（学习日历）与第 48 项
// （家长/教师只读报告：学习量、正确率、薄弱词、复习完成率）。
//
// 前置：先起服务（脚本不负责起服务）
//   go run ./cmd/server -addr 127.0.0.1:8099
// 用法：
//   node scripts/e2e-report-flow.mjs --base http://127.0.0.1:8099
//   node scripts/e2e-report-flow.mjs --base http://127.0.0.1:8099 --shots tmp/e2e-report
//   node scripts/e2e-report-flow.mjs --base http://www.gbw3bao.com --admin admin --admin-password '***'
//   node scripts/e2e-report-flow.mjs --base http://www.gbw3bao.com --require-admin   # 管理员登录失败即判失败
//
// 用例：
//   S1 注册并登录学生账号（页面内 fetch，Cookie 留在浏览器里）
//   S2 制造活动：一题答对、一题答错（为正确率与薄弱词准备数据）
//   S3 学生「学习报告」页出现学习日历（42 格）、正确率与复习完成率
//   S4 学生访问家长/教师报告接口被 403 拒绝
//   S5 切换到管理员（家长/教师）账号；首次登录若要求改密则自动改密（幂等）
//   S6 管理员打开「家长/教师只读报告」，选中该学生后指标、日历、薄弱词都正确
//   S7 全程无 JS 报错
// 退出码：全部通过 0，任一失败 1。
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const argOf = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const BASE = argOf("base", "http://127.0.0.1:8099").replace(/\/$/, "");
const SHOTS = path.resolve(ROOT, argOf("shots", "tmp/e2e-report"));
const WIDTH = Number(argOf("width", 1360));
const HEIGHT = Number(argOf("height", 1000));
const ACCOUNT = argOf("account", "e2e-report-" + Date.now().toString(36));
const PASSWORD = "Report!2026";
const ADMIN = argOf("admin", "admin");
const ADMIN_PASSWORD = argOf("admin-password", "Admin123!");
// 首次用初始密码登录的管理员会被要求改密，这里改成一个固定密码，保持下次可复现。
const ADMIN_PASSWORD_ROTATED = "Report!Admin2026";
// 线上没有管理员密码时（B 端账号由用户自己掌握），S5/S6 会降级为「跳过」；
// 本地/CI 用 --require-admin 把它变回硬失败，避免漏测。
const REQUIRE_ADMIN = args.includes("--require-admin");

const CHROME = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => p && fs.existsSync(p));
if (!CHROME) { console.error("找不到 Chrome/Edge，可用 CHROME_PATH 指定"); process.exit(2); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, detail) => { results.push({ name, ok, detail }); console.log(`${ok ? "OK  " : "FAIL"} ${name}：${detail}`); };

// ---------- 1) 起 headless Chrome 并连上 CDP ----------
fs.mkdirSync(SHOTS, { recursive: true });
const PROFILE = path.join(SHOTS, ".profile");
fs.rmSync(PROFILE, { recursive: true, force: true });
const child = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
  "--no-default-browser-check", "--disable-extensions", "--remote-debugging-port=0",
  `--user-data-dir=${PROFILE}`, `--window-size=${WIDTH},${HEIGHT}`, "about:blank",
], { stdio: "ignore" });

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
const shot = async (name) => {
  const r = await send("Page.captureScreenshot", { format: "png" });
  if (r.result?.data) fs.writeFileSync(path.join(SHOTS, name + ".png"), Buffer.from(r.result.data, "base64"));
};
const goto = async (hash, readyExpr, label, timeoutMs = 25000) => {
  await send("Page.navigate", { url: BASE + "/index.html" + hash });
  const t0 = Date.now();
  for (;;) {
    const ok = await evaluate("(() => { try { return !!(" + readyExpr + "); } catch (e) { return false; } })()");
    if (ok) return;
    if (Date.now() - t0 > timeoutMs) throw new Error("超时等待页面：" + label);
    await sleep(250);
  }
};
const inPage = (body) => evaluate("(async () => { " + body + " })()", true);
const waitFor = async (expr, label, timeoutMs = 20000) => {
  const t0 = Date.now();
  for (;;) {
    if (await evaluate("(() => { try { return !!(" + expr + "); } catch (e) { return false; } })()")) return;
    if (Date.now() - t0 > timeoutMs) throw new Error("超时等待：" + label);
    await sleep(200);
  }
};

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });

let studentId = "";

try {
  // ---------- S1 注册并登录 ----------
  await goto("", "document.querySelector('#app')", "应用外壳");
  const auth = await inPage(
    'const post = (p, data) => fetch(p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });' +
    "const reg = await post(\"/api/auth/register\", { username: " + JSON.stringify(ACCOUNT) + ", password: " + JSON.stringify(PASSWORD) + ', displayName: "E2E 报告学生" });' +
    'if (reg.status !== 200) return { status: reg.status };' +
    "const body = await reg.json();" +
    "return { status: 200, id: (body.user || {}).id, role: (body.user || {}).role };"
  );
  studentId = (auth && auth.id) || "";
  check("S1 注册并登录", auth?.status === 200 && auth?.role === "student" && !!studentId, "账号 " + ACCOUNT + " → " + JSON.stringify(auth));

  // ---------- S2 制造活动：一题答对、一题答错 ----------
  const seeded = await inPage(
    'const res = await fetch("/api/meaning-quiz?level=primary&page=1&size=12&type=en-zh", { credentials: "include" });' +
    "const set = await res.json();" +
    "const items = (set.items || []).slice(0, 2);" +
    "const out = [];" +
    "for (let i = 0; i < items.length; i += 1) {" +
    "  const it = items[i];" +
    '  const answer = i === 0 ? it.answer : "e2e-故意答错";' +
    '  const r = await fetch("/api/quiz/answer", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },' +
    '    body: JSON.stringify({ level: "primary", wordId: it.word.id, type: "en-zh", answer }) });' +
    "  const body = await r.json();" +
    "  out.push({ id: it.word.id, word: it.word.word, correct: body.correct === true, status: r.status });" +
    "}" +
    "return out;"
  );
  const seeds = Array.isArray(seeded) ? seeded : [];
  check("S2 制造一题答对一题答错",
    seeds.length === 2 && seeds[0]?.correct === true && seeds[1]?.correct === false,
    JSON.stringify(seeds));

  // ---------- S3 学生自己的学习报告：日历 + 正确率 + 复习完成率 ----------
  await goto("#report", "document.querySelector('.report-calendar .calendar-cell')", "学习报告页");
  await waitFor("document.querySelectorAll('.report-calendar .calendar-cell').length > 0", "日历格子出现");
  const studentView = await evaluate(`(() => {
    const cells = document.querySelectorAll('.report-calendar .calendar-cell');
    const active = document.querySelectorAll('.report-calendar .calendar-cell.active');
    const blocks = [...document.querySelectorAll('.report-streak > div')].map(d => d.textContent.replace(/\\s+/g, ' ').trim());
    return {
      cells: cells.length,
      active: active.length,
      hasAccuracy: blocks.some(t => t.includes('正确率')),
      hasReview: blocks.some(t => t.includes('复习完成率')),
      accuracy50: blocks.some(t => t.includes('正确率') && t.includes('50%')),
    };
  })()`);
  check("S3 学习报告含学习日历（42 格）", studentView.cells === 42 && studentView.active >= 1, JSON.stringify(studentView));
  check("S3 正确率与复习完成率均已展示", studentView.hasAccuracy && studentView.hasReview && studentView.accuracy50, JSON.stringify(studentView));
  await shot("s3-student-report");

  // ---------- S4 学生访问家长/教师报告被拒 ----------
  const denied = await inPage(
    'const r = await fetch("/api/admin/learners/" + encodeURIComponent(' + JSON.stringify(studentId) + ') + "/report", { credentials: "include" });' +
    "return { status: r.status };"
  );
  check("S4 学生访问家长报告被 403 拒绝", denied?.status === 403, JSON.stringify(denied));

  // ---------- S5 切换到管理员（家长/教师）账号 ----------
  const adminLogin = await inPage(
    'const post = (p, data) => fetch(p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });' +
    'await fetch("/api/auth/logout", { method: "POST", credentials: "include" });' +
    "const attempt = async (password) => {" +
    "  const r = await post(\"/api/auth/login\", { username: " + JSON.stringify(ADMIN) + ", password });" +
    "  if (r.status !== 200) return { status: r.status, mustChange: false };" +
    "  const body = await r.json();" +
    "  return { status: 200, mustChange: (body.user || {}).mustChangePassword === true };" +
    "};" +
    "let res = await attempt(" + JSON.stringify(ADMIN_PASSWORD) + ");" +
    "if (res.status !== 200) res = await attempt(" + JSON.stringify(ADMIN_PASSWORD_ROTATED) + ");" +
    'if (res.status !== 200) return { step: "login", status: res.status };' +
    "if (res.mustChange) {" +
    '  const ch = await fetch("/api/auth/change-password", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: ' + JSON.stringify(ADMIN_PASSWORD) + ", newPassword: " + JSON.stringify(ADMIN_PASSWORD_ROTATED) + " }) });" +
    '  if (ch.status !== 200) return { step: "change-password", status: ch.status };' +
    "}" +
    'return { step: "done", status: 200, rotated: res.mustChange };'
  );
  const adminReady = adminLogin?.step === "done";
  check("S5 家长/教师（管理员）会话就绪", adminReady || !REQUIRE_ADMIN,
    adminReady ? JSON.stringify(adminLogin) : "跳过（缺少管理员密码，可用 --admin-password 提供）：" + JSON.stringify(adminLogin));

  // ---------- S6 家长/教师只读报告页 ----------
  if (!adminReady) {
    console.log("跳过 S6：没有可用的管理员会话。");
    throw { skipGuardian: true };
  }
  await goto("#reports", "document.querySelector('.learner-report-controls select')", "家长/教师报告页");
  // 学习者是异步拉取的，等目标学生出现在下拉框后再取值，
  // 否则高速机器上会偶发取到空选项（历史上出现过 no-option 抖动）。
  await waitFor(
    "[...document.querySelector('.learner-report-controls select').options].some(o => o.value === " + JSON.stringify(studentId) + ") ", 
    "学习者下拉框加载目标学生"
  );
  const picked = await evaluate(
    "(() => { const s = document.querySelector('.learner-report-controls select');" +
    "if (!s) return 'no-select';" +
    "const opt = [...s.options].find(o => o.value === " + JSON.stringify(studentId) + ");" +
    "if (!opt) return 'no-option:' + [...s.options].map(o => o.value).join(',');" +
    's.value = ' + JSON.stringify(studentId) + '; s.dispatchEvent(new Event("change", { bubbles: true })); return "selected"; })()'
  );
  check("S6 报告页可选中目标学习者", picked === "selected", String(picked));
  await waitFor(
    "[...document.querySelectorAll('.learner-report-metrics > div')].some(d => d.textContent.includes('50%')) && document.querySelectorAll('.learner-report .calendar-cell').length === 42",
    "只读报告渲染为目标学习者"
  );
  const guardian = await evaluate(`(() => {
    const metrics = [...document.querySelectorAll('.learner-report-metrics > div')].map(d => d.textContent.replace(/\\s+/g, ' ').trim());
    const rows = [...document.querySelectorAll('.learner-report table tbody tr')].map(tr => tr.textContent.replace(/\\s+/g, ' ').trim());
    return {
      metrics,
      cells: document.querySelectorAll('.learner-report .calendar-cell').length,
      active: document.querySelectorAll('.learner-report .calendar-cell.active').length,
      rows,
      hasAccuracy: metrics.some(t => t.includes('正确率')),
      accuracy50: metrics.some(t => t.includes('正确率') && t.includes('50%')),
      hasReview: metrics.some(t => t.includes('复习完成率')),
      hasSeen: metrics.some(t => t.includes('学过的词') && /\\b2\\b/.test(t)),
      hasMastered: metrics.some(t => t.includes('已掌握') && /\\b1\\b/.test(t)),
    };
  })()`);
  check("S6 只读报告指标齐备", guardian.hasAccuracy && guardian.hasReview && guardian.hasSeen && guardian.hasMastered, JSON.stringify(guardian.metrics));
  check("S6 正确率 50%", guardian.accuracy50, JSON.stringify(guardian.metrics));
  check("S6 只读报告含学习日历", guardian.cells === 42 && guardian.active >= 1, "格子 " + guardian.cells + " · 活跃 " + guardian.active);
  check("S6 薄弱词表列出答错的词", guardian.rows.some((r) => r.includes(seeds[1].word)), JSON.stringify(guardian.rows));

  // 接口口径复核，避免只看界面。
  const apiReport = await inPage(
    'const r = await fetch("/api/admin/learners/" + encodeURIComponent(' + JSON.stringify(studentId) + ') + "/report?days=42", { credentials: "include" });' +
    "const body = await r.json();" +
    "return { status: r.status, accuracy: body.accuracy, correct: body.correct, wrong: body.wrong, weakest: (body.weakest || []).length, days: ((body.calendar || {}).days || []).length, activeDays: (body.calendar || {}).activeDays };"
  );
  check("S6 报告接口口径一致",
    apiReport?.status === 200 && apiReport.correct === 1 && apiReport.wrong === 1 && apiReport.accuracy === 50 && apiReport.days === 42 && apiReport.weakest === 1,
    JSON.stringify(apiReport));
  await shot("s6-guardian-report");

  // ---------- S7 无 JS 报错 ----------
  const consoleErrors = events.filter((e) => e.method === "Runtime.exceptionThrown" || (e.method === "Runtime.consoleAPICalled" && e.params.type === "error"));
  check("S7 页面无 JS 报错", consoleErrors.length === 0, consoleErrors.length ? JSON.stringify(consoleErrors.slice(0, 2)) : "0 个异常");
} catch (err) {
  if (err && err.skipGuardian) {
    // 已在 S5 记录跳过原因，这里不再算失败。
  } else {
    check("流程执行", false, String(err && err.message ? err.message : err));
  }
} finally {
  const failed = results.filter((r) => !r.ok);
  console.log("");
  console.log("==> 学习日历 / 家长报告端到端：" + (results.length - failed.length) + " 通过 / " + failed.length + " 失败");
  console.log("    截图目录：" + SHOTS);
  try { ws.close(); } catch (_) {}
  child.kill();
  await sleep(300);
  process.exit(failed.length ? 1 : 0);
}
