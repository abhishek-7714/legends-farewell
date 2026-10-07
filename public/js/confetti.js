// Dependency-free confetti burst on a throwaway canvas.
import { prefersReducedMotion } from './dom.js';

const COLORS = ['#F062B0', '#F26B2A', '#3D6BF5', '#F7E35A', '#C9D2F5', '#14684A'];

export function confettiBurst({ x = 0.5, y = 0.6, count = 160 } = {}) {
  if (prefersReducedMotion()) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = (canvas.width = innerWidth * dpr);
  const H = (canvas.height = innerHeight * dpr);
  const ctx = canvas.getContext('2d');

  const pieces = Array.from({ length: count }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
    const speed = (8 + Math.random() * 12) * dpr;
    return {
      x: x * W,
      y: y * H,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: (6 + Math.random() * 8) * dpr,
      h: (4 + Math.random() * 6) * dpr,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      tile: Math.random() < 0.12, // a few tiny "periodic tiles"
    };
  });

  const start = performance.now();
  function frame(now) {
    const t = now - start;
    ctx.clearRect(0, 0, W, H);
    for (const p of pieces) {
      p.vy += 0.35 * dpr;
      p.vx *= 0.99;
      p.vy *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t / 3200);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      const s = p.tile ? 2 : 1;
      ctx.fillRect((-p.w * s) / 2, (-p.w * s) / 2, p.w * s, (p.tile ? p.w : p.h) * s);
      ctx.restore();
    }
    if (t < 3200) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}
