"use client";

import dynamic from "next/dynamic";

function ClockSlot() {
  return (
    <div
      id="clock"
      aria-hidden
      className="relative min-h-[100svh] w-full bg-bg"
    />
  );
}

/** Stable import so a mid-edit / empty-export of TheClock cannot 500 the homepage. */
export const TheClock = dynamic(
  () =>
    import("./TheClock")
      .then((m) => ({
        default: m.TheClock ?? m.default ?? ClockSlot,
      }))
      .catch(() => ({ default: ClockSlot })),
  { ssr: false, loading: () => <ClockSlot /> }
);
