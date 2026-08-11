/**
 * chase.js – Level 3 Provence lavender memory seek
 * Memory wisps hide in the lavender fields.
 * Find them all to restore the Silver Lavender.
 */
import {
  Scene, Position, Sprite, Camera, CameraFollow,
  TileMap, GridCollider, DialogData,
} from '../../../engine/index.js';
import { LEVELS_L3 } from '../data/levels.js';
import { drawFlower } from '../data/flowers.js';
import { SPRITE_REGIONS, TILE_REGIONS_DAY } from '../main.js';

const TILE_DIALOG = {
  1: [
    '(Stream! Maybe she\'d dip her toes in. I\'d watch from a safe dry distance.)',
    '(Clear water. Can\'t cross. Only one of should get wet.)',
  ],
  3: [
    '(Old oak. Like in Pocahontas. Maybe she\'d watch that movie with me.)',
    '(Cicadas screaming in the branches. Very relaxing. I prefer Stefy\'s voice though.)',
  ],
  5: [
    '(Lavender. Stefy would look good in lavender.)',
    '(She\'d fill the apartment with this stuff. I\'d sneeze for weeks. Worth it.)',
  ],
  7: [
    '(Stone farmhouse. Blue shutters. Fresh bread smell. Stefy probably has a really good recipe for bread.)',
    '(Someone\'s home. Someone\'s eating. I\'m standing in a field. All alone. Great.)',
  ],
  8: [
    '(Wooden footbridge. Holds my weight. I wish Stefy was here.)',
  ],
  9: [
    '(Flat rock. Perfect for a picnic. NOT why I\'m here.)',
  ],
  10: [
    '(Big boxes. No need to look inside, there\'s nothing I can give Stefy. I\'ll buy her anything she needs.)',
  ],
};

const TILE_SIZE = 32;
const CHARS = { g:0, w:1, p:2, t:3, W:4, f:5, s:6, h:7, b:8, r:9, B:10, d:11 };
const SOLID = [1, 3, 4, 7, 9, 10];
const FIND_RADIUS = 2;

function spriteOf(key) {
  const r = SPRITE_REGIONS[key];
  if (!r) return { sheetKey: 'main', srcX: 0, srcY: 0, srcW: 16, srcH: 16, scale: 2 };
  return { sheetKey: 'main', srcX: r.srcX, srcY: r.srcY, srcW: 16, srcH: 16, scale: 2 };
}

export class ChaseScene extends Scene {
  constructor() {
    super('chase');
    this.entities = [];
    this.player = null;
    this.goalReached = false;
    this.introPlayed = false;
    this.selfTalkTriggered = {};
    this.npcDialogIdx = {};
    this._pCol = 0; this._pRow = 0;
    this._visualX = 0; this._visualY = 0;
    this._moving = false; this._facing = 'down';
    this._moveSpeed = 200;
    this._wisps = [];
    this._currentWisp = 0;
    this._foundCount = 0;
    this._mapData = null;
  }

  enter(params) {
    this.world?.globals?.audio?.setTrack('chase');
    const level = LEVELS_L3;
    this.goalReached = false;
    this.selfTalkTriggered = {};
    this.npcDialogIdx = {};
    this.entities = [];
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
    cam.add(CameraFollow, { targetTag: 'player', smoothing: 6 });
    cam.tag('camera'); this.entities.push(cam);

    this._pCol = level.start.col; this._pRow = level.start.row;
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

    this._wisps = level.wispLocations.map(w => ({ ...w, found: false }));
    this._currentWisp = 0;
    this._foundCount = 0;

    if (!this.introPlayed) {
      this.introPlayed = true;
      const dialog = world.globals.dialog;
      if (dialog) dialog.show(level.intro);
    }

    this._showObjective('Find the scattered memories');
    document.getElementById('location-name').textContent = level.name;
  }

  update(dt) {
    const world = this.world;
    const dialog = world.globals.dialog;
    const input = world.globals.input;

    if (dialog?.active) {
      if (input?.isPressed('Space')) dialog.advance();
      return;
    }
    if (this.goalReached) return;

    // H-key hint
    if (input?.isPressed('KeyH') && !dialog?.active) {
      const wisp = this._wisps[this._currentWisp];
      if (wisp && !wisp.found) {
        dialog.show([{ speaker: 'Mikkel', text: '(Follow the purple glow to find the memory orb. Walk to it and press Space.)' }]);
      }
    }

    if (!this._moving) this._handleMovement(input);
    this._interpolateMovement(dt);

    // Check proximity to current orb
    const wisp = this._wisps[this._currentWisp];
    if (wisp && !wisp.found) {
      const dist = Math.abs(this._pCol - wisp.col) + Math.abs(this._pRow - wisp.row);
      if (dist <= FIND_RADIUS && input?.isPressed('Space')) {
        this._foundWisp(wisp, dialog);
        return;
      }
    }

    this._checkInteractions(input, dialog);
  }

