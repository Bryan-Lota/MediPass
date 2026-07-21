/**
 * The on-chain evidence payload — the only thing ever written to BSV.
 * Deliberately minimal: no filename, no file contents, no company name,
 * no personal data. Matches the schema documented in the README.
 */
export interface AnchorPayload {
  v: 1;
  /** SHA-256 of the off-chain document, hex. */
  commitment: string;
  device: string;
  market: string;
  type: string;
  issuer: string;
  event: "SUBMITTED" | "VERIFIED" | "REJECTED" | "REVOKED";
  /** Previous txid in this evidence record's lifecycle, if any. */
  prev?: string;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/** JSON-encodes the payload as the hex string to push in an OP_RETURN output. */
export function encodePayloadHex(payload: AnchorPayload): string {
  const json = JSON.stringify(payload);
  return bytesToHex(new TextEncoder().encode(json));
}

/**
 * Decodes an OP_RETURN locking script (as hex, `00 6a <pushdata> <data>`) back
 * into the payload. Deliberately hand-rolled rather than relying on a script
 * chunk parser: standard pushdata framing (direct-length / OP_PUSHDATA1/2/4) is
 * simple and fully deterministic for data we encoded ourselves.
 */
export function decodeOpReturnPayload(scriptHex: string): AnchorPayload | null {
  const bytes = hexToBytes(scriptHex);
  if (bytes.length < 3 || bytes[0] !== 0x00 || bytes[1] !== 0x6a) return null;

  let i = 2;
  const marker = bytes[i]!;
  let len: number;
  let dataStart: number;

  if (marker <= 0x4b) {
    len = marker;
    dataStart = i + 1;
  } else if (marker === 0x4c) {
    len = bytes[i + 1]!;
    dataStart = i + 2;
  } else if (marker === 0x4d) {
    len = bytes[i + 1]! | (bytes[i + 2]! << 8);
    dataStart = i + 3;
  } else if (marker === 0x4e) {
    len =
      bytes[i + 1]! | (bytes[i + 2]! << 8) | (bytes[i + 3]! << 16) | (bytes[i + 4]! << 24);
    dataStart = i + 5;
  } else {
    return null;
  }

  const data = bytes.subarray(dataStart, dataStart + len);
  try {
    return JSON.parse(new TextDecoder().decode(data)) as AnchorPayload;
  } catch {
    return null;
  }
}
