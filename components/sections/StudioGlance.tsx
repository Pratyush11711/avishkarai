"use client";

import { motion, type Variants } from "framer-motion";
import { PlaceholderField } from "@/components/ui/PlaceholderField";

const STATS = [
  { label: "Established", value: null, placeholder: "[2024]" },
  { label: "Studio", value: "Bengaluru, India", placeholder: null },
  { label: "Operating hours", value: "US Eastern and Central overlap, daily", placeholder: null },
  { label: "Team", value: null, placeholder: "[00]" },
  { label: "Products shipped", value: null, placeholder: "[00]" },
  { label: "Currently live in production", value: null, placeholder: "[00]" },
  { label: "Average time to first deploy", value: "14 days", placeholder: null },
  { label: "Deploy cadence", value: "Every Thursday", placeholder: null },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.0, 0.0, 0.2, 1.0] },
  }),
};

export function StudioGlance() {
  return (
    <section id="studio" className="section-pad" aria-label="Studio at a glance">
      <div className="page-wrap">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="divide-y divide-ash">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                className="flex flex-col items-start gap-1 py-4 first:pt-0 last:pb-0 min-w-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <span className="text-smoke type-caption shrink-0">{stat.label}</span>
                {stat.placeholder ? (
                  <PlaceholderField inline className="min-w-0 break-words text-left sm:text-right">
                    {stat.placeholder}
                  </PlaceholderField>
                ) : (
                  <span className="text-carbon-black type-body min-w-0 break-words text-left sm:text-right">
                    {stat.value}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="mt-8 type-body text-slate max-w-[65ch]"
        >
          A product and engineering studio. We take founders and operating
          teams from a scope document to a live, production-grade platform, and
          we hand over the keys when we're done.
        </motion.p>
      </div>
    </section>
  );
}
