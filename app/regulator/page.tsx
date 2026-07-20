"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { passports } from "@/lib/mock-data";
import { sha256Hex } from "@/lib/hash";
import type { EvidenceRecord } from "@/lib/types";
import { MarketStatusPill } from "@/components/dashboard/status-badge";
import { EvidenceTable, type VerifyState } from "@/components/dashboard/evidence-table";
import { AuditTimeline } from "@/components/dashboard/audit-timeline";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const passportIds = Object.keys(passports);

export default function RegulatorDashboardPage() {
  const router = useRouter();
  const { session, ready, signOut } = useSession();
  const [selectedId, setSelectedId] = useState(passportIds[0]!);
  const [verifyState, setVerifyState] = useState<Record<string, VerifyState>>({});
  const signingOutRef = useRef(false);

  useEffect(() => {
    if (!ready || signingOutRef.current) return;
    if (!session) {
      router.replace("/login");
    } else if (session.role !== "regulator") {
      router.replace("/dashboard");
    }
  }, [ready, session, router]);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    setVerifyState({});
  }, []);

  const verify = useCallback((row: EvidenceRecord) => {
    setVerifyState((s) => ({ ...s, [row.id]: "checking" }));
    setTimeout(async () => {
      const hash = await sha256Hex(row.content);
      const result: VerifyState = hash === row.anchoredHash ? "match" : "mismatch";
      setVerifyState((s) => ({ ...s, [row.id]: result }));
    }, 700);
  }, []);

  const handleSignOut = useCallback(() => {
    signingOutRef.current = true;
    signOut();
    router.push("/");
  }, [signOut, router]);

  if (!ready || !session || session.role !== "regulator") {
    return <div className="min-h-screen bg-teal-50" />;
  }

  const selected = passports[selectedId]!;

  return (
    <div className="min-h-screen bg-teal-50">
      <nav className="flex items-center justify-between border-b border-line bg-white px-6 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-[17px] font-bold tracking-tight text-teal-700">DigiMed</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-muted">
            REGULATOR
          </span>
          <span className="hidden text-[13px] text-muted sm:inline">{session.email}</span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </nav>

      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-7 sm:px-8 sm:pb-16">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
          <div className="mb-3.5 font-mono text-[11px] font-semibold text-muted">
            VERIFIER CONSOLE — SELECT A DEVICE PASSPORT
          </div>
          <div className="flex flex-wrap gap-3">
            {passportIds.map((id) => {
              const p = passports[id]!;
              const active = id === selectedId;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => select(id)}
                  className={cn(
                    "min-w-[200px] rounded-xl border-[1.5px] px-[18px] py-3.5 text-left",
                    active ? "border-teal-600 bg-teal-100" : "border-line bg-white"
                  )}
                >
                  <div className="text-sm font-semibold">{p.device}</div>
                  <div className="mt-0.5 text-xs text-muted">
                    {p.manufacturer} · Batch {p.batch}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-6 shadow-card sm:p-7">
          <div>
            <div className="mb-1.5 font-mono text-[11px] font-semibold text-muted">
              DEVICE PASSPORT
            </div>
            <div className="text-xl font-semibold">
              {selected.device} <span className="font-normal text-muted">· Batch {selected.batch}</span>
            </div>
            <div className="mt-1 text-[13px] text-muted">
              Manufacturer: {selected.manufacturer} (placeholder)
            </div>
          </div>
          <div className="flex gap-2.5">
            <MarketStatusPill market="EU" status={selected.euStatus} />
            <MarketStatusPill market="US" status={selected.usStatus} />
          </div>
        </div>

        <EvidenceTable rows={selected.rows} verifyState={verifyState} onVerify={verify} />

        <AuditTimeline events={selected.timeline} />

        <div className="rounded-2xl border border-line bg-white p-5 text-[13px] text-muted">
          Regulators can recompute and verify evidence hashes against the BSV record, but cannot
          upload, edit, or revoke documents — those actions remain the manufacturer&rsquo;s
          responsibility.
        </div>
      </div>
    </div>
  );
}
