import { useEffect, useRef, useState } from "react";
import "./evo.css";
import {
  agents,
  facts,
  home,
  intro,
  people,
  projects,
  randomThing,
  sections,
  someday,
  upTo,
} from "../../content";
import { characters, Sprite } from "../../sprites/Sprite.jsx";
import ballSheet from "./ball.js";

// ?hour=0..23 pins the SF hour so each time of day can be checked by hand. It
// pins the clock's hour too, so a screenshot stays coherent.
const hourOverride = new URLSearchParams(window.location.search).get("hour");

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Whether a sheet has landed: the character may be missing altogether.
const has = (character, action) => Boolean(characters[character]?.actions[action]);

// Canvas of an action, in on-page px at scale 1. Boxes are reserved from it so
// a pose change never moves the text around a sprite.
const canvas = (character, action) => {
  const [rows] = characters[character].actions[action].frames;
  return { width: rows[0].length, height: rows.length };
};

// How long one pass through an action takes, from the sheet.
const cycle = (character, action) => {
  const { frames, durations, interval = 1200 } = characters[character].actions[action];
  return durations ? durations.reduce((sum, ms) => sum + ms, 0) : frames.length * interval;
};

// One frame's time, from the sheet.
const hold = (action, frame) => characters.justin.actions[action].durations[frame];

// The body's left edge in each of Justin's standing canvases
// (.luidocs/sprite-contracts.md): a figure box places every pose so the body,
// and so the feet, never move when the pose changes. Poses not listed keep
// the body at the canvas's left.
const BODY_X = { idle: 0, hat: 0, wave: 10, "arms-up": 10, press: 11, grab: 11, sip: 0, walk: 0 };
const bodyX = (action) => BODY_X[action] ?? 0;
const bodyLeft = (...actions) => Math.max(...actions.map(bodyX));

// Inline CSS vars for the box a set of standing poses needs: the body's left
// in the box, and the box wide and tall enough for every pose around it. The
// pose's own left in the box is --evo-pose-x (`poseX`).
const figureBox = (...actions) => {
  const left = bodyLeft(...actions);
  return {
    "--evo-figure-w": `${left + Math.max(...actions.map((a) => canvas("justin", a).width - bodyX(a)))}px`,
    "--evo-figure-h": `${Math.max(...actions.map((a) => canvas("justin", a).height))}px`,
    "--evo-body-left": `${left}px`,
  };
};
const poseX = (action) => ({ "--evo-pose-x": `calc(var(--evo-body-left) - ${bodyX(action)}px)` });

// Inline CSS vars for the box a figure needs (the largest of the poses it can
// take), read by the rules that size its box and pad text away from it.
const figureVars = (character, ...actions) => {
  const sizes = actions.map((action) => canvas(character, action));
  return {
    "--evo-figure-w": `${Math.max(...sizes.map((s) => s.width))}px`,
    "--evo-figure-h": `${Math.max(...sizes.map((s) => s.height))}px`,
  };
};

// A sprite reacts while a mouse is over it, while it has keyboard focus, or,
// on a touch screen, after a tap until a tap anywhere else. Returns the state,
// the props to spread on the element (the ref included), and a `release` that
// ends a tap, for when one tappable thing sits inside another.
function useHoverOrTap() {
  const el = useRef(null);
  const pointer = useRef("mouse");
  const [over, setOver] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!tapped) return undefined;
    // Capture phase, so it runs before the sprite under the finger re-renders
    // and the tapped rect is still in the tree.
    const release = (event) => {
      if (!el.current?.contains(event.target)) setTapped(false);
    };
    document.addEventListener("pointerdown", release, true);
    return () => document.removeEventListener("pointerdown", release, true);
  }, [tapped]);

  const mouse = (event) => event.pointerType === "mouse";
  return [
    over || tapped || focused,
    {
      ref: el,
      onPointerEnter: (event) => mouse(event) && setOver(true),
      onPointerLeave: (event) => mouse(event) && setOver(false),
      onPointerDown: (event) => {
        pointer.current = event.pointerType;
      },
      // Toggle on click, not pointerdown: a scroll that starts on the sprite
      // fires pointerdown but never a click, so a pan is never a tap.
      onClick: () => pointer.current === "mouse" || setTapped((on) => !on),
      // Keyboard focus only: a mouse click also focuses a button, and that
      // must not hold the reaction after the mouse has left.
      onFocus: (event) => setFocused(event.target.matches(":focus-visible")),
      onBlur: () => setFocused(false),
    },
    () => setTapped(false),
    tapped,
  ];
}

// True while the element is on screen. Looping sprites hold their rest frame
// off screen, so only the figure the reader has reached is moving.
function useOnScreen(ref, threshold = 0) {
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return onScreen;
}

// True once the element has been on screen, and stays true.
function useSeen(ref, threshold) {
  const onScreen = useOnScreen(ref, threshold);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (onScreen) setSeen(true);
  }, [onScreen]);
  return seen;
}

