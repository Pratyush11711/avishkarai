"use client";

import { motion } from "framer-motion";

const PILLARS = [
  {
    number: "01",
    eyebrow: "Built to last",
    heading: "Enterprise standard, from commit one.",
    body: "Multi-tenant architecture. Role-based access control. Audit logging. Encryption in transit and at rest. Automated CI/CD, real test coverage, documented APIs, infrastructure as code.",
    closing: "We build the thing you scale, not the thing you replace.",
    surface: "bg-voltage-yellow",
    accent: "bg-mint-chip",
  },
  {
    number: "02",
    eyebrow: "Made to matter",
    heading: "Designed like a product, not a project.",
    body: "Your first users, your first investors, and your first enterprise buyer all form their opinion in about four seconds. We don't hand that moment to a template.",
    closing: "Nobody should be able to tell it's version one.",
    surface: "bg-mint-chip",
    accent: "bg-voltage-yellow",
  },
  {
    number: "03",
    eyebrow: "Kept in motion",
    heading: "Shipped on a clock, not a hope.",
    body: "Fixed scope. Weekly deploys. A named senior engineer and a founder who answers directly, not an account manager relaying messages across a time zone.",
    closing: "That's the whole relationship in one sentence.",
    surface: "bg-carbon-black",
    accent: "bg-paper-white",
  },
] as const;

function PillarCard({
  pillar,
  index,
  className = "",
}: {
  pillar: (typeof PILLARS)[number];
  index: number;
  className?: string;
}) {
  const inverted = pillar.surface === "bg-carbon-black";
  const headingColor = inverted ? "text-paper-white" : "text-carbon-black";
  const bodyColor = inverted ? "text-paper-white/55" : "text-slate";
  const labelColor = inverted ? "text-paper-white/55" : "text-smoke";
  const dividerColor = inverted ? "bg-paper-white/15" : "bg-carbon-black/10";

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`${className} ${pillar.surface} group relative min-h-[360px] overflow-hidden rounded-[28px] p-7 md:p-9 shadow-[0_2px_16px_-6px_rgba(0,0,0,0.12)] transition-shadow duration-300 hover:shadow-[0_24px_48px_-22px_rgba(0,0,0,0.28)]`}
    >
      <div
        aria-hidden
        className={`absolute inset-x-0 top-0 h-1.5 ${pillar.accent}`}
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between">
          <span className={`type-caption ${labelColor}`}>{pillar.eyebrow}</span>
          <span
            className={`font-display text-5xl leading-none tracking-[-0.07em] ${inverted ? "text-paper-white/15" : "text-carbon-black/10"}`}
          >
            {pillar.number}
          </span>
        </div>

        <div className={`my-8 h-px w-full ${dividerColor}`} />

        <h3
          className={`type-heading max-w-[18ch] text-balance tracking-[-0.035em] ${headingColor}`}
        >
          {pillar.heading}
        </h3>

        <p className={`type-body mt-5 max-w-[52ch] leading-relaxed ${bodyColor}`}>
          {pillar.body}
        </p>

        <div className="mt-auto pt-8">
          <div className={`mb-4 h-px w-full ${dividerColor}`} />
          <p
            className={`type-body-sm font-semibold ${inverted ? "text-paper-white" : "text-carbon-black"}`}
          >
            {pillar.closing}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

export function WhatWeStandOn() {
  return (
    <section id="principles" className="section-pad" aria-label="What we stand on">
      <div className="page-wrap">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-10 flex items-end justify-between md:mb-12"
        >
          <div>
            <p className="type-caption text-smoke">What we stand on</p>
            <h2 className="type-heading mt-3 max-w-[16ch] text-carbon-black">
              The principles behind every build.
            </h2>
          </div>
          <span className="type-caption hidden text-smoke sm:block">01 — 03</span>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-12">
          <PillarCard
            pillar={PILLARS[0]}
            index={0}
            className="md:col-span-6"
          />
          <PillarCard
            pillar={PILLARS[1]}
            index={1}
            className="md:col-span-6"
          />
          <PillarCard
            pillar={PILLARS[2]}
            index={2}
            className="md:col-span-12 md:min-h-[320px]"
          />
        </div>
      </div>
    </section>
  );
}
