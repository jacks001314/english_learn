// 学习上下文总线（learning context bus）。
//
// 练习页把“我正在做什么”发布到这里，智能助教读取它，学生就不必再把题目复述一遍。
// 引擎只信任 wordId / level 这类定位字段：释义、正确答案和学习记录一律以数据库为准
// （见 internal/learning/agent_context.go），所以篡改前端上下文改不了判分结论。
// 这个模块既被 main.js 以 `?v=版本号` 引入，也被各个组件以裸路径引入，
// 浏览器把两种写法当成两个独立模块。若各持一份状态，助教面板（组件侧）与页面
// 逻辑（main.js 侧）就会互相看不见对方的上下文与提示。因此用 globalThis 上的
// 固定键保证真正的单例：无论模块被加载几次，状态只有一份。
const STORE_KEY = '__lingoBloomLearningStore';
let store = globalThis[STORE_KEY];
if (!store) {
  store = Vue.reactive({
    context: null,     // 最近一次发布的页面上下文
    drill: null,       // 助教生成的变式练习（由变式练习页渲染）
    pending: null,     // 页面按钮写下的待发送问题，助教面板消费后清空
    openRequest: 0,    // 递增计数：助教面板监听它来展开并自动发送
    milestone: null,   // 助教的主动轻提示（连错/连对/进入复习/交卷后）
  });
  globalThis[STORE_KEY] = store;
}

// publishContext 采用合并语义：页面只需上报变化的字段。
export function publishContext(patch) {
  if (!patch || typeof patch !== 'object') return;
  const previous = store.context || {};
  store.context = { ...previous, ...patch, updatedAt: Date.now() };
}

// 切换页面时清掉不属于该页面的上下文，避免助教看到上一题的旧信息。
export function clearContextForView(view) {
  if (!store.context) return;
  if (!view || store.context.view !== view) store.context = null;
}

// askAssistant 由页面上的“不懂，讲讲”这类按钮调用：写入问题并请求面板展开。
export function askAssistant(message, options = {}) {
  store.pending = { message: String(message || ''), ...options };
  store.openRequest += 1;
}

export function setDrill(drill) {
  store.drill = drill || null;
}

// contextForRequest 返回可以发给 /api/agent/chat 的纯数据快照。
export function contextForRequest() {
  if (!store.context) return {};
  const { updatedAt, ...rest } = store.context;
  return rest;
}

export default store;

// ---------------------------------------------------------------- 主动轻提示
//
// 页面常驻入口之外，助教还会在几个“确实需要老师”的时刻轻轻提醒一句。原则：
// 不弹窗、不打断作答、同一类提示五分钟内只说一次，点“知道了”就消失。
const NUDGE_COOLDOWN_MS = 5 * 60 * 1000;
// 连击与冷却同样必须跨模块实例共享，否则“同一类提示五分钟只说一次”会失效。
const NUDGE_KEY = '__lingoBloomLearningNudges';
const nudgeState = globalThis[NUDGE_KEY] || (globalThis[NUDGE_KEY] = { wrong: 0, correct: 0, lastAt: {} });

// noteAnswer 由练习页在判分后调用，返回并发布一条轻提示（或 null）。
export function noteAnswer(correct) {
  if (correct) {
    nudgeState.correct += 1;
    nudgeState.wrong = 0;
  } else {
    nudgeState.wrong += 1;
    nudgeState.correct = 0;
  }
  if (nudgeState.wrong >= 2) {
    nudgeState.wrong = 0;
    return showMilestone({
      kind: 'wrong-streak',
      title: '连错两题了',
      detail: '停下来一分钟，让助教把这两个词的差别讲清楚，再继续练。',
      actions: [
        { id: 'ask', quickAction: 'explain-wrong', label: '讲讲我错在哪' },
        { id: 'view', view: 'mistakes', label: '去错题本' },
      ],
    });
  }
  if (nudgeState.correct >= 5) {
    nudgeState.correct = 0;
    return showMilestone({
      kind: 'correct-streak',
      title: '连对五题，状态不错',
      detail: '可以趁热做一组同类变式题，把这几个词焊死在长期记忆里。',
      actions: [
        { id: 'ask', quickAction: 'drill', label: '出 3 道同类题' },
        { id: 'view', view: 'report', label: '看学习报告' },
      ],
    });
  }
  return null;
}

// noteReviewEntered 在进入今日复习时调用。
export function noteReviewEntered(dueCount) {
  if (!dueCount) return null;
  return showMilestone({
    kind: 'review-due',
    title: `今天有 ${dueCount} 个词到期`,
    detail: '按顺序过一遍，或者让助教先挑出最容易忘的几个。',
    actions: [
      { id: 'ask-text', message: '我不想按顺序复习，请帮我挑出最容易忘的 5 个词，并说明为什么先复习它们。', label: '让助教挑重点' },
      { id: 'view', view: 'review', label: '按顺序复习' },
    ],
  });
}

// noteExamSubmitted 在交卷后调用。
export function noteExamSubmitted(result) {
  const accuracy = result && Number.isFinite(result.accuracy) ? result.accuracy : null;
  return showMilestone({
    kind: 'exam-submitted',
    title: '刚交完卷',
    detail: accuracy === null ? '趁记忆新鲜，把错题交给助教归因，比再刷一套卷更值。' : `客观题正确率 ${accuracy}%，趁记忆新鲜让助教讲讲错题。`,
    actions: [
      { id: 'ask-text', message: '我刚交完试卷，请帮我找出这次最容易丢分的知识点，并给一个 10 分钟补救计划。', label: '让助教分析' },
      { id: 'view', view: 'mistakes', label: '看错题本' },
    ],
  });
}

// showMilestone 发布一条轻提示；同一类提示在冷却时间内只出现一次。
export function showMilestone(milestone) {
  if (!milestone) return null;
  const now = Date.now();
  const last = nudgeState.lastAt[milestone.kind] || 0;
  if (now - last < NUDGE_COOLDOWN_MS) return null;
  nudgeState.lastAt[milestone.kind] = now;
  store.milestone = { ...milestone, at: now };
  return store.milestone;
}

export function dismissMilestone() {
  store.milestone = null;
}

// 仅用于测试与调试：清空连击与冷却状态。
export function resetNudges() {
  nudgeState.wrong = 0;
  nudgeState.correct = 0;
  nudgeState.lastAt = {};
  store.milestone = null;
}
