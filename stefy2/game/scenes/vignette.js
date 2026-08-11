/**
 * vignette.js – Post-level memory flashback scene
 * Shows the recovered memory, then the flower blooming again.
 */
import { Scene } from '../../../engine/index.js';
import { drawFlower, drawBouquet } from '../data/flowers.js';

const LEVEL_ORDER = ['stealth','puzzle','chase','explore','trade','precision','finale'];

// Each level's memory vignette: what Mikkel remembers when the flower is saved
const VIGNETTES = [
  { // Level 1: Tokyo -- Cherry Blossom
    flower: 'Cherry Blossom',
    color: '#ffb7c5',
    memory: [
      'The menu. He remembers.',
      '',
      'He picked the restaurant. No English menu. Power move.',
      'She ordered for both of them. In Japanese.',
      'She did well.',
      '',
      'It was octopus. She loved it.',
      'He smiled and chewed and tried not to think about it.',
      '"You hate it." "I am having a GREAT time."',
      '"Your eye is twitching, Mikkel."',
      'He finished the plate. She ordered him another. Rude.',
    ],
    restored: 'The Cherry Blossom opens. He still can\'t eat octopus.',
  },
  { // Level 2: Netherlands -- Golden Tulip
    flower: 'Golden Tulip',
    color: '#ffd700',
    memory: [
      'The bike. He remembers.',
      '',
      'Tandem bicycle. Her idea. "It\'ll be romantic!"',
      'She couldn\'t reach the pedals. He did all the work.',
      'She did all the steering. Into a tulip field.',
      '...',
      '"I meant to do that." She did not mean to do that.',
      'She picked a tulip. Technically illegal.',
      '"If we get arrested it\'s your fault." "Worth it."',
      'She put it behind his ear and called him pretty.',
      'He\'d still be wearing it if wind didn\'t exist.',
    ],
    restored: 'The Golden Tulip opens. Technically still illegal.',
  },
  { // Level 3: Provence -- Silver Lavender
    flower: 'Silver Lavender',
    color: '#b19cd9',
    memory: [
      'The race. He remembers.',
      '',
      'Outside Valensole. Her idea. Obviously.',
      '"First to that tree!" Half a kilometer away. Great.',
      'She bolted. Three-second head start... Cheating!',
      'He caught up. She grabbed his shirt to slow him down.',
      '"That\'s cheating." "Skill issue."',
      '',
      'She tripped at the finish. He caught her.',
      'She smelled like lavender and bad decisions.',
      'Stayed in his arms one second too long. Blamed the altitude.',
      '...Provence is flat.',
    ],
    restored: 'The Silver Lavender blooms. Provence is still flat.',
  },
  { // Level 4: Amazon -- Rainbow Orchid
    flower: 'Rainbow Orchid',
    color: '#ff6b9d',
    memory: [
      'The detour. He remembers.',
      '',
      'Gate said "Privado." She read it. Walked straight in.',
      'He stood there. "Stefy." "Coming?"',
      'What was he going to do, he can\' say no to pretty hair. He went in.',
      '',
      'Orchids bigger than his hand. She forgot to breathe.',
      'Then photographed him looking at her looking at orchids.',
      '"Evidence." Of what? She didn\'t specify.',
      'The owner appeared. Very large. Very unimpressed.',
      'They ran. She couldn\'t stop laughing.',
    ],
    restored: 'The Rainbow Orchid unfurls. Worth the trespassing.',
  },
  { // Level 5: Morocco -- Desert Rose
    flower: 'Desert Rose',
    color: '#e8a87c',
    memory: [
      'The hidden flower field. He remembers.',
      '',
      'Riad garden. Watching stars he\'d never seen from Denmark.',
      'She was reading recipes out loud. Italian. His weakness.',
      'He was "reading." He was watching her hair.',
      'Mascarpone. Nocciola. Vaniglia.',
      '',
      '"You\'re staring." "I\'m studying Italian."',
      '"You don\'t speak Italian." "I\'m studying 𝒶𝓃 Italian."',
      'He moved his chair closer. "Better view of the stars."',
      'The stars were behind them. He knew that.',
    ],
    restored: 'The Desert Rose warms. This view is better.',
  },
  { // Level 6: Denmark -- Danish Bluebell
    flower: 'Danish Bluebell',
    color: '#6eb5ff',
    memory: [
      'The kitchen. He remembers.',
      '',
      'She was making risotto. His kitchen. Her rules.',
      '"Stir. Don\'t stop stirring." He stirred.',
      'She reached past him for the parmesan.',
      '',
      'Her hair brushed his neck. He forgot the recipe.',
      '"MIKKEL. MIX MIX MIX." Right. Right. Mixing.',
      'The risotto was perfect. He burned his tongue on the first bite.',
      'Ate three bowls. Couldn\'t tell you what it tasted like.',
    ],
    restored: 'The Danish Bluebell lifts. He still can\'t make risotto.',
  },
  { // Level 7: Italy -- Italian Sunflower
    flower: 'Italian Sunflower',
    color: '#f4c430',
    memory: [
      'The hill. All of it.',
      '',
      'Golden hour. Her town. Sunflowers almost taller than him.',
      'Seven flowers behind his back. Seven cities on his credit card.',
      'Her face when she saw them. "You went EVERYWHERE?"',
      '"I had frequent flyer miles." He did not have frequent flyer miles.',
      '',
      'She said something in Italian. Fast. He caught zero of it.',
      'He\'s going to learn Italian. After he pays off the flights.',
    ],
    restored: 'The Italian Sunflower rises. He still doesn\'t speak Italian.',
  },
];

