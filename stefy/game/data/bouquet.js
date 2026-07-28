/**
 * bouquet.js - Shared bouquet sprite composition
 * Tight cluster with curved stems converging into small wrapping paper.
 * Canvas: 128x96
 */

import { PALETTE } from './palette.js';
import { FLOWER_SPRITES, FLOWER_COLORS, SPR_FLOWER } from './sprites.js';

// Convergence point (where stems gather inside paper)
const CONVERGE_X = 64;
const CONVERGE_Y = 55;

// Paper top edge - close to blooms for short stems
const PAPER_TOP = 30;

// Tight cluster - flowers nearly touching, overlapping for fullness.
const LAYOUT = [
  // Back row
  { i: 6, x: 54, y: 2 },   // sunflower (top center)
  { i: 4, x: 44, y: 7 },   // desert rose (back left)
  { i: 5, x: 64, y: 6 },   // poppy (back right)
  // Front row (very tight, overlapping back)
  { i: 0, x: 38, y: 16 },  // cherry blossom (left)
  { i: 1, x: 50, y: 18 },  // tulip (center-left)
  { i: 2, x: 60, y: 15 },  // lavender (center-right)
  { i: 3, x: 70, y: 17 },  // orchid (right)
];

export function drawBouquet(ctx, ox = 0, oy = 0) {
  // Phase 1: Curved stems from each bloom to convergence
  for (const flower of LAYOUT) {
    const colors = FLOWER_COLORS[flower.i];
    const stemColor = PALETTE[colors[2]];
    const startX = ox + flower.x + 7;
    const startY = oy + flower.y + 10;
    const endX = ox + CONVERGE_X;
    const endY = oy + CONVERGE_Y;

    // Cute angled stem - side flowers splay outward more
    ctx.strokeStyle = stemColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    // Stronger outward curve for side flowers, subtle for center
    const offset = startX - endX;
    const splay = Math.abs(offset) > 5 ? 0.4 : 0.12;
    const cpX = startX + offset * splay;
    const cpY = (startY + endY) * 0.52;
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.stroke();

    // Tiny leaf accent on some stems
    if (flower.i === 1 || flower.i === 4 || flower.i === 6) {
      const leafT = 0.4; // position along stem
      const leafX = startX + (endX - startX) * leafT + (offset * splay * (1 - leafT));
      const leafY = startY + (endY - startY) * leafT;
      ctx.fillStyle = PALETTE[11]; // green
      ctx.fillRect(Math.round(leafX) - 1, Math.round(leafY), 3, 2);
      ctx.fillRect(Math.round(leafX), Math.round(leafY) - 1, 1, 1);
    }
  }

  // Phase 2: Wrapping paper (compact)
  _drawPaper(ctx, ox, oy);

  // Phase 3: Flower blooms on top
  for (const flower of LAYOUT) {
    const sprite = FLOWER_SPRITES[flower.i] || SPR_FLOWER;
    const colors = FLOWER_COLORS[flower.i];
    _drawBloom(ctx, sprite, ox + flower.x, oy + flower.y, colors);
  }
}

function _drawPaper(ctx, ox, oy) {
  const py = oy + PAPER_TOP;

  // Compact cone
  ctx.fillStyle = '#f5e6d0';
  ctx.beginPath();
  ctx.moveTo(ox + 42, py);
  ctx.lineTo(ox + 86, py);
  ctx.lineTo(ox + 74, py + 38);
  ctx.lineTo(ox + 54, py + 38);
  ctx.closePath();
  ctx.fill();

  // Fold shadow
  ctx.fillStyle = '#e8d5b8';
  ctx.beginPath();
  ctx.moveTo(ox + 46, py);
  ctx.lineTo(ox + 57, py + 38);
  ctx.lineTo(ox + 54, py + 38);
  ctx.lineTo(ox + 42, py);
  ctx.closePath();
  ctx.fill();

  // Top ruffle
  ctx.fillStyle = '#faf0e4';
  ctx.beginPath();
  ctx.moveTo(ox + 40, py + 1);
  ctx.quadraticCurveTo(ox + 52, py - 3, ox + 64, py + 1);
  ctx.quadraticCurveTo(ox + 76, py - 3, ox + 88, py + 1);
  ctx.lineTo(ox + 86, py + 3);
  ctx.quadraticCurveTo(ox + 74, py - 1, ox + 64, py + 3);
  ctx.quadraticCurveTo(ox + 54, py - 1, ox + 42, py + 3);
  ctx.closePath();
  ctx.fill();

  // Ribbon
  ctx.fillStyle = '#ff9ecb';
  ctx.fillRect(ox + 56, py + 5, 16, 3);
  // Knot
  ctx.fillStyle = '#e91e63';
  ctx.fillRect(ox + 62, py + 3, 4, 3);
  // Tails
  ctx.fillRect(ox + 55, py + 7, 4, 4);
  ctx.fillRect(ox + 69, py + 7, 4, 4);
  ctx.fillRect(ox + 54, py + 9, 3, 3);
  ctx.fillRect(ox + 70, py + 9, 3, 3);
}

function _drawBloom(ctx, rows, ox, oy, colors) {
  const colorMap = {
    b: PALETTE[colors[0]],
    u: PALETTE[colors[1]],
    c: PALETTE[colors[2]],
  };
  // Only bloom rows (0-10), skip built-in stem
  for (let r = 0; r < 11 && r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const ch = rows[r][c];
      const color = colorMap[ch];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(ox + c, oy + r, 1, 1);
      }
    }
  }
}
