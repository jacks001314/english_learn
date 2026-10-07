#!/usr/bin/env node
// 前端静态资源「缓存版本串」守门（无构建链项目的替代品）
//
// 背景：本项目没有构建管线，靠 `?v=<token>` 手工失效浏览器缓存。
//       2026-10-07 线上复查时发现：web/agent.css 的字节改过（新增长回答折叠样式），
//       但 web/index.html 里它的版本串一直是 §14 时的 `20261006-agent-rail-reflow-r2`，
//       老用户会继续吃旧 CSS —— 折叠样式形同不存在，且本地新 profile 的 e2e 测不出来。
//       这个脚本把「字节变了就必须改版本串」变成 CI 可拦的规则。
//
// 规则：
//   1. 扫描 web/index.html 的 href/src 与 web/js/**/*.js 的 import 里所有 `?v=` 引用；
//   2. 同一个目标文件在多处被引用时，版本串必须一致；
//   3. 每个目标文件都要在 docs/agent-asset-versions.json 里登记；
//   4. 目标文件 sha256 变了、但引用处版本串没动 → 直接失败（这是要拦的 bug）；
//      字节变了且版本串也改了 → 通过，并提示可以跑 --update 刷新基线。
//
// 用法：node scripts/check-agent-asset-version.mjs            # 只检查
//       node scripts/check-agent-asset-version.mjs --update   # 刷新基线（写入 docs/agent-asset-versions.json）
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const MANIFEST = path.join(ROOT, "docs", "agent-asset-versions.json");
const UPDATE = process.argv.includes("--update");

const toPosix = (p) => p.split(path.sep).join("/");
const refRe = /(?:href|src)\s*=\s*"([^"]+?)\?v=([^"&"]+)"/g;
const impRe = /(?:from\s+|import\s*\(\s*)['"]([^'"]+?)\?v=([^'"]+)['"]/g;

function walkJs(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkJs(full, out);
    else if (e.isFile() && e.name.endsWith(".js")) out.push(full);
  }
  return out;
}

function resolveRef(ref, fromFile) {
  if (ref.startsWith("/")) return path.join(ROOT, "web", ref.slice(1));
  if (ref.startsWith("./") || ref.startsWith("../")) return path.resolve(path.dirname(fromFile), ref);
  return null; // 裸模块名，不归本守门管
}

const sources = [path.join(ROOT, "web", "index.html"), ...walkJs(path.join(ROOT, "web", "js"))];
const found = new Map(); // target(abs) -> { versions: Map(ver -> refs[]) }
for (const file of sources) {
  const src = fs.readFileSync(file, "utf8");
  const re = file.endsWith(".html") ? refRe : impRe;
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(src)) !== null) {
    const abs = resolveRef(m[1], file);
    if (!abs) continue;
    if (!found.has(abs)) found.set(abs, new Map());
    const versions = found.get(abs);
    if (!versions.has(m[2])) versions.set(m[2], []);
    versions.get(m[2]).push(toPosix(path.relative(ROOT, file)));
  }
}

const problems = [];
const notes = [];
const current = {};
for (const [abs, versions] of [...found.entries()].sort()) {
  const rel = toPosix(path.relative(ROOT, abs));
  if (versions.size > 1) {
    problems.push(`${rel} 被用不同版本串引用：${[...versions.keys()].map((v) => `"${v}"（${versions.get(v).join(", ")}）`).join(" / ")}`);
  }
  if (!fs.existsSync(abs)) { problems.push(`${rel} 被引用但文件不存在`); continue; }
  const digest = crypto.createHash("sha256").update(fs.readFileSync(abs)).digest("hex").slice(0, 16);
  const version = [...versions.keys()][0];
  current[rel] = { version, sha256: digest };
}

let baseline = {};
if (fs.existsSync(MANIFEST)) baseline = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
else if (!UPDATE) problems.push(`缺少基线文件 docs/agent-asset-versions.json（先跑 --update 生成）`);

for (const [rel, now] of Object.entries(current)) {
  const was = baseline[rel];
  if (!was) { if (!UPDATE) problems.push(`${rel} 未在 docs/agent-asset-versions.json 登记（--update 可补齐）`); continue; }
  const sameBytes = was.sha256 === now.sha256;
  const sameVer = was.version === now.version;
  if (sameBytes && sameVer) continue;
  if (sameBytes && !sameVer) { notes.push(`${rel} 版本串变了、字节没变（基线已过期，可 --update）`); continue; }
  if (!sameBytes && !sameVer) { notes.push(`${rel} 字节变且版本串已 bump → 已正确失效缓存（基线已过期，可 --update）`); continue; }
  problems.push(`${rel} 字节已变（${was.sha256} → ${now.sha256}）但版本串仍是 "${now.version}"：浏览器会继续吃旧缓存，必须改引用处的 ?v=`);
}
for (const rel of Object.keys(baseline)) if (!current[rel]) notes.push(`${rel} 已不再被 ?v= 引用（基线可清理）`);

if (UPDATE) {
  fs.writeFileSync(MANIFEST, JSON.stringify(Object.fromEntries(Object.entries(current).sort()), null, 2) + "\n", "utf8");
  console.log(`==> 已刷新基线 docs/agent-asset-versions.json：${Object.keys(current).length} 个资源`);
}

console.log(`==> 缓存版本串守门：扫描 ${sources.length} 个源文件｜?v= 资源 ${found.size} 个`);
for (const n of notes) console.log(`  [note] ${n}`);
if (problems.length) {
  for (const p of problems) console.log(`  [FAIL] ${p}`);
  console.log(`\n❌ 缓存失效检查未通过（${problems.length} 项）。`);
  process.exit(1);
}
console.log("✅ 所有 ?v= 资源的版本串与字节一致（没有「改了字节忘了改版本串」）。");