// An `idle` sprite that plays one other action once (its frames' total time)
// on request, then goes back to idle. Under prefers-reduced-motion nothing
// plays.
function useOneShot(character) {
  const [action, setAction] = useState("idle");
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const play = (next) => {
    if (reducedMotion()) return;
    clearTimeout(timer.current);
    setAction(next);
    timer.current = setTimeout(() => setAction("idle"), cycle(character, next));
  };
  return [action, play];
}

const sfHour = () =>
  hourOverride !== null
    ? Number(hourOverride)
    : Number(
        new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          hourCycle: "h23",
          timeZone: "America/Los_Angeles",
        }).format(new Date()),
      );

const timeOfDay = (hour) =>
  hour >= 23 || hour < 6 ? "night" : hour < 11 ? "morning" : hour < 18 ? "day" : "evening";

function useSFHour() {
  const [hour, setHour] = useState(sfHour);

  useEffect(() => {
    const id = setInterval(() => setHour(sfHour()), 60_000);
    return () => clearInterval(id);
  }, []);

  return hour;
}

function SFClock({ hour }) {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour12: false,
          timeZone: "America/Los_Angeles",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const shown = time && `${String(hour).padStart(2, "0")}${time.slice(2)}`;

  return (
    <span className="evo__clock" aria-label="Current time in San Francisco">
      SF {shown ? shown.slice(0, 5) : "--:--"}
      <span className="evo__clock-seconds">{shown ? shown.slice(5) : ":--"}</span>
    </span>
  );
}

// A sprite doing something in a section: a loop that only runs while on
// screen (off screen it holds frame 0), in a box of the host's
// --evo-figure-w/h, anchored bottom-right. `pace` slows a loop to so many ms a
// frame, for a sheet drawn faster than the page wants. `cheering` (typing
// 1070) gets Justin's arms up; only the free-standing Justins get it, so no
// desk, dog or boxes vanish under him.
function Figure({ character = "justin", action, outfit, flip, cheering, pace, className }) {
  const el = useRef(null);
  const onScreen = useOnScreen(el);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!pace || !onScreen || reducedMotion()) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), pace);
    return () => clearInterval(id);
  }, [pace, onScreen]);

  const frames = characters[character].actions[action].frames.length;
  return (
    <span ref={el} className={`evo__sprite evo__figure ${className ?? ""}`} aria-hidden="true">
      <Sprite
        character={character}
        action={cheering && character === "justin" ? "arms-up" : action}
        outfit={outfit}
        scale={1}
        flip={flip}
        frame={!onScreen ? 0 : pace ? tick % frames : undefined}
      />
    </span>
  );
}

// Where Justin's poses live, so none appears twice on one load: `idle` (and
// the wave and hat tip) by the h1, `press`, `grab` and `sip` at the coffee corner by
// day (at night the machine stands alone), `type` at the desk, `pet` with
// Truffle, `carry` by the shoes, `walk` then this rest on the farm.
const farmRest = { morning: "sit", day: "sit", evening: "sit", night: "sleep" };

// Justin stands on the h1's baseline after his name, facing the visitor, and
// waves now and then: once about a second after the page loads, then once
// every 20 to 30 s while the hero is on screen and the tab is visible. Two
// cycles each time, stepped frame by frame from the sheet's durations so the
// last frame runs its full time; none under reduced motion. Hovering or
// focusing him tips the hat once: up through f0-f2 to f3, held while the
// pointer stays, then back down f2-f0; a tap plays it through once. A wave
// already going finishes first, and a wave due during a hat tip is skipped, so
// neither cuts the other. Typing 1070 gets both arms up. The box places every
// pose by its body offset, so nothing moves at a change.
const WAVE = { first: 1000, every: [20_000, 30_000], cycles: 2 };
const steps = (action, frames) => frames.map((frame) => ({ action, frame, ms: hold(action, frame) }));
const WAVE_STEPS = steps("wave", Array.from({ length: WAVE.cycles * 4 }, (_, i) => i % 4));
const HAT_UP = steps("hat", [0, 1, 2, 3]);
const HAT_DOWN = steps("hat", [2, 1, 0]);
const HAT_HELD = { action: "hat", frame: 3 };
const HERO_POSES = ["idle", "wave", "hat", "arms-up"];

