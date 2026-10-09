// What the tools know about this site: its steps, its URLs, where its sprites are in the DOM,
// and how to run a scenario (a way into a step) while every sprite change is logged.
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The steps in PANES order, read from the source so a new section needs no change here.
export function steps(root) {
  const source = readFileSync(join(root, "src/designs/panes/index.jsx"), "utf8");
  const panes = source.match(/^const PANES = \[([\s\S]*?)^\];/m);
  if (!panes) throw new Error("could not find `const PANES = [...]` in src/designs/panes/index.jsx");
  return [...panes[1].matchAll(/short: "([^"]+)"/g)].map((m) => m[1]);
}

export function siteUrl(base, { step, hour, top, agents, design } = {}) {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries({ design, top, agents, hour })) if (v !== undefined && v !== null && v !== "") query.set(k, v);
  return `${base}${query.size ? `?${query}` : ""}${step ? `#${step}` : ""}`;
}

// Runs in the page before the site's code. Every DOM change to a sprite pushes the sprite's state
// onto window.__sprites as { t: page ms, rt: real ms, who, pose, frame, x, y }; `pose` is "gone"
// once it is unmounted. Pathway sprites are named plainly (justin, truffle, ball, luibot, prop:desk);
// sprites inside the open pane get "pane:" (pane:luibot, pane:builder, pane:hen, pane:justin), a
// robot's beam between the two "beam:" (beam:luibot), and a second sprite of one name "#2".
// Given window.__arrive = { step, then }, it notes when he next stands still in that step's
// stretch (at the now step that is the coffee corner) in window.__arrived, and holds the page
// clock `then` ms later (unless `then` is null).
export const RECORDER = `(() => {
  const log = (window.__sprites = []);
  const last = new Map();
  const nameOf = (el) => {
    if (el.matches(".pn__bot")) return "luibot";
    if (el.matches(".pn-beam")) return "beam:" + el.dataset.robot;
    if (el.dataset.actor) return el.dataset.actor;
    if (el.closest(".pn__stage")) return "prop:" + el.dataset.prop;
    if (el.matches(".pn-hello")) return "pane:justin";
    if (el.matches(".pn-builder")) return "pane:builder";
    return "pane:" + (el.dataset.robot ?? el.dataset.animal ?? el.dataset.prop ?? el.className);
  };
  const SPRITES = "[data-actor], .pn__bot, [data-pose], [data-action]";
  const read = () => {
    const t = performance.now(), rt = window.__clock?.realNow() ?? t;
    const seen = new Set();
    for (const el of document.querySelectorAll(SPRITES)) {
      let who = nameOf(el);
      for (let n = 2; seen.has(who); n++) who = nameOf(el) + "#" + n;
      seen.add(who);
      const d = el.dataset;
      const pose = (d.pose ?? d.action ?? "") + (d.hidden ? "/hidden" : "");
      let x = d.cx ?? d.x, y = d.y;
      if (x === undefined) { const r = el.getBoundingClientRect(); x = Math.round(r.x); y = Math.round(r.y); }
      const s = { t, rt, who, pose, frame: d.frame ?? "", x: +x, y: y === undefined ? undefined : +y };
      const key = [s.pose, s.frame, s.x, s.y].join();
      if (last.get(who) !== key) { last.set(who, key); log.push(s); }
    }
    for (const who of last.keys()) if (!seen.has(who)) { last.delete(who); log.push({ t, rt, who, pose: "gone" }); }
    const a = window.__arrive, j = last.get("justin")?.split(","), s = a && document.querySelector('[data-stretch="' + a.step + '"]');
    if (s && j[0] !== "walk" && +j[2] >= s.offsetLeft && +j[2] < s.offsetLeft + s.offsetWidth) {
      window.__arrive = null;
      window.__arrived = { t, rt };
      if (a.then !== null) window.__clock?.holdAt(t + a.then);
    }
  };
  new MutationObserver(read).observe(document, { subtree: true, childList: true, attributes: true,
    attributeFilter: ["data-pose", "data-action", "data-frame", "data-cx", "data-x", "data-y", "data-hidden"] });
})();`;

