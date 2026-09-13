import { clsx } from "clsx";

interface PaperCardProps {
  children: React.ReactNode;
  className?: string;
  inverted?: boolean;
}

export function PaperCard({
  children,
  className,
  inverted = false,
}: PaperCardProps) {
  return (
    <div
      className={clsx(
        "rounded-[32px] p-6",
        inverted
          ? "bg-deep-navy text-text-inverse"
          : "bg-paper-white text-text",
        className
      )}
    >
      {children}
    </div>
  );
}
