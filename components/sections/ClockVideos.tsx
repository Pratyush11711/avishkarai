"use client";

import { useEffect, useRef } from "react";
import { clsx } from "clsx";

const SOURCES = ["/1.mp4", "/2.mp4"] as const;

function restart(video: HTMLVideoElement | null) {
  if (!video) return;
  video.currentTime = 0;
  video.play().catch(() => {});
}

/** Temporary looped preview in the clock slot. Swap back to ScrollScrubSequence when done. */
export function ClockLoopVideo({
  src = "/clock.mp4",
  reducedMotion = false,
}: {
  src?: string;
  reducedMotion?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion) {
      video.pause();
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.15 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reducedMotion]);

  return (
    <div className="clock-videos-wrap clock-sequence" aria-hidden="true">
      <video
        ref={videoRef}
        className="clock-loop-video"
        src={src}
        muted
        loop
        playsInline
        autoPlay={!reducedMotion}
        preload="auto"
      />
    </div>
  );
}

export function ClockVideos({
  playing,
  active,
}: {
  playing: boolean;
  active: 0 | 1;
}) {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    refs.current.forEach((video, i) => {
      if (!video) return;
      if (!playing) {
        video.pause();
        return;
      }
      if (i === active) {
        video.play().catch(() => {});
      }
    });
  }, [playing, active]);

  return (
    <div className="clock-videos-wrap" aria-hidden="true">
      <div className="clock-videos">
        {SOURCES.map((src, i) => (
          <video
            key={src}
            ref={(node) => {
              refs.current[i] = node;
            }}
            className={clsx("clock-video-el", active === i && "is-active")}
            src={src}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onEnded={(event) => {
              if (!playing || active !== i) return;
              restart(event.currentTarget);
            }}
          />
        ))}
      </div>
    </div>
  );
}
