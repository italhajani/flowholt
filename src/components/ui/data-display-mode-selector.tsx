import { useState } from "react";
import {
  Table2, Code2, FileJson, Globe, Binary, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */
type DisplayMode = "table" | "json" | "schema" | "html" | "binary" | "raw";

interface DataDisplayModeSelectorProps {
  activeMode?: DisplayMode;
  availableModes?: DisplayMode[];
  onChange?: (mode: DisplayMode) => void;
  className?: string;
}

const modeConfig: Record<DisplayMode, { icon: typeof Table2; label: string; shortcut?: string }> = {
  table:  { icon: Table2,   label: "Table",  shortcut: "T" },
  json:   { icon: FileJson, label: "JSON",   shortcut: "J" },
  schema: { icon: Code2,    label: "Schema", shortcut: "S" },
  html:   { icon: Globe,    label: "HTML",   shortcut: "H" },
  binary: { icon: Binary,   label: "Binary", shortcut: "B" },
  raw:    { icon: FileText, label: "Raw",    shortcut: "R" },
};

/* ── Demo data ── */
const demoTableData = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "pending" },
  { id: 3, name: "Bob Wilson", email: "bob@example.com", status: "active" },
];

const demoJsonData = JSON.stringify(demoTableData, null, 2);

const demoSchemaData = {
  type: "array",
  items: {
    type: "object",
    properties: {
      id: { type: "number" },
      name: { type: "string" },
      email: { type: "string", format: "email" },
      status: { type: "string", enum: ["active", "pending", "inactive"] },
    },
  },
};

export function DataDisplayModeSelector({
  activeMode: controlledMode,
  availableModes = ["table", "json", "schema", "html", "binary", "raw"],
  onChange,
  className,
}: DataDisplayModeSelectorProps) {
  const [internalMode, setInternalMode] = useState<DisplayMode>("table");
  const mode = controlledMode ?? internalMode;

  const setMode = (m: DisplayMode) => {
    setInternalMode(m);
    onChange?.(m);
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Mode tabs */}
      <div className="flex items-center gap-0.5 border-b border-zinc-100 px-3 pb-0">
        {availableModes.map(m => {
          const cfg = modeConfig[m];
          const Icon = cfg.icon;
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 text-[11px] rounded-t-md transition-all border-b-2",
                active
                  ? "text-blue-600 border-blue-600 bg-blue-50/50 font-medium"
                  : "text-zinc-400 border-transparent hover:text-zinc-600 hover:bg-zinc-50"
              )}
              title={cfg.shortcut ? `${cfg.label} (${cfg.shortcut})` : cfg.label}
            >
              <Icon size={11} />
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto p-3 min-h-[180px]">
        {mode === "table" && <TableView data={demoTableData} />}
        {mode === "json" && <JsonView data={demoJsonData} />}
        {mode === "schema" && <SchemaView data={demoSchemaData} />}
        {mode === "html" && <HtmlView />}
        {mode === "binary" && <BinaryView />}
        {mode === "raw" && <RawView data={demoJsonData} />}
      </div>
    </div>
  );
}

/* ── Sub-views ── */

function TableView({ data }: { data: Record<string, unknown>[] }) {
  if (!data.length) return <p className="text-[11px] text-zinc-400">No data</p>;
  const keys = Object.keys(data[0]);
  return (
    <div className="overflow-x-auto rounded-md border border-zinc-100">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="bg-zinc-50">
            {keys.map(k => (
              <th key={k} className="px-3 py-1.5 text-left font-medium text-zinc-500 border-b border-zinc-100">
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-zinc-50 hover:bg-blue-50/30 transition-colors">
              {keys.map(k => (
                <td key={k} className="px-3 py-1.5 text-zinc-700 font-mono">
                  {String(row[k])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function JsonView({ data }: { data: string }) {
  return (
    <pre className="rounded-md bg-zinc-900 text-green-300 p-3 text-[11px] font-mono overflow-auto max-h-[400px] leading-relaxed">
      {data}
    </pre>
  );
}

function SchemaView({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] text-zinc-500 font-medium mb-2">JSON Schema</div>
      <pre className="rounded-md bg-zinc-50 border border-zinc-100 p-3 text-[11px] font-mono text-zinc-700 overflow-auto max-h-[400px]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function HtmlView() {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-4 text-[12px]">
      <div className="text-zinc-400 text-[11px] mb-2 font-medium">HTML Preview</div>
      <div className="prose prose-sm max-w-none">
        <p className="text-zinc-600">HTML content will be rendered here when available.</p>
      </div>
    </div>
  );
}

function BinaryView() {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <Binary size={24} className="text-zinc-300" />
      <p className="text-[12px] text-zinc-500 font-medium">Binary Data</p>
      <p className="text-[11px] text-zinc-400">3.2 KB | application/octet-stream</p>
      <button className="mt-2 rounded-md bg-zinc-100 px-3 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-200 transition-colors">
        Download File
      </button>
    </div>
  );
}

function RawView({ data }: { data: string }) {
  return (
    <pre className="rounded-md bg-zinc-50 border border-zinc-100 p-3 text-[11px] font-mono text-zinc-600 overflow-auto max-h-[400px] whitespace-pre-wrap break-all">
      {data}
    </pre>
  );
}
