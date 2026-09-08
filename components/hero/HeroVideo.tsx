"use client";

import { useEffect, useRef, useState } from "react";

export function HeroVideo({ playing }: { playing: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [playing]);

  return (
    <div className="relative w-full max-w-[min(420px,100%)] min-w-0 mx-auto overflow-hidden md:max-w-none md:w-[118%] md:-mt-8 md:translate-x-4 md:justify-self-end">
      <video
        ref={videoRef}
        className="w-full h-auto object-contain pointer-events-none select-none [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]"
        src="/hero-latest.webm"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
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
