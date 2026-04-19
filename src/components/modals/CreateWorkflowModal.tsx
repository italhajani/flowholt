import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Zap, Clock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateWorkflowModalProps {
  open: boolean;
  onClose: () => void;
}

const triggers = [
  { id: "manual",   label: "Manual",   desc: "Run on demand",        icon: Zap },
  { id: "schedule", label: "Schedule", desc: "Cron / interval",      icon: Clock },
  { id: "webhook",  label: "Webhook",  desc: "HTTP trigger",         icon: Globe },
] as const;

const templates = [
  { id: "blank",    label: "Blank workflow",            badge: null },
  { id: "slack",    label: "Slack → Sheets Logger",     badge: "Popular" },
  { id: "lead",     label: "Lead Qualification (AI)",   badge: "AI" },
  { id: "report",   label: "Daily Report Generator",    badge: null },
];

export function CreateWorkflowModal({ open, onClose }: CreateWorkflowModalProps) {
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<string>("manual");
  const [step, setStep] = useState<1 | 2>(1);

  const reset = () => { setName(""); setTrigger("manual"); setStep(1); };
  const handleClose = () => { reset(); onClose(); };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step === 1 ? "New Workflow" : "Configure Trigger"}
      description={step === 1 ? "Give your workflow a name and choose a starting point." : "How should this workflow start?"}
      footer={
        <div className="flex items-center gap-2 w-full">
          {step === 2 && (
            <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="mr-auto">
              Back
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleClose}>Cancel</Button>
          {step === 1 ? (
            <Button variant="primary" size="sm" disabled={!name.trim()} onClick={() => setStep(2)}>
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
            <label className="text-[12px] font-medium text-zinc-600 mb-2 block">Or start from a template</label>
            <div className="space-y-1.5">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setName(t.label); setStep(2); }}
                  className="flex items-center gap-2.5 w-full rounded-lg border border-zinc-100 px-3 py-2.5 text-left hover:border-zinc-200 hover:bg-zinc-50 transition-all"
                >
                  <GitBranch size={14} className="text-zinc-400 flex-shrink-0" />
                  <span className="text-[13px] text-zinc-700 font-medium flex-1">{t.label}</span>
                  {t.badge && <Badge variant={t.badge === "AI" ? "info" : "neutral"}>{t.badge}</Badge>}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
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
      )}
    </Modal>
  );
}
