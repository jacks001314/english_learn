// 语法专题模块入口：集中导出讲解数据、真题练习与本地学习进度工具。
//
// 讲解数据 = topics.js 中手工维护的专题 + yufan 教材图片整理出的讲义与补充（见 ./yufan/）。
import { grammarTopics as baseGrammarTopics, grammarCategories } from "./topics.js?v=20260927-yufan-r1";
import { grammarExercises, exercisesByTopic, examYears, examExercises, otherExamExercises, adaptedExercises, authoredOnly } from "./exercises.js?v=20260927-yufan-r1";
import { attachYufan, yufanNewTopics, lectureByTopic, yufanStats } from "./yufan/index.js?v=20260927-yufan-r1";

const baseIds = new Set(baseGrammarTopics.map((t) => t.id));

export const grammarTopics = [
  ...baseGrammarTopics.map(attachYufan),
  ...yufanNewTopics.filter((t) => !baseIds.has(t.id)),
];

export const topicsById = Object.fromEntries(grammarTopics.map((t) => [t.id, t]));

export const sortedTopics = [...grammarTopics].sort(
  (a, b) =>
    grammarCategories.indexOf(a.category) - grammarCategories.indexOf(b.category) ||
    (a.difficulty || 3) - (b.difficulty || 3),
);

export {
  grammarCategories,
  grammarExercises,
  exercisesByTopic,
  examYears,
  examExercises,
  otherExamExercises,
  adaptedExercises,
  authoredOnly,
  lectureByTopic,
  yufanStats,
};

const STORAGE_PREFIX = "english-learn-grammar-v1:";

const storageKey = (userId) => `${STORAGE_PREFIX}${userId || "anonymous"}`;

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

// 掌握度：以“是否答对过”为口径，反映专题练习完成情况。
export function topicMastery(progress, topicId, total) {
  const record = progress?.[topicId];
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
    const record = progress?.[topic.id];
    if (record?.done) {
      correctFirstTry += Object.values(record.done).filter((v) => v === 1).length;
    }
  }
  return { done, total: grammarExercises.length, correctFirstTry };
}
