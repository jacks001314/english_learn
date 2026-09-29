// scripts/check-nav-hash.mjs —— 主侧栏 hash 深链解析自检（对应方案验收 S3/§5.5）
// ---------------------------------------------------------------------------
// 做法：把 web/js/main.js 里真实的 locationParts / hashFor 源码切片出来，
// 在 Node 里用一个假的 window.location 跑一遍，断言解析与回写规则。
// 这样既不启动后端也不复制粘贴逻辑，验证的是即将上线的同一段代码。
// 用法：node scripts/check-nav-hash.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "web/js/main.js"), "utf8");

const start = src.indexOf("const knownViews = new Set(");
const end = src.indexOf("const learningViews = new Set(");
if (start < 0 || end < 0 || end < start) {
  console.error("❌ 在 main.js 里找不到 knownViews / learningViews 区块，无法切片");
  process.exit(1);
}
const block = src.slice(start, end);
// eslint-disable-next-line no-new-func
const build = new Function("window", block + "\n  return { locationParts, hashFor, viewFromLocation };");

const cases = [];
const run = (hash) => {
  const fakeWindow = { location: { hash } };
  return build(fakeWindow);
};

const problems = [];
const expect = (label, actual, want) => {
  const ok = JSON.stringify(actual) === JSON.stringify(want);
  cases.push(`${ok ? "✓" : "✗"} ${label}｜实际 ${JSON.stringify(actual)}｜期望 ${JSON.stringify(want)}`);
  if (!ok) problems.push(label);
};

{
  const { locationParts } = run("#grammar/g-pronouns/lecture-3");
  expect("#grammar/g-pronouns/lecture-3 → view", locationParts().view, "grammar");
  expect("#grammar/g-pronouns/lecture-3 → args", locationParts().args, ["g-pronouns", "lecture-3"]);
}
{
  const { locationParts, viewFromLocation } = run("#grammar");
  expect("#grammar → view", viewFromLocation(), "grammar");
  expect("#grammar → args", locationParts().args, []);
}
{
  const { locationParts } = run("");
  expect("空 hash → 回落到首页", locationParts().view, "home");
  expect("空 hash → args 为空", locationParts().args, []);
}
{
  const { locationParts } = run("#not-a-view/xyz");
  expect("未知 view → 回落到首页", locationParts().view, "home");
}
{
  // 已在语法专题上：hashFor('grammar') 必须保留 #grammar/<专题> 上下文
  const { hashFor } = run("#grammar/g-nouns");
  expect("语法页内再点侧栏保留专题上下文", hashFor("grammar"), "#grammar/g-nouns");
}
{
  const { hashFor } = run("#grammar/g-nouns/lecture-2");
  expect("语法页内保留专题 + 锚点", hashFor("grammar"), "#grammar/g-nouns/lecture-2");
}
{
  const { hashFor } = run("#grammar/g-nouns");
  expect("切到其它模块不带语法参数", hashFor("home"), "#home");
}

console.log("hash 深链解析用例：");
for (const c of cases) console.log("  " + c);
if (problems.length) {
  console.log("\n❌ 不通过的用例：" + problems.join("；"));
  process.exit(1);
}
console.log("\n✅ 主侧栏 hash 解析自检通过");