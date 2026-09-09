import { SmoothScrollProvider } from "@/lib/smooth-scroll";
import { Nav } from "@/components/nav/Nav";
import { Hero } from "@/components/hero/Hero";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { SectorMarquee } from "@/components/sections/SectorMarquee";
import { TheClock } from "@/components/sections/TheClock";
import { WhatWeStandOn } from "@/components/sections/WhatWeStandOn";
import { Capabilities } from "@/components/sections/Capabilities";
import { WhatWeDontDo } from "@/components/sections/WhatWeDontDo";
import { Process } from "@/components/sections/Process";
import { ProcessCTA } from "@/components/sections/ProcessCTA";
import { FAQ } from "@/components/sections/FAQ";
import { Newsletter } from "@/components/sections/Newsletter";
import { LetsWorkTogether } from "@/components/sections/LetsWorkTogether";
import { SplitCTA } from "@/components/sections/SplitCTA";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/footer/Footer";
import { ProcessRibbon } from "@/components/fx/ProcessRibbon";

export default function Home() {
  return (
    <SmoothScrollProvider>
      <Nav />
      <main className="relative isolate w-full max-w-full">
        <div className="curtain-sticky z-[1] bg-warm-canvas">
          <Hero />
        </div>

        <div className="curtain z-[2] work-section">
          <SelectedWork />
        </div>

        <div className="relative z-[2] bg-warm-canvas">
          <SectorMarquee />
        </div>

        <div className="relative z-[3] bg-warm-canvas">
          <TheClock />
        </div>

        <div className="curtain z-[4] bg-warm-canvas">
          <WhatWeStandOn />
          <Capabilities />
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
        </div>

        <div className="curtain-sticky z-[5] bg-warm-canvas">
          <Newsletter />
        </div>

        <div className="curtain z-[6] bg-carbon-black">
          <FinalCTA />
        </div>

        <div className="relative z-[7]">
          <LetsWorkTogether />
        </div>

        <div className="relative z-[8] w-full max-w-full bg-carbon-black">
          <SplitCTA />
          <Footer />
        </div>
      </main>
    </SmoothScrollProvider>
  );
}
