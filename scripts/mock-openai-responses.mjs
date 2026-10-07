#!/usr/bin/env node
// scripts/mock-openai-responses.mjs
//
// 本地 mock 的 OpenAI Responses API —— 专供「严格的线上测试」使用。
//
// 它只实现 codex-core 真正会打到的两个端点：
//   POST /v1/responses   stream=false → JSON；stream=true → SSE（response.output_text.delta + response.completed）
//   GET  /v1/models      模型目录；不给的话 RemoteModelsManager 会退回 bundled 目录（仍可用，但不确定）
//
// 回答内容不是瞎编的：它把 codex-core 发来的 instructions / input 当成真的提示词读，
// 从中解析出「场景」和「当前题目（单词 / 题号 / 试卷）」，再按契约 §2 的教学卡片 JSON
// 协议作答。因此整条链路（HTTP 请求 → 服务端快照 → 卡片解析 → SSE 增量）走的都是
// 真实代码，被替换掉的只有最后一步「模型生成」。
//
// 用法：
//   node scripts/mock-openai-responses.mjs [--port 8899] [--once]
//   --once  处理完第一个 /v1/responses 请求后退出（调试用）
//
// 辅助端点（测试脚本用）：
//   GET  /__mock/requests    返回已记录的请求摘要
//   POST /__mock/reset       清空记录

import http from "node:http";
import { Buffer } from "node:buffer";

const argv = process.argv.slice(2);
function argValue(name, fallback) {
  const i = argv.indexOf(name);
  if (i >= 0 && argv[i + 1]) return argv[i + 1];
  return fallback;
}
const PORT = Number(argValue("--port", process.env.MOCK_PORT || 8899));
const ONCE = argv.includes("--once");
const HOST = "127.0.0.1";

// ---------------------------------------------------------------------------
// 提示词解析：从真实请求里还原「场景 + 当前题目」
// ---------------------------------------------------------------------------

const SCENE_LABELS = [
  ["词义练习", "meaning"],
  ["单词测验", "quiz"],
  ["错题分析", "mistake"],
  ["文章阅读", "reading"],
  ["考试讲解", "exam"],
  ["同步训练", "tongbu"],
  ["作业讲解", "homework"],
  ["课程学习", "course"],
  ["变式练习", "drill"],
  ["语法专题", "grammar"],
  ["综合问答", "general"],
];

function promptText(body) {
  const parts = [];
  const push = (value) => {
    if (typeof value === "string" && value.trim()) parts.push(value);
  };
  const input = body && body.input;
  if (typeof input === "string") push(input);
  else if (Array.isArray(input)) {
    for (const item of input) {
      if (!item || typeof item !== "object") continue;
      const content = item.content;
      if (typeof content === "string") push(content);
      else if (Array.isArray(content)) {
        for (const piece of content) {
          if (typeof piece === "string") push(piece);
          else if (piece && typeof piece === "object") push(piece.text);
        }
      }
    }
  }
  push(body && body.instructions);
  return parts.join("\n");
}

function detectScene(text) {
  for (const [label, scene] of SCENE_LABELS) {
    if (text.includes("当前场景：" + label)) return { scene, label };
  }
  for (const [label, scene] of SCENE_LABELS) {
    if (text.includes("【" + label + "】")) return { scene, label };
  }
  return { scene: "general", label: "综合问答" };
}

function firstMatch(text, re) {
  const m = re.exec(text);
  return m && m[1] ? m[1].trim() : "";
}

