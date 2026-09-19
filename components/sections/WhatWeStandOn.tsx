"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollTrigger } from "@/lib/gsap";
import { PrincipleRail } from "@/components/sections/PrincipleRail";
import { usePrefersReducedMotion } from "@/components/hero/HeroVideo";

type Principle = {
  id: string;
  title: string;
  paragraphs: [string, string];
  closer: string;
  video?: string;
};

const PRINCIPLES: Principle[] = [
  {
    id: "version-you-keep",
    video: "/stand1.mp4",
    title: "The version you keep",
    paragraphs: [
      "Most MVPs are a demo with a database behind them. They hold up until people actually start using them, and then they get rewritten. The rewrite usually costs more than the first build did.",
      "So we build the real thing first: multi-tenant architecture, access control, audit logs, encryption, CI/CD, tests, documented APIs.",
    ],
    closer: "The first version and the one you scale are the same codebase.",
  },
  {
    id: "four-seconds",
    video: "/stand2.mp4",
    title: "The four seconds before anyone reads a word",
    paragraphs: [
      "Your first user, your first investor and your first enterprise buyer all decide what kind of company you are before they click anything.",
      "So every build ships with a real design system. Typography, motion, empty states, error states, dark mode where it matters.",
    ],
    closer: "It should not read as version one.",
  },
  {
    id: "never-ask",
    video: "/stand3.mp4",
    title: "You never have to ask where it is",
    paragraphs: [
      "Every Thursday there is a new build on a real URL, plus a short Loom on what changed.",
      "You have a senior engineer and a founder in your Slack, not an account manager passing messages alone.",
    ],
    closer: "You never have to chase the work.",
  },
];

const COUNT = PRINCIPLES.length;
const INDEX_THRESH = 0.08;
const SETTLE_IN = 0.1;
const SETTLE_OUT = 0.1;

function settleProgress(raw: number) {
  const p = Math.min(1, Math.max(0, raw));
  if (p <= SETTLE_IN) return 0;
  if (p >= 1 - SETTLE_OUT) return 1;
  return (p - SETTLE_IN) / (1 - SETTLE_IN - SETTLE_OUT);
}

function indexToRawProgress(index: number, local = 0.22) {
  const mapped = (index + local) / COUNT;
  return SETTLE_IN + mapped * (1 - SETTLE_IN - SETTLE_OUT);
}

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

