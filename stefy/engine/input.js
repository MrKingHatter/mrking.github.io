/**
 * input.js - Input System
 * Keyboard + mouse input with action mapping.
 */

import { System } from './core.js';

export class InputSystem extends System {
  constructor() {
    super(-100); // very early priority
    this._keys = new Set();
    this._keysJustPressed = new Set();
    this._keysJustReleased = new Set();
    this._prevKeys = new Set();
    this._mouse = { x: 0, y: 0, down: false, justPressed: false };
    this._actions = new Map(); // action name -> array of key codes
    this._bound = false;
  }

  init(world) {
    world.globals.input = this;
    this._bindEvents();
  }

  /** Map an action name to one or more key codes */
  mapAction(name, ...keyCodes) {
    this._actions.set(name, keyCodes);
    return this;
  }

  /** Is key currently held? */
  isDown(code) {
    return this._keys.has(code);
  }

  /** Was key just pressed this frame? */
  isPressed(code) {
    return this._keysJustPressed.has(code);
  }

  /** Was key just released this frame? */
  isReleased(code) {
    return this._keysJustReleased.has(code);
  }

  /** Is action currently held? */
  actionDown(name) {
    const codes = this._actions.get(name);
    return codes ? codes.some(c => this._keys.has(c)) : false;
  }

  /** Was action just pressed this frame? */
  actionPressed(name) {
    const codes = this._actions.get(name);
    return codes ? codes.some(c => this._keysJustPressed.has(c)) : false;
  }

  /** Mouse state */
  get mouse() { return this._mouse; }

  update(dt) {
    // Compute just-pressed and just-released
    this._keysJustPressed.clear();
    this._keysJustReleased.clear();

    for (const key of this._keys) {
      if (!this._prevKeys.has(key)) this._keysJustPressed.add(key);
    }
    for (const key of this._prevKeys) {
      if (!this._keys.has(key)) this._keysJustReleased.add(key);
    }

    this._prevKeys = new Set(this._keys);
    this._mouse.justPressed = false;
  }

  _bindEvents() {
    if (this._bound) return;
    this._bound = true;

    window.addEventListener('keydown', (e) => {
      this._keys.add(e.code);
      // Prevent scrolling for game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this._keys.delete(e.code);
    });

    window.addEventListener('mousedown', (e) => {
      this._mouse.down = true;
      this._mouse.justPressed = true;
    });

    window.addEventListener('mouseup', () => {
      this._mouse.down = false;
    });

    window.addEventListener('mousemove', (e) => {
      const rect = document.getElementById('game-canvas')?.getBoundingClientRect();
      if (rect) {
        this._mouse.x = e.clientX - rect.left;
        this._mouse.y = e.clientY - rect.top;
      }
    });

    // Prevent context menu on canvas
    document.getElementById('game-canvas')?.addEventListener('contextmenu', e => e.preventDefault());
  }

  destroy() {
    // In a full implementation, we'd remove event listeners
  }
}
