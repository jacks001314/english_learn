import { speak } from "../speech.js?v=20260905-ipa-r3";
import {
  sortedTopics,
  grammarGroups,
  groupTopics,
  exercisesByTopic,
  examExercises,
  otherExamExercises,
  adaptedExercises,
  authoredOnly,
  examYears,
  loadGrammarProgress,
  saveGrammarProgress,
  loadLastTopicId,
  saveLastTopicId,
  recordAnswer,
  topicMastery,
  overallMastery,
  exerciseCounts,
  examWeightByTopic,
  topicState,
  resolveTopicId,
  topicPosition,
  loadLecture,
  isCardTopic,
} from "../grammar/index.js?v=20261004-primary-grammar-r1";
import { publishContext } from "../learningContext.js?v=20261007-agent-leakfix-r1";

const letters = ["A", "B", "C", "D", "E", "F"];
const ORIGIN_ORDER = ["exam", "exam-other", "adapted", "authored"];
const ORIGIN_LABEL = {
  exam: "北京中考真题",
  "exam-other": "外地中考真题",
  adapted: "语篇原句改编",
  authored: "专项自编练习",
};
const NAV_COLLAPSED_KEY = "english-learn-grammar-nav-collapsed";

export default {
  name: "GrammarView",
  props: {
    userId: { type: String, default: "" },
    targetTopicId: { type: String, default: "" },
  },
  data: () => ({
    topics: sortedTopics,
    groups: grammarGroups,
    query: "",
    group: "all",
    filter: "all",
    selectedId: sortedTopics[0]?.id || "",
    progress: {},
    picked: {},
    lectureState: {},
    lectureCache: {},
    lectureOpen: {},
    collapsedGroups: {},
    lastTopicId: "",
    hoverTimer: 0,
    activeAnchor: "",
    spy: null,
    noteOpen: false,
    spreadOpen: false,
    pendingAnchor: "",
  }),
  computed: {
    counts() {
      return exerciseCounts[this.selectedId] || { total: 0, exam: 0, other: 0, adapted: 0, authored: 0 };
    },
    selected() {
      return this.topics.find((t) => t.id === this.selectedId) || this.topics[0] || null;
    },
    selectedMastery() {
      return this.selected
        ? topicMastery(this.progress, this.selected.id, (exercisesByTopic[this.selected.id] || []).length)
        : { percent: 0, done: 0, total: 0 };
    },
    selectedState() {
      return this.selected ? topicState(this.selected, this.selectedMastery) : { key: "empty", label: "" };
    },
    /** 小学基础知识卡：只讲要点，没有讲义与真题。 */
    isCardSelected() {
      return isCardTopic(this.selected);
    },
    /** 知识卡的例句总数（好例 + 错例）。 */
    cardExampleCount() {
      if (!this.selected) return 0;
      return (this.selected.points || []).reduce((n, p) => n + (p.good || []).length + (p.bad || []).length, 0);
    },
    groupOfSelected() {
      const g = this.groups.find((x) => x.key === (this.selected && this.selected.group));
      return g ? g.label : "";
    },
    lectureSections() {
      const lec = this.selected && this.selected.lecture;
      return lec ? lec.sectionsTotal || 0 : 0;
    },
    /** 讲义来源：扫描件显示图片目录，自撰讲义显示内容依据（见 yufan/README §11）。 */
    lectureSourceLabel() {
      const lec = this.selected && this.selected.lecture;
      if (!lec) return "";
      const dirs = lec.sourceDirs || [];
      return dirs.length ? "教材图片整理 · " + dirs.join("、") : lec.sourceNote || "依据教材语法项目整理";
    },
    examWeight() {
      return examWeightByTopic[this.selectedId] || 0;
    },
    textbookLabel() {
      const links = (this.selected && this.selected.textbookLinks) || [];
      if (!links.length) return "";
      return links[0].book + " " + links[0].section + (links.length > 1 ? " 等 " + links.length + " 处" : "");
    },
    filteredTopics() {
      const q = this.query.trim().toLowerCase();
      return this.topics.filter((topic) => {
        if (this.group !== "all" && topic.group !== this.group) return false;
        if (this.filter === "ex" && !(exerciseCounts[topic.id] || {}).total) return false;
        if (this.filter === "lec" && !this.lectureOf(topic)) return false;
        if (this.filter === "todo") {
          const total = (exerciseCounts[topic.id] || {}).total || 0;
          if (!total) return false;
          const m = topicMastery(this.progress, topic.id, total);
          if (m.done >= m.total) return false;
        }
        if (!q) return true;
        const hay = [
          topic.title,
          topic.short,
          topic.summary,
          this.groupLabelOf(topic),
          ...(topic.points || []).map((p) => p.title + " " + p.desc),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    },
    navGroups() {
      return groupTopics(this.filteredTopics);
    },
    visibleTopics() {
      return this.navGroups.flatMap((g) => g.sections.flatMap((s) => s.items));
    },
    countByGroup() {
      const out = {};
      for (const t of this.topics) out[t.group] = (out[t.group] || 0) + 1;
      return out;
    },
    selectedExercises() {
      return this.selected ? exercisesByTopic[this.selected.id] || [] : [];
    },
    practiceGroups() {
      return ORIGIN_ORDER.map((origin) => ({
        origin,
        label: ORIGIN_LABEL[origin],
        items: this.selectedExercises.filter((ex) => ex.origin === origin),
      })).filter((g) => g.items.length);
    },
    overall() {
      return overallMastery(this.progress);
    },
    overallPercent() {
      return this.overall.total ? Math.round((this.overall.done / this.overall.total) * 100) : 0;
    },
    continueTopic() {
      const id = this.lastTopicId;
      if (!id || id === this.selectedId) return null;
      return this.topics.find((t) => t.id === id) || null;
    },
    prevTopic() {
      const i = topicPosition(this.selectedId);
      return i > 0 ? this.topics[i - 1] : null;
    },
    nextTopic() {
      const i = topicPosition(this.selectedId);
      return i >= 0 && i < this.topics.length - 1 ? this.topics[i + 1] : null;
    },
    lectureSectionsList() {
      return this.lectureCache[this.selectedId] || [];
    },
    tocItems() {
      const t = this.selected;
      if (!t) return [];
      const items = [];
      if ((t.forms || []).length || (t.contrasts || []).length) items.push({ anchor: "quick", label: "速用速查", level: "lv1" });
      if (t.lecture && !isCardTopic(t)) {
        items.push({ anchor: "lecture", label: "讲义精讲 · " + this.lectureSections + " 节", level: "lv1" });
        this.lectureSectionsList.forEach((sec, i) => {
          items.push({ anchor: "lecture-" + i, label: sec.heading, level: "lv2" });
        });
      }
      if ((t.points || []).length) items.push({ anchor: "points", label: "用法要点 · " + t.points.length, level: "lv1" });
      if ((t.pitfalls || []).length || (t.examTips || []).length) items.push({ anchor: "pitfalls", label: "易错与考法", level: "lv1" });
      if ((t.memoryCard || []).length || (t.textbookExamples || []).length) items.push({ anchor: "memory", label: "记忆卡与教材例句", level: "lv1" });
      if (!isCardTopic(t)) items.push({ anchor: "practice", label: "专项练习 · " + this.counts.total, level: "lv1" });
      return items;
    },
    sourceNote() {
      return [
        "北京中考真题 " + examExercises.length + " 道（" + examYears.join("、") + " 年单项填空，含官方答案与详解）",
        "外地中考真题 " + otherExamExercises.length + " 道（题面自带年份与地区）",
        "语篇原句改编 " + adaptedExercises.length + " 道（取自北京卷完形/阅读原句）",
        "专项练习 " + authoredOnly.length + " 道（真题未覆盖的语法点，按教材语法项目自编）",
      ];
    },
  },
  watch: {
    userId() {
      this.progress = loadGrammarProgress(this.userId);
      this.lastTopicId = loadLastTopicId(this.userId);
    },
    targetTopicId(id) {
      this.applyTarget(id);
    },
    selectedId(id) {
      this.ensureLecture(id);
      this.activeAnchor = "";
      this.spreadOpen = false;
      this.$nextTick(() => this.setupSpy());
      this.syncHash();
      // 换专题要重新上报，助教的“语法专题”状态才跟得上（契约 §5）。
      this.publishContext();
    },
  },
  methods: {
    // 把“正在看哪个语法专题”发布到学习上下文总线（契约 §5：grammarTopic）。
    publishContext() {
      const topic = this.selected;
      if (!topic) return;
      publishContext({
        view: "grammar",
        scene: "grammar",
        level: "middle",
        grammarTopic: topic.title || topic.id || "",
      });
    },
    speak,
    groupLabelOf(topic) {
      const g = this.groups.find((x) => x.key === (topic && topic.group));
      return g ? g.label : "";
    },
    lectureOf(topic) {
      return topic && topic.lecture && topic.lecture.sectionsTotal ? topic.lecture : null;
    },
    stars(n) {
      const v = Math.max(1, Math.min(5, Number(n) || 3));
      return "★".repeat(v) + "☆".repeat(5 - v);
    },
    stemLines(stem) {
      return String(stem || "").split("\n");
    },
    letter(i) {
      return letters[i] || String(i + 1);
    },
    originLabel(ex) {
      return ORIGIN_LABEL[ex.origin] || "专项练习";
    },
    masteryOf(topicId) {
      const total = (exercisesByTopic[topicId] || []).length;
      return topicMastery(this.progress, topicId, total);
    },
    /** 该专题的题量（0 表示只有讲义或内容建设中）。 */
    countsOf(topic) {
      return (exerciseCounts[topic.id] || {}).total || 0;
    },
    /** 导航条目右侧状态文案：区分"有题 / 仅讲义 / 待补讲义"，不再出现裸的 0 题。 */
    itemMeta(topic) {
      const total = (exerciseCounts[topic.id] || {}).total || 0;
      const lec = this.lectureOf(topic);
      if (!total && isCardTopic(topic)) return "知识卡 · " + ((topic.points || []).length) + " 个要点";
      if (!total) return lec ? "讲义 " + lec.sectionsTotal + " 节 · 仅讲义" : "内容建设中";
      if (!lec) return "真题 " + total + " 道 · 待补讲义";
      const m = this.masteryOf(topic.id);
      return total + " 题 · " + m.done + "/" + m.total;
    },
    stateClass(topic) {
      const total = (exerciseCounts[topic.id] || {}).total || 0;
      if (!total && isCardTopic(topic)) return "st-card";
      if (!total) return this.lectureOf(topic) ? "st-lecture" : "st-empty";
      if (!this.lectureOf(topic)) return "st-exonly";
      const m = this.masteryOf(topic.id);
      if (m.done >= m.total) return "st-done";
      return m.done > 0 ? "st-learning" : "st-new";
    },
    statusPercent(topic) {
      const m = this.masteryOf(topic.id);
      return m.total ? Math.round((m.done / m.total) * 100) : 0;
    },
    isClosed(key) {
      return !!this.collapsedGroups[key];
    },
    toggleGroup(key) {
      this.collapsedGroups = { ...this.collapsedGroups, [key]: !this.collapsedGroups[key] };
      try {
        localStorage.setItem(NAV_COLLAPSED_KEY, JSON.stringify(this.collapsedGroups));
      } catch (_) {}
    },
    isSectionOpen(index) {
      const v = this.lectureOpen[this.selectedId + ":" + index];
      return v === undefined ? index === 0 : !!v;
    },
    toggleSection(index) {
      const key = this.selectedId + ":" + index;
      this.lectureOpen = { ...this.lectureOpen, [key]: !this.isSectionOpen(index) };
    },
    allSectionsOpen() {
      return this.lectureSectionsList.every((_, i) => this.isSectionOpen(i));
    },
    toggleAllSections() {
      const next = !this.allSectionsOpen();
      const patch = {};
      this.lectureSectionsList.forEach((_, i) => {
        patch[this.selectedId + ":" + i] = next;
      });
      this.lectureOpen = { ...this.lectureOpen, ...patch };
    },
    selectTopic(id) {
      if (!this.topics.some((t) => t.id === id)) return;
      this.selectedId = id;
      this.lastTopicId = id;
      saveLastTopicId(this.userId, id);
      if (typeof window !== "undefined" && window.matchMedia("(max-width: 960px)").matches) {
        this.$nextTick(() => {
          const el = document.querySelector(".gr2-detail");
          if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    },
    applyTarget(id) {
      const resolved = resolveTopicId(id);
      if (resolved && this.topics.some((t) => t.id === resolved)) {
        this.selectedId = resolved;
        this.lastTopicId = resolved;
        saveLastTopicId(this.userId, resolved);
      }
    },
    /**
     * 选中专题时才拉取该专题的讲义正文（sections 占全量体积约 80%）。
     * 注意：loadLecture 会先往共享的 lecture 对象上原地写 sections，
     * 因此这里用组件自己的 lectureCache 保存结果——否则通过响应式代理
     * 再写同一个数组引用时 Vue 判定"值未变"，不触发更新（computed 会一直是空数组）。
     */
    ensureLecture(id) {
      const topic = this.topics.find((t) => t.id === id);
      const lecture = topic && topic.lecture;
      if (!lecture || this.lectureCache[id]) return;
      const state = this.lectureState[id];
      if (state && state.status === "loading") return;
      if (state && state.status === "ready") {
        this.adoptLectureSections(id);
        return;
      }
      if (!lecture.sectionsTotal) {
        this.lectureCache = { ...this.lectureCache, [id]: [] };
        this.lectureState = { ...this.lectureState, [id]: { status: "ready", error: "" } };
        return;
      }
      this.lectureState = { ...this.lectureState, [id]: { status: "loading", error: "" } };
      loadLecture(id).then(
        (sections) => {
          this.lectureCache = { ...this.lectureCache, [id]: sections || [] };
          this.lectureState = { ...this.lectureState, [id]: { status: "ready", error: "" } };
          this.$nextTick(() => this.setupSpy());
          if (this.pendingAnchor) this.$nextTick(() => this.revealAnchor(this.pendingAnchor));
        },
        (err) => {
          this.lectureState = {
            ...this.lectureState,
            [id]: { status: "error", error: (err && err.message) || String(err) },
          };
        },
      );
    },
    /** 讲义已被 loadLecture 写过（例如悬停预取），直接拿来用。 */
    adoptLectureSections(id) {
      const topic = this.topics.find((t) => t.id === id);
      const lecture = topic && topic.lecture;
      if (lecture && Array.isArray(lecture.sections) && !this.lectureCache[id]) {
        this.lectureCache = { ...this.lectureCache, [id]: lecture.sections.slice() };
      }
    },
    lectureStatus(id) {
      if (this.lectureCache[id]) return "ready";
      return (this.lectureState[id] && this.lectureState[id].status) || "";
    },
    lectureError(id) {
      return (this.lectureState[id] && this.lectureState[id].error) || "";
    },
    /** 悬停 160ms 再预取，避免鼠标扫过侧栏时把 30 个专题一次性全拉下来。 */
    hoverLecture(id) {
      if (this.hoverTimer) clearTimeout(this.hoverTimer);
      this.hoverTimer = setTimeout(() => {
        this.hoverTimer = 0;
        this.ensureLecture(id);
      }, 160);
    },
    cancelHoverLecture() {
      if (this.hoverTimer) clearTimeout(this.hoverTimer);
      this.hoverTimer = 0;
    },
    onNavKey(event) {
      if (event.key === "/" && event.target.tagName !== "INPUT") {
        event.preventDefault();
        this.$refs.search?.focus();
        return;
      }
      if (event.target.tagName === "INPUT" && event.key === "Escape") {
        event.target.blur();
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Enter") return;
      if (event.key === "Enter" && event.target.classList && event.target.classList.contains("gr2-item")) return;
      const list = this.visibleTopics;
      if (!list.length) return;
      event.preventDefault();
      const at = list.findIndex((t) => t.id === this.selectedId);
      const step = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
      const next = step === 0 ? list[Math.max(0, at)] || list[0] : list[Math.min(list.length - 1, Math.max(0, at + step))];
      if (next) this.selectTopic(next.id);
      this.$nextTick(() => {
        const el = document.querySelector(".gr2-item.on");
        if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
      });
    },
    jumpTo(anchor) {
      const el = document.getElementById(anchor);
      if (!el) return;
      this.activeAnchor = anchor;
      if (el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
      this.syncHash(anchor);
    },
    /**
     * 深链锚点：展开对应讲义节并滚动到位。
     * 返回 false 表示讲义正文还没到位（pendingAnchor 保留，加载完成后会再调一次）。
     */
    revealAnchor(anchor) {
      if (!anchor) return false;
      const m = /^lecture-(\d+)$/.exec(anchor);
      if (m) {
        const idx = Number(m[1]);
        if (!this.lectureSectionsList[idx]) return false;
        this.lectureOpen = { ...this.lectureOpen, [this.selectedId + ":" + idx]: true };
      }
      this.pendingAnchor = "";
      this.$nextTick(() => {
        const el = document.getElementById(anchor);
        if (!el) return;
        // 地址栏已经指到这一节，用瞬间跳转（redesign.css 里 html{scroll-behavior:smooth} 会把 auto 变成动画）
        const root = document.documentElement;
        const prev = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        if (el.scrollIntoView) el.scrollIntoView({ behavior: "auto", block: "start" });
        root.style.scrollBehavior = prev;
        this.activeAnchor = anchor;
      });
      return true;
    },
    /**
     * hash 后缀：显式 anchor 优先；否则沿用地址栏里同一专题的锚点
     * （深链刷新后点专题内其它位置，不会把 /lecture-3 抹掉）。
     */
    hashSuffix(anchor = "") {
      if (anchor && anchor.indexOf("lecture-") === 0) return "/" + anchor;
      const hash = (typeof window !== "undefined" && window.location && window.location.hash) || "";
      const cur = /^#grammar\/([^/]+)(?:\/([^/]+))?$/.exec(hash);
      if (cur && cur[1] === this.selectedId && cur[2]) return "/" + cur[2];
      return "";
    },
    /** 把当前专题（和锚点）写回地址栏，刷新/分享后仍能回到同一位置。 */
    syncHash(anchor = "") {
      if (typeof window === "undefined" || !window.history || !this.selectedId) return;
      const next = "#grammar/" + this.selectedId + this.hashSuffix(anchor);
      if (window.location.hash !== next) window.history.replaceState(null, "", next);
    },
    setupSpy() {
      if (this.spy) {
        this.spy.disconnect();
        this.spy = null;
      }
      if (typeof IntersectionObserver === "undefined") return;
      const nodes = [...document.querySelectorAll(".gr2-detail [data-anchor]")];
      if (!nodes.length) return;
      // 判定带里的锚点：只记"全量状态"，再取最内层那个。
      // 原因：讲义精讲整块（#lecture）包含 13 个分节（#lecture-N），
      // 两层会同时落在判定带里；按 top 取最靠上的会永远命中外层容器，
      // 页内目录就永远高亮"讲义精讲"而指不到具体某一节。
      const inside = new Set();
      const pick = () => {
        const hits = nodes.filter((n) => inside.has(n));
        const leaf = hits.filter((n) => !hits.some((o) => o !== n && n.contains(o)));
        const target = leaf.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
        if (target) this.activeAnchor = target.id;
      };
      this.spy = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) inside.add(e.target);
            else inside.delete(e.target);
          }
          pick();
        },
        { rootMargin: "-12% 0px -72% 0px", threshold: 0 },
      );
      nodes.forEach((n) => this.spy.observe(n));
    },
    pickKey(ex) {
      return ex.topicId + ":" + ex.id;
    },
    pickedOption(ex) {
      return this.picked[this.pickKey(ex)] || "";
    },
    isAnswered(ex) {
      return !!this.picked[this.pickKey(ex)];
    },
    answer(ex, option) {
      if (this.isAnswered(ex)) return;
      this.picked = { ...this.picked, [this.pickKey(ex)]: option };
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
    optionClass(ex, option) {
      if (!this.isAnswered(ex)) return "";
      if (option === ex.answer) return "correct";
      if (option === this.pickedOption(ex)) return "wrong";
      return "muted";
    },
  },
  created() {
    this.progress = loadGrammarProgress(this.userId);
    this.lastTopicId = loadLastTopicId(this.userId);
    try {
      this.collapsedGroups = JSON.parse(localStorage.getItem(NAV_COLLAPSED_KEY) || "{}") || {};
    } catch (_) {
      this.collapsedGroups = {};
    }
    if (this.targetTopicId) this.applyTarget(this.targetTopicId);
    // 深链：/#grammar/<topicId>/<anchor>（刷新或分享后回到同一节）
    if (typeof window !== "undefined" && window.location && window.location.hash) {
      const deep = /^#grammar\/([^/]+)(?:\/([^/]+))?$/.exec(window.location.hash);
      if (deep && deep[2]) this.pendingAnchor = deep[2];
    }
    this.ensureLecture(this.selectedId);
    this.publishContext();
    if (this.pendingAnchor) this.$nextTick(() => this.revealAnchor(this.pendingAnchor));
  },
  mounted() {
    this.setupSpy();
  },
  beforeUnmount() {
    if (this.hoverTimer) clearTimeout(this.hoverTimer);
    if (this.spy) this.spy.disconnect();
  },
  template: `
    <div class="grammar-page gr2-page">
      <p class="gr2-eyebrow">外研社初中英语 · 语法专题</p>

      <header v-if="selected" class="gr2-head">
        <div class="gr2-head-main">
          <nav class="gr2-crumb" aria-label="面包屑">
            <button type="button" @click="group = 'all'">语法专题</button>
            <span>/</span><b>{{ groupOfSelected }}</b>
            <span>/</span><span>{{ selected.title }}</span>
          </nav>
          <div class="gr2-title-row">
            <h1>{{ selected.title }}</h1>
            <span v-if="selected.spreadNote" class="gr2-info-wrap">
              <button
                type="button"
                class="gr2-info"
                :class="{ on: spreadOpen }"
                :aria-expanded="spreadOpen ? 'true' : 'false'"
                aria-label="教材与考查说明"
                :title="selected.spreadNote"
                @click="spreadOpen = !spreadOpen"
              >ⓘ</button>
              <span v-if="spreadOpen" class="gr2-pop">{{ selected.spreadNote }}</span>
            </span>
            <span class="gr2-chip">难度 {{ stars(selected.difficulty) }}</span>
            <span v-if="examWeight" class="gr2-chip hot">近 5 年考 {{ examWeight }} 次</span>
            <span class="gr2-chip is-state">{{ selectedState.label }}</span>
          </div>
          <p class="gr2-sum">{{ selected.summary }}</p>
          <div v-if="isCardSelected" class="gr2-metrics">
            <div><b>{{ (selected.points || []).length }}</b><span>用法要点</span></div>
            <div><b>{{ cardExampleCount }}</b><span>正误例句</span></div>
            <div><b>{{ (selected.pitfalls || []).length }}</b><span>易错提醒</span></div>
            <div><b>{{ (selected.memoryCard || []).length }}</b><span>记忆卡</span></div>
          </div>
          <div v-else class="gr2-metrics">
            <div><b>{{ lectureSections }}</b><span>讲义节数</span></div>
            <div><b>{{ counts.total }}</b><span>练习题（北京 {{ counts.exam }}）</span></div>
            <div><b>{{ selectedMastery.done }}/{{ selectedMastery.total || counts.total }}</b><span>已掌握</span></div>
            <div v-if="textbookLabel"><b>{{ textbookLabel }}</b><span>对应教材</span></div>
          </div>
        </div>
        <div class="gr2-head-actions">
          <button v-if="!isCardSelected" type="button" class="gr2-btn primary" :disabled="!counts.total" @click="jumpTo('practice')">
            {{ counts.total ? "开始练习" : "暂无练习题" }}
          </button>
          <button v-if="!isCardSelected" type="button" class="gr2-btn ghost" :aria-expanded="noteOpen ? 'true' : 'false'" @click="noteOpen = !noteOpen">
            题目来源与说明
          </button>
          <div class="gr2-mini" role="status">
            <span class="gr2-mini-label">总进度</span>
            <b>{{ overall.done }}/{{ overall.total }}</b>
            <i :style="{ width: overallPercent + '%' }"></i>
          </div>
        </div>
      </header>

      <section v-if="noteOpen" class="gr2-note">
        <b>题库说明</b>
        <ul>
          <li v-for="(line, li) in sourceNote" :key="li">{{ line }}</li>
        </ul>
        <p>每道题上方均标注来源类型；讲义正文来自教材扫描件的逐条整理。</p>
        <button type="button" class="gr2-btn tiny" @click="noteOpen = false">收起</button>
      </section>
      <div class="gr2-layout">
        <aside class="gr2-nav" aria-label="专题列表" tabindex="0" @keydown="onNavKey">
          <div class="gr2-nav-head">
            <div class="gr2-cats" role="tablist" aria-label="语法分类">
              <button type="button" :class="{ on: group === 'all' }" @click="group = 'all'">
                全部 <small>{{ topics.length }}</small>
              </button>
              <button
                v-for="g in groups"
                :key="g.key"
                type="button"
                :class="{ on: group === g.key }"
                @click="group = g.key"
              >
                {{ g.label }} <small>{{ countByGroup[g.key] || 0 }}</small>
              </button>
            </div>
            <div class="gr2-tools">
              <input ref="search" v-model="query" type="search" placeholder="搜索专题 / 知识点" aria-label="搜索语法专题" />
              <select v-model="filter" aria-label="筛选专题">
                <option value="all">全部</option>
                <option value="ex">有真题</option>
                <option value="lec">有讲义</option>
                <option value="todo">未掌握</option>
              </select>
            </div>
          </div>

          <div class="gr2-nav-list">
            <section v-for="g in navGroups" :key="g.key" class="gr2-group">
              <header @click="toggleGroup(g.key)">
                <i :class="{ closed: isClosed(g.key) }">▾</i>
                <span>{{ g.label }}</span>
                <em>{{ g.count }}</em>
              </header>
              <div v-show="!isClosed(g.key)" class="gr2-group-body">
                <template v-for="(sec, si) in g.sections">
                  <div v-if="sec.sub" :key="'sub-' + g.key + si" class="gr2-sub">{{ sec.sub }}</div>
                  <button
                    v-for="topic in sec.items"
                    :key="topic.id"
                    type="button"
                    class="gr2-item"
                    :class="[stateClass(topic), { on: topic.id === selectedId }]"
                    :data-topic-id="topic.id"
                    :aria-current="topic.id === selectedId ? 'true' : 'false'"
                    @click="selectTopic(topic.id)"
                    @mouseenter="hoverLecture(topic.id)"
                    @mouseleave="cancelHoverLecture"
                    @focus="ensureLecture(topic.id)"
                  >
                    <span v-if="statusPercent(topic) && countsOf(topic)" class="gr2-ring" :style="{ '--p': statusPercent(topic) + '%' }"></span>
                    <span class="gr2-item-name">{{ topic.title }}</span>
                    <span class="gr2-item-meta">{{ itemMeta(topic) }}</span>
                  </button>
                </template>
              </div>
            </section>
            <p v-if="!navGroups.length" class="gr2-empty">没有匹配的专题</p>
          </div>

          <div v-if="continueTopic" class="gr2-nav-foot">
            <div>
              <b>继续上次</b>
              <small>{{ continueTopic.title }} · {{ itemMeta(continueTopic) }}</small>
            </div>
            <button type="button" class="gr2-btn tiny" @click="selectTopic(continueTopic.id)">继续 →</button>
          </div>
        </aside>

        <main v-if="selected" class="gr2-detail">
          <section v-if="(selected.forms && selected.forms.length) || (selected.contrasts && selected.contrasts.length)" id="quick" data-anchor class="gr2-block">
            <h2><span class="gr2-dot"></span>速用速查<em>先看公式与对照表，3 分钟复习</em></h2>
            <div v-if="selected.forms && selected.forms.length" class="gr2-forms">
              <div v-for="(form, fi) in selected.forms" :key="fi" class="gr2-form">
                <b>{{ form.name }}</b>
                <code>{{ form.pattern }}</code>
                <small v-if="form.note">{{ form.note }}</small>
              </div>
            </div>
            <div v-for="(c, ci) in selected.contrasts || []" :key="'c' + ci" class="gr2-contrast">
              <h3>{{ c.title }}</h3>
              <div class="gr2-table-wrap">
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
            </div>
          </section>

          <section v-if="!isCardSelected" id="lecture" data-anchor class="gr2-block">
            <h2>
              <span class="gr2-dot"></span>讲义精讲
              <em v-if="selected.lecture">{{ lectureSourceLabel }} · 共 {{ lectureSections }} 节</em>
              <em v-else>待补</em>
              <button v-if="selected.lecture && lectureSections" type="button" class="gr2-btn tiny" @click="toggleAllSections">
                {{ allSectionsOpen() ? "收起全部" : "展开全部" }}
              </button>
            </h2>
            <template v-if="selected.lecture">
              <p v-if="selected.lecture.intro" class="gr2-lec-intro">{{ selected.lecture.intro }}</p>
              <p v-if="lectureStatus(selected.id) === 'loading'" class="gr2-hint">
                讲义正文加载中…（共 {{ selected.lecture.sectionsTotal }} 节）
              </p>
              <p v-else-if="lectureStatus(selected.id) === 'error'" class="gr2-hint error">
                讲义正文加载失败（{{ lectureError(selected.id) }}）。
                <button type="button" class="gr2-btn tiny" @click="ensureLecture(selected.id)">重试</button>
              </p>
              <article
                v-for="(sec, si) in lectureSectionsList"
                :key="si"
                :id="'lecture-' + si"
                data-anchor
                class="gr2-lec"
                :class="{ open: isSectionOpen(si) }"
              >
                <header @click="toggleSection(si)">
                  <i>▸</i>
                  <h3>{{ sec.heading }}</h3>
                  <span class="gr2-lec-no">第 {{ si + 1 }} 节</span>
                </header>
                <div v-show="isSectionOpen(si)" class="gr2-lec-body">
                  <template v-for="(blk, bi) in sec.blocks" :key="bi">
                    <p v-if="blk.type === 'text'" class="gr2-lec-text">{{ blk.text }}</p>
                    <ul v-else-if="blk.type === 'list'" class="gr2-lec-list">
                      <li v-for="(it, ii) in blk.items" :key="ii">{{ it }}</li>
                    </ul>
                    <div v-else-if="blk.type === 'table'" class="gr2-table-wrap">
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
                    <ul v-else-if="blk.type === 'examples'" class="gr2-lec-ex">
                      <li v-for="(ex, ei) in blk.items" :key="ei" @click="speak(ex.en)">
                        <span class="gr2-en">{{ ex.en }}</span>
                        <span class="gr2-zh">{{ ex.zh }}</span>
                      </li>
                    </ul>
                    <p v-else-if="blk.type === 'tip'" class="gr2-lec-tip"><b>提示</b>{{ blk.text }}</p>
                    <p v-else-if="blk.type === 'pitfall'" class="gr2-lec-pitfall"><b>易错</b>{{ blk.text }}</p>
                  </template>
                </div>
              </article>
            </template>
            <p v-else class="gr2-hint">
              这个专题的教材讲义还在整理中。先看下面的速查卡与真题，讲义补上后会自动出现在这里。
            </p>
          </section>
          <section v-if="selected.points && selected.points.length" id="points" data-anchor class="gr2-block">
            <h2><span class="gr2-dot"></span>用法要点<em>{{ selected.points.length }} 条</em></h2>
            <div class="gr2-points">
              <article v-for="(point, pi) in selected.points" :key="pi" class="gr2-point">
                <h3>{{ point.title }}</h3>
                <p v-if="point.desc" class="gr2-point-desc">{{ point.desc }}</p>
                <ul class="gr2-examples">
                  <li v-for="(ex, ei) in point.good || []" :key="'g' + ei" class="good" @click="speak(ex)">
                    <span class="gr2-ico ok">✓</span>{{ ex }}
                  </li>
                  <li v-for="(ex, ei) in point.bad || []" :key="'b' + ei" class="bad">
                    <span class="gr2-ico no">✕</span>{{ ex }}
                  </li>
                </ul>
              </article>
            </div>
          </section>

          <section v-if="(selected.pitfalls && selected.pitfalls.length) || (selected.examTips && selected.examTips.length)" id="pitfalls" data-anchor class="gr2-block">
            <h2><span class="gr2-dot"></span>易错与考法<em>把这几个坑记住，再去刷题</em></h2>
            <div class="gr2-two">
              <div v-if="selected.pitfalls && selected.pitfalls.length" class="gr2-card warn">
                <b>易错点</b>
                <ul>
                  <li v-for="(p, pi) in selected.pitfalls" :key="pi">{{ p }}</li>
                </ul>
              </div>
              <div v-if="selected.examTips && selected.examTips.length" class="gr2-card info">
                <b>中考提示</b>
                <ul>
                  <li v-for="(t, ti) in selected.examTips" :key="ti">{{ t }}</li>
                </ul>
              </div>
            </div>
          </section>

          <section v-if="(selected.memoryCard && selected.memoryCard.length) || (selected.textbookExamples && selected.textbookExamples.length)" id="memory" data-anchor class="gr2-block">
            <h2><span class="gr2-dot"></span>记忆卡与教材例句<em>考前速记</em></h2>
            <div v-if="selected.memoryCard && selected.memoryCard.length" class="gr2-memory">
              <span v-for="(m, mi) in selected.memoryCard" :key="mi">{{ m }}</span>
            </div>
            <ul v-if="selected.textbookExamples && selected.textbookExamples.length" class="gr2-tb">
              <li v-for="(ex, ei) in selected.textbookExamples" :key="ei" @click="speak(ex.en)">
                <span class="gr2-en">{{ ex.en }}</span>
                <span class="gr2-zh">{{ ex.zh }}</span>
                <span class="gr2-src">{{ ex.source }}</span>
              </li>
            </ul>
          </section>

          <section v-if="!isCardSelected" id="practice" data-anchor class="gr2-block">
            <h2>
              <span class="gr2-dot"></span>专项练习
              <em v-if="counts.total">共 {{ counts.total }} 题 · 已答 {{ selectedMastery.done }}/{{ selectedMastery.total }}</em>
              <em v-else>暂无题目</em>
              <button v-if="selectedMastery.done" type="button" class="gr2-btn tiny" @click="resetTopic">重做本专题</button>
            </h2>
            <template v-if="counts.total">
              <div v-for="pg in practiceGroups" :key="pg.origin" class="gr2-qgroup">
                <div class="gr2-qgroup-head"><b>{{ pg.label }}</b><span>{{ pg.items.length }} 题</span></div>
                <article v-for="ex in pg.items" :key="ex.id" class="gr2-question">
                  <div class="gr2-q-head">
                    <span class="gr2-q-no">第 {{ selectedExercises.indexOf(ex) + 1 }} 题</span>
                    <span class="gr2-q-src">{{ ex.sourceLabel }}</span>
                    <span v-if="ex.point" class="gr2-q-point">考点：{{ ex.point }}</span>
                  </div>
                  <p class="gr2-q-stem">
                    <template v-for="(line, li) in stemLines(ex.stem)" :key="li">
                      {{ line }}<br v-if="li < stemLines(ex.stem).length - 1" />
                    </template>
                  </p>
                  <div class="gr2-options">
                    <button
                      v-for="(opt, oi) in ex.options"
                      :key="oi"
                      type="button"
                      class="gr2-option"
                      :class="optionClass(ex, letter(oi))"
                      :disabled="isAnswered(ex)"
                      @click="answer(ex, letter(oi))"
                    >
                      <span class="gr2-opt-letter">{{ letter(oi) }}</span>
                      <span class="gr2-opt-text">{{ opt }}</span>
                    </button>
                  </div>
                  <div v-if="isAnswered(ex)" class="gr2-feedback" :class="pickedOption(ex) === ex.answer ? 'right' : 'wrong'">
                    <div class="gr2-answer-line">
                      <b>{{ pickedOption(ex) === ex.answer ? "回答正确" : "回答错误" }}</b>
                      <span>正确答案：{{ ex.answer }}</span>
                    </div>
                    <p class="gr2-explanation">{{ ex.explanation }}</p>
                    <p v-if="ex.source && ex.source.answerSource" class="gr2-answer-source">答案来源：{{ ex.source.answerSource }}</p>
                    <p v-else-if="ex.source && ex.source.original" class="gr2-answer-source">
                      原句（{{ ex.source.year }} 年 · {{ ex.source.section }}）：{{ ex.source.original }}
                      <br />{{ ex.source.note }}
                    </p>
                    <p v-else-if="ex.source && ex.source.note" class="gr2-answer-source">
                      {{ ex.source.note }}<br />题目汇编来源：{{ ex.source.compiledFrom }}
                    </p>
                  </div>
                </article>
              </div>
            </template>
            <p v-else class="gr2-hint">
              这个专题的真题还在整理中。建议先看讲义与速查卡，题目补上后会自动出现在这里。
            </p>
          </section>

          <nav class="gr2-foot-nav" aria-label="专题翻页">
            <button v-if="prevTopic" type="button" @click="selectTopic(prevTopic.id)">← {{ prevTopic.title }}</button>
            <span v-else></span>
            <button v-if="nextTopic" type="button" @click="selectTopic(nextTopic.id)">{{ nextTopic.title }} →</button>
          </nav>
        </main>

        <aside v-if="tocItems.length" class="gr2-toc" aria-label="本节目录">
          <h4>本节目录</h4>
          <a
            v-for="it in tocItems"
            :key="it.anchor"
            :href="'#' + it.anchor"
            :class="[it.level, { on: activeAnchor === it.anchor }]"
            :data-toc="it.anchor"
            @click.prevent="jumpTo(it.anchor)"
          >{{ it.label }}</a>
        </aside>
      </div>
    </div>
  `,
};
