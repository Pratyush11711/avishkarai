"use client";

import { useEffect, useState } from "react";

const MIN_VISIBLE_MS = 1100;
const MAX_WAIT_MS = 2400;

export function SitePreloader() {
  const [hiding, setHiding] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = performance.now();
    let finished = false;
    let minTimer = 0;
    let maxTimer = 0;

    const dismiss = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      setHiding(true);
    };

    if (reduced) {
      dismiss();
      return;
    }

    const tryDismiss = () => {
      const remaining = Math.max(0, MIN_VISIBLE_MS - (performance.now() - started));
      minTimer = window.setTimeout(dismiss, remaining);
    };

    if (document.readyState === "complete") {
      tryDismiss();
    } else {
      window.addEventListener("load", tryDismiss, { once: true });
    }

    maxTimer = window.setTimeout(dismiss, MAX_WAIT_MS);

    return () => {
      finished = true;
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      window.removeEventListener("load", tryDismiss);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={hiding ? "site-preloader is-hiding" : "site-preloader"}
      role="status"
      aria-live="polite"
      aria-busy={!hiding}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && hiding) setGone(true);
      }}
    >
      <span className="sr-only">Loading</span>
      {/* From Uiverse.io by Nawsome */}
      <svg className="pl" width="240" height="240" viewBox="0 0 240 240" aria-hidden="true">
        <circle
          className="pl__ring pl__ring--a"
          cx="120"
          cy="120"
          r="105"
          fill="none"
          strokeWidth="20"
          strokeDasharray="0 660"
          strokeDashoffset="-330"
          strokeLinecap="round"
        />
        <circle
          className="pl__ring pl__ring--b"
          cx="120"
          cy="120"
          r="35"
          fill="none"
          strokeWidth="20"
          strokeDasharray="0 220"
          strokeDashoffset="-110"
          strokeLinecap="round"
        />
        <circle
          className="pl__ring pl__ring--c"
          cx="85"
          cy="120"
          r="70"
          fill="none"
          strokeWidth="20"
          strokeDasharray="0 440"
          strokeLinecap="round"
        />
        <circle
          className="pl__ring pl__ring--d"
          cx="155"
          cy="120"
          r="70"
          fill="none"
          strokeWidth="20"
          strokeDasharray="0 440"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
