import { NextResponse } from "next/server";
import { validateChecklist } from "@/lib/checklist";
import { clientKey, rateLimited } from "@/lib/rate-limit";
import { compileAdvisory, ServError } from "@/lib/serv";

export const maxDuration = 120;

const MAX_ADVISORY_CHARS = 12_000;

export async function POST(req: Request) {
  if (rateLimited(`compile:${clientKey(req)}`, 6) || rateLimited("compile:global", 60)) {
    return NextResponse.json({ error: "Rate limited, try again in a minute" }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as { advisoryText?: unknown } | null;
  const advisoryText = typeof body?.advisoryText === "string" ? body.advisoryText.trim() : "";
  if (advisoryText.length < 40) return NextResponse.json({ error: "Paste the advisory text (at least 40 characters)" }, { status: 400 });
  if (advisoryText.length > MAX_ADVISORY_CHARS) {
    return NextResponse.json({ error: `Advisory text is limited to ${MAX_ADVISORY_CHARS} characters` }, { status: 400 });
  }
  try {
    const { checklist, meta } = await compileAdvisory(advisoryText);
    const validated = validateChecklist(checklist, advisoryText);
    return NextResponse.json({ ...validated, meta });
  } catch (err) {
    const message = err instanceof ServError || err instanceof Error ? err.message : "SERV request failed";
    return NextResponse.json({ error: `SERV Reasoning call failed: ${message}` }, { status: 502 });
  }
}
