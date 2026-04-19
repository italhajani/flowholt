import { useState } from "react";
import {
  Server, CheckCircle2, AlertCircle, Loader2,
  ChevronRight, ArrowRight, Globe, Shield, Wrench,
  Database, RefreshCw, Activity, Zap, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

/* ── Types ── */
interface MCPTool {
  name: string;
  description: string;
  enabled: boolean;
}

interface MCPResource {
  uri: string;
  type: string;
  description: string;
}

type Step = "connect" | "discover" | "configure" | "done";

interface MCPServerWizardProps {
  open: boolean;
  onClose: () => void;
}

/* ── Simulated discovery results ── */
const mockDiscoveredTools: MCPTool[] = [
  { name: "search_documents", description: "Full-text search across indexed docs", enabled: true },
  { name: "read_file", description: "Read contents of a file by path", enabled: true },
  { name: "write_file", description: "Write or update a file", enabled: true },
  { name: "list_directory", description: "List files in a directory", enabled: true },
  { name: "run_query", description: "Execute a database query", enabled: true },
  { name: "create_embedding", description: "Generate vector embeddings for text", enabled: true },
  { name: "web_scrape", description: "Scrape content from a web URL", enabled: false },
  { name: "send_notification", description: "Send notification via webhook", enabled: false },
];

const mockResources: MCPResource[] = [
  { uri: "mcp://documents/*", type: "Document", description: "All indexed documents" },
  { uri: "mcp://database/tables/*", type: "Database", description: "Database tables and schemas" },
  { uri: "mcp://embeddings/*", type: "Embedding", description: "Vector embedding store" },
];

const stepLabels: Record<Step, string> = {
  connect: "Connect",
  discover: "Discover",
  configure: "Configure",
  done: "Complete",
};

const transportOptions = [
  { id: "stdio", label: "stdio", desc: "Local process via stdin/stdout" },
  { id: "sse", label: "SSE", desc: "Server-Sent Events over HTTP" },
  { id: "streamable-http", label: "Streamable HTTP", desc: "Streaming HTTP transport" },
];

export function MCPServerWizard({ open, onClose }: MCPServerWizardProps) {
  const [step, setStep] = useState<Step>("connect");
  const [serverUrl, setServerUrl] = useState("");
  const [serverName, setServerName] = useState("");
  const [transport, setTransport] = useState("stdio");
  const [apiKey, setApiKey] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [resources, setResources] = useState<MCPResource[]>([]);
  const [showResources, setShowResources] = useState(false);

  const handleConnect = () => {
    if (!serverUrl.trim()) {
      setConnectionError("Server URL is required");
      return;
    }
    setConnectionError("");
    setConnecting(true);

    // Simulate connection + discovery
    setTimeout(() => {
      setConnecting(false);
      setTools(mockDiscoveredTools);
      setResources(mockResources);
      setStep("discover");
    }, 1800);
  };

  const toggleTool = (name: string) => {
    setTools(prev => prev.map(t => t.name === name ? { ...t, enabled: !t.enabled } : t));
  };

  const enabledCount = tools.filter(t => t.enabled).length;

  const handleFinish = () => {
    setStep("done");
  };

  const handleDone = () => {
    // Reset and close
    setStep("connect");
    setServerUrl("");
    setServerName("");
    setTransport("stdio");
    setApiKey("");
    setTools([]);
    setResources([]);
    onClose();
  };

  /* ── Step indicators ── */
  const steps: Step[] = ["connect", "discover", "configure", "done"];
  const stepIdx = steps.indexOf(step);

  const footerContent = (
    <>
      {step === "connect" && (
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleConnect} disabled={connecting || !serverUrl.trim()}>
            {connecting ? <><Loader2 size={12} className="animate-spin" /> Connecting…</> : <><Zap size={12} /> Connect</>}
          </Button>
        </>
      )}
      {step === "discover" && (
        <>
          <Button variant="secondary" size="sm" onClick={() => setStep("connect")}>Back</Button>
          <Button variant="primary" size="sm" onClick={() => setStep("configure")}>
            Continue <ArrowRight size={12} />
          </Button>
        </>
      )}
      {step === "configure" && (
        <>
          <Button variant="secondary" size="sm" onClick={() => setStep("discover")}>Back</Button>
          <Button variant="primary" size="sm" onClick={handleFinish}>
            <CheckCircle2 size={12} /> Add Server
          </Button>
        </>
      )}
      {step === "done" && (
        <Button variant="primary" size="sm" onClick={handleDone}>Done</Button>
      )}
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add MCP Server"
      description="Connect a Model Context Protocol server"
      width="w-[560px]"
      footer={footerContent}
    >
      <div className="space-y-4">
        {/* Step progress */}
        <div className="flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "flex h-5 items-center gap-1 rounded-full px-2.5 text-[10px] font-medium transition-colors",
                i < stepIdx ? "bg-green-50 text-green-600"
                  : i === stepIdx ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-400"
              )}>
                {i < stepIdx ? <CheckCircle2 size={10} /> : <span className="tabular-nums">{i + 1}</span>}
                <span>{stepLabels[s]}</span>
              </div>
              {i < steps.length - 1 && <ChevronRight size={10} className="mx-1 text-zinc-300" />}
            </div>
          ))}
        </div>

        {/* ── Step 1: Connect ── */}
        {step === "connect" && (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-zinc-500 mb-1 block">Server Name</label>
              <input
                type="text"
                value={serverName}
                onChange={e => setServerName(e.target.value)}
                placeholder="e.g., Code Intelligence Server"
                className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-500 mb-1 block">Transport</label>
              <div className="grid grid-cols-3 gap-2">
                {transportOptions.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTransport(t.id)}
                    className={cn(
                      "rounded-lg border p-2 text-left transition-all",
                      transport === t.id ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:border-zinc-300"
                    )}
                  >
                    <p className="text-[11px] font-medium text-zinc-700">{t.label}</p>
                    <p className="text-[9px] text-zinc-400">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-500 mb-1 block">
                {transport === "stdio" ? "Command" : "Server URL"}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-300" />
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={e => { setServerUrl(e.target.value); setConnectionError(""); }}
                    placeholder={transport === "stdio" ? "npx -y @mcp/server-filesystem" : "http://localhost:3001/mcp"}
                    className="h-8 w-full rounded-md border border-zinc-200 bg-white pl-8 pr-3 text-[12px] font-mono text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>
              </div>
              {connectionError && (
                <p className="mt-1.5 text-[10px] text-red-500 flex items-center gap-1">
                  <AlertCircle size={10} /> {connectionError}
                </p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-500 mb-1 block">API Key (optional)</label>
              <div className="relative">
                <Shield size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-300" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="h-8 w-full rounded-md border border-zinc-200 bg-white pl-8 pr-3 text-[12px] font-mono text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>
            </div>

            {connecting && (
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="text-blue-500 animate-spin" />
                  <div>
                    <p className="text-[11px] font-medium text-blue-700">Connecting to server…</p>
                    <p className="text-[10px] text-blue-500">Performing handshake and discovering capabilities</p>
                  </div>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-blue-100 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500 transition-all duration-1000" style={{ width: "60%", animation: "pulse 1.5s ease-in-out infinite" }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Discover ── */}
        {step === "discover" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-green-100 bg-green-50/50 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-600" />
                <div>
                  <p className="text-[11px] font-medium text-green-700">
                    Connected — discovered {tools.length} tools, {resources.length} resources
                  </p>
                  <p className="text-[10px] text-green-500 font-mono">{serverUrl}</p>
                </div>
              </div>
            </div>

            {/* Tools */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-zinc-500 flex items-center gap-1">
                  <Wrench size={10} /> Tools ({tools.length})
                </span>
                <button
                  onClick={() => setTools(prev => prev.map(t => ({ ...t, enabled: !prev.every(x => x.enabled) })))}
                  className="text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {tools.every(t => t.enabled) ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {tools.map(tool => (
                  <button
                    key={tool.name}
                    onClick={() => toggleTool(tool.name)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-all",
                      tool.enabled ? "border-zinc-200 bg-white" : "border-zinc-100 bg-zinc-50 opacity-50"
                    )}
                  >
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                      tool.enabled ? "border-zinc-900 bg-zinc-900" : "border-zinc-300 bg-white"
                    )}>
                      {tool.enabled && <CheckCircle2 size={10} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-zinc-700 font-mono">{tool.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{tool.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <button
                onClick={() => setShowResources(o => !o)}
                className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {showResources ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                <Database size={10} /> Resources ({resources.length})
              </button>
              {showResources && (
                <div className="mt-2 space-y-1">
                  {resources.map(r => (
                    <div key={r.uri} className="rounded-lg border border-zinc-200 bg-white p-2.5">
                      <p className="text-[11px] font-mono text-zinc-600">{r.uri}</p>
                      <p className="text-[10px] text-zinc-400">{r.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3: Configure ── */}
        {step === "configure" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 space-y-2">
              <h4 className="text-[11px] font-medium text-zinc-700">Server Summary</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
                <div className="text-zinc-400">Name</div>
                <div className="text-zinc-700 font-medium">{serverName || "Untitled Server"}</div>
                <div className="text-zinc-400">URL</div>
                <div className="text-zinc-700 font-mono text-[10px]">{serverUrl}</div>
                <div className="text-zinc-400">Transport</div>
                <div className="text-zinc-700">{transport.toUpperCase()}</div>
                <div className="text-zinc-400">Tools enabled</div>
                <div className="text-zinc-700">{enabledCount} / {tools.length}</div>
                <div className="text-zinc-400">Resources</div>
                <div className="text-zinc-700">{resources.length}</div>
              </div>
            </div>

            {/* Agent assignment */}
            <div>
              <label className="text-[11px] font-medium text-zinc-500 mb-1 block">Assign to Agents</label>
              <select className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
                <option value="all">All Agents</option>
                <option value="agent-001">Customer Support Bot</option>
                <option value="agent-002">Sales Assistant</option>
                <option value="agent-003">Code Review Agent</option>
              </select>
            </div>

            {/* Health check */}
            <div>
              <label className="text-[11px] font-medium text-zinc-500 mb-1 block">Health Check Interval</label>
              <select className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
                <option value="30">Every 30 seconds</option>
                <option value="60">Every minute</option>
                <option value="300">Every 5 minutes</option>
                <option value="0">Disabled</option>
              </select>
            </div>

            {/* Auto-retry */}
            <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3">
              <div>
                <p className="text-[11px] font-medium text-zinc-700">Auto-reconnect on failure</p>
                <p className="text-[10px] text-zinc-400">Automatically retry connection with exponential backoff</p>
              </div>
              <div className="h-5 w-9 rounded-full bg-zinc-900 p-0.5 cursor-pointer">
                <div className="h-4 w-4 rounded-full bg-white transform translate-x-4 transition-transform" />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Done ── */}
        {step === "done" && (
          <div className="text-center py-6 space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 mx-auto">
              <CheckCircle2 size={28} className="text-green-600" />
            </div>
            <div>
              <h4 className="text-[14px] font-semibold text-zinc-900">{serverName || "MCP Server"} Added</h4>
              <p className="text-[12px] text-zinc-500 mt-1">
                {enabledCount} tools enabled • {resources.length} resources available
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1"><Activity size={10} className="text-green-500" /> Health: OK</span>
              <span className="flex items-center gap-1"><RefreshCw size={10} /> Auto-reconnect: On</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
