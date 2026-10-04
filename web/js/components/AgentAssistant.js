// 智能英语助教面板。
//
// 它是“题目旁边的教练”而不是通用聊天框：顶部固定显示当前题目（来自 learningContext
// 总线），下面给出针对这道题的快捷动作，答完还能把助教生成的变式练习直接带到练习页。
import { api, postJSON } from '../api.js';
import { renderMarkdown } from '../markdown.js';
import assistant, { contextForRequest, dismissMilestone, setDrill } from '../learningContext.js?v=20261004-practice-source-r1';

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

const SCENE_LABELS = {
  meaning: '正在练习 · 词义练习',
  quiz: '正在测验 · 单词测验',
  mistake: '错题本 · 归因分析',
  reading: '正在阅读',
  general: '综合问答',
};

export default {
  props: { mode: { type: String, default: 'general' } },
  emits: ['open-drill', 'navigate'],
  data: () => ({
    assistant,
    open: false,
    enabled: false,
    engine: 'codex-core',
    busy: false,
    error: '',
    text: '',
    threadId: '',
    drill: null,
    milestone: null,
    nudgeTimer: null,
    messages: [{
      role: 'assistant',
      text: '你好！我是你的智能英语助教。打开练习页时我能看到你正在做的题目，可以直接讲题、对比易混词，或按你的错题出同类题。',
    }],
  }),
  computed: {
    engineLabel() {
      return this.engine === 'claude-code' ? 'Claude Code' : 'Codex Core';
    },
    // 题目卡片：把总线上的上下文翻译成学生看得懂的一行行信息。
    contextCard() {
      const context = this.assistant.context;
      if (!context) return null;
      const sceneLabel = SCENE_LABELS[context.scene] || SCENE_LABELS.general;
      if (!context.wordId) {
        if (!context.articleId) return null;
        return {
          kind: 'reading',
          sceneLabel,
          title: context.articleTitle || '文章阅读',
          subtitle: context.paragraph ? `第 ${context.paragraph} 段` : '',
          options: [],
        };
      }
      const options = (context.options || []).map((text, index) => {
        let state = '';
        if (context.correctAnswer && text === context.correctAnswer) state = 'correct';
        else if (context.correct === false && text === context.selectedAnswer) state = 'wrong';
        return { text, index, state };
      });
      const progress = context.position
        ? `第 ${context.position}${context.total ? ' / ' + context.total : ''} 题`
        : '';
      let verdict = '';
      if (context.selectedAnswer) {
        verdict = context.correct === false
          ? `你选了「${context.selectedAnswer}」，正确答案是「${context.correctAnswer}」`
          : `答对了：${context.correctAnswer || context.selectedAnswer}`;
      } else {
        verdict = '还没作答，我可以先讲讲这道题。';
      }
      return {
        kind: 'word',
        sceneLabel,
        progress,
        spelling: context.spelling || context.wordId,
        phonetic: context.phonetic || '',
        options,
        verdict,
      };
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
  },
  beforeUnmount() {
    if (this.nudgeTimer) window.clearTimeout(this.nudgeTimer);
  },
  async mounted() {
    try {
      const status = await api('/api/agent/status');
      this.enabled = status.enabled;
      this.engine = status.engine || 'codex-core';
    } catch (_) {
      // 状态接口失败时保持隐藏，不影响练习页。
    }
  },
  methods: {
    renderMarkdown,
    scrollMessages() {
      this.$nextTick(() => {
        const box = this.$refs.messages;
        if (box) box.scrollTop = box.scrollHeight;
      });
    },
    // streamChat 读取 SSE：逐块返回文本，最后给出与非流式接口一致的结构。
    async streamChat(body, onDelta) {
      const response = await fetch('/api/agent/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body),
      });
      if (!response.ok || !response.body) throw new Error(`流式接口不可用（${response.status}）`);
      const reader = response.body.getReader();
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
      const message = String(payload.message ?? this.text ?? '').trim();
      const quickAction = payload.quickAction || '';
      if (!message && !quickAction) return;
      this.messages.push({ role: 'user', text: payload.label || message });
      this.text = '';
      this.busy = true;
      this.error = '';
      const body = {
        message,
        threadId: this.threadId,
        mode: this.mode,
        quickAction: quickAction || undefined,
        context: contextForRequest(),
      };
      // 结构化动作（出同类题、加入今日复习）没有可流式的内容，直接走 JSON。
      const canStream = typeof fetch === 'function' && quickAction !== 'drill' && quickAction !== 'add-review';
      // 注意：把普通对象 push 进响应式数组后，局部变量拿到的仍是原始对象，
      // 直接改它不会触发渲染（表现为流式文字只在结束时一次性出现）。因此流式
      // 追加一律通过 this.messages 的下标写入，保证文字真正逐块显示。
      let bubbleIndex = -1;
      const hasBubble = () => bubbleIndex >= 0;
      const appendDelta = (chunk) => {
        if (!chunk) return;
        if (!hasBubble()) {
          this.messages.push({ role: 'assistant', text: '' });
          bubbleIndex = this.messages.length - 1;
        }
        this.messages[bubbleIndex].text += chunk;
        this.scrollMessages();
      };
      try {
        let out = null;
        if (canStream) {
          try {
            out = await this.streamChat(body, appendDelta);
          } catch (streamError) {
            // 已经显示了一部分文字就不能静默重试，否则答案会重复。
            if (hasBubble()) throw streamError;
            out = await postJSON('/api/agent/chat', body);
          }
        } else {
          out = await postJSON('/api/agent/chat', body);
        }
        if (out.threadId) this.threadId = out.threadId;
        if (out.message) {
          if (hasBubble()) this.messages[bubbleIndex].text = out.message;
          else this.messages.push({ role: 'assistant', text: out.message });
        }
        for (const action of out.actions || []) {
          this.messages.push({ role: 'action', text: action.message || '已执行', view: action.type === 'add-review' ? 'review' : '' });
        }
        if (out.drill && out.drill.items?.length) {
          this.drill = out.drill;
          setDrill(out.drill);
          this.messages.push({
            role: 'assistant',
            text: `已按你的错题生成 ${out.drill.items.length} 道同类题，点下面的按钮就能直接练。`,
          });
        }
      } catch (error) {
        this.error = error.message || '助教暂时不可用，请稍后再试。';
      } finally {
        this.busy = false;
        this.scrollMessages();
      }
    },
    ask(quickAction) {
      this.send({ message: '', quickAction, label: QUICK_LABELS[quickAction] || quickAction });
    },
    openDrill() {
      if (!this.drill) return;
      setDrill(this.drill);
      this.$emit('open-drill', this.drill);
      this.open = false;
    },
    newChat() {
      this.threadId = '';
      this.drill = null;
      this.error = '';
      this.messages = [{ role: 'assistant', text: '新对话已开始。今天想学什么？' }];
    },
  },
  template: `
    <div v-if="enabled" class="agent-assistant">
      <button class="agent-fab" @click="open=!open" title="智能英语助教">🤖<span>AI 助学</span></button>
      <aside v-if="milestone" class="agent-nudge" role="status">
        <b>{{ milestone.title }}</b>
        <p>{{ milestone.detail }}</p>
        <div>
          <button v-for="action in milestone.actions" :key="action.label" class="primary" @click="openNudgeAction(action)">{{ action.label }}</button>
          <button @click="milestone=null">知道了</button>
        </div>
      </aside>
      <section v-if="open" class="agent-panel">
        <header>
          <div><b>智能英语助教</b><small>由 {{ engineLabel }} 驱动</small></div>
          <button @click="newChat">新对话</button>
          <button @click="open=false">×</button>
        </header>

        <div class="agent-context" :class="{'is-empty':!contextCard}">
          <template v-if="contextCard">
            <div class="agent-context-head">
              <span>{{ contextCard.sceneLabel }}</span>
              <small v-if="contextCard.progress">{{ contextCard.progress }}</small>
            </div>
            <template v-if="contextCard.kind==='word'">
              <p class="agent-context-word"><b>{{ contextCard.spelling }}</b><em v-if="contextCard.phonetic">{{ contextCard.phonetic }}</em></p>
              <div v-if="contextCard.options.length" class="agent-context-options">
                <span v-for="option in contextCard.options" :key="option.index" :class="option.state">{{ option.index + 1 }}. {{ option.text }}</span>
              </div>
              <p class="agent-context-verdict">{{ contextCard.verdict }}</p>
            </template>
            <template v-else>
              <p class="agent-context-word"><b>{{ contextCard.title }}</b><em v-if="contextCard.subtitle">{{ contextCard.subtitle }}</em></p>
            </template>
          </template>
          <p v-else>打开任意练习页，我会自动看到你正在做的题目。</p>
        </div>

        <div v-if="quickActions.length" class="agent-quick">
          <button v-for="action in quickActions" :key="action.id" :disabled="busy" @click="ask(action.id)">{{ action.label }}</button>
        </div>

        <main ref="messages">
          <article v-for="(m,i) in messages" :key="i" :class="m.role">
            <b>{{ m.role==='user' ? '我' : (m.role==='action' ? '已执行' : '助教') }}</b>
            <div v-if="m.role==='assistant'" class="agent-markdown" v-html="renderMarkdown(m.text)"></div>
            <p v-else>{{ m.text }}</p>
            <button v-if="m.role==='action' && m.view" class="agent-inline-link" @click="$emit('navigate',{view:m.view})">去看看 →</button>
          </article>
          <p v-if="busy" class="agent-thinking">正在思考...</p>
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

        <div v-if="error" class="agent-error">{{ error }}</div>
        <footer>
          <textarea v-model="text" @keydown.enter.exact.prevent="send()" rows="2" placeholder="输入学习问题，Enter 发送"></textarea>
          <button :disabled="busy||!text.trim()" @click="send()">发送</button>
        </footer>
      </section>
    </div>
  `,
};
