"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

const PILLARS = [
  {
    number: "01",
    eyebrow: "Built to last",
    heading: "Enterprise standard, from commit one.",
    body: "Multi-tenant architecture. Role-based access control. Audit logging. Encryption in transit and at rest. Automated CI/CD, real test coverage, documented APIs, infrastructure as code.",
    closing: "We build the thing you scale, not the thing you replace.",
    accent: "#fff100",
    accentText: "#5a4f00",
  },
  {
    number: "02",
    eyebrow: "Made to matter",
    heading: "Designed like a product, not a project.",
    body: "Your first users, your first investors, and your first enterprise buyer all form their opinion in about four seconds. We don't hand that moment to a template.",
    closing: "Nobody should be able to tell it's version one.",
    accent: "#d1ffca",
    accentText: "#1a6b12",
  },
  {
    number: "03",
    eyebrow: "Kept in motion",
    heading: "Shipped on a clock, not a hope.",
    body: "Fixed scope. Weekly deploys. A named senior engineer and a founder who answers directly, not an account manager relaying messages across a time zone.",
    closing: "That's the whole relationship in one sentence.",
    accent: "#111111",
    accentText: "#ffffff",
  },
] as const;

const AUTO_INTERVAL = 3200;

type Pillar = (typeof PILLARS)[number];

function pointsFromBody(body: string) {
  return body
    .split(/(?<=\.)\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function PillarPanel({
  pillar,
  onSelect,
  animate = true,
}: {
  pillar: Pillar;
  onSelect: (index: number) => void;
  animate?: boolean;
}) {
  const points = pointsFromBody(pillar.body);
  const activeIndex = PILLARS.findIndex((p) => p.number === pillar.number);

  return (
    <div className="h-full flex flex-col justify-between p-8 md:p-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span
            className="inline-block px-2.5 py-1 rounded-full type-caption font-semibold"
            style={{ background: pillar.accent, color: pillar.accentText }}
          >
            {pillar.eyebrow}
          </span>
        </div>
        <h3 className="type-heading-sm text-carbon-black mb-8 md:mb-10 max-w-[22ch]">
          {pillar.heading}
        </h3>

        <ul className="flex flex-col gap-0">
          {points.map((point, j) => (
            <motion.li
              key={`${pillar.number}-${j}`}
              initial={animate ? { opacity: 0, x: -12 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                delay: animate ? j * 0.055 : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex items-start gap-4 py-3 border-b border-ash/50 last:border-0"
            >
              <span
                aria-hidden
                className="w-1 h-1 rounded-full shrink-0 mt-2"
                style={{
                  background: pillar.accent === "#fff100" ? "#b8a000" : pillar.accent,
                }}
              />
              <span className="type-body-sm text-carbon-black">{point}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex items-start justify-between gap-6">
        <p className="type-body-sm font-semibold text-carbon-black max-w-[36ch]">
          {pillar.closing}
        </p>
        <div className="flex items-center gap-1.5 shrink-0 pt-1">
          {PILLARS.map((item, i) => (
            <button
              key={item.number}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Go to ${item.eyebrow}`}
              className={clsx(
                "rounded-full transition-all duration-300",
                i === activeIndex ? "w-4 h-1.5" : "w-1.5 h-1.5 bg-ash hover:bg-slate"
              )}
              style={i === activeIndex ? { background: pillar.accent } : {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function WhatWeStandOn() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => {
      setActive((prev) => (prev + 1) % PILLARS.length);
    }, AUTO_INTERVAL);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, paused]);

  const pillar = PILLARS[active];

  return (
    <section id="principles" className="section-pad" aria-label="What we stand on">
      <div className="page-wrap">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-10 md:mb-14 gap-6"
        >
          <div>
            <span className="type-caption text-smoke">What we stand on</span>
            <h2 className="type-heading mt-3 max-w-[16ch] text-carbon-black">
              The principles behind every build.
            </h2>
          </div>
          <span className="type-caption text-smoke tabular-nums hidden sm:block">
            {String(active + 1).padStart(2, "0")} / {String(PILLARS.length).padStart(2, "0")}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-[1fr_1.4fr] md:items-stretch gap-0"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="flex flex-col border-t border-ash md:border-r md:border-t md:h-full"
            role="tablist"
            aria-label="Principles"
          >
            {PILLARS.map((item, i) => {
              const isActive = active === i;
              return (
                <button
                  key={item.number}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  className={clsx(
                    "group relative text-left flex items-center gap-4 px-0 py-5 md:py-6 md:flex-1 border-b border-ash",
                    "transition-colors duration-200 focus-visible:outline-none",
                    isActive ? "md:pr-8" : "hover:md:pr-4"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="principleActiveBar"
                      className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full"
                      style={{ background: item.accent }}
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}

                  <span
                    className={clsx(
                      "ml-4 md:ml-6 font-mono text-[11px] leading-none tabular-nums transition-colors duration-200 shrink-0",
                      isActive ? "text-carbon-black" : "text-smoke"
                    )}
                  >
                    {item.number}
                  </span>

                  <span
                    className={clsx(
                      "flex-1 font-bold tracking-tight transition-colors duration-200",
                      isActive
                        ? "type-heading-sm text-carbon-black"
                        : "type-heading-sm text-smoke hover:text-carbon-black"
                    )}
                  >
                    {item.eyebrow}
                  </span>

                  <span
                    aria-hidden
                    className={clsx(
                      "w-1.5 h-1.5 rounded-full mr-4 md:mr-6 transition-all duration-300 shrink-0",
                      isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    )}
                    style={{
                      background: item.accent,
                      boxShadow: `0 0 6px 2px ${item.accent}88`,
                    }}
                  />

                  {isActive && !paused && (
                    <motion.div
                      key={`${active}-timer`}
                      className="absolute bottom-0 left-0 h-[2px] rounded-full"
                      style={{ background: item.accent }}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: AUTO_INTERVAL / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative grid overflow-hidden bg-paper-white rounded-b-[24px] md:rounded-b-none md:rounded-r-[24px] border-b border-ash md:border-b-0">
            {PILLARS.map((item) => (
              <div
                key={`sizer-${item.number}`}
                className="invisible pointer-events-none col-start-1 row-start-1"
                aria-hidden
              >
                <PillarPanel pillar={item} onSelect={() => {}} animate={false} />
              </div>
            ))}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <PillarPanel pillar={pillar} onSelect={setActive} />
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              <motion.span
                key={`num-${active}`}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.08 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                aria-hidden
                className="absolute -bottom-6 -right-4 font-bold leading-none select-none pointer-events-none"
                style={{
                  fontSize: "clamp(120px, 18vw, 200px)",
                  color: pillar.accent,
                  opacity: pillar.accent === "#111111" ? 0.08 : 0.18,
                  letterSpacing: "-0.05em",
                }}
              >
                {pillar.number}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
