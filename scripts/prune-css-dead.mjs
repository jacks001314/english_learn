// scripts/prune-css-dead.mjs —— 删除样式表里"没有任何 JS/HTML 引用"的死规则（死代码清理）
// ---------------------------------------------------------------------------
// 用法：
//   node scripts/prune-css-dead.mjs                 # 干跑，只打印计划
//   node scripts/prune-css-dead.mjs --apply         # 真正写回样式表
//   node scripts/prune-css-dead.mjs --css web/grammar.css --apply
// 判定：
//   1) 按花括号配对切出规则块（含 @media 容器与内部规则）；
//   2) 抽取选择器里的 .class 名，在 web/**/*.{js,mjs,html} 里整词搜索；
//   3) "状态词"类名（active/ok/right 等）默认不算"在用"证据，避免误判；
//   4) 块内所有"有意义"的 class 都搜不到 → 判为死规则；@media 内规则全死 → 整个容器删掉；
//   5) 删除时顺带吸收紧贴在上方、与规则之间没有空行的注释行。
// 安全：默认干跑；--apply 前会写一份 .pre-prune 备份。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const argOf = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const CSS_ARG = argOf("css", "web/grammar.css");
const APPLY = args.includes("--apply");
const STRICT = args.includes("--strict");
const CSS_PATH = path.join(ROOT, CSS_ARG);

// 状态词：出现在大量无关组件里，不能单独证明"这块样式在用"
const GENERIC = new Set(["active", "ok", "no", "on", "off", "good", "bad", "right", "wrong",
  "exam", "exam-other", "correct", "muted", "adapted", "authored", "ghost", "all", "tiny",
  "primary", "hot", "info", "selected", "error", "warn", "closed", "open", "hidden", "show", "disabled"]);

const sources = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) { if (!/node_modules|\.git/.test(e.name)) walk(f); continue; }
    if (/\.(js|mjs|html)$/.test(e.name)) sources.push({ file: path.relative(ROOT, f), text: fs.readFileSync(f, "utf8") });
  }
};
walk(path.join(ROOT, "web"));
const refFiles = (cls) => {
  const re = new RegExp("(^|[^A-Za-z0-9_-])" + cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^A-Za-z0-9_-]|$)");
  return sources.filter((s) => re.test(s.text)).map((s) => s.file);
};
// ---- 解析：花括号配对切块 ----
const css = fs.readFileSync(CSS_PATH, "utf8");
const lineStarts = [0];
for (let k = 0; k < css.length; k += 1) if (css[k] === "\n") lineStarts.push(k + 1);
const lineOf = (off) => { let lo = 0; let hi = lineStarts.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (lineStarts[mid] <= off) lo = mid; else hi = mid - 1; } return lo + 1; };

function parse(text) {
  let i = 0;
  const skipGap = () => {
    for (;;) {
      while (i < text.length && /\s/.test(text[i])) i += 1;
      if (text[i] === "/" && text[i + 1] === "*") { const e = text.indexOf("*/", i); i = e < 0 ? text.length : e + 2; continue; }
      break;
    }
  };
  const readBlocks = (depth) => {
    const out = [];
    for (;;) {
      skipGap();
      if (i >= text.length) break;
      if (text[i] === "}") { if (depth > 0) break; i += 1; continue; }
      const start = i;
      let sel = "";
      while (i < text.length && text[i] !== "{" && text[i] !== "}") {
        if (text[i] === "/" && text[i + 1] === "*") { const e = text.indexOf("*/", i); i = e < 0 ? text.length : e + 2; continue; }
        sel += text[i]; i += 1;
      }
      if (i >= text.length) break;
      if (text[i] === "}") { if (depth > 0) break; i += 1; continue; }
      i += 1; // 吃掉 "{"
      const isAt = sel.trim().startsWith("@");
      let children = null;
      let end;
      if (isAt) {
        children = readBlocks(depth + 1);
        skipGap();
        if (i < text.length && text[i] === "}") { end = i + 1; i += 1; } else { end = i; }
      } else {
        let j = i;
        let q = null;
        while (j < text.length) {
          const ch = text[j];
          if (q) { if (ch === "\\") { j += 2; continue; } if (ch === q) q = null; j += 1; continue; }
          if (ch === "\"" || ch === "'") { q = ch; j += 1; continue; }
          if (ch === "/" && text[j + 1] === "*") { const e = text.indexOf("*/", j); j = e < 0 ? text.length : e + 2; continue; }
          if (ch === "}") break;
          j += 1;
        }
        end = j < text.length ? j + 1 : j;
        i = end;
      }
      out.push({ start, end, selector: sel.trim(), isAt, children });
    }
    return out;
  };
  return readBlocks(0);
}

