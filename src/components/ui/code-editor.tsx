import { useState, useRef, useEffect, useCallback } from "react";
import {
  Copy, Check, ChevronDown, Play, Sparkles, Maximize2, Minimize2,
  Code2, FileJson, Hash, Braces, RotateCcw, Wand2, AlertTriangle,
  CheckCircle2, Loader2, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */
type Language = "javascript" | "python" | "sql" | "json" | "html" | "css" | "typescript" | "expression";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: Language;
  readOnly?: boolean;
  height?: string;
  showLineNumbers?: boolean;
  showToolbar?: boolean;
  showAIAssist?: boolean;
  placeholder?: string;
  className?: string;
  onRun?: (code: string) => void;
  onExpand?: () => void;
  compact?: boolean;
}

/* ── Language configs ── */
const langConfig: Record<Language, { label: string; icon: React.ElementType; color: string }> = {
  javascript: { label: "JavaScript", icon: Braces, color: "text-yellow-600" },
  typescript: { label: "TypeScript", icon: Braces, color: "text-blue-600" },
  python:     { label: "Python",     icon: Hash,   color: "text-green-600" },
  sql:        { label: "SQL",        icon: Code2,  color: "text-violet-600" },
  json:       { label: "JSON",       icon: FileJson, color: "text-orange-600" },
  html:       { label: "HTML",       icon: Code2,  color: "text-red-600" },
  css:        { label: "CSS",        icon: Code2,  color: "text-blue-500" },
  expression: { label: "Expression", icon: Braces, color: "text-emerald-600" },
};

/* ── Minimal keyword highlighting ── */
const jsKeywords = new Set(["const", "let", "var", "function", "return", "if", "else", "for", "while", "do", "switch", "case", "break", "continue", "new", "this", "class", "import", "export", "from", "default", "async", "await", "try", "catch", "throw", "finally", "typeof", "instanceof", "null", "undefined", "true", "false", "yield", "of", "in"]);
const pyKeywords = new Set(["def", "class", "if", "elif", "else", "for", "while", "return", "import", "from", "as", "with", "try", "except", "finally", "raise", "pass", "break", "continue", "lambda", "yield", "and", "or", "not", "in", "is", "None", "True", "False", "self", "async", "await"]);
const sqlKeywords = new Set(["SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE", "TABLE", "ALTER", "DROP", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON", "AND", "OR", "NOT", "NULL", "AS", "ORDER", "BY", "GROUP", "HAVING", "LIMIT", "OFFSET", "DISTINCT", "UNION", "INDEX", "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "CASCADE"]);

function getKeywords(lang: Language) {
  if (lang === "javascript" || lang === "typescript") return jsKeywords;
  if (lang === "python") return pyKeywords;
  if (lang === "sql") return sqlKeywords;
  return new Set<string>();
}

function highlightLine(text: string, lang: Language): React.ReactNode[] {
  if (lang === "json") {
    return highlightJson(text);
  }
  if (lang === "expression") {
    return highlightExpression(text);
  }

  const keywords = getKeywords(lang);
  const parts: React.ReactNode[] = [];
  // Simple tokenizer: split by word boundaries
  const tokens = text.split(/(\s+|[(){}[\];,.:=<>!+\-*/&|^~?@#$%])/);
  let i = 0;
  let inString = false;
  let stringChar = "";

  for (const token of tokens) {
    if (!inString && (token === '"' || token === "'" || token === '`')) {
      inString = true;
      stringChar = token;
      parts.push(<span key={i++} className="text-amber-400">{token}</span>);
    } else if (inString && token === stringChar) {
      inString = false;
      parts.push(<span key={i++} className="text-amber-400">{token}</span>);
    } else if (inString) {
      parts.push(<span key={i++} className="text-amber-400">{token}</span>);
    } else if (token.startsWith("//")) {
      parts.push(<span key={i++} className="text-zinc-500 italic">{token}</span>);
    } else if (token.startsWith("#") && (lang === "python")) {
      parts.push(<span key={i++} className="text-zinc-500 italic">{token}</span>);
    } else if (keywords.has(lang === "sql" ? token.toUpperCase() : token)) {
      parts.push(<span key={i++} className="text-violet-400 font-medium">{token}</span>);
    } else if (/^\d+\.?\d*$/.test(token)) {
      parts.push(<span key={i++} className="text-cyan-400">{token}</span>);
    } else {
      parts.push(<span key={i++}>{token}</span>);
    }
  }
  return parts;
}

function highlightJson(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /("(?:[^"\\]|\\.)*")\s*(:)?|(\b\d+\.?\d*\b)|(true|false|null)|([\[\]{}:,])|(\s+)|([^\s"[\]{}:,]+)/g;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m[1]) {
      if (m[2]) {
        parts.push(<span key={i++} className="text-blue-400">{m[1]}</span>);
        parts.push(<span key={i++} className="text-zinc-500">{m[2]}</span>);
      } else {
        parts.push(<span key={i++} className="text-amber-400">{m[1]}</span>);
      }
    } else if (m[3]) {
      parts.push(<span key={i++} className="text-cyan-400">{m[3]}</span>);
    } else if (m[4]) {
      parts.push(<span key={i++} className="text-violet-400">{m[4]}</span>);
    } else {
      parts.push(<span key={i++} className="text-zinc-500">{m[0]}</span>);
    }
  }
  return parts;
}

