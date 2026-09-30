// Web Audio API based chime sound generator & custom audio player for school period reminders
import { BellSoundType } from '../types/schedule';

let audioCtx: AudioContext | null = null;
let currentCustomAudio: HTMLAudioElement | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Westminster Chime (Classic 4-tone / 8-tone school bell)
function playWestminster(ctx: AudioContext): void {
  // Iconic Indonesian school melody: Mi-Do-Re-Sol, Sol-Re-Mi-Do
  const melody = [
    { freq: 659.25, time: 0.0, dur: 0.5 },  // E5
    { freq: 523.25, time: 0.45, dur: 0.5 }, // C5
    { freq: 587.33, time: 0.9, dur: 0.5 },  // D5
    { freq: 392.00, time: 1.35, dur: 0.9 }, // G4
    { freq: 392.00, time: 2.1, dur: 0.5 },  // G4
    { freq: 587.33, time: 2.55, dur: 0.5 }, // D5
    { freq: 659.25, time: 3.0, dur: 0.5 },  // E5
    { freq: 523.25, time: 3.45, dur: 1.2 }, // C5
  ];

  melody.forEach(({ freq, time, dur }) => {
    // Fundamental tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

    // Overtone harmonic for realistic church/school bell resonance
    const oscHarmonic = ctx.createOscillator();
    const gainHarmonic = ctx.createGain();
    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(freq * 2.76, ctx.currentTime + time);

    // Natural bell acoustic envelope
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + time);
    gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + dur);

    gainHarmonic.gain.setValueAtTime(0.0001, ctx.currentTime + time);
    gainHarmonic.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + time + 0.02);
    gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + dur * 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);
    oscHarmonic.connect(gainHarmonic);
    gainHarmonic.connect(ctx.destination);

    osc.start(ctx.currentTime + time);
    osc.stop(ctx.currentTime + time + dur);
    oscHarmonic.start(ctx.currentTime + time);
    oscHarmonic.stop(ctx.currentTime + time + dur * 0.7);
  });
}

// 2. Ding-Dong (Classic Dual Bell Chime)
function playDingDong(ctx: AudioContext): void {
  const tones = [
    { freq: 783.99, time: 0.0, dur: 0.9 }, // G5 (Ding)
    { freq: 523.25, time: 0.65, dur: 1.4 }, // C5 (Dong)
  ];

  tones.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime + time);
    gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + time);
    osc.stop(ctx.currentTime + time + dur);
  });
}

// 3. Digital Chime (Crisp Modern Electronic Buzzer / Exam Chime)
function playDigital(ctx: AudioContext): void {
  const notes = [
    { freq: 880, time: 0.0, dur: 0.15 },    // A5
    { freq: 1108.73, time: 0.15, dur: 0.15 }, // C#6
    { freq: 1318.51, time: 0.3, dur: 0.2 },  // E6
    { freq: 1760, time: 0.5, dur: 0.6 },    // A6
  ];

  notes.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

    gain.gain.setValueAtTime(0.001, ctx.currentTime + time);
    gain.gain.exponentialRampToValueAtTime(0.28, ctx.currentTime + time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + time);
    osc.stop(ctx.currentTime + time + dur);
  });
}

// 4. Marimba (Warm, gentle soothing wood chime)
function playMarimba(ctx: AudioContext): void {
  const notes = [
    { freq: 392.00, time: 0.0, dur: 0.35 },  // G4
    { freq: 493.88, time: 0.2, dur: 0.35 },  // B4
    { freq: 587.33, time: 0.4, dur: 0.35 },  // D5
    { freq: 783.99, time: 0.6, dur: 0.8 },   // G5
    { freq: 987.77, time: 0.8, dur: 1.0 },   // B5
  ];

  notes.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

    // Warm rounded attack and fast decay like wooden percussion
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + time);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + time);
    osc.stop(ctx.currentTime + time + dur);
  });
}

// Main function to play period chime according to chosen sound type
export function playPeriodChime(
  soundType?: BellSoundType,
  customAudioDataUrl?: string
): void {
  try {
    const activeType: BellSoundType =
      soundType ||
      (localStorage.getItem('piket_bell_sound_type') as BellSoundType) ||
      'westminster';

    // If custom audio file uploaded
    if (activeType === 'custom') {
      const audioSrc =
        customAudioDataUrl || localStorage.getItem('piket_custom_bell_audio');
      if (audioSrc) {
        if (currentCustomAudio) {
          currentCustomAudio.pause();
          currentCustomAudio.currentTime = 0;
        }
        currentCustomAudio = new Audio(audioSrc);
        currentCustomAudio.play().catch((err) => {
          console.warn('Could not play custom audio file, falling back to synthesizer:', err);
          const ctx = getAudioContext();
          if (ctx) playWestminster(ctx);
        });
        return;
      }
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    switch (activeType) {
      case 'dingdong':
        playDingDong(ctx);
        break;
      case 'digital':
        playDigital(ctx);
        break;
      case 'marimba':
        playMarimba(ctx);
        break;
      case 'westminster':
      default:
        playWestminster(ctx);
        break;
    }
  } catch (err) {
    console.warn('Audio chime could not be played:', err);
  }
}

export function stopChimeSound(): void {
  if (currentCustomAudio) {
    currentCustomAudio.pause();
    currentCustomAudio.currentTime = 0;
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
