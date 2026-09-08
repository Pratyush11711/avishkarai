"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
  inverted?: boolean;
}

export function Accordion({
  items,
  className,
  inverted = false,
}: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div
      className={clsx(
        "divide-y",
        inverted ? "divide-graphite" : "divide-ash",
        className
      )}
    >
      {items.map((item, i) => (
        <div key={i}>
          <button
            type="button"
            className={clsx(
              "w-full flex items-start justify-between gap-4 py-5 text-left type-body",
              inverted ? "text-paper-white" : "text-carbon-black"
            )}
            onClick={() => toggle(i)}
            aria-expanded={openIndex === i}
          >
            <span>{item.question}</span>
            <span
              className={clsx(
                "shrink-0 mt-0.5 text-xl leading-none transition-transform duration-300",
                openIndex === i && "rotate-45"
              )}
            >
              +
            </span>
          </button>

          <AnimatePresence initial={false}>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                className="overflow-hidden"
              >
                <p
                  className={clsx(
                    "pb-5 type-body max-w-[65ch]",
                    inverted ? "text-smoke" : "text-slate"
                  )}
                >
                  {item.answer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