  _foundWisp(wisp, dialog) {
    wisp.found = true;
    this._foundCount++;
    this.world?.globals?.audio?.playPickup();
    const memLine = LEVELS_L3.memoryLines[this._currentWisp];
    const isLast = this._foundCount >= this._wisps.length;

    if (!this.selfTalkTriggered['first'] && this._foundCount === 1) {
      this.selfTalkTriggered['first'] = true;
    }

    dialog.show([{ speaker: '', text: `✦ "${memLine}"` }], () => {
      if (isLast) {
        this.goalReached = true;
        const mem = LEVELS_L3.memoryItem;
        dialog.show([
          { speaker: '', text: `✦ Memory restored: ${mem.name}` },
          { speaker: '', text: `"${mem.flavor}"` },
        ], () => this._onLevelComplete());
      } else {
        this._currentWisp++;
      }
    });
  }

  render() {
    const renderer = this.world?.globals?.renderer;
    if (!renderer) return;
    const cam = this.world.queryTag('camera')[0]?.get('Position');
    if (!cam) return;
    const ctx = renderer.ctx;

    // Draw found wisp markers (faded flowers)
    for (const w of this._wisps) {
      if (!w.found) continue;
      const fx = w.col * TILE_SIZE - cam.x + TILE_SIZE / 2;
      const fy = w.row * TILE_SIZE - cam.y + TILE_SIZE / 2;
      ctx.save();
      ctx.globalAlpha = 0.3;
      drawFlower(ctx, 2, fx, fy, 1);
      ctx.restore();
    }

    // Draw current wisp as flower
    const wisp = this._wisps[this._currentWisp];
    if (!wisp || wisp.found || this.goalReached) {
      this._drawProgress(ctx);
      return;
    }

    const wx = wisp.col * TILE_SIZE - cam.x + TILE_SIZE / 2;
    const wy = wisp.row * TILE_SIZE - cam.y + TILE_SIZE / 2;
    const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 400);
    const bob = Math.sin(Date.now() / 500) * 3;

    // Soft glow behind flower
    const grad = ctx.createRadialGradient(wx, wy + bob, 3, wx, wy + bob, 30);
    grad.addColorStop(0, `rgba(180,140,255,${0.3 * pulse})`);
    grad.addColorStop(1, 'rgba(180,140,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(wx - 35, wy + bob - 35, 70, 70);

    ctx.save();
    ctx.globalAlpha = pulse;
    drawFlower(ctx, 2, wx, wy + bob, 1.5);
    ctx.restore();

    this._drawProgress(ctx);
  }

  _drawProgress(ctx) {
    ctx.save();
    ctx.font = '13px "Segoe UI", sans-serif';
    ctx.fillStyle = '#b19cd9';
    ctx.textAlign = 'right';
    ctx.fillText(`✦ ${this._foundCount}/${this._wisps.length}`, 630, 470);
    ctx.restore();
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

    // NPC solidity
    for (const npc of this.world.queryTag('npc')) {
      const p = npc.get('Position');
      if (Math.round(p.x / TILE_SIZE) === destCol && Math.round(p.y / TILE_SIZE) === destRow) return;
    }

    this._pCol = destCol; this._pRow = destRow;
    this._moving = true;
    sprite.bobAmount = 2;
    this.world?.globals?.audio?.playStep();
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

    // NPC interaction
    const dx = this._facing === 'right' ? 1 : this._facing === 'left' ? -1 : 0;
    const dy = this._facing === 'down' ? 1 : this._facing === 'up' ? -1 : 0;
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

    // Env interactions
    for (const env of LEVELS_L3.envInteractions) {
      if (Math.abs(this._pCol - env.col) <= 1 && Math.abs(this._pRow - env.row) <= 1) {
        dialog.show([{ speaker: 'Mikkel', text: env.text }]);
        return;
      }
    }

    // Tile-based self-talk
    const tile = this._mapData[this._pRow + dy]?.[this._pCol + dx];
    if (tile !== undefined && TILE_DIALOG[tile]) {
      const lines = TILE_DIALOG[tile];
      dialog.show([{ speaker: 'Mikkel', text: lines[Math.floor(Math.random() * lines.length)] }]);
    }
  }

  _onLevelComplete() {
    const memEl = document.getElementById('memories-collected');
    const current = parseInt(memEl.textContent) || 0;
    memEl.textContent = current + 1;
    this.world?.globals?.audio?.playTransition();
    setTimeout(() => {
      this.manager.switchTo('vignette', { levelIdx: 2 });
    }, 600);
  }

  _showObjective(text) {
    const el = document.getElementById('objective-display');
    el.textContent = text;
    el.classList.remove('hidden');
  }

  exit() {
    for (const e of this.entities) e.destroy();
    this.entities = [];
    this.player = null;
  }
}
