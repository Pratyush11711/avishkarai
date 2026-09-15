"use client";

import { useEffect, useRef } from "react";
import lineReelPath from "./line-reel-path.json";

/**
 * Port of Lusion `Line` / `line_reel` from hoisted.CUO_IjfL.js.
 *
 * showRatio = quadInOut(saturate(-(screenY - 0.4*vh) / (1.3*vh)))
 * inner.x = -0.05 * diagonal
 * inner.y = -0.8 * diagonal - screenY   (Y-up, origin at viewport top)
 * scale   = diagonal
 * tip rides CP[showRatio] at the same radius as the stroke
 */
const PATH = lineReelPath as [number, number][];
const MARGIN_X = -0.05;
const MARGIN_Y = -0.8;
const START = 0.4;
const DISTANCE = 1.3;
const SAMPLES_PER_SEG = 10;

type Pt = { x: number; y: number };

function saturate(v: number) {
  return Math.min(1, Math.max(0, v));
}

function quadInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function fit(v: number, a: number, b: number, c: number, d: number) {
  return c + saturate((v - a) / (b - a)) * (d - c);
}

function rgb2hsv(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
    if (h < 0) h += 1;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

function hsv2rgb(h: number, s: number, v: number) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      return { r: v, g: t, b: p };
    case 1:
      return { r: q, g: v, b: p };
    case 2:
      return { r: p, g: v, b: t };
    case 3:
      return { r: p, g: q, b: v };
    case 4:
      return { r: t, g: p, b: v };
    default:
      return { r: v, g: p, b: q };
  }
}

function colorAt(lineRatio: number) {
  const mix = 1 - (1 - saturate(lineRatio)) ** 2;
  const a = rgb2hsv(0x2a / 255, 0x38 / 255, 0xee / 255);
  const b = rgb2hsv(0x5a / 255, 0x90 / 255, 0xff / 255);
  const d = ((b.h - a.h + 1.5) % 1) - 0.5;
  const rgb = hsv2rgb(a.h + d * mix, a.s + (b.s - a.s) * mix, a.v + (b.v - a.v) * mix);
  return `rgb(${Math.round(rgb.r * 255)},${Math.round(rgb.g * 255)},${Math.round(rgb.b * 255)})`;
}

function toScreen(cp: [number, number], diag: number, screenY: number): Pt {
  return {
    x: (cp[0] + MARGIN_X) * diag,
    y: screenY + (-MARGIN_Y - cp[1]) * diag,
  };
}

function catmullRom(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

function sampleAt(pts: Pt[], i: number, t: number): Pt {
  const last = pts.length - 1;
  return catmullRom(
    pts[Math.max(0, i - 1)],
    pts[i],
    pts[Math.min(last, i + 1)],
    pts[Math.min(last, i + 2)],
    t
  );
}

/** Catmull-Rom samples along the path up to a floating index `head`. */
function sampleHead(pts: Pt[], head: number, perSeg: number): Pt[] {
  const last = pts.length - 1;
  const h = Math.min(Math.max(head, 0), last);
  const out: Pt[] = [pts[0]];
  const until = Math.floor(h);

  for (let i = 0; i < until; i++) {
    for (let s = 1; s <= perSeg; s++) out.push(sampleAt(pts, i, s / perSeg));
  }

  const frac = h - until;
  if (frac > 0.0001 && until < last) {
    const steps = Math.max(1, Math.round(perSeg * frac));
    for (let s = 1; s <= steps; s++) out.push(sampleAt(pts, until, (frac * s) / steps));
  }

  return out;
}

function tangentAt(pts: Pt[], i: number): Pt {
  const prev = pts[Math.max(0, i - 1)];
  const next = pts[Math.min(pts.length - 1, i + 1)];
  let tx = next.x - prev.x;
  let ty = next.y - prev.y;
  const m = Math.hypot(tx, ty);
  if (m < 1e-5) return { x: 1, y: 0 };
  return { x: tx / m, y: ty / m };
}

function traceSmooth(ctx: CanvasRenderingContext2D, poly: Pt[], move: boolean) {
  if (poly.length === 0) return;
  if (move) ctx.moveTo(poly[0].x, poly[0].y);
  else ctx.lineTo(poly[0].x, poly[0].y);
  if (poly.length === 1) return;

  for (let i = 1; i < poly.length - 1; i++) {
    ctx.quadraticCurveTo(
      poly[i].x,
      poly[i].y,
      (poly[i].x + poly[i + 1].x) * 0.5,
      (poly[i].y + poly[i + 1].y) * 0.5
    );
  }
  const last = poly[poly.length - 1];
  ctx.lineTo(last.x, last.y);
}

function fillRibbon(ctx: CanvasRenderingContext2D, pts: Pt[], radius: number) {
  if (pts.length < 2) return;

  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const t = tangentAt(pts, i);
    const nx = -t.y;
    const ny = t.x;
    left.push({ x: pts[i].x + nx * radius, y: pts[i].y + ny * radius });
    right.push({ x: pts[i].x - nx * radius, y: pts[i].y - ny * radius });
  }

  ctx.beginPath();
  traceSmooth(ctx, left, true);
  traceSmooth(ctx, right.slice().reverse(), false);
  ctx.closePath();
  ctx.fill();

  const start = pts[0];
  const end = pts[pts.length - 1];
  ctx.beginPath();
  ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
  ctx.arc(end.x, end.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

export function HeroRibbon({
  triggerRef,
}: {
  triggerRef: React.RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const trigger = triggerRef.current;
    if (!canvas || !trigger) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const last = PATH.length - 1;
    const screenPts: Pt[] = new Array(PATH.length);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    };

    const draw = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (vw <= 900) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        raf = 0;
        return;
      }
      const rect = trigger.getBoundingClientRect();
      const screenY = rect.top;
      let show = saturate(-(screenY - START * vh) / (DISTANCE * vh));
      show = reduced ? 1 : quadInOut(show);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dpr = canvas.width / vw;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (show <= 0.001 || rect.bottom < -vh || rect.top > vh * 1.35) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const diag = Math.hypot(vw, vh);
      const radius = 0.008 * fit(vw, 540, 1920, 2, 1) * diag;
      for (let i = 0; i < PATH.length; i++) {
        screenPts[i] = toScreen(PATH[i], diag, screenY);
      }

      const samples = sampleHead(screenPts, show * last, SAMPLES_PER_SEG);
      if (samples.length < 2) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const tip = samples[samples.length - 1];
      const grad = ctx.createLinearGradient(samples[0].x, samples[0].y, tip.x, tip.y);
      grad.addColorStop(0, colorAt(0));
      grad.addColorStop(1, colorAt(show));

      ctx.filter = "blur(0.45px)";
      ctx.fillStyle = grad;
      fillRibbon(ctx, samples, radius);
      ctx.filter = "none";

      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      resize();
      if (!raf) draw();
    };

    resize();
    draw();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [triggerRef]);

  return <canvas ref={canvasRef} className="lh-ribbon" aria-hidden="true" />;
}

export default HeroRibbon;
