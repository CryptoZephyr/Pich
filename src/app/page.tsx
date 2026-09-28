import Image from "next/image";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { VERDICT_MEANING, VerdictBadge } from "@/components/pich/verdict";
import { Workflow } from "@/components/pich/workflow";
import type { Verdict } from "@/lib/engine";
import proof from "../../proof/proof-result.json";

const GITHUB_URL = "https://github.com/CryptoZephyr/Pich";

const NAV = [
  { href: "#try", label: "Product" },
  { href: "#how", label: "How it works" },
  { href: "#proof", label: "Proof" },
  { href: "#faq", label: "FAQ" },
  { href: "/docs", label: "Docs" },
];

const STEPS = [
  { title: "Advisory", body: "Pick a supported Next.js advisory or paste the text of a new one." },
  {
    title: "SERV-compiled checklist",
    body: "SERV Reasoning reads the advisory and lists the exact versions and conditions that make an app affected, each with a word-for-word quote.",
  },
  {
    title: "Deterministic checks",
    body: "Pich throws out any condition whose quote is not in the advisory, then checks each client app's files. No AI decides the verdict.",
  },
  {
    title: "Evidence-backed verdict",
    body: "Each app gets one of three verdicts with file-and-line evidence, the unknowns, and a plain-English note for the client.",
  },
];

const VERDICTS: Verdict[] = ["confirmed", "absent_within_inspected_scope", "needs_manual_review"];

const FAQ = [
  {
    q: "What does Pich check?",
    a: "The installed next version from the lockfile, whether the app uses the App or Pages Router, whether middleware or proxy exists and gates auth, the declared hosting platform, Turbopack build flags, and i18n locale config. It only checks what the advisory says matters.",
  },
  {
    q: "Does Pich run my repository's code?",
    a: "No. For a public GitHub repo, Pich downloads a few files (package.json, package-lock.json, next.config, middleware, and the router file list) and reads them as text. Nothing is installed, built, or run. The before/after proof below was run only on two of our own bundled demo apps.",
  },
  {
    q: "What does “Absent within inspected scope” mean?",
    a: "At least one condition the advisory requires was not found in the files Pich inspected. It does not mean the app is safe, and it is not a reason to skip upgrading.",
  },
  {
    q: "Why is SERV Reasoning required?",
    a: "SERV is what turns advisory prose into a checklist Pich can run. Without it, Pich could only handle advisories someone had hand-coded in advance, and pasting a new advisory would do nothing.",
  },
  {
    q: "Which advisories and frameworks are supported?",
    a: "Public GitHub Next.js apps with an npm package-lock.json (pnpm and yarn lockfiles give Needs manual review). Two advisories are bundled: CVE-2025-29927 (with a runtime proof) and GHSA-6gpp-xcg3-4w24 (static checks only). Pasted advisories work when their conditions fit Pich's 8 checks; anything else is shown as needing a person.",
  },
  {
    q: "Is Pich production-ready?",
    a: "No. This is a hackathon build. It reads public GitHub repos only, one at a time, and knows 8 checks. Private repos, batch checks across all clients, and more lockfile formats are next.",
  },
];

