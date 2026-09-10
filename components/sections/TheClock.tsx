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
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ClockCanvas } from "./ClockCanvas";

const DIM = "rgba(255, 255, 255, 0.14)";

/** Bright ink the active band paints with as you scroll. */
const INK = [
  "#f7c6d8",
  "#fff1b8",
  "#d1ffca",
  "#4EE2EF",
  "#c084fc",
  "#f97316",
  "#fff100",
];

/** Solid section grounds — dark cousins of the ink, like the reference. */
const GROUND = [
  "#1a0f14",
  "#2a1b15",
  "#1c1a10",
  "#0c181c",
  "#140818",
  "#1a0c08",
  "#16140a",
];

type ClockWord = { el: HTMLElement; accent: boolean };

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
  const ch = (x: number) => Math.round(x).toString(16).padStart(2, "0");
  return `#${ch(ar + (br - ar) * t)}${ch(ag + (bg - ag) * t)}${ch(ab + (bb - ab) * t)}`;
}

function along(palette: string[], t: number): string {
  const n = palette.length - 1;
  const x = Math.min(Math.max(t, 0), 1) * n;
  const i = Math.floor(x);
  return mixHex(palette[i], palette[Math.min(i + 1, n)], x - i);
}

function paintWash(el: HTMLElement, hex: string, a: number) {
  const [r, g, b] = hexToRgb(hex);
  el.style.setProperty("--clock-r", String(r));
  el.style.setProperty("--clock-g", String(g));
  el.style.setProperty("--clock-b", String(b));
  el.style.setProperty("--clock-a", a.toFixed(3));
}

function muteWords(words: ClockWord[]) {
  words.forEach((word) => {
    word.el.style.color = DIM;
  });
}

/**
 * Moving spotlight: a band of words around `t` (0–1) lights up in `ink`.
 * Accent words in the band go white. Everything else stays dim.
 */
function applySpotlight(words: ClockWord[], t: number, ink: string) {
  if (!words.length) return;
  const n = words.length;
  const center = Math.min(Math.max(t, 0), 1) * (n - 1);
  const radius = Math.max(3.4, Math.min(9, n * 0.18));
  const [ir, ig, ib] = hexToRgb(ink);

  words.forEach((word, i) => {
    const falloff = Math.max(0, 1 - Math.abs(i - center) / radius);
    const k = falloff * falloff;
    if (k < 0.03) {
      word.el.style.color = DIM;
      return;
    }
    if (word.accent) {
      word.el.style.color = `rgba(255, 255, 255, ${0.14 + 0.86 * k})`;
      return;
    }
    word.el.style.color = `rgba(${ir}, ${ig}, ${ib}, ${0.14 + 0.86 * k})`;
  });
}

function splitWords(el: HTMLElement | null): {
  words: ClockWord[];
  revert: () => void;
} {
  if (!el) return { words: [], revert: () => {} };

  const original = el.innerHTML;
  const words: ClockWord[] = [];

  const wrapText = (text: string, accent: boolean) => {
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
      words.push({ el: span, accent });
    });
    return frag;
  };

  const next: Node[] = [];
  el.childNodes.forEach((node) => next.push(node));
  next.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (!text.trim()) return;
      el.replaceChild(wrapText(text, false), node);
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const child = node as HTMLElement;
      const accent = child.hasAttribute("data-clock-accent");
      el.replaceChild(wrapText(child.textContent ?? "", accent), child);
    }
  });

  return {
    words,
    revert: () => {
      el.innerHTML = original;
    },
  };
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

