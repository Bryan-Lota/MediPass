"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function DecisionModal({
  open,
  title,
  description,
  confirmLabel,
  confirmVariant = "danger",
  busy,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: "danger" | "warning";
  busy?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="mb-3 text-sm text-muted">{description}</p>
      <label className="mb-1 block text-xs font-semibold text-muted">REASON (sent to the manufacturer)</label>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={4}
        placeholder="Explain what's missing or needs fixing, in plain English…"
        className="mb-4 w-full rounded-lg border border-line px-3 py-2 text-sm"
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant={confirmVariant}
          size="sm"
          disabled={busy || !reason.trim()}
          onClick={() => onConfirm(reason.trim())}
        >
          {busy ? "Submitting…" : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
