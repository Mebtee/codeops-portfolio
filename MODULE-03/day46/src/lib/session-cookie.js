export const SESSION_COOKIE = "addis_eats_session";

export const SESSION_TOKEN_PATTERN = /^[0-9a-f]{64}$/;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export function isSessionToken(value) {
  return typeof value === "string" && SESSION_TOKEN_PATTERN.test(value);
}
