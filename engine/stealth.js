import { System, registerComponent } from './core.js';

// Stealth enemy with patrol route and vision cone
export const StealthGuard = registerComponent('StealthGuard', {
  route: [],        // [{col, row}] patrol waypoints
  routeIdx: 0,
  speed: 2,         // tiles per second
  direction: 0,     // 0=up,1=right,2=down,3=left
  visionRange: 4,   // tiles forward
  visionArc: 60,    // degrees wide (cone)
  alertState: 0,    // 0=patrol, 1=alert, 2=chasing
  alertTimer: 0,
  moveTimer: 0,
  paused: false,
  // Subgrid interpolation
  gridCol: 0,
  gridRow: 0,
  moving: false,
  // Turn telegraph
  turning: false,
  turnTimer: 0,
  turnDir: -1,
  prevDir: -1,
});

const DIR_DX = [0, 1, 0, -1];
const DIR_DY = [-1, 0, 1, 0];

export class StealthSystem extends System {
  constructor() { super(200); }

  init(world) { world.globals.stealth = this; }

  update(dt) {
    const guards = this.query('StealthGuard', 'Position');
    const players = this.world.queryTag('player');
    if (!players.length) return;
    const player = players[0];
    const pPos = player.get('Position');
    const tileSize = 32;
    const pCol = Math.round(pPos.x / tileSize);
    const pRow = Math.round(pPos.y / tileSize);

    for (const guard of guards) {
      const sg = guard.get('StealthGuard');
      const pos = guard.get('Position');
      if (sg.paused) continue;

      // Freeze in place when spotting player (even during grace period)
      if (sg.alertState >= 1) {
        // Still interpolate to grid snap if mid-step, but don't start new moves
        if (sg.moving) {
          const tx = sg.gridCol * tileSize;
          const ty = sg.gridRow * tileSize;
          const step = tileSpeed * dt;
          const dx = tx - pos.x;
          const dy = ty - pos.y;
          if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
            pos.x += Math.abs(dx) <= step ? dx : Math.sign(dx) * step;
            pos.y += Math.abs(dy) <= step ? dy : Math.sign(dy) * step;
          } else {
            pos.x = tx; pos.y = ty; sg.moving = false;
            const spr = guard.get('Sprite');
            if (spr) spr.bobAmount = 0;
          }
        }
        continue;
      }

      const tileSpeed = sg.speed * tileSize; // px/s

      // Interpolate toward grid target
      if (sg.moving) {
        const tx = sg.gridCol * tileSize;
        const ty = sg.gridRow * tileSize;
        const step = tileSpeed * dt;
        const dx = tx - pos.x;
        const dy = ty - pos.y;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          pos.x += Math.abs(dx) <= step ? dx : Math.sign(dx) * step;
          pos.y += Math.abs(dy) <= step ? dy : Math.sign(dy) * step;
        } else {
          pos.x = tx;
          pos.y = ty;
          sg.moving = false;
          const spr = guard.get('Sprite');
          if (spr) spr.bobAmount = 0;
        }
      }

      // Handle turn telegraph — show alert, keep facing old direction
      if (sg.turning) {
        sg.turnTimer -= dt;
        sg.direction = sg.prevDir;
        if (sg.turnTimer <= 0) {
          sg.turning = false;
          sg.direction = sg.turnDir;
        }
        continue;
      }

