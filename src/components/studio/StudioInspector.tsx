import { useState, useCallback, useMemo } from "react";
import {
  X, ChevronRight, ChevronDown, ChevronLeft, Copy, Pin, PinOff, RefreshCw,
  AlertTriangle, Play, Braces, Code2, Eye, EyeOff, Hash, MoreHorizontal,
  Search, Download, Upload, Trash2, Check, Clock, Zap, Maximize2,
  CheckCircle2, XCircle, Plus, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type CanvasNodeData, familyColors } from "./canvasTypes";
import { useCanvasStore } from "./useCanvasStore";
import { ExpressionEditorModal } from "@/components/modals/ExpressionEditorModal";
import { CodeEditor } from "@/components/ui/code-editor";
import { CodeEditorPanel as CodeEditorPanelInline } from "./CodeEditorPanel";
import { useStepEditor, useUpdateWorkflowStep } from "@/hooks/useApi";
import { testWorkflowStep } from "@/lib/api";

type DataView = "schema" | "table" | "json" | "html" | "binary";
type ParamFieldType = "select" | "text" | "number" | "textarea" | "code" | "expression";

const inspectorTabs = [
  { key: "Parameters", badge: null },
  { key: "Input",      badge: "3" },
  { key: "Output",     badge: "3" },
  { key: "Diff",       badge: null },
  { key: "Pin Data",   badge: null },
  { key: "Settings",   badge: null },
];

/* ── Per-node mock parameter configs ── */
interface NodeField {
  label: string;
  value: string;
  type?: ParamFieldType;
  expressionEnabled?: boolean;
  description?: string;
  options?: string[];
}

const nodeConfigs: Record<string, { model?: string; prompt?: string; credential?: string; fields?: NodeField[] }> = {
  n1: { credential: "Webhook Endpoint", fields: [
    { label: "Method", value: "POST", type: "select", options: ["GET", "POST", "PUT", "DELETE", "PATCH"] },
    { label: "Path", value: "/leads/inbound", type: "text", description: "The URL path for this webhook" },
    { label: "Authentication", value: "Header Auth", type: "select", options: ["None", "Header Auth", "Basic Auth", "JWT"] },
    { label: "Response Code", value: "200", type: "number" },
    { label: "Response Body", value: '{"status": "ok"}', type: "code", description: "JSON response to send back" },
  ]},
  n2: { credential: "Clearbit API Key", fields: [
    { label: "Operation", value: "Enrich Person", type: "select", options: ["Enrich Person", "Enrich Company", "Find Email", "Reveal"] },
    { label: "Email Field", value: "={{$json.email}}", type: "expression", expressionEnabled: true, description: "Reference to email from previous node" },
    { label: "Timeout", value: "5000", type: "number", description: "Request timeout in milliseconds" },
    { label: "Include Company", value: "true", type: "select", options: ["true", "false"] },
  ]},
  n3: { model: "gpt-4o", prompt: "Score this lead from 0-100 based on company size, role seniority, and engagement signals. Return JSON with score and reasoning.", credential: "OpenAI Production Key", fields: [
    { label: "Temperature", value: "0.3", type: "number", description: "Lower = more deterministic" },
    { label: "Max Tokens", value: "500", type: "number" },
    { label: "JSON Mode", value: "true", type: "select", options: ["true", "false"] },
    { label: "System Context", value: "={{$json.company}} - {{$json.title}}", type: "expression", expressionEnabled: true },
  ]},
  n4: { fields: [
    { label: "Condition", value: "={{$json.score}} >= 70", type: "expression", expressionEnabled: true, description: "Expression that evaluates to true/false" },
    { label: "True Output", value: "High Quality", type: "text" },
    { label: "False Output", value: "Low Quality", type: "text" },
  ]},
  n5: { credential: "Salesforce Production", fields: [
    { label: "Operation", value: "Update Record", type: "select", options: ["Create Record", "Update Record", "Upsert Record", "Get Record", "Delete Record"] },
    { label: "Object", value: "Lead", type: "select", options: ["Lead", "Contact", "Account", "Opportunity", "Task"] },
    { label: "Match Field", value: "Email", type: "select", options: ["Email", "Id", "ExternalId"] },
    { label: "Score Field", value: "={{$json.score}}", type: "expression", expressionEnabled: true },
  ]},
};

/* ── Mock I/O data with pagination support ── */
interface DataRow { key: string; type: string; value: string }
interface MockDataSet {
  schema: DataRow[];
  json: string;
  totalItems: number;
  html?: string;
  binary?: { fileName: string; mimeType: string; size: string; preview?: string };
}

const mockInputData: Record<string, MockDataSet> = {
  n2: {
    schema: [
      { key: "email", type: "string", value: "alex@acme.com" },
      { key: "company", type: "string", value: "Acme Inc" },
      { key: "source", type: "string", value: "contact-form" },
      { key: "ts", type: "number", value: "1714032000" },
      { key: "metadata", type: "object", value: "{ip: '203.0.113.42'}" },
    ],
    json: `[\n  {\n    "email": "alex@acme.com",\n    "company": "Acme Inc",\n    "source": "contact-form",\n    "ts": 1714032000,\n    "metadata": { "ip": "203.0.113.42" }\n  },\n  {\n    "email": "jane@startup.io",\n    "company": "Startup IO",\n    "source": "demo-request",\n    "ts": 1714032060\n  },\n  {\n    "email": "bob@bigcorp.com",\n    "company": "BigCorp",\n    "source": "webinar",\n    "ts": 1714032120\n  }\n]`,
    totalItems: 45,
  },
  n3: {
    schema: [
      { key: "email", type: "string", value: "alex@acme.com" },
      { key: "name", type: "string", value: "Alex Chen" },
      { key: "title", type: "string", value: "VP Engineering" },
      { key: "employees", type: "number", value: "1200" },
      { key: "techStack", type: "array", value: "['React', 'Python', 'AWS']" },
      { key: "funding", type: "string", value: "$25M Series B" },
      { key: "industry", type: "string", value: "SaaS" },
    ],
    json: `{\n  "email": "alex@acme.com",\n  "name": "Alex Chen",\n  "title": "VP Engineering",\n  "employees": 1200,\n  "techStack": ["React", "Python", "AWS"],\n  "funding": "$25M Series B",\n  "industry": "SaaS"\n}`,
    totalItems: 45,
  },
};

const mockOutputData: Record<string, MockDataSet> = {
  n1: {
    schema: [
      { key: "email", type: "string", value: "alex@acme.com" },
      { key: "company", type: "string", value: "Acme Inc" },
      { key: "source", type: "string", value: "contact-form" },
      { key: "headers", type: "object", value: "{content-type: 'application/json'}" },
    ],
    json: `{\n  "email": "alex@acme.com",\n  "company": "Acme Inc",\n  "source": "contact-form",\n  "headers": { "content-type": "application/json" }\n}`,
    totalItems: 45,
  },
  n2: {
    schema: [
      { key: "email", type: "string", value: "alex@acme.com" },
      { key: "name", type: "string", value: "Alex Chen" },
      { key: "title", type: "string", value: "VP Engineering" },
      { key: "employees", type: "number", value: "1200" },
      { key: "techStack", type: "array", value: "['React', 'Python', 'AWS']" },
      { key: "domain", type: "string", value: "acme.com" },
    ],
    json: `{\n  "email": "alex@acme.com",\n  "name": "Alex Chen",\n  "title": "VP Engineering",\n  "employees": 1200,\n  "techStack": ["React", "Python", "AWS"],\n  "domain": "acme.com"\n}`,
    totalItems: 45,
    html: `<div class="enrichment-result"><h3>Alex Chen</h3><p>VP Engineering at Acme Inc (1,200 employees)</p><ul><li>React</li><li>Python</li><li>AWS</li></ul></div>`,
    binary: { fileName: "enrichment_report.pdf", mimeType: "application/pdf", size: "24.3 KB" },
  },
  n3: {
    schema: [
      { key: "score", type: "number", value: "87" },
      { key: "reasons", type: "array", value: "['Senior title', 'Large company', 'Tech role']" },
      { key: "category", type: "string", value: "High Quality" },
      { key: "confidence", type: "number", value: "0.92" },
      { key: "model", type: "string", value: "gpt-4o" },
      { key: "latency_ms", type: "number", value: "340" },
    ],
    json: `{\n  "score": 87,\n  "reasons": ["Senior title", "Large company", "Tech role"],\n  "category": "High Quality",\n  "confidence": 0.92,\n  "model": "gpt-4o",\n  "latency_ms": 340\n}`,
    totalItems: 45,
  },
};

const typeColors: Record<string, string> = {
  string: "text-emerald-600 bg-emerald-50",
  number: "text-blue-600 bg-blue-50",
  array: "text-violet-600 bg-violet-50",
  object: "text-amber-600 bg-amber-50",
  boolean: "text-rose-600 bg-rose-50",
};

/* ── Execution status for run-this-node ── */
type RunStatus = "idle" | "running" | "success" | "error";

interface StudioInspectorProps {
  node: CanvasNodeData;
  onClose: () => void;
  workflowId?: string;
}

