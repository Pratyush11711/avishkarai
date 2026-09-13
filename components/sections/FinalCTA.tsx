"use client";

import { forwardRef, useCallback, useEffect, useRef, type Ref } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { MagneticButton } from "@/components/ui/MagneticButton";

/* ─── Same word-split engine as TheClock ───────────────────────────────────── */

const MUTED = "rgba(255, 255, 255, 0.22)";
const BRIGHT = "#ffffff";
const PHOSPHOR = "#4fd8ff";

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
      span.className = "cta-word";
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

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else ref.current = value;
}

export const FinalCTA = forwardRef<HTMLElement>(function FinalCTA(_, forwardedRef) {
  const sectionRef = useRef<HTMLElement>(null);
  const setSectionRef = useCallback(
    (node: HTMLElement | null) => {
      sectionRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef]
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heading = headingRef.current;
    const body    = bodyRef.current;
    if (!heading || !body) return;

    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const paint = (words: Word[], t: number) => {
      const last = Math.max(words.length - 1, 1);
      words.forEach((word, i) => {
        const local = Math.min(1, Math.max(0, t * (last + 1.15) - i));
        const k = local * local * (3 - 2 * local);
        if (k <= 0) {
          word.el.style.color = MUTED;
          return;
        }
        word.el.style.color = word.accent
          ? `rgba(79, 216, 255, ${0.22 + 0.78 * k})`
          : `rgba(255, 255, 255, ${0.22 + 0.78 * k})`;
      });
      const bodyT = Math.min(1, Math.max(0, (t - 0.62) / 0.38));
      body.style.opacity = String(bodyT);
      body.style.transform = `translateY(${(1 - bodyT) * 16}px)`;
    };

    const { words, revert } = splitWords(heading);

    if (prefersReduced) {
      paint(words, 1);
      return () => revert();
    }
    paint(words, 0);
    gsap.set(body, { opacity: 0, y: 16 });

    const section = sectionRef.current;
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top 88%",
      end: "top 28%",
      scrub: 0.55,
      invalidateOnRefresh: true,
      onUpdate: (self) => paint(words, self.progress),
    });

    paint(words, st.progress);
    const refresh = () => ScrollTrigger.refresh();
    const t = window.setTimeout(refresh, 120);
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      window.clearTimeout(t);
      st.kill();
      revert();
    };
  }, []);

  return (
    <section
      ref={setSectionRef}
      id="contact"
      className="py-28 md:py-40 bg-deep-navy"
      aria-label="Contact us"
    >
      <div className="page-wrap">
        {/* Heading — accent words get voltage-yellow on scroll */}
        <h2
          ref={headingRef}
          className="cta-heading type-display mb-12 max-w-[20ch] leading-tight"
        >
          Bring us the{" "}
          <span data-cta-accent>version</span>
          {" "}of this you've already{" "}
          <span data-cta-accent>had quoted.</span>
        </h2>

        {/* Body + CTA — fade in after heading fully reveals */}
        <div ref={bodyRef} className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 max-w-[60ch]">
            <p className="type-body text-text-inverse/75">
              Send us the scope another studio gave you, or the roadmap you've
              been sitting on for six months. In 30 minutes we'll tell you what
              we'd build, how long it would take, and what we'd cut.
            </p>
            <p className="type-body text-text-inverse/75">
              If we're not the right fit, we'll say so on the call.
            </p>
          </div>

          <div id="cta-action">
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
});

export default FinalCTA;
