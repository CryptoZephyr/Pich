"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CURATED_ADVISORIES } from "@/lib/advisories";
import type { Checklist, RejectedItem } from "@/lib/checklist";
import type { AppResult, ConditionResult, Verdict } from "@/lib/engine";
import type { ClientNote, ServMeta } from "@/lib/serv";
import { cn } from "@/lib/utils";
import { VERDICT_LABEL, VerdictBadge } from "./verdict";

type Compiled = { checklist: Checklist; rejected: RejectedItem[]; meta: ServMeta };
type NoteState = { status: "loading" } | { status: "error"; message: string } | { status: "done"; note: ClientNote; meta: ServMeta };

const CUSTOM = "custom";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({ error: `Request failed (${res.status})` }))) as T & { error?: string };
  if (!res.ok || data.error) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

function StepTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-3 text-xl">
      <span className="flex size-8 shrink-0 items-center justify-center rounded border-2 bg-primary text-sm text-primary-foreground shadow-sm">
        {n}
      </span>
      {children}
    </h3>
  );
}

function Quote({ children }: { children: string }) {
  return (
    <blockquote className="mt-1 border-l-4 border-accent bg-review-soft px-3 py-1.5 font-mono text-xs leading-relaxed text-foreground">
      “{children}”
    </blockquote>
  );
}