export function StudioInspector({ node, onClose, workflowId }: StudioInspectorProps) {
  const [activeTab, setActiveTab] = useState("Parameters");
  const [runStatus, setRunStatus] = useState<RunStatus>("idle");
  const store = useCanvasStore();
  const pinned = store.pinnedNodes.has(node.id);
  const colors = familyColors[node.family];
  const config = nodeConfigs[node.id] || { fields: [] };

  // Wire to real API when workflowId is available
  const { data: _stepEditor } = useStepEditor(workflowId, node.id);
  const updateStep = useUpdateWorkflowStep(workflowId ?? "");

  const handleRunNode = () => {
    if (workflowId) {
      setRunStatus("running");
      testWorkflowStep(workflowId, { step_id: node.id, payload: {} })
        .then(() => { setRunStatus("success"); setActiveTab("Output"); setTimeout(() => setRunStatus("idle"), 3000); })
        .catch(() => { setRunStatus("error"); setTimeout(() => setRunStatus("idle"), 3000); });
    } else {
      setRunStatus("running");
      setTimeout(() => {
        setRunStatus("success");
        setActiveTab("Output");
        setTimeout(() => setRunStatus("idle"), 3000);
      }, 1500);
    }
  };

  return (
    <div className="flex w-[540px] flex-col border-l border-zinc-100 bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-100 px-4 py-2.5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", colors.dot)} />
            <span className="text-[13px] font-semibold text-zinc-900 truncate">{node.name}</span>
            {pinned && <span className="flex-shrink-0 rounded bg-amber-50 border border-amber-200 px-1 py-0.5 text-[8px] font-semibold text-amber-600">PINNED</span>}
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {/* Run this node button */}
            <button
              onClick={handleRunNode}
              disabled={runStatus === "running"}
              className={cn(
                "flex h-6 items-center gap-1 rounded-md px-2 text-[10px] font-medium transition-all",
                runStatus === "running" ? "bg-zinc-100 text-zinc-400 cursor-wait"
                  : runStatus === "success" ? "bg-green-50 text-green-600"
                  : runStatus === "error" ? "bg-red-50 text-red-600"
                  : "bg-zinc-900 text-white hover:bg-zinc-700"
              )}
            >
              {runStatus === "running" ? <><RefreshCw size={10} className="animate-spin" /> Running…</>
                : runStatus === "success" ? <><Check size={10} /> Done</>
                : runStatus === "error" ? <><AlertTriangle size={10} /> Error</>
                : <><Play size={10} /> Run</>}
            </button>
            <button onClick={() => store.togglePin(node.id)} className={cn("rounded-md p-1.5 transition-colors", pinned ? "text-amber-500 bg-amber-50" : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600")} title={pinned ? "Unpin data" : "Pin data"}>
              {pinned ? <PinOff size={11} /> : <Pin size={11} />}
            </button>
            <button className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors">
              <MoreHorizontal size={12} />
            </button>
            <button onClick={onClose} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors">
              <X size={13} />
            </button>
          </div>
        </div>
        <p className="mt-0.5 text-[10px] text-zinc-400">
          {node.subtitle} · {node.family.charAt(0).toUpperCase() + node.family.slice(1)} · <span className="text-zinc-500">340ms avg</span>
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-end gap-3 border-b border-zinc-100 px-4 flex-shrink-0">
        {inspectorTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "relative flex items-center gap-1 pb-2 pt-2 text-[11px] font-medium transition-colors",
              activeTab === tab.key ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            {tab.key}
            {tab.badge && (
              <span className={cn("rounded-full px-1 py-0 text-[8px] font-semibold", activeTab === tab.key ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400")}>{tab.badge}</span>
            )}
            {activeTab === tab.key && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-zinc-900" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "Parameters" && <ParametersContent config={config} nodeFamily={node.family} nodeName={node.name} />}
        {activeTab === "Input" && <InputPanel nodeId={node.id} pinned={pinned} />}
        {activeTab === "Output" && <DataPanel nodeId={node.id} direction="output" pinned={pinned} />}
        {activeTab === "Diff" && <DiffPanel nodeId={node.id} />}
        {activeTab === "Pin Data" && <PinDataPanel nodeId={node.id} nodeName={node.name} pinned={pinned} onTogglePin={() => store.togglePin(node.id)} />}
        {activeTab === "Settings" && <SettingsContent />}
      </div>
    </div>
  );
}

/* ── INPUT panel — upstream node selector + data viewer ── */
const upstreamNodes: Record<string, { id: string; name: string; family: string }[]> = {
  n2: [{ id: "n1", name: "Typeform Trigger", family: "trigger" }],
  n3: [{ id: "n2", name: "Clearbit Enrich", family: "integration" }],
  n4: [{ id: "n3", name: "Score Lead (GPT-4o)", family: "ai" }],
  n5: [{ id: "n4", name: "IF Score > 70", family: "logic" }],
};

function InputPanel({ nodeId, pinned }: { nodeId: string; pinned: boolean }) {
  const upstream = upstreamNodes[nodeId] ?? [];
  const [selectedUpstream, setSelectedUpstream] = useState(upstream[0]?.id ?? "");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [inputView, setInputView] = useState<"schema" | "table" | "json">("schema");
  const [dragField, setDragField] = useState<string | null>(null);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState(0);

  // Mock multi-item data (n8n-style: each item is a {json: {...}} wrapper)
  const mockItems = useMemo(() => [
    { json: { id: 42, name: "John Doe", email: "john@example.com", status: "active", score: 87, metadata: { source: "typeform", timestamp: "2025-01-06T09:00:00Z" }, tags: ["vip", "trial"] } },
    { json: { id: 43, name: "Jane Smith", email: "jane@example.com", status: "pending", score: 62, metadata: { source: "hubspot", timestamp: "2025-01-06T10:15:00Z" }, tags: ["trial"] } },
    { json: { id: 44, name: "Bob Wilson", email: "bob@example.com", status: "active", score: 91, metadata: { source: "api", timestamp: "2025-01-06T11:30:00Z" }, tags: ["vip", "enterprise"] } },
  ], []);

  const totalItems = mockItems.length;
  const activeItem = mockItems[currentItem]?.json ?? {};

  // Build schema tree dynamically from active item
  const schemaTree = useMemo(() => {
    const rows: { key: string; type: string; sample: string; depth: number }[] = [];
    const walk = (obj: Record<string, unknown>, prefix: string, depth: number) => {
      for (const [k, v] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${k}` : k;
        const t = Array.isArray(v) ? "array" : typeof v === "object" && v !== null ? "object" : typeof v;
        const sample = typeof v === "string" ? v : JSON.stringify(v);
        rows.push({ key: fullKey, type: t, sample: sample.slice(0, 50), depth });
        if (typeof v === "object" && v !== null && !Array.isArray(v)) walk(v as Record<string, unknown>, fullKey, depth + 1);
        if (Array.isArray(v)) v.slice(0, 2).forEach((el, i) => rows.push({ key: `${fullKey}[${i}]`, type: typeof el, sample: String(el), depth: depth + 1 }));
      }
    };
    walk(activeItem as Record<string, unknown>, "", 0);
    return rows;
  }, [activeItem]);

  const upstreamName = upstream.find(u => u.id === selectedUpstream)?.name ?? "";

  const copyExpression = useCallback((fieldPath: string) => {
    const expr = `{{ $node["${upstreamName}"].json["${fieldPath}"] }}`;
    navigator.clipboard.writeText(expr);
    setCopiedField(fieldPath);
    setTimeout(() => setCopiedField(null), 1500);
  }, [upstreamName]);

  const getExpressionForField = useCallback((fieldPath: string) => {
    return `{{ $json.${fieldPath.replace(/\[(\d+)\]/g, "[$1]")} }}`;
  }, []);

  const typeColor: Record<string, string> = {
    string: "bg-emerald-100 text-emerald-700 border-emerald-200",
    number: "bg-blue-100 text-blue-700 border-blue-200",
    boolean: "bg-amber-100 text-amber-700 border-amber-200",
    array: "bg-purple-100 text-purple-700 border-purple-200",
    object: "bg-zinc-100 text-zinc-600 border-zinc-200",
  };

  if (upstream.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ChevronLeft size={24} className="text-zinc-200 mb-2" />
        <p className="text-[12px] text-zinc-400">This is the first node</p>
        <p className="text-[11px] text-zinc-300 mt-1">No upstream data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Upstream node selector */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Input from</p>
        <div className="flex gap-1 flex-wrap">
          {upstream.map((u) => (
            <button
              key={u.id}
              onClick={() => { setSelectedUpstream(u.id); setCurrentItem(0); }}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all",
                selectedUpstream === u.id
                  ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", familyColors[u.family as keyof typeof familyColors]?.dot ?? "bg-zinc-400")} />
              {u.name}
            </button>
          ))}
        </div>
      </div>

      {/* Item navigator + View toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentItem(i => Math.max(0, i - 1))}
            disabled={currentItem === 0}
            className={cn("rounded p-0.5 transition-colors", currentItem === 0 ? "text-zinc-200" : "text-zinc-500 hover:bg-zinc-100")}
          >
            <ChevronLeft size={12} />
          </button>
          <span className="text-[10px] font-medium text-zinc-600 tabular-nums min-w-[64px] text-center">
            Item {currentItem + 1} of {totalItems}
          </span>
          <button
            onClick={() => setCurrentItem(i => Math.min(totalItems - 1, i + 1))}
            disabled={currentItem >= totalItems - 1}
            className={cn("rounded p-0.5 transition-colors", currentItem >= totalItems - 1 ? "text-zinc-200" : "text-zinc-500 hover:bg-zinc-100")}
          >
            <ChevronRight size={12} />
          </button>
        </div>
        <div className="flex rounded-lg border border-zinc-200 p-0.5">
          {(["schema", "table", "json"] as const).map(v => (
            <button
              key={v}
              onClick={() => setInputView(v)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[10px] font-medium transition-all capitalize",
                inputView === v ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {v === "schema" ? "🌳 Schema" : v === "table" ? "📊 Table" : "{ } JSON"}
            </button>
          ))}
        </div>
      </div>

      {/* Drag hint / expression preview */}
      <div className="rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 px-2.5 py-1.5 flex items-center gap-1.5">
        <Zap size={10} className="text-blue-500 flex-shrink-0" />
        <span className="text-[9px] text-blue-600 font-mono truncate">
          {dragField
            ? `Dragging: ${getExpressionForField(dragField)}`
            : hoveredField
              ? getExpressionForField(hoveredField)
              : "Drag a field to insert expression, or click to copy"}
        </span>
      </div>

      {/* Schema tree view */}
      {inputView === "schema" && (
        <div className="space-y-0.5">
          {schemaTree.map((field) => (
            <div
              key={field.key}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all cursor-grab hover:bg-zinc-50 group",
                copiedField === field.key && "bg-emerald-50 ring-1 ring-emerald-200",
                hoveredField === field.key && !copiedField && "bg-blue-50/50 ring-1 ring-blue-100"
              )}
              style={{ paddingLeft: `${field.depth * 16 + 8}px` }}
              draggable
              onDragStart={(e) => { e.dataTransfer.setData("text/plain", getExpressionForField(field.key)); setDragField(field.key); }}
              onDragEnd={() => setDragField(null)}
              onMouseEnter={() => setHoveredField(field.key)}
              onMouseLeave={() => setHoveredField(null)}
              onClick={() => copyExpression(field.key)}
            >
              {field.depth > 0 && <span className="text-zinc-300 text-[9px]">└</span>}
              {/* Type badge */}
              <span className={cn("rounded px-1 py-0 text-[8px] font-bold border", typeColor[field.type] || typeColor.string)}>
                {field.type === "string" ? "Str" : field.type === "number" ? "Num" : field.type === "boolean" ? "Bool" : field.type === "array" ? "Arr" : "Obj"}
              </span>
              {/* Field pill */}
              <span className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium transition-all",
                dragField === field.key
                  ? "border-blue-400 bg-blue-100 text-blue-700 shadow-sm scale-105"
                  : "border-zinc-200 bg-white text-zinc-700 group-hover:border-zinc-400 group-hover:shadow-sm"
              )}>
                {field.key.includes(".") || field.key.includes("[") ? field.key.split(/[.\[]/g).pop()?.replace("]", "") : field.key}
              </span>
              {/* Sample value */}
              <span className="text-[9px] text-zinc-400 truncate flex-1 font-mono">{field.sample}</span>
              {/* Copy indicator */}
              {copiedField === field.key
                ? <Check size={10} className="text-emerald-500 flex-shrink-0" />
                : <Copy size={9} className="text-zinc-300 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
              }
            </div>
          ))}
        </div>
      )}

      {/* Table view */}
      {inputView === "table" && (
        <div className="rounded-lg border border-zinc-200 overflow-hidden">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="text-left px-2 py-1.5 font-medium text-zinc-500">Field</th>
                <th className="text-left px-2 py-1.5 font-medium text-zinc-500">Type</th>
                <th className="text-left px-2 py-1.5 font-medium text-zinc-500">Value</th>
              </tr>
            </thead>
            <tbody>
              {schemaTree.filter(f => f.depth === 0).map(field => (
                <tr
                  key={field.key}
                  className="border-b border-zinc-100 hover:bg-blue-50/30 cursor-pointer transition-colors"
                  onClick={() => copyExpression(field.key)}
                  onMouseEnter={() => setHoveredField(field.key)}
                  onMouseLeave={() => setHoveredField(null)}
                >
                  <td className="px-2 py-1.5 font-mono font-medium text-zinc-700">{field.key}</td>
                  <td className="px-2 py-1.5">
                    <span className={cn("rounded px-1 py-0 text-[8px] font-bold border", typeColor[field.type] || typeColor.string)}>
                      {field.type}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 font-mono text-zinc-500 truncate max-w-[120px]">{field.sample}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* JSON view */}
      {inputView === "json" && (
        <pre className="rounded-lg border border-zinc-200 bg-zinc-950 p-3 text-[10px] font-mono text-emerald-400 max-h-64 overflow-auto leading-relaxed">
          {JSON.stringify(activeItem, null, 2)}
        </pre>
      )}

      {/* Data viewer fallback */}
      <DataPanel nodeId={selectedUpstream} direction="output" pinned={pinned} onFieldClick={copyExpression} copiedField={copiedField} />
    </div>
  );
}

/* ── DATA panel with pagination, pin, views ── */
function DataPanel({ nodeId, direction, pinned, onFieldClick, copiedField }: { nodeId: string; direction: "input" | "output"; pinned: boolean; onFieldClick?: (field: string) => void; copiedField?: string | null }) {
  const [view, setView] = useState<DataView>("schema");
  const [page, setPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [currentItem, setCurrentItem] = useState(0);
  const pageSize = 10;

  const data = direction === "input" ? mockInputData[nodeId] : mockOutputData[nodeId];
  const hasData = !!data;
  const totalItems = data?.totalItems ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const filteredSchema = data?.schema.filter(r =>
    !searchFilter || r.key.toLowerCase().includes(searchFilter.toLowerCase()) || r.value.toLowerCase().includes(searchFilter.toLowerCase())
  ) ?? [];

  return (
    <div className="space-y-3">
      {/* Pinned data banner */}
      {pinned && hasData && (
        <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-100 px-2.5 py-1.5">
          <Pin size={10} className="text-amber-500" />
          <span className="text-[10px] text-amber-700 font-medium">Data is pinned — executions will use this snapshot</span>
        </div>
      )}

      {/* View switcher + search */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 rounded-lg bg-zinc-100 p-0.5 flex-1">
          {(["schema", "table", "json", ...(data?.html ? ["html"] : []), ...(data?.binary ? ["binary"] : [])] as DataView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "flex-1 rounded-md py-1 text-[10px] font-medium capitalize transition-colors",
                view === v ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <button onClick={() => setShowSearch(!showSearch)} className={cn("rounded-md p-1.5 transition-colors", showSearch ? "bg-zinc-100 text-zinc-700" : "text-zinc-400 hover:bg-zinc-50")}>
          <Search size={11} />
        </button>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1">
          <Search size={11} className="text-zinc-400" />
          <input
            autoFocus
            className="flex-1 text-[11px] outline-none bg-transparent text-zinc-700 placeholder:text-zinc-300"
            placeholder="Filter fields…"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
          {searchFilter && <button onClick={() => setSearchFilter("")} className="text-zinc-300 hover:text-zinc-500"><X size={10} /></button>}
        </div>
      )}

      {/* Actions row */}
      {hasData && (
        <div className="flex items-center gap-1.5">
          <button className="inline-flex h-6 items-center gap-1 rounded border border-zinc-200 px-2 text-[9px] font-medium text-zinc-500 hover:bg-zinc-50 transition-colors">
            <Copy size={9} /> Copy
          </button>
          <button className="inline-flex h-6 items-center gap-1 rounded border border-zinc-200 px-2 text-[9px] font-medium text-zinc-500 hover:bg-zinc-50 transition-colors">
            <Download size={9} /> Export
          </button>
          {pinned && (
            <button className="inline-flex h-6 items-center gap-1 rounded border border-zinc-200 px-2 text-[9px] font-medium text-zinc-500 hover:bg-zinc-50 transition-colors">
              <Upload size={9} /> Import
            </button>
          )}
          <span className="ml-auto text-[9px] text-zinc-400">
            {filteredSchema.length} fields
          </span>
        </div>
      )}

      {/* Per-item navigator */}
      {hasData && totalItems > 1 && (
        <div className="flex items-center justify-between rounded-md border border-zinc-100 bg-zinc-50/50 px-2.5 py-1.5">
          <button
            onClick={() => setCurrentItem(i => Math.max(0, i - 1))}
            disabled={currentItem === 0}
            className={cn("rounded p-0.5 transition-colors", currentItem === 0 ? "text-zinc-200" : "text-zinc-500 hover:bg-zinc-200")}
          >
            <ChevronLeft size={12} />
          </button>
          <span className="text-[10px] font-medium text-zinc-600 tabular-nums">
            Item {currentItem + 1} of {totalItems}
          </span>
          <button
            onClick={() => setCurrentItem(i => Math.min(totalItems - 1, i + 1))}
            disabled={currentItem >= totalItems - 1}
            className={cn("rounded p-0.5 transition-colors", currentItem >= totalItems - 1 ? "text-zinc-200" : "text-zinc-500 hover:bg-zinc-200")}
          >
            <ChevronRight size={12} />
          </button>
        </div>
      )}

      {/* Content */}
      {!hasData ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2">
          <RefreshCw size={20} className="text-zinc-300" />
          <p className="max-w-[180px] text-center text-[12px] text-zinc-400">
            Run the workflow to see {direction} data here.
          </p>
          <button className="mt-1 flex items-center gap-1 rounded-md bg-zinc-900 px-3 py-1.5 text-[10px] font-medium text-white hover:bg-zinc-700 transition-colors">
            <Play size={10} /> Run this node
          </button>
        </div>
      ) : view === "schema" ? (
        <SchemaView rows={filteredSchema} onFieldClick={onFieldClick} copiedField={copiedField} />
      ) : view === "table" ? (
        <TableView rows={filteredSchema} />
      ) : view === "html" && data.html ? (
        <HtmlView html={data.html} />
      ) : view === "binary" && data.binary ? (
        <BinaryView binary={data.binary} />
      ) : (
        <JsonView json={data.json} />
      )}

      {/* Pagination */}
      {hasData && totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={cn("flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-colors", page === 1 ? "text-zinc-300 cursor-not-allowed" : "text-zinc-500 hover:bg-zinc-50")}
          >
            <ChevronLeft size={10} /> Prev
          </button>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn("h-6 w-6 rounded text-[10px] font-medium transition-colors", page === p ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-50")}
              >
                {p}
              </button>
            ))}
            {totalPages > 4 && <span className="text-[10px] text-zinc-300">…</span>}
            {totalPages > 3 && (
              <button onClick={() => setPage(totalPages)} className={cn("h-6 w-6 rounded text-[10px] font-medium transition-colors", page === totalPages ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-50")}>
                {totalPages}
              </button>
            )}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={cn("flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-colors", page === totalPages ? "text-zinc-300 cursor-not-allowed" : "text-zinc-500 hover:bg-zinc-50")}
          >
            Next <ChevronRight size={10} />
          </button>
        </div>
      )}
    </div>
  );
}

const typeIcons: Record<string, string> = {
  string: "Aa",
  number: "#",
  array: "[]",
  object: "{}",
  boolean: "01",
};

function SchemaView({ rows, onFieldClick, copiedField }: { rows: DataRow[]; onFieldClick?: (field: string) => void; copiedField?: string | null }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  return (
    <div className="rounded-lg border border-zinc-100 divide-y divide-zinc-100 overflow-hidden">
      {rows.map((row, i) => (
        <div key={row.key}>
          <div
            className={cn("flex items-center gap-2 px-3 py-2 hover:bg-zinc-50 transition-colors cursor-pointer group", i % 2 === 1 && "bg-zinc-50/30")}
            onClick={() => setExpanded((p) => ({ ...p, [row.key]: !p[row.key] }))}
          >
            <ChevronRight size={10} className={cn("text-zinc-300 flex-shrink-0 transition-transform", expanded[row.key] && "rotate-90")} />
            {/* Type icon bubble */}
            <span className={cn("flex h-4 w-5 items-center justify-center rounded text-[7px] font-bold flex-shrink-0", typeColors[row.type] || "text-zinc-500 bg-zinc-100")}>
              {typeIcons[row.type] || "?"}
            </span>
            <span
              className={cn(
                "text-[11px] font-medium flex-1 truncate",
                onFieldClick ? "text-blue-600 hover:text-blue-800 hover:underline" : "text-zinc-700",
                copiedField === row.key && "text-green-600"
              )}
              onClick={(e) => { if (onFieldClick) { e.stopPropagation(); onFieldClick(row.key); } }}
              title={onFieldClick ? `Click to copy expression for "${row.key}"` : undefined}
            >
              {copiedField === row.key ? "✓ Copied!" : row.key}
            </span>
            <span className="text-[10px] text-zinc-400 max-w-[100px] truncate flex-shrink-0 font-mono">{row.value}</span>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); onFieldClick?.(row.key); }}>
              <Copy size={9} className="text-zinc-400 hover:text-zinc-600" />
            </button>
          </div>
          {expanded[row.key] && (
            <div className="bg-zinc-50/50 px-4 py-2 border-t border-zinc-50">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={cn("rounded px-1.5 py-0 text-[8px] font-semibold", typeColors[row.type])}>{row.type}</span>
                <span className="text-[8px] text-zinc-300">|</span>
                <span className="text-[9px] text-zinc-400">Sample:</span>
                <code className="text-[9px] text-zinc-600 font-mono">{row.value}</code>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] text-zinc-400 uppercase font-medium">Path:</span>
                <code className="text-[9px] text-violet-600 font-mono bg-violet-50 px-1 rounded">$json.{row.key}</code>
                <button className="text-zinc-300 hover:text-zinc-500 transition-colors"><Copy size={8} /></button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-zinc-400 uppercase font-medium">Expression:</span>
                <code className="text-[9px] text-zinc-600 font-mono bg-zinc-100 px-1 rounded">{"={{$json." + row.key + "}}"}</code>
                <button className="text-zinc-300 hover:text-zinc-500 transition-colors"><Copy size={8} /></button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TableView({ rows }: { rows: DataRow[] }) {
  const [sortKey, setSortKey] = useState<"key" | "type" | "value" | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = sortKey ? [...rows].sort((a, b) => {
    const va = a[sortKey], vb = b[sortKey];
    return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
  }) : rows;

  const handleSort = (col: "key" | "type" | "value") => {
    if (sortKey === col) setSortAsc(!sortAsc);
    else { setSortKey(col); setSortAsc(true); }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-100">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="bg-zinc-50 border-b border-zinc-200">
            <th className="px-3 py-2 text-left font-semibold text-zinc-500 w-8">#</th>
            <th className="px-3 py-2 text-left font-semibold text-zinc-500 cursor-pointer hover:text-zinc-700 select-none" onClick={() => handleSort("key")}>
              Field {sortKey === "key" && <span className="text-[8px]">{sortAsc ? "^" : "v"}</span>}
            </th>
            <th className="px-3 py-2 text-left font-semibold text-zinc-500 w-14 cursor-pointer hover:text-zinc-700 select-none" onClick={() => handleSort("type")}>
              Type {sortKey === "type" && <span className="text-[8px]">{sortAsc ? "^" : "v"}</span>}
            </th>
            <th className="px-3 py-2 text-left font-semibold text-zinc-500 cursor-pointer hover:text-zinc-700 select-none" onClick={() => handleSort("value")}>
              Value {sortKey === "value" && <span className="text-[8px]">{sortAsc ? "^" : "v"}</span>}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {sorted.map((row, i) => (
            <tr key={row.key} className={cn("hover:bg-blue-50/30 transition-colors group cursor-default", i % 2 === 1 && "bg-zinc-50/40")}>
              <td className="px-3 py-1.5 text-zinc-300 font-mono">{i}</td>
              <td className="px-3 py-1.5 font-medium text-zinc-700">{row.key}</td>
              <td className="px-3 py-1.5"><span className={cn("rounded px-1 py-0 text-[8px] font-semibold", typeColors[row.type])}>{row.type}</span></td>
              <td className="px-3 py-1.5 text-zinc-500 max-w-[120px] truncate font-mono text-[9px] group-hover:max-w-none">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function JsonView({ json }: { json: string }) {
  const [wrap, setWrap] = useState(false);

  // Simple syntax highlighting
  const highlighted = json
    .replace(/("(?:[^"\\]|\\.)*")\s*:/g, '<span class="text-violet-600">$1</span>:')
    .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="text-emerald-600">$1</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-blue-600">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span class="text-rose-600">$1</span>')
    .replace(/:\s*(null)/g, ': <span class="text-zinc-400">$1</span>');

  return (
    <div className="relative group">
      <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={() => setWrap(!wrap)} className="flex h-5 items-center rounded border border-zinc-200 bg-white px-1.5 text-[8px] text-zinc-500 hover:text-zinc-700" title="Toggle wrap">
          {wrap ? "Nowrap" : "Wrap"}
        </button>
        <button className="flex h-5 w-5 items-center justify-center rounded border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-600">
          <Copy size={9} />
        </button>
      </div>
      <pre
        className={cn("overflow-auto rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-[10px] font-mono leading-relaxed max-h-72", wrap && "whitespace-pre-wrap")}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  );
}

function HtmlView({ html }: { html: string }) {
  const [raw, setRaw] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button onClick={() => setRaw(false)} className={cn("text-[10px] font-medium px-2 py-0.5 rounded transition-colors", !raw ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-600")}>Preview</button>
        <button onClick={() => setRaw(true)} className={cn("text-[10px] font-medium px-2 py-0.5 rounded transition-colors", raw ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-600")}>Source</button>
      </div>
      {raw ? (
        <pre className="overflow-auto rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-[10px] text-zinc-700 font-mono leading-relaxed max-h-64 whitespace-pre-wrap">{html}</pre>
      ) : (
        <div className="rounded-lg border border-zinc-100 bg-white p-3 text-[11px] text-zinc-700 max-h-64 overflow-auto" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  );
}

function BinaryView({ binary }: { binary: { fileName: string; mimeType: string; size: string; preview?: string } }) {
  const isImage = binary.mimeType.startsWith("image/");
  const isPdf = binary.mimeType === "application/pdf";
  const ext = binary.fileName.split(".").pop()?.toUpperCase() || "FILE";

  return (
    <div className="rounded-lg border border-zinc-100 overflow-hidden">
      {/* File preview area */}
      <div className="flex h-40 items-center justify-center bg-zinc-50">
        {isImage && binary.preview ? (
          <img src={binary.preview} alt={binary.fileName} className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-sm">
              <span className="text-[11px] font-bold text-zinc-400">{ext}</span>
            </div>
            <span className="text-[10px] text-zinc-400">{isPdf ? "PDF document" : "Binary file"}</span>
          </div>
        )}
      </div>
      {/* File info */}
      <div className="border-t border-zinc-100 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-zinc-700 truncate">{binary.fileName}</span>
          <span className="text-[9px] text-zinc-400 flex-shrink-0 ml-2">{binary.size}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[8px] font-mono text-zinc-500">{binary.mimeType}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="inline-flex h-6 items-center gap-1 rounded border border-zinc-200 px-2 text-[9px] font-medium text-zinc-500 hover:bg-zinc-50 transition-colors">
            <Download size={9} /> Download
          </button>
          <button className="inline-flex h-6 items-center gap-1 rounded border border-zinc-200 px-2 text-[9px] font-medium text-zinc-500 hover:bg-zinc-50 transition-colors">
            <Copy size={9} /> Copy path
          </button>
          <button className="inline-flex h-6 items-center gap-1 rounded border border-zinc-200 px-2 text-[9px] font-medium text-zinc-500 hover:bg-zinc-50 transition-colors">
            <Maximize2 size={9} /> Full view
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Diff panel — compare input vs output ── */
function DiffPanel({ nodeId }: { nodeId: string }) {
  const input = mockInputData[nodeId];
  const output = mockOutputData[nodeId];
  const hasData = !!input && !!output;
  const [diffView, setDiffView] = useState<"inline" | "split" | "json">("inline");

  if (!hasData) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2">
        <RefreshCw size={20} className="text-zinc-300" />
        <p className="text-[12px] text-zinc-400 text-center max-w-[200px]">Run the workflow to compare input vs output data.</p>
      </div>
    );
  }

  const inputKeys = new Set(input.schema.map(r => r.key));
  const outputKeys = new Set(output.schema.map(r => r.key));
  const allKeys = Array.from(new Set([...inputKeys, ...outputKeys]));
  const inputMap = Object.fromEntries(input.schema.map(r => [r.key, r]));
  const outputMap = Object.fromEntries(output.schema.map(r => [r.key, r]));

  const inputJsonObj = Object.fromEntries(input.schema.map(r => [r.key, r.value]));
  const outputJsonObj = Object.fromEntries(output.schema.map(r => [r.key, r.value]));

  const added = allKeys.filter(k => !inputKeys.has(k)).length;
  const removed = allKeys.filter(k => !outputKeys.has(k)).length;
  const changed = allKeys.filter(k => inputMap[k] && outputMap[k] && inputMap[k].value !== outputMap[k].value).length;

  return (
    <div className="space-y-3">
      {/* View toggle + legend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-400" /> +{added}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" /> -{removed}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> ~{changed}</span>
        </div>
        <div className="flex rounded-lg border border-zinc-200 p-0.5">
          {(["inline", "split", "json"] as const).map(v => (
            <button
              key={v}
              onClick={() => setDiffView(v)}
              className={cn("rounded-md px-2 py-0.5 text-[9px] font-medium capitalize transition-all", diffView === v ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-600")}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Inline diff */}
      {diffView === "inline" && (
        <div className="rounded-lg border border-zinc-100 divide-y divide-zinc-100 overflow-hidden">
          {allKeys.map((key) => {
            const inRow = inputMap[key];
            const outRow = outputMap[key];
            const isAdded = !inRow && outRow;
            const isRemoved = inRow && !outRow;
            const isChanged = inRow && outRow && inRow.value !== outRow.value;

            return (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-[11px]",
                  isAdded && "bg-green-50/50",
                  isRemoved && "bg-red-50/50",
                  isChanged && "bg-amber-50/30",
                )}
              >
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full flex-shrink-0",
                  isAdded ? "bg-green-400" : isRemoved ? "bg-red-400" : isChanged ? "bg-amber-400" : "bg-zinc-200"
                )} />
                <span className={cn("font-medium flex-shrink-0 w-24 truncate", isRemoved ? "text-red-500 line-through" : "text-zinc-700")}>{key}</span>
                {inRow && (
                  <span className={cn("font-mono text-[9px] flex-1 truncate", isChanged || isRemoved ? "text-red-400 line-through" : "text-zinc-400")}>
                    {inRow.value}
                  </span>
                )}
                {isChanged && <span className="text-[9px] text-zinc-300">→</span>}
                {outRow && (isChanged || isAdded) && (
                  <span className="font-mono text-[9px] flex-1 truncate text-green-600">{outRow.value}</span>
                )}
                {!isChanged && !isAdded && !isRemoved && outRow && (
                  <span className="font-mono text-[9px] flex-1 truncate text-zinc-400">{outRow.value}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Side-by-side split */}
      {diffView === "split" && (
        <div className="grid grid-cols-2 gap-0 rounded-lg border border-zinc-200 overflow-hidden">
          <div className="border-r border-zinc-200">
            <div className="bg-red-50/50 px-3 py-1.5 border-b border-zinc-200 text-[9px] font-semibold text-red-600">← Input</div>
            <div className="divide-y divide-zinc-50">
              {allKeys.map(key => {
                const inRow = inputMap[key];
                const outRow = outputMap[key];
                const isRemoved = inRow && !outRow;
                const isChanged = inRow && outRow && inRow.value !== outRow.value;
                return (
                  <div key={key} className={cn("flex items-center gap-2 px-3 py-1.5 text-[10px]", isRemoved && "bg-red-50/50", isChanged && "bg-amber-50/20")}>
                    <span className="font-medium text-zinc-600 w-20 truncate">{key}</span>
                    <span className={cn("font-mono text-[9px] truncate flex-1", isRemoved ? "text-red-500 line-through" : isChanged ? "text-amber-600" : "text-zinc-400")}>
                      {inRow?.value ?? "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="bg-green-50/50 px-3 py-1.5 border-b border-zinc-200 text-[9px] font-semibold text-green-600">Output →</div>
            <div className="divide-y divide-zinc-50">
              {allKeys.map(key => {
                const inRow = inputMap[key];
                const outRow = outputMap[key];
                const isAdded = !inRow && outRow;
                const isChanged = inRow && outRow && inRow.value !== outRow.value;
                return (
                  <div key={key} className={cn("flex items-center gap-2 px-3 py-1.5 text-[10px]", isAdded && "bg-green-50/50", isChanged && "bg-amber-50/20")}>
                    <span className="font-medium text-zinc-600 w-20 truncate">{key}</span>
                    <span className={cn("font-mono text-[9px] truncate flex-1", isAdded ? "text-green-600 font-semibold" : isChanged ? "text-green-600" : "text-zinc-400")}>
                      {outRow?.value ?? "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* JSON diff view */}
      {diffView === "json" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[9px] font-semibold text-red-500 mb-1">Input JSON</p>
            <pre className="rounded-lg border border-red-100 bg-zinc-950 p-2.5 text-[9px] font-mono text-red-400 max-h-48 overflow-auto leading-relaxed">
              {JSON.stringify(inputJsonObj, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-green-500 mb-1">Output JSON</p>
            <pre className="rounded-lg border border-green-100 bg-zinc-950 p-2.5 text-[9px] font-mono text-green-400 max-h-48 overflow-auto leading-relaxed">
              {JSON.stringify(outputJsonObj, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 text-[9px] text-zinc-400">
        <span>Input: {input.schema.length} fields</span>
        <span>Output: {output.schema.length} fields</span>
        <span className="text-green-500">+{added} added</span>
        <span className="text-red-500">-{removed} removed</span>
        <span className="text-amber-500">~{changed} changed</span>
        <button
          onClick={() => { navigator.clipboard.writeText(JSON.stringify({ input: inputJsonObj, output: outputJsonObj }, null, 2)); }}
          className="ml-auto flex items-center gap-0.5 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <Copy size={8} /> Copy diff
        </button>
      </div>
    </div>
  );
}

/* ── PIN DATA panel ── */
const mockPinHistory = [
  { id: "pin-1", date: "2 min ago", items: 3, source: "Manual execution", size: "1.2 KB" },
  { id: "pin-2", date: "1 hour ago", items: 5, source: "Test run #42", size: "2.8 KB" },
  { id: "pin-3", date: "Yesterday", items: 1, source: "Production exec", size: "0.4 KB" },
];

function PinDataPanel({ nodeId, nodeName, pinned, onTogglePin }: { nodeId: string; nodeName: string; pinned: boolean; onTogglePin: () => void }) {
  const [runWithPinned, setRunWithPinned] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [pinnedJson, setPinnedJson] = useState(JSON.stringify([
    { json: { id: 42, name: "John Doe", email: "john@example.com", status: "active" } },
    { json: { id: 43, name: "Jane Smith", email: "jane@example.com", status: "pending" } },
    { json: { id: 44, name: "Bob Wilson", email: "bob@example.com", status: "active" } },
  ], null, 2));
  const [savedJson, setSavedJson] = useState(pinnedJson);
  const [copied, setCopied] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // JSON validation
  const jsonValidation = useMemo(() => {
    try {
      const parsed = JSON.parse(pinnedJson);
      const isArray = Array.isArray(parsed);
      const itemCount = isArray ? parsed.length : 1;
      const sizeKB = (new Blob([pinnedJson]).size / 1024).toFixed(1);
      return { valid: true, itemCount, sizeKB, error: null };
    } catch (e) {
      return { valid: false, itemCount: 0, sizeKB: "0", error: (e as Error).message };
    }
  }, [pinnedJson]);

  const isModified = pinnedJson !== savedJson;

  const handleCopy = () => { navigator.clipboard.writeText(pinnedJson); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(pinnedJson);
      setPinnedJson(JSON.stringify(parsed, null, 2));
    } catch { /* ignore if invalid */ }
  };

  const handleSave = () => {
    if (jsonValidation.valid) {
      setSavedJson(pinnedJson);
      setEditMode(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div className={cn(
        "rounded-lg border p-3",
        pinned ? "border-blue-200 bg-blue-50/50" : "border-zinc-200 bg-zinc-50/50"
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn("flex h-6 w-6 items-center justify-center rounded-lg", pinned ? "bg-blue-100" : "bg-zinc-200")}>
              <Pin size={12} className={pinned ? "text-blue-600" : "text-zinc-400"} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-zinc-700">{pinned ? "Data Pinned" : "No Pinned Data"}</p>
              <p className="text-[9px] text-zinc-500">{pinned ? `${jsonValidation.itemCount} items · ${jsonValidation.sizeKB} KB` : "Pin output to freeze upstream data"}</p>
            </div>
          </div>
          <button
            onClick={onTogglePin}
            className={cn(
              "rounded-lg px-3 py-1.5 text-[10px] font-medium transition-all",
              pinned ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            {pinned ? "Unpin" : "Pin Current Output"}
          </button>
        </div>
        {pinned && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-blue-200/50">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <button
                onClick={() => setRunWithPinned(!runWithPinned)}
                className={cn(
                  "h-4 w-7 rounded-full transition-colors relative",
                  runWithPinned ? "bg-blue-600" : "bg-zinc-300"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform",
                  runWithPinned ? "left-3.5" : "left-0.5"
                )} />
              </button>
              <span className="text-[10px] text-zinc-600">Run with pinned data</span>
            </label>
            <span className="text-[9px] text-zinc-400 ml-auto">Downstream nodes use this data instead of live upstream</span>
          </div>
        )}
      </div>

      {/* Pinned data editor */}
      {pinned && (
        <div className="rounded-lg border border-zinc-200 overflow-hidden">
          <div className="flex items-center justify-between bg-zinc-50 px-3 py-2 border-b border-zinc-200">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-zinc-600">Pinned Data</span>
              {/* Validation indicator */}
              {editMode && (
                jsonValidation.valid
                  ? <span className="flex items-center gap-0.5 text-[8px] text-emerald-600"><CheckCircle2 size={8} /> Valid</span>
                  : <span className="flex items-center gap-0.5 text-[8px] text-red-500"><XCircle size={8} /> Invalid JSON</span>
              )}
              {isModified && <span className="rounded bg-amber-100 px-1 py-0 text-[8px] font-medium text-amber-700">Modified</span>}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleFormat} className="rounded px-2 py-0.5 text-[9px] text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors" title="Format JSON">
                <Braces size={10} />
              </button>
              <button onClick={() => { if (editMode) handleSave(); else setEditMode(true); }} className={cn("rounded px-2 py-0.5 text-[9px] transition-colors", editMode ? (jsonValidation.valid ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-400 cursor-not-allowed") : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100")}>
                {editMode ? "Save" : "Edit"}
              </button>
              <button onClick={handleCopy} className="rounded px-2 py-0.5 text-[9px] text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors">
                {copied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
              </button>
              <button className="rounded px-2 py-0.5 text-[9px] text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors">
                <Download size={10} />
              </button>
            </div>
          </div>
          {/* Validation error detail */}
          {editMode && !jsonValidation.valid && (
            <div className="bg-red-50 border-b border-red-100 px-3 py-1.5 flex items-center gap-1.5">
              <AlertTriangle size={10} className="text-red-400 flex-shrink-0" />
              <span className="text-[9px] text-red-600 font-mono truncate">{jsonValidation.error}</span>
            </div>
          )}
          {editMode ? (
            <textarea
              value={pinnedJson}
              onChange={e => setPinnedJson(e.target.value)}
              className="w-full h-48 bg-zinc-950 text-[11px] font-mono text-emerald-400 p-3 focus:outline-none resize-none"
              spellCheck={false}
            />
          ) : (
            <pre className="bg-zinc-950 text-[11px] font-mono text-emerald-400 p-3 max-h-48 overflow-auto leading-relaxed">
              {pinnedJson}
            </pre>
          )}
        </div>
      )}

      {/* Pin history */}
      <div>
        <p className="text-[10px] font-medium text-zinc-500 mb-2">Pin History</p>
        <div className="space-y-1">
          {mockPinHistory.map(h => (
            <button
              key={h.id}
              onClick={() => setActiveHistoryId(activeHistoryId === h.id ? null : h.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all",
                activeHistoryId === h.id ? "border-blue-200 bg-blue-50/30" : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50"
              )}
            >
              <Clock size={10} className="text-zinc-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-zinc-700">{h.source}</p>
                <p className="text-[9px] text-zinc-400">{h.date} · {h.items} items · {h.size}</p>
              </div>
              {activeHistoryId === h.id && (
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[8px] font-medium text-blue-700">Restore</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Environment isolation */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3">
        <p className="text-[10px] font-medium text-zinc-600 mb-2">Environment Scope</p>
        <div className="flex gap-2">
          {["Development", "Staging", "Production"].map(env => (
            <span key={env} className={cn(
              "rounded-full px-2.5 py-0.5 text-[9px] font-medium border",
              env === "Development" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-zinc-100 text-zinc-400 border-zinc-200"
            )}>
              {env}
            </span>
          ))}
        </div>
        <p className="text-[9px] text-zinc-400 mt-1.5">Pinned data is scoped to the current environment</p>
      </div>
    </div>
  );
}

/* ── SETTINGS content ── */
function SettingsContent() {
  const [retryEnabled, setRetryEnabled] = useState(false);
  const [continueOnError, setContinueOnError] = useState(false);
  const [retryCount, setRetryCount] = useState(3);
  const [notes, setNotes] = useState("");
  const [executeOnce, setExecuteOnce] = useState(false);
  const [errorWorkflow, setErrorWorkflow] = useState("none");
  const [errorOutput, setErrorOutput] = useState<"stop" | "branch" | "ignore">("stop");

  return (
    <div className="space-y-5">
      <FieldGroup label="Node timeout (ms)" description="Maximum execution time before timeout">
        <input
          type="number"
          defaultValue={10000}
          className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
        />
      </FieldGroup>

      <div className="space-y-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Error handling</p>

        {/* Error output behavior */}
        <FieldGroup label="On error" description="What happens when this node fails">
          <div className="grid grid-cols-3 gap-1">
            {([
              { id: "stop", label: "Stop", desc: "Halt workflow" },
              { id: "branch", label: "Error branch", desc: "Route to error output" },
              { id: "ignore", label: "Ignore", desc: "Continue with empty" },
            ] as const).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setErrorOutput(opt.id)}
                className={cn(
                  "flex flex-col items-center rounded-lg border px-2 py-2 text-center transition-all",
                  errorOutput === opt.id
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 text-zinc-500 hover:border-zinc-300",
                )}
              >
                <span className="text-[10px] font-semibold">{opt.label}</span>
                <span className={cn("text-[8px] mt-0.5", errorOutput === opt.id ? "text-zinc-300" : "text-zinc-400")}>{opt.desc}</span>
              </button>
            ))}
          </div>
        </FieldGroup>

        <ToggleRow label="Continue on error" description="Pass error to output instead of failing" enabled={continueOnError} onToggle={() => setContinueOnError(o => !o)} />
        <ToggleRow label="Auto-retry on failure" description={`Retry up to ${retryCount}× with exponential backoff`} enabled={retryEnabled} onToggle={() => setRetryEnabled(o => !o)} />
      </div>

      {retryEnabled && (
        <>
          <div className="space-y-2 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3">
            <FieldGroup label="Max retries">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 5].map(n => (
                  <button key={n} onClick={() => setRetryCount(n)} className={cn("h-7 w-7 rounded-md text-[11px] font-medium transition-colors", retryCount === n ? "bg-zinc-900 text-white" : "border border-zinc-200 text-zinc-500 hover:bg-zinc-50")}>
                    {n}
                  </button>
                ))}
              </div>
            </FieldGroup>
            <FieldGroup label="Backoff strategy">
              <select className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
                <option>Exponential (1s, 2s, 4s…)</option>
                <option>Linear (1s, 2s, 3s…)</option>
                <option>Fixed (1s, 1s, 1s…)</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Initial delay (ms)">
              <input type="number" defaultValue={1000} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none transition-all" />
            </FieldGroup>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 flex gap-2">
            <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700">Retries may cause duplicate effects in downstream systems. Consider adding idempotency keys.</p>
          </div>
        </>
      )}

      {/* Error workflow */}
      <FieldGroup label="Error workflow" description="Execute another workflow when this node fails">
        <select
          value={errorWorkflow}
          onChange={(e) => setErrorWorkflow(e.target.value)}
          className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all"
        >
          <option value="none">— None —</option>
          <option value="error-handler">Error Alert Handler</option>
          <option value="slack-notify">Slack Error Notifier</option>
          <option value="pagerduty">PagerDuty Escalation</option>
        </select>
        {errorWorkflow !== "none" && (
          <p className="text-[9px] text-green-600 mt-1 flex items-center gap-1">
            <CheckCircle2 size={8} /> Error workflow will receive the error context and original input data
          </p>
        )}
      </FieldGroup>

      <div className="space-y-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Execution</p>
        <ToggleRow label="Execute once" description="Only process the first incoming item" enabled={executeOnce} onToggle={() => setExecuteOnce(o => !o)} />
      </div>

      <FieldGroup label="Node notes" description="Documentation for other collaborators">
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe what this node does…"
          className="w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
        />
      </FieldGroup>

      <div className="pt-2 border-t border-zinc-100">
        <button className="flex items-center gap-1.5 text-[11px] text-red-500 hover:text-red-600 transition-colors">
          <Trash2 size={11} /> Delete this node
        </button>
      </div>
    </div>
  );
}

/* ── Node type hero — visual identity per node type ── */
function NodeTypeHero({ family, name, config }: { family: string; name: string; config: typeof nodeConfigs[string] }) {
  /* ── Error Trigger hero ── */
  if (name === "Error Trigger") {
    return (
      <div className="rounded-lg border border-red-100 bg-gradient-to-r from-red-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-red-100 text-[8px] font-bold text-red-700">🚨</span>
          <span className="text-[10px] font-semibold text-red-700 uppercase tracking-wider">Error Trigger</span>
        </div>
        <p className="text-[10px] text-red-600 mb-2">Fires when an assigned workflow fails. Receives full error context.</p>
        <div className="rounded-md border border-red-200 bg-white p-2.5 space-y-1">
          <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Output schema</p>
          {[
            { key: "$json.execution.id", desc: "Failed execution ID" },
            { key: "$json.workflow.id", desc: "Source workflow ID" },
            { key: "$json.workflow.name", desc: "Source workflow name" },
            { key: "$json.error.message", desc: "Error message" },
            { key: "$json.error.nodeId", desc: "Node that failed" },
            { key: "$json.error.timestamp", desc: "ISO timestamp" },
          ].map(r => (
            <div key={r.key} className="flex items-center gap-2">
              <code className="text-[9px] font-mono text-red-600 bg-red-50 rounded px-1 py-0.5">{r.key}</code>
              <span className="text-[9px] text-zinc-400">{r.desc}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Wait node hero ── */
  if (name === "Wait") {
    return (
      <div className="rounded-lg border border-amber-100 bg-gradient-to-r from-amber-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-100 text-[8px] font-bold text-amber-700">⏸</span>
          <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Wait / Pause</span>
        </div>
        <p className="text-[10px] text-amber-600">Pause execution until a condition is met: duration, specific time, webhook call, or custom expression.</p>
      </div>
    );
  }

  /* ── Switch node hero ── */
  if (name === "Switch") {
    return (
      <div className="rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-[8px] font-bold text-blue-700">⑂</span>
          <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">Switch</span>
        </div>
        <p className="text-[10px] text-blue-600">Route items to different outputs based on rules or an expression value. Supports fallback output.</p>
      </div>
    );
  }

  /* ── Merge node hero ── */
  if (name === "Merge") {
    return (
      <div className="rounded-lg border border-emerald-100 bg-gradient-to-r from-emerald-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-[8px] font-bold text-emerald-700">⊕</span>
          <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Merge</span>
        </div>
        <p className="text-[10px] text-emerald-600">Combine data from multiple branches using append, combine by field, zip, cross product, or multiplex.</p>
      </div>
    );
  }

  /* ── Sort node hero ── */
  if (name === "Sort") {
    return (
      <div className="rounded-lg border border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-100 text-[8px] font-bold text-indigo-700">↕</span>
          <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">Sort</span>
        </div>
        <p className="text-[10px] text-indigo-600">Sort items by one or more fields. Supports ascending, descending, case sensitivity, and null handling.</p>
      </div>
    );
  }

  /* ── Summarize node hero ── */
  if (name === "Summarize") {
    return (
      <div className="rounded-lg border border-violet-100 bg-gradient-to-r from-violet-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-violet-100 text-[8px] font-bold text-violet-700">Σ</span>
          <span className="text-[10px] font-semibold text-violet-700 uppercase tracking-wider">Summarize</span>
        </div>
        <p className="text-[10px] text-violet-600">Group items and compute aggregates: count, sum, average, min, max, and more.</p>
      </div>
    );
  }

  /* ── Compare Datasets node hero ── */
  if (name === "Compare Datasets" || name === "Compare") {
    return (
      <div className="rounded-lg border border-pink-100 bg-gradient-to-r from-pink-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-pink-100 text-[8px] font-bold text-pink-700">↔</span>
          <span className="text-[10px] font-semibold text-pink-700 uppercase tracking-wider">Compare Datasets</span>
        </div>
        <p className="text-[10px] text-pink-600">Find added, removed, changed, and unchanged items between two datasets.</p>
      </div>
    );
  }

  /* ── Sub-workflow hero ── */
  if (name === "Sub-workflow" || name === "Execute Workflow") {
    return (
      <div className="rounded-lg border border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-100 text-[8px] font-bold text-indigo-700">↩</span>
          <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">Sub-workflow</span>
        </div>
        <p className="text-[10px] text-indigo-600">Call another workflow, pass parameters, and receive its output. Enables reuse and modular automation.</p>
      </div>
    );
  }

  /* ── Form Trigger hero ── */
  if (name === "Form Trigger" || name === "Form") {
    return (
      <div className="rounded-lg border border-cyan-100 bg-gradient-to-r from-cyan-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-cyan-100 text-[8px] font-bold text-cyan-700">📋</span>
          <span className="text-[10px] font-semibold text-cyan-700 uppercase tracking-wider">{name === "Form Trigger" ? "Form Trigger" : "Form (Mid-flow)"}</span>
        </div>
        <p className="text-[10px] text-cyan-600">{name === "Form Trigger" ? "Generate a public form that starts this workflow on submission." : "Pause execution and collect additional data via form."}</p>
      </div>
    );
  }

  /* ── Chat Trigger hero ── */
  if (name === "Chat Trigger") {
    return (
      <div className="rounded-lg border border-purple-100 bg-gradient-to-r from-purple-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-100 text-[8px] font-bold text-purple-700">💬</span>
          <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider">Chat Trigger</span>
        </div>
        <p className="text-[10px] text-purple-600">Create a public chat interface. Each message triggers this workflow with session context.</p>
      </div>
    );
  }

  /* ── RSS Feed Trigger hero ── */
  if (name === "RSS Feed Trigger" || name === "RSS Trigger") {
    return (
      <div className="rounded-lg border border-orange-100 bg-gradient-to-r from-orange-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-orange-100 text-[8px] font-bold text-orange-700">📡</span>
          <span className="text-[10px] font-semibold text-orange-700 uppercase tracking-wider">RSS Feed Trigger</span>
        </div>
        <p className="text-[10px] text-orange-600">Poll an RSS/Atom feed and trigger on new items. Configure polling interval and item limits.</p>
      </div>
    );
  }

  if (name === "Schedule Trigger" || name === "Schedule" || name === "Cron") {
    return (
      <div className="rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-[8px] font-bold text-blue-700">⏰</span>
          <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">Schedule Trigger</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">Weekdays 9 AM</span>
          <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[9px] text-blue-600 font-mono">0 9 * * 1-5</span>
        </div>
        <p className="mt-1.5 text-[9px] text-blue-500">Next run: Mon, Jan 6, 2025 09:00 UTC</p>
      </div>
    );
  }

  /* ── Vector Store hero ── */
  if (name === "Vector Store") {
    return (
      <div className="rounded-lg border border-violet-100 bg-gradient-to-r from-violet-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-violet-100 text-[8px] font-bold text-violet-700">🗄</span>
          <span className="text-[10px] font-semibold text-violet-700 uppercase tracking-wider">Vector Store</span>
        </div>
        <p className="text-[10px] text-violet-600">Store and retrieve document embeddings. Insert, search, or delete documents in your knowledge base.</p>
      </div>
    );
  }

  /* ── Knowledge Search hero ── */
  if (name === "Knowledge Search" || name === "Retriever") {
    return (
      <div className="rounded-lg border border-emerald-100 bg-gradient-to-r from-emerald-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-[8px] font-bold text-emerald-700">📚</span>
          <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">{name}</span>
        </div>
        <p className="text-[10px] text-emerald-600">Search your knowledge base and return relevant text chunks. Combine with LLM for RAG workflows.</p>
      </div>
    );
  }

  /* ── Document Loader hero ── */
  if (name === "Document Loader") {
    return (
      <div className="rounded-lg border border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-100 text-[8px] font-bold text-indigo-700">📄</span>
          <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">Document Loader</span>
        </div>
        <p className="text-[10px] text-indigo-600">Load documents from text, file, URL, or JSON. Prepares content for chunking and embedding.</p>
      </div>
    );
  }

  /* ── Embeddings hero ── */
  if (name === "Embeddings") {
    return (
      <div className="rounded-lg border border-pink-100 bg-gradient-to-r from-pink-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-pink-100 text-[8px] font-bold text-pink-700">🧠</span>
          <span className="text-[10px] font-semibold text-pink-700 uppercase tracking-wider">Embeddings</span>
        </div>
        <p className="text-[10px] text-pink-600">Generate vector embeddings from text using OpenAI, Ollama, Gemini, or mock provider for testing.</p>
      </div>
    );
  }

  /* ── Text Splitter hero ── */
  if (name === "Text Splitter") {
    return (
      <div className="rounded-lg border border-purple-100 bg-gradient-to-r from-purple-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-100 text-[8px] font-bold text-purple-700">✂️</span>
          <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider">Text Splitter</span>
        </div>
        <p className="text-[10px] text-purple-600">Split documents into smaller chunks for embedding. Supports recursive, character, and token strategies.</p>
      </div>
    );
  }

  /* ── MCP Client Tool hero ── */
  if (name === "MCP Client Tool") {
    return (
      <div className="rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-[8px] font-bold text-blue-700">🔌</span>
          <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">MCP Client Tool</span>
        </div>
        <p className="text-[10px] text-blue-600">Connect to an external MCP server and expose its tools to your AI Agent. Supports SSE and Streamable HTTP transports.</p>
      </div>
    );
  }

  /* ── MCP Server Trigger hero ── */
  if (name === "MCP Server Trigger") {
    return (
      <div className="rounded-lg border border-violet-100 bg-gradient-to-r from-violet-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-violet-100 text-[8px] font-bold text-violet-700">🖥️</span>
          <span className="text-[10px] font-semibold text-violet-700 uppercase tracking-wider">MCP Server Trigger</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-violet-200 bg-white px-2 py-1.5 mt-1">
          <code className="text-[11px] font-mono text-zinc-600 flex-1 truncate">/mcp/{'{path}'}</code>
          <button className="text-zinc-300 hover:text-zinc-500"><Copy size={9} /></button>
        </div>
        <p className="mt-1.5 text-[9px] text-violet-600">Exposes this workflow as an MCP server — external clients can discover and call tools.</p>
      </div>
    );
  }

  /* ── MCP Client hero ── */
  if (name === "MCP Client") {
    return (
      <div className="rounded-lg border border-cyan-100 bg-gradient-to-r from-cyan-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-cyan-100 text-[8px] font-bold text-cyan-700">🔗</span>
          <span className="text-[10px] font-semibold text-cyan-700 uppercase tracking-wider">MCP Client</span>
        </div>
        <p className="text-[10px] text-cyan-600">Call a specific tool on an external MCP server as a regular workflow step. Select the tool and provide parameters.</p>
      </div>
    );
  }

  /* ── Human Approval hero ── */
  if (name === "Human Approval") {
    return (
      <div className="rounded-lg border border-amber-100 bg-gradient-to-r from-amber-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-100 text-[8px] font-bold text-amber-700">👤</span>
          <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Human Approval</span>
        </div>
        <p className="text-[10px] text-amber-600">Pause execution and wait for human review. Supports timeout with auto-approve, reject, or fallback actions.</p>
      </div>
    );
  }

  /* ── Agent Evaluation hero ── */
  if (name === "Agent Evaluation") {
    return (
      <div className="rounded-lg border border-emerald-100 bg-gradient-to-r from-emerald-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-[8px] font-bold text-emerald-700">✅</span>
          <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Agent Evaluation</span>
        </div>
        <p className="text-[10px] text-emerald-600">Test agent outputs against golden datasets. Compare using similarity, regex, keywords, or LLM-as-judge.</p>
      </div>
    );
  }

  /* ── Polling Trigger hero ── */
  if (name === "Polling Trigger") {
    return (
      <div className="rounded-lg border border-sky-100 bg-gradient-to-r from-sky-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-sky-100 text-[8px] font-bold text-sky-700">🔄</span>
          <span className="text-[10px] font-semibold text-sky-700 uppercase tracking-wider">Polling Trigger</span>
        </div>
        <p className="text-[10px] text-sky-600">Watch an external API by polling at regular intervals. Detects changes via hash, ETag, or Last-Modified.</p>
      </div>
    );
  }

  /* ── Event Trigger hero ── */
  if (name === "Event Trigger") {
    return (
      <div className="rounded-lg border border-purple-100 bg-gradient-to-r from-purple-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-100 text-[8px] font-bold text-purple-700">📡</span>
          <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider">Event Trigger</span>
        </div>
        <p className="text-[10px] text-purple-600">Listen for internal events from other workflows or system events. Supports filtering and debounce.</p>
      </div>
    );
  }

  /* ── API Trigger hero ── */
  if (name === "API Trigger") {
    return (
      <div className="rounded-lg border border-teal-100 bg-gradient-to-r from-teal-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-100 text-[8px] font-bold text-teal-700">🌐</span>
          <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider">API Trigger</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-teal-200 bg-white px-2 py-1.5 mt-1">
          <span className="rounded px-1.5 py-0.5 text-[8px] font-bold bg-green-100 text-green-700">POST</span>
          <code className="text-[9px] font-mono text-teal-700 truncate flex-1">/api/workflows/{'{id}'}/run</code>
        </div>
        <p className="mt-1.5 text-[9px] text-teal-600">Trigger via FlowHolt API. Supports sync/async response modes.</p>
      </div>
    );
  }

  if (family === "trigger") {
    const method = config.fields?.find((f) => f.label === "Method")?.value || "POST";
    const path = config.fields?.find((f) => f.label === "Path")?.value || "/webhook";
    return (
      <div className="rounded-lg border border-green-100 bg-gradient-to-r from-green-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-green-100 text-[8px] font-bold text-green-700">⚡</span>
          <span className="text-[10px] font-semibold text-green-700 uppercase tracking-wider">Trigger</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-green-200 bg-white px-2 py-1.5">
          <span className={cn(
            "rounded px-1.5 py-0.5 text-[9px] font-bold",
            method === "GET" ? "bg-blue-100 text-blue-700" : method === "POST" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          )}>{method}</span>
          <code className="text-[11px] font-mono text-zinc-600 flex-1 truncate">{path}</code>
          <button className="text-zinc-300 hover:text-zinc-500"><Copy size={9} /></button>
        </div>
        <p className="mt-1.5 text-[9px] text-green-600">Listening for incoming requests</p>
      </div>
    );
  }

  if (family === "ai") {
    const model = config.model || "gpt-4o";
    const temp = config.fields?.find((f) => f.label === "Temperature")?.value || "0.7";
    const maxTok = config.fields?.find((f) => f.label === "Max Tokens")?.value || "500";
    return (
      <div className="rounded-lg border border-violet-100 bg-gradient-to-r from-violet-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-violet-100 text-[8px] font-bold text-violet-700">🧠</span>
          <span className="text-[10px] font-semibold text-violet-700 uppercase tracking-wider">AI Node</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white">{model}</span>
          <span className="rounded bg-violet-50 border border-violet-200 px-1.5 py-0.5 text-[9px] text-violet-600">temp {temp}</span>
          <span className="rounded bg-violet-50 border border-violet-200 px-1.5 py-0.5 text-[9px] text-violet-600">{maxTok} tokens</span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-[9px] text-violet-500">
          <span>~340ms avg latency</span>
          <span>~$0.004/call</span>
        </div>
      </div>
    );
  }

  if (family === "logic") {
    const condition = config.fields?.find((f) => f.label === "Condition")?.value || "";
    const trueOut = config.fields?.find((f) => f.label === "True Output")?.value || "True";
    const falseOut = config.fields?.find((f) => f.label === "False Output")?.value || "False";
    return (
      <div className="rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50/60 to-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-[8px] font-bold text-blue-700">⑂</span>
          <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">Conditional</span>
        </div>
        {condition && (
          <div className="rounded-md border border-blue-200 bg-white px-2.5 py-1.5">
            <code className="text-[10px] font-mono text-violet-600">{condition}</code>
          </div>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span className="flex items-center gap-1 rounded bg-green-50 border border-green-200 px-1.5 py-0.5 text-[9px] text-green-700">
            <CheckCircle2 size={8} /> {trueOut}
          </span>
          <span className="text-[9px] text-zinc-300">/</span>
          <span className="flex items-center gap-1 rounded bg-red-50 border border-red-200 px-1.5 py-0.5 text-[9px] text-red-700">
            <XCircle size={8} /> {falseOut}
          </span>
        </div>
      </div>
    );
  }

  if (family === "integration") {
    const operation = config.fields?.find((f) => f.label === "Operation")?.value || "Execute";
    return (
      <div className="rounded-lg border border-zinc-100 bg-gradient-to-r from-zinc-50/60 to-white p-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-100 text-[8px] font-bold text-zinc-600">🔗</span>
          <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Integration</span>
          <span className="ml-auto rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-medium text-zinc-600">{operation}</span>
        </div>
        {config.credential && (
          <div className="mt-2 flex items-center gap-1.5 text-[9px] text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            {config.credential}
          </div>
        )}
      </div>
    );
  }

  return null;
}

/* ── PARAMETERS content with expression editor ── */
function ParametersContent({ config, nodeFamily, nodeName }: { config: typeof nodeConfigs[string]; nodeFamily: string; nodeName: string }) {
  const [advanced, setAdvanced] = useState(false);
  const [exprFields, setExprFields] = useState<Record<string, boolean>>({});
  const [exprModalField, setExprModalField] = useState<string | null>(null);
  const [exprModalValue, setExprModalValue] = useState("");

  const toggleExpr = (label: string) => {
    setExprFields(p => ({ ...p, [label]: !p[label] }));
  };

  const openExpressionEditor = (field: { label: string; value: string }) => {
    setExprModalField(field.label);
    setExprModalValue(field.value);
  };

  return (
    <div className="space-y-4">
      {/* Node-type-specific hero section */}
      <NodeTypeHero family={nodeFamily} name={nodeName} config={config} />

      {config.model && (
        <FieldGroup label="Model" description="AI model to use for inference">
          <select
            defaultValue={config.model}
            className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
          >
            <option>gpt-4o</option>
            <option>gpt-4o-mini</option>
            <option>gpt-3.5-turbo</option>
            <option>claude-3.5-sonnet</option>
            <option>claude-3-haiku</option>
            <option>gemini-1.5-pro</option>
          </select>
        </FieldGroup>
      )}

      {config.prompt && (
        <FieldGroup label="System Prompt" description="Instructions for the AI model">
          <textarea
            rows={3}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all resize-none font-mono"
            defaultValue={config.prompt}
          />
        </FieldGroup>
      )}

      {config.fields?.map((field) => {
        const isExprMode = field.expressionEnabled || exprFields[field.label] || field.type === "expression";
        return (
          <div key={field.label}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-medium text-zinc-500">{field.label}</label>
              <div className="flex items-center gap-1">
                {field.description && (
                  <span className="text-[8px] text-zinc-300 max-w-[120px] truncate" title={field.description}>ⓘ</span>
                )}
                {/* Expression toggle (fx button) — like n8n */}
                {field.type !== "select" && (
                  <button
                    onClick={() => toggleExpr(field.label)}
                    className={cn(
                      "flex h-5 items-center gap-0.5 rounded px-1.5 text-[9px] font-bold transition-all",
                      isExprMode ? "bg-violet-100 text-violet-700 border border-violet-200" : "text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50"
                    )}
                    title="Toggle expression mode"
                  >
                    <Braces size={9} /> fx
                  </button>
                )}
              </div>
            </div>

            {isExprMode ? (
              /* Expression editor with inline validation + autocomplete */
              <ExpressionFieldWithValidation field={field} onOpenEditor={openExpressionEditor} />
            ) : field.type === "select" ? (
              <select defaultValue={field.value} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all">
                {(field.options ?? [field.value]).map(o => <option key={o}>{o}</option>)}
              </select>
            ) : field.type === "code" ? (
              <CodeEditor
                value={field.value}
                language="json"
                height="100px"
                showToolbar={true}
                showAIAssist={false}
                showLineNumbers={false}
                compact
              />
            ) : field.type === "textarea" ? (
              <textarea
                rows={2}
                defaultValue={field.value}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all resize-none"
              />
            ) : (
              <input
                type={field.type === "number" ? "number" : "text"}
                defaultValue={field.value}
                className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
              />
            )}
          </div>
        );
      })}

      {config.credential && (
        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">Credentials</p>
          <div className="flex items-center gap-2 rounded-md border border-zinc-100 bg-zinc-50/50 px-3 py-2 hover:bg-zinc-50 transition-colors cursor-pointer">
            <span className="h-[6px] w-[6px] rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
            <span className="text-[12px] text-zinc-700 flex-1">{config.credential}</span>
            <span className="text-[9px] text-green-600 font-medium">Connected</span>
            <ChevronRight size={10} className="text-zinc-300" />
          </div>
        </div>
      )}

      {/* ── Node-specific parameter sections ── */}
      {nodeName === "Wait" && <WaitNodeParams />}
      {nodeName === "Switch" && <SwitchNodeParams />}
      {nodeName === "Merge" && <MergeNodeParams />}
      {nodeName === "Sort" && <SortNodeParams />}
      {nodeName === "Summarize" && <SummarizeNodeParams />}
      {(nodeName === "Compare Datasets" || nodeName === "Compare") && <CompareNodeParams />}
      {(nodeName === "Set" || nodeName === "Edit Fields" || nodeName === "Set / Edit Fields") && <EditFieldsParams />}
      {(nodeName === "Sub-workflow" || nodeName === "Execute Workflow") && <ExecuteWorkflowParams />}
      {(nodeName === "Form Trigger" || nodeName === "Form") && <FormBuilderParams nodeName={nodeName} />}
      {nodeName === "Chat Trigger" && <ChatTriggerParams />}
      {(nodeName === "RSS Feed Trigger" || nodeName === "RSS Trigger") && <RssTriggerParams />}
      {(nodeName === "Schedule Trigger" || nodeName === "Schedule" || nodeName === "Cron") && <ScheduleBuilderParams />}
      {nodeName === "Vector Store" && <VectorStoreParams />}
      {(nodeName === "Knowledge Search" || nodeName === "Retriever") && <KnowledgeSearchParams />}
      {nodeName === "MCP Client Tool" && <MCPClientToolParams />}
      {nodeName === "MCP Server Trigger" && <MCPServerTriggerParams />}
      {nodeName === "MCP Client" && <MCPClientToolParams />}
      {nodeName === "Human Approval" && <HumanApprovalParams />}
      {nodeName === "Agent Evaluation" && <AgentEvaluationParams />}
      {(nodeName === "Code" || nodeName === "Function" || nodeName === "JavaScript" || nodeName === "Python") && (
        <div className="rounded-lg border border-zinc-200 overflow-hidden" style={{ height: 360 }}>
          <CodeEditorPanelInline nodeType="Code" />
        </div>
      )}
      {(nodeName === "HTTP Request" || nodeName === "HTTP") && (
        <div className="rounded-lg border border-zinc-200 overflow-hidden" style={{ height: 280 }}>
          <CodeEditorPanelInline nodeType="HTTP Request" />
        </div>
      )}

      <button
        onClick={() => setAdvanced((o) => !o)}
        className="flex w-full items-center gap-1.5 rounded-md px-1 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        <ChevronDown size={11} className={cn("transition-transform", advanced ? "rotate-0" : "-rotate-90")} />
        Advanced Settings
      </button>
      {advanced && (
        <div className="space-y-3 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3">
          <FieldGroup label="Display name">
            <input type="text" placeholder="Custom label…" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all" />
          </FieldGroup>
          <FieldGroup label="Node color">
            <div className="flex items-center gap-1.5">
              {["bg-zinc-400", "bg-blue-500", "bg-green-500", "bg-red-500", "bg-violet-500", "bg-amber-500"].map((c, i) => (
                <button key={c} className={cn("h-6 w-6 rounded-md transition-all hover:scale-110", c, i === 0 && "ring-2 ring-zinc-900 ring-offset-1")} />
              ))}
            </div>
          </FieldGroup>
          <FieldGroup label="Execution priority">
            <select className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
              <option>Normal</option>
              <option>High</option>
              <option>Low</option>
            </select>
          </FieldGroup>
        </div>
      )}

      {/* Expression Editor Modal */}
      <ExpressionEditorModal
        open={exprModalField !== null}
        onClose={() => setExprModalField(null)}
        value={exprModalValue}
        fieldLabel={exprModalField ?? "Expression"}
      />
    </div>
  );
}
/* ── Expression field with inline validation + autocomplete ── */
/* ── Wait Node Params ── */
function WaitNodeParams() {
  const [mode, setMode] = useState<"duration" | "until" | "webhook" | "custom">("duration");
  const [duration, setDuration] = useState(1);
  const [unit, setUnit] = useState<"seconds" | "minutes" | "hours" | "days">("hours");
  const webhookUrl = "https://app.flowholt.com/wait/w-3f8a…/resume";

  return (
    <div className="space-y-3">
      <FieldGroup label="Resume when" description="Choose how this node should resume execution">
        <div className="grid grid-cols-4 gap-1">
          {(["duration", "until", "webhook", "custom"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={cn("rounded-lg border px-2 py-1.5 text-[10px] font-medium transition-all text-center capitalize", mode === m ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-500 hover:border-zinc-300")}>{m}</button>
          ))}
        </div>
      </FieldGroup>

      {mode === "duration" && (
        <div className="flex gap-2">
          <FieldGroup label="Amount">
            <input type="number" value={duration} onChange={e => setDuration(+e.target.value)} min={1} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none transition-all" />
          </FieldGroup>
          <FieldGroup label="Unit">
            <select value={unit} onChange={e => setUnit(e.target.value as typeof unit)} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
              {["seconds", "minutes", "hours", "days"].map(u => <option key={u}>{u}</option>)}
            </select>
          </FieldGroup>
        </div>
      )}

      {mode === "until" && (
        <>
          <FieldGroup label="Date & Time">
            <input type="datetime-local" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none transition-all" />
          </FieldGroup>
          <FieldGroup label="Timezone">
            <select defaultValue="UTC" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
              <option>UTC</option><option>America/New_York</option><option>Europe/London</option><option>Asia/Tokyo</option>
            </select>
          </FieldGroup>
        </>
      )}

      {mode === "webhook" && (
        <div className="space-y-2">
          <FieldGroup label="Resume URL" description="Send a POST to this URL to resume execution">
            <div className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5">
              <code className="text-[10px] font-mono text-amber-700 flex-1 truncate">{webhookUrl}</code>
              <button className="text-amber-500 hover:text-amber-700"><Copy size={10} /></button>
            </div>
          </FieldGroup>
          <FieldGroup label="Timeout">
            <select defaultValue="24h" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
              <option value="1h">1 hour</option><option value="24h">24 hours</option><option value="7d">7 days</option><option value="never">No timeout</option>
            </select>
          </FieldGroup>
          <p className="text-[9px] text-amber-600 flex items-center gap-1"><AlertTriangle size={8} /> POST body will be merged into output data</p>
        </div>
      )}

      {mode === "custom" && (
        <FieldGroup label="Resume expression" description="Expression that evaluates to true when ready">
          <textarea rows={2} placeholder='={{ $json.status === "approved" }}' className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[11px] text-zinc-700 font-mono focus:outline-none transition-all resize-none" />
        </FieldGroup>
      )}
    </div>
  );
}

/* ── Execute Workflow Params ── */
function ExecuteWorkflowParams() {
  const [selectedWf, setSelectedWf] = useState("");
  const mockWorkflows = [
    { id: "wf-1", name: "Send Welcome Email", params: [{ name: "userId", type: "string", required: true }, { name: "template", type: "string", required: false }] },
    { id: "wf-2", name: "Process Payment", params: [{ name: "amount", type: "number", required: true }, { name: "currency", type: "string", required: true }] },
    { id: "wf-3", name: "Enrich Lead", params: [{ name: "email", type: "string", required: true }] },
  ];
  const selected = mockWorkflows.find(w => w.id === selectedWf);

  return (
    <div className="space-y-3">
      <FieldGroup label="Target workflow" description="Select a workflow to call">
        <select value={selectedWf} onChange={e => setSelectedWf(e.target.value)} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none transition-all">
          <option value="">— Select workflow —</option>
          {mockWorkflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </FieldGroup>

      {selected && (
        <>
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Parameters</p>
            <div className="rounded-lg border border-zinc-200 overflow-hidden">
              <div className="grid grid-cols-3 gap-0 text-[9px] font-medium text-zinc-400 bg-zinc-50 px-2.5 py-1.5 border-b border-zinc-100">
                <span>Name</span><span>Type</span><span>Value</span>
              </div>
              {selected.params.map(p => (
                <div key={p.name} className="grid grid-cols-3 gap-0 items-center px-2.5 py-2 border-b border-zinc-50 last:border-0">
                  <span className="text-[10px] text-zinc-700 font-medium flex items-center gap-1">{p.name} {p.required && <span className="text-red-400">*</span>}</span>
                  <span className="text-[9px] text-zinc-400 font-mono">{p.type}</span>
                  <input placeholder={`={{ $json.${p.name} }}`} className="h-6 w-full rounded border border-zinc-200 bg-white px-1.5 text-[10px] text-zinc-700 font-mono focus:outline-none" />
                </div>
              ))}
            </div>
          </div>

          <FieldGroup label="Timeout" description="Max time to wait for sub-workflow">
            <select defaultValue="300" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
              <option value="60">1 minute</option><option value="300">5 minutes</option><option value="600">10 minutes</option><option value="1800">30 minutes</option>
            </select>
          </FieldGroup>
        </>
      )}
    </div>
  );
}

/* ── Switch Node Params ── */
function SwitchNodeParams() {
  const [mode, setMode] = useState<"rules" | "expression">("rules");
  const [branches, setBranches] = useState([
    { id: "b1", name: "Branch 1", field: "", operator: "equals", value: "" },
    { id: "b2", name: "Branch 2", field: "", operator: "equals", value: "" },
  ]);
  const [expression, setExpression] = useState("{{ $json.status }}");
  const [fallback, setFallback] = useState<"none" | "extra_output">("none");

  const operators = [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not Equals" },
    { value: "contains", label: "Contains" },
    { value: "gt", label: "Greater Than" },
    { value: "lt", label: "Less Than" },
    { value: "exists", label: "Exists" },
    { value: "is_empty", label: "Is Empty" },
    { value: "regex", label: "Regex Match" },
  ];

  const addBranch = () =>
    setBranches((b) => [...b, { id: `b${Date.now()}`, name: `Branch ${b.length + 1}`, field: "", operator: "equals", value: "" }]);
  const removeBranch = (id: string) => setBranches((b) => b.filter((br) => br.id !== id));
  const updateBranch = (id: string, key: string, val: string) =>
    setBranches((b) => b.map((br) => (br.id === id ? { ...br, [key]: val } : br)));

  return (
    <div className="space-y-3">
      <FieldGroup label="Routing Mode">
        <div className="grid grid-cols-2 gap-1">
          {(["rules", "expression"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded-lg border px-2 py-1.5 text-[10px] font-medium transition-all text-center capitalize",
                mode === m ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
              )}
            >
              {m === "rules" ? "Rules" : "Expression"}
            </button>
          ))}
        </div>
      </FieldGroup>

      {mode === "expression" && (
        <FieldGroup label="Routing Expression" description="Result is matched against branch edge labels">
          <input
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 font-mono focus:outline-none transition-all"
            placeholder='={{ $json.status }}'
          />
        </FieldGroup>
      )}

      {mode === "rules" && (
        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Branches</p>
          {branches.map((br, idx) => (
            <div key={br.id} className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <input
                  value={br.name}
                  onChange={(e) => updateBranch(br.id, "name", e.target.value)}
                  className="h-6 w-32 rounded border border-zinc-200 bg-white px-2 text-[10px] font-medium text-zinc-700 focus:outline-none"
                />
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-zinc-400">Output {idx}</span>
                  {branches.length > 2 && (
                    <button onClick={() => removeBranch(br.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                      <XCircle size={12} />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  value={br.field}
                  onChange={(e) => updateBranch(br.id, "field", e.target.value)}
                  placeholder="field.path"
                  className="h-7 rounded border border-zinc-200 bg-white px-2 text-[10px] font-mono text-zinc-700 focus:outline-none"
                />
                <select
                  value={br.operator}
                  onChange={(e) => updateBranch(br.id, "operator", e.target.value)}
                  className="h-7 rounded border border-zinc-200 bg-white px-1 text-[10px] text-zinc-700 focus:outline-none"
                >
                  {operators.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
                <input
                  value={br.value}
                  onChange={(e) => updateBranch(br.id, "value", e.target.value)}
                  placeholder="value"
                  className="h-7 rounded border border-zinc-200 bg-white px-2 text-[10px] font-mono text-zinc-700 focus:outline-none"
                />
              </div>
            </div>
          ))}
          <button
            onClick={addBranch}
            className="flex items-center gap-1 rounded-md border border-dashed border-zinc-300 px-3 py-1.5 text-[10px] text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-all w-full justify-center"
          >
            <Plus size={10} /> Add Branch
          </button>
        </div>
      )}

      <FieldGroup label="Fallback Output" description="What happens to unmatched items">
        <select
          value={fallback}
          onChange={(e) => setFallback(e.target.value as typeof fallback)}
          className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all"
        >
          <option value="none">Discard unmatched items</option>
          <option value="extra_output">Send to extra output</option>
        </select>
      </FieldGroup>
    </div>
  );
}

/* ── Merge Node Params ── */
function MergeNodeParams() {
  const [strategy, setStrategy] = useState<"append" | "combine_by_field" | "zip" | "cross_product" | "multiplex" | "object">("append");
  const [combineField, setCombineField] = useState("");

  const strategies = [
    { value: "append", label: "Append", desc: "Combine all items into one list" },
    { value: "combine_by_field", label: "Combine by Field", desc: "Merge matching items by a shared key" },
    { value: "zip", label: "Zip", desc: "Pair items by position (1-to-1)" },
    { value: "cross_product", label: "Cross Product", desc: "Every combination of items" },
    { value: "multiplex", label: "Multiplex", desc: "Round-robin interleave" },
    { value: "object", label: "Merge Objects", desc: "Deep merge dict objects" },
  ] as const;

  return (
    <div className="space-y-3">
      <FieldGroup label="Merge Strategy" description="How to combine data from input branches">
        <div className="space-y-1">
          {strategies.map((s) => (
            <button
              key={s.value}
              onClick={() => setStrategy(s.value)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all",
                strategy === s.value
                  ? "border-emerald-300 bg-emerald-50/80 ring-1 ring-emerald-200"
                  : "border-zinc-200 hover:border-zinc-300"
              )}
            >
              <div
                className={cn(
                  "h-3 w-3 rounded-full border-2 flex-shrink-0 transition-all",
                  strategy === s.value ? "border-emerald-500 bg-emerald-500" : "border-zinc-300"
                )}
              />
              <div>
                <span className={cn("text-[11px] font-medium", strategy === s.value ? "text-emerald-700" : "text-zinc-600")}>
                  {s.label}
                </span>
                <p className="text-[9px] text-zinc-400">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </FieldGroup>

      {strategy === "combine_by_field" && (
        <FieldGroup label="Match Field" description="The key used to match items between inputs">
          <input
            value={combineField}
            onChange={(e) => setCombineField(e.target.value)}
            placeholder="e.g. id, email, userId"
            className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 font-mono focus:outline-none transition-all"
          />
        </FieldGroup>
      )}

      <div className="rounded-md border border-zinc-200 bg-zinc-50/50 p-2.5">
        <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Input Preview</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded border border-zinc-200 bg-white p-1.5 text-center">
            <span className="text-[9px] text-zinc-500">Input 1</span>
          </div>
          <span className="text-[10px] text-zinc-400">+</span>
          <div className="flex-1 rounded border border-zinc-200 bg-white p-1.5 text-center">
            <span className="text-[9px] text-zinc-500">Input 2</span>
          </div>
          <span className="text-[10px] text-zinc-400">→</span>
          <div className="flex-1 rounded border border-emerald-200 bg-emerald-50 p-1.5 text-center">
            <span className="text-[9px] text-emerald-600 font-medium">Merged</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sort Node Params ── */
function SortNodeParams() {
  const [sortKeys, setSortKeys] = useState([{ id: "sk1", field: "", order: "asc" as "asc" | "desc" }]);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [nullsPosition, setNullsPosition] = useState<"last" | "first">("last");

  const addKey = () =>
    setSortKeys((k) => [...k, { id: `sk${Date.now()}`, field: "", order: "asc" as "asc" | "desc" }]);
  const removeKey = (id: string) => setSortKeys((k) => k.filter((kk) => kk.id !== id));
  const updateKey = (id: string, key: string, val: string) =>
    setSortKeys((k) => k.map((kk) => (kk.id === id ? { ...kk, [key]: val } : kk)));

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Sort By</p>
        {sortKeys.map((sk, idx) => (
          <div key={sk.id} className="flex items-center gap-1.5">
            <span className="text-[9px] text-zinc-300 w-4 text-center">{idx + 1}.</span>
            <input
              value={sk.field}
              onChange={(e) => updateKey(sk.id, "field", e.target.value)}
              placeholder="field.path"
              className="h-7 flex-1 rounded border border-zinc-200 bg-white px-2 text-[10px] font-mono text-zinc-700 focus:outline-none"
            />
            <select
              value={sk.order}
              onChange={(e) => updateKey(sk.id, "order", e.target.value)}
              className="h-7 w-20 rounded border border-zinc-200 bg-white px-1 text-[10px] text-zinc-700 focus:outline-none"
            >
              <option value="asc">A → Z</option>
              <option value="desc">Z → A</option>
            </select>
            {sortKeys.length > 1 && (
              <button onClick={() => removeKey(sk.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                <XCircle size={12} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addKey}
          className="flex items-center gap-1 rounded-md border border-dashed border-zinc-300 px-3 py-1 text-[10px] text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-all w-full justify-center"
        >
          <Plus size={10} /> Add sort key
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <FieldGroup label="Case Sensitive">
          <button
            onClick={() => setCaseSensitive(!caseSensitive)}
            className={cn(
              "h-7 w-full rounded-md border px-2 text-[10px] font-medium transition-all",
              caseSensitive ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-zinc-200 text-zinc-500"
            )}
          >
            {caseSensitive ? "Yes" : "No"}
          </button>
        </FieldGroup>
        <FieldGroup label="Nulls">
          <select
            value={nullsPosition}
            onChange={(e) => setNullsPosition(e.target.value as typeof nullsPosition)}
            className="h-7 w-full rounded-md border border-zinc-200 bg-white px-2 text-[10px] text-zinc-700 focus:outline-none"
          >
            <option value="last">Last</option>
            <option value="first">First</option>
          </select>
        </FieldGroup>
      </div>
    </div>
  );
}

/* ── Summarize Node Params ── */
function SummarizeNodeParams() {
  const [groupBy, setGroupBy] = useState("");
  const [aggregations, setAggregations] = useState([
    { id: "a1", field: "", operation: "count", alias: "count" },
  ]);

  const operations = [
    { value: "count", label: "Count" },
    { value: "sum", label: "Sum" },
    { value: "avg", label: "Average" },
    { value: "min", label: "Min" },
    { value: "max", label: "Max" },
    { value: "concat", label: "Concatenate" },
    { value: "first", label: "First" },
    { value: "last", label: "Last" },
    { value: "count_unique", label: "Count Unique" },
  ];

  const addAgg = () =>
    setAggregations((a) => [...a, { id: `a${Date.now()}`, field: "", operation: "count", alias: "" }]);
  const removeAgg = (id: string) => setAggregations((a) => a.filter((aa) => aa.id !== id));
  const updateAgg = (id: string, key: string, val: string) =>
    setAggregations((a) => a.map((aa) => (aa.id === id ? { ...aa, [key]: val } : aa)));

  return (
    <div className="space-y-3">
      <FieldGroup label="Group By" description="Fields to group items by (comma-separated). Leave empty for one group.">
        <input
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          placeholder="e.g. category, region"
          className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 font-mono focus:outline-none transition-all"
        />
      </FieldGroup>

      <div className="space-y-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Aggregations</p>
        {aggregations.map((agg) => (
          <div key={agg.id} className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 space-y-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              <input
                value={agg.field}
                onChange={(e) => updateAgg(agg.id, "field", e.target.value)}
                placeholder="field"
                className="h-6 rounded border border-zinc-200 bg-white px-2 text-[10px] font-mono text-zinc-700 focus:outline-none"
              />
              <select
                value={agg.operation}
                onChange={(e) => updateAgg(agg.id, "operation", e.target.value)}
                className="h-6 rounded border border-zinc-200 bg-white px-1 text-[10px] text-zinc-700 focus:outline-none"
              >
                {operations.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <input
                  value={agg.alias}
                  onChange={(e) => updateAgg(agg.id, "alias", e.target.value)}
                  placeholder="alias"
                  className="h-6 flex-1 rounded border border-zinc-200 bg-white px-2 text-[10px] font-mono text-zinc-700 focus:outline-none"
                />
                {aggregations.length > 1 && (
                  <button onClick={() => removeAgg(agg.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                    <XCircle size={10} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={addAgg}
          className="flex items-center gap-1 rounded-md border border-dashed border-zinc-300 px-3 py-1 text-[10px] text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-all w-full justify-center"
        >
          <Plus size={10} /> Add aggregation
        </button>
      </div>
    </div>
  );
}

/* ── Compare Datasets Node Params ── */
function CompareNodeParams() {
  const [matchField, setMatchField] = useState("id");
  const [compareMode, setCompareMode] = useState("full_diff");
  const [compareFields, setCompareFields] = useState("");

  const modes = [
    { value: "full_diff", label: "Full Diff", desc: "All categories", color: "text-zinc-700" },
    { value: "added", label: "Added", desc: "New items in B", color: "text-green-600" },
    { value: "removed", label: "Removed", desc: "Missing from B", color: "text-red-600" },
    { value: "changed", label: "Changed", desc: "Modified items", color: "text-amber-600" },
    { value: "unchanged", label: "Unchanged", desc: "Identical items", color: "text-zinc-400" },
  ];

  return (
    <div className="space-y-3">
      <FieldGroup label="Match By Field" description="Unique key to identify items across datasets">
        <input
          value={matchField}
          onChange={(e) => setMatchField(e.target.value)}
          placeholder="id"
          className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 font-mono focus:outline-none transition-all"
        />
      </FieldGroup>

      <FieldGroup label="Output Mode">
        <div className="space-y-1">
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => setCompareMode(m.value)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border px-3 py-1.5 text-left transition-all",
                compareMode === m.value
                  ? "border-pink-300 bg-pink-50/80 ring-1 ring-pink-200"
                  : "border-zinc-200 hover:border-zinc-300"
              )}
            >
              <div
                className={cn(
                  "h-2.5 w-2.5 rounded-full border-2 flex-shrink-0 transition-all",
                  compareMode === m.value ? "border-pink-500 bg-pink-500" : "border-zinc-300"
                )}
              />
              <span className={cn("text-[10px] font-medium", compareMode === m.value ? m.color : "text-zinc-500")}>
                {m.label}
              </span>
              <span className="text-[9px] text-zinc-400 ml-auto">{m.desc}</span>
            </button>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Compare Fields" description="Specific fields to check for changes (comma-separated, empty = all)">
        <input
          value={compareFields}
          onChange={(e) => setCompareFields(e.target.value)}
          placeholder="name, email, status"
          className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 font-mono focus:outline-none transition-all"
        />
      </FieldGroup>

      <div className="rounded-md border border-zinc-200 bg-zinc-50/50 p-2.5">
        <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Comparison Flow</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded border border-zinc-200 bg-white p-1.5 text-center">
            <span className="text-[9px] text-zinc-500">Dataset A</span>
          </div>
          <span className="text-[10px] text-zinc-400">↔</span>
          <div className="flex-1 rounded border border-zinc-200 bg-white p-1.5 text-center">
            <span className="text-[9px] text-zinc-500">Dataset B</span>
          </div>
          <span className="text-[10px] text-zinc-400">→</span>
          <div className="flex-1 rounded border border-pink-200 bg-pink-50 p-1.5 text-center">
            <span className="text-[9px] text-pink-600 font-medium">Diff</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Edit Fields Node Params ── */
function EditFieldsParams() {
  const [mode, setMode] = useState<"set" | "rename" | "remove">("set");
  const [fields, setFields] = useState([{ id: "ef1", key: "", value: "" }]);
  const [renameFields, setRenameFields] = useState([{ id: "rf1", from: "", to: "" }]);
  const [removeFields, setRemoveFields] = useState([{ id: "rm1", field: "" }]);

  const addField = () => setFields((f) => [...f, { id: `ef${Date.now()}`, key: "", value: "" }]);
  const addRename = () => setRenameFields((f) => [...f, { id: `rf${Date.now()}`, from: "", to: "" }]);
  const addRemove = () => setRemoveFields((f) => [...f, { id: `rm${Date.now()}`, field: "" }]);

  return (
    <div className="space-y-3">
      <FieldGroup label="Operation">
        <div className="grid grid-cols-3 gap-1">
          {(["set", "rename", "remove"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded-lg border px-2 py-1.5 text-[10px] font-medium transition-all text-center capitalize",
                mode === m ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
              )}
            >
              {m === "set" ? "Set / Add" : m === "rename" ? "Rename" : "Remove"}
            </button>
          ))}
        </div>
      </FieldGroup>

      {mode === "set" && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Fields to Set</p>
          {fields.map((f) => (
            <div key={f.id} className="flex items-center gap-1.5">
              <input
                value={f.key}
                onChange={(e) => setFields((flds) => flds.map((ff) => (ff.id === f.id ? { ...ff, key: e.target.value } : ff)))}
                placeholder="field name"
                className="h-7 flex-1 rounded border border-zinc-200 bg-white px-2 text-[10px] font-mono text-zinc-700 focus:outline-none"
              />
              <span className="text-[9px] text-zinc-300">=</span>
              <input
                value={f.value}
                onChange={(e) => setFields((flds) => flds.map((ff) => (ff.id === f.id ? { ...ff, value: e.target.value } : ff)))}
                placeholder="value or expression"
                className="h-7 flex-1 rounded border border-zinc-200 bg-white px-2 text-[10px] font-mono text-zinc-700 focus:outline-none"
              />
              {fields.length > 1 && (
                <button
                  onClick={() => setFields((flds) => flds.filter((ff) => ff.id !== f.id))}
                  className="text-zinc-300 hover:text-red-500 transition-colors"
                >
                  <XCircle size={10} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addField}
            className="flex items-center gap-1 rounded-md border border-dashed border-zinc-300 px-3 py-1 text-[10px] text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-all w-full justify-center"
          >
            <Plus size={10} /> Add field
          </button>
        </div>
      )}

      {mode === "rename" && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Fields to Rename</p>
          {renameFields.map((f) => (
            <div key={f.id} className="flex items-center gap-1.5">
              <input
                value={f.from}
                onChange={(e) => setRenameFields((flds) => flds.map((ff) => (ff.id === f.id ? { ...ff, from: e.target.value } : ff)))}
                placeholder="current name"
                className="h-7 flex-1 rounded border border-zinc-200 bg-white px-2 text-[10px] font-mono text-zinc-700 focus:outline-none"
              />
              <span className="text-[9px] text-zinc-300">→</span>
              <input
                value={f.to}
                onChange={(e) => setRenameFields((flds) => flds.map((ff) => (ff.id === f.id ? { ...ff, to: e.target.value } : ff)))}
                placeholder="new name"
                className="h-7 flex-1 rounded border border-zinc-200 bg-white px-2 text-[10px] font-mono text-zinc-700 focus:outline-none"
              />
              {renameFields.length > 1 && (
                <button
                  onClick={() => setRenameFields((flds) => flds.filter((ff) => ff.id !== f.id))}
                  className="text-zinc-300 hover:text-red-500 transition-colors"
                >
                  <XCircle size={10} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addRename}
            className="flex items-center gap-1 rounded-md border border-dashed border-zinc-300 px-3 py-1 text-[10px] text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-all w-full justify-center"
          >
            <Plus size={10} /> Add rename
          </button>
        </div>
      )}

      {mode === "remove" && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Fields to Remove</p>
          {removeFields.map((f) => (
            <div key={f.id} className="flex items-center gap-1.5">
              <input
                value={f.field}
                onChange={(e) => setRemoveFields((flds) => flds.map((ff) => (ff.id === f.id ? { ...ff, field: e.target.value } : ff)))}
                placeholder="field name"
                className="h-7 flex-1 rounded border border-zinc-200 bg-white px-2 text-[10px] font-mono text-zinc-700 focus:outline-none"
              />
              {removeFields.length > 1 && (
                <button
                  onClick={() => setRemoveFields((flds) => flds.filter((ff) => ff.id !== f.id))}
                  className="text-zinc-300 hover:text-red-500 transition-colors"
                >
                  <XCircle size={10} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addRemove}
            className="flex items-center gap-1 rounded-md border border-dashed border-zinc-300 px-3 py-1 text-[10px] text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-all w-full justify-center"
          >
            <Plus size={10} /> Add field
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Form Builder Params ── */
function FormBuilderParams({ nodeName }: { nodeName: string }) {
  const [fields, setFields] = useState([
    { id: "f1", type: "text", label: "Full Name", required: true, placeholder: "John Doe" },
    { id: "f2", type: "email", label: "Email", required: true, placeholder: "john@example.com" },
    { id: "f3", type: "textarea", label: "Message", required: false, placeholder: "Tell us more…" },
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const fieldTypes = ["text", "email", "number", "textarea", "select", "checkbox", "date", "file", "phone", "url", "password", "hidden"];

  const addField = () => setFields(f => [...f, { id: `f${Date.now()}`, type: "text", label: "New Field", required: false, placeholder: "" }]);
  const removeField = (id: string) => setFields(f => f.filter(ff => ff.id !== id));
  const updateField = (id: string, key: string, val: unknown) => setFields(f => f.map(ff => ff.id === id ? { ...ff, [key]: val } : ff));

  return (
    <div className="space-y-3">
      {nodeName === "Form Trigger" && (
        <div className="space-y-2">
          <FieldGroup label="Form title">
            <input type="text" defaultValue="Contact Form" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none transition-all" />
          </FieldGroup>
          <FieldGroup label="Submit button text">
            <input type="text" defaultValue="Submit" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none transition-all" />
          </FieldGroup>
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Form Fields</p>
          <button onClick={() => setShowPreview(p => !p)} className="text-[9px] text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-0.5">
            <Eye size={9} /> {showPreview ? "Hide" : "Preview"}
          </button>
        </div>

        <div className="space-y-1">
          {fields.map((f, i) => (
            <div key={f.id} className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 group">
              <span className="cursor-grab text-zinc-300 hover:text-zinc-500">⠿</span>
              <select value={f.type} onChange={e => updateField(f.id, "type", e.target.value)} className="h-6 rounded border border-zinc-100 bg-zinc-50 px-1 text-[9px] text-zinc-500 w-16 focus:outline-none">
                {fieldTypes.map(t => <option key={t}>{t}</option>)}
              </select>
              <input value={f.label} onChange={e => updateField(f.id, "label", e.target.value)} className="flex-1 h-6 border-0 bg-transparent text-[11px] text-zinc-700 font-medium focus:outline-none min-w-0" />
              <button onClick={() => updateField(f.id, "required", !f.required)} className={cn("text-[8px] font-bold px-1 rounded", f.required ? "text-red-500 bg-red-50" : "text-zinc-300 hover:text-zinc-500")}>
                {f.required ? "REQ" : "OPT"}
              </button>
              <button onClick={() => removeField(f.id)} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>

        <button onClick={addField} className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-200 py-1.5 text-[10px] text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-colors">
          <Plus size={10} /> Add field
        </button>
      </div>

      {showPreview && (
        <div className="rounded-lg border border-cyan-200 bg-white p-3 space-y-2">
          <p className="text-[11px] font-semibold text-zinc-700 mb-2">Form Preview</p>
          {fields.map(f => (
            <div key={f.id}>
              <label className="text-[10px] text-zinc-500 font-medium">{f.label} {f.required && <span className="text-red-400">*</span>}</label>
              {f.type === "textarea" ? (
                <textarea rows={2} placeholder={f.placeholder} className="mt-0.5 w-full rounded border border-zinc-200 px-2 py-1 text-[11px] resize-none focus:outline-none" />
              ) : f.type === "checkbox" ? (
                <div className="mt-0.5 flex items-center gap-1.5"><input type="checkbox" className="rounded" /><span className="text-[10px] text-zinc-500">{f.label}</span></div>
              ) : f.type === "select" ? (
                <select className="mt-0.5 h-7 w-full rounded border border-zinc-200 px-2 text-[11px] focus:outline-none"><option>Option 1</option></select>
              ) : (
                <input type={f.type} placeholder={f.placeholder} className="mt-0.5 h-7 w-full rounded border border-zinc-200 px-2 text-[11px] focus:outline-none" />
              )}
            </div>
          ))}
          <button className="mt-1 w-full rounded-md bg-cyan-600 py-1.5 text-[11px] font-medium text-white hover:bg-cyan-700 transition-colors">Submit</button>
        </div>
      )}

      <FieldGroup label="On submit" description="What to show after form submission">
        <select defaultValue="message" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
          <option value="message">Show success message</option>
          <option value="redirect">Redirect to URL</option>
          <option value="form">Show another form</option>
        </select>
      </FieldGroup>
    </div>
  );
}

/* ── Chat Trigger Params ── */
function ChatTriggerParams() {
  const [showPreview, setShowPreview] = useState(false);
  const chatUrl = "https://app.flowholt.com/chat/wf-abc123";
  const mockMessages = [
    { role: "user" as const, text: "Hi, I need help with my order" },
    { role: "assistant" as const, text: "Hello! I'd be happy to help. Could you share your order ID?" },
    { role: "user" as const, text: "It's #12345" },
  ];

  return (
    <div className="space-y-3">
      <FieldGroup label="Welcome message" description="First message shown to users">
        <textarea rows={2} defaultValue="Hi! How can I help you today?" className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-700 focus:outline-none transition-all resize-none" />
      </FieldGroup>

      <FieldGroup label="Chat URL" description="Public URL for this chat interface">
        <div className="flex items-center gap-1.5 rounded-md border border-purple-200 bg-purple-50 px-2.5 py-1.5">
          <code className="text-[10px] font-mono text-purple-700 flex-1 truncate">{chatUrl}</code>
          <button className="text-purple-500 hover:text-purple-700"><Copy size={10} /></button>
        </div>
      </FieldGroup>

      <FieldGroup label="Authentication">
        <select defaultValue="none" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
          <option value="none">None (public)</option>
          <option value="basic">Basic Auth</option>
          <option value="header">Header Auth</option>
          <option value="user">FlowHolt User Auth</option>
        </select>
      </FieldGroup>

      <FieldGroup label="Session timeout">
        <select defaultValue="7d" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
          <option value="1h">1 hour</option><option value="24h">24 hours</option><option value="7d">7 days</option><option value="30d">30 days</option>
        </select>
      </FieldGroup>

      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Chat Preview</p>
        <button onClick={() => setShowPreview(p => !p)} className="text-[9px] text-purple-600 hover:text-purple-700 font-medium flex items-center gap-0.5">
          <Eye size={9} /> {showPreview ? "Hide" : "Show"}
        </button>
      </div>

      {showPreview && (
        <div className="rounded-lg border border-purple-200 bg-zinc-900 overflow-hidden">
          <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-[10px] font-medium text-white">FlowHolt Assistant</span>
            <span className="ml-auto text-[8px] text-zinc-500">Online</span>
          </div>
          <div className="p-3 space-y-2 max-h-40 overflow-y-auto">
            {mockMessages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("rounded-lg px-2.5 py-1.5 max-w-[80%] text-[10px]", m.role === "user" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-300")}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="px-3 py-2 border-t border-zinc-800 flex items-center gap-2">
            <input placeholder="Type a message…" className="flex-1 h-7 rounded-md bg-zinc-800 border border-zinc-700 px-2 text-[10px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none" />
            <button className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-600 text-white hover:bg-purple-700"><Send size={10} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── RSS Feed Trigger Params ── */
function RssTriggerParams() {
  const [feedUrl, setFeedUrl] = useState("");
  const [pollInterval, setPollInterval] = useState("15m");
  const [maxItems, setMaxItems] = useState("10");
  const [outputFields, setOutputFields] = useState<string[]>(["title", "link", "description", "pubDate"]);

  const toggleField = (f: string) => setOutputFields(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  return (
    <div className="space-y-3">
      <FieldGroup label="Feed URL" description="RSS or Atom feed URL to monitor">
        <input
          type="url"
          value={feedUrl}
          onChange={e => setFeedUrl(e.target.value)}
          placeholder="https://blog.example.com/feed.xml"
          className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
        />
      </FieldGroup>

      <FieldGroup label="Poll interval" description="How often to check for new items">
        <select value={pollInterval} onChange={e => setPollInterval(e.target.value)} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
          <option value="1m">Every 1 minute</option>
          <option value="5m">Every 5 minutes</option>
          <option value="15m">Every 15 minutes</option>
          <option value="30m">Every 30 minutes</option>
          <option value="1h">Every hour</option>
          <option value="6h">Every 6 hours</option>
          <option value="12h">Every 12 hours</option>
          <option value="24h">Every 24 hours</option>
        </select>
      </FieldGroup>

      <FieldGroup label="Max items per poll" description="Limit items returned per poll cycle">
        <input
          type="number"
          value={maxItems}
          onChange={e => setMaxItems(e.target.value)}
          min="1"
          max="100"
          className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none transition-all"
        />
      </FieldGroup>

      <FieldGroup label="Output fields" description="Select which fields to include">
        <div className="flex flex-wrap gap-1.5">
          {["title", "link", "description", "pubDate", "author", "category", "guid", "content"].map(f => (
            <button
              key={f}
              onClick={() => toggleField(f)}
              className={cn(
                "rounded-md px-2 py-1 text-[10px] font-medium transition-all border",
                outputFields.includes(f) ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:text-zinc-600"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </FieldGroup>

      {feedUrl && (
        <div className="rounded-md border border-orange-200 bg-orange-50 p-2.5">
          <p className="text-[9px] font-semibold text-orange-600 uppercase tracking-wider mb-1">Feed Preview</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-zinc-500 w-12">URL:</span>
              <code className="text-[9px] font-mono text-orange-700 truncate flex-1">{feedUrl}</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-zinc-500 w-12">Interval:</span>
              <span className="text-[9px] text-zinc-700">{pollInterval}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-zinc-500 w-12">Fields:</span>
              <span className="text-[9px] text-zinc-700">{outputFields.join(", ")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Vector Store Params ── */
function VectorStoreParams() {
  const [operation, setOperation] = useState<"search" | "insert" | "delete">("search");
  const [kbId, setKbId] = useState("");
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState("5");

  return (
    <div className="space-y-3">
      <FieldGroup label="Operation">
        <select value={operation} onChange={e => setOperation(e.target.value as typeof operation)} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
          <option value="search">Search (Get Many)</option>
          <option value="insert">Insert Documents</option>
          <option value="delete">Delete</option>
        </select>
      </FieldGroup>

      <FieldGroup label="Knowledge Base ID">
        <input value={kbId} onChange={e => setKbId(e.target.value)} placeholder="kb-..." className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none transition-all" />
      </FieldGroup>

      {operation === "search" && (
        <>
          <FieldGroup label="Search Query">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="What is..." className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition-all" />
          </FieldGroup>
          <FieldGroup label="Top K Results">
            <input type="number" value={topK} onChange={e => setTopK(e.target.value)} min="1" max="50" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none transition-all" />
          </FieldGroup>
        </>
      )}

      {operation === "insert" && (
        <FieldGroup label="Content Field" description="Field name containing text to embed">
          <input defaultValue="content" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none transition-all" />
        </FieldGroup>
      )}
    </div>
  );
}

/* ── Knowledge Search Params ── */
function KnowledgeSearchParams() {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState("5");
  const [outputFormat, setOutputFormat] = useState("chunks");

  return (
    <div className="space-y-3">
      <FieldGroup label="Knowledge Base ID">
        <input placeholder="kb-..." className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none transition-all" />
      </FieldGroup>

      <FieldGroup label="Query" description="Search query (supports expressions)">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="{{ $json.question }}" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 placeholder:text-zinc-400 font-mono focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all" />
      </FieldGroup>

      <FieldGroup label="Max Results">
        <input type="number" value={topK} onChange={e => setTopK(e.target.value)} min="1" max="50" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none transition-all" />
      </FieldGroup>

      <FieldGroup label="Output Format">
        <select value={outputFormat} onChange={e => setOutputFormat(e.target.value)} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
          <option value="chunks">Individual Chunks</option>
          <option value="combined">Combined Text</option>
          <option value="json">JSON with Metadata</option>
        </select>
      </FieldGroup>

      <FieldGroup label="Summarize Results">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="rounded border-zinc-300" />
          <span className="text-[11px] text-zinc-600">Use LLM to summarize chunks into a single answer</span>
        </label>
      </FieldGroup>
    </div>
  );
}

/* ── MCP Client Tool Params ── */
function MCPClientToolParams() {
  const [transport, setTransport] = useState("sse");
  const [endpoint, setEndpoint] = useState("");
  const [auth, setAuth] = useState("none");
  const [authToken, setAuthToken] = useState("");
  const [toolSelection, setToolSelection] = useState("all");
  const [selectedTools, setSelectedTools] = useState("");
  const [timeout, setTimeout] = useState("30000");

  return (
    <div className="space-y-3">
      <FieldGroup label="Server Transport">
        <select value={transport} onChange={e => setTransport(e.target.value)} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
          <option value="sse">SSE (Server-Sent Events)</option>
          <option value="streamable_http">Streamable HTTP</option>
        </select>
      </FieldGroup>

      <FieldGroup label="MCP Endpoint URL">
        <input value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="https://mcp.example.com/mcp" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 placeholder:text-zinc-400 font-mono focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all" />
      </FieldGroup>

      <FieldGroup label="Authentication">
        <select value={auth} onChange={e => setAuth(e.target.value)} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
          <option value="none">None</option>
          <option value="bearer">Bearer Token</option>
          <option value="header">Header Auth</option>
          <option value="oauth2">OAuth2</option>
        </select>
      </FieldGroup>

      {auth === "bearer" && (
        <FieldGroup label="Bearer Token">
          <input type="password" value={authToken} onChange={e => setAuthToken(e.target.value)} placeholder="sk-..." className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 placeholder:text-zinc-400 font-mono focus:outline-none transition-all" />
        </FieldGroup>
      )}

      <FieldGroup label="Tools to Include">
        <select value={toolSelection} onChange={e => setToolSelection(e.target.value)} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
          <option value="all">All Tools</option>
          <option value="selected">Selected Only</option>
          <option value="except">All Except</option>
        </select>
      </FieldGroup>

      {toolSelection !== "all" && (
        <FieldGroup label={toolSelection === "selected" ? "Tools to Include" : "Tools to Exclude"}>
          <input value={selectedTools} onChange={e => setSelectedTools(e.target.value)} placeholder="tool_a, tool_b, ..." className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none transition-all" />
        </FieldGroup>
      )}

      <FieldGroup label="Timeout (ms)">
        <input type="number" value={timeout} onChange={e => setTimeout(e.target.value)} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none transition-all" />
      </FieldGroup>

      {endpoint && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-2.5">
          <p className="text-[9px] font-semibold text-blue-600 uppercase tracking-wider mb-1">Connection</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              <code className="text-[9px] font-mono text-blue-700 truncate flex-1">{endpoint}</code>
            </div>
            <p className="text-[8px] text-blue-500">Transport: {transport === "sse" ? "SSE" : "Streamable HTTP"} · Auth: {auth}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── MCP Server Trigger Params ── */
function MCPServerTriggerParams() {
  const [path, setPath] = useState("/mcp/my-workflow");
  const [auth, setAuth] = useState("none");
  const [authToken, setAuthToken] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="space-y-3">
      <FieldGroup label="MCP URL Path">
        <input value={path} onChange={e => setPath(e.target.value)} placeholder="/mcp/custom-path" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 placeholder:text-zinc-400 font-mono focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition-all" />
      </FieldGroup>

      <FieldGroup label="Authentication">
        <select value={auth} onChange={e => setAuth(e.target.value)} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
          <option value="none">None</option>
          <option value="bearer">Bearer Auth</option>
          <option value="header">Header Auth</option>
        </select>
      </FieldGroup>

      {auth === "bearer" && (
        <FieldGroup label="Expected Token">
          <input type="password" value={authToken} onChange={e => setAuthToken(e.target.value)} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 font-mono focus:outline-none transition-all" />
        </FieldGroup>
      )}

      <FieldGroup label="Server Description">
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what tools this MCP server exposes..." rows={3} className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition-all resize-none" />
      </FieldGroup>

      <div className="rounded-md border border-violet-200 bg-violet-50 p-2.5">
        <p className="text-[9px] font-semibold text-violet-600 uppercase tracking-wider mb-1">MCP Endpoints</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="rounded px-1.5 py-0.5 text-[8px] font-bold bg-green-100 text-green-700">TEST</span>
            <code className="text-[9px] font-mono text-violet-700 truncate flex-1">http://localhost:8001{path}</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded px-1.5 py-0.5 text-[8px] font-bold bg-blue-100 text-blue-700">PROD</span>
            <code className="text-[9px] font-mono text-violet-700 truncate flex-1">https://api.flowholt.com{path}</code>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Human Approval Params ── */
function HumanApprovalParams() {
  const [prompt, setPrompt] = useState("Please review and approve this action.");
  const [contextFields, setContextFields] = useState("");
  const [timeoutMin, setTimeoutMin] = useState("60");
  const [timeoutAction, setTimeoutAction] = useState("reject");
  const [notify, setNotify] = useState("in_app");

  return (
    <div className="space-y-3">
      <FieldGroup label="Approval Prompt" description="Message shown to the reviewer">
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all resize-none" />
      </FieldGroup>

      <FieldGroup label="Context Fields" description="Data fields to show reviewer (comma-separated)">
        <input value={contextFields} onChange={e => setContextFields(e.target.value)} placeholder="user_email, amount, action" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none transition-all" />
      </FieldGroup>

      <FieldGroup label="Timeout (minutes)" description="0 = no timeout">
        <input type="number" value={timeoutMin} onChange={e => setTimeoutMin(e.target.value)} min="0" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none transition-all" />
      </FieldGroup>

      <FieldGroup label="On Timeout">
        <select value={timeoutAction} onChange={e => setTimeoutAction(e.target.value)} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
          <option value="reject">Reject (stop execution)</option>
          <option value="approve">Approve (continue)</option>
          <option value="fallback">Skip to fallback branch</option>
        </select>
      </FieldGroup>

      <FieldGroup label="Notification Channel">
        <select value={notify} onChange={e => setNotify(e.target.value)} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
          <option value="in_app">In-App Only</option>
          <option value="email">Email + In-App</option>
          <option value="slack">Slack + In-App</option>
        </select>
      </FieldGroup>

      <div className="rounded-md border border-amber-200 bg-amber-50 p-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-[9px] font-semibold text-amber-700">Execution will pause here until approved</p>
        </div>
        <p className="text-[8px] text-amber-600 mt-1">Timeout: {timeoutMin === "0" ? "None" : `${timeoutMin}min → ${timeoutAction}`} · Notify: {notify.replace("_", "-")}</p>
      </div>
    </div>
  );
}

/* ── Agent Evaluation Params ── */
function AgentEvaluationParams() {
  const [evalMode, setEvalMode] = useState("comparison");
  const [outputField, setOutputField] = useState("answer");
  const [expectedField, setExpectedField] = useState("expected");
  const [threshold, setThreshold] = useState("0.8");
  const [pattern, setPattern] = useState("");
  const [keywords, setKeywords] = useState("");
  const [judgePrompt, setJudgePrompt] = useState("");

  return (
    <div className="space-y-3">
      <FieldGroup label="Evaluation Mode">
        <select value={evalMode} onChange={e => setEvalMode(e.target.value)} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all">
          <option value="comparison">Golden Dataset Comparison</option>
          <option value="llm_judge">LLM-as-Judge</option>
          <option value="regex">Regex Match</option>
          <option value="keywords">Contains Keywords</option>
        </select>
      </FieldGroup>

      <FieldGroup label="Agent Output Field">
        <input value={outputField} onChange={e => setOutputField(e.target.value)} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 font-mono focus:outline-none transition-all" />
      </FieldGroup>

      {evalMode === "comparison" && (
        <>
          <FieldGroup label="Expected Output Field">
            <input value={expectedField} onChange={e => setExpectedField(e.target.value)} className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 font-mono focus:outline-none transition-all" />
          </FieldGroup>
          <FieldGroup label="Similarity Threshold" description="0-1 (Jaccard word overlap)">
            <input type="number" value={threshold} onChange={e => setThreshold(e.target.value)} min="0" max="1" step="0.05" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none transition-all" />
          </FieldGroup>
        </>
      )}

      {evalMode === "regex" && (
        <FieldGroup label="Pattern (regex)">
          <input value={pattern} onChange={e => setPattern(e.target.value)} placeholder="^\\d{3}-\\d{4}$" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 placeholder:text-zinc-400 font-mono focus:outline-none transition-all" />
        </FieldGroup>
      )}

      {evalMode === "keywords" && (
        <FieldGroup label="Keywords (comma-separated)">
          <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="python, javascript, api" className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none transition-all" />
        </FieldGroup>
      )}

      {evalMode === "llm_judge" && (
        <FieldGroup label="Judge System Prompt">
          <textarea value={judgePrompt} onChange={e => setJudgePrompt(e.target.value)} rows={4} placeholder="You are an evaluation judge. Rate the answer quality 1-5..." className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none transition-all resize-none" />
        </FieldGroup>
      )}

      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2.5">
        <p className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Evaluation Config</p>
        <div className="space-y-0.5">
          <p className="text-[8px] text-emerald-600">Mode: <span className="font-medium text-emerald-700">{evalMode === "comparison" ? "Golden Dataset" : evalMode === "llm_judge" ? "LLM Judge" : evalMode === "regex" ? "Regex" : "Keywords"}</span></p>
          <p className="text-[8px] text-emerald-600">Output field: <code className="font-mono text-emerald-700">{outputField}</code></p>
          {evalMode === "comparison" && <p className="text-[8px] text-emerald-600">Threshold: {threshold}</p>}
        </div>
      </div>
    </div>
  );
}

/* ── Schedule Builder Params ── */
function ScheduleBuilderParams() {
  const [mode, setMode] = useState<"interval" | "cron" | "specific">("interval");
  const [intervalAmount, setIntervalAmount] = useState("5");
  const [intervalUnit, setIntervalUnit] = useState("minutes");
  const [cronExpression, setCronExpression] = useState("0 9 * * 1-5");
  const [timezone, setTimezone] = useState("UTC");

  const cronPresets = [
    { label: "Every minute", cron: "* * * * *" },
    { label: "Every hour", cron: "0 * * * *" },
    { label: "Daily at 9 AM", cron: "0 9 * * *" },
    { label: "Weekdays at 9 AM", cron: "0 9 * * 1-5" },
    { label: "Weekly on Monday", cron: "0 9 * * 1" },
    { label: "Monthly on 1st", cron: "0 0 1 * *" },
  ];

  const describeCron = (c: string): string => {
    const parts = c.split(" ");
    if (parts.length !== 5) return "Invalid cron expression";
    const preset = cronPresets.find(p => p.cron === c);
    if (preset) return preset.label;
    return `Custom: ${c}`;
  };

  const nextRuns = [
    "Mon, Jan 6, 2025 09:00 UTC",
    "Tue, Jan 7, 2025 09:00 UTC",
    "Wed, Jan 8, 2025 09:00 UTC",
    "Thu, Jan 9, 2025 09:00 UTC",
    "Fri, Jan 10, 2025 09:00 UTC",
  ];

  return (
    <div className="space-y-3">
      {/* Mode selector */}
      <FieldGroup label="Trigger mode">
        <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5">
          {([
            { key: "interval", label: "Interval" },
            { key: "cron", label: "Cron" },
            { key: "specific", label: "Specific Times" },
          ] as const).map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={cn("flex-1 rounded-md px-2.5 py-1.5 text-[10px] font-medium transition-all",
                mode === m.key ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </FieldGroup>

      {/* Interval mode */}
      {mode === "interval" && (
        <>
          <FieldGroup label="Run every">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={intervalAmount}
                onChange={e => setIntervalAmount(e.target.value)}
                min={1}
                className="h-8 w-20 rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
              />
              <select
                value={intervalUnit}
                onChange={e => setIntervalUnit(e.target.value)}
                className="h-8 flex-1 rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all"
              >
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
              </select>
            </div>
          </FieldGroup>
          <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
            <p className="text-[10px] text-blue-700">Runs every {intervalAmount} {intervalUnit}</p>
          </div>
        </>
      )}

      {/* Cron mode */}
      {mode === "cron" && (
        <>
          <FieldGroup label="Cron expression" description="Standard 5-part cron: min hour day month weekday">
            <input
              value={cronExpression}
              onChange={e => setCronExpression(e.target.value)}
              className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] font-mono text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
              placeholder="* * * * *"
            />
          </FieldGroup>

          <FieldGroup label="Quick presets">
            <div className="flex flex-wrap gap-1">
              {cronPresets.map(p => (
                <button
                  key={p.cron}
                  onClick={() => setCronExpression(p.cron)}
                  className={cn("rounded-md border px-2 py-1 text-[9px] font-medium transition-all",
                    cronExpression === p.cron
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </FieldGroup>

          <div className="rounded-lg bg-green-50 border border-green-100 px-3 py-2">
            <p className="text-[10px] font-medium text-green-700">{describeCron(cronExpression)}</p>
            <div className="flex items-center gap-1 mt-1">
              {cronExpression.split(" ").map((part, i) => (
                <span key={i} className="rounded bg-green-100 px-1.5 py-0.5 text-[8px] font-mono text-green-800">{part}</span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Specific times mode */}
      {mode === "specific" && (
        <FieldGroup label="Run at specific times">
          <div className="space-y-1.5">
            {["09:00", "12:00", "17:00"].map((time, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="time" defaultValue={time} className="h-8 flex-1 rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all" />
                <select defaultValue={i === 0 ? "weekdays" : "daily"} className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-[10px] text-zinc-600 focus:outline-none">
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekends">Weekends</option>
                  <option value="monday">Monday</option>
                </select>
                <button className="text-zinc-300 hover:text-red-400 transition-colors"><Trash2 size={11} /></button>
              </div>
            ))}
            <button className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors mt-1">
              <Plus size={10} /> Add time
            </button>
          </div>
        </FieldGroup>
      )}

      {/* Timezone */}
      <FieldGroup label="Timezone">
        <select
          value={timezone}
          onChange={e => setTimezone(e.target.value)}
          className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-700 focus:outline-none transition-all"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">America/New_York (EST)</option>
          <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
          <option value="Europe/London">Europe/London (GMT)</option>
          <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
          <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
        </select>
      </FieldGroup>

      {/* Next 5 runs preview */}
      <div>
        <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Next 5 runs</p>
        <div className="rounded-lg border border-zinc-100 bg-zinc-50 divide-y divide-zinc-100">
          {nextRuns.map((run, i) => (
            <div key={i} className="flex items-center gap-2 px-2.5 py-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-200 text-[7px] font-bold text-zinc-500">{i + 1}</span>
              <span className="text-[10px] text-zinc-500 font-mono">{run}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const expressionVars = [
  { name: "$json", desc: "Current item data" },
  { name: "$json.email", desc: "Email field" },
  { name: "$json.company", desc: "Company name" },
  { name: "$json.score", desc: "Lead score" },
  { name: "$json.title", desc: "Job title" },
  { name: "$json.employees", desc: "Company size" },
  { name: "$input.item", desc: "Input item" },
  { name: "$now", desc: "Current timestamp" },
  { name: "$today", desc: "Today's date" },
  { name: "$vars", desc: "Workspace variables" },
  { name: "$env", desc: "Environment vars" },
  { name: "$execution.id", desc: "Execution ID" },
  { name: "$workflow.id", desc: "Workflow ID" },
  { name: "$node", desc: "Current node reference" },
  { name: "$prevNode", desc: "Previous node reference" },
  { name: "$jmespath(expr, data)", desc: "JMESPath query" },
  { name: "$if(cond, then, else)", desc: "Conditional expression" },
  { name: "$ifEmpty(val, fallback)", desc: "Default if empty" },
  { name: "$lookup(arr, key, val)", desc: "Find in array" },
  { name: "$parseDate(str)", desc: "Parse date string" },
];

function ExpressionFieldWithValidation({ field, onOpenEditor }: { field: NodeField; onOpenEditor: (f: NodeField) => void }) {
  const [value, setValue] = useState(field.value);
  const [showAC, setShowAC] = useState(false);
  const [acQuery, setAcQuery] = useState("");
  const [dropTarget, setDropTarget] = useState(false);

  const isValid = value.startsWith("={{") && value.endsWith("}}") && value.length > 5;
  const hasError = value.includes("={{") && !value.endsWith("}}");
  const resolvedValue = isValid ? value.slice(3, -2).replace("$json.", "") : value;

  const filteredVars = expressionVars.filter(v =>
    !acQuery || v.name.toLowerCase().includes(acQuery.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    if (v.includes("$")) {
      const dollarIdx = v.lastIndexOf("$");
      setAcQuery(v.slice(dollarIdx));
      setShowAC(true);
    } else {
      setShowAC(false);
    }
  };

  const insertVar = (varName: string) => {
    setValue(`={{${varName}}}`);
    setShowAC(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropTarget(false);
    const fieldKey = e.dataTransfer.getData("text/plain");
    if (fieldKey) {
      setValue(`={{ $json.${fieldKey} }}`);
    }
  };

  return (
    <div
      className="relative"
      onDragOver={(e) => { e.preventDefault(); setDropTarget(true); }}
      onDragLeave={() => setDropTarget(false)}
      onDrop={handleDrop}
    >
      <div className={cn(
        "rounded-md border-2 overflow-hidden transition-colors",
        dropTarget ? "border-blue-400 bg-blue-50/20" :
        hasError ? "border-red-300 bg-red-50/20" : isValid ? "border-green-300 bg-green-50/10" : "border-violet-200 bg-violet-50/30"
      )}>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-violet-50 border-b border-violet-100">
          <Braces size={9} className={hasError ? "text-red-500" : "text-violet-500"} />
          <span className="text-[9px] font-medium text-violet-600">Expression</span>
          {isValid && <Check size={8} className="text-green-500" />}
          {hasError && <AlertTriangle size={8} className="text-red-500" />}
          <button
            onClick={() => onOpenEditor(field)}
            className="ml-auto flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-medium text-violet-500 hover:bg-violet-100 transition-colors"
          >
            <Maximize2 size={8} /> Full Editor
          </button>
        </div>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => { if (value.includes("$")) setShowAC(true); }}
          onBlur={() => setTimeout(() => setShowAC(false), 200)}
          className="h-8 w-full bg-transparent px-2 text-[11px] text-violet-800 font-mono outline-none placeholder:text-violet-300"
          placeholder="={{$json.field}}"
        />
        <div className={cn("flex items-center gap-1.5 px-2 py-1 border-t", hasError ? "bg-red-50 border-red-100" : "bg-violet-50/50 border-violet-100")}>
          {hasError ? (
            <>
              <AlertTriangle size={8} className="text-red-500" />
              <span className="text-[8px] text-red-500 font-medium">Missing closing {"}}"} — expression is incomplete</span>
            </>
          ) : (
            <>
              <span className="text-[8px] text-violet-400">Result:</span>
              <span className="text-[9px] text-zinc-600 font-mono truncate">{resolvedValue}</span>
            </>
          )}
        </div>
      </div>

      {/* Autocomplete dropdown */}
      {showAC && filteredVars.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-zinc-200 bg-white shadow-xl max-h-48 overflow-y-auto">
          <div className="px-2 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-100">Variables</div>
          {filteredVars.map((v) => (
            <button
              key={v.name}
              onMouseDown={(e) => { e.preventDefault(); insertVar(v.name); }}
              className="flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-violet-50 transition-colors"
            >
              <code className="text-[10px] text-violet-600 font-mono">{v.name}</code>
              <span className="text-[9px] text-zinc-400 truncate">{v.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FieldGroup({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-zinc-500">{label}</label>
      {description && <p className="mb-1.5 text-[9px] text-zinc-300">{description}</p>}
      {children}
    </div>
  );
}

function ToggleRow({ label, description, enabled, onToggle }: { label: string; description: string; enabled: boolean; onToggle: () => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <div>
        <p className="text-[12px] font-medium text-zinc-700">{label}</p>
        <p className="text-[10px] text-zinc-400">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={cn("relative h-5 w-9 rounded-full transition-colors flex-shrink-0", enabled ? "bg-zinc-900" : "bg-zinc-200")}
      >
        <span className={cn("absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform", enabled && "translate-x-4")} />
      </button>
    </label>
  );
}

