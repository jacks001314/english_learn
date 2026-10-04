// 语法专题模块入口：集中导出讲解数据、真题练习、导航分组与本地学习进度工具。
//
// 数据分层（2026-09-27 起）：
//   topics.js        —— 专题正文（速查卡/用法要点/易错/记忆卡）+ 专题清单
//   primary.js       —— 小学基础语法知识卡（kind: card，无真题与讲义）
//   ia.js            —— 信息架构（分组、组内顺序、小节、标题修正、别名匹配）
//   yufan/*          —— 教材图片讲义（sections 按需 import），见 ./yufan/README.md
//   exercises.js     —— 真题与自编练习
// 本文件把三者合成可直接渲染的 grammarTopics / sortedTopics / groupTopics。
//
// 讲义正文（sections）体积约占全量 80%，首屏不加：选中专题后由 loadLecture(topicId) 按需 import()。
import { grammarTopics as baseGrammarTopics } from "./topics.js?v=20261004-primary-grammar-r1";
import { primaryGrammarCards } from "./primary.js?v=20261004-primary-grammar-r1";
import { grammarExercises, exercisesByTopic, examYears, examExercises, otherExamExercises, adaptedExercises, authoredOnly } from "./exercises.js?v=20261004-primary-grammar-r1";
import { attachYufan, yufanNewTopics, lectureByTopic, yufanStats, loadLecture, isLectureLoaded } from "./yufan/index.js?v=20260928-yufan-r5";
import {
  grammarGroups,
  grammarSubGroups,
  groupIndex,
  subGroupIndex,
  groupLabel,
  resolveGroup,
  resolveOrder,
  resolveSubGroup,
  resolveTitle,
  matchTopicId,
} from "./ia.js?v=20261004-primary-grammar-r1";

const baseIds = new Set(baseGrammarTopics.map((t) => t.id));

/** 给专题补上导航元数据（不覆盖原有正文，只改标题/归组）。 */
function withIA(topic) {
  const group = resolveGroup(topic);
  return {
    ...topic,
    group,
    order: resolveOrder(topic),
    subGroup: resolveSubGroup(topic, group),
    title: resolveTitle(topic),
  };
}

export const grammarTopics = [
  ...baseGrammarTopics.map(attachYufan),
  ...yufanNewTopics.filter((t) => !baseIds.has(t.id)),
  ...primaryGrammarCards,
].map(withIA);

/** 知识卡专题（小学基础）：有讲解无真题，渲染层据此隐藏讲义与练习两块。 */
export const isCardTopic = (topic) => !!topic && topic.kind === "card";

export const topicsById = Object.fromEntries(grammarTopics.map((t) => [t.id, t]));

const byIA = (a, b) =>
  groupIndex(a.group) - groupIndex(b.group) ||
  subGroupIndex(a.group, a.subGroup) - subGroupIndex(b.group, b.subGroup) ||
  a.order - b.order ||
  String(a.title).localeCompare(String(b.title), "zh");

export const sortedTopics = [...grammarTopics].sort(byIA);

/** 兼容旧导出：现在是五个导航分组的标签（旧的四分类仅保留在 topic.category 字段里）。 */
export const grammarCategories = grammarGroups.map((g) => g.label);

/**
 * 按导航分组切分专题，供侧栏渲染。
 * 返回 [{ key, label, hint, count, sections: [{ sub, items }] }]
 */
export function groupTopics(list = sortedTopics) {
  const out = [];
  for (const g of grammarGroups) {
    const items = list.filter((t) => t.group === g.key);
    if (!items.length) continue;
    const subs = grammarSubGroups[g.key] || [];
    let sections;
    if (!subs.length) {
      sections = [{ sub: "", items }];
    } else {
      sections = subs
        .map((sub) => ({ sub, items: items.filter((t) => t.subGroup === sub) }))
        .filter((s) => s.items.length);
      const rest = items.filter((t) => !subs.includes(t.subGroup));
      if (rest.length) sections.push({ sub: "其他", items: rest });
    }
    out.push({ key: g.key, label: g.label, hint: g.hint, count: items.length, sections });
  }
  return out;
}

/** 每个专题的题量构成（供导航与专题头显示，避免组件里各算一遍）。 */
export const exerciseCounts = Object.fromEntries(
  grammarTopics.map((t) => {
    const list = exercisesByTopic[t.id] || [];
    const count = (origin) => list.filter((e) => e.origin === origin).length;
    return [t.id, {
      total: list.length,
      exam: count("exam"),
      other: count("exam-other"),
      adapted: count("adapted"),
      authored: count("authored"),
    }];
  }),
);

/** 近五年北京卷单项填空考查次数（仅统计北京真题）。 */
export const examWeightByTopic = Object.fromEntries(
  grammarTopics.map((t) => [t.id, (exerciseCounts[t.id] && exerciseCounts[t.id].exam) || 0]),
);

export const lectureSectionsOf = (topicId) => {
  const lecture = lectureByTopic[topicId];
  return lecture ? lecture.sectionsTotal : 0;
};

/**
 * 专题内容形态 + 学习状态。
 * key: new | learning | done | lecture-only（有讲义无题）| ex-only（有题无讲义）| empty
 */
