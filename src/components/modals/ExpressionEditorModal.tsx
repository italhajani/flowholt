import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Search, ChevronDown, ChevronRight, Copy, Check, AlertTriangle,
  CheckCircle2, Braces, Hash, AtSign, Zap, Eye, Code2, ArrowRight,
  Clock, Layers, Sparkles, FileJson, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";

/* ── Types ── */
interface ExpressionVariable {
  name: string;
  path: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  value: string;
  node?: string;
}

interface NodeOutput {
  nodeId: string;
  nodeName: string;
  nodeType: "trigger" | "integration" | "ai" | "logic";
  color: string;
  variables: ExpressionVariable[];
}

interface ExpressionEditorModalProps {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange?: (value: string) => void;
  fieldLabel?: string;
  nodeContext?: string;
}

/* ── Mock node outputs for variable picker ── */
const mockNodeOutputs: NodeOutput[] = [
  {
    nodeId: "n1",
    nodeName: "Webhook Trigger",
    nodeType: "trigger",
    color: "bg-green-500",
    variables: [
      { name: "email", path: "$json.email", type: "string", value: '"alex@acme.com"', node: "Webhook Trigger" },
      { name: "name", path: "$json.name", type: "string", value: '"Alex Chen"', node: "Webhook Trigger" },
      { name: "company", path: "$json.company", type: "string", value: '"Acme Corp"', node: "Webhook Trigger" },
      { name: "title", path: "$json.title", type: "string", value: '"VP Engineering"', node: "Webhook Trigger" },
      { name: "employees", path: "$json.employees", type: "number", value: "1200", node: "Webhook Trigger" },
      { name: "source", path: "$json.source", type: "string", value: '"landing_page"', node: "Webhook Trigger" },
      { name: "utm_campaign", path: "$json.utm_campaign", type: "string", value: '"q4_launch"', node: "Webhook Trigger" },
    ],
  },
  {
    nodeId: "n2",
    nodeName: "Enrich Lead Data",
    nodeType: "integration",
    color: "bg-violet-500",
    variables: [
      { name: "fullName", path: "$json.fullName", type: "string", value: '"Alex Chen"', node: "Enrich Lead Data" },
      { name: "company.name", path: "$json.company.name", type: "string", value: '"Acme Corp"', node: "Enrich Lead Data" },
      { name: "company.size", path: "$json.company.size", type: "number", value: "1200", node: "Enrich Lead Data" },
      { name: "company.funding", path: "$json.company.funding", type: "string", value: '"$25M Series B"', node: "Enrich Lead Data" },
      { name: "company.industry", path: "$json.company.industry", type: "string", value: '"SaaS"', node: "Enrich Lead Data" },
      { name: "techStack", path: "$json.techStack", type: "array", value: '["React","Python","AWS"]', node: "Enrich Lead Data" },
      { name: "linkedinUrl", path: "$json.linkedinUrl", type: "string", value: '"linkedin.com/in/alexchen"', node: "Enrich Lead Data" },
      { name: "enrichedAt", path: "$json.enrichedAt", type: "string", value: '"2024-01-15T09:42:01Z"', node: "Enrich Lead Data" },
    ],
  },
  {
    nodeId: "n3",
    nodeName: "Score with AI",
    nodeType: "ai",
    color: "bg-zinc-500",
    variables: [
      { name: "score", path: "$json.score", type: "number", value: "87", node: "Score with AI" },
      { name: "reasons", path: "$json.reasons", type: "array", value: '["Senior title","Large company"]', node: "Score with AI" },
      { name: "confidence", path: "$json.confidence", type: "number", value: "0.92", node: "Score with AI" },
    ],
  },
];

