/**
 * flowers.js – Flower sprites and bouquet from game 1, self-contained with resolved colors.
 * 7 flowers: Cherry Blossom, Golden Tulip, Silver Lavender, Rainbow Orchid, Desert Rose, Danish Bluebell, Italian Sunflower
 */

const FLOWER_COLORS = [
  ['#ff9ecb','#fff59d','#2e7d32'], // 0: Cherry Blossom
  ['#ffeb3b','#ff9800','#2e7d32'], // 1: Golden Tulip
  ['#ce93d8','#ffffff','#2e7d32'], // 2: Silver Lavender
  ['#00bcd4','#9c27b0','#2e7d32'], // 3: Rainbow Orchid
  ['#e91e63','#ffeb3b','#2e7d32'], // 4: Desert Rose
  ['#29b6f6','#4a90d9','#2e7d32'], // 5: Danish Bluebell
  ['#ff9800','#8d6e63','#2e7d32'], // 6: Italian Sunflower
];

const FLOWER_NAMES = [
  'Cherry Blossom','Golden Tulip','Silver Lavender',
  'Rainbow Orchid','Desert Rose','Danish Bluebell','Italian Sunflower',
];

const SPRITES = [
  // 0: Cherry Blossom
  ['......bbb.......','....bbbbb......','.....bbbbbbb.....',
   '..bbbbbbbbbbb...','..bbbbb.u.bbbbb..','.bbbbb.u.bbbbb..',
   '.bbbbbuuubbbb...','.bbbbb.u.bbbbb..','.bbbbb.u.bbbbb..',
   '..bbbbbbbbbbb...','....bbbbbbb.....','.....bbbbb......',
   '......ccc.......','......ccc.......','.....ccccc......','................'],
  // 1: Golden Tulip
  ['................','......ubb.......','....uubbb......',
   '....uuubbbb.....','...uuuubbbbb....','...buuubbbbb....',
   '...bbbbbbbbb....','...bbbbbbbbb....','....bbbbbbb.....',
   '.....bbbbb......','......bbb.......','......ccc.......',
   '......ccc.......','.....ccccc......','................','................'],
  // 2: Silver Lavender
  ['.......b........','......bub.......','....bbbbb......',
   '....bbubbbb.....','...bbbbbbbbb....','...bbubbbubb....',
   '...bbbbbbbbb....','....bbubbbb.....','.....bbbbb......',
   '......bub.......','.......b........','......ccc.......',
   '......ccc.......','.....ccccc......','................','................'],
  // 3: Rainbow Orchid
  ['................','..bbb....bbb....','.bbbbb..bbbbb...',
   '.bbbbb..bbbbb...','..bbbbbbbbb.....','...bbuuubb......',
   '..bbuububbb.....','...bbuuubb......','..bbbbbbbbb.....',
   '.bbb......bbb...','.bb........bb...','......ccc.......',
   '......ccc.......','.....ccccc......','................','................'],
  // 4: Desert Rose
  ['................','....bbbbbbb.....','...bbbbbbbbb....',
   '..bbbb.b.bbbb...','..bbb.uuu.bbb...','.bbbb.uuu.bbbb..',
   '.bbbb.uuu.bbbb..','..bbb.uuu.bbb...','..bbbb.b.bbbb...',
   '...bbbbbbbbb....','....bbbbbbb.....','......ccc.......',
   '......ccc.......','.....ccccc......','................','................'],
  // 5: Danish Bluebell
  ['................','....bbbbbbb.....','...bbbbbbbbb....',
   '..bbbbbbbbbbb...','..bbbbbbbbbbb...','..bbbbuuubbbb...',
   '..bbbbuuubbbb...','..bbbbuuubbbb...','..bbbbbbbbbbb...',
   '...bbbbbbbbb....','....bbbbbbb.....','......ccc.......',
   '......ccc.......','.....ccccc......','................','................'],
  // 6: Italian Sunflower
  ['.b..b..b..b..b..','..bb.bb.bb.bb...','..bbbbbbbbbbb...',
   '.bbbbuuuuubbbb..','.bbbbuuuuubbbb..','.bbbbuuuuubbbb..',
   '.bbbbuuuuubbbb..','.bbbbuuuuubbbb..','..bbbbbbbbbbb...',
   '..bb.bb.bb.bb...','.b..b..b..b..b..','......ccc.......',
   '......ccc.......','.....ccccc......','................','................'],
];

export function drawFlower(ctx, idx, x, y, scale = 1) {
  const [petal, center, stem] = FLOWER_COLORS[idx] || FLOWER_COLORS[0];
  const rows = SPRITES[idx] || SPRITES[0];
  const map = { b: petal, u: center, c: stem };
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const color = map[rows[r][c]];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
      }
    }
  }
}

// Bouquet layout (cluster of 7 flowers in wrapping paper)
const LAYOUT = [
  { i:6, x:54, y:2 }, { i:4, x:44, y:7 }, { i:5, x:64, y:6 },
  { i:0, x:38, y:16 },{ i:1, x:50, y:18 },{ i:2, x:60, y:15 },{ i:3, x:70, y:17 },
];

export function drawBouquet(ctx, ox = 0, oy = 0, collected = 7) {
  // Stems
  for (let fi = 0; fi < LAYOUT.length; fi++) {
    if (fi >= collected) break;
    const f = LAYOUT[fi];
    const stemColor = FLOWER_COLORS[f.i][2];
    const sx = ox + f.x + 7, sy = ox ? oy + f.y + 10 : oy + f.y + 10;
    const ex = ox + 64, ey = oy + 55;
    const offset = sx - ex;
    ctx.strokeStyle = stemColor; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + offset * (Math.abs(offset) > 5 ? 0.4 : 0.12), (sy + ey) * 0.52, ex, ey);
    ctx.stroke();
  }
  // Paper
  const py = oy + 30;
  ctx.fillStyle = '#f5e6d0';
  ctx.beginPath(); ctx.moveTo(ox+42,py); ctx.lineTo(ox+86,py);
  ctx.lineTo(ox+74,py+38); ctx.lineTo(ox+54,py+38); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e8d5b8';
  ctx.beginPath(); ctx.moveTo(ox+46,py); ctx.lineTo(ox+57,py+38);
  ctx.lineTo(ox+54,py+38); ctx.lineTo(ox+42,py); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff9ecb'; ctx.fillRect(ox+56,py+5,16,3);
  ctx.fillStyle = '#e91e63'; ctx.fillRect(ox+62,py+3,4,3);
  // Blooms
  for (let fi = 0; fi < LAYOUT.length; fi++) {
    if (fi >= collected) break;
    const f = LAYOUT[fi];
    drawFlower(ctx, f.i, ox + f.x, oy + f.y, 1);
  }
}

export { FLOWER_COLORS, FLOWER_NAMES };
