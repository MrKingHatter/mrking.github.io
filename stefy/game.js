// Flowers for Stefy - A cute pixel art adventure
// Sprites pre-rendered to offscreen canvas at startup
'use strict';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const W = 640, H = 480, TILE = 32, COLS = W / TILE, ROWS = H / TILE;

// --- Palette (indexed colors) ---
const PAL = [
  'transparent',  // 0
  '#ffddaa',      // 1 skin
  '#ffd54f',      // 2 blonde hair (Mikkel)
  '#4a90d9',      // 3 blue shirt
  '#2c3e50',      // 4 dark pants
  '#1a1a1a',      // 5 black/shoes
  '#8d6e63',      // 6 backpack/wood
  '#ffffff',      // 7 white
  '#1a1209',      // 8 near-black brown (Stefy hair)
  '#e91e63',      // 9 red/dress
  '#ffcc66',      // 10 gold/yellow
  '#4caf50',      // 11 green
  '#2e7d32',      // 12 dark green
  '#388e3c',      // 13 mid green
  '#29b6f6',      // 14 water blue
  '#0277bd',      // 15 dark water
  '#d7ccc8',      // 16 light stone
  '#a1887f',      // 17 stone
  '#78909c',      // 18 grey wall
  '#546e7a',      // 19 dark grey
  '#ce93d8',      // 20 lavender
  '#ffe0b2',      // 21 sand
  '#c62828',      // 22 roof red
  '#ffd54f',      // 23 blonde
  '#ff7043',      // 24 orange shirt
  '#7e57c2',      // 25 purple shirt
  '#33691e',      // 26 jungle pants
  '#9c27b0',      // 27 purple flower
  '#ff9800',      // 28 orange flower
  '#00bcd4',      // 29 cyan/rainbow
  '#fff59d',      // 30 flower center
  '#222222',      // 31 near-black (eyes)
  '#43a047',      // 32 grass variant
  '#ffeb3b',      // 33 bright yellow
  '#90a4ae',      // 34 light grey
  '#5d4037',      // 35 dark wood
  '#eee',         // 36 white hair (old)
  '#607d8b',      // 37 blue-grey shirt
  '#37474f',      // 38 dark blue-grey
  '#ff9ecb',      // 39 pink (flower)
];

// Sprite definitions: arrays of row strings, each char = palette index (hex-ish: 0-9, a-z)
// Using base-36 for indices > 9: a=10, b=11, c=12... up to index 38
const C = (ch) => {
  if (ch === '.') return 0;
  const n = parseInt(ch, 36);
  return isNaN(n) ? 0 : n;
};

// Player sprite (16 wide × 24 tall)
const SPR_PLAYER = [
  '....222222......',
  '...2222222.....',
  '...22222222....',
  '...1111111.....',
  '...1v11v11.....',
  '...1111111.....',
  '...11111.......',
  '....33333......',
  '...3333333.....',
  '...3333333.....',
  '...33.6.33.....',
  '...333633......',
  '....44444......',
  '...4444444.....',
  '...44..44......',
  '...55..55......',
];

// Girl sprite (16×24) - Stefy
const SPR_GIRL = [
  '...8888888.....',
  '..888888888....',
  '..888888888....',
  '..8111111188...',
  '...1v11v11.....',
  '...1111111.....',
  '..81111118.....',
  '....77777......',
  '...9999999.....',
  '...9999999.....',
  '...9999999.....',
  '...9999999.....',
  '...9999999.....',
  '...99..99......',
  '...11..11......',
  '...55..55......',
];

// NPC base (parameterized by hair, shirt, pants colors at render time)
const SPR_NPC = [
  '....HHHHHH.....',
  '...HHHHHHHH....',
  '...HHHHHHHH....',
  '...1111111.....',
  '...1v11v11.....',
  '...1111111.....',
  '...1111111.....',
  '....SSSSSS.....',
  '...SSSSSSSS....',
  '...SSSSSSSS....',
  '...SS....SS....',
  '...SSSSSSSS....',
  '....PPPPPP.....',
  '...PPPPPPPP....',
  '...PP....PP....',
  '...55....55....',
];

// Flower sprite (16×16)
const SPR_FLOWER = [
  '................',
  '....bb..bb......',
  '...bbbbbbbb.....',
  '...bbbbbbbb.....',
  '...bbbuubbb.....',
  '...bbbuubbb.....',
  '...bbbbbbbb.....',
  '....bb..bb......',
  '.......cc.......',
  '.......cc.......',
  '......cccc......',
  '.......cc.......',
  '.......cc.......',
  '.......cc.......',
  '......ccc.......',
  '................',
];

// --- Offscreen spritesheet ---
const SHEET_W = 256, SHEET_H = 256;
const sheet = document.createElement('canvas');
sheet.width = SHEET_W;
sheet.height = SHEET_H;
const sctx = sheet.getContext('2d');

