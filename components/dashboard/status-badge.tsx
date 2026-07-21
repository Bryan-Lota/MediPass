import { cn } from "@/lib/utils";
import type { EvidenceStatus, MarketStatus } from "@/lib/types";

const evidenceClasses: Record<EvidenceStatus, string> = {
  Verified: "bg-teal-100 text-teal-700 border-teal-200",
  "Pending Review": "bg-teal-50 text-muted border-line",
  Tampered: "bg-danger-bg text-danger-text border-danger-border",
  Revoked: "bg-amber-bg text-amber-text border-amber-border",
  Rejected: "bg-danger-bg text-danger-text border-danger-border",
  "Info Requested": "bg-amber-bg text-amber-text border-amber-border",
};

const marketClasses: Record<MarketStatus, string> = {
  "Evidence Complete": "bg-teal-100 text-teal-700 border-teal-200",
  "Pending Review": "bg-teal-50 text-muted border-line",
  Incomplete: "bg-amber-bg text-amber-text border-amber-border",
  Revoked: "bg-amber-bg text-amber-text border-amber-border",
};

export function EvidenceStatusBadge({ status }: { status: EvidenceStatus }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full border px-2.5 py-1 text-xs font-semibold",
        evidenceClasses[status]
      )}
    >
      {status}
    </span>
  );
}

export function MarketStatusPill({
  market,
  status,
  onClick,
}: {
  market: string;
  status: MarketStatus;
  onClick?: () => void;
}) {
  const className = cn(
    "rounded-full border px-3.5 py-2 text-sm font-semibold",
    marketClasses[status],
    onClick && "cursor-pointer transition-transform hover:scale-[1.03]"
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {market}: {status}
      </button>
    );
  }
  return (
    <div className={className}>
      {market}: {status}
    </div>
  );
}
