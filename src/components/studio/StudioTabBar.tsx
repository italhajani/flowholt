import { cn } from "@/lib/utils";

const tabs = ["Workflow", "Executions", "Evaluation", "Settings"];

export function StudioTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="flex h-9 items-end gap-4 border-b border-zinc-100 bg-white px-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "relative pb-2 text-[12px] font-medium transition-colors",
            activeTab === tab
              ? "text-zinc-900"
              : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          {tab}
          {activeTab === tab && (
            <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-zinc-900" />
          )}
        </button>
      ))}
    </div>
  );
}
