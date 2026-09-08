"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section id="newsletter" className="section-pad" aria-label="Newsletter">
      <div className="max-w-[480px] w-full min-w-0 mx-auto px-6 text-center box-border">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="type-heading text-carbon-black mb-3">
            Build notes, once a month.
          </h2>
          <p className="type-body text-slate mb-8">
            What we shipped, what broke, and what we'd do differently. Written
            for people who build software, not for a mailing list.
          </p>

          {submitted ? (
            <p className="type-body text-carbon-black flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-voltage-yellow" />
              You're on the list.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full min-w-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full min-w-0 flex-1 px-4 py-3 rounded-lg type-body bg-paper-white text-carbon-black placeholder:text-smoke focus:outline-none focus:ring-2 focus:ring-voltage-yellow"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-lg type-body bg-carbon-black text-paper-white hover:bg-graphite transition-colors duration-200 shrink-0"
              >
                Subscribe
              </button>
            </form>
          )}

          <p className="type-caption text-smoke mt-4">
            No pitch decks. Unsubscribe in one click.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
