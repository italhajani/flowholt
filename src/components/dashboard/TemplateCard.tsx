import React from "react";
import { cn } from "@/lib/utils";
import {
  Clock,
  Zap,
  type LucideIcon,
  Headphones,
  TrendingUp,
  RefreshCw,
  MessageSquare,
  FileText,
  Pen,
} from "lucide-react";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  triggerType: string;
  estimatedTime: string;
  complexity: "Simple" | "Standard" | "Complex";
  integrationIcons?: LucideIcon[];
  color: string;
}

interface TemplateCardProps {
  template: Template;
  onClick?: (id: string) => void;
  onUse?: (id: string) => void;
}

const complexityColors = {
  Simple: "bg-emerald-50 text-emerald-600",
  Standard: "bg-blue-50 text-blue-600",
  Complex: "bg-violet-50 text-violet-600",
};

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Support: Headphones,
  Sales: TrendingUp,
  Revenue: RefreshCw,
  Communication: MessageSquare,
  Finance: FileText,
  Marketing: Pen,
};

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onClick, onUse }) => {
  const CategoryIcon = CATEGORY_ICON_MAP[template.category] ?? Zap;

  return (
    <div
      className="group relative flex flex-col rounded-xl border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-sm cursor-pointer overflow-hidden"
      onClick={() => onClick?.(template.id)}
    >
      {/* Top colored accent band */}
      <div className="h-1.5 w-full" style={{ background: template.color }} />

      {/* Card body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Icon + category row */}
        <div className="flex items-center justify-between mb-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ background: `${template.color}14` }}
          >
            <CategoryIcon size={18} style={{ color: template.color }} />
          </div>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", complexityColors[template.complexity])}>
            {template.complexity}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-[14px] font-semibold text-slate-900 leading-snug mb-1">{template.name}</h4>

        {/* Description */}
        <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 mb-4 flex-1">{template.description}</p>

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Zap size={10} />{template.triggerType}</span>
            <span className="flex items-center gap-1"><Clock size={10} />{template.estimatedTime}</span>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onUse?.(template.id); }}
            className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-blue-100"
          >
            Use template
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
