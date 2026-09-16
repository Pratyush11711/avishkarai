"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "./HeroVideo";

const ITEMS = [
  { word: "Fast", image: "/hero-mask-1.png" },
  { word: "Crafted", image: "/hero-mask-2.png" },
  { word: "Dependable", image: "/hero-mask-3.png" },
] as const;

const HOLD_MS = 2600;
const TRANSITION_S = 0.7;
const CYCLE_MS = HOLD_MS + TRANSITION_S * 1000;
const EASE = [0.76, 0, 0.24, 1] as const;
const HIDDEN = "polygon(0 0, 0 0, 0 100%, 0 100%)";
const VISIBLE = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";

export function useHeroCyclePhase(cycleMs: number = CYCLE_MS, count: number = ITEMS.length) {
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
  const underlayIndexRef = useRef(0);
  const prevActiveRef = useRef(0);
  const reduced = usePrefersReducedMotion();

  if (activeIndex !== prevActiveRef.current) {
    underlayIndexRef.current = prevActiveRef.current;
    prevActiveRef.current = activeIndex;
  }

  const active = ITEMS[activeIndex];
  const underlayIndex = underlayIndexRef.current;
  const wipeMs = reduced ? 0.15 : TRANSITION_S;

  return (
    <>
      {ITEMS.map((item) => (
        <link key={`preload-${item.image}`} rel="preload" as="image" href={item.image} />
      ))}
      <div className="hero-word-cycle__image" aria-hidden="true">
        {ITEMS.map((item, i) => {
          const isActive = i === activeIndex;
          const isUnderlay = i === underlayIndex;
          const shown = isActive || isUnderlay;
          return (
            <motion.div
              key={item.image}
              className="hero-word-cycle__layer"
              initial={false}
              animate={{
                clipPath: reduced || shown ? VISIBLE : HIDDEN,
                opacity: reduced ? (shown ? 1 : 0) : 1,
              }}
              style={{ zIndex: isActive ? 2 : isUnderlay ? 1 : 0 }}
              transition={{
                duration: isActive && activeIndex !== underlayIndex ? wipeMs : 0,
                ease: EASE,
              }}
            >
              <Image
                src={item.image}
                alt=""
                fill
                priority
                unoptimized
                sizes="100vw"
                style={{ objectFit: "cover" }}
              />
            </motion.div>
          );
        })}
      </div>
      <div className="lh-intro-copy">
        {children}
      </div>
      <div className="hero-word-cycle">
        <div className="hero-word-cycle__label" aria-live="polite" aria-atomic="true">
          <span className="sr-only">{active.word}</span>
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
                {active.word}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
