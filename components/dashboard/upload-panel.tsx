import { Button } from "@/components/ui/button";

export function UploadPanel({
  label,
  onSimulateUpload,
  busy,
  error,
}: {
  label: string;
  onSimulateUpload: () => void;
  busy: boolean;
  error?: string | null;
}) {
  return (
    <div className="flex min-h-[140px] flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-teal-200 bg-white p-6 text-center">
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-xs text-muted">Drag a file here, or click to simulate an upload.</div>
      <Button size="sm" onClick={onSimulateUpload} disabled={busy} className="mt-1.5">
        Simulate upload &amp; anchor
      </Button>
      {error && (
        <div className="mt-1 max-w-xs text-xs text-danger-text">
          Anchoring failed: {error}
        </div>
      )}
    </div>
  );
}
