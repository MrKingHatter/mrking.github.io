/**
 * levels.js - Level data: hand-crafted maps, quests, NPCs, items, dialog
 * Maps are 50x30 tiles (1600x960px) with camera follow
 * Each char in map string = one tile type
 */

// Tile types
export const T = {
  GRASS: 0, WATER: 1, PATH: 2, TREE: 3, WALL: 4,
  FLOWERS: 5, SAND: 6, HOUSE: 7, BRIDGE: 8, ROCK: 9, BUSH: 10, DOOR: 11
};

export const SOLID_TILES = [T.WATER, T.TREE, T.WALL, T.HOUSE, T.ROCK, T.DOOR];

export const COLS = 50, ROWS = 30;

// Compact map parser: char -> tile index
const C = { g: 0, w: 1, p: 2, t: 3, W: 4, f: 5, s: 6, h: 7, b: 8, r: 9, B: 10, d: 11 };
function parseMap(rows) {
  return rows.map(row => [...row].map(ch => C[ch] ?? 0));
}

// ===== MAP 1: Tokyo Zen Garden =====
// Dense zen garden with stone paths, koi ponds, cherry trees, pagoda walls
const MAP1 = parseMap([
  'tttttttttttttttttttttttttttttttttttttttttttttttttt',
  'tggBgpppgBgggBgtttggBgggttggBgppppppgBgttggBgggBtt',
  'tgBggpgtggBggggtBggggBgttggggpgtggBgggggttgBggBgtt',
  'tggggpgtgggBggggggBggggggBggBpgtgggBgwwwgggggBggtt',
  'tBgggpgggggggtgBgggggBggggggpgggBggBgwwwwgBgggggtt',
  'tggggpppppppppppppppppppgggBpppppgggggwwwggggBgggt',
  'tgtgggggrggggggggggggggpgggggggggBgggggbgggBgggggt',
  'tggBgggrgrgggBgggBgggggpgggBggggggggggpgggggggBgtt',
  'tggggggrggggggggggggBggpppppppppppppppppppppgBgggt',
  'tgtgBggggBggggBggggggggggggBggggBggtggggggBpggggtt',
  'tggggggBgggBggggBggtgggggggggBgggggtBggBgggpggBgtt',
  'tgBggggggggggBgggggtgggBgggggggBggggtggggggpggggtt',
  'tggggBgggBgggggggggtBgggggBggggggBggtggBgggpgBggtt',
  'tppppppppppppppppppttgggBgggBggggggBtggggggpggggtt',
  'tWWWWWWWWddWWWWWWWWttgBgggggggBggggggtBgggBpggBgtt',
  'tWgffffggggffffgggWttggggBgggggggBgggggggggpggggtt',
  'tWfffffBgggfffffggWtggBgggBgggBgggggBgggBggpggBgtt',
  'tWfffffgggBfffffggWtgggggggBgggggBgggggggpppggggtt',
  'tWgffffggggffffgBgWtgBgggggggBgggggBgggBgpgggBggtt',
  'tWggggggggggggggggWtggggBgggggggBgggggggBpggggBgtt',
  'tWgBgggwwwgggBggggWtgggggggBgggggggBgggggpgBggggtt',
  'tWggggwwwwwggggBggWtgBggBgggggBgggggggBggpggggBgtt',
  'tWgBggwwwwwgggggggWtggggggBgggggBgggggBggpggggggtt',
  'tWgggggwwwggBgggggWtgggBggggBggggggBgggggpgBggBgtt',
  'tWggBgggggggggBgggWtggggggBgggggBggggBgBgpggggBgtt',
  'tWgggBgggBggggggBgWtgBggBggggBggggBgggggBpgBggggtt',
  'tWWWWWWWWWWWWWWWWWWtggggggBggggBggggBggggpggggBgtt',
  'tggBgggBggggBggggBtgggBgggBgggggBggggBgggpgBggggtt',
  'tgggBggggBgggBggggggBggggggBgggBgggBggggBppppppptt',
  'tttttttttttttttttttttttttttttttttttttttttttttttttt',
]);

// ===== MAP 2: Dutch Countryside =====
// Flat polder with canals, tulip fields, windmill areas, many bridges
const MAP2 = parseMap([
  'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
  'wgggffgggBggffggfffgggBgffgggBgggffgggBggfffgggBgw',
  'wgggffgggggfffgffffggggfffggggggffgggggggffffggggw',
  'wghhtgggggggtgggggggghhtgggggggBggggghhtgggggggBgw',
  'wghhppppppppppppppppphhpppppppppppppphhpppppppppgw',
  'wwwwbwwwwwbwwwwwwwwwwwwbwwwwwwbwwwwwwwwbwwwwwbwwww',
  'wgggpggggBpgggBgggggggpggggBgpgggBgggBpgggBgpgBgww',
  'wBggpgggggpggggBggggggpgBgggBpggggBggggpgBggBpggBw',
  'wgBgppppppppppppppppppppppppppppppppppppppppppppgw',
  'wggggggBgggBgggggBggggggBgggggggBgggggggBggggggBgw',
  'wggBggggggggggBgggggBgggggBggggggggBgggggggBggggBw',
  'wwwwwbwwwwwbwwwwwwwwwwbwwwwwbwwwwwwwwwbwwwwwbwwwww',
  'wgBggpgggggpgggBgggBgpgggBgpggggBgggBpgggBgpgggBww',
  'wggggppppppppppppppppppppppppppppppppppppppppppggw',
  'wgggggBgggBgggggBggggggBgggggggBgggggBgggggBgggggw',
  'wgBgggggBgggBggggggBgggggBggggggggBggggBgggggBgggw',
  'wggffgggggggBfffggggggfffgBgggfffgggBgggfffgggggBw',
  'wgfffBgggggffffggBgggffffgggBgffffgggggBffffggBggw',
  'wggffggggggBfffgggggggfffggggBfffggggggBfffgggggBw',
  'wwwwwwbwwwwwwbwwwwwwwwwwbwwwwwwbwwwwwwwwwbwwwwwbww',
  'wgBggBpggggBgpggggBgBggBpgggBgBpggggBgBggpgggBpgww',
  'wgggggpgBgggBpgBggggggggpgBgggBpgBggggggBpgBggpgww',
  'wggBggpppppppppppppppppppppppppppppppppppppppppppw',
  'wgggBgggBgggBgggBgggggBgggBgggBggBgggBgggBgggBggww',
  'wgBggggggBggggBggggBgggggBgggggggggBggggBgggggBgBw',
  'wggBgggBgggBgggggBgggBggggBgggBgggggBgggggBgggggww',
  'wgggBgggggBgggBgggggggBggggBgggBgggBgggBggggBgggBw',
  'wggggBgggBgggggBgggBgggggBgggggBgggggBggggBgggBggw',
  'wgBggggBgggBgggggBgggBggggBgggBgggBgggggBgggggBgww',
  'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
]);

