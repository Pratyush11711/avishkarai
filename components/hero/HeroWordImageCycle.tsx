"use client";

import { useEffect, useState, type ReactNode } from "react";
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
const EASE = [0.76, 0, 0.24, 1] as const;
const HIDDEN = "polygon(0 0, 0 0, 0 100%, 0 100%)";
const VISIBLE = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";

export function HeroWordImageCycle({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(0);
  const reduced = usePrefersReducedMotion();
  const active = ITEMS[step % ITEMS.length];
  const previous = ITEMS[Math.max(0, step - 1) % ITEMS.length];

  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    // Decode ahead of the first transition; never reveal an unloaded image.
    const ready = Promise.all(ITEMS.map(({ image }) => {
      const img = new window.Image();
      img.src = image;
      return img.decode();
    }));
    const schedule = () => {
      timer = setTimeout(() => {
        if (!document.hidden) setStep((value) => value + 1);
        schedule();
      }, HOLD_MS + TRANSITION_S * 1000);
    };
    ready.then(() => { if (!disposed) schedule(); }).catch(() => {
      // Leave the initial image visible if another asset cannot be decoded.
    });
    return () => { disposed = true; clearTimeout(timer); };
  }, []);

  return (
    <>
      <div className="hero-word-cycle__image" aria-hidden="true">
        {/* An unmasked base always covers the viewport, including during a wipe. */}
        <Image src={previous.image} alt="" fill unoptimized loading="eager"
          sizes="100vw" style={{ objectFit: "cover" }} />
        <motion.div
          key={step}
          className="hero-word-cycle__layer"
          initial={step === 0 ? false : { clipPath: reduced ? VISIBLE : HIDDEN, opacity: reduced ? 0 : 1 }}
          animate={{ clipPath: VISIBLE, opacity: 1 }}
          transition={{ duration: reduced ? 0.15 : TRANSITION_S, ease: EASE }}
        >
          <Image src={active.image} alt="" fill unoptimized loading="eager"
            sizes="100vw" style={{ objectFit: "cover" }} />
        </motion.div>
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
                key={step}
                initial={{ y: reduced ? 0 : "100%", opacity: reduced ? 1 : 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: reduced ? 0 : 0.12, duration: reduced ? 0 : 0.35, ease: EASE } }}
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
