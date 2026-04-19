import { useState, useCallback, useMemo } from "react";
import {
  ChevronRight, ChevronDown, Copy, Check, Search, Hash, AtSign,
  Braces, Layers, Zap, X, Maximize2, Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface JsonViewerProps {
  data: JsonValue;
  rootLabel?: string;
  collapsed?: boolean | number;
  searchable?: boolean;
  copyPath?: boolean;
  className?: string;
  maxHeight?: string;
  compact?: boolean;
}

/* ── Type detection + colors ── */
function getType(val: JsonValue): string {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val;
}

const typeConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  string:  { color: "text-amber-600",  bg: "bg-amber-50",  icon: AtSign,  label: "str" },
  number:  { color: "text-cyan-600",   bg: "bg-cyan-50",   icon: Hash,    label: "num" },
  boolean: { color: "text-violet-600", bg: "bg-violet-50", icon: Zap,     label: "bool" },
  null:    { color: "text-zinc-400",   bg: "bg-zinc-50",   icon: X,       label: "null" },
  object:  { color: "text-blue-600",   bg: "bg-blue-50",   icon: Braces,  label: "obj" },
  array:   { color: "text-green-600",  bg: "bg-green-50",  icon: Layers,  label: "arr" },
};

/* ── Flatten for search ── */
function flattenPaths(data: JsonValue, prefix = ""): { path: string; value: string; type: string }[] {
  const results: { path: string; value: string; type: string }[] = [];
  if (data === null || data === undefined) {
    results.push({ path: prefix || "$", value: "null", type: "null" });
  } else if (Array.isArray(data)) {
    results.push({ path: prefix || "$", value: `Array(${data.length})`, type: "array" });
    data.forEach((item, i) => {
      results.push(...flattenPaths(item, `${prefix}[${i}]`));
    });
  } else if (typeof data === "object") {
    const keys = Object.keys(data);
    results.push({ path: prefix || "$", value: `{${keys.length} keys}`, type: "object" });
    for (const key of keys) {
      const childPath = prefix ? `${prefix}.${key}` : key;
      results.push(...flattenPaths(data[key], childPath));
    }
  } else {
    results.push({ path: prefix || "$", value: String(data), type: typeof data });
  }
  return results;
}

/* ── Value renderer ── */
function ValueDisplay({ value, type }: { value: JsonValue; type: string }) {
  const tc = typeConfig[type];
  if (type === "null") return <span className="text-zinc-400 italic">null</span>;
  if (type === "boolean") return <span className={tc.color}>{String(value)}</span>;
  if (type === "number") return <span className={tc.color}>{String(value)}</span>;
  if (type === "string") {
    const s = value as string;
    const truncated = s.length > 100 ? s.slice(0, 100) + "…" : s;
    return <span className={tc.color}>&quot;{truncated}&quot;</span>;
  }
  if (type === "array") return <span className="text-zinc-400">Array({(value as JsonValue[]).length})</span>;
  if (type === "object") return <span className="text-zinc-400">{`{${Object.keys(value as object).length} keys}`}</span>;
  return <span>{String(value)}</span>;
}

