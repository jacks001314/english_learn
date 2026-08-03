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

export default {
  components: { ItemRow },
  props: { report: Object },
  emits: ["refresh", "navigate"],
  computed: {
    todayCompletion() {
      const activity = this.report.todayLearned + this.report.todayPractices;
      return Math.min(100, Math.round((activity * 100) / Math.max(1, this.report.todayGoal || 10)));
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
          <div class="report-goal"><span>今日活动</span><b>{{ report.todayLearned + report.todayPractices }} / {{ report.todayGoal || 10 }}</b><div><i :style="{width:todayCompletion+'%'}"></i></div></div>
        </section>

        <div class="report-columns">
          <section>
            <header><div><span>RECENT</span><h3>最近学习</h3></div><small>点击查看单词详情</small></header>
            <div v-if="report.recent.length" class="report-word-list">
              <item-row v-for="item in report.recent" :key="item.word.level + item.word.id" :item="item" kind="recent" @navigate="$emit('navigate',$event)" />
            </div>
            <p v-else class="empty">还没有学习记录。</p>
          </section>
          <section>
            <header><div><span>FOCUS</span><h3>最需要加强</h3></div><small>点击进入对应错题</small></header>
            <div v-if="report.weakest.length" class="report-word-list">
              <item-row v-for="item in report.weakest" :key="item.word.level + item.word.id" :item="item" kind="weak" @navigate="$emit('navigate',$event)" />
            </div>
            <p v-else class="empty">暂时没有薄弱词汇。</p>
          </section>
        </div>
      </div>
    </section>
  `,
};
