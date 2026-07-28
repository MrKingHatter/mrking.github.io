/**
 * level.js - Level Scene (parameterized by chapter data)
 * Handles player movement, NPC interaction, item pickup, and level transitions.
 */

import { Scene } from '../../engine/index.js';
import { LEVELS, MAPS, SOLID_TILES, ENDING_DIALOG, TOTAL_LEVELS } from '../data/levels.js';

export class LevelScene extends Scene {
  constructor() {
    super('level');
    this._level = 1;
    this._flowers = 0;
    this._player = { col: 0, row: 0, moving: false };
    this._moveTimer = 0;
    this._moveDelay = 0.12; // seconds between moves
    this._interactCooldown = 0;
    this._npcTalked = {};
    this._itemCollected = {};
    this._levelComplete = false;
    this._tilemapEntity = null;
    this._entities = []; // spawned entities for this level
  }

  enter(params) {
    this._level = params.level || 1;
    this._flowers = params.flowers || 0;
    if (params.reset) {
      this._npcTalked = {};
      this._itemCollected = {};
    }
    this._levelComplete = false;
    this._loadLevel();
  }

  _loadLevel() {
    const lv = LEVELS[this._level];
    if (!lv) return;

    // Clear previous entities
    this._clearEntities();

    // Set player position
    this._player.col = lv.playerStart.x;
    this._player.row = lv.playerStart.y;
    this._player.moving = false;

    // Create tilemap entity
    const map = MAPS[this._level];
    const world = this.world;
    const tileSize = 32;

    this._tilemapEntity = world.createEntity()
      .add('TileMap', {
        data: map,
        cols: map[0].length,
        rows: map.length,
        tileSize,
        sheetKey: 'main',
        tileRegions: this._getTileRegions(),
        solidTiles: SOLID_TILES,
      });
    this._entities.push(this._tilemapEntity);

    // Create player entity
    const playerEntity = world.createEntity()
      .tag('player')
      .add('Position', { x: this._player.col * tileSize, y: this._player.row * tileSize, z: 10 })
      .add('Sprite', { sheetKey: 'main', srcX: 0, srcY: 0, srcW: 16, srcH: 16, scale: 2, bobAmount: 0, bobSpeed: 6 })
      .add('GridCollider', { solid: true });
    this._entities.push(playerEntity);

    // Create NPC entities
    for (const npc of (lv.npcs || [])) {
      const npcEntity = world.createEntity()
        .tag('npc')
        .add('Position', { x: npc.col * tileSize, y: npc.row * tileSize, z: 10 })
        .add('Sprite', { sheetKey: 'main', srcX: 32 + npc.style * 16, srcY: 0, srcW: 16, srcH: 16, scale: 2, bobAmount: 1.5, bobSpeed: 3 })
        .add('GridCollider', { solid: true, interactable: true })
        .add('DialogData', { lines: npc.dialog, linesAfter: npc.dialogAfter, interacted: !!this._npcTalked[npc.id] });
      npcEntity._npcId = npc.id;
      npcEntity._hasQuest = npc.hasQuest;
      this._entities.push(npcEntity);
    }

    // Create flower entities
    for (const item of (lv.items || [])) {
      if (this._itemCollected[item.id]) continue;
      const flowerEntity = world.createEntity()
        .tag('flower')
        .add('Position', { x: item.col * tileSize, y: item.row * tileSize, z: 5 })
        .add('Sprite', { sheetKey: 'main', srcX: item.flower * 16, srcY: 32, srcW: 16, srcH: 16, scale: 2, bobAmount: 3, bobSpeed: 4 });
      flowerEntity._itemId = item.id;
      flowerEntity._itemName = item.name;
      flowerEntity._col = item.col;
      flowerEntity._row = item.row;
      this._entities.push(flowerEntity);
    }

    // Create girl entity if present
    if (lv.girl) {
      const girlEntity = world.createEntity()
        .tag('girl')
        .add('Position', { x: lv.girl.col * tileSize, y: lv.girl.row * tileSize, z: 10 })
        .add('Sprite', { sheetKey: 'main', srcX: 16, srcY: 0, srcW: 16, srcH: 16, scale: 2, bobAmount: 1.5, bobSpeed: 3.5 })
        .add('GridCollider', { solid: true });
      girlEntity._col = lv.girl.col;
      girlEntity._row = lv.girl.row;
      this._entities.push(girlEntity);
    }

    // Update UI
    document.getElementById('location-name').textContent = lv.name;
    document.getElementById('flowers-collected').textContent = this._flowers;

    // Show intro dialog
    const dialog = this.world.globals.dialog;
    setTimeout(() => dialog.show(lv.intro), 300);
  }

  _clearEntities() {
    for (const e of this._entities) e.destroy();
    this._entities = [];
  }

  _getTileRegions() {
    // Tile regions on the spritesheet (defined during asset generation)
    // These correspond to the positions set in main.js asset pipeline
    const tileY = 48;
    return Array.from({ length: 12 }, (_, i) => ({ x: i * 16, y: tileY, w: 16, h: 16 }));
  }

