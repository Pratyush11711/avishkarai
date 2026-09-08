"use client";

import { motion } from "framer-motion";
import { Accordion } from "@/components/ui/Accordion";

const TRUST_ITEMS = [
  {
    question: "Who owns the code?",
    answer:
      "You do. From the first commit, in your repository, under your account. Full IP assignment in the contract.",
  },
  {
    question: "How do you handle our data?",
    answer:
      "Least-privilege access, signed NDAs across the team, encrypted secrets management, no production data in development environments, and a documented subprocessor list.",
  },
  {
    question: "Are you compliance-ready?",
    answer:
      "We've shipped HIPAA-grade systems in production and will sign a BAA where we handle PHI. Our SOC 2 readiness program is in progress.",
  },
  {
    question: "What if it doesn't work out?",
    answer:
      "The Build Review is deliberately small and self-contained. Build contracts are milestone-based with defined exit points. You are never locked into a decision you made in month one.",
  },
];

export function TrustAndSecurity() {
  return (
    <section id="trust" className="section-pad" aria-label="Trust and security">
      <div className="page-wrap">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="type-heading text-carbon-black mb-12 max-w-[18ch]"
        >
          The questions serious buyers ask before signing.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="max-w-[780px] bg-paper-white rounded-[32px] px-8"
        >
          <Accordion items={TRUST_ITEMS} />
        </motion.div>
      </div>
    </section>
  );
}
