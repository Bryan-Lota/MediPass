"use client";

import { Card } from "@/components/ui/card";
import { EvidenceStatusBadge } from "@/components/dashboard/status-badge";
import { shortHash } from "@/lib/hash";
import { isRealTxid, explorerTxUrl } from "@/lib/bsv/explorer";
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
  /** Regulator view: reject a Pending Review record — the manufacturer sees this live. */
  onReject?: (row: EvidenceRecord) => void;
  rejectingIds?: Set<string>;
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
  onReject,
  rejectingIds,
}: EvidenceTableProps) {
  const showVerify = !!onVerify;
  const showDecision = !!onApprove || !!onReject;

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
            {showDecision && <th className="px-2.5 py-2 font-semibold">DECISION</th>}
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
              <td className="px-2.5 py-2.5 font-mono text-muted">
                {isRealTxid(row.txid) ? (
                  <a
                    href={explorerTxUrl(row.txid)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-teal-700 hover:underline"
                    title="View on WhatsOnChain"
                  >
                    {shortHash(row.txid, 6, 4)} ↗
                  </a>
                ) : (
                  row.txid
                )}
              </td>
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
              {showDecision && (
                <td className="px-2.5 py-2.5">
                  {row.status === "Pending Review" ? (
                    <div className="flex gap-1.5">
                      {onApprove && (
                        <button
                          type="button"
                          onClick={() => onApprove(row)}
                          disabled={approvingIds?.has(row.id) || rejectingIds?.has(row.id)}
                          className="rounded-md bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white disabled:bg-teal-200"
                        >
                          {approvingIds?.has(row.id) ? "Approving…" : "Approve"}
                        </button>
                      )}
                      {onReject && (
                        <button
                          type="button"
                          onClick={() => onReject(row)}
                          disabled={approvingIds?.has(row.id) || rejectingIds?.has(row.id)}
                          className="rounded-md border border-danger-border bg-danger-bg px-3 py-1.5 text-xs font-semibold text-danger-text disabled:opacity-50"
                        >
                          {rejectingIds?.has(row.id) ? "Rejecting…" : "Reject"}
                        </button>
                      )}
                    </div>
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
