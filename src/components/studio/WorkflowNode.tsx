import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Bot, CircleCheck, GitBranch, Mail, MessageSquare, MoreVertical, Webhook } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  zap: Webhook,
  gitfork: GitBranch,
  mail: Mail,
  message: MessageSquare,
  bot: Bot,
};

const pillMap: Record<string, string> = {
  Trigger: "bg-[#dbeafe] text-[#2563eb]",
  Action: "bg-[#fef3c7] text-[#b45309]",
  Behavior: "bg-[#fce7f3] text-[#be185d]",
  Route: "bg-[#dcfce7] text-[#15803d]",
  Outcome: "bg-[#fee2e2] text-[#b91c1c]",
};

interface WorkflowNodeProps {
  data: {
    label: string;
    subtitle: string;
    icon: string;
    latency: string;
    tag?: string;
    description?: string;
    body?: string;
    badge?: string;
    tokens?: string;
    duration?: string;
    variant?: "default" | "llm";
    deleted?: boolean;
  };
  selected?: boolean;
}

const WorkflowNode: React.FC<WorkflowNodeProps> = ({ data, selected }) => {
  const Icon = iconMap[data.icon] || Webhook;

  if (data.variant === "llm") {
    return (
      <div className={`relative min-w-[350px] max-w-[390px] rounded-[22px] border bg-white ${selected ? "border-[#4f7cff]" : "border-[#d7e3ff]"}`}>
        <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-white !border-[#d5dcf8]" />
        {data.tag && (
          <div className="absolute -top-3 left-4 inline-flex items-center px-3 h-7 rounded-[11px] bg-[#dbeafe] text-[#2563eb] text-[11px] font-medium">
            {data.tag}
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Icon size={18} className="text-slate-900" />
              <div className="text-[16px] font-semibold text-slate-900">{data.label}</div>
            </div>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50">
              <MoreVertical size={14} />
            </button>
          </div>

          <div className="mt-3 text-[13px] leading-7 text-slate-500">{data.description}</div>

          <div className="mt-4 rounded-[16px] border border-slate-200 bg-slate-50 p-4">
            <div className="inline-flex items-center px-2.5 h-6 rounded-[8px] border border-slate-200 bg-white text-[10px] font-medium text-slate-700">
              PROMPT
            </div>
            <div className="mt-2 text-[12px] leading-7 text-slate-600">{data.body}</div>
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {data.badge && (
              <span className="inline-flex items-center px-2.5 h-7 rounded-[10px] border border-slate-200 bg-white text-[11px] text-slate-700">
                {data.badge}
              </span>
            )}
            {data.tokens && (
              <span className="inline-flex items-center px-2.5 h-7 rounded-[10px] border border-slate-200 bg-white text-[11px] text-slate-500">
                {data.tokens}
              </span>
            )}
            {data.duration && (
              <span className="inline-flex items-center px-2.5 h-7 rounded-[10px] border border-slate-200 bg-white text-[11px] text-slate-500">
                {data.duration}
              </span>
            )}
          </div>
        </div>

        <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-white !border-[#d5dcf8]" />
      </div>
    );
  }

  return (
    <div className={`relative min-w-[230px] max-w-[250px] rounded-[18px] border bg-white ${selected ? "border-[#7aa5ff]" : data.deleted ? "border-[#f3c7c7]" : "border-slate-200"}`}>
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-white !border-[#d5dcf8]" />

      {data.deleted && (
        <div className="absolute -top-11 left-0 flex items-center gap-2">
          <span className="h-8 px-3 rounded-[10px] bg-[#4b5563] text-white text-[11px] font-medium inline-flex items-center">
            Deleted Node
          </span>
          <span className="h-8 px-3 rounded-[10px] bg-[#6b7280] text-white text-[11px] font-medium inline-flex items-center">
            Restore in current version
          </span>
        </div>
      )}

      {data.tag && (
        <div className={`absolute -top-3 left-4 inline-flex items-center px-3 h-7 rounded-[11px] text-[11px] font-medium ${pillMap[data.tag] || "bg-slate-100 text-slate-600"}`}>
          {data.tag}
        </div>
      )}

      <div className={data.deleted ? "opacity-35" : ""}>
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[14px] font-semibold text-slate-900 leading-5">{data.label}</div>
            <button className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50">
              <MoreVertical size={13} />
            </button>
          </div>

          <div className="mt-3 text-[12px] leading-6 text-slate-400">{data.description}</div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 h-7 rounded-[10px] border border-slate-200 bg-white text-[11px] text-slate-600">
              {data.subtitle}
            </span>
            <CircleCheck size={12} className="text-[#22c55e]" />
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-white !border-[#d5dcf8]" />
    </div>
  );
};

export default WorkflowNode;
