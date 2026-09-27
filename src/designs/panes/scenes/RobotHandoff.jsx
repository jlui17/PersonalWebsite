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
// drawn where he last stood, over whatever the next pane puts there.
//
// `target` is where he should be ("pathway" | "pane"); `rects` measures each
// place's box on screen; `delay` staggers the start so two robots never beam
// as one block. Under reduced motion he is simply at the target.
const GONE = 150;
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
// from where it left off; a target that changes while a beam is being drawn
// lets it finish, then he beams straight on. A beam, once begun, is whole.
export function useRobotHandoff({ name, target, rects, delay = 0, outAction, canLeave, onOut, skipIn, onSkipIn, canLand }) {
  const [shown, setShown] = useState(target); // "pathway" | "pane" | "overlay" | "none"
  const [overlay, setOverlay] = useState(null); // { rect, action, frame }
  const shownRef = useRef(target);
  const targetRef = useRef(target);
  const hooks = useRef({});
  const run = useRef(0);
  const lastPaneRect = useRef(null); // where he last stood in the pane, for the beam-out after the pane has unmounted
  targetRef.current = target;
  hooks.current = { outAction, canLeave, onOut, skipIn, onSkipIn, canLand };

  useEffect(() => {
    if (shown !== "pane") return undefined;
    let id = requestAnimationFrame(function measure() {
      lastPaneRect.current = rects.pane() ?? lastPaneRect.current;
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
    (async () => {
      await wait(delay);
      if (!alive()) return;
      let from = shownRef.current;
      for (;;) {
        // out, where he stands (skipped when he is already mid-beam or gone)
        if (from === "pathway" || from === "pane") {
          const rect = rects[from]() ?? (from === "pane" ? lastPaneRect.current : null);
          if (rect) {
            if (!(await until(hooks.current.canLeave && (() => hooks.current.canLeave(from))))) return;
            const action = hooks.current.outAction?.(from) ?? "beam-out";
            for (let f = 0; f < sheet[action].frames.length; f += 1) {
              show("overlay", { rect, action, frame: f });
              await wait(sheet[action].durations[f]);
            }
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
        if (rect) {
          for (let f = 0; f < sheet["beam-in"].frames.length; f += 1) {
            show("overlay", { rect, action: "beam-in", frame: f });
            await wait(sheet["beam-in"].durations[f]);
          }
        }
        show(to);
        if (targetRef.current === to) return;
        from = to; // the target moved on while he beamed in: straight back out
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
