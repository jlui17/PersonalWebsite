import { useEffect, useRef, useState } from "react";
import { Sprite, characters } from "../../../sprites/Sprite.jsx";
import { reducedMotion, script, useChore } from "./script.js";
import "./scenes.css";

// Pane 3's future part: the hen and the sheep on one ground line inside the farm heading
// (the cow stays in the pathway). Each has a small life of her own, stepped here
// frame by frame and never in sync. When the feed is poured (`fed`) the grain
// falls once at the feed spot, the hen walks over and eats it, and the sheep
// grazes. The pile shrinks as she eats, on the frame her beak is down: her
// first bout leaves half of it, her second none, and she goes back to pecking
// at the ground where she stands. Under reduced motion the full pile stays.
//
// luibot pours from above the spot with his canvas starting at the spot's
// left edge, so the ground under his canvas stays empty (his jets must not
// land on an animal): hen, feed, his width of bare ground, sheep.
//
// The rule is a bit of field: a sign at its left end (the text is the plan's
// name, laid over `signBox` by PlanTitle), then a few tufts of grass: to the
// left of the hen, at the sheep's hind feet and to her right, painted before
// the animals. None stands where the hen walks, under the feed
// or under luibot, and the sheep's mouth (she faces left, towards the feed)
// has bare ground. Only `tuft-a` sways.

const { chicken, sheep, feed, luibot, farmSign, grass } = characters;
const width = (sheet, action) => sheet.actions[action].frames[0][0].length;
const tall = (sheet, action, frame = 0) => sheet.actions[action].frames[frame].length;
const HEN_BEAK = 18; // from her canvas's left edge to the grain under her beak in `peck`
const WALK = 12; // px she walks to the feed: six frames of her 2px stride
// The sign stands at the field's left end; the panel for its text is x 1-59,
// rows 1-13 of its canvas (the sheet's comment in src/sprites/props.js).
const SIGN_FACE = { x: 1, y: 1, w: 59, h: 13 };
const SIGN_BOX = { x: SIGN_FACE.x, up: farmSign.actions.idle.frames[0].length - SIGN_FACE.y - SIGN_FACE.h, w: SIGN_FACE.w, h: SIGN_FACE.h };
const GRASS_X = width(farmSign, "idle") + 6;
const HEN_X = GRASS_X + 9; // the grass to her left
const FEED_X = HEN_X + WALK + HEN_BEAK; // luibot's x when he pours; the grain lands 3px in
const FEED_DX = -1; // the feed's canvas starts a column left of his: its grain column is under his sack
const SHEEP_X = FEED_X + width(luibot, "feed") + 2;
const SHEEP_END = SHEEP_X + width(sheep, "idle");
const WIDTH = SHEEP_END + 24; // the grass to her right
const TUFTS = [
  { action: "tuft-a", x: GRASS_X },
  { action: "tuft-b", x: SHEEP_X + 32 },
  { action: "tuft-d", x: SHEEP_END + 3 },
  { action: "tuft-c", x: SHEEP_END + 13 },
];
const HEIGHT = sheep.actions.idle.frames[0].length; // the tallest resident
const HOVER = 16 + luibot.actions.feed.frames[0].length; // luibot pouring reaches this far above the ground: the pathway hovers him 16px up
const FEED_H = tall(feed, "fall");
// Where a canvas `h` tall stands with its left edge `x` from the scene's left
// edge. Each actor is a zero-size inline box at the scene's top-left corner,
// moved into place: an absolutely placed box inside the heading would put a
// line break into a copy of its sentence (as the props in Places.jsx).
const at = (x, h, box = HEIGHT) => ({ left: x, top: box - h });

const PECK = [1, 2, 3, 1, 2, 3]; // a bout: two pecks; her beak is down in frame 2
const LAST_BITE = PECK.lastIndexOf(2);
const PILE = { action: "pile", frame: 0 };
const HALF = { action: "pile-half", frame: 0 };
const GRAZE = [1, 2, 3, 2, 3, 4];
const REST = { action: "idle", frame: undefined };
const between = (min, max) => min + Math.random() * (max - min);

async function play(wait, set, sheet, action, frames, onStep) {
  for (const [step, frame] of frames.entries()) {
    set({ action, frame });
    onStep?.(step);
    await wait(sheet.actions[action].durations[frame]);
  }
  set(REST);
}

