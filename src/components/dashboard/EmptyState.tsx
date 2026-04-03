import React from "react";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 text-center animate-fade-in",
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/6 flex items-center justify-center text-primary/60 mb-5">
        <Icon size={28} />
      </div>
      <h3 className="text-[16px] font-semibold text-[hsl(215,25%,15%)] mb-1.5">
        {title}
      </h3>
      <p className="text-[13px] text-[hsl(215,10%,55%)] max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-primary text-primary-foreground hover:brightness-110 shadow-sm transition-all duration-200 active:scale-[0.97]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
