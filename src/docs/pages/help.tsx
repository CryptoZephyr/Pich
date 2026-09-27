import { A, C, H2, P, Table } from "../Prose";

const ERRORS: [string, string, string][] = [
  ["Paste the advisory text (at least 40 characters)", "The pasted advisory is empty or too short", "Paste the full advisory, including affected versions"],
  ["Advisory text is limited to 12000 characters", "The pasted text is too long", "Remove unrelated sections such as references and credits"],
  ["Rate limited, try again in a minute", "Too many requests from your address or overall", "Wait one minute"],
  ["SERV Reasoning call failed: …", "SERV returned an error, timed out, or returned invalid JSON", "Try again; the rest of the message gives SERV’s reason"],
  ["Enter a public GitHub repository link, like https://github.com/owner/repo", "The link could not be parsed", "Use one of the forms in Choose which apps to check"],
  ["Repository not found. Pich can only read public GitHub repositories.", "The repository is private, misspelled, or the branch does not exist", "Check the link in a logged-out browser"],
  ["GitHub's rate limit for anonymous reads was hit. Try again in a few minutes.", "GitHub limits unauthenticated reads", "Wait a few minutes"],
  ["This package.json does not depend on next. Pich only checks Next.js apps.", "The root is not a Next.js app, often a monorepo root", "Link to the app folder with /tree/<branch>/<path>"],
];

export const helpPages: Record<string, React.ReactNode> = {
  troubleshooting: (
    <>
      <P>These are the messages the product shows, taken from the source code.</P>
      <Table head={["Message", "Cause", "Fix"]} rows={ERRORS.map(([m, c, f]) => [<C key="m">{m}</C>, c, f])} />
      <H2 id="manual-review">Everything says Needs manual review</H2>
      <P>
        Usually the version or hosting is unknown. Check whether the repository uses pnpm, yarn, or Bun, and whether it has a <C>pich.deploy.json</C>. See{" "}
        <A href="/docs/reference/limitations">Limitations</A>.
      </P>
    </>
  ),
  faq: (
    <>
      <H2 id="what">What does Pich check?</H2>
      <P>Whether an advisory’s stated conditions are present in a Next.js app’s code and configuration, not only whether the version matches.</P>
      <H2 id="safe">Does Absent within inspected scope mean the app is safe?</H2>
      <P>No. It means a required condition was not found in the files Pich inspected.</P>
      <H2 id="ai">Does the AI decide the verdict?</H2>
      <P>No. SERV Reasoning reads the advisory. Deterministic code decides the verdict.</P>
      <H2 id="run">Does Pich run my code?</H2>
      <P>No. It reads a few files as text. The runtime proof only runs bundled demo apps, locally.</P>
      <H2 id="private">Can it check private repositories?</H2>
      <P>Not today. Only public GitHub repositories.</P>
      <H2 id="cost">Does it cost anything?</H2>
      <P>The live demo is free to use and needs no account.</P>
      <H2 id="replace">Does Pich replace a security review?</H2>
      <P>No. It tells you which clients need attention first and why.</P>
    </>
  ),
};
