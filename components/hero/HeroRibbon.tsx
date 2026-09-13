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
const COLORS: string[] = PATH.map((_, i) => colorAt(i / (PATH.length - 1)));

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

function toScreen(
  cp: [number, number],
  diag: number,
  screenY: number
): { x: number; y: number } {
  return {
    x: (cp[0] + MARGIN_X) * diag,
    y: screenY + (-MARGIN_Y - cp[1]) * diag,
  };
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

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const last = PATH.length - 1;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rect = trigger.getBoundingClientRect();
      const screenY = rect.top;
      let show = saturate(-(screenY - START * vh) / (DISTANCE * vh));
      show = reduced ? 1 : quadInOut(show);

      ctx.clearRect(0, 0, vw, vh);
      if (show <= 0.001 || rect.bottom < -vh || rect.top > vh * 1.35) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const diag = Math.hypot(vw, vh);
      const radius = 0.008 * fit(vw, 540, 1920, 2, 1) * diag;
      const head = show * last;
      const until = Math.min(last, Math.floor(head));
      const frac = head - until;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = radius * 2;

      let prev = toScreen(PATH[0], diag, screenY);
      for (let i = 1; i <= until; i++) {
        const cur = toScreen(PATH[i], diag, screenY);
        ctx.strokeStyle = COLORS[i - 1];
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(cur.x, cur.y);
        ctx.stroke();
        prev = cur;
      }

      let tip = prev;
      if (until < last && frac > 0) {
        const next = toScreen(PATH[until + 1], diag, screenY);
        tip = {
          x: prev.x + (next.x - prev.x) * frac,
          y: prev.y + (next.y - prev.y) * frac,
        };
        ctx.strokeStyle = COLORS[until];
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(tip.x, tip.y);
        ctx.stroke();
      }

      ctx.fillStyle = COLORS[Math.min(last, until)];
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, radius, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [triggerRef]);

  return <canvas ref={canvasRef} className="lh-ribbon" aria-hidden="true" />;
}

export default HeroRibbon;
