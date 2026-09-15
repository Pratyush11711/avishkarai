"use client";

import { MarqueeRow } from "@/components/ui/MarqueeRow";

const SECTORS = [
  "Telehealth",
  "Regulated health",
  "Life sciences",
  "Bespoke development",
  "Design",
  "UI/UX",
  "Scalable Applications",
  "Marketplaces",
];

export function SectorMarquee() {
  return (
    <section id="sectors" className="pb-16" aria-label="Sectors">
      <div className="bg-paper-white py-6">
        <MarqueeRow
          items={SECTORS}
          speed={25}
          reverse
          large
          itemClassName="text-carbon-black type-heading-sm !text-[20px] !leading-none"
          separator="/"
        />
      </div>
    </section>
  );
}
