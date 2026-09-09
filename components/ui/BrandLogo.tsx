import Image from "next/image";
import { clsx } from "clsx";

interface BrandLogoProps {
  /** `light` = dark mark, `dark` = white mark */
  on: "light" | "dark";
  className?: string;
}

export function BrandLogo({ on, className }: BrandLogoProps) {
  const src = on === "dark" ? "/logo-white-nav.webp" : "/logo-dark.webp";

  return (
    <span
      className={clsx(
        "relative block h-6 w-[8.5rem] lg:h-8 lg:w-[11rem] shrink-0",
        className
      )}
    >
      <Image
        src={src}
        alt="Avishkar AI"
        fill
        sizes="(max-width: 1023px) 136px, 176px"
        className="object-contain object-left"
        priority
      />
    </span>
  );
}