// Sprite locations on sheet {x, y, w, h}
const SPOS = {
  player: { x: 0, y: 0, w: 16, h: 16 },
  girl: { x: 16, y: 0, w: 16, h: 16 },
  npc: [], // filled per NPC
  flowers: [], // filled per flower type
  tiles: [], // filled per tile type
};

// NPC configs: [hairPalIdx, shirtPalIdx, pantsPalIdx]
const NPC_STYLES = [
  [36, 37, 38],  // Japanese gardener
  [23, 24, 19],  // Dutch farmer
  [9, 25, 5],    // French painter
  [5, 11, 26],   // Brazilian guide
];

const FLOWER_COLORS = [
  [39, 30, 11],  // Cherry Blossom (pink petals, yellow center, green stem)
  [33, 30, 11],  // Golden Tulip
  [27, 30, 11],  // Silver Lavender
  [29, 30, 11],  // Rainbow Orchid
  [9, 30, 11],   // Desert Rose (red)
  [33, 7, 11],   // Arctic Poppy (yellow/white)
  [28, 30, 11],  // Italian Sunflower (orange)
];

function renderSprite(rows, ox, oy, replacements) {
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      let palIdx;
      if (ch === 'v') { palIdx = 31; } // eyes
      else if (ch === 'H' && replacements) { palIdx = replacements.hair; }
      else if (ch === 'S' && replacements) { palIdx = replacements.shirt; }
      else if (ch === 'P' && replacements) { palIdx = replacements.pants; }
      else if (ch === 'b' && replacements) { palIdx = replacements.petals; }
      else if (ch === 'u' && replacements) { palIdx = replacements.center; }
      else if (ch === 'c' && replacements) { palIdx = replacements.stem; }
      else { palIdx = C(ch); }
      if (palIdx === 0) continue;
      sctx.fillStyle = PAL[palIdx];
      sctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

// Tile pixel patterns (16×16, scaled to 32×32 when drawn)
function renderTiles() {
  const tileY = 48; // start tiles at row 48
  // 0: Grass
  sctx.fillStyle = PAL[11];
  sctx.fillRect(0, tileY, 16, 16);
  for (let i = 0; i < 8; i++) {
    sctx.fillStyle = PAL[12 + (i % 2)];
    sctx.fillRect((i * 5) % 14, tileY + (i * 3) % 14, 2, 3);
  }
  SPOS.tiles[0] = { x: 0, y: tileY, w: 16, h: 16 };

  // 1: Water
  sctx.fillStyle = PAL[14];
  sctx.fillRect(16, tileY, 16, 16);
  sctx.fillStyle = PAL[15];
  sctx.fillRect(18, tileY + 6, 10, 2);
  sctx.fillRect(20, tileY + 12, 8, 2);
  SPOS.tiles[1] = { x: 16, y: tileY, w: 16, h: 16 };

  // 2: Path
  sctx.fillStyle = PAL[16];
  sctx.fillRect(32, tileY, 16, 16);
  sctx.fillStyle = PAL[17];
  sctx.fillRect(34, tileY + 4, 3, 3);
  sctx.fillRect(40, tileY + 10, 4, 3);
  SPOS.tiles[2] = { x: 32, y: tileY, w: 16, h: 16 };

  // 3: Tree
  sctx.fillStyle = PAL[11];
  sctx.fillRect(48, tileY, 16, 16);
  sctx.fillStyle = PAL[6];
  sctx.fillRect(54, tileY + 9, 4, 7);
  sctx.fillStyle = PAL[12];
  sctx.fillRect(50, tileY + 1, 12, 10);
  sctx.fillStyle = PAL[13];
  sctx.fillRect(52, tileY + 3, 8, 6);
  SPOS.tiles[3] = { x: 48, y: tileY, w: 16, h: 16 };

  // 4: Wall
  sctx.fillStyle = PAL[18];
  sctx.fillRect(64, tileY, 16, 16);
  sctx.fillStyle = PAL[19];
  sctx.fillRect(64, tileY + 8, 16, 8);
  sctx.fillStyle = PAL[34];
  sctx.fillRect(66, tileY + 2, 5, 5);
  sctx.fillRect(73, tileY + 9, 5, 5);
  SPOS.tiles[4] = { x: 64, y: tileY, w: 16, h: 16 };

  // 5: Flower field
  sctx.fillStyle = PAL[11];
  sctx.fillRect(80, tileY, 16, 16);
  for (let i = 0; i < 6; i++) {
    sctx.fillStyle = PAL[20];
    sctx.fillRect(80 + (i * 7) % 13, tileY + (i * 5) % 13, 3, 3);
  }
  SPOS.tiles[5] = { x: 80, y: tileY, w: 16, h: 16 };

  // 6: Sand
  sctx.fillStyle = PAL[21];
  sctx.fillRect(96, tileY, 16, 16);
  SPOS.tiles[6] = { x: 96, y: tileY, w: 16, h: 16 };

  // 7: House
  sctx.fillStyle = PAL[16];
  sctx.fillRect(112, tileY, 16, 16);
  sctx.fillStyle = PAL[22];
  sctx.fillRect(112, tileY, 16, 5);
  sctx.fillStyle = PAL[35];
  sctx.fillRect(118, tileY + 8, 5, 8);
  SPOS.tiles[7] = { x: 112, y: tileY, w: 16, h: 16 };

  // 8: Bridge
  sctx.fillStyle = PAL[6];
  sctx.fillRect(128, tileY, 16, 16);
  sctx.fillStyle = PAL[35];
  sctx.fillRect(128, tileY, 16, 3);
  sctx.fillRect(128, tileY + 13, 16, 3);
  SPOS.tiles[8] = { x: 128, y: tileY, w: 16, h: 16 };

  // 9: Rock
  sctx.fillStyle = PAL[11];
  sctx.fillRect(144, tileY, 16, 16);
  sctx.fillStyle = PAL[18];
  sctx.fillRect(146, tileY + 4, 12, 10);
  sctx.fillStyle = PAL[34];
  sctx.fillRect(148, tileY + 3, 8, 7);
  SPOS.tiles[9] = { x: 144, y: tileY, w: 16, h: 16 };

  // 10: Bush
  sctx.fillStyle = PAL[11];
  sctx.fillRect(160, tileY, 16, 16);
  sctx.fillStyle = PAL[12];
  sctx.fillRect(162, tileY + 5, 12, 10);
  sctx.fillStyle = PAL[13];
  sctx.fillRect(164, tileY + 4, 8, 7);
  SPOS.tiles[10] = { x: 160, y: tileY, w: 16, h: 16 };

  // 11: Door
  sctx.fillStyle = PAL[35];
  sctx.fillRect(176, tileY, 16, 16);
  sctx.fillStyle = PAL[6];
  sctx.fillRect(180, tileY + 2, 8, 14);
  SPOS.tiles[11] = { x: 176, y: tileY, w: 16, h: 16 };
}

function generateSpritesheet() {
  sctx.clearRect(0, 0, SHEET_W, SHEET_H);

  // Player at (0,0)
  renderSprite(SPR_PLAYER, 0, 0, null);
  SPOS.player = { x: 0, y: 0, w: 16, h: 16 };

  // Girl at (16,0)
  renderSprite(SPR_GIRL, 16, 0, null);
  SPOS.girl = { x: 16, y: 0, w: 16, h: 16 };

  // NPCs at (32+i*16, 0)
  NPC_STYLES.forEach((style, i) => {
    renderSprite(SPR_NPC, 32 + i * 16, 0, { hair: style[0], shirt: style[1], pants: style[2] });
    SPOS.npc[i] = { x: 32 + i * 16, y: 0, w: 16, h: 16 };
  });

  // Flowers at (0 + i*16, 32)
  FLOWER_COLORS.forEach((colors, i) => {
    renderSprite(SPR_FLOWER, i * 16, 32, { petals: colors[0], center: colors[1], stem: colors[2] });
    SPOS.flowers[i] = { x: i * 16, y: 32, w: 16, h: 16 };
  });

  // Tiles
  renderTiles();
}

// --- Game State ---
const STATE = { TITLE: 0, PLAYING: 1, DIALOG: 2, TRANSITION: 3, ENDING: 4 };
let gameState = STATE.TITLE;
let currentLevel = 0, flowersCollected = 0;
let player = { x: 5, y: 7, dir: 0, frame: 0, moving: false };
let npcs = [], items = [];
let dialogQueue = [], dialogIndex = 0, currentDialog = null;
let typewriterText = '', typewriterIndex = 0;
let transitionAlpha = 0, transitionDir = 0, transitionCallback = null;
let frameCount = 0, keys = {}, interactCooldown = 0;
let levelComplete = false, itemCollected = {}, npcTalked = {};
let moveTimer = 0;
const MOVE_DELAY = 7;

// --- Input ---
document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); handleInteract(); }
});
document.addEventListener('keyup', e => { keys[e.code] = false; });

