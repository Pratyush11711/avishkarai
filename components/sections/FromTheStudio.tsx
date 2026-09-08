"use client";

import { motion } from "framer-motion";
import { PlaceholderField } from "@/components/ui/PlaceholderField";
import { TextRoll } from "@/components/ui/TextRoll";

const ENTRIES = [
  {
    date: "[00.00 · 2026]",
    content: null,
    placeholder: "[Client] goes live in production.",
  },
  {
    date: "[00.00 · 2026]",
    content: "New case study: ",
    placeholder: "[Client], [one clause on what made it hard].",
  },
  {
    date: "[00.00 · 2026]",
    content: null,
    placeholder: "[Name] joins the studio as [role].",
  },
  {
    date: "[00.00 · 2026]",
    content: "SOC 2 readiness: ",
    placeholder: "[milestone].",
  },
  {
    date: "[00.00 · 2026]",
    content: null,
    placeholder: "[Talk, feature, award, or launch].",
  },
];

export function FromTheStudio() {
  return (
    <section id="studio-notes" className="section-pad" aria-label="From the studio">
      <div className="page-wrap">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="type-heading text-carbon-black mb-12"
        >
          From the studio
        </motion.h2>

        <div className="flex flex-col max-w-[780px] bg-paper-white rounded-[32px] px-8">
          {ENTRIES.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
              className="flex items-start gap-5 py-5 border-b border-mist-gray last:border-0"
            >
              <span className="type-caption text-smoke shrink-0 mt-0.5 w-28">
                {entry.date}
              </span>
              <p className="type-body text-slate">
                {entry.content}
                <PlaceholderField inline>{entry.placeholder}</PlaceholderField>
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <a href="#" className="type-body text-carbon-black">
            <TextRoll>Read all →</TextRoll>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
