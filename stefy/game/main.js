/**
 * main.js - Game Bootstrap
 * Creates the world, registers systems, generates assets, starts the game.
 */

import {
  World, RendererSystem, InputSystem, SceneManager,
  TileMapRenderer, GridPhysics, DialogSystem, AudioSystem,
  AssetPipeline, PaletteSprite,
} from '../engine/index.js';

import { PALETTE } from './data/palette.js';
import { SPR_PLAYER, SPR_GIRL, SPR_NPC, SPR_FLOWER, NPC_STYLES, FLOWER_COLORS } from './data/sprites.js';
import { TitleScene } from './scenes/title.js';
import { LevelScene } from './scenes/level.js';
import { EndingScene } from './scenes/ending.js';

// --- Asset Generation ---
function generateAssets(renderer) {
  const pipeline = new AssetPipeline();
  pipeline.setPalette(PALETTE);

  const sheet = pipeline.createSheet('main', 256, 256);

  // Character sprites
  const playerSprite = new PaletteSprite(SPR_PLAYER, PALETTE, { v: 31 });
  playerSprite.render(sheet, 0, 0);
  sheet.defineRegion('player', 0, 0, 16, 16);

  const girlSprite = new PaletteSprite(SPR_GIRL, PALETTE, { v: 31 });
  girlSprite.render(sheet, 16, 0);
  sheet.defineRegion('girl', 16, 0, 16, 16);

  const npcSprite = new PaletteSprite(SPR_NPC, PALETTE, { v: 31 });
  NPC_STYLES.forEach((style, i) => {
    npcSprite.render(sheet, 32 + i * 16, 0, { H: style[0], S: style[1], P: style[2] });
    sheet.defineRegion(`npc_${i}`, 32 + i * 16, 0, 16, 16);
  });

  // Flower sprites
  const flowerSprite = new PaletteSprite(SPR_FLOWER, PALETTE, {});
  FLOWER_COLORS.forEach((colors, i) => {
    flowerSprite.render(sheet, i * 16, 32, { b: colors[0], u: colors[1], c: colors[2] });
    sheet.defineRegion(`flower_${i}`, i * 16, 32, 16, 16);
  });

  // Tile sprites (at y=48)
  generateTiles(sheet);

  pipeline.registerWithRenderer(renderer);
  return pipeline;
}

function generateTiles(sheet) {
  const P = PALETTE;
  const tileY = 48;

  // 0: Grass
  sheet.fillRect(0, tileY, 16, 16, P[11]);
  for (let i = 0; i < 8; i++) {
    sheet.fillRect((i * 5) % 14, tileY + (i * 3) % 14, 2, 3, P[12 + (i % 2)]);
  }
  // 1: Water
  sheet.fillRect(16, tileY, 16, 16, P[14]);
  sheet.fillRect(18, tileY + 6, 10, 2, P[15]);
  sheet.fillRect(20, tileY + 12, 8, 2, P[15]);
  // 2: Path
  sheet.fillRect(32, tileY, 16, 16, P[16]);
  sheet.fillRect(34, tileY + 4, 3, 3, P[17]);
  sheet.fillRect(40, tileY + 10, 4, 3, P[17]);
  // 3: Tree
  sheet.fillRect(48, tileY, 16, 16, P[11]);
  sheet.fillRect(54, tileY + 9, 4, 7, P[6]);
  sheet.fillRect(50, tileY + 1, 12, 10, P[12]);
  sheet.fillRect(52, tileY + 3, 8, 6, P[13]);
  // 4: Wall
  sheet.fillRect(64, tileY, 16, 16, P[18]);
  sheet.fillRect(64, tileY + 8, 16, 8, P[19]);
  sheet.fillRect(66, tileY + 2, 5, 5, P[34]);
  sheet.fillRect(73, tileY + 9, 5, 5, P[34]);
  // 5: Flower field
  sheet.fillRect(80, tileY, 16, 16, P[11]);
  for (let i = 0; i < 6; i++) {
    sheet.fillRect(80 + (i * 7) % 13, tileY + (i * 5) % 13, 3, 3, P[20]);
  }
  // 6: Sand
  sheet.fillRect(96, tileY, 16, 16, P[21]);
  // 7: House
  sheet.fillRect(112, tileY, 16, 16, P[16]);
  sheet.fillRect(112, tileY, 16, 5, P[22]);
  sheet.fillRect(118, tileY + 8, 5, 8, P[35]);
  // 8: Bridge
  sheet.fillRect(128, tileY, 16, 16, P[6]);
  sheet.fillRect(128, tileY, 16, 3, P[35]);
  sheet.fillRect(128, tileY + 13, 16, 3, P[35]);
  // 9: Rock
  sheet.fillRect(144, tileY, 16, 16, P[11]);
  sheet.fillRect(146, tileY + 4, 12, 10, P[18]);
  sheet.fillRect(148, tileY + 3, 8, 7, P[34]);
  // 10: Bush
  sheet.fillRect(160, tileY, 16, 16, P[11]);
  sheet.fillRect(162, tileY + 5, 12, 10, P[12]);
  sheet.fillRect(164, tileY + 4, 8, 7, P[13]);
  // 11: Door
  sheet.fillRect(176, tileY, 16, 16, P[35]);
  sheet.fillRect(180, tileY + 2, 8, 14, P[6]);
}

// --- Bootstrap ---
function boot() {
  const canvas = document.getElementById('game-canvas');
  const world = new World();

  // Systems (order matters: priority determines update/render order)
  const input = new InputSystem();
  input.mapAction('up', 'ArrowUp', 'KeyW');
  input.mapAction('down', 'ArrowDown', 'KeyS');
  input.mapAction('left', 'ArrowLeft', 'KeyA');
  input.mapAction('right', 'ArrowRight', 'KeyD');
  input.mapAction('interact', 'Space', 'Enter');

  const renderer = new RendererSystem(canvas, { width: 640, height: 480, bgColor: '#1a1a2e' });
  const tileMapRenderer = new TileMapRenderer();
  const physics = new GridPhysics();
  const dialog = new DialogSystem({ typeSpeed: 35 });
  const audio = new AudioSystem();
  const scenes = new SceneManager();

  world.addSystem(input);
  world.addSystem(physics);
  world.addSystem(tileMapRenderer);
  world.addSystem(renderer);
  world.addSystem(dialog);
  world.addSystem(audio);
  world.addSystem(scenes);

  // Generate sprite assets
  generateAssets(renderer);

  // Register scenes
  scenes.register(new TitleScene());
  scenes.register(new LevelScene());
  scenes.register(new EndingScene());

  // Start
  scenes.switchTo('title');
  world.start();
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
