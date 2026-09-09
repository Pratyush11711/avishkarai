"use client";

import { scrollToTop } from "@/lib/smooth-scroll";
import { TextRoll } from "@/components/ui/TextRoll";
import { BrandLogo } from "@/components/ui/BrandLogo";

const FOOTER_LINKS = {
  Studio: [
    { label: "Work", href: "#work" },
    { label: "Capabilities", href: "#capabilities" },
    { label: "Process", href: "#process" },
    { label: "About", href: "#studio" },
    { label: "Careers", href: "#" },
  ],
  Contact: [
    { label: "arpit@avishkarai.com", href: "mailto:arpit@avishkarai.com" },
    { label: "shivang@avishkarai.com", href: "mailto:shivang@avishkarai.com" },
    { label: "Book a build review", href: "#contact" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Security", href: "#" },
    { label: "Terms", href: "#" },
  ],
  Social: [
    { label: "LinkedIn", href: "#" },
    { label: "X", href: "#" },
    { label: "GitHub", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-carbon-black" aria-label="Footer">
      <div aria-hidden className="brand-rainbow-strip" />
      <div className="page-wrap py-16">
        <div className="grid md:grid-cols-[1fr_auto] gap-12 md:gap-20 mb-12">
          <div>
            <a href="#" className="inline-block mb-4">
              <BrandLogo on="dark" className="h-8 w-[11rem]" />
            </a>
            <p className="type-body text-smoke mb-2 max-w-[40ch]">
              Product and engineering studio.
            </p>
            <p className="type-body text-smoke mb-4 max-w-[40ch]">
              Software that ships fast and holds up.
            </p>
            <p className="type-caption text-smoke">
              Anjaneyaai Technologies Private Limited
              <br />
              Bengaluru, India
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <div key={group}>
                <p className="type-caption text-smoke mb-4">{group}</p>
                <ul className="flex flex-col gap-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className={
                          link.label.includes("@")
                            ? "type-body-sm voltage-mark px-1"
                            : "type-body-sm text-smoke hover:text-paper-white transition-colors duration-200"
                        }
                      >
                        {link.label.includes("@") ? (
                          link.label
                        ) : (
                          <TextRoll>{link.label}</TextRoll>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 flex items-center justify-between gap-4 flex-wrap">
          <p className="type-caption text-smoke">© 2026 Avishkar AI</p>
          <button
            type="button"
            onClick={scrollToTop}
            className="type-caption text-smoke hover:text-paper-white transition-colors duration-200"
          >
            <TextRoll>Back to top ↑</TextRoll>
          </button>
        </div>
      </div>
    </footer>
  );
}
