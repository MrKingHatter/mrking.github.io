/**
 * tilemap.js - TileMap Component + Renderer System
 * Grid-based tilemap with collision queries.
 */

import { System, registerComponent } from './core.js';

// --- TileMap Component ---
export const TileMap = registerComponent('TileMap', {
  data: null,       // 2D array [row][col] of tile indices
  cols: 20,
  rows: 15,
  tileSize: 32,
  sheetKey: null,   // spritesheet name for tiles
  tileRegions: [],  // array of {x, y, w, h} indexed by tile type
  solidTiles: [],   // array of tile indices that block movement
});

// --- TileMap Renderer System ---
export class TileMapRenderer extends System {
  constructor() {
    super(0); // renders first (background)
  }

  render(dt) {
    const renderer = this.world.globals.renderer;
    if (!renderer) return;

    // Get camera offset
    let camX = 0, camY = 0;
    const cameras = this.world.query('Camera', 'Position');
    if (cameras.length > 0) {
      const camPos = cameras[0].get('Position');
      camX = camPos.x;
      camY = camPos.y;
    }

    const tilemaps = this.query('TileMap');
    for (const entity of tilemaps) {
      const tm = entity.get('TileMap');
      if (!tm.data) continue;

      const sheet = renderer.getSheet(tm.sheetKey);
      if (!sheet) continue;

      const ts = tm.tileSize;

      // Only render visible tiles (culling)
      const startCol = Math.max(0, Math.floor(camX / ts));
      const startRow = Math.max(0, Math.floor(camY / ts));
      const endCol = Math.min(tm.cols, Math.ceil((camX + renderer.width) / ts) + 1);
      const endRow = Math.min(tm.rows, Math.ceil((camY + renderer.height) / ts) + 1);

      for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
          const tileIdx = tm.data[row][col];
          const region = tm.tileRegions[tileIdx];
          if (!region) continue;

          renderer.ctx.drawImage(
            sheet,
            region.x, region.y, region.w, region.h,
            col * ts - camX,
            row * ts - camY,
            ts, ts
          );
        }
      }
    }
  }
}

// --- Collision Queries ---
export class GridPhysics extends System {
  constructor() {
    super(50); // after input, before rendering
  }

  init(world) {
    world.globals.physics = this;
  }

  /**
   * Check if a grid position is walkable
   * @param {number} col - grid column
   * @param {number} row - grid row
   * @returns {boolean}
   */
  isWalkable(col, row) {
    const tilemaps = this.query('TileMap');
    for (const entity of tilemaps) {
      const tm = entity.get('TileMap');
      if (!tm.data) continue;
      if (row < 0 || row >= tm.rows || col < 0 || col >= tm.cols) return false;
      const tileIdx = tm.data[row][col];
      if (tm.solidTiles.includes(tileIdx)) return false;
    }
    return true;
  }

  /**
   * Check if a grid position is occupied by an entity with a Collider
   * @param {number} col
   * @param {number} row
   * @param {number} excludeId - entity to exclude (e.g. the mover itself)
   * @returns {Entity|null}
   */
  getEntityAt(col, row, excludeId = -1) {
    const entities = this.query('Position', 'GridCollider');
    const tileSize = this._getTileSize();
    for (const entity of entities) {
      if (entity.id === excludeId) continue;
      const pos = entity.get('Position');
      const ecol = Math.round(pos.x / tileSize);
      const erow = Math.round(pos.y / tileSize);
      if (ecol === col && erow === row) return entity;
    }
    return null;
  }

  _getTileSize() {
    const tilemaps = this.query('TileMap');
    if (tilemaps.length > 0) return tilemaps[0].get('TileMap').tileSize;
    return 32;
  }
}

// Grid collider component - marks entity as a collision body on the grid
export const GridCollider = registerComponent('GridCollider', {
  solid: true,
  interactable: false,
});
