#!/usr/bin/env node
// 线上（公网）助教验收：部署一致性 + 真站 UI 断言
// ---------------------------------------------------------------------------
// 对应 docs/online-verify/README.md 的「线上实测」约定（每轮交付都要线上验一遍），
// 与 scripts/online-agent-ui-e2e.mjs 的区别：那个自己 build + 起本地服务端（本机真栈），
// 这个**不碰服务端**，直接打公网 http://www.gbw3bao.com（部署后的真站）。
//
// 用法：
//   node scripts/online-live-agent-acceptance.mjs
//   node scripts/online-live-agent-acceptance.mjs --base http://www.gbw3bao.com --headed
// 退出码：0 全绿 / 1 有失败 / 2 线上不可达
// 报告：docs/verify-reports/report-live-agent-acceptance.json
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
const CDP_PORT = Number(opt("--cdp-port", 9444));
const HEADED = flag("--headed");
const OUT_DIR = path.join(ROOT, ".tmp", "live-acceptance");
const SHOT_DIR = path.join(ROOT, "docs", "images");
const REPORT = path.join(ROOT, "docs", "verify-reports", "report-live-agent-acceptance.json");

// 部署一致性抽查清单（必须覆盖本轮所有改动过的、会被浏览器加载的文件）
const FILES = [
  "web/index.html", "web/agent.css", "web/grammar.css", "web/tongbu.css",
  "web/js/main.js", "web/js/learningContext.js", "web/js/agentSpeech.js", "web/js/speech.js",
  "web/js/components/AgentAssistant.js", "web/js/components/AgentTeachingCard.js",
  "web/js/components/MeaningPracticeView.js", "web/js/components/QuizView.js",
  "web/js/components/ReadingView.js", "web/js/components/DrillView.js",
  "web/js/components/ExamView.js", "web/js/components/HomeworkView.js",
  "web/js/components/TongbuView.js", "web/js/components/CourseView.js",
  "web/js/components/MistakesView.js", "web/js/components/GrammarView.js",
  "web/js/components/SmartLearningView.js",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha1 = (buf) => crypto.createHash("sha1").update(buf).digest("hex");
const checks = [];
// 断言 id 自带一句人话标签（例如「L5 浮动面板零遮挡」），所以签名是 (id, ok, detail)。
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
  const report = { startedAt: new Date().toISOString(), base: BASE, checks, deployment: [], consoleErrors: [], shots: {} };

  console.log(`==> 公网助教验收 · ${BASE}\n--- A. 部署一致性 ---`);
  let indexHtml = "";
  try {
    const r = await fetch(BASE + "/", { redirect: "follow" });
    indexHtml = await r.text();
    check("L0 线上可达", r.ok, `HTTP ${r.status} / ${Buffer.byteLength(indexHtml)} 字节`);
    const h = await fetch(BASE + "/api/health");
    check("L0 /api/health", h.ok && (await h.json().catch(() => ({}))).status === "ok", `HTTP ${h.status}`);
  } catch (e) {
    console.log("线上不可达：" + e.message);
    return 2;
  }

  for (const rel of FILES) {
    const local = sha1(fs.readFileSync(path.join(ROOT, rel)));
    let online = "";
    try {
      const r = await fetch(`${BASE}/${rel.replace(/^web\//, "")}?accept=${Date.now()}`, { cache: "no-store" });
      online = r.ok ? sha1(Buffer.from(await r.arrayBuffer())) : "HTTP " + r.status;
    } catch (e) { online = "ERR " + e.message; }
    report.deployment.push({ file: rel, local, online, match: local === online });
  }
  const bad = report.deployment.filter((d) => !d.match);
  check("L1 部署一致性（本地 SHA1 = 线上 SHA1）", bad.length === 0,
    bad.length ? `不一致 ${bad.length}/${FILES.length}：` + bad.map((b) => b.file).join(", ") : `${FILES.length}/${FILES.length} 全部一致`);

  console.log("--- B. 真站 UI 断言（headless Chrome + CDP）---");
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
  if (!ws) { check("L2 Chrome 调试端口", false, "连不上 CDP"); return finish(report, 1); }
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
  const evJSON = (body, awaitPromise = false) =>
    (awaitPromise
      ? ev(`(async () => JSON.stringify(await (async () => { ${body} })()))()`, true)
      : ev(`JSON.stringify((() => { ${body} })())`)).then((v) => (v ? JSON.parse(v) : null));
  const waitFor = async (expr, label, timeoutMs = 45000) => {
    const end = Date.now() + timeoutMs;
    while (Date.now() < end) { try { if (await ev(expr)) return true; } catch {} await sleep(300); }
    throw new Error("等待超时：" + label);
  };
  // 打开助教面板：fab 点击 + 等面板出现。**单次点击 + 单次等待在公网会偶发超时** ——
  // 组件 mounted 里要先等 /api/agent/status 才知道自己该不该出现（`AgentAssistant.js`），
  // 点击可能正好落在 fab 还没渲染/还没启用的那一瞬。所以这里「先判存在、再点、再等」循环重试；
  // 先判存在也顺带保证不会把已经打开的面板点关（fab 是 toggle）。
  const openPanel = async (label, timeoutMs = 25000) => {
    const end = Date.now() + timeoutMs;
    while (Date.now() < end) {
      const state = await ev(`(() => {
        if (document.querySelector('.agent-panel')) return 'open';
        const f = document.querySelector('.agent-fab');
        if (!f || getComputedStyle(f).display === 'none') return 'nofab';
        f.click(); return 'clicked'; })()`).catch(() => 'err');
      if (state === 'open') return true;
      await sleep(400);
    }
    throw new Error("等待超时：" + label);
  };
  const shot = async (name) => {
    const r = await cdp.send("Page.captureScreenshot", { format: "png" }, sid);
    const file = path.join(SHOT_DIR, name);
    await fs.promises.writeFile(file, Buffer.from(r.data, "base64"));
    report.shots[name] = "docs/images/" + name;
    console.log("    截图：docs/images/" + name);
  };

  try {
    await cdp.send("Page.navigate", { url: BASE + "/" }, sid);
    await waitFor("!!document.querySelector('#app')", "#app 应用外壳");
    const user = "accept-" + Date.now().toString(36);
    const reg = await ev(`(async () => {
      const post = (p, d) => fetch(p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
      const r = await post("/api/auth/register", { username: ${JSON.stringify(user)}, password: "Accept123!", displayName: "线上验收" });
      if (r.status === 200) return "register:200";
      const l = await post("/api/auth/login", { username: ${JSON.stringify(user)}, password: "Accept123!" });
      return "login:" + l.status;
    })()`, true);
    report.account = user;
    check("L2 线上注册/登录可用", String(reg).endsWith(":200"), user + " → " + reg);

    // 看词选义
    await cdp.send("Page.navigate", { url: BASE + "/#meaning-en-zh" }, sid);
    await waitFor("!!document.querySelector('#app .meaning-view, #app .view')", "看词选义视图");
    await waitFor("!!document.querySelector('.agent-fab')", "助教入口按钮");
    await ev("document.querySelector('.agent-fab').click()");
    await waitFor("!!document.querySelector('.agent-panel')", "助教面板展开");

    const panel = await evJSON(`
      const root = document.querySelector('.agent-assistant');
      const p = document.querySelector('.agent-panel');
      const r = p.getBoundingClientRect();
      return { cls: root.className, floatClass: root.classList.contains('agent-float'),
        position: getComputedStyle(p).position, width: Math.round(r.width),
        right: Math.round(innerWidth - r.right), bodyOpen: document.body.classList.contains('agent-open') };`);
    report.panel = panel;
    check("L3 面板为浮动形态（fixed / ≈420px / 贴右缘）",
      (panel.floatClass === true || panel.cls.includes("agent-float")) && panel.position === "fixed" && panel.width >= 360 && panel.width <= 560 && panel.right <= 60,
      JSON.stringify(panel));
    check("L4 面板打开时页面让位", panel.bodyOpen, "body.agent-open=" + panel.bodyOpen);

    const occlusion = await evJSON(`
      const panel = document.querySelector('.agent-panel').getBoundingClientRect();
      const hit = (sel) => {
        const el = Array.from(document.querySelectorAll(sel)).find((e) => e.getBoundingClientRect().height > 8);
        if (!el) return { sel, found: false, covered: 0, sampled: 0 };
        el.scrollIntoView({ block: 'center', behavior: 'instant' });
        const r = el.getBoundingClientRect();
        let covered = 0, sampled = 0;
        for (let i = 1; i <= 3; i += 1) for (let j = 1; j <= 3; j += 1) {
          const x = Math.round(r.left + (r.width * i) / 4), y = Math.round(r.top + (r.height * j) / 4);
          if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
          sampled += 1;
          if (x >= panel.left && x <= panel.right && y >= panel.top && y <= panel.bottom) covered += 1;
        }
        return { sel, found: true, covered, sampled, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] };
      };
      return ['.meaning-options', '.meaning-prompt', '.meaning-heading'].map(hit);`);
    report.occlusion = occlusion;
    const sampled = occlusion.reduce((n, o) => n + o.sampled, 0);
    const covered = occlusion.reduce((n, o) => n + o.covered, 0);
    check("L5 浮动面板零遮挡（且真的量到了元素）", sampled > 0 && covered === 0,
      occlusion.map((o) => `${o.sel}:${o.covered}/${o.sampled}`).join(" ") + ` total=${covered}/${sampled}`);

    // 新账号首次进 #meaning-en-zh 要异步拉题目集（约 4590 条），先等上下文真的发布再读胶囊，
    // 否则读到的是「还没打开练习页」空态（本轮第一次就踩到过这个竞态）。
    try {
      await waitFor(`(() => { const s = globalThis.__lingoBloomLearningStore; return !!(s && s.context && s.context.scene === 'meaning' && s.context.wordId); })()`, "词义上下文（scene=meaning）已发布", 30000);
    } catch {}
    await sleep(400);
    const capsule = await ev(`(document.querySelector('.agent-statechip-text') || {}).textContent || ""`);
    report.capsule = String(capsule).trim();
    const cap = String(capsule).trim();
    check("L6 状态胶囊显示场景/进度", cap.includes("词义练习") && cap.includes(" / ") && cap.includes("题"), `胶囊文案="${cap}"`);
    await shot("agent-live-acceptance-panel.png");

    // 问一句（真模型）
    // 用与 scripts/online-agent-ui-e2e.mjs 相同的方式输入并发送：写 value + 派发 input，再点发送键。
    // （headless 页面没有真实焦点，CDP Input.insertText 会落空——本轮踩过一次，界面只显示了开场白。）
    const setInput = (selector, value) => `
      (() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return false;
        const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(value)});
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      })()`;
    const beforeCount = await ev(`document.querySelectorAll('.agent-card, .agent-markdown').length`);
    const typed = await ev(setInput(".agent-panel footer textarea, .agent-panel textarea", "讲讲这道题"));
    await sleep(250);
    const sent = await ev(`(() => { const b = document.querySelector('.agent-panel footer button'); if (!b) return false; b.click(); return true; })()`);
    check("L6b 面板能输入并发送问题", typed === true && sent === true, `typed=${typed} sent=${sent}`);
    let answered = false;
    try {
      await waitFor(`document.querySelectorAll('.agent-card, .agent-markdown').length > ${beforeCount} && !document.querySelector('.agent-streambar')`, "助教新回答渲染完成", 180000);
      answered = true;
    } catch {}
    const answer = await evJSON(`
      return { cards: document.querySelectorAll('.agent-card, agent-teaching-card').length,
        words: document.querySelectorAll('.agent-word').length,
        markdown: document.querySelectorAll('.agent-markdown').length,
        cards: document.querySelectorAll('.agent-card, agent-teaching-card').length,
        headline: (() => { const c = document.querySelectorAll('.agent-card-headline'); return c.length ? c[c.length - 1].textContent : ''; })(),
        text: (() => { const t = document.querySelectorAll('.agent-markdown'); return t.length ? (t[t.length - 1].textContent || '').slice(0, 260) : ''; })(),
        chips: document.querySelectorAll('.agent-receipt-chip').length,
        jsonLeak: ['"headline"', '"verdict"', '"points"', '"kind":'].some((k) => document.body.innerText.includes(k)) };`);
    report.answer = answer;
    check("L7 真模型回答渲染成教学卡片", answered && answer.cards > 0, JSON.stringify(answer));
    check("L8 卡片里的英文可点读（agent-word）", answer.words > 0, "agent-word=" + answer.words);
    // 注意：这是「缺失型」断言 —— 界面上什么都没有时 jsonLeak 天然为 false。所以必须同时要求
    // 「真的渲染出了回答」，否则这条会在助教没答出来时静默通过（和 §31 的 V1 是同一类问题）。
    check("L9 没有 JSON 泄漏到界面", answered === true && (answer.cards > 0 || String(answer.text || "").length > 0) && answer.jsonLeak === false,
      "answered=" + answered + " cards=" + answer.cards + " text=" + String(answer.text || "").length + " jsonLeak=" + answer.jsonLeak);
    check("L10 助教已读回执 chips", answer.chips > 0, "chips=" + answer.chips);

    // L16：助教已读回执可展开，露出「助教实际读到的快照原文」——这是投诉里「感知」那一条的核心证据
    // （学生要能核对助教到底看到了什么，而不是只能相信它）。
    const receiptBefore = await evJSON(`
      const head = document.querySelector('.agent-receipt-head');
      return { found: !!head, expanded: head ? head.getAttribute('aria-expanded') : null,
        textNodes: document.querySelectorAll('.agent-receipt-text').length };`);
    const receiptClicked = await ev(`(() => { const h = document.querySelector('.agent-receipt-head'); if (!h) return false; h.click(); return true; })()`);
    await sleep(400);
    const receiptAfter = await evJSON(`
      const head = document.querySelector('.agent-receipt-head');
      const pre = document.querySelector('.agent-receipt-text');
      return { expanded: head ? head.getAttribute('aria-expanded') : null,
        textNodes: document.querySelectorAll('.agent-receipt-text').length,
        text: pre ? (pre.textContent || '').slice(0, 160) : '' };`);
    report.receipt = { clicked: receiptClicked, before: receiptBefore, after: receiptAfter };
    check("L16 助教已读回执可展开（露出快照原文）",
      receiptClicked === true && receiptAfter.expanded === 'true' && receiptAfter.textNodes > 0 && String(receiptAfter.text).trim().length > 0,
      JSON.stringify(report.receipt));

    // 阅读页选词浮条（P0-3）——沿用 scripts/online-agent-ui-e2e.mjs 里已验证过的划词方式：
    // 先滚进视口等滚动停稳，再建 Range，然后向 .article-body 派发 mouseup。
    await cdp.send("Page.navigate", { url: BASE + "/#reading" }, sid);
    await waitFor("!!document.querySelector('#app .reading-view, #app .article-body')", "阅读视图");
    try { await waitFor("!!document.querySelector('.article-body .reading-paragraph')", "阅读理解正文渲染", 20000); } catch { }
    await ev(`(() => { const p = document.querySelector('.article-body .reading-paragraph'); if (!p) return false; p.scrollIntoView({ block: 'center', behavior: 'instant' }); return true; })()`);
    await sleep(900);
    const pickWordInReading = () => ev(`(() => {
      const para = document.querySelector('.article-body .reading-paragraph');
      if (!para) return '';
      const target = para.querySelector('.english-text') || para;
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      let node = null, found = '';
      while (walker.nextNode()) {
        const t = String(walker.currentNode.textContent || '');
        const m = t.match(/[A-Za-z][A-Za-z']{2,}/);
        if (m) { node = walker.currentNode; found = m[0]; break; }
      }
      if (!node) return '';
      const whole = String(node.textContent || '');
      const start = whole.indexOf(found);
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, start + found.length);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      const body = document.querySelector('.article-body');
      const box = body.getBoundingClientRect();
      body.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: box.left + 30, clientY: box.top + 30 }));
      return found;
    })()`);
    const picked = await pickWordInReading();
    let barProbe = { bar: false, buttons: [] };
    try {
      await waitFor("!!document.querySelector('.reading-select-bar')", "选词浮条出现", 12000);
      barProbe = await evJSON(`
        const bar = document.querySelector('.reading-select-bar');
        if (!bar) return { bar: false, buttons: [] };
        const r = bar.getBoundingClientRect();
        return { bar: true, buttons: [...bar.querySelectorAll('button')].map((b) => (b.textContent || '').trim()),
          rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
          inViewport: r.top >= 0 && r.left >= 0 && r.width > 0 };`);
    } catch { /* 没等到就按实际结果判 */ }
    report.reading = { picked, ...barProbe };
    check("L11 阅读页选词浮条：朗读 / 讲解 / 入册", picked !== "" && barProbe.bar === true && barProbe.buttons.includes("讲解") && barProbe.buttons.includes("入册"),
      `选中=${JSON.stringify(picked)} 按钮=[${(barProbe.buttons || []).join("/")}] rect=${barProbe.rect ? barProbe.rect.join(",") : "-"}`);
    await shot("agent-live-acceptance-reading.png");

    // L11b：浮条「入册」——把选中的词加进今日复习（确定性动作，不调模型）。
    const reviewClicked = await ev(`(() => { const b = [...document.querySelectorAll('.reading-select-bar button')].find((x) => (x.textContent || '').trim() === '入册'); if (!b) return false; b.click(); return true; })()`);
    let reviewToast = "";
    try {
      await waitFor("!!document.querySelector('.reading-toast')", "入册提示（L11b）", 20000);
      reviewToast = String(await ev('(document.querySelector(".reading-toast") || {}).textContent || ""')).trim();
    } catch {}
    report.readingReview = { clicked: reviewClicked, toast: reviewToast };
    check("L11b 阅读浮条「入册」→ 加入今日复习并给出提示（公网）",
      reviewClicked === true && reviewToast.length > 0, JSON.stringify(report.readingReview));
    if (reviewToast.length > 0) await shot("agent-live-acceptance-reading-review.png");

    // L11c：浮条「讲解」→ 该段落就地展开助教卡片（计划 P0-3 的另一半）。
    const picked2 = await pickWordInReading();
    try { await waitFor("!!document.querySelector('.reading-select-bar')", "选词浮条（L11c）", 12000); } catch {}
    const explainClicked = await ev(`(() => { const b = [...document.querySelectorAll('.reading-select-bar button')].find((x) => (x.textContent || '').trim() === '讲解'); if (!b) return false; b.click(); return true; })()`);
    try {
      await waitFor("(!!document.querySelector('.reading-inline-teach agent-teaching-card, .reading-inline-teach .agent-card') || !!document.querySelector('.reading-inline-teach .agent-inline-error'))", "阅读就地讲解卡（L11c）", 120000);
    } catch {}
    await sleep(500);
    const readingInline = await evJSON(`
      const sec = document.querySelector('.reading-inline-teach');
      const card = sec ? sec.querySelector('agent-teaching-card, .agent-card') : null;
      const para = sec ? sec.closest('article') : null;
      const pEl = para ? para.querySelector('.reading-paragraph') : null;
      const r = sec ? sec.getBoundingClientRect() : null;
      const pr = pEl ? pEl.getBoundingClientRect() : null;
      const rr = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.left + scrollX), Math.round(b.top + scrollY), Math.round(b.width), Math.round(b.height)]; };
      return { hasSection: !!sec, hasCard: !!card, words: card ? card.querySelectorAll('.agent-word').length : 0,
        headline: card ? ((card.querySelector('.agent-card-headline') || {}).textContent || '').trim().slice(0, 50) : '',
        belowParagraph: !!(sec && pEl && r.top >= pr.top - 2), jsonLeak: ['"headline"', '"verdict"', '"points"', '"kind":'].some((k) => document.body.innerText.includes(k)),
        secViewport: r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] : null,
        secDoc: rr(sec), cardDoc: rr(card), pageScrollY: Math.round(scrollY), innerH: innerHeight,
        bodyScrollTop: (() => { const b = document.querySelector('.article-body'); return b ? Math.round(b.scrollTop) : -1; })() };`);
    readingInline.picked = picked2;
    readingInline.clicked = explainClicked;
    report.readingInline = readingInline;
    check("L11c 阅读浮条「讲解」→ 段落下方就地展开讲解卡（公网）",
      explainClicked === true && readingInline.hasCard === true && readingInline.words > 0 && readingInline.jsonLeak === false,
      JSON.stringify(report.readingInline).slice(0, 420));
    if (readingInline.hasCard) {
      // 取景：阅读正文自己是一个滚动容器（redesign.css: .reading-paper{overflow-y:auto}），
      // 而卡片（本页实测 700–800px 高）比这个容器还高，直接 scrollIntoView 会被夹住。
      // 所以直接写容器 scrollTop，把卡片顶部对齐到正文区顶部，再截视口图。
      await ev(`(() => {
        const sec = document.querySelector('.reading-inline-teach');
        const paper = document.querySelector('.reading-paper');
        if (!sec) return false;
        if (paper) {
          const off = sec.getBoundingClientRect().top - paper.getBoundingClientRect().top + paper.scrollTop;
          paper.scrollTop = Math.max(0, off - 10);
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
        return true;
      })()`);
      await sleep(600);
      readingInline.afterFrame = await evJSON(`
        const sec = document.querySelector('.reading-inline-teach');
        const paper = document.querySelector('.reading-paper');
        const b = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
        return { sec: b(sec), paper: b(paper), paperScrollTop: paper ? Math.round(paper.scrollTop) : -1,
          paperScrollH: paper ? paper.scrollHeight : -1, paperClientH: paper ? paper.clientHeight : -1,
          innerH: innerHeight, docScrollY: Math.round(scrollY) };`);
      await shot("agent-live-acceptance-reading-inline.png");
    }

    check("L12 交互全过程没有 JS 报错", report.consoleErrors.length === 0, report.consoleErrors.length + " 条" + (report.consoleErrors[0] ? "：" + report.consoleErrors[0].text : ""));

    // L13：非「词条页」场景胶囊 —— 验证「场景 · 定位」不只对词义练习生效（计划 P1-2 / P1-4 的例子串）。
    // 只断言「新账号本来就该有数据的页面」（tongbu / grammar / course / quiz）；
    // exams / homework / mistakes 需要真实历史数据，新账号下页面本就不发布上下文，故只记录文本、不断言。
    const sceneCases = [
      ["tongbu", "#tongbu", "同步训练"],
      ["grammar", "#grammar", "语法专题"],
      ["course", "#course", "课程学习"],
      ["quiz", "#quiz", "单词测验"],
    ];
    const sceneCapsules = {};
    for (const [key, hash, label] of sceneCases) {
      let text = "";
      try {
        await cdp.send("Page.navigate", { url: BASE + "/" + hash }, sid);
        await sleep(2000);
        await ev(`(() => { const p = document.querySelector('.agent-panel'); if (p) return true; const f = document.querySelector('.agent-fab'); if (f) f.click(); return true; })()`);
        const end = Date.now() + 12000;
        while (Date.now() < end) {
          text = String(await ev(`(document.querySelector('.agent-statechip-text') || {}).textContent || ''`).catch(() => "")).trim();
          if (text) break;
          await sleep(300);
        }
      } catch (e) { text = "ERR " + e.message; }
      sceneCapsules[key] = text;
    }
    report.sceneCapsules = sceneCapsules;
    const sceneOk = sceneCases.every(([key, , label]) => String(sceneCapsules[key] || "").includes(label));
    check("L13 非词条页场景胶囊（场景识别 + 定位）", sceneOk, JSON.stringify(sceneCapsules));

    // L25：同步训练胶囊补上「第 N / M 题」（计划 §2.2 P1-2 的例子串「同步训练 · Starter Unit 1 · 第 4 题」）。
    // 本轮之前只有 position/questionNo/questionIndex 被发布，tongbu 一个都没发，所以胶囊只有「场景 · 定位」。
    const tongbuCapsule = String(sceneCapsules.tongbu || "");
    const tongbuProgressOk = /第\s*\d+\s*\/\s*\d+\s*题/.test(tongbuCapsule);
    report.tongbuProgress = { capsule: tongbuCapsule, matched: tongbuProgressOk };
    check("L25 同步训练胶囊含「第 N / M 题」", tongbuProgressOk, JSON.stringify(report.tongbuProgress));

    // L26：变式练习页胶囊要说「第 N 题 · 你在该词错过 M 次」（计划 P1-4 胶囊串的后半句）。
    // 新账号库里没有现成的 drill，所以把一份「1 题」的 drill 写进页面自己的 store —— 与 L24 的故障注入同性质：
    // 注入的只是「出哪几道题」，判分仍走 /api/quiz/answer 与数据库（前端上下文改不了判分结论）。
    // 关键：词义页发布的 context.level 是「筛选范围」（all），不是词库里的学段；/api/quiz/answer 按
    // (level, wordId) 精确查词，所以这里先让页面自己真答一题，从它的请求里拿到一对真实可判分的
    // (level, wordId)，再拿这对造变式题。切页用 location.hash + 手动派发 popstate（SPA 监听 popstate），
    // 避免整页重载把注入的 drill 冲掉。
    try {
      await cdp.send("Page.navigate", { url: BASE + "/?l26=" + Date.now() + "#meaning-en-zh" }, sid);
      await waitFor(`(() => { const s = globalThis.__lingoBloomLearningStore; return !!(s && s.context && s.context.wordId && s.context.level); })()`, "词义上下文（L26 前）", 30000);
      await openPanel("助教面板（L26）", 30000);
      // 记录页面真实作答提交的 (level, wordId)：这是词库里真实存在、可被 /api/quiz/answer 判分的一对。
      await ev(`(() => { window.__l26 = []; const of = window.fetch.bind(window);
        window.fetch = async (...a) => { const init = a[1] || {}; try { if (String(a[0]).includes('/api/quiz/answer') && init.body) window.__l26.push(JSON.parse(init.body)); } catch (_) {}
          return of(...a); };
        return true; })()`);
      const answeredReal = await ev(`(() => { const b = document.querySelector('.meaning-options button'); if (!b) return false; b.click(); return true; })()`);
      let realPair = null;
      for (let i = 0; i < 40 && !realPair; i += 1) {
        realPair = await ev(`(() => { const p = (window.__l26 || [])[0]; return p && p.level && p.wordId ? { level: p.level, wordId: p.wordId, type: p.type || 'en-zh' } : null; })()`);
        if (!realPair) await sleep(250);
      }
      const pairJson = JSON.stringify(realPair || null);
      const injected = (await ev(`(() => { const pair = ${pairJson}; if (!pair) return false;
        const s = globalThis.__lingoBloomLearningStore; if (!s) return false;
        s.drill = { source: 'agent', wordId: pair.wordId, level: pair.level, spelling: pair.wordId,
          items: [{ type: 'en-zh', word: { level: pair.level, id: pair.wordId, word: pair.wordId, meaning: '' },
                    prompt: pair.wordId, options: ['__agent_probe_wrong__'], answer: '' }] };
        location.hash = '#drill'; window.dispatchEvent(new PopStateEvent('popstate')); return true; })()`)) === true;
      await waitFor("!!document.querySelector('.drill-card')", "变式练习视图（L26）", 15000);
      const answered = await ev(`(() => {
        const b = [...document.querySelectorAll('.drill-card .options button')].find((x) => (x.textContent || '').includes('__agent_probe_wrong__'));
        if (!b) return false; b.click(); return true; })()`);
      // 断言前「等条件」，不睡固定时长：DrillView 是在**判分返回**后才 publishContext
      // （本轮探针实测：drill 卡渲染后 13s 内 store.context.scene 仍是 meaning，
      //   点完选项、判分回来才变 drill）—— 固定 sleep(2600) 会偶发读到上一场景的胶囊。
      let drillCapsule = "";
      let drillScene = null;
      const waitDrillEnd = Date.now() + 25000;
      const waitDrillStart = Date.now();
      while (Date.now() < waitDrillEnd) {
        const st = await evJSON(`
          const s = globalThis.__lingoBloomLearningStore;
          const chip = document.querySelector('.agent-statechip-text');
          return { scene: s && s.context ? s.context.scene : null, chip: chip ? chip.textContent.trim() : '' };`);
        drillScene = st.scene;
        drillCapsule = String(st.chip || "").trim();
        // 注意：drill 上下文是**两段式**发布的 —— 先「变式练习 · 第 1 / 1 题」，判分返回的 wrongTimes
        // 到了才补上「· 你在该词错过 M 次」（本轮实测 waitMs=1 的失败就是只等到前一段就 break 了）。
        // 所以这里等的是**被断言的完整文案**，不是 scene、也不是前半句。
        if (/第\s*\d+/.test(drillCapsule) && /你在该词错过\s*\d+\s*次/.test(drillCapsule)) break;
        await sleep(300);
      }
      const drillWaitMs = Date.now() - waitDrillStart;
      report.drillProgress = { realPair, answeredReal, injected, answered, scene: drillScene, capsule: drillCapsule, waitMs: drillWaitMs };
      check("L26 变式练习胶囊含「第 N 题 · 你在该词错过 M 次」",
        !!realPair && injected === true && answered === true && /第\s*\d+/.test(drillCapsule) && /你在该词错过\s*\d+\s*次/.test(drillCapsule),
        JSON.stringify(report.drillProgress));
    } catch (e) {
      report.drillProgress = { error: String((e && e.message) || e) };
      check("L26 变式练习胶囊含「第 N 题 · 你在该词错过 M 次」", false, "ERR " + String((e && e.message) || e));
    }
    // L14：停靠（dock）形态 —— 用户原始诉求是「面板压住页面内容」，停靠是那条诉求的另一种解法。
    // 这里只验证「切换生效 + 页面真的让位 + 能切回浮动」；跨视口 9 档见本机真栈的 §15。
    await cdp.send("Page.navigate", { url: BASE + "/#meaning-en-zh" }, sid);
    await sleep(2500);
    await openPanel("助教面板（停靠前）", 30000);
    const dockClicked = await ev(`(() => {
      const b = [...document.querySelectorAll('.agent-assistant button')].find((x) => (x.textContent || '').trim() === '停靠');
      if (!b) return false; b.click(); return true; })()`);
    await sleep(900);
    const dock = await evJSON(`
      const panel = document.querySelector('.agent-panel').getBoundingClientRect();
      const main = (document.querySelector('.app-content > main') || document.querySelector('main')).getBoundingClientRect();
      return { bodyDock: document.body.classList.contains('agent-dock'),
        right: Math.round(innerWidth - panel.right), width: Math.round(panel.width),
        mainRight: Math.round(main.right), panelLeft: Math.round(panel.left),
        rail: getComputedStyle(document.body).getPropertyValue('--agent-live-rail').trim() };`);
    report.dock = { clicked: dockClicked, ...dock };
    check("L14 停靠形态：切换生效 + 页面让位",
      dockClicked === true && dock.bodyDock === true && dock.width >= 360 && dock.width <= 560 && dock.mainRight <= dock.panelLeft + 2,
      JSON.stringify(report.dock));
    const backToFloat = await ev(`(() => {
      const b = [...document.querySelectorAll('.agent-assistant button')].find((x) => (x.textContent || '').trim() === '浮动');
      if (!b) return false; b.click(); return true; })()`);
    await sleep(700);
    const restored = await ev(`!document.body.classList.contains('agent-dock')`);
    check("L14b 切回浮动后页面恢复", backToFloat === true && restored === true, `clicked=${backToFloat} restored=${restored}`);

    // L15：胶囊上的「定位题目」——点它，页面把当前那道题滚进视口并高亮 2 秒（计划 §2.1 P1-4）。
    // 高亮只维持 2 秒，所以点击后立刻高频采样，而不是等到最后再读。
    try {
      await waitFor(`(() => { const s = globalThis.__lingoBloomLearningStore; return !!(s && s.context && s.context.scene === 'meaning' && s.context.wordId); })()`, "词义上下文（L15 前）", 30000);
    } catch {}
    await waitFor("!!document.querySelector('.agent-statechip-focus')", "「定位题目」按钮", 10000);
    const focusBefore = await evJSON(`
      const c = document.querySelector('.meaning-card');
      const r = c ? c.getBoundingClientRect() : null;
      return { scrolledY: Math.round(scrollY), cardTop: r ? Math.round(r.top) : null,
        highlighted: !!document.querySelector('.is-agent-focus') };`);
    const focusClicked = await ev(`(() => { const b = document.querySelector('.agent-statechip-focus'); if (!b) return false; b.click(); return true; })()`);
    let focusAfter = null;
    for (let i = 0; i < 24; i += 1) {
      focusAfter = await evJSON(`
        const c = document.querySelector('.meaning-card');
        const r = c ? c.getBoundingClientRect() : null;
        return { scrolledY: Math.round(scrollY), highlighted: !!document.querySelector('.is-agent-focus'),
          boxShadow: c ? (c.style.boxShadow || '') : '', cardTop: r ? Math.round(r.top) : null,
          inViewport: !!(r && r.top >= -4 && r.top <= innerHeight) };`);
      if (focusAfter.highlighted) break;
      await sleep(120);
    }
    report.focusItem = { clicked: focusClicked, before: focusBefore, after: focusAfter };
    check("L15 定位题目：当前题被高亮并滚进视口",
      focusClicked === true && !!(focusAfter && focusAfter.highlighted) && /rgba\(247,\s*181,\s*0/.test(String(focusAfter.boxShadow || "")),
      JSON.stringify(report.focusItem));
    // L17：主动轻提示（计划 P2 项）——在词义练习里连错两题，右下角应浮出一条轻提示，
    // 而不是弹窗打断作答。链路：MeaningPracticeView.answer() → noteAnswer(correct) →
    // 连错 2 次 → showMilestone('wrong-streak') → store.milestone → AgentAssistant 的 .agent-nudge。
    // 先 about:blank 清一次页面，保证 nudgeState（globalThis 连击/冷却）从零开始。
    await cdp.send("Page.navigate", { url: "about:blank" }, sid);
    await sleep(400);
    await cdp.send("Page.navigate", { url: BASE + "/#meaning-en-zh" }, sid);
    await waitFor("!!document.querySelector('#app .meaning-view, #app .view')", "看词选义视图(L17)", 30000);
    await waitFor("!!document.querySelector('.options.meaning-options button')", "词义选项就绪(L17)", 30000);
    const streakLog = [];
    let nudgeProbe = null;
    for (let i = 0; i < 14 && !nudgeProbe; i += 1) {
      const clicked = await ev(`(() => { const b = document.querySelector('.options.meaning-options button:not([disabled])'); if (!b) return false; b.click(); return true; })()`);
      if (!clicked) { await sleep(600); continue; }
      await sleep(1000);
      const fb = await evJSON(`
        const f = document.querySelector('.meaning-feedback');
        const c = document.querySelector('.options.meaning-options button.correct');
        return { wrong: !!(f && f.classList.contains('is-wrong')), correct: !!(f && f.classList.contains('is-correct')),
          correctText: c ? (c.textContent || '').trim().slice(0, 40) : '' };`).catch(() => null);
      if (fb) streakLog.push(fb);
      nudgeProbe = await evJSON(`
        const el = document.querySelector('.agent-nudge');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, role: el.getAttribute('role'),
          text: (el.textContent || '').trim().slice(0, 140),
          primary: (el.querySelector('button.primary') || {}).textContent || '',
          position: getComputedStyle(el).position, right: Math.round(innerWidth - r.right), bottom: Math.round(innerHeight - r.bottom) };`);
      if (nudgeProbe) break;
      await ev(`(() => { const b = [...document.querySelectorAll('.meaning-question-nav button')].find((x) => (x.textContent || '').includes('→')); if (b && !b.disabled) { b.click(); return true; } return false; })()`);
      await sleep(700);
    }
    report.nudge = { probe: nudgeProbe, streak: streakLog };
    check("L17 连错两题触发主动轻提示（浮动右下角 / role=status / 非弹窗）",
      !!(nudgeProbe && /连错/.test(nudgeProbe.text) && nudgeProbe.role === "status" && nudgeProbe.position === "fixed"
        && nudgeProbe.right >= 0 && nudgeProbe.right <= 60 && String(nudgeProbe.primary).trim().length > 0),
      JSON.stringify(report.nudge).slice(0, 480));
    const dialogFree = await ev(`(() => { const d = document.querySelector('[role="dialog"],[role="alertdialog"],dialog[open]'); return !d; })()`);
    // 同理：轻提示都没出现时「没有弹窗」是废话。先要求轻提示确实出现过，再谈它没阻断作答。
    check("L17b 轻提示不阻断作答（无 blocking dialog）", !!nudgeProbe && dialogFree === true,
      "nudgeShown=" + !!nudgeProbe + " dialogFree=" + dialogFree);
    if (nudgeProbe) await shot("agent-live-acceptance-nudge.png");

    // L18：归因结论落到 KnowledgeMastery.reason（计划 P2 项）——同一个真账号直接读线上
    // /api/learning/profile。reason 由 internal/learning/learning_intelligence.go 的 masteryReason()
    // 按「未巩固错题 / 到期复习 / 证据不足 / 连续复习答对 / 正确占多数」等规则生成；
    // 账号在本轮刚答过题，所以 practiced>0 时 reason 必须非空（「有据可循的归因」的线上证据）。
    const profiles = {};
    for (const lv of ["middle", "primary"]) {
      try {
        profiles[lv] = await evJSON(`
          const r = await fetch('/api/learning/profile?level=' + ${JSON.stringify(lv)}, { headers: { 'Accept': 'application/json' } });
          if (!r.ok) return { status: r.status };
          const j = await r.json();
          const pick = (arr) => (arr || []).map((x) => ({ label: x.label, score: x.score, reason: x.reason }));
          return { status: r.status, practiced: j.practiced, strongest: pick(j.strongest).slice(0, 4), weakest: pick(j.weakest).slice(0, 4) };`, true);
      } catch (e) { profiles[lv] = { error: String((e && e.message) || e) }; }
    }
    report.masteryProfile = profiles;
    const reasoned = Object.keys(profiles).reduce((acc, k) => {
      const p = profiles[k] || {};
      const keep = (x) => String(x.reason || "").trim().length > 0;
      return acc.concat((p.strongest || []).filter(keep).map((x) => ({ level: k, label: x.label, score: x.score, reason: x.reason })),
        (p.weakest || []).filter(keep).map((x) => ({ level: k, label: x.label, score: x.score, reason: x.reason })));
    }, []);
    check("L18 归因结论写入 KnowledgeMastery.reason（线上 profile 非空 reason）",
      reasoned.length > 0,
      reasoned.length ? `共 ${reasoned.length} 条；示例：${reasoned[0].level}/${reasoned[0].label} 分 ${reasoned[0].score} → ${reasoned[0].reason}` : JSON.stringify(profiles).slice(0, 300));
    // L19：小屏（≤1100px）面板变全屏抽屉 —— 计划 §3 的 P2 验收标准「小屏全屏抽屉」，此前只有本机证据。
    // （核对过 report-ui-live-w1024.json：它的 server=http://127.0.0.1:8100，是本机真栈不是公网；
    //   agent-ux-verify.mjs 的跨视口场景同样在本机栈上跑。所以这条必须补在公网验收里才算「线上」。）
    await cdp.send("Page.navigate", { url: BASE + "/#meaning-en-zh" }, sid);
    await waitFor("!!document.querySelector('#app .view, #app .meaning-view')", "看词选义视图(L19)", 30000);
    await openPanel("面板打开(L19)", 30000);
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1024, height: 768, deviceScaleFactor: 1, mobile: false }, sid);
    await sleep(800);
    const drawer = await evJSON(`
      const p = document.querySelector('.agent-panel');
      const r = p.getBoundingClientRect();
      const mainEl = document.querySelector('.app-content > main') || document.querySelector('main');
      const m = mainEl.getBoundingClientRect();
      const rz = document.querySelector('.agent-panel .agent-resize');
      return { innerWidth: Math.round(innerWidth), innerHeight: Math.round(innerHeight),
        position: getComputedStyle(p).position,
        left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height),
        zIndex: getComputedStyle(p).zIndex, resizeDisplay: rz ? getComputedStyle(rz).display : 'null',
        mainWidth: Math.round(m.width), hScroll: Math.round(document.documentElement.scrollWidth) - Math.round(innerWidth) };`);
    report.drawer = drawer;
    check("L19 小屏（1024px）面板变全屏抽屉（公网）",
      drawer.position === "fixed" && drawer.left <= 1 && drawer.top <= 1 && drawer.width >= drawer.innerWidth - 2
        && drawer.height >= drawer.innerHeight - 2 && drawer.zIndex === "70" && drawer.resizeDisplay === "none"
        && drawer.hScroll <= 1 && drawer.mainWidth >= 300,
      JSON.stringify(drawer));
    await shot("agent-live-acceptance-drawer-1024.png");
    await cdp.send("Emulation.clearDeviceMetricsOverride", {}, sid);
    await sleep(600);
    const vpBack = await evJSON(`
      const p = document.querySelector('.agent-panel');
      return { innerWidth: Math.round(innerWidth), width: p ? Math.round(p.getBoundingClientRect().width) : 0 };`);
    check("L19b 恢复视口后面板回到浮动宽度（抽屉只在小屏生效）",
      vpBack.innerWidth > 1100 && vpBack.width >= 360 && vpBack.width <= 560, JSON.stringify(vpBack));

    // L19c/L19d：**手机宽度**（390×844，mobile 视口）下面板同样变全屏抽屉 —— 计划 §2.3 P2-5 的验收原话
    // 就是「小屏面板改为全屏抽屉」，而 L19 只测了 1024px（平板/小桌面），真手机宽度此前无公网证据。
    // 390px 还会命中 agent.css 更早那条低优先级的 `@media(max-width:620px){.agent-panel{right:12px;bottom:68px}}`，
    // 所以这条同时证明「620 规则不会把抽屉拉回右下角小卡」。
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 3, mobile: true }, sid);
    await sleep(900);
    const phone = await evJSON(`
      const p = document.querySelector('.agent-panel');
      const r = p.getBoundingClientRect();
      const cs = getComputedStyle(p);
      const rz = document.querySelector('.agent-panel .agent-resize');
      const foot = p.querySelector('footer');
      const ta = p.querySelector('footer textarea, textarea');
      const sendBtn = p.querySelector('footer button');
      const fr = foot ? foot.getBoundingClientRect() : null;
      const tcs = ta ? getComputedStyle(ta) : null;
      return { innerWidth: Math.round(innerWidth), innerHeight: Math.round(innerHeight),
        position: cs.position, left: Math.round(r.left), top: Math.round(r.top),
        width: Math.round(r.width), height: Math.round(r.height), bottomGap: Math.round(innerHeight - r.bottom),
        zIndex: cs.zIndex, resizeDisplay: rz ? getComputedStyle(rz).display : 'null',
        panelHScroll: Math.round(p.scrollWidth) - Math.round(p.clientWidth),
        pageHScroll: Math.round(document.documentElement.scrollWidth) - Math.round(innerWidth),
        footTop: fr ? Math.round(fr.top) : -1, footBottom: fr ? Math.round(fr.bottom) : -1,
        footInViewport: !!(fr && fr.bottom <= innerHeight + 1 && fr.top >= -1),
        textareaFocusable: !!(ta && ta.tabIndex >= 0 && !ta.disabled && tcs.display !== 'none' && tcs.visibility !== 'hidden'),
        sendLabel: sendBtn ? ((sendBtn.getAttribute('aria-label') || sendBtn.textContent || '').trim().slice(0, 12)) : '' };`);
    report.phoneDrawer = phone;
    check("L19c 手机宽度（390×844）面板变全屏抽屉（公网）",
      phone.position === "fixed" && phone.left <= 1 && phone.top <= 1
        && phone.width >= phone.innerWidth - 2 && phone.height >= phone.innerHeight - 2
        && phone.bottomGap <= 1 && phone.zIndex === "70" && phone.resizeDisplay === "none"
        && phone.panelHScroll <= 1,
      JSON.stringify(phone));
    await shot("agent-live-acceptance-drawer-390.png");
    check("L19d 手机抽屉里输入区仍在视口内且可聚焦（公网）",
      phone.footInViewport === true && phone.textareaFocusable === true && phone.sendLabel.length > 0,
      "footInViewport=" + phone.footInViewport + " footTop=" + phone.footTop + " footBottom=" + phone.footBottom
        + " focusable=" + phone.textareaFocusable + " sendLabel=" + JSON.stringify(phone.sendLabel));
    await cdp.send("Emulation.clearDeviceMetricsOverride", {}, sid);
    await sleep(600);
    // L20：长问题回答不撑爆面板 —— 计划 §3 P2 验收的「长回答折叠」，本轮线上探针先查清了它的可达性：
    // 面板对**自由提问**也会带 format:'card'（`AgentAssistant.js` 的 CARD_ACTIONS 含空串 ''），
    // 而本站模型一律回教学卡片（实测连「请写 1000 字散文、不许输出 JSON」也被收敛成卡片，2/2），
    // 所以「Markdown 回落 → 折叠」是一条**兜底**路径，线上无法确定性触发；它的节点级验证在 §20
    // 的验证台场景 float-long-fold。线上可确定性验证的，是这条验收标准真正在防的事：**长问题不撑爆面板**。
    await cdp.send("Page.navigate", { url: "about:blank" }, sid);
    await sleep(400);
    await cdp.send("Page.navigate", { url: BASE + "/#meaning-en-zh" }, sid);
    await waitFor("!!document.querySelector('#app .view, #app .meaning-view')", "看词选义视图(L20)", 30000);
    await openPanel("面板打开(L20)", 30000);
    const longAsk = "请用不少于 1000 字的中文，系统讲解英语词根 -sist-：来源与含义、5 条记忆线索、10 个常见派生词（每个给出中文释义、英文例句和例句翻译），最后给 5 道自测题。请写满 1000 字以上，不要省略。";
    const answerBefore = await ev(`document.querySelectorAll('.agent-panel article').length`);
    await ev(setInput(".agent-panel footer textarea, .agent-panel textarea", longAsk));
    await sleep(300);
    const longSent = await ev(`(() => { const b = document.querySelector('.agent-panel footer button'); if (!b || b.disabled) return false; b.click(); return true; })()`);
    try {
      await waitFor(`document.querySelectorAll('.agent-panel article').length > ${answerBefore} && !document.querySelector('.agent-streambar')`, "长问题回答渲染完成(L20)", 180000);
    } catch {}
    await sleep(600);
    const longAnswer = await evJSON(`
      const panel = document.querySelector('.agent-panel');
      const main = panel.querySelector('main');
      const foot = panel.querySelector('footer');
      const pr = panel.getBoundingClientRect();
      const fr = foot.getBoundingClientRect();
      const mr = main.getBoundingClientRect();
      const folds = [...panel.querySelectorAll('.agent-answer-fold')];
      return { articles: panel.querySelectorAll('article').length,
        cards: panel.querySelectorAll('.agent-card, agent-teaching-card').length,
        folds: folds.length, foldables: folds.filter((f) => f.parentElement.querySelector('.agent-fold')).length,
        lastFoldMaxH: folds.length ? getComputedStyle(folds[folds.length - 1]).maxHeight : '',
        panelBottom: Math.round(pr.bottom), innerHeight: Math.round(innerHeight),
        panelHScroll: panel.scrollWidth - panel.clientWidth,
        mainBottom: Math.round(mr.bottom), footTop: Math.round(fr.top), footBottom: Math.round(fr.bottom),
        mainScrollable: main.scrollHeight > main.clientHeight };`);
    longAnswer.sent = longSent;
    report.longAnswer = longAnswer;
    check("L20 长问题（要求 1000 字）回答不撑爆面板（公网）",
      longSent === true && longAnswer.cards >= 1 && longAnswer.panelHScroll <= 2
        && longAnswer.footBottom <= longAnswer.innerHeight && longAnswer.panelBottom <= longAnswer.innerHeight + 1
        && longAnswer.mainBottom <= longAnswer.footTop + 2,
      JSON.stringify(longAnswer));
    await shot("agent-live-acceptance-long-answer.png");
    // L21：页内「就地回答卡」——计划 P0-2（答题后在题目卡下方就地展开讲解卡，不把人拽到右下角面板）。
    // §19 这一行此前引的 U13/U14/U15/U19 与 report-ui-live.json 同源，都是**本机真栈**，所以补公网。
    // 注意：上一节就停在 #meaning-en-zh，只改 hash 不会重载 SPA，所以先 about:blank 拿一个干净页面。
    await cdp.send("Page.navigate", { url: "about:blank" }, sid);
    await sleep(400);
    await cdp.send("Page.navigate", { url: BASE + "/#meaning-en-zh" }, sid);
    await waitFor("!!document.querySelector('#app .view, #app .meaning-view')", "看词选义视图(L21)", 30000);
    await waitFor("!!document.querySelector('.options.meaning-options button:not([disabled])')", "词义选项就绪(L21)", 30000);
    await ev(`(() => { const b = document.querySelector('.options.meaning-options button:not([disabled])'); if (!b) return false; b.click(); return true; })()`);
    await waitFor("!!document.querySelector('.meaning-ask button.primary')", "就地讲解入口(L21)", 30000);
    const inlineLabel = await ev(`(document.querySelector('.meaning-ask button.primary') || {}).textContent || ''`);
    const inlineClicked = await ev(`(() => { const b = document.querySelector('.meaning-ask button.primary'); if (!b) return false; b.click(); return true; })()`);
    try {
      await waitFor(`(!!document.querySelector('.agent-inline-teach agent-teaching-card, .agent-inline-teach .agent-card') || !!document.querySelector('.agent-inline-error')) && !document.querySelector('.agent-inline-skeleton')`, "就地讲解卡渲染完成(L21)", 120000);
    } catch {}
    const inline = await evJSON(`
      const sec = document.querySelector('.agent-inline-teach');
      const card = sec ? sec.querySelector('agent-teaching-card, .agent-card') : null;
      const err = document.querySelector('.agent-inline-error');
      const opts = document.querySelector('.options.meaning-options');
      const r = sec ? sec.getBoundingClientRect() : null;
      const or = opts ? opts.getBoundingClientRect() : null;
      return { hasSection: !!sec, hasCard: !!card,
        cardHeadline: card ? ((card.querySelector('.agent-card-headline') || {}).textContent || '').trim().slice(0, 60) : '',
        words: card ? card.querySelectorAll('.agent-word').length : 0,
        error: err ? (err.textContent || '').trim().slice(0, 80) : '',
        belowOptions: !!(sec && opts && r.top >= or.bottom - 2), skeleton: !!document.querySelector('.agent-inline-skeleton'),
        jsonLeak: ['"headline"', '"verdict"', '"points"', '"kind":'].some((k) => document.body.innerText.includes(k)) };`);
    inline.label = String(inlineLabel).trim();
    inline.clicked = inlineClicked;
    report.inline = inline;
    check("L21 页内就地回答卡：答题后就地展开、不遮挡、不跳面板（公网）",
      inlineClicked === true && inline.hasCard === true && inline.words > 0 && inline.belowOptions === true
        && inline.skeleton === false && inline.jsonLeak === false && inline.error === "",
      JSON.stringify(report.inline).slice(0, 460));
    // 截图前把就地卡片滚进视口、并收起面板，让截图真的拍到「页内卡片」而不是右下角面板。
    await ev(`(() => { const s = document.querySelector('.agent-inline-teach'); if (s) s.scrollIntoView({ block: 'center', behavior: 'instant' }); return true; })()`);
    await sleep(500);
    if (await ev('!!document.querySelector(\'.agent-panel\')')) { await ev(`(() => { const f = document.querySelector('.agent-fab'); if (f) f.click(); return true; })()`); await sleep(500); }
    await shot("agent-live-acceptance-inline-teach.png");

    // L24：故障注入 —— 服务端「只给 message、不给 card」时不许把原始 JSON 当正文渲染。
    // 线上实测（2026-10-07，14 连发 explain 命中 1 次）服务端会漏 card，老逻辑会把
    // {"headline":...} 原样铺给学生。这里把 /api/agent/chat 换成这种回包，验证兜底文案。
    await ev(`(() => {
      if (!window.__origFetchL24) window.__origFetchL24 = window.fetch.bind(window);
      window.fetch = function (input, init) {
        const url = typeof input === 'string' ? input : (input && input.url) || '';
        if (url.indexOf('/api/agent/chat') >= 0) {
          const payload = { message: '{"kind":"explain","headline":"LEAK-SENTINEL","points":[{"label":"x","text":"y"}]}',
            threadId: '', model: 'stub-l24', receipt: null, snapshotText: '' };
          return Promise.resolve(new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } }));
        }
        return window.__origFetchL24(input, init);
      };
      return true;
    })()`);
    await ev(`(() => { const b = document.querySelector('.agent-inline-head button'); if (b) b.click(); return true; })()`);
    await sleep(250);
    const reAsked = await ev(`(() => { const b = document.querySelector('.meaning-ask button.primary'); if (!b) return false; b.click(); return true; })()`);
    try {
      await waitFor("(!!document.querySelector('.agent-inline-error') || !!document.querySelector('.agent-inline-teach agent-teaching-card')) && !document.querySelector('.agent-inline-skeleton')", "卡无 card 时的兜底(L24)", 60000);
    } catch {}
    const fallback = await evJSON(`
      const err = document.querySelector('.agent-inline-error');
      const card = document.querySelector('.agent-inline-teach agent-teaching-card');
      const text = document.body.innerText || '';
      return { hasError: !!err, errorText: err ? (err.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 120) : '',
        hasCard: !!card, sentinelOnPage: text.indexOf('LEAK-SENTINEL') >= 0, rawJsonOnPage: text.indexOf('"headline"') >= 0 };`);
    fallback.reAsked = reAsked;
    report.jsonFallback = fallback;
    check("L24 服务端漏 card 时不把原始 JSON 当正文（公网 + 故障注入）",
      reAsked === true && fallback.hasError === true && fallback.errorText.length > 0 && fallback.hasCard === false
        && fallback.sentinelOnPage === false && fallback.rawJsonOnPage === false,
      JSON.stringify(fallback).slice(0, 420));
    await ev(`(() => { if (window.__origFetchL24) { window.fetch = window.__origFetchL24; window.__origFetchL24 = null; } return true; })()`);
    await shot("agent-live-acceptance-json-fallback.png");

    // L22：流式回答的「可停止」——计划 P2-3（长回答能中途停止、停止后界面不卡在 busy）。
    // §19 那一行引的 U31/U32/U33 同样来自本机真栈，本轮补公网断言。
    await cdp.send("Page.navigate", { url: "about:blank" }, sid);
    await sleep(400);
    await cdp.send("Page.navigate", { url: BASE + "/#meaning-en-zh" }, sid);
    await waitFor("!!document.querySelector('#app .view, #app .meaning-view')", "看词选义视图(L22)", 30000);
    await openPanel("面板输入区(L22)", 30000);
    await waitFor("!!document.querySelector('.agent-panel footer textarea')", "面板输入区(L22)", 15000);
    const streamAsk = "请写一篇不少于 1200 字的中文长文，逐条讲解英语词根 -sist- 的 20 个派生词及其用法，不要省略、不要只给提纲。";
    await ev(setInput(".agent-panel footer textarea, .agent-panel textarea", streamAsk));
    await sleep(300);
    const streamSent = await ev(`(() => { const b = document.querySelector('.agent-panel footer button'); if (!b || b.disabled) return false; b.click(); return true; })()`);
    let streaming = null;
    try {
      await waitFor("!!document.querySelector('.agent-panel .agent-streambar .agent-stop')", "流式进行中 + 停止生成按钮(L22)", 60000);
      streaming = await evJSON(`
        const bar = document.querySelector('.agent-panel .agent-streambar');
        const stop = bar ? bar.querySelector('.agent-stop') : null;
        const r = stop ? stop.getBoundingClientRect() : null;
        return { barText: bar ? (bar.textContent || '').trim().slice(0, 70) : '',
          stopText: stop ? stop.textContent.trim() : '', stopVisible: !!(r && r.height > 8 && r.width > 8) };`);
    } catch {}
    const stopClicked = await ev(`(() => { const b = document.querySelector('.agent-panel .agent-streambar .agent-stop'); if (!b) return false; b.click(); return true; })()`);
    try {
      await waitFor("!document.querySelector('.agent-panel .agent-streambar')", "停止后流式条消失(L22)", 30000);
    } catch {}
    await sleep(800);
    const stopped = await evJSON(`
      const panel = document.querySelector('.agent-panel');
      const empty = panel.querySelector('.agent-empty-answer');
      return { streambar: !!panel.querySelector('.agent-streambar'),
        stoppedLabel: panel.querySelector('.agent-stopped') ? panel.querySelector('.agent-stopped').textContent.trim() : '',
        stoppedHint: empty ? (empty.textContent || '').trim().slice(0, 60) : '',
        answerTexts: [...panel.querySelectorAll('.agent-answer-fold .agent-markdown')].map((m) => (m.textContent || '').trim().length) };`);
    report.streaming = { streaming, stopClicked, stopped };
    check("L22 流式回答可中途停止（公网）",
      streamSent === true && !!streaming && streaming.stopVisible === true && stopClicked === true
        && stopped.streambar === false,
      JSON.stringify(report.streaming).slice(0, 460));
    await shot("agent-live-acceptance-stream-stop.png");
    // L23：浮动面板左缘拖拽调宽并夹在 360–560 —— 计划 P2-4 的「浮动形态：420px + 左缘拖拽调宽（360–560）」，
    // 这是「要浮动」这条诉求里唯一的交互式形态证据，此前从未在公网断言过。
    await cdp.send("Page.navigate", { url: "about:blank" }, sid);
    await sleep(400);
    await cdp.send("Page.navigate", { url: BASE + "/#meaning-en-zh" }, sid);
    await waitFor("!!document.querySelector('#app .view, #app .meaning-view')", "看词选义视图(L23)", 30000);
    await openPanel("面板拖拽条(L23)", 30000);
    await waitFor("!!document.querySelector('.agent-panel .agent-resize')", "面板拖拽条(L23)", 15000);
    const widthNow = () => ev(`Math.round(document.querySelector('.agent-panel').getBoundingClientRect().width)`);
    const dragHandleBy = async (dx) => {
      const h = await evJSON(`
        const el = document.querySelector('.agent-panel .agent-resize');
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + 100), display: getComputedStyle(el).display };`);
      await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: h.x, y: h.y, button: "left", buttons: 1, clickCount: 1 }, sid);
      await sleep(90);
      for (let i = 1; i <= 6; i += 1) {
        await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: h.x + Math.round((dx * i) / 6), y: h.y, button: "left", buttons: 1 }, sid);
        await sleep(45);
      }
      await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: h.x + dx, y: h.y, button: "left", buttons: 0, clickCount: 1 }, sid);
      await sleep(350);
      return h.display;
    };
    const widthBefore = await widthNow();
    const handleDisplay = await dragHandleBy(-420);
    const widthWide = await widthNow();
    await dragHandleBy(520);
    const widthNarrow = await widthNow();
    await dragHandleBy(2000);
    const widthMin = await widthNow();
    const persistedWidth = await ev(`window.localStorage.getItem('lingoBloomAgentPanelWidth')`);
    report.resize = { before: widthBefore, handleDisplay, wide: widthWide, narrow: widthNarrow, min: widthMin, persisted: persistedWidth };
    check("L23 浮动面板左缘拖拽调宽：变宽夹在 560、变窄夹在 360（公网）",
      handleDisplay !== "none" && widthWide === 560 && widthMin === 360 && widthNarrow < widthWide
        && String(persistedWidth) === "360",
      JSON.stringify(report.resize));
    await shot("agent-live-acceptance-resize-360.png");
  } catch (e) {
    check("L99 流程异常", false, e.message);
  }

  return finish(report, checks.every((c) => c.ok) ? 0 : 1);
}

async function finish(report, code) {
  report.finishedAt = new Date().toISOString();
  report.passed = checks.filter((c) => c.ok).length;
  report.failed = checks.filter((c) => !c.ok).length;
  await fs.promises.mkdir(path.dirname(REPORT), { recursive: true });
  await fs.promises.writeFile(REPORT, JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(`\n==> 公网验收：${report.passed} 通过 / ${report.failed} 失败`);
  console.log("报告：" + path.relative(ROOT, REPORT));
  for (const c of children) { try { c.kill(); } catch {} }
  process.exit(code);
}

main().catch((e) => { console.error("未捕获异常：" + (e && e.stack || e)); process.exit(1); });
