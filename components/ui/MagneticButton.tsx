"use client";

import { useRef, useState } from "react";
import { clsx } from "clsx";
import { TextRoll } from "@/components/ui/TextRoll";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "ghost" | "outline" | "inverted";
  strength?: number;
}

export function MagneticButton({
  children,
  className,
  onClick,
  href,
  variant = "primary",
  strength = 0.3,
}: MagneticButtonProps) {
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const boundsRef = useRef<DOMRect | null>(null);
  const magnetic = strength > 0;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!magnetic) return;
    const rect = boundsRef.current;
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setTransform({
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (!magnetic) return;
    boundsRef.current = e.currentTarget.getBoundingClientRect();
  };

  const handleMouseLeave = () => {
    if (!magnetic) return;
    setTransform({ x: 0, y: 0 });
  };

  const style = magnetic
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        transition:
          transform.x === 0 && transform.y === 0
            ? "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
            : "transform 0.1s linear",
      }
    : undefined;

  const baseClass = clsx(
    "inline-flex items-center justify-center gap-2 cursor-pointer select-none type-body",
    variant === "primary" &&
      "px-6 py-4 rounded-lg bg-carbon-black text-paper-white hover:bg-graphite",
    variant === "inverted" &&
      "px-6 py-4 rounded-lg bg-paper-white text-carbon-black hover:bg-mint-chip",
    variant === "outline" &&
      "px-6 py-4 rounded-md border-[1.5px] border-slate text-slate hover:border-carbon-black hover:text-carbon-black",
      variant === "ghost" && "text-carbon-black",
    className
  );

  const label =
    typeof children === "string" ? <TextRoll>{children}</TextRoll> : children;

  if (href) {
    return (
      <a
        href={href}
        className={baseClass}
        style={style}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {label}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={baseClass}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
