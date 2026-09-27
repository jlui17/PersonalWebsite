// The stage is the sprite lane above the status bar: a one-dimensional floor
// that Justin, Truffle and the tennis ball live on. Positions are the centre
// of each actor's feet in CSS px from the left of the window, so a pose that
// is wider or narrower stays put when it changes. Walking frames advance by
// distance, one frame per stride of the sheet, so feet never slide; facing
// follows the direction of travel.
//
// The lane is divided into one stretch per pane (index.jsx lays those out
// and places the residents: the robots, the farm, the coffee corner). This
// engine moves the three who travel: Justin walks to the focused pane's
// station and plays that pane's beats; Truffle lives in the people stretch
// and comes when called; the ball rests in its own stretch, where the fetch
// happens.
//
// The rules the choreography keeps:
// - The ball is thrown, not kicked: it flies in an arc over whoever is in the
//   way, lands, rolls, and never passes through anyone on the ground. Truffle
//   may run past Justin (she is drawn in front of him); he never walks
//   through the ball (it is beside him, on her side).
// - One ball in play: a throw, a call or a pet asked for while she is fetching
//   waits for her; a command asked for mid-walk runs on arrival. A pose that
//   does not fit where he stands makes him step to where it fits first.
// - Nothing teleports on a wide lane: every move is a walk, a trot, a flight
//   or a roll. A new walk cancels the beats he was playing.

import ballSheet from "./ball.js";
import justinSheet from "../../sprites/justin.js";
import truffleSheet from "../../sprites/truffle.js";

const JUSTIN = { stride: 7, frames: 4, speed: 90, rise: 350, settle: 700 };
const TRUFFLE = { stride: 6, frames: 4, speed: 140, sitFor: 3000, nose: 22, notice: 110 };
const BALL = { size: 10, frames: ballSheet.actions.roll.frames.length, gap: 8 };
const EDGE = 4; // air between a sprite and the lane's end

const SHEETS = { justin: justinSheet, truffle: truffleSheet };

// Where the idle body (36 wide, feet centred at x 18) sits in each of
// Justin's action canvases, as the comment above the action in
// src/sprites/justin.js gives it ("idle shifted 15"): the one number a pose
// needs so a wider canvas (an arm out, a desk, a dog beside him) keeps his
// feet where they were. Canvas widths are read from the sheet at render time,
// so a redraw that widens a canvas changes nothing here unless the body moves.
// MUST match the sheet comments; an action not listed has its body at x 0.
// sit, sleep and the pets are not a shifted idle: their number is the figure's
// centre minus 18.
const BODY_X = { wave: 10, reach: 15, press: 11, grab: 11, sit: 8, sleep: 14, pet: 4, "pet-low": 4 };

// [canvas width, anchor]: the anchor is the figure's centre in the canvas.
export function poseBox(who, pose) {
  const w = SHEETS[who].actions[pose].frames[0][0].length;
  return [w, who === "truffle" ? w / 2 : (BODY_X[pose] ?? 0) + 18];
}

// The pet composites, as drawn with him facing right: with `pet` Truffle
// sits (24 wide) at x 34 of his 51px canvas and is painted on top, so her
// near ear sits in front of his forearm; with `pet-low` she lies (36 wide,
// asleep or one ear up) at x 36 and he is painted on top of her. `dx` is her
// centre relative to his anchor, mirrored when he faces left.
const PET = {
  pet: { her: "sit", dx: 34 + 12 - poseBox("justin", "pet")[1], himOnTop: false },
  "pet-low": { her: "sleep", dx: 36 + 18 - poseBox("justin", "pet-low")[1], himOnTop: true },
};

// Poses drawn later drop in by name; until then the nearest thing plays.
const FALLBACK = { wave: "hat", reach: "idle" };

const sign = (n) => (n < 0 ? -1 : 1);
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function extent(who, pose, facing, side) {
  const [w, a] = poseBox(who, pose);
  const right = facing < 0 ? a : w - a;
  const left = facing < 0 ? w - a : a;
  return side > 0 ? right : left;
}

