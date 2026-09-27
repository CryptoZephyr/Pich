import assert from "node:assert/strict";
import { CURATED_ADVISORIES } from "../src/lib/advisories";
import { validateChecklist, type Checklist } from "../src/lib/checklist";
import { evaluate, type Verdict } from "../src/lib/engine";
import { FIXTURE_CLIENTS } from "../src/lib/fixtures";

const [cve29927, ghsa6gpp] = CURATED_ADVISORIES;

const CVE_29927: Checklist = {
  advisory_id: "GHSA-f82v-jwr5-mffw",
  title: "Authorization Bypass in Next.js Middleware",
  package: "next",
  affected_ranges: [
    { range: ">=13.0.0 <13.5.9", source_quote: "next >= 13.0.0, < 13.5.9" },
    { range: ">=14.0.0 <14.2.25", source_quote: "next >= 14.0.0, < 14.2.25" },
    { range: ">=15.0.0 <15.2.3", source_quote: "next >= 15.0.0, < 15.2.3" },
    { range: ">=12.0.0 <12.3.5", source_quote: "next >= 12.0.0, < 12.3.5" },
  ],
  fixed_versions: ["15.2.3", "14.2.25", "13.5.9", "12.3.5"],
  predicates: [
    { id: "middleware_present", expected: "present", rationale: "Auth check happens in middleware", source_quote: "if the authorization check occurs in middleware" },
    { id: "middleware_enforces_auth", expected: "present", rationale: "Middleware performs authorization", source_quote: "bypass authorization checks within a Next.js application" },
    { id: "deployment_on_vercel", expected: "absent", rationale: "Vercel-hosted apps are protected", source_quote: "Next.js deployments hosted on Vercel are automatically protected against this vulnerability" },
  ],
  unexpressible_conditions: [
    { condition: "External requests carrying x-middleware-subrequest are not stripped upstream", kind: "mitigation", source_quote: "prevent external user requests which contain the `x-middleware-subrequest` header" },
  ],
  deployment_assumptions: [],
  required_evidence: [],
  recommended_response: "Upgrade to a fixed version.",
};

const GHSA_6GPP: Checklist = {
  advisory_id: "GHSA-6gpp-xcg3-4w24",
  title: "Middleware / Proxy bypass with Turbopack and single locale",
  package: "next",
  affected_ranges: [{ range: ">=16.0.0 <16.2.11", source_quote: "next >= 16.0.0, < 16.2.11" }],
  fixed_versions: ["16.2.11"],
  predicates: [
    { id: "app_router", expected: "present", rationale: "App Router", source_quote: "applications using App Router" },
    { id: "turbopack_build", expected: "present", rationale: "Built with Turbopack", source_quote: "built with Turbopack" },
    { id: "i18n_single_locale", expected: "present", rationale: "Single locale", source_quote: "a single entry in config.i18n.locales" },
    { id: "middleware_enforces_auth", expected: "present", rationale: "Middleware/proxy auth", source_quote: "bypass middleware/proxy based authentication" },
  ],
  unexpressible_conditions: [],
  deployment_assumptions: [],
  required_evidence: [],
  recommended_response: "Upgrade to 16.2.11.",
};

const EXPECTED: Record<string, Record<string, Verdict>> = {
  [CVE_29927.advisory_id]: {
    "client-a": "confirmed",
    "client-b": "absent_within_inspected_scope",
    "client-c": "absent_within_inspected_scope",
    "client-d": "absent_within_inspected_scope",
    "client-e": "needs_manual_review",
    "client-f": "absent_within_inspected_scope",
    "client-g": "absent_within_inspected_scope",
    "client-h": "absent_within_inspected_scope",
  },
  [GHSA_6GPP.advisory_id]: {
    "client-a": "absent_within_inspected_scope",
    "client-b": "absent_within_inspected_scope",
    "client-c": "absent_within_inspected_scope",
    "client-d": "absent_within_inspected_scope",
    "client-e": "absent_within_inspected_scope",
    "client-f": "confirmed",
    "client-g": "needs_manual_review",
    "client-h": "absent_within_inspected_scope",
  },
};

export function expectedVerdicts(advisoryId: string) {
  return EXPECTED[advisoryId];
}

function run() {
  for (const [checklist, advisory] of [
    [CVE_29927, cve29927],
    [GHSA_6GPP, ghsa6gpp],
  ] as const) {
    const { checklist: valid, rejected } = validateChecklist(checklist, advisory.text);
    assert.deepEqual(rejected, [], `${checklist.advisory_id}: hand-written quotes must validate`);
    for (const client of FIXTURE_CLIENTS) {
      const r = evaluate(valid, client);
      assert.equal(r.verdict, EXPECTED[checklist.advisory_id][client.id], `${checklist.advisory_id} ${client.id}: ${r.reason}`);
      console.log(`ok ${checklist.advisory_id} ${client.id} -> ${r.verdict}`);
    }
  }

  const tampered: Checklist = {
    ...CVE_29927,
    affected_ranges: [...CVE_29927.affected_ranges, { range: ">=0.0.0", source_quote: "all versions of next are affected" }],
    predicates: [
      ...CVE_29927.predicates,
      { id: "pages_router", expected: "present", rationale: "invented", source_quote: "only Pages Router apps are affected" },
    ],
  };
  const { checklist: cleaned, rejected } = validateChecklist(tampered, cve29927.text);
  assert.equal(rejected.length, 2, "fabricated quotes must be rejected");
  assert.equal(cleaned.predicates.length, 3);
  assert.equal(cleaned.affected_ranges.length, 4);
  console.log("ok fabricated range and predicate rejected");

  const flipped: Checklist = {
    ...CVE_29927,
    predicates: CVE_29927.predicates.map((p) =>
      p.id === "deployment_on_vercel" ? { ...p, expected: "present" as const } : p,
    ),
  };
  const corrected = validateChecklist(flipped, cve29927.text);
  assert.equal(
    corrected.checklist.predicates.find((p) => p.id === "deployment_on_vercel")?.expected,
    "absent",
    "protective quote must force expected=absent",
  );
  console.log("ok reversed protective predicate corrected");
}

if (process.argv[1]?.endsWith("verify-engine.ts")) run();
