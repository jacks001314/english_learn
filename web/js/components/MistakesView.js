const typeNames = {
  "en-zh": "英译中",
  "zh-en": "中译英",
  listen: "听音选词",
  spelling: "拼写填空",
  cloze: "例句完形",
};

export default {
  props: {
    items: Array,
    focusWord: Object,
  },
  emits: ["refresh", "speak", "resolve", "navigate"],
  data: () => ({
    query: "",
    level: "",
    severity: "",
    quizType: "",
    sort: "wrong-desc",
  }),
  computed: {
    quizTypes() {
      const types = new Set();
      for (const item of this.items) {
        for (const [type, result] of Object.entries(item.progress.quizResults || {})) {
          if (result.wrong > 0) types.add(type);
        }
      }
      return [...types];
    },
    filteredItems() {
      const query = this.query.trim().toLowerCase();
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const items = this.items.filter((item) => {
        if (this.level && item.word.level !== this.level) return false;
        if (
          query &&
          !`${item.word.word} ${item.word.meaning}`.toLowerCase().includes(query)
        ) {
          return false;
        }
        if (this.severity === "high" && item.progress.wrong < 3) return false;
        if (
          this.severity === "recent" &&
          new Date(item.progress.lastSeen || 0).getTime() < sevenDaysAgo
        ) {
          return false;
        }
        if (
          this.quizType &&
          !(item.progress.quizResults?.[this.quizType]?.wrong > 0)
        ) {
          return false;
        }
        return true;
      });
      return items.sort((left, right) => {
        if (this.sort === "recent") {
          return String(right.progress.lastSeen).localeCompare(left.progress.lastSeen);
        }
        if (this.sort === "word") return left.word.word.localeCompare(right.word.word);
        return right.progress.wrong - left.progress.wrong;
      });
    },
    highRiskCount() {
      return this.items.filter((item) => item.progress.wrong >= 3).length;
    },
    totalWrong() {
      return this.items.reduce((sum, item) => sum + item.progress.wrong, 0);
    },
  },
  watch: {
    focusWord: {
      immediate: true,
      handler(word) {
        this.query = word?.word || "";
      },
    },
  },
  methods: {
    typeName(type) {
      return typeNames[type] || type;
    },
    formatDate(value) {
      const date = new Date(value || 0);
      if (Number.isNaN(date.getTime())) return "暂无时间";
      return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
    },
    clearFilters() {
      this.query = "";
      this.level = "";
      this.severity = "";
      this.quizType = "";
      this.sort = "wrong-desc";
    },
  },
  template: `
    <section class="view mistakes-view">
      <div class="panel mistakes-panel">
        <div class="section-heading">
          <div><span class="tag">TARGETED REVIEW</span><h2>我的错题本</h2></div>
          <button @click="$emit('refresh')">刷新</button>
        </div>

        <div class="mistake-summary">
          <div><b>{{ items.length }}</b><span>待解决词汇</span></div>
          <div><b>{{ highRiskCount }}</b><span>高频错误</span></div>
          <div><b>{{ totalWrong }}</b><span>累计错误</span></div>
        </div>

        <div class="mistake-filters">
          <input v-model="query" placeholder="搜索单词或释义" aria-label="搜索错题">
          <select v-model="level" aria-label="错题学段"><option value="">全部学段</option><option value="primary">小学</option><option value="middle">初中</option></select>
          <select v-model="severity" aria-label="错误强度"><option value="">全部错误</option><option value="high">错误 3 次以上</option><option value="recent">最近 7 天</option></select>
          <select v-model="quizType" aria-label="错误题型"><option value="">全部题型</option><option v-for="type in quizTypes" :key="type" :value="type">{{ typeName(type) }}</option></select>
          <select v-model="sort" aria-label="错题排序"><option value="wrong-desc">错误次数优先</option><option value="recent">最近练习优先</option><option value="word">单词 A-Z</option></select>
          <button @click="clearFilters">重置</button>
        </div>

        <div class="mistake-list-heading"><b>{{ filteredItems.length }} 个结果</b><span>先学习，再专项测验，确认掌握后移出错题本</span></div>
        <div v-if="filteredItems.length" class="mistake-list">
          <article v-for="item in filteredItems" :key="item.word.level + item.word.id" class="mistake">
            <div class="mistake-word">
              <span>{{ item.word.level === 'middle' ? '初中' : '小学' }}</span>
              <h3>{{ item.word.word }}</h3><p>{{ item.word.meaning }}</p>
              <small>错误 {{ item.progress.wrong }} 次 · 答对 {{ item.progress.correct }} 次 · 最近 {{ formatDate(item.progress.lastSeen) }}</small>
              <div class="mistake-types"><em v-for="(result,type) in item.progress.quizResults" v-show="result.wrong" :key="type">{{ typeName(type) }} {{ result.wrong }}</em></div>
            </div>
            <div class="mistake-actions">
              <button title="播放发音" @click="$emit('speak', item.word.word)">▶</button>
              <button @click="$emit('navigate',{view:'learn',word:item.word,level:item.word.level})">学习详情</button>
              <button @click="$emit('navigate',{view:'quiz',word:item.word,level:item.word.level})">专项测验</button>
              <button class="primary" @click="$emit('resolve', item.word)">已掌握</button>
            </div>
          </article>
        </div>
        <div v-else-if="items.length" class="empty">当前筛选下没有错题。<button @click="clearFilters">查看全部</button></div>
        <div v-else class="empty success">暂时没有错题，继续保持！</div>
      </div>
    </section>
  `,
};
