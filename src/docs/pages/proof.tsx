import { Callout } from "../Callout";
import { CodeBlock } from "../CodeBlock";
import { GITHUB_URL, LIVE_URL, repoFile } from "../docs-navigation";
import { A, C, H2, P, Table } from "../Prose";

const V1 = ["Confirmed", "Absent", "Absent", "Absent", "Needs manual review", "Absent", "Absent", "Absent"];
const V2 = ["Absent", "Absent", "Absent", "Absent", "Absent", "Confirmed", "Needs manual review", "Absent"];
const APPS = [
  ["Acme Dental", "14.2.24", "self-hosted", "middleware with session check"],
  ["Brightline Legal", "14.2.25", "self-hosted", "middleware with session check"],
  ["Cobalt Coffee", "14.2.24", "vercel", "middleware"],
  ["Dune Outfitters", "15.1.0", "self-hosted", "middleware without an auth check"],
  ["Evergreen Clinic", "15.2.0", "not declared", "middleware"],
  ["Fjord Studio", "16.1.0", "self-hosted", "proxy, Turbopack build, 1 locale"],
  ["Granite Realty", "16.1.0", "self-hosted", "proxy, custom build script, 1 locale"],
  ["Harbor Bikes", "16.1.0", "self-hosted", "proxy, Turbopack build, 3 locales"],
];

export const proofPages: Record<string, React.ReactNode> = {
  "live-deployment": (
    <>
      <Table
        head={["What", "Where", "What it proves"]}
        rows={[
          ["Web app and API", <A key="l" href={LIVE_URL}>{LIVE_URL}</A>, "The full flow runs publicly, without login"],
          ["Source", <A key="g" href={GITHUB_URL}>{GITHUB_URL}</A>, "The code behind every claim in these docs"],
        ]}
      />
      <P>To check it yourself, follow <A href="/docs/start/try-pich">Try Pich</A>. Each SERV response shows its model and request id.</P>
      <Callout kind="limitation">The hosted site runs static checks only. It never runs the exploit.</Callout>
    </>
  ),
  "runtime-proof": (
    <>
      <P>
        <A href={repoFile("proof/run-proof.mjs")}>proof/run-proof.mjs</A> installs real Next.js releases into two bundled demo apps, builds and starts them locally, and requests
        the protected <C>/admin</C> page with and without the bypass header.
      </P>
      <CodeBlock label="header">{`x-middleware-subrequest: middleware:middleware:middleware:middleware:middleware`}</CodeBlock>
      <Table
        head={["Demo app", "next", "Normal request", "With bypass header"]}
        rows={[
          ["Acme Dental (affected)", "14.2.24", "307 redirect to login", "200 admin page served"],
          ["Brightline Legal (fixed)", "14.2.25", "307 redirect to login", "307 redirect to login"],
        ]}
      />
      <P>
        Recorded in <A href={repoFile("proof/proof-result.json")}>proof/proof-result.json</A> at <C>2026-09-27T21:05:05Z</C> with <C>pass: true</C>.
      </P>
      <H2 id="proves">What this proves and what it does not</H2>
      <P>
        It proves that the conditions Pich checks for CVE-2025-29927 matter: the same app is exposed on 14.2.24 and not on 14.2.25. It does not prove anything about a real
        client’s production deployment, and it was not run against any public repository.
      </P>
    </>
  ),
  "fixture-results": (
    <>
      <P>
        Expected verdicts, checked by <C>npm test</C> with fixed checklists and by <C>npm run test:serv</C> with live SERV compiles.
      </P>
      <Table
        head={["Demo app", "next", "Hosting", "Setup", "CVE-2025-29927", "CVE-2026-64642"]}
        rows={APPS.map((a, i) => [...a, V1[i], V2[i]])}
      />
      <P>“Absent” is short for Absent within inspected scope.</P>
      <P>
        Fixture sources: <A href={repoFile("fixtures")}>fixtures/</A>.
      </P>
    </>
  ),
};
