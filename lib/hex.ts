/** Shared byte <-> hex helpers — used by hashing, the BSV payload codec, and vault encryption. */

const HEX_LOOKUP = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));

export function bytesToHex(bytes: Uint8Array): string {
  const out = new Array<string>(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[i] = HEX_LOOKUP[bytes[i]!]!;
  return out.join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.length % 2 === 0 ? hex : `0${hex}`;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return out;
}
