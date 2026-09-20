"use client";

import { useEffect, useState } from "react";
import { Counter } from "@/components/react-bits/Counter";
import { listedWorkStudies } from "@/lib/work-studies";

const MIN_HOLD_AT_100_MS = 320;
const MAX_WAIT_MS = 45000;
const QUIET_MS = 500;

const SITE_VIDEOS = [
  "/hero-sec-video.mp4",
  "/stand1.mp4",
  "/stand2.mp4",
  "/stand3.mp4",
  "/different-clock/cosmos_1417341526.mp4",
] as const;

const SITE_IMAGES = [
  "/logo-dark.webp",
  "/logo-white-nav.webp",
  "/different-clock/cosmos_874806332.jpeg",
  "/different-clock/cosmos_1628760389.jpeg",
  "/different-clock/cosmos_266495524.jpeg",
  "/different-clock/cosmos_991516363.gif",
  "/different-clock/cosmos_1952560373.jpeg",
  ...listedWorkStudies.map((study) =>
    "cardImage" in study && study.cardImage ? study.cardImage : study.image
  ),
];

const SITE_ASSETS = [...SITE_VIDEOS, ...SITE_IMAGES];

const ESTIMATED_BYTES: Record<string, number> = {
  "/hero-sec-video.mp4": 19_000_000,
  "/stand1.mp4": 750_000,
  "/stand2.mp4": 12_600_000,
  "/stand3.mp4": 6_200_000,
  "/different-clock/cosmos_1417341526.mp4": 1_800_000,
};

function estimateTotal(src: string) {
  try {
    const path = new URL(src, "https://local.invalid").pathname;
    return ESTIMATED_BYTES[path] ?? (path.match(/\.(mp4|webm)$/i) ? 4_000_000 : 350_000);
  } catch {
    return 350_000;
  }
}

function toAbs(src: string) {
  try {
    return new URL(src, window.location.origin).href;
  } catch {
    return src;
  }
}

function entrySize(entry: PerformanceResourceTiming) {
  return entry.transferSize || entry.encodedBodySize || entry.decodedBodySize || 0;
}

function mediaSource(node: HTMLImageElement | HTMLVideoElement) {
  if (node instanceof HTMLImageElement) {
    return node.currentSrc || node.getAttribute("src") || "";
  }
  return (
    node.currentSrc ||
    node.getAttribute("src") ||
    node.querySelector("source")?.getAttribute("src") ||
    ""
  );
}

function isImageReady(img: HTMLImageElement) {
  if (!mediaSource(img)) return true;
  return img.complete && (img.naturalWidth > 0 || Boolean(img.currentSrc || img.src));
}

function isVideoReady(video: HTMLVideoElement) {
  if (!mediaSource(video)) return true;
  return video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA;
}

function videoFraction(video: HTMLVideoElement) {
  if (isVideoReady(video)) return 1;
  if (video.buffered.length && video.duration && Number.isFinite(video.duration)) {
    return Math.min(1, video.buffered.end(video.buffered.length - 1) / video.duration);
  }
  return Math.min(1, video.readyState / HTMLMediaElement.HAVE_ENOUGH_DATA);
}

function waitForImage(img: HTMLImageElement) {
  if (img.loading === "lazy") img.loading = "eager";
  if (isImageReady(img)) {
    return img.decode?.().catch(() => undefined) ?? Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    const done = () => resolve();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  }).then(() => img.decode?.().catch(() => undefined));
}

function waitForVideo(video: HTMLVideoElement) {
  video.preload = "auto";
  video.muted = true;
  if (video.readyState === HTMLMediaElement.HAVE_NOTHING && mediaSource(video)) {
    video.load();
  }
  if (isVideoReady(video)) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const done = () => resolve();
    video.addEventListener("canplaythrough", done, { once: true });
    video.addEventListener("error", done, { once: true });
  });
}

function waitForDocumentMedia(signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const inFlight = new WeakSet<Element>();
    const pending = new Set<Promise<void>>();
    let quietTimer = 0;
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(quietTimer);
      observer.disconnect();
      resolve();
    };

    const bumpQuiet = () => {
      if (settled || signal.aborted) return;
      window.clearTimeout(quietTimer);
      if (pending.size > 0) return;
      const unreadied = [
        ...document.querySelectorAll<HTMLImageElement | HTMLVideoElement>("img, video"),
      ].filter((node) => {
        if (!mediaSource(node)) return false;
        return node instanceof HTMLVideoElement ? !isVideoReady(node) : !isImageReady(node);
      });
      if (unreadied.length) {
        unreadied.forEach(track);
        return;
      }
      quietTimer = window.setTimeout(finish, QUIET_MS);
    };

    const track = (node: Element) => {
      if (settled || inFlight.has(node)) return;
      let task: Promise<void> | null = null;
      if (node instanceof HTMLImageElement) {
        if (!mediaSource(node) || isImageReady(node)) return;
        task = waitForImage(node);
      } else if (node instanceof HTMLVideoElement) {
        if (!mediaSource(node) || isVideoReady(node)) return;
        task = waitForVideo(node);
      }
      if (!task) return;
      inFlight.add(node);
      pending.add(task);
      window.clearTimeout(quietTimer);
      task.finally(() => {
        pending.delete(task!);
        bumpQuiet();
      });
    };

    const scan = (root: ParentNode = document) => {
      root.querySelectorAll("img, video").forEach(track);
    };

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          track(node);
          scan(node);
        });
        if (record.type === "attributes" && record.target instanceof Element) {
          track(record.target);
        }
      }
    });

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["src", "srcset"],
    });

    scan();
    bumpQuiet();

    if (signal.aborted) {
      finish();
      return;
    }
    signal.addEventListener("abort", finish, { once: true });
  });
}

