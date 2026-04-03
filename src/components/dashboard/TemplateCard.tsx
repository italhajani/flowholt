import React from "react";
import { cn } from "@/lib/utils";
import { Clock, Zap, type LucideIcon } from "lucide-react";

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
}

const complexityColors = {
  Simple: "bg-emerald-50 text-emerald-600",
  Standard: "bg-blue-50 text-blue-600",
  Complex: "bg-violet-50 text-violet-600",
};

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onClick }) => {
  return (
    <div
      className="bg-white rounded-lg border border-[hsl(210,14%,92%)] overflow-hidden transition-colors duration-150 hover:bg-[hsl(210,20%,98.5%)] cursor-pointer"
      onClick={() => onClick?.(template.id)}
    >
      {/* Preview */}
      <div className="h-28 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${template.color}06 0%, ${template.color}14 100%)` }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="160" height="50" viewBox="0 0 160 50" className="opacity-30">
            <circle cx="25" cy="25" r="6" fill={template.color} opacity="0.5" />
            <line x1="31" y1="25" x2="55" y2="25" stroke={template.color} strokeWidth="1.5" opacity="0.3" />
            <circle cx="60" cy="25" r="5" fill={template.color} opacity="0.4" />
            <line x1="65" y1="25" x2="85" y2="15" stroke={template.color} strokeWidth="1.5" opacity="0.3" />
            <line x1="65" y1="25" x2="85" y2="35" stroke={template.color} strokeWidth="1.5" opacity="0.3" />
            <circle cx="90" cy="15" r="5" fill={template.color} opacity="0.4" />
            <circle cx="90" cy="35" r="5" fill={template.color} opacity="0.4" />
            <line x1="95" y1="15" x2="120" y2="25" stroke={template.color} strokeWidth="1.5" opacity="0.3" />
            <line x1="95" y1="35" x2="120" y2="25" stroke={template.color} strokeWidth="1.5" opacity="0.3" />
            <circle cx="125" cy="25" r="6" fill={template.color} opacity="0.5" />
          </svg>
        </div>
        <div className="absolute top-2.5 right-2.5">
          <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold", complexityColors[template.complexity])}>
            {template.complexity}
          </span>
        </div>
        {/* Render Integration Icons if they exist */}
        {template.integrationIcons && (
          <div className="absolute bottom-2.5 left-3 flex items-center -space-x-1.5">
            {template.integrationIcons.map((Icon, i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-white flex items-center justify-center border border-slate-200/50 shadow-sm" style={{ zIndex: 10 - i }}>
                <Icon size={10} className="text-slate-600" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        <h4 className="text-[13px] font-semibold text-[hsl(215,25%,15%)] mb-0.5">{template.name}</h4>
        <p className="text-[11px] text-[hsl(215,10%,55%)] leading-relaxed line-clamp-2 mb-2.5">{template.description}</p>
        <div className="flex items-center gap-3 text-[10px] text-[hsl(215,8%,60%)]">
          <span className="flex items-center gap-1"><Zap size={10} />{template.triggerType}</span>
          <span className="flex items-center gap-1"><Clock size={10} />{template.estimatedTime}</span>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
