import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Sprite, characters } from "../../sprites/Sprite.jsx";
import ballSheet from "./ball.js";

// The sprites' stage. The board is a set of glass ledges: every widget's top
// edge (its roof) and, for the widgets he visits, the shelf line low on the
// face. One Justin lives on them. He rests in the posture of the hour, and
// when a visitor points at a widget he goes there at once, from wherever he
// is: along his ledge, down a drop (two rows at most) or up a jump at a
// widget's edge (the only text-free columns), a leap across the gap to the
// widget beside his, or, when no such path exists, off the board on the
// target's side and in again on the target's ledge. On the shelf
// he does that widget's thing: makes an espresso, kneels to Truffle, stands
// with the robots, watches the farm. Nobody walks home on their own.
// Truffle lives on the roofline: she follows him there, fetches the ball,
// and waits when he is elsewhere; when he kneels on the people shelf she
// comes down to him, and stays there. The props are residents: they are
// already in place. Every walk is driven by distance: one walk frame per
// `stride` px of the sheet, so a planted foot never slides, and a sprite
// always faces the way it moves. Nothing teleports while visible.
//
// The floor strip at the bottom of an open sheet is a second, smaller stage
// (Floor): residents are in place when the sheet lands, the visitor arrives.

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const frameSize = (character, action) => {
  const rows = characters[character].actions[action].frames[0];
  return { w: rows[0].length, h: rows.length };
};

// Justin's x is always where his standing body's left edge is (the 36px idle
// canvas). The wider canvases hold that same body further in: these are the
// body's x offsets from the sprite sheet's notes, the only numbers a new pose
// needs. A canvas is placed at x - BODY[action], so his feet never move when
// the action changes. Widths come from the sheets.
export const BODY = { "arms-up": 10, wave: 10, press: 11, grab: 11, hat: 0, type: 10, desk: 10 };
const bodyShift = (action) => BODY[action] ?? 0;
const JUSTIN_W = frameSize("justin", "idle").w;
const TRUFFLE_W = frameSize("truffle", "trot").w;

// The petting composition, from the sprite sheet's notes: with him drawn
// facing right, Truffle's canvas sits at (dx, dy) inside his 51x56 `pet`
// canvas, both on his ground row. Mirrored when he faces left. `dogOnTop` is
// the paint order: sitting, her near ear sits in front of his forearm and his
// hand shows between her ears, so she is painted over him; lying down, he is
// painted over her. These are the only numbers to change.
export const PET = {
  sit: { act: "pet", dog: "sit", dx: 34, dy: 32, dogOnTop: true },
  sleep: { act: "pet-low", dog: "sleep", dx: 36, dy: 36, dogOnTop: false },
};
const dogOnTop = (justinAction) =>
  justinAction === "pet" ? PET.sit.dogOnTop : justinAction === "pet-low" ? PET.sleep.dogOnTop : false;

// Where Truffle's left edge goes for a Justin whose left edge is at `jx`.
const petDogX = (jx, flip, spec) => {
  const jw = frameSize("justin", spec.act).w;
  const tw = frameSize("truffle", spec.dog).w;
  return flip ? jx + jw - spec.dx - tw : jx + spec.dx;
};

// The espresso, from the sprite sheet's notes: his `press` and `grab`
// canvases hold the body at x 11 and paint the machine (`coffee`) with its
// canvas at (-26, 12) in theirs, so the machine's left edge is 37 columns
// left of his body: he stands at machine.x + 37, the machine on his left.
const BREW = { standX: 37 };

// The brew, frame by frame (the poses are one-shots driven by `frame`):
// he presses the button (the machine brews from the moment his finger is
// on it), lowers his hand and waits in idle, the cup is ready, he takes it
// (the tray is empty the moment the cup lifts), and the hand-off cuts to
// `sip`. Then he stands with the machine idle again, the cup back on its tray.
const BREW_STEPS = [
  { him: "press", frame: 0, machine: "idle", ms: 250 },
  { him: "press", frame: 1, machine: "brew", ms: 600 },
  { him: "press", frame: 0, machine: "brew", ms: 250 },
  { him: "idle", machine: "brew", ms: 2600 },
  { him: "idle", machine: "ready", ms: 900 },
  { him: "grab", frame: 0, machine: "ready", ms: 400 },
  { him: "grab", frame: 1, machine: "ready", ms: 500 },
  { him: "grab", frame: 2, machine: "empty", ms: 300 },
  { him: "grab", frame: 3, machine: "empty", ms: 500 },
  { him: "grab", frame: 4, machine: "empty", ms: 700 },
  { him: "sip", machine: "empty", ms: 7200 },
  { him: "idle", machine: "idle", ms: Infinity },
];

// The hat tip, one-shot: idle -> f0 -> f1 -> f2 -> f3 (the hold) -> f2 -> f1
// -> f0 -> idle, each frame for the sheet's duration. Never looped.
const HAT_PLAY = [0, 1, 2, 3, 2, 1, 0];
const hatMs = (step) => characters.justin.actions.hat.durations[HAT_PLAY[step]];

// A sprite reacts while a mouse is over it; on a touch screen a tap toggles it
// and a tap anywhere else ends it.
export function useHoverOrTap() {
  const el = useRef(null);
  const pointer = useRef("mouse");
  const [over, setOver] = useState(false);
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    if (!tapped) return undefined;
    const release = (event) => {
      if (!el.current?.contains(event.target)) setTapped(false);
    };
    document.addEventListener("pointerdown", release, true);
    return () => document.removeEventListener("pointerdown", release, true);
  }, [tapped]);

  const mouse = (event) => event.pointerType === "mouse";
  return [
    over || tapped,
    {
      ref: el,
      onPointerEnter: (event) => mouse(event) && setOver(true),
      onPointerLeave: (event) => mouse(event) && setOver(false),
      onPointerDown: (event) => {
        pointer.current = event.pointerType;
      },
      onClick: () => pointer.current === "mouse" || setTapped((on) => !on),
    },
  ];
}

// Plays the hat tip once each time `on` becomes true; the current `hat`
// frame, or null when he is not tipping. Under reduced motion he holds the tip.
function useHatTip(on) {
  const [step, setStep] = useState(-1);
  useEffect(() => {
    if (!on) {
      setStep(-1);
      return undefined;
    }
    if (reducedMotion()) {
      setStep(3);
      return undefined;
    }
    let i = 0;
    setStep(0);
    let timer = 0;
    const next = () => {
      i += 1;
      setStep(i < HAT_PLAY.length ? i : -1);
      if (i < HAT_PLAY.length) timer = setTimeout(next, hatMs(i));
    };
    timer = setTimeout(next, hatMs(0));
    return () => clearTimeout(timer);
  }, [on]);
  return step < 0 ? null : HAT_PLAY[step];
}

