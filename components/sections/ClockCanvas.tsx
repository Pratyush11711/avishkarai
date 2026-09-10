"use client";

import { useEffect, useRef } from "react";

interface ClockCanvasProps {
  playing: boolean;
}

type SceneWindow = Window & {
  __setClockPointer?: (x: number, y: number) => void;
};

function sceneWindow(iframe: HTMLIFrameElement | null) {
  try {
    return (iframe?.contentWindow ?? null) as SceneWindow | null;
  } catch {
    return null;
  }
}

function sendPointer(iframe: HTMLIFrameElement | null, x: number, y: number) {
  const win = sceneWindow(iframe);
  if (!win) return;
  try {
    win.__setClockPointer?.(x, y);
  } catch {
    // iframe script may not be ready yet
  }
  try {
    win.postMessage({ type: "pointer", x, y }, "*");
  } catch {
    // ignore
  }
}

export function ClockCanvas({ playing }: ClockCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    try {
      sceneWindow(iframeRef.current)?.postMessage(
        { type: "motionchange", paused: !playing },
        "*"
      );
    } catch {
      // iframe not ready
    }
  }, [playing]);

  useEffect(() => {
    const iframe = iframeRef.current;
    const section =
      wrapRef.current?.closest("section") ?? document.getElementById("clock");
    if (!iframe || !section) return;

    let inside = false;

    const onMove = (event: PointerEvent) => {
      const r = section.getBoundingClientRect();
      const next =
        event.clientX >= r.left &&
        event.clientX <= r.right &&
        event.clientY >= r.top &&
        event.clientY <= r.bottom;

      if (!next) {
        if (inside) sendPointer(iframe, 0, 0);
        inside = false;
        return;
      }

      inside = true;
      sendPointer(
        iframe,
        ((event.clientX - r.left) / Math.max(r.width, 1)) * 2 - 1,
        1 - (event.clientY - r.top) / Math.max(r.height, 1) * 2
      );
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={wrapRef} className="clock-canvas-wrap" aria-hidden="true">
      <iframe
        ref={iframeRef}
        src="/avishkar-ai-cursor/dist/embed.html?clock"
        title=""
        aria-hidden="true"
        tabIndex={-1}
        className="clock-canvas-frame"
        allow="accelerometer; autoplay"
        loading="eager"
      />
    </div>
  );
}
