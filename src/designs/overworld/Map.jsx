import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Sprite, characters } from "../../sprites/Sprite.jsx";
import * as props from "./props.js";

export const MAP_W = 640;
export const MAP_H = 460;

// The path is one polyline; a stop is a point on it, by index. Point 0 is the
// bed, a spur off the start that only the sleeping Justin uses. Between the
// workshop and the mountains the path dips below the robots.
const path = [
  [78, 406],
  [190, 430],
  [300, 434],
  [456, 430],
  [446, 386],
  [372, 340],
  [400, 284],
  [300, 288],
  [176, 284],
  [166, 244],
  [182, 198],
  [186, 148],
  [224, 178],
  [300, 178],
  [340, 152],
  [440, 148],
];

// Where the path would go on, if the map went on. Dots only.
const beyond = [
  [440, 148],
  [530, 158],
  [636, 154],
];

const cumulative = (pts) =>
  pts.reduce((acc, [x, y], i) => (i === 0 ? [0] : [...acc, acc[i - 1] + Math.hypot(x - pts[i - 1][0], y - pts[i - 1][1])]), []);
const cum = cumulative(path);
const total = cum[cum.length - 1];

// Where distance `s` along `cums` falls: the segment and the fraction of it.
const segmentAt = (cums, s) => {
  let i = 1;
  while (i < cums.length - 1 && cums[i] < s) i += 1;
  const t = cums[i] === cums[i - 1] ? 0 : (s - cums[i - 1]) / (cums[i] - cums[i - 1]);
  return { i, t };
};
const along = (pts, cums) => (s) => {
  const { i, t } = segmentAt(cums, s);
  const [ax, ay] = pts[i - 1];
  const [bx, by] = pts[i];
  return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t, dx: bx - ax, dy: by - ay };
};
const pointAt = along(path, cum);
const beyondCum = cumulative(beyond);
const beyondAt = along(beyond, beyondCum);

// Truffle's lane: the path shifted LANE px to its right-hand side, walking
// away from the bed. One side throughout, so the lane never crosses the path
// and she is beside him, never on his line, whichever way they go; on the
// bottom and top stretches that side is towards the viewer. Each corner is
// mitred (moved to where the two shifted segments meet), so the lane bends
// where the path bends, stays LANE from it, and her position is continuous in
// `s`: laneAt(s) is her ground point for the same `s` that puts him at
// pointAt(s).
const LANE = 16;
const normals = path.slice(1).map(([bx, by], i) => {
  const [ax, ay] = path[i];
  const len = Math.hypot(bx - ax, by - ay);
  return [-(by - ay) / len, (bx - ax) / len];
});
const lane = path.map(([x, y], i) => {
  const a = normals[Math.max(0, i - 1)];
  const b = normals[Math.min(normals.length - 1, i)];
  const k = LANE / (1 + a[0] * b[0] + a[1] * b[1]);
  return [x + k * (a[0] + b[0]), y + k * (a[1] + b[1])];
});
// `stretch`: how much longer her lane runs than his path on that segment.
const laneAt = (s) => {
  const { i, t } = segmentAt(cum, s);
  const [ax, ay] = lane[i - 1];
  const [bx, by] = lane[i];
  return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t, stretch: Math.hypot(bx - ax, by - ay) / (cum[i] - cum[i - 1]) };
};

// `at` indexes the path. `settle` is his pose once there; `face` flips the
// side-view poses. Truffle settles FOLLOW short of him on the side they
// arrive from, unless the stop has a `rest`: her spot along the path from
// his, for the two stops where the way in from above is up a slope right
// behind his head. `label` is where the name sits and `hit` the link's box,
// both in map px.
export const stops = [
  { id: "home", name: "Home", at: 1, settle: "idle", label: [190, 436], hit: [20, 356, 220, 92] },
  { id: "cafe", name: "The cafe", at: 3, rest: -40, settle: "sip", label: [456, 436], hit: [420, 306, 200, 142] },
  { id: "court", name: "The court", at: 6, settle: "hat", label: [506, 290], hit: [352, 190, 200, 112] },
  { id: "table", name: "The table", at: 8, rest: -40, settle: "sit", face: true, dogSettle: "sleep", label: [86, 290], hit: [24, 218, 226, 84] },
  { id: "workshop", name: "The workshop", at: 11, settle: "sit", face: true, label: [90, 154], hit: [12, 56, 290, 138] },
  { id: "mountains", name: "The mountains", at: 15, settle: "arms-up", label: [440, 154], hit: [364, 16, 264, 178] },
];

