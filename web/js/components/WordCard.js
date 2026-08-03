export default {
  props: {
    word: { type: Object, required: true },
    mastered: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
  },
  emits: ["speak", "master", "open"],
  computed: {
    displayWord() {
      return String(this.word.word || "").replace(/^\((.+)\)$/, "$1");
    },
  },
  template: `
    <article
      :class="['card','word-card',{selected}]"
      role="button"
      tabindex="0"
      :aria-label="'查看 '+displayWord+' 详情'"
      @click="$emit('open',word)"
      @keydown.enter.self="$emit('open',word)"
    >
      <button
        class="master"
        :class="{ marked: mastered }"
        :title="mastered ? '取消掌握' : '标记为已掌握'"
        :aria-label="mastered ? '取消掌握' : '标记为已掌握'"
        @click.stop="$emit('master', { word, mastered: !mastered })"
      >{{ mastered ? '★' : '☆' }}</button>
      <h3>{{ displayWord }}</h3>
      <div class="word-pronunciation">
        <span class="phonetic">{{ word.phonetic || '暂无音标' }}</span>
        <button class="sound-button" @click.stop="$emit('speak', displayWord)">▶ 发音</button>
      </div>
      <div class="meaning">{{ word.meaning || '暂无释义' }}</div>
      <div v-if="word.topic || word.grade || word.unit" class="word-tags">
        <span v-if="word.grade">{{ word.grade }}</span><span v-if="word.topic">{{ word.topic }}</span><span v-if="word.unit">{{ word.unit }}</span>
      </div>
      <div v-if="word.example" class="example">
        <b>例句</b><p>{{ word.example }}</p><small v-if="word.exampleTranslation">{{ word.exampleTranslation }}</small>
      </div>
      <div class="word-card-actions">
        <button class="learn-word-button" :class="{marked:mastered}" @click.stop="$emit('master', { word, mastered: !mastered })">{{ mastered ? '取消掌握' : '标记掌握' }}</button>
        <button class="word-open-button" @click.stop="$emit('open',word)">详情 →</button>
      </div>
    </article>
  `,
};
