// 浏览器语音合成（朗读）的轻封装。
//
// 分工：web/js/speech.js 服务于既有页面组件，签名是 speak(text, lang, rate)；
// 本模块按实施契约 §4.1 固定导出 speechSupported() / speak(text, opts) / stopSpeaking()，
// 供助教教学卡片与「朗读整段」使用。唯一硬性要求：**任何情况下都不抛错**——
// 浏览器不支持语音合成时静默返回 false，按钮安静地什么都不做，
// 不能把红色报错甩给正在答题的学生。
//
// 引用方式（无构建链，浏览器直接加载 ES module）：?v=20261006-agent-ux-r1

const DEFAULT_LANG = 'en-US';
const DEFAULT_RATE = 0.9;
// 部分浏览器（Safari / 旧 Edge）第一次调用时 getVoices() 还是空数组，直接 speak 会被丢掉。
// 这里等 voiceschanged 或 300ms 超时后再读，两种情况都照读。
const VOICE_WAIT_MS = 300;

// 朗读令牌：新的朗读或 stopSpeaking 会让上一次「还没开始」的朗读失效。
let speakToken = 0;

export function speechSupported() {
  try {
    if (typeof window === 'undefined') return false;
    return !!window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function';
  } catch (_) {
    return false;
  }
}

export function stopSpeaking() {
  speakToken += 1;
  if (!speechSupported()) return false;
  try {
    window.speechSynthesis.cancel();
    return true;
  } catch (_) {
    return false;
  }
}

function pickVoice(lang) {
  try {
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;
    const wanted = String(lang || DEFAULT_LANG).toLowerCase();
    const prefix = wanted.split('-')[0];
    return (
      voices.find((voice) => String(voice.lang || '').toLowerCase().startsWith(prefix)) ||
      voices.find((voice) => String(voice.lang || '').toLowerCase().startsWith('en')) ||
      voices[0]
    );
  } catch (_) {
    return null;
  }
}

function speakNow(value, lang, rate, onend) {
  try {
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = lang;
    utterance.rate = rate;
    const voice = pickVoice(lang);
    if (voice) utterance.voice = voice;
    if (onend) {
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        try {
          onend();
        } catch (_) {}
      };
      // onerror 也当成结束：读不出来时调用方的状态不能一直挂着。
      utterance.onend = finish;
      utterance.onerror = finish;
    }
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (_) {
    return false;
  }
}

export function speak(text, opts = {}) {
  const value = String(text === undefined || text === null ? '' : text).replace(/\s+/g, ' ').trim();
  if (!value || !speechSupported()) return false;
  const options = opts || {};
  const lang = options.lang || DEFAULT_LANG;
  const rate = Number.isFinite(options.rate) ? options.rate : DEFAULT_RATE;
  const onend = typeof options.onend === 'function' ? options.onend : null;
  const token = (speakToken += 1);
  try {
    // 同一时刻只读一段：新朗读打断旧的。
    window.speechSynthesis.cancel();
  } catch (_) {
    return false;
  }
  let voices = [];
  try {
    voices = window.speechSynthesis.getVoices() || [];
  } catch (_) {
    voices = [];
  }
  if (voices.length) return speakNow(value, lang, rate, onend);
  let settled = false;
  let timer = 0;
  const start = () => {
    if (settled) return;
    settled = true;
    if (timer) window.clearTimeout(timer);
    try {
      window.speechSynthesis.removeEventListener('voiceschanged', start);
    } catch (_) {}
    // 期间被新的朗读或 stopSpeaking 取消，就不要再读了。
    if (token !== speakToken) return;
    speakNow(value, lang, rate, onend);
  };
  timer = window.setTimeout(start, VOICE_WAIT_MS);
  try {
    window.speechSynthesis.addEventListener('voiceschanged', start);
  } catch (_) {}
  return true;
}