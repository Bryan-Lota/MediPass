import { Card } from "@/components/ui/card";
import { isRealTxid, explorerTxUrl } from "@/lib/bsv/explorer";
import type { TimelineEvent } from "@/lib/types";

export function AuditTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <Card className="p-6">
      <div className="mb-[18px] font-mono text-xs font-semibold text-muted">
        AUDIT TIMELINE
      </div>
      <div className="flex flex-col">
        {events.map((ev, i) => (
          <div key={`${ev.label}-${ev.timestamp}`} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-teal-600" />
              {i < events.length - 1 && <div className="min-h-6 w-0.5 flex-1 bg-line" />}
            </div>
            <div className="pb-5">
              <div className="text-sm font-semibold">{ev.label}</div>
              <div className="flex items-center gap-2">
                <div className="font-mono text-xs text-muted">{ev.timestamp}</div>
                {ev.txid && isRealTxid(ev.txid) && (
                  <a
                    href={explorerTxUrl(ev.txid)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs font-semibold text-teal-700 hover:underline"
                  >
                    View on-chain ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
