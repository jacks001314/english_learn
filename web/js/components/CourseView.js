import { api } from "../api.js";
import { speak } from "../speech.js";

export default {
  name: "CourseView",
  data: () => ({
    loading: true,
    error: "",
    grades: [],
    books: [],
    bookIdx: 0,
    sectionIdx: 0,
    tab: "article",
    query: "",
  }),
  computed: {
    book() {
      return this.books[this.bookIdx] || null;
    },
    sections() {
      return this.book?.sections || [];
    },
    section() {
      return this.sections[this.sectionIdx] || null;
    },
    filteredSections() {
      const q = this.query.trim().toLowerCase();
      if (!q) return this.sections;
      return this.sections.filter(
        (s) =>
          `${s.section} ${s.title} ${s.topic}`.toLowerCase().includes(q) ||
          (s.grammar && `${s.grammar.topic} ${s.grammar.summary}`.toLowerCase().includes(q)) ||
          (s.words || []).some((w) => w.word.toLowerCase().includes(q)),
      );
    },
    sectionCount() {
      return this.sections.length;
    },
  },
  methods: {
    speak,
    async load() {
      this.loading = true;
      this.error = "";
      try {
        const data = await api("/api/course");
        this.grades = data.grades || [];
        this.books = data.books || [];
        this.bookIdx = 0;
        this.sectionIdx = 0;
      } catch (e) {
        this.error = e.message || "加载课程数据失败";
      } finally {
        this.loading = false;
      }
    },
    selectBook(i) {
      this.bookIdx = i;
      this.sectionIdx = 0;
      this.tab = "article";
    },
    selectSection(s) {
      this.sectionIdx = this.sections.indexOf(s);
      this.tab = "article";
    },
    setTab(t) {
      this.tab = t;
    },
    readWhole() {
      const r = this.section?.article?.reading;
      if (r && r.paragraphs.length) this.speak(r.paragraphs.join(" "));
    },
    shortKey(section) {
      const m = /^(Module|Unit)\s*(\d+)/.exec(section || "");
      if (m) return (m[1] === "Module" ? "M" : "U") + (m[2] || "");
      return section || "";
    },
    escapeHtml(s) {
      return String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    },
    escapeRegExp(s) {
      return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    },
    // Highlight the module's target vocabulary inside the article text.
    hl(text) {
      const words = (this.section?.words || [])
        .map((w) => (w.word || "").trim())
        .filter((w) => w.length >= 2)
        .sort((a, b) => b.length - a.length);
      let out = this.escapeHtml(text || "");
      if (!words.length) return out;
      const alts = words.map((w) => this.escapeRegExp(w));
      const re = new RegExp(`(?<![A-Za-z])(${alts.join("|")})(?![A-Za-z])`, "gi");
      return out.replace(re, '<mark class="kw">$1</mark>');
    },
  },
  mounted() {
    this.load();
  },
  template: `
    <div class="course-page">
      <div class="course-headline">
        <div>
          <span class="course-eyebrow">外研社初中英语</span>
          <h1>课程学习</h1>
          <p class="course-sub">按教材模块学 <em>文章</em> · <em>重点词</em> · <em>语法</em>，词句可点读</p>
        </div>
      </div>

      <div v-if="loading" class="course-status">正在加载课程…</div>
      <div v-else-if="error" class="course-status error">{{ error }}</div>

      <template v-else>
        <div class="course-bookbar" role="tablist" aria-label="选择教材">
          <button
            v-for="(b, i) in books"
            :key="b.book"
            class="book-chip"
            :class="{ active: i === bookIdx }"
            @click="selectBook(i)"
          >
            <b>{{ b.grade }}</b><span>{{ b.semester }}</span>
          </button>
        </div>

        <div class="course-layout">
          <aside class="course-modules">
            <div class="modules-head">
              <b>课程模块</b>
              <small>{{ sectionCount }} 个</small>
            </div>
            <input
              v-model="query"
              class="course-search"
              type="search"
              placeholder="搜索模块 / 单词 / 语法"
            />
            <div class="module-list">
              <button
                v-for="s in filteredSections"
                :key="s.section"
                class="module-item"
                :class="{ active: sections[sectionIdx] === s }"
                @click="selectSection(s)"
              >
                <span class="mod-badge">{{ shortKey(s.section) }}</span>
                <span class="mod-info">
                  <b>{{ s.title }}</b>
                  <small>{{ s.section }}</small>
                </span>
              </button>
              <div v-if="!filteredSections.length" class="course-empty">没有匹配的模块</div>
            </div>
            <div class="modules-foot">
              <span v-if="book">{{ book.grade }}{{ book.semester }} · {{ book.edition }}</span>
            </div>
          </aside>

          <section class="course-detail">
            <template v-if="section">
              <div class="detail-head">
                <span class="detail-tag">{{ book.grade }}{{ book.semester }} · {{ section.section }}</span>
                <h2>{{ section.title }}</h2>
                <p class="detail-topic">{{ section.topic }}</p>
              </div>

              <div class="course-tabs" role="tablist">
                <button :class="{ active: tab === 'article' }" @click="setTab('article')">文章</button>
                <button :class="{ active: tab === 'words' }" @click="setTab('words')">重点词</button>
                <button :class="{ active: tab === 'grammar' }" @click="setTab('grammar')">语法</button>
              </div>

              <div v-if="tab === 'article'" class="course-pane">
                <p class="kw-legend"><mark class="kw">{{ shortKey(section.section) }}</mark> 高亮词为本模块重点词，点击句子可朗读</p>

                <div v-if="section.article.dialogues.length" class="dialogue-block">
                  <h3><span class="sec-dot"></span>对话</h3>
                  <div class="dlg-list">
                    <div
                      v-for="(d, di) in section.article.dialogues"
                      :key="di"
                      class="dlg-line"
                      :class="di % 2 ? 'alt' : ''"
                    >
                      <span class="dlg-name">{{ d.speaker }}</span>
                      <span class="dlg-bubble" v-html="hl(d.text)"></span>
                    </div>
                  </div>
                </div>

                <div v-if="section.article.reading.paragraphs.length" class="reading-block">
                  <div class="reading-head">
                    <h3><span class="sec-dot"></span>{{ section.article.reading.title }}</h3>
                    <button class="speak-all" @click="readWhole">朗读全文</button>
                  </div>
                  <div class="reading-body">
                    <p v-for="(p, pi) in section.article.reading.paragraphs" :key="pi" v-html="hl(p)"></p>
                  </div>
                </div>

                <div
                  v-if="!section.article.dialogues.length && !section.article.reading.paragraphs.length"
                  class="course-empty"
                >本模块暂无文章内容</div>
              </div>

              <div v-if="tab === 'words'" class="course-pane">
                <div class="words-bar">
                  <b>{{ (section.words || []).length }} 个重点词</b>
                  <small>点击单词可朗读</small>
                </div>
                <div class="word-grid">
                  <div
                    v-for="(w, wi) in section.words"
                    :key="wi"
                    class="word-card"
                    @click="speak(w.word)"
                  >
                    <span class="w-word">{{ w.word }}</span>
                    <span class="w-phon">{{ w.phonetic }}</span>
                    <span class="w-meaning">{{ w.meaning }}</span>
                  </div>
                </div>
                <div v-if="!(section.words || []).length" class="course-empty">本模块暂无字词</div>
              </div>

              <div v-if="tab === 'grammar'" class="course-pane">
                <div v-if="section.grammar && section.grammar.topic" class="grammar-block">
                  <span class="grammar-label">重点语法</span>
                  <h3>{{ section.grammar.topic }}</h3>
                  <p class="grammar-summary">{{ section.grammar.summary }}</p>
                  <ul class="grammar-examples">
                    <li v-for="(ex, ei) in section.grammar.examples" :key="ei" @click="speak(ex)">
                      <span class="ex-ico">例</span>{{ ex }}
                    </li>
                  </ul>
                </div>
                <div v-else class="course-empty">本模块暂无语法要点</div>
                <button class="grammar-jump" @click="$emit('open-grammar')">前往「语法专题」系统学习结构、用法与真题 →</button>
              </div>
            </template>
            <div v-else class="course-empty">选择一个模块开始学习</div>
          </section>
        </div>
      </template>
    </div>
  `,
};
