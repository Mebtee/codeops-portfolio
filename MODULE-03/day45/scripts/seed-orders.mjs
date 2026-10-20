import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const MENU_FILE = path.join(ROOT, "public", "menu.json");

const DAYS = 30;
const TARGET_DEMO_ORDERS = 160;

const AREAS = [
  { name: "Bole", weight: 26 },
  { name: "Kazanchis", weight: 14 },
  { name: "Piassa", weight: 12 },
  { name: "CMC", weight: 11 },
  { name: "Megenagna", weight: 10 },
  { name: "Sarbet", weight: 9 },
  { name: "Ayat", weight: 8 },
  { name: "Summit", weight: 6 },
  { name: "Gerji", weight: 4 },
];

const PEOPLE = [
  ["Hanna Girma", "hanna.girma"],
  ["Yonas Tadesse", "yonas.tadesse"],
  ["Selamawit Bekele", "selam.bekele"],
  ["Abel Fikru", "abel.fikru"],
  ["Liya Tesfaye", "liya.tesfaye"],
  ["Kalkidan Assefa", "kalkidan.assefa"],
  ["Dawit Haile", "dawit.haile"],
  ["Marta Solomon", "marta.solomon"],
  ["Nardos Alemu", "nardos.alemu"],
  ["Samuel Worku", "samuel.worku"],
  ["Betelhem Tesfahun", "beth.tefsahun"],
  ["Robel Gashaw", "robel.gashaw"],
];

const STREETS = [
  "Bole Road, House 12",
  "Behind Edna Mall, House 402",
  "Africa Avenue, Villa 7",
  "Ring Road, Building 3",
  "Stadium Road, House 88",
  "Gerji Road, Flat 4B",
  "Megenagna, above the bakery",
];

const PAYMENTS = ["cash", "cash", "cash", "telebirr", "telebirr"];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20261020);

const pickWeighted = (entries) => {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = random() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry;
  }
  return entries[entries.length - 1];
};

const pick = (list) => list[Math.floor(random() * list.length)];

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

const menu = readJson(MENU_FILE, { data: [] }).data ?? [];
if (!menu.length) {
  console.error("public/menu.json has no dishes — run the app seed first.");
  process.exit(1);
}

const users = readJson(USERS_FILE, []);
const sessionIds = users.length
  ? users.map((user) => user.id)
  : ["usr_marta", "usr_dawit"];

const existing = readJson(ORDERS_FILE, []);
const kept = existing.filter((order) => !order.demo);

function itemsForOrder() {
  const count = 1 + Math.floor(random() * 3);
  const chosen = [];
  while (chosen.length < count) {
    const dish = menu[Math.floor(random() * menu.length)];
    if (chosen.some((item) => item.slug === dish.slug)) continue;
    chosen.push({
      slug: dish.slug,
      name: dish.nameEn || dish.name || dish.slug,
      price: Number(dish.priceETB ?? 0),
      quantity: 1 + Math.floor(random() * 2),
    });
  }
  return chosen;
}

function statusForAge(ageDays) {
  if (ageDays > 7) {
    return pickWeighted([
      { value: "delivered", weight: 88 },
      { value: "cancelled", weight: 12 },
    ]);
  }
  if (ageDays > 2) {
    return pickWeighted([
      { value: "delivered", weight: 80 },
      { value: "cancelled", weight: 8 },
      { value: "pending", weight: 12 },
    ]);
  }
  return pickWeighted([
    { value: "delivered", weight: 45 },
    { value: "pending", weight: 20 },
    { value: "preparing", weight: 15 },
    { value: "ready", weight: 12 },
    { value: "cancelled", weight: 8 },
  ]);
}

const now = Date.now();
const orders = [];

for (let index = 0; index < TARGET_DEMO_ORDERS; index += 1) {
  const ageDays = Math.floor(random() * DAYS);
  const dayStart = new Date(now - ageDays * 86400000);
  dayStart.setHours(10 + Math.floor(random() * 11), Math.floor(random() * 60), 0, 0);

  const [name, slugName] = pick(PEOPLE);
  const area = pickWeighted(AREAS).name;
  const payment = pick(PAYMENTS);

  orders.push({
    id: crypto.randomUUID(),
    reference: `AE-${(100000 + Math.floor(random() * 899999)).toString()}`,
    sessionId: pick(sessionIds),
    status: statusForAge(ageDays),
    createdAt: dayStart.toISOString(),
    name,
    phone: `09${Math.floor(10000000 + random() * 89999999)}`,
    email: `${slugName}@example.com`,
    subcity: area,
    street: pick(STREETS),
    landmark: "",
    timing: "immediate",
    scheduleTime: "",
    payment,
    telebirrPhone: payment === "telebirr" ? `09${Math.floor(10000000 + random() * 89999999)}` : "",
    items: itemsForOrder(),
    demo: true,
  });
}

orders.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(ORDERS_FILE, JSON.stringify([...kept, ...orders], null, 2), "utf8");

console.log(
  `Seeded ${orders.length} demo orders (kept ${kept.length} real) across ${AREAS.length} neighbourhoods, ${DAYS} days.`
);
