// Usage: node design-system/sprites/export.mjs   (writes the SVGs and index.html next to this file from the sheets in src/)
//
// One static SVG per character, action and frame (<character>-<action>-<frame>.svg)
// and one animated SVG per multi-frame action (<character>-<action>.svg), plus the
// design-system card (index.html) that shows them all. The pixels come straight
// from the sheets; the run merging, the outfit palette and the outer outline mirror
// src/sprites/Sprite.jsx so the files match the site exactly. An <img> cannot read
// the page's --sprite-outline, so its value is read from ../tokens.css and written
// into the files: they are drawn for the dark ground of panes.

import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import justin from "../../src/sprites/justin.js";
import truffle from "../../src/sprites/truffle.js";
import luibot from "../../src/sprites/luibot.js";
import luibuilder from "../../src/sprites/luibuilder.js";
import props from "../../src/sprites/props.js";
import { desk } from "../../src/sprites/justin.js";
import ball from "../../src/designs/panes/ball.js";

const outDir = dirname(fileURLToPath(import.meta.url));

// Sprite.jsx falls back to 1200 ms when an action gives neither durations nor interval.
const DEFAULT_INTERVAL = 1200;
// A last duration this long means "play once and hold the last frame" (the site uses 600000).
const HOLD_MS = 60_000;

