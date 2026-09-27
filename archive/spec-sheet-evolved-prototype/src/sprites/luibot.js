// luibot, the messenger: a robot in Justin's evening layer and his straw hat.
// 28x32, drawn 1 sprite px = 1 page px: a light blue shell head with a dark
// visor, lit eyes and a mouth light, one ear bolt, and a straight antenna with
// a lit tip poking through the crown; a slate hoodie with the hood down on the
// shoulders, drawstrings and a kangaroo pocket, right hand in the pocket, left
// hand out of the sleeve; wide grey pants over blue metal feet on the last row.
// His attitude is the hat: cocked down over the left eye two rows (the brim and
// crown step down in three segments), so that eye shows half-lidded under the
// brim and the low side hides that ear bolt. The body sits at the right edge
// (brim, torso and feet end at col 27); the seven spare columns on the left are
// for the waving arm. Clothes and hat are Justin's exact colours so the three
// read as one family. Same row-of-characters format and outline rule as
// justin.js: 2px ink around the silhouette, 1px interior lines, 1px on the
// brim's top edge and around the small parts that would vanish under 2px
// (antenna light, ear bolt, hands, feet), which have their own letters.

const ink = "#1e1711"; // near-black warm brown, same as justin.js; never pure black
const shell = "#8fa9c4"; // light blue head, and the hands
const body = "#5e7fa3"; // blue metal: visor, bolt, feet
const light = "#efe3cf";
const straw = "#d9b25a"; // Justin's hat
const strawShade = "#b8903f";
const hatBand = "#6e3b2e";
const hoodie = "#5b6579"; // Justin's slate hoodie
const hoodShade = "#48505f"; // the hood's edge on the shoulders
const drawstring = "#e4d4b4"; // oat, Justin's shirt colour
const pants = "#6a6259"; // warm grey wool
const pantsCrease = "#7d756b";

const palette = {
  ".": null,
  k: ink,
  L: shell,
  m: shell, // hands
  b: body,
  e: body, // ear bolt and feet
  w: light,
  y: straw,
  z: strawShade,
  n: hatBand,
  H: hoodie,
  G: hoodShade,
  D: drawstring,
  p: pants,
  l: pantsCrease,
};

// Standing; the feet never leave row 31. The blink darkens the eyes (rows
// 13-14) for one short frame every few seconds; nothing else moves.
const open = [
    ".................kkkk.......",
    ".................kwwk.......",
    ".................kkkk.......",
    "..................kk........",
    "..................kkkkk.....",
    "..............kkkkkkkkk.....",
    "...........kkkkyyyyyykk.....",
    "...........kkyyyyyyynkk.....",
    "...........kkynnnnnnnkk.....",
    "...........kknnnnnnnykkkkkkk",
    "...........kknyyyyyyyyyzyykk",
    ".......kkkkkkyyyyyyyzzzzkkkk",
    ".......kyzyyyyzzzzzzLLLLkk..",
    ".......kkkzzzzbbbbbbwwbLkkkk",
    "........kkLbwwbbbbbbwwbLkkek",
    "........kkLbbbbbbbbbbbbLkkek",
    "........kkLbbbbbwwbbbbbLkkkk",
    "........kkLLLLLLLLLLLLLLkk..",
    "........kkkkkkkkkkkkkkkkkk..",
    ".......kkkkkGGGGGGGGGGGkkkkk",
    ".......kkHHkHHHHDHDHHHHkHHkk",
    ".......kkHHkHHHHDHDHHHHkHHkk",
    ".......kkHHkHHHHHHHHHHHkHHkk",
    ".......kkHHkHkkkkkkkkkHkHHkk",
    ".......kkHHkHHHHHHHHHHHkkkkk",
    "......kkkkkkHHHHHHHHHHHkk...",
    "......kmmmkkkkkkkkkkkkkkk...",
    "......kmmmkppppk..kppppkk...",
    "......kkkkkppppk..kppppkk...",
    ".........kkpplpk..kplppkk...",
    ".........keeeeek..keeeeek...",
    ".........kkkkkkk..kkkkkkk...",
];
const blink = open.map((row, y) => (y === 13 || y === 14 ? row.replace(/w/g, "b") : row));

