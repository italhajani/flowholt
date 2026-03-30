import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Webhook, Brain, GitFork, Mail, MessageSquare, CircleCheck } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  zap: Webhook,
  brain: Brain,
  gitfork: GitFork,
  mail: Mail,
  message: MessageSquare,
};

const colorMap: Record<string, string> = {
  success: "bg-studio-success/8 text-studio-success",
  orange: "bg-studio-orange/8 text-studio-orange",
  warning: "bg-studio-warning/8 text-studio-warning",
  primary: "bg-primary/8 text-primary",
  destructive: "bg-destructive/8 text-destructive",
};

const borderColorMap: Record<string, string> = {
  success: "border-studio-success/15",
  orange: "border-studio-orange/15",
  warning: "border-studio-warning/15",
  primary: "border-primary/15",
  destructive: "border-destructive/15",
};

interface WorkflowNodeProps {
  data: {
    label: string;
    subtitle: string;
    icon: string;
    color: string;
    latency: string;
  };
  selected?: boolean;
}

const WorkflowNode: React.FC<WorkflowNodeProps> = ({ data, selected }) => {
  const Icon = iconMap[data.icon] || Webhook;
  const colorClass = colorMap[data.color] || colorMap.primary;
  const borderClass = borderColorMap[data.color] || borderColorMap.primary;

  return (
    <div className={`studio-node min-w-[160px] max-w-[190px] ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2" />

      <div className={`flex items-center gap-2 px-3 py-2 rounded-t-2xl ${colorClass.split(" ")[0]} border-b ${borderClass}`}>
        <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon size={12} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-studio-text-primary truncate">{data.label}</div>
          <div className="text-[9px] text-studio-text-tertiary truncate">{data.subtitle}</div>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="text-[9px] font-mono text-studio-text-tertiary">{data.latency}</span>
        <CircleCheck size={10} className="text-studio-success" />
      </div>

      <Handle type="source" position={Position.Right} className="!w-2 !h-2" />
    </div>
  );
};

export default WorkflowNode;
