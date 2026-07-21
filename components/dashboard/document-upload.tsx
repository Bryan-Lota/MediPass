"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/hash";
import { EVIDENCE_TYPES } from "@/lib/evidence-types";
import type { Market } from "@/lib/types";

/** No real off-chain storage in this PoC — a file's hex-encoded bytes live in localStorage. Keep it small. */
export const MAX_FILE_BYTES = 1 * 1024 * 1024;

export interface DocumentUploadProps {
  onUpload: (file: File, typeCode: string, markets: Market[]) => void;
  busy: boolean;
  statusLabel: string | null;
  error?: string | null;
  successMessage?: string | null;
  /** Bump this (e.g. a counter) after a successful upload to clear the selected file. */
  resetSignal?: number;
}

export function DocumentUpload({
  onUpload,
  busy,
  statusLabel,
  error,
  successMessage,
  resetSignal,
}: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [typeCode, setTypeCode] = useState(EVIDENCE_TYPES[0]!.code);
  const [markets, setMarkets] = useState<Set<Market>>(new Set(["EU"]));
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedType = useMemo(
    () => EVIDENCE_TYPES.find((t) => t.code === typeCode) ?? EVIDENCE_TYPES[0]!,
    [typeCode]
  );

  useEffect(() => {
    if (resetSignal !== undefined) setFile(null);
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

  const toggleMarket = useCallback((m: Market) => {
    setMarkets((s) => {
      const next = new Set(s);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!file) {
      setLocalError("Choose a document to upload first.");
      return;
    }
    const selectedMarkets = Array.from(markets).filter((m) => selectedType.markets.includes(m));
    if (selectedMarkets.length === 0) {
      setLocalError(`${selectedType.label} applies to ${selectedType.markets.join(" and ")} — select at least one.`);
      return;
    }
    setLocalError(null);
    onUpload(file, typeCode, selectedMarkets);
  }, [file, markets, selectedType, typeCode, onUpload]);

  const displayError = localError ?? error;

  return (
    <div className="flex flex-col gap-4 rounded-xl border-2 border-dashed border-teal-200 bg-white p-6">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border transition-colors ${
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
            <div className="text-sm font-semibold">{file.name}</div>
            <div className="text-xs text-muted">{formatFileSize(file.size)} — click to choose a different file</div>
          </>
        ) : (
          <>
            <div className="text-sm font-semibold">Drop a document here, or click to browse</div>
            <div className="text-xs text-muted">Any file type, up to {formatFileSize(MAX_FILE_BYTES)}</div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">EVIDENCE TYPE</label>
          <select
            value={typeCode}
            onChange={(e) => setTypeCode(e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
          >
            {EVIDENCE_TYPES.map((t) => (
              <option key={t.code} value={t.code}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">DESTINATION MARKET</label>
          <div className="flex h-[38px] items-center gap-4">
            {(["EU", "US"] as Market[]).map((m) => {
              const applicable = selectedType.markets.includes(m);
              return (
                <label
                  key={m}
                  className={`flex items-center gap-1.5 text-sm ${applicable ? "" : "opacity-40"}`}
                >
                  <input
                    type="checkbox"
                    disabled={!applicable}
                    checked={markets.has(m) && applicable}
                    onChange={() => toggleMarket(m)}
                  />
                  {m}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <Button size="sm" onClick={handleSubmit} disabled={busy}>
        {busy ? statusLabel ?? "Working…" : "Upload & anchor"}
      </Button>

      {displayError && <div className="text-xs text-danger-text">{displayError}</div>}
      {!displayError && successMessage && (
        <div className="text-xs font-semibold text-teal-700">{successMessage}</div>
      )}
    </div>
  );
}