function handleInteract() {
  if (gameState === STATE.TITLE) startGame();
  else if (gameState === STATE.DIALOG) advanceDialog();
  else if (gameState === STATE.PLAYING) checkNPCInteraction();
  else if (gameState === STATE.ENDING) restartGame();
}

// --- Tile constants ---
const T = { GRASS: 0, WATER: 1, PATH: 2, TREE: 3, WALL: 4, FLOWERS: 5, SAND: 6, HOUSE: 7, BRIDGE: 8, ROCK: 9, BUSH: 10, DOOR: 11 };
const SOLID = [T.WATER, T.TREE, T.WALL, T.HOUSE, T.ROCK];

// --- Level data ---
const LEVELS = [null,
{ // 1: Japan
  name: 'Tokyo Garden, Japan',
  playerStart: { x: 2, y: 12 },
  npcStyle: 0,
  npcs: [{ id: 'jp', x: 6, y: 5, style: 0, hasQuest: true,
    dialog: [
      { speaker: 'Old Gardener', text: 'Ah, a young traveler! You look like you are on a journey of the heart.' },
      { speaker: 'Old Gardener', text: 'The cherry blossoms bloom at the far end of my garden. Follow the stone path east.' },
      { speaker: 'Mikkel', text: 'Thank you, sir! Stefy will love a cherry blossom.' }],
    dialogAfter: [{ speaker: 'Old Gardener', text: 'The sakura is to the east, past the pond.' }]
  }],
  items: [{ id: 'f1', x: 17, y: 3, flower: 0, name: 'Cherry Blossom' }],
  intro: [
    { speaker: '', text: '~ Chapter 1: The Cherry Blossom ~' },
    { speaker: 'Mikkel', text: "I've traveled all the way to Japan. The gardens here are breathtaking..." },
    { speaker: 'Mikkel', text: "Stefy always said cherry blossoms were her favorite. I'll find the prettiest one!" }]
},
{ // 2: Netherlands
  name: 'Dutch Countryside, Netherlands',
  playerStart: { x: 2, y: 8 },
  npcs: [{ id: 'nl', x: 10, y: 4, style: 1, hasQuest: true,
    dialog: [
      { speaker: 'Farmer Hans', text: 'Hallo! Welcome to my tulip farm!' },
      { speaker: 'Farmer Hans', text: 'A special golden tulip grows in my secret field to the north, past the windmill.' },
      { speaker: 'Farmer Hans', text: "Watch for the canals - don't fall in!" },
      { speaker: 'Mikkel', text: 'A golden tulip... Stefy will be amazed!' }],
    dialogAfter: [{ speaker: 'Farmer Hans', text: 'North past the windmill. Mind the canals!' }]
  }],
  items: [{ id: 'f2', x: 15, y: 2, flower: 1, name: 'Golden Tulip' }],
  intro: [
    { speaker: '', text: '~ Chapter 2: The Golden Tulip ~' },
    { speaker: 'Mikkel', text: 'The Netherlands! Windmills and tulips as far as the eye can see.' },
    { speaker: 'Mikkel', text: "There must be something truly special here for Stefy's bouquet." }]
},
{ // 3: France
  name: 'Provence, France',
  playerStart: { x: 1, y: 10 },
  npcs: [{ id: 'fr', x: 8, y: 6, style: 2, hasQuest: true,
    dialog: [
      { speaker: 'Painter Marie', text: 'Bonjour! I paint these lavender fields every morning.' },
      { speaker: 'Painter Marie', text: 'A rare silver lavender grows near the old stone wall to the east.' },
      { speaker: 'Painter Marie', text: 'It is said to glow under moonlight!' },
      { speaker: 'Mikkel', text: 'A silver lavender! Merci, Marie!' }],
    dialogAfter: [{ speaker: 'Painter Marie', text: 'East, near the stone wall. Bonne chance!' }]
  }],
  items: [{ id: 'f3', x: 18, y: 8, flower: 2, name: 'Silver Lavender' }],
  intro: [
    { speaker: '', text: '~ Chapter 3: The Silver Lavender ~' },
    { speaker: 'Mikkel', text: 'Provence... the air smells like lavender and honey.' },
    { speaker: 'Mikkel', text: "Two flowers down. I'm getting closer, Stefy." }]
},
{ // 4: Brazil
  name: 'Amazon Jungle, Brazil',
  playerStart: { x: 1, y: 7 },
  npcs: [{ id: 'br', x: 7, y: 9, style: 3, hasQuest: true,
    dialog: [
      { speaker: 'Guide Carlos', text: 'Olá amigo! The jungle is thick, but I know every trail.' },
      { speaker: 'Guide Carlos', text: 'A rainbow orchid grows on a rock near the waterfall - north then east!' },
      { speaker: 'Mikkel', text: 'A rainbow orchid from the Amazon! This will be incredible.' }],
    dialogAfter: [{ speaker: 'Guide Carlos', text: 'North along the river, then east to the waterfall!' }]
  }],
  items: [{ id: 'f4', x: 16, y: 3, flower: 3, name: 'Rainbow Orchid' }],
  intro: [
    { speaker: '', text: '~ Chapter 4: The Rainbow Orchid ~' },
    { speaker: 'Mikkel', text: "The Amazon... I've never seen so much green!" },
    { speaker: 'Mikkel', text: 'One more special flower and the bouquet is complete.' }]
},
{ // 5: Morocco
  name: 'Sahara Edge, Morocco',
  playerStart: { x: 2, y: 10 },
  npcs: [{ id: 'ma', x: 9, y: 7, style: 0, hasQuest: true,
    dialog: [
      { speaker: 'Merchant Youssef', text: 'As-salamu alaykum, traveler! The desert is vast but full of secrets.' },
      { speaker: 'Merchant Youssef', text: 'A rare Desert Rose grows where the sand meets the oasis, to the northeast.' },
      { speaker: 'Merchant Youssef', text: 'Be careful - the dunes shift, but the path of stones will guide you.' },
      { speaker: 'Mikkel', text: 'A Desert Rose... something that blooms even in hardship. Perfect.' }],
    dialogAfter: [{ speaker: 'Merchant Youssef', text: 'Northeast, where sand meets water. Follow the stones!' }]
  }],
  items: [{ id: 'f5', x: 17, y: 3, flower: 4, name: 'Desert Rose' }],
  intro: [
    { speaker: '', text: '~ Chapter 5: The Desert Rose ~' },
    { speaker: 'Mikkel', text: 'Morocco... the heat is intense but the landscape is stunning.' },
    { speaker: 'Mikkel', text: 'If a flower can bloom here, it must be incredibly strong. Like us.' }]
},
{ // 6: Iceland
  name: 'Volcanic Fields, Iceland',
  playerStart: { x: 2, y: 12 },
  npcs: [{ id: 'is', x: 6, y: 6, style: 1, hasQuest: true,
    dialog: [
      { speaker: 'Hiker Sigrid', text: 'Velkomin! Not many come this far north for flowers.' },
      { speaker: 'Hiker Sigrid', text: 'But the Arctic Poppy defies the cold - bright yellow against black rock.' },
      { speaker: 'Hiker Sigrid', text: 'It grows near the hot spring to the east. The warmth helps it survive.' },
      { speaker: 'Mikkel', text: 'A flower that thrives in the cold... resilient and beautiful.' }],
    dialogAfter: [{ speaker: 'Hiker Sigrid', text: 'East, near the hot spring. You will see the steam!' }]
  }],
  items: [{ id: 'f6', x: 16, y: 4, flower: 5, name: 'Arctic Poppy' }],
  intro: [
    { speaker: '', text: '~ Chapter 6: The Arctic Poppy ~' },
    { speaker: 'Mikkel', text: 'Iceland... fire and ice. The land itself feels alive.' },
    { speaker: 'Mikkel', text: 'Almost there. Just two more flowers for the bouquet.' }]
},
{ // 7: Italy
  name: 'Tuscany, Italy',
  playerStart: { x: 3, y: 12 },
  npcs: [],
  items: [{ id: 'f7', x: 10, y: 8, flower: 6, name: 'Italian Sunflower' }],
  girl: { x: 14, y: 5 },
  intro: [
    { speaker: '', text: '~ Chapter 7: Coming Home to You ~' },
    { speaker: 'Mikkel', text: "Italy... Stefy's home. The sunflower fields are glowing." },
    { speaker: 'Mikkel', text: 'One last flower from her homeland. Then... I find her.' }]
}];

