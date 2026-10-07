// scripts/check-agent-context-contract.mjs —— 助教页面上下文契约守门
// ---------------------------------------------------------------------------
// 契约：docs/agent-ux-implementation-contract.md §5「页面接入契约」
// 做法：把契约 §5 表格第一列登记的字段名当作「允许集合」（唯一事实源仍是契约文档，
//       这里只读取、不复刻），再扫描 web/js 下所有 publishContext({...}) 调用的
//       对象字面量顶层键。出现未登记键即失败——防止页面临时加的字段悄悄流到后端
//       却没人知道（智能体「感知不到页面」的一大来源就是字段各写各的）。
// 输出：列出每个文件的键、未登记键、未使用键（信息级，不阻断）。
// 用法：node scripts/check-agent-context-contract.mjs
//       node scripts/check-agent-context-contract.mjs --verbose
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VERBOSE = process.argv.includes("--verbose");
const CONTRACT = path.join(ROOT, "docs/agent-ux-implementation-contract.md");

// ---------------------------------------------------------------- 读取契约 §5
function sliceSection(text, startMark, endMark) {
  const start = text.indexOf(startMark);
  if (start < 0) return "";
  const end = text.indexOf(endMark, start + startMark.length);
  return end < 0 ? text.slice(start) : text.slice(start, end);
}

const allowed = new Set();
{
  const text = fs.readFileSync(CONTRACT, "utf8");
  const sec5 = sliceSection(text, "## 5.", "## 6.");
  if (!sec5) {
    console.error("❌ 契约文档里找不到 §5「页面接入契约」章节：" + CONTRACT);
    process.exit(1);
  }
  for (const line of sec5.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    const cells = trimmed.split("|");
    if (cells.length < 4) continue;
    const first = cells[1];
    for (const m of first.matchAll(/`([^`]+)`/g)) allowed.add(m[1].trim());
  }
  const extra = sliceSection(text, "## 5.", "## 6.").match(/允许的键集合[^\n]*/);
  if (extra) {
    for (const m of extra[0].matchAll(/`([^`]+)`/g)) allowed.add(m[1].trim());
  }
}
if (allowed.size === 0) {
  console.error("❌ 契约 §5 没解析出任何允许字段，请检查表格格式");
  process.exit(1);
}

// ---------------------------------------------------------------- 扫描前端代码
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "vendor" || entry.name === "lib" || entry.name === "node_modules") continue;
      walk(full, out);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      out.push(full);
    }
  }
  return out;
}

// 从 '(' 开始做括号配对，跳过字符串 / 模板串 / 注释；返回第一个顶层 '{' 的下标。
function findObjectLiteral(src, parenIdx) {
  let depth = 0;
  for (let i = parenIdx; i < src.length; i += 1) {
    const c = src[i];
    if (c === "(" || c === "[" || c === "{") {
      depth += 1;
      if (c === "{" && depth === 2) return i;
      continue;
    }
    if (c === ")" || c === "]" || c === "}") {
      depth -= 1;
      if (depth <= 0) return -1;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") {
      const skip = skipString(src, i);
      if (skip < 0) return -1;
      i = skip;
    }
  }
  return -1;
}

// 从字符串起始引号跳到结束引号，返回结束引号下标；未闭合返回 -1。
function skipString(src, start) {
  const quote = src[start];
  let i = start + 1;
  while (i < src.length) {
    const c = src[i];
    if (c === "\\") {
      i += 2;
      continue;
    }
    if (quote === "`" && c === "$" && src[i + 1] === "{") {
      // 模板串插值：按括号配对跳过（内部允许嵌套字符串）
      let depth = 1;
      i += 2;
      while (i < src.length && depth > 0) {
        const d = src[i];
        if (d === "{") depth += 1;
        else if (d === "}") depth -= 1;
        else if (d === "'" || d === '"' || d === "`") {
          const skip = skipString(src, i);
          if (skip < 0) return -1;
          i = skip;
        }
        i += 1;
      }
      continue;
    }
    if (c === quote) return i;
    i += 1;
  }
  return -1;
}