function HeroFigure({ outfit, cheering }) {
  const [tipping, props, dropTap, tapped] = useHoverOrTap();
  const onScreen = useOnScreen(props.ref);
  // What plays: { kind, steps, i } while a sequence runs, { kind: "hat-held" }
  // while the hat stays tipped, null at rest.
  const [seq, setSeq] = useState(null);
  const now = useRef({});
  now.current = { tipping, tapped, seq };
  const wavedOnce = useRef(false);
  const run = (kind, list) => setSeq({ kind, steps: list, i: 0 });

  useEffect(() => {
    if (!seq?.steps) return undefined;
    const id = setTimeout(() => {
      if (seq.i + 1 < seq.steps.length) setSeq({ ...seq, i: seq.i + 1 });
      else if (seq.kind === "hat-up") {
        if (now.current.tapped) dropTap();
        if (now.current.tipping && !now.current.tapped) setSeq({ kind: "hat-held" });
        else run("hat-down", HAT_DOWN);
      } else setSeq(null);
    }, seq.steps[seq.i].ms);
    return () => clearTimeout(id);
  }, [seq]);

  // The hat goes up when the pointer arrives and nothing else is playing, and
  // comes down when it leaves.
  useEffect(() => {
    if (reducedMotion()) return;
    if (tipping && !seq) run("hat-up", HAT_UP);
    if (!tipping && seq?.kind === "hat-held") run("hat-down", HAT_DOWN);
  }, [tipping, seq]);

  useEffect(() => {
    if (!onScreen || reducedMotion()) return undefined;
    let next;
    const later = (ms) => {
      next = setTimeout(wave, ms);
    };
    const wave = () => {
      if (!now.current.seq && !now.current.tipping && document.visibilityState === "visible") run("wave", WAVE_STEPS);
      wavedOnce.current = true;
      later(WAVE.every[0] + Math.random() * (WAVE.every[1] - WAVE.every[0]));
    };
    later(wavedOnce.current ? WAVE.every[0] : WAVE.first);
    return () => clearTimeout(next);
  }, [onScreen]);

  const shown = cheering
    ? { action: "arms-up" }
    : seq?.steps
      ? seq.steps[seq.i]
      : seq || (tipping && reducedMotion())
        ? HAT_HELD
        : { action: "idle" };

  return (
    <span className="evo__hero-figure" style={{ ...figureBox(...HERO_POSES), ...poseX(shown.action) }}>
      <button
        type="button"
        className="evo__sprite evo__reacts"
        aria-label="Say hi to Justin"
        data-action={`${shown.action}:${shown.frame ?? "loop"}`}
        {...props}
      >
        <Sprite character="justin" action={shown.action} outfit={outfit} scale={1} frame={shown.frame} />
      </button>
    </span>
  );
}

function Pixels({ sheet, action, frame = 0 }) {
  const rows = sheet.actions[action].frames[frame];
  return (
    <svg
      width={rows[0].length}
      height={rows.length}
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      shapeRendering="crispEdges"
    >
      {rows.flatMap((row, y) =>
        [...row].map(
          (ch, x) =>
            sheet.palette[ch] && (
              <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill={sheet.palette[ch]} />
            ),
        ),
      )}
    </svg>
  );
}

// luibot and luibuilder stand on a rule, blink now and then, and wave and say
// hi while the pointer (or focus) is on them; they wave for 1070 too.
// luibuilder's wave is a hat tip that plays once and holds. Sprite holds the
// wave's first frame under prefers-reduced-motion.
function Robot({ character, cheering }) {
  const [over, props] = useHoverOrTap();
  const onScreen = useOnScreen(props.ref);

  return (
    <button
      type="button"
      className="evo__sprite evo__reacts evo__robot"
      aria-label={`Say hi to ${character}`}
      {...props}
    >
      <Sprite
        character={character}
        action={over || cheering ? "wave" : "idle"}
        scale={1}
        frame={onScreen ? undefined : 0}
      />
      {over && <span className="evo__label evo__bubble">Hi, I&rsquo;m {character}</span>}
    </button>
  );
}

// A section heading: the number, the plain title, and the one-sentence hook
// under it as the skim line. `aside` sits at the right end of the head row.
function SectionHead({ number, id, section, aside, className, style, children }) {
  return (
    <div className={`evo__section-head ${className ?? ""}`} style={style}>
      <span className="evo__label">{number}</span>
      <div className="evo__section-title">
        <h2 id={id}>{section.title}</h2>
        <p className="evo__hook">{section.hook}</p>
      </div>
      {aside}
      {children}
    </div>
  );
}

// The coffee corner: the machine, and Justin to its right, on the rail's rule.
// By day he stands by the machine until the section scrolls into view (and
// again on click, tap or Enter): he presses the button, stands while it pulls,
// takes the cup and goes back to sipping now and then. Asked again while he
// has the cup, he puts it back first. At night the machine is off and stands
// alone on the rule. Each step is a pose (an action and a frame, so a sheet
// plays once, forwards or backwards, under our own timers; no frame means the
// pose loops) plus a machine state, held for `ms`. The caption follows the
// machine. The cup is in exactly one place in every step: on the tray or in
// his hand (`grab` f0 and f1 draw the tray's cup cell for cell, hand on it).
//
// The sheets' contract (.luidocs/sprite-contracts.md, and src/sprites/justin.js
// above `press` and `grab`): `press` and `grab` share one 47x62 canvas with the
// body at x11 and the machine's canvas at (MACHINE_X, 12) in it, painted
// first. `press` f0 is the arm rising, f1 the fingertip on the button (the
// machine starts here). `grab` f0 is the open hand at the cup, f1 the hand
// closed on it, f2 the lift (the tray is empty from here), f3 the cup at the
// chest, f4 the hand-off that matches `sip` f0 cell for cell. He stands in
// `idle` before the first brew and while the machine runs: a transient idle
// here does not count against "no pose twice" on the page.
const MACHINE_X = -26;
const CORNER_POSES = ["idle", "sip", "press", "grab"];
const step = (action, frame, machine, caption) => ({ action, frame, machine, caption, ms: hold(action, frame) });
// The caption holds one line from the click until the press lands, then
// follows the shot, then rests on the line that doubles as the click hint.
const PULLING = "pulling a shot";
const READY = "shot’s ready";

