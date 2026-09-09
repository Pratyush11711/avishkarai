"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { SandDuneBackground } from "./lets-work/SandDuneBackground";

const EASE = [0.22, 1, 0.36, 1] as const;
const TITLE_LINES = ["Let's work", "together!"];
const VIEWPORT = { once: true, margin: "-80px" };

const MASK_REVEAL: Variants = {
  hidden: { y: "130%" },
  visible: ({ index, reduced }: { index: number; reduced: boolean }) => ({
    y: "0%",
    transition: reduced
      ? { duration: 0 }
      : { duration: 1, ease: EASE, delay: 0.05 + index * 0.12 },
  }),
};

export function LetsWorkTogether() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      className="lwt"
      aria-label="Work with us"
    >
      {/* Height-field sand simulation */}
      {!reduced && <SandDuneBackground />}

      {/* Text sits above the particles */}
      <div className="lwt-sticky">
        <div className="lwt-content">
          <motion.div
            className="lwt-subtitle"
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            <motion.p
              variants={MASK_REVEAL}
              custom={{ index: 0, reduced: Boolean(reduced) }}
            >
              Is your big idea ready to ship?
            </motion.p>
          </motion.div>

          <motion.a
            href="#contact"
            className="lwt-title"
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            {TITLE_LINES.map((line, lineIndex) => (
              <span key={line} className="lwt-line">
                <motion.span
                  className="lwt-line-inner"
                  variants={MASK_REVEAL}
                  custom={{ index: lineIndex + 1, reduced: Boolean(reduced) }}
                >
                  {line.split("").map((char, charIndex) => (
                    <span
                      key={`${char}-${charIndex}`}
                      className="lwt-char"
                      style={{ ["--i" as string]: charIndex }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </motion.span>
              </span>
            ))}
          </motion.a>
        </div>
      </div>

      <div className="lwt-scroll-hint" aria-hidden="true">
        <span className="lwt-scroll-arrow">
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
            <path
              d="M6 1v10.5M2 8.5 6 12.5 10 8.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>Continue to scroll</span>
        <span className="lwt-scroll-arrow">
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
            <path
              d="M6 1v10.5M2 8.5 6 12.5 10 8.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </section>
  );
}
