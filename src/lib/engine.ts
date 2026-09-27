import semver from "semver";
import type { Checklist, Expectation } from "./checklist";
import type { PredicateId } from "./vocabulary";

export type RepoFiles = Record<string, string>;

export interface Evidence {
  file: string;
  line?: number;
  text: string;
}

export type Observation = "present" | "absent" | "unknown";

export interface PredicateResult {
  observed: Observation;
  evidence: Evidence[];
  note: string;
}

export type ConditionStatus = "met" | "not_met" | "unknown";

export interface ConditionResult {
  id: string;
  label: string;
  expected: Expectation;
  observed: Observation;
  status: ConditionStatus;
  evidence: Evidence[];
  note: string;
  source_quote: string;
}

export type Verdict = "confirmed" | "absent_within_inspected_scope" | "needs_manual_review";

export interface AppResult {
  clientId: string;
  clientName: string;
  verdict: Verdict;
  reason: string;
  conditions: ConditionResult[];
  unknowns: string[];
  caveats: string[];
  inspectedFiles: string[];
}

function lineEvidence(files: RepoFiles, file: string, pattern: RegExp): Evidence[] {
  const content = files[file];
  if (content === undefined) return [];
  return content
    .split("\n")
    .map((text, i) => ({ file, line: i + 1, text: text.trim() }))
    .filter((e) => pattern.test(e.text));
}

const MIDDLEWARE_CANDIDATES = [
  "middleware.ts",
  "middleware.js",
  "src/middleware.ts",
  "src/middleware.js",
  "proxy.ts",
  "proxy.js",
  "src/proxy.ts",
  "src/proxy.js",
];

function middlewareFile(files: RepoFiles): string | undefined {
  return MIDDLEWARE_CANDIDATES.find((f) => f in files);
}

function routerDir(files: RepoFiles, dir: "app" | "pages"): string | undefined {
  return Object.keys(files).find((f) => f.startsWith(`${dir}/`) || f.startsWith(`src/${dir}/`));
}

