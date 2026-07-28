/**
 * dialog.js - Dialog System
 * Manages dialog queues, typewriter effect, and DOM overlay.
 */

import { System, registerComponent } from './core.js';

// --- Dialog Component (attached to NPCs) ---
export const DialogData = registerComponent('DialogData', {
  lines: [],         // [{speaker, text}, ...]
  linesAfter: [],    // dialog after first interaction
  interacted: false,
});

// --- Dialog System ---
export class DialogSystem extends System {
  constructor(options = {}) {
    super(800); // after gameplay, before final render
    this._queue = [];
    this._index = 0;
    this._currentLine = null;
    this._typedCount = 0;
    this._typeSpeed = options.typeSpeed || 30; // chars per second
    this._timer = 0;
    this._active = false;
    this._onComplete = null;

    // DOM elements
    this._box = null;
    this._speakerEl = null;
    this._textEl = null;
    this._promptEl = null;
  }

  init(world) {
    world.globals.dialog = this;
    this._box = document.getElementById('dialog-box');
    this._speakerEl = document.getElementById('dialog-speaker');
    this._textEl = document.getElementById('dialog-text');
    this._promptEl = document.getElementById('dialog-prompt');
  }

  /** Is dialog currently showing? */
  get active() {
    return this._active;
  }

  /**
   * Start showing a dialog sequence
   * @param {Array} lines - [{speaker, text}, ...]
   * @param {Function} onComplete - callback when all lines are done
   */
  show(lines, onComplete = null) {
    this._queue = lines;
    this._index = 0;
    this._onComplete = onComplete;
    this._active = true;
    this._showLine();
    this.world.events.emit('dialog:start');
  }

  /** Advance to next line or finish typewriter */
  advance() {
    if (!this._active) return;

    // If still typing, complete the line instantly
    if (this._currentLine && this._typedCount < this._currentLine.text.length) {
      this._typedCount = this._currentLine.text.length;
      this._textEl.textContent = this._currentLine.text;
      this._promptEl.style.display = 'block';
      return;
    }

    // Move to next line
    this._index++;
    if (this._index >= this._queue.length) {
      this._close();
    } else {
      this._showLine();
    }
  }

  update(dt) {
    if (!this._active || !this._currentLine) return;

    // Typewriter effect
    if (this._typedCount < this._currentLine.text.length) {
      this._timer += dt;
      const charsToAdd = Math.floor(this._timer * this._typeSpeed);
      if (charsToAdd > 0) {
        this._typedCount = Math.min(
          this._typedCount + charsToAdd,
          this._currentLine.text.length
        );
        this._textEl.textContent = this._currentLine.text.slice(0, this._typedCount);
        this._timer = 0;

        if (this._typedCount >= this._currentLine.text.length) {
          this._promptEl.style.display = 'block';
        }
      }
    }
  }

  _showLine() {
    this._currentLine = this._queue[this._index];
    this._typedCount = 0;
    this._timer = 0;
    this._box.classList.remove('hidden');
    this._speakerEl.textContent = this._currentLine.speaker || '';
    this._textEl.textContent = '';
    this._promptEl.style.display = 'none';
  }

  _close() {
    this._active = false;
    this._currentLine = null;
    this._queue = [];
    this._box.classList.add('hidden');
    this.world.events.emit('dialog:end');
    if (this._onComplete) {
      const cb = this._onComplete;
      this._onComplete = null;
      cb();
    }
  }
}