// ===== MAP 3: Provence, France =====
// Lavender fields, winding paths, stone walls, brook to the east
const MAP3 = parseMap([
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBt',
  'BgffffggpppggffffgBgBggffffggpppgBgffffgBgBgggBgBB',
  'BfffffggpgtggfffffBgggfffffggpgtggfffffgggBggBggBB',
  'BfffffBgpggggfffffBBggfffffBgpggBgfffffgBggggBggBB',
  'BgffffggpgBggffffgBgBggffffggpgggBgffffggBggBgggBB',
  'BggggggppppppggggBggBggggggppppppppggggBgggBgggBBB',
  'BgBgggpgggBggpgggBgBgggBgggpggggBggpgggBggBgggBBBt',
  'BgggggpgggggBpgBggBgggggggBpgggggggpgBggBgBgggBBBt',
  'BggBggpgggggBppppppppppppppppgggggBpppppppppppBBBB',
  'BgggBgpggggBggggBgBgggBgggBgggggBgggggBgggBgpggBBt',
  'Bpppppppppppppppppppgggggggggggggggggggggggggpgggg',
  'BgBggggggggrggggggBgggBgggBgggggBgggBgwwwgggpggggt',
  'BgggBggBggggggBgggBgBgggggggBggggggBggwwwwggpggBgt',
  'BggggggggBggggggBggBggggBggggggBggggggwwwwwgpggggt',
  'BBBBBBBBBBBBBBBBBBBBBBggggBgggBggggggBgwwwggpgBggt',
  'tgggBgggggggBgggggBgggBgggggBggggBgggggBbgggpggggt',
  'tggBgggBgggggBggBgggBgggggBgggBgggBggggBpppppggBgt',
  'tgggggBgggBggggggBgggggBggggBgggBggggBgBpggggggggt',
  'tggBggggBggggBgggggBgggggBgggggBgggBgggBpgBgggBggt',
  'tgggBgggggBgggBggBgggBgggggBggggBgggggBgpggggBgggt',
  'tggggBgggBgggggBgggBgggBggggBgggggBgggBgpgBgggggBt',
  'tgBgggBgggBgggggBgggBgggggBgggBgggBggBggpggggBgggt',
  'tggggBgggBgggBgggggBgggBggggBgggggBgggBgpgBgggggBt',
  'tgBggggBgggBgggBgggggBgggBgggBgggBgggBggpgggBggggt',
  'tggBggggggBgggBgggBgggBgggggBgggBgggBggBpggggBgBgt',
  'tgggBgggBgggBgggggBgggBggggBgggggBgggBgpgBgggggBgt',
  'tggggBgggBgggBggBgggBgggBgggBgggBgggBggpggggBggggt',
  'tgBgggBgggBgggggBgggBgggggBgggBgggBggBgpgBgggggBgt',
  'tggBggggBgggBgggggBgggBggggBgggggBgggpppggggBggggt',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBt',
]);

// ===== MAP 4: Amazon Jungle, Brazil =====
// Dense jungle canopy, winding river, clearings, vine bridges
const MAP4 = parseMap([
  'tttttttttttttttttttttttttttttttttttttttttttttttttt',
  'tggggtttgttgtwwgtggtggttgBgttggtttgBggttgBgtttggtt',
  'tgBggtBggtggtwwgttgttggggtggBgtBggggggtggggtBgggtt',
  'tggppppppppptwwggggtgBgggBgggggtgggBgggtBggtgggBgt',
  'ttgpgtttgggtwwBgttgtggBgggtgBgggttgggBggggtggggggt',
  'tBgpgttBgggbwwgggggtgggBgggggtgBgggggBggtggBgtggBt',
  'tggpgggggtttwwgtggBtggggggBgggggtggBgggtgggggBgggt',
  'tgBpgggBgtggwwBggggttgBgggggBggggggggBgtgBgggtgggt',
  'tggpppppppppbwwggggtggggBgggggBgtgBggggggggBgggggt',
  'tgggggtggBgptwwgBtgttgggggBgggggtgggBgggtBggtgBggt',
  'ttgBgggtgggptttggggtgBgggggtgBgggggggggBtggggggggt',
  'tgggBgtgBggpgBgggtgttggBgggggggBgtgBgggtgBgtgBggBt',
  'tggtgggggggppppppppppppppppppppppppppppppppppggggt',
  'tBggggtggBgggggtggBtgggBgggBgttgBgggggBgtgBgpggBgt',
  'tggBgggtgggBgggggggtgBggggggtBgggBggggggtggBgpgggt',
  'ttgggBgtgBggggBggtggtggBgBgggggBgtgBgggggtggBpgBgt',
  'tgBggggggggBggggggtgggggggBggggggtgggBgggtgggpgggt',
  'tgggBgtggBgggtgBggttgBgggggggBggtggBgggBgtgBgpgBgt',
  'ttgBgggBgggBggggggtgggBgBgggggtgBgggggBggtgggpgggt',
  'tggggBggtgBgggBggtgBgggggggBggggtggBggggtwwwwwwwwt',
  'tgBgggBggggggBgggtggggBgggggggBggtgggBgBtwwwwwwwwt',
  'tggBgggtgBgggggBgtgBgggBggBggggggtggBgggtwwwwwwwwt',
  'ttgggBgggggBggggggtggggggggggBggtgBgggBggtgggBpggt',
  'tgBggggBggtgBgggBgtgBgggBgBggggtggggBgggtgBgggpgBt',
  'tgggBgggtgggggBggtgggggggggBgBggtgBgggBgtggggBpggt',
  'ttgBgggBggtgBgggBgtgBggBggggggggtggBggggtgBgBgpgBt',
  'tggggBgggtgggBggggtggggggBgBggBgtgggBgBgtgggggpggt',
  'tgBgggBgggBgggBgBgtgBgggggggggBgtggBggggtgBgggpgBt',
  'tggBgggtggggBgggggtgggBgBggBggggtgBgggBgtggBgBpppt',
  'tttttttttttttttttttttttttttttttttttttttttttttttttt',
]);

