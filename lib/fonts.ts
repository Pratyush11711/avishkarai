import localFont from "next/font/local";

/** Lusion primary sans — Aeonik (from lusion/hero-standalone/about.CNa9RfUh.css) */
export const aeonik = localFont({
  src: [
    {
      path: "../public/fonts/Aeonik-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Aeonik-RegularItalic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/Aeonik-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Aeonik-Black.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-aeonik",
  display: "swap",
});

/** Lusion UI mono — IBMPlexMono */
export const ibmPlexMono = localFont({
  src: [
    {
      path: "../public/fonts/IBMPlexMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/IBMPlexMono-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

/** Lusion decorative mono — LusionMono */
export const lusionMono = localFont({
  src: [
    {
      path: "../public/fonts/LusionMono.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-lusion-mono",
  display: "swap",
});
