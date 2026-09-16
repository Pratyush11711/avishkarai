"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { HeadingReveal, LineReveal } from "@/components/ui/TypeReveal";
import { HeroWordImageCycle } from "./HeroWordImageCycle";
import { HeroErrorBoundary } from "./HeroErrorBoundary";

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
  const statementRef = useRef<HTMLElement>(null);

  return (
    <>
      <div className="lh" suppressHydrationWarning>
        <section
          id="hero"
          className="lh-intro"
          aria-label="Hero"
        >
          <HeroWordImageCycle>
            <h1 className="lh-intro-title">
              We ship products that look like art.{" "}
              <br className="lh-intro-br" />
              In Hours, not Months.
            </h1>
          </HeroWordImageCycle>
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
                <HeadingReveal text="We ship products that look like art." />
              </span>
              <span className="lh-statement-line">
                <HeadingReveal text="In Hours, not Months." />
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
