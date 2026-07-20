import { Card } from "@/components/ui/card";
import type { ChecklistItem } from "@/lib/types";

export function ChecklistCard({
  title,
  items,
  emphasize,
}: {
  title: string;
  items: ChecklistItem[];
  emphasize?: boolean;
}) {
  return (
    <Card className="p-5">
      <div
        className={`mb-3.5 font-mono text-xs font-semibold ${emphasize ? "text-teal-700" : "text-muted"}`}
      >
        {title}
      </div>
      <div className="flex flex-col gap-2.5">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between border-b border-line py-2.5 last:border-b-0"
          >
            <span className="flex items-center gap-2 text-sm">
              <span className={item.met ? "text-teal-600" : "text-[#c7cccc]"}>
                {item.met ? "✓" : "○"}
              </span>
              {item.label}
            </span>
            <span
              className={`font-mono text-xs ${item.met ? "text-muted" : "text-amber-border"}`}
            >
              {item.detail}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
