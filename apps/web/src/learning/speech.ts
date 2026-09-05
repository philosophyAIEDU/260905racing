let watchdog: ReturnType<typeof setTimeout> | undefined;
let current: SpeechSynthesisUtterance | undefined;
export function stopSpeech(): void {
  clearTimeout(watchdog);
  if (current) {
    current.onend = null;
    current.onerror = null;
    current = undefined;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
export function speakEnglish(
  text: string,
  done: () => void = () => {},
  failed: () => void = () => {},
): void {
  stopSpeech();
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    failed();
    return;
  }
  const speech = new SpeechSynthesisUtterance(text);
  current = speech;
  speech.lang = 'en-US';
  speech.rate = 0.85;
  speech.volume = 1;
  speech.voice =
    window.speechSynthesis.getVoices().find((voice) => voice.lang.startsWith('en')) ?? null;
  speech.onend = () => {
    clearTimeout(watchdog);
    current = undefined;
    done();
  };
  speech.onerror = () => {
    clearTimeout(watchdog);
    current = undefined;
    failed();
  };
  watchdog = setTimeout(() => {
    stopSpeech();
    failed();
  }, 12000);
  window.speechSynthesis.speak(speech);
}
