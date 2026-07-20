"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Role, Session } from "./types";

const STORAGE_KEY = "digimedpass_session";

interface SessionContextValue {
  session: Session | null;
  /** True once the initial sessionStorage read has completed. */
  ready: boolean;
  signIn: (email: string, role: Role) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Session lives in sessionStorage (per-tab), not localStorage. That's what lets
 * one tab be signed in as the manufacturer and another as the regulator at the
 * same time — the shared evidence data (lib/evidence-store.tsx) still syncs
 * between them via localStorage, so the two roles can hand off work live.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  const signIn = useCallback((email: string, role: Role) => {
    const next: Session = { email, role, ts: Date.now() };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const signOut = useCallback(() => {
    window.sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  return (
    <SessionContext.Provider value={{ session, ready, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
