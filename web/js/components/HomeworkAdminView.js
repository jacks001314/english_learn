import { api } from "../api.js";

function defaultDueAt() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(20, 0, 0, 0);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function emptyForm() {
  return {
    title: "",
    description: "",
    requirements: "",
    dueAt: defaultDueAt(),
    assigneeIds: [],
    allowUpload: true,
    aiGrading: true,
    status: "published",
    questions: [{ id: "", type: "text", prompt: "", answer: "", score: 10, optionsText: "" }],
  };
}

export default {
  data: () => ({
    items: [],
    users: [],
    summary: { assignments: 0, active: 0, assigned: 0, submitted: 0, pendingGrading: 0 },
    selected: null,
    submissions: [],
    selectedSubmission: null,
    mode: "detail",
    query: "",
    statusFilter: "all",
    studentQuery: "",
    form: emptyForm(),
    draftBaseline: "",
    loading: false,
    loadingSubmissions: false,
    busy: "",
    message: "",
    error: "",
  }),
  computed: {
    filteredItems() {
      const query = this.query.trim().toLowerCase();
      return this.items.filter((item) => {
        const matchesQuery = !query || `${item.title} ${item.description} ${item.requirements}`.toLowerCase().includes(query);
        const state = this.assignmentState(item).code;
        const matchesState = this.statusFilter === "all"
          || (this.statusFilter === "pending" && item.pendingCount > 0)
          || this.statusFilter === state;
        return matchesQuery && matchesState;
      });
    },
    filteredUsers() {
      const query = this.studentQuery.trim().toLowerCase();
      return this.users.filter((user) => !query || `${user.displayName} ${user.username}`.toLowerCase().includes(query));
    },
    selectedRoster() {
      if (!this.selected) return [];
      return this.selected.assigneeIds.map((id) => {
        const user = this.users.find((item) => item.id === id) || { id, displayName: "未知学生", username: id };
        const submission = this.submissions.find((item) => item.userId === id) || null;
        return { ...user, submission };
      });
    },
    totalScore() {
      return this.form.questions.reduce((total, question) => total + (Number(question.score) || 0), 0);
    },
    selectedTotalScore() {
      return (this.selected?.questions || []).reduce((total, question) => total + (Number(question.score) || 0), 0);
    },
    isDirty() {
      return this.mode === "create" && JSON.stringify(this.form) !== this.draftBaseline;
    },
  },
  mounted() {
    this.draftBaseline = JSON.stringify(this.form);
    window.addEventListener("beforeunload", this.beforeUnload);
    this.load();
  },
  beforeUnmount() {
    window.removeEventListener("beforeunload", this.beforeUnload);
  },
  methods: {
    async load(preferredId = "") {
      this.loading = true;
      this.error = "";
      try {
        const [homeworks, users] = await Promise.all([
          api("/api/admin/homeworks"),
          api("/api/admin/users"),
        ]);
        this.items = homeworks.items || [];
        this.summary = homeworks.summary || this.summary;
        this.users = (users.items || []).filter((user) => user.role !== "admin");
        if (this.mode === "detail") {
          const id = preferredId || this.selected?.id || this.items[0]?.id;
          const next = this.items.find((item) => item.id === id) || this.items[0] || null;
          if (next) await this.view(next, true);
          else {
            this.selected = null;
            this.submissions = [];
            this.selectedSubmission = null;
          }
        }
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    startCreate() {
      if (!this.allowDiscardDraft()) return;
      this.mode = "create";
      this.selectedSubmission = null;
      this.studentQuery = "";
      this.form = emptyForm();
      this.$nextTick(() => {
        this.draftBaseline = JSON.stringify(this.form);
        document.querySelector(".hw-admin-title-input")?.focus();
      });
    },
    cancelCreate() {
      if (!this.allowDiscardDraft()) return;
      this.mode = "detail";
      this.form = emptyForm();
      this.draftBaseline = JSON.stringify(this.form);
    },
    allowDiscardDraft() {
      return !this.isDirty || confirm("当前作业还没有发布，确定放弃这些修改吗？");
    },
    beforeUnload(event) {
      if (!this.isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    },
    addQuestion() {
      this.form.questions.push({ id: "", type: "text", prompt: "", answer: "", score: 10, optionsText: "" });
      this.$nextTick(() => document.querySelector(".hw-question-card:last-child textarea")?.focus());
    },
    removeQuestion(index) {
      this.form.questions.splice(index, 1);
    },
    toggleAssignee(id) {
      const index = this.form.assigneeIds.indexOf(id);
      if (index >= 0) this.form.assigneeIds.splice(index, 1);
      else this.form.assigneeIds.push(id);
    },
    selectAllStudents() {
      const ids = this.filteredUsers.map((user) => user.id);
      const allSelected = ids.length && ids.every((id) => this.form.assigneeIds.includes(id));
      if (allSelected) this.form.assigneeIds = this.form.assigneeIds.filter((id) => !ids.includes(id));
      else this.form.assigneeIds = [...new Set([...this.form.assigneeIds, ...ids])];
    },
    async save() {
      this.error = "";
      this.message = "";
      if (!this.form.title.trim()) {
        this.error = "请填写作业标题。";
        return;
      }
      if (!this.form.assigneeIds.length) {
        this.error = "请至少选择一名学生。";
        return;
      }
      const incomplete = this.form.questions.find((question) => !question.prompt.trim());
      if (incomplete) {
        this.error = "请补全题目内容，或删除空题目。";
        return;
      }
      this.busy = "publish";
      try {
        const payload = {
          ...this.form,
          title: this.form.title.trim(),
          description: this.form.description.trim(),
          requirements: this.form.requirements.trim(),
          questions: this.form.questions.map(({ optionsText, ...question }, index) => ({
            ...question,
            id: question.id.trim() || `q${index + 1}`,
            prompt: question.prompt.trim(),
            answer: typeof question.answer === "string" ? question.answer.trim() : question.answer,
            score: Number(question.score) || 0,
            options: question.type === "choice" ? optionsText.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean) : [],
          })),
        };
        const saved = await api("/api/admin/homeworks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        this.form = emptyForm();
        this.draftBaseline = JSON.stringify(this.form);
        this.mode = "detail";
        await this.load(saved.id);
        this.message = `“${saved.title}”已发布给 ${saved.assigneeIds.length} 名学生。`;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.busy = "";
      }
    },
    async view(homework, force = false) {
      if (!force && !this.allowDiscardDraft()) return;
      this.mode = "detail";
      this.selected = homework;
      this.loadingSubmissions = true;
      this.error = "";
      try {
        const result = await api(`/api/admin/homeworks/${encodeURIComponent(homework.id)}/submissions`);
        this.submissions = (result.items || []).map((submission) => ({
          ...submission,
          grade: submission.grade || { score: 0, maxScore: this.selectedTotalScore, feedback: "", suggestions: [], status: "" },
        }));
        const currentId = this.selectedSubmission?.userId;
        this.selectedSubmission = this.submissions.find((item) => item.userId === currentId) || this.submissions[0] || null;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loadingSubmissions = false;
      }
    },
    selectSubmission(submission) {
      if (!submission) return;
      if (!submission.grade) submission.grade = { score: 0, maxScore: this.selectedTotalScore, feedback: "", suggestions: [], status: "" };
      if (!submission.grade.maxScore) submission.grade.maxScore = this.selectedTotalScore;
      this.selectedSubmission = submission;
    },
    async grade(submission) {
      if (!this.selected?.aiGrading || this.busy) return;
      this.busy = `grade-${submission.userId}`;
      this.error = "";
      this.message = "AI 正在分析答案并生成批改草稿…";
      try {
        await api(`/api/admin/homeworks/${encodeURIComponent(this.selected.id)}/submissions/${encodeURIComponent(submission.userId)}/ai-grade`, { method: "POST" });
        await this.view(this.selected, true);
        this.selectedSubmission = this.submissions.find((item) => item.userId === submission.userId) || null;
        this.message = "AI 批改草稿已生成，请检查后确认成绩。";
      } catch (error) {
        this.error = error.message;
        this.message = "";
      } finally {
        this.busy = "";
      }
    },
    async confirmGrade(submission) {
      if (!submission || this.busy) return;
      const maxScore = Number(submission.grade.maxScore) || this.selectedTotalScore;
      const score = Number(submission.grade.score);
      if (!Number.isFinite(score) || score < 0 || score > maxScore) {
        this.error = `成绩必须在 0 到 ${maxScore} 之间。`;
        return;
      }
      this.busy = `confirm-${submission.userId}`;
      this.error = "";
      try {
        await api(`/api/admin/homeworks/${encodeURIComponent(this.selected.id)}/submissions/${encodeURIComponent(submission.userId)}/grade`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submission),
        });
        await this.load(this.selected.id);
        this.selectedSubmission = this.submissions.find((item) => item.userId === submission.userId) || null;
        this.message = `已确认 ${submission.studentName || "该学生"} 的成绩。`;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.busy = "";
      }
    },
    assignmentState(homework) {
      if (homework.status !== "published") return { code: "draft", label: "草稿" };
      if (homework.dueAt) {
        const due = new Date(homework.dueAt);
        if (!Number.isNaN(due.getTime())) {
          const remaining = due.getTime() - Date.now();
          if (remaining < 0) return { code: "overdue", label: "已截止" };
          if (remaining < 48 * 60 * 60 * 1000) return { code: "active", label: "即将截止" };
        }
      }
      return { code: "active", label: "进行中" };
    },
    submissionState(submission) {
      if (!submission) return { code: "waiting", label: "未提交" };
      if (submission.grade?.status === "confirmed") return { code: "confirmed", label: "已确认" };
      if (submission.grade?.status === "ai_draft") return { code: "draft", label: "待确认" };
      return { code: "submitted", label: "待批改" };
    },
    progress(homework) {
      return Math.round((homework.submissionCount || 0) * 100 / Math.max(1, homework.assigneeIds?.length || 0));
    },
    formatDate(value) {
      if (!value) return "未设置截止时间";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
    },
    formatAnswer(value) {
      if (value === undefined || value === null || value === "") return "未作答";
      return Array.isArray(value) ? value.join("、") : String(value);
    },
  },
  template: `
    <section class="hw-admin-shell">
      <header class="hw-admin-hero">
        <div class="hw-admin-hero-copy">
          <span>ASSIGNMENT OPERATIONS</span>
          <h1>作业管理</h1>
          <p>发布学习任务、跟踪提交进度，并在一个工作区完成智能批改与成绩确认。</p>
        </div>
        <div class="hw-admin-metrics">
          <div><b>{{ summary.assignments }}</b><span>全部作业</span></div>
          <div><b>{{ summary.active }}</b><span>进行中</span></div>
          <div><b>{{ summary.submitted }}<small>/{{ summary.assigned }}</small></b><span>累计提交</span></div>
          <div :class="{attention:summary.pendingGrading}"><b>{{ summary.pendingGrading }}</b><span>待处理</span></div>
        </div>
        <button class="hw-admin-new" @click="startCreate"><i>+</i> 发布新作业</button>
      </header>

      <div class="hw-admin-toolbar">
        <div class="hw-admin-filters" aria-label="作业筛选">
          <button :class="{active:statusFilter==='all'}" @click="statusFilter='all'">全部 <b>{{ items.length }}</b></button>
          <button :class="{active:statusFilter==='active'}" @click="statusFilter='active'">进行中 <b>{{ summary.active }}</b></button>
          <button :class="{active:statusFilter==='pending'}" @click="statusFilter='pending'">待处理 <b>{{ summary.pendingGrading }}</b></button>
          <button :class="{active:statusFilter==='overdue'}" @click="statusFilter='overdue'">已截止</button>
        </div>
        <label class="hw-admin-search"><span>搜索</span><input v-model="query" placeholder="搜索标题或要求"></label>
        <button class="hw-icon-button" title="刷新数据" :disabled="loading" @click="load()">↻</button>
      </div>

      <div v-if="error" class="hw-admin-notice error"><span>{{ error }}</span><button title="关闭" @click="error=''">×</button></div>
      <div v-if="message" class="hw-admin-notice success"><span>{{ message }}</span><button title="关闭" @click="message=''">×</button></div>

      <div class="hw-admin-grid" :class="{loading}">
        <aside class="hw-admin-library">
          <header><div><span>ASSIGNMENTS</span><h2>作业列表</h2></div><b>{{ filteredItems.length }}</b></header>
          <div class="hw-assignment-list">
            <button v-for="homework in filteredItems" :key="homework.id" :class="{active:mode==='detail'&&selected?.id===homework.id}" @click="view(homework)">
              <div class="hw-assignment-state"><span :class="assignmentState(homework).code">{{ assignmentState(homework).label }}</span><time>{{ formatDate(homework.dueAt) }}</time></div>
              <h3>{{ homework.title }}</h3>
              <p>{{ homework.description || homework.requirements || '暂无补充说明' }}</p>
              <div class="hw-assignment-progress"><i><u :style="{width:progress(homework)+'%'}"></u></i><b>{{ homework.submissionCount || 0 }}/{{ homework.assigneeIds.length }}</b></div>
              <footer><span>{{ homework.questions.length }} 道题 · {{ homework.pendingCount || 0 }} 待处理</span><em>查看 ›</em></footer>
            </button>
            <div v-if="!filteredItems.length" class="hw-admin-empty"><b>没有匹配的作业</b><span>调整搜索条件或发布一份新作业。</span></div>
          </div>
        </aside>

        <main class="hw-admin-workspace">
          <template v-if="mode==='create'">
            <header class="hw-workspace-head create"><div><span>NEW ASSIGNMENT · 01</span><h2>编辑作业内容</h2><p>先建立清晰的学习目标，再配置题目与评分标准。</p></div><button title="退出新建" @click="cancelCreate">×</button></header>
            <form class="hw-compose" @submit.prevent="save">
              <label class="hw-field wide"><span>作业标题 <b>必填</b></span><input class="hw-admin-title-input" v-model="form.title" maxlength="80" placeholder="例如：Unit 3 词汇巩固与句型练习"></label>
              <div class="hw-compose-row">
                <label class="hw-field"><span>作业说明</span><textarea v-model="form.description" rows="3" placeholder="说明本次作业的学习目标"></textarea></label>
                <label class="hw-field"><span>完成要求</span><textarea v-model="form.requirements" rows="3" placeholder="填写格式、完成标准或注意事项"></textarea></label>
              </div>
              <div class="hw-question-heading"><div><span>QUESTION SET · 02</span><h3>题目与评分</h3></div><div><b>{{ form.questions.length }} 题</b><strong>{{ totalScore }} 分</strong><button type="button" @click="addQuestion">+ 添加题目</button></div></div>
              <div class="hw-question-stack">
                <article v-for="(question,index) in form.questions" :key="index" class="hw-question-card">
                  <header><i>{{ String(index+1).padStart(2,'0') }}</i><select v-model="question.type"><option value="text">简答题</option><option value="fill">填空题</option><option value="choice">选择题</option></select><label><span>分值</span><input type="number" min="0" step="1" v-model.number="question.score"></label><button type="button" title="删除题目" @click="removeQuestion(index)">×</button></header>
                  <label class="hw-field"><span>题目内容</span><textarea v-model="question.prompt" rows="2" placeholder="输入学生需要完成的题目"></textarea></label>
                  <div class="hw-question-answer">
                    <label v-if="question.type==='choice'" class="hw-field"><span>选项 <small>每行一个</small></span><textarea v-model="question.optionsText" rows="3" placeholder="A. option one&#10;B. option two"></textarea></label>
                    <label class="hw-field"><span>标准答案 <small>用于智能评分</small></span><textarea v-model="question.answer" :rows="question.type==='choice'?3:2" placeholder="输入参考答案"></textarea></label>
                  </div>
                </article>
                <button v-if="!form.questions.length" type="button" class="hw-add-first-question" @click="addQuestion">+ 添加第一道题目</button>
              </div>
            </form>
          </template>

          <template v-else-if="selected">
            <header class="hw-workspace-head">
              <div><span>ASSIGNMENT DETAIL</span><div class="hw-title-line"><h2>{{ selected.title }}</h2><em :class="assignmentState(selected).code">{{ assignmentState(selected).label }}</em></div><p>发布于 {{ formatDate(selected.createdAt) }} · 截止 {{ formatDate(selected.dueAt) }}</p></div>
              <button class="hw-secondary-action" @click="startCreate">+ 新作业</button>
            </header>
            <div class="hw-assignment-overview">
              <article><span>完成进度</span><b>{{ selected.submissionCount || 0 }}<small>/{{ selected.assigneeIds.length }}</small></b><i><u :style="{width:progress(selected)+'%'}"></u></i></article>
              <article><span>题目与分值</span><b>{{ selected.questions.length }}<small>题</small></b><em>{{ selectedTotalScore }} 分</em></article>
              <article><span>批改状态</span><b>{{ selected.confirmedCount || 0 }}<small>已确认</small></b><em>{{ selected.pendingCount || 0 }} 待处理</em></article>
            </div>
            <section class="hw-detail-copy">
              <div><span>作业说明</span><p>{{ selected.description || '未填写作业说明。' }}</p></div>
              <div><span>完成要求</span><p>{{ selected.requirements || '未填写额外要求。' }}</p></div>
            </section>
            <section class="hw-detail-questions">
              <header><div><span>QUESTION SET</span><h3>作业题目</h3></div><b>{{ selectedTotalScore }} 分</b></header>
              <article v-for="(question,index) in selected.questions" :key="question.id"><i>{{ String(index+1).padStart(2,'0') }}</i><div><span>{{ question.type==='choice'?'选择题':question.type==='fill'?'填空题':'简答题' }} · {{ question.score }} 分</span><h4>{{ question.prompt }}</h4><ul v-if="question.options?.length"><li v-for="option in question.options" :key="option">{{ option }}</li></ul><p v-if="question.answer!==undefined&&question.answer!==''"><b>参考答案</b>{{ formatAnswer(question.answer) }}</p></div></article>
              <div v-if="!selected.questions.length" class="hw-admin-empty compact"><b>这份作业没有在线题目</b><span>学生将通过说明或附件完成作业。</span></div>
            </section>
          </template>
          <div v-else class="hw-workspace-empty"><b>开始管理作业</b><span>从左侧选择一份作业，或发布新的学习任务。</span><button @click="startCreate">发布新作业</button></div>
        </main>

        <aside class="hw-admin-inspector" :class="mode">
          <template v-if="mode==='create'">
            <header><div><span>PUBLISH SETTINGS · 03</span><h2>发布设置</h2></div><b>{{ form.assigneeIds.length }} 人</b></header>
            <section class="hw-publish-section students">
              <div class="hw-inspector-heading"><div><h3>指定学生</h3><span>选择本次作业的接收对象</span></div><button @click="selectAllStudents">全选/清除</button></div>
              <label class="hw-student-search"><span>搜索</span><input v-model="studentQuery" placeholder="姓名或账号"></label>
              <div class="hw-student-list">
                <label v-for="user in filteredUsers" :key="user.id" :class="{selected:form.assigneeIds.includes(user.id)}"><input type="checkbox" :checked="form.assigneeIds.includes(user.id)" @change="toggleAssignee(user.id)"><i>{{ (user.displayName || user.username).slice(0,1).toUpperCase() }}</i><span><b>{{ user.displayName || user.username }}</b><small>@{{ user.username }}</small></span></label>
                <div v-if="!filteredUsers.length" class="hw-mini-empty">没有匹配的学生</div>
              </div>
            </section>
            <section class="hw-publish-section">
              <label class="hw-field"><span>截止时间</span><input type="datetime-local" v-model="form.dueAt"></label>
              <label class="hw-toggle"><input type="checkbox" v-model="form.allowUpload"><i></i><span><b>允许附件提交</b><small>支持照片与 PDF 作业</small></span></label>
              <label class="hw-toggle"><input type="checkbox" v-model="form.aiGrading"><i></i><span><b>启用智能批改</b><small>先生成草稿，再由教师确认</small></span></label>
            </section>
            <footer class="hw-publish-footer"><div><span>发布范围</span><b>{{ form.assigneeIds.length }} 名学生 · {{ form.questions.length }} 道题 · {{ totalScore }} 分</b></div><button :disabled="busy==='publish'" @click="save">{{ busy==='publish'?'正在发布…':'确认发布' }}</button><button class="text" @click="cancelCreate">取消</button></footer>
          </template>

          <template v-else-if="selected">
            <header><div><span>SUBMISSIONS</span><h2>学生提交</h2></div><b>{{ selected.submissionCount || 0 }}/{{ selected.assigneeIds.length }}</b></header>
            <div class="hw-submission-progress"><i><u :style="{width:progress(selected)+'%'}"></u></i><span>{{ progress(selected) }}% 已提交</span></div>
            <div class="hw-submission-roster" :class="{loading:loadingSubmissions}">
              <button v-for="student in selectedRoster" :key="student.id" :disabled="!student.submission" :class="{active:selectedSubmission?.userId===student.id}" @click="selectSubmission(student.submission)">
                <i>{{ (student.displayName || student.username).slice(0,1).toUpperCase() }}</i>
                <span><b>{{ student.displayName || student.username }}</b><small>{{ student.submission ? formatDate(student.submission.submittedAt) : '@'+student.username }}</small></span>
                <em :class="submissionState(student.submission).code">{{ submissionState(student.submission).label }}</em>
              </button>
            </div>
            <section v-if="selectedSubmission" class="hw-submission-detail">
              <header><div><span>SUBMISSION DETAIL</span><h3>{{ selectedSubmission.studentName || '学生作业' }}</h3></div><em :class="submissionState(selectedSubmission).code">{{ submissionState(selectedSubmission).label }}</em></header>
              <div class="hw-answer-list">
                <article v-for="(question,index) in selected.questions" :key="question.id"><span>{{ index+1 }}. {{ question.prompt }}</span><p>{{ formatAnswer(selectedSubmission.answers?.[question.id]) }}</p></article>
                <article v-if="selectedSubmission.notes"><span>补充说明</span><p>{{ selectedSubmission.notes }}</p></article>
                <article v-if="selectedSubmission.attachments?.length"><span>提交附件</span><p v-for="file in selectedSubmission.attachments" :key="file.id">{{ file.name }}</p></article>
              </div>
              <div class="hw-grade-editor">
                <div class="hw-grade-score"><label><span>成绩</span><input type="number" min="0" :max="selectedSubmission.grade.maxScore||selectedTotalScore" step="0.5" v-model.number="selectedSubmission.grade.score"></label><b>/ {{ selectedSubmission.grade.maxScore || selectedTotalScore }} 分</b></div>
                <label class="hw-field"><span>教师反馈</span><textarea rows="4" v-model="selectedSubmission.grade.feedback" placeholder="填写反馈，或先调用 AI 生成批改草稿"></textarea></label>
                <ul v-if="selectedSubmission.grade.suggestions?.length"><li v-for="item in selectedSubmission.grade.suggestions" :key="item">{{ item }}</li></ul>
                <button v-if="selected.aiGrading" class="hw-ai-action" :disabled="!!busy" @click="grade(selectedSubmission)">{{ busy==='grade-'+selectedSubmission.userId?'AI 分析中…':'生成 AI 批改草稿' }}</button>
                <button class="hw-confirm-action" :disabled="!!busy" @click="confirmGrade(selectedSubmission)">{{ selectedSubmission.grade.status==='confirmed'?'更新确认成绩':'确认成绩' }}</button>
                <small>AI 结果不会直接发布，确认后学生才能看到最终成绩。</small>
              </div>
            </section>
            <div v-else class="hw-admin-empty inspector"><b>{{ selected.submissionCount ? '选择一份提交' : '等待学生提交' }}</b><span>{{ selected.submissionCount ? '点击学生记录查看答案并开始批改。' : '提交后将在这里集中显示答案和附件。' }}</span></div>
          </template>
          <div v-else class="hw-admin-empty inspector"><b>暂无作业</b><span>发布作业后即可跟踪学生提交。</span></div>
        </aside>
      </div>
    </section>
  `,
};
