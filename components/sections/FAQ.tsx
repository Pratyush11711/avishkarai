"use client";

import { motion } from "framer-motion";
import { Accordion } from "@/components/ui/Accordion";

const FAQ_ITEMS = [
  {
    question: "Is eight weeks real, or is that a marketing number?",
    answer:
      "It's real, and it's specific: eight weeks from scope lock to live, for a focused MVP with a defined feature set. What moves that number is integration surface and compliance requirements. A multi-tenant platform wired into third-party systems runs 10 to 14 weeks. You get your actual date during the Build Review, before you commit to a build. We'd rather lose the deal on a longer honest estimate than win it on a date we miss.",
  },
  {
    question: "Where is your team?",
    answer:
      "Our engineering team is in Bengaluru. Our engagements run on US hours with committed daily overlap for Eastern and Central time zones, and your founder contact is available in your working day. This is the reason you get a fifteen-person outcome on a five-person budget, and we'd rather be direct about it than have you find out from a contract.",
  },
  {
    question: "Do you work with non-technical founders?",
    answer:
      "Most of our clients are operators and domain experts, not engineers. You bring the market knowledge. We bring the technical judgment, including telling you when the thing you asked for isn't the thing you need.",
  },
  {
    question: "Will my MVP actually be scalable, or will we rebuild it in a year?",
    answer:
      "This is the one we care most about. Every build ships with production architecture: proper data modeling, tenant isolation, migrations, monitoring, test coverage. The purpose of shipping fast is to learn fast, not to accumulate debt you pay off with a rewrite.",
  },
  {
    question: "What if we already have a team?",
    answer:
      "Then we augment rather than replace. We take a defined workstream, ship it to the same standard, and hand it over documented.",
  },
  {
    question: "What happens if we want to leave mid-build?",
    answer:
      "Milestone-based contracts have defined exit points. You leave with everything built to that point, in your repository, documented.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="section-pad" aria-label="Frequently asked questions">
      <div className="page-wrap">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="type-heading text-carbon-black mb-12"
        >
          Frequently asked questions
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="max-w-[780px] bg-paper-white rounded-[32px] px-8"
        >
          <Accordion items={FAQ_ITEMS} />
        </motion.div>
      </div>
    </section>
  );
}
