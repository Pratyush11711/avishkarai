"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { listedWorkStudies } from "@/lib/work-studies";
import { HeadingReveal, LineReveal, TitleReveal } from "@/components/ui/TypeReveal";

const RippleDistortion = dynamic(() => import("@/components/ui/RippleDistortion"), {
  ssr: false,
});

function WorkCardMedia({
  image,
  title,
  ripple,
}: {
  image: string;
  title: string;
  ripple: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
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
    <div ref={ref} className="work-card-media">
      <Image
        src={image}
        alt={`${title} preview`}
        fill
        sizes="(max-width: 900px) 100vw, 50vw"
        quality={95}
        className="work-card-img"
      />
      {ripple && inView && (
        <RippleDistortion
          imageSrc={image}
          frequency={18}
          amplitude={0.032}
          speed={2.6}
          antialias
          className="work-card-ripple"
        />
      )}
    </div>
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
          <LineReveal text={`${listedWorkStudies.length} projects`} className="work-note" />
        </div>
      </div>

      <div className="work-grid">
        {listedWorkStudies.map((item) => (
          <a key={item.slug} href={`/work/${item.slug}`} className="work-card" data-slug={item.slug}>
            <WorkCardMedia
              image={"cardImage" in item && item.cardImage ? item.cardImage : item.image}
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
