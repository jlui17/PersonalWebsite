// luibuilder: a boxy robot in Justin's day layer and his straw hat. 30x34,
// drawn 1 sprite px = 1 page px: an orange head with a darker visor, lit eyes
// and a mouth slit, one ear bolt; his rust over-shirt with the windowpane check
// worn open like a work jacket over the orange chest, sleeves ending in a cuff
// line with metal forearms and mittens below; wide grey pants and work boots.
// His attitude is the pose: the right hand rests on a stone block standing on
// the ground beside his right boot (block cols 24-29, its bottom ink on row 33
// with the boots), the left arm hangs. No pencil: the block alone says builder
// at true size, and a pencil small enough to fit read as a yellow flag. The
// body sits at the right edge; the six spare columns on the left are for the
// raised arm. Rows 0-1 are empty at rest so the hat can lift. Clothes and hat
// are Justin's exact colours so the three read as one family; orange, so it
// splits from luibot's blue on the axis Justin can see. Same row-of-characters
// format and outline rule as justin.js: 2px ink around the silhouette, 1px
// interior lines, 1px on the brim's top edge and around the small parts that
// would vanish under 2px (bolt, forearms and hands, block), which have their
// own letters.

const ink = "#1e1711"; // near-black warm brown, same as justin.js; never pure black
const shell = "#d1913f"; // orange metal: head and chest
const panel = "#a86f2c"; // darker orange: visor
const light = "#efe3cf";
const straw = "#d9b25a"; // Justin's hat
const strawShade = "#b8903f";
const hatBand = "#6e3b2e";
const block = "#b9b2a6"; // stone grey, light against the page and apart from the pants
const overshirt = "#a8674a"; // Justin's rust over-shirt
const overshirtCheck = "#8f5439"; // its windowpane check
const pants = "#6a6259"; // warm grey wool
const pantsCrease = "#7d756b";
const boots = "#54423a"; // Justin's shoes

const palette = {
  ".": null,
  k: ink,
  A: shell,
  a: shell, // bolt, forearms and hands
  D: panel,
  w: light,
  y: straw,
  z: strawShade,
  n: hatBand,
  B: block,
  O: overshirt,
  P: overshirtCheck,
  p: pants,
  l: pantsCrease,
  f: boots,
};

// Standing, hand on the block; the boots and the block never leave row 33.
// The blink darkens the eyes (rows 12-13) for one short frame every few
// seconds; nothing else moves.
const open = [
    "..............................",
    "..............................",
    "............kkkkkkkkkk........",
    "...........kkyyyyyyyykk.......",
    "...........kkyyyyyyyykk.......",
    "...........kknnnnnnnnkk.......",
    "...........kknnnnnnnnkk.......",
    "......kkkkkkkyyyyyyyykkkkkkk..",
    "......kkyyzyyyyyyzyyyyyzyykk..",
    "......kkkkzzzzzzzzzzzzzzkkkk..",
    ".........kkAAAAAAAAAAAAkk.....",
    ".........kkADDDDDDDDDDAkkkk...",
    ".........kkADwwDDDDwwDAkkak...",
    ".........kkADwwDDDDwwDAkkak...",
    ".........kkADDDDDDDDDDAkkkk...",
    ".........kkAAAAkkkkAAAAkk.....",
    ".........kkAAAAAAAAAAAAkk.....",
    ".........kkkkkkkkkkkkkkkk.....",
    "......kkkkkOOOAAAAAAOOOkkkkk..",
    "......kkOOkPPPAAAAAAPPPkOOkk..",
    "......kkOOkOPOAAAAAAOPOkOOkk..",
    "......kkOOkOPOAAAAAAOPOkOOkk..",
    "......kkkkkPPPAAAAAAPPPkkkkk..",
    "......kkaakOPOAAAAAAOPOkaakk..",
    "......kkaakOPOAAAAAAOPOkaakkkk",
    "......kaaakOPOAAAAAAOPOkkaaaak",
    "......kaaakpppppppppppkkkaaaak",
    "......kkkkkpppkkkkppppk.kkkkkk",
    "........kkpplpk..kplppk.kBBBBk",
    "........kkppppk..kppppk.kBBBBk",
    "........kkppppk..kppppk.kBBBBk",
    "........kkffffk..kffffk.kBBBBk",
    "........kkffffk..kffffk.kBBBBk",
    "........kkkkkkk..kkkkkk.kkkkkk",
];
const blink = open.map((row, y) => (y === 12 || y === 13 ? row.replace(/w/g, "D") : row));

