"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export type SandTimerItem = {
  number: string;
  text: string;
};

const DIM = { r: 154, g: 154, b: 154 };   // smoke gray when unlit
const LIT = { r: 0,   g: 0,   b: 0 };    // carbon-black when lit
const GRAIN_COUNT = 6;

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function mixRgb(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number,
) {
  const k = clamp(t, 0, 1);
  return `rgb(${Math.round(a.r + (b.r - a.r) * k)},${Math.round(a.g + (b.g - a.g) * k)},${Math.round(a.b + (b.b - a.b) * k)})`;
}

export function SandTimerList({ items }: { items: SandTimerItem[] }) {
  const rootRef   = useRef<HTMLDivElement>(null);
  const fillRef   = useRef<HTMLDivElement>(null);
  const headRef   = useRef<HTMLDivElement>(null);
  const listRef   = useRef<HTMLOListElement>(null);
  const rowRefs   = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const fill = fillRef.current;
    const head = headRef.current;
    const list = listRef.current;
    if (!root || !fill || !head || !list) return;

    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Compute row midpoints as fractions of the LIST height.
    // offsetTop / offsetHeight are layout-static — they don't change with scroll.
    let midpoints: number[] = [];
    const computeMidpoints = () => {
      const listH = list.offsetHeight || 1;
      midpoints = rowRefs.current.map((row) => {
        if (!row) return 0.5;
        return (row.offsetTop + row.offsetHeight * 0.5) / listH;
      });
    };

    const applyRows = (p: number) => {
      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        const mid = midpoints[i] ?? 0.5;
        // fade range: mid-0.12 → mid+0.06  (lights up slightly before centre)
        const lit = clamp((p - (mid - 0.12)) / 0.18, 0, 1);
        const color = mixRgb(DIM, LIT, lit);
        const num  = row.querySelector<HTMLElement>(".stl-num");
        const text = row.querySelector<HTMLElement>(".stl-text");
        if (num)  num.style.color  = color;
        if (text) {
          text.style.color   = color;
          text.style.opacity = String(0.45 + lit * 0.55);
        }
      });
    };

    const apply = (raw: number) => {
      const p = clamp(raw, 0, 1);
      // fill bar — height 0 → 100 %
      fill.style.height = `${p * 100}%`;
      // grain cluster sits at the tip of the fill
      head.style.top    = `${p * 100}%`;
      head.dataset.active =
        !prefersReduced && p > 0.01 && p < 0.99 ? "true" : "false";
      // row colour
      applyRows(p);
    };

    // Initialise dimmed, BEFORE creating the trigger
    computeMidpoints();
    apply(0);

    const st = ScrollTrigger.create({
      trigger  : root,
      // full travel: list enters from below, exits above
      start    : "top bottom",
      end      : "bottom top",
      scrub    : true,
      invalidateOnRefresh: true,
      onUpdate : (self) => apply(self.progress),
      // called after every refresh so initial state is correct
      onRefresh: (self) => {
        computeMidpoints();
        apply(self.progress);
      },
    });

    // Force a layout refresh after paint so measurements are accurate.
    // Do NOT call apply(st.progress) here — let onRefresh drive the state.
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 150);

    const ro = new ResizeObserver(() => {
      computeMidpoints();
      ScrollTrigger.refresh();
    });
    ro.observe(root);
    window.addEventListener("load", () => ScrollTrigger.refresh());

    return () => {
      window.clearTimeout(t);
      ro.disconnect();
      st.kill();
    };
  }, [items]);

  return (
    <div ref={rootRef} className="stl">
      {/* Left gutter: track + fill + grain head */}
      <div className="stl-gutter" aria-hidden="true">
        <div className="stl-track">
          <div ref={fillRef} className="stl-fill" />
        </div>
        <div ref={headRef} className="stl-head" data-active="false">
          {Array.from({ length: GRAIN_COUNT }, (_, i) => (
            <span
              key={i}
              className="stl-grain"
              style={{
                "--d": `${i * 0.13}s`,
                "--x": `${(i - (GRAIN_COUNT - 1) / 2) * 2.6}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* Statement list */}
      <ol ref={listRef} className="stl-list">
        {items.map((item, i) => (
          <li
            key={item.number}
            ref={(el) => { rowRefs.current[i] = el; }}
            className="stl-row"
          >
            <span className="stl-num">{item.number}</span>
            <p    className="stl-text">{item.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
