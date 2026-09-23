import type { Session } from "./types";

export const SESSION_STORAGE_KEY = "expense-tracker:session";

/**
 * Reads the stored session, dropping anything malformed or expired.
 * Returns `null` on the server, where `localStorage` does not exist.
 */
export function readStoredSession(): Session | null {
  if (typeof window === "undefined") {
    return null;
  }

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    // Storage can be blocked entirely (private mode, site-data restrictions).
    return null;
  }

  if (!raw) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    clearStoredSession();
    return null;
  }

  if (!isSession(parsed) || parsed.expiresAt <= Date.now()) {
    clearStoredSession();
    return null;
  }

  return parsed;
}

export function writeStoredSession(session: Session): void {
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Losing persistence is acceptable — the in-memory session still works.
  }
}

export function clearStoredSession(): void {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Nothing to do — see `writeStoredSession`.
  }
}

function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<Session>;
  return (
    typeof candidate.accessToken === "string" &&
    typeof candidate.tokenType === "string" &&
    typeof candidate.expiresAt === "number" &&
    typeof candidate.user === "object" &&
    candidate.user !== null &&
    typeof candidate.user.id === "number" &&
    typeof candidate.user.name === "string" &&
    typeof candidate.user.email === "string"
  );
}