// --- Map Generation ---
function generateMap(level) {
  const m = Array.from({ length: ROWS }, () => Array(COLS).fill(T.GRASS));
  const border = (t) => {
    for (let x = 0; x < COLS; x++) { m[0][x] = t; m[ROWS-1][x] = t; }
    for (let y = 0; y < ROWS; y++) { m[y][0] = t; m[y][COLS-1] = t; }
  };
  switch (level) {
    case 1: // Japan
      border(T.TREE);
      for (let x = 1; x < COLS-1; x++) m[12][x] = T.PATH;
      for (let y = 1; y < 13; y++) m[y][8] = T.PATH;
      for (let x = 8; x < 18; x++) m[3][x] = T.PATH;
      for (let y = 6; y < 9; y++) for (let x = 12; x < 16; x++) m[y][x] = T.WATER;
      [[2,3],[4,5],[7,3],[9,5],[5,15],[10,14]].forEach(([r,c]) => m[r][c] = T.TREE);
      m[6][2] = T.ROCK; m[10][10] = T.ROCK;
      break;
    case 2: // Netherlands
      border(T.WATER);
      for (let x = 1; x < COLS-1; x++) { m[5][x] = T.WATER; m[11][x] = T.WATER; }
      [[5,4],[5,12],[5,16],[11,3],[11,9],[11,15]].forEach(([r,c]) => m[r][c] = T.BRIDGE);
      for (let y = 6; y < 11; y++) { m[y][4] = T.PATH; m[y][12] = T.PATH; }
      for (let x = 4; x < 13; x++) m[8][x] = T.PATH;
      m[3][9] = T.WALL; m[3][10] = T.WALL; m[4][9] = T.WALL; m[4][10] = T.WALL;
      break;
    case 3: // France
      border(T.BUSH);
      for (let y = 3; y < 12; y++) for (let x = 3; x < 8; x++) m[y][x] = T.FLOWERS;
      for (let y = 5; y < 10; y++) for (let x = 12; x < 17; x++) m[y][x] = T.FLOWERS;
      for (let x = 1; x < COLS-1; x++) m[10][x] = T.PATH;
      for (let y = 3; y < 13; y++) m[y][10] = T.PATH;
      for (let y = 2; y < 11; y++) m[y][COLS-2] = T.WALL;
      m[8][COLS-2] = T.PATH;
      m[2][5] = T.TREE; m[2][15] = T.TREE; m[12][3] = T.TREE;
      break;
    case 4: // Brazil
      border(T.TREE);
      for (let i = 0; i < 25; i++) {
        const tx = 2 + (i*7)%16, ty = 2 + (i*3)%11;
        if (!(tx===7&&ty===9) && !(tx===16&&ty===3)) m[ty][tx] = T.TREE;
      }
      for (let y = 1; y < ROWS-1; y++) m[y][5] = T.WATER;
      m[6][5] = T.BRIDGE; m[10][5] = T.BRIDGE;
      for (let y = 1; y < ROWS-1; y++) m[y][4] = T.PATH;
      for (let x = 5; x < 17; x++) m[3][x] = T.PATH;
      m[2][16] = T.WATER; m[3][17] = T.WATER; m[4][16] = T.WATER;
      [[7,6],[7,7],[7,8],[9,6],[9,7]].forEach(([r,c]) => m[r][c] = T.GRASS);
      break;
    case 5: // Morocco
      border(T.ROCK);
      for (let x = 1; x < COLS-1; x++) for (let y = 1; y < ROWS-1; y++) m[y][x] = T.SAND;
      // Stone path
      for (let x = 2; x < 18; x++) m[10][x] = T.PATH;
      for (let y = 3; y < 11; y++) m[y][12] = T.PATH;
      // Oasis
      for (let y = 2; y < 5; y++) for (let x = 15; x < 18; x++) m[y][x] = T.WATER;
      m[5][16] = T.TREE; m[2][14] = T.TREE;
      // Rocks
      m[6][4] = T.ROCK; m[8][7] = T.ROCK; m[4][9] = T.ROCK;
      m[7][15] = T.ROCK; m[11][5] = T.ROCK;
      break;
    case 6: // Iceland
      border(T.ROCK);
      // Dark volcanic ground (using wall as basalt)
      for (let x = 1; x < COLS-1; x++) for (let y = 1; y < ROWS-1; y++) m[y][x] = T.GRASS;
      // Lava rocks scattered
      for (let i = 0; i < 20; i++) {
        const rx = 2 + (i*5)%16, ry = 2 + (i*4)%11;
        if (!(rx===16&&ry===4) && !(rx===6&&ry===6)) m[ry][rx] = T.ROCK;
      }
      // Hot spring (water)
      for (let y = 3; y < 6; y++) for (let x = 14; x < 18; x++) m[y][x] = T.WATER;
      m[5][15] = T.BRIDGE; // stepping stones
      // Path
      for (let x = 1; x < COLS-1; x++) m[12][x] = T.PATH;
      for (let y = 4; y < 13; y++) m[y][8] = T.PATH;
      break;
    case 7: // Italy
      border(T.BUSH);
      // Sunflower fields
      for (let y = 3; y < 7; y++) for (let x = 2; x < 7; x++) m[y][x] = T.FLOWERS;
      for (let y = 6; y < 10; y++) for (let x = 14; x < 18; x++) m[y][x] = T.FLOWERS;
      // Path
      for (let x = 1; x < COLS-1; x++) m[12][x] = T.PATH;
      for (let y = 1; y < 13; y++) m[y][10] = T.PATH;
      for (let x = 10; x < 16; x++) m[5][x] = T.PATH;
      // Stefy's house
      [[3,13],[3,14],[4,13],[4,14]].forEach(([r,c]) => m[r][c] = T.HOUSE);
      // Other houses
      [[3,16],[3,17],[4,16],[4,17]].forEach(([r,c]) => m[r][c] = T.HOUSE);
      m[7][3] = T.TREE; m[7][17] = T.TREE; m[9][6] = T.TREE;
      m[2][8] = T.BUSH; m[11][15] = T.BUSH;
      break;
  }
  return m;
}

