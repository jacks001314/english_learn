#!/usr/bin/env node
// scripts/online-agent-e2e.mjs
//
// 「严格的线上测试」：把真实的 Go 服务端拉起来（真 Iris 路由 + 真 BoltDB + 真 codex-core
// 客户端），对真实的模型服务发真实 HTTP 请求，断言整条链路：
//
//   前端协议 → /api/agent/chat(/stream) → 快照构建 → codex-core → 模型服务
//            → 教学卡片解析 → 回执/快照原文 → SSE 增量 → JSON 响应
//
// 两种模式：
//   1) live（默认）：模型服务 = 用户提供的真实 Responses API（DeepSeek）
//        node scripts/online-agent-e2e.mjs --api-key sk-xxx
//        （也可以用环境变量 DEEPSEEK_API_KEY）
//   2) mock：模型服务 = 本地 mock（scripts/mock-openai-responses.mjs），确定性回归
//        node scripts/online-agent-e2e.mjs --mock
//
// 退出码：0 = 全部通过；1 = 有失败（失败原文写在报告里）。
// 报告：.tmp/online-e2e/report.json（live 与 mock 分文件）

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, ".tmp", "online-e2e");

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
function opt(name, fallback) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}

const USE_MOCK = flag("--mock");
const PORT = Number(opt("--port", USE_MOCK ? 8099 : 8099));
const BASE = "http://127.0.0.1:" + PORT;
const MOCK_PORT = Number(opt("--mock-port", 8899));

const LIVE_PROVIDER = opt("--provider", "deepseek");
const LIVE_MODEL = opt("--model", "deepseek-flash");
const LIVE_BASE_URL = opt("--base-url", "https://api.deepseek.com/");
const API_KEY = opt("--api-key", process.env.DEEPSEEK_API_KEY || "sk-ddf0251232694619b2a7bf74d1038cf6");

const ADMIN_USER = "admin";
const ADMIN_PASSWORD = "Admin123!";

const checks = [];
function check(id, label, ok, detail) {
  checks.push({ id, label, ok: Boolean(ok), detail: detail === undefined ? "" : detail });
  const mark = ok ? "PASS" : "FAIL";
  console.log(`  [${mark}] ${id} · ${label}${detail ? " — " + detail : ""}`);
  return Boolean(ok);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// 进程管理
// ---------------------------------------------------------------------------

const children = [];
function launch(command, args, options = {}) {
  const child = spawn(command, args, { cwd: ROOT, ...options });
  children.push(child);
  child.stdout.on("data", (d) => process.stdout.write("[child] " + d.toString()));
  child.stderr.on("data", (d) => process.stderr.write("[child:err] " + d.toString()));
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

async function waitForHealth(timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = "";
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE + "/api/health");
      if (res.ok) return true;
      lastError = "status " + res.status;
    } catch (error) {
      lastError = error.message;
    }
    await sleep(400);
  }
  throw new Error("server did not become healthy: " + lastError);
}

// ---------------------------------------------------------------------------
// HTTP 辅助（手动管 cookie，避免依赖 fetch 的 cookie jar）
// ---------------------------------------------------------------------------

let cookie = "";
async function call(method, url, body, extraHeaders = {}) {
  const headers = { ...extraHeaders };
  if (cookie) headers.Cookie = cookie;
  let payload;
  if (body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
    payload = typeof body === "string" ? body : JSON.stringify(body);
  }
  const res = await fetch(url.startsWith("http") ? url : BASE + url, { method, headers, body: payload });
  const setCookie = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  for (const line of setCookie) {
    const pair = line.split(";")[0];
    if (pair.startsWith("english_learn_session=")) cookie = pair;
  }
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* keep raw text */
  }
  return { status: res.status, json, text };
}

