import { NextResponse } from "next/server";
import { fetchOnChainRecord, TxNotFoundError, NoAnchorDataError } from "@/lib/bsv/verify";
import { getNetwork } from "@/lib/bsv/keys";
import { explorerTxUrl } from "@/lib/bsv/explorer";

export const runtime = "nodejs";
export const maxDuration = 20;

/** Fetches a transaction fresh from the chain and decodes its anchored payload — independent proof, not a read of our own cache. */
export async function GET(_request: Request, { params }: { params: { txid: string } }) {
  const { txid } = params;
  if (!/^[0-9a-f]{64}$/i.test(txid)) {
    return NextResponse.json({ error: "Invalid txid." }, { status: 400 });
  }

  try {
    const record = await fetchOnChainRecord(txid);
    return NextResponse.json({ ...record, explorerUrl: explorerTxUrl(txid, getNetwork()) });
  } catch (err) {
    if (err instanceof TxNotFoundError) {
      return NextResponse.json({ error: err.message, code: "NOT_FOUND" }, { status: 404 });
    }
    if (err instanceof NoAnchorDataError) {
      return NextResponse.json({ error: err.message, code: "NO_ANCHOR_DATA" }, { status: 422 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, code: "UNKNOWN" }, { status: 502 });
  }
}
