"use client";

import { clsx } from "clsx";

export function PrincipleRail({
  count,
  activeIndex,
  fillKey,
  paused = false,
  onSelect,
  compact = false,
  reducedMotion = false,
}: {
  count: number;
  activeIndex: number;
  fillKey: number;
  paused?: boolean;
  onSelect: (i: number) => void;
  compact?: boolean;
  reducedMotion?: boolean;
}) {
  return (
    <div
      className={clsx("flex gap-2", compact && "max-w-[8.5rem]")}
      role="tablist"
      aria-label="Principles"
    >
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === activeIndex;
        const isPast = i < activeIndex;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls="principles-panel"
            aria-label={`Principle ${i + 1}`}
            onClick={() => onSelect(i)}
            className={clsx(
              "relative h-1.5 overflow-hidden rounded-full bg-[var(--rail-track)] transition-colors",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]",
              compact ? "w-8 shrink-0" : "flex-1"
            )}
          >
            {isPast && (
              <span className="absolute inset-0 rounded-full bg-[var(--accent)]" />
            )}
            {isActive && (
              <span
                key={fillKey}
                className={clsx(
                  "absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]",
                  reducedMotion ? "w-full" : "principle-rail-fill"
                )}
                style={
                  paused && !reducedMotion
                    ? { animationPlayState: "paused" }
                    : undefined
                }
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
