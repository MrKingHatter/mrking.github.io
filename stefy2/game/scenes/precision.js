/**
 * precision.js – Level 6 Denmark precision movement
 * Navigate a narrow cliffside path without falling. One wrong step = restart.
 * Courage: being careful with someone's heart.
 */
import {
  Scene, Position, Sprite, Camera, CameraFollow,
  TileMap, GridCollider, DialogData,
} from '../../../engine/index.js';
import { LEVELS_L6 } from '../data/levels.js';
import { drawFlower } from '../data/flowers.js';
import { SPRITE_REGIONS, TILE_REGIONS_DAY } from '../main.js';

const TILE_DIALOG = {
  1: [
    '(Waves far below. Don\'t look down. I looked down. Mistake...)',
    '(Focus, Mikkel. Focus on Stefy.)',
  ],
  5: [
    '(Yellow blooms on chalk. Stubborn little things. Remind me of someone.)',
  ],
  6: [
    '(Path crumbles at the edges. GREAT. LOVE THAT.)',
  ],
  9: [
    '(Solid rock. The one stable thing on this entire cliff. Like our relationship could be.)',
  ],
};

const TILE_SIZE = 32;
const CHARS = { g:0, w:1, p:2, t:3, W:4, f:5, s:6, h:7, b:8, r:9, B:10, d:11 };
const SOLID = [3, 4, 7, 9, 10];
const FALL_TILES = [1]; // water=cliff drop
const CRUMBLE_TILE = 6; // sand: safe once, then collapses to water

function spriteOf(key) {
  const r = SPRITE_REGIONS[key];
  if (!r) return { sheetKey: 'main', srcX: 0, srcY: 0, srcW: 16, srcH: 16, scale: 2 };
  return { sheetKey: 'main', srcX: r.srcX, srcY: r.srcY, srcW: 16, srcH: 16, scale: 2 };
}

export class PrecisionScene extends Scene {
  constructor() {
    super('precision');
    this.entities = [];
    this.player = null;
    this.goalReached = false;
    this.introPlayed = false;
    this.selfTalkTriggered = {};
    this.npcDialogIdx = {};
    this._pCol = 0; this._pRow = 0;
    this._visualX = 0; this._visualY = 0;
    this._moving = false; this._facing = 'down';
    this._moveSpeed = 140; // slow and deliberate
    this._mapData = null;
    this._falling = false; this._fallTimer = 0;
    this._checkpointCol = 0; this._checkpointRow = 0;
    this._stepCount = 0;
    this._crumbledTiles = []; // track crumbled sand positions for respawn restore
  }

  enter(params) {
    this.world?.globals?.audio?.setTrack('precision');
    const level = LEVELS_L6;
    this.goalReached = false;
    this.selfTalkTriggered = {};
    this.npcDialogIdx = {};
    this.entities = [];
    this._falling = false;
    this._stepCount = 0;
    this._crumbledTiles = [];
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
    this._checkpointCol = level.start.col; this._checkpointRow = level.start.row;
    this._visualX = this._pCol * TILE_SIZE; this._visualY = this._pRow * TILE_SIZE;
    this._moving = false; this._facing = 'right';
    this.player = world.createEntity();
    this.player.add(Position, { x: this._visualX, y: this._visualY });
    this.player.add(Sprite, { ...spriteOf('mikkel_right'), bobAmount: 0, bobSpeed: 6 });
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

    if (!this.introPlayed) {
      this.introPlayed = true;
      const dialog = world.globals.dialog;
      if (dialog) dialog.show(level.intro);
    }
    this._showObjective('Reach the bluebell, one careful step at a time');
    document.getElementById('location-name').textContent = level.name;
  }

  update(dt) {
    const world = this.world;
    const dialog = world.globals.dialog;
    const input = world.globals.input;
    if (dialog?.active) { if (input?.isPressed('Space')) dialog.advance(); return; }
    if (this.goalReached) return;

    // H-key hint
    if (input?.isPressed('KeyH')) {
      dialog.show([{ speaker: 'Mikkel', text: '(Tap, don\'t hold. One step per press. The sandy patches crumble behind you, so choose your path carefully.)' }]);
      return;
    }

    if (this._falling) {
      this._fallTimer -= dt;
      if (this._fallTimer <= 0) this._respawn();
      return;
    }

    // Precision: only move on press, not hold (deliberate steps)
    if (!this._moving) this._handleMovement(input);
    this._interpolateMovement(dt);
    this._checkInteractions(input, dialog);
    this._checkGoal(dialog);
  }

