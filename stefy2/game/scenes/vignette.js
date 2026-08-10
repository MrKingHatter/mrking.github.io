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
      'The garden. He remembers.',
      '',
      'Third date. She pointed at some stars.',
      '"That W shape? Cassiopeia. Like a crown, see?"',
      'He had no idea. He nodded very seriously.',
      'She knew he was faking. Called him out immediately.',
      '',
      'She taught him that one in three languages.',
      'He forgot all three. But he remembers her face doing it.',
    ],
    restored: 'The Cherry Blossom opens. Pink. Dramatic. On brand.',
  },
  { // Level 2: Netherlands -- Golden Tulip
    flower: 'Golden Tulip',
    color: '#ffd700',
    memory: [
      'The canal. He remembers.',
      '',
      'Somewhere between Delft and Den Haag. No signal.',
      '"Let\'s just walk until we find water." Her idea. Obviously.',
      'They found a canal, then a cheese shop with an old man',
      'who gave them free samples and unsolicited life advice.',
      '',
      '"Cheese is like people. Better with age." OK sir.',
      'She translated it into Italian for no reason. Show off.',
    ],
    restored: 'The Golden Tulip opens. Smells faintly of gouda.',
  },
  { // Level 3: Provence -- Silver Lavender
    flower: 'Silver Lavender',
    color: '#b19cd9',
    memory: [
      'Lavender. He remembers.',
      '',
      'She was running ahead through the field. Dark hair, zero coordination.',
      'He was losing badly. "You\'re so slow!" "You have shorter legs!"',
      'She tripped. He caught her. Barely. Mostly by accident.',
      '',
      '"Nice reflexes." "Thanks I panicked."',
      'She smelled like lavender for the rest of the day.',
      'He noticed. Didn\'t say anything. Obviously.',
    ],
    restored: 'The Silver Lavender blooms. Purple and slightly smug about it.',
  },
  { // Level 4: Amazon -- Rainbow Orchid
    flower: 'Rainbow Orchid',
    color: '#ff6b9d',
    memory: [
      'The storm. He remembers.',
      '',
      'Thunderstorm. Market awning. Two idiots without umbrellas.',
      'She was shivering. He gave her his jacket. She said "finally."',
      'Like she\'d been WAITING for him to offer. Unbelievable.',
      '',
      'They stood there watching the rain for twenty minutes.',
      'Neither suggested leaving. Neither mentioned it after.',
    ],
    restored: 'The Rainbow Orchid unfurls. Dramatic. Like that day.',
  },
  { // Level 5: Morocco -- Desert Rose
    flower: 'Desert Rose',
    color: '#e8a87c',
    memory: [
      'The quiet. He remembers.',
      '',
      'A riad garden. Jasmine everywhere.',
      'She was reading a recipe book. He was "reading."',
      'Actually he was watching her mouth the ingredients.',
      '',
      'She caught him looking. "What?" "Nothing."',
      'She didn\'t believe him. He didn\'t try harder.',
      'They went back to "reading."',
    ],
    restored: 'The Desert Rose warms. Smug little flower.',
  },
  { // Level 6: Denmark -- Danish Bluebell
    flower: 'Danish Bluebell',
    color: '#6eb5ff',
    memory: [
      'The walk. He remembers.',
      '',
      'November. Copenhagen. Their breath making clouds.',
      'The whole walk home he was trying to say something.',
      'Something about wanting to do this again. Couldn\'t find the words.',
      'She said "godnat" at the door. Perfect pronunciation.',
      '',
      'He said "...yeah. Night. Goodnight. Bye." Nailed it.',
      'She was already inside. Probably for the best.',
    ],
    restored: 'The Danish Bluebell lifts. Small and stubborn. Relatable.',
  },
  { // Level 7: Italy -- Italian Sunflower
    flower: 'Italian Sunflower',
    color: '#f4c430',
    memory: [
      'Everything. All at once.',
      '',
      'The hill above her town. Golden hour.',
      'The bouquet behind his back. Seven flowers from seven cities.',
      'Her face when she saw. "You went everywhere?"',
      '"I had frequent flyer miles." (He did not have frequent flyer miles.)',
      '',
      'She laughed. Then she didn\'t laugh.',
      'Then she said something in Italian he didn\'t catch.',
      'He\'s going to learn Italian. Eventually. Probably.',
    ],
    restored: 'The Italian Sunflower rises. Bouquet complete. Now what.',
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
