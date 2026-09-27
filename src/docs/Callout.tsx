const STYLES = {
  note: { label: "Note", className: "bg-card" },
  boundary: { label: "Boundary", className: "bg-accent" },
  warning: { label: "Warning", className: "bg-destructive/10" },
  limitation: { label: "Limitation", className: "bg-muted" },
} as const;

export function Callout({ kind = "note", children }: { kind?: keyof typeof STYLES; children: React.ReactNode }) {
  const s = STYLES[kind];
  return (
    <div className={`my-4 rounded border-2 p-4 shadow-sm ${s.className}`}>
      <p className="font-head text-xs uppercase tracking-wide">{s.label}</p>
      <div className="mt-1 text-sm leading-relaxed [&>p+p]:mt-2">{children}</div>
    </div>
  );
}
