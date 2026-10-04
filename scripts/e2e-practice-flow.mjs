// scripts/e2e-practice-flow.mjs —— 「练习来源 + 答对自动下一题」前端核心流程端到端测试
// ---------------------------------------------------------------------------
// 对应 plan.md「P2：工程质量与交付」第 1 项里的「前端核心流程测试」。
// 与 internal/learning/http_integration_test.go（HTTP 接口集成测试）互补：
// 那个测服务端契约，这个在真实浏览器里测前端流程是否真的跑通。
//
// 前置：先起服务（脚本不负责起服务）
//   go run ./cmd/server -addr 127.0.0.1:8099
// 用法：
//   node scripts/e2e-practice-flow.mjs --base http://127.0.0.1:8099
//   node scripts/e2e-practice-flow.mjs --base http://127.0.0.1:8099 --shots tmp/e2e-practice
//   node scripts/e2e-practice-flow.mjs --base http://www.gbw3bao.com    # 也可以直接打线上
//
// 用例：
//   S1 注册并登录（页面内 fetch，Cookie 留在浏览器里）
//   S2 打开「看词选义」，练习来源下拉选项正确，基线计数 N / N
//   S3 通过判分接口制造 2 道错题 → 选「我的错题」→ 计数变成 2，且题目确实来自错词
//   S4 点对正确答案后**不点「下一题」**，题号自动从 1 / 2 前进到 2 / 2（答对自动下一题）
//   S5 订正错题后错题本清空（前端流程与服务端状态一致）
// 退出码：全部通过 0，任一失败 1。
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const argOf = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const BASE = argOf("base", "http://127.0.0.1:8099").replace(/\/$/, "");
const SHOTS = path.resolve(ROOT, argOf("shots", "tmp/e2e-practice"));
const WIDTH = Number(argOf("width", 1280));
const HEIGHT = Number(argOf("height", 900));
const ACCOUNT = argOf("account", "e2e-practice-" + Date.now().toString(36));
const PASSWORD = "Practice!2026";

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

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });

// ---------- 2) 页面状态读取器（解析放在 Node 侧，页面里不写正则） ----------
const PRACTICE = "#meaning-en-zh";
const SELECT = 'select[aria-label="练习来源"]';

async function readCounter() {
  const text = await evaluate('(document.querySelector(".meaning-heading strong") || {}).textContent || ""');
  const m = /可练习\s*(\d+)\s*\/\s*(\d+)/.exec(String(text));
  return { text: String(text).trim(), total: m ? Number(m[1]) : -1, scope: m ? Number(m[2]) : -1 };
}
async function readQuestion() {
  const text = await evaluate('(document.querySelector(".meaning-counter") || {}).textContent || ""');
  const m = /第\s*(\d+)\s*\/\s*(\d+)\s*题/.exec(String(text));
  return { text: String(text).trim(), position: m ? Number(m[1]) : -1, total: m ? Number(m[2]) : -1 };
}
async function waitCounterTotal(want, timeoutMs = 25000) {
  const t0 = Date.now();
  for (;;) {
    const c = await readCounter();
    if (c.total === want) return c;
    if (Date.now() - t0 > timeoutMs) throw new Error("超时等待可练习计数变成 " + want + "，当前：" + c.text);
    await sleep(250);
  }
}
async function waitQuestionPosition(want, timeoutMs = 10000) {
  const t0 = Date.now();
  for (;;) {
    const q = await readQuestion();
    if (q.position === want) return q;
    if (Date.now() - t0 > timeoutMs) throw new Error("超时等待题号变成第 " + want + " 题，当前：" + q.text);
    await sleep(150);
  }
}
const readPrompt = () => evaluate('(document.querySelector("h2.meaning-prompt") || {}).textContent || ""');
const selectSource = (value) => evaluate(
  '(() => { const s = document.querySelector(' + JSON.stringify(SELECT) + "); s.value = " + JSON.stringify(value) + '; s.dispatchEvent(new Event("change", { bubbles: true })); return s.value; })()'
);

