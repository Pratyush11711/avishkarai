"use client";

import { useEffect, useRef, useState } from "react";

export function HeroVideo({ playing }: { playing: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const sync = () => {
      if (playing) video.play().catch(() => {});
      else video.pause();
    };

    sync();
    video.addEventListener("canplay", sync);
    video.addEventListener("canplaythrough", sync);
    return () => {
      video.removeEventListener("canplay", sync);
      video.removeEventListener("canplaythrough", sync);
    };
  }, [playing]);

  return (
    <div className="hero-video-bg" aria-hidden="true">
      <video
        ref={videoRef}
        className="hero-video-el"
        src="/hero-sec-video.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
    </div>
  );
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
