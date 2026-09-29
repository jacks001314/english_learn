// scripts/check-grammar-duplication.mjs —— 语法内容重复项体检（对应方案验收 §6.3 / T4）
// ---------------------------------------------------------------------------
// 职责契约（见 yufan/README §8、方案 §6.3）：
//   - yufan/*.js 的 sections = 唯一"讲解正文"来源（解释性文字、教材原题例句）
//   - topics.js 的 forms / contrasts = 唯一"速查卡"来源（结构化公式与对照表）
//   - points / pitfalls / examTips / memoryCard = 只留在 topics.js（考点归纳）
// 因此只比对「速查卡（forms/contrasts）」与「讲义表格/文字」，命中即 warning；
// 重复项可能来自 topics.js，也可能来自 yufan/<slug>.js 自带的速查卡（同一文件里
// 既有讲义正文又有速查卡时，同一张表会在「速用速查」与「讲义精讲」各出现一次）。
// 本脚本只报告、不改文件；人工确认后删重复侧，保留讲义正文。
// 用法：
//   node scripts/check-grammar-duplication.mjs
//   node scripts/check-grammar-duplication.mjs --strict   # 有重复项时退出码 1（供 CI）
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP = path.join(ROOT, "tmp", "grammar-dup-check");
const STRICT = process.argv.includes("--strict");
const THRESHOLD = 0.8;

// ---------- 1) 镜像 web/js/grammar（去掉 ?v=，改扩展名以便 Node 直接 import） ----------
fs.rmSync(TMP, { recursive: true, force: true });
const copy = (dir, out) => {
  fs.mkdirSync(out, { recursive: true });
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const from = path.join(dir, e.name);
    const to = path.join(out, e.name);
    if (e.isDirectory()) { copy(from, to); continue; }
    if (!e.name.endsWith(".js")) continue;
    const src = fs
      .readFileSync(from, "utf8")
      .replace(/(from\s*")(\.\.?\/[^"?]+?)(?:\?[^"]*)?"/g, (all, head, spec) => head + spec.replace(/\.js$/, "") + ".mjs\"");
    fs.writeFileSync(to.replace(/\.js$/, ".mjs"), src.replace('"./" + file + "?v=" + YUFAN_EAGER_V', '"./" + file.replace(/\.js$/, ".mjs")'));
  }
};
copy(path.join(ROOT, "web/js/grammar"), path.join(TMP, "grammar"));

const base = `file://${TMP.replace(/\\/g, "/")}/`;
const { sortedTopics, topicsById, loadLecture, lectureByTopic } = await import(new URL("./grammar/index.mjs", base).href);

