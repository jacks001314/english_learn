export default {
  props: { stats: { type: Object, required: true } },
  computed: {
    accuracy() {
      const value = Number(this.stats.accuracy);
      return this.stats.seen > 0 || value > 0 ? `${value}%` : '--';
    }
  },
  template: `
    <section class="stats" aria-label="学习概览">
      <div><b>{{ stats.seen }}</b><span>已学词汇</span></div>
      <div><b>{{ stats.mastered }}</b><span>已掌握</span></div>
      <div><b>{{ accuracy }}</b><span>练习正确率</span></div>
      <div><b>{{ stats.mistakes }}</b><span>待复习错题</span></div>
    </section>`
};
