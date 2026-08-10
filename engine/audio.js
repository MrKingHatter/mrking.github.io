/**
 * audio.js - Audio System
 * Procedural sound effects and background music via Web Audio API.
 * No external audio files needed.
 */

import { System } from './core.js';

// --- Chiptune Music Data ---
// Notes as MIDI-style numbers (C4=60). 0 = rest.
const NOTE_FREQ = n => n === 0 ? 0 : 440 * Math.pow(2, (n - 69) / 12);

// Sneaky night-time melody — minor key, sparse, suspenseful
const MELODY = [
  64, 0, 0, 0, 63, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0,
  67, 0, 0, 0, 66, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0,
  63, 0, 0, 0, 60, 0, 0, 0, 63, 0, 64, 0, 0, 0, 0, 0,
  67, 0, 0, 0, 0, 0, 63, 0, 60, 0, 0, 0, 0, 0, 0, 0,
];

// Deep sparse bass — root notes with long rests
const BASS = [
  40, 0, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0, 0, 0, 0, 0,
  43, 0, 0, 0, 0, 0, 0, 0, 43, 0, 0, 0, 0, 0, 0, 0,
  39, 0, 0, 0, 0, 0, 0, 0, 39, 0, 0, 0, 0, 0, 0, 0,
  43, 0, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0, 0, 0, 0, 0,
];

// Quiet high shimmer — sparse twinkling notes
const ARP = [
  76, 0, 0, 0, 0, 0, 72, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  79, 0, 0, 0, 0, 0, 0, 0, 75, 0, 0, 0, 0, 0, 0, 0,
  72, 0, 0, 0, 0, 0, 75, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  79, 0, 0, 0, 0, 0, 0, 0, 76, 0, 0, 0, 0, 0, 0, 0,
];

export class AudioSystem extends System {
  constructor() {
    super(500);
    this._ctx = null;
    this._enabled = true;
    this._masterGain = null;
    this._musicPlaying = false;
    this._musicGain = null;
    this._musicTimer = null;
    this._musicStep = 0;
    this._musicEnabled = true;
    this._bpm = 80;
  }

  init(world) {
    world.globals.audio = this;
    // Defer AudioContext creation until user interaction (browser policy)
    const unlock = () => {
      if (!this._ctx) {
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        this._masterGain = this._ctx.createGain();
        this._masterGain.gain.value = 0.3;
        this._masterGain.connect(this._ctx.destination);
        this._musicGain = this._ctx.createGain();
        this._musicGain.gain.value = 0.25;
        this._musicGain.connect(this._masterGain);
        if (this._musicEnabled) this.startMusic();
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
  }

  // --- Music ---

  startMusic() {
    if (this._musicPlaying || !this._ctx) return;
    this._musicPlaying = true;
    this._musicStep = 0;
    this._scheduleMusic();
  }

  stopMusic() {
    this._musicPlaying = false;
    if (this._musicTimer) {
      clearTimeout(this._musicTimer);
      this._musicTimer = null;
    }
  }

  toggleMusic() {
    this._musicEnabled = !this._musicEnabled;
    if (this._musicEnabled) this.startMusic();
    else this.stopMusic();
    return this._musicEnabled;
  }

  _scheduleMusic() {
    if (!this._musicPlaying || !this._ctx) return;
    const beatDur = 60 / this._bpm;
    const step = this._musicStep % MELODY.length;

    // Melody voice (sine, soft and mysterious)
    const melNote = MELODY[step];
    if (melNote) this._playMusicNote(NOTE_FREQ(melNote), beatDur * 0.9, 'sine', 0.3);

    // Bass voice (triangle, deep and warm)
    const bassNote = BASS[step];
    if (bassNote) this._playMusicNote(NOTE_FREQ(bassNote), beatDur * 1.2, 'triangle', 0.4);

    // Shimmer voice (sine, barely audible twinkle)
    const arpNote = ARP[step];
    if (arpNote) this._playMusicNote(NOTE_FREQ(arpNote), beatDur * 0.5, 'sine', 0.08);

    this._musicStep++;
    this._musicTimer = setTimeout(() => this._scheduleMusic(), beatDur * 1000);
  }

  _playMusicNote(freq, duration, type, volume) {
    if (!this._ctx || !this._musicGain) return;
    const t = this._ctx.currentTime;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(this._musicGain);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  // --- SFX ---

  /** Play a short procedural beep/chime */
  playTone(frequency = 440, duration = 0.1, type = 'square', volume = 0.5) {
    if (!this._ctx || !this._enabled) return;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume * 0.3;
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this._masterGain);
    osc.start();
    osc.stop(this._ctx.currentTime + duration);
  }

  /** Pickup chime */
  playPickup() {
    this.playTone(523, 0.08, 'square');
    setTimeout(() => this.playTone(659, 0.08, 'square'), 80);
    setTimeout(() => this.playTone(784, 0.15, 'square'), 160);
  }

  /** Dialog blip */
  playBlip() {
    this.playTone(300 + Math.random() * 200, 0.04, 'square', 0.2);
  }

  /** Transition whoosh */
  playTransition() {
    this.playTone(200, 0.3, 'sawtooth', 0.2);
  }

  /** Step sound */
  playStep() {
    this.playTone(100 + Math.random() * 50, 0.05, 'triangle', 0.15);
  }

  /** Toggle audio (all) */
  toggle() {
    this._enabled = !this._enabled;
    if (!this._enabled) this.stopMusic();
    else if (this._musicEnabled) this.startMusic();
    return this._enabled;
  }
}
