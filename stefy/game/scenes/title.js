/**
 * title.js - Title Screen Scene
 * Draws the shared bouquet sprite on the title canvas.
 */

import { Scene } from '../../../engine/index.js';
import { drawBouquet } from '../data/bouquet.js';

export class TitleScene extends Scene {
  constructor() {
    super('title');
    this._titleEl = null;
    this._ready = false;
    this._clickHandler = null;
  }

  enter() {
    this._titleEl = document.getElementById('title-screen');
    this._titleEl.classList.remove('hidden');
    this._ready = false;
    this._drawTitleBouquet();

    // Small delay before accepting input (avoids accidental skip)
    setTimeout(() => { this._ready = true; }, 300);

    // Also allow click/tap to start
    this._clickHandler = () => { if (this._ready) this._start(); };
    this._titleEl.addEventListener('click', this._clickHandler);
    this._titleEl.addEventListener('touchend', this._clickHandler);
  }

  update(dt) {
    if (!this._ready) return;
    const input = this.world.globals.input;
    if (input.actionPressed('interact')) {
      this._start();
    }
  }

  _start() {
    if (!this._titleEl) return;
    this._cleanup();
    this._titleEl.classList.add('hidden');
    this.manager.transitionTo('level', { level: 1, flowers: 0 });
    this.world.globals.audio?.playTransition();
  }

  _cleanup() {
    if (this._clickHandler && this._titleEl) {
      this._titleEl.removeEventListener('click', this._clickHandler);
      this._titleEl.removeEventListener('touchend', this._clickHandler);
      this._clickHandler = null;
    }
  }

  exit() {
    this._cleanup();
    if (this._titleEl) this._titleEl.classList.add('hidden');
  }

  _drawTitleBouquet() {
    const canvas = document.getElementById('title-art');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBouquet(ctx, 0, 0);
  }
}
