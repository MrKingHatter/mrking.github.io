/**
 * audio.js - Audio System
 * Procedural sound effects and per-scene background music via Web Audio API.
 * No external audio files needed.
 */

import { System } from './core.js';

const NOTE_FREQ = n => n === 0 ? 0 : 440 * Math.pow(2, (n - 69) / 12);

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
    this._tracks = {};
    this._track = null;
    this._trackName = null;
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

  registerTracks(tracks) {
    this._tracks = tracks;
    if (!this._track) {
      const first = Object.values(tracks)[0];
      if (first) { this._track = first; this._trackName = Object.keys(tracks)[0]; }
    }
  }

  setTrack(name) {
    const t = this._tracks[name];
    if (!t || t === this._track) return;
    if (this._musicPlaying && this._ctx && this._musicGain) {
      // Crossfade: fade out over 0.8s, then switch
      const now = this._ctx.currentTime;
      this._musicGain.gain.setValueAtTime(this._musicGain.gain.value, now);
      this._musicGain.gain.linearRampToValueAtTime(0.001, now + 0.8);
      clearTimeout(this._fadeTimer);
      this._fadeTimer = setTimeout(() => {
        this._track = t;
        this._trackName = name;
        this._musicStep = 0;
        this.stopMusic();
        this._musicGain.gain.setValueAtTime(0.001, this._ctx.currentTime);
        this._musicGain.gain.linearRampToValueAtTime(0.25, this._ctx.currentTime + 0.6);
        this.startMusic();
      }, 800);
    } else {
      this._track = t;
      this._trackName = name;
      this._musicStep = 0;
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
    if (!this._musicPlaying || !this._ctx || !this._track) return;
    const track = this._track;
    const beatDur = 60 / track.bpm;
    const step = this._musicStep % track.melody.length;

    const melNote = track.melody[step];
    if (melNote) this._playMusicNote(NOTE_FREQ(melNote), beatDur * 0.7, track.melType || 'square', track.melVol);

    const bassNote = track.bass[step];
    if (bassNote) this._playMusicNote(NOTE_FREQ(bassNote), beatDur * 0.9, track.bassType || 'triangle', track.bassVol);

    const arpNote = track.arp[step];
    if (arpNote) this._playMusicNote(NOTE_FREQ(arpNote), beatDur * 0.3, track.arpType || 'sine', track.arpVol);

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
    this.playTone(300 + Math.random() * 200, 0.03, 'square', 0.06);
  }

  /** Transition whoosh */
  playTransition() {
    this.playTone(200, 0.3, 'sawtooth', 0.2);
  }

  /** Step sound */
  playStep() {
    this.playTone(100 + Math.random() * 50, 0.04, 'triangle', 0.07);
  }

  /** Toggle audio (all) */
  toggle() {
    this._enabled = !this._enabled;
    if (!this._enabled) this.stopMusic();
    else if (this._musicEnabled) this.startMusic();
    return this._enabled;
  }
}
