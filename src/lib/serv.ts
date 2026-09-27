import OpenAI from "openai";
import { CHECKLIST_JSON_SCHEMA, type Checklist } from "./checklist";
import type { AppResult } from "./engine";
import { PREDICATE_DESCRIPTIONS, PREDICATE_IDS } from "./vocabulary";

export const SERV_BASE_URL = "https://inference-api.openserv.ai/v1";
export const SERV_MODEL = process.env.SERV_MODEL ?? "gpt-5.4-mini";

export interface ServMeta {
  id: string;
  model: string;
  latencyMs: number;
  totalTokens?: number;
  shadowAgent: boolean;
}

export class ServError extends Error {}

function client(): OpenAI {
  const apiKey = process.env.SERV_API_KEY;
  if (!apiKey) throw new ServError("SERV_API_KEY is not configured on the server");
  return new OpenAI({ baseURL: SERV_BASE_URL, apiKey, timeout: 90_000, maxRetries: 1 });
}

const shadowEnabled = process.env.SERV_SHADOW_AGENT !== "0";

function shadowAgent(hint: string) {
  return shadowEnabled
    ? [
        {
          type: "function" as const,
          function: {
            name: "serv_shadow_agent",
            parameters: {
              type: "object",
              properties: {
                hint: { type: "string", default: hint },
                max_iterations: { type: "integer", default: 2 },
              },
            },
          },
        },
      ]
    : undefined;
}

const COMPILE_SYSTEM = `You are Pich's advisory compiler. You convert one security advisory for the npm package "next" (Next.js) into a typed checklist that a deterministic code inspector will evaluate. You never decide whether any app is vulnerable.

Predicate vocabulary (the ONLY predicate ids you may use):
${PREDICATE_IDS.map((id) => `- ${id}: ${PREDICATE_DESCRIPTIONS[id]}`).join("\n")}

Rules:
1. affected_ranges: one entry per vulnerable range, written as a space-separated npm semver range (e.g. ">=14.0.0 <14.2.25"). Do not include the version check as a predicate.
2. predicates: include a predicate only if the advisory states or directly implies that the condition must hold for an app to be affected. expected="present" means the condition must be true for exposure; expected="absent" means exposure requires the condition to be false (e.g. a hosting platform that is stated to be protected).
3. Every source_quote must be copied character-for-character from the advisory text, a short contiguous span (under 200 characters). Never paraphrase inside source_quote. Items whose quote is not verbatim are discarded.
4. unexpressible_conditions: properties of the application or its deployment, stated in the advisory, that the vocabulary cannot express. kind="required_condition" if it must hold for the app to be exposed; kind="mitigation" if it is a workaround, patch alternative, or upstream protection that would reduce exposure (e.g. filtering a header, moving authorization elsewhere).
   Do NOT list the attacker's actions (sending crafted requests, setting a header) as conditions: the attack itself is assumed. Do NOT restate a condition already covered by a predicate or by affected_ranges.
   If a condition can be expressed with a vocabulary predicate (e.g. "the authorization check occurs in middleware" is middleware_enforces_auth=present), you MUST use the predicate and must NOT also list it here.
5. Polarity: a hosting platform or configuration that the advisory says is protected or not affected is a predicate with expected="absent" (e.g. "hosted on Vercel are automatically protected" means deployment_on_vercel=absent).
6. Do not invent conditions that the advisory does not state. If the advisory is not about next, return empty affected_ranges and predicates and explain in recommended_response.
7. deployment_assumptions and required_evidence: short plain-English strings. recommended_response: one or two sentences, citing fixed versions.`;

export async function compileAdvisory(advisoryText: string): Promise<{ checklist: Checklist; meta: ServMeta }> {
  const started = Date.now();
  const res = await client().chat.completions.create({
    model: SERV_MODEL,
    max_completion_tokens: 4000,
    messages: [
      { role: "system", content: COMPILE_SYSTEM },
      { role: "user", content: `Advisory text:\n"""\n${advisoryText}\n"""` },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "pich_checklist", strict: true, schema: CHECKLIST_JSON_SCHEMA },
    },
    tools: shadowAgent(
      "Every source_quote must be a verbatim substring of the advisory text. Every predicate id must come from the listed vocabulary. Conditions the vocabulary cannot express must be listed in unexpressible_conditions, not forced into predicates.",
    ),
  });
  const content = res.choices[0]?.message?.content;
  if (!content) throw new ServError(`SERV returned no content (finish_reason: ${res.choices[0]?.finish_reason})`);
  let checklist: Checklist;
  try {
    checklist = JSON.parse(content) as Checklist;
  } catch {
    throw new ServError("SERV returned invalid JSON for the checklist schema");
  }
  return {
    checklist,
    meta: {
      id: res.id,
      model: res.model,
      latencyMs: Date.now() - started,
      totalTokens: res.usage?.total_tokens,
      shadowAgent: shadowEnabled,
    },
  };
}

export interface ClientNote {
  headline: string;
  summary: string;
  evidence: string[];
  unknowns: string[];
  recommended_action: string;
}

const NOTE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "summary", "evidence", "unknowns", "recommended_action"],
  properties: {
    headline: { type: "string" },
    summary: { type: "string" },
    evidence: { type: "array", items: { type: "string" } },
    unknowns: { type: "array", items: { type: "string" } },
    recommended_action: { type: "string" },
  },
} as const;

const EXPLAIN_SYSTEM = `You write short, auditable security notes from a software agency to one of its clients, based ONLY on the JSON verdict produced by Pich's deterministic inspector. Rules:
- Restate the verdict exactly: "Confirmed", "Absent within inspected scope", or "Needs manual review".
- Never say or imply the app is "safe", "secure", "not vulnerable", or "exploited". "Absent within inspected scope" means the specific advisory conditions were not found in the files inspected.
- "Confirmed" means the advisory's conditions are present in the code and config; it does not mean an attack happened.
- Evidence bullets must cite file names (and line numbers when given) from the JSON. Do not invent files, versions, or facts.
- List every unknown from the JSON. Items in "caveats" are optional workarounds the inspector did not check; mention them only as optional hardening, never as extra conditions or requirements.
- recommended_action: concrete next step (e.g. upgrade to a fixed version from the checklist, or what information is needed for manual review).
- Plain English a non-technical client can read. Under 140 words total.`;

export async function explainResult(
  checklist: Checklist,
  result: AppResult,
): Promise<{ note: ClientNote; meta: ServMeta }> {
  const started = Date.now();
  const payload = {
    advisory: { id: checklist.advisory_id, title: checklist.title, fixed_versions: checklist.fixed_versions },
    result,
  };
  const res = await client().chat.completions.create({
    model: SERV_MODEL,
    max_completion_tokens: 1500,
    messages: [
      { role: "system", content: EXPLAIN_SYSTEM },
      { role: "user", content: JSON.stringify(payload) },
    ],
    response_format: { type: "json_schema", json_schema: { name: "client_note", strict: true, schema: NOTE_SCHEMA } },
    tools: shadowAgent(
      "The note must restate the exact verdict label, must not call the app safe or not vulnerable, must cite only files present in the JSON, and must list every unknown.",
    ),
  });
  const content = res.choices[0]?.message?.content;
  if (!content) throw new ServError("SERV returned no content for the client note");
  return {
    note: JSON.parse(content) as ClientNote,
    meta: {
      id: res.id,
      model: res.model,
      latencyMs: Date.now() - started,
      totalTokens: res.usage?.total_tokens,
      shadowAgent: shadowEnabled,
    },
  };
}
