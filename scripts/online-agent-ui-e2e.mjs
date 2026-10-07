#!/usr/bin/env node
// scripts/online-agent-ui-e2e.mjs
//
// 「严格的线上测试」的 UI 一半：真 Chrome（CDP 驱动）→ 真站点（真服务端）→ 真模型，
// 全程用真实点击流，最后落三张截图作为证据。
//
// 覆盖的正是用户抱怨的那三件事：
//   感知  —— 页面答错后，助教拿到的上下文来自真实页面（不是手写 JSON）
//   展示  —— 讲解渲染成结构化教学卡片，而不是一段 JSON 原文
//   结合  —— 浮动面板贴右缘浮起，但页面（选项区 / 错词栏 / 就地讲解卡）一个像素都不被盖住
//
// 用法：
//   node scripts/online-agent-ui-e2e.mjs --api-key sk-xxx            # 真模型（默认 DeepSeek）
//   node scripts/online-agent-ui-e2e.mjs --mock                       # 本地 mock，快速回归
//   node scripts/online-agent-ui-e2e.mjs --headed                     # 关掉 headless，肉眼看
//
// 退出码 0 = 全绿。报告：.tmp/online-e2e/report-ui-{live|mock}.json
// 截图：docs/images/agent-live-*.png

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, ".tmp", "online-e2e");
const SHOT_DIR = path.join(ROOT, "docs", "images");

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
function opt(name, fallback) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}

const USE_MOCK = flag("--mock");
const HEADED = flag("--headed");
const WINDOW = opt("--window", "1440,960");
const WIDTH_PROBE = argv.indexOf("--window") >= 0;
const TAG = opt("--tag", "");
const PLACEMENT = opt("--placement", "float") === "dock" ? "dock" : "float";
const DOCK = PLACEMENT === "dock";
const PORT = Number(opt("--port", USE_MOCK ? 8101 : 8100));
const BASE = "http://127.0.0.1:" + PORT;
const MOCK_PORT = Number(opt("--mock-port", 8899));
const CDP_PORT = Number(opt("--cdp-port", 9333));

const PROVIDER = USE_MOCK ? "openai" : opt("--provider", "deepseek");
const MODEL = USE_MOCK ? "gpt-mock-1" : opt("--model", "deepseek-flash");
const BASE_URL = USE_MOCK ? `http://127.0.0.1:${MOCK_PORT}/v1` : opt("--base-url", "https://api.deepseek.com/");
const API_KEY = opt("--api-key", process.env.DEEPSEEK_API_KEY || "sk-ddf0251232694619b2a7bf74d1038cf6");
const OPTION_TIMEOUT = USE_MOCK ? 30000 : 120000;

const STUDENT = { username: "e2e-student", password: "Student123!" };
const ADMIN = { username: "admin", password: "Admin123!" };

