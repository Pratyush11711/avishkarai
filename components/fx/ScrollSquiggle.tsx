"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/** Exact path from https://codepen.io/juan-frontdev/pen/JjQdaMN */
const SQUIGGLE_D =
  "m-78-34c108.3-28.4 485.8 139.4 496 376 5.3 122.6-83.2 290.8-160 280-64.3-9.1-137.7-190.7-124-240 27.7-99.5 335.1 309.8 500 216 46.7-26.5 81.5-109.2 55-144-24.3-31.8-89-28.7-141 0-187.3 103.3-87.2 240.8-209 463-79.5 145.1-99.2 309.1-176 281-25.7-9.4-60.4-61.1-46-101 11.4-31.6 40.1-55 73-49 186.5 34.2 363.4 177.8 338 366-12.6 93.3-178.9 150.3-157.6 190.3 21.6 40.5 230.9-4.4 248.6-32.3 25.1-39.4-230.2-181.8-333-121-90.9 53.7-136.6 191.7-79 303 41.8 80.8 149.1 28.2 196 115 41.7 77.1 15.5 238.1 0 202";

export function ScrollSquiggle({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || !path) return;

    const length = path.getTotalLength();
    const paint = (progress: number) => {
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length * (1 - progress)}`;
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paint(1);
      return;
    }

    paint(0);

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: "top 80%",
      end: "bottom top",
      scrub: 0.45,
      invalidateOnRefresh: true,
      onUpdate: (self) => paint(self.progress),
    });

    return () => st.kill();
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
