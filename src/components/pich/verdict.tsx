import type { Verdict } from "@/lib/engine";
import { cn } from "@/lib/utils";

export const VERDICT_LABEL: Record<Verdict, string> = {
  confirmed: "Confirmed",
  absent_within_inspected_scope: "Absent within inspected scope",
  needs_manual_review: "Needs manual review",
};

export const VERDICT_MEANING: Record<Verdict, string> = {
  confirmed: "The advisory's conditions were found in this app's code and config. This is not proof an attack happened.",
  absent_within_inspected_scope:
    "At least one required condition was not found in the files Pich inspected. This is not a safety guarantee.",
  needs_manual_review: "Pich could not decide from the files alone. A person needs to check the listed unknowns.",
};

const STYLE: Record<Verdict, string> = {
  confirmed: "bg-confirmed text-white",
  absent_within_inspected_scope: "bg-absent text-white",
  needs_manual_review: "bg-review text-foreground",
};

const MARK: Record<Verdict, string> = {
  confirmed: "!",
  absent_within_inspected_scope: "–",
  needs_manual_review: "?",
};

export function VerdictBadge({ verdict, className }: { verdict: Verdict; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded border-2 px-2.5 py-1 font-head text-xs uppercase tracking-wide shadow-sm",
        STYLE[verdict],
        className,
      )}
    >
      <span aria-hidden className="font-mono text-sm leading-none">
        {MARK[verdict]}
      </span>
      {VERDICT_LABEL[verdict]}
    </span>
  );
}
