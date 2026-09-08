import { clsx } from "clsx";

interface TextRollProps {
  children: string;
  className?: string;
}

export function TextRoll({ children, className }: TextRollProps) {
  const chars = Array.from(children);

  return (
    <span className={clsx("text-roll", className)} data-text={children}>
      <span className="text-roll-sr">{children}</span>
      <span className="text-roll-live" aria-hidden="true">
        {chars.map((char, i) => (
          <span
            key={`${char}-${i}`}
            className="text-roll-char"
            style={{ transitionDelay: `${i * 16}ms` }}
          >
            <span className="text-roll-inner">
              <span className="text-roll-face">{char === " " ? "\u00A0" : char}</span>
              <span className="text-roll-face">{char === " " ? "\u00A0" : char}</span>
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