function readJson(files: RepoFiles, file: string): Record<string, unknown> | undefined {
  const content = files[file];
  if (content === undefined) return undefined;
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

export function installedNextVersion(files: RepoFiles): { version?: string; evidence: Evidence[]; note: string } {
  const lock = readJson(files, "package-lock.json");
  const packages = lock?.packages as Record<string, { version?: string }> | undefined;
  const locked = packages?.["node_modules/next"]?.version;
  if (locked) {
    return {
      version: locked,
      evidence: lineEvidence(files, "package-lock.json", /"version": "/).filter((e) =>
        e.text.includes(`"${locked}"`),
      ).slice(-1),
      note: `package-lock.json pins next@${locked}`,
    };
  }
  const pkg = readJson(files, "package.json");
  const declared = (pkg?.dependencies as Record<string, string> | undefined)?.next;
  return {
    evidence: declared ? lineEvidence(files, "package.json", /"next":/) : [],
    note: declared
      ? `No lockfile; package.json declares next "${declared}", so the installed version is not determinable`
      : "next is not a dependency of this repository",
  };
}

function nextConfigFile(files: RepoFiles): string | undefined {
  return ["next.config.js", "next.config.mjs", "next.config.ts", "next.config.cjs"].find((f) => f in files);
}

function i18nLocales(files: RepoFiles): { locales?: string[]; configured: boolean; parseable: boolean; file?: string } {
  const file = nextConfigFile(files);
  if (!file) return { configured: false, parseable: true };
  const content = files[file];
  if (!/\bi18n\s*:/.test(content)) return { configured: false, parseable: true, file };
  const match = content.match(/\blocales\s*:\s*\[([^\]]*)\]/);
  if (!match) return { configured: true, parseable: false, file };
  const locales = [...match[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map((m) => m[1]);
  const literalOnly = match[1].replace(/["'`][^"'`]*["'`]/g, "").replace(/[\s,]/g, "") === "";
  return { locales, configured: true, parseable: literalOnly, file };
}

const PREDICATES: Record<PredicateId, (files: RepoFiles) => PredicateResult> = {
  app_router(files) {
    const f = routerDir(files, "app");
    return f
      ? { observed: "present", evidence: [{ file: f, text: "App Router directory present" }], note: "App Router in use" }
      : { observed: "absent", evidence: [], note: "No app/ or src/app/ directory" };
  },
  pages_router(files) {
    const f = routerDir(files, "pages");
    return f
      ? { observed: "present", evidence: [{ file: f, text: "Pages Router directory present" }], note: "Pages Router in use" }
      : { observed: "absent", evidence: [], note: "No pages/ or src/pages/ directory" };
  },
  middleware_present(files) {
    const f = middlewareFile(files);
    return f
      ? {
          observed: "present",
          evidence: lineEvidence(files, f, /export (async )?function (middleware|proxy)|export default/).slice(0, 1),
          note: `${f} found`,
        }
      : { observed: "absent", evidence: [], note: "No middleware or proxy file at the root or in src/" };
  },
  middleware_enforces_auth(files) {
    const f = middlewareFile(files);
    if (!f) return { observed: "absent", evidence: [], note: "No middleware or proxy file, so no middleware auth" };
    const authSignals = lineEvidence(files, f, /session|auth|token|jwt|cookies?\.get/i);
    const gateSignals = lineEvidence(files, f, /redirect\(|status:\s*40[13]|new Response\([^)]*40[13]/);
    if (authSignals.length > 0 && gateSignals.length > 0) {
      return {
        observed: "present",
        evidence: [...authSignals, ...gateSignals].slice(0, 4),
        note: `${f} checks a credential and redirects/blocks unauthenticated requests`,
      };
    }
    return { observed: "absent", evidence: [], note: `${f} has no credential check followed by a redirect/401/403` };
  },
  deployment_on_vercel(files) {
    const declared = readJson(files, "pich.deploy.json");
    const hosting = typeof declared?.hosting === "string" ? declared.hosting : undefined;
    if (hosting) {
      return {
        observed: hosting.toLowerCase() === "vercel" ? "present" : "absent",
        evidence: lineEvidence(files, "pich.deploy.json", /"hosting"/),
        note: `Declared hosting: ${hosting}`,
      };
    }
    return {
      observed: "unknown",
      evidence: [],
      note: "Deployment target not declared (no pich.deploy.json); Pich will not guess where this app runs",
    };
  },
  turbopack_build(files) {
    const pkg = readJson(files, "package.json");
    const build = (pkg?.scripts as Record<string, string> | undefined)?.build;
    const ev = lineEvidence(files, "package.json", /"build":/);
    if (!build) return { observed: "unknown", evidence: [], note: "No build script in package.json" };
    if (!/(^|\s|&&)next build(\s|$)/.test(build)) {
      return {
        observed: "unknown",
        evidence: ev,
        note: `Build script "${build}" does not call next build directly; the bundler cannot be determined statically`,
      };
    }
    if (/--turbo(pack)?\b/.test(build)) return { observed: "present", evidence: ev, note: "next build --turbopack" };
    if (/--webpack\b/.test(build)) return { observed: "absent", evidence: ev, note: "next build --webpack" };
    const { version } = installedNextVersion(files);
    if (!version) return { observed: "unknown", evidence: ev, note: "Installed next version unknown, default bundler unknown" };
    return semver.major(version) >= 16
      ? { observed: "present", evidence: ev, note: `next@${version}: Turbopack is the default for next build` }
      : { observed: "absent", evidence: ev, note: `next@${version}: next build defaults to webpack` };
  },
  i18n_configured(files) {
    const r = i18nLocales(files);
    return r.configured
      ? { observed: "present", evidence: lineEvidence(files, r.file!, /i18n\s*:/), note: "i18n block in next.config" }
      : { observed: "absent", evidence: [], note: "No i18n block in next.config" };
  },
  i18n_single_locale(files) {
    const r = i18nLocales(files);
    if (!r.configured) return { observed: "absent", evidence: [], note: "No i18n block in next.config" };
    const ev = lineEvidence(files, r.file!, /locales\s*:/);
    if (!r.parseable || !r.locales) {
      return { observed: "unknown", evidence: ev, note: "i18n.locales is not a static literal array" };
    }
    return {
      observed: r.locales.length === 1 ? "present" : "absent",
      evidence: ev,
      note: `i18n.locales has ${r.locales.length} entr${r.locales.length === 1 ? "y" : "ies"}: ${r.locales.join(", ")}`,
    };
  },
};

function status(expected: Expectation, observed: Observation): ConditionStatus {
  if (observed === "unknown") return "unknown";
  return observed === expected ? "met" : "not_met";
}

export function evaluate(checklist: Checklist, client: { id: string; name: string; files: RepoFiles }): AppResult {
  const { files } = client;
  const conditions: ConditionResult[] = [];

  const installed = installedNextVersion(files);
  const ranges = checklist.affected_ranges;
  let versionObserved: Observation = "unknown";
  let versionNote = installed.note;
  if (ranges.length === 0) {
    versionNote = "The checklist has no valid affected version range";
  } else if (installed.version) {
    const hit = ranges.find((r) => semver.satisfies(installed.version!, r.range));
    versionObserved = hit ? "present" : "absent";
    versionNote = hit
      ? `next@${installed.version} is inside ${hit.range}`
      : `next@${installed.version} is outside ${ranges.map((r) => r.range).join(" | ")}`;
  }
  conditions.push({
    id: "next_version_in_range",
    label: "Installed next version is in an affected range",
    expected: "present",
    observed: versionObserved,
    status: status("present", versionObserved),
    evidence: installed.evidence,
    note: versionNote,
    source_quote: ranges[0]?.source_quote ?? "",
  });

  for (const p of checklist.predicates) {
    const r = PREDICATES[p.id](files);
    conditions.push({
      id: p.id,
      label: p.rationale,
      expected: p.expected,
      observed: r.observed,
      status: status(p.expected, r.observed),
      evidence: r.evidence,
      note: r.note,
      source_quote: p.source_quote,
    });
  }

  const required = checklist.unexpressible_conditions.filter((u) => u.kind === "required_condition");
  const mitigations = checklist.unexpressible_conditions.filter((u) => u.kind === "mitigation");
  const notMet = conditions.filter((c) => c.status === "not_met");
  const unknownConds = conditions.filter((c) => c.status === "unknown");
  const unknowns = [
    ...unknownConds.map((c) => `${c.id}: ${c.note}`),
    ...required.map((u) => `Not statically checkable: ${u.condition}`),
  ];
  const caveats = mitigations.map((u) => `Mitigation not inspected: ${u.condition}`);

  let verdict: Verdict;
  let reason: string;
  if (notMet.length > 0) {
    verdict = "absent_within_inspected_scope";
    reason = `Condition not met: ${notMet.map((c) => c.note).join("; ")}. This is not a statement that the app is safe.`;
  } else if (unknowns.length > 0) {
    verdict = "needs_manual_review";
    reason = `No condition is contradicted, but ${unknowns.length} could not be determined.`;
  } else {
    verdict = "confirmed";
    reason = "Every advisory condition Pich can check is present in the inspected code and config.";
  }

  return {
    clientId: client.id,
    clientName: client.name,
    verdict,
    reason,
    conditions,
    unknowns,
    caveats,
    inspectedFiles: Object.keys(files).sort(),
  };
}
