/**
 * sprites.js - Sprite Asset Pipeline
 * Palette-indexed sprite definitions rendered to offscreen canvases.
 */

export class SpriteSheet {
  constructor(width, height) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    this.regions = new Map(); // name -> {x, y, w, h}
  }

  /** Define a named region on the sheet */
  defineRegion(name, x, y, w, h) {
    this.regions.set(name, { x, y, w, h });
    return this;
  }

  /** Get a region by name */
  getRegion(name) {
    return this.regions.get(name);
  }

  /** Raw pixel fill */
  fillPixel(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, 1, 1);
  }

  /** Fill rectangle */
  fillRect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  /** Clear an area */
  clear(x, y, w, h) {
    this.ctx.clearRect(x, y, w, h);
  }
}

/**
 * PaletteSprite - renders pixel art from string arrays + palette
 */
export class PaletteSprite {
  /**
   * @param {string[]} rows - Array of strings, each char maps to palette
   * @param {string[]} palette - Array of CSS color strings (index 0 = transparent)
   * @param {object} charMap - Maps special chars to palette indices
   */
  constructor(rows, palette, charMap = {}) {
    this.rows = rows;
    this.palette = palette;
    this.charMap = charMap;
    this.width = Math.max(...rows.map(r => r.length));
    this.height = rows.length;
  }

  /**
   * Render this sprite onto a SpriteSheet at given position
   * @param {SpriteSheet} sheet
   * @param {number} ox - x offset on sheet
   * @param {number} oy - y offset on sheet
   * @param {object} overrides - char -> palette index overrides for parameterized sprites
   */
  render(sheet, ox, oy, overrides = {}) {
    for (let y = 0; y < this.rows.length; y++) {
      const row = this.rows[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.' || ch === ' ') continue;

        let palIdx;
        if (overrides[ch] !== undefined) {
          palIdx = overrides[ch];
        } else if (this.charMap[ch] !== undefined) {
          palIdx = this.charMap[ch];
        } else {
          palIdx = parseInt(ch, 36);
          if (isNaN(palIdx)) continue;
        }

        if (palIdx === 0) continue;
        const color = this.palette[palIdx];
        if (!color || color === 'transparent') continue;

        sheet.fillPixel(ox + x, oy + y, color);
      }
    }
  }
}

/**
 * AssetPipeline - manages sprite generation and sheet registration
 */
export class AssetPipeline {
  constructor() {
    this.sheets = new Map();
    this.palette = [];
  }

  setPalette(palette) {
    this.palette = palette;
    return this;
  }

  createSheet(name, width, height) {
    const sheet = new SpriteSheet(width, height);
    this.sheets.set(name, sheet);
    return sheet;
  }

  getSheet(name) {
    return this.sheets.get(name);
  }

  /**
   * Register all sheets with the renderer system
   */
  registerWithRenderer(renderer) {
    for (const [name, sheet] of this.sheets) {
      renderer.registerSheet(name, sheet.canvas);
    }
  }
}
