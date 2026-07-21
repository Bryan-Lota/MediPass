"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { useEvidenceStore } from "@/lib/evidence-store";
import { useToast } from "@/lib/toast";
import { passports as factoryPassports } from "@/lib/mock-data";
import { hashRecordContent } from "@/lib/hash";
import { anchorEvent, isAnchorFailure } from "@/lib/anchor-client";
import { isRealTxid } from "@/lib/bsv/explorer";
import type { EvidenceRecord, EvidenceStatus, Market } from "@/lib/types";
import { MarketStatusPill } from "@/components/dashboard/status-badge";
import { MarketTabs } from "@/components/dashboard/market-tabs";
import { EvidenceList } from "@/components/dashboard/evidence-list";
import { EvidenceDetailModal, type VerifyState } from "@/components/dashboard/evidence-detail-modal";
import { DecisionModal } from "@/components/dashboard/decision-modal";
import { AuditTimeline } from "@/components/dashboard/audit-timeline";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const passportIds = Object.keys(factoryPassports);

type Decision = "approve" | "reject" | "info";

const DECISION_EVENT: Record<Decision, "VERIFIED" | "REJECTED" | "INFO_REQUESTED"> = {
  approve: "VERIFIED",
  reject: "REJECTED",
  info: "INFO_REQUESTED",
};

const DECISION_STATUS: Record<Decision, EvidenceStatus> = {
  approve: "Verified",
  reject: "Rejected",
  info: "Info Requested",
};

const DECISION_VERB: Record<Decision, string> = {
  approve: "approved",
  reject: "rejected",
  info: "asked for more information on",
};

