"use client";

import type { ComponentType, ReactNode } from "react";
import dynamic from "next/dynamic";
import { SectionBoundary } from "@/components/ui/SectionBoundary";

function Empty() {
  return null;
}

type Loaded = ComponentType<{ children?: ReactNode }>;

function load(
  importer: () => Promise<Record<string, unknown>>,
  names: string[],
  ssr = true
): Loaded {
  return dynamic(
    () =>
      importer()
        .then((m) => {
          const Comp = names.map((n) => m[n]).find(Boolean) ?? m.default ?? Empty;
          return { default: Comp as Loaded };
        })
        .catch(() => ({ default: Empty })),
    { ssr }
  );
}

const SmoothScrollProvider = load(() => import("@/lib/smooth-scroll"), [
  "SmoothScrollProvider",
]);
const Nav = load(() => import("@/components/nav/Nav"), ["Nav"]);
const Hero = load(() => import("@/components/hero/Hero"), ["Hero"], false);
const SelectedWork = load(() => import("@/components/sections/SelectedWork"), [
  "SelectedWork",
]);
const SectorMarquee = load(() => import("@/components/sections/SectorMarquee"), [
  "SectorMarquee",
]);
const TheClock = load(() => import("@/components/sections/TheClock"), ["TheClock"], false);
const WhatWeStandOn = load(
  () => import("@/components/sections/WhatWeStandOn"),
  ["WhatWeStandOn"],
  false
);
const ExpertiseSection = load(() => import("@/components/ExpertiseSection"), [
  "ExpertiseSection",
]);
const WhatWeDontDo = load(() => import("@/components/sections/WhatWeDontDo"), [
  "WhatWeDontDo",
]);
const ProcessRibbon = load(() => import("@/components/fx/ProcessRibbon"), [
  "ProcessRibbon",
]);
const Process = load(() => import("@/components/sections/Process"), ["Process"]);
const ProcessCTA = load(() => import("@/components/sections/ProcessCTA"), [
  "ProcessCTA",
]);
const FAQ = load(() => import("@/components/sections/FAQ"), ["FAQ"]);
const Newsletter = load(() => import("@/components/sections/Newsletter"), [
  "Newsletter",
]);
const FinalCTA = load(() => import("@/components/sections/FinalCTA"), ["FinalCTA"]);
const LetsWorkTogether = load(
  () => import("@/components/sections/LetsWorkTogether"),
  ["LetsWorkTogether"],
  false
);
const SplitCTA = load(() => import("@/components/sections/SplitCTA"), ["SplitCTA"]);
const Footer = load(() => import("@/components/footer/Footer"), ["Footer"]);

export function HomePage() {
  return (
    <SmoothScrollProvider>
      <Nav />
      <main className="relative isolate w-full max-w-full">
        <SectionBoundary>
          <Hero />
        </SectionBoundary>

        <div className="curtain z-[2] work-section">
          <SectionBoundary>
            <SelectedWork />
          </SectionBoundary>
        </div>

        <div className="relative z-[2] bg-bg">
          <SectionBoundary>
            <SectorMarquee />
          </SectionBoundary>
        </div>

        <SectionBoundary>
          <TheClock />
        </SectionBoundary>

        <div className="curtain z-[4] bg-bg">
          <SectionBoundary>
            <WhatWeStandOn />
          </SectionBoundary>
        </div>

        <SectionBoundary>
          <ExpertiseSection />
        </SectionBoundary>

        <div className="curtain z-[4] bg-bg">
          <SectionBoundary>
            <WhatWeDontDo />
            <div className="relative pb-[clamp(90px,9vw,160px)]">
              <ProcessRibbon />
              <div className="relative z-[1]">
                <Process />
                <ProcessCTA />
              </div>
            </div>
            <FAQ />
          </SectionBoundary>
        </div>

        <div className="curtain-sticky z-[5] bg-bg">
          <SectionBoundary>
            <Newsletter />
          </SectionBoundary>
        </div>

        <div className="curtain z-[6] bg-deep-navy">
          <SectionBoundary>
            <FinalCTA />
          </SectionBoundary>
        </div>

        <div className="relative z-[7]">
          <SectionBoundary>
            <LetsWorkTogether />
          </SectionBoundary>
        </div>

        <div className="relative z-[8] w-full max-w-full bg-deep-navy">
          <SectionBoundary>
            <SplitCTA />
            <Footer />
          </SectionBoundary>
        </div>
      </main>
    </SmoothScrollProvider>
  );
}

export default HomePage;
