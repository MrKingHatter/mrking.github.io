/**
 * levels.js - Level data: maps, NPCs, items, dialog
 */

// Tile types
export const T = {
  GRASS: 0, WATER: 1, PATH: 2, TREE: 3, WALL: 4,
  FLOWERS: 5, SAND: 6, HOUSE: 7, BRIDGE: 8, ROCK: 9, BUSH: 10, DOOR: 11
};

export const SOLID_TILES = [T.WATER, T.TREE, T.WALL, T.HOUSE, T.ROCK];

export const COLS = 20, ROWS = 15;

// Map generator
function genMap(level) {
  const m = Array.from({ length: ROWS }, () => Array(COLS).fill(T.GRASS));
  const border = (t) => {
    for (let x = 0; x < COLS; x++) { m[0][x] = t; m[ROWS-1][x] = t; }
    for (let y = 0; y < ROWS; y++) { m[y][0] = t; m[y][COLS-1] = t; }
  };
  switch (level) {
    case 1:
      border(T.TREE);
      for (let x = 1; x < COLS-1; x++) m[12][x] = T.PATH;
      for (let y = 1; y < 13; y++) m[y][8] = T.PATH;
      for (let x = 8; x < 18; x++) m[3][x] = T.PATH;
      for (let y = 6; y < 9; y++) for (let x = 12; x < 16; x++) m[y][x] = T.WATER;
      [[2,3],[4,5],[7,3],[9,5],[5,15],[10,14]].forEach(([r,c]) => m[r][c] = T.TREE);
      m[6][2] = T.ROCK; m[10][10] = T.ROCK;
      break;
    case 2:
      border(T.WATER);
      for (let x = 1; x < COLS-1; x++) { m[5][x] = T.WATER; m[11][x] = T.WATER; }
      [[5,4],[5,12],[5,16],[11,3],[11,9],[11,15]].forEach(([r,c]) => m[r][c] = T.BRIDGE);
      for (let y = 6; y < 11; y++) { m[y][4] = T.PATH; m[y][12] = T.PATH; }
      for (let x = 4; x < 13; x++) m[8][x] = T.PATH;
      m[3][9] = T.WALL; m[3][10] = T.WALL; m[4][9] = T.WALL; m[4][10] = T.WALL;
      break;
    case 3:
      border(T.BUSH);
      for (let y = 3; y < 12; y++) for (let x = 3; x < 8; x++) m[y][x] = T.FLOWERS;
      for (let y = 5; y < 10; y++) for (let x = 12; x < 17; x++) m[y][x] = T.FLOWERS;
      for (let x = 1; x < COLS-1; x++) m[10][x] = T.PATH;
      for (let y = 3; y < 13; y++) m[y][10] = T.PATH;
      for (let y = 2; y < 11; y++) m[y][COLS-2] = T.WALL;
      m[8][COLS-2] = T.PATH;
      m[2][5] = T.TREE; m[2][15] = T.TREE; m[12][3] = T.TREE;
      break;
    case 4:
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
    case 5:
      border(T.ROCK);
      for (let x = 1; x < COLS-1; x++) for (let y = 1; y < ROWS-1; y++) m[y][x] = T.SAND;
      for (let x = 2; x < 18; x++) m[10][x] = T.PATH;
      for (let y = 3; y < 11; y++) m[y][12] = T.PATH;
      for (let y = 2; y < 5; y++) for (let x = 15; x < 18; x++) m[y][x] = T.WATER;
      m[5][16] = T.TREE; m[2][14] = T.TREE;
      m[6][4] = T.ROCK; m[8][7] = T.ROCK; m[4][9] = T.ROCK;
      m[7][15] = T.ROCK; m[11][5] = T.ROCK;
      break;
    case 6:
      border(T.ROCK);
      for (let x = 1; x < COLS-1; x++) for (let y = 1; y < ROWS-1; y++) m[y][x] = T.GRASS;
      for (let i = 0; i < 20; i++) {
        const rx = 2 + (i*5)%16, ry = 2 + (i*4)%11;
        if (!(rx===16&&ry===4) && !(rx===6&&ry===6)) m[ry][rx] = T.ROCK;
      }
      for (let y = 3; y < 6; y++) for (let x = 14; x < 18; x++) m[y][x] = T.WATER;
      m[5][15] = T.BRIDGE;
      for (let x = 1; x < COLS-1; x++) m[12][x] = T.PATH;
      for (let y = 4; y < 13; y++) m[y][8] = T.PATH;
      break;
    case 7:
      border(T.BUSH);
      for (let y = 3; y < 7; y++) for (let x = 2; x < 7; x++) m[y][x] = T.FLOWERS;
      for (let y = 6; y < 10; y++) for (let x = 14; x < 18; x++) m[y][x] = T.FLOWERS;
      for (let x = 1; x < COLS-1; x++) m[12][x] = T.PATH;
      for (let y = 1; y < 13; y++) m[y][10] = T.PATH;
      for (let x = 10; x < 16; x++) m[5][x] = T.PATH;
      [[3,13],[3,14],[4,13],[4,14]].forEach(([r,c]) => m[r][c] = T.HOUSE);
      [[3,16],[3,17],[4,16],[4,17]].forEach(([r,c]) => m[r][c] = T.HOUSE);
      m[7][3] = T.TREE; m[7][17] = T.TREE; m[9][6] = T.TREE;
      m[2][8] = T.BUSH; m[11][15] = T.BUSH;
      break;
  }
  return m;
}

