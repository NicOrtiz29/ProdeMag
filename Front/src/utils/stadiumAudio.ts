/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// A client-side Web Audio API synthesizer for Argentine stadium sounds and music.
// Plays anthemic rhythms, referee whistles, and stadium horn sound effects.

let audioCtx: AudioContext | null = null;
let musicInterval: any = null;
let isMusicPlaying = false;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a classic referee whistle sound effect
 */
export function playRefereeWhistle() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // We combine two high frequency oscillators with a fast LFO for that classic trill
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2000, now);
    osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.15);
    osc1.frequency.exponentialRampToValueAtTime(1900, now + 0.2);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2050, now);

    // LFO for the trill/vibrato
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 18; // Vibrato depth
    lfoGain.gain.value = 80;

    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    lfo.start(now);
    osc1.start(now);
    osc2.start(now);

    lfo.stop(now + 0.5);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch (err) {
    console.error('Audio synthesis failed:', err);
  }
}

/**
 * Plays a powerful stadium air-horn (vuvuzela / corneta de cancha)
 */
export function playStadiumHorn() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Trumpet/Horn synthesis using saw waves and harmonics
    const osc = ctx.createOscillator();
    const oscHarmonic = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now); // Low resonant note
    osc.frequency.linearRampToValueAtTime(190, now + 0.5);

    oscHarmonic.type = 'sawtooth';
    oscHarmonic.frequency.setValueAtTime(360, now); // Double frequency harmonic
    oscHarmonic.frequency.linearRampToValueAtTime(370, now + 0.5);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.value = 2.0;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.20, now + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(filter);
    oscHarmonic.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    oscHarmonic.start(now);
    osc.stop(now + 0.6);
    oscHarmonic.stop(now + 0.6);
  } catch (err) {
    console.error('Stadium horn failed:', err);
  }
}

/**
 * Plays a synthesized note of the Argentine anthem/Muchachos melody
 */
export function playNote(freq: number, duration: number, delay = 0, type: 'triangle' | 'sine' | 'sawtooth' = 'triangle') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime + delay;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    // Warm envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.03);
    gainNode.gain.linearRampToValueAtTime(0.08, now + duration - 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.1);
  } catch (err) {
    console.error('Anthem melody step error:', err);
  }
}

// "Muchachos, ahora nos volvimos a ilusionar" classic introductory chime notes
// Melody: Re4, Mi4, Fa#4, Sol4, La4, Sol4, Fa#4, Mi4, Re4
const MUCHACHOS_MELODY = [
  { freq: 293.66, dur: 0.25 }, // D4
  { freq: 329.63, dur: 0.25 }, // E4
  { freq: 369.99, dur: 0.25 }, // F#4
  { freq: 392.00, dur: 0.35 }, // G4
  { freq: 440.00, dur: 0.50 }, // A4
  { freq: 392.00, dur: 0.35 }, // G4
  { freq: 369.99, dur: 0.35 }, // F#4
  { freq: 329.63, dur: 0.35 }, // E4
  { freq: 293.66, dur: 0.60 }, // D4
];

/**
 * Loops a friendly synthesised upbeat stadium chant beat
 */
export function startStadiumChant(onStepPlayed?: (stepIndex: number) => void) {
  if (isMusicPlaying) return;
  isMusicPlaying = true;

  const notes = [
    261.63, 293.66, 329.63, 261.63, // C4 D4 E4 C4
    261.63, 293.66, 329.63, 261.63, // C4 D4 E4 C4
    329.63, 349.23, 392.00,        // E4 F4 G4
    329.63, 349.23, 392.00,        // E4 F4 G4
    392.00, 440.00, 392.00, 349.23, 329.63, 261.63, // G4 A4 G4 F4 E4 C4
  ];

  let step = 0;
  
  // Play initial startup note
  playStadiumHorn();

  musicInterval = setInterval(() => {
    try {
      const idx = step % notes.length;
      onStepPlayed?.(idx);
      
      // Every 4th step, hit a synthetic bass drum beat
      if (step % 2 === 0) {
        // Bass kick
        playNote(55, 0.15, 0, 'sine');
      }

      // Play the chime note
      playNote(notes[idx], 0.2, 0, 'triangle');
      
      step++;
    } catch (e) {
      console.warn('Timer step audio issue:', e);
    }
  }, 320); // 180 BPM approx
}

/**
 * Stops any active looping stadium audio
 */
export function stopStadiumChant() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  isMusicPlaying = false;
}

/**
 * Plays the short "Muchachos" intro riff
 */
export function playMuchachosIntro() {
  let delay = 0;
  MUCHACHOS_MELODY.forEach((note) => {
    playNote(note.freq, note.dur, delay, 'sawtooth');
    delay += note.dur + 0.05;
  });
}