/* ---- Motion primitives ---- */

// Moves along the ground at a constant speed. `target` may be a function, for
// a follower whose mark keeps moving; while `following()` is true a follower
// that has caught up holds its mark instead of arriving. `frame` advances
// once per `stride` px.
class Mover {
  constructor({ x, speed, stride, frames }) {
    Object.assign(this, { x, speed, stride, frames, target: null, travelled: 0, facing: 1, frame: 0 });
  }

  go(target, onArrive, following) {
    this.target = target;
    this.onArrive = onArrive;
    this.following = following;
    this.travelled = 0;
  }

  stop() {
    this.target = null;
    this.onArrive = null;
    this.following = null;
    this.frame = 0;
  }

  get moving() {
    return this.target !== null;
  }

  step(dt) {
    if (this.target === null) return false;
    const goal = typeof this.target === "function" ? this.target() : this.target;
    const dx = goal - this.x;
    const move = this.speed * dt;
    if (Math.abs(dx) <= move) {
      this.x = goal;
      this.travelled += Math.abs(dx);
      if (this.following?.()) {
        if (dx) this.facing = Math.sign(dx);
        this.frame = Math.floor(this.travelled / this.stride) % this.frames;
        return true;
      }
      this.target = null;
      this.frame = 0;
      const done = this.onArrive;
      this.onArrive = null;
      done?.();
      return true;
    }
    this.x += Math.sign(dx) * move;
    this.travelled += move;
    this.facing = Math.sign(dx);
    this.frame = Math.floor(this.travelled / this.stride) % this.frames;
    return true;
  }
}

// Between two ledges: a drop (eased in, like falling), a hop up (eased out,
// like landing softly), or a leap across a gap (x moves too, on a small
// arc). `x`, `y` are the sprite's x and ground line while it lasts.
class Hop {
  constructor({ fromY, toY, fromX, toX, onLand }) {
    const down = toY > fromY;
    const leap = toX !== fromX;
    const duration = leap ? 0.32 : down ? 0.3 : 0.3 + Math.min(0.2, (fromY - toY) / 900);
    Object.assign(this, { fromY, toY, fromX, toX, t: 0, duration, down, leap, onLand, x: fromX, y: fromY });
  }

  step(dt) {
    this.t = Math.min(this.duration, this.t + dt);
    const p = this.t / this.duration;
    const eased = this.leap ? p : this.down ? p * p : 1 - (1 - p) ** 3;
    this.y = this.fromY + (this.toY - this.fromY) * eased - (this.leap ? 14 * Math.sin(Math.PI * p) : 0);
    this.x = this.fromX + (this.toX - this.fromX) * p;
    if (this.t >= this.duration) {
      this.y = this.toY;
      this.x = this.toX;
      this.onLand?.();
      return false;
    }
    return true;
  }
}

// The ball: a throw eases out over `duration`, and the seam turns a quarter
// per 7.85px (a tenth of the 10px circumference times pi), backwards when it
// rolls left, so the spin matches the travel however the travel eases.
class Roller {
  constructor(x) {
    Object.assign(this, { x, from: x, to: x, t: 0, duration: 0, frame: 0 });
  }

  throwTo(to, duration, onStop) {
    Object.assign(this, { from: this.x, to, t: 0, duration, onStop });
  }

  get moving() {
    return this.t < this.duration;
  }

  step(dt) {
    if (!this.moving) return false;
    this.t = Math.min(this.duration, this.t + dt);
    const p = 1 - (1 - this.t / this.duration) ** 3;
    this.x = this.from + (this.to - this.from) * p;
    const quarters = Math.floor(Math.abs(this.x - this.from) / ((Math.PI * 10) / 4));
    this.frame = this.to >= this.from ? quarters % 4 : (4 - (quarters % 4)) % 4;
    if (!this.moving) this.onStop?.();
    return true;
  }
}

