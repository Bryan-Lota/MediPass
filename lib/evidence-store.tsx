"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { passports as factoryPassports } from "./mock-data";
import type { DevicePassport } from "./types";

const STORAGE_KEY = "digimedpass_evidence_store_v1";

type PassportMap = Record<string, DevicePassport>;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function loadFromStorage(): PassportMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PassportMap;
  } catch {
    // fall through to factory defaults
  }
  return clone(factoryPassports);
}

interface EvidenceStoreValue {
  /** True once the initial localStorage read has completed. */
  ready: boolean;
  passports: PassportMap;
  /** Apply a mutation to one passport and persist it — the write-through that keeps every tab in sync. */
  updatePassport: (id: string, updater: (passport: DevicePassport) => DevicePassport) => void;
  /** Discard local changes to one passport and restore its original demo fixture. */
  resetPassport: (id: string) => void;
}

const EvidenceStoreContext = createContext<EvidenceStoreValue | null>(null);

/**
 * Shared, localStorage-persisted evidence state for both dashboards.
 *
 * This is what "connects" the manufacturer and regulator views: rather than each
 * page holding its own disconnected in-memory copy, both read and write this one
 * store. Changes here also fire the browser's native `storage` event in *other*
 * open tabs, so a manufacturer tab and a regulator tab (signed in separately —
 * see lib/session.tsx) see each other's actions live, without a refresh.
 *
 * This is the seam a real backend/BSV anchoring integration would replace later:
 * `updatePassport` is the one place that would become an API call.
 */
export function EvidenceStoreProvider({ children }: { children: React.ReactNode }) {
  const [passports, setPassports] = useState<PassportMap>(() => clone(factoryPassports));
  const [ready, setReady] = useState(false);
  const passportsRef = useRef(passports);
  passportsRef.current = passports;

  useEffect(() => {
    setPassports(loadFromStorage());
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setPassports(e.newValue ? (JSON.parse(e.newValue) as PassportMap) : clone(factoryPassports));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: PassportMap) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const updatePassport = useCallback(
    (id: string, updater: (passport: DevicePassport) => DevicePassport) => {
      const current = passportsRef.current;
      const existing = current[id];
      if (!existing) return;
      const next = { ...current, [id]: updater(existing) };
      setPassports(next);
      persist(next);
    },
    [persist]
  );

  const resetPassport = useCallback(
    (id: string) => {
      const original = factoryPassports[id];
      if (!original) return;
      updatePassport(id, () => clone(original));
    },
    [updatePassport]
  );

  return (
    <EvidenceStoreContext.Provider value={{ ready, passports, updatePassport, resetPassport }}>
      {children}
    </EvidenceStoreContext.Provider>
  );
}

export function useEvidenceStore() {
  const ctx = useContext(EvidenceStoreContext);
  if (!ctx) throw new Error("useEvidenceStore must be used within EvidenceStoreProvider");
  return ctx;
}
