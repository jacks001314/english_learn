// 智能英语助教面板。
//
// 它是“题目旁边的教练”而不是通用聊天框：顶部只有一行状态胶囊（场景 · 第几题 · 这词错过几次），
// 下面给出针对这道题的快捷动作；回答优先渲染成服务端返回的结构化教学卡片（card），
// 拿不到卡片时回落到 Markdown 原文——**任何情况下都不白屏**。
import { api, postJSON } from '../api.js';
import { renderMarkdown } from '../markdown.js?v=20261006-agent-ux-r1';
import assistant, { contextForRequest, dismissMilestone, setDrill } from '../learningContext.js?v=20261007-agent-leakfix-r1';
import { speak, speechSupported, stopSpeaking } from '../agentSpeech.js?v=20261006-agent-ux-r1';
import AgentTeachingCard from './AgentTeachingCard.js?v=20261006-agent-ux-r1';

// 快捷动作的按钮文案。按钮只上报动作类型，具体问题由服务端按场景生成，
// 这样切换文案不需要前后端一起改。
const QUICK_LABELS = {
  explain: '讲讲这道题',
  'explain-wrong': '为什么我选错了',
  compare: '易混词对比',
  'explain-sentence': '逐句解析',
  drill: '出 3 道同类题',
  'add-review': '加入今日复习',
};

// 状态胶囊里的场景名：刻意用短名，一行放得下「场景 · 第 N 题 · 你在该词错过 M 次」。
const SCENE_LABELS = {
  meaning: '词义练习',
  quiz: '单词测验',
  mistake: '错题分析',
  reading: '文章阅读',
  exam: '考试讲解',
  homework: '作业讲解',
  tongbu: '同步训练',
  course: '课程学习',
  grammar: '语法专题',
  drill: '变式练习',
  review: '今日复习',
  smart: '智能学习台',
  general: '综合问答',
};

// 需要结构化讲解的动作：这些请求带 format:'card'，流式期间只显示骨架 + 已用秒数，
// 绝不把 JSON 片段当散文逐字渲染。
// 纯动作类（drill / add-review）保留文本模式：服务端返回的是 drill / actions 而不是卡片。
const CARD_ACTIONS = new Set(['', 'explain', 'explain-wrong', 'compare', 'explain-sentence']);

const PLACEMENT_KEY = 'lingoBloomAgentPlacement';
const WIDTH_KEY = 'lingoBloomAgentPanelWidth';
const PANEL_WIDTH_DEFAULT = 420;
const PANEL_WIDTH_MIN = 360;
const PANEL_WIDTH_MAX = 560;

// 长回答折叠（计划 §3 P2 验收里的「长回答折叠」）：只折叠「回落到 Markdown 的长散文回答」。
// 结构化教学卡片本身已经分节，而且底部行动条是 sticky 的——把卡片折起来会把「30 秒小动作」
// 一起藏掉，与 P2-4「关键动作永远在视口底部可见」冲突，所以卡片不参与折叠。
const FOLD_MIN_CHARS = 480;

function clampWidth(value) {
  const width = Math.round(Number(value) || PANEL_WIDTH_DEFAULT);
  return Math.min(PANEL_WIDTH_MAX, Math.max(PANEL_WIDTH_MIN, width));
}

function readPlacement() {
  try {
    const saved = window.localStorage.getItem(PLACEMENT_KEY);
    if (saved === 'dock' || saved === 'float') return saved;
  } catch (_) {}
  return 'float';
}

