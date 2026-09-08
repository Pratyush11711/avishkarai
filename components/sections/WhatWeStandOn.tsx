"use client";

import { motion } from "framer-motion";

const PILLARS = [
  {
    num: "01",
    heading: "Enterprise standard, from commit one",
    body: "Multi-tenant architecture. Role-based access control. Audit logging. Encryption in transit and at rest. Automated CI/CD, real test coverage, documented APIs, infrastructure as code.",
    body2:
      "Most MVPs are demos with a database behind them, and they get thrown away the moment you get traction. Ours are the first version of the system you'll still be running at Series B.",
    closing: "We build the thing you scale, not the thing you replace.",
  },
  {
    num: "02",
    heading: "Designed like a product, not a project",
    body: "Your first users, your first investors, and your first enterprise buyer all form their opinion in about four seconds. We don't hand that moment to a template.",
    body2:
      "Every build ships with a real design system: typography, motion, states, empty states, error states, dark mode where it matters. Interfaces our clients' customers assume were made by a fifteen-person in-house team.",
    closing: "Nobody should be able to tell it's version one.",
  },
  {
    num: "03",
    heading: "Shipped on a clock, not a hope",
    body: "Fixed scope. Fixed price. Weekly deploys. A named senior engineer and a founder who answers directly, not an account manager relaying messages across a time zone.",
    body2:
      "If we miss a Thursday, you hear about it Wednesday, with the reason and the new date.",
    closing: "That's the whole relationship in one sentence.",
  },
];

export function WhatWeStandOn() {
  return (
    <section id="principles" className="section-pad" aria-label="What we stand on">
      <div className="page-wrap">
        <div className="flex flex-col gap-16">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
              className="grid md:grid-cols-[80px_1fr] gap-6 md:gap-12 bg-paper-white rounded-[32px] p-8 md:p-12"
            >
              <span className="type-caption text-smoke pt-1">{pillar.num}</span>

              <div>
                <h3 className="type-heading text-carbon-black mb-5">
                  {pillar.heading}
                </h3>
                <p className="type-body text-slate max-w-[65ch] mb-4">
                  {pillar.body}
                </p>
                <p className="type-body text-slate max-w-[65ch] mb-6">
                  {pillar.body2}
                </p>
                <p className="type-subheading text-carbon-black">
                  {pillar.closing}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
