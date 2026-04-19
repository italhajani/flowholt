import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Inbox, Lock, WifiOff, AlertTriangle, Search, Plus,
} from "lucide-react";

type EmptyVariant = "no-data" | "no-results" | "no-permission" | "offline" | "error";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
  variant?: EmptyVariant;
}

const variantDefaults: Record<EmptyVariant, { icon: ReactNode; color: string }> = {
  "no-data":       { icon: <Inbox size={20} />,          color: "text-zinc-400" },
  "no-results":    { icon: <Search size={20} />,         color: "text-zinc-400" },
  "no-permission": { icon: <Lock size={20} />,           color: "text-amber-400" },
  "offline":       { icon: <WifiOff size={20} />,        color: "text-zinc-400" },
  "error":         { icon: <AlertTriangle size={20} />,  color: "text-red-400" },
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  compact = false,
  variant = "no-data",
}: EmptyStateProps) {
  const defaults = variantDefaults[variant];
  const resolvedIcon = icon ?? defaults.icon;

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
          variant === "error" && "bg-red-50",
          variant === "no-permission" && "bg-amber-50",
          variant === "offline" && "bg-zinc-100",
        )}
        style={
          !["error", "no-permission", "offline"].includes(variant)
            ? { background: "var(--color-bg-surface-strong)" }
            : undefined
        }
      >
        <div className={defaults.color}>{resolvedIcon}</div>
      </div>
      <p className={cn("font-medium text-zinc-600", compact ? "text-[13px]" : "text-[14px]")}>{title}</p>
      {description && (
        <p className="mt-1 max-w-[300px] text-[12px] text-zinc-400 leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}

      {/* Default CTA for permission variant */}
      {!action && variant === "no-permission" && (
        <div className="mt-4">
          <button className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-[11px] font-medium text-amber-700 hover:bg-amber-100 transition-colors">
            Request Access
          </button>
        </div>
      )}

      {/* Default CTA for no-data variant */}
      {!action && variant === "no-data" && (
        <div className="mt-4">
          <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-blue-700 transition-colors">
            <Plus size={12} />
            Create New
          </button>
        </div>
      )}

      {/* Retry for error variant */}
      {!action && variant === "error" && (
        <div className="mt-4">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-[11px] font-medium text-red-700 hover:bg-red-100 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
