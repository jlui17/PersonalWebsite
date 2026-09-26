// Stage props in the sprite format: rows of characters, one per pixel, drawn
// through one shared palette. Outline ink matches the sprites so a prop and a
// character read as one set. Sizes are in sprite pixels; the stage scales them.

const palette = {
  ".": null,
  k: "#33291f", // ink, same as the sprites
  W: "#8b6a4d", // wood
  w: "#a88562", // wood, lit edge
  M: "#efe3cf", // linen, paper, net tape
  Q: "#7b93b3", // blanket
  q: "#9fb1c9", // blanket fold
  S: "#c9c2b8", // brushed steel
  s: "#a39b91", // steel shade, dials
  o: "#4a2e1e", // espresso
  G: "#c5d4de", // glass
  B: "#a9c1d4", // lit screen
  b: "#5e7fa3", // awning stripe, ball panel (luibot's blue)
  Y: "#d9b25a", // straw, ball panel, lampshade
  r: "#6e3b2e", // hat band on the TV
  p: "#dccbb2", // plaster
};

// A table `width` pixels wide: top, two boards, a rail, four rows of leg.
// Anything set on it sits at dy 8.
const table = (width) => {
  const inner = width - 2;
  const legs = `.kWk${".".repeat(width - 8)}kWk.`;
  return [
    "k".repeat(width),
    `k${"w".repeat(inner)}k`,
    `k${"W".repeat(inner)}k`,
    "k".repeat(width),
    legs,
    legs,
    legs,
    legs,
  ];
};

// Bed frame with a headboard on the left. The mattress top is 5 rows above
// the ground, which is where the sleeping sprite's dy goes.
const bed = [
  "kkkk....................................",
  "kWwWk...................................",
  "kWwWk...................................",
  "kWwWk...................................",
  "kWwWk...................................",
  "kWwWk...................................",
  "kWwWk...................................",
  "kWwWk...................................",
  "kWwWk...................................",
  "kWwWk...................................",
  "kWwWk...................................",
  "kMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMk",
  "kMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMk",
  "kWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWk",
  ".kWk................................kWk.",
  ".kWk................................kWk.",
];

// Drawn over the sleeping sprite from the chest to the ankles; the hat and
// the shoes stick out either end.
const blanket = [
  "kkkkkkkkkkkkkkkkkk",
  "kqqqqqqqqqqqqqqqqk",
  "kQQQQQQQQQQQQQQQQk",
  "kQQQQQQQQQQQQQQQQk",
  "kQQQQQQQQQQQQQQQQk",
  "kQQQQQQQQQQQQQQQQk",
  "kQQQQQQQQQQQQQQQQk",
  "kQQQQQQQQQQQQQQQQk",
];

// Baratza Encore: hopper on a slim tower, grounds bin at the bottom.
const grinder = [
  ".kkkk.",
  "kGGGGk",
  "kGGGGk",
  ".kkkk.",
  ".kSSk.",
  ".kSsk.",
  ".kSSk.",
  ".kSSk.",
  ".kkkk.",
  ".kSSk.",
  ".kSSk.",
  ".kSSk.",
  ".kkkk.",
];

// Breville Bambino Plus: a steel box, two dials, the group head under the middle.
const machine = [
  ".kkkkkkkk.",
  "kSSSSSSSSk",
  "kSsSSSSsSk",
  "kSSSSSSSSk",
  "kSSkkkkSSk",
  "kSSSkkSSSk",
  "kSSSSSSSSk",
  "kSSSSSSSSk",
  "kSSSSSSSSk",
  "kkkkkkkkkk",
];

const cup = [
  "kMMk",
  "kook",
  ".kk.",
];

const laptop = [
  "..kkkkkkkk..",
  "..kBBBBBBk..",
  "..kBBBBBBk..",
  "..kBBBBBBk..",
  "..kkkkkkkk..",
  ".kSSSSSSSSk.",
  "kkkkkkkkkkkk",
];

// A café front: sign, striped awning, a door and a window.
const cafe = [
  "kkkkkkkkkkkkkkkkkkkkkkkk",
  "kWWWWWWWWWWWWWWWWWWWWWWk",
  "kWWWWWWWWWWWWWWWWWWWWWWk",
  "kkkkkkkkkkkkkkkkkkkkkkkk",
  "kbbMMbbMMbbMMbbMMbbMMbbk",
  "kbbMMbbMMbbMMbbMMbbMMbbk",
  "kbbMMbbMMbbMMbbMMbbMMbbk",
  "k.k.k.k.k.k.k.k.k.k.k.k.",
  ".kppppppppppppppppppppk.",
  ".kppppppppppppppppppppk.",
  ".kpppppppppppkkkkkkkkpk.",
  ".kppkkkkkkpppkGGGkGGkpk.",
  ".kppkWWWWkpppkGGGkGGkpk.",
  ".kppkWkkWkpppkkkkkkkkpk.",
  ".kppkWkkWkpppkGGGkGGkpk.",
  ".kppkWWWWkpppkGGGkGGkpk.",
  ".kppkWWWWkpppkkkkkkkkpk.",
  ".kppkWWwWkppppppppppppk.",
  ".kppkWWWWkppppppppppppk.",
  ".kppkWWWWkppppppppppppk.",
  ".kppkWWWWkppppppppppppk.",
  "kkkkkkkkkkkkkkkkkkkkkkkk",
];

