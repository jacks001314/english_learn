function pickVoice(lang) {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const wanted = String(lang || "en-US").toLowerCase();
  const prefix = wanted.split("-")[0];
  return (
    voices.find((voice) => (voice.lang || "").toLowerCase().startsWith(prefix)) ||
    voices.find((voice) => (voice.lang || "").toLowerCase().startsWith("en")) ||
    voices[0]
  );
}

function speakNow(text, lang, rate) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang || "en-US";
  utterance.rate = rate || 0.85;
  const voice = pickVoice(utterance.lang);
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function speak(text, lang = "en-US", rate = 0.85) {
  if (!text || !("speechSynthesis" in window)) return;

  // Some browsers expose speechSynthesis before their voices are loaded.
  // Wait briefly for the first voice list so the utterance does not get dropped.
  if (window.speechSynthesis.getVoices().length) {
    speakNow(text, lang, rate);
    return;
  }

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    window.speechSynthesis.onvoiceschanged = null;
    speakNow(text, lang, rate);
  };
  window.speechSynthesis.onvoiceschanged = finish;
  window.setTimeout(finish, 300);
}
