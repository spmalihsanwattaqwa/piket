// Web Audio API based chime sound generator for school period reminders

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playPeriodChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // School chime melody (Do-Mi-Sol chord chime like school bell)
    const tones = [
      { freq: 523.25, time: 0, duration: 0.4 },     // C5
      { freq: 659.25, time: 0.35, duration: 0.4 },  // E5
      { freq: 783.99, time: 0.7, duration: 0.8 },   // G5
      { freq: 1046.50, time: 1.1, duration: 1.2 },  // C6
    ];

    tones.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      // Smooth chime envelope
      gain.gain.setValueAtTime(0.001, ctx.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + duration);
    });
  } catch (err) {
    console.warn('Audio chime could not be played:', err);
  }
}

export function playKeyClickSound(status: 'belum' | 'hadir' | 'tidak_hadir'): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const freq = status === 'hadir' ? 650 : status === 'tidak_hadir' ? 440 : 520;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // ignore
  }
}