// ---------- 2) 归一化与相似度 ----------
const full2half = (s) => s.replace(/[\uFF01-\uFF5E]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
const norm = (s) =>
  full2half(String(s == null ? "" : s))
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "")
    .replace(/[·、，。；：？！“”‘’"'（）\[\]【】<>《》「」,.;:?!|—–~`]/g, "")
    .replace(/[／/]/g, "/");

const bigrams = (s) => { const out = []; for (let i = 0; i < s.length - 1; i += 1) out.push(s.slice(i, i + 2)); return out; };
const dice = (a, b) => {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const A = bigrams(a); const B = bigrams(b);
  if (!A.length || !B.length) return 0;
  const bag = new Map();
  for (const g of A) bag.set(g, (bag.get(g) || 0) + 1);
  let hit = 0;
  for (const g of B) {
    const c = bag.get(g) || 0;
    if (c > 0) { hit += 1; bag.set(g, c - 1); }
  }
  return (2 * hit) / (A.length + B.length);
};
/** 归一化后一方完整包含另一方（且不短于 10 字）也算重复 */
const contains = (a, b) => {
  if (!a || !b || Math.min(a.length, b.length) < 10) return 0;
  return a.includes(b) || b.includes(a) ? 0.9 : 0;
};
const score = (a, b) => Math.max(dice(a, b), contains(a, b));

// ---------- 3) 把讲义拆成可对比单元 ----------
function lectureUnits(sections) {
  const units = [];
  sections.forEach((sec, si) => {
    (sec.blocks || []).forEach((blk, bi) => {
      const at = { section: sec.heading, si, bi };
      if (blk.type === "text" || blk.type === "tip" || blk.type === "pitfall") {
        units.push({ ...at, kind: "text", text: norm(blk.text) });
      } else if (blk.type === "list") {
        (blk.items || []).forEach((it) => units.push({ ...at, kind: "list", text: norm(it) }));
      } else if (blk.type === "table") {
        (blk.rows || []).forEach((row, ri) => units.push({ ...at, kind: "table-row", ri, text: norm(row.join(" ")) }));
      } else if (blk.type === "examples") {
        (blk.items || []).forEach((ex) => units.push({ ...at, kind: "example", text: norm(`${ex.en} ${ex.zh}`) }));
      }
    });
  });
  return units;
}

// ---------- 4) 比对 ----------
const findings = [];
let compared = 0;
for (const topic of sortedTopics) {
  if (!lectureByTopic[topic.id]) continue;
  let sections = [];
  try {
    sections = await loadLecture(topic.id);
  } catch (e) {
    console.log(`  （跳过 ${topic.id}：讲义加载失败 ${e.message}）`);
    continue;
  }
  const units = lectureUnits(sections);
  if (!units.length) continue;

  const cards = [];
  (topic.forms || []).forEach((f, i) => {
    cards.push({
      field: `forms[${i}]`, group: `forms[${i}]`, label: f.name || "",
      value: norm(`${f.name || ""} ${f.pattern || ""}`), raw: `${f.name}｜${f.pattern}`,
    });
  });
  (topic.contrasts || []).forEach((c, i) => {
    (c.rows || []).forEach((row, j) => {
      cards.push({
        field: `contrasts[${i}].rows[${j}]`, group: `contrasts[${i}]`, label: c.title || "",
        value: norm(row.join(" ")), raw: row.join(" ｜ "), rowsTotal: (c.rows || []).length,
      });
    });
  });

  for (const card of cards) {
    compared += 1;
    let best = null;
    for (const u of units) {
      const s = score(card.value, u.text);
      if (s >= THRESHOLD && (!best || s > best.s)) best = { s, unit: u };
    }
    if (best) {
      findings.push({
        topic: topic.id, topicTitle: topic.title, field: card.field, group: card.group, label: card.label, raw: card.raw,
        rowsTotal: card.rowsTotal || 0,
        similarity: best.s, section: best.unit.section, kind: best.unit.kind, text: best.unit.text.slice(0, 60),
      });
    }
  }
}

// ---------- 5) 报告 ----------
const knownSamples = ["g-pronouns", "g-prepositions", "g-adj-adv"];
console.log(`比对范围：${compared} 条速查卡 × ${sortedTopics.filter((t) => lectureByTopic[t.id]).length} 个有讲义的专题（阈值 ≥${THRESHOLD}）\n`);
if (!findings.length) {
  console.log("✅ 未发现速查卡与讲义重复项");
} else {
  console.log(`⚠️ 发现 ${findings.length} 处疑似重复（警告，不自动修改）：`);
  for (const f of findings) {
    console.log(`  · ${f.topicTitle}（${f.topic}）${f.field}「${f.label}」≈${(f.similarity * 100).toFixed(0)}% 讲义「${f.section}」的${f.kind}`);
    console.log(`      topics.js: ${f.raw}`);
    console.log(`      讲义      : ${f.text}…`);
  }
}
// 按「卡」聚合：整卡被覆盖才好删，部分重叠保留
console.log("\n按速查卡聚合（供人工决定：整卡覆盖 → 可删 topics.js 侧；部分覆盖 → 保留）:");
const byGroup = new Map();
for (const f of findings) {
  const key = f.topic + "|" + f.group;
  const g = byGroup.get(key) || {
    topic: f.topic, topicTitle: f.topicTitle, group: f.group, label: f.label,
    rowsTotal: f.rowsTotal, rowsHit: 0,
  };
  g.rowsHit += 1;
  byGroup.set(key, g);
}
for (const g of [...byGroup.values()].sort((a, b) => b.rowsHit / (b.rowsTotal || 1) - a.rowsHit / (a.rowsTotal || 1))) {
  const full = g.rowsTotal > 0 && g.rowsHit >= g.rowsTotal;
  const tag = g.rowsTotal === 0
    ? "单卡命中 → 保留（forms 公式卡是速查的唯一来源）"
    : (full ? "整卡覆盖 → 可删重复侧（讲义正文保留）" : "部分覆盖 → 保留（合成多节内容，仍有速查价值）");
  console.log(`  · ${g.topicTitle}（${g.topic}）${g.group}「${g.label}」覆盖 ${g.rowsHit}/${g.rowsTotal || 1}｜${tag}`);
}

console.log("\n已知重复样本核对（方案 §6.3 第 3 条）：");
for (const id of knownSamples) {
  const hit = findings.filter((f) => f.topic === id);
  const t = topicsById[id];
  console.log(`  ${hit.length ? "命中" : "未命中"} ${t ? t.title : id}（${id}）：${hit.length} 处${hit.length ? " → " + hit.map((h) => h.field).join("、") : ""}`);
}
console.log("\n结论：本脚本只做体检，不修改文件。判定口径：整卡被讲义覆盖才删（2026-09-28 批次已清理 5 张：\n  g-nouns / g-prepositions / g-conjunctions 各 1 张、g-past-simple 2 张）；单卡 forms 公式卡与部分覆盖卡保留。");
if (STRICT && findings.length) process.exit(1);
