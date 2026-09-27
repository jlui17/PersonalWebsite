// The stage is the sprite pathway above the status bar: a one-dimensional floor
// that Justin, Truffle and the tennis ball live on. Positions are the centre
// of each actor's feet in CSS px from the left of the window, so a pose that
// is wider or narrower stays put when it changes. Walking frames advance by
// distance, one frame per stride of the sheet, so feet never slide; facing
// follows the direction of travel.
//
// The pathway is divided into one stretch per pane (index.jsx lays those out
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
// - Nothing teleports on a wide pathway: every move is a walk, a trot, a flight
//   or a roll. A new walk cancels the beats he was playing.

import ballSheet from "./ball.js";
import justinSheet from "../../sprites/justin.js";
import truffleSheet from "../../sprites/truffle.js";

// He walks at one pace, `speed`, however far the trip: the walk frame is the
// distance walked over `stride`, so his feet stay planted. `settle` is the
// standing beat before he takes a rest pose; poses in NO_SETTLE start at
// once (sitting down at the desk; the boxes, which idle would not show).
const JUSTIN = { stride: 7, frames: 4, speed: 90, rise: 350, settle: 700 };
const NO_SETTLE = new Set(["type", "carry"]); // sitting down at the desk; the boxes go straight into his arms
const TRUFFLE = { stride: 6, frames: 4, speed: 140, sitFor: 3000, nose: 22, notice: 110 };
// Her two gaits. The trot is the fetch's pace; the stroll is the sheet's:
// `walk` plants a foot every `stride` px at its interval, so she covers
// stride / interval px per ms (about 18 px/s).
const TROT = { pose: "trot", stride: TRUFFLE.stride, frames: TRUFFLE.frames, speed: TRUFFLE.speed };
const walkSheet = truffleSheet.actions.walk;
const WALK = { pose: "walk", stride: walkSheet.stride, frames: walkSheet.frames.length, speed: (walkSheet.stride / walkSheet.interval) * 1000 };
const BALL = { size: 10, frames: ballSheet.actions.roll.frames.length, gap: 8 };
const EDGE = 4; // air between a sprite and the pathway's end

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
// `pet` is -1, not the sheet's 4: kneeling, he leans 5 px toward her, so the
// dog who sat down 29 px from his feet to paw (PAW.dx) is where the composite
// has her, and he never takes a step between the nod and the kneel.
const BODY_X = { wave: 10, "arms-up": 10, press: 11, grab: 11, pat: 12, sit: 8, sleep: 14, pet: -1, "pet-low": 4, pickup: 7 };

// The ball in his hands, from the comments above `pickup` and `throw` in
// src/sprites/justin.js: the ball's top-left cell in his canvas per frame
// (his canvas is 62 tall, ground row 61; the ball is 10 tall, so its height
// above the ground is 52 minus the row). `throw` f2 is the release: the ball
// leaves his open hand from there, up and out. The ball he picks up lies at
// (29, 52) from his idle origin, touching his shoe: its centre PICKUP.dx from
// his feet, and `pickup`'s canvas sits so that its cell (36, 52) is on it.
const HELD = { pickup: [[36, 52], [35, 50], [28, 39]], throw: [[26, 46], [28, 44], [35, 11]] };
const BALL_ROW = 52;
export const BALL_AT_SHOE = 29 + 5 - 18; // the ball's centre from his feet when it lies at his shoe
const PICKUP = { dx: BALL_AT_SHOE };

// Truffle's canvases are centred on her, except `paw`: sit's body fills its
// first 24 columns (the comment above `paw` in src/sprites/truffle.js) and
// the six spare ones are the reach, so its anchor is sit's centre.
const TRUFFLE_X = { paw: 12 };