function highlightExpression(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\{\{[^}]*\}\})|(\$json\.\w+)|(\$\w+)|("(?:[^"\\]|\\.)*")|(\b\d+\.?\d*\b)|(true|false|null)|([\[\].()=<>!+\-*/&|,:])|(\s+)|([^\s[\].()=<>!+\-*/&|,:"{}$]+)/g;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m[1]) {
      parts.push(<span key={i++} className="text-emerald-400 font-medium">{m[1]}</span>);
    } else if (m[2]) {
      parts.push(<span key={i++} className="text-emerald-300">{m[2]}</span>);
    } else if (m[3]) {
      parts.push(<span key={i++} className="text-cyan-400">{m[3]}</span>);
    } else if (m[4]) {
      parts.push(<span key={i++} className="text-amber-400">{m[4]}</span>);
    } else if (m[5]) {
      parts.push(<span key={i++} className="text-cyan-400">{m[5]}</span>);
    } else if (m[6]) {
      parts.push(<span key={i++} className="text-violet-400">{m[6]}</span>);
    } else {
      parts.push(<span key={i++}>{m[0]}</span>);
    }
  }
  return parts;
}

/* ── AI Assist suggestions ── */
const aiSuggestions = [
  "Add error handling for null values",
  "Convert to async/await pattern",
  "Add input validation",
  "Optimize loop with array methods",
  "Add JSDoc documentation",
];

