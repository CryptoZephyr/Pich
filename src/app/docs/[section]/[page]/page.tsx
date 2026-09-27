import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DOCS_CONTENT } from "@/docs/content";
import { DOCS_FLAT } from "@/docs/docs-navigation";
import { DocPage } from "@/docs/DocPage";

type Params = Promise<{ section: string; page: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return DOCS_FLAT.map((d) => ({ section: d.section, page: d.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { section, page } = await params;
  const doc = DOCS_FLAT.find((d) => d.section === section && d.slug === page);
  return doc ? { title: `${doc.title} · Pich docs`, description: doc.description } : {};
}

export default async function Page({ params }: { params: Params }) {
  const { section, page } = await params;
  const body = DOCS_CONTENT[section]?.[page];
  if (!body) notFound();
  return <DocPage href={`/docs/${section}/${page}`}>{body}</DocPage>;
}
