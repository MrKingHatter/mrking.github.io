/**
 * main.js – Bootstrap for Flowers for Stefy 2: Bloom Again
 */
import {
  World, SceneManager, AssetPipeline, PaletteSprite,
  RendererSystem, InputSystem, CameraFollowSystem,
  TileMapRenderer, GridPhysics, DialogSystem, AudioSystem, StealthSystem,
} from '../../engine/index.js';
import { TRACKS } from './data/music.js';
import { TitleScene } from './scenes/title.js';
import { PrologueScene } from './scenes/prologue.js';
import { LevelSelectScene } from './scenes/levelselect.js';
import { StealthScene } from './scenes/stealth.js';
import { PuzzleScene } from './scenes/puzzle.js';
import { ChaseScene } from './scenes/chase.js';
import { ExploreScene } from './scenes/explore.js';
import { TradeScene } from './scenes/trade.js';
import { PrecisionScene } from './scenes/precision.js';
import { FinaleScene } from './scenes/finale.js';
import { VignetteScene } from './scenes/vignette.js';
import { SPRITES, PALETTE } from './data/sprites.js';

// ─── Asset Generation ───
// Sprite regions stored here for scenes to look up
export const SPRITE_REGIONS = {};

// Tile colors for the night garden tilemap
const TILE_COLORS = [
  '#1a2a1a', // 0: grass (dark night)
  '#0f2a4a', // 1: water
  '#2a2420', // 2: path (dark stone)
  '#0d1a0d', // 3: tree
  '#1a1a2e', // 4: wall (dark)
  '#2a1a2a', // 5: flowers (dark)
  '#2a2820', // 6: sand
  '#16213e', // 7: house (dark blue)
  '#3a2a1a', // 8: bridge
  '#1a1a1a', // 9: rock
  '#0d2a0d', // 10: bush
  '#2a1a10', // 11: door
];

export const TILE_REGIONS = [];
export const TILE_REGIONS_DAY = [];

