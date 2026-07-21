import { cn } from "@/lib/utils";
import type { Market } from "@/lib/types";

const MARKET_LABEL: Record<Market, string> = {
  EU: "EU",
  US: "FDA (US)",
};

export function MarketTabs({
  active,
  onChange,
  counts,
}: {
  active: Market;
  onChange: (m: Market) => void;
  /** Optional pending-count badge per market. */
  counts?: Partial<Record<Market, number>>;
}) {
  const markets: Market[] = ["EU", "US"];
  return (
    <div className="inline-flex gap-1 rounded-xl border border-line bg-teal-50 p-1">
      {markets.map((m) => {
        const isActive = m === active;
        const count = counts?.[m];
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              isActive ? "bg-white text-teal-700 shadow-card" : "text-muted hover:text-ink"
            )}
          >
            {MARKET_LABEL[m]}
            {!!count && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  isActive ? "bg-amber-bg text-amber-text" : "bg-white text-muted"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
