import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function readAll() {
  try {
    const parsed = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(orders) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
}

export function newOrder(payload, sessionId) {
  const reference = `AE-${Date.now().toString().slice(-6)}`;
  return {
    id: crypto.randomUUID(),
    reference,
    sessionId,
    status: "pending",
    createdAt: new Date().toISOString(),
    ...payload,
  };
}

export function listOrders() {
  return readAll();
}

export function getOrder(id) {
  return readAll().find((order) => order.id === id) ?? null;
}

export function createOrder(order) {
  const orders = readAll();
  orders.push(order);
  writeAll(orders);
  return order;
}

export function updateOrder(id, patch) {
  const orders = readAll();
  const index = orders.findIndex((order) => order.id === id);
  if (index === -1) {
    return null;
  }
  orders[index] = {
    ...orders[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  writeAll(orders);
  return orders[index];
}
