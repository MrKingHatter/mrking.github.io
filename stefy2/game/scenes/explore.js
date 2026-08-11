/**
 * explore.js – Level 4 Amazon jungle exploration
 * Fog-of-war discovery: explore the jungle to uncover the path to the orchid.
 * Vulnerability: going into the unknown together.
 */
import {
  Scene, Position, Sprite, Camera, CameraFollow,
  TileMap, GridCollider, DialogData,
} from '../../../engine/index.js';
import { LEVELS_L4 } from '../data/levels.js';
import { SPRITE_REGIONS, TILE_REGIONS_DAY } from '../main.js';
import { HintSystem } from '../data/hints.js';
import { drawFlower } from '../data/flowers.js';

const TILE_DIALOG = {
  1: [
    '(Wide river. Fast current. Absolutely not swimming. Stefy is waiting for me.)',
    '(Dark water. Something moved. Nope. Nope nope nope.)',
    '(If she\'d want to swim, I\'d be on piranha watch. Division of labor.)',
  ],
  3: [
    '(Massive tree. Blocks out the sky. I feel very small. This must be how Stefy feels every day.)',
    '(Vines on everything. Looks almost like pretty hair.)',
  ],
  5: [
    '(Tropical flowers. Bright red. Beautiful. Maybe poisonous. A bit like Stefy.)',
    '(She\'d pick one. I\'d Google if it\'s toxic. Teamwork.)',
  ],
  8: [
    '(Rope bridge. Very Indiana Jones. Another movie I we could watch.)',
  ],
  9: [
    '(Mossy boulder. Disgusting. Like Emma.)',
  ],
  10: [
    '(Impenetrable undergrowth. Machete territory ... I have no machete.)',
  ],
};

const TILE_SIZE = 32;
const CHARS = { g:0, w:1, p:2, t:3, W:4, f:5, s:6, h:7, b:8, r:9, B:10, d:11 };
const SOLID = [1, 3, 4, 7, 9, 10];
const REVEAL_RADIUS = 3;

function spriteOf(key) {
  const r = SPRITE_REGIONS[key];
  if (!r) return { sheetKey: 'main', srcX: 0, srcY: 0, srcW: 16, srcH: 16, scale: 2 };
  return { sheetKey: 'main', srcX: r.srcX, srcY: r.srcY, srcW: 16, srcH: 16, scale: 2 };
}

export class ExploreScene extends Scene {
  constructor() {
    super('explore');
    this.entities = [];
    this.player = null;
    this.goalReached = false;
    this.introPlayed = false;
    this.selfTalkTriggered = {};
    this.npcDialogIdx = {};
    this._pCol = 0; this._pRow = 0;
    this._visualX = 0; this._visualY = 0;
    this._moving = false; this._facing = 'down';
    this._moveSpeed = 160;
    this._mapData = null;
    // Fog of war
    this._revealed = new Set();
    this._revealAlpha = new Map(); // key → 0..1 fade-in
    this._exploredPct = 0;
    this._landmarks = new Set();
    this._hints = new HintSystem();
    this._prevCol = 0; this._prevRow = 0;
  }