// `sheet` is Justin's sheet: the names of the actions he has today, and the
// frame durations a scripted beat steps through (a beat that names its
// `frames` plays them once, each for the sheet's duration, and holds the last).
export function createStage({ reduced, sheet }) {
  const lane = { left: 0, right: 600 };
  const yard = { left: 0, right: 600, rest: 300 }; // where the ball may go and Truffle fetches, and where it rests
  const actions = Object.keys((sheet ?? justinSheet).actions);
  const pick = (pose) => (actions.includes(pose) ? pose : FALLBACK[pose] ?? "idle");
  const shotOf = (pose, frames) => {
    const a = sheet?.actions[pose];
    if (!a || !frames) return null;
    const durations = frames.map((i) => a.durations?.[i] ?? a.interval ?? 200);
    return { frames, durations, total: durations.reduce((t, d) => t + d, 0) };
  };
  const frameAt = (shot, elapsed) => {
    let t = 0;
    for (let i = 0; i < shot.durations.length; i++) {
      t += shot.durations[i];
      if (elapsed < t) return shot.frames[i];
    }
    return shot.frames[shot.frames.length - 1];
  };

  const justin = {
    cx: 60,
    target: 60,
    facing: 1,
    walked: 0,
    walking: false,
    risingUntil: 0,
    arrivedAt: 0,
    onArrive: [],
    pose: "idle",
    frame: undefined,
    rest: "idle",
    override: null, // { pose, ms, until, after, flag }
    script: [], // beats to play after the current override
    launchAt: 0,
  };
  const truffle = {
    cx: 300,
    home: 300,
    target: 300,
    facing: -1,
    walked: 0,
    trotting: false,
    earAt: 0,
    trotAt: 0,
    sitUntil: 0,
    earDown: 0,
    lookAt: null,
    plan: null, // { kind: 'goto' | 'fetch', ... }
    pose: "sleep",
    frame: undefined,
  };
  const ball = { x: 340, y: 0, spun: 0, frame: 0, flight: null, roll: null };

  const fits = (who, pose, cx, facing, bounds = lane) =>
    clamp(cx, bounds.left + EDGE + extent(who, pose, facing, -1), bounds.right - EDGE - extent(who, pose, facing, 1));
  const fitsJustin = (cx, pose = justin.rest, facing = justin.facing) =>
    Math.round(fits("justin", "walk", fits("justin", pick(pose), cx, facing), facing));
  const fitsTruffle = (cx) => Math.round(fits("truffle", "sleep", cx, 1));
  const fitsBall = (x) => clamp(x, yard.left + EDGE + BALL.size / 2, yard.right - EDGE - BALL.size / 2);
  const busyFetching = () => truffle.plan?.kind === "fetch" || !!ball.flight || !!ball.roll;

  // Where the ball rests beside Justin's feet on `side`, given the pose he
  // will be in there.
  const ballHome = (side, pose = justin.rest, at = justin.target) =>
    fitsBall(at + side * (extent("justin", pick(pose), justin.facing, side) + BALL.gap + BALL.size / 2));

  // ---- Justin ----

  // Walks to `cx`, which is clamped so the pose he will rest in fits there.
  // `rest` is that pose. Sitting, sipping or asleep, he stands up first. A
  // hop of a few pixels is not worth a walk. Any beats he was playing stop.
  function walkTo(cx, { rest = justin.rest, onArrive } = {}) {
    justin.rest = pick(rest);
    const facing = Math.abs(cx - justin.cx) >= 4 ? sign(cx - justin.cx) : justin.facing;
    cx = fitsJustin(cx, rest, facing);
    justin.override = null;
    justin.script = [];
    justin.launchAt = 0;
    justin.onArrive = onArrive ? [onArrive] : [];
    const distance = Math.abs(cx - justin.cx);
    if (distance < 4) {
      justin.cx = justin.target = cx;
      if (!justin.walking) flushArrival();
      return 0;
    }
    justin.target = cx;
    if (!justin.walking) {
      justin.walked = 0;
      const standing = ["idle", "walk", "hat", "wave", "reach", "arms-up", "carry"].includes(justin.pose);
      justin.risingUntil = standing || reduced() ? 0 : performance.now() + JUSTIN.rise;
    }
    justin.walking = true;
    return distance;
  }

  function flushArrival() {
    const done = justin.onArrive;
    justin.onArrive = [];
    for (const fn of done) fn();
  }

  // A pose for a while. If it does not fit where he stands (asleep at the
  // lane's end, say), he steps to where it does.
  function strike(pose, ms, after, flag, frames) {
    const shot = shotOf(pick(pose), frames);
    pose = pick(pose);
    if (justin.walking) {
      justin.onArrive.push(() => strike(pose, ms, after, flag, frames));
      return;
    }
    const at = fitsJustin(justin.cx, pose);
    if (at !== justin.cx && Math.abs(at - justin.cx) >= 4) {
      walkTo(at, { onArrive: () => strike(pose, ms, after, flag, frames) });
      return;
    }
    justin.cx = justin.target = at;
    // a beat with frames lasts their durations, then holds the last for `ms`
    justin.override = { pose, ms: shot ? shot.total + ms : ms, until: 0, t0: 0, after, flag, shot };
  }

  // A sequence of beats, each { pose, ms, flag, frames? }, played one after another
  // once he has arrived; the flag names the moment for whoever else is in
  // the scene (a robot waving back, the coffee machine brewing).
  function play(beats) {
    if (justin.walking) {
      justin.onArrive.push(() => play(beats));
      return;
    }
    justin.script = beats.slice();
    if (!justin.override) nextBeat();
  }

  function nextBeat() {
    const beat = justin.script.shift();
    if (!beat) return;
    if (beat.facing) justin.facing = beat.facing;
    strike(beat.pose, beat.ms, nextBeat, beat.flag, beat.frames);
  }

  function toggle(pose, ms) {
    if (justin.override?.pose === pose) {
      justin.override = null;
      justin.arrivedAt = performance.now();
    } else strike(pose, ms);
  }

  function setRest(pose) {
    justin.rest = pick(pose);
    if (justin.walking) return;
    const at = fitsJustin(justin.cx, justin.rest);
    if (at !== justin.cx) walkTo(at);
  }

  // The current beat's pose and, for a scripted beat, the frame `now` falls
  // on: its frames play once and the last one holds.
  function showOverride(now) {
    const o = justin.override;
    if (!o.until) {
      o.t0 = now;
      o.until = now + (reduced() ? Math.min(o.ms, 400) : o.ms);
    }
    justin.pose = o.pose;
    if (o.shot) justin.frame = reduced() ? frameAt(o.shot, Infinity) : frameAt(o.shot, now - o.t0);
  }

  function tickJustin(now, dt) {
    if (justin.launchAt && now >= justin.launchAt) {
      justin.launchAt = 0;
      launch();
    }
    if (justin.walking) {
      if (now < justin.risingUntil) {
        justin.pose = "idle";
        justin.frame = undefined;
        return;
      }
      const remaining = justin.target - justin.cx;
      justin.facing = sign(remaining);
      const step = reduced() ? Math.abs(remaining) : Math.min(JUSTIN.speed * dt, Math.abs(remaining));
      justin.cx += justin.facing * step;
      justin.walked += step;
      if (Math.abs(justin.target - justin.cx) < 0.01) {
        justin.cx = justin.target;
        justin.walking = false;
        justin.arrivedAt = now;
        justin.pose = "idle";
        justin.frame = undefined;
        flushArrival();
        if (justin.override) showOverride(now);
      } else {
        justin.pose = "walk";
        justin.frame = Math.floor(justin.walked / JUSTIN.stride) % JUSTIN.frames;
      }
      return;
    }
    justin.frame = undefined;
    const o = justin.override;
    if (o) {
      if (!o.until) {
        o.t0 = now;
        o.until = now + (reduced() ? Math.min(o.ms, 400) : o.ms);
      }
      if (now < o.until) {
        showOverride(now);
        return;
      }
      justin.override = null;
      justin.arrivedAt = now;
      o.after?.();
      if (justin.override) {
        showOverride(now);
        return;
      }
    }
    justin.pose = now - justin.arrivedAt < JUSTIN.settle && !reduced() ? "idle" : justin.rest;
  }

  // ---- Truffle ----

  function start(plan, { earIn = 500, trotIn = 1300 } = {}) {
    const now = performance.now();
    truffle.plan = plan;
    truffle.sitUntil = 0;
    if (truffle.trotting) return;
    if (reduced()) {
      truffle.earAt = 0;
      truffle.trotAt = now;
      return;
    }
    truffle.earAt = truffle.pose === "sleep" ? now + earIn : 0;
    truffle.trotAt = now + trotIn;
  }

  const homeSide = () => sign(ball.x - justin.target) || 1;
  // She brings the ball to his feet while he is in the ball's stretch; if he
  // has walked off to another pane, she leaves it at its resting place there.
  const inYard = () => justin.target >= yard.left && justin.target <= yard.right;
  const fetchHome = (opts, then) =>
    start(
      {
        kind: "fetch",
        goal: () => (inYard() ? ballHome(homeSide()) : yard.rest),
        lookAt: () => justin.cx,
        phase: "reach",
        dir: 0,
        then,
      },
      opts,
    );

  // She comes to sit beside him (on the side she arrives from).
  function callTruffle() {
    if (busyFetching()) return false;
    start(
      {
        kind: "goto",
        target: () => justin.target + sign(truffle.cx - justin.target) * 44,
        lookAt: () => justin.cx,
      },
      { earIn: 200, trotIn: 700 },
    );
    return true;
  }

  // Back to her own stretch of the lane, to sleep. Only asked for when the
  // visitor goes to her pane: she never wanders home on her own.
  function goHome() {
    if (busyFetching()) {
      truffle.plan.then = goHome;
      return;
    }
    if (Math.abs(truffle.cx - truffle.home) < 4) {
      if (truffle.pose === "sit") truffle.sitUntil = performance.now() + 1500;
      return;
    }
    start({ kind: "goto", target: () => truffle.home, lookAt: () => justin.cx }, { earIn: 200, trotIn: 500 });
  }

  function planTarget() {
    const p = truffle.plan;
    if (p.kind === "goto") return fitsTruffle(p.target());
    const goal = fitsBall(p.goal());
    if (p.phase === "reach") {
      p.dir = sign(goal - ball.x) || 1;
      return fitsTruffle(ball.x - p.dir * TRUFFLE.nose);
    }
    // Pushing: the ball stops short of Justin's feet, so while he is still
    // walking ahead of it she trails him rather than rolling it through him.
    let stop = goal;
    const ahead = inYard() && sign(justin.cx - ball.x) === p.dir;
    if (ahead) {
      const feet = justin.cx - p.dir * (extent("justin", justin.pose, justin.facing, -p.dir) + BALL.gap + BALL.size / 2);
      stop = p.dir > 0 ? Math.min(goal, feet) : Math.max(goal, feet);
    }
    return fitsTruffle(stop - p.dir * TRUFFLE.nose);
  }

  function tickTruffle(now, dt) {
    if (truffle.earAt && now >= truffle.earAt) {
      truffle.earAt = 0;
      if (truffle.pose === "sleep") truffle.pose = "ear";
    }
    if (truffle.trotAt && now >= truffle.trotAt) {
      truffle.trotAt = 0;
      truffle.trotting = true;
      truffle.walked = 0;
    }
    // Asleep and he is walking her way: one ear comes up as he gets close.
    if (!truffle.plan && truffle.pose === "sleep" && justin.walking) {
      const closing = sign(justin.target - justin.cx) === sign(truffle.cx - justin.cx);
      if (closing && Math.abs(truffle.cx - justin.cx) < TRUFFLE.notice && !reduced()) truffle.pose = "ear";
    }
    if (truffle.trotting && truffle.plan) {
      const p = truffle.plan;
      truffle.target = planTarget();
      const remaining = truffle.target - truffle.cx;
      if (Math.abs(remaining) >= 0.01) {
        truffle.facing = sign(remaining);
        const step = reduced() ? Math.abs(remaining) : Math.min(TRUFFLE.speed * dt, Math.abs(remaining));
        truffle.cx += truffle.facing * step;
        truffle.walked += step;
        truffle.pose = "trot";
        truffle.frame = Math.floor(truffle.walked / TRUFFLE.stride) % TRUFFLE.frames;
        if (p.kind === "fetch" && p.phase === "push") moveBall(truffle.cx + p.dir * TRUFFLE.nose);
        return;
      }
      truffle.cx = truffle.target;
      if (p.kind === "fetch" && p.phase === "reach") {
        truffle.pose = "sit";
        truffle.frame = undefined;
        truffle.facing = sign(ball.x - truffle.cx) || truffle.facing;
        if (!ball.flight && !ball.roll) {
          p.phase = "push";
          truffle.walked = 0;
        }
        return;
      }
      if (p.kind === "fetch" && p.phase === "push") {
        const goal = fitsBall(p.goal());
        if (sign(goal - ball.x) !== p.dir && Math.abs(goal - ball.x) > 2) {
          p.phase = "reach";
          return;
        }
      }
      truffle.pose = "sit";
      truffle.frame = undefined;
      truffle.facing = sign(p.lookAt() - truffle.cx) || truffle.facing;
      if (justin.walking && p.kind === "fetch") return;
      truffle.trotting = false;
      truffle.plan = null;
      truffle.sitUntil = now + TRUFFLE.sitFor;
      p.then?.();
      return;
    }
    truffle.frame = undefined;
    const petted = justin.pose === "pet";
    if (truffle.pose === "sit" && truffle.sitUntil && now >= truffle.sitUntil && !petted) {
      truffle.sitUntil = 0;
      truffle.pose = "sleep";
    }
    // One ear up and nothing happening: she dozes off again after a moment.
    if (truffle.pose === "ear" && !justin.walking && !truffle.plan && justin.pose !== "pet-low") {
      if (!truffle.earDown) truffle.earDown = now + 2500;
      if (now >= truffle.earDown) {
        truffle.earDown = 0;
        truffle.pose = "sleep";
      }
    } else truffle.earDown = 0;
  }

  // A hand on Truffle. Lying down (asleep or one ear up), he goes to her and
  // pets her where she lies, if the ball is not in his way; awake, she comes
  // and sits under his hand.
  function pet() {
    if (ball.flight || ball.roll) return false;
    if (truffle.plan) {
      truffle.plan.then = pet; // when she gets where she is going
      return true;
    }
    if (justin.walking) {
      justin.onArrive.push(pet);
      return true;
    }
    const side = sign(truffle.cx - justin.cx) || 1;
    justin.facing = side;
    if (truffle.pose === "sleep" || truffle.pose === "ear") {
      const at = truffle.cx - side * PET["pet-low"].dx;
      const path = [Math.min(at, justin.cx) - 18, Math.max(at, justin.cx) + 18];
      const ballInWay = ball.x > path[0] && ball.x < path[1];
      if (!ballInWay && fitsJustin(at, "pet-low", side) === Math.round(at)) {
        truffle.earAt = 0;
        const back = justin.cx;
        walkTo(at, {
          onArrive: () => {
            justin.facing = side;
            strike("pet-low", 3600, () => walkTo(back)); // a step back, so he never stands on her
          },
        });
        return true;
      }
    }
    const spot = fitsJustin(justin.cx, "pet", side);
    start(
      {
        kind: "goto",
        target: () => spot + side * PET.pet.dx,
        lookAt: () => justin.cx,
        then: () => {
          justin.facing = side;
          strike("pet", 3600, () => {
            truffle.sitUntil = performance.now() + 1500; // then she lies down right there
          });
        },
      },
      { earIn: 200, trotIn: 600 },
    );
    return true;
  }

  // ---- the ball ----

  function moveBall(x) {
    x = fitsBall(x);
    ball.spun += x - ball.x;
    ball.x = x;
    const perFrame = (Math.PI * BALL.size) / BALL.frames;
    ball.frame = ((Math.floor(ball.spun / perFrame) % BALL.frames) + BALL.frames) % BALL.frames;
  }

  // Thrown from his hands toward the longer side of the yard: an arc to
  // about two thirds of the way, then a roll that eases out. Truffle sets
  // off as it leaves his hand.
  function launch() {
    const dir = justin.facing;
    const from = justin.cx + dir * 10;
    const to = fitsBall(dir > 0 ? yard.right - 40 : yard.left + 40);
    const land = from + (to - from) * 0.7;
    const now = performance.now();
    ball.x = from;
    if (reduced()) {
      moveBall(to);
      ball.y = 0;
    } else {
      ball.flight = { from, to: land, t0: now, dur: 650 + Math.abs(land - from) * 0.45, h: 44, then: to };
    }
    fetchHome({ earIn: 150, trotIn: 450 });
  }

  // The throw: instant when the ball is at his feet; when it is not, Truffle
  // brings it first and he throws as it arrives. Waits while one is in play.
  function throwBall() {
    if (ball.flight || ball.roll) return false;
    if (truffle.plan?.kind === "fetch") {
      truffle.plan.then = throwBall;
      return true;
    }
    if (justin.walking) {
      justin.onArrive.push(throwBall);
      return true;
    }
    const side = sign(ball.x - justin.cx) || 1;
    const atFeet = Math.abs(ball.x - justin.cx) <= extent("justin", justin.pose, justin.facing, side) + BALL.gap + BALL.size + 6;
    if (!atFeet) {
      fetchHome({ earIn: 150, trotIn: 450 }, throwBall);
      return true;
    }
    justin.facing = justin.cx - yard.left > yard.right - justin.cx ? -1 : 1;
    strike("arms-up", 420);
    justin.launchAt = reduced() ? performance.now() : performance.now() + 240;
    return true;
  }

  function tickBall(now) {
    const f = ball.flight;
    if (f) {
      const p = Math.min(1, (now - f.t0) / f.dur);
      moveBall(f.from + (f.to - f.from) * p);
      ball.y = 4 * f.h * p * (1 - p) + (1 - p) * 40 * (1 - p);
      if (p >= 1) {
        ball.y = 0;
        ball.flight = null;
        ball.roll = { from: f.to, to: f.then, t0: now, dur: 700 + Math.abs(f.then - f.to) * 2.2 };
      }
      return;
    }
    const r = ball.roll;
    if (r) {
      const p = Math.min(1, (now - r.t0) / r.dur);
      const eased = 1 - (1 - p) ** 3;
      moveBall(r.from + (r.to - r.from) * eased);
      if (p >= 1) ball.roll = null;
    }
  }

  // 1070: both arms up; Truffle sits up for it, then goes back to sleep.
  function cheer() {
    strike("arms-up", 1800);
    if ((truffle.pose === "sleep" || truffle.pose === "ear") && !truffle.plan) {
      truffle.earAt = 0;
      truffle.pose = "sit";
      truffle.sitUntil = performance.now() + 1800;
    }
  }

  function tick(now, dt) {
    tickJustin(now, dt);
    tickTruffle(now, dt);
    tickBall(now);
  }

  const leftOf = (who, pose, cx, facing) => {
    const [w, a] = poseBox(who, pose);
    return Math.round(cx - (facing < 0 ? w - a : a));
  };

  const snapshot = () => ({
    justin: {
      pose: justin.pose,
      frame: justin.frame,
      flip: justin.facing < 0,
      left: leftOf("justin", justin.pose, justin.cx, justin.facing),
      cx: Math.round(justin.cx),
      moving: justin.walking,
      onTop: !!PET[justin.pose]?.himOnTop,
      flag: justin.override?.flag ?? null,
    },
    truffle: {
      pose: truffle.pose,
      frame: truffle.frame,
      flip: truffle.facing < 0,
      left: leftOf("truffle", truffle.pose, truffle.cx, truffle.facing),
      cx: Math.round(truffle.cx),
      moving: truffle.trotting,
      pushing: truffle.pose === "trot" && truffle.plan?.kind === "fetch" && truffle.plan.phase === "push",
    },
    ball: {
      left: Math.round(ball.x - BALL.size / 2),
      cx: Math.round(ball.x),
      y: Math.round(ball.y),
      frame: ball.frame,
      moving: !!ball.flight || !!ball.roll,
    },
  });

  const busy = () => justin.walking || truffle.trotting || busyFetching() || !!truffle.earAt || !!truffle.trotAt;

  // A layout: Justin at `cx` in `rest`, Truffle asleep at her home, the ball
  // at its rest, nobody walking, no beats pending.
  function place(cx, { rest = justin.rest, home = truffle.home, ballAt = ball.x, facing = 1 } = {}) {
    justin.rest = pick(rest);
    justin.facing = facing;
    justin.cx = justin.target = fitsJustin(cx, justin.rest, facing);
    justin.walking = false;
    justin.onArrive = [];
    justin.override = null;
    justin.script = [];
    justin.launchAt = 0;
    justin.pose = justin.rest;
    ball.flight = ball.roll = null;
    ball.y = 0;
    ball.x = fitsBall(ballAt);
    truffle.home = fitsTruffle(home);
    truffle.cx = truffle.target = truffle.home;
    truffle.facing = sign(justin.cx - truffle.cx) || -1;
    truffle.trotting = false;
    truffle.plan = null;
    truffle.earAt = truffle.trotAt = truffle.sitUntil = 0;
    truffle.pose = "sleep";
  }

  return {
    lane,
    yard,
    justin,
    truffle,
    ball,
    walkTo,
    place,
    play,
    setHome: (x) => {
      truffle.home = fitsTruffle(x);
    },
    goHome,
    callTruffle,
    throwBall,
    pet,
    tipHat: () => strike("hat", 1400),
    wave: () => strike("wave", 1400),
    cheer,
    sit: () => toggle("sit", 9000),
    sip: () => toggle("sip", 7000),
    setRest,
    tick,
    snapshot,
    busy,
  };
}
