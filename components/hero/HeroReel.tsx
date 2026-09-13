"use client";

import { useEffect, useRef, useState } from "react";
import { HeroPlus, HeroPlusRow } from "./HeroPlus";
import { HeadingReveal } from "@/components/ui/TypeReveal";
import { usePrefersReducedMotion } from "./HeroVideo";

const TICKER = [
  "HIPAA-grade platforms shipped and live in the US",
  "SOC 2 readiness program in place",
  "Regulated health · telehealth · enterprise · industrial",
];

export function HeroReel() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayVideoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px 0px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (visible && !prefersReduced && !open) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [visible, prefersReduced, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    overlayVideoRef.current?.play().catch(() => {});
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <section
      ref={sectionRef}
      className={`lh-reel ${hovered ? "is-hover" : ""} ${visible ? "is-in" : ""}`}
      aria-label="Showreel"
    >
      <HeroPlusRow count={5} />

      <div className="lh-reel-frame">
        <div
          className="lh-reel-stage"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setOpen(true)}
        >
          <video
            ref={videoRef}
            className="lh-reel-video"
            src="/hero.mp4"
            muted
            loop
            playsInline
            preload="metadata"
          />

          <div className="lh-reel-hud">
            <h2 className="lh-reel-title">
              <span className="lh-reel-word">
                <HeadingReveal text="PLAY" />
              </span>
              <button
                type="button"
                className="lh-play"
                onClick={() => setOpen(true)}
                aria-label="Play showreel — see how we ship"
              >
                <span className="lh-play-base" />
                <svg viewBox="0 0 36 36" width="36" height="36" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M7 7.29c0-1.5 1.59-2.47 2.92-1.78l20.66 10.71c1.44.75 1.44 2.81 0 3.55L9.92 30.49C8.59 31.18 7 30.21 7 28.71V7.29Z"
                  />
                </svg>
              </button>
              <span className="lh-reel-word">
                <HeadingReveal text="REEL" />
              </span>
            </h2>
          </div>
        </div>

        <div className="lh-reel-ticker" aria-hidden="true">
          <div className="lh-reel-ticker-track">
            {[...TICKER, ...TICKER].map((item, i) => (
              <span key={`${item}-${i}`} className="lh-reel-ticker-item">
                <HeroPlus />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <HeroPlusRow count={5} />

      <p className="lh-reel-caption">
        <a href="#clock">See how we ship</a>
        <span>Typical MVP: 8 weeks. Regulated builds: 10 to 14.</span>
      </p>

      {open ? (
        <div className="lh-overlay" role="dialog" aria-modal="true" aria-label="Showreel">
          <button
            type="button"
            className="lh-overlay-close"
            onClick={() => setOpen(false)}
            aria-label="Close showreel"
          >
            Close
          </button>
          <video
            ref={overlayVideoRef}
            className="lh-overlay-video"
            src="/hero.mp4"
            controls
            autoPlay
            playsInline
          />
        </div>
      ) : null}
    </section>
  );
}

export default HeroReel;
