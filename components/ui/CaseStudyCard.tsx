"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// ─── Palette tables ────────────────────────────────────────────────────────────

const GRADIENTS = [
  "linear-gradient(90deg, #a78bfa, #60a5fa)",   // violet → sky
  "linear-gradient(90deg, #2dd4bf, #4ade80)",   // teal → mint
  "linear-gradient(90deg, #60a5fa, #c084fc)",   // blue → purple
  "linear-gradient(90deg, #fbbf24, #f97316)",   // amber → orange
  "linear-gradient(90deg, #f472b6, #fb7185)",   // pink → rose
];

// Tag palette: [bg, text]
const TAG_TONES: [string, string][] = [
  ["#ede9fe", "#6d28d9"],  // lavender
  ["#e0f2fe", "#0369a1"],  // sky
  ["#ccfbf1", "#0f766e"],  // mint
  ["#fef9c3", "#854d0e"],  // yellow
  ["#ffedd5", "#9a3412"],  // peach
  ["#fce7f3", "#9d174d"],  // pink
];

// ─── Types ────────────────────────────────────────────────────────────────────

export type CaseStudyStatus = "live" | "in-progress" | "shipped" | "nda";

export interface CaseStudyCardProps {
  index: number;            // 1-based display number
  title: string;
  category: string;
  location: string;
  status: CaseStudyStatus;
  description: string;
  tags: string[];
  image?: string;           // path relative to /public
  testimonial?: string;
  href?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status }: { status: CaseStudyStatus }) {
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

function TagPill({
  label,
  toneIndex,
}: {
  label: string;
  toneIndex: number;
}) {
  const [bg, text] = TAG_TONES[toneIndex % TAG_TONES.length];
  return (
    <span
      className="csc-tag"
      style={
        {
          "--tag-bg": bg,
          "--tag-text": text,
        } as React.CSSProperties
      }
    >
      {label}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CaseStudyCard({
  index,
  title,
  category,
  location,
  status,
  description,
  tags,
  image,
  testimonial,
  href = "#",
}: CaseStudyCardProps) {
  const gradient = GRADIENTS[(index - 1) % GRADIENTS.length];
  const indexStr = String(index).padStart(2, "0");

  const cardRef = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);

  const handleImageMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = imageWrapRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${mx}%`);
    el.style.setProperty("--my", `${my}%`);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height;  // 0..1
    // Translate toward cursor — max ±10px x, ±7px y
    const tx = (px - 0.5) * 20;
    const ty = (py - 0.5) * 14;
    el.style.transition = "transform 0.08s linear";
    el.style.transform = `translate(${tx}px, ${ty}px) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = "transform 0.6s cubic-bezier(0.22,1,0.36,1)";
    el.style.transform = "translate(0px, 0px) scale(1)";
  };

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="csc-card group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Accent bar */}
      <div
        aria-hidden
        className="csc-accent-bar"
        style={{ background: gradient }}
      />

      {/* Ghost number watermark */}
      <span aria-hidden className="csc-ghost-num">
        {indexStr}
      </span>

      {/* Card body */}
      <div className="csc-body">

        {/* Header row */}
        <div className="csc-header">
          <div className="csc-title-group">
            <span className="csc-index">{indexStr}</span>
            <h3 className="csc-title">{title}</h3>
          </div>
          <StatusPill status={status} />
        </div>

        {/* Meta */}
        <p className="csc-meta">
          {category}
          <span className="csc-meta-sep">•</span>
          {location}
        </p>

        {/* Project image */}
        {image && (
          <div
            className="csc-image-wrap"
            ref={imageWrapRef}
            onMouseMove={handleImageMove}
          >
            <Image
              src={image}
              alt={`${title} preview`}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="csc-image"
              priority={index === 1}
            />
            <Image
              src={image}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="csc-image csc-image-distort"
            />
          </div>
        )}

        {/* Description */}
        <p className="csc-desc">{description}</p>

        {/* Tags */}
        <div className="csc-tags">
          {tags.map((tag, i) => (
            <TagPill key={tag} label={tag} toneIndex={i} />
          ))}
        </div>

        {/* Divider */}
        <hr className="csc-divider" />

        {/* Footer */}
        <div className="csc-footer">
          <p className="csc-testimonial">
            {testimonial ?? "[Named client testimonial — pull quote to be added]"}
          </p>
          <Link href={href} className="csc-link">
            Read the full case study
            <svg
              aria-hidden
              className="csc-arrow"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
