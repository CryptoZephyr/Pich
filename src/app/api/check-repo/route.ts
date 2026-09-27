import { NextResponse } from "next/server";
import type { Checklist } from "@/lib/checklist";
import { evaluate } from "@/lib/engine";
import { loadPublicRepo, RepoError } from "@/lib/github";
import { clientKey, rateLimited } from "@/lib/rate-limit";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (rateLimited(`repo:${clientKey(req)}`, 10) || rateLimited("repo:global", 50)) {
    return NextResponse.json({ error: "Rate limited, try again in a minute" }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as { checklist?: Checklist; repoUrl?: string } | null;
  if (!body?.checklist || !Array.isArray(body.checklist.predicates) || typeof body.repoUrl !== "string") {
    return NextResponse.json({ error: "A compiled checklist and a repoUrl are required" }, { status: 400 });
  }
  try {
    const repo = await loadPublicRepo(body.repoUrl);
    const result = evaluate(body.checklist, repo);
    if (repo.truncated) result.caveats.push("GitHub truncated the file list for this very large repository; some router files may be missing.");
    return NextResponse.json({ results: [result], repo: { name: repo.name, url: repo.url, ref: repo.ref } });
  } catch (err) {
    const message = err instanceof RepoError ? err.message : "Could not read the repository from GitHub";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
