import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Sprite } from "../../sprites/Sprite.jsx";
import * as props from "./props.js";

// The room is 192x72 room pixels; the floor starts at row 64, so anything that
// stands has its last row at 63. Every object is placed here, in room pixels.
const WIDTH = 192;
const HEIGHT = 72;
const FLOOR = 64;
const STAND_Y = FLOOR - 31; // Justin's standing sprites are 31 tall

const WINDOW = { x: 10, y: 6 };
const BED = { x: 2, y: 40 };
const LAMP = { x: 55, y: 26 };
const COUNTER = { x: 64, y: 46 };
const GRINDER = { x: 66, y: 32 };
const MACHINE = { x: 86, y: 34 };
const PICTURE = { x: 72, y: 12 };
const DESK = { x: 108, y: 48 };
const LUIBUILDER = { x: 110, y: 36 };
const LUIBOT = { x: 111, y: 22 };
const LAPTOP = { x: 121, y: 39 };
const RACKET = { x: 155, y: 40 };
const VOLLEYBALL = { x: 163, y: 56 };
const DOOR = { x: 173, y: 14 };
const BACKPACK = { x: 176, y: 20 };
const TRUFFLE = { x: 36, y: 40 };

// Where Justin stands for each spot (his sprite's left edge), and where his
// sitting and sleeping sprites go relative to the bed spot so he lands on the mattress.
const SPOT_X = { bed: 12, counter: 70, desk: 134, door: 172 };
const POSE_OFFSET = { sit: [-6, 24], sleep: [-8, 36] };
const SPEED = 24; // room pixels per second: a stroll, not a hurry

const WALL = { day: "#f4e6d0", evening: "#ead5b5", night: "#f4e6d0" };
const SKY = {
  dawn: ["#e6c3a2", "#9fa3a6"],
  day: ["#b7d0e0", "#8fa2b3"],
  golden: ["#e8b27c", "#8a7a86"],
  dusk: ["#8c7fa3", "#5c5674"],
  night: ["#2e3852", "#232a3f"],
};

function phaseOf(hour) {
  if (hour >= 6 && hour <= 16) return "day";
  if (hour >= 17 && hour <= 20) return "evening";
  return "night";
}

const skyOf = (hour) => {
  if (hour === 6) return SKY.dawn;
  if (hour <= 16 && hour > 6) return SKY.day;
  if (hour <= 18 && hour >= 17) return SKY.golden;
  if (hour <= 20 && hour >= 19) return SKY.dusk;
  return SKY.night;
};

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function useTick(interval, count, running) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setTick((t) => (t + 1) % count), interval);
    return () => clearInterval(id);
  }, [interval, count, running]);
  return tick;
}

// Rows of characters to rects, merging runs of one colour into a single rect.
function Pixels({ rows, x = 0, y = 0, swap }) {
  const colours = swap ? { ...props.palette, ...swap } : props.palette;
  const rects = [];
  rows.forEach((row, ry) => {
    let start = 0;
    for (let i = 1; i <= row.length; i++) {
      if (i === row.length || row[i] !== row[start]) {
        const fill = colours[row[start]];
        if (fill) {
          rects.push(
            <rect key={`${start},${ry}`} x={x + start} y={y + ry} width={i - start} height={1} fill={fill} />,
          );
        }
        start = i;
      }
    }
  });
  return rects;
}

// A sprite placed in room pixels. Flipping mirrors around the sprite's own box.
function Character({ x, y, width, flip = false, ...sprite }) {
  const transform = flip ? `translate(${x + width} ${y}) scale(-1 1)` : `translate(${x} ${y})`;
  return (
    <g transform={transform}>
      <Sprite scale={1} {...sprite} />
    </g>
  );
}

// The four panes of the window, relative to WINDOW.
const PANES = [
  [2, 1, 13, 11],
  [17, 1, 13, 11],
  [2, 14, 13, 10],
  [17, 14, 13, 10],
];
const STARS = [
  [5, 3],
  [11, 7],
  [20, 4],
  [26, 9],
];

function Sky({ hour, stars }) {
  const [sky, hills] = skyOf(hour);
  return (
    <>
      {PANES.map(([px, py, w, h]) => (
        <rect key={`${px},${py}`} x={WINDOW.x + px} y={WINDOW.y + py} width={w} height={h} fill={sky} />
      ))}
      {PANES.slice(2).map(([px, , w]) => (
        <rect key={`h${px}`} x={WINDOW.x + px} y={WINDOW.y + 21} width={w} height={3} fill={hills} />
      ))}
      {stars &&
        STARS.map(([sx, sy]) => (
          <rect
            key={`${sx},${sy}`}
            x={WINDOW.x + sx}
            y={WINDOW.y + sy}
            width={1}
            height={1}
            fill="#efe3cf"
            opacity={0.85}
          />
        ))}
    </>
  );
}

