import type { Metadata } from "next";
import { SplashCursorLayer } from "@/components/fx/SplashCursorLayer";
import { aeonik, ibmPlexMono, lusionMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avishkar AI — Product & Engineering Studio",
  description:
    "We build production-grade software with the design finesse of a funded product. Live in eight weeks. Enterprise-grade from day one.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${aeonik.variable} ${ibmPlexMono.variable} ${lusionMono.variable} min-h-full`}
      suppressHydrationWarning
    >
      <body
        className={`${aeonik.className} min-h-full flex flex-col antialiased bg-bg text-text`}
        suppressHydrationWarning
      >
        <SplashCursorLayer />
        {children}
      </body>
    </html>
  );
}
