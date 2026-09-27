import { Children, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./panes.css";
import { agentRoadmap, agentStory, agents, intro, lately, people, projects, sections, someday } from "../../content";
import { Sprite, characters } from "../../sprites/Sprite.jsx";
import justinSheet from "../../sprites/justin.js";
import * as propSheets from "../../sprites/props.js";
import ballSheet from "./ball.js";
import { Palette } from "./Palette.jsx";
import { BALL_AT_SHOE, HAT_TIP, createStage, petLowSpot, poseBox } from "./stage.js";
import { AgentRobot, BuilderScene, BuilderSpot, FarmScene, HelloScene, JapanScene, NewYorkScene, PlanTitle, RobotBeam, RobotBox, UpTo, useRobotHandoff } from "./scenes";

// ?hour=0..23 pins the San Francisco hour, clock included, so each time of
// day can be checked by hand.
const hourOverride = new URLSearchParams(window.location.search).get("hour");

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

// How Justin settles at each pane's station: with the shoebox at hello,
// typing at the desk under things I've built, standing with the robots; under
// the people, farm and now panes the hour decides (espresso in the morning,
// standing through the day, sitting in the evening, asleep at night) and the
// clock says why.
const hourPose = { morning: "sip", day: "idle", evening: "sit", night: "sleep" };
// (at hello he carries the shoeboxes while he has them; see restFor)
const panePose = { people: "sleep", agents: "idle", built: "type" };

// Props are staged by name and measured from their sheets, so art that is
// still being drawn (the sheep, a redrawn cow) drops in without a code change.
const { coffee, shoeRack, cow, sheep } = propSheets;
// luibot's canvas heights at his two pane spots, for whether he fits in the pane's window
const BOT_FLY_H = characters.luibot.actions.fly.frames[0].length;
const BOT_FEED_H = characters.luibot.actions.feed.frames[0].length;
const GAP = 4;
const propWidth = (sheet) => sheet.actions.idle.frames[0][0].length;
// Where the coffee machine's canvas sits in his `press`/`grab` canvas, from
// the comment above `press` in src/sprites/justin.js. MUST match it; with
// BODY_X in stage.js it is the one standing spot the coffee actions are
// drawn for.
const COFFEE_PROP_X = -26;
// The espresso round at step 5's coffee corner. The coffee actions are drawn
// for one arrangement: he stands right of the machine, unflipped, and works
// it with the arm nearest it, so every beat faces front (+1) whichever side
// he came from. The beats follow the sheet comments: `press` f0 arm rising,
// f1 finger on the button, f0 back, then he waits in idle while it brews;
// `grab` f0 hand beside the cup, f1 round it, f2 lifted (the prop goes empty
// here), f3 at the chest, f4 the hand-off that matches `sip` cell for cell;
// putting the cup back plays `grab` in reverse. Called away with the cup in
// his hand, he puts it back first, at double speed (`leave`).
const COFFEE_FACING = 1;
const PUT_BACK = [{ pose: "grab", frames: [4, 3, 2, 1, 0], ms: 0, flag: "return", facing: COFFEE_FACING, speed: 2 }];
const COFFEE_BEATS = [
  { pose: "press", frames: [0, 1, 0], ms: 0, flag: "press", facing: COFFEE_FACING },
  { pose: "idle", ms: 2900, flag: "brew", facing: COFFEE_FACING },
  { pose: "idle", ms: 1600, flag: "ready", facing: COFFEE_FACING },
  { pose: "grab", frames: [0, 1, 2, 3, 4], ms: 0, flag: "grab", facing: COFFEE_FACING, leave: PUT_BACK },
  { pose: "sip", ms: 7200, flag: "drink", facing: COFFEE_FACING, leave: PUT_BACK },
  { pose: "grab", frames: [4, 3, 2, 1, 0], ms: 0, flag: "return", facing: COFFEE_FACING },
];
// How long he plays with Truffle at step 5 before the next espresso.
const COFFEE_EVERY = [180000, 240000];
// Where the cow's canvas sits in his `pat` canvas (the comment above `pat` in
// src/sprites/justin.js). MUST match it.
const COW_PAT_X = -47;

function useSFHour() {
  const [hour, setHour] = useState(sfHour);
  useEffect(() => {
    const id = setInterval(() => setHour(sfHour()), 60_000);
    return () => clearInterval(id);
  }, []);
  return hour;
}

function useMedia(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function useWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

// Each digit in a cell one "0" wide, so a ticking clock never changes width
// (and never nudges the hints beside it) in a family without tabular figures.
const digits = (text) =>
  [...text].map((ch, i) =>
    /[\d-]/.test(ch) ? (
      <span key={i} className="pn__digit">
        {ch}
      </span>
    ) : (
      ch
    ),
  );

function SFClock({ hour }) {
  const [time, setTime] = useState(null);
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false, timeZone: "America/Los_Angeles" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const shown = time && `${String(hour).padStart(2, "0")}${time.slice(2)}`;
  return (
    <span className="pn__clock" aria-label="Current time in San Francisco">
      SF {digits(shown ? shown.slice(0, 5) : "--:--")}
      <span className="pn__clock-seconds">{digits(shown ? shown.slice(5) : ":--")}</span>
    </span>
  );
}

// A resident's idle life: mostly still, one small action every several
// seconds, staggered by `offset` so the farm never moves in unison. Each
// action plays one cycle (the sum of its frame durations) and returns to
// idle. Still under prefers-reduced-motion.
function useAmbient(sheet, actionNames, offset, { min = 6000, max = 10000 } = {}) {
  const [action, setAction] = useState("idle");
  useEffect(() => {
    if (!sheet || reducedMotion()) return undefined;
    let timer;
    const cycleMs = (name) => {
      const a = sheet.actions[name];
      return a.durations ? a.durations.reduce((s, d) => s + d, 0) : (a.interval ?? 1000) * a.frames.length;
    };
    let i = 0;
    const next = (delay) => {
      timer = setTimeout(() => {
        const name = actionNames[i++ % actionNames.length];
        setAction(name);
        timer = setTimeout(() => {
          setAction("idle");
          next(min + Math.random() * (max - min));
        }, cycleMs(name));
      }, delay);
    };
    next(offset + Math.random() * 2000);
    return () => clearTimeout(timer);
  }, [sheet, actionNames, offset, min, max]);
  return action;
}

// In reading order, which is also the tab order, the segment order, the
// order of the folded panes and the order of the pathway's stretches. Each
// pane's words (title, hook, more, invite) come from `sections`; `short` is
// the one-word form for the status bar's segment.
// `keywords` are the plain words a visitor might type into the palette for
// the pane (its step-bar word first).
const PANES = [
  { id: "hello", short: "hello", keywords: ["hello", "hi", "intro", "about", "me", "start", "lui", "justin", "work", "scorecard", "one piece", "geography", "shoes", "shoe rack"], ...sections.intro },
  { id: "people", short: "people", keywords: ["people", "family", "mom", "dad", "sister", "andrea", "girlfriend", "dog", "truffle"], ...sections.people },
  { id: "agents", short: "agents", keywords: ["agents", "agent", "luibot", "luibuilder", "robots", "bots", "openclaw", "discord", "side quests", "robotics", "3d printer"], ...sections.agents },
  { id: "someday", short: "future", keywords: ["future", "plans", "someday", "farm", "new york", "japan", "sheep", "cow", "chickens", "hen"], ...sections.someday },
  { id: "now", short: "now", keywords: ["now", "up to", "lately", "status", "learning", "japanese", "espresso", "coffee", "grinder", "pokemon", "experiments", "week", "weekend", "friends", "trader joe's", "san mateo"], ...sections.now },
  { id: "built", short: "projects", keywords: ["projects", "built", "tools", "code", "puzzle", "puzzlewithme", "mdnote", "slk", "slack", "things"], ...sections.projects },
];
const order = PANES.map((p) => p.id);
// The pane's name in the chrome (its strip, its fold, the step bar). The
// hello pane's title is its own h1, so its name is the step-bar word,
// capitalised like the other panes' titles ("Hello", "My people").
const paneName = (p) => (p.id === "hello" ? p.short[0].toUpperCase() + p.short.slice(1) : p.title);
// The open step lives in the URL hash (#projects), so a reload or a shared
// link opens it with Justin already standing there. #place was the "My place"
// step until 2026-09-26; what it held is under now.
const HASH_ALIAS = { place: "now" };
const paneFromHash = () => {
  const short = window.location.hash.slice(1);
  return PANES.find((p) => p.short === (HASH_ALIAS[short] ?? short))?.id;
};

// Where each reading key takes the open section's scroller.
const scrollKeys = {
  ArrowUp: (el) => el.scrollTop - 40,
  ArrowDown: (el) => el.scrollTop + 40,
  PageUp: (el) => el.scrollTop - el.clientHeight * 0.9,
  PageDown: (el) => el.scrollTop + el.clientHeight * 0.9,
  Home: () => 0,
  End: (el) => el.scrollHeight,
};

const Label = ({ children, className = "" }) => <span className={`pn__label ${className}`}>{children}</span>;

// The Expand button's icon: two arrows pointing out to the corners, or in
// towards the middle once the section is expanded.
const ExpandIcon = ({ expanded }) => (
  <svg
    className="pn__expand-icon"
    viewBox="0 0 12 12"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d={
        expanded
          ? "M10.5 5H7V1.5M7 5l3.5-3.5M1.5 7H5v3.5M5 7l-3.5 3.5"
          : "M7 1.5h3.5V5M10.5 1.5 7 5M5 10.5H1.5V7M1.5 10.5 5 7"
      }
    />
  </svg>
);

// An arrow drawn, not typed: the arrow characters are in neither type family,
// so a typed one would bring in a third, system font. `to` is left, right or
// out (up and to the right: the link leaves the site). `label` is the word a
// screen reader says for it, where the arrow carries meaning in a sentence.
const Arrow = ({ to, label }) => (
  <svg
    className={`pn__arrow pn__arrow--${to}`}
    viewBox="0 0 12 12"
    {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": "true" })}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 6h8M7 3l3 3-3 3" />
  </svg>
);

const Chevron = ({ open }) => (
  <svg
    className={`pn__chevron${open ? " pn__chevron--open" : ""}`}
    viewBox="0 0 10 10"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3.5 2 7 5 3.5 8" />
  </svg>
);

function Prose({ paragraph }) {
  return (
    <p>
      {paragraph.map((part, j) =>
        typeof part === "string" ? (
          part
        ) : (
          <a key={j} className="pn__link" href={part.href} target="_blank" rel="noreferrer">
            {part.text}
          </a>
        ),
      )}
    </p>
  );
}

// One block of a pane's details: a "###" (when it has one) over its paragraph.
// `body` is a plain string, or an array of strings and link parts.
function Block({ block }) {
  return (
    <section className="pn__block">
      {block.heading && <h3 className="pn__h3">{block.heading}</h3>}
      <Prose paragraph={[].concat(block.body)} />
    </section>
  );
}

// Two columns of blocks that keep their reading order (down the first column,
// then the second), split where the taller column comes out shortest. The
// split is measured, so it follows the words, the pane's width and the fonts.
function Balanced({ className, children }) {
  const blocks = Children.toArray(children);
  const el = useRef(null);
  const [split, setSplit] = useState(Math.ceil(blocks.length / 2));
  useLayoutEffect(() => {
    const measure = () => {
      const heights = [...el.current.querySelectorAll(":scope > div > *")].map((block) => block.getBoundingClientRect().height);
      const gap = parseFloat(getComputedStyle(el.current.firstElementChild).rowGap) || 0;
      const column = (from, to) => heights.slice(from, to).reduce((sum, h) => sum + h, 0) + gap * Math.max(0, to - from - 1);
      const taller = (at) => Math.max(column(0, at), column(at, heights.length));
      let best = 1;
      for (let at = 2; at < heights.length; at += 1) if (taller(at) < taller(best)) best = at;
      setSplit(best);
    };
    measure();
    const resized = new ResizeObserver(measure);
    resized.observe(el.current);
    return () => resized.disconnect();
  }, [blocks.length]);
  return (
    <div className={className} ref={el}>
      <div>{blocks.slice(0, split)}</div>
      <div>{blocks.slice(split)}</div>
    </div>
  );
}

// Nothing in the list moves on its own; one beat on the pathway (he hands
// luibuilder an idea) points at its line for a moment.
function Agent({ agent, pointAt, waving, present }) {
  const current = pointAt;
  return (
    <section className="pn__agent" aria-label={agent.name}>
      <div className="pn__agent-head">
        <span className="pn__card-name">{agent.name}</span>
        <Label>{agent.tag}</Label>
        <AgentRobot name={agent.name} waving={waving} present={present} />
      </div>
      <h3>{agent.heading}</h3>
      {agent.body && <p>{agent.body}</p>}
      <div className="pn__does">
        <Label>what I hand him</Label>
        <ul>
          {agent.does.map((line, i) => (
            <li key={line} aria-current={i === current ? "true" : undefined}>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Card({ name, tag, heading, body, tinted, className = "", children }) {
  return (
    <article className={`pn__card${tinted ? " pn__card--tinted" : ""} ${className}`}>
      <div className="pn__card-head">
        {name ? <span className="pn__card-name">{name}</span> : <Label>{tag}</Label>}
        {name && tag && <Label>{tag}</Label>}
      </div>
      <h3>{heading}</h3>
      <p>{body}</p>
      {children}
    </article>
  );
}

const truffleWords = {
  sleep: "asleep",
  ear: "one ear up",
  wake: "waking up",
  walk: "coming over",
  trot: "on her way",
  sit: "sitting up",
  paw: "asking for a pet",
};

function Pixels({ sheet, action, frame }) {
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

// A section's card in the right column: the plain title, one line (the
// section's `trailer`: what is inside, in other words than the open section
// uses, since both show on one screen), and the invite with the chevron at the
// top right as the one way in. The quieter `more` line belongs to the open
// section only. All
// six cards always show all of it, so nothing in the column moves when the
// visitor picks a section; the open section's card wears the open section's
// amber border and a filled dot, and has no invite (there is nowhere to go).
// `projects` has no trailer yet, so its hook stands in on its card.
const cardLine = (pane) => pane.trailer ?? pane.hook;

function Fold({ pane, index, focused, onOpen, buttonRef }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className="pn__fold"
      data-fold={pane.id}
      aria-current={focused ? "true" : undefined}
      aria-label={`${paneName(pane)}. ${cardLine(pane)}${focused ? "" : ` ${pane.invite}`}`}
      onClick={() => onOpen(pane.id)}
    >
      <span className="pn__fold-head">
        <span className="pn__dot" aria-hidden="true" />
        <span className="pn__pane-index" aria-hidden="true">
          {index + 1}
        </span>
        <span className="pn__fold-title">{paneName(pane)}</span>
        {!focused && (
          <span className="pn__fold-invite">
            {pane.invite}
            <Chevron open={false} />
          </span>
        )}
      </span>
      <span className="pn__fold-hook">{cardLine(pane)}</span>
    </button>
  );
}

// ---- the pathway's stretches ----
// One stretch per pane, in order; on a phone the whole pathway is the focused
// pane's stretch. Each stretch knows where Justin stands in it (its station)
// and where its residents live, from the sheets' widths.
function stretches(width, phone, focusedIndex) {
  const n = PANES.length;
  const span = phone ? width : width / n;
  const list = PANES.map((pane, i) => {
    const left = phone ? 0 : i * span;
    const right = left + span;
    const centre = left + span / 2;
    // `face` is the way he turns on arrival where the pose has a target (the
    // cow, Truffle, the machine, the chair), all drawn unflipped with the
    // target where the pathway puts it. A turn is a mirror cut (there is no turn
    // art), so steps whose poses face nothing keep the walk's direction.
    const s = { id: pane.id, index: i, left, right, centre, station: centre, face: undefined, residents: {} };
    if (pane.id === "hello") {
      // The shoe rack stands at the beginning of the pathway; he waves beside it.
      s.residents.rack = left + GAP;
      // clear of the rack even waving (that canvas reaches left of his feet by its anchor)
      s.station = Math.max(centre, left + GAP + propWidth(shoeRack) + GAP + poseBox("justin", "wave")[1]);
    }
    if (pane.id === "people") {
      s.residents.truffle = centre + 40;
      // He rests asleep beside her (her energy): his sleep canvas ends where
      // hers begins. When he arrives she wakes, walks over and asks for a pet.
      s.station = petLowSpot(s.residents.truffle) - 18;
      s.face = 1;
    }
    if (pane.id === "agents") {
      const half = Math.max(38, Math.min(52, span / 2 - 16));
      s.residents.luibot = centre - half;
      s.residents.luibuilder = centre + half;
    }
    if (pane.id === "someday") {
      // The cow lives on the pathway (the hen and the sheep are up in the pane's
      // farm scene). He stands to the right of her head and pats her: the
      // `pat` sheet paints her canvas at COW_PAT_X in his, so his feet are
      // that far plus his anchor from her left edge. A stretch too narrow
      // for the two of them gets the sheep instead, and he stands beside her.
      const room = span - 3 * GAP;
      if (phone || room >= propWidth(cow) + 26) {
        s.residents.cow = left + GAP;
        s.station = s.residents.cow - COW_PAT_X + poseBox("justin", "pat")[1];
        s.rest = "pat";
        s.face = 1;
      } else {
        s.residents.sheep = left + GAP;
        s.station = Math.max(centre, left + GAP + propWidth(sheep) + GAP + 18);
        s.idleOnly = true;
      }
    }
    if (pane.id === "now") {
      // The coffee corner at the stretch's start and the yard for the ball
      // right of it. He goes between the two: `coffeeStation` is the one
      // standing spot the coffee actions are drawn for (his canvas starts
      // COFFEE_PROP_X left of the machine's, his feet at the press pose's
      // anchor into it); `station` is where he plays with Truffle, left of
      // the yard's middle so the ball flies right, the yard's long side.
      s.residents.coffee = left + GAP + 4;
      s.coffeeStation = s.residents.coffee - COFFEE_PROP_X + poseBox("justin", "press")[1];
      s.yardLeft = s.residents.coffee + propWidth(coffee) + GAP;
      s.station = Math.max(centre - 16, s.coffeeStation + 40);
      s.residents.ball = s.station + BALL_AT_SHOE;
    }
    if (pane.id === "built" && characters.desk) {
      // The desk sheet shares `type`'s 64x62 canvas cell for cell (chair on
      // the left, anchor 18), so it sits where his typing pose will draw and
      // the swap is seamless.
      s.residents.desk = Math.round(s.station) - 18;
      s.face = 1;
    }
    return s;
  });
  return phone ? [list[focusedIndex]] : list;
}

export default function Panes() {
  const hour = useSFHour();
  const part = timeOfDay(hour);
  const phone = useMedia("(max-width: 639px)");
  const width = useWidth();

  const [focused, setFocused] = useState(() => paneFromHash() ?? PANES[0].id);
  const [open, setOpen] = useState(() => !!paneFromHash()); // phone: the focused pane is open (else the list)
  const [expanded, setExpanded] = useState(false); // desktop: the open pane alone
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [robotBeat, setRobotBeat] = useState(null); // 'luibot' | 'luibuilder' | null
  const [ideaAt, setIdeaAt] = useState(undefined);
  const showStack = phone ? !open : !expanded;
  const showMaster = phone ? open : true;

  const titleRef = useRef(null);
  const foldRefs = useRef({});
  const segmentRefs = useRef({});
  const bodyRef = useRef(null);

  const focusedIndex = order.indexOf(focused);
  const pathway = useMemo(() => stretches(width, phone, focusedIndex), [width, phone, focusedIndex]);
  const stretchOf = useCallback((id) => pathway.find((s) => s.id === id) ?? pathway[0], [pathway]);
  const peopleStretch = stretchOf("people");
  const nowStretch = stretchOf("now");

  // ---- the stage: the three who travel ----
  const stage = useMemo(() => createStage({ reduced: reducedMotion, sheet: justinSheet, luibot: characters.luibot }), []);
  const [scene, setScene] = useState(() => stage.snapshot());

  const boxesWhere = scene.boxes.where;
  // Step 5: he is on his feet from the espresso through the game (a direct
  // load of the step showed the hour's pose for a second before the scene);
  // only once the rounds are over does he rest in the hour's pose, until the
  // next espresso or the visitor's next ask.
  const [resting, setResting] = useState(false);
  // The boxes and the chair are read live from the stage, not from the last
  // snapshot: a rest set from a snapshot one frame old put him in idle for a
  // beat where he should already carry or type (the stage sets his rest
  // itself the moment the boxes are his or the chair is out).
  const restFor = useCallback(
    (id) =>
      id === "hello"
        ? stage.boxes.where === "justin"
          ? "carry"
          : "idle"
        : id === "built" && stage.chair.frame > 0
          ? "idle" // he stands until he has pulled the chair out
          : id === "now" && !resting
            ? "idle"
            : (stretchOf(id).rest ?? panePose[id] ?? (stretchOf(id).idleOnly ? "idle" : hourPose[part])),
    [part, stretchOf, resting, stage],
  );

  // Step 5: an espresso first, then the game with Truffle: throw; she
  // fetches and brings it to his feet; a moment later she asks and he pets
  // her; a rest; and again, one round about every 25 s. After three rounds both rest
  // where they are (she lies down, he stands or sips) until the visitor asks
  // again (a click on the ball, the palette) or comes back to the step. Every
  // few minutes he walks back to the coffee corner for another espresso, then
  // back to the yard for three more rounds. It all stops the moment the
  // visitor leaves the step (Truffle stays where she is; with the cup in his
  // hand he puts it back first). The waits run on the stage's clock.
  const ROUNDS = 3;
  const cancelCycle = useRef(null);
  const cycleRound = useRef(0);
  const nextCoffeeAt = useRef(0);
  const coffeeRoundRef = useRef(null); // the latest coffeeRound, for the cycle's timers
  const focusedRef = useRef(focused);
  focusedRef.current = focused;
  const stopCycle = useCallback(() => {
    cancelCycle.current?.();
    cancelCycle.current = null;
    cycleRound.current++;
    setResting(false);
  }, []);
  const coffeeRound = useCallback(() => {
    stopCycle();
    const s = stretchOf("now");
    nextCoffeeAt.current = performance.now() + COFFEE_EVERY[0] + Math.random() * (COFFEE_EVERY[1] - COFFEE_EVERY[0]);
    stage.walkTo(s.coffeeStation, {
      rest: "idle",
      face: COFFEE_FACING,
      onArrive: () =>
        stage.play(COFFEE_BEATS, () => {
          if (focusedRef.current !== "now") return;
          stage.walkTo(s.station, { rest: "idle", onArrive: () => playCycle() }); // the game follows: he stands
        }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, stopCycle, stretchOf, restFor]);
  coffeeRoundRef.current = coffeeRound;
  const playCycle = useCallback(
    (roundsLeft = ROUNDS) => {
      stopCycle();
      if (reducedMotion() || focusedRef.current !== "now") return;
      if (roundsLeft === 0) {
        // both rest; the next espresso comes when it is due
        setResting(true);
        cancelCycle.current = stage.after(Math.max(0, nextCoffeeAt.current - performance.now()), () => coffeeRoundRef.current());
        return;
      }
      // event-driven: the pet comes once she has brought the ball back, the
      // next throw once the pet is over; an old round's callbacks are ignored
      const round = ++cycleRound.current;
      const live = () => cycleRound.current === round && focusedRef.current === "now";
      stage.throwBall(() => {
        if (!live()) return;
        cancelCycle.current = stage.after(1500, () => {
          if (!live()) return;
          stage.pet(() => {
            if (!live()) return;
            cancelCycle.current = stage.after(4000 + Math.random() * 4000, () => playCycle(roundsLeft - 1));
          });
        });
      });
    },
    [stage, stopCycle],
  );

  // The beats each pane plays once he has arrived. Flags name the moments for
  // the residents: the robots answer his greeting, the coffee machine brews.
  const sceneFor = useCallback(
    (id) => {
      switch (id) {
        case "hello":
          stage.takeBoxes(); // from the rack, if luibot has put them back
          stage.wave();
          break;
        case "people":
          stage.pet();
          break;
        case "agents":
          // the robots are up in the pane beside their names; he tips his
          // hat up at them once and stands
          stage.play([
            { pose: "hat", frames: HAT_TIP, ms: 0, flag: "greet" },
            { pose: "idle", ms: 2200, flag: "idea" },
          ]);
          break;
        case "now":
          coffeeRound(); // an espresso first, then the ball
          break;
        default:
      }
    },
    [stage, coffeeRound],
  );

  // First paint and any re-layout: everyone in place, nobody walking. A
  // re-layout mid-scene (a resize) leaves them be, unless `anew` (the pathway
  // has become another place: across the phone breakpoint).
  const laidOut = useRef(false);
  const layoutStage = useCallback((anew = false) => {
    stage.pathway.left = 0;
    stage.pathway.right = width;
    stage.yard.left = nowStretch.yardLeft ?? 0; // clear of the coffee corner (a phone away from step 5 has no yard)
    stage.yard.right = phone ? width : nowStretch.right;
    stage.yard.rest = phone ? stretchOf(focused).station + BALL_AT_SHOE : nowStretch.residents.ball;
    stage.setHome(phone ? width / 2 + 52 : peopleStretch.residents.truffle);
    stage.placeBot(stretchOf("agents").residents.luibot - 14);
    if (!laidOut.current || anew || !stage.busy()) {
      const s = stretchOf(focused);
      // at the desk the chair is tucked until he pulls it out: he stands with a hand on its back
      const pull = focused === "built" && stage.chair.frame > 0 && !reducedMotion();
      // at step 5 he starts at the coffee corner: the espresso comes first
      const atCoffee = focused === "now";
      stage.place(pull ? stage.pullSpot(s.residents.desk) : atCoffee ? s.coffeeStation : s.station, {
        rest: pull || atCoffee ? "idle" : restFor(focused),
        home: phone ? width / 2 + 52 : peopleStretch.residents.truffle,
        ballAt: phone ? (focused === "now" ? s.station + BALL_AT_SHOE : width - 20) : nowStretch.residents.ball,
      });
      laidOut.current = true;
    }
    setScene(stage.snapshot());
  }, [stage, width, phone, nowStretch, peopleStretch, stretchOf, focused, restFor]);

  // The open step's scene from where he stands (placed there, not walked in).
  const startScene = useCallback(() => {
    const s = stretchOf(focused);
    if (focused === "built" && stage.chair.frame > 0) stage.pullChair(s.residents.desk, s.station);
    else sceneFor(focused);
  }, [stage, stretchOf, focused, sceneFor]);

  // At first paint he is already at the open step (by the shoe rack on a
  // plain load); its scene starts about a second later. At step 2 he is on
  // his feet meanwhile: Truffle is about to ask (walking in, he would have
  // arrived standing).
  const firstLayout = useRef(true);
  useLayoutEffect(() => {
    if (firstLayout.current) {
      firstLayout.current = false;
      layoutStage();
      if (focused === "people" && !reducedMotion()) {
        stage.stand();
        setScene(stage.snapshot());
      }
      const scene = () => {
        if (focusedRef.current !== focused) return; // the visitor has already moved on
        startScene();
      };
      if (reducedMotion()) {
        scene(); // still: the step's end state is on the first paint
        return undefined;
      }
      const id = setTimeout(scene, 900);
      return () => clearTimeout(id);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While hello is open he waves again now and then, never on a fixed beat.
  useEffect(() => {
    if (focused !== "hello" || reducedMotion()) return undefined;
    let id;
    const next = () => {
      id = setTimeout(() => {
        stage.wave();
        next();
      }, 20000 + Math.random() * 10000);
    };
    next();
    return () => clearTimeout(id);
  }, [focused, stage]);

  // luibot's chores in the panes (the anchors are the pane scenes'
  // `data-anchor` elements): when pane 5 opens he flies up to the sign's
  // switch and flips it; when pane 4 opens he flies to above the feed spot and
  // pours. `luibotDone[anchor]` turns true the moment the chore lands (the
  // sign lights, the grain is on the ground): the pane scenes read it in
  // place of their own timers. It resets when the visitor leaves the pane.
  // The robots between the pathway and the panes: while pane 3 is open they
  // stand beside their names, while pane 6 is open luibuilder works among the
  // projects; each trip is a beam out where he stands and a beam in at the
  // other place, luibuilder 120ms after luibot. luibot goes up only once his
  // pathway chore is done (`botUp`, from the stage at that moment), from
  // wherever that leaves him; a pane's chore is dropped and he goes up from
  // its spot. Coming back down as Justin leaves step 3, each waits until he
  // has walked clear of its spot (a beam drawn over him was the defect). On a
  // phone (one step on the pathway) they are simply in place.
  const robotRects = useMemo(
    () =>
      phone
        ? { luibot: { pathway: () => null, pane: () => null }, luibuilder: { pathway: () => null, pane: () => null } }
        : {
            luibot: {
              // mid-beam on the pathway there is nobody to beam out
              pathway: () => (stage.bot.hidden ? null : document.querySelector(".pn__bot svg")?.getBoundingClientRect() ?? null),
              pane: () => document.querySelector('.pn-robot[data-robot="luibot"]')?.getBoundingClientRect() ?? null,
            },
            luibuilder: {
              pathway: () => document.querySelector('[data-prop="luibuilder"]')?.getBoundingClientRect() ?? null,
              pane: () =>
                (document.querySelector(".pn-builder") ?? document.querySelector('.pn-robot[data-robot="luibuilder"]'))?.getBoundingClientRect() ?? null,
            },
          },
    [phone, stage],
  );
  // The stage's one clearance rule, asked of a pathway box (the pathway's x
  // is the page's): luibot's is where the stage has him, luibuilder's is his
  // prop's.
  const pathwayClear = useCallback(
    (who, place) => {
      if (place !== "pathway") return true;
      if (who === "luibot") return stage.clearOf(stage.bot.x, stage.bot.y);
      const r = robotRects.luibuilder.pathway();
      return !r || stage.clearOf(r.left, 0, r.width);
    },
    [stage, robotRects],
  );
  const [botUp, setBotUp] = useState(false);
  const luibotUp = useRobotHandoff({
    name: "luibot",
    target: botUp ? "pane" : "pathway",
    rects: robotRects.luibot,
    outAction: () => (stage.bot.y > 0 ? "beam-out-fly" : "beam-out"),
    canLeave: (from) => pathwayClear("luibot", from),
    onOut: (from) => from === "pathway" && stage.botTaken(),
    // an errand waits: from the pane he goes straight to it (no beam-in at home first)
    skipIn: stage.botBusy,
    onSkipIn: stage.botGone,
    canLand: (to) => pathwayClear("luibot", to),
  });
  useEffect(() => {
    stage.setBotAway(luibotUp.shown !== "pathway"); // up in pane 3, the pathway's robot waits
  }, [stage, luibotUp.shown]);
  const luibuilderUp = useRobotHandoff({
    name: "luibuilder",
    target: focused === "agents" || focused === "built" ? "pane" : "pathway",
    rects: robotRects.luibuilder,
    delay: 120,
    canLeave: (from) => pathwayClear("luibuilder", from),
    canLand: (to) => pathwayClear("luibuilder", to),
  });

  const [luibotDone, setLuibotDone] = useState({});
  const luibotDoneRef = useRef(luibotDone);
  luibotDoneRef.current = luibotDone;
  const choresFor = useRef(focused);
  useEffect(() => {
    // a phone-width flip keeps the pane and its chores: nothing is reset, and
    // an errand he is on (or has done) is not asked for twice
    const paneChanged = choresFor.current !== focused;
    choresFor.current = focused;
    if (paneChanged) setLuibotDone({});
    stage.cancelPaneChores(focused); // a chore for a pane that just closed is dropped
    // pane 3: luibot goes up the moment he is free (the boxes or the chair
    // first, if he is on them); read from the stage now, not from a snapshot
    if (focused !== "agents") {
      stage.wantBotUp(null);
      setBotUp(false);
    } else if (phone) setBotUp(true);
    else stage.wantBotUp(() => setBotUp(true));
    const anchor = { now: "sign-switch", someday: "feed-spot" }[focused];
    if (!anchor) return undefined;
    if (!paneChanged && (luibotDoneRef.current[anchor] || stage.botChoreFor(focused))) return undefined;
    // Where he hovers, or null when his canvas would not be wholly inside the
    // pane's scroll window (nowhere to hover: the errand is dropped, or on a
    // phone not yet begun). The spot is measured when he lands and on every
    // tick after, so he follows the pane's scroll.
    const at = () => {
      const el = document.querySelector(`[data-anchor="${anchor}"]`);
      const ground = document.querySelector(".pn__stage")?.getBoundingClientRect().bottom;
      const body = bodyRef.current?.getBoundingClientRect();
      if (!el || !ground || !body) return null;
      const r = el.getBoundingClientRect();
      // The switch: left of it, flipped, so that the mitten of `fly-wave` f0
      // (flipped: his canvas cols 23-26, rows 9-12, from the sheet) sits on
      // the knob at its off position, the track's (6, 6): its tip at the
      // knob's centre, its middle row on the knob's. His canvas top is then
      // 5px above the track's top, feet 32 rows below that. The feed spot:
      // above it, so the grain leaves his sack at his x 2-4 and lands on it.
      const top = anchor === "sign-switch" ? r.top - 5 : r.bottom - 16 - BOT_FEED_H;
      const height = anchor === "sign-switch" ? BOT_FLY_H : BOT_FEED_H;
      if (top < body.top || top + height > body.bottom) return null;
      return anchor === "sign-switch" ? { x: Math.round(r.left + 6 - 27), y: Math.round(ground - top - 32) } : { x: Math.round(r.left), y: Math.round(ground - r.bottom + 16) };
    };
    const done = () => setLuibotDone((d) => ({ ...d, [anchor]: true }));
    // arm up (f1), then the hand comes down onto the knob (f0): the sign
    // lights and the knob slides out from under his hand on that frame
    const start = () => {
      if (anchor === "sign-switch") stage.flyToSpot({ at, action: "fly-wave", reach: [{ frame: 1, ms: 300 }, { frame: 0, ms: 700, done: true }], flip: true, pane: focused, onDone: done });
      else stage.flyToSpot({ at, action: "feed", ms: 900, pane: focused, onDone: done });
    };
    if (!phone) {
      // queued now, so he goes to it straight from wherever he is
      start();
      return undefined;
    }
    // A phone: he has no pathway leg (the pathway is one step wide and he is
    // hidden off his own step), so he appears at the spot with a beam-in, once
    // the spot is in the pane's window (pane 4's feed spot is far below the
    // first screen: he comes when the visitor scrolls to the farm) and the
    // pane's open animation (220 ms) has settled.
    const body = bodyRef.current;
    let cancel = null;
    const tryStart = () => {
      if (!at()) return;
      body?.removeEventListener("scroll", tryStart);
      cancel = stage.after(250, () => {
        stage.botGone(); // nowhere on the pathway: the trip is the beam-in alone
        start();
      });
    };
    tryStart();
    if (!cancel) body?.addEventListener("scroll", tryStart, { passive: true });
    return () => {
      body?.removeEventListener("scroll", tryStart);
      cancel?.();
    };
  }, [focused, phone, stage]);

  // The pane expands or folds back in one render, and its words move: he
  // moves with his anchor in that same frame, not a tick later.
  useLayoutEffect(() => {
    if (phone) return;
    stage.followAnchor();
    setScene(stage.snapshot());
  }, [expanded, phone, stage]);

  // The open step in the URL, so a reload or a shared link lands on it.
  const hashWritten = useRef(!!paneFromHash());
  useEffect(() => {
    const short = PANES.find((p) => p.id === focused).short;
    if (!hashWritten.current && short === PANES[0].short) return;
    hashWritten.current = true;
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${short}`);
  }, [focused]);

  // A resize re-measures the pathway. Across the phone breakpoint it is
  // another place (one step wide, or all six), so everyone is set down afresh
  // at the open step and its scene starts over: mid-game, a 1280 → 375 → 1280
  // resize had left him playing in step 2's stretch.
  const lastPhone = useRef(phone);
  const mountLayout = useRef(true);
  useEffect(() => {
    if (mountLayout.current) {
      mountLayout.current = false; // the first paint's layout effect has placed everyone (a second place here undid his stand at step 2)
      return;
    }
    const crossed = lastPhone.current !== phone;
    lastPhone.current = phone;
    if (crossed) stopCycle();
    layoutStage(crossed);
    if (crossed) {
      startScene();
      setScene(stage.snapshot());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, phone]);

  // One animation loop; it only re-renders when something on stage changed.
  useEffect(() => {
    let last = performance.now();
    let prev = JSON.stringify(stage.snapshot());
    let id = requestAnimationFrame(function frame(now) {
      // The first frame's timestamp can predate `last` (a frame that began
      // before this effect ran): a negative dt would walk him backwards into
      // a negative frame index.
      const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
      last = now;
      stage.tick(now, dt);
      const next = stage.snapshot();
      const key = JSON.stringify(next);
      if (key !== prev) {
        prev = key;
        setScene(next);
      }
      id = requestAnimationFrame(frame);
    });
    return () => cancelAnimationFrame(id);
  }, [stage]);

  // Focus moved: on a wide pathway he walks to that pane's station and plays its
  // beats on arrival. Only the visitor's own step moves anyone else: Truffle
  // stays wherever she last settled (by the ball, say) and trots back to her
  // own stretch only when the visitor goes to the people pane. On a phone the
  // pathway is one stretch wide, so the scene cuts.
  const firstFocus = useRef(true);
  const lastFocused = useRef(focused);
  // A layout effect: on a phone (a cut) and under reduced motion (everyone
  // still) the step's end state is what the first paint of the step shows.
  useLayoutEffect(() => {
    if (firstFocus.current) {
      firstFocus.current = false;
      return;
    }
    const s = stretchOf(focused);
    setRobotBeat(null);
    stopCycle();
    // Leaving step 1 with the boxes in his hands: he sets them down where he
    // stands and luibot puts them back on the rack, landing beside the spot.
    if (lastFocused.current === "hello") stage.setDownBoxes(stretchOf("hello").residents.rack ?? 0, { instant: phone });
    // Leaving the desk: luibot tucks the chair in once he has gone (on a phone
    // he has no room there: the chair is simply tucked for the next visit).
    if (lastFocused.current === "built") stage.tuckChair(stretchOf("built").residents.desk, { instant: phone });
    lastFocused.current = focused;
    if (phone) {
      // the chair is tucked: he stands at its back and pulls it out, as on a wide screen
      const pull = focused === "built" && stage.chair.frame > 0 && !reducedMotion();
      stage.place(pull ? stage.pullSpot(s.residents.desk) : focused === "now" ? s.coffeeStation : s.station, {
        rest: pull || focused === "now" ? "idle" : restFor(focused),
        home: width / 2 + 52,
        ballAt: focused === "now" ? s.station + BALL_AT_SHOE : width - 20,
      });
      if (pull) stage.pullChair(s.residents.desk, s.station);
      else sceneFor(focused);
      setScene(stage.snapshot()); // the step's first paint shows him placed, not the last frame of the step before
      return;
    }
    if (focused === "people") stage.goHome();
    // However far the step is, he walks the whole way at his one pace, past
    // whoever lives in between (painted in front of them), and the step's
    // scene starts when he arrives. Justin: "i'd like for my sprite to just
    // continue walking at the same pace".
    if (focused === "built" && (stage.chair.frame > 0 || stage.chair.busy)) {
      // the chair is tucked (or luibot is about to tuck it: that chore is
      // dropped): he stops with a hand on its back, pulls it out, then sits
      const deskLeft = s.residents.desk;
      stage.walkTo(stage.pullSpot(deskLeft), { rest: "idle", face: s.face, onArrive: () => stage.pullChair(deskLeft, s.station) });
    } else if (focused === "now") coffeeRound(); // he walks to the coffee corner first
    else stage.walkTo(s.station, { rest: restFor(focused), face: s.face, onArrive: () => sceneFor(focused) });
    setScene(stage.snapshot()); // under reduced motion the walk is already over: paint the end state, not a frame of the step before
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  useEffect(() => {
    stage.setRest(restFor(focused));
  }, [stage, restFor, focused]);
  const helloStation = stretchOf("hello").station;
  useEffect(() => {
    if (focused === "hello" && boxesWhere === "rack" && !scene.justin.moving && Math.abs(scene.justin.cx - helloStation) < 3) stage.takeBoxes();
  }, [stage, focused, boxesWhere, scene.justin.moving, scene.justin.cx, helloStation]);

  // The robots' side of the greeting, from his beats; then, while he stays,
  // one of them stirs every so often.
  const flag = scene.justin.flag;
  useEffect(() => {
    if (flag === "luibot" || flag === "luibuilder") setRobotBeat(flag);
    if (flag === "idea") {
      setRobotBeat(null);
      const line = agents[1]?.does.findIndex((d) => /idea/i.test(d));
      setIdeaAt(line >= 0 ? line : undefined);
    } else setIdeaAt(undefined);
  }, [flag]);
  // ---- panes: focus, open, expanded, keyboard ----
  const pendingTitleFocus = useRef(false);
  useEffect(() => {
    if (!pendingTitleFocus.current) return;
    pendingTitleFocus.current = false;
    (showMaster ? titleRef.current : foldRefs.current[focused])?.focus({ preventScroll: true });
  }, [focused, showMaster, open, expanded]);

  // A pane that scrolls says so with a soft fade at its cut, gone at the end.
  const [moreBelow, setMoreBelow] = useState(false);
  const measureMore = useCallback(() => {
    const el = bodyRef.current;
    setMoreBelow(!!el && el.scrollHeight - el.clientHeight - el.scrollTop > 8);
  }, []);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
    measureMore();
    document.fonts.ready.then(measureMore); // the fallback faces are taller
  }, [focused, measureMore, width, showStack]);

  // The pane's vertical rhythm grows with the pane (--pn-rise in panes.css),
  // but never so far that a pane which fits starts to scroll: --pn-fit, from
  // 0 to 1, is the largest share of that growth the open pane has room for.
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return undefined;
    // with 16px to spare, so a late font or one more word does not tip it over
    const room = () => body.clientHeight - parseFloat(getComputedStyle(body).paddingBottom) - 16;
    const overflows = (fit) => {
      body.style.setProperty("--pn-fit", fit);
      return body.lastElementChild.getBoundingClientRect().bottom - body.getBoundingClientRect().top + body.scrollTop > room();
    };
    const fit = () => {
      if (!overflows(1) || overflows(0)) return; // all of the growth fits, or the pane scrolls anyway and gets none
      let [fits, tooMuch] = [0, 1];
      for (let i = 0; i < 7; i += 1) {
        const mid = (fits + tooMuch) / 2;
        if (overflows(mid)) tooMuch = mid;
        else fits = mid;
      }
      body.style.setProperty("--pn-fit", fits);
    };
    fit();
    document.fonts.ready.then(fit);
    const resized = new ResizeObserver(() => {
      fit();
      measureMore(); // a window made shorter can start a pane scrolling
    });
    resized.observe(body);
    return () => resized.disconnect();
  }, [focused, showMaster, showStack, measureMore]);

  // The column of cards says the same when a short window cuts it.
  const stackRef = useRef(null);
  const [stackMore, setStackMore] = useState(false);
  const measureStack = useCallback(() => {
    const el = stackRef.current;
    setStackMore(!!el && el.scrollHeight - el.clientHeight - el.scrollTop > 8);
  }, []);
  useEffect(() => {
    if (!stackRef.current) return undefined;
    const observer = new ResizeObserver(measureStack);
    observer.observe(stackRef.current);
    document.fonts.ready.then(measureStack);
    return () => observer.disconnect();
  }, [measureStack, showStack]);

  const focusPane = useCallback((id, { focusTitle = false, openIt = true } = {}) => {
    setFocused(id);
    if (openIt) setOpen(true);
    if (focusTitle) pendingTitleFocus.current = true;
  }, []);

  const step = useCallback(
    (delta) => {
      const next = order[order.indexOf(focused) + delta];
      if (next) focusPane(next, { focusTitle: true, openIt: open });
    },
    [focused, focusPane, open],
  );

  const toggleExpanded = useCallback(() => setExpanded((m) => !m), []);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if (paletteOpen || event.metaKey || event.ctrlKey || event.altKey) return;
      const tag = event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || event.target.isContentEditable) return;

      // Left and right move between sections from anywhere (the pathway and the
      // step bar run that way) and 1-6 jump: the keys the title bar teaches.
      // Up and down are for reading: they scroll the open section wherever
      // focus is. With focus in the list of sections (up and down) or in the
      // step bar (left and right) the arrows move through that list and focus
      // stays in it. h j k l and z stay for whoever reaches for them.
      const sideways = { ArrowLeft: -1, ArrowRight: 1 };
      const vertical = { ArrowUp: -1, ArrowDown: 1 };
      const card = event.target.closest?.("[data-fold]");
      const segment = event.target.closest?.("[data-segment]");
      const body = bodyRef.current;
      const walk = (from, delta, refs) => {
        const next = order[order.indexOf(from) + delta];
        if (!next) return;
        focusPane(next, { openIt: open });
        refs.current[next]?.focus();
      };
      const vim = { h: -1, l: 1, k: -1, j: 1 };
      const number = order[Number(event.key) - 1];
      if (/^[1-6]$/.test(event.key) && number) {
        event.preventDefault();
        focusPane(number, { focusTitle: true, openIt: open });
      } else if (vim[event.key]) {
        event.preventDefault();
        step(vim[event.key]);
      } else if (sideways[event.key] && segment) {
        event.preventDefault();
        walk(segment.dataset.segment, sideways[event.key], segmentRefs);
      } else if (sideways[event.key]) {
        event.preventDefault();
        step(sideways[event.key]);
      } else if (vertical[event.key] && card) {
        event.preventDefault();
        walk(card.dataset.fold, vertical[event.key], foldRefs);
      } else if (scrollKeys[event.key] && body && !body.contains(event.target)) {
        // focus is outside the scroller (the page itself, a tab, a step), so
        // the browser would scroll nothing
        event.preventDefault();
        body.scrollTo({ top: scrollKeys[event.key](body) });
      } else if (event.key === "z" && !phone) {
        event.preventDefault();
        toggleExpanded();
      } else if (event.key === "Escape") {
        if (phone && open) setOpen(false);
        else if (expanded) setExpanded(false);
      } else if (event.key === "/") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, paletteOpen, toggleExpanded, expanded, phone, open, focusPane]);

  const touch = useRef(null);
  const onTouchStart = (event) => {
    const t = event.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (event) => {
    if (!touch.current || !phone || !open) return;
    const t = event.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 64 && Math.abs(dy) < 48) step(dx < 0 ? 1 : -1);
  };

  const wave = useCallback(
    (name) => {
      focusPane("agents", { focusTitle: true });
      setRobotBeat(name);
      setTimeout(() => setRobotBeat(null), 2400);
    },
    [focusPane],
  );

  const commands = useMemo(
    () => [
      ...PANES.map((p) => ({
        id: `go-${p.id}`,
        label: `Go to ${paneName(p)}`,
        keywords: [...p.keywords, p.title],
        kind: "section",
        run: () => focusPane(p.id, { focusTitle: true }),
      })),
      ...(phone
        ? []
        : [
            {
              id: "expand",
              label: expanded ? "Show all sections" : "Expand this section",
              keywords: ["expand", "full", "only", "all"],
              kind: "view",
              run: () => toggleExpanded(),
            },
          ]),
      ...projects.map((project) => ({
        id: `open-${project.title}`,
        label: `Open ${project.title} on GitHub`,
        kind: "link",
        run: () => window.open(project.href, "_blank", "noreferrer"),
      })),
      {
        id: "open-github",
        label: "Open my GitHub",
        kind: "link",
        run: () => window.open("https://github.com/jlui17", "_blank", "noreferrer"),
      },
      {
        id: "open-linkedin",
        label: "Open my LinkedIn",
        kind: "link",
        run: () => window.open("https://www.linkedin.com/in/jlui17", "_blank", "noreferrer"),
      },
      { id: "ball", label: "Throw the ball for Truffle", keywords: ["fetch", "dog"], kind: "play", run: () => (focusedRef.current === "now" ? playCycle() : focusPane("now")) },
      { id: "pet", label: "Pet Truffle", keywords: ["dog"], kind: "play", run: () => focusPane("people") },
      { id: "truffle", label: "Call Truffle over", kind: "play", run: () => stage.callTruffle() },
      { id: "wave", label: "Wave hello", kind: "play", run: () => stage.wave() },
      { id: "hat", label: "Tip my hat", kind: "play", run: () => stage.tipHat() },
      { id: "sit", label: "Sit down for a bit", kind: "play", run: () => stage.sit() },
      { id: "sip", label: "Espresso break", keywords: ["coffee"], kind: "play", run: () => (focusedRef.current === "now" ? coffeeRound() : focusPane("now")) },
      { id: "wave-luibot", label: "Wave to luibot", kind: "play", run: () => wave("luibot") },
      { id: "wave-luibuilder", label: "Wave to luibuilder", kind: "play", run: () => wave("luibuilder") },
      { id: "1070", label: "Episode 1070", kind: "play", run: () => stage.cheer() },
    ],
    [expanded, phone, focusPane, toggleExpanded, stage, wave, coffeeRound, playCycle],
  );

  const pane = PANES.find((p) => p.id === focused);
  // On a phone he shows only with the pane open: at his own step, or up at a
  // pane spot on an errand (the pathway is one step wide, and drawn off his
  // own step he sat over the cow and the coffee stand).
  const botHidden = scene.bot.hidden || luibotUp.shown !== "pathway" || (phone && !(open && (focused === "agents" || scene.bot.y > 0)));
  const truffleState = scene.truffle.pushing ? "bringing the ball back" : truffleWords[scene.truffle.pose];

  // The coffee corner's state follows his beats: brewing from the press, a
  // full cup waiting, empty from the frame the cup is in his hand (`grab`
  // f2), back on the tray once the return has put it there.
  const cupInHand = scene.justin.pose !== "grab" || (scene.justin.frame ?? 0) >= 2;
  const coffeeAction =
    { press: "idle", brew: "brew", ready: "ready", grab: cupInHand ? "empty" : "ready", drink: "empty", return: cupInHand ? "empty" : "idle" }[flag] ??
    "idle";

  // under his hand she idles or swishes her tail (the sheet says no grazing there)
  const cowAction = useAmbient(cow, ["tail"], 1500, { min: 7000, max: 12000 });
  const sheepAction = useAmbient(sheep, sheep ? Object.keys(sheep.actions).filter((a) => a !== "idle" && a !== "walk") : [], 2500);

  // The open pane's detail level. It leads with the same hook its fold shows,
  // set large, then the quieter line, then everything else smaller.
  const detail = {
    hello: (
      <div className="pn__flow">
        <div>
          {/* he stands beside the title, on the rule under it */}
          <div className="pn__hello-title">
            <h1 className="pn__h1">{sections.intro.title}</h1>
            <HelloScene pathwayWaving={scene.justin.pose === "wave"} />
          </div>
          <p className="pn__lead">{sections.intro.hook}</p>
        </div>
        {/* the detail level: a block per trait, each under a heading that says what it is about,
            with the photo to their right and one quiet last line under it */}
        <div className="pn__hello-body">
          <div className="pn__blocks">
            {intro.map((block, i) => (
              <Block block={block} key={i} />
            ))}
          </div>
          <div className="pn__hello-side">
            <figure className="pn__photo">
              <span className="pn__photo-frame">
                <img src="/images/justin-girlfriend-dog.jpeg" alt="Justin and his girlfriend taking a selfie with Truffle, his sleepy French Bulldog" />
              </span>
              <figcaption className="pn__label">me, Truffle, and my GF</figcaption>
            </figure>
            {/* three quiet lines: where he moved from and to, as airport codes (the lead already says San Francisco), then his links */}
            <p className="pn__hello-foot">
              <span>
                YVR <Arrow to="right" label="to" /> SFO
              </span>
              <a className="pn__link" href="https://github.com/jlui17" target="_blank" rel="noreferrer">
                GitHub <Arrow to="out" />
              </a>
              <a className="pn__link" href="https://www.linkedin.com/in/jlui17" target="_blank" rel="noreferrer">
                LinkedIn <Arrow to="out" />
              </a>
            </p>
          </div>
        </div>
      </div>
    ),
    people: (
      <div className="pn__people">
        {/* her row first: it is the one highlight, and at 800px tall the pane's foot is out of view */}
        {[...people.filter((p) => p.girlfriend), ...people.filter((p) => !p.girlfriend)].map((person) => (
          <Card
            key={person.name}
            name={person.name}
            heading={person.heading}
            body={person.body}
            tinted={person.girlfriend}
            className={person.girlfriend ? "pn__people-wide" : ""}
          >
            {person.name === "Truffle" && (
              <Label className={`pn__card-live${scene.truffle.pose !== "sleep" ? " pn__card-live--awake" : ""}`}>
                right now: {truffleState}
              </Label>
            )}
          </Card>
        ))}
      </div>
    ),
    agents: (
      <>
        <div className="pn__agents">
          {agents.map((agent, i) => (
            <Agent
              key={agent.name}
              agent={agent}
              pointAt={i === 1 ? ideaAt : undefined}
              waving={robotBeat === agent.name}
              present={(agent.name === "luibot" ? luibotUp : luibuilderUp).shown === "pane"}
            />
          ))}
        </div>
        {/* the second part, in two balanced columns: first what he wants them to do next, a
            plain list he keeps up to date (each line names its agent first, in a column as
            wide as the longer name), then the story of the two in blocks like pane 1's */}
        <Balanced className="pn__story">
          <section className="pn__roadmap" style={{ "--name-ch": Math.max(...agents.map((agent) => agent.name.length)) }}>
            <div className="pn__roadmap-head">
              <h3 className="pn__h3">{agentRoadmap.heading}</h3>
              {agentRoadmap.note && <Label>{agentRoadmap.note}</Label>}
            </div>
            <ul>
              {agentRoadmap.items.map((item) => (
                <li key={item.task}>
                  <span className="pn__label pn__roadmap-agent" data-agent={item.agent}>
                    {item.agent}
                  </span>
                  <span>{item.task}</span>
                </li>
              ))}
            </ul>
          </section>
          {agentStory.map((block) => (
            <Block block={block} key={block.heading} />
          ))}
        </Balanced>
      </>
    ),
    someday: (
      <div className="pn__flow pn__chapters">
        {someday.map((entry, i) => (
          <section className="pn__chapter" key={entry.tag}>
            {/* each plan's scene stands inside its heading where the place is named (the skyline,
                the cherry tree and the gate), or beside it (the hen and the sheep; the pathway
                has the cow; luibot pours their feed) */}
            <PlanTitle
              heading={entry.heading}
              place={entry.tag}
              scene={
                [
                  <NewYorkScene key="new-york" />,
                  <JapanScene key="japan" />,
                  <FarmScene key="farm" fed={!!luibotDone["feed-spot"]} />,
                ][i]
              }
            />
            <p>{entry.body}</p>
          </section>
        ))}
      </div>
    ),
    now: (
      <>
        <UpTo lit={!!luibotDone["sign-switch"]} />
        {/* under the sign, what he is up to in blocks like pane 1's, in pane 3's two balanced columns */}
        <Balanced className="pn__story">
          {lately.blocks.map((block) => (
            <Block block={block} key={block.heading} />
          ))}
        </Balanced>
        {/* his week as lists, a day to a column: the items read in order through the day,
            in the grammar of pane 3's "what I hand him" lists */}
        {lately.week && (
          <section className="pn__week">
            <h3 className="pn__h3">{lately.week.heading}</h3>
            <div className="pn__week-days">
              {lately.week.days.map((day) => (
                <div className="pn__does" key={day.label}>
                  <Label>{day.label.toLowerCase()}</Label>
                  <ol>
                    {day.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>
        )}
      </>
    ),
    built: (
      <BuilderScene present={luibuilderUp.shown === "pane"}>
        <ul className="pn__projects">
          {projects.map((project, i) => (
            <li className="pn__project" key={project.title}>
              <div className="pn__project-head">
                <a className="pn__project-title" href={project.href} target="_blank" rel="noreferrer">
                  {project.title} <Arrow to="out" />
                </a>
                <Label>{project.tag}</Label>
                <BuilderSpot index={i} />
              </div>
              <p className="pn__project-kicker">{project.kicker}</p>
              <p className="pn__project-story">{project.story}</p>
            </li>
          ))}
        </ul>
      </BuilderScene>
    ),
  };

  const robotAction = (name) => (robotBeat === name ? "wave" : "idle");
  const rackAction = scene.boxes.where === "rack" ? "idle" : "boxes-out";
  // luibot's feet row is row 31 in every canvas; taller canvases hang below it
  const botHeight = characters.luibot.actions[scene.bot.pose].frames[0].length;

  return (
    <div className="panes">
      <header className="pn__titlebar">
        <div className="pn__title-name">
          Justin Lui
          <Label>pronounced loo-wee</Label>
        </div>
        <button
          type="button"
          className="pn__palette-button"
          onClick={() => setPaletteOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={paletteOpen}
          aria-label="Search this site"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <circle cx="7" cy="7" r="4.6" />
            <path d="M10.5 10.5 14 14" strokeLinecap="round" />
          </svg>
          <span className="pn__palette-button-text">Search this site</span>
          <span className="pn__kbd" aria-hidden="true">
            /
          </span>
        </button>
        <div className="pn__title-right">
          <span className="pn__hint">
            <b aria-label="Left and right arrow keys">
              <Arrow to="left" />
              <Arrow to="right" />
            </b>{" "}
            move
          </span>
          <span className="pn__hint">
            <b>1–6</b> jump
          </span>
          <SFClock hour={hour} />
        </div>
      </header>

      <main
        className={`pn__work${showStack ? "" : " pn__work--solo"}${showMaster ? "" : " pn__work--list"}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {showMaster && (
          <article className="pn__pane pn__pane--open" data-pane={pane.id} aria-labelledby={`pn-title-${pane.id}`} key={pane.id}>
            <div className="pn__pane-head">
              {phone && (
                <button type="button" className="pn__back" onClick={() => setOpen(false)}>
                  ‹ all
                </button>
              )}
              <button
                ref={titleRef}
                id={`pn-title-${pane.id}`}
                type="button"
                className="pn__pane-title"
                aria-expanded="true"
                onClick={() => (phone ? setOpen(false) : toggleExpanded())}
              >
                <span className="pn__dot" aria-hidden="true" />
                <span className="pn__pane-index" aria-hidden="true">
                  {focusedIndex + 1}
                </span>
                {paneName(pane)}
                <Chevron open />
              </button>
              {!phone && (
                <button
                  type="button"
                  className="pn__expand"
                  aria-label={expanded ? "Show all sections" : "Expand this section"}
                  title={expanded ? "Show all sections (Esc)" : "Expand this section"}
                  onClick={toggleExpanded}
                >
                  <ExpandIcon expanded={expanded} />
                  {expanded ? "Show all sections" : "Expand"}
                </button>
              )}
            </div>
            <div className="pn__pane-body" ref={bodyRef} data-more={moreBelow || undefined} onScroll={measureMore}>
              {pane.id !== "hello" && (
                <>
                  <p className="pn__lead">{pane.hook}</p>
                  {pane.more && <p className="pn__more">{pane.more}</p>}
                </>
              )}
              {detail[pane.id]}
            </div>
          </article>
        )}

        {showStack && (
          <nav className="pn__stack" aria-label="All sections" ref={stackRef} data-more={stackMore || undefined} onScroll={measureStack}>
            {PANES.map((p, i) => (
              <Fold
                key={p.id}
                pane={p}
                index={i}
                focused={p.id === focused && showMaster}
                onOpen={(id) => focusPane(id, { focusTitle: phone })}
                buttonRef={(el) => {
                  foldRefs.current[p.id] = el;
                }}
              />
            ))}
          </nav>
        )}
      </main>

      {/* The pathway: one stretch per pane, each with its residents at home all
          the time (the shoe rack, Truffle, the robots, the farm, the ball,
          the coffee corner, the desk) and its own small scene when Justin
          arrives. On a
          phone the pathway is one stretch wide and shows the focused pane's.
          Sprites are decoration with a pointer bonus: a click on Justin tips
          his hat, on Truffle pets her, on the ball throws it; every one of
          these is also a palette command. Drawn back to front: props, Justin,
          the ball, Truffle, so the dog runs past in front of him, except that
          he is painted on top while he pets her lying down. */}
      <div className="pn__stage" aria-hidden="true">
        {pathway.map((s) => (
          <span key={s.id} className="pn__stretch" data-stretch={s.id} data-station={Math.round(s.station)} style={{ left: s.left, width: s.right - s.left }}>
            {s.residents.rack !== undefined && (
              <span className="pn__prop" data-prop="shoeRack" data-action={rackAction} style={{ left: s.residents.rack - s.left }}>
                <Sprite character="shoeRack" action={rackAction} scale={1} />
              </span>
            )}
            {s.id === "hello" && scene.boxes.where === "floor" && (
              <span className="pn__prop" data-prop="shoeboxes" data-action="idle" style={{ left: scene.boxes.x - s.left }}>
                <Sprite character="shoeboxes" action="idle" scale={1} />
              </span>
            )}
            {s.residents.luibuilder !== undefined && (
              <span className="pn__prop" data-prop="luibuilder" data-action={luibuilderUp.shown === "pathway" ? robotAction("luibuilder") : "away"} style={{ left: s.residents.luibuilder - s.left - 15 }}>
                {luibuilderUp.shown === "pathway" ? <Sprite character="luibuilder" action={robotAction("luibuilder")} scale={1} /> : <RobotBox name="luibuilder" />}
              </span>
            )}
            {s.residents.cow !== undefined && (
              <span className="pn__prop" data-prop="cow" data-action={cowAction} style={{ left: s.residents.cow - s.left }}>
                <Sprite character="cow" action={cowAction} scale={1} />
              </span>
            )}
            {s.residents.sheep !== undefined && (
              <span className="pn__prop" data-prop="sheep" data-action={sheepAction} style={{ left: s.residents.sheep - s.left }}>
                <Sprite character="sheep" action={sheepAction} scale={1} />
              </span>
            )}
            {s.residents.coffee !== undefined && (
              <span className="pn__prop" data-prop="coffee" data-action={coffeeAction} style={{ left: s.residents.coffee - s.left }}>
                <Sprite character="coffee" action={coffeeAction} scale={1} />
              </span>
            )}
            {s.residents.desk !== undefined && !(scene.justin.pose === "type" && Math.abs(scene.justin.cx - s.station) < 2) && (
              <span className="pn__prop" data-prop="desk" data-action={scene.chair.frame ? "tuck" : "idle"} data-frame={scene.chair.frame} style={{ left: s.residents.desk - s.left }}>
                <Sprite character="desk" action={scene.chair.frame ? "tuck" : "idle"} frame={scene.chair.frame || undefined} scale={1} />
              </span>
            )}
          </span>
        ))}
        <span
          className="pn__actor"
          data-actor="justin"
          data-pose={scene.justin.pose}
          data-frame={scene.justin.frame ?? ""}
          data-flip={scene.justin.flip}
          data-cx={scene.justin.cx}
          data-flag={scene.justin.flag ?? undefined}
          data-on-top={scene.justin.onTop || undefined}
          style={{ transform: `translateX(${scene.justin.left}px)` }}
          onClick={() => stage.tipHat()}
        >
          <Sprite
            character="justin"
            action={scene.justin.pose}
            outfit="overshirt"
            scale={1}
            flip={scene.justin.flip}
            frame={scene.justin.frame}
          />
        </span>
        {(!phone || focused === "now") && (
          <span
            className="pn__actor"
            data-actor="ball"
            data-frame={scene.ball.frame}
            data-cx={scene.ball.cx}
            data-y={scene.ball.y}
            style={{ transform: `translate(${scene.ball.left}px, ${-scene.ball.y}px)` }}
            onClick={() => (focused === "now" ? playCycle() : stage.throwBall())}
          >
            <Pixels sheet={ballSheet} action="roll" frame={scene.ball.frame} />
          </span>
        )}
        {(!phone || focused === "people" || focused === "now") && (
          <span
            className="pn__actor"
            data-actor="truffle"
            data-pose={scene.truffle.pose}
            data-frame={scene.truffle.frame ?? ""}
            data-flip={scene.truffle.flip}
            data-cx={scene.truffle.cx}
            data-pushing={scene.truffle.pushing || undefined}
            style={{ transform: `translateX(${scene.truffle.left}px)` }}
            onClick={() => stage.pet()}
          >
            <Sprite
              character="truffle"
              action={scene.truffle.pose}
              scale={1}
              flip={scene.truffle.flip}
              frame={scene.truffle.frame}
            />
          </span>
        )}
      </div>

      {/* luibot, the assistant: one robot on one layer over the workspace and
          the pathway, so his chores can cross from the pathway into a pane. While
          pane 3 is open he stands beside his name in the pane instead. On a
          phone the pathway is the open step's stretch alone, so he shows
          only at his own step (his errands are skipped there). */}
      <span
        className="pn__bot"
        aria-hidden="true"
        data-pose={scene.bot.pose}
        data-x={scene.bot.x}
        data-y={scene.bot.y}
        data-hidden={botHidden || undefined}
        style={{
          transform: `translate(${scene.bot.x}px, ${botHeight - 32 - scene.bot.y}px)`,
          visibility: botHidden ? "hidden" : undefined,
        }}
      >
        <Sprite character="luibot" action={scene.bot.pose} frame={scene.bot.frame} scale={1} flip={scene.bot.flip} />
      </span>
      <RobotBeam name="luibot" overlay={luibotUp.overlay} />
      <RobotBeam name="luibuilder" overlay={luibuilderUp.overlay} />

      <footer className="pn__statusbar">
        <nav className="pn__segments" aria-label="Sections">
          {PANES.map((p, i) => (
            <button
              key={p.id}
              ref={(el) => {
                segmentRefs.current[p.id] = el;
              }}
              type="button"
              className="pn__segment"
              data-segment={p.id}
              aria-current={focused === p.id ? "true" : undefined}
              onClick={() => focusPane(p.id)}
            >
              <span className="pn__segment-n" aria-hidden="true">
                {i + 1}
              </span>
              {p.short}
            </button>
          ))}
        </nav>
      </footer>

      {paletteOpen && (
        <Palette
          commands={commands}
          placeholder={phone ? "Go somewhere or bother the dog" : "Go somewhere, open something, or bother the dog"}
          onClose={() => setPaletteOpen(false)}
        />
      )}
    </div>
  );
}
