/**
 * puzzle.js – Level 2 Dutch Countryside water-routing puzzle
 * Player toggles sluice gates to route canal water to a dry tulip garden.
 * At each fork, if both branches are open, water splits and neither reaches.
 */
import {
  Scene, Position, Sprite, Camera, CameraFollow,
  TileMap, GridCollider, DialogData,
} from '../../../engine/index.js';
import { LEVELS_L2 } from '../data/levels.js';
import { SPRITE_REGIONS, TILE_REGIONS_DAY } from '../main.js';

const TILE_SIZE = 32;
const CHARS = { g:0, w:1, p:2, t:3, W:4, f:5, c:6, h:7, b:8, m:9, F:10, d:11 };
const SOLID = [1, 3, 4, 7, 9, 10];

const TILE_DIALOG = {
  1: ['(Full reservoir. So much water, nowhere to go. I relate.)'],
  3: ['(Dutch elm. Straight, reliable, boring. Very Dutch. (I\'m allowed to say that, I\'m Nordic.))'],
  5: ['(Tulips. She pressed one in her diary. I\'m not supposed to know that.)'],
  7: ['(Canal house. Someone\'s having breakfast in there. I\'m jealous.)'],
  9: ['(Old windmill. Waiting for water to flow. Me and this windmill have a lot in common.)'],
  10: ['(Wooden fence. Simple, sturdy. Keeping me out. Rude but fair.)'],
};

function spriteOf(key) {
  const r = SPRITE_REGIONS[key];
  if (!r) return { sheetKey: 'main', srcX: 0, srcY: 0, srcW: 16, srcH: 16, scale: 2 };
  return { sheetKey: 'main', srcX: r.srcX, srcY: r.srcY, srcW: 16, srcH: 16, scale: 2 };
}

export class PuzzleScene extends Scene {
  constructor() {
    super('puzzle');
    this.entities = [];
    this.player = null;
    this.goalReached = false;
    this.introPlayed = false;
    this.selfTalkTriggered = {};
    this.npcDialogIdx = {};
    this._pCol = 0; this._pRow = 0;
    this._visualX = 0; this._visualY = 0;
    this._moving = false; this._facing = 'down';
    this._moveSpeed = 180;
    // Puzzle state
    this._gates = [];
    this._wetTiles = new Set();
    this._mapData = null;
    this._hasLeak = false;
    this._prevWetCount = 0;
    // Water animation: per-tile fill level (0..1) and BFS distance for staggered fill
    this._tileAlpha = new Map();  // key → current alpha
    this._tileDist = new Map();   // key → BFS distance from source
    this._targetWet = new Set();  // what _calcWaterFlow computed
    this._flowAnimTime = 0;
    this._drainStartTime = 0;
    this._drainDist = new Map();  // key → distance at time of disconnection (for drain order)
    this._flowSpeed = 8;          // tiles per second fill rate
  }

  enter(params) {
    this.world?.globals?.audio?.setTrack('puzzle');
    const level = LEVELS_L2;
    this.goalReached = false;
    this.selfTalkTriggered = {};
    this.npcDialogIdx = {};
    this.entities = [];
    const world = this.world;

    // Parse map
    const mapRows = level.map.split('\n');
    this._mapData = mapRows.map(row => [...row].map(ch => CHARS[ch] ?? 0));

    // Clone gate states
    this._gates = level.gates.map(g => ({ ...g }));

    // Tilemap entity (uses daytime tile regions)
    const tmEntity = world.createEntity();
    tmEntity.add(TileMap, {
      data: this._mapData,
      cols: this._mapData[0].length, rows: this._mapData.length,
      tileSize: TILE_SIZE, sheetKey: 'main',
      tileRegions: TILE_REGIONS_DAY, solidTiles: SOLID,
    });
    tmEntity.add(Position, { x: 0, y: 0 });
    tmEntity.tag('tilemap');
    this.entities.push(tmEntity);

    // Camera
    const cam = world.createEntity();
    cam.add(Camera, {}); cam.add(Position, { x: 0, y: 0 });
    cam.add(CameraFollow, { targetTag: 'player', smoothing: 8 });
    cam.tag('camera'); this.entities.push(cam);

    // Player
    this._pCol = level.start.col; this._pRow = level.start.row;
    this._visualX = this._pCol * TILE_SIZE; this._visualY = this._pRow * TILE_SIZE;
    this._moving = false; this._facing = 'down';
    this.player = world.createEntity();
    this.player.add(Position, { x: this._visualX, y: this._visualY });
    this.player.add(Sprite, { ...spriteOf('mikkel_down'), bobAmount: 0, bobSpeed: 6 });
    this.player.add(GridCollider, { width: TILE_SIZE, height: TILE_SIZE });
    this.player.tag('player'); this.entities.push(this.player);

    // NPCs
    for (const npc of level.npcs) {
      const e = world.createEntity();
      e.add(Position, { x: npc.col * TILE_SIZE, y: npc.row * TILE_SIZE });
      e.add(Sprite, spriteOf(npc.sprite));
      e.add(DialogData, { lines: npc.dialog });
      e.tag('npc'); e.tag('npc_' + npc.id);
      this.entities.push(e);
    }

    // Initial water flow
    this._calcWaterFlow();

    // Intro
    if (!this.introPlayed) {
      this.introPlayed = true;
      this.selfTalkTriggered['start'] = true;
      const dialog = world.globals.dialog;
      if (dialog) dialog.show(level.intro);
    }
    this._showObjective('Route canal water to the tulip garden');
    document.getElementById('location-name').textContent = level.name;
  }