// renderAgentSnapshot 的当前题目行形如：
//   【当前题目】apple /ˈæpl/（n.） 释义：苹果
function parseItem(text) {
  const head = firstMatch(text, /【当前题目】([^\n]+)/);
  if (!head) return null;
  const word = firstMatch(head, /^([A-Za-z][A-Za-z'’.\- ]*)/);
  const phonetic = firstMatch(head, /(\/[^/\n]+\/)/);
  const pos = firstMatch(head, /（([a-z]+\.)/);
  const meaning = firstMatch(head, /释义：([^\n]+)/);
  const example = firstMatch(text, /例句：([^\n（]+)/);
  return { head, word, phonetic, pos, meaning, example };
}

function parsePageLine(text) {
  const m = /【([^】]+)】([^\n]+)/.exec(text);
  if (!m) return null;
  // 跳过「当前题目 / 本页全景 / 近期错题 / 阅读上下文」这些不是页面字段的行。
  if (["当前题目", "本页全景", "近期错题", "阅读上下文", "当前筛选", "学生画像"].includes(m[1])) return null;
  return { label: m[1], detail: m[2].trim() };
}

// ---------------------------------------------------------------------------
// 教学卡片（契约 §2）
// ---------------------------------------------------------------------------

function buildCard(req) {
  const text = promptText(req.body);
  const { scene, label } = detectScene(text);
  const item = parseItem(text);
  const page = parsePageLine(text);
  const focus = (item && item.word) || "这道题";
  const hasWord = Boolean(item && item.word);
  const meaning = (item && item.meaning) || "";

  const headline = hasWord
    ? `「${item.word}」先看词性，再定它在句中的角色`
    : `${label}：先判断考点，再用排除法收口`;

  const points = [
    {
      label: "考点",
      text: hasWord
        ? `${item.word}${item.pos ? "（" + item.pos + "）" : ""}${meaning ? "，释义是「" + meaning + "」" : ""}。这类题先确定词性，再看句子缺什么成分。`
        : `这题属于${label}，考点是搭配与词义边界，不是拼写。`,
    },
    {
      label: "排除法",
      text: "把明显搭配不通的选项先划掉，剩下的两个用「谁能放进原句且不改意思」来判断。",
    },
    {
      label: "易错点",
      text: hasWord
        ? `最容易混的是近义词与固定搭配，记住 ${item.word} 后面常跟的介词，不要凭中文直译。`
        : "最容易错的是把中文意思直接对译成英文，忽略介词和时态。",
    },
  ];

  const example = hasWord
    ? {
        en: item.example || `I put the word "${item.word}" into my own sentence every day.`,
        zh: `我把「${item.word}」每天放进自己的句子里。`,
      }
    : { en: "Read the whole sentence before you pick an option.", zh: "选之前先把整句读完。" };

  const check = {
    prompt: hasWord ? `30 秒自测：用 ${item.word} 说一句你自己的生活。` : "30 秒自测：把这句话的主语和谓语划出来。",
    answer: hasWord ? `${item.word} —— 说出声，再写下来。` : "主语在前，谓语紧跟，其余都是修饰。",
  };

  const words = hasWord
    ? [{ word: item.word, meaning: meaning || "" }]
    : [];

  const action = {
    label: "30 秒小动作",
    text: hasWord ? `朗读例句两遍，再默写 ${item.word}。` : "把错题的选项抄一遍，标出被排除的原因。",
    kind: "read",
  };

  return {
    card: { kind: scene === "general" ? "general" : "explain", headline, points, example, check, words, action },
    meta: { scene, label, page, item },
  };
}

function cardJSON(card) {
  return JSON.stringify(card);
}

function responsesEnvelope(req, text, model) {
  return {
    id: "resp-mock-1",
    object: "response",
    created_at: Math.floor(Date.now() / 1000),
    status: "completed",
    model: model || "gpt-mock-1",
    output: [
      {
        id: "msg-mock-1",
        type: "message",
        role: "assistant",
        status: "completed",
        content: [{ type: "output_text", text, annotations: [] }],
      },
    ],
    usage: { input_tokens: 128, output_tokens: Math.max(1, Math.ceil(text.length / 4)), total_tokens: 128 + Math.max(1, Math.ceil(text.length / 4)) },
  };
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

const requests = [];

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sendJSON(res, status, payload, headers = {}) {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
}

const MODELS_CATALOG = {
  models: [
    {
      slug: "gpt-mock-1",
      display_name: "Mock Teaching Model",
      description: "Deterministic teaching-card model used by the online E2E harness.",
      visibility: "list",
      supported_in_api: true,
      context_window: 128000,
      truncation_policy: { mode: "bytes", limit: 1000000 },
      supports_reasoning_summary_parameter: false,
      support_verbosity: false,
      supports_parallel_tool_calls: false,
      input_modalities: ["text"],
    },
  ],
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://" + HOST);
  const path = url.pathname;

  if (req.method === "GET" && path === "/v1/models") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", ETag: '"mock-models-1"' });
    res.end(JSON.stringify(MODELS_CATALOG));
    return;
  }

  if (req.method === "GET" && path === "/__mock/requests") {
    sendJSON(res, 200, { count: requests.length, requests });
    return;
  }

  if (req.method === "POST" && path === "/__mock/reset") {
    requests.length = 0;
    sendJSON(res, 200, { ok: true });
    return;
  }

  if (req.method === "POST" && (path === "/v1/responses" || path === "/responses")) {
    let body = {};
    try {
      const raw = await readBody(req);
      body = raw ? JSON.parse(raw) : {};
    } catch (error) {
      sendJSON(res, 400, { error: { message: "invalid JSON body: " + error.message, type: "invalid_request_error" } });
      return;
    }

    const built = buildCard({ body });
    const text = cardJSON(built.card);
    const model = body.model || "gpt-mock-1";
    requests.push({
      at: new Date().toISOString(),
      path,
      stream: body.stream === true,
      model,
      scene: built.meta.scene,
      sceneLabel: built.meta.label,
      page: built.meta.page,
      item: built.meta.item,
      headline: built.card.headline,
      instructionChars: typeof body.instructions === "string" ? body.instructions.length : 0,
      auth: req.headers["authorization"] || "",
      cardBytes: text.length,
    });

    if (ONCE) setTimeout(() => shutdown(), 250);

    if (body.stream !== true) {
      sendJSON(res, 200, responsesEnvelope({ body }, text, model), { "x-request-id": "req-mock-1" });
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "x-request-id": "req-mock-1",
    });
    const write = (type, payload) => {
      res.write("event: " + type + "\n" + "data: " + JSON.stringify(payload) + "\n\n");
    };
    write("response.created", { type: "response.created", response: { id: "resp-mock-1", model } });

    // 按 32 字符切块推送增量，让学生端能看到「正在生成」的真实过程。
    const chunks = [];
    for (let i = 0; i < text.length; i += 32) chunks.push(text.slice(i, i + 32));
    let closed = false;
    res.on("close", () => {
      closed = true;
    });
    for (const chunk of chunks) {
      if (closed) return;
      write("response.output_text.delta", { type: "response.output_text.delta", item_id: "msg-mock-1", output_index: 0, delta: chunk });
      await new Promise((r) => setTimeout(r, 12));
    }
    write("response.output_item.done", {
      type: "response.output_item.done",
      item: { id: "msg-mock-1", type: "message", role: "assistant", content: [{ type: "output_text", text }] },
    });
    write("response.completed", { type: "response.completed", response: responsesEnvelope({ body }, text, model) });
    res.end();
    return;
  }

  sendJSON(res, 404, { error: { message: "mock-openai-responses: no route for " + req.method + " " + path } });
});

server.listen(PORT, HOST, () => {
  console.log(`[mock-openai] listening on http://${HOST}:${PORT} (POST /v1/responses, GET /v1/models)`);
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 500);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
