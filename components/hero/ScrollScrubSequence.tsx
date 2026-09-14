"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
} from "react";

export type ScrollScrubSequenceHandle = {
  /** Drive the sequence from an external 0–1 progress (e.g. ScrollTrigger). */
  setProgress: (progress: number) => void;
};

export type ScrollScrubSequenceProps = {
  /** Public folder that holds the frames, e.g. `/combined`. */
  framePath: string;
  /** Total number of frames in the sequence. */
  frameCount: number;
  /**
   * Filename template. `X` runs are replaced with a zero-padded index.
   * `"frame-XXXX.jpg"` → `frame-0001.jpg`.
   */
  frameNamePattern?: string;
  /** Static poster shown until preload finishes, and as a no-JS fallback. */
  posterSrc?: string;
  /** First frame number in the folder. Default: 1. */
  startIndex?: number;
  className?: string;
  style?: CSSProperties;
  /** How the frame is letterboxed into the canvas. Default: cover. */
  fit?: "cover" | "contain";
  /** Query string used to bust cached frames after a replace. */
  version?: string;
};

const MAX_DPR = 2;
const PRELOAD_CONCURRENCY = 8;

type CacheEntry = {
  frames: (HTMLImageElement | null)[];
  first: Promise<HTMLImageElement | null>;
  ready: Promise<void>;
};

const preloadCache = new Map<string, CacheEntry>();

export function frameFileName(pattern: string, index: number): string {
  const pad = pattern.match(/X+/)?.[0].length ?? 4;
  return pattern.replace(/X+/, String(index).padStart(pad, "0"));
}

export function frameSrc(
  framePath: string,
  pattern: string,
  index: number,
  version?: string
): string {
  const base = framePath.replace(/\/$/, "");
  const url = `${base}/${frameFileName(pattern, index)}`;
  return version ? `${url}?v=${encodeURIComponent(version)}` : url;
}

function cacheKey(
  path: string,
  count: number,
  pattern: string,
  start: number,
  version?: string
) {
  return `${path}|${count}|${pattern}|${start}|${version ?? ""}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function preloadSequence(
  framePath: string,
  frameCount: number,
  pattern: string,
  startIndex: number,
  version?: string
): CacheEntry {
  const key = cacheKey(framePath, frameCount, pattern, startIndex, version);
  const existing = preloadCache.get(key);
  if (existing?.frames.some(Boolean)) return existing;
  if (existing) preloadCache.delete(key);

  const frames: (HTMLImageElement | null)[] = new Array(frameCount).fill(null);

  const first = loadImage(frameSrc(framePath, pattern, startIndex, version))
    .then((img) => {
      frames[0] = img;
      return img;
    })
    .catch(() => null);

  const ready = first.then(async () => {
    let next = 1;
    async function worker() {
      while (next < frameCount) {
        const i = next++;
        try {
          frames[i] = await loadImage(
            frameSrc(framePath, pattern, startIndex + i, version)
          );
        } catch {
          frames[i] = null;
        }
      }
    }
    const workers = Array.from(
      { length: Math.min(PRELOAD_CONCURRENCY, Math.max(frameCount - 1, 1)) },
      () => worker()
    );
    await Promise.all(workers);
  });

  const entry: CacheEntry = { frames, first, ready };
  preloadCache.set(key, entry);
  return entry;
}

function nearestFrame(
  frames: (HTMLImageElement | null)[],
  index: number
): HTMLImageElement | null {
  if (frames[index]) return frames[index];
  for (let d = 1; d < frames.length; d++) {
    const lo = index - d;
    const hi = index + d;
    if (lo >= 0 && frames[lo]) return frames[lo];
    if (hi < frames.length && frames[hi]) return frames[hi];
  }
  return null;
}

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function resizeCanvas(canvas: HTMLCanvasElement, dpr: number) {
  const parent = canvas.parentElement;
  const cssW = parent?.clientWidth ?? window.innerWidth;
  const cssH = parent?.clientHeight ?? window.innerHeight;
  const w = Math.max(1, Math.round(cssW * dpr));
  const h = Math.max(1, Math.round(cssH * dpr));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  return { w, h };
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  fit: "cover" | "contain"
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;

  const scale =
    fit === "contain" ? Math.min(w / iw, h / ih) : Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (w - dw) * 0.5;
  const dy = (h - dh) * 0.5;

  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, dx, dy, dw, dh);
}

export const ScrollScrubSequence = forwardRef<
  ScrollScrubSequenceHandle,
  ScrollScrubSequenceProps
>(function ScrollScrubSequence(
  {
    framePath,
    frameCount,
    frameNamePattern = "frame-XXXX.jpg",
    posterSrc,
    startIndex = 1,
    className,
    style,
    fit = "cover",
    version,
  },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const fitRef = useRef(fit);
  fitRef.current = fit;

  const progressRef = useRef(0);
  const drawRef = useRef<(force?: boolean) => void>(() => {});

  const resolvedPoster =
    posterSrc ?? frameSrc(framePath, frameNamePattern, startIndex, version);

  useImperativeHandle(
    ref,
    () => ({
      setProgress: (progress: number) => {
        progressRef.current = clamp01(progress);
        drawRef.current();
      },
    }),
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frameCount < 1) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cache = preloadSequence(
      framePath,
      frameCount,
      frameNamePattern,
      startIndex,
      version
    );

    let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    let lastIndex = -1;
    let cancelled = false;
    let rafId = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    const indexFromProgress = () =>
      Math.min(
        frameCount - 1,
        Math.max(0, Math.floor(progressRef.current * (frameCount - 1)))
      );

    const paint = (img: HTMLImageElement) => {
      const { w, h } = resizeCanvas(canvas, dpr);
      if (w < 8 || h < 8) return false;
      drawCover(ctx, img, w, h, fitRef.current);
      canvas.style.opacity = "1";
      const poster = posterRef.current;
      if (poster) poster.style.opacity = "0";
      return true;
    };

    const draw = (force = false) => {
      if (cancelled) return;
      const index = reduced ? 0 : indexFromProgress();
      if (!force && index === lastIndex) return;
      const img = nearestFrame(cache.frames, index);
      if (img && paint(img)) lastIndex = index;
    };

    drawRef.current = (force = false) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        draw(force);
      });
    };

    cache.first.then((img) => {
      if (cancelled || !img) return;
      paint(img);
    });

    cache.ready.then(() => {
      if (cancelled) return;
      lastIndex = -1;
      draw(true);
    });

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
        lastIndex = -1;
        draw(true);
      }, 80);
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(canvas.parentElement ?? canvas);
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      drawRef.current = () => {};
    };
  }, [framePath, frameCount, frameNamePattern, startIndex, version]);

  return (
    <div
      className={className}
      style={{ pointerEvents: "none", ...style }}
      aria-hidden
    >
      <img
        ref={posterRef}
        className="scrub-sequence-poster"
        src={resolvedPoster}
        alt=""
        decoding="async"
      />
      <canvas ref={canvasRef} className="scrub-sequence-canvas" />
    </div>
  );
});
