"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Role } from "./types";

const STORAGE_KEY = "medpass_notifications_v1";
const MAX_NOTIFICATIONS = 50;

export type NotificationKind = "info" | "success" | "error";

export interface NotificationItem {
  id: string;
  /** Which role's inbox this belongs to — regulators see submissions, manufacturers see decisions. */
  role: Role;
  message: string;
  kind: NotificationKind;
  timestamp: string;
  createdAt: number;
  read: boolean;
}

interface NotificationContextValue {
  ready: boolean;
  notificationsFor: (role: Role) => NotificationItem[];
  unreadCountFor: (role: Role) => number;
  push: (role: Role, message: string, kind?: NotificationKind) => void;
  markRead: (id: string) => void;
  markAllRead: (role: Role) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

function loadAll(): NotificationItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as NotificationItem[];
  } catch {
    // fall through to empty inbox
  }
  return [];
}

/**
 * A persistent notification inbox — unlike the ephemeral toasts in lib/toast.tsx
 * (which vanish after a few seconds), these stick around until read, are
 * scoped per role, and sync live across tabs the same way the evidence store
 * does (localStorage + the native `storage` event).
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(loadAll());
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setItems(e.newValue ? (JSON.parse(e.newValue) as NotificationItem[]) : []);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: NotificationItem[]) => {
    setItems(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const push = useCallback(
    (role: Role, message: string, kind: NotificationKind = "info") => {
      const item: NotificationItem = {
        id: crypto.randomUUID(),
        role,
        message,
        kind,
        timestamp: "just now",
        createdAt: Date.now(),
        read: false,
      };
      persist([item, ...loadAll()].slice(0, MAX_NOTIFICATIONS));
    },
    [persist]
  );

  const markRead = useCallback(
    (id: string) => {
      persist(loadAll().map((n) => (n.id === id ? { ...n, read: true } : n)));
    },
    [persist]
  );

  const markAllRead = useCallback(
    (role: Role) => {
      persist(loadAll().map((n) => (n.role === role ? { ...n, read: true } : n)));
    },
    [persist]
  );

  const notificationsFor = useCallback(
    (role: Role) => items.filter((n) => n.role === role).sort((a, b) => b.createdAt - a.createdAt),
    [items]
  );

  const unreadCountFor = useCallback(
    (role: Role) => items.filter((n) => n.role === role && !n.read).length,
    [items]
  );

  return (
    <NotificationContext.Provider
      value={{ ready, notificationsFor, unreadCountFor, push, markRead, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