// Walking. Each gait comes from its sheet: `stride` is the px of ground the
// cycle is drawn for per frame, so the frame is floor(walked / stride) and the
// planted foot never slides at any speed. SPEED sets his cadence: at 52px/s a
// walk frame lasts 135ms, 3.7 steps a second, a brisk walk (the sheet is drawn
// for 2.5). Truffle trots at her sheet's own rate (6px per 90ms, 67px/s) but
// only up to a point FOLLOW behind him, so behind him she matches his pace and
// when he has passed her she catches up.
const GAIT = {
  justin: { action: "walk", ...characters.justin.actions.walk },
  truffle: { action: "trot", ...characters.truffle.actions.trot },
};
const SPEED = 52; // px/s along the path, him
const TROT = (GAIT.truffle.stride / GAIT.truffle.interval) * 1000; // px/s, her
const FOLLOW = 40; // px behind him she keeps, and where she settles: the side they came from
// A leg to a neighbouring stop is walked end to end. A jump of two or more
// stops is a cut: he walks out of the old stop, the map goes dark for a beat
// while the pair move, and they walk in to the new one.
const LEAVE = 40;
const CAMERA_MARGIN = 40; // px he keeps from the edge of a narrow map viewport
const ARRIVE = 48;
const CURTAIN = 160; // ms, each way

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Pixels({ rows, className, style }) {
  return (
    <svg
      className={className}
      style={style}
      width={rows[0].length}
      height={rows.length}
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rows.flatMap((row, y) => {
        const out = [];
        for (let x = 0; x < row.length; ) {
          let end = x + 1;
          while (end < row.length && row[end] === row[x]) end += 1;
          const fill = props.palette[row[x]];
          if (fill) out.push(<rect key={`${x},${y}`} x={x} y={y} width={end - x} height="1" fill={fill} />);
          x = end;
        }
        return out;
      })}
    </svg>
  );
}

// A prop pinned by its bottom-left corner, so it stands on the ground line.
// Things lower on the map draw over things above them, like the actors.
const Prop = ({ rows, x, y, z = y, className }) => (
  <Pixels rows={rows} className={className} style={{ left: x, top: y - rows.length, zIndex: z }} />
);

// A rounded rectangle with 4px-stepped corners: land drawn in the same grid as
// everything else on the map.
function stepped(x, y, w, h, r, fill) {
  const rects = [];
  for (let row = 0; row < h; row += 4) {
    const dy = Math.max(0, r - row, row + 4 - (h - r));
    const inset = r - Math.sqrt(Math.max(0, r * r - dy * dy));
    const step = Math.ceil(inset / 4) * 4;
    rects.push(<rect key={row} x={x + step} y={y + row} width={w - 2 * step} height="4" fill={fill} />);
  }
  return rects;
}

// Every 10px along the path, a 3px dot. Dots up to `reached` are filled: the
// way he has come.
function dots(points, from, to, reached) {
  const out = [];
  for (let s = from; s <= to; s += 10) {
    const { x, y } = points(s);
    out.push(
      <rect
        key={s}
        x={Math.round(x) - 1}
        y={Math.round(y) - 1}
        width="3"
        height="3"
        className={s <= reached ? "ow-map__dot ow-map__dot--reached" : "ow-map__dot"}
      />,
    );
  }
  return out;
}

// Sparse grass ticks and stars, the same every render.
const grass = Array.from({ length: 110 }, (_, i) => [((i * 97 + 13) % 616) + 12, ((i * 61 + 29) % 430) + 14]);
const stars = Array.from({ length: 22 }, (_, i) => [((i * 131 + 7) % 600) + 20, ((i * 47 + 5) % 70) + 12]);

