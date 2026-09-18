import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listedWorkStudies } from "@/lib/work-studies";
import { CaseStudy } from "@/components/work/CaseStudy";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return listedWorkStudies.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = listedWorkStudies.find(project => project.slug === slug);
  return {
    title: study ? `${study.title} — Avishkar AI` : "Project not found",
    description: study?.lead,
    robots: { index: false, follow: true },
  };
}
export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const index = listedWorkStudies.findIndex(project => project.slug === slug);
  if (index < 0) notFound();
  const related = [listedWorkStudies[(index + 1) % listedWorkStudies.length], listedWorkStudies[(index + 2) % listedWorkStudies.length]];
  return <CaseStudy key={slug} study={listedWorkStudies[index]} related={related} />;
}