function DeployStamp({ moduleRef }: { moduleRef: RefObject<HTMLDivElement | null> }) {
  const deployLabel = useLastThursdayLabel();

  return (
    <div ref={moduleRef} className="flex items-center gap-3">
      <PulseDot />
      <span className="type-caption text-smoke">Last deploy: {deployLabel}</span>
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
  const [isClockVisible, setIsClockVisible] = useState(true);
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsClockVisible(entry.isIntersecting),
      { rootMargin: "160px 0px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const washEl = washRef.current;
    if (!section) return;

    const prefersReduced = reducedMotion;

    const paintScene = (progress: number, active: ClockWord[], local: number) => {
      const ink = along(INK, progress);
      if (washEl) paintWash(washEl, ink, 0.12);
      applySpotlight(active, local, ink);
    };

    if (prefersReduced) {
      [beat1Ref, beat2Ref, beat3Ref, moduleRef, ctaRef].forEach((r) => {
        if (r.current) gsap.set(r.current, { autoAlpha: 1, y: 0 });
      });
      section.style.backgroundColor = GROUND[2];
      if (washEl) paintWash(washEl, INK[2], 0.22);
      return;
    }

    const beats = [beat1Ref.current, beat2Ref.current, beat3Ref.current];
    const mm = gsap.matchMedia();

    const splits = [
      splitWords(introRef.current),
      splitWords(h1Ref.current),
      splitWords(p1Ref.current),
      splitWords(h2Ref.current),
      splitWords(p2Ref.current),
      splitWords(h3Ref.current),
    ];
    const allWords = splits.flatMap((s) => s.words);
    muteWords(allWords);

    const revertSplits = () => splits.forEach((s) => s.revert());
    const beat1Words = [...splits[1].words, ...splits[2].words];
    const beat2Words = [...splits[3].words, ...splits[4].words];
    const beat3Words = splits[5].words;

    mm.add("(max-width: 767px)", () => {
      gsap.set([...beats, moduleRef.current, ctaRef.current], {
        autoAlpha: 1,
        y: 0,
      });

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top 75%",
        end: "bottom 25%",
        scrub: 0.4,
        onUpdate: (self) => {
          paintScene(self.progress, allWords, self.progress);
        },
      });
      paintScene(0, allWords, 0);

      return () => st.kill();
    });

    mm.add("(min-width: 768px)", () => {
      gsap.set(beats, { autoAlpha: 0, y: 24 });
      gsap.set([moduleRef.current, ctaRef.current], { autoAlpha: 0, y: 16 });
      muteWords(allWords);
      if (washEl) paintWash(washEl, INK[0], 0);

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
            const time = tl.time();
            const t1 = tl.labels.beat1 ?? 0;
            const t2 = tl.labels.beat2 ?? 0;
            const t3 = tl.labels.beat3 ?? 0;
            const end = tl.duration() || 1;

            let active = beat1Words;
            let local = 0;
            if (time < t2) {
              active = beat1Words;
              local = t2 > t1 ? (time - t1) / (t2 - t1) : 0;
              muteWords(beat2Words);
              muteWords(beat3Words);
            } else if (time < t3) {
              active = beat2Words;
              local = t3 > t2 ? (time - t2) / (t3 - t2) : 0;
              muteWords(beat1Words);
              muteWords(beat3Words);
            } else {
              active = beat3Words;
              local = (time - t3) / Math.max(end - t3, 0.001);
              muteWords(beat1Words);
              muteWords(beat2Words);
            }

            paintScene(self.progress, active, local);
          },
        },
      });

      const hold = (words: ClockWord[]) =>
        Math.max(1.6, words.length * 0.048);

      tl.addLabel("beat1", 0)
        .to(beat1Ref.current, { autoAlpha: 1, y: 0, duration: 0.55 }, "beat1")
        .to({}, { duration: hold(beat1Words) })
        .to(beat1Ref.current, { autoAlpha: 0, y: -20, duration: 0.6 })
        .addLabel("beat2")
        .to(beat2Ref.current, { autoAlpha: 1, y: 0, duration: 0.55 }, "beat2")
        .to({}, { duration: hold(beat2Words) })
        .to(beat2Ref.current, { autoAlpha: 0, y: -20, duration: 0.6 })
        .addLabel("beat3")
        .to(beat3Ref.current, { autoAlpha: 1, y: 0, duration: 0.55 }, "beat3")
        .to(moduleRef.current, { autoAlpha: 1, duration: 0.4 }, "beat3+=0.15")
        .to(
          ctaRef.current,
          { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" },
          "beat3+=0.35"
        )
        .to({}, { duration: hold(beat3Words) });

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
      className="clock-section relative z-[3] overflow-hidden h-auto md:h-screen"
      aria-label="The Clock"
    >
      {!reducedMotion && <ClockCanvas playing={isClockVisible} />}
      <div className="clock-scene-scrim" aria-hidden />
      <div ref={washRef} className="clock-wash" aria-hidden />
      <div className="relative z-[2] h-full flex flex-col justify-center page-wrap py-16 md:py-20">
        <p className="type-caption text-smoke mb-4">04 · The Clock</p>
        <div className="grid w-full min-w-0 md:grid-cols-[minmax(0,1fr)_minmax(280px,46%)] gap-10 lg:gap-16 items-center">
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
          <div className="hidden md:block min-h-[280px]" aria-hidden />
        </div>
      </div>
    </section>
  );
});
