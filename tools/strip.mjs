// A frame strip: one PNG of a region captured every --every page ms during a scenario, in time
// order, each frame labelled with its page time and the logged sprite poses and positions.
//
//   node tools/strip.mjs --step people --seconds 4 --every 250
//   node tools/strip.mjs --way key --from hello --walk agents --seconds 4 --every 100 --speed 4
//   node tools/strip.mjs --step agents --region pane --seconds 3 --every 500 --zoom 1
//
// Frames cover the last --seconds of the scenario (after the load, or after he arrives at the
// last step of --walk). --region pathway (default) | pane | window | x,y,w,h in CSS px.
// --zoom N scales each frame up by whole pixels (default 2). With --speed the page clock is held
// at each frame's time, so frames fall at exact page times; at 1x a capture takes real time, so
// keep --every above about 100. Takes the scenario and site options of tools/tour.mjs.
// Writes tools/out/strip-<time>/strip.png and frames.txt (the labels).
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { cli, outDir } from "./cli.mjs";
import { launch } from "./chrome.mjs";
import { SITE_OPTIONS, openSite } from "./serve.mjs";
import { SCENARIO, runScenario, steps } from "./site.mjs";

const args = cli(import.meta.url, { ...SCENARIO, ...SITE_OPTIONS, seconds: 3, settle: 0.5, every: 250, region: "pathway", zoom: 2 });
const REGIONS = { pathway: ".pn__stage", pane: ".pn__pane", window: null };
const site = await openSite(args);
const page = await launch();

async function clip() {
  if (args.region in REGIONS) {
    const selector = REGIONS[args.region];
    return page.eval(`(() => { const r = ${selector ? `document.querySelector(${JSON.stringify(selector)})?.getBoundingClientRect()` : "null"};
      return r ? { x: r.x, y: r.y, width: r.width, height: r.height } : { x: 0, y: 0, width: innerWidth, height: innerHeight }; })()`);
  }
  const [x, y, width, height] = args.region.split(",").map(Number);
  return { x, y, width, height };
}

// The poses and positions in the log at page time t, for the sprites in the region.
const LABEL = (t) => `(() => { const last = new Map();
  for (const e of window.__sprites) if (e.t <= ${t}) last.set(e.who, e);
  return [...last.values()].filter((e) => e.pose !== "gone" && !e.who.startsWith("prop:") && (${args.region === "pathway"} ? !e.who.includes(":") : true))
    .map((e) => e.who + " " + e.pose + (e.frame !== "" ? "/" + e.frame : "") + " " + (e.y ? e.x + "," + e.y : e.x)).join("  "); })()`;

const frames = [];
await runScenario(page, site.url, args, steps(site.root), {
  every: args.every,
  async onFrame(t) {
    const png = await page.shot(null, await clip());
    frames.push({ t, png: png.toString("base64"), label: `${(t / 1000).toFixed(2)} s  ${await page.eval(LABEL(t))}` });
  },
});

// Compose in Chrome: a canvas, one frame per row, its label above it.
await page.load("about:blank");
const sheet = await page.eval(`(async () => {
  const frames = ${JSON.stringify(frames.map(({ png, label }) => ({ png, label })))};
  const zoom = ${args.zoom}, pad = 8, line = 16;
  const images = await Promise.all(frames.map((f) => new Promise((resolve) => { const i = new Image(); i.onload = () => resolve(i); i.src = "data:image/png;base64," + f.png; })));
  const width = Math.max(...images.map((i) => i.width)) * zoom + 2 * pad;
  const height = images.reduce((h, i) => h + line + i.height * zoom + pad, pad);
  const canvas = Object.assign(document.createElement("canvas"), { width, height });
  const g = canvas.getContext("2d");
  g.imageSmoothingEnabled = false;
  g.fillStyle = "#1d1914"; g.fillRect(0, 0, width, height);
  let y = pad;
  images.forEach((image, k) => {
    g.fillStyle = "#e9dcc6"; g.font = "12px monospace"; g.fillText(frames[k].label, pad, y + 12);
    y += line;
    g.drawImage(image, pad, y, image.width * zoom, image.height * zoom);
    y += image.height * zoom + pad;
  });
  return canvas.toDataURL("image/png").split(",")[1];
})()`);
const dir = outDir("strip");
writeFileSync(join(dir, "strip.png"), Buffer.from(sheet, "base64"));
writeFileSync(join(dir, "frames.txt"), frames.map((f) => f.label).join("\n") + "\n");
console.log(frames.map((f) => f.label).join("\n"));
console.log(`\n${frames.length} frames: ${join(dir, "strip.png")}`);
await page.close();
process.exit(0);