// ===== MAP 5: Sahara Edge, Morocco =====
// Vast sand dunes, oasis, rocky outcrops, market area, stone paths
const MAP5 = parseMap([
  'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
  'rsssssssssssssssssssssssssssrssssssssssssssssssspr',
  'rssrsssssrssssssssrsssrsssssssrsssssrsssrssssssspr',
  'rsssssrsssssssssssssssssssrsssssrssssssssssssspssr',
  'rssssssssrsssssssssssrssssssssssssrsssrsspppssssrr',
  'rsrsssssssssssssrsssssssrssssssssssssssspsrsssssrr',
  'rsssssrssssssrsssssrsssssssrssssssrssssspssssrssrr',
  'rsssssssssssssssssssssrsssssssssssssssssprsssssssr',
  'rsrspppppppppppppppppppppppppppppppppppppssrsssssr',
  'rssspssrssssssssssssssssssrsssssssssssssssssssrsrr',
  'rssspsssssrsssssssssrsssssssssrssssssssrsssssssssr',
  'rssrpssrsssssssrsssssssrsssssssssrsssssssssrsssssr',
  'rsssppppppppppppppppppppppppppppppppppppppssssssrr',
  'rssssssssssssrsssssssssssssrsssssssrsssssssrsssssr',
  'rsssrsssssssssssrsssssssssssssrsssssssssrsssssssrr',
  'rssssssrsssssssssssrsssssrsssssssrsssssssssrsssssr',
  'rsrsssssssrsssssssssssssssssrsssssssrsssssssssrssr',
  'rsssssssssssssrsssssssrsssssssssrsssssssrsssssssrr',
  'rssssrsssssssssssrsssssssrsssssssssrsssssssssrsssr',
  'rsssssssrsssssssssssrsssssssrsssssssssssrsssssssrr',
  'rssrsssssssrsssssssssssrsssssssrsssssssssssrsssssr',
  'rsssssssssssssssssrssssssswwwssssrsssssssssssssrsr',
  'rssssrsssrsssssssssssssswwwwwsssssssrsssssssssssrr',
  'rsssssssssssrsssssssrssswwwwwssrsssssssrsssssrsssr',
  'rssrsssssssssssrssssssssBBwwwBsssssssssssrsssssrrr',
  'rsssssrsssssssssssssrssssBBBBBsssrsssssssssssssssr',
  'rssssssssrssssssssssssssssBBBBssssssrsssssssssrssr',
  'rsrsssssssssrsssssssssrsssssssssrsssssssrsssssssrr',
  'rsssssssssssssssssssssssssssrsssssssssssssssssssss',
  'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
]);

// ===== MAP 6: Volcanic Fields, Iceland =====
// Black rock terrain, hot springs, moss patches, geysers, winding paths
const MAP6 = parseMap([
  'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
  'rgggrggggrggggggrgBgrgggrggggrggggrggggBgrggBgggBr',
  'rggggggBgrggBgrggggrgggggggBgrgBggrggBggrggggggBgr',
  'rgBgggggggggggggBggrggggBgggggggggggggggrgBgggggBr',
  'rggppppppppppppppppppppppprgggggggBggrggggggBgggBr',
  'rggpgrggBggggggBpggggggBggrgBgggggggrggBgggggBgggr',
  'rrgpggggggBgggggpgBgggggggrggggBggggrggggBgggggBgr',
  'rggpgBgggggggBggpggggrgBggrBgggggBggrgggggggBgggBr',
  'rBgpppppppppppppppppppppppppppppppppppppppppppgggr',
  'rggggBggrggggggBpgBggggBggrggggBggggrggBgggBgpgBgr',
  'rgBggggggBgggrgBpgggrgggggrgggggBgggrggggBgggpgggr',
  'rggrgggBgggggggBpgBggggBggrBgggggBggrggBgggBgpgBgr',
  'rggggBgggrgBgggBpggggrggggrggBggggggrggggBgggpgggr',
  'rgBggggggggggggBpgBgggggBgrgggggBgggrBgggggBgpgBgr',
  'rggggBgggrgggBggppppppppppppppppppppppppppppppgggr',
  'rgggggBggggBggggrggggBggrggggBggrggBgggBgggBggggBr',
  'rggBgggrgggggBggrggggggggrgBgggggrggggBgggggBgggBr',
  'rgggggggBgggggggrgBgggBggrgggggBgrggBgggBgggggBggr',
  'rggBggrgggBgggBggrggggggggrgggggggrgggggggBgggBggr',
  'rgggggggBgggggggrgBgggBggrgBggggBgrggBgggggBgggBgr',
  'rggrgggggggBgggBgrgggggggrggggBgggrggggBgggggBgggr',
  'rgggggBggggggBggrgBgggBggrgggggBggrggBggwwwggggBgr',
  'rggBgggrgggBgggBgrgggggggrggBgggggrggggwwwwwgBgggr',
  'rgggggggBgggggggrgBgggBggrggggBgggrggBgwwwwwggBggr',
  'rggBggrgggBggBgggrgggggggrgggggBggrggggBwwwgggBggr',
  'rgggggggBgggggBgrgBggBgggrgBggggBgrgggggBbggggBggr',
  'rggrgggggggBgggBgrgggggggrggggBgggrggBggBpppppppgr',
  'rgggggBggggggBggrgBgggBggrggBgggBgrggggBgBgggBgpgr',
  'rggBgggrgggBgggBgrgggggggrggggggggrBgggggBgggggpgr',
  'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
]);

