"use client";

import type { EvidenceStatus } from "@/lib/types";

const STATUS_OPTIONS: (EvidenceStatus | "All")[] = [
  "All",
  "Pending Review",
  "Verified",
  "Rejected",
  "Info Requested",
  "Revoked",
  "Tampered",
];

export function EvidenceFilterBar({
  status,
  onStatusChange,
  search,
  onSearchChange,
}: {
  status: EvidenceStatus | "All";
  onStatusChange: (s: EvidenceStatus | "All") => void;
  search: string;
  onSearchChange: (s: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by document name, type or issuer…"
        className="min-w-[220px] flex-1 rounded-full border border-line bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-1"
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as EvidenceStatus | "All")}
        className="rounded-full border border-line bg-white px-4 py-2 text-sm"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s === "All" ? "All statuses" : s}
          </option>
        ))}
      </select>
    </div>
  );
}
