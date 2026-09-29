// 词义练习：看词选义（英→中）、看义选词（中→英）、听音选义（发音→中）。
// 三个页面共用这个组件，只通过 mode / audioOnly 区分出题与展示方式。
const ROUND_SIZE = 10;

const POS_LABELS = {
  noun: '名词',
  verb: '动词',
  adjective: '形容词',
  adverb: '副词',
  pronoun: '代词',
  numeral: '数词',
  article: '冠词',
  preposition: '介词',
  conjunction: '连词',
  interjection: '感叹词',
  auxiliary: '助动词',
  modal: '情态动词',
  abbreviation: '缩略词',
  phrase: '短语',
  other: '其他',
};

const freshSession = () => ({ answered: 0, correct: 0, history: [] });

export default {
  props: {
    mode: { type: String, default: 'en-zh' },
    audioOnly: { type: Boolean, default: false },
  },
  emits: ['speak', 'navigate', 'answered'],
  data() {
    return {
      scope: 'all',
      grade: '',
      topic: '',
      partOfSpeech: '',
      facets: { grades: [], topics: [], partsOfSpeech: [] },
      scopeTotal: 0,
      matchTotal: 0,
      quiz: null,
      loading: false,
      ready: false,
      error: '',
      answered: false,
      selectedAnswer: '',
      correctAnswer: '',
      feedbackCorrect: false,
      hint: '',
      session: freshSession(),
    };
  },
  computed: {
    roundSize() {
      return ROUND_SIZE;
    },
    finished() {
      return this.session.answered >= ROUND_SIZE;
    },
    accuracy() {
      return Math.round((this.session.correct * 100) / Math.max(1, this.session.answered));
    },
    advice() {
      if (this.accuracy >= 90) return '词义掌握得很稳，可以换成反向练习或听音选义继续巩固。';
      if (this.accuracy >= 70) return '大部分意思都认对了，把本组错词再读一遍例句就更牢了。';
      return '先到单词学习页读一遍这些词的例句，再回来练一组。';
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
    title() {
      if (this.audioOnly) return '听音选义';
      return this.mode === 'zh-en' ? '看义选词' : '看词选义';
    },
    subtitle() {
      if (this.audioOnly) return '听发音，从四个汉语意思里选出正确的一个。';
      if (this.mode === 'zh-en') return '看汉语意思，从四个英文单词里选出正确的一个。';
      return '看英文单词，从四个汉语意思里选出正确的一个。';
    },
    modeTabs() {
      return [
        { id: 'en-zh', label: '看词选义', view: 'meaning-en-zh' },
        { id: 'zh-en', label: '看义选词', view: 'meaning-zh-en' },
        { id: 'listen', label: '听音选义', view: 'meaning-listen' },
      ];
    },
    activeMode() {
      return this.audioOnly ? 'listen' : this.mode === 'zh-en' ? 'zh-en' : 'en-zh';
    },
    questionType() {
      return this.mode === 'zh-en' ? 'zh-en' : 'en-zh';
    },
    filterLabel() {
      return [
        { all: '全部范围', primary: '小学英语', middle: '初中英语' }[this.scope] || '全部范围',
        this.grade,
        this.topic,
        this.partOfSpeech ? this.partOfSpeechLabel(this.partOfSpeech) : '',
      ]
        .filter(Boolean)
        .join(' · ');
    },
    showWordText() {
      return !this.audioOnly && this.questionType === 'en-zh';
    },
  },
  watch: {
    scope() {
      this.grade = '';
      this.topic = '';
      this.partOfSpeech = '';
      this.refresh();
    },
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown);
    this.refresh();
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown);
  },
  methods: {
    partOfSpeechLabel(value) {
      const facet = (this.facets.partsOfSpeech || []).find((item) => item.value === value);
      return facet?.label || POS_LABELS[value] || value;
    },
    async run(task) {
      this.error = '';
      try {
        await task();
      } catch (error) {
        this.error = this.describeError(error);
      }
    },
    describeError(error) {
      if (error?.status === 422 || /not enough/i.test(error?.message || '')) {
        return '当前筛选下可练习的单词太少（至少需要 4 个），请放宽年级、主题或词性筛选。';
      }
      if (error?.status === 404) return '这个单词已经不在词库中了，换一题试试。';
      return error?.message || '加载失败，请稍后重试。';
    },
    // 词库标签按范围加载：全部范围合并小学与初中，筛选下拉才有完整选项。
    async loadFacets() {
      const levels = this.scope === 'all' ? ['primary', 'middle'] : [this.scope];
      const pages = await Promise.all(levels.map((level) => window.fetch(`/api/word-facets?level=${level}`).then((response) => response.json())));
      const topics = new Set();
      const grades = new Set();
      const letters = new Map();
      const parts = new Map();
      let total = 0;
      pages.forEach((page) => {
        (page.topics || []).forEach((item) => topics.add(item));
        (page.grades || []).forEach((item) => grades.add(item));
        (page.letters || []).forEach((item) => {
          letters.set(item.value, (letters.get(item.value) || 0) + item.count);
          total += item.count;
        });
        (page.partsOfSpeech || []).forEach((item) => {
          const current = parts.get(item.value) || { value: item.value, label: item.label, count: 0 };
          current.count += item.count;
          parts.set(item.value, current);
        });
      });
      this.facets = {
        topics: [...topics].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN')),
        grades: [...grades].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN')),
        partsOfSpeech: [...parts.values()],
      };
      this.scopeTotal = total;
    },
    // 当前筛选实际命中多少词，用来提示“范围是否太窄”。
    async loadMatchTotal() {
      const levels = this.scope === 'all' ? ['primary', 'middle'] : [this.scope];
      const params = new URLSearchParams({ page: 1, topic: this.topic, grade: this.grade, pos: this.partOfSpeech });
      const pages = await Promise.all(
        levels.map((level) => {
          const scoped = new URLSearchParams(params);
          scoped.set('level', level);
          return window.fetch(`/api/words?${scoped}`).then((response) => response.json());
        }),
      );
      this.matchTotal = pages.reduce((sum, page) => sum + (page.total || 0), 0);
    },
    async refresh() {
      await this.run(async () => {
        await Promise.all([this.loadFacets(), this.loadMatchTotal()]);
        await this.loadQuiz();
      });
    },
    async applyFilters() {
      await this.run(async () => {
        await this.loadMatchTotal();
        this.session = freshSession();
        await this.loadQuiz();
      });
    },
    async clearFilters() {
      this.grade = '';
      this.topic = '';
      this.partOfSpeech = '';
      await this.applyFilters();
    },
    async loadQuiz() {
      this.loading = true;
      this.answered = false;
      this.selectedAnswer = '';
      this.correctAnswer = '';
      this.feedbackCorrect = false;
      this.hint = '';
      try {
        const params = new URLSearchParams({ level: this.scope, type: this.questionType, topic: this.topic, grade: this.grade, pos: this.partOfSpeech });
        const response = await window.fetch(`/api/meaning-quiz?${params}`);
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          const error = new Error(body.error || `请求失败（${response.status}）`);
          error.status = response.status;
          throw error;
        }
        this.quiz = await response.json();
        this.ready = true;
        this.error = '';
        if (this.audioOnly || this.questionType === 'en-zh') this.$emit('speak', this.quiz.word.word);
      } catch (error) {
        this.quiz = null;
        this.ready = true;
        this.error = this.describeError(error);
      } finally {
        this.loading = false;
      }
    },
    async answer(option) {
      if (this.answered || !this.quiz) return;
      this.answered = true;
      this.selectedAnswer = String(option);
      try {
        const response = await window.fetch('/api/quiz/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: this.quiz.word.level,
            wordId: this.quiz.word.id,
            type: this.quiz.type,
            answer: option,
          }),
        });
        const feedback = await response.json();
        if (!response.ok) throw new Error(feedback.error || '提交答案失败');
        this.feedbackCorrect = !!feedback.correct;
        this.correctAnswer = String(feedback.answer || '');
        this.hint = feedback.correct ? '回答正确，继续保持！' : feedback.message;
        this.session.answered += 1;
        if (feedback.correct) this.session.correct += 1;
        this.session.history = [
          ...(this.session.history || []),
          {
            word: this.quiz.word,
            type: this.quiz.type,
            prompt: this.quiz.prompt,
            selectedAnswer: String(option),
            correctAnswer: String(feedback.answer || ''),
            correct: !!feedback.correct,
          },
        ];
        this.$emit('answered');
      } catch (error) {
        this.answered = false;
        this.selectedAnswer = '';
        this.correctAnswer = '';
        this.error = error.message || '提交答案失败，请重试。';
      }
    },
    next() {
      if (!this.answered) return;
      if (this.finished) return;
      this.loadQuiz();
    },
    restart() {
      this.session = freshSession();
      this.loadQuiz();
    },
    optionClass(option) {
      if (!this.answered) return {};
      return {
        correct: option === this.correctAnswer,
        wrong: !this.feedbackCorrect && option === this.selectedAnswer,
      };
    },
    optionKey(index) {
      return String(index + 1);
    },
    openWord(word) {
      this.$emit('navigate', { view: 'learn', word, level: word?.level });
    },
    handleKeydown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target?.tagName)) return;
      if (this.answered) {
        if (event.key === 'Enter') {
          event.preventDefault();
          this.next();
        }
        return;
      }
      const index = Number(event.key) - 1;
      if (this.quiz?.options?.[index]) {
        event.preventDefault();
        this.answer(this.quiz.options[index]);
      }
    },
  },
  template: `
    <section class="view meaning-view">
      <div class="section-heading meaning-heading">
        <div>
          <span class="tag">WORD MEANING</span>
          <h2>{{ title }}</h2>
          <p class="meaning-intro">{{ subtitle }}</p>
        </div>
        <strong>可练习 {{ matchTotal }} / {{ scopeTotal }} 个单词</strong>
      </div>

      <div class="meaning-modes" role="tablist" aria-label="练习方式">
        <button
          v-for="tab in modeTabs"
          :key="tab.id"
          :class="{active:activeMode===tab.id}"
          role="tab"
          :aria-selected="activeMode===tab.id"
          @click="$emit('navigate',{view:tab.view})"
        >{{ tab.label }}</button>
      </div>

      <div class="toolbar meaning-filters">
        <select v-model="scope" aria-label="练习范围" @change="refresh()">
          <option value="all">全部范围（小学 + 初中）</option>
          <option value="primary">小学英语</option>
          <option value="middle">初中英语</option>
        </select>
        <select v-model="grade" aria-label="年级" @change="applyFilters()">
          <option value="">全部年级</option>
          <option v-for="item in facets.grades" :key="item" :value="item">{{ item }}</option>
        </select>
        <select v-model="topic" aria-label="主题" @change="applyFilters()">
          <option value="">全部主题</option>
          <option v-for="item in facets.topics" :key="item" :value="item">{{ item }}</option>
        </select>
        <select v-model="partOfSpeech" aria-label="词性" @change="applyFilters()">
          <option value="">全部词性</option>
          <option v-for="item in facets.partsOfSpeech" :key="item.value" :value="item.value">{{ item.label }}（{{ item.count }}）</option>
        </select>
        <button @click="applyFilters()">换一题</button>
        <button @click="clearFilters()">清除筛选</button>
      </div>
      <p class="meaning-filter-summary">当前范围：<strong>{{ filterLabel }}</strong> · 命中 {{ matchTotal }} 个单词</p>

      <div class="meaning-progress" aria-label="本组练习进度">
        <div>
          <span v-for="index in roundSize" :key="index" :class="{done:index<=session.answered,current:index===session.answered+1}">{{ index }}</span>
        </div>
        <small>{{ session.answered }} / {{ roundSize }} · 答对 {{ session.correct }}</small>
      </div>

      <div v-if="error" class="meaning-error" role="alert">{{ error }}</div>

      <div v-if="finished" class="meaning-result">
        <section class="meaning-card">
          <div class="tag">本组完成</div>
          <h2>{{ accuracy }}%</h2>
          <p>答对 {{ session.correct }} / {{ session.answered }} 题</p>
          <p class="meaning-advice">{{ advice }}</p>
          <div class="meaning-result-actions">
            <button class="primary" @click="restart()">再练一组</button>
            <button @click="$emit('navigate',{view:'mistakes'})">打开错题本</button>
            <button @click="$emit('navigate',{view:'learn'})">去单词学习</button>
          </div>
        </section>
        <aside class="meaning-review">
          <header><span>本组错词</span><b>{{ wrongItems.length }} 个</b></header>
          <div v-if="wrongItems.length">
            <button v-for="item in wrongItems" :key="item.word.level+':'+item.word.id" @click="openWord(item.word)">
              <span><b>{{ item.word.word }}</b><small>{{ item.word.meaning }}</small></span><em>查看 →</em>
            </button>
          </div>
          <p v-else>本组全部答对，不需要额外复习。</p>
        </aside>
      </div>

      <div v-else-if="quiz" class="meaning-card">
        <div class="meaning-counter">第 {{ session.answered + 1 }} / {{ roundSize }} 题</div>
        <div class="tag">{{ audioOnly ? '听发音，选汉语意思' : questionType === 'zh-en' ? '看汉语意思，选英文单词' : '看英文单词，选汉语意思' }}</div>

        <template v-if="audioOnly">
          <button class="meaning-audio" @click="$emit('speak',quiz.word.word)">▶ 播放发音</button>
        </template>
        <template v-else-if="questionType === 'zh-en'">
          <h2 class="meaning-prompt">{{ quiz.prompt }}</h2>
        </template>
        <template v-else>
          <h2 class="meaning-prompt">{{ quiz.word.word }}</h2>
          <p class="meaning-phonetic">{{ quiz.word.phonetic || '暂无音标' }}</p>
          <button class="sound" @click="$emit('speak',quiz.word.word)">▶ 听一听</button>
        </template>

        <div class="options meaning-options">
          <button
            v-for="(option,index) in quiz.options"
            :key="option"
            :class="optionClass(option)"
            :disabled="answered"
            @click="answer(option)"
          ><kbd>{{ optionKey(index) }}</kbd><span>{{ option }}</span><i v-if="answered&&option===correctAnswer">正确</i><i v-else-if="answered&&!feedbackCorrect&&option===selectedAnswer">你的答案</i></button>
        </div>

        <div v-if="answered" class="meaning-feedback" :class="feedbackCorrect?'is-correct':'is-wrong'" aria-live="polite">
          <b>{{ feedbackCorrect ? '回答正确' : '再巩固一下' }}</b>
          <span>{{ hint }}</span>
        </div>
        <p v-else class="meaning-keyboard-tip">按数字键 1-4 选择答案</p>

        <section v-if="answered" class="meaning-word-detail">
          <div>
            <strong>{{ quiz.word.word }}</strong>
            <span>{{ quiz.word.phonetic || '暂无音标' }}</span>
            <button class="sound" @click="$emit('speak',quiz.word.word)">▶</button>
          </div>
          <p>{{ quiz.word.meaning }}<em v-if="quiz.word.pos">（{{ quiz.word.pos }}）</em></p>
          <p v-if="quiz.word.example" class="meaning-example">{{ quiz.word.example }}</p>
          <small v-if="quiz.word.exampleTranslation">{{ quiz.word.exampleTranslation }}</small>
          <div class="meaning-word-tags">
            <span v-if="quiz.word.grade">{{ quiz.word.grade }}</span>
            <span v-if="quiz.word.topic">{{ quiz.word.topic }}</span>
            <span>{{ quiz.word.level === 'middle' ? '初中词汇' : '小学词汇' }}</span>
          </div>
        </section>

        <button class="primary meaning-next" :disabled="!answered" @click="next()">下一题 <kbd>Enter</kbd> →</button>
      </div>

      <div v-else-if="ready" class="empty">当前筛选下暂时没有可练习的单词，试着换一个主题或词性。</div>
      <div v-else class="empty">正在准备题目……</div>
    </section>
  `,
};
