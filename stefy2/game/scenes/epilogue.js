/**
 * epilogue.js – Final scene after all 7 flowers are collected
 * Mikkel approaches Stefy, presents the bouquet, they talk.
 */
import { Scene } from '../../../engine/index.js';
import { drawBouquet } from '../data/flowers.js';
import { PALETTE, MIKKEL_RIGHT, STEFY_LEFT } from '../data/sprites.js';

const PAGES = [
  {
    lines: [
      'He lands in Piedmont with a bag full of pressed flowers',
      'and a credit card statement that would make Emma faint.',
      '',
      'Seven cities. Seven flowers. One frequent flyer program he doesn\'t have.',
    ],
  },
  {
    lines: [
      'She opens the door before he knocks.',
      '"I saw you from the window. You look like you slept in an airport."',
      '"Three airports actually. My personal best."',
      '"...Why do you have flowers."',
    ],
  },
  {
    lines: [
      '"The old ones died."',
      '"So you flew to seven countries. For replacement flowers."',
      '"When you say it like that it sounds unhinged."',
      '"It IS unhinged, Mikkel."',
      '"I prefer \'committed to quality floral arrangements.\'"',
      '"You are banned from making decisions."',
    ],
  },
  {
    lines: [
      'She takes the bouquet. She\'s trying not to smile. She\'s failing.',
      '"Cherry Blossom. You still can\'t eat octopus."',
      '"Golden Tulip. Still technically illegal."',
      '"Silver Lavender. Provence is still flat."',
      '"Rainbow Orchid. We are still trespassing."',
    ],
  },
  {
    lines: [
      '"Desert Rose. You moved your chair closer \u2018for the stars.\u2019"',
      '"The stars WERE nice."',
      '"Mikkel. The stars were behind us."',
      '"...I was studying Italian."',
      '"You don\'t speak Italian."',
      '"I was studying AN Italian."',
      '"MIKKEL."',
    ],
  },
  {
    lines: [
      '"Danish Bluebell. You burned the risotto."',
      '"You distracted me with your hair! That\'s a foul!"',
      '"I was reaching!"',
      '"You KNEW what you were doing."',
      '"I was reaching for CHEESE, Mikkel."',
    ],
  },
  {
    lines: [
      '"Italian Sunflower." She looks at the credit card receipt.',
      '"How much."',
      '"We don\'t talk about the credit card."',
      '"Emma will find out."',
      '"Emma must NEVER find out."',
      '"I\'m texting her right now."',
      '"STEFY."',
    ],
  },
  {
    lines: [
      '"So. Seven flowers. Seven countries. No frequent flyer miles."',
      '"I also learned one sentence in Italian."',
      '"Oh no."',
      '',
      'He says it. In Italian. Very badly.',
      '',
      '"That is the worst Italian I have ever heard."',
      '"I practiced on the plane."',
      '"Practice more. Then say it again."',
    ],
  },
];

