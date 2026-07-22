/**
 * Real SHA-256 commitment hashing via the browser's Web Crypto API.
 */
import { bytesToHex, hexToBytes } from "./hex";
import { decryptBytes } from "./vault";

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  return sha256HexBytes(bytes);
}

/** Hashes raw bytes directly — used for real uploaded files. */
export async function sha256HexBytes(bytes: ArrayBuffer | Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return bytesToHex(new Uint8Array(digest));
}

export function fileBytesToHexContent(bytes: ArrayBuffer): string {
  return bytesToHex(new Uint8Array(bytes));
}

/**
 * A seed/demo evidence record's `content` is plain UTF-8 text ("utf8"). A real
 * uploaded document's `content` is AES-GCM-encrypted at rest ("encrypted", see
 * lib/vault.ts) — the password-protected off-chain storage layer. "hex" is kept
 * for backwards compatibility with any pre-encryption records. This re-hashes
 * whichever form it was stored in the same way it was hashed at submission
 * time, so recompute-and-compare works identically across all three.
 */
export async function hashRecordContent(
  content: string,
  encoding: "utf8" | "hex" | "encrypted" = "utf8"
): Promise<string> {
  if (encoding === "encrypted") return sha256HexBytes(await decryptBytes(content));
  if (encoding === "hex") return sha256HexBytes(hexToBytes(content));
  return sha256Hex(content);
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

/** Human-readable file size, e.g. "482 KB". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
