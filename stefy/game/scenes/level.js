/**
 * level.js - Level Scene (parameterized by chapter data)
 * Handles player movement, NPC interaction, item pickup, and level transitions.
 */

import { Scene } from '../../engine/index.js';
import { LEVELS, MAPS, SOLID_TILES, ENDING_DIALOG, TOTAL_LEVELS, TOTAL_FLOWERS, T } from '../data/levels.js';

// Environment interaction dialog per level — tile type → array of random lines
// Adjacent tiles (water, trees, walls, rocks, houses)
const ENV_DIALOG = {
  1: {
    [T.WATER]: [
      "The koi pond is so peaceful. But I don't think the clock fell in here.",
      'Beautiful water lilies... Stefy would love this garden.',
      'The water is crystal clear. I can see the fish swimming.',
    ],
    [T.TREE]: [
      'These cherry trees are magnificent. Some petals are falling...',
      'A beautiful old tree. The branches reach for the sky.',
      "I wonder if Stefy's hair smells like cherry blossoms... wait, what am I saying?",
    ],
    [T.WALL]: [
      'An ancient stone wall. The craftsmanship is incredible.',
      "The temple walls have been here for centuries.",
    ],
    [T.ROCK]: [
      'A carefully placed zen rock. Very meditative.',
    ],
    [T.HOUSE]: [
      'A traditional Japanese pagoda. The architecture is stunning.',
    ],
  },
  2: {
    [T.WATER]: [
      'The canal water flows gently. I wonder how deep it is.',
      "It's quite cold! I wouldn't want to fall in.",
      'Stefy would probably know some fun fact about Dutch canals. She always knows stuff like that.',
    ],
    [T.TREE]: [
      'A sturdy Dutch elm. Must be hundreds of years old.',
    ],
    [T.HOUSE]: [
      "A typical Dutch farmhouse. Smells like fresh cheese!",
    ],
  },
  3: {
    [T.WATER]: [
      'The brook babbles over smooth stones. So relaxing...',
      'Cool mountain water. Perfect for painting by!',
    ],
    [T.TREE]: [
      'An old olive tree. The trunk is gnarled and beautiful.',
      "This reminds me of Stefy's painting she showed in class. She's so talented.",
    ],
    [T.WALL]: [
      'An old stone wall. Warm from the Provençal sun.',
    ],
  },
  4: {
    [T.WATER]: [
      "The river is murky. I can't see the bottom at all...",
      'Is that a log or a caiman? Better keep my distance!',
    ],
    [T.TREE]: [
      'The jungle canopy is so thick, barely any light gets through.',
      'I hear monkeys high in the branches!',
      "If Stefy could see this... her eyes would light up. She has really nice eyes.",
    ],
  },
  5: {
    [T.WATER]: [
      'An oasis! The water looks so refreshing after all this sand.',
    ],
    [T.ROCK]: [
      'Scorching hot sandstone. I can feel the heat through my shoes.',
      'Wind-carved rock formations. Nature is an artist too.',
      "I hope Stefy likes desert roses. I hope she likes ME giving her flowers... is this weird?",
    ],
  },
  6: {
    [T.WATER]: [
      'A little coastal lake. The water is dark and still.',
      "I can see fish jumping. Lars probably catches his dinner here.",
    ],
    [T.ROCK]: [
      'White chalk cliffs. They crumble into the sea over time.',
      'The rocks are covered in bright green moss.',
      "Almost done... six flowers. One more and I'll finally have a reason to talk to Stefy.",
    ],
  },
  7: {
    [T.TREE]: [
      'A tall cypress tree, like a green flame pointing to the sky.',
      "My hands are shaking. What if she thinks flowers from a stranger are creepy? No... we're not strangers. We had that one conversation...",
    ],
    [T.WALL]: [
      "An old villa wall, covered in ivy. Very romantic.",
    ],
    [T.HOUSE]: [
      "A Piedmont farmhouse. I can smell fresh bread baking!",
    ],
  },
};

