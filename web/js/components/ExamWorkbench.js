import { api } from "../api.js";

const clone = (value) => JSON.parse(JSON.stringify(value));
const currentYear = new Date().getFullYear();
const choiceTypes = new Set(["choice", "single"]);

const emptyQuestion = (type = "choice") => ({
  id: "",
  type,
  prompt: "",
  passage: "",
  options: choiceTypes.has(type) ? ["", "", "", ""] : [],
  answer: choiceTypes.has(type) ? "A" : "",
  explanation: "",
  score: 2,
  tags: [],
});

const emptySection = (index = 0) => ({
  id: "",
  title: `第 ${index + 1} 部分`,
  type: "choice",
  instructions: "",
  questions: [emptyQuestion()],
});

const emptyPaper = () => ({
  id: "",
  title: "",
  year: currentYear,
  region: "北京市",
  subject: "英语",
  durationMinutes: 90,
  totalScore: 0,
  status: "draft",
  sourceType: "original",
  sourceOrganization: "平台原创",
  sourceUrl: "",
  attachmentUrl: "",
  copyrightNote: "",
  instructions: "请按题目要求作答。考试结束前请检查答案。",
  sections: [emptySection()],
});

const normalizePaper = (paper) => {
  const item = { ...emptyPaper(), ...clone(paper || {}) };
  item.sections = (item.sections || []).map((section, sectionIndex) => ({
    ...emptySection(sectionIndex),
    ...section,
    questions: (section.questions || []).map((question) => {
      const normalized = { ...emptyQuestion(question.type), ...question };
      normalized.options = Array.isArray(normalized.options) ? normalized.options : [];
      normalized.tags = Array.isArray(normalized.tags) ? normalized.tags : [];
      return normalized;
    }),
  }));
  return item;
};

