import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const menu = JSON.parse(await readFile(path.join(root, "public", "menu.json"), "utf8"));

const palettes = {
  wat: ["#7f1d1d", "#b91c1c", "#ea580c"],
  tibs: ["#7c2d12", "#c2410c", "#f59e0b"],
  kitfo: ["#831843", "#be123c", "#fb7185"],
  fasting: ["#14532d", "#15803d", "#65a30d"],
  drinks: ["#713f12", "#a16207", "#eab308"],
};

function paletteFor(category) {
  const c = category.toLowerCase();
  if (c.includes("stew") || c.includes("wat")) return palettes.wat;
  if (c.includes("tibs") || c.includes("grill")) return palettes.tibs;
  if (c.includes("kitfo") || c.includes("cured")) return palettes.kitfo;
  if (c.includes("fasting") || c.includes("vegan")) return palettes.fasting;
  if (c.includes("beverage") || c.includes("tej")) return palettes.drinks;
  return palettes.wat;
}

function dishSvg(name, category, width, height) {
  const [a, b, c] = paletteFor(category);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${a}"/>
        <stop offset="55%" stop-color="${b}"/>
        <stop offset="100%" stop-color="${c}"/>
      </linearGradient>
      <radialGradient id="plate" cx="50%" cy="45%" r="42%">
        <stop offset="0%" stop-color="#fde68a" stop-opacity="0.95"/>
        <stop offset="70%" stop-color="#fbbf24" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#g)"/>
    <circle cx="${width / 2}" cy="${height / 2 - 30}" r="${height * 0.34}" fill="url(#plate)"/>
    <text x="${width / 2}" y="${height - 90}" font-family="Georgia, serif" font-size="52" fill="#fff7ed" text-anchor="middle" font-weight="bold">${escapeXml(name)}</text>
    <text x="${width / 2}" y="${height - 40}" font-family="Georgia, serif" font-size="26" fill="#fed7aa" text-anchor="middle">${escapeXml(category)}</text>
  </svg>`;
}

function heroSvg() {
  const circles = [];
  for (let i = 0; i < 60; i++) {
    const x = (i * 271) % 1920;
    const y = (i * 419) % 1080;
    const r = 18 + (i * 13) % 70;
    const o = 0.05 + (i % 5) * 0.02;
    circles.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#fbbf24" fill-opacity="${o.toFixed(2)}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
    <defs>
      <linearGradient id="h" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#450a0a"/>
        <stop offset="45%" stop-color="#991b1b"/>
        <stop offset="100%" stop-color="#f97316"/>
      </linearGradient>
      <radialGradient id="ember" cx="70%" cy="35%" r="55%">
        <stop offset="0%" stop-color="#fde68a" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#fde68a" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#h)"/>
    ${circles.join("\n    ")}
    <rect width="1920" height="1080" fill="url(#ember)"/>
    <circle cx="1400" cy="380" r="300" fill="#fbbf24" fill-opacity="0.35"/>
    <circle cx="480" cy="700" r="240" fill="#7f1d1d" fill-opacity="0.5"/>
    <text x="960" y="540" font-family="Georgia, serif" font-size="120" fill="#fff7ed" text-anchor="middle" font-weight="bold">Addis Eats</text>
    <text x="960" y="630" font-family="Georgia, serif" font-size="44" fill="#fed7aa" text-anchor="middle">Berbere, butter and fire</text>
  </svg>`;
}

function escapeXml(s) {
  return s.replace(/[<>&'"]/g, (ch) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[ch]));
}

const dishDir = path.join(root, "public", "images", "dishes");
await mkdir(dishDir, { recursive: true });

function makeGrain(width, height) {
  const pixels = Buffer.allocUnsafe(width * height * 3);
  for (let i = 0; i < pixels.length; i++) {
    pixels[i] = Math.floor(Math.random() * 256);
  }
  return sharp(pixels, { raw: { width, height, channels: 3 } })
    .blur(0.4)
    .png()
    .toBuffer();
}

for (const dish of menu.data) {
  const out = path.join(dishDir, `${dish.slug}.jpg`);
  const base = await sharp(Buffer.from(dishSvg(dish.nameEn, dish.category, 960, 720)))
    .png()
    .toBuffer();
  const grain = await makeGrain(960, 720);
  await sharp(base)
    .composite([{ input: grain, blend: "soft-light" }])
    .jpeg({ quality: 75, mozjpeg: true })
    .toFile(out);
  console.log("wrote", path.relative(root, out));
}

const hero = path.join(root, "public", "images", "hero-berbere-table.jpg");
const heroBuf = await sharp(Buffer.from(heroSvg()))
  .png()
  .toBuffer();
  const noise = await makeGrain(1920, 1080);
await sharp(heroBuf)
  .composite([{ input: noise, blend: "soft-light" }])
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile(hero);
console.log("wrote", path.relative(root, hero));