const tokens = await readFile(join(outDir, "../tokens.css"), "utf8");
const spriteOutline = /--sprite-outline:\s*(#[0-9a-f]{6})/i.exec(tokens)[1];

// File names are kebab-case: the sheet `shoeRack` exports as `shoe-rack-…svg`.
const kebab = (name) => name.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`);

// Exported characters: the sheet plus the outfit whose palette overrides apply. The desk takes no
// outfit (none of its cells is clothing). `inkOutline`: panes draws the ball with its own small
// renderer, which keeps the ink outline, so its files keep it too.
export const characters = {
  "justin-overshirt": { sheet: justin, outfit: "overshirt" },
  "justin-hoodie": { sheet: justin, outfit: "hoodie" },
  truffle: { sheet: truffle },
  luibot: { sheet: luibot },
  luibuilder: { sheet: luibuilder },
  desk: { sheet: desk },
  ball: { sheet: ball, inkOutline: true },
  ...Object.fromEntries(Object.entries(props).map(([name, sheet]) => [kebab(name), { sheet }])),
};

export const paletteFor = ({ sheet, outfit, inkOutline }) => ({
  ...sheet.palette,
  ...sheet.outfits?.[outfit],
  outline: inkOutline ? sheet.palette.k : spriteOutline,
});

// Same as Sprite.jsx: the outer outline is the ink within 2 cells of empty canvas.
function isOuterOutline(rows, palette, x, y) {
  if (palette[rows[y][x]] !== palette.k) return false;
  for (let dy = -2; dy <= 2; dy += 1)
    for (let dx = -2; dx <= 2; dx += 1) if (!palette[rows[y + dy]?.[x + dx]]) return true;
  return false;
}

// Same as Sprite.jsx: each horizontal run of one colour becomes one rect.
export function runs(rows, y, palette) {
  const row = rows[y];
  const fillAt = (x) => (isOuterOutline(rows, palette, x, y) ? palette.outline : palette[row[x]]);
  const out = [];
  for (let x = 0; x < row.length; ) {
    const fill = fillAt(x);
    let end = x + 1;
    while (end < row.length && fillAt(end) === fill) end += 1;
    if (fill) out.push({ x, width: end - x, fill });
    x = end;
  }
  return out;
}

// One <path> per colour, each run a 1-unit-tall box in it: the same pixels as a <rect> per run
// in a quarter of the bytes. No two runs overlap, so the order of the colours does not matter.
function pixels(rows, palette) {
  const byFill = new Map();
  rows.forEach((_, y) => {
    for (const { x, width, fill } of runs(rows, y, palette))
      byFill.set(fill, `${byFill.get(fill) ?? ""}M${x} ${y}h${width}v1h-${width}z`);
  });
  return [...byFill].map(([fill, d]) => `<path fill="${fill}" d="${d}"/>`).join("");
}

const svgOpen = (width, height) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">`;

export function staticSvg(rows, palette) {
  return `${svgOpen(rows[0].length, rows.length)}${pixels(rows, palette)}</svg>\n`;
}

// Frame timing as Sprite.jsx plays it: durations[i] when given, else the interval.
export function frameDurations(action) {
  const { frames, interval = DEFAULT_INTERVAL, durations } = action;
  return frames.map((_, i) => durations?.[i] ?? interval);
}

export const playsOnce = (action) => frameDurations(action).at(-1) >= HOLD_MS;

// The frames are stacked <g>s; a CSS animation on each one's visibility, with
// step-end timing, shows exactly one at a time on the sheet's schedule. An
// <img> runs CSS but not scripts, so this is the whole mechanism. Actions that
// hold their last frame run once with fill-mode forwards. Under
// prefers-reduced-motion the animation is dropped and one frame stays: the
// first, or the held frame for a play-once action.
export function animatedSvg(action, palette) {
  const { frames } = action;
  const durations = frameDurations(action);
  const once = playsOnce(action);
  const timed = once ? durations.slice(0, -1) : durations;
  const total = timed.reduce((a, b) => a + b, 0);
  const pct = (ms) => `${+((ms / total) * 100).toFixed(4)}%`;
  const restFrame = once ? frames.length - 1 : 0;

  // Frame i is visible from its start to its end; every frame but the last
  // goes hidden again at its end, and a keyframe's value holds to the next
  // stop (step-end), so the last frame stays visible to 100%, which forwards
  // fill then keeps for a play-once action.
  let start = 0;
  const keyframes = frames.map((_, i) => {
    const s = start;
    const e = i < timed.length ? start + timed[i] : total;
    start = e;
    const stops = [];
    if (s > 0) stops.push(`0%{visibility:hidden}`);
    stops.push(`${pct(s)}{visibility:visible}`);
    if (i < frames.length - 1) stops.push(`${pct(e)}{visibility:hidden}`);
    return `@keyframes f${i}{${stops.join("")}}`;
  });

  const ids = frames.map((_, i) => `#f${i}`);
  const rules = frames.map((_, i) => `#f${i}{animation:f${i} ${total}ms step-end ${once ? "1 forwards" : "infinite"}}`);
  // The reduced-motion override names the ids, since a class rule would lose to them.
  const style =
    `.f{visibility:hidden}` +
    rules.join("") +
    keyframes.join("") +
    `@media (prefers-reduced-motion:reduce){${ids.join(",")}{animation:none}#f${restFrame}{visibility:visible}}`;

  const groups = frames.map((rows, i) => `<g id="f${i}" class="f">${pixels(rows, palette)}</g>`).join("");
  return `${svgOpen(frames[0][0].length, frames[0].length)}<style>${style}</style>${groups}</svg>\n`;
}

// ---- index.html: the card Claude Design shows for this folder ----

// One entry per exported character: a title, a note, and a few words per action.
const cards = {
  "justin-overshirt": {
    title: "Justin, over-shirt",
    note: "Justin in his straw hat, a rust over-shirt open over a plain oat tee, and loose textured trousers. He wears this on the pathway.",
  },
  "justin-hoodie": {
    title: "Justin, hoodie",
    note: "The same frames with the over-shirt swapped for a slate hoodie, hood down on the shoulders. He wears this beside his title in the first pane, so the two of him on one screen are told apart.",
  },
  truffle: {
    title: "Truffle",
    note: "Justin's French Bulldog. She sleeps at step 2 of the pathway until he comes over to pet her.",
    actions: {
      sleep: "lying down, head on her paws, breathing",
      ear: "one ear pricks up and an eye opens a slit; plays once and holds",
      sit: "sitting up, awake, from the front",
      walk: "a stroll, facing right; stride 2 px per frame",
      trot: "a trot, facing right; stride 6 px per frame",
      paw: "asking for a pet with one front paw",
      wake: "waking up: from lying down to on her feet",
    },
  },
  luibot: {
    title: "luibot",
    note: "One of Justin's two agents: a blue robot in the same straw hat and the slate hoodie. He flies between the pathway and the open pane to do small jobs.",
    actions: {
      idle: "standing, blinking",
      wave: "waving",
      fly: "hovering on two thruster flames",
      "fly-wave": "hovering with the waving arm, for flipping a switch or pushing a chair in",
      feed: "hovering and pouring grain from a small sack",
      "fly-carry": "hovering with the two shoeboxes hugged in front",
      "beam-out": "the teleport, leaving; a one-shot",
      "beam-in": "the teleport, arriving; a one-shot",
      "beam-out-fly": "the teleport, leaving, while he hovers",
      "beam-in-fly": "the teleport, arriving, while he hovers",
    },
  },
  luibuilder: {
    title: "luibuilder",
    note: "Justin's other agent: an orange, boxy robot in the straw hat and the rust over-shirt, one hand resting on a stone block.",
    actions: {
      idle: "standing with a hand on the stone block, blinking",
      wave: "tips his hat; plays once and holds",
      stand: "standing without the block, for the projects pane",
      build: "one hammer strike; a one-shot the design repeats a few times",
      hop: "crouch, airborne, land",
      "beam-out": "the teleport, leaving; a one-shot",
      "beam-in": "the teleport, arriving; a one-shot",
    },
  },
  desk: {
    title: "Desk",
    note: "The desk and chair at the last step, with nobody in the chair. It has the same canvas as Justin's `type`, so the two swap at one position.",
    actions: { idle: "the chair pulled out", tuck: "the chair slides under the desk; a one-shot the design steps frame by frame" },
  },
  ball: {
    title: "Tennis ball",
    note: "Truffle's ball. Its frame follows how far it has travelled (a quarter turn per frame, one turn per circumference), not a clock.",
    actions: { roll: "a quarter turn per frame, rolling to the right; frame 0 is at rest" },
  },
  coffee: {
    title: "Coffee corner",
    note: "The espresso machine and the grinder on their own cabinet, at step 5.",
    actions: { idle: "at rest", empty: "the cup is gone, because it is in his hand", brew: "pulling a shot", ready: "the cup on the tray, steaming" },
  },
  "shoe-rack": {
    title: "Shoe rack",
    note: "The rack of shoes and shoeboxes at step 1.",
    actions: { idle: "every box on the rack", "boxes-out": "the top two boxes taken" },
  },
  shoeboxes: { title: "Shoeboxes", note: "The two boxes he takes from the rack, cell for cell the ones in his `carry`.", actions: { idle: "set down on the floor" } },
  grass: {
    title: "Grass",
    note: "Loose tufts for the farm, drawn with no outline.",
    actions: { "tuft-a": "a tuft that sways now and then", "tuft-b": "a small tuft", "tuft-c": "a wide tuft", "tuft-d": "a tall tuft" },
  },
  fence: { title: "Fence", note: "The farm's fence, built from repeated segments.", actions: { segment: "one repeatable length", end: "the closing post" } },
  skyline: { title: "Skyline", note: "New York, inside the first future plan's heading.", actions: { idle: "a few lit windows change, slowly" } },
  steam: { title: "Steam", note: "A wisp from a roof vent on the skyline.", actions: { rise: "rising" } },
  billboard: { title: "Billboard", note: "The board on the skyline's roofs. The words on it are real text laid over its panel.", actions: { idle: "frame 0 lamps off, frame 1 lamps lit; holds" } },
  "cherry-tree": { title: "Cherry tree", note: "Japan, inside the second future plan's heading.", actions: { idle: "in blossom" } },
  petal: { title: "Petal", note: "One petal from the cherry tree.", actions: { fall: "falling; plays once and holds" } },
  stones: { title: "Stones", note: "The stones luibuilder works on among the projects.", actions: { idle: "at rest", strike: "a chip flies off as the hammer lands" } },
  "farm-sign": { title: "Farm sign", note: "The hanging board of the farm. The words on it are real text laid over its panel.", actions: { idle: "at rest" } },
  torii: { title: "Torii", note: "The gate beside the cherry tree. The words on its board are real text laid over its panel.", actions: { idle: "at rest", rested: "a petal has landed on the top beam" } },
  feed: { title: "Feed", note: "The grain luibot pours for the hen.", actions: { fall: "falling; plays once and holds", pile: "a full pile", "pile-half": "half eaten" } },
  chicken: { title: "Hen", note: "The hen of the farm.", actions: { idle: "standing, blinking", peck: "pecking at the feed", walk: "walking, facing right" } },
  cow: { title: "Cow", note: "The cow at step 4 of the pathway.", actions: { idle: "standing, blinking", graze: "grazing", walk: "walking, facing right", tail: "a swish of the tail" } },
  sheep: { title: "Sheep", note: "The sheep grazing beside the farm's heading.", actions: { idle: "standing, blinking", graze: "grazing", walk: "walking, facing right" } },
};
cards["justin-overshirt"].actions = cards["justin-hoodie"].actions = {
  idle: "standing, blinking",
  walk: "side view, facing right; stride 7 px per frame",
  sit: "sitting on the ground, side view, blinking",
  sleep: "flat on his back, the hat resting on his face",
  sip: "an espresso cup held at the chest, then raised",
  hat: "the hat tip with a nod; a one-shot the design steps frame by frame",
  "arms-up": "the cheer for the search command \"Episode 1070\"",
  carry: "holding the top two shoeboxes from the rack, at step 1",
  type: "at his desk, side view, hands on the keys",
  pet: "kneeling to pet Truffle while she sits up",
  "pet-low": "the same kneel while she lies down",
  wave: "the hello wave",
  press: "pressing the espresso machine's button; a one-shot",
  grab: "taking the cup from the tray; a one-shot",
  pat: "patting the cow",
  nod: "his answer when Truffle paws for a pet; a one-shot",
  pickup: "picking the tennis ball up; a one-shot",
  throw: "an underhand toss of the ball to the right; a one-shot",
  pull: "pulling the chair out, in step with the desk's `tuck` played backwards",
};

export function timingLabel(action) {
  const { frames } = action;
  if (frames.length < 2) return "1 frame, static";
  const durations = frameDurations(action);
  if (playsOnce(action)) return `${durations.slice(0, -1).join(" / ")} ms, then holds frame ${frames.length - 1}`;
  if (action.durations) return `${durations.join(" / ")} ms, loops`;
  return `${durations[0]} ms per frame, loops`;
}

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function indexHtml() {
  const sections = Object.entries(characters).map(([name, character]) => {
    const actions = Object.entries(character.sheet.actions).map(([actionName, action]) => {
      const width = action.frames[0][0].length;
      const height = action.frames[0].length;
      const animated = action.frames.length > 1;
      const file = animated ? `${name}-${actionName}.svg` : `${name}-${actionName}-0.svg`;
      const frameFiles = action.frames.map((_, i) => `${name}-${actionName}-${i}.svg`);
      const img = (scale) => `<img src="${file}" width="${width * scale}" height="${height * scale}" alt="">`;
      return `      <article class="action">
        <div class="stage"><span class="stand">${img(1)}</span><span class="stand">${img(4)}</span></div>
        <code class="file">${file}</code>
        <span class="pn__label">${width} × ${height} px · ${escape(timingLabel(action))}</span>
        <p class="use">${escape(cards[name].actions[actionName])}</p>
        <div class="frames">${frameFiles
          .map((f) => `<span class="frame"><span class="stand"><img src="${f}" width="${width}" height="${height}" alt=""></span><code>${f}</code></span>`)
          .join("")}</div>
      </article>`;
    });
    return `    <section class="character" id="${name}">
      <header>
        <span class="pn__label">${name}</span>
        <h2>${escape(cards[name].title)}</h2>
        <p>${escape(cards[name].note)}</p>
      </header>
      <div class="actions">
${actions.join("\n")}
      </div>
    </section>`;
  });

  return `<!-- @dsCard group="Sprites" -->
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sprites</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap">
  <link rel="stylesheet" href="../tokens.css">
  <style>
    /* This card's own layout, on the panes tokens. */
    body {
      margin: 0;
      padding: 40px 16px 64px;
      background: var(--pn-ground);
      color: var(--pn-ink);
      font: 400 15px/1.6 var(--pn-font-body);
      -webkit-font-smoothing: antialiased;
    }
    main { max-width: 1080px; margin: 0 auto; }
    h1, h2 { margin: 0; color: var(--pn-ink); }
    h1 { font: var(--pn-lead); letter-spacing: var(--pn-lead-track); }
    h2 { font: var(--pn-h3); letter-spacing: var(--pn-h3-track); margin-top: 8px; }
    p { margin: 6px 0 0; max-width: 62ch; font-size: 14px; color: var(--pn-muted); }
    .intro { margin-bottom: 40px; }
    .pn__label { font: var(--pn-label); letter-spacing: var(--pn-label-track); color: var(--pn-muted); }
    code { font: var(--pn-label); color: var(--pn-ink-2); }
    .character { padding: 32px 0; border-top: 1px solid var(--pn-line-strong); }
    .actions {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 10px;
      margin-top: 24px;
    }
    .action {
      display: flex;
      flex-direction: column;
      gap: 7px;
      padding: 16px;
      background: var(--pn-surface);
      border: 1px solid var(--pn-line);
      border-radius: var(--pn-radius);
    }
    .stage {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 24px;
      min-height: 260px;
      margin-bottom: 10px;
    }
    /* Feet on a hairline rule, as on the site. */
    .stand {
      display: inline-block;
      line-height: 0;
      border-bottom: 1px solid var(--pn-line-strong);
      padding: 0 4px;
    }
    img { display: block; }
    .use { margin: 0; font-size: 13.5px; }
    .frames {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 16px;
      margin-top: 8px;
      padding-top: 12px;
      border-top: 1px solid var(--pn-line);
    }
    .frame { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
    .frame code { color: var(--pn-dim); }
  </style>
</head>
<body>
  <main>
    <header class="intro">
      <span class="pn__label">Sprites</span>
      <h1>The people, the dog, the robots and the props of justinlui.dev</h1>
      <p>Pixel sprites exported from the site's sheets as plain SVG, with the outer outline already in the soft brown that the dark ground needs. Each action is shown at true size and at 4×. Animated files switch frames with a CSS animation inside the SVG, so an <code>&lt;img&gt;</code> plays them. Place them at true size, feet on a line the layout already has. See README.md for the rules.</p>
    </header>
${sections.join("\n")}
  </main>
</body>
</html>
`;
}

async function main() {
  await mkdir(outDir, { recursive: true });
  for (const name of await readdir(outDir)) if (name.endsWith(".svg")) await unlink(join(outDir, name));

  let count = 0;
  for (const [name, character] of Object.entries(characters)) {
    const palette = paletteFor(character);
    for (const [actionName, action] of Object.entries(character.sheet.actions)) {
      for (const [i, rows] of action.frames.entries()) {
        await writeFile(join(outDir, `${name}-${actionName}-${i}.svg`), staticSvg(rows, palette));
        count += 1;
      }
      if (action.frames.length > 1) {
        await writeFile(join(outDir, `${name}-${actionName}.svg`), animatedSvg(action, palette));
        count += 1;
      }
    }
  }
  await writeFile(join(outDir, "index.html"), indexHtml());
  console.log(`wrote ${count} SVGs and index.html to ${outDir}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
