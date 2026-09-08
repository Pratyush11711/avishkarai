"use client";

import { useEffect, useRef, useState } from "react";
import { HeroHeadline } from "./HeroHeadline";
import { HeroVideo, usePrefersReducedMotion } from "./HeroVideo";
import { MarqueeRow } from "@/components/ui/MarqueeRow";

const TRUST_ITEMS = [
  "Building for teams in regulated health, telehealth, enterprise services, and industrial operations",
  "HIPAA-grade platforms shipped and live in the US",
  "SOC 2 readiness program in place",
];

export function Hero() {
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroVisible(entry.isIntersecting),
      { rootMargin: "160px 0px" }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-[100dvh] flex flex-col bg-warm-canvas overflow-hidden"
      aria-label="Hero"
    >
      <div className="relative z-10 flex-1 flex items-center pt-28 md:pt-32 pb-8 overflow-hidden">
        <div className="page-wrap w-full min-w-0 grid grid-cols-1 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)] gap-8 md:gap-4 items-start">
          <HeroHeadline />
          {!prefersReduced && (
            <HeroVideo playing={isHeroVisible} />
          )}
        </div>
      </div>

      <div className="relative z-10 py-6 bg-mist-gray">
        <MarqueeRow
          items={TRUST_ITEMS}
          speed={30}
          itemClassName="text-slate type-caption"
        />
      </div>
    </section>
  );
}
