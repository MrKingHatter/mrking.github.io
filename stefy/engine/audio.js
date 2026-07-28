/**
 * audio.js - Audio System
 * Procedural sound effects and background music via Web Audio API.
 * No external audio files needed.
 */

import { System } from './core.js';

// --- Chiptune Music Data ---
// Notes as MIDI-style numbers (C4=60). 0 = rest.
const NOTE_FREQ = n => n === 0 ? 0 : 440 * Math.pow(2, (n - 69) / 12);

// Cute, gentle melody in C major / A minor — loops every 32 beats
const MELODY = [
  72, 0, 76, 0, 79, 0, 76, 0, 72, 0, 74, 0, 76, 72, 0, 0,
  71, 0, 74, 0, 76, 0, 79, 0, 81, 0, 79, 76, 74, 0, 0, 0,
  72, 0, 76, 0, 79, 0, 84, 0, 83, 0, 81, 0, 79, 76, 0, 0,
  74, 0, 76, 0, 74, 72, 71, 0, 72, 0, 0, 0, 0, 0, 0, 0,
];

// Bass line (lower octave, simple root notes)
const BASS = [
  48, 0, 0, 0, 48, 0, 0, 0, 53, 0, 0, 0, 53, 0, 0, 0,
  52, 0, 0, 0, 52, 0, 0, 0, 55, 0, 0, 0, 55, 0, 0, 0,
  48, 0, 0, 0, 48, 0, 0, 0, 53, 0, 0, 0, 53, 0, 0, 0,
  50, 0, 0, 0, 55, 0, 0, 0, 48, 0, 0, 0, 48, 0, 0, 0,
];

// Arpeggio pattern (gentle background shimmer)
const ARP = [
  60, 64, 67, 72, 60, 64, 67, 72, 65, 69, 72, 77, 65, 69, 72, 77,
  64, 67, 71, 76, 64, 67, 71, 76, 67, 71, 74, 79, 67, 71, 74, 79,
  60, 64, 67, 72, 60, 64, 67, 72, 65, 69, 72, 77, 65, 69, 72, 77,
  62, 65, 69, 74, 67, 71, 74, 79, 60, 64, 67, 72, 60, 64, 67, 72,
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
    this._bpm = 140;
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

    // Melody voice (square, soft)
    const melNote = MELODY[step];
    if (melNote) this._playMusicNote(NOTE_FREQ(melNote), beatDur * 0.7, 'square', 0.35);

    // Bass voice (triangle, warm)
    const bassNote = BASS[step];
    if (bassNote) this._playMusicNote(NOTE_FREQ(bassNote), beatDur * 0.9, 'triangle', 0.5);

    // Arpeggio voice (sine, very quiet shimmer)
    const arpNote = ARP[step];
    if (arpNote) this._playMusicNote(NOTE_FREQ(arpNote), beatDur * 0.3, 'sine', 0.15);

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
