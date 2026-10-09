// Counts the pixels that differ between two screenshots, or between the shots of the same name in
// two folders (two runs of tools/sweep.mjs), for proof that a change moved nothing.
//
//   node tools/pixdiff.mjs tools/out/sweep-A tools/out/sweep-B
//   node tools/pixdiff.mjs before.png after.png --rows 800
//   node tools/pixdiff.mjs A B --mask "-120,0,-0,40" --band 40
//
// --mask  x0,y0,x1,y1 in CSS px, a box left out of the count (the ticking clock, say); a negative
//         or "-0" x counts from the right edge. Several boxes are separated by ";".
// --rows  compare only the top N rows (a window shot taller on one side, cropped to the other)
// --band  report the differing pixels in the top N rows (the title bar) apart from the rest
// --live  also leave out the boxes that tools/sweep.mjs recorded in shots.json beside each shot
//         (LIVE in tools/site.mjs: the sprites, the beams and the clock), on either side
// Prints, per pair, the differing pixels and the box round them; exits 1 if any pair differs
// outside the masks and the band. Reads 8-bit RGB or RGBA PNGs, as Chrome writes them.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { inflateSync } from "node:zlib";
import { cli } from "./cli.mjs";

export function readPng(path) {
  const buf = readFileSync(path);
  let width, height, bpp;
  const idat = [];
  for (let at = 8; at < buf.length; ) {
    const length = buf.readUInt32BE(at);
    const type = buf.toString("ascii", at + 4, at + 8);
    const data = buf.subarray(at + 8, at + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      const [depth, colour, , , interlace] = data.subarray(8);
      if (depth !== 8 || interlace !== 0 || ![2, 6].includes(colour)) throw new Error(`${path}: only 8-bit, non-interlaced RGB or RGBA PNGs`);
      bpp = colour === 6 ? 4 : 3;
    }
    if (type === "IDAT") idat.push(data);
    at += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? out[(y - 1) * stride + x - bpp] : 0;
      const p = a + b - c;
      const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const predict = [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][filter];
      out[y * stride + x] = (line[x] + predict) & 0xff;
    }
  }
  return { width, height, bpp, pixels: out };
}

// The differing pixels of two images: { size, band, rest, box, max } (box in px, and max the largest
// difference in one colour channel, 0 to 255, both of `rest`).
export function diff(pathA, pathB, { masks = [], rows = Infinity, band = 0 } = {}) {
  const A = readPng(pathA);
  const B = readPng(pathB);
  const size = A.width === B.width && A.height === B.height ? `${A.width}x${A.height}` : `${A.width}x${A.height} vs ${B.width}x${B.height}`;
  if (A.width !== B.width) return { size, band: NaN, rest: NaN, box: null };
  const height = Math.min(A.height, B.height, rows);
  const boxes = masks.map(([x0, y0, x1, y1]) => [x0 < 0 || Object.is(x0, -0) ? A.width + x0 : x0, y0, x1 < 0 || Object.is(x1, -0) ? A.width + x1 : x1, y1]);
  const masked = (x, y) => boxes.some(([x0, y0, x1, y1]) => x >= x0 && x < x1 && y >= y0 && y < y1);
  let inBand = 0, rest = 0, box = null, max = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < A.width; x++) {
      let delta = 0;
      for (let k = 0; k < 3; k++) delta = Math.max(delta, Math.abs(A.pixels[(y * A.width + x) * A.bpp + k] - B.pixels[(y * B.width + x) * B.bpp + k]));
      if (!delta || masked(x, y)) continue;
      if (y < band) inBand++;
      else {
        rest++;
        max = Math.max(max, delta);
        box = box ? [Math.min(box[0], x), Math.min(box[1], y), Math.max(box[2], x + 1), Math.max(box[3], y + 1)] : [x, y, x + 1, y + 1];
      }
    }
  return { size, band: inBand, rest, box, max };
}

const args = cli(import.meta.url, { mask: "", rows: Infinity, band: 0, live: false });
const [a, b] = args._;
if (!a || !b) throw new Error("two PNGs or two folders of PNGs (see --help)");
const options = {
  masks: args.mask ? args.mask.split(";").map((m) => m.split(",").map((v) => (v.trim() === "-0" ? -0 : Number(v)))) : [],
  rows: Number(args.rows),
  band: Number(args.band),
};
const pairs = statSync(a).isDirectory()
  ? readdirSync(a)
      .filter((f) => f.endsWith(".png"))
      .sort()
      .map((f) => [join(a, f), join(b, f)])
  : [[a, b]];
// the live boxes sweep recorded for a shot, from the shots.json beside it
const live = (path) => {
  try {
    return JSON.parse(readFileSync(join(dirname(path), "shots.json"), "utf8")).find((s) => s.name === basename(path))?.live ?? [];
  } catch {
    return [];
  }
};
let failed = 0, total = 0;
for (const [pa, pb] of pairs) {
  let r;
  try {
    r = diff(pa, pb, { ...options, masks: [...options.masks, ...(args.live ? [...live(pa), ...live(pb)] : [])] });
  } catch (e) {
    console.log(`${basename(pa).padEnd(40)} ${e.code === "ENOENT" ? "missing on one side" : e.message}`);
    failed++;
    continue;
  }
  total += r.rest || 0;
  if (r.rest !== 0) failed++;
  console.log(
    `${basename(pa).padEnd(40)} ${String(r.rest).padStart(8)} px differ${args.band ? `, ${r.band} in the top ${args.band} rows` : ""}${r.box ? `  box ${r.box.join(",")}, max ${r.max}` : ""}${r.size.includes("vs") ? `  sizes ${r.size}` : ""}`,
  );
}
console.log(`\n${pairs.length} pairs, ${failed} differ${args.band ? ` below the top ${args.band} rows` : ""}, ${total} px in all`);
process.exit(failed ? 1 : 0);
