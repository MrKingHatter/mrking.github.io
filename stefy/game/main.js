/**
 * main.js - Game Bootstrap
 * Creates the world, registers systems, generates assets, starts the game.
 */

import {
  World, RendererSystem, InputSystem, SceneManager,
  TileMapRenderer, GridPhysics, DialogSystem, AudioSystem,
  AssetPipeline, PaletteSprite, CameraFollowSystem,
} from '../engine/index.js';

import { PALETTE } from './data/palette.js';
import { SPR_PLAYER, SPR_GIRL, SPR_NPC, SPR_NPC_ROBED, SPR_ANIMAL_SMALL, SPR_ANIMAL_LARGE, SPR_ANIMAL_BIRD, SPR_FLOWER, FLOWER_SPRITES, NPC_STYLES, FLOWER_COLORS } from './data/sprites.js';
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

  const npcTemplates = [SPR_NPC, SPR_NPC_ROBED, SPR_ANIMAL_SMALL, SPR_ANIMAL_LARGE, SPR_ANIMAL_BIRD];
  NPC_STYLES.forEach((style, i) => {
    const template = npcTemplates[style[3] || 0];
    const npcSprite = new PaletteSprite(template, PALETTE, { v: 31 });
    npcSprite.render(sheet, 32 + i * 16, 0, { H: style[0], S: style[1], P: style[2] });
    sheet.defineRegion(`npc_${i}`, 32 + i * 16, 0, 16, 16);
  });

  // Flower sprites - each flower has a unique shape
  FLOWER_COLORS.forEach((colors, i) => {
    const spriteData = FLOWER_SPRITES[i] || SPR_FLOWER;
    const flowerSprite = new PaletteSprite(spriteData, PALETTE, {});
    flowerSprite.render(sheet, i * 16, 32, { b: colors[0], u: colors[1], c: colors[2] });
    sheet.defineRegion(`flower_${i}`, i * 16, 32, 16, 16);
  });

  // Quest item sprite (glowing star at y=64)
  generateQuestItemSprite(sheet);

  // Tile sprites (at y=48)
  generateTiles(sheet);

  pipeline.registerWithRenderer(renderer);
  return pipeline;
}

