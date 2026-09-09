"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";

type Pt = { x: number; y: number };

/**
 * Contained serpentine — expressed as fractions of (w, h).
 * The path turns around well within the section (x stays between ~0.08 and
 * ~0.86) so the ribbon never disappears off the edges; it simply curls back
 * the way a thread would when pulled across a frame.
 * y=0.03 / y=0.97 give the glow filter a few pixels of headroom top/bottom.
 */
const MEANDER: Pt[] = [
  { x: 0.10, y: 0.03 }, // enter from left, near top
  { x: 0.62, y: 0.10 }, // wide sweep toward right
  { x: 0.86, y: 0.18 }, // turn-around — right side
  { x: 0.72, y: 0.26 }, // pulling back toward center-left
  { x: 0.16, y: 0.35 }, // wide left sweep
  { x: 0.08, y: 0.43 }, // turn-around — left side
  { x: 0.28, y: 0.52 }, // drift back through center
  { x: 0.80, y: 0.60 }, // wide right sweep
  { x: 0.88, y: 0.68 }, // turn-around — right side
  { x: 0.58, y: 0.77 }, // curling back left
  { x: 0.13, y: 0.86 }, // final left swing
  { x: 0.50, y: 0.93 }, // drift toward center
  { x: 0.84, y: 0.97 }, // exit right, near bottom
];

