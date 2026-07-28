/**
 * ending.js - Ending Screen Scene
 */

import { Scene } from '../../engine/index.js';

export class EndingScene extends Scene {
  constructor() {
    super('ending');
  }

  enter() {}

  update(dt) {
    const input = this.world.globals.input;
    if (input.actionPressed('interact')) {
      this.manager.transitionTo('title');
    }
  }

  render(dt) {
    const renderer = this.world.globals.renderer;
    if (!renderer) return;
    const ctx = renderer.ctx;
    const W = renderer.width, H = renderer.height;

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

  exit() {}
}
