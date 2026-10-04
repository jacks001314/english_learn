import { articles } from "../articleData.js";
import { hotTopicArticles } from "../hotTopicArticles.js";
import { expandedArticles } from "../expandedArticles.js";
import { api, postJSON } from "../api.js";
import { publishContext, askAssistant } from "../learningContext.js?v=20261004-practice-source-r1";

const progressStorageKey = "english-learn-reading-progress-v1";

export default {
  props: {
    userId: { type: [String, Number], default: "anonymous" },
    targetArticleId: { type: String, default: "" },
  },
  emits: ["speak"],
  data: () => ({
    articles: [...articles, ...hotTopicArticles, ...expandedArticles],
    selectedId: articles[0].id,
    grade: "",
    topic: "",
    collection: "",
    query: "",
    showTranslation: true,
    mode: "read",
    revealed: new Set(),
    progress: {},
    toast: "",
    databaseReady: false,
    readingScale: 1,
    scrollProgress: 0,
    articlePositions: {},
    activeParagraph: -1,
    scrollFrame: null,
    persistTimer: null,
    toastTimer: null,
  }),
  computed: {
    stateStorageKey() {
      return `english-learn-reading-state-v1:${this.userId || "anonymous"}`;
    },
    filtered() {
      const query = this.query.trim().toLowerCase();
      return this.articles.filter(
        (article) =>
          (!this.grade || article.grade === this.grade) &&
          (!this.topic || article.topic === this.topic) &&
          (!this.collection ||
            (article.collection || "经典美文") === this.collection) &&
          (!query ||
            `${article.title} ${article.chineseTitle} ${article.intro} ${article.topic}`
              .toLowerCase()
              .includes(query)),
      );
    },
    selected() {
      return (
        this.articles.find((article) => article.id === this.selectedId) ||
        this.filtered[0] ||
        this.articles[0]
      );
    },
    topics() {
      return [...new Set(this.articles.map((article) => article.topic))];
    },
    completedCount() {
      return Object.values(this.progress).filter((item) => item.completed).length;
    },
    memorizedCount() {
      return Object.values(this.progress).filter((item) => item.memorized).length;
    },
    articleText() {
      return this.selected.paragraphs.map((paragraph) => paragraph.en).join(" ");
    },
    readingScaleLabel() {
      return `${Math.round(this.readingScale * 100)}%`;
    },
    readingStyle() {
      return {
        "--reading-font-size": `${18 * this.readingScale}px`,
        "--reading-translation-size": `${14 * this.readingScale}px`,
        "--reading-recite-size": `${17 * this.readingScale}px`,
      };
    },
  },
  watch: {
    selectedId() {
      this.persistReadingState();
    },
    mode() {
      this.persistReadingState();
    },
    showTranslation() {
      this.$nextTick(() => {
        this.updateScrollProgress();
        this.persistReadingState();
      });
    },
    userId() {
      this.restoreReadingState();
    },
    targetArticleId(value) {
      if (value) this.openTargetArticle(value);
    },
  },
  async mounted() {
    this.restoreReadingState();
    if (this.targetArticleId) this.selectedId = this.targetArticleId;
    try {
      this.progress = JSON.parse(localStorage.getItem(progressStorageKey) || "{}");
    } catch (_) {
      this.progress = {};
    }

    this.$refs.paper?.addEventListener("scroll", this.handleScroll, { passive: true });
    window.addEventListener("resize", this.handleScroll, { passive: true });
    const seeds = [...articles, ...hotTopicArticles, ...expandedArticles];
    try {
      let data = await api("/api/articles");
      try {
        this.progress = await api("/api/article-progress");
      } catch (_) {}
      if (!data.items?.length || data.total < seeds.length) {
        await postJSON("/api/articles/import", { items: seeds });
        data = await api("/api/articles");
      }
      if (data.items?.length) {
        this.articles = data.items;
        if (this.targetArticleId && this.articles.some((item) => item.id === this.targetArticleId)) {
          this.selectedId = this.targetArticleId;
        } else if (!this.articles.some((item) => item.id === this.selectedId)) {
          this.selectedId = this.articles[0].id;
        }
      }
      this.databaseReady = true;
    } catch (_) {
      this.articles = seeds;
    }

    this.$nextTick(() => this.restorePosition(this.selectedId));
  },
  beforeUnmount() {
    this.rememberCurrentPosition();
    this.persistReadingState();
    this.$refs.paper?.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleScroll);
    cancelAnimationFrame(this.scrollFrame);
    clearTimeout(this.persistTimer);
    clearTimeout(this.toastTimer);
  },
  methods: {
    // 逐句解析：只把当前段落和文章位置交给助教，不整篇上传。
    askParagraph(index, paragraph) {
      publishContext({
        view: 'reading',
        scene: 'reading',
        articleId: this.selected.id,
        articleTitle: this.selected.title,
        paragraph: index + 1,
        paragraphs: this.selected.paragraphs.length,
        sentence: paragraph.en,
      });
      askAssistant('', { quickAction: 'explain-sentence', label: `解析第 ${index + 1} 段` });
    },
    openTargetArticle(id) {
      if (!id || !this.articles.some((article) => article.id === id)) return;
      this.select(id);
    },
    restoreReadingState() {
      try {
        const state = JSON.parse(localStorage.getItem(this.stateStorageKey) || "null");
        if (!state) return;
        if (state.selectedId) this.selectedId = state.selectedId;
        if (["read", "study", "recite"].includes(state.mode)) this.mode = state.mode;
        if (typeof state.showTranslation === "boolean") {
          this.showTranslation = state.showTranslation;
        }
        if (Number.isFinite(state.readingScale)) {
          this.readingScale = Math.min(1.25, Math.max(0.9, state.readingScale));
        }
        if (state.articlePositions && typeof state.articlePositions === "object") {
          this.articlePositions = state.articlePositions;
        }
      } catch (_) {
        localStorage.removeItem(this.stateStorageKey);
      }
    },
    persistReadingState() {
      localStorage.setItem(
        this.stateStorageKey,
        JSON.stringify({
          selectedId: this.selectedId,
          mode: this.mode,
          showTranslation: this.showTranslation,
          readingScale: this.readingScale,
          articlePositions: this.articlePositions,
        }),
      );
    },
    select(id) {
      this.rememberCurrentPosition();
      this.selectedId = id;
      this.mode = "read";
      this.revealed = new Set();
      this.activeParagraph = -1;
      this.$nextTick(() => this.restorePosition(id, "smooth"));
    },
    setMode(mode) {
      this.rememberCurrentPosition();
      this.mode = mode;
      this.revealed = new Set();
      this.activeParagraph = -1;
      this.$nextTick(() => this.restorePosition(this.selectedId));
    },
    setScale(delta) {
      this.rememberCurrentPosition();
      this.readingScale = Math.min(
        1.25,
        Math.max(0.9, Math.round((this.readingScale + delta) * 100) / 100),
      );
      this.$nextTick(() => {
        this.restorePosition(this.selectedId);
        this.persistReadingState();
      });
    },
    handleScroll() {
      if (this.scrollFrame) return;
      this.scrollFrame = requestAnimationFrame(() => {
        this.scrollFrame = null;
        this.updateScrollProgress();
        clearTimeout(this.persistTimer);
        this.persistTimer = setTimeout(() => this.persistReadingState(), 250);
      });
    },
    updateScrollProgress() {
      const paper = this.$refs.paper;
      if (!paper || !this.selected) return;
      const readableHeight = Math.max(1, paper.scrollHeight - paper.clientHeight);
      const progress = Math.min(100, Math.max(0, (paper.scrollTop / readableHeight) * 100));
      this.scrollProgress = Math.round(progress);
      this.articlePositions = {
        ...this.articlePositions,
        [this.selected.id]: this.scrollProgress,
      };
    },
    rememberCurrentPosition() {
      this.updateScrollProgress();
    },
    restorePosition(articleId, behavior = "auto") {
      const paper = this.$refs.paper;
      if (!paper) return;
      const progress = Math.min(100, Math.max(0, this.articlePositions[articleId] || 0));
      const readableHeight = Math.max(1, paper.scrollHeight - paper.clientHeight);
      paper.scrollTo({ top: (progress / 100) * readableHeight, behavior });
      this.scrollProgress = Math.round(progress);
    },
    playArticle() {
      this.activeParagraph = -1;
      this.$emit("speak", this.articleText);
    },
    playParagraph(index, text) {
      this.activeParagraph = index;
      this.$emit("speak", text);
    },
    toggleParagraph(index) {
      const next = new Set(this.revealed);
      next.has(index) ? next.delete(index) : next.add(index);
      this.revealed = next;
    },
    async save(field) {
      const item = {
        articleId: this.selected.id,
        completed:
          field === "completed" || !!this.progress[this.selected.id]?.completed,
        memorized:
          field === "memorized" || !!this.progress[this.selected.id]?.memorized,
      };
      this.progress = { ...this.progress, [this.selected.id]: item };
      localStorage.setItem(progressStorageKey, JSON.stringify(this.progress));
      try {
        await postJSON("/api/article-progress", item);
      } catch (_) {}
      this.toast =
        field === "completed" ? "已记录本次阅读 ✓" : "已记录背诵完成 ★";
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toast = "";
      }, 1800);
    },
    isDone(id, field) {
      return !!this.progress[id]?.[field];
    },
  },
  template: `
    <section class="reading-view">
      <div class="reading-banner">
        <div>
          <span class="reading-eyebrow">MIDDLE SCHOOL READING</span>
          <h2>英文美文阅读馆</h2>
          <p>读懂一篇，积累一句，背下一段。让优美的英语成为自己的表达。</p>
        </div>
        <div class="reading-stats">
          <span><b>{{ articles.length }}</b> 篇精选</span>
          <span><b>{{ completedCount }}</b> 已阅读</span>
          <span><b>{{ memorizedCount }}</b> 已背诵</span>
        </div>
      </div>

      <div class="reading-layout">
        <aside class="article-sidebar">
          <div class="article-filters">
            <input v-model="query" placeholder="搜索标题或主题" aria-label="搜索文章">
            <select v-model="grade">
              <option value="">全部年级</option>
              <option>七年级</option><option>八年级</option><option>九年级</option>
            </select>
            <select v-model="topic">
              <option value="">全部主题</option>
              <option v-for="item in topics" :key="item">{{ item }}</option>
            </select>
            <select v-model="collection" class="collection-filter">
              <option value="">全部合集</option>
              <option>经典美文</option><option>热门话题原创</option>
            </select>
          </div>
          <div class="article-list">
            <button
              v-for="article in filtered"
              :key="article.id"
              :class="['article-list-item',{active:selected.id===article.id}]"
              @click="select(article.id)"
            >
              <span>{{ article.grade }} · {{ article.topic }} · {{ article.minutes }} 分钟</span>
              <strong>{{ article.title }}</strong>
              <small>{{ article.chineseTitle }}</small>
              <i v-if="isDone(article.id,'memorized')">★ 已背诵</i>
              <i v-else-if="isDone(article.id,'completed')">✓ 已阅读</i>
            </button>
            <p v-if="!filtered.length" class="empty">没有找到相关文章。</p>
          </div>
        </aside>

        <article ref="paper" class="reading-paper" :style="readingStyle">
          <div class="reading-progress-track" :title="'阅读进度 '+scrollProgress+'%'">
            <span :style="{width:scrollProgress+'%'}"></span>
          </div>
          <div class="paper-head">
            <div class="article-badges">
              <span>{{ selected.grade }}</span><span>{{ selected.difficulty }}</span><span>{{ selected.topic }}</span>
              <span v-if="selected.collection" class="hot-badge">HOT 灵感</span>
            </div>
            <h1>{{ selected.title }}</h1>
            <h3>{{ selected.chineseTitle }}</h3>
            <p>{{ selected.intro }}</p>
            <div class="reading-control-row">
              <div class="reading-actions">
                <button :class="{active:mode==='read'}" @click="setMode('read')">沉浸阅读</button>
                <button :class="{active:mode==='study'}" @click="setMode('study')">双语精读</button>
                <button :class="{active:mode==='recite'}" @click="setMode('recite')">背诵模式</button>
                <button class="listen-all" @click="playArticle">▶ 全文朗读</button>
              </div>
              <div class="reading-display-tools" aria-label="阅读字号">
                <button title="减小字号" :disabled="readingScale<=0.9" @click="setScale(-0.05)">A−</button>
                <span>{{ readingScaleLabel }}</span>
                <button title="增大字号" :disabled="readingScale>=1.25" @click="setScale(0.05)">A＋</button>
              </div>
            </div>
          </div>

          <div class="article-body">
            <section
              v-for="(paragraph,index) in selected.paragraphs"
              :key="index"
              :class="['reading-paragraph',{active:activeParagraph===index}]"
            >
              <div class="paragraph-number">{{ String(index+1).padStart(2,'0') }}</div>
              <div class="paragraph-content">
                <p v-if="mode!=='recite'" class="english-text">{{ paragraph.en }}</p>
                <button
                  v-else
                  class="recite-card"
                  :class="{revealed:revealed.has(index)}"
                  @click="toggleParagraph(index)"
                >
                  <span v-if="!revealed.has(index)">点击检查第 {{ index+1 }} 段</span>
                  <span v-else>{{ paragraph.en }}</span>
                </button>
                <p v-if="mode==='study'||(showTranslation&&mode==='read')" class="chinese-text">{{ paragraph.zh }}</p>
                <div v-if="mode!=='recite'" class="paragraph-tools">
                  <button @click="playParagraph(index,paragraph.en)">{{ activeParagraph===index ? '重听本段' : '听本段' }}</button>
                  <button @click="askParagraph(index,paragraph)">逐句解析</button>
                </div>
              </div>
            </section>
          </div>

          <section v-if="mode==='study'" class="study-notes">
            <div>
              <h4>重点词汇</h4>
              <ul><li v-for="word in selected.words" :key="word[0]"><button @click="$emit('speak',word[0])">{{ word[0] }}</button><span>{{ word[1] }}</span></li></ul>
            </div>
            <blockquote>
              <span>佳句积累</span><p>{{ selected.quote }}</p><small>{{ selected.quoteZh }}</small>
              <button @click="$emit('speak',selected.quote)">跟读</button>
            </blockquote>
          </section>
          <section v-if="mode==='recite'" class="recite-tip">
            <b>背诵方法</b>
            <span>先看中文回想英文，再点击卡片核对。能连续复述全部段落后，标记完成。</span>
          </section>
          <div class="paper-footer">
            <label v-if="mode==='read'"><input v-model="showTranslation" type="checkbox"> 显示中文译文</label>
            <span v-else></span>
            <button
              v-if="mode!=='recite'"
              class="finish-reading"
              :class="{done:isDone(selected.id,'completed')}"
              @click="save('completed')"
            >{{ isDone(selected.id,'completed') ? '✓ 已完成阅读' : '完成本篇阅读' }}</button>
            <button
              v-else
              class="finish-reading gold"
              :class="{done:isDone(selected.id,'memorized')}"
              @click="save('memorized')"
            >{{ isDone(selected.id,'memorized') ? '★ 已完成背诵' : '我已能完整背诵' }}</button>
          </div>
        </article>
      </div>
      <div v-if="toast" class="reading-toast">{{ toast }}</div>
    </section>
  `,
};
