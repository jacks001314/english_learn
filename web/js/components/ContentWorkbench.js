import { api } from "../api.js";

const clone = (value) => JSON.parse(JSON.stringify(value));
const emptyWord = () => ({
  id: "", word: "", phonetic: "", pos: "", meaning: "", example: "", exampleTranslation: "",
  topic: "", grade: "", unit: "", status: "draft",
});
const emptyArticle = () => ({
  id: "", title: "", chineseTitle: "", grade: "七年级", difficulty: "基础", topic: "",
  collection: "管理员创建", minutes: 5, intro: "", paragraphs: [{ en: "", zh: "" }],
  words: [["", ""]], quote: "", quoteZh: "", status: "draft",
});

export default {
  data: () => ({
    type: "articles",
    level: "middle",
    statusFilter: "all",
    query: "",
    items: [],
    total: 0,
    statusCounts: { published: 0, draft: 0, archived: 0 },
    selected: null,
    persisted: false,
    savedSnapshot: "",
    versions: [],
    selectedVersion: null,
    busy: false,
    loading: false,
    error: "",
    message: "",
  }),
  computed: {
    contentType() {
      return this.type === "articles" ? "article" : "word";
    },
    contentLabel() {
      return this.type === "articles" ? "文章" : "单词";
    },
    publishedCount() {
      return this.statusCounts.published || 0;
    },
    draftCount() {
      return this.statusCounts.draft || 0;
    },
    hasChanges() {
      return !!this.selected && this.savedSnapshot !== this.snapshot(this.selected);
    },
    validationItems() {
      return this.validate(this.selected, this.selected?.status === "published");
    },
    selectedVersionSnapshot() {
      return this.selectedVersion?.snapshot || null;
    },
    diffEntries() {
      if (!this.selected || !this.selectedVersionSnapshot) return [];
      const fields = this.type === "articles"
        ? [["title", "英文标题"], ["chineseTitle", "中文标题"], ["status", "状态"], ["grade", "年级"], ["difficulty", "难度"], ["topic", "主题"], ["collection", "合集"], ["minutes", "阅读时长"], ["intro", "导语"], ["paragraphs", "双语正文"], ["words", "重点词汇"], ["quote", "英文佳句"], ["quoteZh", "佳句翻译"]]
        : [["word", "英文单词"], ["status", "状态"], ["phonetic", "音标"], ["pos", "词性"], ["meaning", "中文释义"], ["example", "英文例句"], ["exampleTranslation", "例句翻译"], ["topic", "主题"], ["grade", "年级"], ["unit", "教材单元"]];
      return fields
        .filter(([key]) => JSON.stringify(this.selectedVersionSnapshot[key] ?? "") !== JSON.stringify(this.selected[key] ?? ""))
        .map(([key, label]) => ({
          key,
          label,
          before: this.formatValue(key, this.selectedVersionSnapshot[key]),
          after: this.formatValue(key, this.selected[key]),
        }));
    },
  },
  mounted() {
    this.load();
    window.addEventListener("beforeunload", this.beforeUnload);
  },
  beforeUnmount() {
    window.removeEventListener("beforeunload", this.beforeUnload);
  },
  methods: {
    snapshot(item) {
      return item ? JSON.stringify(item) : "";
    },
    effectiveStatus(status) {
      return status || "published";
    },
    statusLabel(status) {
      return ({ draft: "草稿", published: "已发布", archived: "已归档" })[this.effectiveStatus(status)] || status;
    },
    actionLabel(action) {
      return ({ baseline: "初始基线", save: "保存草稿", publish: "正式发布", rollback: "版本回滚" })[action] || action;
    },
    beforeUnload(event) {
      if (!this.hasChanges) return;
      event.preventDefault();
      event.returnValue = "";
    },
    canReplaceEditor() {
      return !this.hasChanges || confirm("当前内容有未保存修改，确定放弃并继续吗？");
    },
    normalize(item) {
      const value = clone(item || {});
      value.status = this.effectiveStatus(value.status);
      if (this.type === "articles") {
        value.paragraphs = value.paragraphs?.length ? value.paragraphs : [{ en: "", zh: "" }];
        value.words = value.words?.length ? value.words : [["", ""]];
      }
      return value;
    },
    async load(preferredId = "") {
      this.loading = true;
      try {
        const params = new URLSearchParams({ q: this.query.trim(), size: "100" });
        if (this.type === "words") params.set("level", this.level);
        if (this.statusFilter !== "all") params.set("status", this.statusFilter);
        const path = this.type === "articles" ? "/api/admin/articles" : "/api/admin/words";
        const data = await api(`${path}?${params}`);
        this.items = (data.items || []).map((item) => this.normalize(item));
        this.total = data.total || 0;
        this.statusCounts = data.statusCounts || { published: 0, draft: 0, archived: 0 };
        const selectedId = preferredId || this.selected?.id;
        if (selectedId) {
          const item = this.items.find((candidate) => candidate.id === selectedId);
          if (item) await this.edit(item, true);
        }
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    async switchType(type) {
      if (type === this.type || !this.canReplaceEditor()) return;
      this.type = type;
      this.statusFilter = "all";
      this.query = "";
      this.selected = null;
      this.versions = [];
      this.selectedVersion = null;
      await this.load();
    },
    async switchLevel(level) {
      if (level === this.level || !this.canReplaceEditor()) return;
      this.level = level;
      this.selected = null;
      this.versions = [];
      await this.load();
    },
    async setStatusFilter(status) {
      if (status === this.statusFilter) return;
      this.statusFilter = status;
      await this.load();
    },
    create() {
      if (!this.canReplaceEditor()) return;
      this.selected = this.type === "articles" ? emptyArticle() : emptyWord();
      this.persisted = false;
      this.savedSnapshot = "";
      this.versions = [];
      this.selectedVersion = null;
      this.error = "";
      this.message = `正在创建新${this.contentLabel}，建议先保存草稿。`;
      this.$nextTick(() => document.querySelector(".lifecycle-primary-input")?.focus());
    },
    async edit(item, force = false) {
      if (!force && !this.canReplaceEditor()) return;
      this.selected = this.normalize(item);
      this.persisted = true;
      this.savedSnapshot = this.snapshot(this.selected);
      this.error = "";
      this.message = "";
      this.selectedVersion = null;
      await this.loadVersions();
    },
    slug(value) {
      return String(value || "").trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
    },
    prepare(status) {
      const item = this.normalize(this.selected);
      item.id = item.id || `${this.slug(item.title || item.word) || this.contentType}-${Date.now().toString(36)}`;
      item.status = status;
      if (this.type === "words") item.level = this.level;
      return item;
    },
    validate(item, forPublish = false) {
      if (!item) return [];
      const issues = [];
      const add = (condition, message, level = forPublish ? "error" : "warning") => {
        if (condition) issues.push({ level, message });
      };
      if (this.type === "words") {
        if (!String(item.word || "").trim()) issues.push({ level: "error", message: "请填写英文单词" });
        add(!String(item.meaning || "").trim(), "发布前需要填写中文释义");
        add(!String(item.example || "").trim(), "发布前需要填写英文例句");
        if (forPublish && !String(item.phonetic || "").trim()) issues.push({ level: "warning", message: "建议补充音标" });
        if (forPublish && item.example && !String(item.exampleTranslation || "").trim()) issues.push({ level: "warning", message: "建议补充例句翻译" });
      } else {
        if (!String(item.title || "").trim()) issues.push({ level: "error", message: "请填写英文标题" });
        add(!String(item.chineseTitle || "").trim(), "发布前需要填写中文标题");
        add(!item.paragraphs?.length, "发布前至少需要一个正文段落");
        (item.paragraphs || []).forEach((paragraph, index) => {
          add(!String(paragraph.en || "").trim() || !String(paragraph.zh || "").trim(), `第 ${index + 1} 段双语正文不完整`);
        });
        if (forPublish && !String(item.intro || "").trim()) issues.push({ level: "warning", message: "建议补充文章导语" });
      }
      return issues;
    },
    async save(status) {
      if (!this.selected || this.busy) return;
      const item = this.prepare(status);
      const issues = this.validate(item, status === "published");
      const errors = issues.filter((issue) => issue.level === "error");
      if (errors.length) {
        this.selected.status = status;
        this.error = `还有 ${errors.length} 项必须修正后才能${status === "published" ? "发布" : "保存"}`;
        return;
      }
      if (status === "published" && issues.some((issue) => issue.level === "warning") &&
          !confirm(`还有 ${issues.filter((issue) => issue.level === "warning").length} 项建议未完成，确定发布吗？`)) return;
      this.busy = true;
      this.error = "";
      this.message = "";
      try {
        const base = this.type === "articles" ? "/api/admin/articles" : `/api/admin/words?level=${encodeURIComponent(this.level)}`;
        const path = this.persisted && this.type === "articles" ? `${base}/${encodeURIComponent(item.id)}`
          : this.persisted && this.type === "words" ? `/api/admin/words/${encodeURIComponent(item.id)}?level=${encodeURIComponent(this.level)}` : base;
        const response = await api(path, {
          method: this.persisted ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        const saved = this.type === "words" ? response.item : response;
        await this.load(saved.id);
        if (!this.items.some((entry) => entry.id === saved.id)) {
          this.selected = this.normalize(saved);
          this.persisted = true;
          this.savedSnapshot = this.snapshot(this.selected);
          await this.loadVersions();
        }
        this.message = status === "published" ? `${this.contentLabel}已发布，学习端现在可以看到。` : "草稿和版本快照已保存。";
      } catch (error) {
        this.error = error.message;
      } finally {
        this.busy = false;
      }
    },
    addParagraph() {
      this.selected.paragraphs.push({ en: "", zh: "" });
    },
    removeParagraph(index) {
      if (this.selected.paragraphs.length > 1) this.selected.paragraphs.splice(index, 1);
    },
    addWord() {
      this.selected.words.push(["", ""]);
    },
    removeKeyWord(index) {
      if (this.selected.words.length > 1) this.selected.words.splice(index, 1);
    },
    async remove() {
      if (!this.persisted || !this.selected || this.busy) return;
      const title = this.selected.title || this.selected.word;
      if (!confirm(`确定删除“${title}”吗？此操作会从学习内容中移除。`)) return;
      this.busy = true;
      try {
        const path = this.type === "articles"
          ? `/api/admin/articles/${encodeURIComponent(this.selected.id)}`
          : `/api/admin/words/${encodeURIComponent(this.selected.id)}?level=${encodeURIComponent(this.level)}`;
        await api(path, { method: "DELETE" });
        this.selected = null;
        this.persisted = false;
        this.versions = [];
        this.savedSnapshot = "";
        this.message = `${this.contentLabel}已删除。`;
        await this.load();
      } catch (error) {
        this.error = error.message;
      } finally {
        this.busy = false;
      }
    },
    async loadVersions() {
      this.versions = [];
      this.selectedVersion = null;
      if (!this.persisted || !this.selected?.id) return;
      try {
        const query = this.type === "words" ? `?level=${encodeURIComponent(this.level)}` : "";
        const data = await api(`/api/admin/content/versions/${this.contentType}/${encodeURIComponent(this.selected.id)}${query}`);
        this.versions = data.items || [];
      } catch (error) {
        this.error = error.message;
      }
    },
    chooseVersion(version) {
      this.selectedVersion = version;
    },
    async restoreVersion() {
      if (!this.selectedVersion || this.busy) return;
      if (!confirm(`确定恢复到版本 v${this.selectedVersion.version} 吗？当前内容会先保留在历史中。`)) return;
      const versionNumber = this.selectedVersion.version;
      this.busy = true;
      this.error = "";
      try {
        const query = this.type === "words" ? `?level=${encodeURIComponent(this.level)}` : "";
        const response = await api(`/api/admin/content/versions/${this.contentType}/${encodeURIComponent(this.selected.id)}/${this.selectedVersion.version}/restore${query}`, { method: "POST" });
        const restored = this.normalize(response.item);
        await this.load(restored.id);
        this.message = `已恢复到 v${versionNumber}，并生成新的回滚版本。`;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.busy = false;
      }
    },
    formatTime(value) {
      if (!value) return "未知时间";
      return value.slice(0, 16).replace("T", " ");
    },
    formatValue(key, value) {
      if (value == null || value === "") return "未填写";
      if (key === "status") return this.statusLabel(value);
      if (key === "paragraphs") {
        const text = value.map((item) => item.en || item.zh).filter(Boolean).join(" / ");
        return `${value.length} 段 · ${text.slice(0, 120) || "空段落"}`;
      }
      if (key === "words") {
        return `${value.length} 个 · ${value.map((item) => item[0]).filter(Boolean).join("、").slice(0, 120) || "未填写"}`;
      }
      if (Array.isArray(value)) return `${value.length} 项`;
      return String(value).slice(0, 180);
    },
  },
  template: `
    <section class="workbench lifecycle-workbench">
      <header class="workbench-top lifecycle-hero">
        <div><span>CONTENT LIFECYCLE STUDIO</span><h2>内容工作台</h2><p>编辑、审核、发布和回滚，每一次修改都有记录。</p></div>
        <div class="lifecycle-metrics"><div><b>{{ total }}</b><small>当前结果</small></div><div><b>{{ publishedCount }}</b><small>已发布</small></div><div><b>{{ draftCount }}</b><small>草稿</small></div></div>
      </header>

      <div v-if="error" class="error-banner">{{ error }}<button aria-label="关闭" @click="error=''">×</button></div>
      <div v-if="message" class="lifecycle-notice">{{ message }}<button aria-label="关闭" @click="message=''">×</button></div>

      <div class="workbench-tabs lifecycle-toolbar">
        <div class="lifecycle-type-tabs">
          <button :class="{active:type==='articles'}" @click="switchType('articles')">文章管理</button>
          <button :class="{active:type==='words'}" @click="switchType('words')">单词管理</button>
        </div>
        <select v-if="type==='words'" :value="level" aria-label="词库" @change="switchLevel($event.target.value)"><option value="primary">小学词库</option><option value="middle">初中词库</option></select>
        <div class="lifecycle-search"><button type="button" aria-label="搜索" title="搜索" @click="load()">⌕</button><input v-model="query" @keyup.enter="load()" placeholder="搜索标题、单词或中文"></div>
        <div class="lifecycle-status-filter">
          <button :class="{active:statusFilter==='all'}" @click="setStatusFilter('all')">全部</button>
          <button :class="{active:statusFilter==='draft'}" @click="setStatusFilter('draft')">草稿</button>
          <button :class="{active:statusFilter==='published'}" @click="setStatusFilter('published')">已发布</button>
        </div>
        <button class="lifecycle-search-button" @click="load()">搜索</button>
        <button class="primary" @click="create">＋ 新建{{ contentLabel }}</button>
      </div>

      <div class="workbench-grid lifecycle-grid">
        <aside class="content-list lifecycle-list">
          <div class="content-count"><b>{{ contentLabel }}库</b><span>{{ total }} 条</span></div>
          <button v-for="item in items" :key="item.id" :class="{active:selected?.id===item.id&&persisted}" @click="edit(item)">
            <span class="lifecycle-list-status"><em :class="effectiveStatus(item.status)">{{ statusLabel(item.status) }}</em><time>{{ item.updatedAt ? item.updatedAt.slice(0,10) : '系统内容' }}</time></span>
            <strong>{{ item.title || item.word }}</strong>
            <span>{{ item.chineseTitle || item.meaning || '尚未填写中文内容' }}</span>
            <small>{{ item.grade || '未设年级' }} · {{ item.topic || item.pos || '未设分类' }}</small>
          </button>
          <p v-if="loading" class="empty">正在加载…</p>
          <p v-else-if="!items.length" class="empty">暂无符合条件的内容</p>
        </aside>

        <main v-if="selected" class="editor-panel lifecycle-editor">
          <div class="editor-actions lifecycle-editor-actions">
            <div class="lifecycle-save-state"><i :class="{dirty:hasChanges}"></i><span><b>{{ hasChanges ? '有未保存修改' : '所有修改已保存' }}</b><small v-if="selected.updatedAt">{{ selected.updatedBy || 'system' }} · {{ formatTime(selected.updatedAt) }}</small></span></div>
            <div>
              <span :class="['lifecycle-status-badge',effectiveStatus(selected.status)]">{{ statusLabel(selected.status) }}</span>
              <button class="danger" :disabled="!persisted||busy" @click="remove">删除</button>
              <button :disabled="busy" @click="save('draft')">{{ busy ? '保存中…' : '保存草稿' }}</button>
              <button class="primary" :disabled="busy" @click="save('published')">发布</button>
            </div>
          </div>

          <div v-if="validationItems.length" class="lifecycle-validation">
            <span>发布检查</span>
            <p v-for="(issue,index) in validationItems" :key="index" :class="issue.level"><i>{{ issue.level==='error'?'!':'·' }}</i>{{ issue.message }}</p>
          </div>

          <form v-if="type==='words'" class="content-form lifecycle-form" @submit.prevent="save('draft')" @input="error=''" @change="error=''">
            <div class="lifecycle-form-heading"><span>WORD CONTENT</span><h3>词汇信息</h3></div>
            <label>ID<input v-model.trim="selected.id" :disabled="persisted" placeholder="留空将自动生成"></label>
            <label>英文单词 *<input v-model.trim="selected.word" class="lifecycle-primary-input" required></label>
            <label>中文释义 *<input v-model.trim="selected.meaning"></label>
            <label>音标<input v-model.trim="selected.phonetic"></label>
            <label>词性<input v-model.trim="selected.pos" placeholder="n. / v. / adj."></label>
            <label>主题<input v-model.trim="selected.topic"></label>
            <label>年级<input v-model.trim="selected.grade"></label>
            <label>教材单元<input v-model.trim="selected.unit"></label>
            <label class="full">英文例句 *<textarea v-model="selected.example" rows="4"></textarea></label>
            <label class="full">例句翻译<textarea v-model="selected.exampleTranslation" rows="3"></textarea></label>
          </form>

          <form v-else class="content-form article-editor lifecycle-form" @submit.prevent="save('draft')" @input="error=''" @change="error=''">
            <div class="lifecycle-form-heading"><span>ARTICLE CONTENT</span><h3>文章信息</h3></div>
            <label>ID<input v-model.trim="selected.id" :disabled="persisted" placeholder="留空将按英文标题生成"></label>
            <label>英文标题 *<input v-model.trim="selected.title" class="lifecycle-primary-input" required></label>
            <label>中文标题 *<input v-model.trim="selected.chineseTitle"></label>
            <label>年级<select v-model="selected.grade"><option>七年级</option><option>八年级</option><option>九年级</option></select></label>
            <label>难度<select v-model="selected.difficulty"><option>基础</option><option>进阶</option><option>挑战</option></select></label>
            <label>主题<input v-model.trim="selected.topic"></label>
            <label>合集<input v-model.trim="selected.collection"></label>
            <label>阅读分钟<input v-model.number="selected.minutes" type="number" min="1"></label>
            <label class="full">导语<textarea v-model="selected.intro"></textarea></label>
            <fieldset class="full"><legend><span>双语段落</span><button type="button" @click="addParagraph">＋ 添加段落</button></legend><div v-for="(paragraph,index) in selected.paragraphs" :key="index" class="paragraph-editor lifecycle-paragraph"><b>{{ index+1 }}</b><textarea v-model="paragraph.en" required placeholder="English paragraph"></textarea><textarea v-model="paragraph.zh" required placeholder="中文翻译"></textarea><button type="button" title="删除段落" @click="removeParagraph(index)">×</button></div></fieldset>
            <fieldset class="full"><legend><span>重点词汇</span><button type="button" @click="addWord">＋ 添加词汇</button></legend><div v-for="(word,index) in selected.words" :key="index" class="keyword-editor"><input v-model="word[0]" placeholder="word"><input v-model="word[1]" placeholder="中文释义"><button type="button" title="删除词汇" @click="removeKeyWord(index)">×</button></div></fieldset>
            <label class="full">英文佳句<input v-model="selected.quote"></label>
            <label class="full">佳句翻译<input v-model="selected.quoteZh"></label>
          </form>
        </main>

        <aside v-if="selected" class="lifecycle-history">
          <header><span>VERSION HISTORY</span><h3>版本历史</h3><small>{{ versions.length }} 个快照</small></header>
          <div v-if="versions.length" class="lifecycle-timeline">
            <button v-for="version in versions" :key="version.id" :class="{active:selectedVersion?.id===version.id}" @click="chooseVersion(version)">
              <i></i><span><b>v{{ version.version }} · {{ actionLabel(version.action) }}</b><small>{{ statusLabel(version.status) }} · {{ version.createdBy }}</small><time>{{ formatTime(version.createdAt) }}</time></span>
            </button>
          </div>
          <div v-else class="lifecycle-history-empty"><b>还没有历史快照</b><p>首次保存后会自动记录当前版本；编辑已有系统内容时也会保留原始基线。</p></div>

          <section v-if="selectedVersion" class="lifecycle-diff">
            <div><span>COMPARE</span><h4>v{{ selectedVersion.version }} 与当前内容</h4></div>
            <p v-if="!diffEntries.length" class="lifecycle-no-diff">该版本与当前编辑内容一致</p>
            <article v-for="entry in diffEntries" :key="entry.key"><b>{{ entry.label }}</b><div><span>历史</span><p>{{ entry.before }}</p></div><div><span>当前</span><p>{{ entry.after }}</p></div></article>
            <button class="lifecycle-restore" :disabled="busy||!persisted" @click="restoreVersion">↶ 恢复到 v{{ selectedVersion.version }}</button>
            <small>恢复前的当前内容仍会保留在版本历史中</small>
          </section>
          <div v-else-if="versions.length" class="lifecycle-history-hint">选择一个历史版本查看字段差异</div>
        </aside>

        <div v-else class="editor-empty lifecycle-welcome"><span>{{ type==='articles'?'AR':'Aa' }}</span><h3>选择一条内容开始编辑</h3><p>也可以创建新内容并先保存为草稿。</p><button class="primary" @click="create">＋ 新建{{ contentLabel }}</button></div>
      </div>
    </section>
  `,
};
