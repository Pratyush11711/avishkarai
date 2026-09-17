import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { workStudies } from "@/lib/work-studies";
import { CaseStudy } from "@/components/work/CaseStudy";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return workStudies.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = workStudies.find(project => project.slug === slug);
  return {
    title: study ? `${study.title} — Avishkar AI` : "Project not found",
    description: study?.lead,
    robots: { index: false, follow: true },
  };
}
export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const index = workStudies.findIndex(project => project.slug === slug);
  if (index < 0) notFound();
  const related = [workStudies[(index + 1) % workStudies.length], workStudies[(index + 2) % workStudies.length]];
  return <CaseStudy key={slug} study={workStudies[index]} related={related} />;
}
