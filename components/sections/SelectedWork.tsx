"use client";

import { motion } from "framer-motion";
import { PlaceholderField } from "@/components/ui/PlaceholderField";
import { TiltedCard } from "@/components/ui/TiltedCard";
import { TextRoll } from "@/components/ui/TextRoll";

const PLACEHOLDER_CASES = [
  { num: "02", name: "Frontier Wellness" },
  { num: "03", name: "Guiding Hands" },
  { num: "04", name: "Medivance" },
  { num: "05", name: "House of Life Sciences" },
];

export function SelectedWork() {
  return (
    <section id="work" className="section-pad" aria-label="Selected work">
      <div className="page-wrap">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="type-heading text-carbon-black mb-12 max-w-[20ch]"
        >
          We'd rather show you than tell you.
        </motion.h2>

        <TiltedCard>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="rounded-[32px] bg-paper-white p-8 md:p-12 mb-4"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="type-caption text-smoke">01</span>
                  <h3 className="type-heading-sm text-carbon-black">Frontier Biomed</h3>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="type-caption text-slate">
                    Telehealth and compliant commerce
                  </span>
                  <span className="w-1 h-1 rounded-full bg-ash" />
                  <span className="type-caption text-slate">United States</span>
                  <span className="mint-tag">
                    <span className="w-1.5 h-1.5 rounded-full bg-voltage-yellow mr-2" />
                    Live in production
                  </span>
                </div>
              </div>
            </div>

            <p className="type-body text-slate max-w-[65ch] mb-8">
              A multi-tenant platform serving multiple clinics: patient-facing
              storefront, clinician workflows, an admin layer, an affiliate
              system, a documented API surface, and wearable-device integration
              architecture with a clinician in the loop. Built to handle
              protected health information correctly from the first commit, with
              a brand and interface that reads like a consumer health product,
              because that is what its users expect.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {[
                "Strategy",
                "Architecture",
                "HIPAA-grade infrastructure",
                "Product design",
                "Full-stack build",
                "API",
              ].map((tag) => (
                <span key={tag} className="mint-tag">
                  {tag}
                </span>
              ))}
            </div>

            <div className="pt-6">
              <p className="type-body-sm text-smoke italic mb-4">
                [Named client testimonial — pull quote to be added]
              </p>
              <a href="#" className="type-body text-carbon-black">
                <TextRoll>Read the full case study →</TextRoll>
              </a>
            </div>
          </motion.div>
        </TiltedCard>

        <div className="bg-paper-white rounded-[32px] divide-y divide-mist-gray mt-4">
          {PLACEHOLDER_CASES.map((c, i) => (
            <motion.div
              key={c.num}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
              className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-8"
            >
              <span className="type-caption text-smoke shrink-0 w-6">{c.num}</span>
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
                <h3 className="type-subheading-lg text-carbon-black shrink-0">{c.name}</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <PlaceholderField inline>[Sector]</PlaceholderField>
                  <PlaceholderField inline>[Country]</PlaceholderField>
                  <PlaceholderField inline>[Status]</PlaceholderField>
                </div>
              </div>
              <a href="#" className="type-body-sm text-slate hover:text-carbon-black shrink-0">
                <TextRoll>Read the full case study →</TextRoll>
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6"
        >
          <a href="#" className="type-body text-carbon-black">
            <TextRoll>See all work →</TextRoll>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
