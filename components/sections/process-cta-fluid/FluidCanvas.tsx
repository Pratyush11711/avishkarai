"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createRenderer } from "./renderer";

export function FluidCanvas({
  hostRef,
  playing,
}: {
  hostRef: RefObject<HTMLElement | null>;
  playing: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playingRef = useRef(playing);
  const apiRef = useRef<ReturnType<typeof createRenderer> | null>(null);
  const [ready, setReady] = useState(false);

  playingRef.current = playing;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current ?? canvas?.parentElement;
    if (!canvas || !host) return;
    if (!("gpu" in navigator)) return;

    let cancelled = false;
    let renderer: ReturnType<typeof createRenderer> | null = null;

    try {
      renderer = createRenderer({
        canvas,
        host,
        playing: playingRef.current,
      });
    } catch (error) {
      console.error("Process CTA fluid failed to start", error);
      return;
    }

    apiRef.current = renderer;

    void renderer.ready
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((error) => {
        console.error("Process CTA fluid failed to start", error);
      });

    return () => {
      cancelled = true;
      renderer?.dispose();
      apiRef.current = null;
    };
  }, [hostRef]);

  useEffect(() => {
    apiRef.current?.setPlaying(playing);
  }, [playing]);

  return (
    <canvas
      ref={canvasRef}
      className={`pcta-fluid${ready ? " is-ready" : ""}`}
      aria-hidden="true"
    />
  );
}

export default FluidCanvas;
