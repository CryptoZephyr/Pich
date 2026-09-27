import type { RepoFiles } from "./engine";

export class RepoError extends Error {}

export interface LoadedRepo {
  id: string;
  name: string;
  url: string;
  ref: string;
  root: string;
  files: RepoFiles;
  truncated: boolean;
}

const READ_FILES = [
  "package.json",
  "package-lock.json",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "next.config.cjs",
  "middleware.ts",
  "middleware.js",
  "src/middleware.ts",
  "src/middleware.js",
  "proxy.ts",
  "proxy.js",
  "src/proxy.ts",
  "src/proxy.js",
  "pich.deploy.json",
];
const PRESENCE_ONLY = ["yarn.lock", "pnpm-lock.yaml", "bun.lockb", "bun.lock"];
const ROUTER_PREFIXES = ["app/", "pages/", "src/app/", "src/pages/"];
const MAX_FILE_BYTES = 5_000_000;
const CACHE_TTL_MS = 5 * 60_000;

const cache = new Map<string, { at: number; repo: LoadedRepo }>();

function parseRepoUrl(input: string): { owner: string; repo: string; rest: string[] } {
  const trimmed = input.trim().replace(/\.git$/, "").replace(/\/+$/, "");
  const m = trimmed.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+)(?:\/tree\/(.+))?$/i) ??
    trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (!m) throw new RepoError("Enter a public GitHub repository link, like https://github.com/owner/repo");
  return { owner: m[1], repo: m[2], rest: m[3] ? m[3].split("/").filter(Boolean) : [] };
}

async function gh(path: string): Promise<Response> {
  return fetch(`https://api.github.com${path}`, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "pich-dev" },
    cache: "no-store",
  });
}

async function fetchTree(owner: string, repo: string, rest: string[]) {
  const candidates: { ref: string; root: string }[] = [];
  for (let k = 1; k <= Math.min(rest.length, 4); k++) {
    candidates.push({ ref: rest.slice(0, k).join("/"), root: rest.slice(k).join("/") });
  }
  if (candidates.length === 0) candidates.push({ ref: "HEAD", root: "" });
  for (const c of candidates) {
    const res = await gh(`/repos/${owner}/${repo}/git/trees/${encodeURIComponent(c.ref)}?recursive=1`);
    if (res.ok) {
      const data = (await res.json()) as { tree: { path: string; type: string; size?: number }[]; truncated: boolean };
      return { ...c, tree: data.tree, truncated: data.truncated };
    }
    if (res.status === 403 || res.status === 429) {
      throw new RepoError("GitHub's rate limit for anonymous reads was hit. Try again in a few minutes.");
    }
    if (res.status !== 404 && res.status !== 422) throw new RepoError(`GitHub returned ${res.status}`);
  }
  throw new RepoError("Repository not found. Pich can only read public GitHub repositories.");
}

export async function loadPublicRepo(input: string): Promise<LoadedRepo> {
  const { owner, repo, rest } = parseRepoUrl(input);
  const key = `${owner}/${repo}/${rest.join("/")}`.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.repo;

  const { ref, root, tree, truncated } = await fetchTree(owner, repo, rest);
  const prefix = root ? `${root}/` : "";
  const blobs = new Map(
    tree.filter((t) => t.type === "blob" && t.path.startsWith(prefix)).map((t) => [t.path.slice(prefix.length), t.size ?? 0]),
  );
  if (!blobs.has("package.json")) {
    throw new RepoError(
      root
        ? `No package.json in ${root}/. Link to the folder that contains the Next.js app.`
        : "No package.json at the repository root. For a monorepo, link to the app folder (…/tree/main/apps/web).",
    );
  }

  const files: RepoFiles = {};
  for (const [path] of blobs) {
    if (ROUTER_PREFIXES.some((p) => path.startsWith(p)) || PRESENCE_ONLY.includes(path)) files[path] = "";
  }
  const toRead = READ_FILES.filter((f) => blobs.has(f) && (blobs.get(f) ?? 0) <= MAX_FILE_BYTES);
  await Promise.all(
    toRead.map(async (f) => {
      const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${prefix}${f}`, { cache: "no-store" });
      if (!res.ok) throw new RepoError(`Could not read ${f} from GitHub (${res.status})`);
      files[f] = await res.text();
    }),
  );

  const pkg = JSON.parse(files["package.json"]) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  if (!pkg.dependencies?.next && !pkg.devDependencies?.next) {
    throw new RepoError("This package.json does not depend on next. Pich only checks Next.js apps.");
  }

  const loaded: LoadedRepo = {
    id: "repo",
    name: `${owner}/${repo}${root ? `/${root}` : ""}`,
    url: `https://github.com/${owner}/${repo}${rest.length ? `/tree/${rest.join("/")}` : ""}`,
    ref,
    root,
    files,
    truncated,
  };
  cache.set(key, { at: Date.now(), repo: loaded });
  return loaded;
}
