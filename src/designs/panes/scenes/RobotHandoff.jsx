import { useEffect, useRef, useState } from "react";
import { Sprite, characters } from "../../../sprites/Sprite.jsx";
import { reducedMotion } from "./script.js";
import "./scenes.css";

// A robot moves between the pathway and a pane the way Justin asked: "going up
// into the pane and going down back down to the steps" with the beam. He
// beams out where he stands, is nowhere for GONE ms, and beams in at the other
// place; `beam-in`'s last frame is his rest pose there. Only one of him is
// ever visible: the place he is at shows him, the other shows an empty box of
// his size (so it can be measured), and while he is between the two an
// overlay draws the beam at the exact pixels of the place he leaves or
// arrives at. Leaving a pane, that place is gone by the time the beam-out
// plays (the pane unmounts in the render that sends him down), so the beam is
// drawn where he last stood whole and in view, over whatever the next pane
// puts there; a robot the visitor could not see whole (scrolled out of the
// pane body's box, mid a beam of his own) gets no beam-out: nobody saw him
// leave, and he just beams in at the other place.
//
// `target` is where he should be: "pathway" or a pane place (a key of
// `rects`, such as "pane" or "pane6"); `rects` measures each place's box on
// screen (a pane place answers `undefined` when its element is gone, `null`
// when he is there but not whole); `delay` staggers the start so two robots
// never beam as one block. Under reduced motion he is simply at the target.
const GONE = 150;
const SLICE = 16; // ms between looks at the target while a beam-in plays
const isPane = (place) => place !== "pathway" && place !== "overlay" && place !== "none";
// The longest the beam-in waits for `canLand`: Justin walks clear of the
// robots' spots in well under a second as he leaves step 3.
const LANDING_WAIT = 2500;

// The callbacks are read when their phase comes, not when the trip starts:
// - `outAction(from)`: the beam-out's action for the place he leaves (the
//   pathway's robot may be in the air, mid-errand), else "beam-out".
// - `canLeave(from)` / `canLand(to)`: the box he beams out of / into is clear
//   (of Justin, on the pathway); the beam waits (polling) until it is, for
//   LANDING_WAIT at most. A beam drawn over him is what this waits out.
// - `onOut(from)`: the beam-out is over and he is nowhere.
// - `skipIn()`: the pathway will take him on straight away (an errand waits),
//   so he stays gone instead of beaming in there only to beam out again;
//   `onSkipIn` tells the pathway so.
// A target that changes while he is nowhere (waiting to leave, gone, waiting
// to land) cancels that trip before anything shows and starts the new one
// from where it left off. A beam-out, once begun, is whole. A beam-in that
// the target changes under is dropped within a display frame while the robot
// is still thin (a robot never forms whole over a pane that has moved on);
// on the pathway one past its half is mostly formed and finishes, then he
// beams straight out again. Every beam runs against one deadline from the
// sheet's durations, so it lasts what the sheet says whatever the timers do.
export function useRobotHandoff({ name, target, rects, delay = 0, outAction, canLeave, onOut, skipIn, onSkipIn, canLand }) {
  const [shown, setShown] = useState(target); // "pathway" | a pane place | "overlay" | "none"
  const [overlay, setOverlay] = useState(null); // { rect, action, frame }
  const shownRef = useRef(target);
  const targetRef = useRef(target);
  const hooks = useRef({});
  const run = useRef(0);
  // Where he last stood, whole and in view, in each pane place: the beam-out
  // after the pane has unmounted plays there (null: he was not to be seen
  // when the pane went, so no beam-out).
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
    if (reducedMotion() || !rects[target]()) {
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
    // the timers wake. With `abort`, the wait is sliced and `abort(f)` is asked
    // on every slice; true ends the beam on frame f. Returns whether it was aborted.
    const playBeam = async (action, rect, abort) => {
      const { durations } = sheet[action];
      let deadline = performance.now();
      for (let f = 0; f < durations.length; f += 1) {
        show("overlay", { rect, action, frame: f });
        deadline += durations[f];
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
        // or was not to be seen whole in the pane he leaves)
        if (from === "pathway" || isPane(from)) {
          const rect = rects[from]() ?? (isPane(from) ? lastPaneRect.current[from] : null);
          if (rect) {
            if (!(await until(hooks.current.canLeave && (() => hooks.current.canLeave(from))))) return;
            await playBeam(hooks.current.outAction?.(from) ?? "beam-out", rect);
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
        if (!(await until(hooks.current.canLand && (() => hooks.current.canLand(to))))) return;
        const rect = rects[to]();
        // the place he is forming at may move on mid-beam: in a pane that has
        // closed he never arrives (dropped at once); on the pathway a robot
        // past half formed finishes and then beams out again
        const half = sheet["beam-in"].durations.length / 2;
        const dropped = rect && (await playBeam("beam-in", rect, (f) => targetRef.current !== to && (to !== "pathway" || f < half)));
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

// The beam itself, drawn over everything at the place's own pixels.
export function RobotBeam({ name, overlay }) {
  if (!overlay) return null;
  const { rect, action, frame } = overlay;
  return (
    <span
      className="pn-beam"
      data-robot={name}
      data-action={action}
      data-frame={frame}
      aria-hidden="true"
      style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
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
