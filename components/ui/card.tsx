import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[22px] border border-line bg-white shadow-card",
        className
      )}
      {...props}
    />
  );
}