export function FarmScene({ fed }) {
  const poured = useChore(fed);
  const henAt = useRef(reducedMotion() ? WALK : 0);
  const [hen, setHen] = useState(REST);
  const [ewe, setEwe] = useState(REST);
  const [grain, setGrain] = useState(null); // the feed prop's action and frame on the ground, or none

  useEffect(() => {
    if (!poured) {
      setGrain(null);
      return undefined;
    }
    if (reducedMotion()) {
      setGrain(PILE);
      return undefined;
    }
    return script(async (wait) => {
      // `fall`'s last frame is the pile, held by the sheet for ever: cut to `pile` instead
      for (let frame = 0; frame < feed.actions.fall.frames.length - 1; frame += 1) {
        setGrain({ action: "fall", frame });
        await wait(feed.actions.fall.durations[frame]);
      }
      setGrain(PILE);
    });
  }, [poured]);

  useEffect(() => {
    if (reducedMotion()) return undefined;
    return script(async (wait) => {
      if (poured) {
        await wait(800); // the grain has landed
        const { interval, stride } = chicken.actions.walk;
        for (let frame = 0; henAt.current < WALK; frame += 1) {
          henAt.current += stride;
          setHen({ action: "walk", frame: frame % chicken.actions.walk.frames.length });
          await wait(interval);
        }
        setHen(REST);
        await wait(300);
        for (const left of [HALF, null]) {
          await play(wait, setHen, chicken, "peck", PECK, (step) => step === LAST_BITE && setGrain(left));
          await wait(between(2500, 4000));
        }
      } else await wait(between(3500, 5000));
      for (;;) {
        await play(wait, setHen, chicken, "peck", PECK);
        await wait(between(6000, 10000));
      }
    });
  }, [poured]);

  useEffect(() => {
    if (reducedMotion()) return undefined;
    return script(async (wait) => {
      await wait(poured ? 2600 : between(1500, 2500));
      for (;;) {
        await play(wait, setEwe, sheep, "graze", GRAZE);
        await wait(between(8000, 13000));
      }
    });
  }, [poured]);

  return (
    <span className="pn-farm" aria-hidden="true" style={{ "--farm-w": `${WIDTH}px`, "--farm-h": `${HEIGHT}px` }}>
      <span className="pn-farm__prop" data-prop="farmSign" style={at(0, tall(farmSign, "idle"))}>
        <Sprite character="farmSign" action="idle" scale={1} />
      </span>
      {TUFTS.map((tuft) => (
        <span className="pn-farm__prop" data-prop={tuft.action} key={tuft.x} style={at(tuft.x, tall(grass, tuft.action))}>
          <Sprite character="grass" action={tuft.action} scale={1} />
        </span>
      ))}
      <span className="pn-farm__animal" data-animal="hen" data-action={hen.action} style={at(HEN_X + henAt.current, tall(chicken, hen.action, hen.frame))}>
        <Sprite character="chicken" action={hen.action} frame={hen.frame} scale={1} />
      </span>
      <span className="pn-farm__animal" data-animal="sheep" data-action={ewe.action} style={at(SHEEP_X, tall(sheep, ewe.action, ewe.frame))}>
        <Sprite character="sheep" action={ewe.action} frame={ewe.frame} scale={1} flip />
      </span>
      {/* last: the only box with a width, so it moves nothing after it */}
      <span className="pn-farm__feed" data-anchor="feed-spot" data-grain={grain ? `${grain.action} ${grain.frame}` : ""} style={{ ...at(FEED_X, FEED_H), width: width(feed, "fall"), height: FEED_H }}>
        {grain && (
          <span className="pn-farm__grain" style={at(FEED_DX, tall(feed, grain.action, grain.frame), FEED_H)}>
            <Sprite character="feed" action={grain.action} frame={grain.frame} scale={1} />
          </span>
        )}
      </span>
    </span>
  );
}
FarmScene.signBox = SIGN_BOX;
// where luibot pours: from the feed spot, his width across, this far above the scene
FarmScene.hover = { x: FEED_X, w: width(luibot, "feed"), room: HOVER - HEIGHT };
