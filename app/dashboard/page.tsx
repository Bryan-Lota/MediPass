"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { passports, sterilisationRecordTemplate } from "@/lib/mock-data";
import { sha256Hex, mockTxid } from "@/lib/hash";
import type { ChecklistItem, EvidenceRecord, MarketStatus, TimelineEvent } from "@/lib/types";
import { MarketStatusPill } from "@/components/dashboard/status-badge";
import { ChecklistCard } from "@/components/dashboard/checklist-card";
import { EvidenceTable } from "@/components/dashboard/evidence-table";
import { UploadPanel } from "@/components/dashboard/upload-panel";
import { RecomputePanel, type CompareStage } from "@/components/dashboard/recompute-panel";
import { AuditTimeline } from "@/components/dashboard/audit-timeline";
import { Button } from "@/components/ui/button";

const passport = passports.x1!;

function freshState() {
  return {
    usStatus: passport.usStatus as MarketStatus,
    usChecklist: passport.usChecklist.map((c) => ({ ...c })) as ChecklistItem[],
    rows: passport.rows.map((r) => ({ ...r })) as EvidenceRecord[],
    timeline: passport.timeline.map((t) => ({ ...t })) as TimelineEvent[],
    uploadLabel: "No pending upload",
    uploading: false,
    compareStage: null as CompareStage,
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { session, ready, signOut } = useSession();
  const [state, setState] = useState(freshState);
  const signingOutRef = useRef(false);

  useEffect(() => {
    if (!ready || signingOutRef.current) return;
    if (!session) {
      router.replace("/login");
    } else if (session.role === "regulator") {
      router.replace("/regulator");
    }
  }, [ready, session, router]);

  const simulateUpload = useCallback(() => {
    setState((s) => ({ ...s, uploading: true, uploadLabel: "Hashing…" }));
    setTimeout(() => {
      setState((s) => ({ ...s, uploadLabel: "Anchoring to BSV…" }));
    }, 700);
    setTimeout(async () => {
      const hash = await sha256Hex(sterilisationRecordTemplate.content);
      setState((s) => ({
        ...s,
        uploading: false,
        uploadLabel: "Anchored — Sterilisation Validation added",
        usStatus: "Pending Review",
        usChecklist: s.usChecklist.map((c) =>
          c.label === "Sterilisation Validation" ? { ...c, met: true, detail: "submitted" } : c
        ),
        rows: [
          ...s.rows,
          {
            id: sterilisationRecordTemplate.id,
            name: sterilisationRecordTemplate.name,
            type: sterilisationRecordTemplate.type,
            content: sterilisationRecordTemplate.content,
            anchoredHash: hash,
            issuer: sterilisationRecordTemplate.issuer,
            timestamp: "just now",
            txid: mockTxid(hash),
            status: sterilisationRecordTemplate.status,
          },
        ],
        timeline: [...s.timeline, { label: "Sterilisation Validation submitted", timestamp: "just now" }],
      }));
    }, 1500);
  }, []);

  const recompute = useCallback(() => {
    setState((s) => ({ ...s, compareStage: "checking" }));
    const rowsSnapshot = state.rows;
    setTimeout(async () => {
      const hashes = await Promise.all(rowsSnapshot.map((r) => sha256Hex(r.content)));
      const mismatch = hashes.some((h, i) => h !== rowsSnapshot[i]!.anchoredHash);
      setState((s) => ({ ...s, compareStage: mismatch ? "mismatch" : "match" }));
    }, 600);
  }, [state.rows]);

  const simulateTampering = useCallback(() => {
    setState((s) => ({
      ...s,
      rows: s.rows.map((r) =>
        r.id === "test" ? { ...r, content: `${r.content}|edited-after-signing` , status: "Tampered" } : r
      ),
      timeline: [
        ...s.timeline,
        { label: "Tampering detected — Test Report content changed after signing", timestamp: "just now" },
      ],
      compareStage: null,
    }));
  }, []);

  const revokeDocument = useCallback(() => {
    setState((s) => ({
      ...s,
      rows: s.rows.map((r) => (r.id === "doc" ? { ...r, status: "Revoked" } : r)),
      timeline: [...s.timeline, { label: "Declaration of Conformity revoked", timestamp: "just now" }],
      compareStage: null,
    }));
  }, []);

  const resetDemo = useCallback(() => setState(freshState()), []);

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

  const euPill = useMemo(() => <MarketStatusPill market="EU" status={passport.euStatus} />, []);

  if (!ready || !session || session.role === "regulator") {
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
            {euPill}
            <MarketStatusPill market="US" status={state.usStatus} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ChecklistCard title="EU CHECKLIST" items={passport.euChecklist} emphasize />
          <ChecklistCard title="US CHECKLIST" items={state.usChecklist} />
        </div>

        <EvidenceTable rows={state.rows} onCopyHash={copyHash} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
          <UploadPanel label={state.uploadLabel} onSimulateUpload={simulateUpload} busy={state.uploading} />
          <RecomputePanel stage={state.compareStage} onRecompute={recompute} />
        </div>

        <AuditTimeline events={state.timeline} />

        <div className="flex flex-wrap items-center justify-between gap-3.5 rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="text-[13px] text-muted">
            Presentation controls — force a status change to demo the audit trail live.
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="warning" size="sm" onClick={simulateTampering}>
              Simulate tampering
            </Button>
            <Button variant="danger" size="sm" onClick={revokeDocument}>
              Revoke document
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
