export interface DocLink {
  slug: string;
  title: string;
  description: string;
}

export interface DocSection {
  slug: string;
  title: string;
  pages: DocLink[];
}

export const DOCS_NAV: DocSection[] = [
  {
    slug: "start",
    title: "Start",
    pages: [
      { slug: "introduction", title: "Introduction", description: "What Pich is, who it is for, and the one rule it never breaks." },
      { slug: "why-pich", title: "Why Pich exists", description: "Why version scanners over-flag agencies, and what Pich answers instead." },
      { slug: "how-it-works", title: "How it works", description: "The lifecycle from advisory text to an evidence-backed verdict." },
      { slug: "try-pich", title: "Try Pich", description: "The smallest real path through the live product, in about two minutes." },
    ],
  },
  {
    slug: "using-pich",
    title: "Using Pich",
    pages: [
      { slug: "pick-an-advisory", title: "Pick an advisory", description: "Choose a supported advisory or paste your own advisory text." },
      { slug: "choose-apps", title: "Choose which apps to check", description: "Check the 8 demo client apps or one public GitHub repository." },
      { slug: "read-the-checklist", title: "Read the checklist", description: "What SERV Reasoning extracted, and how every item is tied to a quote." },
      { slug: "read-verdicts", title: "Read the verdicts", description: "How to read a verdict, its conditions, evidence, and unknowns." },
      { slug: "client-note", title: "Write a client note", description: "Generate a plain-English note built only from one verdict." },
      { slug: "recovery", title: "When a step fails", description: "What to do when compiling, checking, or writing a note does not finish." },
    ],
  },
  {
    slug: "architecture",
    title: "Architecture",
    pages: [
      { slug: "system-overview", title: "System overview", description: "One Vercel app: the page, four API routes, SERV, GitHub, and the fixtures." },
      { slug: "serv-compiler", title: "SERV compiler", description: "How advisory prose becomes a typed checklist through a strict JSON schema." },
      { slug: "quote-validation", title: "Quote validation", description: "How Pich rejects any checklist item that does not quote the advisory." },
      { slug: "deterministic-engine", title: "Deterministic engine", description: "How Pich reads files, observes predicates, and picks the verdict." },
      { slug: "github-reader", title: "Public GitHub reader", description: "How Pich reads a public repository as text without running it." },
      { slug: "verification", title: "Verification", description: "The tests and checks that confirm the engine and SERV behave as documented." },
    ],
  },
  {
    slug: "reference",
    title: "Reference",
    pages: [
      { slug: "supported-advisories", title: "Supported advisories", description: "The advisories bundled with Pich and what each one can prove." },
      { slug: "predicates", title: "Predicates", description: "The fixed vocabulary of 8 conditions Pich can check in files." },
      { slug: "verdicts", title: "Verdicts", description: "The three verdicts, their exact rules, and what they do not mean." },
      { slug: "api", title: "API routes", description: "Request and response shapes for the four server routes." },
      { slug: "deployment", title: "Deployment", description: "Where Pich runs today and how it is configured." },
      { slug: "limitations", title: "Limitations", description: "Unsupported cases and known constraints." },
    ],
  },
  {
    slug: "security",
    title: "Security",
    pages: [
      { slug: "trust-model", title: "Trust model", description: "What Pich trusts, what it checks, and what it leaves to a person." },
      { slug: "boundaries", title: "Execution boundaries", description: "What Pich reads, what it never runs, and where the proof runs." },
      { slug: "privacy", title: "Privacy and secrets", description: "What data leaves the browser, where it goes, and where keys live." },
    ],
  },
  {
    slug: "proof",
    title: "Proof",
    pages: [
      { slug: "live-deployment", title: "Live deployment", description: "What is hosted right now and how to check it yourself." },
      { slug: "runtime-proof", title: "Runtime proof", description: "The controlled CVE-2025-29927 before/after run: 200 versus 307." },
      { slug: "fixture-results", title: "Fixture results", description: "Expected verdicts for all 16 advisory and demo app combinations." },
    ],
  },
  {
    slug: "help",
    title: "Help",
    pages: [
      { slug: "troubleshooting", title: "Troubleshooting", description: "Real error messages, their causes, and how to fix them." },
      { slug: "faq", title: "FAQ", description: "Short answers to questions agencies and judges ask." },
    ],
  },
];

export const DOCS_FLAT = DOCS_NAV.flatMap((s) => s.pages.map((p) => ({ ...p, section: s.slug, sectionTitle: s.title, href: `/docs/${s.slug}/${p.slug}` })));

export const GITHUB_URL = "https://github.com/CryptoZephyr/Pich";
export const LIVE_URL = "https://pich-dev.vercel.app";
export const repoFile = (path: string) => `${GITHUB_URL}/blob/main/${path}`;