export default {
  data: () => ({
    papers: [],
    selected: null,
    persisted: false,
    query: "",
    statusFilter: "all",
    busy: false,
    loading: false,
    error: "",
    message: "",
    mode: "edit",
    savedSnapshot: "",
    importOpen: false,
    importText: "",
    importItems: [],
    importError: "",
    importReport: null,
  }),
  computed: {
    filteredPapers() {
      const query = this.query.trim().toLowerCase();
      return this.papers.filter((paper) => {
        if (this.statusFilter !== "all" && paper.status !== this.statusFilter) return false;
        if (!query) return true;
        return [paper.title, paper.id, paper.region, paper.sourceOrganization]
          .some((value) => String(value || "").toLowerCase().includes(query));
      });
    },
    publishedCount() {
      return this.papers.filter((paper) => paper.status === "published").length;
    },
    draftCount() {
      return this.papers.filter((paper) => paper.status !== "published").length;
    },
    questionCount() {
      return this.selected?.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0;
    },
    calculatedScore() {
      return this.selected?.sections?.reduce(
        (total, section) => total + (section.questions || []).reduce((sum, question) => sum + (Number(question.score) || 0), 0),
        0,
      ) || 0;
    },
    validationItems() {
      return this.validatePaper(this.selected, this.selected?.status === "published");
    },
    validationErrors() {
      return this.validationItems.filter((item) => item.level === "error");
    },
    validationWarnings() {
      return this.validationItems.filter((item) => item.level === "warning");
    },
    hasChanges() {
      return !!this.selected && this.savedSnapshot !== this.snapshot(this.selected);
    },
  },
  mounted() {
    this.load();
    window.addEventListener("beforeunload", this.beforeUnload);
  },
  beforeUnmount() {
    window.removeEventListener("beforeunload", this.beforeUnload);
  },
  methods: {
    snapshot(value) {
      if (!value) return "";
      const item = clone(value);
      item.totalScore = item.sections?.reduce(
        (total, section) => total + (section.questions || []).reduce((sum, question) => sum + (Number(question.score) || 0), 0),
        0,
      ) || 0;
      return JSON.stringify(item);
    },
    beforeUnload(event) {
      if (!this.hasChanges) return;
      event.preventDefault();
      event.returnValue = "";
    },
    async load(preferredId = "") {
      this.loading = true;
      this.error = "";
      try {
        const data = await api("/api/admin/exams");
        this.papers = data.items || [];
        const selectedId = preferredId || this.selected?.id;
        if (selectedId) {
          const item = this.papers.find((paper) => paper.id === selectedId);
          if (item) this.edit(item, true);
        }
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    canReplaceEditor() {
      return !this.hasChanges || confirm("当前试卷有未保存修改，确定放弃并继续吗？");
    },
    createPaper() {
      if (!this.canReplaceEditor()) return;
      this.selected = emptyPaper();
      this.persisted = false;
      this.mode = "edit";
      this.error = "";
      this.message = "已创建空白试卷，可先保存草稿再继续编辑。";
      this.savedSnapshot = "";
      this.$nextTick(() => document.querySelector(".exam-builder-title-input")?.focus());
    },
    edit(paper, force = false) {
      if (!force && !this.canReplaceEditor()) return;
      this.selected = normalizePaper(paper);
      this.persisted = true;
      this.mode = "edit";
      this.error = "";
      this.message = "";
      this.savedSnapshot = this.snapshot(this.selected);
    },
    slug(value) {
      return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
    },
    preparePaper(status) {
      const paper = normalizePaper(this.selected);
      paper.id = paper.id || `${this.slug(paper.title) || "exam"}-${Date.now().toString(36)}`;
      paper.status = status;
      paper.totalScore = this.calculatedScore;
      let questionNumber = 0;
      paper.sections.forEach((section, sectionIndex) => {
        section.id = section.id || `${paper.id}-section-${sectionIndex + 1}`;
        section.questions.forEach((question) => {
          questionNumber += 1;
          question.id = question.id || `${paper.id}-q-${questionNumber}`;
          question.score = Number(question.score) || 0;
          question.tags = (question.tags || []).map((tag) => String(tag).trim()).filter(Boolean);
          if (!choiceTypes.has(question.type)) question.options = [];
        });
      });
      return paper;
    },
    validatePaper(paper, forPublish = false) {
      if (!paper) return [];
      const items = [];
      const add = (condition, message, anchor, draftLevel = "warning") => {
        if (condition) items.push({ level: forPublish ? "error" : draftLevel, message, anchor });
      };
      if (!String(paper.title || "").trim()) items.push({ level: "error", message: "请填写试卷标题", anchor: "paper-meta" });
      add(!(Number(paper.durationMinutes) > 0), "考试时长必须大于 0 分钟", "paper-meta");
      add(!paper.sections?.length && !paper.attachmentUrl, "至少添加一个试卷分区", "paper-sections");

      const sectionIds = new Set();
      const questionIds = new Set();
      (paper.sections || []).forEach((section, sectionIndex) => {
        const sectionAnchor = `builder-section-${sectionIndex}`;
        add(!String(section.title || "").trim(), `第 ${sectionIndex + 1} 个分区缺少标题`, sectionAnchor);
        if (section.id && sectionIds.has(section.id)) items.push({ level: "error", message: `分区编号 ${section.id} 重复`, anchor: sectionAnchor });
        if (section.id) sectionIds.add(section.id);
        add(!section.questions?.length, `“${section.title || `分区 ${sectionIndex + 1}`}”还没有题目`, sectionAnchor);

        (section.questions || []).forEach((question, questionIndex) => {
          const label = `${sectionIndex + 1}-${questionIndex + 1}`;
          const anchor = `builder-question-${sectionIndex}-${questionIndex}`;
          if (question.id && questionIds.has(question.id)) items.push({ level: "error", message: `题目编号 ${question.id} 重复`, anchor });
          if (question.id) questionIds.add(question.id);
          add(!String(question.prompt || "").trim(), `题目 ${label} 缺少题干`, anchor);
          add(!(Number(question.score) > 0), `题目 ${label} 分值必须大于 0`, anchor);
          if (choiceTypes.has(question.type)) {
            const options = (question.options || []).map((option) => String(option || "").trim());
            const validOptions = options.filter(Boolean);
            add(validOptions.length < 2 || validOptions.length !== options.length, `题目 ${label} 需要至少两个完整选项`, anchor);
            const answerIndex = String(question.answer || "").toUpperCase().charCodeAt(0) - 65;
            add(answerIndex < 0 || answerIndex >= options.length || !options[answerIndex], `题目 ${label} 的正确答案不在有效选项内`, anchor);
          } else if (!["essay", "writing", "subjective"].includes(question.type)) {
            add(!String(question.answer ?? "").trim(), `题目 ${label} 缺少标准答案`, anchor);
          }
          if (forPublish && !String(question.explanation || "").trim()) {
            items.push({ level: "warning", message: `题目 ${label} 尚未填写答案解析`, anchor });
          }
        });
      });
      return items;
    },
    async save(status = "draft") {
      if (!this.selected || this.busy) return;
      const prepared = this.preparePaper(status);
      const issues = this.validatePaper(prepared, status === "published");
      const errors = issues.filter((item) => item.level === "error");
      if (errors.length) {
        this.selected.status = status;
        this.error = `还有 ${errors.length} 项必须修正后才能${status === "published" ? "发布" : "保存"}`;
        this.jumpTo(errors[0]);
        return;
      }
      if (status === "published" && issues.some((item) => item.level === "warning") &&
          !confirm(`还有 ${issues.filter((item) => item.level === "warning").length} 项建议需要关注，确定发布吗？`)) return;

      this.busy = true;
      this.error = "";
      this.message = "";
      try {
        const saved = await api(this.persisted ? `/api/admin/exams/${encodeURIComponent(prepared.id)}` : "/api/admin/exams", {
          method: this.persisted ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prepared),
        });
        this.selected = normalizePaper(saved);
        this.persisted = true;
        this.savedSnapshot = this.snapshot(this.selected);
        await this.load(saved.id);
        this.message = status === "published" ? "试卷已发布，学生端现在可以看到。" : "草稿已保存。";
      } catch (error) {
        this.error = error.message;
      } finally {
        this.busy = false;
      }
    },
    async removePaper() {
      if (!this.persisted || !this.selected || this.busy) return;
      if (!confirm(`确定删除“${this.selected.title}”吗？删除后学生端也将无法访问。`)) return;
      this.busy = true;
      try {
        await api(`/api/admin/exams/${encodeURIComponent(this.selected.id)}`, { method: "DELETE" });
        this.papers = this.papers.filter((paper) => paper.id !== this.selected.id);
        this.selected = null;
        this.persisted = false;
        this.savedSnapshot = "";
        this.message = "试卷已删除。";
      } catch (error) {
        this.error = error.message;
      } finally {
        this.busy = false;
      }
    },
    addSection() {
      this.selected.sections.push(emptySection(this.selected.sections.length));
      this.$nextTick(() => this.jumpTo({ anchor: `builder-section-${this.selected.sections.length - 1}` }));
    },
    duplicateSection(index) {
      const section = clone(this.selected.sections[index]);
      section.id = "";
      section.title = `${section.title}（副本）`;
      section.questions.forEach((question) => { question.id = ""; });
      this.selected.sections.splice(index + 1, 0, section);
    },
    removeSection(index) {
      if (this.selected.sections.length === 1 && !confirm("删除最后一个分区后，试卷将没有结构化题目，确定继续吗？")) return;
      this.selected.sections.splice(index, 1);
    },
    moveSection(index, offset) {
      const target = index + offset;
      if (target < 0 || target >= this.selected.sections.length) return;
      const [item] = this.selected.sections.splice(index, 1);
      this.selected.sections.splice(target, 0, item);
    },
    addQuestion(section, type = section.type || "choice") {
      section.questions.push(emptyQuestion(type));
    },
    duplicateQuestion(section, index) {
      const question = clone(section.questions[index]);
      question.id = "";
      section.questions.splice(index + 1, 0, question);
    },
    removeQuestion(section, index) {
      section.questions.splice(index, 1);
    },
    moveQuestion(section, index, offset) {
      const target = index + offset;
      if (target < 0 || target >= section.questions.length) return;
      const [question] = section.questions.splice(index, 1);
      section.questions.splice(target, 0, question);
    },
    changeQuestionType(question) {
      if (choiceTypes.has(question.type)) {
        if (!question.options?.length) question.options = ["", "", "", ""];
        if (!question.answer) question.answer = "A";
      } else {
        question.options = [];
        question.answer = "";
      }
    },
    addOption(question) {
      if (question.options.length < 8) question.options.push("");
    },
    removeOption(question, index) {
      if (question.options.length <= 2) return;
      question.options.splice(index, 1);
      const answerIndex = String(question.answer || "A").charCodeAt(0) - 65;
      if (answerIndex >= question.options.length) question.answer = "A";
    },
    setTags(question, value) {
      question.tags = value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean);
    },
    globalQuestionNumber(sectionIndex, questionIndex) {
      let number = questionIndex + 1;
      for (let index = 0; index < sectionIndex; index += 1) number += this.selected.sections[index].questions.length;
      return number;
    },
    typeLabel(type) {
      return ({ choice: "单项选择", single: "单项选择", fill: "填空题", essay: "简答题", writing: "写作题", subjective: "主观题" })[type] || type;
    },
    setMode(mode) {
      this.mode = mode;
      this.$nextTick(() => document.querySelector(".exam-builder-editor")?.scrollTo({ top: 0, behavior: "auto" }));
    },
    jumpTo(issue) {
      this.mode = "edit";
      this.$nextTick(() => {
        const editor = document.querySelector(".exam-builder-editor");
        const target = document.getElementById(issue.anchor);
        if (!editor || !target) return;
        const top = editor.scrollTop + target.getBoundingClientRect().top - editor.getBoundingClientRect().top - 70;
        editor.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      });
    },
    openImport() {
      this.importOpen = true;
      this.importText = "";
      this.importItems = [];
      this.importError = "";
      this.importReport = null;
    },
    async chooseImportFile(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      this.importText = await file.text();
      this.parseImport();
      event.target.value = "";
    },
    parseImport() {
      this.importError = "";
      this.importReport = null;
      try {
        const parsed = JSON.parse(this.importText);
        const items = Array.isArray(parsed) ? parsed : parsed?.items;
        if (!Array.isArray(items) || !items.length) throw new Error("JSON 中没有可导入的试卷数组");
        this.importItems = items.map(normalizePaper);
      } catch (error) {
        this.importItems = [];
        this.importError = error.message || "无法解析 JSON";
      }
    },
    async runImport() {
      if (!this.importItems.length || this.busy) return;
      this.busy = true;
      this.importError = "";
      try {
        this.importReport = await api("/api/admin/import/exams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: this.importItems }),
        });
        if (this.importReport.imported) await this.load();
      } catch (error) {
        this.importError = error.message;
      } finally {
        this.busy = false;
      }
    },
  },
  template: `
    <section class="exam-builder">
      <header class="exam-builder-hero">
        <div>
          <span>EXAM AUTHORING WORKSPACE</span>
          <h2>可视化组卷工作台</h2>
          <p>从题目结构、评分规则到学生端预览，在一个页面完成组卷与发布。</p>
        </div>
        <div class="exam-builder-metrics">
          <div><b>{{ papers.length }}</b><small>全部试卷</small></div>
          <div><b>{{ publishedCount }}</b><small>已发布</small></div>
          <div><b>{{ draftCount }}</b><small>草稿</small></div>
        </div>
      </header>

      <div v-if="error" class="error-banner">{{ error }}<button aria-label="关闭" @click="error=''">×</button></div>
      <div v-if="message" class="exam-builder-notice">{{ message }}<button aria-label="关闭" @click="message=''">×</button></div>

      <div class="exam-builder-toolbar">
        <div class="exam-builder-search">
          <span>⌕</span>
          <input v-model="query" placeholder="搜索标题、地区或试卷 ID" aria-label="搜索试卷">
        </div>
        <div class="exam-builder-segmented" role="tablist" aria-label="试卷状态">
          <button :class="{active:statusFilter==='all'}" @click="statusFilter='all'">全部</button>
          <button :class="{active:statusFilter==='draft'}" @click="statusFilter='draft'">草稿</button>
          <button :class="{active:statusFilter==='published'}" @click="statusFilter='published'">已发布</button>
        </div>
        <button class="exam-builder-import" @click="openImport">⇧ 导入 JSON</button>
        <button class="primary" @click="createPaper">＋ 新建试卷</button>
      </div>

      <div class="exam-builder-layout">
        <aside class="exam-builder-list">
          <div class="exam-builder-list-head"><b>试卷库</b><span>{{ filteredPapers.length }} 套</span></div>
          <div class="exam-builder-list-scroll">
            <button v-for="paper in filteredPapers" :key="paper.id" :class="{active:selected?.id===paper.id&&persisted}" @click="edit(paper)">
              <span><em :class="paper.status">{{ paper.status==='published'?'已发布':'草稿' }}</em><small>{{ paper.year || '未设年份' }}</small></span>
              <strong>{{ paper.title }}</strong>
              <small>{{ paper.region }} · {{ paper.sections?.reduce((n,s)=>n+(s.questions?.length||0),0) || 0 }} 题 · {{ paper.totalScore || 0 }} 分</small>
              <time>{{ paper.updatedAt ? paper.updatedAt.slice(0,10) : '尚未保存' }}</time>
            </button>
            <p v-if="loading" class="exam-builder-empty">正在加载试卷…</p>
            <p v-else-if="!filteredPapers.length" class="exam-builder-empty">没有符合条件的试卷</p>
          </div>
        </aside>

        <main v-if="selected" class="exam-builder-editor">
          <div class="exam-builder-editor-bar">
            <div>
              <span :class="['exam-builder-save-dot',{dirty:hasChanges}]"></span>
              <b>{{ hasChanges ? '有未保存修改' : '所有修改已保存' }}</b>
              <small v-if="selected.updatedAt">{{ selected.updatedBy }} · {{ selected.updatedAt.slice(0,16).replace('T',' ') }}</small>
            </div>
            <div class="exam-builder-view-switch" role="tablist" aria-label="编辑或预览">
              <button :class="{active:mode==='edit'}" @click="setMode('edit')">编辑</button>
              <button :class="{active:mode==='preview'}" @click="setMode('preview')">学生预览</button>
            </div>
            <button class="danger" :disabled="!persisted||busy" @click="removePaper" title="删除试卷">删除</button>
            <button :disabled="busy" @click="save('draft')">{{ busy ? '保存中…' : '保存草稿' }}</button>
            <button class="primary" :disabled="busy" @click="save('published')">发布试卷</button>
          </div>

          <div v-if="mode==='edit'" class="exam-builder-canvas" @input="error=''" @change="error=''">
            <section id="paper-meta" class="exam-builder-meta">
              <div class="exam-builder-section-title"><div><span>01 / PAPER</span><h3>试卷信息</h3></div><small>学生端题库会展示标题、年份、地区与时长</small></div>
              <div class="exam-builder-form-grid">
                <label class="wide">试卷标题 *<input v-model.trim="selected.title" class="exam-builder-title-input" placeholder="例如：2026 年北京市中考英语模拟卷"></label>
                <label>试卷 ID<input v-model.trim="selected.id" :disabled="persisted" placeholder="留空将自动生成"></label>
                <label>年份<input v-model.number="selected.year" type="number" min="2000" max="2100"></label>
                <label>地区<input v-model.trim="selected.region"></label>
                <label>科目<input v-model.trim="selected.subject"></label>
                <label>考试时长（分钟）<input v-model.number="selected.durationMinutes" type="number" min="1"></label>
                <label>来源类型<select v-model="selected.sourceType"><option value="original">平台原创</option><option value="official">官方公开</option><option value="licensed">授权内容</option><option value="practice">练习样卷</option></select></label>
                <label>来源机构<input v-model.trim="selected.sourceOrganization"></label>
                <label class="wide">考试说明<textarea v-model="selected.instructions" rows="3" placeholder="显示在试卷标题下方"></textarea></label>
                <details class="wide exam-builder-source-details">
                  <summary>来源与版权信息</summary>
                  <div>
                    <label>来源网址<input v-model.trim="selected.sourceUrl" type="url" placeholder="https://"></label>
                    <label>附件网址<input v-model.trim="selected.attachmentUrl" type="url" placeholder="https://"></label>
                    <label class="wide">版权备注<textarea v-model="selected.copyrightNote" rows="2"></textarea></label>
                  </div>
                </details>
              </div>
            </section>

            <section id="paper-sections" class="exam-builder-structure">
              <div class="exam-builder-section-title">
                <div><span>02 / STRUCTURE</span><h3>题目结构</h3></div>
                <button @click="addSection">＋ 添加分区</button>
              </div>

              <article v-for="(section,sectionIndex) in selected.sections" :id="'builder-section-'+sectionIndex" :key="section.id||sectionIndex" class="exam-builder-section-card">
                <header>
                  <span class="exam-builder-drag">{{ String(sectionIndex+1).padStart(2,'0') }}</span>
                  <div>
                    <input v-model.trim="section.title" placeholder="分区标题">
                    <input v-model.trim="section.instructions" placeholder="分区作答说明（选填）">
                  </div>
                  <select v-model="section.type"><option value="choice">选择题组</option><option value="fill">填空题组</option><option value="writing">写作题组</option><option value="mixed">混合题组</option></select>
                  <div class="exam-builder-icon-actions">
                    <button :disabled="sectionIndex===0" title="上移分区" @click="moveSection(sectionIndex,-1)">↑</button>
                    <button :disabled="sectionIndex===selected.sections.length-1" title="下移分区" @click="moveSection(sectionIndex,1)">↓</button>
                    <button title="复制分区" @click="duplicateSection(sectionIndex)">⧉</button>
                    <button class="remove" title="删除分区" @click="removeSection(sectionIndex)">×</button>
                  </div>
                </header>

                <div class="exam-builder-question-list">
                  <div v-for="(question,questionIndex) in section.questions" :id="'builder-question-'+sectionIndex+'-'+questionIndex" :key="question.id||questionIndex" class="exam-builder-question-card">
                    <div class="exam-builder-question-head">
                      <span>{{ globalQuestionNumber(sectionIndex,questionIndex) }}</span>
                      <select v-model="question.type" @change="changeQuestionType(question)"><option value="choice">单项选择</option><option value="fill">填空题</option><option value="essay">简答题</option><option value="writing">写作题</option></select>
                      <label>分值 <input v-model.number="question.score" type="number" min="0" step="0.5"></label>
                      <div class="exam-builder-icon-actions">
                        <button :disabled="questionIndex===0" title="上移题目" @click="moveQuestion(section,questionIndex,-1)">↑</button>
                        <button :disabled="questionIndex===section.questions.length-1" title="下移题目" @click="moveQuestion(section,questionIndex,1)">↓</button>
                        <button title="复制题目" @click="duplicateQuestion(section,questionIndex)">⧉</button>
                        <button class="remove" title="删除题目" @click="removeQuestion(section,questionIndex)">×</button>
                      </div>
                    </div>
                    <label class="exam-builder-field">阅读材料 / 上下文（选填）<textarea v-model="question.passage" rows="3" placeholder="需要先阅读的短文、对话或材料"></textarea></label>
                    <label class="exam-builder-field">题干 *<textarea v-model="question.prompt" rows="2" placeholder="请输入完整题目"></textarea></label>

                    <div v-if="question.type==='choice'||question.type==='single'" class="exam-builder-options-editor">
                      <label v-for="(option,optionIndex) in question.options" :key="optionIndex">
                        <span>{{ String.fromCharCode(65+optionIndex) }}</span>
                        <input v-model="question.options[optionIndex]" :placeholder="'选项 '+String.fromCharCode(65+optionIndex)">
                        <button :disabled="question.options.length<=2" :title="'删除选项 '+String.fromCharCode(65+optionIndex)" @click="removeOption(question,optionIndex)">×</button>
                      </label>
                      <button v-if="question.options.length<8" class="exam-builder-add-option" @click="addOption(question)">＋ 添加选项</button>
                    </div>

                    <div class="exam-builder-answer-row">
                      <label v-if="question.type==='choice'||question.type==='single'">正确答案<select v-model="question.answer"><option v-for="(_,optionIndex) in question.options" :value="String.fromCharCode(65+optionIndex)">{{ String.fromCharCode(65+optionIndex) }}</option></select></label>
                      <label v-else>{{ ['essay','writing','subjective'].includes(question.type) ? '参考答案 / 评分要点' : '标准答案' }}<textarea v-model="question.answer" rows="2"></textarea></label>
                      <label>答案解析<textarea v-model="question.explanation" rows="2" placeholder="提交后向学生展示"></textarea></label>
                      <label>知识标签<input :value="question.tags.join('，')" @input="setTags(question,$event.target.value)" placeholder="阅读理解，时态"></label>
                    </div>
                  </div>
                </div>
                <button class="exam-builder-add-question" @click="addQuestion(section)">＋ 在此分区添加题目</button>
              </article>
            </section>
          </div>

          <div v-else class="exam-builder-preview-wrap">
            <div class="exam-builder-preview-note"><span>学生端预览</span><small>答案控件仅用于检查版式，不会保存或提交</small></div>
            <article class="exam-builder-paper-preview">
              <header><span>{{ selected.region }} · {{ selected.year }}</span><h1>{{ selected.title || '未命名试卷' }}</h1><p>{{ selected.subject }} · {{ selected.durationMinutes }} 分钟 · {{ calculatedScore }} 分</p><small>{{ selected.instructions }}</small></header>
              <section v-for="(section,sectionIndex) in selected.sections" :key="sectionIndex">
                <h2>{{ section.title || '未命名分区' }}</h2>
                <p>{{ section.instructions }}</p>
                <div v-for="(question,questionIndex) in section.questions" :key="questionIndex" class="exam-builder-preview-question">
                  <div><b>{{ globalQuestionNumber(sectionIndex,questionIndex) }}.</b><span>{{ question.score || 0 }} 分</span></div>
                  <blockquote v-if="question.passage">{{ question.passage }}</blockquote>
                  <p>{{ question.prompt || '未填写题干' }}</p>
                  <label v-for="(option,optionIndex) in question.options" v-if="question.type==='choice'||question.type==='single'" :key="optionIndex"><input type="radio" disabled><b>{{ String.fromCharCode(65+optionIndex) }}.</b>{{ option || '未填写选项' }}</label>
                  <textarea v-else-if="['essay','writing','subjective'].includes(question.type)" rows="5" disabled placeholder="学生在此输入答案"></textarea>
                  <input v-else disabled placeholder="学生在此输入答案">
                </div>
              </section>
            </article>
          </div>
        </main>

        <aside v-if="selected" class="exam-builder-inspector">
          <section>
            <span class="exam-builder-eyebrow">LIVE SUMMARY</span>
            <h3>试卷概览</h3>
            <div class="exam-builder-score"><b>{{ calculatedScore }}</b><span>总分</span><small>{{ questionCount }} 道题 · {{ selected.sections.length }} 个分区</small></div>
            <div class="exam-builder-score-bar"><i :style="{width:Math.min(100,calculatedScore)+'%'}"></i></div>
          </section>
          <section>
            <div class="exam-builder-inspector-head"><h3>发布检查</h3><em v-if="validationErrors.length">{{ validationErrors.length }} 项错误</em><em v-else class="ok">可发布</em></div>
            <div v-if="!validationItems.length" class="exam-builder-all-good"><b>✓</b><span>结构完整，所有检查已通过</span></div>
            <button v-for="(item,index) in validationItems" :key="index" :class="['exam-builder-issue',item.level]" @click="jumpTo(item)"><i>{{ item.level==='error'?'!':'·' }}</i><span>{{ item.message }}</span><b>›</b></button>
          </section>
          <section>
            <span class="exam-builder-eyebrow">OUTLINE</span>
            <h3>试卷目录</h3>
            <button v-for="(section,sectionIndex) in selected.sections" :key="sectionIndex" class="exam-builder-outline-row" @click="jumpTo({anchor:'builder-section-'+sectionIndex})"><span>{{ sectionIndex+1 }}</span><div><b>{{ section.title || '未命名分区' }}</b><small>{{ section.questions.length }} 题 · {{ section.questions.reduce((n,q)=>n+(Number(q.score)||0),0) }} 分</small></div></button>
          </section>
        </aside>

        <div v-else class="exam-builder-welcome">
          <span>EX</span><h3>选择一套试卷开始编辑</h3><p>也可以新建空白试卷，或导入已有 JSON 题库。</p><button class="primary" @click="createPaper">＋ 新建试卷</button>
        </div>
      </div>

      <div v-if="importOpen" class="exam-builder-modal" @click.self="importOpen=false">
        <section>
          <header><div><span>JSON IMPORT</span><h3>批量导入试卷</h3></div><button aria-label="关闭" @click="importOpen=false">×</button></header>
          <div v-if="!importReport" class="exam-builder-import-body">
            <label class="exam-builder-file-drop">选择 JSON 文件<input type="file" accept=".json,application/json" @change="chooseImportFile"><span>⇧</span><b>点击选择试卷文件</b><small>支持 JSON 数组或包含 items 数组的对象</small></label>
            <div class="exam-builder-import-divider"><span>或粘贴 JSON</span></div>
            <textarea v-model="importText" rows="10" spellcheck="false" placeholder='[{"id":"exam-2026","title":"示例试卷","sections":[]}]'></textarea>
            <button @click="parseImport">解析并检查</button>
            <p v-if="importError" class="exam-builder-import-error">{{ importError }}</p>
            <div v-if="importItems.length" class="exam-builder-import-preview">
              <header><b>已识别 {{ importItems.length }} 套试卷</b><small>导入会按 ID 新增或更新试卷</small></header>
              <div><p v-for="(item,index) in importItems.slice(0,8)" :key="index"><span>{{ item.status==='published'?'已发布':'草稿' }}</span><b>{{ item.title || '缺少标题' }}</b><small>{{ item.id || '缺少 ID' }}</small></p></div>
              <small v-if="importItems.length>8">另有 {{ importItems.length-8 }} 套试卷</small>
            </div>
          </div>
          <div v-else class="exam-builder-import-report">
            <div class="exam-builder-import-result"><b>{{ importReport.imported }}</b><span>导入成功</span><b>{{ importReport.failed }}</b><span>导入失败</span></div>
            <p v-for="(result,index) in importReport.results" :key="index" :class="{failed:!result.success}"><i>{{ result.success?'✓':'!' }}</i><span><b>{{ result.title || result.id || '未命名试卷' }}</b><small>{{ result.success?'导入成功':result.error }}</small></span></p>
          </div>
          <footer><button v-if="importReport" @click="importOpen=false">完成</button><template v-else><button @click="importOpen=false">取消</button><button class="primary" :disabled="busy||!importItems.length" @click="runImport">{{ busy ? '正在导入…' : '导入 '+importItems.length+' 套试卷' }}</button></template></footer>
        </section>
      </div>
    </section>
  `,
};
