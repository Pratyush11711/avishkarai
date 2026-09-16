"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "./HeroVideo";

const ITEMS = [
  { word: "Fast", image: "/hero-mask-1.png" },
  { word: "Crafted", image: "/hero-mask-2.png" },
  { word: "Dependable", image: "/hero-mask-3.png" },
] as const;
const HOLD_MS = 2600;
const TRANSITION_S = 0.7;
const READY_FALLBACK_MS = 4000;
const EASE = [0.76, 0, 0.24, 1] as const;
const HIDDEN = "polygon(0 0, 0 0, 0 100%, 0 100%)";
const VISIBLE = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";

function decodeImage(img: HTMLImageElement) {
  if (img.complete && img.naturalWidth > 0) {
    return img.decode().catch(() => undefined);
  }

  return new Promise<void>((resolve) => {
    const finish = () => resolve();
    img.addEventListener("load", finish, { once: true });
    img.addEventListener("error", finish, { once: true });
  }).then(() => {
    if (img.naturalWidth > 0) return img.decode().catch(() => undefined);
  });
}

export function HeroWordImageCycle({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(0);
  const reduced = usePrefersReducedMotion();
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const index = step % ITEMS.length;
  const prevIndex = step === 0 ? index : (step - 1) % ITEMS.length;
  const active = ITEMS[index];
  const duration = reduced ? 0 : TRANSITION_S;

  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const waitForImages = () => {
      const imgs = imgRefs.current.filter((el): el is HTMLImageElement => el != null);
      return Promise.all(imgs.map(decodeImage));
    };

    const tick = () => {
      timer = setTimeout(() => {
        if (!disposed && !document.hidden) setStep((value) => value + 1);
        if (!disposed) tick();
      }, HOLD_MS + TRANSITION_S * 1000);
    };

    Promise.race([
      waitForImages(),
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, READY_FALLBACK_MS);
      }),
    ]).then(() => {
      if (!disposed) tick();
    });

    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <div className="hero-word-cycle__image" aria-hidden="true">
        {ITEMS.map((item, i) => {
          const isActive = i === index;
          const isPrev = i === prevIndex;
          return (
            <motion.div
              key={item.image}
              className="hero-word-cycle__layer"
              initial={false}
              animate={{ clipPath: isActive || isPrev ? VISIBLE : HIDDEN }}
              transition={{ duration, ease: EASE }}
              style={{ zIndex: isActive ? 2 : isPrev ? 1 : 0 }}
            >
              <img
                ref={(el) => {
                  imgRefs.current[i] = el;
                }}
                src={item.image}
                alt=""
                draggable={false}
                decoding="async"
                fetchPriority={i === 0 ? "high" : "low"}
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
            <span className="hero-word-cycle__sizer">Dependable</span>
            <AnimatePresence initial={false}>
              <motion.span
                key={step}
                className="hero-word-cycle__text"
                initial={reduced ? false : { y: "110%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-110%" }}
                transition={{ duration, ease: EASE }}
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