// Sprite rendering helper — draws a 16x16 palette sprite at scale
function drawSpriteToCtx(ctx, spriteRows, palette, x, y, scale) {
  for (let row = 0; row < spriteRows.length; row++) {
    const line = spriteRows[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      if (ch === '0' || ch === '.' || ch === ' ') continue;
      const idx = parseInt(ch, 16);
      if (isNaN(idx) || idx === 0) continue;
      const color = palette[idx];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}

export class EpilogueScene extends Scene {
  constructor() {
    super('epilogue');
  }

  enter() {
    this.world?.globals?.audio?.setTrack('epilogue');
    this._canvas = document.getElementById('game-canvas');
    this._ctx = this._canvas.getContext('2d');
    this._phase = 'walk';       // walk → present → dialog → end
    this._walkTimer = 0;
    this._mikkelX = 80;         // start left
    this._stefyX = 480;         // Stefy stands right
    this._targetX = 340;        // Mikkel walks to here
    this._presentTimer = 0;
    this._pageIdx = 0;
    this._charIdx = 0;
    this._timer = 0;
    this._typeSpeed = 26;
    this._fadingOut = false;
    this._fadeTimer = 0;
    this._fadingIn = true;
    this._fadeInTimer = 0;
    this._endTimer = 0;
    this._done = false;
    this._showBouquet = false;
    this._bobTimer = 0;
    const overlay = document.getElementById('ui-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  update(dt) {
    if (this._done) return;
    const input = this.world?.globals?.input;
    this._bobTimer += dt;

    // Fade in
    if (this._fadingIn) {
      this._fadeInTimer += dt;
      if (this._fadeInTimer >= 1.0) {
        this._fadingIn = false;
        this._fadeInTimer = 1.0;
      }
      return;
    }

    if (this._phase === 'walk') {
      this._walkTimer += dt;
      const speed = 60;
      this._mikkelX += speed * dt;
      if (this._mikkelX >= this._targetX) {
        this._mikkelX = this._targetX;
        this._phase = 'present';
        this._presentTimer = 0;
      }
    } else if (this._phase === 'present') {
      this._presentTimer += dt;
      if (this._presentTimer >= 0.5) this._showBouquet = true;
      if (this._presentTimer >= 2.0) {
        this._phase = 'dialog';
        this._pageIdx = 0;
        this._charIdx = 0;
        this._timer = 0;
      }
    } else if (this._phase === 'dialog') {
      if (this._fadingOut) {
        this._fadeTimer += dt;
        if (this._fadeTimer >= 0.6) {
          this._fadingOut = false;
          this._fadeTimer = 0;
          this._pageIdx++;
          this._charIdx = 0;
          if (this._pageIdx >= PAGES.length) {
            this._phase = 'end';
            this._endTimer = 0;
          }
        }
        return;
      }

      const page = PAGES[this._pageIdx];
      const fullText = page.lines.join('\n');
      if (this._charIdx < fullText.length) {
        this._timer += dt;
        const chars = Math.floor(this._timer * this._typeSpeed);
        if (chars > 0) {
          const prev = this._charIdx;
          this._charIdx = Math.min(this._charIdx + chars, fullText.length);
          this._timer = 0;
          if ((this._charIdx - prev) > 0 && this._charIdx % 3 === 0) {
            this.world?.globals?.audio?.playBlip();
          }
        }
      }

      if (input?.isPressed('Space')) {
        if (this._charIdx < fullText.length) {
          this._charIdx = fullText.length;
        } else {
          this._fadingOut = true;
          this._fadeTimer = 0;
        }
      }
    } else if (this._phase === 'end') {
      this._endTimer += dt;
      if (input?.isPressed('Space') && this._endTimer >= 1.0) {
        this._done = true;
        this.world?.globals?.audio?.playTransition();
        this.manager.switchTo('title');
      }
    }
  }

  render() {
    const ctx = this._ctx;
    if (!ctx) return;
    const W = this._canvas.width;
    const H = this._canvas.height;

    // Warm evening gradient background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#1a0a2e');
    bg.addColorStop(0.4, '#2d1b4e');
    bg.addColorStop(0.7, '#4a2040');
    bg.addColorStop(1, '#1a0a1a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = '#ffffff';
    const starSeed = [23,67,134,189,234,312,378,412,456,501,534,578,612];
    for (const s of starSeed) {
      const sx = (s * 7 + 13) % W;
      const sy = (s * 3 + 7) % (H * 0.4);
      const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(this._bobTimer * 0.8 + s));
      ctx.globalAlpha = twinkle * 0.8;
      ctx.fillRect(sx, sy, 1, 1);
    }
    ctx.globalAlpha = 1;

    // Ground
    ctx.fillStyle = '#1a2a15';
    ctx.fillRect(0, H - 80, W, 80);
    ctx.fillStyle = '#243a1e';
    ctx.fillRect(0, H - 80, W, 3);

    // Fade in alpha
    let alpha = 1;
    if (this._fadingIn) alpha = this._fadeInTimer / 1.0;

    ctx.save();
    ctx.globalAlpha = alpha;

    const groundY = H - 80 - 32; // sprite bottom at ground level

    // Draw Stefy (facing left, standing still)
    const stefyBob = Math.sin(this._bobTimer * 1.2) * 1.5;
    drawSpriteToCtx(ctx, STEFY_LEFT, PALETTE,
      this._stefyX, groundY + stefyBob, 2);

    // Draw Mikkel (facing right, walking or standing)
    const mikkelBob = this._phase === 'walk'
      ? Math.sin(this._bobTimer * 6) * 2
      : Math.sin(this._bobTimer * 1.2 + 1) * 1.5;
    drawSpriteToCtx(ctx, MIKKEL_RIGHT, PALETTE,
      this._mikkelX, groundY + mikkelBob, 2);

    // Bouquet presentation
    if (this._showBouquet) {
      const bouquetAlpha = Math.min(1, (this._presentTimer - 0.5) / 0.8);
      ctx.globalAlpha = alpha * bouquetAlpha;
      const bx = (this._mikkelX + this._stefyX) / 2 - 48;
      const by = groundY - 50;
      drawBouquet(ctx, bx, by, 7);
      ctx.globalAlpha = alpha;
    }

    // Dialog overlay
    if (this._phase === 'dialog' && this._pageIdx < PAGES.length) {
      const page = PAGES[this._pageIdx];
      const fullText = page.lines.join('\n');
      const visible = fullText.slice(0, this._charIdx);
      const lines = visible.split('\n');

      let dialogAlpha = alpha;
      if (this._fadingOut) dialogAlpha = alpha * (1 - this._fadeTimer / 0.6);

      ctx.globalAlpha = dialogAlpha;
      ctx.font = '14px "Segoe UI", sans-serif';
      ctx.fillStyle = '#e8dcc8';
      ctx.textAlign = 'center';

      const lineH = 26;
      const startY = 40;
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], W / 2, startY + i * lineH);
      }

      // Prompt
      if (this._charIdx >= fullText.length && !this._fadingOut) {
        ctx.globalAlpha = dialogAlpha * (0.5 + 0.5 * Math.sin(Date.now() / 400));
        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.fillStyle = '#aed9e0';
        ctx.fillText('[ Space ]', W / 2, H - 20);
      }
    }

    // End phase — final text
    if (this._phase === 'end') {
      const endAlpha = Math.min(1, this._endTimer / 2.0);
      ctx.globalAlpha = alpha * endAlpha;

      ctx.font = '13px "Segoe UI", sans-serif';
      ctx.fillStyle = '#d4c8b0';
      ctx.textAlign = 'center';
      ctx.fillText('Seven flowers. Seven countries. Zero frequent flyer miles.', W / 2, 60);

      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.fillStyle = '#888';
      ctx.fillText('His Italian is still terrible. She doesn\'t mind.', W / 2, 90);

      ctx.font = '14px "Segoe UI", sans-serif';
      ctx.fillStyle = '#f0e6d3';
      ctx.fillText('Thank you for playing.', W / 2, H / 2 + 40);

      if (this._endTimer >= 1.0) {
        ctx.globalAlpha = alpha * endAlpha * (0.5 + 0.5 * Math.sin(Date.now() / 400));
        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.fillStyle = '#aed9e0';
        ctx.fillText('[ Space ]', W / 2, H / 2 + 70);
      }
    }

    ctx.restore();
  }

  exit() {
    const overlay = document.getElementById('ui-overlay');
    if (overlay) overlay.style.display = '';
  }
}
