// The quick check, for every edit: `npm run check` (or node tools/check.mjs).
//
// Builds this tree frozen and runs design-system/check.mjs and src/sprites/check.mjs beside the
// build; then, for every step in PANES, a direct load at 1440x1000 and at 375 (no console errors
// or exceptions, the step's sprites there, he stands at the step, nothing scrolls sideways, a
// screenshot), and one keyboard walk through every step and back to the first. Prints a pass/fail
// table and the screenshot folder; exits 1 on any failure. The full check before a ship to main
// is still the one in docs/design-process.md.
//
// --speed (default 8: tools/speed-check.mjs found the same pose sequences at 1x on the page clock,
// 4x, 8x and 16x, and past 8x the run is bound by the page's own work), --wait page seconds after a
// load before checking (default 2), --hour (default 14), and the site options of tools/tour.mjs.
import { spawn } from "node:child_process";
import { join } from "node:path";
import { cli, outDir } from "./cli.mjs";
import { launch } from "./chrome.mjs";
import { SITE_OPTIONS, openSite, repo } from "./serve.mjs";
import { EXPECTED, PATHWAY, RECORDER, SCENARIO, endSteps, release, runScenario, siteUrl, steps, until } from "./site.mjs";

const started = performance.now();
const args = cli(import.meta.url, { ...SITE_OPTIONS, speed: 8, wait: 2, hour: "14" });
const results = [];
const record = (what, ok, detail = "") => results.push({ what, ok, detail });

const node = (script) =>
  new Promise((resolve) => {
    const child = spawn(process.execPath, [script], { cwd: repo, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("exit", (code) => resolve({ ok: code === 0, out }));
  });
const lastLines = (out) => out.trim().split("\n").slice(-6).join("\n");

const [site, designSystem, sprites] = await Promise.all([
  Promise.resolve(openSite(args)).then(
    (s) => (record("npm run build (frozen preview)", true, s.url), s),
    (e) => (record("npm run build (frozen preview)", false, e.message), null),
  ),
  node("design-system/check.mjs"),
  node("src/sprites/check.mjs"),
]);
record("node design-system/check.mjs", designSystem.ok, designSystem.ok ? "" : lastLines(designSystem.out));
record("node src/sprites/check.mjs", sprites.ok, sprites.ok ? "" : lastLines(sprites.out));

const shots = outDir("check");
if (site) {
  const order = steps(site.root);
  const wait = args.wait * 1000;

  async function loads(phone) {
    const page = await launch();
    const width = phone ? 375 : 1440;
    for (const step of order) {
      const what = `${step} at ${phone ? "375 (phone)" : "1440x1000"}`;
      const expected = EXPECTED[step];
      if (!expected) {
        record(what, false, `no expected sprites for step "${step}": add it to EXPECTED in tools/site.mjs`);
        continue;
      }
      await page.load(siteUrl(site.url, { step, hour: args.hour }), { width, phone, speed: args.speed, seed: 1, holdAt: wait, init: [RECORDER] });
      await until(page, wait);
      const log = await page.eval("window.__sprites");
      const shown = new Map();
      for (const e of log) e.pose === "gone" ? shown.delete(e.who) : shown.set(e.who, e.pose);
      const there = (want) => want.split("|").some((w) => (w.includes("=") ? shown.get(w.split("=")[0]) === w.split("=")[1] : shown.has(w)));
      const pathway = ["justin", "luibot", ...(phone ? expected.pathway : Object.values(EXPECTED).flatMap((x) => x.pathway))];
      const missing = [
        ...pathway.filter((want) => !there(want)),
        ...(await page.eval(`${JSON.stringify(expected.pane)}.filter((s) => !document.querySelector(".pn__pane " + s))`)),
      ];
      const at = endSteps(log, await page.eval(PATHWAY)).justin;
      const sideways = await page.eval("document.documentElement.scrollWidth - document.documentElement.clientWidth");
      const shot = join(shots, `${step}-${phone ? "375" : "1440"}.png`);
      await page.shot(shot);
      const problems = [
        ...page.errors,
        ...(missing.length ? [`missing ${missing.join(", ")} (shown: ${[...shown].map(([who, pose]) => `${who}=${pose}`).join(", ")})`] : []),
        ...(at === step ? [] : [`he is at ${at}, not ${step}`]),
        ...(sideways > 0 ? [`the page scrolls sideways by ${sideways}px`] : []),
      ];
      await release(page);
      record(what, !problems.length, problems.join("; "));
    }
    await page.close();
  }

  async function walk() {
    const page = await launch();
    const route = [...order.slice(1), order[0]];
    const what = `walk by keys ${[order[0], ...route].join(" > ")}`;
    try {
      const r = await runScenario(page, site.url, { ...SCENARIO, way: "key", walk: route, settle: 0.5, seconds: 1, speed: args.speed }, order);
      const arrivals = r.marks.filter((m) => m.what.startsWith("at ")).map((m) => `${m.what.slice(3)} ${(m.t / 1000).toFixed(1)}s`);
      record(what, !r.errors.length, r.errors.length ? r.errors.join("; ") : `arrived: ${arrivals.join(", ")} (page time)`);
    } catch (e) {
      record(what, false, e.message);
    }
    await page.close();
  }

  await Promise.all([loads(false), loads(true), walk()]);
}

const width = Math.max(...results.map((r) => r.what.length));
console.log(results.map((r) => `${r.ok ? "pass" : "FAIL"}  ${r.what.padEnd(width)}  ${r.detail.replaceAll("\n", "\n      ")}`).join("\n"));
const failed = results.filter((r) => !r.ok).length;
console.log(
  `\n${failed ? `${failed} FAILED` : "all passed"} in ${((performance.now() - started) / 1000).toFixed(1)} s (speed ${args.speed}x); screenshots: ${shots}`,
);
process.exit(failed ? 1 : 0);
