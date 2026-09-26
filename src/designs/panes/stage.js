// The stage is the status bar's top edge: a one-dimensional floor that Justin,
// Truffle and the tennis ball live on. Positions are the centre of each
// actor's feet, in CSS px from the left of the window, so a pose that is
// wider or narrower (Justin sitting is 52px, asleep 64px) stays in place when
// it changes. Walking frames advance by distance, one frame per stride of the
// sheet, so feet never slide; facing follows the direction of travel.

import ballSheet from "./ball.js";

const JUSTIN = { stride: 7, frames: 4, speed: 72, rise: 350, settle: 700 };
const TRUFFLE = { stride: 6, frames: 4, speed: 110, sitFor: 3000 };
const BALL = { size: 10, frames: ballSheet.actions.roll.frames.length };

export const widths = {
  justin: { idle: 36, walk: 36, hat: 36, "arms-up": 36, sip: 36, sit: 52, sleep: 64 },
  truffle: { sleep: 36, ear: 36, sit: 24, trot: 34 },
};

const sign = (n) => (n < 0 ? -1 : 1);
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export function createStage({ reduced }) {
  const lane = { left: 6, right: 600 };
  const justin = {
    cx: 60,
    target: 60,
    facing: 1,
    walked: 0,
    walking: false,
    risingUntil: 0,
    arrivedAt: 0,
    onArrive: null,
    pose: "idle",
    frame: undefined,
    rest: "idle",
    override: null, // { pose, ms, until }
  };
  const truffle = {
    cx: 300,
    target: 300,
    facing: -1,
    walked: 0,
    trotting: false,
    earAt: 0,
    trotAt: 0,
    sitUntil: 0,
    lookAt: null, // () => x she faces while sitting, then sleeping
    follow: null, // () => x to trot to (re-read each tick, so a moving target holds)
    pose: "sleep",
    frame: undefined,
  };
  const ball = { x: 340, from: 340, to: 340, t0: 0, duration: 0, rolling: false, frame: 0 };

  const half = (who, pose) => widths[who][pose] / 2;
  const clampJustin = (x) => clamp(x, lane.left + 18, lane.right - 18);
  const clampTruffle = (x) => clamp(x, lane.left + 18, lane.right - 18);

  // Justin walks to `cx`; `onArrive` runs when his feet get there. Sitting,
  // sipping or asleep, he stands up first. A hop of a few pixels is not worth
  // a walk, so he just shifts.
  function walkTo(cx, onArrive) {
    cx = clampJustin(Math.round(cx));
    justin.override = null;
    if (Math.abs(cx - justin.cx) < 4) {
      justin.cx = cx;
      justin.target = cx;
      onArrive?.();
      return 0;
    }
    const distance = Math.abs(cx - justin.cx);
    justin.target = cx;
    justin.onArrive = onArrive ?? null;
    if (!justin.walking) {
      justin.walked = 0;
      const standing = justin.pose === "idle" || justin.pose === "hat" || justin.pose === "arms-up";
      justin.risingUntil = standing || reduced() ? 0 : performance.now() + JUSTIN.rise;
    }
    justin.walking = true;
    return distance;
  }

  function place(who, cx) {
    const actor = who === "justin" ? justin : truffle;
    actor.cx = actor.target = Math.round(cx);
    actor.walking = false;
    actor.trotting = false;
  }

  // Truffle wakes (one ear first), then trots to wherever `follow()` says and
  // sits facing `lookAt()`, then dozes off there.
  function send(follow, lookAt, { earIn = 500, trotIn = 1300 } = {}) {
    const now = performance.now();
    truffle.follow = follow;
    truffle.lookAt = lookAt;
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

  // Beside Justin: on whichever side she is coming from, unless the lane
  // ends there.
  const besideJustin = () => {
    const side = sign(truffle.cx - justin.target);
    const x = justin.target + side * 44;
    return x > lane.left + 18 && x < lane.right - 18 ? x : justin.target - side * 44;
  };

  function followJustin(distance) {
    if (distance < 60) return;
    send(besideJustin, () => justin.cx);
  }

  function callTruffle() {
    send(besideJustin, () => justin.cx, { earIn: 200, trotIn: 700 });
  }

  // The ball rolls away from Justin once he reaches it; Truffle goes after it
  // and lies down next to it. He kicks toward the longer side of the lane, so
  // there is always somewhere for it to go.
  function throwBall() {
    const dir = ball.x - lane.left > lane.right - ball.x ? -1 : 1;
    const standAt = ball.x - dir * 28;
    walkTo(standAt, () => {
      justin.facing = dir;
      const to = dir > 0 ? lane.right - 14 : lane.left + 14;
      roll(to);
      send(
        () => clamp(ball.to - dir * 26, lane.left + 18, lane.right - 18),
        () => ball.x,
        { earIn: 150, trotIn: 450 },
      );
    });
  }

  function roll(to) {
    const now = performance.now();
    ball.from = ball.x;
    ball.to = Math.round(to);
    ball.t0 = now;
    ball.duration = reduced() ? 0 : 900 + Math.abs(ball.to - ball.from) * 2.2;
    ball.rolling = true;
  }

  function strike(pose, ms) {
    justin.override = { pose, ms, until: 0 };
  }

  // A hand on Truffle: she sits up for a few seconds, then goes back to sleep.
  function pet(ms = 3000) {
    if (truffle.trotting) return;
    truffle.earAt = 0;
    truffle.pose = "sit";
    truffle.sitUntil = performance.now() + ms;
  }

  // 1070: both arms up; Truffle sits up for it, then goes back to sleep.
  function cheer() {
    strike("arms-up", 1800);
    if (truffle.pose === "sleep" || truffle.pose === "ear") pet(1800);
  }

  function toggle(pose, ms) {
    if (justin.override?.pose === pose) justin.override = null;
    else strike(pose, ms);
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
        justin.arrivedAt = now;
        justin.pose = "idle";
        justin.frame = undefined;
        const done = justin.onArrive;
        justin.onArrive = null;
        done?.();
      } else {
        justin.pose = "walk";
        justin.frame = Math.floor(justin.walked / JUSTIN.stride) % JUSTIN.frames;
      }
      return;
    }
    justin.frame = undefined;
    const o = justin.override;
    if (o) {
      if (!o.until) o.until = now + o.ms;
      if (now < o.until) {
        justin.pose = o.pose;
        return;
      }
      justin.override = null;
      justin.arrivedAt = now;
    }
    justin.pose = now - justin.arrivedAt < JUSTIN.settle && !reduced() ? "idle" : justin.rest;
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
    if (truffle.trotting) {
      truffle.target = clampTruffle(Math.round(truffle.follow()));
      const remaining = truffle.target - truffle.cx;
      if (Math.abs(remaining) < 0.01) {
        truffle.cx = truffle.target;
        // Justin may still be on his way: wait here, sitting, and keep the
        // target live until he settles.
        truffle.pose = "sit";
        truffle.frame = undefined;
        truffle.facing = sign(truffle.lookAt() - truffle.cx);
        if (!justin.walking && !ball.rolling) {
          truffle.trotting = false;
          truffle.sitUntil = now + TRUFFLE.sitFor;
        }
        return;
      }
      truffle.facing = sign(remaining);
      const step = reduced() ? Math.abs(remaining) : Math.min(TRUFFLE.speed * dt, Math.abs(remaining));
      truffle.cx += truffle.facing * step;
      truffle.walked += step;
      truffle.pose = "trot";
      truffle.frame = Math.floor(truffle.walked / TRUFFLE.stride) % TRUFFLE.frames;
      return;
    }
    truffle.frame = undefined;
    if (truffle.pose === "sit" && truffle.sitUntil && now >= truffle.sitUntil) {
      truffle.sitUntil = 0;
      truffle.pose = "sleep";
    }
  }

  // Spin is read off the ball's position: one turn per circumference of
  // travel, rounded to whole turns so it stops on the resting frame.
  function tickBall(now) {
    if (!ball.rolling) return;
    const p = ball.duration ? Math.min(1, (now - ball.t0) / ball.duration) : 1;
    const eased = 1 - (1 - p) ** 3;
    const travel = ball.to - ball.from;
    ball.x = ball.from + travel * eased;
    const turns = Math.max(1, Math.round(Math.abs(travel) / (Math.PI * BALL.size)));
    const f = Math.round((Math.abs(ball.x - ball.from) / Math.abs(travel || 1)) * turns * BALL.frames);
    ball.frame = ((travel < 0 ? -f : f) % BALL.frames + BALL.frames) % BALL.frames;
    if (p >= 1) {
      ball.x = ball.to;
      ball.frame = 0;
      ball.rolling = false;
    }
  }

  function tick(now, dt) {
    tickJustin(now, dt);
    tickTruffle(now, dt);
    tickBall(now);
  }

  const snapshot = () => ({
    justin: {
      pose: justin.pose,
      frame: justin.frame,
      flip: justin.facing < 0,
      left: Math.round(justin.cx - half("justin", justin.pose)),
      moving: justin.walking,
    },
    truffle: {
      pose: truffle.pose,
      frame: truffle.frame,
      flip: truffle.facing < 0,
      left: Math.round(truffle.cx - half("truffle", truffle.pose)),
      moving: truffle.trotting,
    },
    ball: { left: Math.round(ball.x - BALL.size / 2), frame: ball.frame, rolling: ball.rolling },
  });

  const busy = () => justin.walking || truffle.trotting || ball.rolling || !!truffle.earAt || !!truffle.trotAt;

  return {
    lane,
    justin,
    truffle,
    ball,
    walkTo,
    place,
    placeBall: (x) => {
      ball.x = ball.to = ball.from = Math.round(x);
    },
    followJustin,
    callTruffle,
    throwBall,
    tipHat: () => strike("hat", 1400),
    cheer,
    pet,
    sit: () => toggle("sit", 9000),
    sip: () => toggle("sip", 7000),
    setRest: (pose) => {
      justin.rest = pose;
    },
    tick,
    snapshot,
    busy,
  };
}