// One requestAnimationFrame loop per stage. It runs only while something is
// moving: `kick()` starts it, and it stops itself when `tick` reports rest.
function useTicker(tick) {
  const raf = useRef(0);
  const last = useRef(0);
  const kick = useCallback(() => {
    if (raf.current) return;
    last.current = performance.now();
    const loop = (now) => {
      // Clamped: a tab coming back from the background must not jump the sprites
      // across the board. rAF stamps can trail the kick, so never negative.
      const dt = Math.max(0, Math.min(0.1, (now - last.current) / 1000));
      last.current = now;
      raf.current = tick(dt) ? requestAnimationFrame(loop) : 0;
    };
    raf.current = requestAnimationFrame(loop);
  }, [tick]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return kick;
}

// Writes a sprite's place straight to the DOM, whole pixels only, so a walk
// never re-renders the sprite and never lands on a half pixel.
const place = (el, x, ground, height) => {
  if (el) el.style.transform = `translate(${Math.round(x)}px, ${Math.round(ground - height)}px)`;
};

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

/* ---- The board's ledges ---- */

const EDGE = 4; // a sprite may stand centred on a ledge's end, this far in
const DROP_MAX = 540; // two rows at most, at a widget's edge post
const HOP_MAX = 280; // a jump up: a shelf to its widget's roof, or a roof to the shelf above
const GAP_MAX = 40; // a leap crosses a grid gap this wide at most

// Reads the ledges off the DOM: every widget's roof, every floor widget's
// shelf (the hairline `pad` above its bottom edge, band to band). Roofs on one
// y that touch (a grid gap apart) join into one walkable roofline. The posts
// are the text-free columns: a sprite centred on a widget's edge covers its
// padding and the gap beside it, never its text.
function readBoard(board) {
  const root = board.closest(".glass");
  const css = (name, fallback) => parseFloat(getComputedStyle(root).getPropertyValue(name)) || fallback;
  const pad = css("--pad", 22);
  const radius = css("--r", 28);
  const widgets = [...board.querySelectorAll(".gw")].map((el) => ({
    id: el.dataset.id,
    l: el.offsetLeft,
    r: el.offsetLeft + el.offsetWidth,
    t: el.offsetTop,
    b: el.offsetTop + el.offsetHeight,
    floor: el.classList.contains("gw--floor"),
  }));
  const ledges = [];
  for (const w of widgets) {
    ledges.push({ y: w.t, l: w.l, r: w.r, id: w.id, kind: "roof" });
    // The shelf spans the widget: he steps onto it at the widget's edge posts.
    if (w.floor) ledges.push({ y: w.b - 2 - pad, l: w.l, r: w.r, id: w.id, kind: "floor" });
  }
  ledges.sort((a, b) => a.y - b.y || a.l - b.l);
  const lines = [];
  for (const g of ledges) {
    const line = lines.find((L) => Math.abs(L.y - g.y) < 1 && g.l - L.r <= GAP_MAX && g.l >= L.l && g.kind === "roof" && L.kind === "roof");
    if (line) {
      line.segments.push(g);
      line.r = Math.max(line.r, g.r);
    } else lines.push({ y: g.y, l: g.l, r: g.r, kind: g.kind, segments: [g] });
  }
  // Posts: sprite centres at every widget's edges, EDGE px in.
  const posts = [...new Set(widgets.flatMap((w) => [w.l + EDGE, w.r - EDGE]))].sort((a, b) => a - b);
  const roofline = lines.reduce((best, L, i) => (L.y < lines[best].y ? i : best), 0);
  const find = (id, kind) => lines.findIndex((L) => L.segments.some((s) => s.id === id && s.kind === kind));
  // The stage clips at the board's padding edge: beyond it he is offstage.
  return { pad, radius, widgets, lines, posts, roofline, find, viewLeft: 0, viewRight: board.offsetWidth };
}

// Where a `width`-wide sprite may stand on a line: centred on its ends at most.
const standable = (line, width) => [line.l + EDGE - width / 2, line.r - EDGE - width / 2];
// Where it may rest: clear of the rounded corners at the line's ends.
const restable = (geo, line, width) => [line.l + geo.radius, line.r - geo.radius - width];
// The nearest resting place to `x` on the line: on one of its widgets, never
// over a gap or a corner.
const restNear = (geo, line, width, x) => {
  let best = null;
  for (const seg of line.segments) {
    const y = clamp(x, ...restable(geo, seg, width));
    if (best === null || Math.abs(y - x) < Math.abs(best - x)) best = y;
  }
  return best;
};
const onLine = (line, cx) => cx >= line.l + EDGE - 0.5 && cx <= line.r - EDGE + 0.5;

// The legs from (line, x) to (line, x) for a `width`-wide sprite, cheapest
// first: walking along a line, a drop at a post to the next line below (two
// rows at most), a jump up at a post (a shelf to its roof, a roof to the
// shelf above), a leap from a line's end across the gap to the line beside
// it, or, only when nothing joins them, off the board on the target's side
// and in again on the target's line. Costs are in px of walking; a drop or
// leap is worth about 120px, a jump 120px plus its height, so he prefers to walk.
function route(geo, width, fromLine, fromX, toLine, toX) {
  const half = width / 2;
  const nodes = []; // { line, cx }
  const nodeAt = new Map();
  const key = (line, cx) => `${line}:${Math.round(cx)}`;
  const add = (line, cx) => {
    const k = key(line, cx);
    if (!nodeAt.has(k)) {
      nodeAt.set(k, nodes.length);
      nodes.push({ line, cx });
    }
    return nodeAt.get(k);
  };
  geo.lines.forEach((L, i) => geo.posts.forEach((p) => onLine(L, p) && add(i, p)));
  const start = add(fromLine, fromX + half);
  const goal = add(toLine, toX + half);
  const n = nodes.length;
  const dist = Array(n).fill(Infinity);
  const prev = Array(n).fill(null);
  const done = new Set();
  dist[start] = 0;
  const relax = (u, v, cost, leg) => {
    if (dist[u] + cost < dist[v]) {
      dist[v] = dist[u] + cost;
      prev[v] = { from: u, leg };
    }
  };
  for (;;) {
    let u = -1;
    for (let i = 0; i < n; i += 1) if (!done.has(i) && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0 || dist[u] === Infinity || u === goal) break;
    done.add(u);
    const { line, cx } = nodes[u];
    const L = geo.lines[line];
    // Walk to every other node on this line.
    nodes.forEach((v, j) => j !== u && v.line === line && relax(u, j, Math.abs(v.cx - cx), { walk: v.cx - half }));
    // Drop to the nearest line below at this post, or hop up to one just above.
    let below = null;
    let above = null;
    geo.lines.forEach((M, j) => {
      if (j === line || !onLine(M, cx)) return;
      const dy = M.y - L.y;
      if (dy > 0 && dy <= DROP_MAX && (!below || M.y < geo.lines[below].y)) below = j;
      if (dy < 0 && -dy <= HOP_MAX && (!above || M.y > geo.lines[above].y)) above = j;
    });
    if (below !== null) relax(u, add(below, cx), 120, { hop: below });
    if (above !== null) relax(u, add(above, cx), 120 + (L.y - geo.lines[above].y), { hop: above });
    // Leap across the gap from this line's end to the line beside it.
    const atRight = Math.abs(cx - (L.r - EDGE)) < 1;
    const atLeft = Math.abs(cx - (L.l + EDGE)) < 1;
    geo.lines.forEach((M, j) => {
      if (j === line || Math.abs(M.y - L.y) > 2) return;
      if (atRight && M.l - L.r > 0 && M.l - L.r <= GAP_MAX) relax(u, add(j, M.l + EDGE), 120, { leap: j, x: M.l + EDGE - half });
      if (atLeft && L.l - M.r > 0 && L.l - M.r <= GAP_MAX) relax(u, add(j, M.r - EDGE), 120, { leap: j, x: M.r - EDGE - half });
    });
  }
  const offstage = () => {
    // Exit on the target's side of the board (so he is seen heading for it)
    // and come in on that side, on the target's line.
    const enterLeft = toX + half - geo.viewLeft < geo.viewRight - (toX + half);
    const exitX = enterLeft ? geo.viewLeft - width - 8 : geo.viewRight + 8;
    const enterX = exitX;
    return [{ walk: exitX, off: true }, { enter: toLine, x: enterX }, { walk: toX }];
  };
  if (dist[goal] === Infinity) return offstage();
  const legs = [];
  for (let v = goal; prev[v]; v = prev[v].from) legs.unshift(prev[v].leg);
  return legs;
}

/* ---- The board stage ---- */

// Justin's posture on the roofline by time of day: espresso by the machine in
// the morning, standing through the day, sitting at the right end for dusk
// and the evening, asleep at night. Truffle takes her cue from him.
const posture = {
  night: "sleep",
  dawn: "brew",
  morning: "brew",
  day: "idle",
  golden: "idle",
  dusk: "sit",
  evening: "sit",
};
const truffleBeside = { sleep: "sleep", brew: "sit", idle: "sit", sit: "sleep" };

// What he does on each widget's shelf, and where along it (his centre as a
// fraction of the widget's width).
const visits = {
  home: { act: "brew", at: 0.62 },
  people: { act: "pet", at: 0.5 },
  agents: { act: "idle", at: 0.36 },
  someday: { act: "idle", at: 0.3 },
  built: { act: "type", at: 0.7 },
};
// Residents: the robots on the agents shelf, the coffee corner and the shoe
// rack at his place, the farm on his future plans. Placed by a fraction of
// the widget's width; sizes come from the sheets at render time.
const residents = [
  { who: "luibot", widget: "agents", at: 0.62, act: () => "idle", reacts: true },
  { who: "luibuilder", widget: "agents", at: 0.8, act: () => "idle", reacts: true },
  { who: "coffee", widget: "home", at: 0.62, act: (s) => s.machine ?? "idle" },
  { who: "shoeRack", widget: "home", at: 0.88, act: () => "idle" },
  { who: "chicken", widget: "someday", at: 0.5, act: () => "peck" },
  { who: "sheep", widget: "someday", at: 0.66, act: () => "idle" },
  { who: "cow", widget: "someday", at: 0.86, act: () => "graze" },
  // His desk, with the chair empty until he sits down at it.
  { who: "desk", widget: "built", at: 0.7, act: () => "idle", seat: true },
].filter((r) => characters[r.who]);

const STROLL = { speed: 35, stride: 7, frames: 4 }; // 7px a frame at 200ms
const VISIT_SPEED = 240; // 7px a frame at 29ms: on his way somewhere, at a run
const TROT = { speed: 90, stride: 6, frames: 4 }; // 6px a frame at 67ms
const RUN_SPEED = 170; // Truffle called down to him
const CHEERS = new Set(["idle", "sip", "hat"]); // poses that can raise both arms
const TIPS = new Set(["idle", "sip"]);

// Someone who walks the ledges: where they are (`line`, `mover.x`), what
// they are in the middle of (`hop`, `legs`), and whether they are offstage.
const walker = (spec, walkAct, width) => ({
  mover: new Mover({ x: 0, ...spec }),
  walkAct,
  width,
  line: 0,
  hop: null,
  legs: [],
  onArrive: null,
  pending: null,
  off: false,
});

export function Stage({ period, outfit, cheer, visit, paused }) {
  const stageEl = useRef(null); // its parent is the board
  const justinEl = useRef(null);
  const truffleEl = useRef(null);
  const ballEl = useRef(null);
  const geo = useRef(null);
  const [ready, setReady] = useState(false);
  const [layout, setLayout] = useState(0); // bumped whenever the ledges are re-read

  // Justin and Truffle: where they are and what they are doing.
  const J = useRef({ ...walker(STROLL, "walk", JUSTIN_W), who: "j", mode: "rest", visit: null });
  const T = useRef({ ...walker(TROT, "trot", TRUFFLE_W), who: "t", fetched: false });
  const ball = useRef(new Roller(0));
  const [jAct, setJAct] = useState("idle");
  const [jFlip, setJFlip] = useState(false);
  const [jFrame, setJFrame] = useState(0);
  const [jOff, setJOff] = useState(false);
  const [tAct, setTAct] = useState("sit");
  const [tFlip, setTFlip] = useState(false);
  const [tFrame, setTFrame] = useState(0);
  const [tOff, setTOff] = useState(false);
  const [tOnRoof, setTOnRoof] = useState(true);
  const [bFrame, setBFrame] = useState(0);
  const [brew, setBrew] = useState(null); // a BREW_STEPS entry
  const [tipping, justinHover] = useHoverOrTap();
  const [petting, truffleHover] = useHoverOrTap();
  const acts = useRef({ j: "idle", t: "sit" });
  const rendered = useRef({ j: "idle", t: "sit" });
  const justinProps = { ...justinHover, ref: (el) => (justinEl.current = justinHover.ref.current = el) };
  const truffleProps = { ...truffleHover, ref: (el) => (truffleEl.current = truffleHover.ref.current = el) };

  const setJustin = (act) => {
    acts.current.j = act;
    setJAct(act);
  };
  const setTruffle = (act) => {
    acts.current.t = act;
    setTAct(act);
  };
  const setAct = (a, act) => (a.who === "j" ? setJustin(act) : setTruffle(act));
  const setOff = (a, off) => {
    a.off = off;
    (a.who === "j" ? setJOff : setTOff)(off);
  };
  const setFlip = (a, flip) => (a.who === "j" ? setJFlip : setTFlip)(flip);

  const groundOf = (a) => (a.hop ? a.hop.y : geo.current.lines[a.line].y);

  const placeAll = useCallback(() => {
    const g = geo.current;
    if (!g) return;
    const j = J.current;
    const t = T.current;
    place(justinEl.current, j.mover.x - bodyShift(rendered.current.j), groundOf(j), frameSize("justin", rendered.current.j).h);
    place(truffleEl.current, t.mover.x, groundOf(t), frameSize("truffle", rendered.current.t).h);
    place(ballEl.current, ball.current.x, g.lines[g.roofline].y, 10);
  }, []);

  // Truffle's spot beside Justin on the roofline, facing him, on the side she
  // is already on (or the other one when the roof ends there).
  const besideJustin = useCallback(() => {
    const roof = geo.current.lines[geo.current.roofline];
    const jw = frameSize("justin", acts.current.j).w;
    const [lo, hi] = standable(roof, TRUFFLE_W);
    const left = { x: J.current.mover.x - TRUFFLE_W - 8, flip: false };
    const right = { x: J.current.mover.x + jw + 8, flip: true };
    const [near, far] = T.current.mover.x > J.current.mover.x ? [right, left] : [left, right];
    return near.x >= lo && near.x <= hi ? near : far;
  }, []);

  // Her own place on the roof when he is elsewhere: the middle, clear of the corners.
  const dogRest = useCallback(() => {
    const g = geo.current;
    const roof = g.lines[g.roofline];
    return restNear(g, roof, TRUFFLE_W, (roof.l + roof.r) / 2 - 80);
  }, []);

  /* -- Legs -- */

  const nextLeg = useCallback((a) => {
    const g = geo.current;
    const leg = a.legs.shift();
    if (!leg) {
      const done = a.onArrive;
      a.onArrive = null;
      done?.();
      return;
    }
    if (leg.walk !== undefined) {
      if (Math.abs(leg.walk - a.mover.x) < 1) return nextLeg(a);
      setAct(a, a.walkAct);
      a.mover.go(leg.walk, () => {
        if (leg.off) setOff(a, true);
        nextLeg(a);
      });
    } else if (leg.enter !== undefined) {
      a.line = leg.enter;
      a.mover.x = leg.x;
      setOff(a, false);
      nextLeg(a);
    } else {
      // A drop, a hop up, or a leap across the gap: mid-stride for a small
      // one, arms out for a long fall.
      const to = leg.hop ?? leg.leap;
      const toX = leg.x ?? a.mover.x;
      const big = Math.abs(g.lines[to].y - g.lines[a.line].y) > 100;
      setAct(a, a.who === "j" ? (big ? "arms-up" : "walk") : "trot");
      if (toX !== a.mover.x) setFlip(a, toX < a.mover.x);
      a.hop = new Hop({
        fromY: g.lines[a.line].y,
        toY: g.lines[to].y,
        fromX: a.mover.x,
        toX,
        onLand: () => {
          a.line = to;
          a.hop = null;
          nextLeg(a);
        },
      });
    }
    return undefined;
  }, []);

  // Send someone to a ledge, now: whatever they were doing is dropped (a hop
  // in the air lands first). From offstage they simply come in on the
  // target's side.
  const travel = useCallback(
    (a, line, x, speed, onArrive) => {
      const go = () => {
        a.mover.stop();
        a.mover.speed = speed;
        a.onArrive = onArrive;
        if (a.off) {
          const g = geo.current;
          const enterLeft = x + a.width / 2 - g.viewLeft < g.viewRight - (x + a.width / 2);
          a.legs = [{ enter: line, x: enterLeft ? g.viewLeft - a.width - 8 : g.viewRight + 8 }, { walk: x }];
        } else a.legs = route(geo.current, a.width, a.line, a.mover.x, line, x);
        nextLeg(a);
      };
      a.pending = null;
      if (a.hop) a.pending = go;
      else go();
    },
    [nextLeg],
  );

  // Where he rests: mornings on his place's shelf, to the right of the
  // machine; otherwise on the roofline, in the middle of the board by day and
  // at the right end, sitting or asleep, when the light goes.
  const restSpot = useCallback((pose) => {
    const g = geo.current;
    const w = frameSize("justin", pose === "brew" ? "idle" : pose).w;
    if (pose === "brew") {
      const line = g.find("home", "floor");
      const home = g.widgets.find((x) => x.id === "home");
      const machine = residents.find((r) => r.who === "coffee");
      if (line >= 0 && home && machine) {
        const mw = frameSize("coffee", "idle").w;
        const mx = Math.round(home.l + (home.r - home.l) * machine.at - mw / 2);
        const [lo, hi] = standable(g.lines[line], w);
        return { line, x: clamp(mx + BREW.standX, lo, hi) };
      }
    }
    const roof = g.lines[g.roofline];
    const x = pose === "sit" || pose === "sleep" ? roof.r - w - 24 : (roof.l + roof.r) / 2 - w / 2 - 60;
    return { line: g.roofline, x: restNear(g, roof, w, x) };
  }, []);

  /* -- Truffle -- */

  // She keeps him company on the roofline. Anywhere else she stays put.
  const truffleTick = useCallback(() => {
    const g = geo.current;
    const j = J.current;
    const t = T.current;
    if (t.mover.moving || t.hop || t.legs.length || t.pending || acts.current.t === "sleep") return;
    if (t.line !== g.roofline) return;
    if (j.line !== g.roofline || j.off) {
      // He has left the roof: she settles where she is, clear of the corner.
      if (acts.current.t === "trot") {
        const x = restNear(g, g.lines[g.roofline], TRUFFLE_W, t.mover.x);
        if (Math.abs(x - t.mover.x) >= 1) t.mover.go(x, () => setTruffle("sit"));
        else setTruffle("sit");
      }
      return;
    }
    if (j.hop) return;
    const jMoving = j.mover.moving || j.legs.length > 0;
    if (jMoving) {
      t.fetched = false;
      if (acts.current.t !== "trot") setTruffle("trot");
      const jw = frameSize("justin", "walk").w;
      // Her own side of him, a step away; she never crosses him.
      t.mover.go(
        () => (t.mover.x > j.mover.x ? j.mover.x + jw + 8 : j.mover.x - TRUFFLE_W - 8),
        () => {},
        () => J.current.mover.moving,
      );
      return;
    }
    if (t.fetched) return; // at the ball, nose to it, until he moves again
    const mark = besideJustin();
    if (Math.abs(mark.x - t.mover.x) >= 1) {
      setTruffle("trot");
      t.mover.go(mark.x, () => {
        setTFlip(mark.flip);
        setTruffle(truffleBeside[acts.current.j] ?? "sit");
      });
    } else if (acts.current.t === "trot") {
      setTFlip(mark.flip);
      setTruffle(truffleBeside[acts.current.j] ?? "sit");
    }
  }, [besideJustin]);

  /* -- The loop -- */

  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const tick = useCallback(
    (dt) => {
      // Under an open sheet the board is hidden: nothing moves, nothing renders.
      if (pausedRef.current) return false;
      const j = J.current;
      const t = T.current;
      const b = ball.current;
      let busy = false;
      for (const a of [j, t]) {
        if (a.hop) {
          busy = true;
          const hop = a.hop;
          hop.step(dt);
          if (hop.leap) a.mover.x = hop.x;
        }
        if (a.pending && !a.hop) {
          const go = a.pending;
          a.pending = null;
          go();
        }
      }
      if (j.mover.step(dt)) busy = true;
      truffleTick();
      if (t.mover.step(dt)) busy = true;
      if (b.step(dt)) busy = true;
      if (j.legs.length || j.pending || t.legs.length || t.pending) busy = true;
      placeAll();
      // Synchronous, so the new frame paints with the step that earned it.
      flushSync(() => {
        if (j.mover.moving) {
          setJFrame(j.mover.frame);
          setJFlip(j.mover.facing < 0);
        }
        if (t.mover.moving) {
          setTFrame(t.mover.frame);
          setTFlip(t.mover.facing < 0);
        }
        setBFrame(b.frame);
        setTOnRoof(t.line === geo.current.roofline);
      });
      return busy;
    },
    [placeAll, truffleTick],
  );
  const kick = useTicker(tick);

  /* -- The brew -- */

  const brewTimer = useRef(0);
  const stopBrew = useCallback(() => {
    clearTimeout(brewTimer.current);
    setBrew(null);
  }, []);
  const startBrew = useCallback(() => {
    let i = 0;
    const run = () => {
      const step = BREW_STEPS[i];
      setBrew(step);
      setJustin(step.him);
      if (step.ms !== Infinity) {
        i += 1;
        brewTimer.current = setTimeout(run, step.ms);
      }
    };
    clearTimeout(brewTimer.current);
    if (reducedMotion()) {
      const last = BREW_STEPS[BREW_STEPS.length - 1];
      setBrew(last);
      setJustin(last.him);
      return;
    }
    run();
  }, []);

  /* -- Rest, visits, hours -- */

  // He is on the people shelf: she comes down to him (or is there
  // already), sits under his hand, and only then does he kneel.
  const callDog = useCallback(() => {
    const g = geo.current;
    const j = J.current;
    const t = T.current;
    const line = g.find("people", "floor");
    // He kneels toward the side she comes from.
    const flip = t.mover.x + TRUFFLE_W / 2 < j.mover.x + JUSTIN_W / 2;
    const tx = petDogX(j.mover.x, flip, PET.sit);
    const settle = () => {
      setTFlip(!flip);
      setTruffle("sit");
      if (j.mode === "visiting" && j.visit === "people") {
        setJFlip(flip);
        setJustin("pet");
      }
    };
    if (acts.current.t === "sleep") setTruffle("sit");
    t.fetched = false;
    if (t.line === line && !t.hop && !t.legs.length && Math.abs(t.mover.x - tx) < 1) settle();
    else travel(t, line, tx, RUN_SPEED, settle);
  }, [travel]);

  const arriveAt = useCallback(
    (act) => {
      setJFlip(false);
      if (act === "brew") startBrew();
      else if (act === "pet") {
        setJustin("idle");
        callDog();
      } else setJustin(act);
    },
    [callDog, startBrew],
  );

  // Back to the hour's resting place and posture.
  const goRest = useCallback(
    (instant, fresh = false) => {
      const g = geo.current;
      const j = J.current;
      const t = T.current;
      const pose = posture[period];
      stopBrew();
      const keepPlace = !fresh && pose === "idle" && j.line === g.roofline && j.mode === "rest";
      const spot = keepPlace ? { line: g.roofline, x: j.mover.x } : restSpot(pose);
      j.mode = "returning";
      j.visit = null;
      const arrive = () => {
        j.mode = "rest";
        arriveAt(pose);
        if (instant) {
          // Everyone lands at once: she is on the roof, beside him or at her own spot.
          t.mover.stop();
          t.legs = [];
          t.hop = null;
          t.pending = null;
          t.fetched = false;
          t.line = g.roofline;
          setOff(t, false);
          if (spot.line === g.roofline) {
            const { x: tx, flip } = besideJustin();
            t.mover.x = tx;
            setTFlip(flip);
          } else {
            t.mover.x = dogRest();
            setTFlip(false);
          }
          setTruffle(truffleBeside[pose] ?? "sit");
          setTOnRoof(true);
        }
        kick();
      };
      if (instant) {
        j.mover.stop();
        j.legs = [];
        j.hop = null;
        j.pending = null;
        setOff(j, false);
        j.line = spot.line;
        j.mover.x = spot.x;
        arrive();
        placeAll();
        return;
      }
      travel(j, spot.line, spot.x, pose === "idle" ? STROLL.speed : VISIT_SPEED, arrive);
      kick();
    },
    [arriveAt, besideJustin, dogRest, kick, period, placeAll, restSpot, stopBrew, travel],
  );

  const goVisit = useCallback(
    (id, instant) => {
      const g = geo.current;
      const j = J.current;
      const spec = visits[id];
      const line = g.find(id, "floor");
      const widget = g.widgets.find((w) => w.id === id);
      if (!spec || line < 0 || !widget) return;
      stopBrew();
      if (acts.current.t === "sleep") setTruffle("sit");
      let x = widget.l + (widget.r - widget.l) * spec.at - JUSTIN_W / 2;
      if (spec.act === "brew") {
        const machine = residents.find((r) => r.who === "coffee");
        if (machine) x = Math.round(widget.l + (widget.r - widget.l) * machine.at - frameSize("coffee", "idle").w / 2) + BREW.standX;
      }
      if (spec.act === "type") {
        // On the desk's chair: the desk canvas is type's, so his body sits at its body offset.
        const desk = residents.find((r) => r.who === "desk");
        if (desk) x = Math.round(widget.l + (widget.r - widget.l) * desk.at - frameSize("desk", "idle").w / 2) + bodyShift("type");
      }
      const [lo, hi] = standable(g.lines[line], JUSTIN_W);
      x = clamp(x, lo, hi);
      j.mode = "toVisit";
      j.visit = id;
      const arrive = () => {
        j.mode = "visiting";
        arriveAt(spec.act);
      };
      if (instant) {
        j.mover.stop();
        j.legs = [];
        j.hop = null;
        j.pending = null;
        setOff(j, false);
        j.line = line;
        j.mover.x = x;
        arrive();
        placeAll();
        return;
      }
      travel(j, line, x, VISIT_SPEED, arrive);
      kick();
    },
    [arriveAt, kick, placeAll, stopBrew, travel],
  );

  // Geometry on mount, on any resize of the board or a widget (a webfont
  // landing moves shelves too); every re-read lands everyone at rest and
  // re-places the residents.
  const mounted = useRef(false);
  useLayoutEffect(() => {
    const board = stageEl.current?.parentElement;
    if (!board) return undefined;
    const measure = () => {
      geo.current = readBoard(board);
      const g = geo.current;
      goRest(true, true);
      const roof = g.lines[g.roofline];
      ball.current.x = restNear(g, roof, 10, mounted.current ? ball.current.x : T.current.mover.x - 40);
      placeAll();
      setLayout((n) => n + 1);
    };
    measure();
    mounted.current = true;
    setReady(true);
    const observer = new ResizeObserver(measure);
    observer.observe(board);
    board.querySelectorAll(".gw").forEach((el) => observer.observe(el));
    document.fonts?.ready.then(() => mounted.current && measure());
    return () => {
      observer.disconnect();
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The hour changes his posture: if he is still at his resting place he
  // walks to the new one (or lands there under reduced motion). A visit's
  // place is kept: he stays where the visitor put him.
  useEffect(() => {
    if (!geo.current) return;
    if (J.current.mode === "rest") goRest(reducedMotion());
  }, [period, goRest]);

  // Visits: the pointed widget, after its dwell, at once, from wherever he
  // is. When the pointer leaves he stays where he is: nobody walks home on
  // their own, and nobody wanders. Only the visitor (or the hour) moves him.
  useEffect(() => {
    if (!geo.current || !visit || !visits[visit]) return;
    goVisit(visit, reducedMotion());
  }, [visit, goVisit]);

  useLayoutEffect(placeAll, [jAct, tAct, jFlip, brew, placeAll]);

  // The sheet closed: pick the motion back up where it stopped.
  useEffect(() => {
    if (!paused) kick();
  }, [paused, kick]);

  /* -- The ball -- */

  const throwBall = () => {
    const g = geo.current;
    const b = ball.current;
    if (!g || b.moving) return;
    const [lo, hi] = restable(g, g.lines[g.roofline], 10);
    // A throw of 160 to 300px, so she is never off on a long fetch.
    const near = [Math.max(lo, b.x - 300), Math.min(hi, b.x + 300)];
    let to = near[0] + Math.random() * (near[1] - near[0]);
    if (Math.abs(to - b.x) < 160) to = clamp(b.x + (to < b.x ? -160 : 160), ...near);
    to = restNear(g, g.lines[g.roofline], 10, to); // on a roof, never in the gap between two
    if (reducedMotion()) {
      b.x = to;
      b.from = to;
    } else b.throwTo(to, 1.1);
    // She wakes if she must, gives it a beat, trots over and sits with her
    // nose at the ball, and stays there until he moves.
    const chase = to > T.current.mover.x ? to - TRUFFLE_W - 4 : to + 10 + 4;
    const settle = () => {
      setTFlip(to < T.current.mover.x);
      setTruffle("sit");
      T.current.fetched = true;
    };
    if (reducedMotion()) {
      T.current.mover.x = chase;
      settle();
      placeAll();
    } else
      setTimeout(() => {
        setTruffle("trot");
        T.current.mover.go(chase, settle);
        kick();
      }, 220);
    kick();
  };

  /* -- Render -- */

  const hatFrame = useHatTip(tipping && TIPS.has(jAct));
  const justinAction = cheer && CHEERS.has(jAct) ? "arms-up" : hatFrame !== null && TIPS.has(jAct) ? "hat" : jAct;
  const justinFrame = jAct === "walk" ? jFrame : justinAction === "hat" ? hatFrame : brew?.him === jAct ? brew.frame : undefined;
  // Asleep, she lifts one ear at a pointer on her, and goes back to sleep.
  const truffleAction = petting && tAct === "sleep" ? "ear" : tAct;
  rendered.current = { j: justinAction, t: truffleAction };

  const g = geo.current;
  void layout; // the residents below are placed from the latest read
  const placed = g
    ? residents.flatMap((r) => {
        const w = g.widgets.find((x) => x.id === r.widget);
        const line = g.lines[g.find(r.widget, "floor")];
        if (!w || !line) return [];
        const act = r.act(brew ?? {});
        const { w: pw, h } = frameSize(r.who, act);
        const x = clamp(Math.round(w.l + (w.r - w.l) * r.at - pw / 2), w.l + g.pad, w.r - g.pad - pw);
        return [{ ...r, act, x, y: line.y, h }];
      })
    : [];

  return (
    <div ref={stageEl} className={`gl-stage${ready ? " is-ready" : ""}`}>
      {placed.map((p) =>
        p.reacts ? (
          <Robot key={p.who} character={p.who} style={{ transform: `translate(${p.x}px, ${p.y - p.h}px)` }} />
        ) : (
          <span
            key={p.who}
            className="gl-actor"
            aria-hidden="true"
            style={{ transform: `translate(${p.x}px, ${p.y - p.h}px)` }}
            hidden={p.seat && jAct === "type"}
          >
            <Sprite character={p.who} action={p.act} scale={1} />
          </span>
        ),
      )}
      <span
        className="gl-actor gl-reacts"
        aria-hidden="true"
        style={{ zIndex: dogOnTop(justinAction) ? 3 : 1 }}
        hidden={tOff}
        {...truffleProps}
      >
        <Sprite character="truffle" action={truffleAction} flip={tFlip} frame={tAct === "trot" ? tFrame : undefined} scale={1} />
      </span>
      <span className="gl-actor gl-reacts" aria-hidden="true" style={{ zIndex: 2 }} hidden={jOff} {...justinProps}>
        <Sprite character="justin" action={justinAction} outfit={outfit} flip={jFlip} frame={justinFrame} scale={1} />
      </span>
      <button
        ref={ballEl}
        type="button"
        className="gl-actor gl-ball"
        aria-label="Throw the tennis ball for Truffle"
        hidden={!ready || !tOnRoof}
        onClick={throwBall}
      >
        <Pixels sheet={ballSheet} action="roll" frame={bFrame} />
      </button>
    </div>
  );
}

function Pixels({ sheet, action, frame = 0 }) {
  const rows = sheet.actions[action].frames[frame];
  return (
    <svg width={rows[0].length} height={rows.length} viewBox={`0 0 ${rows[0].length} ${rows.length}`} shapeRendering="crispEdges">
      {rows.flatMap((row, y) =>
        [...row].map(
          (ch, x) => sheet.palette[ch] && <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill={sheet.palette[ch]} />,
        ),
      )}
    </svg>
  );
}

// luibot waves and luibuilder tips his hat while the pointer is on them (a
// tap, on touch). Under prefers-reduced-motion Sprite holds the first frame.
export function Robot({ character, className = "", style }) {
  const [over, props] = useHoverOrTap();
  return (
    <span className={`gl-actor gl-reacts ${className}`} style={style} aria-hidden="true" {...props}>
      <Sprite character={character} action={over ? "wave" : "idle"} scale={1} />
    </span>
  );
}

/* ---- The sheet's floor ---- */

const ENTER = { speed: 150, stride: 7, frames: 4 }; // walking into a sheet: 7px a frame at 47ms
const ENTER_TROT = { speed: 140, stride: 6, frames: 4 };
const ENTER_MAX_S = 2.2; // a "near" entrance longer than this comes from the other side instead

// The floor strip of an open sheet. Residents are in place when the sheet
// lands; whoever `from` names walks in ("left", "right", or "near": the side
// nearer to where he stood on the board, so no two openings begin alike).
// `scene`: [{ who, act, at, from, flip, with }] with `at` the sprite centre
// (his body's centre, for Justin) as a fraction of the floor width and
// `with: "justin"` for Truffle's mark in the petting composition. `ready`
// says the sheet has its final size, so the floor can be measured.
export function Floor({ scene, outfit, cheer, nearSide = "left", startDelay = 0, ready = true }) {
  const floorEl = useRef(null);
  const els = useRef([]);
  const movers = useRef([]);
  const marks = useRef([]);
  const walkers = new Set(["justin", "truffle"]);
  const [acts, setActs] = useState(() =>
    scene.map((a) =>
      a.from && !reducedMotion() && walkers.has(a.who) ? (a.who === "justin" ? "walk" : "trot") : a.act === "pet" ? "idle" : a.act,
    ),
  );
  const [frames, setFrames] = useState(() => scene.map(() => 0));
  const [flips, setFlips] = useState(() => scene.map((a) => a.flip ?? false));
  const [tipping, justinHover] = useHoverOrTap();
  const [greeting, setGreeting] = useState(false); // his hat tip on arrival
  const [laid, setLaid] = useState(false);
  const justinIndex = scene.findIndex((a) => a.who === "justin");
  const justinProps = {
    ...justinHover,
    ref: (el) => (els.current[justinIndex] = justinHover.ref.current = el),
  };
  const renderedActs = useRef(acts);

  const ground = () => floorEl.current.clientHeight; // the strip's bottom border is the shelf
  const canvasX = (i, x, action) => (scene[i].who === "justin" ? x - bodyShift(action) : x);

  const tick = useCallback(
    (dt) => {
      if (!floorEl.current) return false;
      let busy = false;
      movers.current.forEach((m, i) => {
        if (!m) return;
        if (m.step(dt)) busy = true;
        const action = m.moving ? (scene[i].who === "justin" ? "walk" : "trot") : renderedActs.current[i];
        place(els.current[i], canvasX(i, m.x, action), ground(), frameSize(scene[i].who, action).h);
      });
      flushSync(() => {
        setFrames(movers.current.map((m) => m?.frame ?? 0));
        setFlips((old) => movers.current.map((m, i) => (m?.moving ? m.facing < 0 : old[i])));
      });
      return busy;
    },
    [scene],
  );
  const kick = useTicker(tick);

  useLayoutEffect(() => {
    if (!ready || laid) return;
    const width = floorEl.current.clientWidth;
    // Marks first: Truffle's may hang off Justin's. His mark is his body's left edge.
    scene.forEach((a, i) => {
      const w = a.who === "justin" ? JUSTIN_W : frameSize(a.who, a.act).w;
      marks.current[i] = Math.round(width * a.at - w / 2);
    });
    scene.forEach((a, i) => {
      if (a.with) {
        const j = scene.findIndex((s) => s.who === a.with);
        marks.current[i] = petDogX(marks.current[j], scene[j].flip ?? false, PET.sit);
      }
    });
    scene.forEach((a, i) => {
      if (!walkers.has(a.who)) return;
      const rest = a.act === "pet" || a.act === "hat" ? "idle" : a.act;
      const target = marks.current[i];
      if (a.from && !reducedMotion()) {
        const spec = a.who === "justin" ? ENTER : ENTER_TROT;
        const walkAct = a.who === "justin" ? "walk" : "trot";
        const w = frameSize(a.who, walkAct).w;
        const startX = (side) => (side === "left" ? -w - 6 : width + 6);
        let side = a.from === "near" ? nearSide : a.from;
        if (a.from === "near" && Math.abs(target - startX(side)) / spec.speed > ENTER_MAX_S) side = side === "left" ? "right" : "left";
        const m = new Mover({ x: startX(side), ...spec });
        movers.current[i] = m;
        const start = () => {
          m.go(target, () => {
            // A pet waits for the dog; a hat tip plays once he stands; anything else settles on arrival.
            setActs((old) => old.map((act, k) => (k === i ? rest : act)));
            setFlips((old) => old.map((f, k) => (k === i ? (a.flip ?? false) : f)));
            if (a.act === "hat") setGreeting(true);
          });
          kick();
        };
        // The walk begins once the sheet has landed; she sets off after him,
        // so she is never in his way.
        setTimeout(start, startDelay + (a.with ? 500 : 0));
        place(els.current[i], canvasX(i, m.x, walkAct), ground(), frameSize(a.who, walkAct).h);
      } else {
        place(els.current[i], canvasX(i, target, rest), ground(), frameSize(a.who, rest).h);
      }
    });
    setLaid(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Once both are on their marks, the pet begins.
  useEffect(() => {
    const j = justinIndex;
    const t = scene.findIndex((a) => a.with === "justin");
    if (j < 0 || t < 0 || scene[j].act !== "pet") return;
    if (acts[j] === "idle" && acts[t] === scene[t].act) setActs((old) => old.map((act, k) => (k === j ? "pet" : act)));
  }, [acts, scene, justinIndex]);

  // A pose change (walk to sip, say) changes the sprite's canvas: re-seat it.
  useLayoutEffect(() => {
    scene.forEach((a, i) => {
      if (!walkers.has(a.who) || !els.current[i]) return;
      const m = movers.current[i];
      const x = m ? m.x : marks.current[i];
      if (!m || !m.moving) place(els.current[i], canvasX(i, x, renderedActs.current[i]), ground(), frameSize(a.who, renderedActs.current[i]).h);
    });
  });

  const hatFrame = useHatTip(greeting || (tipping && TIPS.has(acts[justinIndex])));
  useEffect(() => {
    if (greeting && hatFrame === null) setGreeting(false);
  }, [greeting, hatFrame]);

  const desk = justinIndex >= 0 && scene[justinIndex].act === "type" && characters.desk ? marks.current[justinIndex] - bodyShift("desk") : null;

  return (
    <div ref={floorEl} className={`gl-floor${laid ? " is-ready" : ""}`} aria-hidden="true">
      {desk !== null && (
        // His desk is there before him; he sits down at it (type's furniture is the same, cell for cell).
        <span className="gl-actor gl-floor-prop" style={{ left: `${desk}px` }} hidden={acts[justinIndex] === "type"}>
          <Sprite character="desk" action="idle" scale={1} />
        </span>
      )}
      {scene.map((a, i) => {
        const moving = acts[i] === "walk" || acts[i] === "trot";
        if (!walkers.has(a.who)) {
          const Tag = a.who === "luibot" || a.who === "luibuilder" ? Robot : null;
          const style = { left: `calc(${a.at * 100}% - ${frameSize(a.who, a.act).w / 2}px)` };
          return Tag ? (
            <Tag key={a.who} character={a.who} className="gl-floor-prop" style={style} />
          ) : (
            <span key={a.who} className="gl-actor gl-floor-prop" style={style}>
              <Sprite character={a.who} action={a.act} scale={1} />
            </span>
          );
        }
        const action =
          a.who === "justin" && !moving
            ? cheer && CHEERS.has(acts[i])
              ? "arms-up"
              : hatFrame !== null && TIPS.has(acts[i])
                ? "hat"
                : acts[i]
            : acts[i];
        renderedActs.current[i] = action;
        return (
          <span
            key={a.who}
            ref={(el) => {
              els.current[i] = el;
            }}
            className={`gl-actor${a.who === "justin" ? " gl-reacts" : ""}`}
            style={{ zIndex: a.who === "justin" ? 2 : a.who === "truffle" && dogOnTop(renderedActs.current[justinIndex]) ? 3 : 1 }}
            {...(a.who === "justin" ? justinProps : {})}
          >
            <Sprite
              character={a.who}
              action={action}
              outfit={outfit}
              flip={flips[i]}
              frame={moving ? frames[i] : action === "hat" ? hatFrame : undefined}
              scale={1}
            />
          </span>
        );
      })}
    </div>
  );
}
