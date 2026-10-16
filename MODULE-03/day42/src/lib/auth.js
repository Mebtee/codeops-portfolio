import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function readJson(file, fallback) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2), "utf8");
}

export function listUsers() {
  return readJson(USERS_FILE, []);
}

export function getUserById(id) {
  return listUsers().find((user) => user.id === id) ?? null;
}

export function findUserByEmail(email) {
  const wanted = String(email ?? "").trim().toLowerCase();
  if (!wanted) {
    return null;
  }
  return listUsers().find((user) => user.email.toLowerCase() === wanted) ?? null;
}

export function verifyPassword(user, password) {
  const [salt, stored] = String(user.password ?? "").split("$");
  if (!salt || !stored) {
    return false;
  }
  const candidate = crypto.scryptSync(String(password ?? ""), salt, 64);
  const expected = Buffer.from(stored, "hex");
  if (candidate.length !== expected.length) {
    return false;
  }
  return crypto.timingSafeEqual(candidate, expected);
}

export function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  const sessions = readJson(SESSIONS_FILE, []).filter(
    (session) => Date.parse(session.expiresAt) > now
  );
  sessions.push({
    token,
    userId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
  });
  writeJson(SESSIONS_FILE, sessions);
  return token;
}

export function readSession(token) {
  const sessions = readJson(SESSIONS_FILE, []);
  const found = sessions.find((session) => session.token === token);
  if (!found) {
    return null;
  }
  if (Date.parse(found.expiresAt) <= Date.now()) {
    deleteSession(token);
    return null;
  }
  return found;
}

export function deleteSession(token) {
  const sessions = readJson(SESSIONS_FILE, []);
  const remaining = sessions.filter((session) => session.token !== token);
  if (remaining.length !== sessions.length) {
    writeJson(SESSIONS_FILE, remaining);
  }
}
