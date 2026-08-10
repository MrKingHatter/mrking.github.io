/**
 * editor.js - Visual Level Editor for Flowers for Stefy
 * Paint tiles, place entities, export/import map data.
 */

// ===== TILE DEFINITIONS =====
const TILE_TYPES = [
  { id: 0, char: 'g', name: 'GRASS',   color: '#4a7c3f' },
  { id: 1, char: 'w', name: 'WATER',   color: '#2d6a9f' },
  { id: 2, char: 'p', name: 'PATH',    color: '#c4a96a' },
  { id: 3, char: 't', name: 'TREE',    color: '#1a4d1a' },
  { id: 4, char: 'W', name: 'WALL',    color: '#8a7a6a' },
  { id: 5, char: 'f', name: 'FLOWERS', color: '#d94f8a' },
  { id: 6, char: 's', name: 'SAND',    color: '#e8d5a3' },
  { id: 7, char: 'h', name: 'HOUSE',   color: '#8b5e3c' },
  { id: 8, char: 'b', name: 'BRIDGE',  color: '#9e7c5c' },
  { id: 9, char: 'r', name: 'ROCK',    color: '#6b6b6b' },
  { id: 10, char: 'B', name: 'BUSH',   color: '#3d6b2e' },
  { id: 11, char: 'd', name: 'DOOR',   color: '#a0522d' },
];

const ENTITY_TYPES = [
  { id: 'player', name: 'Player', icon: '🧑', color: '#ffd700' },
  { id: 'npc',    name: 'NPC',    icon: '👤', color: '#aed9e0' },
  { id: 'quest',  name: 'Quest Item', icon: '📦', color: '#ff8c00' },
  { id: 'flower', name: 'Flower', icon: '🌸', color: '#ff69b4' },
  { id: 'girl',   name: 'Girl',   icon: '💃', color: '#ff1493' },
];

const COLS = 50, ROWS = 30, TILE_SIZE = 24;
const CHAR_MAP = {};
TILE_TYPES.forEach(t => CHAR_MAP[t.char] = t.id);

// ===== EDITOR STATE =====
const state = {
  map: [],          // 2D array [row][col] of tile indices
  entities: [],     // [{type, x, y, ...}]
  selectedTile: 0,
  selectedEntity: null,
  brush: 'paint',
  brushSize: 1,
  showGrid: true,
  undoStack: [],
  redoStack: [],
  isDragging: false,
  rectStart: null,
  currentLevel: 0,
  dirty: false,
};

// ===== MAP OPERATIONS =====
function createEmptyMap() {
  const map = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      // Border of trees
      if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) row.push(3);
      else row.push(0); // grass
    }
    map.push(row);
  }
  return map;
}

function cloneMap(map) {
  return map.map(row => [...row]);
}

function parseMapString(rows) {
  return rows.map(row => [...row].map(ch => CHAR_MAP[ch] ?? 0));
}

function mapToString(map) {
  return map.map(row =>
    row.map(t => TILE_TYPES[t]?.char ?? 'g').join('')
  );
}

// ===== UNDO/REDO =====
function pushUndo() {
  state.undoStack.push({
    map: cloneMap(state.map),
    entities: JSON.parse(JSON.stringify(state.entities)),
  });
  state.redoStack = [];
  if (state.undoStack.length > 50) state.undoStack.shift();
  state.dirty = true;
}

function undo() {
  if (!state.undoStack.length) return;
  state.redoStack.push({
    map: cloneMap(state.map),
    entities: JSON.parse(JSON.stringify(state.entities)),
  });
  const snap = state.undoStack.pop();
  state.map = snap.map;
  state.entities = snap.entities;
  render();
}

function redo() {
  if (!state.redoStack.length) return;
  state.undoStack.push({
    map: cloneMap(state.map),
    entities: JSON.parse(JSON.stringify(state.entities)),
  });
  const snap = state.redoStack.pop();
  state.map = snap.map;
  state.entities = snap.entities;
  render();
}

// ===== FLOOD FILL =====
function floodFill(col, row, newTile) {
  const oldTile = state.map[row][col];
  if (oldTile === newTile) return;
  const stack = [[col, row]];
  while (stack.length) {
    const [c, r] = stack.pop();
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) continue;
    if (state.map[r][c] !== oldTile) continue;
    state.map[r][c] = newTile;
    stack.push([c - 1, r], [c + 1, r], [c, r - 1], [c, r + 1]);
  }
}

