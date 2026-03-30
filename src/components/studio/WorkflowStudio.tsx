import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import TopBar from "./TopBar";
import IconSidebar from "./IconSidebar";
import NodesPanel from "./NodesPanel";
import ToolsSidebar from "./ToolsSidebar";
import WorkflowCanvas from "./WorkflowCanvas";
import NodeDetailsPanel from "./NodeDetailsPanel";
import ChatPanel from "./ChatPanel";
import StatusBar from "./StatusBar";
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
        <IconSidebar nodesOpen={nodesOpen} onToggleNodes={() => setNodesOpen(!nodesOpen)} />

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex min-h-0 relative">
            <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
            <NodesPanel open={nodesOpen && !chatOpen} onClose={() => setNodesOpen(false)} />

            {(nodesOpen || chatOpen) && <div className="w-px bg-studio-divider/30 shrink-0" />}

            <ToolsSidebar activeTool={activeTool} onToolChange={setActiveTool} />
            <div className="w-px bg-studio-divider/30 shrink-0" />

            <WorkflowCanvas onNodeSelect={setSelectedNode} onOpenChat={() => setChatOpen(true)} />

            <NodeDetailsPanel nodeId={selectedNode} onClose={() => setSelectedNode(null)} />
          </div>

          <StatusBar nodeCount={5} zoom={1} />
        </div>
      </div>

      {/* AI button is now inside WorkflowCanvas */}
    </div>
  );
};

export default WorkflowStudio;
