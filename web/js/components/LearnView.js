import WordCard from "./WordCard.js";

export default {
  components: { WordCard },
  props: {
    level: String,
    words: Array,
    page: Number,
    pages: Number,
    query: String,
    topic: String,
    grade: String,
    unit: String,
    letter: String,
    partOfSpeech: String,
    sort: String,
    total: Number,
    facets: Object,
    masteredIds: Object,
    selectedWord: Object,
    selectedProgress: Object,
    continuousMode: Boolean,
  },
  emits: [
    "update:level",
    "update:query",
    "update:topic",
    "update:grade",
    "update:unit",
    "update:sort",
    "search",
    "clear-category",
    "page",
    "speak",
    "master",
    "open",
    "close",
    "continuous",
    "practice",
  ],
  computed: {
    categoryLabel() {
      const names = {
        noun: "名词",
        verb: "动词",
        adjective: "形容词",
        adverb: "副词",
        pronoun: "代词",
        numeral: "数词",
        article: "冠词",
        preposition: "介词",
        conjunction: "连词",
        interjection: "感叹词",
        auxiliary: "助动词",
        modal: "情态动词",
        abbreviation: "缩略词",
        phrase: "短语",
        other: "其他",
      };
      return [
        this.grade,
        this.letter ? `${this.letter} 开头` : "",
        names[this.partOfSpeech] || this.partOfSpeech,
        this.topic,
        this.unit,
      ]
        .filter(Boolean)
        .join(" · ");
    },
    selectedIndex() {
      if (!this.selectedWord) return -1;
      return this.words.findIndex(
        (word) =>
          word.id === this.selectedWord.id && word.level === this.selectedWord.level,
      );
    },
    detailSenses() {
      if (!this.selectedWord) return [];
      if (this.selectedWord.senses?.length) return this.selectedWord.senses;
      return [
        {
          id: "default",
          meaning: this.selectedWord.meaning,
          example: this.selectedWord.example,
          exampleTranslation: this.selectedWord.exampleTranslation,
        },
      ];
    },
    selectedKey() {
      if (!this.selectedWord) return "";
      return `${this.selectedWord.level}:${String(this.selectedWord.id).toLowerCase()}`;
    },
    selectedMastered() {
      return this.masteredIds.has(this.selectedKey);
    },
  },
  methods: {
    isSelected(word) {
      return (
        this.selectedWord?.id === word.id && this.selectedWord?.level === word.level
      );
    },
    openWord(word) {
      this.$emit("open", { word, preserveList: true });
    },
    moveSelection(offset) {
      if (!this.words.length) return;
      const index = this.selectedIndex < 0 ? 0 : this.selectedIndex;
      const next = Math.min(this.words.length - 1, Math.max(0, index + offset));
      if (next !== index || this.selectedIndex < 0) this.openWord(this.words[next]);
    },
    handleMaster(payload) {
      this.$emit("master", payload);
      if (
        this.continuousMode &&
        payload.mastered &&
        this.isSelected(payload.word) &&
        this.selectedIndex < this.words.length - 1
      ) {
        this.moveSelection(1);
      }
    },
    handleKeydown(event) {
      if (
        !this.continuousMode ||
        !this.selectedWord ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(event.target?.tagName)
      ) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        this.moveSelection(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        this.moveSelection(1);
      }
    },
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeydown);
  },
  template: `
    <section class="view learn-view">
      <div class="section-heading word-list-heading">
        <div><span>VOCABULARY</span><h2>推荐学习词汇</h2></div>
        <strong>共 {{ total }} 个单词</strong>
      </div>
      <div class="toolbar">
        <select :value="level" aria-label="学习阶段" @change="$emit('update:level', $event.target.value)">
          <option value="primary">小学英语</option><option value="middle">初中英语</option>
        </select>
        <select v-if="facets.grades.length" :value="grade" aria-label="年级" @change="$emit('update:grade', $event.target.value); $emit('search')"><option value="">全部年级</option><option v-for="item in facets.grades" :key="item">{{ item }}</option></select>
        <select v-if="facets.topics.length" :value="topic" aria-label="主题" @change="$emit('update:topic', $event.target.value); $emit('search')"><option value="">全部主题</option><option v-for="item in facets.topics" :key="item">{{ item }}</option></select>
        <select v-if="facets.units.length" :value="unit" aria-label="单元" @change="$emit('update:unit', $event.target.value); $emit('search')"><option value="">全部单元</option><option v-for="item in facets.units" :key="item">{{ item }}</option></select>
        <input :value="query" placeholder="搜索单词或中文释义" aria-label="搜索单词" @input="$emit('update:query', $event.target.value)" @keydown.enter="$emit('search')">
        <button class="search-button" @click="$emit('search')">搜索</button>
        <select :value="sort" aria-label="排序方式" @change="$emit('update:sort',$event.target.value)">
          <optgroup label="字母顺序">
            <option value="word-asc">A → Z</option>
            <option value="word-desc">Z → A</option>
          </optgroup>
          <optgroup label="词汇结构">
            <option value="unit">按单元</option>
            <option value="grade">按年级</option>
            <option value="topic">按主题</option>
            <option value="length-asc">短词优先</option>
            <option value="length-desc">长词优先</option>
          </optgroup>
          <optgroup label="学习节奏">
            <option value="smart">智能推荐（未掌握优先）</option>
            <option value="recent">最近更新</option>
            <option value="random">随机打乱</option>
          </optgroup>
        </select>
        <label class="continuous-toggle">
          <input type="checkbox" :checked="continuousMode" @change="$emit('continuous',$event.target.checked)">
          <span>连续学习</span>
        </label>
      </div>
      <div v-if="categoryLabel" class="active-category">
        <span>当前筛选：<strong>{{ categoryLabel }}</strong>（{{ total }} 个）</span>
        <button @click="$emit('clear-category')">清除筛选</button>
      </div>

      <div :class="['word-study-layout',{'has-detail':selectedWord}]">
        <div class="word-results-column">
          <div v-if="words.length" class="grid">
            <word-card
              v-for="word in words"
              :key="word.level + ':' + word.id"
              :word="word"
              :mastered="masteredIds.has(word.level + ':' + word.id.toLowerCase())"
              :selected="isSelected(word)"
              @speak="$emit('speak', $event)"
              @master="handleMaster"
              @open="openWord"
            />
          </div>
          <p v-else class="empty">没有找到相关单词，换个关键词试试吧。</p>
          <div v-if="pages > 1" class="pager">
            <button :disabled="page <= 1" @click="$emit('page', -1)">上一页</button>
            <span>第 {{ page }} / {{ pages }} 页</span>
            <button :disabled="page >= pages" @click="$emit('page', 1)">下一页</button>
          </div>
        </div>

        <aside v-if="selectedWord" class="word-detail-panel">
          <header>
            <div><span>WORD PROFILE</span><small>{{ selectedWord.level === 'middle' ? '初中词汇' : '小学词汇' }}</small></div>
            <button title="关闭详情" aria-label="关闭详情" @click="$emit('close')">×</button>
          </header>
          <div class="word-detail-title">
            <h2>{{ selectedWord.word }}</h2>
            <button title="播放发音" @click="$emit('speak',selectedWord.word)">▶</button>
          </div>
          <p class="word-detail-phonetic">{{ selectedWord.phonetic || '暂无音标' }} <span v-if="selectedWord.pos">{{ selectedWord.pos }}</span></p>
          <p class="word-detail-meaning">{{ selectedWord.meaning }}</p>
          <div class="word-detail-tags">
            <span v-if="selectedWord.grade">{{ selectedWord.grade }}</span><span v-if="selectedWord.topic">{{ selectedWord.topic }}</span><span v-if="selectedWord.unit">{{ selectedWord.unit }}</span>
          </div>
          <div class="word-progress-row">
            <div><b>{{ selectedProgress.correct || 0 }}</b><span>答对</span></div>
            <div><b>{{ selectedProgress.wrong || 0 }}</b><span>答错</span></div>
            <div><b>{{ selectedProgress.reviewCount || 0 }}</b><span>复习</span></div>
          </div>
          <section class="word-senses">
            <h3>释义与例句</h3>
            <article v-for="(sense,index) in detailSenses" :key="sense.id || index">
              <span>{{ String(index+1).padStart(2,'0') }}</span>
              <div><b>{{ sense.meaning }}</b><p v-if="sense.example">{{ sense.example }}</p><small v-if="sense.exampleTranslation">{{ sense.exampleTranslation }}</small></div>
            </article>
          </section>
          <div class="word-detail-actions">
            <button @click="$emit('practice',selectedWord)">专项测验</button>
            <button class="primary" @click="handleMaster({word:selectedWord,mastered:!selectedMastered})">{{ selectedMastered ? '取消掌握' : '标记掌握' }}</button>
          </div>
          <nav class="word-detail-nav" aria-label="连续学习导航">
            <button title="上一个单词" :disabled="selectedIndex<=0" @click="moveSelection(-1)">←</button>
            <span>{{ selectedIndex >= 0 ? selectedIndex + 1 : 1 }} / {{ words.length }}</span>
            <button title="下一个单词" :disabled="selectedIndex<0||selectedIndex>=words.length-1" @click="moveSelection(1)">→</button>
          </nav>
        </aside>
      </div>
    </section>
  `,
};
