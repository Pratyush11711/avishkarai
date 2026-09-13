"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PrincipleRail } from "@/components/sections/PrincipleRail";
import { usePrefersReducedMotion } from "@/components/hero/HeroVideo";

const AUTO_ADVANCE_MS = 6000;
const TOUCH_RESUME_MS = 1500;

type Principle = {
  id: string;
  title: string;
  intro: string;
  bullets: string[];
  closer: string;
};

const PRINCIPLES: Principle[] = [
  {
    id: "built-to-last",
    title: "Built to last",
    intro: "Enterprise standard, from commit one.",
    bullets: [
      "Multi-tenant architecture.",
      "Role-based access control.",
      "Audit logging.",
      "Encryption in transit and at rest.",
      "Automated CI/CD, real test coverage, documented APIs, infrastructure as code.",
    ],
    closer: "We build the thing you scale, not the thing you replace.",
  },
  {
    id: "made-to-matter",
    title: "Made to matter",
    intro: "Designed like a product, not a project.",
    bullets: [
      "Your first users form their opinion in about four seconds.",
      "Your first investors do too.",
      "So does your first enterprise buyer.",
      "We don't hand that moment to a template.",
    ],
    closer: "Nobody should be able to tell it's version one.",
  },
  {
    id: "kept-in-motion",
    title: "Kept in motion",
    intro: "Shipped on a clock, not a hope.",
    bullets: [
      "Fixed scope.",
      "Weekly deploys.",
      "A named senior engineer.",
      "A founder who answers directly, not an account manager relaying messages across a time zone.",
    ],
    closer: "That's the whole relationship in one sentence.",
  },
];

function BulletList({
  bullets,
  reducedMotion,
}: {
  bullets: string[];
  reducedMotion: boolean;
}) {
  return (
    <ul className="mt-4 space-y-3">
      {bullets.map((b, i) => (
        <motion.li
          key={b}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { delay: 0.1 + i * 0.08, duration: 0.25 }
          }
          className="flex items-start gap-3"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
          <span className="font-mono text-sm text-slate">{b}</span>
        </motion.li>
      ))}
    </ul>
  );
}

function HeadingConnector({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <svg
      className="pointer-events-none absolute left-1/2 top-0 h-16 w-px -translate-x-1/2 -translate-y-full"
      viewBox="0 0 2 64"
      aria-hidden
    >
      <motion.path
        d="M1 0 V64"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeDasharray="1 1"
        initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={
          reducedMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }
        }
      />
    </svg>
  );
}

export function WhatWeStandOn() {
  "use no memo";
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [fillKey, setFillKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [compact, setCompact] = useState(false);
  const touchResumeRef = useRef<number>(0);
  const indexRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  indexRef.current = index;

  const goTo = useCallback((next: number) => {
    const current = indexRef.current;
    const wrapped = (next + PRINCIPLES.length) % PRINCIPLES.length;
    setDirection(next < current || (current === 0 && next < 0) ? -1 : 1);
    setIndex(wrapped);
    setFillKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "80px 0px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || paused || !inView) return undefined;
    const id = window.setTimeout(() => {
      goTo(indexRef.current + 1);
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(id);
  }, [index, fillKey, paused, inView, reducedMotion, goTo]);

  useEffect(() => {
    return () => {
      if (touchResumeRef.current) window.clearTimeout(touchResumeRef.current);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  const handleTouchStart = () => {
    if (touchResumeRef.current) window.clearTimeout(touchResumeRef.current);
    setPaused(true);
  };

  const handleTouchEnd = () => {
    if (touchResumeRef.current) window.clearTimeout(touchResumeRef.current);
    touchResumeRef.current = window.setTimeout(() => {
      setPaused(false);
      setFillKey((k) => k + 1);
    }, TOUCH_RESUME_MS);
  };

  const active = PRINCIPLES[index];

  return (
    <section
      id="principles"
      className="relative z-0 pb-14 md:pb-20 pt-[calc(5.5rem+24px)]"
      aria-label="What we stand on"
      style={
        {
          "--accent": "var(--color-primary)",
          "--rail-track": "color-mix(in srgb, var(--color-text) 10%, transparent)",
        } as React.CSSProperties
      }
    >
      <div className="page-wrap">
        <div className="mb-16">
          <span className="type-caption text-smoke">What we stand on</span>
          <h2 className="type-heading mt-3 max-w-[16ch] text-carbon-black">
            The principles behind every build.
          </h2>
        </div>

        <div className="relative">
          <HeadingConnector reducedMotion={reducedMotion} />

          <div
            ref={cardRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => {
              setPaused(false);
              setFillKey((k) => k + 1);
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative rounded-[32px] bg-paper-white p-8 shadow-sm outline-none md:p-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            <PrincipleRail
              count={PRINCIPLES.length}
              activeIndex={index}
              fillKey={fillKey}
              paused={paused}
              onSelect={goTo}
              compact={compact}
              reducedMotion={reducedMotion}
            />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={active.id}
                role="tabpanel"
                id="principles-panel"
                aria-live="polite"
                aria-labelledby={`principle-title-${active.id}`}
                custom={direction}
                initial={
                  reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * 24 }
                }
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                exit={
                  reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -24 }
                }
                transition={
                  reducedMotion
                    ? { duration: 0.12 }
                    : { duration: 0.22, ease: [0.4, 0, 0.2, 1] }
                }
                className="mt-8"
              >
                <span className="type-caption text-smoke">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3
                  id={`principle-title-${active.id}`}
                  className="mt-2 max-w-[14ch] font-medium tracking-[-0.02em] text-carbon-black text-[28px] md:text-4xl md:leading-[1.15]"
                >
                  {active.title}
                </h3>
                <p className="mt-4 text-lg text-slate">{active.intro}</p>
                <BulletList bullets={active.bullets} reducedMotion={reducedMotion} />
                <p className="mt-6 font-semibold text-carbon-black">{active.closer}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhatWeStandOn;