// Cache maps
const MAPS = [null, generateMap(1), generateMap(2), generateMap(3), generateMap(4), generateMap(5), generateMap(6), generateMap(7)];

// --- Dialog System ---
const dialogBox = document.getElementById('dialog-box');
const dialogSpeaker = document.getElementById('dialog-speaker');
const dialogText = document.getElementById('dialog-text');
const dialogPrompt = document.getElementById('dialog-prompt');

function showDialog(arr) {
  dialogQueue = arr; dialogIndex = 0;
  gameState = STATE.DIALOG;
  showCurrentLine();
}

function showCurrentLine() {
  if (dialogIndex >= dialogQueue.length) { closeDialog(); return; }
  currentDialog = dialogQueue[dialogIndex];
  typewriterText = currentDialog.text;
  typewriterIndex = 0;
  dialogBox.classList.remove('hidden');
  dialogSpeaker.textContent = currentDialog.speaker;
  dialogText.textContent = '';
  dialogPrompt.style.display = 'none';
}

function advanceDialog() {
  if (typewriterIndex < typewriterText.length) {
    typewriterIndex = typewriterText.length;
    dialogText.textContent = typewriterText;
    dialogPrompt.style.display = 'block';
    return;
  }
  dialogIndex++;
  if (dialogIndex >= dialogQueue.length) closeDialog();
  else showCurrentLine();
}