// Tiles the player is standing ON
const ENV_STAND_DIALOG = {
  1: {
    [T.FLOWERS]: ['A patch of wildflowers. Pretty, but not the cherry blossom I need.'],
    [T.BRIDGE]: ['This wooden bridge creaks under my feet.'],
    [T.PATH]: ["Stefy's smile keeps popping into my head. Focus, Mikkel!"],
  },
  2: {
    [T.FLOWERS]: ['Rows of tulips! So many colors. But none are golden.'],
    [T.BRIDGE]: ['A stone bridge over the canal. I can feel the spray.'],
    [T.PATH]: ["I bet Stefy has never seen this many tulips. She'd love it here."],
  },
  3: {
    [T.FLOWERS]: ['Endless lavender fields. The purple stretches to the horizon.'],
    [T.BRIDGE]: ['A little stone crossing. The brook splashes below.'],
    [T.PATH]: ["Stefy wore a lavender scarf once. I noticed. Nobody else noticed that I noticed."],
  },
  4: {
    [T.BRIDGE]: ['A vine bridge! It sways as I walk. Better not look down.'],
    [T.PATH]: ["What if Stefy already has a boyfriend? ...no. Don't think about that. Just find the flower."],
  },
  5: {
    [T.SAND]: ['Sand everywhere. It gets in my shoes...'],
    [T.PATH]: ["Five flowers down. Stefy's bouquet is going to be amazing. She has to like it... right?"],
  },
  6: {
    [T.BUSH]: ['Sea grass and heather. The wind bends it sideways.'],
    [T.PATH]: ["Almost home. One more flower and then... I actually have to TALK to her. Oh no."],
  },
  7: {
    [T.FLOWERS]: ['A field of sunflowers, all facing the sun!'],
    [T.PATH]: ["OK Mikkel, just be cool. Give her the flowers. Don't say anything weird. Easy. Totally easy."],
  },
};

// Level gate openings: [col, row, newTileType] — walls that open when quest completes
const LEVEL_GATES = {
  1: [ // Tokyo: open temple wall below the centered doors to let player into inner garden
    [9, 14, T.PATH], [10, 14, T.PATH],
  ],
  4: [ // Amazon: build vine bridge across the river
    [45, 19, T.BRIDGE], [45, 20, T.BRIDGE], [45, 21, T.BRIDGE],
  ],
};

// Dialog for locked gates (shown when interacting with door tiles before quest complete)
const GATE_LOCKED_DIALOG = {
  1: "The temple gate is locked. The gardener must have the key...",
  4: "The river is too wide to cross. I need to find a way to bridge it...",
};

// Dialog for when gates open after quest complete
const GATE_OPENED_DIALOG = {
  1: [
    { speaker: 'Mikkel', text: 'Wait... I heard something. The temple gate just opened!' },
    { speaker: 'Mikkel', text: "The inner garden! That's where the cherry blossom must be!" },
  ],
  4: [
    { speaker: 'Mikkel', text: 'Carlos fixed the bridge! I can hear the vines creaking into place.' },
    { speaker: 'Mikkel', text: 'Now I can cross the river to find the orchid!' },
  ],
};

