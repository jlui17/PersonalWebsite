// Plays one scenario and logs every sprite change: pose, frame and position, in page and real time.
//
//   node tools/tour.mjs --step people                      direct load of a step's hash
//   node tools/tour.mjs --way key --walk agents,now,people,hello --speed 4
//   node tools/tour.mjs --step now --way tap --width 375   tapped on a phone (placed, no walk)
//   node tools/tour.mjs --step people --runs 5 --cpu 4 --expect "truffle paw,justin pet"
//
// Scenario (see SCENARIO in tools/site.mjs): --step --way load|key|click|tap --from --walk
//   --settle <page s> --seconds <page s> --width --height --phone --hour <0..23|none> --top --agents
//   --reduced --cpu <throttle> --speed <x> --seed <n|none>
// Site: --url <running server> | --dev | --commit <rev>; default a frozen build of this tree.
// --runs N plays it N times and prints, for --expect (sprite poses that must happen in that order),
// "seen N of M", and how many runs had the same pose sequence as the first.
// Prints the pose sequence with the marks (load, key, arrival); writes the full logs as JSON to
// tools/out/tour-<time>/run-<n>.json. --quiet prints only the summary.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { cli, outDir } from "./cli.mjs";
import { launch } from "./chrome.mjs";
import { SITE_OPTIONS, openSite } from "./serve.mjs";
import { SCENARIO, bySprite, endSteps, formatSequence, poseSequence, runScenario, steps } from "./site.mjs";

const args = cli(import.meta.url, { ...SCENARIO, ...SITE_OPTIONS, runs: 1, expect: "", quiet: false });
if (args.cpu > 1 && args.speed > 1)
  console.log(`note: under --speed every page frame is 1/60 s, so the stalls --cpu ${args.cpu} is for never reach the site; use --cpu with --speed 1`);
const site = await openSite(args);
const order = steps(site.root);
const expect = args.expect ? args.expect.split(",").map((s) => s.trim()) : [];
const dir = outDir("tour");
const page = await launch();

const seenInOrder = (seq) => {
  let i = 0;
  for (const e of seq) if (i < expect.length && `${e.who} ${e.pose}` === expect[i]) i++;
  return i === expect.length;
};

let first,
  same = 0,
  seen = 0;
for (let run = 1; run <= args.runs; run++) {
  const r = await runScenario(page, site.url, args, order);
  writeFileSync(join(dir, `run-${run}.json`), JSON.stringify(r, null, 1));
  const seq = poseSequence(r.log);
  const flat = JSON.stringify(bySprite(seq));
  first ??= flat;
  same += flat === first;
  const ok = seenInOrder(seq);
  seen += ok;
  if (!args.quiet) {
    const lines = [
      ...seq.map((e) => ({ t: e.t, line: formatSequence([e]) })),
      ...r.marks.map((m) => ({ t: m.t, line: `${formatSequence([{ ...m, who: "--", pose: m.what }])}` })),
    ];
    console.log(
      `\n=== run ${run}: ${r.url}\n${lines
        .sort((a, b) => a.t - b.t)
        .map((l) => l.line)
        .join("\n")}`,
    );
  }
  console.log(
    `run ${run}: ${seq.length} pose changes; ends ${JSON.stringify(endSteps(r.log, r.pathway))}${expect.length ? `; expected ${ok ? "seen" : "NOT seen"}` : ""}${r.clock ? `; page time at most ${r.clock.behindMs} ms behind` : ""}${r.errors.length ? `\n  errors: ${r.errors.join("\n  ")}` : ""}`,
  );
}
if (args.runs > 1)
  console.log(
    `\nsame pose sequence as run 1 (each sprite's own order): ${same} of ${args.runs}${expect.length ? `\n"${expect.join(", ")}" seen ${seen} of ${args.runs}` : ""}`,
  );
console.log(`logs: ${dir}`);
await page.close();
process.exit(expect.length && seen < args.runs ? 1 : 0);
