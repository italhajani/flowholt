import React from "react";
import { cn } from "@/lib/utils";

export type WorkflowStatus = "active" | "draft" | "paused" | "disabled" | "error";

interface StatusBadgeProps {
  status: WorkflowStatus;
  className?: string;
}

const statusConfig: Record<WorkflowStatus, { label: string; dotClass: string; bgClass: string; textClass: string }> = {
  active: {
    label: "Active",
    dotClass: "bg-emerald-500",
    bgClass: "bg-emerald-500/8",
    textClass: "text-emerald-600",
  },
  draft: {
    label: "Draft",
    dotClass: "bg-amber-500",
    bgClass: "bg-amber-500/8",
    textClass: "text-amber-600",
  },
  paused: {
    label: "Paused",
    dotClass: "bg-orange-500",
    bgClass: "bg-orange-500/8",
    textClass: "text-orange-600",
  },
  disabled: {
    label: "Disabled",
    dotClass: "bg-gray-400",
    bgClass: "bg-gray-400/8",
    textClass: "text-gray-500",
  },
  error: {
    label: "Error",
    dotClass: "bg-red-500",
    bgClass: "bg-red-500/8",
    textClass: "text-red-600",
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
