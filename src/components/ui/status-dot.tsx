import { cn } from "@/lib/utils";

type Status = "active" | "healthy" | "success" | "draft" | "inactive" | "paused" | "warning" | "expiring" | "error" | "failed" | "disabled";

const dotColors: Record<Status, string> = {
  active:   "bg-green-500",
  healthy:  "bg-green-500",
  success:  "bg-green-500",
  draft:    "bg-zinc-300",
  inactive: "bg-zinc-300",
  paused:   "bg-amber-400",
  warning:  "bg-amber-400",
  expiring: "bg-amber-400",
  error:    "bg-red-500",
  failed:   "bg-red-500",
  disabled: "bg-zinc-300",
};

const labelColors: Record<Status, string> = {
  active:   "text-green-700",
  healthy:  "text-green-700",
  success:  "text-green-700",
  draft:    "text-zinc-500",
  inactive: "text-zinc-500",
  paused:   "text-amber-600",
  warning:  "text-amber-600",
  expiring: "text-amber-600",
  error:    "text-red-600",
  failed:   "text-red-600",
  disabled: "text-zinc-400",
};

interface StatusDotProps {
  status: Status;
  label?: string;
  className?: string;
}

export function StatusDot({ status, label, className }: StatusDotProps) {
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("h-[6px] w-[6px] rounded-full flex-shrink-0", dotColors[status])} />
      <span className={cn("text-[12px] font-medium capitalize", labelColors[status])}>
        {displayLabel}
      </span>
    </span>
  );
}
