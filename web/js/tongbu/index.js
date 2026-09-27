// 初中同步训练模块入口：聚合各套同步训练题，并提供本地练习进度与答案判定工具。
import starter1 from "./sets/starter-1.js";
import starter2 from "./sets/starter-2.js";
import starter3 from "./sets/starter-3.js";
import starter4 from "./sets/starter-4.js";
import u1_1 from "./sets/u1-1.js";
import u1_2 from "./sets/u1-2.js";
import u1Reading from "./sets/u1-reading.js";
import u1_3 from "./sets/u1-3.js";
import u1_4 from "./sets/u1-4.js";
import u1_5 from "./sets/u1-5.js";
import u2_1 from "./sets/u2-1.js";
import u2_2 from "./sets/u2-2.js";
import u2_3 from "./sets/u2-3.js";
import u2_4 from "./sets/u2-4.js";
import u2_5 from "./sets/u2-5.js";
import u3_1 from "./sets/u3-1.js";
import u3_2 from "./sets/u3-2.js";
import u3_3 from "./sets/u3-3.js";
import u3_4 from "./sets/u3-4.js";
import u3_5 from "./sets/u3-5.js";

export const tongbuSets = [
  starter1,
  starter2,
  starter3,
  starter4,
  u1_1,
  u1_2,
  u1Reading,
  u1_3,
  u1_4,
  u1_5,
  u2_1,
  u2_2,
  u2_3,
  u2_4,
  u2_5,
  u3_1,
  u3_2,
  u3_3,
  u3_4,
  u3_5,
];

export const tongbuUnits = tongbuSets.reduce((list, set) => {
  if (!list.includes(set.unit)) list.push(set.unit);
  return list;
}, []);

const STORAGE_PREFIX = "english-learn-tongbu-v1:";

const storageKey = (userId) => STORAGE_PREFIX + (userId || "anonymous");

export function loadTongbuProgress(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_) {
    return {};
  }
}

export function saveTongbuProgress(userId, progress) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(progress || {}));
  } catch (_) {
    /* 隐私模式下写入失败时忽略，不影响练习。 */
  }
}

// 1 = 一次答对/自评掌握；2 = 答错过，需要复习。
export function recordTongbuItem(progress, setId, key, ok) {
  const next = { ...(progress || {}) };
  const current = { ...(next[setId] || {}) };
  const done = { ...(current.done || {}) };
  const previous = done[key];
  done[key] = ok ? (previous === 2 ? 2 : 1) : 2;
  current.done = done;
  current.updatedAt = new Date().toISOString();
  next[setId] = current;
  return next;
}

export function clearTongbuSet(progress, setId) {
  const next = { ...(progress || {}) };
  delete next[setId];
  return next;
}

export function itemKey(sectionId, index) {
  return sectionId + "#" + index;
}

export function setTotal(set) {
  if (!set || !set.sections) return 0;
  return set.sections.reduce((sum, section) => {
    if (section.type === "cloze") return sum + (section.blanks || []).length;
    return sum + (section.items || []).length;
  }, 0);
}

export function setDone(progress, setId) {
  const record = progress && progress[setId];
  return record && record.done ? Object.keys(record.done).length : 0;
}

export function setScore(progress, setId) {
  const record = progress && progress[setId];
  const done = record && record.done ? record.done : {};
  const keys = Object.keys(done);
  return {
    done: keys.length,
    firstTry: keys.filter((key) => done[key] === 1).length,
    review: keys.filter((key) => done[key] === 2).length,
  };
}

// 判定用户输入是否正确：忽略大小写、多余空格与常见标点差异，支持用 | 分隔多个可接受答案。
export function normalizeAnswer(value) {
  return String(value == null ? "" : value)
    .toLowerCase()
    .replace(/[\u2019\u2018`\u00b4]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[.,;:!?]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function answerMatches(input, answer) {
  const typed = normalizeAnswer(input);
  if (!typed) return false;
  return String(answer)
    .split("|")
    .map((one) => normalizeAnswer(one))
    .filter(Boolean)
    .includes(typed);
}

// 把题面中的连续下划线替换成一个填空框。
export function splitBlanks(text) {
  const parts = [];
  String(text || "").split(/(_{2,})/).forEach((chunk) => {
    if (!chunk) return;
    if (/^_{2,}$/.test(chunk)) parts.push({ blank: true });
    else parts.push({ text: chunk });
  });
  return parts;
}

// 语法填空短文按 {{n}} 标记切分，用于渲染行内填空。
export function splitCloze(text) {
  const parts = [];
  String(text || "").split(/(\{\{\d+\}\})/).forEach((chunk) => {
    if (!chunk) return;
    const matched = chunk.match(/^\{\{(\d+)\}\}$/);
    if (matched) parts.push({ n: Number(matched[1]) });
    else parts.push({ text: chunk });
  });
  return parts;
}