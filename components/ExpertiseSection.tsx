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
    id: "product",
    number: "01",
    title: "PRODUCT",
    initial: "P",
    headline: "From idea to interface",
    items: [
      "Product strategy",
      "Scope definition",
      "Technical architecture",
      "Design systems",
      "UI and UX design",
      "Prototyping",
    ],
  },
  {
    id: "engineering",
    number: "02",
    title: "ENGINEERING",
    initial: "E",
    headline: "Code that ships on Thursday",
    items: [
      "0→1 products and MVPs",
      "Multi-tenant SaaS platforms",
      "Mobile apps, iOS and Android",
      "API design and integration",
      "Data modeling and migrations",
      "Infrastructure as code",
    ],
  },
  {
    id: "applied-ai",
    number: "03",
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
    id: "platform",
    number: "04",
    title: "PLATFORM",
    initial: "Pl",
    headline: "Built to survive Series B",
    items: [
      "Compliance architecture, HIPAA-grade",
      "Security and access control",
      "Observability and monitoring",
      "Platform rescues and codebase audits",
      "App store submission",
    ],
  },
  {
    id: "partnership",
    number: "05",
    title: "PARTNERSHIP",
    initial: "Pa",
    headline: "Your team, extended",
    items: [
      "Embedded product teams",
      "Ongoing engineering retainers",
      "Team augmentation",
      "Roadmap planning",
      "Strategic advisory",
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

export function ExpertiseSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
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
    if (!node) return;
    const scrollEl: HTMLDivElement = node;

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
      let target =
        paused || mobile.matches || dealtRef.current
          ? 1
          : Math.max(
              0,
              Math.min(
                1,
                (window.innerHeight * 0.38 - rect.top) / (scrollable * 0.72)
              )
            );

      progressRef.current = damp(progressRef.current, target, 5.5, dt);
      const n = cards.length;
      const center = (n - 1) / 2;
      const staggerBudget = 0.22;
      const t = lastTimeRef.current;

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
          spread > 0.55
        );
        const showBack = man.has(i) ? (man.get(i) as boolean) : autoBack;
        setFace(i, showBack, !man.has(i) && !mobile.matches && !paused);

        if (!mobile.matches) {
          const offset = i - center;
          const pad = 48;
          const gutter = 20;
          const baseW = 252;
          const baseH = 470;
          const available = Math.max(640, window.innerWidth - pad * 2);
          const needed = n * baseW + (n - 1) * gutter;
          const scale = Math.min(1, available / needed);
          const step = (baseW + gutter) * scale;
          const restTilt = 0;
          const stackX = 0;
          const stackY = i * 2;
          const stackAngle = 0;
          const rowX = offset * step;
          const floatY = paused
            ? 0
            : Math.sin(t * 0.00155 + i * 1.12) * (6 + 6 * spread);
          const x = stackX + (rowX - stackX) * spread;
          const y = stackY + (0 - stackY) * spread + floatY;
          const angle = stackAngle + (restTilt - stackAngle) * spread;

          card.style.width = `${baseW}px`;
          card.style.height = `${baseH}px`;
          card.style.transform =
            `translate3d(calc(-50% + ${x}px), ${y}px, 0) rotate(${angle}deg) scale(${scale})`;
          card.style.zIndex = String(showBack ? i + 1 : 80 + i);
        } else {
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
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
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

  const handleDeal = () => {
    dealtRef.current = true;
    manualRef.current.clear();
    cardRefs.current[0]
      ?.querySelector<HTMLButtonElement>(".deck-card__turn")
      ?.focus({ preventScroll: true });
  };

  return (
    <section id="capabilities" aria-label="Area of expertise" className="deck-section relative z-[4]">
      <div className="deck-intro">
        <span className="deck-label">How we build</span>
        <div className="deck-intro-body">
          <h2 className="deck-heading">
            <span className="deck-heading-a">Area of</span>
            <span className="deck-heading-b">expertise</span>
          </h2>
          <div className="deck-intro-meta">
            <p>
              Multidisciplinary expertise across
              <br />
              product, engineering, applied AI,
              <br />
              platform, and partnership.
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

      <div ref={scrollRef} className="deck-scroll">
        <div className="deck-sticky">
          <div className="deck-stage" role="list" aria-label="Capabilities">
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
                      <svg className="deck-back-art" viewBox="0 0 252 470" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* ── Double card border ── */}
                        <rect x="7" y="7" width="238" height="456" rx="20" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="13" y="13" width="226" height="444" rx="16" stroke="currentColor" strokeWidth="0.75" opacity="0.55"/>

                        {/* ── Border dots ── */}
                        <circle cx="72"  cy="15"  r="2.5" fill="currentColor"/>
                        <circle cx="126" cy="15"  r="2.5" fill="currentColor"/>
                        <circle cx="180" cy="15"  r="2.5" fill="currentColor"/>
                        <circle cx="72"  cy="455" r="2.5" fill="currentColor"/>
                        <circle cx="126" cy="455" r="2.5" fill="currentColor"/>
                        <circle cx="180" cy="455" r="2.5" fill="currentColor"/>
                        <circle cx="15"  cy="155" r="2.5" fill="currentColor"/>
                        <circle cx="15"  cy="235" r="2.5" fill="currentColor"/>
                        <circle cx="15"  cy="315" r="2.5" fill="currentColor"/>
                        <circle cx="237" cy="155" r="2.5" fill="currentColor"/>
                        <circle cx="237" cy="235" r="2.5" fill="currentColor"/>
                        <circle cx="237" cy="315" r="2.5" fill="currentColor"/>

                        {/* ── Corner ornaments: ring dot + directional triangle ── */}
                        {/* TL */}
                        <circle cx="33" cy="38" r="8" stroke="currentColor" strokeWidth="1.1"/>
                        <circle cx="33" cy="38" r="3.5" fill="currentColor"/>
                        <path d="M24 52L33 70L42 52Z" fill="currentColor"/>
                        {/* TR */}
                        <circle cx="219" cy="38" r="8" stroke="currentColor" strokeWidth="1.1"/>
                        <circle cx="219" cy="38" r="3.5" fill="currentColor"/>
                        <path d="M210 52L219 70L228 52Z" fill="currentColor"/>
                        {/* BL */}
                        <path d="M24 418L33 400L42 418Z" fill="currentColor"/>
                        <circle cx="33" cy="432" r="8" stroke="currentColor" strokeWidth="1.1"/>
                        <circle cx="33" cy="432" r="3.5" fill="currentColor"/>
                        {/* BR */}
                        <path d="M210 418L219 400L228 418Z" fill="currentColor"/>
                        <circle cx="219" cy="432" r="8" stroke="currentColor" strokeWidth="1.1"/>
                        <circle cx="219" cy="432" r="3.5" fill="currentColor"/>

                        {/* ── Outer diamond ── */}
                        <path d="M126 52L215 235L126 418L37 235Z" stroke="currentColor" strokeWidth="1.5"/>
                        {/* ── Inner diamond ── */}
                        <path d="M126 86L188 235L126 384L64 235Z" stroke="currentColor" strokeWidth="1" opacity="0.8"/>

                        {/* ── Inward-pointing filled triangles at inner diamond tips ── */}
                        <path d="M112 86L126 115L140 86Z"   fill="currentColor"/>
                        <path d="M112 384L126 355L140 384Z" fill="currentColor"/>
                        <path d="M64 221L93 235L64 249Z"    fill="currentColor"/>
                        <path d="M188 221L159 235L188 249Z" fill="currentColor"/>

                        {/* ── Left quadrant: vertical pill + three dashes ── */}
                        <rect x="44" y="204" width="11" height="62" rx="5.5" stroke="currentColor" strokeWidth="1"/>
                        <line x1="37" y1="218" x2="62" y2="218" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
                        <line x1="37" y1="235" x2="62" y2="235" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
                        <line x1="37" y1="252" x2="62" y2="252" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>

                        {/* ── Right quadrant: mirror ── */}
                        <rect x="197" y="204" width="11" height="62" rx="5.5" stroke="currentColor" strokeWidth="1"/>
                        <line x1="190" y1="218" x2="215" y2="218" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
                        <line x1="190" y1="235" x2="215" y2="235" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
                        <line x1="190" y1="252" x2="215" y2="252" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>

                        {/* ── Top quadrant: radiating lines + stacked circles ── */}
                        <line x1="94"  y1="68"  x2="116" y2="150" stroke="currentColor" strokeWidth="0.8" opacity="0.45"/>
                        <line x1="126" y1="52"  x2="126" y2="150" stroke="currentColor" strokeWidth="0.8" opacity="0.35"/>
                        <line x1="158" y1="68"  x2="136" y2="150" stroke="currentColor" strokeWidth="0.8" opacity="0.45"/>
                        <circle cx="126" cy="103" r="10"  stroke="currentColor" strokeWidth="1.1"/>
                        <circle cx="126" cy="103" r="3.5" fill="currentColor"/>
                        <circle cx="106" cy="120" r="5.5" stroke="currentColor" strokeWidth="0.95"/>
                        <circle cx="146" cy="120" r="5.5" stroke="currentColor" strokeWidth="0.95"/>

                        {/* ── Bottom quadrant: mirror of top ── */}
                        <line x1="94"  y1="402" x2="116" y2="320" stroke="currentColor" strokeWidth="0.8" opacity="0.45"/>
                        <line x1="126" y1="418" x2="126" y2="320" stroke="currentColor" strokeWidth="0.8" opacity="0.35"/>
                        <line x1="158" y1="402" x2="136" y2="320" stroke="currentColor" strokeWidth="0.8" opacity="0.45"/>
                        <circle cx="126" cy="367" r="10"  stroke="currentColor" strokeWidth="1.1"/>
                        <circle cx="126" cy="367" r="3.5" fill="currentColor"/>
                        <circle cx="106" cy="350" r="5.5" stroke="currentColor" strokeWidth="0.95"/>
                        <circle cx="146" cy="350" r="5.5" stroke="currentColor" strokeWidth="0.95"/>

                        {/* ── Central scalloped badge (8-point soft star, blue fill hides diamond lines) ── */}
                        <path
                          d="M126 189L142 197L159 202L164 219L172 235L164 251L159 268L142 273L126 281L110 273L93 268L88 251L80 235L88 219L93 202L110 197Z"
                          stroke="currentColor" strokeWidth="1.4"
                          style={{ fill: "var(--deck-blue)" }}
                        />
                        {/* Inner ring for letter */}
                        <circle cx="126" cy="235" r="30" stroke="currentColor" strokeWidth="1.1" opacity="0.75"/>
                        {/* Accent dot at bottom of badge */}
                        <circle cx="126" cy="269" r="3.5" fill="currentColor" opacity="0.85"/>
                      </svg>

                      {/* Centre letter */}
                      <div className="deck-back-badge">
                        <span className="deck-badge-letter">{cap.initial}</span>
                      </div>

                      {/* Corner pips */}
                      <span className="deck-card__corner">
                        <span>{cap.number}</span>
                        <small>{cap.initial}</small>
                      </span>
                      <span className="deck-card__corner deck-card__corner--rev">
                        <span>{cap.number}</span>
                        <small>{cap.initial}</small>
                      </span>
                    </div>

                    {/* ───── FRONT ───── */}
                    <div
                      className="deck-card__face deck-card__front"
                      id={`deck-panel-${cap.id}`}
                    >
                      <div className="deck-card__head">
                        <strong>{cap.title}</strong>
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
                        <strong>{cap.title}</strong>
                        <span className="deck-card__mark">{cap.initial}</span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>

          <div className="deck-bottom">
            <span className="deck-bottom-hint">
              Scroll to deal the cards.<br />Click any card to flip it.
            </span>
            <button className="deck-deal-btn" onClick={handleDeal}>
              Deal cards
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
