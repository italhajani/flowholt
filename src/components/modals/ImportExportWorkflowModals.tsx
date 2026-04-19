import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Upload, Download, FileJson, Link2, Copy, Globe, Code2,
  CheckCircle2, AlertCircle, FileText, ArrowRight, Clipboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Import Modal ── */
interface ImportWorkflowModalProps {
  open: boolean;
  onClose: () => void;
}

type ImportMethod = "file" | "url" | "json" | "curl";

export function ImportWorkflowModal({ open, onClose }: ImportWorkflowModalProps) {
  const [method, setMethod] = useState<ImportMethod>("file");
  const [url, setUrl] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [curlInput, setCurlInput] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [importedFile, setImportedFile] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleImport = () => {
    setImporting(true);
    setTimeout(() => { setImporting(false); onClose(); }, 1500);
  };

  const methods: { id: ImportMethod; label: string; icon: typeof Upload; desc: string }[] = [
    { id: "file", label: "File Upload", icon: Upload, desc: "JSON or ZIP" },
    { id: "url", label: "From URL", icon: Link2, desc: "Import from link" },
    { id: "json", label: "Paste JSON", icon: Code2, desc: "Raw workflow JSON" },
    { id: "curl", label: "From cURL", icon: Clipboard, desc: "Convert API call" },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Import Workflow" className="max-w-lg">
      <div className="space-y-5">
        {/* Method selector */}
        <div className="grid grid-cols-4 gap-2">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border p-3 transition-all",
                method === m.id
                  ? "border-blue-300 bg-blue-50/50"
                  : "border-zinc-200 hover:border-zinc-300"
              )}
            >
              <m.icon size={16} className={method === m.id ? "text-blue-600" : "text-zinc-400"} />
              <span className={cn("text-[11px] font-medium", method === m.id ? "text-blue-700" : "text-zinc-600")}>{m.label}</span>
              <span className="text-[9px] text-zinc-400">{m.desc}</span>
            </button>
          ))}
        </div>

        {/* Method-specific input */}
        {method === "file" && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) setImportedFile(file.name);
            }}
            className={cn(
              "rounded-lg border-2 border-dashed p-8 text-center transition-all",
              isDragOver ? "border-blue-400 bg-blue-50/50" : importedFile ? "border-emerald-300 bg-emerald-50/30" : "border-zinc-200 hover:border-zinc-300"
            )}
          >
            {importedFile ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 size={24} className="text-emerald-500" />
                <p className="text-[13px] font-medium text-zinc-700">{importedFile}</p>
                <button onClick={() => setImportedFile(null)} className="text-[11px] text-zinc-400 hover:text-zinc-600">Remove</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={24} className="text-zinc-300" />
                <p className="text-[13px] text-zinc-600">Drop a .json or .zip file here</p>
                <p className="text-[11px] text-zinc-400">or click to browse</p>
              </div>
            )}
          </div>
        )}

        {method === "url" && (
          <div className="space-y-2">
            <Input
              prefix={<Link2 size={13} />}
              placeholder="https://example.com/workflow.json"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-[10px] text-zinc-400">Supports direct JSON URLs, GitHub raw links, and FlowHolt share links.</p>
          </div>
        )}

        {method === "json" && (
          <div className="space-y-2">
            <textarea
              className="w-full h-40 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-[11px] text-zinc-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 resize-none"
              placeholder='{"nodes": [...], "connections": {...}}'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Badge variant="outline"><FileJson size={9} /> JSON</Badge>
              <span className="text-[10px] text-zinc-400">Paste n8n, Make.com, or FlowHolt workflow JSON</span>
            </div>
          </div>
        )}

        {method === "curl" && (
          <div className="space-y-2">
            <textarea
              className="w-full h-32 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-[11px] text-zinc-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 resize-none"
              placeholder="curl -X POST https://api.example.com/..."
              value={curlInput}
              onChange={(e) => setCurlInput(e.target.value)}
            />
            <p className="text-[10px] text-zinc-400">Paste a cURL command and we'll convert it into a webhook trigger workflow.</p>
          </div>
        )}

        {/* Format compatibility */}
        <div className="rounded-lg bg-zinc-50 p-3">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Compatible Formats</p>
          <div className="flex items-center gap-2">
            <Badge variant="neutral">FlowHolt JSON</Badge>
            <Badge variant="neutral">n8n JSON</Badge>
            <Badge variant="outline">Make.com Blueprint</Badge>
            <Badge variant="outline">Zapier (beta)</Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleImport} disabled={importing}>
            {importing ? "Importing…" : "Import Workflow"}
            <ArrowRight size={12} />
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Export Modal ── */
interface ExportWorkflowModalProps {
  open: boolean;
  onClose: () => void;
  workflowName?: string;
}

type ExportFormat = "flowholt" | "n8n" | "make";

export function ExportWorkflowModal({ open, onClose, workflowName = "Untitled Workflow" }: ExportWorkflowModalProps) {
  const [format, setFormat] = useState<ExportFormat>("flowholt");
  const [includeCredentials, setIncludeCredentials] = useState(false);
  const [copied, setCopied] = useState(false);

  const formats: { id: ExportFormat; label: string; desc: string }[] = [
    { id: "flowholt", label: "FlowHolt JSON", desc: "Full workflow with metadata" },
    { id: "n8n", label: "n8n Compatible", desc: "Export as n8n workflow JSON" },
    { id: "make", label: "Make Blueprint", desc: "Export as Make.com scenario" },
  ];

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Export "${workflowName}"`} className="max-w-md">
      <div className="space-y-5">
        {/* Format picker */}
        <div className="space-y-2">
          {formats.map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border p-3 transition-all text-left",
                format === f.id
                  ? "border-blue-300 bg-blue-50/50"
                  : "border-zinc-200 hover:border-zinc-300"
              )}
            >
              <FileJson size={16} className={format === f.id ? "text-blue-600" : "text-zinc-400"} />
              <div>
                <p className={cn("text-[12px] font-medium", format === f.id ? "text-blue-700" : "text-zinc-700")}>{f.label}</p>
                <p className="text-[10px] text-zinc-400">{f.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Options */}
        <div className="rounded-lg border border-zinc-200 p-3 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCredentials}
              onChange={() => setIncludeCredentials(!includeCredentials)}
              className="rounded border-zinc-300"
            />
            <span className="text-[12px] text-zinc-600">Include credentials (encrypted)</span>
          </label>
          {includeCredentials && (
            <p className="text-[10px] text-amber-600 flex items-center gap-1">
              <AlertCircle size={10} /> Credentials will be AES-256 encrypted in the export file
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1" onClick={handleCopy}>
            {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy JSON"}
          </Button>
          <Button variant="primary" size="sm" className="flex-1" onClick={onClose}>
            <Download size={12} /> Download .json
          </Button>
        </div>
      </div>
    </Modal>
  );
}
