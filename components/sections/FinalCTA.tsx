"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { MagneticButton } from "@/components/ui/MagneticButton";

/* ─── Same word-split engine as TheClock ───────────────────────────────────── */

const MUTED = "rgba(255, 255, 255, 0.22)";
const BRIGHT = "#ffffff";
const PHOSPHOR = "#fff100";

type Word = { el: HTMLElement; accent: boolean };

function splitWords(
  el: HTMLElement | null,
  accentAttr = "data-cta-accent"
): { words: Word[]; revert: () => void } {
  if (!el) return { words: [], revert: () => {} };

  const original = el.innerHTML;
  const words: Word[] = [];

  const wrapText = (text: string, accent: boolean) => {
    const frag = document.createDocumentFragment();
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
        return;
      }
      const span = document.createElement("span");
      span.style.display = "inline";
      span.textContent = part;
      if (accent) span.dataset.accent = "true";
      frag.appendChild(span);
      words.push({ el: span, accent });
    });
    return frag;
  };

  const nodes: Node[] = [];
  el.childNodes.forEach((n) => nodes.push(n));

  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (!text.trim()) return;
      el.replaceChild(wrapText(text, false), node);
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const child = node as HTMLElement;
      const isAccent = child.hasAttribute(accentAttr);
      const text = child.textContent ?? "";
      el.replaceChild(wrapText(text, isAccent), child);
    }
  });

  return { words, revert: () => { el.innerHTML = original; } };
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heading = headingRef.current;
    const body    = bodyRef.current;
    if (!heading || !body) return;

    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      // Instant reveal — skip animation
      heading.querySelectorAll("span").forEach((s) => {
        (s as HTMLElement).style.color = BRIGHT;
      });
      body.style.opacity = "1";
      body.style.transform = "none";
      return;
    }

    /* Split heading into word spans */
    const { words, revert } = splitWords(heading);

    /* Start all words muted */
    words.forEach((w) => { w.el.style.color = MUTED; });

    /* Body hidden until heading is revealed */
    gsap.set(body, { opacity: 0, y: 20 });

    /* Timeline scrubbed by scroll */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "center 45%",
        scrub: 0.7,
        invalidateOnRefresh: true,
      },
    });

    /* Word-by-word colour reveal */
    tl.to(
      words.map((w) => w.el),
      {
        color: (_i: number) => (words[_i].accent ? PHOSPHOR : BRIGHT),
        duration: 1,
        stagger: 0.055,
        ease: "none",
      },
      0
    );

    /* Body fades in just after last word lights up */
    tl.to(
      body,
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      ">-0.15"
    );

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="py-28 md:py-40 bg-carbon-black"
      aria-label="Contact us"
    >
      <div className="page-wrap">
        {/* Heading — accent words get voltage-yellow on scroll */}
        <h2
          ref={headingRef}
          className="type-display mb-12 max-w-[20ch] leading-tight"
        >
          Bring us the{" "}
          <span data-cta-accent>version</span>
          {" "}of this you've already{" "}
          <span data-cta-accent>had quoted.</span>
        </h2>

        {/* Body + CTA — fade in after heading fully reveals */}
        <div ref={bodyRef} className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 max-w-[60ch]">
            <p className="type-body text-smoke">
              Send us the scope another studio gave you, or the roadmap you've
              been sitting on for six months. In 30 minutes we'll tell you what
              we'd build, how long it would take, and what we'd cut.
            </p>
            <p className="type-body text-smoke">
              If we're not the right fit, we'll say so on the call.
            </p>
          </div>

          <div>
            <MagneticButton
              href="mailto:arpit@avishkarai.com,shivang@avishkarai.com?subject=Build%20review"
              variant="inverted"
              strength={0}
            >
              Book a 30-minute build review →
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
