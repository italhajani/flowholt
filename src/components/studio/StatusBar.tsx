import React, { useState } from "react";
import { CircleCheck, XCircle, Clock, Zap, Eye, ChevronUp, ChevronDown, Activity } from "lucide-react";

interface StatusBarProps {
  nodeCount: number;
  zoom: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ nodeCount, zoom }) => {
  const [inspectorOpen, setInspectorOpen] = useState(false);

  return (
    <>
      {/* Variable Inspector Panel */}
      {inspectorOpen && (
        <div className="h-36 bg-studio-surface border-t border-studio-divider/30 flex flex-col animate-slide-up shrink-0">
          <div className="h-7 flex items-center justify-between px-3 shrink-0">
            <span className="text-[10px] font-semibold text-studio-text-primary">Variable Inspector</span>
            <button onClick={() => setInspectorOpen(false)} className="studio-icon-btn w-5 h-5">
              <ChevronDown size={11} />
            </button>
          </div>
          <div className="flex-1 overflow-auto px-3 pb-2">
            <table className="w-full">
              <thead>
                <tr className="text-[9px] text-studio-text-tertiary uppercase">
                  <th className="text-left py-1 font-medium">Node</th>
                  <th className="text-left py-1 font-medium">Variable</th>
                  <th className="text-left py-1 font-medium">Value</th>
                  <th className="text-left py-1 font-medium">Type</th>
                </tr>
              </thead>
              <tbody className="text-[10px]">
                {[
                  { node: "Webhook", variable: "ticket_id", value: "TKT-4829", type: "string" },
                  { node: "GPT-4", variable: "priority", value: "high", type: "string" },
                  { node: "GPT-4", variable: "confidence", value: "0.94", type: "number" },
                  { node: "Router", variable: "route", value: "email", type: "string" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-studio-surface-hover transition-colors duration-150">
                    <td className="py-1 text-studio-text-secondary font-mono">{row.node}</td>
                    <td className="py-1 text-primary font-mono">{row.variable}</td>
                    <td className="py-1 text-studio-text-primary font-mono">{row.value}</td>
                    <td className="py-1 text-studio-text-tertiary">{row.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className="h-6 flex items-center justify-between px-3 bg-studio-surface border-t border-studio-divider/30 shrink-0 text-[9px]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-studio-success">
            <CircleCheck size={9} />
            Ready
          </span>
          <span className="text-studio-text-tertiary">{nodeCount} nodes</span>
          <span className="text-studio-text-tertiary flex items-center gap-1">
            <Clock size={8} />
            Last run: 3m ago
          </span>
          <span className="text-studio-text-tertiary flex items-center gap-1">
            <Activity size={8} />
            Avg: 580ms
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setInspectorOpen(!inspectorOpen)}
            className="flex items-center gap-1 text-studio-text-secondary hover:text-studio-text-primary transition-colors duration-200"
          >
            <Eye size={9} />
            Variables
            {inspectorOpen ? <ChevronDown size={8} /> : <ChevronUp size={8} />}
          </button>
          <span className="text-studio-text-tertiary font-mono">{Math.round(zoom * 100)}%</span>
        </div>
      </div>
    </>
  );
};

export default StatusBar;
