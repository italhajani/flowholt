import { useState, useCallback, useRef } from "react";
import {
  Upload, CheckCircle2, AlertTriangle, Loader2,
  Trash2, ChevronDown, ChevronRight, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

/* ── Types ── */
interface UploadFile {
  id: string;
  name: string;
  size: string;
  format: string;
  status: "pending" | "uploading" | "processing" | "chunking" | "indexing" | "done" | "error";
  progress: number;
  chunks?: number;
  error?: string;
}

interface KnowledgeUploadModalProps {
  open: boolean;
  onClose: () => void;
}

const formatIcons: Record<string, string> = {
  pdf: "📄",
  md: "📝",
  csv: "📊",
  json: "🔧",
  txt: "📃",
  html: "🌐",
  docx: "📋",
};

const supportedFormats = ["PDF", "Markdown", "CSV", "JSON", "TXT", "HTML", "DOCX"];

const statusConfig: Record<string, { color: string; label: string }> = {
  pending:    { color: "text-zinc-400", label: "Pending" },
  uploading:  { color: "text-blue-500", label: "Uploading…" },
  processing: { color: "text-amber-500", label: "Processing…" },
  chunking:   { color: "text-violet-500", label: "Chunking…" },
  indexing:    { color: "text-emerald-500", label: "Indexing…" },
  done:       { color: "text-green-600", label: "Complete" },
  error:      { color: "text-red-500", label: "Error" },
};

/* ── Chunking Strategy options ── */
const chunkStrategies = [
  { id: "auto", label: "Auto (Recommended)", desc: "Automatically detect document structure" },
  { id: "fixed", label: "Fixed Size", desc: "Split into chunks of N tokens" },
  { id: "paragraph", label: "Paragraph-Based", desc: "Split by paragraph boundaries" },
  { id: "semantic", label: "Semantic", desc: "AI-powered semantic boundaries" },
];

/* ── Simulate upload progress ── */
function simulateProgress(
  setFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>,
  fileId: string
) {
  const stages: UploadFile["status"][] = ["uploading", "processing", "chunking", "indexing", "done"];
  let stageIdx = 0;
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress >= 100) {
      stageIdx++;
      if (stageIdx >= stages.length) {
        clearInterval(interval);
        return;
      }
      progress = stageIdx === stages.length - 1 ? 100 : 0;
    }

    setFiles(prev => prev.map(f => {
      if (f.id !== fileId) return f;
      return {
        ...f,
        status: stages[stageIdx],
        progress: Math.min(progress, 100),
        chunks: stageIdx >= 2 ? Math.floor(Math.random() * 200) + 50 : undefined,
      };
    }));
  }, 400);
}

