import { useEffect, useState } from "react";
import justin from "./justin.js";
import truffle from "./truffle.js";
import luibot from "./luibot.js";
import luibuilder from "./luibuilder.js";

export const characters = { justin, truffle, luibot, luibuilder };

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Each horizontal run of one colour in a row becomes a single rect: same pixels
// as one rect per pixel, a quarter of the elements or fewer.
function runs(row, palette) {
  const out = [];
  for (let x = 0; x < row.length; ) {
    const fill = palette[row[x]];
    let end = x + 1;
    while (end < row.length && row[end] === row[x]) end += 1;
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
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick(0);
    if (frame !== undefined || frames.length < 2 || reducedMotion()) return undefined;
    let t = 0;
    let id;
    const advance = () => {
      id = setTimeout(() => {
        t += 1;
        setTick(t);
        advance();
      }, durations?.[t % frames.length] ?? interval);
    };
    advance();
    return () => clearTimeout(id);
  }, [frames, interval, durations, frame]);

  const rows = frames[(frame ?? tick) % frames.length];
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
          runs(row, palette).map(({ x, width, fill }) => (
            <rect key={`${x},${y}`} x={x} y={y} width={width} height="1" fill={fill} />
          )),
        )}
      </g>
    </svg>
  );
}