function coffeeSteps(holdingCup) {
  const making = holdingCup ? "making another" : "making one";
  const grab = [0, 1, 2, 3, 4].map((f) => step("grab", f, f < 2 ? "ready" : "empty", READY));
  // The grab backwards: the cup is back on the tray, and the machine off,
  // from the frame his hand closes on it.
  const putBack = [4, 3, 2, 1, 0].map((f) => step("grab", f, f < 2 ? "idle" : "empty", making));
  return [
    ...(holdingCup ? putBack : []),
    step("press", 0, "idle", making),
    step("press", 1, "brew", PULLING),
    { action: "idle", machine: "brew", ms: cycle("coffee", "brew"), caption: PULLING },
    { action: "idle", machine: "ready", ms: 600, caption: READY },
    ...grab,
  ];
}

function CoffeeCorner({ part, outfit }) {
  const el = useRef(null);
  const onScreen = useOnScreen(el);
  const seen = useSeen(el, 1);
  const still = reducedMotion();
  const byDay = part !== "night";
  // Under reduced motion he already has his cup by day; otherwise he gets it
  // on the first view.
  const [holdingCup, setHoldingCup] = useState(byDay && still);
  const [script, setScript] = useState(null);
  const [step, setStep] = useState(0);

  const brew = () => {
    if (script) return;
    // Reduced motion: a still moment with the shot ready, then his cup.
    setScript(still ? [{ action: "idle", machine: "ready", ms: 1500, caption: READY }] : coffeeSteps(holdingCup));
    setStep(0);
  };

  useEffect(() => {
    if (seen && byDay && !still) brew();
  }, [seen]);

  useEffect(() => {
    if (!script) return undefined;
    const id = setTimeout(() => {
      if (step + 1 < script.length) setStep(step + 1);
      else {
        setScript(null);
        setHoldingCup(true);
      }
    }, script[step].ms);
    return () => clearTimeout(id);
  }, [script, step]);

  const machineW = canvas("coffee", "idle").width;
  if (!byDay) {
    return (
      <figure className="evo__corner-figure">
        <figcaption className="evo__label">fig. 02 — machine’s off</figcaption>
        <span ref={el} className="evo__corner" style={{ "--evo-machine-w": `${machineW}px` }}>
          <span className="evo__sprite evo__machine">
            <Sprite character="coffee" action="idle" scale={1} frame={0} />
          </span>
        </span>
      </figure>
    );
  }

  const current = script?.[step];
  const shown = current ?? { action: holdingCup ? "sip" : "idle" };
  const machine = current ? current.machine : holdingCup ? "empty" : "idle";

  return (
    <figure className="evo__corner-figure">
      <figcaption className="evo__label">fig. 02 — {current ? current.caption : holdingCup ? "make another" : "make one"}</figcaption>
      <button
        ref={el}
        type="button"
        className="evo__corner evo__reacts"
        aria-label="Make an espresso"
        data-pose={`${shown.action}:${shown.frame ?? "loop"}`}
        data-machine={machine}
        onClick={brew}
        style={{
          "--evo-machine-w": `${machineW}px`,
          // The box's left, in from the machine's left: the press canvas sits
          // at the box's left when its body is at the box's body line.
          "--evo-justin-x": `${-MACHINE_X - (bodyLeft(...CORNER_POSES) - bodyX("press"))}px`,
          ...figureBox(...CORNER_POSES),
        }}
      >
        <span className="evo__sprite evo__machine">
          <Sprite character="coffee" action={machine} scale={1} frame={onScreen ? undefined : 0} />
        </span>
        <span className="evo__sprite evo__figure evo__figure--placed" style={poseX(shown.action)}>
          <Sprite
            character="justin"
            action={shown.action}
            outfit={outfit}
            scale={1}
            frame={!onScreen ? (shown.frame ?? 0) : shown.frame}
          />
        </span>
      </button>
    </figure>
  );
}

// 01 as a readout rail: the three entries that carry a detail are the section,
// three cells on one rail (Watching, Cooking, Brewing, so the espresso cell is
// at the right end where the coffee corner stands on the rail's rule). The
// other eight sit under the rule one step down, in two quiet columns.
const RAIL_ORDER = ["Watching", "Cooking", "Brewing"];

