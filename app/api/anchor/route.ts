import { NextResponse } from "next/server";
import { anchorPayload, InsufficientFundsError, BroadcastError } from "@/lib/bsv/anchor";
import { AnchorNotConfiguredError, getNetwork } from "@/lib/bsv/keys";
import { explorerTxUrl } from "@/lib/bsv/explorer";
import type { AnchorPayload } from "@/lib/bsv/payload";

export const runtime = "nodejs";

const VALID_EVENTS = new Set(["SUBMITTED", "VERIFIED", "REJECTED", "INFO_REQUESTED", "REVOKED"]);

function isValidPayload(body: unknown): body is Omit<AnchorPayload, "v"> {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.commitment === "string" &&
    /^[0-9a-f]{64}$/i.test(b.commitment) &&
    typeof b.device === "string" &&
    b.device.length > 0 &&
    typeof b.market === "string" &&
    b.market.length > 0 &&
    typeof b.type === "string" &&
    b.type.length > 0 &&
    typeof b.issuer === "string" &&
    b.issuer.length > 0 &&
    typeof b.event === "string" &&
    VALID_EVENTS.has(b.event) &&
    (b.prev === undefined || typeof b.prev === "string")
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  if (!isValidPayload(body)) {
    return NextResponse.json(
      { error: "Expected { commitment (64-char hex), device, market, type, issuer, event, prev? }." },
      { status: 400 }
    );
  }

  try {
    const { txid } = await anchorPayload({ v: 1, ...body });
    return NextResponse.json({ txid, explorerUrl: explorerTxUrl(txid, getNetwork()) });
  } catch (err) {
    if (err instanceof AnchorNotConfiguredError) {
      return NextResponse.json({ error: err.message, code: "NOT_CONFIGURED" }, { status: 503 });
    }
    if (err instanceof InsufficientFundsError) {
      return NextResponse.json({ error: err.message, code: "INSUFFICIENT_FUNDS" }, { status: 503 });
    }
    if (err instanceof BroadcastError) {
      return NextResponse.json({ error: err.message, code: "BROADCAST_FAILED" }, { status: 502 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, code: "UNKNOWN" }, { status: 500 });
  }
}
