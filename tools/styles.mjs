// Dumps the computed style of every element on the page (and its ::before and ::after where they
// draw), for proof that a CSS change left what is drawn as it was; or compares two dumps.
//
//   node tools/styles.mjs                                  every step at 375, 1280 and 1440x1000
//   node tools/styles.mjs --widths 375,768,1440x1000 --hour 19
//   node tools/styles.mjs --compare tools/out/styles-A tools/out/styles-B
//
// Pages, windows and timing are those of tools/sweep.mjs (--paths --widths --wait --speed --hour
// --reduced, and the site options), so a dump and a sweep of one commit show the same moment.
// An element is named by its path from <body> (tag, classes, place among its siblings); inside an
// <svg> only the svg itself is dumped (a sprite's pixels are hundreds of rects).
// --ignore  with --compare, a regular expression for element names to leave out (what is lit or
//           placed on timing of its own, such as "pn-upto" for the status sign).
// --compare prints, per page, the elements found on one side only and every property that differs;
// exits 1 if anything does. Writes tools/out/styles-<time>/<page>.json.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cli, outDir } from "./cli.mjs";
import { launch } from "./chrome.mjs";
import { SITE_OPTIONS, openSite } from "./serve.mjs";
import { RECORDER, release, steps, until } from "./site.mjs";

const DUMP = `(() => {
  const props = [...getComputedStyle(document.body)].sort();
  const out = {};
  const name = (el) => {
    const parts = [];
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const cls = typeof e.className === "string" && e.className.trim() ? "." + e.className.trim().split(/\\s+/).join(".") : "";
      parts.unshift(e.tagName.toLowerCase() + cls + ":" + [...e.parentElement.children].indexOf(e));
    }
    return parts.join(" > ");
  };
  for (const el of document.body.querySelectorAll("*")) {
    if (el.closest("svg") && el.tagName.toLowerCase() !== "svg") continue;
    for (const pseudo of [null, "::before", "::after"]) {
      const s = getComputedStyle(el, pseudo);
      if (pseudo && (s.content === "none" || s.content === "normal")) continue;
      out[name(el) + (pseudo ?? "")] = props.map((p) => s.getPropertyValue(p)).join("\\u0001");
    }
  }
  return { props, out };
})()`;

const args = cli(import.meta.url, { ...SITE_OPTIONS, paths: "", widths: "375,1280,1440x1000", wait: 2, speed: 4, hour: "14", reduced: false, compare: false, ignore: "" });

if (args.compare) {
  const [a, b] = args._;
  let differs = 0;
  for (const file of readdirSync(a).filter((f) => f.endsWith(".json")).sort()) {
    const A = JSON.parse(readFileSync(join(a, file), "utf8"));
    let B;
    try {
      B = JSON.parse(readFileSync(join(b, file), "utf8"));
    } catch {
      console.log(`${file}: missing in ${b}`);
      differs++;
      continue;
    }
    const skip = args.ignore ? new RegExp(args.ignore) : null;
    for (const side of [A, B]) for (const key of Object.keys(side.out)) if (skip?.test(key)) delete side.out[key];
    const lines = [];
    for (const key of Object.keys(A.out)) if (!(key in B.out)) lines.push(`  only in A: ${key}`);
    for (const key of Object.keys(B.out)) if (!(key in A.out)) lines.push(`  only in B: ${key}`);
    for (const key of Object.keys(A.out)) {
      if (!(key in B.out) || A.out[key] === B.out[key]) continue;
      const va = A.out[key].split("\u0001");
      const vb = Object.fromEntries(B.props.map((p, i) => [p, B.out[key].split("\u0001")[i]]));
      for (const [i, p] of A.props.entries()) if (va[i] !== vb[p]) lines.push(`  ${key}\n    ${p}: ${va[i]}  ->  ${vb[p]}`);
    }
    differs += lines.length > 0;
    console.log(`${file}: ${Object.keys(A.out).length} elements, ${lines.length ? `${lines.length} differences\n${lines.join("\n")}` : "the same"}`);
  }
  process.exit(differs ? 1 : 0);
}

const site = await openSite(args);
const paths = args.paths ? args.paths.split(",") : steps(site.root).map((s) => `/#${s}`);
const dir = outDir("styles");
const page = await launch();
for (const path of paths)
  for (const w of String(args.widths).split(",")) {
    const [width, height] = w.split("x").map(Number);
    const size = { width, height: height || (width < 640 ? 812 : 800) };
    const url = new URL(path, site.url);
    if (args.hour !== "none" && !url.searchParams.has("hour")) url.searchParams.set("hour", args.hour);
    await page.load(url.href, { ...size, phone: width < 640, reducedMotion: args.reduced, speed: args.speed, seed: 1, holdAt: args.wait * 1000, init: [RECORDER] });
    await until(page, args.wait * 1000);
    const dump = await page.eval(DUMP);
    await release(page);
    const file = `${path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root"}-${size.width}x${size.height}.json`;
    writeFileSync(join(dir, file), JSON.stringify(dump));
    console.log(`${file}: ${Object.keys(dump.out).length} elements`);
  }
await page.close();
console.log(`\n${dir}`);
process.exit(0);