  render() {
    const renderer = this.world?.globals?.renderer;
    if (!renderer) return;
    const cam = this.world.queryTag('camera')[0]?.get('Position');
    if (!cam) return;
    const ctx = renderer.ctx;

    // Falling flash
    if (this._falling) {
      const flash = Math.sin(this._fallTimer * 10) * 0.3;
      ctx.fillStyle = `rgba(100,150,200,${0.2 + flash})`;
      ctx.fillRect(0, 0, 640, 480);
    }

    // Wind particles for atmosphere
    const t = Date.now() / 1000;
    ctx.save(); ctx.globalAlpha = 0.3;
    for (let i = 0; i < 8; i++) {
      const x = ((t * 40 + i * 80) % 700) - 30;
      const y = 100 + i * 50 + Math.sin(t + i) * 20;
      ctx.fillStyle = '#aaccdd';
      ctx.fillRect(x, y, 12 + Math.sin(i) * 4, 1);
    }
    ctx.restore();

    // Goal glow
    if (!this.goalReached) {
      const gx = LEVELS_L6.goal.col * TILE_SIZE - cam.x + TILE_SIZE / 2;
      const gy = LEVELS_L6.goal.row * TILE_SIZE - cam.y + TILE_SIZE / 2;
      const pulse = 0.6 + Math.sin(Date.now() / 400) * 0.3;
      const bob = Math.sin(Date.now() / 600) * 3;
      ctx.save(); ctx.globalAlpha = pulse;
      drawFlower(ctx, 5, gx, gy + bob, 1.5);
      ctx.restore();
    }
  }

  _handleMovement(input) {
    if (!input) return;
    // Only isPressed (not isDown) for precision -- one step per keypress
    let dx = 0, dy = 0;
    if (input.isPressed('ArrowUp') || input.isPressed('KeyW')) dy = -1;
    else if (input.isPressed('ArrowDown') || input.isPressed('KeyS')) dy = 1;
    if (input.isPressed('ArrowLeft') || input.isPressed('KeyA')) dx = -1;
    else if (input.isPressed('ArrowRight') || input.isPressed('KeyD')) dx = 1;
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

    // Fall tiles -- step onto them and fall
    if (FALL_TILES.includes(tile)) {
      this._pCol = destCol; this._pRow = destRow;
      this._moving = true;
      this._falling = true;
      this._fallTimer = 0.8;
      this.world?.globals?.audio?.playTone(150, 0.4, 'sawtooth', 0.3);
      if (!this.selfTalkTriggered['fall']) {
        this.selfTalkTriggered['fall'] = true;
        const dialog = this.world.globals.dialog;
        const st = LEVELS_L6.selfTalk.find(s => s.trigger === 'fall');
        if (st && dialog && !dialog.active) dialog.show([{ speaker: 'Mikkel', text: st.text }]);
      }
      return;
    }

    // Crumble tiles -- collapse after stepping off, not onto
    const srcTile = this._mapData[this._pRow]?.[this._pCol];
    if (srcTile === CRUMBLE_TILE) {
      this._mapData[this._pRow][this._pCol] = 1;
      this._crumbledTiles.push({ col: this._pCol, row: this._pRow });
      if (!this.selfTalkTriggered['crumble']) {
        this.selfTalkTriggered['crumble'] = true;
        const dialog = this.world.globals.dialog;
        if (dialog && !dialog.active) dialog.show([{ speaker: 'Mikkel', text: '(The ground crumbled behind me. No going back. Only forward.)' }]);
      }
    }

    this._pCol = destCol; this._pRow = destRow;
    this._moving = true;
    sprite.bobAmount = 2;
    this.world?.globals?.audio?.playStep();
    this._stepCount++;

    // Checkpoints
    for (const cp of LEVELS_L6.checkpoints) {
      if (destCol === cp.col && destRow === cp.row) {
        this._checkpointCol = cp.col; this._checkpointRow = cp.row;
      }
    }
  }

  _respawn() {
    this._falling = false;
    // Restore all crumbled sand tiles so player can retrace path
    for (const t of this._crumbledTiles) {
      this._mapData[t.row][t.col] = CRUMBLE_TILE;
    }
    this._crumbledTiles = [];
    this._pCol = this._checkpointCol; this._pRow = this._checkpointRow;
    this._visualX = this._pCol * TILE_SIZE; this._visualY = this._pRow * TILE_SIZE;
    this._moving = false;
    const pos = this.player.get('Position');
    pos.x = this._visualX; pos.y = this._visualY;
    this.selfTalkTriggered['fall'] = false;
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
    for (const env of LEVELS_L6.envInteractions) {
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
    if (this._pCol === LEVELS_L6.goal.col && this._pRow === LEVELS_L6.goal.row) {
      this.goalReached = true;
      this.world?.globals?.audio?.playPickup();
      const mem = LEVELS_L6.memoryItem;
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
    setTimeout(() => this.manager.switchTo('vignette', { levelIdx: 5 }), 600);
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