function UpTo({ part, outfit }) {
  const cells = RAIL_ORDER.map((label) => upTo.entries.find((entry) => entry.label === label));
  const rest = upTo.entries.filter((entry) => !entry.label);

  return (
    <>
      <div className="evo__rail">
        {cells.map((cell) => (
          <div key={cell.label} className={`evo__cell${cell.label === "Brewing" ? " evo__cell--brewing" : ""}`}>
            <div className="evo__cell-text">
              <span className="evo__label">{cell.label}</span>
              <p className="evo__cell-value">{cell.value}</p>
              <p className="evo__cell-detail">{cell.detail}</p>
            </div>
            {cell.label === "Brewing" && <CoffeeCorner part={part} outfit={outfit} />}
          </div>
        ))}
      </div>
      <ul className="evo__also">
        {rest.map((entry) => (
          <li key={entry.value}>{entry.value}</li>
        ))}
      </ul>
    </>
  );
}

// The ball's spin is read off its position each animation frame, one turn per
// circumference (10px times pi) of travel, so however the travel eases the
// spin cannot skid or run on, and it turns the other way when the ball rolls
// back. The turns are rounded to a whole number over the travel (within half
// a turn in eleven), so every roll ends on frame 0, the resting frame, with no
// jump at the stop. Under prefers-reduced-motion there is no travel, so no
// spin.
function useRollFrame(ball, rolling, distance) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!rolling || reducedMotion()) return undefined;
    const { length: frames } = ballSheet.actions.roll.frames;
    const turns = Math.round(distance() / (Math.PI * 10));
    const sync = () =>
      setFrame(Math.round((ball.current.offsetLeft / distance()) * turns * frames) % frames);
    let id = requestAnimationFrame(function tick() {
      sync();
      id = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(id);
      sync();
    };
  }, [ball, rolling, distance]);

  return frame;
}

// Truffle sleeps on her card's bottom rule with Justin half-kneeling behind
// her, a hand on her back (`pet-low`); when she sits up his hand is on her
// head (`pet`). Both face left. The pet sheets were drawn for her: with him
// facing right, her canvas's left edge sits this many px in from his canvas's
// left edge (they share the ground row). He is flipped here, so the offset is
// taken from his right edge instead; the box is his canvas, read from the
// sheet. The cursor entering the card lifts one ear; only the cursor on her
// (or a tap) gets her to sit up. On touch a tap on her and a tap on the card
// are one choice: tapping one drops the other, so a second tap on her puts
// her back to sleep, not to the ear. The first time the card scrolls into
// view a ball rolls up to her nose, and she stays asleep. Clicking the ball
// rolls it away to the card's edge, and back again; she ignores it either way.
const TRUFFLE_IN_PET = {
  sit: 34, // `pet` with her `sit`
  sleep: 36, // `pet-low` with her `sleep` or `ear`
};
// Who is painted on top: sitting, her near ear stands in front of his forearm
// and his hand shows between her ears; lying down, his hand rests on her back.
const TRUFFLE_ON_TOP = { sit: true, sleep: false };
const BALL_WIDTH = ballSheet.actions.roll.frames[0][0].length;
const TRUFFLE_SLEEP = canvas("truffle", "sleep");
const TRUFFLE_SIT = canvas("truffle", "sit");
// Her button keeps one box through both poses, so the pointer that woke her is
// still on her once she has sat up (her canvas shrinks and shifts when she
// does); the sprite sits bottom-right inside it, inset by the offsets' gap.
const TRUFFLE_BOX = {
  right: Math.min(TRUFFLE_IN_PET.sit, TRUFFLE_IN_PET.sleep),
  width:
    Math.max(TRUFFLE_SLEEP.width, TRUFFLE_SIT.width) +
    Math.abs(TRUFFLE_IN_PET.sit - TRUFFLE_IN_PET.sleep),
  height: Math.max(TRUFFLE_SLEEP.height, TRUFFLE_SIT.height),
};
const BALL_GAP = 8; // the ball stops this short of her nose

