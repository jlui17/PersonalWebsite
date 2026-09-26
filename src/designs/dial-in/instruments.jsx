import { useEffect, useRef, useState } from "react";
import { Sprite, characters } from "../../sprites/Sprite.jsx";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// The Encore's collar has forty settings, 1 finest. The shot time under each
// setting is made up for the dial: finer runs slower, coarser runs faster, and
// a five-step band in the middle lands in the 26–30 s window that reads as the
// sweet spot. Nothing here is Justin's actual recipe.
const GRIND_MIN = 1;
const GRIND_MAX = 40;
const shotSeconds = (grind) => Math.round(12 + (GRIND_MAX - grind) * 0.85);
const shotVerdict = (seconds) =>
  seconds < 26 ? "sour" : seconds <= 30 ? "sweet" : "bitter";

const verdictCopy = {
  sour: "sour, it ran fast",
  sweet: "sweet spot",
  bitter: "bitter, it choked",
};

const KNOB = 128;
const KNOB_SWEEP = 270;
const grindAngle = (grind) =>
  -KNOB_SWEEP / 2 + ((grind - GRIND_MIN) / (GRIND_MAX - GRIND_MIN)) * KNOB_SWEEP;
const polar = (radius, degrees) => {
  const rad = ((degrees - 90) * Math.PI) / 180;
  return [KNOB / 2 + radius * Math.cos(rad), KNOB / 2 + radius * Math.sin(rad)];
};

// Turning by hand: one model per drag, chosen by where the press lands, so the
// same gesture gives the same result at any pointer rate. Pressed on the face
// outside GRIP_PX of the centre: the knob turns with the hand, one setting per
// tick (270° / 39). Each pointer move is walked in PIECE_PX steps along its
// path, so the turn depends on the path and not on how often the pointer
// reports; the part of a path inside GRIP_PX is a pass through the middle, not
// a turn, and adds nothing. Pressed on the middle: a straight drag, one setting
// per STEP_PX sideways, right for coarser, the way the numerals run 1 to 40
// across the dial; up and down do nothing.
const STEP_DEG = KNOB_SWEEP / (GRIND_MAX - GRIND_MIN);
const STEP_PX = 9;
const GRIP_PX = 16;
const PIECE_PX = 4;

// Degrees swept around the centre along the straight path from a to b, in
// steps of the knob, skipping the pieces that pass inside the grip.
function sweptSteps(ax, ay, bx, by) {
  const pieces = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / PIECE_PX));
  let steps = 0;
  for (let i = 1; i <= pieces; i += 1) {
    const [px, py] = [ax + ((bx - ax) * (i - 1)) / pieces, ay + ((by - ay) * (i - 1)) / pieces];
    const [qx, qy] = [ax + ((bx - ax) * i) / pieces, ay + ((by - ay) * i) / pieces];
    if (Math.hypot(px, py) < GRIP_PX || Math.hypot(qx, qy) < GRIP_PX) continue;
    let swept = ((Math.atan2(qy, qx) - Math.atan2(py, px)) * 180) / Math.PI;
    if (swept > 180) swept -= 360;
    if (swept < -180) swept += 360;
    steps += swept / STEP_DEG;
  }
  return steps;
}
// How long the dial has to sit still in the band before it counts as found.
const REST_MS = 400;

// Grind settings whose shot lands in the sweet band, for the amber arc.
const sweetGrinds = Array.from({ length: GRIND_MAX }, (_, i) => i + GRIND_MIN).filter(
  (g) => shotVerdict(shotSeconds(g)) === "sweet",
);

function sweetArc() {
  const from = grindAngle(sweetGrinds[0]) - 3;
  const to = grindAngle(sweetGrinds[sweetGrinds.length - 1]) + 3;
  const [x1, y1] = polar(54, from);
  const [x2, y2] = polar(54, to);
  return `M ${x1} ${y1} A 54 54 0 0 1 ${x2} ${y2}`;
}

