import React from "react";
import { cn } from "@/lib/utils";
import { Check, X, AlertCircle, Loader2 } from "lucide-react";

export interface ActivityItem {
  id: string;
  workflowName: string;
  status: "success" | "failed" | "warning" | "running";
  message: string;
  time: string;
}

const ActivityFeed: React.FC<{ items: ActivityItem[] }> = ({ items }) => {
  return (
    <div className="bg-white rounded-[14px] border border-slate-200/50 flex flex-col h-full shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100/80 bg-slate-50/50">
        <h3 className="text-[13px] font-bold text-slate-900">Recent Activity</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.map((item) => {
          let Icon;
          let iconColor = "";
          let bgDot = "";

          switch (item.status) {
            case "success":
              Icon = Check;
              iconColor = "text-emerald-600";
              bgDot = "bg-emerald-50 border-emerald-100";
              break;
            case "failed":
              Icon = X;
              iconColor = "text-red-500";
              bgDot = "bg-red-50 border-red-100";
              break;
            case "warning":
              Icon = AlertCircle;
              iconColor = "text-amber-500";
              bgDot = "bg-amber-50 border-amber-100";
              break;
            case "running":
              Icon = Loader2;
              iconColor = "text-blue-500";
              bgDot = "bg-blue-50 border-blue-100";
              break;
          }

          return (
            <div
              key={item.id}
              className="px-5 py-2.5 flex items-center gap-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center border shrink-0",
                  bgDot
                )}
              >
                <Icon
                  size={10}
                  strokeWidth={3}
                  className={cn(item.status === "running" && "animate-spin keyframes-spin", iconColor)}
                />
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <div className="flex items-baseline gap-2 truncate pr-4">
                  <span className="text-[12px] font-semibold text-slate-800 tracking-tight block">
                    {item.workflowName}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate hidden sm:inline-block">
                    {item.message}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap group-hover:text-slate-500 transition-colors">
                  {item.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-5 py-2 border-t border-slate-100/80 bg-slate-50/30 text-center">
        <button className="text-[11px] font-semibold text-[#103b71] hover:underline">View all logs →</button>
      </div>
    </div>
  );
};

export default ActivityFeed;
