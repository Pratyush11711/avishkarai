"use client";

import { motion } from "framer-motion";
import { MarqueeRow } from "@/components/ui/MarqueeRow";

const SECTORS = [
  "Telehealth",
  "Regulated health",
  "Life sciences",
  "Medical devices",
  "Care services",
  "Enterprise operations",
  "Industrial safety",
  "Compliance and audit",
  "Marketplaces",
  "Field operations",
];

export function SectorMarquee() {
  return (
    <section id="sectors" className="pb-16" aria-label="Sectors">
      <div className="mb-8 bg-paper-white py-6">
        <MarqueeRow
          items={SECTORS}
          speed={25}
          reverse
          large
          itemClassName="text-carbon-black type-heading-sm !text-[20px] !leading-none"
          separator="/"
        />
      </div>

      <div className="page-wrap">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="type-heading text-carbon-black max-w-[18ch]"
        >
          Our clients are operators in industries where getting it wrong is
          expensive.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
          className="type-subheading mt-10 max-w-[36ch] border-l-2 border-voltage-yellow pl-5 text-carbon-black"
        >
          Most studios promise deliverables next quarter. We ship yours by{" "}
          <mark className="bg-voltage-yellow px-1 text-carbon-black">
            Thursday.
          </mark>
        </motion.p>
      </div>
    </section>
  );
}
