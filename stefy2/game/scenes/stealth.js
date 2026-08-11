/**
 * stealth.js – Stealth level scene for Level 1 (Tokyo Night Garden)
 * Handles: fox patrols, vision cones, player sneaking, detection, checkpoints, goal
 */
import {
  Scene, Position, Sprite, Camera, CameraFollow,
  TileMap, GridCollider, DialogData, StealthGuard,
} from '../../../engine/index.js';
import { LEVELS } from '../data/levels.js';
import { VISION_CONE_COLOR } from '../data/sprites.js';
import { SPRITE_REGIONS, TILE_REGIONS } from '../main.js';
import { drawFlower } from '../data/flowers.js';

const TILE_SIZE = 32;
const TILE_CHARS = { g: 0, w: 1, p: 2, t: 3, W: 4, f: 5, s: 6, h: 7, b: 8, r: 9, B: 10, d: 11 };
const SOLID_TILES = [1, 3, 4, 7, 9, 10]; // water, tree, wall, house, rock, bush
const NOISY_TILES = new Set([0, 5, 10]); // grass, flowers, bush

const TILE_DIALOG = {
  0: [
    '(!grass)',
    '(Good grass for a picnic. Not that I\'m planning one...?)',
  ],
  1: [
    '(Dark water. Dark like Stefy\'s hair.)',
    '(She\'d say this looks like \"liquid silver.\" She says stuff like that.)',
    '(The koi are sleeping together. Maybe we should too.)',
  ],
  3: [
    '(She would name this tree. She names everything. Even her plants.)',
  ],
  4: [
    '(Garden wall. Mossy. Reminds me of Stardew with Stefy.)',
    '(Cold stone. She pretends to be cold and mean sometimes. I know that she\'s not.)',
    '(What\'s on the other side? Not Stefy. No need to go there.)',
  ],
  5: [
    '(These would be perfect for her. If only I could carry them AND sneak.)',
    '(She\'d probably photograph these. Then make me hold the phone flashlight.)',
  ],
  7: [
    '(Tea house. Closed. At midnight. Shocking.)',
    '(Shutters latched. Lantern flickering. Someone\'s having a better night than me.)',
  ],
  9: [
    '(Decorative rock. Too heavy. Too large. Very zen. Very in my way.)',
    '(She\'d sit on this and study her French. I\'d sit next to her and pretend to read.)',
  ],
  10: [
    '(The leaves rustle. Either wind or something alive. Stefy is waiting.)',
  ],
};

function spriteOf(key) {
  const r = SPRITE_REGIONS[key];
  if (!r) return { sheetKey: 'main', srcX: 0, srcY: 0, srcW: 16, srcH: 16, scale: 2 };
  return { sheetKey: 'main', srcX: r.srcX, srcY: r.srcY, srcW: 16, srcH: 16, scale: 2 };
}

export class StealthScene extends Scene {
  constructor() {
    super('stealth');
    this.levelIdx = 0;
    this.entities = [];
    this.player = null;
    this.detected = false;
    this.respawnTimer = 0;
    this.introPlayed = false;
    this.selfTalkTriggered = {};
    this.goalReached = false;
    this.npcDialogIdx = {};
    // Subgrid movement state
    this._pCol = 0;
    this._pRow = 0;
    this._visualX = 0;
    this._visualY = 0;
    this._moving = false;
    this._facing = 'down';
    this._moveSpeed = 160; // px/s (slightly slower for stealth feel)
  }

