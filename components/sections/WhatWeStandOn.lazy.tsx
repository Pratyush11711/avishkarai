"use client";

import dynamic from "next/dynamic";

function PrinciplesSlot() {
  return (
    <section
      id="studio"
      aria-hidden
      className="relative z-0 min-h-[24rem] pb-14 pt-[calc(5.5rem+24px)] md:pb-20"
    />
  );
}

/** Client-only load so a mid-edit / empty-export of the section cannot 500 the homepage. */
export const WhatWeStandOn = dynamic(
  () =>
    import("./WhatWeStandOn")
      .then((m) => ({
        default: m.WhatWeStandOn ?? m.default ?? PrinciplesSlot,
      }))
      .catch(() => ({ default: PrinciplesSlot })),
  { ssr: false, loading: () => <PrinciplesSlot /> }
);