// The greeting is a hat tip, not a wave (the straight brim sits exactly where a
// waving hand would go), drawn like Justin's own `hat` pose: the left sleeve
// stands up from the shoulder, cuff line at row 18, the metal forearm runs
// straight up beside the head (one clear column from it), and the mitten sits
// on the brim's left tip with the tip's two columns inside it and its own
// outline over the straw. Frame 0 is the grip with the hat level; frame 1 lifts
// the hat's left third one row (crown top steps, straw under the step), the
// hand rising with it, and is held for as long as the hover lasts (a long last
// duration; the design switches back to idle, which puts the hat down). The
// right hand stays on the block and the body does not move.
const tip = [
  [
    "..............................",
    "..............................",
    "............kkkkkkkkkk........",
    "...........kkyyyyyyyykk.......",
    "....kkkk...kkyyyyyyyykk.......",
    "...kkaakk..kknnnnnnnnkk.......",
    "...kaaaak..kknnnnnnnnkk.......",
    "...kaaaakkkkkyyyyyyyykkkkkkk..",
    "...kaaaakyzyyyyyyzyyyyyzyykk..",
    "...kkkkkkkzzzzzzzzzzzzzzkkkk..",
    "...kaaak.kkAAAAAAAAAAAAkk.....",
    "...kaaak.kkADDDDDDDDDDAkkkk...",
    "...kaaak.kkADwwDDDDwwDAkkak...",
    "...kaaak.kkADwwDDDDwwDAkkak...",
    "...kaaak.kkADDDDDDDDDDAkkkk...",
    "...kaaak.kkAAAAkkkkAAAAkk.....",
    "...kaaak.kkAAAAAAAAAAAAkk.....",
    "...kaaak.kkkkkkkkkkkkkkkk.....",
    "...kkkkkkkkOOOAAAAAAOOOkkkkk..",
    "....kOOOkkkPPPAAAAAAPPPkOOkk..",
    "....kOOOkkkOPOAAAAAAOPOkOOkk..",
    "....kOOOkkkOPOAAAAAAOPOkOOkk..",
    "....kkkkkkkPPPAAAAAAPPPkkkkk..",
    ".........kkOPOAAAAAAOPOkaakk..",
    ".........kkOPOAAAAAAOPOkaakkkk",
    ".........kkOPOAAAAAAOPOkkaaaak",
    "........kkppppppppppppkkkaaaak",
    "........kkppppkkkkppppk.kkkkkk",
    "........kkpplpk..kplppk.kBBBBk",
    "........kkppppk..kppppk.kBBBBk",
    "........kkppppk..kppppk.kBBBBk",
    "........kkffffk..kffffk.kBBBBk",
    "........kkffffk..kffffk.kBBBBk",
    "........kkkkkkk..kkkkkk.kkkkkk",
  ],
  [
    "..............................",
    "............kkk...............",
    "...........kkykkkkkkkk........",
    "....kkkk...kkyyyyyyyykk.......",
    "...kkaakk..kknyyyyyyykk.......",
    "...kaaaak..kknnnnnnnnkk.......",
    "...kaaaakkkkkynnnnnnnkk.......",
    "...kaaaakyyyyyyyyyyyykkkkkkk..",
    "...kkkkkkkzzzzyyyyyyyyyyyykk..",
    "...kaaak.kkkkkzzzzzzzzzzkkkk..",
    "...kaaak.kkAAAAAAAAAAAAkk.....",
    "...kaaak.kkADDDDDDDDDDAkkkk...",
    "...kaaak.kkADwwDDDDwwDAkkak...",
    "...kaaak.kkADwwDDDDwwDAkkak...",
    "...kaaak.kkADDDDDDDDDDAkkkk...",
    "...kaaak.kkAAAAkkkkAAAAkk.....",
    "...kaaak.kkAAAAAAAAAAAAkk.....",
    "...kaaak.kkkkkkkkkkkkkkkk.....",
    "...kkkkkkkkOOOAAAAAAOOOkkkkk..",
    "....kOOOkkkPPPAAAAAAPPPkOOkk..",
    "....kOOOkkkOPOAAAAAAOPOkOOkk..",
    "....kOOOkkkOPOAAAAAAOPOkOOkk..",
    "....kkkkkkkPPPAAAAAAPPPkkkkk..",
    ".........kkOPOAAAAAAOPOkaakk..",
    ".........kkOPOAAAAAAOPOkaakkkk",
    ".........kkOPOAAAAAAOPOkkaaaak",
    "........kkppppppppppppkkkaaaak",
    "........kkppppkkkkppppk.kkkkkk",
    "........kkpplpk..kplppk.kBBBBk",
    "........kkppppk..kppppk.kBBBBk",
    "........kkppppk..kppppk.kBBBBk",
    "........kkffffk..kffffk.kBBBBk",
    "........kkffffk..kffffk.kBBBBk",
    "........kkkkkkk..kkkkkk.kkkkkk",
  ],
];

export default {
  palette,
  actions: {
    idle: { durations: [3400, 160], frames: [open, blink] },
    wave: { durations: [240, 600000], frames: tip },
  },
};
