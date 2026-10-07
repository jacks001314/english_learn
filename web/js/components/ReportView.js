const ItemRow = {
  props: ["item", "kind"],
  emits: ["navigate"],
  template: `
    <button
      class="report-word-row"
      @click="$emit('navigate', kind==='weak' ? {view:'mistakes',word:item.word} : {view:'learn',word:item.word,level:item.word.level})"
    >
      <span><strong>{{ item.word.word }}</strong><small>{{ item.word.meaning }}</small></span>
      <span><b>{{ item.progress.correct }}</b> 对 · <b>{{ item.progress.wrong }}</b> 错</span>
      <em>→</em>
    </button>
  `,
};

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export default {
  components: { ItemRow },
  props: { report: Object },
  emits: ["refresh", "navigate"],
  computed: {
    todayCompletion() {
      const report = this.report || {};
      const activity = (report.todayLearned || 0) + (report.todayPractices || 0);
      return Math.min(100, Math.round((activity * 100) / Math.max(1, report.todayGoal || 10)));
    },
    calendar() {
      const calendar = this.report && this.report.calendar;
      return calendar && Array.isArray(calendar.days)
        ? calendar
        : { days: [], activeDays: 0, currentStreak: 0, longestStreak: 0, totalPractices: 0 };
    },
    // 给每格补上「几号」，避免模板里调用全局对象。
    calendarCells() {
      return this.calendar.days.map((day) => ({ ...day, label: Number(day.date.slice(8, 10)) }));
    },
    // 服务端在「没有数据」时可能回 null（非法数组），这里兜住，避免整页渲染抛错。
    recentItems() {
      return Array.isArray(this.report && this.report.recent) ? this.report.recent : [];
    },
    weakItems() {
      return Array.isArray(this.report && this.report.weakest) ? this.report.weakest : [];
    },
    // 首格前面补空位，让列正好对应星期几。
    calendarOffset() {
      const first = this.calendarCells[0];
      return first ? first.weekday : 0;
    },
    accuracyText() {
      const report = this.report || {};
      const correct = Number(report.correct) || 0;
      const wrong = Number(report.wrong) || 0;
      if (correct + wrong === 0) return "--";
      return `${Math.round((correct * 100) / (correct + wrong))}%`;
    },
    reviewText() {
      const report = this.report || {};
      const completed = Number(report.reviewCompleted) || 0;
      const due = Number(report.reviewDue) || 0;
      if (completed + due === 0) return "--";
      return `${Number(report.reviewCompletionRate) || 0}%`;
    },
    reviewHint() {
      const report = this.report || {};
      return `今日已复习 ${report.reviewCompleted || 0} · 仍到期 ${report.reviewDue || 0}`;
    },
  },
  methods: {
    dayTitle(day) {
      return `${day.date}（周${WEEKDAYS[day.weekday]}）：学习 ${day.learned} 词 · 练习 ${day.practices} 题（对 ${day.correct} / 错 ${day.wrong}） · 复习 ${day.reviewed} 词`;
    },
  },
  template: `
    <section class="view report-view">
      <div class="panel report-panel">
        <div class="section-heading">
          <div><span class="tag">LEARNING INSIGHTS</span><h2>我的学习报告</h2></div>
          <button @click="$emit('refresh')">刷新</button>
        </div>
        <div class="report-summary actionable">
          <button @click="$emit('navigate','learn')"><b>{{ report.todayLearned }}</b><span>今日学习</span><small>查看词汇 →</small></button>
          <button @click="$emit('navigate','quiz')"><b>{{ report.todayPractices }}</b><span>今日练习</span><small>继续测验 →</small></button>
          <button @click="$emit('navigate','review')"><b>{{ report.reviewDue }}</b><span>到期复习</span><small>开始复习 →</small></button>
          <button @click="$emit('navigate','mistakes')"><b>{{ report.mistakes }}</b><span>待解决错题</span><small>针对加强 →</small></button>
        </div>

        <section class="report-streak">
          <div><span>连续学习</span><b>{{ report.streakDays || 0 }} 天</b><small>稳定积累比一次学很多更有效</small></div>
          <div><span>练习正确率</span><b>{{ accuracyText }}</b><small>对 {{ report.correct || 0 }} · 错 {{ report.wrong || 0 }}</small></div>
          <div><span>复习完成率</span><b>{{ reviewText }}</b><small>{{ reviewHint }}</small></div>
          <div class="report-goal"><span>今日活动</span><b>{{ (report.todayLearned||0) + (report.todayPractices||0) }} / {{ report.todayGoal || 10 }}</b><div><i :style="{width:todayCompletion+'%'}"></i></div></div>
        </section>

        <section class="report-calendar">
          <header>
            <div><span>CALENDAR</span><h3>学习日历</h3></div>
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
        </section>

        <div class="report-columns">
          <section>
            <header><div><span>RECENT</span><h3>最近学习</h3></div><small>点击查看单词详情</small></header>
            <div v-if="recentItems.length" class="report-word-list">
              <item-row v-for="item in recentItems" :key="item.word.level + item.word.id" :item="item" kind="recent" @navigate="$emit('navigate',$event)" />
            </div>
            <p v-else class="empty">还没有学习记录。</p>
          </section>
          <section>
            <header><div><span>FOCUS</span><h3>最需要加强</h3></div><small>点击进入对应错题</small></header>
            <div v-if="weakItems.length" class="report-word-list">
              <item-row v-for="item in weakItems" :key="item.word.level + item.word.id" :item="item" kind="weak" @navigate="$emit('navigate',$event)" />
            </div>
            <p v-else class="empty">暂时没有薄弱词汇。</p>
          </section>
        </div>
      </div>
    </section>
  `,
};
