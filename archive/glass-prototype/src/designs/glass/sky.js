// The sky behind the board. The San Francisco hour picks one of seven palettes
// and places the sun or the moon. Glass takes its mode from the sky: light
// glass with dark ink over the bright skies, dark glass with light ink over
// the dim ones, so text keeps its contrast at every hour. `horizon` is the
// silhouette colour for the hills and the bridge, `cloud` the cloud alpha.
//
// The hour boundaries are the same all year (SF sunset moves between 5pm and
// 8:30pm), so "golden hour" here means the palette, not the astronomy.

export const periods = {
  night: {
    label: "Night",
    top: "#131a38",
    mid: "#1f2a52",
    low: "#33406c",
    horizon: "#141a35",
    mode: "dark",
    stars: true,
    cloud: 0.1,
  },
  dawn: {
    label: "Dawn",
    top: "#2c3466",
    mid: "#7a6796",
    low: "#e0a487",
    horizon: "#3a2f52",
    mode: "dark",
    stars: false,
    cloud: 0.35,
  },
  morning: {
    label: "Morning",
    top: "#6a9fd4",
    mid: "#a9cbea",
    low: "#f3e4cf",
    horizon: "#8ca6c4",
    mode: "light",
    stars: false,
    cloud: 0.8,
  },
  day: {
    label: "Midday",
    top: "#4d8fd0",
    mid: "#8dbbe6",
    low: "#dfe6e8",
    horizon: "#7d9dbf",
    mode: "light",
    stars: false,
    cloud: 0.85,
  },
  golden: {
    label: "Golden hour",
    top: "#7a95c3",
    mid: "#e6b27d",
    low: "#f8d9a5",
    horizon: "#b98a63",
    mode: "light",
    stars: false,
    cloud: 0.7,
  },
  dusk: {
    label: "Dusk",
    top: "#292c5c",
    mid: "#84567f",
    low: "#dd9670",
    horizon: "#3b2a4d",
    mode: "dark",
    stars: false,
    cloud: 0.3,
  },
  evening: {
    label: "Evening",
    top: "#161c44",
    mid: "#2e3872",
    low: "#56548f",
    horizon: "#181c3f",
    mode: "dark",
    stars: true,
    cloud: 0.14,
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

// What hangs in the sky. The sun climbs from low on the left at 7h to high at
// noon and sinks low on the right by 17h, so the golden hour has its sun
// large and low behind the lower widgets; its glow is what the glass over
// there picks up. The moon keeps to the band above the board through the dark
// hours (20h to 5h), where a pale disc cannot read as a smudge behind dark
// glass. At dawn and dusk there is no disc: the sun sits just under the
// horizon as a warm glow, left in the morning, right in the evening.
export function skyBody(hour) {
  if (hour >= 7 && hour <= 17) {
    const t = (hour - 6) / 12;
    return { kind: "sun", x: 12 + t * 76, y: 74 - Math.sin(t * Math.PI) * 62 };
  }
  if (hour >= 20 || hour <= 5) {
    const t = ((hour + 4) % 24) / 9;
    return { kind: "moon", x: 14 + t * 72, y: 8 - Math.sin(t * Math.PI) * 5 };
  }
  return { kind: "glow", x: hour < 12 ? 18 : 82, y: 100 };
}

// The moon's phase tonight, 0 new through 0.5 full to 1 new again, from a
// known new moon and the mean synodic month.
export function moonPhase(date = new Date()) {
  const synodic = 29.530588853;
  const days = (date - Date.UTC(2000, 0, 6, 18, 14)) / 86_400_000;
  return (((days % synodic) + synodic) % synodic) / synodic;
}

// Fixed star field: a seeded generator, so the same sky comes back every night.
export const stars = (() => {
  let seed = 1070;
  const rand = () => {
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 54 }, () => ({
    x: rand() * 100,
    y: rand() * 70,
    size: rand() < 0.25 ? 4 : 3,
    delay: rand() * 9,
  }));
})();
