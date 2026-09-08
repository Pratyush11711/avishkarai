"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const DAYS = [
  { label: "MON", active: false },
  { label: "TUE", active: false },
  { label: "WED", active: false },
  { label: "THU", active: true },
  { label: "FRI", active: false },
  { label: "SAT", active: false },
  { label: "SUN", active: false },
];

export function TheClock() {
  const sectionRef = useRef<HTMLElement>(null);
  const beat1Ref = useRef<HTMLDivElement>(null);
  const beat2Ref = useRef<HTMLDivElement>(null);
  const beat3Ref = useRef<HTMLDivElement>(null);
  const visual1Ref = useRef<HTMLDivElement>(null);
  const visual2Ref = useRef<HTMLDivElement>(null);
  const visual3Ref = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const moduleRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const [deployLabel, setDeployLabel] = useState("Last deploy: Thursday");

  useEffect(() => {
    const today = new Date();
    const lastThursday = new Date(today);
    const daysToThursday = (today.getDay() + 3) % 7;
    lastThursday.setDate(today.getDate() - daysToThursday);
    const dateStr = lastThursday.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    setDeployLabel(`Last deploy: Thursday ${dateStr}`);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      [beat1Ref, beat2Ref, beat3Ref, moduleRef, visual3Ref].forEach((r) => {
        if (r.current) gsap.set(r.current, { autoAlpha: 1, y: 0 });
      });
      return;
    }

    const beats = [beat1Ref.current, beat2Ref.current, beat3Ref.current];
    const visuals = [visual1Ref.current, visual2Ref.current, visual3Ref.current];
    const mm = gsap.matchMedia();

    mm.add("(max-width: 767px)", () => {
      gsap.set([...beats, moduleRef.current], { autoAlpha: 1, y: 0 });
      gsap.set(visuals, { autoAlpha: 1, scale: 1 });
    });

    mm.add("(min-width: 768px)", () => {
      gsap.set(beats, { autoAlpha: 0, y: 24 });
      gsap.set(visuals, { autoAlpha: 0, scale: 0.92 });
      gsap.set(moduleRef.current, { autoAlpha: 0 });

      if (ringRef.current) {
        const length = ringRef.current.getTotalLength();
        gsap.set(ringRef.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      }

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=180%",
          pin: true,
          pinSpacing: true,
          scrub: 0.15,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(beat1Ref.current, { autoAlpha: 1, y: 0, duration: 0.55 })
        .to(visual1Ref.current, { autoAlpha: 1, scale: 1, duration: 0.55 }, "<")
        .to(beat1Ref.current, { duration: 1.1 })
        .to(beat1Ref.current, { autoAlpha: 0, y: -20, duration: 0.45 })
        .to(visual1Ref.current, { autoAlpha: 0, scale: 0.96, duration: 0.45 }, "<")
        .to(beat2Ref.current, { autoAlpha: 1, y: 0, duration: 0.55 })
        .to(visual2Ref.current, { autoAlpha: 1, scale: 1, duration: 0.55 }, "<")
        .to(
          ringRef.current,
          { strokeDashoffset: 0, duration: 0.9 },
          "<0.1"
        )
        .to(beat2Ref.current, { duration: 1.5 })
        .to(beat2Ref.current, { autoAlpha: 0, y: -20, duration: 0.45 })
        .to(visual2Ref.current, { autoAlpha: 0, scale: 0.96, duration: 0.45 }, "<")
        .to(beat3Ref.current, { autoAlpha: 1, y: 0, duration: 0.55 })
        .to(visual3Ref.current, { autoAlpha: 1, scale: 1, duration: 0.55 }, "<")
        .to(moduleRef.current, { autoAlpha: 1, duration: 0.4 }, "<0.15")
        .to({}, { duration: 1.2 });

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
    };
  }, []);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;
    const pulse = gsap.to(dot, {
      opacity: 0.25,
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
    <section
      ref={sectionRef}
      id="clock"
      className="relative z-[3] overflow-x-clip bg-carbon-black rounded-t-[28px] md:rounded-t-[64px] h-auto md:h-screen md:overflow-hidden"
      aria-label="The Clock"
    >
      <div className="h-full flex flex-col justify-center page-wrap py-16 md:py-20">
        <p className="type-caption text-smoke mb-4">04 · The Clock</p>
        <p className="type-body text-paper-white max-w-[42ch] mb-8 md:mb-10">
          Most studios promise deliverables next quarter. We ship yours by
          Thursday.
        </p>

        <div className="grid w-full min-w-0 md:grid-cols-[minmax(0,1fr)_minmax(260px,380px)] gap-10 lg:gap-16 items-center">
          <div className="relative w-full min-w-0 min-h-0 md:min-h-[320px]">
            <div
              ref={beat1Ref}
              className="relative mb-12 md:mb-0 md:absolute md:top-0 md:left-0 md:right-0 will-change-[opacity,transform]"
            >
              <h2 className="type-display text-paper-white mb-6 break-words">
                You know the pattern.
              </h2>
              <p className="type-body text-smoke max-w-[54ch]">
                A six-week discovery phase. A kickoff deck. Status calls where the
                honest answer is “we’re still setting up the environment.” A demo
                in month four that looks nothing like what you described.
              </p>
            </div>

            <div
              ref={beat2Ref}
              className="relative mb-12 md:mb-0 md:absolute md:top-0 md:left-0 md:right-0 will-change-[opacity,transform]"
            >
              <h2 className="type-display text-paper-white mb-6 break-words">
                We run on a different clock.
              </h2>
              <p className="type-body text-smoke max-w-[54ch]">
                Scope is locked in week one. From week two, there is a working
                build in your hands every Thursday: deployed, clickable, on a real
                URL, not a Figma frame. A focused MVP is live in eight weeks. A
                multi-tenant platform with third-party integrations and a
                compliance layer runs 10 to 14. We tell you which one you are
                during the Build Review, in writing, before there is a contract to
                sign. The eight weeks on our homepage is a commitment, not a range
                we hope you forget.
              </p>
            </div>

            <div
              ref={beat3Ref}
              className="relative md:absolute md:top-0 md:left-0 md:right-0 will-change-[opacity,transform]"
            >
              <h2 className="type-display text-paper-white mb-8 max-w-[20ch] break-words">
                You will never have to ask what we're working on. You'll be using
                it.
              </h2>
              <div ref={moduleRef} className="flex items-center gap-3">
                <span
                  ref={dotRef}
                  className="w-2 h-2 rounded-full bg-voltage-yellow shrink-0"
                />
                <span className="type-caption text-smoke">{deployLabel}</span>
              </div>
            </div>
          </div>

          <div
            className="relative hidden md:flex items-center justify-center justify-self-end w-full max-w-[380px] aspect-square"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 320 320"
              className="absolute inset-0 w-full h-full"
            >
              <circle
                cx="160"
                cy="160"
                r="138"
                fill="none"
                stroke="#2f2f2f"
                strokeWidth="1.5"
              />
              <circle
                ref={ringRef}
                cx="160"
                cy="160"
                r="138"
                fill="none"
                stroke="#fff100"
                strokeWidth="2"
                strokeLinecap="round"
                transform="rotate(-90 160 160)"
              />
              {DAYS.map((day, i) => {
                const angle = (i / DAYS.length) * Math.PI * 2 - Math.PI / 2;
                const x = 160 + Math.cos(angle) * 118;
                const y = 160 + Math.sin(angle) * 118;
                return (
                  <g key={`${day.label}-${i}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={day.active ? 4.5 : 2.5}
                      fill={day.active ? "#fff100" : "#444444"}
                    />
                  </g>
                );
              })}
            </svg>

            {DAYS.map((day, i) => {
              const angle = (i / DAYS.length) * Math.PI * 2 - Math.PI / 2;
              const x = 50 + Math.cos(angle) * 42;
              const y = 50 + Math.sin(angle) * 42;
              return (
                <span
                  key={`label-${day.label}-${i}`}
                  className="absolute type-caption pointer-events-none"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: "translate(-50%, -50%)",
                    color: day.active ? "#fff100" : "#979797",
                  }}
                >
                  {day.label}
                </span>
              );
            })}

            <div className="relative z-10 w-[58%] aspect-square rounded-full bg-carbon-black flex items-center justify-center">
              <div
                ref={visual1Ref}
                className="absolute inset-0 flex flex-col items-center justify-center text-center"
              >
                <span className="font-display text-[clamp(40px,6vw,64px)] text-paper-white/90 leading-none">
                  04
                </span>
                <span className="type-caption text-smoke mt-2">MO. DEMO</span>
              </div>
              <div
                ref={visual2Ref}
                className="absolute inset-0 flex flex-col items-center justify-center text-center"
              >
                <span className="font-display text-[clamp(40px,6vw,64px)] text-voltage-yellow leading-none">
                  THU
                </span>
                <span className="type-caption text-smoke mt-2">EVERY WEEK</span>
              </div>
              <div
                ref={visual3Ref}
                className="absolute inset-0 flex flex-col items-center justify-center text-center"
              >
                <span className="font-display text-[clamp(40px,6vw,64px)] text-paper-white leading-none">
                  LIVE
                </span>
                <span className="type-caption text-smoke mt-2">ON A URL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
