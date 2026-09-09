"use client";

import { motion } from "framer-motion";
import { CaseStudyCard, type CaseStudyCardProps } from "@/components/ui/CaseStudyCard";
import { LiquidDistortionFilter } from "@/components/ui/LiquidDistortionFilter";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CASE_STUDIES: CaseStudyCardProps[] = [
  {
    index: 1,
    title: "Frontier Biomed",
    category: "Telehealth & Compliant Commerce",
    location: "United States",
    status: "live",
    description:
      "A multi-tenant platform serving multiple clinics: patient-facing storefront, clinician workflows, an admin layer, an affiliate system, a documented API surface, and wearable-device integration architecture with a clinician in the loop. Built to handle protected health information correctly from the first commit, with a brand and interface that reads like a consumer health product, because that is what its users expect.",
    tags: [
      "Strategy",
      "Architecture",
      "HIPAA-grade infrastructure",
      "Product design",
      "Full-stack build",
      "API",
    ],
    image: "/frontier.png",
    testimonial: undefined,
    href: "#",
  },
  {
    index: 2,
    title: "Frontier Wellness",
    category: "Mental Health",
    location: "Canada",
    status: "in-progress",
    description:
      "[One paragraph, under 60 words. Lead with the hard part: the integration, the compliance surface, the volume. Then the outcome.]",
    tags: ["Strategy", "Product design", "Full-stack build"],
    href: "#",
  },
  {
    index: 3,
    title: "Guiding Hands",
    category: "Care Navigation",
    location: "United States",
    status: "in-progress",
    description:
      "[One paragraph, under 60 words. Lead with the hard part: the integration, the compliance surface, the volume. Then the outcome.]",
    tags: ["Architecture", "Full-stack build", "API"],
    href: "#",
  },
  {
    index: 4,
    title: "Medivance",
    category: "Clinical Ops",
    location: "United Kingdom",
    status: "in-progress",
    description:
      "[One paragraph, under 60 words. Lead with the hard part: the integration, the compliance surface, the volume. Then the outcome.]",
    tags: ["Strategy", "Architecture", "Product design"],
    href: "#",
  },
  {
    index: 5,
    title: "House of Life Sciences",
    category: "Research",
    location: "India",
    status: "in-progress",
    description:
      "[One paragraph, under 60 words. Lead with the hard part: the integration, the compliance surface, the volume. Then the outcome.]",
    tags: ["Full-stack build", "API", "Strategy"],
    href: "#",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11 } },
};

export function SelectedWork() {
  const [featured, ...rest] = CASE_STUDIES;

  return (
    <section id="work" className="section-pad !pb-10" aria-label="Selected work">
      <LiquidDistortionFilter />
      <div className="page-wrap">

        {/* Header */}
        <div className="flex items-end justify-between mb-12 gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="type-heading text-carbon-black max-w-[20ch]"
          >
            We&apos;d rather show you than tell you.
          </motion.h2>

          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="type-caption text-smoke shrink-0 hidden md:block"
          >
            {CASE_STUDIES.length} projects
          </motion.span>
        </div>

        {/* Featured — full width */}
        <div className="mb-4">
          <CaseStudyCard {...featured} />
        </div>

        {/* Rest — 2-col grid */}
        <motion.div
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {rest.map((cs) => (
            <CaseStudyCard key={cs.index} {...cs} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}
