"use client";

import { useEffect, useRef } from "react";

type Capability = {
  id: string;
  number: string;
  title: string;
  initial: string;
  headline: string;
  items: string[];
};

const capabilities: Capability[] = [
  {
    id: "mvp",
    number: "01",
    title: "MVP",
    initial: "M",
    headline: "0 to 1, production-grade",
    items: [
      "0 to 1 products",
      "Bespoke development",
      "Scalable multi-tenant platforms",
      "Mobile apps, iOS and Android",
      "Product design, UI and UX",
      "Design systems",
      "API design and integration",
      "Data modeling and migrations",
    ],
  },
  {
    id: "applied-ai",
    number: "02",
    title: "APPLIED AI",
    initial: "AI",
    headline: "Models wired into real products",
    items: [
      "Voice agents",
      "Document intelligence",
      "Computer vision",
      "Agentic workflows",
      "Model integration and evaluation",
    ],
  },
  {
    id: "methodology",
    number: "03",
    title: "METHODOLOGY",
    initial: "Md",
    headline: "How the work actually ships",
    items: [
      "Scope definition and technical architecture",
      "Compliance architecture, HIPAA-grade",
      "Security, observability, and infrastructure as code",
      "Platform rescues and codebase audits",
      "App store submission and handover",
      "Embedded teams and engineering retainers",
    ],
  },
];

