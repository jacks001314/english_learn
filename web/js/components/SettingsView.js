export default {
  props: { settings: Object, busy: Boolean },
  emits: ['save'],
  data() { return { goal: this.settings.dailyReviewGoal || 10 }; },
  watch: { settings: { deep: true, handler(value) { this.goal = value.dailyReviewGoal || 10; } } },
  methods: {
    submit() { this.$emit('save', { dailyReviewGoal: Number(this.goal) }); }
  },
  template: `
    <section class="view"><div class="panel settings-panel">
      <div class="section-heading"><div><span class="tag">学习计划</span><h2>我的每日目标</h2></div></div>
      <p>设置每天希望完成的到期复习词数，完成情况会显示在“今日复习”和学习报告中。</p>
      <form @submit.prevent="submit">
        <label for="daily-goal">每日复习目标（1～100）</label>
        <div class="settings-form"><input id="daily-goal" v-model.number="goal" type="number" min="1" max="100" required><button class="primary" :disabled="busy">保存目标</button></div>
      </form>
    </div></section>`
};