// Daylight through the window, slanting right onto the floor, one row at a time
// so its edges step at room-pixel size like everything else.
function Sunbeam() {
  const rows = [];
  for (let y = WINDOW.y + 27; y < HEIGHT - 1; y++) {
    const drift = Math.floor((y - WINDOW.y - 27) * 0.6);
    rows.push(
      <rect key={y} x={WINDOW.x + 2 + drift} y={y} width={28} height={1} fill="#fff2cc" opacity={0.26} />,
    );
  }
  return rows;
}

// Lamp light: two soft rings round the shade and a cone that widens toward the floor.
function LampGlow() {
  const rows = [];
  for (let y = LAMP.y + 7; y < HEIGHT - 1; y++) {
    const half = 5 + Math.floor((y - LAMP.y - 7) * 0.35);
    rows.push(
      <rect key={y} x={LAMP.x + 4 - half} y={y} width={half * 2} height={1} fill="#ffd98a" opacity={0.08} />,
    );
  }
  return (
    <>
      <rect x={LAMP.x - 5} y={LAMP.y - 4} width={18} height={14} fill="#ffd98a" opacity={0.08} />
      <rect x={LAMP.x - 2} y={LAMP.y - 2} width={12} height={10} fill="#ffd98a" opacity={0.12} />
      {rows}
    </>
  );
}

const FLOOR_SEAMS = [24, 48, 72, 96, 120, 144, 168];

function Floor() {
  return (
    <>
      <rect x={0} y={FLOOR - 2} width={WIDTH} height={2} fill="#e3d2b6" />
      <rect x={0} y={FLOOR} width={WIDTH} height={HEIGHT - FLOOR} fill="#c9a67b" />
      <rect x={0} y={FLOOR} width={WIDTH} height={1} fill="#a9865a" />
      <rect x={0} y={FLOOR + 4} width={WIDTH} height={1} fill="#b8915f" />
      {FLOOR_SEAMS.map((x) => (
        <rect key={x} x={x} y={FLOOR + 1} width={1} height={3} fill="#b8915f" />
      ))}
      {FLOOR_SEAMS.map((x) => (
        <rect key={x} x={x + 12} y={FLOOR + 5} width={1} height={3} fill="#b8915f" />
      ))}
    </>
  );
}

const Furniture = memo(function Furniture({ lampOn, laptopAwake }) {
  return (
    <>
      <Pixels rows={props.bed} {...BED} />
      <Pixels rows={props.lamp} {...LAMP} swap={lampOn ? undefined : { y: "#efe3cf" }} />
      <Pixels rows={props.counter} {...COUNTER} />
      <Pixels rows={props.grinder} {...GRINDER} />
      <Pixels rows={props.machine} {...MACHINE} />
      <Pixels rows={props.picture} {...PICTURE} />
      <Pixels rows={props.desk} {...DESK} />
      <Pixels rows={props.laptop} {...LAPTOP} swap={laptopAwake ? undefined : { e: "#3b3f48" }} />
      <Pixels rows={props.racket} {...RACKET} />
      <Pixels rows={props.volleyball} {...VOLLEYBALL} />
      <Pixels rows={props.door} {...DOOR} />
      <Pixels rows={props.backpack} {...BACKPACK} />
    </>
  );
});

// Three frames of steam off the wand, each dot a row higher than the last frame.
const STEAM = [0, 1, 2].map((k) =>
  [
    [1, 9],
    [0, 6],
    [1, 3],
    [2, 0],
  ].map(([dx, dy]) => [dx, (((dy - k * 3) % 12) + 12) % 12]),
);

function Steam({ frame }) {
  return STEAM[frame].map(([dx, dy]) => (
    <rect
      key={`${dx},${dy}`}
      x={MACHINE.x + 12 + dx}
      y={MACHINE.y - 5 + dy}
      width={1}
      height={1}
      fill="#ffffff"
      opacity={0.45 + dy * 0.05}
    />
  ));
}

