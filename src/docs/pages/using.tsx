import { Callout } from "../Callout";
import { A, C, H2, P, Table, UL } from "../Prose";

export const usingPages: Record<string, React.ReactNode> = {
  "pick-an-advisory": (
    <>
      <P>Step 1 on the page offers three choices.</P>
      <Table
        head={["Choice", "What happens"]}
        rows={[
          [<C key="a">CVE-2025-29927</C>, "Authorization bypass in Next.js middleware. The full advisory text is sent to SERV."],
          [<C key="b">CVE-2026-64642</C>, "Middleware / proxy bypass in App Router apps built with Turbopack and a single locale."],
          ["Paste your own", "Any Next.js advisory text, between 40 and 12,000 characters."],
        ]}
      />
      <P>
        Open <strong>Read the advisory text SERV will receive</strong> to see exactly what is sent. Nothing else from the page goes into the compile request.
      </P>
      <Callout kind="limitation">
        A pasted advisory can only be checked against the 8 conditions Pich knows how to observe. Anything else becomes a “not checkable from files” item,
        which pushes affected apps to Needs manual review. See <A href="/docs/reference/predicates">Predicates</A>.
      </Callout>
    </>
  ),
  "choose-apps": (
    <>
      <P>Step 2 chooses what Pich inspects.</P>
      <H2 id="demo">8 demo client apps</H2>
      <P>
        Bundled Next.js apps set up like real agency clients, with different versions, hosting, middleware, and config. Press <strong>Check the 8 demo apps</strong>.
      </P>
      <H2 id="repo">My public GitHub repo</H2>
      <P>Paste one public repository link and press <strong>Check this repo</strong>. Accepted forms:</P>
      <UL>
        <li>
          <C>https://github.com/owner/repo</C>
        </li>
        <li>
          <C>owner/repo</C>
        </li>
        <li>
          <C>https://github.com/owner/repo/tree/branch/apps/web</C> for a branch or a monorepo app folder
        </li>
      </UL>
      <Callout kind="boundary">
        Pich reads a few files through GitHub as text and never runs the repository’s code. See <A href="/docs/architecture/github-reader">Public GitHub reader</A>.
      </Callout>
    </>
  ),
  "read-the-checklist": (
    <>
      <P>Step 3 shows what SERV Reasoning extracted, grouped into:</P>
      <UL>
        <li>
          <strong>Affected versions</strong>: ranges such as <C>next ≥ 14.0.0 &lt; 14.2.25</C>.
        </li>
        <li>
          <strong>Code and config conditions</strong>: a predicate and whether it must be present or absent, for example <C>deployment_on_vercel</C> must be absent.
        </li>
        <li>
          <strong>Stated in the advisory, not checkable from files</strong>: workarounds and conditions Pich cannot observe.
        </li>
      </UL>
      <P>Every item carries the advisory quote it came from. The header shows the SERV model, latency, and request id.</P>
      <P>
        The <strong>Quote check</strong> box says whether every item quoted the advisory word for word. If SERV produced an item whose quote is not in the
        advisory, it is listed as rejected and is not used.
      </P>
    </>
  ),
  "read-verdicts": (
    <>
      <P>Step 4 lists one row per app with its verdict and a one-line reason. Open a row to see:</P>
      <UL>
        <li>
          <strong>Conditions checked</strong>: each condition with Condition met, Condition not met, or Unknown, plus file-and-line evidence such as{" "}
          <C>middleware.ts:5</C>.
        </li>
        <li>
          <strong>Unknowns</strong>: what Pich could not determine and why.
        </li>
        <li>
          <strong>Files inspected</strong>: the exact files the verdict is based on.
        </li>
      </UL>
      <Callout kind="boundary">
        “Absent within inspected scope” is not a statement that an app is safe. It means a required condition was not found in the files listed.
      </Callout>
      <P>
        Exact rules are in <A href="/docs/reference/verdicts">Verdicts</A>.
      </P>
    </>
  ),
  "client-note": (
    <>
      <P>
        Inside an open verdict, press <strong>Write client note</strong>. SERV Reasoning receives the checklist and that one verdict, and returns a headline, a
        summary, evidence, unknowns, and a next step.
      </P>
      <P>
        The server recomputes the verdict before calling SERV, so the note is built from the engine’s result, not from anything the browser sends. Press{" "}
        <strong>Rewrite note</strong> for another wording.
      </P>
      <Callout kind="note">Review the note before sending it. It is a draft built from evidence, not a security sign-off.</Callout>
    </>
  ),
  recovery: (
    <>
      <UL>
        <li>
          <strong>SERV is slow</strong>: compiling usually takes 15 to 40 seconds. The server allows up to 120 seconds.
        </li>
        <li>
          <strong>Rate limited</strong>: wait one minute and try again.
        </li>
        <li>
          <strong>A repository fails to load</strong>: the page shows the reason, such as not found, private, not a Next.js app, or a GitHub rate limit.
        </li>
      </UL>
      <P>
        Every message and its fix is listed in <A href="/docs/help/troubleshooting">Troubleshooting</A>.
      </P>
    </>
  ),
};
