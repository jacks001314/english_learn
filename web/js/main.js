import { api, postJSON } from './api.js';
import { speak } from './speech.js?v=20260905-ipa-r3';
import HomeView from './components/HomeView.js';
import LearnView from './components/LearnView.js?v=20260926-pos-r1';
import MeaningPracticeView from './components/MeaningPracticeView.js?v=20261001-meaning-r2';
import QuizView from './components/QuizView.js';
import ReportView from './components/ReportView.js';
import MistakesView from './components/MistakesView.js';
import ReviewView from './components/ReviewView.js';
import SettingsView from './components/SettingsView.js';
import CategoryView from './components/CategoryView.js';
import ContentStatusView from './components/ContentStatusView.js';
import ReadingView from './components/ReadingView.js?v=20260727-smart-learning-r3';
import AuthView from './components/AuthView.js';
import AdminView from './components/AdminView.js';
import SecurityView from './components/SecurityView.js';
import AdminOverview from './components/AdminOverview.js';
import ContentWorkbench from './components/ContentWorkbench.js?v=20260727-content-lifecycle-r3';
import ExamView from './components/ExamView.js';
import ExamWorkbench from './components/ExamWorkbench.js';
import AgentAssistant from './components/AgentAssistant.js';
import AgentAdminView from './components/AgentAdminView.js';
import ContentFactoryView from './components/ContentFactoryView.js';
import HomeworkView from './components/HomeworkView.js';
import HomeworkAdminView from './components/HomeworkAdminView.js?v=20260727-adaptive-r1';
import SmartLearningView from './components/SmartLearningView.js?v=20260928-grammar-p3-r4';
import CourseView from './components/CourseView.js?v=20260927-audio-r8';
import PhoneticsView from './components/PhoneticsView.js?v=20260905-ipa-r5';
import GrammarView from './components/GrammarView.js?v=20260928-grammar-p3-r4';
import TongbuView from './components/TongbuView.js?v=20260926-tongbu-r2';
import { resolveTopicId } from './grammar/index.js?v=20260928-grammar-p3-r4';

