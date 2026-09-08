"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { TextRoll } from "@/components/ui/TextRoll";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { GradualBlur } from "@/components/react-bits/GradualBlur";

const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Studio", href: "#studio" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
];

export function Nav() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [overDark, setOverDark] = useState(false);

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

    const darkIds = ["clock", "final-cta"];
    const visibleDark = new Set<string>();
    const darkObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleDark.add(entry.target.id);
          else visibleDark.delete(entry.target.id);
        });
        setOverDark(visibleDark.size > 0);
      },
      { rootMargin: "-8% 0px -70% 0px" }
    );
    darkIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) darkObserver.observe(el);
    });

    return () => {
      observer.disconnect();
      darkObserver.disconnect();
    };
  }, []);

  return (
    <>
      <GradualBlur
        position="top"
        height="8.5rem"
        strength={2.4}
        divCount={6}
        curve="bezier"
        exponential
        zIndex={40}
        className="md:h-36"
      />
      <header className="fixed top-0 left-0 right-0 z-50 h-24 md:h-32 pointer-events-none">
      <div className="page-wrap h-full grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-4 pointer-events-auto">
        <a href="#" className="justify-self-start">
          <BrandLogo on={overDark ? "dark" : "light"} />
        </a>

        <nav className="hidden md:flex items-center justify-center h-14 px-10 gap-8 rounded-full bg-paper-white">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.replace("#", "");
            return (
              <a
                key={link.href}
                href={link.href}
                className="text-[16px] font-medium leading-none text-carbon-black"
                style={{ opacity: isActive ? 1 : 0.85 }}
              >
                <TextRoll>{link.label}</TextRoll>
              </a>
            );
          })}
        </nav>

        <a
          href="#pricing"
          className={clsx(
            "hidden md:inline-flex items-center justify-center justify-self-end h-14 px-7 rounded-full text-[16px] font-medium leading-none transition-colors duration-300",
            overDark
              ? "bg-paper-white text-carbon-black hover:bg-mint-chip"
              : "bg-carbon-black text-paper-white hover:bg-graphite"
          )}
        >
          <TextRoll>Book a build review</TextRoll>
        </a>

        <button
          type="button"
          className="md:hidden justify-self-end w-11 h-11 rounded-full inline-flex items-center justify-center text-carbon-black bg-paper-white"
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

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-paper-white mx-6 rounded-[32px] pointer-events-auto"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-carbon-black text-[16px] font-medium py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  <TextRoll>{link.label}</TextRoll>
                </a>
              ))}
              <a
                href="#pricing"
                className="inline-flex items-center justify-center h-12 px-6 text-[16px] font-medium rounded-full bg-carbon-black text-paper-white mt-2"
                onClick={() => setMobileOpen(false)}
              >
                <TextRoll>Book a build review</TextRoll>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    </>
  );
}
