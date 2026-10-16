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

const GUEST_PREFIX = "guest:";

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

export async function getSessionId() {
  const session = await getSession();
  if (session) {
    return session.user.id;
  }
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value ?? null;
  return value?.startsWith(GUEST_PREFIX) ? value : null;
}

export async function ensureSessionId() {
  const session = await getSession();
  if (session) {
    return session.user.id;
  }
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing?.startsWith(GUEST_PREFIX)) {
    return existing;
  }
  const guestId = `${GUEST_PREFIX}${crypto.randomUUID()}`;
  store.set(SESSION_COOKIE, guestId, SESSION_COOKIE_OPTIONS);
  return guestId;
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
