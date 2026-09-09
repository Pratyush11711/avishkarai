"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import {
  APPEAR_DURATION,
  FIELD_TOP,
  SHAPE_CIRCLE,
  SHAPE_CROSS,
  SHAPE_TRIANGLE,
  buildField,
  clamp01,
  type Particle,
} from "./field";
import type { FieldDriver } from "./useFieldDriver";

/**
 * LOW_POWER path: the same field drawn on a 2D canvas, with spring-based cursor
 * repulsion instead of a flow field. No render targets, no WebGL context — this
 * is what mobile, low-core machines and reduced-motion users get.
 */

/** Cursor repulsion, tuned so shapes drift aside and ease back rather than snap. */
const POINTER_RADIUS = 190;
const POINTER_PUSH = 5200;
const SPRING = 30;
const DAMPING = 0.88;
/** Keeps cursor-displaced shapes from escaping the top of the canvas. */
const MAX_OFFSET = 60;

const TAU = Math.PI * 2;

/**
 * One fill() per shape. Batching every shape into a single path was measurably
 * slower — the rasteriser ends up scanning one path spanning the whole canvas.
 */
function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: number,
  x: number,
  y: number,
  size: number,
  angle: number
) {
  const half = size / 2;

  if (shape === SHAPE_CIRCLE) {
    ctx.beginPath();
    ctx.arc(x, y, half, 0, TAU);
    ctx.fill();
    return;
  }

  if (shape === SHAPE_CROSS) {
    const bar = Math.max(0.8, size * 0.26);
    ctx.fillRect(x - half, y - bar / 2, size, bar);
    ctx.fillRect(x - bar / 2, y - half, bar, size);
    return;
  }

  if (shape === SHAPE_TRIANGLE) {
    ctx.beginPath();
    ctx.moveTo(x, y - half);
    ctx.lineTo(x + half, y + half);
    ctx.lineTo(x - half, y + half);
    ctx.closePath();
    ctx.fill();
    return;
  }

  const cx = Math.cos(angle) * half;
  const sy = Math.sin(angle) * half;
  ctx.beginPath();
  ctx.moveTo(x - cx + sy, y - sy - cx);
  ctx.lineTo(x + cx + sy, y + sy - cx);
  ctx.lineTo(x + cx - sy, y + sy + cx);
  ctx.lineTo(x - cx - sy, y - sy + cx);
  ctx.closePath();
  ctx.fill();
}

