"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { useEvidenceStore } from "@/lib/evidence-store";
import { sterilisationRecordTemplate } from "@/lib/mock-data";
import { sha256Hex } from "@/lib/hash";
import { anchorEvent, isAnchorFailure } from "@/lib/anchor-client";
import { isRealTxid } from "@/lib/bsv/explorer";
import type { EvidenceRecord } from "@/lib/types";
import { MarketStatusPill } from "@/components/dashboard/status-badge";
import { ChecklistCard } from "@/components/dashboard/checklist-card";
import { EvidenceTable } from "@/components/dashboard/evidence-table";
import { UploadPanel } from "@/components/dashboard/upload-panel";
import { RecomputePanel, type CompareStage } from "@/components/dashboard/recompute-panel";
import { AuditTimeline } from "@/components/dashboard/audit-timeline";
import { Button } from "@/components/ui/button";

const PASSPORT_ID = "x1";

export default function DashboardPage() {
  const router = useRouter();
  const { session, ready, signOut } = useSession();
  const store = useEvidenceStore();
  const signingOutRef = useRef(false);

  const [uploadLabel, setUploadLabel] = useState("No pending upload");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [compareStage, setCompareStage] = useState<CompareStage>(null);
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || signingOutRef.current) return;
    if (!session) {
      router.replace("/login");
    } else if (session.role === "regulator") {
      router.replace("/regulator");
    }
  }, [ready, session, router]);

  const passport = store.passports[PASSPORT_ID];

  const simulateUpload = useCallback(async () => {
    setUploading(true);
    setUploadError(null);
    setUploadLabel("Hashing…");
    const hash = await sha256Hex(sterilisationRecordTemplate.content);

    setUploadLabel("Broadcasting to BSV testnet…");
    const result = await anchorEvent({
      commitment: hash,
      device: passport?.device ?? "",
      market: "US",
      type: sterilisationRecordTemplate.type,
      issuer: sterilisationRecordTemplate.issuer,
      event: "SUBMITTED",
    });

    if (isAnchorFailure(result)) {
      setUploading(false);
      setUploadLabel("No pending upload");
      setUploadError(result.error);
      return;
    }

    const newRow: EvidenceRecord = {
      id: sterilisationRecordTemplate.id,
      name: sterilisationRecordTemplate.name,
      type: sterilisationRecordTemplate.type,
      content: sterilisationRecordTemplate.content,
      anchoredHash: hash,
      issuer: sterilisationRecordTemplate.issuer,
      timestamp: "just now",
      txid: result.txid,
      status: sterilisationRecordTemplate.status,
    };
    store.updatePassport(PASSPORT_ID, (p) => ({
      ...p,
      usStatus: "Pending Review",
      usChecklist: p.usChecklist.map((c) =>
        c.label === "Sterilisation Validation" ? { ...c, met: true, detail: "submitted" } : c
      ),
      rows: [...p.rows, newRow],
      timeline: [
        ...p.timeline,
        {
          label: "Sterilisation Validation submitted — awaiting regulator approval",
          timestamp: "just now",
          txid: result.txid,
        },
      ],
    }));
    setUploading(false);
    setUploadLabel("Anchored on BSV testnet — Sterilisation Validation added");
  }, [store, passport?.device]);

  const recompute = useCallback(() => {
    setCompareStage("checking");
    const rowsSnapshot = passport?.rows ?? [];
    setTimeout(async () => {
      const hashes = await Promise.all(rowsSnapshot.map((r) => sha256Hex(r.content)));
      const mismatch = hashes.some((h, i) => h !== rowsSnapshot[i]!.anchoredHash);
      setCompareStage(mismatch ? "mismatch" : "match");
    }, 600);
  }, [passport?.rows]);

  const simulateTampering = useCallback(() => {
    store.updatePassport(PASSPORT_ID, (p) => ({
      ...p,
      rows: p.rows.map((r) =>
        r.id === "test" ? { ...r, content: `${r.content}|edited-after-signing`, status: "Tampered" } : r
      ),
      timeline: [
        ...p.timeline,
        { label: "Tampering detected — Test Report content changed after signing", timestamp: "just now" },
      ],
    }));
    setCompareStage(null);
  }, [store]);

  const revokeDocument = useCallback(async () => {
    const row = passport?.rows.find((r) => r.id === "doc");
    if (!row || !passport) return;

    setRevoking(true);
    setRevokeError(null);
    const result = await anchorEvent({
      commitment: row.anchoredHash,
      device: passport.device,
      market: "EU",
      type: row.type,
      issuer: row.issuer,
      event: "REVOKED",
      prev: isRealTxid(row.txid) ? row.txid : undefined,
    });

    if (isAnchorFailure(result)) {
      setRevoking(false);
      setRevokeError(result.error);
      return;
    }

    store.updatePassport(PASSPORT_ID, (p) => ({
      ...p,
      rows: p.rows.map((r) => (r.id === "doc" ? { ...r, status: "Revoked", txid: result.txid } : r)),
      timeline: [
        ...p.timeline,
        { label: "Declaration of Conformity revoked", timestamp: "just now", txid: result.txid },
      ],
    }));
    setRevoking(false);
    setCompareStage(null);
  }, [store, passport]);

  const resetDemo = useCallback(() => {
    store.resetPassport(PASSPORT_ID);
    setUploadLabel("No pending upload");
    setUploading(false);
    setUploadError(null);
    setCompareStage(null);
    setRevoking(false);
    setRevokeError(null);
  }, [store]);

  const copyHash = useCallback((row: EvidenceRecord) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(row.anchoredHash).catch(() => {});
    }
  }, []);

  const handleSignOut = useCallback(() => {
    signingOutRef.current = true;
    signOut();
    router.push("/");
  }, [signOut, router]);

  if (!ready || !store.ready || !session || session.role === "regulator" || !passport) {
    return <div className="min-h-screen bg-teal-50" />;
  }

  return (
    <div className="min-h-screen bg-teal-50">
      <nav className="flex items-center justify-between border-b border-line bg-white px-6 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-[17px] font-bold tracking-tight text-teal-700">DigiMed</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="rounded-full border border-teal-200 bg-teal-100 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
            MANUFACTURER
          </span>
          <span className="hidden text-[13px] text-muted sm:inline">{session.email}</span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </nav>

      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-7 sm:px-8 sm:pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-6 shadow-card sm:p-7">
          <div>
            <div className="mb-1.5 font-mono text-[11px] font-semibold text-muted">
              DEVICE PASSPORT
            </div>
            <div className="text-xl font-semibold">
              {passport.device} <span className="font-normal text-muted">· Batch {passport.batch}</span>
            </div>
            <div className="mt-1 text-[13px] text-muted">
              Manufacturer: {passport.manufacturer} (placeholder)
            </div>
          </div>
          <div className="flex gap-2.5">
            <MarketStatusPill market="EU" status={passport.euStatus} />
            <MarketStatusPill market="US" status={passport.usStatus} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ChecklistCard title="EU CHECKLIST" items={passport.euChecklist} emphasize />
          <ChecklistCard title="US CHECKLIST" items={passport.usChecklist} />
        </div>

        <EvidenceTable rows={passport.rows} onCopyHash={copyHash} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
          <UploadPanel
            label={uploadLabel}
            onSimulateUpload={simulateUpload}
            busy={uploading}
            error={uploadError}
          />
          <RecomputePanel stage={compareStage} onRecompute={recompute} />
        </div>

        <AuditTimeline events={passport.timeline} />

        <div className="flex flex-wrap items-center justify-between gap-3.5 rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="text-[13px] text-muted">
            Presentation controls — force a status change to demo the audit trail live. Open{" "}
            <Link href="/login" target="_blank" className="font-semibold text-teal-700">
              /login
            </Link>{" "}
            as a regulator in a new tab to see changes sync live in both directions.
            {revokeError && (
              <div className="mt-1.5 text-danger-text">Revoke failed: {revokeError}</div>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="warning" size="sm" onClick={simulateTampering}>
              Simulate tampering
            </Button>
            <Button variant="danger" size="sm" onClick={revokeDocument} disabled={revoking}>
              {revoking ? "Revoking…" : "Revoke document"}
            </Button>
            <Button variant="outline" size="sm" onClick={resetDemo}>
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