// Wave: idle's body from col 12 rightward, pixel for pixel, with the left
// sleeve raised: a short thick sleeve (3px of slate between its lines) runs
// from the shoulder up beside the head, bends at the elbow beside the chin,
// and ends in a rounded mitten with a thumb notch on the brim side. Frame A
// holds the hand beside the brim's low tip (cols 0-5, rows 8-13), frame B
// swings it up and in over the tip (cols 3-8, rows 5-10; the mitten's cut
// corner keeps it clear of the brim), the elbow rising with it and the arm
// straightening; one clear column between arm and hat in both frames. The
// right hand stays in the pocket.
const wave = [
  [
    ".................kkkk.......",
    ".................kwwk.......",
    ".................kkkk.......",
    "..................kk........",
    "..................kkkkk.....",
    "..............kkkkkkkkk.....",
    "...........kkkkyyyyyykk.....",
    "...........kkyyyyyyynkk.....",
    ".kkkk......kkynnnnnnnkk.....",
    "kkmmkk.....kknnnnnnnykkkkkkk",
    "kmmmmk.....kknyyyyyyyyyzyykk",
    "kmmmkk.kkkkkkyyyyyyyzzzzkkkk",
    "kkmmkk.kyzyyyyzzzzzzLLLLkk..",
    ".kkkkk.kkkzzzzbbbbbbwwbLkkkk",
    ".kHHHk..kkLbwwbbbbbbwwbLkkek",
    ".kHHHk..kkLbbbbbbbbbbbbLkkek",
    ".kHHHkk.kkLbbbbbwwbbbbbLkkkk",
    ".kkHHHkkkkLLLLLLLLLLLLLLkk..",
    "..kkHHHkkkkkkkkkkkkkkkkkkk..",
    "...kkHHHHkkkGGGGGGGGGGGkkkkk",
    "....kkkHHHHkHHHHDHDHHHHkHHkk",
    ".....kkkkkkkHHHHDHDHHHHkHHkk",
    "..........kkHHHHHHHHHHHkHHkk",
    "..........kkHkkkkkkkkkHkHHkk",
    "..........kkHHHHHHHHHHHkkkkk",
    "..........kkHHHHHHHHHHHkk...",
    "..........kkkkkkkkkkkkkkk...",
    ".........kkppppk..kppppkk...",
    ".........kkppppk..kppppkk...",
    ".........kkpplpk..kplppkk...",
    ".........keeeeek..keeeeek...",
    ".........kkkkkkk..kkkkkkk...",
  ],
  [
    ".................kkkk.......",
    ".................kwwk.......",
    ".................kkkk.......",
    "..................kk........",
    "..................kkkkk.....",
    "....kkkk......kkkkkkkkk.....",
    "...kkmmkk..kkkkyyyyyykk.....",
    "...kmmmmk..kkyyyyyyynkk.....",
    "...kmmmmk..kkynnnnnnnkk.....",
    "...kmmkkk..kknnnnnnnykkkkkkk",
    ".kkkkkk....kknyyyyyyyyyzyykk",
    ".kHHHk.kkkkkkyyyyyyyzzzzkkkk",
    ".kHHHk.kyzyyyyzzzzzzLLLLkk..",
    ".kHHHk.kkkzzzzbbbbbbwwbLkkkk",
    ".kHHHkk.kkLbwwbbbbbbwwbLkkek",
    ".kkHHHk.kkLbbbbbbbbbbbbLkkek",
    "..kkHHkkkkLbbbbbwwbbbbbLkkkk",
    "...kkHHHkkLLLLLLLLLLLLLLkk..",
    "....kkHHkkkkkkkkkkkkkkkkkk..",
    ".....kkHHHkkGGGGGGGGGGGkkkkk",
    "......kkkHHkHHHHDHDHHHHkHHkk",
    "........kkkkHHHHDHDHHHHkHHkk",
    "..........kkHHHHHHHHHHHkHHkk",
    "..........kkHkkkkkkkkkHkHHkk",
    "..........kkHHHHHHHHHHHkkkkk",
    "..........kkHHHHHHHHHHHkk...",
    "..........kkkkkkkkkkkkkkk...",
    ".........kkppppk..kppppkk...",
    ".........kkppppk..kppppkk...",
    ".........kkpplpk..kplppkk...",
    ".........keeeeek..keeeeek...",
    ".........kkkkkkk..kkkkkkk...",
  ],
];

export default {
  palette,
  actions: {
    idle: { durations: [2800, 160], frames: [open, blink] },
    wave: { interval: 220, frames: wave },
  },
};
