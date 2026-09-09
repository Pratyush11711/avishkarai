"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Ref,
  type RefObject,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { CardSwap, Card } from "@/components/react-bits/CardSwap";
import { MagneticButton } from "@/components/ui/MagneticButton";

const MUTED = "rgba(255, 255, 255, 0.36)";
const BRIGHT = "#ffffff";
const PHOSPHOR = "#fff100";

const PALETTE = [
  "#d1ffca",
  "#fff100",
  "#4EE2EF",
  "#60a5fa",
  "#c084fc",
  "#f472b6",
  "#f97316",
];

type ClockWord = { el: HTMLElement; accent: boolean; color: string };

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return [
    parseInt(full.slice(0, 2), 16) || 0,
    parseInt(full.slice(2, 4), 16) || 0,
    parseInt(full.slice(4, 6), 16) || 0,
  ];
}

function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const ch = (x: number) =>
    Math.round(x).toString(16).padStart(2, "0");
  return `#${ch(ar + (br - ar) * t)}${ch(ag + (bg - ag) * t)}${ch(ab + (bb - ab) * t)}`;
}

function paletteColor(t: number): string {
  const n = PALETTE.length - 1;
  const x = Math.min(Math.max(t, 0), 1) * n;
  const i = Math.floor(x);
  return mixHex(PALETTE[i], PALETTE[Math.min(i + 1, n)], x - i);
}

type WashTint = { r: number; g: number; b: number; a: number };

function paintWash(el: HTMLElement, tint: WashTint) {
  el.style.setProperty("--clock-r", tint.r.toFixed(1));
  el.style.setProperty("--clock-g", tint.g.toFixed(1));
  el.style.setProperty("--clock-b", tint.b.toFixed(1));
  el.style.setProperty("--clock-a", tint.a.toFixed(3));
}

function atPos(base: number | string, extra: number): number | string {
  if (typeof base === "number") return base + extra;
  const raw = String(base);
  const match = raw.match(/^(.*?)(?:\+=([\d.]+))?$/);
  if (!match) return base;
  const label = match[1];
  const off = (match[2] ? parseFloat(match[2]) : 0) + extra;
  if (label === ">" || label === "<" || label === "") {
    return extra === 0 ? base : `+=${extra}`;
  }
  return `${label}+=${off}`;
}

function splitWords(
  el: HTMLElement | null,
  cycle = false
): {
  words: ClockWord[];
  revert: () => void;
} {
  if (!el) return { words: [], revert: () => {} };

  const original = el.innerHTML;
  const words: ClockWord[] = [];

  const wrapText = (text: string, accent: boolean, color: string) => {
    const frag = document.createDocumentFragment();
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
        return;
      }
      const span = document.createElement("span");
      span.className = "clock-word";
      span.textContent = part;
      frag.appendChild(span);
      words.push({ el: span, accent, color });
    });
    return frag;
  };

  const next: Node[] = [];
  el.childNodes.forEach((node) => next.push(node));
  next.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (!text.trim()) return;
      const frag = wrapText(text, false, BRIGHT);
      el.replaceChild(frag, node);
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const child = node as HTMLElement;
      const accentAttr = child.getAttribute("data-clock-accent");
      const accent = accentAttr !== null;
      const color =
        accent && accentAttr && accentAttr !== "true" ? accentAttr : PHOSPHOR;
      const text = child.textContent ?? "";
      const frag = wrapText(text, accent, color);
      el.replaceChild(frag, child);
    }
  });

  if (cycle && words.length) {
    words.forEach((word, i) => {
      if (word.accent) return;
      word.color = paletteColor(i / Math.max(words.length - 1, 1));
    });
  }

  return {
    words,
    revert: () => {
      el.innerHTML = original;
    },
  };
}

function applyWordColors(words: ClockWord[], color: "muted" | "final") {
  words.forEach((word) => {
    word.el.style.color = color === "muted" ? MUTED : word.color;
  });
}

function revealWords(
  tl: gsap.core.Timeline,
  words: ClockWord[],
  position: number | string,
  wash?: { el: HTMLElement; tint: WashTint }
) {
  if (!words.length) return;
  const stagger = words.length > 40 ? 0.038 : 0.055;
  tl.to(
    words.map((word) => word.el),
    {
      color: (i: number) => words[i].color,
      duration: 0.5,
      stagger,
      ease: "none",
    },
    position
  );

  if (!wash) return;
  const step = Math.max(1, Math.floor(words.length / 7));
  let last = "";
  words.forEach((word, i) => {
    const sample = word.accent || i % step === 0;
    if (!sample || word.color === last) return;
    last = word.color;
    const [r, g, b] = hexToRgb(word.color);
    tl.to(
      wash.tint,
      {
        r,
        g,
        b,
        a: 0.42,
        duration: 0.9,
        ease: "sine.inOut",
        onUpdate: () => paintWash(wash.el, wash.tint),
      },
      atPos(position, i * stagger)
    );
  });
}

