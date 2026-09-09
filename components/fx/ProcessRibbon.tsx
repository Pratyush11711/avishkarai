"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type Pt = { x: number; y: number };

const SAMPLES = 130;

/* ─── Curve maths ───────────────────────────────────────────────────────────── */

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

/** Uniformly sample a Catmull-Rom spline through the control points. */
function sampleSpline(ctrl: Pt[], count: number): Pt[] {
  const n = ctrl.length;
  if (n < 2) return [];
  const out: Pt[] = [];
  for (let s = 0; s <= count; s++) {
    const u = (s / count) * (n - 1);
    const i = Math.min(Math.floor(u), n - 2);
    const t = u - i;
    out.push(
      catmullRom(ctrl[i - 1] ?? ctrl[i], ctrl[i], ctrl[i + 1], ctrl[i + 2] ?? ctrl[i + 1], t)
    );
  }
  return out;
}

/**
 * Ribbon outline as a filled polygon so the width can vary along its length —
 * a stroked path can only be uniform, which is what produced the terminal blob.
 * Walks up one side and back down the other, tapering to a point at the tip.
 */
function buildOutline(
  pts: Pt[],
  reveal: number,
  fullWidth: number,
  time: number,
  wobble: number
): string {
  const total = pts.length;
  if (total < 3) return "";
  const count = Math.max(3, Math.floor(total * reveal));
  const left: string[] = [];
  const right: string[] = [];

  for (let i = 0; i < count; i++) {
    const p = pts[i];
    const along = i / (total - 1); // position on the whole curve
    const local = i / (count - 1); // position on the revealed part

    const prev = pts[Math.max(i - 1, 0)];
    const next = pts[Math.min(i + 1, total - 1)];
    let tx = next.x - prev.x;
    let ty = next.y - prev.y;
    const m = Math.hypot(tx, ty) || 1;
    tx /= m;
    ty /= m;
    const nx = -ty;
    const ny = tx;

    // Slow, low-amplitude undulation so the ribbon breathes when idle
    const wob =
      wobble *
      (Math.sin(along * 5.5 + time * 0.8) * 6 +
        Math.sin(along * 12.0 - time * 0.55) * 2.4);

    // Quick ease-in at the very start, long taper to ~0 at the leading tip
    const tipT = Math.max(0, (local - 0.78) / 0.22);
    const tip = 1 - tipT * tipT;
    const head = Math.min(1, local / 0.04);
    const hw = (fullWidth / 2) * Math.max(0, tip) * head;

    const cxp = p.x + nx * wob;
    const cyp = p.y + ny * wob;
    left.push(`${(cxp + nx * hw).toFixed(1)} ${(cyp + ny * hw).toFixed(1)}`);
    right.push(`${(cxp - nx * hw).toFixed(1)} ${(cyp - ny * hw).toFixed(1)}`);
  }

  right.reverse();
  return `M ${left.join(" L ")} L ${right.join(" L ")} Z`;
}

/* ─── Control points from real card geometry ────────────────────────────────── */

