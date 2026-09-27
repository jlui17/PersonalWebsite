import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./panes.css";
import { agents, facts, home, intro, now, people, projects, sections, someday, status } from "../../content";
import { Sprite, characters } from "../../sprites/Sprite.jsx";
import justinSheet from "../../sprites/justin.js";
import * as propSheets from "../../sprites/props.js";
import ballSheet from "./ball.js";
import { Palette } from "./Palette.jsx";
import { createStage, poseBox } from "./stage.js";

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
// typing at the desk under things I've built, standing with the robots and at
// the coffee corner; under the people, farm and now panes the hour decides
// (espresso in the morning, standing through the day, sitting in the evening,
// asleep at night) and the clock says why.
// The one-shot coffee actions, when the sheet has them (the older `reach` plays otherwise).
const COFFEE_ACTIONS = "press" in justinSheet.actions && "grab" in justinSheet.actions;

const hourPose = { morning: "sip", day: "idle", evening: "sit", night: "sleep" };
const panePose = { hello: "carry", agents: "idle", home: "idle", built: "type" };

// Props are staged by name and measured from their sheets, so art that is
// still being drawn (the sheep, a redrawn cow) drops in without a code change.
const { coffee, shoeRack, chicken, cow, sheep } = propSheets;
const GAP = 4;
const propWidth = (sheet) => sheet.actions.idle.frames[0][0].length;

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
      SF {shown ? shown.slice(0, 5) : "--:--"}
      <span className="pn__clock-seconds">{shown ? shown.slice(5) : ":--"}</span>
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

// A sprite reacts while a mouse is over it; on touch a tap toggles it and a
// tap anywhere else ends it.
function useHoverOrTap() {
  const el = useRef(null);
  const pointer = useRef("mouse");
  const [over, setOver] = useState(false);
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    if (!tapped) return undefined;
    const release = (event) => {
      if (!el.current?.contains(event.target)) setTapped(false);
    };
    document.addEventListener("pointerdown", release, true);
    return () => document.removeEventListener("pointerdown", release, true);
  }, [tapped]);

  const mouse = (event) => event.pointerType === "mouse";
  return [
    over || tapped,
    {
      ref: el,
      onPointerEnter: (event) => mouse(event) && setOver(true),
      onPointerLeave: (event) => mouse(event) && setOver(false),
      onPointerDown: (event) => {
        pointer.current = event.pointerType;
      },
      onClick: () => pointer.current === "mouse" || setTapped((on) => !on),
    },
  ];
}

// In reading order, which is also the tab order, the segment order, the
// order of the folded panes and the order of the lane's stretches. Each
// pane's words (title, hook, more, invite) come from `sections`; `short` is
// the one-word form for the status bar's segment.
const PANES = [
  { id: "hello", short: "hello", ...sections.intro },
  { id: "people", short: "people", ...sections.people },
  { id: "agents", short: "agents", ...sections.agents },
  { id: "someday", short: "future", ...sections.someday },
  { id: "now", short: "now", ...sections.now },
  { id: "home", short: "place", ...sections.home },
  { id: "built", short: "projects", ...sections.projects },
];
const order = PANES.map((p) => p.id);
const lowerFirst = (text) => text.charAt(0).toLowerCase() + text.slice(1);

const Label = ({ children, className = "" }) => <span className={`pn__label ${className}`}>{children}</span>;

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

// A quiet marker moves down what each agent does, one line at a time; a
// beat in the lane (he hands luibuilder an idea) can point it at a line.
function useRoamingMarker(length, offsetMs, pointAt) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (pointAt !== undefined) setIndex(pointAt);
  }, [pointAt]);
  useEffect(() => {
    if (reducedMotion()) return undefined;
    let id;
    const start = setTimeout(() => {
      setIndex((i) => (i + 1) % length);
      id = setInterval(() => setIndex((i) => (i + 1) % length), 4200);
    }, 4200 + offsetMs);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [length, offsetMs, pointAt]);
  return index;
}