// The grinder collar: a knob with a pointer inside a ring of forty ticks. The
// pointer turns it (grab, then drag round or in a line; a press on its own
// changes nothing); the range input underneath is for the keyboard and screen
// readers only. Justin stands beside it: idle while it is off, sipping once the
// dial has rested in the band, both arms up the first time the reader finds it.
export function GrindDial({ outfit, cheering }) {
  const [grind, setGrind] = useState(30);
  const [turned, setTurned] = useState(false);
  const [held, setHeld] = useState(false);
  const [rested, setRested] = useState(false);
  const [found, setFound] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [cupDown, setCupDown] = useState(true);
  const knobRef = useRef(null);
  // The drag in progress: its model, where the pointer was, the setting at the
  // press, and how far it has turned since, in settings (fractional).
  const drag = useRef(null);

  const seconds = shotSeconds(grind);
  const verdict = shotVerdict(seconds);
  const sweet = verdict === "sweet";

  const turnTo = (value) => {
    setGrind(clamp(value, GRIND_MIN, GRIND_MAX));
    setTurned(true);
  };

  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    knobRef.current.setPointerCapture(event.pointerId);
    const box = knobRef.current.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const turning = Math.hypot(event.clientX - cx, event.clientY - cy) >= GRIP_PX;
    drag.current = { id: event.pointerId, turning, cx, cy, x: event.clientX, y: event.clientY, from: grind, spin: 0 };
    setHeld(true);
  };

  const onPointerMove = (event) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    if (d.turning) {
      d.spin += sweptSteps(d.x - d.cx, d.y - d.cy, event.clientX - d.cx, event.clientY - d.cy);
      d.spin = clamp(d.spin, GRIND_MIN - d.from - 0.49, GRIND_MAX - d.from + 0.49);
      d.x = event.clientX;
      d.y = event.clientY;
    } else {
      d.spin = (event.clientX - d.x) / STEP_PX;
    }
    const next = clamp(Math.round(d.from + d.spin), GRIND_MIN, GRIND_MAX);
    if (next !== grind) turnTo(next);
  };

  const onPointerUp = (event) => {
    if (!drag.current || drag.current.id !== event.pointerId) return;
    drag.current = null;
    setHeld(false);
  };

  const onKeyDown = (event) => {
    const page = { PageUp: 5, PageDown: -5 }[event.key];
    if (!page) return;
    event.preventDefault();
    turnTo(grind + page);
  };

  // The dial has to stay in the band a moment before he reacts; passing through
  // on the way somewhere else does not count, and moving within the band does
  // not reset him. Leaving the band ends whatever he was doing at once, so he
  // never cheers or sips beside a readout that says sour or bitter.
  useEffect(() => {
    if (!sweet) {
      setRested(false);
      setCelebrating(false);
      return undefined;
    }
    const id = setTimeout(() => setRested(true), REST_MS);
    return () => clearTimeout(id);
  }, [sweet]);

  useEffect(() => {
    if (!rested || found) return;
    setFound(true);
    setCelebrating(true);
  }, [rested, found]);

  useEffect(() => {
    if (!celebrating) return undefined;
    const id = setTimeout(() => setCelebrating(false), 1400);
    return () => clearTimeout(id);
  }, [celebrating]);

  const action = cheering || celebrating ? "arms-up" : rested ? "sip" : "idle";
  const sipping = action === "sip";

  useEffect(() => {
    if (!sipping || reducedMotion()) return undefined;
    const id = setInterval(() => setCupDown((down) => !down), 2400);
    return () => clearInterval(id);
  }, [sipping]);

  const ticks = Array.from({ length: GRIND_MAX }, (_, i) => i + GRIND_MIN);

  return (
    <div className="di-instrument di-grind">
      <div
        ref={knobRef}
        className={`di-knob${held ? " di-knob--held" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <input
          type="range"
          min={GRIND_MIN}
          max={GRIND_MAX}
          value={grind}
          onChange={(event) => turnTo(Number(event.target.value))}
          onKeyDown={onKeyDown}
          aria-label="Grind setting"
          aria-valuetext={`${grind} of ${GRIND_MAX}, about ${seconds} seconds, ${verdictCopy[verdict]}`}
        />
        <svg width={KNOB} height={KNOB} viewBox={`0 0 ${KNOB} ${KNOB}`} aria-hidden="true">
          {ticks.map((g) => {
            const angle = grindAngle(g);
            const major = g === GRIND_MIN || g % 10 === 0;
            const [x1, y1] = polar(major ? 50 : 53, angle);
            const [x2, y2] = polar(58, angle);
            return (
              <line
                key={g}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={major ? "di-knob__tick--major" : "di-knob__tick"}
              />
            );
          })}
          <path d={sweetArc()} className="di-knob__sweet" />
          {[GRIND_MIN, 10, 20, 30, GRIND_MAX].map((g) => {
            const [x, y] = polar(45 - 2, grindAngle(g));
            return (
              <text key={g} x={x} y={y} className="di-knob__numeral">
                {g}
              </text>
            );
          })}
          <circle cx={KNOB / 2} cy={KNOB / 2} r={36} className="di-knob__face" />
          <circle cx={KNOB / 2} cy={KNOB / 2} r={31} className="di-knob__knurl" />
          <line
            x1={KNOB / 2}
            y1={KNOB / 2 - 14}
            x2={KNOB / 2}
            y2={KNOB / 2 - 32}
            className="di-knob__pointer"
            transform={`rotate(${grindAngle(grind)} ${KNOB / 2} ${KNOB / 2})`}
          />
          <text
            x={KNOB / 2}
            y={KNOB - 10}
            className={`di-knob__hint${turned ? " di-knob__hint--gone" : ""}`}
          >
            turn me
          </text>
        </svg>
      </div>

      <dl className={`di-readout di-readout--${verdict}`}>
        <div>
          <dt className="di-label">grind</dt>
          <dd>{grind}</dd>
        </div>
        <div>
          <dt className="di-label">shot</dt>
          <dd>
            ~{seconds}
            <span className="di-readout__unit"> s</span>
          </dd>
        </div>
        <div>
          <dt className="di-label">tastes</dt>
          <dd className="di-readout__verdict">
            <span className="di-readout__mark" aria-hidden="true" />
            {verdictCopy[verdict]}
          </dd>
        </div>
      </dl>

      <span className="di-sprite di-grind__figure" aria-hidden="true">
        <Sprite
          character="justin"
          action={action}
          outfit={outfit}
          scale={1}
          frame={sipping ? Number(!cupDown) : undefined}
        />
        {rested && <span className="di-label di-grind__note">there it is.</span>}
      </span>
    </div>
  );
}

// The peek is read off the drawing. Two pixels of the walk sheet anchor it:
// the eye (the one eye-white pixel, above the mouth) and the front of his near
// arm (the ink line just behind the chest seam, the `P` pixel: once it clears,
// his shoulder is out). A column of the sprite is out from behind the wall once
// its scene x is past the wall's edge.
const walk = characters.justin.actions.walk;
const JUSTIN_W = walk.frames[0][0].length;
const JUSTIN_H = walk.frames[0].length;
const pixelIn = (rows, ink) => {
  for (let y = 0; y < rows.length; y += 1) {
    const x = rows[y].indexOf(ink);
    if (x >= 0) return { x, y };
  }
  throw new Error(`no ${ink} pixel in the frame`);
};
const armFront = (rows) => {
  const seam = pixelIn(rows, "P");
  return rows[seam.y].lastIndexOf("k", seam.x);
};
const walkEyes = walk.frames.map((rows) => pixelIn(rows, "w"));
const EYE_X = walkEyes[0].x;
const ARM_X = Math.min(...walk.frames.map(armFront));

const WALL_W = 64;
const PEEK_AIR = 8;
const PEEK_TRAVEL = JUSTIN_W + 44;

const peekVerdict = (out) =>
  out + EYE_X < JUSTIN_W ? "tucked" : out + ARM_X < JUSTIN_W ? "sweet" : "wide";

const peekCopy = {
  tucked: "still behind the wall",
  sweet: "just the angle, I see them first",
  wide: "too wide, everyone sees me",
};

// The wall, drawn to the sprites' rule: ink outline two wide on the edges that
// show (the top and the corner), one-wide joints inside, and it runs off the
// left of the scene so it reads as a wall, not a crate.
function PeekWall({ height }) {
  const courses = Math.floor((height - 2) / 12);
  const joints = [];
  for (let c = 0; c < courses; c += 1) {
    const top = 2 + c * 12;
    if (c > 0) joints.push(<rect key={`h${c}`} x={0} y={top} width={WALL_W - 2} height={1} />);
    const xs = c % 2 ? [WALL_W / 4, (WALL_W * 3) / 4] : [WALL_W / 2];
    xs.forEach((x) => joints.push(<rect key={`v${c}-${x}`} x={x} y={top + 1} width={1} height={11} />));
  }
  return (
    <svg
      className="di-peek__wall"
      width={WALL_W}
      height={height}
      viewBox={`0 0 ${WALL_W} ${height}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect className="di-peek__wall-face" x={0} y={0} width={WALL_W} height={height} />
      <g className="di-peek__wall-ink">
        <rect x={0} y={0} width={WALL_W} height={2} />
        <rect x={WALL_W - 2} y={0} width={2} height={height} />
        {joints}
      </g>
    </svg>
  );
}