/* ── Built-in expression variables ── */
const builtinVars: ExpressionVariable[] = [
  { name: "$execution.id", path: "$execution.id", type: "string", value: '"exec_abc123"' },
  { name: "$execution.mode", path: "$execution.mode", type: "string", value: '"production"' },
  { name: "$workflow.id", path: "$workflow.id", type: "string", value: '"wf_xyz789"' },
  { name: "$workflow.name", path: "$workflow.name", type: "string", value: '"Lead Scoring"' },
  { name: "$now", path: "$now", type: "string", value: '"2024-01-15T09:42:00Z"' },
  { name: "$today", path: "$today", type: "string", value: '"2024-01-15"' },
  { name: "$vars.environment", path: "$vars.environment", type: "string", value: '"production"' },
  { name: "$runIndex", path: "$runIndex", type: "number", value: "0" },
  { name: "$itemIndex", path: "$itemIndex", type: "number", value: "0" },
];

/* ── Helper functions ── */
const typeColors: Record<string, string> = {
  string: "text-amber-500 bg-amber-500/10",
  number: "text-cyan-500 bg-cyan-500/10",
  boolean: "text-violet-500 bg-violet-500/10",
  object: "text-blue-500 bg-blue-500/10",
  array: "text-green-500 bg-green-500/10",
};

const typeIcons: Record<string, React.ElementType> = {
  string: AtSign,
  number: Hash,
  boolean: Zap,
  object: Braces,
  array: Layers,
};

/* ── Expression highlighting for the editor area ── */
function highlightExpression(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\{\{[^}]*\}\})|(\$json\.[a-zA-Z_.[\]]+)|(\$\w+(?:\.\w+)*)|("(?:[^"\\]|\\.)*")|(\b\d+\.?\d*\b)|(true|false|null)|(>=|<=|===|!==|==|!=|&&|\|\||[+\-*/%<>!])|(\s+)|([^\s[\].()=<>!+\-*/&|,:"{}$]+)/g;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m[1]) parts.push(<span key={i++} className="text-emerald-400 bg-emerald-400/10 rounded px-0.5 font-medium">{m[1]}</span>);
    else if (m[2]) parts.push(<span key={i++} className="text-emerald-300">{m[2]}</span>);
    else if (m[3]) parts.push(<span key={i++} className="text-cyan-400">{m[3]}</span>);
    else if (m[4]) parts.push(<span key={i++} className="text-amber-400">{m[4]}</span>);
    else if (m[5]) parts.push(<span key={i++} className="text-cyan-400">{m[5]}</span>);
    else if (m[6]) parts.push(<span key={i++} className="text-violet-400">{m[6]}</span>);
    else if (m[7]) parts.push(<span key={i++} className="text-pink-400">{m[7]}</span>);
    else parts.push(<span key={i++}>{m[0]}</span>);
  }
  return parts;
}

function evaluateExpression(expr: string): { value: string; type: string; error?: string } {
  // Simulated expression evaluation
  const trimmed = expr.trim();
  if (!trimmed) return { value: "", type: "empty" };
  if (trimmed.startsWith("={{") && trimmed.endsWith("}}")) {
    const inner = trimmed.slice(3, -2).trim();
    // Look up known paths
    for (const nodeOut of mockNodeOutputs) {
      for (const v of nodeOut.variables) {
        if (inner === v.path) return { value: v.value, type: v.type };
      }
    }
    for (const bv of builtinVars) {
      if (inner === bv.path) return { value: bv.value, type: bv.type };
    }
    // Simple comparisons
    if (inner.includes(">=") || inner.includes("<=") || inner.includes("==")) {
      return { value: "true", type: "boolean" };
    }
    // Unknown
    return { value: "[resolved at runtime]", type: "dynamic" };
  }
  // Plain string
  return { value: `"${trimmed}"`, type: "string" };
}