function Agent({ agent, offsetMs, pointAt }) {
  const current = useRoamingMarker(agent.does.length, offsetMs, pointAt);
  return (
    <section className="pn__agent" aria-label={agent.name}>
      <div className="pn__agent-head">
        <span className="pn__card-name">{agent.name}</span>
        <Label>{agent.tag}</Label>
      </div>
      <h3>{agent.heading}</h3>
      <p>{agent.body}</p>
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
        {name && <Label>{tag}</Label>}
      </div>
      <h3>{heading}</h3>
      <p>{body}</p>
      {children}
    </article>
  );
}

const truffleWords = {
  sleep: "asleep in the lane",
  ear: "one ear up",
  trot: "on her way",
  sit: "sitting up",
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

// A folded pane, in three ranks: the plain title, the hook (the one sentence
// that introduces the thing, in the serif), the quieter `more` line, and the
// invite with the chevron as the one way in. The pane that is open shows only
// its title here, so the stack keeps its order and its places.
function Fold({ pane, index, focused, onOpen, buttonRef }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className={`pn__fold${focused ? " pn__fold--open" : ""}`}
      data-pane-key
      data-fold={pane.id}
      aria-expanded={focused}
      aria-label={focused ? `${pane.title} (open)` : `${pane.title}. ${pane.hook} ${pane.invite}`}
      onClick={() => onOpen(pane.id)}
    >
      <span className="pn__fold-head">
        <span className="pn__dot" aria-hidden="true" />
        <span className="pn__pane-index" aria-hidden="true">
          {index + 1}
        </span>
        <span className="pn__fold-title">{pane.title}</span>
        {focused && <span className="pn__fold-state">open</span>}
        <Chevron open={focused} />
      </span>
      {!focused && (
        <>
          <span className="pn__fold-hook">{pane.hook}</span>
          <span className="pn__fold-more">{pane.more}</span>
          <span className="pn__fold-invite">
            {pane.invite}
            <Chevron open={false} />
          </span>
        </>
      )}
    </button>
  );
}

// ---- the lane's stretches ----
// One stretch per pane, in order; on a phone the whole lane is the focused
// pane's stretch. Each stretch knows where Justin stands in it (its station)
// and where its residents live, from the sheets' widths.
const RESIDENT_MIN = { cow: 150, hen: 135 };

function stretches(width, phone, focusedIndex) {
  const n = PANES.length;
  const span = phone ? width : width / n;
  const list = PANES.map((pane, i) => {
    const left = phone ? 0 : i * span;
    const right = left + span;
    const centre = left + span / 2;
    const s = { id: pane.id, index: i, left, right, centre, station: centre, residents: {} };
    if (pane.id === "hello") {
      // The shoe rack stands at the beginning of the lane; he waves beside it.
      s.residents.rack = left + GAP;
      // clear of the rack even waving (that canvas reaches left of his feet by its anchor)
      s.station = Math.max(centre, left + GAP + propWidth(shoeRack) + GAP + poseBox("justin", "wave")[1]);
    }
    if (pane.id === "people") {
      s.residents.truffle = centre + 40;
      s.station = centre - 12;
    }
    if (pane.id === "agents") {
      const half = Math.max(38, Math.min(52, span / 2 - 16));
      s.residents.luibot = centre - half;
      s.residents.luibuilder = centre + half;
    }
    if (pane.id === "someday") {
      const hasCow = !!cow && (phone || span >= RESIDENT_MIN.cow);
      const hasHen = !!chicken && (phone || span >= RESIDENT_MIN.hen);
      if (hasCow) s.residents.cow = left + GAP;
      if (hasHen) s.residents.hen = right - GAP - propWidth(chicken);
      // clear of the cow even asleep (his widest pose, 32px to the left)
      s.station = hasCow ? left + GAP + propWidth(cow) + GAP + 32 : centre;
    }
    if (pane.id === "now") {
      s.station = centre - 16;
      s.residents.ball = s.station + 32;
    }
    if (pane.id === "home") {
      s.residents.coffee = left + GAP + 4;
      // The one standing spot the coffee actions are drawn for, from the
      // comments in justin.js: `press`/`grab` paint the machine's canvas at
      // x -20 of a canvas whose body starts at 11 (feet at 11 + 18), so his
      // feet are 49px right of the machine's left edge; the older `reach`
      // (machine at -22, body at 15) stands at 55 and is the fallback.
      s.station = s.residents.coffee + (COFFEE_ACTIONS ? 49 : 55);
    }
    if (pane.id === "built" && characters.desk) {
      // The desk sheet shares `type`'s 64x62 canvas cell for cell (chair on
      // the left, anchor 18), so it sits where his typing pose will draw and
      // the swap is seamless.
      s.residents.desk = s.station - 18;
    }
    return s;
  });
  return phone ? [list[focusedIndex]] : list;
}

