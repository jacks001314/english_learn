// scripts/check-grammar-ia.mjs —— 语法模块信息架构自检（对应方案验收 S1/S4）
// ---------------------------------------------------------------------------
// 校验内容：
//   1) 每个专题都能落到一个导航分组，且分组顺序/组内顺序可排序（无"孤儿"专题）；
//   2) ia.js 里登记的专题 id 都存在（防止改名/删除后留下死配置）；
//   3) 直接引语与间接引语（g-reported-speech）等拆出的专题在导航中可达；
//   4) 每道课程模块的语法名（chuzhong/grammar.json）都能解析到专题 id，否则列出未命中项；
//   5) 打印每个专题的内容形态（讲义节数 / 题量 / 状态），用于人工核对空状态。
// 用法：node scripts/check-grammar-ia.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP = path.join(ROOT, "tmp", "grammar-ia-check");

// 把 web/js/grammar 镜像到 tmp，并去掉 import 上的 ?v=（node 无法解析查询串）
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });
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
    fs.writeFileSync(
      to.replace(/\.js$/, ".mjs"),
      src.replace('"./" + file + "?v=" + YUFAN_EAGER_V', '"./" + file.replace(/\.js$/, ".mjs")'),
    );
  }
};
copy(path.join(ROOT, "web/js/grammar"), path.join(TMP, "grammar"));

const m = await import(new URL(`./grammar/index.mjs`, `file://${TMP.replace(/\\/g, "/")}/`).href);
const {
  sortedTopics, groupTopics, grammarGroups, topicState, exerciseCounts,
  lectureByTopic, resolveTopicId, topicsById, loadLecture,
} = m;

const problems = [];
const notes = [];

// 1) 分组完整性
const groupKeys = new Set(grammarGroups.map((g) => g.key));
for (const t of sortedTopics) {
  if (!groupKeys.has(t.group)) problems.push(`专题 ${t.id} 的 group=${t.group} 不在 grammarGroups 中`);
  if (!Number.isFinite(t.order)) problems.push(`专题 ${t.id} 缺少 order`);
}
const grouped = groupTopics();
const groupedIds = new Set(grouped.flatMap((g) => g.sections.flatMap((s) => s.items.map((t) => t.id))));
for (const t of sortedTopics) if (!groupedIds.has(t.id)) problems.push(`专题 ${t.id} 没有出现在任何导航分组里`);

// 2) 死配置
const iaKeys = Object.keys((await import(new URL("./grammar/ia.mjs", `file://${TMP.replace(/\\/g, "/")}/`).href)).topicIA);
for (const key of iaKeys) if (!topicsById[key]) problems.push(`ia.js 登记的 ${key} 在专题列表里不存在`);

// 3) 拆出/补齐的专题必须可达：g-reported-speech（2026-09-27 拆出）、g-attributive-clause（2026-09-28 P3 补齐）
for (const id of ["g-reported-speech", "g-attributive-clause"]) {
  if (!topicsById[id]) problems.push(`${id} 未注册为专题`);
  else if (!groupedIds.has(id)) problems.push(`${id} 未出现在导航中`);
}

// 4) 课程模块语法名 → 专题
const grammarJson = JSON.parse(fs.readFileSync(path.join(ROOT, "chuzhong/grammar.json"), "utf8"));
const unmatched = [];
let totalUnits = 0;
for (const [book, units] of Object.entries(grammarJson)) {
  for (const [unit, v] of Object.entries(units)) {
    totalUnits += 1;
    const id = resolveTopicId(v.topic);
    if (!id) unmatched.push(`${book} ${unit}: ${v.topic}`); // 已知缺口，例如定语从句
    else if (!topicsById[id]) problems.push(`别名规则把「${v.topic}」解析成了不存在的 ${id}`);
  }
}

// 4b) 课程语法名必须全部命中（P3 补完定语从句后应为 0；以后新增教材语法点会在这里暴露）
if (unmatched.length) {
  for (const u of unmatched) problems.push(`课程语法名未命中专题：${u}`);
}

// 5) 形态清单
console.log("分组结构：");
for (const g of grouped) {
  console.log(`  ${g.label}（${g.count}）${g.hint ? " — " + g.hint : ""}`);
  for (const sec of g.sections) {
    if (sec.sub) console.log(`    · ${sec.sub}`);
    for (const t of sec.items) {
      const st = topicState(t, { done: 0, total: (exerciseCounts[t.id] || {}).total || 0 });
      const lec = lectureByTopic[t.id] ? lectureByTopic[t.id].sectionsTotal : 0;
      console.log(`      ${t.title}｜${st.label}｜讲义 ${lec} 节｜题 ${(exerciseCounts[t.id] || {}).total || 0}`);
    }
  }
}
console.log(`\n专题数：${sortedTopics.length}｜分组数：${grouped.length}｜课程模块语法名：${totalUnits}，未命中 ${unmatched.length}`);
if (unmatched.length) {
  notes.push(`课程语法名未命中 ${unmatched.length} 条（目前无对应专题，会回落到默认专题）：`);
  for (const u of unmatched) notes.push("    " + u);
}

// 讲义正文可加载性抽查（懒加载路径）
try {
  const sec = await loadLecture("g-reported-speech");
  notes.push(`loadLecture(g-reported-speech) -> ${sec.length} 节（懒加载路径可用）`);
} catch (e) {
  problems.push(`loadLecture(g-reported-speech) 失败：${e.message}`);
}

console.log("\n备注：");
for (const n of notes) console.log("  - " + n);
if (problems.length) {
  console.log("\n❌ 问题：");
  for (const p of problems) console.log("  - " + p);
  process.exit(1);
}
console.log("\n✅ 信息架构自检通过");
