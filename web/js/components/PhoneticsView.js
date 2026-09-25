import { phonetics } from "../phoneticsData.js";
import { speak as speakText } from "../speech.js?v=20260905-ipa-r3";
import { getPhonemeAudioUrl } from "../phonemeAudio.js?v=20260905-ipa-r5";

export default {
  name: "PhoneticsView",
  data: () => ({
    phonetics,
    filter: "all",
    query: "",
    selectedId: phonetics[0]?.id || "",
    collapsed: { vowel: false, diphthong: true, consonant: true },
  }),
  computed: {
    filtered() {
      const q = this.query.trim().toLowerCase();
      return this.phonetics.filter((p) => {
        if (this.filter !== "all" && p.type !== this.filter) return false;
        if (!q) return true;
        const haystack = [
          p.symbol,
          p.label,
          p.group,
          p.tip,
          p.keyword,
          p.keywordPhonetic,
          ...p.patterns.flatMap((pattern) => [
            pattern.spelling,
            ...pattern.examples.flatMap((example) => [example.word, example.meaning]),
          ]),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    },
    groupedPhonetics() {
      const groups = [
        { type: "vowel", label: "单元音", short: "元" },
        { type: "diphthong", label: "双元音", short: "双" },
        { type: "consonant", label: "辅音", short: "辅" },
      ];
      return groups
        .map((group) => ({
          ...group,
          items: this.filtered.filter((p) => p.type === group.type),
        }))
        .filter((group) => group.items.length);
    },
    selected() {
      return this.phonetics.find((p) => p.id === this.selectedId) || this.phonetics[0] || null;
    },
    totalExamples() {
      return (this.selected?.patterns || []).reduce(
        (sum, pattern) => sum + (pattern.examples?.length || 0),
        0,
      );
    },
    selectedAudioUrl() {
      return this.selected ? getPhonemeAudioUrl(this.selected.id) : "";
    },
  },
  methods: {
    playPhoneme() {
      if (!this.selectedAudioUrl) return;
      const audio = new Audio(this.selectedAudioUrl);
      audio.play().catch(() => {});
    },
    speak(text) {
      speakText(text, "en-GB", 0.82);
    },
    select(id) {
      this.selectedId = id;
      const item = this.phonetics.find((p) => p.id === id);
      if (item) this.collapsed = { ...this.collapsed, [item.type]: false };
    },
    toggleGroup(type) {
      this.collapsed = { ...this.collapsed, [type]: !this.collapsed[type] };
    },
    isGroupOpen(type) {
      return !this.collapsed[type];
    },
    setFilter(type) {
      this.filter = type;
      const first = this.phonetics.find((p) => type === "all" || p.type === type);
      if (first) {
        this.selectedId = first.id;
        this.collapsed = {
          vowel: type === "all" || type === "vowel" ? false : true,
          diphthong: type === "all" || type === "diphthong" ? false : true,
          consonant: type === "all" || type === "consonant" ? false : true,
        };
      }
    },
    clearSearch() {
      this.query = "";
    },
  },
  template: `
    <div class="phon-page">
      <div class="phon-headline">
        <div>
          <span class="phon-eyebrow">International Phonetic Alphabet</span>
          <h1>国际音标学习</h1>
          <p class="phon-sub">掌握 <em>44 个英语音素</em>，看清常见拼写如何对应同一个读音。点示范词可听发音，点单词卡片可反复跟读。</p>
        </div>
        <div class="phon-count"><b>{{ phonetics.length }}</b><span>个音素</span></div>
      </div>

      <div class="phon-toolbar">
        <div class="phon-tabs" role="tablist" aria-label="音素分类">
          <button :class="{ active: filter === 'all' }" @click="setFilter('all')">全部</button>
          <button :class="{ active: filter === 'vowel' }" @click="setFilter('vowel')">单元音</button>
          <button :class="{ active: filter === 'diphthong' }" @click="setFilter('diphthong')">双元音</button>
          <button :class="{ active: filter === 'consonant' }" @click="setFilter('consonant')">辅音</button>
        </div>
        <label class="phon-search">
          <span>搜索</span>
          <input v-model="query" type="search" placeholder="音标 / 拼写 / 单词 / 释义" />
          <button v-if="query" @click="clearSearch" aria-label="清空搜索">×</button>
        </label>
      </div>

      <div class="phon-layout">
        <aside class="phon-list">
          <div class="phon-list-head">
            <b>音素列表</b>
            <small>{{ filtered.length }} 个</small>
          </div>
          <div v-for="group in groupedPhonetics" :key="group.type" class="phon-group">
            <button
              class="phon-group-head"
              :aria-expanded="isGroupOpen(group.type)"
              @click="toggleGroup(group.type)"
            >
              <span class="phon-group-chevron">{{ isGroupOpen(group.type) ? "−" : "+" }}</span>
              <span class="phon-group-title">{{ group.label }}</span>
              <small>{{ group.items.length }}</small>
            </button>
            <div v-show="isGroupOpen(group.type)" class="phon-group-body">
              <button
                v-for="p in group.items"
                :key="p.id"
                class="phon-item"
                :class="{ active: selected && selected.id === p.id }"
                @click="select(p.id)"
              >
                <span class="phon-symbol">{{ p.symbol }}</span>
                <span class="phon-item-info">
                  <b>{{ p.label }}</b>
                  <small>{{ p.keyword }} {{ p.keywordPhonetic }}</small>
                </span>
              </button>
            </div>
          </div>
          <div v-if="!filtered.length" class="phon-empty">没有匹配的音素</div>
        </aside>

        <section v-if="selected" class="phon-detail">
          <div class="phon-detail-head">
            <div class="phon-big-symbol">{{ selected.symbol }}</div>
            <div class="phon-detail-copy">
              <span class="phon-eyebrow">{{ selected.group }}</span>
              <h2>{{ selected.label }}</h2>
              <p>{{ selected.tip }}</p>
            </div>
            <button class="phon-play" @click="playPhoneme">
              <span>▶</span>播放音标读音
            </button>
          </div>

          <div class="phon-keyword">
            <div>
              <span>示范词</span>
              <b>{{ selected.keyword }}</b>
              <em>{{ selected.keywordPhonetic }}</em>
            </div>
            <small>共 {{ totalExamples }} 个单词案例</small>
          </div>

          <div class="phon-patterns">
            <div v-for="pattern in selected.patterns" :key="pattern.spelling" class="phon-pattern">
              <div class="phon-pattern-head">
                <span>拼写</span>
                <b>{{ pattern.spelling }}</b>
                <small>{{ pattern.examples.length }} 例</small>
              </div>
              <div class="phon-examples">
                <button
                  v-for="example in pattern.examples"
                  :key="example.word"
                  class="phon-example"
                  @click="speak(example.word)"
                >
                  <b>{{ example.word }}</b>
                  <span>{{ example.meaning }}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
        <div v-else class="phon-empty">请选择一个音素</div>
      </div>
    </div>
  `,
};
