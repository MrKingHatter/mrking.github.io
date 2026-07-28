/**
 * title.js - Title Screen Scene
 */

import { Scene } from '../../engine/index.js';

export class TitleScene extends Scene {
  constructor() {
    super('title');
    this._titleEl = null;
  }

  enter() {
    this._titleEl = document.getElementById('title-screen');
    this._titleEl.classList.remove('hidden');
  }

  update(dt) {
    const input = this.world.globals.input;
    if (input.actionPressed('interact')) {
      this._titleEl.classList.add('hidden');
      this.manager.transitionTo('level', { level: 1, flowers: 0 });
      this.world.globals.audio?.playTransition();
    }
  }

  exit() {
    this._titleEl.classList.add('hidden');
  }
}
