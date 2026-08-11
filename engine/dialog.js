/**
 * dialog.js - Dialog System
 * Manages dialog queues, typewriter effect, choices, and DOM overlay.
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

    // Choice state
    this._choiceMode = false;
    this._choices = null;
    this._choiceIndex = 0;
    this._onChoice = null;

    // DOM elements
    this._box = null;
    this._speakerEl = null;
    this._textEl = null;
    this._promptEl = null;
    this._choicesEl = null;
  }

  init(world) {
    world.globals.dialog = this;
    this._box = document.getElementById('dialog-box');
    this._speakerEl = document.getElementById('dialog-speaker');
    this._textEl = document.getElementById('dialog-text');
    this._promptEl = document.getElementById('dialog-prompt');
    this._choicesEl = document.getElementById('dialog-choices');
  }

  /** Is dialog currently showing? */
  get active() {
    return this._active;
  }

  /** Is currently showing choices? */
  get inChoice() {
    return this._choiceMode;
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
    this._choiceMode = false;
    this._showLine();
    this.world.events.emit('dialog:start');
  }

  /**
   * Show a choice prompt
   * @param {string} question - The question text
   * @param {string} speaker - Speaker name
   * @param {Array} options - [{text, correct}]
   * @param {Function} onCorrect - callback when correct answer chosen
   * @param {string} wrongText - text shown on wrong answer
   */
  showChoice(speaker, question, options, onCorrect, wrongText) {
    this._active = true;
    this._choiceMode = true;
    this._choices = options;
    this._choiceIndex = 0;
    this._onChoice = onCorrect;
    this._wrongText = wrongText || 'Hmm, that doesn\'t seem right. Try again!';
    this._choiceSpeaker = speaker;

    this._box.classList.remove('hidden');
    this._speakerEl.textContent = speaker || '';
    this._textEl.textContent = question;
    this._promptEl.style.display = 'none';
    this._renderChoices();
    this.world.events.emit('dialog:start');
  }

  /** Advance to next line or finish typewriter */
  advance() {
    if (!this._active) return;
    if (this._choiceMode) return; // choices use selectChoice

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

  /** Move choice selection up/down */
  moveChoice(dir) {
    if (!this._choiceMode) return;
    this._choiceIndex = (this._choiceIndex + dir + this._choices.length) % this._choices.length;
    this._renderChoices();
  }

  /** Confirm the current choice */
  selectChoice() {
    if (!this._choiceMode) return;
    const chosen = this._choices[this._choiceIndex];
    if (chosen.correct) {
      this._choiceMode = false;
      this._choicesEl.classList.add('hidden');
      this._close();
      if (this._onChoice) this._onChoice();
    } else {
      // Wrong answer - flash and show hint
      this._textEl.textContent = this._wrongText;
      const items = this._choicesEl.querySelectorAll('.dialog-choice');
      if (items[this._choiceIndex]) {
        items[this._choiceIndex].style.borderColor = '#c62828';
        setTimeout(() => { items[this._choiceIndex].style.borderColor = '#555'; }, 400);
      }
    }
  }

  update(dt) {
    if (!this._active || !this._currentLine) return;
    if (this._choiceMode) return;

    // Typewriter effect
    if (this._typedCount < this._currentLine.text.length) {
      this._timer += dt;
      const charsToAdd = Math.floor(this._timer * this._typeSpeed);
      if (charsToAdd > 0) {
        const prev = this._typedCount;
        this._typedCount = Math.min(
          this._typedCount + charsToAdd,
          this._currentLine.text.length
        );
        this._textEl.textContent = this._currentLine.text.slice(0, this._typedCount);
        this._timer = 0;

        // Blip on every 3rd visible character
        if (this._typedCount > prev && this.world?.globals?.audio) {
          if (this._typedCount % 3 === 0) {
            const ch = this._currentLine.text[this._typedCount - 1];
            if (ch && ch !== ' ') this.world.globals.audio.playBlip();
          }
        }
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
    this._choicesEl.classList.add('hidden');
    this._speakerEl.textContent = this._currentLine.speaker || '';
    this._textEl.textContent = '';
    this._promptEl.style.display = 'none';
  }

  _renderChoices() {
    this._choicesEl.classList.remove('hidden');
    this._choicesEl.innerHTML = '';
    this._choices.forEach((opt, i) => {
      const div = document.createElement('div');
      div.className = 'dialog-choice' + (i === this._choiceIndex ? ' selected' : '');
      div.innerHTML = `<span class="dialog-choice-key">${i + 1})</span> ${opt.text}`;
      this._choicesEl.appendChild(div);
    });
    this._promptEl.style.display = 'block';
    this._promptEl.textContent = '↑↓ Move  Space: Select';
  }

  _close() {
    this._active = false;
    this._currentLine = null;
    this._queue = [];
    this._choiceMode = false;
    this._choicesEl.classList.add('hidden');
    this._box.classList.add('hidden');
    this._promptEl.textContent = '▼ Press Space';
    this.world.events.emit('dialog:end');
    if (this._onComplete) {
      const cb = this._onComplete;
      this._onComplete = null;
      cb();
    }
  }
}
