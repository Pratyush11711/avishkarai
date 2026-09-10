"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function HeroHeadline() {
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  const subcopyRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const microRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      [eyebrowRef, line1Ref, line2Ref, line3Ref, subcopyRef, ctaRef, microRef].forEach((r) => {
        if (r.current) r.current.style.opacity = "1";
      });
      [line1Ref, line2Ref, line3Ref].forEach((r) => {
        if (r.current) r.current.style.transform = "translateY(0)";
      });
      return;
    }

    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo(
      eyebrowRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    )
      .fromTo(
      line1Ref.current,
      { y: "110%" },
      { y: "0%", duration: 0.75, ease: "power3.out" },
      "-=0.2"
    )
      .fromTo(
        line2Ref.current,
        { y: "110%" },
        { y: "0%", duration: 0.75, ease: "power3.out" },
        "-=0.55"
      )
      .fromTo(
        line3Ref.current,
        { y: "110%" },
        { y: "0%", duration: 0.75, ease: "power3.out" },
        "-=0.55"
      )
      .fromTo(
        subcopyRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "-=0.2"
      )
      .fromTo(
        microRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" },
        "-=0.2"
      );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="relative z-10 w-full min-w-0 max-w-[720px] flex flex-col gap-4 md:gap-5">
      <div ref={eyebrowRef} className="flex items-center gap-2 opacity-0">
        <span
          className="w-2 h-2 rounded-full bg-voltage-yellow shrink-0"
          aria-hidden="true"
        />
        <span className="type-caption text-white/70">
          Product &amp; engineering studio
        </span>
      </div>

      <h1 className="flex flex-col min-w-0">
        <span className="overflow-hidden block min-w-0 pt-[0.06em] pb-[0.1em]">
          <span
            ref={line1Ref}
            className="block hero-display text-paper-white md:whitespace-nowrap"
            style={{ willChange: "transform" }}
          >
            Live in eight weeks.
          </span>
        </span>
        <span className="overflow-hidden block min-w-0 pt-[0.06em] pb-[0.1em]">
          <span
            ref={line2Ref}
            className="block hero-display text-paper-white md:whitespace-nowrap"
            style={{ willChange: "transform" }}
          >
            Enterprise-grade
          </span>
        </span>
        <span className="overflow-hidden block min-w-0 pt-[0.06em] pb-[0.1em]">
          <span
            ref={line3Ref}
            className="block hero-display text-paper-white md:whitespace-nowrap"
            style={{ willChange: "transform" }}
          >
            from day one.
          </span>
        </span>
      </h1>

      <div className="hero-prose flex flex-col gap-4 md:gap-5">
        <p ref={subcopyRef} className="type-body text-white/80 max-w-[52ch] opacity-0 font-[450] leading-[1.6] tracking-[-0.01em]">
          Your MVP shouldn&apos;t look like an MVP. We build production-grade software
          with the design finesse of a funded product: multi-tenant architecture,
          real test coverage, a design system, and a launch date you can put on a
          calendar.
        </p>

        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 opacity-0 shrink-0"
        >
          <MagneticButton href="#contact" variant="inverted" strength={0}>
            Book a 30-minute build review
          </MagneticButton>
          <MagneticButton href="#clock" variant="ghost" strength={0} className="text-paper-white">
            See how we ship
          </MagneticButton>
        </div>

        <p ref={microRef} className="type-caption text-white/55 opacity-0">
          Typical MVP: 8 weeks. Regulated or integration-heavy platforms: 10 to
          14. You get the real number in writing before you sign anything.
        </p>
      </div>
    </div>
  );
}
