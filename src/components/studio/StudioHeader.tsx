import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  MoreHorizontal,
  ChevronDown,
  Share2,
  GitBranch,
  Copy,
  Download,
  Upload,
  Trash2,
  Archive,
  Settings,
  UserCog,
  Globe,
  AlertCircle,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PublishState = "draft" | "published" | "unsaved" | "publishing" | "invalid";
type Environment = "draft" | "staging" | "production";

const publishStateConfig: Record<PublishState, { label: string; color: string; dotColor: string }> = {
  draft:      { label: "Draft",           color: "bg-zinc-100 text-zinc-500",        dotColor: "bg-zinc-400" },
  published:  { label: "Published",       color: "bg-green-50 text-green-700",       dotColor: "bg-green-500" },
  unsaved:    { label: "Unsaved changes", color: "bg-amber-50 text-amber-700",       dotColor: "bg-amber-500" },
  publishing: { label: "Publishing…",     color: "bg-blue-50 text-blue-700",         dotColor: "bg-blue-500" },
  invalid:    { label: "Has errors",      color: "bg-red-50 text-red-600",           dotColor: "bg-red-500" },
};

const envConfig: Record<Environment, { label: string; color: string; dotColor: string }> = {
  draft:      { label: "Draft",      color: "bg-zinc-100 text-zinc-500",  dotColor: "bg-zinc-400" },
  staging:    { label: "Staging",    color: "bg-blue-50 text-blue-700",   dotColor: "bg-blue-500" },
  production: { label: "Production", color: "bg-green-50 text-green-700", dotColor: "bg-green-500" },
};

const workflowActions = [
  { label: "Duplicate",         icon: Copy,      danger: false },
  { label: "Export as JSON",    icon: Download,  danger: false },
  { label: "Import from file",  icon: Upload,    danger: false },
  { label: "Share",             icon: Share2,    danger: false },
  { label: "Change owner",      icon: UserCog,   danger: false },
  { label: "Push to Git",       icon: GitBranch, danger: false },
  { label: "Workflow settings", icon: Settings,  danger: false },
  { label: "Make public",       icon: Globe,     danger: false },
  null, // divider
  { label: "Archive",           icon: Archive,   danger: false },
  { label: "Delete",            icon: Trash2,    danger: true },
];

export function StudioHeader({ onBack }: { onBack: () => void }) {
  const [workflowName, setWorkflowName] = useState("Lead Qualification Pipeline");
  const [editingName, setEditingName] = useState(false);
  const [publishState, setPublishState] = useState<PublishState>("unsaved");
  const [environment, setEnvironment] = useState<Environment>("production");
  const [envMenuOpen, setEnvMenuOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const envRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingName) nameRef.current?.select();
  }, [editingName]);

  /* Close dropdowns on outside click */
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (envRef.current && !envRef.current.contains(e.target as Node)) setEnvMenuOpen(false);
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setActionsOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function commitName() {
    setEditingName(false);
    if (workflowName.trim() === "") setWorkflowName("Untitled Workflow");
    setPublishState("unsaved");
  }

  function handlePublish() {
    setPublishState("publishing");
    setTimeout(() => setPublishState("published"), 1500);
  }

  const ps = publishStateConfig[publishState];
  const env = envConfig[environment];

  return (
    <div className="flex h-12 items-center justify-between border-b border-zinc-100 bg-white px-4 gap-3">
      {/* Left */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onBack}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Inline-editable name */}
        {editingName ? (
          <input
            ref={nameRef}
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value.slice(0, 128))}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === "Enter") commitName(); if (e.key === "Escape") setEditingName(false); }}
            className="min-w-[160px] max-w-[280px] rounded-md border border-zinc-300 bg-white px-2 py-0.5 text-[14px] font-semibold text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            title="Click to rename"
            className="max-w-[280px] truncate text-[14px] font-semibold text-zinc-900 hover:text-zinc-600 transition-colors"
          >
            {workflowName}
          </button>
        )}

        {/* Publish state badge */}
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium flex-shrink-0", ps.color)}>
          {publishState === "publishing" ? (
            <Loader2 size={10} className="animate-spin" />
          ) : publishState === "invalid" ? (
            <AlertCircle size={10} />
          ) : publishState === "published" ? (
            <Check size={10} />
          ) : (
            <span className={cn("h-1.5 w-1.5 rounded-full", ps.dotColor)} />
          )}
          {ps.label}
        </span>
      </div>

      {/* Center */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Collaborator avatars */}
        <div className="flex -space-x-1.5">
          {["AB", "CK", "JL"].map((initials) => (
            <div
              key={initials}
              title={initials}
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-zinc-200 text-[9px] font-semibold text-zinc-600 select-none"
            >
              {initials}
            </div>
          ))}
        </div>

        {/* Environment chip with dropdown */}
        <div ref={envRef} className="relative">
          <button
            onClick={() => setEnvMenuOpen((o) => !o)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors hover:opacity-80",
              env.color
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", env.dotColor)} />
            {env.label}
            <ChevronDown size={10} />
          </button>
          {envMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border border-zinc-200 bg-white shadow-lg py-1">
              {(["draft", "staging", "production"] as Environment[]).map((e) => (
                <button
                  key={e}
                  onClick={() => { setEnvironment(e); setEnvMenuOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-[12px] transition-colors",
                    environment === e ? "text-zinc-900 font-medium" : "text-zinc-500 hover:bg-zinc-50"
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", envConfig[e].dotColor)} />
                  {envConfig[e].label}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
          v3.2
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="inline-flex h-7 items-center gap-1.5 rounded-md border border-zinc-200 px-3 text-[12px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
          <Share2 size={12} />
          Share
        </button>
        <button
          onClick={handlePublish}
          disabled={publishState === "publishing" || publishState === "published"}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium transition-colors",
            publishState === "published"
              ? "bg-green-50 text-green-700 cursor-default"
              : publishState === "publishing"
              ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              : "bg-emerald-500 text-white hover:bg-emerald-600"
          )}
        >
          {publishState === "publishing" && <Loader2 size={12} className="animate-spin" />}
          {publishState === "published" ? "Published" : publishState === "publishing" ? "Publishing…" : "Publish"}
        </button>

        {/* Actions dropdown */}
        <div ref={actionsRef} className="relative">
          <button
            onClick={() => setActionsOpen((o) => !o)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>
          {actionsOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-zinc-200 bg-white shadow-lg py-1">
              {workflowActions.map((action, i) =>
                action === null ? (
                  <div key={`divider-${i}`} className="my-1 border-t border-zinc-100" />
                ) : (
                  <button
                    key={action.label}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-1.5 text-[12px] transition-colors",
                      action.danger
                        ? "text-red-600 hover:bg-red-50"
                        : "text-zinc-600 hover:bg-zinc-50"
                    )}
                    onClick={() => setActionsOpen(false)}
                  >
                    <action.icon size={13} />
                    {action.label}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
