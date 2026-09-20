"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BOOK_A_BUILD_HREF } from "@/lib/booking";
import styles from "./PatternInteractiveList.module.css";

type ClockRow = { id: string; title: string; sub: string; meta: string; group: "old" | "new" | "close"; image: string };
const rowPalette: Record<string, { background: string; media: string; ink: string }> = {
  "01": { background: "#fafafc", media: "#ebecfe", ink: "#12131a" },
  "02": { background: "#ebecfe", media: "#d7dafe", ink: "#12131a" },
  "03": { background: "#4fd8ff", media: "#27b8e2", ink: "#050a34" },
  "04": { background: "#8faeff", media: "#5c8dff", ink: "#050a34" },
  "05": { background: "#3040ff", media: "#1b2bff", ink: "#ffffff" },
  "06": { background: "#0a1550", media: "#3040ff", ink: "#ffffff" },
  "07": { background: "#050a34", media: "#5c8dff", ink: "#ffffff" },
  "08": { background: "#ffffff", media: "#ebecfe", ink: "#12131a" },
};
const clockRows: ClockRow[] = [
  { id: "01", title: "Six-week discovery", sub: "A six-week discovery phase. A kickoff deck.", meta: "The Old Way", group: "old", image: "/different-clock/cosmos_874806332.jpeg" },
  { id: "02", title: "“Still setting up”", sub: "Status calls where the honest answer is “we’re still setting up the environment.”", meta: "The Old Way", group: "old", image: "/different-clock/cosmos_1628760389.jpeg" },
  { id: "03", title: "Month-four surprise", sub: "A demo in month four that looks nothing like what you described.", meta: "The Old Way", group: "old", image: "/different-clock/cosmos_1417341526.mp4" },
  { id: "04", title: "Scope locked week one", sub: "Scope is locked in week one. We put the plan in writing during your Build Review, before there is a contract to sign.", meta: "Our Clock", group: "new", image: "/different-clock/cosmos_266495524.jpeg" },
  { id: "05", title: "A build every Thursday", sub: "From week two, a working build in your hands every Thursday — deployed, clickable, on a real URL.", meta: "Our Clock", group: "new", image: "/different-clock/cosmos_991516363.gif" },
  { id: "06", title: "Live in eight weeks", sub: "A focused MVP is live in eight weeks. Multi-tenant platforms with integrations and a compliance layer run 10 to 14.", meta: "Our Clock", group: "new", image: "/different-clock/cosmos_1952560373.jpeg" },
  { id: "07", title: "No range to forget", sub: "The eight weeks on our homepage is a commitment, not a range we hope you forget.", meta: "Our Clock", group: "new", image: "/different-clock/cosmos_991516363.gif" },
  { id: "08", title: "You’ll be using it", sub: "You will never have to ask what we’re working on. You’ll be using it.", meta: "Ready", group: "close", image: "/different-clock/cosmos_266495524.jpeg" },
];

function ClockMedia({ row }: { row: ClockRow }) {
  const isVideo = row.image.endsWith(".mp4");
  if (isVideo) {
    return (
      <video
        className={styles.mediaAsset}
        src={row.image}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
    );
  }
  return (
    <Image
      src={row.image}
      alt=""
      fill
      sizes="(max-width: 767px) 0px, min(520px, 40vw)"
      unoptimized={row.image.endsWith(".gif")}
      className={styles.mediaAsset}
    />
  );
}

export function PatternInteractiveList() {
  const [active, setActive] = useState(0);
  const section = useRef<HTMLElement>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const reduced = useReducedMotion();
  const current = clockRows[active];

  useEffect(() => {
    const tween = gsap.to(section.current, {
      "--clock-bg": rowPalette[current.id].background,
      "--clock-ink": rowPalette[current.id].ink,
      duration: reduced ? 0 : 0.5, ease: "power1.inOut", overwrite: true });
    return () => { tween.kill(); };
  }, [current.id, reduced]);

  useEffect(() => {
    const hover = window.matchMedia("(hover: hover)");
    let frame = 0;
    // Nearest-center measurement handles tall rows at high zoom as well.
    const measure = () => {
      frame = 0;
      if (hover.matches || !section.current) return;
      const center = window.innerHeight / 2;
      const box = section.current.getBoundingClientRect();
      if (box.top > center || box.bottom < center) return;
      let nearest = 0;
      let distance = Infinity;
      rows.current.forEach((row, index) => {
        if (!row) return;
        const rect = row.getBoundingClientRect();
        const next = Math.abs(rect.top + rect.height / 2 - center);
        if (next < distance) { distance = next; nearest = index; }
      });
      setActive(nearest);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    hover.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      hover.removeEventListener("change", schedule);
    };
  }, []);

  return <section id="clock" ref={section} className={styles.section} aria-labelledby="clock-title">
    <header className={styles.header}>
      <span className={styles.eyebrow}>03 / A different clock</span>
      <h2 id="clock-title">You know the pattern.<br /><span>We run on a different clock.</span></h2>
      <p>Less waiting. Something real, every week.</p>
    </header>
    <div className={styles.layout}>
      <ol className={styles.list}>
        {clockRows.map((row, index) => <li key={row.id} ref={(node) => { rows.current[index] = node; }}
          className={styles.row} data-active={active === index}
          onMouseEnter={() => { if (window.matchMedia("(hover: hover)").matches) setActive(index); }}>
          <button type="button" className={styles.trigger} aria-pressed={active === index}
            aria-describedby={`clock-copy-${row.id}`} onFocus={() => setActive(index)} onClick={() => setActive(index)}>
            <span className={styles.title}>{row.title}</span>
            <span className={styles.meta}>{row.meta}</span>
            <span className={styles.index}>[{row.id}]</span>
          </button>
          <p className={styles.sub} id={`clock-copy-${row.id}`}>{row.sub}</p>
        </li>)}
      </ol>
      <aside className={styles.mediaColumn} aria-label="Clock media preview">
        <div className={styles.media}>
          <AnimatePresence initial={false}>
            <motion.div key={current.id} className={styles.mediaLayer}
              style={{ backgroundColor: rowPalette[current.id].media }}
              initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.4, ease: "easeInOut" }}>
              <ClockMedia row={current} />
            </motion.div>
          </AnimatePresence>
        </div>
      </aside>
    </div>
    <footer className={styles.footer}><span>From a plan to a product you can use.</span><a href={BOOK_A_BUILD_HREF}>Book a build review <span aria-hidden="true">↗</span></a></footer>
  </section>;
}
