import { CopyButton } from "./CopyButton";

export function CodeBlock({ children, label }: { children: string; label?: string }) {
  const code = children.replace(/^\n/, "").replace(/\s+$/, "");
  return (
    <div className="my-4 rounded border-2 bg-foreground text-background shadow-md">
      <div className="flex items-center justify-between border-b-2 border-background/20 px-3 py-1.5">
        <span className="font-mono text-xs text-background/70">{label ?? "text"}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