// ===== PAINT =====
function paintTile(col, row, tile) {
  const sz = state.brushSize;
  const half = Math.floor(sz / 2);
  for (let dr = -half; dr < sz - half; dr++) {
    for (let dc = -half; dc < sz - half; dc++) {
      const r = row + dr, c = col + dc;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        state.map[r][c] = tile;
      }
    }
  }
}

function paintRect(c1, r1, c2, r2, tile) {
  const minC = Math.min(c1, c2), maxC = Math.max(c1, c2);
  const minR = Math.min(r1, r2), maxR = Math.max(r1, r2);
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        state.map[r][c] = tile;
      }
    }
  }
}

// ===== ENTITY MANAGEMENT =====
function findEntityAt(col, row) {
  return state.entities.find(e => e.x === col && e.y === row);
}

function addEntity(type, col, row) {
  // Only one player allowed
  if (type === 'player') {
    state.entities = state.entities.filter(e => e.type !== 'player');
  }
  // Remove existing entity at this position
  state.entities = state.entities.filter(e => !(e.x === col && e.y === row));
  state.entities.push({ type, x: col, y: row });
}

function removeEntityAt(col, row) {
  state.entities = state.entities.filter(e => !(e.x === col && e.y === row));
}

// ===== RENDERING =====
const canvas = document.getElementById('editor-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = COLS * TILE_SIZE;
  canvas.height = ROWS * TILE_SIZE;
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw tiles
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = state.map[r]?.[c] ?? 0;
      const tt = TILE_TYPES[tile];
      ctx.fillStyle = tt?.color ?? '#000';
      ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }

  // Draw grid
  if (state.showGrid) {
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.5;
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * TILE_SIZE, 0);
      ctx.lineTo(c * TILE_SIZE, ROWS * TILE_SIZE);
      ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * TILE_SIZE);
      ctx.lineTo(COLS * TILE_SIZE, r * TILE_SIZE);
      ctx.stroke();
    }
  }

  // Draw rect preview
  if (state.brush === 'rect' && state.rectStart && state.isDragging) {
    const [c1, r1] = state.rectStart;
    const [c2, r2] = [state._hoverCol, state._hoverRow];
    const x = Math.min(c1, c2) * TILE_SIZE;
    const y = Math.min(r1, r2) * TILE_SIZE;
    const w = (Math.abs(c2 - c1) + 1) * TILE_SIZE;
    const h = (Math.abs(r2 - r1) + 1) * TILE_SIZE;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
  }

  // Draw entities
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const e of state.entities) {
    const et = ENTITY_TYPES.find(t => t.id === e.type);
    if (!et) continue;
    const cx = e.x * TILE_SIZE + TILE_SIZE / 2;
    const cy = e.y * TILE_SIZE + TILE_SIZE / 2;
    // Background circle
    ctx.fillStyle = et.color + '44';
    ctx.beginPath();
    ctx.arc(cx, cy, TILE_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = et.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Icon
    ctx.font = `${TILE_SIZE - 8}px serif`;
    ctx.fillStyle = '#fff';
    ctx.fillText(et.icon, cx, cy);
  }

  updateStatus();
}

// ===== UI SETUP =====
function buildPalette() {
  const palette = document.getElementById('tile-palette');
  palette.innerHTML = '';
  TILE_TYPES.forEach((t, i) => {
    const btn = document.createElement('div');
    btn.className = 'tile-btn' + (i === state.selectedTile ? ' active' : '');
    btn.style.background = t.color;
    btn.textContent = t.name.slice(0, 4);
    btn.title = `${t.name} (${t.char})`;
    btn.dataset.tile = i;
    btn.addEventListener('click', () => selectTile(i));
    palette.appendChild(btn);
  });
}

function buildEntityPalette() {
  const palette = document.getElementById('entity-palette');
  palette.innerHTML = '';
  ENTITY_TYPES.forEach(et => {
    const btn = document.createElement('button');
    btn.className = 'entity-btn' + (state.selectedEntity === et.id ? ' active' : '');
    btn.textContent = et.icon + ' ' + et.name;
    btn.title = et.name;
    btn.addEventListener('click', () => selectEntity(et.id));
    palette.appendChild(btn);
  });
  // Deselect button
  const clr = document.createElement('button');
  clr.className = 'entity-btn';
  clr.textContent = '✕ None';
  clr.addEventListener('click', () => selectEntity(null));
  palette.appendChild(clr);
}

function selectTile(idx) {
  state.selectedTile = idx;
  state.selectedEntity = null;
  buildPalette();
  buildEntityPalette();
  updateStatus();
}

function selectEntity(id) {
  state.selectedEntity = id;
  buildEntityPalette();
  updateStatus();
}

