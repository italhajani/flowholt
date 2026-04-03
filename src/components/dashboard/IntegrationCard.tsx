import React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Check, PlugZap, type LucideIcon } from "lucide-react";

export type IntegrationStatus = "connected" | "attention" | "available";

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  connected: boolean;
  iconColor: string;
  iconBg: string;
  status?: IntegrationStatus;
  authType?: string;
  featured?: boolean;
}

interface IntegrationCardProps {
  integration: Integration;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onAction?: (id: string) => void;
}

const statusStyles: Record<IntegrationStatus, string> = {
  connected: "bg-emerald-50 text-emerald-600 border-emerald-100",
  attention: "bg-amber-50 text-amber-700 border-amber-100",
  available: "bg-slate-100 text-slate-600 border-slate-200",
};

const statusLabels: Record<IntegrationStatus, string> = {
  connected: "Connected",
  attention: "Needs Attention",
  available: "Available",
};

const statusIcons: Record<IntegrationStatus, LucideIcon> = {
  connected: Check,
  attention: AlertTriangle,
  available: PlugZap,
};

const IntegrationCard: React.FC<IntegrationCardProps> = ({ integration, selected = false, onSelect, onAction }) => {
  const status = integration.status ?? (integration.connected ? "connected" : "available");
  const StatusIcon = statusIcons[status];

  return (
    <button
      type="button"
      onClick={() => onSelect?.(integration.id)}
      className={cn(
        "w-full bg-white rounded-xl border p-4 text-left transition-all duration-150 hover:bg-[hsl(210,20%,98.5%)]",
        selected
          ? "border-[#103b71]/30 shadow-[0_0_0_1px_rgba(16,59,113,0.18)]"
          : "border-[hsl(210,14%,92%)]"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", integration.iconBg)}>
          <integration.icon size={18} className={integration.iconColor} />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {integration.featured && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#103b71] text-[10px] font-semibold border border-blue-100">
              Popular
            </span>
          )}
          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold", statusStyles[status])}>
            <StatusIcon size={10} strokeWidth={3} />
            {statusLabels[status]}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="text-[13px] font-semibold text-[hsl(215,25%,15%)] mb-0.5">{integration.name}</h4>
        <p className="text-[11px] text-[hsl(215,10%,55%)] leading-relaxed line-clamp-2">{integration.description}</p>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[hsl(210,14%,94%)]">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-[hsl(215,8%,62%)] uppercase tracking-wider">{integration.category}</span>
          {integration.authType && <span className="text-[10px] text-slate-400 mt-0.5">{integration.authType}</span>}
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAction?.(integration.id);
          }}
          className={cn(
            "px-3 py-1 rounded-md text-[11px] font-medium transition-colors duration-150",
            status === "connected"
              ? "text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/70"
              : status === "attention"
                ? "text-amber-800 bg-amber-50 border border-amber-100 hover:bg-amber-100/70"
                : "text-primary border border-primary/20 hover:bg-primary/4"
          )}
        >
          {status === "connected" ? "Manage" : status === "attention" ? "Reconnect" : "Connect"}
        </button>
      </div>
    </button>
  );
};

export default IntegrationCard;
