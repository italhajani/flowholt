import React from "react";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  iconColor?: string; // used for icon styling specifically e.g. "text-emerald-500 bg-emerald-50"
  trendType?: "positive" | "negative" | "warning";
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  iconColor = "text-slate-500 bg-slate-50 border-slate-100/50",
  trendType = "neutral",
  className,
}) => {
  const getTrendStyles = (value: number) => {
    if (value > 0) return "text-emerald-600 bg-emerald-50/80 tracking-wide";
    if (value < 0) return "text-red-600 bg-red-50/80 tracking-wide";
    return "text-slate-600 bg-slate-50 tracking-wide";
  };

  const getArrow = (value: number) => {
    if (value > 0) return "↑";
    if (value < 0) return "↓";
    return "—";
  };

  return (
    <div
      className={cn(
        "bg-white rounded-[14px] p-5 pt-4 border border-slate-200/50 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02),_0_1px_2px_-1px_rgba(0,0,0,0.02)] relative overflow-hidden",
        className
      )}
    >
      <div className="flex justify-between items-start mb-3 border-transparent">
        <span className="text-[13px] font-semibold text-slate-500 tracking-wide">{label}</span>
        
        {/* Tiny circled icon top right */}
        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center border", iconColor)}>
          <Icon size={13} strokeWidth={2} />
        </div>
      </div>
      
      {/* Massive thick tight tracked number */}
      <h2 className="text-[28px] leading-tight font-[700] text-slate-900 tracking-tighter mb-4">
        {value}
      </h2>

      {/* Pill styling exactly like the screenshot */}
      {trend && (
        <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
          <span className={cn(
            "px-2 py-[2px] rounded-md text-[11px] font-[600]",
            getTrendStyles(trend.value)
          )}>
            {getArrow(trend.value)} {Math.abs(trend.value)}%
          </span>
          <span className="text-[11px] text-slate-400 font-medium tracking-wide">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
