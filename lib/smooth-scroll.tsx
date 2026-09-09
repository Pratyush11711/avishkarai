"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const isTouchMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isTouchMobile) return;

    const lenis = new Lenis({
      duration: 1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });

    lenisRef.current = lenis;

    // Keep ScrollTrigger in sync with every Lenis scroll tick
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    // Drive Lenis through GSAP's ticker for perfect frame timing
    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    // CRITICAL: whenever GSAP refreshes (e.g. TheClock adds its 420vh pin-spacer),
    // tell Lenis to recalculate the document's scrollable height so it doesn't
    // cap scroll at the pre-pin document height.
    const onSTRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", onSTRefresh);

    // Initial sync in case triggers fire before this effect runs
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.removeEventListener("refresh", onSTRefresh);
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(ticker);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

export function scrollToTop() {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
