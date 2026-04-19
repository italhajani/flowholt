import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { StudioTabBar } from "@/components/studio/StudioTabBar";
import { StudioLeftRail, type LeftRailContext } from "@/components/studio/StudioLeftRail";
import { StudioInsertPane } from "@/components/studio/StudioInsertPane";
import { StudioCanvas, canvasNodes, type CanvasNodeData } from "@/components/studio/StudioCanvas";
import { StudioInspector } from "@/components/studio/StudioInspector";
import { StudioRuntimeBar } from "@/components/studio/StudioRuntimeBar";
import { StudioRuntimeDrawer } from "@/components/studio/StudioRuntimeDrawer";
import { StudioCopilotPanel, StudioCopilotButton } from "@/components/studio/StudioCopilotPanel";

export function StudioLayout() {
  const navigate = useNavigate();
  const { workflowId } = useParams();

  const [activeTab, setActiveTab] = useState("Workflow");
  const [leftPaneOpen, setLeftPaneOpen] = useState(true);
  const [leftPaneContext, setLeftPaneContext] = useState<LeftRailContext>("nodes");
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [runtimeDrawerOpen, setRuntimeDrawerOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [copilotOpen, setCopilotOpen] = useState(false);

  const selectedNode: CanvasNodeData | null =
    canvasNodes.find((n) => n.id === selectedNodeId) ?? null;

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
      <StudioHeader onBack={() => navigate("/workflows")} />

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
        />

        {/* Inspector — 380px, collapsible */}
        {inspectorOpen && selectedNode && (
          <StudioInspector
            node={selectedNode}
            onClose={() => { setInspectorOpen(false); setSelectedNodeId(null); }}
          />
        )}

        {/* AI Copilot panel — 380px, collapsible */}
        {copilotOpen && !inspectorOpen && (
          <StudioCopilotPanel onClose={() => setCopilotOpen(false)} />
        )}
      </div>

      {/* Floating AI assistant button — visible when copilot & inspector are closed */}
      <StudioCopilotButton
        onClick={() => { setCopilotOpen(true); setInspectorOpen(false); setSelectedNodeId(null); }}
        visible={!copilotOpen && !inspectorOpen}
      />

      {/* Runtime drawer — 240px, shown above bar when open */}
      {runtimeDrawerOpen && <StudioRuntimeDrawer />}

      {/* Runtime bar — 44px */}
      <StudioRuntimeBar
        drawerOpen={runtimeDrawerOpen}
        onToggleDrawer={() => setRuntimeDrawerOpen((o) => !o)}
      />
    </div>
  );
}