function toCubicPath(ctrl: Pt[]): string {
  if (ctrl.length < 2) return "";
  const f = (n: number) => n.toFixed(1);
  let d = `M ${f(ctrl[0].x)} ${f(ctrl[0].y)}`;
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[i - 1] ?? ctrl[i];
    const p1 = ctrl[i];
    const p2 = ctrl[i + 1];
    const p3 = ctrl[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${f(c1x)} ${f(c1y)}, ${f(c2x)} ${f(c2y)}, ${f(p2.x)} ${f(p2.y)}`;
  }
  return d;
}

function buildPath(w: number, h: number): string {
  return toCubicPath(MEANDER.map((p) => ({ x: p.x * w, y: p.y * h })));
}

/* ─── Component ─────────────────────────────────────────────────────────── */

interface WorkRibbonProps {
  /**
   * Ref to the outer <section> element. Used both for dimension measurement
   * and as the ScrollTrigger trigger so GSAP sees the real content height
   * (not an absolute-positioned inner wrapper whose scroll bounds GSAP can
   * misreport when images are still loading).
   */
  triggerEl: React.RefObject<HTMLElement | null>;
}

export function WorkRibbon({ triggerEl }: WorkRibbonProps) {
  const uid     = useId().replace(/:/g, "");
  const mainRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);

  const [box, setBox]         = useState({ w: 0, h: 0, d: "" });
  const [reduced, setReduced] = useState(false);

  const targetRef  = useRef(0);
  const currentRef = useRef(0);
  const rafRef     = useRef(0);

  useEffect(() => {
    const mq   = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /**
   * Measure the SECTION's offsetWidth/offsetHeight — not an inner absolute
   * div — so we always get the true content-driven dimensions even when
   * images or fonts haven't loaded yet (ResizeObserver catches the growth).
   */
  const measure = useCallback(() => {
    const el = triggerEl.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w < 1 || h < 1) return;
    const d = buildPath(w, h);
    setBox((prev) =>
      prev.d === d && Math.abs(prev.w - w) < 1 ? prev : { w, h, d }
    );
  }, [triggerEl]);

  /* Observe the section element directly so any height change (lazy images,
     font swap, accordion open) re-builds the path and re-pins GSAP. */
  useEffect(() => {
    const el = triggerEl.current;
    if (!el) return;

    measure();

    const ro = new ResizeObserver(() => {
      measure();
      ScrollTrigger.refresh();
    });
    ro.observe(el);
    ScrollTrigger.addEventListener("refresh", measure);

    // Fonts + above-the-fold images: catch anything that shifts layout
    // after the JS bundle has run but before the browser fires "load".
    const onLoad = () => {
      measure();
      // Extra tick: some images report zero height until the next paint.
      setTimeout(() => { measure(); ScrollTrigger.refresh(); }, 300);
    };
    window.addEventListener("load", onLoad, { once: true });

    // Belt-and-suspenders: a 600 ms deferred refresh covers fonts loaded
    // via font-face observer, third-party scripts, etc.
    const deferred = setTimeout(() => { measure(); ScrollTrigger.refresh(); }, 600);

    return () => {
      ro.disconnect();
      clearTimeout(deferred);
      ScrollTrigger.removeEventListener("refresh", measure);
    };
  }, [measure, triggerEl]);

  /* Spring animation loop + ScrollTrigger wired to the real <section> */
  useEffect(() => {
    const main = mainRef.current;
    const glow = glowRef.current;
    const el   = triggerEl.current;
    if (!main || !el || !box.d) return;

    const totalLen = main.getTotalLength();

    [main, glow].forEach((p) => {
      if (!p) return;
      p.style.strokeDasharray  = `${totalLen}`;
      p.style.strokeDashoffset = reduced ? "0" : `${totalLen}`;
    });
    if (reduced) return;

    currentRef.current = 0;
    targetRef.current  = 0;
    let alive = true;

    const tick = () => {
      if (!alive) return;

      const diff = targetRef.current - currentRef.current;
      // Snap to exact value when the gap is negligible so the lerp never
      // asymptotically stalls short of 0 or 1.
      if (Math.abs(diff) < 0.004) {
        currentRef.current = targetRef.current;
      } else {
        currentRef.current += diff * 0.10;
      }

      const p      = Math.min(Math.max(currentRef.current, 0), 1);
      const offset = `${((1 - p) * totalLen).toFixed(1)}`;

      if (mainRef.current) mainRef.current.style.strokeDashoffset = offset;
      if (glowRef.current) glowRef.current.style.strokeDashoffset = offset;

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    /**
     * Trigger is the real <section> element — GSAP reads its true page
     * offset so the start/end scroll positions are always accurate.
     *
     * start: "top bottom"   → ribbon begins drawing the moment the section
     *                          enters the viewport from the bottom.
     * end:   "bottom top"   → ribbon finishes the moment the section's last
     *                          row scrolls off the top of the viewport.
     *
     * This spans every pixel the user scrolls while ANY part of the section
     * is visible, so the ribbon always completes exactly at the last row.
     */
    const st = ScrollTrigger.create({
      trigger: el,
      start:   "top bottom",
      end:     "bottom top",
      scrub:   true,
      invalidateOnRefresh: true,
      onUpdate: (s) => { targetRef.current = s.progress; },
    });

    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
      st.kill();
    };
  }, [box.d, reduced, triggerEl]);

  const sw         = Math.max(14, Math.min(box.w * 0.022, 34));
  const gradId     = `wr-grad-${uid}`;
  const glowFiltId = `wr-gfilt-${uid}`;
  const waveId     = `wr-wave-${uid}`;

  if (!box.d) return null;

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 block overflow-visible"
      width={box.w}
      height={box.h}
      viewBox={`0 0 ${box.w} ${box.h}`}
      fill="none"
    >
      <defs>
        <linearGradient
          id={gradId}
          gradientUnits="userSpaceOnUse"
          x1="0"     y1="0"
          x2={box.w} y2={box.h}
        >
          <stop offset="0%"   stopColor="#b2fbff" stopOpacity="0.85" />
          <stop offset="48%"  stopColor="#4EE2EF" stopOpacity="1"    />
          <stop offset="100%" stopColor="#22b8c9" stopOpacity="0.82" />
        </linearGradient>

        <filter id={waveId} x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.006 0.016"
            numOctaves="2"
            seed="14"
            result="noiseMap"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noiseMap"
            scale="5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <filter id={glowFiltId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Soft ambient glow — wider stroke, shared dashoffset */}
      <path
        ref={glowRef}
        d={box.d}
        stroke="#4EE2EF"
        strokeWidth={sw + 22}
        strokeLinecap="round"
        opacity="0.11"
        filter={`url(#${glowFiltId})`}
      />

      {/* Main ribbon — gradient + subtle organic waviness */}
      <path
        ref={mainRef}
        d={box.d}
        stroke={`url(#${gradId})`}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={reduced ? undefined : `url(#${waveId})`}
      />
    </svg>
  );
}
