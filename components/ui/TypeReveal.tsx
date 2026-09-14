"use client";

import { useEffect, useRef, useState } from "react";

function useInView(once = true, eager = false) {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      return;
    }
    if (eager) {
      const id = window.requestAnimationFrame(() => setOn(true));
      return () => window.cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          if (once) io.disconnect();
        }
      },
      { rootMargin: "20% 0px 20% 0px", threshold: 0.01 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [once, eager]);

  return { ref, on };
}

export function HeadingReveal({
  text,
  eager = false,
  accent = false,
  startIndex = 0,
}: {
  text: string;
  eager?: boolean;
  accent?: boolean;
  startIndex?: number;
}) {
  const { ref, on } = useInView(true, eager);
  const words = text.split(" ");

  let index = startIndex;
  return (
    <span ref={ref} className={on ? "is-type-on" : undefined}>
      {words.map((word, w) => {
        const chars = Array.from(word);
        return (
          <span key={`${word}-${w}`}>
            <span className="lusion-type-word">
              <span className="lusion-type-line">
                {chars.map((ch) => {
                  const i = index++;
                  return (
                    <span
                      key={`${ch}-${i}`}
                      className={`lusion-type-char lusion-type-char-head${accent ? " lusion-type-char-accent" : ""}`}
                      style={{ "--i": i } as React.CSSProperties}
                    >
                      {ch}
                    </span>
                  );
                })}
              </span>
            </span>
            {w < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </span>
  );
}

export function LineReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const { ref, on } = useInView();
  const words = text.split(" ");

  return (
    <span ref={ref} className={`${className ?? ""} ${on ? "is-type-on" : ""}`.trim()}>
      {words.map((word, w) => (
        <span key={`${word}-${w}`}>
          <span className="lusion-type-word">
            <span className="lusion-type-line">
              <span
                className="lusion-type-char lusion-type-char-copy"
                style={{ "--i": Math.min(w, 8) } as React.CSSProperties}
              >
                {word}
              </span>
            </span>
          </span>
          {w < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

export function TitleReveal({ text }: { text: string }) {
  const { ref, on } = useInView();
  return (
    <span
      ref={ref}
      className={`work-card-title-inner ${on ? "is-type-on" : ""}`}
    >
      {Array.from(text).map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          className="lusion-type-char lusion-type-char-title"
          style={{ "--i": i } as React.CSSProperties}
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}
