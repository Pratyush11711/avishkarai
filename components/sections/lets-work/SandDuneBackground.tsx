"use client";

import { useEffect, useRef } from "react";

// ─── Tunables ────────────────────────────────────────────────────────────────
/** CSS px width of each height-field column. Smaller = smoother but more CPU. */
const CELL = 10;
/** Maximum height difference between adjacent columns before avalanche. */
const REPOSE = 4.5;
/** Fraction of excess height transferred per diffusion pass. */
const DIFF_RATE = 0.18;
/** Diffusion passes per animation frame (more = smoother settle). */
const DIFF_PASSES = 3;
/** Per-frame ease rate back toward the base (resting) height. */
const RELAX_RATE = 0.009;
/** Cursor influence radius in grid columns. */
const RISE_RADIUS = 9;
/** Max height (CSS px) added per frame at the cursor column. */
const MAX_RISE = 3.5;
/** Vertical spacing between stacked particles in a column (CSS px). */
const PARTICLE_GAP = 14;
/** Number of loose stray particles drifting above the pile. */
const STRAY_COUNT = 22;

// ─── Types ───────────────────────────────────────────────────────────────────
type Shape = "circle" | "square" | "diamond" | "cross" | "plus" | "triangle";

const SHAPE_POOL: Shape[] = [
  "circle", "circle", "circle",   // 30% — dominant dots
  "square", "square",              // 25% — squares / diamonds when rotated
  "diamond", "diamond",            // 20% — explicit 45° squares
  "cross", "cross",                // 15% — × marks
  "plus",                          //  7% — + marks
  "triangle",                      //  5% — triangles
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function rnd() { return Math.random(); }
function pick<T>(a: T[]): T { return a[Math.floor(rnd() * a.length)]; }
function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Hash-based value noise — deterministic, no seeding, range [0, 1]. */
function vhash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function vnoise(x: number) {
  const i = Math.floor(x), f = x - i;
  const u = f * f * (3 - 2 * f); // smoothstep
  return vhash(i) * (1 - u) + vhash(i + 1) * u;
}

/**
 * Draw one particle at (x, y) in physical (DPR-scaled) canvas coordinates.
 * `sizePx` is already in physical pixels.
 */
function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  x: number,
  y: number,
  sizePx: number
) {
  const h = sizePx * 0.5;
  switch (shape) {
    case "circle":
      ctx.beginPath();
      ctx.arc(x, y, h, 0, 6.2832);
      ctx.fill();
      break;
    case "square":
      ctx.fillRect(x - h, y - h, sizePx, sizePx);
      break;
    case "diamond":
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-h, -h, sizePx, sizePx);
      ctx.restore();
      break;
    case "cross":
      ctx.save();
      ctx.lineWidth = Math.max(1, sizePx * 0.24);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x - h, y - h); ctx.lineTo(x + h, y + h);
      ctx.moveTo(x + h, y - h); ctx.lineTo(x - h, y + h);
      ctx.stroke();
      ctx.restore();
      break;
    case "plus": {
      const bar = Math.max(1, sizePx * 0.24);
      ctx.fillRect(x - h, y - bar * 0.5, sizePx, bar);
      ctx.fillRect(x - bar * 0.5, y - h, bar, sizePx);
      break;
    }
    case "triangle":
      ctx.beginPath();
      ctx.moveTo(x, y - h);
      ctx.lineTo(x + h, y + h);
      ctx.lineTo(x - h, y + h);
      ctx.closePath();
      ctx.fill();
      break;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────
export interface SandDuneBackgroundProps {
  /** Particle fill/stroke colour. Default: white. */
  particleColor?: string;
  /**
   * Fraction of the container height the resting pile occupies.
   * 0.35 → pile takes the bottom 35% of the panel at rest.
   */
  restingHeightPercent?: number;
  /**
   * Multiplier on how high the cursor pushes the pile.
   * 1 = default; 2 = double-height peaks.
   */
  peakIntensity?: number;
}

