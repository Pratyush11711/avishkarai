import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found — Avishkar AI",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="Avishkar AI home"><BrandLogo on="dark" /></Link>
        <Link className={styles.headerLink} href="/#contact">Let’s build <span aria-hidden="true">↗</span></Link>
      </header>
      <main className={styles.main}>
        <p className={styles.label}>404 / A little off course</p>
        <div className={styles.number} aria-hidden="true">
          <span>4</span><span className={styles.zero}>0<span className={styles.orbit}><span>✦</span></span></span><span>4</span>
        </div>
        <div className={styles.bottom}>
          <div className={styles.copy}>
            <h1>This page didn’t ship.</h1>
            <p>The link may have moved, or the page may no longer exist. Let’s get you back to something real.</p>
          </div>
          <nav className={styles.actions} aria-label="Find your way back">
            <Link className={styles.primary} href="/">Back to home <span aria-hidden="true">↗</span></Link>
            <Link className={styles.secondary} href="/#work">Explore our work <span aria-hidden="true">→</span></Link>
          </nav>
        </div>
      </main>
      <footer className={styles.footer}><span>Avishkar AI</span><span>Product &amp; engineering studio.</span><span>Good things are still being built.</span></footer>
    </div>
  );
}