function selectBrush(brush) {
  state.brush = brush;
  document.querySelectorAll('[data-brush]').forEach(b => {
    b.classList.toggle('active', b.dataset.brush === brush);
  });
  updateStatus();
}

function buildLevelSelect() {
  const sel = document.getElementById('level-select');
  sel.innerHTML = '<option value="new">-- New Empty Map --</option>';
  for (let i = 1; i <= 7; i++) {
    sel.innerHTML += `<option value="${i}">Level ${i}</option>`;
  }
}

function updateStatus() {
  const pos = document.getElementById('status-pos');
  const tile = document.getElementById('status-tile');
  const tool = document.getElementById('status-tool');
  pos.textContent = `Pos: ${state._hoverCol ?? '-'}, ${state._hoverRow ?? '-'}`;
  const hTile = state.map[state._hoverRow]?.[state._hoverCol];
  tile.textContent = `Tile: ${TILE_TYPES[hTile]?.name ?? '-'}`;
  tool.textContent = state.selectedEntity
    ? `Entity: ${state.selectedEntity}`
    : `Tool: ${state.brush} | Tile: ${TILE_TYPES[state.selectedTile]?.name}`;
  document.getElementById('map-info').textContent = `${COLS}×${ROWS} | Entities: ${state.entities.length}`;
}

// ===== CANVAS EVENTS =====
function getTileCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const col = Math.floor((e.clientX - rect.left) / TILE_SIZE);
  const row = Math.floor((e.clientY - rect.top) / TILE_SIZE);
  return [
    Math.max(0, Math.min(COLS - 1, col)),
    Math.max(0, Math.min(ROWS - 1, row)),
  ];
}

canvas.addEventListener('mousedown', e => {
  e.preventDefault();
  const [col, row] = getTileCoords(e);

  // Right-click = pick tile
  if (e.button === 2) {
    const t = state.map[row][col];
    selectTile(t);
    return;
  }

  // Entity mode
  if (state.selectedEntity) {
    pushUndo();
    const existing = findEntityAt(col, row);
    if (existing && existing.type === state.selectedEntity) {
      removeEntityAt(col, row);
    } else {
      addEntity(state.selectedEntity, col, row);
    }
    render();
    return;
  }

  // Tile mode
  pushUndo();
  state.isDragging = true;

  if (state.brush === 'fill') {
    floodFill(col, row, state.selectedTile);
    state.isDragging = false;
  } else if (state.brush === 'rect') {
    state.rectStart = [col, row];
  } else if (state.brush === 'erase') {
    paintTile(col, row, 0);
  } else {
    paintTile(col, row, state.selectedTile);
  }
  render();
});

canvas.addEventListener('mousemove', e => {
  const [col, row] = getTileCoords(e);
  state._hoverCol = col;
  state._hoverRow = row;

  if (state.isDragging && !state.selectedEntity) {
    if (state.brush === 'paint') {
      paintTile(col, row, state.selectedTile);
    } else if (state.brush === 'erase') {
      paintTile(col, row, 0);
    }
    // rect mode just updates preview
    render();
  } else {
    updateStatus();
  }
});

canvas.addEventListener('mouseup', e => {
  if (state.isDragging && state.brush === 'rect' && state.rectStart) {
    const [col, row] = getTileCoords(e);
    paintRect(state.rectStart[0], state.rectStart[1], col, row, state.selectedTile);
    state.rectStart = null;
  }
  state.isDragging = false;
  render();
});

canvas.addEventListener('mouseleave', () => {
  state.isDragging = false;
  state.rectStart = null;
});

canvas.addEventListener('contextmenu', e => e.preventDefault());

// ===== KEYBOARD =====
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

  if (e.key === 'z' || e.key === 'Z') { e.ctrlKey ? (e.shiftKey ? redo() : undo()) : undo(); }
  if (e.key === 'y' && e.ctrlKey) redo();
  if (e.key === 'g' || e.key === 'G') { state.showGrid = !state.showGrid; render(); }
  if (e.key === 's' || e.key === 'S') { e.preventDefault(); showExport(); }
  if (e.key === 'Delete') selectBrush('erase');
  // Number keys select tiles
  const num = parseInt(e.key);
  if (num >= 0 && num <= 9 && num < TILE_TYPES.length) selectTile(num);
});

// ===== TOOLBAR BUTTONS =====
document.getElementById('btn-new').addEventListener('click', () => {
  if (state.dirty && !confirm('Discard current map?')) return;
  pushUndo();
  state.map = createEmptyMap();
  state.entities = [];
  state.dirty = false;
  render();
});

document.getElementById('btn-undo').addEventListener('click', undo);
document.getElementById('btn-redo').addEventListener('click', redo);
document.getElementById('btn-grid').addEventListener('click', () => {
  state.showGrid = !state.showGrid;
  render();
});

