import { useState, useRef, useEffect } from "react";
import {
  Play, Copy, Check, AlertTriangle, Download, Upload, ChevronRight, ChevronDown,
  Code2, Braces, Terminal, Zap, RefreshCw, Settings, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── language configs ── */
const languages = [
  { id: "javascript", label: "JavaScript", ext: "js" },
  { id: "python", label: "Python", ext: "py" },
  { id: "json", label: "JSON", ext: "json" },
  { id: "html", label: "HTML", ext: "html" },
];

/* ── keyword maps for syntax highlighting ── */
const jsKeywords = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "switch", "case", "break", "continue", "try", "catch", "throw", "new",
  "class", "import", "export", "from", "default", "async", "await", "of", "in",
  "true", "false", "null", "undefined", "this", "typeof", "instanceof",
]);

const pyKeywords = new Set([
  "def", "return", "if", "elif", "else", "for", "while", "in", "not", "and",
  "or", "import", "from", "class", "try", "except", "raise", "with", "as",
  "True", "False", "None", "lambda", "yield", "async", "await", "pass", "break",
]);

/* ── context variable completions ── */
const contextCompletions = [
  { label: "$input.first()", desc: "First item from input" },
  { label: "$input.last()", desc: "Last item from input" },
  { label: "$input.all()", desc: "All input items" },
  { label: "$json", desc: "Current item JSON data" },
  { label: "$vars", desc: "Workflow variables" },
  { label: "$env", desc: "Environment variables" },
  { label: "$now", desc: "Current DateTime (Luxon)" },
  { label: "$today", desc: "Start of today (Luxon)" },
  { label: "$execution.id", desc: "Current execution ID" },
  { label: "$workflow.id", desc: "Current workflow ID" },
  { label: "$fromAI()", desc: "AI model output reference" },
  { label: "$jmespath()", desc: "JMESPath query" },
  { label: "items", desc: "All input items array" },
  { label: "item", desc: "Current item in loop" },
];

