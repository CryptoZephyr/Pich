import { Callout } from "../Callout";
import { GITHUB_URL } from "../docs-navigation";
import { A, C, H2, P, Table, UL } from "../Prose";

export const securityPages: Record<string, React.ReactNode> = {
  "trust-model": (
    <>
      <Table
        head={["Component", "Trusted for", "How it is checked"]}
        rows={[
          ["SERV Reasoning", "Reading advisory prose", "Strict schema, verbatim quote check, fixed vocabulary, polarity correction"],
          ["Pich engine", "Observing files and picking the verdict", "Deterministic tests over 16 expected results"],
          ["GitHub", "Serving the files of a public repository", "Evidence shows file and line so a reader can open the same file"],
          ["You", "Anything unknown, not checkable, or in a client note", "Pich lists these explicitly"],
        ]}
      />
      <P>Every verdict can be checked by hand: the evidence names the file and line it came from.</P>
    </>
  ),
  boundaries: (
    <>
      <Callout kind="boundary">
        <p>Pich never installs, builds, or runs code from a repository you give it. It reads a fixed list of files as text.</p>
        <p>The runtime proof builds and runs only two bundled fixtures, locally, not on the hosted site.</p>
      </Callout>
      <UL>
        <li>The browser never talks to SERV or GitHub directly; all calls go through the server routes.</li>
        <li>
          <C>/api/explain</C> recomputes the verdict on the server instead of trusting a verdict sent by the browser.
        </li>
        <li>Advisory text is capped at 12,000 characters, and every route is rate limited.</li>
      </UL>
    </>
  ),
  privacy: (
    <>
      <Table
        head={["Data", "Where it goes"]}
        rows={[
          ["Advisory text", "Sent to SERV Reasoning to compile a checklist"],
          ["Checklist and one verdict", "Sent to SERV Reasoning when you write a client note"],
          ["Repository link", "Used by the server to read public files from GitHub"],
          ["SERV_API_KEY", "Server environment only, never sent to the browser"],
        ]}
      />
      <P>Pich has no accounts and no database. It does not store advisories, results, or notes; repository files are cached in memory for up to 5 minutes.</P>
      <Callout kind="warning">Do not paste confidential material into the advisory box. It is sent to SERV Reasoning.</Callout>
      <H2 id="report">Reporting a vulnerability</H2>
      <P>
        Report privately through GitHub Security Advisories on the <A href={`${GITHUB_URL}/security`}>repository</A>. See SECURITY.md.
      </P>
    </>
  ),
};