/* ── Main Component ── */
export function ExpressionEditorModal({
  open,
  onClose,
  value,
  onChange,
  fieldLabel = "Expression",
  nodeContext,
}: ExpressionEditorModalProps) {
  const [expr, setExpr] = useState(value);
  const [search, setSearch] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["n1", "n2"]));
  const [showBuiltins, setShowBuiltins] = useState(true);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"variables" | "functions" | "examples">("variables");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const result = evaluateExpression(expr);

  useEffect(() => { setExpr(value); }, [value]);

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const insertVariable = useCallback((path: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      setExpr(`={{${path}}}`);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = expr.substring(0, start);
    const after = expr.substring(end);

    // Auto-wrap in ={{ }} if not already inside
    const isInsideExpression = before.includes("={{") && !before.includes("}}");
    const insertion = isInsideExpression ? path : `={{${path}}}`;
    const newExpr = before + insertion + after;
    setExpr(newExpr);
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + insertion.length;
      ta.focus();
    });
  }, [expr]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(expr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [expr]);

  const handleApply = () => {
    onChange?.(expr);
    onClose();
  };

  const filteredOutputs = mockNodeOutputs.map(no => ({
    ...no,
    variables: no.variables.filter(v =>
      !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.path.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(no => no.variables.length > 0);

  const filteredBuiltins = builtinVars.filter(v =>
    !search || v.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Example expressions ── */
  const examples = [
    { expr: '={{$json.email}}', desc: "Get email from current item" },
    { expr: '={{$json.score >= 70 ? "High" : "Low"}}', desc: "Conditional scoring" },
    { expr: '={{$json.name.toUpperCase()}}', desc: "Transform to uppercase" },
    { expr: '={{$json.items.length}}', desc: "Count array items" },
    { expr: '={{$now}}', desc: "Current timestamp" },
    { expr: '={{$json.price * $json.quantity}}', desc: "Multiply fields" },
    { expr: '={{$json.tags.join(", ")}}', desc: "Join array to string" },
    { expr: '={{$json.data?.nested?.value ?? "default"}}', desc: "Optional chaining + default" },
  ];

  /* ── Built-in functions ── */
  const functions = [
    { name: ".toUpperCase()", desc: "Convert string to uppercase", example: '$json.name.toUpperCase()' },
    { name: ".toLowerCase()", desc: "Convert string to lowercase", example: '$json.email.toLowerCase()' },
    { name: ".trim()", desc: "Remove whitespace from both ends", example: '$json.input.trim()' },
    { name: ".split(sep)", desc: "Split string into array", example: '$json.csv.split(",")' },
    { name: ".join(sep)", desc: "Join array into string", example: '$json.tags.join(", ")' },
    { name: ".length", desc: "Get string or array length", example: '$json.items.length' },
    { name: ".includes(val)", desc: "Check if contains value", example: '$json.email.includes("@")' },
    { name: ".replace(a, b)", desc: "Replace substring", example: '$json.text.replace("old", "new")' },
    { name: "Math.round(n)", desc: "Round to nearest integer", example: 'Math.round($json.score)' },
    { name: "Math.max(a, b)", desc: "Get larger value", example: 'Math.max($json.a, $json.b)' },
    { name: "JSON.stringify(v)", desc: "Convert to JSON string", example: 'JSON.stringify($json.data)' },
    { name: "parseInt(s)", desc: "Parse string to integer", example: 'parseInt($json.count)' },
    { name: "Date.now()", desc: "Current timestamp (ms)", example: 'Date.now()' },
    { name: "encodeURIComponent()", desc: "URL-encode a string", example: 'encodeURIComponent($json.query)' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="" className="max-w-4xl">
      <div className="flex flex-col" style={{ height: "70vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
              <Braces size={14} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Expression Editor</h3>
              <p className="text-[10px] text-zinc-500">{fieldLabel}{nodeContext ? ` · ${nodeContext}` : ""}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
            <X size={16} />
          </button>
        </div>

        {/* Body — 2-column layout */}
        <div className="flex flex-1 min-h-0">
          {/* Left: Variable picker */}
          <div className="w-[320px] border-r border-zinc-200 flex flex-col flex-shrink-0">
            {/* Tab bar */}
            <div className="flex border-b border-zinc-100">
              {(["variables", "functions", "examples"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "flex-1 py-2 text-[11px] font-medium capitalize transition-colors border-b-2",
                    tab === t ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="px-3 py-2 border-b border-zinc-100">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={tab === "variables" ? "Search variables..." : tab === "functions" ? "Search functions..." : "Search examples..."}
                  className="w-full h-7 rounded-md border border-zinc-200 bg-zinc-50 pl-7 pr-3 text-[11px] text-zinc-700 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-900/10"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-1">
              {tab === "variables" && (
                <>
                  {/* Node outputs */}
                  {filteredOutputs.map(no => (
                    <div key={no.nodeId}>
                      <button
                        onClick={() => toggleNode(no.nodeId)}
                        className="flex w-full items-center gap-2 px-3 py-2 hover:bg-zinc-50 transition-colors"
                      >
                        {expandedNodes.has(no.nodeId) ? <ChevronDown size={10} className="text-zinc-400" /> : <ChevronRight size={10} className="text-zinc-400" />}
                        <span className={cn("h-2 w-2 rounded-full flex-shrink-0", no.color)} />
                        <span className="text-[11px] font-medium text-zinc-700">{no.nodeName}</span>
                        <span className="ml-auto text-[9px] text-zinc-400">{no.variables.length}</span>
                      </button>
                      {expandedNodes.has(no.nodeId) && (
                        <div className="ml-7">
                          {no.variables.map(v => {
                            const TypeIcon = typeIcons[v.type] ?? AtSign;
                            return (
                              <button
                                key={v.path}
                                onClick={() => insertVariable(v.path)}
                                className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-emerald-50 rounded-md transition-colors group"
                              >
                                <TypeIcon size={10} className={typeColors[v.type]?.split(" ")[0] ?? "text-zinc-400"} />
                                <span className="text-[11px] text-zinc-700 group-hover:text-emerald-700">{v.name}</span>
                                <span className="ml-auto text-[9px] text-zinc-400 truncate max-w-[100px]">{v.value}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Built-in variables */}
                  <div className="border-t border-zinc-100 mt-1 pt-1">
                    <button
                      onClick={() => setShowBuiltins(o => !o)}
                      className="flex w-full items-center gap-2 px-3 py-2 hover:bg-zinc-50 transition-colors"
                    >
                      {showBuiltins ? <ChevronDown size={10} className="text-zinc-400" /> : <ChevronRight size={10} className="text-zinc-400" />}
                      <Zap size={10} className="text-amber-500" />
                      <span className="text-[11px] font-medium text-zinc-700">Built-in Variables</span>
                      <span className="ml-auto text-[9px] text-zinc-400">{filteredBuiltins.length}</span>
                    </button>
                    {showBuiltins && (
                      <div className="ml-7">
                        {filteredBuiltins.map(v => {
                          const TypeIcon = typeIcons[v.type] ?? AtSign;
                          return (
                            <button
                              key={v.path}
                              onClick={() => insertVariable(v.path)}
                              className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-emerald-50 rounded-md transition-colors group"
                            >
                              <TypeIcon size={10} className={typeColors[v.type]?.split(" ")[0] ?? "text-zinc-400"} />
                              <span className="text-[11px] text-zinc-600 font-mono group-hover:text-emerald-700">{v.name}</span>
                              <span className="ml-auto text-[9px] text-zinc-400 truncate max-w-[80px]">{v.value}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {tab === "functions" && (
                <div className="px-2">
                  {functions
                    .filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.desc.toLowerCase().includes(search.toLowerCase()))
                    .map(f => (
                    <button
                      key={f.name}
                      onClick={() => insertVariable(f.example)}
                      className="flex w-full items-start gap-2 px-2 py-2 hover:bg-zinc-50 rounded-md transition-colors text-left"
                    >
                      <Code2 size={10} className="text-violet-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[11px] font-mono text-zinc-700">{f.name}</span>
                        <p className="text-[10px] text-zinc-400">{f.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {tab === "examples" && (
                <div className="px-2">
                  {examples
                    .filter(e => !search || e.desc.toLowerCase().includes(search.toLowerCase()) || e.expr.toLowerCase().includes(search.toLowerCase()))
                    .map((e, idx) => (
                    <button
                      key={idx}
                      onClick={() => setExpr(e.expr)}
                      className="flex w-full flex-col gap-0.5 px-2 py-2 hover:bg-zinc-50 rounded-md transition-colors text-left"
                    >
                      <span className="text-[10px] text-zinc-500">{e.desc}</span>
                      <code className="text-[11px] font-mono text-emerald-600">{e.expr}</code>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Expression editor + preview */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Expression input area */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 border-b border-zinc-100 flex-shrink-0">
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Expression</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setExpr("")}
                    className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 transition-colors"
                  >
                    <RotateCcw size={9} />
                    Clear
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 transition-colors"
                  >
                    {copied ? <Check size={9} className="text-green-500" /> : <Copy size={9} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Editor with overlay highlighting */}
              <div className="flex-1 relative min-h-0 bg-zinc-900">
                <pre
                  className="absolute inset-0 p-4 font-mono text-[12px] leading-6 text-zinc-100 pointer-events-none overflow-auto whitespace-pre-wrap break-all"
                  aria-hidden
                >
                  {highlightExpression(expr)}
                </pre>
                <textarea
                  ref={textareaRef}
                  value={expr}
                  onChange={e => setExpr(e.target.value)}
                  placeholder='Type expression, e.g. ={{$json.email}}'
                  spellCheck={false}
                  className="absolute inset-0 w-full h-full resize-none p-4 font-mono text-[12px] leading-6 bg-transparent text-transparent caret-zinc-100 outline-none selection:bg-violet-500/30 placeholder:text-zinc-600"
                  style={{ caretColor: "#e4e4e7" }}
                />
              </div>
            </div>

            {/* Live preview panel */}
            <div className="border-t border-zinc-200 flex-shrink-0">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <Eye size={11} className="text-zinc-400" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Preview</span>
                </div>
                {result.error ? (
                  <span className="flex items-center gap-1 text-[10px] text-red-500">
                    <AlertTriangle size={9} />
                    Error
                  </span>
                ) : result.value ? (
                  <span className="flex items-center gap-1 text-[10px] text-green-500">
                    <CheckCircle2 size={9} />
                    {result.type}
                  </span>
                ) : null}
              </div>
              <div className="px-4 py-3 min-h-[60px] max-h-[100px] overflow-auto">
                {result.error ? (
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={12} className="text-red-400 mt-0.5" />
                    <span className="text-[11px] text-red-600">{result.error}</span>
                  </div>
                ) : result.value ? (
                  <div className="flex items-start gap-2">
                    <ArrowRight size={10} className="text-zinc-400 mt-1 flex-shrink-0" />
                    <code className={cn(
                      "text-[12px] font-mono rounded px-1.5 py-0.5",
                      typeColors[result.type] ?? "text-zinc-600 bg-zinc-100"
                    )}>
                      {result.value}
                    </code>
                  </div>
                ) : (
                  <span className="text-[11px] text-zinc-400 italic">Enter an expression to see the preview...</span>
                )}
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 bg-zinc-50/50 flex-shrink-0">
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <Sparkles size={10} />
                <span>Use <code className="bg-zinc-200 rounded px-1 py-0.5 text-zinc-600">{"={{ }}"}</code> to wrap expressions</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="rounded-md px-3 py-1.5 text-[12px] font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="rounded-md bg-zinc-900 px-4 py-1.5 text-[12px] font-medium text-white hover:bg-zinc-800 transition-colors"
                >
                  Apply Expression
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ── Standalone Expression Badge — shows inline expression with click-to-edit ── */
export function ExpressionBadge({
  value,
  onClick,
  className,
}: {
  value: string;
  onClick?: () => void;
  className?: string;
}) {
  const isExpression = value.includes("={{");

  if (!isExpression) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-mono text-emerald-700 hover:bg-emerald-100 transition-colors",
        className
      )}
    >
      <Braces size={9} />
      <span className="truncate max-w-[200px]">{value}</span>
    </button>
  );
}
