import { useEffect, useRef, useState } from "react";
import { Sprite, characters } from "../../../sprites/Sprite.jsx";
import { painted, reducedMotion } from "./script.js";
import "./scenes.css";

// A robot moves between the pathway and a pane the way Justin asked: "going up
// into the pane and going down back down to the steps" with the beam (said
// with the pathway at the bottom; on top, it is down into the pane and back
// up). He beams out where he stands, is nowhere for GONE ms, and beams in at
// the other place; `beam-in`'s last frame is his rest pose there. Only one of
// him is ever visible: the place he is at shows him, the other shows an empty
// box of his size (so it can be measured), and while he is between the two an
// overlay draws the beam at the exact pixels of the place he leaves or
// arrives at. Leaving a pane, that place is gone by the time the beam-out
// plays (the pane unmounts in the render that sends him down), so the beam is
// drawn where he last stood in view, over whatever the next pane puts there.
// Wherever the visitor could see him, whole or in part, he beams out; a robot
// the visitor could not see at all (scrolled out of the pane body's box, mid a
// beam of his own, not drawn on a phone's pathway) gets no beam-out, and at a
// place the visitor cannot see he arrives with no beam-in: nobody saw either.
// A pane's beam is clipped to the pane body's box, as he was.
//
// `target` is where he should be: "pathway" or a pane place (a key of
// `rects`, such as "pane" or "projects"); `rects` measures each place's box on
// screen (a pane place answers `undefined` when its element is gone, `null`
// when the visitor cannot see him there at all, else his box, with `clip`, the
// box he is seen through, when only part of him may be in view); `delay`
// staggers the start so two robots never beam as one block. Under reduced
// motion he is simply at the target.
const GONE = 150;
const SLICE = 16; // ms between looks at the target while a beam-in plays
const isPane = (place) => place !== "pathway" && place !== "overlay" && place !== "none";
// The longest the beam-in waits for `canLand`: Justin walks clear of the
// robots' spots in well under a second as he leaves step 2.
const LANDING_WAIT = 2500;

