import "server-only";
import { getNetwork } from "./keys";
import { decodeOpReturnPayload, type AnchorPayload } from "./payload";

interface WhatsOnChainVout {
  scriptPubKey: { hex: string; type?: string };
}

interface WhatsOnChainTx {
  txid: string;
  confirmations?: number;
  blockheight?: number;
  vout: WhatsOnChainVout[];
}

export interface OnChainRecord {
  txid: string;
  payload: AnchorPayload;
  confirmed: boolean;
  confirmations: number;
}

export class TxNotFoundError extends Error {
  constructor(txid: string) {
    super(`No transaction found for txid ${txid}`);
    this.name = "TxNotFoundError";
  }
}

export class NoAnchorDataError extends Error {
  constructor(txid: string) {
    super(`Transaction ${txid} has no decodable MedPass OP_RETURN payload`);
    this.name = "NoAnchorDataError";
  }
}

/** Fetches a transaction fresh from the chain and decodes its anchored evidence payload. */
export async function fetchOnChainRecord(txid: string): Promise<OnChainRecord> {
  const network = getNetwork();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  let res: Response;
  try {
    res = await fetch(`https://api.whatsonchain.com/v1/bsv/${network}/tx/hash/${txid}`, {
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Timed out fetching the transaction from WhatsOnChain (10s).");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 404) throw new TxNotFoundError(txid);
  if (!res.ok) throw new Error(`Failed to fetch transaction (${res.status} ${res.statusText})`);

  const tx = (await res.json()) as WhatsOnChainTx;
  const opReturnOut = tx.vout.find((v) => v.scriptPubKey.hex.startsWith("006a"));
  const payload = opReturnOut ? decodeOpReturnPayload(opReturnOut.scriptPubKey.hex) : null;
  if (!payload) throw new NoAnchorDataError(txid);

  const confirmations = tx.confirmations ?? 0;
  return { txid, payload, confirmed: confirmations > 0, confirmations };
}
