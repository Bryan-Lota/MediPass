"use client";

import { EvidenceStatusBadge } from "@/components/dashboard/status-badge";
import { shortHash } from "@/lib/hash";
import type { EvidenceRecord } from "@/lib/types";

const TYPE_ICON: Record<string, string> = {
  QMS: "📋",
  Test: "🧪",
  DoC: "📜",
  UDI: "🏷️",
};

/**
 * A plain, minimal list of documents — the brief asks for something that
 * "doesn't look really technical", so this replaces the dense data table
 * with cards that surface only name, type and status. Everything else
 * (hash, txid, notes, actions) lives one click away in the "View" detail panel.
 */
export function EvidenceList({
  rows,
  onView,
}: {
  rows: EvidenceRecord[];
  onView: (row: EvidenceRecord) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">
        No documents for this market yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((row) => (
        <button
          key={row.id}
          type="button"
          onClick={() => onView(row)}
          className="flex items-center justify-between gap-4 rounded-xl border border-line bg-white px-5 py-4 text-left shadow-card transition-colors hover:border-teal-300 hover:bg-teal-50/40"
        >
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-lg">
              {TYPE_ICON[row.type] ?? "📄"}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{row.name}</div>
              <div className="truncate text-xs text-muted">
                {row.type} · {row.issuer} · {shortHash(row.anchoredHash, 8, 4)}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <EvidenceStatusBadge status={row.status} />
            <span className="hidden text-xs font-semibold text-teal-700 sm:inline">View →</span>
          </div>
        </button>
      ))}
    </div>
  );
}
