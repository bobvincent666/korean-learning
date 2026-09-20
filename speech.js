export function chooseKoreanVoice(voices = []) {
  const korean = voices.filter(voice => /^ko(?:[-_]|$)/i.test(voice.lang || ''));
  return korean.find(voice => /^ko[-_]KR$/i.test(voice.lang)) || korean[0] || null;
}

export function createSpeaker(synthesis, Utterance) {
  let last = null;
  let current = null;

  const available = () => Boolean(
    synthesis && Utterance && typeof synthesis.getVoices === 'function' &&
    chooseKoreanVoice(synthesis.getVoices())
  );

  const speak = (text, { slow = false, onError = () => {} } = {}) => {
    if (!text || !text.trim() || !available()) return false;
    const voice = chooseKoreanVoice(synthesis.getVoices());
    try {
      current = null;
      synthesis.cancel();
      const utterance = new Utterance(text);
      utterance.lang = 'ko-KR';
      utterance.voice = voice;
      utterance.rate = slow ? 0.78 : 1;
      utterance.onerror = event => {
        if (current === utterance && !['interrupted','canceled'].includes(event.error)) onError(event);
        if (current === utterance) current = null;
      };
      utterance.onend = () => { if (current === utterance) current = null; };
      current = utterance;
      synthesis.speak(utterance);
      last = { text, slow, onError };
      return true;
    } catch {
      current = null;
      return false;
    }
  };

  return {
    available,
    speak,
    repeat: () => last ? speak(last.text, { slow: last.slow, onError: last.onError }) : false,
    stop: () => { current = null; synthesis?.cancel?.(); }
  };
}
