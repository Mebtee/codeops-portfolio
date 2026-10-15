import fs from "node:fs";
import path from "node:path";

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

function readMenu() {
  const file = path.join(process.cwd(), "public", "menu.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function normalize(raw) {
  return {
    id: raw.slug || raw.id,
    name: raw.nameEn || raw.name || raw.slug || "Unnamed dish",
    price: Number(raw.priceETB ?? raw.price ?? 0),
    cat:
      Object.entries(CAT_MAP).find(([key]) =>
        String(raw.category || "")
          .toLowerCase()
          .includes(key)
      )?.[1] || "wat",
    tag: raw.tag || "",
    tagline: raw.tagline || "",
    spice: raw.spiceLevel || raw.spice || "1/5",
    desc: raw.description || raw.desc || "",
    servings: raw.servings || "",
    isFasting: Boolean(raw.isFasting),
    amName: raw.nameAm || "no amharic name",
  };
}

export function getMenuSlugs() {
  return (readMenu().data || [])
    .map((dish) => dish.slug || dish.id)
    .filter(Boolean);
}

export function getDishBySlug(slug) {
  const raw = (readMenu().data || []).find(
    (dish) => (dish.slug || dish.id) === slug
  );
  return raw ? normalize(raw) : null;
}
