"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { GradualBlur } from "@/components/react-bits/GradualBlur";

const NAV_LINKS = [
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

  return (
    <header className="fixed top-0 inset-x-0 z-50 pt-[max(12px,env(safe-area-inset-top))] pointer-events-none">
      <div className="relative mx-auto w-[min(1080px,calc(100%-16px))] sm:w-[min(1080px,calc(100%-24px))] lg:w-[min(1080px,calc(100%-40px))] pointer-events-auto">
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

          <nav className="hidden lg:flex flex-1 items-center justify-center gap-4 xl:gap-8 min-w-0">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "whitespace-nowrap text-[14px] xl:text-[15px] font-medium leading-none px-2.5 xl:px-3.5 py-2 rounded-full border border-transparent transition-all duration-200",
                    isActive
                      ? "px-4 xl:px-5 text-[var(--nav-link-active)] bg-[var(--nav-link-chip)] border-[var(--nav-link-chip-border)]"
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
              href="#contact"
              className="nav-cta hidden lg:inline-flex items-center justify-between gap-3 min-w-[11rem] pl-6 pr-2 py-2 rounded-full bg-carbon-black text-paper-white text-[16px] font-semibold leading-none"
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
              className="lg:hidden w-10 h-10 rounded-full inline-flex items-center justify-center text-carbon-black bg-mist-gray border border-ash"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                {mobileOpen ? (
                  <>
                    <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.5" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.5" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="lg:hidden overflow-hidden mt-2"
            >
              <div className="site-nav-pill rounded-[28px] px-5 py-5 flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const isActive = activeSection === link.href.replace("#", "");
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      className={clsx(
                        "text-[15px] font-medium px-3.5 py-2.5 rounded-full",
                        isActive
                          ? "text-[var(--nav-link-active)] bg-[var(--nav-link-chip)]"
                          : "text-[var(--nav-link)]"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </a>
                  );
                })}
                <a
                  href="#contact"
                  className="nav-cta mt-3 inline-flex items-center justify-between gap-3 min-w-[11rem] pl-6 pr-2 py-2 rounded-full bg-carbon-black text-paper-white text-[16px] font-semibold"
                  onClick={() => setMobileOpen(false)}
                >
                  Book a build
                  <span className="w-10 h-10 rounded-full bg-paper-white text-carbon-black inline-flex items-center justify-center">
                    <span className="nav-cta-arrow inline-flex">
                      <ArrowIcon />
                    </span>
                  </span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
