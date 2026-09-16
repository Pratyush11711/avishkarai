"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function ProcessCTA() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, amount: 0.3 });
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    setSpot({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  }

  return (
    <div ref={wrapRef} className="pcta-wrap">
      <motion.a
        href="#contact"
        className="pcta"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={
          {
            "--sx": `${spot.x}%`,
            "--sy": `${spot.y}%`,
          } as React.CSSProperties
        }
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        whileHover={{ y: -6, scale: 1.008 }}
        transition={{ duration: 0.7, ease }}
      >
        {/* Spotlight that follows cursor */}
        <span className="pcta-spotlight" aria-hidden />

        {/* Continuous diagonal shimmer */}
        <span className="pcta-shimmer" aria-hidden />

        {/* Mesh gradient noise layer */}
        <span className="pcta-mesh" aria-hidden />

        {/* Main content */}
        <span className="pcta-inner">
          <span className="pcta-left">
            <motion.span
              className="pcta-label"
              animate={hovered ? { x: 4 } : { x: 0 }}
              transition={{ duration: 0.35, ease }}
            >
              Book your Build Review
            </motion.span>
            <span className="pcta-sub">30 minutes. No pitch deck.</span>
          </span>

          <motion.span
            className="pcta-arrow"
            aria-hidden
            animate={hovered ? { x: 10, rotate: -45 } : { x: 0, rotate: 0 }}
            transition={{ duration: 0.35, ease }}
          >
            →
          </motion.span>
        </span>

        {/* Rainbow gradient line — sweeps in from left */}
        <motion.span
          className="pcta-line"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.45, ease }}
          aria-hidden
        />
      </motion.a>
    </div>
  );
}
