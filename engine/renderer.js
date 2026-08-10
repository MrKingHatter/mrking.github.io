/**
 * renderer.js - Canvas Renderer System
 * Handles canvas setup, camera, sprite batching, and draw calls.
 */

import { System, registerComponent } from './core.js';

// --- Components ---
export const Position = registerComponent('Position', { x: 0, y: 0, z: 0 });
export const Sprite = registerComponent('Sprite', {
  sheetKey: null,    // key into asset registry
  srcX: 0, srcY: 0, // source rect on spritesheet
  srcW: 16, srcH: 16,
  scale: 2,
  offsetX: 0, offsetY: 0,
  visible: true,
  opacity: 1,
  bobAmount: 0,     // vertical bobbing amplitude
  bobSpeed: 0,      // bobbing frequency
});
export const Camera = registerComponent('Camera', { x: 0, y: 0, zoom: 1 });
export const CameraFollow = registerComponent('CameraFollow', {
  targetTag: 'player', // tag of entity to follow
  smoothing: 8,        // lerp speed (higher = snappier)
  deadZone: 0,         // pixels of dead zone before camera moves
});

// --- Camera Follow System ---
export class CameraFollowSystem extends System {
  constructor() {
    super(950); // runs after scene update (900), before rendering (1000)
  }

  update(dt) {
    const cams = this.query('Camera', 'Position', 'CameraFollow');
    if (cams.length === 0) return;
    for (const cam of cams) {
      const camPos = cam.get('Position');
      const follow = cam.get('CameraFollow');
      const renderer = this.world.globals.renderer;
      if (!renderer) continue;

      // Find target entity
      const targets = this.world.queryTag(follow.targetTag);
      if (targets.length === 0) continue;
      const targetPos = targets[0].get('Position');
      if (!targetPos) continue;

      // Desired camera position = target centered on screen
      const desiredX = targetPos.x - renderer.width / 2 + 16;
      const desiredY = targetPos.y - renderer.height / 2 + 16;

      // Clamp to map bounds
      const tilemaps = this.world.query('TileMap');
      let maxX = Infinity, maxY = Infinity;
      if (tilemaps.length > 0) {
        const tm = tilemaps[0].get('TileMap');
        maxX = tm.cols * tm.tileSize - renderer.width;
        maxY = tm.rows * tm.tileSize - renderer.height;
      }

      const clampedX = Math.max(0, Math.min(desiredX, maxX));
      const clampedY = Math.max(0, Math.min(desiredY, maxY));

      // Direct assignment for immediate follow
      camPos.x = clampedX;
      camPos.y = clampedY;
    }
  }
}

// --- Renderer System ---
export class RendererSystem extends System {
  constructor(canvas, options = {}) {
    super(1000); // high priority = renders last
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = options.width || canvas.width;
    this.height = options.height || canvas.height;
    this.bgColor = options.bgColor || '#1a1a2e';
    this.sheets = new Map(); // name -> offscreen canvas/image
    this._time = 0;

    // Crisp pixels
    this.ctx.imageSmoothingEnabled = false;
    canvas.style.imageRendering = 'pixelated';
  }

  init(world) {
    world.globals.renderer = this;
  }

  registerSheet(name, canvasOrImage) {
    this.sheets.set(name, canvasOrImage);
  }

  getSheet(name) {
    return this.sheets.get(name);
  }

  update(dt) {
    this._time += dt;

    // Clear canvas at start of frame (before tilemap and other systems render)
    const ctx = this.ctx;
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  render(dt) {
    const ctx = this.ctx;

    // Get camera offset
    let camX = 0, camY = 0;
    const cameras = this.query('Camera', 'Position');
    if (cameras.length > 0) {
      const camPos = cameras[0].get('Position');
      camX = camPos.x;
      camY = camPos.y;
    }

    // Gather drawable entities, sort by z then y
    const drawables = this.query('Position', 'Sprite');
    drawables.sort((a, b) => {
      const az = a.get('Position').z, bz = b.get('Position').z;
      if (az !== bz) return az - bz;
      return a.get('Position').y - b.get('Position').y;
    });

    for (const entity of drawables) {
      const pos = entity.get('Position');
      const spr = entity.get('Sprite');
      if (!spr.visible) continue;

      const sheetCanvas = this.sheets.get(spr.sheetKey);
      if (!sheetCanvas) continue;

      let drawY = pos.y + spr.offsetY;
      if (spr.bobAmount > 0) {
        drawY += Math.sin(this._time * spr.bobSpeed + pos.x * 0.5) * spr.bobAmount;
      }

      if (spr.opacity < 1) ctx.globalAlpha = spr.opacity;
      ctx.drawImage(
        sheetCanvas,
        spr.srcX, spr.srcY, spr.srcW, spr.srcH,
        pos.x - camX + spr.offsetX,
        drawY - camY,
        spr.srcW * spr.scale,
        spr.srcH * spr.scale
      );
      if (spr.opacity < 1) ctx.globalAlpha = 1;
    }
  }

  // Utility: draw text (for UI overlays)
  drawText(text, x, y, options = {}) {
    const ctx = this.ctx;
    ctx.font = options.font || '14px monospace';
    ctx.fillStyle = options.color || '#f0e6d3';
    ctx.textAlign = options.align || 'left';
    ctx.fillText(text, x, y);
    ctx.textAlign = 'left';
  }

  // Utility: fill rect with alpha
  overlay(color, alpha) {
    this.ctx.fillStyle = color.includes('rgba') ? color : `rgba(0,0,0,${alpha})`;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}
