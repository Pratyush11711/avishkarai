"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function FinalCTA() {
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (prefersReduced) {
              if (line1Ref.current) line1Ref.current.style.transform = "translateY(0)";
              if (line2Ref.current) line2Ref.current.style.transform = "translateY(0)";
              if (bodyRef.current) bodyRef.current.style.opacity = "1";
              return;
            }

            const tl = gsap.timeline();
            tl.fromTo(
              line1Ref.current,
              { y: "110%", filter: "blur(4px)" },
              { y: "0%", filter: "blur(0px)", duration: 0.8, ease: "power3.out" }
            )
              .fromTo(
                line2Ref.current,
                { y: "110%", filter: "blur(4px)" },
                { y: "0%", filter: "blur(0px)", duration: 0.8, ease: "power3.out" },
                "-=0.55"
              )
              .fromTo(
                bodyRef.current,
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
                "-=0.3"
              );

            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById("final-cta");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="final-cta"
      className="py-24 md:py-32 bg-carbon-black"
      aria-label="Contact us"
    >
      <div className="page-wrap">
        <h2 className="type-display text-paper-white mb-10 max-w-[18ch]">
          <span className="overflow-hidden block">
            <span
              ref={line1Ref}
              className="block"
              style={{ transform: "translateY(110%)", willChange: "transform" }}
            >
              Bring us the version
            </span>
          </span>
          <span className="overflow-hidden block">
            <span
              ref={line2Ref}
              className="block"
              style={{ transform: "translateY(110%)", willChange: "transform" }}
            >
              of this you've already
            </span>
          </span>
          <span className="overflow-hidden block">
            <span className="block">had quoted.</span>
          </span>
        </h2>

        <div ref={bodyRef} className="flex flex-col gap-6 opacity-0">
          <div className="flex flex-col gap-4 max-w-[65ch]">
            <p className="type-body text-smoke">
              Send us the scope another studio gave you, or the roadmap you've
              been sitting on for six months. In 30 minutes we'll tell you what
              we'd build, how long it would take, and what we'd cut.
            </p>
            <p className="type-body text-smoke">
              If we're not the right fit, we'll say so on the call.
            </p>
          </div>

          <div>
            <MagneticButton href="#pricing" variant="inverted" strength={0}>
              Book a 30-minute build review →
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