// ---- 判定死活 ----
const classesOf = (selector) => [...new Set((selector.match(/\.[A-Za-z0-9_-]+/g) || []).map((s) => s.slice(1)))];
const verdictOf = (selector) => {
  const classes = classesOf(selector);
  if (!classes.length) return { kind: "no-class" };
  const strong = classes.filter((c) => !GENERIC.has(c));
  if (!strong.length) return { kind: "generic-only", classes };
  const live = strong.filter((c) => refFiles(c).length > 0);
  // --strict：选择器里只要有一个"有意义"的 class 搜不到引用，就整块删
  if (STRICT && live.length < strong.length) return { kind: "dead", classes, strong };
  if (live.length) return { kind: "live", classes, live };
  return { kind: "dead", classes, strong };
};
const mark = (blocks) => {
  for (const b of blocks) {
    if (b.isAt) {
      b.children = mark(b.children || []);
      b.dead = b.children.length > 0 && b.children.every((c) => c.dead);
      if (b.dead) for (const c of b.children) c.covered = true;
    } else {
      const v = verdictOf(b.selector);
      b.verdict = v;
      b.dead = v.kind === "dead";
    }
  }
  return blocks;
};

// ---- 吸收紧贴在上方、中间没有空行的注释行 ----
const absorbLeading = (text, start) => {
  let s = start;
  for (;;) {
    let k = s;
    while (k > 0 && /[ \t\r\n]/.test(text[k - 1])) k -= 1;
    if (k >= 2 && text[k - 1] === "/" && text[k - 2] === "*") {
      const st = text.lastIndexOf("/*", k - 2);
      if (st < 0) break;
      const gap = text.slice(k, s);
      if (/\n[ \t]*\n/.test(gap)) break;   // 与规则之间有空行 → 不吸收
      s = st;
      continue;
    }
    break;
  }
  // 去掉吸收后残留的行首空白
  while (s > 0 && (text[s - 1] === " " || text[s - 1] === "\t")) s -= 1;
  return s;
};

// ---- 收集要删的范围 ----
const blocks = mark(parse(css));
const ranges = [];
const collect = (list) => {
  for (const b of list) {
    if (b.isAt) {
      if (b.dead) { if (!b.covered) ranges.push([b.start, b.end]); }
      else collect(b.children);
    } else if (b.dead && !b.covered) ranges.push([b.start, b.end]);
  }
};
collect(blocks);

// 合并相邻/重叠范围，并吸收前置注释
ranges.sort((a, b) => a[0] - b[0]);
const merged = [];
for (const [s0, e0] of ranges) {
  const s = absorbLeading(css, s0);
  if (merged.length && s <= merged[merged.length - 1][1]) {
    merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e0);
  } else merged.push([s, e0]);
}

const removedLines = merged.reduce((n, [s, e]) => n + (lineOf(e - 1) - lineOf(s) + 1), 0);
const kept = [];
const listKept = (list) => {
  for (const b of list) {
    if (b.isAt) { if (!b.dead) { kept.push(`[${b.selector.replace(/\s+/g, " ").slice(0, 60)}]`); listKept(b.children); } continue; }
    if (b.covered) continue;
    if (!b.dead) {
      const v = b.verdict;
      const why = v.kind === "no-class" ? "无 class 选择器"
        : v.kind === "generic-only" ? "只含状态词：" + v.classes.join(",")
        : "引用：" + v.live.slice(0, 2).join("|");
      kept.push(`L${lineOf(b.start)}  ${b.selector.replace(/\s+/g, " ").slice(0, 64)}   ← ${why}`);
    }
  }
};
listKept(blocks);

