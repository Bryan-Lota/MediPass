/**
 * Real SHA-256 commitment hashing via the browser's Web Crypto API.
 */

// Precomputed byte -> two-hex-char lookup — for a ~1MB upload, this is meaningfully
// faster than Array.from(bytes).map(...).join(''), which was blocking the main thread
// (and the upload UI) for a noticeable moment on larger files.
const HEX_LOOKUP = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));

function bytesToHex(bytes: Uint8Array): string {
  const out = new Array<string>(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[i] = HEX_LOOKUP[bytes[i]!]!;
  return out.join("");
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.length % 2 === 0 ? hex : `0${hex}`;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return out;
}

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
 * A seed/demo evidence record's `content` is plain UTF-8 text. A real uploaded
 * document's `content` is the hex encoding of its actual bytes (see
 * fileBytesToHexContent) — there's no off-chain storage in this PoC, so the
 * hex string *is* the stand-in for the stored document. This re-hashes either
 * form the same way it was hashed at submission time, so recompute-and-compare
 * works identically for both.
 */
export async function hashRecordContent(
  content: string,
  encoding: "utf8" | "hex" = "utf8"
): Promise<string> {
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