const scene = {
  bed: [28, 430],
  cafe: [500, 430],
  net: [434, 284],
  table: [32, 284],
  desk: [20, 148],
  signpost: [468, 148],
  ridge: [376, 118],
  robots: [[228, 148], [266, 148]],
  crates: [300, 148],
};
// The ball rests by his feet at the court, a step in front of him, and rolls to
// a step short of Truffle when they have both settled there.
const ball = { from: [440, 302], short: 20 };
const BALL_QUARTER = (Math.PI * 18) / 4; // px of roll per quarter turn

// Actors draw over the props and the stop links; the night wash, the bubbles
// and the curtain go over the actors.
const Z = { actor: 600, links: 500, night: 900, bubble: 950, curtain: 1200 };

// luibot and luibuilder answer the pointer, or a tap for a moment (a tap
// fires mouseenter and then click, so the click only ever opens), with their
// `wave` action and a bubble above their hat, clear of everyone.
function Robot({ character, x, y }) {
  const [over, setOver] = useState(false);
  const tapped = useRef(0);
  const tap = () => {
    setOver(true);
    clearTimeout(tapped.current);
    tapped.current = setTimeout(() => setOver(false), 2400);
  };
  useEffect(() => () => clearTimeout(tapped.current), []);
  const rows = characters[character].actions.idle.frames[0];
  return (
    <>
      <span
        className="ow-actor ow-actor--robot"
        style={{ left: x, top: y - rows.length, width: rows[0].length, height: rows.length, zIndex: Z.actor + y }}
        onMouseEnter={() => setOver(true)}
        onMouseLeave={() => setOver(false)}
        onClick={tap}
        aria-hidden="true"
      >
        <Sprite character={character} action={over ? "wave" : "idle"} scale={1} />
      </span>
      {over && (
        <span className="ow-label ow-bubble" style={{ left: x + 8, top: y - rows.length - 32, zIndex: Z.bubble }} aria-hidden="true">
          Hi, I&rsquo;m {character}
        </span>
      )}
    </>
  );
}

// The volleyball: still at the court until he and Truffle have settled there,
// then it rolls to her (`dog` is her ground point), turning a quarter every
// 14px of ground.
function Ball({ rolling, dog }) {
  const ref = useRef(null);
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const el = ref.current;
    const to = [dog.x + ball.short, dog.y - 2];
    const dist = Math.hypot(to[0] - ball.from[0], to[1] - ball.from[1]);
    const at = (d) => {
      const t = d / dist;
      el.style.transform = `translate(${Math.round(ball.from[0] + (to[0] - ball.from[0]) * t)}px, ${Math.round(ball.from[1] + (to[1] - ball.from[1]) * t)}px)`;
      // rolling left turns it anticlockwise; the frames are drawn clockwise
      setFrame((4 - (Math.floor(d / BALL_QUARTER) % 4)) % 4);
    };
    if (!rolling) {
      at(0);
      return undefined;
    }
    if (reducedMotion()) {
      at(dist);
      return undefined;
    }
    let d = 0;
    let last = performance.now();
    let id = 0;
    const step = (time) => {
      const dt = Math.max(0, Math.min(0.1, (time - last) / 1000));
      last = time;
      // eases out: a push, then it runs down
      d = Math.min(dist, d + Math.max(12, 90 * (1 - d / dist)) * dt);
      at(d);
      if (d < dist) id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [rolling, dog]);
  return (
    <span className="ow-actor ow-actor--ball" ref={ref} style={{ zIndex: Z.actor + Math.round(dog.y) }} aria-hidden="true">
      <span className="ow-actor__anchor">
        <Pixels rows={props.volleyball[frame]} />
      </span>
    </span>
  );
}

