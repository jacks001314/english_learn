import { publishContext, askAssistant } from '../learningContext.js?v=20261004-practice-source-r1';

// 反馈条上的提问入口：文案在页面里，问题本身由服务端按场景生成。
const ASK_LABELS = { explain: '讲讲这道题', 'explain-wrong': '为什么我选错了', compare: '易混词对比', drill: '出同类题', 'add-review': '加入今日复习' };

// 答对后自动进入下一题：等待时间与开关的本地存储键和词义练习保持一致。
const AUTO_NEXT_DELAY_MS = 750;
const AUTO_NEXT_STORAGE_KEY = 'english-learn-auto-next-v1';

export default {
  props: {
    quiz: Object,
    hint: String,
    answered: Boolean,
    type: String,
    session: Object,
    selectedAnswer: String,
    correctAnswer: String,
    feedbackCorrect: Boolean,
    resumed: Boolean,
  },
  emits: [
    "update:type",
    "change",
    "speak",
    "answer",
    "next",
    "restart",
    "navigate",
  ],
  data() {
    return { spelling: "", autoNext: true, autoNextTimer: null, autoNextPending: false };
  },
  watch: {
    quiz() {
      this.spelling = "";
      this.cancelAutoNext();
      this.publishContext();
    },
    // 父组件判分完成后才把 feedbackCorrect 置为 true，这里只在“确实答对”时排一次跳转。
    feedbackCorrect(value) {
      if (value && this.answered && !this.resumed) this.scheduleAutoNext();
      else this.cancelAutoNext();
      this.publishContext();
    },
    answered(value) {
      if (!value) this.cancelAutoNext();
      this.publishContext();
    },
    resumed(value) {
      if (value) this.cancelAutoNext();
    },
  },
  computed: {
    finished() {
      return this.session.answered >= 10;
    },
    accuracy() {
      return Math.round(
        (this.session.correct * 100) / Math.max(1, this.session.answered),
      );
    },
    advice() {
      if (this.accuracy >= 90) return "掌握得很好，可以挑战拼写或例句完形。";
      if (this.accuracy >= 70) return "基础不错，复习本组错词后再练一组。";
      return "建议先回到单词学习和今日复习，巩固后再挑战。";
    },
    wrongItems() {
      const seen = new Set();
      return (this.session.history || []).filter((item) => {
        const key = `${item.word?.level}:${item.word?.id}`;
        if (item.correct || !item.word || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    modes() {
      return [
        { id: "en-zh", name: "英译中" },
        { id: "zh-en", name: "中译英" },
        { id: "listen", name: "听音选词" },
        { id: "spelling", name: "拼写填空" },
        { id: "cloze", name: "例句完形" },
      ];
    },
  },
  methods: {
    // 把当前测验题发布到学习上下文总线，助教据此讲解而不是让学生复述题干。
    publishContext() {
      const quiz = this.quiz;
      if (!quiz || !quiz.word) return;
      publishContext({
        view: 'quiz',
        scene: 'quiz',
        quizType: quiz.type,
        level: quiz.word.level,
        wordId: quiz.word.id,
        spelling: quiz.word.word,
        phonetic: quiz.word.phonetic || '',
        options: quiz.options || [],
        prompt: quiz.prompt || '',
        correctAnswer: this.answered ? this.correctAnswer : quiz.answer || '',
        selectedAnswer: this.answered ? this.selectedAnswer : '',
        correct: this.answered ? !!this.feedbackCorrect : undefined,
        wrongTimes: this.answered && !this.feedbackCorrect ? 1 : 0,
        position: (this.session?.answered || 0) + 1,
        total: 10,
        answered: this.session?.answered || 0,
        sessionCorrect: this.session?.correct || 0,
      });
    },
    ask(quickAction) {
      this.cancelAutoNext();
      askAssistant('', { quickAction, label: ASK_LABELS[quickAction] || '问问助教' });
    },
    // “答对自动下一题”：默认开启，可在测验页开关；换题、答错或离开页面都会取消待跳转。
    restoreAutoNext() {
      try {
        const saved = window.localStorage.getItem(AUTO_NEXT_STORAGE_KEY);
        if (saved === '0') this.autoNext = false;
        else if (saved === '1') this.autoNext = true;
      } catch (_) {
        // 无痕模式读不到本地存储时保持默认开启。
      }
    },
    setAutoNext(value) {
      this.autoNext = !!value;
      try {
        window.localStorage.setItem(AUTO_NEXT_STORAGE_KEY, this.autoNext ? '1' : '0');
      } catch (_) {
        // 存不下就只在本次会话里生效。
      }
      if (!this.autoNext) this.cancelAutoNext();
    },
    cancelAutoNext() {
      this.autoNextPending = false;
      if (!this.autoNextTimer) return;
      window.clearTimeout(this.autoNextTimer);
      this.autoNextTimer = null;
    },
    scheduleAutoNext() {
      this.cancelAutoNext();
      if (!this.autoNext || this.finished) return;
      const quiz = this.quiz;
      this.autoNextPending = true;
      this.autoNextTimer = window.setTimeout(() => {
        this.autoNextTimer = null;
        this.autoNextPending = false;
        // 等待期间可能已经换题或关掉了开关，只有还是同一道题、且确实答对才前进。
        if (!this.autoNext || this.quiz !== quiz || !this.feedbackCorrect || this.finished) return;
        this.$emit("next");
      }, AUTO_NEXT_DELAY_MS);
    },
    goNext() {
      this.cancelAutoNext();
      this.$emit("next");
    },
    changeType(value) {
      this.$emit("update:type", value);
      this.$emit("change");
    },
    optionClass(option) {
      if (!this.answered) return {};
      return {
        correct: option === this.correctAnswer,
        wrong: !this.feedbackCorrect && option === this.selectedAnswer,
      };
    },
    stepClass(index) {
      return {
        done: index < this.session.answered,
        current: !this.finished && index === this.session.answered,
        correct: this.session.history?.[index]?.correct,
        wrong: this.session.history?.[index] && !this.session.history[index].correct,
      };
    },
    handleKeydown(event) {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(event.target?.tagName)
      ) {
        return;
      }
      if (this.answered && event.key === "Enter") {
        event.preventDefault();
        this.cancelAutoNext();
        this.$emit("next");
        return;
      }
      const index = Number(event.key) - 1;
      if (!this.answered && this.quiz?.options?.[index]) {
        event.preventDefault();
        this.$emit("answer", this.quiz.options[index]);
      }
    },
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeydown);
    this.restoreAutoNext();
    this.publishContext();
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeydown);
    this.cancelAutoNext();
  },
  template: `
    <section class="view quiz-view">
      <div class="quiz-workspace-head">
        <div class="quiz-modes">
          <button
            v-for="mode in modes"
            :key="mode.id"
            :class="{active:type===mode.id}"
            @click="changeType(mode.id)"
          >{{ mode.name }}</button>
        </div>
        <span v-if="resumed" class="quiz-resumed">已恢复上次进度</span>
        <label class="quiz-auto-next" :class="{active:autoNext}" title="答对后自动进入下一题；答错时停留原题，看完讲解再手动继续">
          <input type="checkbox" :checked="autoNext" @change="setAutoNext($event.target.checked)">
          答对自动下一题
        </label>
      </div>

      <div class="quiz-progress-rail" aria-label="本组测验进度">
        <div>
          <span v-for="index in 10" :key="index" :class="stepClass(index-1)">{{ index }}</span>
        </div>
        <small>{{ session.answered }} / 10 · 答对 {{ session.correct }}</small>
      </div>

      <div v-if="finished" class="quiz-result-layout">
        <section class="quiz-card result-card">
          <div class="tag">本组练习完成</div>
          <h2>{{ accuracy }}%</h2>
          <p>答对 {{ session.correct }} / {{ session.answered }} 题</p>
          <p class="advice">{{ advice }}</p>
          <div class="quiz-result-actions">
            <button class="primary" @click="$emit('restart')">再练一组</button>
            <button v-if="wrongItems.length" @click="$emit('navigate',{view:'mistakes'})">打开错题本</button>
            <button @click="$emit('navigate',{view:'learn',word:(wrongItems[0]||session.history?.[0])?.word})">回到单词学习</button>
          </div>
        </section>
        <aside class="quiz-wrong-summary">
          <header><span>本组回顾</span><b>{{ wrongItems.length }} 个错词</b></header>
          <div v-if="wrongItems.length">
            <button
              v-for="item in wrongItems"
              :key="item.word.level+':'+item.word.id"
              @click="$emit('navigate',{view:'learn',word:item.word,level:item.word.level})"
            ><span><b>{{ item.word.word }}</b><small>{{ item.word.meaning }}</small></span><em>查看 →</em></button>
          </div>
          <p v-else>本组全部答对，不需要额外复习。</p>
        </aside>
      </div>

      <div class="quiz-card" v-else-if="quiz">
        <div class="quiz-counter">第 {{ session.answered + 1 }} / 10 题</div>
        <div class="tag">{{ quiz.type === 'listen' ? '听发音，选单词' : quiz.type === 'spelling' ? '看释义，拼单词' : quiz.type === 'cloze' ? '补全例句' : quiz.type === 'zh-en' ? '看中文，选英文' : '看英文，选中文' }}</div>
        <h2 :class="{'listen-prompt':quiz.type==='listen','cloze-prompt':quiz.type==='cloze'}">{{ quiz.prompt }}</h2>
        <div v-if="quiz.type === 'en-zh'" class="phonetic">{{ quiz.word.phonetic || '暂无音标' }}</div>
        <button v-if="quiz.type === 'en-zh' || quiz.type === 'listen'" class="sound" @click="$emit('speak', quiz.word.word)">▶ {{ quiz.type === 'listen' ? '再听一次' : '听一听' }}</button>
        <form v-if="quiz.type==='spelling'" class="spelling-form" @submit.prevent="$emit('answer', spelling)">
          <input v-model.trim="spelling" :disabled="answered" autocomplete="off" placeholder="输入英文单词">
          <button class="primary" :disabled="answered || !spelling">提交答案</button>
        </form>
        <div v-else class="options">
          <button
            v-for="(option,index) in quiz.options"
            :key="option"
            :class="optionClass(option)"
            :disabled="answered"
            @click="$emit('answer', option)"
          ><kbd>{{index+1}}</kbd><span>{{ option }}</span><i v-if="answered&&option===correctAnswer">正确</i><i v-else-if="answered&&!feedbackCorrect&&option===selectedAnswer">你的答案</i></button>
        </div>
        <div v-if="answered" class="quiz-feedback" :class="feedbackCorrect?'is-correct':'is-wrong'" aria-live="polite">
          <b>{{ feedbackCorrect ? '回答正确' : '再巩固一下' }}</b><span>{{ hint }}</span>
          <em v-if="autoNextPending" class="quiz-auto-note">正在进入下一题…</em>
          <div class="quiz-ask">
            <button class="primary" @click="ask(feedbackCorrect ? 'explain' : 'explain-wrong')">{{ feedbackCorrect ? '讲讲这道题' : '不懂，讲讲' }}</button>
            <button @click="ask('drill')">出同类题</button>
          </div>
        </div>
        <p v-else class="quiz-keyboard-tip">按数字键 1-4 选择答案</p>
        <button class="primary quiz-next" :disabled="!answered" @click="goNext()">下一题 <kbd>Enter</kbd> →</button>
      </div>
      <div v-else class="empty">正在准备题目……</div>
    </section>
  `,
};
