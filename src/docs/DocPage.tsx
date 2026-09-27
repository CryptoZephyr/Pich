import Image from "next/image";
import Link from "next/link";
import { DocsSidebar } from "./DocsSidebar";
import { DOCS_FLAT, GITHUB_URL, repoFile } from "./docs-navigation";

export function DocPage({ href, children }: { href: string; children: React.ReactNode }) {
  const i = DOCS_FLAT.findIndex((d) => d.href === href);
  const page = DOCS_FLAT[i];
  const prev = DOCS_FLAT[i - 1];
  const next = DOCS_FLAT[i + 1];
  const file = `src/docs/pages/${page.section === "using-pich" ? "using" : page.section}.tsx`;
  return (
    <>
      <header className="sticky top-0 z-20 border-b-2 bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/pich-logo.png" alt="Pich logo" width={36} height={36} className="rounded border-2 shadow-sm" priority />
            <span className="font-head text-xl">Pich</span>
            <span className="rounded border-2 px-1.5 py-0.5 font-mono text-xs">docs</span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium">
            <a href={GITHUB_URL} className="hover:underline">
              GitHub
            </a>
            <Link href="/#try" className="rounded border-2 bg-primary px-4 py-1.5 font-head text-sm text-primary-foreground shadow-md">
              Try it
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8">
            <DocsSidebar current={href} />
          </div>
        </aside>
        <details className="rounded border-2 bg-card shadow-sm md:hidden">
          <summary className="cursor-pointer px-4 py-2 font-head text-sm">Docs menu: {page.title}</summary>
          <div className="border-t-2 p-4">
            <DocsSidebar current={href} />
          </div>
        </details>
        <main className="min-w-0 max-w-3xl">
          <p className="font-head text-xs uppercase tracking-wide text-primary">{page.sectionTitle}</p>
          <h1 className="mt-1 font-head text-4xl">{page.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{page.description}</p>
          <div className="mt-6 border-t-2 pt-2">{children}</div>
          <nav aria-label="Previous and next" className="mt-12 grid gap-4 border-t-2 pt-6 sm:grid-cols-2">
            {prev ? (
              <a href={prev.href} className="rounded border-2 bg-card p-4 shadow-md hover:bg-muted">
                <span className="block text-xs text-muted-foreground">Previous</span>
                <span className="font-head">{prev.title}</span>
              </a>
            ) : (
              <span />
            )}
            {next && (
              <a href={next.href} className="rounded border-2 bg-card p-4 text-right shadow-md hover:bg-muted">
                <span className="block text-xs text-muted-foreground">Next</span>
                <span className="font-head">{next.title}</span>
              </a>
            )}
          </nav>
          <p className="mt-8 text-xs text-muted-foreground">
            <a href={repoFile(file)} className="underline">
              Edit this page on GitHub
            </a>
          </p>
        </main>
      </div>
    </>
  );
}
