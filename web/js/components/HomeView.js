export default {
  props: {
    user: { type: Object, required: true },
    stats: { type: Object, required: true },
    report: { type: Object, required: true },
    reviewSummary: { type: Object, required: true },
    session: { type: Object, default: null },
  },
  emits: ["navigate"],
  computed: {
    greeting() {
      const hour = new Date().getHours();
      if (hour < 11) return "早上好";
      if (hour < 14) return "中午好";
      if (hour < 18) return "下午好";
      return "晚上好";
    },
    displayName() {
      return this.user.displayName || this.user.username || "同学";
    },
    dateLabel() {
      return new Intl.DateTimeFormat("zh-CN", {
        month: "long",
        day: "numeric",
        weekday: "long",
      }).format(new Date());
    },
    reviewPercent() {
      return Math.min(
        100,
        Math.round(
          (this.reviewSummary.completed * 100) / Math.max(1, this.reviewSummary.goal),
        ),
      );
    },
    primaryView() {
      return "smart";
    },
    primaryLabel() {
      return "开始今日智能计划";
    },
    hasResumeSession() {
      if (!this.session?.view || !this.session.updatedAt) return false;
      const age = Date.now() - new Date(this.session.updatedAt).getTime();
      return age >= 0 && age < 7 * 24 * 60 * 60 * 1000;
    },
    resumeTitle() {
      if (this.session?.view === "learn" && this.session.word) {
        return `继续学习 ${this.session.word.word}`;
      }
      if (this.session?.view === "quiz") {
        return this.session.completed
          ? "再挑战一组测验"
          : `继续测验 ${this.session.quizAnswered || 0}/10`;
      }
      return {
        review: "继续今日复习",
        reading: "继续上次阅读",
        exams: "继续考试练习",
      }[this.session?.view] || "继续上次学习";
    },
    resumeDescription() {
      if (this.session?.view === "learn" && this.session.word) {
        return `${this.session.word.meaning || "查看释义和例句"} · ${this.session.level === "middle" ? "初中词汇" : "小学词汇"}`;
      }
      if (this.session?.view === "quiz") {
        return this.session.completed
          ? "上一组已经完成，可以立即开始新的 10 题"
          : "题目和当前答案均已保留";
      }
      return {
        review: "回到尚未完成的间隔复习任务",
        reading: "文章、字号和阅读位置均已保留",
        exams: "未提交答案已经自动保存在当前电脑",
      }[this.session?.view] || "从上次离开的地方继续";
    },
    resumeTime() {
      const date = new Date(this.session?.updatedAt || 0);
      if (Number.isNaN(date.getTime())) return "";
      return date.toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  template: `
    <section class="desktop-home">
      <header class="home-welcome">
        <div class="home-welcome-copy">
          <span class="home-date">{{ dateLabel }}</span>
          <h1>{{ greeting }}，{{ displayName }}</h1>
          <p v-if="report.reviewDue">先完成到期复习，再学习一组新词。今天的任务已经为你排好。</p>
          <p v-else>今天没有积压的复习任务，可以开始一组新词或挑战测验。</p>
          <div class="home-actions">
            <button
              class="home-primary"
              @click="$emit('navigate', hasResumeSession ? session : primaryView)"
            >{{ hasResumeSession ? resumeTitle : primaryLabel }} <span>→</span></button>
            <button class="home-secondary" @click="$emit('navigate', hasResumeSession ? primaryView : 'reading')">
              {{ hasResumeSession ? '查看今日任务' : '继续阅读' }}
            </button>
          </div>
        </div>
        <div class="home-daily-progress">
          <div class="progress-ring" :style="{'--progress': reviewPercent + '%'}">
            <strong>{{ reviewPercent }}%</strong><span>复习进度</span>
          </div>
          <div>
            <b>{{ reviewSummary.completed }} / {{ reviewSummary.goal }}</b>
            <span>今日复习目标</span><small>连续学习 {{ report.streakDays || 0 }} 天</small>
          </div>
        </div>
      </header>

      <div class="home-metrics" aria-label="学习概览">
        <div><span>已学词汇</span><b>{{ stats.seen }}</b><small>累计接触</small></div>
        <div><span>已掌握</span><b>{{ stats.mastered }}</b><small>长期记忆</small></div>
        <div><span>练习正确率</span><b>{{ stats.seen || stats.accuracy ? stats.accuracy + '%' : '--' }}</b><small>持续提升</small></div>
        <div><span>待解决错题</span><b>{{ stats.mistakes }}</b><button @click="$emit('navigate', 'mistakes')">查看错题</button></div>
      </div>

      <section v-if="hasResumeSession" class="home-resume-row">
        <div><span>CONTINUE</span><b>{{ resumeTitle }}</b><small>{{ resumeDescription }}</small></div>
        <time>{{ resumeTime }}</time>
        <button @click="$emit('navigate', session)">继续</button>
      </section>

      <div class="home-workspace">
        <main class="today-plan">
          <div class="home-section-heading"><div><span>LEARNING FLOW</span><h2>今天这样学</h2></div><small>建议按顺序完成</small></div>
          <div class="learning-path">
            <button @click="$emit('navigate', 'review')"><i>01</i><div><b>间隔复习</b><span>巩固到期词汇，唤醒长期记忆</span></div><strong>{{ report.reviewDue }}</strong><em>个待复习</em></button>
            <button @click="$emit('navigate', 'learn')"><i>02</i><div><b>学习新词</b><span>结合音标、释义和例句学习</span></div><strong>{{ report.todayLearned }}</strong><em>今日已学</em></button>
            <button @click="$emit('navigate', 'quiz')"><i>03</i><div><b>即时测验</b><span>用多种题型检查掌握程度</span></div><strong>{{ report.todayPractices }}</strong><em>今日练习</em></button>
          </div>

          <section class="recent-learning">
            <div class="home-section-heading"><div><span>RECENT</span><h2>最近学习</h2></div><button @click="$emit('navigate', 'report')">完整报告 →</button></div>
            <div v-if="report.recent?.length" class="recent-word-list">
              <button
                v-for="item in report.recent.slice(0, 5)"
                :key="item.word.level + item.word.id"
                @click="$emit('navigate', {view:'learn',word:item.word,level:item.word.level})"
              ><b>{{ item.word.word }}</b><span>{{ item.word.meaning }}</span><small>答对 {{ item.progress.correct }} 次</small></button>
            </div>
            <p v-else class="home-empty">完成第一个单词后，最近学习会显示在这里。</p>
          </section>
        </main>

        <aside class="home-focus">
          <div class="home-section-heading"><div><span>FOCUS</span><h2>需要关注</h2></div></div>
          <div v-if="report.weakest?.length" class="focus-list">
            <button
              v-for="item in report.weakest.slice(0, 4)"
              :key="item.word.level + item.word.id"
              @click="$emit('navigate', {view:'mistakes',word:item.word})"
            ><span><b>{{ item.word.word }}</b><small>{{ item.word.meaning }}</small></span><em>{{ item.progress.wrong }} 次错误</em></button>
          </div>
          <p v-else class="home-empty compact">当前没有需要加强的词汇。</p>
          <div class="quick-links">
            <button @click="$emit('navigate', 'reading')"><b>英文阅读</b><span>精读与背诵训练</span></button>
            <button @click="$emit('navigate', 'homework')"><b>我的作业</b><span>查看待完成任务</span></button>
          </div>
        </aside>
      </div>
    </section>
  `,
};
