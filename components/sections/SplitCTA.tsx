import { BOOK_A_BUILD_HREF } from "@/lib/booking";
import { TextRoll } from "@/components/ui/TextRoll";

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 12.5 12.5 3.5M6 3.5h6.5V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PANELS = [
  {
    href: BOOK_A_BUILD_HREF,
    lines: ["Book a", "build review"],
    body: "In 30 minutes we'll tell you what we'd build, how long it would take, and what we'd cut.",
    wipe: "var(--color-primary)",
  },
  {
    href: "https://avishkarai.com/",
    lines: ["AI For", "Critical", "Infrastructure"],
    body: "Scope locks in week one. From week two, a working build is in your hands every Thursday.",
    wipe: "var(--color-tint)",
  },
] as const;

export function SplitCTA() {
  return (
    <section id="contact" aria-label="Next steps">
      <div className="grid grid-cols-2 bg-paper-white border-t border-ash">
        {PANELS.map((panel) => (
          <a
            key={panel.href}
            href={panel.href}
            {...(panel.href.startsWith("http")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className={`group relative isolate flex min-h-[240px] sm:min-h-[300px] md:min-h-[520px] flex-col justify-between overflow-hidden px-4 py-5 sm:px-6 sm:py-8 md:px-12 md:py-14 text-carbon-black border-ash [&:not(:first-child)]:border-l transition-colors duration-300 ${
              panel.wipe === "var(--color-primary)" ? "hover:text-text-inverse" : ""
            }`}
            style={{ ["--wipe-color" as string]: panel.wipe }}
          >
            <span className="cta-wipe" aria-hidden="true">
              <span className="cta-wipe-band" />
            </span>

            <div className="relative z-10 flex items-start justify-between gap-2 min-w-0 md:gap-6">
              <h2 className="min-w-0 flex-1 font-display text-[clamp(14px,3.25vw,28px)] leading-[1.05] md:text-[clamp(36px,5vw,72px)] md:leading-none">
                {panel.lines.map((line) => (
                  <span key={line} className="block">
                    <TextRoll>{line}</TextRoll>
                  </span>
                ))}
              </h2>

              <span className="mt-0.5 shrink-0 w-7 h-7 md:mt-0 md:w-11 md:h-11 rounded-lg border-[1.5px] border-text inline-flex items-center justify-center transition-colors duration-300 group-hover:bg-primary group-hover:border-primary group-hover:text-text-inverse">
                <span className="transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowIcon />
                </span>
              </span>
            </div>

            <p className="relative z-10 max-w-[36ch] mt-6 text-[12px] leading-snug font-medium md:mt-16 md:text-base md:leading-[1.25]">
              {panel.body}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
