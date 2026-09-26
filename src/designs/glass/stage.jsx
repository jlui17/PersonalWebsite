import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Sprite, characters } from "../../sprites/Sprite.jsx";
import ballSheet from "./ball.js";

// The sprites' stage. Two places on the board have a ground line the pixel
// characters can stand on: the roofline (the top edges of the board's first
// row of widgets, where Justin, Truffle and a tennis ball live) and the floor
// strip at the bottom of an open sheet, which the characters walk into. Every
// walk is driven by distance: one walk frame per `stride` px of the sheet, so
// a planted foot never slides, and a sprite always faces the way it moves.

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const frameSize = (character, action) => {
  const rows = characters[character].actions[action].frames[0];
  return { w: rows[0].length, h: rows.length };
};

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

// Where a `width`-wide sprite may stand: on a segment, with a 4px overhang.
const standable = (segments, width) =>
  segments.map(({ l, r }) => [l - 4, r - width + 4]).filter(([a, b]) => b > a);

const clampTo = (x, ranges) => {
  let best = null;
  for (const [a, b] of ranges) {
    const c = Math.min(b, Math.max(a, x));
    if (best === null || Math.abs(c - x) < Math.abs(best - x)) best = c;
  }
  return best ?? x;
};

const pickFar = (ranges, from, minDistance) => {
  const total = ranges.reduce((n, [a, b]) => n + (b - a), 0);
  for (let attempt = 0; attempt < 12; attempt += 1) {
    let pick = Math.random() * total;
    for (const [a, b] of ranges) {
      if (pick <= b - a) {
        const x = a + pick;
        if (Math.abs(x - from) >= minDistance) return x;
        break;
      }
      pick -= b - a;
    }
  }
  return clampTo(from + (Math.random() < 0.5 ? -minDistance : minDistance), ranges);
};

// Justin's posture on the roofline by time of day: espresso on the coffee
// widget in the morning, standing (and now and then strolling) through the
// day, sitting at the right end for dusk and the evening, asleep on the clock
// at night. Truffle takes her cue from him.
const posture = {
  night: "sleep",
  dawn: "sip",
  morning: "sip",
  day: "idle",
  golden: "idle",
  dusk: "sit",
  evening: "sit",
};
const truffleBeside = { sleep: "sleep", sip: "sit", idle: "sit", sit: "sleep" };

const JUSTIN_WALK = { speed: 35, stride: 7, frames: 4 }; // a stroll: 7px a frame at 200ms
const JUSTIN_BRISK = { ...JUSTIN_WALK, speed: 56 }; // walking into a sheet: 7px a frame at 125ms
const TRUFFLE_TROT = { speed: 66, stride: 6, frames: 4 }; // 6px a frame at 90ms

