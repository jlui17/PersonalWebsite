// A tennis ball, 10px, for Truffle to ignore: round, with the seam as a lighter
// curve and a little shade low on the right. Same row-of-characters format and
// ink as the sprites in src/sprites; the outline stays 1px with single-pixel
// corners, since 2px on a 10px ball leaves almost no felt and stepped corners
// read as an octagon at true size.

const ink = "#1e1711";
const felt = "#cdc35a";
const feltShade = "#b5ab4c";
const seam = "#f0eaa8";

const palette = {
  ".": null,
  k: ink,
  y: felt,
  d: feltShade,
  w: seam,
};

// Rolling to the right: the seam goes left, top, right, bottom, a quarter turn
// per frame, on the same silhouette so the ball does not wobble. The shade is
// the light, not the ball, so it stays put, and the seam never crosses it. Frame
// 0 (seam left) is also the resting frame.
const roll = [
  [
    "..kkkkkk..",
    ".kyywyyyk.",
    "kyywyyyyyk",
    "kywyyyyyyk",
    "kywyyyyyyk",
    "kywyyyyyyk",
    "kywyyyyydk",
    "kyywyyyydk",
    ".kyywyddk.",
    "..kkkkkk..",
  ],
  [
    "..kkkkkk..",
    ".kyyyyyyk.",
    "kyywwwwyyk",
    "kywyyyywyk",
    "kwyyyyyywk",
    "kyyyyyyyyk",
    "kyyyyyyydk",
    "kyyyyyyydk",
    ".kyyyyddk.",
    "..kkkkkk..",
  ],
  [
    "..kkkkkk..",
    ".kyyywyyk.",
    "kyyyyywyyk",
    "kyyyyyywyk",
    "kyyyyyywyk",
    "kyyyyyywyk",
    "kyyyyyywdk",
    "kyyyyywydk",
    ".kyyywddk.",
    "..kkkkkk..",
  ],
  [
    "..kkkkkk..",
    ".kyyyyyyk.",
    "kyyyyyyyyk",
    "kyyyyyyyyk",
    "kyyyyyyyyk",
    "kwyyyyyywk",
    "kywyyyywdk",
    "kyywwwwydk",
    ".kyyyyddk.",
    "..kkkkkk..",
  ],
];

export default {
  palette,
  actions: {
    roll: { frames: roll },
  },
};
