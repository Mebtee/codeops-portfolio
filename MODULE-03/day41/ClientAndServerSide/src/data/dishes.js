import fs from "node:fs";
import path from "node:path";

export const CATEGORIES = [
  { key: "all", label: "All Dishes" },
  { key: "wat", label: "Traditional Stews & Wat" },
  { key: "tibs", label: "Tibs & Grills" },
  { key: "fasting", label: "Fasting / Tsom" },
  { key: "bites", label: "Breakfast & Bites" },
  { key: "drinks", label: "Tej & Beverages" },
  { key: "extras", label: "Injera & Extras" },
];

const CAT_MAP = {
  stews: "wat",
  wat: "wat",
  traditional: "wat",
  tibs: "tibs",
  grills: "tibs",
  raw: "tibs",
  cured: "tibs",
  kitfo: "tibs",
  fasting: "fasting",
  tsom: "fasting",
  vegan: "fasting",
  breakfast: "bites",
  bites: "bites",
  drinks: "drinks",
  beverages: "drinks",
  extras: "extras",
  injera: "extras",
};

const DELAY_MS = 800;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readMenu() {
  const file = path.join(process.cwd(), "public", "menu.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function categoryKeyOf(rawCategory) {
  const value = String(rawCategory || "").toLowerCase();
  const hit = Object.entries(CAT_MAP).find(([token]) => value.includes(token));
  return hit ? hit[1] : "wat";
}

function normalize(raw) {
  const cat = categoryKeyOf(raw.category);
  const catLabel = CATEGORIES.find((entry) => entry.key === cat)?.label ?? cat;

  return {
    id: raw.id,
    slug: raw.slug || raw.id,
    name: raw.nameEn || raw.name || raw.slug,
    nameAm: raw.nameAm || "",
    price: Number(raw.priceETB ?? 0),
    cat,
    catLabel,
    spice: raw.spiceLevel || "1/3",
    isFasting: Boolean(raw.isFasting),
    isSpecial: Boolean(raw.isSpecial),
    desc: raw.description || "",
    ingredients: raw.ingredients || [],
    servings: raw.servings || "",
  };
}

export const DISHES = (readMenu().data || []).map(normalize);

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const fmt = (value) =>
  "ETB " + Number(value || 0).toLocaleString("en-US");

export async function getDishes() {
  await wait(DELAY_MS);
  return DISHES;
}

export async function getDishesByCategory(key) {
  const dishes = await getDishes();
  if (key === "all") return dishes;
  return dishes.filter((dish) => dish.cat === key);
}

export function getDishBySlug(slug) {
  return DISHES.find((dish) => dish.slug === slug) ?? null;
}

export function getCategoryBySlug(slug) {
  return CATEGORIES.find((category) => category.key === slug) ?? null;
}

export function getCategoryCounts() {
  return CATEGORIES.map((category) => ({
    ...category,
    count:
      category.key === "all"
        ? DISHES.length
        : DISHES.filter((dish) => dish.cat === category.key).length,
  }));
}