export default function RegulatorDashboardPage() {
  const router = useRouter();
  const { session, ready, signOut } = useSession();
  const store = useEvidenceStore();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState(passportIds[0]!);
  const [activeMarket, setActiveMarket] = useState<Market>("EU");
  const [selectedRow, setSelectedRow] = useState<EvidenceRecord | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [verifyState, setVerifyState] = useState<Record<string, VerifyState>>({});
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());
  const [rejectingIds, setRejectingIds] = useState<Set<string>>(new Set());
  const [requestingInfoIds, setRequestingInfoIds] = useState<Set<string>>(new Set());
  const [decisionErrors, setDecisionErrors] = useState<Record<string, string>>({});
  const [decisionModal, setDecisionModal] = useState<{ row: EvidenceRecord; kind: "reject" | "info" } | null>(null);
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
    setDecisionErrors({});
  }, []);

  const copyHash = useCallback((row: EvidenceRecord) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(row.anchoredHash).catch(() => {});
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 1500);
    }
  }, []);

  const verify = useCallback((row: EvidenceRecord) => {
    setVerifyState((s) => ({ ...s, [row.id]: "checking" }));
    setTimeout(async () => {
      const hash = await hashRecordContent(row.content, row.contentEncoding);
      const result: VerifyState = hash === row.anchoredHash ? "match" : "mismatch";
      setVerifyState((s) => ({ ...s, [row.id]: result }));
    }, 700);
  }, []);

  const decide = useCallback(
    async (row: EvidenceRecord, decision: Decision, reason?: string) => {
      const setBusyIds =
        decision === "approve" ? setApprovingIds : decision === "reject" ? setRejectingIds : setRequestingInfoIds;
      setBusyIds((s) => new Set(s).add(row.id));
      setDecisionErrors((s) =>
        Object.fromEntries(Object.entries(s).filter(([id]) => id !== row.id))
      );

      const passport = store.passports[selectedId];
      const result = await anchorEvent({
        commitment: row.anchoredHash,
        device: passport?.device ?? "",
        market: row.markets.join("/"),
        type: row.type,
        issuer: row.issuer,
        event: DECISION_EVENT[decision],
        prev: isRealTxid(row.txid) ? row.txid : undefined,
      });

      setBusyIds((s) => {
        const next = new Set(s);
        next.delete(row.id);
        return next;
      });

      if (isAnchorFailure(result)) {
        setDecisionErrors((s) => ({ ...s, [row.id]: result.error }));
        return;
      }

      const newStatus = DECISION_STATUS[decision];
      const verb = DECISION_VERB[decision];
      store.updatePassport(selectedId, (p) => ({
        ...p,
        rows: p.rows.map((r) =>
          r.id === row.id
            ? { ...r, status: newStatus, txid: result.txid, regulatorNote: reason ?? r.regulatorNote }
            : r
        ),
        timeline: [
          ...p.timeline,
          {
            label: `${row.name} ${verb} by regulator${reason ? ` — "${reason}"` : ""}`,
            timestamp: "just now",
            txid: result.txid,
          },
        ],
      }));
      toast.push(
        `Manufacturer notified: ${row.name} was ${verb}.`,
        decision === "approve" ? "success" : decision === "reject" ? "error" : "info"
      );
      setSelectedRow(null);
      setDecisionModal(null);
    },
    [store, selectedId, toast]
  );

  const approve = useCallback((row: EvidenceRecord) => decide(row, "approve"), [decide]);
  const openReject = useCallback((row: EvidenceRecord) => setDecisionModal({ row, kind: "reject" }), []);
  const openRequestInfo = useCallback((row: EvidenceRecord) => setDecisionModal({ row, kind: "info" }), []);

  const handleSignOut = useCallback(() => {
    signingOutRef.current = true;
    signOut();
    router.push("/");
  }, [signOut, router]);

  if (!ready || !store.ready || !session || session.role !== "regulator") {
    return <div className="min-h-screen bg-teal-50" />;
  }

  const selected = store.passports[selectedId]!;

  return (
    <div className="min-h-screen bg-teal-50">
      <nav className="flex items-center justify-between border-b border-line bg-white px-6 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="font-display text-[17px] font-semibold tracking-tight text-teal-700">MedPass</span>
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
        <div className="rounded-[22px] border border-line bg-white p-6 shadow-card">
          <div className="mb-3.5 font-mono text-[11px] font-semibold text-muted">
            VERIFIER CONSOLE — SELECT A DEVICE PASSPORT
          </div>
          <div className="flex flex-wrap gap-3">
            {passportIds.map((id) => {
              const p = store.passports[id]!;
              const active = id === selectedId;
              const pendingCount = p.rows.filter((r) => r.status === "Pending Review").length;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => select(id)}
                  className={cn(
                    "relative min-w-[200px] rounded-xl border-[1.5px] px-[18px] py-3.5 text-left",
                    active ? "border-teal-600 bg-teal-100" : "border-line bg-white"
                  )}
                >
                  {pendingCount > 0 && (
                    <span className="absolute right-3 top-3 rounded-full bg-amber-text px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {pendingCount}
                    </span>
                  )}
                  <div className="text-sm font-semibold">{p.device}</div>
                  <div className="mt-0.5 text-xs text-muted">
                    {p.manufacturer} · Batch {p.batch}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-line bg-white p-6 shadow-card sm:p-7">
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
            <MarketStatusPill market="EU" status={selected.euStatus} onClick={() => setActiveMarket("EU")} />
            <MarketStatusPill market="US" status={selected.usStatus} onClick={() => setActiveMarket("US")} />
          </div>
        </div>

        <MarketTabs
          active={activeMarket}
          onChange={setActiveMarket}
          counts={{
            EU: selected.rows.filter((r) => r.markets.includes("EU") && r.status === "Pending Review").length,
            US: selected.rows.filter((r) => r.markets.includes("US") && r.status === "Pending Review").length,
          }}
        />

        <EvidenceList
          rows={selected.rows.filter((r) => r.markets.includes(activeMarket))}
          onView={setSelectedRow}
        />

        {Object.entries(decisionErrors).map(([rowId, message]) => (
          <div
            key={rowId}
            className="rounded-[22px] border border-danger-border bg-danger-bg p-4 text-[13px] text-danger-text"
          >
            Decision failed for {selected.rows.find((r) => r.id === rowId)?.name ?? rowId}: {message}
          </div>
        ))}

        <AuditTimeline events={selected.timeline} />

        <div className="rounded-[22px] border border-line bg-white p-5 text-[13px] text-muted">
          Regulators can recompute and verify evidence hashes, and approve or reject records pending
          review — the decision is visible to the manufacturer immediately. Regulators cannot upload,
          edit, or revoke documents; those actions remain the manufacturer&rsquo;s responsibility. Open{" "}
          <Link href="/login" target="_blank" className="font-semibold text-teal-700">
            /login
          </Link>{" "}
          as a manufacturer in a new tab to see both sides live.
        </div>
      </div>

      <EvidenceDetailModal
        row={selectedRow}
        onClose={() => setSelectedRow(null)}
        onCopyHash={copyHash}
        copied={copiedHash}
        onVerify={verify}
        verifyState={selectedRow ? verifyState[selectedRow.id] : undefined}
        onApprove={approve}
        onReject={openReject}
        onRequestInfo={openRequestInfo}
        approving={selectedRow ? approvingIds.has(selectedRow.id) : false}
        rejecting={selectedRow ? rejectingIds.has(selectedRow.id) : false}
        requestingInfo={selectedRow ? requestingInfoIds.has(selectedRow.id) : false}
      />

      <DecisionModal
        open={!!decisionModal}
        title={decisionModal?.kind === "reject" ? "Reject document" : "Ask for further documents"}
        description={
          decisionModal?.kind === "reject"
            ? `Tell ${selected.manufacturer} why "${decisionModal.row.name}" is being rejected.`
            : `Tell ${selected.manufacturer} what's missing or needs correcting for "${decisionModal?.row.name}".`
        }
        confirmLabel={decisionModal?.kind === "reject" ? "Reject document" : "Send request"}
        confirmVariant={decisionModal?.kind === "reject" ? "danger" : "warning"}
        busy={
          decisionModal
            ? decisionModal.kind === "reject"
              ? rejectingIds.has(decisionModal.row.id)
              : requestingInfoIds.has(decisionModal.row.id)
            : false
        }
        onClose={() => setDecisionModal(null)}
        onConfirm={(reason) => {
          if (!decisionModal) return;
          decide(decisionModal.row, decisionModal.kind, reason);
        }}
      />
    </div>
  );
}