// ===== MAP 7: Piedmont, Italy =====
// Camping village with boutiques, sunflower fields, winding paths, Stefy near the main square
const MAP7 = parseMap([
  'tttttttttttttttttttttttttttttttttttttttttttttttttt',
  'tgfffgpppppppppppfffffgpppppppppfffffggfffgggggggt',
  'tfffffpgggggggggpfffffgpgggggggpfffffgffffgggggggt',
  'tfffffpgggggggggpfffffgpgggggggpfffffgffffgggggggt',
  'tgfffgpgggggggggpggfffgpgggggggpggfffggfffgggggggt',
  'tgggggpggfffffffggpggggpggffffffggpggggggggggggggt',
  'tggggppggfffffffggpgggppggffffffggppgggggggggggggt',
  'tgggppggggfffffggppgggppggggfffffggppggggggggggggt',
  'tppppppppppppppppppppppppppppppppppppppppppppppppt',
  'tggpggggggggpggggggggggggggggpggggggggggggpggggggt',
  'tggpgghhhhggpggghhhhgggghhhhggpggghhhhggggpggggggt',
  'tggpgghhhhggpggghhhhgggghhhhggpggghhhhggggpggggggt',
  'tppppppppppppppppppppppppppppppppppppppppppppppppt',
  'tggpggggggggpggggggggpgggggggpgggggggggggpgggggggt',
  'tggpgghhhhggpgggBggggggggBgggpggggghhhhggpgggggggt',
  'tggpgghhhhggpgggggggggggggggppggggghhhhggpgggggggt',
  'tggpggggggggppgggggggggggggppgggggggggggppgggggggt',
  'tggppppppppppppppppppppppppppppppppppppppppggggggt',
  'tgggggggBgggggggggBgggggggBgggggBggggggggggggggggt',
  'tggggBggggggBgggBggggBggggggBgggggggBgggBggggggggt',
  'tggggggggggggggggggggggggggggggggggggggggggggggggt',
  'tggBggggBgggggBgggggBgggggBggggBgggggBgggBgggggggt',
  'tggggggggggggggggggggggggggggggggggggggggggggggggt',
  'tggggBggggBgggggBggggBgggggBgggggBgggggggBgggggggt',
  'tggggggggggggggggggggggggggggggggggggggggggggggggt',
  'tggBggggBgggBggggBgggggBgggggBgggBgggggBgggggggggt',
  'tggggggggggggggggggggggggggggggggggggggggggggggggt',
  'tggggBggggBgggBggggBggggBgggggBggggBgggBgggggggggt',
  'tggggggggggggggggggggggggggggggggggggggggggggggggt',
  'tttttttttttttttttttttttttttttttttttttttttttttttttt',
]);

export const MAPS = [null, MAP1, MAP2, MAP3, MAP4, MAP5, MAP6, MAP7];