const checks = [];
function check(id, label, ok, detail) {
  checks.push({ id, label, ok: Boolean(ok), detail: detail === undefined ? "" : String(detail) });
  console.log(`  [${ok ? "PASS" : "FAIL"}] ${id} · ${label}${detail ? " — " + detail : ""}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean);
  for (const candidate of candidates) if (existsSync(candidate)) return candidate;
  throw new Error("找不到 Chrome，请设置 CHROME_PATH");
}

// ---------------------------------------------------------------------------
// 进程
// ---------------------------------------------------------------------------

const children = [];
function launch(command, args, options = {}) {
  const child = spawn(command, args, { cwd: ROOT, ...options });
  children.push(child);
  if (options.stdout !== "ignore") {
    child.stdout?.on("data", (d) => process.stdout.write("[child] " + d.toString()));
  }
  if (options.stderr !== "ignore") {
    child.stderr?.on("data", (d) => process.stderr.write("[child:err] " + d.toString()));
  }
  return child;
}
function cleanup() {
  for (const child of children) {
    try {
      child.kill();
    } catch {
      /* ignore */
    }
  }
}
process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(130);
});

// ---------------------------------------------------------------------------
// 极简 CDP 客户端
// ---------------------------------------------------------------------------

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 0;
    this.pending = new Map();
    this.listeners = [];
    ws.addEventListener("message", (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.method + ": " + JSON.stringify(msg.error)));
        else resolve(msg.result);
        return;
      }
      for (const listener of this.listeners) listener(msg);
    });
  }

  onMessage(listener) {
    this.listeners.push(listener);
  }

  send(method, params = {}, sessionId) {
    const id = ++this.nextId;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error("CDP timeout: " + method));
        }
      }, 120000);
    });
  }
}

async function connectCDP() {
  const deadline = Date.now() + 30000;
  let last = "";
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (res.ok) {
        const info = await res.json();
        const ws = new WebSocket(info.webSocketDebuggerUrl);
        await new Promise((resolve, reject) => {
          ws.addEventListener("open", resolve, { once: true });
          ws.addEventListener("error", (e) => reject(new Error("ws error: " + (e.message || "unknown"))), { once: true });
        });
        return ws;
      }
      last = "status " + res.status;
    } catch (error) {
      last = error.message;
    }
    await sleep(300);
  }
  throw new Error("Chrome 调试端口没起来：" + last);
}

// ---------------------------------------------------------------------------
// HTTP（服务端 API）
// ---------------------------------------------------------------------------

let cookie = "";
async function call(method, url, body) {
  const headers = {};
  if (cookie) headers.Cookie = cookie;
  let payload;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(url.startsWith("http") ? url : BASE + url, { method, headers, body: payload });
  for (const line of res.headers.getSetCookie ? res.headers.getSetCookie() : []) {
    const pair = line.split(";")[0];
    if (pair.startsWith("english_learn_session=")) cookie = pair;
  }
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* raw */
  }
  return { status: res.status, json, text };
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(SHOT_DIR, { recursive: true });
  const report = { startedAt: new Date().toISOString(), mode: USE_MOCK ? "mock" : "live", server: BASE, checks, shots: {}, consoleErrors: [] };

  // 0. provider 声明（live 模式需要）
  if (!USE_MOCK) {
    const codexHome = path.join(ROOT, ".agent");
    const configToml = path.join(codexHome, "config.toml");
    await fs.mkdir(codexHome, { recursive: true });
    let current = "";
    try {
      current = await fs.readFile(configToml, "utf8");
    } catch {
      current = "";
    }
    const section = `[model_providers.${PROVIDER}]`;
    if (!current.includes(section)) {
      const block = [section, `name = "${PROVIDER}"`, `base_url = "${BASE_URL}"`, 'wire_api = "responses"', "requires_openai_auth = true", ""].join("\n");
      await fs.writeFile(configToml, current ? current.replace(/\s*$/, "\n\n") + block : block, "utf8");
    } else if (!/requires_openai_auth\s*=/.test(current)) {
      await fs.writeFile(configToml, current.replace(section, section + "\nrequires_openai_auth = true"), "utf8");
    }
  }

  // 1. mock
  if (USE_MOCK) {
    launch(process.execPath, [path.join(ROOT, "scripts", "mock-openai-responses.mjs"), "--port", String(MOCK_PORT)], { stdio: ["ignore", "pipe", "pipe"] });
    let up = false;
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline && !up) {
      try {
        up = (await fetch(`http://127.0.0.1:${MOCK_PORT}/v1/models`)).ok;
      } catch {
        await sleep(250);
      }
    }
    check("U1", "本地 mock 模型服务就绪", up, `http://127.0.0.1:${MOCK_PORT}`);
  }

  // 2. 构建 + 起服务端
  const bin = path.join(OUT_DIR, process.platform === "win32" ? "english-learn-ui.exe" : "english-learn-ui");
  const build = await new Promise((resolve) => {
    const p = spawn("go", ["build", "-o", bin, "./cmd/server"], {
      cwd: ROOT,
      env: { ...process.env, GOCACHE: path.join(ROOT, ".tmp", "go-build") },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "";
    p.stdout.on("data", (d) => (out += d.toString()));
    p.stderr.on("data", (d) => (out += d.toString()));
    p.on("close", (code) => resolve({ code, out }));
  });
  check("U2", "go build ./cmd/server 成功", build.code === 0, build.out.trim().slice(0, 300) || "exit=" + build.code);
  if (build.code !== 0) return finish(report, 1);

  const dbPath = path.join(OUT_DIR, USE_MOCK ? "ui-mock.db" : "ui-live.db");
  await fs.rm(dbPath, { force: true }).catch(() => {});
  launch(bin, [], { env: { ...process.env, ENGLISH_LEARN_ADDR: "127.0.0.1:" + PORT, ENGLISH_LEARN_DB: dbPath }, stdio: ["ignore", "pipe", "pipe"] });
  let healthy = false;
  for (let i = 0; i < 120 && !healthy; i += 1) {
    try {
      healthy = (await fetch(BASE + "/api/health")).ok;
    } catch {
      await sleep(400);
    }
  }
  check("U3", "真实服务端就绪", healthy, BASE);
  if (!healthy) return finish(report, 1);

  // 3. 建学生账号 + 打开智能体
  const reg = await call("POST", "/api/auth/register", STUDENT);
  const studentOk = reg.status === 200;
  if (!studentOk) {
    const relogin = await call("POST", "/api/auth/login", STUDENT);
    check("U4", "学生账号可用（新建或已存在）", relogin.status === 200, "register=" + reg.status + " login=" + relogin.status);
  } else {
    check("U4", "学生账号注册成功", true, STUDENT.username);
  }

  const adminLogin = await call("POST", "/api/auth/login", ADMIN);
  check("U5", "管理员登录（用于配置智能体）", adminLogin.status === 200, "status=" + adminLogin.status);
  const saved = await call("PUT", "/api/admin/agent/config", {
    engine: "codex-core",
    enabled: true,
    providerId: PROVIDER,
    model: MODEL,
    baseUrl: BASE_URL,
    apiKey: API_KEY,
    systemPrompt:
      "你是面向中国中学生的英语学习助手。用清晰、鼓励、准确的中文讲解英语；根据学生水平控制难度；不要直接替学生完成考试中的作答，而应通过提示、拆解和反馈帮助其掌握知识。",
    timeoutSeconds: 120,
    maxPromptChars: 12000,
    maxConcurrentRuns: 2,
  });
  check("U6", "智能体已启用（provider/model 正确）", saved.status === 200 && saved.json.enabled === true && saved.json.model === MODEL, saved.json ? JSON.stringify({ enabled: saved.json.enabled, model: saved.json.model, providerId: saved.json.providerId }) : "status=" + saved.status);

  // 4. 起 Chrome
  const chromePath = findChrome();
  const profileDir = path.join(OUT_DIR, "chrome-ui-profile");
  await fs.rm(profileDir, { recursive: true, force: true }).catch(() => {});
  await fs.mkdir(profileDir, { recursive: true });
  const chromeArgs = [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--mute-audio",
    `--window-size=${WINDOW}`,
    "about:blank",
  ];
  if (!HEADED) chromeArgs.unshift("--headless=new", "--disable-gpu", "--hide-scrollbars");
  launch(chromePath, chromeArgs, { stdio: ["ignore", "ignore", "ignore"] });

  const ws = await connectCDP();
  const cdp = new CDP(ws);
  cdp.onMessage((msg) => {
    if (msg.method === "Runtime.consoleAPICalled" && (msg.params.type === "error" || msg.params.type === "warning")) {
      report.consoleErrors.push({ type: msg.params.type, text: (msg.params.args || []).map((a) => a.value || a.description || a.type).join(" ").slice(0, 300) });
    }
    if (msg.method === "Runtime.exceptionThrown") {
      report.consoleErrors.push({ type: "exception", text: String(msg.params.exceptionDetails?.exception?.description || "").slice(0, 300) });
    }
  });
  const target = await cdp.send("Target.createTarget", { url: "about:blank" });
  const attached = await cdp.send("Target.attachToTarget", { targetId: target.targetId, flatten: true });
  const sid = attached.sessionId;
  await cdp.send("Page.enable", {}, sid);
  await cdp.send("Runtime.enable", {}, sid);

  const evaluate = async (expression, awaitPromise = false) => {
    const res = await cdp.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise }, sid);
    if (res.exceptionDetails) throw new Error("evaluate 失败：" + (res.exceptionDetails.exception?.description || res.exceptionDetails.text));
    return res.result.value;
  };
  const evalJSON = (expression, awaitPromise = false) =>
    evaluate(`JSON.stringify((() => { ${expression} })())`, awaitPromise).then((v) => (v ? JSON.parse(v) : null));

  async function waitFor(expression, label, timeoutMs = 30000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        if (await evaluate(expression)) return true;
      } catch {
        /* keep polling */
      }
      await sleep(250);
    }
    throw new Error("等待超时：" + label);
  }

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

  const click = (selector, index = 0) => `
    (() => {
      const list = document.querySelectorAll(${JSON.stringify(selector)});
      const el = list[${index}];
      if (!el) return false;
      el.scrollIntoView({ block: 'center' });
      el.click();
      return true;
    })()`;

  // 遮挡测点：① 候选选择器按优先级取第一个「真的占位」的元素，
  // ② 先把目标滚进视口（behavior:instant，页面全局是 smooth 滚动，否则同步读 rect
  // 会拿到滚动前的位置），再对「元素 ∩ 视口」做 3x3 采样——长页面的整页 rect 会有大量
  // 采样点落在视口外，不计入 sampled 就等于没测到，③ 回报命中的选择器与 rect，
  // 让 sampled=0 的「假通过」不可能再发生。
  const occludeVisible = (entries) => `
    (() => {
      const panel = document.querySelector(".agent-assistant");
      const out = [];
      for (const [name, cands] of ${JSON.stringify(entries)}) {
        let el = null, matched = "";
        for (const sel of cands) {
          const found = Array.from(document.querySelectorAll(sel)).find((e) => e.getBoundingClientRect().height > 0);
          if (found) { el = found; matched = sel; break; }
        }
        if (!el) { out.push({ name, missing: true, sampled: 0, covered: 0, tried: cands }); continue; }
        el.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
        const r = el.getBoundingClientRect();
        let left = Math.max(0, r.left);
        let top = Math.max(0, r.top);
        let right = Math.min(innerWidth, r.right);
        let bottom = Math.min(innerHeight, r.bottom);
        if (right - left < 8 || bottom - top < 8) {
          // 目标本身量不到（被裁 / 在视口外）：向上找第一个真有得量的祖先，
          // 并如实登记 fellBackTo，避免把「量到 0 个点」当成「零遮挡通过」。
          let up = el.parentElement, box = null;
          for (let k = 0; k < 6 && up; k += 1) {
            const q = up.getBoundingClientRect();
            const l = Math.max(0, q.left), t = Math.max(0, q.top);
            const rr = Math.min(innerWidth, q.right), bb = Math.min(innerHeight, q.bottom);
            if (rr - l >= 64 && bb - t >= 64) { box = [l, t, rr, bb, up]; break; }
            up = up.parentElement;
          }
          if (!box) { out.push({ name, matched, sampled: 0, covered: 0, offscreen: true, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }); continue; }
          left = box[0]; top = box[1]; right = box[2]; bottom = box[3];
          matched = matched + "↑" + (box[4].className && typeof box[4].className === "string" ? box[4].className.split(" ")[0] : box[4].tagName);
        }
        let covered = 0, sampled = 0;
        for (let i = 1; i < 4; i += 1) {
          for (let j = 1; j < 4; j += 1) {
            const x = Math.round(left + ((right - left) * i) / 4);
            const y = Math.round(top + ((bottom - top) * j) / 4);
            sampled += 1;
            const hit = document.elementFromPoint(x, y);
            if (hit && panel && panel.contains(hit)) covered += 1;
          }
        }
        out.push({ name, matched, sampled, covered, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] });
      }
      return JSON.stringify(out);
    })()`;



  const screenshot = async (name) => {
    const res = await cdp.send("Page.captureScreenshot", { format: "png" }, sid);
    const file = path.join(SHOT_DIR, name + TAG + ".png");
    await fs.writeFile(file, Buffer.from(res.data, "base64"));
    report.shots[name] = path.relative(ROOT, file);
    return path.relative(ROOT, file);
  };

  try {
    // --- 5. 真实登录表单 ---------------------------------------------------
    await cdp.send("Page.navigate", { url: BASE + "/" }, sid);
    await waitFor(`document.querySelector('.auth-card input') !== null`, "登录表单出现", 40000);
    check("U7", "打开真站点出现登录表单", true, "input 数=" + (await evaluate(`document.querySelectorAll('.auth-card input').length`)));

    const filled = await evaluate(`(() => {
      const inputs = [...document.querySelectorAll('.auth-card input')];
      if (inputs.length < 2) return 0;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      const values = [${JSON.stringify(STUDENT.username)}, ${JSON.stringify(STUDENT.password)}];
      inputs.forEach((el, i) => {
        setter.call(el, values[i] || '');
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      return inputs.length;
    })()`);
    report.samples = { filledInputs: filled };
    await evaluate(click(".auth-submit"));
    let loginOutcome = { shell: false, error: "" };
    {
      const deadline = Date.now() + 40000;
      while (Date.now() < deadline) {
        const state = await evalJSON(`const shell = document.querySelector('.app-shell'); const err = document.querySelector('.auth-error'); return { shell: !!shell, error: err ? err.textContent.trim() : '' };`);
        if (state && (state.shell || state.error)) { loginOutcome = state; break; }
        await sleep(300);
      }
    }
    check("U8", "用真实登录表单登录成功（进入 app-shell）", loginOutcome.shell === true, loginOutcome.error ? "页面提示：" + loginOutcome.error : "hash=" + (await evaluate("location.hash")));
    if (!loginOutcome.shell) throw new Error("登录失败：" + (loginOutcome.error || "超时"));

    // --- 6. 真实点击导航去看词选义 -----------------------------------------
    check("U9", "侧边栏存在「看词选义」导航", await evaluate(`document.querySelector('.side-nav button[title="看词选义"]') !== null`));
    await evaluate(click('.side-nav button[title="看词选义"]'));
    await waitFor(`document.querySelectorAll('.meaning-options button').length >= 2`, "词义练习题目加载", 40000);
    const question0 = await evalJSON(`
      const card = document.querySelector('.meaning-card');
      return { prompt: (card.querySelector('.meaning-prompt') || {}).textContent || '', options: [...document.querySelectorAll('.meaning-options button')].map(b => b.textContent.trim()), counter: (card.querySelector('.meaning-counter')||{}).textContent||'' };
    `);
    report.samples = { question0 };
    check("U10", "词义练习渲染出真实题目与选项", question0.options.length >= 2, `第 ${question0.counter.trim()} 题 · ${question0.prompt.trim().slice(0, 40)} · 选项 ${question0.options.length} 个`);

    // --- 7. 真实点答案，直到答错 ------------------------------------------
    let wrongInfo = null;
    for (let attempt = 0; attempt < 8 && !wrongInfo; attempt += 1) {
      const count = await evaluate(`document.querySelectorAll('.meaning-options button').length`);
      const pick = attempt % Math.max(1, count);
      await evaluate(click(".meaning-options button", pick));
      await sleep(700);
      const feedback = await evalJSON(`
        const fb = document.querySelector('.meaning-feedback');
        const card = document.querySelector('.meaning-card');
        return {
          className: fb ? fb.className : '',
          text: fb ? fb.textContent.trim().slice(0, 120) : '',
          prompt: (card.querySelector('.meaning-prompt') || {}).textContent || '',
          selected: document.querySelector('.meaning-options button.is-selected, .meaning-options button.is-wrong')?.textContent?.trim() || ''
        };
      `);
      if (feedback.className.includes("is-wrong")) {
        wrongInfo = feedback;
        break;
      }
      // 答对了：等自动进入下一题，或手动下一题
      await evaluate(`(() => {
        const btns = [...document.querySelectorAll('.meaning-question-nav button')];
        const next = btns[btns.length - 1];
        if (next && !next.disabled) next.click();
        return true;
      })()`);
      await sleep(1200);
    }
    check("U11", "在真实页面上答错一道题（拿到错答态）", Boolean(wrongInfo), wrongInfo ? wrongInfo.text.slice(0, 90) : "8 次尝试都没答错");
    if (!wrongInfo) throw new Error("没能制造一次错答，后续就地讲解无法验证");

    // --- 8. 就地讲解（感知 + 展示） ----------------------------------------
    check("U12", "答错后出现助教入口 .meaning-ask", await evaluate(`document.querySelector('.meaning-ask button') !== null`));
    await evaluate(click(".meaning-ask button.primary"));
    await waitFor(`document.querySelector('.agent-inline-teach .agent-card-headline') !== null`, "就地讲解卡片出现", OPTION_TIMEOUT);
    const inline = await evalJSON(`
      const host = document.querySelector('.agent-inline-teach');
      const card = host && host.querySelector('.agent-card');
      const jsonLeak = /^\\s*\\{/.test((host.querySelector('.agent-card-text')||{}).textContent || '');
      return {
        hasCard: !!card,
        headline: (host.querySelector('.agent-card-headline')||{}).textContent || '',
        verdict: (host.querySelector('.agent-card-verdict')||{}).textContent || '',
        sections: host.querySelectorAll('.agent-card-section').length,
        words: [...host.querySelectorAll('.agent-word-chip .agent-word')].map(w => w.textContent.trim()),
        action: (host.querySelector('.agent-card-action')||{}).textContent || '',
        jsonLeak
      };
    `);
    report.samples.inline = inline;
    check("U13", "就地讲解渲染成结构化教学卡片（有结论 + 判定 + 分段 + 行动条）", inline.hasCard && inline.headline.length > 2 && inline.sections >= 2 && inline.action.length > 0, `headline=${inline.headline.slice(0, 60)} sections=${inline.sections}`);
    check("U14", "就地讲解没有把 JSON 原文漏到页面上", inline.jsonLeak === false && !/^\{/.test(inline.headline), "jsonLeak=" + inline.jsonLeak);
    check("U15", "判定行来自服务端题库（不采信模型）", inline.verdict.includes("正确答案"), "verdict=" + inline.verdict.slice(0, 80));
    report.shots.inline = await screenshot("agent-live-inline-teach");
    console.log("    截图：docs/images/agent-live-inline-teach.png");

    // --- 9. 浮动面板 + 零遮挡 ----------------------------------------------
    await evaluate(click(".agent-fab"));
    await waitFor(`document.querySelector('.agent-panel') !== null`, "助教面板打开", 15000);
    const shape = await evalJSON(`
      const root = document.querySelector('.agent-assistant');
      const panel = document.querySelector('.agent-panel');
      const r = panel.getBoundingClientRect();
      const cs = getComputedStyle(panel);
      return {
        cls: root.className,
        position: cs.position,
        width: Math.round(r.width),
        right: Math.round(innerWidth - r.right),
        floatClass: root.classList.contains('agent-float'),
        bodyOpen: document.body.classList.contains('agent-open'),
        fabHidden: getComputedStyle(document.querySelector('.agent-fab')).display,
        viewportWidth: innerWidth
      };
    `);
    report.samples.panel = shape;
    check("U16", "默认形态是浮动面板（agent-float）", shape.floatClass === true, "class=" + shape.cls);
    const DRAWER = shape.width >= shape.viewportWidth - 4;
    if (DOCK) {
      const opened = await evaluate(`(() => { const b = [...document.querySelectorAll(".agent-panel button")].find((x) => /停靠到右侧/.test(x.title || "")); if (!b) return false; b.click(); return true; })()`);
      check("U29", "面板头部有「停靠」形态开关且可点击", opened === true, "toggleFound=" + opened);
      await waitFor(`document.body.classList.contains("agent-dock")`, "切到停靠形态（body.agent-dock）", 8000);
      await sleep(350);
      const dockShape = await evalJSON(`
        const panel = document.querySelector(".agent-panel");
        const r = panel.getBoundingClientRect();
        const m = document.querySelector(".app-content > main");
        const q = m ? m.getBoundingClientRect() : null;
        return {
          bodyDock: document.body.classList.contains("agent-dock"),
          width: Math.round(r.width),
          right: Math.round(innerWidth - r.right),
          mainRightGap: q ? Math.round(innerWidth - q.right) : -1,
          innerWidth: innerWidth,
        };
      `);
      report.samples.dock = dockShape;
      const dockDrawer = dockShape.width >= dockShape.innerWidth - 4;
      check(
        "U30",
        dockDrawer ? "窄屏停靠自动变全屏抽屉（页面恢复全宽）" : "停靠形态：面板占 440px 栏 + 页面让出栏宽（不压内容）",
        dockShape.bodyDock === true && (dockDrawer ? (dockShape.width >= dockShape.innerWidth - 4 && dockShape.mainRightGap <= 40) : (Math.abs(dockShape.width - 440) <= 8 && dockShape.mainRightGap >= 400)),
        "regime=" + (dockDrawer ? "drawer" : "rail") + " width=" + dockShape.width + " right=" + dockShape.right + " mainRightGap=" + dockShape.mainRightGap + " iw=" + dockShape.innerWidth,
      );
    }
    const layoutProbe = await evalJSON(`
      const m = document.querySelector('.app-content > main');
      const r = m ? m.getBoundingClientRect() : null;
      return { mainWidth: r ? Math.round(r.width) : 0, innerWidth: innerWidth, docScroll: document.documentElement.scrollWidth };
    `);
    if (WIDTH_PROBE) {
      check(
        "U28",
        "视口 " + WINDOW + " 下页面布局健康（主内容列 ≥300px 且无横向溢出）",
        layoutProbe.mainWidth >= 300 && layoutProbe.docScroll <= layoutProbe.innerWidth + 1,
        "regime=" + (DRAWER ? "drawer" : "rail") + " main=" + layoutProbe.mainWidth + " iw=" + layoutProbe.innerWidth + " scrollW=" + layoutProbe.docScroll,
      );
    }
    check("U17", DRAWER ? "窄屏抽屉形态：面板占满视口（不让位、不挤瘦页面）" : "面板贴右缘浮起且宽度合理（≈420px）", DRAWER ? (shape.width >= shape.viewportWidth - 4 && shape.right <= 2) : ((shape.position === "fixed" || shape.position === "absolute") && shape.width >= 320 && shape.width <= 620 && shape.right <= 40), `regime=${DRAWER ? "drawer" : "rail"} position=${shape.position} width=${shape.width} right=${shape.right} iw=${shape.viewportWidth}`);
    check("U18", "面板打开时给页面让位（body.agent-open 且 fab 收起）", shape.bodyOpen === true, "bodyOpen=" + shape.bodyOpen + " fabDisplay=" + shape.fabHidden);

    const audit = JSON.parse(
      await evaluate(
        occludeVisible([
          ["选项区", [".meaning-options"]],
          ["答错动作区", [".meaning-ask"]],
          ["就地讲解卡", [".agent-inline-teach"]],
          ["错词栏", [".meaning-review"]],
        ]),
      ),
    );
    report.samples.occlusion = audit;
    const covered = audit.reduce((sum, t) => sum + t.covered, 0);
    const auditSampled = audit.reduce((sum, t) => sum + (t.sampled || 0), 0);
    check(
      "U19",
      (DRAWER ? "窄屏抽屉形态：页面恢复全宽、主内容列不被挤瘦（选项/错词栏仍是自然宽度）" : "浮动面板打开时零遮挡（选项 / 讲解卡 / 错词栏都不被盖，且真的量到了元素）"),
      DRAWER ? (layoutProbe.mainWidth >= layoutProbe.innerWidth - 340 && layoutProbe.docScroll <= layoutProbe.innerWidth + 1) : (covered === 0 && auditSampled > 0),
      audit
        .map((t) => `${t.name}[${t.matched || (t.missing ? "missing" : "?")}]:${t.covered}/${t.sampled}`)
        .join(" "),
    );

    // 面板里真问一句（真模型）
    const asked = await evaluate(`(() => {
      const btns = [...document.querySelectorAll('.agent-quick button')];
      if (!btns.length) return false;
      btns[0].click();
      return btns[0].textContent.trim();
    })()`);
    await waitFor(`document.querySelector('.agent-panel .agent-card-headline') !== null`, "面板内教学卡片出现", OPTION_TIMEOUT);
    const panelCard = await evalJSON(`
      const panel = document.querySelector('.agent-panel');
      const chip = panel.querySelector('.agent-statechip-text');
      return {
        chip: chip ? chip.textContent.trim() : '',
        headline: (panel.querySelector('.agent-card-headline')||{}).textContent || '',
        verdict: (panel.querySelector('.agent-card-verdict')||{}).textContent || '',
        sections: panel.querySelectorAll('.agent-card-section').length,
        wordChips: [...panel.querySelectorAll('.agent-word-chip .agent-word')].map(w => w.textContent.trim())
      };
    `);
    report.samples.panelCard = { asked, ...panelCard };
    check("U20", "面板内问一句，真模型回答渲染成卡片", panelCard.headline.length > 2 && panelCard.sections >= 2, `问「${asked}」→ ${panelCard.headline.slice(0, 60)}`);
    check("U21", "面板顶部状态胶囊显示当前场景/进度", panelCard.chip.length > 0, "caption=" + panelCard.chip);
    report.shots.floatCard = await screenshot("agent-live-float-card");
    console.log("    截图：docs/images/agent-live-float-card.png");

    // --- 9b. 「助教已读」回执：真站点上可见且能展开出快照原文（P1-1 的线上证据） ---
    // P1-1 的验收是「任何一次回答，学生都能点开看到助教实际读到的数据」。此前这条只有
    // HTTP 契约测试 + 本地验证台的 mock 证据，真站点上从没点开过。
    const receiptHead = await evalJSON(`
      const panel = document.querySelector('.agent-panel');
      const arts = [...panel.querySelectorAll('main article.assistant')];
      const last = arts[arts.length - 1];
      const box = last ? last.querySelector('.agent-receipt') : null;
      const head = box ? box.querySelector('.agent-receipt-head') : null;
      const chips = box ? [...box.querySelectorAll('.agent-receipt-chip')].map((c) => c.textContent.trim()) : [];
      const stale = box ? !!box.querySelector('.agent-receipt-note') : false;
      if (head) head.click();
      return { has: !!box, chips, stale, headText: head ? head.textContent.trim() : '' };
    `);
    await sleep(250);
    const receiptOpen = await evalJSON(`
      const panel = document.querySelector('.agent-panel');
      const box = panel.querySelector('.agent-receipt');
      const pre = box ? box.querySelector('.agent-receipt-text') : null;
      const head = box ? box.querySelector('.agent-receipt-head') : null;
      return {
        text: pre ? pre.textContent.trim().slice(0, 300) : '',
        expanded: head ? head.getAttribute('aria-expanded') : '',
        note: box && box.querySelector('.agent-receipt-note') ? box.querySelector('.agent-receipt-note').textContent.trim() : '',
      };
    `);
    report.samples.receipt = { ...receiptHead, ...receiptOpen };
    check(
      "U36",
      "面板回答带「助教已读」回执，点开后能看到快照原文（P1-1 线上）",
      receiptHead.has === true && receiptHead.chips.length > 0 && receiptOpen.expanded === "true" && receiptOpen.text.length > 20,
      `chips=[${receiptHead.chips.join("|")}] expanded=${receiptOpen.expanded} 原文=${JSON.stringify(receiptOpen.text).slice(0, 70)} stale=${receiptHead.stale} note=${JSON.stringify(receiptOpen.note).slice(0, 40)}`,
    );

    // --- 9c. 长回答流式：中途可停止 + 新回答不被拉到文末（线上专属） -------------
    // V2 的另外两条（首屏可读 / 有停止入口）在本地验证台里是 mock 跑的；这里用真服务端 + 真模型
    // 复一遍「可中途停止」，并检查停止后不留半截错误态、下一条回答钉在顶部而不是被拉到文末。
    // --mock 下跳过：mock 的流太快，量不到「流式中」这个中间态。
    if (!USE_MOCK) {
      const longQuestion = "请讲得长一点：用 6 条要点分别说明这个词的词根、常见搭配、易混词、常见错误，每条至少 30 字，再给 3 个英文例句和 2 道自测题。";
      await evaluate(setInput(".agent-panel footer textarea", longQuestion));
      await sleep(200);
      const sentLong = await evaluate(click(".agent-panel footer button"));
      let sawStreaming = false;
      try {
        await waitFor(`document.querySelector('.agent-panel .agent-streambar') !== null`, "长回答进入流式", OPTION_TIMEOUT);
        sawStreaming = true;
      } catch (err) {
        sawStreaming = false;
      }
      const streamProbe = await evalJSON(`
        const panel = document.querySelector('.agent-panel');
        const bar = panel.querySelector('.agent-streambar');
        const stop = panel.querySelector('.agent-stop');
        return {
          bar: !!bar,
          barText: bar ? bar.textContent.trim() : '',
          stopText: stop ? stop.textContent.trim() : '',
          stopClickable: !!stop && stop.disabled !== true && getComputedStyle(stop).display !== 'none',
        };
      `);
      report.samples.streaming = { sentLong, sawStreaming, ...streamProbe };
      check(
        "U31",
        "长回答流式期间出现可点的「停止生成」入口（V2 线上：可中途停止）",
        sentLong === true && sawStreaming === true && streamProbe.bar === true && streamProbe.stopText === "停止生成" && streamProbe.stopClickable === true,
        `sent=${sentLong} streaming=${sawStreaming} bar=${streamProbe.bar} stop=${streamProbe.stopText}/${streamProbe.stopClickable} barText=${JSON.stringify(streamProbe.barText).slice(0, 60)}`,
      );
      let stopped = false;
      if (sawStreaming) {
        await evaluate(click(".agent-panel .agent-stop"));
        try {
          await waitFor(`document.querySelector('.agent-panel .agent-streambar') === null`, "流式已停止", 30000);
          stopped = true;
        } catch (err) {
          stopped = false;
        }
      }
      const afterStop = await evalJSON(`
        const panel = document.querySelector('.agent-panel');
        const arts = [...panel.querySelectorAll('main article.assistant')];
        const last = arts[arts.length - 1];
        const stoppedMark = last ? last.querySelector('.agent-stopped') : null;
        const emptyNote = last ? last.querySelector('.agent-empty-answer') : null;
        const err = panel.querySelector('.agent-error');
        return {
          bar: !!panel.querySelector('.agent-streambar'),
          stoppedMark: stoppedMark ? stoppedMark.textContent.trim() : '',
          emptyNote: emptyNote ? emptyNote.textContent.trim() : '',
          errorShown: !!err,
          errorText: err ? err.textContent.trim().slice(0, 80) : '',
        };
      `);
      // 「busy 真的复位」不能看空输入框上的发送键（空文本本来就禁用），先敲两个字
      // 再确认发送键变可用；这才能区分「停止成功」和「还卡在生成中」。
      await evaluate(setInput(".agent-panel footer textarea", "停"));
      await sleep(200);
      const sendReady = await evaluate(`(() => { const b = document.querySelector('.agent-panel footer button'); return !!b && b.disabled === false; })()`);
      await evaluate(setInput(".agent-panel footer textarea", ""));
      await sleep(150);
      const stopVisible = afterStop.stoppedMark !== "" || afterStop.emptyNote !== "";
      report.samples.stopResult = { ...afterStop, sendReadyAfterTyping: sendReady, stopVisible };
      check(
        "U32",
        "点「停止生成」后有可见的停止结果、busy 复位（还能继续输入发送）、不留错误态（V2 线上）",
        stopped === true && afterStop.bar === false && afterStop.errorShown === false && stopVisible === true && sendReady === true,
        `stopped=${stopped} bar=${afterStop.bar} stoppedMark=${JSON.stringify(afterStop.stoppedMark)} empty=${JSON.stringify(afterStop.emptyNote)} error=${afterStop.errorShown} sendReady=${sendReady}`,
      );

      // 再问一次（快捷动作），让消息区真的堆起来，然后看最新一条回答是不是钉在面板顶部。
      await evaluate(`(() => { const b = document.querySelector('.agent-panel .agent-quick button'); if (!b || b.disabled) return false; b.click(); return true; })()`);
      try {
        await waitFor(
          `(() => { const a = [...document.querySelectorAll('.agent-panel main article.assistant')]; const last = a[a.length - 1]; return !!last && !last.querySelector('.agent-skeleton') && (!!last.querySelector('.agent-card-headline') || !!last.querySelector('.agent-markdown')); })()`,
          "停止后再问一条并拿到回答",
          OPTION_TIMEOUT,
        );
      } catch (err) {
        /* 拿不到也照量，下面按实际几何判 */
      }
      const pinProbe = await evalJSON(`
        const panel = document.querySelector('.agent-panel');
        const main = panel.querySelector('main');
        const arts = [...main.querySelectorAll('article.assistant')];
        const last = arts[arts.length - 1];
        const box = main.getBoundingClientRect();
        const rect = last.getBoundingClientRect();
        const overflow = main.scrollHeight - main.clientHeight;
        return {
          answers: arts.length,
          lastTop: Math.round(rect.top),
          boxTop: Math.round(box.top),
          boxBottom: Math.round(box.bottom),
          scrollTop: Math.round(main.scrollTop),
          overflow: Math.round(overflow),
          gapToBottom: Math.round(main.scrollHeight - main.scrollTop - main.clientHeight),
        };
      `);
      report.samples.pin = pinProbe;
      check(
        "U33",
        "新回答钉在面板顶部（不被拉到文末，P2-3① 线上复核）",
        pinProbe.lastTop >= pinProbe.boxTop - 24 && pinProbe.lastTop <= pinProbe.boxTop + 220 && pinProbe.gapToBottom > 24,
        `answers=${pinProbe.answers} lastTop=${pinProbe.lastTop} box=[${pinProbe.boxTop},${pinProbe.boxBottom}] scrollTop=${pinProbe.scrollTop} overflow=${pinProbe.overflow} gapToBottom=${pinProbe.gapToBottom}`,
      );
    }


    // --- 10. 收起面板，页面恢复 --------------------------------------------
    await evaluate(click(".agent-fab"));
    await waitFor(`document.querySelector('.agent-panel') === null`, "面板收起", 10000);
    const closed = await evalJSON(`
      return { bodyOpen: document.body.classList.contains('agent-open'), fabVisible: getComputedStyle(document.querySelector('.agent-fab')).display !== 'none' };
    `);
    check("U22", "收起后页面恢复全宽（agent-open 移除、入口按钮回来）", closed.bodyOpen === false && closed.fabVisible === true, `bodyOpen=${closed.bodyOpen} fabVisible=${closed.fabVisible}`);
    report.shots.closed = await screenshot("agent-live-float-closed");
    console.log("    截图：docs/images/agent-live-float-closed.png");

    // --- 11. 六场景页面：真站点的「页面 → 感知 → 胶囊」（本轮新增） ------------
    // U19 只证明 meaning 页不遮挡、U21 只证明 meaning 页的胶囊。这一组换到另外两个
    // 本轮修好的场景页（同步训练 / 语法专题），验证三件事：页面真的把 §5 场景字段
    // 发给了助教、胶囊显示的是服务端认可的场景名、浮动面板在这两页上同样零遮挡。
    const scenePages = [
      {
        key: "tongbu",
        label: "同步训练",
        navTitle: "同步训练",
        roots: [".tb-items", ".tb-block", ".tongbu-main", ".tongbu-page"],
      },
      {
        key: "grammar",
        label: "语法专题",
        navTitle: "语法专题",
        // 语法页默认落在小学知识卡专题（isCardTopic：只有要点、没有 #practice），
        // 先切到带北京中考真题的 g-nouns（topics.js：15 题）才能量到真正的题目区。
        pre: `(() => { const b = document.querySelector('.gr2-item[data-topic-id="g-nouns"]'); if (!b) return false; b.scrollIntoView({ block: "center" }); b.click(); return true; })()`,
        roots: [".gr2-qgroup", "#practice", ".gr2-detail", ".grammar-page"],
      },
    ];
    const scenePageResults = [];
    for (const page of scenePages) {
      await evaluate(click(`.side-nav button[title="${page.navTitle}"]`));
      await waitFor(`document.querySelector('${page.roots.join(", ")}') !== null`, page.label + " 页面渲染", 30000);
      if (page.pre) {
        await evaluate(page.pre);
        await sleep(500);
      }
      await evaluate(`(() => { const panel = document.querySelector('.agent-panel'); if (panel) return true; const fab = document.querySelector('.agent-fab'); if (fab && getComputedStyle(fab).display !== 'none') fab.click(); return true; })()`);
      await waitFor(`document.querySelector('.agent-panel') !== null`, page.label + " 助教面板打开", 15000);
      const chipText = await evaluate(`(() => { const el = document.querySelector('.agent-statechip-text'); return el ? el.textContent.trim() : ''; })()`);
      const audit = JSON.parse(await evaluate(occludeVisible([["" + page.label + "内容区", page.roots]])));
      // 几何证据：把面板 rect、视口、main rect 一起记下来。
      // 只有「面板 rect 和内容 rect 真的在水平方向相邻但不重叠」才说明零遮挡不是空断言。
      const geom = JSON.parse(
        await evaluate(
          `(() => {
            const p = document.querySelector(".agent-panel") || document.querySelector(".agent-assistant");
            const r = p ? p.getBoundingClientRect() : null;
            const m = document.querySelector(".app-content > main");
            const q = m ? m.getBoundingClientRect() : null;
            return JSON.stringify({
              panelRect: r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] : null,
              mainRect: q ? [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)] : null,
              viewport: [innerWidth, innerHeight],
            });
          })()`,
        ),
      );
      const drawer2 = geom.panelRect ? geom.panelRect[2] >= geom.viewport[0] - 4 : false;
      const mainW = geom.mainRect ? geom.mainRect[2] : 0;
      const covered = audit.reduce((sum, t) => sum + (t.covered || 0), 0);
      const sampled = audit.reduce((sum, t) => sum + (t.sampled || 0), 0);
      scenePageResults.push({ page: page.key, chip: chipText, occlusion: audit, geom });
      check("U24-" + page.key, "六场景页面真站点：" + page.label + " 的胶囊显示服务端场景名", chipText.includes(page.label), "chip=" + chipText);
      check(
        "U25-" + page.key,
        (drawer2 ? "六场景页面真站点：" + page.label + " 窄屏抽屉形态：页面恢复全宽（不让位）" : "六场景页面真站点：" + page.label + " 上浮动面板零遮挡（且真的量到了元素）"),
        drawer2 ? (mainW >= geom.viewport[0] - 340) : (covered === 0 && sampled > 0),
        audit.map((t) => t.name + "[" + (t.matched || (t.missing ? "missing" : "?")) + "]:" + t.covered + "/" + t.sampled + (t.rect ? "@" + t.rect.join(",") : "")).join(" ") +
          " | viewport=" + geom.viewport.join("x") + " panel=" + JSON.stringify(geom.panelRect) + " main=" + JSON.stringify(geom.mainRect),
      );
      // 浮动栏只允许「让位」，不允许把页面挤到读不下去：
      // 语法专题三栏骨架在视口断点下会把题目列压到 ~120px（实测），
      // 这条断言就是为了让那种回归再也混不过去。
      const widths = audit.map((t) => (t.rect ? t.rect[2] : 0));
      const minWidth = widths.length ? Math.min(...widths) : 0;
      check(
        "U26-" + page.key,
        "六场景页面真站点：" + page.label + " 的题目列没被浮动栏挤瘦（≥300px）",
        minWidth >= 300,
        "宽度=" + widths.join("/") + "px",
      );
        if (WIDTH_PROBE) {
          const ov = JSON.parse(await evaluate(`(() => { const de = document.documentElement; return JSON.stringify({ sw: de.scrollWidth, iw: innerWidth }); })()`));
          check(
            "U27-" + page.key,
            "六场景页面真站点：" + page.label + " 在 window=" + WINDOW + " 下没有横向溢出",
            ov.sw <= ov.iw + 1,
            "scrollWidth=" + ov.sw + " innerWidth=" + ov.iw,
          );
        }
      report.shots["scene-" + page.key] = await screenshot("agent-live-" + page.key + "-capsule");
      await evaluate(click(".agent-fab"));
      await waitFor(`document.querySelector('.agent-panel') === null`, page.label + " 面板收起", 10000);
    }
report.samples.scenePages = scenePageResults;
    // --- 11b. 阅读理解：选词浮条 + 就地讲解（P0-3 的线上证据） -------------------
    // 契约 P0-3 的验收是「任意段落选中一个词，能在原地看到释义与朗读，无需打开面板」。
    // 前面的六场景段只覆盖了词义练习 / 同步训练 / 语法专题，阅读页从来没在真站点上真的划过词。
    // 这里模拟一次真实选区（Range + mouseup），再量浮条与就地卡片，且全程面板是收起的。
    await evaluate(click('.side-nav button[title="英语阅读"]'));
    await sleep(900);
    await evaluate(`(() => {
      if (document.querySelector('.article-body .reading-paragraph')) return true;
      const item = document.querySelector('.article-list .article-list-item');
      if (item) { item.click(); return true; }
      return false;
    })()`);
    await waitFor(`document.querySelector('.article-body .reading-paragraph') !== null`, "阅读理解正文渲染", 30000);
    // 先把段落滚进视口、等滚动停稳再划词：阅读页 handleScroll 会在滚动的下一帧
    // 收起浮条（这是真实行为），选区若在滚动还没停时建立，会被那一帧的 hideSelection 吃掉
    // ——1104px 视口的停靠形态实测踩过这个坑（选区有效、浮条却不见了）。
    await evaluate(`(() => { const para = document.querySelector('.article-body .reading-paragraph'); if (!para) return false; para.scrollIntoView({ block: 'center', behavior: 'instant' }); return true; })()`);
    await sleep(900);
    const pickedWord = await evaluate(`(() => {
      const para = document.querySelector('.article-body .reading-paragraph');
      if (!para) return '';
      const target = para.querySelector('.english-text') || para;
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      let node = null, found = '';
      while (walker.nextNode()) {
        const t = String(walker.currentNode.textContent || '');
        const m = t.match(/[A-Za-z][A-Za-z'\-]{2,}/);
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
    let barProbe = { bar: false, buttons: [], left: 0, top: 0, width: 0, height: 0, inViewport: false };
    try {
      await waitFor(`document.querySelector('.reading-select-bar') !== null`, "选词浮条出现", 8000);
      barProbe = await evalJSON(`
        const bar = document.querySelector('.reading-select-bar');
        if (!bar) return { bar: false, buttons: [], left: 0, top: 0, width: 0, height: 0, inViewport: false };
        const r = bar.getBoundingClientRect();
        return {
          bar: true,
          buttons: [...bar.querySelectorAll('button')].map((b) => b.textContent.trim()),
          left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height),
          inViewport: r.top >= 0 && r.left >= 0 && r.top <= innerHeight && r.width > 0,
        };
      `);
    } catch (err) {
      /* 没等到就按实际结果判，下面是硬断言 */
    }
    const readingDiag = await evalJSON(`
      const sel = window.getSelection();
      const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
      const r = range ? range.getBoundingClientRect() : null;
      const body = document.querySelector('.article-body');
      const para = document.querySelector('.article-body .reading-paragraph');
      const cs = para ? getComputedStyle(para) : null;
      return {
        selection: sel ? String(sel).slice(0, 60) : '',
        collapsed: sel ? sel.isCollapsed : null,
        rangeCount: sel ? sel.rangeCount : -1,
        rect: r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] : null,
        bodyRect: body ? (() => { const b = body.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; })() : null,
        paraDisplay: cs ? cs.display : '',
        paraVisibility: cs ? cs.visibility : '',
        paraWidth: para ? Math.round(para.getBoundingClientRect().width) : 0,
        innerWidth: innerWidth, innerHeight: innerHeight,
        dock: document.body.classList.contains('agent-dock'),
        panelOpen: !!document.querySelector('.agent-panel'),
      };
    `);
    report.samples.readingDiag = readingDiag;
    report.samples.readingBar = { pickedWord, ...barProbe };
    check(
      "U34",
      "阅读理解：选中一个词原地浮出「朗读 / 讲解 / 入册」（P0-3 线上）",
      pickedWord !== "" && barProbe.bar === true && barProbe.buttons.includes("讲解") && barProbe.buttons.includes("入册") && barProbe.inViewport === true,
      `选中=${JSON.stringify(pickedWord)} 按钮=[${barProbe.buttons.join("/")}] rect=${barProbe.left},${barProbe.top} ${barProbe.width}x${barProbe.height}`,
    );
    const askedInline = await evaluate(`(() => { const b = [...document.querySelectorAll('.reading-select-bar button')].find((x) => x.textContent.trim() === '讲解'); if (!b) return false; b.click(); return true; })()`);
    try {
      await waitFor(`document.querySelector('.reading-inline-teach .agent-card-headline') !== null`, "阅读就地讲解卡出现", OPTION_TIMEOUT);
    } catch (err) {
      /* 同样按实际结果判 */
    }
    const readingInline = await evalJSON(`
      const host = document.querySelector('.reading-inline-teach');
      const head = host ? host.querySelector('.agent-card-headline') : null;
      return {
        inline: !!host,
        headline: head ? head.textContent.trim() : '',
        sections: host ? host.querySelectorAll('.agent-card-section').length : 0,
        barGone: document.querySelector('.reading-select-bar') === null,
        errorText: host && host.querySelector('.agent-inline-error') ? host.querySelector('.agent-inline-error').textContent.trim().slice(0, 80) : '',
      };
    `);
    const readAudit = JSON.parse(await evaluate(occludeVisible([["阅读正文段", [".article-body .reading-paragraph"]]])));
    const readCovered = readAudit.reduce((sum, t) => sum + (t.covered || 0), 0);
    const readSampled = readAudit.reduce((sum, t) => sum + (t.sampled || 0), 0);
    report.samples.readingInline = { askedInline, ...readingInline, occlusion: readAudit };
    check(
      "U35",
      "阅读理解：就地讲解卡展开在本段下方、不遮挡正文（P0-3 线上）",
      askedInline === true && readingInline.inline === true && readingInline.headline.length > 2 && readingInline.sections >= 1 && readCovered === 0 && readSampled > 0,
      `点讲解=${askedInline} inline=${readingInline.inline} headline=${JSON.stringify(readingInline.headline).slice(0, 60)} sections=${readingInline.sections} 遮挡=${readCovered}/${readSampled} ${readingInline.errorText}`,
    );
    report.shots.reading = await screenshot("agent-live-reading-select");
    console.log("    截图：docs/images/agent-live-reading-select.png");



    const errs = report.consoleErrors.filter((e) => e.type === "error" || e.type === "exception");
    check("U23", "交互全过程没有 JS 报错", errs.length === 0, errs.length ? JSON.stringify(errs.slice(0, 3)) : "0 条");
  } catch (error) {
    check("UX", "UI 流程未抛异常", false, String(error && error.message ? error.message : error));
    report.failure = String(error && error.stack ? error.stack : error);
  }

  return finish(report, checks.some((c) => !c.ok) ? 1 : 0);
}

async function finish(report, code) {
  report.finishedAt = new Date().toISOString();
  report.passed = checks.filter((c) => c.ok).length;
  report.failed = checks.filter((c) => !c.ok).length;
  report.exitCode = code;
  const file = path.join(OUT_DIR, "report-ui-" + report.mode + TAG + ".json");
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(file, JSON.stringify(report, null, 2), "utf8");
  console.log("");
  console.log(`=== UI 线上测试（${report.mode}）：${report.passed} 通过 / ${report.failed} 失败 ===`);
  console.log("报告：" + path.relative(ROOT, file));
  for (const c of checks.filter((x) => !x.ok)) console.log("  - " + c.id + " " + c.label + " :: " + c.detail);
  cleanup();
  process.exit(code);
}

main().catch(async (error) => {
  console.error("online-agent-ui-e2e 崩溃：" + (error && error.stack ? error.stack : error));
  const file = path.join(OUT_DIR, "report-ui-" + (USE_MOCK ? "mock" : "live") + TAG + ".json");
  await fs.mkdir(OUT_DIR, { recursive: true }).catch(() => {});
  await fs.writeFile(file, JSON.stringify({ mode: USE_MOCK ? "mock" : "live", crashed: String(error && error.stack ? error.stack : error), checks }, null, 2), "utf8").catch(() => {});
  cleanup();
  process.exit(1);
});
