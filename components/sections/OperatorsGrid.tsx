"use client";

import { motion } from "framer-motion";
import { TiltedCard } from "@/components/ui/TiltedCard";

interface Operator {
  name: string;
  sub?: string;
  hover: string;
}

const OPERATORS: Operator[] = [
  { name: "Amazon", hover: "var(--color-tint)" },
  { name: "Delhivery", hover: "var(--color-tint)" },
  { name: "XpressBees", hover: "var(--color-tint)" },
  { name: "OM Logistics", hover: "var(--color-tint)" },
  { name: "Vedang", hover: "var(--color-tint)" },
  { name: "Quess", hover: "var(--color-tint)" },
  { name: "Terrier", sub: "Security Services", hover: "var(--color-tint)" },
  { name: "Bluspring", sub: "Infrastructure", hover: "var(--color-tint)" },
  { name: "Frontier Biomed", hover: "var(--color-tint)" },
  { name: "HOLS", sub: "House of Life Sciences", hover: "var(--color-tint)" },
  { name: "Medivance", hover: "var(--color-tint)" },
  { name: "Frontier Wellness", hover: "var(--color-tint)" },
  { name: "Guiding Hands", hover: "var(--color-tint)" },
  { name: "Pratap", sub: "Carving Lives", hover: "var(--color-tint)" },
];

export function OperatorsGrid() {
  return (
    <section
      id="operators"
      className="section-pad pb-32"
      aria-label="Operators running our builds in production"
    >
      <div className="page-wrap">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="type-heading text-carbon-black max-w-[16ch]"
          >
            Built for operators, not pilots.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="type-body-sm text-slate max-w-[38ch]"
          >
            A cross-section of the operators and platforms our builds are
            already running inside — logistics, life sciences, industrial
            safety, and enterprise operations.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 [perspective:1200px]">
          {OPERATORS.map((op, i) => (
            <motion.div
              key={op.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: (i % 4) * 0.05,
                ease: "easeOut",
              }}
            >
              <TiltedCard maxTilt={16}>
                <div
                  className="group rounded-[24px] bg-deep-navy hover:[background-color:var(--hover-fill)] flex flex-col items-center justify-center gap-1 px-4 py-12 text-center min-h-[140px] transition-colors duration-300 ease-out"
                  style={{ ["--hover-fill" as string]: op.hover }}
                >
                  <span className="type-subheading font-semibold text-paper-white group-hover:text-carbon-black transition-colors duration-300">
                    {op.name}
                  </span>
                  {op.sub && (
                    <span className="type-caption text-text-inverse/60 group-hover:text-carbon-black/70 transition-colors duration-300">
                      {op.sub}
                    </span>
                  )}
                </div>
              </TiltedCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
