#!/usr/bin/env node
/**
 * 扫描 web/js/grammar/yufan/*.js → 契约校验 → 重建 yufan/index.js 的 MODULES 列表。
 *
 * 用法：
 *   node scripts/build-yufan-lectures.mjs            # 校验 + 重建 index.js
 *   node scripts/build-yufan-lectures.mjs --check     # 只校验，不改文件（CI 用）
 *   node scripts/build-yufan-lectures.mjs --json      # 额外输出机器可读报告
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEC_DIR = path.join(ROOT, "web/js/grammar/yufan");
const INDEX_FILE = path.join(LEC_DIR, "index.js");
const IMAGE_RE = /\.(jpe?g|png|webp)$/i;
const RESERVED = new Set(["index.js", "_template.js"]);
const BLOCK_TYPES = new Set(["text", "list", "table", "examples", "tip", "pitfall"]);
const ARRAY_FIELDS = ["forms", "points", "contrasts", "pitfalls", "examTips", "memoryCard"];
const CATEGORIES = new Set(["词法", "句法", "动词", "复合句"]);

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

// ---- 1. 图片清单（事实基线） ----
function walkImages(dir, base = dir, out = new Map()) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkImages(full, base, out);
    else if (IMAGE_RE.test(entry.name)) out.set(full, path.relative(ROOT, full).split(path.sep).join("/"));
  }
  return out;
}

const yufanRoot = path.join(ROOT, "yufan");
const allImages = walkImages(yufanRoot);
const countsByDir = new Map();
for (const rel of allImages.values()) {
  const dir = path.posix.dirname(rel);
  countsByDir.set(dir, (countsByDir.get(dir) || 0) + 1);
}

// ---- 2. 校验每个讲义模块 ----
function checkBlockTypes(section, where) {
  (section.blocks || []).forEach((b, i) => {
    const at = `${where} blocks[${i}]`;
    if (!b || !BLOCK_TYPES.has(b.type)) return err(at, `非法 block.type=${b && b.type}`);
    if (b.type === "text" || b.type === "tip" || b.type === "pitfall") {
      if (typeof b.text !== "string" || !b.text.trim()) err(at, `缺少 text`);
    } else if (b.type === "list") {
      if (!Array.isArray(b.items) || !b.items.length) err(at, `items 必须是非空数组`);
      else if (b.items.some((x) => typeof x !== "string" || !x.trim())) err(at, `items 元素必须是非空字符串`);
    } else if (b.type === "table") {
      if (!Array.isArray(b.head) || !b.head.length) err(at, `head 必须是非空数组`);
      if (!Array.isArray(b.rows) || !b.rows.length) err(at, `rows 必须是非空数组`);
      else
        b.rows.forEach((row, ri) => {
          if (!Array.isArray(row) || row.length !== b.head.length) err(at, `rows[${ri}] 列数与 head 不一致`);
          else if (row.some((c) => typeof c !== "string")) err(at, `rows[${ri}] 存在非字符串单元格`);
        });
    } else if (b.type === "examples") {
      if (!Array.isArray(b.items) || !b.items.length) err(at, `items 必须是非空数组`);
      else
        b.items.forEach((x, xi) => {
          if (!x || typeof x.en !== "string" || !x.en.trim()) err(at, `items[${xi}] 缺少 en`);
          if (!x || typeof x.zh !== "string" || !x.zh.trim()) err(at, `items[${xi}] 缺少 zh`);
        });
    }
  });
}

let modules = [];
const files = fs.existsSync(LEC_DIR)
  ? fs.readdirSync(LEC_DIR).filter((f) => f.endsWith(".js") && !RESERVED.has(f)).sort()
  : [];

for (const file of files) {
  const where = `yufan/${file}`;
  let mod;
  try {
    mod = await import(new URL(`./web/js/grammar/yufan/${file}`, `file://${ROOT.replace(/\\/g, "/")}/`).href);
  } catch (e) {
    err(where, `import 失败：${e.message}`);
    continue;
  }
  const items = mod.default;
  if (!Array.isArray(items) || !items.length) {
    err(where, `default export 必须是至少含 1 个元素的数组`);
    continue;
  }
  const slug = file.replace(/\.js$/, "");
  modules.push({ slug, file, items });

  items.forEach((item, ii) => {
    const at = `${where}[${ii}]`;
    if (!item || typeof item !== "object") return err(at, "不是对象");
    if (typeof item.topicId !== "string" || !item.topicId.trim()) err(at, "缺少 topicId");
    if (typeof item.title !== "string" || !item.title.trim()) err(at, "缺少 title");
    if (!Array.isArray(item.sourceDirs) || !item.sourceDirs.length) err(at, "缺少 sourceDirs");
    if (typeof item.imagesRead !== "number" || item.imagesRead <= 0) err(at, "imagesRead 必须是正数");
    if (item.newTopic === true) {
      if (!CATEGORIES.has(item.category)) err(at, `newTopic 的 category 必须是 ${[...CATEGORIES].join("/")}`);
      const d = Number(item.difficulty);
      if (!Number.isInteger(d) || d < 1 || d > 5) err(at, "newTopic 的 difficulty 必须是 1-5 整数");
      for (const f of ["forms", "points", "pitfalls", "examTips", "memoryCard"]) {
        if (!Array.isArray(item[f]) || !item[f].length) err(at, `newTopic 缺少 ${f}`);
      }
      for (const p of item.points || []) {
        if (!p || typeof p.title !== "string" || !p.title.trim()) err(at, "points[].title 缺失");
        if (!Array.isArray(p.good) || !p.good.length) err(at, `points「${p && p.title}」缺少 good 例句`);
      }
    }
    if (!Array.isArray(item.sections) || !item.sections.length) err(at, "sections 必须非空");
    else
      item.sections.forEach((s, si) => {
        if (!s || typeof s.heading !== "string" || !s.heading.trim()) err(`${at} sections[${si}]`, "缺少 heading");
        if (!Array.isArray(s.blocks) || !s.blocks.length) err(`${at} sections[${si}]`, "blocks 必须非空");
        checkBlockTypes(s, `${at} sections[${si}]`);
      });
    if (item.extras) {
      for (const k of Object.keys(item.extras)) {
        if (!ARRAY_FIELDS.includes(k)) warn(at, `extras 含未知字段 ${k}`);
      }
    }
    for (const dir of item.sourceDirs || []) {
      if (!countsByDir.has(dir)) warn(at, `sourceDirs 中 ${dir} 在磁盘上不存在`);
    }
  });
}

// ---- 3. 覆盖率核对 ----
const covered = new Map();
const dirImagesAttributed = new Map();
for (const { items, file } of modules) {
  for (const item of items) {
    const dirs = item.sourceDirs || [];
    for (const dir of dirs) {
      covered.set(dir, (covered.get(dir) || 0) + 1);
      dirImagesAttributed.set(dir, (dirImagesAttributed.get(dir) || 0) + (item.imagesRead || 0));
    }
    const declared = dirs.reduce((n, dir) => n + (countsByDir.get(dir) || 0), 0);
    if (dirs.length && declared !== item.imagesRead) {
      warn(
        `yufan/${file}`,
        `imagesRead=${item.imagesRead} 与其 sourceDirs 实际张数 ${declared} 不一致（${dirs.join(", ")}）`,
      );
    }
  }
}

// 逐目录核对“声明已读”与“磁盘实际张数”：少报=可能漏图，多报=可能重复计数
const imagesAudit = [];
for (const [dir, total] of [...countsByDir.entries()].sort()) {
  const declared = dirImagesAttributed.get(dir) || 0;
  imagesAudit.push({ dir, images: total, declared });
  if (declared && declared < total) {
    warn("imagesAudit", `${dir} 磁盘 ${total} 张，但只声明已读 ${declared} 张（差 ${total - declared} 张，需确认是否为无知识点页）`);
  } else if (declared > total) {
    warn("imagesAudit", `${dir} 磁盘 ${total} 张，却声明已读 ${declared} 张（多 ${declared - total} 张，疑似重复计数）`);
  }
}
const coverage = [];
for (const [dir, total] of [...countsByDir.entries()].sort()) {
  const touches = covered.get(dir) || 0;
  coverage.push({ dir, images: total, referenced: touches });
  if (!touches) warn("coverage", `${dir}（${total} 张）没有任何讲义引用`);
}

const report = {
  generatedAt: new Date().toISOString(),
  imagesOnDisk: allImages.size,
  lectureFiles: modules.length,
  topicsCovered: new Set(modules.flatMap((m) => m.items.map((i) => i.topicId))).size,
  imagesReadReported: modules.reduce((n, m) => n + m.items.reduce((s, i) => s + (i.imagesRead || 0), 0), 0),
  coverage,
  imagesAudit,
  errors,
  warnings,
};

// ---- 4. 重建 index.js 的 MODULES 列表 ----
const BEGIN = "// === BEGIN AUTO-GENERATED MODULES ===";
const END = "// === END AUTO-GENERATED MODULES ===";
const block = [
  BEGIN,
  ...modules.map((m) => `import ${camel(m.slug)} from "./${m.slug}.js";`),
  `const MODULES = [${modules.map((m) => camel(m.slug)).join(", ")}];`,
  END,
].join("\n");

function camel(slug) {
  const parts = slug.split(/[^a-z0-9]+/i).filter(Boolean);
  const name = parts.map((p, i) => (i ? p[0].toUpperCase() + p.slice(1) : p)).join("");
  return /^[a-z]/.test(name) ? name : `m${name}`;
}

const checkOnly = process.argv.includes("--check");
if (fs.existsSync(INDEX_FILE)) {
  const text = fs.readFileSync(INDEX_FILE, "utf8");
  const re = new RegExp(`${escapeRe(BEGIN)}[\\s\\S]*?${escapeRe(END)}`);
  if (!re.test(text)) err("yufan/index.js", `找不到 MODULES 标记块`);
  else {
    const next = text.replace(re, block);
    if (!checkOnly && next !== text) fs.writeFileSync(INDEX_FILE, next, "utf8");
  }
} else err("yufan/index.js", "文件不存在");

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---- 5. 输出 ----
const outDir = path.join(ROOT, "reports");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "yufan-lectures-report.json"), JSON.stringify(report, null, 2), "utf8");

const lines = [];
lines.push(`# yufan 讲义合并报告`);
lines.push("");
lines.push(`- 磁盘图片总数：${report.imagesOnDisk}`);
lines.push(`- 讲义文件数：${report.lectureFiles}`);
lines.push(`- 覆盖专题数：${report.topicsCovered}`);
lines.push(`- 声明已读图片数：${report.imagesReadReported}`);
lines.push(`- 错误：${errors.length}，警告：${warnings.length}`);
lines.push("");
lines.push("## 逐目录图片核对（磁盘张数 / 声明已读）");
lines.push("");
lines.push("| 目录 | 磁盘 | 声明已读 | 一致 |");
lines.push("| --- | ---: | ---: | :---: |");
for (const row of imagesAudit) {
  const ok = row.declared === row.images ? "✅" : row.declared === 0 ? "—（尚无讲义）" : "⚠️";
  lines.push(`| ${row.dir} | ${row.images} | ${row.declared} | ${ok} |`);
}
lines.push("");
lines.push("");
if (errors.length) {
  lines.push("## 错误");
  lines.push(...errors.map((e) => `- ${e}`));
  lines.push("");
}
if (warnings.length) {
  lines.push("## 警告");
  lines.push(...warnings.map((w) => `- ${w}`));
}
fs.writeFileSync(path.join(outDir, "yufan-lectures-report.md"), lines.join("\n") + "\n", "utf8");

console.log(lines.join("\n"));
if (process.argv.includes("--json")) console.log(JSON.stringify(report));
process.exit(errors.length ? 1 : 0);