  enter(params) {
    this.world?.globals?.audio?.setTrack('explore');
    const level = LEVELS_L4;
    this.goalReached = false;
    this.selfTalkTriggered = {};
    this.npcDialogIdx = {};
    this.entities = [];
    this._revealed = new Set();
    this._revealAlpha = new Map();
    this._landmarks = new Set();
    const world = this.world;

    const mapRows = level.map.split('\n');
    this._mapData = mapRows.map(row => [...row].map(ch => CHARS[ch] ?? 0));

    const tmEntity = world.createEntity();
    tmEntity.add(TileMap, {
      data: this._mapData, cols: this._mapData[0].length, rows: this._mapData.length,
      tileSize: TILE_SIZE, sheetKey: 'main',
      tileRegions: TILE_REGIONS_DAY, solidTiles: SOLID,
    });
    tmEntity.add(Position, { x: 0, y: 0 });
    tmEntity.tag('tilemap'); this.entities.push(tmEntity);

    const cam = world.createEntity();
    cam.add(Camera, {}); cam.add(Position, { x: 0, y: 0 });
    cam.add(CameraFollow, { targetTag: 'player', smoothing: 8 });
    cam.tag('camera'); this.entities.push(cam);

    this._pCol = level.start.col; this._pRow = level.start.row;
    this._visualX = this._pCol * TILE_SIZE; this._visualY = this._pRow * TILE_SIZE;
    this._moving = false; this._facing = 'down';
    this.player = world.createEntity();
    this.player.add(Position, { x: this._visualX, y: this._visualY });
    this.player.add(Sprite, { ...spriteOf('mikkel_down'), bobAmount: 0, bobSpeed: 6 });
    this.player.add(GridCollider, { width: TILE_SIZE, height: TILE_SIZE });
    this.player.tag('player'); this.entities.push(this.player);

    for (const npc of level.npcs) {
      const e = world.createEntity();
      e.add(Position, { x: npc.col * TILE_SIZE, y: npc.row * TILE_SIZE });
      e.add(Sprite, spriteOf(npc.sprite));
      e.add(DialogData, { lines: npc.dialog });
      e.tag('npc'); e.tag('npc_' + npc.id);
      this.entities.push(e);
    }

    this._revealAround(this._pCol, this._pRow);

    if (!this.introPlayed) {
      this.introPlayed = true;
      const dialog = world.globals.dialog;
      if (dialog) dialog.show(level.intro);
    }
    this._showObjective('Explore the jungle. Find the orchid');
    document.getElementById('location-name').textContent = level.name;
  }

  update(dt) {
    const world = this.world;
    const dialog = world.globals.dialog;
    const input = world.globals.input;
    if (dialog?.active) { if (input?.isPressed('Space')) dialog.advance(); return; }
    if (this.goalReached) return;

    if (!this._moving) this._handleMovement(input);
    this._interpolateMovement(dt);

    // Hint system
    const moved = this._pCol !== this._prevCol || this._pRow !== this._prevRow;
    this._prevCol = this._pCol; this._prevRow = this._pRow;
    this._hints.update(dt, moved, input, dialog,
      '(The orchid likes shade. Deep in the jungle, far from the path. Keep exploring.)');

    // Animate fog reveal
    for (const [key, a] of this._revealAlpha) {
      if (a < 1) this._revealAlpha.set(key, Math.min(1, a + dt * 4));
    }

    this._checkInteractions(input, dialog);
    this._checkGoal(dialog);
  }

