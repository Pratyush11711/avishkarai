"use client";

import { forwardRef, useCallback, useEffect, useRef, useState, type Ref } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { HeadingReveal, LineReveal } from "@/components/ui/TypeReveal";

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else ref.current = value;
}

function useInViewOnce() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { rootMargin: "-8% 0px -12% 0px", threshold: 0.2 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return { ref, on };
}

export const FinalCTA = forwardRef<HTMLElement>(function FinalCTA(_, forwardedRef) {
  const sectionRef = useRef<HTMLElement>(null);
  const setSectionRef = useCallback(
    (node: HTMLElement | null) => {
      sectionRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef]
  );
  const copy = useInViewOnce();

  return (
    <section
      ref={setSectionRef}
      id="contact"
      className="py-28 md:py-40 bg-deep-navy"
      aria-label="Contact us"
    >
      <div className="page-wrap">
        <h2 className="cta-heading type-display mb-12 max-w-[20ch] leading-tight">
          <span className="cta-heading-line">
            <HeadingReveal text="Bring us the" />
            {" "}
            <HeadingReveal text="version of" accent startIndex={10} />
          </span>
          <span className="cta-heading-line">
            <HeadingReveal text="this you've already" />
            {" "}
            <HeadingReveal text="had" accent startIndex={17} />
          </span>
          <span className="cta-heading-line">
            <HeadingReveal text="quoted." accent />
          </span>
        </h2>

        <div
          ref={copy.ref}
          className={`cta-copy flex flex-col gap-8${copy.on ? " is-cta-copy-on" : ""}`}
        >
          <div className="flex flex-col gap-4 max-w-[60ch]">
            <p className="type-body text-text-inverse/75">
              <LineReveal text="Send us the scope another studio gave you, or the roadmap you've been sitting on for six months. In 30 minutes we'll tell you what we'd build, how long it would take, and what we'd cut." />
            </p>
            <p className="type-body text-text-inverse/75">
              <LineReveal text="If we're not the right fit, we'll say so on the call." />
            </p>
          </div>

          <div id="cta-action">
            <MagneticButton
              href="mailto:arpit@avishkarai.com,shivang@avishkarai.com?subject=Build%20review"
              variant="inverted"
              strength={0}
            >
              Book a 30-minute build review →
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
});

export default FinalCTA;