// The step whose stretch holds pathway x, and the stations, read from the page.
export const PATHWAY = `(() => [...document.querySelectorAll("[data-stretch]")].map((el) =>
  ({ step: el.dataset.stretch, left: el.offsetLeft, right: el.offsetLeft + el.offsetWidth, station: +el.dataset.station })))()`;

export const stepAt = (pathway, x) => pathway.find((s) => x >= s.left && x < s.right)?.step ?? "off";

// Sprites each step must show after a direct load, by its `short` in PANES. The pathway's own
// residents are on every step on a wide window; a phone shows the open step's stretch alone.
// "a|b" is either; "justin=type" is a sprite in a pose (while he types, his pose draws the desk).
export const EXPECTED = {
  hello: { pathway: ["prop:shoeRack"], pane: [".pn-hello"] },
  agents: { pathway: ["prop:desk|justin=type"], pane: ['.pn-robot[data-robot="luibot"]', '.pn-robot[data-robot="luibuilder"]', ".pn-builder"] },
  now: { pathway: ["prop:cow", "prop:coffee", "truffle", "ball"], pane: ['[data-anchor="sign-switch"]', '[data-animal="hen"]', '[data-animal="sheep"]'] },
  people: { pathway: ["truffle"], pane: [] },
};

// A scenario: a way into a step, and everything about the window it happens in.
//   step     the step to end at (its `short`), default the first
//   way      "load" (open its hash), "key" (number key), "click" (its step button) or "tap" (phone)
//   from     where a key, click or tap starts, default the first step
//   walk     steps to select one after another by `way`, comma-separated (instead of `step`)
//   settle   page seconds to wait after the load before the first selection, and after he
//            arrives at each step of a walk
//   seconds  page seconds to keep logging after the last step was selected
//   phone    375-style phone emulation with touch; on by itself under 640px wide
//   hour     ?hour= (the San Francisco hour), "none" for the real one
//   seed     seeds Math.random, "none" for the browser's own
export const SCENARIO = {
  step: null,
  way: "load",
  from: null,
  walk: null,
  settle: 3,
  seconds: 5,
  width: 1440,
  height: null,
  phone: false,
  hour: "14",
  top: null,
  agents: null,
  reduced: false,
  cpu: 1,
  speed: 1,
  seed: "1",
};

export function windowOf(s) {
  return {
    width: Number(s.width),
    phone: s.phone || s.width < 640,
    ...(s.height && { height: Number(s.height) }),
    reducedMotion: s.reduced,
    cpu: Number(s.cpu),
    speed: Number(s.speed),
    seed: s.seed === "none" ? null : Number(s.seed),
  };
}

// Page time and real time now, in page ms and real ms.
const NOW = `({ t: performance.now(), rt: window.__clock?.realNow() ?? performance.now() })`;

// Resolves at page time `t`. With a page clock (--speed) the clock is held there, so the next
// key or click lands at exactly `t`; call release(page, next) after it, and page time runs on to
// the hold at `next`. At 1x it polls real time.
export async function until(page, t) {
  if (page.speed === 1) return page.waitFor(`performance.now() >= ${t}`, t + 60000, 5);
  if (await page.eval(`performance.now() > ${t} || __clock.holdAt(${t})`)) throw new Error(`page time was past ${t} before it could be held there`);
  if (!(await page.waitFor("__clock.held", (t / page.speed) * 3 + 60000, 5))) throw new Error(`page time never reached ${t}`);
}
export const release = (page, next = Infinity) => page.speed !== 1 && page.eval(`__clock.release(${next})`);

// Selects `step` by `way`.
export async function select(page, step, way, order) {
  if (way === "key") return page.key(String(order.indexOf(step) + 1));
  const c = await page.centre(`[data-segment="${step}"]`);
  await (way === "tap" ? page.tap(c.x, c.y) : page.click(c.x, c.y));
}

