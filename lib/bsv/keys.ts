import "server-only";
import { PrivateKey } from "@bsv/sdk";

const TESTNET_WIF_PREFIX = [0xef];
const TESTNET_ADDR_PREFIX = [0x6f];

export class AnchorNotConfiguredError extends Error {
  constructor() {
    super("BSV_PRIVATE_KEY is not set — anchoring is not configured for this deployment.");
    this.name = "AnchorNotConfiguredError";
  }
}

/** Loads the anchoring key from the server-only env var. Never sent to the client. */
export function getAnchorKey(): PrivateKey {
  const wif = process.env.BSV_PRIVATE_KEY;
  if (!wif) throw new AnchorNotConfiguredError();
  return PrivateKey.fromWif(wif);
}

export function getAnchorAddress(key: PrivateKey = getAnchorKey()): string {
  return key.toAddress(TESTNET_ADDR_PREFIX);
}

export function getNetwork(): "test" | "main" {
  return process.env.BSV_NETWORK === "main" ? "main" : "test";
}

export function getFeeRateSatPerByte(): number {
  const raw = process.env.BSV_FEE_RATE;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0.05;
}

export { TESTNET_WIF_PREFIX, TESTNET_ADDR_PREFIX };
