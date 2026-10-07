// 助教教学卡片（结构化讲解）。
//
// 数据来自服务端字段 `card`（实施契约 §2），渲染顺序与服务端字段一一对应：
// headline → verdict → points[]（label 色条 + text）→ example{en,zh}（英文可朗读）
// → check{prompt,answer}（默认折叠）→ words[]（chip，可加入今日复习）→ action。
//
// 这里只负责「把字段画出来」：字段缺失就跳过该段，整张卡为空时渲染空态文案；
// 外层面板在拿不到 card 时会回落到 Markdown 原文，任何情况下都不白屏。

const KIND_LABELS = {
  explain: '讲解',
  mistake: '错因',
  compare: '对比',
  reading: '阅读',
  general: '要点',
};

// 英文词/短语：字母开头，允许词内连字符与撇号（don't / e-mail）。
const LATIN_WORD = "[A-Za-z][A-Za-z'’,-]*";

function text(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function escapeHTML(value) {
  return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export default {
  name: 'AgentTeachingCard',
  props: {
    // 契约要求 card 必填；这里允许空值，是为了让「解析失败 / 请求失败」的调用方
    // 直接传 null 也能渲染空态而不产生 Vue 警告（渲染结果与契约一致）。
    card: { type: Object, default: null },
    compact: { type: Boolean, default: false },
  },
  emits: ['add-review', 'speak', 'ask'],
  data: () => ({ showAnswer: false }),
  computed: {
    kindLabel() {
      const kind = text(this.card && this.card.kind);
      return KIND_LABELS[kind] || KIND_LABELS.general;
    },
    headline() {
      return text(this.card && this.card.headline);
    },
    verdict() {
      return text(this.card && this.card.verdict);
    },
    points() {
      return asArray(this.card && this.card.points)
        .map((point, index) => ({
          key: index,
          label: text(point && point.label),
          text: text(point && point.text),
        }))
        .filter((point) => point.label || point.text)
        .slice(0, 8);
    },
    example() {
      const example = this.card && this.card.example;
      if (!example) return null;
      const en = text(example.en);
      const zh = text(example.zh);
      return en || zh ? { en, zh } : null;
    },
    check() {
      const check = this.card && this.card.check;
      if (!check) return null;
      const prompt = text(check.prompt);
      const answer = text(check.answer);
      return prompt || answer ? { prompt, answer } : null;
    },
    words() {
      const seen = new Set();
      return asArray(this.card && this.card.words)
        .map((word, index) => ({
          key: `${index}:${text(word && (word.id || word.word))}`,
          word: text(word && word.word),
          meaning: text(word && word.meaning),
          level: text(word && word.level),
          id: text(word && (word.id || word.word)),
        }))
        .filter((word) => {
          if (!word.word || seen.has(word.word)) return false;
          seen.add(word.word);
          return true;
        })
        .slice(0, 8);
    },
    action() {
      const action = this.card && this.card.action;
      if (!action) return null;
      const label = text(action.label);
      const body = text(action.text);
      if (!label && !body) return null;
      return { label, text: body, kind: text(action.kind).toLowerCase() };
    },
    actionButtonLabel() {
      const kind = this.action ? this.action.kind : '';
      if (kind === 'drill') return '出 3 道同类题';
      if (kind === 'review') return '加入今日复习';
      if (this.check) return '开始自测';
      return '朗读要点';
    },
    empty() {
      return !this.headline && !this.verdict && !this.points.length && !this.example
        && !this.check && !this.words.length && !this.action;
    },
    // renderRich 的短语表：生词的英文可能带空格（a kind of / a bit），优先整体识别成一个按钮。
    phrases() {
      const list = this.words.map((word) => word.word).filter((value) => /\s/.test(value));
      return [...new Set(list)].sort((a, b) => b.length - a.length).slice(0, 8);
    },
  },
  methods: {
    // 把一段文字里的英文词/短语包成 <button class="agent-word">，点击朗读。
    renderRich(value) {
      const source = String(value === undefined || value === null ? '' : value);
      if (!source) return '';
      const patterns = this.phrases.map(escapeRegExp);
      const body = patterns.length ? `(${patterns.join('|')})|(${LATIN_WORD})` : `(${LATIN_WORD})`;
      let regex;
      try {
        regex = new RegExp(body, 'gi');
      } catch (_) {
        return escapeHTML(source);
      }
      const out = [];
      let last = 0;
      let match = regex.exec(source);
      while (match) {
        if (regex.lastIndex === match.index) {
          regex.lastIndex += 1; // 防零宽匹配死循环
        } else {
          if (match.index > last) out.push(escapeHTML(source.slice(last, match.index)));
          const word = match[0];
          out.push(`<button type="button" class="agent-word" title="点一下朗读">${escapeHTML(word)}</button>`);
          last = match.index + word.length;
        }
        match = regex.exec(source);
      }
      if (last < source.length) out.push(escapeHTML(source.slice(last)));
      return out.join('');
    },
    onRichClick(event) {
      const node = event && event.target && event.target.closest ? event.target.closest('.agent-word') : null;
      if (!node) return;
      const value = text(node.textContent);
      if (value) this.$emit('speak', value);
    },
    speakExample() {
      if (this.example && this.example.en) this.$emit('speak', this.example.en);
    },
    speakWord(word) {
      if (word && word.word) this.$emit('speak', word.word);
    },
    speakAnswer() {
      if (this.check && this.check.answer) this.$emit('speak', this.check.answer);
    },
    addReview(word) {
      if (!word || !word.word) return;
      this.$emit('add-review', {
        id: word.id || word.word,
        word: word.word,
        meaning: word.meaning,
        level: word.level,
      });
    },
    toggleAnswer() {
      this.showAnswer = !this.showAnswer;
    },
    runAction() {
      const action = this.action;
      if (!action) return;
      if (action.kind === 'drill') {
        this.$emit('ask', { quickAction: 'drill', label: action.label || '出 3 道同类题' });
        return;
      }
      if (action.kind === 'review') {
        this.$emit('ask', { quickAction: 'add-review', label: action.label || '加入今日复习' });
        return;
      }
      if (this.check) {
        // 「30 秒小动作」多半就是让学生做这道自测题：本地展开答案，不打扰服务端。
        this.showAnswer = true;
        this.$nextTick(() => {
          try {
            const node = this.$refs.check;
            if (node && typeof node.scrollIntoView === 'function') {
              node.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          } catch (_) {}
        });
        return;
      }
      this.$emit('ask', { kind: action.kind || 'read', label: action.label, text: action.text });
    },
  },
  template: `
    <article class="agent-card" :class="{'is-compact': compact}">
      <p v-if="empty" class="agent-card-empty">这次没有拿到结构化的讲解，先看下面的原始回答。</p>
      <template v-else>
        <header class="agent-card-head">
          <span class="agent-card-kind">{{ kindLabel }}</span>
          <p v-if="headline" class="agent-card-headline" v-html="renderRich(headline)" @click="onRichClick"></p>
          <p v-if="verdict" class="agent-card-verdict">{{ verdict }}</p>
        </header>

        <section v-for="point in points" :key="point.key" class="agent-card-section">
          <div v-if="point.label" class="agent-card-label">{{ point.label }}</div>
          <p class="agent-card-text" v-html="renderRich(point.text)" @click="onRichClick"></p>
        </section>

        <section v-if="example" class="agent-card-section agent-card-example">
          <div class="agent-card-label">例句</div>
          <p v-if="example.en" class="en" v-html="renderRich(example.en)" @click="onRichClick"></p>
          <p v-if="example.zh" class="zh">{{ example.zh }}</p>
          <button v-if="example.en" type="button" class="agent-card-speak" @click="speakExample">🔊 朗读例句</button>
        </section>

        <section v-if="check" ref="check" class="agent-card-section agent-card-check">
          <div class="agent-card-label">30 秒自测</div>
          <p v-if="check.prompt" class="agent-card-text" v-html="renderRich(check.prompt)" @click="onRichClick"></p>
          <button type="button" class="agent-card-toggle" :aria-expanded="String(!!showAnswer)" @click="toggleAnswer">{{ showAnswer ? '收起答案' : '看答案' }}</button>
          <p v-if="showAnswer && check.answer" class="agent-card-answer">
            答案：<b>{{ check.answer }}</b>
            <button type="button" class="agent-card-speak is-mini" @click="speakAnswer">🔊</button>
          </p>
        </section>

        <section v-if="words.length" class="agent-card-section">
          <div class="agent-card-label">生词入册</div>
          <div class="agent-card-words">
            <span v-for="word in words" :key="word.key" class="agent-word-chip">
              <button type="button" class="agent-word" @click="speakWord(word)">{{ word.word }}</button>
              <em v-if="word.meaning" class="agent-word-meaning">{{ word.meaning }}</em>
              <button type="button" class="agent-chip-add" @click="addReview(word)">+ 加入今日复习</button>
            </span>
          </div>
        </section>

        <div v-if="action" class="agent-card-action" :class="{'is-inline': compact}">
          <p>
            <b v-if="action.label">{{ action.label }}</b>
            <span v-if="action.text">{{ action.text }}</span>
          </p>
          <button type="button" @click="runAction">{{ actionButtonLabel }}</button>
        </div>
      </template>
    </article>
  `,
};