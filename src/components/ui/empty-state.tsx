import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, className, compact = false }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-10 px-6" : "py-16 px-8",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-xl mb-3",
          compact ? "h-10 w-10" : "h-12 w-12",
        )}
        style={{ background: "var(--color-bg-surface-strong)" }}
      >
        <div className="text-zinc-400">{icon}</div>
      </div>
      <p className={cn("font-medium text-zinc-600", compact ? "text-[13px]" : "text-[14px]")}>{title}</p>
      {description && (
        <p className="mt-1 max-w-[300px] text-[12px] text-zinc-400 leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
