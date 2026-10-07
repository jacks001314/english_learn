import { api } from "../api.js";
import { speak } from "../speech.js";
import { publishContext } from "../learningContext.js?v=20261007-agent-leakfix-r1";

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
          `${s.section} ${s.title} ${s.titleZh || ""} ${s.topic}`.toLowerCase().includes(q) ||
          (s.grammar && `${s.grammar.topic} ${s.grammar.summary}`.toLowerCase().includes(q)) ||
          (s.words || []).some((w) => w.word.toLowerCase().includes(q)),
      );
    },
    sectionCount() {
      return this.sections.length;
    },
    appendixAudios() {
      return this.book?.appendixAudios || [];
    },
    tabs() {
      const s = this.section;
      if (!s) return [];
      const list = [{ key: "article", label: "文章" }];
      if ((s.words || []).length) list.push({ key: "words", label: "词汇 " + s.words.length });
      if ((s.phrases || []).length) list.push({ key: "phrases", label: "词组 " + s.phrases.length });
      if ((s.patterns || []).length) list.push({ key: "patterns", label: "句型 " + s.patterns.length });
      if (s.grammar && s.grammar.topic) list.push({ key: "grammar", label: "语法" });
      if ((s.notes || []).length) list.push({ key: "notes", label: "知识点 " + s.notes.length });
      if (s.listening && (s.listening.title || (s.listening.script || []).length)) {
        list.push({ key: "listening", label: "听力" });
      }
      return list;
    },
    texts() {
      const s = this.section;
      if (!s) return [];
      const out = [];
      const reading = s.article?.reading;
      if (reading && (reading.title || (reading.paragraphs || []).length)) out.push(reading);
      for (const t of s.article?.extra || []) out.push(t);
      return out;
    },
  },
  methods: {
    // 把“正在学哪个模块”发布到学习上下文总线（契约 §5：courseUnit / courseSection）。
    publishContext() {
      const book = this.book;
      const section = this.section;
      if (!book || !section) return;
      // 单元名先在对象字面量外拼好：契约守门脚本按顶层逗号切键，字面量里出现数组
      // 会把数组元素（book / section）误判成上报字段，所以这里不写数组字面量。
      const unit = [book.grade, book.semester, section.section].filter(Boolean).join(" · ");
      publishContext({
        view: "course",
        scene: "course",
        level: "middle",
        courseUnit: unit,
        courseSection: section.title || section.section || "",
      });
    },
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
        this.publishContext();
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
      this.publishContext();
    },
    selectSection(s) {
      this.sectionIdx = this.sections.indexOf(s);
      this.tab = "article";
      this.publishContext();
    },
    setTab(t) {
      this.tab = t;
    },
    readWhole(text) {
      if (text) this.speak(text);
    },
    readText(t) {
      const paragraphs = (t && t.paragraphs) || [];
      if (paragraphs.length) this.speak(paragraphs.join(" "));
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
    // Highlight the unit's target vocabulary inside the article text.
    hl(text) {
      const words = (this.section?.words || [])
        .map((w) => (w.word || "").trim())
        .filter((w) => /^[A-Za-z][A-Za-z' -]*$/.test(w) && w.length >= 3)
        .sort((a, b) => b.length - a.length);
      let out = this.escapeHtml(text || "");
      if (!words.length) return out.replace(/\n/g, "<br />");
      const alts = words.map((w) => this.escapeRegExp(w));
      const re = new RegExp(`(?<![A-Za-z])(${alts.join("|")})(?![A-Za-z])`, "gi");
      return out.replace(re, '<mark class="kw">$1</mark>').replace(/\n/g, "<br />");
    },
  },
  mounted() {
    this.load();
  },
  template: `
    <div class="course-page">
      <div class="course-headline">
        <div>
          <span class="course-eyebrow">外研版初中英语 · 教材同步</span>
          <h1>课程学习</h1>
          <p class="course-sub">按教材单元学 <em>文章</em> · <em>词汇</em> · <em>词组</em> · <em>句型</em> · <em>语法</em> · <em>知识点</em> · <em>听力</em>，词句可点读</p>
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
                <h2>{{ section.title }}<small v-if="section.titleZh" class="detail-zh"> {{ section.titleZh }}</small></h2>
                <p class="detail-topic">{{ section.topic }}</p>
                <ul v-if="(section.goals || []).length" class="detail-goals">
                  <li v-for="(g, gi) in section.goals" :key="gi">{{ g }}</li>
                </ul>
              </div>

              <div class="course-tabs" role="tablist">
                <button
                  v-for="t in tabs"
                  :key="t.key"
                  :class="{ active: tab === t.key }"
                  @click="setTab(t.key)"
                >{{ t.label }}</button>
              </div>

              <div v-if="tab === 'article'" class="course-pane">
                <p class="kw-legend"><mark class="kw">{{ shortKey(section.section) }}</mark> 高亮词为本单元词汇，点击句子可朗读</p>

                <div v-for="(t, ti) in texts" :key="ti" class="reading-block">
                  <div class="reading-head">
                    <h3>
                      <span class="sec-dot"></span>{{ t.title }}
                      <small v-if="t.kind" class="reading-kind">{{ t.kind }}</small>
                    </h3>
                    <button class="speak-all" @click="readText(t)">朗读全文</button>
                  </div>
                  <div v-if="t.audio" class="audio-row">
                    <span class="audio-label"><b>课文录音</b>点击播放跟读</span>
                    <audio controls preload="none" :src="t.audio"></audio>
                  </div>
                  <div class="reading-body">
                    <p v-for="(p, pi) in t.paragraphs" :key="pi" @click="speak(p)" v-html="hl(p)"></p>
                  </div>
                </div>

                <div v-if="section.speaking" class="reading-block">
                  <div class="reading-head">
                    <h3><span class="sec-dot"></span>{{ section.speaking.title }}</h3>
                  </div>
                  <div class="audio-row">
                    <span class="audio-label"><b>活动录音</b>先听后说</span>
                    <audio controls preload="none" :src="section.speaking.url"></audio>
                  </div>
                </div>

                <div v-if="(section.article.dialogues || []).length" class="dialogue-block">
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

                <div v-if="!texts.length && !(section.article.dialogues || []).length" class="course-empty">
                  本模块暂无文章内容
                </div>
              </div>

              <div v-if="tab === 'words'" class="course-pane">
                <div class="words-bar">
                  <b>{{ (section.words || []).length }} 个词汇</b>
                  <small>点击单词可朗读</small>
                </div>
                <div v-if="section.wordsAudio" class="audio-row audio-row-sole">
                  <span class="audio-label"><b>单词录音</b>Words and expressions</span>
                  <audio controls preload="none" :src="section.wordsAudio"></audio>
                </div>
                <div class="word-grid">
                  <div
                    v-for="(w, wi) in section.words"
                    :key="wi"
                    class="word-card"
                    @click="speak(w.word)"
                  >
                    <span class="w-word">{{ w.word }}</span>
                    <span v-if="w.pos" class="w-pos">{{ w.pos }}</span>
                    <span class="w-phon">{{ w.phonetic }}</span>
                    <span class="w-meaning">{{ w.meaning }}</span>
                  </div>
                </div>
                <div v-if="!(section.words || []).length" class="course-empty">本模块暂无词汇</div>
              </div>

              <div v-if="tab === 'phrases'" class="course-pane">
                <div class="words-bar">
                  <b>{{ (section.phrases || []).length }} 个词组</b>
                  <small>点击词组可朗读</small>
                </div>
                <div class="phrase-list">
                  <div
                    v-for="(p, pi) in section.phrases"
                    :key="pi"
                    class="phrase-item"
                    @click="speak(p.phrase)"
                  >
                    <b>{{ p.phrase }}</b><span>{{ p.meaning }}</span>
                  </div>
                </div>
              </div>

              <div v-if="tab === 'patterns'" class="course-pane">
                <div class="words-bar">
                  <b>{{ (section.patterns || []).length }} 个句型</b>
                  <small>点击例句可朗读</small>
                </div>
                <div class="pattern-list">
                  <div v-for="(p, pi) in section.patterns" :key="pi" class="pattern-item">
                    <div class="pattern-head">
                      <b>{{ p.pattern }}</b>
                      <span class="pattern-mean">{{ p.meaning }}</span>
                    </div>
                    <ul v-if="(p.examples || []).length" class="pattern-examples">
                      <li v-for="(ex, ei) in p.examples" :key="ei" @click="speak(ex)">{{ ex }}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div v-if="tab === 'grammar'" class="course-pane">
                <div v-if="section.grammar && section.grammar.topic" class="grammar-block">
                  <span class="grammar-label">重点语法</span>
                  <h3>{{ section.grammar.topic }}</h3>
                  <p class="grammar-summary">{{ section.grammar.summary }}</p>

                  <div v-for="(pt, pi) in section.grammar.points || []" :key="pi" class="grammar-point">
                    <h4>{{ pt.title }}</h4>
                    <p class="grammar-detail">{{ pt.detail }}</p>
                    <ul class="grammar-examples">
                      <li v-for="(ex, ei) in pt.examples || []" :key="ei" @click="speak(ex)">
                        <span class="ex-ico">例</span>{{ ex }}
                      </li>
                    </ul>
                  </div>

                  <div v-if="(section.grammar.examples || []).length" class="grammar-point">
                    <h4>课本例句</h4>
                    <ul class="grammar-examples">
                      <li v-for="(ex, ei) in section.grammar.examples" :key="ei" @click="speak(ex)">
                        <span class="ex-ico">例</span>{{ ex }}
                      </li>
                    </ul>
                  </div>
                </div>
                <div v-else class="course-empty">本模块暂无语法要点</div>
                <button class="grammar-jump" @click="$emit('open-grammar', (section.grammar && section.grammar.topic) || '')">前往「语法专题」系统学习结构、用法与真题 →</button>
              </div>

              <div v-if="tab === 'notes'" class="course-pane">
                <div class="words-bar">
                  <b>{{ (section.notes || []).length }} 个知识点</b>
                  <small>源自教材 Notes，含语言点与文化背景</small>
                </div>
                <div class="note-list">
                  <div v-for="(n, ni) in section.notes" :key="ni" class="note-item">
                    <h4>{{ n.title }}</h4>
                    <p>{{ n.body }}</p>
                  </div>
                </div>
              </div>

              <div v-if="tab === 'listening'" class="course-pane">
                <div class="listening-head">
                  <h3>{{ section.listening.title }}</h3>
                  <span v-if="!(section.listening.tracks || []).length" class="audio-pending">音频待补充</span>
                </div>
                <div class="audio-list">
                  <div
                    v-for="(t, ai) in section.listening.tracks || []"
                    :key="ai"
                    class="audio-row"
                  >
                    <span class="audio-label"><b>听力 {{ ai + 1 }}</b>{{ t.title }}</span>
                    <audio controls preload="none" :src="t.url"></audio>
                  </div>
                  <div v-if="section.listening.phonetics" class="audio-row">
                    <span class="audio-label"><b>语音</b>{{ section.listening.phonetics.title }}</span>
                    <audio controls preload="none" :src="section.listening.phonetics.url"></audio>
                  </div>
                  <div v-if="appendixAudios.length" class="audio-list-head">附录音频</div>
                  <div v-for="(t, ai) in appendixAudios" :key="'ap' + ai" class="audio-row">
                    <span class="audio-label"><b>附录</b>{{ t.title }}</span>
                    <audio controls preload="none" :src="t.url"></audio>
                  </div>
                </div>
                <ul v-if="(section.listening.tasks || []).length" class="listening-tasks">
                  <li v-for="(t, ti) in section.listening.tasks" :key="ti">{{ t }}</li>
                </ul>
                <div class="dlg-list">
                  <div
                    v-for="(d, di) in section.listening.script"
                    :key="di"
                    class="dlg-line"
                    :class="di % 2 ? 'alt' : ''"
                    @click="speak(d.text)"
                  >
                    <span class="dlg-name">{{ d.speaker }}</span>
                    <span class="dlg-bubble" v-html="hl(d.text)"></span>
                  </div>
                </div>
                <div v-if="!(section.listening.script || []).length" class="course-empty">本模块暂无听力材料</div>
              </div>
            </template>
            <div v-else class="course-empty">选择一个模块开始学习</div>
          </section>
        </div>
      </template>
    </div>
  `,
};
