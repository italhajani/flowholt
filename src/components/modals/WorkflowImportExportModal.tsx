import { useState } from "react";
import {
  X, Upload, Download, FileJson, Link, Copy, Check, ChevronRight,
  AlertTriangle, Folder, Globe, Search, Star, Clock, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── preset templates ── */
const presetTemplates = [
  { id: "t1", name: "Salesforce → Slack Notification", category: "Sales", nodes: 4, icon: "🔔" },
  { id: "t2", name: "Webhook → Google Sheets Logger", category: "Data", nodes: 3, icon: "📊" },
  { id: "t3", name: "Gmail → AI Summarizer → Notion", category: "Productivity", nodes: 5, icon: "✉️" },
  { id: "t4", name: "Cron → API Health Check → PagerDuty", category: "DevOps", nodes: 4, icon: "🏥" },
  { id: "t5", name: "Typeform → Clearbit → HubSpot", category: "Sales", nodes: 5, icon: "📝" },
  { id: "t6", name: "Stripe Webhook → Invoice → Email", category: "Finance", nodes: 4, icon: "💳" },
];

const categories = ["All", "Sales", "Data", "Productivity", "DevOps", "Finance"];

/* ── merge strategies ── */
const mergeStrategies = [
  { id: "overwrite", label: "Overwrite existing", desc: "Replace current workflow entirely", icon: "♻️" },
  { id: "copy", label: "Create copy", desc: "Import as a new workflow alongside existing", icon: "📋" },
  { id: "merge", label: "Merge fields", desc: "Add new nodes, keep existing connections", icon: "🔀" },
];

/* ── export config ── */
const exportFormats = [
  { id: "json", label: "JSON", ext: ".json", desc: "Standard workflow export" },
  { id: "yaml", label: "YAML", ext: ".yaml", desc: "Human-readable format" },
  { id: "template", label: "Template Package", ext: ".fht", desc: "With metadata for sharing" },
];

const credentialOptions = [
  { id: "strip", label: "Strip credentials", desc: "Remove all credential values" },
  { id: "placeholder", label: "Use placeholders", desc: "Replace with {{CREDENTIAL_NAME}}" },
  { id: "include", label: "Include credentials", desc: "⚠️ Include actual values (not recommended)" },
];

interface WorkflowImportExportModalProps {
  open: boolean;
  onClose: () => void;
  mode?: "import" | "export";
}

export function WorkflowImportExportModal({ open, onClose, mode: initialMode = "import" }: WorkflowImportExportModalProps) {
  const [mode, setMode] = useState<"import" | "export">(initialMode);
  const [importSource, setImportSource] = useState<"file" | "url" | "preset">("file");
  const [importUrl, setImportUrl] = useState("");
  const [mergeStrategy, setMergeStrategy] = useState("copy");
  const [importedJson, setImportedJson] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [presetCategory, setPresetCategory] = useState("All");
  const [presetSearch, setPresetSearch] = useState("");

  const [exportFormat, setExportFormat] = useState("json");
  const [credentialMode, setCredentialMode] = useState("strip");
  const [exportName, setExportName] = useState("My Workflow");
  const [exportDesc, setExportDesc] = useState("");
  const [exportCategory, setExportCategory] = useState("General");
  const [exported, setExported] = useState(false);

  const filteredPresets = presetTemplates.filter(p => {
    if (presetCategory !== "All" && p.category !== presetCategory) return false;
    if (presetSearch && !p.name.toLowerCase().includes(presetSearch.toLowerCase())) return false;
    return true;
  });

  const handleImport = () => {
    setImporting(true);
    setTimeout(() => { setImporting(false); setImported(true); setTimeout(() => setImported(false), 2000); }, 1500);
  };

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const handleFileDrop = () => {
    setImportedJson(JSON.stringify({
      name: "Imported Workflow",
      nodes: [
        { name: "Webhook Trigger", type: "trigger" },
        { name: "Transform Data", type: "code" },
        { name: "Send to Slack", type: "integration" },
      ],
      connections: { "Webhook Trigger": { "Transform Data": {} }, "Transform Data": { "Send to Slack": {} } },
    }, null, 2));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[680px] max-h-[85vh] flex flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100">
              {mode === "import" ? <Upload size={14} className="text-zinc-600" /> : <Download size={14} className="text-zinc-600" />}
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-zinc-900">{mode === "import" ? "Import Workflow" : "Export Workflow"}</h2>
              <p className="text-[10px] text-zinc-500">{mode === "import" ? "Import from file, URL, or preset template" : "Export as JSON, YAML, or template package"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-zinc-200 p-0.5">
              {(["import", "export"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-3 py-1 text-[10px] font-medium transition-all capitalize",
                    mode === m ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                  )}
                >
                  {m === "import" ? <Upload size={10} /> : <Download size={10} />}{m}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {mode === "import" ? (
            <div className="space-y-4">
              {/* Import source tabs */}
              <div className="flex rounded-lg border border-zinc-200 p-0.5">
                {([
                  { id: "file", label: "From File", icon: FileJson },
                  { id: "url", label: "From URL", icon: Link },
                  { id: "preset", label: "Preset Templates", icon: Star },
                ] as const).map(s => (
                  <button
                    key={s.id}
                    onClick={() => setImportSource(s.id)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[11px] font-medium transition-all",
                      importSource === s.id ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                    )}
                  >
                    <s.icon size={12} />{s.label}
                  </button>
                ))}
              </div>

              {/* File import */}
              {importSource === "file" && (
                <div>
                  <div
                    onClick={handleFileDrop}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 py-12 cursor-pointer hover:border-zinc-400 hover:bg-zinc-100 transition-all"
                  >
                    <FileJson size={32} className="text-zinc-300 mb-3" />
                    <p className="text-[12px] font-medium text-zinc-600">Drop workflow file here or click to browse</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Supports .json, .yaml, .fht files</p>
                  </div>
                  {importedJson && (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-[11px] font-medium text-emerald-700">File loaded successfully</span>
                      </div>
                      <pre className="max-h-32 overflow-auto rounded-md bg-zinc-950 p-2 text-[10px] font-mono text-emerald-400 leading-relaxed">
                        {importedJson}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* URL import */}
              {importSource === "url" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Workflow URL</label>
                    <div className="mt-1 flex gap-2">
                      <input
                        value={importUrl}
                        onChange={e => setImportUrl(e.target.value)}
                        placeholder="https://example.com/workflow.json"
                        className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
                      />
                      <button
                        onClick={handleFileDrop}
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-[11px] font-medium text-white hover:bg-zinc-800 transition-colors"
                      >
                        Fetch
                      </button>
                    </div>
                  </div>
                  <div className="rounded-md bg-blue-50 border border-blue-100 px-3 py-2 flex items-start gap-2">
                    <Link size={10} className="text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-blue-700 font-medium">Supported sources</p>
                      <p className="text-[9px] text-blue-600 mt-0.5">GitHub raw files, Gist URLs, FlowHolt share links, direct JSON URLs</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Preset templates */}
              {importSource === "preset" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        value={presetSearch}
                        onChange={e => setPresetSearch(e.target.value)}
                        placeholder="Search templates…"
                        className="w-full rounded-lg border border-zinc-200 py-1.5 pl-8 pr-3 text-[11px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
                      />
                    </div>
                    <div className="flex rounded-lg border border-zinc-200 p-0.5">
                      {categories.map(c => (
                        <button
                          key={c}
                          onClick={() => setPresetCategory(c)}
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[9px] font-medium transition-all",
                            presetCategory === c ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-700"
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredPresets.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setImportedJson(JSON.stringify({ name: p.name, template: true }, null, 2))}
                        className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 text-left hover:border-zinc-300 hover:bg-zinc-50 transition-all"
                      >
                        <span className="text-xl">{p.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-zinc-700 truncate">{p.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[8px] text-zinc-500">{p.category}</span>
                            <span className="text-[9px] text-zinc-400">{p.nodes} nodes</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Merge strategy (shown when file/url loaded) */}
              {(importedJson || importSource === "url") && (
                <div>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Conflict Resolution</p>
                  <div className="space-y-1.5">
                    {mergeStrategies.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setMergeStrategy(s.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
                          mergeStrategy === s.id ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900/10" : "border-zinc-200 hover:border-zinc-300"
                        )}
                      >
                        <span className="text-lg">{s.icon}</span>
                        <div>
                          <p className="text-[11px] font-medium text-zinc-700">{s.label}</p>
                          <p className="text-[9px] text-zinc-400">{s.desc}</p>
                        </div>
                        {mergeStrategy === s.id && <Check size={14} className="text-zinc-900 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Export mode */
            <div className="space-y-4">
              {/* Export metadata */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Workflow Name</label>
                  <input
                    value={exportName}
                    onChange={e => setExportName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-[12px] text-zinc-700 focus:outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Category</label>
                  <select
                    value={exportCategory}
                    onChange={e => setExportCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-[12px] text-zinc-700 focus:outline-none focus:border-zinc-400"
                  >
                    <option>General</option>
                    <option>Sales</option>
                    <option>Marketing</option>
                    <option>DevOps</option>
                    <option>Finance</option>
                    <option>Productivity</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={exportDesc}
                  onChange={e => setExportDesc(e.target.value)}
                  rows={2}
                  placeholder="Describe what this workflow does…"
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-[12px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 resize-none"
                />
              </div>

              {/* Export format */}
              <div>
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Export Format</p>
                <div className="flex gap-2">
                  {exportFormats.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setExportFormat(f.id)}
                      className={cn(
                        "flex-1 rounded-lg border p-3 text-left transition-all",
                        exportFormat === f.id ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900/10" : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <p className="text-[11px] font-medium text-zinc-700">{f.label} <span className="text-zinc-400 font-mono">{f.ext}</span></p>
                      <p className="text-[9px] text-zinc-400 mt-0.5">{f.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Credential handling */}
              <div>
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Credential Handling</p>
                <div className="space-y-1.5">
                  {credentialOptions.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setCredentialMode(c.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all",
                        credentialMode === c.id ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300",
                        c.id === "include" && credentialMode === c.id && "border-amber-400 bg-amber-50"
                      )}
                    >
                      <div className="flex-1">
                        <p className="text-[11px] font-medium text-zinc-700">{c.label}</p>
                        <p className="text-[9px] text-zinc-400">{c.desc}</p>
                      </div>
                      {credentialMode === c.id && <Check size={12} className="text-zinc-700" />}
                    </button>
                  ))}
                </div>
                {credentialMode === "include" && (
                  <div className="mt-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 flex items-start gap-2">
                    <AlertTriangle size={12} className="text-amber-500 mt-0.5" />
                    <p className="text-[10px] text-amber-700">Including credentials exposes sensitive data. Only use for private backups.</p>
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Eye size={10} className="text-zinc-500" />
                  <span className="text-[10px] font-medium text-zinc-500">Export Preview</span>
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between"><span className="text-zinc-500">Format:</span><span className="text-zinc-700 font-medium">{exportFormats.find(f => f.id === exportFormat)?.label}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Nodes:</span><span className="text-zinc-700 font-medium">6 nodes, 5 connections</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Credentials:</span><span className="text-zinc-700 font-medium">{credentialOptions.find(c => c.id === credentialMode)?.label}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Est. size:</span><span className="text-zinc-700 font-medium">~4.2 KB</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3">
          <button onClick={onClose} className="rounded-lg border border-zinc-200 px-4 py-1.5 text-[11px] text-zinc-600 hover:bg-zinc-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={mode === "import" ? handleImport : handleExport}
            disabled={mode === "import" && !importedJson && importSource !== "url"}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-5 py-1.5 text-[11px] font-medium transition-all",
              (imported || exported)
                ? "bg-emerald-600 text-white"
                : "bg-zinc-900 text-white hover:bg-zinc-800",
              mode === "import" && !importedJson && importSource !== "url" && "opacity-50 cursor-not-allowed"
            )}
          >
            {importing ? <><Zap size={12} className="animate-spin" /> Importing…</>
              : imported ? <><Check size={12} /> Imported!</>
              : exported ? <><Check size={12} /> Exported!</>
              : mode === "import" ? <><Upload size={12} /> Import Workflow</>
              : <><Download size={12} /> Export Workflow</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
