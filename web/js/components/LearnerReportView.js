import { api } from '../api.js';

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

// 家长/教师用的只读学习报告（plan.md P1「多用户与学习目标」第 48 项）。
// 页面只读：能看学习量、正确率、薄弱词、复习完成率与学习日历，不能改任何数据。
export default {
  data: () => ({
    users: [], learnerId: "", days: 42, level: "", report: null, busy: false, error: "",
  }),
  mounted() { this.loadUsers(); },
  computed: {
    // 所有账号都可查看（学习者、家长、教师都可以是被观察对象），
    // 只是默认优先选第一个学习者账号。
    choices() {
      return this.users;
    },
    preferred() {
      return this.users.find((user) => user.role !== "admin") || this.users[0] || null;
    },
    calendar() {
      const calendar = this.report && this.report.calendar;
      return calendar && Array.isArray(calendar.days)
        ? calendar
        : { days: [], activeDays: 0, currentStreak: 0, longestStreak: 0, totalPractices: 0 };
    },
    calendarCells() {
      return this.calendar.days.map((day) => ({ ...day, label: Number(day.date.slice(8, 10)) }));
    },
    calendarOffset() {
      const first = this.calendarCells[0];
      return first ? first.weekday : 0;
    },
    accuracyText() {
      if (!this.report) return "--";
      const correct = Number(this.report.correct) || 0;
      const wrong = Number(this.report.wrong) || 0;
      if (correct + wrong === 0) return "--";
      return `${Math.round((correct * 100) / (correct + wrong))}%`;
    },
    reviewText() {
      if (!this.report || !this.report.reviewHasData) return "--";
      return `${this.report.reviewCompletionRate}%`;
    },
    reviewHint() {
      if (!this.report) return "";
      return `今日已复习 ${this.report.reviewCompletedToday} · 仍到期 ${this.report.reviewDue} · 目标 ${this.report.reviewGoal}`;
    },
  },
  methods: {
    async loadUsers() {
      this.busy = true;
      this.error = "";
      try {
        const data = await api("/api/admin/users");
        this.users = data.items || [];
        const first = this.preferred;
        if (first) {
          this.learnerId = first.id;
          await this.loadReport();
        }
      } catch (error) {
        this.error = error.message;
      } finally {
        this.busy = false;
      }
    },
    async loadReport() {
      if (!this.learnerId) return;
      this.busy = true;
      this.error = "";
      try {
        const query = `?days=${this.days}&level=${encodeURIComponent(this.level)}`;
        this.report = await api(`/api/admin/learners/${encodeURIComponent(this.learnerId)}/report${query}`);
      } catch (error) {
        this.report = null;
        this.error = error.message;
      } finally {
        this.busy = false;
      }
    },
    async onLearner(event) {
      this.learnerId = event.target.value;
      await this.loadReport();
    },
    async onDays(event) {
      this.days = Number(event.target.value) || 42;
      await this.loadReport();
    },
    async onLevel(event) {
      this.level = event.target.value;
      await this.loadReport();
    },
    dayTitle(day) {
      return `${day.date}（周${WEEKDAYS[day.weekday]}）：学习 ${day.learned} 词 · 练习 ${day.practices} 题（对 ${day.correct} / 错 ${day.wrong}） · 复习 ${day.reviewed} 词`;
    },
    generatedAt() {
      return this.report ? String(this.report.generatedAt).slice(0, 19).replace("T", " ") : "";
    },
  },
  template: `
    <section class="learner-report">
      <div class="admin-heading">
        <div>
          <span>GUARDIAN REPORT</span>
          <h2>家长 / 教师只读报告</h2>
          <p>查看单个学习者的学习量、正确率、薄弱词与复习完成率。此页面不会修改任何学习数据。</p>
        </div>
        <button @click="loadReport" :disabled="busy || !learnerId">{{ busy ? '读取中…' : '刷新报告' }}</button>
      </div>

      <div class="learner-report-controls">
        <label>学习者
          <select :value="learnerId" @change="onLearner">
            <option v-for="user in choices" :key="user.id" :value="user.id">{{ user.displayName || user.username }}（@{{ user.username }} · {{ user.role === 'admin' ? '管理员' : '学习者' }}）</option>
          </select>
        </label>
        <label>学段
          <select :value="level" @change="onLevel">
            <option value="">全部</option>
            <option value="primary">小学</option>
            <option value="middle">初中</option>
          </select>
        </label>
        <label>日历范围
          <select :value="days" @change="onDays">
            <option :value="14">最近 14 天</option>
            <option :value="42">最近 42 天</option>
            <option :value="90">最近 90 天</option>
          </select>
        </label>
        <small v-if="report">生成时间：{{ generatedAt() }}</small>
      </div>

      <div v-if="error" class="error-banner">{{ error }}<button @click="error=''">关闭</button></div>
      <p v-else-if="!report" class="learner-report-empty">请选择一名学习者。</p>

      <template v-if="report">
        <div class="learner-report-metrics">
          <div><b>{{ report.seen }}</b><span>学过的词</span></div>
          <div><b>{{ report.mastered }}</b><span>已掌握</span></div>
          <div><b>{{ report.practices }}</b><span>累计练习</span></div>
          <div><b>{{ accuracyText }}</b><span>正确率（对 {{ report.correct }} / 错 {{ report.wrong }}）</span></div>
          <div><b>{{ reviewText }}</b><span>复习完成率</span><small>{{ reviewHint }}</small></div>
          <div><b>{{ report.streakDays }} 天</b><span>连续学习（活跃 {{ report.activeDays }} 天）</span></div>
          <div><b>{{ report.todayLearned }}</b><span>今日学习词数</span></div>
          <div><b>{{ report.todayPractices }}</b><span>今日练习题数</span></div>
        </div>

        <article class="admin-panel">
          <header class="learner-report-panel-head">
            <h3>学习日历</h3>
            <small>最近 {{ calendarCells.length }} 天 · 活跃 {{ calendar.activeDays }} 天 · 当前连续 {{ calendar.currentStreak }} 天 · 最长连续 {{ calendar.longestStreak }} 天 · 共练习 {{ calendar.totalPractices }} 题</small>
          </header>
          <div class="calendar-weekdays"><i v-for="label in ['日','一','二','三','四','五','六']" :key="label">{{ label }}</i></div>
          <div class="calendar-grid">
            <span v-for="n in calendarOffset" :key="'pad-'+n" class="calendar-pad"></span>
            <span
              v-for="day in calendarCells"
              :key="day.date"
              :class="['calendar-cell', {active:day.active, practice:day.practices>0}]"
              :title="dayTitle(day)"
            ><b>{{ day.label }}</b></span>
          </div>
        </article>

        <article class="admin-panel">
          <header class="learner-report-panel-head">
            <h3>需要加强的词 <small>{{ report.weakest.length }} 个</small></h3>
            <small>按错题优先级排序</small>
          </header>
          <div class="user-table-wrap">
            <table class="user-table">
              <thead><tr><th>单词</th><th>释义</th><th>对 / 错</th><th>下次复习</th></tr></thead>
              <tbody>
                <tr v-for="item in report.weakest" :key="item.word.level + item.word.id">
                  <td><strong>{{ item.word.word }}</strong><small>{{ item.word.level === 'middle' ? '初中' : '小学' }}</small></td>
                  <td>{{ item.word.meaning }}</td>
                  <td><b>{{ item.progress.correct }}</b> / <b>{{ item.progress.wrong }}</b></td>
                  <td>{{ (item.progress.nextReview || '').slice(0, 10) || '—' }}</td>
                </tr>
                <tr v-if="!report.weakest.length"><td colspan="4">暂无错题，继续保持。</td></tr>
              </tbody>
            </table>
          </div>
        </article>
      </template>
    </section>
  `,
};
