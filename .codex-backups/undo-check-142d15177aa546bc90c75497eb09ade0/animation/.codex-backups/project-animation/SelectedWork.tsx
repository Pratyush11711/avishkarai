"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { HeadingReveal, LineReveal, TitleReveal } from "@/components/ui/TypeReveal";

const RippleDistortion = dynamic(() => import("@/components/ui/RippleDistortion"), {
  ssr: false,
});

interface WorkItem {
  index: number;
  title: string;
  sector: string;
  image: string;
  href: string;
}

const CASE_STUDIES: WorkItem[] = [
  {
    index: 1,
    title: "Frontier Biomed",
    sector: "Telehealth",
    image: "/work/work-frontier-biomed.png",
    href: "/projects/frontier-biomed",
  },
  {
    index: 2,
    title: "Frontier Wellness",
    sector: "Mental Health",
    image: "/work/work-frontier-wellness.png",
    href: "/projects/frontier-wellness",
  },
  {
    index: 3,
    title: "Guiding Hands",
    sector: "Care Navigation",
    image: "/work/work-guiding-hands.png",
    href: "/projects/guiding-hands",
  },
  {
    index: 4,
    title: "Medivance",
    sector: "Clinical Ops",
    image: "/work/work-medivance.png",
    href: "/projects/medivance",
  },
  {
    index: 5,
    title: "House of Life Sciences",
    sector: "Research",
    image: "/work/work-house-of-life-sciences.png",
    href: "/projects/house-of-life-sciences",
  },
];

function WorkCardMedia({
  image,
  title,
  ripple,
}: {
  image: string;
  title: string;
  ripple: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ripple) return;
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "120px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [ripple]);

  return (
    <span ref={ref} className="work-card-media" style={{ position: "relative" }}>
      <Image
        src={image}
        alt={`${title} preview`}
        width={1600}
        height={1067}
        sizes="(max-width: 900px) 100vw, 50vw"
        className="work-card-img"
      />
      {ripple && inView && (
        <RippleDistortion
          imageSrc={image}
          frequency={18}
          amplitude={0.032}
          speed={2.6}
          antialias
        />
      )}
    </span>
  );
}

function useRippleEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(hover.matches && !motion.matches);
    sync();
    hover.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => {
      hover.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);

  return enabled;
}

export function SelectedWork() {
  const ripple = useRippleEnabled();

  return (
    <section
      id="work"
      className="work-section section-pad !pb-16 relative"
      aria-label="Selected work"
    >
      <div className="page-wrap">
        <div className="work-head">
          <h2 className="work-title">
            <span className="work-title-line">
              <HeadingReveal text="We'd rather show you" />
            </span>
            <span className="work-title-line">
              <HeadingReveal text="than tell you." />
            </span>
          </h2>
          <LineReveal text={`${CASE_STUDIES.length} projects`} className="work-note" />
        </div>
      </div>

      <div className="work-grid">
        {CASE_STUDIES.map((item) => (
          <a key={item.index} href={item.href} className="work-card">
            <WorkCardMedia
              image={item.image}
              title={item.title}
              ripple={ripple}
            />
            <span className="work-card-copy">
              <LineReveal text={item.sector} className="work-card-sector" />
              <span className="work-card-title">
                <span className="work-card-title-arrow" aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2.3 8h11.4m0 0L8.7 3M13.7 8 8.7 13"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <TitleReveal text={item.title} />
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
