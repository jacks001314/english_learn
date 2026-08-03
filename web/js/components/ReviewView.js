export default {
  props: { items: Array, level: String, busy: Boolean, summary: Object },
  computed: {
    progressPercent() { return Math.min(100, Math.round(this.summary.completed * 100 / Math.max(1, this.summary.goal))); }
  },
  emits: ['refresh', 'speak', 'answer'],
  template: `
    <section class="view"><div class="panel">
      <div class="section-heading">
        <div><span class="tag">间隔复习</span><h2>今日复习</h2></div>
        <button :disabled="busy" @click="$emit('refresh')">刷新</button>
      </div>
      <p class="review-intro">优先巩固已经到期的词汇。想起释义后，再选择“记得”或“忘了”。</p>
      <div class="review-progress" aria-label="今日复习进度">
        <div><strong>今日已复习 {{ summary.completed }} 个</strong><span>目标 {{ summary.goal }} 个 · 待复习 {{ summary.total }} 个</span></div>
        <div class="progress-track"><span :style="{ width: progressPercent + '%' }"></span></div>
      </div>
      <div v-if="items.length" class="review-list">
        <article v-for="item in items" :key="item.word.level + ':' + item.word.id" class="review-card">
          <div><span class="tag">{{ item.word.level === 'primary' ? '小学' : '初中' }}</span>
            <h3>{{ item.word.word }}</h3><div class="phonetic">{{ item.word.phonetic || '暂无音标' }}</div><p>{{ item.word.meaning }}</p>
            <small>连续记得 {{ item.progress.reviewStreak || 0 }} 次 · 当前间隔 {{ item.progress.intervalDays || 1 }} 天</small></div>
          <div class="review-actions"><button @click="$emit('speak', item.word.word)">🔊 朗读</button>
            <button :disabled="busy" class="forgot" @click="$emit('answer', item.word, false)">忘了</button>
            <button :disabled="busy" class="primary" @click="$emit('answer', item.word, true)">记得</button></div>
        </article>
      </div>
      <div v-else class="empty success">🎉 {{ level === 'primary' ? '小学' : '初中' }}词汇今天已复习完成！</div>
    </div></section>`
};
