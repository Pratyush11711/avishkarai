import type { Metadata } from "next";
import Script from "next/script";
import { SitePreloader } from "@/components/fx/SitePreloader";
import { SplashCursorLayer } from "@/components/fx/SplashCursorLayer";
import { aeonik, barlowCondensed } from "@/lib/fonts";
import "./globals.css";

const STRIP_EXTENSION_ATTRS = `(function(){var a="bis_skin_checked";function s(e){if(e&&e.removeAttribute&&e.hasAttribute&&e.hasAttribute(a))e.removeAttribute(a)}function w(r){s(r);if(!r||!r.querySelectorAll)return;var n=r.querySelectorAll("["+a+"]");for(var i=0;i<n.length;i++)s(n[i])}w(document.documentElement);try{var mo=new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var m=ms[i];if(m.type==="attributes")s(m.target);var ns=m.addedNodes;for(var j=0;j<ns.length;j++){if(ns[j].nodeType===1)w(ns[j])}}});mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:[a]});window.addEventListener("load",function(){w(document.documentElement);setTimeout(function(){mo.disconnect()},4000)})}catch(e){}})();`;

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
      className={`${aeonik.variable} ${barlowCondensed.variable} min-h-full`}
      suppressHydrationWarning
    >
      <body
        className={`${aeonik.className} min-h-full flex flex-col antialiased bg-bg text-text`}
        suppressHydrationWarning
      >
        <Script id="strip-extension-attrs" strategy="beforeInteractive">
          {STRIP_EXTENSION_ATTRS}
        </Script>
        <noscript>
          <style>{`.site-preloader{display:none!important}`}</style>
        </noscript>
        <SplashCursorLayer />
        {children}
        <SitePreloader />
      </body>
    </html>
  );
}
