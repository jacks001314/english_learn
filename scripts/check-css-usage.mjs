// scripts/check-css-usage.mjs —— 找出样式表里"没有任何 JS/HTML 引用"的规则块（死代码体检）
// ---------------------------------------------------------------------------
// 用法：node scripts/check-css-usage.mjs [--css web/grammar.css] [--prefix gr2-]
// 做法：
//   1) 把 CSS 按顶层选择器切成规则块（含 @media 内层），记录每个块的行号范围；
//   2) 抽出块内所有 .class 名；
//   3) 在 web/**（*.js / *.html）里做整词搜索（排除 CSS 自身），任一命中即视为"在用"；
//   4) 块内所有 class 都无引用 → 列为可删候选。
// 说明：动态拼接的类名（如 "st-" + key）会被整词搜索漏判，脚本据此只输出候选，不删文件。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const argOf = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const CSS_FILE = path.join(ROOT, argOf("css", "web/grammar.css"));
const ONLY_PREFIX = argOf("prefix", "");

// ---- 1) 收集 web 下的 js/html 源码（用于"在用"判定）----
const sources = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) { if (!/node_modules|\.git/.test(e.name)) walk(f); continue; }
    if (/\.(js|mjs|html)$/.test(e.name)) sources.push({ file: path.relative(ROOT, f), text: fs.readFileSync(f, "utf8") });
  }
};
walk(path.join(ROOT, "web"));

const usedOnce = (token) => {
  const re = new RegExp("(^|[^A-Za-z0-9_-])" + token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^A-Za-z0-9_-]|$)");
  return sources.some((s) => re.test(s.text));
};

// ---- 2) 切规则块 ----
const css = fs.readFileSync(CSS_FILE, "utf8");
const blocks = [];
let i = 0;
let selectorStart = 0;
let depth = 0;
while (i < css.length) {
  const c = css[i];
  if (c === "/" && css[i + 1] === "*") { i = css.indexOf("*/", i) + 2; continue; }
  if (c === "{") {
    if (depth === 0) {
      const selector = css.slice(selectorStart, i).trim();
      const bodyStart = i;
      // 找到配对的 }
      let d = 0; let j = i;
      while (j < css.length) {
        if (css[j] === "{") d += 1;
        else if (css[j] === "}") { d -= 1; if (d === 0) break; }
        j += 1;
      }
      blocks.push({ selector, from: bodyStart, to: j });
      const lineStart = css.slice(0, selectorStart).split("\n").length;
      const lineEnd = css.slice(0, j).split("\n").length;
      blocks[blocks.length - 1].lineStart = lineStart;
      blocks[blocks.length - 1].lineEnd = lineEnd;
      blocks[blocks.length - 1].text = css.slice(selectorStart, j + 1);
      selectorStart = j + 1;
      i = j + 1;
      continue;
    }
    depth += 1;
  } else if (c === "}") { depth -= 1; selectorStart = i + 1; }
  i += 1;
}

// ---- 3) 逐块判定 ----
const dead = [];
for (const b of blocks) {
  if (!b.selector || b.selector.startsWith("@")) continue;      // @media / @keyframes 容器
  const classes = [...new Set((b.selector.match(/\.[A-Za-z0-9_-]+/g) || []).map((s) => s.slice(1)))];
  if (!classes.length) continue;                                 // 纯标签选择器不判
  if (ONLY_PREFIX && !classes.some((c) => c.startsWith(ONLY_PREFIX))) continue;
  const alive = classes.filter((c) => usedOnce(c));
  if (!alive.length) dead.push({ ...b, classes });
}

dead.sort((a, b) => a.lineStart - b.lineStart);
console.log(`样式表：${path.relative(ROOT, CSS_FILE)}（${blocks.length} 个规则块）`);
console.log(`扫描范围：web/**/*.js,*.html（${sources.length} 个文件）\n`);
if (!dead.length) {
  console.log("✅ 没有发现「整块无引用」的规则");
  process.exit(0);
}
console.log(`⚠️ 可删候选 ${dead.length} 块（块内所有 class 在 JS/HTML 里都搜不到）：`);
let lines = 0;
for (const d of dead) {
  const n = d.lineEnd - d.lineStart + 1;
  lines += n;
  console.log(`  L${d.lineStart}-${d.lineEnd}（${n} 行）${d.selector.replace(/\s+/g, " ").slice(0, 110)}`);
}
console.log(`\n合计约 ${lines} 行。注意：动态拼接类名可能被误判，删除前请人工确认。`);
