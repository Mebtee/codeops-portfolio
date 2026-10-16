import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  SESSION_TOKEN_PATTERN,
} from "@/lib/session-cookie";
import {
  createSession,
  deleteSession,
  getUserById,
  readSession,
} from "@/lib/auth";

export { SESSION_COOKIE };

export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token || !SESSION_TOKEN_PATTERN.test(token)) {
    return null;
  }
  const record = readSession(token);
  if (!record) {
    return null;
  }
  const user = getUserById(record.userId);
  if (!user) {
    return null;
  }
  return {
    token: record.token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function startSession(userId) {
  const token = createSession(userId);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return token;
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token && SESSION_TOKEN_PATTERN.test(token)) {
    deleteSession(token);
  }
  store.delete(SESSION_COOKIE);
}

export function safeNextPath(value, fallback = "/") {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return fallback;
  }
  if (value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  if (/[\u0000-\u001f]/.test(value)) {
    return fallback;
  }
  return value;
}