try {
  // ---------- S1 注册并登录 ----------
  await goto("", "document.querySelector('#app')", "应用外壳");
  const auth = await inPage(
    'const post = (p, data) => fetch(p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });' +
    "const reg = await post(\"/api/auth/register\", { username: " + JSON.stringify(ACCOUNT) + ", password: " + JSON.stringify(PASSWORD) + ', displayName: "E2E 练习流程" });' +
    'if (reg.status === 200) return "register:" + reg.status;' +
    "const login = await post(\"/api/auth/login\", { username: " + JSON.stringify(ACCOUNT) + ", password: " + JSON.stringify(PASSWORD) + " });" +
    'return "login:" + login.status;'
  );
  check("S1 注册并登录", String(auth).endsWith(":200"), "账号 " + ACCOUNT + " → " + auth);

  // ---------- S2 打开练习页并检查来源下拉 ----------
  await goto(PRACTICE, "document.querySelector(" + JSON.stringify(SELECT) + ")", "练习来源下拉框");
  const options = await evaluate("[...document.querySelector(" + JSON.stringify(SELECT) + ").options].map(o => [o.value, o.textContent.trim()])");
  const wantOptions = [["", "全部单词"], ["mistakes", "我的错题"], ["unmastered", "学过但没掌握"]];
  check("S2 练习来源选项", JSON.stringify(options) === JSON.stringify(wantOptions), "实际 " + JSON.stringify(options));
  const baseline = await readCounter();
  check("S2 基线计数", baseline.total > 0 && baseline.total === baseline.scope, "全部单词 → " + baseline.text);

  // ---------- S3 制造错题 → 选「我的错题」 ----------
  const seeded = await inPage(
    'const res = await fetch("/api/words?level=primary&page=1", { credentials: "include" });' +
    "const page = await res.json();" +
    "const picked = (page.items || []).slice(0, 2).map(w => ({ id: w.id, word: w.word }));" +
    "const out = [];" +
    "for (const w of picked) {" +
    '  const r = await fetch("/api/quiz/answer", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },' +
    '    body: JSON.stringify({ level: "primary", wordId: w.id, type: "en-zh", answer: "e2e-故意答错" }) });' +
    "  const body = await r.json();" +
    "  out.push({ id: w.id, word: w.word, correct: body.correct === true, status: r.status });" +
    "}" +
    "return out;"
  );
  const seeds = Array.isArray(seeded) ? seeded : [];
  check("S3 制造 2 道错题", seeds.length === 2 && seeds.every(w => w.correct === false && w.status === 200), JSON.stringify(seeds));

  await goto(PRACTICE, "document.querySelector(" + JSON.stringify(SELECT) + ")", "重新进入练习页");
  await selectSource("mistakes");
  const filtered = await waitCounterTotal(2);
  check("S3 我的错题计数", filtered.total === 2, "筛选后 → " + filtered.text);
  const shown = String(await readPrompt()).trim();
  check("S3 出的题目来自错词", seeds.some(w => w.word === shown), "第 1 题是「" + shown + "」，错词集合 " + JSON.stringify(seeds.map(w => w.word)));
  await shot("s3-source-mistakes");

  // ---------- S4 答对自动下一题 ----------
  const answer = await inPage(
    'const res = await fetch("/api/meaning-quiz?level=all&page=1&size=12&type=en-zh&source=mistakes", { credentials: "include" });' +
    "const set = await res.json();" +
    "const item = (set.items || []).find(it => ((it.word || {}).word) === " + JSON.stringify(shown) + ");" +
    'return item ? item.answer : "";'
  );
  const before = await readQuestion();
  const clicked = await evaluate(
    "(() => { const target = [...document.querySelectorAll('.meaning-options button')].find(b => (b.querySelector('span') || {}).textContent.trim() === " + JSON.stringify(String(answer)) + ");" +
    'if (!target) return "not-found"; target.click(); return "clicked"; })()'
  );
  check("S4 点到正确答案", clicked === "clicked" && before.total === 2, "题号 " + before.text + "，正确答案「" + answer + "」");
  const after = await waitQuestionPosition(2, 10000);   // 不点「下一题」，等它自己走
  const feedback = await evaluate('(document.querySelector(".meaning-feedback b") || {}).textContent || ""');
  check("S4 答对自动下一题（没点下一题按钮）", after.position === 2 && after.total === 2, "题号 " + before.text + " → " + after.text + "，反馈「" + feedback + "」");
  await shot("s4-auto-next");

  // ---------- S5 订正后错题清空 ----------
  const resolved = await inPage(
    "const out = [];" +
    "for (const w of " + JSON.stringify(seeds.map(w => w.id)) + ") {" +
    '  const r = await fetch("/api/mistakes/" + encodeURIComponent(w) + "/resolve?level=primary", { method: "POST", credentials: "include" });' +
    "  out.push(r.status);" +
    "}" +
    'const page = await (await fetch("/api/mistakes?level=all", { credentials: "include" })).json();' +
    "return { statuses: out, total: page.total };"
  );
  check("S5 订正后错题清空", Array.isArray(resolved?.statuses) && resolved.statuses.every(s => s === 200) && resolved.total === 0, JSON.stringify(resolved));

  const consoleErrors = events.filter(e => e.method === "Runtime.exceptionThrown" || (e.method === "Runtime.consoleAPICalled" && e.params.type === "error"));
  check("S5 页面无 JS 报错", consoleErrors.length === 0, consoleErrors.length ? JSON.stringify(consoleErrors.slice(0, 2)) : "0 个异常");
} catch (err) {
  check("流程执行", false, String(err && err.message ? err.message : err));
} finally {
  const failed = results.filter(r => !r.ok);
  console.log("");
  console.log("==> 练习流程端到端：" + (results.length - failed.length) + " 通过 / " + failed.length + " 失败");
  console.log("    截图目录：" + SHOTS);
  try { ws.close(); } catch (_) {}
  child.kill();
  await sleep(300);
  process.exit(failed.length ? 1 : 0);
}