console.log(`样式表：${CSS_ARG}（共 ${css.split("\n").length - 1} 行 / ${blocks.length} 个顶层块）`);
console.log(`死规则删除范围：${merged.length} 段，约 ${removedLines} 行（${(removedLines / (css.split("\n").length - 1) * 100).toFixed(1)}%）\n`);
for (const [s, e] of merged) console.log(`  删 L${lineOf(s)}-L${lineOf(e - 1)}（${lineOf(e - 1) - lineOf(s) + 1} 行）`);
console.log(`\n保留块（应与之相关的 JS/HTML 引用一一对应）：`);
for (const k of kept) console.log("  " + k);

// ---- 安全检查：仍被引用的"有意义"类名不能消失 ----
const oldClasses = new Set(classesOf(blocks.map((b) => b.selector).join(",")));
let pruned = css;
for (const [s, e] of [...merged].sort((a, b) => b[0] - a[0])) pruned = pruned.slice(0, s) + pruned.slice(e);
const newClasses = new Set(classesOf(pruned));
const lostLive = [...oldClasses].filter((c) => !GENERIC.has(c) && !newClasses.has(c) && refFiles(c).length);
if (lostLive.length) { console.log(`\n⛔ 误删仍在使用的类：${lostLive.join(", ")}`); process.exit(1); }
console.log(`\n✅ 安全检查通过：被引用的类无一被删。`);

// ---- 结构自检：注释被提前结束（例如注释里写了裸 */）会让后面的规则被浏览器吞掉 ----
function structuralCheck(text) {
  // 用浏览器同款逻辑剥注释（遇到第一个 */ 即结束），注释内容换成空格、保留换行
  let cleaned = "";
  let k = 0;
  while (k < text.length) {
    if (text.startsWith("/*", k)) {
      const e = text.indexOf("*/", k + 2);
      const end = e < 0 ? text.length : e + 2;
      cleaned += text.slice(k, end).replace(/[^\n]/g, " ");
      k = end; continue;
    }
    cleaned += text[k]; k += 1;
  }
  const open = (cleaned.match(/\{/g) || []).length;
  const close = (cleaned.match(/\}/g) || []).length;
  const suspicious = [];
  const selRe = /(^|\})\s*([^{}]*?)\s*\{/g;
  let m;
  while ((m = selRe.exec(cleaned))) {
    const sel = m[2].trim();
    if (!sel) continue;
    if (/[{};]/.test(sel) || /[\u3400-\u9FFF]/.test(sel) || sel.includes("*")) suspicious.push(sel.slice(0, 90));
  }
  return { ok: open === close && suspicious.length === 0, open, close, suspicious };
}

// --self-test：验证结构自检本身抓得住"注释里写 */ 提前结束注释"这个坑
if (args.includes("--self-test")) {
  const broken = "/* 坏头部：web/**/*.{js,html} 会让注释提前结束 */\n.a { color: red; }\n";
  const fixed = "/* 好头部：web 下的 js/html 源码 */\n.a { color: red; }\n";
  const r1 = structuralCheck(broken);
  const r2 = structuralCheck(fixed);
  console.log("坏样本：" + JSON.stringify({ ok: r1.ok, suspicious: r1.suspicious }));
  console.log("好样本：" + JSON.stringify({ ok: r2.ok, suspicious: r2.suspicious }));
  if (r1.ok || !r2.ok) { console.log("⛔ 结构自检自测失败"); process.exit(1); }
  console.log("✅ 结构自检自测通过：坏样本被拦下、好样本放行");
  process.exit(0);
}

{
  const v = structuralCheck(pruned);
  if (!v.ok) {
    console.log(`\n⛔ 结构自检失败：花括号 ${v.open}/${v.close}，可疑选择器 ${v.suspicious.length} 个`);
    for (const x of v.suspicious.slice(0, 5)) console.log("   " + x);
    process.exit(1);
  }
  console.log(`\n✅ 结构自检通过：注释闭合、花括号配平（${v.open} 对）、选择器形态正常。`);
}

if (!APPLY) { console.log(`\n（干跑模式，未写文件。加 --apply 生效）`); process.exit(0); }
fs.writeFileSync(CSS_PATH + ".pre-prune", css);
fs.writeFileSync(CSS_PATH, pruned);
console.log(`\n已写回 ${CSS_ARG}：${css.split("\n").length - 1} 行 → ${pruned.split("\n").length - 1} 行`);
console.log(`备份：${path.relative(ROOT, CSS_PATH + ".pre-prune")}`);
