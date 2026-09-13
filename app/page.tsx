import { SmoothScrollProvider } from "@/lib/smooth-scroll";
import { Nav } from "@/components/nav/Nav";
import { Hero } from "@/components/hero/Hero.lazy";
import { SectionBoundary } from "@/components/ui/SectionBoundary";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { SectorMarquee } from "@/components/sections/SectorMarquee";
import { TheClock } from "@/components/sections/TheClock.lazy";
import { WhatWeStandOn } from "@/components/sections/WhatWeStandOn.lazy";
import { ExpertiseSection } from "@/components/ExpertiseSection";
import { WhatWeDontDo } from "@/components/sections/WhatWeDontDo";
import { Process } from "@/components/sections/Process";
import { ProcessCTA } from "@/components/sections/ProcessCTA";
import { FAQ } from "@/components/sections/FAQ";
import { Newsletter } from "@/components/sections/Newsletter";
import { LetsWorkTogether } from "@/components/sections/LetsWorkTogether.lazy";
import { SplitCTA } from "@/components/sections/SplitCTA";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/footer/Footer";
import { ProcessRibbon } from "@/components/fx/ProcessRibbon";

export default function Home() {
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
            {/* Shared box so the ribbon can weave past the cards and taper out
                below the CTA. */}
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