// The map. `current` is the stop index the page is on; Justin walks there
// along the path and Truffle trots after him. Positions go straight to the
// DOM every frame; React only hears about pose and frame changes.
export function Map({ current, night, outfit, cheering, onPick }) {
  const frameRef = useRef(null);
  const viewportRef = useRef(null);
  const justinRef = useRef(null);
  const truffleRef = useRef(null);
  const curtainRef = useRef(null);
  const [justin, setJustin] = useState({ action: stops[current].settle, flip: !!stops[current].face, frame: 0 });
  const [truffle, setTruffle] = useState({ action: "sit", flip: false, frame: 0 });
  const [reached, setReached] = useState(cum[stops[current].at]);
  const [settledAt, setSettledAt] = useState(current);
  const [dogAt, setDogAt] = useState(() => laneAt(cum[stops[current].at] - FOLLOW));
  const [dogOver, setDogOver] = useState(false);
  // j and t: path position (his on the path, hers on her lane, same `s`),
  // walked distance (drives the frame), facing.
  // stop: the stop index the pair are at or heading for, for the cut rule.
  // dark: the curtain is down between two legs of a cut.
  const motion = useRef({ j: null, t: null, stop: current, dark: false, frame: 0, timer: 0 });

  // On a screen narrower than the map, fade the edge that has more map past it.
  const edges = () => {
    const vp = viewportRef.current;
    frameRef.current.toggleAttribute("data-more-left", vp.scrollLeft > 2);
    frameRef.current.toggleAttribute("data-more-right", vp.scrollLeft + vp.clientWidth < vp.scrollWidth - 2);
  };
  useEffect(() => {
    edges();
    window.addEventListener("resize", edges);
    return () => window.removeEventListener("resize", edges);
  }, []);

  useEffect(() => {
    const m = motion.current;
    const target = current === 0 && night ? cum[0] : cum[stops[current].at];
    const still = reducedMotion();
    const curtain = curtainRef.current;
    const clamp = (s) => Math.max(0, Math.min(total, s));

    // The way they are heading. Before the first trip they came out of the
    // bed, or at night went back to it.
    const dir = m.j ? Math.sign(target - m.j.s) || 1 : night && current === 0 ? -1 : 1;
    // She settles FOLLOW short of him, on the side they arrive from, or at the
    // stop's own rest; asleep in the bed he has no side, she lies at its foot.
    const rest = current === 0 && night ? undefined : stops[current].rest;
    const dogTarget = clamp(rest === undefined ? target - dir * FOLLOW : target + rest);

    if (!m.j) {
      m.j = { s: target, walked: 0, flip: !!stops[current].face, frame: 0 };
      m.t = { s: dogTarget, walked: 0, flip: false, frame: 0 };
      // a narrow map starts with the pair at its left edge, the stops ahead of them in view
      viewportRef.current.scrollLeft = Math.min(pointAt(target).x, laneAt(dogTarget).x) - CAMERA_MARGIN / 2;
    }
    if (still) {
      m.j.s = target;
      m.t.s = dogTarget;
    }

    // On a narrow screen the map pans only when he nears an edge, so the view
    // leads the way he walks and a reader's own swipe is left alone.
    const camera = (x) => {
      const vp = viewportRef.current;
      if (vp.clientWidth >= MAP_W) return;
      if (x - vp.scrollLeft < CAMERA_MARGIN) vp.scrollLeft = x - CAMERA_MARGIN;
      else if (x - vp.scrollLeft > vp.clientWidth - CAMERA_MARGIN) vp.scrollLeft = x - vp.clientWidth + CAMERA_MARGIN;
      edges();
    };
    const place = () => {
      const j = pointAt(m.j.s);
      const t = laneAt(m.t.s);
      justinRef.current.style.transform = `translate(${Math.round(j.x)}px, ${Math.round(j.y)}px)`;
      justinRef.current.style.zIndex = Z.actor + Math.round(j.y);
      truffleRef.current.style.transform = `translate(${Math.round(t.x)}px, ${Math.round(t.y)}px)`;
      truffleRef.current.style.zIndex = Z.actor + Math.round(t.y);
    };

    // He settles the moment he arrives; she may still be trotting in.
    let justinSettled = false;
    // A settled actor's frame is -1 so its first step puts it back in its gait.
    const settleJustin = () => {
      justinSettled = true;
      const stop = stops[current];
      m.j.frame = -1;
      setJustin({ action: current === 0 && night ? "sleep" : stop.settle, flip: !!stop.face, frame: 0 });
      setReached(target);
    };
    // Sitting, she faces the viewer; asleep she lies with her head towards him.
    const sit = () => setTruffle({ action: "sit", flip: false, frame: 0 });
    const settleTruffle = () => {
      const stop = stops[current];
      const asleep = stop.dogSettle === "sleep" || (current === 0 && night);
      m.t.frame = -1;
      if (asleep) setTruffle({ action: "sleep", flip: laneAt(m.t.s).x > pointAt(m.j.s).x, frame: 0 });
      else sit();
      setDogAt(laneAt(m.t.s));
      setSettledAt(current);
    };

    // The trip, as legs. A neighbouring stop is walked end to end; a jump
    // walks out, drops the curtain, moves the pair, lifts it, walks in.
    const plan = [];
    const jump = Math.abs(current - m.stop) >= 2;
    m.stop = current;
    const arrive = { kind: "walk", j: target, from: [target - dir * ARRIVE, target - dir * (ARRIVE + FOLLOW)], final: true };
    if (still) {
      plan.push({ kind: "show" });
    } else if (m.dark) {
      plan.push({ kind: "move" }, { kind: "curtain", to: 0 }, arrive);
    } else if (jump) {
      plan.push({ kind: "walk", j: m.j.s + dir * LEAVE }, { kind: "curtain", to: 1 }, { kind: "move" }, { kind: "curtain", to: 0 }, arrive);
    } else if (m.j.s !== target || m.t.s !== dogTarget) {
      plan.push({ kind: "walk", j: target, final: true });
    }

    let leg = null;
    let last = 0;

    const next = () => {
      const step = plan.shift();
      if (!step) {
        if (!justinSettled) settleJustin();
        settleTruffle();
        return;
      }
      if (step.kind === "show") {
        curtain.style.opacity = 0;
        m.dark = false;
        place();
        camera(pointAt(m.j.s).x);
        next();
      } else if (step.kind === "curtain") {
        curtain.style.opacity = step.to;
        m.dark = step.to === 1;
        m.timer = setTimeout(next, CURTAIN);
      } else if (step.kind === "move") {
        m.j.s = clamp(plan[1].from[0]);
        m.t.s = clamp(plan[1].from[1]);
        place();
        camera(pointAt(m.j.s).x);
        next();
      } else {
        leg = { ...step, j: clamp(step.j), jDone: false };
        last = performance.now();
        setSettledAt(-1);
        m.frame = requestAnimationFrame(walk);
      }
    };

    // One actor `ds` along its line, `at` giving the ground point for `s`. Facing
    // follows the way it actually moves; the frame follows the ground covered.
    // No ground covered, nothing changes: a leg's first frame can be 0ms long.
    // The pose is committed in the same frame as the new position (flushSync,
    // which is fine here in an animation frame), so pose and place never
    // disagree.
    const advance = (a, ds, at, gait, set) => {
      if (!ds) return;
      const from = at(a.s);
      a.s += ds;
      const to = at(a.s);
      a.walked += Math.hypot(to.x - from.x, to.y - from.y);
      const flip = to.x !== from.x ? to.x < from.x : a.flip;
      const frame = Math.floor(a.walked / gait.stride) % gait.frames.length;
      if (flip !== a.flip || frame !== a.frame || a.frame === -1) {
        a.flip = flip;
        a.frame = frame;
        flushSync(() => set({ action: gait.action, flip, frame }));
      }
    };

    // She keeps to her lane and only ever moves the way he is going, towards
    // the point FOLLOW behind him (or her spot, once he has arrived). If that
    // point is behind her, because he has turned back towards her, she sits
    // where she is and he passes beside her; she trots after him once he is
    // FOLLOW past. Returns whether she still has ground to cover.
    const follow = (dt, jMoving) => {
      const bound = jMoving ? clamp(m.j.s - dir * FOLLOW) : dogTarget;
      const gap = dir * (bound - m.t.s);
      if (gap <= 0) {
        if (m.t.frame !== -1) {
          m.t.frame = -1;
          flushSync(sit);
        }
        return jMoving;
      }
      // TROT is ground speed; where her lane runs longer than his path, s moves slower
      advance(m.t, dir * Math.min(gap, (TROT * dt) / laneAt(m.t.s).stretch), laneAt, GAIT.truffle, setTruffle);
      return true;
    };

    const walk = (time) => {
      // a frame's timestamp can precede the clock read that started the leg
      const dt = Math.max(0, Math.min(0.1, (time - last) / 1000));
      last = time;
      const jDir = Math.sign(leg.j - m.j.s);
      if (jDir) advance(m.j, jDir * Math.min(Math.abs(leg.j - m.j.s), SPEED * dt), pointAt, GAIT.justin, setJustin);
      const jMoving = m.j.s !== leg.j;
      const tMoving = follow(dt, jMoving);
      place();
      camera(pointAt(m.j.s).x);
      if (!jMoving && leg.final && !leg.jDone) {
        leg.jDone = true;
        settleJustin();
      }
      // a leg before the curtain ends when he is out; the final leg waits for her too
      if (jMoving || (tMoving && leg.final)) m.frame = requestAnimationFrame(walk);
      else next();
    };

    place();
    next();
    return () => {
      cancelAnimationFrame(m.frame);
      clearTimeout(m.timer);
    };
  }, [current, night]);

  const justinAction = cheering && justin.action !== "walk" ? "arms-up" : justin.action;
  const truffleAction = dogOver && truffle.action === "sleep" ? "ear" : truffle.action;
  const justinFrame = justin.action === GAIT.justin.action ? justin.frame : undefined;
  const truffleFrame = truffle.action === GAIT.truffle.action ? truffle.frame : undefined;

  return (
    <div className="ow-map__frame" ref={frameRef}>
      <div className="ow-map__viewport" ref={viewportRef} onScroll={edges}>
        <div className={`ow-map${night ? " ow-map--night" : ""}`} style={{ width: MAP_W, height: MAP_H }}>
          <svg className="ow-map__ground" width={MAP_W} height={MAP_H} viewBox={`0 0 ${MAP_W} ${MAP_H}`} shapeRendering="crispEdges" aria-hidden="true">
            {stepped(4, 4, MAP_W - 8, MAP_H - 8, 36, "var(--ow-shore)")}
            {stepped(10, 10, MAP_W - 20, MAP_H - 20, 32, "var(--ow-land)")}
            {/* a pond, between the workshop and the ridge, with the same ink edge as everything else */}
            {stepped(226, 26, 116, 56, 16, "var(--ow-ink)")}
            {stepped(228, 28, 112, 52, 14, "var(--ow-shore)")}
            {stepped(234, 34, 100, 40, 10, "var(--ow-water)")}
            {stepped(252, 42, 28, 4, 2, "var(--ow-shore)")}
            {/* the ridge's foot: a band of scree the path runs along */}
            {stepped(scene.ridge[0], scene.ridge[1], 240, 8, 4, "var(--ow-land-deep)")}
            {/* worn patches under the stops */}
            {stepped(140, 414, 112, 24, 8, "var(--ow-land-deep)")}
            {stepped(416, 416, 80, 20, 8, "var(--ow-land-deep)")}
            {stepped(352, 270, 96, 20, 8, "var(--ow-land-deep)")}
            {stepped(136, 272, 120, 20, 8, "var(--ow-land-deep)")}
            {stepped(150, 138, 76, 16, 8, "var(--ow-land-deep)")}
            {stepped(392, 136, 96, 20, 8, "var(--ow-land-deep)")}
            {grass.map(([x, y]) => (
              <rect key={`${x},${y}`} x={x} y={y} width="2" height="1" fill="var(--ow-land-deep)" />
            ))}
            {dots(pointAt, cum[1], total, reached)}
            {dots(beyondAt, 10, beyondCum[2], -1)}
          </svg>

          <Prop rows={props.ridge} x={scene.ridge[0]} y={scene.ridge[1]} z={0} />
          <Prop rows={props.bigTree} x={280} y={424} />
          <Prop rows={props.roundTree} x={584} y={246} />
          <Prop rows={props.roundTree} x={344} y={116} />
          <Prop rows={props.bush} x={60} y={222} />
          <Prop rows={props.bush} x={250} y={282} />
          <Prop rows={props.bush} x={588} y={132} />
          <Prop rows={props.bed} x={scene.bed[0]} y={scene.bed[1]} />
          <Prop rows={props.cafe} x={scene.cafe[0]} y={scene.cafe[1]} />
          <Prop rows={props.net} x={scene.net[0]} y={scene.net[1]} />
          <Prop rows={props.table} x={scene.table[0]} y={scene.table[1]} />
          <Prop rows={props.desk} x={scene.desk[0]} y={scene.desk[1]} />
          <Prop rows={props.signpost} x={scene.signpost[0]} y={scene.signpost[1]} />
          <Prop rows={props.crates} x={scene.crates[0]} y={scene.crates[1]} />
          {[["Vancouver", 0], ["NYC", 1]].map(([word, i]) => (
            <span
              key={word}
              className="ow-label ow-map__sign"
              style={{ left: scene.signpost[0] + props.signpostWords[i][0], top: scene.signpost[1] - props.signpost.length + props.signpostWords[i][1], zIndex: scene.signpost[1] }}
            >
              {word}
            </span>
          ))}

          <Ball rolling={settledAt === 2} dog={dogAt} />

          <div className="ow-actors">
            <span className="ow-actor ow-actor--justin" ref={justinRef} aria-hidden="true">
              <span className="ow-actor__anchor">
                <Sprite character="justin" action={justinAction} outfit={outfit} scale={1} flip={justin.flip} frame={justinFrame} />
              </span>
            </span>
            <span className="ow-actor ow-actor--truffle" ref={truffleRef} aria-hidden="true">
              <span className="ow-actor__anchor" onMouseEnter={() => setDogOver(true)} onMouseLeave={() => setDogOver(false)}>
                <Sprite character="truffle" action={truffleAction} scale={1} flip={truffle.flip} frame={truffleFrame} />
              </span>
            </span>
          </div>
          <Robot character="luibuilder" x={scene.robots[0][0]} y={scene.robots[0][1]} />
          <Robot character="luibot" x={scene.robots[1][0]} y={scene.robots[1][1]} />

          {night && (
            <>
              <span className="ow-map__night" style={{ zIndex: Z.night }} />
              <svg className="ow-map__lights" style={{ zIndex: Z.night + 1 }} width={MAP_W} height={MAP_H} viewBox={`0 0 ${MAP_W} ${MAP_H}`} shapeRendering="crispEdges" aria-hidden="true">
                {stars.map(([x, y], i) => (
                  <rect key={i} x={x} y={y} width={i % 3 === 0 ? 2 : 1} height={i % 3 === 0 ? 2 : 1} fill="var(--ow-light)" />
                ))}
                {props.cafeGlass.map(([x, y, w, h]) => (
                  <rect key={`${x},${y}`} x={scene.cafe[0] + x} y={scene.cafe[1] - props.cafe.length + y} width={w} height={h} fill="var(--ow-light)" opacity="0.7" />
                ))}
                <rect
                  x={scene.desk[0] + props.deskLamp[0]}
                  y={scene.desk[1] - props.desk.length + props.deskLamp[1]}
                  width={props.deskLamp[2]}
                  height={props.deskLamp[3]}
                  fill="var(--ow-light)"
                  opacity="0.5"
                />
              </svg>
            </>
          )}

          <nav className="ow-map__stops" aria-label="Stops on the map">
            {stops.map((s, i) => {
              const [hx, hy, hw, hh] = s.hit;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`ow-map__stop${i === current ? " ow-map__stop--current" : ""}`}
                  style={{ left: hx, top: hy, width: hw, height: hh, zIndex: Z.links }}
                  aria-current={i === current ? "location" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    onPick(i);
                  }}
                >
                  <span className="ow-label" style={{ left: s.label[0] - hx, top: s.label[1] - hy }}>
                    {i === current && <span className="ow-map__here" />}
                    {s.name}
                  </span>
                </a>
              );
            })}
          </nav>

          {/* the scene cut for a jump of two or more stops */}
          <span className="ow-map__curtain" ref={curtainRef} style={{ zIndex: Z.curtain }} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

// Directions from the previous stop, true to the drawn map: the cafe is to the
// right of the bed, the court up from the cafe, the table left along the middle,
// the workshop up from the table, the mountains right along the top, and the
// dots carry on past them off the map.
export const directions = {
  home: "Start here. This is home, and yes, that is the bed.",
  cafe: "Out of bed and right along the path. You can’t miss it.",
  court: "From the cafe, up the hill until you hear a ball.",
  table: "Turn around and head left. Follow the smell of dinner.",
  workshop: "From the table, up the hill. It’s the desk with the lamp on it.",
  mountains: "Keep right, past the signpost, until you’re off the map. Nothing but nature from here. Vancouver is that way, roughly.",
};
