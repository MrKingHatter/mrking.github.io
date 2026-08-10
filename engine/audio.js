/**
 * audio.js - Audio System
 * Procedural sound effects and per-scene background music via Web Audio API.
 * No external audio files needed.
 */

import { System } from './core.js';

const NOTE_FREQ = n => n === 0 ? 0 : 440 * Math.pow(2, (n - 69) / 12);

// Per-scene music tracks: { melody, bass, arp, bpm, melodyType, bassType, arpType, melodyVol, bassVol, arpVol }
const TRACKS = {
  title: {
    bpm: 65,
    melody: [
      60, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 67, 0, 0, 0,
      0, 0, 0, 0, 65, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      60, 0, 0, 0, 0, 0, 62, 0, 0, 0, 0, 0, 64, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [
      48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      43, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    arp: [
      72, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 76, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      72, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    melodyType: 'sine', bassType: 'triangle', arpType: 'sine',
    melodyVol: 0.25, bassVol: 0.3, arpVol: 0.06,
  },
  prologue: {
    bpm: 55,
    melody: [
      60, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0,
      65, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      67, 0, 0, 0, 0, 0, 0, 0, 65, 0, 0, 0, 0, 0, 0, 0,
      64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [
      48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    arp: [
      0, 0, 0, 0, 0, 0, 0, 0, 72, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 74, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    melodyType: 'sine', bassType: 'triangle', arpType: 'sine',
    melodyVol: 0.2, bassVol: 0.2, arpVol: 0.05,
  },
  stealth: {
    bpm: 80,
    melody: [
      64, 0, 0, 0, 63, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0,
      67, 0, 0, 0, 66, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0,
      63, 0, 0, 0, 60, 0, 0, 0, 63, 0, 64, 0, 0, 0, 0, 0,
      67, 0, 0, 0, 0, 0, 63, 0, 60, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [
      40, 0, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0, 0, 0, 0, 0,
      43, 0, 0, 0, 0, 0, 0, 0, 43, 0, 0, 0, 0, 0, 0, 0,
      39, 0, 0, 0, 0, 0, 0, 0, 39, 0, 0, 0, 0, 0, 0, 0,
      43, 0, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0, 0, 0, 0, 0,
    ],
    arp: [
      76, 0, 0, 0, 0, 0, 72, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      79, 0, 0, 0, 0, 0, 0, 0, 75, 0, 0, 0, 0, 0, 0, 0,
      72, 0, 0, 0, 0, 0, 75, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      79, 0, 0, 0, 0, 0, 0, 0, 76, 0, 0, 0, 0, 0, 0, 0,
    ],
    melodyType: 'sine', bassType: 'triangle', arpType: 'sine',
    melodyVol: 0.3, bassVol: 0.4, arpVol: 0.08,
  },
  puzzle: {
    bpm: 90,
    melody: [
      60, 0, 64, 0, 67, 0, 0, 0, 65, 0, 0, 0, 64, 0, 0, 0,
      62, 0, 0, 0, 60, 0, 0, 0, 62, 0, 64, 0, 0, 0, 0, 0,
      65, 0, 67, 0, 69, 0, 0, 0, 67, 0, 0, 0, 65, 0, 0, 0,
      64, 0, 0, 0, 62, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [
      48, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0,
      45, 0, 0, 0, 0, 0, 0, 0, 45, 0, 0, 0, 0, 0, 0, 0,
      43, 0, 0, 0, 0, 0, 0, 0, 43, 0, 0, 0, 0, 0, 0, 0,
      45, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0,
    ],
    arp: [
      72, 0, 0, 0, 76, 0, 0, 0, 79, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 76, 0, 0, 0, 0, 0, 0, 0,
      72, 0, 0, 0, 0, 0, 0, 0, 76, 0, 0, 0, 79, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    melodyType: 'sine', bassType: 'triangle', arpType: 'sine',
    melodyVol: 0.3, bassVol: 0.35, arpVol: 0.08,
  },
  chase: {
    bpm: 120,
    melody: [
      65, 0, 69, 0, 72, 0, 69, 0, 65, 0, 0, 0, 67, 0, 0, 0,
      69, 0, 72, 0, 74, 0, 0, 0, 72, 0, 69, 0, 0, 0, 0, 0,
      65, 0, 67, 0, 69, 0, 72, 0, 74, 0, 0, 0, 72, 0, 0, 0,
      69, 0, 0, 0, 67, 0, 65, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [
      41, 0, 0, 0, 41, 0, 0, 0, 41, 0, 0, 0, 41, 0, 0, 0,
      43, 0, 0, 0, 43, 0, 0, 0, 43, 0, 0, 0, 43, 0, 0, 0,
      45, 0, 0, 0, 45, 0, 0, 0, 45, 0, 0, 0, 45, 0, 0, 0,
      43, 0, 0, 0, 43, 0, 0, 0, 41, 0, 0, 0, 41, 0, 0, 0,
    ],
    arp: [
      77, 0, 72, 0, 0, 0, 77, 0, 72, 0, 0, 0, 77, 0, 72, 0,
      79, 0, 74, 0, 0, 0, 79, 0, 74, 0, 0, 0, 0, 0, 0, 0,
      77, 0, 72, 0, 0, 0, 77, 0, 72, 0, 0, 0, 77, 0, 72, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    melodyType: 'square', bassType: 'triangle', arpType: 'sine',
    melodyVol: 0.25, bassVol: 0.4, arpVol: 0.07,
  },
  explore: {
    bpm: 75,
    melody: [
      62, 0, 0, 0, 0, 0, 65, 0, 0, 0, 0, 0, 69, 0, 0, 0,
      0, 0, 0, 0, 67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      65, 0, 0, 0, 0, 0, 62, 0, 0, 0, 0, 0, 60, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 62, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [
      38, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      41, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      43, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      38, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    arp: [
      74, 0, 0, 0, 0, 0, 0, 0, 69, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      74, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    melodyType: 'sine', bassType: 'triangle', arpType: 'sine',
    melodyVol: 0.25, bassVol: 0.3, arpVol: 0.06,
  },
  trade: {
    bpm: 95,
    melody: [
      62, 0, 65, 0, 0, 0, 67, 0, 69, 0, 0, 0, 67, 0, 0, 0,
      65, 0, 0, 0, 62, 0, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0,
      62, 0, 0, 0, 65, 0, 67, 0, 69, 0, 0, 0, 70, 0, 69, 0,
      67, 0, 0, 0, 65, 0, 0, 0, 62, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [
      38, 0, 0, 0, 38, 0, 0, 0, 0, 0, 0, 0, 38, 0, 0, 0,
      41, 0, 0, 0, 41, 0, 0, 0, 0, 0, 0, 0, 41, 0, 0, 0,
      43, 0, 0, 0, 43, 0, 0, 0, 0, 0, 0, 0, 43, 0, 0, 0,
      41, 0, 0, 0, 41, 0, 0, 0, 0, 0, 0, 0, 38, 0, 0, 0,
    ],
    arp: [
      74, 0, 0, 0, 0, 0, 69, 0, 0, 0, 0, 0, 74, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      74, 0, 0, 0, 0, 0, 69, 0, 0, 0, 0, 0, 74, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    melodyType: 'square', bassType: 'triangle', arpType: 'sine',
    melodyVol: 0.2, bassVol: 0.35, arpVol: 0.06,
  },
  precision: {
    bpm: 60,
    melody: [
      67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      62, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [
      43, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    arp: [
      79, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      76, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    melodyType: 'sine', bassType: 'triangle', arpType: 'sine',
    melodyVol: 0.2, bassVol: 0.25, arpVol: 0.05,
  },
  finale: {
    bpm: 110,
    melody: [
      60, 0, 64, 0, 67, 0, 72, 0, 0, 0, 71, 0, 72, 0, 0, 0,
      69, 0, 0, 0, 67, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      65, 0, 69, 0, 72, 0, 76, 0, 0, 0, 74, 0, 72, 0, 0, 0,
      69, 0, 67, 0, 64, 0, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [
      48, 0, 0, 0, 48, 0, 0, 0, 48, 0, 0, 0, 48, 0, 0, 0,
      45, 0, 0, 0, 45, 0, 0, 0, 45, 0, 0, 0, 45, 0, 0, 0,
      41, 0, 0, 0, 41, 0, 0, 0, 41, 0, 0, 0, 41, 0, 0, 0,
      43, 0, 0, 0, 43, 0, 0, 0, 48, 0, 0, 0, 48, 0, 0, 0,
    ],
    arp: [
      72, 0, 76, 0, 79, 0, 0, 0, 76, 0, 72, 0, 0, 0, 0, 0,
      69, 0, 72, 0, 76, 0, 0, 0, 72, 0, 0, 0, 0, 0, 0, 0,
      77, 0, 72, 0, 77, 0, 0, 0, 72, 0, 0, 0, 0, 0, 0, 0,
      76, 0, 72, 0, 76, 0, 0, 0, 79, 0, 0, 0, 0, 0, 0, 0,
    ],
    melodyType: 'square', bassType: 'triangle', arpType: 'sine',
    melodyVol: 0.3, bassVol: 0.4, arpVol: 0.08,
  },
  vignette: {
    bpm: 50,
    melody: [
      64, 0, 0, 0, 0, 0, 0, 0, 67, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      65, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [
      48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    arp: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      76, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      72, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    melodyType: 'sine', bassType: 'sine', arpType: 'sine',
    melodyVol: 0.2, bassVol: 0.15, arpVol: 0.05,
  },
  levelselect: {
    bpm: 100,
    melody: [
      67, 0, 0, 0, 69, 0, 0, 0, 71, 0, 0, 0, 72, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      72, 0, 0, 0, 71, 0, 0, 0, 69, 0, 0, 0, 67, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    bass: [
      43, 0, 0, 0, 0, 0, 0, 0, 43, 0, 0, 0, 0, 0, 0, 0,
      48, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0,
      45, 0, 0, 0, 0, 0, 0, 0, 45, 0, 0, 0, 0, 0, 0, 0,
      43, 0, 0, 0, 0, 0, 0, 0, 43, 0, 0, 0, 0, 0, 0, 0,
    ],
    arp: [
      79, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 76, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      79, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    melodyType: 'sine', bassType: 'triangle', arpType: 'sine',
    melodyVol: 0.25, bassVol: 0.3, arpVol: 0.06,
  },
};

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
    this._track = TRACKS.title;
  }

  init(world) {
    world.globals.audio = this;
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

  setTrack(name) {
    const t = TRACKS[name];
    if (!t || t === this._track) return;
    this._track = t;
    this._musicStep = 0;
    if (this._musicPlaying) {
      this.stopMusic();
      this.startMusic();
    }
  }

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
    const track = this._track;
    const beatDur = 60 / track.bpm;
    const step = this._musicStep % track.melody.length;

    const melNote = track.melody[step];
    if (melNote) this._playMusicNote(NOTE_FREQ(melNote), beatDur * 0.9, track.melodyType, track.melodyVol);

    const bassNote = track.bass[step];
    if (bassNote) this._playMusicNote(NOTE_FREQ(bassNote), beatDur * 1.2, track.bassType, track.bassVol);

    const arpNote = track.arp[step];
    if (arpNote) this._playMusicNote(NOTE_FREQ(arpNote), beatDur * 0.5, track.arpType, track.arpVol);

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