function drawTilePattern(sheet, ox, oy, tileIdx) {
  const px = (x, y, c) => sheet.fillPixel(ox + x, oy + y, c);
  const rect = (x, y, w, h, c) => sheet.fillRect(ox + x, oy + y, w, h, c);

  switch (tileIdx) {
    case 0: // grass -- scattered blades
      px(3, 4, '#2a4a2a'); px(7, 2, '#2a4a2a'); px(12, 5, '#254525');
      px(5, 10, '#2a4a2a'); px(10, 12, '#254525'); px(2, 14, '#2a4a2a');
      px(14, 8, '#254525'); px(8, 7, '#223a22');
      break;
    case 1: // water -- wave highlights
      rect(1, 4, 4, 1, '#1a4a6a'); rect(8, 4, 3, 1, '#1a4a6a');
      rect(3, 8, 5, 1, '#1a4a6a'); rect(10, 9, 4, 1, '#1a4a6a');
      rect(0, 13, 3, 1, '#1a4a6a'); rect(7, 13, 4, 1, '#1a4a6a');
      px(5, 1, '#0a3a5a'); px(12, 6, '#0a3a5a'); px(2, 11, '#0a3a5a');
      break;
    case 2: // path -- stone cobbles
      rect(1, 1, 5, 3, '#3a3430'); rect(8, 1, 6, 3, '#3a3430');
      rect(0, 6, 4, 3, '#3a3430'); rect(6, 5, 5, 3, '#3a3430'); rect(12, 6, 3, 3, '#3a3430');
      rect(2, 11, 5, 3, '#3a3430'); rect(9, 11, 5, 3, '#3a3430');
      px(3, 2, '#4a4440'); px(10, 2, '#4a4440'); px(8, 6, '#4a4440'); px(4, 12, '#4a4440');
      break;
    case 3: // tree -- trunk + canopy
      rect(6, 10, 4, 6, '#3a2a1a'); // trunk
      rect(3, 2, 10, 9, '#0a3a0a'); // canopy
      rect(5, 1, 6, 3, '#1a4a1a'); // canopy highlight
      px(4, 5, '#1a4a1a'); px(8, 3, '#1a4a1a'); px(10, 6, '#1a4a1a');
      break;
    case 4: // wall -- brick rows
      for (let r = 0; r < 4; r++) {
        const y = r * 4;
        const off = (r % 2) * 4;
        rect(off, y, 7, 3, '#2a2a4a'); rect(off + 8, y, 7, 3, '#2a2a4a');
        rect(0, y + 3, 16, 1, '#111122'); // mortar
      }
      px(2, 1, '#3a3a5a'); px(10, 5, '#3a3a5a'); px(6, 9, '#3a3a5a');
      break;
    case 5: // flowers -- petals on green
      px(3, 3, '#ff69b4'); px(4, 3, '#ff69b4'); px(3, 4, '#ff69b4');
      px(9, 6, '#ffaa44'); px(10, 6, '#ffaa44'); px(10, 7, '#ffaa44');
      px(5, 11, '#ff69b4'); px(6, 11, '#ff69b4'); px(5, 12, '#ff69b4');
      px(12, 2, '#ffaa44'); px(13, 2, '#ffaa44');
      px(2, 8, '#ffaa44'); px(14, 12, '#ff69b4');
      // stems
      px(3, 5, '#1a4a1a'); px(9, 8, '#1a4a1a'); px(5, 13, '#1a4a1a');
      break;
    case 6: // sand -- speckled
      px(2, 3, '#3a3828'); px(7, 1, '#3a3828'); px(12, 4, '#3a3828');
      px(4, 9, '#3a3828'); px(10, 11, '#3a3828'); px(14, 7, '#3a3828');
      px(1, 13, '#3a3828'); px(8, 14, '#3a3828');
      break;
    case 7: // house -- body with roof band and shoji window (tiles like game 1)
      rect(0, 0, 16, 16, '#1e2842'); // wall body
      rect(0, 0, 16, 4, '#0e1420'); // dark roof band at top
      rect(0, 4, 16, 1, '#2a3a5a'); // eave line
      rect(5, 7, 7, 6, '#2a3a50'); // window/shoji panel
      rect(6, 8, 5, 4, '#3a506a'); // inner glow
      px(8, 9, '#5a7a9a'); // lantern light
      break;
    case 8: // bridge -- wood planks
      for (let r = 0; r < 8; r++) {
        rect(0, r * 2, 16, 1, '#5a4a2a');
        rect(0, r * 2 + 1, 16, 1, '#4a3a1a');
      }
      rect(1, 0, 1, 16, '#3a2a0a'); rect(14, 0, 1, 16, '#3a2a0a'); // rails
      break;
    case 9: // rock -- irregular gray mass
      rect(3, 4, 10, 9, '#2a2a2a');
      rect(4, 2, 8, 3, '#333333');
      rect(5, 12, 6, 3, '#2a2a2a');
      px(5, 5, '#3a3a3a'); px(9, 7, '#3a3a3a'); px(7, 10, '#3a3a3a'); // highlights
      px(4, 8, '#1a1a1a'); px(10, 4, '#1a1a1a'); // shadows
      break;
    case 10: // bush -- round bumpy green
      rect(2, 5, 12, 9, '#1a3a1a');
      rect(4, 3, 8, 4, '#1a3a1a');
      px(3, 5, '#2a5a2a'); px(7, 4, '#2a5a2a'); px(11, 6, '#2a5a2a');
      px(5, 9, '#2a5a2a'); px(9, 11, '#2a5a2a');
      px(6, 7, '#0a2a0a'); px(10, 9, '#0a2a0a');
      break;
    case 11: // door -- wooden door with handle
      rect(3, 0, 10, 16, '#4a3a2a'); // door frame
      rect(4, 1, 8, 14, '#3a2a1a'); // door body
      rect(4, 1, 8, 1, '#5a4a3a'); // top frame
      px(10, 8, '#ffd700'); px(10, 9, '#ffd700'); // handle
      rect(5, 3, 3, 5, '#2a1a0a'); rect(8, 3, 3, 5, '#2a1a0a'); // panels
      break;
  }
}

function generateAssets(renderer) {
  const pipeline = new AssetPipeline();
  pipeline.setPalette(PALETTE);

  const sheet = pipeline.createSheet('main', 256, 256);
  let cx = 0, cy = 0;

  for (const [key, pixels] of Object.entries(SPRITES)) {
    const spr = new PaletteSprite(pixels, PALETTE, {});
    spr.render(sheet, cx, cy);
    sheet.defineRegion(key, cx, cy, 16, 16);
    SPRITE_REGIONS[key] = { srcX: cx, srcY: cy, srcW: 16, srcH: 16 };
    cx += 16;
    if (cx >= 256) { cx = 0; cy += 16; }
  }

  // Generate tile sprites with recognizable pixel-art patterns
  if (cx !== 0) { cx = 0; cy += 16; }
  for (let i = 0; i < TILE_COLORS.length; i++) {
    sheet.fillRect(cx, cy, 16, 16, TILE_COLORS[i]);
    drawTilePattern(sheet, cx, cy, i);
    sheet.defineRegion('tile_' + i, cx, cy, 16, 16);
    TILE_REGIONS.push({ x: cx, y: cy, w: 16, h: 16 });
    cx += 16;
    if (cx >= 256) { cx = 0; cy += 16; }
  }

  // Daytime tiles for Level 2
  const DAY_COLORS = [
    '#5aaa5a','#3a7acc','#b0a090','#2a7a2a','#9a7a6a',
    '#ff5599','#c8b888','#cc6a30','#8a7a4a','#9a9a9a','#7a6a4a','#6a5a4a',
  ];
  if (cx !== 0) { cx = 0; cy += 16; }
  for (let i = 0; i < DAY_COLORS.length; i++) {
    sheet.fillRect(cx, cy, 16, 16, DAY_COLORS[i]);
    drawDayTile(sheet, cx, cy, i);
    sheet.defineRegion('day_tile_' + i, cx, cy, 16, 16);
    TILE_REGIONS_DAY.push({ x: cx, y: cy, w: 16, h: 16 });
    cx += 16;
    if (cx >= 256) { cx = 0; cy += 16; }
  }

  pipeline.registerWithRenderer(renderer);
  return pipeline;
}

