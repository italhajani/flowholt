import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  content?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
  children?: (activeTab: string) => ReactNode;
}

export function Tabs({ tabs, defaultTab, className, children }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Tab strip */}
      <div
        className="flex items-center gap-0.5 border-b border-zinc-100"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "relative px-3 py-2 text-[13px] font-medium transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-1 rounded-sm",
              active === tab.id
                ? "text-zinc-900 after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-zinc-900"
                : "text-zinc-400 hover:text-zinc-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 pt-4">
        {children
          ? children(active)
          : tabs.find((t) => t.id === active)?.content}
      </div>
    </div>
  );
}
