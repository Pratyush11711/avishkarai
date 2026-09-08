import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const suisseIntl = Inter({
  subsets: ["latin"],
  variable: "--font-suisseintl",
  weight: ["400", "500", "700"],
});

const suisseIntlCond = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-suisseintlcond",
  weight: ["700"],
});

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
      className={`${suisseIntl.variable} ${suisseIntlCond.variable} ${GeistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body
        className={`${suisseIntl.className} min-h-full flex flex-col antialiased bg-warm-canvas text-carbon-black`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
