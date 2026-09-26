// The sky behind the board. The San Francisco hour picks one of seven palettes
// and places the sun or the moon on a low arc. Glass takes its mode from the
// sky: light glass with dark ink over the bright skies, dark glass with light
// ink over the dim ones, so text keeps its contrast at every hour.
//
// The hour boundaries are the same all year (SF sunset moves between 5pm and
// 8:30pm), so "golden hour" here means the palette, not the astronomy.

export const periods = {
  night: {
    label: "Night",
    top: "#151b36",
    mid: "#202a4e",
    low: "#2f3a62",
    mode: "dark",
    stars: true,
  },
  dawn: {
    label: "Dawn",
    top: "#2d3462",
    mid: "#75648f",
    low: "#d69a80",
    mode: "dark",
    stars: false,
  },
  morning: {
    label: "Morning",
    top: "#6da1d2",
    mid: "#b4d0e9",
    low: "#efe2cf",
    mode: "light",
    stars: false,
  },
  day: {
    label: "Midday",
    top: "#4b90cf",
    mid: "#8fbee6",
    low: "#d9e6ef",
    mode: "light",
    stars: false,
  },
  golden: {
    label: "Golden hour",
    top: "#6a8fc3",
    mid: "#d8a77a",
    low: "#f3cf9e",
    mode: "light",
    stars: false,
  },
  dusk: {
    label: "Dusk",
    top: "#2a2d5a",
    mid: "#80567d",
    low: "#d68f6e",
    mode: "dark",
    stars: false,
  },
  evening: {
    label: "Evening",
    top: "#171d42",
    mid: "#2d366c",
    low: "#4d4e88",
    mode: "dark",
    stars: true,
  },
};

export const periodFor = (hour) =>
  hour < 5
    ? "night"
    : hour < 7
      ? "dawn"
      : hour < 11
        ? "morning"
        : hour < 16
          ? "day"
          : hour < 18
            ? "golden"
            : hour < 20
              ? "dusk"
              : hour < 22
                ? "evening"
                : "night";

// What hangs in the sky. The sun crosses the band of sky above the board
// through the bright hours (7h to 17h) and the moon through the dark ones (20h
// to 5h), both on a shallow arc, so neither ends up as a smudge behind the
// glass. At dawn and dusk there is no disc: the sun sits just under the
// horizon as a warm glow, low on the left in the morning and low on the right
// in the evening.
export function skyBody(hour) {
  if (hour >= 7 && hour <= 17) {
    const t = (hour - 6) / 12;
    return { kind: "sun", x: 14 + t * 72, y: 8 - Math.sin(t * Math.PI) * 5 };
  }
  if (hour >= 20 || hour <= 5) {
    const t = ((hour + 4) % 24) / 9;
    return { kind: "moon", x: 14 + t * 72, y: 8 - Math.sin(t * Math.PI) * 5 };
  }
  return { kind: "glow", x: hour < 12 ? 18 : 82, y: 100 };
}

// Fixed star field: a seeded generator, so the same sky comes back every night.
export const stars = (() => {
  let seed = 1070;
  const rand = () => {
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 46 }, () => ({
    x: rand() * 100,
    y: rand() * 62,
    size: rand() < 0.2 ? 3 : 2,
    delay: rand() * 9,
  }));
})();
