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
}

const CURVES: Record<string, (p: number) => number> = {
  linear: (p) => p,
  bezier: (p) => p * p * (3 - 2 * p),
  "ease-out": (p) => 1 - Math.pow(1 - p, 2),
};

export function GradualBlur({
  position = "top",
  strength = 2,
  height: _height = "8rem",
  divCount = 6,
  exponential = true,
  opacity = 1,
  curve = "bezier",
  className = "",
  zIndex = 40,
}: GradualBlurProps) {
  const [reduced, setReduced] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      setReduced(reduceMq.matches);
      setIsMobile(mobileMq.matches);
    };
    apply();
    reduceMq.addEventListener("change", apply);
    mobileMq.addEventListener("change", apply);
    return () => {
      reduceMq.removeEventListener("change", apply);
      mobileMq.removeEventListener("change", apply);
    };
  }, []);

  const resolvedStrength = isMobile ? Math.min(strength, 1) : strength;
  const resolvedCount = isMobile ? Math.min(divCount, 3) : divCount;

  const layers = useMemo(() => {
    const increment = 100 / resolvedCount;
    const curveFn = CURVES[curve] ?? CURVES.linear;
    const direction = position === "top" ? "to top" : "to bottom";

    return Array.from({ length: resolvedCount }, (_, i) => {
      const index = i + 1;
      let progress = curveFn(index / resolvedCount);

      const blurValue = exponential
        ? Math.pow(2, progress * 4) * 0.0625 * resolvedStrength
        : 0.0625 * (progress * resolvedCount + 1) * resolvedStrength;

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
  }, [curve, exponential, opacity, position, resolvedCount, resolvedStrength]);

  if (reduced) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 h-14 md:h-36 ${className}`}
      style={{
        [position]: 0,
        zIndex,
      }}
      aria-hidden="true"
    >
      <div className="relative w-full h-full isolate">{layers}</div>
    </div>
  );
}