function buildControlPoints(
  w: number,
  cardCentres: number[],
  ctaTop: number,
  ctaBot: number,
  startY: number
): Pt[] {
  const pts: Pt[] = [{ x: -0.1 * w, y: startY }];

  // One point per card, alternating sides. The swing has to clear the cards
  // horizontally or the ribbon is never visible — the cards are opaque and
  // span most of the width, so it can only show in the side margins.
  cardCentres.forEach((cy, i) => {
    pts.push({ x: (i % 2 === 0 ? 0.93 : 0.07) * w, y: cy });
  });

  // Pass behind the CTA, then run out into the open space below it so the
  // tapered tip lands on-screen rather than fading off the edge.
  const ctaH = Math.max(ctaBot - ctaTop, 80);
  pts.push({ x: 0.4 * w, y: (ctaTop + ctaBot) / 2 });
  pts.push({ x: 0.84 * w, y: ctaBot + ctaH * 0.42 });
  pts.push({ x: 0.97 * w, y: ctaBot + ctaH * 0.95 });
  return pts;
}

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function ProcessRibbon({
  cardSelector = "#process article",
  ctaSelector = ".pcta",
}: {
  cardSelector?: string;
  ctaSelector?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const hostRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);

  const samplesRef = useRef<Pt[]>([]);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const activeRef = useRef(false);

  const [box, setBox] = useState({ w: 0, h: 0 });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);

  const measure = useCallback(() => {
    const host = hostRef.current;
    const scope = host?.parentElement;
    if (!host || !scope) return;
    const r = host.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;

    const cards = Array.from(scope.querySelectorAll<HTMLElement>(cardSelector));
    const cta = scope.querySelector<HTMLElement>(ctaSelector);

    const centres = cards.map((c) => {
      const cr = c.getBoundingClientRect();
      return cr.top - r.top + cr.height / 2;
    });
    const ctaTop = cta ? cta.getBoundingClientRect().top - r.top : r.height * 0.8;
    const ctaBot = cta ? cta.getBoundingClientRect().bottom - r.top : r.height * 0.9;
    const startY = centres.length
      ? Math.max(centres[0] - 260, r.height * 0.03)
      : r.height * 0.05;

    samplesRef.current = sampleSpline(
      buildControlPoints(r.width, centres, ctaTop, ctaBot, startY),
      SAMPLES
    );

    setBox((prev) =>
      Math.abs(prev.w - r.width) < 1 && Math.abs(prev.h - r.height) < 1
        ? prev
        : { w: r.width, h: r.height }
    );
  }, [cardSelector, ctaSelector]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    if (host.parentElement) ro.observe(host.parentElement);
    ScrollTrigger.addEventListener("refresh", measure);
    return () => {
      ro.disconnect();
      ScrollTrigger.removeEventListener("refresh", measure);
    };
  }, [measure]);

  /* Scroll sets a target; a ticker eases the tip toward it and undulates. */
  useEffect(() => {
    const host = hostRef.current;
    const path = pathRef.current;
    const glow = glowRef.current;
    if (!host || !path || !glow || box.w < 1) return;

    const fullWidth = Math.max(18, Math.min(box.w * 0.026, 38));

    const st = ScrollTrigger.create({
      trigger: host,
      start: "top 85%",
      end: "bottom 55%",
      scrub: true,
      invalidateOnRefresh: true,
      onToggle: (self) => {
        activeRef.current = self.isActive;
      },
      onUpdate: (self) => {
        targetRef.current = self.progress;
        activeRef.current = true;
      },
    });

    if (reduced) {
      const d = buildOutline(samplesRef.current, 1, fullWidth, 0, 0);
      path.setAttribute("d", d);
      glow.setAttribute("d", d);
      return () => st.kill();
    }

    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const cur = currentRef.current;
      const next = cur + (targetRef.current - cur) * (1 - Math.exp(-dt * 5));
      currentRef.current = next;

      if (!activeRef.current && next < 0.001) return;

      const d = buildOutline(
        samplesRef.current,
        Math.max(next, 0.001),
        fullWidth,
        now / 1000,
        1
      );
      path.setAttribute("d", d);
      glow.setAttribute("d", d);
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
    };
  }, [box.w, box.h, reduced]);

  const gradId = `process-ribbon-grad-${uid}`;
  const glowId = `process-ribbon-glow-${uid}`;

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-visible"
    >
      {box.w > 0 && (
        <svg
          className="block overflow-visible"
          width={box.w}
          height={box.h}
          viewBox={`0 0 ${box.w} ${box.h}`}
          fill="none"
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#9af8ff" />
              <stop offset="42%" stopColor="#4EE2EF" />
              <stop offset="100%" stopColor="#2ec4d4" />
            </linearGradient>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            ref={glowRef}
            fill="#4EE2EF"
            stroke="#4EE2EF"
            strokeWidth={10}
            strokeLinejoin="round"
            opacity="0.22"
            filter={`url(#${glowId})`}
          />
          <path
            ref={pathRef}
            fill={`url(#${gradId})`}
            stroke={`url(#${gradId})`}
            strokeWidth={1}
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