function closeDialog() {
  dialogBox.classList.add('hidden');
  gameState = STATE.PLAYING;
  currentDialog = null;
  if (levelComplete && currentLevel < 7) transitionNext();
  else if (levelComplete && currentLevel === 7) { gameState = STATE.ENDING; }
}

function updateTypewriter() {
  if (gameState !== STATE.DIALOG || !currentDialog) return;
  if (typewriterIndex < typewriterText.length) {
    typewriterIndex += 1;
    dialogText.textContent = typewriterText.slice(0, typewriterIndex);
    if (typewriterIndex >= typewriterText.length) dialogPrompt.style.display = 'block';
  }
}

// --- Game Flow ---
function startGame() {
  document.getElementById('title-screen').classList.add('hidden');
  currentLevel = 1; flowersCollected = 0;
  itemCollected = {}; npcTalked = {};
  loadLevel(currentLevel);
}

function restartGame() {
  gameState = STATE.TITLE;
  document.getElementById('title-screen').classList.remove('hidden');
}

function loadLevel(n) {
  const lv = LEVELS[n]; if (!lv) return;
  player.x = lv.playerStart.x; player.y = lv.playerStart.y;
  npcs = lv.npcs || []; items = lv.items || [];
  levelComplete = false;
  document.getElementById('location-name').textContent = lv.name;
  document.getElementById('flowers-collected').textContent = flowersCollected;
  transitionDir = -1; transitionAlpha = 1;
  setTimeout(() => showDialog(lv.intro), 400);
}

