"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded border-2 border-background/40 px-2 py-0.5 font-sans text-xs text-background hover:bg-background/10"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
