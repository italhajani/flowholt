import { useState, useRef, useEffect, useMemo } from "react";
import {
  X, Code2, Braces, Zap, Copy, Check, AlertTriangle, ChevronRight, ChevronDown,
  Clock, Hash, Type, List, ToggleLeft, Search, Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── context variable catalog ── */
const contextVars = [
  { name: "$json", desc: "Current item data", type: "object", children: [
    { name: "id", type: "number" }, { name: "name", type: "string" }, { name: "email", type: "string" },
    { name: "status", type: "string" }, { name: "createdAt", type: "string" }, { name: "tags", type: "array" },
  ]},
  { name: "$input", desc: "Input from previous node", type: "object", children: [
    { name: "first()", type: "method" }, { name: "last()", type: "method" }, { name: "all()", type: "method" },
    { name: "item", type: "object" },
  ]},
  { name: "$vars", desc: "Workflow variables", type: "object", children: [
    { name: "apiKey", type: "string" }, { name: "baseUrl", type: "string" }, { name: "environment", type: "string" },
  ]},
  { name: "$now", desc: "Current DateTime (Luxon)", type: "DateTime", children: [] },
  { name: "$today", desc: "Start of today (Luxon)", type: "DateTime", children: [] },
  { name: "$execution", desc: "Execution metadata", type: "object", children: [
    { name: "id", type: "string" }, { name: "mode", type: "string" }, { name: "resumeUrl", type: "string" },
  ]},
  { name: "$workflow", desc: "Workflow metadata", type: "object", children: [
    { name: "id", type: "string" }, { name: "name", type: "string" }, { name: "active", type: "boolean" },
  ]},
  { name: "$prevNode", desc: "Previous node info", type: "object", children: [
    { name: "name", type: "string" }, { name: "outputIndex", type: "number" },
  ]},
];

const luxonHelpers = [
  { name: ".toISO()", desc: "ISO 8601 string" },
  { name: ".toFormat('yyyy-MM-dd')", desc: "Custom format" },
  { name: ".plus({ days: 1 })", desc: "Add duration" },
  { name: ".minus({ hours: 2 })", desc: "Subtract duration" },
  { name: ".startOf('month')", desc: "Start of period" },
  { name: ".endOf('week')", desc: "End of period" },
  { name: ".diff($now, 'days')", desc: "Difference" },
  { name: ".toRelative()", desc: "Relative string (e.g. '2 days ago')" },
  { name: ".weekday", desc: "Day of week (1=Mon)" },
  { name: ".toMillis()", desc: "Epoch milliseconds" },
];

const stringMethods = [
  ".toUpperCase()", ".toLowerCase()", ".trim()", ".split(',')", ".replace('a','b')",
  ".includes('text')", ".slice(0, 10)", ".length", ".startsWith('prefix')", ".match(/regex/)",
];

const arrayMethods = [
  ".map(i => i.name)", ".filter(i => i.active)", ".find(i => i.id === 1)",
  ".length", ".join(', ')", ".includes(val)", ".slice(0, 5)", ".sort()",
  ".reduce((a, b) => a + b, 0)", ".flat()",
];

const typeIcon = (t: string) => {
  switch (t) {
    case "string": return <Type size={10} className="text-emerald-500" />;
    case "number": return <Hash size={10} className="text-blue-500" />;
    case "boolean": return <ToggleLeft size={10} className="text-amber-500" />;
    case "array": return <List size={10} className="text-purple-500" />;
    case "object": return <Braces size={10} className="text-zinc-400" />;
    case "method": return <Zap size={10} className="text-orange-500" />;
    default: return <Code2 size={10} className="text-zinc-400" />;
  }
};

/* ── validation ── */
function validateExpression(expr: string): { valid: boolean; error?: string } {
  if (!expr.trim()) return { valid: true };
  const open = (expr.match(/\{\{/g) || []).length;
  const close = (expr.match(/\}\}/g) || []).length;
  if (open !== close) return { valid: false, error: `Unmatched brackets: ${open} {{ vs ${close} }}` };
  const inner = expr.match(/\{\{(.+?)\}\}/g);
  if (inner) {
    for (const m of inner) {
      const code = m.slice(2, -2).trim();
      if (!code) return { valid: false, error: "Empty expression block" };
      if (/[;]/.test(code)) return { valid: false, error: "Statements not allowed (found ;)" };
    }
  }
  return { valid: true };
}

/* ── preview ── */
function previewExpression(expr: string): string {
  return expr
    .replace(/\{\{\s*\$json\.name\s*\}\}/g, '"John Doe"')
    .replace(/\{\{\s*\$json\.email\s*\}\}/g, '"john@example.com"')
    .replace(/\{\{\s*\$json\.id\s*\}\}/g, "42")
    .replace(/\{\{\s*\$json\.status\s*\}\}/g, '"active"')
    .replace(/\{\{\s*\$now\.toISO\(\)\s*\}\}/g, '"2025-01-06T09:00:00.000Z"')
    .replace(/\{\{\s*\$now\s*\}\}/g, '"2025-01-06T09:00:00.000Z"')
    .replace(/\{\{\s*\$vars\.environment\s*\}\}/g, '"production"')
    .replace(/\{\{\s*\$vars\.apiKey\s*\}\}/g, '"sk-***"')
    .replace(/\{\{\s*\$execution\.id\s*\}\}/g, '"exec_abc123"')
    .replace(/\{\{.+?\}\}/g, '"[resolved]"');
}

/* ── syntax highlighting ── */
function highlightSyntax(code: string) {
  const parts: { text: string; cls: string }[] = [];
  let i = 0;
  while (i < code.length) {
    if (code.startsWith("{{", i)) {
      const end = code.indexOf("}}", i + 2);
      if (end === -1) { parts.push({ text: code.slice(i), cls: "text-red-400" }); break; }
      parts.push({ text: "{{", cls: "text-amber-400 font-bold" });
      const inner = code.slice(i + 2, end);
      // highlight context vars
      const highlighted = inner
        .replace(/(\$json|\$input|\$vars|\$now|\$today|\$execution|\$workflow|\$prevNode)/g, '§VAR§$1§/VAR§')
        .replace(/(\.\w+\()/g, '§MTH§$1§/MTH§')
        .replace(/(["'][^"']*["'])/g, '§STR§$1§/STR§')
        .replace(/(\d+)/g, '§NUM§$1§/NUM§');
      const tokens = highlighted.split(/(§\w+§|§\/\w+§)/);
      let currentCls = "text-zinc-300";
      for (const tok of tokens) {
        if (tok === "§VAR§") { currentCls = "text-cyan-400 font-semibold"; continue; }
        if (tok === "§/VAR§") { currentCls = "text-zinc-300"; continue; }
        if (tok === "§MTH§") { currentCls = "text-yellow-300"; continue; }
        if (tok === "§/MTH§") { currentCls = "text-zinc-300"; continue; }
        if (tok === "§STR§") { currentCls = "text-emerald-400"; continue; }
        if (tok === "§/STR§") { currentCls = "text-zinc-300"; continue; }
        if (tok === "§NUM§") { currentCls = "text-purple-400"; continue; }
        if (tok === "§/NUM§") { currentCls = "text-zinc-300"; continue; }
        if (tok) parts.push({ text: tok, cls: currentCls });
      }
      parts.push({ text: "}}", cls: "text-amber-400 font-bold" });
      i = end + 2;
    } else {
      const next = code.indexOf("{{", i);
      const seg = next === -1 ? code.slice(i) : code.slice(i, next);
      parts.push({ text: seg, cls: "text-zinc-500" });
      i += seg.length;
    }
  }
  return parts;
}

/* ── Variable Tree Item ── */
function VarTreeItem({ v, depth = 0, onInsert }: { v: typeof contextVars[0]; depth?: number; onInsert: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const hasChildren = "children" in v && (v as any).children?.length > 0;
  return (
    <div>
      <button
        className={cn(
          "flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-[11px] hover:bg-zinc-800/60 transition-colors group",
          depth > 0 && "ml-3"
        )}
        onClick={() => hasChildren ? setOpen(!open) : onInsert(v.name)}
      >
        {hasChildren ? (open ? <ChevronDown size={10} className="text-zinc-500" /> : <ChevronRight size={10} className="text-zinc-500" />) : <span className="w-2.5" />}
        {typeIcon((v as any).type || "string")}
        <span className="font-mono text-cyan-400">{v.name}</span>
        {"desc" in v && <span className="ml-auto text-[9px] text-zinc-600 group-hover:text-zinc-400 truncate max-w-[120px]">{(v as any).desc}</span>}
      </button>
      {open && hasChildren && (v as any).children.map((c: any, i: number) => (
        <VarTreeItem key={i} v={c} depth={depth + 1} onInsert={(t) => onInsert(`${v.name}.${t}`)} />
      ))}
    </div>
  );
}

/* ── Main Component ── */
interface ExpressionEditorModalProps {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (val: string) => void;
  fieldLabel?: string;
}

export function ExpressionEditorModal({ open, onClose, value, onChange, fieldLabel }: ExpressionEditorModalProps) {
  const [code, setCode] = useState(value);
  const [mode, setMode] = useState<"basic" | "advanced">("basic");
  const [sidebarTab, setSidebarTab] = useState<"variables" | "luxon" | "methods">("variables");
  const [copied, setCopied] = useState(false);
  const [varFilter, setVarFilter] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (open) setCode(value); }, [open, value]);

  const validation = useMemo(() => validateExpression(code), [code]);
  const preview = useMemo(() => previewExpression(code), [code]);
  const highlighted = useMemo(() => highlightSyntax(code), [code]);

  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const wrapped = mode === "basic" ? `{{ ${text} }}` : text;
    const next = code.slice(0, start) + wrapped + code.slice(end);
    setCode(next);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + wrapped.length, start + wrapped.length); }, 0);
  };

  const handleApply = () => { onChange(code); onClose(); };
  const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const filteredVars = varFilter
    ? contextVars.filter(v => v.name.toLowerCase().includes(varFilter.toLowerCase()) || v.desc.toLowerCase().includes(varFilter.toLowerCase()))
    : contextVars;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex h-[85vh] w-[90vw] max-w-[1100px] flex-col rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
              <Braces size={14} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-[13px] font-semibold text-zinc-100">Expression Editor</h2>
              {fieldLabel && <p className="text-[10px] text-zinc-500">Field: {fieldLabel}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mode toggle */}
            <div className="flex rounded-lg border border-zinc-800 p-0.5">
              {(["basic", "advanced"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-md px-3 py-1 text-[10px] font-medium transition-all",
                    mode === m ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {m === "basic" ? "{{ }} Basic" : "</> Advanced"}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Editor area */}
          <div className="flex flex-1 flex-col border-r border-zinc-800">
            {/* Highlighted preview */}
            <div className="border-b border-zinc-800/50 bg-zinc-900/50 px-5 py-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-medium text-zinc-600 uppercase tracking-wider">Syntax Preview</span>
                <button onClick={handleCopy} className="ml-auto text-zinc-600 hover:text-zinc-300 transition-colors">
                  {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                </button>
              </div>
              <div className="font-mono text-[12px] leading-relaxed min-h-[20px] max-h-[60px] overflow-auto">
                {highlighted.map((p, i) => <span key={i} className={p.cls}>{p.text}</span>)}
                {!code && <span className="text-zinc-700 italic">Type an expression…</span>}
              </div>
            </div>

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder={mode === "basic" ? 'Hello {{ $json.name }}, your order #{{ $json.id }} is {{ $json.status }}' : '$json.name.toUpperCase()'}
                spellCheck={false}
                className="absolute inset-0 w-full h-full resize-none bg-transparent px-5 py-4 font-mono text-[13px] text-zinc-200 placeholder:text-zinc-700 focus:outline-none leading-relaxed"
              />
              {/* Line numbers gutter */}
              <div className="absolute left-0 top-0 w-8 h-full bg-zinc-900/30 border-r border-zinc-800/30 py-4 text-right pr-1.5">
                {code.split("\n").map((_, i) => (
                  <div key={i} className="text-[10px] text-zinc-700 leading-relaxed">{i + 1}</div>
                ))}
              </div>
            </div>

            {/* Validation & Preview bar */}
            <div className="border-t border-zinc-800 px-5 py-2.5 flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  {validation.valid
                    ? <><Check size={10} className="text-emerald-500" /><span className="text-[9px] font-medium text-emerald-500">Valid expression</span></>
                    : <><AlertTriangle size={10} className="text-red-400" /><span className="text-[9px] font-medium text-red-400">{validation.error}</span></>
                  }
                </div>
                <div className="flex items-center gap-1.5">
                  <Play size={9} className="text-zinc-600" />
                  <span className="text-[9px] text-zinc-600">Preview:</span>
                  <code className="text-[10px] font-mono text-zinc-400 truncate max-w-[500px]">{preview || "—"}</code>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="rounded-lg border border-zinc-800 px-4 py-1.5 text-[11px] text-zinc-400 hover:bg-zinc-800 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={!validation.valid}
                  className={cn(
                    "rounded-lg px-4 py-1.5 text-[11px] font-medium transition-colors",
                    validation.valid
                      ? "bg-amber-500 text-zinc-950 hover:bg-amber-400"
                      : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                  )}
                >
                  Apply Expression
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-[280px] flex flex-col bg-zinc-900/30">
            {/* Sidebar tabs */}
            <div className="flex border-b border-zinc-800 px-2">
              {([
                { id: "variables", label: "Variables", icon: Braces },
                { id: "luxon", label: "DateTime", icon: Clock },
                { id: "methods", label: "Methods", icon: Code2 },
              ] as const).map(t => (
                <button
                  key={t.id}
                  onClick={() => setSidebarTab(t.id)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-2 text-[10px] font-medium border-b-2 transition-colors",
                    sidebarTab === t.id
                      ? "border-amber-400 text-amber-400"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <t.icon size={10} />{t.label}
                </button>
              ))}
            </div>

            {/* Sidebar content */}
            <div className="flex-1 overflow-auto p-2">
              {sidebarTab === "variables" && (
                <div className="space-y-1">
                  <div className="relative mb-2">
                    <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input
                      value={varFilter}
                      onChange={e => setVarFilter(e.target.value)}
                      placeholder="Filter variables…"
                      className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-1 pl-6 pr-2 text-[10px] text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                  <p className="text-[9px] text-zinc-600 px-2 mb-1">Click to insert at cursor</p>
                  {filteredVars.map((v, i) => (
                    <VarTreeItem key={i} v={v} onInsert={insertAtCursor} />
                  ))}
                </div>
              )}

              {sidebarTab === "luxon" && (
                <div className="space-y-1">
                  <p className="text-[9px] text-zinc-600 px-2 mb-2">Luxon DateTime methods — click to insert</p>
                  {luxonHelpers.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => insertAtCursor(`$now${h.name}`)}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-zinc-800/60 transition-colors group"
                    >
                      <Clock size={10} className="text-amber-500/60" />
                      <div className="min-w-0 flex-1">
                        <code className="text-[10px] font-mono text-amber-400">{h.name}</code>
                        <p className="text-[9px] text-zinc-600 group-hover:text-zinc-400">{h.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {sidebarTab === "methods" && (
                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] font-medium text-zinc-500 px-2 mb-1 uppercase tracking-wider">String Methods</p>
                    {stringMethods.map((m, i) => (
                      <button key={i} onClick={() => insertAtCursor(m)} className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-[10px] font-mono text-emerald-400/80 hover:bg-zinc-800/60 transition-colors">
                        <Type size={9} className="text-emerald-500/50" />{m}
                      </button>
                    ))}
                  </div>
                  <div>
                    <p className="text-[9px] font-medium text-zinc-500 px-2 mb-1 uppercase tracking-wider">Array Methods</p>
                    {arrayMethods.map((m, i) => (
                      <button key={i} onClick={() => insertAtCursor(m)} className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-[10px] font-mono text-purple-400/80 hover:bg-zinc-800/60 transition-colors">
                        <List size={9} className="text-purple-500/50" />{m}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
