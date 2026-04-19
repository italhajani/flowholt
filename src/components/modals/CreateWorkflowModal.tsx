import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Zap, Clock, Globe, FolderOpen, Tag, Plus, X, ChevronDown, MessageSquare, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateWorkflowModalProps {
  open: boolean;
  onClose: () => void;
}

const triggers = [
  { id: "manual",   label: "Manual",     desc: "Run on demand via button or API",      icon: Zap },
  { id: "schedule", label: "Schedule",   desc: "Cron expression or fixed interval",    icon: Clock },
  { id: "webhook",  label: "Webhook",    desc: "HTTP POST/GET trigger endpoint",       icon: Globe },
  { id: "event",    label: "Event",      desc: "React to workflow or system events",   icon: MessageSquare },
  { id: "ai-chat",  label: "AI Chat",    desc: "Trigger via chat message to agent",    icon: Bot },
] as const;

const templates = [
  { id: "blank",    label: "Blank workflow",            badge: null,       desc: "Start from scratch" },
  { id: "slack",    label: "Slack → Sheets Logger",     badge: "Popular",  desc: "Log Slack messages to Google Sheets" },
  { id: "lead",     label: "Lead Qualification (AI)",   badge: "AI",       desc: "Score and route leads with AI" },
  { id: "report",   label: "Daily Report Generator",    badge: null,       desc: "Aggregate data into daily summaries" },
  { id: "onboard",  label: "Customer Onboarding",       badge: "Popular",  desc: "Multi-step welcome sequence" },
  { id: "scrape",   label: "Web Scraper → Airtable",   badge: null,       desc: "Extract data and store in Airtable" },
];

const folders = ["/ Root", "/ Marketing", "/ Engineering", "/ Sales", "/ Operations"];
const tagPresets = ["production", "draft", "ai", "internal", "customer-facing", "monitoring"];

export function CreateWorkflowModal({ open, onClose }: CreateWorkflowModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState<string>("manual");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [folder, setFolder] = useState("/ Root");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const reset = () => { setName(""); setDescription(""); setTrigger("manual"); setStep(1); setFolder("/ Root"); setTags([]); setTagInput(""); };
  const handleClose = () => { reset(); onClose(); };

  const stepTitles = {
    1: "New Workflow",
    2: "Configure Trigger",
    3: "Organize",
  };
  const stepDescs = {
    1: "Give your workflow a name and choose a starting point.",
    2: "How should this workflow start?",
    3: "Add tags and choose a folder for organization.",
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={stepTitles[step]}
      description={stepDescs[step]}
      width="w-[520px]"
      footer={
        <div className="flex items-center gap-2 w-full">
          {/* Step indicator */}
          <div className="flex items-center gap-1 mr-auto">
            {[1, 2, 3].map((s) => (
              <div key={s} className={cn("h-1.5 rounded-full transition-all", s === step ? "w-6 bg-zinc-800" : s < step ? "w-3 bg-zinc-400" : "w-3 bg-zinc-200")} />
            ))}
          </div>
          {step > 1 && (
            <Button variant="ghost" size="sm" onClick={() => setStep((step - 1) as 1 | 2)}>
              Back
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleClose}>Cancel</Button>
          {step < 3 ? (
            <Button variant="primary" size="sm" disabled={step === 1 && !name.trim()} onClick={() => setStep((step + 1) as 2 | 3)}>
              Next
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleClose}>
              Create Workflow
            </Button>
          )}
        </div>
      }
    >
      {step === 1 ? (
        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">Workflow name</label>
            <Input
              placeholder="e.g., Lead Qualification Pipeline"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">Description <span className="text-zinc-300">(optional)</span></label>
            <textarea
              placeholder="What does this workflow do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-800/10 resize-none"
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-zinc-600 mb-2 block">Or start from a template</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setName(t.label); setDescription(t.desc); setStep(2); }}
                  className="flex flex-col items-start gap-1 rounded-lg border border-zinc-100 px-3 py-2.5 text-left hover:border-zinc-200 hover:bg-zinc-50 transition-all"
                >
                  <div className="flex items-center gap-2 w-full">
                    <GitBranch size={13} className="text-zinc-400 flex-shrink-0" />
                    <span className="text-[12px] text-zinc-700 font-medium flex-1 truncate">{t.label}</span>
                    {t.badge && <Badge variant={t.badge === "AI" ? "info" : "neutral"}>{t.badge}</Badge>}
                  </div>
                  <p className="text-[10px] text-zinc-400 pl-5 truncate w-full">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : step === 2 ? (
        <div className="space-y-2">
          {triggers.map((t) => (
            <button
              key={t.id}
              onClick={() => setTrigger(t.id)}
              className={cn(
                "flex items-center gap-3 w-full rounded-lg border px-4 py-3 text-left transition-all",
                trigger === t.id
                  ? "border-zinc-800 bg-zinc-50"
                  : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                trigger === t.id ? "bg-zinc-800 text-white" : "bg-zinc-100 text-zinc-500"
              )}>
                <t.icon size={15} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-zinc-800">{t.label}</p>
                <p className="text-[11px] text-zinc-400">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Folder picker */}
          <div>
            <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">Folder</label>
            <div className="relative">
              <button
                onClick={() => setShowFolderDropdown(p => !p)}
                className="flex items-center gap-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-left hover:bg-zinc-50 transition-colors"
              >
                <FolderOpen size={14} className="text-zinc-400" />
                <span className="flex-1 text-[13px] text-zinc-700">{folder}</span>
                <ChevronDown size={13} className="text-zinc-400" />
              </button>
              {showFolderDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-10 overflow-hidden">
                  {folders.map((f) => (
                    <button key={f} onClick={() => { setFolder(f); setShowFolderDropdown(false); }}
                      className={cn("w-full px-3 py-2 text-left text-[12px] hover:bg-zinc-50 transition-colors", f === folder ? "bg-zinc-50 text-zinc-800 font-medium" : "text-zinc-600")}
                    >{f}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">Tags</label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-zinc-200 px-2 py-2 min-h-[38px]">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600">
                  <Tag size={9} />
                  {tag}
                  <button onClick={() => setTags(tags.filter(t => t !== tag))} className="text-zinc-400 hover:text-zinc-600"><X size={10} /></button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } }}
                placeholder={tags.length ? "" : "Type and press Enter..."}
                className="flex-1 min-w-[80px] text-[12px] outline-none bg-transparent text-zinc-700 placeholder:text-zinc-300"
              />
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {tagPresets.filter(t => !tags.includes(t)).slice(0, 4).map((tag) => (
                <button key={tag} onClick={() => addTag(tag)}
                  className="flex items-center gap-1 rounded-full border border-zinc-100 px-2 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors"
                >
                  <Plus size={8} />{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-3 space-y-1">
            <p className="text-[11px] font-medium text-zinc-500">Summary</p>
            <p className="text-[12px] text-zinc-700 font-medium">{name || "Untitled"}</p>
            <p className="text-[11px] text-zinc-400">Trigger: <span className="text-zinc-600 capitalize">{trigger}</span> · Folder: <span className="text-zinc-600">{folder}</span></p>
            {tags.length > 0 && <p className="text-[11px] text-zinc-400">Tags: <span className="text-zinc-600">{tags.join(", ")}</span></p>}
          </div>
        </div>
      )}
    </Modal>
  );
}
