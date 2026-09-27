import { useEffect, useRef, useState } from "react";
import { Sprite, characters } from "../../../sprites/Sprite.jsx";
import { HAT_TIP } from "../stage.js";
import { reducedMotion, script, useInView } from "./script.js";
import "./scenes.css";

// Pane 1: he stands beside "Hi, I'm Justin." on the rule under the title and
// tips his hat now and then: about a second after the pane opens, then every
// 12 to 18 s, while he is in view. Not while the visitor is selecting text (a
// moving figure beside a selection is a nuisance), not while his pathway
// sprite has an arm up in a wave on the same screen (two raised arms read as
// the same pose twice; `pathwayWaving`): he waits and tips once that is over.
// Never under reduced motion, where he only stands. The tip is the sheet's one-shot, stepped here
// from its durations (`hat`: idle, f0, f1, f2, f3 held, f2, f1, f0, idle).
// Not `wave` or `carry`: his pathway sprite does those on the same screen, and
// no pose shows twice on a page.
//
// He wears the hoodie here and the overshirt on the pathway (Justin's pick), so
// the two of him on one screen are told apart.
//
// `hat` sits at `idle`'s body offset in a wider canvas, so his box is the
// wider canvas and he stands at its left.

const { idle, hat } = characters.justin.actions;
const WIDTH = Math.max(idle.frames[0][0].length, hat.frames[0][0].length);
const HEIGHT = Math.max(idle.frames[0].length, hat.frames[0].length);
const FIRST_TIP = 1200;

export function HelloScene({ pathwayWaving }) {
  const box = useRef(null);
  const inView = useInView(box);
  const tipped = useRef(false);
  const waving = useRef(pathwayWaving);
  waving.current = pathwayWaving;
  const [tip, setTip] = useState(null); // the `hat` frame showing, or null while he stands

  useEffect(() => {
    if (!inView || reducedMotion()) return undefined;
    const cancel = script(async (wait) => {
      for (;;) {
        await wait(tipped.current ? 12000 + Math.random() * 6000 : FIRST_TIP);
        tipped.current = true;
        while (waving.current || !window.getSelection().isCollapsed) await wait(1500);
        for (const frame of HAT_TIP) {
          setTip(frame);
          await wait(hat.durations[frame]);
        }
        setTip(null);
      }
    });
    return () => {
      cancel();
      setTip(null);
    };
  }, [inView]);

  return (
    <span className="pn-hello" aria-hidden="true" ref={box} data-pose={tip === null ? "idle" : "hat"} data-frame={tip ?? ""} style={{ "--hello-w": `${WIDTH}px`, "--hello-h": `${HEIGHT}px` }}>
      {tip === null ? (
        <Sprite character="justin" action="idle" outfit="hoodie" scale={1} />
      ) : (
        <Sprite character="justin" action="hat" outfit="hoodie" frame={tip} scale={1} />
      )}
    </span>
  );
}
