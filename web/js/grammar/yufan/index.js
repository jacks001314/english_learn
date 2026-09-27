// yufan 教材讲义聚合入口
// ---------------------------------------------------------------------------
// 本目录下每个 <slug>.js 都 `export default` 一个数组，元素形如：
//   { topicId, newTopic, title, sourceDirs, imagesRead, summary, intro,
//     sections: [...], extras: {...}, category, difficulty, forms, points, ... }
// 契约见同目录 README.md。
//
// MODULES 列表由合并脚本重建（按 slug 字母序）。新增/删除讲义文件后请同步这里。
// 本文件不做任何 IO，也不依赖 topics.js，避免循环引用。
// ---------------------------------------------------------------------------

// === BEGIN AUTO-GENERATED MODULES ===
import adjectives from "./adjectives.js";
import adverbs from "./adverbs.js";
import agreement from "./agreement.js";
import articles from "./articles.js";
import conjunctions from "./conjunctions.js";
import futureTense from "./future-tense.js";
import inversion from "./inversion.js";
import modalVerbs from "./modal-verbs.js";
import nonfiniteVerbs from "./nonfinite-verbs.js";
import nouns from "./nouns.js";
import numerals from "./numerals.js";
import overview from "./overview.js";
import passiveVoice from "./passive-voice.js";
import pastSimple from "./past-simple.js";
import perfectTense from "./perfect-tense.js";
import prepositions from "./prepositions.js";
import presentContinuous from "./present-continuous.js";
import presentSimple from "./present-simple.js";
import pronouns from "./pronouns.js";
import questions from "./questions.js";
import reportedSpeech from "./reported-speech.js";
import sentenceMembers from "./sentence-members.js";
import sentenceStructure from "./sentence-structure.js";
import sentenceTypes from "./sentence-types.js";
import verbsOverview from "./verbs-overview.js";
const MODULES = [adjectives, adverbs, agreement, articles, conjunctions, futureTense, inversion, modalVerbs, nonfiniteVerbs, nouns, numerals, overview, passiveVoice, pastSimple, perfectTense, prepositions, presentContinuous, presentSimple, pronouns, questions, reportedSpeech, sentenceMembers, sentenceStructure, sentenceTypes, verbsOverview];
// === END AUTO-GENERATED MODULES ===

const ARRAY_FIELDS = ["forms", "points", "contrasts", "pitfalls", "examTips", "memoryCard"];

function keyOf(field, item) {
  if (typeof item === "string") return "s:" + item.trim();
  if (!item || typeof item !== "object") return "j:" + JSON.stringify(item);
  if (field === "forms") return "f:" + (item.name || "") + "|" + (item.pattern || "");
  if (field === "points") return "p:" + (item.title || "") + "|" + (item.desc || "");
  if (field === "contrasts") return "c:" + (item.title || "");
  return "j:" + JSON.stringify(item);
}

function mergeArray(base, add, field) {
  const list = Array.isArray(base) ? [...base] : [];
  const seen = new Set(list.map((it) => keyOf(field, it)));
  for (const item of add || []) {
    const key = keyOf(field, item);
    if (!key || key === "s:" || seen.has(key)) continue;
    seen.add(key);
    list.push(item);
  }
  return list;
}

export const yufanLectures = [];
for (const mod of MODULES) {
  for (const item of (mod || [])) if (item && item.topicId) yufanLectures.push(item);
}

const byTopic = new Map();
for (const item of yufanLectures) {
  const cur = byTopic.get(item.topicId) || {
    topicId: item.topicId, sections: [], sourceDirs: [], imagesRead: 0, extras: {}, notes: [],
    summary: "", intro: "", meta: null,
  };
  cur.sections = cur.sections.concat(item.sections || []);
  for (const dir of item.sourceDirs || []) if (!cur.sourceDirs.includes(dir)) cur.sourceDirs.push(dir);
  cur.imagesRead += item.imagesRead || 0;
  if (Array.isArray(item.notes)) cur.notes = cur.notes.concat(item.notes);
  if (item.summary && !cur.summary) cur.summary = item.summary;
  if (item.intro && !cur.intro) cur.intro = item.intro;
  const extraSource = [item.extras, item.newTopic ? item : null];
  for (const src of extraSource) {
    if (!src) continue;
    for (const field of ARRAY_FIELDS) {
      if (Array.isArray(src[field]) && src[field].length) {
        cur.extras[field] = mergeArray(cur.extras[field] || [], src[field], field);
      }
    }
  }
  if (item.newTopic && !cur.meta) cur.meta = item;
  byTopic.set(item.topicId, cur);
}

// topicId -> 讲义（sections 已按多份讲义拼接）
export const lectureByTopic = {};
// topicId -> 对 topics.js 现有专题的增量补充
export const yufanPatches = {};
// yufan 新增的专题（topics.js 中原本没有）
export const yufanNewTopics = [];
// 讲义覆盖统计，供报告与自检
export const yufanStats = { topics: 0, newTopics: 0, imagesRead: 0, sections: 0, files: MODULES.length };

for (const [topicId, agg] of byTopic) {
  const lecture = {
    topicId,
    title: agg.meta ? agg.meta.title || "" : "",
    sourceDirs: agg.sourceDirs,
    imagesRead: agg.imagesRead,
    summary: agg.summary,
    intro: agg.intro,
    sections: agg.sections,
    notes: agg.notes,
  };
  lectureByTopic[topicId] = lecture;
  yufanStats.topics += 1;
  yufanStats.imagesRead += agg.imagesRead;
  yufanStats.sections += agg.sections.length;

  if (Object.keys(agg.extras).length) yufanPatches[topicId] = agg.extras;

  if (agg.meta) {
    const topic = {
      id: topicId,
      title: agg.meta.title || topicId,
      short: agg.meta.short || agg.meta.title || topicId,
      category: agg.meta.category || "句法",
      difficulty: Number(agg.meta.difficulty) || 3,
      summary: agg.summary || agg.meta.summary || "",
      forms: [], points: [], contrasts: [], pitfalls: [], examTips: [], memoryCard: [],
      textbookLinks: [],
      lecture,
      yufanNew: true,
    };
    for (const field of ARRAY_FIELDS) {
      if (agg.extras[field] && agg.extras[field].length) topic[field] = agg.extras[field];
    }
    yufanNewTopics.push(topic);
    yufanStats.newTopics += 1;
  }
}

// 把 yufan 讲义挂到 topics.js 的现有专题上（不覆盖已有文案，只做补充）
export function attachYufan(topic) {
  const patch = yufanPatches[topic.id];
  const lecture = lectureByTopic[topic.id];
  if (!patch && !lecture) return topic;
  const next = { ...topic };
  if (patch) {
    for (const field of ARRAY_FIELDS) {
      if (Array.isArray(patch[field]) && patch[field].length) {
        next[field] = mergeArray(next[field], patch[field], field);
      }
    }
  }
  if (lecture) {
    if (!next.summary && lecture.summary) next.summary = lecture.summary;
    next.lecture = lecture;
  }
  return next;
}
