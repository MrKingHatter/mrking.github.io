/**
 * index.js - Engine barrel export
 * Import everything from here for convenience.
 */

export { World, Entity, System, EventBus, registerComponent } from './core.js';
export { RendererSystem, Position, Sprite, Camera, CameraFollow, CameraFollowSystem } from './renderer.js';
export { InputSystem } from './input.js';
export { Scene, SceneManager } from './scene.js';
export { SpriteSheet, PaletteSprite, AssetPipeline } from './sprites.js';
export { TileMap, TileMapRenderer, GridPhysics, GridCollider } from './tilemap.js';
export { DialogSystem, DialogData } from './dialog.js';
export { AudioSystem } from './audio.js';
export { StealthSystem, StealthGuard } from './stealth.js';
