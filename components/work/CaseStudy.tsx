"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import type { WorkStudy } from "@/lib/work-studies";
import styles from "./case-study.module.css";

function themeStyle(study: WorkStudy): CSSProperties {
  const t = study.theme;
  return {
    "--study-canvas": t.canvas,
    "--study-ink": t.ink,
    "--study-muted": t.muted,
    "--study-accent": t.accent,
    "--study-deep": t.deep,
    "--study-wash": t.wash,
    "--study-glow": t.glow,
  } as CSSProperties;
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .8, ease: [.22, 1, .36, 1] }}>{children}</motion.div>;
}

function MediaSlot({ study, variant, number }: { study: WorkStudy; variant: "film" | "poster" | "mobile" | "desktop" | "detail"; number: string }) {
  return <figure className={`${styles.slot} ${styles[variant]}`}>
    {variant === "film" ? <div className={styles.filmArt} aria-hidden><div /><div /><div /></div>
      : variant === "poster" ? <div className={styles.posterArt}><span>AVISHKAR AI / {study.sector}</span><strong>{study.statement}</strong><span>Thoughtfully designed.<br />Built to move you forward.</span></div>
      : variant === "mobile" ? <div className={styles.phone}><div className={styles.speaker} /><p>{study.title}</p><Image src={study.image} alt={`${study.title} concept on a mobile display`} width={800} height={533} sizes="30vw" /><strong>A clearer<br />way forward.</strong><span>Explore the experience ↗</span></div>
      : <div className={variant === "desktop" ? styles.browserFrame : styles.detailFrame}><div className={styles.browserBar} aria-hidden><i /><i /><i /><span>{study.title}</span></div><Image src={study.image} alt={`${study.title} — illustrative ${variant === "desktop" ? "desktop layout" : "interface detail"}`} width={1600} height={1067} sizes="(max-width: 700px) 90vw, 80vw" /></div>}
    <figcaption><span>{number} / {variant === "film" ? "Motion study" : variant === "poster" ? "Visual direction" : variant === "mobile" ? "Mobile experience" : variant === "desktop" ? "Digital experience" : "The details"}</span><span>{study.sector}</span></figcaption>
    {variant === "film" && <div className={styles.filmLabel}><span aria-hidden>▷</span><p>Space for the story in motion.</p><small>Project film coming here</small></div>}
  </figure>;
}

export function CaseStudy({ study, related }: { study: WorkStudy; related: WorkStudy[] }) {
  const hero = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const titleSize = study.title.length > 19 ? styles.longTitle : "";

  return <div className={styles.page} data-mood={study.theme.mood} style={themeStyle(study)}>
    <header className={styles.header}>
      <Link href="/" aria-label="Avishkar AI home"><BrandLogo on="light" /></Link>
      <nav className={styles.desktopNav} aria-label="Main navigation"><Link href="/#work">Work</Link><Link href="/#capabilities">Capabilities</Link><Link href="/#studio">Studio</Link><Link href="/#contact">Book a build <span aria-hidden>↗</span></Link></nav>
      <button className={styles.menuButton} aria-expanded={menuOpen} aria-controls="case-menu" onClick={() => setMenuOpen(!menuOpen)}>Menu {menuOpen ? "−" : "+"}</button>
      {menuOpen && <nav id="case-menu" className={styles.mobileMenu} aria-label="Mobile navigation"><Link href="/#work">Work</Link><Link href="/#capabilities">Capabilities</Link><Link href="/#studio">Studio</Link><Link href="/#contact">Contact ↗</Link></nav>}
    </header>
    <main>
      <section className={styles.top} aria-labelledby="case-title">
        <div className={styles.facts}>
          <div><span>Industry</span><p>{study.sector}</p></div>
          <div><span>Our role</span><ul>{study.services.map(service => <li key={service}>{service}</li>)}</ul></div>
        </div>
        <h1 id="case-title" className={`${styles.title} ${titleSize}`} aria-label={study.title}>
          {study.lines.map((line, index) => <span className={styles.titleLine} key={line}><motion.span aria-hidden initial={reduce ? false : { y: "110%", rotate: 3 }} animate={{ y: 0, rotate: 0 }} transition={{ duration: 1.05, delay: .12 + index * .12, ease: [.22, 1, .36, 1] }}>{line}</motion.span></span>)}
        </h1>
        <div ref={hero} className={styles.hero}>
          <motion.div className={styles.heroImage} style={{ y: reduce ? 0 : imageY }}><Image src={study.image} alt={`${study.title} concept preview — temporary project imagery`} fill sizes="100vw" priority /></motion.div>
          <div className={styles.heroCaption}><span>{study.title} / Digital experience</span><span>Concept imagery</span></div>
        </div>
      </section>
      <section className={styles.narrative} aria-label="About the project">
        <Reveal><h2 className={styles.lead}>{study.lead}</h2></Reveal>
        <div className={styles.storyGrid}>
          <p className={styles.storyLabel}>A closer look <span aria-hidden>↘</span><small>Illustrative case study</small></p>
          <Reveal className={styles.story}>{study.description.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<Link href="/#contact" className={styles.textLink}>Build something like this <span aria-hidden>↗</span></Link></Reveal>
        </div>
      </section>
      <section className={styles.gallery} aria-label="Project gallery with placeholder media">
        <Reveal><MediaSlot study={study} variant="film" number="01" /></Reveal>
        <div className={styles.pair}><Reveal><MediaSlot study={study} variant="poster" number="02" /></Reveal><Reveal><MediaSlot study={study} variant="mobile" number="03" /></Reveal></div>
        <Reveal><MediaSlot study={study} variant="desktop" number="04" /></Reveal>
        <div className={styles.pair}><Reveal><MediaSlot study={study} variant="detail" number="05" /></Reveal><Reveal className={styles.quote}><p>Every detail.<br />One experience.</p><span>{study.services.join(" / ")}</span></Reveal></div>
      </section>
      <section className={styles.more} aria-labelledby="more-title"><div className={styles.moreHead}><h2 id="more-title">More work</h2><Link href="/#work">All projects ↗</Link></div><div className={styles.pair}>{related.map(project => <Link className={styles.related} key={project.slug} href={`/work/${project.slug}`} style={themeStyle(project)}><div><Image src={project.image} alt={`${project.title} preview`} width={1600} height={1067} sizes="(max-width: 700px) 90vw, 45vw" /></div><h3>{project.title} <span aria-hidden>↗</span></h3><p>{project.sector}</p></Link>)}</div></section>
    </main>
    <footer className={styles.footer}><span>Have something in mind?</span><Link href="/#contact">Let’s build<br /><em>something great.</em><span aria-hidden>↗</span></Link><div><BrandLogo on="dark" /><p>Product & engineering studio</p><Link href="/#work">Back to work ↑</Link></div></footer>
  </div>;
}
