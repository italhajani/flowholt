import React, { useMemo, useState, useRef } from "react";
import {
  Bot,
  MessageSquare,
  Maximize2,
  Plus,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Zap,
  Mail,
  Database,
  GitBranch,
  Flag,
  CheckCircle2,
  AlertCircle,
  Slack,
  MoreVertical,
  GripVertical,
} from "lucide-react";

interface WorkflowCanvasProps {
  onNodeSelect: (nodeId: string | null) => void;
}

type NodeType = "trigger" | "action" | "condition" | "end" | "model" | "integration" | "tool";
type NodeStatus = "normal" | "degraded" | "error" | "warning" | "success";

interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  subtitle?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status?: NodeStatus;
  icon?: React.ElementType;
  subComponents?: Array<{ label: string; icon?: React.ElementType }>;
  description?: string;
  tags?: string[];
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  color?: string;
  dashed?: boolean;
  label?: string;
}

const initialNodes: WorkflowNode[] = [
  {
    id: "trigger-1",
    type: "trigger",
    label: "When chat message received",
    subtitle: "Trigger",
    x: 60,
    y: 150,
    width: 200,
    height: 100,
    status: "normal",
    icon: MessageSquare,
    description: "This is a starting point of your automation",
    tags: ["Unassigned"],
  },
  {
    id: "ai-model",
    type: "action",
    label: "AI Agent",
    subtitle: "Tool Agent",
    x: 340,
    y: 120,
    width: 280,
    height: 160,
    status: "normal",
    icon: Bot,
    subComponents: [
      { label: "OpenAI Chat Model", icon: Bot },
      { label: "Window Buffer Memory", icon: Database },
      { label: "SerpAPI", icon: Zap },
      { label: "Call n8n Workflow Tool", icon: GitBranch },
    ],
    tags: ["With Essay"],
  },
  {
    id: "condition-1",
    type: "condition",
    label: "If",
    subtitle: "Decision Point",
    x: 720,
    y: 160,
    width: 140,
    height: 100,
    status: "normal",
    icon: GitBranch,
  },
  {
    id: "success-action",
    type: "integration",
    label: "Success",
    subtitle: "Send message",
    x: 950,
    y: 80,
    width: 140,
    height: 80,
    status: "success",
    icon: Slack,
  },
  {
    id: "failure-action",
    type: "integration",
    label: "Failure",
    subtitle: "Send message",
    x: 950,
    y: 200,
    width: 140,
    height: 80,
    status: "error",
    icon: Slack,
  },
  {
    id: "start-node",
    type: "trigger",
    label: "Start Node",
    subtitle: "Main Node",
    x: 100,
    y: 400,
    width: 160,
    height: 100,
    status: "normal",
    icon: Flag,
    tags: ["Unassigned"],
  },
  {
    id: "creative-writer",
    type: "action",
    label: "Creative Writer",
    subtitle: "Essay",
    x: 350,
    y: 300,
    width: 200,
    height: 100,
    status: "warning",
    icon: Mail,
    tags: ["Unassigned", "With Essay"],
  },
  {
    id: "email-agent",
    type: "action",
    label: "Email Agent",
    subtitle: "Gmail",
    x: 350,
    y: 450,
    width: 200,
    height: 100,
    status: "normal",
    icon: Mail,
    tags: ["Unassigned", "Write Email"],
  },
  {
    id: "end-node",
    type: "end",
    label: "End",
    subtitle: "End point",
    x: 680,
    y: 375,
    width: 140,
    height: 100,
    status: "normal",
    icon: CheckCircle2,
  },
  {
    id: "notification",
    type: "integration",
    label: "Notification",
    subtitle: "Slack",
    x: 680,
    y: 600,
    width: 180,
    height: 100,
    status: "success",
    icon: Slack,
    tags: ["Unassigned", "Write Easily"],
  },
];

