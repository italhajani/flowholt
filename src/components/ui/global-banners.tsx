import { useState } from "react";
import {
  AlertTriangle,
  Clock,
  X,
  ArrowRight,
  Shield,
  Zap,
  Server,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Banner {
  id: string;
  type: "error" | "warning" | "info" | "trial";
  icon: React.ElementType;
  message: string;
  action?: { label: string; path: string };
  dismissible: boolean;
}

const activeBanners: Banner[] = [
  {
    id: "trial",
    type: "trial",
    icon: Clock,
    message: "Your free trial ends in 7 days. Upgrade to keep all your workflows running.",
    action: { label: "Upgrade now", path: "/settings/workspace/billing" },
    dismissible: true,
  },
  {
    id: "quota-warn",
    type: "warning",
    icon: Zap,
    message: "You've used 85% of your monthly execution credits (8,500 / 10,000).",
    action: { label: "Manage credits", path: "/settings/workspace/billing" },
    dismissible: true,
  },
];

const bannerStyles: Record<string, { bg: string; border: string; text: string; icon: string; action: string }> = {
  error:   { bg: "bg-red-50",    border: "border-red-200",   text: "text-red-800",    icon: "text-red-500",    action: "text-red-700 hover:text-red-900" },
  warning: { bg: "bg-amber-50",  border: "border-amber-200", text: "text-amber-800",  icon: "text-amber-500",  action: "text-amber-700 hover:text-amber-900" },
  info:    { bg: "bg-blue-50",   border: "border-blue-200",  text: "text-blue-800",   icon: "text-blue-500",   action: "text-blue-700 hover:text-blue-900" },
  trial:   { bg: "bg-violet-50", border: "border-violet-200",text: "text-violet-800", icon: "text-violet-500", action: "text-violet-700 hover:text-violet-900" },
};

export function GlobalBanners() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = activeBanners.filter((b) => !dismissed.has(b.id));
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col">
      {visible.map((banner) => {
        const style = bannerStyles[banner.type];
        const Icon = banner.icon;
        return (
          <div
            key={banner.id}
            className={cn(
              "flex items-center gap-3 px-4 py-2 text-[12px] border-b",
              style.bg,
              style.border
            )}
          >
            <Icon size={14} className={cn("flex-shrink-0", style.icon)} />
            <span className={cn("flex-1", style.text)}>{banner.message}</span>
            {banner.action && (
              <button
                onClick={() => navigate(banner.action!.path)}
                className={cn(
                  "flex items-center gap-1 text-[11px] font-semibold transition-colors flex-shrink-0",
                  style.action
                )}
              >
                {banner.action.label}
                <ArrowRight size={11} />
              </button>
            )}
            {banner.dismissible && (
              <button
                onClick={() => setDismissed((s) => new Set(s).add(banner.id))}
                className={cn("flex-shrink-0 rounded p-0.5 transition-colors hover:bg-black/5", style.icon)}
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
