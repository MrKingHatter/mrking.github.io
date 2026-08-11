/**
 * trade.js – Level 5 Morocco trading/communication
 * Barter puzzle: trade items with NPCs in the right order to reach the rooftop.
 * Communication: listening and being heard.
 */
import {
  Scene, Position, Sprite, Camera, CameraFollow,
  TileMap, GridCollider, DialogData,
} from '../../../engine/index.js';
import { LEVELS_L5 } from '../data/levels.js';
import { SPRITE_REGIONS, TILE_REGIONS_DAY } from '../main.js';

const TILE_DIALOG = {
  4: [
    '(Rammed earth walls. Cool in the shade. I could nap here. Focus.)',
    '(Medina walls. Thick, ancient, labyrinthine. I am lost. Again.)',
  ],
  5: [
    '(Bougainvillea climbing everything. Aggressively pink. She\'d gasp.)',
    '(Potted flowers everywhere. This alley has more plants than our apartment.)',
  ],
  6: [
    '(Sand between the tiles. In my shoes. In my soul.)',
    '(Dusty. Dry. Hot. I love travel. (I am dying.))',
  ],
  7: [
    '(Riad entrance. The tilework is insane. She\'d take 400 photos.)',
    '(Carved wood, colored glass. I want to live here. Can I live here?)',
  ],
  11: [
    '(Heavy door. Locked. Brass knocker shaped like a hand. Not knocking.)',
    '(Door says no. I respect that.)',
  ],
};

const TILE_SIZE = 32;
const CHARS = { g:0, w:1, p:2, t:3, W:4, f:5, s:6, h:7, b:8, r:9, B:10, d:11 };
const SOLID = [1, 3, 4, 7, 9, 10];

function spriteOf(key) {
  const r = SPRITE_REGIONS[key];
  if (!r) return { sheetKey: 'main', srcX: 0, srcY: 0, srcW: 16, srcH: 16, scale: 2 };
  return { sheetKey: 'main', srcX: r.srcX, srcY: r.srcY, srcW: 16, srcH: 16, scale: 2 };
}

export class TradeScene extends Scene {
  constructor() {
    super('trade');
    this.entities = [];
    this.player = null;
    this.goalReached = false;
    this.introPlayed = false;
    this.npcDialogIdx = {};
    this._pCol = 0; this._pRow = 0;
    this._visualX = 0; this._visualY = 0;
    this._moving = false; this._facing = 'down';
    this._moveSpeed = 170;
    this._mapData = null;
    // Trading state
    this._inventory = [];
    this._tradedWith = new Set();
    this._rooftopUnlocked = false;
  }

  enter(params) {
    this.world?.globals?.audio?.setTrack('trade');
    const level = LEVELS_L5;
    this.goalReached = false;
    this.npcDialogIdx = {};
    this.entities = [];
    this._inventory = [];
    this._tradedWith = new Set();
    this._rooftopUnlocked = false;
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
      e.add(DialogData, { lines: [] });
      e.tag('npc'); e.tag('npc_' + npc.id);
      this.entities.push(e);
    }

