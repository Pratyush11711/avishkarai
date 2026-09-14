"use client";

import { useEffect, useState } from "react";
import SplashCursor, { AVISHKAR_SPLASH_COLORS } from "@/components/fx/SplashCursor";

function shouldEnableSplashCursor() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia("(pointer: coarse)").matches) return false;
  return true;
}

export function SplashCursorLayer() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(shouldEnableSplashCursor());

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(pointer: coarse)");
    const sync = () => setEnabled(shouldEnableSplashCursor());

    motion.addEventListener("change", sync);
    pointer.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      pointer.removeEventListener("change", sync);
    };
  }, []);

  if (!enabled) return null;

  return (
    <SplashCursor
      RAINBOW_MODE={false}
      COLOR="#3040ff"
      BRAND_COLORS={AVISHKAR_SPLASH_COLORS}
      TRANSPARENT
      SPLAT_RADIUS={0.08}
      SPLAT_FORCE={2200}
      DENSITY_DISSIPATION={6.8}
      VELOCITY_DISSIPATION={3.8}
      CURL={1.4}
    />
  );
}