export function topicState(topic, mastery) {
  const counts = (topic && exerciseCounts[topic.id]) || { total: 0 };
  const hasEx = counts.total > 0;
  const hasLecture = lectureSectionsOf(topic && topic.id) > 0;
  if (!hasEx) {
    if (isCardTopic(topic)) {
      const points = (topic.points || []).length;
      return { key: "card", label: "知识卡", detail: `${points} 个用法要点` };
    }
    if (hasLecture) return { key: "lecture-only", label: "仅讲义", detail: `讲义 ${lectureSectionsOf(topic.id)} 节` };
    return { key: "empty", label: "待建设", detail: "内容建设中" };
  }
  const done = (mastery && mastery.done) || 0;
  const total = (mastery && mastery.total) || counts.total;
  const suffix = `${done}/${total}`;
  if (!hasLecture) return { key: "ex-only", label: "待补讲义", detail: `真题 ${counts.total} 道 · ${suffix}` };
  if (done >= total) return { key: "done", label: "已掌握", detail: `${counts.total} 题 · ${suffix}` };
  if (done > 0) return { key: "learning", label: "学习中", detail: `${counts.total} 题 · ${suffix}` };
  return { key: "new", label: "未开始", detail: `${counts.total} 题 · ${suffix}` };
}

/**
 * 标题 → 专题 id。
 * 知识卡与初中专题存在同名标题（如「现在进行时」「There be 句型」），
 * 这里让非知识卡先登记、知识卡只补空缺，保证既有的标题深链与教材语法名解析仍指向初中专题。
 */
const TITLES_BY_ID = new Map();
for (const topic of grammarTopics) {
  if (isCardTopic(topic)) continue;
  if (!TITLES_BY_ID.has(topic.title)) TITLES_BY_ID.set(topic.title, topic.id);
}
for (const topic of grammarTopics) {
  if (!isCardTopic(topic)) continue;
  if (!TITLES_BY_ID.has(topic.title)) TITLES_BY_ID.set(topic.title, topic.id);
}

/** 把 id / 课程里的中文语法名 / 专题标题 / hash 片段解析成专题 id（不认识就返回空串）。 */
export function resolveTopicId(value) {
  return matchTopicId(value, new Set(grammarTopics.map((t) => t.id)), TITLES_BY_ID);
}

/** 专题在排序里的下标，用于"上一专题 / 下一专题"。 */
export function topicPosition(topicId) {
  return sortedTopics.findIndex((t) => t.id === topicId);
}

export {
  grammarExercises,
  exercisesByTopic,
  examYears,
  examExercises,
  otherExamExercises,
  adaptedExercises,
  authoredOnly,
  lectureByTopic,
  yufanStats,
  loadLecture,
  isLectureLoaded,
  grammarGroups,
  grammarSubGroups,
  groupLabel,
};

// ---------------------------------------------------------------------------
// 本地学习进度（localStorage，按用户隔离）
// ---------------------------------------------------------------------------
const STORAGE_PREFIX = "english-learn-grammar-v1:";
const LAST_TOPIC_PREFIX = "english-learn-grammar-last-v1:";

const storageKey = (userId) => `${STORAGE_PREFIX}${userId || "anonymous"}`;
const lastTopicKey = (userId) => `${LAST_TOPIC_PREFIX}${userId || "anonymous"}`;

export function loadGrammarProgress(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_) {
    return {};
  }
}

export function saveGrammarProgress(userId, progress) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(progress || {}));
  } catch (_) {
    /* 隐私模式下写入失败时忽略，不影响练习。 */
  }
}

/** 记住最后一次进入的专题，供侧栏"继续上次"与站点导航回跳使用。 */
export function loadLastTopicId(userId) {
  try {
    return localStorage.getItem(lastTopicKey(userId)) || "";
  } catch (_) {
    return "";
  }
}

export function saveLastTopicId(userId, topicId) {
  try {
    if (topicId) localStorage.setItem(lastTopicKey(userId), topicId);
  } catch (_) {
    /* 同上。 */
  }
}

export function recordAnswer(progress, topicId, exerciseId, correct) {
  const next = { ...(progress || {}) };
  const cur = { ...(next[topicId] || {}) };
  cur.answered = (cur.answered || 0) + 1;
  cur.correct = (cur.correct || 0) + (correct ? 1 : 0);
  cur.wrong = (cur.wrong || 0) + (correct ? 0 : 1);
  cur.lastAt = new Date().toISOString();
  const done = { ...(cur.done || {}) };
  done[exerciseId] = correct ? 1 : 2; // 1 = 一次答对，2 = 答错过
  cur.done = done;
  next[topicId] = cur;
  return next;
}

/** 掌握度：以"是否答对过"为口径，反映专题练习完成情况。 */
export function topicMastery(progress, topicId, total) {
  const record = progress && progress[topicId];
  if (!record || !total) return { answered: 0, correct: 0, done: 0, total, percent: 0 };
  const doneMap = record.done || {};
  const done = Object.keys(doneMap).length;
  return {
    answered: record.answered || 0,
    correct: record.correct || 0,
    done,
    total,
    percent: Math.round((done / total) * 100),
  };
}

export function overallMastery(progress) {
  let done = 0;
  let correctFirstTry = 0;
  for (const topic of grammarTopics) {
    const total = (exercisesByTopic[topic.id] || []).length;
    const m = topicMastery(progress, topic.id, total);
    done += m.done;
    const record = progress && progress[topic.id];
    if (record && record.done) {
      correctFirstTry += Object.values(record.done).filter((v) => v === 1).length;
    }
  }
  return { done, total: grammarExercises.length, correctFirstTry };
}
