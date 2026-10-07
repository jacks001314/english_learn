import { postJSON } from '../api.js';

export default {
  emits: ['authenticated'],
  data: () => ({ mode: 'login', username: '', password: '', displayName: '', showPassword: false, busy: false, error: '' }),
  methods: {
    async submit() {
      this.error = '';
      this.busy = true;
      try {
        const path = this.mode === 'login' ? 'login' : 'register';
        const data = await postJSON(`/api/auth/${path}`, { username: this.username, password: this.password, displayName: this.displayName });
        this.$emit('authenticated', data.user);
      } catch (error) { this.error = error.message; }
      finally { this.busy = false; }
    },
    switchMode() { this.mode = this.mode === 'login' ? 'register' : 'login'; this.error = ''; this.password = ''; this.showPassword = false; }
  },
  template: `
    <section class="auth-shell"><div class="auth-card">
      <div class="auth-mark">🌟</div>
      <h1>{{ mode === 'login' ? '欢迎回来' : '创建学习账号' }}</h1>
      <p>{{ mode === 'login' ? '登录后继续你的英语学习旅程' : '保存个人进度，在不同设备继续学习' }}</p>
      <form @submit.prevent="submit">
        <label v-if="mode === 'register'">显示名称<input v-model.trim="displayName" required maxlength="40" autocomplete="name" placeholder="你的名字"></label>
        <label>用户名<input v-model.trim="username" required minlength="3" maxlength="32" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="3-32 个字符"></label>
        <label>密码<span class="auth-password"><input v-model="password" required minlength="8" :type="showPassword ? 'text' : 'password'" :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" placeholder="至少 8 个字符"><button type="button" :aria-pressed="showPassword" :aria-label="showPassword ? '隐藏密码' : '显示密码'" @click="showPassword=!showPassword">{{ showPassword ? '隐藏' : '显示' }}</button></span></label>
        <div v-if="error" class="auth-error" role="alert" aria-live="polite">{{ error }}</div>
        <button class="auth-submit" :disabled="busy" :aria-busy="busy">{{ busy ? '请稍候…' : (mode === 'login' ? '登录' : '注册并登录') }}</button>
      </form>
      <button class="auth-switch" @click="switchMode">{{ mode === 'login' ? '还没有账号？立即注册' : '已有账号？返回登录' }}</button>
    </div></section>`
};
