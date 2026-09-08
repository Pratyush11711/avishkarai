"use client";

import { motion } from "framer-motion";

const ITEMS = [
  "We don't run six-week discovery phases and call them progress.",
  "We don't bolt a chatbot onto a sidebar and invoice it as AI. If a model isn't the right answer for the problem, we'll say so on the call.",
  "We don't quote a number we can't hold. If your scope is a twelve-week scope, you'll hear twelve, and you'll hear it before you sign.",
  "We don't hold your code. It lives in your repository, under your account, from the first commit.",
  "We are not the cheapest quote you'll get.",
];

export function WhatWeDontDo() {
  return (
    <section id="what-we-dont-do" className="section-pad" aria-label="What we don't do">
      <div className="page-wrap">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="divide-y divide-ash"
        >
          {ITEMS.map((item, i) => (
            <p
              key={i}
              className="py-8 type-heading-sm text-carbon-black max-w-[65ch] first:pt-0 last:pb-0"
            >
              {item}
            </p>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
