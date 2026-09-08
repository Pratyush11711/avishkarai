"use client";

import { useRef } from "react";

interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export function TiltedCard({
  children,
  className,
  maxTilt = 6,
}: TiltedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const reset = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "perspective(620px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * maxTilt * 2;
    const rotateX = (0.5 - py) * maxTilt * 2;

    el.style.transition = "transform 0.06s linear";
    el.style.transform = `perspective(620px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.045, 1.045, 1.045)`;
  };

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      style={{
        transform: "perspective(620px) rotateX(0deg) rotateY(0deg)",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
