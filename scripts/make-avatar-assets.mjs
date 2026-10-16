/*
 * Builds every avatar-derived file from src/assets/avatar-source.webp:
 *   public/avatar.png            512px, for the Person schema and links
 *   public/apple-touch-icon.png  180px
 *   public/favicon.png           96px, rounded
 *   public/img/avatar-mask.png   the particle map: each pixel is one flat colour
 *                                naming a part of the cat (see PARTS), or transparent
 *
 * Run after changing the avatar: node scripts/make-avatar-assets.mjs
 */
import sharp from "sharp";

const SOURCE = "src/assets/avatar-source.webp";
const MASK_SIZE = 320;

// Flat colours the hero script reads back as parts (src/scripts/hero-particles.ts).
const PARTS = {
  ink: [0, 0, 0],
  red: [255, 0, 0],
  yellow: [255, 255, 0],
  teal: [0, 255, 255],
  purple: [0, 0, 255],
  white: [255, 255, 255],
};

await sharp(SOURCE).resize(512).png({ compressionLevel: 9 }).toFile("public/avatar.png");
await sharp(SOURCE).resize(180).png({ compressionLevel: 9 }).toFile("public/apple-touch-icon.png");

const round = Buffer.from('<svg width="96" height="96"><rect width="96" height="96" rx="22" fill="#fff"/></svg>');
await sharp(SOURCE)
  .resize(96)
  .composite([{ input: round, blend: "dest-in" }])
  .png({ compressionLevel: 9 })
  .toFile("public/favicon.png");

const { data, info } = await sharp(SOURCE)
  .resize(MASK_SIZE, MASK_SIZE, { kernel: "lanczos3" })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height } = info;
const at = (x, y) => {
  const i = (y * width + x) * 3;
  return [data[i], data[i + 1], data[i + 2]];
};
const luma = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const isInk = (c) => luma(c) < 70 && Math.max(...c) - Math.min(...c) < 40;

// The pupils share their purple with the background, so they only count inside
// the head: between the leftmost and rightmost ink pixel on their row.
const rowSpan = Array.from({ length: height }, (_, y) => {
  let min = -1;
  let max = -1;
  for (let x = 0; x < width; x++) {
    if (!isInk(at(x, y))) continue;
    if (min < 0) min = x;
    max = x;
  }
  return [min, max];
});

const out = Buffer.alloc(width * height * 4);
const counts = Object.fromEntries(Object.keys(PARTS).map((k) => [k, 0]));
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const c = at(x, y);
    const [r, g, b] = c;
    let part = null;
    if (isInk(c)) part = "ink";
    else if (r > 200 && g < 110 && b < 110) part = "red";
    else if (r > 220 && g > 150 && b < 140) part = "yellow";
    else if (r < 90 && g > 150 && b > 150) part = "teal";
    else {
      const [min, max] = rowSpan[y];
      const inside = min >= 0 && x > min && x < max;
      const l = luma(c);
      // Dark pupils read as ink; only their lighter rim keeps the purple.
      if (inside && b > r + 10 && l > 60 && l < 175) part = l < 118 ? "ink" : "purple";
      // Eye whites, highlights and brows: blank on a light page, lit on a dark one.
      // Above the brows the light pixels are the sticker outline between the ears.
      else if (inside && l > 175 && y > height * 0.38) part = "white";
    }
    if (!part) continue;
    counts[part]++;
    const o = (y * width + x) * 4;
    const [pr, pg, pb] = PARTS[part];
    out[o] = pr;
    out[o + 1] = pg;
    out[o + 2] = pb;
    out[o + 3] = 255;
  }
}

await sharp(out, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9, palette: true })
  .toFile("public/img/avatar-mask.png");

console.log("avatar assets written", counts);
