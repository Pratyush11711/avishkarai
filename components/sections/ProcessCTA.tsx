"use client";

import { Component, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { motion, useInView, useReducedMotion } from "framer-motion";

const FluidCanvas = dynamic(
  () => import("./process-cta-fluid/FluidCanvas"),
  { ssr: false }
);

const ease = [0.22, 1, 0.36, 1] as const;

class FluidBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export function ProcessCTA() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const inView = useInView(wrapRef, { once: true, amount: 0.2 });
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <div ref={wrapRef} className="pcta-wrap">
      <motion.a
        ref={linkRef}
        href="#contact"
        className="pcta"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 }}
        whileHover={reducedMotion ? undefined : { y: -6, scale: 1.008 }}
        transition={{ duration: 0.7, ease }}
      >
        {reducedMotion !== true && (
          <FluidBoundary>
            <FluidCanvas hostRef={linkRef} playing={inView} />
          </FluidBoundary>
        )}

        <span className="pcta-inner">
          <span className="pcta-left">
            <motion.span
              className="pcta-label"
              animate={hovered && reducedMotion !== true ? { x: 4 } : { x: 0 }}
              transition={{ duration: 0.35, ease }}
            >
              Book your Build Review
            </motion.span>
            <span className="pcta-sub">30 minutes. No pitch deck.</span>
          </span>

          <motion.span
            className="pcta-arrow"
            aria-hidden
            animate={
              hovered && reducedMotion !== true
                ? { x: 10, rotate: -45 }
                : { x: 0, rotate: 0 }
            }
            transition={{ duration: 0.35, ease }}
          >
            →
          </motion.span>
        </span>

        <motion.span
          className="pcta-line"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 1 }}
          transition={{ duration: 1, delay: 0.45, ease }}
          aria-hidden
        />
      </motion.a>
    </div>
  );
}
