"use client";

/**
 * Client-safe wrapper around POST /api/anchor. No secrets here — just a same-origin
 * fetch. The actual key handling and broadcasting happens server-side in lib/bsv/.
 */

export interface AnchorRequest {
  commitment: string;
  device: string;
  market: string;
  type: string;
  issuer: string;
  event: "SUBMITTED" | "VERIFIED" | "REJECTED" | "INFO_REQUESTED" | "REVOKED";
  prev?: string;
}

export interface AnchorSuccess {
  txid: string;
  explorerUrl: string;
}

export interface AnchorFailure {
  error: string;
  code?: string;
}

/** Anchoring means a real network round trip to a blockchain explorer — bound the wait so a slow network shows a clear error instead of hanging indefinitely. */
const ANCHOR_TIMEOUT_MS = 25_000;

export async function anchorEvent(req: AnchorRequest): Promise<AnchorSuccess | AnchorFailure> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ANCHOR_TIMEOUT_MS);
  try {
    const res = await fetch("/api/anchor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
    const data = (await res.json()) as Partial<AnchorSuccess & AnchorFailure>;
    if (!res.ok || !data.txid) {
      return { error: data.error ?? `Anchoring request failed (${res.status}).`, code: data.code };
    }
    return { txid: data.txid, explorerUrl: data.explorerUrl ?? "" };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        error: "Anchoring is taking too long (over 25s) — the BSV network may be slow to respond. Try again shortly.",
        code: "TIMEOUT",
      };
    }
    return { error: err instanceof Error ? err.message : "Network error while anchoring." };
  } finally {
    clearTimeout(timer);
  }
}

export function isAnchorFailure(result: AnchorSuccess | AnchorFailure): result is AnchorFailure {
  return "error" in result;
}
