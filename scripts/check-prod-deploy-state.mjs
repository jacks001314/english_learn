#!/usr/bin/env node
// 线上部署状态探针（只读）—— 判断「本地 Master 的助教改造」到底有没有真的在线上跑。
//
// 背景：项目线上站点是 http://www.gbw3bao.com（见 docs/deploy.md §1）。
//       本仓库没有构建链，靠 index.html 里的 `?v=` 破缓存，所以「线上 index.html 引用的版本串」
//       就是「线上部署的是哪一版前端」最直接的证据。
//
// 用法：node scripts/check-prod-deploy-state.mjs [--base http://www.gbw3bao.com]
// 退出码：0 = 线上与本地 Master 完全一致；1 = 漂移（线上落后或内容不符）；2 = 线上不可达。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const i = argv.indexOf("--base");
const BASE = (i >= 0 ? argv[i + 1] : "http://www.gbw3bao.com").replace(/\/$/, "");

const localIndex = fs.readFileSync(path.join(ROOT, "web", "index.html"), "utf8");
const pick = (html, file) => {
  const m = html.match(new RegExp(String.raw`["'](?:\.\.?\/)*?[^"']*?` + file.replace(/\./g, "\\.") + String.raw`\?v=([^"']+)["']`));
  return m ? m[1] : null;
};
const localAgentCss = pick(localIndex, "agent.css");
const localMainJs = pick(localIndex, "main.js");

const drift = [];
const same = [];
const note = (ok, label, detail) => {
  (ok ? same : drift).push(`${label}${detail ? " — " + detail : ""}`);
  console.log(`  [${ok ? "OK" : "DRIFT"}] ${label}${detail ? " — " + detail : ""}`);
};

console.log(`==> 线上部署状态探针 · ${BASE}`);
let html;
try {
  const r = await fetch(BASE + "/", { redirect: "follow" });
  html = await r.text();
  note(true, `首页可达`, `HTTP ${r.status} / ${Buffer.byteLength(html)} 字节`);
} catch (e) {
  console.log(`  [FAIL] 线上不可达：${e.message}`);
  process.exit(2);
}

try {
  const h = await fetch(BASE + "/api/health");
  const j = await h.json().catch(() => null);
  note(h.ok && j && j.status === "ok", "/api/health", `HTTP ${h.status} ${j ? JSON.stringify(j) : ""}`);
} catch (e) {
  note(false, "/api/health", e.message);
}

const prodAgentCss = pick(html, "agent.css");
const prodMainJs = pick(html, "main.js");
note(prodAgentCss === localAgentCss, "index.html → agent.css 版本串", `线上 ${prodAgentCss} / 本地 ${localAgentCss}`);
note(prodMainJs === localMainJs, "index.html → main.js 版本串", `线上 ${prodMainJs} / 本地 ${localMainJs}`);

// 标记要落到真正装它们的文件上：main.js 只 import AgentAssistant / learningContext，
// AgentTeachingCard / agentSpeech / add-review 在 AgentAssistant.js 里，
// .agent-statechip 这类样式在 agent.css 里（.agent-inline-teach 在 reading.css）。
try {
  const r = await fetch(`${BASE}/js/components/AgentAssistant.js?v=${prodMainJs}`);
  const js = await r.text();
  const marks = ["AgentTeachingCard", "agentSpeech", "agent-statechip", "agent-float", "add-review"];
  const missing = marks.filter((m) => !js.includes(m));
  note(missing.length === 0, "线上 AgentAssistant.js 含全部助教模块标记", missing.length ? `缺：${missing.join(", ")}` : `${marks.length}/${marks.length}`);
} catch (e) {
  note(false, "线上 AgentAssistant.js", e.message);
}

try {
  const r = await fetch(`${BASE}/agent.css?v=${prodAgentCss}`);
  const css = await r.text();
  const marks = [".agent-statechip", ".agent-receipt", ".agent-answer-fold", ".agent-dock"];
  const missing = marks.filter((m) => !css.includes(m));
  note(missing.length === 0, "线上 agent.css 含全部助教样式标记", missing.length ? `缺：${missing.join(", ")}` : `${marks.length}/${marks.length}`);
} catch (e) {
  note(false, "线上 agent.css", e.message);
}

try {
  const r = await fetch(BASE + "/api/agent/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  note(r.status !== 404, "服务端存在 /api/agent/chat 路由", `HTTP ${r.status}`);
} catch (e) {
  note(false, "/api/agent/chat", e.message);
}

console.log(`\n==> 一致 ${same.length} 项 / 漂移 ${drift.length} 项`);
if (drift.length) {
  console.log("线上与本地 Master 不一致：本地这批助教改造还没有部署上去（改完记得跑 docs/deploy.md 的部署 + 线上验收）。");
  process.exit(1);
}
console.log("线上与本地 Master 一致。");
