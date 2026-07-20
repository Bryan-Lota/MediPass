"use client";

import { useState, useRef, useCallback } from "react";
import { sha256Hex, shortHash } from "@/lib/hash";
import { cn } from "@/lib/utils";

type DocId = "qms" | "sterilization" | "udi";
type Stage = "idle" | "hashing" | "comparing" | "done";
type Result = "VERIFIED" | "TAMPERED" | "REVOKED";

interface DemoDoc {
  name: string;
  /** What actually gets hashed live, in the browser. */
  content: string;
  /** The hash that was anchored on-chain at submission time. */
  anchoredHash: string;
  result: Result;
}

const docs: Record<DocId, DemoDoc> = {
  qms: {
    name: "QMS Certificate",
    content:
      "QMS_CERTIFICATE|CardioFlow X1|Acme MedTech Ltd.|ISO 13485|issued 2026-05-02|expires 2027-03-01",
    anchoredHash: "2e032505a1c7cdf6ffa61b34fabf8d9c33e56fca6a9f7108b5344b6ed5ab76af",
    result: "VERIFIED",
  },
  sterilization: {
    name: "Sterilisation Report",
    // Edited after the original was anchored — the live hash will genuinely miss.
    content:
      "STERILISATION_REPORT|CardioFlow X1|Acme MedTech Ltd.|EO validation cycle 42|batch 04A|v2-edited-after-signing",
    anchoredHash: "e5856d95f3e0e34620a96109218e87533677fd3b06b78665ad7be7d3dae7ffc6",
    result: "TAMPERED",
  },
  udi: {
    name: "UDI Device Record",
    content: "UDI_RECORD|CardioFlow X1|Acme MedTech Ltd.|UDI-DI 00889812345670|issued 2026-05-08",
    anchoredHash: "dd0bddfb1e90f192aee57e2055da80abe012ddeeba08842efdb3c37e0152f31a",
    result: "REVOKED",
  },
};

const stageLabels: Record<Stage, string> = {
  idle: "Select a document above",
  hashing: "Computing SHA-256…",
  comparing: "Comparing to BSV record…",
  done: "Comparison complete",
};

const resultClasses: Record<Result, string> = {
  VERIFIED: "bg-teal-100 text-teal-700 border border-teal-600",
  TAMPERED: "bg-danger-bg text-danger-text border border-danger-border",
  REVOKED: "bg-amber-bg text-amber-text border border-amber-border",
};

export function LiveVerificationDemo() {
  const [docId, setDocId] = useState<DocId>("qms");
  const [stage, setStage] = useState<Stage>("idle");
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const pickDoc = useCallback((id: DocId) => {
    clearTimers();
    setDocId(id);
    setStage("hashing");
    setComputedHash(null);

    sha256Hex(docs[id].content).then((hex) => {
      timers.current.push(
        setTimeout(() => {
          setComputedHash(hex);
          setStage("comparing");
        }, 700)
      );
      timers.current.push(setTimeout(() => setStage("done"), 1500));
    });
  }, []);

  const doc = docs[docId];
  const showResult = stage === "done";
  const showOnchain = stage === "comparing" || stage === "done";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        {(Object.keys(docs) as DocId[]).map((id) => {
          const active = id === docId;
          return (
            <button
              key={id}
              type="button"
              onClick={() => pickDoc(id)}
              className={cn(
                "rounded-lg border-[1.5px] px-[18px] py-2.5 text-sm font-semibold text-white transition-colors",
                active ? "border-teal-600 bg-teal-600" : "border-white/25 bg-transparent"
              )}
            >
              {docs[id].name}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-[#2a4444] bg-[#152626] p-8">
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <div className="mb-2 font-mono text-[11px] font-semibold text-teal-200">
              COMPUTED HASH (from file, live)
            </div>
            <div className="min-h-[20px] break-all rounded-md bg-ink px-3.5 py-2.5 font-mono text-[15px] text-white">
              {stage === "idle" || !computedHash ? "—" : shortHash(computedHash)}
            </div>
          </div>
          <div>
            <div className="mb-2 font-mono text-[11px] font-semibold text-teal-200">
              ON-CHAIN RECORD (BSV)
            </div>
            <div className="min-h-[20px] break-all rounded-md bg-ink px-3.5 py-2.5 font-mono text-[15px] text-white">
              {showOnchain ? shortHash(doc.anchoredHash) : "—"}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 border-t border-[#2a4444] py-5 sm:flex-row">
          <div className="font-mono text-[13px] text-teal-200">{stageLabels[stage]}</div>
          {showResult && (
            <div
              className={cn(
                "rounded-full px-4 py-1.5 font-mono text-sm font-bold tracking-wide",
                resultClasses[doc.result]
              )}
            >
              {doc.result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
