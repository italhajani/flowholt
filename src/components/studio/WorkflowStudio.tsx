import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import TopBar from "./TopBar";
import IconSidebar from "./IconSidebar";
import NodesPanel from "./NodesPanel";
import ToolsSidebar from "./ToolsSidebar";
import WorkflowCanvas from "./WorkflowCanvas";
import NodeDetailsPanel from "./NodeDetailsPanel";
import ChatPanel from "./ChatPanel";
import Tooltip from "./Tooltip";

const WorkflowStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"editor" | "executions">("editor");
  const [nodesOpen, setNodesOpen] = useState(true);
  const [activeTool, setActiveTool] = useState("select");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-studio-bg">
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex min-h-0">
        {/* Icon sidebar - always visible, leftmost */}
        <IconSidebar nodesOpen={nodesOpen} onToggleNodes={() => setNodesOpen(!nodesOpen)} />

        {/* Main content area - relative for chat overlay */}
        <div className="flex-1 flex min-h-0 relative">
          {/* Chat panel overlays nodes panel area */}
          <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />

          {/* Nodes panel */}
          <NodesPanel open={nodesOpen && !chatOpen} onClose={() => setNodesOpen(false)} />

          {/* Thin divider instead of heavy border */}
          {(nodesOpen || chatOpen) && <div className="w-px bg-studio-divider/40 shrink-0" />}

          {/* Tools sidebar */}
          <ToolsSidebar activeTool={activeTool} onToolChange={setActiveTool} />

          <div className="w-px bg-studio-divider/40 shrink-0" />

          {/* Canvas */}
          <WorkflowCanvas onNodeSelect={setSelectedNode} />

          {/* Node details */}
          <NodeDetailsPanel nodeId={selectedNode} onClose={() => setSelectedNode(null)} />
        </div>

        {/* Floating AI button */}
        {!chatOpen && (
          <Tooltip content="AI Assistant" position="top">
            <button
              onClick={() => setChatOpen(true)}
              className="fixed bottom-4 left-14 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Sparkles size={16} />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default WorkflowStudio;
