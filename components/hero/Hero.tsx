"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { HeadingReveal, LineReveal } from "@/components/ui/TypeReveal";
import { HeroPlus } from "./HeroPlus";
import { HeroErrorBoundary } from "./HeroErrorBoundary";
import { usePrefersReducedMotion } from "./HeroVideo";

const HeroCrossField = dynamic(
  () =>
    import("./HeroCrossField")
      .then((m) => ({
        default: m.HeroCrossField ?? m.default ?? (() => null),
      }))
      .catch((error) => {
        console.error("HeroCrossField failed to load", error);
        return { default: () => null };
      }),
  { ssr: false }
);

const HeroRibbon = dynamic(
  () =>
    import("./HeroRibbon")
      .then((m) => ({
        default: m.HeroRibbon ?? m.default ?? (() => null),
      }))
      .catch(() => ({ default: () => null })),
  { ssr: false }
);

export function Hero() {
  const introRef = useRef<HTMLElement>(null);
  const statementRef = useRef<HTMLElement>(null);
  const [crossPlaying, setCrossPlaying] = useState(true);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = introRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => setCrossPlaying(entry.isIntersecting && !prefersReduced),
      { rootMargin: "160px 0px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [prefersReduced]);

  return (
    <>
      <div className="lh">
        <section
          ref={introRef}
          id="hero"
          className="lh-intro"
          aria-label="Hero"
        >
          <div className="lh-intro-copy">
            <h1 className="lh-intro-title">
              We build production-grade software
              <br className="lh-intro-br" />
              and interactive product experiences
              <br className="lh-intro-br" />
              that help teams ship in eight weeks.
            </h1>
          </div>

          <div className="lh-visual" aria-hidden={!crossPlaying}>
            {prefersReduced ? (
              <div className="lh-visual-fallback" />
            ) : (
              <HeroErrorBoundary fallback={<div className="lh-visual-fallback" />}>
                <HeroCrossField playing={crossPlaying} />
              </HeroErrorBoundary>
            )}
          </div>

          <div className="lh-explore" aria-hidden="true">
            <HeroPlus />
            <HeroPlus />
            <span className="lh-explore-text">Scroll to explore</span>
            <HeroPlus />
            <HeroPlus />
          </div>
        </section>

        <section
          ref={statementRef}
          className="lh-statement"
          aria-label="What we ship"
        >
          <HeroErrorBoundary fallback={null}>
            <HeroRibbon triggerRef={statementRef} />
          </HeroErrorBoundary>

          <div className="lh-statement-grid">
            <h2 className="lh-statement-title">
              <span className="lh-statement-line">
                <HeadingReveal text="Live in eight weeks," />
              </span>
              <span className="lh-statement-line">
                <HeadingReveal text="Enterprise-grade" />
              </span>
              <span className="lh-statement-line">
                <HeadingReveal text="from day one." />
              </span>
            </h2>

            <div className="lh-statement-aside">
              <p className="lh-statement-body">
                <LineReveal text="Your MVP shouldn't look like an MVP. We build production-grade software with the design finesse of a funded product: multi-tenant architecture, real test coverage, a design system, and a launch date you can put on a calendar." />
              </p>
              <a className="lh-approach" href="#contact">
                <span className="lh-approach-dot" aria-hidden="true" />
                <span>Book a 30-minute build review</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.6"
                    d="M2.3 8h11.4m0 0L8.7 3M13.7 8l-5 5"
                  />
                </svg>
              </a>
              <p className="lh-statement-micro">
                Typical MVP: 8 weeks. Regulated or integration-heavy platforms:
                10 to 14. You get the real number in writing before you sign
                anything.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Hero;