    if (!this.introPlayed) {
      this.introPlayed = true;
      const dialog = world.globals.dialog;
      if (dialog) dialog.show(level.intro);
    }
    this._showObjective('Trade your way to the flower garden');
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
      dialog.show([{ speaker: 'Mikkel', text: '(Trade items with the merchants. Each one wants something specific. The garden gate opens when you\'ve made the right trades.)' }]);
      return;
    }

    if (!this._moving) this._handleMovement(input);
    this._interpolateMovement(dt);
    this._checkInteractions(input, dialog);
    if (this._rooftopUnlocked) this._checkGoal(dialog);
  }

  render() {
    const renderer = this.world?.globals?.renderer;
    if (!renderer) return;
    const cam = this.world.queryTag('camera')[0]?.get('Position');
    if (!cam) return;
    const ctx = renderer.ctx;

    // Inventory display
    ctx.save();
    ctx.font = '12px sans-serif';
    ctx.fillStyle = 'rgba(240,220,180,0.9)';
    ctx.textAlign = 'left';
    const inv = this._inventory.length ? this._inventory.join(', ') : '(empty)';
    ctx.fillText(`Carrying: ${inv}`, 10, 52);
    ctx.restore();

    // Garden gate (visible barrier when locked)
    if (!this._rooftopUnlocked) {
      const gateX = 45 * TILE_SIZE - cam.x;
      const gateY = 5 * TILE_SIZE - cam.y;
      // Iron gate bars
      ctx.fillStyle = '#5a4a3a';
      ctx.fillRect(gateX, gateY, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = '#8a7a60';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const bx = gateX + 5 + i * 7;
        ctx.beginPath();
        ctx.moveTo(bx, gateY + 2);
        ctx.lineTo(bx, gateY + TILE_SIZE - 2);
        ctx.stroke();
      }
      // Lock icon
      ctx.fillStyle = '#c8a84e';
      ctx.beginPath();
      ctx.arc(gateX + TILE_SIZE / 2, gateY + TILE_SIZE / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(gateX + TILE_SIZE / 2 - 3, gateY + TILE_SIZE / 2 + 2, 6, 5);
    }

    // Goal indicator when unlocked
    if (this._rooftopUnlocked && !this.goalReached) {
      const gx = LEVELS_L5.goal.col * TILE_SIZE - cam.x + TILE_SIZE / 2;
      const gy = LEVELS_L5.goal.row * TILE_SIZE - cam.y + TILE_SIZE / 2;
      const pulse = 0.4 + Math.sin(Date.now() / 400) * 0.3;
      ctx.save(); ctx.globalAlpha = pulse;
      ctx.fillStyle = '#e8a87c';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('★', gx, gy - 4);
      ctx.restore();
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
    // Garden gate blocks until unlocked
    if (destRow === 5 && destCol === 45 && !this._rooftopUnlocked) return;
    for (const npc of this.world.queryTag('npc')) {
      const p = npc.get('Position');
      if (Math.round(p.x / TILE_SIZE) === destCol && Math.round(p.y / TILE_SIZE) === destRow) return;
    }

    this._pCol = destCol; this._pRow = destRow;
    this._moving = true; sprite.bobAmount = 2;
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

    for (const npc of this.world.queryTag('npc')) {
      const nPos = npc.get('Position');
      const nc = Math.round(nPos.x / TILE_SIZE), nr = Math.round(nPos.y / TILE_SIZE);
      if (Math.abs(this._pCol - nc) <= 1 && Math.abs(this._pRow - nr) <= 1) {
        const id = [...npc.tags].find(t => t.startsWith('npc_'))?.slice(4);
        this._handleTrade(id, dialog);
        return;
      }
    }

    for (const env of LEVELS_L5.envInteractions) {
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

  _handleTrade(npcId, dialog) {
    const trader = LEVELS_L5.traders.find(t => t.id === npcId);
    if (!trader) return;

    // Already traded
    if (this._tradedWith.has(npcId)) {
      dialog.show([{ speaker: trader.name, text: trader.doneText }]);
      return;
    }

    // Check if player has what this NPC wants
    if (trader.wants === null) {
      // First trader gives freely
      this._inventory.push(trader.gives);
      this._tradedWith.add(npcId);
      dialog.show(trader.giveDialog);
      this._checkTradeChainComplete(dialog);
      return;
    }

    const wantIdx = this._inventory.indexOf(trader.wants);
    if (wantIdx === -1) {
      dialog.show(trader.needDialog);
      return;
    }

    // Trade!
    this._inventory.splice(wantIdx, 1);
    if (trader.gives) this._inventory.push(trader.gives);
    this._tradedWith.add(npcId);
    this.world?.globals?.audio?.playPickup();
    dialog.show(trader.giveDialog);
    this._checkTradeChainComplete(dialog);
  }

  _checkTradeChainComplete(dialog) {
    const allTraded = LEVELS_L5.traders.every(t => this._tradedWith.has(t.id));
    if (allTraded && !this._rooftopUnlocked) {
      this._rooftopUnlocked = true;
      setTimeout(() => {
        if (!dialog.active) {
          dialog.show([
            { speaker: 'Mikkel', text: '(The garden gate is open now. Everyone helped me get here.)' },
            { speaker: 'Mikkel', text: '(All it took was listening to what each person needed.)' },
          ]);
        }
      }, 600);
    }
  }

  _checkGoal(dialog) {
    if (this._pCol === LEVELS_L5.goal.col && this._pRow === LEVELS_L5.goal.row) {
      this.goalReached = true;
      this.world?.globals?.audio?.playPickup();
      const mem = LEVELS_L5.memoryItem;
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
    setTimeout(() => this.manager.switchTo('vignette', { levelIdx: 4 }), 600);
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
