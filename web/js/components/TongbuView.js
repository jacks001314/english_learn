import { speak } from "../speech.js?v=20260905-ipa-r3";
import {
  tongbuSets,
  tongbuUnits,
  loadTongbuProgress,
  saveTongbuProgress,
  recordTongbuItem,
  clearTongbuSet,
  itemKey,
  setTotal,
  setDone,
  setScore,
  answerMatches,
  splitBlanks,
  splitCloze,
} from "../tongbu/index.js?v=20260926-tongbu-r2";
import { publishContext } from "../learningContext.js?v=20261007-agent-leakfix-r1";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default {
  name: "TongbuView",
  props: {
    userId: { type: String, default: "" },
    targetSetId: { type: String, default: "" },
  },
  data: () => ({
    sets: tongbuSets,
    units: tongbuUnits,
    query: "",
    unit: "全部",
    selectedId: tongbuSets[0] ? tongbuSets[0].id : "",
    tab: "practice",
    progress: {},
    values: {},
    revealed: {},
    checked: {},
    results: {},
    clozeResults: {},
  }),
  computed: {
    filteredSets() {
      const q = this.query.trim().toLowerCase();
      return this.sets.filter((set) => {
        if (this.unit !== "全部" && set.unit !== this.unit) return false;
        if (!q) return true;
        const hay = [set.title, set.subtitle, set.unit, set.book, (set.vocab || []).map((v) => v.word).join(" ")]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    },
    groupedSets() {
      const groups = [];
      this.units.forEach((unit) => {
        const items = this.filteredSets.filter((set) => set.unit === unit);
        if (items.length) groups.push({ unit, items });
      });
      return groups;
    },
    selected() {
      return this.sets.find((set) => set.id === this.selectedId) || this.sets[0] || null;
    },
    selectedScore() {
      return this.selected ? setScore(this.progress, this.selected.id) : { done: 0, firstTry: 0, review: 0 };
    },
    selectedTotal() {
      return this.selected ? setTotal(this.selected) : 0;
    },
    selectedPercent() {
      return this.selectedTotal ? Math.round((this.selectedScore.done / this.selectedTotal) * 100) : 0;
    },
    overall() {
      let done = 0;
      let total = 0;
      this.sets.forEach((set) => {
        done += setDone(this.progress, set.id);
        total += setTotal(set);
      });
      return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
    },
    // 当前做到第几题（跨 section 计数，口径与 setTotal 一致，cloze 段按空数计）：
    // 第一道还没判过的题；全判完就停在最后一题。助教状态胶囊靠它显示「第 N / M 题」。
    currentQuestionNo() {
      const set = this.selected;
      if (!set) return 0;
      let total = 0;
      let no = 0;
      (set.sections || []).forEach((section) => {
        const isCloze = section.type === "cloze";
        const judged = isCloze && this.clozeChecked(section);
        const count = isCloze ? (section.blanks || []).length : (section.items || []).length;
        for (let i = 0; i < count; i += 1) {
          total += 1;
          const done = isCloze ? judged : !!this.results[this.keyOf(section, i)];
          if (!no && !done) no = total;
        }
      });
      return no || total;
    },
  },
  watch: {
    userId() {
      this.progress = loadTongbuProgress(this.userId);
    },
    targetSetId(id) {
      if (id && this.sets.some((set) => set.id === id)) this.selectedId = id;
    },
    // 换作业 / 换单元都重新上报一次，助教的状态胶囊才跟得上（契约 §5）。
    selectedId() {
      this.publishContext();
    },
    unit() {
      this.publishContext();
    },
  },
  created() {
    this.progress = loadTongbuProgress(this.userId);
    if (this.targetSetId && this.sets.some((set) => set.id === this.targetSetId)) this.selectedId = this.targetSetId;
    this.publishContext();
  },
  methods: {
    // 把“正在做哪一份同步训练”发布到学习上下文总线（契约 §5：setId / setTitle / unitIndex）。
    publishContext() {
      const set = this.selected;
      if (!set) return;
      const unitIndex = this.units.indexOf(set.unit);
      publishContext({
        view: "tongbu",
        scene: "tongbu",
        level: "middle",
        setId: set.id,
        setTitle: set.title,
        unitIndex: unitIndex >= 0 ? unitIndex + 1 : 0,
        questionNo: this.currentQuestionNo,
        total: this.selectedTotal,
      });
    },
    speak,
    letter(i) {
      return LETTERS[i] || String(i + 1);
    },
    percentOf(set) {
      const total = setTotal(set);
      return total ? Math.round((setDone(this.progress, set.id) / total) * 100) : 0;
    },
    countOf(set) {
      return setTotal(set);
    },
    select(id) {
      this.selectedId = id;
      this.results = {};
      if (typeof window !== "undefined" && window.matchMedia("(max-width: 980px)").matches) {
        this.$nextTick(() => {
          document.querySelector(".tongbu-main")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    },
    keyOf(section, index) {
      return itemKey(section.id, index);
    },
    partKey(section, index, part) {
      return itemKey(section.id, index) + ":" + part;
    },
    blankCount(section, index) {
      return splitBlanks(section.items[index].q).filter((one) => one.blank).length;
    },
    joinedInput(section, index) {
      const values = [];
      // 按题目中下划线出现的真实位置收集输入值，避免多空题判分错位。
      this.blanksOf(section.items[index].q).forEach((part, pi) => {
        if (part.blank) values.push(this.getValue(this.partKey(section, index, pi)));
      });
      if (!values.length) return this.getValue(this.keyOf(section, index));
      return values.join(" ").replace(/\s+/g, " ").trim();
    },
    blankKey(sectionId, n) {
      return sectionId + "#blank" + n;
    },
    blanksOf(text) {
      return splitBlanks(text);
    },
    clozeParts(text) {
      return splitCloze(text);
    },
    getValue(key) {
      return this.values[key] || "";
    },
    setValue(key, value) {
      this.values = { ...this.values, [key]: value };
    },
    isRevealed(section, index) {
      return !!this.revealed[this.keyOf(section, index)];
    },
    resultClass(section, index) {
      const result = this.results[this.keyOf(section, index)];
      if (result === "ok") return "ok";
      if (result === "no") return "no";
      return "";
    },
    revealItem(section, index) {
      const key = this.keyOf(section, index);
      this.revealed = { ...this.revealed, [key]: true };
    },
    hideItem(section, index) {
      const key = this.keyOf(section, index);
      const next = { ...this.revealed };
      delete next[key];
      this.revealed = next;
    },
    checkInput(section, index) {
      const item = section.items[index];
      const key = this.keyOf(section, index);
      const typed = this.joinedInput(section, index);
      const ok =
        (item.accept || []).some((one) => answerMatches(typed, one)) || answerMatches(typed, item.a);
      this.results = { ...this.results, [key]: ok ? "ok" : "no" };
      this.revealItem(section, index);
      this.record(section, index, ok);
    },
    judgeSelf(section, index, ok) {
      this.results = { ...this.results, [this.keyOf(section, index)]: ok ? "ok" : "no" };
      this.record(section, index, ok);
    },
    record(section, index, ok) {
      this.progress = recordTongbuItem(this.progress, this.selected.id, this.keyOf(section, index), ok);
      saveTongbuProgress(this.userId, this.progress);
    },
    pickedOf(section, index) {
      return this.values[this.keyOf(section, index)] || "";
    },
    isAnswered(section, index) {
      return !!this.pickedOf(section, index);
    },
    optionClass(section, index, option) {
      if (!this.isAnswered(section, index)) return "";
      const item = section.items[index];
      if (option === item.a) return "correct";
      if (option === this.pickedOf(section, index)) return "wrong";
      return "muted";
    },
    pickOption(section, index, option) {
      if (this.isAnswered(section, index)) return;
      const item = section.items[index];
      const key = this.keyOf(section, index);
      const ok = option === item.a;
      this.values = { ...this.values, [key]: option };
      this.results = { ...this.results, [key]: ok ? "ok" : "no" };
      this.record(section, index, ok);
    },
    clozeChecked(section) {
      return !!this.checked[section.id];
    },
    clozeValueClass(section, n) {
      if (!this.clozeChecked(section)) return "";
      const result = this.clozeResults[this.blankKey(section.id, n)];
      if (result === "ok") return "ok";
      if (result === "no") return "no";
      return "";
    },
    clozeAnswerOf(section, n) {
      const blank = (section.blanks || []).find((one) => one.n === n);
      return blank ? blank.a : "";
    },
    submitCloze(section) {
      const results = { ...this.clozeResults };
      let ok = 0;
      let all = 0;
      (section.blanks || []).forEach((blank) => {
        const key = this.blankKey(section.id, blank.n);
        const correct = answerMatches(this.values[key], blank.a);
        results[key] = correct ? "ok" : "no";
        all += 1;
        if (correct) ok += 1;
        this.progress = recordTongbuItem(this.progress, this.selected.id, key, correct);
      });
      this.clozeResults = results;
      this.checked = { ...this.checked, [section.id]: true };
      saveTongbuProgress(this.userId, this.progress);
      this.clozeSummary = ok + " / " + all;
    },
    revealCloze(section) {
      this.checked = { ...this.checked, [section.id]: true };
      (section.blanks || []).forEach((blank) => {
        const key = this.blankKey(section.id, blank.n);
        if (!this.values[key]) this.values = { ...this.values, [key]: blank.a };
      });
    },
    resetCloze(section) {
      const next = { ...this.checked };
      delete next[section.id];
      this.checked = next;
      const values = { ...this.values };
      const results = { ...this.clozeResults };
      (section.blanks || []).forEach((blank) => {
        const key = this.blankKey(section.id, blank.n);
        delete values[key];
        delete results[key];
      });
      this.values = values;
      this.clozeResults = results;
    },
    revealAll() {
      if (!this.selected) return;
      const next = { ...this.revealed };
      const checked = { ...this.checked };
      this.selected.sections.forEach((section) => {
        if (section.type === "cloze") {
          checked[section.id] = true;
          return;
        }
        if (section.type === "choice") {
          section.items.forEach((item, index) => {
            const key = this.keyOf(section, index);
            if (!this.values[key]) this.values = { ...this.values, [key]: item.a };
          });
          return;
        }
        section.items.forEach((item, index) => {
          next[this.keyOf(section, index)] = true;
        });
      });
      this.revealed = next;
      this.checked = checked;
    },
    hideAll() {
      if (!this.selected) return;
      const next = { ...this.revealed };
      this.selected.sections.forEach((section) => {
        (section.items || []).forEach((item, index) => {
          delete next[this.keyOf(section, index)];
        });
      });
      this.revealed = next;
      this.checked = {};
    },
    resetSet() {
      if (!this.selected) return;
      const sectionIds = this.selected.sections.map((section) => section.id);
      const nextValues = { ...this.values };
      Object.keys(nextValues).forEach((key) => {
        if (sectionIds.some((id) => key.indexOf(id + "#") === 0)) delete nextValues[key];
      });
      this.values = nextValues;
      this.revealed = {};
      this.checked = {};
      this.results = {};
      this.clozeResults = {};
      this.progress = clearTongbuSet(this.progress, this.selected.id);
      saveTongbuProgress(this.userId, this.progress);
    },
  },
  template: `
    <div class="tongbu-page">
      <div class="tongbu-headline">
        <div>
          <span class="tongbu-eyebrow">初中英语 · 同步达标训练</span>
          <h1>同步训练与答案资料</h1>
          <p class="tongbu-sub">
            把《基础同步达标手册 七年级上》的每一份作业搬到线上：<em>题目</em> · <em>答案与解析</em> ·
            <em>词汇</em> · <em>词组</em> · <em>句型</em> · <em>语法</em> · <em>考点</em>，一份作业一个练习页。
          </p>
        </div>
        <div class="tongbu-progress" role="status">
          <div class="tp-num">{{ overall.done }}<span>/ {{ overall.total }}</span></div>
          <div class="tp-label">已练题目</div>
          <div class="tp-bar"><i :style="{ width: overall.percent + '%' }"></i></div>
          <div class="tp-note">共 {{ sets.length }} 份作业</div>
        </div>
      </div>

      <div class="tongbu-layout">
        <aside class="tongbu-list" aria-label="作业列表">
          <label class="tongbu-search">
            <input v-model="query" type="search" placeholder="搜索：单元 / 主题 / 单词" />
          </label>
          <div class="tl-units" role="tablist" aria-label="单元筛选">
            <button :class="{ active: unit === '全部' }" @click="unit = '全部'">全部</button>
            <button v-for="u in units" :key="u" :class="{ active: unit === u }" @click="unit = u">{{ u }}</button>
          </div>
          <div v-for="group in groupedSets" :key="group.unit" class="tl-group">
            <div class="tl-group-label">{{ group.unit }}</div>
            <button
              v-for="set in group.items"
              :key="set.id"
              class="tl-item"
              :class="{ active: set.id === selectedId }"
              @click="select(set.id)"
            >
              <span class="tl-name">{{ set.title }}</span>
              <span class="tl-sub">{{ set.subtitle }}</span>
              <span class="tl-meta">
                <span class="tl-count">{{ countOf(set) }} 题</span>
                <span class="tl-bar"><i :style="{ width: percentOf(set) + '%' }"></i></span>
              </span>
            </button>
          </div>
          <div v-if="!groupedSets.length" class="tl-empty">没有匹配的作业</div>
        </aside>

        <section v-if="selected" class="tongbu-main">
          <div class="tm-head">
            <div class="tm-tags">
              <span class="tm-chip">{{ selected.unit }}</span>
              <span class="tm-chip">{{ selected.pages }}</span>
              <span class="tm-chip tm-chip-lite">{{ selected.book }}</span>
            </div>
            <h2>{{ selected.title }}</h2>
            <p class="tm-sub">{{ selected.subtitle }} · 出处：{{ selected.source }}</p>
            <div class="tm-progress">
              <span>本套已完成 {{ selectedScore.done }} / {{ selectedTotal }}</span>
              <span class="tm-ok">一次答对 {{ selectedScore.firstTry }}</span>
              <span class="tm-review">需复习 {{ selectedScore.review }}</span>
              <span class="tm-bar"><i :style="{ width: selectedPercent + '%' }"></i></span>
            </div>
          </div>

          <div class="tm-tabs" role="tablist">
            <button :class="{ active: tab === 'practice' }" @click="tab = 'practice'">练习与答案</button>
            <button :class="{ active: tab === 'materials' }" @click="tab = 'materials'">词汇 · 词组 · 句型 · 语法 · 考点</button>
          </div>

          <div v-if="tab === 'practice'" class="tm-practice">
            <div class="tm-toolbar">
              <button @click="revealAll">显示全部答案</button>
              <button @click="hideAll">隐藏答案</button>
              <button @click="resetSet">清空重做</button>
            </div>

            <article v-for="section in selected.sections" :key="section.id" class="tb-block">
              <h3>{{ section.title }}</h3>
              <p v-if="section.tip" class="tb-tip">{{ section.tip }}</p>
              <div v-if="section.passage" class="tb-reading">
                <p v-for="(para, pi) in section.passage" :key="pi">{{ para }}</p>
              </div>

              <div v-if="section.type === 'dictation' || section.type === 'fill'" class="tb-items">
                <div v-for="(item, i) in section.items" :key="i" class="tb-item">
                  <div class="tb-qline">
                    <span class="tb-no">{{ i + 1 }}</span>
                    <span class="tb-qtext">
                      <template v-for="(part, pi) in blanksOf(item.q)" :key="pi">
                        <input
                          v-if="part.blank"
                          class="tb-input"
                          :class="resultClass(section, i)"
                          :value="getValue(partKey(section, i, pi))"
                          @input="setValue(partKey(section, i, pi), $event.target.value)"
                          @keyup.enter="checkInput(section, i)"
                        />
                        <span v-else>{{ part.text }}</span>
                      </template>
                      <input
                        v-if="!item.q.includes('____')"
                        class="tb-input tb-input-word"
                        :class="resultClass(section, i)"
                        :value="getValue(keyOf(section, i))"
                        @input="setValue(keyOf(section, i), $event.target.value)"
                        @keyup.enter="checkInput(section, i)"
                      />
                    </span>
                    <span class="tb-actions">
                      <button class="tb-btn" @click="checkInput(section, i)">判对错</button>
                      <button class="tb-btn tb-btn-lite" @click="isRevealed(section, i) ? hideItem(section, i) : revealItem(section, i)">
                        {{ isRevealed(section, i) ? '收起' : '看答案' }}
                      </button>
                    </span>
                  </div>
                  <div v-if="isRevealed(section, i)" class="tb-answer">
                    <div class="tb-answer-main"><span class="tb-answer-label">答案</span><b>{{ item.a }}</b></div>
                    <p v-if="item.accept && item.accept.length" class="tb-answer-note">也可写作：{{ item.accept.join(' / ') }}</p>
                    <p v-if="item.zh" class="tb-answer-zh">{{ item.zh }}</p>
                    <p v-if="item.note" class="tb-answer-note">{{ item.note }}</p>
                    <div class="tb-judge">
                      <span>自评：</span>
                      <button :class="{ active: resultClass(section, i) === 'ok' }" @click="judgeSelf(section, i, true)">我答对了</button>
                      <button :class="{ active: resultClass(section, i) === 'no' }" @click="judgeSelf(section, i, false)">需要复习</button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="section.type === 'translate'" class="tb-items">
                <div v-for="(item, i) in section.items" :key="i" class="tb-item">
                  <div class="tb-qline">
                    <span class="tb-no">{{ i + 1 }}</span>
                    <span class="tb-qtext tb-zh">{{ item.zh }}</span>
                    <span class="tb-actions">
                      <button class="tb-btn" @click="checkInput(section, i)">判对错</button>
                      <button class="tb-btn tb-btn-lite" @click="isRevealed(section, i) ? hideItem(section, i) : revealItem(section, i)">
                        {{ isRevealed(section, i) ? '收起' : '看答案' }}
                      </button>
                    </span>
                  </div>
                  <textarea
                    class="tb-textarea"
                    :class="resultClass(section, i)"
                    rows="2"
                    placeholder="在这里写出英文句子"
                    :value="getValue(keyOf(section, i))"
                    @input="setValue(keyOf(section, i), $event.target.value)"
                  ></textarea>
                  <div v-if="isRevealed(section, i)" class="tb-answer">
                    <div class="tb-answer-main"><span class="tb-answer-label">参考答案</span><b>{{ item.a }}</b></div>
                    <p v-if="item.note" class="tb-answer-note">{{ item.note }}</p>
                    <div class="tb-judge">
                      <span>自评：</span>
                      <button :class="{ active: resultClass(section, i) === 'ok' }" @click="judgeSelf(section, i, true)">我答对了</button>
                      <button :class="{ active: resultClass(section, i) === 'no' }" @click="judgeSelf(section, i, false)">需要复习</button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="section.type === 'choice'" class="tb-items">
                <div v-for="(item, i) in section.items" :key="i" class="tb-item">
                  <div class="tb-qline">
                    <span class="tb-no">{{ i + 1 }}</span>
                    <span class="tb-qtext tb-pre">{{ item.q }}</span>
                  </div>
                  <div class="tb-options">
                    <button
                      v-for="(option, oi) in item.options"
                      :key="oi"
                      class="tb-option"
                      :class="optionClass(section, i, letter(oi))"
                      @click="pickOption(section, i, letter(oi))"
                    >
                      <b>{{ letter(oi) }}</b><span>{{ option }}</span>
                    </button>
                  </div>
                  <div v-if="isAnswered(section, i)" class="tb-answer">
                    <div class="tb-answer-main">
                      <span class="tb-answer-label">正确答案</span><b>{{ item.a }}</b>
                      <span class="tb-your">你的选择：{{ pickedOf(section, i) }}</span>
                    </div>
                    <p v-if="item.explain" class="tb-answer-note">{{ item.explain }}</p>
                  </div>
                </div>
              </div>

              <div v-else-if="section.type === 'cloze'" class="tb-cloze">
                <p v-for="(para, pi) in section.passage" :key="pi" class="tb-passage">
                  <template v-for="(part, ci) in clozeParts(para)" :key="ci">
                    <input
                      v-if="part.n"
                      class="tb-input tb-input-blank"
                      :class="clozeValueClass(section, part.n)"
                      :value="getValue(blankKey(section.id, part.n))"
                      @input="setValue(blankKey(section.id, part.n), $event.target.value)"
                    />
                    <span v-else>{{ part.text }}</span>
                  </template>
                </p>
                <div class="tb-actions tb-cloze-actions">
                  <button class="tb-btn tb-btn-primary" @click="submitCloze(section)">提交批改</button>
                  <button class="tb-btn tb-btn-lite" @click="revealCloze(section)">显示答案</button>
                  <button class="tb-btn tb-btn-lite" @click="resetCloze(section)">重做本篇</button>
                </div>
                <div v-if="clozeChecked(section)" class="tb-blank-list">
                  <div v-for="blank in section.blanks" :key="blank.n" class="tb-blank-item">
                    <span class="tb-blank-no" :class="clozeValueClass(section, blank.n)">{{ blank.n }}</span>
                    <span class="tb-blank-answer">{{ blank.a }}</span>
                    <span v-if="blank.hint" class="tb-blank-hint">提示：{{ blank.hint }}</span>
                    <span class="tb-blank-explain">{{ blank.explain }}</span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="tm-materials">
            <section v-if="selected.vocab && selected.vocab.length" class="tb-block">
              <h3>词汇清单</h3>
              <div class="tb-vocab">
                <div v-for="(word, wi) in selected.vocab" :key="wi" class="tb-vocab-item">
                  <div class="tb-vocab-main">
                    <b>{{ word.word }}</b>
                    <span class="tb-phonetic">/{{ word.phonetic }}/</span>
                    <span class="tb-pos">{{ word.pos }}</span>
                    <button class="tb-speak" @click="speak(word.word)">读</button>
                  </div>
                  <div class="tb-vocab-meaning">{{ word.meaning }}</div>
                  <div v-if="word.use" class="tb-vocab-use">{{ word.use }}</div>
                </div>
              </div>
            </section>

            <section v-if="selected.phrases && selected.phrases.length" class="tb-block">
              <h3>词组与搭配</h3>
              <ul class="tb-phrases">
                <li v-for="(phrase, pi) in selected.phrases" :key="pi">
                  <b>{{ phrase.en }}</b>
                  <span class="tb-phrase-zh">{{ phrase.zh }}</span>
                  <span v-if="phrase.tip" class="tb-phrase-tip">{{ phrase.tip }}</span>
                </li>
              </ul>
            </section>

            <section v-if="selected.patterns && selected.patterns.length" class="tb-block">
              <h3>重点句型</h3>
              <div v-for="(pattern, pi) in selected.patterns" :key="pi" class="tb-pattern">
                <div class="tb-pattern-en">
                  {{ pattern.en }}
                  <button class="tb-speak" @click="speak(pattern.en)">读</button>
                </div>
                <div class="tb-pattern-zh">{{ pattern.zh }}</div>
                <div v-if="pattern.note" class="tb-pattern-note">{{ pattern.note }}</div>
              </div>
            </section>

            <section v-if="selected.grammar && selected.grammar.length" class="tb-block">
              <h3>语法要点</h3>
              <div v-for="(item, gi) in selected.grammar" :key="gi" class="tb-grammar">
                <h4>{{ item.title }}</h4>
                <ul>
                  <li v-for="(point, pti) in item.points" :key="pti">{{ point }}</li>
                </ul>
              </div>
            </section>

            <section v-if="selected.examPoints && selected.examPoints.length" class="tb-block">
              <h3>考点提示</h3>
              <ul class="tb-points">
                <li v-for="(point, ei) in selected.examPoints" :key="ei">{{ point }}</li>
              </ul>
            </section>
          </div>
        </section>
      </div>
    </div>
  `,
};