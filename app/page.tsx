import { SmoothScrollProvider } from "@/lib/smooth-scroll";
import { Nav } from "@/components/nav/Nav";
import { Hero } from "@/components/hero/Hero";
import { StudioGlance } from "@/components/sections/StudioGlance";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { SectorMarquee } from "@/components/sections/SectorMarquee";
import { OperatorsGrid } from "@/components/sections/OperatorsGrid";
import { TheClock } from "@/components/sections/TheClock";
import { WhatWeStandOn } from "@/components/sections/WhatWeStandOn";
import { Capabilities } from "@/components/sections/Capabilities";
import { WhatWeDontDo } from "@/components/sections/WhatWeDontDo";
import { Process } from "@/components/sections/Process";
import { Pricing } from "@/components/sections/Pricing";
import { TrustAndSecurity } from "@/components/sections/TrustAndSecurity";
import { FAQ } from "@/components/sections/FAQ";
import { FromTheStudio } from "@/components/sections/FromTheStudio";
import { Newsletter } from "@/components/sections/Newsletter";
import { SplitCTA } from "@/components/sections/SplitCTA";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/footer/Footer";

export default function Home() {
  return (
    <SmoothScrollProvider>
      <Nav />
      <main className="relative isolate">
        <div className="curtain-sticky z-[1] bg-warm-canvas">
          <Hero />
        </div>

        <div className="curtain z-[2] bg-paper-white">
          <StudioGlance />
        </div>

        <div className="relative z-[2] bg-warm-canvas">
          <SelectedWork />
        </div>

        <div className="relative z-[2] bg-warm-canvas">
          <SectorMarquee />
        </div>

        <div className="relative z-[2] bg-warm-canvas">
          <OperatorsGrid />
        </div>

        <TheClock />

        <div className="curtain z-[4] bg-warm-canvas">
          <WhatWeStandOn />
          <Capabilities />
          <WhatWeDontDo />
          <Process />
          <Pricing />
          <TrustAndSecurity />
          <FAQ />
          <FromTheStudio />
        </div>

        <div className="curtain-sticky z-[4] bg-warm-canvas">
          <Newsletter />
        </div>

        <div className="curtain z-[5] bg-carbon-black">
          <FinalCTA />
          <SplitCTA />
          <Footer />
        </div>
      </main>
    </SmoothScrollProvider>
  );
}