function TruffleCard({ person, outfit }) {
  const [near, cardProps, dropEar] = useHoverOrTap();
  const [over, truffleProps, dropSit] = useHoverOrTap();
  const seen = useSeen(cardProps.ref, 0.6);
  const [ballAtTruffle, setBallAtTruffle] = useState(false);
  const [rolling, setRolling] = useState(false);
  const ball = useRef(null);
  // The ball's run, from the card's left edge to her sleeping nose: the same
  // sum as --evo-ball-end in evo.css.
  const distance = () =>
    ball.current.parentElement.clientWidth -
    TRUFFLE_IN_PET.sleep -
    TRUFFLE_SLEEP.width -
    BALL_WIDTH -
    BALL_GAP;
  const rollFrame = useRollFrame(ball, rolling, distance);

  const roll = () => {
    if (rolling) return;
    setBallAtTruffle((at) => !at);
    if (!reducedMotion()) setRolling(true);
  };

  useEffect(() => {
    if (seen) roll();
  }, [seen]);

  return (
    <article
      className="evo__person--truffle"
      {...cardProps}
      onClick={(event) => {
        dropSit();
        cardProps.onClick(event);
      }}
    >
      <div>
        <span className="evo__label">{person.name}</span>
        <span className="evo__label">{person.tag}</span>
      </div>
      <h3>{person.heading}</h3>
      <p>{person.body}</p>
      <figure
        className="evo__truffle-figure"
        style={{
          ...figureVars("justin", "pet", "pet-low"),
          "--evo-truffle-box-right": `${TRUFFLE_BOX.right}px`,
          "--evo-truffle-box-w": `${TRUFFLE_BOX.width}px`,
          "--evo-truffle-box-h": `${TRUFFLE_BOX.height}px`,
          "--evo-truffle-inset": `${TRUFFLE_IN_PET[over ? "sit" : "sleep"] - TRUFFLE_BOX.right}px`,
          "--evo-truffle-z": TRUFFLE_ON_TOP[over ? "sit" : "sleep"] ? 1 : 0,
          "--evo-truffle-sleep-x": `${TRUFFLE_IN_PET.sleep}px`,
        }}
      >
        <figcaption className="evo__label">
          fig. 03 — {over ? "awake, briefly" : "asleep, as usual"}
        </figcaption>
        <button
          type="button"
          ref={ball}
          className={`evo__sprite evo__reacts evo__ball${ballAtTruffle ? " evo__ball--at-truffle" : ""}`}
          aria-label="Roll the ball"
          onClick={(event) => {
            event.stopPropagation();
            roll();
          }}
          onTransitionEnd={(event) => event.propertyName === "left" && setRolling(false)}
        >
          <Pixels sheet={ballSheet} action="roll" frame={rollFrame} />
        </button>
        <button
          type="button"
          className="evo__sprite evo__reacts evo__truffle"
          aria-label="Wake Truffle"
          {...truffleProps}
          onClick={(event) => {
            event.stopPropagation();
            dropEar();
            truffleProps.onClick(event);
          }}
        >
          <Sprite character="truffle" action={over ? "sit" : near ? "ear" : "sleep"} scale={1} flip />
        </button>
        <Figure action={over ? "pet" : "pet-low"} outfit={outfit} flip className="evo__pet-figure" />
      </figure>
    </article>
  );
}

// A walker's frames advance by distance: one frame per `stride` px of travel,
// read off its position each animation frame, so its feet never slide.
function useWalkFrame(el, walking, start, action) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!walking) return undefined;
    const { stride, frames } = action;
    let id = requestAnimationFrame(function tick() {
      setFrame(Math.max(0, Math.floor((el.current.offsetLeft - start) / stride)) % frames.length);
      id = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, [el, walking, start, action]);

  return frame;
}

// Someone walking along the closing rule from `start` until the `rest` pose
// stands at `end` (both left offsets), at the pace the sheet gives (stride px
// per frame, interval ms per frame). A rest pose with a different canvas is
// centred on where the walking one stopped, and may be flipped. If `end`
// moves mid-walk (a resize), the walk carries on from where it is at the same
// pace. Under prefers-reduced-motion they are already there. Justin raises
// his arms for 1070 once he has arrived.
function Walker({ character, action, rest, restFlip, outfit, go, start, end, cheering, onArrive }) {
  const el = useRef(null);
  const [arrived, setArrived] = useState(false);
  const sheet = characters[character].actions[action];
  const still = reducedMotion();
  const done = arrived || (go && still);
  const walking = go && !done;
  const frame = useWalkFrame(el, walking, start, sheet);
  const walkEnd =
    end - Math.round((canvas(character, action).width - canvas(character, rest).width) / 2);
  const here = walking && el.current ? el.current.offsetLeft : start;
  const duration = ((walkEnd - here) / sheet.stride) * sheet.interval;
  const pose = done && cheering && character === "justin" ? "arms-up" : done ? rest : action;

  return (
    <span
      ref={el}
      className={`evo__sprite evo__walker${walking ? " evo__walker--going" : ""}`}
      style={{
        // A standing pose after the walk keeps the body where the walk's was.
        left: done ? (pose === rest ? end : walkEnd + bodyX(action) - bodyX(pose)) : go ? walkEnd : start,
        transitionDuration: `${duration}ms`,
      }}
      onTransitionEnd={(event) => {
        if (event.propertyName !== "left") return;
        setArrived(true);
        onArrive?.();
      }}
      aria-hidden="true"
    >
      <Sprite
        character={character}
        action={pose}
        outfit={outfit}
        scale={1}
        flip={done && restFlip}
        frame={walking ? frame : done ? undefined : 0}
      />
    </span>
  );
}

// The page's closing moment, on the last rule. The animals stand at the far
// right from the start, under the farm: a cow, a sheep (once her sheet lands;
// staged by name) and a hen. The cow grazes once when the ground first comes
// into view and swishes her tail every so often, the hen pecks once when
// Truffle arrives, the sheep grazes once when Justin does; at night they only
// stand. Truffle trots ahead and Justin walks after her, from under Japan
// (from the left edge on a phone), to settle beside the animals: sitting by
// day, standing in the evening, both asleep at night, Truffle turned to face
// him. The ground's width is read from mount and watched, so the start is
// known before they set off and a resize re-aims them; they set off when the
// ground is fully on screen, from a spot that varies with the hour, never
// from the far left.
const WALK_GAP = 8; // Truffle's lead when they set off
const REST_GAP = 10; // between them once they have settled, and to the hen
const FLOCK_GAP = 12; // between the animals
const TAIL_EVERY = 25_000;
const SHEEP = has("sheep", "idle");

