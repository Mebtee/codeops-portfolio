// Safe localStorage read/write — JSON in, JSON out, never throws
// (private browsing / disabled storage just falls back to in-memory).

export function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable/full — app keeps working in-memory
  }
}

export function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
