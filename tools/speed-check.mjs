// The acceptance test for --speed: does the site play the same scenes faster, or different ones?
//
//   node tools/speed-check.mjs [--speeds 1,4] [--runs 3] [--only people,now,walk] [--verbose]
//
// Runs each scenario --runs times at each speed (seeded Math.random, ?hour=14, 1440x1000, CPU x1)
// and compares each sprite's own pose changes, in order, and the step each pathway sprite ends at
// (as "(ends)"), with the runs at the first speed (the reference). A sprite passes when it matches
// any reference run: some sprites vary between 1x runs by themselves (an idle loop on a random
// timer, a pose caught or not at the window's edge), and those are listed. The order between two
// sprites that do not wait on each other differs between 1x runs too, so it is not compared.
// Scenarios:
//   people  direct load of the people step, 16 page s
//   now     direct load of the now step, 100 page s (espresso, three fetch rounds, rest)
//   walk    load the first step, then every step by number key and back to the first: each key
//           0.5 page s after he arrived (before the next beat of any step), then 16 page s
// Prints "same" or the first difference per run, and the page and real time of key events.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { cli, outDir } from "./cli.mjs";
import { launch } from "./chrome.mjs";
import { serve } from "./serve.mjs";
import { SCENARIO, bySprite, endSteps, formatSequence, poseSequence, runScenario, steps } from "./site.mjs";

const args = cli(import.meta.url, { speeds: "1,4", runs: 3, only: "people,now,walk", verbose: false });
const speeds = String(args.speeds).split(",").map(Number);
const site = await serve();
const order = steps(site.root);
const SCENARIOS = {
  people: { step: "people", seconds: 16 },
  now: { step: "now", seconds: 100 },
  walk: { way: "key", walk: [...order.slice(1), order[0]], settle: 0.5, seconds: 16 },
};
const KEY_EVENTS = {
  people: ["truffle wake", "truffle paw", "justin pet", "justin sleep"],
  now: ["justin sip", "justin walk", "truffle wake", "justin throw", "truffle paw", "justin pet"],
  walk: [...order.slice(1), order[0]].map((s) => `at ${s}`),
};

const page = await launch();
const dir = outDir("speed-check");
const key = (e) => `${e.who} ${e.pose}`;
const seconds = (ms) => (ms / 1000).toFixed(2);
const same = (a = [], b = []) => a.length === b.length && a.every((p, i) => p === b[i]);
let failures = 0;
for (const name of String(args.only).split(",")) {
  console.log(`\n=== ${name}`);
  const runs = [];
  for (const speed of speeds) {
    for (let run = 1; run <= args.runs; run++) {
      const realStart = performance.now();
      const r = await runScenario(page, site.url, { ...SCENARIO, ...SCENARIOS[name], speed }, order);
      const wall = performance.now() - realStart;
      writeFileSync(join(dir, `${name}-${speed}x-${run}.json`), JSON.stringify(r));
      const seq = poseSequence(r.log);
      const firsts = {};
      for (const e of seq) firsts[key(e)] ??= e;
      for (const m of r.marks) firsts[m.what] = m;
      const events = KEY_EVENTS[name].map((k) => `${k} ${firsts[k] ? `${seconds(firsts[k].t)}/${seconds(firsts[k].rt)}` : "-"}`);
      const clock = r.clock ? `; ${r.clock.frames} page frames, at most ${r.clock.behindMs} ms behind` : "";
      const label = `${speed}x run ${run}`;
      console.log(`${label}: ${seq.length} pose changes${r.errors.length ? `; errors: ${r.errors.join("; ")}` : ""}`);
      console.log(`      s page/real: ${events.join(", ")}; whole run ${seconds(wall)} s real${clock}`);
      if (args.verbose) console.log(formatSequence(seq));
      runs.push({ label, speed, sprites: { ...bySprite(seq), "(ends)": [JSON.stringify(endSteps(r.log, r.pathway))] } });
    }
  }
  // A sprite whose 1x runs disagree with each other varies by itself (a loop on a random timer,
  // or a pose caught or not at the window's edge); a run passes it when it matches any 1x run.
  const reference = runs.filter((r) => r.speed === speeds[0]);
  const all = [...new Set(runs.flatMap((r) => Object.keys(r.sprites)))];
  const varies = all.filter((who) => reference.some((r) => !same(r.sprites[who], reference[0].sprites[who])));
  if (varies.length)
    console.log(
      `varies between the ${speeds[0]}x runs: ${varies.map((who) => `${who} (${new Set(reference.map((r) => (r.sprites[who] ?? []).join(" "))).size} versions)`).join(", ")}`,
    );
  for (const run of runs) {
    const problems = all
      .filter((who) => !reference.some((r) => same(r.sprites[who], run.sprites[who])))
      .map(
        (who) => `${who}: ${(run.sprites[who] ?? []).join(" ") || "(none)"}\n        ${speeds[0]}x: ${(reference[0].sprites[who] ?? []).join(" ") || "(none)"}`,
      );
    if (problems.length) failures++;
    console.log(
      `${run.label}: ${problems.length ? `DIFFERENT from every ${speeds[0]}x run\n      ${problems.join("\n      ")}` : `same as a ${speeds[0]}x run, sprite by sprite`}`,
    );
  }
}
await page.close();
console.log(`${failures ? `\n${failures} run(s) differ from the reference` : "\nall runs match the reference"}; logs: ${dir}`);
process.exit(failures ? 1 : 0);