const initialEdges: WorkflowEdge[] = [
  { id: "e1", source: "trigger-1", target: "ai-model", color: "#3b82f6" },
  { id: "e2", source: "ai-model", target: "condition-1", color: "#8b5cf6" },
  { id: "e3", source: "condition-1", target: "success-action", color: "#10b981" },
  { id: "e4", source: "condition-1", target: "failure-action", color: "#ef4444" },
  { id: "e5", source: "start-node", target: "creative-writer", color: "#f59e0b", dashed: true },
  { id: "e6", source: "start-node", target: "email-agent", color: "#f59e0b", dashed: true },
  { id: "e7", source: "creative-writer", target: "end-node", color: "#8b5cf6", dashed: true },
  { id: "e8", source: "email-agent", target: "end-node", color: "#8b5cf6", dashed: true },
  { id: "e9", source: "end-node", target: "notification", color: "#10b981" },
];

const statusConfig: Record<NodeStatus, { bg: string; border: string; badge: string }> = {
  normal: { bg: "bg-white", border: "border-slate-200", badge: "bg-blue-100 text-blue-700" },
  degraded: { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-700" },
  error: { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700" },
  warning: { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700" },
  success: { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-700" },
};

const statusBadgeConfig: Record<NodeStatus, string> = {
  normal: "NORMAL",
  degraded: "DEGRADED",
  error: "ERROR",
  warning: "WARNING",
  success: "SUCCESS",
};

interface DragState {
  nodeId: string | null;
  startX: number;
  startY: number;
  startNodeX: number;
  startNodeY: number;
}

const ModernNodeCard: React.FC<{
  node: WorkflowNode;
  onSelect: (id: string) => void;
  onDragStart: (e: React.MouseEvent, nodeId: string) => void;
  isDragging: boolean;
}> = ({ node, onSelect, onDragStart, isDragging }) => {
  const Icon = node.icon || Zap;
  const config = statusConfig[node.status || "normal"];

  return (
    <button
      onMouseDown={(e) => onDragStart(e, node.id)}
      onClick={() => onSelect(node.id)}
      className="absolute text-left group"
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: `${node.width}px`,
        cursor: "grab",
      }}
    >
      <div
        className={`relative rounded-2xl border-2 transition-all duration-200 ${config.bg} ${config.border} ${
          isDragging ? "shadow-2xl scale-105 border-blue-400" : "shadow-lg hover:shadow-2xl hover:border-blue-300"
        }`}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Icon size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 leading-5 truncate">{node.label}</div>
              <div className="text-xs text-slate-500 truncate">{node.subtitle}</div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 shrink-0 cursor-pointer group-hover:opacity-100 opacity-0 transition-opacity">
            <MoreVertical size={14} />
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          {node.description && <p className="text-xs text-slate-600 leading-4 mb-3">{node.description}</p>}

          {/* Sub-components */}
          {node.subComponents && node.subComponents.length > 0 && (
            <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-xs font-semibold text-slate-700 mb-2">Components:</div>
              <div className="space-y-2">
                {node.subComponents.map((sub, i) => {
                  const SubIcon = sub.icon || Database;
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <SubIcon size={12} className="text-slate-400" />
                      <span className="text-slate-600">{sub.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status badge */}
          {node.status && (
            <div className="mb-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.badge}`}>
                ● {statusBadgeConfig[node.status]}
              </span>
            </div>
          )}

          {/* Tags */}
          {node.tags && node.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {node.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Drag handle indicator */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
};

const ConnectionLine: React.FC<{
  edge: WorkflowEdge;
  nodeMap: Record<string, WorkflowNode>;
}> = ({ edge, nodeMap }) => {
  const source = nodeMap[edge.source];
  const target = nodeMap[edge.target];

  if (!source || !target) return null;

  const startX = source.x + source.width;
  const startY = source.y + source.height / 2;
  const endX = target.x;
  const endY = target.y + target.height / 2;

  const midX = startX + (endX - startX) / 2;

  const d = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={edge.color || "#8b5cf6"}
        strokeWidth="3"
        strokeDasharray={edge.dashed ? "8 4" : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {edge.label && (
        <text
          x={midX}
          y={Math.min(startY, endY) - 10}
          textAnchor="middle"
          fontSize="12"
          fill="#6b7280"
          fontWeight="500"
        >
          {edge.label}
        </text>
      )}
      {/* Arrowhead */}
      <defs>
        <marker
          id={`arrowhead-${edge.id}`}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill={edge.color || "#8b5cf6"} />
        </marker>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={edge.color || "#8b5cf6"}
        strokeWidth="2"
        strokeDasharray={edge.dashed ? "8 4" : undefined}
        markerEnd={`url(#arrowhead-${edge.id})`}
        opacity="0"
      />
    </>
  );
};

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ onNodeSelect }) => {
  const [zoom, setZoom] = useState(84);
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [dragState, setDragState] = useState<DragState>({ nodeId: null, startX: 0, startY: 0, startNodeX: 0, startNodeY: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const scale = zoom / 100;

  const canvasWidth = 1500;
  const canvasHeight = 920;

  const nodeMap = useMemo(() => Object.fromEntries(nodes.map((node) => [node.id, node])), [nodes]);

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setDragState({
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      startNodeX: node.x,
      startNodeY: node.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.nodeId) return;

    const deltaX = (e.clientX - dragState.startX) / scale;
    const deltaY = (e.clientY - dragState.startY) / scale;

    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === dragState.nodeId
          ? { ...node, x: dragState.startNodeX + deltaX, y: dragState.startNodeY + deltaY }
          : node,
      ),
    );
  };

  const handleMouseUp = () => {
    setDragState({ nodeId: null, startX: 0, startY: 0, startNodeX: 0, startNodeY: 0 });
  };

  React.useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove as any);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove as any);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, scale]);

  return (
    <div className="h-full w-full relative bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 overflow-hidden">
      {/* Animated background pattern */}
      <div
        className="absolute inset-0"
        onClick={() => onNodeSelect(null)}
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(79, 70, 229, 0.05) 25%, rgba(79, 70, 229, 0.05) 26%, transparent 27%, transparent 74%, rgba(79, 70, 229, 0.05) 75%, rgba(79, 70, 229, 0.05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(79, 70, 229, 0.05) 25%, rgba(79, 70, 229, 0.05) 26%, transparent 27%, transparent 74%, rgba(79, 70, 229, 0.05) 75%, rgba(79, 70, 229, 0.05) 76%, transparent 77%, transparent)
          `,
          backgroundSize: "50px 50px",
          backgroundPosition: "0 0",
        }}
      />

      {/* Canvas scroll area */}
      <div ref={canvasRef} className="absolute inset-0 overflow-auto" onMouseMove={handleMouseMove}>
        <div
          className="relative mx-auto my-0"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          {/* SVG connections */}
          <svg className="absolute inset-0 pointer-events-none" width={canvasWidth} height={canvasHeight}>
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {initialEdges.map((edge) => (
              <ConnectionLine key={edge.id} edge={edge} nodeMap={nodeMap} />
            ))}
          </svg>

          {/* Node cards */}
          {nodes.map((node) => (
            <ModernNodeCard
              key={node.id}
              node={node}
              onSelect={onNodeSelect}
              onDragStart={handleMouseDown}
              isDragging={dragState.nodeId === node.id}
            />
          ))}
        </div>
      </div>

      {/* Top-right controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button className="h-9 px-3 rounded-xl border border-slate-200 bg-white inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:shadow-md transition-all">
          <RotateCcw size={13} />
          Undo
        </button>
        <button className="h-9 px-3 rounded-xl border border-blue-300 bg-blue-50 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 hover:shadow-md transition-all">
          Test Run
        </button>
        <button className="h-9 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white inline-flex items-center gap-1.5 text-xs font-medium hover:shadow-lg hover:brightness-110 transition-all">
          Publish
        </button>
      </div>

      {/* Bottom zoom controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white rounded-2xl border border-slate-200 px-3 py-2 shadow-lg hover:shadow-xl transition-shadow">
        <button
          onClick={() => setZoom((z) => Math.max(50, z - 10))}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-xs font-semibold text-slate-700 min-w-10 text-center select-none">{zoom}%</span>
        <button
          onClick={() => setZoom((z) => Math.min(150, z + 10))}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ZoomIn size={16} />
        </button>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <button
          onClick={() => setZoom(84)}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
        >
          <Maximize2 size={15} />
        </button>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors">
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
