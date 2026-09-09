"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion } from "framer-motion";
import { clsx } from "clsx";
// ─── Data ─────────────────────────────────────────────────────────────────────

type WorkStatus = "live" | "in-progress" | "shipped" | "nda";

interface WorkItem {
  index: number;
  title: string;
  category: string;
  location: string;
  status: WorkStatus;
  description: string;
  tags: string[];
  image: string;
  href: string;
}

const CASE_STUDIES: WorkItem[] = [
  {
    index: 1,
    title: "Frontier Biomed",
    category: "Telehealth & Compliant Commerce",
    location: "United States",
    status: "live",
    description:
      "A multi-tenant platform serving multiple clinics: patient-facing storefront, clinician workflows, an admin layer, an affiliate system, a documented API surface, and wearable-device integration architecture with a clinician in the loop. Built to handle protected health information correctly from the first commit, with a brand and interface that reads like a consumer health product, because that is what its users expect.",
    tags: [
      "Strategy",
      "Architecture",
      "HIPAA-grade infrastructure",
      "Product design",
      "Full-stack build",
      "API",
    ],
    image: "/work/work-frontier-biomed.png",
    href: "#",
  },
  {
    index: 2,
    title: "Frontier Wellness",
    category: "Mental Health",
    location: "Canada",
    status: "in-progress",
    description:
      "[One paragraph, under 60 words. Lead with the hard part: the integration, the compliance surface, the volume. Then the outcome.]",
    tags: ["Strategy", "Product design", "Full-stack build"],
    image: "/work/work-frontier-wellness.png",
    href: "#",
  },
  {
    index: 3,
    title: "Guiding Hands",
    category: "Care Navigation",
    location: "United States",
    status: "in-progress",
    description:
      "[One paragraph, under 60 words. Lead with the hard part: the integration, the compliance surface, the volume. Then the outcome.]",
    tags: ["Architecture", "Full-stack build", "API"],
    image: "/work/work-guiding-hands.png",
    href: "#",
  },
  {
    index: 4,
    title: "Medivance",
    category: "Clinical Ops",
    location: "United Kingdom",
    status: "in-progress",
    description:
      "[One paragraph, under 60 words. Lead with the hard part: the integration, the compliance surface, the volume. Then the outcome.]",
    tags: ["Strategy", "Architecture", "Product design"],
    image: "/work/work-medivance.png",
    href: "#",
  },
  {
    index: 5,
    title: "House of Life Sciences",
    category: "Research",
    location: "India",
    status: "in-progress",
    description:
      "[One paragraph, under 60 words. Lead with the hard part: the integration, the compliance surface, the volume. Then the outcome.]",
    tags: ["Full-stack build", "API", "Strategy"],
    image: "/work/work-house-of-life-sciences.png",
    href: "#",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status }: { status: WorkStatus }) {
  if (status === "live") {
    return (
      <span className="csc-pill-live">
        <span className="csc-live-dot">
          <span className="csc-live-ping" />
          <span className="csc-live-core" />
        </span>
        Live in production
      </span>
    );
  }
  if (status === "shipped") {
    return (
      <span className="csc-pill-shipped">
        <span className="csc-dot" style={{ background: "#60a5fa" }} />
        Shipped
      </span>
    );
  }
  if (status === "nda") {
    return (
      <span className="csc-pill-nda">
        <span className="csc-dot" style={{ background: "#f472b6" }} />
        Under NDA
      </span>
    );
  }
  return (
    <span className="csc-pill-progress">
      <span className="csc-dot" style={{ background: "#fbbf24" }} />
      In progress
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const LERP = 0.16;
const MAX_TILT = 14;

export function SelectedWork() {
  const [active, setActive] = useState<number | null>(null);
  const [interactive, setInteractive] = useState(false);
  // Defaults to the hover layout so desktop doesn't flash the inline
  // thumbnails for a frame before pointer detection runs after hydration.
  const [staticMode, setStaticMode] = useState(false);
  // The section sits inside a `.curtain` wrapper, and `overflow: clip` does
  // clip fixed-position descendants — so the follower has to be portalled out
  // to its own host on the body rather than living in the section.
  const [portalHost, setPortalHost] = useState<HTMLDivElement | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<number | null>(null);
  const rafRef = useRef(0);
  // Kept in a ref so the follower runs off rAF without re-rendering per frame.
  const pointer = useRef({ tx: 0, ty: 0, x: 0, y: 0, rot: 0, scale: 0.82 });

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      const canFollow = hoverQuery.matches && !motionQuery.matches;
      setInteractive(canFollow);
      setStaticMode(!canFollow);
    };

    sync();
    hoverQuery.addEventListener("change", sync);
    motionQuery.addEventListener("change", sync);
    return () => {
      hoverQuery.removeEventListener("change", sync);
      motionQuery.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!interactive) return;
    const host = document.createElement("div");
    document.body.appendChild(host);
    setPortalHost(host);
    return () => {
      setPortalHost(null);
      host.remove();
    };
  }, [interactive]);

  useEffect(() => {
    if (!interactive) return;

    const tick = () => {
      const p = pointer.current;
      p.x += (p.tx - p.x) * LERP;
      p.y += (p.ty - p.y) * LERP;

      // Tilt tracks how far the preview is lagging behind the cursor, so the
      // card leans into the direction of travel and settles back when still.
      const lag = (p.tx - p.x) * 0.16;
      const targetRot = Math.max(-MAX_TILT, Math.min(MAX_TILT, lag));
      p.rot += (targetRot - p.rot) * 0.12;
      p.scale += ((activeRef.current === null ? 0.82 : 1) - p.scale) * 0.14;

      const el = previewRef.current;
      if (el) {
        el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) rotate(${p.rot}deg) scale(${p.scale})`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [interactive]);

  const handleMove = useCallback((e: React.MouseEvent) => {
    pointer.current.tx = e.clientX;
    pointer.current.ty = e.clientY;
  }, []);

  const handleEnterRow = useCallback((i: number, e: React.MouseEvent) => {
    const p = pointer.current;
    // First row entered: drop the card where the cursor already is instead of
    // letting it sail in from the last known position.
    if (activeRef.current === null) {
      p.x = e.clientX;
      p.y = e.clientY;
    }
    p.tx = e.clientX;
    p.ty = e.clientY;
    activeRef.current = i;
    setActive(i);
  }, []);

  const handleLeaveList = useCallback(() => {
    activeRef.current = null;
    setActive(null);
  }, []);

  return (
    <section
      id="work"
      className="work-section section-pad !pb-10 relative overflow-x-clip"
      aria-label="Selected work"
    >
      <div className="page-wrap relative z-[1]">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4 pt-6 md:pt-10">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="type-heading text-carbon-black max-w-[20ch]"
          >
            We&apos;d rather show you than tell you.
          </motion.h2>

          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="type-caption text-smoke shrink-0"
          >
            {CASE_STUDIES.length} projects
          </motion.span>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="type-body text-slate max-w-[52ch]"
        >
          A selection of platforms built for operators in regulated industries,
          shipped on a fixed clock and running in production.
        </motion.p>

        {/* Work list */}
        <div
          className={clsx(
            "fw-list",
            staticMode && "is-static",
            active !== null && "is-hovering"
          )}
          onMouseMove={interactive ? handleMove : undefined}
          onMouseLeave={interactive ? handleLeaveList : undefined}
        >
          {CASE_STUDIES.map((item, i) => (
            <motion.div
              key={item.index}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <a
                href={item.href}
                className="fw-row"
                onMouseEnter={
                  interactive ? (e) => handleEnterRow(i, e) : undefined
                }
                onFocus={() => {
                  activeRef.current = i;
                  setActive(i);
                }}
                onBlur={handleLeaveList}
              >
                <span className="fw-index">
                  {String(item.index).padStart(2, "0")}
                </span>

                <span className="fw-head">
                  <span className="fw-tags">
                    {item.tags.join(" • ").toLowerCase()}
                  </span>
                  <span className="fw-title">{item.title}</span>
                </span>

                <span className="fw-meta">
                  <span className="fw-meta-top">
                    <StatusPill status={item.status} />
                    <span className="fw-place">
                      {item.category} · {item.location}
                    </span>
                  </span>
                  <span className="fw-desc">{item.description}</span>
                </span>

                <span className="fw-thumb">
                  <Image
                    src={item.image}
                    alt={`${item.title} preview`}
                    fill
                    sizes="(max-width: 900px) 100vw, 320px"
                    className="fw-thumb-img"
                  />
                </span>

                <span className="fw-arrow" aria-hidden>
                  ↗
                </span>
              </a>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Cursor-following preview — desktop pointers only */}
      {portalHost &&
        createPortal(
          <div
            ref={previewRef}
            aria-hidden
            className={clsx("fw-preview", active !== null && "is-visible")}
          >
            {CASE_STUDIES.map((item, i) => (
              <Image
                key={item.index}
                src={item.image}
                alt=""
                fill
                sizes="400px"
                className={clsx("fw-preview-img", active === i && "is-active")}
              />
            ))}
          </div>,
          portalHost
        )}
    </section>
  );
}
