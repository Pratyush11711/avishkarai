import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { projectDetails } from "@/lib/project-details";
import styles from "./project.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projectDetails.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projectDetails.find((item) => item.slug === slug);
  return { title: project ? `${project.title} — Avishkar AI` : "Project not found", robots: { index: false, follow: true } };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const index = projectDetails.findIndex((item) => item.slug === slug);
  if (index === -1) notFound();
  const project = projectDetails[index];
  const next = projectDetails[(index + 1) % projectDetails.length];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="Avishkar AI home"><BrandLogo on="dark" /></Link>
        <nav className={styles.nav} aria-label="Project navigation">
          <Link className={styles.pill} href="/#work"><span aria-hidden>←</span> Back</Link>
          <Link className={`${styles.pill} ${styles.talk}`} href="/#contact">Let’s talk <span aria-hidden>•</span></Link>
          <details className={styles.menu}>
            <summary className={styles.pill}>Menu <span aria-hidden>••</span></summary>
            <div className={styles.menuLinks}>
              <Link href="/#work">Work</Link>
              <Link href="/#capabilities">Capabilities</Link>
              <Link href="/#contact">Contact</Link>
            </div>
          </details>
        </nav>
      </header>
      <main>
        <div className={styles.eyebrow}>{project.sector} <span>Concept case study · Placeholder copy</span></div>
        <h1 className={styles.title}>{project.title}</h1>
        <div className={styles.grid}>
          <div className={styles.description}>
            {project.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <a className={`${styles.pill} ${styles.launch}`} href={project.image} target="_blank" rel="noopener noreferrer"><span aria-hidden>↗</span> Open project preview</a>
          </div>
          <aside className={styles.meta} aria-label="Project details">
            <div><h2>Services</h2><ul>{project.services.map((service) => <li key={service}>{service}</li>)}</ul></div>
            <div><h2>Links</h2><a href={project.image} target="_blank" rel="noopener noreferrer">View full preview ↗</a><Link href="/#contact">Discuss a similar project ↗</Link></div>
          </aside>
          <figure className={styles.preview}>
            <a href={project.image} target="_blank" rel="noopener noreferrer" aria-label={`Open full ${project.title} preview`}>
              <Image src={project.image} alt={`${project.title} website concept`} width={1600} height={1067} sizes="(max-width: 1000px) 90vw, 44vw" priority />
            </a>
            <figcaption>{project.title} <span>01 / Project preview</span></figcaption>
          </figure>
        </div>
        <Link className={styles.next} href={`/projects/${next.slug}`}><span>Next project</span><strong>{next.title}</strong><span aria-hidden>↗</span></Link>
      </main>
    </div>
  );
}