export class VignetteScene extends Scene {
  constructor() {
    super('vignette');
    this._levelIdx = 0;
    this._charIdx = 0;
    this._timer = 0;
    this._phase = 'memory'; // 'memory' → 'restored' → 'done'
    this._fadeTimer = 0;
    this._fadingIn = true;
    this._fadingOut = false;
    this._canvas = null;
    this._ctx = null;
  }

  enter(params) {
    this.world?.globals?.audio?.setTrack('vignette');
    this._levelIdx = params?.levelIdx ?? 0;
    this._charIdx = 0;
    this._timer = 0;
    this._phase = 'memory';
    this._fadeTimer = 0;
    this._fadingIn = true;
    this._fadingOut = false;
    this._canvas = document.getElementById('game-canvas');
    this._ctx = this._canvas.getContext('2d');
  }

  update(dt) {
    const input = this.world?.globals?.input;
    const v = VIGNETTES[this._levelIdx];
    if (!v) return;

    // Fade in
    if (this._fadingIn) {
      this._fadeTimer += dt;
      if (this._fadeTimer >= 0.8) { this._fadingIn = false; this._fadeTimer = 0; }
      return;
    }

    // Fade out → next level
    if (this._fadingOut) {
      this._fadeTimer += dt;
      if (this._fadeTimer >= 0.8) {
        const nextIdx = this._levelIdx + 1;
        this.world?.globals?.audio?.playTransition();
        if (nextIdx < LEVEL_ORDER.length) {
          this.manager.switchTo(LEVEL_ORDER[nextIdx], { levelIdx: nextIdx });
        } else {
          this.manager.switchTo('title');
        }
      }
      return;
    }

    if (this._phase === 'memory') {
      const fullText = v.memory.join('\n');
      if (this._charIdx < fullText.length) {
        this._timer += dt;
        const chars = Math.floor(this._timer * 30);
        if (chars > 0) {
          this._charIdx = Math.min(this._charIdx + chars, fullText.length);
          this._timer = 0;
        }
      }
      if (input?.isPressed('Space')) {
        if (this._charIdx < fullText.length) {
          this._charIdx = fullText.length;
        } else {
          this._phase = 'restored';
          this._charIdx = 0;
          this._timer = 0;
        }
      }
    } else if (this._phase === 'restored') {
      const fullText = v.restored;
      if (this._charIdx < fullText.length) {
        this._timer += dt;
        const chars = Math.floor(this._timer * 25);
        if (chars > 0) {
          this._charIdx = Math.min(this._charIdx + chars, fullText.length);
          this._timer = 0;
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
    }
  }

  render() {
    const ctx = this._ctx;
    if (!ctx) return;
    const W = this._canvas.width;
    const H = this._canvas.height;
    const v = VIGNETTES[this._levelIdx];
    if (!v) return;

    // Dark bg
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, W, H);

    // Overall alpha for fade in/out
    let alpha = 1;
    if (this._fadingIn) alpha = this._fadeTimer / 0.8;
    if (this._fadingOut) alpha = 1 - this._fadeTimer / 0.8;

    ctx.save();
    ctx.globalAlpha = alpha;

    if (this._phase === 'memory') {
      // Draw memory text
      ctx.font = '14px "Segoe UI", sans-serif';
      ctx.fillStyle = '#c8c0b0';
      ctx.textAlign = 'center';
      const fullText = v.memory.join('\n');
      const visible = fullText.slice(0, this._charIdx);
      const lines = visible.split('\n');
      const lineH = 26;
      const startY = H / 2 - (v.memory.length * lineH) / 2;
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], W / 2, startY + i * lineH);
      }
    } else if (this._phase === 'restored') {
      // Draw flower glow circle
      const grad = ctx.createRadialGradient(W / 2, H / 2 - 40, 5, W / 2, H / 2 - 40, 80);
      grad.addColorStop(0, v.color + 'aa');
      grad.addColorStop(1, v.color + '00');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Draw actual flower sprite
      drawFlower(ctx, this._levelIdx, W / 2 - 24, H / 2 - 80, 3);

      // For last level, draw full bouquet below
      if (this._levelIdx === 6) {
        drawBouquet(ctx, W / 2 - 64, H / 2 + 40, 7);
      }

      // Flower name
      ctx.font = 'bold 20px "Segoe UI", sans-serif';
      ctx.fillStyle = v.color;
      ctx.textAlign = 'center';
      ctx.fillText(v.flower, W / 2, H / 2 - 20);

      // Restored text
      ctx.font = '15px "Segoe UI", sans-serif';
      ctx.fillStyle = '#d4c8b0';
      const visibleR = v.restored.slice(0, this._charIdx);
      ctx.fillText(visibleR, W / 2, H / 2 + 20);

      // Prompt
      if (this._charIdx >= v.restored.length) {
        ctx.globalAlpha = alpha * (0.5 + 0.5 * Math.sin(Date.now() / 400));
        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.fillStyle = '#888';
        ctx.fillText('[ Space ]', W / 2, H - 40);
      }
    }

    // Prompt for memory phase
    if (this._phase === 'memory') {
      const fullText = v.memory.join('\n');
      if (this._charIdx >= fullText.length) {
        ctx.globalAlpha = alpha * (0.5 + 0.5 * Math.sin(Date.now() / 400));
        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.fillStyle = '#888';
        ctx.textAlign = 'center';
        ctx.fillText('[ Space ]', W / 2, H - 40);
      }
    }

    ctx.restore();
  }
}