// Runs scenario `s` on `page` at `base`; returns { url, log, marks, pathway, clock, errors }.
// marks: [{ t, rt, what }] in page and real ms, e.g. when a key was pressed and when he arrived.
// With `frames` ({ every, onFrame }), onFrame(t) runs every `every` page ms of the last
// `seconds` (from the load, or from the last selection of a walk, so the walk is in it), with
// the page clock held at t while it runs.
export async function runScenario(page, base, s, order, frames = null) {
  const first = order[0];
  const walk = s.walk ? (Array.isArray(s.walk) ? s.walk : s.walk.split(",")) : s.way === "load" ? [] : [s.step ?? first];
  const start = s.way === "load" ? (s.step ?? first) : (s.from ?? first);
  const url = siteUrl(base, {
    step: start === first && s.way !== "load" ? null : start,
    hour: s.hour === "none" ? null : s.hour,
    top: s.top,
    agents: s.agents,
  });
  const settle = s.settle * 1000,
    seconds = s.seconds * 1000;
  const last = frames ? 0 : seconds; // the hold after the last selection
  await page.load(url, { ...windowOf(s), holdAt: walk.length ? settle : last, init: [RECORDER] });
  const marks = [{ ...(await page.eval(NOW)), what: `loaded ${url}` }];
  let from = 0; // the document's start: with a page clock nothing runs before the site's code
  await until(page, walk.length ? settle : last);
  for (const [i, step] of walk.entries()) {
    const then = i < walk.length - 1 ? settle : last;
    const filmed = frames && i === walk.length - 1;
    marks.push({ ...(await page.eval(NOW)), what: `${s.way} ${step}` });
    await page.eval(`window.__arrived = null; window.__arrive = { step: "${step}", then: ${filmed ? null : then} }`);
    await select(page, step, s.way, order);
    if (filmed) {
      from = marks.at(-1).t;
      break;
    }
    await release(page);
    const at = await page.waitFor("window.__arrived", 180000, 10);
    if (!at)
      throw new Error(
        `he did not arrive at step ${step}: ${await page.eval(`(() => { const j = document.querySelector('[data-actor="justin"]'); return j.dataset.pose + " at cx " + j.dataset.cx; })()`)}`,
      );
    marks.push({ ...at, what: `at ${step}` });
    from = at.t;
    await until(page, from + then);
  }
  const end = from + seconds;
  for (let t = from; frames && t < end; t += frames.every) {
    await until(page, t);
    await frames.onFrame(t);
    await release(page, Math.min(t + frames.every, end));
  }
  await until(page, end);
  if (frames) await frames.onFrame(end);
  const at = frames && walk.length && (await page.eval("window.__arrived"));
  if (at) marks.push({ ...at, what: `at ${walk.at(-1)}` });
  const log = await page.eval("window.__sprites");
  const result = {
    url,
    log,
    marks,
    pathway: await page.eval(PATHWAY),
    clock: await page.eval("window.__clock && { frames: __clock.frames, behindMs: __clock.behindMs }"),
    errors: [...page.errors],
  };
  await release(page);
  return result;
}

// The ordered pose changes: [{ t, who, pose }] where a sprite's pose differs from its last.
export function poseSequence(log) {
  const last = new Map();
  const seq = [];
  for (const e of log) {
    if (last.get(e.who) === e.pose) continue;
    last.set(e.who, e.pose);
    seq.push({ t: e.t, rt: e.rt, who: e.who, pose: e.pose });
  }
  return seq;
}

// Where each pathway sprite is at the end: { justin: "people", truffle: "people", ... }.
export function endSteps(log, pathway) {
  const end = {};
  for (const e of log) if (!e.who.includes(":") && e.pose !== "gone") end[e.who] = e.who === "luibot" && e.y ? "air" : stepAt(pathway, e.x);
  return end;
}

export const formatSequence = (seq) =>
  seq.map((e) => `${String(Math.round(e.t)).padStart(7)} ms page ${String(Math.round(e.rt)).padStart(7)} ms real  ${e.who} ${e.pose}`).join("\n");

// Each sprite's own pose changes, in order: { justin: ["idle", "walk", ...], ... }.
export function bySprite(seq) {
  const out = {};
  for (const e of seq) (out[e.who] ??= []).push(e.pose);
  return out;
}