/* ── syntax highlighter (line-based) ── */
function highlightLine(line: string, lang: string): JSX.Element[] {
  const parts: JSX.Element[] = [];
  const keywords = lang === "python" ? pyKeywords : jsKeywords;

  if (lang === "json") {
    // Simple JSON highlighting
    const jsonParts = line.split(/("(?:[^"\\]|\\.)*")/);
    jsonParts.forEach((p, i) => {
      if (p.startsWith('"') && p.endsWith('"')) {
        const isKey = line.indexOf(p) < line.indexOf(":");
        parts.push(<span key={i} className={isKey ? "text-blue-400" : "text-emerald-400"}>{p}</span>);
      } else {
        const numParts = p.split(/(\b\d+\.?\d*\b)/);
        numParts.forEach((np, j) => {
          if (/^\d+\.?\d*$/.test(np)) parts.push(<span key={`${i}-${j}`} className="text-purple-400">{np}</span>);
          else if (np === "true" || np === "false" || np === "null") parts.push(<span key={`${i}-${j}`} className="text-amber-400">{np}</span>);
          else parts.push(<span key={`${i}-${j}`} className="text-zinc-400">{np}</span>);
        });
      }
    });
    return parts;
  }

  // JS/Python highlighting
  const tokens = line.split(/(\s+|[{}()[\];,.:=!<>+\-*/&|?]|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\/\/.*$|#.*$|\b\d+\.?\d*\b|\$\w+(?:\.\w+(?:\(\))?)*|\w+)/);
  tokens.forEach((tok, i) => {
    if (!tok) return;
    if (tok.startsWith("//") || tok.startsWith("#")) {
      parts.push(<span key={i} className="text-zinc-600 italic">{tok}</span>);
    } else if (tok.startsWith('"') || tok.startsWith("'") || tok.startsWith("`")) {
      parts.push(<span key={i} className="text-emerald-400">{tok}</span>);
    } else if (/^\d+\.?\d*$/.test(tok)) {
      parts.push(<span key={i} className="text-purple-400">{tok}</span>);
    } else if (tok.startsWith("$")) {
      parts.push(<span key={i} className="text-cyan-400 font-semibold">{tok}</span>);
    } else if (keywords.has(tok)) {
      parts.push(<span key={i} className="text-blue-400 font-medium">{tok}</span>);
    } else if (/^[A-Z]\w*$/.test(tok)) {
      parts.push(<span key={i} className="text-yellow-300">{tok}</span>);
    } else if (/^[{}()[\];,.:=!<>+\-*/&|?]+$/.test(tok)) {
      parts.push(<span key={i} className="text-zinc-500">{tok}</span>);
    } else {
      parts.push(<span key={i} className="text-zinc-300">{tok}</span>);
    }
  });
  return parts;
}

/* ── mock errors ── */
const mockErrors = [
  { line: 5, col: 12, message: "Unexpected token ')'", severity: "error" as const },
  { line: 8, col: 1, message: "Unused variable 'temp'", severity: "warning" as const },
];

/* ── default code snippets ── */
const defaultCode: Record<string, string> = {
  javascript: `// Transform incoming data
const items = $input.all();
const results = [];

for (const item of items) {
  const data = item.json;
  results.push({
    json: {
      fullName: \`\${data.firstName} \${data.lastName}\`,
      email: data.email.toLowerCase(),
      score: data.score * 1.5,
      processed: true,
      timestamp: $now.toISO(),
    }
  });
}

return results;`,
  python: `# Transform incoming data
items = $input.all()
results = []

for item in items:
    data = item["json"]
    results.append({
        "json": {
            "fullName": f"{data['firstName']} {data['lastName']}",
            "email": data["email"].lower(),
            "score": data["score"] * 1.5,
            "processed": True,
            "timestamp": str($now),
        }
    })

return results`,
  json: `{
  "method": "POST",
  "url": "https://api.example.com/v2/leads",
  "headers": {
    "Authorization": "Bearer {{ $vars.apiKey }}",
    "Content-Type": "application/json"
  },
  "body": {
    "name": "{{ $json.name }}",
    "email": "{{ $json.email }}",
    "source": "flowholt"
  }
}`,
};

/* ── Main Component ── */
interface CodeEditorPanelProps {
  nodeType?: string;
  initialCode?: string;
  onCodeChange?: (code: string) => void;
}

export function CodeEditorPanel({ nodeType = "Code", initialCode, onCodeChange }: CodeEditorPanelProps) {
  const [lang, setLang] = useState(nodeType === "HTTP Request" ? "json" : "javascript");
  const [code, setCode] = useState(initialCode ?? defaultCode[lang] ?? "");
  const [showOutput, setShowOutput] = useState(false);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [acFilter, setAcFilter] = useState("");
  const [acPos, setAcPos] = useState({ top: 0, left: 0 });
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(true);
  const [minimap, setMinimap] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const lines = code.split("\n");
  const errorLines = new Set(mockErrors.map(e => e.line));

  useEffect(() => {
    if (initialCode === undefined) setCode(defaultCode[lang] ?? "");
  }, [lang]);

  const handleRun = () => {
    setRunning(true);
    setShowOutput(true);
    setTimeout(() => {
      setOutput(`[
  { "fullName": "John Doe", "email": "john@example.com", "score": 130.5, "processed": true, "timestamp": "2025-01-06T09:00:00.000Z" },
  { "fullName": "Jane Smith", "email": "jane@example.com", "score": 120.0, "processed": true, "timestamp": "2025-01-06T09:00:00.000Z" }
]`);
      setRunning(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Tab indent
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current!;
      const s = ta.selectionStart, end = ta.selectionEnd;
      const next = code.slice(0, s) + "  " + code.slice(end);
      setCode(next);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + 2; }, 0);
    }
    // Trigger autocomplete on $
    if (e.key === "$" || (e.ctrlKey && e.key === " ")) {
      setShowAutoComplete(true);
      setAcFilter("");
    }
    // Close autocomplete
    if (e.key === "Escape") setShowAutoComplete(false);
  };

  const insertCompletion = (label: string) => {
    const ta = textareaRef.current!;
    const s = ta.selectionStart;
    // Find start of current word
    let wordStart = s;
    while (wordStart > 0 && /[\w$.]/.test(code[wordStart - 1])) wordStart--;
    const next = code.slice(0, wordStart) + label + code.slice(s);
    setCode(next);
    setShowAutoComplete(false);
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = wordStart + label.length; }, 0);
  };

  const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const filteredCompletions = contextCompletions.filter(c =>
    !acFilter || c.label.toLowerCase().includes(acFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
        <div className="flex items-center gap-2">
          <Code2 size={13} className="text-zinc-500" />
          <span className="text-[11px] font-medium text-zinc-400">{nodeType} Editor</span>
          <div className="flex rounded-md border border-zinc-800 p-0.5 ml-2">
            {languages.filter(l => nodeType === "HTTP Request" ? l.id === "json" : l.id !== "html").map(l => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={cn(
                  "rounded px-2 py-0.5 text-[9px] font-medium transition-all",
                  lang === l.id ? "bg-zinc-700 text-zinc-100" : "text-zinc-600 hover:text-zinc-300"
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleCopy} className="rounded p-1 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors" title="Copy code">
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>
          <button className="rounded p-1 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors" title="Import">
            <Upload size={12} />
          </button>
          <button className="rounded p-1 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors" title="Download">
            <Download size={12} />
          </button>
          <button
            onClick={() => setShowErrors(!showErrors)}
            className={cn("rounded p-1 transition-colors", showErrors ? "text-amber-400 bg-amber-400/10" : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800")}
            title="Toggle error markers"
          >
            <AlertTriangle size={12} />
          </button>
          <div className="w-px h-4 bg-zinc-800 mx-1" />
          <button
            onClick={handleRun}
            disabled={running}
            className={cn(
              "flex items-center gap-1 rounded-md px-3 py-1 text-[10px] font-medium transition-all",
              running ? "bg-zinc-800 text-zinc-500" : "bg-emerald-600 text-white hover:bg-emerald-500"
            )}
          >
            {running ? <><RefreshCw size={10} className="animate-spin" /> Running…</> : <><Play size={10} /> Run</>}
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex flex-1 min-h-0">
        {/* Main editor */}
        <div ref={editorRef} className="flex-1 relative overflow-auto">
          {/* Line numbers + highlighted code (display layer) */}
          <div className="absolute inset-0 pointer-events-none px-0 py-2 font-mono text-[12px] leading-[20px]">
            {lines.map((line, i) => (
              <div key={i} className={cn("flex", showErrors && errorLines.has(i + 1) && "bg-red-500/10")}>
                <div className="w-10 flex-shrink-0 text-right pr-2 select-none">
                  <span className={cn("text-[10px]", showErrors && errorLines.has(i + 1) ? "text-red-400" : "text-zinc-700")}>
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 whitespace-pre pl-2">
                  {highlightLine(line, lang)}
                </div>
              </div>
            ))}
          </div>

          {/* Actual textarea (input layer) */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={e => { setCode(e.target.value); onCodeChange?.(e.target.value); }}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="absolute inset-0 w-full h-full resize-none bg-transparent pl-12 py-2 font-mono text-[12px] text-transparent caret-zinc-300 focus:outline-none leading-[20px] selection:bg-blue-500/30"
          />

          {/* Autocomplete popup */}
          {showAutoComplete && filteredCompletions.length > 0 && (
            <div className="absolute z-20 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl py-1 max-h-48 overflow-auto" style={{ top: 100, left: 100 }}>
              {filteredCompletions.map((c, i) => (
                <button
                  key={i}
                  onClick={() => insertCompletion(c.label)}
                  className="flex w-full items-center gap-2 px-3 py-1 text-left hover:bg-zinc-800 transition-colors"
                >
                  <Zap size={10} className="text-cyan-400 flex-shrink-0" />
                  <code className="text-[11px] font-mono text-cyan-300">{c.label}</code>
                  <span className="text-[9px] text-zinc-600 ml-auto">{c.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Minimap */}
        {minimap && (
          <div className="w-[60px] border-l border-zinc-800/50 bg-zinc-900/50 overflow-hidden flex-shrink-0">
            <div className="py-1 px-1 transform scale-[0.15] origin-top-left" style={{ width: "400px" }}>
              {lines.map((line, i) => (
                <div key={i} className="h-[3px] mb-[1px] flex gap-[1px]">
                  {line.split(/(\s+)/).filter(Boolean).map((tok, j) => (
                    <div
                      key={j}
                      className={cn(
                        "h-full rounded-[0.5px]",
                        /^\s+$/.test(tok) ? "bg-transparent" : "bg-zinc-600/40"
                      )}
                      style={{ width: `${tok.length * 3}px` }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error panel */}
      {showErrors && mockErrors.length > 0 && (
        <div className="border-t border-zinc-800 bg-zinc-900/50 px-3 py-2">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle size={10} className="text-amber-400" />
            <span className="text-[9px] font-medium text-zinc-500">{mockErrors.length} issues</span>
          </div>
          <div className="space-y-0.5">
            {mockErrors.map((err, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <span className={cn("rounded px-1 py-0 text-[8px] font-bold", err.severity === "error" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400")}>
                  {err.severity === "error" ? "ERR" : "WARN"}
                </span>
                <span className="text-zinc-500">Ln {err.line}, Col {err.col}</span>
                <span className="text-zinc-400">{err.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Output panel */}
      {showOutput && (
        <div className="border-t border-zinc-800 max-h-40 overflow-auto">
          <div className="flex items-center justify-between bg-zinc-900/80 px-3 py-1.5 border-b border-zinc-800/50 sticky top-0">
            <div className="flex items-center gap-1.5">
              <Terminal size={10} className="text-zinc-500" />
              <span className="text-[10px] font-medium text-zinc-400">Output</span>
              {running && <RefreshCw size={9} className="text-emerald-400 animate-spin" />}
            </div>
            <button onClick={() => setShowOutput(false)} className="text-zinc-600 hover:text-zinc-300 text-[9px]">
              Close
            </button>
          </div>
          <pre className="px-3 py-2 text-[10px] font-mono text-emerald-400 leading-relaxed">
            {output ?? "Running…"}
          </pre>
        </div>
      )}
    </div>
  );
}
