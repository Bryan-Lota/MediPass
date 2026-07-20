/**
 * Real SHA-256 commitment hashing via the browser's Web Crypto API.
 * The PoC has no funded BSV wallet, so anchoring itself is mocked — but the
 * hash a "document" produces, and whether it matches its anchored record,
 * is computed for real.
 */
export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Shortens a full hex digest to the "a3f9c2e1…8e41d0" display form. */
export function shortHash(hex: string, head = 12, tail = 6): string {
  if (hex.length <= head + tail) return hex;
  return `${hex.slice(0, head)}…${hex.slice(-tail)}`;
}

/** Deterministic mock BSV txid derived from a hash, for display only. */
export function mockTxid(hex: string): string {
  return `${hex.slice(0, 4)}…${hex.slice(-4)}`;
}
