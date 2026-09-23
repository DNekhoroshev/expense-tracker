"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { clearStoredSession, readStoredSession, SESSION_STORAGE_KEY, writeStoredSession } from "./session-storage";
import { toSession, type AuthResponse, type Session } from "./types";

export type SessionStatus = "loading" | "authenticated" | "anonymous";

type SessionContextValue = {
  session: Session | null;
  status: SessionStatus;
  /** Persists the session returned by `/api/auth/login` or `/api/auth/register`. */
  signIn: (response: AuthResponse) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  // The stored session is only readable in the browser, so the first render
  // (server and hydration) always starts out as "loading".
  useEffect(() => {
    const stored = readStoredSession();
    setSession(stored);
    setStatus(stored ? "authenticated" : "anonymous");
  }, []);

  // Keep tabs in sync: signing out in one tab signs out the others.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== null && event.key !== SESSION_STORAGE_KEY) {
        return;
      }
      const stored = readStoredSession();
      setSession(stored);
      setStatus(stored ? "authenticated" : "anonymous");
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const signIn = useCallback((response: AuthResponse) => {
    const next = toSession(response);
    writeStoredSession(next);
    setSession(next);
    setStatus("authenticated");
  }, []);

  const signOut = useCallback(() => {
    clearStoredSession();
    setSession(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ session, status, signIn, signOut }),
    [session, status, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (context === null) {
    throw new Error("useSession must be used within a <SessionProvider>");
  }

  return context;
}
