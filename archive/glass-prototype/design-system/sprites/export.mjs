// Usage: node design-system/sprites/export.mjs   (writes the SVGs and index.html next to this file from the sheets in src/)
//
// One static SVG per character, action and frame (<character>-<action>-<frame>.svg)
// and one animated SVG per multi-frame action (<character>-<action>.svg), plus the
// design-system card (index.html) that shows them all. The pixels come straight
// from the sheets; the run merging and outfit palette resolution mirror
// src/sprites/Sprite.jsx so the files match the site exactly.

import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import justin from "../../src/sprites/justin.js";
import truffle from "../../src/sprites/truffle.js";
import luibot from "../../src/sprites/luibot.js";
import luibuilder from "../../src/sprites/luibuilder.js";
import ball from "../../src/designs/spec-sheet-evolved/ball.js";

const outDir = dirname(fileURLToPath(import.meta.url));

// Sprite.jsx falls back to 1200 ms when an action gives neither durations nor interval.
const DEFAULT_INTERVAL = 1200;
// A last duration this long means "play once and hold the last frame" (the site uses 600000).
const HOLD_MS = 60_000;

// Exported characters: the sheet plus the outfit whose palette overrides apply.
export const characters = {
  "justin-overshirt": { sheet: justin, outfit: "overshirt" },
  "justin-hoodie": { sheet: justin, outfit: "hoodie" },
  truffle: { sheet: truffle },
  luibot: { sheet: luibot },
  luibuilder: { sheet: luibuilder },
  ball: { sheet: ball },
};

export const paletteFor = ({ sheet, outfit }) => ({ ...sheet.palette, ...sheet.outfits?.[outfit] });

// Same as Sprite.jsx: each horizontal run of one colour becomes one rect.
export function runs(row, palette) {
  const out = [];
  for (let x = 0; x < row.length; ) {
    const fill = palette[row[x]];
    let end = x + 1;
    while (end < row.length && row[end] === row[x]) end += 1;
    if (fill) out.push({ x, width: end - x, fill });
    x = end;
  }
  return out;
}

const rects = (rows, palette) =>
  rows
    .flatMap((row, y) =>
      runs(row, palette).map(
        ({ x, width, fill }) => `<rect x="${x}" y="${y}" width="${width}" height="1" fill="${fill}"/>`,
      ),
    )
    .join("");

const svgOpen = (width, height) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">`;

export function staticSvg(rows, palette) {
  return `${svgOpen(rows[0].length, rows.length)}${rects(rows, palette)}</svg>\n`;
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

  const groups = frames.map((rows, i) => `<g id="f${i}" class="f">${rects(rows, palette)}</g>`).join("");
  return `${svgOpen(frames[0][0].length, frames[0].length)}<style>${style}</style>${groups}</svg>\n`;
}

// ---- index.html: the card Claude Design shows for this folder ----

const notes = {
  "justin-overshirt": {
    title: "Justin, over-shirt",
    note: "Justin in his straw hat (loosely Luffy's), a rust over-shirt open over a plain oat tee, and loose textured trousers. The site shows this outfit from 06:00 to 17:59 San Francisco time.",
  },
  "justin-hoodie": {
    title: "Justin, hoodie",
    note: "The same frames with the over-shirt swapped for a slate hoodie, hood down on the shoulders. The site shows this outfit from 18:00 to 05:59 San Francisco time.",
  },
  truffle: {
    title: "Truffle",
    note: "Justin's female brindle French bulldog. She sleeps on the bottom rule of her card; the cursor on the card lifts one ear, the cursor on her gets her to sit up.",
  },
  luibot: {
    title: "luibot",
    note: "One of Justin's two agents: a blue robot in the same straw hat and Justin's slate hoodie. He waves while the pointer is on him.",
  },
  luibuilder: {
    title: "luibuilder",
    note: "Justin's other agent: an orange, boxy robot in the straw hat and the rust over-shirt, one hand resting on a stone block. He tips his hat while the pointer is on him.",
  },
  ball: {
    title: "Tennis ball",
    note: "Rolls up to Truffle's nose the first time her card scrolls into view. On the site its frame is driven by how far it has travelled (a quarter turn per frame, one turn per circumference), not by a clock.",
  },
};

