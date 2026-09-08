import Image from "next/image";
import { clsx } from "clsx";

interface BrandLogoProps {
  /** `onLight` = dark mark, `onDark` = white mark */
  on: "light" | "dark";
  className?: string;
}

export function BrandLogo({ on, className }: BrandLogoProps) {
  const src = on === "dark" ? "/logo-white-nav.webp" : "/logo-dark.webp";

  return (
    <span className={clsx("relative block h-6 w-[8.25rem] md:h-7 md:w-[9.5rem] shrink-0", className)}>
      <Image
        src={src}
        alt="Avishkar AI"
        fill
        sizes="152px"
        className="object-contain object-left"
        priority
      />
    </span>
  );
}
