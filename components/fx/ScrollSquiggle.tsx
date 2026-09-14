"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

/** M/C/S ribbon: S reflects the first cubic's handle so the join stays C1-smooth. */
const SQUIGGLE_D =
  "M-78-34C720-60 880 380 720 780S80 1550 403 2071";

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

export function ScrollSquiggle({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || !path) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;

    const paint = (progress: number) => {
      path.style.strokeDashoffset = `${length * (1 - clamp01(progress))}`;
    };

    if (reduced) {
      paint(1);
      return;
    }

    paint(0);

    const measure = () => {
      const faq = document.getElementById("faq");
      const startLine = window.innerHeight * 0.8;
      const from = wrap.getBoundingClientRect().top;
      const to = faq ? faq.getBoundingClientRect().top : wrap.getBoundingClientRect().bottom;
      const span = to - from;
      if (span <= 1) {
        paint(from <= startLine ? 1 : 0);
        return;
      }
      paint((startLine - from) / span);
    };

    let raf = 0;
    let watching = false;

    const loop = () => {
      measure();
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!watching) {
            watching = true;
            raf = requestAnimationFrame(loop);
          }
        } else {
          watching = false;
          cancelAnimationFrame(raf);
          measure();
        }
      },
      { rootMargin: "20% 0px" }
    );
    io.observe(wrap);
    const faq = document.getElementById("faq");
    if (faq) io.observe(faq);

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      watching = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const gradId = `squiggle-grad-${uid}`;

  return (
    <div ref={wrapRef} className="squiggle-span">
      <div className="scroll-squiggle" aria-hidden="true">
        <svg
          className="scroll-squiggle-svg"
          viewBox="0 0 1000 2000"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a38ee" />
              <stop offset="100%" stopColor="#5a90ff" />
            </linearGradient>
          </defs>
          <path
            ref={pathRef}
            d={SQUIGGLE_D}
            stroke={`url(#${gradId})`}
            strokeWidth="26"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="squiggle-content">{children}</div>
    </div>
  );
}
