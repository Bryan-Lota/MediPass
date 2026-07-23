"use client";

import { createContext, useCallback, useContext, useState } from "react";

export type ToastVariant = "success" | "error" | "info";

export interface ToastLink {
  href: string;
  label: string;
}

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  link?: ToastLink;
}

interface ToastContextValue {
  push: (message: string, variant?: ToastVariant, link?: ToastLink) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: "border-teal-200 bg-teal-100 text-teal-700",
  error: "border-danger-border bg-danger-bg text-danger-text",
  info: "border-line bg-white text-ink",
};

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  info: "🔔",
};

/**
 * Small popup notifications for the "micro pipeline" actions (submit, notify
 * regulators, approve, reject, request info) — mounted once in the root
 * layout so any page can call useToast().
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message: string, variant: ToastVariant = "info", link?: ToastLink) => {
      const id = crypto.randomUUID();
      setToasts((t) => [...t, { id, message, variant, link }]);
      setTimeout(() => dismiss(id), link ? 7000 : 4500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-2 rounded-xl border px-4 py-3 text-[13px] font-medium shadow-xl ${VARIANT_CLASSES[t.variant]}`}
          >
            <span aria-hidden="true">{VARIANT_ICON[t.variant]}</span>
            <span className="flex-1">
              {t.message}
              {t.link && (
                <a
                  href={t.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block font-semibold underline underline-offset-2"
                >
                  {t.link.label}
                </a>
              )}
            </span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="text-xs opacity-60 hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
