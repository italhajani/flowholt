import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, description, actions, children }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="min-w-0">
        <h2 className="text-[18px] font-semibold leading-tight text-zinc-900">{title}</h2>
        {description && (
          <p className="mt-0.5 text-[13px] text-zinc-500">{description}</p>
        )}
        {children}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">{actions}</div>
      )}
    </div>
  );
}
