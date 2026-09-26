// The furniture, in the sprites' format: arrays of rows, one character per
// room pixel, plus one shared palette. Positions live in Room.jsx.

export const palette = {
  ".": null,
  k: "#33291f", // ink, the same outline colour as the sprites
  c: "#efe3cf", // cream: blanket, window frame, snow, racket strings
  C: "#dccbb0", // cream shade, a blanket fold
  m: "#f7efe1", // pillow
  w: "#8a6244", // wood
  W: "#6b4a33", // wood shade
  n: "#b9b4a8", // brushed steel
  N: "#8f8a80", // steel shade
  g: "#3f3a36", // grinder body
  G: "#d7d0c2", // hopper, grounds bin
  b: "#5e7fa3", // blue: volleyball, the lake
  B: "#a9c4d6", // pale blue: the sky in the picture
  p: "#7a8a99", // mountains
  y: "#e8b445", // lamp yellow: shade, buttons, volleyball, knob
  Y: "#c9952f", // yellow shade
  s: "#5b6579", // slate: backpack
  S: "#444c5c", // slate shade: the front pocket
  t: "#c98f5a", // the plush
  L: "#c8c2b6", // laptop shell
  D: "#3b3f48", // laptop screen, off
  e: "#9fb3bf", // laptop screen, a line of text
};

// Headboard on the left, pillow, cream blanket, wood frame, legs.
export const bed = [
  "kWWk................................................",
  "kWWk................................................",
  "kWWk................................................",
  "kWWk................................................",
  "kWWk................................................",
  "kWWk...kkkkkkkkkk...................................",
  "kWWk..kmmmmmmmmmmk..................................",
  "kWWk.kmmmmmmmmmmmmk.................................",
  "kWWk.kmmmmmmmmmmmmk.................................",
  "kWWk.kmmmmmmmmmmmmk.................................",
  "kWWkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
  "kWWkkcccccccccccccccccccccccccccccccccccccccccccccck",
  "kWWkkcccccccccccccccccccccccccccccccccccccccccccccck",
  "kWWkkcCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCccck",
  "kWWkkcccccccccccccccccccccccccccccccccccccccccccccck",
  "kWWkkcccccccccccccccccccccccccccccccccccccccccccccck",
  "kWWkkcccccccccccccccccccccccccccccccccccccccccccccck",
  "kWWkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
  "kWWkkwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwk",
  "kWWkkwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwk",
  "kWWkkwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwk",
  "kWWkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
  "kWWk............................................kWWk",
  "kWWk............................................kWWk",
];

// Drawn over Justin when he sleeps: the blanket pulled up to his chest.
export const blanketOver = [
  ".kkkkkkkkkkkkkkkkkkkkkk.",
  "kcccccccccccccccccccccck",
  "kcccccccccccccccccccccck",
  "kccCCCCCCcccccccccccccck",
  "kcccccccccccccccCCCCCcck",
  "kcccccccccccccccccccccck",
  "kcccccccccccccccccccccck",
  "kcccccccccccccccccccccck",
  "kcccccccccccccccccccccck",
];

// Two panes over two, a sill. The sky behind it is painted by Room.jsx.
export const window = [
  ".cccccccccccccccccccccccccccccc.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".cccccccccccccccccccccccccccccc.",
  ".cccccccccccccccccccccccccccccc.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".c.............cc.............c.",
  ".cccccccccccccccccccccccccccccc.",
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
  "kWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWk",
];

// Floor lamp. The shade's `y` is swapped for cream by Room.jsx when it is off.
export const lamp = [
  "..kkkk..",
  ".kyyyyk.",
  ".kyyyyk.",
  "kyyyyyyk",
  "kyyyyyyk",
  "kyyyyyyk",
  "kkkkkkkk",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "...kk...",
  "..kkkk..",
  ".kkkkkk.",
];