function useLastThursdayLabel() {
  const [label, setLabel] = useState("Thursday");

  useEffect(() => {
    const today = new Date();
    const lastThursday = new Date(today);
    const daysToThursday = (today.getDay() + 3) % 7;
    lastThursday.setDate(today.getDate() - daysToThursday);
    const dateStr = lastThursday.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    setLabel(`Thursday ${dateStr}`);
  }, []);

  return label;
}

function PulseDot({ className }: { className?: string }) {
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;
    const pulse = gsap.to(dot, {
      opacity: 0.55,
      scale: 0.85,
      duration: 1.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    return () => {
      pulse.kill();
    };
  }, []);

  return (
    <span
      ref={dotRef}
      className={
        className ??
        "w-2 h-2 rounded-full bg-voltage-yellow shrink-0 shadow-[0_0_6px_2px_rgba(255,241,0,0.65)]"
      }
    />
  );
}

function LiveDot() {
  return (
    <span className="relative inline-flex w-2.5 h-2.5 shrink-0">
      <span className="clock-live-ping" />
      <span className="clock-live-core" />
    </span>
  );
}

function DeployStamp({ moduleRef }: { moduleRef: RefObject<HTMLDivElement | null> }) {
  const deployLabel = useLastThursdayLabel();

  return (
    <div ref={moduleRef} className="flex items-center gap-3">
      <PulseDot />
      <span className="type-caption text-smoke">Last deploy: {deployLabel}</span>
    </div>
  );
}

/**
 * One entry per pinned scroll state on the left. Add a 4th/5th state by
 * appending another object here plus another breakpoint label on the
 * timeline below — the CardSwap stack and its scroll wiring don't need
 * to change.
 */
const CLOCK_CARDS: {
  id: string;
  value: string;
  subtext: string;
  showDeploy?: boolean;
}[] = [
  { id: "mo-demo", value: "04", subtext: "MO. DEMO" },
  { id: "thu", value: "THU", subtext: "EVERY WEEK" },
  { id: "live", value: "LIVE", subtext: "ON A URL", showDeploy: true },
];

function ClockCardContent({
  index,
  value,
  subtext,
  showDeploy,
  isActive,
}: {
  index: number;
  value: string;
  subtext: string;
  showDeploy?: boolean;
  isActive: boolean;
}) {
  const deployLabel = useLastThursdayLabel();
  const valueRef = useRef<HTMLSpanElement>(null);
  const wasActive = useRef(false);

  useEffect(() => {
    const el = valueRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      wasActive.current = isActive;
      return;
    }
    if (isActive && !wasActive.current) {
      gsap.fromTo(
        el,
        { scale: 1.22, filter: "brightness(1.8) saturate(1.4)" },
        {
          scale: 1,
          filter: "brightness(1) saturate(1)",
          duration: 0.7,
          ease: "elastic.out(1, 0.55)",
        }
      );
    }
    wasActive.current = isActive;
  }, [isActive]);

  const indexStr = String(index + 1).padStart(2, "0");

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center text-center px-6 overflow-hidden">
      <span aria-hidden className="clock-card-accent" />
      <span aria-hidden className="clock-card-ghost">
        {indexStr}
      </span>
      <span
        aria-hidden
        className="clock-card-glow"
        style={{ opacity: isActive ? 1 : 0.3 }}
      />
      <span
        ref={valueRef}
        className={`font-display text-[clamp(48px,7vw,72px)] leading-none clock-card-value inline-block transition-colors duration-300 ${
          isActive ? "text-voltage-yellow" : "text-voltage-yellow/55"
        }`}
      >
        {value}
      </span>
      <span className="type-caption text-smoke mt-3 relative">{subtext}</span>
      {showDeploy && (
        <div className="flex items-center gap-2 mt-6 relative">
          <LiveDot />
          <span className="type-caption text-smoke">
            Last deploy: {deployLabel}
          </span>
        </div>
      )}
    </div>
  );
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else ref.current = value;
}

