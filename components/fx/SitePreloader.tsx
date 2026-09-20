"use client";

import { useEffect, useState } from "react";
import { listedWorkStudies } from "@/lib/work-studies";

const MIN_VISIBLE_MS = 1100;
const MAX_WAIT_MS = 45000;
const QUIET_MS = 1000;

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

function cacheFile(src: string) {
  return fetch(src, { cache: "force-cache" })
    .then((res) => (res.ok ? res.blob() : undefined))
    .catch(() => undefined);
}

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    const done = () => resolve();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
    img.src = src;
    if (img.complete) resolve();
  });
}

function mediaSource(node: HTMLImageElement | HTMLVideoElement) {
  if (node instanceof HTMLImageElement) {
    return node.currentSrc || node.getAttribute("src") || node.getAttribute("srcset");
  }
  return (
    node.currentSrc ||
    node.getAttribute("src") ||
    node.querySelector("source")?.getAttribute("src")
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
        if (
          record.type === "attributes" &&
          record.target instanceof Element
        ) {
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

    const onAbort = () => finish();
    if (signal.aborted) {
      finish();
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function waitForSiteMedia(signal: AbortSignal) {
  return Promise.all([
    ...SITE_VIDEOS.map((src) => cacheFile(src)),
    ...SITE_IMAGES.map((src) => preloadImage(src)),
    waitForDocumentMedia(signal),
  ]);
}

export function SitePreloader() {
  const [hiding, setHiding] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const started = performance.now();
    const controller = new AbortController();
    let finished = false;
    let minTimer = 0;
    let maxTimer = 0;

    const dismiss = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      controller.abort();
      setHiding(true);
    };

    const reveal = () => {
      const remaining = Math.max(0, MIN_VISIBLE_MS - (performance.now() - started));
      minTimer = window.setTimeout(dismiss, remaining);
    };

    waitForSiteMedia(controller.signal).then(reveal).catch(reveal);
    maxTimer = window.setTimeout(dismiss, MAX_WAIT_MS);

    return () => {
      finished = true;
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      controller.abort();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={hiding ? "site-preloader is-hiding" : "site-preloader"}
      role="status"
      aria-live="polite"
      aria-busy={!hiding}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && hiding) setGone(true);
      }}
    >
      <span className="sr-only">Loading</span>
      {/* From Uiverse.io by Nawsome */}
      <svg className="pl" width="240" height="240" viewBox="0 0 240 240" aria-hidden="true">
        <circle
          className="pl__ring pl__ring--a"
          cx="120"
          cy="120"
          r="105"
          fill="none"
          strokeWidth="20"
          strokeDasharray="0 660"
          strokeDashoffset="-330"
          strokeLinecap="round"
        />
        <circle
          className="pl__ring pl__ring--b"
          cx="120"
          cy="120"
          r="35"
          fill="none"
          strokeWidth="20"
          strokeDasharray="0 220"
          strokeDashoffset="-110"
          strokeLinecap="round"
        />
        <circle
          className="pl__ring pl__ring--c"
          cx="85"
          cy="120"
          r="70"
          fill="none"
          strokeWidth="20"
          strokeDasharray="0 440"
          strokeLinecap="round"
        />
        <circle
          className="pl__ring pl__ring--d"
          cx="155"
          cy="120"
          r="70"
          fill="none"
          strokeWidth="20"
          strokeDasharray="0 440"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
