import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Footer } from "@/components/footer/Footer";
import styles from "./LegalPage.module.css";

type Block = { type: string; text?: string; items?: string[] };
type Document = { title: string; subtitle: string; blocks: Block[] };

export function LegalPage({ document }: { document: Document }) {
  const headings = document.blocks.flatMap((block, index) =>
    block.type === "h2" ? [{ title: block.text, id: `section-${index}` }] : []
  );
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="Avishkar AI home"><BrandLogo on="light" /></Link>
        <Link href="/">Back to studio ↗</Link>
      </header>
      <main id="main-content" className={styles.main}>
        <div className={styles.hero}>
          <span className={styles.eyebrow}>Avishkar AI / Legal</span>
          <h1>{document.title}</h1>
          <p>{document.subtitle}</p>
          <nav aria-label="Legal pages" className={styles.links}>
            <Link href="/privacy-policy" aria-current={document.title === "Privacy Policy" ? "page" : undefined}>Privacy Policy</Link>
            <Link href="/terms-of-service" aria-current={document.title === "Terms of Service" ? "page" : undefined}>Terms of Service</Link>
          </nav>
        </div>
        <div className={styles.layout}>
          <aside className={styles.contents}>
            <details open>
              <summary>On this page</summary>
              <nav aria-label="Table of contents">
                {headings.map(h => <a key={h.id} href={`#${h.id}`}>{h.title}</a>)}
              </nav>
            </details>
          </aside>
          <article className={styles.article} aria-label={document.title}>
            {document.blocks.map((block, index) => {
              if (block.type === "h2") return <h2 key={index} id={`section-${index}`}>{block.text}</h2>;
              if (block.type === "h3") return <h3 key={index}>{block.text}</h3>;
              if (block.type === "list") return <ul key={index}>{block.items?.map((item, i) => <li key={i}>{item}</li>)}</ul>;
              return <p key={index}>{block.text}</p>;
            })}
            <a className={styles.top} href="#main-content">Back to top ↑</a>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