export class LevelScene extends Scene {
  constructor() {
    super('level');
    this._level = 1;
    this._flowers = 0;
    this._player = { col: 0, row: 0, visualX: 0, visualY: 0, moving: false };
    this._moveSpeed = 192; // pixels per second (32px tile in ~0.167s)
    this._interactCooldown = 0;
    this._npcTalked = {};
    this._itemCollected = {};
    this._questItemsHeld = {}; // quest items in inventory for current level
    this._questComplete = {}; // NPC quests completed (flower revealed)
    this._riddleAnswered = {}; // riddle answered for this NPC
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
      this._questComplete = {};
      this._riddleAnswered = {};
    }
    this._questItemsHeld = {};
    this._levelComplete = false;
    this._loadLevel();
  }

  _loadLevel() {
    const lv = LEVELS[this._level];
    if (!lv) return;

    // Clear previous entities
    this._clearEntities();
    this._showHintIndicator(false);

    // Set player position
    this._player.col = lv.playerStart.x;
    this._player.row = lv.playerStart.y;
    this._player.visualX = lv.playerStart.x * 32;
    this._player.visualY = lv.playerStart.y * 32;
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

    // Create camera entity that follows the player
    const camEntity = world.createEntity()
      .tag('camera')
      .add('Position', { x: this._player.col * tileSize - 304, y: this._player.row * tileSize - 224, z: 0 })
      .add('Camera', {})
      .add('CameraFollow', { targetTag: 'player', smoothing: 8 });
    this._entities.push(camEntity);

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
      npcEntity._requiresItem = npc.requiresItem || null;
      npcEntity._questDialog = npc.questDialog || null;
      npcEntity._revealsFlower = npc.revealsFlower || false;
      this._entities.push(npcEntity);
    }

    // Create flower entities (hidden ones are NOT spawned until quest completes)
    for (const item of (lv.items || [])) {
      if (this._itemCollected[item.id]) continue;
      if (item.hidden && !this._questComplete[this._level]) continue;
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

    // Quest item entities are spawned later when the NPC riddle is answered
    // (see _spawnQuestItems called from _tryInteract)

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
    this._updateObjective();

    // Show intro dialog, then self-talk hint
    const dialog = this.world.globals.dialog;
    setTimeout(() => {
      dialog.show(lv.intro, () => {
        if (lv.hintAfterIntro && lv.hintAfterIntro.length > 0) {
          setTimeout(() => dialog.show(lv.hintAfterIntro), 300);
        }
      });
    }, 300);
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
      if (dialog.inChoice) {
        // Choice navigation
        if (input.actionPressed('up')) dialog.moveChoice(-1);
        else if (input.actionPressed('down')) dialog.moveChoice(1);
        else if (input.actionPressed('interact')) dialog.selectChoice();
      } else {
        if (input.actionPressed('interact')) dialog.advance();
      }
      return;
    }

    // Interact cooldown
    if (this._interactCooldown > 0) this._interactCooldown -= dt;

    // Hint key
    if (input.actionPressed('hint')) {
      this._showLocationHint();
    }

    // Interact key
    if (input.actionPressed('interact') && this._interactCooldown <= 0) {
      this._tryInteract();
    }

    // Movement input (only when not mid-animation)
    if (!this._player.moving) {
      this._tryMove(input);
    }

    // Smooth interpolation toward target tile
    const targetX = this._player.col * 32;
    const targetY = this._player.row * 32;
    const step = this._moveSpeed * dt;
    const dx = targetX - this._player.visualX;
    const dy = targetY - this._player.visualY;

    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      // Move toward target
      if (Math.abs(dx) <= step) this._player.visualX = targetX;
      else this._player.visualX += Math.sign(dx) * step;
      if (Math.abs(dy) <= step) this._player.visualY = targetY;
      else this._player.visualY += Math.sign(dy) * step;
    } else {
      // Snap and mark arrived
      this._player.visualX = targetX;
      this._player.visualY = targetY;
      if (this._player.moving) {
        this._player.moving = false;
        // Check pickups on arrival
        this._checkPickup();
        this._checkQuestPickup();
      }
    }

    // Update player entity position
    const playerEntities = this.world.queryTag('player');
    if (playerEntities.length > 0) {
      const pos = playerEntities[0].get('Position');
      const spr = playerEntities[0].get('Sprite');
      pos.x = this._player.visualX;
      pos.y = this._player.visualY;
      spr.bobAmount = this._player.moving ? 2 : 0;
    }
  }

  _tryMove(input) {
    let dx = 0, dy = 0;
    if (input.actionDown('up')) dy -= 1;
    if (input.actionDown('down')) dy += 1;
    if (input.actionDown('left')) dx -= 1;
    if (input.actionDown('right')) dx += 1;

    if (!dx && !dy) return;

    const map = MAPS[this._level];
    let finalCol = this._player.col + dx;
    let finalRow = this._player.row + dy;

    // Bounds check helper
    const inBounds = (c, r) => r >= 0 && r < map.length && c >= 0 && c < map[0].length;
    const passable = (c, r) => inBounds(c, r) && !SOLID_TILES.includes(map[r][c]);

    let canMove = passable(finalCol, finalRow);

    // For diagonal, prevent corner cutting
    if (dx !== 0 && dy !== 0 && canMove) {
      if (!passable(this._player.col + dx, this._player.row) ||
          !passable(this._player.col, this._player.row + dy)) {
        canMove = false;
      }
    }

    // Fall back to cardinal if diagonal blocked
    if (!canMove && dx !== 0 && dy !== 0) {
      if (passable(this._player.col + dx, this._player.row)) {
        finalCol = this._player.col + dx;
        finalRow = this._player.row;
        canMove = true;
      } else if (passable(this._player.col, this._player.row + dy)) {
        finalCol = this._player.col;
        finalRow = this._player.row + dy;
        canMove = true;
      }
    }

    if (!canMove) return;

    // Entity collision (NPCs, girl)
    const physics = this.world.globals.physics;
    const blocker = physics?.getEntityAt(finalCol, finalRow, this.world.queryTag('player')[0]?.id);
    if (blocker) {
      if (blocker.hasTag('girl') && !this._levelComplete) {
        if (this._flowers < TOTAL_FLOWERS) {
          // Haven't collected the final flower yet
          this.world.globals.dialog.show([
            { speaker: 'Mikkel', text: "Wait... I should get the sunflower first. The bouquet needs to be complete!" },
          ]);
        } else {
          this._triggerGirl();
        }
        return;
      }
      return;
    }

    // Commit move — visual interpolation happens in update()
    this._player.col = finalCol;
    this._player.row = finalRow;
    this._player.moving = true;
    this.world.globals.audio?.playStep();
  }

  _checkQuestPickup() {
    const qItems = this.world.queryTag('questitem');
    for (const q of qItems) {
      if (q._col === this._player.col && q._row === this._player.row) {
        this._questItemsHeld[q._questId] = true;
        q.destroy();
        this.world.globals.audio?.playPickup();
        this._showHintIndicator(false);
        this._updateObjective();

        const lines = [
          { speaker: 'Mikkel', text: `I found the ${q._questName}!` },
          { speaker: 'Mikkel', text: 'I should bring this back to show them.' },
        ];
        this.world.globals.dialog.show(lines);
        return;
      }
    }
  }

  _checkPickup() {
    const flowers = this.world.queryTag('flower');
    for (const f of flowers) {
      if (f._col === this._player.col && f._row === this._player.row) {
        this._itemCollected[f._itemId] = true;
        this._flowers++;
        document.getElementById('flowers-collected').textContent = this._flowers;
        f.destroy();
        // Only mark level complete on non-final levels (final level completes when giving bouquet to Stefy)
        if (this._level < TOTAL_LEVELS) this._levelComplete = true;
        this.world.globals.audio?.playPickup();
        this._updateObjective();

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
    const dialog = this.world.globals.dialog;
    const lv = LEVELS[this._level];

    for (const npc of npcs) {
      const pos = npc.get('Position');
      const ncol = Math.round(pos.x / 32);
      const nrow = Math.round(pos.y / 32);
      const dist = Math.abs(ncol - this._player.col) + Math.abs(nrow - this._player.row);
      if (dist > 1) continue;

      this._interactCooldown = 0.3;
      const dd = npc.get('DialogData');

      // --- Quest already complete → friendly post-quest dialog ---
      if (this._questComplete[this._level]) {
        const npcData = (lv.npcs || []).find(n => n.id === npc._npcId);
        const doneLines = npcData?.dialogDone || [{ speaker: dd.lines[0]?.speaker || '', text: 'Good luck on your journey, friend!' }];
        dialog.show(doneLines);
        return;
      }

      // --- Quest item turn-in (highest priority) ---
      if (npc._requiresItem && !this._questComplete[this._level]) {
        const hasItem = !!this._questItemsHeld[npc._requiresItem];
        if (hasItem) {
          this._questComplete[this._level] = true;
          this.world.globals.audio?.playPickup();
          this._updateObjective();
          dialog.show(npc._questDialog || [{ speaker: '', text: 'Quest complete!' }], () => {
            this._spawnHiddenFlower();
            // Show gate-opened self-talk if this level has gates
            const gateDialog = GATE_OPENED_DIALOG[this._level];
            if (gateDialog) {
              setTimeout(() => dialog.show(gateDialog), 300);
            }
          });
          return;
        }
      }

      // --- Riddle answered but quest item not yet found → reminder ---
      if (this._riddleAnswered[npc._npcId]) {
        dialog.show(dd.linesAfter || dd.lines);
        return;
      }

      // --- First interaction: dialog + riddle ---
      if (!dd.interacted && npc._hasQuest) {
          dd.interacted = true;
          this._npcTalked[npc._npcId] = true;
          this._updateObjective();
          const npcData = (lv.npcs || []).find(n => n.id === npc._npcId);
          const riddle = npcData?.riddle;

          if (riddle) {
            // Show intro dialog, then present riddle as choice
            dialog.show(dd.lines, () => {
              setTimeout(() => {
                dialog.showChoice(
                  riddle.speaker,
                  riddle.question,
                  riddle.options,
                  () => {
                    // Correct answer!
                    this._riddleAnswered[npc._npcId] = true;
                    this._spawnQuestItems();
                    this._updateObjective();
                    setTimeout(() => {
                      dialog.show(riddle.correctDialog, () => {
                        // Show "what to find" hint automatically
                        if (lv.hintAfterNpc && lv.hintAfterNpc.length > 0) {
                          setTimeout(() => dialog.show(lv.hintAfterNpc, () => {
                            this._showHintIndicator(true);
                          }), 300);
                        } else {
                          this._showHintIndicator(true);
                        }
                      });
                    }, 200);
                  },
                  riddle.wrongText
                );
              }, 200);
            });
          } else {
            // No riddle, just dialog
            dialog.show(dd.lines, () => {
              this._riddleAnswered[npc._npcId] = true;
              this._spawnQuestItems();
              this._updateObjective();
              if (lv.hintAfterNpc && lv.hintAfterNpc.length > 0) {
                setTimeout(() => dialog.show(lv.hintAfterNpc, () => {
                  this._showHintIndicator(true);
                }), 300);
              } else {
                this._showHintIndicator(true);
              }
            });
          }
          return;
        }

        // Subsequent interactions: show after-dialog
        const lines = dd.linesAfter || dd.lines;
        dialog.show(lines);
        return;
    }

    // No NPC nearby — try environment interaction
    this._tryEnvironmentInteract();
  }

  _showHintIndicator(visible) {
    const el = document.getElementById('hint-prompt');
    if (el) el.classList.toggle('hidden', !visible);
  }

  _showLocationHint() {
    const dialog = this.world.globals.dialog;
    if (dialog.active) return;
    const lv = LEVELS[this._level];
    if (!lv.locationHint || lv.locationHint.length === 0) return;
    // Only show if riddle answered but quest item not yet found
    const npc = (lv.npcs || [])[0];
    if (!npc) return;
    if (!this._riddleAnswered[npc.id]) return;
    if (this._questItemsHeld[npc.requiresItem]) return;
    if (this._questComplete[this._level]) return;
    this._showHintIndicator(false);
    dialog.show(lv.locationHint);
  }

  _tryEnvironmentInteract() {
    const dialog = this.world.globals.dialog;
    if (dialog.active) return;
    const map = MAPS[this._level];
    const pc = this._player.col, pr = this._player.row;

    // Check adjacent tiles
    const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
    for (const [dx, dy] of dirs) {
      const c = pc + dx, r = pr + dy;
      if (r < 0 || r >= map.length || c < 0 || c >= map[0].length) continue;
      const tile = map[r][c];

      // Locked gate check (door or water-gate with gates still closed)
      if (LEVEL_GATES[this._level] && !this._questComplete[this._level]) {
        if (tile === T.DOOR || (tile === T.WATER && LEVEL_GATES[this._level].some(g => g[0] === c && g[1] === r))) {
          const msg = GATE_LOCKED_DIALOG[this._level] || 'The way is blocked. I need to find another way in.';
          dialog.show([{ speaker: 'Mikkel', text: msg }]);
          return;
        }
      }

      const lines = ENV_DIALOG[this._level]?.[tile];
      if (lines) {
        dialog.show([{ speaker: 'Mikkel', text: lines[Math.floor(Math.random() * lines.length)] }]);
        return;
      }
    }

    // Also check the tile the player is standing on
    const standTile = map[pr][pc];
    const standLines = ENV_STAND_DIALOG[this._level]?.[standTile];
    if (standLines) {
      dialog.show([{ speaker: 'Mikkel', text: standLines[Math.floor(Math.random() * standLines.length)] }]);
    }
  }

  _spawnHiddenFlower() {
    const lv = LEVELS[this._level];
    const tileSize = 32;

    // Open any locked areas (modify map tiles)
    this._openLockedArea();

    for (const item of (lv.items || [])) {
      if (!item.hidden || this._itemCollected[item.id]) continue;
      const flowerEntity = this.world.createEntity()
        .tag('flower')
        .add('Position', { x: item.col * tileSize, y: item.row * tileSize, z: 5 })
        .add('Sprite', { sheetKey: 'main', srcX: item.flower * 16, srcY: 32, srcW: 16, srcH: 16, scale: 2, bobAmount: 3, bobSpeed: 4 });
      flowerEntity._itemId = item.id;
      flowerEntity._itemName = item.name;
      flowerEntity._col = item.col;
      flowerEntity._row = item.row;
      this._entities.push(flowerEntity);
    }
  }

  _openLockedArea() {
    const map = MAPS[this._level];
    // Level-specific gate openings: change wall tiles to path tiles
    const gates = LEVEL_GATES[this._level];
    if (!gates) return;
    for (const [col, row, newTile] of gates) {
      map[row][col] = newTile;
    }
  }

  _spawnQuestItems() {
    const lv = LEVELS[this._level];
    const tileSize = 32;
    for (const qi of (lv.questItems || [])) {
      if (this._questItemsHeld[qi.id] || this._questComplete[this._level]) continue;
      const qEntity = this.world.createEntity()
        .tag('questitem')
        .add('Position', { x: qi.col * tileSize, y: qi.row * tileSize, z: 5 })
        .add('Sprite', { sheetKey: 'main', srcX: (qi.sprite || 0) * 16, srcY: 64, srcW: 16, srcH: 16, scale: 2, bobAmount: 4, bobSpeed: 5 });
      qEntity._questId = qi.id;
      qEntity._questName = qi.name;
      qEntity._col = qi.col;
      qEntity._row = qi.row;
      this._entities.push(qEntity);
    }
  }

  _triggerGirl() {
    this._levelComplete = true;
    this._updateObjective();
    this.world.globals.dialog.show(ENDING_DIALOG, () => {
      this.manager.transitionTo('ending');
    });
  }

  _updateObjective() {
    const el = document.getElementById('objective-display');
    if (!el) return;
    const lv = LEVELS[this._level];

    if (this._levelComplete) {
      el.classList.add('hidden');
      return;
    }

    let text = '';
    if (this._level === 7) {
      // Final level: no quest NPC
      if (this._flowers < TOTAL_FLOWERS) {
        text = `Find the ${lv.items[0]?.name || 'flower'}`;
      } else {
        text = 'Give the bouquet to Stefy';
      }
    } else if (this._questComplete[this._level]) {
      // Quest done, flower revealed
      text = `Find the ${lv.items[0]?.name || 'flower'}`;
    } else if (this._questItemsHeld[lv.npcs[0]?.requiresItem]) {
      // Have the quest item, return to NPC
      const npcName = lv.npcs[0]?.dialog[0]?.speaker || 'the NPC';
      text = `Return to ${npcName}`;
    } else if (this._riddleAnswered[lv.npcs[0]?.id]) {
      // Riddle solved, find the quest item
      const qItem = lv.questItems?.[0];
      text = qItem ? `Find the ${qItem.name}` : 'Complete the task';
    } else if (this._npcTalked[lv.npcs[0]?.id]) {
      // Talked but riddle not yet answered
      const npcName = lv.npcs[0]?.dialog[0]?.speaker || 'the NPC';
      text = `Solve ${npcName}'s riddle`;
    } else {
      // Haven't talked to quest NPC yet
      const npcName = lv.npcs[0]?.dialog[0]?.speaker || 'someone';
      text = `Talk to ${npcName}`;
    }

    el.textContent = '📋 ' + text;
    el.classList.remove('hidden');
  }

  _nextLevel() {
    this.world.globals.audio?.playTransition();
    this.manager.transitionTo('level', { level: this._level + 1, flowers: this._flowers });
  }

  render(dt) {
    // Render quest markers above NPCs
    const renderer = this.world.globals.renderer;
    if (!renderer) return;

    // Get camera offset
    let camX = 0, camY = 0;
    const cameras = this.world.query('Camera', 'Position');
    if (cameras.length > 0) {
      const camPos = cameras[0].get('Position');
      camX = camPos.x;
      camY = camPos.y;
    }

    const npcs = this.world.queryTag('npc');
    for (const npc of npcs) {
      if (!npc._hasQuest || this._npcTalked[npc._npcId]) continue;
      const pos = npc.get('Position');
      renderer.ctx.fillStyle = '#ffcc66';
      renderer.ctx.font = '16px monospace';
      renderer.ctx.fillText('!', pos.x - camX + 12, pos.y - camY - 6);
    }
  }

  exit() {
    this._clearEntities();
  }
}
