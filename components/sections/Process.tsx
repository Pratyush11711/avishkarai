"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

const STEPS = [
  {
    name: "Scope",
    subtitle: "The Build Review",
    week: "Week 0",
    body: "Before anyone signs a build contract, we do the work. Two weeks of real technical and product diligence: architecture recommendation, scope and sequencing, integration and compliance risks, a scoped build plan, and a launch date. You keep everything, whether or not you hire us to build it. If you take it to another studio, it makes them better too. We're comfortable with that. Most clients don't take it anywhere.",
    inverted: true,
  },
  {
    name: "Shape",
    subtitle: "Scope lock and design direction",
    week: "Week 1",
    body: "We agree on exactly what version one is, and what it isn't. You approve a design direction before we write feature code. Nothing after this is a surprise.",
    inverted: false,
  },
  {
    name: "Ship",
    subtitle: "Thursday deploys",
    week: "Week 2 through launch",
    body: "A deployed build every Thursday. A short Loom walking through what changed. Direct access to the team in your Slack.",
    inverted: false,
  },
  {
    name: "Scale",
    subtitle: "Launch and beyond",
    week: null,
    body: "We handle deployment, app store submission, monitoring, and handover. Then either you take the keys, with full code ownership and documentation and no lock-in, or we stay on as your product team.",
    inverted: true,
  },
];

export function Process() {
  return (
    <section id="process" className="section-pad relative" aria-label="Process">
      <div className="page-wrap relative z-[1]">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="type-heading text-carbon-black mb-12 md:mb-16 max-w-[12ch]"
        >
          Four steps. No mystery.
        </motion.h2>

        <div className="flex flex-col gap-3">
          {STEPS.map((step, i) => (
            <motion.article
              key={step.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: "easeOut" }}
              className={clsx(
                "relative overflow-hidden rounded-[32px] p-8 md:p-12",
                step.inverted
                  ? "bg-carbon-black text-paper-white"
                  : "bg-paper-white text-carbon-black"
              )}
            >
              <div className="grid md:grid-cols-[minmax(7rem,auto)_1fr] gap-6 md:gap-12 items-start">
                <span
                  className={clsx(
                    "font-display text-[clamp(64px,12vw,120px)] leading-[0.8] select-none",
                    step.inverted ? "text-paper-white/15" : "text-carbon-black/10"
                  )}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h3 className="type-heading">
                      {step.name}
                    </h3>
                    {step.week && (
                      <span className="mint-tag">{step.week}</span>
                    )}
                  </div>

                  <p className="type-caption text-smoke mb-4">
                    {step.subtitle}
                  </p>

                  <p
                    className={clsx(
                      "type-body max-w-[62ch]",
                      step.inverted ? "text-smoke" : "text-slate"
                    )}
                  >
                    {step.body}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