function FarmWalk({ hour, part, outfit, cheering }) {
  const ground = useRef(null);
  const seen = useSeen(ground, 1);
  const [width, setWidth] = useState(0);
  const byDay = part !== "night";
  const rest = farmRest[part];
  const truffleRest = part === "night" ? "sleep" : "sit";
  const justin = canvas("justin", rest);
  const truffle = canvas("truffle", truffleRest);
  const hen = canvas("chicken", "idle");
  const cow = canvas("cow", "idle");
  const sheepWidth = SHEEP ? canvas("sheep", "idle").width + FLOCK_GAP : 0;
  const [cowAction, playCow] = useOneShot("cow");
  const [henAction, playHen] = useOneShot("chicken");
  const [sheepAction, playSheep] = useOneShot(SHEEP ? "sheep" : "cow");
  const henRight = cow.width + FLOCK_GAP + sheepWidth;
  const truffleEnd = width - henRight - hen.width - REST_GAP - truffle.width;
  const justinEnd = truffleEnd - REST_GAP - justin.width;
  // Where they set off from varies with the hour (so ?hour= can check each),
  // never further left than a third of the way (from the far left the walk
  // took 18 s): a third across, well over half way, or half way. On a phone
  // the ground is short, so always from the left edge.
  const start =
    width > 700 ? [Math.round(width / 3), Math.round(justinEnd * 0.6), Math.round(width / 2)][hour % 3] : 0;

  useEffect(() => {
    const observer = new ResizeObserver(() => setWidth(ground.current.clientWidth));
    observer.observe(ground.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!seen || !byDay) return undefined;
    playCow("graze");
    const id = setInterval(() => playCow("tail"), TAIL_EVERY);
    return () => clearInterval(id);
  }, [seen]);

  return (
    <div
      ref={ground}
      className="evo__farm-ground"
      style={{
        ...figureVars("justin", "walk", "sit", "sleep", "arms-up"),
        "--evo-hen-right": `${henRight}px`,
        "--evo-sheep-right": `${cow.width + FLOCK_GAP}px`,
      }}
      aria-hidden="true"
    >
      <Walker
        character="justin"
        action="walk"
        rest={rest}
        outfit={outfit}
        go={seen && width > 0}
        start={start}
        end={justinEnd}
        cheering={cheering}
        onArrive={() => byDay && SHEEP && playSheep("graze")}
      />
      <Walker
        character="truffle"
        action="trot"
        rest={truffleRest}
        restFlip={!byDay}
        go={seen && width > 0}
        start={start + canvas("justin", "walk").width + WALK_GAP}
        end={truffleEnd}
        onArrive={() => byDay && playHen("peck")}
      />
      <Figure character="chicken" action={henAction} className="evo__prop evo__hen" />
      {SHEEP && <Figure character="sheep" action={sheepAction} className="evo__prop evo__sheep" />}
      <Figure character="cow" action={cowAction} className="evo__prop evo__cow" />
    </div>
  );
}

