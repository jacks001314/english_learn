import { api } from "../api.js";

export default {
  props: {
    userId: { type: [String, Number], default: "anonymous" },
  },
  emits: ["session-state"],
  data: () => ({
    papers: [],
    attempts: [],
    paper: null,
    answers: {},
    startedAt: "",
    remaining: 0,
    timer: null,
    submitting: false,
    result: null,
    error: "",
    view: "library",
    resumableDraft: null,
    lastSavedAt: "",
  }),
  computed: {
    draftStorageKey() {
      return `english-learn-exam-draft-v1:${this.userId || "anonymous"}`;
    },
    allQuestions() {
      return this.paper?.sections?.flatMap((section) => section.questions || []) || [];
    },
    answeredCount() {
      return this.allQuestions.filter((question) => this.isAnswered(question.id)).length;
    },
    unansweredCount() {
      return Math.max(0, this.allQuestions.length - this.answeredCount);
    },
    draftAnsweredCount() {
      return Object.values(this.resumableDraft?.answers || {}).filter(
        (value) => value !== "" && value != null,
      ).length;
    },
  },
  watch: {
    answers: {
      deep: true,
      handler() {
        if (this.view === "exam" && this.paper) this.persistDraft();
      },
    },
    userId() {
      this.loadDraft();
    },
  },
  mounted() {
    this.loadDraft();
    this.load();
    window.addEventListener("beforeunload", this.handleBeforeUnload);
  },
  beforeUnmount() {
    if (this.view === "exam") this.persistDraft();
    clearInterval(this.timer);
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
    this.$emit("session-state", false);
  },
  methods: {
    async load() {
      try {
        const [papers, attempts] = await Promise.all([
          api("/api/exams"),
          api("/api/exams/attempts"),
        ]);
        this.papers = papers.items || [];
        this.attempts = attempts.items || [];
      } catch (error) {
        this.error = error.message;
      }
    },
    loadDraft() {
      this.resumableDraft = null;
      try {
        const draft = JSON.parse(localStorage.getItem(this.draftStorageKey) || "null");
        if (
          draft?.paperId &&
          draft?.startedAt &&
          draft.answers &&
          typeof draft.answers === "object"
        ) {
          this.resumableDraft = draft;
        }
      } catch (_) {
        localStorage.removeItem(this.draftStorageKey);
      }
    },
    persistDraft() {
      if (this.view !== "exam" || !this.paper?.id || !this.startedAt) return;
      const savedAt = new Date().toISOString();
      const draft = {
        paperId: this.paper.id,
        paperTitle: this.paper.title,
        answers: { ...this.answers },
        startedAt: this.startedAt,
        durationSeconds: (this.paper.durationMinutes || 90) * 60,
        savedAt,
      };
      localStorage.setItem(this.draftStorageKey, JSON.stringify(draft));
      this.resumableDraft = draft;
      this.lastSavedAt = savedAt;
    },
    handleBeforeUnload() {
      if (this.view === "exam") this.persistDraft();
    },
    clearDraft() {
      localStorage.removeItem(this.draftStorageKey);
      this.resumableDraft = null;
      this.lastSavedAt = "";
    },
    async start(item) {
      if (!item.sections?.length && item.attachmentUrl) {
        window.open(item.attachmentUrl, "_blank", "noopener");
        return;
      }
      if (
        this.resumableDraft &&
        !confirm("已有一份未完成的考试记录。开始新考试将覆盖该记录，确定继续吗？")
      ) {
        return;
      }
      this.clearDraft();
      await this.openExam(item.id, {
        answers: {},
        startedAt: new Date().toISOString(),
      });
    },
    async resumeDraft() {
      if (!this.resumableDraft) return;
      const draft = this.resumableDraft;
      await this.openExam(draft.paperId, {
        answers: { ...draft.answers },
        startedAt: draft.startedAt,
        durationSeconds: draft.durationSeconds,
      });
    },
    async openExam(paperId, state) {
      try {
        this.error = "";
        this.result = null;
        this.paper = await api(`/api/exams/${paperId}`);
        this.answers = state.answers || {};
        this.startedAt = state.startedAt || new Date().toISOString();
        const durationSeconds =
          state.durationSeconds || (this.paper.durationMinutes || 90) * 60;
        const elapsedSeconds = Math.max(
          0,
          Math.floor((Date.now() - new Date(this.startedAt).getTime()) / 1000),
        );
        this.remaining = Math.max(0, durationSeconds - elapsedSeconds);
        this.view = "exam";
        this.$emit("session-state", true);
        this.persistDraft();
        this.$nextTick(() => window.scrollTo({ top: 0, behavior: "smooth" }));
        if (this.remaining <= 0) {
          await this.submit(true);
        } else {
          this.startTimer();
        }
      } catch (error) {
        this.error = error.message;
        this.paper = null;
        this.view = "library";
        this.$emit("session-state", false);
      }
    },
    discardDraft() {
      if (!confirm("确定放弃这份未完成的考试记录吗？已作答内容将被清除。")) return;
      this.clearDraft();
    },
    formatTime() {
      const minutes = Math.max(0, Math.floor(this.remaining / 60));
      const seconds = Math.max(0, this.remaining % 60);
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    },
    formatSavedAt(value) {
      if (!value) return "刚刚";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "刚刚";
      return date.toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    isAnswered(questionId) {
      const value = this.answers[questionId];
      return value !== "" && value != null;
    },
    questionNumber(questionId) {
      return this.allQuestions.findIndex((question) => question.id === questionId) + 1;
    },
    goQuestion(questionId) {
      document.getElementById(`exam-question-${questionId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    },
    async submit(force = false) {
      if (this.result || this.submitting || !this.paper) return;
      if (!force) {
        const message = this.unansweredCount
          ? `还有 ${this.unansweredCount} 题未作答，确定交卷吗？`
          : "题目已经全部作答，确定交卷吗？";
        if (!confirm(message)) return;
      }
      this.submitting = true;
      this.error = "";
      clearInterval(this.timer);
      try {
        this.result = await api("/api/exams/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paperId: this.paper.id,
            answers: this.answers,
            startedAt: this.startedAt,
          }),
        });
        this.clearDraft();
        this.view = "result";
        this.$emit("session-state", false);
        await this.load();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        this.error = error.message;
        if (this.remaining > 0) this.startTimer();
      } finally {
        this.submitting = false;
      }
    },
    startTimer() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.remaining = Math.max(0, this.remaining - 1);
        if (this.remaining > 0 && this.remaining % 10 === 0) this.persistDraft();
        if (this.remaining <= 0) {
          clearInterval(this.timer);
          this.submit(true);
        }
      }, 1000);
    },
    back() {
      if (
        this.view === "exam" &&
        !confirm("当前答案已自动保存，可以稍后继续。确定退出考试吗？")
      ) {
        return;
      }
      if (this.view === "exam") this.persistDraft();
      clearInterval(this.timer);
      this.view = "library";
      this.paper = null;
      this.result = null;
      this.$emit("session-state", false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  },
  template: `
    <section class="exam-view">
      <div v-if="error" class="error-banner">
        {{ error }}
        <button @click="error=''">关闭</button>
      </div>

      <template v-if="view==='library'">
        <div class="exam-hero">
          <div>
            <span>BEIJING HIGH SCHOOL ENTRANCE EXAM</span>
            <h2>北京中考英语试题库</h2>
            <p>限时作答，自动评判，逐题分析。</p>
          </div>
          <div><b>{{ papers.length }}</b><small>套试卷</small></div>
        </div>

        <section v-if="resumableDraft" class="exam-resume">
          <div class="exam-resume-icon">续</div>
          <div>
            <span>未完成的考试</span>
            <h3>{{ resumableDraft.paperTitle }}</h3>
            <p>已答 {{ draftAnsweredCount }} 题 · {{ formatSavedAt(resumableDraft.savedAt) }} 自动保存</p>
          </div>
          <button class="exam-discard" @click="discardDraft">放弃记录</button>
          <button class="primary" @click="resumeDraft">继续考试</button>
        </section>

        <div class="exam-library">
          <main>
            <h3>可用试卷</h3>
            <div class="paper-grid">
              <article v-for="item in papers" :key="item.id">
                <em>{{ item.year || '模拟' }}</em>
                <h3>{{ item.title }}</h3>
                <p>{{ item.region }} · {{ item.durationMinutes }} 分钟 · {{ item.totalScore }} 分</p>
                <small>{{ item.sourceType==='official' ? '官方公开' : '功能样卷' }} · {{ item.sourceOrganization || '平台原创' }}</small>
                <button class="primary" @click="start(item)">开始考试</button>
              </article>
              <p v-if="!papers.length" class="empty">管理员尚未发布试卷。</p>
            </div>
          </main>
          <aside class="attempt-history">
            <h3>考试记录</h3>
            <div v-for="item in attempts" :key="item.id">
              <b>{{ item.score }} / {{ item.totalScore }}</b>
              <span>{{ item.paperTitle }}</span>
              <small>{{ item.submittedAt.slice(0,10) }} · 正确率 {{ item.accuracy }}%</small>
            </div>
            <p v-if="!attempts.length" class="empty">还没有考试记录</p>
          </aside>
        </div>
      </template>

      <template v-else-if="view==='exam'">
        <div class="exam-toolbar">
          <button @click="back">← 退出</button>
          <div class="exam-toolbar-copy">
            <b>{{ paper.title }}</b>
            <span>已答 {{ answeredCount }}/{{ allQuestions.length }}</span>
          </div>
          <span class="exam-save-state">自动保存<span v-if="lastSavedAt"> · {{ formatSavedAt(lastSavedAt) }}</span></span>
          <strong :class="{'is-urgent':remaining<=300}">{{ formatTime() }}</strong>
          <button class="primary" :disabled="submitting" @click="submit(false)">{{ submitting ? '正在交卷…' : '交卷' }}</button>
        </div>

        <div class="exam-session-layout">
          <div class="exam-paper">
            <header>
              <h1>{{ paper.title }}</h1>
              <p>{{ paper.instructions }}</p>
            </header>
            <section v-for="section in paper.sections" :key="section.id" class="exam-section">
              <h2>{{ section.title }}</h2>
              <p>{{ section.instructions }}</p>
              <article
                v-for="q in section.questions"
                :id="'exam-question-'+q.id"
                :key="q.id"
                class="exam-question"
              >
                <div class="question-head">
                  <b>{{ questionNumber(q.id) }}.</b>
                  <span>{{ q.score }} 分</span>
                </div>
                <div v-if="q.passage" class="question-passage">{{ q.passage }}</div>
                <p>{{ q.prompt }}</p>
                <div v-if="q.type==='choice'||q.type==='single'" class="exam-options">
                  <label v-for="(option,index) in q.options" :key="index">
                    <input
                      v-model="answers[q.id]"
                      type="radio"
                      :name="q.id"
                      :value="String.fromCharCode(65+index)"
                    >
                    <b>{{ String.fromCharCode(65+index) }}.</b>{{ option }}
                  </label>
                </div>
                <textarea
                  v-else-if="q.type==='writing'||q.type==='essay'||q.type==='subjective'"
                  v-model="answers[q.id]"
                  rows="8"
                  placeholder="在此输入答案"
                ></textarea>
                <input v-else v-model="answers[q.id]" placeholder="请输入答案">
              </article>
            </section>
          </div>

          <aside class="exam-question-nav">
            <span>答题卡</span>
            <div class="exam-question-summary">
              <b>{{ answeredCount }}</b>
              <small>/ {{ allQuestions.length }} 已作答</small>
            </div>
            <div class="exam-question-grid">
              <button
                v-for="(question,index) in allQuestions"
                :key="question.id"
                :class="{answered:isAnswered(question.id)}"
                :title="isAnswered(question.id) ? '第 '+(index+1)+' 题，已作答' : '第 '+(index+1)+' 题，未作答'"
                @click="goQuestion(question.id)"
              >{{ index+1 }}</button>
            </div>
            <div class="exam-nav-legend"><i></i>已作答 <i></i>未作答</div>
            <p>答案会自动保存在当前电脑</p>
          </aside>
        </div>
      </template>

      <template v-else>
        <div class="result-hero">
          <button @click="back">← 返回题库</button>
          <div>
            <span>本次成绩</span>
            <b>{{ result.score }}<small>/{{ result.totalScore }}</small></b>
            <p>客观题正确率 {{ result.accuracy }}% · 用时 {{ Math.ceil(result.durationSeconds/60) }} 分钟</p>
          </div>
        </div>
        <div class="result-list">
          <article v-for="(item,index) in result.results" :key="item.questionId" :class="{correct:item.correct}">
            <b>第 {{ index+1 }} 题 · {{ item.score }}/{{ item.maxScore }} 分</b>
            <p>你的答案：{{ item.answer || '未作答' }}</p>
            <p>参考答案：{{ item.expected }}</p>
            <small>{{ item.explanation }}</small>
          </article>
        </div>
      </template>
    </section>
  `,
};
