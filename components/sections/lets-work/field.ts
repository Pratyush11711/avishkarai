/**
 * Shared geometry for the closing-CTA particle field.
 *
 * Both the GPU-simulated field and the low-power canvas fallback seed from the
 * same distribution, so the wave silhouette is identical either way. The wave
 * mask here has a GLSL twin in `shaders.ts` — change one and you must change
 * the other.
 *
 * Coordinate space: x and y are both 0..1 across the *panel* (not the canvas),
 * with y running top to bottom.
 */

export const SHAPE_SQUARE = 0;
export const SHAPE_CIRCLE = 1;
export const SHAPE_CROSS = 2;
export const SHAPE_TRIANGLE = 3;

/**
 * Top of the drawing surface as a fraction of the panel, mirroring `top` on
 * `.lwt-canvas`. The canvas deliberately stops short of the fixed nav: a canvas
 * repainting behind a backdrop-filter forces the blur to be recomputed every
 * frame, which costs more than drawing the entire field.
 */
export const FIELD_TOP = 0.16;

/** How long a shape takes to scale in once its turn arrives. */
export const APPEAR_DURATION = 0.45;

export interface Particle {
  x: number;
  y: number;
  size: number;
  shape: number;
  rot: number;
  rotSpeed: number;
  phase: number;
  speed: number;
  /** How late this one joins the build-up — top-of-field shapes arrive last. */
  delay: number;
}

/** Wavy upper boundary of the field, in normalised panel height. */
export function fieldEdge(x: number) {
  return (
    0.44 +
    0.055 * Math.sin(x * 6.1 + 1.3) +
    0.035 * Math.sin(x * 12.7 + 3.9) +
    0.022 * Math.sin(x * 23.3 + 0.7)
  );
}

export function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * Rejection-samples shapes under the wave line, denser and larger toward the
 * bottom so the field reads as settling sand rather than an even cloud.
 */
export function buildField(count: number): Particle[] {
  const out: Particle[] = [];
  let guard = 0;

  while (out.length < count && guard < count * 60) {
    guard++;
    const x = Math.random();
    const y = Math.random();
    const edge = fieldEdge(x);
    if (y < edge) continue;

    // 0 at the ragged top edge, 1 at the bottom of the panel.
    const t = (y - edge) / Math.max(0.0001, 1 - edge);
    if (Math.random() > Math.min(1, t * 3 + 0.04)) continue;

    const r = Math.random();
    out.push({
      x,
      y,
      shape:
        r < 0.52
          ? SHAPE_SQUARE
          : r < 0.79
          ? SHAPE_CIRCLE
          : r < 0.93
          ? SHAPE_CROSS
          : SHAPE_TRIANGLE,
      size: (2.2 + t * 6.4) * (0.6 + Math.random() * 0.85),
      rot: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.28,
      phase: Math.random() * Math.PI * 2,
      speed: 0.35 + Math.random() * 0.55,
      delay: (1 - t) * 0.55,
    });
  }

  return out;
}