/* ── Tree Node ── */
function TreeNode({
  keyName,
  value,
  path,
  depth,
  defaultCollapsed,
  searchQuery,
  onCopyPath,
}: {
  keyName: string | number | null;
  value: JsonValue;
  path: string;
  depth: number;
  defaultCollapsed: boolean | number;
  searchQuery: string;
  onCopyPath?: (path: string) => void;
}) {
  const type = getType(value);
  const isExpandable = type === "object" || type === "array";
  const shouldStartCollapsed =
    typeof defaultCollapsed === "boolean"
      ? defaultCollapsed
      : depth >= defaultCollapsed;

  const [collapsed, setCollapsed] = useState(shouldStartCollapsed);
  const [hovered, setHovered] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const tc = typeConfig[type];

  const childEntries = useMemo(() => {
    if (type === "object" && value) return Object.entries(value as Record<string, JsonValue>);
    if (type === "array") return (value as JsonValue[]).map((v, i) => [String(i), v] as [string, JsonValue]);
    return [];
  }, [value, type]);

  const matchesSearch = searchQuery && (
    (keyName !== null && String(keyName).toLowerCase().includes(searchQuery.toLowerCase())) ||
    (!isExpandable && String(value).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCopyPath = useCallback(() => {
    navigator.clipboard.writeText(path);
    setCopiedPath(true);
    onCopyPath?.(path);
    setTimeout(() => setCopiedPath(false), 1500);
  }, [path, onCopyPath]);

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-0.5 pr-2 rounded-sm transition-colors cursor-default group",
          hovered && "bg-zinc-50",
          matchesSearch && "bg-amber-50 ring-1 ring-amber-200",
        )}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Expand/collapse arrow */}
        {isExpandable ? (
          <button
            onClick={() => setCollapsed(c => !c)}
            className="flex h-4 w-4 items-center justify-center rounded hover:bg-zinc-200 transition-colors flex-shrink-0"
          >
            {collapsed ? <ChevronRight size={10} className="text-zinc-400" /> : <ChevronDown size={10} className="text-zinc-400" />}
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        {/* Type icon */}
        <span className={cn("flex h-4 w-4 items-center justify-center rounded text-[8px]", tc.bg, tc.color)}>
          <tc.icon size={9} />
        </span>

        {/* Key name */}
        {keyName !== null && (
          <>
            <span className="text-[11px] font-medium text-zinc-700">{keyName}</span>
            <span className="text-[11px] text-zinc-300">:</span>
          </>
        )}

        {/* Value (or collapsed summary) */}
        <span className="text-[11px] font-mono truncate flex-1 min-w-0">
          {isExpandable && collapsed ? (
            <span className="text-zinc-400">
              {type === "array" ? `[${childEntries.length}]` : `{${childEntries.length}}`}
            </span>
          ) : !isExpandable ? (
            <ValueDisplay value={value} type={type} />
          ) : null}
        </span>

        {/* Hover actions */}
        <div className={cn("flex items-center gap-0.5 transition-opacity", hovered ? "opacity-100" : "opacity-0")}>
          <span className={cn("rounded px-1 py-0.5 text-[8px] font-medium", tc.bg, tc.color)}>
            {tc.label}
          </span>
          <button
            onClick={handleCopyPath}
            className="flex h-4 items-center gap-0.5 rounded px-1 text-[8px] text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 transition-colors"
            title={`Copy path: ${path}`}
          >
            {copiedPath ? <Check size={8} className="text-green-500" /> : <Copy size={8} />}
          </button>
        </div>
      </div>

      {/* Children */}
      {isExpandable && !collapsed && (
        <div>
          {childEntries.map(([k, v]) => (
            <TreeNode
              key={k}
              keyName={type === "array" ? Number(k) : k}
              value={v}
              path={type === "array" ? `${path}[${k}]` : `${path}.${k}`}
              depth={depth + 1}
              defaultCollapsed={defaultCollapsed}
              searchQuery={searchQuery}
              onCopyPath={onCopyPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */
export function JsonViewer({
  data,
  rootLabel = "$",
  collapsed = 2,
  searchable = true,
  copyPath = true,
  className,
  maxHeight = "400px",
  compact = false,
}: JsonViewerProps) {
  const [search, setSearch] = useState("");
  const [copiedFull, setCopiedFull] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopyFull = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  }, [data]);

  const flatPaths = useMemo(() => flattenPaths(data), [data]);
  const matchCount = search
    ? flatPaths.filter(p =>
        p.path.toLowerCase().includes(search.toLowerCase()) ||
        p.value.toLowerCase().includes(search.toLowerCase())
      ).length
    : 0;

  return (
    <div className={cn("rounded-lg border border-zinc-200 bg-white overflow-hidden flex flex-col", className)}>
      {/* Toolbar */}
      {!compact && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-50 border-b border-zinc-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Braces size={12} className="text-zinc-400" />
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Data Inspector</span>
            <span className="text-[9px] text-zinc-400">{flatPaths.length} paths</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyFull}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 transition-colors"
            >
              {copiedFull ? <Check size={9} className="text-green-500" /> : <Copy size={9} />}
              {copiedFull ? "Copied" : "Copy JSON"}
            </button>
            <button
              onClick={() => setExpanded(e => !e)}
              className="rounded p-0.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 transition-colors"
            >
              {expanded ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      {searchable && !compact && (
        <div className="px-3 py-1.5 border-b border-zinc-100">
          <div className="relative">
            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search keys or values..."
              className="w-full h-6 rounded border border-zinc-200 bg-white pl-6 pr-2 text-[11px] text-zinc-700 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-900/10"
            />
            {search && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-[9px] text-zinc-400">{matchCount} matches</span>
                <button onClick={() => setSearch("")} className="text-zinc-400 hover:text-zinc-600">
                  <X size={10} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tree view */}
      <div
        className="overflow-auto font-mono"
        style={{ maxHeight: expanded ? "none" : maxHeight }}
      >
        <TreeNode
          keyName={compact ? null : rootLabel}
          value={data}
          path="$"
          depth={0}
          defaultCollapsed={collapsed}
          searchQuery={search}
          onCopyPath={copyPath ? undefined : undefined}
        />
      </div>
    </div>
  );
}

/* ── Inline compact JSON preview ── */
export function JsonPreview({ data, className }: { data: JsonValue; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const preview = JSON.stringify(data);
  const truncated = preview.length > 80 ? preview.slice(0, 80) + "…" : preview;

  return (
    <div className={cn("group relative", className)}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-1 rounded-md bg-zinc-50 border border-zinc-200 px-2 py-1 text-left hover:bg-zinc-100 transition-colors w-full"
      >
        <Braces size={10} className="text-zinc-400 flex-shrink-0" />
        <code className="text-[10px] text-zinc-600 font-mono truncate">{truncated}</code>
        <ChevronRight size={10} className={cn("text-zinc-400 transition-transform flex-shrink-0", expanded && "rotate-90")} />
      </button>
      {expanded && (
        <div className="mt-1">
          <JsonViewer data={data} compact searchable={false} maxHeight="200px" />
        </div>
      )}
    </div>
  );
}
