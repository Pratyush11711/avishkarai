"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { ScrollTrigger } from "@/lib/gsap";
import { paintProcessCard } from "@/lib/process-journey";
import { usePrefersReducedMotion } from "@/components/hero/HeroVideo";

const STEPS = [
  {
    name: "Scope",
    subtitle: "The Build Review",
    week: "Week 0",
    body: "Before anyone signs a build contract, we do the work. Two weeks of real technical and product diligence: architecture recommendation, scope and sequencing, integration and compliance risks, a scoped build plan, and a launch date. You keep everything, whether or not you hire us to build it. If you take it to another studio, it makes them better too. We're comfortable with that. Most clients don't take it anywhere.",
  },
  {
    name: "Shape",
    subtitle: "Scope lock and design direction",
    week: "Week 1",
    body: "We agree on exactly what version one is, and what it isn't. You approve a design direction before we write feature code. Nothing after this is a surprise.",
  },
  {
    name: "Ship",
    subtitle: "Thursday deploys",
    week: "Week 2 through launch",
    body: "A deployed build every Thursday. A short Loom walking through what changed. Direct access to the team in your Slack.",
  },
  {
    name: "Scale",
    subtitle: "Launch and beyond",
    week: null,
    body: "We handle deployment, app store submission, monitoring, and handover. Then either you take the keys, with full code ownership and documentation and no lock-in, or we stay on as your product team.",
  },
];

const COUNT = STEPS.length;

export function Process() {
  const reducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    if (!section || cards.length !== COUNT) return;

    cards.forEach((card, i) => paintProcessCard(card, i, 0));
    section.style.setProperty("--process-journey", "0");

    if (reducedMotion) {
      cards.forEach((card, i) => paintProcessCard(card, i, 1));
      section.style.setProperty("--process-journey", "1");
      return;
    }

    const journey = ScrollTrigger.create({
      id: "process-journey",
      trigger: section,
      start: "top 70%",
      end: "bottom 30%",
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        section.style.setProperty("--process-journey", self.progress.toFixed(4));
      },
      onLeave: () => section.style.setProperty("--process-journey", "1"),
      onLeaveBack: () => section.style.setProperty("--process-journey", "0"),
    });

    const steps = cards.map((card, i) =>
      ScrollTrigger.create({
        id: `process-step-${i}`,
        trigger: card,
        start: "top 68%",
        end: "bottom 32%",
        scrub: 0.85,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          paintProcessCard(card, i, self.progress);
        },
        onLeave: () => paintProcessCard(card, i, 1),
        onLeaveBack: () => paintProcessCard(card, i, 0),
      })
    );

    ScrollTrigger.refresh();

    return () => {
      journey.kill();
      steps.forEach((st) => st.kill());
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="section-pad relative"
      aria-label="Process"
      style={{ "--process-journey": 0 } as CSSProperties}
    >
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
              ref={(node) => {
                cardRefs.current[i] = node;
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: "easeOut" }}
              className="process-step relative overflow-hidden rounded-[32px] p-8 md:p-12"
            >
              <div className="grid md:grid-cols-[minmax(7rem,auto)_1fr] gap-6 md:gap-12 items-start">
                <span
                  className="process-step-numeral font-display text-[clamp(64px,12vw,120px)] leading-[0.8] select-none"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h3 className="type-heading process-step-heading">{step.name}</h3>
                    {step.week && <span className="mint-tag process-tag">{step.week}</span>}
                  </div>

                  <p className="type-caption process-step-caption mb-4">{step.subtitle}</p>
                  <p className="type-body process-step-body max-w-[62ch]">{step.body}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
