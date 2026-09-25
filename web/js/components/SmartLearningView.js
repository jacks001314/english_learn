import { api } from "../api.js";
import { sortedTopics, exercisesByTopic, loadGrammarProgress, topicMastery } from "../grammar/index.js";

export default {
  emits: ["navigate"],
  props: {
    userId: { type: String, default: "" },
  },
  data: () => ({
    level: "primary",
    minutes: 30,
    plan: { tasks: [], focus: [], completedTasks: 0, completedMinutes: 0, estimatedMinutes: 0 },
    profile: { strongest: [], weakest: [], dimensions: [], recentEvents: [], overallScore: 0, confidence: 0 },
    loading: false,
    busy: "",
    error: "",
    message: "",
  }),
  computed: {
    progressPercent() {
      return Math.round((this.plan.completedTasks || 0) * 100 / Math.max(1, this.plan.tasks?.length || 0));
    },
    scoreBand() {
      const score = this.profile.overallScore || 0;
      if (!this.profile.practiced) return "等待基线";
      if (score >= 85) return "稳定掌握";
      if (score >= 60) return "持续巩固";
      if (score >= 40) return "正在发展";
      return "优先加强";
    },
    levelLabel() {
      return this.level === "middle" ? "初中" : "小学";
    },
    // 语法专题推荐：按完成比例从低到高排序，优先补尚未练习的专题。
    grammarPlan() {
      const progress = loadGrammarProgress(this.userId);
      const items = sortedTopics.map((topic) => {
        const list = exercisesByTopic[topic.id] || [];
        const m = topicMastery(progress, topic.id, list.length);
        return { id: topic.id, title: topic.title, category: topic.category, total: list.length, done: m.done, percent: m.percent };
      });
      const pending = items
        .filter((i) => i.percent < 100)
        .sort((a, b) => a.percent - b.percent || b.total - a.total);
      const doneCount = items.filter((i) => i.percent >= 100).length;
      return { items, pending, doneCount, total: items.length };
    },
  },
  mounted() {
    try {
      const storedLevel = localStorage.getItem("english-learn-smart-level");
      if (["primary", "middle"].includes(storedLevel)) this.level = storedLevel;
    } catch (_) {}
    this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      this.error = "";
      try {
        const query = new URLSearchParams({ level: this.level, minutes: String(this.minutes) });
        const [plan, profile] = await Promise.all([
          api(`/api/learning/plan?${query}`),
          api(`/api/learning/profile?level=${encodeURIComponent(this.level)}`),
        ]);
        this.plan = plan;
        this.profile = profile;
        this.minutes = plan.targetMinutes || this.minutes;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    async switchLevel(level) {
      if (level === this.level || this.loading) return;
      this.level = level;
      this.message = "";
      try { localStorage.setItem("english-learn-smart-level", level); } catch (_) {}
      await this.load();
    },
    async regenerate() {
      if (this.loading || !confirm("重新规划会替换今天尚未完成的路线，确定继续吗？")) return;
      this.loading = true;
      this.error = "";
      this.message = "";
      try {
        const query = new URLSearchParams({ level: this.level, minutes: String(this.minutes) });
        this.plan = await api(`/api/learning/plan/regenerate?${query}`, { method: "POST" });
        this.profile = await api(`/api/learning/profile?level=${encodeURIComponent(this.level)}`);
        this.message = "今日路线已根据最新画像重新规划。";
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    begin(task) {
      if (!task?.action?.view) return;
      this.$emit("navigate", task.action);
    },
    async complete(task) {
      if (task.completed || this.busy) return;
      this.busy = task.id;
      this.error = "";
      try {
        this.plan = await api(`/api/learning/plan/tasks/${encodeURIComponent(task.id)}/complete?level=${encodeURIComponent(this.level)}`, { method: "POST" });
        this.profile = await api(`/api/learning/profile?level=${encodeURIComponent(this.level)}`);
        this.message = `“${task.title}”已计入今日进度。`;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.busy = "";
      }
    },
    taskCode(type) {
      return ({ review: "RV", mistakes: "FX", learn: "Aa", quiz: "Q", reading: "R", explore: "DB" })[type] || "GO";
    },
    taskAction(type) {
      return ({ review: "开始复习", mistakes: "查看薄弱点", learn: "学习新词", quiz: "开始测验", reading: "开始阅读", explore: "浏览词库" })[type] || "开始任务";
    },
    eventLabel(type) {
      return ({ word_progress: "学习了词汇", word_mastery: "更新了掌握状态", word_review: "完成词汇复习", quiz_answer: "提交测验答案", mistake_resolved: "解决一个错题", article_progress: "更新阅读进度", exam_submitted: "提交考试", plan_task_completed: "完成计划任务" })[type] || "记录学习行为";
    },
    eventDetail(event) {
      if (event.contentType === "word" && event.contentId) return event.contentId;
      if (event.contentType === "article") return "文章阅读";
      if (event.contentType === "exam") return "考试练习";
      return this.levelLabel + "学习计划";
    },
    formatTime(value) {
      if (!value) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      return date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    },
  },
  template: `
    <section class="smart-studio">
      <header class="smart-hero">
        <div>
          <span>PERSONAL LEARNING ROUTE</span>
          <h1>今日智能学习台</h1>
          <p>{{ plan.summary || '正在根据学习证据安排今天的任务。' }}</p>
        </div>
        <div class="smart-hero-progress">
          <div class="smart-progress-ring" :style="{'--smart-progress':progressPercent+'%'}"><b>{{ progressPercent }}%</b><small>今日完成</small></div>
          <div><strong>{{ plan.completedMinutes || 0 }} / {{ plan.estimatedMinutes || 0 }}</strong><span>计划分钟</span><small>{{ plan.completedTasks || 0 }} / {{ plan.tasks?.length || 0 }} 项任务</small></div>
        </div>
      </header>

      <div class="smart-controls">
        <div class="smart-segmented"><button :class="{active:level==='primary'}" @click="switchLevel('primary')">小学</button><button :class="{active:level==='middle'}" @click="switchLevel('middle')">初中</button></div>
        <label><span>目标时长</span><select v-model.number="minutes"><option :value="20">20 分钟</option><option :value="30">30 分钟</option><option :value="45">45 分钟</option><option :value="60">60 分钟</option></select></label>
        <div class="smart-focus"><span>今日重点</span><em v-for="item in plan.focus" :key="item">{{ item }}</em><small v-if="!plan.focus?.length">建立学习基线</small></div>
        <button class="smart-regenerate" :disabled="loading" @click="regenerate">重新规划</button>
      </div>

      <div v-if="error" class="error-banner">{{ error }}<button aria-label="关闭" @click="error=''">×</button></div>
      <div v-if="message" class="smart-notice">{{ message }}<button aria-label="关闭" @click="message=''">×</button></div>

      <div class="smart-grid" :class="{loading}">
        <section class="smart-route">
          <header><div><span>TODAY'S ROUTE</span><h2>学习路线</h2></div><b>{{ plan.tasks?.length || 0 }} 项</b></header>
          <div class="smart-task-list">
            <article v-for="(task,index) in plan.tasks" :key="task.id" :class="{completed:task.completed}">
              <div class="smart-task-sequence"><i>{{ task.completed ? '✓' : index + 1 }}</i><span></span></div>
              <div class="smart-task-body">
                <div class="smart-task-title"><em>{{ taskCode(task.type) }}</em><div><h3>{{ task.title }}</h3><span>{{ task.minutes }} 分钟<span v-if="task.count"> · {{ task.count }} 项</span></span></div></div>
                <p>{{ task.description }}</p>
                <small>{{ task.reason }}</small>
                <div class="smart-task-actions">
                  <button v-if="!task.completed" class="primary" @click="begin(task)">{{ taskAction(task.type) }}</button>
                  <button v-if="!task.completed" :disabled="busy===task.id" title="完成任务" @click="complete(task)">标记完成</button>
                  <span v-else>已完成 <time>{{ formatTime(task.completedAt) }}</time></span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section class="smart-profile">
          <header><div><span>MASTERY PROFILE</span><h2>能力画像</h2></div><small>{{ levelLabel }}词汇</small></header>
          <div class="smart-profile-overview">
            <div class="smart-score"><b>{{ profile.overallScore || 0 }}</b><span>掌握指数</span><small>{{ scoreBand }}</small></div>
            <div class="smart-profile-metrics"><div><b>{{ profile.practiced || 0 }}</b><span>已有证据</span></div><div><b>{{ profile.mastered || 0 }}</b><span>稳定掌握</span></div><div><b>{{ profile.weak || 0 }}</b><span>优先加强</span></div><div><b>{{ profile.due || 0 }}</b><span>到期复习</span></div></div>
          </div>
          <div class="smart-section-heading"><div><h3>优先加强</h3><span>按错误、到期和掌握度排序</span></div><b>置信度 {{ profile.confidence || 0 }}%</b></div>
          <div v-if="profile.weakest?.length" class="smart-mastery-list">
            <button v-for="item in profile.weakest.slice(0,6)" :key="item.id" @click="$emit('navigate',{view:'learn',level:item.level,word:item.word})">
              <div><b>{{ item.label }}</b><span>{{ item.topic || '综合词汇' }}</span></div>
              <div class="smart-mastery-bar"><i :style="{width:item.score+'%'}"></i></div>
              <strong>{{ item.score }}</strong>
              <small>{{ item.reason }}</small>
            </button>
          </div>
          <div v-else class="smart-empty"><b>画像正在建立</b><span>当前没有足够数据形成薄弱点判断。</span></div>
          <div v-if="profile.dimensions?.length" class="smart-dimensions">
            <div class="smart-section-heading"><div><h3>主题表现</h3><span>已练主题的掌握与覆盖</span></div></div>
            <article v-for="item in profile.dimensions.slice(0,5)" :key="item.id"><div><b>{{ item.label }}</b><span>{{ item.practiced }} / {{ item.coverage }} 个词</span></div><strong>{{ item.score }}</strong><i><u :style="{width:item.score+'%'}"></u></i></article>
          </div>
        </section>

        <aside class="smart-signals">
          <header><span>LEARNING SIGNALS</span><h2>最近学习信号</h2><small>{{ profile.recentEvents?.length || 0 }} 条有效证据</small></header>
          <div v-if="profile.recentEvents?.length" class="smart-event-list">
            <article v-for="event in profile.recentEvents" :key="event.id"><i></i><div><b>{{ eventLabel(event.type) }}</b><span>{{ eventDetail(event) }}</span><time>{{ formatTime(event.createdAt) }}</time></div><em v-if="event.correct||event.wrong" :class="{wrong:event.wrong}">{{ event.correct ? '+'+event.correct : '-'+event.wrong }}</em></article>
          </div>
          <div v-else class="smart-empty compact"><b>还没有学习信号</b><span>等待第一条学习记录。</span></div>
        </aside>
      </div>

      <section class="smart-grammar">
        <header>
          <div><span>GRAMMAR TOPICS</span><h2>语法专项</h2></div>
          <small>外研版初中 · 已完成 {{ grammarPlan.doneCount }} / {{ grammarPlan.total }} 个专题</small>
        </header>
        <p class="smart-grammar-tip">按专题系统学习结构、用法与易错点，并直接练习北京市中考真题。</p>
        <div v-if="grammarPlan.pending.length" class="smart-grammar-list">
          <button
            v-for="item in grammarPlan.pending.slice(0, 4)"
            :key="item.id"
            @click="$emit('navigate', { view: 'grammar', contentId: item.id })"
          >
            <div><b>{{ item.title }}</b><span>{{ item.category }} · {{ item.done }}/{{ item.total }} 题</span></div>
            <i><u :style="{ width: item.percent + '%' }"></u></i>
            <strong>{{ item.percent }}%</strong>
          </button>
        </div>
        <div v-else class="smart-empty compact"><b>语法专题已全部完成</b><span>可以回头重做，巩固易错点。</span></div>
        <button class="smart-grammar-more" @click="$emit('navigate', 'grammar')">进入语法专题 →</button>
      </section>
    </section>
  `,
};
