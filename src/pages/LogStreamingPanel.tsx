import { useState, useRef, useEffect, useMemo } from "react";
import {
  Terminal, Search, Filter, Download, Pause, Play, Trash2,
  ChevronDown, Circle, AlertTriangle, Info, Bug, XCircle,
  Clock, Zap, ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogConfig } from "@/hooks/useApi";

/* ── Types ── */
type LogLevel = "info" | "warn" | "error" | "debug" | "success";

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  node?: string;
  message: string;
  details?: string;
  executionId?: string;
}

/* ── Mock log stream ── */
const mockLogs: LogEntry[] = [
  { id: "l1", timestamp: "14:32:01.120", level: "info", node: "Typeform Trigger", message: "Webhook received: form submission from user@example.com", executionId: "#48291" },
  { id: "l2", timestamp: "14:32:01.245", level: "info", node: "Typeform Trigger", message: "Parsed 12 form fields, 1 item output", executionId: "#48291" },
  { id: "l3", timestamp: "14:32:01.380", level: "debug", node: "Clearbit Enrich", message: "API request: GET https://api.clearbit.com/v2/people/find?email=user@example.com", executionId: "#48291" },
  { id: "l4", timestamp: "14:32:02.210", level: "info", node: "Clearbit Enrich", message: "Response 200 OK in 830ms — enriched contact data", executionId: "#48291" },
  { id: "l5", timestamp: "14:32:02.350", level: "debug", node: "GPT-4o Score", message: "Prompt: 'Score this lead on 0-100 scale based on: ...' (1,247 tokens)", executionId: "#48291" },
  { id: "l6", timestamp: "14:32:04.450", level: "info", node: "GPT-4o Score", message: "Response received in 2.1s — Score: 82/100, Confidence: HIGH", executionId: "#48291" },
  { id: "l7", timestamp: "14:32:04.462", level: "info", node: "IF Score > 70", message: "Condition TRUE: 82 > 70 → routing to true branch", executionId: "#48291" },
  { id: "l8", timestamp: "14:32:04.480", level: "info", node: "HubSpot Create", message: "Creating contact in HubSpot CRM...", executionId: "#48291" },
  { id: "l9", timestamp: "14:32:04.930", level: "success", node: "HubSpot Create", message: "Contact created: ID hs_12345 in 450ms", executionId: "#48291" },
  { id: "l10", timestamp: "14:32:04.500", level: "info", node: "Slack Notify", message: "Sending notification to #sales-leads channel", executionId: "#48291" },
  { id: "l11", timestamp: "14:32:04.730", level: "success", node: "Slack Notify", message: "Message sent successfully in 230ms", executionId: "#48291" },
  { id: "l12", timestamp: "14:32:04.960", level: "info", node: "Error Handler", message: "No errors captured — pass-through in 45ms", executionId: "#48291" },
  { id: "l13", timestamp: "14:32:05.010", level: "warn", node: "Log to Database", message: "Connection pool near capacity (18/20 connections)", executionId: "#48291" },
  { id: "l14", timestamp: "14:32:05.500", level: "error", node: "Log to Database", message: "INSERT failed: UNIQUE constraint violation on execution_log.id", executionId: "#48291", details: 'Error: SQLITE_CONSTRAINT: UNIQUE constraint failed: execution_log.id\n  at Database.prepare (node:internal/sqlite:85:5)\n  at insertLog (/app/nodes/database.js:142:18)' },
  { id: "l15", timestamp: "14:32:05.510", level: "warn", node: "Log to Database", message: "Retry 1/3 — waiting 1000ms before retry", executionId: "#48291" },
  { id: "l16", timestamp: "14:32:06.520", level: "error", node: "Log to Database", message: "Retry 1 failed: same constraint violation", executionId: "#48291" },
  { id: "l17", timestamp: "14:32:07.540", level: "error", node: "Log to Database", message: "Retry 2 failed: connection timeout after 1000ms", executionId: "#48291" },
  { id: "l18", timestamp: "14:32:07.545", level: "error", node: "Log to Database", message: "Node failed after 3 attempts — execution completed with errors", executionId: "#48291" },
];

/* ── Level config ── */
const levelConfig: Record<LogLevel, { icon: typeof Info; color: string; bg: string; label: string }> = {
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", label: "INFO" },
  warn: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", label: "WARN" },
  error: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "ERROR" },
  debug: { icon: Bug, color: "text-zinc-400", bg: "bg-zinc-500/10", label: "DEBUG" },
  success: { icon: Zap, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "OK" },
};

