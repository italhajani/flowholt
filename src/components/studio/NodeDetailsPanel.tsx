import React from "react";
import { X, Brain, Settings2, Sliders, ToggleLeft } from "lucide-react";

interface NodeDetailsPanelProps {
  nodeId: string | null;
  onClose: () => void;
}

const nodeData: Record<string, { name: string; type: string; model: string; temp: number; tokens: number }> = {
  "ai-1": { name: "GPT-4 Classifier", type: "AI Model", model: "GPT-4", temp: 0.3, tokens: 2048 },
  "trigger-1": { name: "Webhook Trigger", type: "Trigger", model: "—", temp: 0, tokens: 0 },
  "condition-1": { name: "Priority Router", type: "Condition", model: "—", temp: 0, tokens: 0 },
  "email-1": { name: "Send Email Alert", type: "Action", model: "—", temp: 0, tokens: 0 },
  "slack-1": { name: "Slack Message", type: "Action", model: "—", temp: 0, tokens: 0 },
};

const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ nodeId, onClose }) => {
  if (!nodeId) return null;
  const node = nodeData[nodeId] || { name: "Node", type: "Unknown", model: "—", temp: 0, tokens: 0 };

  return (
    <div className="w-72 bg-studio-surface flex flex-col shrink-0 animate-slide-in-right border-l border-studio-divider/40">
      <div className="h-9 flex items-center justify-between px-3 shrink-0">
        <span className="text-[11px] font-semibold text-studio-text-primary">{node.name}</span>
        <button onClick={onClose} className="studio-icon-btn w-5 h-5">
          <X size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {/* Type badge */}
        <div>
          <span className="text-[10px] font-medium text-studio-text-tertiary uppercase tracking-wider">Type</span>
          <div className="mt-1 inline-flex px-2 py-0.5 rounded-md bg-primary/8 text-primary text-[10px] font-medium">
            {node.type}
          </div>
        </div>

        {/* Configuration */}
        {node.model !== "—" && (
          <>
            <div>
              <label className="text-[10px] font-medium text-studio-text-tertiary uppercase tracking-wider flex items-center gap-1">
                <Settings2 size={10} />
                Model
              </label>
              <div className="mt-1 h-7 flex items-center px-2.5 rounded-lg bg-studio-bg text-[11px] text-studio-text-primary">
                {node.model}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-medium text-studio-text-tertiary uppercase tracking-wider flex items-center gap-1">
                <Sliders size={10} />
                Temperature
              </label>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-studio-bg overflow-hidden">
                  <div
                    className="h-full rounded-full bg-studio-teal transition-all duration-300"
                    style={{ width: `${node.temp * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-studio-text-secondary w-6 text-right">{node.temp}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-medium text-studio-text-tertiary uppercase tracking-wider">
                Max Tokens
              </label>
              <div className="mt-1 h-7 flex items-center px-2.5 rounded-lg bg-studio-bg text-[11px] text-studio-text-primary font-mono">
                {node.tokens}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium text-studio-text-tertiary uppercase tracking-wider flex items-center gap-1">
                <ToggleLeft size={10} />
                Streaming
              </label>
              <div className="w-7 h-4 rounded-full bg-studio-teal p-0.5 cursor-pointer transition-colors duration-200">
                <div className="w-3 h-3 rounded-full bg-primary-foreground translate-x-3 transition-transform duration-200" />
              </div>
            </div>
          </>
        )}

        {/* Runtime info */}
        <div className="pt-2 border-t border-studio-divider/40">
          <span className="text-[10px] font-medium text-studio-text-tertiary uppercase tracking-wider">Runtime</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-studio-bg">
              <div className="text-[9px] text-studio-text-tertiary">Latency</div>
              <div className="text-[12px] font-semibold text-studio-text-primary">340ms</div>
            </div>
            <div className="p-2 rounded-lg bg-studio-bg">
              <div className="text-[9px] text-studio-text-tertiary">Success</div>
              <div className="text-[12px] font-semibold text-studio-success">98.4%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeDetailsPanel;
