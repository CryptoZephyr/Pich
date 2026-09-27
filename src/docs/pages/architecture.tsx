import { Callout } from "../Callout";
import { CodeBlock } from "../CodeBlock";
import { repoFile } from "../docs-navigation";
import { A, C, H2, P, Table, UL } from "../Prose";

export const architecturePages: Record<string, React.ReactNode> = {
  "system-overview": (
    <>
      <P>Pich is one Next.js app on Vercel. The page and four API routes ship together; there is no separate backend, database, or queue.</P>
      <CodeBlock label="components">{`
Browser (src/app/page.tsx, src/components/pich/workflow.tsx)
   │
   ├─ POST /api/compile     → SERV Reasoning → validateChecklist()
   ├─ POST /api/check       → evaluate() on 8 bundled fixtures
   ├─ POST /api/check-repo  → GitHub (read only) → evaluate()
   └─ POST /api/explain     → evaluate() → SERV Reasoning
`}</CodeBlock>
      <Table
        head={["Component", "Owns", "Does not own"]}
        rows={[
          ["Page", "The 4-step flow, display of checklist, verdicts, evidence, notes", "Any verdict logic or secrets"],
          ["SERV Reasoning", "Reading advisory prose into a checklist; wording the client note", "The verdict, file reading, the final checklist (validation can drop items)"],
          ["validateChecklist()", "Rejecting non-verbatim quotes, unknown predicates, invalid ranges; polarity correction", "Deciding what the advisory means"],
          ["evaluate()", "Observing predicates in files and choosing the verdict", "Fetching files, calling SERV"],
          ["GitHub reader", "Fetching an allowlist of files as text from a public repo", "Installing, building, or running anything"],
          ["Fixtures", "8 demo apps bundled into the build", "Real client data"],
        ]}
      />
      <P>
        Source: <A href={repoFile("src/app/api")}>src/app/api</A>, <A href={repoFile("src/lib")}>src/lib</A>.
      </P>
    </>
  ),
  "serv-compiler": (
    <>
      <P>
        <C>compileAdvisory()</C> in <A href={repoFile("src/lib/serv.ts")}>src/lib/serv.ts</A> calls SERV Reasoning’s OpenAI-compatible chat completions API at{" "}
        <C>https://inference-api.openserv.ai/v1</C> with model <C>gpt-5.4-mini</C> (override with <C>SERV_MODEL</C>).
      </P>
      <H2 id="schema">Strict JSON schema</H2>
      <P>The response must match the <C>pich_checklist</C> schema in strict mode. The checklist has these fields:</P>
      <CodeBlock label="ts">{`
interface Checklist {
  advisory_id: string;
  title: string;
  package: string;
  affected_ranges: { range: string; source_quote: string }[];
  fixed_versions: string[];
  predicates: { id: PredicateId; expected: "present" | "absent"; rationale: string; source_quote: string }[];
  unexpressible_conditions: { condition: string; kind: "required_condition" | "mitigation"; source_quote: string }[];
  deployment_assumptions: string[];
  required_evidence: string[];
  recommended_response: string;
}
`}</CodeBlock>
      <H2 id="rules">Prompt rules</H2>
      <UL>
        <li>Only the 8 predicate ids in the vocabulary may be used.</li>
        <li>Every <C>source_quote</C> must be copied character for character from the advisory.</li>
        <li>A platform the advisory calls protected becomes <C>expected: &quot;absent&quot;</C>.</li>
        <li>Attacker actions, such as sending a crafted header, are never app conditions.</li>
        <li>Conditions the vocabulary cannot express go to <C>unexpressible_conditions</C>, marked required or mitigation.</li>
      </UL>
      <P>
        Requests also attach SERV’s <C>serv_shadow_agent</C> tool with a hint restating the quote and vocabulary rules. Set <C>SERV_SHADOW_AGENT=0</C> to
        leave it off. The client times out after 90 seconds and retries once.
      </P>
    </>
  ),
  "quote-validation": (
    <>
      <P>
        SERV output is not trusted as is. <C>validateChecklist()</C> in <A href={repoFile("src/lib/checklist.ts")}>src/lib/checklist.ts</A> runs on every
        compile and returns the cleaned checklist plus a list of rejected items with reasons.
      </P>
      <Table
        head={["Check", "Result on failure"]}
        rows={[
          ["Range is a valid npm semver range", "Range rejected"],
          ["Quote appears verbatim in the advisory (whitespace and quote marks normalized)", "Item rejected"],
          ["Predicate id is in the vocabulary", "Predicate rejected"],
          ["Quote describes protection but predicate says present", "Corrected to absent and recorded"],
          ["Same predicate and expectation twice", "Duplicate dropped"],
          ["Fixed version is valid semver", "Version dropped"],
        ]}
      />
      <Callout kind="note">
        The polarity correction exists because SERV once read “Vercel deployments are protected” as a condition that must be present. A regression test in{" "}
        <C>scripts/verify-engine.ts</C> covers it.
      </Callout>
    </>
  ),
  "deterministic-engine": (
    <>
      <P>
        <C>evaluate(checklist, app)</C> in <A href={repoFile("src/lib/engine.ts")}>src/lib/engine.ts</A> is plain TypeScript. Given the same checklist and
        files, it always returns the same result.
      </P>
      <H2 id="version">Installed version</H2>
      <P>
        The installed <C>next</C> version comes from <C>package-lock.json</C>. If only <C>package.json</C> declares it, or another lockfile is used, the version
        is unknown and the declared range is shown as evidence.
      </P>
      <H2 id="observe">Observing predicates</H2>
      <P>
        Each predicate is observed as present, absent, or unknown with evidence lines. See <A href="/docs/reference/predicates">Predicates</A> for how each one
        is read.
      </P>
      <H2 id="verdict">Choosing the verdict</H2>
      <CodeBlock label="rule">{`
if any required condition is not met        → Absent within inspected scope
else if anything is unknown or not checkable → Needs manual review
else                                         → Confirmed
`}</CodeBlock>
      <P>Mitigations from the advisory are listed as “Mitigation not inspected” and do not change the verdict.</P>
    </>
  ),
  "github-reader": (
    <>
      <P>
        <C>loadPublicRepo()</C> in <A href={repoFile("src/lib/github.ts")}>src/lib/github.ts</A> reads one public repository through the GitHub API and{" "}
        <C>raw.githubusercontent.com</C>, without a token.
      </P>
      <H2 id="files">Files read</H2>
      <UL>
        <li>
          <C>package.json</C>, <C>package-lock.json</C>
        </li>
        <li>
          <C>next.config.js|mjs|ts|cjs</C>
        </li>
        <li>
          <C>middleware.ts|js</C> and <C>proxy.ts|js</C>, at the root or in <C>src/</C>
        </li>
        <li>
          <C>pich.deploy.json</C>
        </li>
        <li>
          Presence only: <C>yarn.lock</C>, <C>pnpm-lock.yaml</C>, <C>bun.lockb</C>, <C>bun.lock</C>, and paths under <C>app/</C>, <C>pages/</C>, <C>src/app/</C>, <C>src/pages/</C>
        </li>
      </UL>
      <H2 id="limits">Limits</H2>
      <UL>
        <li>Files over 5 MB are skipped.</li>
        <li>Loaded repositories are cached for 5 minutes.</li>
        <li>Branches with slashes and monorepo subfolders are supported through <C>/tree/&lt;ref&gt;/&lt;path&gt;</C> links.</li>
        <li>A repository whose <C>package.json</C> does not depend on <C>next</C> is refused.</li>
      </UL>
      <Callout kind="boundary">Nothing is installed, built, or executed. The files are parsed as text.</Callout>
    </>
  ),
  verification: (
    <>
      <Table
        head={["Command", "What it checks"]}
        rows={[
          [<C key="1">npm test</C>, "All 16 advisory × demo app verdicts, fabricated-quote rejection, and polarity correction, using fixed checklists"],
          [<C key="2">npm run test:serv</C>, "Live SERV compiles for both advisories, then the same expected verdicts (needs SERV_API_KEY)"],
          [<C key="3">node proof/run-proof.mjs</C>, "Builds two fixtures with real Next.js releases and sends the bypass request"],
          [<C key="4">npm run lint</C>, "ESLint"],
          [<C key="5">npm run typecheck</C>, "TypeScript"],
        ]}
      />
      <P>
        Results are recorded under <A href="/docs/proof/fixture-results">Fixture results</A> and <A href="/docs/proof/runtime-proof">Runtime proof</A>.
      </P>
    </>
  ),
};
