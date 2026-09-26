// The day, in order. Each part is one section of the page and one scene on the
// stage. `hour` is where "SF is here right now" lands; `light` is the palette
// the page takes on while that part is current (see day-in-sf.css).
export const day = [
  { id: "wake", time: "06:30", hour: 6.5, caption: "Not up yet.", light: "dawn" },
  { id: "espresso", time: "07:30", hour: 7.5, caption: "First shot of the day.", light: "morning" },
  { id: "work", time: "09:00", hour: 9, caption: "At work, with help.", light: "morning" },
  { id: "lunch", time: "12:30", hour: 12.5, caption: "Out for lunch.", light: "day" },
  { id: "quests", time: "14:00", hour: 14, caption: "Side quests.", light: "day" },
  { id: "sport", time: "18:00", hour: 18, caption: "After work.", light: "dusk" },
  { id: "dinner", time: "19:30", hour: 19.5, caption: "Dinner.", light: "night" },
  { id: "people", time: "20:30", hour: 20.5, caption: "After dinner.", light: "night" },
  { id: "onepiece", time: "21:30", hour: 21.5, caption: "One episode before bed.", light: "night" },
  { id: "bed", time: "23:30", hour: 23.5, caption: "Lights out.", light: "late" },
];

// The part of the day a wall-clock hour falls in. Before 06:30 he is still in
// the last bed, so early hours land on the final part.
export function partAt(hour) {
  const i = day.findLastIndex((part) => part.hour <= hour);
  return i < 0 ? day.length - 1 : i;
}
