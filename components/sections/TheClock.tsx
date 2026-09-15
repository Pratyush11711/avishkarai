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
import { ClockLoopVideo } from "@/components/sections/ClockVideos";
import {
  ScrollScrubSequence,
  type ScrollScrubSequenceHandle,
} from "@/components/hero/ScrollScrubSequence";

const DIM = "rgba(255, 255, 255, 0.14)";

/** Bright ink the active band paints with as you scroll. */
const INK = ["#4fd8ff", "#ffffff", "#4fd8ff"];

/** Solid section grounds — dark cousins of the ink, like the reference. */
const GROUND = [
  "#050a34",
  "#0a1550",
  "#050a34",
  "#0a1550",
  "#050a34",
  "#0a1550",
  "#050a34",
];

type ClockLine = { el: HTMLElement };

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

function muteLines(lines: ClockLine[]) {
  lines.forEach((line) => {
    line.el.style.color = DIM;
  });
}

/** Lights one full line at a time as you scroll, with a soft neighbor. */
function applySpotlight(lines: ClockLine[], t: number, ink: string) {
  if (!lines.length) return;
  const n = lines.length;
  const center = Math.min(Math.max(t, 0), 1) * (n - 1);
  const radius = 0.78;
  const [ir, ig, ib] = hexToRgb(ink);

  lines.forEach((line, i) => {
    const falloff = Math.max(0, 1 - Math.abs(i - center) / radius);
    const k = falloff * falloff;
    if (k < 0.04) {
      line.el.style.color = DIM;
      return;
    }
    line.el.style.color = `rgba(${ir}, ${ig}, ${ib}, ${0.2 + 0.8 * k})`;
  });
}

function collectLines(el: HTMLElement | null): ClockLine[] {
  if (!el) return [];
  return [...el.querySelectorAll<HTMLElement>(".clock-line")].map((node) => ({
    el: node,
  }));
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
        "w-2 h-2 rounded-full bg-accent shrink-0 shadow-[0_0_6px_2px_rgba(79,216,255,0.65)]"
      }
    />
  );
}

function DeployStamp({ moduleRef }: { moduleRef: RefObject<HTMLDivElement | null> }) {
  const deployLabel = useLastThursdayLabel();

  return (
    <div ref={moduleRef} className="flex items-center gap-3">
      <PulseDot />
      <span className="type-caption text-text-inverse/70">Last deploy: {deployLabel}</span>
    </div>
  );
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else ref.current = value;
}

