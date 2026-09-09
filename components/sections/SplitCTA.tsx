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
    href: "#contact",
    lines: ["Book a", "build review"],
    body: "In 30 minutes we'll tell you what we'd build, how long it would take, and what we'd cut.",
    wipe: "var(--color-voltage-yellow)",
  },
  {
    href: "#clock",
    lines: ["See how", "we ship"],
    body: "Scope locks in week one. From week two, a working build is in your hands every Thursday.",
    wipe: "var(--color-mint-chip)",
  },
] as const;

export function SplitCTA() {
  return (
    <section aria-label="Next steps">
      <div className="grid md:grid-cols-2 bg-paper-white">
        {PANELS.map((panel) => (
          <a
            key={panel.href}
            href={panel.href}
            className="group relative isolate flex min-h-[380px] md:min-h-[520px] flex-col justify-between overflow-hidden px-8 py-10 md:px-12 md:py-14 text-carbon-black border-t md:border-t-0 border-ash md:[&:not(:first-child)]:border-l first:border-t-0"
            style={{ ["--wipe-color" as string]: panel.wipe }}
          >
            <span className="cta-wipe" aria-hidden="true">
              <span className="cta-wipe-band" />
            </span>

            <div className="relative z-10 flex items-start justify-between gap-6">
              <h2 className="font-display text-[clamp(36px,5vw,72px)]">
                {panel.lines.map((line) => (
                  <span key={line} className="block">
                    <TextRoll>{line}</TextRoll>
                  </span>
                ))}
              </h2>

              <span className="shrink-0 w-11 h-11 rounded-lg border-[1.5px] border-carbon-black inline-flex items-center justify-center transition-colors duration-300 group-hover:bg-carbon-black group-hover:text-paper-white">
                <span className="transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowIcon />
                </span>
              </span>
            </div>

            <p className="relative z-10 type-body max-w-[36ch] mt-16">
              {panel.body}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