function readWidth() {
  try {
    const saved = Number(window.localStorage.getItem(WIDTH_KEY));
    if (Number.isFinite(saved) && saved > 0) return clampWidth(saved);
  } catch (_) {}
  return PANEL_WIDTH_DEFAULT;
}
export default {
  components: { AgentTeachingCard },
  props: { mode: { type: String, default: 'general' } },
  emits: ['open-drill', 'navigate', 'focus-item'],
  data: () => ({
    assistant,
    open: false,
    enabled: false,
    engine: 'codex-core',
    busy: false,
    error: '',
    hint: '',
    hintTimer: null,
    text: '',
    threadId: '',
    drill: null,
    milestone: null,
    nudgeTimer: null,
    placement: readPlacement(),
    panelWidth: readWidth(),
    resizing: false,
    elapsedSec: 0,
    streamTimer: null,
    streamStartedAt: 0,
    streamIndex: -1,
    pinTarget: -1,
    pinGuard: -1,
    pinAnchor: -1,
    runToken: 0,
    abort: null,
    reader: null,
    stopped: false,
    copyIndex: -1,
    copyHint: '',
    canSpeak: speechSupported(),
    messages: [{
      role: 'assistant',
      text: '你好！我是你的智能英语助教。打开练习页时我能看到你正在做的题目，可以直接讲题、对比易混词，或按你的错题出同类题。',
    }],
  }),
  computed: {
    engineLabel() {
      return this.engine === 'claude-code' ? 'Claude Code' : 'Codex Core';
    },
    // 状态胶囊：不再复述题干 / 音标 / 选项，只留一行「我在哪、这一题、这词错过几次」。
    // 数据全部来自页面上下文总线（learningContext），服务端能力不变。
    stateCapsule() {
      const context = this.assistant.context;
      if (!context) return '还没打开练习页，也可以直接问我问题';
      const parts = [SCENE_LABELS[context.scene] || SCENE_LABELS.general];
      const scope = this.sceneScope(context);
      if (scope) parts.push(scope);
      const progress = this.progressText(context);
      if (progress) parts.push(progress);
      if (!context.wordId && context.articleId) {
        const paragraph = Number(context.paragraph);
        parts.push(Number.isFinite(paragraph) && paragraph > 0 ? `第 ${paragraph} 段` : '整篇阅读');
      }
      const wrong = this.wrongText(context);
      if (wrong) parts.push(wrong);
      return parts.join(' · ');
    },
    canFocus() {
      const context = this.assistant.context;
      return !!(context && context.wordId);
    },
    elapsedText() {
      return Math.max(0, Math.floor(this.elapsedSec));
    },
    panelStyle() {
      if (this.placement !== 'float') return null;
      return { '--agent-panel-width': `${this.panelWidth}px` };
    },
    quickActions() {
      const context = this.assistant.context;
      if (!context) return [];
      if (context.articleId && !context.wordId) {
        return [{ id: 'explain-sentence', label: QUICK_LABELS['explain-sentence'] }];
      }
      if (!context.wordId) return [];
      const actions = [{ id: 'explain', label: QUICK_LABELS.explain }];
      if (context.selectedAnswer && context.correct === false) {
        actions.push({ id: 'explain-wrong', label: QUICK_LABELS['explain-wrong'] });
      }
      actions.push({ id: 'compare', label: QUICK_LABELS.compare });
      actions.push({ id: 'drill', label: QUICK_LABELS.drill });
      actions.push({ id: 'add-review', label: QUICK_LABELS['add-review'] });
      return actions;
    },
  },
  watch: {
    // 页面按钮按下后：展开面板并立刻发出这条问题。
    'assistant.openRequest'() {
      const pending = this.assistant.pending;
      if (!pending) return;
      this.assistant.pending = null;
      this.open = true;
      this.send(pending);
    },
    // 主动轻提示：出现后自动消失，不打断作答。
    'assistant.milestone'(value) {
      if (this.nudgeTimer) window.clearTimeout(this.nudgeTimer);
      this.milestone = value || null;
      if (!this.milestone) return;
      this.nudgeTimer = window.setTimeout(() => { this.milestone = null; }, 12000);
    },
    // 面板开合决定「停靠形态」是否让页面让位：只有栏真的在，main 才缩窄。
    open() {
      this.syncPlacementClass();
      if (!this.open) {
        stopSpeaking();
      } else if (this.pinTarget >= 0) {
        // 面板是关着的时候生成完的回答：一打开就把它钉到顶部。
        this.applyPin();
      }
    },
    // 拖宽 / 拖窄后让位宽度要同步，否则会露出一角被面板压住的可点区域。
    panelWidth() {
      this.syncPlacementClass();
    },
  },
  beforeUnmount() {
    if (this.nudgeTimer) window.clearTimeout(this.nudgeTimer);
    if (this.hintTimer) window.clearTimeout(this.hintTimer);
    this.stopTimer();
    stopSpeaking();
    try {
      document.body.classList.remove('agent-dock', 'agent-float', 'agent-open', 'agent-resizing');
      document.body.style.removeProperty('--agent-live-rail');
    } catch (_) {}
  },
  // 每次 DOM 更新后补一次：新回答的气泡就是在这类更新里出现的，
  // 之后沿用 pinBubble 记下的下标把它钉到顶部。
  updated() {
    if (this.pinTarget >= 0) this.applyPin();
  },
  async mounted() {
    this.syncPlacementClass();
    try {
      const status = await api('/api/agent/status');
      this.enabled = status.enabled;
      this.engine = status.engine || 'codex-core';
    } catch (_) {
      // 状态接口失败时保持隐藏，不影响练习页。
    }
    this.syncPlacementClass();
    if (this.open && this.pinTarget >= 0) this.applyPin();
  },
  methods: {
    renderMarkdown,
    // sceneScope 给「非词条页」补一个可核对的定位（哪一份同步训练 / 哪张卷 / 哪个单元 / 哪个语法专题）。
    // 这些页没有 wordId，只靠场景名学生不知道助教在看哪一份材料；只用页面已 publish 的字段，不新造数据。
    sceneScope(context) {
      if (!context) return '';
      const clean = (value) => String(value === undefined || value === null ? '' : value).trim();
      switch (context.scene) {
        case 'tongbu': {
          const title = clean(context.setTitle);
          if (title) return title;
          const unit = Number(context.unitIndex);
          return Number.isFinite(unit) && unit > 0 ? `Unit ${unit}` : '';
        }
        case 'course':
          return [clean(context.courseUnit), clean(context.courseSection)].filter(Boolean).join(' · ');
        case 'homework':
          return clean(context.homeworkTitle);
        case 'exam':
          return clean(context.examTitle);
        case 'grammar':
          return clean(context.grammarTopic);
        default:
          return '';
      }
    },
    // progressSource 统一取题号：优先 position；非词条页退回 questionNo / questionIndex（页面已 publish）。
    progressSource(context) {
      if (!context) return '';
      const has = (value) => value !== undefined && value !== null && String(value).trim() !== '';
      if (has(context.position)) return context.position;
      if (has(context.questionNo)) return context.questionNo;
      if (has(context.questionIndex)) return context.questionIndex;
      return '';
    },
    // progressText 统一渲染成「第 N / M 题」：M 来自 context.total，缺省就不显示分母。
    progressText(context) {
      const value = this.progressSource(context);
      const total = Number(context ? context.total : 0);
      const suffix = Number.isFinite(total) && total > 0 ? ` / ${total}` : '';
      if (typeof value === 'number' && value > 0) return `第 ${value}${suffix} 题`;
      const raw = String(value === undefined || value === null ? '' : value).trim();
      if (!raw) return '';
      return /^第/.test(raw) ? raw : `第 ${raw}${suffix} 题`;
    },
    wrongText(context) {
      const count = Number(context ? context.wrongTimes : 0);
      if (!Number.isFinite(count) || count <= 0) return '';
      return `你在该词错过 ${count} 次`;
    },
    focusItem() {
      const context = this.assistant.context || {};
      if (!context.wordId) return;
      // 面板只管上报「要看哪道题」，滚动与高亮由页面负责，避免两边抢滚动条。
      this.$emit('focus-item', { wordId: context.wordId, level: context.level || '' });
    },
    notify(message) {
      if (!message) return;
      this.hint = message;
      if (this.hintTimer) window.clearTimeout(this.hintTimer);
      this.hintTimer = window.setTimeout(() => {
        this.hint = '';
        this.hintTimer = null;
      }, 4000);
    },
    formatDuration(ms) {
      const value = Number(ms);
      if (!Number.isFinite(value) || value <= 0) return '';
      return `${(value / 1000).toFixed(1)} 秒`;
    },
    // ------------------------------------------------------------------ 形态
    setPlacement(value) {
      this.placement = value === 'dock' ? 'dock' : 'float';
      try {
        window.localStorage.setItem(PLACEMENT_KEY, this.placement);
      } catch (_) {}
      this.syncPlacementClass();
    },
    togglePlacement() {
      this.setPlacement(this.placement === 'dock' ? 'float' : 'dock');
    },
    // 面板根节点上的 agent-float / agent-dock 只是自身标记；真正让页面让位的规则是
    // `.agent-dock .app-content>main{...}`，它要求 .agent-dock 出现在 main 的祖先上，
    // 而面板是 main 的兄弟节点。因此把 class 镜像到 body 上，并且只在「停靠且面板开着」
    // 时加，否则页面会为了一个不存在的栏白白缩窄。
    syncPlacementClass() {
      try {
        const active = !!this.open && !!this.enabled;
        const docked = this.placement === 'dock' && active;
        document.body.classList.toggle('agent-dock', docked);
        document.body.classList.toggle('agent-float', !docked);
        // agent-open 表示"面板真的开着"：浮动形态也要靠它让页面留出空档。
        // 浮层压在错词栏 / 选项上不是"浮动"，是遮挡——实测 7/7 个错词按钮被盖住。
        document.body.classList.toggle('agent-open', active);
        // 让位宽度跟着面板真实宽度走，拖宽拖窄后都不遮挡。
        document.body.style.setProperty('--agent-live-rail', Math.round(this.panelWidth) + 'px');
      } catch (_) {}
    },
    startResize(event) {
      if (this.placement !== 'float' || !event) return;
      if (typeof event.button === 'number' && event.button !== 0) return;
      event.preventDefault();
      this.resizing = true;
      try {
        document.body.classList.add('agent-resizing');
      } catch (_) {}
      const startX = event.clientX;
      const startWidth = this.panelWidth;
      const move = (moveEvent) => {
        // 把手在面板左缘：往左拖是变宽。
        this.panelWidth = clampWidth(startWidth + (startX - moveEvent.clientX));
      };
      const stop = () => {
        this.resizing = false;
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', stop);
        window.removeEventListener('pointercancel', stop);
        try {
          document.body.classList.remove('agent-resizing');
          window.localStorage.setItem(WIDTH_KEY, String(this.panelWidth));
        } catch (_) {}
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', stop);
      window.addEventListener('pointercancel', stop);
    },
    nudgeWidth(delta) {
      this.panelWidth = clampWidth(this.panelWidth + delta);
      try {
        window.localStorage.setItem(WIDTH_KEY, String(this.panelWidth));
      } catch (_) {}
    },
    // ------------------------------------------------------------ 滚动与计时
    startTimer() {
      this.stopTimer();
      this.streamStartedAt = Date.now();
      this.elapsedSec = 0;
      this.streamTimer = window.setInterval(() => {
        this.elapsedSec = (Date.now() - this.streamStartedAt) / 1000;
      }, 250);
    },
    stopTimer() {
      if (this.streamTimer) {
        window.clearInterval(this.streamTimer);
        this.streamTimer = null;
      }
    },
    // 新回答开始时把这条气泡钉到顶部：长回答从第一句就在视口里，不跟着流式被拽到文末。
    // 面板可能还没挂上 DOM（页面按钮刚唤起、status 接口还没回来），所以先记下目标下标，
    // 等气泡真的渲染出来再钉（updated 会在下一次 DOM 更新时补上），绝不退化成「滚到文末」。
    pinBubble(index) {
      this.pinTarget = index;
      this.$nextTick(() => this.applyPin());
      this.scheduleSettlePin(index);
    },
    // 布局还没稳定时（面板刚挂上、上一条消息刚渲染完）有界地补钉几次：
    // 固定 3 次定时，不做常驻定时器；每次都要过 settlePin 的「用户没自己滚过」检查。
    scheduleSettlePin(index) {
      [140, 420, 900].forEach((delay) => {
        window.setTimeout(() => this.settlePin(index), delay);
      });
    },
    // 落钉子：DOM 里还没有这条气泡就什么都不做，交给 updated() 下一帧再试。
    applyPin() {
      const index = this.pinTarget;
      if (index < 0) return;
      const box = this.$refs.messages;
      const item = box ? box.querySelector(`[data-bubble="${index}"]`) : null;
      if (!box || !item) return;
      box.scrollTop = Math.max(0, item.offsetTop - 8);
      this.pinGuard = index;
      this.pinAnchor = box.scrollTop;   // 记住落点：用户后来自己滚过就不再校准
      this.pinTarget = -1;
    },
    // 校准：只有这一轮还握着护栏、并且用户没自己滚过（scrollTop 还停在钉子位置）时才重钉。
    settlePin(index) {
      if (this.pinGuard !== index) return;
      if (this.pinTarget >= 0) return;
      const box = this.$refs.messages;
      if (!box || Math.abs(box.scrollTop - this.pinAnchor) > 4) return;
      this.pinTarget = index;
      this.applyPin();
    },
    // 逐字追加时的温和跟随：只有用户本来就贴在底部才跟着走，翻上去读历史时不打扰。
    // 本轮回答已经被「钉顶部」过就整轮不再跟随，避免刚钉好又被拽到文末。
    followBottom() {
      if (this.pinGuard >= 0) return;
      this.$nextTick(() => {
        const box = this.$refs.messages;
        if (!box) return;
        const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
        if (nearBottom) box.scrollTop = box.scrollHeight;
      });
    },
    // ---------------------------------------------------------------- 流式
    // streamChat 读取 SSE：逐块返回文本，最后给出与非流式接口一致的结构。
    async streamChat(body, onDelta, options = {}) {
      const response = await fetch('/api/agent/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body),
        signal: options.signal || undefined,
      });
      if (!response.ok || !response.body) {
        const error = new Error(`流式接口不可用（${response.status}）`);
        error.status = response.status;
        throw error;
      }
      const reader = response.body.getReader();
      if (typeof options.onReader === 'function') options.onReader(reader);
      const decoder = new TextDecoder();
      let buffer = '';
      let final = null;
      let failure = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split('\n\n');
        buffer = frames.pop() || '';
        for (const frame of frames) {
          const line = frame.split('\n').find((item) => item.startsWith('data:'));
          if (!line) continue;
          let payload;
          try {
            payload = JSON.parse(line.slice(5).trim());
          } catch (_) {
            continue;
          }
          if (payload.type === 'delta') onDelta(payload.text || '');
          else if (payload.type === 'done') final = payload.response || null;
          else if (payload.type === 'error') failure = payload.message || '智能助手调用失败';
        }
      }
      if (failure) throw new Error(failure);
      if (!final) throw new Error('流式回答中断，请重试');
      return final;
    },
    stopStreaming() {
      const wasBusy = this.busy;
      this.stopped = true;
      this.stopTimer();
      const index = this.streamIndex;
      if (this.abort) {
        try {
          this.abort.abort();
        } catch (_) {}
      }
      if (this.reader) {
        try {
          const cancelled = this.reader.cancel();
          // cancel() 返回的 promise 必须自己接住：被 abort 过的流会让它以 AbortError 拒绝，
          // 不接住就在控制台留一条未处理异常（线上实测：点「停止生成」必现 AbortError，
          // 把 U23「交互全过程没有 JS 报错」直接打红）。
          if (cancelled && typeof cancelled.catch === 'function') cancelled.catch(() => {});
        } catch (_) {}
      }
      this.abort = null;
      this.reader = null;
      this.streamIndex = -1;
      this.pinGuard = -1;
      this.pinAnchor = -1;
      this.busy = false;
      if (index >= 0 && this.messages[index]) {
        const bubble = this.messages[index];
        bubble.pending = false;
        bubble.stopped = true;
        bubble.raw = '';
      } else if (wasBusy) {
        // 还没等到第一个增量就按了停止：这时连气泡都还没建，学生看到的是「我提了问题、
        // 然后什么都没有」。补一条 stopped 气泡，让「停止」有可见结果（模板里
        // 「已停止生成，这次没有内容。」这一支才有机会被用到）。
        this.messages.push({
          role: 'assistant',
          text: '',
          card: null,
          receipt: null,
          snapshotText: '',
          pending: false,
          stopped: true,
          failed: false,
          mode: 'card',
          raw: '',
          durationMs: 0,
          retryPayload: null,
        });
      }
    },
    // 错误翻译成学生看得懂的中文，并保留「重试」入口（this.error 复用既有状态）。
    describeError(error) {
      const status = error && error.status;
      const raw = String((error && error.message) || '').trim();
      if (error && error.name === 'AbortError') return '已停止生成。';
      if (status === 401 || status === 403) return '登录状态已过期，刷新页面重新登录后再试。';
      if (status === 429) return '问得有点快，等几秒再点「重试」。';
      if (status === 408 || status === 504) return '助教这次想太久了（超时），点「重试」再来一次。';
      if (typeof status === 'number' && status >= 500) return `助教服务暂时不可用（${status}），稍后点「重试」再来一次。`;
      if (!status && /failed to fetch|networkerror|load failed|network request failed/i.test(raw)) {
        return '网络好像断了，检查一下连接再点「重试」。';
      }
      if (raw) return raw;
      return '助教暂时不可用，请稍后重试。';
    },
    // ------------------------------------------------------------ 发送与重试
    openNudgeAction(action) {
      dismissMilestone();
      this.milestone = null;
      if (action.id === 'ask') {
        this.open = true;
        this.send({ message: '', quickAction: action.quickAction, label: action.label });
        return;
      }
      if (action.id === 'ask-text') {
        this.open = true;
        this.send({ message: action.message, label: action.label });
        return;
      }
      if (action.id === 'view') this.$emit('navigate', { view: action.view });
    },
    async send(payload = {}) {
      if (this.busy) return;
      const message = String(payload.message === undefined || payload.message === null ? this.text : payload.message).trim();
      const quickAction = payload.quickAction || '';
      if (!message && !quickAction) return;
      const label = payload.label || message || QUICK_LABELS[quickAction] || quickAction;
      const retryPayload = { message, quickAction, label };
      this.messages.push({ role: 'user', text: label });
      this.text = '';
      this.busy = true;
      this.error = '';
      this.hint = '';
      this.stopped = false;
      const runId = (this.runToken += 1);
      const wantCard = CARD_ACTIONS.has(quickAction);
      const body = {
        message,
        threadId: this.threadId,
        mode: this.mode,
        quickAction: quickAction || undefined,
        // 讲解类请求要结构化卡片；出题 / 入册这类纯动作仍走文本模式。
        format: wantCard ? 'card' : 'text',
        context: contextForRequest(),
      };
      // 结构化动作（出同类题、加入今日复习）没有可流式的内容，直接走 JSON。
      const canStream = typeof fetch === 'function' && quickAction !== 'drill' && quickAction !== 'add-review';
      const controller = typeof AbortController === 'function' ? new AbortController() : null;
      this.abort = controller;
      this.reader = null;
      // 注意：把普通对象 push 进响应式数组后，局部变量拿到的仍是原始对象，
      // 直接改它不会触发渲染（表现为流式文字只在结束时一次性出现）。因此流式
      // 追加一律通过 this.messages 的下标写入，保证文字真正逐块显示。
      let bubbleIndex = -1;
      this.streamIndex = -1;
      this.pinGuard = -1;
      this.pinAnchor = -1;
      const ensureBubble = () => {
        if (bubbleIndex >= 0) return this.messages[bubbleIndex];
        this.messages.push({
          role: 'assistant',
          text: '',
          card: null,
          receipt: null,
          snapshotText: '',
          pending: true,
          stopped: false,
          failed: false,
          mode: wantCard ? 'card' : 'text',
          raw: '',
          durationMs: 0,
          retryPayload,
        });
        bubbleIndex = this.messages.length - 1;
        this.streamIndex = bubbleIndex;
        this.pinBubble(bubbleIndex);
        if (wantCard) this.startTimer();
        return this.messages[bubbleIndex];
      };
      const appendDelta = (chunk) => {
        if (!chunk) return;
        const bubble = ensureBubble();
        if (bubble.mode === 'text') {
          bubble.text += chunk;
          this.followBottom();
          return;
        }
        // card 模式：delta 里是 JSON 片段，绝不逐字渲染；先攒着，
        // 万一服务端回的是普通文本（旧后端或兜底文案），再切回逐字显示，避免骨架一直转。
        bubble.raw += chunk;
        const head = bubble.raw.trimStart().slice(0, 1);
        if (head && head !== '{' && head !== '[') {
          bubble.mode = 'text';
          bubble.text = bubble.raw;
          bubble.raw = '';
        }
      };
      try {
        let out = null;
        if (canStream) {
          try {
            out = await this.streamChat(body, appendDelta, {
              signal: controller ? controller.signal : undefined,
              onReader: (reader) => { this.reader = reader; },
            });
          } catch (streamError) {
            // 已经显示了一部分内容、或用户主动停止时不能静默重试，否则答案会重复。
            if (this.stopped || bubbleIndex >= 0 || this.reader) throw streamError;
            out = await postJSON('/api/agent/chat', body);
          }
        } else {
          out = await postJSON('/api/agent/chat', body);
        }
        // 用户中途停止：迟到的结果不再写回界面，避免“停止后半截又冒出来”。
        if (this.stopped) return;
        if (out && out.threadId) this.threadId = out.threadId;
        let bubble = bubbleIndex >= 0 ? this.messages[bubbleIndex] : null;
        if (!bubble && out) {
          this.messages.push({
            role: 'assistant', text: '', card: null, receipt: null, snapshotText: '',
            pending: false, stopped: false, failed: false, mode: wantCard ? 'card' : 'text', raw: '', durationMs: 0, retryPayload,
          });
          bubbleIndex = this.messages.length - 1;
          bubble = this.messages[bubbleIndex];
        }
        if (bubble && out) {
          bubble.pending = false;
          bubble.failed = false;
          bubble.mode = wantCard ? 'card' : 'text';
          bubble.raw = '';
          bubble.text = out.message || bubble.text || '';
          bubble.card = out.card || null;
          bubble.receipt = out.receipt || null;
          bubble.snapshotText = out.snapshotText || '';
          bubble.durationMs = Number(out.durationMs) || 0;
          bubble.receiptOpen = false;
          // 有卡片就不显示原始 JSON 文本；没有卡片时 message 就是回答本身（回落 Markdown）。
          if (!bubble.card && !bubble.text) {
            bubble.text = '这次没有得到回答内容，可以点「重试」再来一次。';
          }
          // 回答落定后再校准一次钉子：流式期间上面的消息还在长高，早先算出的位置可能偏了。
          if (bubbleIndex >= 0 && this.pinGuard === bubbleIndex) {
            this.pinTarget = bubbleIndex;
            this.$nextTick(() => this.applyPin());
          }
        }
        for (const action of (out && out.actions) || []) {
          this.messages.push({ role: 'action', text: action.message || '已执行', view: action.type === 'add-review' ? 'review' : '' });
        }
        if (out && out.drill && out.drill.items && out.drill.items.length) {
          this.drill = out.drill;
          setDrill(out.drill);
          this.messages.push({
            role: 'assistant',
            text: `已按你的错题生成 ${out.drill.items.length} 道同类题，点下面的按钮就能直接练。`,
          });
        }
      } catch (error) {
        if (this.stopped) {
          // 主动停止不算错误：保留已经拿到的内容，不弹红条。
          if (bubbleIndex >= 0 && this.messages[bubbleIndex]) this.messages[bubbleIndex].pending = false;
        } else {
          if (bubbleIndex >= 0 && this.messages[bubbleIndex]) {
            const bubble = this.messages[bubbleIndex];
            bubble.pending = false;
            bubble.failed = true;
            bubble.raw = '';
          }
          this.error = this.describeError(error);
        }
      } finally {
        this.stopTimer();
        this.abort = null;
        this.reader = null;
        this.streamIndex = -1;
        this.pinGuard = -1;
        this.pinAnchor = -1;
        // 只有本轮还“活着”才收尾：用户停止后马上又发了一条时，不能被上一轮清掉 busy。
        if (runId === this.runToken) this.busy = false;
      }
    },
    ask(quickAction) {
      this.send({ message: '', quickAction, label: QUICK_LABELS[quickAction] || quickAction });
    },
    retryMessage(index) {
      if (this.busy) return;
      const bubble = this.messages[index];
      const payload = bubble && bubble.retryPayload;
      if (!payload) return;
      // 重试前把这条失败的问答撤掉，避免界面上留半截状态。
      const remove = [index];
      const previous = this.messages[index - 1];
      if (previous && previous.role === 'user' && previous.text === payload.label) remove.push(index - 1);
      remove.sort((a, b) => b - a).forEach((target) => this.messages.splice(target, 1));
      this.error = '';
      this.send(payload);
    },
    retryLast() {
      for (let index = this.messages.length - 1; index >= 0; index -= 1) {
        if (this.messages[index].retryPayload) {
          this.retryMessage(index);
          return;
        }
      }
    },
    // ------------------------------------------------------------ 长回答折叠
    // 判据用的是「回答本身的字数」而不是渲染出的像素高度：像素高度要等一帧才量得到，
    // 流式期间还会一直变，按字数判断才能保证折叠状态稳定、可断言。
    foldable(bubble) {
      if (!bubble || bubble.pending || bubble.stopped || bubble.card) return false;
      return String(bubble.text || "").trim().length > FOLD_MIN_CHARS;
    },
    folded(bubble) {
      return this.foldable(bubble) && bubble.foldOpen !== true;
    },
    toggleFold(index) {
      const bubble = this.messages[index];
      if (!bubble) return;
      bubble.foldOpen = !bubble.foldOpen;
    },

    // ------------------------------------------------------------ 卡片交互
    toggleReceipt(index) {
      const bubble = this.messages[index];
      if (!bubble) return;
      bubble.receiptOpen = !bubble.receiptOpen;
    },
    plainText(bubble) {
      const card = bubble && bubble.card;
      if (!card) return String((bubble && bubble.text) || '');
      const lines = [];
      if (card.headline) lines.push(card.headline);
      if (card.verdict) lines.push(card.verdict);
      for (const point of Array.isArray(card.points) ? card.points : []) {
        const body = String((point && point.text) || '').trim();
        if (!body) continue;
        lines.push(`【${String((point && point.label) || '要点').trim()}】${body}`);
      }
      if (card.example && (card.example.en || card.example.zh)) {
        lines.push([String(card.example.en || '').trim(), String(card.example.zh || '').trim()].filter(Boolean).join(' '));
      }
      if (card.check && (card.check.prompt || card.check.answer)) {
        lines.push(`自测：${String(card.check.prompt || '').trim()}（答案：${String(card.check.answer || '').trim()}）`);
      }
      if (Array.isArray(card.words) && card.words.length) {
        lines.push(`生词：${card.words.map((word) => {
          const value = String((word && word.word) || '').trim();
          const meaning = String((word && word.meaning) || '').trim();
          return meaning ? `${value}（${meaning}）` : value;
        }).join('、')}`);
      }
      if (card.action && (card.action.label || card.action.text)) {
        lines.push(`${String(card.action.label || '小动作').trim()}：${String(card.action.text || '').trim()}`);
      }
      return lines.join('\n');
    },
    async copyMessage(index) {
      const bubble = this.messages[index];
      if (!bubble) return;
      const value = this.plainText(bubble).trim();
      if (!value) {
        this.copyIndex = index;
        this.copyHint = '这条没有可复制的文字';
        return;
      }
      let copied = false;
      try {
        if (window.navigator && window.navigator.clipboard && window.navigator.clipboard.writeText) {
          await window.navigator.clipboard.writeText(value);
          copied = true;
        }
      } catch (_) {
        copied = false;
      }
      if (!copied) {
        // 非安全上下文 / 老浏览器兜底：临时 textarea + execCommand
        try {
          const area = document.createElement('textarea');
          area.value = value;
          area.setAttribute('readonly', '');
          area.style.position = 'fixed';
          area.style.top = '-1000px';
          area.style.opacity = '0';
          document.body.appendChild(area);
          area.select();
          copied = document.execCommand('copy');
          document.body.removeChild(area);
        } catch (_) {
          copied = false;
        }
      }
      this.copyIndex = index;
      this.copyHint = copied ? '已复制' : '复制失败，请手动选中文字';
      window.setTimeout(() => {
        if (this.copyIndex === index) {
          this.copyIndex = -1;
          this.copyHint = '';
        }
      }, 2500);
    },
    speakText(value) {
      const content = String(value === undefined || value === null ? '' : value).trim();
      if (!content) return;
      // 卡片里的英文词 / 例句一律走英文语音。
      if (!this.canSpeak || !speak(content, { lang: 'en-US' })) {
        this.notify('这个浏览器暂时不能朗读，可以先看文字。');
      }
    },
    speakWhole(index) {
      const bubble = this.messages[index];
      if (!bubble) return;
      const value = this.plainText(bubble).slice(0, 600).trim();
      if (!value) {
        this.notify('这条没有可朗读的内容。');
        return;
      }
      // 整段以中文讲解为主，用中文语音；单个英文词的点读走卡片里的 🔊（en-US）。
      if (!this.canSpeak || !speak(value, { lang: 'zh-CN', rate: 0.95 })) {
        this.notify('这个浏览器暂时不能朗读，可以先看文字。');
      }
    },
    addReviewFromCard(word) {
      const target = word || {};
      const wordId = String(target.id || target.word || '').trim();
      const label = String(target.word || wordId).trim();
      if (!wordId) {
        this.notify('这个单词定位不到词库，先看讲解。');
        return;
      }
      if (this.busy) {
        this.notify('助教还在处理上一个问题，稍等一下。');
        return;
      }
      const context = contextForRequest();
      // 当前题就是这个词：直接用既有的确定性动作，最准确。
      if (context.wordId && context.wordId === wordId) {
        this.send({ message: '', quickAction: 'add-review', label: `加入今日复习：${label}` });
        return;
      }
      // 卡片里的生词不是当前题：把定位字段临时对齐到这个词再发动作请求。
      // 服务端仍按词库校验 wordId / level（前端只传 id），而「加入今日复习」是
      // 确定性动作、不调用模型，所以既不会认错词，也不会污染讲解内容。
      this.messages.push({ role: 'user', text: `加入今日复习：${label}` });
      this.busy = true;
      this.error = '';
      const runId = (this.runToken += 1);
      const body = {
        message: '',
        threadId: this.threadId,
        mode: this.mode,
        quickAction: 'add-review',
        context: { ...context, wordId, level: String(target.level || context.level || '').trim() },
      };
      postJSON('/api/agent/chat', body)
        .then((out) => {
          if (out && out.threadId) this.threadId = out.threadId;
          const actions = (out && out.actions) || [];
          for (const action of actions) {
            this.messages.push({ role: 'action', text: action.message || '已执行', view: action.type === 'add-review' ? 'review' : '' });
          }
          if (!actions.length) this.notify(`已提交「${label}」加入今日复习。`);
        })
        .catch((error) => {
          this.error = this.describeError(error);
        })
        .then(() => {
          if (runId === this.runToken) this.busy = false;
          this.followBottom();
        });
    },
    askFromCard(payload) {
      const action = payload || {};
      const quickAction = action.quickAction || '';
      if (!quickAction) {
        this.notify('这个动作暂时还不能执行。');
        return;
      }
      this.send({ message: '', quickAction, label: action.label || QUICK_LABELS[quickAction] || quickAction });
    },
    openDrill() {
      if (!this.drill) return;
      setDrill(this.drill);
      this.$emit('open-drill', this.drill);
      this.open = false;
    },
    newChat() {
      if (this.busy) this.stopStreaming();
      stopSpeaking();
      this.threadId = '';
      this.drill = null;
      this.error = '';
      this.hint = '';
      this.messages = [{ role: 'assistant', text: '新对话已开始。今天想学什么？' }];
    },
  },
  template: `
    <div v-if="enabled" class="agent-assistant" :class="placement === 'dock' ? 'agent-dock' : 'agent-float'">
      <button class="agent-fab" @click="open=!open" title="智能英语助教">🤖<span>AI 助学</span></button>
      <aside v-if="milestone" class="agent-nudge" role="status">
        <b>{{ milestone.title }}</b>
        <p>{{ milestone.detail }}</p>
        <div>
          <button v-for="action in milestone.actions" :key="action.label" class="primary" @click="openNudgeAction(action)">{{ action.label }}</button>
          <button @click="milestone=null">知道了</button>
        </div>
      </aside>
      <section v-if="open" class="agent-panel" :style="panelStyle">
        <div class="agent-resize" role="separator" aria-orientation="vertical" tabindex="0"
             title="左右拖动调整面板宽度" @pointerdown="startResize"
             @keydown.left.prevent="nudgeWidth(20)" @keydown.right.prevent="nudgeWidth(-20)"></div>
        <header>
          <div><b>智能英语助教</b><small>由 {{ engineLabel }} 驱动</small></div>
          <button @click="togglePlacement" :title="placement==='dock' ? '改回浮动面板' : '停靠到右侧，页面自动让位'">{{ placement==='dock' ? '浮动' : '停靠' }}</button>
          <button @click="newChat">新对话</button>
          <button @click="open=false">×</button>
        </header>

        <div class="agent-context is-capsule" :class="{'is-empty':!assistant.context}">
          <div class="agent-statechip" :class="{'is-empty':!assistant.context}">
            <span class="agent-statechip-dot"></span>
            <span class="agent-statechip-text">{{ stateCapsule }}</span>
            <button v-if="canFocus" type="button" class="agent-statechip-focus" @click="focusItem">定位题目</button>
          </div>
        </div>

        <div v-if="quickActions.length" class="agent-quick">
          <button v-for="action in quickActions" :key="action.id" :disabled="busy" @click="ask(action.id)">{{ action.label }}</button>
        </div>

        <main ref="messages">
          <article v-for="(m,i) in messages" :key="i" :class="[m.role, {'has-card': !!m.card}]" :data-bubble="i">
            <b>{{ m.role==='user' ? '我' : (m.role==='action' ? '已执行' : '助教') }}</b>
            <template v-if="m.role==='assistant'">
              <agent-teaching-card v-if="m.card" :card="m.card" @speak="speakText" @add-review="addReviewFromCard" @ask="askFromCard" />
              <div v-else-if="m.pending && !m.text" class="agent-skeleton">
                <div class="agent-skeleton-head">
                  <span class="agent-skeleton-dot"></span>
                  <span>{{ m.mode==='card' ? '助教正在整理这道题的讲解' : '助教正在思考' }} · 已用 {{ elapsedText }} 秒</span>
                </div>
                <div class="agent-skeleton-line w1"></div>
                <div class="agent-skeleton-line w2"></div>
                <div class="agent-skeleton-line w3"></div>
              </div>
              <template v-else-if="m.text">
                <div class="agent-answer-fold" :class="{'is-folded':folded(m)}">
                  <div class="agent-markdown" v-html="renderMarkdown(m.text)"></div>
                </div>
                <button v-if="foldable(m)" type="button" class="agent-fold" :aria-expanded="String(!folded(m))" @click="toggleFold(i)">{{ folded(m) ? "展开全文" : "收起" }}</button>
              </template>
              <p v-else class="agent-empty-answer">{{ m.stopped ? '已停止生成，这次没有内容。' : '这次没有得到回答内容，可以点「重试」再来一次。' }}</p>
              <div v-if="m.receipt && (m.receipt.items||[]).length" class="agent-receipt" :class="{'is-stale':m.receipt.stale}">
                <button type="button" class="agent-receipt-head" :aria-expanded="String(!!m.receiptOpen)" @click="toggleReceipt(i)">
                  <span class="agent-receipt-title">助教已读</span>
                  <span v-for="item in m.receipt.items" :key="item.key" class="agent-receipt-chip" :class="{'is-miss':item.ok===false}">{{ item.label }}</span>
                  <span class="agent-receipt-more">{{ m.receiptOpen ? '收起快照' : '查看读了什么' }}</span>
                </button>
                <p v-if="m.receipt.stale" class="agent-receipt-note">页面上下文已过期（超过 5 分钟），这次回答没有用到当前题目。</p>
                <pre v-else-if="m.receiptOpen" class="agent-receipt-text">{{ m.receipt.text || m.snapshotText || '（这次没有可展开的快照原文）' }}</pre>
              </div>

              <div v-if="!m.pending && (m.card || m.retryPayload)" class="agent-msg-actions">
                <small v-if="m.durationMs">{{ formatDuration(m.durationMs) }}</small>
                <span v-if="m.stopped" class="agent-stopped">已停止</span>
                <button type="button" @click="retryMessage(i)">重试</button>
                <button type="button" @click="copyMessage(i)">复制</button>
                <button v-if="canSpeak" type="button" @click="speakWhole(i)">朗读整段</button>
                <small v-if="copyIndex === i" class="agent-copy-hint">{{ copyHint }}</small>
              </div>
            </template>
            <p v-else>{{ m.text }}</p>
            <button v-if="m.role==='action' && m.view" class="agent-inline-link" @click="$emit('navigate',{view:m.view})">去看看 →</button>
          </article>
        </main>

        <div v-if="drill" class="agent-drill">
          <header><b>{{ drill.title }}</b><button @click="drill=null">×</button></header>
          <p v-if="drill.focus" class="agent-drill-focus">{{ drill.focus }}</p>
          <ol>
            <li v-for="item in drill.items" :key="item.word.level + ':' + item.word.id">
              <b>{{ item.word.word }}</b><span>{{ item.prompt }}</span>
            </li>
          </ol>
          <button class="primary" @click="openDrill()">开始练习这 {{ drill.items.length }} 道题</button>
        </div>

        <div v-if="error" class="agent-error">
          <span>{{ error }}</span>
          <button type="button" class="agent-error-retry" @click="retryLast()">重试</button>
        </div>
        <div v-else-if="hint" class="agent-error is-hint">{{ hint }}</div>
        <div v-if="busy" class="agent-streambar">
          <span>助教正在作答 · 已用 {{ elapsedText }} 秒</span>
          <button type="button" class="agent-stop" @click="stopStreaming">停止生成</button>
        </div>
        <footer>
          <textarea v-model="text" @keydown.enter.exact.prevent="send()" rows="2" placeholder="输入学习问题，Enter 发送"></textarea>
          <button :disabled="busy||!text.trim()" @click="send()">发送</button>
        </footer>
      </section>
    </div>
  `,
};