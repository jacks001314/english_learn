import { articles } from "../articleData.js";
import { hotTopicArticles } from "../hotTopicArticles.js";
import { expandedArticles } from "../expandedArticles.js";
import { api, postJSON } from "../api.js";
import { publishContext, askAssistant, askInline, agentEnabled } from "../learningContext.js?v=20261007-agent-leakfix-r1";
import AgentTeachingCard from "./AgentTeachingCard.js?v=20261006-agent-ux-r1";
// 选词浮条上的「朗读」走助教自带的语音模块（契约 §4.1），它不可用时按钮直接隐藏。
import { speak as speakAgentText, speechSupported } from "../agentSpeech.js?v=20261006-agent-ux-r1";

const progressStorageKey = "english-learn-reading-progress-v1";

export default {
  props: {
    userId: { type: [String, Number], default: "anonymous" },
    targetArticleId: { type: String, default: "" },
  },
  emits: ["speak"],
  components: { AgentTeachingCard },
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
    agentReady: false,        // 助教是否可用：不可用时不显示「讲解 / 入册」
    speechReady: false,       // 浏览器语音是否可用：不可用时隐藏「朗读」
    selectionText: "",        // 当前选中的单词/短语
    selectionBar: null,       // 浮条位置（视口坐标）
    selectionIndex: 0,        // 选区所在的段落下标（讲解卡就地展开在这里）
    selectionPatch: null,     // 讲解用的上下文（重试时复用）
    selectionCard: null,
    selectionBusy: false,
    selectionError: "",
    selectionNote: "",
    selectionFor: "",         // 讲解卡属于哪一段+哪句话（换段后丢弃迟到的结果）
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
    // 选区消失（点到别处）时收起浮条，避免浮条停在半空。
    document.addEventListener("selectionchange", this.onDocumentSelectionChange);
    // 助教未启用或状态接口失败时，页面照常可用：讲解入口保持隐藏。
    try {
      agentEnabled().then((enabled) => { this.agentReady = !!enabled; });
    } catch (_) {
      this.agentReady = false;
    }
    try {
      this.speechReady = !!speechSupported();
    } catch (_) {
      this.speechReady = false;
    }
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
    document.removeEventListener("selectionchange", this.onDocumentSelectionChange);
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
    // ------------------------------------------------- 选词浮条（契约 P0-3）
    // captureSelection 在正文里松开鼠标（或抬手）时读一次选区：
    // 有选中的单词/短语就在选区上方浮出「朗读 / 讲解 / 入册」。
    captureSelection() {
      const selection = typeof window !== "undefined" && window.getSelection ? window.getSelection() : null;
      const text = selection ? String(selection).replace(/\s+/g, " ").trim() : "";
      if (!selection || selection.isCollapsed || !text || selection.rangeCount === 0) {
        this.hideSelection();
        return;
      }
      const range = selection.getRangeAt(0);
      const start = range.startContainer;
      const element = start && start.nodeType === 1 ? start : (start && start.parentElement);
      const paragraph = element && element.closest ? element.closest("[data-paragraph-index]") : null;
      if (!paragraph) {
        // 只处理正文里的选区：工具栏、侧栏里的选中不弹浮条。
        this.hideSelection();
        return;
      }
      const rect = range.getBoundingClientRect();
      if (!rect || (!rect.width && !rect.height)) {
        this.hideSelection();
        return;
      }
      const below = rect.top < 80;   // 贴近视口顶部时改到选区下方，避免被顶栏压住
      this.selectionText = text.slice(0, 200);
      this.selectionIndex = Number(paragraph.dataset.paragraphIndex) || 0;
      this.selectionBar = {
        left: Math.round(rect.left + rect.width / 2),
        top: Math.round(below ? rect.bottom + 10 : rect.top - 10),
        below,
      };
      this.selectionCard = null;
      this.selectionError = "";
      this.selectionNote = "";
    },
    onDocumentSelectionChange() {
      const selection = typeof window !== "undefined" && window.getSelection ? window.getSelection() : null;
      if (!selection || selection.isCollapsed || !String(selection).trim()) this.hideSelection();
    },
    hideSelection() {
      this.selectionText = "";
      this.selectionBar = null;
    },
    readSelection() {
      const text = this.selectionText;
      this.hideSelection();
      if (!text) return;
      try {
        speakAgentText(text, { lang: "en-US", rate: 0.9 });
      } catch (_) {
        // 语音模块不可用时静默：按钮本身已按 speechSupported() 隐藏。
      }
    },
    // 选区的上下文：只上报段落级定位 + 选中文本，不整篇上传。
    selectionContextPatch(text) {
      const total = this.selected.paragraphs.length;
      const index = Math.min(Math.max(this.selectionIndex, 0), Math.max(0, total - 1));
      const paragraph = this.selected.paragraphs[index] || {};
      return {
        view: "reading",
        scene: "reading",
        level: "middle",
        articleId: this.selected.id,
        articleTitle: this.selected.title,
        paragraph: index + 1,
        paragraphs: total,
        sentence: text || paragraph.en || "",
      };
    },
    explainSelection() {
      const text = this.selectionText;
      if (!text || this.selectionBusy) return;
      const patch = this.selectionContextPatch(text);
      const key = patch.articleId + ":" + patch.paragraph + ":" + text;
      this.hideSelection();
      publishContext(patch);
      return this.runSelectionExplain(patch, key);
    },
    retrySelectionExplain() {
      if (!this.selectionPatch) return;
      return this.runSelectionExplain(this.selectionPatch, this.selectionFor);
    },
    // 就地讲解：compact 卡片直接展开在选区所在段落下面，不遮挡正文。
    async runSelectionExplain(patch, key) {
      this.selectionCard = null;
      this.selectionError = "";
      this.selectionNote = "";
      this.selectionBusy = true;
      this.selectionFor = key;
      this.selectionPatch = patch;
      const result = await askInline({
        quickAction: "explain-sentence",
        label: "讲解这句",
        contextPatch: patch,
      });
      if (this.selectionFor !== key) return;   // 已经换了段落：迟到的结果不再显示
      this.selectionBusy = false;
      if (result.card) {
        this.selectionCard = result.card;
        return;
      }
      // 服务端没给出结构化卡片时回落到纯文本讲解，页面不白屏。
      if (result.message) {
        this.selectionCard = { kind: "reading", headline: "助教讲解", points: [{ label: "讲解", text: result.message }] };
        return;
      }
      this.selectionError = result.error || "助教暂时没有给出讲解，请重试。";
    },
    resetSelectionTeach() {
      this.selectionCard = null;
      this.selectionError = "";
      this.selectionBusy = false;
      this.selectionNote = "";
      this.selectionFor = "";
      this.selectionPatch = null;
    },
    addSelectionToReview() {
      const text = this.selectionText;
      // 入册请求要带上阅读段落上下文：publishContext 是合并语义，不先放上下文的话，
      // 请求可能还挂着上一页的题目字段（服务端会当成那道题来解释）。
      if (text) publishContext(this.selectionContextPatch(text));
      this.hideSelection();
      return this.addReview({ word: text, spelling: text, wordId: text });
    },
    // 入册：只上报选中文本的定位信息，复习队列由服务端按词库写入。
    async addReview(target) {
      const payload = target && typeof target === "object" ? target : {};
      const wordId = String(payload.id || payload.wordId || payload.word || this.selectionText || "").trim();
      const spelling = String(payload.word || payload.spelling || this.selectionText || wordId).trim();
      if (!wordId && !spelling) {
        this.showReadingToast("没有可加入复习的单词。");
        return;
      }
      const result = await askInline({
        quickAction: "add-review",
        label: "加入今日复习",
        contextPatch: { wordId: wordId || spelling, level: payload.level || "middle", spelling },
      });
      const action = (result.actions || []).find((item) => item && item.type === "add-review");
      const message = (action && action.message) || result.message || "";
      this.showReadingToast(message && !result.error ? message : (result.error || "加入复习失败，请稍后重试。"));
    },
    speakSelectionText(text) {
      const value = typeof text === "string" ? text : (text && (text.text || text.en || text.word)) || "";
      if (value) this.$emit("speak", value);
    },
    askSelectionInline(payload) {
      const action = typeof payload === "string" ? payload : (payload && payload.quickAction) || "";
      if (action === "drill") {
        // 阅读页上下文里没有单词 ID，直接让助教按这段文字出题更稳。
        askAssistant("请用这段文字里的重点词出 3 道小练习，并给出答案。", { label: "出同类题" });
        return;
      }
      // 卡片行动条的 kind=review：选中的词/短语直接入册（讲解后选区已收起，从 patch 里取文本）。
      if (action === "add-review") {
        const text = this.selectionText || (this.selectionPatch && this.selectionPatch.sentence) || "";
        if (this.selectionPatch) publishContext(this.selectionPatch);
        return this.addReview({ word: text, spelling: text, wordId: text });
      }
      const patch = this.selectionPatch;
      if (patch) { this.runSelectionExplain(patch, this.selectionFor); return; }
      // 没有可复用段落上下文时，至少把卡片给的小动作提示出来，不留空点击。
      const note = typeof payload === "string" ? "" : (payload && (payload.text || payload.label)) || "";
      if (note) this.showReadingToast(note);
    },
    showReadingToast(text) {
      this.toast = String(text || "");
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => { this.toast = ""; }, 4000);
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
      this.hideSelection();
      this.resetSelectionTeach();
      this.selectedId = id;
      this.mode = "read";
      this.revealed = new Set();
      this.activeParagraph = -1;
      this.$nextTick(() => this.restorePosition(id, "smooth"));
    },
    setMode(mode) {
      this.rememberCurrentPosition();
      this.hideSelection();
      this.resetSelectionTeach();
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
        this.hideSelection();
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

          <div class="article-body" @mouseup="captureSelection" @touchend="captureSelection">
            <section
              v-for="(paragraph,index) in selected.paragraphs"
              :key="index"
              :class="['reading-paragraph',{active:activeParagraph===index}]"
              :data-paragraph-index="index"
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
                <!-- 就地讲解（契约 P0-3）：选词后的讲解卡展开在这一段下面，compact 卡片。 -->
                <section v-if="selectionIndex===index && (selectionBusy || selectionCard || selectionError)" class="reading-inline-teach" aria-live="polite">
                  <header class="agent-inline-head">
                    <b>助教讲解</b>
                    <span v-if="selectionNote" class="agent-inline-note">{{ selectionNote }}</span>
                    <button @click="resetSelectionTeach()">收起</button>
                  </header>
                  <div v-if="selectionBusy" class="agent-inline-skeleton" aria-label="助教正在准备讲解">
                    <span></span><span></span><span></span>
                  </div>
                  <agent-teaching-card
                    v-else-if="selectionCard"
                    :card="selectionCard"
                    compact
                    @add-review="addReview"
                    @speak="speakSelectionText"
                    @ask="askSelectionInline"
                  />
                  <div v-else class="agent-inline-error" role="alert">
                    <span>{{ selectionError }}</span>
                    <button class="primary" @click="retrySelectionExplain()">重试</button>
                  </div>
                </section>
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
      <!-- 选词浮条（契约 P0-3）：选中单词/短语后在选区上方浮出 朗读 / 讲解 / 入册。
           位置用内联样式写死，不依赖 agent.css 是否已经加上这个类。 -->
      <div
        v-if="selectionBar && selectionText && (agentReady || speechReady)"
        class="reading-select-bar"
        role="toolbar"
        aria-label="选中内容的操作"
        @mousedown.prevent
        :style="{
          position: 'fixed',
          left: selectionBar.left + 'px',
          top: selectionBar.top + 'px',
          transform: selectionBar.below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
          zIndex: 70,
          display: 'flex',
          gap: '6px',
          padding: '6px 8px',
          background: '#fff',
          border: '1px solid rgba(15, 23, 42, .12)',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(15, 23, 42, .18)',
        }"
      >
        <button v-if="speechReady" @click="readSelection()">朗读</button>
        <button v-if="agentReady" @click="explainSelection()">讲解</button>
        <button v-if="agentReady" @click="addSelectionToReview()">入册</button>
      </div>
      <div v-if="toast" class="reading-toast">{{ toast }}</div>
    </section>
  `,
};
