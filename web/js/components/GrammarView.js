import { speak } from "../speech.js?v=20260905-ipa-r3";
import {
  sortedTopics,
  grammarCategories,
  exercisesByTopic,
  grammarExercises,
  examExercises,
  otherExamExercises,
  adaptedExercises,
  authoredOnly,
  examYears,
  loadGrammarProgress,
  saveGrammarProgress,
  recordAnswer,
  topicMastery,
  overallMastery,
} from "../grammar/index.js?v=20260927-yufan-r1";

const letters = ["A", "B", "C", "D", "E", "F"];

export default {
  name: "GrammarView",
  props: {
    userId: { type: String, default: "" },
    targetTopicId: { type: String, default: "" },
  },
  data: () => ({
    topics: sortedTopics,
    categories: grammarCategories,
    exercisesByTopic,
    totalExercises: grammarExercises.length,
    totalExam: examExercises.length,
    totalOtherExam: otherExamExercises.length,
    totalAdapted: adaptedExercises.length,
    totalAuthored: authoredOnly.length,
    years: examYears,
    query: "",
    category: "全部",
    selectedId: sortedTopics[0]?.id || "",
    progress: {},
    picked: {},
  }),
  computed: {
    filteredTopics() {
      const q = this.query.trim().toLowerCase();
      return this.topics.filter((topic) => {
        if (this.category !== "全部" && topic.category !== this.category) return false;
        if (!q) return true;
        const hay = [
          topic.title,
          topic.short,
          topic.category,
          topic.summary,
          ...(topic.points || []).map((p) => `${p.title} ${p.desc}`),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    },
    groupedTopics() {
      return this.categories
        .map((cat) => ({ cat, items: this.filteredTopics.filter((t) => t.category === cat) }))
        .filter((group) => group.items.length);
    },
    selected() {
      return this.topics.find((t) => t.id === this.selectedId) || this.topics[0] || null;
    },
    selectedExercises() {
      return this.selected ? this.exercisesByTopic[this.selected.id] || [] : [];
    },
    selectedMastery() {
      return this.selected ? topicMastery(this.progress, this.selected.id, this.selectedExercises.length) : { percent: 0, done: 0, total: 0 };
    },
    overall() {
      return overallMastery(this.progress);
    },
    overallPercent() {
      return this.overall.total ? Math.round((this.overall.done / this.overall.total) * 100) : 0;
    },
  },
  watch: {
    userId() {
      this.progress = loadGrammarProgress(this.userId);
    },
    targetTopicId(id) {
      this.applyTarget(id);
    },
  },
  methods: {
    speak,
    stars(n) {
      return "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));
    },
    stemLines(stem) {
      return String(stem || "").split("\n");
    },
    letter(i) {
      return letters[i] || String(i + 1);
    },
    originLabel(ex) {
      if (ex.origin === "exam") return "北京中考真题";
      if (ex.origin === "exam-other") return "外地中考真题";
      if (ex.origin === "adapted") return "真题改编";
      return "专项练习";
    },
    masteryOf(topicId) {
      const total = (this.exercisesByTopic[topicId] || []).length;
      return topicMastery(this.progress, topicId, total);
    },
    pickKey(ex) {
      return `${ex.topicId}:${ex.id}`;
    },
    pickedOption(ex) {
      return this.picked[this.pickKey(ex)] || "";
    },
    isAnswered(ex) {
      return !!this.picked[this.pickKey(ex)];
    },
    answer(ex, option) {
      if (this.isAnswered(ex)) return;
      const picked = { ...this.picked, [this.pickKey(ex)]: option };
      this.picked = picked;
      const correct = option === ex.answer;
      this.progress = recordAnswer(this.progress, ex.topicId, ex.id, correct);
      saveGrammarProgress(this.userId, this.progress);
    },
    resetTopic() {
      if (!this.selected) return;
      const nextPicked = { ...this.picked };
      for (const ex of this.selectedExercises) delete nextPicked[this.pickKey(ex)];
      this.picked = nextPicked;
    },
    applyTarget(id) {
      if (id && this.topics.some((t) => t.id === id)) this.selectedId = id;
    },
    selectTopic(id) {
      this.selectedId = id;
      if (typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches) {
        this.$nextTick(() => {
          document.querySelector(".grammar-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    },
    optionClass(ex, option) {
      if (!this.isAnswered(ex)) return "";
      if (option === ex.answer) return "correct";
      if (option === this.pickedOption(ex)) return "wrong";
      return "muted";
    },
  },
  created() {
    this.progress = loadGrammarProgress(this.userId);
    this.applyTarget(this.targetTopicId);
  },
  template: `
    <div class="grammar-page">
      <div class="grammar-headline">
        <div>
          <span class="grammar-eyebrow">外研社初中英语 · 语法专题</span>
          <h1>语法专题</h1>
          <p class="grammar-sub">按专题系统学 <em>结构</em> · <em>用法</em> · <em>易错</em> · <em>中考真题</em></p>
        </div>
        <div class="grammar-progress" role="status">
          <div class="gp-num">{{ overall.done }}<span>/ {{ overall.total }}</span></div>
          <div class="gp-label">练习已完成</div>
          <div class="gp-bar"><i :style="{ width: overallPercent + '%' }"></i></div>
        </div>
      </div>

      <div class="grammar-toolbar">
        <div class="grammar-cats" role="tablist" aria-label="语法分类">
          <button :class="{ active: category === '全部' }" @click="category = '全部'">全部</button>
          <button v-for="c in categories" :key="c" :class="{ active: category === c }" @click="category = c">{{ c }}</button>
        </div>
        <label class="grammar-search">
          <input v-model="query" type="search" placeholder="搜索专题，如：现在完成时 / 被动 / 介词" />
        </label>
      </div>

      <p class="grammar-source-note">
        北京中考真题 {{ totalExam }} 道（{{ years.join('、') }} 年单项填空，含官方答案与详解）；
        外地中考真题 {{ totalOtherExam }} 道（题面自带年份与地区）；
        语篇原句改编 {{ totalAdapted }} 道（取自北京卷完形/阅读原句）；
        专项练习 {{ totalAuthored }} 道（真题未覆盖的语法点，按教材语法项目自编）。
        每道题上方均标注来源类型。
      </p>

      <div class="grammar-layout">
        <aside class="grammar-nav" aria-label="专题列表">
          <div v-for="group in groupedTopics" :key="group.cat" class="grammar-nav-group">
            <div class="gnav-label">{{ group.cat }}</div>
            <button
              v-for="topic in group.items"
              :key="topic.id"
              class="gnav-item"
              :class="{ active: topic.id === selectedId }"
              @click="selectTopic(topic.id)"
            >
              <span class="gnav-name">{{ topic.title }}</span>
              <span class="gnav-meta">
                <span class="gnav-count">{{ (exercisesByTopic[topic.id] || []).length }} 题</span>
                <span class="gnav-bar"><i :style="{ width: masteryOf(topic.id).percent + '%' }"></i></span>
              </span>
            </button>
          </div>
          <div v-if="!groupedTopics.length" class="grammar-empty">没有匹配的专题</div>
        </aside>

        <section v-if="selected" class="grammar-detail">
          <header class="gd-head">
            <div class="gd-tags">
              <span class="gd-cat">{{ selected.category }}</span>
              <span class="gd-level" :title="'难度 ' + selected.difficulty">难度 {{ stars(selected.difficulty) }}</span>
            </div>
            <h2>{{ selected.title }}</h2>
            <p class="gd-summary">{{ selected.summary }}</p>
            <div v-if="selected.textbookLinks && selected.textbookLinks.length" class="gd-links">
              <span class="gd-links-label">对应教材</span>
              <span v-for="link in selected.textbookLinks" :key="link.book + link.section" class="gd-link">
                {{ link.book }} {{ link.section }} · {{ link.title }}
              </span>
            </div>
            <p v-else-if="selected.spreadNote" class="gd-spread">{{ selected.spreadNote }}</p>
          </header>

          <section v-if="selected.lecture" class="gd-block gd-lecture">
            <h3>
              <span class="sec-dot"></span>讲义精讲
              <em v-if="selected.lecture.sourceDirs && selected.lecture.sourceDirs.length" class="gd-lecture-src">教材图片整理 · {{ selected.lecture.sourceDirs.join("、") }}</em>
            </h3>
            <p v-if="selected.lecture.intro" class="gd-lecture-intro">{{ selected.lecture.intro }}</p>
            <div v-for="(sec, si) in selected.lecture.sections" :key="si" class="gd-lec-section">
              <h4>{{ sec.heading }}</h4>
              <template v-for="(blk, bi) in sec.blocks" :key="bi">
                <p v-if="blk.type === 'text'" class="gd-lec-text">{{ blk.text }}</p>
                <ul v-else-if="blk.type === 'list'" class="gd-lec-list">
                  <li v-for="(it, ii) in blk.items" :key="ii">{{ it }}</li>
                </ul>
                <div v-else-if="blk.type === 'table'" class="gd-lec-table">
                  <table>
                    <thead>
                      <tr><th v-for="(h, hi) in blk.head" :key="hi">{{ h }}</th></tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, ri) in blk.rows" :key="ri">
                        <td v-for="(cell, ci2) in row" :key="ci2">{{ cell }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <ul v-else-if="blk.type === 'examples'" class="gd-lec-ex">
                  <li v-for="(ex, ei) in blk.items" :key="ei" @click="speak(ex.en)">
                    <span class="tb-en">{{ ex.en }}</span>
                    <span class="tb-zh">{{ ex.zh }}</span>
                  </li>
                </ul>
                <p v-else-if="blk.type === 'tip'" class="gd-lec-tip"><b>提示</b>{{ blk.text }}</p>
                <p v-else-if="blk.type === 'pitfall'" class="gd-lec-pitfall"><b>易错</b>{{ blk.text }}</p>
              </template>
            </div>
          </section>

          <section v-if="selected.forms && selected.forms.length" class="gd-block">
            <h3><span class="sec-dot"></span>结构公式</h3>
            <div class="gd-forms">
              <div v-for="(form, fi) in selected.forms" :key="fi" class="gd-form">
                <div class="gd-form-name">{{ form.name }}</div>
                <code class="gd-form-pattern">{{ form.pattern }}</code>
                <div v-if="form.note" class="gd-form-note">{{ form.note }}</div>
              </div>
            </div>
          </section>

          <section v-if="selected.points && selected.points.length" class="gd-block">
            <h3><span class="sec-dot"></span>用法要点</h3>
            <div class="gd-points">
              <div v-for="(point, pi) in selected.points" :key="pi" class="gd-point">
                <h4>{{ point.title }}</h4>
                <p class="gd-point-desc">{{ point.desc }}</p>
                <ul class="gd-examples">
                  <li v-for="(ex, ei) in point.good" :key="'g' + ei" class="good" @click="speak(ex)">
                    <span class="ex-ico ok">✓</span>{{ ex }}
                  </li>
                  <li v-for="(ex, ei) in point.bad" :key="'b' + ei" class="bad">
                    <span class="ex-ico no">✕</span>{{ ex }}
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section v-if="selected.contrasts && selected.contrasts.length" class="gd-block">
            <h3><span class="sec-dot"></span>对比辨析</h3>
            <div v-for="(c, ci) in selected.contrasts" :key="ci" class="gd-contrast">
              <div class="gd-contrast-title">{{ c.title }}</div>
              <table>
                <thead>
                  <tr><th v-for="(h, hi) in c.head" :key="hi">{{ h }}</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(row, ri) in c.rows" :key="ri">
                    <td v-for="(cell, ci2) in row" :key="ci2">{{ cell }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-if="(selected.pitfalls && selected.pitfalls.length) || (selected.examTips && selected.examTips.length)" class="gd-block gd-two-col">
            <div>
              <h3 v-if="selected.pitfalls && selected.pitfalls.length"><span class="sec-dot"></span>易错点</h3>
              <ul v-if="selected.pitfalls && selected.pitfalls.length" class="gd-plain">
                <li v-for="(p, pi) in selected.pitfalls" :key="pi">{{ p }}</li>
              </ul>
            </div>
            <div>
              <h3 v-if="selected.examTips && selected.examTips.length"><span class="sec-dot"></span>中考提示</h3>
              <ul v-if="selected.examTips && selected.examTips.length" class="gd-plain exam">
                <li v-for="(t, ti) in selected.examTips" :key="ti">{{ t }}</li>
              </ul>
            </div>
          </section>

          <section v-if="selected.memoryCard && selected.memoryCard.length" class="gd-block">
            <h3><span class="sec-dot"></span>记忆卡</h3>
            <div class="gd-memory">
              <span v-for="(m, mi) in selected.memoryCard" :key="mi">{{ m }}</span>
            </div>
          </section>

          <section v-if="selected.textbookExamples && selected.textbookExamples.length" class="gd-block">
            <h3><span class="sec-dot"></span>教材例句</h3>
            <ul class="gd-textbook-ex">
              <li v-for="(ex, ei) in selected.textbookExamples" :key="ei" @click="speak(ex.en)">
                <span class="tb-en">{{ ex.en }}</span>
                <span class="tb-zh">{{ ex.zh }}</span>
                <span class="tb-src">{{ ex.source }}</span>
              </li>
            </ul>
          </section>

          <section class="gd-block gd-practice">
            <div class="gd-practice-head">
              <h3><span class="sec-dot"></span>专项练习</h3>
              <span class="gd-practice-meta">
                本专题 {{ selectedExercises.length }} 题 · 已答 {{ selectedMastery.done }}/{{ selectedMastery.total }}
                <button v-if="selectedMastery.done" class="gd-reset" @click="resetTopic">重做</button>
              </span>
            </div>

            <article v-for="(ex, ei) in selectedExercises" :key="ex.id" class="gd-question">
              <div class="gd-q-head">
                <span class="gd-q-no">第 {{ ei + 1 }} 题</span>
                <span class="gd-q-badge" :class="ex.origin">{{ originLabel(ex) }}</span>
                <span class="gd-q-src">{{ ex.sourceLabel }}</span>
                <span v-if="ex.point" class="gd-q-point">考点：{{ ex.point }}</span>
              </div>
              <p class="gd-q-stem">
                <template v-for="(line, li) in stemLines(ex.stem)" :key="li">
                  {{ line }}<br v-if="li < stemLines(ex.stem).length - 1" />
                </template>
              </p>
              <div class="gd-options">
                <button
                  v-for="(opt, oi) in ex.options"
                  :key="oi"
                  class="gd-option"
                  :class="optionClass(ex, letter(oi))"
                  :disabled="isAnswered(ex)"
                  @click="answer(ex, letter(oi))"
                >
                  <span class="gd-opt-letter">{{ letter(oi) }}</span>
                  <span class="gd-opt-text">{{ opt }}</span>
                </button>
              </div>
              <div v-if="isAnswered(ex)" class="gd-feedback" :class="pickedOption(ex) === ex.answer ? 'right' : 'wrong'">
                <div class="gd-answer-line">
                  <b>{{ pickedOption(ex) === ex.answer ? '回答正确' : '回答错误' }}</b>
                  <span>正确答案：{{ ex.answer }}</span>
                </div>
                <p class="gd-explanation">{{ ex.explanation }}</p>
                <p v-if="ex.source && ex.source.answerSource" class="gd-answer-source">答案来源：{{ ex.source.answerSource }}</p>
                <p v-else-if="ex.source && ex.source.original" class="gd-answer-source">
                  原句（{{ ex.source.year }} 年 · {{ ex.source.section }}）：{{ ex.source.original }}
                  <br />{{ ex.source.note }}
                </p>
                <p v-else-if="ex.source && ex.source.note" class="gd-answer-source">
                  {{ ex.source.note }}<br />题目汇编来源：{{ ex.source.compiledFrom }}
                </p>
              </div>
            </article>

            <div v-if="!selectedExercises.length" class="grammar-empty">该专题暂无真题，后续补充。</div>
          </section>
        </section>
      </div>
    </div>
  `,
};