function ConditionRow({ c }: { c: ConditionResult }) {
  const status =
    c.status === "met"
      ? { text: "Condition met", cls: "bg-confirmed-soft" }
      : c.status === "not_met"
        ? { text: "Condition not met", cls: "bg-absent-soft" }
        : { text: "Unknown", cls: "bg-unknown-soft" };
  return (
    <li className="rounded border-2 bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">{c.label}</span>
        <span className={cn("rounded border-2 px-2 py-0.5 text-xs font-medium", status.cls)}>{status.text}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{c.note}</p>
      {c.evidence.length > 0 && (
        <ul className="mt-2 space-y-1">
          {c.evidence.map((e, i) => (
            <li key={i} className="overflow-x-auto rounded bg-secondary px-2 py-1 font-mono text-xs text-secondary-foreground">
              <span className="text-accent">
                {e.file}
                {e.line ? `:${e.line}` : ""}
              </span>{" "}
              {e.text}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function ClientCard({ result, checklist }: { result: AppResult; checklist: Checklist }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState<NoteState | null>(null);

  async function writeNote() {
    setNote({ status: "loading" });
    try {
      const data = await postJson<{ note: ClientNote; meta: ServMeta }>("/api/explain", { checklist, clientId: result.clientId });
      setNote({ status: "done", note: data.note, meta: data.meta });
    } catch (err) {
      setNote({ status: "error", message: err instanceof Error ? err.message : "Something went wrong" });
    }
  }

  return (
    <li className="rounded border-2 bg-card shadow-md">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-3 p-4 text-left hover:bg-muted/50"
      >
        <span>
          <span className="block font-head text-lg">{result.clientName}</span>
          <span className="block text-sm text-muted-foreground">{result.reason}</span>
        </span>
        <span className="flex items-center gap-3">
          <VerdictBadge verdict={result.verdict} />
          <span aria-hidden className="font-mono text-lg">
            {open ? "−" : "+"}
          </span>
        </span>
      </button>
      {open && (
        <div className="space-y-4 border-t-2 p-4">
          <div>
            <h4 className="font-head text-sm uppercase tracking-wide">Conditions checked</h4>
            <ul className="mt-2 space-y-2">
              {result.conditions.map((c) => (
                <ConditionRow key={c.id} c={c} />
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-head text-sm uppercase tracking-wide">Unknowns</h4>
            {result.unknowns.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">None for the conditions Pich can check.</p>
            ) : (
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {result.unknowns.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            )}
            {result.caveats.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {result.caveats.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs text-muted-foreground">Files inspected: {result.inspectedFiles.join(", ")}</p>
          </div>
          <div className="rounded border-2 border-dashed p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-head text-sm uppercase tracking-wide">Client note</h4>
                <p className="text-sm text-muted-foreground">SERV Reasoning writes a plain-English note from this verdict only.</p>
              </div>
              <Button size="sm" onClick={writeNote} disabled={note?.status === "loading"}>
                {note?.status === "loading" ? "Writing note…" : note?.status === "done" ? "Rewrite note" : "Write client note"}
              </Button>
            </div>
            {note?.status === "loading" && <p className="mt-3 text-sm">SERV is writing the note. This usually takes 10–20 seconds.</p>}
            {note?.status === "error" && (
              <p role="alert" className="mt-3 rounded border-2 bg-confirmed-soft p-2 text-sm">
                {note.message}
              </p>
            )}
            {note?.status === "done" && (
              <div className="mt-3 space-y-2 rounded bg-background p-3 text-sm">
                <p className="font-head">{note.note.headline}</p>
                <p>{note.note.summary}</p>
                {note.note.evidence.length > 0 && (
                  <ul className="list-disc space-y-0.5 pl-5">
                    {note.note.evidence.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
                {note.note.unknowns.length > 0 && (
                  <p>
                    <span className="font-medium">Unknowns:</span> {note.note.unknowns.join("; ")}
                  </p>
                )}
                <p>
                  <span className="font-medium">Next step:</span> {note.note.recommended_action}
                </p>
                <p className="text-xs text-muted-foreground">
                  SERV Reasoning · {note.meta.model} · {(note.meta.latencyMs / 1000).toFixed(1)}s · request {note.meta.id}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

export function Workflow() {
  const [selected, setSelected] = useState<string>(CURATED_ADVISORIES[0].id);
  const [customText, setCustomText] = useState("");
  const [phase, setPhase] = useState<"idle" | "compiling" | "checking" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [compiled, setCompiled] = useState<Compiled | null>(null);
  const [results, setResults] = useState<AppResult[] | null>(null);

  const advisoryText = selected === CUSTOM ? customText : (CURATED_ADVISORIES.find((a) => a.id === selected)?.text ?? "");
  const busy = phase === "compiling" || phase === "checking";

  async function run() {
    setError("");
    setCompiled(null);
    setResults(null);
    setPhase("compiling");
    try {
      const c = await postJson<Compiled>("/api/compile", { advisoryText });
      setCompiled(c);
      if (c.checklist.affected_ranges.length === 0) {
        setPhase("done");
        return;
      }
      setPhase("checking");
      const r = await postJson<{ results: AppResult[] }>("/api/check", { checklist: c.checklist });
      setResults(r.results);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPhase("error");
    }
  }

  const counts = results?.reduce<Record<Verdict, number>>(
    (acc, r) => ({ ...acc, [r.verdict]: acc[r.verdict] + 1 }),
    { confirmed: 0, absent_within_inspected_scope: 0, needs_manual_review: 0 },
  );

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <StepTitle n={1}>Pick an advisory</StepTitle>
        <div className="grid gap-3 md:grid-cols-3">
          {[...CURATED_ADVISORIES.map((a) => ({ id: a.id, title: a.cve, sub: a.label.split(" — ")[1] ?? a.label })), { id: CUSTOM, title: "Paste your own", sub: "Any Next.js advisory text" }].map(
            (o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setSelected(o.id)}
                aria-pressed={selected === o.id}
                disabled={busy}
                className={cn(
                  "cursor-pointer rounded border-2 p-4 text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed",
                  selected === o.id ? "bg-accent" : "bg-card",
                )}
              >
                <span className="block font-head">{o.title}</span>
                <span className="mt-1 block text-sm">{o.sub}</span>
                {o.id !== CUSTOM && <span className="mt-2 block font-mono text-xs text-muted-foreground">{o.id}</span>}
              </button>
            ),
          )}
        </div>
        {selected === CUSTOM ? (
          <Textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={8}
            maxLength={12000}
            placeholder="Paste the full advisory text: affected versions, conditions, workarounds."
            aria-label="Advisory text"
            className="min-h-40 font-mono text-xs"
          />
        ) : (
          <details className="rounded border-2 bg-card p-3 text-sm">
            <summary className="cursor-pointer font-medium">Read the advisory text SERV will receive</summary>
            <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap font-mono text-xs">{advisoryText}</pre>
          </details>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg" onClick={run} disabled={busy || advisoryText.trim().length < 40}>
            {phase === "compiling" ? "SERV is reading the advisory…" : phase === "checking" ? "Checking 8 client apps…" : "Check my client apps"}
          </Button>
          <span className="text-sm text-muted-foreground">Checks 8 bundled demo client apps. No repository code is run.</span>
        </div>
        {phase === "compiling" && (
          <p className="text-sm" role="status">
            SERV Reasoning is turning the advisory into a checklist. This usually takes 15–30 seconds.
          </p>
        )}
        {phase === "error" && (
          <p role="alert" className="rounded border-2 bg-confirmed-soft p-3 text-sm">
            {error}
          </p>
        )}
      </div>

      {compiled && (
        <div className="space-y-4">
          <StepTitle n={2}>SERV turned the advisory into a checklist</StepTitle>
          <div className="rounded border-2 bg-card p-4 shadow-md">
            <p className="font-head">{compiled.checklist.title}</p>
            <p className="text-xs text-muted-foreground">
              SERV Reasoning · {compiled.meta.model} · {(compiled.meta.latencyMs / 1000).toFixed(1)}s · request {compiled.meta.id}
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-head text-sm uppercase tracking-wide">Affected versions</h4>
                {compiled.checklist.affected_ranges.length === 0 ? (
                  <p className="mt-1 text-sm">SERV found no Next.js version ranges in this text, so there is nothing for Pich to check.</p>
                ) : (
                  <ul className="mt-1 space-y-2">
                    {compiled.checklist.affected_ranges.map((r, i) => (
                      <li key={i}>
                        <code className="font-mono text-sm">next {r.range}</code>
                        <Quote>{r.source_quote}</Quote>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="font-head text-sm uppercase tracking-wide">Code and config conditions</h4>
                {compiled.checklist.predicates.length === 0 ? (
                  <p className="mt-1 text-sm">None beyond the version range.</p>
                ) : (
                  <ul className="mt-1 space-y-2">
                    {compiled.checklist.predicates.map((p) => (
                      <li key={p.id}>
                        <span className="text-sm">
                          <code className="font-mono">{p.id}</code> must be <strong>{p.expected}</strong>
                        </span>
                        <Quote>{p.source_quote}</Quote>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {compiled.checklist.unexpressible_conditions.length > 0 && (
              <div className="mt-4">
                <h4 className="font-head text-sm uppercase tracking-wide">Stated in the advisory, not checkable from files</h4>
                <ul className="mt-1 space-y-2">
                  {compiled.checklist.unexpressible_conditions.map((u, i) => (
                    <li key={i} className="text-sm">
                      <span className="rounded border-2 bg-unknown-soft px-1.5 py-0.5 text-xs">
                        {u.kind === "mitigation" ? "Workaround" : "Needs a person"}
                      </span>{" "}
                      {u.condition}
                      <Quote>{u.source_quote}</Quote>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4 rounded border-2 border-dashed p-3 text-sm">
              <span className="font-medium">Quote check:</span>{" "}
              {compiled.rejected.length === 0
                ? "every item above quotes the advisory word for word."
                : `${compiled.rejected.length} item(s) were thrown out because their quote was not word for word in the advisory:`}
              {compiled.rejected.length > 0 && (
                <ul className="mt-1 list-disc pl-5">
                  {compiled.rejected.map((r, i) => (
                    <li key={i}>
                      {r.item}: {r.reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {phase === "checking" && (
        <p className="text-sm" role="status">
          Checking each client app&apos;s files against the checklist…
        </p>
      )}

      {results && compiled && counts && (
        <div className="space-y-4">
          <StepTitle n={3}>Verdict for each client app</StepTitle>
          <p className="text-sm">
            {(Object.keys(counts) as Verdict[]).map((v, i) => (
              <span key={v}>
                {i > 0 && " · "}
                <strong>{counts[v]}</strong> {VERDICT_LABEL[v]}
              </span>
            ))}
            . Open an app to see the code evidence, unknowns, and a client note.
          </p>
          <ul className="space-y-3">
            {results.map((r) => (
              <ClientCard key={`${compiled.meta.id}-${r.clientId}`} result={r} checklist={compiled.checklist} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
