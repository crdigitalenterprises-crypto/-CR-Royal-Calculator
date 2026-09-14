let soundEnabled = true;
let hapticsEnabled = true;

export function setFeedbackSettings(sound: boolean, haptics: boolean): void {
  soundEnabled = sound;
  hapticsEnabled = haptics;
}

export function playClickSound(): void {
  if (!soundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1200;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
    osc.onended = () => ctx.close();
  } catch {
    // Audio context unavailable
  }
}

export function triggerHaptic(duration = 10): void {
  if (!hapticsEnabled) return;
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Vibration not supported
    }
  }
}

export function triggerFeedback(): void {
  playClickSound();
  triggerHaptic(10);
}

export function triggerSuccessFeedback(): void {
  if (hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([10, 30, 10]);
    } catch {
      // ignore
    }
  }
}

export function getFeedbackSettings(): { soundEnabled: boolean; hapticsEnabled: boolean } {
  return { soundEnabled, hapticsEnabled };
}
