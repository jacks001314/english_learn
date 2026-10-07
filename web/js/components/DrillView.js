// 变式练习页：助教根据学生的错题生成的同类题。
//
// 题目的单词、选项和答案都来自词库，判分沿用 /api/quiz/answer（与单词测验、词义练习
// 同一个引擎），所以“AI 出的题”不会和站内的标准答案打架。
import { noteAnswer, publishContext } from '../learningContext.js?v=20261007-agent-leakfix-r1';

const AUTO_NEXT_DELAY_MS = 750;

export default {
  props: {
    drill: { type: Object, default: null },
    // 助教面板「定位题目」下发的目标：{ wordId, level, token }
    focusTarget: { type: Object, default: null },
  },
  emits: ['navigate', 'speak', 'answered'],
  data() {
    return {
      index: 0,
      answers: {},
      busy: false,
      error: '',
      autoTimer: null,
      autoPending: false,
      startedAt: Date.now(),
      focusHighlight: false,
      focusTimer: null,
    };
  },
  computed: {
    items() {
      return this.drill?.items || [];
    },
    current() {
      return this.items[this.index] || null;
    },
    currentKey() {
      const item = this.current;
      return item ? `${item.word.level}:${item.word.id}` : '';
    },
    currentAnswer() {
      return this.currentKey ? this.answers[this.currentKey] || null : null;
    },
    answered() {
      return !!this.currentAnswer;
    },
    selectedAnswer() {
      return this.currentAnswer ? this.currentAnswer.selected : '';
    },
    correctAnswer() {
      return this.currentAnswer ? this.currentAnswer.answer : '';
    },
    feedbackCorrect() {
      return !!this.currentAnswer && this.currentAnswer.correct;
    },
    answeredCount() {
      return Object.keys(this.answers).length;
    },
    correctCount() {
      return Object.values(this.answers).filter((entry) => entry.correct).length;
    },
    accuracy() {
      return Math.round((this.correctCount * 100) / Math.max(1, this.answeredCount));
    },
    finished() {
      return this.items.length > 0 && this.answeredCount >= this.items.length;
    },
    wrongItems() {
      return this.items.filter((item) => {
        const entry = this.answers[`${item.word.level}:${item.word.id}`];
        return entry && !entry.correct;
      });
    },
    sourceLabel() {
      if (!this.drill) return '';
      return this.drill.source === 'agent' ? '助教针对你的错题生成' : '按词库同类词生成';
    },
  },
  watch: {
    drill() {
      this.reset();
    },
    // 换题、作答都重新上报，助教看到的是“这一道”而不是上一次的题（契约 §5）。
    index() {
      this.publishContext();
    },
    answers() {
      this.publishContext();
    },
    focusTarget(target) {
      this.locateFocus(target);
    },
  },
  mounted() {
    this.publishContext();
  },
  beforeUnmount() {
    this.cancelAutoNext();
    if (this.focusTimer) window.clearTimeout(this.focusTimer);
  },
  methods: {
    // 把“正在做哪一组变式题、第几题”发布到学习上下文总线（契约 §5）。
    publishContext() {
      const drill = this.drill;
      const item = this.current;
      if (!drill && !item) return;
      const entry = this.currentAnswer;
      publishContext({
        view: "drill",
        scene: "drill",
        level: (item && item.word && item.word.level) || (drill && drill.level) || "all",
        wordId: (item && item.word && item.word.id) || (drill && drill.wordId) || "",
        spelling: (item && item.word && item.word.word) || (drill && drill.spelling) || "",
        prompt: (item && item.prompt) || "",
        options: (item && item.options) || [],
        correctAnswer: entry ? entry.answer : ((item && item.answer) || ""),
        selectedAnswer: entry ? entry.selected : "",
        correct: entry ? !!entry.correct : undefined,
        wrongTimes: entry && !entry.correct ? 1 : 0,
        position: this.items.length ? this.index + 1 : 0,
        total: this.items.length,
        answered: this.answeredCount,
        sessionCorrect: this.correctCount,
        drillFocus: (drill && (drill.focus || drill.title)) || "",
        drillCount: this.items.length,
      });
    },
    reset() {
      this.cancelAutoNext();
      this.index = 0;
      this.answers = {};
      this.error = '';
      this.startedAt = Date.now();
      this.publishContext();
    },
    cancelAutoNext() {
      this.autoPending = false;
      if (!this.autoTimer) return;
      window.clearTimeout(this.autoTimer);
      this.autoTimer = null;
    },
    scheduleAutoNext() {
      this.cancelAutoNext();
      const key = this.currentKey;
      this.autoPending = true;
      this.autoTimer = window.setTimeout(() => {
        this.autoTimer = null;
        this.autoPending = false;
        // 等待期间学生可能手动翻题，只有仍是刚才答对的那道题才前进。
        if (this.currentKey !== key || !this.feedbackCorrect) return;
        this.next();
      }, AUTO_NEXT_DELAY_MS);
    },
    optionClass(option) {
      if (!this.answered) return {};
      return {
        correct: option === this.correctAnswer,
        wrong: !this.feedbackCorrect && option === this.selectedAnswer,
      };
    },
    async answer(option) {
      if (this.answered || !this.current || this.busy) return;
      const item = this.current;
      const key = this.currentKey;
      this.busy = true;
      this.error = '';
      try {
        const feedback = await window.fetch('/api/quiz/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: item.word.level,
            wordId: item.word.id,
            type: item.type,
            answer: option,
          }),
        });
        const body = await feedback.json();
        if (!feedback.ok) throw new Error(body.error || '提交答案失败');
        this.answers = {
          ...this.answers,
          [key]: { selected: String(option), answer: String(body.answer || item.answer), correct: !!body.correct },
        };
        this.$emit('answered');
        noteAnswer(!!body.correct);
        if (body.correct) this.scheduleAutoNext();
      } catch (error) {
        this.error = error.message || '提交答案失败，请重试。';
      } finally {
        this.busy = false;
      }
    },
    previous() {
      this.cancelAutoNext();
      if (this.index > 0) this.index -= 1;
    },
    next() {
      this.cancelAutoNext();
      if (this.index < this.items.length - 1) this.index += 1;
    },
    goTo(position) {
      this.cancelAutoNext();
      this.index = position;
    },
    speakCurrent() {
      if (this.current) this.$emit('speak', this.current.word.word);
    },
    // 助教面板的「定位题目」：本组变式题里有这道题就跳过去并高亮两秒。
    locateFocus(target) {
      const wanted = String(target?.wordId || '').trim().toLowerCase();
      if (!wanted) return;
      const position = this.items.findIndex((item) => String(item.word?.id || '').trim().toLowerCase() === wanted);
      if (position < 0) return;   // 不在本组题里：交给 main.js 的兜底提示
      this.cancelAutoNext();
      this.index = position;
      this.publishContext();
      this.flashFocus();
    },
    flashFocus() {
      if (this.focusTimer) window.clearTimeout(this.focusTimer);
      this.focusHighlight = true;
      this.$nextTick(() => {
        const card = this.$refs.answerCard;
        if (card && card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      this.focusTimer = window.setTimeout(() => { this.focusHighlight = false; }, 2000);
    },
  },
  template: `
    <section class="view drill-view">
      <div class="section-heading">
        <div>
          <span class="tag">TARGETED DRILL</span>
          <h2>{{ drill ? drill.title : '变式练习' }}</h2>
          <p class="drill-source">{{ sourceLabel }}</p>
        </div>
        <button @click="$emit('navigate',{view:'mistakes'})">打开错题本</button>
      </div>

      <p v-if="error" class="drill-error" role="alert">{{ error }}</p>
      <div v-if="!items.length" class="empty">还没有可练习的题目，请回到练习页让助教出题。</div>

      <template v-else>
        <div class="drill-progress" aria-label="变式练习进度">
          <div>
            <span
              v-for="(item,position) in items"
              :key="item.word.level + ':' + item.word.id"
              :class="[answers[item.word.level + ':' + item.word.id] ? (answers[item.word.level + ':' + item.word.id].correct ? 'correct' : 'wrong') : '', {current:position===index}]"
              @click="goTo(position)"
            >{{ position + 1 }}</span>
          </div>
          <small>已做 {{ answeredCount }} / {{ items.length }} · 答对 {{ correctCount }}（{{ accuracy }}%）</small>
        </div>

        <div v-if="finished" class="drill-result">
          <h3>{{ accuracy }}%</h3>
          <p>答对 {{ correctCount }} / {{ answeredCount }} 题{{ wrongItems.length ? '，下面这些词再巩固一下。' : '，全部答对！' }}</p>
          <div v-if="wrongItems.length" class="drill-wrong-list">
            <button v-for="item in wrongItems" :key="item.word.level + ':' + item.word.id" @click="$emit('navigate',{view:'learn',word:item.word,level:item.word.level})">
              <span><b>{{ item.word.word }}</b><small>{{ item.word.meaning }}</small></span><em>查看 →</em>
            </button>
          </div>
          <div class="drill-result-actions">
            <button class="primary" @click="reset()">再做一遍</button>
            <button @click="$emit('navigate',{view:'mistakes'})">去错题本</button>
          </div>
        </div>

        <div v-else-if="current" class="drill-card" :class="{'is-agent-focus':focusHighlight}" :style="focusHighlight ? {boxShadow:'0 0 0 3px rgba(247, 181, 0, .85)'} : null" ref="answerCard">
          <div class="drill-counter">第 {{ index + 1 }} / {{ items.length }} 题</div>
          <p class="drill-prompt">{{ current.prompt }}</p>
          <div v-if="current.type === 'en-zh'" class="phonetic">{{ current.word.phonetic || '暂无音标' }}</div>
          <button v-if="current.type === 'en-zh' || current.type === 'listen'" class="sound" @click="speakCurrent()">▶ 听一听</button>
          <div class="options">
            <button
              v-for="(option,position) in current.options"
              :key="option"
              :class="optionClass(option)"
              :disabled="answered || busy"
              @click="answer(option)"
            ><kbd>{{ position + 1 }}</kbd><span>{{ option }}</span><i v-if="answered&&option===correctAnswer">正确</i><i v-else-if="answered&&!feedbackCorrect&&option===selectedAnswer">你的答案</i></button>
          </div>
          <div v-if="answered" class="drill-feedback" :class="feedbackCorrect?'is-correct':'is-wrong'" aria-live="polite">
            <b>{{ feedbackCorrect ? '回答正确' : '再巩固一下' }}</b>
            <span>{{ feedbackCorrect ? '答对了，注意和同类词区分。' : '正确答案是：' + correctAnswer }}</span>
            <em v-if="autoPending">正在进入下一题…</em>
          </div>
          <div class="drill-nav">
            <button :disabled="index<=0" @click="previous()">← 上一题</button>
            <button :disabled="index>=items.length-1" @click="next()">下一题 →</button>
          </div>
        </div>
      </template>
    </section>
  `,
};