// A signpost with four boards, two each way.
const signpost = [
  "......kk......",
  "......kk......",
  "......kkkkkkk.",
  "......kWWWWWWk",
  "......kkkkkkk.",
  "......kk......",
  "......kk......",
  ".kkkkkkk......",
  "kWWWWWWkk.....",
  ".kkkkkkk......",
  "......kk......",
  "......kk......",
  "......kkkkkkk.",
  "......kWWWWWWk",
  "......kkkkkkk.",
  "......kk......",
  "......kk......",
  ".kkkkkkk......",
  "kWWWWWWkk.....",
  ".kkkkkkk......",
  "......kk......",
  "......kk......",
  "......kk......",
  "......kk......",
  "......kk......",
  ".....kkkk.....",
];

// A volleyball net between two poles: tape on top, a mesh below.
const net = (() => {
  const width = 26;
  const height = 18;
  return Array.from({ length: height }, (_, y) => {
    const middle = Array.from({ length: width - 2 }, (_, x) => {
      if (y === 0) return "M";
      if (y <= 7) return (x + y) % 2 === 0 ? "k" : ".";
      return ".";
    }).join("");
    return `k${middle}k`;
  });
})();

// Mikasa colours: blue and yellow, the pair Justin can tell apart.
const ball = [
  ".kkkk.",
  "kYYbbk",
  "kYYbbk",
  "kbbYYk",
  "kbbYYk",
  ".kkkk.",
];

const stove = [
  "kkkkkkkkkkkkkkkk",
  "kSSSSSSSSSSSSSSk",
  "kSsSsSSSSSSSSSSk",
  "kSSSSSSSSSSSSSSk",
  "kSkkkkkkkkkkkkSk",
  "kSkGGGGGGGGGGkSk",
  "kSkGGGGGGGGGGkSk",
  "kSkkkkkkkkkkkkSk",
  "kSSSSSSSSSSSSSSk",
  "kkkkkkkkkkkkkkkk",
];

const pot = [
  "...kk...",
  ".kkkkkk.",
  "kssssssk",
  "kssssssk",
  "kkkkkkkk",
];

// Her cookbook, open on the counter.
const book = [
  "kMMkMMk",
  "kMMkMMk",
  "kkkkkkk",
];

const lamp = [
  "...kkk...",
  "..kYYYk..",
  ".kYYYYYk.",
  "kYYYYYYYk",
  "kkkkkkkkk",
  "....k....",
  "....k....",
  "....k....",
  "....k....",
  "....k....",
  "....k....",
  "....k....",
  "....k....",
  "....k....",
  "....k....",
  "....k....",
  "....k....",
  "....k....",
  "....k....",
  "....k....",
  "....k....",
  "....k....",
  "....k....",
  "....k....",
  "..kkkkk..",
  "..kkkkk..",
];

const frame = [
  "kkkkkk",
  "kWWWWk",
  "kWMMWk",
  "kWMMWk",
  "kWWWWk",
  "kkkkkk",
];

// A TV on a stand, straw hat on the screen.
const tv = [
  "kkkkkkkkkkkkkkkkkk",
  "kBBBBBBBBBBBBBBBBk",
  "kBBBBBBBBBBBBBBBBk",
  "kBBBBBBkkkkBBBBBBk",
  "kBBBBBkYYYYkBBBBBk",
  "kBBBBBkrrrrkBBBBBk",
  "kBBBkYYYYYYYYkBBBk",
  "kBBBBBBBBBBBBBBBBk",
  "kBBBBBBBBBBBBBBBBk",
  "kkkkkkkkkkkkkkkkkk",
  "........kk........",
  "........kk........",
  "........kk........",
  "........kk........",
  "....kkkkkkkkkk....",
];

export const props = {
  bed,
  blanket,
  grinder,
  machine,
  cup,
  laptop,
  cafe,
  signpost,
  net,
  ball,
  stove,
  pot,
  book,
  lamp,
  frame,
  tv,
  table,
};

// One rect per pixel, like Sprite, for a single static picture.
export function Pixels({ rows, scale }) {
  const width = rows[0].length;
  const height = rows.length;
  return (
    <svg
      width={width * scale}
      height={height * scale}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rows.flatMap((row, y) =>
        [...row].map(
          (ch, x) =>
            palette[ch] && (
              <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill={palette[ch]} />
            ),
        ),
      )}
    </svg>
  );
}
