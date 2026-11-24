/**
 * prologue.js – Story bridge between game 1 and game 2
 * Typewriter narration over fading backgrounds, then transitions to level select.
 */
import { Scene } from '../../../engine/index.js';

const PAGES = [
  {
    bg: '#0a0a1a',
    lines: [
      'Many months after that night in the park...',
      'The bouquet sits on Stefy\'s windowsill. Still in water.',
      'She sent him a photo. "Look! Still alive! I am good plant mother, no?"',
    ],
  },
  {
    bg: '#0d0d20',
    lines: [
      'But flowers don\'t last forever.',
      'One morning on video call, Mikkel notices the Cherry Blossom has curled.',
      'The Tulip droops. The Lavender looks... tired.',
    ],
  },
  {
    bg: '#0a0a1a',
    lines: [
      '"They are just flowers," she says, twisting her pretty dark hair around one finger.',
      'But she waters them every day. He\'s seen her do it mid-call.',
      '"I am... tending? Tending them." (She always asks if her English sounds weird.)',
    ],
  },
  {
    bg: '#0d0d20',
    lines: [
      'Tucked inside the vase, Stefy notices, a note. Nonna Rosa\'s handwriting.',
      'How long has it been there?',
    ],
  },
  {
    bg: '#0a0a1a',
    lines: [
      '"Flowers given with heart don\'t have to die.',
      'But if they do, you go back. You find new ones.',
      'You remember why each one mattered. And you bring them home."',
    ],
  },
  {
    bg: '#0d0d20',
    lines: [
      'Seven flowers. Seven cities. Seven memories.',
      'New flowers. Same cities. Same reasons.',
      'Time to go back.',
    ],
  },
  {
    bg: '#0a0a1a',
    lines: [
      'It\'s not that the memories are gone.',
      'It\'s that effort is required. Even from 1500 km away. Especially from 1500 km away.',
      'Time to prove he\'d do it all again. (He absolutely would. Don\'t tell her.)',
    ],
  },
];

export class PrologueScene extends Scene {
  constructor() {
    super('prologue');
    this._pageIdx = 0;
    this._lineIdx = 0;
    this._charIdx = 0;
    this._timer = 0;
    this._typeSpeed = 28;
    this._fadingOut = false;
    this._fadeTimer = 0;
    this._done = false;
    this._skipHeld = false;
    this._canvas = null;
    this._ctx = null;
  }

  enter() {
    this.world?.globals?.audio?.setTrack('prologue');
    this._pageIdx = 0;
    this._lineIdx = 0;
    this._charIdx = 0;
    this._timer = 0;
    this._done = false;
    this._fadingOut = false;
    this._fadeTimer = 0;
    this._canvas = document.getElementById('game-canvas');
    this._ctx = this._canvas.getContext('2d');
    document.getElementById('title-screen').style.display = 'none';
  }

  update(dt) {
    if (this._done) return;
    const input = this.world?.globals?.input;

    if (this._fadingOut) {
      this._fadeTimer += dt;
      if (this._fadeTimer >= 0.6) {
        this._fadingOut = false;
        this._fadeTimer = 0;
        this._pageIdx++;
        this._lineIdx = 0;
        this._charIdx = 0;
        if (this._pageIdx >= PAGES.length) {
          this._done = true;
          this.world?.globals?.audio?.playTransition();
          this.manager.switchTo('stealth', { levelIdx: 0 });
          return;
        }
      }
      return;
    }

    // Typewriter
    const page = PAGES[this._pageIdx];
    const fullText = page.lines.join('\n');
    if (this._charIdx < fullText.length) {
      this._timer += dt;
      const chars = Math.floor(this._timer * this._typeSpeed);
      if (chars > 0) {
        this._charIdx = Math.min(this._charIdx + chars, fullText.length);
        this._timer = 0;
      }
    }

    // Advance on Space
    if (input?.isPressed('Space')) {
      if (this._charIdx < fullText.length) {
        this._charIdx = fullText.length;
      } else {
        this._fadingOut = true;
        this._fadeTimer = 0;
      }
    }
  }

  render() {
    const ctx = this._ctx;
    if (!ctx) return;
    const W = this._canvas.width;
    const H = this._canvas.height;
    const page = PAGES[this._pageIdx];
    if (!page) return;

    // Background
    ctx.fillStyle = page.bg;
    ctx.fillRect(0, 0, W, H);

    // Fade effect
    let alpha = 1;
    if (this._fadingOut) {
      alpha = 1 - this._fadeTimer / 0.6;
    }

    // Draw typed text
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '15px "Segoe UI", sans-serif';
    ctx.fillStyle = '#d4c8b0';
    ctx.textAlign = 'center';

    const fullText = page.lines.join('\n');
    const visible = fullText.slice(0, this._charIdx);
    const lines = visible.split('\n');
    const lineHeight = 28;
    const startY = H / 2 - (page.lines.length * lineHeight) / 2;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], W / 2, startY + i * lineHeight);
    }

    // Prompt
    if (this._charIdx >= fullText.length) {
      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.fillStyle = '#aed9e0';
      ctx.globalAlpha = alpha * (0.5 + Math.sin(Date.now() / 300) * 0.3);
      ctx.fillText('Press Space to continue', W / 2, H - 40);
    }
    ctx.restore();
  }

  exit() {}
}
