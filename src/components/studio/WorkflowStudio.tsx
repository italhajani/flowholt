import React, { useState } from "react";
import TopBar from "./TopBar";
import NodesPanel from "./NodesPanel";
import WorkflowCanvas from "./WorkflowCanvas";
import NodeDetailsPanel from "./NodeDetailsPanelV2";
import ChatPanel from "./ChatPanel";

const WorkflowStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"editor" | "executions">("editor");
  const [nodesOpen, setNodesOpen] = useState(true);
  const [activeTool, setActiveTool] = useState("nodes");
  const [selectedNode, setSelectedNode] = useState<string | null>("ai-1");
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#dbe5ff]">
      <div className="h-full w-full bg-white overflow-hidden">
        <div className="h-full flex flex-col">
          <TopBar activeTab={activeTab} onTabChange={setActiveTab} onOpenChat={() => setChatOpen(true)} />

          <div className="flex-1 flex min-h-0 bg-[#f8faff]">
            <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />

            <NodesPanel
              open={nodesOpen && !chatOpen}
              onToggle={() => setNodesOpen((open) => !open)}
              activeTool={activeTool}
              onToolChange={setActiveTool}
            />

            <div className="flex-1 min-h-0 relative border-r border-slate-200">
              <WorkflowCanvas onNodeSelect={setSelectedNode} />
            </div>

            <NodeDetailsPanel nodeId={selectedNode} onClose={() => setSelectedNode(null)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowStudio;
