import { cn } from "@/lib/utils";

export type BadgeTone = "teal" | "neutral" | "amber" | "danger" | "ink";

const toneClasses: Record<BadgeTone, string> = {
  teal: "bg-teal-100 text-teal-700 border-teal-200",
  neutral: "bg-teal-50 text-muted border-line",
  amber: "bg-amber-bg text-amber-text border-amber-border",
  danger: "bg-danger-bg text-danger-text border-danger-border",
  ink: "bg-white text-ink border-line",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
