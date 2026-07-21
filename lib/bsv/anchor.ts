import "server-only";
import {
  P2PKH,
  SatoshisPerKilobyte,
  Script,
  Transaction,
  WhatsOnChainBroadcaster,
  fromUtxo,
} from "@bsv/sdk";
import { getAnchorAddress, getAnchorKey, getFeeRateSatPerByte, getNetwork } from "./keys";
import { encodePayloadHex, type AnchorPayload } from "./payload";

interface WhatsOnChainUtxo {
  height: number;
  tx_pos: number;
  tx_hash: string;
  value: number;
}

export class InsufficientFundsError extends Error {
  constructor(public address: string) {
    super(
      `The anchoring wallet (${address}) has no spendable UTXOs. Fund it with a small amount of testnet BSV.`
    );
    this.name = "InsufficientFundsError";
  }
}

export class BroadcastError extends Error {
  constructor(detail: string) {
    super(`BSV broadcast failed: ${detail}`);
    this.name = "BroadcastError";
  }
}

/** Bounds a promise to `ms` so a hung external call fails fast with a clear message instead of stalling the request. */
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function fetchUtxos(address: string, network: "test" | "main"): Promise<WhatsOnChainUtxo[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`https://api.whatsonchain.com/v1/bsv/${network}/address/${address}/unspent`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch UTXOs (${res.status} ${res.statusText})`);
    }
    return (await res.json()) as WhatsOnChainUtxo[];
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Timed out fetching UTXOs from WhatsOnChain (10s).");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Builds, signs and broadcasts a single-OP_RETURN evidence-anchor transaction.
 * Spends every available UTXO on the anchoring address and returns the change
 * to itself — each anchor self-consolidates back to one UTXO, ready for the
 * next call. Simple, and appropriate for this PoC's low anchor volume.
 */
export async function anchorPayload(payload: AnchorPayload): Promise<{ txid: string }> {
  const network = getNetwork();
  const key = getAnchorKey();
  const address = getAnchorAddress(key);

  const utxos = await fetchUtxos(address, network);
  if (utxos.length === 0) {
    throw new InsufficientFundsError(address);
  }

  const p2pkh = new P2PKH();
  const lockingScriptHex = p2pkh.lock(address).toHex();

  const tx = new Transaction();
  for (const utxo of utxos) {
    tx.addInput(
      fromUtxo(
        { txid: utxo.tx_hash, vout: utxo.tx_pos, satoshis: utxo.value, script: lockingScriptHex },
        p2pkh.unlock(key)
      )
    );
  }

  const dataHex = encodePayloadHex(payload);
  tx.addOutput({
    lockingScript: Script.fromASM(`OP_FALSE OP_RETURN ${dataHex}`),
    satoshis: 0,
  });
  tx.addOutput({ lockingScript: p2pkh.lock(address), change: true });

  await tx.fee(new SatoshisPerKilobyte(getFeeRateSatPerByte() * 1000));
  await tx.sign();

  const result = await withTimeout(
    tx.broadcast(new WhatsOnChainBroadcaster(network)),
    15_000,
    "Timed out broadcasting to WhatsOnChain (15s)."
  );
  if (result.status !== "success") {
    throw new BroadcastError(result.description);
  }

  return { txid: result.txid };
}
