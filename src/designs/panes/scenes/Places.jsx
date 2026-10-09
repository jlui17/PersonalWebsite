import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Sprite, characters } from "../../../sprites/Sprite.jsx";
import { reducedMotion, script, useInView } from "./script.js";
import "./scenes.css";

// Pane 3's future part: a small, nearly still scene for New York and for Japan. Each has the
// motion budget of at most one ambient loop (the skyline's windows and spire
// light), one rare one-shot (steam from the tower's vent, a falling petal) and
// one thing that happens once as the pane opens (the billboard's lamps come
// on, a petal comes to rest on the gate); loops and one-shots only while in
// view, none of it under reduced motion. The farm keeps the pane's one busy
// loop.

// A plan's heading with its place drawn inside the sentence: "Live in [the
// skyline with a billboard that says New York] with my girlfriend." Justin:
// "place the buildings in the middle of the sentence". The heading's words are
// not retyped: the sentence is split around the place's name (the plan's
// `tag`), and the name is the sign's text: real text, in reading order, laid
// over the panel the scene's sign has for it (`signBox` on the scene), so a
// screen reader and a copy get the whole sentence once. The scenes hide their
// svgs from the accessibility tree. The picture breaks onto a line with the
// word before it, so it never starts a line alone ("Start a / family [farm] /
// with all kinds of animals." on a phone).
//
// The title row: the heading with its picture, and under it the rule that is
// the scene's ground. Every row is as tall as the tallest picture, so the
// words of each heading sit the same distance under the row's top. A scene
// that luibot visits says where he pours over it (`hover`: from x, w across,
// reaching `room` above the scene). On the heading's first line he has the
// step over the plan for it; where the picture wraps under words that would
// be under him, it keeps that much clear above itself.
export function PlanTitle({ heading, place, scene }) {
  const row = useRef(null);
  const hover = scene.type.hover;
  useLayoutEffect(() => {
    if (!hover) return undefined;
    const el = row.current;
    const picture = el.querySelector(".pn-picture");
    const settle = () => {
      picture.removeAttribute("data-room-above");
      const p = picture.getBoundingClientRect();
      const [left, right, top] = [p.left + hover.x, p.left + hover.x + hover.w, p.top - hover.room];
      const words = [...el.querySelectorAll(".pn-inline__words")].flatMap((span) => [...span.getClientRects()]);
      if (words.some((w) => w.right > left && w.left < right && w.bottom > top && w.top < p.top)) picture.setAttribute("data-room-above", "");
    };
    settle();
    const observer = new ResizeObserver(settle);
    observer.observe(el);
    document.fonts.ready.then(settle);
    return () => observer.disconnect();
  }, [hover]);
  return (
    <div className="pn__chapter-title" ref={row} style={{ "--row-h": `${TALLEST + 1}px`, "--hover-room": `${hover?.room ?? 0}px` }}>
      <PlanHeading heading={heading} place={place} scene={scene} />
    </div>
  );
}

function PlanHeading({ heading, place, scene }) {
  const box = scene.type.signBox;
  const at = heading.indexOf(place);
  const before = heading.lastIndexOf(" ", at - 2) + 1; // the word before the place
  return (
    <h3 className="pn-inline">
      <span className="pn-inline__words">{heading.slice(0, before)}</span>
      <span className="pn-inline__keep">
        <span className="pn-inline__words">{heading.slice(before, at)}</span>
        <span className="pn-picture">
          <span
            className="pn-plan-sign"
            style={{ left: box.x, top: -(box.up + box.h), "--sign-w": `${box.w}px`, "--sign-h": `${box.h}px`, "--sign-up": `${box.up}px` }}
          >
            <span className="pn-plan-sign__text">{place}</span>
          </span>
          {scene}
        </span>
      </span>
      <span className="pn-inline__words">{heading.slice(at + place.length)}</span>
    </h3>
  );
}

const { skyline, billboard, steam, cherryTree, torii, petal } = characters;
const size = (sheet, action = "idle") => ({ w: sheet.actions[action].frames[0][0].length, h: sheet.actions[action].frames[0].length });
const TALLEST = Math.max(size(skyline).h, size(cherryTree).h, size(torii).h);
const between = (min, max) => min + Math.random() * (max - min);
// A prop laid over a scene, `x` from the scene's left edge with its bottom row
// `up` above the ground. Like the sign's text it is a zero-size inline box on
// the ground, moved into place: an absolutely placed box inside the sentence
// would put a line break into `innerText`.
const over = (x, up, sheet, action = "idle") => ({ left: x, top: -(up + size(sheet, action).h) });

