import { NextResponse } from "next/server";
import type { Checklist } from "@/lib/checklist";
import { evaluate } from "@/lib/engine";
import { FIXTURE_CLIENTS } from "@/lib/fixtures";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { checklist?: Checklist } | null;
  if (!body?.checklist || !Array.isArray(body.checklist.predicates) || !Array.isArray(body.checklist.affected_ranges)) {
    return NextResponse.json({ error: "A compiled checklist is required" }, { status: 400 });
  }
  const results = FIXTURE_CLIENTS.map((client) => evaluate(body.checklist!, client));
  return NextResponse.json({ results });
}