export const TheClock = forwardRef<HTMLElement>(function TheClock(_, forwardedRef) {
  const sectionRef = useRef<HTMLElement>(null);
  const setSectionRef = useCallback(
    (node: HTMLElement | null) => {
      sectionRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef]
  );
  const introRef = useRef<HTMLParagraphElement>(null);
  const beat1Ref = useRef<HTMLDivElement>(null);
  const beat2Ref = useRef<HTMLDivElement>(null);
  const beat3Ref = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const p1Ref = useRef<HTMLParagraphElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const p2Ref = useRef<HTMLParagraphElement>(null);
  const h3Ref = useRef<HTMLHeadingElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const moduleRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [cardIndex, setCardIndex] = useState(() =>
    reducedMotion ? CLOCK_CARDS.length - 1 : 0
  );
  const cardIndexRef = useRef(cardIndex);

  useEffect(() => {
    const section = sectionRef.current;
    const washEl = washRef.current;
    if (!section) return;

    const prefersReduced = reducedMotion;
    const tint: WashTint = { r: 0, g: 0, b: 0, a: 0 };
    const paintStaticWash = () => washEl?.classList.add("is-static");
    const clearStaticWash = () => washEl?.classList.remove("is-static");

    if (prefersReduced) {
      [beat1Ref, beat2Ref, beat3Ref, moduleRef, ctaRef].forEach((r) => {
        if (r.current) gsap.set(r.current, { autoAlpha: 1, y: 0 });
      });
      paintStaticWash();
      return;
    }

    const beats = [beat1Ref.current, beat2Ref.current, beat3Ref.current];
    const mm = gsap.matchMedia();

    const splits = [
      splitWords(introRef.current),
      splitWords(h1Ref.current, true),
      splitWords(p1Ref.current, true),
      splitWords(h2Ref.current, true),
      splitWords(p2Ref.current, true),
      splitWords(h3Ref.current, true),
    ];
    const allWords = splits.flatMap((s) => s.words);
    applyWordColors(allWords, "muted");

    const revertSplits = () => splits.forEach((s) => s.revert());

    const setCard = (idx: number) => {
      if (cardIndexRef.current === idx) return;
      cardIndexRef.current = idx;
      setCardIndex(idx);
    };

    mm.add("(max-width: 767px)", () => {
      gsap.set([...beats, moduleRef.current, ctaRef.current], {
        autoAlpha: 1,
        y: 0,
      });
      applyWordColors(allWords, "final");
      paintStaticWash();
      setCard(CLOCK_CARDS.length - 1);
    });

    mm.add("(min-width: 768px)", () => {
      gsap.set(beats, { autoAlpha: 0, y: 24 });
      gsap.set([moduleRef.current, ctaRef.current], { autoAlpha: 0, y: 16 });
      applyWordColors(allWords, "muted");
      clearStaticWash();
      tint.r = 0;
      tint.g = 0;
      tint.b = 0;
      tint.a = 0;
      if (washEl) paintWash(washEl, tint);
      setCard(0);

      const breakpoints = { beat2: 0.33, beat3: 0.66 };
      const wash = washEl ? { el: washEl, tint } : undefined;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=420%",
          pin: true,
          pinSpacing: true,
          scrub: 0.45,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx =
              self.progress >= breakpoints.beat3
                ? 2
                : self.progress >= breakpoints.beat2
                ? 1
                : 0;
            setCard(idx);
          },
        },
      });

      const introWords = splits[0].words;
      const beat1Words = [...splits[1].words, ...splits[2].words];
      const beat2Words = [...splits[3].words, ...splits[4].words];
      const beat3Words = splits[5].words;

      revealWords(tl, introWords, 0, wash);

      tl.addLabel("beat1", ">")
        .to(beat1Ref.current, { autoAlpha: 1, y: 0, duration: 0.55 }, "beat1");
      revealWords(tl, beat1Words, "beat1+=0.08", wash);
      tl.to(beat1Ref.current, { duration: 1.1 })
        .to(beat1Ref.current, { autoAlpha: 0, y: -20, duration: 0.6 })
        .addLabel("beat2")
        .to(beat2Ref.current, { autoAlpha: 1, y: 0, duration: 0.55 }, "beat2");
      revealWords(tl, beat2Words, "beat2+=0.08", wash);
      tl.to(beat2Ref.current, { duration: 1.4 })
        .to(beat2Ref.current, { autoAlpha: 0, y: -20, duration: 0.6 })
        .addLabel("beat3")
        .to(beat3Ref.current, { autoAlpha: 1, y: 0, duration: 0.55 }, "beat3")
        .to(moduleRef.current, { autoAlpha: 1, duration: 0.4 }, "beat3+=0.15")
        .to(
          ctaRef.current,
          { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" },
          "beat3+=0.35"
        );
      revealWords(tl, beat3Words, "beat3+=0.08", wash);
      tl.to(beat3Ref.current, { duration: 1.6 });

      // Recompute the card-swap breakpoints from the timeline's own
      // label positions so the right-side stack changes state at exactly
      // the same scroll fractions as the left-side headline swap.
      const totalDuration = tl.duration();
      if (totalDuration > 0) {
        breakpoints.beat2 = (tl.labels.beat2 ?? 0) / totalDuration;
        breakpoints.beat3 = (tl.labels.beat3 ?? 0) / totalDuration;
      }

      const refresh = () => {
        requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", onLoad);
      const t = window.setTimeout(refresh, 200);

      return () => {
        window.removeEventListener("load", onLoad);
        window.clearTimeout(t);
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });

    return () => {
      mm.revert();
      revertSplits();
    };
  }, [reducedMotion]);

  return (
    <section
      ref={setSectionRef}
      id="clock"
      className="relative z-[3] overflow-hidden bg-carbon-black rounded-t-[28px] md:rounded-t-[64px] h-auto md:h-screen"
      aria-label="The Clock"
    >
      <div ref={washRef} className="clock-wash" aria-hidden />
      <div className="relative z-[1] h-full flex flex-col justify-center page-wrap py-16 md:py-20">
        <p className="type-caption text-smoke mb-4">04 · The Clock</p>
        <div className="grid w-full min-w-0 md:grid-cols-[minmax(0,1fr)_minmax(260px,380px)] gap-10 lg:gap-16 items-center">
          <div className="relative w-full min-w-0 min-h-0 md:min-h-[320px]">
            <div
              ref={beat1Ref}
              className="relative mb-12 md:mb-0 md:absolute md:top-0 md:left-0 md:right-0 will-change-[opacity,transform]"
            >
              <h2
                ref={h1Ref}
                className="clock-copy type-display mb-6 break-words"
              >
                You know the pattern.
              </h2>
              <p ref={p1Ref} className="clock-copy type-body max-w-[54ch]">
                A{" "}
                <span data-clock-accent="#f97316">six-week discovery</span>{" "}
                phase. A{" "}
                <span data-clock-accent="#c084fc">kickoff deck</span>. Status
                calls where the honest answer is “
                <span data-clock-accent="#60a5fa">
                  we’re still setting up the environment
                </span>
                .” A demo in{" "}
                <span data-clock-accent="#f472b6">month four</span> that looks
                nothing like what you described.
              </p>
            </div>

            <div
              ref={beat2Ref}
              className="relative mb-12 md:mb-0 md:absolute md:top-0 md:left-0 md:right-0 will-change-[opacity,transform]"
            >
              <h2
                ref={h2Ref}
                className="clock-copy type-display mb-6 break-words"
              >
                We run on a different clock.
              </h2>
              <p ref={p2Ref} className="clock-copy type-body max-w-[54ch]">
                <span data-clock-accent="#d1ffca">
                  Scope is locked in week one.
                </span>{" "}
                From week two, there is a working build in your hands every{" "}
                <span data-clock-accent="#fff100">Thursday</span>:{" "}
                <span data-clock-accent="#4EE2EF">
                  deployed, clickable, on a real URL, not a Figma frame.
                </span>{" "}
                A focused MVP is live in{" "}
                <span data-clock-accent="#f97316">eight weeks</span>. A
                multi-tenant platform with third-party integrations and a
                compliance layer runs 10 to 14. We tell you which one you are
                during the{" "}
                <span data-clock-accent="#c084fc">
                  Build Review, in writing
                </span>
                , before there is a contract to sign. The eight weeks on our
                homepage is{" "}
                <span data-clock-accent="#f472b6">
                  a commitment, not a range we hope you forget.
                </span>
              </p>
            </div>

            <div
              ref={beat3Ref}
              className="relative md:absolute md:top-0 md:left-0 md:right-0 will-change-[opacity,transform]"
            >
              <h2
                ref={h3Ref}
                className="clock-copy type-display mb-8 max-w-[20ch] break-words"
              >
                You will never have to ask what we&apos;re working on.{" "}
                <span data-clock-accent="#fff100">You&apos;ll be using it.</span>
              </h2>
              <DeployStamp moduleRef={moduleRef} />
              <div ref={ctaRef} className="mt-7">
                <MagneticButton href="#contact" variant="inverted" strength={0}>
                  Book a build review →
                </MagneticButton>
              </div>
            </div>
          </div>

          <div
            className={`relative flex items-center justify-center justify-self-center md:justify-self-end w-full max-w-[260px] md:max-w-[380px] aspect-square mt-6 md:mt-0 ${
              reducedMotion ? "" : "clock-card-float"
            }`}
            aria-hidden="true"
          >
            <CardSwap
              width={200}
              height={200}
              cardDistance={28}
              verticalDistance={34}
              skewAmount={6}
              activeIndex={cardIndex}
              reducedMotion={reducedMotion}
            >
              {CLOCK_CARDS.map((card, i) => (
                <Card key={card.id}>
                  <ClockCardContent
                    index={i}
                    value={card.value}
                    subtext={card.subtext}
                    showDeploy={card.showDeploy}
                    isActive={cardIndex === i}
                  />
                </Card>
              ))}
            </CardSwap>
          </div>
        </div>
      </div>
    </section>
  );
});
