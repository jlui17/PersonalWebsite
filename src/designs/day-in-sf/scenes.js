import { props } from "./props.jsx";

// What the stage shows at each part of the day, keyed by day.js id. Positions
// are in sprite pixels: `dx` is the left edge measured from Justin's centre,
// `dy` is the distance above the ground. `under` is drawn behind Justin,
// `over` in front of him. `truffle` is where she lies once she has followed
// him there; she is asleep everywhere except dinner.
const { bed, blanket, grinder, machine, cup, laptop, cafe, signpost, net, stove, pot, book, lamp, frame, tv, table } =
  props;

const inBed = {
  justin: { action: "sleep", dy: 5 },
  under: [{ rows: bed, dx: -20 }],
  over: [{ rows: blanket, dx: -6, dy: 5 }],
  truffle: { action: "sleep", dx: 24 },
};

export const scenes = {
  wake: inBed,
  espresso: {
    justin: { action: "sip" },
    under: [
      { rows: table(28), dx: 12 },
      { rows: grinder, dx: 14, dy: 8 },
      { rows: machine, dx: 22, dy: 8 },
      { rows: cup, dx: 34, dy: 8 },
    ],
    steam: { dx: 35, dy: 12 },
    truffle: { action: "sleep", dx: -34 },
  },
  work: {
    justin: { action: "idle" },
    under: [
      { rows: table(30), dx: 12 },
      { rows: laptop, dx: 16, dy: 8 },
      { rows: cup, dx: 32, dy: 8 },
    ],
    robots: [
      { character: "luibot", dx: 46, dy: 12 },
      { character: "luibuilder", dx: 58 },
    ],
    truffle: { action: "sleep", dx: -34 },
  },
  lunch: {
    justin: { action: "idle" },
    under: [{ rows: cafe, dx: 12 }],
    truffle: { action: "sleep", dx: -34 },
  },
  quests: {
    justin: { action: "idle" },
    under: [{ rows: signpost, dx: 13 }],
    truffle: { action: "sleep", dx: -34 },
  },
  sport: {
    justin: { action: "idle" },
    under: [{ rows: net, dx: 12 }],
    truffle: { action: "sleep", dx: -34 },
  },
  dinner: {
    justin: { action: "idle" },
    under: [
      { rows: stove, dx: 12 },
      { rows: pot, dx: 16, dy: 10 },
      { rows: table(10), dx: 32 },
      { rows: book, dx: 33, dy: 8 },
    ],
    steam: { dx: 19, dy: 15 },
    truffle: { action: "sit", dx: -24 },
  },
  people: {
    justin: { action: "idle" },
    under: [
      { rows: lamp, dx: 12 },
      { rows: table(12), dx: 24 },
      { rows: frame, dx: 27, dy: 8 },
    ],
    glow: { dx: 16, dy: 23 },
    truffle: { action: "sleep", dx: -34 },
  },
  onepiece: {
    justin: { action: "sit" },
    under: [{ rows: tv, dx: 16 }],
    glow: { dx: 25, dy: 10, screen: true },
    truffle: { action: "sleep", dx: -34 },
  },
  bed: inBed,
};

// He changes into the hoodie for the evening, from dinner on.
export const hoodieFrom = "dinner";