// 收集对象字面量的顶层键；返回 { keys, spreads }
// 注意：数组与括号要单独计数。CourseView 里 courseUnit 的值是
// `[book.grade, book.semester, section.section].filter(...)`，如果把数组里的逗号
// 当成对象的分隔符，就会把 book / section 误判成字段名（这是真踩过的假阳性）。
function collectKeys(src, braceIdx) {
  const keys = [];
  const spreads = [];
  let depth = 1;      // {} 深度
  let brackets = 0;   // [] 深度
  let parens = 0;     // () 深度
  let i = braceIdx + 1;
  let expectKey = true; // 位于 { 或 , 之后即处于「键位置」
  const top = () => depth === 1 && brackets === 0 && parens === 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "/") {
      const nl = src.indexOf("\n", i);
      i = nl < 0 ? src.length : nl + 1;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end < 0 ? src.length : end + 2;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") {
      const skip = skipString(src, i);
      if (skip < 0) break;
      i = skip + 1;
      expectKey = false;
      continue;
    }
    if (c === "{") {
      depth += 1;
      i += 1;
      continue;
    }
    if (c === "}") {
      depth -= 1;
      if (depth === 0) break;
      i += 1;
      continue;
    }
    if (c === "[") { brackets += 1; i += 1; continue; }
    if (c === "]") { brackets -= 1; i += 1; continue; }
    if (c === "(") { parens += 1; i += 1; continue; }
    if (c === ")") { parens -= 1; i += 1; continue; }
    if (top() && c === ",") {
      expectKey = true;
      i += 1;
      continue;
    }
    if (top() && expectKey) {
      if (src.startsWith("...", i)) {
        const rest = src.slice(i + 3, i + 60).split(/[,}\n]/)[0].trim();
        spreads.push(rest);
        expectKey = false;
        i += 3;
        continue;
      }
      const m = /^[$A-Za-z_][\w$]*/.exec(src.slice(i, i + 80));
      if (m) {
        keys.push(m[0]);
        i += m[0].length;
        expectKey = false;
        continue;
      }
    }
    i += 1;
  }
  return { keys, spreads };
}

const files = walk(path.join(ROOT, "web/js"));
const used = new Set();
const violations = [];
const unregisteredFiles = new Set();
const spreadsFound = [];
let calls = 0;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  const re = /publishContext\s*\(/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const parenIdx = m.index + m[0].length - 1;
    const braceIdx = findObjectLiteral(src, parenIdx);
    if (braceIdx < 0) continue; // 传变量或用别的方式拼装，跳过
    calls += 1;
    const { keys, spreads } = collectKeys(src, braceIdx);
    const line = src.slice(0, m.index).split("\n").length;
    for (const key of keys) used.add(key);
    for (const s of spreads) spreadsFound.push(`${rel}:${line} ...${s}`);
    const bad = keys.filter((k) => !allowed.has(k));
    if (bad.length) {
      violations.push({ rel, line, bad });
      unregisteredFiles.add(rel);
    }
    if (VERBOSE) {
      console.log(`· ${rel}:${line} → ${keys.join(", ") || "(空对象)"}`);
    }
  }
}

if (VERBOSE) console.log("");

// ---------------------------------------------------------------- 结论
const missing = [...allowed].filter((k) => !used.has(k) && !k.endsWith(".go") && !k.endsWith(".js"));

console.log("==> 助教页面上下文契约守门（docs/agent-ux-implementation-contract.md §5）");
console.log(`    契约登记字段 ${allowed.size} 个｜扫描 publishContext({...}) 调用 ${calls} 处｜覆盖 ${used.size} 个字段`);

if (spreadsFound.length) {
  console.log("    注意：以下调用使用了展开运算符，其字段无法静态校验（请人工确认已登记）：");
  for (const s of spreadsFound) console.log(`      - ${s}`);
}

if (missing.length) {
  console.log(`    信息（不阻断）：契约已登记但当前前端未出现的字段 ${missing.length} 个：${missing.join(", ")}`);
}

if (violations.length) {
  console.log("");
  for (const v of violations) {
    console.log(`❌ ${v.rel}:${v.line} 使用未登记字段：${v.bad.join(", ")}`);
  }
  console.log("");
  console.log("处理方式二选一：① 删掉这些字段；② 先在契约 §5 表格里登记（写明读取方），再改此处。");
  process.exit(1);
}

console.log("");
console.log("✅ 所有 publishContext 字段都已在契约 §5 登记。");
process.exit(0);
