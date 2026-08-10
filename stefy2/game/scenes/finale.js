/**
 * finale.js – Level 7 Italy finale
 * Combines ALL previous mechanics: stealth → puzzle → chase → explore → trade → precision.
 * Commitment: all of the above, always.
 */
import {
  Scene, Position, Sprite, Camera, CameraFollow,
  TileMap, GridCollider, DialogData,
} from '../../../engine/index.js';
import { LEVELS_L7 } from '../data/levels.js';
import { SPRITE_REGIONS, TILE_REGIONS_DAY } from '../main.js';

const TILE_DIALOG = {
  1: [
    '(Canal at sunset. Golden. She\'d try to skip a stone. It\'d go once.)',
    '(Still water. Very romantic. I\'m not thinking about that. (I am.))',
  ],
  3: [
    '(Olive tree. Twisted, patient, older than my problems.)',
    '(Gnarled trunk. This tree has SEEN things. Probably unimpressed by me.)',
  ],
  4: [
    '(Stone wall. Warm from the sun. I could nap here. NO. FOCUS.)',
    '(Ancient brickwork. This village has centuries on me and it shows.)',
  ],
  5: [
    '(Sunflowers taller than me. HER favorites. Almost there.)',
    '(Wildflowers everywhere. Italy is showing off.)',
    '(She\'d stop to smell every single one. I\'d pretend to be patient.)',
  ],
  7: [
    '(Village house. Terracotta roof. Fresh pasta smell. I\'m SUFFERING.)',
    '(Green shutters. Warm light. Someone is living my dream life in there.)',
  ],
  9: [
    '(Stone bench. Good for sitting. Bad for quitting. Keep moving.)',
    '(Cobblestones. Smooth from a thousand footsteps. Mine included now.)',
  ],
  10: [
    '(Vineyard hedge. No shortcut. Grapes not even ripe yet. Useless.)',
    '(Dense growth. Full of grapes. Taunting me.)',
  ],
  11: [
    '(Cellar door. Barred shut. Probably has excellent wine. Not for me.)',
    '(Heavy door. Says no. I keep walking.)',
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

/**
 * The finale map is divided into 6 sections (phases), each using a mechanic from previous levels.
 * Player progresses through each phase sequentially within a single large map.
 */
export class FinaleScene extends Scene {
  constructor() {
    super('finale');
    this.entities = [];
    this.player = null;
    this.goalReached = false;
    this.introPlayed = false;
    this.npcDialogIdx = {};
    this._pCol = 0; this._pRow = 0;
    this._visualX = 0; this._visualY = 0;
    this._moving = false; this._facing = 'down';
    this._moveSpeed = 160;
    this._mapData = null;
    this._phase = 0; // 0-5: stealth, puzzle, chase, explore, trade, precision
    this._phaseClear = [false, false, false, false, false, false];
    // Phase-specific state
    this._guardPaths = []; this._guardPositions = [];
    this._guardTimers = []; this._detected = false;
    this._puzzleSolved = false;
    this._drainTimer = 0; this._draining = false; this._drainTiles = [];
    this._wispCaught = false;
    this._orbsCollected = [];
    this._revealed = new Set();
    this._revealAlpha = new Map();
    this._inventory = []; this._tradedWith = new Set();
    this._falling = false; this._fallTimer = 0;
    this._cpCol = 0; this._cpRow = 0;
  }

  enter(params) {
    this.world?.globals?.audio?.setTrack('finale');
    const level = LEVELS_L7;
    this.goalReached = false;
    this.npcDialogIdx = {};
    this.entities = [];
    this._phase = 0;
    this._phaseClear = [false, false, false, false, false, false];
    this._detected = false;
    this._puzzleSolved = false;
    this._drainTimer = 0; this._draining = false; this._drainTiles = [];
    this._wispCaught = false;
    this._orbsCollected = [];
    this._revealed = new Set();
    this._revealAlpha = new Map();
    this._inventory = [];
    this._tradedWith = new Set();
    this._falling = false;
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
    this._cpCol = level.start.col; this._cpRow = level.start.row;
    this._visualX = this._pCol * TILE_SIZE; this._visualY = this._pRow * TILE_SIZE;
    this._moving = false; this._facing = 'down';
    this.player = world.createEntity();
    this.player.add(Position, { x: this._visualX, y: this._visualY });
    this.player.add(Sprite, { ...spriteOf('mikkel_down'), bobAmount: 0, bobSpeed: 6 });
    this.player.add(GridCollider, { width: TILE_SIZE, height: TILE_SIZE });
    this.player.tag('player'); this.entities.push(this.player);

    // Guards for stealth phase
    for (const guard of level.phases[0].guards) {
      const ge = world.createEntity();
      ge.add(Position, { x: guard.path[0].col * TILE_SIZE, y: guard.path[0].row * TILE_SIZE });
      ge.add(Sprite, spriteOf('guard'));
      ge.tag('guard');
      this.entities.push(ge);
      this._guardPaths.push(guard.path);
      this._guardPositions.push({ col: guard.path[0].col, row: guard.path[0].row });
      this._guardTimers.push(0);
    }

    // NPCs for trade phase
    for (const npc of level.phases[4].npcs) {
      const e = world.createEntity();
      e.add(Position, { x: npc.col * TILE_SIZE, y: npc.row * TILE_SIZE });
      e.add(Sprite, spriteOf(npc.sprite));
      e.add(DialogData, { lines: [] });
      e.tag('npc'); e.tag('npc_' + npc.id);
      this.entities.push(e);
    }

    // World-building NPCs
    for (const npc of level.npcs) {
      const e = world.createEntity();
      e.add(Position, { x: npc.col * TILE_SIZE, y: npc.row * TILE_SIZE });
      e.add(Sprite, spriteOf(npc.sprite));
      e.add(DialogData, { lines: npc.dialog });
      e.tag('npc'); e.tag('npc_' + npc.id);
      this.entities.push(e);
    }

    // Initial fog for explore phase section
    this._revealAround(this._pCol, this._pRow);

    if (!this.introPlayed) {
      this.introPlayed = true;
      const dialog = world.globals.dialog;
      if (dialog) dialog.show(level.intro);
    }
    this._showObjective('Find the sunflower. Use everything you\'ve learned');
    document.getElementById('location-name').textContent = level.name;
  }

  update(dt) {
    const world = this.world;
    const dialog = world.globals.dialog;
    const input = world.globals.input;
    if (dialog?.active) { if (input?.isPressed('Space')) dialog.advance(); return; }
    if (this.goalReached) return;
    if (this._falling) { this._fallTimer -= dt; if (this._fallTimer <= 0) this._respawn(); return; }
    if (this._detected) return;

    this._updatePhase(dt);
    if (!this._moving) this._handleMovement(input);
    this._interpolateMovement(dt);
    this._checkGoal(dialog);
    this._checkInteractions(input, dialog);
  }

  render() {
    const renderer = this.world?.globals?.renderer;
    if (!renderer) return;
    const cam = this.world.queryTag('camera')[0]?.get('Position');
    if (!cam) return;
    const ctx = renderer.ctx;
    const level = LEVELS_L7;

    // Phase 1 water drain visual — bubbling effect on tiles about to drain
    if (this._phase === 1 && this._draining) {
      const drained = Math.floor(this._drainTimer * 4);
      for (let i = drained; i < Math.min(drained + 3, this._drainTiles.length); i++) {
        const t = this._drainTiles[i];
        const tx = t.col * TILE_SIZE - cam.x, ty = t.row * TILE_SIZE - cam.y;
        const bubble = Math.sin(Date.now() / 150 + i) * 0.2 + 0.4;
        ctx.fillStyle = `rgba(200,230,255,${bubble})`;
        ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
      }
    }

    // Phase 3 fog-of-war overlay (explore section only)
    if (this._phase >= 3) {
      const fogZone = level.phases[3].zone;
      for (let r = fogZone.startRow; r < fogZone.endRow; r++) {
        for (let c = fogZone.startCol; c < fogZone.endCol; c++) {
          const key = `${c},${r}`;
          const alpha = this._revealAlpha.get(key);
          if (alpha === undefined || alpha < 1) {
            const fogA = alpha === undefined ? 1 : 1 - alpha;
            ctx.fillStyle = `rgba(10,20,10,${fogA * 0.85})`;
            ctx.fillRect(c * TILE_SIZE - cam.x, r * TILE_SIZE - cam.y, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }

    // Phase 5 fall flash
    if (this._falling) {
      const flash = Math.sin(this._fallTimer * 10) * 0.3;
      ctx.fillStyle = `rgba(100,150,200,${0.2 + flash})`;
      ctx.fillRect(0, 0, 640, 480);
    }

    // Memory orbs (phase 2)
    if (this._phase === 2) {
      const orbs = level.phases[2].memoryOrbs;
      for (let i = 0; i < orbs.length; i++) {
        const orb = orbs[i];
        const ox = orb.col * TILE_SIZE - cam.x + TILE_SIZE / 2;
        const oy = orb.row * TILE_SIZE - cam.y + TILE_SIZE / 2;
        if (this._orbsCollected.includes(i)) {
          // Faded collected marker
          const glow = ctx.createRadialGradient(ox, oy, 2, ox, oy, 12);
          glow.addColorStop(0, 'rgba(180,140,255,0.25)');
          glow.addColorStop(1, 'rgba(180,140,255,0)');
          ctx.fillStyle = glow;
          ctx.fillRect(ox - 14, oy - 14, 28, 28);
        } else {
          // Active orb with glow
          const bob = Math.sin(Date.now() / 500 + i * 2) * 3;
          const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 400 + i);
          const grad = ctx.createRadialGradient(ox, oy + bob, 3, ox, oy + bob, 30);
          grad.addColorStop(0, `rgba(180,140,255,${0.45 * pulse})`);
          grad.addColorStop(0.5, `rgba(140,100,220,${0.2 * pulse})`);
          grad.addColorStop(1, 'rgba(100,60,180,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(ox - 34, oy + bob - 34, 68, 68);
          ctx.beginPath();
          ctx.arc(ox, oy + bob, 7 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(200,160,255,0.9)';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ox, oy + bob, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.95)';
          ctx.fill();
        }
      }
      // Orb counter
      ctx.save(); ctx.font = '12px sans-serif';
      ctx.fillStyle = '#b19cd9'; ctx.textAlign = 'right';
      ctx.fillText(`✦ ${this._orbsCollected.length}/${orbs.length}`, 630, 470);
      ctx.restore();
    }

    // Goal glow
    if (!this.goalReached) {
      const gx = level.goal.col * TILE_SIZE - cam.x + TILE_SIZE / 2;
      const gy = level.goal.row * TILE_SIZE - cam.y + TILE_SIZE / 2;
      const pulse = 0.3 + Math.sin(Date.now() / 350) * 0.3;
      ctx.save(); ctx.globalAlpha = pulse;
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('✿', gx, gy);
      ctx.restore();
    }

    // Phase indicator
    const phaseNames = ['Stealth', 'Water', 'Memory', 'Explore', 'Trade', 'Precision'];
    ctx.save(); ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.textAlign = 'left';
    ctx.fillText(`Phase: ${phaseNames[this._phase] || 'Final'}`, 10, 20);
    ctx.restore();
  }

  _updatePhase(dt) {
    const level = LEVELS_L7;
    // Determine phase by player row bands
    const zones = level.phases.map(p => p.zone);
    for (let i = zones.length - 1; i >= 0; i--) {
      if (this._pRow >= zones[i].startRow && this._pRow < zones[i].endRow) {
        this._phase = i; break;
      }
    }

    // Phase 0 -- stealth: move guards smoothly between waypoints
    if (this._phase === 0) {
      for (let i = 0; i < this._guardPaths.length; i++) {
        this._guardTimers[i] += dt;
        const path = this._guardPaths[i];
        const speed = 3; // tiles per second

        // Compute total path length in tiles (Manhattan between waypoints)
        if (!this._guardPathLengths) this._guardPathLengths = [];
        if (!this._guardPathLengths[i]) {
          let total = 0;
          for (let j = 1; j < path.length; j++) {
            total += Math.abs(path[j].col - path[j-1].col) + Math.abs(path[j].row - path[j-1].row);
          }
          this._guardPathLengths[i] = total;
        }
        const totalLen = this._guardPathLengths[i];
        if (totalLen === 0) continue;

        // Progress along path (loops)
        const dist = (this._guardTimers[i] * speed) % totalLen;

        // Find which segment we're on and interpolate
        let accum = 0;
        let gCol = path[0].col, gRow = path[0].row;
        for (let j = 1; j < path.length; j++) {
          const segLen = Math.abs(path[j].col - path[j-1].col) + Math.abs(path[j].row - path[j-1].row);
          if (accum + segLen >= dist) {
            const t = (dist - accum) / segLen;
            gCol = path[j-1].col + (path[j].col - path[j-1].col) * t;
            gRow = path[j-1].row + (path[j].row - path[j-1].row) * t;
            break;
          }
          accum += segLen;
        }

        this._guardPositions[i] = { col: Math.round(gCol), row: Math.round(gRow) };
        const ge = this.world.queryTag('guard')[i];
        if (ge) {
          const p = ge.get('Position');
          p.x = gCol * TILE_SIZE; p.y = gRow * TILE_SIZE;
        }
        // Detection
        const dist2 = Math.abs(this._pCol - Math.round(gCol)) + Math.abs(this._pRow - Math.round(gRow));
        if (dist2 <= 2) {
          this._detected = true;
          const dialog = this.world.globals.dialog;
          dialog.show([{ speaker: '', text: 'Spotted! Starting over...' }], () => {
            this._detected = false;
            this._pCol = level.start.col; this._pRow = level.start.row;
            this._visualX = this._pCol * TILE_SIZE; this._visualY = this._pRow * TILE_SIZE;
            const pos = this.player.get('Position');
            pos.x = this._visualX; pos.y = this._visualY;
          });
          return;
        }
      }
    }

    // Phase 1 -- water drain animation
    if (this._phase === 1 && this._draining) {
      this._drainTimer += dt;
      const drainSpeed = 4; // tiles per second
      const tilesDrained = Math.floor(this._drainTimer * drainSpeed);
      for (let i = 0; i < Math.min(tilesDrained, this._drainTiles.length); i++) {
        const t = this._drainTiles[i];
        if (this._mapData[t.row][t.col] === 1) {
          this._mapData[t.row][t.col] = 0; // water → grass
        }
      }
      if (tilesDrained >= this._drainTiles.length) this._draining = false;
    }

    // Phase 2 -- memory orbs: rendering handled in render(), collection in _checkInteractions
    // (no update logic needed for static orbs)

    // Phase 3 -- fog reveal
    if (this._phase === 3) {
      for (const [key, a] of this._revealAlpha) {
        if (a < 1) this._revealAlpha.set(key, Math.min(1, a + dt * 4));
      }
    }
  }

  _handleMovement(input) {
    if (!input) return;
    // Phase 5 precision: only isPressed
    const isPrecision = this._phase === 5;
    let dx = 0, dy = 0;
    const check = isPrecision ? 'isPressed' : 'isDown';
    if (input[check]('ArrowUp') || input[check]('KeyW')) dy = -1;
    else if (input[check]('ArrowDown') || input[check]('KeyS')) dy = 1;
    if (input[check]('ArrowLeft') || input[check]('KeyA')) dx = -1;
    else if (input[check]('ArrowRight') || input[check]('KeyD')) dx = 1;
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

    // Phase 5 fall tiles
    if (this._phase === 5 && [1, 6].includes(tile)) {
      this._pCol = destCol; this._pRow = destRow;
      this._moving = true; this._falling = true; this._fallTimer = 0.8;
      return;
    }

    const level = LEVELS_L7;

    for (const npc of this.world.queryTag('npc')) {
      const p = npc.get('Position');
      if (Math.round(p.x / TILE_SIZE) === destCol && Math.round(p.y / TILE_SIZE) === destRow) return;
    }

    this._pCol = destCol; this._pRow = destRow;
    this._moving = true; sprite.bobAmount = 2;

    // Phase 3 reveal
    if (this._phase === 3) this._revealAround(destCol, destRow);

    // Phase 5 checkpoints
    if (this._phase === 5) {
      for (const cp of level.phases[5].checkpoints) {
        if (destCol === cp.col && destRow === cp.row) {
          this._cpCol = cp.col; this._cpRow = cp.row;
        }
      }
    }
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

  _revealAround(col, row) {
    for (let dr = -3; dr <= 3; dr++) {
      for (let dc = -3; dc <= 3; dc++) {
        if (Math.abs(dr) + Math.abs(dc) > 4) continue;
        const key = `${col + dc},${row + dr}`;
        if (!this._revealed.has(key)) {
          this._revealed.add(key); this._revealAlpha.set(key, 0);
        }
      }
    }
  }

  _respawn() {
    this._falling = false;
    this._pCol = this._cpCol; this._pRow = this._cpRow;
    this._visualX = this._pCol * TILE_SIZE; this._visualY = this._pRow * TILE_SIZE;
    this._moving = false;
    const pos = this.player.get('Position');
    pos.x = this._visualX; pos.y = this._visualY;
  }

  _checkInteractions(input, dialog) {
    if (!input?.isPressed('Space') && !input?.isPressed('KeyE')) return;
    if (dialog?.active) { dialog.advance(); return; }

    const level = LEVELS_L7;

    // Puzzle switch (phase 1) -- drain water blocking the exit
    if (this._phase === 1 && !this._puzzleSolved) {
      const sw = level.phases[1].switch;
      if (Math.abs(this._pCol - sw.col) <= 1 && Math.abs(this._pRow - sw.row) <= 1) {
        this._puzzleSolved = true;
        this._draining = true;
        this._drainTimer = 0;
        this._drainTiles = level.phases[1].drainTiles;
        dialog.show([{ speaker: 'Mikkel', text: '(The sluice opens. Water drains away...)' }]);
        return;
      }
    }

    // Memory orbs (phase 2)
    if (this._phase === 2 && !this._wispCaught) {
      const orbs = level.phases[2].memoryOrbs;
      for (let i = 0; i < orbs.length; i++) {
        if (this._orbsCollected.includes(i)) continue;
        const orb = orbs[i];
        const dist = Math.abs(this._pCol - orb.col) + Math.abs(this._pRow - orb.row);
        if (dist <= 2) {
          this._orbsCollected.push(i);
          if (this._orbsCollected.length < orbs.length) {
            dialog.show([{ speaker: 'Mikkel', text: `(Memory orb ${this._orbsCollected.length}/${orbs.length} collected.)` }]);
          } else {
            this._wispCaught = true;
            const exit = level.phases[2].exitTile;
            this._mapData[exit.row][exit.col] = 0;
            dialog.show([{ speaker: 'Mikkel', text: '(All three memories gathered. The way forward opens.)' }]);
          }
          return;
        }
      }
    }

    // Trade NPCs (phase 4)
    if (this._phase === 4) {
      for (const npc of this.world.queryTag('npc')) {
        const nPos = npc.get('Position');
        const nc = Math.round(nPos.x / TILE_SIZE), nr = Math.round(nPos.y / TILE_SIZE);
        if (Math.abs(this._pCol - nc) <= 1 && Math.abs(this._pRow - nr) <= 1) {
          const id = [...npc.tags].find(t => t.startsWith('npc_'))?.slice(4);
          this._handleTrade(id, dialog);
          return;
        }
      }
    }

    // General NPC dialog
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
          return;
        }
      }
    }

    // Environmental interactions
    for (const env of level.envInteractions) {
      if (Math.abs(this._pCol - env.col) <= 1 && Math.abs(this._pRow - env.row) <= 1) {
        dialog.show([{ speaker: 'Mikkel', text: env.text }]);
        return;
      }
    }

    // Tile-based self-talk
    const fdx = this._facing === 'right' ? 1 : this._facing === 'left' ? -1 : 0;
    const fdy = this._facing === 'down' ? 1 : this._facing === 'up' ? -1 : 0;
    const tile = this._mapData[this._pRow + fdy]?.[this._pCol + fdx];
    if (tile !== undefined && TILE_DIALOG[tile]) {
      const lines = TILE_DIALOG[tile];
      dialog.show([{ speaker: 'Mikkel', text: lines[Math.floor(Math.random() * lines.length)] }]);
    }
  }

  _handleTrade(npcId, dialog) {
    const traders = LEVELS_L7.phases[4].traders;
    const trader = traders.find(t => t.id === npcId);
    if (!trader) return;
    if (this._tradedWith.has(npcId)) {
      dialog.show([{ speaker: trader.name, text: trader.doneText }]);
      return;
    }
    if (trader.wants === null) {
      this._inventory.push(trader.gives);
      this._tradedWith.add(npcId);
      dialog.show(trader.giveDialog);
      return;
    }
    const idx = this._inventory.indexOf(trader.wants);
    if (idx === -1) { dialog.show(trader.needDialog); return; }
    this._inventory.splice(idx, 1);
    if (trader.gives) this._inventory.push(trader.gives);
    this._tradedWith.add(npcId);
    dialog.show(trader.giveDialog);
    // Florist trade opens the exit gate
    if (npcId === 'florist') {
      this._mapData[49][25] = 0;
    }
  }

  _checkGoal(dialog) {
    const level = LEVELS_L7;
    if (this._pCol === level.goal.col && this._pRow === level.goal.row) {
      this.goalReached = true;
      const mem = level.memoryItem;
      dialog.show([
        { speaker: '', text: `✦ Memory restored: ${mem.name}` },
        { speaker: '', text: `"${mem.flavor}"` },
        { speaker: '', text: 'All seven flowers bloom together.' },
        { speaker: '', text: 'The garden is whole again.' },
      ], () => this._onLevelComplete());
    }
  }

  _onLevelComplete() {
    const memEl = document.getElementById('memories-collected');
    memEl.textContent = '7';
    setTimeout(() => this.manager.switchTo('vignette', { levelIdx: 6 }), 600);
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