export default function SpecSheetEvolved() {
  const hour = useSFHour();
  const part = timeOfDay(hour);
  const outfit = part === "morning" || part === "day" ? "overshirt" : "hoodie";
  const [cheering, setCheering] = useState(false);

  useEffect(() => {
    let typed = "";
    const onKey = (event) => {
      typed = (typed + event.key).slice(-4);
      if (typed === "1070") {
        setCheering(true);
        setTimeout(() => setCheering(false), 1800);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="evo">
      <main className="evo__page">
        <header className="evo__masthead">
          <div className="evo__masthead-name">
            <strong>Justin Lui</strong>
            <span className="evo__label">pronounced loo-wee</span>
          </div>
          <nav className="evo__masthead-nav" aria-label="Find Justin online">
            <a href="https://github.com/jlui17" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/jlui17" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <SFClock hour={hour} />
          </nav>
        </header>

        <section className="evo__hero">
          <div className="evo__hero-intro">
            <h1>
              Hi, I&rsquo;m{" "}
              <span className="evo__nowrap">
                Lui.
                <HeroFigure outfit={outfit} cheering={cheering} />
              </span>
            </h1>
            <p className="evo__hero-hook">{sections.intro.hook}</p>
            {intro.map((paragraph, i) => (
              <p key={i}>
                {paragraph.map((piece, j) =>
                  typeof piece === "string" ? (
                    piece
                  ) : (
                    <a
                      key={j}
                      className="evo__prose-link"
                      href={piece.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {piece.text}
                    </a>
                  ),
                )}
              </p>
            ))}
            <p className="evo__hero-note">
              <span className="evo__label">One random thing</span>
              {randomThing}
            </p>
          </div>

          <figure className="evo__figure-photo">
            <img
              src="/images/justin-girlfriend-dog.jpeg"
              alt="Justin and his girlfriend taking a selfie with a sleepy dog"
            />
            <figcaption className="evo__label">fig. 01 — the three of us</figcaption>
            <dl className="evo__facts">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="evo__label">{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </figure>
        </section>

        <section className="evo__section" aria-labelledby="now-heading">
          <SectionHead
            number="01"
            id="now-heading"
            section={sections.now}
            aside={<span className="evo__label evo__updated">updated {upTo.updated}</span>}
          />
          <UpTo part={part} outfit={outfit} />
        </section>

        <section className="evo__section" aria-labelledby="people-heading">
          <SectionHead number="02" id="people-heading" section={sections.people} />
          <div className="evo__people">
            {people.map((person) =>
              person.name === "Truffle" ? (
                <TruffleCard key={person.name} person={person} outfit={outfit} />
              ) : (
                <article
                  key={person.name}
                  className={person.girlfriend ? "evo__person--girlfriend" : undefined}
                >
                  <div>
                    <span className="evo__label">{person.name}</span>
                    <span className="evo__label">{person.tag}</span>
                  </div>
                  <h3>{person.heading}</h3>
                  <p>{person.body}</p>
                </article>
              ),
            )}
          </div>
        </section>

        <section className="evo__section" aria-labelledby="projects-heading">
          <SectionHead
            number="03"
            id="projects-heading"
            section={sections.projects}
            className="evo__section-head--desk"
            style={{
              ...figureVars("justin", "type"),
              "--evo-robot-w": `${canvas("luibuilder", "idle").width}px`,
            }}
          >
            {/* Justin at his desk on the rule under the heading, typing while
                the reader is here (slowed to 700ms a frame), with luibuilder,
                who builds the side projects with him, standing by; the hat
                tip is the desk's reaction to 1070. */}
            <span className="evo__desk">
              <Robot character="luibuilder" cheering={cheering} />
              <Figure action="type" outfit={outfit} pace={700} className="evo__desk-figure" />
            </span>
          </SectionHead>
          <ul className="evo__projects">
            {projects.map((project) => (
              <li className="evo__project" key={project.title}>
                <span className="evo__label">no. {project.number}</span>
                <div>
                  <div className="evo__project-meta">
                    <h3>
                      <a href={project.href} target="_blank" rel="noreferrer">
                        {project.title}
                      </a>
                    </h3>
                    <span className="evo__label">{project.tag}</span>
                  </div>
                  <p className="evo__project-kicker">{project.kicker}</p>
                  <p className="evo__project-story">{project.story}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="evo__section" aria-labelledby="agents-heading">
          <SectionHead number="04" id="agents-heading" section={sections.agents} />
          <div className="evo__agents">
            {agents.map((agent) => (
              <article key={agent.name} className="evo__agent">
                <div>
                  <span className="evo__label">{agent.name}</span>
                  <span className="evo__label">{agent.tag}</span>
                </div>
                <h3>{agent.heading}</h3>
                <span className="evo__label evo__does-label">Does</span>
                <ul className="evo__does">
                  {agent.does.map((job) => (
                    <li key={job}>{job}</li>
                  ))}
                </ul>
                <div className="evo__agent-figure">
                  <Robot character={agent.name} cheering={cheering} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="evo__section" aria-labelledby="home-heading">
          <SectionHead number="05" id="home-heading" section={sections.home} />
          {/* Every row reserves the figure track, so the table's columns line
              up whether or not a row has him in it. In the shoes row he
              carries two boxes to his shoe rack. */}
          <ul
            className="evo__home"
            style={{
              "--evo-figure-w": `${canvas("justin", "carry").width + 8 + canvas("shoeRack", "idle").width}px`,
              "--evo-figure-h": `${Math.max(canvas("justin", "carry").height, canvas("shoeRack", "idle").height)}px`,
            }}
          >
            {home.map((spot) => (
              <li key={spot.tag} className={spot.tag === "The shoes" ? "evo__home-row--shoes" : undefined}>
                <span className="evo__label">{spot.tag}</span>
                <h3>{spot.heading}</h3>
                <p>{spot.body}</p>
                {spot.tag === "The shoes" && (
                  <span className="evo__home-figure">
                    <Figure action="carry" outfit={outfit} className="evo__prop" />
                    <Figure character="shoeRack" action="idle" className="evo__prop" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="evo__section" aria-labelledby="someday-heading">
          <SectionHead number="06" id="someday-heading" section={sections.someday} />
          <div className="evo__someday">
            {someday.map((wish) => (
              <article key={wish.tag} className="evo__wish">
                <span className="evo__label">{wish.tag}</span>
                <h3>{wish.heading}</h3>
                <p>{wish.body}</p>
              </article>
            ))}
            <FarmWalk hour={hour} part={part} outfit={outfit} cheering={cheering} />
          </div>
        </section>

        <footer className="evo__footer">
          <span className="evo__label">That&rsquo;s all for now.</span>
          <span className="evo__label">Thanks for stopping by.</span>
        </footer>
      </main>
    </div>
  );
}
