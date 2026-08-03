import { api } from "../api.js";

export default {
  emits: ["navigate"],
  data: () => ({
    tasks: [],
    stats: {},
    batches: [],
    schedules: [],
    capabilities: {},
    events: [],
    selected: null,
    draft: null,
    type: "article",
    title: "",
    engine: "",
    urls: "",
    files: [],
    busy: false,
    error: "",
    message: "",
    jsonText: "",
    tab: "tasks",
    timer: null,
    previewOpen: false,
    previewData: null,
    jsonError: "",
    schedule: {
      name: "",
      type: "article",
      sourceUrls: "",
      engine: "",
      intervalHours: 24,
      enabled: true,
    },
  }),
  mounted() {
    this.refresh();
    this.timer = setInterval(() => this.refresh(false), 4000);
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  methods: {
    async refresh(reselect = true) {
      try {
        const [t, o] = await Promise.all([
          api("/api/admin/factory/tasks"),
          api("/api/admin/factory/overview"),
        ]);
        this.tasks = t.items;
        this.stats = o.stats;
        this.batches = o.batches || [];
        this.schedules = o.schedules || [];
        this.capabilities = o.capabilities || {};
        if (reselect && this.selected) {
          const latest = this.tasks.find((x) => x.id === this.selected.id);
          if (latest) await this.select(latest);
        }
      } catch (e) {
        this.error = e.message;
      }
    },
    chooseFiles(e) {
      this.files = [...e.target.files];
    },
    async create() {
      this.busy = true;
      this.error = "";
      try {
        const f = new FormData();
        f.append("type", this.type);
        f.append("title", this.title);
        f.append("engine", this.engine);
        this.urls
          .split("\n")
          .filter(Boolean)
          .forEach((x) => f.append("sourceUrl", x.trim()));
        this.files.forEach((x) => f.append("files", x));
        this.selected = await api("/api/admin/factory/tasks", {
          method: "POST",
          body: f,
        });
        this.title = "";
        this.urls = "";
        this.files = [];
        this.message = "任务已进入后台队列";
        await this.refresh();
      } catch (e) {
        this.error = e.message;
      } finally {
        this.busy = false;
      }
    },
    async select(t) {
      this.selected = t;
      this.draft = null;
      this.events = (
        await api(`/api/admin/factory/tasks/${t.id}/events`)
      ).items;
      if (t.draftId) {
        this.draft = await api("/api/admin/factory/drafts/" + t.draftId);
        this.jsonText = JSON.stringify(this.draft.rawJson, null, 2);
      }
    },
    async retry() {
      this.busy = true;
      try {
        await api(`/api/admin/factory/tasks/${this.selected.id}/retry`, {
          method: "POST",
        });
        this.message = "已重新提交";
        await this.refresh();
      } catch (e) {
        this.error = e.message;
      } finally {
        this.busy = false;
      }
    },
    parseJson() {
      try {
        this.previewData = JSON.parse(this.jsonText);
        this.jsonError = "";
        return this.previewData;
      } catch (e) {
        this.jsonError = "JSON 格式错误：" + e.message;
        return null;
      }
    },
    formatJson() {
      const value = this.parseJson();
      if (value) this.jsonText = JSON.stringify(value, null, 2);
    },
    openPreview() {
      if (this.parseJson()) this.previewOpen = true;
    },
    questionCount(p) {
      return (p?.sections || []).reduce(
        (n, s) => n + (s.questions || []).length,
        0,
      );
    },
    goPublished() {
      this.$emit("navigate", this.selected?.type === "exam" ? "exams" : "reading");
    },
    async saveDraft() {
      try {
        const parsed = this.parseJson();
        if (!parsed) return;
        this.draft.rawJson = parsed;
        this.draft = await api(`/api/admin/factory/drafts/${this.draft.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.draft),
        });
        this.jsonText = JSON.stringify(this.draft.rawJson, null, 2);
        this.message = "草稿已保存并重新校验";
      } catch (e) {
        this.error = e.message;
      }
    },
    async publish() {
      if (!confirm("确认审核通过并导入正式数据库吗？")) return;
      this.busy = true;
      this.error = "";
      try {
        const result = await api(`/api/admin/factory/drafts/${this.draft.id}/publish`, {
          method: "POST",
        });
        this.draft.reviewStatus = "published";
        this.selected.status = "published";
        this.message = result.message || "\u5ba1\u6838\u53d1\u5e03\u6210\u529f\uff0c\u5185\u5bb9\u5df2\u5199\u5165\u6b63\u5f0f\u6570\u636e\u5e93";
        await this.refresh();
      } catch (e) {
        this.error = e.message;
      } finally {
        this.busy = false;
      }
    },
    async rollback(b) {
      if (!confirm("确认回滚该导入批次吗？")) return;
      try {
        await api(`/api/admin/factory/batches/${b.id}/rollback`, {
          method: "POST",
        });
        this.message = "回滚完成";
        await this.refresh();
      } catch (e) {
        this.error = e.message;
      }
    },
    async saveSchedule() {
      try {
        const body = {
          ...this.schedule,
          sourceUrls: this.schedule.sourceUrls
            .split("\n")
            .filter(Boolean)
            .map((x) => x.trim()),
        };
        await api("/api/admin/factory/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        this.message = "定时采集计划已保存";
        this.schedule = {
          name: "",
          type: "article",
          sourceUrls: "",
          engine: "",
          intervalHours: 24,
          enabled: true,
        };
        await this.refresh();
      } catch (e) {
        this.error = e.message;
      }
    },
    statusLabel(s) {
      return (
        {
          queued: "排队中",
          processing: "处理中",
          review: "待审核",
          failed: "失败",
          completed: "已完成",
          cancelled: "已取消",
        }[s] || s
      );
    },
  },
  template: `<section class="factory-page"><div class="factory-hero"><div><span>ADMIN AGENT WORKFLOW</span><h2>智能内容中心</h2><p>采集、识别、结构化、审核、发布和回滚的一体化流水线。</p></div><button class="factory-refresh" @click="refresh">刷新状态</button></div><div class="factory-stats"><article><b>{{stats.tasks||0}}</b><span>全部任务</span></article><article><b>{{stats.processing||0}}</b><span>处理中</span></article><article><b>{{stats.review||0}}</b><span>待审核</span></article><article><b>{{stats.failed||0}}</b><span>失败</span></article><article><b>{{stats.published||0}}</b><span>发布批次</span></article></div><div class="factory-capabilities"><span v-for="(ok,key) in capabilities" :class="{ok}"><i>{{ok?'✓':'!'}}</i>{{key}}</span></div><div v-if="error" class="error-banner">{{error}} <button @click="error=''">关闭</button></div><div v-if="message" class="agent-notice success">{{message}}</div><nav class="factory-tabs"><button :class="{active:tab==='tasks'}" @click="tab='tasks'">任务流水线</button><button :class="{active:tab==='schedules'}" @click="tab='schedules'">定时采集</button><button :class="{active:tab==='batches'}" @click="tab='batches'">导入与回滚</button></nav><div v-if="tab==='tasks'" class="factory-layout"><aside><div class="factory-create"><h3>创建智能任务</h3><label>内容类型<select v-model="type"><option value="article">英语文章</option><option value="exam">英语试卷</option></select></label><label>任务标题<input v-model="title"></label><label>处理引擎<select v-model="engine"><option value="">系统默认</option><option value="codex-core">Codex Core</option><option value="claude-code">Claude Code</option></select></label><label>公开来源网址<textarea v-model="urls" rows="3" placeholder="每行一个 HTTP/HTTPS 地址"></textarea></label><label class="factory-drop">上传素材<input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.docx,.mp3,.wav,.m4a,.mp4,.mov,.webm" @change="chooseFiles"><span>PDF / Word / 图片 / 音频 / 视频</span><small v-if="files.length">已选择 {{files.length}} 个文件</small></label><button class="primary" :disabled="busy||!title||(!urls.trim()&&!files.length)" @click="create">创建并自动处理</button></div><div class="factory-task-list"><button v-for="t in tasks" :class="[{active:selected?.id===t.id},t.status]" @click="select(t)"><span class="factory-task-title"><b>{{t.title}}</b><em>{{statusLabel(t.status)}}</em></span><span>{{t.currentStep}} · {{t.progress}}%</span><i><u :style="{width:t.progress+'%'}"></u></i></button></div></aside><main v-if="selected"><header class="factory-detail-head"><div><span>{{selected.type==='article'?'文章任务':'试卷任务'}} · {{selected.engine}}</span><h3>{{selected.title}}</h3><p>创建于 {{selected.createdAt?.replace('T',' ').slice(0,19)}} · 尝试 {{selected.attempts||0}} 次</p></div><button v-if="selected.status==='failed'" class="primary" @click="retry">重新处理</button></header><div class="factory-progress"><i :style="{width:selected.progress+'%'}"></i></div><div class="factory-assets"><h4>来源素材</h4><div><article v-for="f in selected.files"><b>{{f.name}}</b><small>{{Math.ceil(f.size/1024)}} KB · SHA256 {{f.sha256?.slice(0,12)}}…</small></article><article v-for="u in selected.sourceUrls"><b>网页来源</b><small>{{u}}</small></article></div></div><div class="factory-timeline"><h4>处理时间线</h4><ol><li v-for="e in events" :class="e.level"><i></i><div><b>{{e.message}}</b><small>{{e.step}} · {{e.createdAt?.replace('T',' ').slice(0,19)}}</small></div><em>{{e.progress}}%</em></li></ol></div><div v-if="draft" class="factory-review"><div class="factory-review-toolbar"><div><b>下一步：校对内容并预览，确认无误后发布</b><span>版本 {{draft.version}} · 置信度 {{Math.round((draft.confidence||0)*100)}}%</span></div><button @click="formatJson">格式化 JSON</button><button @click="saveDraft">① 保存校对</button><button @click="openPreview">② 预览效果</button><button v-if="draft.reviewStatus!=='published'" class="primary" :disabled="busy||draft.validation.some(x=>x.level==='error')" @click="publish">{{busy?'Publishing...':'Publish'}}</button><span v-else class="factory-published-badge">&#10003; Published successfully</span><button v-if="draft.reviewStatus==='published'" class="factory-view-published" @click="goPublished">View published {{selected.type==='exam'?'exam':'article'}}</button></div><div v-if="jsonError" class="factory-json-error">{{jsonError}}</div><div class="factory-review-head"><div><h4>审核草稿</h4><p>版本 {{draft.version}} · 置信度 {{Math.round((draft.confidence||0)*100)}}%</p></div><span>{{draft.reviewStatus}}</span></div><section><h4>提取文本</h4><textarea v-model="draft.extractedText" rows="22"></textarea></section><section><h4>结构化 JSON</h4><textarea v-model="jsonText" rows="22" class="json-editor"></textarea></section><div v-if="previewOpen&&previewData" class="factory-inline-preview"><header><div><b>发布效果预览</b><span>{{selected.type==='exam'?questionCount(previewData)+' 道题':(previewData.paragraphs?.length||0)+' 个段落'}}</span></div><button @click="previewOpen=false">关闭预览</button></header><div v-if="selected.type==='exam'" class="factory-exam-preview"><h1>{{previewData.title}}</h1><p>{{previewData.region}} · {{previewData.durationMinutes}} 分钟 · {{previewData.totalScore}} 分</p><section v-for="section in previewData.sections"><h2>{{section.title}}</h2><article v-for="q in section.questions"><b>{{q.id}} · {{q.score}} 分</b><div v-if="q.passage" class="preview-passage">{{q.passage}}</div><p>{{q.prompt}}</p><ol v-if="q.options?.length"><li v-for="(o,i) in q.options">{{String.fromCharCode(65+i)}}. {{o}}</li></ol><small>答案：{{q.answer||'待核验'}} · {{q.explanation}}</small></article></section></div><div v-else class="factory-article-preview"><h1>{{previewData.title}}</h1><h2>{{previewData.chineseTitle}}</h2><p class="intro">{{previewData.intro}}</p><article v-for="p in previewData.paragraphs"><p>{{p.en}}</p><p>{{p.zh}}</p></article></div></div><div class="factory-validation"><h4>发布前检查</h4><p v-if="!draft.validation.length" class="ok">✓ 所有规则校验通过</p><p v-for="v in draft.validation" :class="v.level"><b>{{v.code}}</b> {{v.message}}</p></div><div class="factory-actions"><button @click="saveDraft">保存并重新校验</button><button v-if="draft.reviewStatus!=='published'" class="primary" :disabled="busy||draft.validation.some(x=>x.level==='error')" @click="publish">{{busy?'Publishing...':'Publish'}}</button><span v-else class="factory-published-badge">&#10003; Published successfully</span><button v-if="draft.reviewStatus==='published'" class="factory-view-published" @click="goPublished">View published {{selected.type==='exam'?'exam':'article'}}</button></div></div><div v-else class="factory-empty">后台处理中，页面会自动刷新</div></main><div v-else class="factory-empty">从左侧选择一个任务</div></div><section v-else-if="tab==='schedules'" class="factory-schedules"><div class="factory-create"><h3>新建定时采集</h3><label>计划名称<input v-model="schedule.name"></label><label>类型<select v-model="schedule.type"><option value="article">文章</option><option value="exam">试卷</option></select></label><label>引擎<select v-model="schedule.engine"><option value="">系统默认</option><option value="codex-core">Codex Core</option><option value="claude-code">Claude Code</option></select></label><label>来源地址<textarea v-model="schedule.sourceUrls" rows="5" placeholder="每行一个"></textarea></label><label>执行间隔（小时）<input type="number" min="1" v-model.number="schedule.intervalHours"></label><label><input type="checkbox" v-model="schedule.enabled"> 启用计划</label><button class="primary" @click="saveSchedule">保存计划</button></div><div class="factory-schedule-list"><article v-for="s in schedules"><b>{{s.name}}</b><span>{{s.type}} · 每 {{s.intervalHours}} 小时 · {{s.enabled?'已启用':'已停用'}}</span><small>下次运行：{{s.nextRunAt||'保存后计算'}}</small></article></div></section><section v-else class="factory-batches"><article v-for="b in batches"><div><b>{{b.contentType==='article'?'文章':'试卷'}} · {{b.contentId}}</b><span>{{b.publishedBy}} 发布于 {{b.publishedAt?.replace('T',' ').slice(0,19)}}</span></div><em v-if="b.rolledBackAt">已回滚</em><button v-else :disabled="!b.snapshot" @click="rollback(b)">{{b.snapshot?'回滚到旧版本':'首次导入'}}</button></article><p v-if="!batches.length" class="factory-empty">还没有正式导入记录</p></section></section>`,
};
