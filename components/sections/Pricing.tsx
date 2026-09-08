"use client";

import { motion } from "framer-motion";
import { PaperCard } from "@/components/ui/PaperCard";
import { TextRoll } from "@/components/ui/TextRoll";

const PLANS = [
  {
    name: "Build Review",
    price: "$2,500 to $7,500",
    type: "Fixed fee",
    duration: "Two weeks",
    note: "Credited in full against your build if you move forward",
    features: [
      "Architecture recommendation",
      "Scope and sequencing",
      "Integration and compliance risks",
      "Fixed-price build plan",
      "Named launch date",
      "You keep everything",
    ],
    featured: false,
  },
  {
    name: "Product build",
    price: "From $50,000",
    type: "Fixed scope, fixed price, fixed launch date",
    duration: null,
    note: "Most 0→1 platforms land in the [$50K to $150K] range depending on integrations and compliance surface",
    features: [
      "Milestone-based payments",
      "Weekly Thursday deploys",
      "Direct team Slack access",
      "Production architecture",
      "Design system included",
      "Full code ownership",
    ],
    featured: true,
  },
  {
    name: "Ongoing product partnership",
    price: "From $10,000 per month",
    type: "Your embedded product and engineering team",
    duration: "Monthly",
    note: null,
    features: [
      "Roadmap and planning",
      "Ongoing builds",
      "Maintenance and on-call",
      "Named senior engineer",
      "Direct founder access",
      "No lock-in",
    ],
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="section-pad" aria-label="Pricing">
      <div className="page-wrap">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="type-heading text-carbon-black mb-12"
        >
          Priced by scope. Not by the hour.
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            >
              <PaperCard inverted={plan.featured} className="h-full flex flex-col p-8">
                {plan.featured && (
                  <span className="mint-tag self-start mb-4">Core offering</span>
                )}
                <div className="mb-6">
                  <h3 className="type-subheading mb-1">{plan.name}</h3>
                  <p className={`type-caption ${plan.featured ? "text-smoke" : "text-smoke"}`}>
                    {plan.type}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="type-heading-sm">{plan.price}</p>
                  {plan.duration && (
                    <p className="type-caption text-smoke mt-1">{plan.duration}</p>
                  )}
                </div>

                {plan.note && (
                  <p className={`type-caption mb-6 pb-6 ${plan.featured ? "text-smoke" : "text-slate"}`}>
                    {plan.note}
                  </p>
                )}

                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`type-body-sm flex items-start gap-2 ${plan.featured ? "text-paper-white/80" : "text-slate"}`}
                    >
                      <span className={`mt-[7px] w-1 h-1 rounded-full shrink-0 ${plan.featured ? "bg-mint-chip" : "bg-ash"}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="#final-cta"
                  className={`inline-flex items-center justify-center w-full py-3 px-4 rounded-lg type-body transition-colors duration-200 ${
                    plan.featured
                      ? "bg-paper-white text-carbon-black hover:bg-mint-chip"
                      : "bg-carbon-black text-paper-white hover:bg-graphite"
                  }`}
                >
                  <TextRoll>Start with a Build Review</TextRoll>
                </a>
              </PaperCard>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 type-body text-slate max-w-[65ch]"
        >
          We are structured so that the senior time you're paying for goes into
          scope and speed rather than into a US agency's overhead. That is why
          our clients get a finished product where they budgeted for a prototype.
        </motion.p>
      </div>
    </section>
  );
}