/** Smoothstep curve — zero 1st-derivative at both ends, no jarring snap */
function smoothstep(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

/** Exponential damp toward target — framerate-independent */
function damp(current: number, target: number, lambda: number, dt: number) {
  return target + (current - target) * Math.exp(-lambda * dt);
}

const CARD_RATIO = 1.62;
const CARD_MIN_W = 200;

export function ExpertiseSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rotorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* animation state — all in refs so no re-renders */
  const progressRef = useRef(0);
  const dealtRef = useRef(false);
  const manualRef = useRef(new Map<number, boolean>());
  const lastTimeRef = useRef(0);
  const rafRef = useRef(0);
  const visibleRef = useRef(false);

  useEffect(() => {
    const node = scrollRef.current;
    const stage = stageRef.current;
    if (!node || !stage) return;
    const scrollEl: HTMLDivElement = node;
    const stageEl: HTMLDivElement = stage;

    cardRefs.current.length = capabilities.length;
    rotorRefs.current.length = capabilities.length;
    contentRefs.current.length = capabilities.length;

    const cards = cardRefs.current;
    const rotors = rotorRefs.current;
    const contents = contentRefs.current;
    const mobile = window.matchMedia("(max-width: 800px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let paused = reduced.matches;

    function setFace(index: number, showBack: boolean, stagger = false) {
      const card = cards[index];
      const rotor = rotors[index];
      const content = contents[index];
      if (!card || !rotor) return;

      const alreadyBack = card.classList.contains("deck-card--back");
      rotor.style.transitionDelay = stagger
        ? `${(cards.length - 1 - index) * 0.05}s`
        : "0s";
      if (alreadyBack === showBack) return;

      card.classList.toggle("deck-card--back", showBack);
      rotor.style.setProperty("--flip", showBack ? "0deg" : "180deg");
      if (content) content.setAttribute("aria-hidden", String(showBack));
    }

    function arrange(dt = 1 / 60) {
      const rect = scrollEl.getBoundingClientRect();
      const scrollable = Math.max(1, scrollEl.offsetHeight - window.innerHeight);
      /* Stay stacked until the section has docked, then deal on further scroll. */
      let target =
        paused || mobile.matches || dealtRef.current
          ? 1
          : Math.max(
              0,
              Math.min(
                1,
                (-rect.top) / (scrollable * 0.88)
              )
            );

      progressRef.current = damp(progressRef.current, target, 4.2, dt);
      const n = capabilities.length;
      const center = (n - 1) / 2;
      const staggerBudget = 0.28;
      const t = lastTimeRef.current;

      const stageBox = stageEl.getBoundingClientRect();
      const padX = Math.max(40, window.innerWidth * 0.045);
      const availW = Math.max(280, stageBox.width - padX * 2);
      const availH = Math.max(220, stageBox.height - 28);
      const minGutter = 20;
      const widthFromRow = (availW - minGutter * (n + 1)) / n;
      const widthFromHeight = availH / CARD_RATIO;
      /* Live stage box only — no flat px max. Height fills the stage; the
         row formula keeps three cards side-by-side. */
      const cardW = Math.max(
        CARD_MIN_W,
        Math.min(widthFromRow, widthFromHeight)
      );
      const cardH = cardW * CARD_RATIO;

      cards.forEach((card, i) => {
        if (!card) return;

        /* peel from the top of the stack (last index first) */
        const peelOrder = n - 1 - i;
        const localT = paused
          ? progressRef.current
          : (progressRef.current - peelOrder * (staggerBudget / Math.max(1, n - 1))) /
            Math.max(0.001, 1 - staggerBudget);
        const spread = smoothstep(localT);

        const man = manualRef.current;
        const autoBack = !(
          mobile.matches ||
          paused ||
          spread > 0.62
        );
        const showBack = man.has(i) ? (man.get(i) as boolean) : autoBack;
        setFace(i, showBack, !man.has(i) && !mobile.matches && !paused);

        if (!mobile.matches) {
          const offset = i - center;
          const free = Math.max(0, availW - cardW * n);
          const slot = free / (n + 1);
          const origin = -availW / 2 + slot + cardW / 2;
          const step = cardW + slot;
          const stackX = offset * 4;
          const stackY = -offset * 3;
          const stackAngle = offset * 1.15;
          const fanX = offset * Math.min(72, cardW * 0.22);
          const fanY = Math.abs(offset) * 10;
          const fanAngle = offset * 6;
          const rowX = origin + i * step;
          const floatY = paused
            ? 0
            : Math.sin(t * 0.00155 + i * 1.12) * (2 + 4 * (1 - spread));

          let x: number;
          let y: number;
          let angle: number;
          if (spread < 0.42) {
            const k = smoothstep(spread / 0.42);
            x = stackX + (fanX - stackX) * k;
            y = stackY + (fanY - stackY) * k + floatY;
            angle = stackAngle + (fanAngle - stackAngle) * k;
          } else {
            const k = smoothstep((spread - 0.42) / 0.58);
            x = fanX + (rowX - fanX) * k;
            y = fanY + (0 - fanY) * k + floatY;
            angle = fanAngle * (1 - k);
          }

          card.style.fontSize = `${16 * cardW / 320}px`;
          card.style.width = `${cardW}px`;
          card.style.height = `${cardH}px`;
          card.style.transform =
            `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) rotate(${angle}deg)`;
          card.style.zIndex = String(showBack ? 10 + i : 80 + i);
        } else {
          card.style.removeProperty("font-size");
          card.style.removeProperty("width");
          card.style.removeProperty("height");
          card.style.removeProperty("transform");
          card.style.zIndex = showBack ? String(i + 1) : String(80 + i);
        }
      });
    }

    function frame(t: number) {
      const dt = Math.min(0.05, (t - lastTimeRef.current) / 1000 || 1 / 60);
      lastTimeRef.current = t;
      if (!document.hidden && visibleRef.current) arrange(dt);
      rafRef.current = requestAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries[0].isIntersecting;
        if (visibleRef.current) arrange();
      },
      { rootMargin: "200px" }
    );
    observer.observe(scrollEl);

    const onResize = () => arrange();
    const onMobileChange = () => { manualRef.current.clear(); arrange(); };
    const onReduced = (e: MediaQueryListEvent) => {
      paused = e.matches;
      manualRef.current.clear();
      arrange();
    };

    window.addEventListener("resize", onResize);
    mobile.addEventListener("change", onMobileChange);
    reduced.addEventListener("change", onReduced);
    const stageObserver = new ResizeObserver(() => arrange());
    stageObserver.observe(stageEl);
    visibleRef.current = true;
    /* Two frames so flex has assigned the stage its real height before the
       first measure. ResizeObserver still re-arranges on later size changes. */
    let bootRaf2 = 0;
    const bootRaf1 = requestAnimationFrame(() => {
      bootRaf2 = requestAnimationFrame(() => {
        arrange(1 / 60);
        rafRef.current = requestAnimationFrame(frame);
      });
    });

    return () => {
      cancelAnimationFrame(bootRaf1);
      cancelAnimationFrame(bootRaf2);
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      stageObserver.disconnect();
      window.removeEventListener("resize", onResize);
      mobile.removeEventListener("change", onMobileChange);
      reduced.removeEventListener("change", onReduced);
    };
  }, []);

  const handleCardClick = (index: number) => {
    if (!dealtRef.current && progressRef.current < 0.92) {
      dealtRef.current = true;
      return;
    }
    dealtRef.current = true;
    const card = cardRefs.current[index];
    const isBack = card?.classList.contains("deck-card--back") ?? true;
    manualRef.current.clear();
    capabilities.forEach((_, j) => {
      manualRef.current.set(j, isBack ? j !== index : true);
    });
  };

  return (
    <section id="capabilities" aria-label="Area of expertise" className="deck-section relative z-[2]">
      <div ref={scrollRef} className="deck-scroll">
        <div className="deck-sticky">
          <div className="deck-intro">
            <span className="deck-label">How we build</span>
            <div className="deck-intro-body">
              <div className="deck-heading-slot">
                <h2 className="deck-heading">
                  <span className="deck-heading-a">Area of</span>
                  <span className="deck-heading-b">expertise</span>
                </h2>
              </div>
              <div className="deck-intro-meta">
                <p>
                  Multidisciplinary expertise across
                  MVP, applied AI, and methodology.
                </p>
                <div className="deck-intro-actions">
                  {capabilities.map((cap, i) => (
                    <button
                      key={cap.id}
                      type="button"
                      className="deck-intro-btn"
                      aria-label={`Open ${cap.title.toLowerCase()}`}
                      onClick={() => handleCardClick(i)}
                    >
                      <span aria-hidden="true">{String(i + 1)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div ref={stageRef} className="deck-stage" role="list" aria-label="Capabilities">
            {capabilities.map((cap, i) => (
              <div
                key={cap.id}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="deck-card deck-card--back"
                role="listitem"
              >
                <button
                  className="deck-card__turn"
                  onClick={() => handleCardClick(i)}
                  aria-label={`${cap.title} — click to flip`}
                  aria-pressed="true"
                >
                  <div
                    ref={(el) => { rotorRefs.current[i] = el; }}
                    className="deck-card__rotor"
                    style={{ "--flip": "0deg" } as React.CSSProperties}
                  >
                    {/* ───── BACK ───── */}
                    <div className="deck-card__face deck-card__back" aria-hidden="true">
                      <div className="deck-back">
                        <header className="deck-back__top">
                          <span className="deck-back__kicker">Capability</span>
                        </header>
                        <div className="deck-back__body">
                          <span className="deck-back__num">{cap.number}</span>
                          <strong className="deck-back__title">{cap.title}</strong>
                          <p className="deck-back__lede">{cap.headline}</p>
                        </div>
                        <footer className="deck-back__foot">
                          <span>Open</span>
                        </footer>
                      </div>
                    </div>

                    <div
                      className="deck-card__face deck-card__front"
                      id={`deck-panel-${cap.id}`}
                    >
                      <div className="deck-card__head">
                        <strong>
                          <span className="deck-card__num">{cap.number}</span>
                          {cap.title}
                        </strong>
                        <span className="deck-card__mark" aria-hidden="true">
                          {cap.initial}
                        </span>
                      </div>

                      <div
                        ref={(el) => { contentRefs.current[i] = el; }}
                        className="deck-card__content"
                        aria-hidden="true"
                      >
                        <ul>
                          {cap.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="deck-card__foot" aria-hidden="true">
                        <strong>
                          <span className="deck-card__num">{cap.number}</span>
                          {cap.title}
                        </strong>
                        <span className="deck-card__mark">{cap.initial}</span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