// [canvas width, anchor]: the anchor is the figure's centre in the canvas.
export function poseBox(who, pose) {
  const w = SHEETS[who].actions[pose].frames[0][0].length;
  return [w, who === "truffle" ? (TRUFFLE_X[pose] ?? w / 2) : (BODY_X[pose] ?? 0) + 18];
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

// Where he stands to pet her lying at `herCx`, arriving from her left.
export const petLowSpot = (herCx) => herCx - PET["pet-low"].dx;

// Asking for a pet, as the comment above `paw` in src/sprites/truffle.js
// stages it: sitting on his left, her `paw` canvas at (-23, 38) from his
// `idle` origin, painted after him (mirrored from his right edge when she is
// on his right). In feet terms her centre is 18 + 23 - 12 = 29 from his,
// which BODY_X.pet makes the `pet` composite's spot too.
const PAW = { dx: 18 + 23 - TRUFFLE_X.paw, times: 2 };

// The one-shot gestures, as the sheet says to play them: the hat tip goes up,
// holds at the brim and comes back; a greeting is two cycles of the wave with
// the last frame at full length.
export const HAT_TIP = [0, 1, 2, 3, 2, 1, 0];
const WAVE_GREETING = [0, 1, 2, 3, 0, 1, 2, 3];

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
export function createStage({ reduced, sheet, luibot: luibotSheet }) {
  const pathway = { left: 0, right: 600 };
  const yard = { left: 0, right: 600, rest: 300 }; // where the ball may go and Truffle fetches, and where it rests
  const actions = Object.keys((sheet ?? justinSheet).actions);
  // A pose the sheet does not have (yet) plays as idle.
  const pick = (pose) => (actions.includes(pose) ? pose : "idle");
  const shotOf = (pose, frames, speed = 1) => {
    const a = sheet?.actions[pose];
    if (!a || !frames) return null;
    const durations = frames.map((i) => (a.durations?.[i] ?? a.interval ?? 200) / speed);
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
    arrivedAt: -Infinity, // no settle before his first pose (a fast load paints before the clock reaches `settle`)
    onArrive: [],
    pose: "idle",
    frame: undefined,
    rest: "idle",
    override: null, // { pose, ms, until, after, flag, shot, leave }
    script: [], // beats to play after the current override
    scriptDone: null, // called when the script runs out
    faceOnArrival: undefined,
    settles: true, // a moment standing when he arrives, before his rest; false: straight into it
    whenFree: [], // things to do once no beat plays and he stands still (a cheer, taking the boxes)
    pending: [], // cancels of timers that wait on his pose (holdFor)
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
    plan: null, // { kind: 'goto' | 'fetch', gait?, ... }
    shot: null, // a one-shot in progress: { pose, frames, durations, total, t0, then }
    pending: [], // cancels of timers that wait on her pose (holdFor)
    petWait: false, // a pet asked for, waiting on her minimum hold
    pose: "sleep",
    frame: undefined,
  };
  const ball = { x: 340, y: 0, spun: 0, frame: 0, flight: null, roll: null, held: false, onFetched: null };

  // ---- luibot, the assistant ----
  // One robot, flying in straight quiet lines over the pathway and the panes
  // (the design gives him a layer over both). `x` is his canvas's left, `y`
  // his feet row's height above the ground line. He does one chore at a time
  // from a queue of steps: fly somewhere, hold a pose, do a thing.
  // He flies in a straight line at `speed` (a pane's switch is about 480px up: 2.5 s).
  const BOT = { speed: 200, hover: 12 };
  // `queue` holds chores, each { steps, pane }: `pane` names the pane a chore
  // belongs to (the feed spot, the sign switch); a pathway chore has none.
  // A chore ends where its work is; when its steps run out he goes straight
  // to the next chore, and beams home only when none is queued (one trip
  // between errands, never a trip home in between). `home` is the pathway
  // spot he last stood at.
  // `away`: the design shows him up in pane 3 (the pathway's robot is hidden
  // and the stage waits); `botGone()` is the design handing him back mid-beam,
  // so his next trip needs no beam-out.
  const bot = { x: 400, y: 0, pose: "idle", frame: undefined, facing: 1, hidden: false, away: false, steps: [], pane: undefined, queue: [], chored: false, home: 400, onFree: null };
  // A one-shot on luibot's sheet: its frames' durations and their sum.
  const botShot = (pose) => {
    const a = luibotSheet?.actions[pose];
    if (!a) return null;
    const durations = a.frames.map((_, i) => a.durations?.[i] ?? a.interval ?? 70);
    return { durations, total: durations.reduce((t, d) => t + d, 0) };
  };
  // Anything more than a small shift is a teleport (Justin: the robots "turn
  // themselves into electricity"): a `beam` step is beam out where he is (the
  // ground or the flying variant, whichever he is in; none if he is already
  // hidden mid-beam), 150 ms with no robot, then `land`: the destination is
  // read at that moment (`at` may be a function, for a spot in a pane that is
  // still rendering; null drops the rest of the chore), beam in there and
  // take `then`, the pose he arrives in.
  // `follow` keeps every step of the landing on a moving anchor (the beam-in
  // included; the beam-out plays where he is, so the beam step itself does
  // not follow); `onGone` runs if the spot is gone when he would land.
  const beam = ({ x, y, at, face, then, follow, onGone }) => ({ kind: "beam", x, y, at, face, then, landing: { follow, onGone } });
  const expandBeam = (step) => [
    ...(bot.hidden
      ? []
      : [{ kind: "clear", landing: step.at ? null : { x: step.x, y: step.y } }, { kind: "shot", pose: bot.y > 0 ? "beam-out-fly" : "beam-out" }, { kind: "hide", ms: 150 }]),
    { kind: "land", at: step.at ?? (() => ({ x: step.x, y: step.y })), face: step.face, then: step.then, home: step.home, ...step.landing },
  ];
  // No robot beams where Justin is or may walk while the beam plays (the
  // pathway only: a spot up in a pane is above him). A beam-in waits until
  // its landing box, and a beam-out until the box he stands in, is clear of
  // Justin's canvas grown by a margin and, while he walks, by the distance a
  // walk covers in the beam's time on both sides (the visitor may turn him
  // round mid-beam); after CLEAR_CAP it goes ahead (he never stands on a
  // robot's spot, so this is a guard, not a path). The design's own beams
  // (the hand-off to and from pane 3) ask the same question.
  const BEAM_MS = 6 * 70;
  const TRIP_MS = 2 * BEAM_MS + 150; // out, gone, in: how far ahead a departure looks at its landing
  const CLEAR_MARGIN = 12;
  const CLEAR_CAP = 3000;
  const PATHWAY_AIR = 60; // a landing this high (a pane's spot) clears him by height
  function clearOf(x, y, w = 28, ms = BEAM_MS + 150) {
    if (y >= PATHWAY_AIR) return true;
    const reach = justin.walking ? (JUSTIN.speed * ms) / 1000 : 0;
    const half = poseBox("justin", justin.walking ? "walk" : justin.pose)[0] / 2 + CLEAR_MARGIN + reach;
    return x + w <= justin.cx - half || x >= justin.cx + half;
  }
  // The desk chair: `tuck` frame 0 is out (desk.idle), 7 is tucked under the desk.
  // The chair starts tucked ("by default stuff stays tucked in"): he always
  // pulls it out before he sits, and leaves it out when he goes.
  const chair = { frame: 7, busy: false };
  // The chair back's left column per tuck frame, from the desk sheet.
  const CHAIR_BACK_X = [6, 9, 12, 15, 18, 21, 24, 26];
  // His canvas's x from the desk's per pull frame, from the justin sheet.
  const PULL_X = [0, -2, -5, -8, -11, -14, -17, -20];
  // Where his feet are when he takes the chair back in hand, for however far
  // in the chair is now: pull j goes with tuck 7 - j, and his canvas (body
  // offset 0, anchor 18) sits PULL_X[j] from the desk's.
  const pullSpot = (deskLeft) => deskLeft + PULL_X[7 - chair.frame] + 18;
  // The rack's top two shoeboxes: in Justin's hands, on the floor where he set
  // them down (`x` is the prop's left), in luibot's, or back on the rack.
  // They start on the rack: he takes them once he has greeted the visitor
  // (his wave has no boxes in it, so they stay in view on the rack meanwhile).
  const boxes = { where: "rack", x: 0 };

  function tickBot(now, dt) {
    if (bot.away) return; // up in the pane: the design draws him there
    // gone on his way home and an errand came in: he lands at the errand instead
    if (bot.steps[0]?.kind === "land" && bot.steps[0].home && bot.hidden && bot.queue.length) bot.steps = [];
    if (!bot.steps.length && bot.queue.length) {
      const chore = bot.queue.shift();
      bot.steps = chore.steps;
      bot.pane = chore.pane;
    }
    if (!bot.steps.length) {
      bot.pane = undefined;
      if (bot.onFree) {
        // the design wants him up in pane 3 and he is free now: it beams him
        // out from wherever he stands (the rack, an errand's spot, home), so
        // he does not go home first
        tryBotUp();
        return;
      }
      if (bot.y > 0 || bot.hidden) {
        // an errand done and nothing queued: home in one trip
        bot.steps = [{ ...beam({ x: bot.home, y: 0, face: 1 }), home: true }];
      } else {
        bot.home = bot.x;
        if (bot.pose.startsWith("beam")) {
          bot.pose = "idle"; // an errand dropped as he was beaming out: he is still here
          bot.frame = undefined;
        }
        return;
      }
    }
    const step = bot.steps[0];
    if (step.follow && !followAnchor()) {
      // scrolled out of the pane's window: the errand counts as done and he leaves
      step.onGone?.();
      bot.steps = [];
      tickBot(now, dt);
      return;
    }
    if (step.pose) bot.pose = step.pose;
    if ("frame" in step) bot.frame = step.frame;
    if (step.kind === "beam") {
      bot.steps.splice(0, 1, ...expandBeam(step));
      tickBot(now, dt);
      return;
    }
    if (step.kind === "clear") {
      // he leaves only once the box he stands in is out of Justin's way and,
      // from the pathway, the box he lands in too when it is known; from a
      // spot up in a pane he leaves at once and waits hidden for his landing
      // (waiting there left him frozen over the words of a scrolled pane)
      step.since ??= now;
      const ok = clearOf(bot.x, bot.y) && (!step.landing || bot.y >= PATHWAY_AIR || clearOf(step.landing.x, step.landing.y, 28, TRIP_MS));
      if (!ok && now - step.since < CLEAR_CAP) return;
      bot.steps.shift();
      tickBot(now, dt);
      return;
    }
    if (step.kind === "land") {
      const to = step.at();
      if (!to) {
        // the spot is gone (its pane closed, its anchor scrolled away): the
        // chore counts as done and ends here; he is still hidden, so his next
        // trip (home, or the next errand) starts with a beam-in
        step.onGone?.();
        bot.steps = [];
        tickBot(now, dt);
        return;
      }
      step.since ??= now;
      if (!clearOf(to.x, to.y) && now - step.since < CLEAR_CAP) return; // Justin is in the landing: he stays gone a moment longer
      bot.steps.shift();
      bot.x = to.x;
      bot.y = to.y;
      bot.hidden = false; // here he comes
      if (step.face) bot.facing = step.face;
      const air = to.y > 0;
      const { follow, onGone } = step;
      bot.steps.unshift(
        { kind: "shot", pose: air ? "beam-in-fly" : "beam-in", face: step.face, follow, onGone },
        { kind: "do", fn: () => {}, pose: step.then ?? (air ? "fly" : "idle"), follow, onGone },
      );
      tickBot(now, dt);
      return;
    }
    if (step.kind === "do") {
      bot.steps.shift();
      step.fn();
      tickBot(now, dt); // an instant step: the next one shows in the same frame
      return;
    }
    if (step.kind === "shot") {
      // a one-shot stepped by its durations; no art or reduced motion: skipped
      const shot = botShot(step.pose);
      if (!shot || reduced()) {
        bot.steps.shift();
        bot.frame = undefined;
        tickBot(now, dt);
        return;
      }
      if (!step.t0) {
        step.t0 = now;
        if (step.face) bot.facing = step.face;
      }
      const elapsed = now - step.t0;
      let t = 0;
      let f = shot.durations.length - 1;
      for (let i = 0; i < shot.durations.length; i++) {
        t += shot.durations[i];
        if (elapsed < t) {
          f = i;
          break;
        }
      }
      bot.frame = f;
      if (elapsed >= shot.total) {
        bot.steps.shift();
        bot.frame = undefined;
        tickBot(now, dt);
      }
      return;
    }
    if (step.kind === "hide") {
      if (!step.until) {
        step.until = now + (reduced() ? 0 : step.ms);
        bot.hidden = true; // until he lands: a chore dropped meanwhile still brings him back with a beam-in
      }
      if (now >= step.until) {
        bot.steps.shift();
        tickBot(now, dt);
      }
      return;
    }
    if (step.kind === "hold") {
      if (!step.until) {
        step.until = now + step.ms;
        step.enter?.();
      }
      if (now >= step.until) bot.steps.shift();
      return;
    }
    const dx = step.x - bot.x;
    const dy = step.y - bot.y;
    if (dx && !step.face) bot.facing = sign(dx);
    if (step.face) bot.facing = step.face;
    const dist = Math.hypot(dx, dy);
    if (reduced() || dist <= BOT.speed * dt) {
      bot.x = step.x;
      bot.y = step.y;
    } else {
      bot.x += (dx / dist) * BOT.speed * dt;
      bot.y += (dy / dist) * BOT.speed * dt;
    }
    if (Math.abs(step.x - bot.x) < 0.01 && Math.abs(step.y - bot.y) < 0.01) {
      bot.x = step.x;
      bot.y = step.y;
      bot.steps.shift();
    }
  }

  // Justin sets the stack down where he stands (the prop sits at (10, 31) in
  // his canvas, dropped to the ground) and luibot comes for it: lifts off,
  // hovers over the boxes, picks them up (`fly-carry`), carries them to the
  // rack, puts them back and lands at `restAt`, where he stays. Under reduced
  // motion the boxes are simply back on the rack.
  // The stack's slot on the rack is the rack's x 37..52, rows 0..22 (its
  // bottom 13px above the ground); `fly-carry` holds the same 16 columns at
  // his canvas x 5 (7 when he is flipped), rows 18..40, nine rows under his
  // feet. He comes at the boxes from the right, facing left, and keeps facing
  // the stack all the way: pick up where they lie, carry them to the slot so
  // they sit exactly over it, let go (the rack turns `idle` in the same frame
  // at the same pixels), then back to `restAt`.
  const RACK_SLOT = { x: 37, bottom: 13 };
  const CARRY = { x: 5, xFlipped: 7, below: 9 };
  // At a spot in a pane he keeps to its anchor while the pane scrolls or
  // re-flows: every tick, and (the design calls it) in the same frame the
  // pane expands, so no frame draws him over the words that moved. False when
  // the anchor is out of the pane's window.
  function followAnchor() {
    const step = bot.steps[0];
    if (!step?.follow) return true;
    const to = step.follow();
    if (!to) return false;
    bot.x = to.x;
    bot.y = to.y;
    return true;
  }

  // The design wants luibot up in pane 3 (or not): `onFree` fires once, the
  // moment he has nothing to do (his pathway chores, the boxes or the chair,
  // finish first; a pane's chore has been dropped by then), and the stage
  // stops moving him (`away`). Read here, on the stage, not from a snapshot a
  // frame old: a chore queued or dropped this very frame counts.
  const botBusy = () => bot.steps.length > 0 || bot.queue.length > 0;
  function wantBotUp(onFree) {
    bot.onFree = onFree;
    tryBotUp();
  }
  function tryBotUp() {
    // `away` is no bar: a return trip the design has not yet drawn is
    // cancelled by it before it shows
    if (!bot.onFree || botBusy()) return;
    const up = bot.onFree;
    bot.onFree = null;
    bot.away = true;
    up();
  }
  // The design has beamed him out of the pathway: he is nowhere now, and comes
  // back down at his spot at the agents step, on his feet, however he left.
  function botTaken() {
    bot.x = bot.home;
    bot.y = 0;
    bot.pose = "idle";
    bot.frame = undefined;
    bot.facing = 1;
    bot.hidden = false;
  }

  // The visitor left a pane: its chores are dropped (a queued one costs no
  // beam at all), and one he was on ends where he is; the next tick takes him
  // straight to the next errand, or home. A pathway chore (the boxes in his
  // hands, the chair half tucked) finishes its small moves first.
  function cancelPaneChores(keepPane) {
    bot.queue = bot.queue.filter((c) => !c.pane || c.pane === keepPane);
    if (!bot.pane || bot.pane === keepPane) return;
    bot.pane = undefined;
    // caught beaming out: that beam finishes (then he is hidden, and his next
    // trip starts with a beam-in); anything else ends where he is
    const cur = bot.steps[0];
    bot.steps = cur?.kind === "shot" && cur.pose.startsWith("beam-out") ? [cur, { kind: "hide", ms: 150 }] : [];
    if (!bot.steps.length) bot.frame = undefined; // a frame the dropped step had pinned (the hand on the knob) is not held
  }

  // `instant` (a phone, where the hello stretch is off screen once he has
  // left it) puts them straight back, as reduced motion does.
  function setDownBoxes(rackLeft, { instant = false } = {}) {
    if (boxes.where !== "justin") return;
    if (reduced() || instant) {
      boxes.where = "rack";
      return;
    }
    boxes.where = "floor";
    boxes.x = Math.round(justin.cx - 18 + 10);
    justin.pose = "idle"; // his hands are empty in the same update that puts them on the floor
    bot.chored = true;
    const face = -1; // toward the rack, which is left of everything
    // tidying up after him comes before any pane errand queued at the same step
    bot.queue.unshift({ steps: [
      beam({ x: boxes.x - CARRY.xFlipped, y: BOT.hover, face }),
      { kind: "hold", ms: 120, pose: "fly" },
      { kind: "do", fn: () => (boxes.where = "bot"), pose: "fly-carry" },
      { kind: "fly", x: rackLeft + RACK_SLOT.x - CARRY.xFlipped, y: RACK_SLOT.bottom + CARRY.below, pose: "fly-carry", face },
      { kind: "do", fn: () => (boxes.where = "rack"), pose: "fly" },
      { kind: "hold", ms: 300, pose: "fly" }, // then home to his spot at the agents step, like every errand
    ] });
  }

  // Leaving the desk: luibot beams to the chair's back (flipped so his still
  // hand is on the chair's side, on the back's top rows) and pushes it under
  // the desk, moving right with it frame by frame; the chair stays tucked
  // while Justin is away. The chore ends at the chair: from there he goes to
  // his next errand or home to his spot at the agents step. Under reduced
  // motion the chair is simply tucked.
  // `instant` (a phone, where luibot has no room and the desk is off screen
  // once he has left it) tucks it at once, as reduced motion does.
  function tuckChair(deskLeft, { instant = false } = {}) {
    if (chair.frame === 7 || chair.busy) return;
    if (reduced() || instant) {
      chair.frame = 7;
      return;
    }
    chair.busy = true;
    bot.chored = true;
    // His raised hand (flipped, his canvas rows 9-12 at its right edge) on the
    // back's top rows (desk rows 26-29): canvas x 27 left of the back's left
    // column, feet 13 up (flames end 8 above the ground).
    const atBack = (f) => deskLeft + CHAIR_BACK_X[f] - 27;
    const from = chair.frame; // the chair may be part way in
    const pushY = 13;
    const steps = [
      beam({ x: atBack(from), y: pushY, face: -1, then: "fly-wave" }),
      { kind: "do", fn: () => {}, pose: "fly-wave", frame: 0 },
      { kind: "hold", ms: 200 },
    ];
    for (let f = from + 1; f <= 7; f++) {
      steps.push({
        kind: "hold",
        ms: 75,
        pose: "fly-wave",
        frame: 0,
        enter: () => {
          chair.frame = f;
          bot.x = atBack(f);
        },
      });
    }
    steps.push({ kind: "hold", ms: 250, pose: "fly", frame: undefined }, { kind: "do", fn: () => (chair.busy = false) });
    bot.queue.unshift({ steps, kind: "tuck" }); // before any pane errand queued at the same step
  }

  // He is back before luibot has pushed the chair in: the chore is dropped
  // where it is (the chair stays as far in as it got, and he pulls it from
  // there); if luibot is on it, he leaves it (for his next errand, or home).
  function cancelTuck() {
    bot.queue = bot.queue.filter((c) => c.kind !== "tuck");
    if (!chair.busy) return;
    chair.busy = false;
    bot.steps = [];
  }

  // Back at the desk: standing at `pullSpot` (his hand on the chair back, his
  // canvas PULL_X from the desk's), he pulls it out, `pull` j with `tuck` 7-j
  // at 75 ms, shuffling backward as the sheet says, then walks round to the
  // desk's origin (`station`) and sits down to type. If luibot is on the
  // chair, that chore is dropped and he pulls from where it got to.
  function pullChair(deskLeft, station) {
    cancelTuck();
    if (chair.frame === 0 || reduced()) {
      chair.frame = 0;
      walkTo(station, { rest: "type" });
      return;
    }
    // The chair may have moved while he walked here (luibot was pushing it):
    // the last few px to its back are walked too, never cut. cancelTuck has
    // stopped it, so this is at most one more walk.
    const spot = pullSpot(deskLeft);
    if (Math.abs(justin.cx - spot) >= 1) {
      walkTo(spot, { rest: "idle", face: 1, onArrive: () => pullChair(deskLeft, station) });
      return;
    }
    justin.cx = justin.target = spot;
    // from as far in as the chair is: pull j goes with tuck 7 - j
    const beats = [];
    const first = 7 - chair.frame;
    for (let j = first; j < 8; j++) {
      beats.push({
        pose: "pull",
        frames: [j],
        ms: 0,
        facing: 1,
        shift: j === first ? 0 : PULL_X[j] - PULL_X[j - 1], // the shuffle from the frame before
        onStart: () => (chair.frame = 7 - j),
      });
    }
    justin.script = beats;
    justin.scriptDone = () => walkTo(station, { rest: "type" });
    nextBeat();
  }

  // A chore at a spot in a pane: beam there (`at()` gives x = his canvas's
  // left, y = his feet row's height above the pathway's ground, read once he
  // is mid-beam so the pane has had time to render; null drops the chore),
  // do the work, report done, and look at it for a moment; then the next
  // errand, or home. The work is `action` looping for `ms` (feed poured), or
  // a `reach`: `action`'s frames stepped one by one ({ frame, ms }), with
  // `done` on the frame that makes contact, so the thing he touches moves on
  // that frame and not a beat later (the switch: arm up, then the hand comes
  // down onto the knob and the sign lights). `flip` faces him left so his
  // working hand is on the right. Under reduced motion he does not fly and
  // the chore is done at once.
  function flyToSpot({ at, action, ms, reach, flip = false, pane, onDone }) {
    if (reduced()) {
      onDone?.();
      return;
    }
    bot.chored = true;
    let done = false;
    const report = () => {
      if (done) return;
      done = true;
      onDone?.();
    };
    const work = reach
      ? reach.flatMap((r) => [...(r.done ? [{ kind: "do", fn: report, pose: action, frame: r.frame }] : []), { kind: "hold", ms: r.ms, pose: action, frame: r.frame }])
      : [{ kind: "hold", ms, pose: action }, { kind: "do", fn: report, pose: "fly" }];
    // at the spot every step follows the anchor (the pane may scroll under him)
    const atSpot = (step) => ({ ...step, follow: at, onGone: report });
    bot.queue.push({
      pane,
      steps: [
        beam({ at, face: flip ? -1 : 1, follow: at, onGone: report }),
        atSpot({ kind: "hold", ms: 150, pose: "fly" }),
        ...work.map(atSpot),
        atSpot({ kind: "hold", ms: 800, pose: "fly", frame: undefined }), // a look at his work
      ],
    });
  }

  // He takes the boxes from the rack when they are there; true if he holds them.
  // He takes the boxes once his hands are free: not mid-wave (the wave has
  // no boxes in it), not walking, and after a moment standing there, long
  // enough for the greeting to begin first when there is one.
  const TAKE_HOLD = 1500;
  function takeBoxes() {
    if (boxes.where === "rack" && !justin.walking) {
      if (!isFree()) {
        whenFree(takeBoxes);
        return false;
      }
      if (holdFor(justin, takeBoxes, TAKE_HOLD)) return false;
      boxes.where = "justin";
      justin.rest = pick("carry"); // the design confirms the rest a render later
      justin.pose = justin.rest; // in his arms in the same update that takes them off the rack
    }
    return boxes.where === "justin";
  }

  // Where luibot stands until his first chore (a layout may move him): the
  // first paint places him even with an errand already queued for the open
  // pane; once he has been about, his spot is his own.
  function placeBot(x) {
    if (!Number.isFinite(x) || bot.steps.length || (bot.chored && bot.placed)) return;
    bot.placed = true;
    bot.x = bot.home = x;
    bot.y = 0;
    bot.pose = "idle";
  }

  const fits = (who, pose, cx, facing, bounds = pathway) =>
    clamp(cx, bounds.left + EDGE + extent(who, pose, facing, -1), bounds.right - EDGE - extent(who, pose, facing, 1));
  const fitsJustin = (cx, pose = justin.rest, facing = justin.facing) =>
    Math.round(fits("justin", "walk", fits("justin", pick(pose), cx, facing), facing));
  const fitsTruffle = (cx) => Math.round(fits("truffle", "sleep", cx, 1));
  const fitsBall = (x) => clamp(x, yard.left + EDGE + BALL.size / 2, yard.right - EDGE - BALL.size / 2);
  const busyFetching = () => truffle.plan?.kind === "fetch" || !!ball.flight || !!ball.roll;

  // Where the ball rests beside Justin's feet on `side`, given the pose he
  // will be in there.
  // Standing, that is where he picks it up (touching his shoe); a wider rest
  // (sitting, asleep) keeps the ball clear of the canvas.
  const ballHome = (side, pose = justin.rest, at = justin.target) => {
    const wide = extent("justin", pick(pose), justin.facing, side);
    return fitsBall(at + side * (wide <= 18 ? PICKUP.dx : wide + BALL.gap + BALL.size / 2));
  };

  // ---- Justin ----

  // Walks to `cx`, which is clamped so the pose he will rest in fits there.
  // `rest` is that pose. Sitting, sipping or asleep, he stands up first. A
  // hop of a few pixels is not worth a walk. Any beats he was playing stop,
  // except a beat that says how to `leave` it (the cup in his hand goes back
  // on the tray first, quickly), which plays before he goes. Called while he
  // is already walking, he turns (or carries on) toward the new target from
  // where he is: no jump, no restart of the stride. `face` is the way he
  // turns on arrival, whatever direction he came from: every pose with a
  // target (the cow, Truffle, the machine, the chair, the rack) is drawn
  // facing that target, so the station says which way that is. `settle:
  // false` takes him straight into `rest` on arrival, with no moment standing
  // first (the two steps clear of Truffle after a pet, then down).
  function walkTo(cx, opts = {}) {
    const { rest = justin.rest, onArrive, face, settle = true } = opts;
    const leaving = justin.override?.leave;
    if (leaving && !justin.walking) {
      justin.override = null;
      justin.script = leaving.map((b) => ({ ...b }));
      justin.scriptDone = () => walkTo(cx, opts);
      nextBeat();
      return 0;
    }
    justin.rest = pick(rest);
    const facing = Math.abs(cx - justin.cx) >= 4 ? sign(cx - justin.cx) : justin.facing;
    cx = fitsJustin(cx, rest, facing);
    justin.override = null;
    justin.script = [];
    justin.scriptDone = null;
    justin.onArrive = onArrive ? [onArrive] : [];
    justin.whenFree = []; // whatever waited for his hands is off: he is going somewhere
    dropPending(justin);
    justin.faceOnArrival = face;
    justin.settles = settle;
    if (reduced()) {
      // still: he is there, in his rest pose, and what follows the walk runs now
      justin.cx = justin.target = cx;
      justin.walking = false;
      justin.facing = face ?? facing;
      justin.pose = justin.rest;
      flushArrival();
      return 0;
    }
    const distance = Math.abs(cx - justin.cx);
    if (distance < 4) {
      justin.cx = justin.target = cx;
      if (face) justin.facing = face;
      if (!justin.walking) flushArrival();
      return 0;
    }
    justin.target = cx;
    if (!justin.walking) {
      justin.walked = 0;
      const standing = ["idle", "walk", "hat", "wave", "arms-up", "carry", "press", "grab", "pat", "pull", "nod", "pickup", "throw"].includes(justin.pose);
      justin.risingUntil = standing || reduced() ? 0 : performance.now() + JUSTIN.rise;
    }
    justin.walking = true;
    return distance;
  }

  function flushArrival() {
    const done = justin.onArrive;
    justin.onArrive = [];
    for (const fn of done) fn();
    flushFree();
  }

  // Free: no beat playing or queued, and not walking. `whenFree(fn)` runs fn
  // now if so, else once he is (the walk he is on ends, or the beat and what
  // follows it end). A walk to somewhere new drops what waited.
  const isFree = () => !justin.override && !justin.script.length && !justin.walking;
  function whenFree(fn) {
    if (isFree()) fn();
    else if (!justin.whenFree.includes(fn)) justin.whenFree.push(fn);
  }
  function flushFree() {
    if (!isFree()) return;
    const fns = justin.whenFree.splice(0);
    for (const fn of fns) fn();
  }

  // A pose for a while. If it does not fit where he stands (asleep at the
  // pathway's end, say), he steps to where it does.
  function strike(pose, ms, after, { flag, frames, speed, leave } = {}) {
    if (reduced()) {
      after?.(); // still: a beat is over the moment it starts
      return;
    }
    pose = pick(pose);
    const shot = shotOf(pose, frames, speed);
    if (justin.walking) {
      justin.onArrive.push(() => strike(pose, ms, after, { flag, frames, speed, leave }));
      return;
    }
    const at = fitsJustin(justin.cx, pose);
    if (at !== justin.cx && Math.abs(at - justin.cx) >= 4) {
      walkTo(at, { onArrive: () => strike(pose, ms, after, { flag, frames, speed, leave }) });
      return;
    }
    justin.cx = justin.target = at;
    // a beat with frames lasts their durations, then holds the last for `ms`
    justin.override = { pose, ms: shot ? shot.total + ms : ms, until: 0, t0: 0, after, flag, shot, leave };
    // and it shows in this very update (a snapshot taken before the next tick
    // showed his rest for a frame; on a phone, his sleep for 100 ms before he
    // stood for Truffle). A pose that no tick ever drew was never held.
    justin.pose = pose;
    justin.frame = shot ? shot.frames[0] : undefined;
    const h = holds.get(justin);
    if (h.since > lastTick) h.pose = pose;
  }

  // A sequence of beats, each { pose, ms, flag, frames?, speed?, leave? },
  // played one after another once he has arrived; the flag names the moment
  // for whoever else is in the scene (a robot waving back, the coffee machine
  // brewing); `leave` is the short sequence that undoes the beat if he is
  // called away in the middle of it. `then` runs once the last beat is over
  // (not when he is called away).
  function play(beats, then) {
    if (justin.walking) {
      justin.onArrive.push(() => play(beats, then));
      return;
    }
    justin.script = beats.slice();
    justin.scriptDone = then ?? null;
    if (!justin.override) nextBeat();
  }

  function nextBeat() {
    const beat = justin.script.shift();
    if (!beat) {
      const done = justin.scriptDone;
      justin.scriptDone = null;
      done?.();
      return;
    }
    if (beat.facing) justin.facing = beat.facing;
    if (beat.shift) justin.cx = justin.target = justin.cx + beat.shift; // a shuffle the sheet draws
    beat.onStart?.();
    strike(beat.pose, beat.ms, nextBeat, beat);
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
    let at = fitsJustin(justin.cx, justin.rest);
    // a wide rest (sitting, asleep) must not land on the ball at his shoe
    const side = sign(ball.x - at) || 1;
    const wide = extent("justin", justin.rest, justin.facing, side);
    if (!ball.held && wide > 18 && Math.abs(ball.x - at) < wide + BALL.gap + BALL.size / 2) at = fitsJustin(ball.x - side * (wide + BALL.gap + BALL.size / 2), justin.rest);
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
        justin.arrivedAt = justin.settles ? now : -Infinity;
        justin.pose = "idle";
        justin.frame = undefined;
        if (justin.faceOnArrival) justin.facing = justin.faceOnArrival; // he turns to what he came for
        flushArrival();
        if (justin.override) showOverride(now);
        else if ((NO_SETTLE.has(justin.rest) || !justin.settles) && !justin.walking) justin.pose = justin.rest; // he sits straight down
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
      if (!justin.override && !justin.walking && justin.script.length) nextBeat(); // beats queued while this one played
      flushFree();
      if (justin.override) {
        showOverride(now);
        return;
      }
      if (justin.walking) return; // the beat handed over to a walk: the pose stays until the walk's first step
    }
    justin.pose = now - justin.arrivedAt < JUSTIN.settle && !reduced() && !NO_SETTLE.has(justin.rest) ? "idle" : justin.rest;
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
        phase: "approach",
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

  // Back to her own stretch of the pathway, to sleep. Only asked for when the
  // visitor goes to her pane: she never wanders home on her own.
  function goHome() {
    if (busyFetching()) {
      truffle.plan.then = goHome;
      return;
    }
    // Close to home counts (she lies down a little short of it after asking
    // for a pet); trotting off only to walk straight back would be fussing.
    if (Math.abs(truffle.cx - truffle.home) < 40) {
      if (truffle.pose === "sit") truffle.sitUntil = performance.now() + 1500;
      return;
    }
    start({ kind: "goto", target: () => truffle.home, lookAt: () => justin.cx }, { earIn: 200, trotIn: 500 });
  }

  // One of her one-shots (`wake`, `paw`), stepped from the sheet's durations
  // and repeated `times`, then `then`. Under reduced motion only `then` runs.
  function truffleShot(pose, times, then) {
    if (reduced()) {
      then?.();
      return;
    }
    const a = truffleSheet.actions[pose];
    const frames = [];
    for (let i = 0; i < times; i++) frames.push(...a.frames.map((_, k) => k));
    const durations = frames.map((k) => a.durations[k]);
    truffle.shot = { pose, frames, durations, total: durations.reduce((t, d) => t + d, 0), t0: 0, then };
    truffle.pose = pose;
    truffle.frame = frames[0];
  }

  function planTarget() {
    const p = truffle.plan;
    if (p.kind === "goto") return fitsTruffle(p.target());
    const goal = fitsBall(p.goal());
    if (p.phase === "approach") {
      // she runs to where the ball will stop, not to where it is now, so she
      // sits down once beside it instead of catching up a pixel at a time
      const stop = ball.flight ? ball.flight.then : ball.roll ? ball.roll.to : ball.x;
      p.dir = sign(goal - stop) || 1;
      return fitsTruffle(stop - p.dir * TRUFFLE.nose);
    }
    // Pushing: while he is still walking ahead of it, the ball stops short of
    // his feet, so she trails him rather than rolling it through him.
    let stop = goal;
    const ahead = inYard() && justin.walking && sign(justin.cx - ball.x) === p.dir;
    if (ahead) {
      const feet = justin.cx - p.dir * (extent("justin", justin.pose, justin.facing, -p.dir) + BALL.gap + BALL.size / 2);
      stop = p.dir > 0 ? Math.min(goal, feet) : Math.max(goal, feet);
    }
    return fitsTruffle(stop - p.dir * TRUFFLE.nose);
  }

  function tickTruffle(now, dt) {
    const shot = truffle.shot;
    if (shot) {
      if (!shot.t0) shot.t0 = now;
      const elapsed = now - shot.t0;
      // pawing at nobody (he was called away mid-ask): she just sits
      const dropped = shot.pose === "paw" && justin.override?.flag !== "asked";
      if (elapsed < shot.total && !dropped) {
        truffle.pose = shot.pose;
        truffle.frame = frameAt(shot, elapsed);
        return;
      }
      truffle.shot = null;
      // A one-shot never loops: it ends in the pose the sheet says follows it,
      // whether or not the follow-up still runs. `wake` f3 is `walk` f0 cell for
      // cell, with walk's canvas at (+2, 0) in wake's: one px on her centre.
      if (shot.pose === "wake") {
        truffle.pose = "walk";
        truffle.frame = 0;
        truffle.cx += truffle.facing;
      } else {
        truffle.pose = "sit";
        truffle.frame = undefined;
      }
      if (dropped) {
        truffle.sitUntil = now + 1500;
        return;
      }
      shot.then?.();
      return;
    }
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
      const gait = p.gait ?? TROT;
      truffle.target = planTarget();
      const remaining = truffle.target - truffle.cx;
      // a target that crept a pixel (the ball easing to a stop) is not worth a stride
      if (Math.abs(remaining) >= 2) {
        truffle.facing = sign(remaining);
        const step = reduced() ? Math.abs(remaining) : Math.min(gait.speed * dt, Math.abs(remaining));
        truffle.cx += truffle.facing * step;
        truffle.walked += step;
        truffle.pose = gait.pose;
        truffle.frame = Math.floor(truffle.walked / gait.stride) % gait.frames;
        if (p.kind === "fetch" && p.phase === "push") moveBall(truffle.cx + p.dir * TRUFFLE.nose);
        return;
      }
      truffle.cx = truffle.target;
      if (p.kind === "fetch" && p.phase === "push") moveBall(truffle.cx + p.dir * TRUFFLE.nose); // the last pixel or two, to the goal exactly
      if (p.kind === "fetch" && p.phase === "approach") {
        if (!ball.flight && !ball.roll) {
          // the ball has stopped: into the push (a sit she has just taken shows its minimum first)
          if (truffle.pose === "sit" && now - holds.get(truffle).since < MIN_HOLD) return;
          p.phase = "push";
          truffle.walked = 0;
          return;
        }
        truffle.pose = "sit"; // she waits for it to stop
        truffle.frame = undefined;
        truffle.facing = sign(ball.x - truffle.cx) || truffle.facing;
        return;
      }
      if (p.kind === "fetch" && p.phase === "push") {
        const goal = fitsBall(p.goal());
        if (sign(goal - ball.x) !== p.dir && Math.abs(goal - ball.x) > 2) {
          p.phase = "approach";
          return;
        }
      }
      truffle.pose = "sit";
      truffle.frame = undefined;
      truffle.facing = sign(p.lookAt() - truffle.cx) || truffle.facing;
      if (justin.walking && p.kind === "fetch") return;
      truffle.trotting = false;
      truffle.plan = null;
      truffle.sitUntil = reduced() ? now : now + TRUFFLE.sitFor; // still: straight to her rest
      p.then?.();
      return;
    }
    truffle.frame = /walk|trot/.test(truffle.pose) ? 0 : undefined; // standing after a wake: walk frame 0, not a loop
    // On her feet with nothing to do: she waits while he is busy with the
    // ball (the throw comes after her wake), else sits after her minimum hold
    // and lies down. Called away mid-pickup he left her standing for good.
    if (/walk|trot/.test(truffle.pose) && !truffle.plan) {
      const forHim = ball.held || ball.flight || ball.roll || justin.script.length || HELD[justin.pose] || (justin.walking && inYard());
      if (!forHim && now - holds.get(truffle).since >= MIN_HOLD) {
        truffle.pose = "sit";
        truffle.frame = undefined;
        truffle.sitUntil = now + TRUFFLE.sitFor;
      }
    }
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

  // A hand on Truffle, staged as the sheets say (the comments above `paw`
  // and `wake` in truffle.js, `nod` in justin.js): she comes to him and asks.
  // He stands still (idle, flagged "asked") while she does. Asleep or one ear
  // up she wakes first (`wake`, then `walk` frame 0 cell for cell, one px
  // over as the sheet places it). She walks when he is near and trots when
  // he is far (a stroll across the pathway would take ten seconds), sits at
  // his side, paws his leg twice; he nods and kneels where he stands
  // (`pet`). Then she lies down where she is, and he moves off only if
  // his rest pose is too wide to fit beside her (asleep, sitting). Called
  // away at any point, he just leaves: she finishes her walk, sits and
  // sleeps. Nobody is ever cut to a new place.
  // `then` runs once the pet is over (never if he is called away first).
  function pet(then) {
    if (ball.flight || ball.roll) return false;
    const again = () => pet(then);
    if (truffle.plan) {
      truffle.plan.then = again; // when she gets where she is going
      return true;
    }
    if (justin.walking) {
      justin.onArrive.push(again);
      return true;
    }
    const asked = () => justin.override?.flag === "asked";
    if (truffle.shot || truffle.petWait || (asked() && truffle.plan)) return true; // she is already on her way
    // He is on his feet for her from this very update, before any wait on
    // her side (a rest pose shown for her minimum hold was the phone defect).
    if (!reduced() && !asked()) strike("idle", 60000, undefined, { flag: "asked" });
    // she only just lay down: let it show before she wakes
    const here = justin.target;
    if (
      holdFor(truffle, () => {
        truffle.petWait = false;
        if (justin.target === here) pet(then); // still where he asked from
      })
    ) {
      truffle.petWait = true;
      return true;
    }
    // She asks from the side away from a ball at his feet (it stays free for
    // the next throw), else from the side she is on.
    const ballSide = Math.abs(ball.x - justin.cx) < 40 ? sign(ball.x - justin.cx) : 0;
    const side = ballSide ? -ballSide : sign(truffle.cx - justin.cx) || 1;
    const spot = fitsTruffle(justin.cx + side * PAW.dx);
    const settle = () => {
      truffle.sitUntil = performance.now() + 1500; // she lies down right there
      const wide = extent("justin", justin.rest, side, side);
      const at = truffle.cx - side * (wide + poseBox("truffle", "sleep")[1]);
      // up from his knees, a moment on his feet, then the two steps clear of
      // her and straight down into his rest: three poses, each for a reason,
      // none under MIN_HOLD (reviewer A counted four in 1.2 s here)
      if (wide > 18 && Math.abs(at - justin.cx) >= 4) strike("idle", MIN_HOLD, () => walkTo(at, { settle: false, onArrive: () => (justin.facing = side) }));
      then?.();
    };
    if (reduced()) {
      // still: she is already lying at his side, petted, and he rests clear of her
      truffle.plan = null;
      truffle.cx = truffle.target = spot;
      truffle.facing = -side;
      truffle.pose = "sleep";
      truffle.sitUntil = 0;
      settle();
      return true;
    }
    const ask = () => {
      truffle.sitUntil = 0;
      if (!asked()) {
        truffle.sitUntil = performance.now() + 1500;
        return;
      }
      truffle.facing = sign(justin.cx - truffle.cx) || truffle.facing;
      truffleShot("paw", PAW.times, () => {
        truffle.pose = "sit";
        strike("nod", 0, () => {
          justin.facing = side;
          strike("pet", 3600, settle); // he kneels where he stands
        }, { frames: [0, 1] });
      });
    };
    const come = () =>
      start(
        { kind: "goto", gait: Math.abs(spot - truffle.cx) > 80 ? TROT : WALK, target: () => spot, lookAt: () => justin.cx, then: ask },
        { earIn: 0, trotIn: 0 },
      );
    if (truffle.pose === "sleep" || truffle.pose === "ear") {
      truffle.earAt = truffle.earDown = 0;
      truffleShot("wake", 1, come);
    } else come();
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

  // Released from his open hand (where `throw` f2 pins it) toward the longer
  // side of the yard: an arc to about two thirds of the way, then a roll that
  // eases out. Truffle sets off as it leaves his hand.
  function launch() {
    const dir = justin.facing;
    const from = ball.x;
    const to = fitsBall(dir > 0 ? yard.right - 40 : yard.left + 40);
    const land = from + (to - from) * 0.7;
    ball.held = false;
    if (reduced()) {
      moveBall(to);
      ball.y = 0;
    } else {
      ball.flight = { from, to: land, y0: ball.y, t0: performance.now(), dur: 650 + Math.abs(land - from) * 0.45, h: 44, then: to };
    }
    // one ear up as it leaves his hand, and she is off (the ear shows its minimum)
    fetchHome({ earIn: 150, trotIn: 150 + MIN_HOLD }, () => {
      const f = ball.onFetched;
      ball.onFetched = null;
      f?.();
    });
  }

  // The throw: instant when the ball is at his feet; when it is not, Truffle
  // brings it first and he throws as it arrives. Waits while one is in play.
  // `then` runs once she has brought the ball back to his feet.
  function throwBall(then) {
    if (ball.flight || ball.roll) return false;
    const again = () => throwBall(then);
    if (truffle.plan?.kind === "fetch") {
      truffle.plan.then = again;
      return true;
    }
    if (justin.walking) {
      justin.onArrive.push(again);
      return true;
    }
    const side = sign(ball.x - justin.cx) || 1;
    // A throw starts only with her awake and the ball lying free: asleep she
    // wakes first, and lying or sitting over the ball she gets up and walks
    // off it, then he throws.
    if (holdFor(truffle, again)) return true; // a pose she only just took shows for its minimum first
    const lying = truffle.pose === "sleep" || truffle.pose === "ear";
    const covering = Math.abs(truffle.cx - ball.x) < poseBox("truffle", truffle.pose)[0] / 2 + BALL.size / 2;
    if ((lying || covering) && !truffle.plan && !truffle.shot) {
      const aside = fitsTruffle(ball.x + (sign(truffle.cx - justin.cx) || 1) * 30);
      const off = () =>
        covering ? start({ kind: "goto", gait: WALK, target: () => aside, lookAt: () => justin.cx, then: again }, { earIn: 0, trotIn: 0 }) : again();
      if (lying) {
        truffle.earAt = truffle.earDown = 0;
        truffleShot("wake", 1, off);
      } else off();
      return true;
    }
    const atFeet = Math.abs(ball.x - justin.cx) <= extent("justin", justin.pose, justin.facing, side) + BALL.gap + BALL.size + 6;
    if (!atFeet) {
      fetchHome({ earIn: 150, trotIn: 450 }, throwBall);
      return true;
    }
    // He picks it up where it lies (walking the difference if it is not at
    // his shoe), turns to the yard and tosses it underhand; the ball rides
    // in his hand frame by frame (tickBall) and leaves it at `throw` f2.
    const spot = ball.x - side * PICKUP.dx;
    if (Math.abs(spot - justin.cx) >= 1) {
      walkTo(spot, { onArrive: again, face: side });
      return true;
    }
    if (justin.override?.flag === "asked") justin.override = null; // she asked and he plays instead
    ball.onFetched = then;
    const dir = justin.cx - yard.left > yard.right - justin.cx ? -1 : 1;
    play([
      { pose: "pickup", frames: [0, 1, 2], ms: 0, facing: side },
      { pose: "throw", frames: [0, 1, 2, 3, 4], ms: 0, facing: dir },
    ]);
    return true;
  }

  function tickBall(now) {
    // In his hand: pinned to the frame's cell, mirrored when he faces left;
    // the release frame launches it (under reduced motion the shot shows its
    // last frame, so the throw launches as soon as it is his pose).
    const held = HELD[justin.pose]?.[justin.frame];
    if (held && !ball.flight && !ball.roll) {
      const [w, a] = poseBox("justin", justin.pose);
      const left = justin.cx - (justin.facing < 0 ? w - a : a);
      ball.x = justin.facing < 0 ? left + w - held[0] - BALL.size / 2 : left + held[0] + BALL.size / 2;
      ball.y = BALL_ROW - held[1];
      ball.held = true;
      if (justin.pose === "throw" && justin.frame === 2) launch();
      return;
    }
    if (ball.held) {
      if (justin.pose === "throw" && reduced()) launch();
      else {
        ball.held = false; // called away mid-pickup: the ball drops where it is
        ball.y = 0;
      }
    }
    const f = ball.flight;
    if (f) {
      const p = Math.min(1, (now - f.t0) / f.dur);
      moveBall(f.from + (f.to - f.from) * p);
      ball.y = 4 * f.h * p * (1 - p) + f.y0 * (1 - p) * (1 - p);
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
  // His part waits for a beat in progress to end (the pull, the pick-up and
  // throw, the pet, the espresso), so nothing is cut short and nothing he
  // holds vanishes; with the boxes in his arms or seated at the desk it is
  // skipped, since arms-up has neither the boxes nor the desk in it and both
  // would vanish for the cheer. Truffle sits up for it either way.
  function cheer() {
    const handsFull = () => boxes.where === "justin" || justin.pose === "type";
    if (!isFree()) whenFree(() => !handsFull() && strike("arms-up", 1800));
    else if (!handsFull()) strike("arms-up", 1800);
    const sitUp = () => {
      if (!(truffle.pose === "sleep" || truffle.pose === "ear") || truffle.plan) return;
      if (holdFor(truffle, sitUp)) return; // an ear that only just came up shows first
      truffle.earAt = 0;
      truffle.pose = "sit";
      truffle.sitUntil = performance.now() + 1800;
    };
    sitUp();
  }

  // Timers on the stage's own clock (`performance.now()`, the one the tick
  // reads), so the design's waits between beats freeze and step with it.
  const timers = [];
  function after(ms, fn) {
    const t = { at: performance.now() + ms, fn };
    timers.push(t);
    return () => {
      const i = timers.indexOf(t);
      if (i >= 0) timers.splice(i, 1);
    };
  }
  function tickTimers(now) {
    for (const t of timers.splice(0).sort((a, b) => a.at - b.at)) {
      if (t.at <= now) t.fn();
      else timers.push(t);
    }
  }

  // The rule: nobody holds a pose for less than MIN_HOLD, except a one-shot's
  // own frames (those are one pose). `holds` remembers when each of them took
  // the pose they are in; `holdFor` defers an action that would cut a pose
  // short; in development a broken hold is logged, so the next person sees it.
  const MIN_HOLD = 600;
  const holds = new Map([[justin, { pose: justin.pose, since: 0, x: justin.cx }], [truffle, { pose: truffle.pose, since: 0, x: truffle.cx }]]);
  function holdFor(who, fn, ms = MIN_HOLD) {
    if (reduced()) return false;
    const h = holds.get(who);
    const since = who.pose === h.pose ? h.since : performance.now(); // a pose taken this very tick
    const left = ms - (performance.now() - since);
    if (left <= 0) return false;
    who.pending.push(after(left, fn)); // dropped when he or she is placed elsewhere
    return true;
  }
  const dropPending = (who) => {
    for (const cancel of who.pending.splice(0)) cancel();
  };
  function tickHolds(now) {
    for (const [who, h] of holds) {
      if (who.pose === h.pose) continue;
      // a gait that covered two strides or more is a move, however brief (his
      // own count of the walk, not the distance since the first stride's
      // tick: a long first frame under load ate 9px of a 20px walk)
      const moved = /walk|trot/.test(h.pose) && (who === justin ? justin.walked : Math.abs(who.cx - h.x)) >= 14;
      if (h.since && now - h.since < MIN_HOLD && !moved && !reduced() && import.meta.env?.DEV) console.warn(`stage: ${who === justin ? "justin" : "truffle"} held ${h.pose} for ${Math.round(now - h.since)} ms (under ${MIN_HOLD}), then ${who.pose}`);
      h.pose = who.pose;
      h.since = now;
      h.x = who.cx;
    }
  }

  let lastTick = 0; // the clock at the last tick: a pose set and replaced between two ticks was never drawn
  function tick(now, dt) {
    tickTimers(now);
    tickJustin(now, dt);
    tickTruffle(now, dt);
    tickBall(now);
    tickBot(now, dt);
    tickHolds(now);
    lastTick = now;
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
    bot: { x: Math.round(bot.x), y: Math.round(bot.y), pose: bot.pose, frame: bot.frame, flip: bot.facing < 0, hidden: bot.hidden, busy: bot.steps.length > 0 || bot.queue.length > 0 },
    boxes: { where: boxes.where, x: boxes.x },
    chair: { frame: chair.frame },
  });

  const busy = () => justin.walking || truffle.trotting || busyFetching() || !!truffle.earAt || !!truffle.trotAt || !!truffle.shot || bot.steps.length > 0;

  // A layout: Justin at `cx` in `rest`, Truffle asleep at her home, the ball
  // at its rest, nobody walking, no beats pending.
  function place(cx, { rest = justin.rest, home = truffle.home, ballAt = ball.x, facing = 1 } = {}) {
    justin.rest = pick(rest);
    justin.facing = facing;
    justin.cx = justin.target = fitsJustin(cx, justin.rest, facing);
    justin.walking = false;
    justin.onArrive = [];
    justin.whenFree = [];
    dropPending(justin);
    dropPending(truffle);
    justin.override = null;
    justin.script = [];
    justin.scriptDone = null;
    justin.pose = justin.rest;
    justin.arrivedAt = -Infinity; // placed, not arrived: no moment standing before his rest (a phone tap showed pat, idle, pat)
    ball.flight = ball.roll = null;
    ball.held = false;
    ball.y = 0;
    for (const [who, h] of holds) Object.assign(h, { pose: who.pose, since: performance.now(), x: who.cx }); // a layout, not a cut: the holds count from here
    ball.x = fitsBall(ballAt);
    truffle.home = fitsTruffle(home);
    truffle.cx = truffle.target = truffle.home;
    truffle.facing = sign(justin.cx - truffle.cx) || -1;
    truffle.trotting = false;
    truffle.plan = null;
    truffle.shot = null;
    truffle.earAt = truffle.trotAt = truffle.sitUntil = 0;
    truffle.petWait = false;
    truffle.pose = "sleep";
  }

  return {
    pathway,
    yard,
    justin,
    truffle,
    ball,
    walkTo,
    place,
    placeBot,
    setDownBoxes,
    takeBoxes,
    boxes,
    tuckChair,
    pullChair,
    pullSpot,
    chair,
    flyToSpot,
    cancelPaneChores,
    bot,
    botBusy,
    botChoreFor: (pane) => bot.pane === pane || bot.queue.some((c) => c.pane === pane), // on, or queued for, that pane's errand
    wantBotUp,
    botTaken,
    followAnchor,
    clearOf,
    setBotAway: (away) => {
      bot.away = away;
    },
    botGone: () => {
      bot.hidden = true; // handed back mid-beam: his next trip starts with the beam-in
    },
    play,
    after,
    setHome: (x) => {
      truffle.home = fitsTruffle(x);
    },
    goHome,
    callTruffle,
    throwBall,
    pet,
    tipHat: () => strike("hat", 0, undefined, { frames: HAT_TIP }),
    // On his feet for a while (a direct load of step 2: Truffle is about to
    // ask, and he would have stood for her had he walked in). The pet's own
    // idle takes over.
    stand: () => {
      strike("idle", 60000);
      holds.get(justin).pose = "idle"; // his first pose, not a change
    },
    wave: () => boxes.where !== "justin" && strike("wave", 0, undefined, { frames: WAVE_GREETING, flag: "wave" }), // no boxes in the wave: with them in his arms he holds them
    cheer,
    sit: () => toggle("sit", 9000),
    sip: () => toggle("sip", 7000),
    setRest,
    tick,
    snapshot,
    busy,
  };
}
