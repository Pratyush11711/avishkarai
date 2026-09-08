"use client";

import { clsx } from "clsx";

interface MarqueeRowProps {
  items: string[];
  speed?: number;
  reverse?: boolean;
  className?: string;
  itemClassName?: string;
  separator?: string;
  large?: boolean;
}

export function MarqueeRow({
  items,
  speed = 40,
  reverse = false,
  className,
  itemClassName,
  separator = "·",
  large = false,
}: MarqueeRowProps) {
  const loop = [...items, ...items];
  const duration = Math.max(18, 900 / speed);

  return (
    <div className={clsx("marquee-wrap overflow-hidden w-full", className)}>
      <div
        className={clsx("marquee-track", reverse && "is-reverse")}
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className={clsx(
              "inline-flex items-center gap-4 shrink-0",
              large ? "px-6 type-heading-sm" : "px-4 type-caption",
              itemClassName
            )}
          >
            <span>{item}</span>
            <span aria-hidden="true">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