  update(dt) {
    const world = this.world;
    const dialog = world.globals.dialog;
    const input = world.globals.input;
    if (this.goalReached || dialog?.active) {
      if (dialog?.active && input?.isPressed('Space')) dialog.advance();
      // Still animate water even during dialog
      this._animateWater(dt);
      return;
    }
    if (!this._moving) this._handleMovement(input);
    this._interpolateMovement(dt);
    this._animateWater(dt);
    this._checkInteractions(input, dialog);

    // H-key hint
    if (input?.isPressed('KeyH') && !dialog?.active) {
      dialog.show([{ speaker: 'Mikkel', text: '(Open and close the sluice gates to route water to the tulip garden. Red means closed, green means open.)' }]);
    }
  }

  _animateWater(dt) {
    this._flowAnimTime += dt;
    const speed = this._flowSpeed;
    let allSettled = true;

    // Fill tiles that should be wet
    for (const key of this._targetWet) {
      const d = this._tileDist.get(key) || 0;
      const delay = d / speed;
      const elapsed = this._flowAnimTime - delay;
      const target = elapsed > 0 ? Math.min(1, elapsed * 3) : 0;
      const cur = this._tileAlpha.get(key) || 0;
      if (cur < target) {
        this._tileAlpha.set(key, Math.min(cur + dt * 3, target));
        allSettled = false;
      }
      if ((this._tileAlpha.get(key) || 0) > 0) this._wetTiles.add(key);
    }

    // Drain tiles that should no longer be wet (percolate from far end)
    let maxDrainDist = 0;
    for (const [, d] of this._drainDist) { if (d > maxDrainDist) maxDrainDist = d; }
    for (const [key, alpha] of this._tileAlpha) {
      if (!this._targetWet.has(key) && alpha > 0) {
        const d = this._drainDist.get(key) || 0;
        const delay = (maxDrainDist - d) / speed; // far tiles drain first
        const elapsed = this._flowAnimTime - delay;
        if (elapsed > 0) {
          const newA = Math.max(0, alpha - dt * 4);
          this._tileAlpha.set(key, newA);
          if (newA <= 0) {
            this._tileAlpha.delete(key);
            this._wetTiles.delete(key);
            this._drainDist.delete(key);
          }
        }
        allSettled = false;
      }
    }

    // Check win only when animation has settled and goal tile is fully filled
    if (allSettled && !this.goalReached) {
      const goalKey = `${LEVELS_L2.goal.col},${LEVELS_L2.goal.row}`;
      if (this._targetWet.has(goalKey) && (this._tileAlpha.get(goalKey) || 0) >= 1 && !this._hasLeak) {
        this.goalReached = true;
        const dialog = this.world.globals.dialog;
        const mem = LEVELS_L2.memoryItem;
        dialog.show([
          { speaker: '', text: `✦ Memory restored: ${mem.name}` },
          { speaker: '', text: `"${mem.flavor}"` },
        ], () => this._onLevelComplete());
      }
    }
  }

