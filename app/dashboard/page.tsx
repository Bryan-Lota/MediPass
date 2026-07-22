"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { useEvidenceStore } from "@/lib/evidence-store";
import { useToast } from "@/lib/toast";
import { useNotifications } from "@/lib/notifications";
import { hashRecordContent } from "@/lib/hash";
import { anchorEvent, isAnchorFailure } from "@/lib/anchor-client";
import { isRealTxid } from "@/lib/bsv/explorer";
import { evidenceTypeByCode } from "@/lib/evidence-types";
import type { ChecklistItem, EvidenceRecord, EvidenceStatus, Market } from "@/lib/types";
import { MarketStatusPill } from "@/components/dashboard/status-badge";
import { MarketTabs } from "@/components/dashboard/market-tabs";
import { ChecklistCard } from "@/components/dashboard/checklist-card";
import { EvidenceList } from "@/components/dashboard/evidence-list";
import { EvidenceFilterBar } from "@/components/dashboard/evidence-filter-bar";
import { EvidenceDetailModal } from "@/components/dashboard/evidence-detail-modal";
import { DocumentUpload } from "@/components/dashboard/document-upload";
import { RecomputePanel, type CompareStage } from "@/components/dashboard/recompute-panel";
import { AuditTimeline } from "@/components/dashboard/audit-timeline";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { Button } from "@/components/ui/button";

const MARKET_LABEL: Record<Market, string> = { EU: "EU", US: "FDA (US)" };

function markChecklistItemMet(items: ChecklistItem[], checklistLabel?: string): ChecklistItem[] {
  if (!checklistLabel) return items;
  return items.map((c) => (c.label === checklistLabel ? { ...c, met: true, detail: "submitted" } : c));
}

const PASSPORT_ID = "x1";