const { createApp } = Vue;
const knownViews = new Set(['home','smart','learn','meaning-en-zh','meaning-zh-en','meaning-listen','categories','course','grammar','phonetics','reading','exams','tongbu','quiz','review','homework','report','mistakes','settings','security','content','admin','workbench','exam-workbench','agent-admin','factory','homework-admin']);
const adminViews = new Set(['content','admin','workbench','exam-workbench','agent-admin','factory','homework-admin']);
// hash 形如 #<view> 或 #<view>/<arg1>/<arg2>（例如 #grammar/g-pronouns/lecture-3）
const locationParts = () => {
  const value = window.location.hash.replace(/^#\/?/, '');
  const [view, ...args] = value.split('/').filter(Boolean);
  return { view: knownViews.has(view) ? view : 'home', args };
};
const viewFromLocation = () => locationParts().view;
// 生成跳转 hash：当前 view 已在目标 view 上时保留参数（避免点侧栏把专题上下文冲掉）
const hashFor = (view) => {
  const cur = locationParts();
  return cur.view === view && cur.args.length ? '#' + view + '/' + cur.args.join('/') : '#' + view;
};
const learningViews = new Set(['smart', 'learn', 'meaning-en-zh', 'meaning-zh-en', 'meaning-listen', 'quiz', 'review', 'reading', 'exams']);
const freshQuizSession = () => ({ answered: 0, correct: 0, byType: {}, history: [] });

createApp({
  components: { HomeView, SmartLearningView, CourseView, GrammarView, PhoneticsView, LearnView, MeaningPracticeView, QuizView, ReportView, MistakesView, ReviewView, SettingsView, CategoryView, ContentStatusView, ReadingView, AuthView, AdminView, SecurityView, AdminOverview, ContentWorkbench, ExamView, ExamWorkbench, AgentAssistant, AgentAdminView, ContentFactoryView, HomeworkView, HomeworkAdminView, TongbuView },
  data: () => ({
    activeView: viewFromLocation(), workspaceMode: adminViews.has(viewFromLocation()) ? 'admin' : 'learn', level: 'primary', query: '', topic: '', grade: '', unit: '', letter: '', partOfSpeech: '', wordSort: 'word-asc', wordSortSeed: 0, page: 1, size: 12, total: 0,
    facets: { topics: [], grades: [], units: [] },
    words: [], stats: { seen: 0, mastered: 0, accuracy: 0, mistakes: 0 },
    progress: {}, quiz: null, quizType: 'en-zh', quizHint: '', quizAnswered: false, quizSelectedAnswer: '', quizCorrectAnswer: '',
    quizSession: freshQuizSession(), quizFeedbackCorrect: false, quizResumed: false, quizTargetWordId: '',
    report: { todayLearned: 0, todayPractices: 0, reviewDue: 0, mistakes: 0, recent: [], weakest: [] },
    mistakes: [], reviews: [], reviewSummary: { total: 0, completed: 0, goal: 10 }, reviewBusy: false,
    settings: { dailyReviewGoal: 10 }, settingsBusy: false, contentStatus: {files:[],complete:false}, error: '', currentUser: null, authChecked: false,
    sidebarCollapsed: false, mobileSidebarOpen: false, examInProgress: false,
    learningSession: null, selectedWord: null, continuousLearning: false, mistakeFocusWord: null, readingTargetArticleId: '', grammarTargetId: viewFromLocation() === 'grammar' ? (locationParts().args[0] || '') : ''
  }),
  computed: {
    pages() { return Math.max(1, Math.ceil(this.total / this.size)); },
    masteredIds() {
      return new Set(Object.entries(this.progress).filter(([, value]) => value.mastered).map(([key]) => key));
    },
    selectedWordProgress() {
      if (!this.selectedWord) return {};
      return this.progress[`${this.selectedWord.level}:${String(this.selectedWord.id).toLowerCase()}`] || {};
    }
  },
  watch: {
    level() { this.page = 1; this.topic = ''; this.grade = ''; this.unit = ''; this.letter = ''; this.partOfSpeech = ''; this.loadFacets(); this.loadWords(); if (this.activeView === 'review') this.loadReviews(); }
  },
  methods: {
    speak,
    async run(task) {
      this.error = '';
      try { await task(); } catch (error) { this.error = error.message || '操作失败，请稍后重试'; }
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      try { localStorage.setItem('english-learn-sidebar-collapsed', this.sidebarCollapsed ? '1' : '0'); } catch (_) {}
    },
    toggleMobileSidebar() { this.mobileSidebarOpen = !this.mobileSidebarOpen; },
    learningStateKey() { return `english-learn-learning-state-v1:${this.currentUser?.id || 'anonymous'}`; },
    quizStateKey() { return `english-learn-quiz-session-v1:${this.currentUser?.id || 'anonymous'}`; },
    restoreLearningState() {
      try {
        const state = JSON.parse(localStorage.getItem(this.learningStateKey()) || 'null');
        this.learningSession = state?.session || null;
        this.continuousLearning = !!state?.continuousLearning;
      } catch (_) {
        this.learningSession = null;
      }
    },
    persistLearningState() {
      if (!this.currentUser) return;
      try {
        localStorage.setItem(this.learningStateKey(), JSON.stringify({
          session: this.learningSession,
          continuousLearning: this.continuousLearning
        }));
      } catch (_) {}
    },
    recordLearningSession(view, details = {}) {
      if (!this.currentUser || !learningViews.has(view)) return;
      this.learningSession = {
        ...(this.learningSession || {}),
        view,
        level: details.level || this.level,
        word: details.word || (view === 'learn' ? this.selectedWord : null),
        quizAnswered: view === 'quiz' ? this.quizSession.answered : undefined,
        updatedAt: new Date().toISOString(),
        ...details
      };
      this.persistLearningState();
    },
    handleNavigate(target) {
      if (typeof target === 'string') {
        if (target === 'mistakes') this.mistakeFocusWord = null;
        if (target === 'reading') this.readingTargetArticleId = '';
        if (target === 'grammar') this.grammarTargetId = '';
        this.selectView(target);
        return;
      }
      const view = target?.view || 'home';
      if (target?.level) this.level = target.level;
      if (view === 'learn' && target?.word) {
        this.openWord(target.word);
        return;
      }
      if (view === 'mistakes') {
        this.mistakeFocusWord = target?.word || null;
      }
      if (view === 'reading') {
        this.readingTargetArticleId = target?.contentId || '';
      }
      if (view === 'grammar') {
        this.grammarTargetId = target?.contentId || '';
        this.grammarTargetId = resolveTopicId(this.grammarTargetId) || this.grammarTargetId;
      }
      if (view === 'quiz' && target?.word) {
        this.startWordQuiz(target.word);
        return;
      }
      this.selectView(view, { preserveMistakeFocus: view === 'mistakes' && !!target?.word });
    },
    openWord(payload) {
      const wrapped = !!payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'preserveList');
      const word = wrapped ? payload.word : payload;
      const preserveList = wrapped && !!payload.preserveList;
      if (!word) return;
      if (!preserveList) {
        this.level = word.level || this.level;
        this.query = word.word || '';
        this.topic = ''; this.grade = ''; this.unit = ''; this.letter = ''; this.partOfSpeech = '';
        this.page = 1;
      }
      this.selectedWord = word;
      if (this.activeView !== 'learn' || !preserveList) this.selectView('learn');
      this.recordLearningSession('learn', { level: this.level, word });
    },
    closeWord() { this.selectedWord = null; },
    setContinuousLearning(value) {
      this.continuousLearning = !!value;
      if (this.continuousLearning && !this.selectedWord && this.words.length) {
        this.openWord({ word: this.words[0], preserveList: true });
      }
      this.persistLearningState();
    },
    startWordQuiz(word) {
      if (!word) return;
      this.level = word.level || this.level;
      this.quizTargetWordId = word.id;
      this.quizSession = freshQuizSession();
      this.quizAnswered = false;
      this.quizResumed = false;
      try { localStorage.removeItem(this.quizStateKey()); } catch (_) {}
      this.selectView('quiz', { freshQuiz: true });
    },
    restoreQuizDraft() {
      try {
        const draft = JSON.parse(localStorage.getItem(this.quizStateKey()) || 'null');
        const age = Date.now() - new Date(draft?.updatedAt || 0).getTime();
        if (!draft?.quiz || !draft?.session || age < 0 || age > 24 * 60 * 60 * 1000) return false;
        this.level = draft.level || this.level;
        this.quizType = draft.type || 'en-zh';
        this.quiz = draft.quiz;
        this.quizHint = draft.hint || '';
        this.quizAnswered = !!draft.answered;
        this.quizSelectedAnswer = draft.selectedAnswer || '';
        this.quizCorrectAnswer = draft.correctAnswer || '';
        this.quizFeedbackCorrect = !!draft.feedbackCorrect;
        this.quizSession = { ...freshQuizSession(), ...draft.session, history: draft.session.history || [] };
        this.quizResumed = true;
        this.recordLearningSession('quiz', { level: this.level, quizAnswered: this.quizSession.answered });
        return true;
      } catch (_) {
        return false;
      }
    },
    persistQuizDraft() {
      if (!this.currentUser || !this.quiz) return;
      if (this.quizSession.answered >= 10) {
        try { localStorage.removeItem(this.quizStateKey()); } catch (_) {}
        this.recordLearningSession('quiz', { level: this.level, quizAnswered: 10, completed: true });
        return;
      }
      const draft = {
        level: this.level, type: this.quizType, quiz: this.quiz,
        hint: this.quizHint, answered: this.quizAnswered,
        selectedAnswer: this.quizSelectedAnswer, correctAnswer: this.quizCorrectAnswer,
        feedbackCorrect: this.quizFeedbackCorrect, session: this.quizSession,
        updatedAt: new Date().toISOString()
      };
      try { localStorage.setItem(this.quizStateKey(), JSON.stringify(draft)); } catch (_) {}
      this.recordLearningSession('quiz', { level: this.level, quizAnswered: this.quizSession.answered, completed: false });
    },
    enterQuiz(fresh = false) {
      if (!fresh && this.restoreQuizDraft()) return;
      this.loadQuiz();
    },
    async loadStats() { this.stats = await api('/api/stats'); },
    async loadProgress() { this.progress = await api('/api/progress'); },
    async loadHomeData() {
      await this.run(async () => {
        const [stats, report, reviews, progress] = await Promise.all([
          api('/api/stats'), api('/api/dashboard'), api(`/api/review/today?level=${this.level}`), api('/api/progress')
        ]);
        this.stats = stats;
        this.report = report;
        this.progress = progress;
        this.reviews = reviews.items;
        this.reviewSummary = { total: reviews.total, completed: reviews.completed, goal: reviews.goal };
      });
    },
    async loadWords() {
      await this.run(async () => {
        const params = new URLSearchParams({ level: this.level, page: this.page, q: this.query.trim(), topic: this.topic, grade: this.grade, unit: this.unit, letter: this.letter, pos: this.partOfSpeech, sort: this.wordSort });
        if (this.wordSort === 'random') params.set('seed', this.wordSortSeed);
        const data = await api(`/api/words?${params}`);
        this.words = data.items; this.total = data.total; this.size = data.size;
        if (this.continuousLearning && !this.selectedWord && this.words.length) this.selectedWord = this.words[0];
      });
    },
    async loadFacets() { await this.run(async () => { this.facets = await api(`/api/word-facets?level=${this.level}`); }); },
    search() { this.page = 1; this.loadWords(); },
    setWordSort(value) {
      this.wordSort = value;
      // Re-picking 随机打乱 deals a fresh order; pages stay stable thanks to the seed.
      if (value === 'random') this.wordSortSeed = Math.floor(Math.random() * 1000000000);
      this.search();
    },
    selectCategory(category) { this.topic = category.topic || ''; this.grade = category.grade || ''; this.unit = ''; this.letter = category.letter || ''; this.partOfSpeech = category.pos || ''; this.selectView('learn'); this.search(); },
    clearCategory() { this.topic = ''; this.grade = ''; this.unit = ''; this.letter = ''; this.partOfSpeech = ''; this.search(); },
    changePage(offset) { this.page = Math.min(this.pages, Math.max(1, this.page + offset)); this.loadWords(); },
    async markWord(payload) {
      const { word, mastered } = payload;
      await this.run(async () => {
        await postJSON(`/api/progress/${encodeURIComponent(word.id)}?level=${word.level}`, { seen: mastered ? 1 : 0, mastered, setMastered: mastered });
        await Promise.all([this.loadStats(), this.loadProgress()]);
        if (this.selectedWord?.id === word.id && this.selectedWord?.level === word.level) {
          this.recordLearningSession('learn', { level: word.level, word });
        }
      });
    },
    async loadQuiz() {
      await this.run(async () => {
        const params = new URLSearchParams({ level: this.level, type: this.quizType });
        if (this.quizTargetWordId) params.set('wordId', this.quizTargetWordId);
        this.quiz = await api(`/api/quiz?${params}`);
        this.quizTargetWordId = '';
        this.quizHint = ''; this.quizAnswered = false; this.quizFeedbackCorrect = false; this.quizSelectedAnswer = ''; this.quizCorrectAnswer = '';
        this.quizResumed = false;
        if (this.quizType === 'en-zh' || this.quizType === 'listen') this.speak(this.quiz.word.word);
        this.persistQuizDraft();
      });
    },
    async answer(option) {
      if (this.quizAnswered) return;
      this.quizAnswered = true;
      this.quizSelectedAnswer = String(option);
      this.error = '';
      try {
        const feedback = await postJSON('/api/quiz/answer', { level: this.quiz.word.level, wordId: this.quiz.word.id, type: this.quiz.type, answer: option });
        this.quizHint = feedback.correct ? '太棒了，回答正确！' : feedback.message;
        this.quizFeedbackCorrect = feedback.correct;
        this.quizCorrectAnswer = String(feedback.answer || '');
        this.quizSession.answered++;
        if (feedback.correct) this.quizSession.correct++;
        const result = this.quizSession.byType[this.quiz.type] || { answered: 0, correct: 0 };
        result.answered++;
        if (feedback.correct) result.correct++;
        this.quizSession.byType[this.quiz.type] = result;
        this.quizSession.history = [...(this.quizSession.history || []), {
          word: this.quiz.word,
          type: this.quiz.type,
          prompt: this.quiz.prompt,
          selectedAnswer: String(option),
          correctAnswer: String(feedback.answer || ''),
          correct: feedback.correct
        }];
        this.persistQuizDraft();
        await Promise.all([this.loadStats(), this.loadProgress()]);
      } catch (error) {
        this.error = error.message || '提交答案失败，请重试';
        this.quizAnswered = false;
        this.quizSelectedAnswer = '';
        this.quizCorrectAnswer = '';
      }
    },
    // 词义练习页自己提交答案，这里只负责刷新全局统计与掌握状态。
    async afterPracticeAnswer() {
      await this.run(async () => { await Promise.all([this.loadStats(), this.loadProgress()]); });
    },
    resetQuizSession() {
      this.quizSession = freshQuizSession();
      this.quizSelectedAnswer = ''; this.quizCorrectAnswer = ''; this.quizHint = ''; this.quizAnswered = false; this.quizResumed = false;
      try { localStorage.removeItem(this.quizStateKey()); } catch (_) {}
      this.loadQuiz();
    },
    async loadReport() { await this.run(async () => { this.report = await api('/api/dashboard'); }); },
    async loadMistakes() { await this.run(async () => { this.mistakes = (await api('/api/mistakes')).items; }); },
    async loadReviews() { await this.run(async () => {
      const data = await api(`/api/review/today?level=${this.level}`);
      this.reviews = data.items;
      this.reviewSummary = { total: data.total, completed: data.completed, goal: data.goal };
    }); },
    async loadSettings() { await this.run(async () => { this.settings = await api('/api/settings'); }); },
    async loadContentStatus() { await this.run(async () => { this.contentStatus = await api('/api/content-status'); }); },
    async saveSettings(settings) {
      this.settingsBusy = true;
      await this.run(async () => {
        this.settings = await postJSON('/api/settings', settings);
        await Promise.all([this.loadReviews(), this.loadReport()]);
      });
      this.settingsBusy = false;
    },
    async answerReview(word, correct) {
      this.reviewBusy = true;
      await this.run(async () => {
        await postJSON(`/api/progress/${encodeURIComponent(word.id)}?level=${word.level}`, {
          seen: 1, correct: correct ? 1 : 0, wrong: correct ? 0 : 1, mastered: correct, review: true
        });
        await Promise.all([this.loadReviews(), this.loadStats(), this.loadProgress()]);
      });
      this.reviewBusy = false;
    },
    async resolveMistake(word) {
      await this.run(async () => {
        await api(`/api/mistakes/${encodeURIComponent(word.id)}/resolve?level=${word.level}`, { method: 'POST' });
        await Promise.all([this.loadMistakes(), this.loadStats(), this.loadProgress()]);
      });
    },
    canLeaveView(view) {
      return !(this.activeView === 'exams' && this.examInProgress && view !== 'exams') || confirm('考试尚未提交，当前答案已自动保存，可以稍后继续。确定离开吗？');
    },
    setWorkspace(mode) {
      if (mode === this.workspaceMode) return;
      this.workspaceMode = mode;
      this.selectView(mode === 'admin' ? 'admin' : 'home');
    },
    onOpenGrammar(topic) {
      const id = resolveTopicId(topic);
      this.grammarTargetId = id || '';
      this.selectView('grammar');
    },
    openGrammar() {
      this.grammarTargetId = '';
      this.selectView('grammar');
    },
    selectView(view, options = {}) {
      if (!knownViews.has(view)) view = 'home';
      if (this.currentUser?.mustChangePassword && view !== 'security') {
        this.error = '首次登录请先修改初始密码';
        view = 'security';
      }
      if (adminViews.has(view) && this.currentUser?.role !== 'admin') view = 'home';
      if (!this.canLeaveView(view)) return;
      if (view === 'mistakes' && !options.preserveMistakeFocus) this.mistakeFocusWord = null;
      this.activeView = view;
      this.workspaceMode = adminViews.has(view) ? 'admin' : 'learn';
      this.mobileSidebarOpen = false;
      if (!options.fromHistory && window.location.hash !== hashFor(view)) history.pushState({ view }, '', hashFor(view));
      if (view === 'home') this.loadHomeData();
      if (view === 'learn' || view === 'categories') { this.loadFacets(); this.loadWords(); }
      if (learningViews.has(view)) this.recordLearningSession(view);
      if (view === 'quiz') this.enterQuiz(!!options.freshQuiz);
      if (view === 'report') this.loadReport();
      if (view === 'mistakes') this.loadMistakes();
      if (view === 'review') this.loadReviews();
      if (view === 'settings') this.loadSettings();
      if (view === 'content') this.loadContentStatus();
    },
    handlePopState() {
      const { view, args } = locationParts();
      if (view === 'grammar') this.grammarTargetId = args[0] || '';
      if (!this.canLeaveView(view)) {
        history.pushState({ view: this.activeView }, '', hashFor(this.activeView));
        return;
      }
      this.selectView(view, { fromHistory: true });
    },
    authenticated(user) {
      this.currentUser = user;
      this.restoreLearningState();
      const view = user.mustChangePassword ? 'security' : 'home';
      history.replaceState({ view }, '', hashFor(view));
      this.selectView(view, { fromHistory: true });
    },
    passwordChanged() {
      this.currentUser = { ...this.currentUser, mustChangePassword: false };
      this.error = '';
      this.selectView('home');
    },
    async logout() {
      await api('/api/auth/logout',{method:'POST'});
      this.currentUser=null; this.activeView='home'; this.learningSession=null; this.selectedWord=null; this.quizSession=freshQuizSession();
      history.replaceState({view:'home'},'', '#home');
    },
    async checkAuth() {
      try {
        this.currentUser = (await api('/api/auth/me')).user;
        this.restoreLearningState();
        let view = this.currentUser.mustChangePassword ? 'security' : viewFromLocation();
        if (adminViews.has(view) && this.currentUser.role !== 'admin') view = 'home';
        this.activeView = view;
        this.workspaceMode = adminViews.has(view) ? 'admin' : 'learn';
        history.replaceState({ view }, '', hashFor(view));
      } catch (_) { this.currentUser=null; }
      this.authChecked=true;
    }
  },
  mounted() {
    try { this.sidebarCollapsed = localStorage.getItem('english-learn-sidebar-collapsed') === '1'; } catch (_) {}
    window.addEventListener('popstate', this.handlePopState);
    this.checkAuth().then(()=>{if(this.currentUser){if(this.activeView==='home')this.loadHomeData();else this.selectView(this.activeView,{fromHistory:true});}});
  },
  beforeUnmount() { window.removeEventListener('popstate', this.handlePopState); },
  template: `
    <auth-view v-if="authChecked && !currentUser" @authenticated="authenticated" />
    <div v-else-if="authChecked" class="app-shell" :class="{'sidebar-collapsed':sidebarCollapsed,'sidebar-open':mobileSidebarOpen}">
      <button v-if="mobileSidebarOpen" class="sidebar-scrim" aria-label="关闭导航" @click="mobileSidebarOpen=false"></button>
      <aside class="app-sidebar">
        <div class="sidebar-brand"><span class="brand-mark">LB</span><div class="brand-copy"><strong>Lingo Bloom</strong><small>英语学习平台</small></div><button class="sidebar-collapse" :aria-label="sidebarCollapsed?'展开导航':'收起导航'" :title="sidebarCollapsed?'展开导航':'收起导航'" @click="toggleSidebar">{{sidebarCollapsed?'&gt;':'&lt;'}}</button></div>
        <div v-if="currentUser.role==='admin'" class="workspace-switch" role="tablist" aria-label="工作空间">
          <button :class="{active:workspaceMode==='learn'}" @click="setWorkspace('learn')">学习空间</button>
          <button :class="{active:workspaceMode==='admin'}" @click="setWorkspace('admin')">管理控制台</button>
        </div>
        <nav v-if="workspaceMode==='learn'" class="side-nav" aria-label="学习导航">
          <div class="nav-group-label">今日</div>
            <button :class="{active:activeView==='home'}" @click="selectView('home')" title="学习首页"><span class="nav-icon">HM</span><span class="nav-label">学习首页</span></button>
            <button :class="{active:activeView==='smart'}" @click="selectView('smart')" title="智能学习台"><span class="nav-icon">AI</span><span class="nav-label">智能学习台</span></button>
            <button :class="{active:activeView==='review'}" @click="selectView('review')" title="今日复习"><span class="nav-icon">RV</span><span class="nav-label">今日复习</span></button>
            <button :class="{active:activeView==='homework'}" @click="selectView('homework')" title="我的作业"><span class="nav-icon">HW</span><span class="nav-label">我的作业</span></button>
          <div class="nav-group-label">学习与练习</div>
            <button :class="{active:activeView==='learn'}" @click="selectView('learn')" title="单词学习"><span class="nav-icon">Aa</span><span class="nav-label">单词学习</span></button>
            <button :class="{active:activeView==='meaning-en-zh'}" @click="selectView('meaning-en-zh')" title="看词选义"><span class="nav-icon">EZ</span><span class="nav-label">看词选义</span></button>
            <button :class="{active:activeView==='meaning-zh-en'}" @click="selectView('meaning-zh-en')" title="看义选词"><span class="nav-icon">CE</span><span class="nav-label">看义选词</span></button>
            <button :class="{active:activeView==='meaning-listen'}" @click="selectView('meaning-listen')" title="听音选义"><span class="nav-icon">LA</span><span class="nav-label">听音选义</span></button>
            <button :class="{active:activeView==='categories'}" @click="selectView('categories')" title="分类词库"><span class="nav-icon">DB</span><span class="nav-label">分类词库</span></button>
            <button :class="{active:activeView==='course'}" @click="selectView('course')" title="课程学习"><span class="nav-icon">CO</span><span class="nav-label">课程学习</span></button>
            <button :class="{active:activeView==='grammar'}" @click="openGrammar()" title="语法专题"><span class="nav-icon">GR</span><span class="nav-label">语法专题</span></button>
            <button :class="{active:activeView==='phonetics'}" @click="selectView('phonetics')" title="国际音标"><span class="nav-icon">PH</span><span class="nav-label">国际音标</span></button>
            <button :class="{active:activeView==='quiz'}" @click="selectView('quiz')" title="单词测验"><span class="nav-icon">Q</span><span class="nav-label">单词测验</span></button>
            <button :class="{active:activeView==='reading'}" @click="selectView('reading')" title="英语阅读"><span class="nav-icon">R</span><span class="nav-label">英语阅读</span></button>
            <button :class="{active:activeView==='exams'}" @click="selectView('exams')" title="考试练习"><span class="nav-icon">EX</span><span class="nav-label">考试练习</span></button>
            <button :class="{active:activeView==='tongbu'}" @click="selectView('tongbu')" title="同步训练"><span class="nav-icon">TB</span><span class="nav-label">同步训练</span></button>
          <div class="nav-group-label">我的</div>
            <button :class="{active:activeView==='report'}" @click="selectView('report')" title="学习报告"><span class="nav-icon">RP</span><span class="nav-label">学习报告</span></button>
            <button :class="{active:activeView==='mistakes'}" @click="selectView('mistakes')" title="错题本"><span class="nav-icon">M</span><span class="nav-label">错题本</span></button>
            <button :class="{active:activeView==='settings'}" @click="selectView('settings')" title="学习设置"><span class="nav-icon">S</span><span class="nav-label">学习设置</span></button>
            <button :class="{active:activeView==='security'}" @click="selectView('security')" title="账号安全"><span class="nav-icon">SE</span><span class="nav-label">账号安全</span></button>
        </nav>
        <nav v-else class="side-nav" aria-label="管理导航">
          <div class="nav-group-label">平台</div>
            <button :class="{active:activeView==='admin'}" @click="selectView('admin')" title="用户与概览"><span class="nav-icon">AD</span><span class="nav-label">用户与概览</span></button>
            <button :class="{active:activeView==='content'}" @click="selectView('content')" title="内容状态"><span class="nav-icon">CS</span><span class="nav-label">内容状态</span></button>
          <div class="nav-group-label">内容生产</div>
            <button :class="{active:activeView==='workbench'}" @click="selectView('workbench')" title="内容工作台"><span class="nav-icon">ST</span><span class="nav-label">内容工作台</span></button>
            <button :class="{active:activeView==='exam-workbench'}" @click="selectView('exam-workbench')" title="可视化组卷"><span class="nav-icon">EX</span><span class="nav-label">组卷工作台</span></button>
            <button :class="{active:activeView==='factory'}" @click="selectView('factory')" title="AI 内容工厂"><span class="nav-icon">AI</span><span class="nav-label">AI 内容工厂</span></button>
            <button :class="{active:activeView==='homework-admin'}" @click="selectView('homework-admin')" title="作业管理"><span class="nav-icon">HA</span><span class="nav-label">作业管理</span></button>
          <div class="nav-group-label">系统</div>
            <button :class="{active:activeView==='agent-admin'}" @click="selectView('agent-admin')" title="智能体管理"><span class="nav-icon">AG</span><span class="nav-label">智能体管理</span></button>
            <button :class="{active:activeView==='security'}" @click="selectView('security')" title="账号安全"><span class="nav-icon">SE</span><span class="nav-label">账号安全</span></button>
        </nav>
        <div class="sidebar-user"><span class="user-avatar">{{(currentUser.displayName||currentUser.username||'U').slice(0,1)}}</span><span class="user-copy"><b>{{currentUser.displayName}}</b><small>{{currentUser.role==='admin'?'管理员':'学习者'}}</small></span><button @click="logout" title="退出登录">退出</button></div>
      </aside>
      <div class="app-content">
        <header class="mobile-topbar"><button class="mobile-menu-button" aria-label="打开导航菜单" @click="toggleMobileSidebar"><span></span><span></span><span></span></button><div><div class="brand">Lingo Bloom</div><div class="subtitle">让每一次练习都有进步</div></div></header>
        <main>
          <div v-if="error" class="error-banner" role="alert">{{ error }} <button aria-label="关闭" @click="error=''">×</button></div>
      <home-view v-if="activeView==='home'" :user="currentUser" :stats="stats" :report="report" :review-summary="reviewSummary" :session="learningSession" @navigate="handleNavigate" />
      <smart-learning-view v-else-if="activeView==='smart'" :user-id="currentUser.id" @navigate="handleNavigate" />
      <learn-view v-else-if="activeView==='learn'" v-model:level="level" v-model:query="query" v-model:topic="topic" v-model:grade="grade" v-model:unit="unit" :sort="wordSort" :letter="letter" :part-of-speech="partOfSpeech" :facets="facets" :words="words" :total="total" :page="page" :pages="pages" :mastered-ids="masteredIds" :selected-word="selectedWord" :selected-progress="selectedWordProgress" :continuous-mode="continuousLearning" @update:sort="setWordSort" @search="search" @clear-category="clearCategory" @page="changePage" @speak="speak" @master="markWord" @open="openWord" @close="closeWord" @continuous="setContinuousLearning" @practice="startWordQuiz" />
      <meaning-practice-view v-else-if="activeView==='meaning-en-zh'" :user-id="currentUser.id" mode="en-zh" @speak="speak" @navigate="handleNavigate" @answered="afterPracticeAnswer" />
      <meaning-practice-view v-else-if="activeView==='meaning-zh-en'" :user-id="currentUser.id" mode="zh-en" @speak="speak" @navigate="handleNavigate" @answered="afterPracticeAnswer" />
      <meaning-practice-view v-else-if="activeView==='meaning-listen'" :user-id="currentUser.id" mode="en-zh" audio-only @speak="speak" @navigate="handleNavigate" @answered="afterPracticeAnswer" />
      <category-view v-else-if="activeView==='categories'" :facets="facets" :level="level" @level="level=$event" @select="selectCategory" />
      <course-view v-else-if="activeView==='course'" @open-grammar="onOpenGrammar" />
      <grammar-view v-else-if="activeView==='grammar'" :user-id="currentUser.id" :target-topic-id="grammarTargetId" />
      <phonetics-view v-else-if="activeView==='phonetics'" />
      <reading-view v-else-if="activeView==='reading'" :user-id="currentUser.id" :target-article-id="readingTargetArticleId" @speak="speak" />
      <exam-view v-else-if="activeView==='exams'" :user-id="currentUser.id" @session-state="examInProgress=$event" />
      <tongbu-view v-else-if="activeView==='tongbu'" :user-id="currentUser.id" />
      <quiz-view v-else-if="activeView==='quiz'" v-model:type="quizType" :quiz="quiz" :hint="quizHint" :answered="quizAnswered" :session="quizSession" :selected-answer="quizSelectedAnswer" :correct-answer="quizCorrectAnswer" :feedback-correct="quizFeedbackCorrect" :resumed="quizResumed" @change="loadQuiz" @speak="speak" @answer="answer" @next="loadQuiz" @restart="resetQuizSession" @navigate="handleNavigate" />
      <review-view v-else-if="activeView==='review'" :items="reviews" :level="level" :busy="reviewBusy" :summary="reviewSummary" @refresh="loadReviews" @speak="speak" @answer="answerReview" />
      <report-view v-else-if="activeView==='report'" :report="report" @refresh="loadReport" @navigate="handleNavigate" />
      <mistakes-view v-else-if="activeView==='mistakes'" :items="mistakes" :focus-word="mistakeFocusWord" @refresh="loadMistakes" @speak="speak" @resolve="resolveMistake" @navigate="handleNavigate" />
      <settings-view v-else-if="activeView==='settings'" :settings="settings" :busy="settingsBusy" @save="saveSettings" />
      <section v-else-if="activeView==='admin'"><admin-overview/><admin-view /></section>
      <content-workbench v-else-if="activeView==='workbench'" />
      <exam-workbench v-else-if="activeView==='exam-workbench'" />
      <agent-admin-view v-else-if="activeView==='agent-admin'" />
      <content-factory-view v-else-if="activeView==='factory'" @navigate="selectView" />
      <homework-view v-else-if="activeView==='homework'" />
      <homework-admin-view v-else-if="activeView==='homework-admin'" />
      <security-view v-else-if="activeView==='security'" :required="currentUser.mustChangePassword" @changed="passwordChanged" />
      <content-status-view v-else-if="activeView==='content'" :status="contentStatus" @refresh="loadContentStatus" />
        </main>
        <agent-assistant :mode="activeView==='reading'?'reading':activeView==='exams'?'exam':activeView==='mistakes'?'mistake':activeView==='learn'?'word':'general'" :context="{view:activeView,level,query,topic}" />
        <footer>坚持一点点，进步看得见。</footer>
      </div>
    </div>
    <div v-else class="boot-placeholder">正在加载学习数据……</div>
  `,
}).mount('#app');
