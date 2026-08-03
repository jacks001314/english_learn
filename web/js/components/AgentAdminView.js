import {api} from '../api.js';

const providers=[
 {id:'openai',name:'OpenAI / 兼容服务'},
 {id:'amazon-bedrock',name:'Amazon Bedrock'},
 {id:'ollama',name:'Ollama 本地模型'},
 {id:'lmstudio',name:'LM Studio 本地模型'}
];
const models={
 openai:['gpt-5.6-sol','gpt-5.6-terra','gpt-5.6-luna','gpt-5.5','gpt-5.4','gpt-5.4-mini','custom'],
 'amazon-bedrock':['openai.gpt-5.6-sol','openai.gpt-5.6-terra','openai.gpt-5.5','custom'],
 ollama:['gpt-oss:20b','custom'],
 lmstudio:['openai/gpt-oss-20b','custom']
};

export default {
 data:()=>({
  cfg:{enabled:false,engine:'codex-core',providerId:'openai',model:'gpt-5.6-terra',baseUrl:'',apiKey:'',claudeModel:'claude-sonnet-4-5-20250929',claudeBaseUrl:'',claudeCliPath:'',claudeAuthToken:'',systemPrompt:'',timeoutSeconds:60,maxPromptChars:12000},
  providers,providerChoice:'openai',modelChoice:'',customModel:'',claudeModelChoice:'',customClaudeModel:'',
  loading:true,saving:false,testing:false,showAdvanced:false,message:'',error:''
 }),
 computed:{
  modelOptions(){return models[this.providerChoice]||['custom']}
 },
 async mounted(){await this.load()},
 methods:{
  sync(){
   this.cfg.engine=this.cfg.engine||'codex-core';
   this.cfg.claudeBaseUrl=this.cfg.claudeBaseUrl||'';
   this.providerChoice=this.providers.some(p=>p.id===this.cfg.providerId)?this.cfg.providerId:'openai';
   this.modelChoice=this.modelOptions.includes(this.cfg.model)?this.cfg.model:'custom';
   this.customModel=this.modelChoice==='custom'?this.cfg.model:'';
   const choices=['claude-opus-4-6','claude-sonnet-4-5-20250929','claude-haiku-4-5-20251001','deepseek-v4-pro','deepseek-v4-flash'];
   this.claudeModelChoice=choices.includes(this.cfg.claudeModel)?this.cfg.claudeModel:'custom';
   this.customClaudeModel=this.claudeModelChoice==='custom'?this.cfg.claudeModel:'';
  },
  apply(){
   this.cfg.providerId=this.providerChoice;
   this.cfg.model=this.modelChoice==='custom'?this.customModel.trim():this.modelChoice;
   this.cfg.claudeModel=this.claudeModelChoice==='custom'?this.customClaudeModel.trim():this.claudeModelChoice;
  },
  providerChanged(){
   this.modelChoice=this.modelOptions[0];
   this.customModel='';
   if(this.providerChoice==='ollama')this.cfg.baseUrl='http://localhost:11434/v1';
   else if(this.providerChoice==='lmstudio')this.cfg.baseUrl='http://localhost:1234/v1';
  },
  async load(){
   try{this.cfg=await api('/api/admin/agent/config');this.sync()}
   catch(e){this.error=e.message}
   finally{this.loading=false}
  },
  async save(){
   this.apply();this.saving=true;this.error='';this.message='';
   try{
    this.cfg=await api('/api/admin/agent/config',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(this.cfg)});
    this.sync();this.message='配置已保存。';
   }catch(e){this.error=e.message}
   finally{this.saving=false}
  },
  async test(){
   this.apply();this.testing=true;this.error='';this.message='';
   try{const out=await api('/api/admin/agent/test',{method:'POST'});this.message='连接成功：'+out.message}
   catch(e){this.error=e.message}
   finally{this.testing=false}
  }
 },
 template:`
 <section class="agent-settings-page">
  <div class="agent-settings-hero">
   <div class="agent-logo">AI</div>
   <div><span>PLUGGABLE AGENT PLATFORM</span><h2>智能体配置</h2><p>统一学习入口，支持不同智能体引擎灵活切换。</p></div>
   <label class="agent-toggle"><input type="checkbox" v-model="cfg.enabled"><i></i><span><b>{{cfg.enabled?'智能体已启用':'智能体未启用'}}</b><small>{{cfg.enabled?'学生可使用智能体':'启用后学生端显示入口'}}</small></span></label>
  </div>
  <div v-if="loading" class="agent-loading">正在读取配置...</div>
  <form v-else @submit.prevent="save">
   <section class="agent-config-card">
    <header><div class="step">1</div><div><h3>选择智能体引擎</h3><p>各引擎独立保存参数，学生端使用统一对话入口。</p></div></header>
    <div class="engine-options">
     <label :class="{active:cfg.engine==='codex-core'}"><input type="radio" v-model="cfg.engine" value="codex-core"><b>Codex Core</b><small>内嵌 Go Runtime，支持云端和本地模型</small></label>
     <label :class="{active:cfg.engine==='claude-code'}"><input type="radio" v-model="cfg.engine" value="claude-code"><b>Claude Code</b><small>Claude Agent SDK Go + Claude Code CLI</small></label>
    </div>
   </section>
   <section class="agent-config-card">
    <header><div class="step">2</div><div><h3>{{cfg.engine==='codex-core'?'Codex Core 配置':'Claude Code 配置'}}</h3><p>配置当前引擎的模型、认证和运行环境。</p></div><span class="agent-state" :class="{on:cfg.enabled}">{{cfg.enabled?'运行中':'未启用'}}</span></header>
    <div v-if="cfg.engine==='codex-core'" class="agent-form-grid">
     <label><span>Provider</span><select v-model="providerChoice" @change="providerChanged"><option v-for="p in providers" :value="p.id">{{p.name}}</option></select></label>
     <label><span>Model</span><select v-model="modelChoice"><option v-for="m in modelOptions" :value="m">{{m==='custom'?'自定义模型':m}}</option></select></label>
     <label v-if="modelChoice==='custom'"><span>自定义模型 ID</span><input v-model="customModel" required></label>
     <label><span>Base URL</span><input v-model="cfg.baseUrl" placeholder="留空使用默认地址"></label>
     <label><span>API Key</span><div class="key-field"><input v-model="cfg.apiKey" type="password" :placeholder="cfg.apiKeyConfigured?'已保存，留空保持不变':'输入 API Key'"><em v-if="cfg.apiKeyConfigured">已保存</em></div></label>
    </div>
    <div v-else>
     <div class="agent-form-grid">
      <label><span>Claude Model</span><select v-model="claudeModelChoice"><option value="claude-opus-4-6">Claude Opus 4.6</option><option value="claude-sonnet-4-5-20250929">Claude Sonnet 4.5</option><option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option><option value="deepseek-v4-pro">DeepSeek V4 Pro</option><option value="custom">自定义模型</option></select></label>
      <label v-if="claudeModelChoice==='custom'"><span>自定义模型 ID</span><input v-model="customClaudeModel" required></label>
      <label><span>Claude Base URL</span><input v-model="cfg.claudeBaseUrl" type="url" placeholder="留空使用 Anthropic 默认地址"><small>自定义服务地址（ANTHROPIC_BASE_URL）</small></label>
      <label><span>Claude CLI 路径</span><input v-model="cfg.claudeCliPath" placeholder="留空自动查找 claude 命令"><small>需要安装 @anthropic-ai/claude-code</small></label>
      <label><span>Anthropic API Key / OAuth Token</span><div class="key-field"><input v-model="cfg.claudeAuthToken" type="password" :placeholder="cfg.claudeAuthConfigured?'已保存，留空保持不变':'输入认证 Token'"><em v-if="cfg.claudeAuthConfigured">已保存</em></div></label>
     </div>
     <div class="claude-note">安全模式：已禁止 Bash、文件读写、网络搜索和任务工具，仅用于学习对话。</div>
    </div>
   </section>
   <section class="agent-config-card">
    <header><div class="step">3</div><div><h3>教学行为</h3><p>所有引擎共享同一套教学身份和安全边界。</p></div></header>
    <label class="prompt-field"><span>系统提示词</span><textarea v-model="cfg.systemPrompt" rows="7" required></textarea></label>
   </section>
   <section class="agent-config-card compact">
    <button type="button" class="advanced-toggle" @click="showAdvanced=!showAdvanced"><span><b>高级设置</b><small>超时和消息限制</small></span><i>{{showAdvanced?'收起':'展开'}}⌄</i></button>
    <div v-if="showAdvanced" class="agent-form-grid advanced">
     <label><span>响应超时</span><div class="unit-input"><input v-model.number="cfg.timeoutSeconds" type="number" min="5" max="300"><em>秒</em></div></label>
     <label><span>最大消息长度</span><div class="unit-input"><input v-model.number="cfg.maxPromptChars" type="number" min="1000" max="50000"><em>字符</em></div></label>
    </div>
   </section>
   <div v-if="message" class="agent-notice success">✓ {{message}}</div><div v-if="error" class="agent-notice error">! {{error}}</div>
   <div class="agent-savebar"><div><b>当前引擎：{{cfg.engine==='codex-core'?'Codex Core':'Claude Code'}}</b><small>配置将对新发起的对话生效</small></div><button type="button" class="secondary" :disabled="testing||!cfg.enabled" @click="test">{{testing?'正在测试...':'测试连接'}}</button><button class="primary" :disabled="saving">{{saving?'保存中...':'保存配置'}}</button></div>
  </form>
 </section>`
};