// ===== LEVEL DEFINITIONS WITH QUESTS =====
export const LEVELS = [null,
{ // 1 - Tokyo Zen Garden
  name: 'Tokyo Garden, Japan',
  playerStart: { x: 5, y: 13 },
  npcs: [
    { id: 'jp_gardener', col: 8, row: 7, style: 0, hasQuest: true,
      dialog: [
        { speaker: 'Old Gardener', text: 'Ah, a young traveler! Welcome to my garden.' },
        { speaker: 'Old Gardener', text: 'You seek a cherry blossom? I grow the finest in all of Japan...' },
        { speaker: 'Old Gardener', text: 'But first, a riddle! I teach English to my granddaughter.' },
        { speaker: 'Old Gardener', text: '"I have hands but cannot clap. I have a face but cannot smile. What am I?"' },
      ],
      riddle: {
        speaker: 'Old Gardener',
        question: 'What has hands and a face but cannot clap or smile?',
        options: [
          { text: 'A clock', correct: true },
          { text: 'A snowman', correct: false },
          { text: 'A puppet', correct: false },
        ],
        wrongText: 'Hmm, not quite! Think about what tells you the time...',
        correctDialog: [
          { speaker: 'Old Gardener', text: 'A clock! Yes! Excellent!' },
          { speaker: 'Old Gardener', text: 'My granddaughter guessed "a snowman" - haha!' },
          { speaker: 'Old Gardener', text: 'Find the old clock in the eastern garden. Bring it to me!' },
        ],
      },
      dialogAfter: [{ speaker: 'Old Gardener', text: 'Find the old clock in the far south-eastern corner of the garden!' }],
      questDialog: [
        { speaker: 'Old Gardener', text: 'The clock! Wonderful!' },
        { speaker: 'Old Gardener', text: 'The inner garden is yours. The finest sakura blooms within.' },
      ],
      requiresItem: 'clock', revealsFlower: true,
      dialogDone: [{ speaker: 'Old Gardener', text: 'The sakura awaits you in the inner garden. Take good care of it!' }],
    },
    { id: 'jp_monk', col: 4, row: 8, style: 6, hasQuest: false,
      dialog: [
        { speaker: 'Monk', text: 'Breathe in... breathe out... the garden speaks to those who listen.' },
        { speaker: 'Monk', text: 'This temple was built 400 years ago. Many travelers pass through.' },
      ],
      dialogAfter: [{ speaker: 'Monk', text: 'Peace is found not at the destination, but along the path.' }],
      dialogDone: [{ speaker: 'Monk', text: 'May your journey bring joy to another.' }],
    },
  ],
  questItems: [{ id: 'clock', col: 44, row: 28, name: 'Old Garden Clock', sprite: 0 }],
  items: [{ id: 'f1', col: 8, row: 17, flower: 0, name: 'Cherry Blossom', hidden: true }],
  intro: [
    { speaker: '', text: '~ Chapter 1: The Cherry Blossom ~' },
    { speaker: 'Mikkel', text: "I've arrived in Japan. The zen gardens are breathtaking..." },
    { speaker: 'Mikkel', text: "I heard Stefy mention cherry blossoms once. She has such pretty hair... maybe she'd smile if I brought her one." },
  ],
  hintAfterIntro: [
    { speaker: 'Mikkel', text: 'I should talk to the gardener over there. He might help me.' },
  ],
  hintAfterNpc: [
    { speaker: 'Mikkel', text: "A clock... I need to find one and bring it back." },
  ],
  locationHint: [
    { speaker: 'Mikkel', text: "It's somewhere far to the south-east. I should explore the outer paths." },
  ],
},
{ // 2 - Dutch Countryside
  name: 'Dutch Countryside, Netherlands',
  playerStart: { x: 5, y: 22 },
  npcs: [
    { id: 'nl_hans', col: 6, row: 3, style: 1, hasQuest: true,
      dialog: [
        { speaker: 'Farmer Hans', text: 'Hallo friend! Welcome to my tulip farm!' },
        { speaker: 'Farmer Hans', text: 'A golden tulip? Ja, I have the only one in all Holland.' },
        { speaker: 'Farmer Hans', text: 'But my daughter lost her toy windmill near the southern canal.' },
        { speaker: 'Farmer Hans', text: 'She is learning English and loves riddles. Here is her favorite:' },
        { speaker: 'Farmer Hans', text: '"I have wheels but I am not a car. I have a bell but I am not a phone. You use your legs to make me go. What am I?"' },
      ],
      riddle: {
        speaker: 'Farmer Hans',
        question: 'I have wheels but I am not a car. I have a bell but I am not a phone. You use your legs to make me go. What am I?',
        options: [
          { text: 'A skateboard', correct: false },
          { text: 'A bicycle', correct: true },
          { text: 'A wheelbarrow', correct: false },
        ],
        wrongText: 'Not quite! In Holland, everyone rides one of these!',
        correctDialog: [
          { speaker: 'Farmer Hans', text: 'A bicycle! Ja, precies! We Dutch ride them everywhere!' },
          { speaker: 'Farmer Hans', text: 'Now help me - her toy windmill fell near the southern canal.' },
          { speaker: 'Farmer Hans', text: 'Bring it back and the golden tulip is yours!' },
        ],
      },
      dialogAfter: [{ speaker: 'Farmer Hans', text: 'The toy windmill is far to the east, near the canals. Watch your step on the bridges!' }],
      questDialog: [
        { speaker: 'Farmer Hans', text: 'You found it! Dank je wel!' },
        { speaker: 'Farmer Hans', text: 'My daughter says "thank you" - she is practicing her English!' },
        { speaker: 'Farmer Hans', text: 'The golden tulip grows in the far east field, past the last canal!' },
      ],
      requiresItem: 'windmill_toy', revealsFlower: true,
      dialogDone: [{ speaker: 'Farmer Hans', text: 'My daughter is so happy! Go find that golden tulip - you earned it!' }],
    },
    { id: 'nl_cat', col: 5, row: 16, style: 7, hasQuest: false,
      dialog: [
        { speaker: 'Mikkel', text: 'A ginger cat! Just sitting in the middle of the field.' },
        { speaker: 'Mikkel', text: "It's purring... I think it wants me to pet it. Alright, little one." },
      ],
      dialogAfter: [{ speaker: 'Mikkel', text: "The cat rubs against my leg. I miss having a pet." }],
      dialogDone: [{ speaker: 'Mikkel', text: "Still here, huh? Good kitty." }],
    },
  ],
  questItems: [{ id: 'windmill_toy', col: 35, row: 21, name: 'Toy Windmill', sprite: 1 }],
  items: [{ id: 'f2', col: 45, row: 1, flower: 1, name: 'Golden Tulip', hidden: true }],
  intro: [
    { speaker: '', text: '~ Chapter 2: The Golden Tulip ~' },
    { speaker: 'Mikkel', text: 'The Netherlands! Windmills and tulips as far as I can see.' },
    { speaker: 'Mikkel', text: "There's a farm up north. The farmer might know about rare tulips." },
  ],
  hintAfterIntro: [
    { speaker: 'Mikkel', text: "I see a farm up ahead. I should cross the bridges to get there." },
  ],
  hintAfterNpc: [
    { speaker: 'Mikkel', text: "I need to find a toy windmill and bring it back." },
  ],
  locationHint: [
    { speaker: 'Mikkel', text: "He said it's far to the east near the canals. I'll head that way." },
  ],
},
{ // 3 - Provence, France
  name: 'Provence, France',
  playerStart: { x: 8, y: 10 },
  npcs: [
    { id: 'fr_marie', col: 5, row: 3, style: 2, hasQuest: true,
      dialog: [
        { speaker: 'Painter Marie', text: 'Bonjour! I paint these lavender fields every morning.' },
        { speaker: 'Painter Marie', text: 'A silver lavender? Oui, I know where one grows...' },
        { speaker: 'Painter Marie', text: "But first, help me with an English word for my painting title!" },
        { speaker: 'Painter Marie', text: '"What gets wetter the more it dries?"' },
      ],
      riddle: {
        speaker: 'Painter Marie',
        question: 'What gets wetter the more it dries?',
        options: [
          { text: 'A sponge', correct: false },
          { text: 'A towel', correct: true },
          { text: 'The rain', correct: false },
        ],
        wrongText: 'Non, non! Think - what do you use AFTER a bath?',
        correctDialog: [
          { speaker: 'Painter Marie', text: '"A towel!" Of course! It dries YOU but gets wet itself!' },
          { speaker: 'Painter Marie', text: 'English is so playful. Merci!' },
          { speaker: 'Painter Marie', text: 'Now, I need a smooth stone from the brook to the east for my palette.' },
          { speaker: 'Painter Marie', text: 'Bring it and I will show you the silver lavender!' },
        ],
      },
      dialogAfter: [{ speaker: 'Painter Marie', text: 'The brook is far to the east. Find me a smooth stone!' }],
      questDialog: [
        { speaker: 'Painter Marie', text: 'A smooth brook stone! Parfait!' },
        { speaker: 'Painter Marie', text: 'The silver lavender grows far to the east. Follow the main path!' },
      ],
      requiresItem: 'brook_stone', revealsFlower: true,
      dialogDone: [{ speaker: 'Painter Marie', text: 'This stone is perfect for my palette. Merci! The lavender is yours.' }],
    },
    { id: 'fr_baker', col: 8, row: 4, style: 8, hasQuest: false,
      dialog: [
        { speaker: 'Baker Pierre', text: 'Bonjour! Would you like a croissant? Fresh from the oven!' },
        { speaker: 'Baker Pierre', text: "I bake every morning at 5am. The smell of butter in the cool air... c'est magnifique." },
      ],
      dialogAfter: [{ speaker: 'Baker Pierre', text: 'The secret to a good croissant? Patience. 27 layers of butter!' }],
      dialogDone: [{ speaker: 'Baker Pierre', text: "Ah, you found the lavender! Marie's garden is special, non?" }],
    },
  ],
  questItems: [{ id: 'brook_stone', col: 42, row: 15, name: 'Smooth Brook Stone', sprite: 2 }],
  items: [{ id: 'f3', col: 46, row: 9, flower: 2, name: 'Silver Lavender', hidden: true }],
  intro: [
    { speaker: '', text: '~ Chapter 3: The Silver Lavender ~' },
    { speaker: 'Mikkel', text: 'Provence... the air smells like lavender and honey.' },
    { speaker: 'Mikkel', text: "There's a painter by the fields. Maybe she knows the rare ones." },
  ],
  hintAfterIntro: [
    { speaker: 'Mikkel', text: "I can see someone painting to the north. I'll go ask." },
  ],
  hintAfterNpc: [
    { speaker: 'Mikkel', text: "She needs a smooth stone from the brook. I should find one." },
  ],
  locationHint: [
    { speaker: 'Mikkel', text: "The brook is to the east. I'll follow the path and look for water." },
  ],
},
{ // 4 - Amazon Jungle
  name: 'Amazon Jungle, Brazil',
  playerStart: { x: 3, y: 3 },
  npcs: [
    { id: 'br_carlos', col: 4, row: 8, style: 3, hasQuest: true,
      dialog: [
        { speaker: 'Guide Carlos', text: 'Ola amigo! The jungle is thick but I know every trail.' },
        { speaker: 'Guide Carlos', text: 'A rainbow orchid grows across the river - but the vine bridge snapped!' },
        { speaker: 'Guide Carlos', text: 'I need rope to fix it. But first, a little English game:' },
        { speaker: 'Guide Carlos', text: '"What has a head and a tail but no body?"' },
      ],
      riddle: {
        speaker: 'Guide Carlos',
        question: 'What has a head and a tail but no body?',
        options: [
          { text: 'A snake', correct: false },
          { text: 'A coin', correct: true },
          { text: 'A river', correct: false },
        ],
        wrongText: 'No no! Think smaller - something in your pocket!',
        correctDialog: [
          { speaker: 'Guide Carlos', text: 'A coin! Heads or tails, sim!' },
        { speaker: 'Guide Carlos', text: 'Smart traveler! Now help me - I dropped my rope further south on the path.' },
        { speaker: 'Guide Carlos', text: 'Follow the trail straight down. You will find it.' }
        ],
      },
      dialogAfter: [{ speaker: 'Guide Carlos', text: 'Follow the path straight south - I dropped the rope down there!' }],
      questDialog: [
        { speaker: 'Guide Carlos', text: 'The rope! Excelente!' },
        { speaker: 'Guide Carlos', text: 'The bridge is fixed. Cross the river - the orchid is far to the south-east!' },
        { speaker: 'Guide Carlos', text: 'You will know it by its rainbow colors. Boa sorte!' },
      ],
      requiresItem: 'rope', revealsFlower: true,
      dialogDone: [{ speaker: 'Guide Carlos', text: 'The bridge is strong now! Go find that orchid, amigo!' }],
    },
    { id: 'br_parrot', col: 8, row: 2, style: 9, hasQuest: false,
      dialog: [
        { speaker: 'Mikkel', text: 'A huge macaw! Its feathers are bright red and blue.' },
        { speaker: 'Mikkel', text: '"HOLA! HOLA!" ...wrong language, little guy, but close enough!' },
      ],
      dialogAfter: [{ speaker: 'Mikkel', text: "The macaw tilts its head at me. I think it's judging my Spanish." }],
      dialogDone: [{ speaker: 'Mikkel', text: "The macaw squawks happily. It seems to like flowers!" }],
    },
  ],
  questItems: [{ id: 'rope', col: 4, row: 20, name: 'Sturdy Vine Rope', sprite: 3 }],
  items: [{ id: 'f4', col: 47, row: 28, flower: 3, name: 'Rainbow Orchid', hidden: true }],
  intro: [
    { speaker: '', text: '~ Chapter 4: The Rainbow Orchid ~' },
    { speaker: 'Mikkel', text: "The Amazon... I've never seen so much green!" },
    { speaker: 'Mikkel', text: "There's a guide ahead. The jungle is too dense to go alone." },
  ],
  hintAfterIntro: [
    { speaker: 'Mikkel', text: "I can see someone on the path to the south. I should talk to them." },
  ],
  hintAfterNpc: [
    { speaker: 'Mikkel', text: "I need to find rope to fix the bridge." },
  ],
  locationHint: [
    { speaker: 'Mikkel', text: "The rope is far to the south. I'll keep heading down the path." },
  ],
},
{ // 5 - Sahara Edge, Morocco
  name: 'Sahara Edge, Morocco',
  playerStart: { x: 4, y: 8 },
  npcs: [
    { id: 'ma_youssef', col: 10, row: 6, style: 4, hasQuest: true,
      dialog: [
        { speaker: 'Merchant Youssef', text: 'As-salamu alaykum, traveler! Rest in the shade.' },
        { speaker: 'Merchant Youssef', text: 'A Desert Rose? I know exactly where one blooms...' },
        { speaker: 'Merchant Youssef', text: 'But knowledge has a price! Answer my riddle:' },
        { speaker: 'Merchant Youssef', text: '"The more you take away from me, the bigger I get. What am I?"' },
      ],
      riddle: {
        speaker: 'Merchant Youssef',
        question: 'The more you take away from me, the bigger I get. What am I?',
        options: [
          { text: 'The sky', correct: false },
          { text: 'A shadow', correct: false },
          { text: 'A hole', correct: true },
        ],
        wrongText: 'Think again! When you dig in the sand, what happens?',
        correctDialog: [
          { speaker: 'Merchant Youssef', text: 'A hole! You dig, it gets bigger!' },
          { speaker: 'Merchant Youssef', text: 'Very wise. I collect rare things from this desert.' },
          { speaker: 'Merchant Youssef', text: 'Bring me the brass spyglass lost near the oasis to the south-east.' },
          { speaker: 'Merchant Youssef', text: 'In return, I will reveal the Desert Rose!' },
        ],
      },
      dialogAfter: [{ speaker: 'Merchant Youssef', text: 'The brass spyglass is near the oasis to the south-east. Among the bushes.' }],
      questDialog: [
        { speaker: 'Merchant Youssef', text: 'The spyglass! What a treasure!' },
        { speaker: 'Merchant Youssef', text: 'A fair trade. The Desert Rose blooms at the far north-east edge of the desert.' },
        { speaker: 'Merchant Youssef', text: 'Follow the path east, then north. You cannot miss it!' },
      ],
      requiresItem: 'spyglass', revealsFlower: true,
      dialogDone: [{ speaker: 'Merchant Youssef', text: 'A fair trade is a blessed trade. May the desert guide your steps!' }],
    },
    { id: 'ma_camel', col: 6, row: 12, style: 10, hasQuest: false,
      dialog: [
        { speaker: 'Mikkel', text: 'A camel! It looks completely unbothered by the heat.' },
        { speaker: 'Mikkel', text: "It's chewing something and staring at me. Very judgmental energy." },
      ],
      dialogAfter: [{ speaker: 'Mikkel', text: "The camel spits near my feet. I'll take that as a greeting." }],
      dialogDone: [{ speaker: 'Mikkel', text: "Still chewing. Still judging. Respect." }],
    },
  ],
  questItems: [{ id: 'spyglass', col: 28, row: 25, name: 'Brass Spyglass', sprite: 4 }],
  items: [{ id: 'f5', col: 48, row: 1, flower: 4, name: 'Desert Rose', hidden: true }],
  intro: [
    { speaker: '', text: '~ Chapter 5: The Desert Rose ~' },
    { speaker: 'Mikkel', text: 'Morocco... the heat is intense but the landscape is stunning.' },
    { speaker: 'Mikkel', text: 'A merchant rests ahead. Perhaps he trades in rare flowers too.' },
  ],
  hintAfterIntro: [
    { speaker: 'Mikkel', text: "I see someone by the path ahead. Let me ask for directions." },
  ],
  hintAfterNpc: [
    { speaker: 'Mikkel', text: "He wants a brass spyglass in exchange. I need to find it." },
  ],
  locationHint: [
    { speaker: 'Mikkel', text: "The oasis is to the south-east. It has water and bushes - should be easy to spot." },
  ],
},
{ // 6 - White Cliffs, Denmark
  name: 'White Cliffs, Denmark',
  playerStart: { x: 3, y: 4 },
  npcs: [
    { id: 'dk_lars', col: 6, row: 7, style: 5, hasQuest: true,
      dialog: [
        { speaker: 'Fisherman Lars', text: 'Hej hej! Welcome to Denmark, friend! Blowing a gale today.' },
        { speaker: 'Fisherman Lars', text: 'A wild bluebell? Ja, they grow on the cliff edges by the sea.' },
        { speaker: 'Fisherman Lars', text: 'But my compass washed overboard in the storm. I cannot find my way back.' },
        { speaker: 'Fisherman Lars', text: 'A riddle while you search! "I can be cracked, made, told, and played. What am I?"' },
      ],
      riddle: {
        speaker: 'Fisherman Lars',
        question: 'I can be cracked, made, told, and played. What am I?',
        options: [
          { text: 'A joke', correct: true },
          { text: 'A secret', correct: false },
          { text: 'An egg', correct: false },
        ],
        wrongText: 'Hmm, nope! What makes people laugh?',
        correctDialog: [
          { speaker: 'Fisherman Lars', text: 'A joke! Ha! Good one!' },
          { speaker: 'Fisherman Lars', text: 'Here is one: "Why do flowers drive so fast?"' },
          { speaker: 'Fisherman Lars', text: '"They put the petal to the metal!" Haha!' },
          { speaker: 'Fisherman Lars', text: 'Find my compass among the eastern rocks and I will show you the bluebell spot.' },
        ],
      },
      dialogAfter: [{ speaker: 'Fisherman Lars', text: 'My compass fell somewhere in the eastern rocks along the shore.' }],
      questDialog: [
        { speaker: 'Fisherman Lars', text: 'My compass! Tak skal du have!' },
        { speaker: 'Fisherman Lars', text: 'The wild bluebell grows on the south-eastern cliff edge.' },
        { speaker: 'Fisherman Lars', text: 'Follow the coast path. You will hear the waves crashing below!' },
      ],
      requiresItem: 'compass', revealsFlower: true,
      dialogDone: [{ speaker: 'Fisherman Lars', text: 'The bluebell is on the south-eastern cliffs! Go before the wind picks up again!' }],
    },
    { id: 'dk_seagull', col: 6, row: 1, style: 11, hasQuest: false,
      dialog: [
        { speaker: 'Mikkel', text: "A fat seagull. It's eyeing my sandwich..." },
        { speaker: 'Mikkel', text: 'Hey! No! That is MY rugbrød! Shoo!' },
      ],
      dialogAfter: [{ speaker: 'Mikkel', text: "It's still watching me. Danish seagulls are fearless." }],
      dialogDone: [{ speaker: 'Mikkel', text: "The seagull looks satisfied. Did it already steal half my lunch?" }],
    },
    { id: 'dk_oldlady', col: 8, row: 3, style: 12, hasQuest: false,
      dialog: [
        { speaker: 'Old Lady Inge', text: 'Ah, a young man! Visiting our little coast, are you?' },
        { speaker: 'Old Lady Inge', text: "My husband fished these waters for fifty years. Now I walk here and remember." },
        { speaker: 'Old Lady Inge', text: 'The bluebells bloom every spring. They always made him smile.' },
      ],
      dialogAfter: [{ speaker: 'Old Lady Inge', text: "It's a good day for a walk. The wind is gentle today." }],
      dialogDone: [{ speaker: 'Old Lady Inge', text: "Oh a bluebell! How lovely. Whoever gets that is very lucky." }],
    },
  ],
  questItems: [{ id: 'compass', col: 38, row: 10, name: 'Lost Compass', sprite: 5 }],
  items: [{ id: 'f6', col: 47, row: 28, flower: 5, name: 'Danish Bluebell', hidden: true }],
  intro: [
    { speaker: '', text: '~ Chapter 6: The Danish Bluebell ~' },
    { speaker: 'Mikkel', text: 'Denmark... home turf! The white cliffs and grey sea remind me of childhood.' },
    { speaker: 'Mikkel', text: "There's a fisherman by the rocks. He looks like he knows these shores." },
  ],
  hintAfterIntro: [
    { speaker: 'Mikkel', text: "There's a fisherman resting near the rocks. I'll ask him." },
  ],
  hintAfterNpc: [
    { speaker: 'Mikkel', text: "He lost his compass. I need to find it for him." },
  ],
  locationHint: [
    { speaker: 'Mikkel', text: "It fell somewhere in the eastern rocks along the shore. I'll look there." },
  ],
},
{ // 7 - Piedmont, Italy (final level - no quest, just find flower + Stefy)
  name: 'Piedmont, Italy',
  playerStart: { x: 8, y: 12 },
  npcs: [
    { id: 'it_nonna', col: 7, row: 7, style: 13, hasQuest: false,
      dialog: [
        { speaker: 'Nonna Rosa', text: 'Ciao bello! You look like a boy with something on his mind.' },
        { speaker: 'Nonna Rosa', text: "Let me guess... a girl? Ha! I can always tell." },
        { speaker: 'Nonna Rosa', text: 'Go pick that sunflower from the north field. Girls love sunflowers.' },
      ],
      dialogAfter: [{ speaker: 'Nonna Rosa', text: "Go on! She won't wait forever! ...well, she might. But still!" }],
      dialogDone: [{ speaker: 'Nonna Rosa', text: 'Ah, young love. It makes my old heart sing. Go get her, ragazzo!' }],
    },
  ],
  questItems: [],
  items: [{ id: 'f7', col: 20, row: 5, flower: 6, name: 'Italian Sunflower', hidden: false }],
  girl: { col: 12, row: 10 },
  intro: [
    { speaker: '', text: '~ Chapter 7: Coming Home to You ~' },
    { speaker: 'Mikkel', text: "Italy... this is where Stefy lives. The sunflower fields are golden." },
    { speaker: 'Mikkel', text: 'One last flower from her homeland. Then... I give her the bouquet.' },
    { speaker: 'Mikkel', text: "I can see a villa ahead. My heart is pounding... what if she doesn't even remember me?" },
  ],
  hintAfterIntro: [
    { speaker: 'Mikkel', text: "I can see a bright sunflower in the fields to the north!" },
    { speaker: 'Mikkel', text: "And there... I think I can see Stefy near the villa!" },
  ],
  hintAfterNpc: [],
}];

