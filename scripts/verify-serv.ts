import { CURATED_ADVISORIES } from "../src/lib/advisories";
import { validateChecklist } from "../src/lib/checklist";
import { evaluate } from "../src/lib/engine";
import { FIXTURE_CLIENTS } from "../src/lib/fixtures";
import { compileAdvisory } from "../src/lib/serv";
import { expectedVerdicts } from "./verify-engine";

const runs = Number(process.env.RUNS ?? 2);

async function main() {
  let failures = 0;
  for (let run = 1; run <= runs; run++) {
    for (const advisory of CURATED_ADVISORIES) {
      const { checklist, meta } = await compileAdvisory(advisory.text);
      const { checklist: valid, rejected } = validateChecklist(checklist, advisory.text);
      console.log(
        `run ${run} ${advisory.id}: ${meta.model} ${meta.latencyMs}ms id=${meta.id} ranges=${valid.affected_ranges.length} predicates=${valid.predicates
          .map((p) => `${p.id}=${p.expected}`)
          .join(",")} unexpressible=${valid.unexpressible_conditions.map((u) => u.kind).join(",")} rejected=${rejected.length}`,
      );
      for (const r of rejected) console.log(`  rejected ${r.item}: ${r.reason}`);
      for (const u of valid.unexpressible_conditions) console.log(`  ${u.kind}: ${u.condition} [${u.source_quote}]`);
      const expected = expectedVerdicts(advisory.id);
      for (const client of FIXTURE_CLIENTS) {
        const got = evaluate(valid, client).verdict;
        if (got !== expected[client.id]) {
          failures++;
          console.log(`  MISMATCH ${client.id}: got ${got}, expected ${expected[client.id]}`);
        }
      }
    }
  }
  console.log(failures === 0 ? "SERV compile: all verdicts match" : `SERV compile: ${failures} mismatches`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
