"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HeroVideo, usePrefersReducedMotion } from "./HeroVideo";

const WORDS = ["Fast", "Crafted", "Dependable"] as const;

const HOLD_MS = 2600;
const TRANSITION_S = 0.7;
const CYCLE_MS = HOLD_MS + TRANSITION_S * 1000;
const EASE = [0.76, 0, 0.24, 1] as const;

export function useHeroCyclePhase(cycleMs: number = CYCLE_MS, count: number = WORDS.length) {
  const [index, setIndex] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      const next = Math.floor(elapsed / cycleMs) % count;
      setIndex((prev) => (prev !== next ? next : prev));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [cycleMs, count]);

  return index;
}

export function HeroWordImageCycle({ children }: { children: ReactNode }) {
  const activeIndex = useHeroCyclePhase();
  const reduced = usePrefersReducedMotion();
  const active = WORDS[activeIndex];

  return (
    <>
      <div className="hero-word-cycle__image" aria-hidden="true">
        <HeroVideo playing={!reduced} />
      </div>
      <div className="lh-intro-copy">
        {children}
      </div>
      <div className="hero-word-cycle">
        <div className="hero-word-cycle__label" aria-live="polite" aria-atomic="true">
          <span className="sr-only">{active}</span>
          <div className="hero-word-cycle__word" aria-hidden="true">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={activeIndex}
                initial={{ y: reduced ? 0 : "100%", opacity: reduced ? 1 : 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: reduced ? 0 : "-100%", opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.35, ease: EASE }}
                className="hero-word-cycle__text"
              >
                {active}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