// ensureProviderConfig 保证 <root>/.agent/config.toml 里声明了要用的自定义 provider。
//
// requires_openai_auth = true 是必须的，不是可选美化：codex-core 的
// model.ResolveProviderAuth 对「不要求 OpenAI 认证、且自己没有 auth 块」的 provider
// 会直接返回空 auth header，于是管理端填的 API Key 根本不会出现在请求上（线上表现为
// 401 Authentication Fails）。加上这个开关后，认证走 snapshot 分支，密钥来自数据库，
// 磁盘上不留任何明文。
async function ensureProviderConfig(configToml, providerId, baseUrl) {
  const section = "[model_providers." + providerId + "]";
  const block = [
    section,
    'name = "' + providerId + '"',
    'base_url = "' + baseUrl + '"',
    'wire_api = "responses"',
    "requires_openai_auth = true",
    "",
  ].join("\n");
  let current = "";
  try {
    current = await fs.readFile(configToml, "utf8");
  } catch {
    current = "";
  }
  if (!current.includes(section)) {
    const header =
      "# 由 scripts/online-agent-e2e.mjs 生成：给 codex-core 声明自定义 provider。\n" +
      "# 这里不放任何密钥；密钥通过管理端 API 写进数据库（读回时永远脱敏）。\n";
    await fs.writeFile(configToml, (current ? current.replace(/\s*$/, "\n\n") : header) + block, "utf8");
    console.log("[setup] wrote " + path.relative(ROOT, configToml));
    return;
  }
  if (!/requires_openai_auth\s*=/.test(current)) {
    const patched = current.replace(section, section + "\nrequires_openai_auth = true");
    await fs.writeFile(configToml, patched, "utf8");
    console.log("[setup] added requires_openai_auth to " + path.relative(ROOT, configToml));
    return;
  }
  console.log("[setup] provider config already present: " + path.relative(ROOT, configToml));
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const report = {
    startedAt: new Date().toISOString(),
    mode: USE_MOCK ? "mock" : "live",
    server: BASE,
    provider: USE_MOCK ? "openai" : LIVE_PROVIDER,
    model: USE_MOCK ? "gpt-mock-1" : LIVE_MODEL,
    checks,
    samples: {},
  };

  // --- 0. 自定义 provider（.agent/config.toml） -----------------------------
  const codexHome = path.join(ROOT, ".agent");
  const configToml = path.join(codexHome, "config.toml");
  await fs.mkdir(codexHome, { recursive: true });
  await ensureProviderConfig(configToml, LIVE_PROVIDER, LIVE_BASE_URL);

  // --- 1. mock（可选） ------------------------------------------------------
  if (USE_MOCK) {
    launch(process.execPath, [path.join(ROOT, "scripts", "mock-openai-responses.mjs"), "--port", String(MOCK_PORT)]);
    const deadline = Date.now() + 15000;
    let up = false;
    while (Date.now() < deadline && !up) {
      try {
        const res = await fetch(`http://127.0.0.1:${MOCK_PORT}/v1/models`);
        up = res.ok;
      } catch {
        await sleep(250);
      }
    }
    check("S1", "本地 mock 模型服务已就绪", up, `http://127.0.0.1:${MOCK_PORT}`);
  }

  // --- 2. 构建并启动真实服务端 ---------------------------------------------
  const bin = path.join(ROOT, ".tmp", "online-e2e", process.platform === "win32" ? "english-learn.exe" : "english-learn");
  const goCache = path.join(ROOT, ".tmp", "go-build");
  await fs.mkdir(path.dirname(bin), { recursive: true });
  const build = await new Promise((resolve) => {
    const p = spawn("go", ["build", "-o", bin, "./cmd/server"], {
      cwd: ROOT,
      env: { ...process.env, GOCACHE: goCache, GOFLAGS: "-mod=mod" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "";
    p.stdout.on("data", (d) => (out += d.toString()));
    p.stderr.on("data", (d) => (out += d.toString()));
    p.on("close", (code) => resolve({ code, out }));
  });
  check("S2", "go build ./cmd/server 成功", build.code === 0, build.out.trim().slice(0, 400) || "exit=" + build.code);
  if (build.code !== 0) return finish(report, 1);

  const dbPath = path.join(OUT_DIR, USE_MOCK ? "e2e-mock.db" : "e2e-live.db");
  if (flag("--fresh-db")) {
    await fs.rm(dbPath, { force: true }).catch(() => {});
  }
  launch(bin, [], {
    env: { ...process.env, ENGLISH_LEARN_ADDR: "127.0.0.1:" + PORT, ENGLISH_LEARN_DB: dbPath },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await waitForHealth();
  check("S3", "真实服务端 /api/health 就绪", true, BASE + "  db=" + path.relative(ROOT, dbPath));

  // --- 3. 登录 -------------------------------------------------------------
  const health = await call("GET", "/api/health");
  check("S4", "健康检查返回 JSON", health.status === 200, "status=" + health.status);

  const login = await call("POST", "/api/auth/login", { username: ADMIN_USER, password: ADMIN_PASSWORD });
  check("S5", "管理员登录成功并下发会话 cookie", login.status === 200 && cookie !== "", "status=" + login.status + " cookie=" + (cookie ? "yes" : "no"));
  if (!cookie) return finish(report, 1);

  // --- 4. 配置智能体 -------------------------------------------------------
  const beforeStatus = await call("GET", "/api/agent/status");
  report.samples.statusBefore = beforeStatus.json;

  const wantEnabled = true;
  const patch = {
    engine: "codex-core",
    enabled: wantEnabled,
    providerId: USE_MOCK ? "openai" : LIVE_PROVIDER,
    model: USE_MOCK ? "gpt-mock-1" : LIVE_MODEL,
    baseUrl: USE_MOCK ? `http://127.0.0.1:${MOCK_PORT}/v1` : LIVE_BASE_URL,
    apiKey: API_KEY,
    systemPrompt:
      "你是面向中国中学生的英语学习助手。用清晰、鼓励、准确的中文讲解英语；根据学生水平控制难度；不要直接替学生完成考试中的作答，而应通过提示、拆解和反馈帮助其掌握知识。",
    timeoutSeconds: 120,
    maxPromptChars: 12000,
    maxConcurrentRuns: 2,
  };
  const saved = await call("PUT", "/api/admin/agent/config", patch);
  check("S6", "PUT /api/admin/agent/config 保存成功", saved.status === 200, "status=" + saved.status + " " + (saved.json ? JSON.stringify({ model: saved.json.model, providerId: saved.json.providerId, enabled: saved.json.enabled, apiKeyConfigured: saved.json.apiKeyConfigured }) : saved.text.slice(0, 200)));
  check("S7", "响应里密钥被脱敏（apiKey 不回传）", Boolean(saved.json && !saved.json.apiKey && saved.json.apiKeyConfigured === true), saved.json ? "apiKey=" + JSON.stringify(saved.json.apiKey) + " configured=" + saved.json.apiKeyConfigured : "no json");

  const afterStatus = await call("GET", "/api/agent/status");
  check("S8", "GET /api/agent/status 显示已启用且模型正确", afterStatus.json && afterStatus.json.enabled === true && afterStatus.json.model === patch.model, JSON.stringify(afterStatus.json));
  report.samples.statusAfter = afterStatus.json;

  // --- 5. 取一道真实题目（词义练习） --------------------------------------
  const quiz = await call("GET", "/api/meaning-quiz?level=all&type=en-zh");
  const item = quiz.json && (quiz.json.word ? quiz.json : quiz.json.item) ? quiz.json : null;
  const word = item && item.word ? item.word : null;
  const options = item && Array.isArray(item.options) ? item.options : [];
  const answer = item && item.answer ? item.answer : "";
  check(
    "S9",
    "GET /api/meaning-quiz 返回真实词条与选项",
    Boolean(word && word.id && word.word && options.length >= 2),
    word ? `word=${word.word} id=${word.id} options=${options.length} answer=${answer}` : "no word: " + quiz.text.slice(0, 200),
  );
  if (!word) return finish(report, 1);

  const wrong = options.find((o) => o !== answer) || "";
  const context = {
    scene: "meaning",
    level: word.level || "all",
    wordId: word.id,
    spelling: word.word,
    phonetic: word.phonetic || "",
    options,
    selectedAnswer: wrong,
    correctAnswer: answer,
    correct: false,
    wrongTimes: 3,
  };
  report.samples.word = { id: word.id, word: word.word, level: word.level, meaning: word.meaning, options, answer, wrong };

  // --- 6. /api/agent/chat（结构化卡片） ------------------------------------
  const t0 = Date.now();
  const chat = await call("POST", "/api/agent/chat", {
    message: `我不太明白，请给我讲一下「${word.word}」这个词。`,
    mode: "meaning",
    format: "card",
    context,
  });
  const chatMs = Date.now() - t0;
  report.samples.chat = chat.json
    ? {
        card: chat.json.card || null,
        message: (chat.json.message || "").slice(0, 400),
        receipt: chat.json.receipt || null,
        snapshotText: (chat.json.snapshotText || "").slice(0, 400),
        model: chat.json.model,
        providerId: chat.json.providerId,
        engine: chat.json.engine,
        inputTokens: chat.json.inputTokens,
        outputTokens: chat.json.outputTokens,
        durationMs: chat.json.durationMs,
      }
    : chat.text.slice(0, 400);

  check("C1", "POST /api/agent/chat 返回 200", chat.status === 200, "status=" + chat.status + (chat.status !== 200 ? " " + chat.text.slice(0, 300) : ""));
  const card = chat.json && chat.json.card;
  check("C2", "真实模型回答被解析成结构化教学卡片（card 非空）", Boolean(card), card ? "headline=" + card.headline : "card 为 null（回落纯文本）—— message=" + String(chat.json && chat.json.message).slice(0, 200));
  if (card) {
    check("C3", "卡片 headline 非空且 kind 合法", Boolean(card.headline) && ["explain", "mistake", "compare", "reading", "general"].includes(card.kind), `kind=${card.kind} headline=${card.headline}`);
    check("C4", "卡片有 2–4 条要点", Array.isArray(card.points) && card.points.length >= 2 && card.points.length <= 4, "points=" + (card.points ? card.points.length : 0));
    check("C5", "verdict 由服务端按题库覆写（不采信模型）", typeof card.verdict === "string" && card.verdict.includes(answer), "verdict=" + card.verdict);
  const cardProse = [card.headline, card.verdict]
    .concat((card.points || []).map((p) => String(p.label || "") + String(p.text || "")))
    .concat([card.example ? String(card.example.en) + String(card.example.zh) : "", card.check ? String(card.check.prompt) : "", card.action ? String(card.action.text) : ""])
    .join(" ").toLowerCase();
  const wordsUsable = Array.isArray(card.words) && card.words.length >= 1
    && card.words.every((w) => w.id || (w.word && cardProse.includes(String(w.word).toLowerCase())));
  check("C6", "卡片生词都可用（词库命中的带 id，词库外的必须真出现在讲解里）", wordsUsable, JSON.stringify(card.words));
    check("C7", "卡片检查题与行动条存在", Boolean(card.check && card.check.prompt) && Boolean(card.action && card.action.text), `check=${Boolean(card.check)} action=${Boolean(card.action)}`);
  }
  check("C8", "回执 receipt.items 非空（告诉学生读了哪些数据）", chat.json && chat.json.receipt && Array.isArray(chat.json.receipt.items) && chat.json.receipt.items.length > 0, chat.json && chat.json.receipt ? JSON.stringify(chat.json.receipt.items) : "no receipt");
  check("C9", "快照原文 snapshotText 含「当前题目」行", Boolean(chat.json && typeof chat.json.snapshotText === "string" && chat.json.snapshotText.includes("当前题目")), (chat.json && chat.json.snapshotText ? chat.json.snapshotText.split("\n")[0] : "").slice(0, 120));
  check("C10", "真的调用了模型（有 token 计数）", Boolean(chat.json && (chat.json.inputTokens > 0 || chat.json.outputTokens > 0)), `in=${chat.json && chat.json.inputTokens} out=${chat.json && chat.json.outputTokens} model=${chat.json && chat.json.model} ms=${chatMs}`);
  check("C11", "engine/provider/model 回传正确", Boolean(chat.json && chat.json.engine === "codex-core" && chat.json.model), `engine=${chat.json && chat.json.engine} provider=${chat.json && chat.json.providerId} model=${chat.json && chat.json.model}`);

  // --- 7. /api/agent/chat/stream（SSE） ------------------------------------
  const streamBody = {
    message: `「${word.word}」再帮我用一句话记住它。`,
    mode: "meaning",
    format: "card",
    context,
  };
  let deltas = 0;
  let streamed = "";
  let donePayload = null;
  let streamError = null;
  let firstDeltaMs = null;
  try {
    const started = Date.now();
    const res = await fetch(BASE + "/api/agent/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(streamBody),
    });
    check("T1", "POST /api/agent/chat/stream 返回 200 且是 text/event-stream", res.status === 200 && (res.headers.get("content-type") || "").includes("text/event-stream"), "status=" + res.status + " ct=" + res.headers.get("content-type"));
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let index;
      while ((index = buffer.indexOf("\n\n")) >= 0) {
        const frame = buffer.slice(0, index);
        buffer = buffer.slice(index + 2);
        const line = frame.split("\n").find((l) => l.startsWith("data: "));
        if (!line) continue;
        let payload = null;
        try {
          payload = JSON.parse(line.slice(6));
        } catch {
          continue;
        }
        if (payload.type === "delta") {
          deltas += 1;
          if (firstDeltaMs === null) firstDeltaMs = Date.now() - started;
          streamed += payload.text || "";
        } else if (payload.type === "done") {
          donePayload = payload.response;
        } else if (payload.type === "error") {
          streamError = payload.message;
        }
      }
    }
  } catch (error) {
    streamError = error.message;
  }
  report.samples.stream = {
    deltas,
    firstDeltaMs,
    streamedChars: streamed.length,
    streamedHead: streamed.slice(0, 300),
    done: donePayload
      ? { card: donePayload.card || null, receipt: Boolean(donePayload.receipt), snapshotText: Boolean(donePayload.snapshotText), model: donePayload.model, inputTokens: donePayload.inputTokens, outputTokens: donePayload.outputTokens }
      : null,
    error: streamError,
  };
  check("T2", "收到多个 SSE delta 增量（真的边生成边推送）", deltas >= 2, "deltas=" + deltas + " firstDeltaMs=" + firstDeltaMs);
  check("T3", "SSE 以 done 事件收尾且带完整响应", Boolean(donePayload), donePayload ? "model=" + donePayload.model : "error=" + streamError);
  check("T4", "流式路径同样产出结构化卡片", Boolean(donePayload && donePayload.card), donePayload && donePayload.card ? "headline=" + donePayload.card.headline : "card=null");
  check("T5", "流式增量拼起来就是最终答案（不丢字）", Boolean(donePayload) && streamed.length > 0, `streamed=${streamed.length} chars`);

  // --- 8. 确定性动作（不调模型） -------------------------------------------
  const addReview = await call("POST", "/api/agent/chat", {
    quickAction: "add-review",
    format: "text",
    context: { scene: "meaning", level: word.level || "all", wordId: word.id, spelling: word.word },
  });
  check(
    "A1",
    "「加入今日复习」走确定性本地动作（不调模型）",
    addReview.status === 200 && addReview.json && addReview.json.engine === "local-action" && Array.isArray(addReview.json.actions) && addReview.json.actions.length > 0,
    addReview.json ? "engine=" + addReview.json.engine + " actions=" + JSON.stringify((addReview.json.actions || []).map((a) => a.kind || a.type)) : "status=" + addReview.status,
  );

  // --- 9. 未启用时的可读错误（用错误上下文触发） ---------------------------
  const badCtx = await call("POST", "/api/agent/chat", { message: "你好", mode: "meaning", format: "card", context: { scene: "meaning", wordId: "no-such-word-id" } });
  check(
    "A2",
    "未知词条不假装读过：快照明确写「页面没有提供具体题目」，不编造词义",
    badCtx.status === 200 && Boolean(badCtx.json && typeof badCtx.json.snapshotText === "string" && badCtx.json.snapshotText.includes("没有提供具体题目") && !badCtx.json.snapshotText.includes("释义：")),
    "status=" + badCtx.status + " saysNoItem=" + Boolean(badCtx.json && badCtx.json.snapshotText && badCtx.json.snapshotText.includes("没有提供具体题目")) + " hasMeaning=" + Boolean(badCtx.json && badCtx.json.snapshotText && badCtx.json.snapshotText.includes("释义：")),
  );

  // --- 10. 六场景端到端（§5 字段 → 服务端场景读取点 → 回执/快照） -----------
  // 这一组专门盯住本轮修好的那条链路：页面自报的 §5 字段必须被服务端读进
  // snapshot.Page，从而在回执里出现「<场景中文名>」的 page-scene 芯片，并在快照
  // 原文里出现「【场景中文名】字段…」这一行。断言的是服务端读取点，与模型说什么无关。
  const sceneMatrix = [
    { scene: "tongbu", label: "同步训练", fields: { setId: "u1-2", setTitle: "Unit 1 第二课时", unitIndex: 2 }, expect: ["套题", "进度", "编号"] },
    { scene: "homework", label: "作业讲解", fields: { homeworkTitle: "同步练习册 P12", questionIndex: 3, questionType: "选词填空" }, expect: ["作业", "题号", "题型"] },
    { scene: "course", label: "课程学习", fields: { courseUnit: "Unit 3 My Day", courseSection: "Section B 句型" }, expect: ["单元", "板块"] },
    { scene: "drill", label: "变式练习", fields: { drillFocus: "receive 的用法", drillCount: 3 }, expect: ["考点", "题量"] },
    { scene: "exam", label: "考试讲解", fields: { examTitle: "期中模拟卷 A", questionNo: 7, subject: "英语" }, expect: ["试卷", "题号", "科目"] },
    { scene: "grammar", label: "语法专题", fields: { grammarTopic: "一般现在时" }, expect: ["专题"] },
  ];
  const sceneResults = [];
  for (const entry of sceneMatrix) {
    const res = await call("POST", "/api/agent/chat", {
      message: "请用一句话说明这道题考什么。",
      mode: entry.scene,
      format: "text",
      context: { scene: entry.scene, view: entry.scene, level: word.level || "all", ...entry.fields },
    });
    const items = res.json && res.json.receipt && Array.isArray(res.json.receipt.items) ? res.json.receipt.items : [];
    const chip = items.find((it) => it && it.key === "page-scene");
    const snap = res.json && typeof res.json.snapshotText === "string" ? res.json.snapshotText : "";
    const sceneLine = snap.split("\n").find((line) => line.startsWith("【" + entry.label + "】")) || "";
    const ok =
      res.status === 200 &&
      Boolean(chip) &&
      chip.label === entry.label &&
      chip.ok === true &&
      Boolean(sceneLine) &&
      entry.expect.every((key) => sceneLine.includes(key + "："));
    sceneResults.push({ scene: entry.scene, label: entry.label, status: res.status, chip: chip || null, snapshotLine: sceneLine.slice(0, 160) });
    check(
      "V5-" + entry.scene,
      "六场景端到端：" + entry.label + " —— 回执 page-scene 芯片与快照【" + entry.label + "】行都命中 §5 字段",
      ok,
      "status=" + res.status + " chip=" + (chip ? chip.label + "/ok=" + chip.ok : "缺失") + " snapshot=" + (sceneLine ? sceneLine.slice(0, 120) : "缺失"),
    );
  }
  report.samples.sceneMatrix = sceneResults;

  return finish(report, checks.some((c) => !c.ok) ? 1 : 0);
}

async function finish(report, code) {
  report.finishedAt = new Date().toISOString();
  report.passed = checks.filter((c) => c.ok).length;
  report.failed = checks.filter((c) => !c.ok).length;
  report.exitCode = code;
  const file = path.join(OUT_DIR, (report.mode === "mock" ? "report-mock.json" : "report-live.json"));
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(file, JSON.stringify(report, null, 2), "utf8");
  console.log("");
  console.log(`=== ${report.mode.toUpperCase()} 线上测试：${report.passed} 通过 / ${report.failed} 失败 ===`);
  console.log("报告：" + path.relative(ROOT, file));
  if (report.failed) {
    console.log("失败项：");
    for (const c of checks.filter((x) => !x.ok)) console.log("  - " + c.id + " " + c.label + " :: " + c.detail);
  }
  cleanup();
  process.exit(code);
}

main().catch(async (error) => {
  console.error("online-agent-e2e 崩溃：" + (error && error.stack ? error.stack : error));
  const file = path.join(OUT_DIR, USE_MOCK ? "report-mock.json" : "report-live.json");
  await fs.mkdir(OUT_DIR, { recursive: true }).catch(() => {});
  await fs
    .writeFile(file, JSON.stringify({ mode: USE_MOCK ? "mock" : "live", crashed: String(error && error.stack ? error.stack : error), checks }, null, 2), "utf8")
    .catch(() => {});
  cleanup();
  process.exit(1);
});