export function KnowledgeUploadModal({ open, onClose }: KnowledgeUploadModalProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [chunkStrategy, setChunkStrategy] = useState("auto");
  const [chunkSize, setChunkSize] = useState(512);
  const [chunkOverlap, setChunkOverlap] = useState(50);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [targetAgent, setTargetAgent] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((names: string[]) => {
    const newFiles: UploadFile[] = names.map((name, i) => {
      const ext = name.split(".").pop()?.toLowerCase() ?? "txt";
      const sizeKB = Math.floor(Math.random() * 10000) + 100;
      return {
        id: `f-${Date.now()}-${i}`,
        name,
        size: sizeKB > 1000 ? `${(sizeKB / 1000).toFixed(1)} MB` : `${sizeKB} KB`,
        format: ext.toUpperCase(),
        status: "pending",
        progress: 0,
      };
    });
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const names = Array.from(e.dataTransfer.files).map(f => f.name);
    addFiles(names);
  }, [addFiles]);

  const handleFileSelect = useCallback(() => {
    // Simulate file selection
    addFiles(["Product_Guide_v4.pdf", "API_Reference.md", "Customer_Data.csv"]);
  }, [addFiles]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const startUpload = () => {
    setFiles(prev => prev.map(f => ({ ...f, status: "uploading" as const, progress: 0 })));
    files.forEach(f => simulateProgress(setFiles, f.id));
  };

  const allDone = files.length > 0 && files.every(f => f.status === "done");
  const anyUploading = files.some(f => !["pending", "done", "error"].includes(f.status));

  const footerContent = (
    <>
      <p className="text-[10px] text-zinc-400 mr-auto">
        {allDone ? `✓ ${files.length} assets uploaded and indexed` : `${supportedFormats.length} formats supported`}
      </p>
      <Button variant="secondary" size="sm" onClick={onClose}>
        {allDone ? "Close" : "Cancel"}
      </Button>
      {!allDone && (
        <Button
          variant="primary"
          size="sm"
          onClick={startUpload}
          disabled={files.length === 0 || anyUploading}
        >
          {anyUploading ? (
            <><Loader2 size={12} className="animate-spin" /> Processing…</>
          ) : (
            <><Upload size={12} /> Upload & Index</>
          )}
        </Button>
      )}
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload Knowledge Assets"
      description="Upload documents for AI agent knowledge bases"
      width="w-[640px]"
      footer={footerContent}
    >
      <div className="space-y-4">
        {/* Drag-drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all",
            dragOver ? "border-violet-400 bg-violet-50/50" : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-zinc-50"
          )}
        >
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
          <Upload size={32} className={cn("mx-auto mb-3", dragOver ? "text-violet-500" : "text-zinc-300")} />
          <p className="text-[13px] font-medium text-zinc-700 mb-1">
            {dragOver ? "Drop files here" : "Drag & drop files or click to browse"}
          </p>
          <p className="text-[11px] text-zinc-400">
            Supports {supportedFormats.join(", ")} • Max 50 MB per file
          </p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-500">{files.length} file{files.length > 1 ? "s" : ""} selected</span>
              {!anyUploading && (
                <button onClick={() => setFiles([])} className="text-[10px] text-zinc-400 hover:text-red-500 transition-colors">
                  Clear all
                </button>
              )}
            </div>
            {files.map(file => {
              const sc = statusConfig[file.status];
              const ext = file.name.split(".").pop()?.toLowerCase() ?? "txt";
              return (
                <div key={file.id} className="rounded-lg border border-zinc-200 bg-white p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{formatIcons[ext] ?? "📄"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-zinc-700 truncate">{file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-zinc-400">{file.size}</span>
                        <span className="text-[10px] text-zinc-300">•</span>
                        <span className={cn("text-[10px] font-medium", sc.color)}>{sc.label}</span>
                        {file.chunks && <span className="text-[10px] text-zinc-400">• {file.chunks} chunks</span>}
                      </div>
                    </div>
                    {file.status === "pending" && (
                      <button onClick={() => removeFile(file.id)} className="text-zinc-400 hover:text-red-500 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    )}
                    {file.status === "done" && <CheckCircle2 size={14} className="text-green-500" />}
                    {file.status === "error" && <AlertTriangle size={14} className="text-red-500" />}
                    {!["pending", "done", "error"].includes(file.status) && (
                      <Loader2 size={14} className="text-violet-500 animate-spin" />
                    )}
                  </div>
                  {!["pending", "done"].includes(file.status) && (
                    <div className="mt-2 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          file.status === "error" ? "bg-red-400" : file.status === "done" ? "bg-green-500" : "bg-violet-500"
                        )}
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Configuration */}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-medium text-zinc-500 mb-1 block">Target Agent</label>
            <select
              value={targetAgent}
              onChange={e => setTargetAgent(e.target.value)}
              className="h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[12px] text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
            >
              <option value="all">All Agents (Workspace-level)</option>
              <option value="agent-001">Customer Support Bot</option>
              <option value="agent-002">Sales Assistant</option>
              <option value="agent-003">Code Review Agent</option>
            </select>
          </div>

          <button
            onClick={() => setShowAdvanced(o => !o)}
            className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            {showAdvanced ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            <Settings size={10} />
            Advanced Chunking Settings
          </button>

          {showAdvanced && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 space-y-3">
              <div>
                <label className="text-[10px] font-medium text-zinc-500 mb-1.5 block">Chunking Strategy</label>
                <div className="grid grid-cols-2 gap-2">
                  {chunkStrategies.map(cs => (
                    <button
                      key={cs.id}
                      onClick={() => setChunkStrategy(cs.id)}
                      className={cn(
                        "rounded-lg border p-2 text-left transition-all",
                        chunkStrategy === cs.id ? "border-violet-300 bg-violet-50" : "border-zinc-200 bg-white hover:border-zinc-300"
                      )}
                    >
                      <p className="text-[11px] font-medium text-zinc-700">{cs.label}</p>
                      <p className="text-[9px] text-zinc-400">{cs.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-medium text-zinc-500 mb-1 block">Chunk Size (tokens)</label>
                  <input
                    type="number"
                    value={chunkSize}
                    onChange={e => setChunkSize(Number(e.target.value))}
                    className="h-7 w-full rounded-md border border-zinc-200 bg-white px-2 text-[11px] font-mono text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-zinc-500 mb-1 block">Overlap (tokens)</label>
                  <input
                    type="number"
                    value={chunkOverlap}
                    onChange={e => setChunkOverlap(Number(e.target.value))}
                    className="h-7 w-full rounded-md border border-zinc-200 bg-white px-2 text-[11px] font-mono text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900/10"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
