// Copy that exists only on the character sheet: the stats, the layers, the
// equipment slots, and the two summons. Everything else comes from
// src/content.js.

// Out of ten. The joke is the spread: a generalist's sheet has a 1 and a 10
// on it, and the 9 sits next to the 1. The notes are his own sentences,
// trimmed. The values are provisional: a first guess from those sentences,
// awaiting Justin's own numbers.
export const stats = [
  { name: "Directions", value: 9, note: "Weirdly good at these." },
  { name: "Geography", value: 1, note: "Terrible at it." },
  { name: "Espresso dial-in", value: 8, note: "Still dialing it in." },
  {
    name: "Curry footwork",
    value: 9,
    note: "I can nerd out over this for hours.",
  },
  {
    name: "Valorant angles",
    value: 7,
    note: "The right way to peek a specific angle.",
  },
  { name: "Volleyball & tennis", value: 2, note: "Just started, in SF." },
  { name: "Nerding out", value: 10, note: "For hours, on anything above." },
];

// What he wears, bottom up, in his words: "a simple shirt one color, then a
// subtle pattern over shirt, then a hoodie on top plain color. lots of
// layering."
export const layers = [
  { name: "Shirt", note: "Plain, one colour. Always on." },
  { name: "Over-shirt", note: "A subtle pattern over the shirt." },
  { name: "Hoodie", note: "Plain colour, on top." },
];

// The sprite sheet's outfits, as how many of the layers are on. There is no
// shirt-only outfit drawn yet, so the stack starts at two; a `shirt` outfit
// in src/sprites/justin.js would go first here as { outfit: "shirt", worn: 1 }.
export const outfits = [
  { outfit: "overshirt", worn: 2 },
  { outfit: "hoodie", worn: 3 },
];

export const equipment = [
  {
    slot: "Head",
    name: "Straw hat",
    note: "The One Piece kind. Episode 1070 is my favourite.",
  },
  { slot: "Machine", name: "Breville Bambino Plus", note: "Espresso at home." },
  {
    slot: "Grinder",
    name: "Baratza Encore",
    note: "The other half of dialing it in.",
  },
];

export const summons = [
  {
    character: "luibot",
    note: "OpenClaw agent, one of my two. I’m automating my life with them.",
  },
  { character: "luibuilder", note: "OpenClaw agent, the other one." },
];