function transitionNext() {
  transitionDir = 1; transitionAlpha = 0;
  transitionCallback = () => { currentLevel++; loadLevel(currentLevel); };
}

// --- Movement ---
function updateMovement() {
  if (gameState !== STATE.PLAYING) return;
  moveTimer++;
  if (moveTimer < MOVE_DELAY) return;
  let dx = 0, dy = 0;
  if (keys['ArrowUp'] || keys['KeyW']) dy = -1;
  else if (keys['ArrowDown'] || keys['KeyS']) dy = 1;
  else if (keys['ArrowLeft'] || keys['KeyA']) dx = -1;
  else if (keys['ArrowRight'] || keys['KeyD']) dx = 1;
  if (!dx && !dy) { player.moving = false; return; }
  const nx = player.x + dx, ny = player.y + dy;
  if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return;
  const tile = MAPS[currentLevel][ny][nx];
  if (SOLID.includes(tile)) return;
  for (const npc of npcs) if (npc.x === nx && npc.y === ny) return;
  const lv = LEVELS[currentLevel];
  if (lv.girl && lv.girl.x === nx && lv.girl.y === ny) { triggerGirl(); return; }
  player.x = nx; player.y = ny;
  player.moving = true; player.frame++;
  moveTimer = 0;
  checkPickup();
}

function checkPickup() {
  for (const it of items) {
    if (!itemCollected[it.id] && it.x === player.x && it.y === player.y) {
      itemCollected[it.id] = true;
      flowersCollected++;
      document.getElementById('flowers-collected').textContent = flowersCollected;
      levelComplete = true;
      const lines = [
        { speaker: 'Mikkel', text: `I found the ${it.name}! It's so beautiful...` },
        { speaker: 'Mikkel', text: `That's ${flowersCollected} flower${flowersCollected > 1 ? 's' : ''} for Stefy's bouquet!` },
      ];
      if (currentLevel < 7) lines.push({ speaker: 'Mikkel', text: 'Time for the next destination!' });
      else lines.push({ speaker: 'Mikkel', text: 'The bouquet is complete. Time to find Stefy!' });
      showDialog(lines);
    }
  }
}

function checkNPCInteraction() {
  if (interactCooldown > 0) return;
  for (const npc of npcs) {
    if (Math.abs(npc.x - player.x) + Math.abs(npc.y - player.y) <= 1) {
      const key = npc.id + '_talked';
      const dlg = npcTalked[key] ? npc.dialogAfter : npc.dialog;
      npcTalked[key] = true;
      showDialog(dlg);
      interactCooldown = 15;
      return;
    }
  }
}

