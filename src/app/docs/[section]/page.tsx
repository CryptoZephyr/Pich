import { notFound, redirect } from "next/navigation";
import { DOCS_NAV } from "@/docs/docs-navigation";

export const dynamicParams = false;

export function generateStaticParams() {
  return DOCS_NAV.map((s) => ({ section: s.slug }));
}

export default async function SectionIndex({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const s = DOCS_NAV.find((x) => x.slug === section);
  if (!s) notFound();
  redirect(`/docs/${s.slug}/${s.pages[0].slug}`);
}
