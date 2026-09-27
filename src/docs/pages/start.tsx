import { Callout } from "../Callout";
import { LIVE_URL } from "../docs-navigation";
import { A, C, Flow, H2, OL, P, UL } from "../Prose";

export const startPages: Record<string, React.ReactNode> = {
  introduction: (
    <>
      <P>
        Pich tells an agency which of its client Next.js apps a security advisory actually affects. It reads the advisory with SERV Reasoning, checks
        each app’s code and configuration for the advisory’s exact conditions, and returns one verdict per app with the lines of code behind it.
      </P>
      <H2 id="who">Who it is for</H2>
      <P>Small agencies and freelancers who look after roughly 10 to 40 client Next.js apps and have to answer “are we affected?” for each client when an advisory lands.</P>
      <H2 id="mental-model">The mental model</H2>
      <P>SERV reads the advisory. Plain code decides the verdict. Every verdict shows its evidence and says what Pich could not determine.</P>
      <H2 id="invariant">The rule Pich never breaks</H2>
      <Callout kind="boundary">
        <p>Pich never calls an app safe. The best outcome it reports is “Absent within inspected scope”: at least one required condition was not found in the files it inspected.</p>
        <p>Pich never installs, builds, or runs code from a repository you give it.</p>
      </Callout>
      <H2 id="next">Where to go next</H2>
      <UL>
        <li>
          <A href="/docs/start/how-it-works">How it works</A> for the lifecycle in one picture.
        </li>
        <li>
          <A href="/docs/start/try-pich">Try Pich</A> to run it on the live site in about two minutes.
        </li>
        <li>
          <A href="/docs/reference/verdicts">Verdicts</A> for the exact rules behind each result.
        </li>
      </UL>
    </>
  ),
  "why-pich": (
    <>
      <P>
        When a Next.js advisory lands, version scanners flag every app on an affected version. For an agency, that turns one advisory into one urgent
        email per client.
      </P>
      <P>
        Most advisories have conditions beyond the version. CVE-2025-29927, for example, only matters if the app enforces authorization in middleware, and
        the advisory says Vercel-hosted deployments are automatically protected. A version scanner does not check either of those.
      </P>
      <H2 id="question">The question Pich answers</H2>
      <P>For each client app: are this advisory’s stated conditions present in the code and configuration, and what is the evidence?</P>
      <H2 id="serv">Why SERV Reasoning is needed</H2>
      <P>
        Advisories are prose. Without a model to read them, Pich could only check advisories someone encoded by hand in advance, which is the scanner problem
        again. SERV turns new advisory text into a typed checklist that the engine can test. SERV never picks the verdict.
      </P>
      <Callout kind="limitation">Pich does not replace a security review. It narrows the list of clients that need one and shows the reason for each.</Callout>
    </>
  ),
  "how-it-works": (
    <>
      <P>Every check follows the same lifecycle.</P>
      <Flow
        steps={[
          "Advisory text: pick a supported advisory or paste your own",
          "SERV Reasoning compiles it into a typed checklist",
          "Quote check: every item must quote the advisory word for word, or it is rejected",
          "Deterministic engine reads each app’s files and observes each condition",
          "Verdict per app, with file-and-line evidence and unknowns",
          "SERV Reasoning writes a client note from that verdict only",
        ]}
      />
      <H2 id="who-decides">Who decides what</H2>
      <UL>
        <li>
          <strong>SERV Reasoning</strong> decides what the advisory says: affected version ranges, conditions, and conditions that cannot be checked from files.
        </li>
        <li>
          <strong>Pich’s engine</strong> decides what the app contains and which verdict follows. It is ordinary TypeScript with fixed rules.
        </li>
        <li>
          <strong>A person</strong> decides what to do about “Needs manual review” and anything listed as not checkable.
        </li>
      </UL>
      <P>
        Technical detail lives under <A href="/docs/architecture/system-overview">Architecture</A>.
      </P>
    </>
  ),
  "try-pich": (
    <>
      <P>
        Open <A href={LIVE_URL}>{LIVE_URL.replace("https://", "")}</A> and scroll to <strong>Try Pich</strong>. No account is needed.
      </P>
      <OL>
        <li>
          Under <strong>1 Pick an advisory</strong>, keep <C>CVE-2025-29927</C> selected.
        </li>
        <li>
          Under <strong>2 Choose which apps to check</strong>, keep <strong>8 demo client apps</strong> and press <strong>Check the 8 demo apps</strong>.
        </li>
        <li>Wait while SERV reads the advisory. This usually takes 15 to 40 seconds.</li>
        <li>
          Read <strong>3 What SERV read from the advisory</strong>. Each item shows the quote it came from.
        </li>
        <li>
          Under <strong>4 Verdict for each demo app</strong>, expect 1 Confirmed, 6 Absent within inspected scope, and 1 Needs manual review.
        </li>
        <li>
          Open <strong>Acme Dental</strong> to see the evidence, then press <strong>Write client note</strong>.
        </li>
      </OL>
      <Callout kind="note">
        SERV output can vary slightly between runs. The verdicts come from the engine, and <A href="/docs/proof/fixture-results">Fixture results</A> lists the
        expected result for every demo app.
      </Callout>
    </>
  ),
};