export default function DashboardPage() {
  const router = useRouter();
  const { session, ready, signOut } = useSession();
  const store = useEvidenceStore();
  const toast = useToast();
  const notifications = useNotifications();
  const signingOutRef = useRef(false);

  const [activeMarket, setActiveMarket] = useState<Market>("EU");
  const [statusFilter, setStatusFilter] = useState<EvidenceStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState<EvidenceRecord | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [uploadStatusLabel, setUploadStatusLabel] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadResetSignal, setUploadResetSignal] = useState(0);
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

  const handleUpload = useCallback(
    async (file: File, typeCode: string, market: Market, hash: string, encryptedContent: string) => {
      if (!passport) return;
      const type = evidenceTypeByCode(typeCode);
      if (!type) return;

      setUploading(true);
      setUploadError(null);
      setUploadSuccess(null);
      setUploadStatusLabel("Broadcasting to BSV testnet…");
      const result = await anchorEvent({
        commitment: hash,
        device: passport.device,
        market,
        type: typeCode,
        issuer: passport.manufacturer,
        event: "SUBMITTED",
      });

      if (isAnchorFailure(result)) {
        setUploading(false);
        setUploadStatusLabel(null);
        setUploadError(result.error);
        return;
      }

      const newRow: EvidenceRecord = {
        id: `up-${crypto.randomUUID()}`,
        name: file.name,
        type: type.label,
        markets: [market],
        content: encryptedContent,
        contentEncoding: "encrypted",
        fileName: file.name,
        fileSize: file.size,
        anchoredHash: hash,
        issuer: passport.manufacturer,
        timestamp: "just now",
        txid: result.txid,
        status: "Pending Review",
      };

      store.updatePassport(PASSPORT_ID, (p) => ({
        ...p,
        euStatus: market === "EU" ? "Pending Review" : p.euStatus,
        usStatus: market === "US" ? "Pending Review" : p.usStatus,
        euChecklist: market === "EU" ? markChecklistItemMet(p.euChecklist, type.checklistLabel) : p.euChecklist,
        usChecklist: market === "US" ? markChecklistItemMet(p.usChecklist, type.checklistLabel) : p.usChecklist,
        rows: [...p.rows, newRow],
        timeline: [
          ...p.timeline,
          {
            label: `${file.name} (${type.label}, ${market}) submitted — awaiting regulator approval`,
            timestamp: "just now",
            txid: result.txid,
          },
        ],
      }));
      setUploading(false);
      setUploadStatusLabel(null);
      setUploadSuccess(`Anchored on BSV testnet — ${file.name} added`);
      setUploadResetSignal((n) => n + 1);
      toast.push(`${MARKET_LABEL[market]} regulator notified — ${file.name} is awaiting review.`, "success");
      notifications.push(
        "regulator",
        `${passport.manufacturer} submitted "${file.name}" (${type.label}, ${MARKET_LABEL[market]}) — needs review.`,
        "info"
      );
    },
    [store, passport, toast, notifications]
  );

  const removeDocument = useCallback(
    (row: EvidenceRecord) => {
      setRemoving(true);
      store.updatePassport(PASSPORT_ID, (p) => ({
        ...p,
        rows: p.rows.filter((r) => r.id !== row.id),
        timeline: [
          ...p.timeline,
          { label: `${row.name} removed by manufacturer — will be reuploaded`, timestamp: "just now" },
        ],
      }));
      setRemoving(false);
      setSelectedRow(null);
      toast.push(`${row.name} removed. Upload a corrected version below.`, "info");
    },
    [store, toast]
  );

  const copyHash = useCallback((row: EvidenceRecord) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(row.anchoredHash).catch(() => {});
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 1500);
    }
  }, []);

  const recompute = useCallback(() => {
    setCompareStage("checking");
    const rowsSnapshot = passport?.rows ?? [];
    setTimeout(async () => {
      const hashes = await Promise.all(
        rowsSnapshot.map((r) => hashRecordContent(r.content, r.contentEncoding))
      );
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
    setUploadStatusLabel(null);
    setUploading(false);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadResetSignal((n) => n + 1);
    setCompareStage(null);
    setRevoking(false);
    setRevokeError(null);
  }, [store]);

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
          <span className="font-display text-[17px] font-semibold tracking-tight text-teal-700">MedPass</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="rounded-full border border-teal-200 bg-teal-100 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
            MANUFACTURER
          </span>
          <span className="hidden text-[13px] text-muted sm:inline">{session.email}</span>
          <NotificationBell role="manufacturer" />
          <Link href="/profile" className="text-sm font-semibold text-teal-700 hover:underline">
            Profile
          </Link>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </nav>

      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-7 sm:px-8 sm:pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-line bg-white p-6 shadow-card sm:p-7">
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
            <MarketStatusPill market="EU" status={passport.euStatus} onClick={() => setActiveMarket("EU")} />
            <MarketStatusPill market="US" status={passport.usStatus} onClick={() => setActiveMarket("US")} />
          </div>
        </div>

        <MarketTabs
          active={activeMarket}
          onChange={setActiveMarket}
          counts={{
            EU: passport.rows.filter((r) => r.markets.includes("EU") && r.status === "Pending Review").length,
            US: passport.rows.filter((r) => r.markets.includes("US") && r.status === "Pending Review").length,
          }}
        />

        <ChecklistCard
          title={`${MARKET_LABEL[activeMarket].toUpperCase()} CHECKLIST`}
          items={activeMarket === "EU" ? passport.euChecklist : passport.usChecklist}
          emphasize
        />

        <EvidenceFilterBar status={statusFilter} onStatusChange={setStatusFilter} search={search} onSearchChange={setSearch} />

        <EvidenceList
          rows={passport.rows.filter(
            (r) =>
              r.markets.includes(activeMarket) &&
              (statusFilter === "All" || r.status === statusFilter) &&
              (search.trim() === "" ||
                `${r.name} ${r.type} ${r.issuer}`.toLowerCase().includes(search.trim().toLowerCase()))
          )}
          onView={setSelectedRow}
        />

        <AuditTimeline events={passport.timeline} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
          <DocumentUpload
            market={activeMarket}
            onUpload={handleUpload}
            busy={uploading}
            statusLabel={uploadStatusLabel}
            error={uploadError}
            successMessage={uploadSuccess}
            resetSignal={uploadResetSignal}
          />
          <RecomputePanel stage={compareStage} onRecompute={recompute} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3.5 rounded-[22px] border border-line bg-white p-5 shadow-card">
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

      <EvidenceDetailModal
        row={selectedRow}
        onClose={() => setSelectedRow(null)}
        onCopyHash={copyHash}
        copied={copiedHash}
        onRemove={removeDocument}
        removing={removing}
      />
    </div>
  );
}
