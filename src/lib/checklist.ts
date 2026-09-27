import semver from "semver";
import { PREDICATE_IDS, type PredicateId } from "./vocabulary";

export type Expectation = "present" | "absent";

export interface AffectedRange {
  range: string;
  source_quote: string;
}

export interface ChecklistPredicate {
  id: PredicateId;
  expected: Expectation;
  rationale: string;
  source_quote: string;
}

export interface UnexpressibleCondition {
  condition: string;
  kind: "required_condition" | "mitigation";
  source_quote: string;
}

export interface Checklist {
  advisory_id: string;
  title: string;
  package: string;
  affected_ranges: AffectedRange[];
  fixed_versions: string[];
  predicates: ChecklistPredicate[];
  unexpressible_conditions: UnexpressibleCondition[];
  deployment_assumptions: string[];
  required_evidence: string[];
  recommended_response: string;
}

export interface RejectedItem {
  item: string;
  reason: string;
}

export interface ValidatedChecklist {
  checklist: Checklist;
  rejected: RejectedItem[];
}

const quote = { type: "string", description: "Verbatim text copied from the advisory that supports this item." };

export const CHECKLIST_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "advisory_id",
    "title",
    "package",
    "affected_ranges",
    "fixed_versions",
    "predicates",
    "unexpressible_conditions",
    "deployment_assumptions",
    "required_evidence",
    "recommended_response",
  ],
  properties: {
    advisory_id: { type: "string" },
    title: { type: "string" },
    package: { type: "string" },
    affected_ranges: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["range", "source_quote"],
        properties: {
          range: { type: "string", description: "npm semver range, space-separated, e.g. \">=14.0.0 <14.2.25\"" },
          source_quote: quote,
        },
      },
    },
    fixed_versions: { type: "array", items: { type: "string" } },
    predicates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "expected", "rationale", "source_quote"],
        properties: {
          id: { type: "string", enum: [...PREDICATE_IDS] },
          expected: { type: "string", enum: ["present", "absent"] },
          rationale: { type: "string" },
          source_quote: quote,
        },
      },
    },
    unexpressible_conditions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["condition", "kind", "source_quote"],
        properties: {
          condition: { type: "string" },
          kind: { type: "string", enum: ["required_condition", "mitigation"] },
          source_quote: quote,
        },
      },
    },
    deployment_assumptions: { type: "array", items: { type: "string" } },
    required_evidence: { type: "array", items: { type: "string" } },
    recommended_response: { type: "string" },
  },
} as const;

export function normalizeForQuote(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function quoteIsVerbatim(quoteText: string, advisoryText: string): boolean {
  const q = normalizeForQuote(quoteText);
  return q.length >= 8 && normalizeForQuote(advisoryText).includes(q);
}

export function validateChecklist(raw: Checklist, advisoryText: string): ValidatedChecklist {
  const rejected: RejectedItem[] = [];
  const allowed = new Set<string>(PREDICATE_IDS);

  const affected_ranges = raw.affected_ranges.filter((r) => {
    if (!semver.validRange(r.range)) {
      rejected.push({ item: `range "${r.range}"`, reason: "not a valid npm semver range" });
      return false;
    }
    if (!quoteIsVerbatim(r.source_quote, advisoryText)) {
      rejected.push({ item: `range "${r.range}"`, reason: "source quote not found verbatim in advisory" });
      return false;
    }
    return true;
  });

  const seen = new Set<string>();
  const predicates = raw.predicates.filter((p) => {
    if (!allowed.has(p.id)) {
      rejected.push({ item: `predicate "${p.id}"`, reason: "not in Pich's predicate vocabulary" });
      return false;
    }
    if (!quoteIsVerbatim(p.source_quote, advisoryText)) {
      rejected.push({ item: `predicate "${p.id}"`, reason: "source quote not found verbatim in advisory" });
      return false;
    }
    const key = `${p.id}:${p.expected}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const unexpressible_conditions = raw.unexpressible_conditions.filter((u) => {
    if (!quoteIsVerbatim(u.source_quote, advisoryText)) {
      rejected.push({ item: `condition "${u.condition}"`, reason: "source quote not found verbatim in advisory" });
      return false;
    }
    return true;
  });

  const fixed_versions = raw.fixed_versions.filter((v) => semver.valid(v));

  return {
    checklist: { ...raw, affected_ranges, predicates, unexpressible_conditions, fixed_versions },
    rejected,
  };
}
