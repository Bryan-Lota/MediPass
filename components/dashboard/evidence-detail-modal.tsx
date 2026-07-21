"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { EvidenceStatusBadge } from "@/components/dashboard/status-badge";
import { shortHash } from "@/lib/hash";
import { isRealTxid, explorerTxUrl } from "@/lib/bsv/explorer";
import type { EvidenceRecord } from "@/lib/types";

export type VerifyState = "idle" | "checking" | "match" | "mismatch";

const VERIFY_LABEL: Record<VerifyState, string> = {
  idle: "Recompute & verify",
  checking: "Checking…",
  match: "✓ Hash matches",
  mismatch: "✕ Hash mismatch",
};

interface EvidenceDetailModalProps {
  row: EvidenceRecord | null;
  onClose: () => void;
  onCopyHash?: (row: EvidenceRecord) => void;
  copied?: boolean;

  /** Regulator-only: independently recompute the document hash and compare to the anchored commitment. */
  onVerify?: (row: EvidenceRecord) => void;
  verifyState?: VerifyState;

  /** Manufacturer-only: pull a not-yet-approved document so a corrected one can be reuploaded. */
  onRemove?: (row: EvidenceRecord) => void;
  removing?: boolean;

  /** Regulator-only: the three decision options. */
  onApprove?: (row: EvidenceRecord) => void;
  onReject?: (row: EvidenceRecord) => void;
  onRequestInfo?: (row: EvidenceRecord) => void;
  approving?: boolean;
  rejecting?: boolean;
  requestingInfo?: boolean;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line py-2.5 last:border-b-0">
      <span className="font-mono text-[10px] font-semibold text-muted">{label}</span>
      <span className="text-sm">{children}</span>
    </div>
  );
}

export function EvidenceDetailModal({
  row,
  onClose,
  onCopyHash,
  copied,
  onVerify,
  verifyState,
  onRemove,
  removing,
  onApprove,
  onReject,
  onRequestInfo,
  approving,
  rejecting,
  requestingInfo,
}: EvidenceDetailModalProps) {
  if (!row) return null;

  const pending = row.status === "Pending Review";
  const removable = onRemove && row.status !== "Verified";
  const busy = !!(approving || rejecting || requestingInfo || removing);

  return (
    <Modal open={!!row} onClose={onClose} title={row.name}>
      <div className="mb-1">
        <Field label="STATUS">
          <EvidenceStatusBadge status={row.status} />
        </Field>
        <Field label="EVIDENCE TYPE">{row.type}</Field>
        <Field label="MARKET">{row.markets.join(" · ")}</Field>
        <Field label="ISSUER">{row.issuer}</Field>
        <Field label="SUBMITTED">{row.timestamp}</Field>
        <Field label="SHA-256 COMMITMENT">
          <button
            type="button"
            onClick={() => onCopyHash?.(row)}
            className="cursor-pointer bg-transparent text-left font-mono text-xs"
            title="Copy full hash"
          >
            {shortHash(row.anchoredHash, 16, 8)} {onCopyHash && (copied ? "✓ copied" : "⧉")}
          </button>
        </Field>
        <Field label="BSV TXID">
          {isRealTxid(row.txid) ? (
            <a
              href={explorerTxUrl(row.txid)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs font-semibold text-teal-700 hover:underline"
            >
              {shortHash(row.txid, 10, 6)} — view on WhatsOnChain ↗
            </a>
          ) : (
            <span className="font-mono text-xs text-muted">{row.txid} (not yet anchored)</span>
          )}
        </Field>
        {row.regulatorNote && (
          <Field label={row.status === "Rejected" ? "REJECTION REASON" : "REGULATOR NOTE"}>
            <span className="text-danger-text">{row.regulatorNote}</span>
          </Field>
        )}
      </div>

      {onVerify && (
        <button
          type="button"
          onClick={() => onVerify(row)}
          disabled={verifyState === "checking"}
          className="mt-2 w-full rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white disabled:opacity-70"
        >
          {VERIFY_LABEL[verifyState ?? "idle"]}
        </button>
      )}

      {(onApprove || onReject || onRequestInfo) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {pending ? (
            <>
              {onApprove && (
                <Button variant="primary" size="sm" disabled={busy} onClick={() => onApprove(row)}>
                  {approving ? "Approving…" : "Approve"}
                </Button>
              )}
              {onRequestInfo && (
                <Button variant="warning" size="sm" disabled={busy} onClick={() => onRequestInfo(row)}>
                  Ask for further docs
                </Button>
              )}
              {onReject && (
                <Button variant="danger" size="sm" disabled={busy} onClick={() => onReject(row)}>
                  Reject
                </Button>
              )}
            </>
          ) : (
            <span className="text-xs text-muted">This record has already been decided.</span>
          )}
        </div>
      )}

      {removable && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-teal-50 p-3">
          <p className="text-xs text-muted">
            Made a mistake? Remove this document and upload a corrected one from the form below.
          </p>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => onRemove?.(row)}>
            {removing ? "Removing…" : "Remove"}
          </Button>
        </div>
      )}
    </Modal>
  );
}
