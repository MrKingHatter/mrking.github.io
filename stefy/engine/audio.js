/**
 * audio.js - Audio System
 * Procedural sound effects via Web Audio API. No external audio files needed.
 */

import { System } from './core.js';

export class AudioSystem extends System {
  constructor() {
    super(500);
    this._ctx = null;
    this._enabled = true;
    this._masterGain = null;
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
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
  }

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

  /** Toggle audio */
  toggle() {
    this._enabled = !this._enabled;
    return this._enabled;
  }
}
