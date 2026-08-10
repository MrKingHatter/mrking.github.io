/**
 * hints.js – Shared hint system for all levels.
 * Provides: directional arrow pointing toward goal, H-key text hint, pulsing goal glow.
 */

const HINT_COOLDOWN = 12; // seconds of inactivity before arrow appears
const ARROW_SIZE = 18;

export class HintSystem {
  constructor() {
    this._idleTimer = 0;
    this._arrowVisible = false;
    this._hintShown = false;
  }

  reset() {
    this._idleTimer = 0;
    this._arrowVisible = false;
    this._hintShown = false;
  }

  update(dt, playerMoved, input, dialog, hintText) {
    if (playerMoved) {
      this._idleTimer = 0;
      this._arrowVisible = false;
    } else {
      this._idleTimer += dt;
      if (this._idleTimer >= HINT_COOLDOWN) this._arrowVisible = true;
    }

    // H key shows text hint
    if (input?.isPressed('KeyH') && hintText && dialog && !dialog.active) {
      dialog.show([{ speaker: 'Mikkel', text: hintText }]);
      this._hintShown = true;
    }
  }

  renderArrow(ctx, playerX, playerY, goalX, goalY, camX, camY, canvasW, canvasH) {
    if (!this._arrowVisible) return;
    const dx = goalX - playerX, dy = goalY - playerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 64) return; // close enough, no arrow needed

    const angle = Math.atan2(dy, dx);
    const pulse = 0.4 + Math.sin(Date.now() / 300) * 0.3;

    // Draw arrow at screen edge pointing toward goal
    const cx = canvasW / 2, cy = canvasH / 2;
    const arrowDist = 60;
    const ax = cx + Math.cos(angle) * arrowDist;
    const ay = cy + Math.sin(angle) * arrowDist;

    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.translate(ax, ay);
    ctx.rotate(angle);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(ARROW_SIZE, 0);
    ctx.lineTo(-ARROW_SIZE * 0.4, -ARROW_SIZE * 0.5);
    ctx.lineTo(-ARROW_SIZE * 0.4, ARROW_SIZE * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  renderGoalGlow(ctx, goalScreenX, goalScreenY, color = '#ffd700') {
    const t = Date.now();
    const pulse = 0.5 + Math.sin(t / 250) * 0.4;
    const ring = 12 + Math.sin(t / 600) * 4;

    ctx.save();
    ctx.globalAlpha = pulse;
    // Outer glow ring
    const grad = ctx.createRadialGradient(goalScreenX, goalScreenY, 2, goalScreenX, goalScreenY, ring);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.fillRect(goalScreenX - ring, goalScreenY - ring, ring * 2, ring * 2);
    // Flower icon
    ctx.fillStyle = color;
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('✿', goalScreenX, goalScreenY);
    ctx.restore();
  }

  renderHintPrompt(ctx, canvasW, canvasH) {
    if (this._hintShown) return;
    if (this._idleTimer < 5) return;
    const pulse = 0.3 + Math.sin(Date.now() / 500) * 0.2;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'center';
    ctx.fillText('Press H for a hint', canvasW / 2, canvasH - 14);
    ctx.restore();
  }
}