// A rare one-shot, stepped from the sheet's durations, once every `min` to
// `max` ms while `active`; with `opening`, once more that many ms after the
// scene first comes into view. `rests`: its last frame lies where it is until
// the next run (the petal on the ground); otherwise the prop goes after its
// last frame. Returns the frame to show (or null) and how many runs have
// started.
function useOneShot(active, { frames, durations }, min, max, rests, opening) {
  const [shot, setShot] = useState({ frame: null, run: 0 });
  const opened = useRef(opening === undefined);
  useEffect(() => {
    if (!active || reducedMotion()) return undefined;
    return script(async (wait) => {
      for (;;) {
        await wait(opened.current ? between(min, max) : opening);
        opened.current = true;
        for (let frame = 0; frame < frames.length; frame += 1) {
          setShot(({ run }) => ({ frame, run: frame === 0 ? run + 1 : run }));
          if (!rests || frame < frames.length - 1) await wait(durations[frame]);
        }
        if (!rests) setShot(({ run }) => ({ frame: null, run }));
      }
    });
  }, [active, frames, durations, min, max, rests, opening]);
  return shot;
}

// Where things stand, from the sheets' comments in src/sprites/props.js and
// the rows in .luidocs/sprite-contracts.md; sizes come from the sheets. `up`
// is a distance above the ground, `x` from the scene's left edge. A sign's
// `face` is the panel for the text in the sign's own canvas; `panel` turns it
// into the scene's `signBox`.
const panel = (at, sheet, face) => ({ x: at.x + face.x, up: at.up + size(sheet).h - face.y - face.h, w: face.w, h: face.h });
const BILLBOARD = { x: 26, up: size(skyline).h - 1 - 23 }; // its bottom row on the skyline's row 23: the legs stand on the roofs
const BILLBOARD_FACE = { x: 1, y: 1, w: 59, h: 13 };
const STEAM = { x: 15, up: size(skyline).h - 1 - 17 }; // over the vent stub on the tower's setback
// The pane's two opening moments, one after the other, both after its fade.
const LAMPS_ON = 1500;
const FIRST_PETAL = 2400;

export function NewYorkScene() {
  const box = useRef(null);
  const inView = useInView(box);
  const puff = useOneShot(inView, steam.actions.rise, 10000, 20000, false);
  // The board's lamps come on once, after the pane has faded in and the eye
  // has arrived (the sheet's 600 ms for the unlit frame is too soon to be
  // seen); they are on from the start under reduced motion.
  const [lit, setLit] = useState(reducedMotion);
  useEffect(() => {
    const id = setTimeout(() => setLit(true), LAMPS_ON);
    return () => clearTimeout(id);
  }, []);
  return (
    <span className="pn-place" aria-hidden="true" ref={box}>
      <span className="pn-place__prop" data-prop="billboard" data-lit={lit || undefined} style={over(BILLBOARD.x, BILLBOARD.up, billboard)}>
        <Sprite character="billboard" action="idle" frame={lit ? 1 : 0} scale={1} />
      </span>
      {puff.frame !== null && (
        <span className="pn-place__prop" data-prop="steam" data-frame={puff.frame} style={over(STEAM.x, STEAM.up, steam, "rise")}>
          <Sprite character="steam" action="rise" frame={puff.frame} scale={1} />
        </span>
      )}
      <Sprite character="skyline" action="idle" frame={inView ? undefined : 0} scale={1} />
    </span>
  );
}
NewYorkScene.signBox = panel(BILLBOARD, billboard, BILLBOARD_FACE);

// One ground line: the tree, then the gate with the board hung in it.
const TORII_GAP = 6;
const TORII = { x: size(cherryTree).w + TORII_GAP, up: 0 };
const TORII_FACE = { x: 3, y: 16, w: 39, h: 13 };
// The petal's canvas stands on the ground under either edge of the canopy
// (the tree sheet's comment: x 4-12 or 28-36); it takes the sides in turn.
const PETAL_X = [5, 30];
const LANDED = petal.actions.fall.frames.length - 1;

// A petal falls as the pane opens, and from then on one lies on the gate's
// top beam (`rested`); later petals fall every 8 to 12 s. Under reduced motion
// nothing falls and the petal is on the beam from the start.
export function JapanScene() {
  const box = useRef(null);
  const inView = useInView(box);
  const fallen = useOneShot(inView, petal.actions.fall, 8000, 12000, true, FIRST_PETAL);
  const rested = reducedMotion() || fallen.run > 1 || (fallen.run === 1 && fallen.frame === LANDED);
  return (
    <span className="pn-place" aria-hidden="true" ref={box}>
      {fallen.frame !== null && (
        <span className="pn-place__prop" data-prop="petal" data-frame={fallen.frame} style={over(PETAL_X[fallen.run % PETAL_X.length], 0, petal, "fall")}>
          <Sprite character="petal" action="fall" frame={fallen.frame} scale={1} />
        </span>
      )}
      <Sprite character="cherryTree" action="idle" scale={1} />
      <span data-prop="torii" data-action={rested ? "rested" : "idle"} style={{ marginLeft: TORII_GAP }}>
        <Sprite character="torii" action={rested ? "rested" : "idle"} scale={1} />
      </span>
    </span>
  );
}
JapanScene.signBox = panel(TORII, torii, TORII_FACE);