      // Decide next step only when arrived
      if (!sg.moving && sg.route.length > 0) {
        sg.moveTimer += dt;
        const moveInterval = 1 / sg.speed;
        if (sg.moveTimer >= moveInterval) {
          sg.moveTimer = 0;
          const target = sg.route[sg.routeIdx];

          if (sg.gridCol === target.col && sg.gridRow === target.row) {
            sg.routeIdx = (sg.routeIdx + 1) % sg.route.length;
          } else {
            const dx = Math.sign(target.col - sg.gridCol);
            const dy = Math.sign(target.row - sg.gridRow);
            let newDir;
            if (dx === 1) newDir = 1;
            else if (dx === -1) newDir = 3;
            else if (dy === -1) newDir = 0;
            else newDir = 2;

            // Telegraph if direction changes
            if (newDir !== sg.direction) {
              sg.turning = true;
              sg.turnTimer = 1.2;
              sg.turnDir = newDir;
              sg.prevDir = sg.direction;
              continue;
            }

            const nextCol = sg.gridCol + dx;
            const nextRow = sg.gridRow + dy;
            // Skip move if tile is solid
            const tm = this.world.queryTag('tilemap')?.[0]?.get?.('TileMap');
            const tile = tm?.data[nextRow]?.[nextCol];
            if (tm && tile !== undefined && tm.solidTiles.includes(tile)) {
              sg.routeIdx = (sg.routeIdx + 1) % sg.route.length;
            } else {
              sg.gridCol = nextCol;
              sg.gridRow = nextRow;
              sg.moving = true;
              const spr = guard.get('Sprite');
              if (spr) spr.bobAmount = 2;
              sg.direction = newDir;
            }
          }
        }
      }
    }
  }

  // Called by scene after movement — uses authoritative grid position
  checkDetection(dt, pCol, pRow) {
    const guards = this.query('StealthGuard', 'Position');
    for (const guard of guards) {
      const sg = guard.get('StealthGuard');
      if (sg.paused || sg.turning) continue;

      const gCol = sg.gridCol;
      const gRow = sg.gridRow;
      const seesPlayer = this._isInVisionCone(gCol, gRow, sg.direction, sg.visionRange, sg.visionArc, pCol, pRow)
        && this._hasLineOfSight(gCol, gRow, pCol, pRow);

      if (seesPlayer) {
        if (sg.alertState === 0) {
          sg.alertState = 1;
          sg.alertTimer = 1.3;
        } else if (sg.alertState === 1) {
          sg.alertTimer -= dt;
          if (sg.alertTimer <= 0) {
            sg.alertState = 2;
            this._onDetected?.(guard);
          }
        }
      } else {
        if (sg.alertState === 1) sg.alertState = 0;
      }
    }
  }

  _isInVisionCone(gCol, gRow, dir, range, arcDeg, pCol, pRow) {
    const dx = pCol - gCol;
    const dy = pRow - gRow;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > range || dist === 0) return false;

    const facingAngle = dir * 90; // 0=up(-90), 1=right(0), 2=down(90), 3=left(180)
    const angles = [-90, 0, 90, 180];
    const fAngle = angles[dir];
    const pAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    let diff = Math.abs(pAngle - fAngle);
    if (diff > 180) diff = 360 - diff;
    return diff <= arcDeg / 2;
  }

  _hasLineOfSight(x0, y0, x1, y1) {
    // Bresenham line — check tilemap for solid tiles
    const tm = this.world.queryTag('tilemap')?.[0]?.get?.('TileMap');
    if (!tm?.data) return true;

    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy, cx = x0, cy = y0;

    while (cx !== x1 || cy !== y1) {
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; cx += sx; }
      if (e2 < dx) { err += dx; cy += sy; }
      if (cx === x1 && cy === y1) break;
      // Check if tile blocks vision (trees, walls, houses)
      const tile = tm.data[cy]?.[cx];
      if (tile !== undefined && tm.solidTiles.includes(tile)) return false;
    }
    return true;
  }

  onDetected(callback) { this._onDetected = callback; }

  // Get vision cone tiles for rendering
  getVisionTiles(guard) {
    const sg = guard.get('StealthGuard');
    const gCol = sg.gridCol;
    const gRow = sg.gridRow;
    const tiles = [];

    for (let r = -sg.visionRange; r <= sg.visionRange; r++) {
      for (let c = -sg.visionRange; c <= sg.visionRange; c++) {
        const tc = gCol + c, tr = gRow + r;
        if (this._isInVisionCone(gCol, gRow, sg.direction, sg.visionRange, sg.visionArc, tc, tr)) {
          if (this._hasLineOfSight(gCol, gRow, tc, tr)) {
            tiles.push({ col: tc, row: tr });
          }
        }
      }
    }
    return tiles;
  }
}
