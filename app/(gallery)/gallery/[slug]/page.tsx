import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Wall from "@/components/gallery/wall";
import { getContact, getWork, getWorks, workLine } from "@/lib/gallery";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getWorks().map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) return {};
  const line = workLine(work);
  return {
    title: `${work.title} — Lorenzo Scardicchio`,
    description: [line, work.intro].filter(Boolean).join(" — "),
    openGraph: { title: work.title, description: work.intro, images: [{ url: work.file }] },
  };
}

/** One painting, opened on the wall — the link to hand to someone. */
export default async function WorkPage({ params }: Params) {
  const { slug } = await params;
  if (!getWork(slug)) notFound();
  return <Wall works={getWorks()} contact={getContact()} initialSlug={slug} />;
}
