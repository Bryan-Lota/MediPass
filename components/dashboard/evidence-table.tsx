"use client";

import { Card } from "@/components/ui/card";
import { EvidenceStatusBadge } from "@/components/dashboard/status-badge";
import { shortHash } from "@/lib/hash";
import type { EvidenceRecord } from "@/lib/types";

export type VerifyState = "idle" | "checking" | "match" | "mismatch";

interface EvidenceTableProps {
  rows: EvidenceRecord[];
  /** Manufacturer view: click a hash to copy the full anchored digest. */
  onCopyHash?: (row: EvidenceRecord) => void;
  /** Regulator view: per-row independent recompute-and-compare. */
  verifyState?: Record<string, VerifyState>;
  onVerify?: (row: EvidenceRecord) => void;
  /** Regulator view: approve a Pending Review record — the manufacturer sees this live. */
  onApprove?: (row: EvidenceRecord) => void;
  approvingIds?: Set<string>;
}

const verifyLabel: Record<VerifyState, string> = {
  idle: "Recompute",
  checking: "Checking…",
  match: "✓ Matches",
  mismatch: "✕ Mismatch",
};

export function EvidenceTable({
  rows,
  onCopyHash,
  verifyState,
  onVerify,
  onApprove,
  approvingIds,
}: EvidenceTableProps) {
  const showVerify = !!onVerify;
  const showApprove = !!onApprove;

  return (
    <Card className="overflow-x-auto p-5">
      <div className="mb-3.5 font-mono text-xs font-semibold text-muted">EVIDENCE RECORDS</div>
      <table className="w-full min-w-[760px] border-collapse text-[13px]">
        <thead>
          <tr className="text-left font-mono text-[11px] text-muted">
            <th className="px-2.5 py-2 font-semibold">DOCUMENT</th>
            <th className="px-2.5 py-2 font-semibold">TYPE</th>
            <th className="px-2.5 py-2 font-semibold">SHA-256</th>
            <th className="px-2.5 py-2 font-semibold">ISSUER</th>
            <th className="px-2.5 py-2 font-semibold">TIMESTAMP</th>
            <th className="px-2.5 py-2 font-semibold">BSV TXID</th>
            <th className="px-2.5 py-2 font-semibold">STATUS</th>
            {showVerify && <th className="px-2.5 py-2 font-semibold">VERIFY</th>}
            {showApprove && <th className="px-2.5 py-2 font-semibold">APPROVE</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-line">
              <td className="px-2.5 py-2.5">{row.name}</td>
              <td className="px-2.5 py-2.5 text-muted">{row.type}</td>
              <td className="px-2.5 py-2.5 font-mono">
                {onCopyHash ? (
                  <button
                    type="button"
                    onClick={() => onCopyHash(row)}
                    className="cursor-pointer bg-transparent text-left"
                    title="Copy full hash"
                  >
                    {shortHash(row.anchoredHash)} ⧉
                  </button>
                ) : (
                  shortHash(row.anchoredHash)
                )}
              </td>
              <td className="px-2.5 py-2.5 text-muted">{row.issuer}</td>
              <td className="px-2.5 py-2.5 font-mono text-muted">{row.timestamp}</td>
              <td className="px-2.5 py-2.5 font-mono text-muted">{row.txid}</td>
              <td className="px-2.5 py-2.5">
                <EvidenceStatusBadge status={row.status} />
              </td>
              {showVerify && (
                <td className="px-2.5 py-2.5">
                  <button
                    type="button"
                    onClick={() => onVerify?.(row)}
                    className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    {verifyLabel[verifyState?.[row.id] ?? "idle"]}
                  </button>
                </td>
              )}
              {showApprove && (
                <td className="px-2.5 py-2.5">
                  {row.status === "Pending Review" ? (
                    <button
                      type="button"
                      onClick={() => onApprove?.(row)}
                      disabled={approvingIds?.has(row.id)}
                      className="rounded-md bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white disabled:bg-teal-200"
                    >
                      {approvingIds?.has(row.id) ? "Approving…" : "Approve"}
                    </button>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