export function LogStreamingPanel() {
  const { data: logConfig } = useLogConfig();
  const [logs, setLogs] = useState(mockLogs);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "all">("all");
  const [nodeFilter, setNodeFilter] = useState<string>("all");
  const [paused, setPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Apply backend log level config as default filter
  useEffect(() => {
    if (logConfig && logConfig.level) {
      // Backend returns the minimum log level; we leave filter at "all" but could restrict
    }
  }, [logConfig]);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Simulate live streaming
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setLogs(prev => {
        if (prev.length >= 25) return prev;
        const newLog: LogEntry = {
          id: `live-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }) + "." + String(Date.now() % 1000).padStart(3, "0"),
          level: ["info", "debug", "info", "success"][Math.floor(Math.random() * 4)] as LogLevel,
          node: ["Typeform Trigger", "Clearbit Enrich", "GPT-4o Score", "HubSpot Create"][Math.floor(Math.random() * 4)],
          message: [
            "Processing incoming webhook payload",
            "API response cached for 60s",
            "Token usage: 342 input, 156 output",
            "Record created successfully",
          ][Math.floor(Math.random() * 4)],
          executionId: "#48292",
        };
        return [...prev, newLog];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [paused]);

  // Get unique nodes
  const nodeNames = [...new Set(mockLogs.map(l => l.node).filter(Boolean))];

  // Filter logs
  const filtered = logs.filter(log => {
    if (levelFilter !== "all" && log.level !== levelFilter) return false;
    if (nodeFilter !== "all" && log.node !== nodeFilter) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase()) && !log.node?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Stats
  const errorCount = logs.filter(l => l.level === "error").length;
  const warnCount = logs.filter(l => l.level === "warn").length;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Terminal size={14} className="text-emerald-500" />
          <span className="text-[12px] font-semibold text-zinc-200">Log Stream</span>
          <span className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium",
            paused ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
          )}>
            <Circle size={5} className={cn("fill-current", !paused && "animate-pulse")} />
            {paused ? "Paused" : "Live"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Error/warn badges */}
          {errorCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-bold text-red-400">
              <XCircle size={8} /> {errorCount}
            </span>
          )}
          {warnCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-400">
              <AlertTriangle size={8} /> {warnCount}
            </span>
          )}
          <button
            onClick={() => setPaused(!paused)}
            className={cn(
              "rounded-md p-1.5 text-zinc-400 hover:text-zinc-200 transition-colors",
              paused && "bg-amber-500/20 text-amber-400"
            )}
            title={paused ? "Resume" : "Pause"}
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
          </button>
          <button
            onClick={() => { setLogs([]); }}
            className="rounded-md p-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Clear"
          >
            <Trash2 size={12} />
          </button>
          <button className="rounded-md p-1.5 text-zinc-400 hover:text-zinc-200 transition-colors" title="Export">
            <Download size={12} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 border-b border-zinc-800/50 px-4 py-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs…"
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 py-1 pl-7 pr-3 text-[10px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>

        {/* Level filter */}
        <div className="flex items-center gap-0.5 rounded-md border border-zinc-700 p-0.5">
          <button
            onClick={() => setLevelFilter("all")}
            className={cn(
              "rounded px-2 py-0.5 text-[9px] font-medium transition-colors",
              levelFilter === "all" ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            All
          </button>
          {(Object.entries(levelConfig) as [LogLevel, typeof levelConfig[LogLevel]][]).map(([level, cfg]) => (
            <button
              key={level}
              onClick={() => setLevelFilter(levelFilter === level ? "all" : level)}
              className={cn(
                "rounded px-2 py-0.5 text-[9px] font-medium transition-colors",
                levelFilter === level ? cfg.bg + " " + cfg.color : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Node filter */}
        <select
          value={nodeFilter}
          onChange={e => setNodeFilter(e.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] text-zinc-400 focus:outline-none"
        >
          <option value="all">All Nodes</option>
          {nodeNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <div className="flex-1" />
        <span className="text-[9px] text-zinc-600">{filtered.length} / {logs.length} entries</span>
      </div>

      {/* Log entries */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto font-mono text-[10px] leading-relaxed">
        {filtered.map(log => {
          const cfg = levelConfig[log.level];
          const Icon = cfg.icon;
          const isExpanded = expandedLog === log.id;

          return (
            <div key={log.id}>
              <button
                onClick={() => log.details ? setExpandedLog(isExpanded ? null : log.id) : undefined}
                className={cn(
                  "flex w-full items-start gap-2 px-4 py-1 text-left transition-colors border-l-2",
                  isExpanded ? "bg-zinc-900 border-l-blue-500" : "hover:bg-zinc-900/50 border-l-transparent",
                  log.level === "error" && "bg-red-500/5"
                )}
              >
                {/* Timestamp */}
                <span className="text-zinc-600 w-[85px] flex-shrink-0 tabular-nums">{log.timestamp}</span>

                {/* Level badge */}
                <span className={cn("rounded px-1 py-0 text-[8px] font-bold w-10 text-center flex-shrink-0", cfg.bg, cfg.color)}>
                  {cfg.label}
                </span>

                {/* Node name */}
                {log.node && (
                  <span className="text-violet-400 w-[120px] flex-shrink-0 truncate">[{log.node}]</span>
                )}

                {/* Message */}
                <span className={cn(
                  "flex-1 break-words",
                  log.level === "error" ? "text-red-400" :
                  log.level === "warn" ? "text-amber-400" :
                  log.level === "success" ? "text-emerald-400" :
                  log.level === "debug" ? "text-zinc-500" :
                  "text-zinc-300"
                )}>
                  {log.message}
                </span>

                {/* Execution ID */}
                {log.executionId && (
                  <span className="text-zinc-700 flex-shrink-0">{log.executionId}</span>
                )}

                {/* Expand indicator */}
                {log.details && (
                  <ChevronDown size={10} className={cn("text-zinc-600 flex-shrink-0 transition-transform", isExpanded && "rotate-180")} />
                )}
              </button>

              {/* Expanded details */}
              {isExpanded && log.details && (
                <div className="bg-zinc-900 border-l-2 border-l-blue-500 px-4 py-2 ml-[97px]">
                  <pre className="text-[9px] text-red-400/80 whitespace-pre-wrap leading-relaxed">{log.details}</pre>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <Terminal size={24} className="mb-2" />
            <p className="text-xs">No log entries match your filters</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-1.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn(
              "flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-medium transition-colors",
              autoScroll ? "bg-blue-500/20 text-blue-400" : "text-zinc-600 hover:text-zinc-400"
            )}
          >
            <ArrowDown size={8} />
            Auto-scroll {autoScroll ? "ON" : "OFF"}
          </button>
        </div>
        <span className="text-[9px] text-zinc-700">
          {logs.length} total entries · {errorCount} errors · {warnCount} warnings
        </span>
      </div>
    </div>
  );
}