  enter(params) {
    this.world?.globals?.audio?.setTrack('stealth');
    this.levelIdx = params?.levelIdx ?? 0;
    const level = LEVELS[this.levelIdx];
    this.detected = false;
    this.goalReached = false;
    this.respawnTimer = 0;
    this.selfTalkTriggered = {};
    this.moveTimer = 0;
    this.entities = [];

    const world = this.world;

    // Parse map
    const mapRows = level.map.split('\n');
    const mapData = mapRows.map(row => [...row].map(ch => TILE_CHARS[ch] ?? 0));

    // Tilemap entity
    const tmEntity = world.createEntity();
    tmEntity.add(TileMap, {
      data: mapData,
      cols: mapData[0].length,
      rows: mapData.length,
      tileSize: TILE_SIZE,
      sheetKey: 'main',
      tileRegions: TILE_REGIONS,
      solidTiles: SOLID_TILES,
    });
    tmEntity.add(Position, { x: 0, y: 0 });
    tmEntity.tag('tilemap');
    this.entities.push(tmEntity);

    // Camera
    const camEntity = world.createEntity();
    camEntity.add(Camera, {});
    camEntity.add(Position, { x: 0, y: 0 });
    camEntity.add(CameraFollow, { targetTag: 'player', smoothing: 8 });
    camEntity.tag('camera');
    this.entities.push(camEntity);

    // Player
    this._pCol = level.start.col;
    this._pRow = level.start.row;
    this._visualX = level.start.col * TILE_SIZE;
    this._visualY = level.start.row * TILE_SIZE;
    this._moving = false;
    this._facing = 'down';
    this._startCol = level.start.col;
    this._startRow = level.start.row;
    this.player = world.createEntity();
    this.player.add(Position, { x: this._visualX, y: this._visualY });
    this.player.add(Sprite, { ...spriteOf('mikkel_down'), bobAmount: 0, bobSpeed: 6 });
    this.player.add(GridCollider, { width: TILE_SIZE, height: TILE_SIZE });
    this.player.tag('player');
    this.entities.push(this.player);

    // Guards (spirit foxes)
    for (const g of level.guards) {
      const fox = world.createEntity();
      fox.add(Position, { x: g.col * TILE_SIZE, y: g.row * TILE_SIZE });
      fox.add(Sprite, { ...spriteOf('fox_down'), bobAmount: 0, bobSpeed: 6 });
      fox.add(StealthGuard, {
        route: g.route,
        speed: g.speed,
        visionRange: g.visionRange,
        visionArc: g.visionArc,
        gridCol: g.col,
        gridRow: g.row,
      });
      fox.tag('guard');
      this.entities.push(fox);
    }

    // NPCs
    for (const npc of level.npcs) {
      const e = world.createEntity();
      e.add(Position, { x: npc.col * TILE_SIZE, y: npc.row * TILE_SIZE });
      e.add(Sprite, spriteOf(npc.sprite));
      e.add(DialogData, { lines: npc.dialog });
      e.tag('npc');
      e.tag('npc_' + npc.id);
      this.entities.push(e);
    }

    // Goal entity
    const goalEntity = world.createEntity();
    goalEntity.add(Position, { x: level.goal.col * TILE_SIZE, y: level.goal.row * TILE_SIZE });
    goalEntity.tag('goal');
    this.entities.push(goalEntity);

    // Set up detection callback
    const stealth = world.globals.stealth;
    if (stealth) {
      stealth.onDetected(() => {
        if (!this.detected) {
          this.detected = true;
          this.respawnTimer = 1.5;
          this.world?.globals?.audio?.playTone(200, 0.3, 'sawtooth', 0.4);
          this._showSelfTalk('caught');
        }
      });
    }

    // Show intro
    if (!this.introPlayed) {
      this.introPlayed = true;
      this.selfTalkTriggered['start'] = true;
      const dialog = world.globals.dialog;
      if (dialog) dialog.show(level.intro);
    }

    this._showObjective('Reach the cherry blossom without being seen');

    // UI
    document.getElementById('location-name').textContent = level.name;
  }

