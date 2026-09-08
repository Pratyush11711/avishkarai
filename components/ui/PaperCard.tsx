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
          ? "bg-carbon-black text-paper-white"
          : "bg-paper-white text-carbon-black",
        className
      )}
    >
      {children}
    </div>
  );
}
