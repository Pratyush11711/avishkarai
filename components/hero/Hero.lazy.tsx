"use client";

import dynamic from "next/dynamic";

function HeroSlot() {
  return <div className="lh" aria-hidden />;
}

/** Stable import surface so a mid-edit / empty-export of Hero cannot 500 the homepage. */
export const Hero = dynamic(
  () =>
    import("./Hero")
      .then((m) => ({
        default: m.Hero ?? m.default ?? HeroSlot,
      }))
      .catch(() => ({ default: HeroSlot })),
  { ssr: true, loading: () => <HeroSlot /> }
);