// Ending dialog
export const ENDING_DIALOG = [
  { speaker: 'Stefy', text: "Oh! You're... Mikkel, right? From Emma's stream?" },
  { speaker: 'Mikkel', text: 'Hi Stefy! Yes! I... I brought you something.' },
  { speaker: 'Mikkel', text: 'A Cherry Blossom from Japan... a Golden Tulip from the Netherlands...' },
  { speaker: 'Mikkel', text: 'Silver Lavender from France... a Rainbow Orchid from Brazil...' },
  { speaker: 'Mikkel', text: 'A Desert Rose from Morocco... a Danish Bluebell from home...' },
  { speaker: 'Mikkel', text: 'And a Sunflower from right here. Because... you have really pretty hair.' },
  { speaker: 'Stefy', text: '...' },
  { speaker: 'Stefy', text: 'You traveled the whole world... to bring ME flowers?' },
  { speaker: 'Mikkel', text: "Every petal reminded me of you. I know it's silly but..." },
  { speaker: 'Stefy', text: "It's not silly at all. They're beautiful, Mikkel. Thank you." },
  { speaker: 'Stefy', text: 'Hey... do you want to get gelato? There is a place nearby.' },
  { speaker: 'Mikkel', text: "I'd like that. I'd really like that." },
  { speaker: '', text: '~ The End ~' },
  { speaker: '', text: 'Thank you for playing Flowers for Stefy!' },
];

export const TOTAL_FLOWERS = 7;
export const TOTAL_LEVELS = 7;
