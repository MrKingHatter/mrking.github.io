/**
 * core.js - Entity Component System + Game Loop
 * The heart of the engine: World, Entity, Component, System
 */

// --- Component Registry ---
const componentRegistry = new Map();

export function registerComponent(name, defaults = {}) {
  componentRegistry.set(name, defaults);
  return name;
}

// --- Entity ---
let nextEntityId = 1;

export class Entity {
  constructor(world) {
    this.id = nextEntityId++;
    this.components = new Map();
    this.world = world;
    this.alive = true;
    this.tags = new Set();
  }

  add(componentName, data = {}) {
    const defaults = componentRegistry.get(componentName) || {};
    this.components.set(componentName, { ...defaults, ...data });
    this.world._onComponentAdded(this, componentName);
    return this;
  }

  get(componentName) {
    return this.components.get(componentName);
  }

  has(componentName) {
    return this.components.has(componentName);
  }

  remove(componentName) {
    this.components.delete(componentName);
    this.world._onComponentRemoved(this, componentName);
    return this;
  }

  tag(name) {
    this.tags.add(name);
    return this;
  }

  hasTag(name) {
    return this.tags.has(name);
  }

  destroy() {
    this.alive = false;
    this.world._onEntityDestroyed(this);
  }
}

// --- System ---
export class System {
  constructor(priority = 0) {
    this.priority = priority;
    this.world = null;
    this.enabled = true;
  }

  /** Override: called when system is added to world */
  init(world) {}

  /** Override: called each frame */
  update(dt) {}

  /** Override: called each frame after update (for rendering) */
  render(dt) {}

  /** Override: cleanup */
  destroy() {}

  /** Query entities with all specified components */
  query(...componentNames) {
    return this.world.query(...componentNames);
  }
}

// --- World ---
export class World {
  constructor() {
    this.entities = new Map();
    this.systems = [];
    this._queryCache = new Map();
    this._queryCacheDirty = true;
    this.globals = {}; // shared state accessible to all systems
    this.events = new EventBus();
    this._running = false;
    this._lastTime = 0;
    this._rafId = null;
  }

  createEntity() {
    const entity = new Entity(this);
    this.entities.set(entity.id, entity);
    return entity;
  }

  getEntity(id) {
    return this.entities.get(id);
  }

  addSystem(system) {
    system.world = this;
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
    system.init(this);
    return this;
  }

  getSystem(SystemClass) {
    return this.systems.find(s => s instanceof SystemClass);
  }

  query(...componentNames) {
    const results = [];
    for (const entity of this.entities.values()) {
      if (!entity.alive) continue;
      if (componentNames.every(c => entity.has(c))) {
        results.push(entity);
      }
    }
    return results;
  }

  queryTag(tag) {
    const results = [];
    for (const entity of this.entities.values()) {
      if (entity.alive && entity.hasTag(tag)) results.push(entity);
    }
    return results;
  }

  start() {
    this._running = true;
    this._lastTime = performance.now();
    this._tick();
  }

  stop() {
    this._running = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
  }

  _tick() {
    if (!this._running) return;
    const now = performance.now();
    const dt = (now - this._lastTime) / 1000; // seconds
    this._lastTime = now;

    // Cleanup dead entities
    for (const [id, entity] of this.entities) {
      if (!entity.alive) this.entities.delete(id);
    }
    this._queryCacheDirty = false;

    // Update systems
    for (const system of this.systems) {
      if (system.enabled) system.update(dt);
    }

    // Render systems
    for (const system of this.systems) {
      if (system.enabled) system.render(dt);
    }

    this._rafId = requestAnimationFrame(() => this._tick());
  }

  _onComponentAdded(entity, name) {
    this._queryCacheDirty = true;
  }

  _onComponentRemoved(entity, name) {
    this._queryCacheDirty = true;
  }

  _onEntityDestroyed(entity) {
    this._queryCacheDirty = true;
  }
}

// --- Event Bus ---
export class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  on(event, callback) {
    if (!this._listeners.has(event)) this._listeners.set(event, []);
    this._listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const list = this._listeners.get(event);
    if (list) {
      const idx = list.indexOf(callback);
      if (idx >= 0) list.splice(idx, 1);
    }
  }

  emit(event, data) {
    const list = this._listeners.get(event);
    if (list) list.forEach(cb => cb(data));
  }
}
