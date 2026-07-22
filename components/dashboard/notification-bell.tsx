"use client";

import { useEffect, useRef, useState } from "react";
import { useNotifications } from "@/lib/notifications";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export function NotificationBell({ role }: { role: Role }) {
  const { notificationsFor, unreadCountFor, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  const items = notificationsFor(role);
  const unread = unreadCountFor(role);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-base hover:border-teal-600"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger-text px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-2xl border border-line bg-white p-2 shadow-xl">
          <div className="flex items-center justify-between px-2.5 py-2">
            <span className="font-mono text-[11px] font-semibold text-muted">NOTIFICATIONS</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllRead(role)}
                className="text-xs font-semibold text-teal-700"
              >
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <div className="px-2.5 py-8 text-center text-xs text-muted">No notifications yet.</div>
          ) : (
            <div className="flex flex-col gap-1">
              {items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "rounded-lg px-2.5 py-2 text-left text-[13px] leading-snug",
                    n.read ? "text-muted" : "bg-teal-50 font-medium text-ink"
                  )}
                >
                  {n.message}
                  <div className="mt-0.5 font-mono text-[10px] text-muted">{n.timestamp}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