// Top-down in the game, side-on here: a wall at the left, Justin behind it, and
// a slider that walks him out one pixel per step. His feet step with the
// slider on the sheet's stride, so dragging it reads as him moving, not
// sliding. A sight line runs from his eye once the eye can see past the corner.
export function PeekSlider({ outfit, cheering }) {
  // Starts with the brim, the nose and a shoe showing and the eye one pixel
  // short of the corner: a man hiding behind a wall, one step from seeing.
  const [out, setOut] = useState(JUSTIN_W - EYE_X - 1);
  const verdict = peekVerdict(out);
  const frame = out === 0 ? 0 : Math.floor(out / walk.stride) % walk.frames.length;
  const eye = walkEyes[frame];
  const left = WALL_W - JUSTIN_W + out;
  const wallHeight = JUSTIN_H + PEEK_AIR - 6;
  // He only cheers in the open: the arms-up frame is wider than the walk and
  // would poke through the wall.
  const cheer = cheering && verdict === "wide";

  return (
    <div className="di-instrument di-peek">
      <div className="di-peek__scene" style={{ height: JUSTIN_H + PEEK_AIR }}>
        <span className="di-sprite di-peek__figure" style={{ left }} aria-hidden="true">
          <Sprite
            character="justin"
            action={cheer ? "arms-up" : out === 0 ? "idle" : "walk"}
            outfit={outfit}
            scale={1}
            frame={cheer ? 0 : frame}
          />
        </span>
        {verdict !== "tucked" && (
          <span
            className={`di-peek__sight di-peek__sight--${verdict}`}
            style={{ left: left + eye.x + 2, bottom: JUSTIN_H - eye.y - 1 }}
          />
        )}
        <PeekWall height={wallHeight} />
      </div>

      <div className="di-peek__controls">
        <input
          type="range"
          className="di-range"
          min={0}
          max={PEEK_TRAVEL}
          value={out}
          onChange={(event) => setOut(Number(event.target.value))}
          aria-label="How far out from the corner"
          aria-valuetext={`${out} of ${PEEK_TRAVEL}, ${peekCopy[verdict]}`}
        />
        <dl className={`di-readout di-readout--${verdict}`}>
          <div>
            <dt className="di-label">swing</dt>
            <dd>{out}</dd>
          </div>
          <div>
            <dt className="di-label">result</dt>
            <dd className="di-readout__verdict">
              <span className="di-readout__mark" aria-hidden="true" />
              {peekCopy[verdict]}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

// His layers, in his words: a shirt, a patterned over-shirt, a hoodie on top.
// The sheet draws the first two as one outfit and the hoodie over them.
const stack = {
  overshirt: { worn: "shirt, over-shirt", hint: "put the hoodie on" },
  hoodie: { worn: "shirt, over-shirt, hoodie", hint: "take the hoodie off" },
};

// The masthead Justin is the wardrobe: click him and the hoodie goes on over
// everything, for every Justin on the page. The bubble says what he has on; a
// pen note over his hat invites the first click and goes once he has changed.
export function LayersFigure({ outfit, onChange, cheering }) {
  const [over, setOver] = useState(false);
  const [changed, setChanged] = useState(false);
  const { worn, hint } = stack[outfit];
  const hooded = outfit === "hoodie";

  return (
    <button
      type="button"
      className="di-sprite di-masthead__figure"
      aria-label={`Wearing ${worn}. Click to ${hint}.`}
      aria-pressed={hooded}
      onClick={() => {
        onChange(hooded ? "overshirt" : "hoodie");
        setChanged(true);
      }}
      onMouseEnter={() => setOver(true)}
      onMouseLeave={() => setOver(false)}
      onFocus={() => setOver(true)}
      onBlur={() => setOver(false)}
    >
      <Sprite character="justin" action={cheering ? "arms-up" : "idle"} outfit={outfit} scale={1} />
      {over ? (
        <span className="di-label di-bubble" aria-hidden="true">
          {worn}
          <br />
          <span className="di-bubble__aside">click to {hint}</span>
        </span>
      ) : (
        <span
          className={`di-label di-masthead__hint${changed ? " di-masthead__hint--gone" : ""}`}
          aria-hidden="true"
        >
          try my hoodie
        </span>
      )}
    </button>
  );
}
