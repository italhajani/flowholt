import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface EntityTab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface EntityDetailLayoutProps {
  /** Back navigation label (e.g. "Workflows", "Vault") */
  backLabel: string;
  /** Route to navigate back to */
  backTo: string;
  /** Entity name displayed as page title */
  name: string;
  /** Status badge variant + label */
  status?: { label: string; variant: BadgeProps["variant"] };
  /** Optional subtitle / secondary info */
  subtitle?: string;
  /** Optional icon left of the name */
  icon?: ReactNode;
  /** Tab definitions */
  tabs: EntityTab[];
  /** Currently active tab id */
  activeTab: string;
  /** Tab change callback */
  onTabChange: (tabId: string) => void;
  /** Right-side header actions */
  actions?: ReactNode;
  /** Tab content */
  children: ReactNode;
}

export function EntityDetailLayout({
  backLabel,
  backTo,
  name,
  status,
  subtitle,
  icon,
  tabs,
  activeTab,
  onTabChange,
  actions,
  children,
}: EntityDetailLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-[960px] px-8 py-6">
      {/* Back link */}
      <button
        onClick={() => navigate(backTo)}
        className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 hover:text-zinc-700 transition-colors mb-4"
      >
        <ArrowLeft size={13} />
        {backLabel}
      </button>

      {/* Entity header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-[20px] font-semibold text-zinc-900 truncate">{name}</h1>
              {status && <Badge variant={status.variant}>{status.label}</Badge>}
            </div>
            {subtitle && <p className="mt-0.5 text-[13px] text-zinc-400">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0 ml-4">{actions}</div>}
      </div>

      {/* Tab bar */}
      <div
        className="mt-5 flex items-center gap-0"
        style={{ borderBottom: "1px solid var(--color-border-default)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium transition-colors duration-150 border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-zinc-800 text-zinc-800"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-6">{children}</div>
    </div>
  );
}

/** Reusable detail section wrapper */
export function DetailSection({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-medium text-zinc-800">{title}</h3>
          {description && <p className="mt-0.5 text-[12px] text-zinc-400">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

/** Reusable key-value row for detail sections */
export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
      <span className="text-[12px] text-zinc-400">{label}</span>
      <span className="text-[13px] text-zinc-700 text-right">{value}</span>
    </div>
  );
}
