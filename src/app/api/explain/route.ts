import { NextResponse } from "next/server";
import type { Checklist } from "@/lib/checklist";
import { evaluate } from "@/lib/engine";
import { FIXTURE_CLIENTS } from "@/lib/fixtures";
import { clientKey, rateLimited } from "@/lib/rate-limit";
import { explainResult, ServError } from "@/lib/serv";

export const maxDuration = 120;

export async function POST(req: Request) {
  if (rateLimited(`explain:${clientKey(req)}`, 10) || rateLimited("explain:global", 80)) {
    return NextResponse.json({ error: "Rate limited, try again in a minute" }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as { checklist?: Checklist; clientId?: string } | null;
  const client = FIXTURE_CLIENTS.find((c) => c.id === body?.clientId);
  if (!body?.checklist || !client) return NextResponse.json({ error: "checklist and a known clientId are required" }, { status: 400 });
  const result = evaluate(body.checklist, client);
  try {
    const { note, meta } = await explainResult(body.checklist, result);
    return NextResponse.json({ note, meta, result });
  } catch (err) {
    const message = err instanceof ServError || err instanceof Error ? err.message : "SERV request failed";
    return NextResponse.json({ error: `SERV Reasoning call failed: ${message}` }, { status: 502 });
  }
}
