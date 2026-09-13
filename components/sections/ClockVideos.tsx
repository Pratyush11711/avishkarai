"use client";

import { useEffect, useRef } from "react";
import { clsx } from "clsx";

const SOURCES = ["/1.mp4", "/2.mp4"] as const;

function restart(video: HTMLVideoElement | null) {
  if (!video) return;
  video.currentTime = 0;
  video.play().catch(() => {});
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
