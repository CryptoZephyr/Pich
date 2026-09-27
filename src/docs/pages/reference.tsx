import { Callout } from "../Callout";
import { CodeBlock } from "../CodeBlock";
import { GITHUB_URL, LIVE_URL } from "../docs-navigation";
import { A, C, H2, P, Table, UL } from "../Prose";

export const referencePages: Record<string, React.ReactNode> = {
  "supported-advisories": (
    <>
      <Table
        head={["Advisory", "Summary", "Evidence available"]}
        rows={[
          [
            <span key="a">
              <C>CVE-2025-29927</C>
              <br />
              <C>GHSA-f82v-jwr5-mffw</C>
            </span>,
            "Authorization bypass in Next.js middleware",
            "Static check and a controlled runtime proof",
          ],
          [
            <span key="b">
              <C>CVE-2026-64642</C>
              <br />
              <C>GHSA-6gpp-xcg3-4w24</C>
            </span>,
            "Middleware / proxy bypass in App Router apps using Turbopack and a single locale",
            "Static check only",
          ],
          ["Pasted text", "Any Next.js advisory", "Static check, limited to the predicate vocabulary"],
        ]}
      />
    </>
  ),
  predicates: (
    <>
      <P>SERV may only use these 8 predicates. Each is observed as present, absent, or unknown.</P>
      <Table
        head={["Predicate", "How Pich observes it"]}
        rows={[
          [<C key="1">app_router</C>, "An app/ or src/app/ directory exists"],
          [<C key="2">pages_router</C>, "A pages/ or src/pages/ directory exists"],
          [<C key="3">middleware_present</C>, "middleware.(ts|js) or proxy.(ts|js) at the root or in src/"],
          [<C key="4">middleware_enforces_auth</C>, "That file checks a session, token, or cookie and then redirects or returns 401/403"],
          [<C key="5">deployment_on_vercel</C>, "Read from pich.deploy.json hosting; unknown if the file is missing"],
          [<C key="6">turbopack_build</C>, "From the build script (--turbopack / --webpack) or the installed version’s default; unknown for custom build scripts"],
          [<C key="7">i18n_configured</C>, "next.config declares an i18n block"],
          [<C key="8">i18n_single_locale</C>, "i18n.locales is a literal array with exactly one entry; unknown if not a literal"],
        ]}
      />
      <H2 id="deploy-file">Declaring hosting</H2>
      <P>Hosting cannot be seen from code, so Pich reads an optional file at the app root:</P>
      <CodeBlock label="pich.deploy.json">{`{ "hosting": "self-hosted", "platform": "docker on a VPS" }`}</CodeBlock>
      <P>
        Use <C>&quot;hosting&quot;: &quot;vercel&quot;</C> for Vercel. Without this file, hosting is unknown.
      </P>
    </>
  ),
  verdicts: (
    <>
      <Table
        head={["Verdict", "Rule", "What it does not mean"]}
        rows={[
          ["Confirmed", "Every condition Pich can check is met, and nothing is unknown", "That an attack happened or is possible in production"],
          ["Absent within inspected scope", "At least one required condition was not found in the inspected files", "That the app is safe or not vulnerable"],
          ["Needs manual review", "No condition is contradicted, but at least one is unknown or not checkable from files", "That the app is affected"],
        ]}
      />
      <Callout kind="boundary">SERV never picks the verdict. The rule above runs in code after SERV’s checklist has been validated.</Callout>
    </>
  ),
  api: (
    <>
      <P>All routes accept and return JSON. Errors return {"{ \"error\": string }"}.</P>
      <H2 id="compile">POST /api/compile</H2>
      <CodeBlock label="request">{`{ "advisoryText": "…40 to 12,000 characters…" }`}</CodeBlock>
      <CodeBlock label="response">{`{ "checklist": Checklist, "rejected": [{ "item": string, "reason": string }], "meta": { "id", "model", "latencyMs", "totalTokens", "shadowAgent" } }`}</CodeBlock>
      <P>Limits: 6 requests per minute per IP, 60 per minute overall. Errors: 400 bad input, 429 rate limited, 502 SERV failure.</P>
      <H2 id="check">POST /api/check</H2>
      <CodeBlock label="request">{`{ "checklist": Checklist }`}</CodeBlock>
      <CodeBlock label="response">{`{ "results": AppResult[] }   // one per demo app`}</CodeBlock>
      <H2 id="check-repo">POST /api/check-repo</H2>
      <CodeBlock label="request">{`{ "checklist": Checklist, "repoUrl": "https://github.com/owner/repo" }`}</CodeBlock>
      <CodeBlock label="response">{`{ "results": [AppResult], "repo": { "name", "url", "ref" } }`}</CodeBlock>
      <P>Limits: 10 per minute per IP, 50 overall. Errors: 400, 422 repository problem, 429.</P>
      <H2 id="explain">POST /api/explain</H2>
      <CodeBlock label="request">{`{ "checklist": Checklist, "clientId": "client-a" }   // or "repoUrl"`}</CodeBlock>
      <CodeBlock label="response">{`{ "note": { "headline", "summary", "evidence", "unknowns", "recommended_action" }, "meta": {…}, "result": AppResult }`}</CodeBlock>
      <P>Limits: 10 per minute per IP, 80 overall. Errors: 400, 422, 429, 502.</P>
      <H2 id="app-result">AppResult</H2>
      <CodeBlock label="ts">{`
interface AppResult {
  clientId: string;
  clientName: string;
  verdict: "confirmed" | "absent_within_inspected_scope" | "needs_manual_review";
  reason: string;
  conditions: {
    id: string;
    label: string;
    expected: "present" | "absent";
    observed: "present" | "absent" | "unknown";
    status: "met" | "not_met" | "unknown";
    note: string;
    source_quote: string;
    evidence: { file: string; line?: number; text: string }[];
  }[];
  unknowns: string[];
  caveats: string[];
  inspectedFiles: string[];
}
`}</CodeBlock>
      <Callout kind="note">Rate limits are kept in memory per server instance, so they are approximate.</Callout>
    </>
  ),
  deployment: (
    <>
      <Table
        head={["Item", "Value"]}
        rows={[
          ["Live app", <A key="l" href={LIVE_URL}>{LIVE_URL}</A>],
          ["Hosting", "One Vercel project: page and API routes together"],
          ["Repository", <A key="g" href={GITHUB_URL}>{GITHUB_URL}</A>],
          ["SERV endpoint", <C key="s">https://inference-api.openserv.ai/v1</C>],
          ["Model", <C key="m">gpt-5.4-mini</C>],
        ]}
      />
      <H2 id="env">Environment variables</H2>
      <Table
        head={["Name", "Required", "Purpose"]}
        rows={[
          [<C key="1">SERV_API_KEY</C>, "Yes", "SERV Reasoning key, server side only"],
          [<C key="2">SERV_MODEL</C>, "No", "Override the model (default gpt-5.4-mini)"],
          [<C key="3">SERV_SHADOW_AGENT</C>, "No", "Set to 0 to leave out the serv_shadow_agent tool"],
        ]}
      />
      <H2 id="local">Run locally</H2>
      <CodeBlock label="bash">{`
git clone https://github.com/CryptoZephyr/Pich.git
cd Pich
npm install
cp .env.example .env.local   # add SERV_API_KEY
npm run dev
`}</CodeBlock>
    </>
  ),
  limitations: (
    <>
      <UL>
        <li>Only Next.js advisories, and only the 8 predicates in the vocabulary.</li>
        <li>
          The installed version is read from <C>package-lock.json</C> only. pnpm, yarn, and Bun repositories get an unknown version and Needs manual review.
        </li>
        <li>
          Hosting is unknown unless the app declares <C>pich.deploy.json</C>.
        </li>
        <li>Middleware auth detection looks for a credential check followed by a redirect or 401/403; unusual patterns may be missed.</li>
        <li>Public GitHub repositories only, one per check; anonymous GitHub reads can be rate limited.</li>
        <li>The runtime proof exists only for CVE-2025-29927 and only runs locally against two bundled fixtures.</li>
        <li>No accounts, saved history, or private repository access.</li>
      </UL>
    </>
  ),
};
