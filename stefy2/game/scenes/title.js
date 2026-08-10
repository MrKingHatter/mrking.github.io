/**
 * title.js – Title screen scene
 */
import { Scene } from '../../../engine/index.js';

export class TitleScene extends Scene {
  constructor() {
    super('title');
    this._handler = null;
  }

  enter() {
    const titleEl = document.getElementById('title-screen');
    titleEl.style.display = 'flex';

    this._handler = (e) => {
      if (e.type === 'keydown' && e.code === 'Space') this._start();
      if (e.type === 'keydown' && e.code === 'KeyL') this._debug();
      if (e.type === 'click') this._start();
    };
    window.addEventListener('keydown', this._handler);
    document.getElementById('title-screen').addEventListener('click', this._handler);
  }

  _start() {
    window.removeEventListener('keydown', this._handler);
    document.getElementById('title-screen').removeEventListener('click', this._handler);
    document.getElementById('title-screen').style.display = 'none';
    this.manager.switchTo('prologue');
  }

  _debug() {
    window.removeEventListener('keydown', this._handler);
    document.getElementById('title-screen').removeEventListener('click', this._handler);
    document.getElementById('title-screen').style.display = 'none';
    this.manager.switchTo('levelselect', { debug: true });
  }

  update() {}
  exit() {
    window.removeEventListener('keydown', this._handler);
    const el = document.getElementById('title-screen');
    if (el) { el.removeEventListener('click', this._handler); el.style.display = 'none'; }
  }
}
