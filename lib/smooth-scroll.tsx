"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

const NAV_OFFSET = -96;

function scrollToHash(hash: string, lenis: Lenis | null) {
  const id = hash.replace(/^#/, "");
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  if (lenis) {
    lenis.scrollTo(el, { offset: NAV_OFFSET, duration: 1.05 });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + NAV_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  }
  return true;
}

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
    window.addEventListener("load", onSTRefresh);
    window.addEventListener("resize", onSTRefresh);

    // Initial sync in case triggers fire before this effect runs
    ScrollTrigger.refresh();
    requestAnimationFrame(() => lenis.resize());

    return () => {
      ScrollTrigger.removeEventListener("refresh", onSTRefresh);
      window.removeEventListener("load", onSTRefresh);
      window.removeEventListener("resize", onSTRefresh);
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(ticker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest("a[href^='#']");
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      if (!scrollToHash(href, lenisRef.current)) return;
      event.preventDefault();
      history.pushState(null, "", href);
    };

    document.addEventListener("click", onClick);
    if (window.location.hash) {
      requestAnimationFrame(() => {
        scrollToHash(window.location.hash, lenisRef.current);
      });
    }

    return () => document.removeEventListener("click", onClick);
  }, []);

  return <>{children}</>;
}

export function scrollToTop() {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
