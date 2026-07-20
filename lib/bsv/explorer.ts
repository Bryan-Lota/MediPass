/**
 * Client-safe — no secrets, no server-only import. Used anywhere the UI needs
 * to link out to a human-browsable, independent view of an anchored transaction.
 */

/** A real broadcast txid is 64 hex chars. Seed/demo fixtures use short mocked strings and won't match. */
export function isRealTxid(txid: string): boolean {
  return /^[0-9a-f]{64}$/i.test(txid);
}

export function explorerTxUrl(txid: string, network: "test" | "main" = "test"): string {
  const sub = network === "main" ? "" : "test.";
  return `https://${sub}whatsonchain.com/tx/${txid}`;
}
