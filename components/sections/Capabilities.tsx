"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

const CAPABILITIES = [
  {
    category: "Product",
    label: "From idea to interface",
    accent: "#d1ffca",
    accentText: "#1a6b12",
    items: [
      "Product strategy",
      "Scope definition",
      "Technical architecture",
      "Design systems",
      "UI and UX design",
      "Prototyping",
    ],
  },
  {
    category: "Engineering",
    label: "Code that ships on Thursday",
    accent: "#fff100",
    accentText: "#5a4f00",
    items: [
      "0→1 products and MVPs",
      "Multi-tenant SaaS platforms",
      "Mobile apps, iOS and Android",
      "API design and integration",
      "Data modeling and migrations",
      "Infrastructure as code",
    ],
  },
  {
    category: "Applied AI",
    label: "Models wired into real products",
    accent: "#dce8ff",
    accentText: "#1a3a7a",
    items: [
      "Voice agents",
      "Document intelligence",
      "Computer vision",
      "Agentic workflows",
      "Model integration and evaluation",
    ],
  },
  {
    category: "Platform",
    label: "Built to survive Series B",
    accent: "#ffe4b8",
    accentText: "#7a3a00",
    items: [
      "Compliance architecture, HIPAA-grade",
      "Security and access control",
      "Observability and monitoring",
      "Platform rescues and codebase audits",
      "App store submission",
    ],
  },
  {
    category: "Partnership",
    label: "Your team, extended",
    accent: "#f0d6ff",
    accentText: "#5a1a7a",
    items: [
      "Embedded product teams",
      "Ongoing engineering retainers",
      "Team augmentation on a defined workstream",
    ],
  },
];

const AUTO_INTERVAL = 3200;

export function Capabilities() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-cycle through categories
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => {
      setActive((prev) => (prev + 1) % CAPABILITIES.length);
    }, AUTO_INTERVAL);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, paused]);

  const cap = CAPABILITIES[active];

  return (
    <section id="capabilities" aria-label="Capabilities" className="section-pad">
      <div className="page-wrap">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-10 md:mb-14"
        >
          <span className="type-caption text-smoke">What we build</span>
          <span className="type-caption text-smoke tabular-nums">
            {String(active + 1).padStart(2, "0")} / {String(CAPABILITIES.length).padStart(2, "0")}
          </span>
        </motion.div>

        {/* Main grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-[1fr_1.4fr] gap-0 min-h-[480px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* ── Left: category list ── */}
          <div className="flex flex-col border-t border-ash md:border-r md:border-t">
            {CAPABILITIES.map((c, i) => {
              const isActive = active === i;
              return (
                <button
                  key={c.category}
                  onClick={() => setActive(i)}
                  className={clsx(
                    "group relative text-left flex items-center gap-4 px-0 py-5 md:py-6 border-b border-ash",
                    "transition-colors duration-200 focus-visible:outline-none",
                    isActive ? "md:pr-8" : "hover:md:pr-4"
                  )}
                >
                  {/* Active accent bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeBar"
                      className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full"
                      style={{ background: c.accent }}
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}

                  {/* Number */}
                  <span
                    className={clsx(
                      "ml-4 md:ml-6 font-mono text-[11px] leading-none tabular-nums transition-colors duration-200 shrink-0",
                      isActive ? "text-carbon-black" : "text-smoke"
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Category name */}
                  <span
                    className={clsx(
                      "flex-1 font-bold tracking-tight transition-colors duration-200",
                      isActive
                        ? "type-heading-sm text-carbon-black"
                        : "type-heading-sm text-smoke hover:text-carbon-black"
                    )}
                  >
                    {c.category}
                  </span>

                  {/* Accent dot on active */}
                  <span
                    aria-hidden
                    className={clsx(
                      "w-1.5 h-1.5 rounded-full mr-4 md:mr-6 transition-all duration-300 shrink-0",
                      isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    )}
                    style={{ background: c.accent, boxShadow: `0 0 6px 2px ${c.accent}88` }}
                  />

                  {/* Progress bar for auto-advance — only on active */}
                  {isActive && !paused && (
                    <motion.div
                      key={`${active}-timer`}
                      className="absolute bottom-0 left-0 h-[2px] rounded-full"
                      style={{ background: c.accent }}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: AUTO_INTERVAL / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Right: detail panel ── */}
          <div className="relative overflow-hidden bg-paper-white rounded-b-[24px] md:rounded-b-none md:rounded-r-[24px] border-b border-ash md:border-b-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="h-full flex flex-col justify-between p-8 md:p-12"
              >
                {/* Category headline */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="inline-block px-2.5 py-1 rounded-full type-caption font-semibold"
                      style={{ background: cap.accent, color: cap.accentText }}
                    >
                      {cap.category}
                    </span>
                  </div>
                  <p className="type-body text-smoke mb-8 md:mb-10">{cap.label}</p>

                  {/* Item list */}
                  <ul className="flex flex-col gap-0">
                    {cap.items.map((item, j) => (
                      <motion.li
                        key={`${active}-${j}`}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: j * 0.055,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="flex items-center gap-4 py-3 border-b border-ash/50 last:border-0"
                      >
                        <span
                          aria-hidden
                          className="w-1 h-1 rounded-full shrink-0"
                          style={{ background: cap.accent === "#fff100" ? "#b8a000" : cap.accent }}
                        />
                        <span className="type-body-sm text-carbon-black">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Item count */}
                <div className="mt-8 flex items-center justify-between">
                  <span className="type-caption text-smoke">
                    {cap.items.length} capabilities
                  </span>
                  {/* Mini nav dots */}
                  <div className="flex items-center gap-1.5">
                    {CAPABILITIES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActive(i)}
                        aria-label={`Go to ${CAPABILITIES[i].category}`}
                        className={clsx(
                          "rounded-full transition-all duration-300",
                          i === active
                            ? "w-4 h-1.5"
                            : "w-1.5 h-1.5 bg-ash hover:bg-slate"
                        )}
                        style={i === active ? { background: cap.accent } : {}}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Giant background number — depth layer */}
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
                  color: cap.accent,
                  opacity: 0.18,
                  letterSpacing: "-0.05em",
                }}
              >
                {String(active + 1).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