const purpose = {
  "justin-overshirt": {
    idle: "standing, blinking: the daytime masthead pose",
    walk: "side view, facing right; stride 7 px per frame",
    sit: "sitting on the rule: the evening masthead pose, and the footer",
    sleep: "lying on the rule: the night masthead pose",
    sip: "espresso: the morning masthead pose",
    hat: "tips the hat while the pointer is on his name",
    "arms-up": "both arms up for 1.8 s after someone types 1070",
  },
  truffle: {
    sleep: "asleep on her card's bottom rule, breathing",
    ear: "one ear pricks up when the cursor enters her card; plays once and holds",
    sit: "sits up while the cursor is on her",
    walk: "a stroll, facing right; stride 2 px per frame",
    trot: "a trot, facing right; stride 6 px per frame",
  },
  luibot: { idle: "standing, blinking", wave: "waves while the pointer is on him" },
  luibuilder: { idle: "standing, blinking", wave: "tips his hat while the pointer is on him; plays once and holds" },
  ball: { roll: "a quarter turn per frame, rolling to the right; frame 0 is at rest" },
};
purpose["justin-hoodie"] = purpose["justin-overshirt"];

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
      const img = (scale) =>
        `<img src="${file}" width="${width * scale}" height="${height * scale}" alt="" class="sprite${scale > 1 ? " sprite--big" : ""}">`;
      return `      <article class="action">
        <div class="stage"><span class="stand">${img(1)}</span><span class="stand">${img(4)}</span></div>
        <code class="file">${file}</code>
        <span class="label">${width} × ${height} px · ${escape(timingLabel(action))}</span>
        <p class="use">${escape(purpose[name][actionName])}</p>
        <div class="frames">${frameFiles
          .map((f) => `<span class="frame"><span class="stand"><img src="${f}" width="${width}" height="${height}" alt="" class="sprite"></span><code>${f}</code></span>`)
          .join("")}</div>
      </article>`;
    });
    return `    <section class="character" id="${name}">
      <header>
        <span class="label">${name}</span>
        <h2>${escape(notes[name].title)}</h2>
        <p>${escape(notes[name].note)}</p>
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
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300..700&family=Fraunces:opsz,wght@9..144,300..650&family=IBM+Plex+Mono:wght@400;500&display=swap">
  <link rel="stylesheet" href="../tokens.css">
  <style>
    /* Fallbacks for when ../tokens.css is missing; the tokens win when it loads. */
    body {
      margin: 0;
      padding: 2.5rem 16px 4rem;
      background: var(--ss-bg, #f3e8d8);
      color: var(--ss-ink, #3b2a20);
      font-family: var(--ss-sans, "DM Sans", system-ui, sans-serif);
      font-size: 1rem;
      line-height: 1.5;
    }
    main { max-width: 1080px; margin: 0 auto; }
    h1, h2 {
      font-family: var(--ss-display, "Fraunces", Georgia, serif);
      font-weight: 500;
      margin: 0;
    }
    h1 { font-size: clamp(1.8rem, 4vw, 2.4rem); }
    h2 { font-size: clamp(1.3rem, 3vw, 1.6rem); }
    p { margin: 0.4rem 0 0; max-width: 62ch; }
    .intro { margin-bottom: 2.5rem; }
    .label {
      font-family: var(--ss-mono, "IBM Plex Mono", monospace);
      font-size: 0.68rem;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--ss-muted, #6f6357);
    }
    code {
      font-family: var(--ss-mono, "IBM Plex Mono", monospace);
      font-size: 0.72rem;
      color: var(--ss-ink, #3b2a20);
    }
    .character {
      padding: 2rem 0;
      border-top: 1px solid var(--ss-line-strong, rgba(51, 41, 31, 0.45));
    }
    .character header .label { color: var(--ss-accent, #a5642f); }
    .actions {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem 2rem;
      margin-top: 1.5rem;
    }
    .action {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      padding: 1rem 1.1rem 1.1rem;
      background: var(--ss-tint, rgba(51, 41, 31, 0.04));
      border: 1px solid var(--ss-line, rgba(51, 41, 31, 0.18));
      border-radius: 4px;
    }
    .stage {
      display: flex;
      align-items: flex-end;
      gap: 1.5rem;
      min-height: 260px;
      margin-bottom: 0.6rem;
    }
    /* Feet on a hairline rule, as on the site. */
    .stand {
      display: inline-block;
      line-height: 0;
      border-bottom: 1px solid var(--ss-line-strong, rgba(51, 41, 31, 0.45));
      padding: 0 4px;
    }
    .sprite { display: block; }
    .sprite--big { image-rendering: pixelated; }
    .use { font-size: 0.9rem; color: var(--ss-muted, #6f6357); }
    .frames {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem 1rem;
      margin-top: 0.6rem;
      padding-top: 0.6rem;
      border-top: 1px solid var(--ss-line, rgba(51, 41, 31, 0.18));
    }
    .frame { display: flex; flex-direction: column; align-items: flex-start; gap: 0.3rem; }
    .frame code { font-size: 0.62rem; color: var(--ss-muted, #6f6357); }
  </style>
</head>
<body>
  <main>
    <header class="intro">
      <span class="label">Sprites</span>
      <h1>The people (and dog, and robots) of justinlui.dev</h1>
      <p>Pixel sprites exported from the site's sheets as plain SVG. Each action is shown at true size and at 4×. Animated files switch frames with a CSS animation inside the SVG, so an <code>&lt;img&gt;</code> plays them. Place them at true size or a whole-number multiple, never in between, feet on a hairline rule. See README.md for the rules.</p>
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
