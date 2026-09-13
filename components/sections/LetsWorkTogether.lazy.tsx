"use client";

import dynamic from "next/dynamic";

function LwtSlot() {
  return <section className="lwt" aria-hidden />;
}

/** Client-only load so a WebGL / empty-export failure cannot 500 the homepage. */
export const LetsWorkTogether = dynamic(
  () =>
    import("./LetsWorkTogether")
      .then((m) => ({
        default: m.LetsWorkTogether ?? LwtSlot,
      }))
      .catch(() => ({ default: LwtSlot })),
  { ssr: false, loading: () => <LwtSlot /> }
);