  render() {
    const renderer = this.world?.globals?.renderer;
    if (!renderer) return;
    const cam = this.world.queryTag('camera')[0]?.get('Position');
    if (!cam) return;
    const ctx = renderer.ctx;
    const W = 640, H = 480;

    // Fog of war overlay -- draw black over unrevealed tiles
    const startCol = Math.floor(cam.x / TILE_SIZE) - 1;
    const startRow = Math.floor(cam.y / TILE_SIZE) - 1;
    const endCol = startCol + Math.ceil(W / TILE_SIZE) + 2;
    const endRow = startRow + Math.ceil(H / TILE_SIZE) + 2;

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const key = `${c},${r}`;
        const alpha = this._revealAlpha.get(key);
        if (alpha === undefined || alpha < 1) {
          const fogA = alpha === undefined ? 1 : 1 - alpha;
          ctx.fillStyle = `rgba(10,20,10,${fogA * 0.92})`;
          ctx.fillRect(c * TILE_SIZE - cam.x, r * TILE_SIZE - cam.y, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // Goal glow if revealed
    const goalKey = `${LEVELS_L4.goal.col},${LEVELS_L4.goal.row}`;
    if (this._revealed.has(goalKey) && !this.goalReached) {
      const gx = LEVELS_L4.goal.col * TILE_SIZE - cam.x + TILE_SIZE / 2;
      const gy = LEVELS_L4.goal.row * TILE_SIZE - cam.y + TILE_SIZE / 2;
      const pulse = 0.6 + Math.sin(Date.now() / 500) * 0.3;
      const bob = Math.sin(Date.now() / 600) * 3;
      ctx.save(); ctx.globalAlpha = pulse;
      drawFlower(ctx, 3, gx, gy + bob, 1.5);
      ctx.restore();
    }

    // Directional arrow + hint prompt
    if (!this.goalReached) {
      const px = this._pCol * TILE_SIZE, py = this._pRow * TILE_SIZE;
      const gx = LEVELS_L4.goal.col * TILE_SIZE, gy = LEVELS_L4.goal.row * TILE_SIZE;
      this._hints.renderArrow(ctx, px, py, gx, gy, cam.x, cam.y, W, H);
      this._hints.renderHintPrompt(ctx, W, H);
    }

    // Exploration counter
    ctx.save();
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(200,200,200,0.7)';
    ctx.textAlign = 'right';
    const pct = Math.min(100, Math.round(this._revealed.size / (50 * 30) * 100));
    ctx.fillText(`Explored: ${pct}%`, W - 10, 20);
    ctx.restore();
  }

  _revealAround(col, row) {
    for (let dr = -REVEAL_RADIUS; dr <= REVEAL_RADIUS; dr++) {
      for (let dc = -REVEAL_RADIUS; dc <= REVEAL_RADIUS; dc++) {
        if (Math.abs(dr) + Math.abs(dc) > REVEAL_RADIUS + 1) continue;
        const key = `${col + dc},${row + dr}`;
        if (!this._revealed.has(key)) {
          this._revealed.add(key);
          this._revealAlpha.set(key, 0);
        }
      }
    }
    // Landmark discovery triggers
    for (const lm of LEVELS_L4.landmarks) {
      const lkey = `${lm.col},${lm.row}`;
      if (this._revealed.has(lkey) && !this._landmarks.has(lm.id)) {
        this._landmarks.add(lm.id);
        const dialog = this.world.globals.dialog;
        if (dialog && !dialog.active) {
          dialog.show([{ speaker: 'Mikkel', text: lm.text }]);
        }
      }
    }
  }

  _handleMovement(input) {
    if (!input) return;
    let dx = 0, dy = 0;
    if (input.isDown('ArrowUp') || input.isDown('KeyW')) dy = -1;
    else if (input.isDown('ArrowDown') || input.isDown('KeyS')) dy = 1;
    if (input.isDown('ArrowLeft') || input.isDown('KeyA')) dx = -1;
    else if (input.isDown('ArrowRight') || input.isDown('KeyD')) dx = 1;
    if (dx === 0 && dy === 0) return;

    this._facing = dy < 0 ? 'up' : dy > 0 ? 'down' : dx < 0 ? 'left' : 'right';
    const sprite = this.player.get('Sprite');
    const r = SPRITE_REGIONS['mikkel_' + this._facing];
    if (r) { sprite.srcX = r.srcX; sprite.srcY = r.srcY; }

    const destCol = this._pCol + dx, destRow = this._pRow + dy;
    const tile = this._mapData[destRow]?.[destCol];
    if (tile === undefined || SOLID.includes(tile)) return;
    if (dx !== 0 && dy !== 0) {
      if (SOLID.includes(this._mapData[this._pRow]?.[destCol]) || SOLID.includes(this._mapData[destRow]?.[this._pCol])) return;
    }
    for (const npc of this.world.queryTag('npc')) {
      const p = npc.get('Position');
      if (Math.round(p.x / TILE_SIZE) === destCol && Math.round(p.y / TILE_SIZE) === destRow) return;
    }

    this._pCol = destCol; this._pRow = destRow;
    this._moving = true;
    sprite.bobAmount = 2;
    this.world?.globals?.audio?.playStep();
    this._revealAround(destCol, destRow);
  }

  _interpolateMovement(dt) {
    const tx = this._pCol * TILE_SIZE, ty = this._pRow * TILE_SIZE;
    const ddx = tx - this._visualX, ddy = ty - this._visualY;
    const step = this._moveSpeed * dt * ((Math.abs(ddx) > 0.5 && Math.abs(ddy) > 0.5) ? 0.7071 : 1);
    if (Math.abs(ddx) > 0.5 || Math.abs(ddy) > 0.5) {
      this._visualX += Math.abs(ddx) <= step ? ddx : Math.sign(ddx) * step;
      this._visualY += Math.abs(ddy) <= step ? ddy : Math.sign(ddy) * step;
    } else {
      this._visualX = tx; this._visualY = ty;
      if (this._moving) { this._moving = false; this.player.get('Sprite').bobAmount = 0; }
    }
    const pos = this.player.get('Position');
    pos.x = this._visualX; pos.y = this._visualY;
  }

  _checkInteractions(input, dialog) {
    if (!input?.isPressed('Space') && !input?.isPressed('KeyE')) return;
    if (dialog?.active) { dialog.advance(); return; }
    for (const npc of this.world.queryTag('npc')) {
      const nPos = npc.get('Position');
      const nc = Math.round(nPos.x / TILE_SIZE), nr = Math.round(nPos.y / TILE_SIZE);
      if (Math.abs(this._pCol - nc) <= 1 && Math.abs(this._pRow - nr) <= 1) {
        const dd = npc.get('DialogData');
        if (dd?.lines.length) {
          const id = [...npc.tags].find(t => t.startsWith('npc_')) || 'npc';
          const idx = this.npcDialogIdx[id] || 0;
          dialog.show([dd.lines[idx % dd.lines.length]]);
          this.npcDialogIdx[id] = idx + 1;
        }
        return;
      }
    }
    for (const env of LEVELS_L4.envInteractions) {
      if (Math.abs(this._pCol - env.col) <= 1 && Math.abs(this._pRow - env.row) <= 1) {
        dialog.show([{ speaker: 'Mikkel', text: env.text }]);
        return;
      }
    }

    // Tile-based self-talk
    const dx = this._facing === 'right' ? 1 : this._facing === 'left' ? -1 : 0;
    const dy = this._facing === 'down' ? 1 : this._facing === 'up' ? -1 : 0;
    const tile = this._mapData[this._pRow + dy]?.[this._pCol + dx];
    if (tile !== undefined && TILE_DIALOG[tile]) {
      const lines = TILE_DIALOG[tile];
      dialog.show([{ speaker: 'Mikkel', text: lines[Math.floor(Math.random() * lines.length)] }]);
    }
  }

  _checkGoal(dialog) {
    if (this._pCol === LEVELS_L4.goal.col && this._pRow === LEVELS_L4.goal.row) {
      this.goalReached = true;
      this.world?.globals?.audio?.playPickup();
      const mem = LEVELS_L4.memoryItem;
      dialog.show([
        { speaker: '', text: `✦ Memory restored: ${mem.name}` },
        { speaker: '', text: `"${mem.flavor}"` },
      ], () => this._onLevelComplete());
    }
  }

  _onLevelComplete() {
    const memEl = document.getElementById('memories-collected');
    memEl.textContent = (parseInt(memEl.textContent) || 0) + 1;
    this.world?.globals?.audio?.playTransition();
    setTimeout(() => this.manager.switchTo('vignette', { levelIdx: 3 }), 600);
  }

  _showObjective(text) {
    const el = document.getElementById('objective-display');
    el.textContent = text; el.classList.remove('hidden');
  }

  exit() {
    for (const e of this.entities) e.destroy();
    this.entities = []; this.player = null;
  }
}
