"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const BACKGROUND_COLORS = [
  "var(--color-deep-navy)",
  "var(--color-navy)",
  "color-mix(in srgb, var(--color-deep-navy) 88%, var(--color-primary))",
];

const LINEAR_GRADIENTS = [
  "linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))",
  "linear-gradient(to bottom right, var(--color-tint), var(--color-paper-white))",
  "linear-gradient(to bottom right, var(--color-navy), var(--color-deep-navy))",
];

export const StickyScroll = ({
  content,
  contentClassName,
  onActiveChange,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode;
  }[];
  contentClassName?: string;
  onActiveChange?: (index: number) => void;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    // uncomment line 22 and comment line 23 if you DONT want the overflow container and want to have it change on the entire page scroll
    // target: ref
    container: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  const [backgroundGradient, setBackgroundGradient] = useState(
    LINEAR_GRADIENTS[0],
  );

  useEffect(() => {
    setBackgroundGradient(LINEAR_GRADIENTS[activeCard % LINEAR_GRADIENTS.length]);
  }, [activeCard]);

  useEffect(() => {
    onActiveChange?.(activeCard);
  }, [activeCard, onActiveChange]);

  return (
    <div className="relative z-0 isolate overflow-hidden rounded-[24px]">
      <motion.div
        style={{
          backgroundColor:
            BACKGROUND_COLORS[activeCard % BACKGROUND_COLORS.length],
          color: "var(--color-text-inverse)",
        }}
        className="relative z-0 hidden h-[36rem] w-full justify-between gap-10 overflow-y-auto overscroll-contain p-10 transition-[background-color] duration-500 ease-in-out lg:flex"
        data-lenis-prevent
        role="region"
        aria-label="Principles"
        ref={ref}
      >
        <div className="relative z-0 min-h-0 min-w-0 flex items-start px-4">
          <div className="max-w-2xl">
            {content.map((item, index) => (
              <div key={item.title + index} className="my-20">
                <motion.h3
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: activeCard === index ? 1 : 0.38,
                  }}
                  className="type-heading-sm font-bold"
                  style={{ color: "var(--color-text-inverse)" }}
                >
                  {item.title}
                </motion.h3>
                <motion.p
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: activeCard === index ? 1 : 0.38,
                  }}
                  className="type-body-sm mt-8 max-w-md"
                  style={{
                    color:
                      "color-mix(in srgb, var(--color-text-inverse) 82%, transparent)",
                  }}
                >
                  {item.description}
                </motion.p>
              </div>
            ))}
            <div className="h-40" />
          </div>
        </div>
        <div
          style={{ background: backgroundGradient }}
          className={cn(
            "sticky top-10 z-0 hidden h-[22rem] w-[26rem] shrink-0 overflow-hidden rounded-[24px] lg:block",
            contentClassName,
          )}
        >
          {content[activeCard].content ?? null}
        </div>
      </motion.div>

      <div
        className="flex flex-col gap-10 bg-deep-navy px-6 py-8 sm:px-8 lg:hidden"
        style={{ color: "var(--color-text-inverse)" }}
      >
        {content.map((item, index) => (
          <div key={`mobile-${item.title}-${index}`} className="flex flex-col gap-5">
            <h3
              className="type-heading-sm font-bold"
              style={{ color: "var(--color-text-inverse)" }}
            >
              {item.title}
            </h3>
            <p
              className="type-body-sm"
              style={{
                color:
                  "color-mix(in srgb, var(--color-text-inverse) 82%, transparent)",
              }}
            >
              {item.description}
            </p>
            <div
              style={{
                background: LINEAR_GRADIENTS[index % LINEAR_GRADIENTS.length],
              }}
              className={cn(
                "relative z-0 h-48 overflow-hidden rounded-[24px]",
                contentClassName,
              )}
            >
              {item.content ?? null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