  update(dt) {
    const world = this.world;
    const dialog = world.globals.dialog;
    const input = world.globals.input;

    // Freeze all guards when time should stop
    const frozen = !!(dialog?.active || this.detected || this.goalReached);
    const guards = world.queryTag('guard');
    for (const g of guards) g.get('StealthGuard').paused = frozen;

    if (dialog?.active) {
      if (input?.isPressed('Space')) dialog.advance();
      return;
    }

    if (this.goalReached) return;

    // H-key hint
    if (input?.isPressed('KeyH') && !dialog?.active) {
      dialog.show([{ speaker: 'Mikkel', text: '(Sneak past the foxes. Watch their patterns. The cherry blossom is at the far end of the garden.)' }]);
      return;
    }

    // Handle respawn timer when detected
    if (this.detected) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) this._respawn();
      return;
    }

    // Player movement: accept new input only when not mid-step
    if (!dialog?.active && !this._moving) {
      this._handleMovement(input);
    }

    // Smooth interpolation toward grid target
    this._interpolateMovement(dt);

    // Detection uses logical grid position (same as rendered cones)
    const stealth = world.globals.stealth;
    if (stealth) stealth.checkDetection(dt, this._pCol, this._pRow);

    this._checkInteractions(input, dialog);
    this._checkGoal(dialog);
  }

  render(dt) {
    const renderer = this.world?.globals?.renderer;
    if (!renderer) return;
    const cam = this.world.queryTag('camera')[0]?.get('Position');
    if (!cam) return;
    const ctx = renderer.ctx;

    const guards = this.world.queryTag('guard');

    // Vision cones -- change color based on alert state
    for (const guard of guards) {
      const sg = guard.get('StealthGuard');
      const stealth = this.world.globals.stealth;
      if (!stealth) continue;
      const tiles = stealth.getVisionTiles(guard);
      if (sg.alertState === 1) {
        const flash = 0.2 + Math.abs(Math.sin(sg.alertTimer * 5)) * 0.2;
        ctx.fillStyle = `rgba(255, 40, 40, ${flash})`;
      } else {
        ctx.fillStyle = VISION_CONE_COLOR;
      }
      for (const t of tiles) {
        ctx.fillRect(t.col * TILE_SIZE - cam.x, t.row * TILE_SIZE - cam.y, TILE_SIZE, TILE_SIZE);
      }
    }

    // Alert icon only on foxes that SEE you (not turning)
    for (const guard of guards) {
      const sg = guard.get('StealthGuard');
      if (sg.alertState !== 1) continue;
      const pos = guard.get('Position');
      const sx = pos.x - cam.x + TILE_SIZE / 2;
      const sy = pos.y - cam.y - 8;
      const pulse = 0.8 + Math.sin(Date.now() / 80) * 0.2;
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#ff3333';
      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', sx, sy);
      ctx.restore();
    }

    // Draw flower at goal position
    if (!this.goalReached) {
      const level = LEVELS[this.levelIdx];
      const gx = level.goal.col * TILE_SIZE - cam.x + TILE_SIZE / 2;
      const gy = level.goal.row * TILE_SIZE - cam.y + TILE_SIZE / 2;
      const pulse = 0.6 + Math.sin(Date.now() / 500) * 0.3;
      const bob = Math.sin(Date.now() / 600) * 3;
      ctx.save();
      ctx.globalAlpha = pulse;
      drawFlower(ctx, 0, gx, gy + bob, 1.5);
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

    // Update facing direction
    this._facing = dy < 0 ? 'up' : dy > 0 ? 'down' : dx < 0 ? 'left' : 'right';
    const sprite = this.player.get('Sprite');
    const r = SPRITE_REGIONS['mikkel_' + this._facing];
    if (r) { sprite.srcX = r.srcX; sprite.srcY = r.srcY; }

    // Check destination tile
    const destCol = this._pCol + dx;
    const destRow = this._pRow + dy;
    const tm = this.world.queryTag('tilemap')[0]?.get('TileMap');
    if (!tm) return;
    const tile = tm.data[destRow]?.[destCol];
    if (tile === undefined || SOLID_TILES.includes(tile)) return;
    if (dx !== 0 && dy !== 0) {
      if (SOLID_TILES.includes(tm.data[this._pRow]?.[destCol]) || SOLID_TILES.includes(tm.data[destRow]?.[this._pCol])) return;
    }

    // NPCs and guards are solid
    for (const npc of this.world.queryTag('npc')) {
      const p = npc.get('Position');
      if (Math.round(p.x / TILE_SIZE) === destCol && Math.round(p.y / TILE_SIZE) === destRow) return;
    }
    for (const g of this.world.queryTag('guard')) {
      const sg = g.get('StealthGuard');
      if (sg.gridCol === destCol && sg.gridRow === destRow) return;
    }

    // Commit grid move, visual will interpolate
    this._pCol = destCol;
    this._pRow = destRow;
    this._moving = true;
    sprite.bobAmount = 2;
    this.world?.globals?.audio?.playStep();

    // Noise check
    if (NOISY_TILES.has(tile)) this._makeNoise(destCol, destRow, 2);
  }

  _interpolateMovement(dt) {
    const targetX = this._pCol * TILE_SIZE;
    const targetY = this._pRow * TILE_SIZE;
    const dx = targetX - this._visualX;
    const dy = targetY - this._visualY;
    const step = this._moveSpeed * dt * ((Math.abs(dx) > 0.5 && Math.abs(dy) > 0.5) ? 0.7071 : 1);

    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      this._visualX += Math.abs(dx) <= step ? dx : Math.sign(dx) * step;
      this._visualY += Math.abs(dy) <= step ? dy : Math.sign(dy) * step;
    } else {
      this._visualX = targetX;
      this._visualY = targetY;
      if (this._moving) {
        this._moving = false;
        const sprite = this.player.get('Sprite');
        sprite.bobAmount = 0;
      }
    }

    // Apply visual position to entity
    const pos = this.player.get('Position');
    pos.x = this._visualX;
    pos.y = this._visualY;
  }

  _makeNoise(col, row, radius) {
    const guards = this.world.queryTag('guard');
    for (const guard of guards) {
      const sg = guard.get('StealthGuard');
      if (sg.turning || sg.moving) continue;
      const gCol = sg.gridCol;
      const gRow = sg.gridRow;
      const dist = Math.abs(gCol - col) + Math.abs(gRow - row);
      if (dist <= radius) {
        const ddx = col - gCol, ddy = row - gRow;
        let newDir;
        if (Math.abs(ddx) > Math.abs(ddy)) newDir = ddx > 0 ? 1 : 3;
        else newDir = ddy > 0 ? 2 : 0;
        if (newDir !== sg.direction) {
          sg.turning = true;
          sg.turnTimer = 1.2;
          sg.turnDir = newDir;
          sg.prevDir = sg.direction;
        }
      }
    }
  }

  _checkInteractions(input, dialog) {
    if (!input?.isPressed('Space') && !input?.isPressed('KeyE')) return;
    if (dialog?.active) { dialog.advance(); return; }

    const pCol = this._pCol;
    const pRow = this._pRow;

    // NPC interaction
    const npcs = this.world.queryTag('npc');
    for (const npc of npcs) {
      const nPos = npc.get('Position');
      const nCol = Math.round(nPos.x / TILE_SIZE);
      const nRow = Math.round(nPos.y / TILE_SIZE);
      if (Math.abs(pCol - nCol) <= 1 && Math.abs(pRow - nRow) <= 1) {
        const dd = npc.get('DialogData');
        if (dd && dd.lines.length > 0) {
          const id = [...npc.tags].find(t => t.startsWith('npc_')) || 'npc';
          const idx = this.npcDialogIdx[id] || 0;
          dialog.show([dd.lines[idx % dd.lines.length]]);
          this.npcDialogIdx[id] = idx + 1;
        }
        return;
      }
    }

    // Tile-based self-talk (check tile player is facing)
    const dx = this._facing === 'right' ? 1 : this._facing === 'left' ? -1 : 0;
    const dy = this._facing === 'down' ? 1 : this._facing === 'up' ? -1 : 0;
    const tm = this.world.queryTag('tilemap')[0]?.get('TileMap');
    if (!tm) return;
    const tile = tm.data[pRow + dy]?.[pCol + dx];
    if (tile === undefined) return;
    const lines = TILE_DIALOG[tile];
    if (lines) {
      dialog.show([{ speaker: 'Mikkel', text: lines[Math.floor(Math.random() * lines.length)] }]);
    }
  }

  _checkGoal(dialog) {
    if (this._moving) return;
    const pCol = this._pCol;
    const pRow = this._pRow;
    const level = LEVELS[this.levelIdx];

    if (pCol === level.goal.col && pRow === level.goal.row) {
      this.goalReached = true;
      this.world?.globals?.audio?.playPickup();
      const mem = level.memoryItem;
      dialog.show([
        { speaker: '', text: `✦ Memory collected: ${mem.name}` },
        { speaker: '', text: `"${mem.flavor}"` },
      ], () => this._onLevelComplete());
    }
  }

  _respawn() {
    this.detected = false;
    this._pCol = this._startCol;
    this._pRow = this._startRow;
    this._visualX = this._pCol * TILE_SIZE;
    this._visualY = this._pRow * TILE_SIZE;
    this._moving = false;
    const pos = this.player.get('Position');
    pos.x = this._visualX;
    pos.y = this._visualY;
    this.player.get('Sprite').bobAmount = 0;
    const guards = this.world.queryTag('guard');
    for (const g of guards) g.get('StealthGuard').alertState = 0;
  }

  _showSelfTalk(trigger) {
    if (this.selfTalkTriggered[trigger]) return;
    this.selfTalkTriggered[trigger] = true;
    const level = LEVELS[this.levelIdx];
    const talk = level.selfTalk.find(s => s.trigger === trigger);
    if (talk) {
      const dialog = this.world.globals.dialog;
      if (dialog) dialog.show([{ speaker: 'Mikkel', text: talk.text }]);
    }
  }

  _showObjective(text) {
    const el = document.getElementById('objective-display');
    el.textContent = text;
    el.classList.remove('hidden');
  }

  _onLevelComplete() {
    const memEl = document.getElementById('memories-collected');
    const current = parseInt(memEl.textContent) || 0;
    memEl.textContent = current + 1;
    this.world?.globals?.audio?.playTransition();
    setTimeout(() => {
      this.manager.switchTo('vignette', { levelIdx: this.levelIdx });
    }, 600);
  }

  exit() {
    // Destroy all entities created in this scene
    for (const e of this.entities) e.destroy();
    this.entities = [];
    this.player = null;
  }
}
