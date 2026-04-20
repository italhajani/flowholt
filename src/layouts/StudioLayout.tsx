import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { StudioTabBar } from "@/components/studio/StudioTabBar";
import { StudioLeftRail, type LeftRailContext } from "@/components/studio/StudioLeftRail";
import { StudioInsertPane } from "@/components/studio/StudioInsertPane";
import { StudioCanvas } from "@/components/studio/StudioCanvas";
import type { CanvasNodeData } from "@/components/studio/canvasTypes";
import { StudioInspector } from "@/components/studio/StudioInspector";
import { StudioRuntimeBar } from "@/components/studio/StudioRuntimeBar";
import { StudioRuntimeDrawer } from "@/components/studio/StudioRuntimeDrawer";
import { StudioCopilotPanel, StudioCopilotButton } from "@/components/studio/StudioCopilotPanel";
import { CanvasStoreProvider, useCanvasStore } from "@/components/studio/useCanvasStore";

function StudioLayoutInner() {
  const navigate = useNavigate();
  const { workflowId } = useParams();
  const canvasStore = useCanvasStore();

  const [activeTab, setActiveTab] = useState("Workflow");
  const [leftPaneOpen, setLeftPaneOpen] = useState(true);
  const [leftPaneContext, setLeftPaneContext] = useState<LeftRailContext>("nodes");
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [runtimeDrawerOpen, setRuntimeDrawerOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState("");

  const handleAskAI = useCallback((context: string) => {
    setCopilotPrompt(context);
    setCopilotOpen(true);
    setInspectorOpen(false);
    setSelectedNodeId(null);
  }, []);

  const selectedNode: CanvasNodeData | null =
    canvasStore.nodes.find((n) => n.id === selectedNodeId) ?? null;

  function handleTogglePane(ctx: LeftRailContext) {
    if (leftPaneOpen && leftPaneContext === ctx) {
      setLeftPaneOpen(false);
    } else {
      setLeftPaneContext(ctx);
      setLeftPaneOpen(true);
    }
  }

  const handleNodeSelect = useCallback((id: string) => {
    setSelectedNodeId(id);
    setInspectorOpen(true);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedNodeId(null);
    setInspectorOpen(false);
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white">
      {/* Header — 48px */}
      <StudioHeader onBack={() => navigate("/workflows")} workflowId={workflowId} />

      {/* Tab bar — 36px */}
      <StudioTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Middle section — fills remaining space */}
      <div className="flex flex-1 min-h-0">
        {/* Left rail — 56px */}
        <StudioLeftRail
          activeContext={leftPaneContext}
          onContextChange={setLeftPaneContext}
          paneOpen={leftPaneOpen}
          onTogglePane={handleTogglePane}
        />

        {/* Insert pane — 280px, collapsible */}
        {leftPaneOpen && (
          <StudioInsertPane
            context={leftPaneContext}
            onClose={() => setLeftPaneOpen(false)}
          />
        )}

        {/* Canvas — flex-1 */}
        <StudioCanvas
          selectedNodeId={selectedNodeId}
          onNodeSelect={handleNodeSelect}
          onCanvasClick={handleCanvasClick}
          workflowId={workflowId}
        />

        {/* Inspector — 380px, collapsible */}
        {inspectorOpen && selectedNode && (
          <StudioInspector
            node={selectedNode}
            onClose={() => { setInspectorOpen(false); setSelectedNodeId(null); }}
            workflowId={workflowId}
          />
        )}

        {/* AI Copilot panel — 380px, collapsible */}
        {copilotOpen && !inspectorOpen && (
          <StudioCopilotPanel onClose={() => { setCopilotOpen(false); setCopilotPrompt(""); }} initialPrompt={copilotPrompt} />
        )}
      </div>

      {/* Floating AI assistant button — visible when copilot & inspector are closed */}
      <StudioCopilotButton
        onClick={() => { setCopilotOpen(true); setInspectorOpen(false); setSelectedNodeId(null); }}
        visible={!copilotOpen && !inspectorOpen}
      />

      {/* Runtime drawer — 240px, shown above bar when open */}
      {runtimeDrawerOpen && <StudioRuntimeDrawer onAskAI={handleAskAI} />}

      {/* Runtime bar — 44px */}
      <StudioRuntimeBar
        drawerOpen={runtimeDrawerOpen}
        onToggleDrawer={() => setRuntimeDrawerOpen((o) => !o)}
        workflowId={workflowId}
      />
    </div>
  );
}

export function StudioLayout() {
  return (
    <CanvasStoreProvider>
      <StudioLayoutInner />
    </CanvasStoreProvider>
  );
}
