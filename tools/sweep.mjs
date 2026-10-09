// Screenshots of pages × window sizes, and one index.html that shows them side by side.
//
//   node tools/sweep.mjs                                   every step, at 375, 1280 and 1440x1000
//   node tools/sweep.mjs --paths "/#agents,/?design=sprites" --widths 600,900,1440x1000
//   node tools/sweep.mjs --hour 19 --reduced
//
// --paths   comma-separated paths (default every step's hash, read from PANES)
// --widths  comma-separated WIDTH or WIDTHxHEIGHT (a width alone: 812 tall under 640, else 800)
// --wait    page seconds after the load before the shot (default 2), --speed (default 4)
// --hour    ?hour= (default 14, "none" for the real hour), --reduced, --chromes N (default 2)
// --measure also measures the open pane's use of space (MEASURE in tools/site.mjs) into measure.json
// --eval    a page expression to print for each shot, e.g. --eval "document.querySelectorAll('[data-own-line]').length"
// Every shot waits for the page's images to be decoded and its smooth scrolls (a phone's row of
// steps centring the open one runs on Chrome's own clock) to stop, and shots.json records each shot with the
// boxes of what moves on timing of its own (LIVE in tools/site.mjs), for tools/pixdiff.mjs --live.
// Site: --url | --dev | --commit, as in tools/tour.mjs. Writes tools/out/sweep-<time>/.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { cli, outDir } from "./cli.mjs";
import { launch } from "./chrome.mjs";
import { SITE_OPTIONS, openSite } from "./serve.mjs";
import { LIVE, MEASURE, RECORDER, release, steps, until } from "./site.mjs";

const args = cli(import.meta.url, {
  ...SITE_OPTIONS,
  paths: "",
  widths: "375,1280,1440x1000",
  wait: 2,
  speed: 4,
  hour: "14",
  reduced: false,
  chromes: 2,
  measure: false,
  eval: "",
});
const site = await openSite(args);
const paths = args.paths ? args.paths.split(",") : steps(site.root).map((s) => `/#${s}`);
const sizes = String(args.widths)
  .split(",")
  .map((w) => {
    const [width, height] = w.split("x").map(Number);
    return { width, height: height || (width < 640 ? 812 : 800) };
  });
const shots = [];
for (const path of paths)
  for (const size of sizes) {
    const url = new URL(path, site.url);
    if (args.hour !== "none" && !url.searchParams.has("hour")) url.searchParams.set("hour", args.hour);
    const name = `${path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root"}-${size.width}x${size.height}.png`;
    shots.push({ row: path, url: url.href, size, name });
  }

const dir = outDir("sweep");
const wait = args.wait * 1000;
async function worker(queue) {
  const page = await launch();
  for (let shot; (shot = queue.shift());) {
    await page.load(shot.url, {
      ...shot.size,
      phone: shot.size.width < 640,
      reducedMotion: args.reduced,
      speed: args.speed,
      seed: 1,
      holdAt: wait,
      init: [RECORDER],
    });
    await until(page, wait);
    await page.eval("Promise.all([...document.images].map((i) => i.decode().catch(() => null))).then(() => true)");
    for (let last = null, i = 0; i < 40; i++) {
      const now = await page.eval("JSON.stringify([...document.querySelectorAll('*')].filter((el) => el.scrollLeft || el.scrollTop).map((el) => [el.scrollLeft, el.scrollTop]))");
      if (now === last) break;
      last = now;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await page.shot(join(dir, shot.name));
    shot.live = await page.eval(LIVE);
    shot.errors = [...page.errors];
    shot.sideways = await page.eval("document.documentElement.scrollWidth - document.documentElement.clientWidth");
    if (args.measure) shot.measure = await page.eval(MEASURE);
    if (args.eval) shot.evaluated = await page.eval(args.eval);
    await release(page);
    console.log(
      `${shot.name}${args.eval ? `  ${JSON.stringify(shot.evaluated)}` : ""}${shot.errors.length ? `  ERRORS: ${shot.errors.join("; ")}` : ""}${shot.sideways > 0 ? `  scrolls sideways by ${shot.sideways}px` : ""}`,
    );
  }
  await page.close();
}
const queue = [...shots];
await Promise.all(Array.from({ length: Math.min(args.chromes, shots.length) }, () => worker(queue)));

const rows = [...new Set(shots.map((s) => s.row))];
const escape = (s) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
writeFileSync(
  join(dir, "index.html"),
  `<!doctype html><meta charset="utf-8"><title>Sweep</title>
<style>body{background:#1d1914;color:#e9dcc6;font:13px ui-monospace,monospace;margin:16px}h2{font-size:14px;margin:24px 0 8px}
.row{display:flex;gap:16px;align-items:flex-start;overflow-x:auto}figure{margin:0}figcaption{margin-bottom:4px}
img{display:block;height:480px;border:1px solid #4a4136}.bad{color:#f0b35a}</style>
<p>${escape(site.url)} · wait ${args.wait} page s · hour ${escape(String(args.hour))}${args.reduced ? " · reduced motion" : ""} · click a shot for true size</p>
${rows
  .map(
    (row) =>
      `<h2>${escape(row)}</h2><div class="row">${shots
        .filter((s) => s.row === row)
        .map(
          (s) =>
            `<figure><figcaption>${s.size.width}x${s.size.height}${s.errors.length ? ` <span class="bad">errors: ${escape(s.errors.join("; "))}</span>` : ""}${s.sideways > 0 ? ` <span class="bad">scrolls sideways ${s.sideways}px</span>` : ""}</figcaption><a href="${s.name}"><img src="${s.name}" alt="${escape(s.row)} at ${s.size.width}x${s.size.height}"></a></figure>`,
        )
        .join("")}</div>`,
  )
  .join("\n")}
`,
);
writeFileSync(join(dir, "shots.json"), JSON.stringify(shots, null, 1));
if (args.measure) {
  writeFileSync(join(dir, "measure.json"), JSON.stringify(Object.fromEntries(shots.map((s) => [s.name, s.measure])), null, 1));
  const m = (s) => s.measure;
  console.log("\nshot                         pane       left right  band   gap  hole       end");
  for (const s of shots.filter(m))
    console.log(
      `${s.name.padEnd(28)} ${m(s).pane.join("x").padEnd(10)} ${String(m(s).left).padStart(4)} ${String(m(s).right).padStart(5)} ${String(m(s).band.h).padStart(5)} ${String(m(s).gap.h).padStart(5)}  ${`${m(s).hole.w}x${m(s).hole.h}`.padEnd(9)} ${String(m(s).end).padStart(5)}`,
    );
}
console.log(`\n${shots.length} shots: ${join(dir, "index.html")}`);
process.exit(0);