async function fetchWithProgress(
  src: string,
  onProgress: (loaded: number, total: number) => void
) {
  const fallback = estimateTotal(src);
  try {
    const response = await fetch(src, { cache: "force-cache" });
    const headerTotal = Number(response.headers.get("content-length")) || 0;
    if (!response.ok || !response.body) {
      onProgress(fallback, fallback);
      return;
    }

    const reader = response.body.getReader();
    let loaded = 0;
    const total = headerTotal || fallback;
    onProgress(0, total);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      loaded += value.byteLength;
      onProgress(Math.min(loaded, total), total);
    }

    onProgress(total, total);
  } catch {
    onProgress(fallback, fallback);
  }
}

function clampPercent(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function SitePreloader() {
  const [hiding, setHiding] = useState(false);
  const [gone, setGone] = useState(false);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let finished = false;
    let maxTimer = 0;
    let holdTimer = 0;
    let pollTimer = 0;
    let highest = 0;

    const bytes = new Map<string, { loaded: number; total: number }>();

    const setBytes = (id: string, loaded: number, total: number, announce = true) => {
      const safeTotal = Math.max(total, 1);
      const prev = bytes.get(id);
      const nextTotal = loaded >= safeTotal ? safeTotal : Math.max(safeTotal, prev?.total ?? 0);
      bytes.set(id, {
        loaded: Math.min(Math.max(loaded, prev?.loaded ?? 0), nextTotal),
        total: nextTotal,
      });
      if (announce) publish();
    };

    const collectLiveMedia = () => {
      document.querySelectorAll<HTMLImageElement | HTMLVideoElement>("img, video").forEach((node) => {
        const src = mediaSource(node);
        if (!src) return;
        const id = toAbs(src);
        const total = estimateTotal(src);
        if (node instanceof HTMLVideoElement) {
          setBytes(id, videoFraction(node) * total, total, false);
          return;
        }
        if (isImageReady(node)) setBytes(id, total, total, false);
      });

      for (const entry of performance.getEntriesByType("resource") as PerformanceResourceTiming[]) {
        if (entry.responseEnd <= 0) continue;
        const size = entrySize(entry) || estimateTotal(entry.name);
        setBytes(entry.name, size, size, false);
      }
      publish();
    };

    const publish = () => {
      if (finished) return;
      let loaded = 0;
      let total = 0;
      for (const item of bytes.values()) {
        loaded += item.loaded;
        total += item.total;
      }
      if (total <= 0) return;
      const next = Math.min(99, Math.floor((loaded / total) * 100));
      highest = Math.max(highest, next);
      setPercent(clampPercent(highest));
    };

    const dismiss = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(maxTimer);
      window.clearTimeout(holdTimer);
      window.clearInterval(pollTimer);
      observer.disconnect();
      setPercent(100);
      setHiding(true);
    };

    const finishAtHundred = () => {
      highest = 100;
      setPercent(100);
      holdTimer = window.setTimeout(dismiss, MIN_HOLD_AT_100_MS);
    };

    for (const src of SITE_ASSETS) {
      setBytes(toAbs(src), 0, estimateTotal(src));
    }
    collectLiveMedia();

    const observer = new PerformanceObserver(() => collectLiveMedia());
    observer.observe({ type: "resource", buffered: true });
    pollTimer = window.setInterval(collectLiveMedia, 200);

    Promise.all([
      ...SITE_ASSETS.map((src) =>
        fetchWithProgress(src, (loaded, total) => setBytes(toAbs(src), loaded, total))
      ),
      waitForDocumentMedia(controller.signal),
      document.fonts?.ready ?? Promise.resolve(),
    ])
      .then(() => {
        collectLiveMedia();
        finishAtHundred();
      })
      .catch(finishAtHundred);

    maxTimer = window.setTimeout(dismiss, MAX_WAIT_MS);

    return () => {
      finished = true;
      window.clearTimeout(maxTimer);
      window.clearTimeout(holdTimer);
      window.clearInterval(pollTimer);
      observer.disconnect();
      controller.abort();
    };
  }, []);

  const shown = clampPercent(percent);

  if (gone) return null;

  return (
    <div
      className={hiding ? "site-preloader is-hiding" : "site-preloader"}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={shown}
      aria-label="Loading site"
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && hiding) setGone(true);
      }}
    >
      <span
        className="loader"
        style={{ ["--progress" as string]: `${shown}%` }}
      />
      <div className="loader-count" aria-hidden="true">
        <Counter
          value={shown}
          places={[100, 10, 1]}
          fontSize={132}
          padding={0}
          gap={2}
          borderRadius={0}
          horizontalPadding={0}
          textColor="#fff"
          fontWeight={400}
          gradientHeight={28}
          gradientFrom="#000"
          gradientTo="transparent"
        />
      </div>
    </div>
  );
}
