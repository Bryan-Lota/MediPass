/**
 * Password-protected off-chain storage. Real AES-256-GCM, via the browser's
 * Web Crypto API — not a simulated lock. Document content is encrypted before
 * it's ever written to the (localStorage-backed) off-chain evidence record, so
 * what actually sits at rest is ciphertext, not the plaintext file bytes.
 *
 * Simplification, honestly documented: the passphrase here is a fixed demo
 * vault passphrase rather than one prompted per-user or per-organisation — a
 * real deployment would replace this with a KMS-backed key or a per-org
 * passphrase the way `BSV_PRIVATE_KEY` stands in for real wallet custody. What's
 * genuinely real is the encryption itself: change this constant and every
 * previously-encrypted record stops decrypting, exactly like a real vault.
 */
import { bytesToHex, hexToBytes } from "./hex";

export const DEMO_VAULT_PASSPHRASE = "medpass-demo-vault-2026";

const PBKDF2_ITERATIONS = 100_000;

async function deriveAesKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/** Encrypts raw bytes, returning a single `salt:iv:ciphertext` hex-encoded string ready to store as `content`. */
export async function encryptBytes(
  bytes: ArrayBuffer | Uint8Array,
  passphrase: string = DEMO_VAULT_PASSPHRASE
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(passphrase, salt);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, bytes as BufferSource);
  return `${bytesToHex(salt)}:${bytesToHex(iv)}:${bytesToHex(new Uint8Array(ciphertext))}`;
}

export class VaultDecryptError extends Error {
  constructor() {
    super("Could not decrypt this record with the current vault passphrase.");
    this.name = "VaultDecryptError";
  }
}

/** Reverses encryptBytes. Throws VaultDecryptError if the passphrase or ciphertext don't match — GCM is authenticated, so tampering is detected here too. */
export async function decryptBytes(
  encoded: string,
  passphrase: string = DEMO_VAULT_PASSPHRASE
): Promise<ArrayBuffer> {
  const parts = encoded.split(":");
  if (parts.length !== 3) throw new VaultDecryptError();
  const [saltHex, ivHex, ciphertextHex] = parts as [string, string, string];
  const salt = hexToBytes(saltHex);
  const iv = hexToBytes(ivHex);
  const ciphertext = hexToBytes(ciphertextHex);
  const key = await deriveAesKey(passphrase, salt);
  try {
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, ciphertext as BufferSource);
    return plain;
  } catch {
    throw new VaultDecryptError();
  }
}
