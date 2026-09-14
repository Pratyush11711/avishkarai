"use client";

import { clsx } from "clsx";

export function PrincipleRail({
  count,
  activeIndex,
  segmentFill,
  overallProgress,
  onSelect,
  compact = false,
}: {
  count: number;
  activeIndex: number;
  segmentFill: number;
  overallProgress: number;
  onSelect: (i: number) => void;
  compact?: boolean;
}) {
  const tip = Math.min(1, Math.max(0, overallProgress));

  return (
    <div
      className={clsx("relative", compact && "max-w-[8.5rem]")}
      role="tablist"
      aria-label="Principles"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 z-[1] h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3040ff] opacity-70 blur-xl"
        style={{ left: `${tip * 100}%` }}
      />

      <div className="relative z-[2] flex gap-2">
        {Array.from({ length: count }).map((_, i) => {
          const fill =
            i < activeIndex ? 1 : i === activeIndex ? segmentFill : 0;
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-controls="principles-panel"
              aria-label={`Principle ${i + 1}`}
              onClick={() => onSelect(i)}
              className={clsx(
                "relative flex h-11 items-center",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3040ff]",
                compact ? "w-8 shrink-0" : "flex-1"
              )}
            >
              <span className="relative block h-2 w-full overflow-hidden rounded-full bg-[#d8daf0]">
                <span
                  className="absolute inset-0 origin-left rounded-full bg-[#3040ff]"
                  style={{ transform: `scaleX(${fill})` }}
                />
              </span>
            </button>
          );
        })}
      </div>

      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 z-[3] h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3040ff] shadow-[0_0_18px_5px_rgba(48,64,255,0.5)]"
        style={{ left: `${tip * 100}%` }}
      />
    </div>
  );
}
