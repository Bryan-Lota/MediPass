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
  event: "SUBMITTED" | "VERIFIED" | "REJECTED" | "REVOKED";
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

export async function anchorEvent(req: AnchorRequest): Promise<AnchorSuccess | AnchorFailure> {
  try {
    const res = await fetch("/api/anchor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    const data = (await res.json()) as Partial<AnchorSuccess & AnchorFailure>;
    if (!res.ok || !data.txid) {
      return { error: data.error ?? `Anchoring request failed (${res.status}).`, code: data.code };
    }
    return { txid: data.txid, explorerUrl: data.explorerUrl ?? "" };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Network error while anchoring." };
  }
}

export function isAnchorFailure(result: AnchorSuccess | AnchorFailure): result is AnchorFailure {
  return "error" in result;
}
