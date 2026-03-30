import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ZoomIn, ZoomOut, Maximize2, Lock, Unlock, Sparkles } from "lucide-react";
import WorkflowNode from "./WorkflowNode";
import Tooltip from "./Tooltip";

const nodeTypes = { workflow: WorkflowNode };

const initialNodes: Node[] = [
  {
    id: "trigger-1",
    type: "workflow",
    position: { x: 80, y: 200 },
    data: { label: "Webhook Trigger", subtitle: "POST /api/tickets", icon: "zap", color: "success", latency: "12ms" },
  },
  {
    id: "ai-1",
    type: "workflow",
    position: { x: 380, y: 150 },
    data: { label: "GPT-4 Classifier", subtitle: "Classify priority", icon: "brain", color: "orange", latency: "340ms" },
  },
  {
    id: "condition-1",
    type: "workflow",
    position: { x: 660, y: 180 },
    data: { label: "Priority Router", subtitle: "If priority = high", icon: "gitfork", color: "warning", latency: "2ms" },
  },
  {
    id: "email-1",
    type: "workflow",
    position: { x: 960, y: 80 },
    data: { label: "Send Email Alert", subtitle: "Urgent notification", icon: "mail", color: "destructive", latency: "180ms" },
  },
  {
    id: "slack-1",
    type: "workflow",
    position: { x: 960, y: 300 },
    data: { label: "Slack Message", subtitle: "#support-queue", icon: "message", color: "primary", latency: "95ms" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "trigger-1", target: "ai-1", type: "smoothstep", style: { stroke: "hsl(160, 42%, 46%)", strokeWidth: 1.5 }, animated: true },
  { id: "e2", source: "ai-1", target: "condition-1", type: "smoothstep", style: { strokeWidth: 1.5 } },
  { id: "e3", source: "condition-1", target: "email-1", type: "smoothstep", label: "High", style: { stroke: "hsl(0, 72%, 51%)", strokeWidth: 1.5 } },
  { id: "e4", source: "condition-1", target: "slack-1", type: "smoothstep", label: "Normal", style: { stroke: "hsl(211, 64%, 45%)", strokeWidth: 1.5 } },
];

interface WorkflowCanvasProps {
  onNodeSelect: (nodeId: string | null) => void;
  onOpenChat: () => void;
}

const CanvasControls: React.FC = () => {
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
  const [locked, setLocked] = useState(false);
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => { zoomIn(); setTimeout(() => setZoom(Math.round(getZoom() * 100)), 50); };
  const handleZoomOut = () => { zoomOut(); setTimeout(() => setZoom(Math.round(getZoom() * 100)), 50); };
  const handleFit = () => { fitView({ padding: 0.3 }); setTimeout(() => setZoom(Math.round(getZoom() * 100)), 50); };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-white rounded-full shadow-sm border border-studio-divider/20 px-2 py-1.5">
      <Tooltip content="Zoom out" position="top">
        <button onClick={handleZoomOut} className="studio-icon-btn w-7 h-7 rounded-full">
          <ZoomOut size={15} className="text-studio-text-secondary" />
        </button>
      </Tooltip>
      <span className="text-[11px] font-medium text-studio-text-primary min-w-[36px] text-center select-none">{zoom}%</span>
      <Tooltip content="Zoom in" position="top">
        <button onClick={handleZoomIn} className="studio-icon-btn w-7 h-7 rounded-full">
          <ZoomIn size={15} className="text-studio-text-secondary" />
        </button>
      </Tooltip>
      <div className="w-px h-4 bg-studio-divider/30 mx-0.5" />
      <Tooltip content="Fit to view" position="top">
        <button onClick={handleFit} className="studio-icon-btn w-7 h-7 rounded-full">
          <Maximize2 size={14} className="text-studio-text-secondary" />
        </button>
      </Tooltip>
      <Tooltip content={locked ? "Unlock canvas" : "Lock canvas"} position="top">
        <button onClick={() => setLocked(!locked)} className="studio-icon-btn w-7 h-7 rounded-full">
          {locked ? <Lock size={14} className="text-studio-text-secondary" /> : <Unlock size={14} className="text-studio-text-secondary" />}
        </button>
      </Tooltip>
    </div>
  );
};

const WorkflowCanvasInner: React.FC<WorkflowCanvasProps> = ({ onNodeSelect, onOpenChat }) => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    onNodeSelect(node.id);
  }, [onNodeSelect]);

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  return (
    <div className="flex-1 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(210, 14%, 88%)" />
      </ReactFlow>

      {/* AI Help button — top-left of canvas */}
      <button
        onClick={onOpenChat}
        className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3.5 py-2 rounded-full bg-white shadow-sm border border-studio-divider/20 text-[12px] font-medium text-studio-text-primary hover:shadow-md hover:border-primary/20 transition-all duration-200"
      >
        <Sparkles size={14} className="text-primary" />
        Take AI Help
      </button>

      {/* MiniMap — bottom-left */}
      <div className="absolute bottom-4 left-3 z-10">
        <MiniMap
          style={{ position: "relative", margin: 0, borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid hsl(210, 14%, 93%)" }}
          maskColor="rgba(0,0,0,0.04)"
          nodeColor="hsl(211, 64%, 32%)"
        />
      </div>

      {/* Custom controls — centered bottom */}
      <CanvasControls />
    </div>
  );
};

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = (props) => (
  <ReactFlowProvider>
    <WorkflowCanvasInner {...props} />
  </ReactFlowProvider>
);

export default WorkflowCanvas;
