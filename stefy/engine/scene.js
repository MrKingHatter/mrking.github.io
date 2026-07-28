/**
 * scene.js - Scene Manager System
 * Manages scene stack, transitions (fade in/out), and lifecycle.
 */

import { System } from './core.js';

// --- Scene Base Class ---
export class Scene {
  constructor(name) {
    this.name = name;
    this.world = null;
    this.manager = null;
  }

  /** Called when scene becomes active */
  enter(params) {}

  /** Called each frame while active */
  update(dt) {}

  /** Called each frame for rendering (after systems render) */
  render(dt) {}

  /** Called when scene is deactivated */
  exit() {}
}

// --- Scene Manager System ---
export class SceneManager extends System {
  constructor() {
    super(900); // render near-end, after entities but before final overlay
    this._scenes = new Map();
    this._activeScene = null;
    this._transition = null; // { phase, alpha, duration, nextScene, params }
  }

  init(world) {
    world.globals.scenes = this;
  }

  /** Register a scene */
  register(scene) {
    scene.world = this.world;
    scene.manager = this;
    this._scenes.set(scene.name, scene);
    return this;
  }

  /** Get registered scene by name */
  get(name) {
    return this._scenes.get(name);
  }

  /** Switch to a scene immediately (no transition) */
  switchTo(name, params = {}) {
    if (this._activeScene) this._activeScene.exit();
    this._activeScene = this._scenes.get(name);
    if (this._activeScene) this._activeScene.enter(params);
  }

  /** Transition to a scene with fade */
  transitionTo(name, params = {}, duration = 0.5) {
    this._transition = {
      phase: 'out', // 'out' then 'in'
      alpha: 0,
      duration,
      nextScene: name,
      params,
    };
  }

  /** Get the currently active scene */
  get active() {
    return this._activeScene;
  }

  update(dt) {
    // Update transition
    if (this._transition) {
      const t = this._transition;
      const speed = 1 / t.duration;

      if (t.phase === 'out') {
        t.alpha += speed * dt;
        if (t.alpha >= 1) {
          t.alpha = 1;
          t.phase = 'in';
          // Do the actual switch
          if (this._activeScene) this._activeScene.exit();
          this._activeScene = this._scenes.get(t.nextScene);
          if (this._activeScene) this._activeScene.enter(t.params);
        }
      } else if (t.phase === 'in') {
        t.alpha -= speed * dt;
        if (t.alpha <= 0) {
          t.alpha = 0;
          this._transition = null;
        }
      }
    }

    // Update active scene
    if (this._activeScene) this._activeScene.update(dt);
  }

  render(dt) {
    // Render active scene overlay
    if (this._activeScene) this._activeScene.render(dt);

    // Draw transition overlay
    if (this._transition && this._transition.alpha > 0) {
      const renderer = this.world.globals.renderer;
      if (renderer) {
        renderer.ctx.fillStyle = `rgba(26,26,46,${this._transition.alpha})`;
        renderer.ctx.fillRect(0, 0, renderer.width, renderer.height);
      }
    }
  }
}