export function Roofline({ period, outfit, cheer }) {
  const stageEl = useRef(null); // its parent is the board
  const justinEl = useRef(null);
  const truffleEl = useRef(null);
  const ballEl = useRef(null);
  const roof = useRef(null); // { ground, segments, spots }
  const justin = useRef(new Mover({ x: 0, ...JUSTIN_WALK }));
  const truffle = useRef(new Mover({ x: 0, ...TRUFFLE_TROT }));
  const ball = useRef(new Roller(0));
  const [ready, setReady] = useState(false);
  const [jAct, setJAct] = useState("idle");
  const [jFlip, setJFlip] = useState(false);
  const [jFrame, setJFrame] = useState(0);
  const [tAct, setTAct] = useState("sit");
  const [tFlip, setTFlip] = useState(false);
  const [tFrame, setTFrame] = useState(0);
  const [bFrame, setBFrame] = useState(0);
  const [tipping, justinHover] = useHoverOrTap();
  const [petting, truffleHover] = useHoverOrTap();
  const acts = useRef({ j: "idle", t: "sit" });
  // The hover hooks want the same elements as the placement refs.
  const justinProps = { ...justinHover, ref: (el) => (justinEl.current = justinHover.ref.current = el) };
  const truffleProps = { ...truffleHover, ref: (el) => (truffleEl.current = truffleHover.ref.current = el) };

  const measure = useCallback(() => {
    const board = stageEl.current?.parentElement;
    if (!board) return null;
    const widgets = [...board.querySelectorAll(".gw")];
    const ground = Math.min(...widgets.map((el) => el.offsetTop));
    const segments = widgets
      .filter((el) => el.offsetTop === ground)
      .sort((a, b) => a.offsetLeft - b.offsetLeft)
      .map((el) => ({ l: el.offsetLeft, r: el.offsetLeft + el.offsetWidth, id: el.dataset.id }));
    const first = segments[0];
    const last = segments[segments.length - 1];
    const coffee = segments.find((s) => s.id === "coffee") ?? first;
    const clock = segments.find((s) => s.id === "clock") ?? last;
    const spots = {
      sip: coffee.l + 22,
      idle: first.r - first.l > 400 ? first.l + (first.r - first.l) * 0.62 : first.l + 24,
      sit: clock.r - 52 - 18,
      sleep: clock.r - 64 - 18,
    };
    roof.current = { ground, segments, spots };
    return roof.current;
  }, []);

  const setJustin = (act) => {
    acts.current.j = act;
    setJAct(act);
  };
  const setTruffle = (act) => {
    acts.current.t = act;
    setTAct(act);
  };

  const heights = () => ({
    j: frameSize("justin", acts.current.j).h,
    t: frameSize("truffle", acts.current.t).h,
  });

  const placeAll = useCallback(() => {
    const r = roof.current;
    if (!r) return;
    const h = heights();
    place(justinEl.current, justin.current.x, r.ground, h.j);
    place(truffleEl.current, truffle.current.x, r.ground, h.t);
    place(ballEl.current, ball.current.x, r.ground, 10);
  }, []);

  // Truffle's spot beside Justin, facing him: the side she is already on when
  // the roof allows it, else the other side.
  const besideJustin = useCallback((tAction) => {
    const r = roof.current;
    const jw = frameSize("justin", acts.current.j).w;
    const tw = frameSize("truffle", tAction).w;
    const ranges = standable(r.segments, tw);
    const left = { x: justin.current.x - tw - 8, flip: false };
    const right = { x: justin.current.x + jw + 8, flip: true };
    const [near, far] = truffle.current.x > justin.current.x ? [right, left] : [left, right];
    return clampTo(near.x, ranges) === near.x ? near : far;
  }, []);

  // While he walks she trots behind him, a step back.
  const behindJustin = () => {
    const j = justin.current;
    return j.facing > 0 ? j.x - 34 - 10 : j.x + 36 + 10;
  };

  const tick = useCallback(
    (dt) => {
      const j = justin.current;
      const t = truffle.current;
      const b = ball.current;
      const busy = [j.step(dt), t.step(dt), b.step(dt)].some(Boolean);
      placeAll();
      // Synchronous, so the new frame paints with the step that earned it.
      flushSync(() => {
        if (j.moving) {
          setJFrame(j.frame);
          setJFlip(j.facing < 0);
        }
        if (t.moving) {
          setTFrame(t.frame);
          setTFlip(t.facing < 0);
        }
        setBFrame(b.frame);
      });
      return busy;
    },
    [placeAll],
  );
  const kick = useTicker(tick);

  // Truffle trots after Justin and settles into `settle` beside him.
  const followJustin = useCallback(
    (settle) => {
      setTruffle("trot");
      truffle.current.go(
        () => (justin.current.moving ? behindJustin() : besideJustin("sit").x),
        () => {
          const { x, flip } = besideJustin(settle);
          truffle.current.x = x;
          setTFlip(flip);
          setTruffle(settle);
        },
        () => justin.current.moving,
      );
      kick();
    },
    [besideJustin, kick],
  );

  // Justin walks to `x` (or arrives at once), then takes `pose`; Truffle follows.
  const travel = useCallback(
    (x, pose, instant) => {
      const arrive = () => {
        setJFlip(false);
        setJustin(pose);
        const { x: tx, flip } = besideJustin(truffleBeside[pose]);
        if (instant) {
          truffle.current.x = tx;
          setTFlip(flip);
          setTruffle(truffleBeside[pose]);
        } else followJustin(truffleBeside[pose]);
      };
      if (instant || Math.abs(x - justin.current.x) < 2) {
        justin.current.x = x;
        arrive();
        return;
      }
      setJustin("walk");
      justin.current.go(x, arrive);
      followJustin("sit");
      kick();
    },
    [besideJustin, followJustin, kick],
  );

  // Geometry on mount and on resize; the pose for the hour, walking there on an
  // hour change and jumping there on first paint or under reduced motion.
  const mounted = useRef(false);
  useLayoutEffect(() => {
    const r = measure();
    if (!r) return undefined;
    const pose = posture[period];
    const instant = !mounted.current || reducedMotion();
    const x = pose === "idle" && mounted.current ? justin.current.x : r.spots[pose];
    travel(clampTo(x, standable(r.segments, frameSize("justin", pose).w)), pose, instant);
    if (!mounted.current) {
      ball.current.x = clampTo(justin.current.x + 36 + 30, standable(r.segments, 10));
      mounted.current = true;
      setReady(true);
    }
    placeAll();
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  useEffect(() => {
    const board = stageEl.current.parentElement;
    const onResize = () => {
      const r = measure();
      if (!r) return;
      const pose = posture[period];
      justin.current.target = null;
      truffle.current.target = null;
      const x = pose === "idle" ? justin.current.x : r.spots[pose];
      travel(clampTo(x, standable(r.segments, frameSize("justin", pose).w)), pose, true);
      ball.current.x = clampTo(ball.current.x, standable(r.segments, 10));
      placeAll();
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(board);
    return () => observer.disconnect();
  }, [measure, period, placeAll, travel]);

  useLayoutEffect(placeAll, [jAct, tAct, placeAll]);

  // Strolls: through the day he wanders along the roofline every half minute or so.
  useEffect(() => {
    if (posture[period] !== "idle" || reducedMotion()) return undefined;
    let timer;
    const stroll = () => {
      timer = setTimeout(
        () => {
          if (!justin.current.moving && document.visibilityState === "visible") {
            const ranges = standable(roof.current.segments, 36);
            travel(pickFar(ranges, justin.current.x, 90), "idle", false);
          }
          stroll();
        },
        18_000 + Math.random() * 17_000,
      );
    };
    stroll();
    return () => clearTimeout(timer);
  }, [period, travel]);

  const awake = tAct === "sit" || tAct === "trot" || tAct === "ear";

  const throwBall = () => {
    const r = roof.current;
    const b = ball.current;
    if (!r || b.moving) return;
    // A throw of 160 to 300px, so she is never off on a long fetch.
    const ranges = standable(r.segments, 10).map(([a, c]) => [Math.max(a, b.x - 300), Math.min(c, b.x + 300)]).filter(([a, c]) => c > a);
    const to = pickFar(ranges, b.x, 160);
    if (reducedMotion()) {
      b.x = to;
      b.from = to;
      placeAll();
    } else b.throwTo(to, 1.1);
    // She gives it a beat, then trots over and sits with her nose at the ball.
    if (awake && !justin.current.moving) {
      const chase = to > truffle.current.x ? to - 34 - 4 : to + 10 + 4;
      const onSettle = () => {
        setTFlip(to < truffle.current.x);
        setTruffle("sit");
      };
      if (reducedMotion()) {
        truffle.current.x = chase;
        onSettle();
      } else {
        setTimeout(() => {
          if (justin.current.moving) return;
          setTruffle("trot");
          truffle.current.go(chase, onSettle);
          kick();
        }, 220);
      }
    }
    kick();
  };

  const justinAction =
    cheer && jAct !== "sleep" && jAct !== "walk"
      ? "arms-up"
      : tipping && (jAct === "idle" || jAct === "sip")
        ? "hat"
        : jAct;
  // Asleep, she lifts one ear at a pointer on her, and goes back to sleep.
  const truffleAction = petting && tAct === "sleep" ? "ear" : tAct;

  return (
    <div ref={stageEl} className={`gl-stage${ready ? " is-ready" : ""}`}>
      <span className="gl-actor gl-reacts" aria-hidden="true" {...truffleProps}>
        <Sprite character="truffle" action={truffleAction} flip={tFlip} frame={tAct === "trot" ? tFrame : undefined} scale={1} />
      </span>
      <span className="gl-actor gl-reacts" aria-hidden="true" {...justinProps}>
        <Sprite
          character="justin"
          action={justinAction}
          outfit={outfit}
          flip={jAct === "walk" ? jFlip : false}
          frame={jAct === "walk" ? jFrame : undefined}
          scale={1}
        />
      </span>
      <button
        ref={ballEl}
        type="button"
        className="gl-actor gl-ball"
        aria-label="Throw the tennis ball for Truffle"
        hidden={!awake && !ball.current.moving}
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

// The floor strip of an open sheet. Justin and Truffle walk in from the sides
// and settle into the scene's poses; the robots are already there.
// `scene`: [{ who, act, at, from, flip }] with `at` the sprite centre as a
// fraction of the floor width and `from` the side they enter from.
export function Floor({ scene, outfit, cheer }) {
  const floorEl = useRef(null);
  const els = useRef([]);
  const movers = useRef([]);
  const [acts, setActs] = useState(() => scene.map((a) => (a.from && !reducedMotion() ? (a.who === "justin" ? "walk" : "trot") : a.act)));
  const [frames, setFrames] = useState(() => scene.map(() => 0));
  const [flips, setFlips] = useState(() => scene.map((a) => a.flip ?? false));
  const [tipping, justinHover] = useHoverOrTap();
  const [ready, setReady] = useState(false);
  const justinIndex = scene.findIndex((a) => a.who === "justin");
  const justinProps = {
    ...justinHover,
    ref: (el) => (els.current[justinIndex] = justinHover.ref.current = el),
  };

  const ground = () => floorEl.current.clientHeight; // the strip's bottom border is the shelf

  const tick = useCallback((dt) => {
    if (!floorEl.current) return false;
    let busy = false;
    movers.current.forEach((m, i) => {
      if (!m) return;
      if (m.step(dt)) busy = true;
      const { h } = frameSize(scene[i].who, m.moving ? (scene[i].who === "justin" ? "walk" : "trot") : scene[i].act);
      place(els.current[i], m.x, ground(), h);
    });
    flushSync(() => {
      setFrames(movers.current.map((m) => m?.frame ?? 0));
      setFlips((old) => movers.current.map((m, i) => (m?.moving ? m.facing < 0 : old[i])));
    });
    return busy;
  }, [scene]);
  const kick = useTicker(tick);

  useLayoutEffect(() => {
    const width = floorEl.current.clientWidth;
    scene.forEach((a, i) => {
      const { w, h } = frameSize(a.who, a.act);
      const target = Math.round(width * a.at - w / 2);
      if (a.from && !reducedMotion()) {
        const spec = a.who === "justin" ? JUSTIN_BRISK : TRUFFLE_TROT;
        const m = new Mover({ x: a.from === "left" ? -w - 12 : width + 12, ...spec });
        movers.current[i] = m;
        m.go(target, () => {
          setActs((old) => old.map((act, k) => (k === i ? a.act : act)));
          setFlips((old) => old.map((f, k) => (k === i ? (a.flip ?? false) : f)));
        });
        place(els.current[i], m.x, ground(), frameSize(a.who, a.who === "justin" ? "walk" : "trot").h);
      } else {
        place(els.current[i], target, ground(), h);
      }
    });
    setReady(true);
    kick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A pose change (walk to sip, say) changes the sprite's height: re-seat it.
  useLayoutEffect(() => {
    scene.forEach((a, i) => {
      const m = movers.current[i];
      if (m && !m.moving) place(els.current[i], m.x, ground(), frameSize(a.who, acts[i]).h);
    });
  }, [acts, scene]);

  return (
    <div ref={floorEl} className={`gl-floor${ready ? " is-ready" : ""}`} aria-hidden="true">
      {scene.map((a, i) => {
        const moving = acts[i] === "walk" || acts[i] === "trot";
        if (a.who === "luibot" || a.who === "luibuilder") {
          return (
            <Robot
              key={a.who}
              character={a.who}
              className="gl-floor-robot"
              style={{ left: `calc(${a.at * 100}% - ${frameSize(a.who, "idle").w / 2}px)` }}
            />
          );
        }
        const action =
          a.who === "justin" && !moving
            ? cheer && acts[i] !== "sleep"
              ? "arms-up"
              : tipping && (acts[i] === "idle" || acts[i] === "sip")
                ? "hat"
                : acts[i]
            : acts[i];
        return (
          <span
            key={a.who}
            ref={(el) => {
              els.current[i] = el;
            }}
            className={`gl-actor${a.who === "justin" ? " gl-reacts" : ""}`}
            {...(a.who === "justin" ? justinProps : {})}
          >
            <Sprite
              character={a.who}
              action={action}
              outfit={outfit}
              flip={flips[i]}
              frame={moving ? frames[i] : undefined}
              scale={1}
            />
          </span>
        );
      })}
    </div>
  );
}
