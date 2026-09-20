"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ChipGlyph, NAV_CHIPS } from "@/components/nav/NavChips";
import { GradualBlur } from "@/components/react-bits/GradualBlur";
import { BOOK_A_BUILD_HREF } from "@/lib/booking";

export const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Studio", href: "#studio" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Process", href: "#process" },
];

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h10M9 4.5 12.5 8 9 11.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Nav() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [overHero, setOverHero] = useState(true);
  const [hudNav, setHudNav] = useState(false);
  const [navReady, setNavReady] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setHudNav(Boolean(document.querySelector(".lh-hud")));
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header || hudNav) return;
    const apply = () => {
      const h = `${Math.ceil(header.getBoundingClientRect().height)}px`;
      document.documentElement.style.setProperty("--nav-height", h);
      document.documentElement.style.setProperty("--nav-h", h);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(header);
    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, [mobileOpen, hudNav]);

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
    const hero = document.getElementById("hero");
    if (!hero) {
      setOverHero(false);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setOverHero(entry.isIntersecting && entry.intersectionRatio >= 0.42);
      },
      { threshold: [0, 0.25, 0.42, 0.6, 1] }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    setNavReady(true);
  }, []);

  useEffect(() => {
    if (overHero || hudNav) setMobileOpen(false);
  }, [overHero, hudNav]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [mobileOpen]);

  const hideBar = hudNav || overHero;

  return (
    <header
      ref={headerRef}
      className={clsx(
        "site-nav-bar fixed top-0 inset-x-0 z-[100] pt-[max(12px,env(safe-area-inset-top))] pointer-events-none",
        hideBar && "site-nav-bar--hidden"
      )}
      aria-hidden={navReady && hideBar ? true : undefined}
      inert={navReady && hideBar ? true : undefined}
    >
      {mobileOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-0 bg-[#12131a]/30 pointer-events-auto"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="relative z-[1] mx-auto w-[min(1080px,calc(100%-16px))] sm:w-[min(1080px,calc(100%-24px))] lg:w-[min(1080px,calc(100%-40px))] pointer-events-auto">
        <div className="relative">
        <GradualBlur
          contain
          position="top"
          height="100%"
          strength={2.4}
          divCount={6}
          curve="bezier"
          exponential
          zIndex={0}
          tone="light"
        />
        <div className="site-nav-pill relative z-[1] flex items-center justify-between gap-2 sm:gap-3 rounded-full min-w-0 px-3 py-2 sm:px-4 lg:px-5 lg:py-2">
          <a href="#" className="shrink-0 min-w-0">
            <BrandLogo on="light" />
          </a>

          <nav className="hidden lg:flex flex-1 items-center justify-center gap-12 xl:gap-16 min-w-0">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "whitespace-nowrap text-[14px] xl:text-[15px] font-medium leading-none tracking-[-0.03em] px-3.5 xl:px-4 py-2 rounded-full border border-transparent transition-all duration-200",
                    isActive
                      ? "px-6 xl:px-8 py-2.5 text-[var(--nav-link-active)] bg-[var(--nav-link-chip-active)] border-[var(--nav-link-chip-border)]"
                      : "text-[var(--nav-link)] hover:text-[var(--nav-link-active)] hover:bg-[var(--nav-link-chip)] hover:border-[var(--nav-link-chip-border)]"
                  )}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={BOOK_A_BUILD_HREF}
              className="nav-cta hidden lg:inline-flex items-center justify-between gap-3 min-w-[11rem] pl-6 pr-2 py-2 rounded-full bg-primary text-text-inverse hover:bg-primary-hover text-[16px] font-medium leading-none tracking-[-0.03em]"
            >
              Book a build
              <span className="w-10 h-10 rounded-full bg-paper-white text-carbon-black inline-flex items-center justify-center shrink-0">
                <span className="nav-cta-arrow inline-flex">
                  <ArrowIcon />
                </span>
              </span>
            </a>

            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center min-h-11 px-4 rounded-full text-[14px] font-medium tracking-[-0.03em] text-carbon-black bg-paper-white border border-ash shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? "Close" : "Menu"}
              <span aria-hidden="true"> ×</span>
            </button>
          </div>
        </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              id="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="lg:hidden overflow-hidden mt-2 relative z-[2]"
            >
              <nav className="site-nav-mobile rounded-[28px] p-3 flex flex-col gap-2.5 max-h-[min(78dvh,calc(100dvh-5.5rem))] overflow-y-auto">
                {NAV_CHIPS.map((link) => {
                  const isActive = activeSection === link.href.replace("#", "");
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      className="flex flex-1 items-center justify-center gap-2.5 min-h-[3.25rem] px-4 rounded-full text-[16px] font-medium tracking-[-0.03em]"
                      style={{
                        "--chip": link.color,
                        background: isActive
                          ? `color-mix(in srgb, ${link.color} 32%, white)`
                          : `color-mix(in srgb, ${link.color} 20%, white)`,
                        border: `1.5px solid color-mix(in srgb, ${link.color} 58%, white)`,
                        color: `color-mix(in srgb, ${link.color} 28%, #16161c)`,
                      } as React.CSSProperties}
                      onClick={() => setMobileOpen(false)}
                    >
                      <ChipGlyph icon={link.icon} color={link.color} />
                      {link.label}
                    </a>
                  );
                })}
                <a
                  href={BOOK_A_BUILD_HREF}
                  className="mt-1 inline-flex items-center justify-center gap-2 min-h-14 rounded-full bg-[#111114] text-paper-white text-[16px] font-medium tracking-[-0.03em]"
                  onClick={() => setMobileOpen(false)}
                >
                  Book a build
                  <span aria-hidden="true">→</span>
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