// Justin walks along the floor to `target` ("spot:pose"), then holds the pose.
// His x lives in a ref and is written straight to the group's transform, so the
// walk never re-renders the room. With reduced motion he simply appears there.
function useJustin(target, reducedMotion) {
  const [homeSpot, homePose] = target.split(":");
  const pos = useRef(SPOT_X[homeSpot]);
  const group = useRef(null);
  const [figure, setFigure] = useState({ action: homePose, at: homeSpot, flip: false });

  useLayoutEffect(() => {
    group.current.setAttribute("transform", `translate(${Math.round(pos.current)} 0)`);
  });

  useEffect(() => {
    const [spot, pose] = target.split(":");
    const goal = SPOT_X[spot];
    const arrive = () => setFigure({ action: pose, at: spot, flip: false });
    if (reducedMotion || Math.abs(pos.current - goal) < 0.5) {
      pos.current = goal;
      arrive();
      return undefined;
    }
    // Position is a function of elapsed time, so a tab that comes back from the
    // background finds him already there rather than resuming mid-stride.
    const from = pos.current;
    const dir = Math.sign(goal - from);
    const duration = (Math.abs(goal - from) / SPEED) * 1000;
    const started = performance.now();
    setFigure({ action: "walk", at: null, flip: dir < 0 });
    let raf = requestAnimationFrame(function step(now) {
      const t = Math.min((now - started) / duration, 1);
      pos.current = from + (goal - from) * t;
      group.current.setAttribute("transform", `translate(${Math.round(pos.current)} 0)`);
      if (t === 1) {
        arrive();
        return;
      }
      raf = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf);
  }, [target, reducedMotion]);

  return { figure, group };
}

const STANDING = ["idle", "sip", "hat", "arms-up"];
const BEDTIME = "bed:sleep";

// Where he is when nobody has pointed at anything yet: the room tells the time.
function homeFor(hour) {
  const phase = phaseOf(hour);
  if (phase === "night") return BEDTIME;
  if (phase === "evening") return "bed:sit";
  return hour <= 10 ? "counter:sip" : "desk:idle";
}

function readout(hour, asleep) {
  const phase = phaseOf(hour);
  if (phase === "night") return asleep ? "Lights are low. He's asleep." : "Lights are low. You woke him.";
  if (phase === "evening") return "The lamp's on.";
  if (hour <= 10) return "Coffee's on.";
  return "The light's coming in.";
}

export function Room({ hour, clock, target, gesture, truffleHover, scale, onTruffleHover, hint }) {
  const phase = phaseOf(hour);
  const night = phase === "night";
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // At night he goes back to bed a few seconds after the visitor lets go of him.
  const [goal, setGoal] = useState(() => target ?? homeFor(hour));
  useEffect(() => {
    if (target) {
      setGoal(target);
      return undefined;
    }
    if (!night) return undefined;
    const id = setTimeout(() => setGoal(BEDTIME), 4000);
    return () => clearTimeout(id);
  }, [target, night]);

  const { figure, group } = useJustin(goal, reducedMotion);
  const steamFrame = useTick(700, STEAM.length, phase === "day" && hour <= 10 && !reducedMotion);

  const asleep = figure.action === "sleep";
  const action = gesture && STANDING.includes(figure.action) ? gesture : figure.action;
  const [dx, dy] = POSE_OFFSET[action] ?? [0, STAND_Y];
  const outfit = phase === "day" ? "overshirt" : "hoodie";
  const lampOn = phase === "evening" || (night && !asleep);
  const atDesk = figure.at === "desk";
  const truffleAlert = truffleHover || (figure.at === "bed" && figure.action === "sit");

  return (
    <>
      <svg
        className="room__scene"
        width={WIDTH * scale}
        height={HEIGHT * scale}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        shapeRendering="crispEdges"
        role="img"
        aria-label={`A pixel-art drawing of Justin's room${asleep ? ", with Justin asleep in bed" : ""}. Truffle is asleep on the bed.`}
      >
        <rect x={0} y={0} width={WIDTH} height={FLOOR} fill={WALL[phase]} />
        <Floor />
        <Sky hour={hour} />
        <Pixels rows={props.window} {...WINDOW} />
        {phase === "day" && <Sunbeam />}
        <Furniture lampOn={lampOn} laptopAwake={atDesk} />
        {atDesk && (
          <rect
            x={LAPTOP.x + 3}
            y={LAPTOP.y + 5}
            width={1}
            height={1}
            className="room__cursor"
            fill="#efe3cf"
          />
        )}
        <Character
          character="luibuilder"
          action="idle"
          x={LUIBUILDER.x}
          y={LUIBUILDER.y - (atDesk ? 1 : 0)}
        />
        <Character character="luibot" action="idle" x={LUIBOT.x} y={LUIBOT.y - (atDesk ? 2 : 0)} />
        <g ref={group}>
          <Character
            character="justin"
            action={action}
            outfit={outfit}
            x={dx}
            y={dy}
            width={18}
            flip={figure.flip}
          />
          {asleep && <Pixels rows={props.blanketOver} x={5} y={41} />}
        </g>
        <Character character="truffle" action={truffleAlert ? "ear" : "sleep"} {...TRUFFLE} />
        <rect
          x={TRUFFLE.x - 2}
          y={TRUFFLE.y - 4}
          width={22}
          height={14}
          fill="transparent"
          onPointerEnter={() => onTruffleHover(true)}
          onPointerLeave={() => onTruffleHover(false)}
        />
        {phase === "day" && hour <= 10 && <Steam frame={steamFrame} />}
        {night && (
          <>
            <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="#2b2540" opacity={0.52} />
            <Sky hour={hour} stars />
          </>
        )}
        {lampOn && <LampGlow />}
        <rect x={0} y={0} width={WIDTH} height={1} fill="#33291f" />
        <rect x={0} y={HEIGHT - 1} width={WIDTH} height={1} fill="#33291f" />
        <rect x={0} y={0} width={1} height={HEIGHT} fill="#33291f" />
        <rect x={WIDTH - 1} y={0} width={1} height={HEIGHT} fill="#33291f" />
      </svg>
      <p className="room-page__readout">
        <span>
          {clock} in San Francisco. {readout(hour, asleep)}
        </span>
        <span className="room-page__small">{hint}</span>
      </p>
    </>
  );
}