  render() {
    const renderer = this.world?.globals?.renderer;
    if (!renderer) return;
    const cam = this.world.queryTag('camera')[0]?.get('Position');
    if (!cam) return;
    const ctx = renderer.ctx;

    // Draw water on wet canal tiles with per-tile fill animation
    for (const [key, alpha] of this._tileAlpha) {
      if (alpha <= 0) continue;
      const [c, r] = key.split(',').map(Number);
      const x = c * TILE_SIZE - cam.x;
      const y = r * TILE_SIZE - cam.y;
      ctx.save();
      ctx.globalAlpha = alpha;
      // Base water
      ctx.fillStyle = this._hasLeak ? 'rgba(60,130,200,0.5)' : 'rgba(40,120,220,0.7)';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      // Animated wave shimmer
      const wave = Math.sin((Date.now() / 300) + c * 0.7 + r * 0.4) * 0.15;
      const wave2 = Math.cos((Date.now() / 450) + c * 0.3 - r * 0.6) * 0.1;
      ctx.fillStyle = `rgba(100,180,255,${0.2 + wave})`;
      ctx.fillRect(x + 2, y + 6, TILE_SIZE - 4, 4);
      ctx.fillStyle = `rgba(140,210,255,${0.15 + wave2})`;
      ctx.fillRect(x + 4, y + 14, TILE_SIZE - 8, 3);
      // Fill-edge highlight -- bright line at the wavefront when partially filled
      if (alpha < 0.9) {
        ctx.fillStyle = `rgba(180,220,255,${0.6 * (1 - alpha)})`;
        const edgeY = y + TILE_SIZE * (1 - alpha);
        ctx.fillRect(x, edgeY, TILE_SIZE, 2);
      }
      ctx.restore();
    }

    // Draw gates
    for (const gate of this._gates) {
      const x = gate.col * TILE_SIZE - cam.x;
      const y = gate.row * TILE_SIZE - cam.y;
      if (gate.open) {
        ctx.fillStyle = 'rgba(80,200,80,0.6)';
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.strokeStyle = '#4a4'; ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      } else {
        ctx.fillStyle = 'rgba(200,80,80,0.6)';
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.strokeStyle = '#a44'; ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        // X mark
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 8); ctx.lineTo(x + TILE_SIZE - 8, y + TILE_SIZE - 8);
        ctx.moveTo(x + TILE_SIZE - 8, y + 8); ctx.lineTo(x + 8, y + TILE_SIZE - 8);
        ctx.stroke();
      }
    }

    // Goal indicator (pulsing tulip icon when dry)
    if (!this.goalReached) {
      const gx = LEVELS_L2.goal.col * TILE_SIZE - cam.x + TILE_SIZE / 2;
      const gy = LEVELS_L2.goal.row * TILE_SIZE - cam.y + TILE_SIZE / 2;
      const pulse = 0.4 + Math.sin(Date.now() / 500) * 0.3;
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('✿', gx, gy);
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

    // NPC solidity
    for (const npc of this.world.queryTag('npc')) {
      const p = npc.get('Position');
      if (Math.round(p.x / TILE_SIZE) === destCol && Math.round(p.y / TILE_SIZE) === destRow) return;
    }

    this._pCol = destCol; this._pRow = destRow;
    this._moving = true;
    sprite.bobAmount = 2;
  }

  _interpolateMovement(dt) {
    const tx = this._pCol * TILE_SIZE, ty = this._pRow * TILE_SIZE;
    const dx = tx - this._visualX, dy = ty - this._visualY;
    const step = this._moveSpeed * dt * ((Math.abs(dx) > 0.5 && Math.abs(dy) > 0.5) ? 0.7071 : 1);
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      this._visualX += Math.abs(dx) <= step ? dx : Math.sign(dx) * step;
      this._visualY += Math.abs(dy) <= step ? dy : Math.sign(dy) * step;
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

    // Gate toggle -- check if facing a gate
    const dx = this._facing === 'right' ? 1 : this._facing === 'left' ? -1 : 0;
    const dy = this._facing === 'down' ? 1 : this._facing === 'up' ? -1 : 0;
    const fc = this._pCol + dx, fr = this._pRow + dy;
    const gate = this._gates.find(g => g.col === fc && g.row === fr);
    if (gate) {
      gate.open = !gate.open;
      this._calcWaterFlow(gate.open ? gate : null);
      if (!this.selfTalkTriggered['first_gate']) {
        this.selfTalkTriggered['first_gate'] = true;
        const st = LEVELS_L2.selfTalk.find(s => s.trigger === 'first_gate');
        if (st) dialog.show([{ speaker: 'Mikkel', text: st.text }]);
      }
      // Leak feedback
      if (this._hasLeak && !this.selfTalkTriggered['leak']) {
        this.selfTalkTriggered['leak'] = true;
        const st = LEVELS_L2.selfTalk.find(s => s.trigger === 'leak');
        if (st) setTimeout(() => dialog.show([{ speaker: 'Mikkel', text: st.text }]), 400);
      }
      this._prevWetCount = this._targetWet.size;
      return;
    }

    // Also allow toggling gate player is standing ON
    const gateOn = this._gates.find(g => g.col === this._pCol && g.row === this._pRow);
    if (gateOn) {
      gateOn.open = !gateOn.open;
      this._calcWaterFlow(gateOn.open ? gateOn : null);
      return;
    }

    // NPC interaction
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

    // Tile dialog
    const tile = this._mapData[this._pRow + dy]?.[this._pCol + dx];
    if (tile !== undefined && TILE_DIALOG[tile]) {
      const lines = TILE_DIALOG[tile];
      dialog.show([{ speaker: 'Mikkel', text: lines[Math.floor(Math.random() * lines.length)] }]);
    }

    // Env interactions
    for (const env of LEVELS_L2.envInteractions) {
      if (Math.abs(this._pCol - env.col) <= 1 && Math.abs(this._pRow - env.row) <= 1) {
        dialog.show([{ speaker: 'Mikkel', text: env.text }]);
        return;
      }
    }
  }

