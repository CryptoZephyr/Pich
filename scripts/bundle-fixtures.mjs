import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(process.cwd(), "fixtures");
const clients = JSON.parse(readFileSync(join(root, "clients.json"), "utf8"));

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const bundle = clients.map((client) => {
  const dir = join(root, client.id);
  const files = Object.fromEntries(
    walk(dir)
      .sort()
      .map((file) => [relative(dir, file), readFileSync(file, "utf8")]),
  );
  return { ...client, files };
});

writeFileSync(join(process.cwd(), "src/lib/fixtures.generated.json"), JSON.stringify(bundle, null, 2) + "\n");
console.log(`bundled ${bundle.length} fixture repos`);
