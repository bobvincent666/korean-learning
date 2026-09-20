export function createAudioSpeaker(items, AudioCtor, fallback) {
  let current = null;
  let last = null;
  const hasRecordedAudio = () => Object.keys(items).length > 0;
  const available = () => hasRecordedAudio() || Boolean(fallback?.available());

  const stop = () => {
    if (current) {
      current.onerror = null;
      current.pause();
      current = null;
    }
    fallback?.stop?.();
  };

  const speak = (text, { slow = false, onError = () => {} } = {}) => {
    if (!text?.trim()) return false;
    stop();
    const options = { slow, onError };
    const source = items[text.normalize('NFC')];
    if (!source) {
      const accepted = Boolean(fallback?.available() && fallback.speak(text, options));
      if (accepted) last = { text, ...options };
      return accepted;
    }

    let audio;
    try { audio = new AudioCtor(source); }
    catch {
      const accepted = Boolean(fallback?.available() && fallback.speak(text, options));
      if (accepted) last = { text, ...options };
      else onError();
      return accepted;
    }
    current = audio;
    audio.playbackRate = slow ? 0.78 : 1;
    audio.preservesPitch = true;
    let handled = false;
    const failed = () => {
      if (current !== audio || handled) return false;
      handled = true;
      audio.onerror = null;
      current = null;
      const recovered = Boolean(fallback?.available() && fallback.speak(text, options));
      if (!recovered) onError();
      return recovered;
    };
    audio.onerror = failed;
    last = { text, ...options };
    try {
      const started = audio.play();
      started?.catch?.(failed);
    } catch { return failed(); }
    return true;
  };

  return {
    available,
    hasRecordedAudio,
    speak,
    repeat: () => last ? speak(last.text, last) : false,
    stop
  };
}