function Logo({ size }: { size: number }) {
  return (
    <Image
      src="/pich-logo.png"
      alt="Pich logo"
      width={size}
      height={Math.round((size * 1536) / 1519)}
      className="rounded border-2 shadow-sm"
      priority
    />
  );
}

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t-2 py-16">
      <div className="mx-auto max-w-5xl px-5">
        <p className="font-head text-sm uppercase tracking-widest text-primary">{eyebrow}</p>
        <h2 className="mt-2 text-3xl md:text-4xl">{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

export default function Home() {
  const [affected, fixed] = proof.results;
  return (
    <>
      <header className="sticky top-0 z-10 border-b-2 bg-background">
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <a href="#top" className="flex items-center gap-3">
            <Logo size={40} />
            <span className="font-head text-xl">Pich</span>
          </a>
          <ul className="hidden items-center gap-6 text-sm font-medium md:flex">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="hover:underline">
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <a href={GITHUB_URL} className="hover:underline">
                GitHub
              </a>
            </li>
          </ul>
          <div className="flex items-center gap-4">
          <Link href="/docs" className="text-sm font-medium hover:underline md:hidden">
            Docs
          </Link>
          <a
            href="#try"
            className="rounded border-2 bg-primary px-4 py-1.5 font-head text-sm text-primary-foreground shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Try it
          </a>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="mx-auto max-w-5xl px-5 py-16 md:py-24">
          <p className="inline-block rounded border-2 bg-accent px-3 py-1 font-head text-xs uppercase tracking-widest shadow-sm">
            For agencies running 10–40 client Next.js apps
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl leading-tight md:text-6xl">A new advisory flags every client. Which ones are actually affected?</h1>
          <p className="mt-6 max-w-2xl text-lg">
            Version scanners flag every app on an affected version. Pich reads the advisory with SERV Reasoning, then checks each client app for the
            advisory&apos;s exact conditions and shows you the lines of code behind every verdict.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#try"
              className="rounded border-2 bg-primary px-6 py-3 font-head text-primary-foreground shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Check an advisory
            </a>
            <a href="#proof" className="rounded border-2 bg-card px-6 py-3 font-head shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">
              See the runtime proof
            </a>
          </div>
        </section>

        <Section id="how" eyebrow="How Pich works" title="From advisory to evidence in four steps">
          <ol className="grid gap-4 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded border-2 bg-card p-4 shadow-md">
                <span className="flex size-8 items-center justify-center rounded border-2 bg-primary font-head text-sm text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-lg">{s.title}</h3>
                <p className="mt-2 text-sm">{s.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="try" eyebrow="Product" title="Try Pich">
          <p className="mb-8 max-w-2xl">
            Pick an advisory, then check it against 8 demo client apps or against your own public GitHub repository.
          </p>
          <Workflow />
        </Section>

        <Section id="verdicts" eyebrow="Three verdicts" title="Every app gets exactly one, with evidence">
          <ul className="grid gap-4 md:grid-cols-3">
            {VERDICTS.map((v) => (
              <li key={v} className="rounded border-2 bg-card p-4 shadow-md">
                <VerdictBadge verdict={v} />
                <p className="mt-3 text-sm">{VERDICT_MEANING[v]}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            Pich never calls an app “safe”. Its verdicts only describe the files it inspected.
          </p>
        </Section>

        <Section id="proof" eyebrow="Product proof" title="The conditions matter: a controlled before/after run">
          <p className="max-w-2xl">
            Static checks say where an advisory&apos;s conditions exist. To show those conditions are real, we built and ran two of the bundled apps
            locally with the real Next.js releases, then sent the {proof.cve} bypass header to their protected <code className="font-mono">{proof.path}</code>{" "}
            page.
          </p>
          <div className="mt-6 overflow-x-auto rounded border-2 bg-card shadow-md">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="border-b-2 bg-muted font-head">
                <tr>
                  <th className="p-3">Demo client app</th>
                  <th className="p-3">next version</th>
                  <th className="p-3">Normal request</th>
                  <th className="p-3">With bypass header</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b-2">
                  <td className="p-3">Acme Dental (affected)</td>
                  <td className="p-3 font-mono">{affected.next}</td>
                  <td className="p-3 font-mono">{affected.noHeader} redirect to login</td>
                  <td className="bg-confirmed-soft p-3 font-mono font-bold">{affected.withHeader} admin page served</td>
                </tr>
                <tr>
                  <td className="p-3">Brightline Legal (fixed)</td>
                  <td className="p-3 font-mono">{fixed.next}</td>
                  <td className="p-3 font-mono">{fixed.noHeader} redirect to login</td>
                  <td className="bg-absent-soft p-3 font-mono font-bold">{fixed.withHeader} redirect to login</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Header sent: <code className="break-all font-mono">{proof.header}</code>. Run on {proof.ranAt.slice(0, 10)} with{" "}
            <a href={`${GITHUB_URL}/blob/main/proof/run-proof.mjs`} className="underline">
              proof/run-proof.mjs
            </a>
            . This runtime proof exists only for {proof.cve}; the second advisory is checked statically.
          </p>
        </Section>

        <Section id="faq" eyebrow="FAQ" title="What Pich does and doesn’t claim">
          <Accordion>
            {FAQ.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground">{f.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>
      </main>

      <footer className="border-t-2 bg-secondary text-secondary-foreground">
        <div className="mx-auto grid max-w-5xl gap-8 px-5 py-12 md:grid-cols-[auto_1fr_auto]">
          <Logo size={96} />
          <div>
            <p className="font-head text-xl">Pich</p>
            <p className="mt-2 max-w-md text-sm">
              Advisory triage for agencies running many Next.js client apps. SERV Reasoning compiles the advisory; deterministic checks decide the verdict.
            </p>
            <p className="mt-4 inline-block rounded border-2 border-secondary-foreground px-2 py-0.5 text-xs font-medium">MIT Licensed</p>
          </div>
          <ul className="space-y-2 text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="hover:underline">
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <a href={GITHUB_URL} className="hover:underline">
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
}
