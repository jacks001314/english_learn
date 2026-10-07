import { api } from "../api.js";
import { publishContext } from "../learningContext.js?v=20261007-agent-leakfix-r1";

export default {
  data: () => ({ items: [], selected: null, answers: {}, notes: "", files: [], busy: false, error: "", message: "" }),
  computed: {
    // 还没作答的第一道题：助教据此知道“学生学到哪了”。
    firstUnansweredIndex() {
      const questions = this.selected?.questions || [];
      const position = questions.findIndex((question) => !this.hasAnswer(question));
      return position < 0 ? 0 : position;
    },
    currentQuestion() {
      const questions = this.selected?.questions || [];
      if (!questions.length) return null;
      return questions[this.firstUnansweredIndex] || null;
    },
  },
  watch: {
    selected() {
      this.publishContext();
    },
    answers: {
      deep: true,
      handler() {
        this.publishContext();
      },
    },
  },
  mounted() {
    this.load();
  },
  methods: {
    hasAnswer(question) {
      const value = this.answers[question.id];
      return value !== "" && value != null;
    },
    // 作业页的上下文（契约 §5：homeworkId / homeworkTitle / questionIndex / questionType）。
    publishContext() {
      const homework = this.selected;
      if (!homework) return;
      const questions = homework.questions || [];
      const question = this.currentQuestion;
      publishContext({
        view: "homework",
        scene: "homework",
        level: "middle",
        homeworkId: homework.id,
        homeworkTitle: homework.title || "",
        questionIndex: questions.length ? this.firstUnansweredIndex + 1 : 0,
        questionType: question ? (question.options?.length ? "choice" : "text") : "",
      });
    },
    async load() {
      try {
        this.items = (await api('/api/homeworks')).items;
      } catch (e) {
        this.error = e.message;
      }
    },
    select(item) {
      this.selected = item;
      this.publishContext();
    },
    choose(e) {
      this.files = [...e.target.files];
    },
    async submit() {
      if (!this.selected) return;
      this.busy = true;
      try {
        let f = new FormData();
        f.append('answers', JSON.stringify(this.answers));
        f.append('notes', this.notes);
        this.files.forEach((x) => f.append('files', x));
        await api(`/api/homeworks/${this.selected.id}/submit`, { method: 'POST', body: f });
        this.message = '作业已提交';
        await this.load();
      } catch (e) {
        this.error = e.message;
      } finally {
        this.busy = false;
      }
    },
  },
  template:`<section class="homework-page"><header><div><span class="tag">STUDENT WORKSPACE</span><h2>我的作业</h2><p>在线完成作业，或拍照上传手写答案。</p></div><button @click="load">刷新</button></header><p v-if="error" class="error-banner">{{error}}</p><p v-if="message" class="agent-notice success">{{message}}</p><div class="homework-grid"><aside><button v-for="x in items" @click="select(x)" :class="{active:selected?.id===x.id}"><b>{{x.title}}</b><small>截止 {{x.dueAt||'未设置'}}</small><em>{{x.submission?.status||'未提交'}}</em></button><p v-if="!items.length" class="factory-empty">暂无已发布作业</p></aside><main v-if="selected"><h3>{{selected.title}}</h3><p>{{selected.description}}</p><p class="homework-requirements">要求：{{selected.requirements}}</p><article v-for="q in selected.questions" class="homework-question"><b>{{q.id}} · {{q.prompt}}</b><div v-if="q.options?.length" class="homework-options"><label v-for="o in q.options"><input type="radio" :name="q.id" :value="o" v-model="answers[q.id]"> {{o}}</label></div><textarea v-else v-model="answers[q.id]" placeholder="输入答案"></textarea></article><label>补充说明<textarea v-model="notes" rows="3"></textarea></label><label class="homework-upload">上传作业照片或PDF<input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" multiple @change="choose"><small v-if="files.length">已选择 {{files.length }} 个文件</small></label><button class="primary" :disabled="busy" @click="submit">{{busy?'提交中...':'提交作业'}}</button><div v-if="selected.submission?.grade" class="homework-grade"><b>批改结果：{{selected.submission.grade.score}} / {{selected.submission.grade.maxScore}}</b><p>{{selected.submission.grade.feedback}}</p></div></main><div v-else class="factory-empty">从左侧选择作业开始完成</div></div></section>`}