function triggerGirl() {
  levelComplete = true;
  showDialog([
    { speaker: 'Stefy', text: "Mikkel! You're here! I missed you so much!" },
    { speaker: 'Mikkel', text: 'Stefy... I traveled the whole world for you.' },
    { speaker: 'Mikkel', text: 'A Cherry Blossom from Japan... a Golden Tulip from the Netherlands...' },
    { speaker: 'Mikkel', text: 'Silver Lavender from France... a Rainbow Orchid from Brazil...' },
    { speaker: 'Mikkel', text: 'A Desert Rose from Morocco... an Arctic Poppy from Iceland...' },
    { speaker: 'Mikkel', text: 'And a Sunflower from right here in Italy. Your home.' },
    { speaker: 'Stefy', text: '...' },
    { speaker: 'Stefy', text: 'Mikkel... you crossed the entire world for me?' },
    { speaker: 'Mikkel', text: 'Every petal reminded me of you. Every country brought me closer.' },
    { speaker: 'Stefy', text: 'I love them. And I love you. Welcome home, Mikkel.' },
    { speaker: '', text: '~ The End ~' },
    { speaker: '', text: 'Thank you for playing Flowers for Stefy!' },
  ]);
}

// --- Rendering ---
function blitSprite(src, dx, dy, scale) {
  ctx.drawImage(sheet, src.x, src.y, src.w, src.h, dx, dy, src.w * scale, src.h * scale);
}

function render() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, W, H);
  if (gameState === STATE.TITLE) return;
  const lv = LEVELS[currentLevel]; if (!lv) return;
  const map = MAPS[currentLevel];

  // Tiles
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const tileIdx = map[y][x];
      const src = SPOS.tiles[tileIdx];
      if (src) blitSprite(src, x * TILE, y * TILE, 2);
    }
  }

  // Items (flowers)
  for (const it of items) {
    if (itemCollected[it.id]) continue;
    const src = SPOS.flowers[it.flower];
    const bob = Math.sin(frameCount * 0.08 + it.x) * 3;
    if (src) blitSprite(src, it.x * TILE, it.y * TILE + bob, 2);
    // sparkle
    if (frameCount % 40 < 20) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(it.x * TILE + 4, it.y * TILE + bob - 2, 3, 3);
    }
  }

  // NPCs
  for (const npc of npcs) {
    const src = SPOS.npc[npc.style];
    const bob = Math.sin(frameCount * 0.04 + npc.x) * 1.5;
    if (src) blitSprite(src, npc.x * TILE, npc.y * TILE + bob, 2);
    if (npc.hasQuest && !npcTalked[npc.id + '_talked']) {
      ctx.fillStyle = '#ffcc66';
      ctx.font = '16px monospace';
      ctx.fillText('!', npc.x * TILE + 12, npc.y * TILE - 4 + bob);
    }
  }

  // Girl
  if (lv.girl) {
    const bob = Math.sin(frameCount * 0.05) * 1.5;
    blitSprite(SPOS.girl, lv.girl.x * TILE, lv.girl.y * TILE + bob, 2);
    // Heart
    ctx.fillStyle = '#e91e63';
    const hb = Math.sin(frameCount * 0.1) * 3;
    ctx.font = '14px monospace';
    ctx.fillText('\u2665', lv.girl.x * TILE + 10, lv.girl.y * TILE - 6 + hb);
  }

  // Player
  const pb = player.moving ? Math.sin(frameCount * 0.3) * 2 : 0;
  blitSprite(SPOS.player, player.x * TILE, player.y * TILE + pb, 2);

  // Shadow under player
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(player.x * TILE + 4, player.y * TILE + 28, 24, 4);

  // Transition
  if (transitionAlpha > 0) {
    ctx.fillStyle = `rgba(26,26,46,${transitionAlpha})`;
    ctx.fillRect(0, 0, W, H);
  }

  // Ending
  if (gameState === STATE.ENDING) {
    ctx.fillStyle = 'rgba(26,26,46,0.88)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffcc66';
    ctx.font = '22px monospace';
    ctx.fillText('\u2665 Flowers for Stefy \u2665', W/2, H/2 - 50);
    ctx.fillStyle = '#f0e6d3';
    ctx.font = '13px monospace';
    ctx.fillText('A bouquet from around the world,', W/2, H/2 - 10);
    ctx.fillText('made with love.', W/2, H/2 + 14);
    ctx.fillStyle = '#aed9e0';
    ctx.font = '11px monospace';
    ctx.fillText('Press Space to play again', W/2, H/2 + 70);
    ctx.textAlign = 'left';
  }
}

// --- Game Loop ---
function gameLoop() {
  frameCount++;
  updateMovement();
  if (frameCount % 3 === 0) updateTypewriter();
  if (interactCooldown > 0) interactCooldown--;
  if (transitionDir === 1) {
    transitionAlpha += 0.03;
    if (transitionAlpha >= 1) { transitionDir = 0; if (transitionCallback) { transitionCallback(); transitionCallback = null; } }
  } else if (transitionDir === -1) {
    transitionAlpha -= 0.03;
    if (transitionAlpha <= 0) { transitionAlpha = 0; transitionDir = 0; }
  }
  render();
  requestAnimationFrame(gameLoop);
}

// --- Init ---
generateSpritesheet();
gameLoop();