export function StaticParticleField({
  driver,
}: {
  driver: React.RefObject<FieldDriver>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { desynchronized: true });
    if (!ctx) return;

    let width = 0;
    let canvasHeight = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let lastTime = 0;
    let visible = true;

    // Displacement from home and its velocity, integrated per frame.
    let offsetX = new Float32Array(0);
    let offsetY = new Float32Array(0);
    let velocityX = new Float32Array(0);
    let velocityY = new Float32Array(0);

    const pointer = { x: 0, y: 0, seeded: false };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      canvasHeight = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(canvasHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = width < 640 ? 900 : width < 1100 ? 1800 : 2600;
      if (particles.length === density) return;

      particles = buildField(density);
      offsetX = new Float32Array(particles.length);
      offsetY = new Float32Array(particles.length);
      velocityX = new Float32Array(particles.length);
      velocityY = new Float32Array(particles.length);
    };

    const render = (timeMs: number) => {
      const time = timeMs / 1000;
      // Clamped so a backgrounded tab or dropped frame can't fling the springs.
      const dt = lastTime ? Math.min(0.05, (timeMs - lastTime) / 1000) : 1 / 60;
      lastTime = timeMs;
      const dtScale = dt * 60;
      const damping = Math.pow(DAMPING, dtScale);

      const state = driver.current;
      const panelHeight = state.panelHeight || canvasHeight / (1 - FIELD_TOP);
      const fieldOffset = panelHeight * FIELD_TOP;
      const progress = reduced ? 1 : state.progress;

      if (state.pointerActive) {
        const targetX = state.pointerX;
        const targetY = state.pointerY - state.panelTop - fieldOffset;
        if (pointer.seeded) {
          const follow = Math.min(1, 0.22 * dtScale);
          pointer.x += (targetX - pointer.x) * follow;
          pointer.y += (targetY - pointer.y) * follow;
        } else {
          pointer.x = targetX;
          pointer.y = targetY;
          pointer.seeded = true;
        }
      } else {
        pointer.seeded = false;
      }

      // Starts part-built so the panel is never an empty blue screen on entry.
      const revealRaw = clamp01(0.2 + progress / 0.4);
      const reveal = 1 - Math.pow(1 - revealRaw, 3);
      const shift =
        (1 - reveal) * panelHeight * 0.35 - progress * panelHeight * 0.08;
      const sizeScale = width < 640 ? 0.72 : 1;

      ctx.clearRect(0, 0, width, canvasHeight);
      ctx.fillStyle = "#ffffff";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // Shapes scale in rather than fade, which avoids a per-particle
        // globalAlpha change on every draw.
        const appear = clamp01((reveal - p.delay) / APPEAR_DURATION);
        if (appear <= 0) continue;

        let x = p.x * width;
        let y = p.y * panelHeight + shift - fieldOffset;

        if (!reduced) {
          x += Math.cos(time * p.speed * 0.8 + p.phase) * 2.4;
          y += Math.sin(time * p.speed + p.phase) * 3.2;

          const settled =
            offsetX[i] === 0 &&
            offsetY[i] === 0 &&
            velocityX[i] === 0 &&
            velocityY[i] === 0;

          if (state.pointerActive || !settled) {
            if (state.pointerActive) {
              const dx = x + offsetX[i] - pointer.x;
              const dy = y + offsetY[i] - pointer.y;
              const distSq = dx * dx + dy * dy;

              if (distSq < POINTER_RADIUS * POINTER_RADIUS) {
                const dist = Math.sqrt(distSq) || 0.001;
                const falloff = 1 - dist / POINTER_RADIUS;
                const impulse = falloff * falloff * POINTER_PUSH * dt;
                velocityX[i] += (dx / dist) * impulse;
                velocityY[i] += (dy / dist) * impulse;
              }
            }

            velocityX[i] -= offsetX[i] * SPRING * dt;
            velocityY[i] -= offsetY[i] * SPRING * dt;
            velocityX[i] *= damping;
            velocityY[i] *= damping;
            offsetX[i] += velocityX[i] * dt;
            offsetY[i] += velocityY[i] * dt;

            if (Math.abs(offsetX[i]) < 0.02 && Math.abs(velocityX[i]) < 0.02) {
              offsetX[i] = 0;
              velocityX[i] = 0;
            }
            if (Math.abs(offsetY[i]) < 0.02 && Math.abs(velocityY[i]) < 0.02) {
              offsetY[i] = 0;
              velocityY[i] = 0;
            }

            const reach = offsetX[i] * offsetX[i] + offsetY[i] * offsetY[i];
            if (reach > MAX_OFFSET * MAX_OFFSET) {
              const scale = MAX_OFFSET / Math.sqrt(reach);
              offsetX[i] *= scale;
              offsetY[i] *= scale;
            }

            x += offsetX[i];
            y += offsetY[i];
          }
        }

        if (y > canvasHeight + 20 || y < -20) continue;

        drawShape(
          ctx,
          p.shape,
          x,
          y,
          p.size * appear * sizeScale,
          p.rot + time * p.rotSpeed
        );
      }

      if (!reduced && visible) frame = requestAnimationFrame(render);
    };

    resize();
    frame = requestAnimationFrame(render);

    // Don't burn frames while the panel is off-screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !reduced) {
          cancelAnimationFrame(frame);
          lastTime = 0;
          frame = requestAnimationFrame(render);
        }
      },
      { rootMargin: "20% 0px" }
    );
    observer.observe(canvas);

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [reduced, driver]);

  return <canvas ref={canvasRef} className="lwt-canvas" aria-hidden />;
}