function generateQuestItemSprite(sheet) {
  const P = PALETTE;
  const qy = 64;

  // 0: Clock (L1) - round face with hands
  const cx0 = 0;
  sheet.fillRect(cx0 + 5, qy + 2, 6, 1, P[18]);  // top rim
  sheet.fillRect(cx0 + 3, qy + 3, 10, 1, P[18]); // upper rim
  sheet.fillRect(cx0 + 2, qy + 4, 12, 8, P[10]); // gold body
  sheet.fillRect(cx0 + 4, qy + 5, 8, 6, P[36]);  // white face
  sheet.fillRect(cx0 + 3, qy + 12, 10, 1, P[18]); // lower rim
  sheet.fillRect(cx0 + 5, qy + 13, 6, 1, P[18]);  // bottom rim
  sheet.fillRect(cx0 + 7, qy + 5, 2, 1, P[5]);   // 12 marker
  sheet.fillRect(cx0 + 7, qy + 10, 2, 1, P[5]);  // 6 marker
  sheet.fillRect(cx0 + 4, qy + 7, 1, 2, P[5]);   // 9 marker
  sheet.fillRect(cx0 + 11, qy + 7, 1, 2, P[5]);  // 3 marker
  sheet.fillRect(cx0 + 8, qy + 6, 1, 3, P[5]);   // hour hand
  sheet.fillRect(cx0 + 8, qy + 7, 3, 1, P[5]);   // minute hand
  sheet.defineRegion('quest_0', cx0, qy, 16, 16);

  // 1: Toy Windmill (L2) - colorful pinwheel on stick
  const cx1 = 16;
  sheet.fillRect(cx1 + 7, qy + 8, 2, 7, P[6]);   // stick
  sheet.fillRect(cx1 + 6, qy + 6, 4, 4, P[10]);  // center hub
  sheet.fillRect(cx1 + 3, qy + 2, 3, 5, P[9]);   // top-left blade (red)
  sheet.fillRect(cx1 + 10, qy + 2, 3, 5, P[3]);  // top-right blade (blue)
  sheet.fillRect(cx1 + 3, qy + 9, 3, 5, P[33]);  // bottom-left blade (yellow)
  sheet.fillRect(cx1 + 10, qy + 9, 3, 5, P[11]); // bottom-right blade (green)
  sheet.fillRect(cx1 + 7, qy + 7, 2, 2, P[7]);   // center dot
  sheet.defineRegion('quest_1', cx1, qy, 16, 16);

  // 2: Smooth Brook Stone (L3) - rounded grey stone with blue sheen
  const cx2 = 32;
  sheet.fillRect(cx2 + 5, qy + 6, 6, 1, P[34]);  // top edge
  sheet.fillRect(cx2 + 4, qy + 7, 8, 5, P[18]);  // stone body
  sheet.fillRect(cx2 + 5, qy + 12, 6, 1, P[19]); // bottom edge
  sheet.fillRect(cx2 + 5, qy + 8, 5, 3, P[34]);  // highlight
  sheet.fillRect(cx2 + 6, qy + 8, 2, 1, P[14]);  // water sheen
  sheet.defineRegion('quest_2', cx2, qy, 16, 16);

  // 3: Vine Rope (L4) - coiled rope
  const cx3 = 48;
  sheet.fillRect(cx3 + 5, qy + 3, 6, 2, P[6]);   // top coil
  sheet.fillRect(cx3 + 4, qy + 5, 2, 6, P[6]);   // left side
  sheet.fillRect(cx3 + 10, qy + 5, 2, 6, P[6]);  // right side
  sheet.fillRect(cx3 + 5, qy + 11, 6, 2, P[6]);  // bottom coil
  sheet.fillRect(cx3 + 6, qy + 4, 4, 1, P[35]);  // inner shadow top
  sheet.fillRect(cx3 + 5, qy + 6, 1, 4, P[35]);  // inner shadow left
  sheet.fillRect(cx3 + 6, qy + 6, 4, 4, P[11]);  // inner green (vine)
  sheet.fillRect(cx3 + 3, qy + 10, 2, 3, P[6]);  // rope end
  sheet.defineRegion('quest_3', cx3, qy, 16, 16);

  // 4: Brass Spyglass (L5) - telescope tube with lens
  const cx4 = 64;
  sheet.fillRect(cx4 + 2, qy + 7, 12, 3, P[10]);  // gold tube
  sheet.fillRect(cx4 + 1, qy + 6, 3, 5, P[10]);   // wide end (eyepiece)
  sheet.fillRect(cx4 + 12, qy + 6, 3, 5, P[14]);  // lens (blue glass)
  sheet.fillRect(cx4 + 13, qy + 7, 1, 3, P[15]);  // lens rim
  sheet.fillRect(cx4 + 4, qy + 8, 7, 1, P[33]);   // highlight stripe
  sheet.fillRect(cx4 + 2, qy + 7, 1, 1, P[7]);    // eyepiece dot
  sheet.defineRegion('quest_4', cx4, qy, 16, 16);

  // 5: Lost Compass (L6) - similar but weathered/darker
  const cx5 = 80;
  sheet.fillRect(cx5 + 4, qy + 3, 8, 1, P[18]);  // top rim (grey)
  sheet.fillRect(cx5 + 3, qy + 4, 10, 8, P[18]); // grey body
  sheet.fillRect(cx5 + 4, qy + 12, 8, 1, P[19]); // bottom rim
  sheet.fillRect(cx5 + 5, qy + 5, 6, 6, P[16]);  // pale face
  sheet.fillRect(cx5 + 7, qy + 5, 2, 1, P[5]);   // N marker
  sheet.fillRect(cx5 + 7, qy + 10, 2, 1, P[5]);  // S marker
  sheet.fillRect(cx5 + 8, qy + 6, 1, 2, P[9]);   // needle N (red)
  sheet.fillRect(cx5 + 7, qy + 8, 1, 2, P[19]);  // needle S (dark)
  sheet.fillRect(cx5 + 5, qy + 6, 1, 1, P[19]);  // dirt/scratch
  sheet.fillRect(cx5 + 9, qy + 9, 1, 1, P[19]);  // dirt/scratch
  sheet.defineRegion('quest_5', cx5, qy, 16, 16);
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
  input.mapAction('hint', 'KeyH');

  const renderer = new RendererSystem(canvas, { width: 640, height: 480, bgColor: '#1a1a2e' });
  const cameraFollow = new CameraFollowSystem();
  const tileMapRenderer = new TileMapRenderer();
  const physics = new GridPhysics();
  const dialog = new DialogSystem({ typeSpeed: 35 });
  const audio = new AudioSystem();
  const scenes = new SceneManager();

  world.addSystem(input);
  world.addSystem(physics);
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
  scenes.register(new LevelScene());
  scenes.register(new EndingScene());

  // Music toggle button + M key
  const musicBtn = document.getElementById('music-toggle');
  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      const on = audio.toggleMusic();
      musicBtn.textContent = on ? '♪' : '♪✗';
      musicBtn.classList.toggle('muted', !on);
    });
  }
  window.addEventListener('keydown', e => {
    if (e.code === 'KeyM' && !e.repeat) {
      const on = audio.toggleMusic();
      if (musicBtn) {
        musicBtn.textContent = on ? '♪' : '♪✗';
        musicBtn.classList.toggle('muted', !on);
      }
    }
  });

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
