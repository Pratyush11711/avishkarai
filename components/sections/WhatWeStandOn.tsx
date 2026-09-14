"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollTrigger } from "@/lib/gsap";
import { PrincipleRail } from "@/components/sections/PrincipleRail";
import { usePrefersReducedMotion } from "@/components/hero/HeroVideo";

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

const COUNT = PRINCIPLES.length;
const INDEX_THRESH = 0.08;

function splitProgress(progress: number, heldIndex: number) {
  const p = Math.min(1, Math.max(0, progress));
  const scaled = p * COUNT;
  const rawIndex = Math.min(COUNT - 1, Math.max(0, Math.floor(scaled)));
  const local = scaled - rawIndex;

  let index = heldIndex;
  if (rawIndex > heldIndex) {
    if (rawIndex >= heldIndex + 2 || local >= INDEX_THRESH) index = rawIndex;
  } else if (rawIndex < heldIndex) {
    if (rawIndex <= heldIndex - 2 || local <= 1 - INDEX_THRESH) index = rawIndex;
  } else {
    index = rawIndex;
  }
  index = Math.min(COUNT - 1, Math.max(0, index));

  const segmentFill =
    rawIndex > index ? 1 : rawIndex < index ? 0 : Math.min(1, Math.max(0, local));

  return { index, segmentFill, overallProgress: p };
}

function BulletList({
  bullets,
  reducedMotion,
}: {
  bullets: string[];
  reducedMotion: boolean;
}) {
  return (
    <ul className="mt-3 space-y-2 md:mt-4 md:space-y-3">
      {bullets.map((b, i) => (
        <li key={b} className="flex items-start gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
          <span className="principles-line min-w-0 flex-1">
            <motion.span
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { delay: 0.08 + i * 0.06, duration: 0.22 }
              }
              className="block font-mono text-sm leading-snug text-slate"
            >
              {b}
            </motion.span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function WhatWeStandOn() {
  "use no memo";
  const reducedMotion = usePrefersReducedMotion();
  const trackRef = useRef<HTMLElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const indexRef = useRef(0);

  const [index, setIndex] = useState(0);
  const [segmentFill, setSegmentFill] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [compact, setCompact] = useState(false);

  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef(0);

  const lastFillRef = useRef(-1);
  const lastProgressRef = useRef(-1);

  const paint = useCallback((progress: number) => {
    const next = splitProgress(progress, indexRef.current);
    if (next.index !== indexRef.current) {
      setDirection(next.index > indexRef.current ? 1 : -1);
      indexRef.current = next.index;
      setIndex(next.index);
    }
    if (Math.abs(next.segmentFill - lastFillRef.current) > 0.002) {
      lastFillRef.current = next.segmentFill;
      setSegmentFill(next.segmentFill);
    }
    if (Math.abs(next.overallProgress - lastProgressRef.current) > 0.002) {
      lastProgressRef.current = next.overallProgress;
      setOverallProgress(next.overallProgress);
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reducedMotion) {
      paint(0);
      return;
    }

    const st = ScrollTrigger.create({
      id: "principles-rail",
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.8,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        targetRef.current = self.progress;
      },
    });
    stRef.current = st;
    targetRef.current = st.progress;
    currentRef.current = st.progress;
    paint(st.progress);
    ScrollTrigger.refresh();

    const tick = () => {
      const cur = currentRef.current;
      const next = cur + (targetRef.current - cur) * 0.08;
      currentRef.current = Math.abs(targetRef.current - next) < 0.0008 ? targetRef.current : next;
      paint(currentRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      st.kill();
      stRef.current = null;
    };
  }, [paint, reducedMotion]);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.min(COUNT - 1, Math.max(0, next));
      const st = stRef.current;
      if (st && !reducedMotion) {
        const span = st.end - st.start;
        st.scroll(st.start + ((clamped + 0.22) / COUNT) * span);
        return;
      }
      setDirection(clamped > indexRef.current ? 1 : -1);
      indexRef.current = clamped;
      setIndex(clamped);
      setSegmentFill(1);
      setOverallProgress((clamped + 1) / COUNT);
    },
    [reducedMotion]
  );

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

  const active = PRINCIPLES[index];

  return (
    <section
      ref={trackRef}
      id="studio"
      className="principles-track relative z-0"
      aria-label="What we stand on"
      style={
        {
          "--accent": "var(--color-primary)",
          "--rail-track": "color-mix(in srgb, var(--color-text) 10%, transparent)",
          "--principles-runway": COUNT,
        } as React.CSSProperties
      }
    >
      <div className="principles-sticky">
        <div className="page-wrap principles-sticky-inner">
          <div className="mb-6 md:mb-8">
            <span className="type-caption text-smoke">What we stand on</span>
            <h2 className="type-heading mt-2 max-w-[16ch] text-carbon-black md:mt-3">
              The principles behind every build.
            </h2>
          </div>

          <div
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="principles-card relative rounded-[32px] bg-paper-white p-6 shadow-sm outline-none md:p-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
              <PrincipleRail
                count={COUNT}
                activeIndex={index}
                segmentFill={reducedMotion ? 1 : segmentFill}
                overallProgress={reducedMotion ? (index + 1) / COUNT : overallProgress}
                onSelect={goTo}
                compact={compact}
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
                      : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
                  }
                  className="mt-5 overflow-visible md:mt-8"
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
                  <p className="mt-4 font-semibold text-carbon-black md:mt-6">{active.closer}</p>
                </motion.div>
              </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhatWeStandOn;