export const TheClock = forwardRef<HTMLElement>(function TheClock(_, forwardedRef) {
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const setSectionRef = useCallback(
    (node: HTMLElement | null) => {
      sectionRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef]
  );
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
  const sequenceRef = useRef<ScrollScrubSequenceHandle>(null);
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    const washEl = washRef.current;
    if (!track || !section) return;

    const prefersReduced = reducedMotion;

    const paintScene = (
      progress: number,
      active: ClockLine[],
      local: number,
      frameProgress = progress
    ) => {
      const ink = along(INK, progress);
      if (washEl) paintWash(washEl, ink, 0.12);
      applySpotlight(active, local, ink);
      sequenceRef.current?.setProgress(frameProgress);
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

    const beat1Lines = [...collectLines(h1Ref.current), ...collectLines(p1Ref.current)];
    const beat2Lines = [...collectLines(h2Ref.current), ...collectLines(p2Ref.current)];
    const beat3Lines = collectLines(h3Ref.current);
    const allLines = [...beat1Lines, ...beat2Lines, ...beat3Lines];
    muteLines(allLines);

    mm.add("(max-width: 767px)", () => {
      gsap.set([...beats, moduleRef.current, ctaRef.current], {
        autoAlpha: 1,
        y: 0,
      });
      allLines.forEach((line) => {
        line.el.style.color = "";
      });
      if (washEl) paintWash(washEl, INK[3], 0.1);
      section.style.backgroundColor = GROUND[0];
    });

    mm.add("(min-width: 768px)", () => {
      gsap.set(beats, { autoAlpha: 0, y: 24 });
      gsap.set([moduleRef.current, ctaRef.current], { autoAlpha: 0, y: 16 });
      muteLines(allLines);
      if (washEl) paintWash(washEl, INK[0], 0);

      const textTl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

      const hold = (lines: ClockLine[]) =>
        Math.max(2.2, lines.length * 0.85);

      textTl
        .addLabel("beat1", 0)
        .to(beat1Ref.current, { autoAlpha: 1, y: 0, duration: 0.55 }, "beat1")
        .to({}, { duration: hold(beat1Lines) })
        .to(beat1Ref.current, { autoAlpha: 0, y: -20, duration: 0.6 })
        .addLabel("beat2")
        .to(beat2Ref.current, { autoAlpha: 1, y: 0, duration: 0.55 }, "beat2")
        .to({}, { duration: hold(beat2Lines) })
        .to(beat2Ref.current, { autoAlpha: 0, y: -20, duration: 0.6 })
        .addLabel("beat3")
        .to(beat3Ref.current, { autoAlpha: 1, y: 0, duration: 0.55 }, "beat3")
        .to(moduleRef.current, { autoAlpha: 1, duration: 0.4 }, "beat3+=0.15")
        .to(
          ctaRef.current,
          { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" },
          "beat3+=0.35"
        );

      const applyProgress = (progress: number) => {
        textTl.progress(progress);

        const time = textTl.time();
        const t1 = textTl.labels.beat1 ?? 0;
        const t2 = textTl.labels.beat2 ?? 0;
        const t3 = textTl.labels.beat3 ?? 0;
        const end = textTl.duration() || 1;
        const frameProgress = Math.min(1, time / end);

        let active = beat1Lines;
        let local = 0;
        if (time < t2) {
          active = beat1Lines;
          local = t2 > t1 ? (time - t1) / (t2 - t1) : 0;
          muteLines(beat2Lines);
          muteLines(beat3Lines);
        } else if (time < t3) {
          active = beat2Lines;
          local = t3 > t2 ? (time - t2) / (t3 - t2) : 0;
          muteLines(beat1Lines);
          muteLines(beat3Lines);
        } else {
          active = beat3Lines;
          local = (time - t3) / Math.max(end - t3, 0.001);
          muteLines(beat1Lines);
          muteLines(beat2Lines);
        }

        paintScene(progress, active, local, frameProgress);
      };

      const st = ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyProgress(self.progress),
        onLeave: () => applyProgress(1),
        onLeaveBack: () => applyProgress(0),
      });

      applyProgress(st.progress);

      return () => {
        st.kill();
        textTl.kill();
      };
    });

    return () => {
      mm.revert();
      allLines.forEach((line) => {
        line.el.style.color = "";
      });
    };
  }, [reducedMotion]);

  return (
    <div ref={trackRef} className="clock-track">
      <section
        ref={setSectionRef}
        id="clock"
        data-lusion-cursor="hero"
        className="clock-section"
        aria-label="The Clock"
      >
      {!isDesktop && <ClockLoopVideo reducedMotion={reducedMotion} />}
      <div className="clock-scene-scrim" aria-hidden />
      <div ref={washRef} className="clock-wash" aria-hidden />
      <div className="relative z-[2] h-full min-h-0 flex flex-col justify-start page-wrap pt-[max(5.5rem,env(safe-area-inset-top))] pb-8 md:pt-28 md:pb-10">
        <div className="grid w-full min-w-0 md:grid-cols-[minmax(0,1fr)_minmax(280px,46%)] gap-8 lg:gap-16 items-stretch">
          <div className="clock-copy-col relative w-full min-w-0 min-h-0 grid md:items-center">
            <div
              ref={beat1Ref}
              className="relative md:col-start-1 md:row-start-1 will-change-[opacity,transform]"
            >
              <h2 ref={h1Ref} className="clock-heading">
                <span className="clock-line">You know the pattern.</span>
              </h2>
              <p ref={p1Ref} className="clock-body">
                <span className="clock-line">
                  A six-week discovery phase. A kickoff deck.
                </span>
                <span className="clock-line">
                  Status calls where the honest answer is “we’re still setting
                  up the environment.”
                </span>
                <span className="clock-line">
                  A demo in month four that looks nothing like what you
                  described.
                </span>
              </p>
            </div>

            <div
              ref={beat2Ref}
              className="relative md:col-start-1 md:row-start-1 will-change-[opacity,transform]"
            >
              <h2 ref={h2Ref} className="clock-heading">
                <span className="clock-line">We run on a different clock.</span>
              </h2>
              <p ref={p2Ref} className="clock-body">
                <span className="clock-line">Scope is locked in week one.</span>
                <span className="clock-line">
                  From week two, there is a working build in your hands every
                  Thursday: deployed, clickable, on a real URL, not a Figma
                  frame.
                </span>
                <span className="clock-line">
                  A focused MVP is live in eight weeks. A multi-tenant platform
                  with third-party integrations and a compliance layer runs 10
                  to 14.
                </span>
                <span className="clock-line">
                  We tell you which one you are during the Build Review, in
                  writing, before there is a contract to sign.
                </span>
                <span className="clock-line">
                  The eight weeks on our homepage is a commitment, not a range
                  we hope you forget.
                </span>
              </p>
            </div>

            <div
              ref={beat3Ref}
              className="relative md:col-start-1 md:row-start-1 will-change-[opacity,transform]"
            >
              <h2 ref={h3Ref} className="clock-heading clock-heading-long">
                <span className="clock-line">
                  You will never have to ask what we&apos;re working on.
                </span>
                <span className="clock-line">You&apos;ll be using it.</span>
              </h2>
              <DeployStamp moduleRef={moduleRef} />
              <div ref={ctaRef} className="mt-7">
                <MagneticButton href="#contact" variant="inverted" strength={0}>
                  Book a build review →
                </MagneticButton>
              </div>
            </div>
          </div>
          {isDesktop ? (
            <div className="clock-media-col">
              <ScrollScrubSequence
                ref={sequenceRef}
                framePath="/combined"
                frameCount={153}
                frameNamePattern="ezgif-frame-XXX.jpg"
                posterSrc="/combined/ezgif-frame-001.jpg?v=4k"
                version="4k"
                className="clock-videos-wrap clock-sequence"
              />
            </div>
          ) : null}
        </div>
      </div>
      </section>
    </div>
  );
});

export default TheClock;
