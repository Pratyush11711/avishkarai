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
      { rootMargin: "-10% 0px -10% 0px", threshold: 0.2 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [once, eager]);

  return { ref, on };
}

export function HeadingReveal({
  text,
  eager = false,
}: {
  text: string;
  eager?: boolean;
}) {
  const { ref, on } = useInView(true, eager);
  const words = text.split(" ");

  let index = 0;
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
                      className="lusion-type-char lusion-type-char-head"
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
  let index = 0;

  return (
    <span ref={ref} className={`${className ?? ""} ${on ? "is-type-on" : ""}`.trim()}>
      {words.map((word, w) => (
        <span key={`${word}-${w}`}>
          <span className="lusion-type-word">
            <span className="lusion-type-line">
              {Array.from(word).map((ch) => {
                const i = index++;
                return (
                  <span
                    key={`${ch}-${i}`}
                    className="lusion-type-char"
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