function drawDayTile(sheet, ox, oy, idx) {
  const px = (x,y,c) => sheet.fillPixel(ox+x,oy+y,c);
  const rect = (x,y,w,h,c) => sheet.fillRect(ox+x,oy+y,w,h,c);
  switch (idx) {
    case 0: px(3,4,'#6aba6a'); px(7,2,'#6aba6a'); px(12,5,'#5aaa5a'); px(5,10,'#6aba6a'); break;
    case 1: rect(1,4,4,1,'#5a9aee'); rect(8,4,3,1,'#5a9aee'); rect(3,8,5,1,'#5a9aee'); break;
    case 2: rect(1,1,5,3,'#c0b0a0'); rect(8,1,6,3,'#c0b0a0'); rect(0,6,4,3,'#c0b0a0'); rect(6,5,5,3,'#c0b0a0'); break;
    case 3: rect(6,10,4,6,'#5a4a2a'); rect(3,2,10,9,'#2a8a2a'); rect(5,1,6,3,'#3aaa3a'); break;
    case 4: rect(0,0,16,8,'#7a6a5a'); rect(0,8,16,8,'#8a7a6a'); px(0,7,'#6a5a4a'); px(4,7,'#6a5a4a'); px(8,7,'#6a5a4a'); px(12,7,'#6a5a4a'); px(2,15,'#6a5a4a'); px(6,15,'#6a5a4a'); px(10,15,'#6a5a4a'); px(14,15,'#6a5a4a'); break;
    case 5: px(3,3,'#ff2255'); px(4,3,'#ff2255'); px(9,6,'#ffcc00'); px(10,6,'#ffcc00'); px(5,11,'#ff2255'); px(6,11,'#ff2255'); px(3,5,'#3a8a3a'); px(9,8,'#3a8a3a'); break;
    case 6: px(2,3,'#b8a878'); px(7,8,'#b8a878'); px(12,5,'#b8a878'); rect(3,14,10,2,'#baa878'); break;
    case 7: rect(0,0,16,4,'#aa4a20'); rect(0,4,16,1,'#dd8a50'); rect(0,5,16,11,'#eecc88'); rect(5,7,6,5,'#ffeecc'); px(8,9,'#aa8844'); break;
    case 9: rect(6,0,4,16,'#aaaaaa'); rect(3,6,10,2,'#888888'); px(7,2,'#bbb'); break;
    case 10: rect(0,7,16,2,'#8a7a5a'); rect(2,4,2,8,'#7a6a4a'); rect(7,4,2,8,'#7a6a4a'); rect(12,4,2,8,'#7a6a4a'); break;
    case 11: rect(3,0,10,16,'#5a4a3a'); rect(4,1,8,14,'#4a3a2a'); px(10,8,'#ffd700'); px(10,9,'#ffd700'); break;
  }
}

// ─── World + Systems Setup ───
const canvas = document.getElementById('game-canvas');
const world = new World();

const input = new InputSystem(canvas);
const renderer = new RendererSystem(canvas);
const cameraFollow = new CameraFollowSystem();
const tileMapRenderer = new TileMapRenderer();
const physics = new GridPhysics();
const stealth = new StealthSystem();
const dialog = new DialogSystem({ typeSpeed: 35 });
const audio = new AudioSystem();
audio.registerTracks(TRACKS);
const scenes = new SceneManager();

world.addSystem(input);
world.addSystem(physics);
world.addSystem(stealth);
world.addSystem(cameraFollow);
world.addSystem(tileMapRenderer);
world.addSystem(renderer);
world.addSystem(dialog);
world.addSystem(audio);
world.addSystem(scenes);

// Generate sprite assets
generateAssets(renderer);

// Register scenes
scenes.register(new TitleScene());
scenes.register(new PrologueScene());
scenes.register(new LevelSelectScene());
scenes.register(new StealthScene());
scenes.register(new PuzzleScene());
scenes.register(new ChaseScene());
scenes.register(new ExploreScene());
scenes.register(new TradeScene());
scenes.register(new PrecisionScene());
scenes.register(new FinaleScene());
scenes.register(new VignetteScene());

// Start
scenes.switchTo('title');
world.start();
window.__world = world;
window.__dialog = dialog;

// ─── Music Toggle ───
const musicBtn = document.getElementById('music-toggle');
musicBtn.addEventListener('click', () => {
  const playing = audio.toggleMusic();
  musicBtn.classList.toggle('muted', !playing);
  musicBtn.textContent = playing ? '♪' : '♪̶';
});
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyM' && !e.ctrlKey && !e.altKey) {
    musicBtn.click();
  }
});

console.log('🌸 Flowers for Stefy 2: Bloom Again -- loaded');
