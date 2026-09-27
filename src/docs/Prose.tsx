export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-10 scroll-mt-24 font-head text-2xl">
      <a href={`#${id}`} className="hover:underline">
        {children}
      </a>
    </h2>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 leading-relaxed">{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="mt-3 list-disc space-y-1.5 pl-6 leading-relaxed">{children}</ul>;
}

export function OL({ children }: { children: React.ReactNode }) {
  return <ol className="mt-3 list-decimal space-y-1.5 pl-6 leading-relaxed">{children}</ol>;
}

export function C({ children }: { children: React.ReactNode }) {
  return <code className="rounded border bg-muted px-1 py-0.5 font-mono text-[0.85em]">{children}</code>;
}

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a href={href} className="font-medium text-primary underline underline-offset-2" {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
      {children}
    </a>
  );
}

export function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded border-2 shadow-md">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-muted">
          <tr>
            {head.map((h) => (
              <th key={h} className="border-b-2 px-3 py-2 font-head text-xs uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-card">
          {rows.map((r, i) => (
            <tr key={i} className="border-b last:border-b-0">
              {r.map((c, j) => (
                <td key={j} className="px-3 py-2 align-top">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Flow({ steps }: { steps: string[] }) {
  return (
    <ol className="my-5 space-y-2">
      {steps.map((s, i) => (
        <li key={s} className="flex items-start gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded border-2 bg-primary font-head text-sm text-primary-foreground">{i + 1}</span>
          <span className="rounded border-2 bg-card px-3 py-1.5 text-sm shadow-sm">{s}</span>
        </li>
      ))}
    </ol>
  );
}