  update(dt) {
    const dialog = this.world.globals.dialog;
    const input = this.world.globals.input;

    // Don't process movement during dialog
    if (dialog.active) {
      if (input.actionPressed('interact')) dialog.advance();
      return;
    }

    // Interact cooldown
    if (this._interactCooldown > 0) this._interactCooldown -= dt;

    // Interact key
    if (input.actionPressed('interact') && this._interactCooldown <= 0) {
      this._tryInteract();
    }

    // Movement
    this._moveTimer += dt;
    if (this._moveTimer >= this._moveDelay) {
      this._tryMove(input);
    }

    // Update player entity position
    const playerEntities = this.world.queryTag('player');
    if (playerEntities.length > 0) {
      const pos = playerEntities[0].get('Position');
      const spr = playerEntities[0].get('Sprite');
      pos.x = this._player.col * 32;
      pos.y = this._player.row * 32;
      spr.bobAmount = this._player.moving ? 2 : 0;
    }
  }

  _tryMove(input) {
    let dx = 0, dy = 0;
    if (input.actionDown('up')) dy = -1;
    else if (input.actionDown('down')) dy = 1;
    else if (input.actionDown('left')) dx = -1;
    else if (input.actionDown('right')) dx = 1;

    if (!dx && !dy) { this._player.moving = false; return; }

    const ncol = this._player.col + dx;
    const nrow = this._player.row + dy;
    const map = MAPS[this._level];

    // Bounds check
    if (nrow < 0 || nrow >= map.length || ncol < 0 || ncol >= map[0].length) return;

    // Tile collision
    if (SOLID_TILES.includes(map[nrow][ncol])) return;

    // Entity collision (NPCs, girl)
    const physics = this.world.globals.physics;
    const blocker = physics?.getEntityAt(ncol, nrow, this.world.queryTag('player')[0]?.id);
    if (blocker) {
      // Check if it's the girl
      if (blocker.hasTag('girl') && !this._levelComplete) {
        this._triggerGirl();
        return;
      }
      return;
    }

    // Move
    this._player.col = ncol;
    this._player.row = nrow;
    this._player.moving = true;
    this._moveTimer = 0;
    this.world.globals.audio?.playStep();

    // Check flower pickup
    this._checkPickup();
  }

  _checkPickup() {
    const flowers = this.world.queryTag('flower');
    for (const f of flowers) {
      if (f._col === this._player.col && f._row === this._player.row) {
        this._itemCollected[f._itemId] = true;
        this._flowers++;
        document.getElementById('flowers-collected').textContent = this._flowers;
        f.destroy();
        this._levelComplete = true;
        this.world.globals.audio?.playPickup();

        const lines = [
          { speaker: 'Mikkel', text: `I found the ${f._itemName}! It's so beautiful...` },
          { speaker: 'Mikkel', text: `That's ${this._flowers} flower${this._flowers > 1 ? 's' : ''} for Stefy's bouquet!` },
        ];
        if (this._level < TOTAL_LEVELS) {
          lines.push({ speaker: 'Mikkel', text: 'Time for the next destination!' });
        } else {
          lines.push({ speaker: 'Mikkel', text: 'The bouquet is complete. Time to find Stefy!' });
        }

        this.world.globals.dialog.show(lines, () => {
          if (this._level < TOTAL_LEVELS) this._nextLevel();
        });
        return;
      }
    }
  }

  _tryInteract() {
    const npcs = this.world.queryTag('npc');
    for (const npc of npcs) {
      const pos = npc.get('Position');
      const ncol = Math.round(pos.x / 32);
      const nrow = Math.round(pos.y / 32);
      const dist = Math.abs(ncol - this._player.col) + Math.abs(nrow - this._player.row);
      if (dist <= 1) {
        const dd = npc.get('DialogData');
        const lines = dd.interacted ? dd.linesAfter : dd.lines;
        dd.interacted = true;
        this._npcTalked[npc._npcId] = true;
        this._interactCooldown = 0.3;
        this.world.globals.dialog.show(lines);
        return;
      }
    }
  }

  _triggerGirl() {
    this._levelComplete = true;
    this.world.globals.dialog.show(ENDING_DIALOG, () => {
      this.manager.transitionTo('ending');
    });
  }

  _nextLevel() {
    this.world.globals.audio?.playTransition();
    this.manager.transitionTo('level', { level: this._level + 1, flowers: this._flowers });
  }

  render(dt) {
    // Render quest markers above NPCs
    const renderer = this.world.globals.renderer;
    if (!renderer) return;
    const npcs = this.world.queryTag('npc');
    for (const npc of npcs) {
      if (!npc._hasQuest || this._npcTalked[npc._npcId]) continue;
      const pos = npc.get('Position');
      renderer.ctx.fillStyle = '#ffcc66';
      renderer.ctx.font = '16px monospace';
      renderer.ctx.fillText('!', pos.x + 12, pos.y - 6);
    }
  }

  exit() {
    this._clearEntities();
  }
}