// Kitchen counter: a cream top over two cabinet doors.
export const counter = [
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
  "kccccccccccccccccccccccccccccccccccccck",
  "kccccccccccccccccccccccccccccccccccccck",
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
  "kwwwwwwwwwwwwwwwwwwkwwwwwwwwwwwwwwwwwwk",
  "kwwwwwwwwwwwwwwwwwwkwwwwwwwwwwwwwwwwwwk",
  "kwwwwwwwwwwwwwwwwwwkwwwwwwwwwwwwwwwwwwk",
  "kwwwwwwwwwwwwwwwwwwkwwwwwwwwwwwwwwwwwwk",
  "kwwwwwwwwwwwwwwwwwwkwwwwwwwwwwwwwwwwwwk",
  "kwwwwwwwwwwwwwwwwkkkkkwwwwwwwwwwwwwwwwk",
  "kwwwwwwwwwwwwwwwwkkkkkwwwwwwwwwwwwwwwwk",
  "kwwwwwwwwwwwwwwwwwwkwwwwwwwwwwwwwwwwwwk",
  "kwwwwwwwwwwwwwwwwwwkwwwwwwwwwwwwwwwwwwk",
  "kwwwwwwwwwwwwwwwwwwkwwwwwwwwwwwwwwwwwwk",
  "kwwwwwwwwwwwwwwwwwwkwwwwwwwwwwwwwwwwwwk",
  "kwwwwwwwwwwwwwwwwwwkwwwwwwwwwwwwwwwwwwk",
  "kwwwwwwwwwwwwwwwwwwkwwwwwwwwwwwwwwwwwwk",
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
];

// Baratza Encore: bean hopper on top, black body, clear grounds bin.
export const grinder = [
  ".kkkkk.",
  "kGGGGGk",
  "kGGGGGk",
  "kGGGGGk",
  ".kkkkk.",
  ".kgggk.",
  ".kgggk.",
  "kkkkkkk",
  "kgggggk",
  "kgggggk",
  "kgkkkgk",
  "kgGGGgk",
  "kgGGGgk",
  "kkkkkkk",
];

// Breville Bambino Plus: steel box, two lights, group head with a cup under it,
// steam wand down the right side.
export const machine = [
  ".kkkkkkkkkkk...",
  "knnnnnnnnnnnk..",
  "knykNNNNNkynk..",
  "knnnnnnnnnnnkk.",
  "knnnkkkkknnnk.k",
  "knkkkkkkkkknk.k",
  "knnnnkkknnnnk.k",
  "knnnncccnnnnk.k",
  "knnnkcccknnnk..",
  "knnnkcccknnnk..",
  "knnkkkkkkknnk..",
  "kkkkkkkkkkkkk..",
];

// The framed photo on his wall: two peaks over a lake.
export const picture = [
  "kkkkkkkkkkkkkkkkkkkkkkk",
  "kWWWWWWWWWWWWWWWWWWWWWk",
  "kWBBBBBBBBBBBBBBBBBBBWk",
  "kWBBBBBBBBBBBBBBBBBBBWk",
  "kWBBBBBBBBcBBBBBBBBBBWk",
  "kWBBBBBBBcccBBBBBcBBBWk",
  "kWBBBBBBpcccpBBBcccBBWk",
  "kWBBBBBppppppppBpppppWk",
  "kWBBBBppppppppppppppBWk",
  "kWBBBpppppppppppppppBWk",
  "kWbbbbbbbbbbbbbbbbbbbWk",
  "kWbbbbbBbbbbbbbBbbbbbWk",
  "kWbbbbbbbbbbbbbbbbbbbWk",
  "kWWWWWWWWWWWWWWWWWWWWWk",
  "kkkkkkkkkkkkkkkkkkkkkkk",
];

