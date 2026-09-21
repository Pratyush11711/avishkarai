"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { NAV_LINKS } from "@/components/nav/Nav";
import { ChipGlyph, NAV_CHIPS } from "@/components/nav/NavChips";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { BOOK_A_BUILD_HREF } from "@/lib/booking";

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroHudNav() {
  const hudRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const sync = () => {
      const next = mq.matches;
      setDesktop(next);
      if (next) setMenuOpen(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const hud = hudRef.current;
    if (!hud) return;

    // Use visualViewport.height — stable during iOS browser chrome animation
    // (unlike window.innerHeight which fluctuates as address bar shows/hides).
    // This must match the CSS 100svh used for .lh-intro min-height.
    const getVh = () => window.visualViewport?.height ?? window.innerHeight;
    let cachedVh = getVh();

    const setProgress = (progress: number) => {
      const next = Math.min(1, Math.max(0, progress));
      const travel = Math.max(cachedVh - hud.offsetHeight, 0);
      hud.style.transform = `translate3d(0, ${(1 - next) * travel}px, 0)`;
      hud.classList.toggle("is-docked", next >= 0.999);
    };

    const fromHero = () => {
      const hero = document.getElementById("hero");
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const range = Math.max(rect.height, 1);
      setProgress(-rect.top / range);
    };

    // Refresh cached height on actual resize (orientation change, window resize)
    const onResize = () => {
      cachedVh = getVh();
      fromHero();
    };

    fromHero();

    const trigger = ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      invalidateOnRefresh: true,
      onUpdate: (self) => setProgress(self.progress),
      onLeave: () => setProgress(1),
      onEnterBack: (self) => setProgress(self.progress),
      onRefresh: fromHero,
    });

    gsap.ticker.add(fromHero);
    window.addEventListener("scroll", fromHero, { passive: true });
    window.addEventListener("resize", onResize);

    const onBarResize = () => {
      const h = `${Math.ceil(hud.offsetHeight)}px`;
      document.documentElement.style.setProperty("--nav-height", h);
      document.documentElement.style.setProperty("--nav-h", h);
    };
    onBarResize();
    const ro = new ResizeObserver(onBarResize);
    ro.observe(hud);

    requestAnimationFrame(() => {
      fromHero();
      ScrollTrigger.refresh();
    });

    return () => {
      trigger.kill();
      ro.disconnect();
      gsap.ticker.remove(fromHero);
      window.removeEventListener("scroll", fromHero);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((l) => l.href.replace("#", ""));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);

    if (desktop) {
      return () => window.removeEventListener("keydown", onKey);
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, desktop]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div ref={hudRef} className={menuOpen ? "lh-hud is-menu-open" : "lh-hud"}>
        <div className="lh-hud-bar">
          <a href="#" className="lh-hud-brand">
            <BrandLogo on="dark" className="lh-hud-logo-mark" />
            <span className="lh-hud-tagline">Product & engineering studio</span>
          </a>

          <nav className="lh-hud-nav" aria-label="Hero">
            {!desktop ? (
              <button
                type="button"
                className="lh-hud-menu"
                aria-expanded={menuOpen}
                aria-controls="hero-hud-menu"
                onClick={() => setMenuOpen((v) => !v)}
              >
                Menu
                <span aria-hidden="true">{menuOpen ? " ×" : " +"}</span>
              </button>
            ) : null}

            <div className="lh-hud-links" id="hero-hud-links">
              {NAV_CHIPS.map((link, i) => {
                const isActive = activeSection === link.href.replace("#", "");
                return (
                  <span key={link.href} className="lh-hud-item">
                    {i > 0 ? (
                      <span className="lh-hud-sep" aria-hidden="true">
                        ·
                      </span>
                    ) : null}
                    <a
                      href={link.href}
                      className="lh-hud-link"
                      aria-current={isActive ? "true" : undefined}
                    >
                      {link.label}
                    </a>
                  </span>
                );
              })}
              <span className="lh-hud-sep" aria-hidden="true">
                ·
              </span>
              <a href={BOOK_A_BUILD_HREF} className="lh-hud-cta">
                Book a build
                <span aria-hidden="true"> →</span>
              </a>
            </div>
          </nav>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && !desktop ? (
          <motion.div
            key="hud-overlay"
            id="hero-hud-menu"
            className="lh-hud-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            data-lenis-prevent
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.28, delay: 0.06, ease } }}
            transition={{ duration: 0.34, ease }}
          >
            <motion.div
              className="lh-hud-overlay-panel"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18, transition: { duration: 0.24, ease } }}
              transition={{ duration: 0.42, ease }}
            >
              <motion.div
                className="lh-hud-overlay-bar"
                initial={reduceMotion ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.18, ease } }}
                transition={{ duration: 0.32, ease }}
              >
                <a href="#" className="lh-hud-overlay-brand" onClick={closeMenu}>
                  <BrandLogo on="light" className="lh-hud-overlay-logo" />
                </a>
                <button type="button" className="lh-hud-overlay-close" onClick={closeMenu}>
                  Close <span aria-hidden="true">×</span>
                </button>
              </motion.div>

              <nav className="lh-hud-overlay-links" aria-label="Sections">
                {NAV_CHIPS.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    className="lh-hud-overlay-chip"
                    onClick={closeMenu}
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      y: 10,
                      transition: {
                        duration: 0.2,
                        delay: (NAV_CHIPS.length - 1 - i) * 0.03,
                        ease,
                      },
                    }}
                    transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.06 + i * 0.05, ease }}
                    whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                  >
                    <ChipGlyph icon={link.icon} color="currentColor" size={18} />
                    {link.label}
                  </motion.a>
                ))}
              </nav>

              <motion.a
                href={BOOK_A_BUILD_HREF}
                className="lh-hud-overlay-cta"
                onClick={closeMenu}
                initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12, transition: { duration: 0.2, ease } }}
                transition={{ duration: 0.42, delay: reduceMotion ? 0 : 0.34, ease }}
                whileTap={reduceMotion ? undefined : { scale: 0.985 }}
              >
                Book a build
                <span aria-hidden="true"> →</span>
              </motion.a>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
