import { useEffect, useState } from "react";
import justin, { desk } from "./justin.js";
import truffle from "./truffle.js";
import luibot from "./luibot.js";
import luibuilder from "./luibuilder.js";
import { coffee, shoeRack, chicken, cow, sheep } from "./props.js";

export const characters = { justin, truffle, luibot, luibuilder, desk, coffee, shoeRack, chicken, cow, sheep };

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The outer outline is the ink within 2 cells of empty canvas. On a dark page
// the ink is the colour of the ground, so the outline vanishes and parts float;
// a dark design sets --sprite-outline (a soft brown just lighter than its
// ground) and only the outer outline takes it. Interior lines, eyes and noses
// stay ink. Unset, the outline is the ink, so a light page is unchanged.
function isOuterOutline(rows, palette, x, y) {
  if (palette[rows[y][x]] !== palette.k) return false;
  for (let dy = -2; dy <= 2; dy += 1)
    for (let dx = -2; dx <= 2; dx += 1) if (!palette[rows[y + dy]?.[x + dx]]) return true;
  return false;
}

// Each horizontal run of one colour in a row becomes a single rect: same pixels
// as one rect per pixel, a quarter of the elements or fewer.
function runs(rows, y, palette) {
  const row = rows[y];
  const fillAt = (x) =>
    isOuterOutline(rows, palette, x, y) ? `var(--sprite-outline, ${palette.k})` : palette[row[x]];
  const out = [];
  for (let x = 0; x < row.length; ) {
    const fill = fillAt(x);
    let end = x + 1;
    while (end < row.length && fillAt(end) === fill) end += 1;
    if (fill) out.push({ x, width: end - x, fill });
    x = end;
  }
  return out;
}

// <Sprite character="justin" action="walk" outfit="overshirt" scale={3} flip />
// SVG rects on a 1-unit grid, so it stays sharp at any integer scale. Pass
// `frame` to pin a single frame (no animation); otherwise multi-frame actions
// cycle at the action's interval, except under prefers-reduced-motion. An
// action may give `durations` (ms per frame) instead, so a blink can hold the
// eyes open for seconds and shut for a tenth of one.
export function Sprite({ character, action, outfit, scale = 3, flip = false, frame }) {
  const sheet = characters[character];
  const { frames, interval = 1200, durations } = sheet.actions[action];
  const palette = { ...sheet.palette, ...sheet.outfits?.[outfit] };
  // The tick remembers which frames it counts, so the first paint after an
  // action change shows the new action's frame 0, not the old tick.
  const [tick, setTick] = useState({ frames, t: 0 });

  useEffect(() => {
    if (frame !== undefined || frames.length < 2 || reducedMotion()) return undefined;
    let t = 0;
    let id;
    const advance = () => {
      id = setTimeout(() => {
        t += 1;
        setTick({ frames, t });
        advance();
      }, durations?.[t % frames.length] ?? interval);
    };
    advance();
    return () => clearTimeout(id);
  }, [frames, interval, durations, frame]);

  const rows = frames[(frame ?? (tick.frames === frames ? tick.t : 0)) % frames.length];
  const width = rows[0].length;
  const height = rows.length;

  // The flip is a transform on a group inside the svg, not a CSS transform on
  // the svg itself, so a caller's own `transform` on the element (centring,
  // say) is not silently replaced.
  return (
    <svg
      width={width * scale}
      height={height * scale}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`${character} ${action}`}
    >
      <g transform={flip ? `scale(-1 1) translate(-${width} 0)` : undefined}>
        {rows.flatMap((row, y) =>
          runs(rows, y, palette).map(({ x, width, fill }) => (
            <rect key={`${x},${y}`} x={x} y={y} width={width} height="1" style={{ fill }} />
          )),
        )}
      </g>
    </svg>
  );
}
