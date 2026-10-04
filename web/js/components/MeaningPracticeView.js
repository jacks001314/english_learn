// 词义练习：看词选义（英→中）、看义选词（中→英）、听音选义（发音→中）。
// 三个页面共用这个组件，只通过 mode / audioOnly 区分出题与展示方式。
// 练习覆盖当前筛选命中的全部单词：按页取题（默认每页 12 题），翻页即可把
// 整个年级、主题或词性下的单词练完，而不是随机抽十题。
const PAGE_SIZE = 12;
// 侧栏错词清单只渲染最近的一批，避免长时间练习后一次性生成上千个按钮拖慢页面。
const WRONG_LIST_LIMIT = 60;
// 练习进度按“用户 + 练习方式”保存在浏览器本地，刷新或切换页面后可以接着练。
const PRACTICE_STATE_VERSION = 1;
const PRACTICE_STATE_PREFIX = 'english-learn-meaning-practice-v1';

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

// 一个单词在一次练习里只对应一个 key（学段 + 词条 ID），用来跨页保留作答状态。
const wordKey = (word) => `${word?.level || ''}:${String(word?.id || '').toLowerCase()}`;

export default {
  props: {
    mode: { type: String, default: 'en-zh' },
    audioOnly: { type: Boolean, default: false },
    userId: { type: String, default: '' },
  },
  emits: ['speak', 'navigate', 'answered'],
  data() {
    return {
      scope: 'all',
      grade: '',
      topic: '',
      partOfSpeech: '',
      sortKey: 'word-asc',
      seed: 0,
      facets: { grades: [], topics: [], partsOfSpeech: [] },
      scopeTotal: 0,
      total: 0,
      pages: 1,
      page: 1,
      pageSize: PAGE_SIZE,
      items: [],
      index: 0,
      answers: {},
      wrongList: [],
      answeredTotal: 0,
      correctTotal: 0,
      jumpPage: 1,
      loading: false,
      desiredPage: 0,
      restoring: false,
      saveTimer: null,
      boundStorageKey: '',
      ready: false,
      error: '',
    };
  },
  computed: {
    questionType() {
      return this.mode === 'zh-en' ? 'zh-en' : 'en-zh';
    },
    activeMode() {
      return this.audioOnly ? 'listen' : this.mode === 'zh-en' ? 'zh-en' : 'en-zh';
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
    current() {
      return this.items[this.index] || null;
    },
    currentKey() {
      return this.current ? wordKey(this.current.word) : '';
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
    hint() {
      return this.currentAnswer ? this.currentAnswer.hint : '';
    },
    currentPage() {
      return this.desiredPage || this.page;
    },
    positionLabel() {
      return (this.currentPage - 1) * this.pageSize + this.index + 1;
    },
    pageDots() {
      return this.items.map((item, position) => {
        const entry = this.answers[wordKey(item.word)];
        return { position, key: wordKey(item.word), className: entry ? (entry.correct ? 'correct' : 'wrong') : '' };
      });
    },
    // 计数与错词清单在作答时增量维护，渲染成本不随练习量增长。
    answeredCount() {
      return this.answeredTotal;
    },
    correctCount() {
      return this.correctTotal;
    },
    accuracy() {
      return Math.round((this.correctCount * 100) / Math.max(1, this.answeredCount));
    },
    pageAnswered() {
      return this.items.filter((item) => this.answers[wordKey(item.word)]).length;
    },
    finishedAll() {
      return this.total > 0 && this.answeredCount >= this.total;
    },
    visibleWrongItems() {
      return this.wrongList.slice(0, WRONG_LIST_LIMIT);
    },
    hiddenWrongCount() {
      return Math.max(0, this.wrongList.length - WRONG_LIST_LIMIT);
    },
    wrongListLimit() {
      return WRONG_LIST_LIMIT;
    },
    advice() {
      if (this.accuracy >= 90) return '词义掌握得很稳，可以换成反向练习或听音选义继续巩固。';
      if (this.accuracy >= 70) return '大部分意思都认对了，把错词再读一遍例句就更牢了。';
      return '先到单词学习页读一遍这些词的例句，再回来练一遍。';
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
    isFirstQuestion() {
      return this.currentPage <= 1 && this.index <= 0;
    },
    isLastQuestion() {
      return this.currentPage >= this.pages && this.index >= this.items.length - 1;
    },
    nextLabel() {
      if (this.index < this.items.length - 1) return '下一题';
      return this.currentPage < this.pages ? '下一页' : '最后一题';
    },
  },
  watch: {
    // 换范围会清空年级/主题/词性（每个学段的标签不同），并重新从第 1 页开始。
    page() {
      this.jumpPage = this.currentPage;
    },
    // 三个练习页共用同一个组件实例，切方式时要换一套进度。
    activeMode() {
      this.switchMode();
    },
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown);
    this.restoreSession();
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown);
    this.flushSession();
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
        return '当前筛选下没有可练习的单词，请放宽年级、主题或词性筛选。';
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
      let total = 0;
      const parts = new Map();
      pages.forEach((page) => {
        (page.topics || []).forEach((item) => topics.add(item));
        (page.grades || []).forEach((item) => grades.add(item));
        (page.letters || []).forEach((item) => { total += item.count; });
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
    async refresh() {
      await this.run(async () => {
        await this.loadFacets();
        await this.loadPage(1);
      });
      this.persistSession();
    },
    // 换筛选条件会换掉整套题目，所以清空作答记录。
    // 换范围会清空年级/主题/词性（每个学段的标签不同），并重新从第 1 页开始。
    async changeScope() {
      this.grade = '';
      this.topic = '';
      this.partOfSpeech = '';
      await this.applyFilters();
    },
    async applyFilters() {
      this.resetAnswers();
      await this.loadPage(1);
    },
    async clearFilters() {
      this.grade = '';
      this.topic = '';
      this.partOfSpeech = '';
      await this.applyFilters();
    },
    // 只换顺序时保留已作答状态，方便回头复习错词。
    async setSort(value) {
      if (value === 'random' && this.sortKey !== 'random') this.seed = Math.floor(Math.random() * 1000000000);
      await this.loadPage(1);
    },
    async shuffle() {
      this.sortKey = 'random';
      this.seed = Math.floor(Math.random() * 1000000000);
      await this.loadPage(1);
    },
    async restartPractice() {
      this.resetAnswers();
      await this.loadPage(1);
    },
    // 作答只做一次 O(1) 写入；过去用对象展开重建整份记录，练习到几千词会明显卡顿。
    recordAnswer(entry) {
      const previous = this.answers[entry.key];
      if (previous) {
        this.answeredTotal -= 1;
        if (previous.correct) {
          this.correctTotal -= 1;
        } else {
          this.wrongList = this.wrongList.filter((item) => item.key !== entry.key);
        }
      }
      this.answers[entry.key] = entry;
      this.answeredTotal += 1;
      if (entry.correct) {
        this.correctTotal += 1;
      } else {
        this.wrongList.push(entry);
      }
      this.persistSession();
    },
    resetAnswers() {
      this.answers = {};
      this.wrongList = [];
      this.answeredTotal = 0;
      this.correctTotal = 0;
    },
    storageKey() {
      return `${PRACTICE_STATE_PREFIX}:${this.userId || 'anonymous'}:${this.activeMode}`;
    },
    // 只记录重绘清单需要的字段，控制本地存储体积。
    packedAnswers() {
      return Object.values(this.answers).map((entry) => ({
        k: entry.key,
        c: entry.correct ? 1 : 0,
        s: entry.selected,
        a: entry.answer,
        p: entry.prompt,
        ty: entry.type,
        w: entry.word
          ? {
              id: entry.word.id,
              level: entry.word.level,
              word: entry.word.word,
              meaning: entry.word.meaning,
              phonetic: entry.word.phonetic,
              pos: entry.word.pos,
              grade: entry.word.grade,
              topic: entry.word.topic,
            }
          : null,
      }));
    },
    sessionSnapshot(entries) {
      return {
        v: PRACTICE_STATE_VERSION,
        updatedAt: Date.now(),
        scope: this.scope,
        grade: this.grade,
        topic: this.topic,
        partOfSpeech: this.partOfSpeech,
        sortKey: this.sortKey,
        seed: this.seed,
        page: this.currentPage,
        answers: entries,
      };
    },
    persistSession() {
      if (this.restoring || !this.boundStorageKey) return;
      if (this.saveTimer) window.clearTimeout(this.saveTimer);
      this.saveTimer = window.setTimeout(() => {
        this.saveTimer = null;
        this.writeSession();
      }, 400);
    },
    writeSession() {
      let entries = this.packedAnswers();
      // 超出浏览器存储配额时丢弃最早的记录，保证最近的练习一定保存得下。
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          window.localStorage.setItem(this.boundStorageKey, JSON.stringify(this.sessionSnapshot(entries)));
          return;
        } catch (_) {
          if (entries.length <= 200) return;
          entries = entries.slice(Math.ceil(entries.length / 2));
        }
      }
    },
    flushSession() {
      if (this.saveTimer) {
        window.clearTimeout(this.saveTimer);
        this.saveTimer = null;
      }
      if (this.boundStorageKey) this.writeSession();
    },
    readSession(key) {
      let saved = null;
      try {
        saved = JSON.parse(window.localStorage.getItem(key) || 'null');
      } catch (_) {
        return null;
      }
      if (!saved || saved.v !== PRACTICE_STATE_VERSION) return null;
      if (!Array.isArray(saved.answers) || !saved.answers.length) return null;
      return saved;
    },
    async switchMode() {
      this.flushSession();
      this.resetAnswers();
      this.items = [];
      this.index = 0;
      this.total = 0;
      this.pages = 1;
      this.page = 1;
      this.desiredPage = 0;
      this.ready = false;
      await this.restoreSession();
    },
    restoreSession() {
      this.boundStorageKey = this.storageKey();
      const saved = this.readSession(this.boundStorageKey);
      if (!saved) {
        this.refresh();
        return;
      }
      this.restoring = true;
      try {
        this.scope = saved.scope || 'all';
        this.grade = saved.grade || '';
        this.topic = saved.topic || '';
        this.partOfSpeech = saved.partOfSpeech || '';
        this.sortKey = saved.sortKey || 'word-asc';
        this.seed = Number(saved.seed) || 0;
        this.resetAnswers();
        saved.answers.forEach((item) => {
          const word = item.w || {};
          const key = item.k || wordKey(word);
          if (!key) return;
          this.recordAnswer({
            key,
            word,
            prompt: item.p || '',
            type: item.ty || this.questionType,
            selected: item.s || '',
            answer: item.a || '',
            correct: !!item.c,
            hint: item.c ? '回答正确，继续保持！' : `正确答案是：${item.a || ''}`,
          });
        });
      } finally {
        this.restoring = false;
      }
      const targetPage = Number(saved.page) || 1;
      this.run(async () => {
        await this.loadFacets();
        await this.loadPage(targetPage);
      });
    },
    firstUnansweredIndex() {
      const position = this.items.findIndex((item) => !this.answers[wordKey(item.word)]);
      return position < 0 ? 0 : position;
    },
    clampPage(target) {
      // 只兜下界：首次加载时 pages 仍是 1，按上界收敛会把恢复的页码压回第 1 页，
      // 真正的越界由服务端收敛到末页（已有分页测试覆盖）。
      return Math.max(1, Number(target) || 1);
    },
    async fetchSet(page) {
      const params = new URLSearchParams({
        level: this.scope,
        type: this.questionType,
        topic: this.topic,
        grade: this.grade,
        pos: this.partOfSpeech,
        sort: this.sortKey,
        size: String(this.pageSize),
        page: String(page),
      });
      if (this.sortKey === 'random') params.set('seed', String(this.seed));
      const response = await window.fetch(`/api/meaning-quiz?${params}`);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const error = new Error(body.error || `请求失败（${response.status}）`);
        error.status = response.status;
        throw error;
      }
      return response.json();
    },
    // 翻页请求串行执行：加载期间再次点击只更新目标页，点击不会被丢掉，也不会并发打爆接口。
    async loadPage(target, options = {}) {
      this.desiredPage = this.clampPage(target);
      if (this.loading) return;
      this.loading = true;
      let position = options.position;
      try {
        for (let guard = 0; guard < 64; guard += 1) {
          const going = this.desiredPage;
          const set = await this.fetchSet(going);
          this.applySet(set, going, position);
          position = undefined;
          if (this.desiredPage === going) break;
        }
      } catch (error) {
        this.applyLoadError(error);
      } finally {
        this.loading = false;
        this.desiredPage = 0;
        this.persistSession();
      }
    },
    applySet(set, wanted, position) {
      this.items = Array.isArray(set.items) ? set.items : [];
      this.total = set.total || 0;
      this.pages = Math.max(1, set.pages || 1);
      this.page = set.page || wanted;
      this.pageSize = set.size || PAGE_SIZE;
      this.jumpPage = this.page;
      const last = this.items.length ? this.items.length - 1 : 0;
      this.index = position === 'last' ? last : this.firstUnansweredIndex();
      this.ready = true;
      this.error = '';
      this.speakCurrent();
    },
    applyLoadError(error) {
      this.items = [];
      this.index = 0;
      this.total = 0;
      this.pages = 1;
      this.page = 1;
      this.desiredPage = 0;
      this.ready = true;
      this.error = this.describeError(error);
    },
    async answer(option) {
      if (this.answered || !this.current) return;
      const item = this.current;
      const key = this.currentKey;
      try {
        const response = await window.fetch('/api/quiz/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: item.word.level,
            wordId: item.word.id,
            type: item.type,
            answer: option,
          }),
        });
        const feedback = await response.json();
        if (!response.ok) throw new Error(feedback.error || '提交答案失败');
        this.recordAnswer({
          key,
          word: item.word,
          prompt: item.prompt,
          type: item.type,
          selected: String(option),
          answer: String(feedback.answer || ''),
          correct: !!feedback.correct,
          hint: feedback.correct ? '回答正确，继续保持！' : feedback.message,
        });
        this.$emit('answered');
      } catch (error) {
        this.error = error.message || '提交答案失败，请重试。';
      }
    },
    speakCurrent() {
      if (this.current && (this.audioOnly || this.questionType === 'en-zh')) this.$emit('speak', this.current.word.word);
    },
    previous() {
      if (this.index > 0) {
        this.index -= 1;
        this.speakCurrent();
        return;
      }
      if (this.currentPage > 1) this.loadPage(this.currentPage - 1, { position: 'last' });
    },
    next() {
      if (this.index < this.items.length - 1) {
        this.index += 1;
        this.speakCurrent();
        return;
      }
      if (this.currentPage < this.pages) this.loadPage(this.currentPage + 1);
    },
    gotoQuestion(position) {
      this.index = position;
      this.speakCurrent();
    },
    optionClass(option) {
      if (!this.answered) return {};
      return {
        correct: option === this.correctAnswer,
        wrong: !this.feedbackCorrect && option === this.selectedAnswer,
      };
    },
    openWord(word) {
      this.$emit('navigate', { view: 'learn', word, level: word?.level });
    },
    handleKeydown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target?.tagName)) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); this.previous(); return; }
      if (event.key === 'ArrowRight') { event.preventDefault(); this.next(); return; }
      if (this.answered) {
        if (event.key === 'Enter') {
          event.preventDefault();
          this.next();
        }
        return;
      }
      const index = Number(event.key) - 1;
      if (this.current?.options?.[index]) {
        event.preventDefault();
        this.answer(this.current.options[index]);
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
        <strong>可练习 {{ total }} / {{ scopeTotal }} 个单词</strong>
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
        <select v-model="scope" aria-label="练习范围" @change="changeScope()">
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
        <select v-model="sortKey" aria-label="题目顺序" @change="setSort(sortKey)">
          <option value="word-asc">字母顺序 A→Z</option>
          <option value="word-desc">字母顺序 Z→A</option>
          <option value="random">随机顺序</option>
        </select>
        <button @click="shuffle()">打乱顺序</button>
        <button @click="clearFilters()">清除筛选</button>
      </div>
      <p class="meaning-filter-summary">当前范围：<strong>{{ filterLabel }}</strong> · 命中 {{ total }} 个单词，每页 {{ pageSize }} 题，共 {{ pages }} 页</p>

      <div class="meaning-progress" aria-label="练习进度">
        <div>
          <span v-for="dot in pageDots" :key="dot.key" :class="[dot.className,{current:dot.position===index}]">{{ dot.position + 1 }}</span>
        </div>
        <small>本页 {{ pageAnswered }} / {{ items.length }} · 已练 {{ answeredCount }} / {{ total }} · 答对 {{ correctCount }}（{{ accuracy }}%）</small>
        <div class="meaning-actions">
          <button @click="restartPractice()">清空作答</button>
        </div>
      </div>

      <div v-if="error" class="meaning-error" role="alert">{{ error }}</div>

      <div v-if="finishedAll" class="meaning-result">
        <section class="meaning-card">
          <div class="tag">全部完成</div>
          <h2>{{ accuracy }}%</h2>
          <p>答对 {{ correctCount }} / {{ answeredCount }} 题</p>
          <p class="meaning-advice">{{ advice }}</p>
          <div class="meaning-result-actions">
            <button class="primary" @click="restartPractice()">再练一遍</button>
            <button @click="$emit('navigate',{view:'mistakes'})">打开错题本</button>
            <button @click="$emit('navigate',{view:'learn'})">去单词学习</button>
          </div>
        </section>
        <aside class="meaning-review">
          <header><span>错词</span><b>{{ wrongList.length }} 个</b></header>
          <div v-if="wrongList.length">
            <button v-for="item in visibleWrongItems" :key="item.key" @click="openWord(item.word)">
              <span><b>{{ item.word.word }}</b><small>{{ item.word.meaning }}</small></span><em>查看 →</em>
            </button>
            <p v-if="hiddenWrongCount" class="meaning-status">只显示最近 {{ wrongListLimit }} 个错词，其余 {{ hiddenWrongCount }} 个已记录在案。</p>
          </div>
          <p v-else>全部答对，不需要额外复习。</p>
        </aside>
      </div>

      <template v-else>
        <div class="meaning-layout">
          <div v-if="current" class="meaning-card">
            <div class="meaning-counter">第 {{ positionLabel }} / {{ total }} 题</div>
            <div class="tag">{{ audioOnly ? '听发音，选汉语意思' : questionType === 'zh-en' ? '看汉语意思，选英文单词' : '看英文单词，选汉语意思' }}</div>

            <template v-if="audioOnly">
              <button class="meaning-audio" @click="$emit('speak',current.word.word)">▶ 播放发音</button>
            </template>
            <template v-else-if="questionType === 'zh-en'">
              <h2 class="meaning-prompt">{{ current.prompt }}</h2>
            </template>
            <template v-else>
              <h2 class="meaning-prompt">{{ current.word.word }}</h2>
              <p class="meaning-phonetic">{{ current.word.phonetic || '暂无音标' }}</p>
              <button class="sound" @click="$emit('speak',current.word.word)">▶ 听一听</button>
            </template>

            <div class="options meaning-options">
              <button
                v-for="(option,position) in current.options"
                :key="option"
                :class="optionClass(option)"
                :disabled="answered"
                @click="answer(option)"
              ><kbd>{{ position + 1 }}</kbd><span>{{ option }}</span><i v-if="answered&&option===correctAnswer">正确</i><i v-else-if="answered&&!feedbackCorrect&&option===selectedAnswer">你的答案</i></button>
            </div>

            <div v-if="answered" class="meaning-feedback" :class="feedbackCorrect?'is-correct':'is-wrong'" aria-live="polite">
              <b>{{ feedbackCorrect ? '回答正确' : '再巩固一下' }}</b>
              <span>{{ hint }}</span>
            </div>
            <p v-else class="meaning-keyboard-tip">按数字键 1-4 选择答案，← → 翻题</p>

            <section v-if="answered" class="meaning-word-detail">
              <div>
                <strong>{{ current.word.word }}</strong>
                <span>{{ current.word.phonetic || '暂无音标' }}</span>
                <button class="sound" @click="$emit('speak',current.word.word)">▶</button>
              </div>
              <p>{{ current.word.meaning }}<em v-if="current.word.pos">（{{ current.word.pos }}）</em></p>
              <p v-if="current.word.example" class="meaning-example">{{ current.word.example }}</p>
              <small v-if="current.word.exampleTranslation">{{ current.word.exampleTranslation }}</small>
              <div class="meaning-word-tags">
                <span v-if="current.word.grade">{{ current.word.grade }}</span>
                <span v-if="current.word.topic">{{ current.word.topic }}</span>
                <span>{{ current.word.level === 'middle' ? '初中词汇' : '小学词汇' }}</span>
              </div>
            </section>

            <div class="meaning-question-nav">
              <button :disabled="isFirstQuestion" @click="previous()">← 上一题</button>
              <button :disabled="isLastQuestion" @click="next()">{{ nextLabel }} →</button>
            </div>
            <p v-if="pageAnswered >= items.length && currentPage < pages" class="meaning-status">本页已完成，继续“下一页”接着练。</p>
          </div>

          <aside class="meaning-review">
            <header><span>错词</span><b>{{ wrongList.length }} 个</b></header>
            <div v-if="wrongList.length">
              <button v-for="item in visibleWrongItems" :key="item.key" @click="openWord(item.word)">
                <span><b>{{ item.word.word }}</b><small>{{ item.word.meaning }} · 你的答案：{{ item.selected }}</small></span><em>查看 →</em>
              </button>
              <p v-if="hiddenWrongCount" class="meaning-status">只显示最近 {{ wrongListLimit }} 个错词，其余 {{ hiddenWrongCount }} 个已记录在案。</p>
            </div>
            <p v-else>还没有错词，继续保持。</p>
            <p class="meaning-status">已练 {{ answeredCount }} / {{ total }} 词 · 答对 {{ correctCount }} 题</p>
          </aside>
        </div>

        <div v-if="pages > 1" class="pager meaning-pager">
          <button :disabled="currentPage <= 1" @click="loadPage(1)">首页</button>
          <button :disabled="currentPage <= 1" @click="loadPage(currentPage - 1)">上一页</button>
          <span>第 {{ currentPage }} / {{ pages }} 页<i v-if="loading" class="meaning-loading">加载中…</i></span>
          <button :disabled="currentPage >= pages" @click="loadPage(currentPage + 1)">下一页</button>
          <button :disabled="currentPage >= pages" @click="loadPage(pages)">末页</button>
          <label class="meaning-jump">跳到 <input type="number" min="1" :max="pages" v-model.number="jumpPage" @keyup.enter="loadPage(jumpPage)"> 页</label>
        </div>
      </template>

      <div v-if="ready && !current && !error" class="empty">当前筛选下暂时没有可练习的单词，试着换一个主题或词性。</div>
      <div v-if="!ready" class="empty">正在准备题目……</div>
    </section>
  `,
};