function PrincipleCopy({
  principle,
  index,
  reducedMotion,
  animateCopy,
}: {
  principle: Principle;
  index: number;
  reducedMotion: boolean;
  animateCopy: boolean;
}) {
  const lines = [...principle.paragraphs, principle.closer];

  return (
    <div className="principles-copy-block">
      <span className="principles-index">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3
        id={animateCopy ? `principle-title-${principle.id}` : undefined}
        className="principles-title"
      >
        {principle.title}
      </h3>
      <div className="principles-copy">
        {lines.map((p, i) => {
          const isCloser = i === lines.length - 1;
          const className = isCloser
            ? "principles-copy-p principles-copy-closer"
            : "principles-copy-p";
          if (animateCopy && !reducedMotion) {
            return (
              <motion.p
                key={`${principle.id}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.06 + i * 0.05,
                  duration: 0.28,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={className}
              >
                {p}
              </motion.p>
            );
          }
          return (
            <p key={`${principle.id}-${i}`} className={className}>
              {p}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function PrincipleMedia({
  activeId,
  reducedMotion,
}: {
  activeId: string;
  reducedMotion: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLVideoElement | null>>({});
  const activeRef = useRef(activeId);
  activeRef.current = activeId;

  useEffect(() => {
    const nodes = Object.entries(refs.current);
    nodes.forEach(([id, video]) => {
      if (!video) return;
      if (reducedMotion || id !== activeId) {
        video.pause();
        return;
      }
      video.play().catch(() => {});
    });
  }, [activeId, reducedMotion]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || reducedMotion) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        Object.entries(refs.current).forEach(([id, video]) => {
          if (!video) return;
          if (entry.isIntersecting && id === activeRef.current) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(frame);
    return () => io.disconnect();
  }, [reducedMotion]);

  return (
    <div className="principles-media">
      <div ref={frameRef} className="principles-figure" aria-hidden="true">
        {PRINCIPLES.map((p) =>
          p.video ? (
            <video
              key={p.id}
              ref={(node) => {
                refs.current[p.id] = node;
              }}
              data-principle-id={p.id}
              className={
                p.id === activeId
                  ? "principles-figure-video is-active"
                  : "principles-figure-video"
              }
              src={p.video}
              muted
              loop
              playsInline
              preload="auto"
              autoPlay={!reducedMotion && p.id === activeId}
            />
          ) : null
        )}
      </div>
    </div>
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
  const [rawProgress, setRawProgress] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [compact, setCompact] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches
  );
  const [fitsViewport, setFitsViewport] = useState(true);
  const [debug, setDebug] = useState(false);

  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef(0);

  const lastFillRef = useRef(-1);
  const lastProgressRef = useRef(-1);
  const debugRef = useRef(false);

  const paint = useCallback((progress: number) => {
    if (debugRef.current) setRawProgress(progress);
    const next = splitProgress(settleProgress(progress), indexRef.current);
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
    const params = new URLSearchParams(window.location.search);
    const on = params.has("principlesDebug");
    debugRef.current = on;
    setDebug(on);
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
    const inner = track?.querySelector<HTMLElement>(".principles-sticky-inner");
    const sticky = track?.querySelector<HTMLElement>(".principles-sticky");
    if (!inner || !sticky) return;
    const measure = () => {
      const navHeight = parseFloat(getComputedStyle(sticky).getPropertyValue("--nav-h")) || 76;
      setFitsViewport(inner.getBoundingClientRect().height <= window.innerHeight - navHeight - 44);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const scrubEnabled = !reducedMotion && (compact || fitsViewport);

  useEffect(() => {
    if (!scrubEnabled) return;
    ScrollTrigger.refresh();
  }, [scrubEnabled, compact, fitsViewport]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !scrubEnabled) {
      paint(0);
      return;
    }

    const st = ScrollTrigger.create({
      id: "principles-rail",
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      scrub: compact ? 1.1 : 1.8,
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
  }, [paint, scrubEnabled, compact]);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.min(COUNT - 1, Math.max(0, next));
      const st = stRef.current;
      if (st && !reducedMotion) {
        const span = st.end - st.start;
        st.scroll(st.start + indexToRawProgress(clamped) * span);
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
      className="principles-track relative z-[1]"
      data-static={reducedMotion || (!compact && !fitsViewport)}
      data-mobile-scrub={compact && scrubEnabled ? "true" : undefined}
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
          <div className="principles-intro">
            <span className="type-caption text-smoke">04 · What we stand on</span>
            <h2 className="type-heading mt-2 max-w-[12ch] text-carbon-black md:mt-3 md:max-w-[16ch]">
              The principles behind every build.
            </h2>
          </div>

          <div
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="principles-card relative rounded-[32px] bg-paper-white shadow-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            <PrincipleRail
              count={COUNT}
              activeIndex={index}
              segmentFill={scrubEnabled ? segmentFill : 1}
              overallProgress={scrubEnabled ? overallProgress : (index + 1) / COUNT}
              onSelect={goTo}
              compact={false}
            />

            <div className="principles-layout">
              <div className="principles-copy-col">
                <div className="principles-sizer" aria-hidden="true">
                  {PRINCIPLES.map((principle, i) => (
                    <div key={principle.id} className="principles-sizer-item">
                      <PrincipleCopy
                        principle={principle}
                        index={i}
                        reducedMotion
                        animateCopy={false}
                      />
                    </div>
                  ))}
                </div>

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
                    className="principles-panel-slide"
                  >
                    <PrincipleCopy
                      principle={active}
                      index={index}
                      reducedMotion={reducedMotion}
                      animateCopy
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <PrincipleMedia activeId={active.id} reducedMotion={reducedMotion} />
            </div>
          </div>
        </div>
      </div>

      {debug ? (
        <div className="principles-debug">
          raw {rawProgress.toFixed(3)} · settled {settleProgress(rawProgress).toFixed(3)} ·
          step {index + 1}
        </div>
      ) : null}
    </section>
  );
}

export default WhatWeStandOn;
