/**
 * levelselect.js – Level select / debug menu
 * Shows available levels, allows skipping to any unlocked level.
 */
import { Scene } from '../../../engine/index.js';
import { drawBouquet, drawFlower } from '../data/flowers.js';

const LEVELS_META = [
  { id: 'stealth', idx: 0, name: 'Tokyo Night Garden', city: 'Tokyo', type: 'Stealth', flower: 'Cherry Blossom' },
  { id: 'puzzle', idx: 1, name: 'Dutch Countryside', city: 'Netherlands', type: 'Puzzle', flower: 'Golden Tulip' },
  { id: 'chase', idx: 2, name: 'Lavender Fields', city: 'Provence', type: 'Seek', flower: 'Silver Lavender' },
  { id: 'explore', idx: 3, name: 'Jungle River', city: 'Amazon', type: 'Explore', flower: 'Rainbow Orchid' },
  { id: 'trade', idx: 4, name: 'Desert Riad', city: 'Morocco', type: 'Trade', flower: 'Desert Rose' },
  { id: 'precision', idx: 5, name: 'White Cliffs', city: 'Denmark', type: 'Precision', flower: 'Danish Bluebell' },
  { id: 'finale', idx: 6, name: 'Piedmont Hills', city: 'Italy', type: 'Finale', flower: 'Italian Sunflower' },
];

export class LevelSelectScene extends Scene {
  constructor() {
    super('levelselect');
    this._selected = 0;
    this._canvas = null;
    this._ctx = null;
    this._debugMode = false;
  }

  enter(params) {
    this.world?.globals?.audio?.setTrack('levelselect');
    this._canvas = document.getElementById('game-canvas');
    this._ctx = this._canvas.getContext('2d');
    this._selected = 0;
    this._debugMode = params?.debug || false;
    document.getElementById('title-screen').style.display = 'none';
  }

  update(dt) {
    const input = this.world?.globals?.input;
    if (!input) return;

    if (input.isPressed('ArrowUp') || input.isPressed('KeyW')) {
      this._selected = Math.max(0, this._selected - 1);
    }
    if (input.isPressed('ArrowDown') || input.isPressed('KeyS')) {
      this._selected = Math.min(LEVELS_META.length - 1, this._selected + 1);
    }
    if (input.isPressed('Space') || input.isPressed('Enter')) {
      const lvl = LEVELS_META[this._selected];
      if (lvl.id) {
        this.world?.globals?.audio?.playTransition();
        this.manager.switchTo(lvl.id, { levelIdx: lvl.idx });
      }
    }
  }

  render() {
    const ctx = this._ctx;
    if (!ctx) return;
    const W = this._canvas.width;
    const H = this._canvas.height;

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillStyle = '#f0e6d3';
    ctx.textAlign = 'center';
    ctx.fillText('Choose Your Destination', W / 2, 50);

    ctx.font = '11px "Segoe UI", sans-serif';
    ctx.fillStyle = '#8a8a9a';
    ctx.fillText('Seven flowers. Seven reasons. Tend them all.', W / 2, 72);

    // Level list
    const startY = 100;
    const itemH = 48;
    for (let i = 0; i < LEVELS_META.length; i++) {
      const lvl = LEVELS_META[i];
      const y = startY + i * itemH;
      const available = !!lvl.id;
      const sel = i === this._selected;

      // Selection highlight
      if (sel) {
        ctx.fillStyle = 'rgba(174, 217, 224, 0.08)';
        ctx.fillRect(80, y, W - 160, itemH - 4);
        ctx.strokeStyle = '#aed9e0';
        ctx.lineWidth = 1;
        ctx.strokeRect(80, y, W - 160, itemH - 4);
      }

      // City number
      ctx.font = 'bold 14px "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = available ? (sel ? '#ffd700' : '#aed9e0') : '#3a3a4a';
      ctx.fillText(`${i + 1}.`, 100, y + 20);

      // Level name
      ctx.font = '14px "Segoe UI", sans-serif';
      ctx.fillStyle = available ? (sel ? '#f0e6d3' : '#c0b8a8') : '#3a3a4a';
      ctx.fillText(lvl.name, 125, y + 20);

      // Flower
      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.fillStyle = available ? '#8a7a6a' : '#2a2a3a';
      ctx.fillText(`✦ ${lvl.flower}`, 125, y + 36);

      // Type badge
      ctx.textAlign = 'right';
      ctx.font = '10px "Segoe UI", sans-serif';
      ctx.fillStyle = available ? '#6a8a6a' : '#2a2a3a';
      ctx.fillText(lvl.type, W - 100, y + 20);
    }

    // Prompt
    ctx.textAlign = 'center';
    ctx.font = '11px "Segoe UI", sans-serif';
    ctx.fillStyle = '#aed9e0';
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 300) * 0.3;
    ctx.fillText('↑↓ to select · Space to begin', W / 2, H - 30);
    ctx.globalAlpha = 1;

    // Draw flower for selected level
    drawFlower(ctx, this._selected, W - 85, 45, 2);

    if (this._debugMode) {
      ctx.font = '9px monospace';
      ctx.fillStyle = '#ff6666';
      ctx.fillText('DEBUG MODE | All levels accessible', W / 2, H - 12);
    }
  }

  exit() {}
}
