// 语法专题模块入口：集中导出讲解数据、真题练习与本地学习进度工具。
import { grammarTopics, grammarCategories, topicsById, sortedTopics } from "./topics.js";
import { grammarExercises, exercisesByTopic, examYears, examExercises, otherExamExercises, adaptedExercises, authoredOnly } from "./exercises.js";

export {
  grammarTopics,
  grammarCategories,
  topicsById,
  sortedTopics,
  grammarExercises,
  exercisesByTopic,
  examYears,
  examExercises,
  otherExamExercises,
  adaptedExercises,
  authoredOnly,
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
