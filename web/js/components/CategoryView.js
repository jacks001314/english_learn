export default {
  props: { facets: Object, level: String, selected: Object },
  emits: ['level', 'select'],
  template: `
    <section class="view"><div class="panel category-panel">
      <div class="section-heading"><div><span class="tag">分类词库</span><h2>按分类学习</h2></div>
        <select :value="level" @change="$emit('level',$event.target.value)"><option value="primary">小学英语</option><option value="middle">初中英语</option></select></div>
      <p class="category-intro">选择一种分类，进入对应词汇列表。</p>
      <div class="category-groups">
        <div><h3>按年级</h3><button v-for="item in facets.grades" :key="item" @click="$emit('select',{grade:item})">{{ item }}</button><span v-if="!facets.grades.length" class="empty-mini">暂无年级标签</span></div>
        <div><h3>按首字母</h3><button v-for="item in facets.letters" :key="item.value" @click="$emit('select',{letter:item.value})">{{ item.value }} <small>{{ item.count }}</small></button></div>
        <div><h3>按词性</h3><button v-for="item in facets.partsOfSpeech" :key="item.value" @click="$emit('select',{pos:item.value})">{{ item.label }} <small>{{ item.count }}</small></button></div>
        <div><h3>按主题</h3><button v-for="item in facets.topics" :key="item" @click="$emit('select',{topic:item})">{{ item }}</button><span v-if="!facets.topics.length" class="empty-mini">暂无主题标签</span></div>
      </div>
    </div></section>`
};