/* ── Component ── */
export function CodeEditor({
  value,
  onChange,
  language = "javascript",
  readOnly = false,
  height = "200px",
  showLineNumbers = true,
  showToolbar = true,
  showAIAssist = false,
  placeholder = "Enter code...",
  className,
  onRun,
  onExpand,
  compact = false,
}: CodeEditorProps) {
  const [code, setCode] = useState(value);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState(language);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ line: number; msg: string }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLPreElement>(null);

  const lines = code.split("\n");
  const lineCount = lines.length;
  const lc = langConfig[lang];

  useEffect(() => { setCode(value); }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setCode(v);
    onChange?.(v);
    setErrors([]);
  }, [onChange]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleAIAssist = useCallback(() => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    // Simulated AI response
    setTimeout(() => {
      setAiResult(`// AI suggestion for: "${aiQuery}"\n// Applied transformation to your code\n${code}\n\n// Note: In production, this connects to the FlowHolt AI backend`);
      setAiLoading(false);
    }, 1200);
  }, [aiQuery, code]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = code.substring(0, start) + "  " + code.substring(end);
      setCode(newVal);
      onChange?.(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }, [code, onChange]);

  return (
    <div className={cn("rounded-lg border border-zinc-200 overflow-hidden bg-zinc-900 flex flex-col", className)} style={compact ? undefined : { height }}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-2 py-1 bg-zinc-800 border-b border-zinc-700/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(o => !o)}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-colors"
              >
                <lc.icon size={10} className={lc.color} />
                {lc.label}
                <ChevronDown size={8} />
              </button>
              {langMenuOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-36 rounded-lg border border-zinc-700 bg-zinc-800 shadow-xl py-1">
                  {(Object.keys(langConfig) as Language[]).map(l => {
                    const lconf = langConfig[l];
                    return (
                      <button
                        key={l}
                        onClick={() => { setLang(l); setLangMenuOpen(false); }}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-1.5 text-[11px] transition-colors",
                          lang === l ? "text-zinc-100 bg-zinc-700/50" : "text-zinc-400 hover:bg-zinc-700/30 hover:text-zinc-200"
                        )}
                      >
                        <lconf.icon size={10} className={lconf.color} />
                        {lconf.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {errors.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-red-400">
                <AlertTriangle size={9} /> {errors.length} error{errors.length > 1 ? "s" : ""}
              </span>
            )}
            {errors.length === 0 && code.trim() && (
              <span className="flex items-center gap-1 text-[10px] text-green-400">
                <CheckCircle2 size={9} /> Valid
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {showAIAssist && (
              <button
                onClick={() => setAiOpen(o => !o)}
                className={cn(
                  "flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                  aiOpen ? "bg-violet-600/20 text-violet-300" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
                )}
              >
                <Sparkles size={9} />
                AI Assist
              </button>
            )}
            {onRun && (
              <button
                onClick={() => onRun(code)}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-green-400 hover:bg-green-500/10 transition-colors"
              >
                <Play size={9} />
                Run
              </button>
            )}
            <button onClick={handleCopy} className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-colors">
              {copied ? <Check size={9} className="text-green-400" /> : <Copy size={9} />}
              {copied ? "Copied" : "Copy"}
            </button>
            {onExpand && (
              <button onClick={onExpand} className="rounded p-0.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-colors">
                <Maximize2 size={10} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Editor area */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Line numbers */}
        {showLineNumbers && (
          <div className="flex-shrink-0 select-none bg-zinc-800/50 border-r border-zinc-700/30 py-2 px-1 overflow-hidden">
            {lines.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "text-right pr-2 text-[11px] leading-[1.5rem] font-mono",
                  errors.some(e => e.line === i + 1) ? "text-red-400" : "text-zinc-600"
                )}
                style={{ minWidth: "2.5rem" }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        )}

        {/* Code overlay (highlighted) */}
        <pre
          ref={overlayRef}
          className="absolute inset-0 py-2 px-3 font-mono text-[11px] leading-[1.5rem] text-zinc-100 pointer-events-none overflow-hidden whitespace-pre"
          style={{ left: showLineNumbers ? "3.25rem" : "0" }}
          aria-hidden
        >
          {lines.map((line, i) => (
            <div key={i}>
              {line ? highlightLine(line, lang) : "\u00A0"}
            </div>
          ))}
        </pre>

        {/* Actual textarea (transparent text for typing) */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleChange}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          className={cn(
            "flex-1 resize-none py-2 px-3 font-mono text-[11px] leading-[1.5rem] bg-transparent text-transparent caret-zinc-100 outline-none selection:bg-violet-500/30 placeholder:text-zinc-600",
            readOnly && "cursor-default"
          )}
          style={{ caretColor: "#e4e4e7" }}
        />
      </div>

      {/* AI Assist panel */}
      {aiOpen && showAIAssist && (
        <div className="border-t border-zinc-700/50 bg-zinc-800/80 p-2 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={11} className="text-violet-400" />
            <span className="text-[10px] font-medium text-violet-300">AI Code Assistant</span>
            <button onClick={() => setAiOpen(false)} className="ml-auto text-zinc-500 hover:text-zinc-300">
              <X size={10} />
            </button>
          </div>
          <div className="flex gap-1.5 mb-2">
            <input
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAIAssist()}
              placeholder="Ask AI to modify your code..."
              className="flex-1 h-7 rounded-md bg-zinc-900 border border-zinc-700 px-2 text-[11px] text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-violet-500/50"
            />
            <button
              onClick={handleAIAssist}
              disabled={aiLoading || !aiQuery.trim()}
              className="flex items-center gap-1 rounded-md bg-violet-600 px-2 py-1 text-[10px] font-medium text-white hover:bg-violet-500 disabled:opacity-50 transition-colors"
            >
              {aiLoading ? <Loader2 size={9} className="animate-spin" /> : <Wand2 size={9} />}
              Apply
            </button>
          </div>
          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-1">
            {aiSuggestions.slice(0, 3).map(s => (
              <button
                key={s}
                onClick={() => { setAiQuery(s); }}
                className="rounded-full bg-zinc-700/50 px-2 py-0.5 text-[9px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          {aiResult && (
            <div className="mt-2 rounded-md bg-zinc-900 border border-violet-500/20 p-2 max-h-24 overflow-auto">
              <pre className="text-[10px] text-zinc-300 font-mono whitespace-pre-wrap">{aiResult}</pre>
              <div className="flex gap-1.5 mt-1.5">
                <button
                  onClick={() => { setCode(aiResult); onChange?.(aiResult); setAiResult(null); setAiQuery(""); }}
                  className="flex items-center gap-1 rounded px-2 py-0.5 text-[9px] bg-green-600/20 text-green-400 hover:bg-green-600/30"
                >
                  <Check size={8} /> Accept
                </button>
                <button
                  onClick={() => setAiResult(null)}
                  className="flex items-center gap-1 rounded px-2 py-0.5 text-[9px] bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700"
                >
                  <RotateCcw size={8} /> Discard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer status bar */}
      {!compact && (
        <div className="flex items-center justify-between px-2 py-0.5 bg-zinc-800/50 border-t border-zinc-700/30 text-[9px] text-zinc-500 flex-shrink-0">
          <span>Ln {lineCount}, Col {code.length > 0 ? code.split("\n").pop()!.length + 1 : 1}</span>
          <span>{code.length} chars</span>
        </div>
      )}
    </div>
  );
}

/* ── Compact inline code field for Studio Inspector ── */
export function InlineCodeField({
  value,
  onChange,
  language = "json",
  className,
}: {
  value: string;
  onChange?: (v: string) => void;
  language?: Language;
  className?: string;
}) {
  return (
    <CodeEditor
      value={value}
      onChange={onChange}
      language={language}
      height="80px"
      showToolbar={false}
      showAIAssist={false}
      showLineNumbers={false}
      compact
      className={cn("border-zinc-200", className)}
    />
  );
}