// Pre-generate all maps
export const MAPS = [null, genMap(1), genMap(2), genMap(3), genMap(4), genMap(5), genMap(6), genMap(7)];

// --- Level definitions ---
export const LEVELS = [null,
{ // 1
  name: 'Tokyo Garden, Japan', playerStart: { x: 2, y: 12 },
  npcs: [{ id: 'jp', col: 6, row: 5, style: 0, hasQuest: true,
    dialog: [
      { speaker: 'Old Gardener', text: 'Ah, a young traveler! You look like you are on a journey of the heart.' },
      { speaker: 'Old Gardener', text: 'The cherry blossoms bloom at the far end of my garden. Follow the stone path east.' },
      { speaker: 'Mikkel', text: 'Thank you, sir! Stefy will love a cherry blossom.' }],
    dialogAfter: [{ speaker: 'Old Gardener', text: 'The sakura is to the east, past the pond.' }]
  }],
  items: [{ id: 'f1', col: 17, row: 3, flower: 0, name: 'Cherry Blossom' }],
  intro: [
    { speaker: '', text: '~ Chapter 1: The Cherry Blossom ~' },
    { speaker: 'Mikkel', text: "I've traveled all the way to Japan. The gardens here are breathtaking..." },
    { speaker: 'Mikkel', text: "Stefy always said cherry blossoms were her favorite. I'll find the prettiest one!" }]
},
{ // 2
  name: 'Dutch Countryside, Netherlands', playerStart: { x: 2, y: 8 },
  npcs: [{ id: 'nl', col: 10, row: 4, style: 1, hasQuest: true,
    dialog: [
      { speaker: 'Farmer Hans', text: 'Hallo! Welcome to my tulip farm!' },
      { speaker: 'Farmer Hans', text: 'A special golden tulip grows in my secret field to the north, past the windmill.' },
      { speaker: 'Farmer Hans', text: "Watch for the canals - don't fall in!" },
      { speaker: 'Mikkel', text: 'A golden tulip... Stefy will be amazed!' }],
    dialogAfter: [{ speaker: 'Farmer Hans', text: 'North past the windmill. Mind the canals!' }]
  }],
  items: [{ id: 'f2', col: 15, row: 2, flower: 1, name: 'Golden Tulip' }],
  intro: [
    { speaker: '', text: '~ Chapter 2: The Golden Tulip ~' },
    { speaker: 'Mikkel', text: 'The Netherlands! Windmills and tulips as far as the eye can see.' },
    { speaker: 'Mikkel', text: "There must be something truly special here for Stefy's bouquet." }]
},
{ // 3
  name: 'Provence, France', playerStart: { x: 1, y: 10 },
  npcs: [{ id: 'fr', col: 8, row: 6, style: 2, hasQuest: true,
    dialog: [
      { speaker: 'Painter Marie', text: 'Bonjour! I paint these lavender fields every morning.' },
      { speaker: 'Painter Marie', text: 'A rare silver lavender grows near the old stone wall to the east.' },
      { speaker: 'Painter Marie', text: 'It is said to glow under moonlight!' },
      { speaker: 'Mikkel', text: 'A silver lavender! Merci, Marie!' }],
    dialogAfter: [{ speaker: 'Painter Marie', text: 'East, near the stone wall. Bonne chance!' }]
  }],
  items: [{ id: 'f3', col: 18, row: 8, flower: 2, name: 'Silver Lavender' }],
  intro: [
    { speaker: '', text: '~ Chapter 3: The Silver Lavender ~' },
    { speaker: 'Mikkel', text: 'Provence... the air smells like lavender and honey.' },
    { speaker: 'Mikkel', text: "Two flowers down. I'm getting closer, Stefy." }]
},
{ // 4
  name: 'Amazon Jungle, Brazil', playerStart: { x: 1, y: 7 },
  npcs: [{ id: 'br', col: 7, row: 9, style: 3, hasQuest: true,
    dialog: [
      { speaker: 'Guide Carlos', text: 'Olá amigo! The jungle is thick, but I know every trail.' },
      { speaker: 'Guide Carlos', text: 'A rainbow orchid grows on a rock near the waterfall - north then east!' },
      { speaker: 'Mikkel', text: 'A rainbow orchid from the Amazon! This will be incredible.' }],
    dialogAfter: [{ speaker: 'Guide Carlos', text: 'North along the river, then east to the waterfall!' }]
  }],
  items: [{ id: 'f4', col: 16, row: 3, flower: 3, name: 'Rainbow Orchid' }],
  intro: [
    { speaker: '', text: '~ Chapter 4: The Rainbow Orchid ~' },
    { speaker: 'Mikkel', text: "The Amazon... I've never seen so much green!" },
    { speaker: 'Mikkel', text: 'One more special flower and the bouquet is complete.' }]
},
{ // 5
  name: 'Sahara Edge, Morocco', playerStart: { x: 2, y: 10 },
  npcs: [{ id: 'ma', col: 9, row: 7, style: 0, hasQuest: true,
    dialog: [
      { speaker: 'Merchant Youssef', text: 'As-salamu alaykum, traveler! The desert is vast but full of secrets.' },
      { speaker: 'Merchant Youssef', text: 'A rare Desert Rose grows where the sand meets the oasis, to the northeast.' },
      { speaker: 'Merchant Youssef', text: 'Be careful - the dunes shift, but the path of stones will guide you.' },
      { speaker: 'Mikkel', text: 'A Desert Rose... something that blooms even in hardship. Perfect.' }],
    dialogAfter: [{ speaker: 'Merchant Youssef', text: 'Northeast, where sand meets water. Follow the stones!' }]
  }],
  items: [{ id: 'f5', col: 17, row: 3, flower: 4, name: 'Desert Rose' }],
  intro: [
    { speaker: '', text: '~ Chapter 5: The Desert Rose ~' },
    { speaker: 'Mikkel', text: 'Morocco... the heat is intense but the landscape is stunning.' },
    { speaker: 'Mikkel', text: 'If a flower can bloom here, it must be incredibly strong. Like us.' }]
},
{ // 6
  name: 'Volcanic Fields, Iceland', playerStart: { x: 2, y: 12 },
  npcs: [{ id: 'is', col: 6, row: 6, style: 1, hasQuest: true,
    dialog: [
      { speaker: 'Hiker Sigrid', text: 'Velkomin! Not many come this far north for flowers.' },
      { speaker: 'Hiker Sigrid', text: 'But the Arctic Poppy defies the cold - bright yellow against black rock.' },
      { speaker: 'Hiker Sigrid', text: 'It grows near the hot spring to the east. The warmth helps it survive.' },
      { speaker: 'Mikkel', text: 'A flower that thrives in the cold... resilient and beautiful.' }],
    dialogAfter: [{ speaker: 'Hiker Sigrid', text: 'East, near the hot spring. You will see the steam!' }]
  }],
  items: [{ id: 'f6', col: 16, row: 4, flower: 5, name: 'Arctic Poppy' }],
  intro: [
    { speaker: '', text: '~ Chapter 6: The Arctic Poppy ~' },
    { speaker: 'Mikkel', text: 'Iceland... fire and ice. The land itself feels alive.' },
    { speaker: 'Mikkel', text: 'Almost there. Just two more flowers for the bouquet.' }]
},
{ // 7
  name: 'Tuscany, Italy', playerStart: { x: 3, y: 12 },
  npcs: [],
  items: [{ id: 'f7', col: 10, row: 8, flower: 6, name: 'Italian Sunflower' }],
  girl: { col: 14, row: 5 },
  intro: [
    { speaker: '', text: '~ Chapter 7: Coming Home to You ~' },
    { speaker: 'Mikkel', text: "Italy... Stefy's home. The sunflower fields are glowing." },
    { speaker: 'Mikkel', text: 'One last flower from her homeland. Then... I find her.' }]
}];

// Ending dialog
export const ENDING_DIALOG = [
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
];

export const TOTAL_FLOWERS = 7;
export const TOTAL_LEVELS = 7;
