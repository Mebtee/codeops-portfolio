import { cookies } from "next/headers";

export const SESSION_COOKIE = "addis_eats_session";

export async function getSessionId() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function ensureSessionId() {
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing) {
    return existing;
  }
  const id = crypto.randomUUID();
  store.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return id;
}
