"use client";

import { useEffect, useRef, useState } from "react";
import { createRenderer } from "./flare/renderer";

export function HeroCrossField({ playing }: { playing: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playingRef = useRef(playing);
  const apiRef = useRef<ReturnType<typeof createRenderer> | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  playingRef.current = playing;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!("gpu" in navigator)) {
      setFailed(true);
      return;
    }

    const renderer = createRenderer({ canvas, playing: playingRef.current });
    apiRef.current = renderer;
    let cancelled = false;

    void renderer.ready
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((error) => {
        console.error("Hero flare failed to start", error);
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      renderer.dispose();
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    apiRef.current?.setPlaying(playing);
  }, [playing]);

  if (failed) {
    return <div className="lh-visual-fallback" />;
  }

  return (
    <div className="lh-cross-host">
      <canvas
        ref={canvasRef}
        className="lh-cross-canvas"
        aria-hidden="true"
        style={{ opacity: ready ? 1 : 0 }}
      />
      {!ready ? <div className="lh-visual-fallback" /> : null}
    </div>
  );
}

export default HeroCrossField;