export default function Panes() {
  const hour = useSFHour();
  const part = timeOfDay(hour);
  const outfit = part === "morning" || part === "day" ? "overshirt" : "hoodie";
  const phone = useMedia("(max-width: 639px)");
  const width = useWidth();

  const [focused, setFocused] = useState(PANES[0].id);
  const [open, setOpen] = useState(false); // phone: the focused pane is open (else the list)
  const [monocle, setMonocle] = useState(false); // desktop: the open pane alone
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [robotBeat, setRobotBeat] = useState(null); // 'luibot' | 'luibuilder' | null
  const [ideaAt, setIdeaAt] = useState(undefined);
  const showStack = phone ? !open : !monocle;
  const showMaster = phone ? open : true;

  const titleRef = useRef(null);
  const foldRefs = useRef({});
  const segmentRefs = useRef({});
  const bodyRef = useRef(null);

  const focusedIndex = order.indexOf(focused);
  const lane = useMemo(() => stretches(width, phone, focusedIndex), [width, phone, focusedIndex]);
  const stretchOf = useCallback((id) => lane.find((s) => s.id === id) ?? lane[0], [lane]);
  const peopleStretch = stretchOf("people");
  const nowStretch = stretchOf("now");

  // ---- the stage: the three who travel ----
  const stage = useMemo(() => createStage({ reduced: reducedMotion, sheet: justinSheet }), []);
  const [scene, setScene] = useState(() => stage.snapshot());

  const restFor = useCallback((id) => panePose[id] ?? hourPose[part], [part]);

  // The beats each pane plays once he has arrived. Flags name the moments for
  // the residents: the robots answer his greeting, the coffee machine brews.
  const sceneFor = useCallback(
    (id) => {
      switch (id) {
        case "hello":
          stage.play([{ pose: "wave", ms: 1400, flag: "wave" }]);
          break;
        case "people":
          stage.pet();
          break;
        case "agents":
          stage.play([
            { pose: "hat", ms: 900, flag: "greet" },
            { pose: "idle", ms: 1300, flag: "luibot" },
            { pose: "idle", ms: 1500, flag: "luibuilder" },
            { pose: "idle", ms: 2200, flag: "idea" },
          ]);
          break;
        case "now":
          stage.throwBall();
          break;
        case "home": {
          // The coffee actions are drawn for one arrangement: he stands right
          // of the machine, unflipped, and works it with the arm nearest it,
          // so every beat faces front (+1) whichever side he came from. The
          // beats follow the sheet comments: `press` f0 arm rising, f1 finger
          // on the button (held while the machine starts), f0 back; `grab` f0
          // hand beside the cup, f1 round it, f2 lifted (the prop goes empty
          // here), f3 at the chest, f4 the hand-off that matches `sip` cell
          // for cell; putting the cup back plays `grab` in reverse. Without
          // those sheets, `reach` (press = f0, take = f1..3) stands in.
          const f = 1; // facing
          stage.play(
            COFFEE_ACTIONS
              ? [
                  { pose: "press", frames: [0], ms: 0, flag: "press", facing: f },
                  { pose: "press", frames: [1], ms: 500, flag: "brew", facing: f },
                  { pose: "press", frames: [0], ms: 0, flag: "brew", facing: f },
                  { pose: "idle", ms: 1900, flag: "brew", facing: f },
                  { pose: "idle", ms: 1600, flag: "ready", facing: f },
                  { pose: "grab", frames: [0, 1, 2, 3, 4], ms: 0, flag: "grab", facing: f },
                  { pose: "sip", ms: 7200, flag: "drink", facing: f },
                  { pose: "grab", frames: [4, 3, 2, 1, 0], ms: 0, flag: "return", facing: f },
                ]
              : [
                  { pose: "reach", frames: [0], ms: 0, flag: "press", facing: f },
                  { pose: "idle", ms: 3100, flag: "brew", facing: f },
                  { pose: "idle", ms: 1600, flag: "ready", facing: f },
                  { pose: "reach", frames: [1, 2, 3], ms: 0, flag: "grab", facing: f },
                  { pose: "sip", ms: 7200, flag: "drink", facing: f },
                  { pose: "reach", frames: [3, 2, 1], ms: 0, flag: "return", facing: f },
                ],
          );
          break;
        }
        default:
      }
    },
    [stage],
  );

  // Where he is when the page opens, by the hour: at his coffee stand in the
  // morning, in the middle of the lane by day, beside Truffle in the evening,
  // asleep by the coffee stand at night. From there he walks to the focused
  // pane, the way a host comes to the door. The residents are already home.
  const startFor = useCallback(
    (hourPart) => {
      if (phone) return null;
      if (hourPart === "morning" || hourPart === "night") return { at: stretchOf("home").station, rest: hourPart === "night" ? "sleep" : "sip" };
      if (hourPart === "evening") return { at: stretchOf("people").station, rest: "sit" };
      return { at: stretchOf("someday").station, rest: "idle" };
    },
    [phone, stretchOf],
  );

  // First paint and any re-layout: everyone in place, nobody walking.
  const laidOut = useRef(false);
  const layoutStage = useCallback(() => {
    stage.lane.left = 0;
    stage.lane.right = width;
    stage.yard.left = phone ? 0 : nowStretch.left;
    stage.yard.right = phone ? width : nowStretch.right;
    stage.yard.rest = phone ? stretchOf(focused).station + 32 : nowStretch.residents.ball;
    stage.setHome(phone ? width / 2 + 52 : peopleStretch.residents.truffle);
    if (!laidOut.current || !stage.busy()) {
      const s = stretchOf(focused);
      stage.place(s.station, {
        rest: restFor(focused),
        home: phone ? width / 2 + 52 : peopleStretch.residents.truffle,
        ballAt: phone ? (focused === "now" ? s.station + 32 : width - 20) : nowStretch.residents.ball,
      });
      laidOut.current = true;
    }
    setScene(stage.snapshot());
  }, [stage, width, phone, nowStretch, peopleStretch, stretchOf, focused, restFor]);

  const firstLayout = useRef(true);
  useLayoutEffect(() => {
    if (firstLayout.current) {
      firstLayout.current = false;
      layoutStage();
      const start = startFor(part);
      if (start && !reducedMotion()) {
        stage.place(start.at, { rest: start.rest, home: peopleStretch.residents.truffle, ballAt: nowStretch.residents.ball });
        setScene(stage.snapshot());
        stage.walkTo(stretchOf(focused).station, { rest: restFor(focused), onArrive: () => sceneFor(focused) });
      } else if (!reducedMotion()) sceneFor(focused);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (firstLayout.current) return;
    layoutStage();
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

  // Focus moved: on a wide lane he walks to that pane's station and plays its
  // beats on arrival. Only the visitor's own step moves anyone else: Truffle
  // stays wherever she last settled (by the ball, say) and trots back to her
  // own stretch only when the visitor goes to the people pane. On a phone the
  // lane is one stretch wide, so the scene cuts.
  const firstFocus = useRef(true);
  useEffect(() => {
    if (firstFocus.current) {
      firstFocus.current = false;
      return;
    }
    const s = stretchOf(focused);
    setRobotBeat(null);
    if (phone) {
      stage.place(s.station, {
        rest: restFor(focused),
        home: width / 2 + 52,
        ballAt: focused === "now" ? s.station + 32 : width - 20,
      });
      if (!reducedMotion()) sceneFor(focused);
      return;
    }
    if (focused === "people") stage.goHome();
    stage.walkTo(s.station, { rest: restFor(focused), onArrive: () => sceneFor(focused) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  useEffect(() => {
    stage.setRest(restFor(focused));
  }, [stage, restFor, focused]);

  // The robots' side of the greeting, from his beats; then, while he stays,
  // one of them stirs every so often.
  const flag = scene.justin.flag;
  useEffect(() => {
    if (flag === "luibot" || flag === "luibuilder") setRobotBeat(flag);
    if (flag === "idea") {
      setRobotBeat(null);
      const line = agents[1]?.does.findIndex((d) => /idea/i.test(d));
      setIdeaAt(line >= 0 ? line : undefined);
    }
  }, [flag]);
  useEffect(() => {
    if (focused !== "agents" || reducedMotion()) return undefined;
    let which = 0;
    const id = setInterval(() => {
      setRobotBeat(which++ % 2 ? "luibuilder" : "luibot");
      setTimeout(() => setRobotBeat(null), 1500);
    }, 9000);
    return () => clearInterval(id);
  }, [focused]);

  // ---- panes: focus, open, monocle, keyboard ----
  const pendingTitleFocus = useRef(false);
  useEffect(() => {
    if (!pendingTitleFocus.current) return;
    pendingTitleFocus.current = false;
    (showMaster ? titleRef.current : foldRefs.current[focused])?.focus({ preventScroll: true });
  }, [focused, showMaster, open, monocle]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [focused]);

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

  const toggleMonocle = useCallback(() => setMonocle((m) => !m), []);

  useEffect(() => {
    let typed = "";
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if (paletteOpen || event.metaKey || event.ctrlKey || event.altKey) return;
      const tag = event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || event.target.isContentEditable) return;

      typed = (typed + event.key).slice(-4);
      if (typed === "1070") stage.cheer();

      const onPaneKey = event.target.closest?.("[data-pane-key]");
      const arrows = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -1, ArrowDown: 1 };
      const vim = { h: -1, l: 1, k: -1, j: 1 };
      if (vim[event.key]) {
        event.preventDefault();
        step(vim[event.key]);
      } else if (arrows[event.key] && onPaneKey) {
        event.preventDefault();
        step(arrows[event.key]);
      } else if (event.key === "z" && !phone) {
        event.preventDefault();
        toggleMonocle();
      } else if (event.key === "Escape") {
        if (phone && open) setOpen(false);
        else if (monocle) setMonocle(false);
      } else if (event.key === "/") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, paletteOpen, stage, toggleMonocle, monocle, phone, open]);

  useEffect(() => {
    document.documentElement.classList.add("panes-root");
    const theme = document.querySelector('meta[name="theme-color"]');
    const before = theme?.getAttribute("content");
    theme?.setAttribute("content", "#1a1813");
    return () => {
      document.documentElement.classList.remove("panes-root");
      if (before) theme?.setAttribute("content", before);
    };
  }, []);

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
        label: `Go to ${p.id === "hello" ? "hello" : lowerFirst(p.title)}`,
        kind: "pane",
        run: () => focusPane(p.id, { focusTitle: true }),
      })),
      ...(phone
        ? []
        : [
            {
              id: "monocle",
              label: monocle ? "Show all panes" : "Show only this pane",
              kind: "layout",
              run: () => toggleMonocle(),
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
      { id: "ball", label: "Throw the ball for Truffle", kind: "play", run: () => focusPane("now") },
      { id: "pet", label: "Pet Truffle", kind: "play", run: () => focusPane("people") },
      { id: "truffle", label: "Call Truffle over", kind: "play", run: () => stage.callTruffle() },
      { id: "wave", label: "Wave hello", kind: "play", run: () => stage.wave() },
      { id: "hat", label: "Tip my hat", kind: "play", run: () => stage.tipHat() },
      { id: "sit", label: "Sit down for a bit", kind: "play", run: () => stage.sit() },
      { id: "sip", label: "Espresso break", kind: "play", run: () => focusPane("home") },
      { id: "wave-luibot", label: "Wave to luibot", kind: "play", run: () => wave("luibot") },
      { id: "wave-luibuilder", label: "Wave to luibuilder", kind: "play", run: () => wave("luibuilder") },
      { id: "1070", label: "Episode 1070", kind: "play", run: () => stage.cheer() },
    ],
    [monocle, phone, focusPane, toggleMonocle, stage, wave],
  );

  const pane = PANES.find((p) => p.id === focused);
  const truffleState = scene.truffle.pushing ? "bringing the ball back" : truffleWords[scene.truffle.pose];

  // The coffee corner's state follows his beats: brewing while his finger is
  // on the button, a full cup waiting, empty from the frame the cup is in his
  // hand (`grab` f2; the `reach` fallback starts on that frame), back on the
  // tray when the return reaches the frames that draw the cup there.
  const cupInHand = scene.justin.pose !== "grab" || (scene.justin.frame ?? 0) >= 2;
  const coffeeAction =
    { press: "idle", brew: "brew", ready: "ready", grab: cupInHand ? "empty" : "ready", drink: "empty", return: cupInHand ? "empty" : "idle" }[flag] ??
    "idle";

  const cowAction = useAmbient(cow, ["tail", "graze", "tail"], 1500, { min: 7000, max: 12000 });
  const henAction = useAmbient(chicken, ["peck"], 4000, { min: 6000, max: 11000 });
  const sheepAction = useAmbient(sheep, sheep ? Object.keys(sheep.actions).filter((a) => a !== "idle" && a !== "walk") : [], 2500);

  // The open pane's detail level. It leads with the same hook its fold shows,
  // set large, then the quieter line, then everything else smaller.
  const detail = {
    hello: (
      <div className="pn__flow">
        <div>
          <h1 className="pn__h1">{sections.intro.title}</h1>
          <p className="pn__lead">{sections.intro.hook}</p>
          <p className="pn__more">{sections.intro.more}</p>
        </div>
        <div className="pn__hello-body">
          <div className="pn__beats">
            {intro.map((paragraph, i) => (
              <div className="pn__beat" key={i}>
                <span className="pn__mono">{String(i + 1).padStart(2, "0")}</span>
                <Prose paragraph={paragraph} />
              </div>
            ))}
          </div>
          <figure className="pn__photo">
            <img
              src="/images/justin-girlfriend-dog.jpeg"
              alt="Justin and his girlfriend taking a selfie with a sleepy dog"
            />
            <figcaption className="pn__label">the three of us</figcaption>
          </figure>
        </div>
        <div className="pn__facts-row">
          <dl className="pn__facts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="pn__label">{fact.label.toLowerCase()}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          <div className="pn__facts-links">
            <a className="pn__link" href="https://github.com/jlui17" target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
            <a className="pn__link" href="https://www.linkedin.com/in/jlui17" target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
          </div>
        </div>
      </div>
    ),
    people: (
      <div className="pn__people">
        {people.map((person) => (
          <Card
            key={person.name}
            name={person.name}
            tag={person.tag}
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
      <div className="pn__agents">
        {agents.map((agent, i) => (
          <Agent key={agent.name} agent={agent} offsetMs={i * 2100} pointAt={i === 1 ? ideaAt : undefined} />
        ))}
      </div>
    ),
    someday: (
      <div className="pn__flow pn__chapters">
        {someday.map((entry, i) => (
          <section className={`pn__chapter${i === someday.length - 1 ? " pn__chapter--farm" : ""}`} key={entry.tag}>
            <div className="pn__chapter-head">
              <span className="pn__mono">{String(i + 1).padStart(2, "0")}</span>
              <Label>{entry.tag}</Label>
            </div>
            <h3>{entry.heading}</h3>
            <p>{entry.body}</p>
            {i === someday.length - 1 && (
              <div className="pn__farm" aria-hidden="true">
                {sheep && (
                  <span className="pn__farm-sheep">
                    <Sprite character="sheep" action={sheepAction} scale={1} />
                  </span>
                )}
              </div>
            )}
          </section>
        ))}
      </div>
    ),
    now: (
      <div className="pn__flow">
        <div>
          <div className="pn__status-head">
            <Label>status</Label>
            <Label>updated {status.updated}</Label>
          </div>
          <div className="pn__status-rows">
            {status.entries.map((entry) => (
              <div key={entry.label}>
                <Label>{entry.label.toLowerCase()}</Label>
                <strong>{entry.value}</strong>
                <span>{entry.detail}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="pn__now">
          <Label>what I&rsquo;m up to</Label>
          <ul>
            {now.map((item, i) => (
              <li key={item}>
                <span className="pn__mono">{String(i + 1).padStart(2, "0")}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
    home: (
      <div className="pn__flow pn__bands">
        {home.map((entry, i) => (
          <section className={`pn__band${/shoe/i.test(entry.tag) ? " pn__band--shoes" : ""}`} key={entry.tag}>
            <div className="pn__chapter-head">
              <span className="pn__mono">{String(i + 1).padStart(2, "0")}</span>
              <Label>{entry.tag}</Label>
            </div>
            <h3>{entry.heading}</h3>
            <p>{entry.body}</p>
            {/shoe/i.test(entry.tag) && shoeRack && (
              <div className="pn__shelf" aria-hidden="true">
                <span className="pn__shelf-rack">
                  <Sprite character="shoeRack" action="idle" scale={1} />
                </span>
              </div>
            )}
          </section>
        ))}
      </div>
    ),
    built: (
      <ul className="pn__projects">
        {projects.map((project) => (
          <li className="pn__project" key={project.title}>
            <div className="pn__project-head">
              <a className="pn__project-title" href={project.href} target="_blank" rel="noreferrer">
                {project.title}
              </a>
              <Label>{project.tag}</Label>
            </div>
            <p className="pn__project-kicker">{project.kicker}</p>
            <p className="pn__project-story">{project.story}</p>
          </li>
        ))}
      </ul>
    ),
  };

  const robotAction = (name) => (robotBeat === name ? "wave" : "idle");

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
          aria-label="Open the command palette"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <circle cx="7" cy="7" r="4.6" />
            <path d="M10.5 10.5 14 14" strokeLinecap="round" />
          </svg>
          <span className="pn__palette-button-text">Search or run a command</span>
          <span className="pn__kbd" aria-hidden="true">
            ⌘K
          </span>
        </button>
        <div className="pn__title-right">
          <span className="pn__hint">
            <b>h j k l</b> move
          </span>
          <span className="pn__hint">
            <b>z</b> {monocle ? "all panes" : "only this"}
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
                data-pane-key
                aria-expanded="true"
                onClick={() => (phone ? setOpen(false) : toggleMonocle())}
              >
                <span className="pn__dot" aria-hidden="true" />
                <span className="pn__pane-index" aria-hidden="true">
                  {focusedIndex + 1}
                </span>
                {pane.title}
                <Chevron open />
              </button>
              {!phone && (
                <button
                  type="button"
                  className="pn__zoom"
                  aria-label={monocle ? "Show all panes" : "Show only this pane"}
                  onClick={toggleMonocle}
                >
                  {monocle ? "all panes" : "only this"}
                </button>
              )}
            </div>
            <div className="pn__pane-body" ref={bodyRef}>
              {pane.id !== "hello" && (
                <>
                  <p className="pn__lead">{pane.hook}</p>
                  <p className="pn__more">{pane.more}</p>
                </>
              )}
              {detail[pane.id]}
            </div>
          </article>
        )}

        {showStack && (
          <nav className="pn__stack" aria-label="All panes">
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

      {/* The lane: one stretch per pane, each with its residents at home all
          the time (the shoe rack, Truffle, the robots, the farm, the ball,
          the coffee corner, the desk) and its own small scene when Justin
          arrives. On a
          phone the lane is one stretch wide and shows the focused pane's.
          Sprites are decoration with a pointer bonus: a click on Justin tips
          his hat, on Truffle pets her, on the ball throws it; every one of
          these is also a palette command. Drawn back to front: props, Justin,
          the ball, Truffle, so the dog runs past in front of him, except that
          he is painted on top while he pets her lying down. */}
      <div className="pn__stage" aria-hidden="true">
        {lane.map((s) => (
          <span key={s.id} className="pn__stretch" data-stretch={s.id} style={{ left: s.left, width: s.right - s.left }}>
            {s.residents.rack !== undefined && (
              <span className="pn__prop" data-prop="shoeRack" data-action="idle" style={{ left: s.residents.rack - s.left }}>
                <Sprite character="shoeRack" action="idle" scale={1} />
              </span>
            )}
            {s.residents.luibot !== undefined && (
              <span className="pn__prop" data-prop="luibot" data-action={robotAction("luibot")} style={{ left: s.residents.luibot - s.left - 14 }}>
                <Sprite character="luibot" action={robotAction("luibot")} scale={1} />
              </span>
            )}
            {s.residents.luibuilder !== undefined && (
              <span className="pn__prop" data-prop="luibuilder" data-action={robotAction("luibuilder")} style={{ left: s.residents.luibuilder - s.left - 15 }}>
                <Sprite character="luibuilder" action={robotAction("luibuilder")} scale={1} />
              </span>
            )}
            {s.residents.cow !== undefined && (
              <span className="pn__prop" data-prop="cow" data-action={cowAction} style={{ left: s.residents.cow - s.left }}>
                <Sprite character="cow" action={cowAction} scale={1} />
              </span>
            )}
            {s.residents.hen !== undefined && (
              <span className="pn__prop" data-prop="chicken" data-action={henAction} style={{ left: s.residents.hen - s.left }}>
                <Sprite character="chicken" action={henAction} scale={1} flip />
              </span>
            )}
            {s.residents.coffee !== undefined && (
              <span className="pn__prop" data-prop="coffee" data-action={coffeeAction} style={{ left: s.residents.coffee - s.left }}>
                <Sprite character="coffee" action={coffeeAction} scale={1} />
              </span>
            )}
            {s.residents.desk !== undefined && !(scene.justin.pose === "type" && Math.abs(scene.justin.cx - s.station) < 2) && (
              <span className="pn__prop" data-prop="desk" data-action="idle" style={{ left: s.residents.desk - s.left }}>
                <Sprite character="desk" action="idle" scale={1} />
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
            outfit={outfit}
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
            onClick={() => stage.throwBall()}
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

      <footer className="pn__statusbar">
        <nav className="pn__segments" aria-label="Panes">
          {PANES.map((p, i) => (
            <button
              key={p.id}
              ref={(el) => {
                segmentRefs.current[p.id] = el;
              }}
              type="button"
              className="pn__segment"
              data-pane-key
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