  _calcWaterFlow(originGate) {
    const wet = new Set();
    const dist = new Map();
    const data = this._mapData;
    const rows = data.length, cols = data[0].length;
    const gateMap = new Map();
    for (const g of this._gates) gateMap.set(`${g.col},${g.row}`, g);

    // Find canal tiles adjacent to water (reservoir) -- these are BFS sources
    const queue = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (data[r][c] !== 6) continue; // 6 = dry canal
        const adj = [[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
        for (const [ar, ac] of adj) {
          if (ar >= 0 && ar < rows && ac >= 0 && ac < cols && data[ar][ac] === 1) {
            const key = `${c},${r}`;
            const gate = gateMap.get(key);
            if (!gate || gate.open) {
              wet.add(key);
              dist.set(key, 0);
              queue.push([c, r]);
            }
            break;
          }
        }
      }
    }

    // BFS through canal tiles
    let head = 0;
    while (head < queue.length) {
      const [cx, cy] = queue[head++];
      const d = dist.get(`${cx},${cy}`);
      for (const [nc, nr] of [[cx-1,cy],[cx+1,cy],[cx,cy-1],[cx,cy+1]]) {
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (data[nr][nc] !== 6) continue;
        const key = `${nc},${nr}`;
        if (wet.has(key)) continue;
        const gate = gateMap.get(key);
        if (gate && !gate.open) continue;
        wet.add(key);
        dist.set(key, d + 1);
        queue.push([nc, nr]);
      }
    }

    // When opened from a gate, recompute distances for newly-wet tiles from that gate
    if (originGate) {
      const prevWet = this._targetWet;
      const newTiles = [];
      for (const key of wet) {
        if (!prevWet.has(key)) newTiles.push(key);
      }
      if (newTiles.length > 0) {
        // BFS from the gate position through newly-wet tiles
        const gKey = `${originGate.col},${originGate.row}`;
        const localDist = new Map();
        const lq = [[originGate.col, originGate.row]];
        localDist.set(gKey, 0);
        let lh = 0;
        while (lh < lq.length) {
          const [cx, cy] = lq[lh++];
          const d = localDist.get(`${cx},${cy}`);
          for (const [nc, nr] of [[cx-1,cy],[cx+1,cy],[cx,cy-1],[cx,cy+1]]) {
            const nk = `${nc},${nr}`;
            if (localDist.has(nk)) continue;
            if (!wet.has(nk)) continue;
            localDist.set(nk, d + 1);
            lq.push([nc, nr]);
          }
        }
        // Overwrite distances for newly-wet tiles with gate-relative distances
        for (const key of newTiles) {
          dist.set(key, localDist.get(key) ?? dist.get(key) ?? 0);
        }
        // Already-wet tiles get distance 0 so they stay filled instantly
        for (const key of prevWet) {
          if (wet.has(key)) dist.set(key, 0);
        }
      }
    }

    // Set target state -- animation will interpolate in update()
    // Track tiles being drained so they recede from far end first
    for (const [key] of this._tileAlpha) {
      if (!wet.has(key) && !this._drainDist.has(key)) {
        this._drainDist.set(key, this._tileDist.get(key) || 0);
      }
    }
    // Clear drain tracking for tiles that are wet again
    for (const key of wet) this._drainDist.delete(key);
    this._drainStartTime = this._flowAnimTime;

    this._targetWet = wet;
    this._tileDist = dist;
    this._flowAnimTime = 0;

    // Update leak detection based on target
    this._hasLeak = false;
    for (const key of wet) {
      if (!LEVELS_L2.correctPath.has(key)) { this._hasLeak = true; break; }
    }
    if (!this._hasLeak) this.selfTalkTriggered['leak'] = false;
  }

  _onLevelComplete() {
    const memEl = document.getElementById('memories-collected');
    const current = parseInt(memEl.textContent) || 0;
    memEl.textContent = current + 1;
    setTimeout(() => {
      this.manager.switchTo('vignette', { levelIdx: 1 });
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