// The callbacks are read when their phase comes, not when the trip starts:
// - `outAction(from)`: the beam-out's action for the place he leaves (the
//   pathway's robot may be in the air, mid-errand), else "beam-out".
// - `canLeave(from)` / `canLand(to)`: the box he beams out of / into is clear
//   (of Justin, on the pathway), or he is done with a move of his own in a
//   pane place; the beam waits (polling) until it is, for LANDING_WAIT at
//   most. A beam drawn over him, or two moves at once, is what this waits out.
// - `onOut(from)`: the beam-out is over and he is nowhere.
// - `skipIn()`: the pathway will take him on straight away (an errand waits),
//   so he stays gone instead of beaming in there only to beam out again;
//   `onSkipIn` tells the pathway so.
// A target that changes while he is nowhere (waiting to leave, gone, waiting
// to land) cancels that trip before anything shows and starts the new one
// from where it left off. A beam-out, once begun, is whole. A beam-in that
// the target changes under is dropped within a display frame only where its
// pane has closed (a robot never forms whole over a pane that has moved on);
// in a pane still open, and on the pathway, it finishes, then he beams
// straight out again: one move at a time. Every beam runs
// against one deadline from the sheet's durations, and every frame of it is
// painted (`painted` in script.js), so it is whole whatever the timers do.
export function useRobotHandoff({ name, target, rects, delay = 0, outAction, canLeave, onOut, skipIn, onSkipIn, canLand }) {
  const [shown, setShown] = useState(target); // "pathway" | a pane place | "overlay" | "none"
  const [overlay, setOverlay] = useState(null); // { rect, action, frame }
  const shownRef = useRef(target);
  const targetRef = useRef(target);
  const hooks = useRef({});
  const run = useRef(0);
  // Where he last stood in view, whole or in part, in each pane place: the
  // beam-out after the pane has unmounted plays there (null: he was not to be
  // seen when the pane went, so no beam-out).
  const lastPaneRect = useRef({});
  targetRef.current = target;
  hooks.current = { outAction, canLeave, onOut, skipIn, onSkipIn, canLand };

  useEffect(() => {
    if (!isPane(shown)) return undefined;
    let id = requestAnimationFrame(function measure() {
      const rect = rects[shown]();
      if (rect !== undefined) lastPaneRect.current[shown] = rect; // undefined: the pane is gone, keep the last frame's answer
      id = requestAnimationFrame(measure);
    });
    return () => cancelAnimationFrame(id);
  }, [shown, rects]);

  useEffect(() => {
    if (shownRef.current === target) return undefined;
    if (reducedMotion()) {
      shownRef.current = target;
      setShown(target);
      setOverlay(null);
      return undefined;
    }
    if (shownRef.current === "overlay") return undefined; // a beam is being drawn: that trip reads the new target when it ends
    const sheet = characters[name].actions;
    const mine = ++run.current;
    // no cleanup cancels a wait: a superseded trip finds out at its next
    // `alive()` check, and a trip mid-beam (this effect leaves it alone, above)
    // must keep its timer to finish the beam
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const alive = () => run.current === mine;
    const show = (place, ov = null) => {
      shownRef.current = place;
      setShown(place);
      setOverlay(ov);
    };
    // polls `ok` every 50 ms, for LANDING_WAIT at most; false if the trip died meanwhile
    const until = async (ok) => {
      for (let waited = 0; ok && !ok() && waited < LANDING_WAIT; waited += 50) {
        await wait(50);
        if (!alive()) return false;
      }
      return alive();
    };
    // Plays `action`'s frames at `rect` against one running deadline: a frame
    // ends at the beam's start plus the sheet's durations so far, however late
    // the timers wake, but never before it has been painted (late timers under
    // load set the last frames in one tick, so they never showed and the beam
    // looked cut). With `abort`, the wait is sliced and `abort(f)` is asked on
    // every slice; true ends the beam on frame f. Returns whether it was aborted.
    const playBeam = async (action, rect, abort) => {
      const { durations } = sheet[action];
      let deadline = performance.now();
      for (let f = 0; f < durations.length; f += 1) {
        if (f > 0 && abort?.(f - 1)) return true; // asked before every frame too: a late timer skips the waits below
        show("overlay", { rect, action, frame: f });
        await painted(() => document.querySelector(`.pn-beam[data-robot="${name}"][data-action="${action}"][data-frame="${f}"]`));
        if (abort?.(f)) return true;
        deadline = Math.max(deadline + durations[f], performance.now());
        for (let left = deadline - performance.now(); left > 0; left = deadline - performance.now()) {
          await wait(Math.min(abort ? SLICE : left, left));
          if (abort?.(f)) return true;
        }
      }
      return false;
    };
    (async () => {
      await wait(delay);
      if (!alive()) return;
      let from = shownRef.current;
      for (;;) {
        // out, where he stands (skipped when he is already mid-beam or gone,
        // or was not to be seen at all where he leaves). In a pane place he
        // first finishes a move of his own (`canLeave`), so he is measured
        // where that move has left him.
        if (from === "pathway" || isPane(from)) {
          const seen = () => rects[from]() ?? (isPane(from) ? lastPaneRect.current[from] : null);
          if (isPane(from) || seen()) {
            if (!(await until(hooks.current.canLeave && (() => hooks.current.canLeave(from))))) return;
            const rect = seen();
            if (rect) await playBeam(hooks.current.outAction?.(from) ?? "beam-out", rect);
          }
        }
        show("none");
        hooks.current.onOut?.(from);
        await wait(GONE);
        if (!alive()) return;
        // in, at the newest target
        const to = targetRef.current;
        if (to === "pathway" && hooks.current.skipIn?.()) {
          hooks.current.onSkipIn?.();
          await wait(GONE); // the pathway has noted he is gone before it is asked to show him
          if (!alive()) return;
          show(to);
          return;
        }
        // a place the visitor cannot see takes him at once, with no beam-in
        if (rects[to]() && !(await until(hooks.current.canLand && (() => hooks.current.canLand(to))))) return;
        const rect = rects[to]();
        // the place he is forming at may move on mid-beam: in a pane that has
        // closed he never arrives (dropped within a frame: the place is gone);
        // anywhere else (a pane still open, the pathway) he finishes forming
        // and then beams out again, so a half-formed robot never just vanishes
        const dropped = rect && (await playBeam("beam-in", rect, () => targetRef.current !== to && to !== "pathway" && rects[to]() === undefined));
        if (!dropped) {
          show(to);
          if (targetRef.current === to) return;
          from = to; // the target moved on while he formed: straight back out from here
          continue;
        }
        show("none");
        hooks.current.onOut?.(to);
        from = "none"; // gone again; the loop takes him to the newest target
      }
    })();
    return undefined;
  }, [target, name, rects, delay]);

  return { shown, overlay };
}

// The beam itself, drawn over everything at the place's own pixels, and only
// inside the box he is seen through (a robot half scrolled out of the pane
// beams there, not over the chrome above it).
export function RobotBeam({ name, overlay }) {
  if (!overlay) return null;
  const { rect, action, frame } = overlay;
  const { clip } = rect;
  const inset = clip && `inset(${Math.max(0, clip.top - rect.top)}px 0 ${Math.max(0, rect.top + rect.height - clip.bottom)}px 0)`;
  return (
    <span
      className="pn-beam"
      data-robot={name}
      data-action={action}
      data-frame={frame}
      aria-hidden="true"
      style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height, clipPath: inset || undefined }}
    >
      <Sprite character={name} action={action} frame={frame} scale={1} />
    </span>
  );
}

// An empty box of the robot's resting size, for the place he is not at.
export function RobotBox({ name, action = "idle" }) {
  const rows = characters[name].actions[action].frames[0];
  return <span className="pn-robot-box" style={{ width: rows[0].length, height: rows.length }} />;
}
