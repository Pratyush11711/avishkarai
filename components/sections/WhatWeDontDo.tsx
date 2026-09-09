"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// Use ** to mark accent/highlighted words within each statement
const ITEMS = [
  {
    num: "01",
    accent: "#c084fc",
    text: "We don't run **six-week discovery phases** and call them **progress**.",
  },
  {
    num: "02",
    accent: "#60a5fa",
    text: "We don't bolt a **chatbot** onto a sidebar and invoice it as **AI**. If a model isn't the right answer for the problem, we'll say so on the call.",
  },
  {
    num: "03",
    accent: "#34d399",
    text: "We don't quote a **timeline** we can't hold. If your scope is a **twelve-week scope**, you'll hear twelve, and you'll hear it **before you sign**.",
  },
  {
    num: "04",
    accent: "#f97316",
    text: "We don't **hold your code**. It lives in **your repository**, under **your account**, from the first commit.",
  },
  {
    num: "05",
    accent: "#f472b6",
    text: "We are **not** the **cheapest quote** you'll get.",
  },
];

type WordToken = { text: string; accent: boolean };

function parseTokens(raw: string): WordToken[] {
  const tokens: WordToken[] = [];
  raw.split(/(\*\*[^*]+\*\*)/g).forEach((part) => {
    const isAccent = part.startsWith("**") && part.endsWith("**");
    const text = isAccent ? part.slice(2, -2) : part;
    text.split(/(\s+)/).forEach((chunk) => {
      if (!chunk) return;
      tokens.push({ text: chunk, accent: isAccent });
    });
  });
  return tokens;
}

const ease = [0.22, 1, 0.36, 1] as const;
const MUTED = "rgba(18,18,18,0.18)";
const WORD_STAGGER = 0.028;

function Row({
  item,
  index,
}: {
  item: (typeof ITEMS)[number];
  index: number;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const delay = index * 0.05;
  const tokens = parseTokens(item.text);

  return (
    <motion.li
      ref={ref}
      className="wwd-row"
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease }}
    >
      {/* Left: large muted display number */}
      <div className="wwd-left">
        <motion.span
          aria-hidden
          className="wwd-num"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: delay + 0.08, ease }}
        >
          {item.num}
        </motion.span>
      </div>

      {/* Right: colored left-border + word-by-word reveal */}
      <motion.div
        className="wwd-body"
        style={{ borderLeftColor: item.accent }}
        initial={{ borderLeftWidth: "0px" }}
        animate={inView ? { borderLeftWidth: "2px" } : {}}
        transition={{ duration: 0.45, delay: delay + 0.18, ease: "easeOut" }}
      >
        <p
          className="wwd-statement"
          aria-label={item.text.replace(/\*\*/g, "")}
        >
          {tokens.map((token, i) =>
            /^\s+$/.test(token.text) ? (
              <span key={i}>{token.text}</span>
            ) : (
              <motion.span
                key={i}
                className="wwd-word"
                initial={{ color: MUTED }}
                animate={
                  inView
                    ? { color: token.accent ? item.accent : "rgb(18,18,18)" }
                    : {}
                }
                transition={{
                  duration: 0.45,
                  delay: delay + 0.28 + i * WORD_STAGGER,
                  ease: "easeOut",
                }}
              >
                {token.text}
              </motion.span>
            )
          )}
        </p>
      </motion.div>
    </motion.li>
  );
}

export function WhatWeDontDo() {
  return (
    <section
      id="what-we-dont-do"
      className="section-pad"
      aria-label="What we don't do"
    >
      <div className="page-wrap">
        <ul className="wwd-list">
          {ITEMS.map((item, i) => (
            <Row key={item.num} item={item} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