// Desk: a wood top, a leg on the left, a drawer pedestal on the right.
export const desk = [
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
  "kwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwk",
  "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
  ".kWk.........................kwwwwwwwwwwwwk.",
  ".kWk.........................kwwwwwwwwwwwwk.",
  ".kWk.........................kwwwwwkkkwwwwk.",
  ".kWk.........................kwwwwwwwwwwwwk.",
  ".kWk.........................kkkkkkkkkkkkkk.",
  ".kWk.........................kwwwwwwwwwwwwk.",
  ".kWk.........................kwwwwwwwwwwwwk.",
  ".kWk.........................kwwwwwkkkwwwwk.",
  ".kWk.........................kwwwwwwwwwwwwk.",
  ".kWk.........................kwwwwwwwwwwwwk.",
  ".kWk.........................kwwwwwwwwwwwwk.",
  ".kWk.........................kwwwwwwwwwwwwk.",
  ".kWk.........................kkkkkkkkkkkkkk.",
];

// Open laptop. `e` rows only paint when it is awake (Room.jsx swaps them in).
export const laptop = [
  ".kkkkkkkkkkk.",
  ".kDDDDDDDDDk.",
  ".kDeeeeDDDDk.",
  ".kDDDDDDDDDk.",
  ".kDeeeeeeDDk.",
  ".kDDDDDDDDDk.",
  ".kkkkkkkkkkk.",
  "kLLLLLLLLLLLk",
  "kkkkkkkkkkkkk",
];

// Propped upright in the corner by the door.
export const racket = [
  "..kkk..",
  ".kcNck.",
  "kcNcNck",
  "kNcNcNk",
  "kcNcNck",
  "kNcNcNk",
  "kcNcNck",
  "kNcNcNk",
  ".kcNck.",
  "..kkk..",
  "..kWk..",
  "..kWk..",
  "..kWk..",
  "..kWk..",
  "..kWk..",
  "..kWk..",
  "..kWk..",
  "..kWk..",
  "..kWk..",
  "..kWk..",
  "..kWk..",
  "..kWk..",
  "..kWk..",
  "..kkk..",
];

// Blue and yellow, the two colours he can tell apart.
export const volleyball = [
  "..kkkk..",
  ".kyybbk.",
  "kyybbbyk",
  "kybbbyyk",
  "kbbyyybk",
  "kbbyyybk",
  ".kbyyyk.",
  "..kkkk..",
];

// Front door, two panels, a brass knob on the hinge-far side.
export const door = [
  "kkkkkkkkkkkkkkkkkk",
  "kWWWWWWWWWWWWWWWWk",
  "kWkkkkkkkkkkkkkkWk",
  "kWkwwwwwwwwwwwwkWk",
  "kWkwwwwwwwwwwwwkWk",
  "kWkwwWWWWWWWWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWWWWWWWWwwkWk",
  "kWkwwwwwwwwwwwwkWk",
  "kWkwwwwwwwwwwwwkWk",
  "kWkwwwwwwwwwwwwkWk",
  "kWkwwwwwwwwwwwwkWk",
  "kWkwwwwwwwwwwwwkWk",
  "kWkywwwwwwwwwwwkWk",
  "kWkYwwwwwwwwwwwkWk",
  "kWkwwWWWWWWWWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWwwwwwwWwwkWk",
  "kWkwwWWWWWWWWwwkWk",
  "kWkwwwwwwwwwwwwkWk",
  "kWkwwwwwwwwwwwwkWk",
  "kWkwwwwwwwwwwwwkWk",
  "kkkkkkkkkkkkkkkkkk",
];

// Hangs on the door by one strap; the small plush dangles off the side.
export const backpack = [
  "...kk.......",
  "...ks.......",
  ".kkkkkkk....",
  "ksssssssk.k.",
  "ksssssssk.k.",
  "kssSSSssk.k.",
  "ksSSSSSskk.k",
  "ksSkkkSskttt",
  "ksSSSSSskktk",
  "ksssssssk.k.",
  "ksssssssk...",
  ".kkkkkkk....",
];