document.querySelectorAll('[data-brush]').forEach(btn => {
  btn.addEventListener('click', () => selectBrush(btn.dataset.brush));
});

document.getElementById('brush-size').addEventListener('input', e => {
  state.brushSize = parseInt(e.target.value);
  document.getElementById('brush-size-label').textContent = state.brushSize;
});

// ===== EXPORT =====
function showExport() {
  const rows = mapToString(state.map);
  let output = 'const MAP = parseMap([\n';
  output += rows.map(r => `  '${r}',`).join('\n');
  output += '\n]);\n';
  if (state.entities.length) {
    output += '\n// Entities:\n';
    state.entities.forEach(e => {
      output += `// ${e.type}: col=${e.x}, row=${e.y}\n`;
    });
  }
  document.getElementById('export-text').value = output;
  document.getElementById('export-modal').classList.add('show');
}

document.getElementById('btn-export').addEventListener('click', showExport);
document.getElementById('btn-close-export').addEventListener('click', () => {
  document.getElementById('export-modal').classList.remove('show');
});
document.getElementById('btn-copy').addEventListener('click', () => {
  const ta = document.getElementById('export-text');
  ta.select();
  navigator.clipboard.writeText(ta.value);
});

// ===== IMPORT =====
document.getElementById('btn-import').addEventListener('click', () => {
  const text = prompt('Paste map data (parseMap array rows, one per line):');
  if (!text) return;
  try {
    // Extract quoted strings
    const matches = text.match(/'[^']+'/g) || text.match(/"[^"]+"/g);
    if (!matches || matches.length === 0) throw new Error('No map rows found');
    const rows = matches.map(m => m.slice(1, -1));
    if (rows.length !== ROWS) throw new Error(`Expected ${ROWS} rows, got ${rows.length}`);
    if (rows.some(r => r.length !== COLS)) throw new Error(`All rows must be ${COLS} chars`);
    pushUndo();
    state.map = parseMapString(rows);
    render();
  } catch (err) {
    alert('Import failed: ' + err.message);
  }
});

// ===== LEVEL LOADING (from game data) =====
const LEVEL_MAPS = {};

async function loadGameLevels() {
  try {
    const mod = await import('./game/data/levels.js');
    for (let i = 1; i <= 7; i++) {
      if (mod.MAPS[i]) LEVEL_MAPS[i] = mod.MAPS[i];
    }
    // Also grab entity positions from LEVELS
    if (mod.LEVELS) {
      for (let i = 1; i <= 7; i++) {
        const lv = mod.LEVELS[i];
        if (!lv) continue;
        LEVEL_MAPS[`entities_${i}`] = [];
        if (lv.playerStart) {
          LEVEL_MAPS[`entities_${i}`].push({ type: 'player', x: lv.playerStart.x, y: lv.playerStart.y });
        }
        if (lv.npcs) {
          lv.npcs.forEach(n => {
            LEVEL_MAPS[`entities_${i}`].push({ type: 'npc', x: n.col, y: n.row });
          });
        }
        if (lv.questItems) {
          lv.questItems.forEach(q => {
            LEVEL_MAPS[`entities_${i}`].push({ type: 'quest', x: q.col, y: q.row });
          });
        }
        if (lv.items) {
          lv.items.forEach(it => {
            LEVEL_MAPS[`entities_${i}`].push({ type: 'flower', x: it.col, y: it.row });
          });
        }
        if (lv.girl) {
          LEVEL_MAPS[`entities_${i}`].push({ type: 'girl', x: lv.girl.col, y: lv.girl.row });
        }
      }
    }
  } catch (err) {
    console.warn('Could not load game levels:', err);
  }
}

document.getElementById('level-select').addEventListener('change', e => {
  const val = e.target.value;
  if (val === 'new') {
    state.map = createEmptyMap();
    state.entities = [];
  } else {
    const idx = parseInt(val);
    const mapData = LEVEL_MAPS[idx];
    if (mapData) {
      state.map = mapData.map(row => [...row]);
      state.entities = JSON.parse(JSON.stringify(LEVEL_MAPS[`entities_${idx}`] || []));
    }
  }
  state.undoStack = [];
  state.redoStack = [];
  state.dirty = false;
  state.currentLevel = val === 'new' ? 0 : parseInt(val);
  render();
});

// ===== INIT =====
async function init() {
  resizeCanvas();
  buildPalette();
  buildEntityPalette();
  buildLevelSelect();
  state.map = createEmptyMap();
  render();
  await loadGameLevels();
}

init();
