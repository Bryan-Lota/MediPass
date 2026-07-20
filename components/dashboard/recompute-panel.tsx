import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type CompareStage = null | "checking" | "match" | "mismatch";

const labels: Record<Exclude<CompareStage, null>, string> = {
  checking: "Recomputing hash…",
  match: "✓ All hashes match their on-chain record",
  mismatch: "✕ Mismatch — a document no longer matches its anchored hash",
};

const classes: Record<Exclude<CompareStage, null>, string> = {
  checking: "text-muted",
  match: "font-semibold text-teal-700",
  mismatch: "font-semibold text-danger-text",
};

export function RecomputePanel({
  stage,
  onRecompute,
}: {
  stage: CompareStage;
  onRecompute: () => void;
}) {
  return (
    <Card className="flex flex-col justify-center gap-3 p-6">
      <Button variant="dark" onClick={onRecompute} disabled={stage === "checking"}>
        Recompute &amp; compare hash
      </Button>
      {stage && <div className={`font-mono text-[13px] ${classes[stage]}`}>{labels[stage]}</div>}
    </Card>
  );
}
