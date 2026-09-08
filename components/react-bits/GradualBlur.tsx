"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

interface GradualBlurProps {
  position?: "top" | "bottom";
  strength?: number;
  height?: string;
  divCount?: number;
  exponential?: boolean;
  opacity?: number;
  curve?: "linear" | "bezier" | "ease-out";
  className?: string;
  zIndex?: number;
  tone?: "light" | "dark";
}

const CURVES: Record<string, (p: number) => number> = {
  linear: (p) => p,
  bezier: (p) => p * p * (3 - 2 * p),
  "ease-out": (p) => 1 - Math.pow(1 - p, 2),
};

export function GradualBlur({
  position = "top",
  strength = 2,
  height = "8rem",
  divCount = 6,
  exponential = true,
  opacity = 1,
  curve = "bezier",
  className = "",
  zIndex = 40,
  tone = "light",
}: GradualBlurProps) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const layers = useMemo(() => {
    const increment = 100 / divCount;
    const curveFn = CURVES[curve] ?? CURVES.linear;
    const direction = position === "top" ? "to top" : "to bottom";

    return Array.from({ length: divCount }, (_, i) => {
      const index = i + 1;
      const progress = curveFn(index / divCount);

      const blurValue = exponential
        ? Math.pow(2, progress * 4) * 0.0625 * strength
        : 0.0625 * (progress * divCount + 1) * strength;

      const p1 = Math.round((increment * index - increment) * 10) / 10;
      const p2 = Math.round(increment * index * 10) / 10;
      const p3 = Math.round((increment * index + increment) * 10) / 10;
      const p4 = Math.round((increment * index + increment * 2) * 10) / 10;

      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;

      const style: CSSProperties = {
        maskImage: `linear-gradient(${direction}, ${gradient})`,
        WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        opacity,
      };

      return <div key={index} className="absolute inset-0" style={style} />;
    });
  }, [curve, divCount, exponential, opacity, position, strength]);

  if (reduced) return null;

  const wash =
    tone === "dark" ? "rgba(0, 0, 0, 0.72)" : "rgba(229, 229, 229, 0.82)";
  const fade =
    position === "top"
      ? `linear-gradient(to bottom, ${wash} 0%, transparent 100%)`
      : `linear-gradient(to top, ${wash} 0%, transparent 100%)`;

  return (
    <>
      <div
        className={`navblur-mobile pointer-events-none fixed inset-x-0 h-24 ${className}`}
        style={{
          [position]: 0,
          zIndex,
          background: fade,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          maskImage:
            position === "top"
              ? "linear-gradient(to bottom, black 55%, transparent 100%)"
              : "linear-gradient(to top, black 55%, transparent 100%)",
          WebkitMaskImage:
            position === "top"
              ? "linear-gradient(to bottom, black 55%, transparent 100%)"
              : "linear-gradient(to top, black 55%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className={`navblur-desktop pointer-events-none fixed inset-x-0 ${className}`}
        style={{
          [position]: 0,
          height,
          zIndex,
        }}
        aria-hidden="true"
      >
        <div className="relative w-full h-full isolate">{layers}</div>
      </div>
    </>
  );
}
