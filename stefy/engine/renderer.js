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
  bobAmount: 0,     // vertical bobbing amplitude
  bobSpeed: 0,      // bobbing frequency
});
export const Camera = registerComponent('Camera', { x: 0, y: 0, zoom: 1 });

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
  }

  render(dt) {
    const ctx = this.ctx;
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.width, this.height);

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

      ctx.drawImage(
        sheetCanvas,
        spr.srcX, spr.srcY, spr.srcW, spr.srcH,
        pos.x - camX + spr.offsetX,
        drawY - camY,
        spr.srcW * spr.scale,
        spr.srcH * spr.scale
      );
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