export function SandDuneBackground({
  particleColor = "#ffffff",
  restingHeightPercent = 0.38,
  peakIntensity = 1,
}: SandDuneBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxRaw = canvas.getContext("2d", { alpha: true });
    if (!ctxRaw) return;

    // TypeScript loses narrowing inside nested closures, so pin as definite types.
    const cvs: HTMLCanvasElement = canvas;
    const ctx: CanvasRenderingContext2D = ctxRaw;

    // ── Shared mutable simulation state ────────────────────────────────────
    let dpr = 1, cssW = 0, cssH = 0, cols = 0;
    let heights: Float32Array;
    let baseH: Float32Array;

    /** Pre-seeded particle descriptor — position is stable, never recalculated. */
    interface Particle {
      /** Distance from the canvas bottom in CSS px. Sorted ascending per column. */
      relY: number;
      /** Horizontal offset from column centre in CSS px. */
      jit: number;
      shape: Shape;
      /** Base size in CSS px — scaled down near the pile top. */
      size: number;
      opacity: number;
    }
    let particles: Particle[][] = [];

    interface Stray {
      x: number; y: number; vx: number;
      phase: number; speed: number; amp: number;
      size: number; shape: Shape; opacity: number;
    }
    let strays: Stray[] = [];

    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, active: false };
    let prevMX = -9999, prevMY = -9999;
    let time = 0, lastT = 0, animId = 0;
    let resizeTimer: ReturnType<typeof setTimeout>;

    // ── Grid initialisation ─────────────────────────────────────────────────
    function setup() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const parent = cvs.parentElement ?? document.body;
      cssW = parent.clientWidth;
      cssH = parent.clientHeight;
      cvs.width  = Math.round(cssW * dpr);
      cvs.height = Math.round(cssH * dpr);

      cols    = Math.ceil(cssW / CELL) + 2;
      heights = new Float32Array(cols);
      baseH   = new Float32Array(cols);

      // Organic resting surface: sine wave + two octaves of value noise
      const avg = cssH * restingHeightPercent;
      for (let c = 0; c < cols; c++) {
        baseH[c] = avg
          +  9 * Math.sin(c * 0.043)
          + 12 * (vnoise(c * 0.09)       * 2 - 1)
          +  5 * (vnoise(c * 0.25 + 3.3) * 2 - 1);
        heights[c] = baseH[c];
      }

      // Pre-seed particle positions for every column.
      // relY is monotonically increasing so the render loop can break early.
      const maxH  = cssH * 0.95;
      const perCol = Math.ceil(maxH / PARTICLE_GAP) + 2;
      particles = Array.from({ length: cols }, () => {
        const col: Particle[] = [];
        for (let i = 0; i < perCol; i++) {
          col.push({
            relY:    i * PARTICLE_GAP + rnd() * PARTICLE_GAP * 0.5,
            jit:     (rnd() - 0.5) * CELL * 0.9,
            shape:   pick(SHAPE_POOL),
            size:    6 + rnd() * 8,
            opacity: 0.72 + rnd() * 0.28,
          });
        }
        return col;
      });

      // Stray loose particles floating in the open air above the pile
      strays = Array.from({ length: STRAY_COUNT }, () => ({
        x:       rnd() * cssW,
        y:       rnd() * cssH * 0.42,
        vx:      (rnd() - 0.5) * 0.28,
        phase:   rnd() * 6.2832,
        speed:   0.3 + rnd() * 0.5,
        amp:     3   + rnd() * 9,
        size:    4   + rnd() * 7,
        shape:   pick(SHAPE_POOL),
        opacity: 0.30 + rnd() * 0.50,
      }));
    }

    // ── Height-field simulation ─────────────────────────────────────────────
    function simulate() {

      // 1. CURSOR RISE — push sand up around the cursor position
      if (mouse.active) {
        const col0  = Math.floor(mouse.x / CELL);
        const vel   = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
        const bonus = Math.min(vel * 0.14, 2.5);  // faster cursor = more sand
        const rise  = (MAX_RISE + bonus) * peakIntensity;
        const sigma = RISE_RADIUS * 0.45;

        for (let dc = -RISE_RADIUS; dc <= RISE_RADIUS; dc++) {
          const c = col0 + dc;
          if (c < 0 || c >= cols) continue;
          const falloff = Math.exp(-(dc * dc) / (2 * sigma * sigma));
          heights[c] = Math.min(cssH * 0.94, heights[c] + rise * falloff);
        }
      }

      // 2. DIFFUSION — avalanche: transfer excess height between neighbours
      //    Run multiple passes for a smooth, stable settle.
      for (let pass = 0; pass < DIFF_PASSES; pass++) {
        for (let c = 1; c < cols - 1; c++) {
          const dL = heights[c] - heights[c - 1];
          if (Math.abs(dL) > REPOSE) {
            const xfer = (Math.abs(dL) - REPOSE) * DIFF_RATE * Math.sign(dL);
            heights[c]     -= xfer;
            heights[c - 1] += xfer;
          }
          const dR = heights[c] - heights[c + 1];
          if (Math.abs(dR) > REPOSE) {
            const xfer = (Math.abs(dR) - REPOSE) * DIFF_RATE * Math.sign(dR);
            heights[c]     -= xfer;
            heights[c + 1] += xfer;
          }
        }
      }

      // 3. Clamp to non-negative
      for (let c = 0; c < cols; c++) {
        if (heights[c] < 0) heights[c] = 0;
      }

      // 4. GLOBAL RELAXATION — columns ease back toward their resting baseline.
      //    At RELAX_RATE = 0.009, a fully disturbed column returns to base in ~2 s.
      for (let c = 0; c < cols; c++) {
        heights[c] += (baseH[c] - heights[c]) * RELAX_RATE;
      }
    }

    // ── Stray particle update ───────────────────────────────────────────────
    function updateStrays() {
      for (const sp of strays) {
        sp.x += sp.vx;
        sp.y += Math.sin(time * sp.speed + sp.phase) * 0.22;

        // Horizontal wrap
        if (sp.x < -30) sp.x = cssW + 30;
        if (sp.x > cssW + 30) sp.x = -30;

        // Prevent sinking into the pile
        const c = clamp(Math.floor(sp.x / CELL), 0, cols - 1);
        const pileTop = cssH - heights[c];
        if (sp.y > pileTop - 18) sp.y = pileTop - 18 - rnd() * 45;
        if (sp.y < 6) sp.y = 6;
      }
    }

    // ── Rendering ───────────────────────────────────────────────────────────
    function render() {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      ctx.fillStyle   = particleColor;
      ctx.strokeStyle = particleColor;

      // ── Sand pile ────────────────────────────────────────────────────────
      for (let col = 0; col < cols; col++) {
        const h = heights[col];
        if (h < 1) continue;

        const colParts = particles[col];
        const baseX    = col * CELL;

        for (let i = 0; i < colParts.length; i++) {
          const p = colParts[i];
          // relY is sorted ascending; break as soon as we exceed the pile height
          if (p.relY > h) break;

          // t = 0 at bottom (dense), t = 1 at top surface (sparse, smaller)
          const t    = p.relY / h;
          const sizePx = p.size * (1 - t * 0.55) * dpr;
          if (sizePx < 0.8) continue;

          const cx = (baseX + CELL * 0.5 + p.jit) * dpr;
          const cy = (cssH - p.relY) * dpr;

          // Slight opacity fade at the very top edge for a natural taper
          ctx.globalAlpha = p.opacity * (1 - t * 0.35);
          drawShape(ctx, p.shape, cx, cy, sizePx);
        }
      }

      ctx.globalAlpha = 1;

      // ── Stray particles ───────────────────────────────────────────────────
      for (const sp of strays) {
        ctx.globalAlpha = sp.opacity;
        drawShape(ctx, sp.shape, sp.x * dpr, sp.y * dpr, sp.size * dpr);
      }

      ctx.globalAlpha = 1;
    }

    // ── Main RAF loop ────────────────────────────────────────────────────────
    function loop(now: number) {
      const dt = lastT ? Math.min((now - lastT) / 1000, 0.05) : 1 / 60;
      lastT = now;
      time += dt;

      simulate();
      updateStrays();
      render();

      animId = requestAnimationFrame(loop);
    }

    // ── Event listeners ──────────────────────────────────────────────────────
    const onMove = (e: PointerEvent) => {
      const rect = cvs.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouse.vx = x - prevMX;
      mouse.vy = y - prevMY;
      prevMX = x; prevMY = y;
      mouse.x = x; mouse.y = y;
      mouse.active = true;
    };

    const onLeave = () => {
      mouse.active = false;
      mouse.vx = 0;
      mouse.vy = 0;
    };

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setup, 180);
    };

    // ── Bootstrap ────────────────────────────────────────────────────────────
    setup();
    animId = requestAnimationFrame(loop);

    cvs.addEventListener("pointermove", onMove);
    cvs.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(resizeTimer);
      cvs.removeEventListener("pointermove", onMove);
      cvs.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [particleColor, restingHeightPercent, peakIntensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        display: "block",
        pointerEvents: "auto",
      }}
    />
  );
}
