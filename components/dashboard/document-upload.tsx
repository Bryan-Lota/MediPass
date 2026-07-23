"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatFileSize, sha256HexBytes } from "@/lib/hash";
import { encryptBytes } from "@/lib/vault";
import { EVIDENCE_TYPES } from "@/lib/evidence-types";
import { isRealTxid, explorerTxUrl } from "@/lib/bsv/explorer";
import type { Market } from "@/lib/types";

/** Off-chain storage is password-protected (AES-GCM, see lib/vault.ts) but still local to this browser. Keep it small. */
export const MAX_FILE_BYTES = 1 * 1024 * 1024;

export interface DocumentUploadProps {
  /** The active EU/FDA tab — a new upload always targets it, no separate market picker. */
  market: Market;
  onUpload: (file: File, typeCode: string, market: Market, hash: string, encryptedContent: string) => void;
  busy: boolean;
  statusLabel: string | null;
  error?: string | null;
  successMessage?: string | null;
  /** The real txid from the anchor that produced successMessage — renders a "View on-chain" link. */
  successTxid?: string | null;
  /** Bump this (e.g. a counter) after a successful upload to clear the selected file. */
  resetSignal?: number;
}

export function DocumentUpload({
  market,
  onUpload,
  busy,
  statusLabel,
  error,
  successMessage,
  successTxid,
  resetSignal,
}: DocumentUploadProps) {
  const availableTypes = useMemo(
    () => EVIDENCE_TYPES.filter((t) => t.markets.includes(market)),
    [market]
  );
  const [file, setFile] = useState<File | null>(null);
  const [typeCode, setTypeCode] = useState(availableTypes[0]?.code ?? EVIDENCE_TYPES[0]!.code);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Hashing AND encrypting both start the moment a file is chosen, not on submit — by the time
  // "Upload & anchor" is clicked (usually after picking an evidence type), both are normally
  // already done, so the only wait left is the real, honest network round trip to anchor it.
  const preparePromiseRef = useRef<Promise<{ hash: string; encryptedContent: string }> | null>(null);

  useEffect(() => {
    if (!availableTypes.some((t) => t.code === typeCode)) {
      setTypeCode(availableTypes[0]?.code ?? EVIDENCE_TYPES[0]!.code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market]);

  useEffect(() => {
    if (resetSignal !== undefined) {
      setFile(null);
      preparePromiseRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  const applyFile = useCallback((f: File) => {
    if (f.size > MAX_FILE_BYTES) {
      setLocalError(
        `"${f.name}" is ${formatFileSize(f.size)} — this demo keeps documents in the browser's local storage, capped at ${formatFileSize(MAX_FILE_BYTES)}.`
      );
      return;
    }
    setLocalError(null);
    setFile(f);
    preparePromiseRef.current = f.arrayBuffer().then(async (bytes) => {
      const [hash, encryptedContent] = await Promise.all([sha256HexBytes(bytes), encryptBytes(bytes)]);
      return { hash, encryptedContent };
    });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files?.[0];
      if (f) applyFile(f);
    },
    [applyFile]
  );

  const handleSubmit = useCallback(async () => {
    if (!file || !preparePromiseRef.current) {
      setLocalError("Choose a document to upload first.");
      return;
    }
    setLocalError(null);
    const { hash, encryptedContent } = await preparePromiseRef.current;
    onUpload(file, typeCode, market, hash, encryptedContent);
  }, [file, typeCode, market, onUpload]);

  const displayError = localError ?? error;

  return (
    <div className="flex flex-col gap-4 rounded-xl border-2 border-dashed border-teal-200 bg-white p-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={`flex min-h-[104px] flex-col items-center justify-center gap-2.5 rounded-lg border px-4 py-5 text-center transition-colors ${
          dragActive ? "border-teal-600 bg-teal-50" : "border-line bg-teal-50/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) applyFile(f);
            e.target.value = "";
          }}
        />
        {file ? (
          <>
            <div>
              <div className="text-sm font-semibold">{file.name}</div>
              <div className="text-xs text-muted">{formatFileSize(file.size)}</div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              Replace file
            </Button>
          </>
        ) : (
          <>
            <div className="text-xs text-muted">Drag &amp; drop a document, or</div>
            <Button type="button" variant="dark" size="sm" onClick={() => inputRef.current?.click()}>
              Upload file
            </Button>
            <div className="text-xs text-muted">Any file type, up to {formatFileSize(MAX_FILE_BYTES)}</div>
          </>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">EVIDENCE TYPE</label>
        <select
          value={typeCode}
          onChange={(e) => setTypeCode(e.target.value)}
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
        >
          {availableTypes.map((t) => (
            <option key={t.code} value={t.code}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <Button size="sm" onClick={handleSubmit} disabled={busy}>
        {busy ? statusLabel ?? "Working…" : "Upload & anchor"}
      </Button>

      {displayError && <div className="text-xs text-danger-text">{displayError}</div>}
      {!displayError && successMessage && (
        <div className="text-xs font-semibold text-teal-700">
          {successMessage}
          {successTxid && isRealTxid(successTxid) && (
            <a
              href={explorerTxUrl(successTxid)}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1.5 underline underline-offset-2"
            >
              View on WhatsOnChain ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
